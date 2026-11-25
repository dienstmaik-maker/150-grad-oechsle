// 150 Grad Öchsle: Kern. Rechenregeln, Jahr, Wetter, Speichern. Seit 13.1 eigene Datei, vorher in index.html.
// Lädt nach zahlen.js und vor oberflaeche.js, alle Namen sind global.
'use strict';
for(const [id,[rolle,name,farbe]] of Object.entries(SORTEN_ROLLEN)){const P=ROLLEN[rolle]; SORTEN[id]={name,farbe,rolle,ertrag:P.ertrag,preis:P.preis,minL:P.minL,maxL:P.maxL,reife:P.reife,...(P.sektStar?{sektStar:true}:{})}}
// Seit 14.4.4 (Entscheidung 13, Annahme 1): Die Spitzenlage ist ein vierter Weinberg mit eigener Kennung (SL_PRE plus Kennung der Spitzen-Sorte), dieselbe Rebsorte
// mit allen ihren Werten (stamm zeigt auf sie), eigener Name mit Lagennamen (SL_NAME), damit ihr Wein ein eigener Posten im Keller ist. Die Reihenfolge der Sorten
// nach Rang bleibt bei drei (R().sorten, sortenFolge, SORTE_RANG), die Liste der Weinberge ist weinberge(): die drei Sorten und, sobald gekauft, die Spitzenlage.
for(const [id,[rolle]] of Object.entries(SORTEN_ROLLEN)) if(rolle==='spitze') SORTEN[SL_PRE+id]=Object.assign({},SORTEN[id],{name:SORTEN[id].name+' '+SL_NAME,stamm:id,sl:1});
const stamm=id=>(SORTEN[id]||{}).stamm||id, istSL=id=>!!(SORTEN[id]||{}).sl;
const slKenn=()=>{const sp=rolleSorte('spitze'); return sp?SL_PRE+sp:null};
const slFeld=()=>{const k=S&&S.felder&&slKenn(); return k?S.felder[k]||null:null};
function weinberge(){const L=R().sorten, k=slKenn(); return k&&S.felder[k]?[...L,k]:L}
// Fläche der Spitzenlage in Reben (fest SPITZE_HA, auch wenn Reben eingegangen sind) und was dort nachgepflanzt werden kann.
const slFl=()=>slFeld()?SPITZE_HA*HA_REBEN:0, slPlatz=()=>{const f=slFeld(); return f?Math.max(0,slFl()-f.reben):0};
// Beim Kauf: SPITZE_HA Hektar fertig bepflanzt mit alten Reben (SL_EP_START Punkte, Premier Cru), eigener Boden (SL_BODEN_START, Gutsboden), Einzelpfahl.
// Kommt sie nach dem Rebschnitt (nach SCHNITT_BIS), gilt sie für dieses Jahr als geschnitten, ohne Zuwachs und ohne Verwildern (schnittWer 'kauf', Annahme der Bau-Sitzung).
// Der Chef bleibt, wo er ist (chefNorm), in den Lehrjahren teilt das Spiel still nach der Regel neu zu.
function slKauf(){const k=slKenn(); if(!k||S.felder[k]) return null;
  const f=S.felder[k]={reben:SPITZE_HA*HA_REBEN,pflSt:0,ep:SL_EP_START,form:SL_FORM,bodenP:SL_BODEN_START,boden:BODEN_START}; feldReset(f); f.pflSt=epStufe(k); f.bodenSt=wbBoden(k);
  if(S.monat>SCHNITT_BIS){f.schnitt=S.jahr; f.schnittWer='kauf'; f.schnittZ=0}
  chefNorm(); return k}
// rollenAn: Spielt die Partie mit den Rollen? Ohne Spielstand (Titelbild, Neues Spiel) gilt, was ein neues Spiel bekäme.
const rollenAn=()=>S?!!S.rollen:!!ROLLEN_NEU;
// Das Gebiet mit der passenden Sortenliste. neu: true oder false erzwingt die Fassung, ohne Angabe gilt die der laufenden Partie.
const REG=(r,neu)=>(neu??rollenAn())?REGIONEN_ROLLEN[r]:REGIONEN[r];
const gebietText=(r,neu)=>(neu??rollenAn())?{...GEBIET_TEXT[r],lohnt:GEBIET_ROLLEN[r].lohnt,strat:GEBIET_ROLLEN[r].strat}:GEBIET_TEXT[r];
// Seit 11.4: Sorten mit Rolle passen überall gleich gut (1), statt Sternen zeigt das Spiel ihre Rolle.
const eignung=(id,r)=>(SORTEN[id]||{}).rolle?1:(EIGNUNG[r||S.region]||{})[id]||.85;
// Zucker der Sorte im Gebiet: Die beste Sorte startet überall gleich. Die anderen behalten ihren Abzug und liegen mindestens 1° darunter.
// Seit 11.4: Sorten mit Rolle bringen den Zucker ihres Profils mit (ROLLEN), in jedem Gebiet gleich.
// Seit dem Nachtrag zu 14.5.4 (Klima je Weinberg): Sorten mit Rolle rechnen mit dem Klima ihres Weinbergs (klimaOe), bis dahin ROLLEN.zucker und SPITZE_OE.
const zuckerIm=(id,r)=>SORTEN[id].rolle?klimaOe(id):eignung(id,r)>=1?0:Math.min(-1,SORTEN[id].zucker);
const eigText=e=>e>=1?'★★★ sehr gut geeignet':e>=.85?'★★ gut geeignet':'★ geht noch';
// Seit 11.4: das Schild einer Sorte. Mit Rolle steht dort die Rolle und was sie kann, sonst die Sterne im Gebiet.
const rolleVon=id=>ROLLEN[(SORTEN[id]||{}).rolle];
// Seit 13.2.2: Schlüssel der Rolle für die Tabellen der Rebpflege, Sorten ohne Rolle rechnen wie die Menge-Sorte.
const rolleK=id=>(SORTEN[id]||{}).rolle||'menge';
// Seit 14.2.2: Mengen-Faktor der Pflegestufe, für alle Rollen gleich (STUFE_MENGE). Die Qualität rechnet seit 14.5.2 qualTeile.
const pflegeMenge=(f,id)=>STUFE_MENGE[f.pflSt||0];
// Seit 14.2.2: Entwicklungspunkte (f.ep, 0 bis EP_MAX). Erziehungsform des Weinbergs, ohne Wahl die passende (Entscheidung 34).
const formVon=id=>{const f=S.felder[id]||{}; return f.form||FORM_PASST[rolleK(id)]||'flach'};
// Schwellen in Punkten: Rebstock nach EP_REBSTOCK_JAHRE Chef-Jahren der Form, Premier Cru, Grand Cru.
const epSchwelle=id=>[0,EP_REBSTOCK_JAHRE*FORMEN[formVon(id)].ep,EP_PREMIER,EP_GRAND];
const epStufe=id=>stufeZu((S.felder[id]||{}).ep||0,epSchwelle(id));
// Seit 14.5.3 (Entscheidungen 30, 32 und 42): jede Form für jede Sorte, die Spitzenlage steht fest an ihrer Form. Menge der Form für jede Sorte gleich
// (FORMEN.menge, bis 14.5.2 FORM_WIRKUNG je Rolle). formSchutz: Der Kordon fängt Spätfrost und Regen im Oktober zur Hälfte ab (Annahme 9).
const formenFuer=id=>istSL(id)?[SL_FORM]:Object.keys(FORMEN);
const formMenge=id=>FORMEN[formVon(id)].menge;
const formSchutz=(id,F)=>{const s=FORMEN[formVon(id)].schutz; return s==null?F:1-(1-F)*s};
// In der Erziehung ist ein Weinberg bis zum Rebstock (Kordon teurer im Schnitt und von Hand gelesen, Annahme 11).
const inErziehung=id=>((S.felder[id]||{}).pflSt||0)<1;
// Erlaubt die Form die Maschine? Seit 14.5.3 (Entscheidungen 40 und 42, Annahme 10) für jede Sorte gleich: Flachbogen jede Erntemaschine, Kordon nur mit dem
// Vollernter im Einsatz (bis dahin liest die Hand nach handFeld), Einzelpfahl nie. Bis 14.5.2: Kordon ab Rebstock, die Spitzen-Sorte nie.
const vollDa=h=>maschEinsatz(h).some(m=>mTyp(m)===MASCH.gross);
const formMasch=id=>{const m=FORMEN[formVon(id)].masch; return m===1||(m==='voll'&&vollDa())};
// Darf die Maschine in den Weinberg (Lese und Laubschneider)? Dazu nie an der Mosel (Annahme 18).
const maschDarf=id=>!R().steil&&formMasch(id);
// Reben, die von Hand gelesen werden (seit 14.2.4 nach der Form statt nur die Spitzen-Sorte).
function handLeseReben(){return weinberge().filter(id=>!maschDarf(id)).reduce((a,id)=>a+S.felder[id].reben,0)}
// Rebschnitt je Hektar nach der Form, in der Erziehung bis Rebstock haErz (Annahme 11).
const schnittHa=id=>{const F=FORMEN[formVon(id)]; return inErziehung(id)?F.haErz:F.ha};
const epRund=x=>Math.round(x*1000)/1000, epT=x=>String(Math.round(x*10)/10).replace('.',',');
// Punkte eines Jahres: EP_SCHNITT aus dem Rebschnitt mal Zuwachs dessen, der schneidet (zs), EP_BODEN aus einem guten Bodenjahr mal Zuwachs
// dessen, der düngt (zd), beides mal den Punkten der Form. Ab Grand Cru bringt jeder Rebschnitt mindestens GC_HALTEN.
function epPlus(id,gutBoden,zs,zd){const e=FORMEN[formVon(id)].ep; let p=EP_SCHNITT*e*zs+(gutBoden?EP_BODEN*e*zd:0); if(((S.felder[id]||{}).ep||0)>=EP_GRAND) p=Math.max(p,GC_HALTEN); return p}
// Zum Jahreswechsel: geschnitten (f.schnitt im abgelaufenen Jahr) gibt epPlus, sonst verwildert der Weinberg (VERWILDERN nach Jahren ohne Schnitt, f.wild).
// Annahme von Claude: Ohne Rebschnitt zählt auch das Boden-Zehntel nicht.
function epJahr(f,id,gutBoden,zs=1,zd=1){
  if(f.schnitt===S.jahr-1){f.wild=0; f.ep=epRund(Math.min(EP_MAX,(f.ep||0)+epPlus(id,gutBoden,zs,zd)))}
  else{f.wild=(f.wild||0)+1; f.ep=epRund(Math.max(0,(f.ep||0)-VERWILDERN[Math.min(VERWILDERN.length,f.wild)-1]))}
}
// Neue Reben verdünnen die Punkte genau um ihren Anteil (Entscheidung 4), auch beim Nachpflanzen. Die Stufe folgt zum Jahreswechsel.
// Seit 14.2.5 verdünnt neu bepflanzte Fläche auch die Bodenpunkte ihrer Lage (bodenVerduennen).
// Seit dem Nachtrag zu 14.5 (Maik 25.11.2026, 08:19 Uhr): nie mehr Reben, als die eigene Lage Platz hat (platzFuer), auch kein Rundungsrest.
// Seit 15.1.3 (Bauplan 15.1 Annahme 2): Ein neu bepflanzter Weinberg geht gleich an die Leute, sobald es sie gibt, der Chef bleibt, wo er ist (chefNorm).
// Bis 15.1.2 zählte er bis zum nächsten Aufruf von chefNorm ohne Zuteilung als Chef-Weinberg.
// Seit 15.6.5 (Bauplan 15.6, Maik zu 15.5): Neue Reben verdünnen die Punkte (rebenDazu). rueckfallAb(id) ist die Zahl neuer Reben, ab der die Punkte unter die
// Schwelle der Pflegestufe rutschen, sodass der Weinberg beim nächsten Jahreswechsel zurückfällt, wenn der Schnitt es nicht ausgleicht. null, wenn er auf Jungrebe
// steht oder die Punkte schon darunter liegen. stufeNach(id,n) ist die Pflegestufe nach n neuen Reben. Wortlaut von rueckfallSatz ist Platzhalter (Meilenstein 17).
function rueckfallAb(id){const f=S.felder[id]; if(!f||!(f.reben>0)) return null; const st=f.pflSt||0, SW=epSchwelle(id), ep=f.ep||0; if(st<1||!(SW[st]>0)||ep<SW[st]) return null;
  return Math.max(10,Math.floor(f.reben*(ep/SW[st]-1)/10)*10+10)}
function stufeNach(id,n){const f=S.felder[id]; return Math.min(f.pflSt||0,stufeZu((f.ep||0)*f.reben/(f.reben+n),epSchwelle(id)))}
function rueckfallSatz(id){const ab=rueckfallAb(id); return ab==null?'':`Ab ${rbn(ab)} neuen Reben fällt dein ${SORTEN[id].name} beim Jahreswechsel auf ${PFLEGE_STUFEN[stufeNach(id,ab)]} zurück`}
function rebenDazu(id,n){const f=S.felder[id]; if(f) n=Math.min(n,platzFuer(id)); if(!(n>0)||!f) return; const a=f.reben||0; f.ep=epRund((f.ep||0)*a/(a+n)); f.reben=a+n; bodenVerduennen();
  if(!a&&helferKann(1)){f.schneider='helfer'; chefNorm()}}
// Seit 14.5.4 (Annahme 14): Grand Cru für alle Sorten, nach der Pflegestufe bei der Lese (bis 14.5.3 nur die Spitzen-Sorte, dort 0).
const pflegePreis=st=>PFLEGE_PREIS[st||0]||0;
// Seit 13.2.3: Deckel fürs Öchsle eines Weinbergs aus Rolle, Boden-Stufe und Pflegestufe.
function deckel(id){const f=S.felder[id]||{}; return DECKEL_BASIS[rolleK(id)]+BODEN_ST_OE*wbBoden(id)+PFLEGE_ST_OE*(f.pflSt||0)}
// Obergrenze im Monatsmodell: der Deckel, mit Edelfäulnis bei der Spitzen-Sorte OE_MAX (seit 14.5.4 175°, bis 14.5.3 150°).
// Seit dem Nachtrag zu 14.5.4: mit Edelfäulnis höchstens EDEL_OE_MAX, erst nach den Rosinen (f.rosin) OE_MAX.
function oeGrenze(id){const f=S.felder[id]; return f&&f.edel&&rolleK(id)==='spitze'?(f.rosin?OE_MAX:EDEL_OE_MAX):deckel(id)}
// Klima je Weinberg (Nachtrag zu 14.5.4, Maik 25.11.2026): Lage plus Sorte plus Gebiet, die Spitzenlage mit ihrem eigenen Wert. Gerundet auf ganze Grad.
// Seit dem Nachtrag zu 14.5 (jede Lage eine Sorte) steht jeder Weinberg auf genau seiner Lage (lageVon), bis dahin zählte der Schnitt nach Reben.
const gebietKlima=r=>r.warm>0?'warm':r.warm<0?'kuehl':'mittel';
function klimaLagen(id){return istSL(id)?{spitzenlage:1}:{[lageVon(id)]:1}}
function klimaOe(id){const A=klimaLagen(id); return Math.round(Object.keys(A).reduce((a,lg)=>a+A[lg]*KLIMA_LAGE[lg],0)+KLIMA_SORTE[rolleK(id)]+KLIMA_GEBIET[gebietKlima(R())])}
// In Worten für den Weinberg, ohne Zahlen. Platzhalter, Wortlaut in Meilenstein 17.
function klimaText(id){const A=klimaLagen(id), L=Object.keys(A).map(lg=>`${lg==='spitzenlage'?SL_NAME:LAGEN[lg].kurz} ${KLIMA_WORT[lg]}`);
  return [L.join(', '),KLIMA_SORTE_WORT[rolleK(id)],KLIMA_GEBIET[gebietKlima(R())]?KLIMA_GEBIET_WORT[gebietKlima(R())]:''].filter(Boolean).join(', ')}
const feldId=f=>weinberge().find(id=>S.felder[id]===f);
// Seit 13.3.2: Freischaltung nach Rang (FREI) und welche Stufen eine Sorte nach ihrer Rolle machen darf (WEIN_ROLLE).
const freiAb=k=>(FREI[k]||{r:0}).r;
// Seit 14.6.2: Rang eines Weins, auch für Beerenauslese, Eiswein und Trockenbeerenauslese über ihren Weg (STUFE_WEG). stufeFreiAb ist der früheste Rang.
const stufeFrei=st=>FREI['wein_'+st]?frei('wein_'+st):(STUFE_WEG[st]||[]).some(k=>frei(k));
const stufeFreiAb=st=>FREI['wein_'+st]?freiAb('wein_'+st):Math.min(...(STUFE_WEG[st]||[]).map(freiAb));
// Seit 13.3.4 mit Abstand (ab Jahre nach dem Aufstieg in den Rang r, genau auf den Monat) und Ende (bis).
// Seit 14.4.2 (Grundsatz der drei Sorten): am Rang (r), verdient (tat, S.taten) oder als Ereignis (ev mit r und ab). Pflegestufe (pfl) und Fläche (ha) sind weg.
// Ein Eintrag mit Tat und Ereignis (der Export) ist frei, sobald eins davon gilt. Einen Abstand ohne ev haben nur noch die Manager (Annahme 28).
const rolleSorte=rl=>R().sorten.find(id=>(SORTEN[id]||{}).rolle===rl);
const tatDa=t=>!!(S.taten||{})[t];
// Eine Tat merken (Annahme 19): einmal und für immer, mit Monat.
function tatMerk(t){const T=S.taten=S.taten||{}; if(T[t]==null) T[t]=S.jahr*12+S.monat}
// Abstand in Jahren eines Eintrags. Als Liste [von, bis] je Partie fest gewürfelt (fest Thema 14, nr ist die Stelle des Schlüssels in FREI).
function freiAbstand(k){const a=(FREI[k]||{}).ab; return Array.isArray(a)?festI(a[0],a[1],fest(14,Object.keys(FREI).indexOf(k),START_JAHR,0)):a||0}
// Seit 14.6.2 (Prüfregel A2, Maik 25.11.2026): Ein Schlüssel ohne Eintrag in FREI ist gesperrt, ein Tippfehler darf nichts öffnen (bis 14.6.1 hieß das "frei").
// Jede Frage danach merkt FREI_UNBEKANNT (nur im Arbeitsspeicher), Prüfskript und Logik-Bericht melden sie als Fehler (🛑). Die Kniffe im Spielführer haben eine eigene Funktion.
const FREI_UNBEKANNT={};
function frei(k){const e=FREI[k]; if(!e){FREI_UNBEKANNT[k]=(FREI_UNBEKANNT[k]||0)+1; return false} if(e.tat&&tatDa(e.tat)) return true; if(e.r==null) return false;
  if(S.rang<e.r||(e.bis!=null&&S.rang>=e.bis)) return false; const ab=freiAbstand(k); if(!ab) return !e.tat;
  const m=(S.rangMon||{})[e.r]; return m!=null&&S.jahr*12+S.monat>=m+12*ab}
// "ab dem Rang Winzer", "mit deinem ersten Qualitätswein" oder bei Managern "4 Jahre nach dem Rang Winzermeister", für Texte.
// Ereignisse nennen keinen Zeitpunkt, nur den Rang, ab dem sie kommen können (EV_TEXT, Platzhalter).
const freiText=k=>{const e=FREI[k]; return e.ev?(EV_TEXT[k]||'irgendwann ab dem Rang {rang}').replace('{rang}',rangN(e.r)):e.tat?TAT_TEXT[e.tat]:e.ab?`${e.ab} Jahre nach dem Rang ${rangN(e.r)}`:`ab dem Rang ${rangN(e.r)}`};
// Monat jedes Aufstiegs (S.rangMon, Schlüssel ist der Rang). Springt jemand über einen Rang, gilt für beide derselbe Monat.
function rangMonMerk(von,zu){const M=S.rangMon=S.rangMon||{0:START_JAHR*12}; for(let i=von+1;i<=zu;i++) if(M[i]==null) M[i]=S.jahr*12+S.monat}
// Spielstände aus 13.1 und 13.2 ohne S.rangMon: aus S.zeitRang (Spieljahr des Aufstiegs) oder jetzt. Schon Freies kommt nicht noch einmal in den Winzerboten.
const boteArt=e=>!!(e.ab||e.tat||e.ev);
function altFrei(){if(!S.rangMon){const M=S.rangMon={0:START_JAHR*12}; for(let i=1;i<=S.rang;i++){const z=(S.zeitRang||[]).find(x=>x.r===i); M[i]=z?(START_JAHR+z.j-1)*12:S.jahr*12+S.monat}}
  if(!S.freiBote){S.freiBote={}; for(const k of Object.keys(FREI)) if(boteArt(FREI[k])&&FREI[k].bote&&frei(k)) S.freiBote[k]=1}}
// Was nach dem Abstand der Manager, als Ereignis oder verdient kommt, meldet der Winzerbote einmal (seit 14.4.2, vorher Abstand und Pflegestufe).
// Der Export hat zwei Zeilen: mit der Medaille bote, als Ereignis boteEv. Wer die Sektanlage schon gekauft hat, bekommt ihre Zeile nicht.
function freiBote(Z){const B=S.freiBote=S.freiBote||{}; for(const k of Object.keys(FREI)){const e=FREI[k]; if(boteArt(e)&&e.bote&&!B[k]&&frei(k)){B[k]=1; if(!(k==='sekt_anlage'&&S.sektAnlage)) Z.push(e.boteEv&&!(e.tat&&tatDa(e.tat))?e.boteEv:e.bote)}}}
// Seit 14.4.2: Taten, die nicht an einem Handgriff hängen. Sekt zählt, sobald die erste Flasche fertig im Sektkeller liegt (Annahme 19), jeden Monat vor dem Winzerboten geprüft.
// Seit 14.4.2: Die eigene Weinhandlung ist ein Ereignis (FREI.laden). Eigener Name, weil es in manchen Funktionen eine Variable frei gibt.
const ladenFrei=()=>frei('laden');
function tatenMonat(){if(!tatDa('sekt')&&S.lots.some(l=>l.sekt&&(l.status==='flasche'||l.status==='hefe'&&sektFertig(l)))) tatMerk('sekt')}
// Seit 13.5.1: Stufen der Erntehelfer und Lagerarbeiter (S.leuteSt). Die höchste freie Stufe zählt, sie bringt die fehlenden mit und fällt nie zurück.
// Mit Stufe 1 kommt der erste Mensch der Gruppe, wenn noch keiner da ist: eingestellt ohne Vermittlung, Lohn wie das Angebot des Monats.
const LEUTE_K=['helfer','lagerarb'];
function leuteSt(k){return (S.leuteSt||{})[k]||0}
// Seit 14.4.2 (einfache Fassung, die Leute zählen wie heute): Die Erntehelfer bekommen Stufe 1 mit dem Jungwinzer, der erste Erntehelfer kommt aber wie bis 14.2
// erst, wenn mehr als ALLEIN_HA Hektar bepflanzt sind und noch keiner da ist (bis 14.2 war das der Auslöser von helfer1). Annahme der Bau-Sitzung.
const leuteErstGebraucht=k=>k!=='helfer'||flaecheBep()>ALLEIN_HA;
function leuteErst(k,Z){S[k]=1; S.loehne[k].push(S.angebot[k]); S.loehne[k].sort((x,y)=>x-y); Z.push(LEUTE_ERST[k])}
function leuteKommen(Z){
  const L=S.leuteSt=S.leuteSt||{helfer:0,lagerarb:0};
  for(const k of LEUTE_K){
    let hoch=0; for(let n=1;n<=3;n++) if(frei(k+n)) hoch=n;
    while((L[k]||0)<hoch){const n=L[k]=(L[k]||0)+1;
      if(n===1&&!S[k]){if(leuteErstGebraucht(k)) leuteErst(k,Z); else S.leuteErstOffen=1}
      Z.push(LEUTE_BOTE[k][n-1])}
  }
  if(S.leuteErstOffen&&L.helfer>=1&&leuteErstGebraucht('helfer')){delete S.leuteErstOffen; if(!S.helfer) leuteErst('helfer',Z)}
}
// Seit 14.4.3: Name einer Stufe, bei den Erntehelfern Erntehelfer, Winzergesellen, Rebmeister, sonst "Lagerarbeiter Stufe 2".
const leuteStName=(k,n)=>(LEUTE_ST[k].stufen||[])[n-1]||`${LEUTE_ST[k].name} Stufe ${n}`;
const leuteBringt=i=>LEUTE_K.flatMap(k=>[1,2,3].filter(n=>FREI[k+n].r===i&&!FREI[k+n].ab&&!FREI[k+n].tat).map(n=>`${leuteStName(k,n)}: ${LEUTE_ST[k].kann[n-1]}`));
// Seit 13.5.1: Maschinen kommen über FREI (Schlüssel masch_ und der Typ).
// Seit 14.2.4 auch kein Laubschneider an der Mosel, dort gibt es den Sommerschnitt von Hand (Annahme 18).
const maschSteil=id=>R().steil&&MASCH[id]&&(MASCH[id].ernte||id==='laub');
const maschFrei=id=>frei('masch_'+id)&&!maschSteil(id), maschFreiText=id=>maschSteil(id)?'nie in der Steillage':freiText('masch_'+id);
const rolleDarf=(id,st)=>{const rl=id&&SORTEN[id]?SORTEN[id].rolle:null; return !rl||!WEIN_ROLLE[rl]||WEIN_ROLLE[rl].includes(st)};
// Seit 13.2.4: Rebschnitt von Hand. Kosten nach den Hektar der Sorte, möglich von Januar bis April, einmal im Jahr.
// Seit 14.2.4 nach der Erziehungsform (schnittHa), SCHNITT_HA bleibt der Wert des Flachbogens.
const schnittKosten=id=>Math.round(schnittHa(id)*(S.felder[id].reben||0)/HA_REBEN);
const schnittOffen=id=>{const f=S.felder[id]; return !!f&&f.reben>0&&S.monat<=SCHNITT_BIS&&f.schnitt!==S.jahr};
// Seit 14.2.3: Wer schneidet (wer 'chef' oder 'helfer'). f.schnittZ merkt den Zuwachs für die Entwicklungspunkte zum Jahreswechsel.
function schneide(id,wer='chef'){zahle(schnittKosten(id)); const f=S.felder[id]; f.schnitt=S.jahr; f.schnittWer=wer; f.schnittZ=zuwachsVon(wer)}
// Seit 14.2.4: Erziehungsform umstellen (Annahme 12). Punkte und Stufe fallen auf 0, die Reben bleiben. Es kostet einen Rebschnitt der neuen Form in der Erziehung.
// Annahme von Claude: Umstellen geht nur von Januar bis April und zählt als Rebschnitt des Jahres durch dich.
const formUmKosten=(id,form)=>Math.round(FORMEN[form].haErz*(S.felder[id].reben||0)/HA_REBEN);
function formUmstellen(id,form){const f=S.felder[id]; zahle(formUmKosten(id,form)); f.form=form; f.ep=0; f.pflSt=0; f.wild=0; f.schnitt=S.jahr; f.schnittWer='chef'; f.schnittZ=ZUWACHS.chef}
// Seit 14.2.4: Sommerschnitt von Hand (Annahme 18) für Weinberge ohne Maschine, im Juni, frei mit dem Laubschneider. Wirkung wie der Laubschneider (f.laub),
// das Ansehen gibt es einmal im Jahr (S.laubAns), auch wenn Hand und Maschine schneiden (Annahme von Claude).
const laubHandKosten=id=>Math.round(LAUB_HAND_HA*(S.felder[id].reben||0)/HA_REBEN);
// Seit 14.4.2 (Entscheidung 45): frei mit dem Winzermeister (laub_hand) und in jedem Weinberg, auch wo eine Maschine fahren darf. Wirkung wie seit 14.2.4.
// Seit 14.6.6 (Prüfregel E5): im Juni (S.monat 5), wie es Annahme 18 in 14.2, Annahme 34 in 14.5 und alle Texte sagen, bis 14.6.5 stand er im Juli.
// Der Laubschneider schneidet weiter beim Wechsel vom Juni in den Juli, seine Weinberge (laubMaschKommt) bleiben wie bisher bei ihm, nie doppelt.
const laubMaschKommt=id=>!!bonusMasch('laub')&&maschDarf(id);
const laubHandOffen=id=>{const f=S.felder[id]; return !!f&&f.reben>0&&S.monat===5&&frei('laub_hand')&&f.laub!==S.jahr&&f.menge>0&&!f.gelesen&&!laubMaschKommt(id)};
function laubAnsehen(){if(S.laubAns===S.jahr) return 0; S.laubAns=S.jahr; return ruhm(LAUB_ANS)}
function laubHand(id){const f=S.felder[id]; zahle(laubHandKosten(id)); f.laub=S.jahr; f.menge=Math.round(f.menge*(1+LAUB_MENGE)); return laubAnsehen()}
// Seit dem Nachtrag zu 14.5.2 (Annahmen 31 bis 34): Ausdünnen von Hand durch den Chef, je Weinberg, im August (AUSD_MONAT), frei am Gutsherrn (ausduennen).
// f.ausd merkt das Jahr: AUSD_QP Punkte für die Lese des Jahres (qualTeile), AUSD_MENGE weniger Menge, AUSD_HAND_HA Euro je Hektar. Leute dünnen erst ab 14.7 aus.
// ausdFrei steht für frei('ausduennen'), weil vBerg in oberflaeche.js eine eigene Zahl namens frei hat.
const ausdFrei=()=>frei('ausduennen'), ausdKosten=id=>Math.round(AUSD_HAND_HA*(S.felder[id].reben||0)/HA_REBEN);
const ausdOffen=id=>{const f=S.felder[id]; return !!f&&f.reben>0&&S.monat===AUSD_MONAT&&ausdFrei()&&f.ausd!==S.jahr&&f.menge>0&&!f.gelesen};
function ausduennen(id){const f=S.felder[id]; zahle(ausdKosten(id)); f.ausd=S.jahr; f.menge=Math.round(f.menge*(1-AUSD_MENGE))}
// Nachfrage nach Annahme 34: Welche offene Sommerarbeit dieses Monats bringt einem Weinberg die nächste Weinstufe, die der Rang schon erlaubt?
// Die Öchsle zählen nicht, nur der Anspruch (ANSPRUCH, seit 14.5.5 die Leiter des dritten Schlüssels wie bei der Anmeldung). Beerenauslese und Trockenbeerenauslese zählen mit ihrem Weg
// (weg_eigen, weg_tba), der Eiswein nicht, er hängt am Frost. Seit 14.7.4 (Annahmen 13 und 18) ist die Nachfrage die Stellung Chefsache im Einsatzplan:
// gefragt wird nur bei Weinbergen, deren Laubschnitt oder Ausdünnen nicht auf Automatik läuft (autoLaub, autoAusd). Dieselbe Rechnung (sommerLohnt) nimmt die Automatik.
// Einmal "ohne" gewählt, fragt das Spiel in diesem Monat nicht mehr (S.sommerGefragt). Meisterprüfung ohne Nachfrage (SOMMER_FRAGE).
const stufeRangDarf=st=>FREI['wein_'+st]?frei('wein_'+st):st==='ba'?frei('weg_eigen'):st==='tba'?frei('weg_tba'):false;
const naechsteStufe=(id,q)=>REIHE.find(st=>st!=='eis'&&rolleDarf(id,st)&&stufeRangDarf(st)&&ANSPRUCH[st]>q)||null;
// Bringt die Arbeit (art 'laub' oder 'ausd') diesem Weinberg die nächste Weinstufe, die der Rang erlaubt? Dann {vor, q, st}, sonst null.
function sommerLohnt(id,art){const vor=qualWb(id), q=qualTeile(id,{[art]:S.jahr}).q, st=naechsteStufe(id,vor); return st&&q>=ANSPRUCH[st]?{vor,q,st}:null}
function sommerFrage(){
  if(!SOMMER_FRAGE[S.schwer]||S.sommerGefragt===monatNr()) return [];
  const art=S.monat===5?'laub':S.monat===AUSD_MONAT?'ausd':null; if(!art) return [];
  const F=[]; for(const id of weinberge()){
    if(art==='laub'?!(laubHandOffen(id)&&!autoLaub(id)):!(ausdOffen(id)&&!autoAusd(id))) continue;
    const L=sommerLohnt(id,art); if(L) F.push({id,art,...L,kosten:art==='laub'?laubHandKosten(id):ausdKosten(id)});
  }
  return F;
}
// Seit 14.2.3: Zuwachs nach dem, der schneidet oder düngt (ZUWACHS). In den Lehrjahren zählt das Düngen immer voll (Annahme 13, boden=1).
const zuwachsVon=(wer,boden)=>boden&&S.schwer==='einfach'?1:wer==='helfer'?(ZUWACHS.helfer[leuteSt('helfer')]||0):ZUWACHS.chef;
// Seit 14.7.4 (Bauplan 14.7, Annahmen 8 bis 13): der Einsatzplan je Weinberg mit zwei Stellungen, Chefsache oder Automatik.
// Der Chef-Weinberg (f.schneider nicht 'helfer'): Rebschnitt und Düngen zusammen, dort macht der Chef beides selbst mit vollem Zuwachs. Auf Automatik ('helfer')
// schneiden und düngen die Erntehelfer mit dem Zuwachs ihrer Stufe (ZUWACHS). Ohne Erntehelfer gibt es keine Automatik, der Chef macht alles (Annahme 11).
// Bis 14.7.3 galt f.schneider nur für den Rebschnitt, gedüngt wurde fürs ganze Gut (S.duengWer, entfällt). In den Lehrjahren düngt der Chef seinen
// Chef-Weinberg seitdem selbst, die Automatik zählt dort beim Düngen voll (zuwachsVon mit boden, Annahme 12).
// Laubschnitt und Ausdünnen je Weinberg in f.plan.laub und f.plan.ausd, 'chef' (Chefsache, Voreinstellung, das Spiel fragt nach sommerFrage) oder 'auto'
// (Automatik: Winzergesellen machen den Laubschnitt, Rebmeister das Ausdünnen, nur wo es die nächste Weinstufe bringt, sommerLohnt). Kann die Stufe der Leute
// die Arbeit noch nicht, gilt Chefsache (planAutoKann). Bis der Weingut-Manager den Plan schreibt (planBeiMgr), sitzen die Schalter an der Arbeit im Weinberg,
// danach im Fenster Einsatzplan, im Weinberg steht dann nur eine Info-Zeile (Annahme 16).
const helferSchneidet=id=>helferKann(1)&&(S.felder[id]||{}).schneider==='helfer';
const helferDuengt=id=>helferSchneidet(id);
const planArt=(id,art)=>((S.felder[id]||{}).plan||{})[art]==='auto'?'auto':'chef';
const planAutoKann=art=>art==='laub'?helferKann(2):art==='ausd'?helferKann(3):helferKann(1);
const autoLaub=id=>planAutoKann('laub')&&planArt(id,'laub')==='auto';
const autoAusd=id=>planAutoKann('ausd')&&planArt(id,'ausd')==='auto';
const planBeiMgr=()=>aufgabeAktiv('plan');
// Chef-Grenze: CHEF_SCHNITT_MAX Weinberge je Winter schneidet der Chef selbst (seit 14.4.3 einer, bis 14.2 drei, also keine Grenze).
const chefSchnitte=()=>weinberge().filter(id=>{const f=S.felder[id]; return f.schnitt===S.jahr&&f.schnittWer!=='helfer'&&f.schnittWer!=='kauf'}).length;
// Seit 14.4.3 (Maiks Entscheidung zur Chef-Grenze, CHEF_RAT 'jung'): Der Chef ist einem Weinberg zugeteilt (f.schneider nicht 'helfer'), die Zuteilung bleibt stehen,
// bis der Spieler sie ändert. Die Regel: der Weinberg mit der niedrigsten Pflegestufe unter Grand Cru, bei Gleichstand der mit weniger Punkten (alle Grand Cru: der mit
// weniger Punkten). In den Lehrjahren teilt das Spiel still nach der Regel zu (neu nur, solange der Chef in diesem Winter noch nicht geschnitten hat), in den
// Gesellenjahren rät der alte Winzer dasselbe, in der Meisterprüfung gibt es keinen Rat. Sind mehr Weinberge beim Chef als erlaubt (zum Beispiel ein neu bepflanzter),
// bleibt der, den der Chef diesen Winter schon geschnitten hat oder den der Spieler zuletzt zugeteilt hat, die anderen gehen an die Leute (Annahme der Bau-Sitzung).
const chefKandidaten=()=>weinberge().filter(id=>(S.felder[id]||{}).reben>0);
const chefWeinberge=()=>chefKandidaten().filter(id=>S.felder[id].schneider!=='helfer');
function chefRegel(ids){ids=ids||chefKandidaten(); const P=id=>S.felder[id].pflSt||0, U=ids.filter(id=>P(id)<PFLEGE_STUFEN.length-1);
  return (U.length?U:ids).slice().sort((a,b)=>P(a)-P(b)||(S.felder[a].ep||0)-(S.felder[b].ep||0))}
// Seit 15.1.3 (Maik 25.11.2026, 16:43 Uhr, Bauplan 15.1 Annahme 2): Der Chef bleibt, bis der Spieler ihn umsetzt. Neu nach chefRegel nur, wenn sein Weinberg
// Grand Cru erreicht (solange es noch einen darunter gibt) oder wegfällt (gerodet, abgegeben, ohne Reben). Bis 15.1.2 galt jeden Winter neu die Regel, der Chef holte
// dadurch Punkte auf, und im nächsten Winter lag der andere vorn (Pfalz J45 bis J60 fast jedes Jahr ein Wechsel).
// chefBleibt: die Weinberge beim Chef, die bleiben dürfen, die ausdrücklich zugeteilten (schneider 'chef') zuerst. In den Lehrjahren zählt nur, was das Spiel
// ausdrücklich zugeteilt hat (vorher teilt es nach der Regel zu), sonst wie chefWeinberge auch ein Weinberg ohne Zuteilung. chefZiel: sie, aufgefüllt nach chefRegel.
function chefBleibt(){const K=chefKandidaten(), P=id=>S.felder[id].pflSt||0, gc=PFLEGE_STUFEN.length-1, unter=K.some(id=>P(id)<gc), st=chefStill();
  const C=K.filter(id=>(st?S.felder[id].schneider==='chef':S.felder[id].schneider!=='helfer')&&(P(id)<gc||!unter));
  return [...C.filter(id=>S.felder[id].schneider==='chef'),...C.filter(id=>S.felder[id].schneider!=='chef')].slice(0,CHEF_SCHNITT_MAX)}
function chefZiel(){const b=chefBleibt(); return [...b,...chefRegel().filter(id=>!b.includes(id))].slice(0,CHEF_SCHNITT_MAX)}
// Seit 14.7.4: je Spielstufe nach EINSATZ_RAT (Lehrjahre still, Gesellenjahre Rat, Meisterprüfung nichts), wie bisher nur mit CHEF_RAT 'jung'.
// Seit 15.1.3 rät der alte Winzer nach chefZiel: zum Weinberg des Chefs, solange er bleibt, sonst nach der Regel (gezeigt wird der Rat nur bei einem anderen Weinberg).
const chefStill=()=>CHEF_RAT==='jung'&&EINSATZ_RAT[S.schwer]==='still';
const chefRat=()=>CHEF_RAT==='jung'&&EINSATZ_RAT[S.schwer]==='rat'&&helferKann(1)&&chefKandidaten().length>CHEF_SCHNITT_MAX?chefZiel()[0]:null;
function chefNorm(){
  if(!S||!helferKann(1)) return;
  // Seit 15.1.3: Fällt der Chef-Weinberg weg (keine Reben mehr), geht seine Zuteilung an die Leute. Bis 15.1.2 blieb sie stehen, und neu bepflanzt war er wieder beim Chef.
  for(const id of weinberge()){const f=S.felder[id]; if(f&&!(f.reben>0)&&f.schneider==='chef') f.schneider='helfer'}
  const K=chefKandidaten(); if(!K.length) return;
  // Lehrjahre: still nach chefZiel (seit 15.1.3, bis 15.1.2 jeden Winter nach chefRegel).
  // Seit 15.1.3: Hat der Chef diesen Winter schon geschnitten, geht ein neuer Weinberg ohne Zuteilung (zum Beispiel die gekaufte Spitzenlage) an die Leute,
  // bis 15.1.2 zählte er bis zum nächsten Winter als zweiter Chef-Weinberg.
  if(chefStill()){if(chefSchnitte()){for(const id of K) if(S.felder[id].schneider!=='chef'&&S.felder[id].schneider!=='helfer') S.felder[id].schneider='helfer'; return} const z=chefZiel(); for(const id of K) S.felder[id].schneider=z.includes(id)?'chef':'helfer'; return}
  const C=chefWeinberge(); if(C.length<=CHEF_SCHNITT_MAX) return;
  const vorn=[...C.filter(id=>S.felder[id].schnitt===S.jahr&&S.felder[id].schnittWer!=='helfer'&&S.felder[id].schnittWer!=='kauf'),...C.filter(id=>S.felder[id].schneider==='chef'),...C];
  const bleibt=[...new Set(vorn)].slice(0,CHEF_SCHNITT_MAX); for(const id of C) if(!bleibt.includes(id)) S.felder[id].schneider='helfer'}
// Der Spieler teilt den Chef einem Weinberg zu: Der bisherige geht an die Leute. Zurück kommt, wer gegangen ist, für den Hinweis.
function chefZuteilen(id){const f=S.felder[id]; if(!f) return []; const alt=chefWeinberge().filter(x=>x!==id); f.schneider='chef';
  const weg=alt.slice(0,Math.max(0,alt.length+1-CHEF_SCHNITT_MAX)); for(const x of weg) S.felder[x].schneider='helfer'; return weg}
// Zuwachs beim Düngen eines Weinbergs in diesem Jahr: Schnitt über seine Düngungen (Annahme 6, seit 14.7.4 je Weinberg in f.duengZ).
// Ohne Düngung zählt der Zuwachs dessen, der dort gerade düngen würde (bis 14.7.3 voll, Annahme der Bau-Sitzung, damit Automatik nie mehr bringt als die Helfer).
const duengZuwachs=id=>{const D=(S.felder[id]||{}).duengZ||[]; return D.length?D.reduce((a,b)=>a+b,0)/D.length:zuwachsVon(helferDuengt(id)?'helfer':'chef',1)};
// Punkte, die ein Weinberg in einem guten Jahr bekäme, mit den heutigen Einstellungen (für die Anzeige).
const epJahrSoll=id=>epPlus(id,true,zuwachsVon(helferSchneidet(id)?'helfer':'chef'),zuwachsVon(helferDuengt(id)?'helfer':'chef',1));
const sorteSchild=(id,r)=>rolleVon(id)?`${rolleVon(id).name}: ${rolleVon(id).satz}`:eigText(eignung(id,r));
const sternZahl=(id,r)=>{const e=eignung(id,r); return e>=1?3:e>=.85?2:1};
const sternF=(id,r)=>[0,STERN_PREIS_1,STERN_PREIS_2,STERN_PREIS_3][sternZahl(id,r)];
// Seit 13.2.1: Die Punkte des Bodens kamen nur noch aus seiner Stufe (BODEN_ST_QP, bis 14.4), seit 14.5.2 gleitend aus den Bodenpunkten (qualBoden).
// Der Zustand wirkt weiter auf die Menge und füttert den Zähler: Ein Jahresschnitt ab BODEN_GUT ist ein gutes Bodenjahr.
const bodenText=b=>b>=BODEN_GUT?'sehr gut':b>=80?'gut':'zu mager, Nachdüngen hilft';
// Stufe zu einem Zählerstand: die höchste Schwelle, die der Zähler erreicht hat (Boden und ab 13.2.2 Rebpflege).
const stufeZu=(z,SW)=>{let s=0; for(let i=1;i<SW.length;i++) if(z>=SW[i]) s=i; return s};
// Seit 13.2.6: Satz für den Weinberg aus Stufe s und Zähler z, zum Beispiel "Rebstock, noch 3 gute Jahre bis Premier Cru". Wortlaut seit 13.8.
const stufeSatz=(s,z,SW,N)=>{if(s>=N.length-1) return `${N[s]}, höher geht es nicht`; const r=SW[s+1]-z; return `${N[s]}, in ${r} ${r===1?'gutem Jahr':'guten Jahren'} ${N[s+1]}`};
// Seit 13.8.6: Zeile im Winzerboten zur neuen Pflegestufe, beim ersten Mal je Partie mit Moment (S.gesch). Seit 13.8.7 kommt beim ersten Grand Cru
// jeder Rolle eine Feier, bei der Spitzen-Sorte nur ohne Terroir, sonst gleich der vollendete Weinberg (vollendetPruef).
// Seit 14.2.1: Bodenpunkte je Lage (S.bodenP) statt des Boden-Zählers. wbBodenP ist der Boden eines Weinbergs in Punkten, wbBoden seine Stufe.
// Seit 14.2.5 (Annahme 8): der nach Reben gewichtete Schnitt der Lagen, auf denen der Weinberg steht (lagenBelegung). Ohne Reben die Lage, auf die er käme,
// ohne id der einfache Hang. S.bodenSt merkt die höchste gemeldete Stufe aller Lagen, je Lage S.bodenStL.
const lageBodenP=lg=>(S.bodenP||{})[lg]||0, lageBoden=lg=>stufeZu(lageBodenP(lg),BODEN_SCHWELLE);
// Welche Reben auf welcher Lage stehen. Seit dem Nachtrag zu 14.5 (Maik 25.11.2026, jede Lage eine Sorte) eins zu eins: jede Sorte ganz auf ihrer Lage (lageVon),
// auch ein Rundungsrest. Bis dahin wurden die Reben zu deinen Gunsten über fremde Lagen verteilt. W je Sorte, T je Lage, alles in Reben, ohne die Spitzenlage.
// Ein Rest über dem Land der Lage zählt nicht (Maik 25.11.2026, 08:19 Uhr), lageKappen nimmt ihn zum Monatswechsel ganz weg, ohne Ausweichen auf andere Lagen.
function lagenBelegung(){const W={}, T={einfach:0,hoehe:0,sued:0}, frei={}; for(const lg of LAGE_REIHE) frei[lg]=Math.max(0,hangHa(lg)*HA_REBEN-(lg==='sued'?slFl():0));
  for(const id of R().sorten){const w=W[id]={einfach:0,hoehe:0,sued:0}, lg=lageVon(id), k=Math.min((S.felder[id]||{}).reben||0,frei[lg]); w[lg]=k; frei[lg]-=k; T[lg]+=k}
  return {W,T}}
function lageKappen(){const W=lagenBelegung().W; for(const id of R().sorten){const f=S.felder[id], k=W[id][lageVon(id)]; if(f&&(f.reben||0)>k) f.reben=k}}
// Boden eines Weinbergs: die Bodenpunkte seiner Lage, die Spitzenlage ihre eigenen (f.bodenP). Ohne id der einfache Hang. Seit dem Nachtrag zu 14.5 ohne Schnitt über Lagen.
function wbBodenP(id){if(!id) return lageBodenP('einfach'); if(istSL(id)) return (S.felder[id]||{}).bodenP||0; return lageBodenP(lageVon(id))}
// Seit 14.2.5 (Entscheidungen 38 und 41, Annahme 7): S.bodenFl merkt je Lage die größte bisher bepflanzte Fläche in Reben. Wächst die bepflanzte Fläche
// darüber, sinken die Punkte der Lage genau um den Anteil der neuen Fläche. Nachpflanzen auf gezählter Fläche und gekauftes Land ohne Reben kosten nichts.
function bodenVerduennen(){const T=lagenBelegung().T, F=S.bodenFl=S.bodenFl||{einfach:0,hoehe:0,sued:0}, P=S.bodenP=S.bodenP||{einfach:0,hoehe:0,sued:0};
  for(const lg of LAGE_REIHE) if(T[lg]>(F[lg]||0)){P[lg]=epRund((P[lg]||0)*(F[lg]||0)/T[lg]); F[lg]=T[lg]}}
// Zum Jahreswechsel (Entscheidungen 20 und 39): Im guten Bodenjahr bekommt jede bepflanzte Lage ihre BODEN_PUNKTE mal den Zuwachs dessen, der gedüngt hat (zd).
// Seit 14.7.4 (Annahme 10) je Weinberg: G[id] = {gut, zd} aus seinem eigenen Bodenschnitt und seinen Düngungen. Jede Lage trägt genau eine Sorte (lageVon).
function bodenJahr(G,Z){bodenVerduennen(); const T=lagenBelegung().T, P=S.bodenP, L=S.bodenStL=S.bodenStL||{};
  for(const id of R().sorten){const lg=lageVon(id), g=G[id]; if(g&&g.gut&&T[lg]>0) P[lg]=epRund(Math.min(BODEN_MAX,(P[lg]||0)+BODEN_PUNKTE[lg]*g.zd))}
  // Seit 14.4.4: Die Spitzenlage hat eigene Bodenpunkte (f.bodenP), sammelt wie der Südhang und wird durch Zukauf nicht verdünnt. Beim Terroir kommen Weinkenner und Presse.
  const sl=slFeld(); if(sl&&sl.reben>0){const k=slKenn(), g=G[k]||{}; if(g.gut) sl.bodenP=epRund(Math.min(BODEN_MAX,(sl.bodenP||0)+BODEN_PUNKTE.sued*g.zd)); const st=wbBoden(k);
    if(st>(sl.bodenSt||0)){sl.bodenSt=st; S.bodenSt=Math.max(S.bodenSt||0,st); Z.push(BODEN_LAGE_BOTE.replace('{lage}',SORTEN[k].name).replace('{stufe}',BODEN_STUFEN[st]));
      if(st>=BODEN_STUFEN.length-1) Z.push(SL_BOTE.terroir.replace('{lage}',SL_NAME).replace('{ans}',ruhm(SL_ANS_TERROIR)))}}
  for(const lg of LAGE_REIHE){const st=lageBoden(lg); if(st>(L[lg]||0)){L[lg]=st; S.bodenSt=Math.max(S.bodenSt||0,st); Z.push(BODEN_LAGE_BOTE.replace('{lage}',LAGEN[lg].kurz).replace('{stufe}',BODEN_STUFEN[st]))}}}
const wbBoden=id=>stufeZu(wbBodenP(id),BODEN_SCHWELLE);
const terroir=id=>wbBoden(id||rolleSorte('spitze'))>=BODEN_STUFEN.length-1;
function pflegeAuf(Z,id,st){
  const rl=rolleK(id), G=S.gesch=S.gesch||{};
  Z.push(PFLEGE_BOTE[st].replace('{sorte}',SORTEN[id].name));
  if(st===1&&rl==='menge'&&!G.rebstock){G.rebstock=S.jahr; Z.push(GESCH_TEXT.rebstock)}
  if(st===2&&!G.premier){G.premier=S.jahr; Z.push(GESCH_TEXT.premier)}
  if(st===3&&!G['gc_'+rl]){G['gc_'+rl]=S.jahr; if(!(rl==='spitze'&&terroir(id))) feierNachDazu({welt:'gc',k:rl,id})}
  // Seit 14.4.4: Grand Cru der Spitzenlage bringt einmal SL_ANS_GC Ansehen mit dem Besuch von Weinkennern und Presse.
  if(st===3&&istSL(id)&&!S.felder[id].gcAns){S.felder[id].gcAns=S.jahr; Z.push(SL_BOTE.gc.replace('{lage}',SL_NAME).replace('{ans}',ruhm(SL_ANS_GC)))}
  if(st===3&&rl==='spitze') vollendetPruef(Z);
}
function vollendetPruef(Z){
  // Seit 14.4.4 (Annahme 3): der erste Weinberg der Spitzen-Sorte, der Grand Cru mit Terroir ist, der große oder die Spitzenlage.
  const G=S.gesch=S.gesch||{}; if(G.vollendet) return;
  const id=weinberge().find(i=>rolleK(i)==='spitze'&&terroir(i)&&((S.felder[i]||{}).pflSt||0)>=PFLEGE_STUFEN.length-1); if(!id) return;
  G.vollendet=S.jahr; G.gc_spitze=G.gc_spitze||S.jahr; Z.push(GESCH_TEXT.vollendet); feierNachDazu({welt:'vollendet',id});
}
// Seit 13.8.7: Feiern, die warten (S.feierNach). Läuft schon eine Feier, etwa ein Aufstieg, kommt die nächste nach dem Anstoßen, sonst gleich nach dem Winzerboten.
function feierNachDazu(F){(S.feierNach=S.feierNach||[]).push(F)}
function feierNach(){if(!S.feier&&S.feierNach&&S.feierNach.length) S.feier=S.feierNach.shift(); return !!S.feier}
// Seit 13.8.6: Zeilen, die erst im nächsten Winzerboten stehen (S.boteNach), zum Beispiel das Glück bei der Auktion.
function nachBote(Z){if(S.boteNach&&S.boteNach.length){Z.push(...S.boteNach); S.boteNach=[]}}
function aukGlueck(){const G=S.gesch=S.gesch||{}; if(G.suedAuk) return; G.suedAuk=S.jahr; (S.boteNach=S.boteNach||[]).push(GESCH_TEXT.suedAuk)}
// Seit 13.8.7 (Maik 22.11.2026): Der Spielstand merkt je Akt, ob du Vater (v) oder Mutter (m) warst, beim Start und bei jeder Übergabe. Die Stimmen der Eltern nutzen es in 14.4.
// Alte Spielstände ohne S.eltern laden ohne Fehler, die Lücke bleibt leer.
function elternMerk(){(S.eltern=S.eltern||{})[genNr()]=frau()?'m':'v'}
const siegJh=()=>!!(S.amt&&S.amt.ehren&&S.amt.ehren.jh);
const kroneFeier=(K,wein)=>(KRONE_FEIER[K.k]||[]).map(x=>x.replace('{wein}',wein||'Dein Wein'));
function rbn(n){return num(Math.round(n*STOCK_F))}
const lohnF=n=>Math.round(n*LOHN_F/10)*10;
// Seit 11.4: mit Rollen in der Reihenfolge der Liste (Menge, Sekt, Spitze), die Eignung ist dort für alle 1. neu wie bei REG.
function sortenFolge(r,neu){r=r||S.region; return REG(r,neu).sorten.slice().sort((a,b)=>eignung(b,r)-eignung(a,r))}
function sorteAb(id,r){return SORTE_RANG[sortenFolge(r).indexOf(id)]??0}
function sorteFrei(id){return S.rang>=sorteAb(id)}
// Seit 12.1 (Maik 20.11.2026): sektRang heißt, der Rang reicht und die Karte Sektkeller ist zu sehen. Sekt machen (sektFrei) geht erst mit eigenem Sektkeller.
function sektRang(){return S.rang>=R_SEKT}
function sektFrei(){return sektRang()&&!!S.sektkeller}
function mgrG(b){return MGR_G[MGR_BEREICHE[b].w?1:0]}
function mgrSt(b){return ((S.manager||{})[b]||{}).stufe||0}
function mgrEintrag(b,st){return MANAGER.find(e=>e.bereich===b&&e.stufe===st)}
function mgrNaechste(b){return mgrEintrag(b,mgrSt(b)+1)}
function mgrAufgabe(k){return MANAGER.find(e=>e.aufgaben.includes(k))}
// aufgabeDa: Der Manager ist auf der Stufe, die die Aufgabe bringt. aufgabeAktiv: dazu ist ihr Schalter an.
function aufgabeDa(k){const e=mgrAufgabe(k); return !!e&&mgrSt(e.bereich)>=e.stufe}
// Die Aufgaben einer Stufe für die Anzeige: ohne Schädlinge fehlt das Spritzen (Liste der Stufen, Schalter, Vorstellung des Managers).
function mgrAufg(e){return e.aufgaben}
// Seit 14.7.5 (Bauplan 14.7, Annahmen 14 bis 16): Fassraum, Flaschen und das Einstellen (helfer und lager) haben statt des Aufgaben-Schalters die Chefsache (CS_AUFG).
function aufgabeAktiv(k){return aufgabeDa(k)&&(CS_AUFG[k]?!chefsache(CS_AUFG[k]):!!(S.manager[mgrAufgabe(k).bereich].an||{})[k])}
// Chefsache je Arbeit (Bauplan 14.7, Annahmen 14 bis 16): S.chefsache mit 1 (der Chef macht es selbst) oder 0 (Automatik), Voreinstellung CHEFSACHE_START.
// Keller: Keltern und Warten ab den Kellerhelfern, Abfüllen ab den Kellergesellen, Sekt ab dem Kellermeister (CS_STUFE). Kann die Stufe der Kellerleute die Arbeit
// noch nicht, macht sie der Chef ohne Schalter (Annahme 8). Einkauf (fass, flaschen) ab Stufe 2 des Weingut-Managers, Einstellen (leute) ab Stufe 3, vorher der Chef.
// Bis der Weingut-Manager kommt, sitzt der Schalter an der Arbeit, danach gesammelt bei ihm (csBeiMgr), an der Arbeit nur die Info-Zeile (CHEFSACHE_ZEILE).
// Sekt auf Automatik: Der Kellermeister nimmt die Hefezeit der Vorwahl (S.sektWahl, SEKT_REIFE oder HEFE_LANG). Lesen hat keinen Schalter (Annahme 17).
const CS_AUFG={fass:'fass',flaschen:'flaschen',helfer:'leute',lager:'leute'};
const CS_STUFE={keltern:1,abfuellen:2,sekt:3,warten:1};
const CS_ARBEIT=['keltern','abfuellen','sekt','warten','fass','flaschen','leute'];
const chefsache=k=>{const c=S.chefsache||CHEFSACHE_START; return (k in c?c[k]:CHEFSACHE_START[k])===1};
const csKann=k=>CS_STUFE[k]?lagerKann(CS_STUFE[k]):aufgabeDa(k==='leute'?'helfer':k);
const kellerMacht=k=>csKann(k)&&!chefsache(k);
const csBeiMgr=()=>mgrSt('weingut')>0;
const sektVorwahl=()=>S.sektWahl===HEFE_LANG?HEFE_LANG:SEKT_REIFE;
function csSetzen(k,w){if(!CS_ARBEIT.includes(k)) return; S.chefsache=Object.assign({},CHEFSACHE_START,S.chefsache||{}); S.chefsache[k]=w==='chef'?1:0}
function mgrLohn(){let s=0; for(const b in S.manager||{}) s+=(mgrEintrag(b,mgrSt(b))||{}).lohn||0; return s}
// Seit 11.5 (Teil C1): Bringt jeden Manager auf die Stufe, die der Rang erlaubt. Neue Aufgaben sind eingeschaltet, was die Stufe kostet, steht in e.kosten (im Spiel 0).
// Läuft beim Aufstieg, beim Laden alter Spielstände und zur Sicherheit vor der Arbeit der Manager. S.mgrNeu merkt je Bereich, wer sich noch vorstellen muss ({b, von, st}).
// Seit 13.5.1 über FREI (mgrK): Die höchste freie Stufe zählt, sie bringt die fehlenden mit, Manager fallen nie zurück.
const mgrK=e=>'mgr_'+e.bereich+e.stufe;
function mgrKommen(){
  const neu=[];
  for(const b of Object.keys(MGR_BEREICHE)){const E=MANAGER.filter(e=>e.bereich===b).sort((x,y)=>x.stufe-y.stufe), hoch=Math.max(0,...E.filter(e=>frei(mgrK(e))).map(e=>e.stufe));
  for(const e of E){
    if(e.stufe>hoch||mgrSt(b)>=e.stufe) continue;
    S.manager=S.manager||{}; const m=S.manager[e.bereich]=S.manager[e.bereich]||{stufe:0,an:{}};
    if(e.kosten) zahle(e.kosten);
    m.stufe=e.stufe; m.an=m.an||{}; for(const k of e.aufgaben) m.an[k]=1;
    neu.push(e);
    const q=S.mgrNeu=S.mgrNeu||[], x=q.find(x=>x.b===e.bereich); if(x) x.st=e.stufe; else q.push({b:e.bereich,von:e.stufe-1,st:e.stufe});
  }}
  return neu;
}
// Was ein Aufstieg bringt: die Freischaltungen des Rangs, höchstens drei. Seit 5.1 (Paket 10) steht der Kreditrahmen als eigener Satz dahinter (rahmenSatz), nur wenn er wächst.
// Seit 7.0 steht {sorte} für die Rebsorte, die mit dem Rang kommt, mit ihrem Namen im Gebiet.
// Seit 7.2 liefert bringtTeile die einzelnen Punkte für die Urkunde, bringt fügt sie für Zeitung und Rang-Karte zusammen.
// Seit 14.7.2 kommt nichts mehr mit Abstand (bis 14.7.1 abBringt und mgrBringt, zum Beispiel "in 3 Jahren die Handels-Managerin"), die Köpfe stehen als Stück in RAENGE.neu.
// Seit 14.4.8: zwei Teile nach dem Abschnitt Rangtexte, neu ("Neu für dich") und kauf ("Das darfst du jetzt kaufen oder einstellen").
// Die Leute und seit 14.7.2 auch die Köpfe nennt der Rangtext selbst (leuteBringt, mgrBringt und abBringt nicht mehr).
// Beim Verbandsvorstand und Vizepräsidenten hängt neu am Weg des Gebiets (R().weg: edel, frost, beide).
function rangTeile(i){const n=SORTE_RANG.indexOf(i), id=n>0&&S?sortenFolge()[n]:null, ri=RAENGE[i], nu=ri.neu||[], so=`die ${n===1?'zweite':'dritte'} Rebsorte${id?' '+SORTEN[id].name:''}`;
  const N=Array.isArray(nu)?nu:nu[S?R().weg:'edel']||[];
  // Seit 14.6.7 (Prüfregel F1): Ein Stück, das ein Ereignis nennt, steht erst, wenn es da ist, sonst das Stück ohne (RANG_EV_STUECK).
  const ev=t=>{const x=S&&S.rangMon?RANG_EV_STUECK.find(x=>x.t===t&&!frei(x.ev)):null; return x?x.ohne:t};
  return {neu:N.map(t=>ev(t).replace('{sorte}',so)),kauf:(ri.kauf||[]).slice()}}
function bringtTeile(i){const t=rangTeile(i); return [...t.neu,...t.kauf]}
// Seit 14.4.8: der Satz für Ehrung und Zeitung, "Neu für dich: … Das darfst du jetzt kaufen oder einstellen: …"
function rangSatz(i){const t=rangTeile(i); return `${RANG_KOPF.neu}: ${t.neu.join(', ')}.${t.kauf.length?` ${RANG_KOPF.kauf}: ${t.kauf.join(', ')}.`:''}`}
// Seit 13.5.8 kommt der Kellerausbau nicht mehr mit dem Rang (bis dahin kellerBringt), sondern mit dem ersten Wein der Stufe (kellerFrei).
function bringt(i){return bringtTeile(i).join(', ')}
// Version 8.2: der ganze Satzteil nach "bringt", beim Präsidenten "bringt dir den Sieg" statt "bringt: der Sieg".
function bringtSatz(i){return i===R_MAX?'bringt dir den Stuhl im Festsaal':`bringt: ${bringt(i)}`}
// Seit 11.5 (Teil B) hängt daran auch die neue Grenze fürs Land, wenn sie mit dem Rang wächst.
// Seit 14.4.8 ohne den Satz zum Besitz-Deckel je Rang, den gibt es für dich seit 14.4.5 nicht mehr (weicher Deckel je Lage).
function rahmenSatz(i){const r=RAENGE[i];return r.rahmen>RAENGE[i-1].rahmen?` Dein Kreditrahmen steigt auf ${eur(r.rahmen)}.`:''}
// Seit 15.1.4 mit dem Zuschlag je Gebiet (GEBIET_START_PLUS), r ist das Gebiet.
const startGeld=(s,r)=>((DIFF[s]||{}).geld||START_GELD)+(((GEBIET_START_PLUS[r]||{})[s])||0), bietF=()=>(DIFF[S.schwer]||{}).biet||1;
// Gibt es in dieser Partie Schädlingsjahre? Nur auf Stufen mit schaed:1 (Meisterprüfung). Daran hängen die Meldungen im Winzerboten und die Seiten im Weinkompendium.
const schaedAn=()=>!!(SCHAED_AN&&S&&(DIFF[S.schwer]||{}).schaed);
function genNr(){return S.gen||1}
// Seit 13.5.6: der Akt der Partie, eine Generation je Akt.
const aktNr=()=>clamp(genNr(),1,GEGNER_AKT.length);
function genJahr(n){return START_JAHR+GEN_JAHRE*n}
function erbRest(){const k=S.kredit; return k&&k.erb?Math.min(k.erb,k.rest):0}
function erbSchaetzung(){return Math.max(0,Math.round(vermoegen()*ERB_STEUER/100)*100)}
function exportArt(l){return l.sekt?'sekt':STUFEN[l.stufe].rang>=6?'edel':STUFEN[l.stufe].rang>=4?'spaet':'einfach'}
function exportStufen(){return frei('export')?clamp(S.rang-R_EXPORT+1,1,EXPORT_STUFEN):0}
function mTyp(ma){return MASCH[ma&&MASCH[ma.typ]?ma.typ:ma&&ma.gross?'gross':'klein']}
function pflegeF(z){return PFLEGE.find(p=>z>=p[0])[1]}
// Fahrer-Verteilung: erst die Erntemaschinen (die großen zuerst), dann die Bonus-Maschinen aus dem Rest. Die Abfüllanlage braucht einen Lagerarbeiter.
// h ist die Zahl der Erntehelfer (Vorgabe: die angestellten). Liefert alle Maschinen im Einsatz.
// Seit 14.6.8 (Maik 25.11.2026, Antwort zu D3): Eine Erntemaschine ohne Weinberg mit passender Form (bepflanzt) steht still und belegt keinen Fahrer, in allen
// Spielstufen. Passend nach der Maschinen-Regel (FORMEN.masch): Flachbogen jede Erntemaschine, Kordon nur der Vollernter, Einzelpfahl keine, an der Mosel keine.
// Bis 14.6.7 stand sie "im Einsatz" und band einen Fahrer. Die anderen Maschinen passen immer.
function maschFormReben(T){if(!T.ernte) return null; if(R().steil) return 0;
  return weinberge().reduce((a,id)=>{const f=S.felder[id], x=FORMEN[formVon(id)].masch; return a+(f&&f.reben&&(x===1||x==='voll'&&T===MASCH.gross)?f.reben:0)},0)}
// Seit 15.1.1 (Maik 25.11.2026, Bauplan 15.1 Annahme 1): Für den Laubschneider gilt dieselbe Regel. Er darf in einen Weinberg nach maschDarf (Flachbogen immer,
// Kordon nur mit dem Vollernter im Einsatz, Einzelpfahl nie, an der Mosel nie). Ohne bepflanzten Weinberg, in den er darf, steht er still und belegt keinen Fahrer,
// in allen Spielstufen. Bis 15.1.0 stand er "im Einsatz", band einen Fahrer und meldete im Juli einen Sommerschnitt ohne geschnittenen Weinberg.
// voll: ob ein Vollernter im Einsatz ist. Ohne Angabe nach der Verteilung der Erntemaschinen (ernteVerteilung), die den Laubschneider nicht braucht.
function laubFormReben(voll){if(R().steil) return 0; if(voll==null) voll=ernteVerteilung().E.some(m=>mTyp(m)===MASCH.gross);
  return weinberge().reduce((a,id)=>{const f=S.felder[id], x=FORMEN[formVon(id)].masch; return a+(f&&f.reben&&(x===1||x==='voll'&&voll)?f.reben:0)},0)}
const maschPasst=ma=>{const T=mTyp(ma); return T.ernte?maschFormReben(T)>0:T===MASCH.laub?laubFormReben()>0:true};
// Maschinen, die laufen können, sobald ihre Leute da sind: nicht ausgefallen und mit passendem Weinberg.
const maschBereit=ma=>ma.zustand>=MASCH_ROT&&maschPasst(ma);
// Seit 15.1.1 getrennt: erst die Erntemaschinen (die großen zuerst), sie hängen nicht an den anderen Maschinen. Liefert sie und die übrigen Erntehelfer.
function ernteVerteilung(h){
  let frei=h==null?S.helfer:h; const E=[];
  for(const ma of S.maschinen.filter(m=>mTyp(m).ernte&&maschBereit(m)).sort((a,b)=>mTyp(b).fahrer-mTyp(a).fahrer||b.zustand-a.zustand)){
    const n=mTyp(ma).fahrer; if(frei>=n){frei-=n; E.push(ma)}
  }
  return {E,frei};
}
function maschVerteilung(h){
  let {E,frei}=ernteVerteilung(h), lf=S.lagerarb||0; const voll=E.some(m=>mTyp(m)===MASCH.gross);
  for(const ma of S.maschinen.filter(m=>!mTyp(m).ernte&&m.zustand>=MASCH_ROT&&(mTyp(m)!==MASCH.laub||laubFormReben(voll)>0))){
    const T=mTyp(ma);
    if(T.leute==='lagerarb'){if(lf>=T.fahrer){lf-=T.fahrer; E.push(ma)}}
    else if(frei>=T.fahrer){frei-=T.fahrer; E.push(ma)}
  }
  return E;
}
// Erntemaschinen im Einsatz (nur sie lesen und zählen als Helfer).
function maschEinsatz(h){return maschVerteilung(h).filter(m=>mTyp(m).ernte)}
function maschHelfer(h){return maschEinsatz(h).reduce((a,m)=>a+mTyp(m).helfer,0)}
function maschErnte(){return S.maschinen.filter(m=>mTyp(m).ernte)}
// Die Bonus-Maschine dieses Typs, wenn sie im Einsatz ist, sonst null.
function bonusMasch(typ){const E=maschVerteilung(); return S.maschinen.find(m=>m.typ===typ&&E.includes(m))||null}
// Abnutzung einer Bonus-Maschine um p Prozentpunkte mal Pflege-Faktor nach dem Zustand vor dem Einsatz. Bruchteile sammelt ma.abn.
function abnutz(ma,p){ma.abn=(ma.abn||0)+p*pflegeF(ma.zustand); const d=Math.floor(ma.abn); if(d){ma.abn-=d; ma.zustand=Math.max(MASCH_MIN,ma.zustand-d)}}
// Maschinen, die nur wegen fehlender Leute stillstehen, und wie viele Fahrer (Erntehelfer) ihnen fehlen.
// Seit 14.6.8 ohne die Erntemaschinen ohne passenden Weinberg (maschBereit), seit 15.1.1 auch ohne den Laubschneider ohne passenden Weinberg, die brauchen keinen Fahrer.
function maschOhneFahrer(){const E=maschVerteilung(); return S.maschinen.filter(m=>maschBereit(m)&&!E.includes(m))}
function fahrerBedarf(){return S.maschinen.filter(m=>maschBereit(m)&&mTyp(m).leute==='helfer').reduce((a,m)=>a+mTyp(m).fahrer,0)}
function fahrerFehlen(){return Math.max(0,fahrerBedarf()-S.helfer)}
function maschName(ma){return `${mTyp(ma).name} ${S.maschinen.indexOf(ma)+1}`}
// Pronomen je Maschine: die Erntemaschine und die Abfüllanlage sind "sie", die anderen "er".
function maschEr(ma){return mTyp(ma).f?'sie':'er'}
function maschStatus(ma){const T=mTyp(ma); return ma.zustand<MASCH_ROT?`fällt aus, bis ${maschEr(ma)} gewartet ist`:!maschPasst(ma)?MASCH_FORM_TEXT.still:maschVerteilung().includes(ma)?'im Einsatz':T.leute==='lagerarb'?'steht still, es fehlt ein Kellermensch':'steht still, es fehlt ein Fahrer'}
function festArt(){return S.rang>=R_HOFFEST?'hoffest':S.rang>=R_WEINFEST?'weinfest':''}
// Seit 11.5 (Teil B): Deckel für den Besitz je Rang. Ohne HA_NEU gibt es für dich keinen, die Gegner halten dann bei GEGNER_HA_MAX.
// Seit 14.4.5 (Entscheidung 5): Für dich gibt es keinen Besitz-Deckel über alles mehr, an seine Stelle tritt der weiche Deckel je Lage (landDeckel). Die Gegner behalten ihren.
function haDeckel(r){return Infinity}
// Seit 14.4.7 (Entscheidung 70): der Deckel der Gegner an genau einer Stelle. GEGNER_DECKEL_AN 1: Besitz-Deckel je Rang (GEGNER_DECKEL), höchstens GEGNER_HA_OBEN,
// 0: nur die Obergrenze GEGNER_HA_OBEN. Ohne HA_NEU (Messläufe) wie bisher GEGNER_HA_MAX.
function gegnerDeckel(g){if(!HA_NEU) return GEGNER_HA_MAX; return GEGNER_DECKEL_AN?Math.min(GEGNER_DECKEL[Math.min(g.rang,GEGNER_DECKEL.length-1)],GEGNER_HA_OBEN):GEGNER_HA_OBEN}
// Die Regel in einem Satz, für die i-Texte im Rathaus.
// Seit 14.4.5: die Regel des weichen Deckels je Lage für deinen Rang, nur mit den Lagen, die bei den Auktionen schon kommen. Platzhalter, Wortlaut in Meilenstein 17.
function deckelSatz(){const z=AUK_LAGE.filter(x=>S.rang>=x.r).pop().w, L=LAGE_REIHE.filter(lg=>z[lg]>0).map(lg=>LAND_TEXT.lage.replace('{lage}',LAGEN[lg].kurz).replace('{s}',num(landSchwelle(lg))).replace('{d}',num(landDeckel(lg))));
  return LAND_TEXT.satz.replace('{f}',num(1+(S.rang<=LAND_FRUEH_BIS?LAND_AUFSCHLAG_FRUEH:LAND_AUFSCHLAG))).replace('{rang}',rangN(S.rang)).replace('{liste}',L.join(', '))}
// Seit 14.4.5 (Entscheidung 5, Annahme 6): weicher Deckel je Lage. Bis LAND_SCHWELLE Hektar Besitz in der Lage normaler Preis, darüber ein Aufschlag im Quadrat
// (Anteil des Wegs von der Schwelle zum Deckel, zum Quadrat, mal LAND_AUFSCHLAG, bis zum Rang LAND_FRUEH_BIS mal LAND_AUFSCHLAG_FRUEH), über LAND_DECKEL kein Kauf.
// Gezählt wird der Stand nach dem Kauf, der Aufschlag gilt für das ganze Los. Der Südhang zählt ohne die SPITZE_HA Hektar der Spitzenlage.
const landR=r=>Math.min(r==null?S.rang:r,LAND_DECKEL.einfach.length-1);
function landSchwelle(lg,r){return LAND_SCHWELLE[lg][landR(r)]}
function landDeckel(lg,r){return LAND_DECKEL[lg][landR(r)]}
function landBesitz(lg){return Math.round((hangHa(lg)-(lg==='sued'&&S.spitze?SPITZE_HA:0))*10)/10}
function landAufschlag(lg,haNach,r){const s=landSchwelle(lg,r), d=landDeckel(lg,r); if(haNach<=s) return 0; if(haNach>d+1e-9) return null;
  return ((r==null?S.rang:r)<=LAND_FRUEH_BIS?LAND_AUFSCHLAG_FRUEH:LAND_AUFSCHLAG)*Math.pow((haNach-s)/(d-s),2)}
// Preisfaktor für den Stand nach dem Kauf: Preisniveau der Lage mal (1 + Aufschlag), über dem Deckel Infinity.
function landPreisF(lg,haNach,r){const a=landAufschlag(lg,haNach,r); return a==null?Infinity:(AUK_PREIS_LAGE[lg]||1)*(1+a)}
// Wie viel Land in der Lage bis zum Deckel noch geht, am Südhang höchstens suedRest().
function landRest(lg){const x=Math.max(0,landDeckel(lg)-landBesitz(lg)); return lg==='sued'?Math.min(x,suedRest()):x}
// Faktor des Aufschlags für dich auf ein Los (1 ohne Aufschlag und bei der Spitzenlage) und dein Preis beim Zuschlag für ein Gebot x.
function aukAufF(a){a=a||S.auktion; if(!a||a.spitze) return 1; const lg=a.lage||'einfach', z=landAufschlag(lg,landBesitz(lg)+a.ha); return z==null?1:1+z}
function aukPreis(x,a){const F=aukAufF(a); return F===1?x:Math.round(x*F/500)*500}
// Was die Lage noch bringt: nach dem Aufstieg, erst bei einem späteren Rang oder nie mehr.
function landMehr(lg){const d=landDeckel(lg); for(let r=S.rang+1;r<RAENGE.length;r++) if(landDeckel(lg,r)>d) return r===S.rang+1?aufstiegFehlt():LAND_TEXT.spaeter.replace('{rang}',rangN(r)); return LAND_TEXT.ende}
// Zeichen am Los je Spielstufe (LAND_ZEIGE): in den Lehrjahren der Rat des alten Winzers, in den Gesellenjahren der Aufschlag in Prozent, in der Meisterprüfung nichts.
// Dazu überall dein Preis beim Zuschlag, sobald ein Aufschlag drauf ist. Platzhalter, Wortlaut in Meilenstein 17.
function aukZeichen(a,x){a=a||S.auktion; const F=aukAufF(a); if(F===1) return ''; const z=LAND_ZEIGE[S.schwer], T=[];
  if(z==='zahl') T.push(LAND_TEXT.auf.replace('{p}',num(Math.round((F-1)*100)))); if(z==='rat') T.push(F-1>=LAND_RAT_AB?LAND_RAT.teuer:LAND_RAT.geht);
  T.push(LAND_TEXT.preis.replace('{preis}',eur(aukPreis(x==null?a.gebot:x,a)))); return T.map(t=>t.replace(/\.$/,'')).join('. ')+'.'}
// Was zum nächsten Rang fehlt, als Satz für die Sperre am Deckel.
function aufstiegFehlt(){
  const n=RAENGE[S.rang+1]; if(!n) return LAND_TEXT.ende;
  const f=[], a=n.ans-S.ansehen, h=Math.round((n.ha-flaecheBep())*10)/10, v=n.verm-vermoegen();
  if(a>0) f.push(`${num(a)} Ansehen`); if(h>0) f.push(`${h.toLocaleString('de-DE')} Hektar bepflanzt`); if(v>0) f.push(`${eur(v)} Vermögen`);
  return f.length?`Mehr Land gibt es erst nach dem Aufstieg. Zum Rang ${rangN(S.rang+1)} fehlen dir noch ${f.join(', ').replace(/, ([^,]*)$/,' und $1')}.`:`Mehr Land gibt es nach dem Aufstieg zum Rang ${rangN(S.rang+1)}, der kommt mit dem nächsten Monat.`;
}
// Bei einer Auktion darf nur mitbieten, wessen Besitz samt dem ganzen Los unter den Deckel passt (leer = du darfst).
// Die Spitzenlage ist ausgenommen: Sie kommt nur einmal und darf den Deckel um ihre SPITZE_HA Hektar überschreiten (Annahme von Claude im Plan für 11.5).
// Seit 13.4.9: Los mit Lage für die Texte, zum Beispiel "2 Hektar kühle Höhenlage". Alte Lose ohne Lage sind einfacher Hang.
const losLage=a=>LAGEN[(a&&a.lage)||'einfach'], losText=a=>`${a.ha}\u00a0Hektar ${losLage(a).name}`;
function hangZeile(){return LAGE_REIHE.filter(lg=>hangHa(lg)>0).map(lg=>`${LAGEN[lg].sym} ${String(hangHa(lg)).replace('.',',')}\u00a0ha`).join(' · ')||'kein Land'}
// Seit 14.4.5: Der Deckel gilt je Lage (landDeckel), gezählt wird dein Besitz in der Lage des Loses. Platzhalter, Wortlaut in Meilenstein 17.
function aukDeckel(a){a=a||S.auktion; if(!a||a.spitze) return ''; const lg=a.lage||'einfach', b=landBesitz(lg), d=landDeckel(lg); if(b+a.ha<=d+1e-9) return '';
  return `${b>=d?`Du hast ${num(b)}\u00a0Hektar ${LAGEN[lg].name}`:`Mit diesem Los hättest du ${num(b+a.ha)}\u00a0Hektar ${LAGEN[lg].name}`}, als ${rangN(S.rang)} darfst du dort höchstens ${d} besitzen. ${landMehr(lg)}`}
// Der Makler verkauft, wenn der Spieler den Rang hat, dieses Jahr noch Land für ihn da ist (maklerHa) und ihm für den nächsten Rang allein noch Land fehlt.
// S.maklerN zählt die Hektar im Jahr S.maklerJahr. Alte Spielstände kennen nur das Jahr, dort zählt es als ein Hektar.
function maklerHa(){return HA_NEU?MAKLER_HA[S.rang]||1:1}
function maklerDiesJahr(){return S.maklerJahr===S.jahr?S.maklerN||1:0}
function maklerGrund(){if(S.rang<R_MAKLER) return `Der Makler arbeitet erst für dich ab dem Rang ${RAENGE[R_MAKLER].name}.`; const mh=maklerHa(); if(maklerDiesJahr()>=mh) return `Dieses Jahr hat er dir schon ${mh>1?mh+'\u00a0Hektar':'einen Hektar'} verkauft. Nächstes Jahr wieder.`; const n=RAENGE[S.rang+1]; if(!n||S.ha>=n.ha) return 'Für den nächsten Rang hast du genug Land, da verkauft er dir nichts.'; if(landRest('einfach')<1) return `Als ${rangN(S.rang)} darfst du am einfachen Hang höchstens ${landDeckel('einfach')} Hektar besitzen. ${landMehr('einfach')}`; if(S.ansehen<n.ans||vermoegen()<n.verm) return 'Dir fehlt für den nächsten Rang nicht nur Land. Erst wenn Ansehen und Vermögen reichen, verkauft er dir einen Hektar.'; return ''}
// Sein Angebot je Rang als Satzteil: "ab Jungwinzer 1 Hektar im Jahr, ab Weingutsbesitzer 2, ab Verbandsvorstand 3".
function maklerStaffel(){const T=[]; for(let i=R_MAKLER;i<R_MAX;i++) if(i===R_MAKLER||MAKLER_HA[i]!==MAKLER_HA[i-1]) T.push(`ab ${RAENGE[i].name} ${MAKLER_HA[i]}${T.length?'':' Hektar im Jahr'}`); return T.join(', ')}

const rnd=(a,b)=>a+Math.random()*(b-a), rint=(a,b)=>Math.floor(rnd(a,b+1)), clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// Seit 11.6 "Schummeln verboten" (Maik 20.11.2026): festes Wetter je Partie. S.zf ist die Startzahl der Partie, fest() macht daraus mit Thema, Nummer, Jahr und Monat
// immer dieselbe Zahl zwischen 0 und 1 (Rechnung wie zufallH in _h.js). Neu laden ändert Wetter, Kälteeinbruch, Vorhersage und Weinberg also nicht.
// Themen: 1 Wetter, 2 Kälteeinbruch (ruht seit 13.4.2), 3 Vorhersage, 4 Edelfäulnis (ruht seit 13.4.2), 5 Öchsle-Streuung, 6 Ertrag, 7 Reben-Sterben, 8 Temperatur,
// 9 Schädlinge (Plan), 10 Schädlinge (Schaden), 11 Herbst-Wagnis (seit 13.4.2), 12 Jahrhundertjahre, 13 Verschiebung beim Wagnis (seit 13.7.1). nr trennt Sorten und Würfe im selben Monat.
// Die Startzahl entsteht über Math.random, damit Messläufe mit festem Zufall wiederholbar bleiben. Ohne Startzahl würfelt fest() wie früher.
const zfNeu=()=>Math.floor(Math.random()*4294967296)|0;
function fest(thema,nr,jahr=S.jahr,monat=S.monat){
  if(!S||S.zf==null) return Math.random();
  let a=(S.zf^Math.imul(jahr*12+monat+1,0x9E3779B1)^Math.imul(thema*131+(nr||0)+1,0x85EBCA6B))|0;
  a=a+0x6D2B79F5|0;
  let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;
  return ((t^t>>>14)>>>0)/4294967296;
}
const festR=(a,b,u)=>a+u*(b-a), festI=(a,b,u)=>Math.floor(festR(a,b+1,u));
const num=n=>Math.round(n).toLocaleString('de-DE'), eur=n=>num(n)+'\u00a0€';
const eur2=n=>n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+'\u00a0€';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const misch=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rint(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const neuStart=()=>({name:'',ich:'',anrede:'m',region:'mosel',gegner:3,schwer:'mittel',fu:'1'});
let S=null, TAB='gut', SUB='betrieb', NEU=neuStart(), SLOT=0, START=null, ZIEL=0;
// Große Beträge ab einer Million kurz, damit die Statusleiste nie überläuft.
const geldKurz=b=>Math.abs(b)>=1e6?(b/1e6).toLocaleString('de-DE',{maximumFractionDigits:2})+'\u00a0Mio.\u00a0€':eur(b);
// Punkte an den Reitern: rot bei Dringendem aus "Das steht an", gelb bei allem anderen. Seit 12.6.2 kommt grün für den Weg der offenen Blase dazu (fuPunkt).
// Seit 7.9 gibt es drei Arten: Rot (rot:1) hält das Weiterblättern an, Gelb zeigt nur den Punkt, Hinweise (ruhig:1) bekommen keinen Punkt.
function badges(){const B={}, A=aufgaben(); if(ladenPunkt()) A.push({tab:'stadt',sub:'laeden'}); for(const a of A){if(!a.tab||a.ruhig) continue;for(const k of [a.tab,a.tab+'/'+(a.sub||START_SUB[a.tab])]) B[k]=B[k]==='rot'||a.rot?'rot':'neu'}return B}
// Seit 7.9: gelber Punkt am Weinhandel, wenn eine Weinhandlung diesen Monat einen deiner Weine nimmt (ab Kabinett oder Sekt) oder dein eigenes Regal Wein brauchen kann.
// Er verschwindet, sobald die Seite einmal offen war (S.ladenSeh), und kommt im nächsten Monat wieder. Was der Handels-Manager erledigt, bekommt keinen Punkt.
function ladenPunkt(){
  if(S.ladenSeh===S.jahr*12+S.monat) return false;
  const fremd=!aufgabeAktiv('laeden')&&Object.keys(S.laeden||{}).some(r=>S.laeden[r].rest>0&&S.lots.some(l=>ladenPasst(l,r)));
  return fremd||(ladenFrei()&&!aufgabeAktiv('regal')&&S.lots.some(ladenOk));
}
// Wechselt den Hauptreiter. Ohne Unterreiter geht es zur Startansicht des Hauptreiters.
function geh(tab,sub){TAB=tab; SUB=sub||START_SUB[tab]||SUB}
// Ehrungen für das Büro: Medaillen und Aufstiege. a=1 kennzeichnet einen Aufstieg, x ist ein Zusatz für die Infoseite (was die Ehrung bringt).
// S.ehrZeig zählt, wie viele Ehrungen die Infoseite schon gezeigt hat. Neue blendet sie beim nächsten Monatswechsel ein.
// Seit 7.2 merkt sich ein Aufstieg seinen Rang in r, für die Urkundenwand im Büro.
function ehre(i,t,a,x,r){(S.ehrungen=S.ehrungen||[]).push({i,t,a:a?1:0,j:S.jahr,m:S.monat,x:x||'',...(r!=null?{r,n:S.ich||'',w:frau()?1:0}:{})})}

// Drei Speicherplätze. Der frühere einzige Spielstand liegt auf Platz 1. SLOT ist der Platz, auf dem gerade gespielt wird.
// START='neu' zeigt das Formular für ein neues Spiel, sonst kommt ohne laufendes Spiel die Liste der Spielstände.
const gueltig=o=>!!(o&&typeof o==='object'&&o.v===1&&o.felder&&typeof o.felder==='object'&&Array.isArray(o.lots)&&REGIONEN[o.region]
  &&typeof o.name==='string'&&Number.isFinite(o.geld)&&Number.isInteger(o.jahr)&&Number.isInteger(o.monat)&&o.monat>=0&&o.monat<12
  &&o.lots.every(l=>l&&typeof l==='object'&&SORTEN[l.sorte]&&Number.isFinite(l.liter))&&(o.gegner==null||Array.isArray(o.gegner)));
// Fremde Spielstände: spitze Klammern fliegen aus allen Texten, Bildnamen dürfen nur Buchstaben, Ziffern und Striche haben.
function saeubern(x,k){
  if(typeof x==='string') return k==='bild'&&!/^[\w-]*$/.test(x)?'':x.replace(/[<>]/g,'');
  if(Array.isArray(x)) return x.map(v=>saeubern(v));
  if(x&&typeof x==='object'){for(const q of Object.keys(x)) x[q]=saeubern(x[q],q); return x}
  return x;
}
function save(){try{localStorage.setItem(KEYS[SLOT],JSON.stringify(S));localStorage.setItem(SLOT_KEY,SLOT)}catch(e){}}
function roh(i){try{const o=JSON.parse(localStorage.getItem(KEYS[i])||'null');return gueltig(o)?o:null}catch(e){return null}}
// Seit 14.2.1: Marke v14. Stände ohne sie (auch aus 13.1 bis 13.8) werden nicht berücksichtigt, nur freundlich abgewiesen (Entscheidung 22).
// Seit 14.4.1 (Annahme 17 im Bauplan 14.4): Marke v144. Stände aus 14.2 (nur v14) werden genauso abgewiesen, Album und Bestenliste bleiben.
// Seit 14.5.1 (Annahme 30 im Bauplan 14.5): Marke v145. Stände aus 14.4 (nur v144) werden genauso abgewiesen.
// Seit 14.7.1 (Annahme 31 im Bauplan 14.7): Marke v147. Stände aus 14.5 (nur v145) werden genauso abgewiesen.
function lies(i){const o=roh(i);return o&&o.v147?o:null}
function liesAlt(i){const o=roh(i);return o&&!o.v147?o:null}
// Übernimmt einen gelesenen Spielstand und bringt alte Stände auf den heutigen Stand.
function nimm(o){S=o;if(S.zf==null)S.zf=zfNeu();if(S.helfer==null)Object.assign(S,{helfer:1,lagerarb:1,maschinen:[],kredit:null,mahnung:0,pleite:false});if(!S.gegner)etappe3(2,'mittel');if(!S.kontr)S.kontr={in:rint(24,48),scharf:0};altRang();altEdel();lohnAbgleich();altEhrungen();altMasch();altDoppelt();altSpende();altKeller();altZeit();altAmt();if(!S.fu)S.fu=fuAlt(); else fuPaketB(); altKomp(); altAns(); altLeute(); altRuf(); altSchaed(); altSekt(); altFrei(); altHefe(); altJh(); altSchau(); altHang()}
// Seit 8.3: Spielstände ohne Uhr fangen bei 0 an und merken sich, dass sie erst seit 8.3 zählen.
// Seit 8.5: Kellermeister Stufe 1 keltert statt abzufüllen. Hatte ein alter Spielstand auf Stufe 1 das Abfüllen an, ist jetzt das Keltern an.
// Version 12.1 (Maik 20.11.2026): Alte Spielstände ab Winzer bekommen den Sektkeller geschenkt (Bestandsschutz), mit einer Zeile im Winzerboten (sektBote).
// Der Kellermeister macht Sekt seit 12.1 schon auf Stufe 1. Wer ihn dort hat, bekommt die Aufgabe eingeschaltet dazu. Neue Spiele haben v121 von Anfang an.
function altSekt(){if(S.v121) return; if(S.rang>=R_SEKT){S.sektkeller=1; S.sektkellerAlt=1} const m=(S.manager||{}).keller; if(m&&m.stufe===1){m.an=m.an||{}; if(!('sekt' in m.an)) m.an.sekt=1} S.v121=1}
// Seit 12.2: Das Geschenk für alte Spielstände ist ein Artikel mit Timos Bild statt einer Zeile unter "Kurz gemeldet".
function sektBote(Z){if(!S.sektkellerAlt) return; delete S.sektkellerAlt; schlag(60,'🍾 Neu im Keller: der Sektkeller',`Sekt gibt es ab jetzt nur noch mit eigenem Sektkeller. Deiner steht schon, als Geschenk für alle, die schon ${anr('Winzer','Winzerin')} sind.${S.lots.some(l=>l.sekt)?' Dein Sekt im Keller reift weiter wie bisher.':''}`,'sektkeller',{foto:1})}
// foto:1 zeigt das Bild auch dann, wenn schon ein anderer Artikel sein kleines Foto hat (zum Beispiel zwei Maschinen im selben Monat).
function kaufBote(){for(const a of S.boteKauf||[]) schlag(60,a.t,a.text,a.bild,{foto:1}); delete S.boteKauf}
const boteMerk=(t,text,bild)=>(S.boteKauf=S.boteKauf||[]).push({t,text,bild});
function altKeller(){if(S.v83) return; const m=(S.manager||{}).keller; if(m&&m.stufe===1&&m.an&&m.an.flaschen) m.an.keltern=1; S.v83=1}
// Seit 11.5 (Teil A): Alles Ansehen ist verdoppelt. Alte Spielstände verdoppeln einmal das Ansehen des Spielers und der Gegner, dazu die Zahlen in Chronik,
// Übergabe und Spielende, damit alles im selben Maß steht. Die Texte der Ehrungen bleiben als Geschichte stehen. S.ansV merkt sich, dass das passiert ist.
function altAns(){if(S.ansV) return; S.ansehen=Math.round((S.ansehen||0)*2); for(const g of S.gegner||[]) g.ansehen=(g.ansehen||0)*2;
  for(const c of S.chronik||[]) if(c.ans!=null) c.ans*=2; if(S.erbe){if(S.erbe.ans!=null) S.erbe.ans*=2; if(S.erbe.ansVor!=null) S.erbe.ansVor*=2}
  if(S.ende&&S.ende.stand&&S.ende.stand.ans!=null) S.ende.stand.ans*=2; S.ansV=1}
// Seit 11.5 (Teil C1): neue Leute-Regel. Alte Spielstände kürzen einmal ihre Lohnliste auf den neuen Bedarf, die teuersten gehen zuerst, niemand bekommt eine Abfindung.
// Es bleiben die Fahrer der Maschinen, der Bediener der Abfüllanlage und, solange Trauben hängen, wer für Lese und Handlese gebraucht wird.
// Manager, die der Rang erlaubt und die noch fehlen, kommen dazu und stellen sich vor (mgrKommen). S.leuteNeu trägt die Zahlen in den nächsten Winzerboten, S.leuteV merkt, dass es passiert ist.
function altLeute(){
  if(S.leuteV) return; S.leuteV=1;
  // Teil C2: Löhne aus alten Spielständen (LOHN_ALT, 200 bis 500 €) wandern auf die neue Spanne, wer günstig war, bleibt günstig. Das Angebot des Monats wird neu gewürfelt.
  if(S.loehne){const [a,b]=LOHN_ALT; for(const k of LOHN_ARTEN) S.loehne[k]=(S.loehne[k]||[]).map(n=>n<1000?lohnF(LOHN_MIN+(clamp(n,a,b)-a)*(LOHN_MAX-LOHN_MIN)/(b-a)):n).sort((x,y)=>x-y); neuesLohnAngebot()}
  if(S.ende||S.pleite) return;
  const haengt=weinberge().map(id=>S.felder[id]).filter(f=>f&&f.menge>0&&!f.gelesen), reben=rebenGesamt();
  const fahrer=fahrerBedarf(), hand=Math.max(0,...haengt.filter(handFeld).map(handBedarf));
  const lese=h=>alleinReben()+h*HELFER_LEISTUNG+maschEinsatz(h).reduce((a,m)=>a+Math.round(mTyp(m).leist*m.zustand/100),0);
  let h=0, l=0;
  while(S.helfer>0&&S.helfer-1>=fahrer&&helferReben(S.helfer-1)>=reben&&(!haengt.length||(S.helfer-1>=hand&&lese(S.helfer-1)>=reben))){S.helfer--; S.loehne.helfer.pop(); h++}
  const bed=Math.max(lagerBedarf(),S.maschinen.some(x=>mTyp(x).leute==='lagerarb'&&x.zustand>=MASCH_ROT)?1:0);
  while(S.lagerarb>bed){S.lagerarb--; S.loehne.lagerarb.pop(); l++}
  S.leuteNeu={h,l,m:mgrKommen().length};
}
function altZeit(){if(S.zeit==null){S.zeit=0; S.zeitAb=monatNr(); S.zeitAlt=1; S.zeitRang=[]}}
// Seit 8.2: doppelte Weine aus älteren Spielständen (geteilt fürs Regal, dann wieder rausgenommen) wieder zusammenlegen.
function altDoppelt(){for(const l of S.lots.slice()) if(l.status==='flasche'&&S.lots.includes(l)) weinZusammen(l)}
// Seit 8.0: Maschinen aus älteren Spielständen bekommen ihren Typ (vorher gross:1 oder nichts), sonst bleibt alles, wie es war.
// Seit 13.5.9 (Nachtrag 3): Von Maschinen mit eins (die Erntemaschine) bleibt nur eine, die mit dem besten Zustand. Die übrigen gehen ohne Erlös (Annahme von Claude).
function altMasch(){for(const ma of S.maschinen||[]) if(!MASCH[ma.typ]){ma.typ=ma.gross?'gross':'klein'; delete ma.gross}
  for(const [id,T] of Object.entries(MASCH)) if(T.eins){const A=(S.maschinen||[]).filter(x=>x.typ===id); if(A.length>1){const b=A.reduce((x,y)=>y.zustand>x.zustand?y:x); S.maschinen=S.maschinen.filter(x=>x.typ!==id||x===b)}}}
// Seit 13.5.9: Von Bonus-Maschinen und der Erntemaschine gibt es je Betrieb nur eine.
const maschEins=id=>!!(MASCH[id]&&(MASCH[id].bonus||MASCH[id].eins));
// Alte Spielstände mit sechs Rängen: Rang des Spielers und der Gegner auf die zehn Stufen umrechnen. S.v3 merkt sich, dass das passiert ist.
function altRang(){if(S.v3) return; S.rang=RANG_ALT[S.rang]||0; for(const g of S.gegner) g.rang=RANG_ALT[g.rang]||0; S.v3=1}
// Alte Spielstände: Die Werbung gibt es nicht mehr. Die Ehrungen fürs Büro entstehen aus den Medaillen der Weine im Keller und dem Rang.
function altEhrungen(){
  delete S.werbung;
  if(!S.ehrungen){
    S.ehrungen=[];
    for(const l of S.lots) for(const m of l.med||[]){const k=String(m).indexOf(' '); S.ehrungen.push({i:m.slice(0,k),t:`${m.slice(k+1)}: ${lotName(l)}`,a:0})}
    if(S.rang>0) S.ehrungen.push({i:'🎖️',t:`Rang ${RAENGE[S.rang].name} erreicht`,a:1});
  }
  if(S.ehrZeig==null) S.ehrZeig=S.ehrungen.length;
  // Eiswein gab es früher auch aus "reife und überreife". Schon gelesene Trauben behalten ihre Chance.
  for(const l of S.lots) if(l.eis&&!l.stufe&&l.leseart==='alles') l.leseart='reif';
}
function load(){try{SLOT=clamp(+localStorage.getItem(SLOT_KEY)||0,0,2);const o=lies(SLOT);if(o)nimm(o)}catch(e){S=null}}
// Spielstand aus einer Datei auf einen leeren Platz legen. Die Datei ist fremder Inhalt und wird nur als Daten gelesen.
function dateiLaden(text,i){
  let o=null; try{o=JSON.parse(text)}catch(e){}
  if(lies(i)) return meldung('Das hat nicht geklappt','Der Speicherplatz ist schon belegt.');
  if(!gueltig(o)) return meldung('Das hat nicht geklappt','Die Datei ist kein Spielstand von 150 Grad Öchsle.');
  if(!o.v147) return meldung('Das geht leider nicht',ALT_SATZ);
  o=saeubern(o);
  // Seit 11.3: Die Sicherung trägt das Album mit (Maik 19.11.2026). Es gehört nicht in den Spielstand und geht ins Album des Geräts.
  const alb=o.album; delete o.album;
  // Seit 13.7.7: Die Freischaltung der Meisterprüfung reist mit, wie das Album. Sie kommt aufs Gerät, nicht in den Spielstand.
  const mst=o.meister===1; delete o.meister;
  try{localStorage.setItem(KEYS[i],JSON.stringify(o))}catch(e){return meldung('Das hat nicht geklappt','Der Speicher des Browsers ist voll.')}
  const mit=kompAlbumNimm(alb), mf=(mst||meisterStand(o))&&meisterFreiSetz();
  render(); meldung('Geladen',`${o.name} liegt jetzt auf Spielstand ${i+1}.${mit?' Dein Album aus der Datei ist mit dabei.':''}${mf?` Die ${DIFF[MEISTER_STUFE].name} ist jetzt frei.`:''}`);
}

try{Object.assign(TON,JSON.parse(localStorage.getItem(TON_KEY)||'{}'))}catch(e){}
if(TON.musik===true) TON.musik='kurz'; if(TON.musik===false) TON.musik='aus';
if(!['an','kurz','aus'].includes(TON.musik)) TON.musik='kurz';
if(!(TON.laut>=0&&TON.laut<=100)) TON.laut=50;
if(!(TON.fxLaut>=0&&TON.fxLaut<=100)) TON.fxLaut=100;
// Startet einen Abspieler. Das Ergebnis ist false, wenn der Browser das Abspielen verweigert.
function spiel(el){try{const p=el.play(); return p&&p.catch?p.catch(()=>false):Promise.resolve()}catch(e){return Promise.resolve(false)}}
function laut(s){const x=s.v*TON.laut/100; if(s.g) s.g.gain.value=x; else s.el.volume=x}
// Mischer, läuft alle TAKT ms: schiebt jede Lautstärke ein Stück auf ihr Ziel zu, hält stumme Abspieler an und blendet am Ende eines Stücks zum Anfang über.
function mischer(){
  for(const n in MSP){
    const P=MSP[n];
    for(const s of P.s) if(s){
      if(s.v!==s.z){const d=TAKT/1000/s.dt; s.v=s.z>s.v?Math.min(s.z,s.v+d):Math.max(s.z,s.v-d); laut(s)}
      if(s.v===0&&s.z===0&&!s.el.paused) s.el.pause();
    }
    const a=P.s[P.akt], el=a.el;
    if(P.ende&&performance.now()>P.ende){P.ende=0; a.z=0; a.dt=KURZ_BLENDE}
    if(n===MORT&&!P.fest&&!P.ende&&a.z===1&&el.duration&&el.currentTime>el.duration-KREIS){
      const b=P.s[1-P.akt]||(P.s[1-P.akt]=stimme(n));
      try{b.el.currentTime=0}catch(e){}
      a.z=0; b.z=1; a.dt=b.dt=KREIS; P.akt=1-P.akt;
      // Darf der zweite Abspieler nicht starten (manche iPhones), läuft der erste einfach von vorn weiter.
      spiel(b.el).then(ok=>{if(ok===false){P.fest=true; if(P.s[P.akt]===b){b.z=0; a.z=1; P.akt=1-P.akt}}});
    }
  }
}
// Version 7.8: Neu gestellt wird auch, wenn dasselbe Stück von voller Länge auf kurz wechselt (zum Beispiel vom Kaufvertrag ins Weingut).
function musikOrt(name){const k=name+(musikVoll(name)?'!':''); if(k!==MKEY){MKEY=k; MORT=name; musikStell(true)}}
// Stücke in voller Länge auch bei der Stellung kurz: Spielstart, Feier, Fenster mit eigenem Stück, Beförderung, Wettbewerb, Pfändung.
function musikVoll(n=MORT){return !S||!!S.pleite||!!SMUSIK||TAB==='feier'||['auf','wett','pfand'].includes(n)}
function tonZeilen(){return tonZeile('musik',`🎵 Musik: ${musikText()}`,'laut')+tonZeile('fx',`🔔 Geräusche: ${TON.fx?'an':'aus'}`,'fxLaut')}
const musikText=()=>({an:'an',kurz:'kurz',aus:'aus'})[TON.musik];
// Welches Stück gerade passt: Pfändung bei der Pleite, Wettbewerb im Wettbewerbs-Fenster und bei Medaillen, Beförderung beim Aufstieg, sonst das Stück des Ortes.
function musikWahl(){
  if(!S) return 'gut';
  if(S.pleite) return 'pfand';
  if(SMUSIK) return SMUSIK;
  if(TAB==='ende') return 'auf';
  if(TAB==='feier') return S.feier&&S.feier.start?'gut':'auf';
  if(TAB==='monat'){const E=(S.bericht&&S.bericht.ehr)||[]; return E.some(e=>e.a)?'auf':E.length?'wett':'gut'}
  return MUSIK[TAB]?TAB:'gut';
}
// "5 Std. 30 Min.", unter einer Stunde nur Minuten.
function zeitTxt(s){s=Math.floor(s||0); const h=Math.floor(s/3600), m=Math.floor(s%3600/60); return h?`${h} Std. ${m} Min.`:s<60?'unter 1 Min.':`${m} Min.`}
function zeitSpieljahr(){return S.jahr-START_JAHR+1}
// Beim Aufstieg: Rang, Spieljahr und Zeit bis dahin. Mehrere Ränge in einem Monat bekommen dieselbe Zeit.
function zeitAufstieg(von,zu){S.zeitRang=S.zeitRang||[]; for(let i=von+1;i<=zu;i++) if(!S.zeitRang.some(x=>x.r===i)) S.zeitRang.push({r:i,j:zeitSpieljahr(),s:Math.round(S.zeit||0)})}
const wgBild=(st,jz)=>`weingut-${String(st).padStart(2,'0')}-${jz}`, wgGross=st=>st>=5;
// Aufstieg in diesem Monat? Dann zeigt der Winzerbote noch die alte Stufe, das Wachsen kommt erst in der Feier (Annahme Claude).
const wgAuf=F=>!!(F&&!F.start&&!F.spende&&F.von!=null&&F.zu>F.von);
const wgStufe=()=>(wgAuf(S.feier)?S.feier.von:S.rang)+1;
function nahBild(st){
  const L=NAH.filter(n=>st>=n[1]);
  if(!L.length||(S.monat!==5&&S.monat!==7)||wgAuf(S.feier)) return null;
  const k=(S.jahr-START_JAHR)*2+(S.monat===7?1:0);
  return L[k%L.length];
}
function monatBild(){
  return wgBild(wgStufe(),JZ[S.monat]);
}
function wgVorladen(){
  const st=S.rang+1, L=JZ_FOLGE.map(j=>wgBild(st,j)); if(st<10) L.push(wgBild(st+1,'sommer'));
  L.forEach(n=>{if(WG_DA.has(n)) return; WG_DA.add(n); const i=new Image(); i.src=`bilder/${n}.jpg`});
}
const wandNr=t=>[...t].reduce((a,c)=>(a*31+c.charCodeAt(0))%997,7)%28+1;
// Wo die Tafel in der Ebene liegt. Das Bild füllt die Ebene wie background-size:cover, T sind die Bildpixel aus PANO_TAFEL.
function tafelOrt(el,T){
  const W=el.clientWidth, H=el.clientHeight, k=Math.max(W/PANO_BILD[0],H/PANO_BILD[1]), ox=(W-PANO_BILD[0]*k)/2, oy=(H-PANO_BILD[1]*k)/2;
  return {x:ox+T[0]*k,y:oy+T[1]*k,w:(T[2]-T[0])*k,h:(T[3]-T[1])*k,W,H};
}
// Zoom, der die Tafel in die Mitte des Rahmens holt.
function tafelZoom(el,T){
  const t=tafelOrt(el,T), cx=t.x+t.w/2, cy=t.y+t.h/2;
  return {mitte:`${cx}px ${cy}px`,zoom:`translate(${t.W/2-cx}px,${t.H/2-cy}px) scale(${TAFEL_ZOOM})`};
}
// Legt alles an, was Etappe 3 braucht. Läuft bei neuen Spielen und bei alten Spielständen.
function etappe3(n,schwer){
  Object.assign(S,{schwer,rang:0,v3:1,sieger:null,wett:null,auktion:null,sektJahr:0,exLage:{ex:1}});
  const typen=misch(['vorsicht','qualitaet','zocker']).slice(0,n), andere=misch(Object.keys(REGIONEN).filter(r=>r!==S.region));
  S.gegner=typen.map((typ,i)=>({id:i,typ,name:GEGNER_TYP[typ].name,region:i===0&&Math.random()<.3?S.region:andere[i],ha:3,geld:40000,kredit:0,ansehen:0,rang:0,gen:1,genVers:rint(1,3)}));
  neueLaeden(); S.absatz=0;
}
function zahle(b){S.geld-=b;S.jahrAus+=b}
function kassiere(b){S.geld+=b;S.jahrEin+=b;if(b>0&&S.fu) S.fu.ein1=1;fx('kasse')}
function rufStufe(){const n=kompZahlen().hab; return RUF_STUFEN.filter(x=>n>=x).length}
function rufF(){return RUF_BONUS?1+RUF_BONUS*rufStufe():1}
function erloes(b){const f=rufF(); return f===1?b:Math.round(b*f)}
const rufProz=k=>Math.round(RUF_BONUS*100*k);
function rufPruef(){
  if(!S) return; const n=rufStufe(), a=S.meilen||0; if(n<=a) return;
  const J=S.rufJ||(S.rufJ=[]), N=S.rufNeu||(S.rufNeu=[]);
  for(let k=a;k<n;k++){J[k]={j:S.jahr,m:S.monat}; N.push(k+1)}
  S.meilen=n;
  if(!KOMP_LEISE&&!window.BOT) RUF_M=n;
}
// Zeilen für "Kurz gemeldet", aus monatLauf direkt nach kompBote.
function rufBote(Z){
  const N=S.rufNeu||[]; S.rufNeu=[];
  const S7=RUF_STUFEN.length, n=S.meilen||0, nm=k=>`„${RUF_NAMEN[k-1]}“`;
  if(S.rufAlt){delete S.rufAlt;
    Z.push(`🏅 Neu ist der Ruf des Hauses: Bei ${RUF_STUFEN.slice(0,-1).join(', ')} und ${RUF_STUFEN[S7-1]} Siegeln auf dem Siegelbrett steigt er um eine Stufe. Jede bringt eine Ehrung und ${rufProz(1)} % mehr bei jedem Verkauf.${n?` Deine Siegel reichen schon für Stufe ${n} von ${S7} (${Array.from({length:n},(_,i)=>nm(i+1)).join(', ')}), die Händler zahlen dir ${rufProz(n)} % mehr.`:''}`);
    return}
  if(!N.length) return;
  const k=N[N.length-1];
  Z.push(N.length===1?`🏅 Ruf des Hauses: Stufe ${k} von ${S7}, du bist jetzt ${nm(k)}. Die Händler zahlen dir ab jetzt ${rufProz(k)} % mehr.`
    :`🏅 Ruf des Hauses: ${N.length} Stufen auf einmal, jetzt Stufe ${k} von ${S7} (${N.map(nm).join(', ')}). Die Händler zahlen dir ab jetzt ${rufProz(k)} % mehr.`);
}
// Alte Spielstände (vor 11.5): S.meilen fehlt. Erreichte Stufen kommen still dazu, eine Meldung nach dem Laden, eine Zeile im nächsten Winzerboten.
function altRuf(){
  if(S.meilen!=null) return;
  S.meilen=0; S.rufAlt=1; KOMP_LEISE++;
  try{rufPruef()}finally{KOMP_LEISE--}
  S.rufNeu=[];
  if(S.meilen&&!window.BOT) setTimeout(()=>{if(S&&S.rufAlt) rufMeldung(S.meilen,1)},1500);
}
// Großhandel: Budget des Monats zum vollen Preis, was davon noch offen ist, und der Schnitt-Faktor auf den Preis für Wein im Listenwert von w Euro.
function marktFrei(){return Math.round((MARKT_FREI+MARKT_RANG*S.rang+MARKT_EXPORT*exportStufen()+MARKT_HA*haUeber())*(spLohn(5)?SP_MARKT:1))}
// Bepflanzte Hektar über HA_FREI: daran hängen das Budget des Großhandels und die Menge der Weinhandlungen.
function haUeber(){return Math.max(0,flaecheBep()-HA_FREI)}
function marktRest(){return Math.max(0,marktFrei()-(S.absatz||0))}
// Seit dem Nachtrag vor 14.7.8 (Maik 25.11.2026, 12:16 Uhr): marktFBei ist der Faktor der Flasche an der Stelle x im Absatz (in €), marktF mittelt ihn über n.
function marktFBei(x,Q=marktFrei()){return x<=Q?1:Math.max(MARKT_MIN,1-(1-MARKT_MIN)*(x-Q)/(Q*MARKT_BREIT))}
function marktF(n){n=Math.max(0,n);const Q=marktFrei(),a=S.absatz||0,f=x=>marktFBei(x,Q); if(n<=0) return f(a); let s=0; for(let i=0;i<40;i++) s+=f(a+n*(i+.5)/40); return s/40}
function R(){return S.rollen?REGIONEN_ROLLEN[S.region]:REGIONEN[S.region]}
// Seit 7.9: zwei Namen und Anrede. S.name ist das Weingut, S.ich der eigene Name, S.anrede 'm' oder 'w'. Bei der Übergabe ersetzt der Erbe beides
// (erbeBenennen). Alte Spielstände ohne S.ich behalten die alten Texte, bis die Namen im Büro nachgetragen sind.
function frau(){return S.anrede?S.anrede==='w':!!(S.erbe&&S.erbe.name&&S.erbe.art==='t')}
const anr=(m,w)=>frau()?w:m;
const rangN=i=>frau()&&RAENGE[i].w||RAENGE[i].name, rangK=i=>frau()&&RAENGE[i].kw||RAENGE[i].kurz;
function famName(){const i=(S.ich||'').trim(); return i.includes(' ')?i.split(/\s+/).pop():''}
function ratte(){const n=S.ratte||1; return n<2?'Frau Öchsle':`Frau Öchsle ${RATTE_ORD[n]||'die '+n+'.'}`}
// Seit 14.4.4 zählt die Spitzenlage immer mit ihrer ganzen Fläche (slFl), nachgepflanzt wird dort nur auf ihren eigenen Platz (slPlatz).
function rebenGesamt(){return R().sorten.reduce((a,id)=>a+S.felder[id].reben,0)+slFl()}
// Bepflanzte Hektar mit einer Nachkommastelle. Zählt für deinen Aufstieg, gekaufte Fläche allein reicht nicht.
function flaecheBep(){return Math.round(rebenGesamt()/HA_REBEN*10)/10}
// Seit 13.4.9 (Nachtrag 3): Land je Lage in S.hang (S.lage ist schon Weinskandal und Mode). S.ha bleibt die Summe und wächst nur über landDazu.
// S.suedMax merkt den höchsten Südhang-Besitz der Partie, S.spitzeAuk das Jahr, in dem die Spitzenlage unter den Hammer kam.
const hangHa=lg=>(S.hang||{})[lg]||0;
// Nachtrag zu 14.5 (Maik 25.11.2026): Jede Lage trägt genau eine Sorte (SORTE_LAGE). lageVon ist die Lage eines Weinbergs, lageReben zählt die Reben auf einer Lage
// (am Südhang samt der ganzen Spitzenlage, slFl), lagePlatz den freien Platz dort in Reben. Gepflanzt wird nur auf die eigene Lage (platzFuer).
const lageVon=id=>SORTE_LAGE[rolleK(id)]||'einfach';
function lageReben(lg){return R().sorten.filter(id=>lageVon(id)===lg).reduce((a,id)=>a+((S.felder[id]||{}).reben||0),0)+(lg==='sued'?slFl():0)}
const lagePlatz=lg=>Math.max(0,hangHa(lg)*HA_REBEN-lageReben(lg));
function landDazu(lg,ha){const H=S.hang=S.hang||{einfach:S.ha,hoehe:0,sued:0}; H[lg]=Math.round(((H[lg]||0)+ha)*10)/10; S.ha=Math.round((S.ha+ha)*10)/10; if(lg==='sued') S.suedMax=Math.max(S.suedMax||0,H.sued)}
// Wie viel Südhang darf noch kommen: SUED_MAX minus Besitz, bis die Spitzenlage unter den Hammer kam, bleiben ihre SPITZE_HA frei.
function suedRest(){return Math.max(0,SUED_MAX-hangHa('sued')-(S.spitzeAuk?0:SPITZE_HA))}
// Freier Platz in Reben. Seit dem Nachtrag zu 14.5 (jede Lage eine Sorte) für jede Sorte nur auf ihrer eigenen Lage (lagePlatz), die Spitzenlage auf ihrem eigenen Platz.
// Bis dahin durften Menge- und Sekt-Sorte überall stehen, die Warnung vor belegtem Südhang und der Sekt-Abzug vom einfachen Hang sind weg.
const suedPlatz=()=>lagePlatz('sued');
function platzFuer(id){return istSL(id)?slPlatz():lagePlatz(lageVon(id))}
// Satz, warum eine Sorte nicht gepflanzt werden kann, in Worten (LAGE_SATZ). Platzhalter, Wortlaut in Meilenstein 17.
function lageKeinSatz(id){const lg=lageVon(id); return LAGE_SATZ.kein.replace('{sorte}',SORTEN[id].name).replace('{lage}',LAGE_SATZ.auf[lg]).replace('{woher}',LAGE_SATZ.woher[lg])}
const lageNurSatz=id=>LAGE_SATZ.nur.replace('{lage}',LAGE_SATZ.auf[lageVon(id)]);
// Stände vor 13.4.9: Ihr Land zählt als einfacher Hang. Die Spitzenlage zählt als Südhang, dazu so viel Land, wie Spitzen-Reben darauf stehen (aufgerundet, zusammen höchstens SUED_MAX).
// Stehen mehr Spitzen-Reben, bleiben sie stehen, nachgepflanzt wird nur auf freiem Südhang. Kam die Spitzenlage schon unter den Hammer, kommt sie nicht noch einmal.
function altHang(){if(S.hang) return; const sued=Math.min(SUED_MAX-(S.spitze||S.spitzeVers?0:SPITZE_HA),S.ha,Math.max(S.spitze?SPITZE_HA:0,Math.ceil(handReben()/HA_REBEN)));
  S.hang={einfach:Math.round((S.ha-sued)*10)/10,hoehe:0,sued}; S.suedMax=sued; if(S.spitze||S.spitzeVers) S.spitzeAuk=S.spitzeVers||S.jahr}
const verlustSpanne=b=>VERLUST.find(v=>b>=v[0]);
// Bodenschnitt des laufenden Jahres: die Monatsenden bisher und der heutige Stand.
// Seit 14.7.4 (Annahme 10) je Weinberg: Bodenstand f.boden in Prozent, Monatsstände f.bodenSum und f.bodenN, nur solange Reben stehen.
// Ohne Reben bleibt der Bodenstand stehen (Annahme der Bau-Sitzung). bodenMin ist der magerste bepflanzte Weinberg (für Übersicht und Einstieg).
function bodenSchnitt(id){const f=S.felder[id]; return Math.round(((f.bodenSum||0)+f.boden)/((f.bodenN||0)+1))}
const bodenMin=()=>{const B=weinberge().filter(id=>S.felder[id].reben>0).map(id=>S.felder[id].boden); return B.length?Math.min(...B):BODEN_START};
// Seit 13.4.8: Mit der Spende an die Feuerwehr (spLohn(2)) zählt der Frost-Anteil nur mal SP_FROSTFEUER.
function frostPlus(){const w=S.winterFrost||0;return ((w>=3?FROST_3:w>=2?FROST_2:0)+(S.spaetFrost?SPAETFROST:0))*(spLohn(2)?SP_FROSTFEUER:1)}
function rebenPreis(id){return Math.round(SORTEN[id].preis*(S.rebenF||1)*(S.rebenAng===id?1-REBEN_ANGEBOT:1)*100)/100}
// Fassraum und Flaschen schwanken jeden Monat ein wenig, höchstens um LAGER_SCHWANK.
function fassPreis(){return Math.round(FASS_PREIS*(S.fassF||1)*100)/100}
function flaschePreis(){return Math.round(FLASCHE_PREIS*(S.flaschF||1)*100)/100}
function rebenMarktText(){const p=Math.round(((S.rebenF||1)-1)*100);return (p?`Reben kosten diesen Monat ${Math.abs(p)}\u00a0% ${p<0?'weniger':'mehr'} als üblich`:'Reben kosten diesen Monat so viel wie üblich')+(S.rebenAng?`, ${SORTEN[S.rebenAng].name} gibt es im Angebot ${Math.round(REBEN_ANGEBOT*100)}\u00a0% günstiger`:'')}
// Geschätzter Jahresgewinn und die Steuer darauf. Die Kosten, die zum Monatswechsel noch abgehen, sind schon abgezogen.
// Seit 8.2 senken die Spenden des Jahres (S.spJahr) den Gewinn, höchstens um SP_DECKEL (spAbzug). abz ist der Abzug.
function steuerSchau(){const K=kosten(), gew=Math.round(S.jahrEin-S.jahrAus-K.basis-K.loehne-K.zins), abz=spAbzug(gew);return {gew,abz,steuer:gew>0?Math.round((gew-abz)*STEUER):0}}
const spKurz=(s,e)=>s===8&&e&&e.w?'Ehrenbürgerin':SPENDEN[s].kurz;
const spFuge=t=>SP_FUGE[t]||t;
// Version 12.5: Text zum Steuervorteil im Spendenfenster. Zeigt den Rest, der in diesem Jahr noch Steuer senkt (Deckel minus schon gespendet), erst ohne Rest den Satz "voll genutzt".
function spSteuerText(t,n){
  if(t.gew<=0) return 'Dieses Jahr gibt es bisher keinen Gewinn, die Rate senkt keine Steuer.';
  const deckel=Math.round(t.gew*SP_DECKEL), rest=Math.max(0,deckel-(S.spJahr||0));
  if(rest<=0) return 'Steuervorteil für dieses Jahr schon voll genutzt. Spenden geht weiter, nur ohne Steuerersparnis.';
  const spart=Math.round((Math.min((S.spJahr||0)+n,deckel)-t.abz)*STEUER);
  return `${spart>0?`Spart dir rund ${eur(spart)} Steuer. `:''}Steuervorteil: bisher noch ${eur(rest)} absetzbar in diesem Jahr.`;
}
const spFertig=s=>(S.spenden||[]).some(x=>x.s===s);
// Seit 10.1: Die Belohnung einer Stufe gibt es nur für die echte Spende. Was die Stiftung nachholt (Merkmal st), bringt Ansehen und Ehrung, bei Stufe 8 auch den Holzbogen.
const spLohn=s=>(S.spenden||[]).some(x=>x.s===s&&!x.st);
// Stiftung fürs Dorf (nur mit Amt): Sie holt verpasste Spenden der Reihe nach zum STIFT_FAKTOR-fachen Preis nach. S.stift = {s, bez} ist die angefangene Stufe.
function stFehlt(){for(let s=1;s<SPENDEN.length;s++) if(!spFertig(s)) return s; return 0}
const stPreis=s=>SPENDEN[s].b*STIFT_FAKTOR, stBezahlt=()=>S.stift&&S.stift.s===stFehlt()?S.stift.bez:0;
const stOffen=()=>S.amt?stFehlt():0, stAnzahl=()=>SPENDEN.length-1-new Set((S.spenden||[]).map(x=>x.s)).size;
// Die Bank am Wanderweg gehört zur Belohnung der echten Spende, die Stiftung zeigt bei Stufe 7 deshalb das Rathaus.
const stFoto=s=>s===7?'amt':spFoto(s);
// Artikel im Winzerboten nach den nachgeholten Stufen eines Monats (L), alle in einem. Stufe 8 bringt den Holzbogen und bekommt den Artikel der Spende.
function stBote(L){
  if(L.includes(8)) spBote(8);
  L=L.filter(s=>s!==8); if(!L.length) return;
  const sum=L.reduce((a,s)=>a+stPreis(s),0), was=L.map(s=>SPENDEN[s].z), liste=was.length>1?was.slice(0,-1).join(', ')+' und '+was[was.length-1]:was[0];
  schlag(66,L.length>1?`Stiftung ${S.name} holt ${L.length} Spenden nach`:`Stiftung ${S.name} holt nach: ${SPENDEN[L[0]].kurz}`,`Die Stiftung von ${S.ich||S.name} hat ${eur(sum)} gegeben, für ${liste}. „Spät, aber von Herzen“, sagt der Bürgermeister. ${stFehlt()?'Im Rathaus heißt es, die Stiftung habe noch mehr vor.':'Damit hat das Dorf alles bekommen, was es sich je gewünscht hat.'}`,stFoto(L[L.length-1]),{du:1,archiv:1});
}
// Seit 14.4.2 (Entscheidung 46 ersetzt, Spenden beim Winzer): Spenden gibt es ab FREI.spende. Im ersten Spenden-Rang kommen vorher die Spenden der Ränge darunter
// (die des Jungwinzers), eine nach der anderen, damit alle acht für den Schlüssel Dorf erreichbar bleiben (Annahme der Bau-Sitzung).
function spOffen(){const r=S.rang, r0=FREI.spende.r; if(r<r0||r>=SPENDEN.length) return 0; for(let s=r===r0?1:r;s<=r;s++) if(!spFertig(s)) return s; return 0}
function spBezahlt(){return S.sp&&S.sp.r===spOffen()?S.sp.bez:0}
function spAbzug(gew){return gew>0?Math.min(S.spJahr||0,Math.round(gew*SP_DECKEL)):0}
const bankBild=()=>SP_BILD.bank||'spitzenlage';
const bogenBild=()=>SP_BILD.bogen||'stadt';
const spFoto=s=>{const b=SPENDEN[s].bild; return b==='bank'?bankBild():b==='bogen'?bogenBild():b};
// Ehrenbürger der Generation n? Dann bleiben bei ihrer Übergabe SP_ERBE vom Ansehen.
const spBuerger=n=>(S.spenden||[]).some(x=>x.s===8&&x.g===n);
function erbAnsehen(){return spBuerger(genNr())&&spLohn(8)?SP_ERBE:ERB_ANSEHEN}
// Seit 10.3 (A21): Wer die achte Spende selbst gemacht hat, startet im Verband mit SP_STIMM mehr Stimmung, beim Amtsantritt, nach jeder Wahl und nach einer Abwahl.
const spStimm=()=>spLohn(8)?SP_STIMM:0;
function ladenEigen(){return Math.round(LADEN_EIGEN*(spLohn(6)?SP_LADEN:1))}
// Seit 13.4.1: festF des Gebiets (Württemberg) auf das Ansehen aus Festen.
function festAns(F){return F.ans*(F===FESTE.hoffest&&spLohn(7)?SP_HOFFEST:1)*(R().festF||1)}
function spDorfLohn(){const a=S.loehne&&S.loehne.helfer; return S.spDorf===S.jahr&&S.monat>=SP_DORF_VON&&S.monat<=SP_DORF_BIS&&a&&a.length?a[a.length-1]:0}
function altSpende(){if(!S.spenden) S.spenden=[]; if(S.spJahr==null) S.spJahr=0}
// Eine Rate zahlen. Ist der Betrag voll, kommen Ansehen, Ehrung, Belohnung, die kleine Feier und der Artikel im nächsten Winzerboten.
function spZahle(n){
  const s=spOffen(); if(!s) return; const D=SPENDEN[s];
  if(!S.sp||S.sp.r!==s) S.sp={r:s,bez:0};
  n=Math.min(n,D.b-S.sp.bez,Math.max(0,S.geld)); if(n<=0) return;
  S.geld-=n; S.sp.bez+=n; S.spJahr=(S.spJahr||0)+n;
  if(S.sp.bez<D.b){fx('kasse'); return}
  S.sp=null; ruhm(D.ans,0,'Spenden');
  (S.spenden=S.spenden||[]).push({s,j:S.jahr,m:S.monat,n:S.ich||'',w:frau()?1:0,g:genNr()});
  if(s===1) S.spDorf=S.monat<SP_DORF_VON?S.jahr:S.jahr+1;
  if(s===4) S.spSegen=1;
  (S.spBote=S.spBote||[]).push(s);
  if(s===8){S.feier={spende:8}; TAB='feier'; FSTUFE=0; return}
  fx('korken'); openSheet(spDankHtml(s));
}
function spBote(s){
  const f=t=>t.replace(/\{W\}/g,S.name).replace(/\{N\}/g,S.ich||S.name).replace('{EIN}',anr('einen Jungwinzer','eine Jungwinzerin')).replace('{EB}',anr('Ehrenbürger','Ehrenbürgerin'));
  schlag(66,f(SP_BOTE[s][0]),f(SP_BOTE[s][1]),spFoto(s),{du:1,archiv:1,...(s===8?{gold:1}:{})});
}
function fassBelegt(){return S.lots.filter(l=>l.status==='fass').reduce((a,l)=>a+l.liter,0)}
// Seit 13.2.5: Zusätze aus Pflege und Boden, zum Beispiel "Trockenbeerenauslese Grand Cru vom Terroir". Alle Namen von Weinen kommen aus lotName.
const weinZusatz=l=>`${(l.pfl||0)>=NAME_PFLEGE_AB?' '+PFLEGE_STUFEN[l.pfl]:''}${(l.bst||0)>=NAME_BODEN_AB?' vom '+BODEN_STUFEN[l.bst]:''}`;
// Seit 13.6.2: Ein Jahrhundertwein ist eine Trockenbeerenauslese oder ein Eiswein aus dem gelungenen Wagnis im Jahrhundertjahr (l.jh), der Name steht auf dem Etikett.
const jhWein=l=>!!(l&&l.jh&&!l.sekt&&(l.stufe==='tba'||l.stufe==='eis'));
function lotName(l){return `${l.jahrgang} ${SORTEN[l.sorte].name}${l.stufe&&!l.sekt?' '+STUFEN[l.stufe].name:''}${jhWein(l)?' Jahrhundertwein':''}${l.sekt?'-Sekt':''}${weinZusatz(l)}${l.durch?DURCH_NAME:''}${l.sekt&&hefeLang(l)?` (${l.hefe} Monate Hefelager)`:''}`}
function rahmen(){return RAENGE[S.rang].rahmen}
// Für Anzeigen (seit Teil D): ein Tabellenwert mit dem Faktor seiner Quelle, so wie ihn ruhm auf Stufe mittel gutschreibt.
function ansQ(n,q){return Math.max(1,Math.round(n*(ANS_F[q]||1)))}
// Seit 13.6.8: end=1 lässt ANS_F aus (Endwert aus dem Bauplan, zum Beispiel KRONE_ANS), die Schwierigkeit wirkt weiter.
function ruhm(n,still,q,end){if(n>0)n=Math.max(1,Math.round(n*DIFF[S.schwer].ans*(end?1:(ANS_F[q]||1))));S.ansehen=Math.max(0,S.ansehen+n);if(S.amt&&n&&!still)stimmung(n>0?n*STIMM_PLUS:n*STIMM_MINUS);return n}
function reifeFaktor(l){const L=lager(l);return l.status==='flasche'?Math.min(4,1+Math.max(0,l.flMonate-L.min)/12*L.rate):1}
// Seit 14.5.4: dieselbe Formel wie preis (weinWert), mit Flaschenreife und dem Abschlag im Fass, ohne Markt, Lage und Gebiet.
function lotWert(l){
  if(l.status==='trauben') return 0;
  if(!l.stufe) return l.liter*2;
  return l.liter*weinWert(l.stufe,l)*reifeFaktor(l)*sektF(l)*(l.status==='fass'?.7:1);
}
// Seit 13.3.8 (Nachtrag 3): neue Formel, Konstanten bei VERM_GRUND in zahlen.js.
const haWert=(rl,pfl,bst)=>VERM_GRUND*(VERM_SORTE[rl]||1)*VERM_PFLEGE[pfl||0]*VERM_BODEN[bst||0];
const kahlWert=bst=>VERM_GRUND*VERM_BODEN[bst||0]*VERM_KAHL;
function weinbergWert(){let w=0, bep=0; for(const id of Object.keys(S.felder)){const f=S.felder[id], h=(f.reben||0)/HA_REBEN; if(!(h>0)) continue; bep+=h; w+=h*haWert((SORTEN[id]||{}).rolle,f.pflSt,wbBoden(id))}
  // Seit 14.2.5: kahles Land je Lage, bis zur gezählten Fläche (S.bodenFl) mit der Stufe der Lage, darüber Rohboden (Annahme 7, Maik 23.11.2026).
  const T=lagenBelegung().T, F=S.bodenFl||{}; let k=0;
  for(const lg of LAGE_REIHE){const kahl=Math.max(0,hangHa(lg)*HA_REBEN-T[lg]), mit=Math.min(kahl,Math.max(0,(F[lg]||0)-T[lg])); k+=(mit*kahlWert(lageBoden(lg))+(kahl-mit)*kahlWert(0))/HA_REBEN}
  return w+k}
function vermoegen(){return Math.round(S.geld-(S.kredit?S.kredit.rest:0)+WEIN_WERT*S.lots.reduce((a,l)=>a+lotWert(l),0)+weinbergWert())}
// Seit 14.4.7 (Entscheidung 70, Annahme 12): Weinbergswert der Gegner je Rolle mit den Wunschjahren der Pflegestufen (GEGNER_WB) und je Lage mit den Jahren
// der Bodenstufen (GEGNER_BODEN, Lage je Rolle GEGNER_LAGE). Die Fläche verteilt sich wie bisher nach GEGNER_FL (bis 14.4.6 eine Stufe für alle nach Jahren).
const gStufe=(j,J)=>J.filter(x=>j>=x).length;
function gWeinberg(g){const j=S.jahr-START_JAHR; let rest=g.ha, w=0; for(const [rl,n] of GEGNER_FL){const h=Math.min(rest,n); if(h>0) w+=h*haWert(rl,gStufe(j,GEGNER_WB[rl]),gStufe(j,GEGNER_BODEN[GEGNER_LAGE[rl]])); rest-=h} return w}
function gVerm(g){return Math.round(g.geld-g.kredit+gWeinberg(g))}
function rangFuer(ab,ans,ha,verm){let r=ab;while(r<R_MAX){const n=RAENGE[r+1];if(ans>=n.ans&&ha>=n.ha&&verm>=n.verm)r++;else break}return r}
/* ================= Absatzwege ================= */
// Seit 7.0 (Schritt H, Maik 16.11.2026): Federweißer nimmt der Weinhändler in jeder Menge zum vollen Inlandspreis ab.
// Er zählt nicht gegen das Budget des Großhandels (S.absatz) und drückt den Preis nicht. Exporthandel gibt es für ihn nicht.
const federHandel=l=>l.stufe==='feder'&&!l.sekt;
function wege(l){
  const p=preis(l); if(!p) return [];
  if(federHandel(l)) return [{name:'Weinhändler',flag:'🍂',p}];
  const W=[{name:'Inland',flag:'🇩🇪',p}];
  if(frei('export')) W.push({name:'Exporthandel',flag:'🌍',p:Math.round(p*EXPORT_F[exportArt(l)]*S.exLage.ex*100)/100});
  return W.sort((a,b)=>b.p-a.p);
}
const wunschName=w=>WUNSCH[w]||(SORTEN[w]?SORTEN[w].name:'Wein');
function ladenWuensche(){const fr=R().sorten.filter(sorteFrei); if(LADEN_SORTEN) return [...fr,...(sektFrei()?['sekt']:[])]; return ['weiss','rot','sekt','edel'].filter(w=>w==='edel'||(w==='sekt'?sektFrei():fr.some(id=>SORTEN[id].farbe===w)))}
function neueLaeden(){S.laeden={};const W=ladenWuensche();for(const r of Object.keys(REGIONEN)) if(r!==S.region) S.laeden[r]={rest:Math.round(rint(1,LADEN_MAX)*(LADEN_MENGE+LADEN_HA*haUeber())),wunsch:W[rint(0,W.length-1)]}}
function ladenOk(l){return l.status==='flasche'&&!l.regal&&preis(l)>0&&(l.sekt||STUFEN[l.stufe].rang>=3)}
// Eigene Weinhandlung ab Weinbaurat: Weine im Regal (l.regal) verkaufen sich jeden Monat von selbst, das Teuerste zuerst, bis LADEN_EIGEN Euro Listenwert.
function regalWeine(){return S.lots.filter(l=>l.regal&&l.status==='flasche')}
// n Flaschen von l ins Regal, der Rest bleibt im Lager. Von Hand (AKT.regal) oder durch den Handels-Manager (seit 7.0, Schritt E).
// Seit 8.2 legt es den Teil im Regal mit einem gleichen Wein zusammen, der dort schon steht.
function regalStellen(l,n){if(n>=l.liter){l.regal=true; weinZusammen(l)} else{const r={...l,id:S.nextId++,liter:n,regal:true,med:(l.med||[]).slice()}; S.lots.push(r); l.liter-=n; weinZusammen(r)}}
function gleicherWein(a,b){if(a===b||!!a.regal!==!!b.regal) return false; for(const k of new Set([...Object.keys(a),...Object.keys(b)])) if(!WEIN_FREI.includes(k)&&JSON.stringify(a[k])!==JSON.stringify(b[k])) return false; return true}
function weinZusammen(l){const o=S.lots.find(x=>gleicherWein(x,l)); if(!o) return l; o.liter+=l.liter; o.med=[...new Set([...(o.med||[]),...(l.med||[])])]; S.lots=S.lots.filter(x=>x!==l); return o}
function ladenMonat(Z){
  if(!ladenFrei()) return;
  let rest=ladenEigen(), n=0, ein=0;
  for(const l of regalWeine().filter(l=>preis(l)>0).sort((a,b)=>preis(b)-preis(a))){
    const p=preis(l), k=Math.min(l.liter,Math.floor(rest/p)); if(k<=0) continue;
    l.liter-=k; rest-=k*p; n+=k; ein+=k*p*LADEN_EIGEN_F; kompVerkauf(l,k);
  }
  S.lots=S.lots.filter(l=>l.liter>0);
  if(n){ein=erloes(Math.round(ein)); kassiere(ein); Z.push(`Deine Weinhandlung hat ${num(n)} Flaschen für ${eur(ein)} verkauft.`)}
}
function ladenPasst(l,r){const w=S.laeden[r].wunsch; return ladenOk(l)&&(w==='sekt'?!!l.sekt:w==='edel'?!l.sekt&&STUFEN[l.stufe].rang>=5:w==='weiss'||w==='rot'?!l.sekt&&SORTEN[l.sorte].farbe===w:!l.sekt&&stamm(l.sorte)===w)}
function ladenPreis(l,r){return Math.round(preis(l)*LADEN_AUF*100)/100}

/* ================= Wettbewerbe ================= */
function wettRang(){const t=S.wett&&S.wett.typ; return t==='bund'?R_BUND:R_LAND}
// Seit 13.6.2: Lagerjahre geben einem Jahrhundertwein nichts dazu. Seit 14.5.2 zählt die Qualität seines Weinbergs, ohne Zuschlag (bis 14.4 JH_ZUSCHLAG).
function reifeBonus(l){if(jhWein(l)) return 0; return Math.min(12,Math.round((reifeFaktor(l)-1)*8))}
function wettFaehig(l){
  const w=S.wett; if(!w||!l||!l.stufe||l.pansch) return false;
  if(w.typ==='land') return !l.sekt&&STUFEN[l.stufe].rang>=3&&l.jahrgang===S.jahr-1&&l.status!=='trauben';
  // Seit 10.1: Bei der Weltweinschau dürfen auch Weine mit Bundes-Medaille antreten, derselbe Wein jedes Jahr wieder (Variante 3).
  return l.status==='flasche'&&!(w.typ!=='welt'&&l.bund)&&(l.sekt||STUFEN[l.stufe].rang>=3)&&l.flMonate>=lager(l).min;
}
// Ausschreibung: Feld der anderen Weingüter. ein ist der eingereichte Wein, zufall die Tagesform der Jury (bleibt beim Tauschen gleich).
function neuerWettbewerb(typ){
  // Seit 13.6.3 läuft die Weltweinschau nicht mehr über S.wett, sondern über S.schau (schauNeu).
  const d=DIFF[S.schwer].feld, bund=typ==='bund', F=[], namen=misch(GUETER);
  // Seit 14.5.7 (Entscheidung 36): die Felder WETT_FELD_PLUS höher, Landesprämierung 48 bis 74, Bundeswettbewerb 60 bis 84 vor Spielstufe und Gegnern.
  for(let i=0;i<(bund?8:9);i++) F.push({name:namen[i],p:(bund?rint(20,44):i<2?rint(20,34):rint(8,26))+WETT_FELD_PLUS+d});
  for(const g of S.gegner) if(bund||g.region===S.region){const t=GEGNER_TYP[g.typ];F.push({name:g.name,ki:g.id,p:rint(t.ws[0],t.ws[1])+Math.round(g.rang*(bund?1.1:.85))+(bund?4:0)+d+(REGIONEN[g.region].wettPlus||0)})}
  S.wett={typ,feld:F,ein:null,zufall:rint(-4,4)};
}
// Seit 14.5.7 (Entscheidung 36, Annahmen 24 bis 28): die Jury wertet Qualität plus Wert der Weinstufe (STUFEN.jury, Sekt SEKT_JURY) plus Flaschenreife
// (nicht bei der Landesprämierung, nicht beim Jahrhundertwein) plus Öchsle über der Schwelle (höchstens OE_JURY_MAX) plus Jahrhundertwein JH_JURY,
// dazu die Punkte eigen am Wein: Medaillen und Weinkritiker (l.medP), beim Sekt Hefelager und Hang (l.sektP). juryTeile gibt die Bausteine ohne Tagesform.
function juryTeile(l,mitReife){return {qual:l.qp||0,stufe:l.sekt?SEKT_JURY:(STUFEN[l.stufe]||{}).jury||0,reife:mitReife?reifeBonus(l):0,
  oe:l.sekt?0:Math.min(OE_JURY_MAX,oeUeber(l.stufe,l)),jh:jhWein(l)?JH_JURY:0,med:l.medP||0,sekt:l.sekt?(l.sektP||0):0}}
const juryGrund=(l,mitReife)=>Object.values(juryTeile(l,mitReife)).reduce((a,b)=>a+b,0);
// Die Bausteine in Worten für die Fenster der Wettbewerbe. Platzhalter, Wortlaut in Meilenstein 17.
function juryText(l,mitReife){const t=juryTeile(l,mitReife), n={stufe:l.sekt?'Sekt':'Weinstufe',reife:'Flaschenreife',oe:'Öchsle',jh:'Jahrhundertwein',med:'Medaillen',sekt:'Hefelager'};
  return `${juryGrund(l,mitReife)} Punkte: Qualität ${t.qual}`+Object.keys(n).filter(x=>t[x]).map(x=>`, ${n[x]} ${t[x]>0?'+':'−'}${Math.abs(t[x])}`).join('')}
// Punkte eines Weins im laufenden Wettbewerb. Stehen beim Einreichen fest.
function wettPunkte(l){const w=S.wett;return juryGrund(l,w.typ!=='land')+w.zufall+(R().wettPlus||0)}
// Wertung zu Beginn des Monatswechsels nach der Ausschreibung, das Ergebnis kommt als Thema in die Zeitung.
// Medaille und Qualitätspunkte bekommt der Wein nur, wenn er noch im Keller ist. Ansehen und Preisgeld gibt es immer.
// Seit 13.6.3 nur noch Landesprämierung und Bundeswettbewerb, die Weltweinschau wertet schauAuswerten.
function wettAuswerten(){
  const w=S.wett, P=PREISE[w.typ], F=w.feld.map(x=>({...x})), e=w.ein, l=e&&lot(e.id), N=[], name=WETTNAME[w.typ];
  const wo=w.typ==='land'?'bei der Landesprämierung '+WO[S.region]:'beim Bundeswettbewerb';
  if(e) F.push({name:S.name,du:1,p:e.p});
  F.sort((a,b)=>b.p-a.p||(b.du||0)-(a.du||0));
  const ich=F.findIndex(x=>x.du);
  let titel='', text='';
  F.forEach((x,i)=>{x.platz=i+1; if(i<3) x.m=P[i].m});
  F.slice(0,3).forEach((x,i)=>{
    const pr=P[i];
    if(x.du){
      const mit=!!l, r=ruhm(pr.ans,0,'Wettbewerbe'), was=`+${r} Ansehen${mit?`, +${pr.qp} Punkte für den Wein`:''}${pr.geld?', '+eur(pr.geld)+' Preisgeld':''}`;
      // Seit 14.5.7 (Annahme 25): die Punkte der Medaille stehen eigen am Wein (l.medP), die Qualität bleibt die des Weinbergs.
      if(mit){l.medP=(l.medP||0)+pr.qp; (l.med=l.med||[]).push(`${pr.m} ${name} ${S.jahr}`); if(w.typ==='bund') l.bund=true}
      if(w.typ==='land') tatMerk('medaille');
      ehre(pr.m,`${pr.t} ${wo}: ${e.name}`,0,was); kompMedaille(l||e,i);
      if(pr.geld) kassiere(pr.geld);
      titel=`${pr.t} für ${S.name}!`;
      text=`${e.name} holt ${pr.t} ${wo}. Das bringt ${was}.${!l?' Der Wein ist schon verkauft, die Ehre bleibt trotzdem.':''}`;
      if(i===0&&S.gegner.length){const g=S.gegner[rint(0,S.gegner.length-1)]; if(GEGNER_SPRUCH[g.typ]) text+=' '+GEGNER_SPRUCH[g.typ].erfolg(g.name)}
    }else if(x.ki!=null){
      const g=S.gegner[x.ki]; g.ansehen+=pr.ans*DIFF[S.schwer].ki; g.geld+=pr.geld;
      N.push(`${g.name} holt ${pr.t}.`);
    }
  });
  if(ich<0){titel=`${name} ${S.jahr}: ${F[0].name} vorn`; text=`${F[0].name} holt ${P[0].t} ${wo}.${N.length?' '+N.join(' '):''}`}
  else if(ich>2){titel=`${name}: Platz ${ich+1} für ${S.name}`; text=`${e.name} landet auf Platz ${ich+1} von ${F.length}. Fürs Treppchen hat es diesmal nicht gereicht.${N.length?' '+N.join(' '):''}`}
  else if(N.length) text+=' '+N.join(' ');
  // Rangliste in der Zeitung: das Treppchen, dazu du und die Gegner, wenn sie dahinter landen.
  const L=F.filter((x,i)=>i<3||x.du||x.ki!=null).map(x=>({platz:x.platz,name:x.name,p:x.p,m:x.m||'',du:x.du||0}));
  schlag(ich<0?42:ich<3?78:72,titel,text,'praemierung',{archiv:1,gold:ich>=0&&ich<3?1:0,liste:L,wett:{typ:w.typ,platz:ich},du:ich>=0&&ich<3?1:0});
}

/* ================= Weltweinschau mit drei Kronen (seit 13.6.3) ================= */
// S.schau ist die Schau des Jahres: angelegt im Januar (WELT_ANM), eingereicht und getauscht wird nur im Januar, die Schau ist im Juni (WELT_MONAT),
// gewertet beim Monatswechsel danach. {j Jahr, kl Nummer in KRONEN, feld, ein, zufall}. Gewonnene Kronen stehen in S.amt.kronen ({k, j, gen, wein}),
// sie bleiben wie die Schlüssel auch nach einer Abwahl. Jede Schau steht in S.amt.welt für die Chronik: Jahr, Klasse, Platz (0 = nicht angetreten), Wein, Punkte.
const kronen=()=>(S&&S.amt&&S.amt.kronen)||[];
const kroneHat=k=>kronen().some(x=>x.k===k);
// Die Klasse, die dran ist: die erste ohne Krone in der festen Reihenfolge, nach der dritten Krone null.
function kroneKl(){const i=KRONEN.findIndex(K=>!kroneHat(K.k)); return i<0?null:i}
const kroneWein=(l,kl)=>{const K=KRONEN[kl]; return K.sekt?!!l.sekt:!l.sekt&&K.stufen.includes(l.stufe)};
// Nachtrag vor 14.6.1 (Maik 25.11.2026): S.sorteVerk merkt je Rolle (menge, sekt, spitze) das Jahr, in dem zum ersten Mal ein eigener Jahrgang verkauft wurde,
// auf jedem Weg über kompVerkauf, gepanschter Wein zählt nie. Ein Sekt zählt bei der Sekt-Sorte. kroneFehlt nennt die Rollen, die der Krone kl noch fehlen.
function sorteVerkMerk(l,so=kompRollen()){const id=stamm(l.sorte), rl=l.sekt?'sekt':Object.keys(so).find(r=>r!=='sekt'&&so[r]===id)||rolleK(id), V=S.sorteVerk=S.sorteVerk||{}; if(V[rl]==null) V[rl]=S.jahr}
function kroneFehlt(kl){const K=KRONEN[kl]; if(!K||!K.sorten) return []; const V=S.sorteVerk||{}; return K.sorten.filter(rl=>V[rl]==null)}
// Die fehlenden Sorten in Worten, zum Beispiel "deiner Sekt-Sorte (Elbling)". art: lang (Anmeldung), kurz (Das steht an). Leer, wenn nichts fehlt.
function kroneFehltText(kl,art='lang'){const f=kroneFehlt(kl); if(!f.length) return ''; const so=kompRollen(), n=f.map(rl=>`deiner ${ROLLEN[rl].name}${so[rl]&&SORTEN[so[rl]]?` (${SORTEN[so[rl]].name})`:''}`);
  return KRONE_SORTE_TEXT[art].replace('{krone}',KRONEN[kl].name).replace('{fehlt}',n.join(', ').replace(/, ([^,]*)$/,' und $1'))}
// Regeln wie bisher: abgefüllt, nicht gepanscht, lange genug gelagert, dazu die Klasse. Seit dem Nachtrag vor 14.6.1 für die Raritäten-Krone alle drei Sorten verkauft.
function schauFaehig(l,s=S.schau){return !!(s&&l&&l.stufe&&!l.pansch&&l.status==='flasche'&&l.flMonate>=lager(l).min&&kroneWein(l,s.kl)&&!kroneFehlt(s.kl).length)}
// Es zählen die Punkte wie bisher (mit Reife), seit 14.2.6 auch beim Jahrhundertwein seine eigenen. Sie stehen beim Einreichen fest.
function schauPunkte(l,s=S.schau){return juryGrund(l,1)+s.zufall+(R().wettPlus||0)}
function schauNeu(){
  const kl=kroneKl(); if(kl==null) return;
  const K=KRONEN[kl], d=DIFF[S.schwer].feld, namen=misch(WELT_GUETER).slice(0,8);
  const form=rint(-WELT_FAV_W,WELT_FAV_W), feld=[{name:K.fav,fav:1,p:K.p+form+d+WELT_FAV_PLUS+(DIFF[S.schwer].fav||0)},...namen.map(name=>({name,p:rint(K.p-WELT_FELD_AB[0],K.p-WELT_FELD_AB[1])+d}))];
  S.schau={j:S.jahr,kl,feld:misch(feld),ein:null,zufall:rint(-4,4),form};
}
// Seit 13.7.5: Form des Favoriten in Worten (WELT_FORM), nur auf Stufen mit DIFF.form, sonst null. Ältere Schauen ohne Wurf gelten als normal.
function weltForm(){const s=S.schau; if(!s||!(DIFF[S.schwer]||{}).form) return null; const f=s.form||0; return f>=WELT_FORM_AB?'stark':f<=-WELT_FORM_AB?'schwach':'normal'}
function weltFormZeile(){const w=weltForm(); if(!w) return ''; const fav=S.schau.feld.find(x=>x.fav); return `🌍 Favorit der Weltweinschau: ${fav.name}, ${WELT_FORM[w][0]}`
}
// Einreichen und Tauschen nur im Monat der Anmeldung.
const schauAnm=()=>!!(S.schau&&S.monat===WELT_ANM&&S.schau.j===S.jahr);
function schauEinreichen(l){const s=S.schau; if(!schauAnm()||!schauFaehig(l)) return 0; s.ein={id:l.id,name:lotName(l),p:schauPunkte(l),sorte:l.sorte,stufe:l.stufe,sekt:l.sekt?1:0,...(jhWein(l)?{jh:1}:{})}; return 1}
const kroneText=K=>`Gesucht ist die ${K.name}: Jedes Weingut tritt mit ${K.was} an.`;
// Wertung: Platz 1 bringt die Krone und KRONE_ANS Ansehen, Platz 2 und 3 Ansehen und Preisgeld wie bisher (PREISE.welt).
// Medaille und Qualitätspunkte der Schau bekommt ein Wein nur einmal (l.welt) und nur, wenn er noch im Keller ist.
function schauAuswerten(){
  const s=S.schau, K=KRONEN[s.kl], P=PREISE.welt, F=s.feld.map(x=>({...x})), e=s.ein, l=e&&lot(e.id), A=S.amt;
  S.schau=null;
  if(e) F.push({name:S.name,du:1,p:e.p});
  F.sort((a,b)=>b.p-a.p||(b.du||0)-(a.du||0));
  const ich=F.findIndex(x=>x.du);
  F.forEach((x,i)=>{x.platz=i+1; if(i<3) x.m=P[i].m});
  (A.welt=A.welt||[]).push({j:S.jahr,kl:K.k,platz:ich+1,wein:e?e.name:'',p:e?e.p:0});
  const L=F.filter((x,i)=>i<3||x.du).map(x=>({platz:x.platz,name:x.name,p:x.p,m:x.m||'',du:x.du||0}));
  const nochmal=`Nächstes Jahr geht es wieder um die ${K.name}.`;
  if(ich<0) return schlag(60,`Weltweinschau ${S.jahr}: ${F[0].name} holt die ${K.name}`,`${F[0].name} gewinnt die ${K.name} auf dem Dorfplatz. ${S.name} hat diesmal keinen Wein eingereicht. ${nochmal}`,'weltweinschau',{liste:L,wett:{typ:'welt',platz:-1}});
  if(ich>2) return schlag(72,`Weltweinschau: Platz ${ich+1} für ${S.name}`,`${e.name} landet bei der Schau um die ${K.name} auf Platz ${ich+1} von ${F.length}. Die Krone holt ${F[0].name}. ${nochmal}`,'weltweinschau',{liste:L,wett:{typ:'welt',platz:ich},du:1});
  const pr=P[ich], schon=!!(l&&l.welt), mit=!!l&&!schon, r=ich===0?ruhm(KRONE_ANS,0,'Wettbewerbe',1):ruhm(pr.ans,0,'Wettbewerbe');
  const was=`+${r} Ansehen${mit?`, +${pr.qp} Punkte für den Wein`:''}${pr.geld?', '+eur(pr.geld)+' Preisgeld':''}`;
  if(l) l.welt=true;
  if(mit){l.medP=(l.medP||0)+pr.qp; (l.med=l.med||[]).push(`${pr.m} ${WETTNAME.welt} ${S.jahr}`)} // seit 14.5.7 eigen am Wein (Annahme 25)
  if(pr.geld) kassiere(pr.geld);
  kompMedaille(l||e,ich);
  if(ich>0){
    ehre(pr.m,`${pr.t} bei der Weltweinschau (${K.name}): ${e.name}`,0,was);
    return schlag(84,`Weltweinschau: ${pr.t} für ${S.name}`,`${e.name} holt ${pr.t} bei der Schau um die ${K.name}. Das bringt ${was}. Die Krone holt ${F[0].name}. ${nochmal}`,'weltweinschau',{gold:1,liste:L,wett:{typ:'welt',platz:ich},du:1});
  }
  (A.kronen=A.kronen||[]).push({k:K.k,j:S.jahr,gen:genNr(),wein:e.name});
  ehre(K.sym,`${K.name} der Weltweinschau: ${e.name}`,0,was);
  if(kroneKl()==null) return weltSieg(e,was,L);
  kroneSieg(K,e,was,L);
}
// Eine Krone, aber noch nicht alle: Feier im Dorf, nächstes Jahr ist die nächste Klasse dran.
function kroneSieg(K,e,was,L){
  const N=KRONEN[kroneKl()];
  schlag(96,`Weltweinschau: Die ${K.name} geht an ${S.name}!`,`${e.name} holt die ${K.name}, vor ${L.length>3?'den':''} besten Weingütern der Welt. Das bringt ${was}. Am Holzbogen hängt jetzt eine neue Fahne. Nächstes Jahr geht es um die ${N.name}.`,'weltweinschau',{gold:1,sonder:1,du:1,liste:L,wett:{typ:'welt',platz:0}});
  feierWelt('krone',{k:K.k,wein:e.name,was});
}
// Die dritte Krone: Ehrenpräsident, danach gibt es keine Schau mehr. Bild 4 und 5 der Geschichte kommen seit 10.2 auf der Bild-Bühne.
const ehrP=()=>anr('Ehrenpräsident','Ehrenpräsidentin');
function weltSieg(e,was,L){
  // Seit 13.6.4: Die letzte Übergabe ist im Januar danach (A.ehren.ende), mit der Ankündigung im Artikel und unter "Das steht an".
  const A=S.amt; A.ehren={j:S.jahr,m:S.monat,wein:e.name,gen:genNr(),ende:(S.jahr+1-START_JAHR)*12,...(e.jh?{jh:1}:{})};
  ehre('🎗️',`${ehrP()} des Weinbauverbands`,0,`Alle ${KRONEN.length} Kronen der Weltweinschau, die letzte ${S.jahr} im eigenen Dorf mit ${e.name}.`);
  schlag(100,`Weltweinschau: ${S.name} holt die dritte Krone!`,`${e.name} holt die ${KRONEN[KRONEN.length-1].name}. Damit hat ${S.name} alle ${KRONEN.length} Kronen der Weltweinschau. Das bringt ${was}. Über dem Dorfplatz steigt das Feuerwerk auf, und der Weinbauverband ernennt dich${S.ich?', '+S.ich+',':''} ${anr('zum Ehrenpräsidenten','zur Ehrenpräsidentin')}. Den Titel nimmt dir keine Wahl mehr. Im Januar ${S.jahr+1} übergibst du das Weingut am Küchentisch an dein Kind, danach kommt die Chronik.`,'weltweinschau-sieg',{gold:1,sonder:1,du:1,liste:L,wett:{typ:'welt',platz:0}});
  // Seit 10.2 kommen Feuerwerk, Ehrenplatz und die zweite Flasche auf der Bild-Bühne, mit der Urkunde zum Schluss.
  feierWelt('sieg',{wein:e.name,was});
}
// Probestände aus 13.5 und früher: Eine Schau, die noch über S.wett lief, fällt weg.
function altSchau(){if(S.wett&&S.wett.typ==='welt') S.wett=null}

// Seit 13.4.9: Lage des nächsten Loses, gewürfelt nach den Anteilen in AUK_LAGE für deinen Rang. Südhang nur, solange noch ein ganzer Hektar frei ist.
// Gibt es nur eine Lage, wird nicht gewürfelt, so bleiben die Würfe im ersten Akt wie vorher.
// Seit 14.4.5: Eine Lage ohne ganzen Hektar Rest bis zu deinem Deckel kommt nicht ins Los (landRest, am Südhang samt suedRest).
function aukLage(){const z=AUK_LAGE.filter(x=>S.rang>=x.r).pop().w, W=LAGE_REIHE.filter(lg=>z[lg]>0&&landRest(lg)>=1); if(W.length<2) return W[0]||'einfach';
  let r=Math.random()*W.reduce((a,lg)=>a+z[lg],0); for(const lg of W){r-=z[lg]; if(r<0) return lg} return W[W.length-1]}
// Nachtrag zu 14.5 (Maik 25.11.2026, Annahmen 39 und 41): sichere Auktion. Nach dem Rang AUK_SICHER[i].r kommt AUK_SICHER_JAHRE Jahre später (gewürfelt über fest,
// Thema 16, fest je Partie) im nächsten Auktionsmonat ohne Chance und ohne Erst-Sperre ein Los dieser Lage, solange keine andere Auktion läuft, unangekündigt.
// Höhenlage vor Südhang, die Spitzenlage zählt nicht als Südhang (landBesitz). Passt kein ganzer Hektar bis zum Deckel (landRest), ruht die Garantie dieser Lage.
// Seit 14.6.8 (Maik 25.11.2026, Antwort zu C2): Besitzt der Spieler die Lage nach ihrem sicheren Los noch nicht, kommt sie nur bei jeder AUK_SICHER_WIEDER-ten Auktion
// wieder (bis 14.6.7 bei jeder, wer die Höhenlage nie kaufte, sah nie wieder einfachen Hang und nie Südhang). Dazwischen wird gewürfelt wie sonst, oder es kommt
// der Südhang, wenn dessen Garantie offen ist. Der Südhang wartet nur, bis die Höhenlage einmal sicher angeboten wurde, nicht bis zum Kauf.
// S.aukNr zählt die Lose (ohne Spitzenlage), S.aukSicher merkt je Lage die Nummer ihres letzten sicheren Loses (bis 14.6.7 nur 1).
function aukSicherTag(i){const x=AUK_SICHER[i], m0=(S.rangMon||{})[x.r]; if(m0==null) return null;
  return m0+12*AUK_SICHER_JAHRE[Math.min(AUK_SICHER_JAHRE.length-1,Math.floor(fest(16,i,Math.floor(m0/12),m0%12)*AUK_SICHER_JAHRE.length))]}
// Lagen, deren Garantie gerade offen ist, in der Reihe von AUK_SICHER. Ist eine Lage noch nicht dran, warten die späteren mit.
function aukSicherOffen(){const L=[]; for(let i=0;i<AUK_SICHER.length;i++){const x=AUK_SICHER[i]; if(S.rang<x.r||landBesitz(x.lage)>0) continue; const t=aukSicherTag(i);
    if(t==null||S.jahr*12+S.monat<t) break; if(landRest(x.lage)<1) continue; L.push(x.lage)} return L}
// Die Lage, die das nächste Los bringt: zuerst eine, die noch nie sicher kam, sonst eine, deren Wiederholung dran ist, sonst null (gewürfelt).
function aukSicherLage(){const L=aukSicherOffen(), A=S.aukSicher||{}, n=S.aukNr||0;
  return L.find(lg=>A[lg]==null)||L.find(lg=>n-A[lg]>=AUK_SICHER_WIEDER)||null}
const aukSicherNeu=()=>aukSicherOffen().some(lg=>(S.aukSicher||{})[lg]==null);
const aukLageF=lg=>(AUK_PREIS_AKT[RANG_AKT[S.rang]]||1)*(AUK_PREIS_LAGE[lg]||1);
// Seit 13.7.5: der Landpreis, nur auf Stufen mit DIFF.land, sonst 1.
const landF=()=>(DIFF[S.schwer]||{}).land?(S.landF||1):1;
// Satz zum Markt im Winzerboten, wenn sich die Lage der Weinpreise ändert (nur mit DIFF.marktSatz). S.marktW merkt die letzte Lage.
function marktSatz(){if(!(DIFF[S.schwer]||{}).marktSatz) return; const M=MARKT_SATZ.find(x=>S.markt>=x[0]); if(S.marktW==null){S.marktW=M[1]; return} if(M[1]===S.marktW) return;
  if(M[1]==='normal'&&(S.marktW==='gut'?S.markt>MARKT_SATZ[0][0]-MARKT_SATZ_PUFFER:S.markt<MARKT_SATZ[1][0]+MARKT_SATZ_PUFFER)) return; S.marktW=M[1]; schlag(24,M[2],M[3],'',{archiv:1})}
// Seit 14.4.5 (Entscheidung 10, Frage 3): Satz zur Preislage beim Land im Winzerboten, in den Spielstufen LAND_SATZ_STUFEN, sobald sie wechselt.
// Günstig unter LAND_SATZ[0], teuer ab LAND_SATZ[1], zurück auf normal erst mit LAND_SATZ_PUFFER Abstand. S.landW merkt die letzte Lage.
function landLage(f){return f<LAND_SATZ[0]?'guenstig':f>=LAND_SATZ[1]?'teuer':'normal'}
function landSatz(){if(!LAND_SATZ_STUFEN.includes(S.schwer)||!(DIFF[S.schwer]||{}).land) return; const f=S.landF||1, w=landLage(f); if(S.landW==null){S.landW=w; return} if(w===S.landW) return;
  if(w==='normal'&&(S.landW==='guenstig'?f<LAND_SATZ[0]+LAND_SATZ_PUFFER:f>=LAND_SATZ[1]-LAND_SATZ_PUFFER)) return; S.landW=w; const T=LAND_SATZ_TEXT[w]; schlag(23,T[0],T[1],'',{archiv:1})}
function auktionHa(){const r=Math.random();return r<.4?1:r<.73?2:r<.95?3:r<.995?5:10}
function neueAuktion(spitze,haFest){
  if(spitze){const B=misch(NACHBARN).slice(0,3).map(n=>({name:n,limit:rint(64,144)*5000})); S.auktion={ha:SPITZE_HA,lage:'sued',start:SPITZE_START,schritt:10000,gebot:SPITZE_START,fuehrer:B[rint(0,2)].name,bieter:B,ende:null,text:'',phase:0,spitze:1}; return}
  // Seit 13.4.1: aukPreisF des Gebiets (Rheinhessen) auf Startgebot und alle Gebote, so wird das Land günstiger.
  // Seit 13.3.7: haFest gibt die Größe des Loses vor (vor dem Winzer AUK_FRUEH_HA).
  // Seit 13.4.9: Lage des Loses nach Rang (aukLage), ein Südhang-Los höchstens so groß, wie suedRest() erlaubt, der Preis mal Faktor je Akt und Lage.
  // Seit 14.4.5: Das Los wird auf deinen Rest bis zum Deckel der Lage gekürzt (landRest). Ist in keiner Lage ein ganzer Hektar frei, bleibt es, wie es ist, und du darfst nicht mitbieten.
  // Nachtrag zu 14.5: Ist eine sichere Lage dran (aukSicherLage), bringt das Los sie, ohne zu würfeln.
  // Seit 14.6.8: S.aukSicher merkt die Nummer des Loses (S.aukNr), die Wiederholung kommt erst AUK_SICHER_WIEDER Lose später.
  const sich=aukSicherLage(); if(sich) (S.aukSicher=S.aukSicher||{})[sich]=S.aukNr||0; S.aukNr=(S.aukNr||0)+1;
  const lage=sich||aukLage(), ha0=haFest||auktionHa(), rest=Math.floor(landRest(lage)+1e-9), ha=rest>=1?Math.min(ha0,rest):ha0, pf=(R().aukPreisF||1)*aukLageF(lage)*landF(), start=Math.round(ha*8000*pf/500)*500, B=misch(NACHBARN).slice(0,rint(2,3)).map(n=>({name:n,limit:Math.round(ha*rnd(11000,30000)*pf/500)*500}));
  for(const g of S.gegner) if(g.region===S.region){
    const t=GEGNER_TYP[g.typ];
    // Der Zufall wird immer gezogen, auch wenn der Gegner am Deckel ist und nicht mitbietet.
    // Seit 13.7.5: Auf Stufen mit DIFF.klug bieten sie bis nah an den Wert des Loses (AUK_WERT_HA, AUK_KLUG) statt nach Laune.
    const lim=Math.round(Math.min(g.geld+(g.typ==='zocker'?30000:0),DIFF[S.schwer].klug?ha*AUK_WERT_HA*pf*rnd(AUK_KLUG[0],AUK_KLUG[1]):ha*rnd(14000,26000)*pf*(1+t.biet*bietF()*.6))/500)*500;
    if(g.ha+ha<=gegnerDeckel(g)) B.push({name:g.name,ki:g.id,limit:lim});
  }
  const offen=B.filter(b=>b.limit>=start);
  S.auktion={ha,lage,start,schritt:Math.max(500,Math.round(start*.1/500)*500),gebot:start,fuehrer:offen.length?offen[rint(0,offen.length-1)].name:null,bieter:B,ende:null,text:'',phase:0};
}
// Seit 13.3.7 (Nachtrag 3): Chance je Auktionsmonat. Vor dem Winzer im Schnitt ein Los alle AUK_FRUEH_JAHRE Jahre, danach AUK_CHANCE wie bisher.
function aukChance(){return (frei('auktion_oft')?AUK_CHANCE:1/(AUK_FRUEH_JAHRE*AUK_MONATE.length))*(R().aukF||1)}
// Das erste Angebot ab dem Jungwinzer: Kam noch keins und wäre der nächste Auktionsmonat später als AUK_ERST_JAHRE Jahre nach dem Aufstieg, kommt es jetzt.
// Seit 14.4.2: Vor dem ersten Angebot ab dem Jungwinzer liegen mindestens AUK_ERST_AB Jahre, so lange kommt gar kein Los.
function aukErstSperre(){const m0=(S.rangMon||{})[R_AUKTION]; return S.rang>=R_AUKTION&&!S.aukErst&&m0!=null&&S.jahr*12+S.monat<m0+12*AUK_ERST_AB}
function aukErstFaellig(){const m0=(S.rangMon||{})[R_AUKTION]; if(S.aukErst||S.rang<R_AUKTION||m0==null) return false; const jetzt=S.jahr*12+S.monat, bis=m0+12*AUK_ERST_JAHRE; if(jetzt>bis) return false;
  const n=AUK_MONATE.find(m=>m>S.monat), nx=n==null?(S.jahr+1)*12+AUK_MONATE[0]:S.jahr*12+n; return nx>bis}
function aukNaechstes(){const a=S.auktion;return a.fuehrer?a.gebot+a.schritt:a.gebot}
function aukLimit(){return S.geld+rahmen()-(S.kredit?S.kredit.rest:0)}
// Der Spieler ist raus oder hat die Auktion verpasst: Die anderen machen es unter sich aus.
function aukOhneDich(){
  const a=S.auktion, B=a.bieter.filter(b=>b.limit>=a.gebot).sort((x,y)=>y.limit-x.limit);
  if(!B.length){a.ende='niemand'; return a.text=`Für ${losText(a)} ${WO[S.region]} fand sich kein Bieter.`}
  const sieger=B[0], pr=B[1]?Math.max(a.gebot,Math.min(sieger.limit,B[1].limit+a.schritt)):a.gebot;
  a.ende=sieger.name; a.gebot=pr;
  if(sieger.ki!=null){const g=S.gegner[sieger.ki]; g.geld-=pr; g.ha+=a.ha; g.ansehen+=2*(3+Math.min(a.ha,7))*DIFF[S.schwer].ki}
  return a.text=`${sieger.name} bekommt den Zuschlag: ${losText(a)} ${WO[S.region]} für ${eur(pr)}.`;
}
// Seit 7.9 für das Rathaus: Wann kann frühestens wieder geboten werden, und wann ist der nächste Wettbewerb?
// Geboten wird im Monat nach der Ankündigung. Steht für diesen Monat nichts an, zählt erst die nächste Ankündigung.
function aukNaechst(){const m=AUK_MONATE.find(m=>m>S.monat); return m==null?`${MON[(AUK_MONATE[0]+1)%12]} ${S.jahr+1}`:`${MON[(m+1)%12]} ${S.jahr+(m===11?1:0)}`}
function wettNaechst(typ){
  if(typ==='land') return `Februar ${S.monat<1?S.jahr:S.jahr+1}`;
  if(typ==='welt') return `${MON[WELT_ANM]} ${S.monat<=WELT_ANM?S.jahr:S.jahr+1}`;
  let j=S.jahr+(S.monat>=5?1:0); while(j%3) j++; return `Juni ${j}`;
}
// Phase 0: angekündigt, nächsten Monat wird geboten. Text für "Das steht an", leer wenn nichts ansteht.
function aukInfo(){const a=S.auktion; return a&&a.phase===0&&S.rang>=R_AUKTION?`🔨 Nächsten Monat Auktion: ${losText(a)}, Start bei ${eur(a.start)}${aukDeckel(a)?', für deinen Rang zu groß':''}`:''}
// Ergebnis für den Fuß der Zeitung, im Monat nach dem Bieten.
function aukErgebnis(){
  const a=S.auktion; if(!a.ende) aukOhneDich();
  if(a.ende==='niemand') return `Für ${losText(a)} ${WO[S.region]} fand sich kein Bieter.`;
  return `Auktion ${WO[S.region]}: ${a.ende==='du'?S.name:a.ende} bekommt ${losText(a)} für ${eur(a.gebot)}.`;
}

/* ================= Ereignisse ================= */
// Rund zwei im Jahr, halb gut, halb schlecht. Nur in ruhigen Monaten: kein Wettbewerb, keine Auktion, kein Prüfer und kein großes Thema in der Zeitung.
// Je Ereignis: ok sagt, ob es gerade passen kann, los führt es aus und meldet es mit Wichtigkeit 80 in der Zeitung.
function feldHaengt(){return weinberge().filter(id=>{const f=S.felder[id];return f.reben&&f.menge>0&&!f.gelesen})}
function kritikerWein(l){return l.status==='flasche'&&l.stufe&&STUFEN[l.stufe].rang>=3}
function monatNr(){return (S.jahr-START_JAHR)*12+S.monat}
function variante(k){S.vz=S.vz||{}; const V=VARIANTEN[k], i=(S.vz[k]=(S.vz[k]||0)+1)-1; return V[i%V.length]}
// S.erIn zählt die Monate bis zum nächsten Ereignis. Passt es gerade nicht, wartet es auf den nächsten ruhigen Monat.
function ereignisMonat(){
  if(S.erIn==null) S.erIn=rint(4,8);
  if(--S.erIn>0) return;
  if(S.wett||S.auktion||S.pruefer||(S.jahr-START_JAHR)*12+S.monat<6||TOP.some(x=>x.p>=55)) return;
  for(const s of Math.random()<.5?['gut','schlecht']:['schlecht','gut']){
    const M=Object.values(EREIGNIS[s]).filter(e=>e.ok());
    if(M.length){M[rint(0,M.length-1)].los(); S.erIn=rint(4,8); return}
  }
}

/* ================= Computer-Winzer ================= */
// Läuft einmal im Monat für jeden Gegner und liefert die Nachrichten des Monats.
// Übergabe beim Gegner: neuer Vorname aus GEGNER_ERBE, Nachname und Art bleiben. Steuer aufs Vermögen, was fehlt, wird Kredit. Gibt die Zeitungsmeldung zurück.
function gegnerErbe(g){
  const E=GEGNER_ERBE[g.typ], teile=g.name.split(' '), vor=teile.shift(), fam=teile.join(' '), alt=g.name;
  g.vornamen=(g.vornamen||[]).concat(vor);
  const frei=E.namen.filter(x=>!g.vornamen.includes(x)), vn=(frei.length?frei:E.namen)[rint(0,(frei.length?frei:E.namen).length-1)];
  const steuer=Math.max(0,Math.round(gVerm(g)*ERB_STEUER/100)*100), bar=Math.min(steuer,Math.max(0,g.geld));
  g.geld-=bar; g.kredit+=steuer-bar; g.ansehen*=ERB_ANSEHEN;
  g.name=vn+' '+fam; g.gen=(g.gen||1)+1; g.genVers=rint(1,3);
  return E.text(alt,vn,WO[g.region]);
}
function gegnerMonat(){
  const N=[], m=S.monat, st0=DIFF[S.schwer].ki, neu=(p,t)=>N.push({p,t});
  for(const g of S.gegner){
    const t=GEGNER_TYP[g.typ], wo=WO[g.region], heim=g.region===S.region;
    // Angeregte Kontrolle: Der Prüfer kommt. g.pansch zählt die Monate, in denen er gepanschten Wein finden würde.
    if(g.angeregt){
      g.angeregt=0;
      if(g.pansch>0){const st=Math.max(STRAFE_MIN,Math.round(g.geld*.15/100)*100); g.pansch=0; g.geruecht=false; g.ansehen=Math.max(0,g.ansehen-ANREG_ANS); g.geld-=st; schlag(64,`Panscherei bei ${g.name} aufgeflogen`,`Auf deinen Hinweis hin hat der Prüfer den Keller von ${g.name} ${wo} durchsucht und gepanschten Wein gefunden. Das kostet ${eur(st)} Strafe und ${ANREG_ANS} Ansehen.`,'kontrolle',{archiv:1})}
      else{ruhm(-ANREG_FEHL); schlag(64,`Kontrolle bei ${g.name} ohne Befund`,`Der Prüfer hat bei ${g.name} ${wo} nichts gefunden. Dass der Hinweis von dir kam, hat sich herumgesprochen. Das kostet dich ${ANREG_FEHL} Ansehen.`,'kontrolle',{archiv:1})}
    }
    if(g.pansch>0&&--g.pansch<=0) g.geruecht=false;
    // Auch die Gegner fangen mit kahlem Weinberg an: Jahr 1 bringt 20 %, Jahr 2 60 %, danach voll.
    if(m===0) g.jahre=(g.jahre||0)+1;
    // Schritt G 7.0: Generationswechsel ein bis drei Jahre nach deinem, nach denselben Regeln.
    if(m===0&&S.jahr-START_JAHR>=GEN_JAHRE*(g.gen||1)+(g.genVers||1)) neu(9,gegnerErbe(g));
    const auf=Math.min(1,.2+.4*((g.jahre||0)-1));
    // Aufstiegstempo: Die Gegner fangen gemütlich an und werden über die Jahre stärker.
    const st=st0*(GEGNER_START+(GEGNER_ENDE-GEGNER_START)*clamp(((g.jahre||1)-1)/GEGNER_JAHRE,0,1));
    if(m===0){
      // Schritt 3 (6.0): Das Gebiet wirkt über regionF auf das Einkommen, wie bei dir über Preis, Lese-Menge, Sekt und Sterne.
      const gew=Math.round(g.ha*rnd(t.eink[0],t.eink[1])*st*auf*regionF(g.region)/100)*100;
      // Auch die Gegner zahlen Steuer auf den Jahresgewinn und pflanzen nach, sobald ihr Weinberg voll trägt.
      g.geld+=gew-(gew>0?Math.round(gew*STEUER/100)*100:0)-(auf===1?g.ha*GEGNER_ABNUTZ:0);
      if(gew>0&&auf===1) g.ansehen+=4*st;
      if(gew<0) neu(3,`${g.name} hat sich verkalkuliert und schließt das Jahr mit Verlust ab.`);
      else if(auf===1&&gew>g.ha*(t.eink[0]+(t.eink[1]-t.eink[0])*.9)*st) neu(1,`${g.name} meldet ein Rekordjahr.`);
      if(g.kredit>0&&g.geld>0){const r=Math.min(g.kredit,Math.round(g.geld*.5)); g.geld-=r; g.kredit-=r; if(!g.kredit) neu(2,`${g.name} ist bei der Bank wieder schuldenfrei.`)}
    }
    // Seit 13.4.7: Der Kälteeinbruch der Gegner (warm und Mitte) kommt in den Jahren, in denen die Edelfäulnis im eigenen Weg nicht klappt (uEdel ab WAGNIS.eigen, 30 statt 25 Prozent,
    // Annahme von Claude). Er trifft, wer noch Trauben hängen hat, die Vorsichtige meist nicht. Der Umbau der Gegner kommt in 13.5.
    if(m===10&&REGIONEN[g.region].weg!=='frost'&&herbstJahr().uEdel>=WAGNIS.eigen&&auf>.2&&(g.poker||Math.random()<(g.typ==='vorsicht'?.2:.6))){g.geld-=g.ha*(g.poker?2500:1500); g.poker=false; neu(3,`Kälteeinbruch ${wo}: Bei ${g.name} ist erfroren, was noch hing.`)}
    if(m===1&&g.jahre){g.ansehen+=rnd(t.ans[0],t.ans[1])*st*auf; if(Math.random()<.5) neu(1,`${g.name} meldet im Rathaus ${t.weine[rint(0,t.weine.length-1)]} an.`)}
    if(m===2&&!heim&&auf===1&&Math.random()<t.med*st){const P=PREISE.land[rint(0,2)]; g.ansehen+=P.ans*st; neu(4,`${g.name} holt ${P.t} bei der Landesprämierung ${wo}.`)}
    if((!heim||g.ha>=gegnerDeckel(g))&&Math.random()<1/18){
      const ha=auktionHa(), pr=Math.round(ha*rnd(12000,26000)/500)*500;
      if(g.geld+(g.typ==='zocker'?30000:0)>=pr&&Math.random()<t.biet*st*bietF()){g.geld-=pr; g.ansehen+=2*(3+Math.min(ha,7))*st; const voll=g.ha+ha>gegnerDeckel(g); if(!voll) g.ha+=ha; neu(4,voll?`${g.name} baut den Keller aus.`:`${g.name} ersteigert ${ha}\u00a0Hektar ${wo}.`)}
    }
    // Panschen im Oktober: Zocker oft, die anderen selten. Mal fliegt es gleich auf, sonst bleibt es eine Weile im Keller, manchmal mit Gerücht.
    if(m===9&&Math.random()<PANSCH[g.typ]){
      if(Math.random()<.35){g.ansehen=Math.max(0,g.ansehen-40); g.geld-=Math.round(Math.max(2000,g.geld*.1)); neu(5,`Weinkontrolle bei ${g.name}: gepanschter Wein gefunden. Das kostet Strafe und Ansehen.`)}
      else{g.geld+=g.ha*(g.typ==='zocker'?2500:1000); g.pansch=rint(6,14); if(Math.random()<.4){g.geruecht=true; neu(8,`Man munkelt, bei ${g.name} werde heimlich nachgezuckert.`)}}
    }
    // Seit 13.4.7: Der Eiswein-Poker des Zockers hängt am Jahr und am Weg seines Gebiets (wegChance, Wurf aus herbstJahr) statt am alten Frost-Wert.
    if(g.typ==='zocker'){
      if(!g.kredit&&Math.random()<.04){const k=12000*(g.rang+1); g.geld+=k; g.kredit=Math.round(k*1.2); neu(2,`${g.name} nimmt einen Kredit über ${eur(k)} auf.`)}
      if(m===9){
        if(wegChance('frost',g.region)>0&&Math.random()<.35){g.poker=true; neu(2,`${g.name} pokert auf Eiswein und lässt alles hängen.`)}
      }
      if(m===11&&g.poker){
        g.poker=false;
        if(herbstJahr().uFrost<wegChance('frost',g.region)){g.ansehen+=16*st; g.geld+=g.ha*3000; g.eisJ=S.jahr; neu(3,`Frost ${wo}: Der Eiswein-Poker von ${g.name} geht auf.`)}
        else{g.geld-=g.ha*2500; g.eisPl=S.jahr; neu(3,`Kein Frost ${wo}: ${g.name} verliert einen Teil der Ernte.`)}
      }
    }else if(m===8&&Math.random()<.3) neu(0,g.typ==='vorsicht'?`${g.name} liest früh und geht kein Risiko ein.`:`${g.name} lässt die Trauben für eine Auslese hängen.`);
    if(g.geld<0){g.kredit+=Math.round(-g.geld*1.15); g.geld=0}
    const alt=g.rang; g.rang=rangFuer(g.rang,g.ansehen,g.ha,gVerm(g));
    if(g.rang>alt){
      // Seit 10.3: Präsident heißt nur, wer auf dem Stuhl sitzt. Rang zehn macht einen Gegner zum Herausforderer, außer er ist der Erste (gegnerSieg). Gegnerinnen bekommen die weiblichen Ränge (A14).
      if(g.rang===R_MAX){if(S.sieger) neu(9,`${g.name} hat alle Hürden für den großen Stuhl geschafft und wartet jetzt auf die nächste Wahl.`)}
      else neu(9,`${g.name} steigt auf und ist jetzt ${gFrau(g)&&RAENGE[g.rang].w||RAENGE[g.rang].name}.`);
      if(alt<=S.rang&&g.rang>S.rang&&GEGNER_SPRUCH[g.typ]) neu(9,GEGNER_SPRUCH[g.typ].vorbei(g.name));
      if(g.rang===R_MAX&&!S.sieger) gegnerSieg(g,wo);
    }
  }
  N.sort((a,b)=>b.p-a.p);
  return N.filter((n,i)=>n.p>=9||i<3).map(n=>n.t);
}
function maschLeistung(){return maschEinsatz().reduce((a,m)=>a+Math.round(mTyp(m).leist*m.zustand/100),0)}
function alleinReben(){return ALLEIN_HA*HA_REBEN}
function leistung(){return alleinReben()+S.helfer*HELFER_LEISTUNG+maschLeistung()}
function leseFaktor(id){const t=leseTeile(); if(id!=null) return !maschDarf(id)?t.hand:t.masch; const b=t.sp+t.rest; return b?(t.sp*t.hand+t.rest*t.masch)/b:1}
// Leute-Regel: Gezählt werden Köpfe. Seit 8.0 zählt eine Maschine nur im Einsatz (Fahrer da, Zustand ab MASCH_ROT), darüber bremst der Zustand nur die Ernteleistung.
// Seit 11.5 (Teil C1) wird in Reben gerechnet: helferReben sagt, für wie viele Reben die Familie, h Erntehelfer und die Maschinen im Einsatz übers Jahr reichen.
// Seit 13.5.5 decken die Erntemaschinen nur Reben der Menge- und Sekt-Sorte ab, die Spitzen-Sorte braucht immer Erntehelfer.
function helferReben(h){h=h==null?S.helfer:h; const mh=maschTeile(h,m=>mTyp(m).helfer*HA_REBEN); return alleinReben()+h*REBEN_JE_HELFER+Math.min(maschDeckt(mh.kl,mh.gr),rebenGesamt()-handLeseReben())}
// Seit 13.5.5 (Maik 21.11.2026, Leitsatz: die Maschine für die Menge, die Hand für die Qualität): Erntemaschine und Vollernter lesen nur Menge- und Sekt-Sorte,
// die Spitzen-Sorte lesen Familie und Erntehelfer immer von Hand, auch Kabinett und Spätlese. leseTeile rechnet, welcher Anteil je Gruppe gelesen wird:
// Die Maschinen nehmen von Menge und Sekt, was sie schaffen, den Rest und die ganze Spitzen-Sorte lesen die Hände.
const spitzeId=id=>(SORTEN[id]||{}).rolle==='spitze';
function handReben(){return R().sorten.filter(spitzeId).reduce((a,id)=>a+S.felder[id].reben,0)+slFl()} // seit 14.4.4 mit der ganzen Spitzenlage
// Seit 14.5.3 (Annahme 10): Die Erntemaschine deckt nur Flachbogen-Fläche ab, der Vollernter Flachbogen und Kordon. maschDeckt rechnet, wie viele Reben
// die Maschinen abdecken können, kl und gr sind Leistung (oder Hektar in Reben) der Erntemaschinen und der Vollernter.
function maschDeckt(kl,gr){const T={flach:0,voll:0}; if(!R().steil) for(const id of weinberge()){const m=FORMEN[formVon(id)].masch; if(m===1) T.flach+=S.felder[id].reben; else if(m==='voll'&&gr>0) T.voll+=S.felder[id].reben}
  return Math.min(T.flach+T.voll,Math.min(kl,T.flach)+gr)}
function maschTeile(h,wert){const o={kl:0,gr:0}; for(const m of maschEinsatz(h)) o[mTyp(m)===MASCH.gross?'gr':'kl']+=wert(m); return o}
function leseTeile(){const sp=handLeseReben(), rest=rebenGesamt()-sp, mL=maschTeile(undefined,m=>Math.round(mTyp(m).leist*m.zustand/100)), mT=Math.min(maschDeckt(mL.kl,mL.gr),rest), need=sp+rest-mT, H=alleinReben()+S.helfer*HELFER_LEISTUNG, hf=need?Math.min(1,H/need):1;
  return {hand:hf,masch:rest?(mT+(rest-mT)*hf)/rest:1,sp,rest}}
// Erntehelfer, die es ohne Maschinen braucht (nur für die Anzeige).
function helferBedarf(){return Math.max(0,Math.ceil((rebenGesamt()-alleinReben())/REBEN_JE_HELFER))}
// Seit 8.0 (Paket B): Mit der Abfüllanlage im Einsatz betreut ein Lagerarbeiter ABF_FLASCHEN leere Flaschen, sonst FLASCHEN_JE_LAGERARB.
const abfStufe=ma=>ma&&ma.stufe>=2?2:1;
function abfPlus(){const ma=bonusMasch('abfuell'); return ma?(abfStufe(ma)>1?ABF_PLUS2:ABF_PLUS):0}
const abfJe=ma=>abfStufe(ma)>1?ABF_FLASCHEN2:ABF_FLASCHEN;
function flJeLager(){const ma=bonusMasch('abfuell'); return ma?abfJe(ma):FLASCHEN_JE_LAGERARB}
// Seit 10.3 (B9): Für die Leute-Sperre zählt ABF_FLASCHEN auch, wenn die Anlage ausgefallen ist. Bei Rot fällt nur der Bonus beim Abfüllen weg.
function flSperre(){const r=S.maschinen.find(m=>m.typ==='abfuell'&&m.zustand<MASCH_ROT); return r?abfJe(r):flJeLager()}
// Seit 11.5 (Teil C1): so viel Fassraum und so viele leere Flaschen betreuen die Familie und n Lagerarbeiter.
function fassKap(n){return ALLEIN_FASS+(n==null?S.lagerarb:n)*FASS_JE_LAGERARB}
function flKap(n){return ALLEIN_FL+(n==null?S.lagerarb:n)*flJeLager()}
function lagerBedarf(){return Math.max(0,Math.ceil((S.fassraum-ALLEIN_FASS)/FASS_JE_LAGERARB),Math.ceil((S.flaschen-ALLEIN_FL)/flSperre()))}
// Die Leute-Regel als Satz ohne Punkt, für Arbeitsamt, Betrieb, Sperre und den Start. Mit den Zahlen bis 11.4 (ALLEIN_HA 0) liest er sich wie früher.
function haWort(n){return n===1?'Hektar':`${String(n).replace('.',',')} Hektar`}
function helferRegel(){const je=`einen Erntehelfer je ${haWort(REBEN_JE_HELFER/HA_REBEN)} Reben`; return ALLEIN_HA?`Die ersten ${ALLEIN_HA} Hektar Reben schaffst du mit deiner Familie allein, darüber brauchst du das ganze Jahr ${je}`:`Du brauchst das ganze Jahr ${je}`}
function lagerRegel(fl){const was=`${num(FASS_JE_LAGERARB)}\u00a0l Fassraum und ${num(fl||FLASCHEN_JE_LAGERARB)} leere Flaschen`; return ALLEIN_FASS||ALLEIN_FL?`${num(ALLEIN_FASS)}\u00a0l Fassraum und ${num(ALLEIN_FL)} leere Flaschen betreust du selbst, jeder Kellermensch schafft ${was} dazu`:`Ein Kellermensch betreut ${was}`}
// Abfüllen (von Hand und beim Kellermeister): mit der Abfüllanlage ABF_PLUS mehr Flaschen aus dem Fass, dafür so viele leere Flaschen.
// Die Anlage nutzt sich je ABF_NORM Flaschen um ABF_ABN Prozentpunkte ab, mal Pflege-Faktor.
function abfFl(l){const p=abfPlus(); return p?Math.round(l.liter*(1+p)):l.liter}
function fuelleAb(l){const ma=bonusMasch('abfuell'), n=abfFl(l); S.flaschen-=n; l.liter=n; l.status='flasche'; l.flMonate=0; if(ma) abnutz(ma,ABF_ABN*n/ABF_NORM); return n}
// Düngen (von Hand und beim Weingut-Manager): mit dem Düngerstreuer im Einsatz billiger und mehr Boden, er nutzt sich je Düngung um STREU_ABN ab.
// Seit 14.7.4 (Annahme 10): Düngen je Weinberg nach seinen Hektar (bis 14.7.3 nach der ganzen Fläche), höchstens DUENG_MAX Mal im Jahr je Weinberg (f.duengN).
// Der Düngerstreuer nutzt sich je Düngung nach dem Anteil des Weinbergs an allen Reben ab, so wie bis 14.7.3 eine Düngung fürs Gut (Annahme der Bau-Sitzung).
// S.duengungen zählt weiter alle Düngungen des Jahres (Spielführer e1-09).
function duengKosten(id){return Math.round(DUENGER_HA*((S.felder[id]||{}).reben||0)/HA_REBEN*(bonusMasch('duenger')?1-STREU_RABATT:1))}
const duengOffen=id=>{const f=S.felder[id]; return !!f&&f.reben>0&&(f.duengN||0)<DUENG_MAX&&f.boden<100};
const duengAnteil=id=>{const a=weinberge().reduce((s,x)=>s+(S.felder[x].reben||0),0); return a?(S.felder[id].reben||0)/a:1};
function duengPlus(){return bonusMasch('duenger')?STREU_PLUS:DUENG_PLUS}
function duenge(id,wer='chef'){const f=S.felder[id], ma=bonusMasch('duenger'), p=duengPlus(); zahle(duengKosten(id)); S.duengungen++; f.duengN=(f.duengN||0)+1;
  (f.duengZ=f.duengZ||[]).push(zuwachsVon(wer,1)); f.boden=Math.min(100,f.boden+p); if(ma) abnutz(ma,STREU_ABN*duengAnteil(id)); return p}
function leuteFehlen(){return {helfer:helferFehlen(),lagerarb:Math.max(0,lagerBedarf()-S.lagerarb)}}
// "Es fehlen 2 Erntehelfer und 1 Lagerarbeiter" oder leer, wenn niemand fehlt. Seit 8.0 mit dem Hinweis auf Fahrer, wenn Maschinen stillstehen.
function fehlText(){
  const f=leuteFehlen(), t=[];
  if(f.helfer) t.push(`${f.helfer} Erntehelfer${maschOhneFahrer().length?' (auch als Fahrer für deine Maschinen)':''}`);
  if(f.lagerarb) t.push(kellerZahl(f.lagerarb));
  return t.length?`${f.helfer+f.lagerarb===1?'Es fehlt':'Es fehlen'} ${t.join(' und ')}`:'';
}
// Seit 13.4.1: handLohnF des Gebiets (Mosel) auf den Lohn der Erntehelfer, sie lesen von Hand.
function neuesLohnAngebot(){S.angebot={};for(const k of LOHN_ARTEN) S.angebot[k]=Math.round(rint(LOHN_MIN/10,LOHN_MAX/10)*LOHN_F*(spLohn(3)?SP_LOHN:1)*(k==='helfer'?R().handLohnF||1:1))*10}
// Seit 14.4.1 (Maik 24.11.2026, Löhne je Stufe): Faktor LEUTE_LOHN_F der Gruppe nach ihrer Stufe, ohne Stufe der erste. Startwert 1, dann bleibt alles wie vorher.
const leuteLohnF=k=>((LEUTE_LOHN_F[k]||[])[Math.max(0,leuteSt(k)-1)]??1);
function lohnSumme(k){const s=S.loehne[k].reduce((a,b)=>a+b,0), f=leuteLohnF(k); return f===1?s:Math.round(s*f)}
function lohnListe(k){const z=new Map();for(const n of S.loehne[k]) z.set(n,(z.get(n)||0)+1);return [...z].map(([n,c])=>`${c} × ${eur(n)}`).join(', ')}
// Günstig ist das untere Sechstel der Spanne, teuer das obere (bis 11.4: bis 250 und ab 450 €).
const lohnLage=n=>n<=lohnF(LOHN_MIN+(LOHN_MAX-LOHN_MIN)/6)?'günstig':n>=lohnF(LOHN_MAX-(LOHN_MAX-LOHN_MIN)/6)?'teuer':'normal';
// Bringt die Lohnliste auf die Zahl der Angestellten. Alte Spielstände ohne Lohnliste bekommen den Startlohn.
function lohnAbgleich(){
  if(!S.loehne) S.loehne={helfer:[],lagerarb:[]};
  for(const k of LOHN_ARTEN){const a=S.loehne[k]; while(a.length<S[k]) a.push(lohnF(LOHN_START)); a.length=S[k]; a.sort((x,y)=>x-y)}
  if(!S.angebot) neuesLohnAngebot();
}
function kosten(){const k=S.kredit;return {basis:150+HA_KOSTEN_KLEIN*Math.min(S.ha,HA_FREI)+HA_KOSTEN*Math.max(0,S.ha-HA_FREI),loehne:lohnSumme('helfer')-spDorfLohn()+lohnSumme('lagerarb')+mgrLohn(),tilgung:k?Math.min(k.rest,k.tilgung):0,zins:k?Math.round(k.rest*ZINS/12):0}}
function schulden(){return (S.kredit?S.kredit.rest:0)+Math.max(0,-S.geld)}
function sektKosten(){return Math.round(SEKT_KOSTEN*(S.sektAnlage?SEKT_ANLAGE_F:1)*100)/100}
const hefeLang=l=>(l.hefe||SEKT_REIFE)>SEKT_REIFE;
// Schritt 3: dazu sektPreisF des Gebiets aus REGIONEN (ohne Eintrag 1). Der Name ist nicht sektF, weil es diese Funktion schon gibt.
function sektF(l){return l.sekt?SEKT_F*(SORTEN[l.sorte].sektStar?SEKT_STAR:1)*(R().sektPreisF||1):1}
function regionF(id){const r=REGIONEN[id]; return (r.preisF||1)*(r.ertragF||1)*(1+GEGNER_SEKT*((r.sektPreisF||1)-1))*STERN_PREIS_3}
// Seit 13.3.3: Sekt-Ansehen einmal im Jahr, in dem mindestens ein Sekt angemeldet wird. Der Sekt gilt mit der Lese als angemeldet.
function sektAnsText(){return S.sektJahr===S.jahr?`Die ${ansQ(SEKT_ANS,'Weine')} Ansehen für Sekt hast du dieses Jahr schon.`:`Der erste Sekt des Jahres bringt ${ansQ(SEKT_ANS,'Weine')} Ansehen.`}
// Seit 13.3.5: Zuschlag für Pflegestufe und Terroir aufs Ansehen bei der Anmeldung.
// Seit 14.2.6 (Annahme 15): 1 Ansehen je ANS_JE_QP Qualitätspunkte statt der festen Zuschläge für Pflegestufe und Terroir.
const ansZuschlag=l=>Math.floor((l.qp||0)/ANS_JE_QP);
// Seit 14.5.5: Punkte, die dem Wein zum Anspruch seiner Weinstufe fehlen (dritter Schlüssel). Bis 14.5.4 kosteten sie über anspruchF Preis und Ansehen (ausgeschaltet).
const anspruchFehlt=(st,qp)=>Math.max(0,((ANSPRUCH||{})[st]||0)-(qp||0));
function sektAnmelden(l){if(l.pansch||S.sektJahr===S.jahr) return 0; S.sektJahr=S.jahr; return ruhm(SEKT_ANS+ansZuschlag(l),0,'Weine')}
const sektSorte=id=>!!S.rollen&&(SORTEN[id]||{}).rolle==='sekt';
// Sekt, der noch auf der Hefe liegt, für den Sektkeller.
// Seit 13.5.8 (Maik 22.11.2026, Entscheidung 6): Sekt in zwei Handgriffen, bis Lagerarbeiter Stufe 3 sie übernimmt (lagerArbeit).
// Die Lese der Sekt-Sorte legt Sekt-Trauben in den Keller (status 'sektTr'), die Hefe-Wahl ist schon getroffen. In den Sektkeller (Tirage, status 'hefe')
// kostet Sektflasche, Korken und Agraffe und bringt das Sekt-Ansehen. Nicht umgelagerte Sekt-Trauben verderben zum Monatsende wie nicht gekelterte Trauben.
// Ist die Hefezeit um, wird abgefüllt (degorgiert, status 'flasche'), erst dann hat er einen Preis. Die Lagerzeit zählt ab dem Umlagern (flMonate),
// fertiger Sekt wartet ohne Verlust auf der Hefe (Annahmen von Claude, mit der Lenk-Sitzung abgestimmt).
const sektAufHefe=()=>S.lots.filter(l=>l.status==='hefe');
const sektTrauben=()=>S.lots.filter(l=>l.status==='sektTr');
const sektFertig=l=>l.status==='hefe'&&l.flMonate>=lager(l).min;
function sektUmlagern(l){if(!l||l.status!=='sektTr'||!S.sektkeller) return 0; zahle(Math.round(l.liter*sektKosten()*100)/100); l.status='hefe'; l.flMonate=0; l.ans=sektAnmelden(l); return 1}
function sektAbfuellen(l){if(!l||l.status!=='hefe') return 0; l.status='flasche'; tatMerk('sekt'); return 1}
// Spielstände bis 13.5.7: Sekt, der noch auf der Hefe liegt, wechselt einmal in den neuen Zustand, fertiger gilt als abgefüllt.
function altHefe(){if(S.v1358) return; for(const l of S.lots) if(l.sekt&&l.status==='flasche'&&l.flMonate<lager(l).min) l.status='hefe'; S.v1358=1}
// hefe ist das Hefelager in Monaten, nur gespeichert, wenn es länger als SEKT_REIFE ist.
/* ================= Wetter ================= */
function wuerfelWetter(m,u){
  const r=u!=null?u:Math.random(), fr=WINTER_FROST;
  let t;
  if(m===11||m<=1) t=[['frost',fr],['kalt',.4],['regen',.2],['mild',1]];
  else if(m===10) t=[['kalt',.45],['regen',.3],['mild',1]];
  else if(m===3) t=[['frost',.1],['kalt',.1],['regen',.3],['sonnig',.2],['mild',1]];
  else if(m===2||m===4) t=[['frost',.03],['kalt',.1],['regen',.3],['sonnig',.2],['mild',1]];
  else if(m<=7) t=[['sonnig',.5],['regen',.2],['mild',1]];
  else t=[['sonnig',.3],['regen',.3],['kalt',.05],['mild',1]];
  let s=0; for(const [w,p] of t){s+=p; if(r<s) return w}
  return 'mild';
}
function neuePrognose(){
  // Seit 11.6: alles aus der Startzahl, gerechnet auf den Monat, für den es gilt (jn, n).
  const n=(S.monat+1)%12, jn=n===0?S.jahr+1:S.jahr; S.wetterNext=wuerfelWetter(n,fest(1,0,jn,n));
  S.prognose=fest(3,0,jn,n)<.75?S.wetterNext:wuerfelWetter(n,fest(3,2,jn,n));
}
// Vorhersage als Text. Seit 13.4.2 gibt es den Kälteeinbruch als eigene Vorhersage nicht mehr.
const progText=()=>WETTER[S.prognose].join(' ');
const wbonus=w=>({sonnig:5,mild:0,regen:-4,kalt:-3,frost:-3}[w]);
// Seit 11.6: streu darf eine feste Zahl zwischen 0 und 1 sein (fest), true würfelt wie früher.
function tempFuer(m,w,streu){
  const st=(a,b)=>typeof streu==='number'?festI(a,b,streu):rint(a,b);
  if(w==='frost') return (m>=2&&m<=4?-2:-4)+(streu!=null&&streu!==false?st(-2,1):0);
  return Math.max(1,TEMP_MONAT[m]+TEMP_WETTER[w]+(streu!=null&&streu!==false?st(-1,1):0));
}
const wetterText=()=>`${WETTER[S.wetter].join(' ')}, ${S.temp!=null?S.temp:tempFuer(S.monat,S.wetter)} °C`;

// Seit 13.4.2 (Bauplan 13.4, Maik 21.11.2026): Edelfäulnis kommt nicht mehr von selbst und schiebt das Öchsle nicht mehr an. Sie ist, wie der Frost
// für den Eiswein, das Wagnis im Herbst der Spitzen-Sorte (herbstWagnis). Der Kälteeinbruch als eigener Wurf ist weg, er erklärt nur noch ein misslungenes Wagnis.
function wachse(m){
  const reg=R(), L=[];
  // Seit 8.2: Erntedank-Segen nach der Spende fürs Kirchenfenster, einmal im September SP_SEGEN Öchsle mehr.
  const segen=m===8&&S.spSegen; if(segen){S.spSegen=0; if(weinberge().some(id=>S.felder[id].menge>0&&!S.felder[id].gelesen)) L.push(`Erntedank-Segen: Deine Trauben bekommen diesen Monat ${SP_SEGEN}° Öchsle extra.`)}
  // Seit 13.4.2: Im Dezember richtet sich das Wetter nach dem Frost-Wagnis, wenn ein Feld darauf wartet (wagnisWetter).
  if(m===11) wagnisWetter();
  const w=S.wetter;
  // Seit 14.4.4 alle Weinberge, die Spitzenlage würfelt wie der Weinberg ihrer Sorte (si der Sorte). Seit dem Nachtrag zu 14.5.4 steckt ihr Klima in zuckerIm (KLIMA_LAGE).
  for(const [si,id] of weinberge().map(x=>[reg.sorten.indexOf(stamm(x)),x])){
    const f=S.felder[id], so=SORTEN[id]; if(!f.reben) continue;
    if((m===3||m===4)&&w==='frost'){f.frostF=formSchutz(id,SPAETFROST_MENGE); L.push(`Spätfrost schädigt die Blüte beim ${so.name}.`)}
    // Seit 13.2.2: statt der Jungreben der Mengen-Faktor der Rebpflege (pflegeMenge).
    // Seit 14.2.4 mal der Menge der Erziehungsform, seit 14.5.3 für jede Sorte gleich (formMenge).
    if(m===5) f.menge=Math.round(f.reben*pflegeMenge(f,id)*formMenge(id)*so.ertrag*(reg.ertragF||1)*(.6+.4*f.boden/100)*(1+BODEN_ST_MENGE*wbBoden(id))*f.frostF*festR(.9,1.1,fest(6,si,S.jahr,m)));
    // Seit 13.2.3: Das Wetter-Öchsle zählt höchstens bis zur Grenze des Weinbergs (oeGrenze: Deckel, Edelfäulnis der Spitzen-Sorte bis EDEL_OE_MAX, nach den Rosinen bis OE_MAX).
    if(m===6){f.oe=Math.min(oeGrenze(id),OE_START+zuckerIm(id)+wbonus(w)+festI(-2,2,fest(5,si,S.jahr,m))); f.reif=5; f.ueber=0; f.plus=0}
    if(m>=7&&f.menge>0&&!f.gelesen){
      // f.plus merkt den Öchsle-Zuwachs des Monats für die Infoseite.
      const vor=f.oe;
      f.oe=Math.min(oeGrenze(id),f.oe+OE_PLUS[m-7]+wbonus(w)+festI(-2,2,fest(5,si,S.jahr,m))+(segen?SP_SEGEN:0)); f.plus=f.oe-vor;
      f.reif=clamp([35,70,92,100,100][m-7]+(w==='sonnig'?5:w==='regen'?-5:0),0,100);
      f.ueber=clamp([0,5,20,45,70][m-7]+(w==='sonnig'?5:0)+(f.edel?EDEL_UEBER:0),0,100);
      if(m===9&&w==='regen') f.menge=Math.round(f.menge*formSchutz(id,REGEN_OKT_MENGE));
      // Seit 13.4.2: Jeder Monat über Oktober hinaus kostet Menge (WARTEN_MENGE), danach entscheidet das Wagnis.
      if(m>=10){f.menge=Math.round(f.menge*WARTEN_MENGE); herbstWagnis(id,f,so,m,L)}
    }
  }
  return L;
}
/* ================= Herbst der Spitzen-Sorte (seit 13.4) ================= */
// Die Würfe des Jahres aus dem festen Wetter (Thema 11), für Spieler und Gegner gleich. Neu laden ändert nichts.
function herbstJahr(j=S.jahr){return {uEdel:fest(11,0,j,0),uFrost:fest(11,1,j,0),uTend:fest(11,2,j,0),uFremd:fest(11,3,j,0),uTba:fest(11,4,j,0)}}
// Die Tendenz des Herbstes in der Mitte (seit 13.4.3).
// Seit 13.4.4: ein besonderes Jahr, das in warmen und kühlen Gebieten den fremden Weg öffnet.
const herbstFremd=(j=S.jahr)=>herbstJahr(j).uFremd<FREMD_JAHR;
// Seit 13.6.1: Im Jahrhundertjahr meldet die Mitte die passende Tendenz klar (JH_ART), sonst gilt der Wurf.
const herbstTend=(j=S.jahr)=>{const a=REGIONEN[S.region].weg==='beide'&&jhArt(j); return a?TENDENZEN.find(t=>t.k===JH_ART[a].tend):TENDENZEN[Math.min(TENDENZEN.length-1,Math.floor(herbstJahr(j).uTend*TENDENZEN.length))]};
/* ================= Jahrhundertjahre (seit 13.6.1) ================= */
// Seit 14.2.5 (Entscheidungen 21, 25, 29): Die Jahrhundertjahre hängen nicht mehr am Terroir. Sie liegen um START_JAHR+JH_ERST, dann alle JH_ABSTAND Jahre,
// jedes bis zu JH_STREU Jahre früher oder später, je Partie fest gewürfelt (fest, Thema 12). S.jhAb merkt das erste, gesetzt beim Start der Partie.
function jhJahre(){const J=[]; for(let k=0;k<JH_ANZAHL;k++) J.push(START_JAHR+JH_ERST+k*JH_ABSTAND+festI(-JH_STREU,JH_STREU,fest(12,k,START_JAHR,0))); return J}
const jhNr=(j=S.jahr)=>jhJahre().indexOf(j);
// Seit 13.6.9: wie jhArt, aber nur in den echten Jahrhundertjahren nach dem Vorgeschmack (JH_VOR). Nur sie ändern Chancen und geben den Jahrhundertwein.
const jhEcht=(j=S.jahr)=>jhNr(j)>=JH_VOR?jhArt(j):null;
// sommer oder winter im Jahrhundertjahr j, sonst null. Warm Sommer, kühl Winter, die Mitte abwechselnd mit dem Sommer zuerst.
function jhArt(j=S.jahr){const k=jhNr(j); if(k<0) return null; const g=REGIONEN[S.region].weg; return g==='edel'?'sommer':g==='frost'?'winter':k%2?'winter':'sommer'}
// Probestände, die schon Terroir haben: Das erste Jahrhundertjahr ist das nächste Jahr.
// Seit 13.6.9 (S.jhV): Stände aus 13.6 hatten das erste Jahrhundertjahr im Jahr nach dem Terroir, es rückt auf JH_ABSTAND Jahre nach dem Terroir.
function altJh(){if(S.jhAb!=null&&!S.jhV) S.jhAb+=JH_ABSTAND-1; if((S.bodenSt||0)>=BODEN_STUFEN.length-1&&S.jhAb==null) S.jhAb=S.jahr+1; S.jhV=1}
// Chance des Wegs w (edel oder frost) im Gebiet r im Jahr j, 0 wenn der Weg dort zu ist. Das Rang-Schloss prüft wegeOffen.
// Seit 13.7.6: Grundwert ohne Verschiebung (wegGrund), daraus die Chance (wegChance). Den Grundwert kennt jeder aus dem Weinkompendium.
function wegChance(w,r=S.region,j=S.jahr){const p=wegGrund(w,r,j); return p>=1?1:wagP(p,j)}
function wegGrund(w,r=S.region,j=S.jahr){
  const g=REGIONEN[r].weg, a=r===S.region&&jhEcht(j); let p=0;
  // Seit 13.6.2: Im Jahrhundertjahr hat der Weg des Jahres seine eigene Chance, der Sommer die Edelfäulnis sicher, der Winter den Frost mit JH_CHANCE.
  if(a&&JH_ART[a].weg===w) p=w==='edel'?1:JH_CHANCE;
  else if(g==='beide') p=herbstTend(j).weg===w?WAGNIS.mitTend:WAGNIS.gegenTend;
  else if(g===w) p=WAGNIS.eigen;
  else if(herbstFremd(j)) p=WAGNIS.fremd;
  return p;
}
// Seit 13.7.1: Verschiebung des Jahres j in Prozentpunkten, fest je Partie (Thema 13), in der Spanne der Spielstufe (WAG_SPANNE).
const wagSpanne=()=>WAG_SPANNE[S.schwer]||[0,0];
// Seit 13.7.2: aus den Zeichen (WAG_TEILE): Sommerwetter, Schädlingsjahr und kleiner Rest-Zufall.
function sommerPunkte(j=S.jahr){let s=0; for(let n=SOMMER_MON[0];n<=SOMMER_MON[1];n++) s+=SOMMER_W[wuerfelWetter(n,fest(1,0,j,n))]||0; return clamp(s,SOMMER_SPANNE[0],SOMMER_SPANNE[1])}
function wagTeile(j=S.jahr){const T=WAG_TEILE[S.schwer]||[]; return {sommer:T.includes('sommer')?sommerPunkte(j):0,schaed:T.includes('schaed')&&schaedJahr(j)?-SCHAEDJ_MINUS:0,rest:T.includes('rest')?festR(-WAG_REST,WAG_REST,fest(13,0,j,0)):0}}
function wagRoh(j){const t=wagTeile(j); return t.sommer+t.schaed+t.rest}
// Der Satz der Alten im September (WAG_SATZ) zur Verschiebung des Jahres.
const wagSatz=(j=S.jahr)=>WAG_SATZ.find(x=>wagVers(j)>=x[0]);
function wagVers(j=S.jahr){const [a,b]=wagSpanne(); return Math.round(clamp(wagRoh(j),a,b))}
// Chance mit Verschiebung, ein geschlossener Weg (0) bleibt zu.
const wagP=(p,j=S.jahr)=>p>0?clamp(p+wagVers(j)/100,WAG_MIN,WAG_MAX):0;
// Seit 13.6.2: Chance der Trockenbeerenauslese, im Jahrhundertsommer JH_CHANCE. tbaOffen ist das Rang-Schloss der zweiten Stufe.
const tbaGrund=(j=S.jahr)=>jhEcht(j)==='sommer'?JH_CHANCE:WAGNIS.tba, tbaChance=(j=S.jahr)=>wagP(tbaGrund(j),j);
// Seit 13.7.6: Grundwert der Entscheidung, vor der ein Feld gerade steht (für den Test-Spieler, der die Zeichen liest).
function wagGrundFeld(id){const f=S.felder[id]; if(f.wagnis==='edel') return tbaGrund(); const w=f.wagnis==='frost'?'frost':feldWeg(id); return w?wegGrund(w):0}
// Seit 13.6.9 (Nachtrag 3): Die Ausnahme aus 13.6.7 ist weg, die zweite Stufe öffnet sich auch im Jahrhundertsommer erst bei R8.
const tbaOffen=()=>frei('weg_tba');
// Die Wege, die der Spieler in diesem Jahr wagen darf (frei: weg_eigen).
// Seit 13.4.4 dazu der fremde Weg (frei: weg_fremd) in einem besonderen Jahr.
const wegFremd=g=>g==='edel'?'frost':g==='frost'?'edel':null;
function wegeOffen(){if(!frei('weg_eigen')) return []; const g=R().weg; return (g==='beide'?['edel','frost']:[g,...(frei('weg_fremd')&&herbstFremd()?[wegFremd(g)]:[])]).filter(w=>wegChance(w)>0)}
// Nur die Spitzen-Sorte wagt (Sorten ohne Rolle in Messläufen auch).
const wagnisFeld=id=>rolleDarf(id,'ba');
// Der Weg eines Feldes: schon entschieden (f.wagnis), gewählt (f.weg) oder der mit der besten Chance.
function feldWeg(id){
  const f=S.felder[id], W=wegeOffen(); if(!wagnisFeld(id)) return null;
  if(f.wagnis==='edel'||f.wagnis==='frost') return f.wagnis;
  if(f.wagnis||!W.length) return null;
  return f.weg&&W.includes(f.weg)?f.weg:W.slice().sort((a,b)=>wegChance(b)-wegChance(a))[0];
}
// Seit 13.4.6: die Chance in Worten und die Chance, um die es gerade geht (null, wenn das Feld nichts wagt).
const chanceWort=p=>CHANCE_WORT.find(([g])=>p>=g)[1];
// Seit 13.7.3: die Chance, wie sie am Knopf steht (CHANCE_ZEIGE), leer in der Meisterprüfung. rat: was der alte Winzer in den Lehrjahren tun würde.
const chanceZeige=p=>({zahl:`${Math.round(p*100)}\u00a0%`,wort:chanceWort(p)})[CHANCE_ZEIGE[S.schwer]]||'';
const chanceRat=p=>CHANCE_ZEIGE[S.schwer]==='zahl'?(p>=RAT_WARTEN?'warten':'lesen'):'';
const mgrWarnAb=()=>MGR_WARN_STUFE[S.schwer]!=null?MGR_WARN_STUFE[S.schwer]:MGR_WARN;
function wagnisChance(id){
  const f=S.felder[id], m=S.monat; if(!wagnisFeld(id)||!(f.menge>0)||f.gelesen||f.gefroren) return null;
  if(f.wagnis==='edel') return m===10&&tbaOffen()?tbaChance():null;
  if(f.wagnis==='frost') return m===10?wegChance('frost'):null;
  if(f.wagnis||m<7||m>9) return null;
  const w=feldWeg(id); return w?wegChance(w):null;
}
// Seit 13.4.6: Erlös, wenn das Feld jetzt sicher gelesen wird, als Wein der höchsten Stufe, die es gerade erreicht.
function feldErloes(id){const f=S.felder[id]; if(!f||!(f.menge>0)||f.gelesen) return 0; let b=0;
  for(const la of ['alles','reif','ueber']){const st=sektSorte(id)?SEKT_GRUND:besteStufe(feldQ(f,la)); if(st) b=Math.max(b,leseWert(id,la,st,feldLiter(f,la)))} return b}
// Wartende Felder: im Oktober die im Wagnis, im November alles, was noch hängt (Frost, zweite Stufe oder Verfaulen im Dezember).
function feldWartet(id){const f=S.felder[id], m=S.monat; if(!f||!(f.menge>0)||f.gelesen||f.gefroren) return false; return m===9?!!feldWeg(id):m===10}
// Die Warnung des Weingut-Managers (Maiks Regel): alle wartenden Felder gegen den erwarteten Erlös der ganzen Ernte des Jahres, gelesene Felder mit f.leseW.
function wagnisWarnung(){
  if(mgrSt('weingut')<1||S.monat<9||S.monat>10) return null;
  const I=weinberge(), W=I.filter(feldWartet); if(!W.length) return null;
  const w=W.reduce((a,id)=>a+feldErloes(id),0), ges=I.reduce((a,id)=>a+feldErloes(id)+(S.felder[id].leseW||0),0);
  return ges>0&&w>mgrWarnAb()*ges?{ids:W,anteil:w/ges}:null;
}
// f.wagnis: edel (Edelfäulnis ist da), frost (wartet auf Frost im Dezember), aus (vorbei, das Feld hängt wie jedes andere).
function herbstWagnis(id,f,so,m,L){
  const H=herbstJahr(), w=feldWeg(id);
  if(m===10){
    if(w==='edel'&&!f.wagnis){
      // Seit 14.5.4 (Annahmen 35, 36 und 38): Die Edelfäulnis bringt EDEL_OE Grad dazu (bis 14.5.3 fest auf die Schwelle der Beerenauslese) und kostet EDEL_MENGE der Menge,
      // auch im Jahrhundertsommer. Reicht es mit der überreifen Lese (+5°) nicht für die Beerenauslese, wird es, was die Öchsle hergeben. Text ist Platzhalter, Wortlaut in Meilenstein 17.
      // Seit dem Nachtrag zu 14.5.4: höchstens EDEL_OE_MAX (149°), die Trockenbeerenauslese kommt erst mit den Rosinen.
      if(H.uEdel<wegChance('edel')){f.wagnis='edel'; f.edel=true; f.oe=Math.min(EDEL_OE_MAX,f.oe+EDEL_OE); f.menge=Math.round(f.menge*EDEL_MENGE); f.ueber=clamp(f.ueber+EDEL_UEBER,0,100);
        L.push(`Edelfäulnis beim ${so.name}! Die Trauben haben jetzt ${f.oe}° Öchsle${feldQ(f,'ueber').oe>=R().min.ba?', genug für eine Beerenauslese. Lies sie von Hand, nur überreife Trauben.':`, für eine Beerenauslese (${R().min.ba}°) reicht es nicht.`}`)}
      else wagnisWeg(f,so,'edel',L);
    }else if(w==='frost'&&!f.wagnis){f.wagnis='frost'; L.push(`Der ${so.name} hängt weiter und wartet auf Frost im Dezember.`)}
    return;
  }
  if(f.wagnis==='frost'){
    // Seit 13.6.2: Gelingt der Frost im Jahrhundertwinter, wird der Eiswein der Jahrhundertwein (f.jh). S.jhN zählt die gelungenen Jahrhundert-Wagnisse (Prüfskript).
    if(H.uFrost<wegChance('frost')){f.gefroren=true; if(jhEcht()==='winter'){f.jh=1; S.jhN=(S.jhN||0)+1; L.push(`Jahrhundertwinter! Der ${so.name} hängt gefroren am Stock. Lies ihn diesen Monat, daraus wird der Jahrhundertwein.`)} else L.push(`Frost! Der ${so.name} hängt gefroren am Stock. Eiswein ist möglich, lies ihn diesen Monat.`)}
    else wagnisWeg(f,so,'frost',L);
    return;
  }
  // Seit 13.4.5: Die Beerenauslese wagt ab R8 die zweite Stufe, ohne den Rang verfault sie wie alles andere.
  if(f.wagnis==='edel'&&tbaOffen()){
    // Seit 13.6.2: Im Jahrhundertsommer wird die Trockenbeerenauslese der Jahrhundertwein (f.jh).
    // Seit 14.5.4 (Annahmen 35, 36 und 38): Die Rosinen bringen ROSIN_OE Grad dazu (bis 14.5.3 fest auf die Schwelle der Trockenbeerenauslese), höchstens OE_MAX,
    // und kosten noch einmal ROSIN_MENGE der Menge. Text ist Platzhalter, Wortlaut in Meilenstein 17.
    if(H.uTba<tbaChance()){f.rosin=true; f.oe=Math.min(OE_MAX,f.oe+ROSIN_OE); f.menge=Math.round(f.menge*ROSIN_MENGE); if(jhEcht()==='sommer'){f.jh=1; S.jhN=(S.jhN||0)+1}
      L.push(`${f.jh?'Jahrhundertsommer! ':''}Die edelfaulen Beeren vom ${so.name} sind zu Rosinen eingetrocknet: ${f.oe}° Öchsle${feldQ(f,'ueber').oe>=R().min.tba?', genug für eine Trockenbeerenauslese. Lies sie diesen Monat von Hand, nur überreife Trauben.':`, für eine Trockenbeerenauslese (${R().min.tba}°) reicht es nicht.`}`)}
    else wagnisWeg(f,so,'tba',L);
    return;
  }
  f.menge=0; L.push(`Die hängenden ${so.name}-Trauben sind im Dezember verfault.`);
}
// Das Wagnis klappt nicht: Die Ernte des Feldes ist weg, der Winzerbote erklärt es. Seit 13.4.8 auch mit der Spende an die Feuerwehr (Maik 21.11.2026).
function wagnisWeg(f,so,art,L){
  const T=WAGNIS_AUS[art];
  f.wagnis='aus'; f.menge=0;
  L.push(`${T[0]}: Die Ernte vom ${so.name} ist hin.`);
  schlag(70,T[0],T[1].replace(/\{s\}/g,so.name),T[2],{du:1});
}
// Im Dezember: Wartet ein Feld auf Frost, ist es genau dann frostig, wenn das Wagnis klappt, sonst kommt Tauwetter.
function wagnisWetter(){
  if(!weinberge().some(id=>{const f=S.felder[id]; return f.reben&&f.menge>0&&!f.gelesen&&f.wagnis==='frost'})) return;
  const w=herbstJahr().uFrost<wegChance('frost')?'frost':S.wetter==='frost'?'mild':S.wetter;
  if(w!==S.wetter){S.wetter=w; S.temp=tempFuer(11,w,fest(8,0,S.jahr,11))}
}
// Seit dem Nachtrag zu 14.5.4: f.rosin (Rosinen eingetrocknet) steht nur, wenn es sie gab, und fällt hier weg.
function feldReset(f){delete f.rosin; Object.assign(f,{oe:0,plus:0,menge:0,reif:0,ueber:0,edel:false,edelGeprueft:false,gelesen:false,teil:false,gefroren:false,frostF:1,wagnis:0,weg:null,leseW:0,jh:0})}

/* ================= Schädlingsjahr (seit 13.7.2) ================= */
// Die Schädlingsjahre der Partie, fest aus der Startzahl, einmal je Startzahl gerechnet. Nur in der Meisterprüfung (schaedAn).
let schaedListe=null;
function schaedJahre(){
  if(!schaedAn()) return [];
  if(schaedListe&&schaedListe.zf===S.zf) return schaedListe.J;
  const J=[]; for(let j=START_JAHR;;){j+=festI(SCHAEDJ_PAUSE[0],SCHAEDJ_PAUSE[1],fest(9,0,j,0)); if(j>START_JAHR+SCHAEDJ_BIS) break; J.push(j)}
  schaedListe={zf:S.zf,J}; return J;
}
const schaedJahr=(j=S.jahr)=>schaedJahre().includes(j);
// Name im Winzerboten: der Traubenwickler zuerst, danach einer der Schädlinge, die mit dem Akt schon da sind (SCHAED_AKT).
function schaedArt(j=S.jahr){const G=S.schaedGes||{}; if(!Object.keys(G).length) return 'wickler'; const A=Object.keys(SCHAED).filter(a=>SCHAED_AKT[a]<=RANG_AKT[S.rang]); return A[Math.min(A.length-1,Math.floor(fest(9,1,j,0)*A.length))]}
function schaedRegel(a){const T=SCHAED[a]; return `${T.name}: Alle paar Jahre meldet das Weinbauamt im ${MON[SCHAEDJ_MON]} ein Schädlingsjahr. Es nimmt der Ernte nichts, die Menge-Sorte bleibt sicher. Aber wer die Spitzen-Sorte für das Wagnis hängen lässt, hat in diesem Jahr eine deutlich schlechtere Chance.`}
// Läuft jeden Monat: im Juli die Meldung des Schädlingsjahrs, im September der Satz der Alten. Beides nur in der Meisterprüfung und erst mit dem Wagnis (Entscheidung 8).
function schaedMonat(){
  if(!schaedAn()||!frei('weg_eigen')) return;
  if(S.monat===SCHAEDJ_MON&&schaedJahr()&&!(S.schaedJ&&S.schaedJ.j===S.jahr)){
    const a=schaedArt(), T=SCHAED[a], G=S.schaedGes=S.schaedGes||{}, erst=!G[a]; G[a]=(G[a]||0)+1; S.schaedJ={j:S.jahr,art:a};
    schlag(70,`Schädlingsjahr: ${T.name}`,SCHAEDJ_TEXT.replace('{der}',T.der.charAt(0).toUpperCase()+T.der.slice(1))+(erst?' '+SCHAED_FAMILIE[a]:''),'amt',{du:1});
  }
  if(S.monat===8){const s=wagSatz(); schlag(44,s[1],s[2].replace('{wo}',WO[S.region]),'lese',{du:feldHaengt().length?1:0})}
}
// Seit 13.7.2: Stände bis 13.6 verlieren Befall, Warnung und Spritzen, der Schalter beim Weingut-Manager fällt weg.
function altSchaed(){const w=(S.manager||{}).weingut; if(w&&w.an) delete w.an.spritzen; for(const x of ['schaed','schaedNext','schaedLetzt','spritzN','schaedAb']) delete S[x]}

/* ================= Weinstufen ================= */
function mindest(st){const m=R().min; return (st==='feder'||st==='eis')?m.tafel:m[st]}
// q = {oe, leseart, edel, eis}
function pruefeQualitaet(st,q){
  const g=[], d=STUFEN[st], min=mindest(st);
  // Seit 13.3.2: die zwei Schlösser. Die Rolle muss die Stufe machen dürfen und der Rang muss reichen, der Deckel wirkt schon übers Öchsle.
  if(!rolleDarf(q.sorte,st)) g.push(`${d.name} gibt es nicht von der ${ROLLEN[SORTEN[q.sorte].rolle].name}`);
  // Seit 14.6.2 auch Beerenauslese, Eiswein und Trockenbeerenauslese über ihren Weg (stufeFrei), bis 14.6.1 galten sie ohne Eintrag als frei.
  // Seit 14.6.3 (Prüfregel B5): ohne die Ausnahme aus 13.6.7 (Jahrhundertwein als Trockenbeerenauslese schon mit dem eigenen Weg). Sie ist seit 13.6.9 (Nachtrag 3,
  // Bauauftrag) weggefallen, die Trockenbeerenauslese kommt nur mit dem Vizepräsidenten (weg_tba). Erreichbar war sie nicht mehr, die Rosinen kommen erst mit weg_tba.
  else if(!stufeFrei(st)) g.push(`${d.name} erst ab dem Rang ${rangN(stufeFreiAb(st))}`);
  if(q.oe<min) g.push(`es fehlen ${min-q.oe}° Öchsle (Minimum ${min}°)`);
  // Seit 14.5.5 (Entscheidungen 19 und 34, Annahme 16): der dritte Schlüssel, die Qualität des Weins (l.qp, bei der Lese feldQ mit qualWb) gegen ANSPRUCH,
  // nach Rang und Öchsle. Platzhalter, Wortlaut in Meilenstein 17.
  {const n=anspruchFehlt(st,q.qp); if(n>0) g.push(`es ${n===1?'fehlt 1 Punkt':`fehlen ${n} Punkte`} Qualität (ab ${ANSPRUCH[st]} Punkten)`)}
  if(q.masch&&(st==='eis'||d.rang>STUFEN.qba.rang)) g.push('mit der Maschine gelesen gibt es höchstens Qualitätswein');
  if(st==='eis'){
    if(!q.eis) g.push('nur aus gefrorenen Trauben der Dezember-Lese');
    // Seit 13.4.2 braucht Eiswein keine Edelfäulnis mehr, er behält das Öchsle der Trauben (Bauplan 13.4).
    // Wie im Handbuch: reife oder überreife Trauben, aber nicht beides zusammen.
    if(q.leseart==='alles') g.push(`Leseart muss „${LESE.reif}“ oder „${LESE.ueber}“ sein`);
  }else{
    if(d.rang>=3&&q.eis) g.push('aus der Dezember-Lese gibt es nur Tafelwein, Qualitätswein oder Eiswein');
    if(d.lese&&q.leseart!==d.lese) g.push(`Leseart muss „${LESE[d.lese]}“ sein`);
    if(d.edel===true&&!q.edel) g.push('Edelfäulnis fehlt');
    if(d.edel===false&&q.edel) g.push('Trauben mit Edelfäulnis sind dafür nicht zugelassen');
  }
  return g;
}
function pruefeAnmeldung(l,st){
  const g=pruefeQualitaet(st,l), d=STUFEN[st];
  if(l.fassMonate<1) g.push('muss mindestens einen Monat im Fass liegen');
  if(st==='feder'&&l.fassMonate>1) g.push('nur im Monat nach der Lese möglich');
  if(d.rang>=3&&d.rang<=7&&S.jahr<=l.jahrgang) g.push('frühestens im Januar nach der Lese');
  if(st==='eis'&&!(S.monat===0&&S.jahr===l.jahrgang+1)) g.push('nur im Januar nach der Lese');
  if(d.geb&&d.geb>S.geld) g.push(`Gebühr von ${eur(d.geb)} nicht bezahlbar`);
  return g;
}
function besteStufe(q){let b=null; for(const st of REIHE) if(!pruefeQualitaet(st,q).length) b=st; return b}
// Seit 14.5.5: die nächste Stufe über der besten sicheren, die der Wein überhaupt werden kann: Die Rolle darf sie machen, gefrorene Trauben gehen nur
// zum Eiswein (oder bis Qualitätswein), der Eiswein nur aus gefrorenen Trauben, mit Edelfäulnis kein Kabinett und keine Spätlese. Dazu, was ihr fehlt,
// pruefeQualitaet nennt zuerst den Rang, dann die Öchsle, dann die Punkte (Annahme 16).
const kannWerden=(q,st)=>rolleDarf(q.sorte,st)&&(q.eis?st==='eis'||STUFEN[st].rang<3:st!=='eis')&&!(q.edel&&STUFEN[st].edel===false);
function prueferNaechste(q){const b=besteStufe(q), st=REIHE.slice(b?REIHE.indexOf(b)+1:0).find(st=>kannWerden(q,st)); return st?{st,g:pruefeQualitaet(st,q)}:null}
/* ---- Wagnis beim Weinprüfer, Herabstufen und Presse (seit 14.5.6, Entscheidungen 20, 25, 26, 28 und 50, Annahmen 15 bis 22) ---- */
// Ab dem Akt WAGNIS_AB_AKT (nach dem Rang, RANG_AKT) darf über der Qualität angemeldet werden. Gewagt wird nur, wenn allein die Punkte fehlen (Annahme 16),
// höchstens WAGNIS_MAX_FEHLT, nicht mit gepanschtem Wein und nicht mit Sekt. pruefFehlt gibt die fehlenden Punkte, sonst 0.
const aktJetzt=()=>RANG_AKT[S.rang]||1, pruefWagAkt=()=>aktJetzt()>=WAGNIS_AB_AKT;
function pruefFehlt(l,st){if(!pruefWagAkt()||!l||l.sekt||mani(l)||st==='feder'||!(st in ANSPRUCH)) return 0; const n=anspruchFehlt(st,l.qp);
  if(n<1||n>WAGNIS_MAX_FEHLT) return 0; return pruefeAnmeldung(Object.assign({},l,{qp:ANSPRUCH[st]}),st).length?0:n}
// Chance: jeder fehlende Punkt kostet WAGNIS_JE_PUNKT (Entscheidung 20), auf ganze Prozent gerundet.
const pruefChance=n=>n>0?Math.max(0,Math.round((1-n*WAGNIS_JE_PUNKT)*100)/100):1;
// Das Urteil, fest je Weinberg, Jahrgang und Stufe (Annahme 22): bestanden, wenn der Wurf unter der Chance liegt. Neu laden ändert nichts.
const urteilNr=(l,st)=>Math.max(0,weinberge().indexOf(l.sorte))*20+REIHE.indexOf(st);
const urteil=(l,st,p)=>fest(URTEIL_THEMA,urteilNr(l,st),l.jahrgang,0)<p;
// Herabstufen (Annahme 17): die höchste Stufe unter der angemeldeten, die Öchsle und Qualität sicher hergeben, Leseart, Edelfäulnis und gefrorene Trauben außen vor.
// Bei höchstens 9 fehlenden Punkten genau eine Stufe tiefer, Beerenauslese und Eiswein werden Auslese, die Trockenbeerenauslese wird Beerenauslese.
const HERAB_REIHE=['tafel','qba','kab','spat','aus','ba','tba'];
function herabStufe(l,st){const top=st==='eis'?HERAB_REIHE.indexOf('aus')+1:HERAB_REIHE.indexOf(st);
  for(let i=top-1;i>=0;i--){const s=HERAB_REIHE[i]; if(rolleDarf(l.sorte,s)&&(l.oe||0)>=mindest(s)&&!anspruchFehlt(s,l.qp)) return s} return 'tafel'}
// Ansehen bei der Anmeldung (Entscheidung 25): Grundwert der Weinstufe plus ansZuschlag, mit Presse PRESSE_ERFOLG mal der Grundwert (Annahme 19).
// Durchgefallen (Annahmen 18 und 20): kein Ansehen, ab dem Akt DURCH_ANS_AB_AKT minus DURCH_ANS mal der Grundwert der angemeldeten Stufe, mit Presse PRESSE_DURCH mal.
const ansErfolg=(l,st,presse)=>STUFEN[st].ans*(presse?PRESSE_ERFOLG:1)+ansZuschlag(l);
const ansDurch=(st,presse)=>presse?PRESSE_DURCH*STUFEN[st].ans:aktJetzt()>=DURCH_ANS_AB_AKT?Math.round(DURCH_ANS*STUFEN[st].ans):0;
// Ansehen gibt es je Weinberg, Jahrgang und Stufe nur einmal (S.ansGeb, wie bisher), ansNeu sagt, ob es noch offen ist.
const ansKey=(l,st)=>l.sorte+'|'+l.jahrgang+'|'+st, ansNeu=(l,st)=>!(S.ansGeb||[]).includes(ansKey(l,st));
// Die Presse (Annahme 19): Recht des Präsidenten (FREI.presse), PRESSE_JE_JAHR Einsatz je Kalenderjahr (S.presseJ zählt), nicht für Sekt und gepanschten Wein,
// nur wenn die Anmeldung noch Ansehen bringt. Vorher nennt sie kein Fenster und kein Rat.
const presseRecht=()=>frei('presse'), presseFrei=()=>presseRecht()&&!(S.presseJ&&S.presseJ.j===S.jahr&&S.presseJ.n>=PRESSE_JE_JAHR);
const presseGeht=(l,st)=>presseFrei()&&!l.sekt&&!mani(l)&&STUFEN[st].ans>0&&ansNeu(l,st);
// Rat des alten Winzers in den Lehrjahren (Annahme 21): wagen, wenn es sich im Schnitt in Geld lohnt (echte Preise, Gebühr eingerechnet), ab dem Akt
// DURCH_ANS_AB_AKT nur, wenn auch das Ansehen im Schnitt nicht sinkt. Verglichen wird mit der besten sicheren Stufe. Presse ab PRESSE_RAT_AB Chance.
function pruefRat(l,st,n){const p=pruefChance(n), t=herabStufe(l,st), s=besteStufe(l), W=x=>x?weinWert(x,l)*l.liter:0, G=x=>x?STUFEN[x].geb:0;
  const geld=p*W(st)+(1-p)*W(t)*(1-DURCH_PREIS)-G(st), sicher=W(s)-G(s);
  if(geld<sicher) return false; if(aktJetzt()<DURCH_ANS_AB_AKT) return true;
  return p*ansErfolg(l,st)-(1-p)*ansDurch(st)>=(s&&ansNeu(l,s)?ansErfolg(l,s):0)}
const presseRat=p=>p>=PRESSE_RAT_AB;
// Name der Stufe für die Lese-Hilfe (bis 14.5.3 beim Eiswein mit seiner Wertstufe nach den Öchsle).
const stufeText=st=>STUFEN[st].name;
// Seit 13.4.2: auch gefrorene Trauben liest die Hand, wie früher, als es Eiswein nur mit Edelfäulnis gab.
// Seit 13.5.5 liest die Hand jedes Feld der Spitzen-Sorte, eine Maschine springt dort nie mehr ein (handFehlt bleibt leer, q.masch kommt nicht mehr vor).
// Seit 14.2.4 auch jeder Weinberg, dessen Form keine Maschine erlaubt (formMasch).
const handFeld=f=>!!(f.edel||f.gefroren)||!formMasch(feldId(f));
const handBedarf=f=>Math.max(0,Math.ceil((f.reben-alleinReben())/HAND_REBEN));
const handFehlt=f=>false;
const handlese=f=>handFeld(f)&&!handFehlt(f);
// Seit 13.2.3: Auch die überreife Lese (+5°) bleibt unter der Grenze des Weinbergs.
// Seit 14.5.5 mit der Qualität des Weinbergs (qp), dem dritten Schlüssel.
function feldQ(f,la){const id=feldId(f); return {oe:Math.min(id?oeGrenze(id):OE_MAX,f.oe+(la==='ueber'?5:0)),leseart:la,edel:f.edel,eis:f.gefroren,masch:handFehlt(f)?1:0,sorte:id,qp:id?qualWb(id):0,...(f.jh?{jh:1}:{})}}
// Abnutzung bei der Lese (8.0): reben ist der Teil der Lese, den die Maschinen schaffen, M ihre Ernteleistung zusammen. Auslastung reben/M (höchstens 1),
// je Maschine ABNUTZ_VOLL mal Auslastung mal Pflege-Faktor nach dem Zustand vor der ersten Lese des Jahres (ma.lj, ma.lz). Bruchteile sammelt ma.abn.
function maschAbnutzung(reben,M){
  const a=Math.min(1,reben/M);
  for(const ma of maschEinsatz()){
    if(ma.lj!==S.jahr){ma.lj=S.jahr; ma.lz=ma.zustand}
    ma.abn=(ma.abn||0)+ABNUTZ_VOLL*a*pflegeF(ma.lz); const d=Math.floor(ma.abn);
    if(d){ma.abn-=d; ma.zustand=Math.max(MASCH_MIN,ma.zustand-d)}
  }
}
// Version 4.4: ungefährer Listenwert einer Lese als Flaschenwein der Stufe st, ohne Reife und Marktlage.
// Seit 14.5.2 mit der Qualität des Weinbergs, seit 14.5.4 über weinWert (Öchsle der Leseart, Pflegestufe des Weinbergs).
function leseWert(id,la,st,liter){const q=feldQ(S.felder[id],la);
  return Math.round(liter*weinWert(st,{qp:qualWb(id),oe:q.oe,sorte:id,pfl:S.felder[id].pflSt||0,sekt:sektSorte(id)})*(R().preisF||1)/100)*100}
function feldLiter(f,la){const r=f.reif/100,u=f.ueber/100; return Math.round(f.menge*r*(la==='reif'?1-u:la==='ueber'?u*MOST_UEBER:1-u+u*MOST_UEBER)*leseFaktor(feldId(f)))}
// Ab wann ein Wein frühestens verkauft werden darf, wenn er jetzt gelesen wird.
// Gekeltert wird im Lesemonat, nach einem Monat im Fass darf er angemeldet und abgefüllt werden, ab Kabinett und beim Eiswein erst im Januar.
// Danach muss er die Mindestzeit aus lagerBasis in der Flasche liegen. n zählt die Monate ab jetzt.
// Version 5.0: Edelfäulnis-Regel des Gebiets als kurzer Text (kühl erst ab Auslese, Mitte vorher selten).
function edelRegel(){return 'Edelfäulnis kommt nur über das Wagnis im Herbst: Wer die Spitzen-Sorte über Oktober hängen lässt und Glück hat, bekommt sie im November'}
const inMonaten=n=>{const t=S.monat+n; return `${MON[t%12]} ${S.jahr+Math.floor(t/12)}`};
function verkaufAb(sorte,st){
  const abf=STUFEN[st].rang>=3?12:S.monat+1, t=abf+lagerBasis({sorte,stufe:st}).min, n=t-S.monat;
  return `⏳ verkaufsfertig frühestens ${MON[t%12]} ${S.jahr+Math.floor(t/12)} (in ${n} ${n===1?'Monat':'Monaten'})`;
}
/* ================= Lagerung und Preis ================= */
// Seit 12.1: Sekt mit langem Hefelager ruht länger und hält um genauso viele Monate länger.
function lager(l){const b=lagerBasis(l), h=l.hefe||SEKT_REIFE;return l.sekt?{min:h,max:b.max+h-SEKT_REIFE,rate:b.rate}:b}
function lagerBasis(l){
  // Bis 14.7.1 zählte der Kellermeister als Kopf auf Stufe 3 wie ein Stück Kellerausbau dazu (mgrReife), seit 14.7.2 ist er kein Kopf mehr.
  const so=SORTEN[l.sorte], K=S.keller||0, rf=so.reife*(1+KELLER_REIFE*(S.keller||0))*(R().reifeF||1);
  if(l.stufe==='feder') return {min:0,max:3,rate:0};
  if(l.stufe==='tafel'||l.stufe==='qba') return {min:2,max:Math.max(24,Math.round(so.maxL/3)),rate:rf/2};
  if(l.stufe==='eis') return {min:Math.max(1,Math.round(so.minL*1.5)-K),max:Infinity,rate:rf};
  return {min:Math.max(1,so.minL-K),max:so.maxL,rate:rf};
}
// Ein Weinskandal drückt alle Preise, eine Mode im Ausland hebt eine Sorte. S.lage={typ,f,rest,sorte}.
function lageF(l){const g=S.lage; return !g?1:g.typ==='mode'?(stamm(l.sorte)===g.sorte?g.f:1):g.f}
// Seit 14.5.4 (Entscheidungen 24, 38, 44 und 49, Annahmen 12 bis 14 und 35 bis 37 im Bauplan 14.5): Wert je Flasche ohne Flaschenreife, Markt und Sekt-Faktor.
// Listenpreis der Weinstufe (STUFEN.preis) mal Grundpreis der Sorte (SORTE_PREIS, auch für die Spitzenlage) mal Qualitätsfaktor (QUAL_PREIS_AB plus QUAL_PREIS_JE
// je Punkt, 50 Punkte sind der Listenpreis) mal Grand Cru (pflegePreis nach l.pfl) mal Öchsle-Zuschlag (oePreisF), dazu wie bisher die Sterne (bis 14.5.4 auch anspruchF).
// w braucht qp, oe, sorte, pfl und sekt, also einen Posten oder die Werte eines Weinbergs (leseWert).
const qualPreisF=qp=>QUAL_PREIS_AB+QUAL_PREIS_JE*(qp||0);
const sortePreisF=id=>SORTE_PREIS[rolleK(id)]||1;
// Schwelle der Weinstufe für den Öchsle-Zuschlag: die Tabelle R().min, beim Eiswein EIS_OE_SCHWELLE (Annahme 37). Federweißer und Sekt haben keine (Annahme der Bau-Sitzung).
const oeSchwelle=st=>st==='eis'?EIS_OE_SCHWELLE:st==='feder'||!st?null:R().min[st];
// Grad über der Schwelle, ohne Deckel (die Jury nimmt ihn ab 14.5.7 mit OE_JURY_MAX), beim Sekt 0.
// Seit dem Nachtrag zu 14.7.1 (Maik 25.11.2026, "Zucker hebt den Preis nicht"): Es zählen nur die Öchsle der Trauben vor dem Zuckern (oeTraube),
// im Preis (oePreisF) und bei der Jury (juryTeile). Grund (Maik): Reife kommt aus dem Wetter, Zuckern darf sich nicht lohnen.
// oeTraube zählt nie mehr als die Öchsle von heute, so drückt Wasser den Zuschlag weiter, Zucker hebt ihn nie. Ohne Zucker (auch die Werte eines Weinbergs) ist es w.oe wie bisher.
const oeTraube=w=>w.oeT!=null?Math.min(w.oe||0,w.oeT):(w.oe||0);
const oeUeber=(st,w)=>{const s=w.sekt?null:oeSchwelle(st); return s==null?0:Math.max(0,Math.round(oeTraube(w))-s)};
const oePreisF=(st,w)=>1+Math.min(OE_PREIS_MAX,OE_PREIS_JE*oeUeber(st,w));
// Seit 14.5.6: durchgefallen beim Weinprüfer (w.durch) DURCH_PREIS weniger, auch im Vermögen (lotWert).
// Seit 14.5.7: Punkte eigen am Wein (Medaillen w.medP, Sekt w.sektP) mit PUNKT_PREIS je Punkt, der Jahrhundertwein JH_PREIS mehr (Maik 25.11.2026, Frage 3).
const jhPreisF=(st,w)=>w.jh&&!w.sekt&&(st==='tba'||st==='eis')?1+JH_PREIS:1;
function weinWert(st,w){return STUFEN[st].preis*sortePreisF(w.sorte)*qualPreisF(w.qp)*(1+pflegePreis(w.pfl))*oePreisF(st,w)*sternF(w.sorte)*(w.durch?1-DURCH_PREIS:1)
  *(1+((w.medP||0)+(w.sektP||0))*PUNKT_PREIS)*jhPreisF(st,w)}
// Seit 14.7.6 (Annahme 24): preisBei rechnet mit dem Tagespreis m, preis mit S.markt wie bisher, listenPreis ohne Tagespreis (m=1).
function preisBei(l,m){
  if(l.status!=='flasche') return 0;
  const L=lager(l); if(l.flMonate<L.min) return 0;
  const alter=Math.min(4,1+(l.flMonate-L.min)/12*L.rate);
  return Math.round(weinWert(l.stufe,l)*alter*m*lageF(l)*sektF(l)*(R().preisF||1)*100)/100;
}
function preis(l){return preisBei(l,S.markt)}
function listenPreis(l){return preisBei(l,1)}
// Die Grenze der Handels-Managerin je Flasche, MGR_PREIS_MIN vom Listenpreis (Annahme 24).
const mgrGrenze=l=>listenPreis(l)*MGR_PREIS_MIN;

// Die drei Sorten der Partie nach Rolle: {menge, sekt, spitze}.
function kompRollen(){
  if(S.rollen){const o={}; for(const id of R().sorten) o[SORTEN[id].rolle]=id; return o}
  const [menge,sekt,spitze]=KOMP_ALT_ROLLEN[S.region]||KOMP_ALT_ROLLEN.mosel; return {menge,sekt,spitze};
}
// "vom Riesling", "von der Scheurebe".
const sorteVom=id=>`${SORTEN[id].name==='Scheurebe'?'von der':'vom'} ${SORTEN[id].name}`;
// Die Sorte, an der ein Eintrag hängt, und sein Titel. Ohne Spielstand steht der Name allein.
function kompSorte(id){const D=KOMP[id]; return S&&D&&D.rl?kompRollen()[D.rl]:null}
function kompTitel(id){
  const D=KOMP[id], so=kompSorte(id);
  if(id==='sekt') return S&&S.rollen&&so?`Regional-Sekt ${sorteVom(so)}`:'Sekt';
  return so?`${D.name} ${sorteVom(so)}`:D.name;
}
const kompWissen=(id,kap,titel,text)=>{KOMP[id]={kap,titel,wissen:1,text}};
for(const st of Object.keys(STUFEN)) KOMP['stufe_'+st]={id:'stufe_'+st,kap:'stufe',name:STUFEN[st].name,stufe:st,rl:KOMP_STUFE_ROLLE[st],w:KOMP_W.rolle[st],immer:1,
  text:()=>kompStufeText(st),get titel(){return kompTitel(this.id)}};
KOMP.sekt={id:'sekt',kap:'sorte',name:'Sekt',stufe:'sekt',rl:'sekt',w:KOMP_W.rolle.sekt,text:()=>kompSektText(),get titel(){return kompTitel(this.id)}};
// Die Rebsorten: Wissens-Seiten mit Geschichte und der Zeile "Im Spiel". Die Kennungen aus 11.1 bleiben.
for(const id of Object.keys(SORTEN).filter(id=>!SORTEN[id].sl)) kompWissen('sorte_'+id,'sorte',SORTEN[id].name,()=>{
  const so=SORTEN[id], rl=Object.keys(KOMP_ROLLE_SIEGEL).find(r=>kompRollen()[r]===id), sg=rl&&(rl!=='sekt'||S.rollen)?' '+KOMP_ROLLE_SIEGEL[rl]:'';
  return `${so.farbe==='weiss'?'Weißwein':'Rotwein'}, ${rolleVon(id)?`die ${rolleVon(id).name} im Gebiet ${R().name}`:`im Gebiet ${R().name} ${eigText(eignung(id))}`}. Als Prädikatswein reift er mindestens ${Math.max(1,so.minL-(S.keller||0))} Monate in der Flasche und hält bis zu ${Math.round(so.maxL/12)} Jahre.${so.sektStar?` Als Sekt bringt er ${Math.round((SEKT_STAR-1)*100)} % mehr als andere Sorten.`:''}${sg}`});
function kompSektText(){
  const so=kompRollen().sekt;
  return `Sekt macht ab dem Rang ${RAENGE[R_SEKT].name} die ${ROLLEN.sekt.name}, direkt bei der Lese im eigenen Sektkeller, ohne Grundwein. Sektflasche, Korken und Agraffe kosten ${eur2(sektKosten())} je Flasche. Er ruht ${SEKT_REIFE} Monate auf der Hefe, mit ${HEFE_LANG} Monaten kostet er ${HEFE_LANG_P} % mehr und bekommt bei der Jury ${HEFE_LANG_P} Punkte mehr.${S.rollen?` Aus dem ${SORTEN[so].name} wird der Regional-Sekt, er bringt noch einmal ${Math.round((SEKT_STAR-1)*100)} % mehr.`:''} Bei Wettbewerben tritt Sekt erst ab dem Bundeswettbewerb an.`;
}
// Wissens-Seiten: Geschichte und die Zeile "Im Spiel", ohne Siegel. Die Kennungen aus 11.1 bleiben, neu ist helferweg.
for(const r of Object.keys(REGIONEN)) kompWissen('gebiet_'+r,'gebiet',REGIONEN[r].name,()=>`${REGIONEN[r].text} ${r===S.region?'Hier steht dein Weingut.':`So spielt es sich in einer Partie ${WO[r]}.`}`);
kompWissen('spitze','gebiet','Spitzenlage',()=>`Die beste Lage weit und breit: ${SPITZE_HA} Hektar Steilhang in voller Südsonne. Dort ist es ${KLIMA_WORT.spitzenlage} als am einfachen Hang, die Trauben bekommen mehr Öchsle. Sie ist steiler Südhang, und unter den Hammer kommt sie nur einmal, ${freiText('spitzenlage')}.`);
// Seit dem Nachtrag zu 14.5.4: Klima je Weinberg, nur in Worten (KLIMA_KOMP). Platzhalter, Wortlaut in Meilenstein 17.
kompWissen('klima','gebiet','Klima je Weinberg',()=>KLIMA_KOMP.replace(/\{(\w+)\}/g,(m,k)=>KLIMA_WORT[k]));
// Nachtrag zu 14.5 (Maik 25.11.2026): Jede Lage hat ihre Sorte, mit der sicheren Auktion. Platzhalter, Wortlaut in Meilenstein 17.
kompWissen('lagen','gebiet','Jede Lage hat ihre Sorte',()=>LAGE_SATZ.komp.replace('{hoehe}',RAENGE[AUK_SICHER[0].r].name).replace('{sued}',RAENGE[AUK_SICHER[1].r].name));
for(let k=1;k<=KELLER_PREISE.length;k++) kompWissen('keller'+k,'technik',KELLER_NAMEN[k-1],
  ()=>`Stufe ${k} im Kellerausbau. Kostet ${eur(KELLER_PREISE[k-1])} und geht mit ${kellerMit(k-1)} im Kellerbuch. Prädikatsweine und Eiswein sind damit ${k} ${k===1?'Monat':'Monate'} früher verkaufsreif, und jeder Wein gewinnt beim Reifen schneller an Wert.`);
// Seit 12.1: der Sektkeller mit der Flaschengärung als kleine Geschichte (KOMP_TEXT.sektkeller).
kompWissen('sektkeller','technik','Sektkeller',()=>`Kostet einmal ${eur(SEKTKELLER_PREIS)} und geht ab dem Rang ${RAENGE[R_SEKT].name}. Ohne ihn gibt es keinen Sekt. Sektflasche, Korken und Agraffe kosten ${eur2(SEKT_KOSTEN)} je Flasche, mit der ${SEKT_ANLAGE_NAME} (${eur(SEKT_ANLAGE_PREIS)}, zu haben ${freiText('sekt_anlage')}) die Hälfte. Bei der Lese der ${ROLLEN.sekt.name} wählst du ${SEKT_REIFE} oder ${HEFE_LANG} Monate auf der Hefe, lang bringt ${HEFE_LANG_P} % mehr Preis und ${HEFE_LANG_P} Punkte bei der Jury.${S.sektkeller?` Dein Sektkeller steht${S.sektAnlage?', mit Anlage':''}.`:''}`);
// Seit 14.5.3 (Annahme 11): die Erziehungsform mit Wahl fürs Leben und Maschinen-Regel, in der Meisterprüfung steht sie nur hier. Platzhalter, Wortlaut in Meilenstein 17.
kompWissen('form','technik','Erziehungsform',()=>`${Object.values(FORMEN).map(F=>`${F.name}: ${Math.round(F.menge*100)} % Menge, ${F.qual} Punkte Qualität, Rebschnitt ${eur(F.ha)} je Hektar`).join('. ')}. Der Kordon verliert bei Spätfrost und Regen im Oktober nur die Hälfte. ${FORM_MASCH_SATZ} ${FORM_WAHL_SATZ}`);
kompWissen('reife','technik','Flaschenreife',()=>'In der Flasche gewinnt ein Wein mit jedem Jahr an Wert, höchstens bis zum Vierfachen. Wie schnell das geht und wie lange er hält, hängt an der Rebsorte und am Kellerausbau.');
kompWissen('zuckern','technik','Zuckern und Wässern',()=>`Zucker hebt die Öchsle im Most, aber nie über den Deckel des Weinbergs, aus dem die Trauben kommen. Wasser streckt die Menge. Beides geht um höchstens ${ZUCKER_MAX} %. Bis ${ZUCKER_ERLAUBT} % ist das beim Tafelwein erlaubt. Alles andere ist Panscherei und ein Fall für den Weinprüfer.`);
for(const id of Object.keys(MASCH)) kompWissen('masch_'+id,'technik',MASCH[id].name,
  ()=>{const T=MASCH[id]; return `${T.bonus?MASCH_BONUS[id]():`Schafft ${rbn(T.leist)} Reben bei der Lese und deckt übers Jahr ${T.helfer} Hektar Reben ab`}. Zu kaufen ${maschFreiText(id)} für ${eur(T.preis)}.`});
kompWissen('hagel','gefahr','Hagel',()=>'Zwischen Juni und September kann ein Unwetter einen Teil der Trauben zerschlagen, die noch am Stock hängen.');
kompWissen('spaetfrost','gefahr','Spätfrost',()=>'Friert es im April oder Mai noch einmal, leidet die Blüte, und die Ernte des Jahres fällt kleiner aus.');
// Seit 14.5.4 mit den Öchsle und der Menge von Edelfäulnis und Rosinen, Platzhalter, Wortlaut in Meilenstein 17.
kompWissen('kaelte','gefahr','Das Wagnis im Herbst',()=>`Wer die Spitzen-Sorte über Oktober hängen lässt, wagt den Weg seines Gebiets. Jeder Monat kostet ${Math.round((1-WARTEN_MENGE)*100)} % Menge, und klappt es nicht, ist die Ernte des Feldes weg, zum Beispiel durch einen Kälteeinbruch im November. Die Edelfäulnis bringt ${EDEL_OE}° Öchsle dazu, höchstens bis ${EDEL_OE_MAX}°, und kostet ${Math.round((1-EDEL_MENGE)*100)} % Menge, die Rosinen noch einmal ${ROSIN_OE}° und ${Math.round((1-ROSIN_MENGE)*100)} %, höchstens bis ${OE_MAX}°.`);
kompWissen('skandal','gefahr','Weinskandal',()=>'Ein Skandal im Land drückt ein paar Monate lang alle Weinpreise. Danach ist erst einmal Ruhe.');
kompWissen('kontrolle','gefahr','Weinkontrolle',()=>'Der Prüfer kommt unangemeldet, im Schnitt alle drei Jahre. Findet er gepanschten Wein, wird der vernichtet, es gibt Strafe, und fünf Jahre lang kommt er jedes Jahr wieder.');
kompWissen('maschine','gefahr','Maschinenschaden',()=>`Ein Schaden kostet eine Maschine auf einen Schlag viel Zustand. Unter ${MASCH_ROT} % fällt sie aus, bis sie gewartet ist.`);
kompWissen('helferweg','gefahr','Erntehelfer über alle Berge',()=>`Trifft nur, wer einem Erntehelfer höchstens ${eur(lohnF(LOHN_BILLIG))} im Monat zahlt. Dann verschwindet der billigste Helfer über Nacht und nimmt 5 bis 10 % aus der Kasse mit, mindestens ${eur(2000)} und höchstens ${eur(30000)}.`);
// Seit 11.6: die drei Schädlinge, seit 13.7.2 als Schädlingsjahr. Ihre Seiten erscheinen nur in der Meisterprüfung und erst, wenn der Schädling zum ersten Mal gemeldet war (kompSeiten). Es sind Wissens-Seiten ohne Siegel,
// die Zähler im Weinkompendium (kompZahlen, kompIds) stimmen also mit und ohne sie.
for(const a of Object.keys(SCHAED)) kompWissen(a,'gefahr',SCHAED[a].name,()=>schaedRegel(a));
kompWissen('regeln','stufe','Reifezeit und Regeln',()=>{
  const so=R().sorten, reife=f=>so.map(id=>`${SORTEN[id].name} ${f(SORTEN[id].minL)} Monate`).join(', ');
  return `<b>⏳ Reifezeit in der Flasche bis zum Verkauf</b><br>Tafel- und Qualitätswein: 2 Monate.<br>Kabinett bis Trockenbeerenauslese: ${reife(x=>Math.max(1,x-(S.keller||0)))}.<br>Eiswein: ${reife(x=>Math.max(1,Math.round(x*1.5)-(S.keller||0)))}.${S.keller?`<br>Dein ausgebauter Keller kürzt das schon um ${S.keller} ${S.keller===1?'Monat':'Monate'}.`:''}`
    +`<br><br><b>📜 Gut zu wissen</b><br>Jeder Wein liegt mindestens einen Monat im Fass, höchstens sieben.<br>Ab Kabinett und beim Eiswein darfst du erst im Januar nach der Lese anmelden.<br>Überreife Trauben bringen 5° mehr Öchsle.<br>${edelRegel()}.${S.rollen?'':' Am häufigsten trifft sie die Sorte, die am besten ins Gebiet passt.'} Dann gibt es von dem Feld kein Kabinett und keine Spätlese mehr.<br>Kälteeinbruch im November: im Schnitt jedes vierte Jahr, die Vorhersage warnt meist davor.<br>${frostText()}, nur dann gibt es Eiswein.<br>Bei der Lese zeigt jede Leseart, ab wann der Wein verkaufsfertig ist.`;
});
// Die Edelfäulnis ist keine Gefahr, sie ist ein Gütezeichen (Maik 19.11.2026). Ihre Seite steht deshalb bei den Stufen.
kompWissen('edel','stufe','Edelfäulnis',()=>`${edelRegel()}. Sie bringt ${EDEL_OE}° Öchsle dazu, höchstens bis ${EDEL_OE_MAX}°, ab ${R().min.ba}° reicht es für eine Beerenauslese. Die Trockenbeerenauslese gibt es nur mit den Rosinen im Dezember. Kabinett und Spätlese gibt es von dem Feld dann nicht mehr.`)
// Seit 13.7.4 (Bauplan 13.7, Entscheidung 3): Was die Zeichen fürs Warten im Herbst bedeuten, damit niemand raten muss. Die Zahlen kommen aus den Konstanten,
// der Abschnitt zur Spielstufe sagt, welche Zeichen in dieser Partie zählen. Wortlaut seit 13.8.
kompWissen('zeichen','stufe','Zeichen fürs Warten',()=>{
  const T=WAG_TEILE[S.schwer]||[], [u,o]=wagSpanne(), W=SOMMER_W, mitte=Object.keys(REGIONEN).filter(r=>REGIONEN[r].weg==='beide').map(r=>REGIONEN[r].name).join(' und ');
  const stufe=!T.length?`In den ${DIFF[S.schwer].name}n ist die Chance jedes Jahr gleich und steht als Zahl am Lese-Knopf. Die Zeichen gibt es trotzdem, ab den Gesellenjahren zählen sie.`
    :`In dieser Partie verschieben die Zeichen die Chance um ${u} bis +${o} Punkte, für alle Felder und Wege im selben Jahr gleich. Sie liegt nie unter ${pz(WAG_MIN)} und nie über ${pz(WAG_MAX)}.${CHANCE_ZEIGE[S.schwer]?'':' Am Lese-Knopf steht hier nichts, du liest die Chance nur aus den Zeichen.'}`;
  return `${stufe}<br><br><b>☀️ Der Sommer</b><br>Das Wetter von ${MON[SOMMER_MON[0]]} bis ${MON[SOMMER_MON[1]]} zählt fürs Warten: jeder sonnige Monat ${W.sonnig>0?'+':''}${W.sonnig} Punkte, jeder verregnete ${W.regen}, kalt ${W.kalt}, Frost ${W.frost}. Ein verregneter Sommer heißt also: lieber lesen.${T.includes('sommer')?'':' (zählt erst ab den Gesellenjahren)'}`
    +`<br><br><b>🐛 Das Schädlingsjahr</b><br>Alle ${SCHAEDJ_PAUSE[0]} bis ${SCHAEDJ_PAUSE[1]} Jahre meldet das Weinbauamt im ${MON[SCHAEDJ_MON]} ein Schädlingsjahr. Der Ernte nimmt es nichts, die Menge-Sorte bleibt sicher. Nur wer wartet, verliert ${SCHAEDJ_MINUS} Punkte Chance.${T.includes('schaed')?'':' (nur in der Meisterprüfung)'}`
    +`<br><br><b>👴 Die Alten im Winzerboten</b><br>Im September sagen die Alten auf der Bank vor der Kirche, was sie vom Jahr halten: zuversichtlich, bedeckt oder besorgt. Sie wissen ein bisschen mehr als der Sommer allein.${T.includes('rest')?'':' (nur in der Meisterprüfung)'}`
    +`<br><br><b>🍂 Die Tendenz</b><br>In ${mitte} meldet der Winzerbote im September dazu die Tendenz des Herbstes. Sie sagt nur, welcher Weg besser ist, Edelfäulnis oder Frost. Wie gut das Jahr fürs Warten ist, sagen die anderen Zeichen.`
    +`<br><br><b>💶 Der Markt</b><br>${(DIFF[S.schwer]||{}).land?'Wein- und Landpreise schwanken':'Die Weinpreise schwanken'} von Monat zu Monat, den Stand zeigt der Marktbericht.${(DIFF[S.schwer]||{}).marktSatz?' In der Meisterprüfung schwanken sie stärker, und der Winzerbote meldet, wenn die Händler gerade gut oder schlecht zahlen.':''}`
    +`<br><br><b>🌍 Die Form der Gegner</b><br>${(DIFF[S.schwer]||{}).form?`Der Favorit der Weltweinschau ist mal stärker, mal schwächer als sonst. Seine Form steht in der Rangliste und im ${MON[WELT_FORM_MON]} im Winzerboten.`:'In der Meisterprüfung verrät der Winzerbote vor der Weltweinschau, in welcher Form der Favorit ist.'}`;
});
// Was eine Stufe braucht, mit den Hürden des eigenen Gebiets (früher die Zeilen im Weinlexikon).
function kompStufeText(st){
  const m=R().min, d=STUFEN[st];
  if(st==='feder') return `Ab ${m.tafel}° Öchsle, jede Leseart. Nur im Monat nach der Lese anmelden und abfüllen, gleich verkaufbar, hält 3 Monate. Der Weinhändler nimmt ihn in jeder Menge zum vollen Preis, schnelles Geld für den Notfall. Reich wird damit keiner.`;
  // Seit 14.5.4 ein Eiswein, ein Preis (bis 14.5.3 drei Wertstufen nach den Öchsle), seit 14.5.5 mit dem Anspruch an die Qualität. Platzhalter, Wortlaut in Meilenstein 17.
  if(st==='eis') return `Ab ${m.tafel}° Öchsle und ${ANSPRUCH.eis} Punkten Qualität, nur gefrorene Trauben der Dezember-Lese, ${LESE.reif} oder ${LESE.ueber}, nicht gemischt. Nur im Januar anmelden. Ab ${EIS_OE_SCHWELLE}° bringt jeder Grad mehr Preis.`;
  return `Ab ${mindest(st)}° Öchsle${ANSPRUCH[st]?` und ${ANSPRUCH[st]} Punkten Qualität`:''}, ${d.lese?LESE[d.lese]:'jede Leseart'}${d.edel===true?', mit Edelfäulnis':d.edel===false?', ohne Edelfäulnis':''}.`;
}
// Die zehn Einträge mit Siegeln je Kapitel: der Sekt bei den Sorten, die neun Stufen bei den Stufen. Nur sie zählen.
function kompIds(kap){
  if(kap==='sorte') return ['sekt'];
  if(kap==='stufe') return Object.keys(STUFEN).map(st=>'stufe_'+st);
  return [];
}
// Alles, was ein Kapitel zeigt: erst die Einträge mit Siegeln, dann die Wissens-Seiten. Bei den Gebieten steht das eigene oben.
function kompSeiten(kap){
  if(kap==='sorte') return [...kompIds(kap),...sortenFolge().map(id=>'sorte_'+id)];
  if(kap==='stufe') return [...kompIds(kap),'edel','zeichen','regeln'];
  if(kap==='gebiet') return ['gebiet_'+S.region,'spitze','klima','lagen',...Object.keys(REGIONEN).filter(r=>r!==S.region).map(r=>'gebiet_'+r)];
  if(kap==='technik') return [...KELLER_PREISE.map((p,i)=>'keller'+(i+1)),'sektkeller','reife','zuckern',...Object.keys(MASCH).map(id=>'masch_'+id)];
  if(kap==='gefahr') return ['hagel','spaetfrost','kaelte','skandal','kontrolle','maschine','helferweg',...Object.keys(SCHAED).filter(a=>schaedAn()&&(S.schaedGes||{})[a])];
  return kompIds(kap);
}
const kompSt=id=>((S.komp||{})[id]||{}).st||0;
function kompZahlen(kap){const I=kap?kompIds(kap):KOMP_KAP.flatMap(k=>kompIds(k[0])); return {hab:I.reduce((a,id)=>a+kompSt(id),0),max:I.length*3}}
function kompE(id){const K=S.komp||(S.komp={}); return K[id]||(K[id]={st:0,n:0})}
// Trägt etwas ein (seit 11.4). o.f zählt verkaufte Flaschen dazu, o.gm merkt die Goldmedaille. Die Siegel kommen der Reihe nach:
// Bronze und Silber ab den Flaschen aus KOMP_W, Gold ab der dritten Zahl oder, wo es keine gibt, mit der Goldmedaille. Wissens-Seiten tragen nichts ein.
// Ein Stand aus den Regeln vor 11.4 bleibt (kein Siegel geht verloren), es geht von dort aus weiter.
function komp(id,o){
  const D=KOMP[id]; if(!S||!D||D.wissen||!D.w) return;
  const e=kompE(id), alt=e.st||0, W=D.w; o=o||{};
  if(o.f) e.f=(e.f||0)+o.f;
  if(o.gm) e.gm=1;
  const f=e.f||0;
  if(e.st<1&&f>=W[0]) e.st=1;
  if(e.st===1&&f>=W[1]) e.st=2;
  if(e.st===2&&(W[2]?f>=W[2]:e.gm)) e.st=3;
  if(e.st>alt){e.r=Math.max(e.r||0,e.st); kompNeu(id,e.st)}
}
function kompNeu(id,st){
  (S.kompNeu=S.kompNeu||[]).push([id,st]); const a=kompAlbumId(id); if(a) kompAlbum(a,st);
  rufPruef();
  if(KOMP_LEISE||window.BOT) return;
  KOMP_Q.push([id,st]); if(!KOMP_T) KOMP_T=setTimeout(kompMeldung,350);
}
// Zeilen für "Kurz gemeldet". Alte Spielstände bekommen beim ersten Mal einen Satz zum neuen Buch (kompAlt) oder zu den Regeln seit 11.4 (kompUm3,
// mit kompUm auch zu den Wissens-Seiten aus 11.3).
function kompBote(Z){
  lexInit();
  const M=new Map(); for(const q of S.kompNeu||[]) if(KOMP[q[0]]&&!KOMP[q[0]].wissen) M.set(q[0],q[1]);
  S.kompNeu=[];
  const z=kompZahlen();
  if(S.kompAlt){Z.push(`🏅 Neu im Weinarchiv der Kellerei: das Siegelbrett. Siegel gibt es für die neun Stufen und den Sekt, jeder Eintrag hängt an einer deiner Rebsorten. Gezählt wird ab jetzt, du hast ${z.hab} von ${z.max} Siegeln.`); delete S.kompAlt; delete S.kompUm; delete S.kompUm3; return}
  if(S.kompUm3){Z.push(`🏅 Das Siegelbrett zählt jetzt nach Rollen: Siegel gibt es für die neun Stufen und den Sekt, und jeder Eintrag hängt an einer deiner Rebsorten, zum Beispiel „${KOMP.stufe_kab.titel}“. Bronze und Silber bringen verkaufte Flaschen, Gold viele Flaschen oder eine Goldmedaille. Deine Siegel bleiben, du hast ${z.hab} von ${z.max}. ${S.kompUm?'Rebsorten, Gebiet, Technik und Gefahren sind jetzt Seiten zum Nachlesen, jede mit einer kleinen Geschichte.':'Die Rebsorten sind jetzt Seiten zum Nachlesen.'}`); delete S.kompUm3; delete S.kompUm; return}
  const T=[...M].map(([id,st])=>`${KOMP[id].titel} (${KOMP_ST[st]})`);
  if(T.length<=3) for(const t of T) Z.push(`🏅 Neues Siegel auf dem Siegelbrett: ${t}.`);
  else Z.push(`🏅 ${T.length} neue Siegel auf dem Siegelbrett: ${T.join(', ')}.`);
}
for(const [id,[rolle]] of Object.entries(SORTEN_ROLLEN)){
  if(rolle==='sekt') KOMP_ALBUM.push(`wein_${id}_sekt`);
  else for(const st of Object.keys(KOMP_STUFE_ROLLE)) if(KOMP_STUFE_ROLLE[st]===rolle) KOMP_ALBUM.push(`wein_${id}_${st}`);
}
const KOMP_ALBUM_ALT=[...['riesling','mueller','silvaner','spaetb','portug','troll'].map(id=>'sorte_'+id),'sekt',...Object.keys(STUFEN).map(st=>'stufe_'+st)];
// Kennung im Album für einen Eintrag der Partie, null heißt: zählt nur in der Partie.
function kompAlbumId(id){
  const D=KOMP[id]; if(!S||!D||!D.rl) return null;
  let so=kompRollen()[D.rl];
  if(!S.rollen) so=KOMP_ALT_ALBUM[so+'|'+D.rl];
  return so?`wein_${so}_${D.stufe}`:null;
}
function kompAlbumLies(){try{const o=JSON.parse(localStorage.getItem(KOMP_ALBUM_KEY)||'{}'); return o&&typeof o==='object'&&!Array.isArray(o)?o:{}}catch(e){return {}}}
function kompAlbumSchreib(A){try{localStorage.setItem(KOMP_ALBUM_KEY,JSON.stringify(A))}catch(e){}}
function kompAlbum(id,st){if(window.BOT) return; const A=kompAlbumLies(); if((A[id]||0)>=st) return; A[id]=st; kompAlbumSchreib(A)}
// Beim Laden: was die Partie nach den Regeln von 11.4 geholt hat (r), kommt ins Album, falls es dort fehlt.
function kompAlbumAbgleich(){
  if(window.BOT) return; const A=kompAlbumLies(); let neu=0;
  for(const id of [...kompIds('sorte'),...kompIds('stufe')]){const e=(S.komp||{})[id], a=kompAlbumId(id); if(a&&e&&e.r>(A[a]||0)){A[a]=e.r; neu=1}}
  if(neu) kompAlbumSchreib(A);
}
// Einmal vor dem Umbau auf 11.4: Was ein Spielstand nach den alten Regeln hatte, kommt in den alten Block des Albums, wie bis 11.3 bei jedem Laden.
function kompAlbumAltAbgleich(){
  if(window.BOT) return; const A=kompAlbumLies(); let neu=0;
  for(const id of KOMP_ALBUM_ALT) if(kompSt(id)>(A[id]||0)){A[id]=kompSt(id); neu=1}
  if(neu) kompAlbumSchreib(A);
}
// Seit 11.3: Das Album geht in die Sicherung als Datei mit (slotSichern) und kommt beim Laden einer Datei zurück. Je Eintrag gilt der bessere Stand.
// Die Datei ist fremder Inhalt: Es zählen nur bekannte Kennungen (beide Blöcke) und die Werte 1 bis 3. Gibt zurück, ob die Datei ein Album hatte.
function kompAlbumNimm(X){
  if(!X||typeof X!=='object'||Array.isArray(X)) return false;
  const A=kompAlbumLies(); let neu=0;
  for(const id of [...KOMP_ALBUM,...KOMP_ALBUM_ALT]){const v=Object.prototype.hasOwnProperty.call(X,id)?Math.floor(+X[id]):0; if(v>=1&&v<=3&&v>(A[id]||0)){A[id]=v; neu=1}}
  if(neu) kompAlbumSchreib(A);
  return true;
}
// Seit 13.7.7: Freischaltung der Meisterprüfung beim Gerät (MEISTER_KEY). window.MEISTER_FREI ist der Schalter "Meisterprüfung frei" für Test-Spieler und Prüfskript.
// Wie beim Album schreibt der Test-Spieler nichts hinein. meisterFreiSetz gibt zurück, ob die Meisterprüfung gerade neu frei wurde.
function meisterFrei(){if(window.MEISTER_FREI) return true; try{return localStorage.getItem(MEISTER_KEY)==='1'}catch(e){return false}}
function meisterFreiSetz(){if(window.BOT||meisterFrei()) return false; try{localStorage.setItem(MEISTER_KEY,'1')}catch(e){return false} return true}
// Ein Stand in den Gesellenjahren ab der 2. Generation, auch einer aus der Zeit vor dem Umbau, zeigt eine Übergabe, die schon geschafft ist.
const meisterStand=o=>!!o&&o.schwer===MEISTER_VON&&(Math.floor(+o.gen)||1)>=MEISTER_GEN;
function meisterAbgleich(){if(window.BOT||meisterFrei()) return; for(let i=0;i<KEYS.length;i++) if(meisterStand(roh(i))){meisterFreiSetz(); return}}
/* ---- Haken im Spiel ---- */
function kompLese(id,liter){id=stamm(id); if(KOMP['sorte_'+id]) kompE('sorte_'+id).l=(kompE('sorte_'+id).l||0)+liter}
// Verkauf auf jedem Weg (Großhandel, Weinhandlungen, eigenes Regal, Daueraufträge): Jede Flasche zählt einmal, beim Sekt oder bei ihrer Stufe,
// aber nur, wenn sie aus der Sorte des Eintrags stammt. In Spielständen ohne Rollen zählt beim Sekt jeder Sekt. Gepanschter Wein zählt nie.
function kompVerkauf(l,n){
  if(!l||!(n>0)||l.pansch) return;
  const so=kompRollen();
  sorteVerkMerk(l,so);
  if(l.sekt){if(!S.rollen||l.sorte===so.sekt) komp('sekt',{f:n}); return}
  const rl=KOMP_STUFE_ROLLE[l.stufe]; if(rl&&stamm(l.sorte)===so[rl]) komp('stufe_'+l.stufe,{f:n});
}
// Wettbewerb. w ist der Wein oder die Einreichung (sorte, stufe, sekt), platz 0 bis 2. Es zählt nur die Goldmedaille, also Platz 1 (Maik 19.11.2026),
// und nur bei Auslese bis Eiswein der Spitzen-Sorte und beim Sekt. Eine Goldmedaille bringt nie Bronze, sie wird gemerkt, bis Silber da ist.
function kompMedaille(w,platz){
  if(!w||!w.sorte||platz!==0) return;
  const so=kompRollen();
  if(w.sekt){if(!S.rollen||w.sorte===so.sekt) komp('sekt',{gm:1}); return}
  if(KOMP_STUFE_ROLLE[w.stufe]==='spitze'&&stamm(w.sorte)===so.spitze) komp('stufe_'+w.stufe,{gm:1});
}
// Goldmedaillen der Weine, die noch im Keller liegen (für alte Spielstände).
function kompMedLot(l){if(l&&!l.pansch&&(l.med||[]).some(m=>/^(🥇|🏆|🌍)/u.test(String(m)))) kompMedaille(l,0)}
// Alte Spielstände. Vor 11.1: Die Zähler fangen bei null an, nur Goldmedaillen im Keller werden still gemerkt.
function altKomp(){
  if(S.komp){if(!S.kompV) kompUmbau(); if(S.kompV<3) kompUmbau3(); kompAlbumAbgleich(); return}
  S.komp={}; S.kompV=3; KOMP_LEISE++;
  try{for(const l of S.lots) kompMedLot(l)}finally{KOMP_LEISE--}
  S.kompNeu=[]; S.kompAlt=1;
}
// Spielstände aus 11.1 und 11.2: Die Einträge für Gebiet, Technik und Gefahren bleiben liegen und zählen nicht mehr (kompUm, erklärt mit kompUm3).
function kompUmbau(){S.kompV=2; S.kompUm=1}
// Spielstände aus 11.1 bis 11.3 auf die Siegel nach Rollen (Maik 20.11.2026): Die Stufen und der Sekt behalten ihre Siegel und hängen ab jetzt an einer Sorte
// aus KOMP_ALT_ROLLEN, die drei Sorten-Einträge zählen nicht mehr. Die Flaschen zählen ab jetzt, Goldmedaillen im Keller werden neu gelesen.
// Der nächste Winzerbote erklärt das einmal (kompUm3).
function kompUmbau3(){
  kompAlbumAltAbgleich();
  S.kompV=3; S.kompUm3=1; KOMP_LEISE++;
  try{for(const l of S.lots) kompMedLot(l)}finally{KOMP_LEISE--}
}
const kompVon=(a,b,w)=>`${num(Math.min(a||0,b))} von ${num(b)} ${w}`;
// Bedingung je Siegel (1 bis 3). Geschaffte Stufen nennen nur die Schwelle, offene den Stand.
function kompBed(D,e,i){
  const W=D.w, st=e.st||0;
  if(i<3||W[2]) return st>=i?`${num(W[i-1])} Flaschen verkauft`:kompVon(e.f,W[i-1],'Flaschen verkauft');
  return `Hol ${D.stufe==='sekt'?(S.rollen?'mit diesem Sekt ':'mit einem Sekt ')+KOMP_GOLDMED_SEKT:'mit diesem Wein '+KOMP_GOLDMED}.`;
}
// Was für den Eintrag zählt.
function kompZaehlt(id){
  const D=KOMP[id], so=kompSorte(id);
  if(id==='sekt') return S.rollen?`Für die Siegel zählt nur der Regional-Sekt ${sorteVom(so)}. Gepanschter Sekt zählt nie.`:'Für die Siegel zählt jeder Sekt, egal aus welcher Sorte. Gepanschter Sekt zählt nie.';
  return `Für die Siegel zählt nur ${D.name} ${sorteVom(so)}, nicht aus anderen Sorten${D.rl==='menge'?' und nicht als Sekt':''}. Gepanschter Wein zählt nie.`;
}
// Der nächste Schritt als kurze Zeile für die Liste.
function kompNaechst(id){
  const D=KOMP[id], e=(S.komp||{})[id]||{st:0}, st=e.st||0;
  if(st>=3) return 'Alle drei Siegel geholt.';
  return `${KOMP_ST[st+1]}: ${kompBed(D,e,st+1)}`;
}
// Der erste Satz der Geschichte als Anreißer für die Wissens-Seiten.
const kompKurz=id=>(KOMP_TEXT[id]||'').split(/(?<=[.!?]) /)[0];
// Die Geschichte: beim Sekt in Partien mit Rollen die des Regional-Sekts.
function kompGeschichte(id){const so=id==='sekt'&&S.rollen?kompSorte(id):null; return (so&&KOMP_TEXT['sekt_'+so])||KOMP_TEXT[id]||''}
const kompBrettIds=rl=>rl==='sekt'?['sekt']:Object.keys(STUFEN).filter(st=>KOMP_STUFE_ROLLE[st]===rl).map(st=>'stufe_'+st);
const kompBocks=id=>id!=='sekt'&&S.region==='franken'&&/silvaner/.test(kompSorte(id)||'');
// Lexikon, Variante L1: die Wissens-Seiten ohne Siegel, ein Kapitel zum Antippen. Neue Seiten tragen ein gelbes "Neu", bis man sie einmal geöffnet hat.
// S.lexK merkt die Seiten, die der Spieler kennt. Beim ersten Mal gilt alles, was es dann gibt, als bekannt. Neu sind also nur später dazugekommene Seiten (zum Beispiel die Schädlinge).
const lexSeiten=kap=>kompSeiten(kap).filter(id=>KOMP[id]&&KOMP[id].wissen);
const lexAlle=()=>KOMP_KAP.flatMap(k=>lexSeiten(k[0]));
function lexInit(){if(S&&!S.lexK){S.lexK={}; for(const id of lexAlle()) S.lexK[id]=1}}
const lexNeu=id=>!!(S&&S.lexK&&!S.lexK[id]);
const lexNeuZahl=()=>S&&S.lexK?lexAlle().filter(lexNeu).length:0;
// Seit 12.2: Schädlinge, Sektkeller und Maschinen zeigen oben Timos Bild, im Stil der Meldung (masch_laub wird masch-laub).
const KOMP_BILD=id=>/^(wickler|mehltau|kirsch|sektkeller|masch_(duenger|klein|laub|gross|abfuell))$/.test(id)?id.replace('_','-'):'';
function kompAuf(id){
  if(id&&KOMP[id]){if(KOMP[id].wissen){KOMP_AKT=KOMP[id].kap; if(S.lexK) S.lexK[id]=1} return openSheet(kompEintragHtml(id))}
  archivGeh('brett');
}
/* ================= Spielstart ================= */
function neuesSpiel(){
  if(NEU.schwer===MEISTER_STUFE&&!meisterFrei()) NEU.schwer=MEISTER_VON; // seit 13.7.7, gesperrt bis zur ersten Übergabe in den Gesellenjahren
  const reg=REG(NEU.region,!!ROLLEN_NEU);
  S={v:1,v13:1,v147:1,chefsache:{...CHEFSACHE_START},sektWahl:SEKT_REIFE,zf:zfNeu(),name:NEU.name.trim().slice(0,NAME_MAX)||'Rebenreich',ich:(NEU.ich||'').trim().slice(0,30),anrede:NEU.anrede==='w'?'w':'m',region:NEU.region,jahr:2027,monat:0,geld:startGeld(NEU.schwer,NEU.region),ha:3,hang:{einfach:3,hoehe:0,sued:0},bodenSt:0,bodenP:{einfach:0,hoehe:0,sued:0},duengungen:0,
    felder:{},fassraum:6000,flaschen:3000,lots:[],nextId:1,wetter:'kalt',wetterNext:'kalt',prognose:'kalt',markt:1,ansehen:0,ansV:1,leuteV:1,
    jahrEin:0,jahrAus:0,edel33:1,bericht:null,helfer:ALLEIN_HA?0:1,lagerarb:ALLEIN_FASS?0:1,maschinen:[],kredit:null,ehrungen:[],ehrZeig:0,meilen:0,mahnung:0,pleite:false,kontr:{in:rint(24,48),scharf:0},fu:fuNeu(),zeit:0,zeitAb:0,zeitRang:[],rangMon:{0:START_JAHR*12},freiBote:{},taten:{},komp:{},kompV:3,v121:1,ein:{f:[]},...(ROLLEN_NEU?{rollen:1}:{})};
  for(const id of reg.sorten){S.felder[id]={reben:0,pflSt:0,ep:0,boden:BODEN_START}; feldReset(S.felder[id])}
  etappe3(3,NEU.schwer);
  lohnAbgleich();
  neuePrognose();
  TOP=[]; FUSS=[];
  schlag(100,'Willkommen auf deinem Weingut',`${S.ich?`${S.ich} übernimmt ${S.name} ${WO[S.region]}: 3 Hektar kahler Weinberg, leere Fässer und ${eur(S.geld)}.`:`${S.name} ${WO[S.region]} startet mit 3 Hektar kahlem Weinberg, leeren Fässern und ${eur(S.geld)}.`} Bis März ist Pflanzzeit, im Weinberg pflanzt du deinen ${SORTEN[sortenFolge()[0]].name}. Die zweite und dritte Rebsorte bringt der Aufstieg. Neue Reben starten als Jungrebe und tragen erst wenig.`,'weingut-01-sommer',{du:1});
  // Seit 10.3 (Frage 11): Mit Spielführer fallen die zwei Artikel weg, die der alte Winzer im ersten Monat selbst sagt.
  if(!(S.fu&&S.fu.an)) schlag(50,'So kommst du herum','Unten wählst du Weingut, Kellerei oder Stadt, die Leiste darüber bringt dich zu den Orten. Wischen übers Bild geht auch. Ein Punkt am Reiter zeigt Neues oder Dringendes, ein Tipp aufs Geld öffnet deinen Stand mit Kasse und Rängen. Das kleine i oben rechts in jedem Fenster erklärt, was du dort tust. Spielstände, Ton und das Buch liegen im Büro.');
  if(!(S.fu&&S.fu.an)) schlag(40,'Leute für Weinberg und Keller',`${helferRegel()}. ${lagerRegel()}. Leute findest du beim Arbeitsamt in der Stadt, der Lohn dort schwankt jeden Monat, wer eingestellt ist, behält seinen. Fehlen dir Leute, geht es nicht in den nächsten Monat.`,'arbeit');
  schlag(30,'Die Konkurrenz schläft nicht','Deine Gegner: '+S.gegner.map(g=>`${g.name}, ${GEGNER_TYP[g.typ].art}, ${WO[g.region]}`).join('; ')+`. Alle wollen auf den großen Stuhl im Weinbauverband, und es passt immer nur einer darauf. Alle ${GEN_JAHRE} Jahre übernimmt bei allen die nächste Generation.`);
  dorf('n0');
  S.bericht=zeitung([],[],[]);
  // Version 7.7: Der Spielstart ist selbst eine Feier: Bühne mit der Geschichte, Kaufvertrag, dann die erste Ausgabe vom Winzerboten.
  elternMerk(); S.feier={start:1,von:0,zu:0}; FSTUFE=0;
  S.jhAb=jhJahre()[0]; S.jhV=1; S.bodenFl={einfach:0,hoehe:0,sued:0}; S.bodenStL={}; bodenVerduennen(); // seit 14.2.5
  START=null; TAB='feier'; save(); render();
}

/* ================= Monatswechsel ================= */
function verfallListe(){
  const v=[], KT=kellerTeil();
  for(const l of S.lots){
    if(l.status==='trauben'&&KT.has(l.id)) v.push(`${num(l.liter-KT.get(l.id))}\u00a0l ${SORTEN[l.sorte].name}-Trauben finden keinen Fassraum, deine Kellerleute keltern ${num(KT.get(l.id))}\u00a0l`);   // seit 15.6.4, Platzhalter
    else if(l.status==='trauben') v.push(`${num(l.liter)}\u00a0l ${SORTEN[l.sorte].name}-Trauben sind nicht gekeltert${l.mgrNot&&aufgabeAktiv('fass')?(l.mgrNot==='geld'?`, dein ${MGR_BEREICHE.weingut.name} kauft keinen Fassraum unter deiner Geldgrenze`:`, deinem ${MGR_BEREICHE.weingut.name} fehlen Kellerleute für mehr Fassraum`):''}`);
    else if(l.status==='sektTr') v.push(`${num(l.liter)} Flaschen ${SORTEN[l.sorte].name}-Sekt sind nicht im Sektkeller`);
    else if(l.status==='fass'&&l.stufe==='feder') v.push(`Federweißer ${l.jahrgang} ${SORTEN[l.sorte].name} ist nicht abgefüllt`);
    else if(l.status==='fass'&&l.fassMonate>=7) v.push(`${lotName(l)} liegt zu lange im Fass`);
    else if(l.status==='flasche'&&l.flMonate>=lager(l).max) v.push(`${lotName(l)} hat seine Haltbarkeit erreicht`);
  }
  return v;
}
// Seit 7.9: o.du=1 heißt, die Schlagzeile betrifft dich selbst. Nur dann hält "Weiter bis etwas ansteht" an.
function schlag(p,t,text,bild,o){TOP.push({p,t,text:text||'',bild:bild||'',...(o||{})})}
function flauteKopf(){
  const m=S.monat, V=[[FLAUTE[m],FLAUTE_TEXT[m]],...FLAUTE_MEHR[m]];
  let i=rint(0,V.length-1); if(S.flauteZ===m*10+i) i=(i+1)%V.length; S.flauteZ=m*10+i;
  return {p:0,t:V[i][0],text:V[i][1],bild:''};
}
// Platzhalter in den Dorf- und Rubrik-Texten: {gut}, {wo}, {nachbar}, {gegner} und {er} (sie oder er, passend zum Gegner).
function fuelle(x){
  const g=S.gegner&&S.gegner.length?S.gegner[rint(0,S.gegner.length-1)]:null;
  return x.replace(/\{gut\}/g,S.name).replace(/\{wo\}/g,WO[S.region]).replace(/\{nachbar\}/g,()=>NACHBARN[rint(0,NACHBARN.length-1)])
    .replace(/\{gegner\}/g,g?g.name:'ein Nachbar').replace(/\{er\}/g,g&&g.typ==='vorsicht'?'sie':'er');
}
function dorf(k){
  S.gesch=S.gesch||{}; if(S.gesch[k]||!DORF[k]) return; S.gesch[k]=1;
  schlag(45,'🏘️ '+DORF[k][0],fuelle(DORF[k][1]));
}
// ---- Schritt G 7.0: Generationswechsel und die Geschichte mit der Flasche vom ersten Jahrgang ----
// GEN_TEXT: Schriftstücke von unten. anfang beim ersten abgefüllten Wein, g2 und g3 bei der ersten und zweiten Übergabe,
// weiter bei jeder späteren, offen bei einer Übergabe, wenn du schon Präsident bist und die Flasche getrunken ist.
const pz=x=>Math.round(x*100)+' %';
// Zum Januar: Ankündigung GEN_VORAUS Jahre vorher, Erinnerung ein Jahr vorher, dann die Übergabe.
// Seit 13.6.4 (Maik 21.11.2026, Entscheidung 2): Die Partie endet nur noch als Ehrenpräsident. Nach der dritten Krone ist die nächste Übergabe im Januar
// die letzte (A.ehren.ende als Monats-Nummer), danach kommt die Chronik, ohne Erbschaftssteuer. Ohne alle Kronen gibt es kein Ende: Alle GEN_JAHRE Jahre
// übernimmt die nächste Generation wie gewohnt, auch mit Amt, und tritt weiter an. Nur die Pleite beendet eine Partie sonst. Ohne Ende ist endeMonat() unendlich.
function endeMonat(){const E=S.amt&&S.amt.ehren; return E?(E.ende!=null?E.ende:(E.j+1-START_JAHR)*12):Infinity}
const endeJahr=()=>START_JAHR+endeMonat()/12;
function generationAmt(Z){if(monatNr()>=endeMonat()) spielEnde('gen')}
function generationMonat(Z){
  if(S.monat!==0) return;
  if(amtEhre()) return generationAmt(Z);
  const j=S.jahr-START_JAHR, n=genNr();
  if(j===GEN_JAHRE*n-GEN_VORAUS) schlag(68,`In ${GEN_VORAUS} Jahren übernimmt die nächste Generation`,`Die Jahre am Hang hinterlassen Spuren. Im Januar ${genJahr(n)} übergibst du ${S.name} an dein Kind. Bleiben wird alles, was du aufgebaut hast: Fläche, Reben, Keller, Wein, Maschinen, Leute, Manager und dein Rang. Vom Ansehen nimmt die nächste Generation ${pz(erbAnsehen())} mit, und das Finanzamt verlangt ${pz(ERB_STEUER)} vom Vermögen als Erbschaftssteuer, nach heutigem Stand rund ${eur(erbSchaetzung())}. Reicht das Geld nicht, leiht die Bank den Rest, auch über den Kreditrahmen hinaus.`,GEN_BILD.uebergabe,{du:1});
  else if(j===GEN_JAHRE*n-1) Z.push(`👪 Nächsten Januar übernimmt die nächste Generation. Erbschaftssteuer nach heutigem Stand rund ${eur(erbSchaetzung())}, vom Ansehen bleiben ${pz(erbAnsehen())}.`);
  else if(j===GEN_JAHRE*n) uebergabe();
}
function uebergabe(){
  const n=genNr(), v=vermoegen(), steuer=Math.max(0,Math.round(v*ERB_STEUER/100)*100), bar=Math.min(steuer,Math.max(0,S.geld)), kr=steuer-bar, ansVor=S.ansehen, alt=S.erbe||{};
  S.geld-=bar;
  if(kr>0){const k=S.kredit||(S.kredit={rest:0,tilgung:0}); k.rest+=kr; k.tilgung+=Math.ceil(kr/ERB_LAUFZEIT); k.erb=(k.erb||0)+kr}
  const ea=erbAnsehen(); S.ansehen=Math.round(S.ansehen*ea);
  (S.chronik=S.chronik||[]).push({n,name:S.ich||alt.name||'',art:S.anrede?(S.anrede==='w'?'t':'s'):alt.art||'',von:genJahr(n-1),bis:S.jahr,rang:S.rang,ans:ansVor,verm:v,steuer,kredit:kr,...(amtAlt()?{alt:1}:{})});
  S.gen=n+1;
  // Seit 13.7.7: Die erste Übergabe in den Gesellenjahren schaltet auf dem Gerät die Meisterprüfung frei.
  const mf=S.schwer===MEISTER_VON&&meisterFreiSetz();
  const wahl=a=>a[rint(0,a.length-1)];
  const rat=S.rang>=2?(S.ratte=(S.ratte||1)+1):0;
  S.erbe={ratte:rat,k:S.flascheAuf?'offen':n===1?'g2':n===2?'g3':'weiter',offen:1,name:'',art:Math.random()<.5?'t':'s',vt:wahl(ERB_NAMEN.t),vs:wahl(ERB_NAMEN.s),steuer,kredit:kr,verm:v,ansVor,ans:S.ansehen};
  schlag(97,`${S.name} in neuen Händen`,`Zum Jahreswechsel geht das Weingut ${WO[S.region]} an die ${n+1}. Generation. Erbschaftssteuer: ${eur(steuer)}${kr?`, davon ${eur(kr)} als Kredit bei der Bank`:''}. Vom Ansehen bleiben ${pz(ea)}, jetzt ${num(S.ansehen)}.${ea>ERB_ANSEHEN?` ${anr('Der Ehrenbürger','Die Ehrenbürgerin')} geht in den Ruhestand, das ganze Dorf zieht den Hut.`:''} Rang, Fläche, Keller, Wein und alle Leute bleiben.${mf?` Und weil du die ${DIFF[MEISTER_VON].name} gemeistert hast, wartet in der nächsten Partie die ${DIFF[MEISTER_STUFE].name}.`:''}`,GEN_BILD.uebergabe,{gold:1,erbe:1,du:1});
  if(window.BOT) erbeBenennen(S.erbe.art==='t'?S.erbe.vt:S.erbe.vs);
}
const endeFeier=()=>!!(S.feier&&S.feier.welt==='ende');
// Seit 13.6.4 nur noch der Text zum besten Ende, das gute Ende ist weg.
function endeText(){
  const fl=S.flascheAuf;
  const P=[`Auf dem Küchentisch liegen der alte Kellerschlüssel${fl?', die leere Flasche vom ersten Jahrgang':''} und ${siegJh()?'die volle mit dem Jahrhundertwein':'die volle vom Siegerwein der Weltweinschau'}.`,`„Den Schlüssel kannst du benutzen“, sagst du zu deinem Kind. „${fl?'Die leere bleibt, wo sie ist. Und die volle':'Und die Flasche'} ...“`,'„Ich weiß. Noch nicht.“'];
  if(nfName()) P.push(`Es übernimmt: ${nfName()}.`);
  return P;
}
// Seit 11.7 (A24): der Nachfolger nach der letzten Übergabe. S.ende.nf: {offen, art 't' oder 's', Vorschläge vt und vs, name, voll mit Familienname}.
const nfOffen=()=>!!(S&&S.ende&&S.ende.nf&&S.ende.nf.offen);
function nfVorschlag(){const f=S.ende.nf; return f.art==='s'?f.vs:f.vt}
function nfName(){const f=S&&S.ende&&S.ende.nf; return f&&!f.offen&&f.name?`${f.voll||f.name}, ${f.art==='s'?'der Sohn':'die Tochter'}`:''}
function nfBenennen(name){const f=S.ende.nf, fam=famName(); f.name=name; f.voll=(fam&&!name.includes(' ')?name+' '+fam:name).slice(0,40); f.offen=0}
function spielEnde(wie){
  const n=genNr(), alt=S.erbe||{}, ab=amtAlt();
  (S.chronik=S.chronik||[]).push({n,name:S.ich||alt.name||'',art:S.anrede?(S.anrede==='w'?'t':'s'):alt.art||'',von:genJahr(n-1),bis:S.jahr,rang:S.rang,ans:S.ansehen,verm:vermoegen(),steuer:0,kredit:0,ende:1,...(ab?{alt:1}:{}),ehr:1});
  S.ende={art:'best',wie,j:S.jahr,m:S.monat,stand:endStand(),...(ab?{alt:1}:{})};
  S.ende.platz=bestenEintrag();
  if(wie==='gen'&&S.schwer===MEISTER_VON) meisterFreiSetz(); // seit 13.7.7, die letzte Übergabe zählt auch
  // Seit 11.7 (A24): Wer das Weingut nach der letzten Übergabe bekommt, wählst du vor dem Küchentisch wie bei jeder Übergabe (zeigeNachfolger).
  S.ende.nf={offen:1,art:Math.random()<.5?'t':'s',vt:ERB_NAMEN.t[rint(0,ERB_NAMEN.t.length-1)],vs:ERB_NAMEN.s[rint(0,ERB_NAMEN.s.length-1)],name:''};
  if(window.BOT) nfBenennen(nfVorschlag());
  // Seit 10.2 kommt das Gespräch am Küchentisch auf der Bild-Bühne (S.feier.welt 'ende'), danach die Chronik. Der Winzerbote meldet nur noch die Übergabe.
  S.wett=null; S.auktion=null; S.feier={welt:'ende'};
  if(wie==='gen') schlag(100,`${S.name}: Die Übergabe am Küchentisch`,`Zum Jahreswechsel übergibt ${S.ich||anr('der '+duN(),'die '+duN())} das Weingut an die nächste Generation. Damit schließt sich nach ${jahreTxt(S.ende.stand.jahre)} ${WO[S.region]} der Kreis für ${S.name}.${spLohn(SPENDEN.length-1)?` ${anr('Der Ehrenbürger','Die Ehrenbürgerin')} geht in den Ruhestand, das ganze Dorf zieht den Hut.`:''} Am Küchentisch wartet schon dein Kind, danach kommt die Chronik.`,ENDE_BILD.best,{gold:1,sonder:1,du:1,schluss:1});
}
function erbeOffen(){return !!(S&&S.erbe&&S.erbe.offen)}
function erbeVorschlag(){const e=S.erbe; return e.art==='s'?e.vs:e.vt}
function erbeBenennen(name){
  const e=S.erbe, fam=famName(); e.name=name; e.offen=0;
  // Seit 7.9: Der Erbe ersetzt den eigenen Namen (Vorname mit dem Familiennamen) und bestimmt die Anrede.
  S.anrede=e.art==='t'?'w':'m'; elternMerk(); if(S.ich) S.ich=(fam&&!name.includes(' ')?name+' '+fam:name).slice(0,40);
  const b=S.bericht||{}, wer=e.art==='s'?'der Sohn':'die Tochter';
  for(const x of [...TOP,b.kopf,...(b.art||[])]) if(x&&x.erbe&&!x.benannt){x.benannt=1; x.t=`${S.ich||name} übernimmt ${S.name}`; x.text=`${name}, ${wer}, hat den Kellerschlüssel bekommen. `+x.text}
  // Seit 10.0: Texte zum Amt aus demselben Monat (Wahl, Umfrage) mit der Anrede des Erben neu schreiben.
  for(const x of [...TOP,b.kopf,...(b.art||[])]) if(x&&x.amt){const n=amtTxt(x.amt.k,x.amt.par); x.t=n.t; x.text=n.text}
}
function geschichteMonat(){
  // Schritt G 7.0: Beim ersten abgefüllten Wein (ohne Sekt, seit 10.3 auch ohne Federweißer) kommt die Flasche ins Regal. S.gesch.flasche merkt das Jahr.
  S.gesch=S.gesch||{};
  if(!S.gesch.flasche&&S.lots.some(l=>l.status==='flasche'&&!l.sekt&&l.stufe!=='feder')){S.gesch.flasche=S.jahr; S.erz='anfang'}
  if(S.jahr===START_JAHR&&S.lots.some(l=>l.status==='fass')) dorf('most');
  if(S.monat===0&&S.jahr===START_JAHR+1) dorf('winter1');
  if(S.monat===0&&S.jahr===START_JAHR+3) dorf('wette');
}
// Leserbrief eines Gegners einen Monat nach deinem Aufstieg. r ist der neue Rang, n dein Weingut.
const GEGNER_GLUECK={
  vorsicht:[(r,n)=>`„Herzlichen Glückwunsch ${anr('zum','zur')} ${r}! Ich hoffe, ${n} hat jetzt auch genug Fässer. Man weiß ja nie.“`,(r,n)=>`„Glückwunsch an ${n}. Ich habe mir die Urkunde angesehen, das Papier ist wirklich gut.“`],
  qualitaet:[(r,n)=>`„${r}, soso. Die Ernennung ist verdient, der Wein auf dem Fest war es nicht.“`,(r,n)=>`„Ich gratuliere ${n}. Bei meinem Aufstieg war die Blaskapelle allerdings besser gestimmt.“`],
  zocker:[(r,n)=>`„${r}? Hätte ich auch geschafft, wenn ich gewollt hätte. Glückwunsch trotzdem, ehrlich!“`,(r,n)=>`„Ich wette eine Kiste Sekt, dass ${n} beim nächsten Aufstieg langsamer ist als ich.“`]
};
function aufBrief(r){
  const G=S.gegner.filter(g=>GEGNER_GLUECK[g.typ]); if(!G.length||!RAENGE[r]) return;
  const g=G[rint(0,G.length-1)], T=GEGNER_GLUECK[g.typ];
  schlag(40,'✉️ Leserbrief zu deinem Aufstieg',`${T[rint(0,T.length-1)](rangN(r),S.name)} Eingesandt von ${g.name}, ${GEGNER_TYP[g.typ].art}.`);
}
const bisZiel=r=>{const n=R_MAX-r;return n<=0?'Hat alle Hürden geschafft':n===1?'Noch eine Stufe bis ganz oben':`Noch ${n} Stufen bis ganz oben`};
function rubrikNeu(nr){
  if(!S) return null;
  if(!Array.isArray(S.rubSack)||!S.rubSack.length){
    const A=Object.keys(RUBRIK).flatMap(k=>RUBRIK[k].t.map((_,i)=>k+i));
    for(let i=A.length-1;i>0;i--){const j=rint(0,i); [A[i],A[j]]=[A[j],A[i]]}
    S.rubSack=A;
  }
  const c=String(S.rubSack.pop()), R0=RUBRIK[c[0]], x=R0&&R0.t[+c.slice(1)];
  if(!x) return null;
  const [text,von]=fuelle(x).split('|');
  return {h:R0.h,text,von:von||''};
}
const eisEigen=()=>S.monat===11&&weinberge().some(id=>S.felder[id].gefroren&&S.felder[id].menge>0);
const eisT=(art,n,wo)=>{const L=EIS_TEXT[art], x=L[rint(0,L.length-1)], f=s=>s.replace(/\{n\}/g,n||'').replace(/\{wo\}/g,wo||''); return [f(x[0]),f(x[1])]};
// Seit 13.4.7: Eiswein-Geschichten nur aus Gebieten, in denen der Frost in diesem Jahr gekommen ist (Jahr und Weg statt EIS_KUEHL).
function eisGeschichte(){
  if(S.monat!==11||eisEigen()||S.eisZ===S.jahr-1||Math.random()>=EIS_Z) return;
  const G=S.gegner||[], los=L=>L[rint(0,L.length-1)], kuehl=Object.keys(REGIONEN).filter(r=>herbstJahr().uFrost<wegChance('frost',r));
  if(Math.random()<EIS_PLEITE&&G.length){
    const A=G.filter(x=>x.eisJ!==S.jahr), Zo=A.filter(x=>x.typ==='zocker');
    const g=G.find(x=>x.eisPl===S.jahr)||los(Zo.length?Zo:A.length?A:G);
    const [t,text]=eisT('pleite',g.name,WO[g.region]); S.eisZ=S.jahr; return schlag(40,t,text,'frost');
  }
  const g=G.find(x=>x.eisJ===S.jahr)||(()=>{const K=G.filter(x=>x.eisPl!==S.jahr&&kuehl.includes(x.region)); return K.length?los(K):null})();
  if(!g&&!kuehl.length) return;
  const [t,text]=g?eisT('gegner',g.name,WO[g.region]):eisT('gebiet','',WO[los(kuehl)]);
  S.eisZ=S.jahr; schlag(40,t,text,'eiswein');
}
function zeitung(Z,W,ehr,k){
  const T=TOP.slice().sort((a,b)=>b.p-a.p), kopf=T.shift()||flauteKopf(), nr=(S.jahr-START_JAHR)*12+S.monat+1;
  return {titel:`${MON[S.monat]} ${S.jahr}`,nr,rub:kopf.sonder||kopf.ende?null:rubrikNeu(nr),kopf,art:T,zeilen:Z,wetter:W,fuss:FUSS.slice(),ehr,k};
}
function monatWeiter(){
  if(S.ende) return;
  // Seit 11.1: Siegel aus dem Monatswechsel melden sich nur im Winzerboten (KOMP_LEISE).
  KOMP_LEISE++; try{monatLauf()}finally{KOMP_LEISE--}
}
function monatLauf(){
  lageKappen(); // Nachtrag zu 14.5: überzählige Reben über dem Land ihrer Lage fallen weg
  const Z=[], weg=verfallListe(); let uz=0, steuer=0;
  TOP=[]; FUSS=[];
  // Hoffest und Manager-Berichte aus dem alten Monat kommen in diese Ausgabe. Beim Hoffest zählt das Wetter des Festmonats.
  if(S.fest){
    const w=S.fest.w, f=HOFFEST_WETTER[w]||1, F=FESTE[S.fest.art||'hoffest'], n=F.name, a=ruhm(Math.round(festAns(F)*f),0,'Feste');
    const T={sonnig:'Bei strahlender Sonne kamen Hunderte Gäste',mild:'Bei mildem Wetter kamen viele Gäste',regen:'Im Regen kamen nur wenige Gäste',kalt:'Bei kühlem Wetter blieben einige Gäste zu Hause',frost:'Bei klirrender Kälte blieben einige Gäste zu Hause'};
    schlag(65,f>1?`Rauschendes ${n} bei ${S.name}`:f<.8?`${n} bei ${S.name} fällt ins Wasser`:`${n} bei ${S.name}`,`${T[w]||T.mild}, es gab Musik, ${S.fest.art==='weinfest'?'Zwiebelkuchen':'Flammkuchen'} und deinen Wein. Das ganze Dorf redet davon: +${a} Ansehen.`,f<.8?'hoffest-regen':'hoffest'); S.fest=null;
  }
  // Seit 11.5 (Teil C1): Der Winzerbote erklärt alten Spielständen einmal die neue Leute-Regel.
  if(S.leuteNeu){const n=S.leuteNeu, weg=[n.h&&`${n.h} Erntehelfer`,n.l&&kellerZahl(n.l)].filter(Boolean).join(' und ');
    // Seit Teil D: derselbe Artikel erklärt auch das verdoppelte Ansehen, die Löhne und den Deckel für die Fläche.
    // Maik 20.11.2026: gekürzt, die Lager-Regel und die Begründung für den Deckel stehen nur noch im Buch.
    const dk=haDeckel(), dkT=dk<Infinity?` Als ${rangK(S.rang)} darfst du höchstens ${dk} ha Land besitzen${S.ha>dk?', was du schon darüber hast, behältst du':''}.`:'';
    schlag(60,'Neue Regeln für dein Weingut',`Der Weinbauverband hat neue Regeln. Ansehen zählt jetzt doppelt${S.ansehen?`, du hast ${num(S.ansehen)}`:''}, Präsident wird man mit ${num(RAENGE[RAENGE.length-1].ans)}.${dkT} Leute verdienen rund ${eur(lohnF(LOHN_START))} im Monat, Manager ${eur(lohnF(MGR_LOHN[0]))} bis ${eur(lohnF(MGR_LOHN[MGR_LOHN.length-1]))}. ${helferRegel()}.${weg?` ${weg} ${n.h+n.l===1?'ist':'sind'} deshalb ohne Abfindung gegangen.`:''} Deine Manager kommen jetzt mit dem Rang von selbst und steigen mit dir auf.${n.m?' Wer noch gefehlt hat, hat sich schon vorgestellt.':''}`,'arbeit'); S.leuteNeu=null}
  if(S.mgrLog){const T=['weingut'].filter(b=>(S.mgrLog[b]||[]).length).map(b=>`Dein ${MGR_BEREICHE[b].name} meldet: ${S.mgrLog[b].join(', ')}.`); if(T.length) schlag(15,'Aus dem Gutsbüro',T.join(' '))}
  S.mgrLog=null;
  if(S.dauerLog&&S.dauerLog.length) Z.push(`📋 ${mgrG('handel').Dein} ${MGR_BEREICHE.handel.name}: ${S.dauerLog.join(', ')}.`);
  S.dauerLog=null;
  if(S.leuteLog&&S.leuteLog.length) Z.push(`🧑‍🌾 Deine Leute: ${S.leuteLog.join(', ')}.`);
  S.leuteLog=null;
  if(SPRUNG.length){Z.unshift(...SPRUNG); SPRUNG=[]}
  // Der Wettbewerb aus dem Vormonat wird jetzt gewertet, das Ergebnis steht in dieser Ausgabe.
  if(S.wett){if(!S.wett.fertig) wettAuswerten(); S.wett=null}
  // Seit 13.6.3: Die Weltweinschau im Juni wird beim Monatswechsel danach gewertet.
  if(S.schau&&S.monat===WELT_MONAT&&S.amt) schauAuswerten();
  kellerTeilKeltern();   // seit 15.6.4, vor dem Verderben
  if(weg.length){Z.push('Verdorben: '+weg.join('; ')+'.')}
  S.lots=S.lots.filter(l=>!(l.status==='trauben'||l.status==='sektTr'||(l.status==='fass'&&(l.stufe==='feder'||l.fassMonate>=7))||(l.status==='flasche'&&l.flMonate>=lager(l).max)));
  for(const l of S.lots){if(l.status==='fass')l.fassMonate++; else if(l.status==='flasche'||l.status==='hefe')l.flMonate++}
  const K=kosten(); zahle(K.basis+K.loehne+K.zins); S.geld-=K.tilgung;
  if(S.kredit){S.kredit.rest-=K.tilgung; if(S.kredit.erb) S.kredit.erb=Math.max(0,S.kredit.erb-K.tilgung); if(S.kredit.rest<=0){S.kredit=null; Z.push('Dein Kredit ist abbezahlt.')}}
  if(S.geld<0){uz=Math.round(-S.geld*.01); zahle(uz)}
  // Für den Bodenschnitt zählt der Stand am Monatsende. S.nass merkt den Regenmonat für den Hinweis im Weinberg. Seit 14.7.4 je bepflanztem Weinberg.
  for(const id of weinberge()){const f=S.felder[id]; if(f.reben>0){f.bodenSum=(f.bodenSum||0)+f.boden; f.bodenN=(f.bodenN||0)+1}}
  S.nass=S.wetter==='regen'?S.monat:null;
  S.monat++;
  for(const id of weinberge()){const f=S.felder[id]; if(f.reben>0) f.boden=Math.max(0,f.boden-(S.nass!=null?BODEN_REGEN:BODEN_MONAT))}
  if(S.monat>11){
    const ein=S.jahrEin, aus=S.jahrAus, gew=ein-aus;
    let jb=`Einnahmen ${eur(ein)}, Ausgaben ${eur(aus)}, ${gew>=0?'Gewinn':'Verlust'} ${eur(Math.abs(gew))}.`;
    // Seit 8.2: Spenden senken den Gewinn vor der Steuer, höchstens um SP_DECKEL (spAbzug).
    const spJ=S.spJahr||0, abz=spAbzug(gew);
    if(gew>0){steuer=Math.round((gew-abz)*STEUER); jb+=` Die positive Bilanz bringt +${ruhm(4)} Ansehen.${abz?` Deine Spenden senken den Gewinn um ${eur(abz)}.`:''} Steuer auf den Gewinn: ${eur(steuer)}.`}
    if(spJ&&!abz) jb+=` Gespendet hast du ${eur(spJ)}, ohne Gewinn senkt das keine Steuer.`;
    schlag(50,`Jahresbilanz ${S.jahr}: ${gew>=0?'Gewinn':'Verlust'} von ${eur(Math.abs(gew))}`,jb,'amt',{archiv:1});
    S.monat=0; S.jahr++; S.jahrEin=0; S.jahrAus=0; S.spJahr=0; S.duengungen=0; zahle(steuer);
    // Reben-Abnutzung: je Sorte ein gewürfelter Anteil aus der Spanne des Bodenschnitts, Frost kommt obendrauf. S.verlust merkt die Zahlen für Aktuelles.
    // Seit 14.7.4 (Annahme 10): Bodenschnitt, gutes Bodenjahr und Zuwachs beim Düngen je Weinberg (BS, G). schnitt ist für den Winzerboten der Schnitt
    // über alle bepflanzten Weinberge nach ihren Reben. Ohne Monatsstände (gerade erst bepflanzt) zählt der Stand von heute.
    const BS={}, G={}; let bsR=0, bsS=0;
    for(const id of weinberge()){const f=S.felder[id]; BS[id]=f.bodenN?Math.round(f.bodenSum/f.bodenN):f.boden; G[id]={gut:BS[id]>=BODEN_GUT,zd:duengZuwachs(id)};
      if(f.reben>0){bsR+=f.reben; bsS+=BS[id]*f.reben}}
    const schnitt=bsR?Math.round(bsS/bsR):BODEN_START, fp=frostPlus(), rebVor=rebenGesamt(); let totAlle=0;
    // Seit 13.2.1: Boden-Zähler. Ein Jahresschnitt ab BODEN_GUT zählt +1, sonst bleibt er stehen. Die Stufe fällt nie.
    // Seit 14.2.5 je Lage mit eigenen Punkten nur für bepflanztes Land (bodenJahr), die Jahrhundertjahre stehen seit dem Start der Partie fest.
    bodenJahr(G,Z); vollendetPruef(Z);
    S.verlust={};
    for(const [si,id] of weinberge().map(x=>[R().sorten.indexOf(stamm(x)),x])){
      const f=S.felder[id]; feldReset(f);
      // Seit 13.2.2: Rebpflege-Zähler der Sorte. Bis Ende April des abgelaufenen Jahres geschnitten (f.schnitt) zählt PFLEGE_GUT, sonst PFLEGE_PATZER zurück.
      if(f.reben){
        // Seit 14.2.2: Entwicklungspunkte (epJahr), die Stufe folgt den Punkten und fällt mit ihnen.
        const vor=f.pflSt||0, gs=f.schnitt===S.jahr-1; epJahr(f,id,G[id].gut,f.schnittZ!=null?f.schnittZ:1,G[id].zd); f.pflSt=epStufe(id);
        if(f.pflSt>vor) pflegeAuf(Z,id,f.pflSt);
        // Seit 14.4.3: Haben nur Erntehelfer (Stufe 1, ohne Zuwachs) geschnitten, sagt es der Winzerbote, nicht in den Lehrjahren (Platzhalter).
        if(gs&&f.schnittWer==='helfer'&&f.schnittZ===0&&S.schwer!=='einfach') Z.push(HELFER_NUR_BOTE.replace('{sorte}',SORTEN[id].name));
        else if(f.pflSt<vor) Z.push(gs?`✂️ Dein ${SORTEN[id].name} fällt durch die vielen neuen Reben auf ${PFLEGE_STUFEN[f.pflSt]} zurück.`:`✂️ Dein ${SORTEN[id].name} fällt auf ${PFLEGE_STUFEN[f.pflSt]} zurück, er wurde nicht rechtzeitig geschnitten.`); // Platzhalter, Wortlaut in Meilenstein 17
      }
      // Seit 14.7.4 nach dem Bodenschnitt des Weinbergs selbst.
      if(f.reben){const sp=verlustSpanne(BS[id]), tot=Math.min(f.reben,Math.round(f.reben*(festR(sp[1],sp[2],fest(7,si))+fp)/1000)*10); if(tot){f.reben-=tot; S.verlust[id]=tot; totAlle+=tot}}
    }
    if(totAlle) Z.push(`Zum Jahreswechsel sind ${String(Math.round(totAlle/rebVor*1000)/10).replace('.',',')}\u00a0% deiner Reben eingegangen (${weinberge().filter(id=>S.verlust[id]).map(id=>`${num(S.verlust[id])} ${SORTEN[id].name}`).join(', ')}). Der Boden deiner Weinberge lag im Jahresschnitt bei ${schnitt}\u00a0%${fp?', dazu kam der Frost'+(spLohn(2)?'. '+FROST_FEUER:''):''}. Bis März kannst du nachpflanzen.`);
    for(const id of weinberge()) Object.assign(S.felder[id],{bodenSum:0,bodenN:0,duengZ:[],duengN:0});
    S.winterFrost=0; S.spaetFrost=false;
  }
  S.wetter=S.wetterNext; S.temp=tempFuer(S.monat,S.wetter,fest(8,0)); neuePrognose();
  // Frost fürs Reben-Sterben mitzählen: Wintermonate und Spätfrost zur Blüte. Der Kälteeinbruch im November zählt nicht.
  if(S.wetter==='frost'){if(S.monat===11||S.monat<=1) S.winterFrost=(S.winterFrost||0)+1; else if(S.monat===3||S.monat===4) S.spaetFrost=true}
  // Rebenmarkt: in der Pflanzzeit jeden Monat neu gewürfelt, ohne Vorschau.
  S.rebenF=S.monat<=2?Math.round(rnd(1-REBEN_SCHWANK,1+REBEN_SCHWANK)*100)/100:1;
  // Seit 13.7.5: Weinpreise je Stufe (DIFF.markt), in der Meisterprüfung dazu der Landpreis (DIFF.land) und der Satz zum Markt.
  {const D=DIFF[S.schwer]||{}, M=D.markt||MARKT_SCHWANK; S.markt=clamp(S.markt+rnd(-M[0],M[0]),M[1],M[2]); if(D.land) S.landF=clamp((S.landF||1)+rnd(-D.land[0],D.land[0]),D.land[1],D.land[2]); marktSatz(); landSatz()}
  S.fassF=clamp((S.fassF||1)+rnd(-.08,.08),1-LAGER_SCHWANK,1+LAGER_SCHWANK); S.flaschF=clamp((S.flaschF||1)+rnd(-.08,.08),1-LAGER_SCHWANK,1+LAGER_SCHWANK);
  {const fr=R().sorten.filter(sorteFrei); S.rebenAng=S.monat<=2?fr[rint(0,fr.length-1)]:null}
  if(S.lage&&--S.lage.rest<=0){Z.push(S.lage.typ==='mode'?`Die Mode im Ausland ist vorbei, ${SORTEN[S.lage.sorte].name} kostet wieder so viel wie üblich.`:'Der Weinskandal ist vergessen, die Weinpreise erholen sich.'); S.lage=null}
  neuesLohnAngebot();
  const W=wachse(S.monat);
  schaedMonat();
  // Seit 8.0 (Paket B): Der Laubschneider macht im Juni den Sommerschnitt, wenn er im Einsatz ist. Gemeldet wird im Winzerboten vom Juli.
  if(S.monat===6){const lb=S.maschinen.find(x=>x.typ==='laub');
    if(lb){const an=bonusMasch('laub');
      // Seit 14.2.4 nur in Weinbergen, in die die Maschine darf (maschDarf), die anderen bekommen den Sommerschnitt von Hand.
      if(an){S.laubJahr=S.jahr; for(const id of weinberge()){const f=S.felder[id]; if(maschDarf(id)&&f.menge>0&&!f.gelesen&&f.laub!==S.jahr){f.laub=S.jahr; f.menge=Math.round(f.menge*(1+LAUB_MENGE))}} abnutz(an,LAUB_ABN); const a=laubAnsehen(); Z.push(`✂️ Dein Laubschneider hat im Juni den Sommerschnitt gemacht: Die Lese ${S.jahr} bekommt ${LAUB_QP} Punkte Qualität und ${Math.round(LAUB_MENGE*100)} % mehr Menge${a?`, dazu +${a} Ansehen`:''}. Zustand jetzt ${an.zustand} %.`)}
      // Seit 15.1.1: ohne Weinberg, in den er darf, steht er still (MASCH_FORM_TEXT.still).
      else Z.push(`✂️ Dein Laubschneider ${lb.zustand<MASCH_ROT?'ist ausgefallen':!maschPasst(lb)?MASCH_FORM_TEXT.still:'hatte keinen Fahrer'}, einen Sommerschnitt gab es dieses Jahr nicht.`)}}
  // Seit 8.0 nutzen sich Maschinen nur noch bei der Lese ab (maschAbnutzung), die feste Abnutzung je Herbstmonat ist weg.
  // Der Weingut-Manager stellt nach dem Monatswechsel die Helfer für die Handlese ein, sobald Edelfäulnis da ist.
  {const n=mgrHandlese(), t=`${n===1?'einen Erntehelfer':n+' Erntehelfer'} für die Handlese eingestellt`;
    if(n){Z.push(`${MGR_BEREICHE.weingut.sym} Dein ${MGR_BEREICHE.weingut.name} hat ${t}.`); const mw=S.manager.weingut; mw.zuletzt=t; mw.zm=S.jahr*12+S.monat; mgrLogbuch('weingut',t)}}
  // Wetter als Thema für die Zeitung. Die Einzelheiten je Rebsorte stehen unter "Aus dem Weinberg".
  if(eisEigen()) schlag(66,...eisT('eigen'),'eiswein',{du:1});
  if((S.monat===3||S.monat===4)&&S.wetter==='frost'&&rebenGesamt()) schlag(62,'Spätfrost im Frühjahr','Eine Frostnacht hat die jungen Triebe geschädigt. Die Ernte fällt dieses Jahr kleiner aus.','spaetfrost',{du:1});
  // Seit 13.6.1: Das Jahrhundertjahr kündigt der Winzerbote im Januar als größte Schlagzeile an (JH_TEXT, Wortlaut seit 13.8).
  if(S.monat===0&&jhArt()){const a=jhArt(), T=JH_TEXT[jhEcht()?a:a+'Vor']; schlag(99,T[0],T[1].replace('{wo}',WO[S.region]),JH_ART[a].bild,{gold:1,sonder:1,du:1})}
  if(S.monat===0) schlag(28,'Prädikatsweine anmelden','Die Weine vom letzten Jahrgang können jetzt im Rathaus als Prädikatswein angemeldet werden. Bis März ist außerdem Pflanzzeit.','kellerbuch',{archiv:1});
  if(S.monat<=2) schlag(20,'Rebenmarkt geöffnet',rebenMarktText()+'. Gepflanzt wird bis Ende März.','rebenmarkt',{archiv:1});
  if(S.monat===11){const t=steuerSchau(); if(t.steuer>0) schlag(35,'Steuer-Tipp zum Jahresende',`Bisher sind es rund ${eur(t.gew)} Gewinn in diesem Jahr. Darauf fallen im Januar rund ${eur(t.steuer)} Steuer an. Was du im Dezember noch kaufst, zum Beispiel Fassraum, Flaschen, Dünger oder eine Maschinenwartung, senkt den Gewinn.${spOffen()?` Eine Spende im Rathaus senkt ihn auch, um höchstens ${pz(SP_DECKEL)}.`:''} Kredit tilgen senkt ihn nicht.`,eisEigen()?'':'amt',{archiv:1})}
  // Seit 8.2: Artikel zu den Spenden, die im letzten Monat voll geworden sind.
  if(S.spBote&&S.spBote.length){for(const s of S.spBote) spBote(s); S.spBote=[]}
  if(S.stBote&&S.stBote.length){stBote(S.stBote); S.stBote=[]}
  if(S.monat===7) schlag(30,'Die Lese beginnt','Ab jetzt kannst du lesen. Wer länger hängen lässt, bekommt mehr Öchsle, riskiert aber Regen, Fäulnis und Frost.','lese',{archiv:1});
  // Seit 13.4.3: In der Mitte meldet der Winzerbote im September die Tendenz des Herbstes, sobald der Weg offen ist.
  if(S.monat===8&&R().weg==='beide'&&frei('weg_eigen')) schlag(45,'Der Herbst kündigt sich an',herbstTend().text.replace('{wo}',WO[S.region]),'lese',{du:feldHaengt().length?1:0});
  // Seit 13.4.4: Der Winzerbote sagt an, wenn der fremde Weg offen ist, und nur dann.
  if(S.monat===8&&wegeOffen().includes(wegFremd(R().weg))){const T=FREMD_TEXT[wegFremd(R().weg)]; schlag(46,T[0],T[1].replace('{wo}',WO[S.region]),'lese',{du:1})}
  // Schritt G 7.0: Der Kredit für die Erbschaftssteuer (erbRest) zählt nicht gegen den Kreditrahmen.
  // Seit 14.4.5 (Entscheidung 4): Stundung. Bei der dritten Mahnung in Folge gibt es ab der Generation STUNDUNG_AB_GEN einmal je Generation STUNDUNG_MONATE Monate ohne Mahnung
  // statt der Pfändung (S.stundBis, S.stundGen), die Zinsen laufen weiter, danach zählt die Bank von vorn.
  const stund=S.stundBis!=null&&monatNr()<=S.stundBis;
  if(!stund&&schulden()-erbRest()>rahmen()){
    S.mahnung++;
    if(S.mahnung>=3&&genNr()>=STUNDUNG_AB_GEN&&S.stundGen!==genNr()){S.mahnung=0; S.stundGen=genNr(); S.stundBis=monatNr()+STUNDUNG_MONATE; schlag(88,STUNDUNG_TEXT[0],STUNDUNG_TEXT[1].replace('{n}',STUNDUNG_MONATE),'bank',{du:1})}
    else if(S.mahnung>=3){S.pleite=true; S.pleiteP=S.rang?bestenEintrag():0; schlag(90,`Pfändung bei ${S.name}`,'Der Gerichtsvollzieher steht vor der Tür. Dein Weingut ist pleite.','pleite',{du:1})}
    else{ruhm(-6); schlag(58,`${S.mahnung}. Mahnung der Bank`,`Deine Schulden von ${eur(schulden()-erbRest())} liegen über dem Kreditrahmen von ${eur(rahmen())}. Das kostet 6 Ansehen. Beim dritten Mal kommt der Gerichtsvollzieher.`,'bank',{du:1})}
  }else{S.mahnung=0; if(S.geld<0) Z.push('Dein Konto ist im Minus. Die Bank nimmt dafür 1 % Zinsen im Monat.')}
  // Seit 10.1: Endet die Partie in diesem Januar (spielEnde in generationMonat), passiert danach nichts mehr.
  if(!S.pleite){generationMonat(Z); if(!S.ende){geschichteMonat(); etappe3Monat(Z); feierNach()}}
  // Die Zeitung zeigt den Bericht: kopf ist die Schlagzeile, art die Artikel, zeilen "Kurz gemeldet", wetter die Ereignisse im Weinberg, ehr die neuen Ehrungen.
  // k ist das, was zum Monatswechsel abgebucht wurde (steht bei der Bank).
  nachBote(Z); kompBote(Z); rufBote(Z); sektBote(Z); kaufBote();
  const ehr=(S.ehrungen||[]).slice(S.ehrZeig||0); S.ehrZeig=(S.ehrungen||[]).length;
  S.bericht=zeitung(Z,W,ehr,{basis:K.basis,loehne:K.loehne,rate:K.tilgung+K.zins,ueberz:uz,steuer});
  TAB='monat'; save(); render(); window.scrollTo(0,0);
  if(S.pleite) zeigePleite(); else if(nfOffen()) zeigeNachfolger(); else if(S.pruefer) zeigePruefer(); else if(erbeOffen()) zeigeErbe(); else if(S.erz) zeigeErz();
}
// ---- Spielende: Sonderausgabe und Bestenliste ----
// 7.8: Einzahl bei genau einem Jahr ("nach 1 Jahr" statt "nach 1 Jahren").
function jahreTxt(n){return n===1?'1 Jahr':n+' Jahren'}
function spielJahre(){return Math.max(1,Math.round(S.jahr-START_JAHR+S.monat/12))}
function platzDu(){return 1+S.gegner.filter(g=>g.rang>S.rang||g.rang===S.rang&&g.ansehen>S.ansehen).length}
function endStand(){return {jahre:spielJahre(),rang:S.rang,platz:platzDu(),verm:vermoegen(),ans:S.ansehen}}
function besten(){try{const L=JSON.parse(localStorage.getItem(BESTEN_KEY)||'[]');return Array.isArray(L)?L:[]}catch(e){return []}}
const bestenMon=e=>e.mon!=null?e.mon:(e.jahre||0)*12;
function bestenEintrag(){
  if(window.BOT) return 0;
  const alle=besten(), alt=alle.find(e=>e.d===S.bestenD), L=alle.filter(e=>e.d!==S.bestenD), d=S.bestenD||Date.now(); S.bestenD=d;
  // Seit 8.3 mit der Spielzeit bis zum Rang (zs, Sekunden), nur wenn die Partie von Anfang an gezählt wurde.
  // Seit 10.1: Beim Ende kommen die Amtszeiten (amt) und das Ende (ende: gut oder best) dazu. Die Zeit bis zum Präsidenten bleibt dabei stehen.
  // Seit 11.7 (A29): Eine Pleite bleibt mit ihrem Rang stehen und steht als "pleite" in der Liste, hinter laufenden Partien mit gleichem Rang.
  const fest=(S.ende||S.pleite)&&alt&&alt.rang===S.rang, zr=(S.zeitRang||[]).find(x=>x.r===S.rang);
  L.push({name:S.name,ich:S.ich||'',w:frau()?1:0,rang:S.rang,mon:fest?bestenMon(alt):(S.jahr-START_JAHR)*12+S.monat,region:S.region,schwer:S.schwer,gen:genNr(),d,
    ...(fest?(alt.zs!=null?{zs:alt.zs}:{}):S.zeit!=null&&!S.zeitAlt?{zs:S.ende&&zr?zr.s:Math.round(S.zeit)}:{}),...(S.ende?{ende:S.ende.art,amt:S.amt?S.amt.zeit:0}:S.pleite?{ende:'pleite'}:{}),
    // Seit 13.6.5: Jahr (sj) und Generation (sg) des Sieges, also der dritten Krone. Die Sortierung bleibt.
    ...(amtEhre()?{sj:S.amt.ehren.j,sg:S.amt.ehren.gen||genNr()}:{})});
  L.sort((a,b)=>b.rang-a.rang||(ENDE_WERT[b.ende]||0)-(ENDE_WERT[a.ende]||0)||bestenMon(a)-bestenMon(b)||(STUFE_WERT[b.schwer]||0)-(STUFE_WERT[a.schwer]||0)||a.d-b.d);
  const K=L.slice(0,10);
  try{localStorage.setItem(BESTEN_KEY,JSON.stringify(K))}catch(e){return 0}
  return K.findIndex(e=>e.d===d)+1;
}
// Zeit bis zum Rang, kurz: "2 J. 4 M.". Alte Einträge nur mit Jahren.
function bestenZeit(e){
  if(e.mon==null) return `${e.jahre||0} J.`;
  const j=Math.floor(e.mon/12), m=e.mon%12;
  return j&&m?`${j} J. ${m} M.`:j?`${j} J.`:`${m} M.`;
}
// Schritt G 7.0: Beim Sieg wird die Flasche vom ersten Jahrgang geöffnet. Wer es in der ersten Generation schafft, macht sie selbst auf.
function flascheSieg(){
  const f=S.gesch&&S.gesch.flasche; if(!f||S.flascheAuf) return ''; S.flascheAuf=S.jahr;
  return genNr()===1?' Am Abend holst du die Flasche vom ersten Jahrgang aus dem Keller und öffnest sie im Festsaal. Am Stammtisch hatten sie damals gelacht, heute trinken sie mit. „Einer von uns macht sie auf, hab ich gesagt“, sagst du. „Dass ich es selbst bin, hätte ich nicht gedacht.“'
    :` Am Abend wird im Festsaal die Flasche vom ersten Jahrgang geöffnet, ${S.jahr-f} Jahre nachdem sie ins Regal kam. Das Etikett kann keiner mehr lesen, aber den Satz darauf kennen alle: „Für den Tag, an dem einer von uns Präsident wird.“ Heute ist dieser Tag.`;
}
function siegSpieler(){
  S.sieger=S.name; const st=endStand(), fl=flascheSieg();
  // Seit 7.7 steht Frau Öchsle mit ihrem Käse im Sieg-Kapitel der Feier, die Bestenliste wird schon beim Aufstieg erneuert.
  schlag(100,`Du bist ${anr('Präsident','Präsidentin')}!`,`Nach ${jahreTxt(st.jahre)} ${WO[S.region]} wählt der Weinbauverband dich${S.ich?', '+S.ich+',':''} an seine Spitze. Der Stuhl im Festsaal gehört jetzt dir.${fl} ${AMT_AUSBLICK} Unten steht deine Zwischenbilanz.`,fl?GEN_BILD.sieg:'sieg',{gold:1,sonder:1,ende:1,stand:st,du:1});
}
function gegnerSieg(g,wo){
  S.sieger=g.name; const st=endStand();
  schlag(100,`${g.name} sitzt auf dem großen Stuhl`,`${g.name} ${wo} wird nach ${jahreTxt(st.jahre)} an die Spitze des Weinbauverbands gewählt und löst den alten Präsidenten ab. ${SIEG_SPRUCH[g.typ]||''} Der Stuhl im Festsaal hat ${gFrau(g)?'eine neue Besitzerin':'einen neuen Besitzer'}${S.gesch&&S.gesch.flasche&&!S.flascheAuf?', und deine Flasche vom ersten Jahrgang bleibt im Regal':''}. Entschieden ist damit nichts: Stühle werden auch wieder frei. Schaffst du alle Hürden, gehört er dir.`,'gegnerpraesident',{sonder:1,ende:1,stand:st,du:1});
}
// Alles, was Etappe 3 beim Monatswechsel tut: Aufstieg, Gegner, Wettbewerbe, Auktion, Märkte.
function etappe3Monat(Z){
  // Version 7.2: Eine Feier gilt nur für den Monat ihres Aufstiegs. Der Leserbrief eines Gegners kommt einen Monat danach.
  S.feier=null;
  if(S.aufBrief){aufBrief(S.aufBrief); S.aufBrief=0}
  // Version 7.7: In der Ausgabe nach der Feier steht je erreichtem Rang eine Nachlese aus dem Dorf.
  if(S.nachlese){for(const i of S.nachlese) dorf('n'+i); S.nachlese=null}
  const alt=S.rang; S.rang=rangFuer(S.rang,S.ansehen,flaecheBep(),vermoegen());
  if(S.rang>alt){
    const r=RAENGE[S.rang];
    // Seit 8.2: Eine angefangene Spende verfällt mit dem Aufstieg, das Gezahlte bleibt als Steuervorteil.
    if(S.sp&&S.sp.r<S.rang){if(S.sp.bez>0) Z.push(`🤝 Die angefangene Spende für ${SPENDEN[S.sp.r].z} verfällt mit dem Aufstieg. Die gezahlten ${eur(S.sp.bez)} senken trotzdem die Steuer.`); S.sp=null}
    S.nachlese=[]; for(let i=alt+1;i<=S.rang;i++) S.nachlese.push(i);
    // Version 8.1 (Paket B): Monat der Feier je Rang für die Neuheiten des Spielführers. Ist er aus, kommen die Neuheiten dieses Rangs nicht nach.
    if(S.fu&&S.fu.an){S.fu.rm=S.fu.rm||{}; for(let i=alt+1;i<=S.rang;i++) S.fu.rm[i]=monatNr()}
    else if(S.fu) fuRangWeg(S.fu);
    // Überholst du mehrere Gegner auf einmal, kommt nur ein Spruch, sonst wird es am Anfang zu viel.
    {const U=S.gegner.filter(g=>g.rang>=alt&&g.rang<S.rang&&GEGNER_SPRUCH[g.typ]); if(U.length){const g=U[rint(0,U.length-1)]; Z.push(GEGNER_SPRUCH[g.typ].du(g.name))}}
    // Der Aufstieg steht als Ehrung im Büro und als Thema in der Zeitung. Seit 7.2 bekommt jeder Rang eine eigene Ehrung (eine Urkunde an der Wand).
    for(let i=alt+1;i<=S.rang;i++){const ri=RAENGE[i]; ehre(i===R_MAX?'👑':'🎖️',`Aufstieg! Du bist jetzt ${rangN(i)}.`,1,`${rangSatz(i)}${rahmenSatz(i)}${ri.weg?' '+anr(ri.weg,ri.wegW):''}`,i)}
    // Version 7.2: Feier nach der Zeitung, goldene Rang-Karte für diesen Monat. Seit 7.7 feiert auch der Präsident (Sieg-Szene), der Leserbrief bleibt bis Vizepräsident.
    // Seit 11.5 (Teil C1): Die Manager des neuen Rangs kommen von selbst und stellen sich nach der Feier vor.
    if(MGR_GLEICH) mgrKommen();
    S.rangNeu=S.jahr*12+S.monat;
    zeitAufstieg(alt,S.rang); rangMonMerk(alt,S.rang);
    // Seit 13.3.7 (Nachtrag 3): Zum Jungwinzer schenkt der alte Winzer einen Hektar kahlen Hang, übergeben über den Makler. S.geschenkHa merkt ihn für die Lage (13.4.9).
    if(alt<1&&S.rang>=1&&!S.geschenk){S.geschenk=S.jahr; landDazu('einfach',GESCHENK_HA); S.geschenkHa=GESCHENK_HA; Z.push(GESCHENK_TEXT)}
    S.feier={von:alt,zu:S.rang,platz:bestenEintrag()}; if(S.rang<R_MAX) S.aufBrief=S.rang;
    schlag(95,`Aufstieg: Du bist jetzt ${rangN(S.rang)}`,`${rangSatz(S.rang)}${rahmenSatz(S.rang)}${r.weg?' '+anr(r.weg,r.wegW):''}`,wgBild(S.rang+1,'sommer'),{sonder:1,gold:1,du:1});   // Seit 12.4.3: Weingut-Bild der neuen Stufe statt 'aufstieg' (Maik 20.11.2026)
    // Seit 14.4.8: Auftakt des 2. und 3. Akts als eigene Schlagzeile im Monat des Aufstiegs, je Partie einmal (S.auftakt).
    for(let a=(RANG_AKT[alt]||1)+1;a<=(RANG_AKT[S.rang]||1);a++) if(AKT_AUFTAKT[a]&&!(S.auftakt=S.auftakt||{})[a]){S.auftakt[a]=S.jahr; schlag(94,AKT_AUFTAKT[a].t,AKT_AUFTAKT[a].text,'',{sonder:1,du:1})}
    if(S.rang===R_MAX&&!S.sieger) siegSpieler();
    else if(S.rang===R_MAX) schlag(99,`Du bist ${anr('Präsident','Präsidentin')}!`,`Der Weinbauverband wählt dich an seine Spitze. ${S.sieger} saß vor dir auf dem Stuhl im Festsaal und muss ihn jetzt räumen: Er gehört dir.${S.gesch&&S.gesch.flasche&&!S.flascheAuf?(S.flascheAuf=S.jahr,' Die Flasche vom ersten Jahrgang wird heute Abend doch noch geöffnet.'):''} ${AMT_AUSBLICK}`,S.flascheAuf===S.jahr?GEN_BILD.sieg:'sieg',{gold:1,du:1});
    // Seit 10.0: Das Amt beginnt in dem Monat, in dem der Spieler Präsident wird, auch wenn ein Gegner vorher schon Präsident war.
    if(S.rang===R_MAX&&!S.amt) amtStart();
  }
  tatenMonat(); freiBote(Z); leuteKommen(Z); mgrKommen(); kontrolleMonat(Z);
  if(S.monat===0&&S.rang>=R_BOTSCHAFT) Z.push(`Als Weinbotschafter ${WO[S.region]} warst du auf Messen in aller Welt unterwegs. +${ruhm(BOTSCHAFT_ANS)} Ansehen.`);
  Z.push(...gegnerMonat()); eisGeschichte();
  // Wettbewerbe: Ausschreibung im Februar (Land) und alle drei Jahre im Juni (Bund). Eingereicht wird im selben Monat, gewertet beim nächsten Monatswechsel.
  if(S.monat===1){
    neuerWettbewerb('land');
    // Schlagzeile nur, wenn du mitmachen darfst. Sonst reicht eine Kurzmeldung.
    if(S.rang>=R_LAND) schlag(60,`Landesprämierung ${S.jahr} ausgeschrieben`,`Gesucht sind die besten Prädikatsweine vom Jahrgang ${S.jahr-1} ${WO[S.region]}. Eingereicht wird diesen Monat, das Ergebnis steht im nächsten Winzerboten. Deinen Wein reichst du im Rathaus ein.`,'praemierung',{archiv:1});
    else Z.push(`Die Landesprämierung ${S.jahr} ist ausgeschrieben. Mitmachen darfst du ab dem Rang ${RAENGE[R_LAND].name}.`);
  }
  if(S.monat===5&&S.jahr%3===0){
    neuerWettbewerb('bund');
    schlag(60,`Bundeswettbewerb ${S.jahr} ausgeschrieben`,`Nur alle drei Jahre treten die besten Winzer des Landes gegeneinander an, mit verkaufsreifen Prädikatsweinen und Sekten aus der Flasche. Eingereicht wird diesen Monat, das Ergebnis steht im nächsten Winzerboten.${S.rang>=R_BUND?' Deinen Wein reichst du im Rathaus ein.':` Mitmachen darfst du ab dem Rang ${RAENGE[R_BUND].name}.`}`,'praemierung',{archiv:1});
  }
  // Seit 13.6.3: Nach dem Brief ist jedes Jahr Weltweinschau im eigenen Dorf, bis zur dritten Krone. Angemeldet wird im Januar, die Schau ist im Juni.
  if(S.monat===WELT_ANM&&weltOffen()){schauNeu(); if(S.schau){const K=KRONEN[S.schau.kl], fav=S.schau.feld.find(x=>x.fav);
    schlag(74,`Weltweinschau ${S.jahr}: Es geht um die ${K.name}`,`${kroneText(K)} Angemeldet wird diesen Monat im Rathaus, zusammen mit den Prädikatsweinen, die Schau ist im ${MON[WELT_MONAT]} auf dem Dorfplatz. Als Favorit gilt ${fav.name}.`,'weltweinschau',{du:1})}}
  if(S.monat===WELT_FORM_MON&&weltForm()){const w=weltForm(), fav=S.schau.feld.find(x=>x.fav); schlag(48,`Weltweinschau: ${fav.name} ${WELT_FORM[w][0]}`,WELT_FORM[w][1].replace('{fav}',fav.name.split(',')[0]),'weltweinschau',{du:1})}
  if(S.monat===WELT_MONAT&&S.schau){
    // Seit 10.2: Die erste Schau kommt auf die Bild-Bühne (A.schauB), danach steht sie nur im Winzerboten. Alte Stände mit schon gelaufener Schau bekommen keine Bühne mehr.
    const A=S.amt, K=KRONEN[S.schau.kl], erst=!A.schauB&&!(A.welt&&A.welt.length); A.schauB=1; if(erst) feierWelt('schau');
    schlag(74,`Weltweinschau ${S.jahr}: Die Welt ist zu Gast`,`${erst?`Am Holzbogen hängen Fahnen, ${spLohn(7)?'auf der Bank an der Spitzenlage sitzen Gäste aus zwanzig Ländern':'in den Gassen hört man zwanzig Sprachen'}, und beim Dorffest reicht der Wein zum ersten Mal nicht.`:'Am Holzbogen hängen wieder die Fahnen, und diesmal hat das Dorf genug Wein fürs Fest bestellt.'} Neun Weingüter aus aller Welt stellen sich der Jury, es geht um die ${K.name}. ${S.schau.ein?`Für ${S.name} tritt ${S.schau.ein.name} an.`:`${S.name} hat im Januar keinen Wein angemeldet.`} Das Ergebnis steht im nächsten Winzerboten.`,'weltweinschau');
  }
  // Auktion über drei Monate: angekündigt, dann wird geboten, danach steht das Ergebnis unten in der Zeitung.
  // Alte Spielstände ohne phase hatten ihren Bietmonat schon und bekommen jetzt das Ergebnis.
  const a=S.auktion, wo=WO[S.region], ab=S.rang>=R_AUKTION, nichtDu=` Mitbieten darfst du ab dem Rang ${RAENGE[R_AUKTION].name}.`;
  if(a&&a.phase!==0){FUSS.push('🔨 '+aukErgebnis()); S.auktion=null}
  else if(a){a.phase=1; schlag(56,a.spitze?`Heute wird geboten: die Spitzenlage ${wo}`:`Heute wird geboten: ${losText(a)} ${wo}`,`Im Saal sitzen ${a.bieter.length} Bieter, das Startgebot liegt bei ${eur(a.start)}.${!ab?nichtDu:aukDeckel(a)?' '+AUK_ZU_GROSS+' Warum, steht im Rathaus.':' Mitbieten kannst du diesen Monat im Rathaus.'}`,a.spitze?'spitzenlage':'auktion',{archiv:a.spitze?0:1})}
  // Seit 13.4.9 (Nachtrag 3): Die Spitzenlage kommt genau einmal unter den Hammer, im ersten Auktionsmonat, sobald frei('spitzenlage') gilt (Weinbaurat plus 10 Jahre).
  // Sie ist steiler Südhang und zählt zu SUED_MAX. Das Zufallsangebot ab dem Vizepräsidenten ist weg. Nur Nachbarn bieten mit.
  if(!S.auktion&&!S.spitze&&!S.spitzeAuk&&frei('spitzenlage')&&AUK_MONATE.includes(S.monat)){
    neueAuktion(1); S.spitzeAuk=S.jahr; S.spitzeVers=S.jahr;
    schlag(57,`Die Spitzenlage ${wo} kommt unter den Hammer`,`Vor dem Rathaus steht das halbe Dorf und liest denselben Zettel: ${SPITZE_HA}\u00a0Hektar steiler Südhang in voller Sonne, die beste Lage weit und breit, nur dieses eine Mal. Versteigert wird nächsten Monat, das Startgebot liegt bei ${eur(SPITZE_START)}. Wer sie bekommt, erntet jedes Jahr süßere Trauben.`,'spitzenlage');
  }
  // Seit 13.4.1: aukF des Gebiets (Rheingau) auf die Chance einer Auktion.
  // Seit 13.3.7: vor dem Winzer selten und klein (aukChance), ab dem Jungwinzer kommt das erste Angebot spätestens nach AUK_ERST_JAHRE Jahren (aukErstFaellig).
  // Nachtrag zu 14.5: Die erste sichere Auktion einer Lage (aukSicherNeu) kommt ohne Chance und ohne Erst-Sperre.
  if(!S.auktion&&AUK_MONATE.includes(S.monat)&&(aukSicherNeu()||(S.jahr-START_JAHR)*12+S.monat>=6&&!aukErstSperre()&&(aukErstFaellig()||Math.random()<aukChance()))){
    neueAuktion(0,frei('auktion_oft')?0:AUK_FRUEH_HA); if(S.rang>=R_AUKTION&&!S.aukErst) S.aukErst=S.jahr*12+S.monat;
    schlag(55,`Weinberg ${wo} zu versteigern`,`Nächsten Monat kommen ${losText(S.auktion)} unter den Hammer, das Startgebot liegt bei ${eur(S.auktion.start)}. ${losLage(S.auktion).satz}${!ab?nichtDu:aukDeckel()?' '+AUK_ZU_GROSS:' Halte Geld oder Kreditrahmen bereit.'}`,'auktion',{archiv:1});
  }
  ladenMonat(Z);
  neueLaeden(); S.absatz=0;
  S.exLage.ex=clamp(S.exLage.ex+rnd(-.05,.05),.9,1.12);
  // Seit 10.0: Stimmung, Umfrage und die Wahl selbst, nach allem, was in diesem Monat Ansehen gebracht oder gekostet hat.
  amtMonat();
  ereignisMonat();
}
/* ---- Weinkontrolle: unangekündigt, im Schnitt alle drei Jahre, spätestens nach vier. Nach einem Fund fünf Jahre lang jedes Jahr ---- */
// Seit 14.4.6 (Entscheidungen 54 und 56): Kontrollen erst ab dem Akt KONTR_AB_AKT (mit der Hintertür beim Weingutsbesitzer), Abstand je Spielstufe (KONTR_ABSTAND).
// Die erste Kontrolle kommt nach dem üblichen Abstand ab dem Monat des Aufstiegs (S.kontr.ab merkt, dass die Uhr läuft).
const kontrAktiv=()=>(RANG_AKT[S.rang]||1)>=KONTR_AB_AKT, kontrAbstand=()=>KONTR_ABSTAND[S.schwer]||[24,48];
function kontrNeu(){const k=S.kontr; if(k.scharf>0){k.scharf--; k.in=12}else{const A=kontrAbstand(); k.in=rint(A[0],A[1])}}
function panschListe(){return S.lots.filter(l=>l.pansch&&l.status!=='trauben')}
function strafeHoehe(){return Math.max(STRAFE_MIN,Math.round(2*panschListe().reduce((a,l)=>a+lotWert(l),0)/100)*100)}
// Seit 14.4.6 (Entscheidung 57): Ansehen bei einem Fund je Akt (STRAFE_ANS_AKT), die Zuschläge je weiterem Wein und nach abgelehnter Bestechung nur im 3. Akt.
function strafeAns(extra){const akt=RANG_AKT[S.rang]||1; return akt>=3?(STRAFE_ANS_AKT[3]||0)+STRAFE_ANS_WEITER*(panschListe().length-1)+(extra||0):STRAFE_ANS_AKT[akt]||0}
// Seit 14.4.6: In den Lehrjahren (VERWARNUNG) ist der erste Fund je Partie eine Verwarnung, der Wein ist weg, ohne Geldstrafe, Ansehen und scharfe Jahre (S.verwarnt).
const verwarnOffen=()=>!!VERWARNUNG[S.schwer]&&!S.verwarnt;
// Warnung des alten Winzers in Zahlen (Lehrjahre, KONTR_ZEIGE). Platzhalter, Wortlaut in Meilenstein 17.
const kontrWarn=()=>KONTR_TEXT.warn.replace('{min}',eur(STRAFE_MIN)).replace('{ans}',strafeAns()?`, dazu ${num(strafeAns())} Ansehen`:'');
function kontrolleMonat(Z){
  const k=S.kontr; if(!kontrAktiv()) return; if(!k.ab){k.ab=1; kontrNeu(); return}
  if(--k.in>0) return;
  if(!panschListe().length){kontrNeu(); schlag(45,'Weinkontrolle ohne Befund',`Der Prüfer blättert durch dein Kellerbuch und findet nichts zu beanstanden. +${ruhm(4)} Ansehen.`,'kontrolle',{archiv:1}); return}
  // Gepanschter Wein im Keller: Der Spieler entscheidet im Dialog, ob er besticht. Bis dahin ist alles andere gesperrt.
  S.pruefer=1; schlag(85,'Weinkontrolle im Keller','Der Prüfer steht unangemeldet im Keller und will dein Kellerbuch sehen.','kontrolle',{archiv:1,du:1});
}
const bestechChance=n=>.5+.35*(n-BESTECH_MIN)/(BESTECH_MAX-BESTECH_MIN);
// Der Prüfer findet den gepanschten Wein. extra ist der zusätzliche Abzug nach einer abgelehnten Bestechung.
// Seit 14.4.6: Ansehen je Akt (strafeAns), Verwarnung in den Lehrjahren. Platzhalter, Wortlaut in Meilenstein 17.
function pruefEnde(extra){
  const F=panschListe(), weg=F.length===1?'Der gepanschte Wein wird vernichtet':'Die gepanschten Weine werden vernichtet';
  if(verwarnOffen()){S.lots=S.lots.filter(l=>!F.includes(l)); S.verwarnt=1; S.pruefer=0; kontrNeu(); return KONTR_TEXT.verwarnung.replace('{wein}',weg)}
  const st=strafeHoehe(), ab=strafeAns(extra);
  S.lots=S.lots.filter(l=>!F.includes(l)); zahle(st); if(ab) ruhm(-ab); S.kontr={in:12,scharf:5,ab:1}; S.pruefer=0;
  return `${weg}. Strafe: ${eur(st)}${ab?`, ${ab} Ansehen weg`:''}. Fünf Jahre lang kommt der Prüfer jetzt jedes Jahr.`;
}
// Seit 14.4.6 (Entscheidung 58): Chance auf einen Fund bei "Kontrolle anregen" für die Anzeige je Spielstufe (ANREG_ZEIGE).
const anregChance=g=>g.geruecht?ANREG_CHANCE_GERUECHT:PANSCH[g.typ]||0, anregLohnt=g=>anregChance(g)>=ANREG_FEHL/(ANREG_ANS+ANREG_FEHL);
function anregZeichen(g){const z=ANREG_ZEIGE[S.schwer], c=anregChance(g);
  if(z==='chance') return KONTR_TEXT.chance.replace('{p}',Math.round(c*100))+'. '+(anregLohnt(g)?KONTR_TEXT.ratJa:KONTR_TEXT.ratNein);
  if(z==='wort') return `Chance ${CHANCE_WORT.find(x=>c>=x[0])[1]}.`; return ''}
/* ---- Panschen: Most zuckern oder wässern, Fässer verschneiden ---- */
const mani=l=>(l.zucker||0)+(l.wasser||0)>0;
// Seit 14.4.6: Im 1. Akt ist die Hintertür zu (FREI.hintertuer), auch das erlaubte Strecken beim Tafelwein geht dann nicht.
const maniLegal=(l,st)=>st==='tafel'&&(l.zucker||0)<=ZUCKER_ERLAUBT&&(l.wasser||0)<=ZUCKER_ERLAUBT;
const hinterOffen=()=>frei('hintertuer');
// Seit 13.7.8 (Entscheidung 12, Maik 22.11.2026): Zucker hebt das Öchsle höchstens bis zum Deckel des Weinbergs, aus dem die Trauben kommen (deckel der Sorte, wie er gerade steht).
// ZUCKER_MAX bleibt die zweite Grenze. zuckerOe rechnet das Öchsle nach n Prozent Zucker, zuckerBis gibt die meisten Prozent, die noch gehen (0 heißt gesperrt).
const zuckerOe=(l,n)=>Math.min(OE_MAX,Math.round(l.oe*(1+n/100)));
// Seit dem Nachtrag zu 14.7.1: Beim ersten Zuckern merkt sich der Posten die Öchsle davor (l.oeT, gezählt über oeTraube beim Öchsle-Zuschlag).
function zuckerDazu(l,n){if(l.oeT==null) l.oeT=l.oe; l.oe=zuckerOe(l,n); l.zucker=(l.zucker||0)+n}
function zuckerBis(l){const D=deckel(l.sorte); let n=0; while(n<ZUCKER_MAX-(l.zucker||0)&&zuckerOe(l,n+1)<=D) n++; return n}
const maniText=l=>[l.zucker?`gezuckert (+${l.zucker}\u00a0%)`:'',l.wasser?`gewässert (+${l.wasser}\u00a0%)`:''].filter(Boolean).join(' und ');
// Seit 14.5.2 (Entscheidungen 18, 21, 35 und 45, Annahmen 1 bis 5): Qualität je Weinberg von 0 bis 100 aus vier Bausteinen, für alle Weinberge einzeln.
// Pflege: ab dem Rebstock QUAL_PFLEGE_AB plus QUAL_PFLEGE_EP der Entwicklungspunkte (die Jungrebe nur das Drittel), höchstens QUAL_PFLEGE_MAX.
// Boden: gleitend zwischen QUAL_BODEN an den Schwellen BODEN_SCHWELLE nach den Bodenpunkten des Weinbergs (wbBodenP), darüber der letzte Wert.
// Form: FORMEN.qual. Sonstiges: Laubschnitt LAUB_QP und seit dem Nachtrag zu 14.5.2 Ausdünnen AUSD_QP (f.ausd), beide nur im laufenden Jahr.
// Gerundet wird einmal am Ende, höchstens 100 am Einzelpfahl, 95 am Kordon und 90 am Flachbogen (Annahme 5, bis zum Nachtrag 97 mit 3 Punkten Reserve).
// Weinstufe, Öchsle, Sonne, Jahrhundertjahr und Sorte zählen nicht mehr (bis 14.4: qpGrund und qpFuer, gerechnet bei der Anmeldung).
function qualBoden(p){const W=BODEN_SCHWELLE, Q=QUAL_BODEN; for(let i=1;i<W.length;i++) if(p<W[i]) return Q[i-1]+(Q[i]-Q[i-1])*(Math.max(0,p)-W[i-1])/(W[i]-W[i-1]); return Q[Q.length-1]}
// v setzt einzelne Werte vorweg (ep, pflSt, form, laub, ausd), zum Beispiel für die Abfrage beim Umstellen der Form und die Nachfrage im Sommer.
function qualTeile(id,v){const f=Object.assign({},S.felder[id]||{},v||{}), pflege=Math.min(QUAL_PFLEGE_MAX,((f.pflSt||0)>=1?QUAL_PFLEGE_AB:0)+(f.ep||0)*QUAL_PFLEGE_EP),
  boden=qualBoden(wbBodenP(id)), form=(FORMEN[f.form||formVon(id)]||{}).qual||0, laub=f.laub===S.jahr?LAUB_QP:0, ausd=f.ausd===S.jahr?AUSD_QP:0;
  return {pflege,boden,form,laub,ausd,q:Math.round(pflege+boden+form+laub+ausd)}}
const qualWb=id=>qualTeile(id).q;
// Schmiergeld für den Beamten: ein Anteil vom Wert des Weins, mindestens SCHMIER_MIN.
const schmierVon=w=>Math.max(SCHMIER_MIN,Math.round(w*SCHMIER_ANTEIL/100)*100);
function schmier(l,st){return schmierVon(l.liter*STUFEN[st].preis*qualPreisF(l.qp))} // seit 14.5.2 mit der Qualität des Weins (l.qp), seit 14.5.4 mit dem Qualitätsfaktor
const mischbar=l=>l.status==='fass'&&l.stufe&&l.stufe!=='feder';
const farbe=l=>SORTEN[l.sorte].farbe;
// Verschnitt zweier Fassweine: Der Wein mit der höheren Stufe gibt den Namen, Öchsle und Qualität werden nach Menge gemittelt.
function mischung(a,b){
  if(STUFEN[b.stufe].rang>STUFEN[a.stufe].rang) [a,b]=[b,a];
  const L=a.liter+b.liter, o={a,b,liter:L,oe:Math.round((a.oe*a.liter+b.oe*b.liter)/L),qp:Math.round((a.qp*a.liter+b.qp*b.liter)/L)};
  // Seit dem Nachtrag zu 14.7.1: Ist einer der beiden gezuckert, trägt der Verschnitt die Öchsle der Trauben vor dem Zuckern mit (oeTraube im Schnitt).
  if(a.oeT!=null||b.oeT!=null) o.oeT=Math.round((oeTraube(a)*a.liter+oeTraube(b)*b.liter)/L);
  o.schmier=schmierVon(L*STUFEN[a.stufe].preis*qualPreisF(o.qp)); return o;
}
/* ---- Version 10.0: Amtszeit und Wahl (Spielende, Paket 1) ---- */
// S.amt gibt es ab dem Monat, in dem der Spieler Präsident wird: seit (Monat des Amtsantritts als monatNr), stimm (Stimmung im Verband, Kommazahl 0 bis 100),
// marke (so viel braucht es am Wahltag), wahl (Monat der nächsten Wahl), im (1 im Amt, 0 abgewählt), zeit (laufende Amtszeit), siege (gewonnene Wahlen),
// vert (davon im Amt verteidigt), kauf (gekaufte Stimmen dieser Wahl), geg (Herausforderer ab der Umfrage, id des Gegners, sonst null),
// stuhl (id des Gegners, der nach einer Abwahl auf dem Stuhl sitzt),
// wahlen (alle Wahlen: j, m, s Stimmung, marke, ok, im, geg Name). Paket 2 braucht vert und wahlen für den Schlüssel "Verband", die Chronik und die Bestenliste.
// Seit 13.6.9: Die erste Wahl kommt WAHL_ERSTE Monate nach dem Amtsantritt.
// Seit 13.7.5: Der Herausforderer startet auf Stufen mit DIFF.marke höher, das gilt auch als Untergrenze nach der Abwahl.
const markeStart=()=>MARKE_START+((DIFF[S.schwer]||{}).marke||0);
function amtStart(){S.amt={seit:monatNr(),stimm:STIMM_START+spStimm(),marke:markeStart(),wahl:monatNr()+WAHL_ERSTE,im:1,zeit:1,siege:0,vert:0,kauf:0,geg:null,stuhl:null,wahlen:[]}}
// Alte Spielstände: Wer in 9.0.1 schon Präsident ist, bekommt das Amt beim Laden, die Meldung dazu steht im nächsten Winzerboten.
function altAmt(){if(S.rang===R_MAX&&!S.amt){amtStart(); S.amt.alt=1}}
function stimmung(d){const A=S.amt; A.stimm=clamp(A.stimm+d,0,100)}
const amtAlt=()=>!!(S&&S.amt&&!S.amt.im), stimmZ=()=>Math.round(S.amt.stimm);
// Wie der Spieler gerade heißt: sein Rang, nach einer Abwahl Altpräsident oder Altpräsidentin.
// Seit 10.1: Nach dem Sieg bei der Weltweinschau heißt er überall Ehrenpräsident, auch nach einer späteren Abwahl.
const amtEhre=()=>!!(S&&S.amt&&S.amt.ehren);
const altP=()=>anr('Altpräsident','Altpräsidentin'), duN=()=>amtEhre()?ehrP():amtAlt()?altP():rangN(S.rang), duK=()=>amtEhre()?ehrP():amtAlt()?altP():rangK(S.rang);
const monJahr=nr=>`${MON[nr%12]} ${START_JAHR+Math.floor(nr/12)}`;
// Wahlkampf: von der Umfrage bis zur Wahl. Nur dann gibt es den Stimmenkauf.
function amtKampf(){const A=S.amt; return !!(A&&A.geg!=null&&monatNr()<A.wahl)}
const gFrau=g=>!!g&&g.typ==='vorsicht';
function amtGegner(){const A=S.amt; return A&&A.geg!=null?S.gegner.find(g=>g.id===A.geg)||null:null}
// Der Herausforderer ist der Gegner mit dem höchsten Rang, bei Gleichstand der mit mehr Ansehen. Wer abgewählt ist, tritt gegen den an, der auf dem Stuhl sitzt.
function amtRivale(){const A=S.amt, st=!A.im&&S.gegner.find(g=>g.id===A.stuhl); return st||S.gegner.slice().sort((a,b)=>b.rang-a.rang||b.ansehen-a.ansehen)[0]||null}
// Schlagzeile zum Amt. Sie betrifft immer den Spieler selbst und hält deshalb das Weiterblättern an.
function amtSchlag(p,k,par,bild,o){const x=amtTxt(k,par); schlag(p,x.t,x.text,bild,{du:1,amt:{k,par},...(o||{})})}
const gPar=g=>({g:g?g.name:'Ein Herausforderer',wo:g?WO[g.region]:'',gw:gFrau(g)?1:0});
// Einmal im Monat, nach allem, was Ansehen bringt oder kostet. Im Monat des Amtsantritts passiert noch nichts.
function amtMonat(){
  const A=S.amt, nr=monatNr(); if(!A||A.seit===nr) return;
  if(A.alt){delete A.alt; amtSchlag(58,'altstand',{s:stimmZ(),wann:monJahr(A.wahl)},'wahl')}
  stimmung(-STIMM_MONAT);
  if(A.skandal){A.skandal=0; amtSchlag(86,'skandal',{},'wahl')}
  if(nr>=A.wahl) amtWahl();
  else if(A.geg==null&&nr>=A.wahl-WAHL_UMFRAGE&&!wahlAus()) amtUmfrage();
  amtBrief();
}
// Seit 10.1: die zwei Schlüssel zur Weltweinschau. Dorf: alle acht Spenden, als Spende oder über die Stiftung. Verband: mindestens eine gewonnene Wahl,
// im Amt verteidigt oder als Rückkehr. Er bleibt, auch wenn man später abgewählt wird. Sind beide da, kommt im selben Monat der Brief (A.brief = Monat).
const keyDorf=()=>!stFehlt(), keyVerband=()=>!!(S.amt&&S.amt.siege>=1);
const weltOffen=()=>!!(S.amt&&S.amt.brief&&!S.amt.ehren);
// Seit 10.3 (A19): Liegt die nächste Wahl oder der nächste August nicht mehr vor der letzten Übergabe, versprechen die Texte kein nächstes Mal.
const wahlAus=()=>!!(S.amt&&S.amt.wahl>=endeMonat());
const weltAus=()=>!!(S.amt&&(S.jahr-START_JAHR+(S.monat<=WELT_ANM?0:1))*12+WELT_ANM>=endeMonat());
function amtBrief(){
  const A=S.amt; if(A.brief||!keyDorf()||!keyVerband()) return;
  A.brief=monatNr(); feierWelt('brief');
  // Seit 10.2 steht das Gespräch mit dem Bürgermeister auf der Bild-Bühne, die Zeitung bringt nur die Nachricht.
  schlag(94,'Ein Brief für das ganze Dorf',`Die Weltweinschau sucht einen Gastgeber, und der Bürgermeister hat ihr nur ein Dorf genannt: unseres. Ab jetzt kommen jeden ${MON[WELT_MONAT]} die besten Weingüter der Welt auf den Dorfplatz. Es geht um ${KRONEN.length} Kronen, eine nach der anderen: ${KRONEN.map(K=>K.name).join(', ').replace(/, ([^,]*)$/,' und $1')}. Angemeldet wird im ${MON[WELT_ANM]} im Rathaus. Wer alle ${KRONEN.length} holt, wird ${ehrP()}.`,'einladung',{gold:1,du:1});
}
// Die Umfrage legt den Herausforderer fest. Seit 13.5.9 sabotiert er nicht mehr vor der Wahl.
function amtUmfrage(){
  const A=S.amt, g=amtRivale(); A.geg=g?g.id:-1; A.kauf=0;
  amtSchlag(88,'umfrage',{im:A.im,s:stimmZ(),marke:A.marke,wann:monJahr(A.wahl),...gPar(g)},'wahl');
}
// Die Wahl: Liegt die gerundete Stimmung auf oder über der Marke, gewinnt der Spieler. Kein Würfel.
function amtWahl(){
  const A=S.amt, g=amtGegner()||amtRivale(), s=stimmZ(), marke=A.marke, ok=s>=marke, war=A.im;
  A.wahlen.push({j:S.jahr,m:S.monat,s,marke,ok:ok?1:0,im:war?1:0,geg:g?g.name:''});
  A.wahl=monatNr()+WAHL_JAHRE*12; A.kauf=0; A.geg=null;
  const par={s,marke,wann:monJahr(A.wahl),letzte:wahlAus()?endeJahr():0,...gPar(g)};
  if(ok){
    A.siege++; if(war) A.vert++; A.zeit++; A.marke=Math.min(MARKE_MAX,marke+MARKE_PLUS); A.stimm=STIMM_START+spStimm(); A.im=1; A.stuhl=null;
    ehre('🗳️',war?`Wiedergewählt, ${A.zeit}. Amtszeit`:`Zurück im Amt, ${A.zeit}. Amtszeit`,0,`Stimmung ${s}, gebraucht ${marke}.`);
    amtSchlag(96,war?'gewonnen':'zurueck',{...par,zeit:A.zeit,neu:A.marke},'wahl',{gold:1});
  }else{
    // Seit 10.1 (Maik 18.11.2026): Nach der Abwahl sinkt die Marke um MARKE_ABWAHL, nie unter MARKE_START. Verliert der Altpräsident noch einmal, bleibt sie.
    A.stimm=STIMM_ALT+spStimm(); if(war){A.im=0; A.stuhl=g?g.id:null; A.marke=Math.max(markeStart(),marke-MARKE_ABWAHL)}
    amtSchlag(96,war?'verloren':'wieder',{...par,neu:A.marke},'gegnerpraesident');
  }
}
function kontoKnapp(){const k=kosten(); return 2*(k.basis+k.loehne+k.tilgung+k.zins)}
function aufgaben(){
  const A=[], m=S.monat, frei=S.ha*HA_REBEN-rebenGesamt();
  // Seit 7.9 drei Arten: rot:1 kann nicht warten und hält das Weiterblättern an. Ohne Merkmal ist es Gelb (Punkt am Reiter, kein Halt).
  // ruhig:1 ist nur ein Hinweis ohne Punkt. halt:1 hält an, obwohl es Gelb ist (nur die Lese).
  // Seit 7.9.1: Die rote Zeile nennt den Abstand zum Kreditrahmen. Wer beim Monatswechsel darüber liegt, bekommt eine Mahnung, nach der dritten wird gepfändet.
  const luft=rahmen()-(schulden()-erbRest());
  if(S.mahnung) A.push({t:`${S.mahnung}. Mahnung: `+(luft<0?`Schulden ${eur(-luft)} über dem Kreditrahmen`:`wieder im Kreditrahmen, noch ${eur(luft)} Luft`)+(S.mahnung>=2&&luft<0?'. Bei der dritten wird gepfändet':''),rot:1,tab:'stadt',sub:'bank'});
  else if(S.geld<0) A.push({t:`Konto im Minus (${eur(S.geld)}): `+(luft<0?`Schulden ${eur(-luft)} über dem Kreditrahmen, beim Monatswechsel kommt die Mahnung`:`noch ${eur(luft)} bis zur Mahnung, ab zur Bank`),rot:1,tab:'stadt',sub:'bank'});
  else if(S.geld<kontoKnapp()) A.push({t:`Konto gefährlich niedrig: ${eur(S.geld)} reichen keine zwei Monate`,tab:'stadt',sub:'bank'});
  // Seit 10.0: im Wahlkampf Gelb am Rathaus, solange die Stimmung unter der Marke liegt. Reicht sie, bleibt ein Hinweis ohne Punkt.
  if(amtKampf()){const s=stimmZ(), mk=S.amt.marke; A.push({t:`🗳️ Wahl im ${monJahr(S.amt.wahl)}: Stimmung ${s}, du brauchst ${mk}`+(s>=mk?'. Im Moment reicht das':''),tab:'stadt',sub:'amt',...(s>=mk?{ruhig:1}:{})})}
  if(aukInfo()) A.push({t:aukInfo(),tab:'stadt',sub:'amt',ruhig:1});
  // Auktionstag: Rot nur, wenn Konto plus freier Kreditrahmen fürs nächste Gebot reichen. Sonst bleibt es ein Hinweis.
  if(S.auktion&&S.auktion.phase!==0&&!S.auktion.ende&&S.rang>=R_AUKTION){const zuG=aukDeckel(), kann=!zuG&&aukNaechstes()<=aukLimit(); A.push({t:`🔨 Auktion diesen Monat: ${losText(S.auktion)}, Gebot steht bei ${eur(S.auktion.gebot)}`+(zuG?'. '+AUK_ZU_GROSS.slice(0,-1):kann?'':'. Zum Mitbieten reicht dein Geld nicht'),tab:'stadt',sub:'amt',...(kann?{rot:1}:{ruhig:1})})}
  // Wettbewerb: Rot nur mit einem zugelassenen Wein. Reicht der Manager ein, steht hier nichts. Seit 10.3 bleibt die Zeile bei der Weltweinschau immer stehen.
  if(S.wett&&!S.wett.fertig&&!S.wett.ein&&S.rang>=wettRang()&&(S.wett.typ==='welt'||!aufgabeAktiv('wett'))){const pass=S.lots.some(wettFaehig); A.push({t:`🏅 ${WETTNAME[S.wett.typ]}: `+(pass?'diesen Monat einen Wein einreichen':'diesen Monat, du hast aber keinen zugelassenen Wein'),tab:'stadt',sub:'amt',...(pass?{rot:1}:{ruhig:1})})}
  // Seit 13.6.4: Nach der dritten Krone steht die letzte Übergabe an.
  if(amtEhre()&&!S.ende) A.push({t:`👪 Im Januar ${endeJahr()} übergibst du ${S.name} am Küchentisch, danach kommt die Chronik`,tab:'stadt',sub:'amt',ruhig:1});
  // Seit 13.6.3: Anmeldung zur Weltweinschau im Januar, rot nur mit einem zugelassenen Wein.
  if(schauAnm()&&!S.schau.ein){const K=KRONEN[S.schau.kl], pass=S.lots.some(l=>schauFaehig(l)); A.push({t:`${K.sym} Weltweinschau, ${K.name}: `+(pass?'diesen Monat einen Wein anmelden':'diesen Monat, '+(kroneFehltText(S.schau.kl,'kurz')||'du hast aber keinen zugelassenen Wein')),tab:'stadt',sub:'amt',...(pass?{rot:1}:{ruhig:1})})}
  if(fehlText()) A.push({t:`${fehlText()}, vorher geht es nicht in den nächsten Monat`,rot:1,tab:'stadt',sub:'arbeit'});
  if(m>=5&&m<=10&&leseFaktor()<.75&&weinberge().some(id=>S.felder[id].menge>0&&!S.felder[id].gelesen)) A.push({t:`Ernteleistung reicht nur für ${Math.floor(leseFaktor()*100)}\u00a0% der Reben`,rot:1,tab:'stadt',sub:'arbeit'});
  // Seit 8.0: Maschinen unter MASCH_ROT fallen aus (Rot), unter MASCH_GELB lohnt das Warten (Gelb). Wartet der Weingut-Manager nach der Lese, ist Gelb nur ein Hinweis.
  // Dazu Gelb für Maschinen ohne Fahrer und für Felder, denen Helfer für die Handlese fehlen.
  {const mw=kellerWartet();
  // Seit Paket B: Bei den Bonus-Maschinen ist Rot nur ein gelber Hinweis, es fällt nur der Bonus weg.
  for(const ma of S.maschinen) if(ma.zustand<MASCH_ROT) A.push({t:`🔧 ${maschName(ma)} bei ${ma.zustand} %: fällt aus, bis ${maschEr(ma)} gewartet ist${mTyp(ma).bonus?', solange fehlt der Bonus':''}`,...(mTyp(ma).bonus?{}:{rot:1}),tab:'gut',sub:'maschinen'});
    else if(ma.zustand<MASCH_GELB) A.push({t:`🔧 ${maschName(ma)} bei ${ma.zustand} %: `+(mw?'deine Kellerhelfer warten nach der Lese':'Warten lohnt sich'),tab:'gut',sub:'maschinen',...(mw?{ruhig:1}:{})});
  const of=maschOhneFahrer().filter(x=>mTyp(x).leute==='helfer').length;
  if(maschOhneFahrer().some(x=>mTyp(x).leute==='lagerarb')) A.push({t:'🍾 Die Abfüllanlage steht still, es fehlt ein Kellermensch',tab:'stadt',sub:'arbeit'});
  if(of&&!fehlText()) A.push({t:`🚜 ${of===1?'Eine Maschine steht':of+' Maschinen stehen'} still, es ${fahrerFehlen()===1?'fehlt ein Fahrer':'fehlen '+fahrerFehlen()+' Fahrer'}`,tab:'stadt',sub:'arbeit'});
  for(const id of weinberge()){const f=S.felder[id]; if(f.menge>0&&!f.gelesen&&handFehlt(f)) A.push({t:`✋ ${SORTEN[id].name}: für die Handlese fehlen ${handBedarf(f)-S.helfer} Erntehelfer, sonst nur Qualitätswein`,tab:'stadt',sub:'arbeit'})}}
  for(const l of S.lots) if(l.status==='trauben') A.push(kellerMacht('keltern')&&l.liter<=S.fassraum-fassBelegt()+(aufgabeAktiv('fass')?Infinity:0)?{t:`${SORTEN[l.sorte].name}-Trauben: deine Kellerleute keltern beim Weiterblättern`,tab:'keller',ruhig:1}:kellerTeil().has(l.id)?{t:`${SORTEN[l.sorte].name}-Trauben: der Fassraum reicht nicht, deine Kellerleute keltern beim Weiterblättern nur, was passt`,rot:1,tab:'keller'}:{t:`${SORTEN[l.sorte].name}-Trauben müssen diesen Monat gekeltert werden`,rot:1,tab:'keller'});
  // Seit 13.5.8: Sekt von Hand, bis Lagerarbeiter Stufe 3.
  for(const l of S.lots) if(l.status==='sektTr') A.push(kellerMacht('sekt')?{t:`${SORTEN[l.sorte].name}-Sekt: deine Kellerleute legen ihn beim Weiterblättern in den Sektkeller`,tab:'keller',ruhig:1}:{t:`${SORTEN[l.sorte].name}-Sekt muss diesen Monat in den Sektkeller`,rot:1,tab:'keller'});
    else if(sektFertig(l)&&!kellerMacht('sekt')) A.push({t:`🍾 ${lotName(l)}: die Hefezeit ist um, jetzt abfüllen`,tab:'keller'});
  for(const l of S.lots) if(l.status==='fass'){
    if(l.stufe==='feder') A.push({t:`Federweißer ${SORTEN[l.sorte].name} muss diesen Monat abgefüllt werden`,rot:1,tab:'keller'});
    else if(l.fassMonate>=5) A.push({t:`${lotName(l)}: verdirbt im Fass in ${8-l.fassMonate} Monaten`,rot:1,tab:l.stufe?'keller':'stadt',sub:l.stufe?'':'amt'});
  }
  const anm=S.lots.filter(l=>l.status==='fass'&&!l.stufe&&['feder',...REIHE].some(st=>!pruefeAnmeldung(l,st).length)).length;
  if(anm) A.push({t:`${anm} ${anm===1?'Fass kann':'Fässer können'} im Rathaus angemeldet werden`,tab:'stadt',sub:'amt'});
  const abf=S.lots.filter(l=>l.status==='fass'&&l.stufe&&l.stufe!=='feder');
  for(const l of abf) A.push({t:`${lotName(l)} kann abgefüllt werden`+(S.flaschen<abfFl(l)?` (es fehlen ${num(abfFl(l)-S.flaschen)} Flaschen)`:''),tab:'keller',ruhig:aufgabeAktiv('flaschen')&&!chefsache('abfuellen')?1:0});
  // Seit 8.2 führt die Warnung ins Kellerbuch (dort ist der Wein markiert und hat die passenden Knöpfe). Steht er im Regal, sagt sie das gleich dazu.
  for(const l of S.lots) if(l.status==='flasche'&&lager(l).max-l.flMonate<=2) A.push({t:`${lotName(l)}: nur noch ${lager(l).max-l.flMonate} Monate haltbar`+(l.regal?', steht im Regal, erst rausnehmen':''),rot:1,tab:'keller',sub:'buch'});
  if(m<=2&&S.verlust) for(const id of weinberge()) if(S.verlust[id]) A.push({t:`Über den Winter sind ${rbn(S.verlust[id])} ${SORTEN[id].name}-Reben eingegangen. Nachpflanzen`,tab:'gut',sub:'berg',ruhig:aufgabeAktiv('reben')||helferKann(3)?1:0});
  if(m<=2&&frei>0) A.push({t:`Pflanzzeit: Platz für ${rbn(frei)} Reben`,tab:'gut',sub:'berg',ruhig:1});
  // Seit 15.6.5: Warnung, sobald für einen Weinberg so viel Land frei ist, dass er beim Bepflanzen zurückfiele (nach Landkauf, vor dem Pflanzen).
  for(const id of weinberge()){const ab=rueckfallAb(id); if(ab!=null&&platzFuer(id)>=ab) A.push({t:`⚠️ ${rueckfallSatz(id)}`,tab:'gut',sub:'berg'})}
  // Seit 15.6.5 (Maik 25.11.2026): In Lehr- und Gesellenjahren Hinweis vor einem Landkauf, nach dem weniger als ein Jahr Kosten auf dem Konto blieben.
  // Makler als Hinweis ohne Punkt, Auktion gelb. Ein Jahr Kosten: zwölf Monate wie kontoKnapp. Wortlaut Platzhalter (Meilenstein 17).
  if(S.schwer!=='schwer'){const jk=6*kontoKnapp(), a=S.auktion, ap=a&&!a.ende&&S.rang>=R_AUKTION&&!aukDeckel(a)?(a.phase===0?a.start:aukPreis(aukNaechstes(),a)):null;
    if(ap!=null&&S.geld>=ap&&S.geld-ap<jk) A.push({t:`💶 Ein Zuschlag bei rund ${eur(ap)} ließe weniger als ein Jahr Kosten (${eur(jk)}) auf dem Konto`,tab:'stadt',sub:'amt'});
    else if(!maklerGrund()&&S.geld>=MAKLER_PREIS&&S.geld-MAKLER_PREIS<jk) A.push({t:`💶 Ein Hektar beim Makler ließe weniger als ein Jahr Kosten (${eur(jk)}) auf dem Konto`,tab:'stadt',sub:'amt',ruhig:1})}
  // Version 7.3: Düngen steht an, sobald der Boden auf 70 % oder weniger fällt (Gelb), seit 7.9 Rot ab DUENG_ROT. Düngt der Weingut-Manager, nur ein ruhiger Hinweis.
  // Seit 14.7.4 je Weinberg: der Chef-Weinberg (und ohne Erntehelfer jeder) gelb oder rot, Weinberge auf Automatik als ruhiger Hinweis. Platzhalter, Wortlaut in Meilenstein 17.
  {const D=weinberge().filter(id=>duengOffen(id)&&S.felder[id].boden<=70), bt=id=>`${SORTEN[id].name} ${S.felder[id].boden}\u00a0%`;
    const dh=D.filter(helferDuengt), dc=D.filter(id=>!helferDuengt(id)), r=dc.some(id=>S.felder[id].boden<=DUENG_ROT);
    if(dh.length) A.push({t:`Boden mager (${dh.map(bt).join(', ')}): deine Erntehelfer düngen beim Weiterblättern`,tab:'gut',sub:'berg',ruhig:1});
    if(dc.length) A.push({t:`🌱 Düngen ist ${r?'überfällig':'dran'}: ${dc.map(bt).join(', ')}`,tab:'gut',sub:'berg',rot:r?1:0})}
  // Seit 13.2.4: Rebschnitt bis Ende April, im April rot.
  {const sn=weinberge().filter(id=>schnittOffen(id)&&!helferSchneidet(id)); if(sn.length) A.push({t:`✂️ Rebschnitt bis Ende April: ${sn.map(id=>SORTEN[id].name).join(', ')}`,tab:'gut',sub:'berg',rot:S.monat===SCHNITT_BIS?1:0})}
  // Seit 13.4.6: Der Weingut-Manager warnt, wenn zu viel der Ernte im Wagnis hängt (wagnisWarnung), Rot.
  {const ww=wagnisWarnung(); if(ww) A.push({t:`${MGR_BEREICHE.weingut.sym} Dein ${MGR_BEREICHE.weingut.name} warnt: ${Math.round(ww.anteil*100)} % deiner Ernte hängen im Wagnis (${ww.ids.map(id=>SORTEN[id].name).join(', ')})`,rot:1,tab:'gut',sub:'berg'})}
  if(m===11){const t=steuerSchau(); if(t.steuer>0){
    A.push({t:`💶 Im Januar rund ${eur(t.steuer)} Steuer auf ${eur(t.gew)} Gewinn. Fassraum oder Flaschen kaufen senkt sie`,tab:'keller',sub:'lager',ruhig:1});
    if(weinberge().some(duengOffen)) A.push({t:'💶 Steuer senken: noch düngen',tab:'gut',sub:'berg',ruhig:1});
    if(S.maschinen.some(x=>x.zustand<100)) A.push({t:'💶 Steuer senken: Maschinen warten',tab:'gut',sub:'maschinen',ruhig:1});
  }}
  // Seit 8.2: gelber Punkt im Rathaus im November und Dezember, solange die Spende des Rangs offen ist. Nie rot.
  {const s=spOffen(); if(s&&m>=10) A.push({t:`🤝 Spende für ${SPENDEN[s].z}: ${vonGeld(spBezahlt(),SPENDEN[s].b)}. Vor Silvester gespendet senkt sie die Steuer`,tab:'stadt',sub:'amt'})}
  if(m>=7&&weinberge().some(id=>{const f=S.felder[id];return f.menge>0&&!f.gelesen&&(m<11||f.gefroren||f.edel)})) A.push({t:'Lese möglich',tab:'gut',sub:'berg',...(m===7?{ruhig:1}:{halt:1})});
  if(ladenFrei()&&!aufgabeAktiv('regal')&&!regalWeine().length&&S.lots.some(l=>l.status==='flasche'&&preis(l)>0)) A.push({t:'🍷 Das Regal deiner Weinhandlung ist leer',tab:'stadt',sub:'laeden',ruhig:1});
  {const art=festArt(); if(art&&m>=5&&m<=7&&S.festJahr!==S.jahr&&S.geld>=FESTE[art].preis) A.push({t:`🎉 Das Geld reicht für ein ${FESTE[art].name}`,tab:'gut',sub:'betrieb',ruhig:1})}
  const vk=S.lots.filter(l=>preis(l)>0&&!l.regal).length;
  if(vk) A.push({t:`${vk} ${vk===1?'Wein ist':'Weine sind'} verkaufsreif`,tab:'stadt',sub:'handel',ruhig:1});
  return A;
}

// Zahlen in Zeilen und Balken des Fensters "Dein Stand": "ha" und "Mio." wie in der Kopfzeile, kein "T" für Tausend (Maik 17.11.2026).
const mioZahl=x=>x.toLocaleString('de-DE',{maximumFractionDigits:Math.abs(x)<1?2:1});
const vonGeld=(ist,soll)=>soll>=1e6?`${mioZahl(ist/1e6)} von ${mioZahl(soll/1e6)} Mio. €`:`${Math.abs(ist)>=1e6?geldKurz(ist):num(ist)} von ${eur(soll)}`;
function amtSatz(){
  const A=S.amt, g=amtGegner(), wann=monJahr(A.wahl);
  if(wahlAus()) return `${A.im?'':'Du bist abgewählt. '}Bis zur letzten Übergabe im Januar ${endeJahr()} wird nicht mehr gewählt.`;
  return A.im?`Am Wahltag brauchst du ${A.marke}. Die nächste Wahl ist im ${wann}.${amtKampf()&&g?` ${esc(g.name)} fordert dich heraus.`:''}`:`Du bist abgewählt. Mit ${A.marke} holst du dir den Stuhl im ${wann} zurück.`;
}
// Seit 11.2: Die Rangliste steht im Büro nur noch als Zeile im Fenster "Dein Rang" (Platz x von y), die ganze Liste liegt einen Tipp dahinter (ranglisteHtml).
function rangListe(){
  const v=vermoegen();
  return [{name:S.name,du:1,sub:`du${S.ich?' ('+S.ich+')':S.erbe&&S.erbe.name?' ('+S.erbe.name+')':''}, ${R().name}`,w:frau(),rang:S.rang,ans:S.ansehen,ha:S.ha,verm:v},
    ...S.gegner.map(g=>({name:g.name,sub:`${GEGNER_TYP[g.typ].art}, ${REGIONEN[g.region].name}`,w:gFrau(g),rang:g.rang,ans:Math.round(g.ansehen),ha:g.ha,verm:gVerm(g),stuhl:S.amt?amtAlt()&&g.id===S.amt.stuhl:S.sieger===g.name}))]
    .sort((a,b)=>b.rang-a.rang||b.ans-a.ans);
}
// Seit 7.9: Steht etwas an, das nicht warten kann? Das ist alles in Rot, dazu die Lese (halt). Gelb und Hinweise zählen nicht.
function stehtAn(){return aufgaben().some(a=>a.rot||a.halt)}
// Gründe, aus denen "Weiter bis etwas ansteht" nach einem Monatswechsel anhält. Leer heißt: weiterblättern.
// Schlagzeilen halten nur an, wenn sie dich selbst betreffen (Merkmal du bei schlag()), alle anderen stehen danach unter "Kurz gemeldet".
function sprungHalt(){return [...TOP.filter(x=>x.du).map(x=>'Schlagzeile: '+x.t),...aufgaben().filter(a=>a.rot||a.halt).map(a=>(a.rot?'Rot: ':'Lese: ')+a.t)]}
// Marktbericht für die linke Spalte, solange keine Trauben hängen. f ist ein Faktor zum üblichen Preis.
const proz=f=>{const p=Math.round((f-1)*100);return p?`${p>0?'+':'−'}${Math.abs(p)}\u00a0%`:'wie üblich'};
// Konfetti je Szene: beim Start keins, dann dichter je höher der Rang.
const konfN=k=>k?10+k*6:0;
function kapitel(k){
  if(k===0) return GESCHICHTE;
  if(k===9) return [S.ich?`Der Stuhl gehört dir, ${S.ich}.`:'Der Stuhl gehört dir.','Wer vorher darauf saß, hat das rote Kissen noch selbst aufgeschüttelt.','Von der besten Lage siehst du das ganze Tal, auch den Hang, der einmal kahl war.',
    ...(genNr()>1?[`${VORFAHREN[Math.min(genNr(),5)-2]} haben einmal eine kleine Anzeige gelesen.`,'Heute sitzt die Familie ganz oben.']:['Alles fing mit einer kleinen Anzeige in der Zeitung an, und die halbe Welt hat dagegen gewettet.']),
    // Flaschen-Satz nur, wenn die Flasche vom ersten Jahrgang in dieser Partie ins Fach kam (Maik 17.11.2026).
    // Seit 10.2 mit dem Satz aus Bild 1 der Geschichte: Die leere Flasche bekommt bei der Weltweinschau ihren zweiten Auftritt.
    ...(S.gesch&&S.gesch.flasche?['Und die Flasche vom ersten Jahrgang ist endlich offen.','Die leere Flasche kam zurück ins Regal. Wegwerfen kam nicht in Frage.']:[]),
    `Unten im Keller bekommt ${ratte()} heute ein ganzes Stück Käse.`];
  // Seit 7.9: nach der Taufe (Kapitel 2) mit der richtigen Ratten-Generation, der Gutsherr je nach Anrede.
  // Seit 10.3: Kapitel 6 und 7 haben ab der zweiten Generation eine eigene Fassung (A4).
  return (KAPITEL[k]||[]).map(x=>k>2?x.replace('Frau Öchsle',ratte()):x).map(x=>frau()?x.replace('Ein Gutsherr spielt','Eine Gutsherrin spielt'):x)
    .map(x=>genNr()>1?x.replace('an den du seit der Anzeige denkst','von dem bei euch seit der Anzeige die Rede ist').replace('die auf deinen ersten Fehler gewartet haben','deren Familien einmal auf euren ersten Fehler gewartet haben'):x);
}
const feierSzene=F=>F.start?0:F.zu;
function feierStopp(){FT.forEach(clearTimeout); FT=[]}
const gross=t=>t.charAt(0).toUpperCase()+t.slice(1);
// Alles, was die Ränge von+1 bis zu bringen, als Liste [Symbol, Text]. Der Kreditrahmen steht zuletzt.
// Seit 14.4.8 in zwei Teilen: Einträge mit drittem Wert 'h' sind Überschriften ("Neu für dich", "Das darfst du jetzt kaufen oder einstellen").
function feierPunkte(von,zu){
  const P=[], sym=t=>(FREI_SYM.find(s=>s[0].test(t))||[0,'🔓'])[1], T=[];
  for(let i=von+1;i<=zu;i++) T.push(rangTeile(i));
  // Kreditrahmen und Warnungen stehen am Ende von "Neu für dich", danach kommt der Teil zum Kaufen und Einstellen.
  for(const k of ['neu','kauf']){const L=T.flatMap(t=>t[k]); if(L.length||k==='neu') P.push(['',RANG_KOPF[k],'h']); for(const t of L) P.push([sym(t),gross(t)]);
    if(k!=='neu') continue;
    if(RAENGE[zu].rahmen>RAENGE[von].rahmen) P.push(['🏦',`Kreditrahmen ${eur(RAENGE[zu].rahmen)}`]);
    for(let i=von+1;i<=zu;i++) if(RAENGE[i].weg) P.push(['⚠️',anr(RAENGE[i].weg,RAENGE[i].wegW)])}
  return P;
}
const startPunkte=()=>[['🌱','3 Hektar kahler Weinberg'],['💶',`Startgeld ${eur(startGeld(S.schwer,S.region))}`],['🍇',`Deine erste Rebsorte: ${SORTEN[sortenFolge()[0]].name}`],['📅','Pflanzzeit bis März']];
// Version 7.7: gleicher Ablauf für alle zehn Szenen. Bühne mit dem Kapitel Satz für Satz (ein Tipp zeigt alles), dann Urkunde oder Kaufvertrag.
// Version 8.2: Stufe 8 der Spenden auf der Bild-Bühne mit Holzbogen und Namenstafel, ohne Fanfare. Erst die Bühne mit dem Kapitel, dann der Ehrenbrief.
const spKapitel=()=>['Der ganze Gemeinderat steht auf dem Dorfplatz, die Blaskapelle spielt diesmal fast gerade.',`Der Bürgermeister zieht das Tuch vom neuen Holzbogen: „${SP_SPRUCH}.“`,'Darunter stehen die Namen deiner Familie, Generation für Generation.',`„Ab heute bist du ${anr('Ehrenbürger','Ehrenbürgerin')} unseres Dorfs“, sagt er, „und das bleibt so, auch wenn die Nächsten übernehmen.“`];
// Version 10.2 (Spielende, Paket 3): die Weltweinschau auf der Bild-Bühne. S.feier={welt:'brief'|'schau'|'sieg'|'ende'}.
// Jede Feier hat ein oder mehr Bilder (FSTUFE 0, 1, ...), jedes mit seinem Kapitel Satz für Satz. Brief und Sieg enden mit einem Schriftstück
// (FSTUFE = Zahl der Bilder). Kommen Brief und erste Schau im selben Monat, hängt die Schau als zweites Bild am Brief (F.schau).
function feierWelt(w,o){
  if(S.feier&&S.feier.welt==='brief'&&w==='schau'){S.feier.schau=1; return}
  S.feier={welt:w,...(o||{})};
}
const wfSchau=()=>({bild:'weltweinschau',ort:'🌍 Auf dem Dorfplatz',h:'Die Welt ist zu Gast',konf:10,unten:1,p:['Am Holzbogen hängen Fahnen, die keiner im Dorf richtig zuordnen kann.',
  spLohn(7)?'Auf der Bank an der Spitzenlage sitzen Gäste aus zwanzig Ländern.':'In den Gassen hört man zwanzig Sprachen.','Und beim Dorffest reicht der Wein zum ersten Mal nicht.',
  'Neun Weingüter aus aller Welt stellen sich der Jury, und mittendrin steht dein Wein.']});
function weltFeier(){
  const F=S.feier, fl=!!S.flascheAuf;
  // Seit 13.8.7: erster Grand Cru je Rolle (gc) und der vollendete Weinberg, ohne Schriftstück.
  if(F.welt==='gc'||F.welt==='vollendet'){const T=F.welt==='gc'?GC_FEIER[F.k]||GC_FEIER.menge:GC_FEIER.vollendet, so=(SORTEN[F.id]||{}).name||'', x=t=>t.replace('{sorte}',so).replace('{ratte}',ratte());
    return {B:[{bild:T.bild,ort:T.ort,h:x(T.h),konf:14,p:T.p.map(x)}],knopf:'Anstoßen 🥂'}}
  if(F.welt==='brief') return {B:[{bild:'einladung',ort:'✉️ Im eigenen Hof',h:'Ein Brief für das ganze Dorf',konf:8,p:['Der Bürgermeister steht mit einem Umschlag im Hof, das Siegel ist noch ganz.',
      '„Die Weltweinschau sucht einen Gastgeber. Die wollen diesmal kein Schloss, die wollen ein Dorf.“','„Und ich kenne nur eins, das sich das zutraut.“',
      'Hinter ihm am Zaun steht schon das halbe Dorf und tut so, als wäre es zufällig da.']},...(F.schau?[wfSchau()]:[])],
    kopf:'Post aus aller Welt',schrift:briefHtml(),titel:'Das bringt dir der Brief',
    P:[['🌍',`Jeden ${MON[WELT_MONAT]} ist Weltweinschau auf dem Dorfplatz`],['👑',`${KRONEN.length} Kronen nacheinander: ${KRONEN.map(K=>K.name).join(', ')}`],['🍷',`Deinen Wein meldest du im ${MON[WELT_ANM]} im Rathaus an`],['🔁','Wer verliert, tritt im nächsten Jahr in derselben Klasse wieder an'],['🎗️',`Alle ${KRONEN.length} Kronen machen dich ${anr('zum Ehrenpräsidenten','zur Ehrenpräsidentin')}`]],
    knopf:'Wir machen das 💪'};
  if(F.welt==='schau') return {B:[wfSchau()],knopf:'Auf zur Schau 🌍'};
  // Seit 13.6.3: eine Krone, aber noch nicht alle. Wortlaut seit 13.8, die Fahne am Holzbogen ist ein Bild-Platzhalter bis 14.3.
  if(F.welt==='krone'){const K=KRONEN.find(x=>x.k===F.k)||KRONEN[0], N=KRONEN[kroneKl()]; return {B:[{bild:'weltweinschau',ort:'🎉 Auf dem Dorfplatz',h:`Die ${K.name} bleibt im Dorf!`,konf:18,funken:1,p:kroneFeier(K,F.wein)}],
    kopf:'Eine Krone für das Dorf',schrift:kroneUrkHtml(K),titel:'Das bringt dir die Krone',P:[...(F.was||'').split(', ').filter(Boolean).map(x=>[/Ansehen/.test(x)?'⭐':/Qualit/.test(x)?'🍇':'💶',x]),['👑',`${kronen().length} von ${KRONEN.length} Kronen`],...(N?[['🔜',`Nächstes Jahr geht es um die ${N.name}`]]:[])],knopf:'Anstoßen 🥂'}}
  if(F.welt==='sieg') return {B:[{bild:'weltweinschau-sieg',ort:'🎆 Auf dem Dorfplatz, am Abend',h:`Du bist ${ehrP()}!`,konf:26,funken:1,p:kroneFeier(KRONEN[KRONEN.length-1],F.wein)},
    ...(fl?[{bild:'ehrenplatz',ort:'🕯️ Der Ehrenplatz',h:'Was war da drin?',konf:0,unten:1,p:['Zwischen den besten Weinen der Welt steht eine leere Flasche mit vergilbtem Etikett.',
      'Ein Prüfer aus Übersee bleibt davor stehen: „Was war da drin?“','„Unser erster. Besonders gut war er nicht.“','„Und warum steht er hier?“','„Weil ohne ihn keiner von den anderen da wäre.“']},
    {bild:'flasche-regal-zwei',ort:'🍾 Im Gewölbekeller',h:'Eine zweite Flasche im Regal',konf:0,p:[`Am Abend, als alle weg sind, stellst du ${siegJh()?'eine Flasche Jahrhundertwein':'eine Flasche vom Siegerwein'} ins Regal, direkt neben die leere.`,
      `${ratte()} schnuppert an der leeren und schaut dich fragend an. „Die war nie zum Trinken da“, sagst du.`,'Aufs neue Etikett schreibst du: „Für den Tag, an dem einer von uns es besser macht.“']}]:[])],
    kopf:'Herzlichen Glückwunsch!',schrift:ehrUrkHtml(),titel:'Das bringt dir der Sieg',
    P:[...(F.was||'').split(', ').filter(Boolean).map(x=>[/Ansehen/.test(x)?'⭐':/Qualit/.test(x)?'🍇':'💶',x]),['🎗️',`Den Titel ${ehrP()} nimmt dir keine Wahl mehr`],['🔑',`Im Januar ${endeJahr()} übergibst du am Küchentisch, danach kommt die Chronik`],['🏆','Dein Weg zum besten Ende steht']],
    knopf:'Anstoßen 🥂'};
  return {B:[{bild:ENDE_BILD.best,ort:'🔑 Am Küchentisch',h:'Die Übergabe am Küchentisch',konf:0,ruhig:1,p:endeText()}],knopf:'Zur Chronik 📜'};
}
// Urkundenwand im Büro: jede Aufstiegs-Ehrung als kleine Urkunde. Alte Ehrungen ohne r finden ihren Rang über den Namen.
function urkRang(e){if(e.r!=null) return e.r; const m=/jetzt (.+)\.$/.exec(e.t||''); return m?RAENGE.findIndex(x=>x.name===m[1]):-1}
function wgSicht(){if(!WG_SICHT||WG_SICHT.m!==monatNr()) WG_SICHT={m:monatNr(),st:S.rang+1}; return WG_SICHT}
function wgSeit(i){if(!i) return `Der Anfang, ${START_JAHR}`; const e=(S.ehrungen||[]).find(e=>e.a&&urkRang(e)===i); return e&&e.j?`Aufstieg ${MON[e.m]} ${e.j}`:'Aufstieg'}
// Kopf jeder Ansicht: das Bild des Ortes mit dem Titel darin.
function kopf(titel){return ortBild(titel)}
function vGut(){
  const T={berg:'Weinberg',betrieb:S.name,aktuell:'Aktuelles',maschinen:'Maschinen',buero:'Büro'};
  return kopf(T[SUB])+{berg:vBerg,betrieb:vBetrieb,aktuell:vAktuell,maschinen:vMaschinen,buero:vBuero}[SUB]();
}
// Seit 13.3.1 nur noch ein Schild, warm wirkt nicht mehr.
const gebietArt=r=>r.warm>0?['🔥','Warm']:r.warm<0?['🧊','Kühl']:['⛰️','Mitte'];
const buchKap=()=>typeof ANLEITUNG==='undefined'?[]:ANLEITUNG.flatMap(t=>t.kap);
// Schritt 3 (6.0): Satz zu den Sternen am Preis aus STERN_PREIS_3 bis _1. Stehen alle auf 1, erscheint nichts.
function sternPreisText(){
  const L=[[3,STERN_PREIS_3],[2,STERN_PREIS_2],[1,STERN_PREIS_1]].filter(([n,f])=>f!==1).map(([n,f])=>`bei ${'★'.repeat(n)} ${Math.round(Math.abs(f-1)*100)} % ${f>1?'mehr':'weniger'}`);
  return L.length?` Dazu bringt der Wein ${L.join(', ')} Geld.`:'';
}
function dauerAuftrag(){
  const d=S.dauer||{}, aL=aufgabeAktiv('laeden'), aH=aufgabeAktiv('handel'); if(!aL&&!aH) return;
  const res=DAUER_RESERVE.includes(+d.reserve)?+d.reserve:0, frei=l=>lotRest(l)<=2?l.liter:Math.max(0,l.liter-res), L=[];
  const ls=()=>S.lots.filter(l=>l.status==='flasche'&&!l.regal&&l.liter>0&&preis(l)>0).sort(BSORT_F.dringend);
  // Seit 14.7.6 (Annahme 24), seit dem Nachtrag vor 14.7.8 für jede einzelne Flasche (Maik 25.11.2026): in keinem Kanal eine Flasche unter mgrGrenze. Was nur wegen des Tagespreises liegen bleibt, zählt warte.
  let nL=0,eL=0,nH=0,eH=0; const warte=new Set(), wartet=(l,p)=>p<mgrGrenze(l)&&!!warte.add(l);
  if(aL) for(const [r,la] of Object.entries(S.laeden)) for(const l of ls().filter(l=>ladenPasst(l,r))){
    if(la.rest<=0) break; if(wartet(l,ladenPreis(l,r))) continue; const n=Math.min(frei(l),la.rest); if(n<=0) continue;
    const p=ladenPreis(l,r), e=erloes(Math.round(n*p)); kassiere(e); la.rest-=n; l.liter-=n; nL+=n; eL+=e; kompVerkauf(l,n); warte.delete(l);
  }
  // Seit 14.7.2 (Annahme 19): Den Federweißen bringt die Handels-Managerin schon auf Stufe 1 mit den Weinhandlungen zum Weinhändler, ganz und sofort.
  let nF=0,eF=0;
  if(aL) for(const l of ls().filter(federHandel)){const w=wege(l)[0]; if(!w||wartet(l,w.p)) continue; const n=l.liter, e=erloes(Math.round(n*w.p)); kassiere(e); l.liter-=n; nF+=n; eF+=e; kompVerkauf(l,n); warte.delete(l)}
  if(aH) for(const l of ls().filter(l=>!federHandel(l))){
    // Seit 14.7.6 auch über das Budget hinaus. Seit dem Nachtrag vor 14.7.8 (Maik 25.11.2026, "verschleudert nie"): so viele Flaschen, dass auch die letzte
    // (Faktor marktFBei am Ende der Menge) nicht unter die Grenze fällt, bis dahin galt der Schnitt w.p*marktF. Der Faktor fällt mit der Menge, also halbieren.
    const w=wege(l).filter(x=>aufgabeAktiv('export')||x.name!=='Exporthandel')[0]; if(!w||wartet(l,w.p)) continue;
    const G=mgrGrenze(l), a0=S.absatz||0, geht=n=>w.p*marktFBei(a0+n*w.p)>=G; let lo=0, hi=frei(l); if(geht(hi)) lo=hi; else while(hi-lo>1){const m=(lo+hi)>>1; if(geht(m)) lo=m; else hi=m}
    const n=lo; if(n<=0) continue;
    const e=erloes(Math.round(n*w.p*marktF(n*w.p))); kassiere(e); S.absatz=(S.absatz||0)+n*w.p; l.liter-=n; nH+=n; eH+=e; kompVerkauf(l,n); warte.delete(l);
  }
  S.lots=S.lots.filter(l=>l.liter>0);
  if(nL) L.push(`${num(nL)} Flaschen an Weinhandlungen für ${eur(eL)} verkauft`);
  if(nF) L.push(`${num(nF)} Flaschen Federweißer an den Weinhändler für ${eur(eF)} verkauft`);   // Platzhalter, Wortlaut in Meilenstein 17
  if(nH) L.push(`${num(nH)} Flaschen an den Großhandel für ${eur(eH)} verkauft`);
  {const n=[...warte].filter(l=>l.liter>0).reduce((a,l)=>a+frei(l),0); if(n) L.push(verkaufText('wartet',num(n)))}   // seit 14.7.6, Platzhalter
  handelMelde(L);
}
// Dauerauftrag im Großhandel (k='handel') und im Weinhandel (k='laeden'). Seit 7.4 ohne eigene Karte: Schalter und Reserve stehen im Fenster der Handels-Managerin.
// Am Ort bleibt eine Zeile: hin, solange der Auftrag läuft, stand, wenn er aus ist. text hängt am i des Fensters.
function dauerInfo(k){
  const e=mgrAufgabe(k), M=MGR_BEREICHE[e.bereich], G=mgrG(e.bereich), st=mgrSt(e.bereich), wer=`${G.Dein} ${M.name}`, lae=k==='laeden';
  if(!aufgabeDa(k)) return {text:` Den Dauerauftrag ${lae?'für die Weinhandlungen':'für den Großhandel'} übernimmt `+(!frei(mgrK(e))?`${freiText(mgrK(e))} ${G.dein} ${M.name}${e.stufe>1?` auf Stufe ${e.stufe}`:''}. Bis dahin verkaufst du selbst.`
    :`${G.dein} ${M.name}${e.stufe>1?` auf Stufe ${e.stufe}`:''}, sobald ${G.er} beim nächsten Weiterblättern dazukommt.`)};
  if(!aufgabeAktiv(k)) return {stand:'📋 Der Dauerauftrag ist aus. Einschalten kannst du ihn im Betrieb bei deinen Managern.',
    text:` ${wer} kann den Verkauf ${lae?'an die Weinhandlungen':'an den Großhandel'} als Dauerauftrag übernehmen.`};
  return {hin:`${M.sym} ${wer} ${lae?'beliefert die Weinhandlungen':'verkauft'} beim Weiterblättern.`,
    text:` ${wer} ${lae?'beliefert die Weinhandlungen bei jedem Weiterblättern mit passenden Weinen':verkaufText('info')}. Was am ehesten verdirbt, geht zuerst. Wie viel je Wein im Keller bleibt, stellst du im Betrieb bei deinen Managern ein. Von Hand verkaufen kannst du trotzdem jederzeit.`};
}
// Version 7.0 (Schritt D): Manager im Betrieb (statt Gutsverwalter), im Arbeitsamt und als Fenster von unten.
// Seit 7.5 hat jeder Manager im Betrieb ein eigenes Fenster mit Stufe, Lohn und den Schaltern seiner Aufgaben. Das Fenster von unten (AKT.mgr)
// kommt nach dem Einstellen oder Befördern im Arbeitsamt und zeigt dieselben Schalter (mgrSchalter).
// Wann ein Manager etwas erledigt hat, als Monat (und Jahr, wenn es nicht das laufende ist).
function mgrWann(z){const j=Math.floor(z/12); return MON[z%12]+(j!==S.jahr?' '+j:'')}
function mgrLogbuch(b,t){const m=S.manager[b], z=S.jahr*12+S.monat, L=m.log=m.log||[], e=L[L.length-1]; if(e&&e.z===z) e.t=t; else L.push({z,t}); if(L.length>MGR_LOG) L.splice(0,L.length-MGR_LOG)}
// Manager im Betrieb: {h} für die, die der Rang schon erlaubt, {zu} für die gesperrten (seit 10.6 leer, bis 10.5 zugeklappt mit Schloss unten).
function mgrHtml(){
  const B=Object.keys(MGR_BEREICHE), da=b=>mgrSt(b)>0||frei(mgrK(mgrEintrag(b,1)));
  return {h:B.filter(da).map(mgrPersonal).join(''),zu:B.filter(b=>!da(b)).map(mgrPersonal).join('')};
}
function mgrStufenText(e,st){const t=mgrAufg(e).map(k=>MGR_AUFGABEN[k].kurz); return `${e.stufe<=st?'✅':frei(mgrK(e))?'⬜':'🔒'} Stufe ${e.stufe} (${freiText(mgrK(e))})${t.length?': '+t.join(', '):''}`}
// Was früher der Gutsverwalter tat, seit 7.0 (Schritt D) aufgeteilt: Weingut-Manager (Reben, Düngen, Erntehelfer) und Kellermeister (Keltern, Lagerarbeiter, ab Stufe 2 Abfüllen und Sekt).
// Läuft beim Weiterblättern vor der Leute-Sperre, in derselben Reihenfolge wie beim Verwalter. Berichte stehen in S.mgrLog für die nächste Zeitung.
// Seit 14.7.2 (Annahmen 3 und 5): alles beim Weingut-Manager, Stufe 2 kauft Fassraum und Flaschen, Stufe 3 stellt ein, beides mit seiner Geldgrenze (pu).
function mgrBetrieb(){
  if(!S.manager) return;
  const LW=[], LK=LW, m=S.monat, neu={helfer:0,lagerarb:0}, hf=aufgabeAktiv('helfer'), la=aufgabeAktiv('lager'), pu=mgrPuffer('weingut');
  const stell=k=>{zahle(VERMITTLUNG); S[k]++; S.loehne[k].push(S.angebot[k]); S.loehne[k].sort((x,y)=>x-y); neu[k]++};
  if(aufgabeAktiv('reben')&&m<=2&&S.verlust) for(const id of weinberge()){
    const pr=rebenPreis(id), platz=()=>Math.min(S.verlust[id]||0,platzFuer(id),Math.floor(Math.max(0,S.geld-5000)/pr/10)*10);
    if(hf){let i=0; while(platz()>=10&&helferReben()<rebenGesamt()+platz()&&S.geld>5000+VERMITTLUNG&&i++<20) stell('helfer')}
    const n=Math.floor(Math.min(platz(),helferReben()-rebenGesamt())/10)*10;
    if(n>0){zahle(Math.round(n*pr*100)/100); const f=S.felder[id]; rebenDazu(id,n); S.verlust[id]-=n; LW.push(`${rbn(n)} ${SORTEN[id].name}-Reben nachgepflanzt`)}
  }
  // Bis 14.7.3 stand hier das Düngen als Aufgabe des Weingut-Managers (seit 13.5 ohne Wirkung), seit 14.7.4 düngen die Erntehelfer nach dem Einsatzplan.
  // Bis 14.7.1 wartete hier der Weingut-Manager die Maschinen (Aufgabe warten), seit 14.7.3 machen das die Kellerhelfer (kellerWarten).
  if(hf){const nh=mgrHandlese(); if(nh) LW.push(`${nh===1?'einen Erntehelfer':nh+' Erntehelfer'} für die Handlese eingestellt`)}
  // Schritt F: Kellermeister (seit 8.5 ab Stufe 1, vorher Stufe 2) keltert die Lese beim Weiterblättern und kauft fehlenden Fassraum in Schritten von 500 l wie von Hand.
  // Für den Kauf lässt er mgrPuffer auf dem Konto, fehlende Lagerarbeiter stellt er nur mit der Aufgabe 'lager' ein. Reicht es nicht, bleiben die Trauben liegen
  // und die "Letzte Warnung" nennt den Grund (l.mgrNot). Mit Verlust keltern ("Trotzdem keltern") entscheidet nur der Spieler.
  // Seit 13.5.4: Stufe 1 kauft nur noch den Fassraum (fass), gekeltert wird danach von den Lagerarbeitern (leuteArbeit).
  if(aufgabeAktiv('fass')){
    const fp=fassPreis(); let kauf=0, rest=S.fassraum-fassBelegt();
    for(const l of S.lots.filter(l=>l.status==='trauben')){
      const fehlt=l.liter-rest;
      if(fehlt>0){
        const n=Math.ceil(fehlt/500)*500, kost=Math.round(n*fp*100)/100;
        if(la){let i=0; while(fassKap()<S.fassraum+n&&S.geld-pu>=VERMITTLUNG+kost&&i++<20) stell('lagerarb')}
        if(fassKap()<S.fassraum+n){l.mgrNot='leute'; continue}
        if(S.geld-pu<kost){l.mgrNot='geld'; continue}
        zahle(kost); S.fassraum+=n; kauf+=n; rest+=n;
      }
      delete l.mgrNot; rest-=l.liter;
    }
    if(kauf) LK.push(`${num(kauf)}\u00a0l Fassraum gekauft`);
  }
  // Seit 13.5.4: Stufe 2 kauft nur noch die Flaschen, für alle angemeldeten Fässer zusammen. Abgefüllt wird danach von den Lagerarbeitern (leuteArbeit).
  if(aufgabeAktiv('flaschen')){let bed=0, kauf=0; for(const l of S.lots.filter(l=>l.status==='fass'&&l.stufe)){
    bed+=abfFl(l); const fehlt=bed-S.flaschen, fp=flaschePreis();
    if(fehlt>0){
      if(la){let i=0; while(flKap()<S.flaschen+fehlt&&S.geld-pu>VERMITTLUNG+fehlt*fp&&i++<20) stell('lagerarb')}
      if(flKap()>=S.flaschen+fehlt&&S.geld-pu>=fehlt*fp){zahle(Math.round(fehlt*fp*100)/100); S.flaschen+=fehlt; kauf+=fehlt} else bed-=abfFl(l);
    }}
    if(kauf) LK.push(`${num(kauf)} leere Flaschen gekauft`)}
  {const fe=leuteFehlen(), geht=()=>S.geld-pu>=VERMITTLUNG; if(hf) for(let i=0;i<fe.helfer&&geht();i++) stell('helfer'); if(la) for(let i=0;i<fe.lagerarb&&geht();i++) stell('lagerarb')}
  // Seit Paket B: Fahrer für Düngerstreuer und Laubschneider, den Bediener der Abfüllanlage stellt seit 14.7.2 der Weingut-Manager mit 'lager' ein.
  if(hf){const n=fahrerFehlen(); for(let i=0;i<n&&S.geld-pu>=VERMITTLUNG;i++) stell('helfer')}
  if(la&&S.maschinen.some(x=>mTyp(x).leute==='lagerarb'&&x.zustand>=MASCH_ROT)&&!S.lagerarb&&S.geld-pu>=VERMITTLUNG) stell('lagerarb')
  if(neu.helfer) LW.unshift(`${neu.helfer} Erntehelfer eingestellt`);
  // Seit 10.3 (B2): Hängt kein Feld mehr, entlässt er wieder, wen er nur für die Handlese geholt hat (S.manager.weingut.handH), die teuersten zuerst.
  // Nie unter den Bedarf für Reben und Fahrer. Wer dann noch gebraucht wird, bleibt als fester Helfer.
  {const mw=S.manager.weingut;
  if(hf&&mw&&mw.handH&&!weinberge().some(id=>S.felder[id].menge>0&&!S.felder[id].gelesen)){
    const fahrer=fahrerBedarf(); let k=0;
    while(k<mw.handH&&S.helfer>0&&S.helfer-1>=fahrer&&helferReben(S.helfer-1)>=rebenGesamt()){S.helfer--; S.loehne.helfer.pop(); k++}
    mw.handH=0; if(k) LW.push(`${k===1?'einen Erntehelfer':k+' Erntehelfer'} nach der Handlese entlassen`);
  }}
  if(neu.lagerarb) LK.unshift(`${kellerZahl(neu.lagerarb)} eingestellt`);
  mgrMelde('weingut',LW);
  if(LW.length) save();
}
// Seit 8.0: Weingut-Manager Stufe 3 (Aufgabe helfer) stellt ab August für jedes hängende Feld mit Edelfäulnis
// so viele Erntehelfer ein, wie die Handlese braucht, solange 5.000 € plus Vermittlung auf dem Konto sind. Liefert die Zahl der Eingestellten.
// Läuft beim Weiterblättern und gleich nach dem Monatswechsel, weil Edelfäulnis und Frost erst dort kommen.
function mgrHandlese(){
  if(!aufgabeAktiv('helfer')||S.monat<7) return 0;
  let n=0;
  for(const id of weinberge()){const f=S.felder[id]; if(!(f.menge>0)||f.gelesen||!handFeld(f)) continue;
    while(S.helfer<handBedarf(f)&&S.geld>=5000+VERMITTLUNG&&n<40){zahle(VERMITTLUNG); S.helfer++; S.loehne.helfer.push(S.angebot.helfer); S.loehne.helfer.sort((x,y)=>x-y); n++}}
  if(n){const mw=S.manager.weingut; mw.handH=(mw.handH||0)+n}
  return n;
}
function mgrPuffer(b){const p=((S.manager||{})[b]||{}).puffer; return MGR_PUFFER.includes(p)?p:MGR_PUFFER_START}
// Berichte des Handels-Managers stehen wie die Daueraufträge als Zeile im Winzerboten (S.dauerLog).
// Seit Schritt F merkt sich jeder Manager mit zm (Jahr*12+Monat), wann er zuletzt berichtet hat. Seit 7.5 kommt jede Meldung ins Logbuch (mgrLogbuch).
function handelMelde(L){if(!L.length) return; S.dauerLog=(S.dauerLog||[]).concat(L); S.manager.handel.zuletzt=S.dauerLog.join(', '); S.manager.handel.zm=S.jahr*12+S.monat; mgrLogbuch('handel',S.manager.handel.zuletzt)}
function mgrHandel(){
  if(!S.manager||!S.manager.handel) return;
  const L=[], m=S.monat;
  if(aufgabeAktiv('regal')&&ladenFrei()){
    let raus=0, rein=0, rw=0;
    for(const l of regalWeine()) if(lotRest(l)<=2){l.regal=false; raus+=l.liter; weinZusammen(l)}
    rw=regalWeine().reduce((a,l)=>a+l.liter*preis(l),0);
    const res=DAUER_RESERVE.includes(+(S.dauer||{}).reserve)?+S.dauer.reserve:0, ziel=ladenEigen()*MGR_REGAL;
    for(const l of S.lots.filter(l=>l.status==='flasche'&&!l.regal&&preis(l)>0&&lotRest(l)>=MGR_REGAL_HALT).sort(BSORT_F.dringend)){
      if(rw>=ziel) break; const p=preis(l), n=Math.min(l.liter-res,Math.ceil((ziel-rw)/p)); if(n<=0) continue;
      regalStellen(l,n); rw+=n*p; rein+=n;
    }
    if(rein) L.push(`${num(rein)} Flaschen ins Regal deiner Weinhandlung gestellt`);
    if(raus) L.push(`${num(raus)} Flaschen kurz vorm Verderben aus dem Regal genommen`);
  }
  const w=S.wett;
  // Seit 10.3 (Frage 17): Zur Weltweinschau reicht sie nicht ein, den Wein wählt der Spieler.
  if(aufgabeAktiv('wett')&&w&&w.typ!=='welt'&&!w.fertig&&!w.ein&&S.rang>=wettRang()){
    const land=w.typ==='land', l=S.lots.filter(wettFaehig).sort((a,b)=>juryGrund(b,!land)-juryGrund(a,!land))[0]; // seit 14.5.7 nach den Punkten der Jury
    if(l){w.ein={id:l.id,name:lotName(l),p:wettPunkte(l),sorte:l.sorte,stufe:l.stufe,sekt:l.sekt?1:0}; L.push(`${lotName(l)} ${land?'zur Landesprämierung':'zum Bundeswettbewerb'} eingereicht`)}
  }
  const art=festArt(), F=FESTE[art];
  if(aufgabeAktiv('fest')&&art&&S.festJahr!==S.jahr&&m>=5&&m<=7&&(S.wetter==='sonnig'||m===7)&&S.geld>=F.preis+mgrPuffer('handel')){
    zahle(F.preis); S.festJahr=S.jahr; S.fest={w:S.wetter,art}; L.push(`das ${F.name} für Ende ${MON[m]} ausgerichtet`);
  }
  handelMelde(L); if(L.length) save();
}
function mgrMelde(b,L){if(!L.length) return; S.mgrLog=S.mgrLog||{}; S.mgrLog[b]=(S.mgrLog[b]||[]).concat(L); S.manager[b].zuletzt=L.join(', '); S.manager[b].zm=S.jahr*12+S.monat; mgrLogbuch(b,S.mgrLog[b].join(', '))}
// Alles, was die Manager beim Weiterblättern erledigen (früher verwalter() und dauerAuftrag()).
// Seit 11.1: Siegel aus der Arbeit der Manager melden sich nur im Winzerboten (KOMP_LEISE).
// Seit 14.7.3 warten die Kellerhelfer die Maschinen vor der Arbeit des Weingut-Managers, so wie er bis 14.7.2 vor dem Einstellen für eine Lücke gewartet hat.
function managerArbeit(){KOMP_LEISE++; try{mgrKommen(); {const L=[]; kellerWarten(L); leuteMelde(L)} mgrBetrieb(); leuteArbeit(); mgrHandel(); dauerAuftrag()}finally{KOMP_LEISE--}}
// Seit 13.5.2 (Bauplan 13.5): Arbeit der Leute nach ihrer Stufe (leuteSt), beim Weiterblättern nach den Managern, die vorher einkaufen und einstellen.
// Gearbeitet wird nur, wenn mindestens einer der Gruppe angestellt ist. Was sie tun, steht im nächsten Winzerboten (S.leuteLog).
function leuteMelde(L){if(L.length) S.leuteLog=(S.leuteLog||[]).concat(L)}
// Seit 13.5.8: Schalter nur für das Prüfskript (Messung je Abgabe). ABGABE_AUS {keltern, abfuellen, sekt, duengen, schneiden, pflanzen} lässt die Leute diese Arbeit liegen,
// der Test-Spieler macht sie dann selbst. Das Spiel setzt ihn nie.
const abgabe=k=>!(window.ABGABE_AUS&&window.ABGABE_AUS[k]);
function leuteArbeit(){const L=[]; helferArbeit(L); lagerArbeit(L); leuteMelde(L)}
// Seit 13.5.3 (Bauplan 13.5): Erntehelfer. Stufe 1 düngt wie früher der Weingut-Manager, Stufe 2 schneidet dazu jede Sorte bis Ende April wie der Spieler (13.2.4),
// Stufe 3 pflanzt von Januar bis März nach: eingegangene Reben (S.verlust) und den Auftrag des Spielers je Sorte (f.auftrag, Sorte und Menge).
// Die Reben kauft der Weingut-Manager so günstig wie möglich aus den Angeboten von Januar bis März: zum üblichen Preis oder darunter, sonst im März.
// Ohne ihn kaufen sie gleich zum Preis des Monats (Annahme von Claude). Auf dem Konto bleibt die Geldgrenze des Weingut-Managers.
const helferKann=n=>!!S.helfer&&leuteSt('helfer')>=n;
const pflanzSoll=id=>((S.verlust||{})[id]||0)+(S.felder[id].auftrag||0);
function pflanzAb(id,n){const v=S.verlust||{}, a=Math.min(v[id]||0,n); if(a) v[id]-=a; const f=S.felder[id]; if(f.auftrag) f.auftrag=Math.max(0,f.auftrag-(n-a))}
// Seit 13.5.8 (Maik 22.11.2026, Entscheidung 11): Nachpflanzen nach Auftrag. Braucht eine Sorte im Auftrag noch Reben, bekommt sie frei gewordene Flächen zuerst,
// mit ihren eigenen eingegangenen Reben. Ohne Auftrag kommt die alte Sorte nach, auf dem Platz, der danach noch frei ist. Wartet ein Auftrag noch auf günstige Reben,
// bleibt sein Platz frei (pflanzReserve). pflanzPlan sagt ohne Geld und Preis, wie viele Reben einer Sorte so bis März Platz finden.
const pflanzMitA=id=>(S.felder[id].auftrag||0)>0;
const pflanzKann=id=>sorteFrei(id)&&!(sektSorte(id)&&!S.sektkeller);
const pflanzReihe=()=>[...weinberge().filter(pflanzMitA),...weinberge().filter(id=>!pflanzMitA(id))];
// Seit 13.4.9: Die Spitzen-Sorte bekommt höchstens den freien Südhang, auch beim Freihalten für ihren Auftrag. Seit dem Nachtrag zu 14.5 gilt das für jede Sorte
// auf ihrer Lage (platzFuer), freigehalten wird nur für Aufträge derselben Lage (pflanzReserve(lg)), die Spitzenlage nur auf ihren eigenen Platz.
const pflanzReserve=lg=>R().sorten.filter(id=>lageVon(id)===lg&&pflanzMitA(id)&&pflanzKann(id)).reduce((a,id)=>a+Math.min(pflanzSoll(id),platzFuer(id)),0);
function pflanzPlan(id){const cap={}; for(const lg of LAGE_REIHE) cap[lg]=lagePlatz(lg);
  for(const x of pflanzReihe()){const lg=lageVon(x), n=pflanzKann(x)?Math.floor(Math.min(pflanzSoll(x),istSL(x)?slPlatz():cap[lg])/10)*10:0; if(x===id) return n; if(!istSL(x)) cap[lg]-=n} return 0}
function helferArbeit(L){
  if(!S.helfer) return; const st=leuteSt('helfer'), m=S.monat; chefNorm();
  // Seit 14.2.3: Düngen und Rebschnitt nur, wo der Spieler sie abgegeben hat, schon ab Stufe 1 (Entscheidung 9). Seit 14.7.4 beides je Weinberg auf Automatik (Annahme 9).
  if(st>=1&&abgabe('duengen')) for(const id of weinberge()){const f=S.felder[id];
    if(helferDuengt(id)&&duengOffen(id)&&(f.boden<=HELFER_DUENG||(m===7&&f.boden<90))&&S.geld>=duengKosten(id)){const ma=bonusMasch('duenger'); duenge(id,'helfer'); L.push(`${SORTEN[id].name} ${ma?'mit dem Düngerstreuer gedüngt':'gedüngt'}`)}}
  if(st>=1&&abgabe('schneiden')) for(const id of weinberge()) if(helferSchneidet(id)&&schnittOffen(id)&&S.geld>=schnittKosten(id)){schneide(id,'helfer'); L.push(`${SORTEN[id].name} geschnitten`)}
  // Seit 14.7.4 (Annahmen 13 und 22): Draußen bringt jede Stufe ihre Arbeit. Winzergesellen machen auf Automatik den Laubschnitt (bis 14.7.3 machten die Erntehelfer
  // den Sommerschnitt von Hand, wo der Rebschnitt abgegeben war), Rebmeister das Ausdünnen, beides nur, wo es die nächste Weinstufe bringt (sommerLohnt),
  // mit den Kosten wie von Hand. Was der Chef oder der Laubschneider schon gemacht hat, läuft nicht doppelt (laubHandOffen, ausdOffen). Testschalter wie der Rebschnitt.
  if(m===5&&abgabe('schneiden')) for(const id of weinberge()) if(autoLaub(id)&&laubHandOffen(id)&&sommerLohnt(id,'laub')&&S.geld>=laubHandKosten(id)){laubHand(id); L.push(`${SORTEN[id].name}: Laubschnitt gemacht`)} // Platzhalter, Wortlaut in Meilenstein 17
  if(m===AUSD_MONAT&&abgabe('schneiden')) for(const id of weinberge()) if(autoAusd(id)&&ausdOffen(id)&&sommerLohnt(id,'ausd')&&S.geld>=ausdKosten(id)){ausduennen(id); L.push(`${SORTEN[id].name} ausgedünnt`)} // Platzhalter, Wortlaut in Meilenstein 17
  if(st>=3&&m<=2&&abgabe('pflanzen')) for(const id of pflanzReihe()){
    const f=S.felder[id], soll=pflanzSoll(id); if(soll<10||!pflanzKann(id)) continue;
    const wm=mgrSt('weingut')>0, pr=rebenPreis(id); if(wm&&m<2&&pr>SORTEN[id].preis) continue;
    const res=pflanzMitA(id)||istSL(id)?0:pflanzReserve(lageVon(id)), pu=wm?mgrPuffer('weingut'):0, n=Math.floor(Math.min(soll,platzFuer(id)-res,helferReben()-rebenGesamt(),Math.max(0,S.geld-pu)/pr)/10)*10;
    if(n<10) continue; zahle(Math.round(n*pr*100)/100); rebenDazu(id,n); pflanzAb(id,n); L.push(`${rbn(n)} ${SORTEN[id].name}-Reben gepflanzt`);
  }
}
// Seit 14.7.5: Jede Arbeit nur auf Automatik (kellerMacht), auf Chefsache bleibt sie liegen (Annahme 14).
// Lagerarbeiter: Stufe 1 keltert die Lese, sobald genug Fassraum frei ist, Stufe 2 füllt angemeldete Weine ab und klebt die Etiketten, sobald genug leere Flaschen da sind.
// Fassraum und Flaschen kaufen sie nicht, das macht der Kellermeister oder der Spieler. Stufe 3 stellt den Sekt her, der seit 13.3.3 mit der Lese in den Sektkeller geht,
// die Wahl 9 oder 24 Monate trifft weiter der Spieler. Was angemeldet wird, entscheidet nur er, deshalb füllen sie nur Angemeldetes ab.
function lagerArbeit(L){
  if(!S.lagerarb) return; const st=leuteSt('lagerarb');
  if(st>=1&&abgabe('keltern')&&kellerMacht('keltern')) for(const l of S.lots.filter(l=>l.status==='trauben')) if(l.liter<=S.fassraum-fassBelegt()){delete l.mgrNot; l.status='fass'; l.fassMonate=0; L.push(`${num(l.liter)}\u00a0l ${SORTEN[l.sorte].name} gekeltert`)}
  if(st>=2&&abgabe('abfuellen')&&kellerMacht('abfuellen')) for(const l of S.lots.filter(l=>l.status==='fass'&&l.stufe)) if(S.flaschen>=abfFl(l)){const an=bonusMasch('abfuell'); fuelleAb(l); L.push(`${lotName(l)} abgefüllt${an?' mit der Abfüllanlage':''}`)}
  // Seit 13.5.8 (Entscheidung 6): Stufe 3 legt den Sekt in den Sektkeller und füllt ihn ab, wenn die vom Spieler gewählte Hefezeit um ist. Abgefüllt wird am Ende
  // des Monats, in dem sie endet (beim Weiterblättern vor dem Monatswechsel), so ist er im selben Monat verkäuflich wie beim Spieler, der am Monatsanfang abfüllt.
  if(st>=3&&abgabe('sekt')&&kellerMacht('sekt')){for(const l of sektTrauben()) if(sektUmlagern(l)) L.push(`${num(l.liter)} Flaschen ${lotName(l)} in den Sektkeller gelegt`);
    for(const l of sektAufHefe()) if(l.flMonate+1>=lager(l).min){sektAbfuellen(l); L.push(`${lotName(l)} abgefüllt`)}}
}
const lagerKann=n=>!!S.lagerarb&&leuteSt('lagerarb')>=n;
// Seit 15.6.4 (Bauplan 15.6, Maik zu 15.5): Passt eine Partie nicht ganz in den freien Fassraum, keltern die Kellerleute auf Automatik beim Monatswechsel,
// was noch passt, nur der Rest verdirbt wie bisher. Erst beim Monatswechsel, damit die "Letzte Warnung" bleibt und der Spieler vorher Fassraum kaufen kann.
// kellerTeil() gibt je Partie die Liter, die so gekeltert werden (der freie Fassraum reicht der Reihe nach), ohne Kellerleute oder auf Chefsache leer.
function kellerTeil(){const M=new Map(); if(!S.lagerarb||leuteSt('lagerarb')<1||!abgabe('keltern')||!kellerMacht('keltern')) return M;
  let frei=S.fassraum-fassBelegt(); for(const l of S.lots.filter(l=>l.status==='trauben')){if(frei<=0) break; const n=Math.min(l.liter,frei); if(n>0){M.set(l.id,n); frei-=n}} return M}
function kellerTeilKeltern(){const M=kellerTeil(); for(const l of S.lots) if(M.has(l.id)){l.liter=M.get(l.id); delete l.mgrNot; l.status='fass'; l.fassMonate=0}}
// Seit 14.7.3 (Annahme 21): Die Kellerhelfer warten die Maschinen, sobald einer angestellt ist, nach der Regel des Weingut-Managers bis 14.7.2: nach der Lese
// (vor August oder wenn kein Feld mehr hängt) jede Maschine unter MGR_WART_AB auf 100 %, eine ausgefallene Erntemaschine (unter MASCH_ROT) sofort, auch mitten in der Lese.
// Sie lassen die Geldgrenze des Weingut-Managers auf dem Konto (mgrPuffer, ohne ihn MGR_PUFFER_START), reicht es nicht ganz, warten sie so weit, wie das Geld reicht.
// Die Ausgefallene kommt nur, wenn das Geld bis MASCH_ROT reicht. Seit 14.7.5 nur auf Automatik (Chefsache warten), Testschalter ABGABE_AUS.warten.
const kellerWartet=()=>kellerMacht('warten')&&abgabe('warten');
const kellerZahl=n=>`${num(n)} ${n===1?'Kellermensch':'Kellerleute'}`;   // Platzhalter, Wortlaut in Meilenstein 17
function kellerWarten(L){
  if(!kellerWartet()) return; const pu=mgrPuffer('weingut');
  if(S.monat<7||!weinberge().some(id=>S.felder[id].menge>0&&!S.felder[id].gelesen))
    for(const ma of S.maschinen.filter(x=>x.zustand<MGR_WART_AB)){
      const W=mTyp(ma).wart, n=Math.min(100-ma.zustand,Math.floor((S.geld-pu)/W)); if(n<1) continue;
      zahle(n*W); ma.zustand+=n; L.push(`${maschName(ma)} auf ${ma.zustand} % gewartet`);
    }
  for(const ma of S.maschinen.filter(x=>mTyp(x).ernte&&x.zustand<MASCH_ROT)){
    const W=mTyp(ma).wart, n=Math.min(100-ma.zustand,Math.floor((S.geld-pu)/W)); if(ma.zustand+n<MASCH_ROT) continue;
    zahle(n*W); ma.zustand+=n; L.push(`${maschName(ma)} nach dem Ausfall auf ${ma.zustand} % gewartet`);
  }
}
// Seit 13.5.7: was die Leute schon können und was als Nächstes kommt, für "Deine Leute" im Betrieb. Wortlaut seit 13.8.
function leuteStufeText(k){const st=leuteSt(k), T=LEUTE_ST[k], n=st+1;
  return (st?`${T.stufen?leuteStName(k,st)+' k':'K'}önnen schon: ${T.kann.slice(0,st).join(', ')}.`:'Noch machst du ihre Arbeit selbst.')+(n<=3?` ${T.stufen?leuteStName(k,n):'Stufe '+n} (${T.kann[n-1]}) ${T.stufen?'kommen':'kommt'} ${freiText(k+n)}.`:'')}
// Seit 12.6.4 (Maik 20.11.2026, Prüfliste Einstieg): ruhiger Einstieg. Nur neue Partien haben S.ein, darin S.ein.f mit den Fenstern, die schon frei sind.
// Ein Fenster aus EIN_REGEL bleibt weg, bis seine Bedingung einmal stimmt, danach bleibt es für immer. Alte Spielstände ohne S.ein sehen alles wie vorher.
// "Deine Weine" gibt es zweimal (Weinarchiv und Großhandel), im Großhandel heißt die Regel weine_gh.
const einFass=()=>S.lots.some(l=>l.status!=='trauben'), einFlasche=()=>S.lots.some(l=>l.status==='flasche');
const EIN_REGEL={
  // Der Boden fällt jeden Monat um 3 Punkte, unter 80 ist er schon im Februar. Deshalb erst ab Mai oder sobald "Das steht an" ab 70 % zum Düngen ruft (Annahme Claude).
  duengung:()=>monatNr()>=4||bodenMin()<=70,
  gebiet:()=>monatNr()>=12,
  helfer:()=>S.ha>ALLEIN_HA||S.rang>=R_AUKTION||S.helfer>0||S.maschinen.length>0||!!leuteFehlen().helfer,
  lagerarb:()=>S.fassraum>ALLEIN_FASS||S.flaschen>ALLEIN_FL||S.lagerarb>0||!!leuteFehlen().lagerarb||fassKap()-S.fassraum<500||flKap()-S.flaschen<100,
  leute:()=>einFrei('helfer')||einFrei('lagerarb'),
  maschinen:()=>S.maschinen.length>0||Object.keys(MASCH).some(maschFrei),
  rangliste:()=>monatNr()>=12,
  ehrungen:()=>(S.ehrungen||[]).some(e=>!e.a)||kompZahlen().hab>0,
  ruf:()=>kompZahlen().hab>0,
  urkunden:()=>S.rang>=1,
  komp:einFass,
  meingut:()=>S.rang>=1, chronik:()=>S.rang>=1, besten:()=>S.rang>=1&&bestenZeilen().length>0,   // Die Bestenliste gilt über alle Partien, deshalb erst mit dem ersten Aufstieg (Annahme Claude).
  weine:()=>S.lots.length>0,
  zuckern:()=>S.lots.length>0, keltern:()=>S.lots.length>0,
  verschneiden:()=>{const mi=S.lots.filter(mischbar); return mi.some(a=>mi.some(b=>a!==b&&farbe(a)===farbe(b)))},
  pruefer:()=>S.lots.some(l=>l.pansch),
  abfuellen:einFass, vorrat:einFass, flaschen:einFass, anmelden:einFass,
  faesser:()=>monatNr()>=5||S.lots.length>0,
  markt:einFlasche, weine_gh:einFlasche,
  laeden:()=>S.lots.some(l=>l.status==='flasche'&&(l.sekt||STUFEN[l.stufe]&&STUFEN[l.stufe].rang>=3)),
  kredit:()=>!!S.kredit||S.geld<0||monatNr()>=15
};
function einKey(id){return id==='weine'&&SUB==='handel'?'weine_gh':id}
// Prüft einmal je Zeichnen alle noch gesperrten Fenster und merkt sich, was frei geworden ist.
function einPruef(){if(!S||!S.ein) return; for(const k of Object.keys(EIN_REGEL)) if(!S.ein.f.includes(k)) try{if(EIN_REGEL[k]()) S.ein.f.push(k)}catch(e){}}
function einFrei(k){return !S||!S.ein||!EIN_REGEL[k]||S.ein.f.includes(k)}
function einZu(id){const k=einKey(id); return !!(S&&S.ein&&EIN_REGEL[k]&&!S.ein.f.includes(k))}
// Seit 12.6.4: Bei einer neuen Partie fehlen Erfolge und Familie, bis dort das erste Fenster frei ist. Dann öffnet das Büro auf Wissen.
function bueroBer(){return BUERO_B.filter(([k])=>k==='erfolge'?['rangliste','ehrungen','ruf','urkunden'].some(einFrei):k==='familie'?['meingut','chronik','besten'].some(einFrei):true)}
function vBuero(){
  const BB=bueroBer(); if(!BB.some(b=>b[0]===BUERO)) BUERO=BB[0][0];
  return bueroKacheln()+namenFenster()+{erfolge:bueroErfolge,wissen:bueroWissen,familie:bueroFamilie,einst:bueroEinst}[BUERO]();
}
function bueroFamilie(){
  const L=bestenZeilen();
  return wgFenster()
    +chronikHtml()
    +fenster('besten','Bestenliste',L.length?L.map(bestenZeile).join(''):[],{
      leer:'Noch leer.',buch:'ende',i:BESTEN_I});
}
function vKeller(){
  const T={start:'Weinkeller',buch:'Weinarchiv',sabotage:'Hintertür',lager:'Lager'};
  return kopf(T[SUB])+{start:vKellerStart,buch:vBuch,sabotage:vSabotage,lager:vLager}[SUB]();
}
// Kellerausbau in drei Stufen. Seit 13.5.8 (Entscheidung 9) gibt der erste angemeldete Wein der Stufe in KELLER_WEIN sie frei, nicht mehr der Rang.
// S.kellerW ist der höchste Rang (STUFEN.rang) eines angemeldeten Weins ohne Sekt, ein höherer Wein gibt die Stufen darunter mit frei.
// Vor dem ersten Kabinett ist das Fenster ausgeblendet (seit 10.6, damals vor Jungwinzer), danach steht unter dem Stand, womit die nächste Stufe geht.
// Probestände aus 13.3 bis 13.5 ohne S.kellerW bekommen ihn einmal aus dem Kellerbuch und den gebauten Stufen (altKellerW), ohne Umzug.
const KELLER_MIT={kab:'dem ersten Kabinett',spat:'der ersten Spätlese',aus:'der ersten Auslese'};
// Seit 13.3.7 (Nachtrag 3): Hat eine Stufe eine Rolle in KELLER_ROLLE, zählt nur ein Wein dieser Rolle (S.kellerWR je Rolle, wie S.kellerW). Sorten ohne Rolle zählen für jede.
// Probestände bis 13.6 ohne S.kellerWR bekommen ihn einmal aus Kellerbuch und gebauten Stufen.
// Seit 14.4.2: je Stufe ein Wein (KELLER_WEIN) oder ein Rang (KELLER_RANG), KELLER_ROLLE und S.kellerWR sind weg.
const kellerMit=k=>KELLER_RANG[k]!=null?`dem Rang ${rangN(KELLER_RANG[k])}`:KELLER_MIT[KELLER_WEIN[k]]||'dem ersten '+STUFEN[KELLER_WEIN[k]].name;
const lotRolle=l=>l&&SORTEN[l.sorte]?SORTEN[l.sorte].rolle:null;
function altKellerW(){let w=0; for(const l of S.lots||[]) if(l.stufe&&!l.sekt&&STUFEN[l.stufe]) w=Math.max(w,STUFEN[l.stufe].rang); for(let k=0;k<(S.keller||0)&&k<KELLER_WEIN.length;k++) if(KELLER_WEIN[k]) w=Math.max(w,STUFEN[KELLER_WEIN[k]].rang); S.kellerW=w}
function kellerFrei(k){if(S.kellerW==null) altKellerW(); if(k>=KELLER_WEIN.length) return false; return KELLER_RANG[k]!=null?S.rang>=KELLER_RANG[k]:S.kellerW>=STUFEN[KELLER_WEIN[k]].rang}
// Bei jeder Anmeldung: Gibt der Wein eine neue Stufe frei, kommt der Satz für die Meldung zurück, sonst ''.
const kellerFreiN=()=>KELLER_WEIN.filter((w,k)=>kellerFrei(k)).length;
// Seit 14.4.2: Die erste Anmeldung als Qualitätswein oder höher ist die Tat qba (Kellerhelfer keltern), Annahme der Bau-Sitzung.
function kellerWein(l,st){if(!l||l.sekt||!STUFEN[st]) return ''; if(STUFEN[st].rang>=STUFEN.qba.rang) tatMerk('qba'); const K=S.keller||0, vor=kellerFreiN(); S.kellerW=Math.max(S.kellerW,STUFEN[st].rang); const nach=kellerFreiN();
  if(nach<=vor||nach<=K) return '';
  return nach>K+1?` Damit kannst du deinen Keller bis Stufe ${nach} (${KELLER_NAMEN[nach-1]}) ausbauen.`:` Damit kannst du deinen Keller ausbauen, Stufe ${K+1} (${KELLER_NAMEN[K]}).`}
function kellerRangText(){return ` Stufe 1 (${KELLER_NAMEN[0]}) gibt es mit ${kellerMit(0)}, Stufe 2 (${KELLER_NAMEN[1]}) mit ${kellerMit(1)}, Stufe 3 (${KELLER_NAMEN[2]}) mit ${kellerMit(2)}.`}
// Feste Reihenfolge im Kellerbuch und im Großhandel (seit 7.4 ohne Sortier-Knöpfe): Was zuerst verdirbt, steht oben. Danach verkaufen auch die Manager.
const lotRest=l=>l.status==='fass'?8-l.fassMonate:lager(l).max-l.flMonate;
// Haltbarkeit als kurzer Text, wie im Kellerbuch.
function haltText(l){const fl=l.status==='flasche', r=fl?(lager(l).max===Infinity?Infinity:lager(l).max-l.flMonate):8-l.fassMonate; return {r,t:r===Infinity?'unbegrenzt haltbar':`noch ${r} ${r===1?'Monat':'Monate'} haltbar${fl?'':' im Fass'}`}}
function vBuch(){
  if(!ARCHIV_B.some(b=>b[0]===ARCHIV)) ARCHIV='weine';
  lexInit();
  return archivKacheln()+{weine:vWeine,brett:vBrett,lexikon:vLexikon}[ARCHIV]();
}
// Für welchen Eintrag auf dem Siegelbrett ein Wein zählt (seit 11.8, D1), nach denselben Regeln wie kompVerkauf. Wein im Fass und gepanschter Wein zählen nie.
function kompLotId(l){
  if(!l||l.pansch||l.status==='fass'||l.status==='trauben') return null;
  const so=kompRollen();
  if(l.sekt) return !S.rollen||l.sorte===so.sekt?'sekt':null;
  const rl=KOMP_STUFE_ROLLE[l.stufe]; return rl&&stamm(l.sorte)===so[rl]?'stufe_'+l.stufe:null;
}
const fuMon=id=>!S.ein&&FU_MON_ALT[id]!=null?FU_MON_ALT[id]:FU_MON[id];
const fuGes=id=>!!(S.fu&&S.fu.ges.includes(id));
// Seit 12.8: echter Bedarf an Leuten für e1-02, also mehr als die Familie allein schafft, schon eingestellte Leute, eine Maschine (braucht einen Fahrer) oder fehlende Leute.
function fuLeuteBedarf(){const f=leuteFehlen(); return S.ha>ALLEIN_HA||S.fassraum>ALLEIN_FASS||S.flaschen>ALLEIN_FL||S.helfer>0||S.lagerarb>0||S.maschinen.length>0||f.helfer>0||f.lagerarb>0}
// Seit 12.6: Fassraum nur, wenn er für die erwartete Menge nicht reicht, Edelfäulnis und Eiswein nur, wenn noch etwas hängt.
const fuMenge=()=>weinberge().reduce((a,id)=>a+(S.felder[id].reben&&!S.felder[id].gelesen?S.felder[id].menge||0:0),0);
// Rang-Neuheiten: r3 ist der Jungwinzer (Index 1 in RAENGE), r4 der Winzer und so weiter. Die n-te Blase eines Rangs frühestens
// im n-ten Monat nach der Feier, die Bremse verteilt sie ohnehin auf je einen Monat. S.fu.rm merkt den Monat der Feier je Rang.
const fuRang=id=>{const m=/^r(\d+)-(\d+)$/.exec(id); return m?{r:+m[1]-2,n:+m[2]}:null};
const fuKauf=m=>m%12<=2;
const fuFrueh=(id,rm)=>!!FU_MASCH_VOR[id]&&rm!=null&&fuKauf(rm+1)&&!fuKauf(rm+fuRang(id).n-1);
const fuPlatz=id=>{const x=fuRang(id); return fuFrueh(id,(S.fu.rm||{})[x.r])?1.5:x.n};
function fuKabFrueh(l){if(l.status!=='fass'||l.stufe||l.jahrgang!==S.jahr) return false; return FU_PRAED.some(st=>{const g=pruefeAnmeldung(l,st); return g.length>0&&g.every(x=>/Januar/.test(x))})}
// Seit 10.3 (C24): w4 kommt im Rathaus, bevor der erste Riesling als Kabinett oder höher angemeldet wird. w6 schon im fünften Monat (C37).
// Seit 11.4: jede Sorte, die ab Kabinett 18 Monate reift (alte Spielstände: Riesling, mit Rollen: die Spitzen-Sorte).
const fuReiht=l=>SORTEN[l.sorte].minL>=18&&l.status==='fass'&&!l.stufe&&FU_PRAED.some(st=>!pruefeAnmeldung(l,st).length);
const fuLange=l=>l.status==='fass'&&l.stufe!=='feder'&&l.fassMonate>=5;
// Seit 10.3 (C28): Anlässe. Erste Medaille und erster Bundessieg nur im Monat der Ehrung oder danach, die Blasen zur Übergabe in den ersten zwei Jahren der Generation.
function fuEhrNeu(f){const e=(S.ehrungen||[]).find(e=>!e.a&&f(e)); return !!e&&e.j!=null&&(S.jahr*12+S.monat)-(e.j*12+e.m)<=1}
const fuNach=()=>genNr()>=2;
const fuGenFrisch=()=>S.jahr-START_JAHR<GEN_JAHRE*(genNr()-1)+2;
// Seit 12.8 (Maik 21.11.2026): r6-5 im fünften Monat nach der Feier zum Weingutsbesitzer, alte Spielstände ohne Monat der Feier sofort (die Bremse verteilt sie).
const fuR65Zeit=()=>frei('sekt_anlage');
// Seit 12.8: m5 beim ersten Siegel der Partie, nur wenn beim ersten Blick des Spielführers noch keins da war (S.fu.h0). m6 beim ersten Gold,
// frühestens einen Monat, spätestens zwölf Monate nach m5 (S.fu.m5m, Monat, in dem m5 dran war).
const fuGold=()=>KOMP_KAP.some(k=>kompIds(k[0]).some(id=>kompSt(id)>=3));
const fuM6=()=>{const a=S.fu.m5m; if(a==null) return false; const m=monatNr(); return m>=a+1&&(fuGold()||m>=a+12)};
const fuGenAnk=()=>S.jahr-START_JAHR>=GEN_JAHRE*genNr()-GEN_VORAUS;
// Seit 13.3.6: Neue Partien starten mit FU_START (im Umbau 0, also ohne Spielführer), einschalten geht im Fenster Spielführer.
function fuNeu(){return {an:FU_START,nur:0,ges:[],q:[],mon:-1,rm:{},km:-99,h0:0}}
// Alte Spielstände (bis 8.0.1): Wer schon zwei Jahre oder länger spielt, bekommt den Einstieg nicht nachgeliefert.
// Darunter fällt weg, was schon vorbei ist, der Rest des Fahrplans kommt noch. Neuheiten schon erreichter Ränge kommen nicht nach,
// Warnungen und Kniffe kommen alle (Paket B).
function fuAlt(){
  const f=fuNeu(), m=monatNr(), L=S.lots||[], weg=id=>{if(!f.ges.includes(id)) f.ges.push(id)};
  fuRangWeg(f);
  if(m>=24){FU_PLAN.forEach(weg); return f}
  for(const id in FU_MON) if(fuMon(id)<m) weg(id);
  weg('e1-19');
  if(m>0) ['e1-0a','e1-01','e1-02','e1-03','e1-04'].forEach(weg);
  if(m>1){weg('e1-05'); weg('e1-06')}
  if(m>=12||L.some(l=>l.status!=='trauben')) weg('e1-13');
  if(m>=12||L.some(l=>l.stufe)) weg('e1-14');
  if(m>=12||L.some(l=>l.status==='flasche')) weg('e1-15');
  if(m>=12) weg('e1-16');
  if(m>12) weg('k01');
  return f;
}
function fuRangWeg(f){if(typeof FUEHRER==='undefined') return; for(const id in FUEHRER){const x=fuRang(id); if(x&&x.r<=S.rang&&!f.ges.includes(id)) f.ges.push(id)}}
// Spielstände aus Paket A (S.fu ohne rm): Neuheiten der schon erreichten Ränge gelten als gezeigt.
function fuPaketB(){const f=S.fu; if(f.rm) return; f.rm={}; f.km=-99; f.nur=f.nur||0; fuRangWeg(f)}
// Mit Spielführer ("alle Tipps") gibt es "Weiter bis etwas ansteht" erst ab dem Januar des zweiten Jahres (k01 stellt den Knopf vor).
// Seit 12.6: bei neuen Partien schon ab April des ersten Jahres (e1-19 und k01).
function fuSperre(){return !!(S&&S.fu&&S.fu.an&&!S.fu.nur&&monatNr()<(S.ein?3:12))}
// Bremse: Rang-Neuheiten und Kniffe höchstens eine je Monat. Kern-Blasen, Warnungen, Einstieg und der Fahrplan der ersten zwei Jahre sind ausgenommen (Annahme Claude),
// k01 kommt fest gleich nach z2-01.
// Seit 10.3 (C30): r3-4 hängt am November und ist von der Bremse ausgenommen.
const fuBremse=id=>{const b=FUEHRER[id]; return (b.a==='rang'||b.a==='kniff')&&!b.k&&id!=='k01'&&id!=='r3-4'};
function fuBereit(){return !!(S&&S.fu&&S.fu.an&&typeof FUEHRER!=='undefined')}
function fuErlaubt(id){const b=FUEHRER[id]; return !!b&&(!S.fu.nur||b.a==='rang'||b.a==='warnung'||FU_IMMER.includes(id))}
// Hält die Blase das Vorspulen an? k11 hält nur mit der Ankündigung im Winzerboten (Text "nein, mit der Ankündigung ja").
const fuH=id=>!!(FUEHRER[id].h||id==='k11'&&fuGenAnk());
// Seit 10.3 (C4): Passt der Anlass einer wartenden Blase noch? Kern-Blasen mit festem Monat warten, bis sie gelesen sind (Maik 19.11.2026).
function fuNochDran(id){
  if(FU_MON[id]&&FUEHRER[id].k) return true;
  const w=FU_WANN[id]||FU_KNIFF[id]; if(!w) return true;
  try{return !!w()}catch(e){return true}
}
function fuehrerPruef(){
  if(!fuBereit()) return;
  let neu=0;
  // Seit 10.3 (C4): Wartende Blasen, deren Anlass vorbei ist, fliegen raus, statt einen Monat zu spät zu kommen. Als gezeigt gelten sie nur,
  // wenn der Spieler sie schon gesehen (FU_SPAET) oder die Sache selbst erledigt hat (FU_ERL), sonst kommen sie beim nächsten Anlass.
  // Seit 12.8: Siegel beim ersten Blick des Spielführers (alte Spielstände), Blasen nur für den Verlauf, Monat von m5 für m6.
  if(S.fu.h0==null){S.fu.h0=kompZahlen().hab; neu=1}
  for(const id in FU_STILL){
    if(!FUEHRER[id]||id===FU_AKT||S.fu.ges.includes(id)||S.fu.q.includes(id)) continue;
    let ja=false; try{ja=!!FU_STILL[id]()}catch(e){} if(ja){S.fu.ges.push(id); neu=1}
  }
  if(S.fu.m5m==null&&fuGes('m5')){S.fu.m5m=monatNr(); neu=1}
  const alt=S.fu.q.filter(id=>id!==FU_AKT&&FUEHRER[id]&&!fuNochDran(id));
  if(alt.length){
    S.fu.q=S.fu.q.filter(id=>!alt.includes(id)); neu=1;
    for(const id of alt){let erl=FU_SPAET[id]!=null; try{erl=erl||!!(FU_ERL[id]&&FU_ERL[id]())}catch(e){} if(erl&&!S.fu.ges.includes(id)) S.fu.ges.push(id)}
  }
  for(const id in FU_WANN){
    if(!FUEHRER[id]||!fuErlaubt(id)||S.fu.ges.includes(id)||S.fu.q.includes(id)) continue;
    let ja=false; try{ja=!!FU_WANN[id]()}catch(e){}
    if(ja){S.fu.q.push(id); neu=1}
  }
  // Kniffe: immer nur einer in der Warteschlange. Die Ankündigung des Generationswechsels holt k11 sofort.
  const m=monatNr(), K=Object.keys(FU_KNIFF);
  if(!S.fu.nur&&m>=FU_KNIFF_AB&&!S.fu.q.some(id=>FU_KNIFF[id])){
    const frei=id=>FUEHRER[id]&&!S.fu.ges.includes(id)&&(!FU_VOR[FUEHRER[id].s]||fuGes(FU_VOR[FUEHRER[id].s])||!!FUEHRER[id].e);
    let id=frei('k11')&&fuGenAnk()?'k11':null;
    if(!id&&m-(S.fu.km??-99)>=FU_KNIFF_ABSTAND) id=K.find(k=>{if(!frei(k)) return false; try{return !!FU_KNIFF[k]()}catch(e){return false}})||null;
    if(id){S.fu.q.push(id); neu=1}
  }
  if(neu) save();
}
function fuNaechste(){
  const m=monatNr();
  // Bei gleicher Art bleibt die Reihenfolge der Warteschlange, Rang-Neuheiten nach einem Sprung über mehrere Ränge Rang für Rang.
  const rw=id=>{const x=fuRang(id); return x?x.r*10+fuPlatz(id):0};
  return S.fu.q.filter(id=>id!==FU_AKT&&FU_SPAET[id]!==m&&FUEHRER[id]&&fuErlaubt(id)&&!(fuBremse(id)&&S.fu.mon===m)).sort((a,b)=>FU_ART[FUEHRER[a].a]-FU_ART[FUEHRER[b].a]||rw(a)-rw(b))[0]||null;
}
// Hält "Weiter bis etwas ansteht" an? Nur Blasen mit "Hält an: ja", die übrigen warten auf den nächsten Halt.
function fuHalt(){fuehrerPruef(); return fuBereit()&&S.fu.q.some(id=>FUEHRER[id]&&fuErlaubt(id)&&fuH(id))}
// Seit 10.3 (A1, Maik 19.11.2026): Nach der ersten Übergabe spricht der alte Winzer nur noch seinen Abschied (g2-1). Seine Blasen sagt der Nachfolger (ss) mit dem
// Text für später (sp), ohne diese Angaben ein Manager, der schon da ist, mit dem alten Text. chef: aus "mein Lieber" und "Nachbar" wird "Chef".
// Gibt es noch keinen Manager, kommt der Tipp ohne Gesicht (FU_SPRECHER.gut).
const fuDa=s=>!FU_VOR[s]||fuGes(FU_VOR[s]);
// Seit 14.7.7: Titel der Figur der Kellerleute (k lagerarb) oder draußen (k helfer) nach der Stufe ihrer Leute, vor Stufe 1 der erste Titel.
const fuTitel=(P,k)=>P.titel[Math.min(3,Math.max(1,S?leuteSt(k):1))-1];
function fuSprecher(id){
  const b=FUEHRER[id], v=FU_VOR[b.s], ersatz=!!(v&&v!==id&&!fuGes(v)&&b.e);
  if(!fuNach()||id==='g2-1') return ersatz?{s:'winzer',t:b.e,k:'e'}:{s:b.s,t:b.t,k:''};
  let s=b.s==='winzer'?b.ss||'handel':b.s, k=b.s==='winzer'?(b.sp?'sp':''):ersatz?'e':'';
  if(!fuDa(s)&&FU_VOR[s]!==id) s=['handel','keller','weingut'].find(fuDa)||'gut';
  return {s,t:b[k||'t'],k,chef:1};
}
// Seit 12.7.2: Sprecher eines Eintrags im Verlauf, für alte Spielstände aus der Reihenfolge in S.fu.ges (vor = alles, was davor dran war).
// Wie fuSprecher, nur zählt statt des heutigen Stands, was damals schon dran war: Hatte sich der Manager noch nicht vorgestellt, sprach der alte Winzer
// mit dem Ersatz-Text, stand der Abschied g2-1 schon davor, sprach der Nachfolger.
function fuSpAus(id,vor){
  const b=FUEHRER[id], v=FU_VOR[b.s], ersatz=!!(v&&v!==id&&!vor.has(v)&&b.e);
  if(!vor.has('g2-1')||id==='g2-1') return ersatz?{s:'winzer',k:'e'}:{s:b.s};
  const da=x=>!FU_VOR[x]||vor.has(FU_VOR[x]);
  let s=b.s==='winzer'?b.ss||'handel':b.s;
  if(!da(s)&&FU_VOR[s]!==id) s=['handel','keller','weingut'].find(da)||'gut';
  return {s,k:b.s==='winzer'?(b.sp?'sp':''):ersatz?'e':'',c:1};
}
// Verlauf (12.7.2, Maik 21.11.2026): alle Einträge aus S.fu.ges in ihrer Reihenfolge, auch weggedrückte und übersprungene, der offene Tipp (FU_AKT) hinten.
// S.fu.sp merkt sich je gezeigtem Tipp den Sprecher (s), den Text (k) und ob "Chef" gilt (c). S.fu.vl = ab hier zählt der Verlauf, gesetzt von "Tipps von vorn".
function fuVerlauf(){
  const f=S.fu, sp=f.sp||{}, vor=new Set(), V=[];
  f.ges.forEach((id,i)=>{if(FUEHRER[id]&&i>=(f.vl||0)) V.push({id,...(sp[id]||fuSpAus(id,vor))}); vor.add(id)});
  if(FU_AKT&&FUEHRER[FU_AKT]&&!f.ges.includes(FU_AKT)) V.push({id:FU_AKT,...(sp[FU_AKT]||fuSpAus(FU_AKT,vor))});
  return V;
}
// Wer spricht, wenn noch nichts im Verlauf steht: vor der ersten Übergabe der alte Winzer, danach der erste Manager, der schon da ist.
const fuStandSp=()=>fuNach()?['handel','keller','weingut'].find(fuDa)||'gut':'winzer';
// Seit 10.3 (C11, C38, C6): Platzhalter für die Startsorte des Gebiets, den Wertzuwachs aller Sorten und die Frost-Häufigkeit.
const fuPz=s=>Math.round(s.reife*100)+'\u00a0%';
function fuFrostJahre(){const f=WINTER_FROST; return f>=.4?'fast jedes zweite Jahr':f>=.2?'etwa jedes vierte Jahr':'nur etwa jedes zehnte Jahr'}
function fuText(t,chef){
  return t.replace(/\{(Mein Lieber|mein Lieber|Nachbar|Sorte|Reife|Zuwachs|Haltbar|Sortenzuwachs|Frostjahre|Sektstar|Dritte Sorte|Langsorte|Startgeld|Hürde ([^}]+))\}/g,(x,a,h)=>{
    if(h) return R().min[FU_HUERDE[h]]+'°';
    const L=sortenFolge().map(id=>SORTEN[id]), s=L[0];
    if(a==='Sorte') return s.name;
    if(a==='Reife') return s.minL;
    if(a==='Zuwachs') return fuPz(s);
    if(a==='Haltbar') return Math.round(s.maxL/12);
    if(a==='Sortenzuwachs') return `${s.name} legt jedes Jahr ${fuPz(s)} zu, ${L[1].name} ${fuPz(L[1])} und ${L[2].name} ${fuPz(L[2])}`;
    if(a==='Frostjahre') return fuFrostJahre();
    // Seit 11.4: Sätze, die von den Sorten der Partie abhängen. Sektstar hängt an "mehr als der Grundwein", Dritte Sorte beschreibt die dritte Rebsorte, Langsorte ist die Sorte mit 18 Monaten Reife.
    if(a==='Sektstar'){const st=L.filter(x=>x.sektStar).map(x=>x.name); return !st.length?'':S.rollen?`, als Sekt vom ${st[0]} noch etwas mehr`:`, ${st.join(' und ')} noch etwas mehr`}
    if(a==='Dritte Sorte') return S.rollen?`Es ist ${L[2].name}, deine Spitzen-Sorte: Sie trägt wenig, bringt aber die beste Qualität und reift am längsten. Drei Sorten verteilen außerdem das Wetterrisiko.`:'Sie hat nur einen Stern, startet mit weniger Zucker und bringt weniger Geld. Dafür ist sie in manchen Gebieten der erste Rotwein, und drei Sorten verteilen das Wetterrisiko.';
    if(a==='Langsorte') return (L.find(x=>x.minL>=18)||s).name;
    // Seit 12.6.1: das echte Startgeld der Schwierigkeit (Einfach 80.000 €, sonst 60.000 €).
    if(a==='Startgeld') return eur(startGeld(S.schwer,S.region));
    if(chef) return 'Chef';
    return a==='Nachbar'?anr('Nachbar','Nachbarin'):a==='Mein Lieber'?anr('Mein Lieber','Meine Liebe'):anr('mein Lieber','meine Liebe');
  });
}
function fuehrerWeg(){fuBlaseZu(); FU_AKT=null; FU_WO=false; fuPunkt(); fuKopfStell()}
const fuListe=()=>!FU_VL?[]:FU_FILTER==='alle'?FU_VL:FU_VL.filter(x=>x.s===FU_FILTER);
function fuErlCheck(){const id=FU_AKT; if(!id||!FU_ERL[id]||!S||!S.fu) return; let ja=false; try{ja=!!FU_ERL[id]()}catch(e){} if(ja) fuFertig()}
// Abhaken: aus der Warteschlange in die Liste der gezeigten, danach kommt die nächste wartende.
// Seit 10.3 (C3): Für Bremse und Kniff-Abstand zählt der Monat, in dem die Blase aufging, nicht der, in dem sie abgehakt wird.
function fuFertig(){
  const id=FU_AKT; fuehrerWeg(); if(!id||!S||!S.fu) return;
  S.fu.q=S.fu.q.filter(x=>x!==id); if(!S.fu.ges.includes(id)) S.fu.ges.push(id);
  if(fuBremse(id)) S.fu.mon=FU_ZM;
  if(FU_KNIFF[id]) S.fu.km=FU_ZM;
  save(); return id;
}
// Seit 10.3 (C1, C2, Maik 19.11.2026): Ein geparkter Kopf wird abgelegt, wenn eine andere Blase dran ist oder der Monat wechselt.
// Kern-Blasen und Warnungen, deren Anlass noch besteht, kommen im nächsten Monat wieder. Alles andere ist abgehakt,
// auch eine Blase, bei der "Zeig mir, wo" getippt wurde, und eine Warnung, die sich erledigt hat.
function fuAblegen(){
  const id=FU_AKT; if(!id) return;
  const b=FUEHRER[id];
  if(!FU_WO&&(b.k||b.a==='warnung')&&fuNochDran(id)){FU_SPAET[id]=FU_ZM; fuehrerWeg(); return}
  fuFertig();
}
function wettSheet(h){openSheet(h,'wett')}
function lot(id){return S.lots.find(l=>l.id===+id)}
// Liest den Anteil p (0 bis 1) eines Feldes. Bei p<1 bleibt der Rest hängen. Der Boden verliert je Feld und Jahr nur einmal 4 Punkte, seit 14.7.4 der Boden dieses Weinbergs.
// Seit 8.0: Felder mit Edelfäulnis oder gefrorenen Trauben liest die Hand, wenn genug Erntehelfer da sind (handlese), sonst die Maschine mit q.masch (höchstens Qualitätswein).
// Alle anderen Felder lesen Helfer und Maschinen zusammen, die Maschinen nach ihrem Anteil an der Ernteleistung. Das nutzt sie ab (maschAbnutzung).
function lese(id,la,p,hefe){
  // Seit 13.3.2: Ein Feld wird immer ganz gelesen, Teilen geht nicht.
  // Seit 13.3.3: Die Sekt-Sorte liest alles (alles) und geht ohne Grundwein in den Sektkeller, hefe ist SEKT_REIFE oder HEFE_LANG.
  p=1; const sk=sektSorte(id); if(sk){if(!S.sektkeller) return; la='alles'}
  const f=S.felder[id], q=feldQ(f,la), l=Math.round(feldLiter(f,la)*p); if(l<=0) return;
  const L=leistung(), M=maschLeistung();
  if(M>0&&maschDarf(id)) maschAbnutzung(f.reben*Math.min(1,M/Math.max(1,rebenGesamt()-handLeseReben())),M);
  const neu={id:S.nextId++,sorte:id,jahrgang:S.jahr,liter:l,oe:q.oe,leseart:la,edel:f.edel,eis:f.gefroren,...(q.masch?{masch:1}:{}),status:'trauben',stufe:null,qp:qualWb(id),fassMonate:0,flMonate:0,...(f.laub===S.jahr?{laub:1}:{}),boden:f.boden,bst:wbBoden(id),pfl:f.pflSt||0,...(f.jh?{jh:1}:{})};
  // Seit 13.5.8: Die Sekt-Trauben liegen erst im Keller (sektTr), Kosten und Ansehen kommen mit dem Umlagern in den Sektkeller (sektUmlagern).
  // Seit 14.7.5: Macht der Kellermeister den Sekt (Automatik), gilt die Vorwahl des Spielers (sektVorwahl), sonst die Wahl bei der Lese.
  if(sk){const h=kellerMacht('sekt')?sektVorwahl():hefe===HEFE_LANG?HEFE_LANG:SEKT_REIFE; Object.assign(neu,{status:'sektTr',stufe:SEKT_GRUND,sekt:true,edel:false,eis:false,...(h>SEKT_REIFE?{hefe:h}:{}),med:[],bund:false});
    // Seit 14.5.7 (Maik 25.11.2026, Frage 2): das lange Hefelager (HEFE_LANG_P) als Punkte am Sekt (l.sektP), die Qualität bleibt die des Weinbergs.
    // Der Abzug vom einfachen Hang (13.4.9 bis 14.5.7) ist mit dem Nachtrag zu 14.5 weg, der Sekt steht immer auf der Höhenlage.
    if(h>SEKT_REIFE) neu.sektP=HEFE_LANG_P}
  // Seit 13.4.6: Erlös der Lese für die Warnung des Weingut-Managers.
  {const st=sk?SEKT_GRUND:besteStufe(q); f.leseW=(f.leseW||0)+(st?leseWert(id,la,st,l):0)}
  S.lots.push(neu);
  if(!f.teil) f.boden=Math.max(0,f.boden-4);
  if(p>=1){f.gelesen=true;f.menge=0}else{f.teil=true;f.menge=Math.round(f.menge*(1-p))}
  kompLese(id,l); fx('schere'); geh('keller');
  return neu;
}

function neuHinweis(hat){let alt=null; try{alt=localStorage.getItem(NEU_KEY); localStorage.setItem(NEU_KEY,VERSION)}catch(e){return false} return hat&&alt!==VERSION}
function ideeFertig(){try{localStorage.removeItem(IDEE_KEY)}catch(e){} meldung('Danke für deine Idee!','Jede Idee wird gelesen. Was daraus wird, siehst du bei „Was geplant ist“ und später bei „Was ist neu“.')}
function subNachbar(d){
  const L=SUBS[TAB]; if(!S||!L||S.pruefer) return;
  const i=L.findIndex(s=>s[0]===SUB)+d; if(i<0||i>=L.length) return;
  SUB=L[i][0]; render();
}
