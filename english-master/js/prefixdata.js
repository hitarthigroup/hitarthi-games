/* ==========================================================================
   prefixdata.js — prefix + word combination bank
   "Prefix Builder" game: shows a prefix and a base word, asks what they
   become when joined, then reveals the combined word's meaning in both
   English and Hindi.
   Attaches to the single HEM namespace. Declares no global identifiers.

   Row format:
   [ prefix, prefixPronHi, prefixMeaningEn, prefixMeaningHi,
     base, basePronHi, baseMeaningHi,
     result, resultPronHi, resultMeaningEn, resultMeaningHi,
     exampleEn, exampleHi ]
   ========================================================================== */
(function (HEM) {
  "use strict";

  var ROWS = [
    ["un","अन","not / opposite of","नहीं / विपरीत","happy","हैपी","खुश","unhappy","अन्हैपी","not happy","दुखी, नाखुश","She looked unhappy after the exam.","परीक्षा के बाद वह दुखी लग रही थी।"],
    ["un","अन","not / opposite of","नहीं / विपरीत","able","एबल","सक्षम","unable","अन्एबल","not able to do something","असमर्थ","He was unable to attend the meeting.","वह बैठक में शामिल होने में असमर्थ था।"],
    ["un","अन","not / opposite of","नहीं / विपरीत","fair","फ़ेयर","न्यायसंगत","unfair","अन्फ़ेयर","not fair or just","अनुचित","The referee's decision was unfair.","रेफ़री का फ़ैसला अनुचित था।"],
    ["un","अन","not / opposite of","नहीं / विपरीत","kind","काइंड","दयालु","unkind","अन्काइंड","not kind, cruel in speech","निर्दयी, कठोर","It was unkind to laugh at him.","उस पर हँसना निर्दयी बात थी।"],
    ["un","अन","not / opposite of","नहीं / विपरीत","lock","लॉक","ताला","unlock","अन्लॉक","to open something locked","ताला खोलना","Unlock the door with this key.","इस चाबी से दरवाज़ा खोलो।"],
    ["un","अन","not / opposite of","नहीं / विपरीत","comfortable","कंफ़र्टेबल","आरामदायक","uncomfortable","अन्कंफ़र्टेबल","not comfortable, causing unease","असहज","The chair felt uncomfortable after an hour.","एक घंटे बाद कुर्सी असहज लगने लगी।"],

    ["re","री","again","फिर से","do","डू","करना","redo","रीडू","to do something again","दोबारा करना","Please redo this page, it has errors.","कृपया यह पन्ना दोबारा करो, इसमें गलतियाँ हैं।"],
    ["re","री","again","फिर से","write","राइट","लिखना","rewrite","रीराइट","to write something again","फिर से लिखना","I had to rewrite the whole essay.","मुझे पूरा निबंध फिर से लिखना पड़ा।"],
    ["re","री","again","फिर से","start","स्टार्ट","शुरू करना","restart","रीस्टार्ट","to start again","फिर से शुरू करना","Restart the computer and try again.","कंप्यूटर फिर से चालू करो और कोशिश करो।"],
    ["re","री","again","फिर से","fill","फ़िल","भरना","refill","रीफ़िल","to fill again","फिर से भरना","Can you refill my water bottle?","क्या आप मेरी पानी की बोतल फिर से भर सकते हैं?"],
    ["re","री","again","फिर से","build","बिल्ड","बनाना","rebuild","रीबिल्ड","to build again after damage","फिर से बनाना","The village had to rebuild after the flood.","बाढ़ के बाद गाँव को फिर से बनाना पड़ा।"],

    ["pre","प्री","before","पहले","view","व्यू","देखना","preview","प्रीव्यू","to see something before the main showing","पूर्वावलोकन, पहले देखना","We watched a preview of the new film.","हमने नई फ़िल्म का पूर्वावलोकन देखा।"],
    ["pre","प्री","before","पहले","pay","पे","भुगतान करना","prepay","प्रीपे","to pay before receiving something","पहले भुगतान करना","You must prepay for the delivery.","डिलीवरी के लिए आपको पहले भुगतान करना होगा।"],
    ["pre","प्री","before","पहले","heat","हीट","गरम करना","preheat","प्रीहीट","to heat something in advance","पहले से गरम करना","Preheat the oven before baking.","बेक करने से पहले ओवन को गरम कर लें।"],
    ["pre","प्री","before","पहले","school","स्कूल","विद्यालय","preschool","प्रीस्कूल","school before regular school age","बाल विद्यालय, प्ले-स्कूल","My daughter starts preschool this year.","इस साल मेरी बेटी बाल विद्यालय शुरू करेगी।"],

    ["dis","डिस","not / opposite of","नहीं / विपरीत","agree","अग्री","सहमत होना","disagree","डिसअग्री","to not agree","असहमत होना","I disagree with that decision.","मैं उस फ़ैसले से असहमत हूँ।"],
    ["dis","डिस","not / opposite of","नहीं / विपरीत","like","लाइक","पसंद करना","dislike","डिसलाइक","to not like something","नापसंद करना","She does not dislike the plan, just the timing.","उसे योजना नापसंद नहीं, सिर्फ़ समय पसंद नहीं है।"],
    ["dis","डिस","not / opposite of","नहीं / विपरीत","appear","अपियर","दिखाई देना","disappear","डिसअपियर","to go out of sight","गायब हो जाना","The sun disappeared behind the clouds.","सूरज बादलों के पीछे गायब हो गया।"],
    ["dis","डिस","not / opposite of","नहीं / विपरीत","honest","ऑनेस्ट","ईमानदार","dishonest","डिसऑनेस्ट","not honest, deceitful","बेईमान","Cheating in the exam is dishonest.","परीक्षा में नकल करना बेईमानी है।"],
    ["dis","डिस","not / opposite of","नहीं / विपरीत","connect","कनेक्ट","जोड़ना","disconnect","डिसकनेक्ट","to break a connection","संपर्क तोड़ना, काटना","Disconnect the charger before travelling.","यात्रा से पहले चार्जर काट दें।"],

    ["mis","मिस","wrongly","गलत तरीके से","understand","अंडरस्टैंड","समझना","misunderstand","मिसअंडरस्टैंड","to understand incorrectly","गलत समझना","Please don't misunderstand my intention.","कृपया मेरे इरादे को गलत मत समझिए।"],
    ["mis","मिस","wrongly","गलत तरीके से","spell","स्पेल","वर्तनी लिखना","misspell","मिसस्पेल","to spell a word incorrectly","गलत वर्तनी लिखना","He often misspells long words.","वह अक्सर लंबे शब्दों की गलत वर्तनी लिखता है।"],
    ["mis","मिस","wrongly","गलत तरीके से","lead","लीड","ले जाना","mislead","मिसलीड","to give a false impression","गुमराह करना","The advertisement was designed to mislead buyers.","विज्ञापन खरीदारों को गुमराह करने के लिए बनाया गया था।"],

    ["in","इन","not","नहीं","correct","करेक्ट","सही","incorrect","इनकरेक्ट","not correct, wrong","गलत","Two of your answers are incorrect.","आपके दो उत्तर गलत हैं।"],
    ["in","इन","not","नहीं","active","एक्टिव","सक्रिय","inactive","इनएक्टिव","not active","निष्क्रिय","This account has been inactive for a year.","यह खाता एक साल से निष्क्रिय है।"],
    ["in","इन","not","नहीं","visible","विज़िबल","दिखाई देने वाला","invisible","इनविज़िबल","not able to be seen","अदृश्य","Germs are invisible to the naked eye.","कीटाणु नंगी आँखों से अदृश्य होते हैं।"],

    ["im","इम","not","नहीं","possible","पॉसिबल","संभव","impossible","इम्पॉसिबल","not possible","असंभव","Nothing is impossible with practice.","अभ्यास से कुछ भी असंभव नहीं है।"],
    ["im","इम","not","नहीं","patient","पेशेंट","धैर्यवान","impatient","इम्पेशेंट","not patient, restless","अधीर","The children grew impatient during the wait.","इंतज़ार के दौरान बच्चे अधीर हो गए।"],
    ["im","इम","not","नहीं","mature","मेच्योर","परिपक्व","immature","इम्मेच्योर","not fully grown or sensible","अपरिपक्व","That was an immature way to react.","वह प्रतिक्रिया देने का अपरिपक्व तरीका था।"],

    ["non","नॉन","not","नहीं","fiction","फ़िक्शन","कल्पित कथा","nonfiction","नॉनफ़िक्शन","writing based on facts, not imagination","तथ्यात्मक साहित्य","She prefers nonfiction over novels.","वह उपन्यासों से ज़्यादा तथ्यात्मक किताबें पसंद करती है।"],
    ["non","नॉन","not","नहीं","stop","स्टॉप","रुकना","nonstop","नॉनस्टॉप","without stopping or pausing","लगातार, बिना रुके","We took a nonstop flight to Delhi.","हमने दिल्ली के लिए लगातार उड़ान भरने वाली फ़्लाइट ली।"],

    ["over","ओवर","too much","बहुत अधिक","eat","ईट","खाना","overeat","ओवरईट","to eat more than needed","ज़्यादा खाना","Do not overeat at festival dinners.","त्योहार के खाने में ज़्यादा मत खाओ।"],
    ["over","ओवर","too much","बहुत अधिक","sleep","स्लीप","सोना","oversleep","ओवरस्लीप","to sleep longer than intended","देर तक सो जाना","I overslept and missed the bus.","मैं देर तक सो गया और बस छूट गई।"],
    ["over","ओवर","too much","बहुत अधिक","load","लोड","भार लादना","overload","ओवरलोड","to load with too much","अधिक भार डालना","Do not overload the small cart.","छोटी गाड़ी पर अधिक भार मत डालो।"],

    ["under","अंडर","too little","बहुत कम","cook","कुक","पकाना","undercook","अंडरकुक","to cook less than needed","कम पकाना","Undercooked rice is hard to digest.","कम पका हुआ चावल पचाना मुश्किल होता है।"],
    ["under","अंडर","too little","बहुत कम","pay","पे","भुगतान करना","underpay","अंडरपे","to pay less than deserved","कम भुगतान करना","Workers should not be underpaid.","मज़दूरों को कम भुगतान नहीं करना चाहिए।"],

    ["sub","सब","below / under","नीचे","way","वे","रास्ता","subway","सबवे","a path or train system below the ground","भूमिगत मार्ग, मेट्रो","We took the subway to the office.","हम दफ़्तर के लिए मेट्रो से गए।"],
    ["sub","सब","below / under","नीचे","marine","मरीन","समुद्री","submarine","सबमरीन","a vessel that travels under the sea","पनडुब्बी","The submarine dived deep into the ocean.","पनडुब्बी समुद्र में गहरे उतर गई।"],

    ["super","सुपर","above / beyond","ऊपर, अधिक","market","मार्केट","बाज़ार","supermarket","सुपरमार्केट","a large store selling many goods","बड़ा बाज़ार, सुपरमार्केट","We buy groceries from the supermarket.","हम किराना सामान सुपरमार्केट से खरीदते हैं।"],
    ["super","सुपर","above / beyond","ऊपर, अधिक","human","ह्यूमन","मानव","superhuman","सुपरह्यूमन","beyond normal human power","अलौकिक, असाधारण मानवीय","He showed superhuman strength that day.","उस दिन उसने असाधारण शक्ति दिखाई।"],

    ["inter","इंटर","between","के बीच","national","नेशनल","राष्ट्रीय","international","इंटरनेशनल","involving more than one nation","अंतरराष्ट्रीय","She works for an international company.","वह एक अंतरराष्ट्रीय कंपनी में काम करती है।"],

    ["auto","ऑटो","self","स्वयं","mobile","मोबाइल","चलायमान","automobile","ऑटोमोबाइल","a self-powered road vehicle","स्वचालित वाहन, मोटर गाड़ी","The automobile industry is growing fast.","वाहन उद्योग तेज़ी से बढ़ रहा है।"],

    ["bi","बाइ","two","दो","cycle","साइकल","चक्र","bicycle","बाइसाइकल","a vehicle with two wheels","दो पहियों वाली गाड़ी, साइकिल","He rides his bicycle to school.","वह अपनी साइकिल से स्कूल जाता है।"],

    ["tri","ट्राइ","three","तीन","angle","एंगल","कोण","triangle","ट्राइएंगल","a shape with three angles","त्रिभुज","Draw a triangle with equal sides.","बराबर भुजाओं वाला त्रिभुज बनाओ।"],

    ["semi","सेमी","half","आधा","circle","सर्कल","वृत्त","semicircle","सेमीसर्कल","half of a circle","अर्धवृत्त","The stage was built in a semicircle.","मंच अर्धवृत्त में बनाया गया था।"],

    ["anti","एंटी","against","के विरुद्ध","clockwise","क्लॉकवाइज़","घड़ी की दिशा में","anticlockwise","एंटीक्लॉकवाइज़","moving opposite to clock hands","घड़ी की उलटी दिशा में","Turn the cap anticlockwise to open it.","खोलने के लिए ढक्कन को घड़ी की उलटी दिशा में घुमाओ।"],

    ["co","को","together","साथ में","operate","ऑपरेट","संचालन करना","cooperate","कोऑपरेट","to work together with others","सहयोग करना","The two teams agreed to cooperate.","दोनों टीमें सहयोग करने पर सहमत हुईं।"],

    ["fore","फ़ोर","before","पहले","cast","कास्ट","अनुमान लगाना","forecast","फ़ोरकास्ट","a statement of what will happen","पूर्वानुमान","The weather forecast predicts rain today.","मौसम का पूर्वानुमान आज बारिश बताता है।"],

    ["post","पोस्ट","after","बाद में","pone","पोन","रखना","postpone","पोस्टपोन","to delay something to a later time","स्थगित करना","We had to postpone the meeting.","हमें बैठक स्थगित करनी पड़ी।"],

    ["de","डी","reverse / remove","उलटना, हटाना","code","कोड","संकेत लिपि","decode","डीकोड","to work out the meaning of a coded message","कूट खोलना, अर्थ निकालना","Can you decode this secret message?","क्या आप इस गुप्त संदेश को समझ सकते हैं?"],

    ["ex","एक्स","out / former","बाहर, पूर्व","port","पोर्ट","बंदरगाह","export","एक्सपोर्ट","to send goods to another country","निर्यात करना","India exports tea to many countries.","भारत कई देशों को चाय निर्यात करता है।"],

    ["extra","एक्स्ट्रा","beyond / more","परे, अतिरिक्त","ordinary","ऑर्डिनरी","साधारण","extraordinary","एक्स्ट्राऑर्डिनरी","beyond what is usual or normal","असाधारण","She showed extraordinary courage that day.","उस दिन उसने असाधारण साहस दिखाया।"]
  ];

  HEM.PREFIXES = ROWS.map(function (r, i) {
    return {
      id: i,
      prefix: r[0], prefixPron: r[1], prefixMeaningEn: r[2], prefixMeaningHi: r[3],
      base: r[4], basePron: r[5], baseMeaningHi: r[6],
      result: r[7], resultPron: r[8], resultMeaningEn: r[9], resultMeaningHi: r[10],
      exampleEn: r[11], exampleHi: r[12]
    };
  });
})(typeof window !== "undefined" ? (window.HEM = window.HEM || {}) : (global.HEM = global.HEM || {}));
