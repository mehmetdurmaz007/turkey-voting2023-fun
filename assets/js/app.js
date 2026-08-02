(() => {
  const PARTY_META = {
    AKP:{label:"AK Parti", color:"#ef8c24"},
    CHP:{label:"CHP", color:"#cf252d"},
    MHP:{label:"MHP", color:"#8f1721"},
    IYI:{label:"İYİ Parti", color:"#38a7d6"},
    YSP:{label:"YSP", color:"#67a846"},
    TIP:{label:"TİP", color:"#7c285f"},
    YRP:{label:"Yeniden Refah", color:"#681e38"},
    ZAFER:{label:"Zafer", color:"#39a6a8"},
    OTHER:{label:"Diğer", color:"#a9b2b6"},
    ABSTAIN:{label:"Sandığa gitmeme", color:"#59686f"}
  };
  const PARTY_KEYS = ["AKP","CHP","MHP","IYI","YSP","TIP","YRP","ZAFER","OTHER"];
  const BASELINE = {
    AKP:.3562, CHP:.2535, MHP:.1007, IYI:.0969, YSP:.0882,
    TIP:.0176, YRP:.0280, ZAFER:.0223, OTHER:.0366
  };

  const FIELDS = {
    gender:[
      ["woman","kadın"],["man","erkek"]
    ],
    age:[
      ["18-24","18–24"],["25-34","25–34"],["35-44","35–44"],["45-54","45–54"],["55-64","55–64"],["65+","65 ve üzeri"]
    ],
    education:[
      ["primary","ilkokul veya altı"],["middle","ortaokul"],["high","lise"],["college","üniversite"],["postgrad","lisansüstü"]
    ],
    employment:[
      ["student","öğrenci"],["private","özel sektörde çalışan"],["public","kamuda çalışan"],["self","kendi hesabına çalışan"],["unemployed","işsiz"],["homemaker","ev içi emek veren"],["retired","emekli"],["farmer","çiftçi / tarım çalışanı"]
    ],
    income:[
      ["q1","en düşük gelir beşte birinde"],["q2","alt-orta gelir beşte birinde"],["q3","orta gelir beşte birinde"],["q4","üst-orta gelir beşte birinde"],["q5","en yüksek gelir beşte birinde"]
    ],
    settlement:[
      ["metro","bir büyükşehrin merkezinde"],["urban","bir il veya ilçe merkezinde"],["town","küçük bir kentte"],["rural","kırsal bir yerleşimde"]
    ],
    region:[
      ["istanbul","İstanbul"],["west_marmara","Batı Marmara"],["aegean","Ege"],["east_marmara","Doğu Marmara"],["west_anatolia","Batı Anadolu"],["mediterranean","Akdeniz"],["central_anatolia","Orta Anadolu"],["west_blacksea","Batı Karadeniz"],["east_blacksea","Doğu Karadeniz"],["northeast","Kuzeydoğu Anadolu"],["centraleast","Ortadoğu Anadolu"],["southeast","Güneydoğu Anadolu"]
    ],
    marital:[
      ["single","bekâr"],["married","evli"],["divorced","boşanmış / ayrı"],["widowed","dul"]
    ],
    children:[
      ["none","çocuğu yok"],["one","bir çocuğu var"],["two","iki çocuğu var"],["threeplus","üç veya daha fazla çocuğu var"]
    ],
    ethnicity:[
      ["turkish","Türk"],["kurdish","Kürt"],["zaza","Zaza"],["arab","Arap"],["other","başka bir kimlik"],["noanswer","belirtmemeyi tercih eden"]
    ],
    denomination:[
      ["sunni","Sünni Müslüman"],["alevi","Alevi"],["othermuslim","başka bir Müslüman geleneğe mensup"],["nonreligious","dinsiz / inançsız"],["nonmuslim","Müslüman olmayan"],["noanswer","belirtmemeyi tercih eden"]
    ],
    religiosity:[
      ["very","çok dindar ve düzenli ibadet eden"],["religious","dindar ve zaman zaman ibadet eden"],["somewhat","kendini bir ölçüde dindar gören"],["rarely","nadiren ibadet eden"],["never","hiç ibadet etmeyen"],["noanswer","bu konuda cevap vermeyen"]
    ]
  };

  // Log-odds adjustments. Deliberately restrained; this is a transparent prototype, not fitted microdata.
  const EFFECTS = {
    gender:{
      woman:{AKP:.08,CHP:.03,MHP:-.13,IYI:.02,YSP:.02,TIP:.05,YRP:-.02,ZAFER:-.12},
      man:{MHP:.10,ZAFER:.10,YRP:.04,CHP:-.02}
    },
    age:{
      "18-24":{AKP:-.36,CHP:.14,MHP:-.08,IYI:.05,YSP:.08,TIP:.52,YRP:.04,ZAFER:.48,OTHER:.08},
      "25-34":{AKP:-.25,CHP:.12,MHP:-.04,IYI:.06,YSP:.07,TIP:.34,YRP:.02,ZAFER:.28},
      "35-44":{},
      "45-54":{AKP:.12,CHP:-.04,MHP:.06,TIP:-.18,ZAFER:-.18},
      "55-64":{AKP:.25,CHP:.05,MHP:.09,IYI:-.05,TIP:-.33,ZAFER:-.34},
      "65+":{AKP:.34,CHP:.07,MHP:.04,IYI:-.07,YSP:-.08,TIP:-.48,YRP:.04,ZAFER:-.50}
    },
    education:{
      primary:{AKP:.34,CHP:-.17,MHP:.04,IYI:-.08,YSP:.05,TIP:-.42,YRP:.12,ZAFER:-.27},
      middle:{AKP:.18,CHP:-.10,MHP:.10,IYI:-.03,TIP:-.25,YRP:.10,ZAFER:-.12},
      high:{},
      college:{AKP:-.28,CHP:.25,MHP:-.10,IYI:.10,YSP:.03,TIP:.34,YRP:-.20,ZAFER:.05},
      postgrad:{AKP:-.42,CHP:.35,MHP:-.17,IYI:.10,YSP:.06,TIP:.55,YRP:-.30,ZAFER:.02}
    },
    employment:{
      student:{AKP:-.28,CHP:.14,MHP:-.07,IYI:.03,YSP:.08,TIP:.36,YRP:-.05,ZAFER:.27},
      private:{},
      public:{AKP:.05,CHP:.09,MHP:.04,IYI:.02,TIP:-.05},
      self:{AKP:.16,CHP:-.06,MHP:.11,IYI:.02,YRP:.07},
      unemployed:{AKP:-.12,CHP:.06,YSP:.08,TIP:.18,YRP:.06,ZAFER:.20,OTHER:.05},
      homemaker:{AKP:.27,CHP:-.12,MHP:-.03,YRP:.14,ZAFER:-.10,TIP:-.18},
      retired:{AKP:.10,CHP:.10,MHP:.05,IYI:-.02,TIP:-.20,ZAFER:-.20},
      farmer:{AKP:.31,CHP:-.17,MHP:.15,IYI:-.03,YRP:.09,TIP:-.25,ZAFER:-.10}
    },
    income:{
      q1:{AKP:.04,CHP:.04,YSP:.17,TIP:.10,YRP:.10,IYI:-.08},
      q2:{AKP:.05,YSP:.08,YRP:.05},
      q3:{},
      q4:{AKP:-.07,CHP:.10,IYI:.08,TIP:.08,YRP:-.10},
      q5:{AKP:-.13,CHP:.20,IYI:.11,TIP:.17,YSP:-.05,YRP:-.22,MHP:-.04}
    },
    settlement:{
      metro:{AKP:-.11,CHP:.15,MHP:-.06,IYI:.03,YSP:.04,TIP:.18,YRP:-.08,ZAFER:.04},
      urban:{CHP:.05,TIP:.04},
      town:{AKP:.10,MHP:.07,CHP:-.07,TIP:-.10},
      rural:{AKP:.33,CHP:-.21,MHP:.12,IYI:-.06,YSP:.05,TIP:-.29,YRP:.12,ZAFER:-.13}
    },
    region:{
      istanbul:{AKP:-.10,CHP:.15,MHP:-.08,IYI:.02,YSP:.05,TIP:.22,YRP:-.08,ZAFER:.06},
      west_marmara:{AKP:-.08,CHP:.11,MHP:.09,IYI:.18,YSP:-.22,TIP:.02,ZAFER:.05},
      aegean:{AKP:-.26,CHP:.31,MHP:-.03,IYI:.17,YSP:-.11,TIP:.12,YRP:-.18,ZAFER:.03},
      east_marmara:{AKP:.11,CHP:.01,MHP:.06,IYI:.01,YSP:-.15,TIP:-.05,YRP:.03},
      west_anatolia:{AKP:.08,CHP:.07,MHP:.06,IYI:.02,YSP:-.21,TIP:.02,YRP:.03},
      mediterranean:{AKP:-.05,CHP:.11,MHP:.12,IYI:.03,YSP:.06,TIP:.06,ZAFER:.07},
      central_anatolia:{AKP:.34,CHP:-.25,MHP:.20,IYI:-.04,YSP:-.36,TIP:-.22,YRP:.14,ZAFER:-.03},
      west_blacksea:{AKP:.25,CHP:-.12,MHP:.15,IYI:.00,YSP:-.30,TIP:-.20,YRP:.07},
      east_blacksea:{AKP:.42,CHP:-.31,MHP:.10,IYI:-.09,YSP:-.34,TIP:-.25,YRP:.09},
      northeast:{AKP:.22,CHP:-.16,MHP:.25,IYI:-.08,YSP:.09,TIP:-.17,YRP:.07},
      centraleast:{AKP:.06,CHP:-.16,MHP:-.10,IYI:-.14,YSP:.43,TIP:.01,YRP:.02,ZAFER:-.24},
      southeast:{AKP:.14,CHP:-.34,MHP:-.46,IYI:-.40,YSP:.92,TIP:.08,YRP:.05,ZAFER:-.48}
    },
    marital:{
      single:{AKP:-.07,CHP:.05,MHP:-.03,TIP:.15,ZAFER:.12},
      married:{AKP:.11,CHP:-.03,MHP:.05,TIP:-.10,ZAFER:-.10,YRP:.04},
      divorced:{CHP:.12,TIP:.12,AKP:-.12,MHP:-.05},
      widowed:{AKP:.14,CHP:.05,MHP:.02,TIP:-.18,ZAFER:-.18}
    },
    children:{
      // Parenthood is not assigned a large unconditional political effect.
      // Its direction is determined mainly by marital status and religiosity below.
      none:{TIP:.03,ZAFER:.02},
      one:{},
      two:{AKP:.02,MHP:.01,TIP:-.01},
      threeplus:{AKP:.04,YRP:.04,TIP:-.04,ZAFER:-.02}
    },
    ethnicity:{
      turkish:{},
      kurdish:{AKP:.08,CHP:-.18,MHP:-1.12,IYI:-.82,YSP:1.66,TIP:.20,YRP:-.10,ZAFER:-1.24},
      zaza:{AKP:.18,CHP:-.10,MHP:-.52,IYI:-.43,YSP:.87,TIP:.07,YRP:.02,ZAFER:-.58},
      arab:{AKP:.15,CHP:.04,MHP:-.10,IYI:-.07,YSP:.18,TIP:.02,YRP:.06,ZAFER:-.12},
      other:{AKP:-.10,CHP:.16,MHP:-.08,IYI:.02,YSP:.08,TIP:.13,ZAFER:-.05},
      noanswer:{}
    },
    denomination:{
      sunni:{},
      alevi:{AKP:-1.48,CHP:1.40,MHP:-.53,IYI:.03,YSP:.20,TIP:.43,YRP:-1.12,ZAFER:-.18},
      othermuslim:{AKP:.08,CHP:-.04,MHP:-.06,YSP:.22,YRP:.08},
      nonreligious:{AKP:-1.58,CHP:.72,MHP:-.52,IYI:.08,YSP:.10,TIP:.94,YRP:-1.46,ZAFER:.16},
      nonmuslim:{AKP:-.73,CHP:.61,MHP:-.42,IYI:.04,YSP:.13,TIP:.42,YRP:-.74,ZAFER:-.10},
      noanswer:{}
    },
    religiosity:{
      very:{AKP:.88,CHP:-.78,MHP:.08,IYI:-.20,YSP:-.18,TIP:-1.00,YRP:.82,ZAFER:-.31},
      religious:{AKP:.45,CHP:-.35,MHP:.07,IYI:-.08,YSP:-.08,TIP:-.53,YRP:.36,ZAFER:-.15},
      somewhat:{AKP:.10,CHP:-.04,YRP:.05,TIP:-.08},
      rarely:{AKP:-.43,CHP:.34,MHP:-.15,IYI:.06,YSP:.05,TIP:.42,YRP:-.58,ZAFER:.05},
      never:{AKP:-.82,CHP:.50,MHP:-.29,IYI:.06,YSP:.09,TIP:.62,YRP:-.91,ZAFER:.10},
      noanswer:{}
    }
  };

  const FIELD_LABELS = Object.fromEntries(Object.entries(FIELDS).map(([k,arr]) => [k,Object.fromEntries(arr)]));

  function addEffect(scores, effect, weight=1){
    if(!effect) return;
    for(const [party,val] of Object.entries(effect)) if(scores[party] !== undefined) scores[party] += val*weight;
  }
  function softmax(scores, temperature=1.28){
    const vals = PARTY_KEYS.map(k => scores[k]/temperature);
    const max = Math.max(...vals);
    const exps = vals.map(v => Math.exp(v-max));
    const sum = exps.reduce((a,b)=>a+b,0);
    return Object.fromEntries(PARTY_KEYS.map((k,i)=>[k,exps[i]/sum]));
  }
  function logistic(x){return 1/(1+Math.exp(-x))}
  function logit(p){return Math.log(p/(1-p))}
  function clamp(x,min,max){return Math.min(max,Math.max(min,x))}

  function currentProfile(){
    return Object.fromEntries(Object.keys(FIELDS).map(k=>[k,document.getElementById(k).value]));
  }

  // "Religiosity" does not mean the same political cleavage in every denomination.
  // The original prototype applied Sunni-pattern coefficients to everyone, which
  // double-counted secular/Alevi effects and produced implausible combinations.
  function fieldEffect(field,p){
    const base=EFFECTS[field]?.[p[field]];
    if(field!=="religiosity" || !base) return base;
    if(["sunni","othermuslim"].includes(p.denomination)) return base;
    if(p.denomination==="alevi"){
      const map={
        very:{CHP:.06,TIP:.03}, religious:{CHP:.04,TIP:.02}, somewhat:{},
        rarely:{AKP:-.04,CHP:.04,TIP:.04,YRP:-.05},
        never:{AKP:-.07,CHP:.06,TIP:.07,YRP:-.08}, noanswer:{}
      };
      return map[p.religiosity]||{};
    }
    if(p.denomination==="nonreligious"){
      const map={
        rarely:{AKP:-.10,CHP:.05,TIP:.08,YRP:-.12},
        never:{AKP:-.16,CHP:.08,TIP:.12,YRP:-.18}, noanswer:{}
      };
      return map[p.religiosity]||{};
    }
    if(p.denomination==="nonmuslim"){
      const map={
        very:{CHP:.02}, religious:{CHP:.02}, somewhat:{},
        rarely:{AKP:-.03,CHP:.03,TIP:.02,YRP:-.04},
        never:{AKP:-.05,CHP:.04,TIP:.04,YRP:-.06}, noanswer:{}
      };
      return map[p.religiosity]||{};
    }
    if(p.denomination==="noanswer"){
      return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,v*.35]));
    }
    return base;
  }

  function applyInteractions(scores,p,drivers){
    const hit=(label, effect, strength=1)=>{addEffect(scores,effect,strength);drivers.push({label,effect,strength})};
    const hasChildren=p.children!=="none";
    const manyChildren=["two","threeplus"].includes(p.children);
    const highRel=["very","religious"].includes(p.religiosity);
    const lowRel=["rarely","never"].includes(p.religiosity);
    const muslimTradition=["sunni","othermuslim"].includes(p.denomination);

    // Identity and geography.
    if(["kurdish","zaza"].includes(p.ethnicity) && ["southeast","centraleast"].includes(p.region))
      hit("Kürt/Zaza kimliği × doğu-güneydoğu",{YSP:.48,AKP:-.05,MHP:-.18,IYI:-.14,ZAFER:-.20});
    if(["kurdish","zaza"].includes(p.ethnicity) && highRel && muslimTradition)
      hit("Kürt/Zaza kimliği × Müslüman dindarlığı",{AKP:.20,YSP:-.09,YRP:.04});
    if(["kurdish","zaza"].includes(p.ethnicity) && p.denomination==="alevi")
      hit("Kürt/Zaza kimliği × Alevilik",{YSP:.18,CHP:.10,TIP:.06,AKP:-.18,MHP:-.08});
    if(p.denomination==="nonreligious" && ["college","postgrad"].includes(p.education))
      hit("sekülerlik × yüksek eğitim",{CHP:.12,TIP:.25,AKP:-.12,YRP:-.12});

    // Generation, education and labour-market position.
    if(["18-24","25-34"].includes(p.age) && lowRel)
      hit("gençlik × düşük dindarlık",{CHP:.08,TIP:.23,ZAFER:.09,AKP:-.12});
    if(["18-24","25-34"].includes(p.age) && p.gender==="man")
      hit("genç erkek profili",{ZAFER:.18,MHP:.05,TIP:.04});
    if(p.employment==="student" && ["18-24","25-34"].includes(p.age))
      hit("öğrencilik × gençlik",{TIP:.16,ZAFER:.13,CHP:.05,AKP:-.08});
    if(p.employment==="unemployed" && ["18-24","25-34"].includes(p.age))
      hit("genç işsizliği",{ZAFER:.16,TIP:.12,OTHER:.07,AKP:-.08});
    if(p.settlement==="metro" && ["college","postgrad"].includes(p.education))
      hit("metropol × yüksek eğitim",{CHP:.11,TIP:.17,AKP:-.10,MHP:-.05});
    if(p.income==="q5" && ["college","postgrad"].includes(p.education))
      hit("yüksek gelir × yüksek eğitim",{CHP:.09,IYI:.06,TIP:.05,AKP:-.05});

    // Religion is conditioned by place and social role, not added mechanically.
    if(p.settlement==="rural" && highRel && muslimTradition)
      hit("kırsallık × Müslüman dindarlığı",{AKP:.21,YRP:.19,CHP:-.14,TIP:-.12});
    if(p.region==="central_anatolia" && highRel && muslimTradition)
      hit("Orta Anadolu × Müslüman dindarlığı",{AKP:.15,YRP:.11,CHP:-.09});

    // Family structure. Parenthood has no single, universal "AKP effect".
    // The effect is strongest among married, observant Muslim households and is
    // attenuated or reversed for unmarried/divorced parents.
    if(p.marital==="married" && hasChildren){
      if(highRel && muslimTradition){
        const map={
          one:{AKP:.05,YRP:.03},
          two:{AKP:.11,YRP:.07,MHP:.02,CHP:-.04,TIP:-.05},
          threeplus:{AKP:.19,YRP:.16,MHP:.03,CHP:-.08,TIP:-.10,ZAFER:-.04}
        };
        hit("evlilik × çocuk × yüksek dindarlık",map[p.children]||{});
      }else if(p.religiosity==="somewhat" && muslimTradition){
        const map={
          one:{AKP:.02}, two:{AKP:.05,YRP:.02},
          threeplus:{AKP:.09,YRP:.06,CHP:-.03,TIP:-.04}
        };
        hit("evlilik × çocuk × orta dindarlık",map[p.children]||{});
      }else if(lowRel || !muslimTradition){
        const map={
          one:{CHP:.02,TIP:.01},
          two:{AKP:-.02,CHP:.03,TIP:.02},
          threeplus:{AKP:-.04,CHP:.05,TIP:.03,YRP:-.04}
        };
        hit("evlilik × çocuk × düşük dindarlık",map[p.children]||{});
      }
    }
    if(p.marital==="single" && hasChildren){
      const map={
        one:{AKP:-.04,CHP:.04,TIP:.03,OTHER:.02},
        two:{AKP:-.07,CHP:.06,TIP:.04,YRP:-.04,OTHER:.02},
        threeplus:{AKP:-.08,CHP:.06,TIP:.03,YRP:-.05,OTHER:.04}
      };
      hit("bekârlık × çocuk sahibi olma",map[p.children]||{});
    }
    if(p.marital==="divorced" && hasChildren)
      hit("boşanmışlık × çocuk sahibi olma",{AKP:-.10,CHP:.09,TIP:.05,YRP:-.06,OTHER:.02});
    if(p.gender==="woman" && ["single","divorced"].includes(p.marital) && hasChildren)
      hit("kadın × evli olmayan ebeveyn",{AKP:-.04,CHP:.04,TIP:.03});
    if(p.employment==="homemaker" && p.marital==="married" && highRel && muslimTradition)
      hit("ev içi emek × evlilik × yüksek dindarlık",{AKP:.12,YRP:.08,CHP:-.07});
    if(p.employment==="homemaker" && p.marital==="married" && manyChildren)
      hit("ev içi emek × çok çocuk",{AKP:.06,YRP:.05,TIP:-.04});
  }

  function computeModel(p){
    const scores={};
    PARTY_KEYS.forEach(k=>scores[k]=Math.log(BASELINE[k]));
    const rawDrivers=[];
    for(const field of Object.keys(FIELDS)){
      const effect=fieldEffect(field,p);
      addEffect(scores,effect);
      if(effect && Object.keys(effect).length) rawDrivers.push({label:`${field}:${p[field]}`,effect,strength:1,field});
    }
    applyInteractions(scores,p,rawDrivers);
    const conditional=softmax(scores);

    let turnoutLogit=logit(.8705);
    const turnoutEffects={
      age:{"18-24":-.48,"25-34":-.23,"35-44":0,"45-54":.10,"55-64":.18,"65+":.12},
      education:{primary:-.13,middle:-.06,high:0,college:.16,postgrad:.22},
      employment:{student:-.10,private:0,public:.14,self:.08,unemployed:-.23,homemaker:-.04,retired:.10,farmer:.04},
      marital:{single:-.10,married:.14,divorced:-.02,widowed:.02},
      settlement:{metro:.02,urban:.03,town:.02,rural:.05},
      income:{q1:-.10,q2:-.04,q3:0,q4:.06,q5:.10}
    };
    Object.entries(turnoutEffects).forEach(([f,map])=>turnoutLogit += map[p[f]]||0);
    if(p.ethnicity==="kurdish" && p.region==="southeast") turnoutLogit-=.10;
    if(p.denomination==="nonreligious") turnoutLogit-=.05;
    if(p.religiosity==="very" && ["sunni","othermuslim"].includes(p.denomination)) turnoutLogit+=.08;
    if(p.marital==="married" && p.children!=="none") turnoutLogit+=.025;
    if(["single","divorced"].includes(p.marital) && p.children!=="none") turnoutLogit-=.035;
    const turnout=clamp(logistic(turnoutLogit),.58,.97);

    const all={};
    PARTY_KEYS.forEach(k=>all[k]=conditional[k]*turnout);
    all.ABSTAIN=1-turnout;

    // Runoff: block conversion plus direct profile corrections.
    let e = .90*conditional.AKP + .94*conditional.MHP + .90*conditional.YRP + .55*conditional.ZAFER + .43*conditional.OTHER + .08*conditional.CHP + .07*conditional.IYI + .04*conditional.YSP + .02*conditional.TIP;
    let k = .90*conditional.CHP + .86*conditional.IYI + .93*conditional.YSP + .95*conditional.TIP + .31*conditional.ZAFER + .42*conditional.OTHER + .06*conditional.AKP + .05*conditional.MHP + .05*conditional.YRP;
    if(p.ethnicity==="kurdish"){k*=1.07;e*=.95}
    if(p.denomination==="alevi" || p.denomination==="nonreligious"){k*=1.05;e*=.94}
    if(["very","religious"].includes(p.religiosity)){e*=1.05;k*=.96}
    const validSum=e+k; e/=validSum;k/=validSum;
    const runoffTurnout=clamp(turnout-.035,.55,.95);
    const runoff={ERDOGAN:e*runoffTurnout,KILICDAROGLU:k*runoffTurnout,ABSTAIN:1-runoffTurnout};

    const drivers=rankDrivers(rawDrivers,conditional);
    const uncertainty=estimateUncertainty(p,conditional,rawDrivers.filter(d=>d.label.includes("×")).length);
    return {conditional,all,turnout,runoff,drivers,uncertainty};
  }

  function rankDrivers(rawDrivers,conditional){
    const topParty=PARTY_KEYS.reduce((a,b)=>conditional[a]>conditional[b]?a:b);
    const items=[];
    rawDrivers.forEach(d=>{
      const topShift=d.effect?.[topParty]||0;
      const maxOther=Math.max(...PARTY_KEYS.filter(k=>k!==topParty).map(k=>d.effect?.[k]||0));
      const separation=topShift-maxOther;
      const absMax=Math.max(...PARTY_KEYS.map(k=>Math.abs(d.effect?.[k]||0)));
      const threshold=d.label.includes("×")?.04:.12;
      if(absMax<threshold) return;
      items.push({...d,score:Math.max(absMax,Math.abs(separation)),topParty});
    });
    const sorted=items.sort((a,b)=>b.score-a.score);
    const selected=sorted.slice(0,5);
    const required=[];
    const bestInteraction=sorted.find(x=>x.label.includes("×"));
    const bestFamily=sorted.find(x=>x.label.includes("çocuk") || x.label.includes("ebeveyn"));
    if(bestInteraction) required.push(bestInteraction);
    if(bestFamily && !required.includes(bestFamily)) required.push(bestFamily);
    required.forEach(item=>{
      if(selected.includes(item)) return;
      const replaceAt=selected.map((x,i)=>({x,i})).reverse().find(({x})=>!required.includes(x))?.i;
      if(replaceAt===undefined) selected.push(item); else selected[replaceAt]=item;
    });
    return selected.sort((a,b)=>b.score-a.score).slice(0,5);
  }

  function profileDiagnostics(p){
    const notes=[];
    const add=(text,penalty=1)=>notes.push({text,penalty});
    if(p.denomination==="nonreligious" && ["very","religious","somewhat"].includes(p.religiosity))
      add("İnançsızlık ile yüksek dindarlık birlikte seçilemez",5);
    if(p.age==="18-24" && p.employment==="retired") add("18–24 yaşında emeklilik çok nadir",5);
    if(p.age==="25-34" && p.employment==="retired") add("25–34 yaşında emeklilik nadir",3);
    if(p.age==="65+" && p.employment==="student") add("65+ yaşta öğrencilik nadir",2);
    if(p.age==="18-24" && p.marital==="widowed") add("18–24 yaşta dulluk çok nadir",4);
    if(p.age==="18-24" && p.children==="threeplus") add("18–24 yaşta üç veya daha fazla çocuk çok nadir",4);
    if(p.age==="18-24" && p.education==="postgrad") add("18–24 yaşta tamamlanmış lisansüstü eğitim nadir",2);
    if(p.marital==="single" && ["two","threeplus"].includes(p.children)) add("Bekâr ve çok çocuklu profil örneklemde seyrek olabilir",2);
    return notes;
  }

  function estimateUncertainty(p,conditional,interactionCount=0){
    let points=8;
    const rare=[p.ethnicity!=="turkish"&&p.ethnicity!=="noanswer",p.denomination!=="sunni"&&p.denomination!=="noanswer",p.education==="postgrad",p.employment==="farmer",p.age==="65+"];
    points += rare.filter(Boolean).length*1.25;
    const diagnostics=profileDiagnostics(p);
    points += Math.min(5,diagnostics.reduce((s,x)=>s+x.penalty,0));
    if(interactionCount>=5) points+=1;
    const top=Math.max(...Object.values(conditional));
    if(top>.70) points+=2;
    return {margin:Math.round(clamp(points,8,19)),label:points<=10?"orta":points<=14?"orta-yüksek":"yüksek",diagnostics};
  }

  function driverText(d,p){
    if(d.label.includes("×")) return d.label;
    const [field,value]=d.label.split(":");
    const pretty=FIELD_LABELS[field]?.[value]||value;
    const names={gender:"cinsiyet",age:"yaş",education:"eğitim",employment:"çalışma durumu",income:"gelir",settlement:"yerleşim",region:"bölge",marital:"medeni durum",children:"çocuk sayısı",ethnicity:"etnik kimlik",denomination:"inanç/mezhep",religiosity:"dindarlık"};
    return `${names[field]}: ${pretty}`;
  }

  function pct(x,digits=0){return (x*100).toFixed(digits).replace(".",",")+"%"}

  function render(){
    const p=currentProfile();
    const r=computeModel(p);
    const entries=Object.entries(r.all).sort((a,b)=>b[1]-a[1]);
    const winner=entries[0][0];
    document.getElementById("headline").innerHTML = `${pct(r.all[winner])} <small>${PARTY_META[winner].label} olasılığı</small>`;
    const diag=r.uncertainty.diagnostics;
    const status=diag.length
      ? `<span class="profile-status warn">Profil uyarısı: ${diag.slice(0,2).map(x=>x.text).join("; ")}</span>`
      : `<span class="profile-status ok">Profil kesişimi mantıksal olarak tutarlı.</span>`;
    document.getElementById("confidenceBox").innerHTML=`<strong>Belirsizlik: ${r.uncertainty.label}</strong>Yaklaşık ±${r.uncertainty.margin} yüzde puan. Nadir profil kesişimlerinde aralık genişler.${status}`;

    const stack=document.getElementById("stackedBar"); stack.innerHTML="";
    entries.forEach(([k,v])=>{
      const el=document.createElement("div");el.className="segment";el.style.width=(v*100)+"%";el.style.background=PARTY_META[k].color;el.dataset.label=`${PARTY_META[k].label}: ${pct(v,1)}`;stack.appendChild(el);
    });
    const legend=document.getElementById("legend");legend.innerHTML="";
    entries.slice(0,7).forEach(([k,v])=>{
      const el=document.createElement("span");el.className="legend-item";el.innerHTML=`<span class="swatch" style="background:${PARTY_META[k].color}"></span>${PARTY_META[k].label} ${pct(v)}`;legend.appendChild(el);
    });

    const rows=document.getElementById("partyRows");rows.innerHTML="";
    entries.forEach(([k,v])=>{
      const row=document.createElement("div");row.className="party-row";
      row.innerHTML=`<div class="party-name">${PARTY_META[k].label}</div><div class="bar-track"><div class="bar-fill" style="width:${v*100}%;background:${PARTY_META[k].color}"></div></div><div class="party-value">${pct(v)}</div>`;
      rows.appendChild(row);
    });

    document.getElementById("turnoutNumber").textContent=pct(r.turnout);
    document.getElementById("turnoutGauge").style.width=(r.turnout*100)+"%";
    const rr=r.runoff;
    document.getElementById("erdoganSeg").style.width=(rr.ERDOGAN*100)+"%";
    document.getElementById("kilicdarogluSeg").style.width=(rr.KILICDAROGLU*100)+"%";
    document.getElementById("runoffAbstainSeg").style.width=(rr.ABSTAIN*100)+"%";
    document.getElementById("erdoganValue").textContent=`Erdoğan ${pct(rr.ERDOGAN)}`;
    document.getElementById("kilicdarogluValue").textContent=`Kılıçdaroğlu ${pct(rr.KILICDAROGLU)}`;
    const runWinner=rr.ERDOGAN>rr.KILICDAROGLU?"Erdoğan":"Kılıçdaroğlu";
    document.getElementById("runoffHeadline").textContent=runWinner;

    const chips=document.getElementById("driverChips");chips.innerHTML="";
    r.drivers.forEach(d=>{
      const el=document.createElement("span");el.className="chip";
      const target=d.effect[d.topParty]||0;
      el.innerHTML=`<strong>${target>=0?"↑":"↓"} ${PARTY_META[d.topParty].label}</strong> · ${driverText(d,p)}`;
      chips.appendChild(el);
    });
    if(!r.drivers.length) chips.innerHTML='<span class="chip">Profil, ulusal başlangıç dağılımına yakın.</span>';

    window.__lastResult={profile:p,result:r,winner};
  }

  function synchronizeSelections(changedField){
    const denomination=document.getElementById("denomination");
    const religiosity=document.getElementById("religiosity");
    const nonreligious=denomination.value==="nonreligious";
    [...religiosity.options].forEach(o=>{
      o.disabled=nonreligious && ["very","religious","somewhat"].includes(o.value);
    });
    if(nonreligious && ["very","religious","somewhat"].includes(religiosity.value)) religiosity.value="never";
  }

  function populate(){
    for(const [field,opts] of Object.entries(FIELDS)){
      const select=document.getElementById(field);
      opts.forEach(([value,label])=>{const o=document.createElement("option");o.value=value;o.textContent=label;select.appendChild(o)});
      select.addEventListener("change",()=>{synchronizeSelections(field);render()});
    }
    synchronizeSelections();
  }

  function weightedPick(items){
    const total=items.reduce((s,x)=>s+x[1],0);let n=Math.random()*total;
    for(const [v,w] of items){n-=w;if(n<=0)return v}return items.at(-1)[0];
  }

  function randomProfile(){
    const p={};
    p.gender=weightedPick([["woman",.50],["man",.50]]);
    p.age=weightedPick([["18-24",.14],["25-34",.22],["35-44",.20],["45-54",.17],["55-64",.14],["65+",.13]]);

    const educationByAge={
      "18-24":[["primary",.03],["middle",.08],["high",.50],["college",.37],["postgrad",.02]],
      "25-34":[["primary",.07],["middle",.12],["high",.34],["college",.42],["postgrad",.05]],
      "35-44":[["primary",.18],["middle",.20],["high",.30],["college",.28],["postgrad",.04]],
      "45-54":[["primary",.29],["middle",.22],["high",.27],["college",.19],["postgrad",.03]],
      "55-64":[["primary",.42],["middle",.22],["high",.21],["college",.13],["postgrad",.02]],
      "65+":[["primary",.57],["middle",.18],["high",.15],["college",.09],["postgrad",.01]]
    };
    p.education=weightedPick(educationByAge[p.age]);

    if(p.age==="18-24") p.employment=weightedPick([["student",.55],["private",.20],["public",.03],["self",.05],["unemployed",.12],["homemaker",.04],["farmer",.01]]);
    else if(p.age==="25-34") p.employment=weightedPick([["student",.10],["private",.42],["public",.12],["self",.10],["unemployed",.13],["homemaker",.10],["farmer",.03]]);
    else if(p.age==="65+") p.employment=weightedPick([["retired",.70],["homemaker",.17],["farmer",.06],["self",.04],["private",.02],["unemployed",.01]]);
    else if(p.age==="55-64") p.employment=weightedPick([["retired",.36],["private",.18],["public",.08],["self",.13],["unemployed",.06],["homemaker",.14],["farmer",.05]]);
    else p.employment=weightedPick([["private",.36],["public",.13],["self",.14],["unemployed",.09],["homemaker",.18],["farmer",.05],["student",.01],["retired",.04]]);
    if(p.gender==="man" && p.employment==="homemaker" && Math.random()<.78) p.employment="unemployed";

    const eduIncome={primary:[["q1",.37],["q2",.31],["q3",.20],["q4",.09],["q5",.03]],middle:[["q1",.28],["q2",.31],["q3",.24],["q4",.12],["q5",.05]],high:[["q1",.20],["q2",.28],["q3",.28],["q4",.17],["q5",.07]],college:[["q1",.11],["q2",.20],["q3",.29],["q4",.26],["q5",.14]],postgrad:[["q1",.07],["q2",.13],["q3",.25],["q4",.31],["q5",.24]]};
    p.income=weightedPick(eduIncome[p.education]);
    if(p.employment==="unemployed" && ["q4","q5"].includes(p.income) && Math.random()<.7) p.income="q2";

    p.region=weightedPick([["istanbul",.20],["west_marmara",.04],["aegean",.13],["east_marmara",.10],["west_anatolia",.10],["mediterranean",.13],["central_anatolia",.05],["west_blacksea",.06],["east_blacksea",.03],["northeast",.03],["centraleast",.05],["southeast",.08]]);
    p.settlement=weightedPick([["metro",.48],["urban",.30],["town",.12],["rural",.10]]);
    if(["northeast","centraleast","southeast"].includes(p.region) && Math.random()<.25) p.settlement=weightedPick([["metro",.27],["urban",.33],["town",.18],["rural",.22]]);

    if(p.age==="18-24") p.marital=weightedPick([["single",.88],["married",.11],["divorced",.01]]);
    else if(p.age==="25-34") p.marital=weightedPick([["single",.40],["married",.54],["divorced",.05],["widowed",.01]]);
    else if(p.age==="65+") p.marital=weightedPick([["married",.58],["widowed",.31],["divorced",.05],["single",.06]]);
    else p.marital=weightedPick([["single",.13],["married",.74],["divorced",.08],["widowed",.05]]);

    if(p.marital==="single") p.children=weightedPick([["none",.88],["one",.07],["two",.04],["threeplus",.01]]);
    else if(p.age==="18-24") p.children=weightedPick([["none",.60],["one",.30],["two",.08],["threeplus",.02]]);
    else p.children=weightedPick([["none",.12],["one",.23],["two",.39],["threeplus",.26]]);

    const ethByRegion={
      southeast:[["turkish",.33],["kurdish",.48],["zaza",.08],["arab",.08],["other",.02],["noanswer",.01]],
      centraleast:[["turkish",.52],["kurdish",.28],["zaza",.12],["arab",.02],["other",.04],["noanswer",.02]],
      northeast:[["turkish",.78],["kurdish",.12],["zaza",.02],["other",.06],["noanswer",.02]],
      istanbul:[["turkish",.74],["kurdish",.15],["zaza",.02],["arab",.03],["other",.04],["noanswer",.02]],
      mediterranean:[["turkish",.78],["kurdish",.09],["zaza",.01],["arab",.07],["other",.03],["noanswer",.02]],
      default:[["turkish",.88],["kurdish",.05],["zaza",.01],["arab",.02],["other",.03],["noanswer",.01]]
    };
    p.ethnicity=weightedPick(ethByRegion[p.region]||ethByRegion.default);

    let denomWeights=[["sunni",.82],["alevi",.09],["othermuslim",.02],["nonreligious",.05],["nonmuslim",.005],["noanswer",.015]];
    if(p.ethnicity==="kurdish") denomWeights=[["sunni",.75],["alevi",.11],["othermuslim",.06],["nonreligious",.05],["noanswer",.03]];
    if(p.ethnicity==="zaza") denomWeights=[["sunni",.62],["alevi",.27],["othermuslim",.04],["nonreligious",.04],["noanswer",.03]];
    p.denomination=weightedPick(denomWeights);

    if(p.denomination==="nonreligious") p.religiosity=weightedPick([["never",.78],["rarely",.16],["somewhat",.04],["noanswer",.02]]);
    else if(p.denomination==="alevi") p.religiosity=weightedPick([["very",.05],["religious",.16],["somewhat",.35],["rarely",.28],["never",.12],["noanswer",.04]]);
    else if(p.age==="65+") p.religiosity=weightedPick([["very",.28],["religious",.38],["somewhat",.22],["rarely",.07],["never",.02],["noanswer",.03]]);
    else if(["18-24","25-34"].includes(p.age)) p.religiosity=weightedPick([["very",.10],["religious",.24],["somewhat",.34],["rarely",.20],["never",.09],["noanswer",.03]]);
    else p.religiosity=weightedPick([["very",.18],["religious",.34],["somewhat",.31],["rarely",.11],["never",.03],["noanswer",.03]]);

    Object.entries(p).forEach(([k,v])=>document.getElementById(k).value=v);
    synchronizeSelections();
    render();
  }

  async function copyResult(){
    const {profile:p,result:r,winner}=window.__lastResult;
    const lines=[
      "Bir Türkiye Seçmeni Oluştur — 2023 prototipi",
      `${PARTY_META[winner].label}: ${pct(r.all[winner])}`,
      `Katılım: ${pct(r.turnout)}`,
      `İkinci tur: Erdoğan ${pct(r.runoff.ERDOGAN)}, Kılıçdaroğlu ${pct(r.runoff.KILICDAROGLU)}, sandığa gitmeme ${pct(r.runoff.ABSTAIN)}`,
      `Profil: ${Object.entries(p).map(([k,v])=>FIELD_LABELS[k][v]).join("; ")}`,
      "Not: 2023'e dönük, etkileşim ve tutarlılık denetimleri olan fakat fitted mikroveri modeli olmayan araştırma prototipi."
    ];
    try{
      await navigator.clipboard.writeText(lines.join("\n"));
      const b=document.getElementById("copyBtn"),old=b.textContent;b.textContent="kopyalandı";setTimeout(()=>b.textContent=old,1400);
    }catch{
      alert(lines.join("\n"));
    }
  }

  populate(); randomProfile();
  document.getElementById("randomizeBtn").addEventListener("click",randomProfile);
  document.getElementById("copyBtn").addEventListener("click",copyResult);
  const dialog=document.getElementById("methodDialog");
  document.getElementById("methodBtn").addEventListener("click",()=>dialog.showModal());
  document.getElementById("closeMethod").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
})();
