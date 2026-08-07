/* ==========================================================================
   data.js — Hitarthi Prefix Master word bank
   Attaches to the single HPM namespace. Declares no global identifiers.

   Row format:
   [ level, prefix, root, rootPronHi, rootMeaningHi, rootMeaningEn,
     word, wordPronHi, wordMeaningHi, wordMeaningEn, exampleEn, exampleHi ]
   ========================================================================== */
(function (HPM) {
  "use strict";

  var ROWS = [
    /* ---------------- LEVEL 1 · UN- (15) ---------------- */
    [1,"un","happy","हैपी","खुश","glad","unhappy","अनहैपी","दुखी, खुश नहीं","not happy, sad","She looked unhappy after the exam.","परीक्षा के बाद वह दुखी लग रही थी।"],
    [1,"un","fair","फ़ेयर","न्यायसंगत","just","unfair","अनफ़ेयर","अनुचित","not fair or just","The referee's decision was unfair.","रेफ़री का फ़ैसला अनुचित था।"],
    [1,"un","kind","काइंड","दयालु","gentle","unkind","अनकाइंड","निर्दयी","not kind, cruel in speech","It was unkind to laugh at him.","उस पर हँसना निर्दयी बात थी।"],
    [1,"un","known","नोन","ज्ञात","recognised","unknown","अननोन","अज्ञात","not known or identified","The cause of the fire is still unknown.","आग का कारण अभी भी अज्ञात है।"],
    [1,"un","able","एबल","सक्षम","capable","unable","अनएबल","असमर्थ","not able to do something","He was unable to attend the meeting.","वह बैठक में शामिल होने में असमर्थ था।"],
    [1,"un","lock","लॉक","ताला","fastener","unlock","अनलॉक","ताला खोलना","to open something locked","Unlock the door with this key.","इस चाबी से दरवाज़ा खोलो।"],
    [1,"un","comfortable","कंफ़र्टेबल","आरामदायक","cosy","uncomfortable","अनकंफ़र्टेबल","असहज","not comfortable, causing unease","The chair felt uncomfortable after an hour.","एक घंटे बाद कुर्सी असहज लगने लगी।"],
    [1,"un","certain","सर्टेन","निश्चित","sure","uncertain","अनसर्टेन","अनिश्चित","not sure or certain","The future of the project is uncertain.","परियोजना का भविष्य अनिश्चित है।"],
    [1,"un","aware","अवेयर","सजग","conscious","unaware","अनअवेयर","अनजान","not knowing about something","She was unaware of the new rule.","वह नए नियम से अनजान थी।"],
    [1,"un","common","कॉमन","आम","usual","uncommon","अनकॉमन","असामान्य","not common, rare","Snow is uncommon in this region.","इस क्षेत्र में बर्फ़ असामान्य है।"],
    [1,"un","expected","एक्सपेक्टेड","अपेक्षित","anticipated","unexpected","अनएक्सपेक्टेड","अप्रत्याशित","not expected, surprising","We had an unexpected guest today.","आज हमारे यहाँ एक अप्रत्याशित मेहमान आए।"],
    [1,"un","limited","लिमिटेड","सीमित","restricted","unlimited","अनलिमिटेड","असीमित","without any limit","This plan offers unlimited calls.","यह प्लान असीमित कॉल देता है।"],
    [1,"un","natural","नैचुरल","प्राकृतिक","organic","unnatural","अननैचुरल","अस्वाभाविक","not natural, forced","His smile looked unnatural in the photo.","फ़ोटो में उसकी मुस्कान अस्वाभाविक लग रही थी।"],
    [1,"un","official","ऑफ़िशियल","आधिकारिक","formal","unofficial","अनऑफ़िशियल","अनाधिकारिक","not official or formal","This is only an unofficial estimate.","यह केवल एक अनाधिकारिक अनुमान है।"],
    [1,"un","usual","यूज़ुअल","सामान्य","normal","unusual","अनयूज़ुअल","विचित्र, असाधारण","not usual, out of the ordinary","It is unusual for him to be late.","उसका देर से आना असाधारण है।"],

    /* ---------------- LEVEL 2 · DIS- (13) ---------------- */
    [2,"dis","agree","अग्री","सहमत होना","concur","disagree","डिसअग्री","असहमत होना","to not agree","I disagree with that decision.","मैं उस फ़ैसले से असहमत हूँ।"],
    [2,"dis","like","लाइक","पसंद करना","favour","dislike","डिसलाइक","नापसंद करना","to not like something","She does not dislike the plan, just the timing.","उसे योजना नापसंद नहीं, सिर्फ़ समय पसंद नहीं है।"],
    [2,"dis","appear","अपियर","दिखाई देना","show up","disappear","डिसअपियर","गायब हो जाना","to go out of sight","The sun disappeared behind the clouds.","सूरज बादलों के पीछे गायब हो गया।"],
    [2,"dis","honest","ऑनेस्ट","ईमानदार","truthful","dishonest","डिसऑनेस्ट","बेईमान","not honest, deceitful","Cheating in the exam is dishonest.","परीक्षा में नकल करना बेईमानी है।"],
    [2,"dis","connect","कनेक्ट","जोड़ना","link","disconnect","डिसकनेक्ट","संपर्क तोड़ना","to break a connection","Disconnect the charger before travelling.","यात्रा से पहले चार्जर काट दें।"],
    [2,"dis","obey","ओबे","आज्ञा मानना","comply","disobey","डिसओबे","आज्ञा न मानना","to not follow an order or rule","Soldiers cannot disobey their commander.","सैनिक अपने कमांडर की आज्ञा नहीं टाल सकते।"],
    [2,"dis","trust","ट्रस्ट","भरोसा","confidence","distrust","डिसट्रस्ट","अविश्वास","a lack of trust in someone","Years of lies led to deep distrust.","वर्षों के झूठ ने गहरे अविश्वास को जन्म दिया।"],
    [2,"dis","comfort","कंफ़र्ट","आराम","ease","discomfort","डिसकंफ़र्ट","बेचैनी","a feeling of physical or mental unease","The tight shoes caused some discomfort.","तंग जूतों से थोड़ी बेचैनी हुई।"],
    [2,"dis","continue","कंटिन्यू","जारी रखना","proceed","discontinue","डिसकंटिन्यू","बंद कर देना","to stop doing or making something","The company will discontinue this model.","कंपनी इस मॉडल को बंद कर देगी।"],
    [2,"dis","qualify","क्वालिफ़ाई","योग्य होना","be eligible","disqualify","डिसक्वालिफ़ाई","अयोग्य ठहराना","to officially rule someone out","A false start can disqualify a runner.","गलत शुरुआत धावक को अयोग्य ठहरा सकती है।"],
    [2,"dis","respect","रिस्पेक्ट","सम्मान","regard","disrespect","डिसरिस्पेक्ट","अनादर","a lack of respect shown to someone","Shouting at elders shows disrespect.","बड़ों पर चिल्लाना अनादर दिखाता है।"],
    [2,"dis","satisfy","सैटिस्फ़ाई","संतुष्ट करना","please","dissatisfy","डिसैटिस्फ़ाई","असंतुष्ट करना","to fail to please someone","Poor service will dissatisfy customers.","खराब सेवा ग्राहकों को असंतुष्ट कर देगी।"],
    [2,"dis","advantage","एडवांटेज","लाभ","benefit","disadvantage","डिसएडवांटेज","नुकसान, हानि","a condition that causes difficulty","Being short is a disadvantage in basketball.","छोटा कद बास्केटबॉल में एक नुकसान है।"],

    /* ---------------- LEVEL 3 · RE- (13) ---------------- */
    [3,"re","do","डू","करना","perform","redo","रीडू","दोबारा करना","to do something again","Please redo this page, it has errors.","कृपया यह पन्ना दोबारा करो, इसमें गलतियाँ हैं।"],
    [3,"re","write","राइट","लिखना","compose","rewrite","रीराइट","फिर से लिखना","to write something again","I had to rewrite the whole essay.","मुझे पूरा निबंध फिर से लिखना पड़ा।"],
    [3,"re","start","स्टार्ट","शुरू करना","begin","restart","रीस्टार्ट","फिर से शुरू करना","to start again","Restart the computer and try again.","कंप्यूटर फिर से चालू करो और कोशिश करो।"],
    [3,"re","fill","फ़िल","भरना","top up","refill","रीफ़िल","फिर से भरना","to fill again","Can you refill my water bottle?","क्या आप मेरी पानी की बोतल फिर से भर सकते हैं?"],
    [3,"re","build","बिल्ड","बनाना","construct","rebuild","रीबिल्ड","फिर से बनाना","to build again after damage","The village had to rebuild after the flood.","बाढ़ के बाद गाँव को फिर से बनाना पड़ा।"],
    [3,"re","read","रीड","पढ़ना","study","reread","रीरीड","दोबारा पढ़ना","to read again","I want to reread that chapter.","मैं वह अध्याय दोबारा पढ़ना चाहता हूँ।"],
    [3,"re","pay","पे","भुगतान करना","settle","repay","रीपे","चुकाना, वापस देना","to pay money back","He promised to repay the loan soon.","उसने जल्द ही कर्ज़ चुकाने का वादा किया।"],
    [3,"re","play","प्ले","खेलना","perform","replay","रीप्ले","फिर से चलाना","to play again, especially a recording","Let's replay that video in slow motion.","आओ उस वीडियो को धीमी गति में फिर से चलाएँ।"],
    [3,"re","new","न्यू","नया","fresh","renew","रीन्यू","नवीनीकरण करना","to make valid again","You must renew your passport this year.","आपको इस साल अपना पासपोर्ट नवीनीकृत कराना होगा।"],
    [3,"re","place","प्लेस","जगह","location","replace","रीप्लेस","बदलना, स्थान लेना","to put a new thing in place of an old one","We need to replace the broken chair.","हमें टूटी हुई कुर्सी बदलनी होगी।"],
    [3,"re","view","व्यू","देखना","look at","review","रिव्यू","पुनरावलोकन करना","to look at something again carefully","Please review my answers before submitting.","जमा करने से पहले कृपया मेरे उत्तर देख लें।"],
    [3,"re","tell","टेल","बताना","narrate","retell","रीटेल","फिर से सुनाना","to tell a story again","Grandmother loves to retell old tales.","दादी को पुरानी कहानियाँ फिर से सुनाना पसंद है।"],
    [3,"re","appear","अपियर","दिखाई देना","show up","reappear","रीअपियर","फिर से प्रकट होना","to appear again after being gone","The moon reappeared from behind the clouds.","चाँद बादलों के पीछे से फिर प्रकट हुआ।"],

    /* ---------------- LEVEL 4 · PRE- (12) ---------------- */
    [4,"pre","view","व्यू","देखना","look at","preview","प्रीव्यू","पूर्वावलोकन","to see something before the main showing","We watched a preview of the new film.","हमने नई फ़िल्म का पूर्वावलोकन देखा।"],
    [4,"pre","pay","पे","भुगतान करना","settle","prepay","प्रीपे","पहले भुगतान करना","to pay before receiving something","You must prepay for the delivery.","डिलीवरी के लिए आपको पहले भुगतान करना होगा।"],
    [4,"pre","heat","हीट","गरम करना","warm","preheat","प्रीहीट","पहले से गरम करना","to heat something in advance","Preheat the oven before baking.","बेक करने से पहले ओवन को गरम कर लें।"],
    [4,"pre","school","स्कूल","विद्यालय","academy","preschool","प्रीस्कूल","बाल विद्यालय","school before regular school age","My daughter starts preschool this year.","इस साल मेरी बेटी बाल विद्यालय शुरू करेगी।"],
    [4,"pre","historic","हिस्टॉरिक","ऐतिहासिक","ancient","prehistoric","प्रीहिस्टॉरिक","प्रागैतिहासिक","belonging to a time before written history","Dinosaurs lived in prehistoric times.","डायनासोर प्रागैतिहासिक काल में रहते थे।"],
    [4,"pre","caution","कॉशन","सावधानी","care","precaution","प्रीकॉशन","एहतियात, सावधानी","a measure taken in advance to prevent harm","Wearing a helmet is a good precaution.","हेलमेट पहनना एक अच्छा एहतियात है।"],
    [4,"pre","determine","डिटरमिन","निर्धारित करना","decide","predetermine","प्रीडिटरमिन","पहले से तय करना","to decide something in advance","The route was predetermined by the guide.","रास्ता गाइड ने पहले से तय कर रखा था।"],
    [4,"pre","arrange","अरेंज","व्यवस्था करना","organise","prearrange","प्रीअरेंज","पहले से व्यवस्था करना","to arrange something beforehand","The seating was prearranged for the guests.","मेहमानों के लिए बैठने की व्यवस्था पहले से की गई थी।"],
    [4,"pre","mature","मेच्योर","परिपक्व","ripe","premature","प्रीमेच्योर","समय से पहले","happening before the natural or right time","The baby was born premature.","बच्चा समय से पहले पैदा हुआ था।"],
    [4,"pre","plan","प्लान","योजना","scheme","preplan","प्रीप्लान","पहले से योजना बनाना","to plan something well in advance","We preplanned the whole trip in detail.","हमने पूरी यात्रा की योजना पहले से बना ली थी।"],
    [4,"pre","occupy","ऑक्युपाई","व्यस्त रखना","engage","preoccupy","प्रीऑक्युपाई","व्यस्त कर देना","to fill someone's mind so much they think of little else","Exam worries preoccupied her all week.","परीक्षा की चिंता ने उसे पूरे हफ़्ते व्यस्त रखा।"],
    [4,"pre","judge","जज","आँकना","assess","prejudge","प्रीजज","पहले से राय बना लेना","to form an opinion before knowing the facts","Do not prejudge someone by their looks.","किसी को उसके रूप से पहले ही मत आँको।"],

    /* ---------------- LEVEL 5 · MIS- (12) ---------------- */
    [5,"mis","understand","अंडरस्टैंड","समझना","comprehend","misunderstand","मिसअंडरस्टैंड","गलत समझना","to understand incorrectly","Please don't misunderstand my intention.","कृपया मेरे इरादे को गलत मत समझिए।"],
    [5,"mis","spell","स्पेल","वर्तनी लिखना","write","misspell","मिसस्पेल","गलत वर्तनी लिखना","to spell a word incorrectly","He often misspells long words.","वह अक्सर लंबे शब्दों की गलत वर्तनी लिखता है।"],
    [5,"mis","lead","लीड","ले जाना","guide","mislead","मिसलीड","गुमराह करना","to give a false impression","The advertisement was designed to mislead buyers.","विज्ञापन खरीदारों को गुमराह करने के लिए बनाया गया था।"],
    [5,"mis","behave","बिहेव","व्यवहार करना","act","misbehave","मिसबिहेव","बुरा व्यवहार करना","to behave badly","The children misbehaved at the party.","पार्टी में बच्चों ने बुरा व्यवहार किया।"],
    [5,"mis","place","प्लेस","रखना","put","misplace","मिसप्लेस","गलत जगह रखना","to put something where you cannot find it","I always misplace my keys.","मैं हमेशा अपनी चाबियाँ गलत जगह रख देता हूँ।"],
    [5,"mis","judge","जज","आँकना","assess","misjudge","मिसजज","गलत अंदाज़ा लगाना","to judge someone or something wrongly","I misjudged the distance and missed the bus.","मैंने दूरी का गलत अंदाज़ा लगाया और बस छूट गई।"],
    [5,"mis","trust","ट्रस्ट","भरोसा करना","rely on","mistrust","मिसट्रस्ट","शक करना, अविश्वास","a feeling of doubt about someone","He has a deep mistrust of strangers.","उसे अजनबियों पर गहरा अविश्वास है।"],
    [5,"mis","inform","इनफ़ॉर्म","सूचित करना","tell","misinform","मिसइनफ़ॉर्म","गलत सूचना देना","to give someone false information","The report misinformed the public.","रिपोर्ट ने जनता को गलत सूचना दी।"],
    [5,"mis","manage","मैनेज","प्रबंध करना","handle","mismanage","मिसमैनेज","कुप्रबंध करना","to manage something badly","Poor leaders often mismanage funds.","कमज़ोर नेता अक्सर धन का कुप्रबंध करते हैं।"],
    [5,"mis","use","यूज़","उपयोग करना","utilise","misuse","मिसयूज़","दुरुपयोग करना","to use something in the wrong way","Do not misuse public property.","सार्वजनिक संपत्ति का दुरुपयोग मत करो।"],
    [5,"mis","match","मैच","मेल खाना","fit","mismatch","मिसमैच","बेमेल","a combination of things that do not fit well","There was a mismatch between the socks.","मोजों में बेमेल था।"],
    [5,"mis","guide","गाइड","मार्गदर्शन करना","direct","misguide","मिसगाइड","गलत मार्गदर्शन करना","to give someone poor or wrong direction","Bad advice can misguide young students.","बुरी सलाह युवा छात्रों को गलत राह दिखा सकती है।"],

    /* ---------------- LEVEL 6 · IN- / IM- / IL- / IR- (16) ---------------- */
    [6,"in","correct","करेक्ट","सही","right","incorrect","इनकरेक्ट","गलत","not correct, wrong","Two of your answers are incorrect.","आपके दो उत्तर गलत हैं।"],
    [6,"in","active","एक्टिव","सक्रिय","working","inactive","इनएक्टिव","निष्क्रिय","not active","This account has been inactive for a year.","यह खाता एक साल से निष्क्रिय है।"],
    [6,"in","visible","विज़िबल","दिखाई देने वाला","seen","invisible","इनविज़िबल","अदृश्य","not able to be seen","Germs are invisible to the naked eye.","कीटाणु नंगी आँखों से अदृश्य होते हैं।"],
    [6,"in","complete","कंप्लीट","पूरा","whole","incomplete","इनकंप्लीट","अधूरा","not finished, partial","The report is still incomplete.","रिपोर्ट अभी भी अधूरी है।"],
    [6,"im","possible","पॉसिबल","संभव","achievable","impossible","इम्पॉसिबल","असंभव","not possible","Nothing is impossible with practice.","अभ्यास से कुछ भी असंभव नहीं है।"],
    [6,"im","patient","पेशेंट","धैर्यवान","tolerant","impatient","इम्पेशेंट","अधीर","not patient, restless","The children grew impatient during the wait.","इंतज़ार के दौरान बच्चे अधीर हो गए।"],
    [6,"im","mature","मेच्योर","परिपक्व","ripe","immature","इम्मेच्योर","अपरिपक्व","not fully grown or sensible","That was an immature way to react.","वह प्रतिक्रिया देने का अपरिपक्व तरीका था।"],
    [6,"im","polite","पोलाइट","विनम्र","courteous","impolite","इम्पोलाइट","असभ्य","not polite, rude","It is impolite to interrupt someone.","किसी की बात काटना असभ्य है।"],
    [6,"il","legal","लीगल","कानूनी","lawful","illegal","इललीगल","गैरकानूनी","not allowed by law","Parking here is illegal.","यहाँ पार्किंग करना गैरकानूनी है।"],
    [6,"il","legible","लेजिबल","पढ़ने योग्य","readable","illegible","इललेजिबल","अपठनीय","not clear enough to read","His handwriting is almost illegible.","उसकी लिखावट लगभग अपठनीय है।"],
    [6,"il","literate","लिटरेट","साक्षर","educated","illiterate","इललिटरेट","अनपढ़, निरक्षर","not able to read or write","The programme helps illiterate adults learn to read.","यह कार्यक्रम निरक्षर वयस्कों को पढ़ना सिखाने में मदद करता है।"],
    [6,"il","logical","लॉजिकल","तार्किक","reasonable","illogical","इललॉजिकल","अतार्किक","not logical or reasonable","His argument seemed illogical to everyone.","उसका तर्क सबको अतार्किक लगा।"],
    [6,"ir","regular","रेगुलर","नियमित","routine","irregular","इर्रेगुलर","अनियमित","not regular, uneven","His work hours are quite irregular.","उसके काम के घंटे काफ़ी अनियमित हैं।"],
    [6,"ir","responsible","रिस्पॉन्सिबल","ज़िम्मेदार","accountable","irresponsible","इर्रिस्पॉन्सिबल","गैर-ज़िम्मेदार","not responsible, careless","Driving fast near a school is irresponsible.","स्कूल के पास तेज़ गाड़ी चलाना गैर-ज़िम्मेदाराना है।"],
    [6,"ir","relevant","रेलिवेंट","प्रासंगिक","related","irrelevant","इर्रेलिवेंट","अप्रासंगिक","not connected to the matter at hand","That question is irrelevant to our topic.","वह सवाल हमारे विषय से अप्रासंगिक है।"],
    [6,"ir","rational","रैशनल","तर्कसंगत","sensible","irrational","इर्रैशनल","अतार्किक, अविवेकी","not based on clear reasoning","Fear can lead to irrational decisions.","डर अतार्किक फ़ैसलों की ओर ले जा सकता है।"],

    /* ---------------- LEVEL 7 · NON- / OVER- / UNDER- (15) ---------------- */
    [7,"non","fiction","फ़िक्शन","कल्पित कथा","story","nonfiction","नॉनफ़िक्शन","तथ्यात्मक साहित्य","writing based on facts, not imagination","She prefers nonfiction over novels.","वह उपन्यासों से ज़्यादा तथ्यात्मक किताबें पसंद करती है।"],
    [7,"non","stop","स्टॉप","रुकना","halt","nonstop","नॉनस्टॉप","लगातार, बिना रुके","without stopping or pausing","We took a nonstop flight to Delhi.","हमने दिल्ली के लिए लगातार उड़ान भरने वाली फ़्लाइट ली।"],
    [7,"non","sense","सेंस","समझ","meaning","nonsense","नॉनसेंस","बकवास, अर्थहीन बात","words or ideas that have no meaning","He is talking complete nonsense.","वह बिल्कुल बकवास बोल रहा है।"],
    [7,"non","violent","वायलेंट","हिंसक","aggressive","nonviolent","नॉनवायलेंट","अहिंसक","not using force or violence","Gandhi led a nonviolent movement.","गांधी ने एक अहिंसक आंदोलन चलाया।"],
    [7,"non","profit","प्रॉफ़िट","लाभ","earning","nonprofit","नॉनप्रॉफ़िट","गैर-लाभकारी","not existing to make money","She works for a nonprofit organisation.","वह एक गैर-लाभकारी संस्था में काम करती है।"],
    [7,"over","eat","ईट","खाना","consume","overeat","ओवरईट","ज़्यादा खाना","to eat more than needed","Do not overeat at festival dinners.","त्योहार के खाने में ज़्यादा मत खाओ।"],
    [7,"over","sleep","स्लीप","सोना","rest","oversleep","ओवरस्लीप","देर तक सो जाना","to sleep longer than intended","I overslept and missed the bus.","मैं देर तक सो गया और बस छूट गई।"],
    [7,"over","load","लोड","भार","weight","overload","ओवरलोड","अधिक भार डालना","to load with too much","Do not overload the small cart.","छोटी गाड़ी पर अधिक भार मत डालो।"],
    [7,"over","work","वर्क","काम","labour","overwork","ओवरवर्क","अत्यधिक काम करना","to work too much or too hard","Do not overwork yourself before the exam.","परीक्षा से पहले खुद को अत्यधिक काम में मत झोंको।"],
    [7,"over","confident","कॉन्फ़िडेंट","आत्मविश्वासी","assured","overconfident","ओवरकॉन्फ़िडेंट","अति आत्मविश्वासी","too sure of oneself","Being overconfident can lead to careless mistakes.","अति आत्मविश्वास लापरवाह गलतियों की वजह बन सकता है।"],
    [7,"under","cook","कुक","पकाना","prepare","undercook","अंडरकुक","कम पकाना","to cook less than needed","Undercooked rice is hard to digest.","कम पका हुआ चावल पचाना मुश्किल होता है।"],
    [7,"under","pay","पे","भुगतान करना","compensate","underpay","अंडरपे","कम भुगतान करना","to pay less than deserved","Workers should not be underpaid.","मज़दूरों को कम भुगतान नहीं करना चाहिए।"],
    [7,"under","estimate","एस्टिमेट","अनुमान लगाना","assess","underestimate","अंडरएस्टिमेट","कम आँकना","to judge something as smaller or less than it is","Never underestimate your own ability.","अपनी क्षमता को कभी कम मत आँको।"],
    [7,"under","ground","ग्राउंड","ज़मीन","land","underground","अंडरग्राउंड","भूमिगत","below the surface of the ground","The pipes run underground.","पाइप भूमिगत बिछे हैं।"],
    [7,"under","weight","वेट","वज़न","mass","underweight","अंडरवेट","कम वज़न वाला","having less than the normal or healthy weight","The doctor said the baby was underweight.","डॉक्टर ने कहा कि बच्चे का वज़न कम है।"],

    /* ---------------- LEVEL 8 · ANTI- / AUTO- / SUPER- / TRANS- (16) ---------------- */
    [8,"anti","clockwise","क्लॉकवाइज़","घड़ी की दिशा में","forward-turning","anticlockwise","एंटीक्लॉकवाइज़","घड़ी की उलटी दिशा में","moving opposite to clock hands","Turn the cap anticlockwise to open it.","खोलने के लिए ढक्कन को घड़ी की उलटी दिशा में घुमाओ।"],
    [8,"anti","social","सोशल","सामाजिक","friendly","antisocial","एंटीसोशल","समाज-विरोधी","avoiding or against normal social contact","Staring at your phone all evening is antisocial.","पूरी शाम फ़ोन में लगे रहना समाज-विरोधी व्यवहार है।"],
    [8,"anti","biotic","बायोटिक","जैविक","organic","antibiotic","एंटीबायोटिक","रोगाणुरोधी दवा","a medicine that fights bacterial infection","The doctor gave her an antibiotic for the infection.","डॉक्टर ने संक्रमण के लिए उसे रोगाणुरोधी दवा दी।"],
    [8,"anti","freeze","फ़्रीज़","जमना","icing up","antifreeze","एंटीफ़्रीज़","हिमरोधी द्रव","a liquid added to stop water from freezing","Add antifreeze to the car before winter.","सर्दियों से पहले कार में हिमरोधी द्रव डालें।"],
    [8,"auto","mobile","मोबाइल","चलायमान","moving","automobile","ऑटोमोबाइल","स्वचालित वाहन","a self-powered road vehicle","The automobile industry is growing fast.","वाहन उद्योग तेज़ी से बढ़ रहा है।"],
    [8,"auto","graph","ग्राफ़","हस्ताक्षर लेख","signature","autograph","ऑटोग्राफ़","स्वहस्ताक्षर","a person's own signature, often of a celebrity","Fans lined up for the actor's autograph.","प्रशंसक अभिनेता के स्वहस्ताक्षर के लिए कतार में लगे।"],
    [8,"auto","biography","बायोग्राफ़ी","जीवनी","life story","autobiography","ऑटोबायोग्राफ़ी","आत्मकथा","the story of a person's life written by themself","She is writing her autobiography this year.","वह इस साल अपनी आत्मकथा लिख रही है।"],
    [8,"auto","pilot","पायलट","विमानचालक","flier","autopilot","ऑटोपायलट","स्वचालित नियंत्रण","a system that steers a vehicle without a human","The plane switched to autopilot over the ocean.","समुद्र के ऊपर विमान स्वचालित नियंत्रण पर चला गया।"],
    [8,"super","market","मार्केट","बाज़ार","store","supermarket","सुपरमार्केट","बड़ा बाज़ार","a large store selling many goods","We buy groceries from the supermarket.","हम किराना सामान सुपरमार्केट से खरीदते हैं।"],
    [8,"super","human","ह्यूमन","मानव","person","superhuman","सुपरह्यूमन","अलौकिक शक्ति वाला","having power beyond normal human ability","He showed superhuman strength that day.","उस दिन उसने असाधारण शक्ति दिखाई।"],
    [8,"super","star","स्टार","तारा","celebrity","superstar","सुपरस्टार","महातारा, बड़ा सितारा","an extremely famous performer","The whole stadium cheered for the superstar.","पूरा स्टेडियम उस बड़े सितारे के लिए जयकार कर उठा।"],
    [8,"super","power","पॉवर","शक्ति","strength","superpower","सुपरपॉवर","महाशक्ति","a very powerful and influential nation","India is becoming a major economic superpower.","भारत एक बड़ी आर्थिक महाशक्ति बनता जा रहा है।"],
    [8,"trans","port","पोर्ट","बंदरगाह","harbour","transport","ट्रांसपोर्ट","परिवहन","to carry goods or people from one place to another","Trucks transport goods across the country.","ट्रक देश भर में सामान ले जाते हैं।"],
    [8,"trans","form","फ़ॉर्म","रूप","shape","transform","ट्रांसफ़ॉर्म","पूरी तरह बदलना","to change completely in form or appearance","Education can transform a person's life.","शिक्षा किसी व्यक्ति का जीवन पूरी तरह बदल सकती है।"],
    [8,"trans","plant","प्लांट","पौधा","sapling","transplant","ट्रांसप्लांट","प्रत्यारोपण करना","to move a plant or organ to a new place","Doctors performed a kidney transplant.","डॉक्टरों ने किडनी प्रत्यारोपण किया।"],
    [8,"trans","action","एक्शन","कार्य","deed","transaction","ट्रांज़ैक्शन","लेन-देन","an instance of buying or selling something","The bank confirmed the transaction.","बैंक ने लेन-देन की पुष्टि की।"]
  ];

  var LEVEL_KEY = { 1:"un", 2:"dis", 3:"re", 4:"pre", 5:"mis", 6:"in", 7:"non", 8:"anti" };

  var PREFIX_INFO = [
    { key:"un",    display:"UN-",    level:1, meaningEn:"not / opposite of",       meaningHi:"नहीं / विपरीत अर्थ" },
    { key:"dis",   display:"DIS-",   level:2, meaningEn:"not / reverse of",        meaningHi:"नहीं / उलटा" },
    { key:"re",    display:"RE-",    level:3, meaningEn:"again",                   meaningHi:"फिर से, दोबारा" },
    { key:"pre",   display:"PRE-",   level:4, meaningEn:"before",                  meaningHi:"पहले" },
    { key:"mis",   display:"MIS-",   level:5, meaningEn:"wrongly / badly",         meaningHi:"गलत तरीके से" },
    { key:"in",    display:"IN-",    level:6, meaningEn:"not",                     meaningHi:"नहीं" },
    { key:"im",    display:"IM-",    level:6, meaningEn:"not",                     meaningHi:"नहीं" },
    { key:"il",    display:"IL-",    level:6, meaningEn:"not",                     meaningHi:"नहीं" },
    { key:"ir",    display:"IR-",    level:6, meaningEn:"not",                     meaningHi:"नहीं" },
    { key:"non",   display:"NON-",   level:7, meaningEn:"not",                     meaningHi:"नहीं" },
    { key:"over",  display:"OVER-",  level:7, meaningEn:"too much",                meaningHi:"बहुत अधिक" },
    { key:"under", display:"UNDER-", level:7, meaningEn:"too little / below",      meaningHi:"बहुत कम, नीचे" },
    { key:"anti",  display:"ANTI-",  level:8, meaningEn:"against",                 meaningHi:"के विरुद्ध" },
    { key:"auto",  display:"AUTO-",  level:8, meaningEn:"self",                    meaningHi:"स्वयं" },
    { key:"super", display:"SUPER-", level:8, meaningEn:"above / beyond normal",   meaningHi:"ऊपर, असाधारण" },
    { key:"trans", display:"TRANS-", level:8, meaningEn:"across / change",         meaningHi:"पार, परिवर्तन" }
  ];

  var LEVEL_INFO = [
    { level:1, titleEn:"UN-",    titleHi:"UN-",    prefixes:["un"] },
    { level:2, titleEn:"DIS-",   titleHi:"DIS-",   prefixes:["dis"] },
    { level:3, titleEn:"RE-",    titleHi:"RE-",    prefixes:["re"] },
    { level:4, titleEn:"PRE-",   titleHi:"PRE-",   prefixes:["pre"] },
    { level:5, titleEn:"MIS-",   titleHi:"MIS-",   prefixes:["mis"] },
    { level:6, titleEn:"IN- / IM- / IL- / IR-", titleHi:"IN- / IM- / IL- / IR-", prefixes:["in","im","il","ir"] },
    { level:7, titleEn:"NON- / OVER- / UNDER-", titleHi:"NON- / OVER- / UNDER-", prefixes:["non","over","under"] },
    { level:8, titleEn:"ANTI- / AUTO- / SUPER- / TRANS-", titleHi:"ANTI- / AUTO- / SUPER- / TRANS-", prefixes:["anti","auto","super","trans"] }
  ];

  HPM.WORDS = ROWS.map(function (r, i) {
    return {
      id: i, level: r[0], prefix: r[1],
      root: r[2], rootPron: r[3], rootMeaningHi: r[4], rootMeaningEn: r[5],
      word: r[6], wordPron: r[7], wordMeaningHi: r[8], wordMeaningEn: r[9],
      exampleEn: r[10], exampleHi: r[11]
    };
  });

  HPM.PREFIX_INFO = PREFIX_INFO;
  HPM.LEVEL_INFO = LEVEL_INFO;
  HPM.LEVEL_KEY = LEVEL_KEY;
  HPM.TOTAL_LEVELS = LEVEL_INFO.length;

  HPM.prefixInfo = function (key) {
    for (var i = 0; i < PREFIX_INFO.length; i++) if (PREFIX_INFO[i].key === key) return PREFIX_INFO[i];
    return null;
  };
  HPM.wordsForLevel = function (level) {
    return HPM.WORDS.filter(function (w) { return w.level === level; });
  };
})(typeof window !== "undefined" ? (window.HPM = window.HPM || {}) : (global.HPM = global.HPM || {}));
