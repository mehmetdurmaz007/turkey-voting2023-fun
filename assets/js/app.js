import {FIELDS, FIELD_LABELS, PARTY_META, SHARE_URL} from "./config.js?v=bayes-4";
import {predictProfile, supportForProfile, rankedDrivers, validateModelShape, credibleIntervalText} from "./bayes.js?v=bayes-2";

let MODEL = null;
let LAST = null;
const $ = id => document.getElementById(id);
const pct = (value, digits=0) => `${(value*100).toFixed(digits).replace(".",",")}%`;

function weightedPick(items){
  const total=items.reduce((sum,item)=>sum+item[1],0); let n=Math.random()*total;
  for(const [value,weight] of items){ n-=weight; if(n<=0) return value; }
  return items.at(-1)[0];
}

function fallbackProfile(){
  const p={};
  p.gender=weightedPick([["woman",.56],["man",.44]]);
  p.age=weightedPick([["18-24",.15],["25-34",.23],["35-44",.23],["45-54",.18],["55-64",.12],["65+",.09]]);
  const edu={
    "18-24":[["primary",.10],["middle",.10],["high",.50],["college",.29],["postgrad",.01]],
    "25-34":[["primary",.16],["middle",.11],["high",.34],["college",.35],["postgrad",.04]],
    "35-44":[["primary",.27],["middle",.15],["high",.34],["college",.21],["postgrad",.03]],
    "45-54":[["primary",.38],["middle",.16],["high",.31],["college",.13],["postgrad",.02]],
    "55-64":[["primary",.48],["middle",.17],["high",.25],["college",.09],["postgrad",.01]],
    "65+":[["primary",.60],["middle",.16],["high",.17],["college",.06],["postgrad",.01]]
  };
  p.education=weightedPick(edu[p.age]);
  if(p.age==="18-24") p.employment=weightedPick([["student",.55],["employed",.24],["unemployed",.08],["homemaker",.05],["other",.08]]);
  else if(p.age==="65+") p.employment=weightedPick([["retired",.45],["homemaker",.32],["employed",.08],["other",.15]]);
  else p.employment=weightedPick([["employed",.48],["homemaker",.27],["student",.04],["unemployed",.03],["retired",.03],["other",.15]]);
  p.occupation=p.employment==="employed"?weightedPick([["professional",.20],["service",.36],["agriculture",.07],["skilled_manual",.16],["elementary_manual",.14],["unavailable",.07]]):"unavailable";
  p.income=weightedPick([["q1",.14],["q2",.19],["q3",.17],["q4",.18],["q5",.18],["unknown",.14]]);
  p.region=weightedPick([["istanbul",.19],["west_marmara",.06],["aegean",.14],["east_marmara",.12],["west_anatolia",.11],["mediterranean",.10],["central_anatolia",.05],["west_blacksea",.06],["east_blacksea",.03],["northeast",.03],["centraleast",.05],["southeast",.09]]);
  p.settlement=weightedPick([["rural",.12],["town",.08],["suburb",.18],["city",.62]]);
  p.marital=p.age==="18-24"?weightedPick([["single",.88],["married",.11],["divorced",.01]]):weightedPick([["married",.69],["single",.20],["divorced",.04],["widowed",.07]]);
  p.household_size=weightedPick([["one",.06],["two",.17],["three",.21],["four",.29],["fiveplus",.24],["unknown",.03]]);
  p.home_language=p.region==="southeast"?weightedPick([["turkish",.63],["kurdish",.34],["arabic_other",.02],["unknown",.01]]):weightedPick([["turkish",.96],["kurdish",.03],["arabic_other",.005],["unknown",.005]]);
  p.attendance=weightedPick([["never",.13],["yearly",.07],["several_year",.12],["monthly",.04],["weekly",.60],["unknown",.04]]);
  return p;
}

function populate(){
  for(const [field,options] of Object.entries(FIELDS)){
    const select=$(field); select.innerHTML="";
    for(const [value,label] of options){ const option=document.createElement("option"); option.value=value; option.textContent=label; select.append(option); }
    select.addEventListener("change",()=>{syncSelections(field);render();});
  }
}

function currentProfile(){ return Object.fromEntries(Object.keys(FIELDS).map(field=>[field,$(field).value])); }
function setProfile(profile){ for(const field of Object.keys(FIELDS)){ if(profile[field] && [...$(field).options].some(o=>o.value===profile[field])) $(field).value=profile[field]; } syncSelections(); }

function syncSelections(changedField=null){
  const working=$('employment').value==="employed";
  const occupation=$('occupation');
  if(!working){ occupation.value="unavailable"; occupation.disabled=true; }
  else {
    occupation.disabled=false;
    if(changedField==="employment" && occupation.value==="unavailable") occupation.value="service";
  }
}

function randomize(){
  let profile;
  if(MODEL?.random_profiles?.length){
    profile={...fallbackProfile(),...MODEL.random_profiles[Math.floor(Math.random()*MODEL.random_profiles.length)]};
  }else profile=fallbackProfile();
  setProfile(profile); render();
}

function setModelSupport(){
  const supported=new Set(MODEL?.data?.supported_fields || []);
  for(const field of Object.keys(FIELDS)){
    const select=$(field); const wrapper=select.closest(".inline-select");
    const shouldDisable=MODEL?.status==="trained" && !supported.has(field);
    if(shouldDisable) select.disabled=true;
    wrapper?.classList.toggle("disabled-field",shouldDisable);
    if(shouldDisable) select.title="Bu değişken eğitilmiş modelde bulunmuyor ve öngörüyü değiştirmez.";
  }
  syncSelections();
}

function fieldTokenText(token){
  return token.split("&").map(piece=>{
    const index=piece.indexOf("="); const field=piece.slice(0,index); const value=piece.slice(index+1);
    return FIELD_LABELS[field]?.[value] || value;
  }).join(" × ");
}

function showUntrained(){
  $("headline").innerHTML="Model eğitilmedi <small>posterior dosyası yok</small>";
  $("confidenceBox").innerHTML="<strong>Bilimsel olarak doğru davranış</strong>Bu depo, mikroveri sağlanmadan uydurma yüzdeler göstermiyor.";
  $("stackedBar").innerHTML=""; $("legend").innerHTML=""; $("partyRows").innerHTML='<div class="untrained-overlay">CSES mikroverisini yerel olarak hazırlayıp Stan modellerini çalıştırın. Ardından <code>model/export_model.py</code>, resmî sonuçlara çekiliş bazında kalibre edilmiş posterior dosyasını üretir. Arayüzü sentetik verilerle denemek için URL’ye <code>?demo=1</code> ekleyebilirsiniz.</div>';
  $("driverChips").innerHTML='<span class="chip">Henüz tahmin edilmiş katsayı yok.</span>';
  $("turnoutNumber").textContent="—"; $("turnoutGauge").style.width="0"; $("turnoutSub").textContent="Katılım modeli eğitilmedi.";
  $("erdoganSeg").style.width="50%"; $("kilicdarogluSeg").style.width="50%"; $("erdoganValue").textContent="Erdoğan —"; $("kilicdarogluValue").textContent="Kılıçdaroğlu —"; $("runoffHeadline").textContent="—";
  $("supportBox").className="support-box support-unknown"; $("supportBox").innerHTML="<strong>Örneklem desteği bilinmiyor</strong>İşlenmiş mikroveri yok.";
  LAST=null;
}

function render(){
  if(!MODEL || MODEL.status==="untrained"){ showUntrained(); return; }
  const profile=currentProfile(); const result=predictProfile(profile,MODEL); const support=supportForProfile(profile,MODEL);
  const entries=Object.entries(result.parliament).sort((a,b)=>b[1].mean-a[1].mean); const [winner,winnerSummary]=entries[0];
  $("headline").innerHTML=`${pct(winnerSummary.mean)} <small>${PARTY_META[winner].label} posterior ortalaması</small>`;
  $("confidenceBox").innerHTML=`<strong>${pct(winnerSummary.lower)}–${pct(winnerSummary.upper)}</strong>%${Math.round(result.interval*100)} güvenilir aralık · ${result.drawCount} posterior çekilişi`;
  $("intervalBadge").textContent=`%${Math.round(result.interval*100)} güvenilir aralık`;
  $("stackedBar").innerHTML=""; $("legend").innerHTML="";
  for(const [party,summary] of entries){ const seg=document.createElement("div"); seg.className="segment"; seg.style.width=`${summary.mean*100}%`; seg.style.background=PARTY_META[party].color; seg.dataset.label=`${PARTY_META[party].label}: ${pct(summary.mean,1)}`; $("stackedBar").append(seg); }
  for(const [party,summary] of entries.slice(0,7)){ const item=document.createElement("span"); item.className="legend-item"; item.innerHTML=`<span class="swatch" style="background:${PARTY_META[party].color}"></span>${PARTY_META[party].label} ${pct(summary.mean)}`; $("legend").append(item); }
  $("partyRows").innerHTML="";
  for(const [party,summary] of entries){ const row=document.createElement("div"); row.className="party-row"; row.innerHTML=`<div class="party-name">${PARTY_META[party].label}</div><div class="bar-track"><div class="bar-fill" style="width:${summary.mean*100}%;background:${PARTY_META[party].color}"></div></div><div><div class="party-value">${pct(summary.mean)}</div><div class="party-range">${credibleIntervalText(summary,v=>pct(v))}</div></div>`; $("partyRows").append(row); }
  $("turnoutNumber").textContent=pct(result.turnout.mean); $("turnoutGauge").style.width=`${result.turnout.mean*100}%`; $("turnoutSub").textContent=`%${Math.round(result.interval*100)} aralık: ${pct(result.turnout.lower)}–${pct(result.turnout.upper)}.`;
  $("erdoganSeg").style.width=`${result.runoff.ERDOGAN.mean*100}%`; $("kilicdarogluSeg").style.width=`${result.runoff.KILICDAROGLU.mean*100}%`; $("erdoganValue").textContent=`Erdoğan ${pct(result.runoff.ERDOGAN.mean)}`; $("kilicdarogluValue").textContent=`Kılıçdaroğlu ${pct(result.runoff.KILICDAROGLU.mean)}`; $("runoffHeadline").textContent=result.runoff.ERDOGAN.mean>result.runoff.KILICDAROGLU.mean?"Erdoğan":"Kılıçdaroğlu";
  $("supportBox").className=`support-box support-${support.level}`; $("supportBox").innerHTML=`<strong>Örneklem desteği: ${support.label}</strong>${support.count===null?"Uygun destek hücresi yok.":`En dar izlenen kesişimde ağırlıklı yaklaşık ${Math.round(support.count)} gözlem desteği.`}`;
  $("driverChips").innerHTML=""; const drivers=rankedDrivers(profile,MODEL,result);
  for(const driver of drivers){ const chip=document.createElement("span"); chip.className="chip"; chip.innerHTML=`<strong>${driver.mean>=0?"↑":"↓"} ${PARTY_META[winner].label}</strong> · ${fieldTokenText(driver.name)}`; $("driverChips").append(chip); }
  if(!drivers.length) $("driverChips").innerHTML='<span class="chip">Seçili profil çoğunlukla referans kategorilerinde.</span>';
  LAST={profile,result,winner,winnerSummary,support};
}

function modelStatusText(){
  if(MODEL.status==="trained") return `<strong>Eğitilmiş ve ulusal sonuçlara kalibre edilmiş posterior model.</strong> ${MODEL.data?.n?.parliament || "—"} geçerli parlamento oyu; ${MODEL.model?.posterior_draws || "—"} dışa aktarılmış çekiliş.`;
  if(MODEL.status==="demo") return "<strong>Sentetik geliştirme modu.</strong> Bu yüzdeler gerçek anketten tahmin edilmedi; yalnız arayüz ve test içindir.";
  return "<strong>Model eğitilmedi.</strong> Depo uydurma olasılık göstermiyor; mikroveri ve posterior dışa aktarımı gerekli.";
}

function updateStatusUI(){
  const notice=$("modelNotice"); notice.className=`notice ${MODEL.status==="trained"?"good":MODEL.status==="demo"?"demo":"bad"}`; notice.innerHTML=`<div>${modelStatusText()}</div>`;
  $("modelNote").innerHTML=`<strong>Model durumu:</strong> ${modelStatusText().replace(/<strong>|<\/strong>/g,"")}`;
  $("methodStatus").innerHTML=modelStatusText();
}

function shareText(){
  if(!LAST) return `2023 seçimleri için Bayesçi seçmen modeli henüz yayımlanmış bir posterior içermiyor. Sen de incele: ${SHARE_URL}`;
  const s=LAST.winnerSummary;
  return `2023 seçimlerinde profilim Bayesçi modelde şöyle çıktı: ${PARTY_META[LAST.winner].label} ${pct(s.mean)} (%80 aralık: ${pct(s.lower)}–${pct(s.upper)}). Sen de doldur: ${SHARE_URL}`;
}

async function loadModel(){
  const demo=new URLSearchParams(location.search).get("demo")==="1";
  const url=demo?"public/model/demo-model.json":"public/model/model.json";
  const response=await fetch(`${url}?v=bayes-2`,{cache:"no-store"}); if(!response.ok) throw new Error(`Model dosyası yüklenemedi: ${response.status}`);
  MODEL=await response.json(); validateModelShape(MODEL); setModelSupport(); updateStatusUI(); randomize();
}

populate();
$("randomizeBtn").addEventListener("click",randomize);
$("methodBtn").addEventListener("click",()=>$("methodDialog").showModal());
$("closeMethod").addEventListener("click",()=>$("methodDialog").close());
$("methodDialog").addEventListener("click",event=>{ if(event.target===$("methodDialog")) $("methodDialog").close(); });
$("copyBtn").addEventListener("click",async()=>{ await navigator.clipboard.writeText(shareText()); const old=$("copyBtn").textContent; $("copyBtn").textContent="kopyalandı"; setTimeout(()=>$("copyBtn").textContent=old,1200); });
$("shareXBtn").addEventListener("click",()=>{ const url=`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}`; window.open(url,"_blank","noopener,noreferrer,width=720,height=620"); });

loadModel().catch(error=>{
  MODEL={status:"untrained",data:{supported_fields:[]}}; setModelSupport(); updateStatusUI(); showUntrained(); console.error(error);
});
