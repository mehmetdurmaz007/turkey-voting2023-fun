export const SHARE_URL = "https://mehmetdurmaz007.github.io/turkey-voting2023-fun/";

export const PARTY_META = {
  AKP:{label:"AK Parti", color:"#ef8c24"},
  CHP:{label:"CHP", color:"#cf252d"},
  MHP:{label:"MHP", color:"#8f1721"},
  IYI:{label:"İYİ Parti", color:"#38a7d6"},
  YSP:{label:"YSP", color:"#67a846"},
  TIP:{label:"TİP", color:"#7c285f"},
  YRP:{label:"Yeniden Refah", color:"#681e38"},
  ZAFER:{label:"Zafer", color:"#39a6a8"},
  OTHER:{label:"Diğer", color:"#a9b2b6"}
};

export const FIELDS = {
  gender:[["woman","kadın"],["man","erkek"]],
  age:[["18-24","18–24"],["25-34","25–34"],["35-44","35–44"],["45-54","45–54"],["55-64","55–64"],["65+","65 ve üzeri"]],
  education:[["primary","ilkokul veya altı"],["middle","ortaokul"],["high","lise"],["college","üniversite"],["postgrad","lisansüstü"]],
  employment:[["employed","çalışıyor"],["student","öğrenci"],["unemployed","işsiz"],["homemaker","ev içi emek veriyor"],["retired","emekli"],["other","diğer / belirtilmemiş"]],
  occupation:[["professional","yönetici, profesyonel veya teknisyen"],["service","büro, satış veya hizmet çalışanı"],["agriculture","tarım çalışanı"],["skilled_manual","zanaat, operatör veya şoför"],["elementary_manual","vasıfsız / temel işlerde çalışan"],["unavailable","çalışmıyor veya meslek bilgisi yok"]],
  income:[["q1","en düşük gelir beşte birinde"],["q2","alt-orta gelir beşte birinde"],["q3","orta gelir beşte birinde"],["q4","üst-orta gelir beşte birinde"],["q5","en yüksek gelir beşte birinde"],["unknown","gelirini belirtmemiş"]],
  settlement:[["rural","kırsal alan veya köyde"],["town","küçük ya da orta büyüklükte kentte"],["suburb","büyük kentin çevresinde"],["city","büyük kentte"]],
  region:[["istanbul","İstanbul"],["west_marmara","Batı Marmara"],["aegean","Ege"],["east_marmara","Doğu Marmara"],["west_anatolia","Batı Anadolu"],["mediterranean","Akdeniz"],["central_anatolia","Orta Anadolu"],["west_blacksea","Batı Karadeniz"],["east_blacksea","Doğu Karadeniz"],["northeast","Kuzeydoğu Anadolu"],["centraleast","Ortadoğu Anadolu"],["southeast","Güneydoğu Anadolu"]],
  marital:[["single","bekâr"],["married","evli / birlikte yaşıyor"],["divorced","boşanmış / ayrı"],["widowed","dul"]],
  household_size:[["one","tek kişilik hanede"],["two","iki kişilik hanede"],["three","üç kişilik hanede"],["four","dört kişilik hanede"],["fiveplus","beş veya daha fazla kişilik hanede"],["unknown","hane büyüklüğünü belirtmemiş"]],
  home_language:[["turkish","evde çoğunlukla Türkçe"],["kurdish","evde çoğunlukla Kürtçe"],["arabic_other","evde Arapça veya başka bir dil"],["unknown","evde konuşulan dili belirtmemiş"]],
  attendance:[["never","hiç katılmıyor"],["yearly","yılda yaklaşık bir kez katılıyor"],["several_year","yılda birkaç kez katılıyor"],["monthly","ayda yaklaşık bir kez katılıyor"],["weekly","haftada en az bir kez katılıyor"],["unknown","katılım sıklığını belirtmemiş"]]
};

export const FIELD_LABELS = Object.fromEntries(
  Object.entries(FIELDS).map(([field, options]) => [field, Object.fromEntries(options)])
);
