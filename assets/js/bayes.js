function clamp(value, min, max){ return Math.min(max, Math.max(min, value)); }
export function sigmoid(value){ return 1 / (1 + Math.exp(-value)); }

export function softmax(values){
  const max = Math.max(...values);
  const exp = values.map(value => Math.exp(value - max));
  const total = exp.reduce((sum, value) => sum + value, 0);
  return exp.map(value => value / total);
}

export function quantile(values, probability){
  if(!values.length) return Number.NaN;
  const sorted = [...values].sort((a,b) => a-b);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if(lower === upper) return sorted[lower];
  const weight = position - lower;
  return sorted[lower] * (1-weight) + sorted[upper] * weight;
}

export function mean(values){
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function activeFeatureNames(profile, model){
  const active = new Set();
  const supported = new Set(model.data?.supported_fields || []);
  const fieldSpec = model.field_spec || {};

  for(const field of supported){
    const value = profile[field];
    if(value !== undefined && value !== fieldSpec[field]?.reference){
      active.add(`${field}=${value}`);
    }
  }

  for(const interaction of model.interactions || []){
    const fields = interaction.fields;
    if(!fields.every(field => supported.has(field))) continue;
    const values = fields.map(field => profile[field]);
    if(values.some((value, index) => value === undefined || value === fieldSpec[fields[index]]?.reference)) continue;
    active.add(fields.map((field,index) => `${field}=${values[index]}`).join("&"));
  }
  return active;
}

export function encodeProfile(profile, model){
  const active = activeFeatureNames(profile, model);
  return (model.feature_names || []).map(name => active.has(name) ? 1 : 0);
}

function linearPredictor(intercept, coefficients, vector){
  let value = intercept;
  for(let i=0; i<vector.length; i++) if(vector[i]) value += coefficients[i];
  return value;
}

function summarizeDraws(draws, interval=0.80){
  const tail = (1 - interval) / 2;
  return {
    mean: mean(draws),
    lower: quantile(draws, tail),
    upper: quantile(draws, 1-tail)
  };
}

export function predictProfile(profile, model){
  if(!["trained", "demo"].includes(model.status)){
    throw new Error("No trained posterior is available.");
  }
  const vector = encodeProfile(profile, model);
  const partyOrder = model.party_order;
  const drawCount = Math.min(
    model.parliament.intercepts.length,
    model.turnout.intercepts.length,
    model.runoff.intercepts.length
  );
  const interval = model.model?.display_interval || 0.80;
  const partyDraws = Object.fromEntries(partyOrder.map(party => [party, []]));
  const turnoutDraws = [];
  const erdoganDraws = [];
  const kilicdarogluDraws = [];

  for(let draw=0; draw<drawCount; draw++){
    const partyEta = [];
    for(let k=0; k<partyOrder.length-1; k++){
      let eta = model.parliament.intercepts[draw][k];
      for(let p=0; p<vector.length; p++) if(vector[p]) eta += model.parliament.coefficients[draw][p][k];
      partyEta.push(eta);
    }
    partyEta.push(0);
    const partyProbability = softmax(partyEta);
    partyOrder.forEach((party,index) => partyDraws[party].push(partyProbability[index]));

    turnoutDraws.push(sigmoid(linearPredictor(
      model.turnout.intercepts[draw], model.turnout.coefficients[draw], vector
    )));
    const erdogan = sigmoid(linearPredictor(
      model.runoff.intercepts[draw], model.runoff.coefficients[draw], vector
    ));
    erdoganDraws.push(erdogan);
    kilicdarogluDraws.push(1-erdogan);
  }

  const parliament = Object.fromEntries(
    partyOrder.map(party => [party, summarizeDraws(partyDraws[party], interval)])
  );
  const turnout = summarizeDraws(turnoutDraws, interval);
  const runoff = {
    ERDOGAN: summarizeDraws(erdoganDraws, interval),
    KILICDAROGLU: summarizeDraws(kilicdarogluDraws, interval)
  };
  return {parliament, turnout, runoff, vector, drawCount, interval};
}

export function supportForProfile(profile, model){
  const support = model.support || {};
  const counts = [];
  for(const field of model.data?.supported_fields || []){
    const key = `${field}=${profile[field]}`;
    if(Number.isFinite(support.margins?.[key])) counts.push({key, count:support.margins[key], dimensions:1});
  }
  for(const [key,count] of Object.entries(support.cells || {})){
    const tokens = key.split("&");
    const matches = tokens.every(token => {
      const [field, ...rest] = token.split("=");
      return String(profile[field]) === rest.join("=");
    });
    if(matches && Number.isFinite(count)) counts.push({key, count, dimensions:tokens.length});
  }
  counts.sort((a,b) => b.dimensions-a.dimensions || a.count-b.count);
  const informative = counts.filter(item => item.dimensions >= 2);
  const minimum = (informative.length ? informative : counts).reduce(
    (best,item) => item.count < best.count ? item : best,
    {key:"", count:Number.POSITIVE_INFINITY, dimensions:0}
  );
  if(!Number.isFinite(minimum.count)) return {label:"bilinmiyor", level:"unknown", count:null, key:null};
  const weightedN = support.weighted_n || 1;
  const share = minimum.count / weightedN;
  let level = "weak", label = "zayıf";
  if(minimum.count >= 80 && share >= .03){ level="strong"; label="güçlü"; }
  else if(minimum.count >= 30 && share >= .01){ level="moderate"; label="orta"; }
  return {label, level, count:minimum.count, key:minimum.key};
}

export function rankedDrivers(profile, model, prediction, limit=5){
  const active = activeFeatureNames(profile, model);
  const winner = Object.entries(prediction.parliament).sort((a,b) => b[1].mean-a[1].mean)[0][0];
  const winnerIndex = model.party_order.indexOf(winner);
  const candidates = [];
  for(let p=0; p<model.feature_names.length; p++){
    const name = model.feature_names[p];
    if(!active.has(name)) continue;
    const values = [];
    for(let draw=0; draw<model.parliament.coefficients.length; draw++){
      if(winnerIndex === model.party_order.length-1){
        const otherCoefficients = model.parliament.coefficients[draw][p];
        values.push(-mean(otherCoefficients));
      }else{
        values.push(model.parliament.coefficients[draw][p][winnerIndex]);
      }
    }
    const avg = mean(values);
    candidates.push({name, mean:avg, magnitude:mean(values.map(Math.abs))});
  }
  return candidates.sort((a,b) => b.magnitude-a.magnitude).slice(0,limit);
}

export function validateModelShape(model){
  if(!model || typeof model !== "object") throw new Error("Model JSON is missing.");
  if(!["untrained","trained","demo"].includes(model.status)) throw new Error("Unknown model status.");
  if(model.status === "untrained") return true;
  const P = model.feature_names.length;
  const K = model.party_order.length;
  const D = model.parliament.intercepts.length;
  if(!D) throw new Error("No posterior draws.");
  if(model.parliament.intercepts.some(row => row.length !== K-1)) throw new Error("Bad parliamentary intercept shape.");
  if(model.parliament.coefficients.some(draw => draw.length !== P || draw.some(row => row.length !== K-1))) throw new Error("Bad parliamentary coefficient shape.");
  if(model.turnout.intercepts.length !== D || model.runoff.intercepts.length !== D) throw new Error("Models use different draw counts.");
  return true;
}

export function profileIsExtrapolative(support){
  return support.level === "weak" || support.level === "unknown";
}

export function credibleIntervalText(summary, formatter){
  return `${formatter(summary.lower)}–${formatter(summary.upper)}`;
}

export function safePercent(value){ return clamp(value,0,1); }
