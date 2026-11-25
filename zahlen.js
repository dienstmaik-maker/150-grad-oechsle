// 150 Grad Öchsle: Zahlen. Alle Konstanten und Tabellen des Spiels. Seit 13.1 eigene Datei, vorher in index.html.
// Lädt vor kern.js und oberflaeche.js, alle Namen sind global.
'use strict';
/* ================= Daten ================= */
const MON=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const SORTEN={
  riesling:{name:'Riesling',farbe:'weiss',ertrag:4,zucker:0,preis:6,minL:18,maxL:360,q:10,reife:.12,sektStar:true},
  mueller:{name:'Müller-Thurgau',farbe:'weiss',ertrag:5.6,zucker:-4,preis:3,minL:6,maxL:96,q:3,reife:.05},
  silvaner:{name:'Silvaner',farbe:'weiss',ertrag:5,zucker:-2,preis:4,minL:6,maxL:120,q:5,reife:.07},
  spaetb:{name:'Spätburgunder',farbe:'rot',ertrag:3.8,zucker:2,preis:5.5,minL:12,maxL:180,q:8,reife:.10,sektStar:true},
  portug:{name:'Portugieser',farbe:'rot',ertrag:6,zucker:-5,preis:2.8,minL:3,maxL:48,q:2,reife:.04},
  troll:{name:'Trollinger',farbe:'rot',ertrag:5.6,zucker:-3,preis:3.2,minL:6,maxL:60,q:3,reife:.05}
};
// Version 11.4: Rebsorten in drei Rollen, nur in neuen Partien (S.rollen). Jedes Gebiet hat eine Menge-Sorte (ab Start), eine Sekt-Sorte (ab R_SORTE2)
// und eine Spitzen-Sorte (ab R_SORTE3). Die Sorten einer Rolle haben dieselben Werte und unterscheiden sich nur in Name und Farbe,
// gemessen werden also drei Profile statt 15 Sorten. Menge startet mit den Werten des alten Müller-Thurgau, Spitze mit denen des alten Rieslings,
// die Sekt-Sorte liegt dazwischen und ist als einzige Sekt-Star. Die sechs alten Sorten oben bleiben für Spielstände von vor 11.4 unberührt.
const ROLLEN={
  menge:{name:'Menge-Sorte',satz:'trägt viel und ist früh verkaufsreif',ertrag:5.6,zucker:-4,preis:3,minL:6,maxL:96,q:3,reife:.05},
  sekt:{name:'Sekt-Sorte',satz:'gibt den Regional-Sekt',ertrag:4.8,zucker:-2,preis:4.5,minL:9,maxL:144,q:6,reife:.08,sektStar:true},
  spitze:{name:'Spitzen-Sorte',satz:'trägt wenig, bringt die beste Qualität und reift lange',ertrag:4,zucker:0,preis:6,minL:18,maxL:360,q:10,reife:.12}
};
// 17 neue Kennungen für 15 Namen (Riesling und Silvaner gibt es in zwei Rollen). Kennungen nie umbenennen, sie stehen in Spielständen und ab 11.4 im Album.
const SORTEN_ROLLEN={
  me_mueller:['menge','Müller-Thurgau','weiss'],me_weissb:['menge','Weißburgunder','weiss'],me_silvaner:['menge','Silvaner','weiss'],me_dornf:['menge','Dornfelder','rot'],me_troll:['menge','Trollinger','rot'],
  se_elbling:['sekt','Elbling','weiss'],se_riesling:['sekt','Riesling','weiss'],se_graub:['sekt','Grauburgunder','weiss'],se_chard:['sekt','Chardonnay','weiss'],se_bacchus:['sekt','Bacchus','weiss'],se_schwarzr:['sekt','Schwarzriesling','rot'],
  sp_riesling:['spitze','Riesling','weiss'],sp_spaetb:['spitze','Spätburgunder','rot'],sp_scheu:['spitze','Scheurebe','weiss'],sp_gewuerz:['spitze','Gewürztraminer','weiss'],sp_silvaner:['spitze','Silvaner','weiss'],sp_lemb:['spitze','Lemberger','rot']
};
// Schalter für die Messung: 1 = neue Partien bekommen die Rollen. Mit 0 startet auch ein neues Spiel mit den alten Sorten (Lauf s114_alt).
const ROLLEN_NEU=1;
// Seit 13.3.1 (Bauplan 13.3, Maik 21.11.2026): eine Öchsle-Tabelle für alle sechs Gebiete. Der feste Wärme-Zuschlag warm wirkt nicht mehr,
// weder auf das Öchsle im Juni noch auf die Temperatur. warm bleibt nur als Schild (gebietArt: Warm, Mitte, Kühl). Das Wetter von Jahr zu Jahr bleibt.
const MIN_NORMAL={tafel:50,qba:60,kab:75,spat:85,aus:95,ba:125,tba:150};
// Boni je Gebiet, ohne Eintrag gilt 1 oder 0: preisF (Faktor auf jeden Preis), wettPlus (Punkte bei Wettbewerben),
// seit 6.0 (Schritt 3) ertragF (Faktor auf die Lese-Menge) und sektPreisF (Faktor auf den Sekt-Preis). Steckbrief und Gegner rechnen sie mit (regionF).
// Seit 13.4.1 (Bauplan 13.4, Maik 21.11.2026): jedes Gebiet hat einen Weg und genau eine Stärke und ein Problem. edelF, edelSpatF, edelAus und frost sind weg.
// weg ist der eigene Weg im Herbst der Spitzen-Sorte: edel (warm, Edelfäulnis bis November), frost (kühl, Eiswein bis Dezember), beide (Mitte, mit Tendenz).
// Neu dazu: aukPreisF (Faktor auf Startgebot und Gebote bei Auktionen), reifeF (Faktor auf den Wertzuwachs in der Flasche), festF (Faktor auf das Ansehen
// aus Festen), handLohnF (Faktor auf den Lohn der Erntehelfer, die von Hand lesen), aukF (Faktor auf die Chance einer Auktion).
// Seit 13.5.5 (Bauplan 13.5, Maik 21.11.2026): steil:1 heißt, Erntemaschine und Vollernter fahren dort nicht (Mosel). Düngerstreuer, Laubschneider und Abfüllanlage gehen überall.
// Der Aufschlag auf den Lohn der Handlese (handLohnF) steht an der Mosel seitdem neutral auf 1, sonst wäre sie doppelt bestraft. Die Konstante bleibt als Stellschraube für 14.2. spiel ist der Satz zur Spielweise, erst der Hinweis für die erste Partie.
const REGIONEN={
  mosel:{name:'Mosel',sorten:['riesling','mueller','spaetb'],warm:0,weg:'beide',wettPlus:3,handLohnF:1,steil:1,text:'Steile Schieferhänge, Riesling-Land. Steillagen-Ruf: Bei Wettbewerben zählt jeder Wein 3 Punkte mehr.',min:MIN_NORMAL},
  rheingau:{name:'Rheingau',sorten:['riesling','spaetb','silvaner'],warm:0,weg:'beide',preisF:1.1,aukF:.7,text:'Berühmtes Riesling-Land: Jeder Wein bringt 10 % mehr Geld.',min:MIN_NORMAL},
  rheinhessen:{name:'Rheinhessen',sorten:['mueller','silvaner','portug'],warm:3,weg:'edel',aukPreisF:.8,text:'Warmes Silvaner-Land: Land ist hier günstig, Eiswein selten.',min:MIN_NORMAL},
  pfalz:{name:'Pfalz',sorten:['riesling','mueller','portug'],warm:3,weg:'edel',ertragF:1.1,text:'Warm mit milden Wintern: Die Reben tragen mehr, Eiswein gibt es selten.',min:MIN_NORMAL},
  franken:{name:'Franken',sorten:['silvaner','mueller','spaetb'],warm:-10,weg:'frost',reifeF:1.25,text:'Kühle Silvaner-Heimat mit kalten Wintern, Eiswein-Land. Der Wein gewinnt in der Flasche schneller an Wert.',min:MIN_NORMAL},
  wuerttemberg:{name:'Württemberg',sorten:['troll','riesling','spaetb'],warm:-10,weg:'frost',festF:1.5,text:'Kühles Rotwein-Land mit Trollinger und kalten Wintern, Eiswein-Land. Feste bringen hier mehr Ansehen.',min:MIN_NORMAL}
};
// Version 7.0 (Schritt I): Texte für den Steckbrief. stufe aus den Messungen von Schritt H (Präsident auf Mittel in der Mitte: Rheinhessen und Pfalz
// um Jahr 100, Rheingau und Mosel 108 bis 122, Franken und Württemberg 116 bis 117 mit großer Streuung und weniger Geld). Franken und Württemberg
// sind nach Maiks Wunsch die riskanten Eiswein-Gebiete für Könner. stil ist das Spielstil-Schild, sekt das Sekt-Potenzial (1 bis 3 Flaschen),
// lohnt und strat (zwei bis drei Schritte) stehen im Steckbrief bei "Neues Spiel" und unter "Dein Gebiet".
// Seit 13.4.1: Die Schilder leicht, mittel, riskant (stufe, stil, GEBIET_STUFE) sind weg. spiel ist der Satz zur Spielweise aus dem Bauauftrag,
// erst der Hinweis bei der Gebietswahl. Wortlaut seit 13.8, ebenso lohnt und strat.
const GEBIET_TEXT={
  mosel:{spiel:'Über Wettbewerbe gewinnen',sekt:3,lohnt:'Auf Wettbewerbe und Riesling-Auslese setzen, Sekt in kühlen Jahren',
    strat:['Riesling braucht lange im Keller, die ersten Jahre sind knapp. Federweißer bringt im Herbst schnelles Geld für den Notfall.','Gute Weine zum Wettbewerb: Der Steillagen-Ruf bringt jedem Wein 3 Punkte mehr.','Ab Winzer Sekt aus Riesling machen, er ist ein Sekt-Star.']},
  rheingau:{spiel:'Teuer verkaufen',sekt:3,lohnt:'Auf den Verkauf setzen, Riesling darf lange reifen',
    strat:['Riesling braucht lange im Keller, die ersten Jahre sind knapp. Nicht zu viel Land auf einmal kaufen.','Jeder Wein bringt 10 % mehr, lange Reife lohnt sich hier besonders.','Spätburgunder kommt schon als Jungwinzer, mit dem Riesling hast du zwei Sekt-Stars.']},
  rheinhessen:{spiel:'Schnell wachsen',sekt:1,lohnt:'Auf Edelfäulnis und große Mengen setzen',
    strat:['Silvaner bringt schon nach 6 Monaten Geld, der Start ist entspannt.','Im Herbst ruhig länger hängen lassen: mehr Zucker und öfter Edelfäulnis machen Auslese und Beerenauslese leicht.','Sekt nur nebenbei, hier wächst keine Sekt-Star-Sorte.']},
  pfalz:{spiel:'Viel ernten und verkaufen',erst:'Empfohlen für die erste Partie',sekt:2,lohnt:'Auf Edelfäulnis pokern, Riesling als Sekt',
    strat:['Riesling braucht lange im Keller, die ersten Jahre sind knapp. Federweißer hilft im Herbst über die Runden.','Warm und sonnig: Edelfäulnis kommt oft, edelsüße Weine gelingen hier am leichtesten.','Eiswein gibt es fast nie, dafür verzeiht die Pfalz viele Wege.']},
  franken:{spiel:'Flaschen liegen lassen',sekt:1,lohnt:'Auf Eiswein pokern',
    strat:['Kalte Winter: Im Dezember friert es hier oft, das ist die Chance auf Eiswein.','Bei Edelfäulnis im Herbst ein Feld hängen lassen und auf Frost im Dezember hoffen. Eiswein bringt hier am meisten.','Für Könner: Franken bringt weniger Geld als die anderen Gebiete, jeder Fehler wiegt schwerer.']},
  wuerttemberg:{spiel:'Feste feiern',sekt:2,lohnt:'Auf Rotwein setzen, Eiswein nur gezielt',
    strat:['Trollinger trägt viel und ist nach 6 Monaten verkaufsreif, damit kommt am Anfang Geld rein.','Eiswein nur mit Riesling oder Spätburgunder versuchen, den Trollinger lieber rechtzeitig lesen.','Für Könner: Württemberg bringt weniger Geld als die warmen Gebiete, jeder Fehler wiegt schwerer.']}
};
// Version 11.4: Sorten nach Rollen je Gebiet (Menge, Sekt, Spitze, in dieser Reihenfolge kommen sie auch) und die zweite Fassung von lohnt und strat.
// REGIONEN_ROLLEN erbt alles andere vom Gebiet, eine umgestellte Zahl in REGIONEN gilt also für beide.
const GEBIET_ROLLEN={
  mosel:{sorten:['me_mueller','se_elbling','sp_riesling'],lohnt:'Auf Wettbewerbe setzen, gelesen wird von Hand',
    strat:['Müller-Thurgau trägt viel und ist nach 6 Monaten verkaufsreif, damit kommt am Anfang Geld rein.','In der Steillage fährt keine Maschine, plane rechtzeitig Erntehelfer ein. Dafür zählt bei Wettbewerben jeder Wein 3 Punkte mehr.','Der Elbling kommt als Weingutsbesitzer für den Sekt, der Riesling als Gutsherr auf den Südhang. Im Herbst hast du später beide Wege, der Winzerbote sagt, welcher besser ist.']},
  rheingau:{sorten:['me_weissb','se_riesling','sp_spaetb'],lohnt:'Teuer verkaufen, jedes Stück Land zählt',
    strat:['Weißburgunder trägt viel und ist nach 6 Monaten verkaufsreif, der Start ist entspannt.','Jeder Wein bringt 10 % mehr. Auktionen sind selten, also biete mit, wenn eine kommt.','Der Riesling kommt als Weingutsbesitzer für den Sekt, der Spätburgunder als Gutsherr auf den Südhang. Im Herbst hast du später beide Wege, der Winzerbote sagt, welcher besser ist.']},
  rheinhessen:{sorten:['me_silvaner','se_graub','sp_scheu'],lohnt:'Schnell wachsen, Land ist hier günstig',
    strat:['Silvaner trägt viel und bringt schon nach 6 Monaten Geld, der Start ist entspannt.','Land ist bei Auktionen 20 % günstiger. Kauf zu, sooft es geht.','Der Grauburgunder kommt als Weingutsbesitzer für den Sekt, die Scheurebe als Gutsherr auf den Südhang. Im warmen Herbst wartest du auf Edelfäulnis, Eiswein gibt es nur in einem harten Winter.']},
  pfalz:{sorten:['me_dornf','se_chard','sp_gewuerz'],lohnt:'Viel ernten und verkaufen',
    strat:['Dornfelder trägt viel und ist nach 6 Monaten verkaufsreif, damit kommt am Anfang Geld rein.','Die Reben tragen hier 10 % mehr. Also viel lesen und viel verkaufen.','Der Chardonnay kommt als Weingutsbesitzer für den Sekt, der Gewürztraminer als Gutsherr auf den Südhang. Im warmen Herbst wartest du auf Edelfäulnis, Eiswein gibt es nur in einem harten Winter.']},
  franken:{sorten:['me_mueller','se_bacchus','sp_silvaner'],lohnt:'Flaschen liegen lassen, auf Eiswein warten',
    strat:['Müller-Thurgau trägt viel und ist nach 6 Monaten verkaufsreif, damit kommt am Anfang Geld rein.','Wein gewinnt hier in der Flasche schneller an Wert. Wer nicht alles gleich verkauft, verdient später mehr.','Der Bacchus kommt als Weingutsbesitzer für den Sekt, der Silvaner als Gutsherr auf den Südhang. Im kalten Herbst wartest du auf Eiswein, Edelfäulnis gibt es nur in einem goldenen Herbst.']},
  wuerttemberg:{sorten:['me_troll','se_schwarzr','sp_lemb'],lohnt:'Feste feiern, auf Eiswein warten',
    strat:['Trollinger trägt viel und ist nach 6 Monaten verkaufsreif, damit kommt am Anfang Geld rein.','Feste bringen hier die Hälfte mehr Ansehen. Weinfest und Hoffest lohnen sich jedes Jahr.','Der Schwarzriesling kommt als Weingutsbesitzer für den Sekt, der Lemberger als Gutsherr auf den Südhang. Im kalten Herbst wartest du auf Eiswein, Edelfäulnis gibt es nur in einem goldenen Herbst.']}
};
const REGIONEN_ROLLEN={};
for(const r of Object.keys(REGIONEN)) REGIONEN_ROLLEN[r]=Object.assign(Object.create(REGIONEN[r]),{sorten:GEBIET_ROLLEN[r].sorten});
// Eignung der Rebsorte im Gebiet: 1 = sehr gut, .85 = gut, .7 = geht noch. Wirkt als Faktor auf die Qualitätspunkte.
const EIGNUNG={mosel:{riesling:1,mueller:.85,spaetb:.7},rheingau:{riesling:1,spaetb:.85,silvaner:.7},rheinhessen:{silvaner:1,mueller:.85,portug:.7},
  pfalz:{riesling:1,portug:.85,mueller:.7},franken:{silvaner:1,mueller:.85,spaetb:.7},wuerttemberg:{troll:1,riesling:.85,spaetb:.7}};
// Version 6.0 (Schritt 3): Sterne am Preis. Faktor je Stern der Sorte im Gebiet, zusätzlich zu den Qualitätspunkten, in preis, lotWert und leseWert.
// Die Gegner bekommen den Faktor für ★★★, weil sie mit ihrer besten Sorte rechnen. Neutral gestellt (1), abgestimmt wird in Schritt 4.
const STERN_PREIS_3=1, STERN_PREIS_2=1, STERN_PREIS_1=1;
// Seit 13.3.5 (Bauplan 13.3): ans ist das Ansehen bei der Anmeldung, einmal je Wein (Sorte, Jahrgang, Stufe), dazu ANS_PFLEGE und ANS_TERROIR.
const STUFEN={
  feder:{name:'Federweißer',rang:0,preis:3,qp:2,geb:0,ans:3},
  tafel:{name:'Tafelwein',rang:1,preis:2.5,qp:3,geb:0,ans:3},
  qba:{name:'Qualitätswein',rang:2,preis:4.5,qp:6,geb:0,ans:5},
  kab:{name:'Kabinett',rang:3,preis:7,qp:10,geb:60,ans:6,lese:'reif',edel:false},
  spat:{name:'Spätlese',rang:4,preis:10.5,qp:14,geb:90,ans:8,lese:'reif',edel:false},
  aus:{name:'Auslese',rang:5,preis:17,qp:18,geb:130,ans:14,lese:'reif'},
  ba:{name:'Beerenauslese',rang:6,preis:38,qp:24,geb:200,ans:22,lese:'ueber',edel:true},
  tba:{name:'Trockenbeerenauslese',rang:7,preis:75,qp:30,geb:300,ans:34,lese:'ueber',edel:true},
  eis:{name:'Eiswein',rang:8,preis:60,qp:28,geb:300,ans:28}
};
// Eiswein in drei Wertstufen nach den Öchsle bei der Lese: wie Auslese, Beerenauslese oder Trockenbeerenauslese des Gebiets.
// Angemeldet wird immer als Eiswein, f ist der Faktor auf den Preis, qp der Zuschlag auf die Qualitätspunkte.
const EIS_WERT=[{name:'Auslese',f:1,qp:0},{name:'Beerenauslese',f:1.3,qp:4},{name:'Trockenbeerenauslese',f:1.7,qp:8}];
// Seit 13.3.2 (Bauplan 13.3, Maik 21.11.2026): zwei Schlösser je Wein. Der Rang gibt ihn frei (FREI, Schlüssel wein_ und die Stufe), der Deckel muss reichen.
// Der Deckel wirkt schon übers Öchsle (oeGrenze). Wer mehr Öchsle hat, als sein Rang erlaubt, meldet die höchste erlaubte Stufe an. Die Auslese geht seitdem mit und ohne Edelfäulnis.
// WEIN_ROLLE: welche Stufen eine Rolle überhaupt machen darf. Die Menge-Sorte hat nie Edelfäulnis und keine Auslese, Auslese und höher gibt es nur von der Spitzen-Sorte.
// Die Sekt-Sorte macht keinen Stillwein, nur Sekt (seit 13.3.3, sektSorte). Sorten ohne Rolle (Messläufe mit ROLLEN_NEU=0) dürfen alles.
const WEIN_ROLLE={menge:['feder','tafel','qba','kab','spat'],sekt:[],spitze:['feder','tafel','qba','kab','spat','aus','ba','tba','eis']};
// Seit 14.4.1 (Bauplan 14.4 Zeitleiste): Ereignisse. Die Weinhandlung kommt LADEN_AB bis LADEN_BIS Jahre nach dem Gutsherrn, je Partie gewürfelt. Der Export kommt ohne Medaille
// EXPORT_SPAET Jahre nach dem Winzermeister. Die erste Auktion kommt frühestens AUK_ERST_AB und spätestens AUK_ERST_JAHRE Jahre nach dem Jungwinzer. Startwerte.
const LADEN_AB=3, LADEN_BIS=7, EXPORT_SPAET=5, AUK_ERST_AB=2;
// Seit 14.4.2 (Bauplan 14.4 Zeitleiste, Grundsatz der drei Sorten, Maik 24.11.2026): eine Tabelle für alle Freischaltungen, jede hängt an genau einer Sache.
// Leitsatz: Der Rang gibt Rechte, das Leben bringt Gelegenheiten, die Arbeit bringt Lohn. Bis 14.2 gab es dazu Rang plus Abstand, Pflegestufe (pfl) und Fläche (ha).
// 1. Am Rang: r ist der Rang (Index in RAENGE), frei ab dem Monat des Aufstiegs. bis ist der Rang, ab dem es wieder weg ist.
// 2. Verdient: tat ist eine Tat des Spielers (S.taten, tatMerk in kern.js), sie zählt einmal und bleibt (Annahme 19). qba: der erste Qualitätswein
//    (oder höher) ist angemeldet, medaille: jede Medaille bei der Landesprämierung, sekt: die erste Flasche Sekt liegt fertig im Sektkeller.
// 3. Ereignis (ev): kommt unangekündigt ab Jahre nach dem Aufstieg in den Rang r (S.rangMon). Ein ab als Liste [von, bis] wird je Partie fest gewürfelt
//    (fest Thema 14). Hat ein Ereignis auch eine Tat, kommt es mit der Tat oder spätestens als Ereignis (der Export). Der Rangtext nennt Ereignisse nicht vorab.
// Nur die Manager hängen bis zur Etappe für Köpfe und Helfer noch an Rang plus Abstand (r und ab ohne ev, Annahme 28), ihr Abstand steht weiter im Rangtext.
// name steht im Rangtext der Manager und in freiText, bote ist die Zeile im Winzerboten, wenn Verdientes, ein Ereignis oder ein Manager nach dem Abstand kommt.
// Beim Export gibt es zwei Zeilen: bote mit der Medaille, boteEv als Ereignis. Neue Zeilen sind Platzhalter, Wortlaut in Meilenstein 17.
// Beerenauslese und Eiswein kommen nur über den Weg des Gebiets im Herbst (weg_eigen), die Trockenbeerenauslese nur über das Wagnis (weg_tba), dazu der fremde Weg (weg_fremd).
// Feder-, Tafel- und Qualitätswein gelten für jede Rolle, die sie machen darf. laub_hand ist der Sommerschnitt von Hand, masch_laub nur noch die Maschine.
// hintertuer (gebaut in 14.4.6) und presse (gebaut in 14.5) sind schon angelegt.
const FREI={wein_feder:{r:0},wein_tafel:{r:0},wein_qba:{r:1},wein_kab:{r:2},wein_spat:{r:3},wein_aus:{r:7},weg_eigen:{r:7},weg_fremd:{r:8},weg_tba:{r:8},
  makler:{r:1},auktion:{r:1},spende:{r:2},auktion_oft:{r:2},land:{r:3},laub_hand:{r:3},
  sorte_sekt:{r:4},sektkeller:{r:4},weinfest:{r:4},hintertuer:{r:4},sorte_spitze:{r:6},botschafter:{r:6},bund:{r:7},hoffest:{r:7},kontrolle:{r:8},presse:{r:9},
  // Stufen der Leute: Erntehelfer am Rang, Lagerarbeiter Stufe 2 am Rang (Annahme 26), Stufe 1 und 3 verdient. Eine höhere Stufe bringt die fehlenden mit,
  // Leute fallen nie zurück (S.leuteSt). Namen und Arbeiten bleiben bis zur Etappe für Köpfe und Helfer, wie sie sind.
  helfer1:{r:1},helfer2:{r:3},helfer3:{r:5},lagerarb1:{tat:'qba'},lagerarb2:{r:2},lagerarb3:{tat:'sekt'},
  mgr_handel1:{r:2,ab:3,name:'die Handels-Managerin',bote:'🤝 Ab heute arbeitet eine Handels-Managerin für dich. Sie verkauft an den Großhandel, auch den Federweißer.'},
  mgr_handel2:{r:4,ab:3,name:'Stufe 2 für die Handels-Managerin',bote:'🤝 Deine Handels-Managerin kann jetzt mehr: Weinhandlungen und Export übernimmt sie ab sofort.'},
  mgr_handel3:{r:6,ab:4,name:'Stufe 3 für die Handels-Managerin',bote:'🤝 Das Regal füllt ab jetzt deine Handels-Managerin. Nur volle Regale verkaufen.'},
  mgr_keller1:{r:2,ab:5,name:'der Kellermeister',bote:'🍷 Ab heute arbeitet ein Kellermeister für dich. Er kauft Fassraum und stellt Lagerarbeiter ein.'},
  mgr_keller2:{r:4,ab:9,name:'Stufe 2 für den Kellermeister',bote:'🍷 Die Flaschen kauft ab jetzt dein Kellermeister. Immer mit der Ruhe, es fehlt keine mehr.'},
  mgr_keller3:{r:7,ab:7,name:'Stufe 3 für den Kellermeister',bote:'🍷 Beim Kellermeister reift der Wein jetzt schneller. Guter Wein braucht Zeit, aber weniger.'},
  mgr_weingut1:{r:2,ab:10,name:'der Weingut-Manager',bote:'🌿 Ab heute arbeitet ein Weingut-Manager für dich. Er stellt Erntehelfer und Fahrer ein.'},
  mgr_weingut2:{r:5,ab:3,name:'Stufe 2 für den Weingut-Manager',bote:'🌿 Die Maschinen lässt ab jetzt dein Weingut-Manager warten. Du musst nicht mehr dran denken.'},
  mgr_weingut3:{r:8,ab:4,name:'Stufe 3 für den Weingut-Manager',bote:'🌿 Beim Weingut-Manager nutzen sich die Maschinen jetzt weniger ab.'},
  masch_duenger:{r:2,name:'der Düngerstreuer',bote:'🚜 Neu bei den Maschinen: der Düngerstreuer. Er spart dir Helfer beim Düngen. Kaufen kannst du ihn von Januar bis März.'},
  masch_klein:{r:3},masch_abfuell:{r:3,name:'die Abfüllanlage'},masch_gross:{r:5},masch_abfuell2:{r:6,name:'der Ausbau der Abfüllanlage'},masch_laub:{r:7,name:'der Laubschneider'},
  // Die Sektanlage kommt mit dem ersten eigenen Sekt, zusammen mit Lagerarbeiter Stufe 3. Preis und Wirkung bleiben.
  sekt_anlage:{tat:'sekt',name:'die Degorgier- und Abfüllanlage im Sektkeller',bote:'🍾 Dein erster Sekt ist fertig, und gleich steht die Sektanlage bereit. Mit ihr kostet jede Flasche Sekt weniger.'},
  // Ereignisse: Export mit der ersten Medaille, sonst EXPORT_SPAET Jahre nach dem Winzermeister. Weinhandlung LADEN_AB bis LADEN_BIS Jahre nach dem Gutsherrn.
  // Die Spitzenlage kommt einmal, im ersten Auktionsmonat 10 Jahre nach dem Weinbaurat (seit 13.4.9).
  export:{tat:'medaille',r:3,ab:EXPORT_SPAET,ev:1,name:'der Exporthandel',bote:'🚢 Deine Medaille hat sich herumgesprochen: Händler aus dem Ausland fragen nach deinem Wein. Der Export ist offen, er zahlt mehr, vor allem für die guten Stufen.',
    boteEv:'🚢 Ein Händler aus dem Ausland klopft an und will deinen Wein. Der Export ist offen, er zahlt mehr, vor allem für die guten Stufen.'},
  laden:{r:5,ab:[LADEN_AB,LADEN_BIS],ev:1,name:'die eigene Weinhandlung',bote:'🏪 Ein Laden in der Stadt wird frei, und du bekommst den Schlüssel. Ab jetzt hast du eine eigene Weinhandlung, das Regal füllst du im Weinhandel.'},
  spitzenlage:{r:6,ab:10,ev:1,name:'die Spitzenlage unter dem Hammer'}};
// Wann etwas Verdientes oder ein Ereignis kommt, für freiText (Platzhalter, Wortlaut in Meilenstein 17).
const TAT_TEXT={qba:'mit deinem ersten Qualitätswein',medaille:'mit deiner ersten Medaille bei der Landesprämierung',sekt:'mit deinem ersten eigenen Sekt'};
const EV_TEXT={export:'mit deiner ersten Medaille bei der Landesprämierung, sonst irgendwann ab dem Rang {rang}',laden:'irgendwann ab dem Rang {rang}, wenn in der Stadt ein Laden frei wird',spitzenlage:'irgendwann ab dem Rang {rang}'};
// Seit 13.5.1: Stufen der Erntehelfer und Lagerarbeiter, was sie je Stufe können, die Zeile im Winzerboten je Stufe und die kleine Geschichte des ersten Menschen der Gruppe.
// Sie steigen von selbst auf, ohne Kauf und ohne höheren Lohn. Wortlaut seit 13.8.
// Seit 13.5.8 (Maik 22.11.2026, Entscheidung 7): Die Erntehelfer düngen, sobald der Boden auf HELFER_DUENG Prozent fällt (vorher 70), damit der Jahresschnitt
// sicher über BODEN_GUT bleibt und der Boden-Zähler wie bei einem guten Spieler steigt. Startwert, gemessen in 13.5.8 gegen den Test-Spieler.
// Lagerarbeiter Stufe 3 kommt seit 14.4.2 mit dem ersten eigenen Sekt (bis 14.2 mit dem Rebstock der Sekt-Sorte), bis dahin macht der Spieler den Sekt von Hand.
const HELFER_DUENG=80;
// Seit 14.2.3: Erntehelfer schneiden und düngen ab Stufe 1, wenn du es abgibst, mit dem Zuwachs ihrer Stufe (ZUWACHS). Platzhalter, Wortlaut in Meilenstein 17.
// Seit 14.4.3: Die Stufen der Erntehelfer haben eigene Namen (stufen), Platzhalter, Wortlaut in Meilenstein 17.
const LEUTE_ST={helfer:{name:'Erntehelfer',stufen:['Erntehelfer','Winzergesellen','Rebmeister'],kann:['schneiden und düngen, halten aber nur den Stand','schneiden und düngen mit halbem Zuwachs','schneiden und düngen fast wie du, dazu nachpflanzen']},lagerarb:{name:'Lagerarbeiter',kann:['keltern','auch abfüllen und Etiketten kleben','auch den Sekt in den Sektkeller legen und abfüllen']}};
const LEUTE_BOTE={helfer:['🧑‍🌾 Deine Erntehelfer können ab jetzt schneiden und düngen. Abgeben kannst du im Weinberg und bei der Düngung, sie halten aber nur den Stand.','✂️ Aus deinen Erntehelfern sind Winzergesellen geworden: Wer bei ihnen abgibt, bekommt den halben Zuwachs.','🌱 Deine Rebmeister schneiden und düngen fast wie du und pflanzen jetzt auch nach. Die Reben dafür kauft der Weingut-Manager.'],
  lagerarb:['🛢️ Dein erster Qualitätswein ist angemeldet. Ab jetzt keltern deine Lagerarbeiter, das musst du nicht mehr tun.','🍾 Deine Lagerarbeiter füllen ab jetzt ab und kleben die Etiketten. Wieder eine Sorge weniger.','🥂 Dein erster Sekt ist fertig. Ab jetzt lagern die Lagerarbeiter den Sekt um und füllen ab. Kurz oder lang wählst du.']};
const LEUTE_ERST={helfer:'🧑‍🌾 Der alte Winzer bringt eine junge Frau aus dem Dorf mit, die jeden Hang hier seit der Kindheit kennt. „Die weiß, wo der Dünger hingehört“, sagt er. Das ist deine erste Erntehelferin.',
  lagerarb:'🛢️ Der alte Winzer kommt mit einem großen, stillen Mann durchs Hoftor. „Der kann anpacken. Und er redet wenig.“ Das ist dein erster Lagerarbeiter.'};
const LESE={reif:'nur reife Trauben',ueber:'nur überreife Trauben',alles:'reife und überreife'};
const WETTER={sonnig:['☀️','sonnig'],mild:['⛅','mild'],regen:['🌧️','Regen'],kalt:['🌥️','kalt'],frost:['❄️','Frost']};
// Boden: verliert jeden Monat BODEN_MONAT Punkte (in einem Regenmonat BODEN_REGEN) und mit jeder Lese 4. Einmal Düngen bringt 30, erlaubt sind drei Mal im Jahr.
// Seit 11.5 (Teil D, Maik 20.11.2026): Die Anzeige zeigt 4.000 Reben je Hektar statt 1.000. Im Spielstand und in der Rechnung bleibt alles, wie es ist,
// nur Zahl, Preis und Ertrag je Rebe rechnen bei der Anzeige mit STOCK_F um. So ändert sich am Geld nichts, und alte Spielstände brauchen keinen Umbau.
const STOCK_F=4; const HA_REBEN=1000, FASS_PREIS=1.2, FLASCHE_PREIS=.35, DUENGER_HA=250, BODEN_MONAT=3, BODEN_REGEN=5;
// Seit 13.2.1 (Bauplan 13.2, Maik 21.11.2026): Boden-Stufen für das ganze Weingut, auch für neu gekauftes Land. Am Jahresende zählt ein Bodenschnitt
// ab BODEN_GUT Prozent als gutes Jahr (S.bodenZ +1), ein schlechtes zählt 0, der Boden fällt nie. Die Stufe S.bodenSt steigt, sobald der Zähler
// ihre Schwelle in BODEN_SCHWELLE erreicht. Je Stufe BODEN_ST_OE Grad mehr Deckel (ab 13.2.3), BODEN_ST_MENGE mehr Menge und BODEN_ST_QP Qualitätspunkte.
// Startwerte, Stellschrauben für 14.2.
// Seit 14.2.5: BODEN_SCHWELLE in Bodenpunkten je Lage (bis 14.2.4 gute Bodenjahre 0, 10, 37, 85), höchstens BODEN_MAX Punkte (Annahme von Claude, wie EP_MAX).
const BODEN_STUFEN=['Rohboden','Fruchtboden','Gutsboden','Terroir'], BODEN_SCHWELLE=[0,10,40,90], BODEN_MAX=100, BODEN_GUT=90, BODEN_ST_OE=0, BODEN_ST_MENGE=.05, BODEN_ST_QP=[0,5,10,20];
// Seit 14.2.6 (Entscheidungen 24 und 28): Der Boden hebt den Deckel nicht mehr (BODEN_ST_OE 0, bis 14.2.5: 4), BODEN_ST_QP ist eine Liste je Stufe (bis 14.2.5: 4 je Stufe).
// Seit 13.2.2 (Bauplan 13.2): Rebpflege je Sorte (f.pflSt, Zähler f.pflZ), das Rebalter mit Jungreben ist weg. Am Jahresende zählt eine Sorte mit Reben,
// die bis Ende April geschnitten wurde (f.schnitt), PFLEGE_GUT, sonst geht der Zähler um PFLEGE_PATZER zurück, höchstens bis 0. Die Stufe ist die höchste
// Schwelle in PFLEGE_SCHWELLE, die der Zähler erreicht, sie fällt also erst, wenn er darunter rutscht. Neue Reben übernehmen die Stufe ihrer Sorte.
// Menge: Der Setzling trägt SETZ_MENGE nach seinem Zählerstand (0 bis 4), ab Rebstock gilt PFLEGE_MENGE je Rolle für Rebstock, Premier Cru, Grand Cru.
// Punkte PFLEGE_QP je Rolle und Stufe, Preisbonus PFLEGE_PREIS je Stufe nur bei der Spitzen-Sorte, je Stufe PFLEGE_ST_OE Grad mehr Deckel (ab 13.2.3).
const PFLEGE_STUFEN=['Jungrebe','Rebstock','Premier Cru','Grand Cru'], PFLEGE_SCHWELLE=[0,5,12,20], PFLEGE_GUT=1, PFLEGE_PATZER=2, PFLEGE_ST_OE=0;
// Seit 14.2.6 (Entscheidung 24, Annahme 14): Die Pflege hebt den Deckel nicht mehr (PFLEGE_ST_OE 0, bis 14.2.5: 4), PFLEGE_PREIS steht auf 0 (bis 14.2.5: 0, 0, 5, 15 Prozent).
const SETZ_MENGE=[.4,.48,.55,.63,.7], PFLEGE_MENGE={menge:[1,1,1],sekt:[1,1,1],spitze:[1,.9,.8]};
const PFLEGE_QP={menge:[0,1,3,6],sekt:[0,1,3,6],spitze:[0,2,6,12]}, PFLEGE_PREIS={spitze:[0,0,0,0]};
// Seit 13.2.3 (Bauplan 13.2): Deckel je Weinberg = DECKEL_BASIS der Rolle + BODEN_ST_OE je Boden-Stufe + PFLEGE_ST_OE je Pflegestufe, also höchstens 90° und 104°.
// Das Monatsmodell bleibt, es zählt der kleinere Wert aus Wetter und Deckel. Nur die Edelfäulnis der Spitzen-Sorte darf darüber, bis 150°.
// Seit 14.2.6 (Entscheidung 24): fester Deckel je Sorte, Menge und Sekt 90°, Spitze 104° (bis 14.2.5: 66, 66, 80 plus 4° je Boden- und Pflegestufe).
const DECKEL_BASIS={menge:90,spitze:104,sekt:90};
// Seit 13.2.4 (Bauplan 13.2): Rebschnitt von Hand je Sorte von Januar bis SCHNITT_BIS (3 = April), SCHNITT_HA Euro je Hektar der Sorte, so viel wie das Düngen.
// Wer bis Ende April schneidet, hat ein gutes Pflegejahr (13.2.2). Die Abgabe an die Erntehelfer kommt in 13.5.
const SCHNITT_HA=DUENGER_HA, SCHNITT_BIS=3;
// Seit 13.2.5 (Bauplan 13.2): Stufen auf der Flasche. Ab Pflegestufe NAME_PFLEGE_AB (Premier Cru) steht sie im Weinnamen, ab Boden-Stufe NAME_BODEN_AB (Terroir)
// der Zusatz "vom Terroir", höchstens diese zwei Zusätze. Festgehalten bei der Lese (l.pfl, l.bst), keine neuen Felder auf dem Siegelbrett, keine neuen Klassen.
const NAME_PFLEGE_AB=2, NAME_BODEN_AB=3;
// Reben-Abnutzung: Zum Jahreswechsel geht je Sorte ein Teil der Reben ein. VERLUST nennt je Stufe [ab Bodenschnitt, von Prozent, bis Prozent].
// Frost kommt obendrauf: zwei Frostmonate im Winter (Januar, Februar, Dezember) FROST_2 Punkte, drei FROST_3, Spätfrost zur Blüte SPAETFROST.
// Der Rebenpreis schwankt von Januar bis März um REBEN_SCHWANK. STEUER gilt für dich und die Gegner, GEGNER_ABNUTZ ist ihr Nachpflanzen je Hektar und Jahr.
const VERLUST=[[70,0,1],[50,4,7],[35,7,11],[0,12,18]], FROST_2=2, FROST_3=4, SPAETFROST=2, REBEN_SCHWANK=.3, STEUER=.2, GEGNER_ABNUTZ=150;
// ===== Seit 14.2 (Bauplan 14.2 Pflege, Erziehungsform und Boden, 23.11.2026). Alle Zahlen sind Startwerte, gemessen wird in Meilenstein 15.
// Bestehende Konstanten, die in 14.2 neue Werte bekommen, ändern sich in ihrer Unteretappe: VERLUST (erste Zeile 0 bis 1 Prozent) und
// PFLEGE_STUFEN (Jungrebe) in 14.2.2, FREI.helfer2 (Premier Cru der Menge-Sorte) in 14.2.3, BODEN_SCHWELLE (0, 10, 40, 90 Punkte) in 14.2.5,
// DECKEL_BASIS (90, 90, 104), BODEN_ST_OE und PFLEGE_ST_OE (0), BODEN_ST_QP (Liste), LAUB_QP (5) und PFLEGE_PREIS (0) in 14.2.6.
// Entwicklungspunkte je Weinberg (f.ep): 0 bis EP_MAX, Premier Cru ab EP_PREMIER, Grand Cru ab EP_GRAND, Rebstock nach EP_REBSTOCK_JAHRE Chef-Jahren
// der Form (Flachbogen und Kordon 7,5, Einzelpfahl 12 Punkte).
const EP_MAX=100, EP_PREMIER=40, EP_GRAND=90, EP_REBSTOCK_JAHRE=3; // EP_PREMIER seit 14.4.3 40 (bis 14.2 45)
// Erziehungsform je Weinberg: Punkte je Jahr mit dem Chef (ep), Rebschnitt je Hektar in der Erziehung bis Rebstock (haErz) und danach (ha),
// Maschine (masch: 1 immer, 'rebstock' erst ab Rebstock, 0 nie), nur für eine Rolle (nur).
const FORMEN={flach:{name:'Flachbogen',ep:2.5,haErz:250,ha:250,masch:1},kordon:{name:'Kordon',ep:2.5,haErz:500,ha:375,masch:'rebstock'},pfahl:{name:'Einzelpfahl',ep:4,haErz:750,ha:750,masch:0,nur:'spitze'}};
const FORM_PASST={menge:'flach',sekt:'kordon',spitze:'pfahl'};
// Faktoren für Menge und Qualitätspunkte je Rolle und Form, die passende Form hat 1 und 1.
const FORM_WIRKUNG={menge:{flach:[1,1],kordon:[.85,1.15]},sekt:{kordon:[1,1],flach:[1.1,.85]},spitze:{pfahl:[1,1],kordon:[1.1,.85],flach:[1.2,.7]}};
// Wirkung je Pflegestufe für alle Rollen gleich: Jungrebe, Rebstock, Premier Cru, Grand Cru. Ersetzen PFLEGE_MENGE, SETZ_MENGE und PFLEGE_QP.
const STUFE_MENGE=[.5,1,1,.9], STUFE_QPF=[.5,.75,1,1.25];
// Zuwachs nach dem, der schneidet oder düngt: der Chef ganz, Erntehelfer je Stufe (Index 1 bis 3).
const ZUWACHS={chef:1,helfer:[0,0,.5,.9]};
// Anteil der Punkte aus dem Rebschnitt und aus einem guten Bodenjahr (9 zu 1, Startwert nach Entscheidung 37). Verwildern ohne Schnitt im
// ersten, zweiten und ab dem dritten Jahr. Ab Grand Cru bringt jeder Rebschnitt mindestens GC_HALTEN. Chef-Grenze vorbereitet, 3 heißt keine.
// Seit 14.4.3 (Entscheidungen 12, 15 und 17): Der Rebschnitt zählt ganz für die Rebe (EP_SCHNITT 1, EP_BODEN 0, bis 14.2 0,9 und 0,1), die Chef-Grenze ist 1
// (bis 14.2 3, keine Grenze), Premier Cru ab 40 Punkten (EP_PREMIER oben). Wie der Chef zugeteilt wird, sagt CHEF_RAT (ganz unten).
const EP_SCHNITT=1, EP_BODEN=0, VERWILDERN=[5,10,20], GC_HALTEN=1, CHEF_SCHNITT_MAX=1;
// Bodenpunkte je Lage und gutem Jahr, wenn der Chef düngt (Entscheidung 39).
const BODEN_PUNKTE={einfach:1.5,hoehe:2,sued:3.5};
// Ansehen bei der Anmeldung: Grundwert der Weinstufe plus 1 je ANS_JE_QP Qualitätspunkte.
const ANS_JE_QP=5;
// Jahrhundertjahre ohne Terroir: um JH_ERST, dann alle JH_ABSTAND Jahre, jedes bis zu JH_STREU Jahre früher oder später, je Partie fest gewürfelt.
// Seit 14.4.2 (Maik 24.11.2026, Frage 1): JH_ERST 91 statt 90, Vorgeschmack in Jahr 89 bis 93, die echten ab Jahr 94, nicht vor dem Vizepräsidenten.
const JH_ERST=91, JH_STREU=2;
// Skala der Qualitätspunkte: mindestens QP_MIN, normaler Wein höchstens QP_MAX, Jahrhundertwein JH_ZUSCHLAG mehr, höchstens QP_MAX_JH.
// Sonne gibt bis SONNE_QP_MAX. Sommerschnitt von Hand LAUB_HAND_HA Euro je Hektar.
const QP_MIN=5, QP_MAX=90, QP_MAX_JH=100, JH_ZUSCHLAG=10, SONNE_QP_MAX=5, LAUB_HAND_HA=500;
// Anspruch je Weinstufe in Qualitätspunkten (Entscheidung 32), ausgeschaltet: ANSPRUCH_PREIS und ANSPRUCH_ANS je fehlendem Punkt stehen auf 0.
const ANSPRUCH={feder:0,tafel:0,qba:15,kab:30,spat:40,aus:50,ba:60,tba:70,eis:50}, ANSPRUCH_PREIS=0, ANSPRUCH_ANS=0;
// Seit 14.2.4: Texte zur Erziehungsform und zum Sommerschnitt von Hand. Platzhalter, Wortlaut in Meilenstein 17.
const FORM_RAT={menge:'Der alte Winzer rät zum Flachbogen: „Der trägt viel, der Schnitt ist billig, und die Maschine darf lesen. Genau das will die Menge-Sorte.“',
  sekt:'Der alte Winzer rät zum Kordon: „Am Kordon hängen die Trauben gleichmäßig und luftig, das gibt den feinsten Grundwein. Bis zum Rebstock ist er teuer und will von Hand gelesen werden, danach darf die Maschine.“',
  spitze:'Der alte Winzer rät zum Einzelpfahl: „Jeder Stock steht für sich, das gibt wenig Menge, aber die besten Trauben, und am Pfahl wächst der Weinberg am schnellsten zum Grand Cru.“'};
const FORM_PFAHL_HAND='Am Einzelpfahl liest du immer von Hand, eine Maschine passt nicht in den Weinberg.';
const FORM_WAHL_SATZ='Die Form wählst du einmal für den Weinberg. Wer später umstellt, fängt mit der Erziehung von vorn an.';
// Seit 14.2.5: Winzerbote, wenn eine Lage eine neue Boden-Stufe erreicht. Platzhalter, Wortlaut in Meilenstein 17.
const BODEN_LAGE_BOTE='🌱 {lage}: Der Boden ist jetzt {stufe}.';
const LAUB_HAND_BOTE='✂️ Ab jetzt kannst du im Juni den Sommerschnitt von Hand machen, im Weinberg bei jeder Sorte. Eine Maschine kommt in deine steilen Hänge nicht.';
const VERSION='14.2';
// Seit 13.3.6 (Maik 21.11.2026): Im Umbau starten neue Partien ohne Spielführer, sonst verspricht er Dinge nach den alten Rängen.
// Mit neuen Texten muss er am Ende wieder an sein (14.4), dann FU_START=1.
const FU_START=0;
const KEYS=['rebenreich-1','rebenreich-2','rebenreich-3'], SLOT_KEY='rebenreich-slot', TON_KEY='rebenreich-ton';
// Seit 11.5 (Teil C2, Maik 20.11.2026): realistische Löhne. Das Arbeitsamt bietet LOHN_MIN bis LOHN_MAX im Monat (bis 11.4: 200 bis 500 €, Startlohn 350, Vermittlung 300).
// LOHN_F ist der gemeinsame Faktor auf alle Löhne (Angestellte und Manager), eingestellt über die Dosis-Reihe der Messung. lohnF rechnet einen Lohn damit um, auf 10 € gerundet.
// Die Erntemaschine deckt seitdem MASCH_HELFER Hektar ab und liest MASCH_LEISTUNG Reben (bis 11.4: 3 Hektar, 3.000 Reben, 28.000 €, Wartung 100 € je Punkt).
// MASCH_LEISTUNG seit 13.5.9 15.000 Reben, gleich den MASCH_HELFER 15 Hektar weiter unten (bis 13.5: 6.000).
const HELFER_LEISTUNG=3000, MASCH_LEISTUNG=15000, MASCH_PREIS=140000, WARTUNG=300, LOHN_MIN=1800, LOHN_MAX=2400, LOHN_START=2000, VERMITTLUNG=1000, ZINS=.06, SEKT_KOSTEN=.8;
const LOHN_F=1, LOHN_ALT=[200,500];
// Leute-Regel seit 11.5 (Teil C1, Maik 20.11.2026): Bis ALLEIN_HA Hektar Reben, ALLEIN_FASS Liter Fassraum und ALLEIN_FL leere Flaschen schafft die Familie alles allein
// und liest ihre ALLEIN_HA Hektar selbst. Darüber braucht es das ganze Jahr je REBEN_JE_HELFER angebaute Reben (3 Hektar) einen fest angestellten Erntehelfer,
// jeder liest HELFER_LEISTUNG Reben (oben, dreimal so viel wie bis 11.4). Eine Erntemaschine im Einsatz deckt MASCH_HELFER Hektar ab (bis 11.4 "zählt wie so viele Helfer", das war dasselbe).
// Zahlen bis 11.4, für Messläufe: ALLEIN_HA, ALLEIN_FASS und ALLEIN_FL 0, REBEN_JE_HELFER, HELFER_LEISTUNG und HAND_REBEN 1000, FASS_JE_LAGERARB 10000, FLASCHEN_JE_LAGERARB 20000, ABF_FLASCHEN 25000.
// Ein Lagerarbeiter betreut FASS_JE_LAGERARB Liter Fassraum und FLASCHEN_JE_LAGERARB leere Flaschen, zusätzlich zu dem, was die Familie schafft. Fehlen Leute, sperrt "Nächster Monat".
// Seit 13.5.9 (Nachtrag 3, Maik 22.11.2026): Es gibt höchstens eine Erntemaschine (MASCH_EINE), sie deckt MASCH_HELFER 15 Hektar ab (bis 13.5: 6) und liest
// so viele Reben, wie sie abdeckt. Alles darüber lesen die Erntehelfer von Hand, einer je REBEN_JE_HELFER, die Löhne bremsen dort bewusst.
const ALLEIN_HA=4, ALLEIN_FASS=10000, ALLEIN_FL=10000, REBEN_JE_HELFER=3000, MASCH_HELFER=15, MASCH_EINE=1, FASS_JE_LAGERARB=30000, FLASCHEN_JE_LAGERARB=60000;
/* ---- Etappe 3: Ränge, Gegner, Auktionen, Wettbewerbe, Export ---- */
// START_GELD: seit 7.0 (Schritt C, Maik 16.11.2026) 60.000 € statt 40.000 €, weil am Start nur die ★★★-Sorte geht und Riesling erst nach 18 Monaten Geld bringt. Endgültig in Schritt H.
const START_JAHR=2027, START_GELD=60000;
// Seit 13.3.8 (Nachtrag 3): Vermögen = Geld minus offener Kredit + Wein im Keller (WEIN_WERT seines Listenwerts, ohne Deckel beim Großhandel) + Weinberge.
// Maschinen, Gebäude und der feste Landwert je Hektar (bis 13.3.7 LANDWERT 15.000 €) zählen nicht mehr. Ein Hektar Weinberg ist VERM_GRUND mal Sorte (VERM_SORTE
// je Rolle) mal Pflegestufe (VERM_PFLEGE) mal Boden-Stufe (VERM_BODEN), kahles Land VERM_GRUND mal Boden mal VERM_KAHL. Pflanzen lohnt sich immer (Maik).
// VERM_GRUND ist ein Platzhalter bis 14.1 (der alte Landwert). Sorten ohne Rolle (Messläufe mit ROLLEN_NEU=0) zählen wie die Menge-Sorte.
// Die Gegner haben keine Stufen und bekommen eine Schätzung (gVerm): Boden und Pflege nach dem Spieljahr, als wäre jedes Jahr gut, die Fläche zuerst Menge,
// dann Sekt, dann Spitze nach der Wunschfläche GEGNER_FL (26 Menge, 8 Sekt, der Rest Spitze, Nachtrag 3).
const VERM_GRUND=15000, VERM_SORTE={menge:1,sekt:1.5,spitze:3}, VERM_PFLEGE=[1,1.25,1.5,2], VERM_BODEN=[1,1.25,1.5,5], VERM_KAHL=.5, GEGNER_FL=[['menge',26],['sekt',8],['spitze',Infinity]];
// Aufstiegstempo: Die ersten HA_FREI Hektar kosten im Monat HA_KOSTEN_KLEIN, jeder weitere HA_KOSTEN.
// Der Großhandel kauft je Monat für MARKT_FREI Euro zum vollen Preis, je Rang für MARKT_RANG, je Stufe des Exporthandels für MARKT_EXPORT und je bepflanztem Hektar über HA_FREI für MARKT_HA mehr.
// Seit 4.2 (Paket 3, 15.11.2026) hängt das Budget vor allem an der Fläche, damit ein großes Gut nicht ärmer ist als ein kleines. Verkäufe an Weinhandlungen zählen seit Paket 9 nicht mehr mit. Darüber fällt der Preis bis auf MARKT_MIN, erreicht nach dem MARKT_BREIT-fachen des Budgets.
// Jede Weinhandlung nimmt im Monat 1 bis LADEN_MAX mal LADEN_MENGE Flaschen, seit Paket 9 nur Wein, der zu ihrem Wunsch passt (ladenPasst).
// Seit 5.1 (Paket 10) kommen je bepflanztem Hektar über HA_FREI LADEN_HA Flaschen dazu, über denselben Flächenwert wie MARKT_HA (haUeber). Sie zahlen LADEN_AUF mal den Listenpreis. Der Wein im Keller zählt beim Vermögen nur mit WEIN_WERT seines Listenwerts (bis 13.3.7 höchstens mit dem, was der Großhandel in einem Jahr zum vollen Preis kauft).
// Die Gegner fangen mit GEGNER_START ihrer Stärke an und wachsen über GEGNER_JAHRE Jahre auf GEGNER_ENDE.
// Seit 10.3 (B13): Am Deckel zahlt ein Gegner weiter und bekommt das Ansehen, baut aber den Keller aus statt Land zu kaufen.
// Seit 11.5 (Teil B) ist das der Deckel seines Rangs (gegnerDeckel). GEGNER_HA_MAX gilt nur noch für Messläufe mit HA_NEU=0.
// Gemessen am 19.11.2026 (54 Partien, Mittel): Ohne diesen Ausgleich wäre der erste Gegner erst in Jahr 147 statt 140 am Ziel.
const HA_FREI=3, HA_KOSTEN_KLEIN=50, HA_KOSTEN=300, MARKT_FREI=3000, MARKT_RANG=250, MARKT_EXPORT=1000, MARKT_HA=900, MARKT_MIN=.25, MARKT_BREIT=.75, GEGNER_START=.5, GEGNER_ENDE=4, GEGNER_JAHRE=100, GEGNER_HA_MAX=30, LADEN_MENGE=30, LADEN_HA=5, LADEN_MAX=3, LADEN_AUF=1.2, WEIN_WERT=.5;
const WO={mosel:'an der Mosel',rheingau:'im Rheingau',rheinhessen:'in Rheinhessen',pfalz:'in der Pfalz',franken:'in Franken',wuerttemberg:'in Württemberg'};
// Zehn Stufen. ha ist beim Spieler die bepflanzte Fläche (flaecheBep), bei den Gegnern ihre Fläche.
// Hürden seit 7.0 (Schritt H, 16.11.2026): abgestimmt auf rund 120 Spieljahre. Seit 11.5 (Teil A) ist alles Ansehen verdoppelt, der Präsident steht bei 10.000 statt 9.200. Der Test-Spieler wird auf Mittel in der Mitte in Jahr 109 Präsident (h16_gesamt_warm10).
// Seit 11.5 (Teil C2, Maik 20.11.2026): "Präsident in drei Generationen". Die oberen Ansehenshürden sind der Schlussregler fürs Tempo: Weinbaurat 1.500 statt 1.400,
// Verbandsvorstand 4.000 statt 2.500, Vizepräsident 8.000 statt 5.600, Präsident 12.000 statt 10.000, dazu 30 Mio. € Vermögen statt 24,5. Ziel ist der Präsident vor der Übergabe in Jahr 120.
// Gemessen mit l115_staffel (54 Partien, Mittel): Mosel, Rheingau, Rheinhessen und Pfalz im Median in Jahr 114, 31 von 36 Partien vor Jahr 120.
// Seit 13.3.5 (Bauplan 13.3, Startwerte aus dem Bauauftrag): Vizepräsident 6.000 Ansehen und 29 Hektar (bis 13.2: 8.000 und 33), Präsident 8.500 und 33 (bis 13.2: 12.000 und 40).
// Der höchste Besitz deckel ist nach der Regel neu gerechnet: Verbandsvorstand 36 statt 41, Vizepräsident 41 statt 50. R0 bis R7 bleiben.
// Seit 13.3.7: neu nennt die Hauptsachen der Wunschstrategie (Nachtrag 3), schlicht formuliert, Wortlaut seit 13.8.
// Seit 13.3.8 (Nachtrag 3, Maik 22.11.2026): Flächen-Hürden fest 3, 7, 14, 18, 24, 27, 28, 28, 28 Hektar bepflanzt, Besitz-Deckel 5, 9, 17, 32, 42, 47, ab dem Weinbaurat 50
// (Wunschfläche des nächsten Ziels mal 1,25). ans und verm sind hier die heutigen Werte, die Hürde rechnet RANG_HUERDE unten daraus.
const RAENGE=[
  {name:'Neuling',kurz:'Neuling',ans:0,ha:0,verm:0,rahmen:20000,haAlt:0,deckel:5},
  {name:'Jungwinzer',kurz:'Jungwinzer',w:'Jungwinzerin',kw:'Jungwinzerin',ans:30,ha:3,verm:100000,rahmen:40000,haAlt:3,deckel:9,neu:'ein geschenkter Hang vom alten Winzer, Qualitätswein, der Makler im Rathaus, die ersten Auktionen'},
  {name:'Winzer',kurz:'Winzer',w:'Winzerin',kw:'Winzerin',ans:120,ha:7,verm:250000,rahmen:80000,haAlt:4,deckel:17,neu:'Kabinett, der Düngerstreuer, Spenden fürs Dorf, öfter Land bei den Auktionen'},
  {name:'Winzermeister',kurz:'Winzermeister',w:'Winzermeisterin',kw:'Winzermeisterin',ans:210,ansW:300,ha:14,verm:600000,rahmen:160000,haAlt:5,deckel:32,neu:'Spätlese, Landesprämierung, die Erntemaschine, die Abfüllanlage, der Sommerschnitt von Hand'},
  {name:'Weingutsbesitzer',kurz:'Gutsbesitzer',w:'Weingutsbesitzerin',kw:'Gutsbesitzerin',ans:600,ha:18,verm:1500000,rahmen:300000,haAlt:6,deckel:42,neu:'{sorte}, der Sektkeller, das Weinfest, kühle Höhenlagen bei den Auktionen'},
  {name:'Gutsherr',kurz:'Gutsherr',w:'Gutsherrin',kw:'Gutsherrin',ans:1000,ha:24,verm:3500000,rahmen:300000,haAlt:8,deckel:47,neu:'der große Vollernter'},
  {name:'Weinbaurat',kurz:'Weinbaurat',w:'Weinbaurätin',kw:'Weinbaurätin',ans:1500,ha:24,verm:6000000,rahmen:300000,haAlt:10,deckel:50,neu:'{sorte} für den steilen Südhang, Südhang bei den Auktionen, das Amt des Weinbotschafters, der Ausbau der Abfüllanlage'},
  {name:'Verbandsvorstand',kurz:'Vorstand',w:'Verbandsvorständin',kw:'Vorständin',ans:4000,ha:28,verm:12000000,rahmen:300000,haAlt:13,deckel:50,neu:'Auslese und der Weg deines Gebiets im Herbst, das Hoffest, der Bundeswettbewerb, der Laubschneider'},
  {name:'Vizepräsident',kurz:'Vizepräsident',w:'Vizepräsidentin',kw:'Vizepräsidentin',ans:6000,ha:28,verm:16000000,rahmen:300000,haAlt:16,deckel:50,neu:'Trockenbeerenauslese, in besonderen Jahren der fremde Weg im Herbst, du kannst Kontrollen anregen'},
  {name:'Präsident des Weinbauverbands',kurz:'Präsident',w:'Präsidentin des Weinbauverbands',kw:'Präsidentin',ans:8500,ha:28,verm:30000000,rahmen:300000,haAlt:20,deckel:50,neu:'der Stuhl im Festsaal, das Amt an der Spitze des Verbands, der Weg zur Weltweinschau'}
];
// Seit 11.5 (Teil B): Fläche neu. Die Hürden (ha, bepflanzt) gehen bis 40 Hektar statt bis 20, haAlt sind die Werte bis 11.4.
// deckel ist der höchste Besitz je Rang, seit 13.3.8 nach Nachtrag 3 (bis 13.3.7: ein Viertel mehr, als der nächste Rang verlangt), für niemanden mehr als 50 (Maik 20.11.2026).
// Er gilt für dich (haDeckel) und für die Gegner (gegnerDeckel). Wer aus einem alten Spielstand mehr Land hat, behält es und kann nur nichts dazukaufen.
// HA_NEU=0 holt für Messläufe die Regeln bis 11.4 zurück: alte Hürden, kein Deckel für dich, GEGNER_HA_MAX für die Gegner, beim Makler ein Hektar im Jahr.
const HA_NEU=1;
for(const r of RAENGE){const neu=r.ha; Object.defineProperty(r,'ha',{get:()=>HA_NEU?neu:r.haAlt,enumerable:true})}
// Seit 13.3.8 (Nachtrag 3): Je Akt führt eine Hürde und gilt ganz (HUERDE_FUEHRT, Faktor 1), die anderen beiden gelten zu HUERDE_REST ihres Wunschwerts.
// RANG_AKT nennt den Akt je Rang (Neuling zählt zum ersten). Hürde = Wunschwert (ansW, vermW) mal Faktor, gerundet.
// Platzhalter bis 14.1: Die Wunschwerte für Ansehen und Vermögen sind so gesetzt, dass die Hürden ihre Werte von 13.3.7 behalten (heutiger Wert durch Faktor).
// Die Flächen-Hürden stehen fest in ha (Nachtrag 3), die 0,7 im zweiten und dritten Akt stecken dort schon drin (26, 34, 38 und 40 Hektar Wunschfläche mal 0,7).
const RANG_AKT=[1,1,1,1,2,2,2,3,3,3], HUERDE_FUEHRT={1:'ha',2:'verm',3:'ans'}, HUERDE_REST=.7;
const huerdeF=(i,k)=>HUERDE_FUEHRT[RANG_AKT[i]]===k?1:HUERDE_REST;
// Ausnahme Winzermeister (Maik 22.11.2026, Platzhalter bis 14.1): ansW 300 gemessen, der Test-Spieler hat um Jahr 26 in Mosel 210 und Pfalz 224 Ansehen,
// mal 0,7 ergibt die Hürde 210. Ohne das blieb er beim Winzer stecken, weil Kabinett und Landesprämierung erst mit R3 kommen.
RAENGE.forEach((r,i)=>{for(const k of ['ans','verm']){r[k+'W']=r[k+'W']??r[k]/huerdeF(i,k); Object.defineProperty(r,k,{get:()=>Math.round(r[k+'W']*huerdeF(i,k)),enumerable:true})}});
// Ab welcher Stufe (Index in RAENGE) etwas geht. RANG_ALT rechnet die sechs Ränge alter Spielstände um.
// Seit 13.3.4 kommen die Ränge aus FREI, dort stehen auch Makler, Weinbotschafter und Kontrollen.
const R_MAX=RAENGE.length-1, R_AUKTION=FREI.auktion.r, R_MAKLER=FREI.makler.r, R_LAND=FREI.land.r, R_BUND=FREI.bund.r, R_LADEN=FREI.laden.r, R_BOTSCHAFT=FREI.botschafter.r,
  R_HOFFEST=FREI.hoffest.r, R_KONTROLLE=FREI.kontrolle.r, R_SPITZE=FREI.spitzenlage.r, RANG_ALT=[0,1,3,5,7,9];
// Version 7.0 (Schritt C): Freischalt-Plan aus Schritt A. Die Rebsorten kommen nacheinander nach ihren Sternen im Gebiet (sortenFolge):
// die ★★★-Sorte von Anfang an, die ★★-Sorte ab R_SORTE2, die ★-Sorte ab R_SORTE3. Seit 13.3.4 aus FREI: Sekt-Sorte und Sektkeller ab R4, Spitzen-Sorte ab R5,
// der Exporthandel seit 14.4.2 mit der ersten Medaille oder als Ereignis (FREI.export, R_EXPORT ist der Rang des Ereignisses und die erste Exportstufe), Kellerausbau seit 13.5.8 mit dem ersten Wein der Stufe (KELLER_WEIN, weiter unten).
const R_SORTE2=FREI.sorte_sekt.r, R_SORTE3=FREI.sorte_spitze.r, R_SEKT=FREI.sektkeller.r, R_EXPORT=FREI.export.r, SORTE_RANG=[0,R_SORTE2,R_SORTE3];
// Version 7.0 (Schritt D): drei Manager statt Gutsverwalter, nach dem Plan aus Schritt A ("Fundament für 7.0" in der Projektnotiz).
// MANAGER: je Stufe der Bereich, die Stufe und welche Aufgaben (seit 13.5.1 kommt die Stufe über FREI, Schlüssel mgr_ mit Bereich und Stufe, rang liest dort nach) (Schlüssel aus MGR_AUFGABEN) sie dazubringt.
// kosten: Einstellen (Stufe 1) oder Befördern, aus MGR_KOSTEN. lohn: Monatslohn auf dieser Stufe, aus MGR_LOHN, läuft über die Löhne.
// Kosten und Lohn stehen bis Schritt H auf 0 (neutral, wie der frühere Verwalter). Startwerte für Schritt H: 5.000 / 20.000 / 60.000 € und 500 / 1.000 / 2.000 € im Monat.
// Schritt E: Handel 3 (Regal, Wettbewerb, Fest), Keller 2 (Sekt, seit 8.5 dazu Abfüllen, Keltern ist seit 8.5 Stufe 1), Keller 3 (schnellere Reife, über MGR_REIFE und MGR_REIFE_MIN, kein Schalter).
// Spielstand: S.manager={handel|keller|weingut:{stufe,an:{aufgabe:1},zuletzt,puffer}}, die Reserve der Daueraufträge wie bisher in S.dauer.reserve.
// Seit 11.5 (Teil C1, Maik 20.11.2026): Manager sind Pflicht. Sie kommen mit dem Rang von selbst (mgrKommen), Einstellen, Befördern und Entlassen gibt es nicht mehr,
// und die Kosten dafür entfallen (bis 11.4: 5.000, 20.000 und 60.000 €). Für Messläufe: hSet({code:'MANAGER.forEach(e=>e.kosten=[5000,20000,60000][e.stufe-1])'}).
// MGR_GLEICH=1: Der Manager kommt im Monat des Aufstiegs. 0 nur für Messläufe: erst beim nächsten Weiterblättern, so hat ihn der Test-Spieler bis 11.4 eingestellt.
// Seit 11.5 (Teil C2, Maik 20.11.2026): Löhne je Stufe 2.200, 3.500 und 5.500 € (bis 11.4: 500, 1.000 und 2.000), mal LOHN_F. e.lohn liest beides erst beim Abruf.
const MGR_KOSTEN=[0,0,0], MGR_LOHN=[2200,3500,5500];
const MGR_GLEICH=1;
// Schritt E: Geldgrenze für Sekt (Kellermeister) und Fest (Handels-Manager). So viel bleibt mindestens auf dem Konto, Auswahl im Manager-Fenster.
const MGR_PUFFER=[0,20000,50000,100000,250000], MGR_PUFFER_START=20000;
// Schritt E: Kellermeister Stufe 3, Wein reift bei ihm schneller und besser. Wirkt wie eine zusätzliche Stufe Kellerausbau:
// MGR_REIFE auf die Reife-Rate (wie KELLER_REIFE), MGR_REIFE_MIN Monate früher verkaufsreif. Seit Schritt H 0,1 und 1 (vorher neutral auf 0).
const MGR_REIFE=.1, MGR_REIFE_MIN=1;
// Schritt F: tab ist der Hauptreiter, in dem die Zeile des Managers oben steht. bild ist das Porträt in bilder/ (seit Schritt I), ohne Bild zeigt die Zeile das Symbol.
// w:1 heißt weiblich (seit Schritt I macht eine Frau den Handel, Maik 16.11.2026), mgrG(b) liefert dann "Deine", "sie", "eine" und so weiter.
const MGR_BEREICHE={
  handel:{name:'Handels-Managerin',sym:'🤝',ort:'Stadt',tab:'stadt',bild:'manager-handel.jpg',w:1},
  keller:{name:'Kellermeister',sym:'🍷',ort:'Keller',tab:'keller',bild:'manager-keller.jpg'},
  weingut:{name:'Weingut-Manager',sym:'🌿',ort:'Weingut',tab:'gut',bild:'manager-weingut.jpg'}
};
const MGR_G=[{Dein:'Dein',dein:'dein',Er:'Er',er:'er',ihn:'ihn',ein:'ein',den:'den'},{Dein:'Deine',dein:'deine',Er:'Sie',er:'sie',ihn:'sie',ein:'eine',den:'die'}];
const MGR_AUFGABEN={
  laeden:{kurz:'Weinhandlungen beliefern',text:'Jeden Monat die Weinhandlungen mit passenden Weinen beliefern'},
  handel:{kurz:'an den Großhandel verkaufen',text:'Jeden Monat an den Großhandel verkaufen, so viel er zum vollen Preis nimmt, auch den Federweißer an den Weinhändler'},
  // Seit 13.5.4 (Bauplan 13.5): Die Manager machen nur noch Büro. Keltern und Abfüllen machen die Lagerarbeiter, Düngen und Nachpflanzen die Erntehelfer (13.5.2, 13.5.3),
  // Wettbewerbswein und Hoffest wählt immer der Spieler. Weg sind keltern, reben, duengen, wett und fest, neu sind fass und export.
  export:{kurz:'auch in den Export verkaufen',text:'Beim Verkauf auch den Exporthandel nutzen, wenn er mehr zahlt als das Inland'},
  fass:{kurz:'Fassraum kaufen',text:'Nach der Lese fehlenden Fassraum kaufen, damit die Lagerarbeiter keltern können'},
  flaschen:{kurz:'Flaschen kaufen',text:'Leere Flaschen für angemeldete Fässer kaufen, abfüllen tun die Lagerarbeiter'},
  lager:{kurz:'Lagerarbeiter einstellen',text:'Fehlende Lagerarbeiter einstellen'},
  // Seit 8.0. Der Text liest MGR_WART_AB erst beim Zeichnen, die Zahl steht weiter unten bei den Maschinen.
  warten:{kurz:'Maschinen warten',get text(){return `Nach der Lese jede Maschine unter ${MGR_WART_AB} % auf 100 % warten, ausgefallene Erntemaschinen sofort`}},
  helfer:{kurz:'Erntehelfer einstellen',text:'Fehlende Erntehelfer einstellen, auch Fahrer für die Maschinen. Vor der Lese die Helfer für die Handlese, danach gehen sie wieder'},
  regal:{kurz:'Regal füllen',text:'Das Regal deiner Weinhandlung füllen'}
};
// Reihenfolge je Rang wie im Freischalt-Plan, so stehen sie auch im Aufstiegstext.
const MANAGER=[
  {bereich:'handel',stufe:1,aufgaben:['handel']},
  // Seit 8.5 (Maik 18.11.2026): Stufe 1 keltert, Stufe 2 füllt ab. Vorher war es umgekehrt, Keltern fühlt sich mehr nach Kellermeister an.
  // Seit 13.3.3 macht niemand mehr Sekt von Hand oder als Manager, er entsteht bei der Lese der Sekt-Sorte.
  {bereich:'keller',stufe:1,aufgaben:['fass','lager']},
  {bereich:'weingut',stufe:1,aufgaben:['helfer']},
  {bereich:'handel',stufe:2,aufgaben:['laeden','export']},
  {bereich:'keller',stufe:2,aufgaben:['flaschen']},
  {bereich:'weingut',stufe:2,aufgaben:['warten']},
  {bereich:'handel',stufe:3,aufgaben:['regal']},
  {bereich:'weingut',stufe:3,aufgaben:[]},
  {bereich:'keller',stufe:3,aufgaben:[]}
].map(e=>Object.defineProperty(Object.defineProperty(Object.assign(e,{kosten:MGR_KOSTEN[e.stufe-1]}),'lohn',{get:()=>lohnF(MGR_LOHN[e.stufe-1]),enumerable:true}),'rang',{get:()=>FREI['mgr_'+e.bereich+e.stufe].r}));
// Schummelei: Kälteeinbruch im November, Panschen, Weinkontrolle. Alle Zahlen an einer Stelle. Die Sabotage ist seit 13.5.9 raus (bis 13.6: SAB_ und WSAB_).
// Seit 13.4.1: Frost im Winterwetter (Dezember bis Februar) für alle Gebiete gleich, der alte Wert der Mitte (Annahme von Claude, frost je Gebiet ist weg).
const WINTER_FROST=.25;
const ZUCKER_MAX=20, ZUCKER_ERLAUBT=10, SCHMIER_ANTEIL=.1, SCHMIER_MIN=2000;
const STRAFE_MIN=10000, STRAFE_ANS=30, STRAFE_ANS_WEITER=10, BESTECH_MIN=5000, BESTECH_MAX=50000, BESTECH_NEIN_ANS=20;
// Version 10.0 (Spielende, Paket 1): Amtszeit und Wahl. Als Präsident ist alle WAHL_JAHRE Jahre Wahl, gerechnet in Monaten ab dem Amtsantritt.
// WAHL_UMFRAGE Monate vorher kommt die Umfrage, ab da läuft der Wahlkampf. Die Stimmung im Verband (0 bis 100) startet bei STIMM_START,
// nach einer Abwahl bei STIMM_ALT. Der Herausforderer ist die Marke auf dem Balken: MARKE_START, je gewonnener Wahl MARKE_PLUS mehr, höchstens MARKE_MAX.
// Stimmenkauf: KAUF_PREIS für KAUF_PLUS Punkte, höchstens KAUF_MAX je Wahl, fliegt mit KAUF_SKANDAL auf und kostet dann KAUF_STRAFE Stimmung.
// Die ersten beiden Zeilen hat Maik am 18.11.2026 gewählt. STIMM_PLUS (Anteil vom gewonnenen Ansehen) und STIMM_MONAT (Abzug je Monat) stellt das Prüfskript ein:
// Startwert war .2 und 1. Gemessen am 18.11.2026 (54 Partien über 150 Jahre auf Mittel, volles Programm): mit .2 lag die Stimmung am Wahltag bei 85, mit .16 bei 68 (Ziel 65 bis 75).
// STIMM_MINUS lässt Abzüge beim Ansehen voll durchschlagen. Seit 11.5 (Teil A) ist alles Ansehen verdoppelt, deshalb sind STIMM_PLUS (vorher .16) und STIMM_MINUS (vorher 1) halbiert, die Stimmung schlägt aus wie vorher.
// Seit 13.6.9 (Nachtrag 3, Maik 22.11.2026): Die erste Wahl kommt WAHL_ERSTE Monate nach dem Amtsantritt, die Umfrage damit gleich mit dem Amt.
// Danach alle WAHL_JAHRE Jahre wie bisher.
const WAHL_ERSTE=12;
const WAHL_JAHRE=5, WAHL_UMFRAGE=12, STIMM_START=60, STIMM_ALT=40, MARKE_START=50, MARKE_PLUS=5, MARKE_MAX=70;
const KAUF_PREIS=300000, KAUF_PLUS=5, KAUF_MAX=2, KAUF_SKANDAL=.2, KAUF_STRAFE=15;
const STIMM_PLUS=.08, STIMM_MONAT=1, STIMM_MINUS=.5;
// Version 10.1 (Spielende, Paket 2): Weltweinschau und die zwei Enden. Die ersten zwei Zahlen hat Maik am 18.11.2026 gewählt.
// STIFT_FAKTOR: Preis der Stiftung im Verhältnis zur verpassten Spende. MARKE_ABWAHL: so weit sinkt die Marke nach einer Abwahl, nie unter MARKE_START.
// Seit 13.6.4 ist AMT_MIN weg (die Familie wartet nicht mehr auf den Präsidenten). Seit 13.6.3 stehen Monate und Feld der Weltweinschau bei KRONEN.
// Derselbe Wein darf jedes Jahr wieder antreten (Variante 3, Maik 19.11.2026).
const STIFT_FAKTOR=2, MARKE_ABWAHL=10;
// Seit 13.6.3 (Bauplan 13.6, Maik 21.11.2026): Weltweinschau mit drei Kronen in fester Reihenfolge, jedes Jahr genau eine Klasse mit einem Wein.
// Anmeldung im WELT_ANM (Januar, zusammen mit den Prädikatsweinen), die Schau im WELT_MONAT (Juni), gewertet beim Monatswechsel danach.
// Verloren heißt nächstes Jahr dieselbe Klasse noch mal, eine gewonnene Krone bleibt, auch nach einer Abwahl. KRONE_ANS Ansehen je Krone, seit 13.6.8 als Endwert ohne ANS_F.
// KRONEN: stufen sind die zugelassenen Weine (sekt: ein Sekt), fav der große Favorit der Klasse (Namen seit 13.8), p seine mittleren Punkte.
// Der Favorit hat p ± WELT_FAV_W, die acht anderen Weingüter p − WELT_FELD_AB[0] bis p − WELT_FELD_AB[1], dazu DIFF.feld.
// Startwerte (Bau 13.6.3): p gegen die besten passenden Weine des Test-Spielers ab Jahr 90 (sechs Gebiete), Zielchancen Sekt 60, Prädikat 50,
// Rarität 35 Prozent, mit dem Jahrhundertwein (JH_QP) 70. Gemessen wird in 14.1. WELT_FAV_PLUS: neutraler Haken für stärkere Favoriten in der Meisterprüfung (13.7).
const WELT_ANM=0, WELT_MONAT=5, WELT_FAV_W=8, WELT_FELD_AB=[35,15], WELT_FAV_PLUS=0, KRONE_ANS=140;
// Seit 13.7.5 (Entscheidung 10): Form des Favoriten aus seinem Wurf ±WELT_FAV_W, stark ab +WELT_FORM_AB, schwach ab −WELT_FORM_AB, sonst wie immer.
// Auf Stufen mit DIFF.form steht sie in der Rangliste und im Monat WELT_FORM_MON (Mai) im Winzerboten. Wortlaut seit 13.8, {fav} ist der Favorit.
const WELT_FORM_AB=3, WELT_FORM_MON=4;
const WELT_FORM={stark:['in starker Form','{fav} soll einen Wein im Keller haben, über den ganz Europa spricht.'],
  normal:['in gewohnter Form','{fav} tritt an wie jedes Jahr, stark, aber ohne Überraschung.'],
  schwach:['in schwacher Form','Bei {fav} soll der Jahrgang nicht gelungen sein, heißt es unter den Kennern.']};
const KRONEN=[
  {k:'sekt',name:'Sekt-Krone',sym:'🍾',sekt:1,stufen:[],was:'einem Sekt',fav:'Maison Tessancourt, Champagne',p:43,gesch:'Seit sieben Generationen lagern die Tessancourts ihre Flaschen in Kreidekellern unter Reims, tiefer als jeder Kirchturm im Ort hoch ist. Madame Éloïse Tessancourt rüttelt die besten Flaschen bis heute von Hand und sagt, ein Schaumwein verrate seine Eile beim ersten Schluck. Bei der Weltweinschau hat das Haus die Sekt-Krone öfter geholt als alle anderen zusammen.'},
  {k:'praed',name:'Prädikats-Krone',sym:'🍷',stufen:['kab','spat','aus'],was:'einem Kabinett, einer Spätlese oder einer Auslese',fav:'Weingut Uferstein, Wachau',p:51,gesch:'Die Steinterrassen von Uferstein hängen in der Wachau steil über der Donau, und Großvater Leopold hat sie nach jedem Hochwasser Stein für Stein neu aufgeschichtet. Seine Enkelin Theresa liest erst, wenn der Herbstnebel vom Fluss abzieht, keinen Tag früher. Ihre Spätlesen gelten als die feinsten der Welt.'},
  {k:'rar',name:'Raritäten-Krone',sym:'💎',stufen:['ba','eis','tba'],was:'einer Beerenauslese, einem Eiswein oder einer Trockenbeerenauslese',fav:'Hollóvár Pince, Tokaj',p:160,gesch:'Unter der Rabenburg Hollóvár liegen die Keller so tief im Vulkanstein, dass die Wände schwarz vom Kellerschimmel sind. Die Familie Szalay wartet dort jedes Jahr auf die Edelfäulnis und zählt die Beeren einzeln, wenn sie kommt. Wer gegen Hollóvár um die Raritäten-Krone antritt, braucht schon einen Jahrhundertwein.'}];
// Seit 13.8.6: die Feier zu jeder Krone, {wein} ist der Siegerwein. Die dritte Krone ist zugleich der Sieg.
const KRONE_FEIER={
  sekt:['{wein} hat Maison Tessancourt geschlagen, und Madame Tessancourt gratuliert mit einem kleinen, sehr französischen Nicken.','Am Holzbogen zieht der Bürgermeister die erste Fahne hoch, die 🍾 Sekt-Krone.','Daneben hängen noch zwei leere Haken. „Die kriegen wir auch voll“, sagt er.'],
  praed:['{wein} hat Weingut Uferstein geschlagen, und Theresa schickt eine Karte mit einem einzigen Wort: „Verdient.“','Am Holzbogen zieht der Bürgermeister die zweite Fahne hoch, die 🍷 Prädikats-Krone.','Ein Haken ist noch frei. „Für die Raritäten-Krone“, sagt er und schaut dich dabei sehr lange an.'],
  rar:['{wein} hat sogar Hollóvár Pince geschlagen, und das im eigenen Dorf.','Am Holzbogen zieht der Bürgermeister die dritte Fahne hoch, jetzt ist kein Haken mehr frei.','Er hat Tränen in den Augen und behauptet, das sei der Rauch vom Feuerwerk.']};
const WELT_GUETER=['Château Belmont, Frankreich','Tenuta Montefiore, Italien','Bodega Sierra Alta, Spanien','Quinta do Vale Dourado, Portugal','Weingut Hochrain, Österreich','Domaine du Lac, Schweiz','Eagle Canyon Estate, Kalifornien','Southern Cross Vineyards, Australien','Kaapse Hoop, Südafrika','Viña Cóndor, Chile','Finca Los Andes, Argentinien','Kiwi Ridge Winery, Neuseeland'];
// ki: Tempo der Gegner, eingestellt mit dem Test-Spieler in Schritt H von 7.0 (16.11.2026). Der erste Gegner wird Präsident auf Schwer in Jahr 106 bis 112,
// auf Mittel um Jahr 139, auf Einfach in 170 Jahren nie. Das alte Ziel "auf Schwer jede vierte Partie" gilt seit 11.6 nicht mehr.
// Seit 11.6 (Maik 20.11.2026): Auf Schwer steht das Ansehen des Spielers wie auf Mittel bei 1 (vorher 0,9). Es bleiben die schnelleren Gegner (ki) und das stärkere
// Wettbewerbsfeld (feld). Ziel (Maik 20.11.2026 spät): Der Test-Spieler ist in 40 bis 50 % der Partien vor dem ersten Gegner Präsident (vorher 45 bis 60 %).
// Gemessen am 20.11.2026 (54 Partien über 170 Jahre, damals mit Schädlingen auf allen Stufen): mit ki 0,77 ist er in 36 von 54 Partien vorn (67 %), mit 0,79 in 31 von 54 (57 %).
// Daraus hochgerechnet steht ki auf Schwer bei 0,81, gemessen am 20.11.2026 (l116_schwer_ki81): Er ist in 26 von 54 Partien vorn (48 %), einmal gleichauf. Im Fenster, keine Korrektur.
// Der erste Gegner wird seit 11.5 später Präsident als oben steht: auf Schwer im Schnitt in Jahr 133 (mit ki 0,81, in 47 von 54 Partien), auf Mittel um Jahr 158 und nur in jeder neunten Partie.
// geld: Startgeld der Stufe, ohne Eintrag gilt START_GELD (Einfach hat 20.000 € Polster). biet: Faktor auf die Bietlust der Gegner bei Land, neutral 1, nur Stellschraube.
// schaed: das Schädlingsjahr gibt es nur auf Stufen mit schaed:1, also nur in der Meisterprüfung (schaedAn). Seit 13.7.2 ohne Befall und Spritzen.
// name und text sind nur Anzeige: seit 11.6 Lehrjahre, Gesellenjahre, Meisterprüfung (Maik 20.11.2026 spät). kurz ist das alte Wort, es steht in Grau über dem Namen auf dem Knopf beim neuen Spiel.
// Die Schlüssel einfach, mittel, schwer bleiben, an ihnen hängen Spielstände und Bestenliste.
// Seit 13.7.5 (Bauplan 13.7): Erschwernisse der Meisterprüfung, nur auf Stufen mit dem Eintrag, die alten bleiben in jedem Akt. 1. Akt: markt [Schritt, unten, oben]
// für die Weinpreise (sonst MARKT_SCHWANK), land wie markt für S.landF auf Startgebot und alle Gebote der Auktionen (sonst fest 1, der Makler bleibt fest),
// klug: die Gegner bieten bis AUK_KLUG vom Wert des Loses (AUK_WERT_HA), marktSatz: Satz zum Markt im Winzerboten (MARKT_SATZ). 3. Akt: marke Punkte mehr für den
// Herausforderer beim Amtsantritt und als Untergrenze nach der Abwahl, fav Punkte mehr für die Favoriten der Weltweinschau, form: ihre Form in Worten (WELT_FORM).
const DIFF={
  einfach:{name:'Lehrjahre',kurz:'Einfach',text:'Sonne satt und Zeit zum Lernen. Du startest mit einem dicken Polster, und die Nachbarn lassen es gemütlich angehen. Genau richtig für die erste Partie.',ans:1.25,ki:.45,feld:-4,biet:1,geld:80000},
  mittel:{name:'Gesellenjahre',kurz:'Mittel',text:'So ist das Winzerleben gedacht. Die Nachbarn sind fleißig, aber mit guter Arbeit bist du vor ihnen an der Spitze.',ans:1,ki:.6,feld:0,biet:1},
  schwer:{name:'Meisterprüfung',kurz:'Schwer',text:'Trau dich! Die Nachbarn sind schnell, die Konkurrenz ist stark, und wer im Herbst wartet, muss die Zeichen lesen. Wer hier Präsident wird, hat es sich verdient.',ans:1,ki:.81,feld:3,biet:1,schaed:1,markt:[.09,.75,1.25],land:[.09,.75,1.25],klug:1,marktSatz:1,marke:5,fav:5,form:1}
};
// Seit 13.7.7 (Entscheidung 11, Maik 22.11.2026): Die Meisterprüfung (MEISTER_STUFE) ist gesperrt, bis auf diesem Gerät einmal in den Gesellenjahren (MEISTER_VON)
// ein Weingut übergeben wurde. Die Freischaltung liegt beim Gerät unter eigenem Schlüssel wie das Album, nicht im Spielstand, und reist mit der Sicherung.
// Lehrjahre zählen nicht. Ein Spielstand in den Gesellenjahren ab der Generation MEISTER_GEN auf dem Gerät schaltet beim Start frei. Laufende Meisterprüfungen spielen weiter.
const MEISTER_KEY='oechsle-meister', MEISTER_STUFE='schwer', MEISTER_VON='mittel', MEISTER_GEN=2, MEISTER_SPERRE='zuerst Gesellenjahre';
const GEGNER_TYP={
  vorsicht:{name:'Hannelore Brück',art:'die Vorsichtige',eink:[9000,12000],ans:[16,24],biet:.4,med:.2,ws:[18,30],weine:['einen Kabinett','eine Spätlese','einen Qualitätswein']},
  qualitaet:{name:'Konrad Steinfeld',art:'der Qualitätsfanatiker',eink:[8000,13000],ans:[20,30],biet:.45,med:.45,ws:[26,42],weine:['eine Auslese','eine Beerenauslese','eine Spätlese','eine Trockenbeerenauslese']},
  zocker:{name:'Ricky Maurer',art:'der Zocker',eink:[-1000,21000],ans:[8,24],biet:.5,med:.25,ws:[14,40],weine:['einen Tafelwein','eine Auslese','einen Kabinett','eine Beerenauslese']}
};
// Version 7.0 (Schritt G): Generationswechsel nach dem Fundament aus Schritt A. Zum Jahreswechsel nach je GEN_JAHRE Spieljahren übernimmt die nächste Generation (S.gen).
// Es bleiben Fläche, Reben, Keller, Wein, Maschinen, Leute, Manager, Exporthandel, alle Freischaltungen und der Rang. Vom Ansehen bleibt ERB_ANSEHEN,
// die Erbschaftssteuer ERB_STEUER geht aufs Vermögen (vermoegen, bei den Gegnern gVerm), damit Landkauf kurz vorher nichts spart.
// Reicht das Geld nicht, wird der Rest ein Kredit über ERB_LAUFZEIT Monate (S.kredit.erb), der nicht gegen den Kreditrahmen zählt. Pleite geht daran niemand.
// Die Zeitung kündigt die Übergabe GEN_VORAUS Jahre vorher an. Die Gegner übergeben nach denselben Regeln ein bis drei Jahre später (g.genVers) an einen Erben gleicher Art.
// GEN_BILD: die Flasche im Regal (Anfang), mit dem Kellerschlüssel auf dem Küchentisch (Übergabe) und offen im Festsaal (Sieg), seit Schritt I.
const GEN_JAHRE=40, ERB_ANSEHEN=.8, ERB_STEUER=.2, ERB_LAUFZEIT=48, GEN_VORAUS=2;
const GEN_BILD={anfang:'flasche-regal',uebergabe:'flasche-kueche',sieg:'flasche-festsaal'};
const ERB_NAMEN={t:['Anna','Lena','Marie','Johanna','Clara','Paula','Greta','Ida'],s:['Paul','Jonas','Felix','Lukas','Emil','Anton','Jakob','Karl']};
const GEGNER_ERBE={
  vorsicht:{namen:['Johanna','Margarete','Luise','Henriette','Mathilde','Ida'],text:(alt,neu,wo)=>`${alt} übergibt ihr Weingut ${wo} an ihre Tochter ${neu}. „Erst mal bleibt alles, wie es ist“, sagt die neue Chefin.`},
  qualitaet:{namen:['Friedrich','Maximilian','Leopold','Ferdinand','Konstantin','Albrecht'],text:(alt,neu,wo)=>`${alt} übergibt sein Weingut ${wo} an seinen Sohn ${neu}. Der soll schon als Kind die Öchsle im Kakao gemessen haben.`},
  zocker:{namen:['Kevin','Dustin','Marvin','Ronny','Jason','Mike'],text:(alt,neu,wo)=>`${alt} übergibt sein Weingut ${wo} an seinen Sohn ${neu}. Erste Amtshandlung: ein Sportwagen mit Weinkiste im Kofferraum.`}
};
// Version 7.0 (Schritt C): ein Exporthandel ab R_EXPORT statt der vier Länder. Er zahlt je nach Wein mehr als das Inland (EXPORT_F, die besten Werte der früheren Länder)
// und nimmt mit jedem Rang mehr ab: Je Exportstufe steigt das Budget des Großhandels um MARKT_EXPORT, eine Stufe je Rang ab R_EXPORT, höchstens EXPORT_STUFEN.
// Bis Schritt H so gestellt, dass ab Gutsherr dieselbe Menge wie früher mit vier Ländern geht. S.exLage.ex schwankt jeden Monat zwischen 0,9 und 1,12.
const EXPORT_STUFEN=4, EXPORT_F={einfach:1.12,sekt:1.25,spaet:1.3,edel:1.5};
const EXPORT_ZEILEN=[['einfach','Tafelwein bis Kabinett'],['sekt','Sekt'],['spaet','Spätlese und Auslese'],['edel','Beerenauslese, Trockenbeerenauslese und Eiswein']];
const WUNSCH={weiss:'Weißwein',rot:'Rotwein',sekt:'Sekt',edel:'Auslese und höher'};
const NACHBARN=['Familie Kessler','Winzer Albrecht','Gebrüder Thielen','Winzerin Maas','Familie Dörr','Winzer Paulus','Winzerin Ohlig','Familie Brandner'];
const GUETER=['Weingut Dreistein','Weingut Zur Alten Kelter','Weingut Rosenhang','Winzerhof Falkenruh','Weingut Sommerau','Weingut Am Kirchpfad','Weingut Hohlweg','Weingut Sonnenlay','Winzerhof Mertensgrund','Weingut Abtsgarten','Weingut Lindenhof','Weingut Silberbach'];
const WETTNAME={land:'Landesprämierung',bund:'Bundeswettbewerb',welt:'Weltweinschau'};
const PREISE={
  welt:[{m:'🌍',t:'Platz 1',ans:100,qp:10,geld:10000},{m:'🥈',t:'Platz 2',ans:64,qp:7,geld:5000},{m:'🥉',t:'Platz 3',ans:40,qp:5,geld:2000}],
  land:[{m:'🥇',t:'Gold',ans:24,qp:6,geld:0},{m:'🥈',t:'Silber',ans:18,qp:4,geld:0},{m:'🥉',t:'Bronze',ans:12,qp:2,geld:0}],
  bund:[{m:'🏆',t:'Platz 1',ans:50,qp:10,geld:5000},{m:'🥈',t:'Platz 2',ans:32,qp:7,geld:2500},{m:'🥉',t:'Platz 3',ans:20,qp:5,geld:1000}]
};
// Paket D: schwankende Preise, Ereignisse und das Neue je Rang. Alle Zahlen an einer Stelle.
// LAGER_SCHWANK: so weit schwanken Fassraum und Flaschen. REBEN_ANGEBOT: Rabatt auf eine Sorte je Monat in der Pflanzzeit.
// Eigene Weinhandlung: verkauft im Monat Regalwein bis LADEN_EIGEN Euro Listenwert zum LADEN_EIGEN_F-Fachen. Weinbotschafter: BOTSCHAFT_ANS jeden Januar.
// Hoffest: kostet HOFFEST_PREIS, bringt HOFFEST_ANS Ansehen mal Wetter-Faktor. Kontrolle anregen: Fund kostet den Gegner ANREG_ANS, Fehlalarm dich ANREG_FEHL.
// PANSCH: so oft panschen die Gegner im Oktober. Spitzenlage: SPITZE_HA Hektar ab SPITZE_START, bringt SPITZE_ANS Ansehen und SPITZE_OE Grad mehr im Juli.
const LAGER_SCHWANK=.2, REBEN_ANGEBOT=.15, LADEN_EIGEN=6000, LADEN_EIGEN_F=1.45, BOTSCHAFT_ANS=20, HOFFEST_PREIS=180000, HOFFEST_ANS=32;
const HOFFEST_WETTER={sonnig:1.25,mild:1,regen:.7,kalt:.85,frost:.85};
const BESTEN_KEY='oechsle-besten';
const ANREG_ANS=60, ANREG_FEHL=6, PANSCH={zocker:.4,vorsicht:.08,qualitaet:.04}, SPITZE_HA=2, SPITZE_START=200000, SPITZE_OE=5, SPITZE_ANS=30, LOHN_BILLIG=1900;
// Paket 4 (15.11.2026): Ziele fürs Geld und Land ohne Auktionsglück.
// Makler: ab Jungwinzer Land zum MAKLER_PREIS je Hektar, nur wenn für den nächsten Rang allein noch Land fehlt. Auktionen bleiben deutlich billiger.
// Seit 11.5 (Teil B) wächst sein Angebot mit dem Rang: MAKLER_HA Hektar im Jahr je Rang (Idee Maik 20.11.2026, Zahlen von Claude). Bis 11.4 war es immer einer.
// Weinfest: ab Winzermeister bis zum Hoffest, einmal im Jahr von Juni bis August, kostet WEINFEST_PREIS und bringt WEINFEST_ANS Ansehen mal Wetter-Faktor.
// Kellerausbau: drei Stufen (KELLER_PREISE), seit 8.6 gestaffelt nach KELLER_RANG: Jungwinzer, Winzermeister, Gutsherr (Maik 18.11.2026, vorher alle ab Jungwinzer). Jede Stufe kürzt die Reifezeit von Prädikatswein und Eiswein in der Flasche um einen Monat, und jeder Wein gewinnt beim Reifen KELLER_REIFE schneller an Wert.
// Seit 11.6: KELLER_NAMEN gibt den drei Stufen im Kellerausbau Namen, nur für die Anzeige. S.keller bleibt die Zahl der Stufen.
// Seit 13.5.8 (Maik 22.11.2026, Entscheidung 9): Die Freigabe hängt nicht mehr am Rang (KELLER_RANG ist weg), sondern am ersten angemeldeten Wein der Stufe in KELLER_WEIN:
// Stufe 1 mit dem ersten Kabinett, Stufe 2 mit der ersten Spätlese, Stufe 3 mit der ersten Auslese. Ein höherer Wein gibt die Stufen darunter mit frei. Die Wirkung bleibt.
const MAKLER_PREIS=45000, MAKLER_HA=[0,1,1,1,2,2,2,3,3,3], WEINFEST_PREIS=30000, WEINFEST_ANS=10, KELLER_PREISE=[50000,120000,250000], KELLER_NAMEN=['Edelstahltank','Großes Holzfass','Barrique-Keller'], KELLER_REIFE=.1, KELLER_WEIN=['spat',null,'aus'], R_WEINFEST=FREI.weinfest.r;
// Seit 14.4.2 (Grundsatz der drei Sorten): Stufe 1 (Edelstahltank) mit der ersten Spätlese, Stufe 2 (Großes Holzfass) am Rang KELLER_RANG (Gutsherr),
// Stufe 3 (Barrique-Keller) mit der ersten Auslese. Je Stufe gilt entweder der Wein in KELLER_WEIN oder der Rang in KELLER_RANG.
// KELLER_ROLLE ist weg (13.3.7 bis 14.2: Stufe 2 mit der ersten Spätlese der Spitzen-Sorte), es zählt jede Sorte.
const KELLER_RANG=[null,5,null];
// Seit 13.3.7 (Nachtrag 3): Beim Aufstieg zum Jungwinzer schenkt der alte Winzer GESCHENK_HA Hektar kahlen, einfachen Hang, der Makler übergibt ihn. Text Wortlaut seit 13.8.
const GESCHENK_HA=1, GESCHENK_TEXT='🎁 Der alte Winzer schiebt dir einen Umschlag über den Zaun: einen Hektar kahlen Hang am Dorfrand, geschenkt. „Hab ich vor vierzig Jahren gekauft und nie bepflanzt. Bei dir wird das was.“ Die Papiere liegen beim Makler im Rathaus, pflanzen musst du selbst.';
// Seit 13.8.6 (Bauplan 13.8, Maik 22.11.2026): Zeile im Winzerboten zur neuen Pflegestufe ({sorte}) und zur Boden-Stufe, dazu die Momente, die einmal je Partie kommen (S.gesch).
// Terroir hat keinen eigenen Satz, dort bleibt die alte Zeile. suedAuk kommt mit dem ersten ersteigerten Südhang, auch der Spitzenlage, als Zeile im nächsten Winzerboten.
const PFLEGE_BOTE=[null,'✂️ {sorte} ist jetzt Rebstock! Ab diesem Jahr gibt es die volle Ernte.','✂️ {sorte} ist jetzt Premier Cru. Gute Pflege zahlt sich aus, der Deckel steigt.','✂️ {sorte} ist jetzt Grand Cru, die höchste Pflegestufe.'];
const BODEN_BOTE=[null,['🌱 Fruchtboden! Dein Boden hebt den Deckel, der Kabinett rückt näher.','Beim Hacken kommen die ersten Regenwürmer hoch, dick wie Bleistifte, und der alte Winzer strahlt, als hätte er Gold gefunden.'],['🌱 Gutsboden! Jetzt reicht es für die erste Spätlese.']];
const GESCH_TEXT={rebstock:'🍇 Der alte Winzer geht die Zeilen ab, zupft an einem Blatt und nickt. „Jetzt sind es Reben.“',
  premier:'🏷️ Die Druckerei bringt die neuen Etiketten, zum ersten Mal steht „Premier Cru“ auf deiner Flasche. Das erste klebst du selbst, ganz gerade, mit beiden Daumen.',
  suedAuk:'🍀 Beim ersten Spatenstich auf deinem neuen Südhang staunst du: Der Boden ist dunkel und locker, als hätte ihn jemand jahrelang gepflegt. Der Makler zuckt mit den Schultern, der Vorbesitzer sei wohl ein heimlicher Gärtner gewesen. Für die Spitzen-Sorte hättest du kein besseres Stück finden können.',
  vollendet:'🌄 Dein Weinberg ist vollendet. Die Alten sagen, auf so einem Boden kommen bald die ganz großen Jahre.'};
// Seit 13.8.7 (Maik 22.11.2026): Feier-Fenster beim ersten Grand Cru je Rolle und beim vollendeten Weinberg (Terroir und Spitzen-Sorte Grand Cru, egal was zuletzt kommt).
// Nur Geschichte, kein Bonus. Die drei Grand-Cru-Feiern teilen ein Bild, der vollendete Weinberg hat ein eigenes, beides Platzhalter bis 14.3.
const GC_FEIER={
  menge:{bild:'herbst',ort:'🍇 Im Weinberg',h:'Grand Cru für den {sorte}',p:['Auf dem Etikett deines {sorte} steht jetzt Grand Cru, die höchste Pflegestufe.','Die Nachbarn kommen extra am Hang vorbei und tun so, als wären sie nur spazieren.','Abends gibt es ein Glas auf der Bank vor der Scheune, und {ratte} bekommt ein Extrastück Käse.']},
  sekt:{bild:'herbst',ort:'🍾 Im Sektkeller',h:'Grand Cru für den {sorte}',p:['Dein {sorte} ist Grand Cru, und der Sekt daraus perlt so fein wie nie.','Im Sektkeller knallt ein Korken, und diesmal erschrickt nicht einmal {ratte}.','Die Blaskapelle übt schon ein Lied dafür, es heißt vorläufig „Grand Cru mit Kohlensäure“.']},
  spitze:{bild:'herbst',ort:'☀️ Am Südhang',h:'Grand Cru für den {sorte}',p:['Dein {sorte} am Südhang ist Grand Cru, die höchste Pflegestufe für deinen Spitzenwein.','Der Bürgermeister lässt sich die Zeilen zeigen und flüstert, als stünde er in der Kirche.','Zum vollendeten Weinberg fehlt nur noch der Boden, aber die Reben sind schon so weit.']},
  vollendet:{bild:'spitzenlage',ort:'🌄 Am Südhang',h:'Der vollendete Weinberg',p:['Terroir im Boden, Grand Cru am Südhang: Dein Weinberg ist vollendet.','Das halbe Dorf steigt den steilen Hang hinauf, sogar der Pfarrer, der sonst nur bergab geht.','Oben steckst du ein kleines Schild in die Erde: „Hier hat alles gepasst.“']}};
const FESTE={weinfest:{name:'Weinfest',preis:WEINFEST_PREIS,ans:WEINFEST_ANS,text:'Ein Weinfest im Hof mit Zelt, Musik und deinem Wein',kurz:'Musik, Zwiebelkuchen und dein Wein für Nachbarn und Gäste'},hoffest:{name:'Hoffest',preis:HOFFEST_PREIS,ans:HOFFEST_ANS,text:'Ein großes Fest für das ganze Dorf',kurz:'Musik, Flammkuchen und dein Wein für das ganze Dorf'}};
// Erntemaschinen (Paket 4, Variante C): die kleine ab Winzermeister, der große Vollernter ab Gutsherr. Maschinen ohne Typ (alte Spielstände) sind klein und bleiben, auch vor Winzermeister.
// Seit 11.5 (Teil C2): Der Vollernter deckt einen großen Betrieb allein ab, VOLL_HELFER Hektar (bis 11.4: 10 Hektar, 10.000 Reben, 120.000 €, Wartung 300 € je Punkt).
const VOLL_PREIS=450000, VOLL_LEISTUNG=25000, VOLL_HELFER=25, VOLL_WARTUNG=1000;
// Seit 13.3.4: Erntemaschine und Vollernter haben eigene Ränge, damit sie nicht mit Landesprämierung und Bundeswettbewerb wandern. Die Maschinen kommen in 13.5 neu.
const R_ERNTE=FREI.masch_klein.r, R_VOLL=FREI.masch_gross.r;
// Version 8.0 (Paket A, Maik 17.11.2026): Jede Maschine hat im Spielstand einen Typ (ma.typ, Schlüssel in MASCH) und braucht fahrer Leute aus leute (hier Erntehelfer).
// Fahrer-Regel: Eine Maschine ist nur im Einsatz, wenn ihr Zustand mindestens MASCH_ROT ist und genug Fahrer frei sind. Die größten Maschinen bekommen zuerst ihre Fahrer.
// Nur Maschinen im Einsatz zählen als Helfer und bei der Ernteleistung. Fahrer bleiben dabei Erntehelfer und zählen selbst mit (Annahme von Claude aus dem Auftrag).
// Punkte: Gelb unter MASCH_GELB, Rot unter MASCH_ROT (fällt aus, bis sie gewartet ist). Abnutzung nur bei der Lese (maschAbnutzung).
// Paket B (Maik 17.11.2026): drei Bonus-Maschinen, je eine im Betrieb, eine Maschine je Rang (Düngerstreuer 2, Erntemaschine 3, Laubschneider 4, Vollernter 5, Abfüllanlage 6).
// Sie zählen nicht als Helfer und lesen nicht. Bei Rot oder ohne Fahrer gibt es keinen Halt, nur der Bonus fällt weg. Preise sind Vorschlag von Claude.
// Düngerstreuer: Düngen kostet STREU_RABATT weniger und bringt STREU_PLUS statt DUENG_PLUS Punkte Boden, Abnutzung STREU_ABN je Düngung.
// Laubschneider: Sommerschnitt im Juni, jede Lese des Jahres bekommt LAUB_QP Qualitätspunkte mehr, dazu LAUB_ANS Ansehen. Abnutzung LAUB_ABN je Sommer.
// Abfüllanlage: ABF_PLUS mehr Flaschen aus jedem Fass, ein Lagerarbeiter betreut ABF_FLASCHEN statt FLASCHEN_JE_LAGERARB leere Flaschen.
// Abnutzung ABF_ABN je ABF_NORM abgefüllte Flaschen (rund ein Jahr auf 10 Hektar). Bedient wird sie von einem Lagerarbeiter.
const STREU_PREIS=8000, STREU_WARTUNG=30, STREU_ABN=5, DUENG_PLUS=30, STREU_PLUS=40, STREU_RABATT=.3, R_STREU=FREI.masch_duenger.r;
// Seit 13.5.5: Der Laubschneider bringt LAUB_QP Punkte und LAUB_MENGE mehr Menge bei allen Sorten (bis 13.4: 1 Punkt), kein Öchsle. Die LAUB_ANS Ansehen bleiben.
// Seit 14.2.6 (Entscheidung 28): LAUB_QP 5 (bis 14.2.5: 4).
const LAUB_PREIS=20000, LAUB_WARTUNG=60, LAUB_ABN=15, LAUB_QP=5, LAUB_MENGE=.05, LAUB_ANS=4, R_LAUB=FREI.masch_laub.r;
const ABF_PREIS=60000, ABF_WARTUNG=200, ABF_ABN=15, ABF_NORM=40000, ABF_PLUS=.05, ABF_FLASCHEN=75000, R_ABF=FREI.masch_abfuell.r;
// Seit 13.5.5 (Maik 21.11.2026): Stufe 2 der Abfüllanlage ist ein Ausbau der vorhandenen (ma.stufe 2, frei über masch_abfuell2): ABF_PLUS2 mehr Flaschen,
// ein Lagerarbeiter betreut ABF_FLASCHEN2 leere Flaschen. Der Preis ist noch einmal der der Stufe 1, ein Startwert für 14.2.
const ABF_PLUS2=.1, ABF_FLASCHEN2=90000, ABF_PREIS2=ABF_PREIS;
// Reihenfolge wie die Ränge, so stehen sie auch im Feld Maschinen. f:1 heißt "die" (Dein/Deine, er/sie), ernte:1 liest bei der Lese mit.
const MASCH={duenger:{name:'Düngerstreuer',preis:STREU_PREIS,leist:0,helfer:0,wart:STREU_WARTUNG,rang:R_STREU,fahrer:1,leute:'helfer',bonus:1,text:'streut den Dünger gleichmäßig'},
  klein:{name:'Erntemaschine',preis:MASCH_PREIS,leist:MASCH_LEISTUNG,helfer:MASCH_HELFER,wart:WARTUNG,rang:R_ERNTE,fahrer:1,leute:'helfer',ernte:1,f:1,eins:MASCH_EINE,text:'die Maschine für die Menge'},
  laub:{name:'Laubschneider',preis:LAUB_PREIS,leist:0,helfer:0,wart:LAUB_WARTUNG,rang:R_LAUB,fahrer:1,leute:'helfer',bonus:1,text:'macht im Juni den Sommerschnitt'},
  gross:{name:'Vollernter',preis:VOLL_PREIS,leist:VOLL_LEISTUNG,helfer:VOLL_HELFER,wart:VOLL_WARTUNG,rang:R_VOLL,fahrer:2,leute:'helfer',ernte:1,text:'die große Maschine für weite Lagen'},
  abfuell:{name:'Abfüllanlage',preis:ABF_PREIS,leist:0,helfer:0,wart:ABF_WARTUNG,rang:R_ABF,fahrer:1,leute:'lagerarb',bonus:1,f:1,text:'füllt ab, ohne dass etwas danebengeht'}};
// Bonus der drei neuen Maschinen, für Fenster und Infotafeln.
const MASCH_BONUS={duenger:()=>`Düngen kostet ${Math.round(STREU_RABATT*100)} % weniger und bringt ${STREU_PLUS} statt ${DUENG_PLUS} Punkte Boden`,
  laub:()=>`Sommerschnitt im Juni: Jede Lese des Jahres bekommt ${LAUB_QP} Qualitätspunkte und ${Math.round(LAUB_MENGE*100)} % mehr Menge, dazu ${LAUB_ANS} Ansehen`,
  abfuell:()=>{const z=S&&S.maschinen.some(x=>x.typ==='abfuell'&&x.stufe>=2); return `${Math.round((z?ABF_PLUS2:ABF_PLUS)*100)} % mehr Flaschen aus jedem Fass, ein Lagerarbeiter betreut ${num(z?ABF_FLASCHEN2:ABF_FLASCHEN)} statt ${num(FLASCHEN_JE_LAGERARB)} leere Flaschen`}};
// Abnutzung je Lese: ABNUTZ_VOLL Prozentpunkte bei voller Auslastung im Jahr, anteilig darunter, mal Pflege-Faktor aus PFLEGE nach dem Zustand vor der ersten Lese des Jahres.
// Nie unter MASCH_MIN. Der Weingut-Manager wartet ab Stufe 1 (seit Paket B, vorher 2) nach der Lese jede Maschine unter MGR_WART_AB auf 100 %.
const MASCH_GELB=60, MASCH_ROT=30, MASCH_MIN=10, ABNUTZ_VOLL=35, PFLEGE=[[80,.8],[60,1],[0,1.4]], MGR_WART_AB=80;
// Seit 11.5 (Teil C2, Maik 20.11.2026): Vorteil des Weingut-Managers auf Stufe 3. Alle Maschinen nutzen sich um MGR_ABNUTZ weniger ab (0 = kein Vorteil).
const MGR_ABNUTZ=.2;
// Was beim Maschinenschaden passiert ist, je Maschine.
const MASCH_SCHADEN={klein:'hat einen Felsbrocken erwischt',gross:'hat einen Felsbrocken erwischt',duenger:'ist an einem Weinbergspfahl hängen geblieben',laub:'hat sich im Drahtrahmen verheddert',abfuell:'hat sich an einer zersprungenen Flasche verschluckt'};
const AUK_ZU_GROSS='Das Los ist zu groß für deinen Rang.';
// Menü (seit 4.0): drei Hauptreiter unten (Weingut, Kellerei, Stadt), direkt darüber die Leiste mit ihren Orten. Wischen über das Bild wechselt auch den Ort.
// Die Reihenfolge der Orte folgt den Motiven im Panoramabild von links nach rechts. Je Ort: Kennung und Symbol für den Titel im Bild.
const FASS='<img class="fass" src="bilder/fass.png" alt="">';
const SUBS={
  gut:[['berg','🍇'],['betrieb','🏡'],['aktuell','📌'],['maschinen','🚜'],['buero','🏆']],
  keller:[['buch','📜'],['sabotage','🐀'],['start',FASS],['lager','📦']],
  // Seit 10.6 (Maik 20.11.2026): Großhandel mit Waage statt Laden, Arbeitsamt mit Winzer statt Bauarbeiter.
  stadt:[['amt','🏛️'],['handel','⚖️'],['laeden','🍷'],['bank','🏦'],['arbeit','🧑‍🌾']]
};
const START_SUB={gut:'betrieb',keller:'start',stadt:'amt'};
// Kurze Namen für die Unterreiter-Leiste unten.
const SUB_NAME={berg:'Weinberg',betrieb:'Betrieb',aktuell:'Aktuelles',maschinen:'Maschinen',buero:'Büro',buch:'Weinarchiv',sabotage:'Hintertür',start:'Keller',lager:'Lager',amt:'Rathaus',handel:'Großhandel',laeden:'Weinhandel',bank:'Bank',arbeit:'Arbeitsamt'};
// Seit 13.1 (Maik 21.11.2026): Spielstände von vor dem großen Umbau (bis 12.9.5, Marke v7) laufen nicht weiter. Neue tragen v13, lies gibt nur diese zurück.
// liesAlt findet alle älteren. Sie bleiben liegen, bis ein neues Spiel den Platz überschreibt oder der Spieler sie löscht. Album und Bestenliste liegen getrennt und bleiben.
// Davor (seit 7.0, Maik 16.11.2026) galt dasselbe mit der Marke v7 für Stände aus 5.1 und älter.
const ALT_SATZ='Dieser Spielstand stammt aus der Zeit vor dem großen Umbau und läuft hier nicht weiter. Album und Bestenliste bleiben, hier fängt eine neue Familie an.';
// Seit 12.2 (Maik 20.11.2026, Frage 4): Beim ersten Kauf jeder Maschinenart und beim Sektkeller schreibt der Winzerbote im nächsten Monat einmal einen Artikel mit Bild.
// Die Käufe merkt sich S.boteKauf bis zur nächsten Ausgabe, S.maschBote welche Maschinenarten schon einen Artikel hatten.
const MASCH_KAUF={duenger:'Der Düngerstreuer hängt am Schlepper und verteilt den Dünger ab jetzt gleichmäßig zwischen den Zeilen.',
  klein:'Die Erntemaschine steht in der Scheune. Bei der nächsten Lese rüttelt sie die Beeren vom Stock.',
  laub:'Der Laubschneider steht bereit. Im Juni stutzt er die Triebe, damit Licht und Luft an die Trauben kommen.',
  gross:'Der Vollernter steht wie ein Tor in der Scheune und wartet auf die nächste Lese.',
  abfuell:'Die Abfüllanlage steht im Keller. Spülen, füllen, verkorken, alles an einem Band.'};
const MASCH_BOTE={duenger:'Im Dorf hat man es gleich gesehen: Hinter dem Schlepper hängt jetzt ein Düngerstreuer. Die Alten schwören noch auf den Eimer, die Jungen schauen neidisch.',
  klein:'Ab der nächsten Lese rollt eine Erntemaschine durch die Zeilen. Die Erntehelfer sehen es mit gemischten Gefühlen, edelfaule Trauben bleiben aber ihre Sache.',
  laub:'Wo früher im Juni Leute mit der Heckenschere durch die Zeilen liefen, fährt jetzt ein Laubschneider. Oben und an den Seiten, sauber wie beim Gärtner.',
  gross:'Ein Vollernter ist im Dorf noch selten. Er fährt aus eigener Kraft über die Rebzeile, die Kinder laufen hinterher, wenn er zum ersten Mal aus der Scheune kommt.',
  abfuell:'Im Keller läuft jetzt ein Band: spülen, füllen, verkorken, etikettieren. Kein Schluck geht mehr daneben, sagen die Lagerarbeiter, und sie klingen dabei erleichtert.'};
/* ================= Musik und Geräusche ================= */
// Sechs Musikstücke und sieben Geräusche liegen als Dateien im Ordner ton (gebaut von _medien_bauen.py). Musik und Geräusche sind getrennt abschaltbar (TON).
// Musik: Beim Ortswechsel blendet das alte Stück aus und das neue ein. Jedes Stück merkt sich seine Stelle und spielt dort später weiter.
// Kurz vor dem Ende blendet ein zweiter Abspieler vom Anfang her ein, so läuft das Stück im Kreis ohne Bruch.
// Version 7.8: Musik hat drei Stellungen: 'an' (Dauermusik wie bisher), 'kurz' (Grundstellung) und 'aus'. Alte Einstellungen: an wird kurz, aus bleibt aus.
// laut und fxLaut: Lautstärke von Musik und Geräuschen in Prozent, je ein Regler (Version 7.8, vorher fest 50 und 100).
const TON={musik:'kurz',fx:true,laut:50,fxLaut:100};
const MUSIK={gut:'weingut',keller:'kellerei',stadt:'stadt',wett:'wettbewerb',auf:'befoerderung',pfand:'pfaendung'};
// Die Lautstärke der Musik steht seit 7.8 in TON.laut (Regler). BLENDE: Sekunden fürs Überblenden beim Ortswechsel, KREIS: am Ende eines Stücks. TAKT: Schritt des Mischers in ms.
const BLENDE=1.5, KREIS=3, TAKT=50;
// Version 7.8, Stellung kurz: Beim Ortswechsel spielt das Stück KURZ Sekunden ab einer zufälligen Stelle, mit KURZ_BLENDE Sekunden Ein- und Ausblenden (Maik 17.11.2026).
// Spielstart, Feier, Beförderung, Wettbewerb und Pfändung laufen auch bei kurz in voller Länge.
const KURZ=8, KURZ_BLENDE=1;
const TOENE=['klick','menue','kasse','korken','stempel','hammer','schere','fanfare'];
const MSP={}, FXB={};
// Als Datei geöffnet (file:) laufen die Töne ohne Web Audio, weil der Browser Nachbardateien dort nicht lesen lässt.
const NETZ=location.protocol!=='file:';
// Liegt das Spiel im Hintergrund, schweigt die Musik sofort. Beim Zurückkommen blendet sie wieder ein.
// Version 8.3: Spielzeit-Uhr (Maik 18.11.2026). Sie zählt nur zum Messen und ändert am Spiel nichts.
// Läuft, solange ein Spielstand offen ist und vorne angezeigt wird. Nach ZEIT_LEER Sekunden ohne Tippen hält sie an und zieht die Leerlauf-Zeit
// seit dem letzten Tipp wieder ab, der nächste Tipp lässt sie weiterlaufen. S.zeit = Sekunden, S.zeitRang = [{r,j,s}] je Aufstieg,
// S.zeitAb = Spielmonat, ab dem gezählt wird (alte Spielstände: ab dem Laden in 8.3, dazu S.zeitAlt).
const ZEIT_LEER=60;
const PANO_TEILE={gut:{berg:'panorama-weingut-sommer-teil-1',betrieb:'panorama-weingut-sommer-teil-2',aktuell:'panorama-weingut-sommer-teil-3',maschinen:'panorama-weingut-sommer-teil-4',buero:'panorama-weingut-sommer-teil-5'},
  keller:{buch:'panorama-keller-teil-1',sabotage:'panorama-keller-teil-2',start:'panorama-keller-teil-3',lager:'panorama-keller-teil-4'},
  stadt:{amt:'panorama-stadt-teil-1',handel:'panorama-stadt-teil-2',laeden:'panorama-stadt-teil-3',bank:'panorama-stadt-teil-4',arbeit:'panorama-stadt-teil-5'}};
const PANO_BILD=[1536,1024];
// PANO_TAFEL: die leere Fläche der Anschlagtafel in Bildpixeln (links, oben, rechts, unten). Darauf steht der Schild-Text, dorthin zoomt das Bild nach der Ankunft.
const PANO_TAFEL={gut:{aktuell:[418,312,848,574]}};
// Zeiten in Millisekunden (Maik 18.11.2026, Testseite _stationen.html): Gleiten, Ruhe vor dem Zoom, Zoom auf die Tafel, Zoom zurück vor dem Weggehen.
const GLEIT_MS=700, TAFEL_RUHE=300, TAFEL_REIN=900, TAFEL_RAUS=350, TAFEL_ZOOM=1.75, PANO_KURVE='cubic-bezier(.45,.05,.3,1)';
// Bild oben in einem Fenster (Weinkontrolle, Auktion, Prämierung, Rathaus, Kellerbuch, Pleite).
// Seit 10.0: Bei den neuen Bildern im Breitformat sitzt das Motiv unten (Flasche auf dem Tisch, Wahlurne). SBILD_POS schiebt den Ausschnitt dorthin.
const SBILD_POS={'flasche-kueche':'center 80%','flasche-festsaal':'center 85%',wahl:'center 85%'};
// Bild hinter der Zeitung: die Frostnacht beim Kälteeinbruch im November, sonst die Jahreszeit. Was es zu feiern gibt, zeigt das Foto in der Zeitung.
// Version 9.0: Bildergalerie "Weingut wächst". Jede Stufe (Rang 0 bis 9 = Stufe 1 bis 10) hat ein Bild je Jahreszeit, das Spiel nimmt immer das der aktuellen Stufe (Rang-Regel).
// Stufe 1 bis 4 zeigen den Torblick (3 zu 2), ab Stufe 5 den Schrägblick aufs ganze Gut (16 zu 9, "gross", langer Schwenk).
const JZ=['winter','winter','fruehling','fruehling','fruehling','sommer','sommer','sommer','herbst','herbst','herbst','winter'];
const JZ_NAME={fruehling:'Frühling',sommer:'Sommer',herbst:'Herbst',winter:'Winter'}, JZ_FOLGE=['fruehling','sommer','herbst','winter'];
// Seit 12.4.3: Nahansichten vom großen Weingut. Ab ihrer Stufe zeigt "Dein Weingut" im Winzerboten im Juni und August statt des Weinguts eine davon, reihum, Juli und der Rest des Jahres zeigen das Weingut (Maik 20.11.2026, nie im Winter).
// Stufen nach den Baupaketen: Kelterhaus ab 6, Festwiese und Gästehaus ab 8, Turm und Steillage ab 9. Im Monat eines Aufstiegs bleibt das Weingut.
const NAH=[['nah-kelterhaus',6,'Im Kelterhaus'],['nah-festwiese',8,'Auf der Festwiese'],['nah-gaestezimmer',8,'Im Gästezimmer'],['nah-turmstube',9,'Oben in der Turmstube'],['nah-steillage',9,'In der Steillage']];
// Nur die Bilder der eigenen Stufe laden (alle vier Jahreszeiten) und das Sommerbild der nächsten für die Aufstiegs-Szene. sw.js legt sie beim Laden ab.
const WG_DA=new Set();
// Anschlagtafel im Weingut-Bild (Unterreiter Aktuelles), reine Deko: Weingut, Spieler, ausgedachte Adresse und Weinbaugebiet (Maik 17.11.2026). Den Monatsrat gibt es nur noch als Sprechblase.
// Seit den Stationen (18.11.2026) steht der Text direkt auf der Tafel, ohne Blatt und Rahmen, Tinte dunkelbraun. Die Urkunde auf der Korkwand aus 8.1 ist damit weg.
// Ausgedachte Adresse je Gebiet (Annahme Claude). Die Hausnummer hängt fest am Namen des Weinguts.
const WAND_STR={mosel:'Moselweinstraße',rheingau:'Am Rheinufer',rheinhessen:'Rebenweg',pfalz:'Weinstraße',franken:'Am Steinberg',wuerttemberg:'Neckarhalde'};
// Seit 12.3 (Maik 20.11.2026): fester Satz "Weinhof und Weinberg der Familie" über dem Namen, Name in Alegreya SC fett, Winzer in Alegreya kursiv statt Fraktur und Schreibschrift, damit alles lesbar ist.
// Seit 12.3.5 "Tinte": Name dunkel mit leichtem Glanz, Winzer weinrot, Ornament statt Trennstrich, Gebiet in Kapitälchen.
// Schreibt den Schild-Text auf die Tafel. Er hängt in der Ebene des Bilds und gleitet und zoomt deshalb mit. Lange Namen schrumpfen, bis sie passen (gemerkt je Text und Breite).
const TAFEL_FIT={};
// Eine Ebene mit dem Bild eines Unterreiters, unter der Titelzeile. Hat das Bild eine Tafel, kommt der Schild-Text dazu.
const TEILE_DA=new Set();
// Seit 11.5 (Teil C1): Ruf des Hauses, vorerst nur die Rechnung (Anzeige, Ehrungen und Texte baut Teil D). Sieben Stufen bei RUF_STUFEN Siegeln im Weinkompendium,
// jede hebt den Erlös bei jedem Weinverkauf um RUF_BONUS: Großhandel, Exporthandel, Weinhandlungen, eigene Weinhandlung, Sekt und Federweißer (Maik 20.11.2026).
// erloes(b) ist die Zeile im Erlös. Das Budget des Großhandels (S.absatz) rechnet weiter mit dem Listenpreis. RUF_BONUS=0 schaltet für Messläufe ab.
const RUF_STUFEN=[3,6,10,15,20,25,30], RUF_BONUS=.01;
// Seit 11.5 (Teil D): Jede Stufe bringt eine Ehrung (RUF_NAMEN, Vorschlag von Claude, Maik sieht sie vor dem Hochladen). S.meilen merkt die erreichten Stufen,
// S.rufJ je Stufe Monat und Jahr. rufPruef läuft nach jedem neuen Siegel. Eine neue Stufe meldet sich nach dem Siegel mit Korkenknall (rufMeldung)
// und mit einer Zeile im Winzerboten (rufBote). Alte Spielstände ohne S.meilen bekommen erreichte Stufen beim ersten Laden in einer einzigen Meldung (altRuf).
// Die Ehrungen stehen nicht in S.ehrungen, dort zählen nur Medaillen und Aufstiege. Am Geld ändert das nichts, der Erlös rechnet weiter live mit rufStufe.
const RUF_NAMEN=['Kellerlehrling','Kellergeselle','Kenner der Lage','Meister des Gewölbekellers','Meister der Prädikate','Großmeister des Weins','Legende des Weinarchivs'];
// Frau Öchsle ist eine Dynastie: S.ratte zählt die Generation im Korkenlager, hoch geht es bei jeder Übergabe nach der Taufe (Rang Winzer).
const RATTE_ORD=['','','die Zweite','die Dritte','die Vierte','die Fünfte','die Sechste','die Siebte','die Achte','die Neunte','die Zehnte'];
// Version 8.2: Spenden im Rathaus (Entwurf mit Maik am 17.11.2026). Index ist der Rang, vom Jungwinzer (1) bis zum Vizepräsidenten (8). Neuling und Präsident spenden nicht.
// b Betrag, z Zweck, ans Ansehen (über ruhm), ehre: Schild (holz, kupfer, bronze, silber), Urkunde oder Ehrenbürgerbrief, lohn die Belohnung als Text, bild das Archivfoto im Winzerboten.
// Gezahlt wird in Raten (S.sp = {r, bez}), die Belohnung kommt erst beim vollen Betrag. Beim Aufstieg verfällt der Rest. S.spJahr sammelt die Raten des Jahres für die Steuer.
// S.spenden: erledigte Stufen mit Monat, Jahr, Name und Anrede beim Stempeln und Generation g. S.spBote: Artikel für den nächsten Winzerboten.
const SPENDEN=[null,
  {b:5000,   z:'Wein fürs Dorffest',             kurz:'Dorffest',      ans:10,  ehre:'holz',   bild:'stadt',   lohn:'Ein Erntehelfer arbeitet im nächsten Oktober umsonst'},
  {b:25000,  z:'die Freiwillige Feuerwehr',      kurz:'Feuerwehr',     ans:20, ehre:'kupfer', bild:'frost',   lohn:'Frostfeuer retten in Frostnächten die Hälfte der Reben, die sonst erfrieren'},
  {b:100000, z:'die Weinbauschule',              kurz:'Weinbauschule', ans:30, ehre:'bronze', bild:'arbeit',  lohn:'Neue Leute im Arbeitsamt kosten 5 % weniger Lohn'},
  {b:350000, z:'das Kirchenfenster',             kurz:'Kirchenfenster',ans:40, ehre:'silber', bild:'herbst',  lohn:'Im nächsten September etwas mehr Öchsle (Erntedank-Segen)'},
  {b:750000, z:'das Gemeindehaus',               kurz:'Gemeindehaus',  ans:40, ehre:'urkunde',bild:'amt',     lohn:'5 % mehr Budget im Großhandel'},
  {b:2000000,z:'das Weinbaumuseum',              kurz:'Weinbaumuseum', ans:100, ehre:'urkunde',bild:'fassgang',lohn:'Deine Weinhandlung verkauft ein Viertel mehr'},
  {b:3000000,z:'den Wanderweg mit Aussichtspunkt',kurz:'Wanderweg',    ans:300,ehre:'urkunde',bild:'bank',    lohn:'Eine Bank an der Spitzenlage und mehr Gäste beim Hoffest'},
  {b:5000000,z:'das Dorf',                       kurz:'Ehrenbürger',   ans:400,ehre:'buerger',bild:'bogen',   lohn:'Der Holzbogen auf dem Dorfplatz, bei der nächsten Übergabe bleiben 85 statt 80 % Ansehen, und im Verband startet die Stimmung für dich bei 65 statt 60'}
];
// Raten in Zwanzigsteln des Betrags. Belohnungen: Frostfeuer mal SP_FROSTFEUER auf den Frost-Anteil beim Reben-Sterben (seit 13.4.8, Startwert für 14.2), Lohn mal SP_LOHN, Segen +SP_SEGEN Öchsle, Großhandel mal SP_MARKT, Weinhandlung mal SP_LADEN, Hoffest-Ansehen mal SP_HOFFEST.
// Seit 13.5.6 (Bauplan 13.5): worum es gegen die Gegner geht, je Akt (Generation 1 bis 3, aktNr). Wortlaut seit 13.8.
const GEGNER_AKT=['⚔️ 1. Akt: Deine Rivalen wohnen nebenan. Es geht um Land, um Fässer und darum, wer am Stammtisch zuletzt lacht.','🏅 2. Akt: Jetzt geht es um Medaillen und Ränge. Wer zuerst oben ankommt, sitzt im Festsaal vorn.','🗳️ 3. Akt: Im Verband wird alle fünf Jahre gewählt. Deine Rivalen treten als Gegenkandidaten um den Stuhl im Festsaal an.'];
const SP_TEIL=20, SP_DECKEL=.2, SP_FROSTFEUER=.5, SP_LOHN=.95, SP_SEGEN=4, SP_MARKT=1.05, SP_LADEN=1.25, SP_HOFFEST=1.25, SP_ERBE=.85, SP_STIMM=5;
// Maiks Bilder seit 17.11.2026: Holzbogen (Spruch steht im Bild) und die Bank als eigene Nahansicht am Wanderweg (sitzbank, nicht bank.jpg, das ist die Bank in der Stadt).
// Das Spitzenlage-Bild bei den Auktionen bleibt, wie es ist.
const SP_BILD={bank:'sitzbank',bogen:'holzbogen'};
const SP_SPRUCH='Was die Eltern pflanzten, ernten die Kinder';
const SP_DANK=[null,
  ['„Ohne deinen Wein wäre das Dorffest ein Kaffeekränzchen geblieben“, sagt der Bürgermeister.','„Die Dorfjugend will sich bei der nächsten Lese revanchieren.“'],
  ['„Die Feuerwehr hat neue Schläuche und Holz für die Frostfeuer“, sagt der Bürgermeister.','„Kommt die Frostnacht, stehen die Jungs in deinem Weinberg.“'],
  ['„In der Weinbauschule hängt jetzt dein Name über der Tafel“, sagt der Bürgermeister.','„Die Lehrlinge packen bei dir mit an, das drückt die Löhne.“'],
  ['„Das neue Kirchenfenster leuchtet in Traubenfarben“, sagt der Bürgermeister.','„Der Pfarrer verspricht dir zum Erntedank einen ganz besonderen Segen.“'],
  ['„Im Gemeindehaus wird wieder gefeiert, und alle wissen, wem wir das verdanken“, sagt der Bürgermeister.','„Sogar die Großhändler haben sich deinen Namen gemerkt.“'],
  ['„Das Weinbaumuseum ist eröffnet, und am Ende des Rundgangs gibt es deinen Wein“, sagt der Bürgermeister.','„Die Gäste kaufen danach gleich in deiner Weinhandlung ein.“'],
  ['„Am Wanderweg über der Spitzenlage steht jetzt deine Bank“, sagt der Bürgermeister.','„Wer dort rastet, will danach zu deinem Hoffest.“'],
  null];
// Version 12.5: Die Plaketten im Büro trennen nur an der Wortfuge (weiches Trennzeichen), nie mitten im Wort (Maik 20.11.2026).
const SP_FUGE={Dorffest:'Dorf­fest',Feuerwehr:'Feuer­wehr',Weinbauschule:'Weinbau­schule',Kirchenfenster:'Kirchen­fenster',Gemeindehaus:'Gemeinde­haus',Weinbaumuseum:'Weinbau­museum',Wanderweg:'Wander­weg',Ehrenbürger:'Ehren­bürger',Ehrenbürgerin:'Ehren­bürgerin'};
// Stufe 1: In den Monaten SP_DORF_VON bis SP_DORF_BIS des Jahres S.spDorf zahlt der teuerste Erntehelfer keinen Lohn.
// Seit 11.5 (Teil C2) nur noch im Oktober (9 bis 9). Bis 11.4 waren es August bis November (7 bis 10), mit den neuen Löhnen wären das rund 8.400 € für eine Spende von 5.000 €.
const SP_DORF_VON=9, SP_DORF_BIS=9;
// Artikel im Winzerboten im Monat nach der vollen Spende, mit dem Bild als Archivfoto.
const SP_BOTE=[null,
  ['Freibier war gestern: {W} spendiert den Wein fürs Dorffest','Beim Dorffest floss diesmal Wein aus dem Keller von {W}. Der Bürgermeister hob das Glas: „So {EIN} wünscht man sich.“ Die Dorfjugend will sich bei der Lese revanchieren.'],
  ['Neue Schläuche für die Feuerwehr','{W} spendet der Freiwilligen Feuerwehr 25.000 €. Der Wehrführer verspricht: „Kommt die Frostnacht, stehen wir mit Frostfeuern im Weinberg.“'],
  ['Lehrlinge dürfen sich freuen','Die Weinbauschule bekommt 100.000 € von {W}. Zum Dank packen die Lehrlinge künftig im Weingut mit an.'],
  ['Neues Kirchenfenster leuchtet in Traubenfarben','Das Fenster, gestiftet von {W}, zeigt eine Weinlese. Der Pfarrer kündigt zum Erntedank einen ganz besonderen Segen an.'],
  ['Gemeindehaus in neuem Glanz','{N} hat die Sanierung mit 750.000 € möglich gemacht. Bei der Einweihung waren auch die Großhändler da: „Einen Namen wie diesen merkt man sich.“'],
  ['Das Weinbaumuseum öffnet seine Türen','Dank 2 Mio. € von {W} zeigt das Dorf jetzt seine Weingeschichte. Im Ausschank am Ende des Rundgangs: natürlich Wein von {W}.'],
  ['Ein Platz mit Aussicht','Am neuen Wanderweg über der Spitzenlage steht eine Bank: „Ein Platz zum Verweilen, gestiftet vom Weingut {W}.“ Schon am ersten Wochenende fragten Wanderer nach dem Hoffest.'],
  ['{N} wird {EB}','Der Gemeinderat hat einstimmig entschieden. Am Dorfplatz erinnert jetzt ein Holzbogen an die Familie: „Was die Eltern pflanzten, ernten die Kinder.“ Darunter stehen die Namen aller Generationen.']];
// Ansehen gutschreiben. Die Schwierigkeit verschiebt nur Zuwächse, Abzüge bleiben gleich.
// Seit 10.0: Wer ein Amt hat (S.amt), dessen Stimmung im Verband geht mit. Gewinne zählen mit STIMM_PLUS, Abzüge mit STIMM_MINUS.
// Seit 10.1: still=1 lässt die Stimmung aus, für das Ansehen aus der Stiftung fürs Dorf (Maik 19.11.2026).
// Seit 11.5 (Teil C1): Ein drittes Argument nennt die Quelle (Weine, Wettbewerbe, Spenden, Feste, Stiftung), ohne zählt es als Sonstiges.
// Das Spiel selbst braucht es nicht, nur der Messbericht liest es mit (_pruefung.js, Zeile "Ansehen nach Quelle").
// Seit 11.5 (Teil C2, Zielbild von Maik 20.11.2026): Bis zum Präsidenten sollen Weine und Wettbewerbe zusammen mindestens die Hälfte des Ansehens bringen, Feste rund ein Viertel.
// ANS_F ist der Faktor je Quelle (drittes Argument q von ruhm), er gilt nur für dich, die Gegner rechnen wie bisher. Die Feste sind dafür bei WEINFEST_ANS und HOFFEST_ANS gekürzt.
// Seit 13.6.8 (Maik 22.11.2026, Entscheidung 7 im Bauplan 13.6): Die Ansehen-Werte der Weine (Anmeldung je Stufe, Sekt, ANS_PFLEGE, ANS_TERROIR, JH_ANS) und KRONE_ANS sind Endwerte ohne Faktor.
// Weine fällt deshalb aus ANS_F, die Kronen rufen ruhm mit dem vierten Argument end. Medaillen sowie Platz 2 und 3 der Weltweinschau laufen weiter über Wettbewerbe.
const ANS_F={Wettbewerbe:1.4};
// Seit 7.0 wünschen sie nur, was schon geht: eine Farbe erst mit einer freien Sorte dieser Farbe, Sekt erst ab R_SEKT.
// Seit 11.4 vier klare Felder: eine der freigeschalteten eigenen Sorten oder Sekt. Der Wunsch ist dann die Kennung der Sorte oder 'sekt'.
// Die alten Wünsche (weiss, rot, edel) versteht ladenPasst weiter, bis der nächste Monat neu würfelt. LADEN_SORTEN=0 stellt für die Messung auf die alten Wünsche zurück.
const LADEN_SORTEN=1;
// Version 8.2: Ein geteilter Wein findet beim Rausnehmen aus dem Regal seine andere Hälfte wieder. Gleich ist er, wenn alle Werte stimmen
// (Jahrgang, Sorte, Stufe, Sekt, Öchsle, Qualitätspunkte, Lagerzeit, Panschen und alles andere) außer id, Menge, Regal und Medaillen. Die Medaillen werden vereint.
const WEIN_FREI=['id','liter','regal','med'];
/* ================= Auktionen ================= */
// Neue Auktionen gibt es nur in diesen Monaten (0 = Januar), mit dieser Wahrscheinlichkeit, frühestens nach 6 Monaten.
const AUK_MONATE=[2,3,6,10], AUK_CHANCE=.22;
// Seit 13.3.7 (Nachtrag 3): Vor dem Winzer (auktion_oft) kommt selten Land, im Schnitt AUK_FRUEH_HA Hektar alle AUK_FRUEH_JAHRE Jahre, danach so oft wie bisher.
// Ab dem Jungwinzer kommt das erste Angebot per Zufall, spätestens AUK_ERST_JAHRE Jahre nach dem Aufstieg (S.aukErst merkt den Monat, in dem es kam).
const AUK_FRUEH_HA=1, AUK_FRUEH_JAHRE=3, AUK_ERST_JAHRE=4;
// Seit 13.4.9 (Nachtrag 3, Maik 22.11.2026): Land mit Lage. Jedes Stück Land ist einfacher Hang, kühle Höhenlage oder steiler Südhang (S.hang, S.ha bleibt die Summe).
// Die Spitzen-Sorte wächst nur auf dem Südhang, Sekt auf dem einfachen Hang bekommt SEKT_EINFACH_QP Punkte weniger (Platzhalter).
// SUED_MAX: höchstens so viele Hektar Südhang besitzt du in der ganzen Partie, die Spitzenlage eingerechnet. Bis sie unter den Hammer kam, bleiben ihre SPITZE_HA dafür frei.
// satz steht bei der Auktion (Platzhalter bis 14.4).
const LAGEN={einfach:{name:'einfacher Hang',kurz:'Einfacher Hang',sym:'🌄',satz:'Auf dem einfachen Hang trägt die Menge-Sorte gut, der Sekt verliert dort ein paar Punkte.'},
  hoehe:{name:'kühle Höhenlage',kurz:'Kühle Höhenlage',sym:'🏔️',satz:'Oben in der kühlen Höhenlage wird der Sekt am feinsten.'},
  sued:{name:'steiler Südhang',kurz:'Steiler Südhang',sym:'☀️',satz:'Nur auf dem steilen Südhang wächst die Spitzen-Sorte, und mehr als 8 Hektar davon bekommt kein Weingut.'}};
const LAGE_REIHE=['einfach','hoehe','sued'], SUED_MAX=8, SEKT_EINFACH_QP=5;
// Lagen der Lose bei der Auktion je Rang, als Anteile (Platzhalter bis 14.2): im ersten Akt nur einfacher Hang, ab dem Weingutsbesitzer vor allem kühle Höhenlage,
// seit 14.4.2 ab dem Weinbaurat auch Südhang (bis 14.2 ab dem Gutsherrn). Es gilt die letzte Zeile, deren Rang erreicht ist.
const AUK_LAGE=[{r:0,w:{einfach:1}},{r:4,w:{einfach:.3,hoehe:.7}},{r:6,w:{einfach:.2,hoehe:.5,sued:.3}}];
// Landpreis je Akt (RANG_AKT) und je Lage als Faktoren auf Startgebot und Gebote. Neutral auf dem heutigen Preis, die Werte setzt 14.2 (Platzhalter).
const AUK_PREIS_AKT={1:1,2:1,3:1}, AUK_PREIS_LAGE={einfach:1,hoehe:1,sued:1};
// Seit 13.7.5 (Entscheidung 9, Platzhalter bis 14.2): Wert des Loses = Hektar × AUK_WERT_HA × Gebiet × Lage × Akt × Landpreis (S.landF). Auf Stufen mit DIFF.klug
// gehen die Gegner bis AUK_KLUG[0] bis [1] davon, statt wie sonst 14.000 bis 26.000 € je Hektar nach Laune. AUK_WERT_HA ist die alte Obergrenze der Laune.
const AUK_WERT_HA=26000, AUK_KLUG=[.9,1];
// Sätze zur Lage im Weinberg und beim Pflanzen (Platzhalter bis 14.4).
const SUED_SATZ={
  keinPlatz:`Die Spitzen-Sorte wächst nur auf dem steilen Südhang, und dort ist kein Platz frei. Südhang gibt es bei den Auktionen ab dem Rang ${RAENGE[AUK_LAGE[AUK_LAGE.length-1].r].name} und einmal mit der Spitzenlage.`,
  spitze:'Sie wächst nur auf dem steilen Südhang.',
  sekt:`Sekt wird am besten auf der kühlen Höhenlage, auf dem einfachen Hang bekommt er ${SEKT_EINFACH_QP} Qualitätspunkte weniger.`,
  umpflanzen:'Rodest du die Menge-Sorte, um Sekt zu pflanzen, sind die gerodeten Reben samt ihrer Pflege weg. Die neuen übernehmen die Pflegestufe der Sekt-Sorte, und auf dem einfachen Hang wird der Sekt schlechter.'};
// Version 7.0 (Schritt I): In der langen Partie kommt der Weinskandal rund alle anderthalb Jahre, die Erbschaft alle drei.
// Damit nicht immer derselbe Text steht, wechseln die Varianten der Reihe nach durch (S.vz), ohne Zufall.
// Version 7.0 (Schritt J, Maik 16.11.2026): Nach einem Weinskandal ist SKANDAL_PAUSE Monate Ruhe (S.skAb), sonst füllt er spät die Lücke der schlechten Ereignisse.
const SKANDAL_PAUSE=48;
const VARIANTEN={
  skandal:[['Weinskandal erschüttert das Land','Ein Großhändler hat Frostschutzmittel in seinen Wein gemischt, jetzt trauen die Leute keinem Winzer mehr.'],
    ['Gefälschte Etiketten aufgeflogen','Ein Abfüller hat billigen Tafelwein tausendfach als Spätlese verkauft. Jetzt schauen die Kunden jeder Flasche misstrauisch aufs Etikett.'],
    ['Fernsehbericht schockt Weinfreunde','Ein Fernsehmagazin zeigt verschimmelte Fässer in einer Großkellerei. Seitdem lassen viele Kunden den Wein im Regal stehen.'],
    ['Zucker im Most','Mehrere Kellereien haben heimlich Zucker in den Most gekippt. Die Zeitungen sind voll davon, die Kunden halten sich zurück.'],
    ['Wasser im Wein','Ein Händler hat seinen Wein mit Leitungswasser gestreckt. Der Spott ist groß, die Kauflust klein.']],
  erbschaft:['Eine entfernte Großtante hat dir {b} hinterlassen. Sie hat deinen Wein wohl heimlich gemocht.',
    'Ein alter Stammgast hat dich in seinem Testament bedacht: {b}. „Für den besten Schoppen im Ort“, steht darin.',
    'Ein Onkel aus Übersee, von dem keiner etwas wusste, hat dir {b} vermacht.',
    'Die Witwe eines Weinhändlers hinterlässt dir {b}. Ihr Mann habe immer von deinem Keller geschwärmt.',
    'Ein Schulfreund aus der Familie hat dir {b} hinterlassen, mit einem Zettel: „Mach was Gutes draus.“']
};
const EREIGNIS={
  gut:{
    supersommer:{ok:()=>(S.monat===6||S.monat===7)&&feldHaengt().length,los(){const n=rint(6,9); for(const id of feldHaengt()) S.felder[id].oe=Math.min(150,S.felder[id].oe+n); S.sonne++; schlag(80,'Supersommer!',`Wochenlang Sonne satt ${WO[S.region]}. Deine Trauben legen ${n}° Öchsle zu, und der Sommer zählt als zusätzlicher Sonnenmonat.`,'supersommer',{du:1})}},
    mode:{ok:()=>!S.lage,los(){const fr=S.rollen?R().sorten.filter(sorteFrei):null, id=fr?fr[rint(0,fr.length-1)]:R().sorten.slice().sort((a,b)=>eignung(b)-eignung(a))[0], f=1+rnd(.2,.4), n=rint(4,6); S.lage={typ:'mode',f,rest:n,sorte:id}; schlag(80,`${SORTEN[id].name} ist plötzlich in Mode`,`Ein Fernsehkoch schwärmt ${fr?`von der Rebsorte ${SORTEN[id].name} ${WO[S.region]}, und plötzlich wollen alle diesen Wein`:`vom ${SORTEN[id].name} ${WO[S.region]}, und plötzlich wollen ihn alle`}. ${n} Monate lang bringt er ${Math.round((f-1)*100)}\u00a0% mehr.`,'rieslingmode',{du:1})}},
    erbschaft:{ok:()=>true,los(){const b=Math.round(rint(8,20)*1000*(1+S.rang/2)/100)*100; S.geld+=b; fx('kasse'); schlag(80,'Unverhoffte Erbschaft',`${variante('erbschaft').replace('{b}',eur(b))} Das Geld ist steuerfrei.`,'erbschaft',{du:1})}},
    kritiker:{ok:()=>S.lots.some(kritikerWein),los(){const l=S.lots.filter(kritikerWein).sort((a,b)=>b.qp-a.qp)[0], q=rint(3,5); l.qp+=q; const a=ruhm(12); schlag(80,`Kritiker lobt deinen ${lotName(l)}`,`Ein bekannter Weinkritiker hat deinen ${lotName(l)} probiert und schwärmt in seiner Kolumne. Der Wein bekommt ${q} Qualitätspunkte mehr, dazu +${a} Ansehen.`,'weinkritiker',{du:1})}}
  },
  schlecht:{
    hagel:{ok:()=>S.monat>=5&&S.monat<=8&&feldHaengt().length,los(){const p=rnd(.2,.4); for(const id of feldHaengt()){const f=S.felder[id]; f.menge=Math.round(f.menge*(1-p))} schlag(80,`Hagel ${WO[S.region]}`,`Ein Unwetter mit Hagelkörnern so groß wie Murmeln ist über deine Weinberge gezogen. Rund ${Math.round(p*100)}\u00a0% der Trauben sind hin.`,'hagel',{du:1})}},
    maschine:{ok:()=>S.maschinen.length,los(){const ma=S.maschinen[rint(0,S.maschinen.length-1)], n=rint(20,40); ma.zustand=Math.max(10,ma.zustand-n); schlag(80,'Maschinenschaden',`Dein${mTyp(ma).f?'e':''} ${mTyp(ma).name} ${MASCH_SCHADEN[ma.typ]||MASCH_SCHADEN.klein}. Der Zustand sinkt um ${n} auf ${ma.zustand}\u00a0%. ${ma.zustand<MASCH_ROT?`Unter ${MASCH_ROT}\u00a0% f\u00e4llt ${maschEr(ma)} aus, bis ${maschEr(ma)} gewartet ist.`:`Eine Wartung bringt ${maschEr(ma)==='er'?'ihn':'sie'} wieder in Schuss.`}`,'maschine',{du:1})}},
    skandal:{ok:()=>!S.lage&&monatNr()>=(S.skAb||0),los(){const f=1-rnd(.2,.35), n=rint(3,5), [t,x]=variante('skandal'); S.lage={typ:'skandal',f,rest:n}; S.skAb=monatNr()+SKANDAL_PAUSE; schlag(80,t,`${x} ${n} Monate lang bringen alle Weine ${Math.round((1-f)*100)}\u00a0% weniger.`,'weinskandal',{du:1})}},
    helferweg:{ok:()=>S.helfer>0&&S.loehne.helfer[0]<=lohnF(LOHN_BILLIG)&&S.geld>4000,los(){const b=clamp(Math.round(S.geld*rnd(.05,.1)/100)*100,2000,30000); S.loehne.helfer.shift(); S.helfer--; S.geld-=b; schlag(80,'Erntehelfer über alle Berge',`Dein billigster Erntehelfer ist über Nacht verschwunden, und mit ihm ${eur(b)} aus der Kasse. Ersatz findest du beim Arbeitsamt.`,'helferweg',{du:1})}}
  }
};
// Löhne: Das Arbeitsamt bietet jeden Monat einen neuen Monatslohn zwischen LOHN_MIN und LOHN_MAX, getrennt für Erntehelfer und Lagerarbeiter.
// Wer eingestellt ist, behält seinen Lohn. S.loehne merkt ihn je Kopf, aufsteigend sortiert. Entlassen wird immer der teuerste.
const LOHN_ARTEN=['helfer','lagerarb'];
// Seit 13.3.3 (Bauplan 13.3, Maik 21.11.2026): Die SEKT_ANS Ansehen gibt es einmal im Jahr, in dem mindestens ein Sekt angemeldet wird, egal wie viele Posten. Die Mindestmenge SEKT_ANS_HA ist weg.
const SEKT_ANS=8;
// Seit 13.3.5: fester Zuschlag aufs Ansehen bei der Anmeldung nach der Pflegestufe des Weins (l.pfl: Setzling, Rebstock, Premier Cru, Grand Cru),
// vom Terroir (l.bst ab NAME_BODEN_AB) noch einmal ANS_TERROIR. Gilt für jeden Wein und den Sekt, nicht für gepanschten (Annahme von Claude: auch beim Sekt).
// Seit 14.2.6 (Annahme 15): ANS_PFLEGE und ANS_TERROIR sind weg, das Ansehen bei der Anmeldung folgt den Qualitätspunkten (ANS_JE_QP).
// Seit 13.3.3: Die Sekt-Sorte macht nur Sekt, direkt bei der Lese und ohne Grundwein, die Lagerarbeiter stellen ihn her. Sekt aus Qualitätswein oder Kabinett (SEKT_STUFEN) ist weg.
// Preis und Punkte rechnet der Sekt auf SEKT_GRUND (Annahme von Claude, damit Preis, Reife und Qualitätspunkte wie bisher laufen), dazu SEKT_QP Punkte wie bisher beim Versekten.
// Sekt bringt das SEKT_F-fache, die Sekt-Sorte (sektStar) dazu SEKT_STAR.
const SEKT_F=1.6, SEKT_STAR=1.1, SEKT_GRUND='qba', SEKT_QP=5;
// Version 12.1 (Maik 20.11.2026): Sekt nur mit eigenem Sektkeller, einmal zu kaufen ab R_SEKT für SEKTKELLER_PREIS. Sein Ausbau ist die Degorgier- und Abfüllanlage
// ab FREI.sekt_anlage (seit 14.4.2 mit dem ersten eigenen Sekt, 13.7.8 bis 14.2 mit dem Rebstock der Sekt-Sorte), sie halbiert die Kosten je Flasche (SEKT_ANLAGE_F), ohne Leute und ohne Wartung, deshalb nicht in der Maschinenliste.
// SEKT_KOSTEN ist Sektflasche, Korken und Agraffe. Einzige Wahl des Spielers bei der Lese: SEKT_REIFE Monate reifen oder HEFE_LANG Monate auf der Hefe (Feld hefe am Wein).
// Seit 13.3.3 bringt das lange Hefelager HEFE_LANG_QP Qualitätspunkte, der Preis folgt über die Punkte (Startwert, Annahme von Claude, bis 12.9.5 der Faktor 1,25).
// Preise und Faktor sind Annahmen von Claude bis zum Messlauf 12.1.7. Die Gegner rechnen ihren Sekt weiter über regionF.
const SEKTKELLER_PREIS=40000, SEKT_ANLAGE_PREIS=30000, SEKT_ANLAGE_F=.5, SEKT_ANLAGE_NAME='Degorgier- und Abfüllanlage', SEKT_REIFE=9, HEFE_LANG=24, HEFE_LANG_QP=6;
// Schritt 3: Faktor des Gebiets auf das Jahreseinkommen der Gegner. preisF und ertragF voll, Sterne mit ★★★ (ihre beste Sorte),
// sektPreisF nur auf den Anteil GEGNER_SEKT, weil Sekt beim Test-Spieler rund 6 bis 14 % der Einnahmen bringt (Messung Schritt 2).
const GEGNER_SEKT=.1;
// Temperatur: Gradzahl passend zu Monat und Wetter, nur zur Anzeige. Frost liegt immer unter null, alles andere bei mindestens 1 °C.
// S.temp merkt die gewürfelte Zahl des Monats. Fehlt sie (alte Spielstände, Spielstart), gilt der Wert ohne Streuung.
const TEMP_MONAT=[2,3,7,11,15,18,20,20,16,11,6,3], TEMP_WETTER={sonnig:4,mild:0,regen:-2,kalt:-5};
/* ================= Wachstum ================= */
// Öchsle: Startwert im Juli, Zuwachs August bis Dezember, höchstens bis zur Grenze des Weinbergs (oeGrenze).
// Im November trocknen die Beeren ein: Die Menge schrumpft, der Zucker steigt deshalb noch einmal kräftig.
// Beste Sorte im Oktober: normales Jahr um 89°, Sonnenjahr um 100°.
const OE_START=49, OE_PLUS=[14,14,12,15,4];
// Seit 13.4.2 (Bauplan 13.4, Maik 21.11.2026): der Herbst der Spitzen-Sorte als Wagnis. Bis Oktober ist sicher, was der Deckel erlaubt.
// Wer länger hängen lässt, wagt den Weg seines Gebiets: warm bis November auf Edelfäulnis (Beerenauslese, mindestens MIN_NORMAL.ba),
// kühl bis Dezember auf Frost (Eiswein mit dem Öchsle der Trauben). WAGNIS.eigen ist die Chance im eigenen Weg. Klappt es nicht, ist die Ernte des Feldes weg.
// WARTEN_MENGE bleibt von der Menge je Monat über Oktober hinaus (für jedes Feld). Seit 13.7.1 sitzt dort, wo bis 13.6 der neutrale Haken WAGNIS_F stand, die Verschiebung je Jahr (WAG_SPANNE).
// Seit 13.4.3: In der Mitte (weg beide) sind beide Wege eigene, die Chance hängt an der Tendenz: mit ihr WAGNIS.mitTend, dagegen oder bei unklar WAGNIS.gegenTend.
// Seit 13.4.4: Ab R7 öffnet ein besonderes Jahr den fremden Weg (warm ein harter Winter für den Eiswein, kühl ein goldener Herbst für die Edelfäulnis)
// mit WAGNIS.fremd. Ein Jahr ist mit FREMD_JAHR besonders (etwa alle acht Jahre), in der Mitte gibt es keinen fremden Weg.
// Seit 13.4.5: Ab R8 kann eine gelungene Beerenauslese einen Monat länger hängen, mit WAGNIS.tba wird sie Trockenbeerenauslese (MIN_NORMAL.tba), sonst ist alles weg.
const WAGNIS={eigen:.7,mitTend:.55,gegenTend:.2,fremd:.5,tba:.5}, WARTEN_MENGE=.9, FREMD_JAHR=1/8;
// Seit 13.7.1 (Bauplan 13.7, Maik 21.11.2026): Jedes Jahr hat eine feste Verschiebung der Chance in Prozentpunkten, gleich für alle Felder, Wege und Stufen
// des Wagnisses. WAG_SPANNE je Spielstufe [unten, oben]: Lehrjahre 0, Gesellenjahre ±10, Meisterprüfung −30 bis +15. Die Chance ist Grundwert plus Verschiebung,
// nie unter WAG_MIN und nie über WAG_MAX. Im Jahrhundertjahr gilt sie für Trockenbeerenauslese und Eiswein, die sichere Edelfäulnis im Jahrhundertsommer bleibt sicher (Entscheidung 7).
const WAG_SPANNE={einfach:[0,0],mittel:[-10,10],schwer:[-30,15]}, WAG_MIN=.05, WAG_MAX=.95;
// Seit 13.7.2 (Startwerte für 14.2): Woraus die Verschiebung kommt, je Spielstufe (WAG_TEILE). sommer: das feste Wetter von Monat SOMMER_MON[0] bis [1] (Mai bis September),
// je Monat SOMMER_W Punkte, zusammen in SOMMER_SPANNE. schaed: im Schädlingsjahr minus SCHAEDJ_MINUS. rest: kleiner Zufall ±WAG_REST (Thema 13).
// Danach gekappt auf WAG_SPANNE. Die Gesellenjahre lernen so die Zeichen schon, gekappt bei ±10 und ohne Schädlingsjahr.
const WAG_TEILE={einfach:[],mittel:['sommer'],schwer:['sommer','schaed','rest']}, SOMMER_MON=[4,8], SOMMER_W={sonnig:2,mild:0,regen:-3,kalt:-2,frost:-3}, SOMMER_SPANNE=[-15,10], WAG_REST=5;
// Seit 13.7.2: der vage Satz im Winzerboten im September, nur in der Meisterprüfung und erst mit dem Wagnis. Es gilt die erste Zeile, deren Grenze die Verschiebung erreicht.
// Eigene Wörter, damit er nicht nach der Tendenz klingt (Entscheidung 6). Wortlaut seit 13.8, {wo} ist der Ort.
const WAG_SATZ=[[5,'Die Alten im Dorf sind zuversichtlich','Auf der Bank vor der Kirche {wo} sind die Alten zuversichtlich: So ein Jahr belohnt den, der warten kann.'],
  [-9,'Die Alten im Dorf halten sich bedeckt','Auf der Bank vor der Kirche {wo} wiegen die Alten nur die Köpfe und verraten nichts.'],
  [-999,'Die Alten im Dorf sind besorgt','Auf der Bank vor der Kirche {wo} sind die Alten besorgt: Wer dieses Jahr zu lange hängen lässt, verliert.']];
// Seit 13.4.4: Meldung im Winzerboten vom September, wenn der fremde Weg offen ist, nach dem Weg, den sie öffnet. Wortlaut seit 13.8.
const FREMD_TEXT={
  frost:['Ein harter Winter kündigt sich an','Die Alten {wo} spüren es in den Knochen: Dieser Winter wird hart, und wer die Spitzen-Sorte bis Dezember hängen lässt, hat diesmal eine Chance auf Eiswein.'],
  edel:['Ein goldener Herbst kündigt sich an','Warme Tage, feuchte Nächte: {wo} rechnen die Alten mit Edelfäulnis, und wer die Spitzen-Sorte bis November hängen lässt, hat diesmal eine Chance auf Beerenauslese.']};
// Seit 13.4.3: die Tendenz des Herbstes in der Mitte, je zu einem Drittel (Annahme von Claude), gemeldet im Winzerboten vom September ab R6.
// weg ist der Weg, zu dem sie passt. text ist die Meldung ({wo} ist der Ort), Wortlaut seit 13.8.
const TENDENZEN=[
  {k:'feucht',name:'feuchter, milder Herbst',weg:'edel',text:'Die Wetterkundigen {wo} erwarten einen feuchten, milden Herbst, gut für die Edelfäulnis im November.'},
  {k:'klar',name:'klare, kalte Nächte',weg:'frost',text:'Die Wetterkundigen {wo} erwarten klare, kalte Nächte, gut für den Eiswein im Dezember.'},
  {k:'unklar',name:'unklar',weg:null,text:'Die Wetterkundigen {wo} sind sich uneins, und wer jetzt noch wartet, wagt viel.'}];
// Winzerbote, wenn das Wagnis nicht klappt: Titel, Text ({s} ist die Sorte), Bild. Wortlaut seit 13.8.
const WAGNIS_AUS={
  edel:['Kälteeinbruch im November','Über Nacht ist es bitterkalt geworden, und dein {s} hing noch für die Edelfäulnis am Stock. Die Trauben sind erfroren, die Ernte des Feldes ist weg.','frost'],
  tba:['Die Trockenbeerenauslese ist dahin','Ein nasser Dezember, und die edelfaulen Beeren deines {s} sind am Stock verfault. Wer wartet, wagt eben alles.','frost'],
  frost:['Tauwetter statt Eiswein','Der Frost bleibt aus, der Dezember ist zu mild, und dein {s} ist am Stock verfault. Aus dem Eiswein wird diesmal nichts.','frost']
};
// Seit 13.4.6: die Chance in Worten am Lese-Knopf, ab 0,6 gut, ab 0,35 mittel, sonst gering (Annahme von Claude im Bauplan 13.4).
const CHANCE_WORT=[[.6,'gut'],[.35,'mittel'],[0,'gering']];
// Seit 13.4.6 (Maik 21.11.2026): Der Weingut-Manager warnt, sobald er eingestellt ist, wenn alle wartenden Felder zusammen mehr als MGR_WARN
// vom erwarteten Erlös der Ernte des Jahres ausmachen. Erwartet heißt: sichere Lese jetzt, als Wein der höchsten erlaubten Stufe. 13.7 setzt für die Lehrjahre 0,3.
const MGR_WARN=.4;
// Weinpreise (S.markt): Schritt je Monat, unten, oben, wie bis 13.6. In der Meisterprüfung gilt DIFF.markt (seit 13.7.5).
const MARKT_SCHWANK=[.06,.85,1.15];
// Seit 13.7.5: Satz zum Markt im Winzerboten (DIFF.marktSatz), wenn sich die Lage ändert: gut ab MARKT_SATZ[0][0], schwach unter MARKT_SATZ[1][0]. Wortlaut seit 13.8.
// MARKT_SATZ_PUFFER: Zurück auf normal erst, wenn die Weinpreise so weit wieder drin sind, sonst springt der Satz an der Grenze jeden Monat (seit 13.7.6).
const MARKT_SATZ_PUFFER=.05;
const MARKT_SATZ=[[1.1,'gut','Die Händler zahlen gerade gut','Im Weinhandel ist Bewegung, die Händler zahlen so gut wie lange nicht.'],
  [.9,'normal','Die Weinpreise sind wieder normal','Der Weinhandel hat sich beruhigt, die Preise sind wieder, wie man sie kennt.'],
  [0,'schwach','Die Händler halten sich zurück','Die Händler zahlen gerade schlecht, und wer warten kann, verkauft lieber später.']];
// Seit 13.7.3 (Bauplan 13.7, Maik 21.11.2026): Was am Lese-Knopf steht, je Spielstufe (CHANCE_ZEIGE): Lehrjahre die Zahl, Gesellenjahre das Wort, Meisterprüfung nichts.
// In den Lehrjahren sagt der alte Winzer dazu, was er tun würde: warten ab RAT_WARTEN, sonst lesen. Seine Warnung kommt dort schon ab MGR_WARN_STUFE.einfach.
const CHANCE_ZEIGE={einfach:'zahl',mittel:'wort',schwer:''}, RAT_WARTEN=.6, MGR_WARN_STUFE={einfach:.3};
// Seit 13.6.1 (Bauplan 13.6, Maik 21.11.2026): vier Jahrhundertjahre ab dem Terroir. Wer nie Terroir erreicht, bekommt keins.
// Seit 13.6.9 (Nachtrag 3, Maik 22.11.2026): fest JH_ABSTAND Jahre nach dem Aufstieg zum Terroir, danach JH_ANZAHL-1 weitere alle JH_ABSTAND Jahre
// (Wunschjahre 90, 95, 100, 105). Die ersten JH_VOR sind nur ein Vorgeschmack: Ankündigung und Wetter, aber in keinem Gebiet ein Jahrhundertwein,
// das Wagnis läuft wie in einem normalen Jahr.
// Warm (weg edel) bekommt Jahrhundertsommer, kühl (weg frost) Jahrhundertwinter, die Mitte wechselt ab: Sommer, Winter, Sommer, Winter.
// JH_ART: Name, Weg und die Tendenz, die der Winzerbote in der Mitte im Jahrhundertjahr klar meldet. JH_TEXT: Ankündigung im Januar, Wortlaut seit 13.8.
const JH_ANZAHL=4, JH_ABSTAND=5, JH_VOR=1;
// Seit 13.6.2 (Maik 21.11.2026, Entscheidung 1): Im Jahrhundertjahr ist die Chance überall JH_CHANCE. Sommer: Edelfäulnis sicher, die Trockenbeerenauslese
// mit JH_CHANCE, sonst ist das Feld weg. Winter: Eiswein mit JH_CHANCE. Gelingt das, wird der Wein der Jahrhundertwein (Trockenbeerenauslese oder Eiswein).
// JH_QP: feste Punkte jedes Jahrhundertweins bei Wettbewerben, Lagerjahre und Medaillen geben nichts dazu. Startwert aus 13.6.3: damit liegt die
// Raritäten-Krone gegen ihren Favoriten bei etwa 70 Prozent (gemessen wird in 14.1).
// JH_ANS: Ansehen einmal bei der Anmeldung eines Jahrhundertweins, zusätzlich zum Ansehen der Stufe (Annahme von Claude).
// Seit 14.2.6 (Entscheidung 28): Statt JH_QP (bis 14.2.5: 163 feste Punkte) bekommt der Jahrhundertwein JH_ZUSCHLAG auf seine eigenen Punkte, höchstens QP_MAX_JH.
const JH_CHANCE=.75, JH_ANS=100;
const JH_ART={sommer:{name:'Jahrhundertsommer',weg:'edel',tend:'feucht',bild:'supersommer'},winter:{name:'Jahrhundertwinter',weg:'frost',tend:'klar',bild:'eiswein'}};
// Seit 13.6.9: sommerVor und winterVor kündigen den Vorgeschmack an, Wortlaut seit 13.8.
const JH_TEXT={
  sommerVor:['Ein Jahrhundertsommer zum Vorgeschmack','Die Alten {wo} sind sich einig wie selten: So einen Sommer gab es seit hundert Jahren nicht. Für einen Jahrhundertwein ist es noch zu früh, das hier ist der Vorgeschmack. Wer genau hinschaut, weiß, was kommt.'],
  winterVor:['Ein Jahrhundertwinter zum Vorgeschmack','Die Alten {wo} sind sich einig wie selten: So einen Winter gab es seit hundert Jahren nicht. Für einen Jahrhundertwein ist es noch zu früh, das hier ist der Vorgeschmack. Wer genau hinschaut, weiß, was kommt.'],
  sommer:['Der Jahrhundertsommer ist da','Die Alten {wo} sind sich einig wie selten: Dieses Jahr wird ein Jahrhundertsommer. Wer die Spitzen-Sorte bis November hängen lässt, bekommt die Edelfäulnis sicher. Wer bis Dezember wartet, kann den Jahrhundertwein holen.'],
  winter:['Der Jahrhundertwinter ist da','Die Alten {wo} sind sich einig wie selten: Dieser Winter wird ein Jahrhundertwinter. Wer die Spitzen-Sorte bis Dezember hängen lässt, kann den Jahrhundertwein holen, einen Eiswein, wie ihn das Dorf noch nicht gesehen hat.']};
// Seit 13.4.8 (Maik 21.11.2026): Ein misslungenes Wagnis kostet immer das ganze Feld, auch mit der Spende an die Feuerwehr. Ihre Frostfeuer
// halbieren stattdessen den Frost-Anteil beim Reben-Sterben zum Jahreswechsel (SP_FROSTFEUER). Satz dazu, Wortlaut seit 13.8.
const FROST_FEUER='Die Frostfeuer der Feuerwehr haben die Hälfte davon abgewendet';
// Seit 11.5 (Teil C2, Maik 20.11.2026): Edelfäulnis macht schneller überreif. Auf einem Feld mit Edelfäulnis sind EDEL_UEBER Prozentpunkte mehr Trauben überreif,
// ab dem Monat, in dem sie kommt. Dadurch gibt es weniger Auslese (nur reife Trauben) und mehr für die Beerenauslese.
// Überreife Trauben sind fast Rosinen und geben weniger Most: 1 Liter überreife Trauben wird zu MOST_UEBER Litern (feldLiter). Bis 11.4: EDEL_UEBER 0, MOST_UEBER 1.
const EDEL_UEBER=25, MOST_UEBER=.6;
/* ================= Schädlinge ================= */
// Seit 13.7.2 (Bauplan 13.7, Maik 21.11.2026): kein Befall, keine Warnung und kein Spritzen mehr, auf keiner Stufe. Übrig bleibt das Schädlingsjahr in der
// Meisterprüfung (DIFF.schaed, schaedAn): alle SCHAEDJ_PAUSE[0] bis [1] Jahre eins, fest je Partie (Thema 9), bis SCHAEDJ_BIS Jahre nach dem Start.
// Es senkt nur die Chance beim Wagnis um SCHAEDJ_MINUS Punkte, trifft also nur, wer wartet. Die Menge-Sorte und alles Gelesene bleiben unberührt.
// Der Winzerbote meldet es im Monat SCHAEDJ_MON (Juli), erst wenn das Wagnis offen ist (Entscheidung 8), mit dem Namen eines Schädlings:
// der Traubenwickler zuerst, danach einer, der mit dem Akt schon da ist (SCHAED_AKT, Akt nach RANG_AKT). SCHAED_AN=0 schaltet für Messläufe alles ab.
// Spielstand: S.schaedJ {j,art} das zuletzt gemeldete, S.schaedGes {art: Zahl der Meldungen}.
const SCHAED_AN=1, SCHAEDJ_PAUSE=[3,5], SCHAEDJ_MINUS=15, SCHAEDJ_MON=6, SCHAEDJ_BIS=400, SCHAED_AKT={wickler:1,mehltau:2,kirsch:3};
const SCHAED={
  wickler:{name:'Traubenwickler',der:'der Traubenwickler',dem:'dem Traubenwickler',den:'den Traubenwickler',er:'er',sym:'🐛'},
  mehltau:{name:'Falscher Mehltau',der:'der Falsche Mehltau',dem:'dem Falschen Mehltau',den:'den Falschen Mehltau',er:'er',sym:'🍂'},
  kirsch:{name:'Kirschessigfliege',der:'die Kirschessigfliege',dem:'der Kirschessigfliege',den:'die Kirschessigfliege',er:'sie',sym:'🦟'}
};
// Beim ersten Befall je Schädling erzählt der Winzerbote, wie es früher war. Die Geschichte wächst von Generation zu Generation.
// Wortlaut seit 13.8. SCHAEDJ_TEXT ist die Meldung im Juli ({der} ist der Schädling).
const SCHAEDJ_TEXT='Das Weinbauamt meldet ein Schädlingsjahr, {der} ist unterwegs, und wer die Spitzen-Sorte dieses Jahr fürs Wagnis hängen lässt, wagt mehr als sonst.';
const SCHAED_FAMILIE={
  wickler:'Die Alten im Dorf nicken nur: „Den Wurm hat jeder, der Reben hat.“',
  mehltau:'Die Alten hatten es noch einfacher, damals gab es nur den Traubenwickler. Der Mehltau ist ein Pilz und kommt mit dem Regen.',
  kirsch:'Die Großeltern kannten nur den Traubenwickler, die Eltern dazu den Mehltau. Die kleine Fliege ist neu im Land und kommt ausgerechnet kurz vor der Lese.'
};
const REIHE=['tafel','qba','kab','spat','aus','ba','tba','eis'];
// Seit 8.0 Handlese: Felder mit Edelfäulnis brauchen je HAND_REBEN Reben einen echten Erntehelfer (Köpfe, Fahrer zählen mit).
// Seit 11.5 (Teil C1) liest jeder dreimal so viel (HAND_REBEN 3000 statt 1000), und die Familie liest ihre ALLEIN_HA Hektar auch von Hand selbst.
// Seit 10.3 (B3) zählen gefrorene Trauben ohne Edelfäulnis nicht mehr, Eiswein gibt es ohne sie ohnehin nicht.
// Fehlen sie und ist eine Maschine im Einsatz, liest die Maschine (masch), daraus wird höchstens Qualitätswein. Ohne Maschine lesen die Helfer, die da sind.
const HAND_REBEN=3000;
/* ================= Weinkompendium (seit 11.1, Wissens-Seiten und Geschichten seit 11.3, Siegel nach Rollen seit 11.4) ================= */
// Sammelbuch und Nachschlagewerk. Seit 11.4 (Maik 19.11.2026) gibt es Siegel nach Rollen: zehn Einträge und 30 Siegel je Partie.
// Die neun Stufen und der Sekt hängen an genau einer Sorte der Partie und nennen sie im Titel ("Kabinett vom Müller-Thurgau").
// Federweißer bis Spätlese gehören zur Menge-Sorte, alle drei Siegel über verkaufte Flaschen. Auslese bis Eiswein gehören zur Spitzen-Sorte,
// Bronze und Silber über verkaufte Flaschen, Gold nur mit einer Goldmedaille. Der Sekt gehört zur Sekt-Sorte, Bronze und Silber über die Menge, Gold mit einer Goldmedaille.
// Flaschen derselben Stufe aus einer anderen Sorte zählen nicht, gepanschter Wein zählt nie. Die drei Rebsorten sind Wissens-Seiten ohne Siegel.
// Gebiet und Lagen, Keller und Technik, Gefahren und die Edelfäulnis sind Wissens-Seiten ohne Siegel (wissen:1), lesbar von Anfang an.
// Der Rang schaltet frei, was der Spieler darf, das Kompendium belohnt, was er nutzt. Es sperrt nichts, was man zum Spielen braucht: Die Zeile "Im Spiel" steht immer da.
// Im Spielstand: S.komp[id]={st,...}. st: 0 gesperrt, 1 Bronze, 2 Silber, 3 Gold. Seit 11.4 zählt f die verkauften Flaschen, gm merkt die Goldmedaille
// (Gold zählt erst ab Silber), r ist der beste Stand nach den Regeln von 11.4 (nur der geht ins Album). l sind die gelesenen Liter einer Sorte.
// Felder aus 11.1 bis 11.3 (n, g, gd, jg) und die alten Sorten-Einträge bleiben im Spielstand liegen, zählen und erscheinen aber nicht mehr.
// S.kompV ist der Stand der Regeln (2 seit 11.3, 3 seit 11.4). S.kompNeu sammelt neue Siegel für den nächsten Winzerboten. Ohne Wirkung aufs Geld: Boni und Meilensteine kommen in 11.5.
// Kennungen nie umbenennen, sie stehen in Spielständen und im Album (KOMP_ALBUM_KEY: bester Stand je Eintrag über alle Partien, nur zum Ansehen).
// KOMP_W: alle Schwellen an einer Stelle, je Eintrag Flaschen für Bronze, Silber und Gold. Ohne dritte Zahl gibt es Gold nur mit einer Goldmedaille.
// Alle Zahlen hat Maik am 20.11.2026 abgenommen, nach sechs Probepartien mit den neuen Sorten: Kabinett und Spätlese angehoben (vorher 12.000 und 40.000, 15.000 und 50.000),
// Trockenbeerenauslese und Eiswein gleich schwer mit 250 und 1.000 (vorher 100 und 1.000), Beerenauslese Bronze ab 250 (vorher 200). Federweißer, Tafelwein, Trockenbeerenauslese und Eiswein macht der Test-Spieler nicht, sie sind geschätzt. Gemessen wird in 11.5.
const KOMP_W={rolle:{feder:[1000,10000,30000],tafel:[500,3000,10000],qba:[1000,6000,20000],kab:[1000,20000,60000],spat:[1000,20000,75000],
  aus:[500,5000],ba:[250,2000],tba:[250,1000],eis:[250,1000],sekt:[500,5000]}};
const KOMP_ALBUM_KEY='oechsle-album';
const KOMP_ST=['','Bronze','Silber','Gold'], KOMP_ST_WORT=['','entdeckt','gemeistert','Legende'];
// Goldmedaille heißt im Spiel Platz 1: Gold bei der Landesprämierung, Platz 1 beim Bundeswettbewerb oder bei der Weltweinschau. Sekt tritt erst ab dem Bundeswettbewerb an.
const KOMP_GOLDMED='eine Goldmedaille (Platz 1 bei einem Wettbewerb)', KOMP_GOLDMED_SEKT='eine Goldmedaille (Platz 1 beim Bundeswettbewerb oder bei der Weltweinschau)';
// Kapitel: Kennung, Zeichen, kurzer Name für den Knopf, voller Name.
const KOMP_KAP=[['sorte','🍇','Sorten','Rebsorten'],['stufe','🍷','Stufen','Stufen'],['gebiet','⛰️','Gebiet','Gebiet und Lagen'],['technik','⚙️','Technik','Keller und Technik'],['gefahr','⛈️','Gefahren','Gefahren']];
// Die Geschichten (seit 11.3): Weinwissen in höchstens vier Sätzen, ohne Zahlen des Spiels. Die Zahlen stehen je Eintrag in der Zeile "Im Spiel" und kommen aus dem Code.
// Quelle und Faktencheck: Vault-Notiz "Weinbau-Spiel Weinkompendium Texte". Seit 11.4 dazu die zehn neuen Sorten und je Gebiet der Regional-Sekt (sekt_<Sorte>).
const KOMP_TEXT={
  wickler:'Ein kleiner Falter, dessen Raupen zweimal im Jahr zuschlagen. Die erste Generation heißt Heuwurm und frisst im Frühsommer an den Blüten, die zweite heißt Sauerwurm und bohrt sich im Sommer in die Beeren. Wo sie fressen, zieht Fäulnis ein. Viele Winzer hängen Duftstoffe in den Weinberg, die die Männchen verwirren.',
  mehltau:'Ein Pilz, der mit Reben aus Amerika nach Europa kam und auch Peronospora heißt. Er braucht Wärme und Nässe: Nach Regen zeigen die Blätter helle Ölflecken, auf der Unterseite wächst ein weißer Rasen. Die Beeren schrumpfen dann zu Lederbeeren. Gegen ihn wurde die Bordeauxbrühe aus Kupfer und Kalk erfunden.',
  kirsch:'Eine kleine Fruchtfliege aus Ostasien. Anders als die heimischen Essigfliegen sägt das Weibchen gesunde, reifende Beeren an und legt seine Eier hinein. Die Beeren laufen aus, und es riecht nach Essig. Dunkle Sorten mit dünner Schale trifft es am härtesten.',
  sorte_riesling:'Der König der deutschen Weißweine und der Spezialist für kühle Steillagen. Er reift spät und braucht Geduld im Keller. Dafür belohnt er dich mit feiner Säure und Weinen, die Jahrzehnte halten. Als Sekt ist er eine Klasse für sich.',
  sorte_mueller:'1882 von Hermann Müller aus dem Thurgau gezüchtet, eine Kreuzung aus Riesling und Madeleine Royale. Die Rebe ist genügsam, reift früh und trägt viel. Ihre Weine sind mild, fruchtig und schnell trinkreif. Große Kunst wird selten daraus, ein verlässliches Einkommen schon.',
  sorte_silvaner:'Seit 1659 in Franken zu Hause, zuerst gepflanzt in Castell. Auf Muschelkalk und Lehm wird er erdig und würzig, mit milder Säure. Er drängt sich nicht vor und passt deshalb zu fast jedem Essen, am liebsten zu Spargel.',
  sorte_spaetb:'Die Diva unter den Rotweinen, anderswo heißt sie Pinot Noir. Sie will die besten Lagen, wenig Ertrag und einen Kellermeister mit ruhiger Hand. Gelingt alles, wird der Wein samtig und vielschichtig. Als Grundwein für Sekt ist sie ebenfalls erste Wahl.',
  sorte_portug:'Eine alte Rotweinsorte, die früh reift und reichlich trägt. Mit Portugal hat sie trotz des Namens wohl nichts zu tun, sie kam über Österreich nach Deutschland. Ihr Wein ist hell, mild und unkompliziert, oft wird Weißherbst daraus. Getrunken wird er jung.',
  sorte_troll:'Der Hauswein der Württemberger, eingewandert aus Südtirol, wo er Vernatsch heißt. Aus „Tirolinger“ wurde mit der Zeit Trollinger. Er ist hellrot, leicht und duftet nach Kirsche. Am besten schmeckt er jung, aus dem Viertele-Glas.',
  sekt:'Beim Sekt gärt der fertige Wein ein zweites Mal, diesmal in der Flasche. Dabei entsteht die Kohlensäure, und die Hefe gibt ihm über Monate seine cremige Art. Danach wird jede Flasche Tag für Tag gerüttelt, bis die Hefe im Hals sitzt und herausgeschossen wird. Ein Winzersekt liegt mindestens neun Monate auf der Hefe.',
  stufe_feder:'Traubenmost, der gerade erst zu gären begonnen hat, trüb, süß und prickelnd. Er gärt in der Flasche weiter, deshalb darf sie nie fest verschlossen sein. Nach wenigen Wochen ist der Zauber vorbei. Dazu gehört Zwiebelkuchen.',
  stufe_tafel:'Die einfachste Stufe, heute steht dafür „Deutscher Wein“ auf dem Etikett. Die Trauben dürfen aus dem ganzen Land kommen, die Anforderungen sind niedrig. Kein Wein zum Angeben, aber einer, der auch in schwachen Jahren gelingt.',
  stufe_qba:'Das Rückgrat jedes Weinguts. Die Trauben stammen aus einem einzigen der 13 deutschen Anbaugebiete. Jeder Qualitätswein wird amtlich geprüft und bekommt eine Prüfnummer aufs Etikett.',
  stufe_kab:'Die erste Stufe der Prädikatsweine, leicht, fein und mit wenig Alkohol. Der Name kommt vom „Cabinet“, dem Keller, in dem Kloster Eberbach seine besten Fässer verwahrte. Zucker zusetzen ist ab hier verboten, der Wein muss aus eigener Kraft gelingen.',
  stufe_spat:'1775 kam der Bote mit der Leseerlaubnis zu spät nach Schloss Johannisberg, die Trauben waren schon überreif. Der Wein daraus wurde der beste, den man dort je getrunken hatte. Seitdem lässt man Trauben mit Absicht länger hängen. Was am Ende zählt, ist das Mostgewicht, nicht der Kalender.',
  stufe_aus:'Hier wird von Hand sortiert. Nur vollreife Trauben kommen in die Bütte, alles Unreife und Kranke bleibt draußen. Das kostet Menge und Zeit. Dafür wird der Wein dicht, lange haltbar und bei Sammlern begehrt.',
  stufe_ba:'Für sie werden überreife, edelfaule Beeren einzeln aus den Trauben gepickt. Die Edelfäule hat ihnen Wasser entzogen, übrig bleiben Zucker und Aroma. Heraus kommt wenig, aber ein honigsüßer Wein, der Jahrzehnte reifen kann.',
  stufe_tba:'Die Spitze der Leiter. Die Beeren sind am Stock fast zu Rosinen geschrumpft, ein Leser schafft an einem Tag oft nur ein paar Handvoll. Der Most ist so dick, dass die Hefe kaum dagegen ankommt. 150 Grad Öchsle braucht es dafür, die Zahl kennst du vom Titelbild.',
  stufe_eis:'Die Trauben bleiben bis in den Winter hängen und werden bei mindestens sieben Grad unter null gefroren gelesen und sofort gepresst. Das Wasser bleibt als Eis in der Presse, heraus läuft nur süßer, dichter Saft. Echter Eiswein entsteht aus gesunden, gefrorenen Trauben. Das Spiel vereinfacht hier und verlangt Edelfäulnis, damit die Stufen bis zur Trockenbeerenauslese aufeinander aufbauen. Ein Pokerspiel bleibt es so oder so, oft kommt der Frost zu spät oder gar nicht.',
  gebiet_mosel:'Deutschlands ältestes Weinbaugebiet, schon die Römer pflanzten hier Reben. An Mosel, Saar und Ruwer stehen die steilsten Weinberge Europas, gearbeitet wird fast nur von Hand. Der dunkle Schiefer speichert tagsüber Wärme und gibt sie nachts an die Reben ab. So entstehen leichte, mineralische Rieslinge, die man in der ganzen Welt kennt.',
  gebiet_rheingau:'Bei Wiesbaden fließt der Rhein ein Stück nach Westen, und die Hänge schauen genau nach Süden. Im Norden hält der Taunus den kalten Wind ab. Hier stehen Kloster Eberbach und Schloss Johannisberg, wo die Spätlese erfunden wurde. Riesling und Spätburgunder aus dem Rheingau gelten seit Jahrhunderten als fein und teuer.',
  gebiet_rheinhessen:'Das größte deutsche Anbaugebiet, das „Land der tausend Hügel“ zwischen Bingen, Mainz und Worms. Löss und Kalk, wenig Regen und milde Winter bringen verlässliche Ernten. Die sanften Hügel lassen sich gut mit Maschinen bearbeiten. Lange stand Rheinhessen für Masse, heute kommen von hier einige der spannendsten Weine im Land.',
  gebiet_pfalz:'Im Schutz des Pfälzerwaldes ist es so warm, dass Feigen, Mandeln und Zitronen im Freien reifen. Rund 1.800 Sonnenstunden im Jahr machen die Weine voll und kräftig. Mitten hindurch führt die Deutsche Weinstraße, an der sich ein Weindorf ans andere reiht.',
  gebiet_franken:'Entlang der Mainschleifen wächst der Wein auf Muschelkalk und Keuper. Das Klima ist rauer als am Rhein, mit heißen Sommern und kalten Wintern. Typisch sind trockene, erdige Weißweine, allen voran der Silvaner. Abgefüllt wird in den Bocksbeutel, die bauchige Flasche und das Markenzeichen der Franken.',
  gebiet_wuerttemberg:'Am Neckar und seinen Nebenflüssen wächst mehr Rotwein als Weißwein, oft auf alten Terrassen mit Trockenmauern. Die Württemberger trinken ihren Wein am liebsten selbst, kaum etwas verlässt das Land. Ausgeschenkt wird in der Besenwirtschaft. Hängt ein Besen an der Tür, hat der Winzer geöffnet.',
  spitze:'Jedes Gebiet hat diesen einen Hang, über den alle reden: steil, steinig und von morgens bis abends in der Sonne. Die Trauben werden dort reifer als irgendwo sonst. Solche Lagen bleiben über Generationen in einer Familie. Kommt eine unter den Hammer, bietet das halbe Tal mit.',
  keller1:'Der erste Schritt in die Moderne sind Tanks aus Edelstahl mit Kühlung. Darin gärt der Most langsam und sauber bei der Temperatur, die du willst. Die frischen Fruchtaromen bleiben im Wein, statt mit der Wärme zu verfliegen.',
  keller2:'Große Fässer aus Eiche, an der Mosel das Fuder mit 1.000 Litern, am Rhein das Stückfass mit 1.200. Sie geben kaum Holzgeschmack ab, lassen den Wein aber durch die Poren atmen. So wird er runder, ruhiger und haltbarer.',
  keller3:'Ein Gewölbe voller kleiner Eichenfässer mit je 225 Litern, innen über dem Feuer geröstet. Sie geben dem Wein Noten von Vanille, Rauch und Schokolade mit. Nach drei Füllungen ist ein Barrique ausgelaugt und muss ersetzt werden. Teurer geht Ausbau kaum, feiner auch nicht.',
  sektkeller:'Für Sekt bekommt der fertige Grundwein in der Flasche Zucker und Hefe, das heißt Tirage. Die Hefe gärt ein zweites Mal, und weil die Flasche zu ist, bleibt die Kohlensäure im Wein. Danach liegt er auf der Hefe, in Deutschland mindestens neun Monate, gute Sekte oft zwei Jahre und länger. Auf Rüttelpulten wird jede Flasche gedreht, bis die Hefe im Hals sitzt. Beim Degorgieren friert man den Hals ein und lässt den Pfropfen herausschießen, ein Schuss Dosage macht den Sekt trocken oder milder. Zum Schluss kommen Korken und Agraffe drauf, das Drahtkörbchen, das den Druck hält.',
  reife:'Mit dem Abfüllen ist ein Wein nicht fertig. In der Flasche runden sich Säure und Frucht, aus jungen, lauten Aromen werden reife. Am besten liegt er dunkel, kühl und ruhig. Einfache Sorten trinkt man trotzdem jung, ein großer Riesling hält Jahrzehnte.',
  zuckern:'Zucker im Most macht den Wein nicht süßer, die Hefe vergärt ihn zu mehr Alkohol. Bei einfachen Weinen ist das in Grenzen erlaubt, bei Prädikatswein streng verboten. Wasser im Wein war und ist immer Betrug. Wer es trotzdem tut, sollte den Weinprüfer nicht vergessen.',
  masch_duenger:'Reben holen jedes Jahr Nährstoffe aus dem Boden, die irgendwann fehlen. Der Streuer hängt hinten am Schlepper und verteilt den Dünger gleichmäßig zwischen den Zeilen. Von Hand mit dem Eimer landet immer zu viel auf einem Fleck und zu wenig auf dem nächsten.',
  masch_klein:'Die kleine Maschine für den Anfang, gezogen vom Schlepper. Sie fährt über die Rebzeile und rüttelt die Beeren mit Schlagstäben vom Stock. Aussuchen kann sie nicht, sie nimmt mit, was hängt. Edelfaule Trauben bleiben deshalb Handarbeit.',
  masch_laub:'Im Juni wachsen die Triebe über den Drahtrahmen hinaus. Der Laubschneider stutzt sie wie eine Hecke, oben und an den Seiten. Danach kommen Licht und Luft an die Trauben, sie reifen besser und faulen seltener.',
  masch_gross:'Die große Maschine fährt aus eigener Kraft und steht wie ein Tor über der Rebzeile. Sie schüttelt die Beeren ab, trennt Blätter und Stiele und sammelt alles im eigenen Tank. Ein echter Vollernter schafft viel mehr als der im Spiel, hier bleibt er klein, damit deine Leute wichtig bleiben. In Steillagen kommt er ohnehin nicht weit.',
  masch_abfuell:'Spülen, füllen, verkorken, etikettieren, alles an einem Band. Von Hand geht bei jeder Flasche ein Schluck daneben, die Anlage füllt auf den Millimeter genau. Und sie arbeitet sauber, kein Keim kommt mit in die Flasche.',
  hagel:'Ein Sommergewitter reicht. In wenigen Minuten zerfetzt Hagel die Blätter und schlägt die Trauben vom Stock. Meist trifft es nur einen schmalen Streifen, der Nachbar bleibt verschont. Angeschlagene Beeren faulen schnell, was noch hängt, will gut beobachtet werden.',
  spaetfrost:'Im Frühjahr treiben die Reben aus, und die jungen Triebe vertragen keinen Frost. Gefürchtet sind die Eisheiligen Mitte Mai. Eine einzige klare Nacht kann einen großen Teil der Ernte kosten, lange bevor eine Traube da ist. Manche Winzer stellen dann Frostkerzen zwischen die Zeilen.',
  kaelte:'Wer seine Spitzen-Sorte über Oktober hängen lässt, wagt viel: Klappt der Weg seines Gebiets, gibt es Beerenauslese oder Eiswein. Sonst ist die Ernte des Feldes weg, zum Beispiel durch einen Kälteeinbruch im November oder Tauwetter im Dezember.',
  edel:'Der Pilz Botrytis ist Fluch und Segen. Auf unreifen Trauben ist er schlicht Fäule und verdirbt die Ernte. Auf reifen Beeren macht er bei Morgennebel und Nachmittagssonne die Schale durchlässig, das Wasser verdunstet, Zucker und Aroma bleiben. Ohne ihn gäbe es keine Beerenauslese.',
  skandal:'1985 flog auf, dass Weine mit Glykol gesüßt worden waren, einem Stoff, der sonst in Frostschutzmitteln steckt. Über Nacht kaufte kaum noch jemand Wein, auch nicht von den ehrlichen Winzern. Bis das Vertrauen zurück war, vergingen Jahre. Seitdem sind die Weingesetze deutlich strenger.',
  kontrolle:'Weinkontrolleure haben eine feine Nase und das Recht, jeden Keller zu betreten. Sie kommen ohne Anmeldung, ziehen Proben und lesen das Kellerbuch. Wer sauber arbeitet, hat nach einer Stunde wieder seine Ruhe.',
  maschine:'Im Weinberg liegen Steine, stehen Pfähle und spannen sich Drähte, irgendwann erwischt es jede Maschine. Ärgerlich wird es mitten in der Lese, wenn jeder Tag zählt. Wer regelmäßig wartet, steckt einen Schlag besser weg.',
  helferweg:'Lese ist Knochenarbeit, und gute Leute sind im Herbst überall gefragt. Wer seine Helfer knapp hält, steht eines Morgens mit einem weniger da. Dass dann auch Geld aus der Kasse fehlt, macht es nicht besser. Ein fairer Lohn ist die billigste Versicherung.',
  sorte_se_elbling:'Eine der ältesten Rebsorten Europas, schon die Römer bauten sie an der Mosel an. Heute wächst sie fast nur noch an der Obermosel auf Muschelkalk. Ihr Wein ist leicht, trocken und sehr säurebetont. Genau so wünscht man sich einen Grundwein für Sekt.',
  sorte_me_weissb:'Ein Burgunder mit feiner Säure und zartem Duft nach Apfel und Birne. Er ist unkompliziert im Weinberg und verlässlich im Ertrag. Zum Essen passt er fast immer, deshalb verkauft er sich Jahr für Jahr gut.',
  sorte_se_graub:'Eine Spielart des Spätburgunders mit rötlich-grauen Beeren. Früher hieß er Ruländer und wurde süß ausgebaut, heute ist er trocken ein Liebling der Kundschaft. Seine Weine sind kräftig und rund, mit Noten von Birne und Nuss.',
  sorte_sp_scheu:'1916 von Georg Scheu in Alzey gezüchtet, mitten in Rheinhessen. Sie duftet unverwechselbar nach schwarzer Johannisbeere und Grapefruit. Die Rebe reift spät, will gute Lagen und verträgt strengen Winterfrost schlecht. In guten Jahren wird aus ihr ein edelsüßer Wein von Weltklasse.',
  sorte_me_dornf:'1955 in Weinsberg gezüchtet und in der Pfalz groß geworden. Die Rebe ist robust, wächst kräftig und trägt verlässlich. Ihr Wein ist tiefdunkel, fast schwarz, mit viel Frucht von Kirsche und Brombeere.',
  sorte_se_chard:'Die bekannteste Weißweinsorte der Welt, zu Hause im Burgund und in der Champagne. In Deutschland ist sie erst seit 1991 zugelassen und fühlt sich in der warmen Pfalz besonders wohl. In der Champagne ist sie eine der drei klassischen Sorten für Schaumwein.',
  sorte_sp_gewuerz:'Eine uralte, eigenwillige Sorte mit rötlichen Beeren. Ihr Duft nach Rosen, Litschi und Marzipan ist unverwechselbar. Sie trägt wenig und launisch, bringt aber viel Zucker mit. Für edelsüße Auslesen ist sie wie gemacht.',
  sorte_se_bacchus:'Eine Kreuzung aus den 1930er-Jahren, benannt nach dem römischen Weingott. Er reift früh und wird auch dort reif, wo es dem Riesling zu kühl ist. Seine Weine duften blumig nach Muskat und Holunderblüte und haben wenig Säure. Nirgends ist er so beliebt wie in Franken.',
  sorte_se_schwarzr:'Mit dem Riesling ist er nicht verwandt, er gehört zur Familie der Burgunder. Seine Blätter sind unten weiß behaart, als wären sie mit Mehl bestäubt, daher der zweite Name Müllerrebe. In der Champagne heißt er Pinot Meunier und ist eine der drei klassischen Sorten für Schaumwein. Als Rotwein ist er rund, mild und fruchtig.',
  sorte_sp_lemb:'Eine spät reifende Rotweinsorte, die in Österreich Blaufränkisch heißt. In Deutschland wächst sie fast nur in Württemberg, in den wärmsten Lagen am Neckar. Ihr Wein ist dunkel, würzig und kräftig, mit Noten von Brombeere und Pfeffer. Im Barrique wird er zu einem der besten Rotweine des Landes.',
  sekt_se_elbling:'An der Obermosel ist Sekt vom Elbling eine alte Spezialität, gleich gegenüber in Luxemburg wird aus derselben Rebe Crémant. Die kräftige Säure des Grundweins hält ihn frisch und schlank. Er perlt fein und duftet nach grünem Apfel und Zitrone. Getrunken wird er jung, am liebsten an einem Sommerabend.',
  sekt_se_riesling:'Rund um Wiesbaden und Eltville sitzen seit dem 19. Jahrhundert einige der ältesten Sektkellereien Deutschlands. Ihr liebster Grundwein ist der Riesling von den Hängen am Rhein. Seine Säure trägt den Sekt, dazu kommen Noten von Pfirsich und Zitrus. Lange auf der Hefe wird er cremig, ohne seine Frische zu verlieren.',
  sekt_se_graub:'Als Sekt zeigt der Grauburgunder seine runde, weiche Seite. Er bringt weniger Säure mit als der Riesling, dafür Schmelz und einen Hauch von Birne und Nuss. In Mainz, am Rand von Rheinhessen, reift Sekt seit dem 19. Jahrhundert in tiefen Gewölbekellern. Viele Winzer im Hügelland machen ihren Sekt heute selbst, Flasche für Flasche.',
  sekt_se_chard:'Sekt nur aus weißen Trauben heißt Blanc de Blancs, und die klassische Sorte dafür ist der Chardonnay. In der warmen Pfalz reift er voll aus und gibt dem Sekt Fülle und einen Duft nach gelbem Apfel. Lange auf der Hefe kommen Noten von Brioche und Nuss dazu. So kommt ein Stück Champagne an die Weinstraße.',
  sekt_se_bacchus:'Aus Bacchus wird ein duftiger Sekt, der nach Holunderblüte und Muskat riecht. Weil die Sorte wenig Säure mitbringt, lesen die Winzer die Trauben dafür früh, solange sie noch frisch schmecken. Er ist kein Sekt zum Lagern, sondern einer für den Sommer. Am besten schmeckt er jung und gut gekühlt.',
  sekt_se_schwarzr:'Nirgends in Deutschland wächst so viel Schwarzriesling wie in Württemberg. Presst man die dunklen Trauben sofort, bleibt der Saft fast hell, und es wird ein Blanc de Noirs daraus, ein weißer Sekt aus roten Trauben. Darf der Most kurz auf der Schale liegen, wird er zum Rosé. Wie in der Champagne gibt der Schwarzriesling dem Sekt Frucht und eine runde, weiche Art.'
};
// Seit 11.4: Sorten, die es in zwei Rollen oder schon vor 11.4 gab, teilen sich die Geschichte.
for(const [a,b] of Object.entries({me_mueller:'mueller',me_silvaner:'silvaner',sp_silvaner:'silvaner',se_riesling:'riesling',sp_riesling:'riesling',sp_spaetb:'spaetb',me_troll:'troll'})) KOMP_TEXT['sorte_'+a]=KOMP_TEXT['sorte_'+b];
// Welche Stufe zu welcher Rolle gehört (Maik 19.11.2026). Der Sekt gehört zur Sekt-Sorte.
const KOMP_STUFE_ROLLE={feder:'menge',tafel:'menge',qba:'menge',kab:'menge',spat:'menge',aus:'spitze',ba:'spitze',tba:'spitze',eis:'spitze'};
// Spielstände ohne Rollen (vor 11.4) bekommen die Rollen über diese feste Liste (Maik 20.11.2026): Menge, Sekt, Spitze je Gebiet mit den alten Sorten.
// Beim Sekt zählt dort jeder Sekt, egal aus welcher Sorte.
const KOMP_ALT_ROLLEN={mosel:['mueller','spaetb','riesling'],rheingau:['silvaner','spaetb','riesling'],rheinhessen:['portug','mueller','silvaner'],
  pfalz:['portug','mueller','riesling'],franken:['mueller','spaetb','silvaner'],wuerttemberg:['troll','spaetb','riesling']};
// Ins Album schreibt ein alter Spielstand nur, wo es dieselbe Sorte in derselben Rolle auch neu gibt, sonst zählt das Siegel nur in der Partie.
const KOMP_ALT_ALBUM={'mueller|menge':'me_mueller','riesling|spitze':'sp_riesling','silvaner|spitze':'sp_silvaner','troll|menge':'me_troll','silvaner|menge':'me_silvaner'};
// Je Eintrag: kap, titel, text (die Zeile "Im Spiel", gebaut aus den Zahlen des Codes), immer (die Zeile steht schon in der Liste), wissen (Wissens-Seite ohne Siegel).
// Einträge mit Siegeln: name (Stufe oder Sekt), stufe, rl (Rolle der Sorte), w (Schwellen aus KOMP_W). Der Titel kommt aus kompTitel.
const KOMP={};
const KOMP_ROLLE_SIEGEL={menge:'Die Siegel für Federweißer bis Spätlese hängen an dieser Sorte.',sekt:'Die Siegel für den Sekt hängen an dieser Sorte.',spitze:'Die Siegel für Auslese bis Eiswein hängen an dieser Sorte.'};
// Seit 11.8: Die beiden Kästen aus dem alten Kapitel Stufen sind die Seite "Reifezeit und Regeln" im Lexikon.
KOMP_TEXT.regeln='Ein Wein braucht Zeit, erst im Fass und dann in der Flasche. Wann du was anmelden darfst, schreibt das Weinrecht genau vor.';
// Album über alle Partien (Maik 19.11.2026): bester Stand je Eintrag, eigener Speicher-Schlüssel wie bei der Bestenliste. Der Test-Spieler schreibt nichts hinein.
// Es liegt getrennt von den drei Spielständen, Löschen oder Überschreiben eines Spielstands rührt es nicht an. Das Spiel schreibt nur hinein und liest nie daraus zurück.
// Seit 11.4 (Maik 20.11.2026): je Sorte ein Eintrag für jede ihrer Stufen, 55 Weine und 165 Siegel. Kennung wein_<Sorte>_<Stufe>, beim Sekt wein_<Sorte>_sekt.
// Die 16 Einträge aus 11.1 bis 11.3 (sechs alte Sorten, Sekt, neun Stufen) bleiben unverändert als eigener Block, neu geschrieben wird dort nichts mehr.
const KOMP_ALBUM=[];
// Seit 11.8 (Maik 20.11.2026): Das Fenster von unten mit fünf Kapiteln ist weg. Siegel stehen auf dem Siegelbrett, Wissen im Lexikon, beides im Weinarchiv.
// Siegelbrett, Variante B: oben Zähler und Ruf des Hauses mit sieben Marken (R1), darunter je Sorte ein Fenster mit einer Zeile je Wein, unten das Album.
// Wer alle drei Siegel hat, bekommt das Gold-Etikett, beim Silvaner in Franken ist es der Bocksbeutel (Maik 20.11.2026). Nur zum Ansehen, ohne Wirkung aufs Geld.
const KOMP_BRETT=[['menge','Menge-Sorte'],['spitze','Spitzen-Sorte'],['sekt','Sekt-Sorte']];
// Ohne Thema: Titel und Satz je Monat, ohne Foto.
const FLAUTE=['Stille Wochen in den Weinbergen','Rebschnitt im ganzen Land','Der Saft steigt in die Reben','Die Knospen brechen auf','Die Reben blühen','Kleine Beeren am Stock','Die Trauben werden weich','Die Öchsle steigen','Lese-Zeit im ganzen Land','Goldenes Laub, späte Trauben','Ruhe in den Kellern','Kalte Nächte, ruhige Fässer'];
const FLAUTE_TEXT=['Die Reben ruhen, die Winzer planen das neue Jahr und schärfen die Scheren.','Überall wird geschnitten und gebunden. Wer jetzt sauber arbeitet, erntet im Herbst besser.','Wenn die Rebe weint, ist der Winter vorbei. Bald zeigen sich die ersten Knospen.','Zartes Grün an den Stöcken. Jede kalte Nacht lässt die Winzer jetzt bangen.','Ein feiner Duft liegt über den Hängen. Jetzt entscheidet sich, wie viele Trauben es gibt.','Aus den Blüten sind kleine, harte Beeren geworden. Der Sommer kann kommen.','Die Beeren färben sich und werden weich. Ab jetzt zählt jede Sonnenstunde.','Mit jeder warmen Woche steigt der Zucker in den Trauben. Die Winzer messen fleißig.','In den Weinbergen wird geschnitten und geschleppt, in den Kellern gärt der junge Most.','Das Laub färbt sich, die späten Trauben hängen noch. Mutige warten auf mehr Öchsle.','Die Lese ist vorbei, in den Fässern reift der neue Jahrgang heran.','Frost in der Nacht, Stille im Keller. Manche hoffen noch auf Eiswein.'];
// Version 4.5 (Paket 6): je Monat zwei weitere ruhige Schlagzeilen. flauteKopf nimmt zufällig eine der drei, nie dieselbe wie beim letzten Mal (S.flauteZ).
const FLAUTE_MEHR=[
  [['Frostklare Tage im Weinberg','Die Hänge liegen still, nur die Krähen ziehen ihre Runden. In den Stuben wird über Rebsorten und Preise gestritten.'],['Winzer am Ofen','Wer jetzt Zeit hat, rechnet. Die meisten kommen zu dem Schluss, dass das letzte Jahr besser hätte sein können.']],
  [['Scheren klappern im ganzen Land','Ein Auge Rebe zu viel, und im Herbst hängen die Trauben dünn. Die Alten schneiden streng, die Jungen mutig.'],['Das Holz kommt aus dem Weinberg','Überall brennen kleine Feuer mit altem Rebholz. Es riecht nach Rauch und ein bisschen nach Frühling.']],
  [['Die Rebe weint','Aus den frischen Schnitten tropft der Saft. Für die Winzer ist das das schönste Zeichen, dass der Winter vorbei ist.'],['Pflanzzeit geht zu Ende','Wer jetzt noch Reben in die Erde bringt, muss sich beeilen. In den Rebschulen wird es leer.']],
  [['Bange Nächte','Ein klarer Himmel freut die Spaziergänger und ärgert die Winzer. Eine Frostnacht reicht, um die jungen Triebe zu verbrennen.'],['Erstes Grün an den Hängen','Die Knospen sind aufgebrochen, die Hänge bekommen einen grünen Schimmer. Jetzt bloß kein Frost mehr.']],
  [['Blütenduft über den Hängen','Ganz zart und nur ein paar Tage lang riecht es in den Weinbergen nach Blüte. Wer es kennt, bleibt kurz stehen.'],['Bloß kein Regen jetzt','Während die Reben blühen, schauen alle Winzer gleichzeitig in den Himmel. Nasse Blüten bringen lockere Trauben.']],
  [['Grüne Kugeln am Stock','Die Beeren sind noch hart und sauer, aber schon gut zu zählen. Erste Winzer wagen eine Schätzung für den Herbst.'],['Laubarbeit in vollem Gang','Blätter zupfen, Triebe kürzen, Gassen mähen. Im Juni hat kein Winzer Zeit für etwas anderes.']],
  [['Farbe kommt in die Trauben','Die roten Sorten färben sich, die weißen werden goldgelb und weich. Ab jetzt zählt jede Sonnenstunde.'],['Hitze in den Steillagen','Wer mittags im Weinberg steht, versteht, warum die Alten um fünf Uhr anfangen.']],
  [['Die Wespen sind da','Sie riechen den Zucker früher als jedes Messgerät. Für die Winzer heißt das: Es geht bald los.'],['Messgerät im Dauereinsatz','Überall stehen Winzer zwischen den Reben und halten Beeren gegen das Licht. Das Öchsle-Fieber ist ausgebrochen.']],
  [['Traktoren auf allen Wegen','Auf den Straßen geht es nur noch im Schritttempo voran. Wer es eilig hat, muss eben warten.'],['Volle Kisten, krumme Rücken','In den Weinbergen wird geschnitten und geschleppt. Abends riecht das ganze Dorf nach frischem Most.']],
  [['Nebel am Morgen, Sonne am Mittag','Das beste Wetter für späte Trauben. Mancher Winzer hofft jetzt auf die Edelfäulnis.'],['Die Weinfeste sind vorbei','In den Dörfern werden die Bänke weggeräumt, in den Kellern wird es ernst.']],
  [['Der junge Wein schmeckt','Überall wird probiert, gelobt und geschimpft. Jeder Winzer findet seinen Jahrgang besser als den des Nachbarn.'],['Kahle Stöcke, volle Fässer','Das Laub ist gefallen, die Arbeit wandert in den Keller.']],
  [['Warten auf den Frost','Ein paar Mutige haben noch Trauben hängen. Sie schauen jeden Abend aufs Thermometer.'],['Stille Nacht im Keller','Die Fässer ruhen, der Wein arbeitet langsam vor sich hin. Für die Winzer die ruhigste Zeit im Jahr.']]
];
// Version 4.5: Die Geschichte aus dem Vorspann geht weiter. Je Partie einmal, gemerkt in S.gesch. Als Artikel mit Wichtigkeit 45, Aufstieg und Wetter bleiben vorn.
const DORF={
  most:['Im alten Keller gärt es wieder','Zum ersten Mal seit Jahren blubbert es im Gewölbekeller. Die Ratte hat sich das Ganze von der obersten Fassreihe aus angesehen und wirkte fast ein bisschen beeindruckt.'],
  winter1:['Ein Winter ist geschafft','Am Stammtisch wird mitgezählt. Einen Winter hast du hinter dir, zwei fehlen noch, dann ist die Wette verloren. Der Wirt hat die Wettkasse schon mal hinter den Tresen gestellt.'],
  wette:['Die Wette ist verloren','Drei Winter, und {gut} gibt es immer noch. Der Wirt hat die Wettkasse geleert und davon eine Runde auf dich ausgegeben. Bezahlt haben ausgerechnet die, die am lautesten gelacht haben.'],
  // Version 7.7: Nachlese aus dem Dorf in der Ausgabe nach jeder Feier (n0 nach dem Kaufvertrag, n1 bis n9 nach dem Aufstieg zu RAENGE[i]). Sie wiederholt das Kapitel nicht.
  // Die alten Rang-Artikel r1, r3, r5 und r8 sind darin aufgegangen.
  n0:['Neue Gesichter am Hang','Die drei Hektar mit dem alten Gewölbekeller sind verkauft, an {gut}. Am Stammtisch wird schon gewettet: keine drei Winter, sagen die meisten. Nur der alte Winzer von nebenan hat nicht mitgewettet. Er schaut lieber über den Zaun.'],
  n1:['Der alte Winzer hat es ja gleich gesagt','Seit deiner Feier erzählt der alte Winzer von nebenan jedem, er habe dein Talent als Erster erkannt. Beim Bäcker, beim Friseur und zweimal nach der Messe. {nachbar} grüßt neuerdings über den Zaun zurück. Im Dorf gilt das als Ritterschlag.'],
  n2:['Ein Korken im Pfarrgarten','Der Korken von deiner Feier im Gewölbekeller ist angeblich bis in den Pfarrgarten geflogen. Der Pfarrer hat ihn aufgehoben und will ihn zum Erntedank ausstellen. Im Käseladen wundern sie sich derweil, warum {gut} neuerdings jede Woche ein Stück Bergkäse bestellt.'],
  n3:['Eine Kiste für das Rathaus','Nach seinem Besuch bei dir hat der Bürgermeister gleich eine Kiste Spätlese bestellt. Für das Rathaus, sagt er. Im Rathaus hat sie bisher keiner gesehen. Am Schulhof wird schon gewettet, wann die erste Erntemaschine durchs Dorf fährt. Winken wollen die Kinder auf jeden Fall.'],
  n4:['Die Blaskapelle übt wieder','Nach dem Fest in deinem Hof hat die Blaskapelle beschlossen, wieder regelmäßig zu üben. Dienstags, bei offenem Fenster. Im Rathaus hängt dein Name jetzt groß auf einem Zettel neben dem Rednerpult. Für das nächste Mal.'],
  n5:['Sonntagsausflug zum Gut','Seit das Wappen über deiner Tür hängt, kommen sonntags Ausflügler aus der Stadt zu {gut}. Sie fotografieren die Freitreppe und fragen, wo der große Vollernter steht, von dem alle reden. Im Keller soll es eine Ratte mit eigenem Käsefach geben, erzählt man sich. Bestätigt hat das niemand.'],
  n6:['Die Nadel im Schaufenster','Der Juwelier in der Kreisstadt hat die goldene Traubennadel nachgemacht und ins Schaufenster gelegt. Verkauft hat er noch keine. Aber drei Leute haben gefragt, ob man sie auch ohne Rang tragen darf. Der Weinbauverband prüft das.'],
  n7:['Wer steht auf der Gästeliste?','Im Dorf wird seit Tagen gerätselt, wer zu deinem ersten Hoffest eingeladen wird. {gegner} behauptet, {er} hätte ohnehin keine Zeit. Die Kinder haben schon mal Lampions gebastelt, für alle Fälle.'],
  n8:['Ein neues Kissen für den Präsidenten','Aus dem Verband ist zu hören, dass der Präsident ein neues Kissen für seinen Stuhl bestellt hat. Dicker als das alte. Im Dorf sagt man, er wolle es sich noch ein paar Jahre gemütlich machen. Der Wirt hat trotzdem schon ein Fass für die nächste Wahlfeier zurückgelegt.'],
  n9:['Die Wettkasse hängt jetzt an der Wand','Der Wirt hat die alte Wettkasse von damals wieder hervorgeholt, die mit den drei Wintern. Sie hängt jetzt eingerahmt über dem Tresen, daneben dein Bild aus dem Festsaal. Darunter klebt die kleine Anzeige, mit der alles anfing. Wer sie ausgeschnitten hat, verrät keiner.']
};
// Seit 13.8.6 (Bauplan 13.8, Maik 21.11.2026): der dritte Absatz am Küchentisch, n ist die Generation, die übergibt. Ab der dritten nur, solange Kronen fehlen.
const genSatz=n=>{if(n===1) return 'Dann zeigst du aus dem Fenster auf die Hänge. „Ich habe gepflanzt. Jetzt lass es reifen.“'; if(n===2) return 'Draußen hängen die Trauben schwer an den alten Stöcken. „Es ist gereift. Jetzt hol die Krone.“';
  const f=KRONEN.length-kronen().length; return f<=0?'':f===1?'„Eine Krone fehlt noch. Die ist für dich.“':'„Die Kronen fehlen noch. Die sind für dich.“'};
const GEN_TEXT={
  anfang:{t:'Eine Flasche für später',p:()=>['Der erste eigene Wein ist in der Flasche. Eine davon kommt nicht ins Lager, sondern bekommt einen eigenen Platz im Regal im Gewölbekeller. Aufs Etikett schreibst du: „Für den Tag, an dem einer von uns Präsident wird.“','Am Stammtisch lachen sie, als du davon erzählst. „Ob ich das selbst erlebe, weiß ich nicht“, sagst du. „Aber einer von uns macht sie auf.“','Die Ratte im Keller hat den Platz sofort begutachtet. Korken mag sie zum Glück nicht.'],
    mut:()=>`Eine Partie kann über mehrere Generationen gehen. Alle ${GEN_JAHRE} Jahre übernimmt dein Kind das Weingut mit allem, was du aufgebaut hast. Das Ziel ist der Stuhl des Präsidenten, egal in welcher Generation. Zu Ende ist die Partie erst danach, mit der letzten Übergabe und der Chronik.`},
  g2:{t:'Der Schlüssel und die Flasche',p:()=>[`${GEN_JAHRE} Jahre nach dem ersten Spatenstich liegen zwei Dinge auf dem Küchentisch: der alte Kellerschlüssel und die Flasche vom ersten Jahrgang. Das Etikett ist schon ein wenig vergilbt.`,'„Den Schlüssel kannst du benutzen“, sagst du zu deinem Kind. „Die Flasche noch nicht.“',genSatz(1)]},
  g3:{t:'Ein Satz, den jeder kennt',p:()=>[`${2*GEN_JAHRE} Jahre liegt die Flasche jetzt im Regal. Das Etikett ist vergilbt, die Schrift kaum noch zu lesen. Aber dein Kind kennt den Satz auswendig: „Für den Tag, an dem einer von uns Präsident wird.“`,'Am Stammtisch sitzen längst die Enkel derer, die damals gewettet haben. Gelacht wird nicht mehr. Der Schlüssel wechselt die Hand, die Flasche bleibt im Regal.',genSatz(2)]},
  weiter:{t:'Wieder wechselt der Schlüssel',p:()=>['Noch eine Generation, noch ein Kellerschlüssel auf dem Küchentisch. Die Flasche liegt immer noch im Regal, und der Staub darauf ist älter als jeder im Haus.','„Irgendwann“, sagt man in der Familie, wenn jemand nach ihr fragt.'+(S.sieger?'':' Der Stuhl im Festsaal wartet auch noch.'),genSatz(genNr()-1)].filter(Boolean)},
  offen:{t:'Der Schlüssel wechselt die Hand',p:()=>['Wieder liegt der alte Kellerschlüssel auf dem Küchentisch. Die Flasche vom ersten Jahrgang ist längst getrunken, aber sie steht noch an ihrem Platz: leer, im Regal im Gewölbekeller.','„Präsident waren wir schon“, sagst du zu deinem Kind. „Jetzt zeig, dass es kein Glück war.“',genSatz(genNr()-1)].filter(Boolean)}
};
// Das Ende der Partie. wie: 'gen' beim letzten Generationswechsel (im Monatswechsel, als Sonderausgabe), 'frei' bei der freiwilligen Übergabe im Rathaus.
// art: 'best' nach dem Sieg bei der Weltweinschau (Ehrenpräsident), sonst 'gut'. Abgewählt ist kein drittes Ende, nur ein anderer Satz.
// Danach ist der Spielstand abgeschlossen (S.ende): Er zeigt nur noch die Chronik (Reiter ende), weiterspielen geht nicht mehr.
// Seit 13.6.4 gibt es nur noch das beste Ende (ENDE_NAME und ENDE_WERT kennen gut weiter, für alte Einträge in der Bestenliste).
const ENDE_BILD={best:'flasche-kueche-zwei'};
// Sprüche der Gegner: vorbei = er überholt dich, du = du überholst ihn, erfolg = nach deinem Sieg in einem Wettbewerb.
const GEGNER_SPRUCH={
  vorsicht:{vorbei:n=>`„Langsam ist auch eine Geschwindigkeit“, sagt ${n}, als sie an dir vorbeizieht.`,du:n=>`${n} gratuliert dir mit einem Korb Äpfel. „Nicht übermütig werden“, steht auf dem Zettel.`,erfolg:n=>`${n} hat deine Medaille in der Zeitung ausgeschnitten. Wofür, sagt sie nicht.`},
  qualitaet:{vorbei:n=>`„Das war zu erwarten“, sagt ${n} über seinen Vorsprung. Er sagt das öfter.`,du:n=>`${n} lässt ausrichten, Glück sei keine Leistung. Gratuliert hat er trotzdem.`,erfolg:n=>`${n} will deinen Siegerwein jetzt selbst nachprüfen lassen. Die Jury hat abgelehnt.`},
  zocker:{vorbei:n=>`„Tschüss, ${anr('Nachbar','Nachbarin')}!“, ruft ${n} und hupt beim Vorbeifahren am Weingut.`,du:n=>`${n} hat bei deinem Aufstieg so getan, als würde er telefonieren.`,erfolg:n=>`${n} behauptet, er hätte dieses Jahr gar nicht mitgemacht, sonst wäre es anders gelaufen.`}
};
// Version 4.5: Ab dem dritten Jahr steht statt "Rat vom alten Winzer" eine Rubrik in der Ecke. S.rubSack ist ein gemischter Stapel aller Texte, erst wenn er leer ist, kommt alles wieder.
const RUBRIK={
  k:{h:'☕ Dorfklatsch',t:['{nachbar} hat beim Weinfest das Tanzbein geschwungen. Das Bein soll sich inzwischen erholt haben.','Im Dorf wird erzählt, {gegner} rede mit den Reben. Angeblich antworten sie.','Der Hund von {nachbar} hat schon wieder Trauben gefressen. Diesmal nur die Spätlese.','Beim Bäcker gibt es jetzt Rieslingbrot. Niemand weiß genau, was darin ist.','{nachbar} hat einen neuen Traktor. Er ist rot, laut und viel zu groß für die Gasse.','Am Stammtisch wird gestritten, ob Rotwein zu Fisch passt. Die Antwort steht seit drei Wochen aus.','Der Pfarrer segnet dieses Jahr auch die Erntemaschinen. Die von {gegner} gleich zweimal.','{nachbar} schwört, im Weinberg einen Fuchs mit Sonnenbrille gesehen zu haben. Der Wirt schwört, dass es nach dem dritten Schoppen war.','Die Ortsdurchfahrt wird gesperrt, weil die Winzer ein Fass über die Straße rollen. Es ist leer, sie üben nur.','{gegner} soll sich einen Hut gekauft haben, „für den Festsaal“. Im Dorf wird schon gewettet, wann {er} ihn das erste Mal trägt.','Die Kinder der Grundschule haben Trauben gelesen und den Saft selbst gepresst. Er war besser als manche Spätlese im Ort.','{nachbar} hat den Zaun zu {gut} neu gestrichen. Nur auf der eigenen Seite.',
    '{nachbar} hat beim Kellerfest den Korkenzieher verloren. Gefunden wurde er im Hut des Bürgermeisters.','Die Feuerwehr übt dieses Jahr mit Traubensaft. Wasser sei zu langweilig, sagt der Kommandant.',
    'Im Dorf wird erzählt, {gegner} lasse die Fässer nachts von einer Katze bewachen.','Der Gesangverein probt jetzt im Gewölbekeller. Die Akustik ist gut, der Heimweg weniger.',
    '{nachbar} hat sich eine Wetterstation gekauft. Seitdem weiß das ganze Dorf als Erstes, wann es regnet.','Am Stammtisch wird gestritten, wer die älteste Rebe im Ort hat. Die Rebe selbst schweigt.',
    'Die Kirchturmuhr geht seit der Lese zehn Minuten vor. Keiner hat Zeit, sie zu stellen.','{gegner} wurde beim Bäcker gesehen, wie {er} heimlich die Öchsle eines Rosinenbrötchens gemessen hat.',
    'Der Bürgermeister hat eine Rede über den Weinbau gehalten und dabei dreimal Riesling und Silvaner verwechselt.','Im Weinberg von {nachbar} steht eine neue Vogelscheuche. Die Stare sitzen am liebsten auf ihrem Hut.',
    'Auf dem Wochenmarkt gibt es jetzt Traubenkernöl. Der Verkäufer verspricht, es helfe gegen alles außer Hagel.','Der Dorfpolizist hat einen Traktor geblitzt. Ein neuer Rekord, sagt der Fahrer stolz.']},
  l:{h:'✉️ Leserbrief',t:['„Früher hatte der Wein noch Öchsle! Heute schmeckt alles nach Marketing.“|Ein Rentner {wo}','„Warum hält der Federweiße nur drei Monate? Ich trinke ihn das ganze Jahr.“|Ein Leser, der das ganze Jahr trinkt','„Mein Mann sitzt seit drei Wochen im Keller und misst. Kann mir jemand sagen, wann er wiederkommt?“|Eine besorgte Ehefrau','„Der Winzerbote schreibt zu wenig übers Wetter.“|Ein Leser, der das Wetter mag','„Sehr geehrte Redaktion, auch Müller-Thurgau hat Gefühle.“|Freundeskreis Müller-Thurgau','„Ich habe meine Lese um einen Tag verschoben und alles richtig gemacht. Das wollte ich nur mal sagen.“|Ein zufriedener Winzer','„Wer hat in der Nacht meine Erntekisten umgestapelt? Sie stehen jetzt schöner da, aber trotzdem.“|Ein Winzer {wo}','„Bitte mehr Kreuzworträtsel.“|Eine Leserin','„Eiswein ist doch einfach nur kalter Wein. Ich verstehe die Aufregung nicht.“|Ein Gast aus der Stadt','„Mein Opa sagt, früher war der Winter kälter. Mein Opa sagt das über alles.“|Ein Enkel',
    '„Warum heißt er Federweißer, wenn er doch trüb ist?“|Ein Leser, der es genau wissen will','„Mein Nachbar sagt, Sekt ist nur Wein mit Schluckauf. Stimmt das?“|Eine Leserin {wo}',
    '„Seit vierzig Jahren lese ich den Winzerboten. Früher war er dicker.“|Ein treuer Abonnent','„Könnte der Wetterdienst bitte einmal recht haben, wenn es darauf ankommt?“|Ein Winzer mit nassen Füßen',
    '„Ich habe eine Trockenbeerenauslese probiert. Jetzt schmeckt mir kein Tafelwein mehr. Wer zahlt mir das?“|Ein verwöhnter Gaumen','„Meine Katze schläft nur noch im Weinkeller. Ist das normal?“|Eine Leserin {wo}',
    '„Warum steht im Wetterkasten nie, wann meine Schwiegermutter kommt?“|Ein Leser mit Sorgen','„Die Rätselecke ist zu leicht. Das Lösungswort war schon wieder Riesling.“|Ein Rätselfreund',
    '„Wer seine Reben nicht düngt, braucht sich über nichts zu wundern. Das musste mal gesagt werden.“|Ein alter Winzer {wo}','„Mein Enkel will Winzer werden. Den Kellerschlüssel kriegt er trotzdem noch nicht.“|Ein Großvater {wo}',
    '„Ich möchte mich beim Hagel entschuldigen. Ich habe ihn im Sommer herbeigewünscht, als es so heiß war.“|Ein reuiger Leser','„Muss der Winzerbote jeden Monat erscheinen? Ich komme mit dem Lesen nicht hinterher.“|Ein gemütlicher Leser']},
  s:{h:'💬 Spruch des Monats',t:['„Im Wein liegt die Wahrheit, im Keller die Arbeit.“','„Gute Trauben warten nicht, gute Winzer schon.“','„Ein Jahr ohne Frost ist wie ein Fass ohne Boden: zu schön, um wahr zu sein.“','„Wer im Herbst jammert, hat im Frühling geschlafen.“','„Erst messen, dann lesen, dann prahlen.“','„Der beste Dünger ist der Schatten des Winzers.“','„Geduld ist das teuerste Gewürz im Keller.“','„Ein guter Jahrgang hat viele Väter, ein schlechter nur das Wetter.“','„Wer jeden Monat verkauft, muss nie alles auf einmal verkaufen.“','„Die Rebe kennt keinen Feierabend, der Winzer auch nicht.“','„Lieber eine Spätlese in der Hand als eine Beerenauslese am Stock.“','„Öchsle zählt man im Herbst, Freunde im Winter.“',
    '„Der Keller vergisst nichts, der Winzer manchmal.“','„Wer den Boden pflegt, erntet mehr als Trauben.“','„Ein Fass ist nie zu groß, nur der Jahrgang zu klein.“',
    '„Im Juni zählt man Blüten, im Oktober Sorgen.“','„Frost im Dezember ist ein Geschenk, Frost im Mai eine Rechnung.“','„Der Weinberg gehört dem Großvater, die Arbeit dem Enkel.“',
    '„Wer alles auf einmal liest, hat hinterher nichts zu erzählen.“','„Guter Wein braucht Sonne, Geduld und einen trockenen Keller.“','„Ein Korken hält den Wein, ein Versprechen die Familie.“',
    '„Das Wetter macht den Jahrgang, der Winzer den Wein.“','„Reich wird man im Keller, nicht am Marktstand.“','„Die Rebe wächst langsam, der gute Ruf noch langsamer.“']}
};
// Baut die Ausgabe aus TOP, FUSS und den Zeilen für "Kurz gemeldet".
// Version 9.0.1: Eiswein in der Zeitung, nur im Dezember (Maik 18.11.2026). Mit eigenem Eiswein (gefrorene Trauben am Stock) kommt immer die Meldung mit dem Bild eiswein,
// der Steuer-Tipp steht dann ohne Foto daneben. Sonst würfelt eisGeschichte(): In einem Jahr nach einer Geschichte nie (S.eisZ), sonst mit EIS_Z.
// Das ergibt rund jedes dritte Jahr. Davon ist mit EIS_PLEITE der geplatzte Poker eines Gegners (Bild frost, rund alle 6 bis 7 Jahre), sonst Eiswein bei einem Gegner,
// zuerst bei einem, dessen Poker in gegnerMonat aufging (g.eisJ), dann bei einem in einem kühlen Gebiet, sonst ohne Namen aus einem kühlen Gebiet.
// Seit 13.4.7 ist EIS_KUEHL weg, die Gebiete mit Frost kommen aus dem Wagnis des Jahres (wegChance).
const EIS_Z=.5, EIS_PLEITE=.45;
const EIS_TEXT={
  // Je Fall drei Fassungen im Wechsel (Maik 18.11.2026: "Alle als Abwechslung").
  eigen:[['Frost! Eiswein ist möglich','Die Trauben hängen gefroren am Stock. Wer jetzt liest, kann Eiswein keltern.'],
    ['Klirrende Nacht über deinem Weinberg','Deine Trauben sind am Stock gefroren. Wer jetzt liest, keltert das flüssige Gold des Winters.'],
    ['Dein Eiswein-Poker geht auf','Die Kälte ist da und deine Trauben hängen gefroren am Stock. Jetzt schnell lesen, bevor es taut.']],
  gegner:[['Eiswein-Glück für {n}','Bei klirrender Kälte hat {n} {wo} in der Nacht gefrorene Trauben gelesen. Der Eiswein dürfte ein kleines Vermögen bringen.'],
    ['Nachtlese bei {n}','Mit Stirnlampen und klammen Fingern wurden bei {n} {wo} gefrorene Trauben gelesen. Wer den Mut hat, hängen zu lassen, wird belohnt.'],
    ['{n} lacht über die Kälte','Während andere längst gelesen hatten, hingen bei {n} {wo} noch Trauben. Jetzt sind sie gefroren, und aus ihnen wird Eiswein.']],
  gebiet:[['Eiswein-Nacht {wo}','Bei klirrender Kälte waren die Winzer {wo} nachts im Weinberg. Wer seine Trauben hängen ließ, keltert jetzt Eiswein.'],
    ['Frost bringt Gold {wo}','Einige mutige Winzer {wo} haben auf Frost gesetzt und gewonnen. Ihr Eiswein ist schon vor der Lese verkauft.'],
    ['Gefrorene Trauben {wo}','Über Nacht ist es {wo} bitterkalt geworden. Für ein paar Winzer wird daraus der Wein ihres Lebens.']],
  pleite:[['Eiswein-Poker geplatzt','{n} {wo} hat die Trauben für Eiswein hängen lassen, doch der Frost kam nicht. Jetzt faulen sie am Stock.'],
    ['Kein Frost für {n}','Wochenlang hat {n} {wo} auf eine klirrende Nacht gewartet. Statt Eiswein gibt es matschige Trauben und lange Gesichter.'],
    ['Pech im Weinberg von {n}','Der Winter blieb {wo} zu mild. Was {n} für Eiswein hängen ließ, ist verdorben.']]
};
// Version 7.7: Je Partie ein Eintrag (S.bestenD), der bei jedem Aufstieg erneuert wird, höchstens 10. Sortiert nach Rang, dann Zeit vom Spielstart bis zum Aufstieg
// (schneller vorn), dann Spielstufe (schwerer vorn), bei völligem Gleichstand der ältere Eintrag vorn. Kein Ansehen mehr. Alte Einträge ohne Monate zählen mit ihren Jahren.
// Gibt deinen Platz zurück, 0 wenn du nicht unter den zehn bist.
const STUFE_WERT={einfach:0,mittel:1,schwer:2}, ENDE_WERT={gut:1,best:2,pleite:-1}, ENDE_NAME={gut:'🏁 gutes Ende',best:'🌍 bestes Ende',pleite:'💸 pleite'};
const BESTEN_I='Jede Partie kommt hier hinein, sobald du das erste Mal aufsteigst, und rückt bei jedem Aufstieg nach. Erst zählt der Rang, dann das Ende (das beste vor dem guten), dann die Zeit bis zum Rang, dann die Spielstufe.';
// Seit 10.3: Der Amtsantritt ist nicht mehr der Sieg. Der Ausblick nennt Wahl, Weltweinschau und die zwei Enden (A17).
const AMT_AUSBLICK='Zu Ende ist die Partie damit nicht, jetzt beginnt das Amt: In fünf Jahren wird gewählt, mit zwei Schlüsseln holst du die Weltweinschau ins Dorf, und am Schluss steht die letzte Übergabe mit der Chronik. Dort entscheidet sich, ob es das gute oder das beste Ende wird. Alles dazu steht im Rathaus im Fenster „Weinbauverband“.';
const SIEG_SPRUCH={vorsicht:'„Immer schön langsam, dann wird das schon“, sagt sie beim Anstoßen.',qualitaet:'„Qualität setzt sich eben durch“, sagt er und meint vor allem sich selbst.',zocker:'„Alles auf eine Karte, und die Karte hat gestochen“, grinst er in die Kameras.'};
/* ================= Aufgaben-Liste ================= */
// Grenzwerte seit 7.9: Düngen ist Rot ab 50 % Boden. "Konto gefährlich niedrig" heißt: weniger als die festen Kosten von zwei Monaten.
const DUENG_ROT=50;
/* ================= Ansichten ================= */
// Seit 7.9 im Fenster-Format: Jedes Fenster hat Überschrift und i. Im Fenster steht nur die Auswahl, alles zum Nachlesen steht im i.
// Seit 12.3.5 (Maik 20.11.2026): Der Name des Weinguts ist zugleich der Familienname auf Tafel und Holzbogen, höchstens NAME_MAX Zeichen, damit er groß bleibt. Alte Spielstände behalten längere Namen, die schrumpfen auf der Tafel.
const NAME_MAX=14;
// Version 8.0.1 "Dein Stand": Rangleiter mit Kurztexten (Maik 17.11.2026, ohne Manager-Stufen, die stehen im Arbeitsamt).
// Steht im Fenster "Dein Stand" (Tipp aufs Geld) und im Rang-Fenster unter Aktuelles. Erreichte Ränge mit Haken, der aktuelle mit Pfeil,
// die kommenden ausgegraut mit Schloss und rechts dem, was sie freischalten.
const LEITER=['','Geschenkter Hang, Qualitätswein, Auktionen','Kabinett, Düngerstreuer','Spätlese, Landesprämierung, Erntemaschine','Sekt, Sektkeller, Weinfest','Spitzen-Sorte, Südhang, Vollernter','Bundeswettbewerb, Weinhandlung','Auslese, Wagnis im Herbst, Hoffest','Trockenbeerenauslese, fremder Weg','der Stuhl im Festsaal'];
const RANGL_I='Vorn steht der höchste Rang, bei gleichem Rang entscheidet das Ansehen. Was die anderen treiben, steht im Winzerboten.';
const SPRUNG_MAX=12;
/* ---- Infoseite: erscheint nach jedem Monatswechsel als Vollbild, die Zeitung "Der Winzerbote" vor dem Bild der Jahreszeit. Kopfleiste und Reiter fehlen, "Weiter" blendet aus und führt zu Aktuelles ---- */
const PHASE=['Winterruhe','Winterruhe','Austrieb','Austrieb','Blüte','Fruchtansatz'];
// Version 7.7: Zehn Szenen, 0 der Spielstart, 1 bis 8 der Aufstieg zu RAENGE[i], 9 der Sieg. bild ist das Standbild, video der Name für 8.1 (bilder/<video>.mp4).
// Bewegung: p0 und p1 schieben den Bildausschnitt (am Handy im Hochformat gut zu sehen), o ist der Brennpunkt, auf den bis s gezoomt wird.
const SZENEN=[
  // Seit 10.2.1: Die Anzeige zeigt den verwitterten Hof 1 im Sommer, so wie man ihn kauft (Maik 19.11.2026).
  {bild:'weingut-01-sommer',ort:'📰 Wie alles anfing',                   p0:'45% 50%',p1:'55% 50%',o:'50% 45%',s:1.18},
  {bild:'szene-1',    ort:'🎉 Feier vor der Scheune',              p0:'40% 50%',p1:'52% 50%',o:'50% 65%',s:1.18},
  {bild:'szene-2',    ort:'🎉 Feier im Gewölbekeller',             p0:'60% 50%',p1:'48% 50%',o:'52% 62%',s:1.2},
  {bild:'szene-3',    ort:'🎉 Feier im Weinberg',                  p0:'45% 50%',p1:'55% 50%',o:'50% 60%',s:1.2},
  {bild:'ehrung-hof', ort:'🎉 Feier im eigenen Hof',               p0:'58% 50%',p1:'42% 50%',o:'45% 62%',s:1.18},
  {bild:'szene-5',    ort:'🎉 Feier vor dem Gutshaus',             p0:'42% 50%',p1:'52% 50%',o:'50% 75%',s:1.2},
  {bild:'ehrung-saal',ort:'🎉 Ehrung im Festsaal des Verbands',    p0:'50% 70%',p1:'50% 40%',o:'50% 55%',s:1.24},
  {bild:'szene-7',    ort:'🎉 Hoffest im Garten',                  p0:'40% 50%',p1:'58% 50%',o:'50% 70%',s:1.18},
  {bild:'sieg',       ort:'🎉 Im Festsaal, neben dem großen Stuhl',p0:'50% 40%',p1:'50% 60%',o:'50% 72%',s:1.26},
  {bild:'szene-sieg', ort:'👑 Auf der besten Lage',                p0:'28% 50%',p1:'72% 50%',o:'62% 72%',s:1.16}
].map((x,k)=>({...x,video:k===0?'szene-start':k===9?'szene-sieg':'szene-'+k}));
// Für 8.1: Hier stehen die Videos, die es schon gibt (wie VIDEOS in sw.js). Solange leer, zeigt die Bühne das bewegte Standbild.
const SZENE_VIDEO=[];
// Kapitel der Geschichte je Szene (von Maik abgenommen am 17.11.2026). 0 ist die Geschichte vom Anfang (GESCHICHTE).
const KAPITEL=[null,
  ['Der neue Jahrgang liegt im Fass, und auf der Bank vor der Scheune stehen zwei Gläser.','Eins für dich, eins für den alten Winzer von nebenan, der seit dem ersten Tag über den Zaun schaut.','Er probiert, schweigt lange und sagt dann nur: „Hab ich doch gleich gesagt, aus dir wird was.“'],
  ['Im Gewölbekeller wird das erste Fass Qualitätswein angestochen, und die ersten Erntehelfer stoßen mit an.','Die Ratte sitzt oben auf dem Fass, als hätte sie es selbst gefüllt, und bekommt heute ihren Namen: Frau Öchsle.','Ab jetzt gibt es jeden Abend ein Stück Käse, dafür bewacht sie das Korkenlager.'],
  ['Eine Urkunde mit Goldrand, und ab jetzt darfst du bei der Landesprämierung antreten.','Am Stammtisch nimmt keiner mehr Wetten gegen dich an.','Der Bürgermeister kommt persönlich vorbei und trinkt das letzte Glas vom ersten Kabinett aus.'],
  ['Das halbe Dorf feiert in deinem Hof, die Blaskapelle spielt schief, aber laut.','Um Mitternacht knallt der erste Sektkorken, und Frau Öchsle flüchtet empört hinters Rüttelpult.','Der Sekt ist noch vom Bürgermeister, der nächste kommt aus deinem eigenen Keller.'],
  ['Aus dem kleinen Hof ist ein Gut geworden, mit Freitreppe, Wappen und einem Vollernter, so groß wie die alte Scheune.','Jetzt fehlt nur noch ein Stück steiler Südhang, denn nur dort wächst die Spitzen-Sorte.','Abends bringst du Frau Öchsle trotzdem selbst ihren Käse.'],
  ['Zum ersten Mal sitzt du im Festsaal des Weinbauverbands, der Präsident steckt dir die goldene Traubennadel an.','Ganz vorn steht der große Stuhl, an den du seit der Anzeige denkst.','Noch sitzt ein anderer darauf.'],
  ['Dein erstes Hoffest, Lampions in den Bäumen, der ganze Verband an deiner Tafel.','Die Winzer von nebenan, die auf deinen ersten Fehler gewartet haben, warten jetzt auf eine Einladung.','Du hast allen eine geschickt.','Fast allen.'],
  ['Im Festsaal sitzt du jetzt direkt neben dem großen Stuhl, das rote Kissen darauf ist frisch aufgeschüttelt.','Der Präsident flüstert dir zu: „Mein Stuhl ist bequem. Lass dir ruhig noch etwas Zeit.“'],
  null];
// 7.8: Wer die Anzeige gelesen hat, je Generation. Neutral, weil das Spiel das Geschlecht der ersten Generation nicht kennt.
const VORFAHREN=['Deine Eltern','Deine Großeltern','Deine Urgroßeltern','Deine Vorfahren'];
// Seit 10.6 nennt die Feier alles, was mit dem Rang auftaucht (gesperrte Fenster sind unsichtbar), dazu Makler, Spenden und Weinfest.
const FREI_SYM=[[/Erntehelfer|Lagerarbeiter/,'🧑‍🌾'],[/Makler/,'🤝'],[/Spenden/,'💝'],[/Manager|Stufe/,'👔'],[/Rebsorte/,'🍇'],[/Auktion/,'🔨'],[/Sekt/,'🍾'],[/Export/,'🚢'],[/Keller/i,'🛢️'],[/prämierung|wettbewerb/i,'🏅'],[/ernte|vollernter/i,'🚜'],
  [/Weinhandlung/,'🏪'],[/botschafter/i,'🎗️'],[/Hoffest|Weinfest/,'🎉'],[/Kontrolle/,'🔍'],[/Spitzenlage/,'⛰️'],[/Sieg/,'👑']];
// Version 9.0: Aufstiegs-Szene (FSTUFE -1) vor der Bild-Bühne. Erst das Sommerbild der alten Stufe mit dem alten Rang, dann wechselt der Titel
// und das Sommerbild der neuen Stufe blendet über, egal welcher Monat ist (Sommer-Regel, Maik 18.11.2026). Ein Tipp zeigt gleich das Ende.
const WACHS_WECHSEL=2600, WACHS_WENDE=3900;   const WF_POS={
  einladung:'--p0:44% 50%;--p1:56% 50%;--o:50% 62%;--s:1.16', weltweinschau:'--p0:20% 50%;--p1:75% 50%;--o:50% 22%;--s:1.06',
  'weltweinschau-sieg':'--p0:50% 35%;--p1:50% 60%;--o:50% 62%;--s:1.2', ehrenplatz:'--p0:44% 50%;--p1:50% 50%;--o:50% 25%;--s:1.03',
  'flasche-regal-zwei':'--p0:50% 40%;--p1:49% 55%;--o:49% 55%;--s:1.08', 'flasche-kueche-zwei':'--p0:46% 50%;--p1:51% 50%;--o:51% 65%;--s:1.06',
  'flasche-kueche-leer':'--p0:46% 50%;--p1:51% 50%;--o:51% 65%;--s:1.06'};
// Version 4.1: Steckbrief eines Gebiets. Alle Zahlen kommen aus REGIONEN, EIGNUNG und den Hürden, damit die Karte nach dem Abstimmen von selbst stimmt.
// Spätfrost zur Blüte: April 10 %, Mai 3 % (wuerfelWetter), also in rund jedem achten Jahr, überall gleich.
const SPAET_JAHR=8;
const BUCH_ORT={berg:'berg',betrieb:'betrieb',aktuell:'aktuell',maschinen:'maschinen',buero:'buero',buch:'buch',sabotage:'hintertuer',start:'keller',lager:'lager',amt:'rathaus',handel:'handel',laeden:'weinhandel',bank:'bank',arbeit:'arbeit'};
// Daueraufträge für den Verkauf (seit 4.4, seit 7.0 beim Handels-Manager: Weinhandlungen ab Stufe 1, Großhandel ab Stufe 2).
// Sie laufen beim Weiterblättern vor dem Monatswechsel: erst die Weinhandlungen (sie zahlen mehr), dann der Großhandel bis zum Budget, nie unter dem vollen Preis.
// Was am ehesten verdirbt, geht zuerst. Je Wein bleiben S.dauer.reserve Flaschen liegen, außer er hält nur noch zwei Monate. Bericht über S.dauerLog im Winzerboten.
const DAUER_RESERVE=[0,100,500,1000];
// Seit 7.5: Logbuch je Manager in S.manager[b].log=[{z,t}], ein Eintrag je Monat (z=Jahr*12+Monat), die letzten MGR_LOG Monate mit Arbeit.
// Alte Spielstände starten mit leerem Logbuch. Es steht im i des Manager-Fensters im Betrieb.
const MGR_LOG=6;
// Schritt E: Handels-Manager Stufe 3. Regal füllen (MGR_REGAL Monate Vorrat, nur Wein mit mindestens MGR_REGAL_HALT Monaten Haltbarkeit,
// je Wein bleibt die Reserve der Daueraufträge, was kurz vorm Verderben im Regal steht, nimmt er für den Dauerauftrag heraus),
// den besten zugelassenen Wein zum Wettbewerb einreichen (wie die Liste in AKT.wettbewerb sortiert), das Fest bei Sonne oder spätestens im August ausrichten.
const MGR_REGAL=2, MGR_REGAL_HALT=6;
/* ================= Fenster-Baustein (Version 7.4 "Übersicht") ================= */
// Jedes Fenster an jedem Ort ist gleich gebaut: oben die Überschrift in Schrift und Farbe des Hauptreiters, rechts daneben das kleine graue i,
// darunter Hinweise der Manager, Zustand und Zeilen, die Knöpfe immer unten rechts.
// id: Kennung fürs i. titel: Überschrift. inhalt: fertiges HTML oder eine Liste von Zeilen aus fz(), die Liste bekommt Trennlinien.
// o.i: Erklärtext hinter dem i. Er ist immer zugeklappt, egal bei welchem Rang, offen bleibt er nur bis zum Ortswechsel (FI_AUF).
//      Warnungen und rote Zeilen gehören nie ins i, sie stehen im Fenster.
// o.buch: Kapitel für "Mehr im Buch" (ohne Angabe das Kapitel des Ortes, false = kein Link).
// o.hin: Hinweise an der Aufgabe, immer sichtbar ("Dein Kellermeister keltert beim Weiterblättern"). o.stand: graue Zeile zum Zustand.
// o.leer: graue Zeile, wenn die Liste leer ist. o.kn: Knopf oder Knöpfe unten rechts, o.links: kurzer grauer Text links daneben.
// o.zu: Das Fenster ist gesperrt, der Text nennt den Rang. Seit 10.6 (Maik 20.11.2026) ist es dann ganz weg und taucht erst mit dem Rang auf,
//      bis 10.5 stand es zugeklappt mit Schloss ganz unten am Ort. Was schon freigespielt ist, aber gerade nicht geht, bleibt sichtbar und sagt warum.
// o.kl: zusätzliche Klasse am Fenster (golden im Monat des Aufstiegs).
// o.iWort und o.iAkt: ein graues Wort statt des i mit eigener Aktion (Kellerbuch: "Weinkompendium").
const FI_AUF=new Set();
// Büro als Pokalraum (seit 7.4 auf dem Fenster-Baustein), seit 11.2 in vier Bereichen (siehe vBuero).
const MED_NAME={'🌍':'Weltweinschau','🏆':'Bundessieg','🥇':'Gold','🥈':'Silber','🥉':'Bronze'};
// Seit 11.2 (Maik 19.11.2026): vier Bereiche statt einer langen Liste. Oben im Büro stehen vier Kacheln, darunter nur die Fenster des gewählten Bereichs.
// BUERO hält die Wahl, bis das Spiel neu geladen wird. BUERO_WO sagt je Fenster, in welchem Bereich es steht (für "Zeig mir, wo" im Spielführer).
// Reihenfolge je Bereich: Erfolge (Rang mit Platz, Ehrungen mit Siegeln, Weinbotschafter, Urkunden mit Spenden), Wissen (Anleitung, Kompendium, Spielführer),
// Familie (Mein Weingut, Chronik, Bestenliste), Einstellungen (Ton, Dein Spiel, Deine Idee). Das Fenster "Deine Namen" steht in jedem Bereich oben, bis es erledigt ist.
const BUERO_B=[['erfolge','🏆','Erfolge'],['wissen','📖','Wissen'],['familie','👪','Familie'],['einst','⚙️','Einstellungen']];
const BUERO_WO={rangliste:'erfolge',ehrungen:'erfolge',ruf:'erfolge',botschafter:'erfolge',urkunden:'erfolge',anleitung:'wissen',komp:'wissen',fuehrer:'wissen',meingut:'familie',chronik:'familie',besten:'familie',ton:'einst',spiel:'einst',idee:'einst'};
const BSORT_F={dringend:(a,b)=>lotRest(a)-lotRest(b)||a.jahrgang-b.jahrgang};
// Seit 11.8 (Maik 20.11.2026): Der Unterreiter heißt Weinarchiv und hat drei Kacheln wie das Büro (W1): Deine Weine, Siegelbrett, Lexikon.
// ARCHIV hält die Wahl, bis das Spiel neu geladen wird. Die Kennung buch des Unterreiters bleibt.
const ARCHIV_B=[['weine','🍷','Deine Weine'],['brett','🏅','Siegelbrett'],['lexikon','📚','Lexikon']];
// Version 9.0: Beim Jahreszeiten-Wechsel rollt der Winzerbote nur einen schmalen Streifen herunter (Z_TEIL, Maik 18.11.2026), damit das neue Bild zu sehen bleibt.
// Den Rest holt ein Tipp oder Wischen irgendwo auf der Seite (Maik 18.11.2026). Der Knopf "Weiter" geht trotzdem sofort.
const Z_TEIL=.12;
/* ================= Spielführer (Version 8.1, Paket A und B) ================= */
// Sprechblase mit Gesicht nach Entwurf D (Maik 17.11.2026). Die Texte stehen in fuehrer.js, gebaut aus "_fuehrer entwurf.md".
// Merker im Spielstand S.fu: an = Spielführer ein, nur = nur Neuheiten und Warnungen, ges = schon gezeigte Blasen (jede genau einmal je Spiel),
// q = Warteschlange, mon = Monat der letzten gebremsten Blase, geld = "Dein Stand" schon angetippt,
// rm = Spielmonat je erreichtem Rang (für die Neuheiten), km = Monat des letzten Kniffs, w3 = Monat, in dem der Markt satt wurde.
// Ablauf: fuehrerPruef() legt jede Blase in die Warteschlange, sobald ihr Auslöser (FU_WANN) zutrifft, fuehrerZeig() zeigt die erste,
// sobald ein Ort zu sehen ist (nie über Winzerbote, Feier, Dialog oder Buch). "Verstanden" und "Zeig mir, wo" haken sie ab.
// Paket A: Einstieg, erstes und zweites Jahr, k01. Paket B: Rang-Neuheiten, Warnungen, Kniffe, Schalter im Büro und beim Start.
const FU_SPRECHER={winzer:{name:'Der alte Winzer',rolle:'Dein Nachbar',bild:'fuehrer-winzer'},handel:{name:'Die Handels-Managerin',rolle:'Verkauf und Zahlen',bild:'manager-handel'},
  keller:{name:'Der Kellermeister',rolle:'Fass und Flasche',bild:'manager-keller'},weingut:{name:'Der Weingut-Manager',rolle:'Reben und Maschinen',bild:'manager-weingut'},
  // Seit 10.3: Tipp ohne Gesicht, falls nach der ersten Übergabe noch kein Manager da ist.
  gut:{name:'Dein Weingut',rolle:'Notiz aus dem Büro',bild:''}};
// Vorstellung je Manager. Vorher spricht der alte Winzer mit dem Ersatz-Text.
// Seit 10.3 (Maik 19.11.2026): Nach der ersten Übergabe spricht der alte Winzer nicht mehr (fuSprecher), er verabschiedet sich mit g2-1.
const FU_VOR={handel:'r4-1',keller:'r5-1',weingut:'r6-1'};
// Reihenfolge, wenn mehrere warten: Warnung, dann Einstieg und Erstes Mal, dann Rang, dann Kniff.
const FU_ART={warnung:0,einstieg:1,erstes:1,rang:2,kniff:3};
// Ab so vielen Zeichen gilt ein Tipp als lang, dann wird das Spiel dahinter abgedunkelt.
const FU_LANG=380;
// Monats-Blasen: Spielmonat (0 = erster Januar) je Blase.
// Seit 12.6 (Prüfliste Einstieg): Wetter (e1-08) und Düngen (e1-09) im zweiten Jahr, Fassraum (e1-10) im Juli gleich nach e1-11.
// Alte Spielstände ohne S.ein behalten die alten Monate (FU_MON_ALT).
const FU_MON={'e1-07':2,'e1-11':6,'e1-10':6,'e1-08':15,'e1-09':16,'e1-12':7,'e1-17':8,'e1-18':10,
  'z2-01':12,'z2-02':13,'z2-03':14,'z2-04':15,'z2-06':18,'z2-07':21,'z2-08':23};
const FU_MON_ALT={'e1-08':3,'e1-09':4,'e1-10':5};
const FU_WANN={
  // Seit 10.2.1: Erst stellt sich der alte Winzer vor (e1-0a), dann erklärt er den Kopf (e1-0b), dann geht es los (Maik 19.11.2026).
  'e1-0a':()=>monatNr()===0,
  // Seit 10.3 (Frage 11): e1-0b steckt in e1-0a.
  'e1-01':()=>monatNr()===0&&fuGes('e1-0a'),
  // Seit 12.6: Bei neuen Partien erst, wenn im Arbeitsamt Erntehelfer oder Lagerarbeiter zu sehen sind.
  // Seit 12.8 (Maik 21.11.2026): erst bei echtem Bedarf (fuLeuteBedarf), das Fenster geht weiter mit dem Jungwinzer auf.
  'e1-02':()=>TAB==='stadt'&&SUB==='arbeit'&&(!S.ein||(einFrei('helfer')||einFrei('lagerarb'))&&fuLeuteBedarf()),
  'e1-03':()=>TAB==='gut'&&SUB==='berg',
  'e1-04':()=>monatNr()===0&&rebenGesamt()>0,
  // Seit 10.2.1: e1-05 erst, wenn wirklich ein roter oder gelber Punkt an einem Reiter leuchtet (Maik 19.11.2026), e1-06 hängt nicht mehr an e1-05.
  // Seit 12.6: e1-05 fest im Februar, e1-06 beim ersten Tipp aufs Geld oder sobald zum ersten Mal Geld reinkommt (S.fu.ein1). Alte Spielstände wie vorher.
  'e1-05':()=>monatNr()>=1&&(!!S.ein||Object.keys(badges()).length>0),
  'e1-06':()=>S.ein?!!S.fu.geld||!!S.fu.ein1:monatNr()<12&&(!!S.fu.geld||monatNr()>=1),
  'e1-13':()=>S.lots.some(l=>l.status==='trauben'),
  'e1-14':()=>S.lots.some(l=>l.status==='fass'&&!l.stufe&&l.fassMonate>=1),
  'e1-15':()=>S.lots.some(l=>l.status==='fass'&&l.stufe),
  'e1-16':()=>S.lots.some(l=>l.status==='flasche'&&preis(l)>0),
  // Seit 12.6: Ruhe bis zur Lese im April des ersten Jahres (e1-19), gleich danach k01. Alte Spielstände: k01 im zweiten Jahr nach z2-01.
  'e1-19':()=>!!S.ein&&monatNr()===3,
  'k01':()=>S.ein?monatNr()>=3&&monatNr()<24&&fuGes('e1-19'):monatNr()>=12&&monatNr()<24&&fuGes('z2-01')
};
for(const id in FU_MON) FU_WANN[id]=()=>monatNr()===fuMon(id);
FU_WANN['e1-10']=()=>monatNr()===fuMon('e1-10')&&(!S.ein||fuMenge()>S.fassraum-fassBelegt());
// Seit 13.4.6 aus: e1-17 und e1-18 erklären die alte Edelfäulnis und den alten Eiswein, das Wagnis erklärt jetzt h1. Neue Texte in 14.4.
FU_WANN['e1-17']=()=>false&&monatNr()===8&&(!S.ein||feldHaengt().length>0);
FU_WANN['e1-18']=()=>false&&monatNr()===10&&(!S.ein||feldHaengt().some(id=>S.felder[id].edel));
// Seit 10.3 (C15, C16): Pflanz-Blasen nur, wenn noch Boden frei ist. z2-05 kommt, sobald zum ersten Mal ein Wein zu einer Weinhandlung passt.
FU_WANN['e1-07']=()=>monatNr()===2&&rebenGesamt()<S.ha*HA_REBEN;
FU_WANN['z2-02']=()=>monatNr()===13&&rebenGesamt()<S.ha*HA_REBEN;
FU_WANN['z2-05']=()=>monatNr()>=12&&Object.keys(S.laeden||{}).some(r=>S.laeden[r].rest>0&&S.lots.some(l=>ladenPasst(l,r)));
// Seit 10.3 (C31): Die Maschinen-Blase rückt auf den zweiten Platz, damit sie ins Kauf-Fenster (Januar bis März) fällt.
// Seit 12.8 (Maik 21.11.2026): nur noch, wenn sie dadurch in Januar bis März fällt und auf ihrem normalen Platz nicht (Feier im Januar: Februar statt April).
// Seit 10.3 (C32): Blasen zum Befördern warten, bis der Manager eingestellt ist.
const FU_MASCH_VOR={'r4-4':1,'r5-4':1,'r6-3':1}, FU_BEFOERD={'r6-4':1,'r7-3':1,'r8-3':1,'r9-2':1,'r10-2':1,'r10-3':1};
// Warnungen (Paket B): jede nur beim ersten Mal, danach reichen die Punkte. Gesperrte Manager lässt fuSprecher den alten Winzer vertreten.
// w1: ein Fass, das ab Januar Kabinett wird, und du stehst im Rathaus. w2: Auktion läuft, und nach dem nächsten Gebot reicht das Geld nicht für die Reben.
// Seit 10.3 (C35): nicht nur Kabinett, auch jede höhere Stufe, der nur noch der Januar fehlt.
const FU_PRAED=['kab','spat','aus','ba','tba'];
// Seit 12.8: Blasen, die nicht mehr kommen, weil ihr Inhalt schon erledigt ist, stehen nur im Verlauf.
const FU_STILL={
  'r6-5':()=>fuR65Zeit()&&!!S.sektAnlage,
  'm5':()=>S.fu.h0>0
};
// Kniffe (Paket B): ab dem dritten Jahr frühestens fünf Monate nach dem letzten, der erste freie in der Reihenfolge des Entwurfs.
// Kniffe eines Managers, der sich noch nicht vorgestellt hat, sagt der alte Winzer mit dem Ersatz-Text (Maik 17.11.2026, Plan B). Ohne Ersatz-Text warten sie weiter. k01 steht oben im zweiten Jahr.
const FU_KNIFF_ABSTAND=5, FU_KNIFF_AB=24;
// Seit 10.3 (C29): k12 steht vorn, k02 nur im ersten Dezember mit Steuer, k11 nur mit der Ankündigung. k07 braucht eine laufende Aufgabe, sonst fehlt die Reserve im Fenster (C26).
const FU_KNIFF={
  'k12':()=>S.monat>=7&&S.monat<=10&&feldHaengt().length>0,
  'k02':()=>S.monat===11&&steuerSchau().steuer>0,
  'k03':()=>true,
  'k04':()=>S.monat>=7&&S.monat<=9&&R().sorten.filter(id=>S.felder[id].reben>0).length>=2,
  'k05':()=>true,
  'k06':()=>(S.monat===5||S.monat===6)&&S.maschinen.some(m=>MASCH[m.typ]&&MASCH[m.typ].ernte),
  'k07':()=>mgrSt('handel')>=1&&(aufgabeAktiv('laeden')||aufgabeAktiv('handel')||aufgabeAktiv('regal')),
  'k08':()=>true,
  'k09':()=>true,
  'k10':()=>S.rang>=1,
  'k11':()=>fuGenAnk()
};
// Fahrplan der ersten zwei Jahre (Paket A), nur diese Blasen fallen bei alten Spielständen nach der Zeit weg.
const FU_PLAN=['e1-0a','e1-01','e1-02','e1-03','e1-04','e1-05','e1-06','e1-13','e1-14','e1-15','e1-16','e1-19','k01',...Object.keys(FU_MON)];
// Schalter "nur Neuheiten und Warnungen": Einstieg, Erstes Mal und Kniffe bleiben aus.
// Seit 10.3 (C33): Amtsantritt, Weltweinschau, Spielende und der Abschied des alten Winzers kommen auch in der mittleren Stellung.
const FU_IMMER=['a1','p1','p2','g2-1'];
const FU_HUERDE={'Qualitätswein':'qba','Kabinett':'kab','Spätlese':'spat','Auslese':'aus','Beerenauslese':'ba'};
// Erledigt, sobald der Spieler getan hat, was in der Blase steht. Dann verschwindet auch der Kopf. Blasen ohne Eintrag gehen nur mit "Verstanden".
const FU_ERL={
  'e1-0a':()=>TAB==='gut'&&SUB==='buero',
  'e1-01':()=>S.ein?TAB==='gut'&&SUB==='berg':TAB==='stadt'&&SUB==='arbeit',
  'e1-02':()=>!S.ein&&helferReben()>=S.ha*HA_REBEN,
  'e1-03':()=>rebenGesamt()>0,
  'e1-04':()=>monatNr()>0,
  'e1-06':()=>!!S.fu.geld,
  'e1-07':()=>rebenGesamt()>=S.ha*HA_REBEN,
  'e1-09':()=>S.duengungen>0,
  'e1-13':()=>!S.lots.some(l=>l.status==='trauben'),
  'e1-14':()=>S.lots.some(l=>l.stufe),
  'e1-15':()=>S.lots.some(l=>l.status==='flasche'),
  // Seit 12.8: Wer die Anlage kauft, ist mit r6-5 fertig.
  'r6-5':()=>!!S.sektAnlage
};
/* ================= Titelbild und Geschichte ================= */
// Das Titelbild steht bei jedem Start vorn. Der erste Tipp darauf schaltet auch den Ton frei.
// Die Geschichte vom Anfang läuft seit 7.7 auf der Bild-Bühne der Start-Feier (vFeier), nach dem Formular, damit der Kaufvertrag den Namen kennt.
const GESCHICHTE=['Neun Jahre lang hast du für andere geschuftet.','Dann stand in der Zeitung eine kleine Anzeige: drei Hektar Weinberg, ein alter Gewölbekeller, günstig abzugeben.','Du hast dein Erspartes zusammengekratzt und unterschrieben, bevor dir jemand die Sache ausreden konnte.','Jetzt stehst du vor kahlen Hängen, leeren Fässern und einer Ratte, die sich im Keller wie die Hausherrin benimmt.','Im Dorf wetten sie schon, dass du keine drei Winter durchhältst, und die Winzer von nebenan warten nur auf deinen ersten Fehler.','Zeig es ihnen: Oben im Festsaal des Weinbauverbands steht ein Stuhl, und der ist noch frei.','Erst wird gepflanzt. Ob du selbst einmal darauf sitzt oder erst deine Enkel, wird sich zeigen.'];
const SATZ_TAKT=3.2;
// Seit 10.2.1 "Was ist neu" (Maik 19.11.2026): Die Versionsnummer auf dem Titelbild lässt sich immer antippen und zeigt je Version eine Zeile.
// Bei einer neuen Version leuchtet sie einmal kurz auf, das "Neu" verschwindet nach ein paar Sekunden, die Nummer bleibt.
// Wer noch keinen Spielstand hat, bekommt kein Leuchten. Neue Versionen in WAS_NEU beim laufenden Meilenstein eintragen, die ausführliche Chronik steht im Vault.
const NEU_KEY='oechsle-neu';
// Seit 11.0 "Was geplant ist" (Idee A, Maik 19.11.2026): der Ausblick steht über "Was ist neu" und im Büro bei "Deine Idee".
// Je Zeile Titel und ein Satz, ohne Versionsnummer und Datum. Was gebaut ist, wandert von hier nach WAS_NEU.
const AUSBLICK=[
  ['🎬 Kurze Filme','Die großen Momente bekommen bewegte Bilder.'],
  ['👥 Online mit Freunden','Eine gemeinsame Bestenliste, jeder spielt auf seinem Handy für sich.']];
// Ideen-Knopf: Der Text bekommt eine Kopfzeile mit der Version, damit Maik weiß, auf welchen Stand sich die Idee bezieht.
const IDEE_KEY='oechsle-idee', IDEE_MAX=1000;
// Seit 11.7.1 (Maik 20.11.2026): aufgebaut wie "Mein Stand", je Meilenstein ein Block, das Neueste oben.
// Der laufende Meilenstein hat oben seine X.0 mit Punkten, darunter das Kommende (▶️ als Nächstes, ⏳ danach) nur mit Titel,
// dann die fertigen Etappen ohne Zeichen (✅ nur in der Kopfzeile, Maik 21.11.2026), mit Datum und den bis zu fünf wichtigsten Punkten, sortiert nach Bezug zur Überschrift.
// Seit 12.9 (Maik 21.11.2026): Die Punkte bleiben auch nach dem Abschluss stehen. Jede Etappe startet zugeklappt, ein Tipp auf die Zeile klappt
// ihre Punkte mit ▸/▾ auf und zu, immer nur eine ist offen. Die Kopfzeile tut nichts, die Punkte zum Ganzen (p am Block) sind immer zu sehen.
// Für 1.0 bis 10.5 gab es nie Punkte, dort steht der alte Satz aus der Liste vor 11.7.1 als ein Punkt. Unteretappen (dritte Stelle) kommen nicht hierher.
// Je Version: [Zeichen, Nummer, Titel, Datum, Punkte]. Kommendes ohne Datum und Punkte.
// Seit 14.2: Block 14.0. Die Punkte von 14.2 sind Platzhalter, Wortlaut in Meilenstein 17. 14.1 und 14.3 haben keine eigene Version (Messlauf, Klären ohne Code),
// deshalb steht als Nächstes 14.4. Meilenstein 13 ist seit 22.11.2026 fertig, seine Kopfzeile trägt deshalb das ✅ (die Abschlussprobe 13.9 bekam keine Version).
const WAS_NEU=[
  {k:'🏁 14.0 Pflege-Umbau',d:'in Arbeit',p:['Wie du deine Reben und deinen Boden pflegst, entscheidet über deinen Wein'],v:[
    ['▶️','14.4','Zeitleiste'],
    ['','14.2','Pflege und Boden','23.11.2026',['Jeder Weinberg sammelt Entwicklungspunkte, von der Jungrebe bis zum Grand Cru','Rebschnitt und Düngen machst du selbst oder gibst sie an die Erntehelfer ab','Drei Erziehungsformen: Flachbogen, Kordon und Einzelpfahl, jede mit eigener Menge und Güte','Jede Lage hat ihren eigenen Boden bis zum Terroir','Qualitätspunkte bis 100 sind das Maß für jeden Wein']]]},
  {k:'✅ 13.0 Der Umbau',d:'fertig 22.11.2026',p:['Drei Generationen, drei Akte: Das Spiel wird von Grund auf neu gebaut'],v:[
    ['','13.8','Geschichte','22.11.2026',['Drei Akte mit eigenem Satz bei jeder Übergabe: pflanzen, reifen lassen, krönen','Neue Momente vom geschenkten Hang bis zum ersten Etikett mit Premier Cru','Eine eigene Feier für den ersten Grand Cru jeder Sorte und für den vollendeten Weinberg','Die drei Favoriten der Weltweinschau haben Namen und Geschichten','Winzerbote, Zeichen und Feiern mit neuen Texten']],
    ['','13.7','Spielstufen','22.11.2026',['Lehrjahre, Gesellenjahre und Meisterprüfung unterscheiden sich jetzt beim Wagnis im Herbst','Lehrjahre zeigen die Chance als Zahl, Gesellenjahre als Wort, die Meisterprüfung gar nicht','Jedes Jahr ist gut oder schlecht fürs Warten: Sommer, Schädlingsjahr und die Alten im Winzerboten verraten es','Spritzen und Schädlingsschaden sind weg, die Menge-Sorte bleibt sicher','Meisterprüfung: Preise schwanken stärker, die Nachbarn bieten klüger, Herausforderer und Favoriten sind stärker','Die Meisterprüfung öffnet sich nach deiner ersten Übergabe in den Gesellenjahren','Die Sektanlage kommt mit dem Rebstock der Sekt-Sorte, Zucker hebt den Most nur bis zum Deckel']],
    ['','13.6','Finale','22.11.2026',['Ab dem Terroir kommen vier Jahrhundertjahre, groß im Winzerboten angekündigt','Wer im Jahrhundertjahr sein Wagnis gewinnt, bekommt den Jahrhundertwein','Die Weltweinschau im Juni hat drei Kronen: Sekt, Prädikat und Rarität','Nach der dritten Krone wirst du Ehrenpräsident, erst dann endet die Partie','Ohne alle Kronen übernimmt alle 40 Jahre die nächste Generation und spielt weiter']],
    ['','13.5','Leute, Manager, Maschinen','21.11.2026',['Erntehelfer und Lagerarbeiter steigen in drei Stufen auf und nehmen dir Arbeit ab','Die Manager machen nur noch Büro, Wettbewerb, Hoffest und Anmelden bleiben bei dir','Maschinen lesen nur Menge- und Sekt-Sorte, die Spitzen-Sorte wird immer von Hand gelesen','An der Mosel fahren keine Erntemaschinen, dafür kostet die Handlese dort nicht mehr','Abfüllanlage mit Ausbau, Laubschneider mit mehr Punkten und Menge']],
    ['','13.4','Gebiete und Herbst','21.11.2026',['Jedes Gebiet hat eine Stärke und ein Problem, die Pfalz ist für die erste Partie','Bis Oktober ist dein Spitzenwein sicher, danach wagst du den Weg deines Gebiets','Edelfäulnis im November, Frost im Dezember, an Mosel und Rheingau mit Tendenz','Seltene Jahre öffnen den fremden Weg, die Beerenauslese kann zur Trockenbeerenauslese werden','Am Lese-Knopf steht die Chance, der Weingut-Manager warnt']],
    ['','13.3','Weine und Zeitleiste','21.11.2026',['Eine Öchsle-Tabelle für alle sechs Gebiete','Jeder Wein braucht den passenden Rang, und der Deckel muss reichen','Die Sekt-Sorte macht Sekt direkt bei der Lese, 9 oder 24 Monate auf der Hefe','Jeder Rang bringt Neues, Export und Sabotage 4 Jahre nach dem Winzermeister','Der Spielführer ist im Umbau aus, einschalten geht im Büro']],
    ['','13.2','Grundwerte','21.11.2026',['Dein Boden steigt mit guten Jahren vom Rohboden bis zum Terroir','Jede Sorte wächst mit dem Rebschnitt vom Setzling bis zum Grand Cru','Neu im Weinberg: Rebschnitt von Januar bis April','Ein Deckel je Weinberg begrenzt das Öchsle','Premier Cru, Grand Cru und vom Terroir stehen auf der Flasche']],
    ['','13.1','Werkbank','21.11.2026',['Alte Spielstände starten neu, Album und Bestenliste bleiben']]]},
  {k:'✅ 12.0 Neue Bilder und Ideen',d:'fertig 21.11.2026',p:['Ideen von Timo und neue Bilder kommen ins Spiel','Seit 12.6 ein ruhigerer Start für neue Partien','Seit 12.7 geht kein Tipp mehr verloren','Seit 12.8 kommt jeder Tipp zur rechten Zeit','Seit 12.9 klappt hier jede Etappe auf'],v:[
    ['','12.9','Klapp-Chronik','21.11.2026',['Ein Tipp auf eine Etappe zeigt ihre Punkte, nochmal Tippen klappt sie zu','Alle Etappen starten zugeklappt, offen ist immer nur eine','Auch die fertigen Meilensteine zeigen wieder ihre Punkte, von 1.0 bis 11.8']],
    ['','12.8','Logikprüfung','21.11.2026',['Jeder Tipp kommt zur rechten Zeit und verspricht nichts, was nicht kommt','Neu: Der Kellermeister meldet die Degorgier- und Abfüllanlage für deinen Sektkeller','Neu: Beim ersten Siegel zeigt dir der alte Winzer das Siegelbrett, beim ersten Gold das Album','Maschinen-Tipps kommen pünktlich zur Kaufzeit von Januar bis März','Das Arbeitsamt erklärt der alte Winzer erst, wenn du wirklich Leute brauchst']],
    ['','12.7','Spielführer-Update','21.11.2026',['Das Gesicht des Spielführers sitzt fest oben in der Mitte, ein Tipp darauf holt die Blase jederzeit zurück','Mit ‹ und › blätterst du durch alle Tipps, die schon dran waren, auch durch weggedrückte','Ab zwei Sprechern zeigen die Gesichter oben in der Blase nur die Tipps von einem','Aufgeräumte Statusleiste: Das Gebiet steht im Wetter-Fenster, das Ansehen in „Dein Stand“']],
    ['','12.6','Fehlerbehebung','21.11.2026',['Ruhiger Start: Jeder Ort zeigt nur, was du gerade brauchst, der Rest kommt, wenn es so weit ist','Jede neue Partie startet mit Spielführer, ausschalten geht im Büro','Der alte Winzer führt erst in den Weinberg, das Arbeitsamt kommt, wenn du Leute brauchst','Erstes Jahr in klarer Reihenfolge: pflanzen, ab April Ruhe mit „Weiter bis etwas ansteht“, im Juli die Erinnerung vor der Lese','Jeder Tipp nennt den Weg, ein grüner Punkt zeigt ihn, ein Tipp aufs Gesicht klappt die Blase zu']],
    ['','12.4','Bilder-Kür','20.11.2026',['15 neue Bilder von Timo, damit ist das ganze Spiel im neuen Look','Zehn alte Bilder neu gemalt, vom Amt über die Auktion bis zum Sieg bei der Weltweinschau','Fünf Nahansichten vom Weingut: Kelterhaus, Festwiese, Gästezimmer, Turmstube und Steillage','Im Winzerboten zeigt „Dein Weingut“ jeden zweiten Monat eine Nahansicht, sobald du das Gebäude hast','Beim Aufstieg zeigt die Zeitung gleich dein Weingut der neuen Stufe']],
    ['','12.3','Lesbare Tafeln','20.11.2026',['Die Tafel an der Pinnwand ist jetzt gut lesbar, mit Tinte und Ornament','Neu auf der Tafel: „Weinhof und Weinberg der Familie“ über deinem Namen','Der Familienname am Holzbogen wie ins Holz geschnitzt','Am Holzbogen steht vor jedem Namen, wer er war: Gründer, Sohn, Enkel …','Der Name des Weinguts hat höchstens 14 Zeichen, damit er groß bleibt']],
    ['','12.5','Kleine Verbesserungen','20.11.2026',['Maschinen tragen nur noch eine Nummer, wenn du zwei gleiche hast','Die Plaketten im Büro trennen lange Namen an der richtigen Stelle','Das Spendenfenster zeigt, wie viel in diesem Jahr noch Steuer spart']],
    ['','12.2','Neue Bilder','20.11.2026',['Neun neue Bilder von Timo','Jede Maschine zeigt beim Kauf ihr Bild, das erste Gerät jeder Art kommt in den Winzerboten','Traubenwickler, Mehltau und Kirschessigfliege mit Bild beim ersten Befall','Der Sektkeller mit eigenem Bild beim Kauf und im Winzerboten','Neun Lexikon-Seiten zeigen oben ihr Bild']],
    ['','12.1','Sektkeller','20.11.2026',['Sekt nur mit eigenem Sektkeller, zu kaufen ab Winzer','Sektflasche, Korken und Agraffe als Kosten je Flasche','Degorgier- und Abfüllanlage halbiert die Kosten','24 Monate Hefelager bringen mehr Geld','Der Kellermeister macht Sekt schon auf Stufe 1']]]},
  {k:'✅ 11 Weinkompendium',p:['Das Weinkompendium ersetzt das Weinlexikon','Siegel in Bronze, Silber und Gold'],v:[
    ['','11.8','Weinarchiv','20.11.2026',['Das Kellerbuch heißt jetzt Weinarchiv, mit drei Kacheln','Siegelbrett mit einer Zeile je Wein und dem Ruf des Hauses','Gold-Etikett für alle drei Siegel, in Franken der Bocksbeutel','Deine Weine zeigen ihre drei Siegel','Lexikon zum Nachlesen, neue Seiten mit „Neu“']],
    ['','11.7','Buch und Abschluss','20.11.2026',['Kapitel im Buch neu geordnet, wie die Orte im Spiel','Ein Aufstieg über zwei Ränge zeigt beide Kapitel','Die letzte Übergabe bekommt einen Nachfolger mit Namen','Die Pleite zeigt deine Generationen und steht in der Bestenliste','Neues Spiel nach der Pleite erst nach Nachfrage']],
    ['','10.6','Aufgeräumte Fenster','20.11.2026',['Gesperrtes bleibt unsichtbar bis zum passenden Rang','Die Aufstiegsfeier nennt alles Neue','Fenster von unten auf Pergament, Überschriften dunkelbraun','Leiste für die Flaschen im Lager','Sabotage erst ab Winzer']],
    ['','11.6','Schummelsperre','20.11.2026',['Festes Wetter je Partie, neu laden ändert nichts','Stufen heißen Lehrjahre, Gesellenjahre und Meisterprüfung','Schädlinge in der Meisterprüfung, Spritzen halbiert den Schaden','Kellerausbau mit Namen','Mehr Startgeld in den Lehrjahren']],
    ['','11.5','Echtes Weingut','20.11.2026',['Ab 4 Hektar arbeiten Leute für echte Löhne','Manager kommen mit dem Rang von selbst','Jeder Rang verlangt mehr Land, bis 40 Hektar','Ruf des Hauses: mehr Siegel, bessere Preise','Präsident in drei Generationen']],
    ['','11.4','Neue Rebsorten','20.11.2026',['Je Gebiet drei Sorten: für Menge, Sekt und Spitzenwein','Siegel hängen an den Sorten','Album mit 55 Weinen','Sortenwahl beim neuen Spiel']],
    ['','11.3','Geschichten','19.11.2026',['Zu jedem Eintrag eine kurze Geschichte','Siegel nur noch für Rebsorten, Sekt und Stufen']],
    ['','11.2','Aufgeräumtes Büro','19.11.2026',['Vier Bereiche statt einer langen Liste','Rangliste als Zeile bei deinem Rang']],
    ['','11.1','Ideenknopf','19.11.2026',['Ideen per WhatsApp aus dem Büro schicken','„Was geplant ist“ zeigt, was kommt']]]},
  {k:'✅ 10 Spielende',v:[
    ['','10.5','Optik 2.0','19.11.2026',['Neue Optik: Holz, Rahmen, Pergament und Knöpfe neu gezeichnet. Helle Knöpfe sind dein Weg, rote heißen „Überleg noch mal“, dunkle führen zurück.']],
    ['','10.4','Titelbild','19.11.2026',['Neues Titelbild im Hochformat und elf Zeitungsbilder im Stil der Weingut-Reihe.']],
    ['','10.3','Spielprüfung','19.11.2026',['Das ganze Spiel geprüft: Nach dem alten Winzer sprechen deine Manager, gewonnen ist erst mit der Chronik, dazu viele Regeln und Texte im Buch.']],
    ['','10.2','Große Bilder','19.11.2026',['Weltweinschau, Sieg und Übergabe am Küchentisch als große Bilder, dazu neue Texte und Tipps.']],
    ['','10.1','Weltweinschau','19.11.2026',['Als Präsident holst du die Weltweinschau ins Dorf, mit Stiftung und zwei Enden.']],
    ['','10.0','Präsidentenwahl','18.11.2026',['Als Präsident verteidigst du dein Amt alle fünf Jahre in einer Wahl.']]]},
  {k:'✅ 9 Bilder',v:[
    ['','9.2','Ortsbilder','19.11.2026',['Kellerei und Stadt zeigen für jeden Ort ein eigenes Bild.']],
    ['','9.1','Torbogen','18.11.2026',['Das Weingut zeigt fünf eigene Bilder, der Startbildschirm den Torbogen.']],
    ['','9.0','Bildergalerie','18.11.2026',['Dein Weingut wächst mit jedem Rang, in 40 Bildern über alle Jahreszeiten.']]]},
  {k:'✅ 8 Spielinhalte',v:[
    ['','8.6','Kellerausbau','18.11.2026',['Den Keller baust du Stufe für Stufe aus.']],
    ['','8.5','Kellermeister','18.11.2026',['Der Kellermeister keltert schon auf Stufe 1.']],
    ['','8.4','Titelseite','18.11.2026',['Neue Titelseite mit Timo als Chef-Tester.']],
    ['','8.3','Spielzeit-Uhr','18.11.2026',['Eine Spielzeit-Uhr zählt mit, wie lange du bis zu jedem Rang brauchst.']],
    ['','8.2','Spenden','17.11.2026',['Spenden im Rathaus mit acht Stufen und eigenen Ehrungen.']],
    ['','8.1','Spielführer','17.11.2026',['Der alte Winzer begleitet dich als Spielführer durch die ersten Jahre.']],
    ['','8.0','Erntehelfer','17.11.2026',['Erntehelfer und neue Maschinen: Düngerstreuer, Laubschneider, Abfüllanlage.']]]},
  {k:'✅ 1 bis 7 Aufbau',v:[
    ['','7.9','Rathaus','17.11.2026',['Zwei Namen und Anrede beim Start, das Rathaus mit Wettbewerben und Auktionen.']],
    ['','7.8','Musik','17.11.2026',['Kurze Musik, Musik und Geräusche getrennt einstellbar.']],
    ['','7.7','Kaufvertrag','17.11.2026',['Feiern mit Geschichte, das Spiel beginnt mit dem Kaufvertrag.']],
    ['','7.6','Pinnwand','17.11.2026',['Aktuelles aufgeräumt, der alte Winzer hängt an der Pinnwand.']],
    ['','7.5','Manager','17.11.2026',['Manager und Leute im Betrieb.']],
    ['','7.4','Einheitliche Fenster','17.11.2026',['Alle Orte in einheitlichen Fenstern mit dem i oben rechts.']],
    ['','7.3','Wachssiegel','17.11.2026',['Fanfare, neuer Winzerbote und Urkunde mit Wachssiegel.']],
    ['','7.2','Aufstiegsfeier','16.11.2026',['Aufstiegsfeier mit Bild und Urkunde.']],
    ['','7.1','Holztisch','16.11.2026',['Neue Optik: Papier auf dem Holztisch.']],
    ['','7.0','Generationswechsel','16.11.2026',['Generationswechsel, Freischaltungen je Rang und die Flasche als App-Symbol.']],
    ['','5.0','Feinschliff','15.11.2026',['Feinschliff mit Makler, Weinfest, Weinlexikon, Daueraufträgen und Edelfäulnis je Gebiet.']],
    ['','4.1','Spielanleitung','15.11.2026',['Das Buch mit der Spielanleitung und das Büro mit Spielständen und Ton.']],
    ['','4.0','Navigation','15.11.2026',['Neue Navigation mit den Leisten unten.']],
    ['','3.3','Edelfäulnis','15.11.2026',['Edelfäulnis, Spätherbst und ausgeglichene Gebiete.']],
    ['','3.0','Großer Umbau','15.11.2026',['Großer Umbau: der Winzerbote, zehn Ränge, eigene Weinhandlung, Hoffest und Bestenliste.']],
    ['','1.0','Erste Fassung','14.11.2026',['Die erste Fassung als App fürs Handy.']]]}];
// Seit 14.4.1 (Bauplan 14.4 Zeitleiste, Maik 24.11.2026): die neuen Zahlen der Etappe an einer Stelle, alles Startwerte, gemessen und gedreht wird in Meilenstein 15.
// Bis zu ihrer Unteretappe sind sie ungenutzt. Nur LEUTE_LOHN_F ist schon verdrahtet (lohnSumme) und steht neutral auf 1.
// Bestehende Zahlen mit neuem Wert (zum Beispiel JH_ERST, EP_PREMIER, AUK_PREIS_LAGE, ANREG_ANS, DIFF.mittel.land) stellt erst ihre Unteretappe um, damit die Gegenprobe gleich bleibt.
// Die Zahlen für die Ereignisse (LADEN_AB, LADEN_BIS, EXPORT_SPAET, AUK_ERST_AB) stehen seit 14.4.2 vor der Tabelle FREI, weil sie dort gebraucht werden.
// Löhne je Stufe (Maik 24.11.2026): Faktor auf den Lohn je Gruppe, Index 0 bis 2 für Stufe 1 bis 3 (ohne Stufe gilt der erste). Startwert überall 1.
const LEUTE_LOHN_F={helfer:[1,1,1],lagerarb:[1,1,1]};
// Chef-Grenze (14.4.3): 'jung' heißt, in den Lehrjahren schneidet der Chef still den Weinberg mit der niedrigsten Pflegestufe unter Grand Cru
// (bei Gleichstand den mit weniger Punkten), in den Gesellenjahren rät der alte Winzer dasselbe, in der Meisterprüfung gibt es keinen Rat.
const CHEF_RAT='jung';
// Spitzenlage als vierter Weinberg (14.4.4): Start beim Kauf mit SL_EP_START Entwicklungspunkten, SL_BODEN_START Bodenpunkten, Erziehungsform SL_FORM,
// Ansehen beim Grand Cru SL_ANS_GC und beim Terroir SL_ANS_TERROIR (beim Kauf weiter SPITZE_ANS).
const SL_EP_START=45, SL_BODEN_START=40, SL_FORM='pfahl', SL_ANS_GC=60, SL_ANS_TERROIR=90;
// Land mit weichem Deckel je Lage (14.4.5): bis LAND_SCHWELLE Hektar Besitz in der Lage normaler Preis, darüber steigt der Aufschlag im Quadrat bis zum Deckel
// LAND_DECKEL auf das (1+LAND_AUFSCHLAG)-fache, bis zum Rang LAND_FRUEH_BIS (Winzer) auf das (1+LAND_AUFSCHLAG_FRUEH)-fache. Je Rang (Index in RAENGE) eine Zahl.
// Der Südhang zählt ohne die 2 Hektar der Spitzenlage, SUED_MAX bleibt die Obergrenze.
const LAND_SCHWELLE={einfach:[4,7,14,26,26,26,26,26,26,26],hoehe:[8,8,8,8,8,8,8,8,8,8],sued:[4,4,4,4,4,4,4,4,4,4]};
const LAND_DECKEL={einfach:[5,9,17,32,32,32,32,32,32,32],hoehe:[16,16,16,16,16,16,16,16,16,16],sued:[6,6,6,6,6,6,6,6,6,6]};
const LAND_AUFSCHLAG=7, LAND_AUFSCHLAG_FRUEH=3, LAND_FRUEH_BIS=2;
// Preislage beim Land (14.4.5): günstig unter LAND_SATZ[0], teuer ab LAND_SATZ[1], zurück auf normal erst mit LAND_SATZ_PUFFER Abstand (wie beim Markt).
// Der Satz kommt in den Spielstufen LAND_SATZ_STUFEN in den Winzerboten. Zeichen am Los je Spielstufe (LAND_ZEIGE): Rat des alten Winzers, Aufschlag als Zahl, nichts.
// Der alte Winzer warnt ab einem Aufschlag von LAND_RAT_AB (1 heißt 100 Prozent). Platzhalter, Wortlaut in Meilenstein 17.
const LAND_SATZ=[.92,1.08], LAND_SATZ_PUFFER=.03, LAND_SATZ_STUFEN=['mittel','schwer'], LAND_ZEIGE={einfach:'rat',mittel:'zahl',schwer:'nichts'}, LAND_RAT_AB=1;
// Stundung (14.4.5): Bei der dritten Mahnung in Folge STUNDUNG_MONATE Monate ohne Mahnung statt der Pfändung, ab der Generation STUNDUNG_AB_GEN, einmal je Generation.
const STUNDUNG_MONATE=12, STUNDUNG_AB_GEN=2;
// Hintertür und Kontrollen je Akt (14.4.6): Kontrollen ab dem Akt KONTR_AB_AKT, Abstand in Monaten je Spielstufe, Anzeige je Spielstufe,
// Grundstrafe in Ansehen je Akt (die Zuschläge STRAFE_ANS_WEITER und BESTECH_NEIN_ANS nur im 3. Akt), Verwarnung beim ersten Fund je Spielstufe,
// Anzeige bei "Kontrolle anregen" je Spielstufe.
const KONTR_AB_AKT=2, KONTR_ABSTAND={einfach:[24,48],mittel:[24,48],schwer:[12,48]}, KONTR_ZEIGE={einfach:'warnung',mittel:'strafe',schwer:'nichts'};
const STRAFE_ANS_AKT={2:0,3:150}, VERWARNUNG={einfach:1,mittel:0,schwer:0}, ANREG_ZEIGE={einfach:'chance',mittel:'wort',schwer:'geruecht'};
// Gegner mit Wunschjahren (14.4.7): je Rolle die Jahre für Rebstock, Premier Cru und Grand Cru, je Lage die Jahre für Fruchtboden, Gutsboden und Terroir (Annahme 12).
// Deckel der Gegner: GEGNER_DECKEL_AN 1 mit dem Besitz-Deckel je Rang (GEGNER_DECKEL), 0 nur mit der Obergrenze GEGNER_HA_OBEN.
const GEGNER_WB={menge:[4,35,62],sekt:[46,64,89],spitze:[71,79,93]}, GEGNER_BODEN={einfach:[9,36,82],hoehe:[47,64,92],sued:[70,79,94]};
const GEGNER_DECKEL_AN=1, GEGNER_DECKEL=[5,9,17,32,42,47,50,50,50,50], GEGNER_HA_OBEN=56;
// Auftakt der Akte (14.4.8): eigene Schlagzeile im Monat des Aufstiegs in den 2. und 3. Akt. Platzhalter, Wortlaut in Meilenstein 17.
// Seit 14.4.3: Winzerbote zum Jahreswechsel für einen Weinberg, den nur Erntehelfer (Stufe 1) geschnitten haben, nicht in den Lehrjahren.
// Rat des alten Winzers zur Chef-Grenze in den Gesellenjahren. Platzhalter, Wortlaut in Meilenstein 17.
const HELFER_NUR_BOTE='✂️ Deinen {sorte} haben nur Erntehelfer geschnitten. Sie halten den Stand, besser wird er so nicht.';
const CHEF_RAT_SATZ='Der alte Winzer rät: Schneide den {sorte} selbst, er braucht dich am meisten.';
const AKT_AUFTAKT={2:{t:'Der zweite Akt beginnt',text:'Ab jetzt steht dir die Hintertür offen, aber die Weinkontrolle schaut genauer hin.'},
  3:{t:'Der dritte Akt beginnt',text:'Ab jetzt setzt du deinen Ruf ein, wenn du etwas wagst.'}};
const TITEL_NAMEN=[[['Spielidee &amp;','Entwicklung'],'Maik','Dienst'],[['Chef-Tester &amp;','Visuelle Effekte'],'Timo','Dienst']];
