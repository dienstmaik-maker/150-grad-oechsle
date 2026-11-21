// 150 Grad Öchsle: Kern. Rechenregeln, Jahr, Wetter, Speichern. Seit 13.1 eigene Datei, vorher in index.html.
// Lädt nach zahlen.js und vor oberflaeche.js, alle Namen sind global.
'use strict';
for(const [id,[rolle,name,farbe]] of Object.entries(SORTEN_ROLLEN)){const P=ROLLEN[rolle]; SORTEN[id]={name,farbe,rolle,ertrag:P.ertrag,zucker:P.zucker,preis:P.preis,minL:P.minL,maxL:P.maxL,q:P.q,reife:P.reife,...(P.sektStar?{sektStar:true}:{})}}
// rollenAn: Spielt die Partie mit den Rollen? Ohne Spielstand (Titelbild, Neues Spiel) gilt, was ein neues Spiel bekäme.
const rollenAn=()=>S?!!S.rollen:!!ROLLEN_NEU;
// Das Gebiet mit der passenden Sortenliste. neu: true oder false erzwingt die Fassung, ohne Angabe gilt die der laufenden Partie.
const REG=(r,neu)=>(neu??rollenAn())?REGIONEN_ROLLEN[r]:REGIONEN[r];
const gebietText=(r,neu)=>(neu??rollenAn())?{...GEBIET_TEXT[r],lohnt:GEBIET_ROLLEN[r].lohnt,strat:GEBIET_ROLLEN[r].strat}:GEBIET_TEXT[r];
// Seit 11.4: Sorten mit Rolle passen überall gleich gut (1), statt Sternen zeigt das Spiel ihre Rolle.
const eignung=(id,r)=>(SORTEN[id]||{}).rolle?1:(EIGNUNG[r||S.region]||{})[id]||.85;
// Zucker der Sorte im Gebiet: Die beste Sorte startet überall gleich. Die anderen behalten ihren Abzug und liegen mindestens 1° darunter.
// Seit 11.4: Sorten mit Rolle bringen den Zucker ihres Profils mit (ROLLEN), in jedem Gebiet gleich.
const zuckerIm=(id,r)=>SORTEN[id].rolle?SORTEN[id].zucker:eignung(id,r)>=1?0:Math.min(-1,SORTEN[id].zucker);
const eigText=e=>e>=1?'★★★ sehr gut geeignet':e>=.85?'★★ gut geeignet':'★ geht noch';
// Seit 11.4: das Schild einer Sorte. Mit Rolle steht dort die Rolle und was sie kann, sonst die Sterne im Gebiet.
const rolleVon=id=>ROLLEN[(SORTEN[id]||{}).rolle];
// Seit 13.2.2: Schlüssel der Rolle für die Tabellen der Rebpflege, Sorten ohne Rolle rechnen wie die Menge-Sorte.
const rolleK=id=>(SORTEN[id]||{}).rolle||'menge';
// Mengen-Faktor der Rebpflege: Setzling nach Zählerstand, ab Rebstock je Rolle.
const pflegeMenge=(f,id)=>{const st=f.pflSt||0; return st?PFLEGE_MENGE[rolleK(id)][st-1]:SETZ_MENGE[Math.min(SETZ_MENGE.length-1,f.pflZ||0)]};
const pflegeQP=(id,st)=>PFLEGE_QP[rolleK(id)][st||0];
const pflegePreis=(id,st)=>((PFLEGE_PREIS[rolleK(id)]||[])[st||0])||0;
// Seit 13.2.3: Deckel fürs Öchsle eines Weinbergs aus Rolle, Boden-Stufe und Pflegestufe.
function deckel(id){const f=S.felder[id]||{}; return DECKEL_BASIS[rolleK(id)]+BODEN_ST_OE*(S.bodenSt||0)+PFLEGE_ST_OE*(f.pflSt||0)}
// Obergrenze im Monatsmodell: der Deckel, mit Edelfäulnis bei der Spitzen-Sorte 150°.
function oeGrenze(id){const f=S.felder[id]; return f&&f.edel&&rolleK(id)==='spitze'?150:deckel(id)}
const feldId=f=>R().sorten.find(id=>S.felder[id]===f);
// Seit 13.3.2: Freischaltung nach Rang (FREI) und welche Stufen eine Sorte nach ihrer Rolle machen darf (WEIN_ROLLE).
const freiAb=k=>(FREI[k]||{r:0}).r;
// Seit 13.3.4 mit Abstand (ab Jahre nach dem Aufstieg in den Rang r, genau auf den Monat) und Ende (bis).
// Seit 13.5.1 dazu die Pflegestufe der Sorte einer Rolle (pfl), für die Stufen der Leute.
const rolleSorte=rl=>R().sorten.find(id=>(SORTEN[id]||{}).rolle===rl);
function pflFrei(p){const id=rolleSorte(p[0]); return !!id&&((S.felder[id]||{}).pflSt||0)>=p[1]}
function frei(k){const e=FREI[k]; if(!e) return true; if(e.pfl) return pflFrei(e.pfl); if(S.rang<e.r||(e.bis!=null&&S.rang>=e.bis)) return false; if(!e.ab) return true;
  const m=(S.rangMon||{})[e.r]; return m!=null&&S.jahr*12+S.monat>=m+12*e.ab}
// "ab dem Rang Winzer" oder "4 Jahre nach dem Rang Winzermeister", für Texte.
const freiText=k=>{const e=FREI[k]; return e.pfl?`mit der Stufe ${PFLEGE_STUFEN[e.pfl[1]]} der ${ROLLEN[e.pfl[0]].name}`:e.ab?`${e.ab} Jahre nach dem Rang ${rangN(e.r)}`:`ab dem Rang ${rangN(e.r)}`};
// Monat jedes Aufstiegs (S.rangMon, Schlüssel ist der Rang). Springt jemand über einen Rang, gilt für beide derselbe Monat.
function rangMonMerk(von,zu){const M=S.rangMon=S.rangMon||{0:START_JAHR*12}; for(let i=von+1;i<=zu;i++) if(M[i]==null) M[i]=S.jahr*12+S.monat}
// Spielstände aus 13.1 und 13.2 ohne S.rangMon: aus S.zeitRang (Spieljahr des Aufstiegs) oder jetzt. Schon Freies kommt nicht noch einmal in den Winzerboten.
function altFrei(){if(!S.rangMon){const M=S.rangMon={0:START_JAHR*12}; for(let i=1;i<=S.rang;i++){const z=(S.zeitRang||[]).find(x=>x.r===i); M[i]=z?(START_JAHR+z.j-1)*12:S.jahr*12+S.monat}}
  if(!S.freiBote){S.freiBote={}; for(const k of Object.keys(FREI)) if(FREI[k].ab&&frei(k)) S.freiBote[k]=1}}
// Was nach dem Abstand kommt, meldet der Winzerbote einmal.
function freiBote(Z){const B=S.freiBote=S.freiBote||{}; for(const k of Object.keys(FREI)) if(FREI[k].ab&&FREI[k].bote&&!B[k]&&frei(k)){B[k]=1; Z.push(FREI[k].bote)}}
// Seit 13.5.1: Stufen der Erntehelfer und Lagerarbeiter (S.leuteSt). Die höchste freie Stufe zählt, sie bringt die fehlenden mit und fällt nie zurück.
// Mit Stufe 1 kommt der erste Mensch der Gruppe, wenn noch keiner da ist: eingestellt ohne Vermittlung, Lohn wie das Angebot des Monats.
const LEUTE_K=['helfer','lagerarb'];
function leuteSt(k){return (S.leuteSt||{})[k]||0}
function leuteKommen(Z){
  const L=S.leuteSt=S.leuteSt||{helfer:0,lagerarb:0};
  for(const k of LEUTE_K){
    let hoch=0; for(let n=1;n<=3;n++) if(frei(k+n)) hoch=n;
    while((L[k]||0)<hoch){const n=L[k]=(L[k]||0)+1;
      if(n===1&&!S[k]){S[k]=1; S.loehne[k].push(S.angebot[k]); S.loehne[k].sort((x,y)=>x-y); Z.push(LEUTE_ERST[k])}
      Z.push(LEUTE_BOTE[k][n-1])}
  }
}
// Für den Aufstiegstext: Stufen der Leute, die mit dem Rang i kommen (ohne Abstand, die anderen nennt abBringt).
const leuteBringt=i=>LEUTE_K.flatMap(k=>[1,2,3].filter(n=>FREI[k+n].r===i&&!FREI[k+n].ab).map(n=>`${LEUTE_ST[k].name} Stufe ${n}: ${LEUTE_ST[k].kann[n-1]}`));
// Seit 13.5.1: Maschinen kommen über FREI (Schlüssel masch_ und der Typ).
const maschFrei=id=>frei('masch_'+id), maschFreiText=id=>freiText('masch_'+id);
const rolleDarf=(id,st)=>{const rl=id&&SORTEN[id]?SORTEN[id].rolle:null; return !rl||!WEIN_ROLLE[rl]||WEIN_ROLLE[rl].includes(st)};
// Seit 13.2.4: Rebschnitt von Hand. Kosten nach den Hektar der Sorte, möglich von Januar bis April, einmal im Jahr.
const schnittKosten=id=>Math.round(SCHNITT_HA*(S.felder[id].reben||0)/HA_REBEN);
const schnittOffen=id=>{const f=S.felder[id]; return !!f&&f.reben>0&&S.monat<=SCHNITT_BIS&&f.schnitt!==S.jahr};
function schneide(id){zahle(schnittKosten(id)); S.felder[id].schnitt=S.jahr}
const sorteSchild=(id,r)=>rolleVon(id)?`${rolleVon(id).name}: ${rolleVon(id).satz}`:eigText(eignung(id,r));
const sternZahl=(id,r)=>{const e=eignung(id,r); return e>=1?3:e>=.85?2:1};
const sternF=(id,r)=>[0,STERN_PREIS_1,STERN_PREIS_2,STERN_PREIS_3][sternZahl(id,r)];
// Seit 13.2.1: Die Punkte des Bodens kommen nur noch aus seiner Stufe (BODEN_ST_QP je Stufe), bodenQP aus dem Bodenzustand ist weg.
// Der Zustand wirkt weiter auf die Menge und füttert den Zähler: Ein Jahresschnitt ab BODEN_GUT ist ein gutes Bodenjahr.
const bodenText=b=>b>=BODEN_GUT?'sehr gut':b>=80?'gut':'zu mager, Nachdüngen hilft';
// Stufe zu einem Zählerstand: die höchste Schwelle, die der Zähler erreicht hat (Boden und ab 13.2.2 Rebpflege).
const stufeZu=(z,SW)=>{let s=0; for(let i=1;i<SW.length;i++) if(z>=SW[i]) s=i; return s};
// Seit 13.2.6: Satz für den Weinberg aus Stufe s und Zähler z, zum Beispiel "Rebstock, noch 3 gute Jahre bis Premier Cru". Platzhalter, der Wortlaut kommt in 13.8.
const stufeSatz=(s,z,SW,N)=>{if(s>=N.length-1) return `${N[s]}, höchste Stufe`; const r=SW[s+1]-z; return `${N[s]}, noch ${r} ${r===1?'gutes Jahr':'gute Jahre'} bis ${N[s+1]}`};
function rbn(n){return num(Math.round(n*STOCK_F))}
const lohnF=n=>Math.round(n*LOHN_F/10)*10;
// Seit 11.4: mit Rollen in der Reihenfolge der Liste (Menge, Sekt, Spitze), die Eignung ist dort für alle 1. neu wie bei REG.
function sortenFolge(r,neu){r=r||S.region; return REG(r,neu).sorten.slice().sort((a,b)=>eignung(b,r)-eignung(a,r))}
function sorteAb(id,r){return SORTE_RANG[sortenFolge(r).indexOf(id)]??0}
function sorteFrei(id){return S.rang>=sorteAb(id)}
// Seit 12.1 (Maik 20.11.2026): sektRang heißt, der Rang reicht und die Karte Sektkeller ist zu sehen. Sekt machen (sektFrei) geht erst mit eigenem Sektkeller.
function sektRang(){return S.rang>=R_SEKT}
function sektFrei(){return sektRang()&&!!S.sektkeller}
function mgrReife(){return mgrSt('keller')>=3?{rate:MGR_REIFE,min:MGR_REIFE_MIN}:{rate:0,min:0}}
function mgrG(b){return MGR_G[MGR_BEREICHE[b].w?1:0]}
function mgrSt(b){return ((S.manager||{})[b]||{}).stufe||0}
function mgrEintrag(b,st){return MANAGER.find(e=>e.bereich===b&&e.stufe===st)}
function mgrNaechste(b){return mgrEintrag(b,mgrSt(b)+1)}
function mgrAufgabe(k){return MANAGER.find(e=>e.aufgaben.includes(k))}
// aufgabeDa: Der Manager ist auf der Stufe, die die Aufgabe bringt. aufgabeAktiv: dazu ist ihr Schalter an.
function aufgabeDa(k){if(k==='spritzen'&&!schaedAn()) return false; const e=mgrAufgabe(k); return !!e&&mgrSt(e.bereich)>=e.stufe}
// Die Aufgaben einer Stufe für die Anzeige: ohne Schädlinge fehlt das Spritzen (Liste der Stufen, Schalter, Vorstellung des Managers).
function mgrAufg(e){return schaedAn()?e.aufgaben:e.aufgaben.filter(k=>k!=='spritzen')}
function aufgabeAktiv(k){return aufgabeDa(k)&&!!(S.manager[mgrAufgabe(k).bereich].an||{})[k]}
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
// Für den Aufstiegstext: neue Manager und Beförderungen des Rangs i, gleiche Stufen zusammengefasst.
function mgrBringt(i){
  const E=MANAGER.filter(e=>e.rang===i&&!FREI[mgrK(e)].ab), g={};
  for(const e of E.filter(e=>e.stufe>1)) (g[e.stufe]=g[e.stufe]||[]).push(e.bereich);
  const N=b=>MGR_BEREICHE[b].name;
  return [...E.filter(e=>e.stufe===1).map(e=>`${mgrG(e.bereich).ein} ${N(e.bereich)}`),...Object.entries(g).map(([s,n])=>n.length>1?`Stufe ${s} für ${n.map(N).join(' und ')}`:`Stufe ${s} für ${mgrG(n[0]).den} ${N(n[0])}`)];
}
// Was ein Aufstieg bringt: die Freischaltungen des Rangs, höchstens drei. Seit 5.1 (Paket 10) steht der Kreditrahmen als eigener Satz dahinter (rahmenSatz), nur wenn er wächst.
// Seit 7.0 steht {sorte} für die Rebsorte, die mit dem Rang kommt, mit ihrem Namen im Gebiet. Die Manager hängt mgrBringt an.
// Seit 7.2 liefert bringtTeile die einzelnen Punkte für die Urkunde, bringt fügt sie für Zeitung und Rang-Karte zusammen.
// Seit 13.3.4 dazu, was mit Abstand kommt: "in 4 Jahren der Exporthandel".
const abBringt=i=>Object.values(FREI).filter(e=>e.r===i&&e.ab&&e.name).map(e=>`in ${e.ab} Jahren ${e.name}`);
function bringtTeile(i){const n=SORTE_RANG.indexOf(i), id=n>0&&S?sortenFolge()[n]:null; return [...RAENGE[i].neu.replace('{sorte}',`die ${n===1?'zweite':'dritte'} Rebsorte${id?' '+SORTEN[id].name:''}`).split(', '),...abBringt(i),...leuteBringt(i),...kellerBringt(i),...mgrBringt(i)]}
// Seit 8.6: die zweite und dritte Stufe Kellerausbau als eigener Punkt beim Aufstieg. "Ausbaustufe" klein, damit FREI_SYM das Fass zeigt und nicht den Manager.
function kellerBringt(i){return KELLER_RANG.map((r,k)=>k&&r===i?`die ${k===1?'zweite':'dritte'} Ausbaustufe im Keller`:'').filter(Boolean)}
function bringt(i){return bringtTeile(i).join(', ')}
// Version 8.2: der ganze Satzteil nach "bringt", beim Präsidenten "bringt dir den Sieg" statt "bringt: der Sieg".
function bringtSatz(i){return i===R_MAX?'bringt dir den Stuhl im Festsaal':`bringt: ${bringt(i)}`}
// Seit 11.5 (Teil B) hängt daran auch die neue Grenze fürs Land, wenn sie mit dem Rang wächst.
function rahmenSatz(i){const r=RAENGE[i];return (r.rahmen>RAENGE[i-1].rahmen?` Dein Kreditrahmen steigt auf ${eur(r.rahmen)}.`:'')+(HA_NEU&&r.deckel>RAENGE[i-1].deckel?` Als ${rangN(i)} darfst du bis zu ${r.deckel}\u00a0Hektar Land besitzen.`:'')}
const startGeld=s=>(DIFF[s]||{}).geld||START_GELD, bietF=()=>(DIFF[S.schwer]||{}).biet||1;
// Gibt es in dieser Partie Schädlinge? Nur auf Stufen mit schaed:1. Daran hängen Befall, Warnung, Spritzen, der Schalter beim Weingut-Manager und die Seiten im Weinkompendium.
const schaedAn=()=>!!(SCHAED_AN&&S&&(DIFF[S.schwer]||{}).schaed);
function genNr(){return S.gen||1}
function genJahr(n){return START_JAHR+GEN_JAHRE*n}
function erbRest(){const k=S.kredit; return k&&k.erb?Math.min(k.erb,k.rest):0}
function erbSchaetzung(){return Math.max(0,Math.round(vermoegen()*ERB_STEUER/100)*100)}
function exportArt(l){return l.sekt?'sekt':STUFEN[l.stufe].rang>=6?'edel':STUFEN[l.stufe].rang>=4?'spaet':'einfach'}
function exportStufen(){return frei('export')?clamp(S.rang-R_EXPORT+1,1,EXPORT_STUFEN):0}
function mgrAbnutzF(){return MGR_ABNUTZ&&mgrSt('weingut')>=3?1-MGR_ABNUTZ:1}
function mTyp(ma){return MASCH[ma&&MASCH[ma.typ]?ma.typ:ma&&ma.gross?'gross':'klein']}
function pflegeF(z){return PFLEGE.find(p=>z>=p[0])[1]}
// Fahrer-Verteilung: erst die Erntemaschinen (die großen zuerst), dann die Bonus-Maschinen aus dem Rest. Die Abfüllanlage braucht einen Lagerarbeiter.
// h ist die Zahl der Erntehelfer (Vorgabe: die angestellten). Liefert alle Maschinen im Einsatz.
function maschVerteilung(h){
  let frei=h==null?S.helfer:h, lf=S.lagerarb||0; const E=[], ok=S.maschinen.filter(m=>m.zustand>=MASCH_ROT);
  for(const ma of ok.filter(m=>mTyp(m).ernte).sort((a,b)=>mTyp(b).fahrer-mTyp(a).fahrer||b.zustand-a.zustand)){
    const n=mTyp(ma).fahrer; if(frei>=n){frei-=n; E.push(ma)}
  }
  for(const ma of ok.filter(m=>!mTyp(m).ernte)){
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
function abnutz(ma,p){ma.abn=(ma.abn||0)+p*pflegeF(ma.zustand)*mgrAbnutzF(); const d=Math.floor(ma.abn); if(d){ma.abn-=d; ma.zustand=Math.max(MASCH_MIN,ma.zustand-d)}}
// Maschinen, die nur wegen fehlender Leute stillstehen, und wie viele Fahrer (Erntehelfer) ihnen fehlen.
function maschOhneFahrer(){const E=maschVerteilung(); return S.maschinen.filter(m=>m.zustand>=MASCH_ROT&&!E.includes(m))}
function fahrerFehlen(){return Math.max(0,S.maschinen.filter(m=>m.zustand>=MASCH_ROT&&mTyp(m).leute==='helfer').reduce((a,m)=>a+mTyp(m).fahrer,0)-S.helfer)}
function maschName(ma){return `${mTyp(ma).name} ${S.maschinen.indexOf(ma)+1}`}
// Pronomen je Maschine: die Erntemaschine und die Abfüllanlage sind "sie", die anderen "er".
function maschEr(ma){return mTyp(ma).f?'sie':'er'}
function maschStatus(ma){const T=mTyp(ma); return ma.zustand<MASCH_ROT?`fällt aus, bis ${maschEr(ma)} gewartet ist`:maschVerteilung().includes(ma)?'im Einsatz':T.leute==='lagerarb'?'steht still, es fehlt ein Lagerarbeiter':'steht still, es fehlt ein Fahrer'}
function festArt(){return S.rang>=R_HOFFEST?'hoffest':S.rang>=R_WEINFEST?'weinfest':''}
// Seit 11.5 (Teil B): Deckel für den Besitz je Rang. Ohne HA_NEU gibt es für dich keinen, die Gegner halten dann bei GEGNER_HA_MAX.
function haDeckel(r){return HA_NEU?RAENGE[r==null?S.rang:r].deckel:Infinity}
function gegnerDeckel(g){return HA_NEU?RAENGE[g.rang].deckel:GEGNER_HA_MAX}
// Die Regel in einem Satz, für die i-Texte im Rathaus.
function deckelSatz(){const d=haDeckel(); return d===Infinity?'':S.rang>=R_MAX?`Mehr als ${d} Hektar darf im Verband niemand besitzen.`:`Du darfst höchstens ein Viertel mehr Land haben, als der nächste Rang verlangt. Als ${rangN(S.rang)} sind das ${d} Hektar.`}
// Was zum nächsten Rang fehlt, als Satz für die Sperre am Deckel.
function aufstiegFehlt(){
  const n=RAENGE[S.rang+1]; if(!n) return `Mehr als ${haDeckel()} Hektar darf im Verband niemand besitzen.`;
  const f=[], a=n.ans-S.ansehen, h=Math.round((n.ha-flaecheBep())*10)/10, v=n.verm-vermoegen();
  if(a>0) f.push(`${num(a)} Ansehen`); if(h>0) f.push(`${h.toLocaleString('de-DE')} Hektar bepflanzt`); if(v>0) f.push(`${eur(v)} Vermögen`);
  return f.length?`Mehr Land gibt es erst nach dem Aufstieg. Zum Rang ${rangN(S.rang+1)} fehlen dir noch ${f.join(', ').replace(/, ([^,]*)$/,' und $1')}.`:`Mehr Land gibt es nach dem Aufstieg zum Rang ${rangN(S.rang+1)}, der kommt mit dem nächsten Monat.`;
}
// Bei einer Auktion darf nur mitbieten, wessen Besitz samt dem ganzen Los unter den Deckel passt (leer = du darfst).
// Die Spitzenlage ist ausgenommen: Sie kommt nur einmal und darf den Deckel um ihre SPITZE_HA Hektar überschreiten (Annahme von Claude im Plan für 11.5).
function aukDeckel(a){a=a||S.auktion; const d=haDeckel(); if(!a||a.spitze||S.ha+a.ha<=d) return '';
  return `${S.ha>=d?`Du hast ${S.ha}\u00a0Hektar`:`Mit diesem Los hättest du ${S.ha+a.ha}\u00a0Hektar`}, als ${rangN(S.rang)} darfst du höchstens ${d} besitzen. ${aufstiegFehlt()}`}
// Der Makler verkauft, wenn der Spieler den Rang hat, dieses Jahr noch Land für ihn da ist (maklerHa) und ihm für den nächsten Rang allein noch Land fehlt.
// S.maklerN zählt die Hektar im Jahr S.maklerJahr. Alte Spielstände kennen nur das Jahr, dort zählt es als ein Hektar.
function maklerHa(){return HA_NEU?MAKLER_HA[S.rang]||1:1}
function maklerDiesJahr(){return S.maklerJahr===S.jahr?S.maklerN||1:0}
function maklerGrund(){if(S.rang<R_MAKLER) return `Der Makler arbeitet erst für dich ab dem Rang ${RAENGE[R_MAKLER].name}.`; const mh=maklerHa(); if(maklerDiesJahr()>=mh) return `Dieses Jahr hat er dir schon ${mh>1?mh+'\u00a0Hektar':'einen Hektar'} verkauft. Nächstes Jahr wieder.`; const n=RAENGE[S.rang+1]; if(!n||S.ha>=n.ha) return 'Für den nächsten Rang hast du genug Land, da verkauft er dir nichts.'; if(S.ha+1>haDeckel()) return `Als ${rangN(S.rang)} darfst du höchstens ${haDeckel()} Hektar besitzen. ${aufstiegFehlt()}`; if(S.ansehen<n.ans||vermoegen()<n.verm) return 'Dir fehlt für den nächsten Rang nicht nur Land. Erst wenn Ansehen und Vermögen reichen, verkauft er dir einen Hektar.'; return ''}
// Sein Angebot je Rang als Satzteil: "ab Jungwinzer 1 Hektar im Jahr, ab Weingutsbesitzer 2, ab Verbandsvorstand 3".
function maklerStaffel(){const T=[]; for(let i=R_MAKLER;i<R_MAX;i++) if(i===R_MAKLER||MAKLER_HA[i]!==MAKLER_HA[i-1]) T.push(`ab ${RAENGE[i].name} ${MAKLER_HA[i]}${T.length?'':' Hektar im Jahr'}`); return T.join(', ')}

const rnd=(a,b)=>a+Math.random()*(b-a), rint=(a,b)=>Math.floor(rnd(a,b+1)), clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// Seit 11.6 "Schummeln verboten" (Maik 20.11.2026): festes Wetter je Partie. S.zf ist die Startzahl der Partie, fest() macht daraus mit Thema, Nummer, Jahr und Monat
// immer dieselbe Zahl zwischen 0 und 1 (Rechnung wie zufallH in _h.js). Neu laden ändert Wetter, Kälteeinbruch, Vorhersage und Weinberg also nicht.
// Themen: 1 Wetter, 2 Kälteeinbruch (ruht seit 13.4.2), 3 Vorhersage, 4 Edelfäulnis (ruht seit 13.4.2), 5 Öchsle-Streuung, 6 Ertrag, 7 Reben-Sterben, 8 Temperatur,
// 9 Schädlinge (Plan), 10 Schädlinge (Schaden), 11 Herbst-Wagnis (seit 13.4.2). nr trennt Sorten und Würfe im selben Monat.
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
  return fremd||(S.rang>=R_LADEN&&!aufgabeAktiv('regal')&&S.lots.some(ladenOk));
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
function lies(i){const o=roh(i);return o&&o.v13?o:null}
function liesAlt(i){const o=roh(i);return o&&!o.v13?o:null}
// Übernimmt einen gelesenen Spielstand und bringt alte Stände auf den heutigen Stand.
function nimm(o){S=o;if(S.zf==null)S.zf=zfNeu();if(S.helfer==null)Object.assign(S,{helfer:1,lagerarb:1,maschinen:[],kredit:null,mahnung:0,pleite:false});if(!S.gegner)etappe3(2,'mittel');if(!S.kontr)S.kontr={in:rint(24,48),scharf:0};altRang();altEdel();lohnAbgleich();altEhrungen();altMasch();altDoppelt();altSpende();altKeller();altZeit();altAmt();if(!S.fu)S.fu=fuAlt(); else fuPaketB(); altKomp(); altAns(); altLeute(); altRuf(); altSchaed(); altSekt(); altFrei()}
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
  const haengt=R().sorten.map(id=>S.felder[id]).filter(f=>f&&f.menge>0&&!f.gelesen), reben=rebenGesamt();
  const fahrer=S.maschinen.filter(x=>x.zustand>=MASCH_ROT&&mTyp(x).leute==='helfer').reduce((a,x)=>a+mTyp(x).fahrer,0), hand=Math.max(0,...haengt.filter(handFeld).map(handBedarf));
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
function altMasch(){for(const ma of S.maschinen||[]) if(!MASCH[ma.typ]){ma.typ=ma.gross?'gross':'klein'; delete ma.gross}}
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
  if(!o.v13) return meldung('Das geht leider nicht',ALT_SATZ);
  o=saeubern(o);
  // Seit 11.3: Die Sicherung trägt das Album mit (Maik 19.11.2026). Es gehört nicht in den Spielstand und geht ins Album des Geräts.
  const alb=o.album; delete o.album;
  try{localStorage.setItem(KEYS[i],JSON.stringify(o))}catch(e){return meldung('Das hat nicht geklappt','Der Speicher des Browsers ist voll.')}
  const mit=kompAlbumNimm(alb);
  render(); meldung('Geladen',`${o.name} liegt jetzt auf Spielstand ${i+1}.${mit?' Dein Album aus der Datei ist mit dabei.':''}`);
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
function marktF(n){n=Math.max(0,n);const Q=marktFrei(),a=S.absatz||0,f=x=>x<=Q?1:Math.max(MARKT_MIN,1-(1-MARKT_MIN)*(x-Q)/(Q*MARKT_BREIT)); if(n<=0) return f(a); let s=0; for(let i=0;i<40;i++) s+=f(a+n*(i+.5)/40); return s/40}
function R(){return S.rollen?REGIONEN_ROLLEN[S.region]:REGIONEN[S.region]}
// Seit 7.9: zwei Namen und Anrede. S.name ist das Weingut, S.ich der eigene Name, S.anrede 'm' oder 'w'. Bei der Übergabe ersetzt der Erbe beides
// (erbeBenennen). Alte Spielstände ohne S.ich behalten die alten Texte, bis die Namen im Büro nachgetragen sind.
function frau(){return S.anrede?S.anrede==='w':!!(S.erbe&&S.erbe.name&&S.erbe.art==='t')}
const anr=(m,w)=>frau()?w:m;
const rangN=i=>frau()&&RAENGE[i].w||RAENGE[i].name, rangK=i=>frau()&&RAENGE[i].kw||RAENGE[i].kurz;
function famName(){const i=(S.ich||'').trim(); return i.includes(' ')?i.split(/\s+/).pop():''}
function ratte(){const n=S.ratte||1; return n<2?'Frau Öchsle':`Frau Öchsle ${RATTE_ORD[n]||'die '+n+'.'}`}
function rebenGesamt(){return R().sorten.reduce((a,id)=>a+S.felder[id].reben,0)}
// Bepflanzte Hektar mit einer Nachkommastelle. Zählt für deinen Aufstieg, gekaufte Fläche allein reicht nicht.
function flaecheBep(){return Math.round(rebenGesamt()/HA_REBEN*10)/10}
const verlustSpanne=b=>VERLUST.find(v=>b>=v[0]);
// Bodenschnitt des laufenden Jahres: die Monatsenden bisher und der heutige Stand.
function bodenSchnitt(){return Math.round(((S.bodenSum||0)+S.boden)/((S.bodenN||0)+1))}
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
function spOffen(){const r=S.rang; return r>=1&&r<SPENDEN.length&&!spFertig(r)?r:0}
function spBezahlt(){return S.sp&&S.sp.r===S.rang?S.sp.bez:0}
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
function lotName(l){return `${l.jahrgang} ${SORTEN[l.sorte].name}${l.stufe&&!l.sekt?' '+STUFEN[l.stufe].name:''}${l.sekt?'-Sekt':''}${weinZusatz(l)}${l.sekt&&hefeLang(l)?` (${l.hefe} Monate Hefelager)`:''}`}
function rahmen(){return RAENGE[S.rang].rahmen}
// Für Anzeigen (seit Teil D): ein Tabellenwert mit dem Faktor seiner Quelle, so wie ihn ruhm auf Stufe mittel gutschreibt.
function ansQ(n,q){return Math.max(1,Math.round(n*(ANS_F[q]||1)))}
function ruhm(n,still,q){if(n>0)n=Math.max(1,Math.round(n*DIFF[S.schwer].ans*(ANS_F[q]||1)));S.ansehen=Math.max(0,S.ansehen+n);if(S.amt&&n&&!still)stimmung(n>0?n*STIMM_PLUS:n*STIMM_MINUS);return n}
function reifeFaktor(l){const L=lager(l);return l.status==='flasche'?Math.min(4,1+Math.max(0,l.flMonate-L.min)/12*L.rate):1}
function lotWert(l){
  if(l.status==='trauben') return 0;
  if(!l.stufe) return l.liter*2;
  return l.liter*STUFEN[l.stufe].preis*eisF(l)*(1+l.qp/100)*(1+pflegePreis(l.sorte,l.pfl))*reifeFaktor(l)*sektF(l)*sternF(l.sorte)*(l.status==='fass'?.7:1);
}
function vermoegen(){return Math.round(S.geld-(S.kredit?S.kredit.rest:0)+S.ha*LANDWERT+S.maschinen.reduce((a,m)=>a+mTyp(m).preis*.5*m.zustand/100,0)+Math.min(12*marktFrei(),WEIN_WERT*S.lots.reduce((a,l)=>a+lotWert(l),0)))}
function gVerm(g){return Math.round(g.geld-g.kredit+g.ha*LANDWERT)}
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
  if(S.rang<R_LADEN) return;
  let rest=ladenEigen(), n=0, ein=0;
  for(const l of regalWeine().filter(l=>preis(l)>0).sort((a,b)=>preis(b)-preis(a))){
    const p=preis(l), k=Math.min(l.liter,Math.floor(rest/p)); if(k<=0) continue;
    l.liter-=k; rest-=k*p; n+=k; ein+=k*p*LADEN_EIGEN_F; kompVerkauf(l,k);
  }
  S.lots=S.lots.filter(l=>l.liter>0);
  if(n){ein=erloes(Math.round(ein)); kassiere(ein); Z.push(`Deine Weinhandlung hat ${num(n)} Flaschen für ${eur(ein)} verkauft.`)}
}
function ladenPasst(l,r){const w=S.laeden[r].wunsch; return ladenOk(l)&&(w==='sekt'?!!l.sekt:w==='edel'?!l.sekt&&STUFEN[l.stufe].rang>=5:w==='weiss'||w==='rot'?!l.sekt&&SORTEN[l.sorte].farbe===w:!l.sekt&&l.sorte===w)}
function ladenPreis(l,r){return Math.round(preis(l)*LADEN_AUF*100)/100}

/* ================= Wettbewerbe ================= */
function wettRang(){const t=S.wett&&S.wett.typ; return t==='welt'?R_MAX:t==='bund'?R_BUND:R_LAND}
function reifeBonus(l){return Math.min(12,Math.round((reifeFaktor(l)-1)*8))}
function wettFaehig(l){
  const w=S.wett; if(!w||!l||!l.stufe||l.pansch) return false;
  if(w.typ==='land') return !l.sekt&&STUFEN[l.stufe].rang>=3&&l.jahrgang===S.jahr-1&&l.status!=='trauben';
  // Seit 10.1: Bei der Weltweinschau dürfen auch Weine mit Bundes-Medaille antreten, derselbe Wein jedes Jahr wieder (Variante 3).
  return l.status==='flasche'&&!(w.typ!=='welt'&&l.bund)&&(l.sekt||STUFEN[l.stufe].rang>=3)&&l.flMonate>=lager(l).min;
}
// Ausschreibung: Feld der anderen Weingüter. ein ist der eingereichte Wein, zufall die Tagesform der Jury (bleibt beim Tauschen gleich).
function neuerWettbewerb(typ){
  // Seit 10.1: Bei der Weltweinschau treten neun Weingüter aus aller Welt an, die Gegner aus Deutschland nicht.
  if(typ==='welt'){const d=DIFF[S.schwer].feld, namen=misch(WELT_GUETER); S.wett={typ,feld:namen.slice(0,9).map((name,i)=>{const b=i<2?WELT_STARK:WELT_FELD; return {name,p:rint(b[0],b[1])+d}}),ein:null,zufall:rint(-4,4)}; return}
  const d=DIFF[S.schwer].feld, bund=typ==='bund', F=[], namen=misch(GUETER);
  for(let i=0;i<(bund?8:9);i++) F.push({name:namen[i],p:(bund?rint(20,44):i<2?rint(20,34):rint(8,26))+d});
  for(const g of S.gegner) if(bund||g.region===S.region){const t=GEGNER_TYP[g.typ];F.push({name:g.name,ki:g.id,p:rint(t.ws[0],t.ws[1])+Math.round(g.rang*(bund?1.1:.85))+(bund?4:0)+d+(REGIONEN[g.region].wettPlus||0)})}
  S.wett={typ,feld:F,ein:null,zufall:rint(-4,4)};
}
// Punkte eines Weins im laufenden Wettbewerb. Stehen beim Einreichen fest.
function wettPunkte(l){const w=S.wett;return l.qp+(w.typ!=='land'?reifeBonus(l):0)+w.zufall+(R().wettPlus||0)}
// Wertung zu Beginn des Monatswechsels nach der Ausschreibung, das Ergebnis kommt als Thema in die Zeitung.
// Medaille und Qualitätspunkte bekommt der Wein nur, wenn er noch im Keller ist. Ansehen und Preisgeld gibt es immer.
// Weltweinschau: l.welt heißt "hat seine Medaille der Schau schon". Platz 2 und 3 bringen dann nur Ansehen und Preisgeld, der Sieg zählt immer.
function wettAuswerten(){
  const w=S.wett, P=PREISE[w.typ], F=w.feld.map(x=>({...x})), e=w.ein, l=e&&lot(e.id), N=[], name=WETTNAME[w.typ];
  const welt=w.typ==='welt', wo=w.typ==='land'?'bei der Landesprämierung '+WO[S.region]:welt?'bei der Weltweinschau':'beim Bundeswettbewerb';
  if(e) F.push({name:S.name,du:1,p:e.p});
  const schonWelt=!!(welt&&l&&l.welt);
  if(welt&&l) l.welt=true;
  F.sort((a,b)=>b.p-a.p||(b.du||0)-(a.du||0));
  const ich=F.findIndex(x=>x.du);
  let titel='', text='';
  F.forEach((x,i)=>{x.platz=i+1; if(i<3) x.m=P[i].m});
  F.slice(0,3).forEach((x,i)=>{
    const pr=P[i];
    if(x.du){
      const mit=l&&!(schonWelt&&i>0), r=ruhm(pr.ans,0,'Wettbewerbe'), was=`+${r} Ansehen${mit?`, +${pr.qp} Qualitätspunkte`:''}${pr.geld?', '+eur(pr.geld)+' Preisgeld':''}`;
      if(mit){l.qp+=pr.qp; (l.med=l.med||[]).push(`${pr.m} ${name} ${S.jahr}`); if(w.typ==='bund') l.bund=true}
      ehre(pr.m,`${pr.t} ${wo}: ${e.name}`,0,was); kompMedaille(l||e,i);
      if(pr.geld) kassiere(pr.geld);
      if(welt&&i===0){weltSieg(e,was,F); return}
      titel=`${pr.t} für ${S.name}!`;
      text=`${e.name} holt ${pr.t} ${wo}. Das bringt ${was}.${!l?' Der Wein ist schon verkauft, die Ehre bleibt trotzdem.':mit?'':' Seine Medaille der Schau hat der Wein schon von früher.'}`;
      if(i===0&&!welt&&S.gegner.length){const g=S.gegner[rint(0,S.gegner.length-1)]; if(GEGNER_SPRUCH[g.typ]) text+=' '+GEGNER_SPRUCH[g.typ].erfolg(g.name)}
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
  // Seit 10.1: Jede Weltweinschau steht im Amt (S.amt.welt) für die Chronik: Jahr, Platz (0 = nicht angetreten), Wein und Punkte.
  if(welt){
    (S.amt.welt=S.amt.welt||[]).push({j:S.jahr,platz:ich+1,wein:e?e.name:'',p:e?e.p:0});
    if(ich===0) return;
    if(ich<0){titel=`Weltweinschau ${S.jahr}: ${F[0].name} gewinnt im Dorf`; text=`${F[0].name} holt Platz 1 bei der Weltweinschau auf dem Dorfplatz. ${S.name} hat diesmal keinen Wein eingereicht. ${weltAus()?'Es war die letzte Schau vor der Übergabe.':'Nächsten August ist die Schau wieder da.'}`}
    else if(ich>2) text=`${e.name} landet bei der Weltweinschau auf Platz ${ich+1} von ${F.length}. Gewonnen hat ${F[0].name}. ${weltAus()?'Es war die letzte Schau vor der Übergabe.':'Nächsten August kommt die Welt wieder ins Dorf, dann gern auch mit demselben Wein.'}`;
    else text+=` Gewonnen hat ${F[0].name}. ${weltAus()?'Für den Titel hätte es Platz 1 gebraucht, und es war die letzte Schau vor der Übergabe.':'Für den Titel braucht es Platz 1, nächsten August ist die nächste Gelegenheit.'}`;
    return schlag(ich<0?60:84,titel,text,'weltweinschau',{gold:ich>0&&ich<3?1:0,liste:L,wett:{typ:w.typ,platz:ich},du:1});
  }
  schlag(ich<0?42:ich<3?78:72,titel,text,'praemierung',{archiv:1,gold:ich>=0&&ich<3?1:0,liste:L,wett:{typ:w.typ,platz:ich},du:ich>=0&&ich<3?1:0});
}
// Sieg bei der Weltweinschau: Ehrenpräsident, danach gibt es keine Schau mehr. Bild 4 und 5 der Geschichte kommen seit 10.2 auf der Bild-Bühne.
const ehrP=()=>anr('Ehrenpräsident','Ehrenpräsidentin');
function weltSieg(e,was,F){
  const A=S.amt; A.ehren={j:S.jahr,m:S.monat,wein:e.name};
  ehre('🎗️',`${ehrP()} des Weinbauverbands`,0,`Sieg bei der Weltweinschau ${S.jahr} im eigenen Dorf mit ${e.name}.`);
  const L=F.slice(0,3).map(x=>({platz:x.platz,name:x.name,p:x.p,m:x.m||'',du:x.du||0}));
  schlag(100,`Weltweinschau: ${S.name} gewinnt im eigenen Dorf!`,`${e.name} holt Platz 1 bei der Weltweinschau, vor ${F.length-1} Weingütern aus aller Welt. Das bringt ${was}. Über dem Dorfplatz steigt das Feuerwerk auf, und der Weinbauverband ernennt dich${S.ich?', '+S.ich+',':''} ${anr('zum Ehrenpräsidenten','zur Ehrenpräsidentin')}. Den Titel nimmt dir keine Wahl mehr. Du kannst weiterspielen oder das Weingut im Rathaus übergeben, wann du willst.`,'weltweinschau-sieg',{gold:1,sonder:1,du:1,liste:L,wett:{typ:'welt',platz:0}});
  // Seit 10.2 kommen Feuerwerk, Ehrenplatz und die zweite Flasche auf der Bild-Bühne, mit der Urkunde zum Schluss.
  feierWelt('sieg',{wein:e.name,was});
}

function auktionHa(){const r=Math.random();return r<.4?1:r<.73?2:r<.95?3:r<.995?5:10}
function neueAuktion(spitze){
  if(spitze){const B=misch(NACHBARN).slice(0,3).map(n=>({name:n,limit:rint(64,144)*5000})); S.auktion={ha:SPITZE_HA,start:SPITZE_START,schritt:10000,gebot:SPITZE_START,fuehrer:B[rint(0,2)].name,bieter:B,ende:null,text:'',phase:0,spitze:1}; return}
  // Seit 13.4.1: aukPreisF des Gebiets (Rheinhessen) auf Startgebot und alle Gebote, so wird das Land günstiger.
  const pf=R().aukPreisF||1, ha=auktionHa(), start=Math.round(ha*8000*pf/500)*500, B=misch(NACHBARN).slice(0,rint(2,3)).map(n=>({name:n,limit:Math.round(ha*rnd(11000,30000)*pf/500)*500}));
  for(const g of S.gegner) if(g.region===S.region){
    const t=GEGNER_TYP[g.typ];
    // Der Zufall wird immer gezogen, auch wenn der Gegner am Deckel ist und nicht mitbietet.
    const lim=Math.round(Math.min(g.geld+(g.typ==='zocker'?30000:0),ha*rnd(14000,26000)*pf*(1+t.biet*bietF()*.6))/500)*500;
    if(g.ha+ha<=gegnerDeckel(g)) B.push({name:g.name,ki:g.id,limit:lim});
  }
  const offen=B.filter(b=>b.limit>=start);
  S.auktion={ha,start,schritt:Math.max(500,Math.round(start*.1/500)*500),gebot:start,fuehrer:offen.length?offen[rint(0,offen.length-1)].name:null,bieter:B,ende:null,text:'',phase:0};
}
function aukNaechstes(){const a=S.auktion;return a.fuehrer?a.gebot+a.schritt:a.gebot}
function aukLimit(){return S.geld+rahmen()-(S.kredit?S.kredit.rest:0)}
// Der Spieler ist raus oder hat die Auktion verpasst: Die anderen machen es unter sich aus.
function aukOhneDich(){
  const a=S.auktion, B=a.bieter.filter(b=>b.limit>=a.gebot).sort((x,y)=>y.limit-x.limit);
  if(!B.length){a.ende='niemand'; return a.text=`Für den Weinberg mit ${a.ha}\u00a0Hektar ${WO[S.region]} fand sich kein Bieter.`}
  const sieger=B[0], pr=B[1]?Math.max(a.gebot,Math.min(sieger.limit,B[1].limit+a.schritt)):a.gebot;
  a.ende=sieger.name; a.gebot=pr;
  if(sieger.ki!=null){const g=S.gegner[sieger.ki]; g.geld-=pr; g.ha+=a.ha; g.ansehen+=2*(3+Math.min(a.ha,7))*DIFF[S.schwer].ki}
  return a.text=`${sieger.name} bekommt den Zuschlag: ${a.ha}\u00a0Hektar ${WO[S.region]} für ${eur(pr)}.`;
}
// Seit 7.9 für das Rathaus: Wann kann frühestens wieder geboten werden, und wann ist der nächste Wettbewerb?
// Geboten wird im Monat nach der Ankündigung. Steht für diesen Monat nichts an, zählt erst die nächste Ankündigung.
function aukNaechst(){const m=AUK_MONATE.find(m=>m>S.monat); return m==null?`${MON[(AUK_MONATE[0]+1)%12]} ${S.jahr+1}`:`${MON[(m+1)%12]} ${S.jahr+(m===11?1:0)}`}
function wettNaechst(typ){
  if(typ==='land') return `Februar ${S.monat<1?S.jahr:S.jahr+1}`;
  if(typ==='welt') return `August ${S.monat<WELT_MONAT?S.jahr:S.jahr+1}`;
  let j=S.jahr+(S.monat>=5?1:0); while(j%3) j++; return `Juni ${j}`;
}
// Phase 0: angekündigt, nächsten Monat wird geboten. Text für "Das steht an", leer wenn nichts ansteht.
function aukInfo(){const a=S.auktion; return a&&a.phase===0&&S.rang>=R_AUKTION?`🔨 Nächsten Monat Auktion: ${a.ha}\u00a0Hektar, Start bei ${eur(a.start)}${aukDeckel(a)?', für deinen Rang zu groß':''}`:''}
// Ergebnis für den Fuß der Zeitung, im Monat nach dem Bieten.
function aukErgebnis(){
  const a=S.auktion; if(!a.ende) aukOhneDich();
  if(a.ende==='niemand') return `Für den Weinberg mit ${a.ha}\u00a0Hektar ${WO[S.region]} fand sich kein Bieter.`;
  return `Auktion ${WO[S.region]}: ${a.ende==='du'?S.name:a.ende} bekommt ${a.ha}\u00a0Hektar für ${eur(a.gebot)}.`;
}

/* ================= Ereignisse ================= */
// Rund zwei im Jahr, halb gut, halb schlecht. Nur in ruhigen Monaten: kein Wettbewerb, keine Auktion, kein Prüfer und kein großes Thema in der Zeitung.
// Je Ereignis: ok sagt, ob es gerade passen kann, los führt es aus und meldet es mit Wichtigkeit 80 in der Zeitung.
function feldHaengt(){return R().sorten.filter(id=>{const f=S.felder[id];return f.reben&&f.menge>0&&!f.gelesen})}
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
      // g.schaden: Anteil der Ernte, den eine Sabotage im Vorjahr gekostet hat.
      // Schritt 3 (6.0): Das Gebiet wirkt über regionF auf das Einkommen, wie bei dir über Preis, Lese-Menge, Sekt und Sterne.
      const gew=Math.round(g.ha*rnd(t.eink[0],t.eink[1])*st*auf*(1-(g.schaden||0))*regionF(g.region)/100)*100; g.schaden=0;
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
    // Gefälschtes Kellerbuch (Sabotage des Spielers): g.falsch zählt die Monate bis zur Kontrolle beim Gegner.
    if(g.falsch&&--g.falsch<=0){g.falsch=0; g.ansehen=Math.max(0,g.ansehen-40); g.geld-=Math.max(10000,Math.round(g.geld*.15)); neu(6,`Weinkontrolle bei ${g.name}: Im Kellerbuch steht gepanschter Wein. Das kostet Strafe und Ansehen.`)}
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
function leseFaktor(){const b=rebenGesamt();return b?Math.min(1,leistung()/b):1}
// Leute-Regel: Gezählt werden Köpfe. Seit 8.0 zählt eine Maschine nur im Einsatz (Fahrer da, Zustand ab MASCH_ROT), darüber bremst der Zustand nur die Ernteleistung.
// Seit 11.5 (Teil C1) wird in Reben gerechnet: helferReben sagt, für wie viele Reben die Familie, h Erntehelfer und die Maschinen im Einsatz übers Jahr reichen.
function helferReben(h){h=h==null?S.helfer:h; return alleinReben()+h*REBEN_JE_HELFER+maschHelfer(h)*HA_REBEN}
// Erntehelfer, die es ohne Maschinen braucht (nur für die Anzeige).
function helferBedarf(){return Math.max(0,Math.ceil((rebenGesamt()-alleinReben())/REBEN_JE_HELFER))}
// Seit 8.0 (Paket B): Mit der Abfüllanlage im Einsatz betreut ein Lagerarbeiter ABF_FLASCHEN leere Flaschen, sonst FLASCHEN_JE_LAGERARB.
function flJeLager(){return bonusMasch('abfuell')?ABF_FLASCHEN:FLASCHEN_JE_LAGERARB}
// Seit 10.3 (B9): Für die Leute-Sperre zählt ABF_FLASCHEN auch, wenn die Anlage ausgefallen ist. Bei Rot fällt nur der Bonus beim Abfüllen weg.
function flSperre(){return S.maschinen.some(m=>m.typ==='abfuell'&&m.zustand<MASCH_ROT)?ABF_FLASCHEN:flJeLager()}
// Seit 11.5 (Teil C1): so viel Fassraum und so viele leere Flaschen betreuen die Familie und n Lagerarbeiter.
function fassKap(n){return ALLEIN_FASS+(n==null?S.lagerarb:n)*FASS_JE_LAGERARB}
function flKap(n){return ALLEIN_FL+(n==null?S.lagerarb:n)*flJeLager()}
function lagerBedarf(){return Math.max(0,Math.ceil((S.fassraum-ALLEIN_FASS)/FASS_JE_LAGERARB),Math.ceil((S.flaschen-ALLEIN_FL)/flSperre()))}
// Die Leute-Regel als Satz ohne Punkt, für Arbeitsamt, Betrieb, Sperre und den Start. Mit den Zahlen bis 11.4 (ALLEIN_HA 0) liest er sich wie früher.
function haWort(n){return n===1?'Hektar':`${String(n).replace('.',',')} Hektar`}
function helferRegel(){const je=`einen Erntehelfer je ${haWort(REBEN_JE_HELFER/HA_REBEN)} Reben`; return ALLEIN_HA?`Die ersten ${ALLEIN_HA} Hektar Reben schaffst du mit deiner Familie allein, darüber brauchst du das ganze Jahr ${je}`:`Du brauchst das ganze Jahr ${je}`}
function lagerRegel(fl){const was=`${num(FASS_JE_LAGERARB)}\u00a0l Fassraum und ${num(fl||FLASCHEN_JE_LAGERARB)} leere Flaschen`; return ALLEIN_FASS||ALLEIN_FL?`${num(ALLEIN_FASS)}\u00a0l Fassraum und ${num(ALLEIN_FL)} leere Flaschen betreust du selbst, jeder Lagerarbeiter schafft ${was} dazu`:`Ein Lagerarbeiter betreut ${was}`}
// Abfüllen (von Hand und beim Kellermeister): mit der Abfüllanlage ABF_PLUS mehr Flaschen aus dem Fass, dafür so viele leere Flaschen.
// Die Anlage nutzt sich je ABF_NORM Flaschen um ABF_ABN Prozentpunkte ab, mal Pflege-Faktor.
function abfFl(l){return bonusMasch('abfuell')?Math.round(l.liter*(1+ABF_PLUS)):l.liter}
function fuelleAb(l){const ma=bonusMasch('abfuell'), n=abfFl(l); S.flaschen-=n; l.liter=n; l.status='flasche'; l.flMonate=0; if(ma) abnutz(ma,ABF_ABN*n/ABF_NORM); return n}
// Düngen (von Hand und beim Weingut-Manager): mit dem Düngerstreuer im Einsatz billiger und mehr Boden, er nutzt sich je Düngung um STREU_ABN ab.
function duengKosten(){return Math.round(DUENGER_HA*S.ha*(bonusMasch('duenger')?1-STREU_RABATT:1))}
function duengPlus(){return bonusMasch('duenger')?STREU_PLUS:DUENG_PLUS}
function duenge(){const ma=bonusMasch('duenger'), p=duengPlus(); zahle(duengKosten()); S.duengungen++; S.boden=Math.min(100,S.boden+p); if(ma) abnutz(ma,STREU_ABN); return p}
function leuteFehlen(){return {helfer:helferFehlen(),lagerarb:Math.max(0,lagerBedarf()-S.lagerarb)}}
// "Es fehlen 2 Erntehelfer und 1 Lagerarbeiter" oder leer, wenn niemand fehlt. Seit 8.0 mit dem Hinweis auf Fahrer, wenn Maschinen stillstehen.
function fehlText(){
  const f=leuteFehlen(), t=[];
  if(f.helfer) t.push(`${f.helfer} Erntehelfer${maschOhneFahrer().length?' (auch als Fahrer für deine Maschinen)':''}`);
  if(f.lagerarb) t.push(`${f.lagerarb} Lagerarbeiter`);
  return t.length?`${f.helfer+f.lagerarb===1?'Es fehlt':'Es fehlen'} ${t.join(' und ')}`:'';
}
// Seit 13.4.1: handLohnF des Gebiets (Mosel) auf den Lohn der Erntehelfer, sie lesen von Hand.
function neuesLohnAngebot(){S.angebot={};for(const k of LOHN_ARTEN) S.angebot[k]=Math.round(rint(LOHN_MIN/10,LOHN_MAX/10)*LOHN_F*(spLohn(3)?SP_LOHN:1)*(k==='helfer'?R().handLohnF||1:1))*10}
function lohnSumme(k){return S.loehne[k].reduce((a,b)=>a+b,0)}
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
const ansZuschlag=l=>(ANS_PFLEGE[l.pfl||0]||0)+((l.bst||0)>=NAME_BODEN_AB?ANS_TERROIR:0);
function sektAnmelden(l){if(l.pansch||S.sektJahr===S.jahr) return 0; S.sektJahr=S.jahr; return ruhm(SEKT_ANS+ansZuschlag(l),0,'Weine')}
const sektSorte=id=>!!S.rollen&&(SORTEN[id]||{}).rolle==='sekt';
// Sekt, der noch auf der Hefe liegt, für den Sektkeller.
const sektAufHefe=()=>S.lots.filter(l=>l.sekt&&l.status==='flasche'&&l.flMonate<lager(l).min);
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
  const segen=m===8&&S.spSegen; if(segen){S.spSegen=0; if(reg.sorten.some(id=>S.felder[id].menge>0&&!S.felder[id].gelesen)) L.push(`Erntedank-Segen: Deine Trauben bekommen diesen Monat ${SP_SEGEN}° Öchsle extra.`)}
  // Seit 13.4.2: Im Dezember richtet sich das Wetter nach dem Frost-Wagnis, wenn ein Feld darauf wartet (wagnisWetter).
  if(m===11) wagnisWetter();
  const w=S.wetter;
  if(w==='sonnig'&&m>=5&&m<=9) S.sonne++;
  for(const [si,id] of reg.sorten.entries()){
    const f=S.felder[id], so=SORTEN[id]; if(!f.reben) continue;
    if((m===3||m===4)&&w==='frost'){f.frostF=.7; L.push(`Spätfrost schädigt die Blüte beim ${so.name}.`)}
    // Seit 13.2.2: statt der Jungreben der Mengen-Faktor der Rebpflege (pflegeMenge).
    if(m===5) f.menge=Math.round(f.reben*pflegeMenge(f,id)*so.ertrag*(reg.ertragF||1)*(.6+.4*S.boden/100)*(1+BODEN_ST_MENGE*(S.bodenSt||0))*f.frostF*festR(.9,1.1,fest(6,si,S.jahr,m)));
    // Seit 13.2.3: Das Wetter-Öchsle zählt höchstens bis zur Grenze des Weinbergs (oeGrenze: Deckel, Edelfäulnis der Spitzen-Sorte bis 150°).
    if(m===6){f.oe=Math.min(oeGrenze(id),OE_START+zuckerIm(id)+wbonus(w)+festI(-2,2,fest(5,si,S.jahr,m))+(S.spitze?SPITZE_OE:0)); f.reif=5; f.ueber=0; f.plus=0}
    if(m>=7&&f.menge>0&&!f.gelesen){
      // f.plus merkt den Öchsle-Zuwachs des Monats für die Infoseite.
      const vor=f.oe;
      f.oe=Math.min(oeGrenze(id),f.oe+OE_PLUS[m-7]+wbonus(w)+festI(-2,2,fest(5,si,S.jahr,m))+(segen?SP_SEGEN:0)); f.plus=f.oe-vor;
      f.reif=clamp([35,70,92,100,100][m-7]+(w==='sonnig'?5:w==='regen'?-5:0),0,100);
      f.ueber=clamp([0,5,20,45,70][m-7]+(w==='sonnig'?5:0)+(f.edel?EDEL_UEBER:0),0,100);
      if(m===9&&w==='regen') f.menge=Math.round(f.menge*.9);
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
const herbstTend=(j=S.jahr)=>TENDENZEN[Math.min(TENDENZEN.length-1,Math.floor(herbstJahr(j).uTend*TENDENZEN.length))];
// Chance des Wegs w (edel oder frost) im Gebiet r im Jahr j, 0 wenn der Weg dort zu ist. Das Rang-Schloss prüft wegeOffen.
function wegChance(w,r=S.region,j=S.jahr){
  const g=REGIONEN[r].weg; let p=0;
  if(g==='beide') p=herbstTend(j).weg===w?WAGNIS.mitTend:WAGNIS.gegenTend;
  else if(g===w) p=WAGNIS.eigen;
  else if(herbstFremd(j)) p=WAGNIS.fremd;
  return Math.min(1,p*WAGNIS_F);
}
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
function wagnisChance(id){
  const f=S.felder[id], m=S.monat; if(!wagnisFeld(id)||!(f.menge>0)||f.gelesen||f.gefroren) return null;
  if(f.wagnis==='edel') return m===10&&frei('weg_tba')?Math.min(1,WAGNIS.tba*WAGNIS_F):null;
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
  const I=R().sorten, W=I.filter(feldWartet); if(!W.length) return null;
  const w=W.reduce((a,id)=>a+feldErloes(id),0), ges=I.reduce((a,id)=>a+feldErloes(id)+(S.felder[id].leseW||0),0);
  return ges>0&&w>MGR_WARN*ges?{ids:W,anteil:w/ges}:null;
}
// f.wagnis: edel (Edelfäulnis ist da), frost (wartet auf Frost im Dezember), aus (vorbei, das Feld hängt wie jedes andere).
function herbstWagnis(id,f,so,m,L){
  const H=herbstJahr(), w=feldWeg(id);
  if(m===10){
    if(w==='edel'&&!f.wagnis){
      if(H.uEdel<wegChance('edel')){f.wagnis='edel'; f.edel=true; f.oe=Math.min(150,Math.max(f.oe,R().min.ba)); f.ueber=clamp(f.ueber+EDEL_UEBER,0,100); L.push(`Edelfäulnis beim ${so.name}! Die Trauben haben jetzt ${f.oe}° Öchsle, genug für eine Beerenauslese. Lies sie von Hand, nur überreife Trauben.`)}
      else wagnisWeg(f,so,'edel',L);
    }else if(w==='frost'&&!f.wagnis){f.wagnis='frost'; L.push(`Der ${so.name} hängt weiter und wartet auf Frost im Dezember.`)}
    return;
  }
  if(f.wagnis==='frost'){
    if(H.uFrost<wegChance('frost')){f.gefroren=true; L.push(`Frost! Der ${so.name} hängt gefroren am Stock. Eiswein ist möglich, lies ihn diesen Monat.`)}
    else wagnisWeg(f,so,'frost',L);
    return;
  }
  // Seit 13.4.5: Die Beerenauslese wagt ab R8 die zweite Stufe, ohne den Rang verfault sie wie alles andere.
  if(f.wagnis==='edel'&&frei('weg_tba')){
    if(H.uTba<Math.min(1,WAGNIS.tba*WAGNIS_F)){f.oe=Math.max(f.oe,R().min.tba); L.push(`Die edelfaulen Beeren vom ${so.name} sind zu Rosinen eingetrocknet: ${f.oe}° Öchsle, genug für eine Trockenbeerenauslese. Lies sie diesen Monat von Hand, nur überreife Trauben.`)}
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
  if(!R().sorten.some(id=>{const f=S.felder[id]; return f.reben&&f.menge>0&&!f.gelesen&&f.wagnis==='frost'})) return;
  const w=herbstJahr().uFrost<wegChance('frost')?'frost':S.wetter==='frost'?'mild':S.wetter;
  if(w!==S.wetter){S.wetter=w; S.temp=tempFuer(11,w,fest(8,0,S.jahr,11))}
}
function feldReset(f){Object.assign(f,{oe:0,plus:0,menge:0,reif:0,ueber:0,edel:false,edelGeprueft:false,gelesen:false,teil:false,gefroren:false,frostF:1,wagnis:0,weg:null,leseW:0})}

const schaedSpaet=()=>SCHAED_SPAET_IN.includes(S.region)?SCHAED_SPAET:0;
// Erstes Spieljahr je Schädling, gezählt ab 0 (40 heißt: mit der zweiten Generation).
function schaedJahr(a){
  if(a==='wickler') return S.schaedAb&&S.schaedAb.wickler!=null?S.schaedAb.wickler-START_JAHR:Infinity;
  const J=a==='mehltau'?MEHLTAU_JAHR:KIRSCH_JAHR;
  return festI(J[0],J[1],fest(9,a==='mehltau'?1:2,0,0))+schaedSpaet();
}
function schaedDa(){return schaedAn()?Object.keys(SCHAED).filter(a=>S.jahr-START_JAHR>=schaedJahr(a)):[]}
// Die Menge-Sorten des Gebiets. Ohne Rollen (alte Spielstände) gilt die Sorte mit dem größten Ertrag.
function mengeSorten(){const s=R().sorten, M=s.filter(id=>SORTEN[id].rolle==='menge'); return M.length?M:[s.slice().sort((a,b)=>SORTEN[b].ertrag-SORTEN[a].ertrag)[0]]}
function schaedKann(a){return a!=='kirsch'||mengeSorten().some(id=>S.felder[id]&&S.felder[id].reben>0)}
const spritzKosten=()=>Math.max(SPRITZ_HA,Math.round(flaecheBep()*SPRITZ_HA/50)*50);
// Läuft gerade eine Warnung? Dann kann gespritzt werden, solange b.gespritzt fehlt.
function schaedWarn(){const b=S.schaed; return schaedAn()&&b&&b.j===S.jahr&&b.warn&&!b.da?b:null}
function spritze(){zahle(spritzKosten()); S.schaed.gespritzt=1; S.spritzN=(S.spritzN||0)+1}
// Ein Satz je Schädling für das i im Weinberg und fürs Weinkompendium, die Zahlen kommen aus den Konstanten.
function schaedRegel(a){
  const pz=P=>`${Math.round(P[0]*100)} bis ${Math.round(P[1]*100)}\u00a0%`;
  return {wickler:`Der Traubenwickler kommt im ${MON[SCHAED.wickler.warn+1]} und kostet auf ${WICKLER_FELDER[0]} bis ${WICKLER_FELDER[1]} Feldern ${pz(WICKLER_P)} der Trauben.`,
    mehltau:`Der Falsche Mehltau kommt im ${MON[SCHAED.mehltau.warn+1]}, öfter in Jahren mit Regen zwischen Mai und Juli, und kostet auf allen Feldern ${pz(MEHLTAU_P)} der Trauben.`,
    kirsch:`Die Kirschessigfliege kommt im ${MON[SCHAED.kirsch.warn+1]} und kostet die Menge-Sorte ${KIRSCH_OE[0]} bis ${KIRSCH_OE[1]}° Öchsle, wenn sie noch hängt. Früher lesen hilft, kostet aber auch Öchsle.`}[a];
}
const spritzRegel=()=>`Das Weinbauamt warnt einen Monat vorher im Winzerboten. Spritzen kostet ${eur(SPRITZ_HA)} je Hektar Reben, geht nur im Monat der Warnung und halbiert den Schaden.`;
function schaedWarnText(b){
  const T=SCHAED[b.art], ms=aufgabeAktiv('spritzen');
  const was={wickler:'fliegt der Traubenwickler, seine Raupen bohren sich in die jungen Beeren',
    mehltau:`zeigen die Blätter helle Ölflecken, der Falsche Mehltau geht um${b.regen?'. Der Regen macht es ihm leicht':''}`,
    kirsch:`sticht die Kirschessigfliege die reifen Beeren an. Am liebsten mag sie dünne Schalen, bei dir also den ${mengeSorten().map(id=>SORTEN[id].name).join(' und den ')}`}[b.art];
  return `Das Weinbauamt meldet: In den Nachbarorten ${was}. Nächsten Monat ist ${T.er} wohl auch bei dir. Spritzen kostet ${eur(spritzKosten())} und halbiert den Schaden${b.art==='kirsch'?', früher lesen hilft auch':''}. ${ms?`Dein ${MGR_BEREICHE.weingut.name} spritzt beim Weiterblättern, wenn das Geld reicht.`:'Gespritzt wird im Weinberg, aber nur diesen Monat.'}`;
}
// Der Befall im Monat nach der Warnung. Gespritzt bleibt vom Schaden SPRITZ_F.
function schaedBefall(b,Z){
  const T=SCHAED[b.art], g=b.gespritzt?SPRITZ_F:1, H=feldHaengt(), G=S.schaedGes=S.schaedGes||{}, erst=!G[b.art], u=fest(10,9);
  const namen=F=>F.map(id=>SORTEN[id].name).join(' und ');
  b.da=1; G[b.art]=(G[b.art]||0)+1; S.schaedLetzt={art:b.art,m:S.monat,j:S.jahr};
  let F=H, t;
  if(b.art==='kirsch') F=mengeSorten().filter(id=>H.includes(id));
  if(b.art==='wickler') F=H.map((id,i)=>[fest(10,1+i),id]).sort((x,y)=>x[0]-y[0]).slice(0,festI(WICKLER_FELDER[0],WICKLER_FELDER[1],fest(10,0))).map(x=>x[1]);
  if(!F.length){Z.push(b.art==='kirsch'?`${T.sym} Die Kirschessigfliege war da, aber dein ${namen(mengeSorten())} war schon gelesen. Glück gehabt.`:`${T.sym} ${T.name} im Ort, bei dir hing aber nichts am Stock.`); return}
  if(b.art==='kirsch'){
    const d=Math.ceil(festI(KIRSCH_OE[0],KIRSCH_OE[1],u)*g);
    for(const id of F){const f=S.felder[id]; f.oe=Math.max(0,f.oe-d); f.plus=(f.plus||0)-d}
    t=`Die Kirschessigfliege hat beim ${namen(F)} die reifen Beeren angestochen. Was nach Essig riecht, muss raus, das kostet ${d}° Öchsle.`;
  }else{
    const P=b.art==='wickler'?WICKLER_P:MEHLTAU_P, p=festR(P[0],P[1],u)*g, pz=String(Math.round(p*1000)/10).replace('.',',');
    for(const id of F){const f=S.felder[id]; f.menge=Math.round(f.menge*(1-p))}
    t=b.art==='wickler'?`Die Raupen des Traubenwicklers haben sich in deine Trauben gebohrt. Beim ${namen(F)} sind ${pz}\u00a0% der Trauben hin.`
      :`Der Falsche Mehltau hat Blätter und junge Trauben befallen. ${F.length>1?'Auf allen Feldern':`Beim ${namen(F)}`} sind ${pz}\u00a0% der Trauben hin.`;
  }
  schlag(80,`${T.name} im Weinberg`,`${t} ${b.gespritzt?'Weil gespritzt war, ist es nur halb so schlimm gekommen.':'Mit Spritzen wäre es nur halb so schlimm gekommen.'}${erst?' '+SCHAED_FAMILIE[b.art]:''}`,erst?b.art:'',{du:1,...(erst?{foto:1}:{})});
}
// Läuft jeden Monat nach dem Wachstum: freischalten, im April planen, warnen, Befall.
function schaedMonat(Z){
  if(!schaedAn()) return;
  const m=S.monat;
  if(S.rang>=WICKLER_RANG&&!(S.schaedAb&&S.schaedAb.wickler!=null)) (S.schaedAb=S.schaedAb||{}).wickler=S.jahr+schaedSpaet();
  const D=schaedDa();
  if(D.length&&S.schaedNext==null) S.schaedNext=S.jahr+festI(1,2,fest(9,3,S.jahr,0));
  if(m===3&&S.schaedNext!=null&&S.jahr>=S.schaedNext){
    const K=D.filter(schaedKann);
    if(K.length){
      const G=S.schaedGes||{}, regen=[4,5,6].filter(n=>wuerfelWetter(n,fest(1,0,S.jahr,n))==='regen').length;
      let art=K.find(a=>!G[a]);
      if(!art){const W=K.map(a=>a==='mehltau'?1+regen:1); let u=fest(9,4,S.jahr,0)*W.reduce((a,x)=>a+x,0); art=K[K.length-1]; for(let i=0;i<K.length;i++){u-=W[i]; if(u<0){art=K[i]; break}}}
      S.schaed={j:S.jahr,art,regen};
      S.schaedNext=S.jahr+festI(SCHAED_PAUSE[0],SCHAED_PAUSE[1],fest(9,0,S.jahr,0));
    }
  }
  const b=S.schaed; if(!b||b.j!==S.jahr||b.da) return;
  const T=SCHAED[b.art];
  if(m===T.warn){
    if(!rebenGesamt()){S.schaed=null; return}
    b.warn=1; schlag(70,`Weinbauamt warnt vor ${T.dem}`,schaedWarnText(b),'amt',{du:1});
  }else if(m===T.warn+1&&b.warn) schaedBefall(b,Z);
}
// Alte Spielstände: Wer den Weingut-Manager schon auf Stufe 2 hat, bekommt die neue Aufgabe Spritzen eingeschaltet dazu. Auf Einfach und Mittel bleibt der Eintrag ohne Wirkung.
function altSchaed(){const w=(S.manager||{}).weingut; if(w&&w.stufe>=2){w.an=w.an||{}; if(!('spritzen' in w.an)) w.an.spritzen=1}}

/* ================= Weinstufen ================= */
function mindest(st){const m=R().min; return (st==='feder'||st==='eis')?m.tafel:m[st]}
// q = {oe, leseart, edel, eis}
function pruefeQualitaet(st,q){
  const g=[], d=STUFEN[st], min=mindest(st);
  // Seit 13.3.2: die zwei Schlösser. Die Rolle muss die Stufe machen dürfen und der Rang muss reichen, der Deckel wirkt schon übers Öchsle.
  if(!rolleDarf(q.sorte,st)) g.push(`${d.name} gibt es nicht von der ${ROLLEN[SORTEN[q.sorte].rolle].name}`);
  else if(!frei('wein_'+st)) g.push(`${d.name} erst ab dem Rang ${rangN(freiAb('wein_'+st))}`);
  if(q.oe<min) g.push(`es fehlen ${min-q.oe}° Öchsle (Minimum ${min}°)`);
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
function eisStufe(oe){const m=R().min; return oe>=m.tba?2:oe>=m.ba?1:0}
const eisF=l=>l.stufe==='eis'?EIS_WERT[l.eisW||0].f:1;
// Name der Stufe für die Lese-Hilfe, beim Eiswein mit seiner Wertstufe.
const stufeText=(st,oe)=>STUFEN[st].name+(st==='eis'?` (Öchsle einer ${EIS_WERT[eisStufe(oe)].name})`:'');
// Seit 13.4.2: auch gefrorene Trauben liest die Hand, wie früher, als es Eiswein nur mit Edelfäulnis gab.
const handFeld=f=>!!(f.edel||f.gefroren);
const handBedarf=f=>Math.max(0,Math.ceil((f.reben-alleinReben())/HAND_REBEN));
const handFehlt=f=>handFeld(f)&&S.helfer<handBedarf(f)&&maschEinsatz().length>0;
const handlese=f=>handFeld(f)&&!handFehlt(f);
// Seit 13.2.3: Auch die überreife Lese (+5°) bleibt unter der Grenze des Weinbergs.
function feldQ(f,la){const id=feldId(f); return {oe:Math.min(id?oeGrenze(id):150,f.oe+(la==='ueber'?5:0)),leseart:la,edel:f.edel,eis:f.gefroren,masch:handFehlt(f)?1:0,sorte:id}}
// Abnutzung bei der Lese (8.0): reben ist der Teil der Lese, den die Maschinen schaffen, M ihre Ernteleistung zusammen. Auslastung reben/M (höchstens 1),
// je Maschine ABNUTZ_VOLL mal Auslastung mal Pflege-Faktor nach dem Zustand vor der ersten Lese des Jahres (ma.lj, ma.lz). Bruchteile sammelt ma.abn.
function maschAbnutzung(reben,M){
  const a=Math.min(1,reben/M);
  for(const ma of maschEinsatz()){
    if(ma.lj!==S.jahr){ma.lj=S.jahr; ma.lz=ma.zustand}
    ma.abn=(ma.abn||0)+ABNUTZ_VOLL*a*pflegeF(ma.lz)*mgrAbnutzF(); const d=Math.floor(ma.abn);
    if(d){ma.abn-=d; ma.zustand=Math.max(MASCH_MIN,ma.zustand-d)}
  }
}
// Version 4.4: ungefährer Listenwert einer Lese als Flaschenwein der Stufe st, ohne Reife und Marktlage.
function leseWert(id,la,st,liter){const q=feldQ(S.felder[id],la), pfl=S.felder[id].pflSt||0, qp=qpFuer({sorte:id,oe:q.oe,sonne:S.sonne,boden:S.boden,bst:S.bodenSt||0,pfl,laub:S.laubJahr===S.jahr},st);
  return Math.round(liter*STUFEN[st].preis*(st==='eis'?EIS_WERT[eisStufe(q.oe)].f:1)*(1+qp/100)*(1+pflegePreis(id,pfl))*sternF(id)*(R().preisF||1)/100)*100}
function feldLiter(f,la){const r=f.reif/100,u=f.ueber/100; return Math.round(f.menge*r*(la==='reif'?1-u:la==='ueber'?u*MOST_UEBER:1-u+u*MOST_UEBER)*leseFaktor())}
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
  // Seit 7.0 (Schritt E) zählt der Kellermeister auf Stufe 3 wie ein Stück Kellerausbau dazu (mgrReife, bis Schritt H neutral).
  const so=SORTEN[l.sorte], mr=mgrReife(), K=(S.keller||0)+mr.min, rf=so.reife*(1+KELLER_REIFE*(S.keller||0)+mr.rate)*(R().reifeF||1);
  if(l.stufe==='feder') return {min:0,max:3,rate:0};
  if(l.stufe==='tafel'||l.stufe==='qba') return {min:2,max:Math.max(24,Math.round(so.maxL/3)),rate:rf/2};
  if(l.stufe==='eis') return {min:Math.max(1,Math.round(so.minL*1.5)-K),max:Infinity,rate:rf};
  return {min:Math.max(1,so.minL-K),max:so.maxL,rate:rf};
}
// Ein Weinskandal drückt alle Preise, eine Mode im Ausland hebt eine Sorte. S.lage={typ,f,rest,sorte}.
function lageF(l){const g=S.lage; return !g?1:g.typ==='mode'?(l.sorte===g.sorte?g.f:1):g.f}
function preis(l){
  if(l.status!=='flasche') return 0;
  const L=lager(l); if(l.flMonate<L.min) return 0;
  const alter=Math.min(4,1+(l.flMonate-L.min)/12*L.rate);
  // Seit 13.2.2: Preisbonus der Rebpflege bei der Spitzen-Sorte (pflegePreis), sonst 0.
  return Math.round(STUFEN[l.stufe].preis*eisF(l)*(1+l.qp/100)*(1+pflegePreis(l.sorte,l.pfl))*alter*S.markt*lageF(l)*sektF(l)*sternF(l.sorte)*(R().preisF||1)*100)/100;
}

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
for(const id of Object.keys(SORTEN)) kompWissen('sorte_'+id,'sorte',SORTEN[id].name,()=>{
  const so=SORTEN[id], rl=Object.keys(KOMP_ROLLE_SIEGEL).find(r=>kompRollen()[r]===id), sg=rl&&(rl!=='sekt'||S.rollen)?' '+KOMP_ROLLE_SIEGEL[rl]:'';
  return `${so.farbe==='weiss'?'Weißwein':'Rotwein'}, ${rolleVon(id)?`die ${rolleVon(id).name} im Gebiet ${R().name}`:`im Gebiet ${R().name} ${eigText(eignung(id))}`}. Als Prädikatswein reift er mindestens ${Math.max(1,so.minL-(S.keller||0))} Monate in der Flasche und hält bis zu ${Math.round(so.maxL/12)} Jahre.${so.sektStar?` Als Sekt bringt er ${Math.round((SEKT_STAR-1)*100)} % mehr als andere Sorten.`:''}${sg}`});
function kompSektText(){
  const so=kompRollen().sekt;
  return `Sekt macht ab dem Rang ${RAENGE[R_SEKT].name} die ${ROLLEN.sekt.name}, direkt bei der Lese im eigenen Sektkeller, ohne Grundwein. Sektflasche, Korken und Agraffe kosten ${eur2(sektKosten())} je Flasche. Er ruht ${SEKT_REIFE} Monate auf der Hefe, mit ${HEFE_LANG} Monaten bekommt er ${HEFE_LANG_QP} Qualitätspunkte mehr.${S.rollen?` Aus dem ${SORTEN[so].name} wird der Regional-Sekt, er bringt noch einmal ${Math.round((SEKT_STAR-1)*100)} % mehr.`:''} Bei Wettbewerben tritt Sekt erst ab dem Bundeswettbewerb an.`;
}
// Wissens-Seiten: Geschichte und die Zeile "Im Spiel", ohne Siegel. Die Kennungen aus 11.1 bleiben, neu ist helferweg.
for(const r of Object.keys(REGIONEN)) kompWissen('gebiet_'+r,'gebiet',REGIONEN[r].name,()=>`${REGIONEN[r].text} ${r===S.region?'Hier steht dein Weingut.':`So spielt es sich in einer Partie ${WO[r]}.`}`);
kompWissen('spitze','gebiet','Spitzenlage',()=>`Die beste Lage weit und breit: ${SPITZE_HA} Hektar Steilhang in voller Südsonne. Wem sie gehört, dessen Trauben starten jeden Juli mit ${SPITZE_OE}° Öchsle mehr. Unter den Hammer kommt sie ab dem Rang ${RAENGE[R_SPITZE].name}.`);
for(let k=1;k<=KELLER_PREISE.length;k++) kompWissen('keller'+k,'technik',KELLER_NAMEN[k-1],
  ()=>`Stufe ${k} im Kellerausbau. Kostet ${eur(KELLER_PREISE[k-1])} und geht ab dem Rang ${RAENGE[KELLER_RANG[k-1]].name}. Prädikatsweine und Eiswein sind damit ${k} ${k===1?'Monat':'Monate'} früher verkaufsreif, und jeder Wein gewinnt beim Reifen schneller an Wert.`);
// Seit 12.1: der Sektkeller mit der Flaschengärung als kleine Geschichte (KOMP_TEXT.sektkeller).
kompWissen('sektkeller','technik','Sektkeller',()=>`Kostet einmal ${eur(SEKTKELLER_PREIS)} und geht ab dem Rang ${RAENGE[R_SEKT].name}. Ohne ihn gibt es keinen Sekt. Sektflasche, Korken und Agraffe kosten ${eur2(SEKT_KOSTEN)} je Flasche, mit der ${SEKT_ANLAGE_NAME} ab dem Rang ${RAENGE[R_SEKT_ANLAGE].name} (${eur(SEKT_ANLAGE_PREIS)}) die Hälfte. Bei der Lese der ${ROLLEN.sekt.name} wählst du ${SEKT_REIFE} oder ${HEFE_LANG} Monate auf der Hefe, lang bringt ${HEFE_LANG_QP} Qualitätspunkte mehr.${S.sektkeller?` Dein Sektkeller steht${S.sektAnlage?', mit Anlage':''}.`:''}`);
kompWissen('reife','technik','Reife in der Flasche',()=>'In der Flasche gewinnt ein Wein mit jedem Jahr an Wert, höchstens bis zum Vierfachen. Wie schnell das geht und wie lange er hält, hängt an der Rebsorte und am Kellerausbau.');
kompWissen('zuckern','technik','Zuckern und Wässern',()=>`Zucker hebt die Öchsle im Most, Wasser streckt die Menge, beides um höchstens ${ZUCKER_MAX} %. Bis ${ZUCKER_ERLAUBT} % ist das beim Tafelwein erlaubt. Alles andere ist Panscherei und ein Fall für den Weinprüfer.`);
for(const id of Object.keys(MASCH)) kompWissen('masch_'+id,'technik',MASCH[id].name,
  ()=>{const T=MASCH[id]; return `${T.bonus?MASCH_BONUS[id]():`Schafft ${rbn(T.leist)} Reben bei der Lese und deckt übers Jahr ${T.helfer} Hektar Reben ab`}. Zu kaufen ${maschFreiText(id)} für ${eur(T.preis)}.`});
kompWissen('hagel','gefahr','Hagel',()=>'Zwischen Juni und September kann ein Unwetter einen Teil der Trauben zerschlagen, die noch am Stock hängen.');
kompWissen('spaetfrost','gefahr','Spätfrost',()=>'Friert es im April oder Mai noch einmal, leidet die Blüte, und die Ernte des Jahres fällt kleiner aus.');
kompWissen('kaelte','gefahr','Das Wagnis im Herbst',()=>`Wer die Spitzen-Sorte über Oktober hängen lässt, wagt den Weg seines Gebiets. Jeder Monat kostet ${Math.round((1-WARTEN_MENGE)*100)} % Menge, und klappt es nicht, ist die Ernte des Feldes weg, zum Beispiel durch einen Kälteeinbruch im November.`);
kompWissen('skandal','gefahr','Weinskandal',()=>'Ein Skandal im Land drückt ein paar Monate lang alle Weinpreise. Danach ist erst einmal Ruhe.');
kompWissen('kontrolle','gefahr','Weinkontrolle',()=>'Der Prüfer kommt unangemeldet, im Schnitt alle drei Jahre. Findet er gepanschten Wein, wird der vernichtet, es gibt Strafe, und fünf Jahre lang kommt er jedes Jahr wieder.');
kompWissen('maschine','gefahr','Maschinenschaden',()=>`Ein Schaden kostet eine Maschine auf einen Schlag viel Zustand. Unter ${MASCH_ROT} % fällt sie aus, bis sie gewartet ist.`);
kompWissen('helferweg','gefahr','Erntehelfer über alle Berge',()=>`Trifft nur, wer einem Erntehelfer höchstens ${eur(lohnF(LOHN_BILLIG))} im Monat zahlt. Dann verschwindet der billigste Helfer über Nacht und nimmt 5 bis 10 % aus der Kasse mit, mindestens ${eur(2000)} und höchstens ${eur(30000)}.`);
// Seit 11.6: die drei Schädlinge. Ihre Seiten erscheinen nur auf Schwer und erst, wenn der Schädling zum ersten Mal da war (kompSeiten). Es sind Wissens-Seiten ohne Siegel,
// die Zähler im Weinkompendium (kompZahlen, kompIds) stimmen also mit und ohne sie.
for(const a of Object.keys(SCHAED)) kompWissen(a,'gefahr',SCHAED[a].name,()=>`${schaedRegel(a)} ${spritzRegel()}`);
kompWissen('regeln','stufe','Reifezeit und Regeln',()=>{
  const so=R().sorten, reife=f=>so.map(id=>`${SORTEN[id].name} ${f(SORTEN[id].minL)} Monate`).join(', ');
  return `<b>⏳ Reifezeit in der Flasche bis zum Verkauf</b><br>Tafel- und Qualitätswein: 2 Monate.<br>Kabinett bis Trockenbeerenauslese: ${reife(x=>Math.max(1,x-(S.keller||0)))}.<br>Eiswein: ${reife(x=>Math.max(1,Math.round(x*1.5)-(S.keller||0)))}.${S.keller?`<br>Dein ausgebauter Keller kürzt das schon um ${S.keller} ${S.keller===1?'Monat':'Monate'}.`:''}`
    +`<br><br><b>📜 Gut zu wissen</b><br>Jeder Wein liegt mindestens einen Monat im Fass, höchstens sieben.<br>Ab Kabinett und beim Eiswein darfst du erst im Januar nach der Lese anmelden.<br>Überreife Trauben bringen 5° mehr Öchsle.<br>${edelRegel()}.${S.rollen?'':' Am häufigsten trifft sie die Sorte, die am besten ins Gebiet passt.'} Dann gibt es von dem Feld kein Kabinett und keine Spätlese mehr.<br>Kälteeinbruch im November: im Schnitt jedes vierte Jahr, die Vorhersage warnt meist davor.<br>${frostText()}, nur dann gibt es Eiswein.<br>Bei der Lese zeigt jede Leseart, ab wann der Wein verkaufsfertig ist.`;
});
// Die Edelfäulnis ist keine Gefahr, sie ist ein Gütezeichen (Maik 19.11.2026). Ihre Seite steht deshalb bei den Stufen.
kompWissen('edel','stufe','Edelfäulnis',()=>`${edelRegel()}. Dann reicht der Zucker für eine Beerenauslese. Kabinett und Spätlese gibt es von dem Feld dann nicht mehr.`)
// Was eine Stufe braucht, mit den Hürden des eigenen Gebiets (früher die Zeilen im Weinlexikon).
function kompStufeText(st){
  const m=R().min, d=STUFEN[st];
  if(st==='feder') return `Ab ${m.tafel}° Öchsle, jede Leseart. Nur im Monat nach der Lese anmelden und abfüllen, gleich verkaufbar, hält 3 Monate. Der Weinhändler nimmt ihn in jeder Menge zum vollen Preis, schnelles Geld für den Notfall. Reich wird damit keiner.`;
  if(st==='eis') return `Ab ${m.tafel}° Öchsle, nur gefrorene Trauben der Dezember-Lese, ${LESE.reif} oder ${LESE.ueber}, nicht gemischt. Nur im Januar anmelden. Die Öchsle bestimmen den Wert wie bei Auslese (ab ${m.aus}°), Beerenauslese (ab ${m.ba}°) oder Trockenbeerenauslese (ab ${m.tba}°).`;
  return `Ab ${mindest(st)}° Öchsle, ${d.lese?LESE[d.lese]:'jede Leseart'}${d.edel===true?', mit Edelfäulnis':d.edel===false?', ohne Edelfäulnis':''}.`;
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
  if(kap==='stufe') return [...kompIds(kap),'edel','regeln'];
  if(kap==='gebiet') return ['gebiet_'+S.region,'spitze',...Object.keys(REGIONEN).filter(r=>r!==S.region).map(r=>'gebiet_'+r)];
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
/* ---- Haken im Spiel ---- */
function kompLese(id,liter){if(KOMP['sorte_'+id]) kompE('sorte_'+id).l=(kompE('sorte_'+id).l||0)+liter}
// Verkauf auf jedem Weg (Großhandel, Weinhandlungen, eigenes Regal, Daueraufträge): Jede Flasche zählt einmal, beim Sekt oder bei ihrer Stufe,
// aber nur, wenn sie aus der Sorte des Eintrags stammt. In Spielständen ohne Rollen zählt beim Sekt jeder Sekt. Gepanschter Wein zählt nie.
function kompVerkauf(l,n){
  if(!l||!(n>0)||l.pansch) return;
  const so=kompRollen();
  if(l.sekt){if(!S.rollen||l.sorte===so.sekt) komp('sekt',{f:n}); return}
  const rl=KOMP_STUFE_ROLLE[l.stufe]; if(rl&&l.sorte===so[rl]) komp('stufe_'+l.stufe,{f:n});
}
// Wettbewerb. w ist der Wein oder die Einreichung (sorte, stufe, sekt), platz 0 bis 2. Es zählt nur die Goldmedaille, also Platz 1 (Maik 19.11.2026),
// und nur bei Auslese bis Eiswein der Spitzen-Sorte und beim Sekt. Eine Goldmedaille bringt nie Bronze, sie wird gemerkt, bis Silber da ist.
function kompMedaille(w,platz){
  if(!w||!w.sorte||platz!==0) return;
  const so=kompRollen();
  if(w.sekt){if(!S.rollen||w.sorte===so.sekt) komp('sekt',{gm:1}); return}
  if(KOMP_STUFE_ROLLE[w.stufe]==='spitze'&&w.sorte===so.spitze) komp('stufe_'+w.stufe,{gm:1});
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
  const reg=REG(NEU.region,!!ROLLEN_NEU);
  S={v:1,v13:1,zf:zfNeu(),name:NEU.name.trim().slice(0,NAME_MAX)||'Rebenreich',ich:(NEU.ich||'').trim().slice(0,30),anrede:NEU.anrede==='w'?'w':'m',region:NEU.region,jahr:2027,monat:0,geld:startGeld(NEU.schwer),ha:3,boden:80,bodenSt:0,bodenZ:0,duengungen:0,
    felder:{},fassraum:6000,flaschen:3000,lots:[],nextId:1,wetter:'kalt',wetterNext:'kalt',prognose:'kalt',sonne:0,markt:1,ansehen:0,ansV:1,leuteV:1,
    jahrEin:0,jahrAus:0,edel33:1,bericht:null,helfer:ALLEIN_HA?0:1,lagerarb:ALLEIN_FASS?0:1,maschinen:[],kredit:null,ehrungen:[],ehrZeig:0,meilen:0,mahnung:0,pleite:false,kontr:{in:rint(24,48),scharf:0},fu:fuNeu(),zeit:0,zeitAb:0,zeitRang:[],rangMon:{0:START_JAHR*12},freiBote:{},komp:{},kompV:3,v121:1,ein:{f:[]},...(ROLLEN_NEU?{rollen:1}:{})};
  for(const id of reg.sorten){S.felder[id]={reben:0,pflSt:0,pflZ:0}; feldReset(S.felder[id])}
  etappe3(3,NEU.schwer);
  lohnAbgleich();
  neuePrognose();
  TOP=[]; FUSS=[];
  schlag(100,'Willkommen auf deinem Weingut',`${S.ich?`${S.ich} übernimmt ${S.name} ${WO[S.region]}: 3 Hektar kahler Weinberg, leere Fässer und ${eur(S.geld)}.`:`${S.name} ${WO[S.region]} startet mit 3 Hektar kahlem Weinberg, leeren Fässern und ${eur(S.geld)}.`} Bis März ist Pflanzzeit, im Weinberg pflanzt du deinen ${SORTEN[sortenFolge()[0]].name}. Die zweite und dritte Rebsorte bringt der Aufstieg. Neue Reben starten als Setzling und tragen erst wenig.`,'weingut-01-sommer',{du:1});
  // Seit 10.3 (Frage 11): Mit Spielführer fallen die zwei Artikel weg, die der alte Winzer im ersten Monat selbst sagt.
  if(!(S.fu&&S.fu.an)) schlag(50,'So kommst du herum','Unten wählst du Weingut, Kellerei oder Stadt, die Leiste darüber bringt dich zu den Orten. Wischen übers Bild geht auch. Ein Punkt am Reiter zeigt Neues oder Dringendes, ein Tipp aufs Geld öffnet deinen Stand mit Kasse und Rängen. Das kleine i oben rechts in jedem Fenster erklärt, was du dort tust. Spielstände, Ton und das Buch liegen im Büro.');
  if(!(S.fu&&S.fu.an)) schlag(40,'Leute für Weinberg und Keller',`${helferRegel()}. ${lagerRegel()}. Leute findest du beim Arbeitsamt in der Stadt, der Lohn dort schwankt jeden Monat, wer eingestellt ist, behält seinen. Fehlen dir Leute, geht es nicht in den nächsten Monat.`,'arbeit');
  schlag(30,'Die Konkurrenz schläft nicht','Deine Gegner: '+S.gegner.map(g=>`${g.name}, ${GEGNER_TYP[g.typ].art}, ${WO[g.region]}`).join('; ')+`. Alle wollen auf den großen Stuhl im Weinbauverband, und es passt immer nur einer darauf. Alle ${GEN_JAHRE} Jahre übernimmt bei allen die nächste Generation.`);
  dorf('n0');
  S.bericht=zeitung([],[],[]);
  // Version 7.7: Der Spielstart ist selbst eine Feier: Bühne mit der Geschichte, Kaufvertrag, dann die erste Ausgabe vom Winzerboten.
  S.feier={start:1,von:0,zu:0}; FSTUFE=0;
  START=null; TAB='feier'; save(); render();
}

/* ================= Monatswechsel ================= */
function verfallListe(){
  const v=[];
  for(const l of S.lots){
    if(l.status==='trauben') v.push(`${num(l.liter)}\u00a0l ${SORTEN[l.sorte].name}-Trauben sind nicht gekeltert${l.mgrNot&&aufgabeAktiv('keltern')?(l.mgrNot==='geld'?`, dein ${MGR_BEREICHE.keller.name} kauft keinen Fassraum unter deiner Geldgrenze`:`, deinem ${MGR_BEREICHE.keller.name} fehlen Lagerarbeiter für mehr Fassraum`):''}`);
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
// Seit 10.1 (Spielende, Paket 2): Mit Amt (Präsident oder Altpräsident) ist die nächste Übergabe die letzte, danach endet das Spiel mit der Chronik (spielEnde).
// Mindestzeit: Steht der Generationswechsel vor dem Ende der AMT_MIN-ten Amtszeit an, wartet die Familie bis zum ersten Januar nach dieser Wahl.
// endeMonat() ist dieser letzte Januar als Monats-Nummer. Ankündigung und Hinweis ziehen mit. Erbschaftssteuer gibt es beim Ende nicht, danach kommt nichts mehr.
function endeMonat(){
  const gen=GEN_JAHRE*genNr()*12, w=S.amt.seit+AMT_MIN*WAHL_JAHRE*12;
  return Math.max(gen,(Math.floor(w/12)+1)*12);
}
const endeJahr=()=>START_JAHR+endeMonat()/12;
function generationAmt(Z){
  const e=endeMonat(), nr=monatNr(), gen=GEN_JAHRE*genNr()*12, kind=' Im Rathaus kannst du auch früher übergeben.';
  if(nr>=e) return spielEnde('gen');
  if(nr===e-GEN_VORAUS*12) schlag(68,`In ${GEN_VORAUS} Jahren übergibst du ${S.name}`,`Die Jahre am Hang hinterlassen Spuren. Im Januar ${endeJahr()} übergibst du das Weingut an dein Kind. Für dich ist es die letzte Übergabe: Wer an der Spitze des Verbands stand, schreibt danach nur noch die Chronik. Erbschaftssteuer fällt dabei nicht an.${S.amt.ehren?'':S.amt.brief?' Ohne den Sieg bei der Weltweinschau wird es das gute Ende, nicht das beste.':` Für das beste Ende braucht es den Sieg bei der Weltweinschau, und für die fehlt noch ${!keyDorf()&&!keyVerband()?'jeder der zwei Schlüssel':!keyDorf()?'der Schlüssel „Dorf“':'der Schlüssel „Verband“'}.`} Bis dahin bleibt Zeit für alles, was du noch vorhast.${weltOffen()?' Die Weltweinschau im August zum Beispiel.':''}`,GEN_BILD.uebergabe,{du:1});
  else if(nr===e-12) Z.push(`👪 Nächsten Januar übergibst du ${S.name} an dein Kind. Damit endet die Partie mit der Chronik.${weltOffen()?' Im August ist noch einmal Weltweinschau.':''}`);
  else if(nr===gen&&e>gen) schlag(64,'Die Familie wartet',`Eigentlich wäre jetzt die nächste Generation dran. ${amtAlt()?'Aber die Familie lässt dir noch eine Wahl, um den Stuhl zurückzuholen.':`Aber ${anr('einen Präsidenten','eine Präsidentin')} holt man nicht mitten in der Arbeit vom Hof: Die Familie wartet mit der Übergabe bis zum Januar nach deiner zweiten Wahl.`} Übergeben wird im Januar ${endeJahr()}.${kind}`,GEN_BILD.uebergabe,{du:1});
}
function generationMonat(Z){
  if(S.monat!==0) return;
  if(S.amt) return generationAmt(Z);
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
  const wahl=a=>a[rint(0,a.length-1)];
  const rat=S.rang>=2?(S.ratte=(S.ratte||1)+1):0;
  S.erbe={ratte:rat,k:S.flascheAuf?'offen':n===1?'g2':n===2?'g3':'weiter',offen:1,name:'',art:Math.random()<.5?'t':'s',vt:wahl(ERB_NAMEN.t),vs:wahl(ERB_NAMEN.s),steuer,kredit:kr,verm:v,ansVor,ans:S.ansehen};
  schlag(97,`${S.name} in neuen Händen`,`Zum Jahreswechsel geht das Weingut ${WO[S.region]} an die ${n+1}. Generation. Erbschaftssteuer: ${eur(steuer)}${kr?`, davon ${eur(kr)} als Kredit bei der Bank`:''}. Vom Ansehen bleiben ${pz(ea)}, jetzt ${num(S.ansehen)}.${ea>ERB_ANSEHEN?` ${anr('Der Ehrenbürger','Die Ehrenbürgerin')} geht in den Ruhestand, das ganze Dorf zieht den Hut.`:''} Rang, Fläche, Keller, Wein und alle Leute bleiben.`,GEN_BILD.uebergabe,{gold:1,erbe:1,du:1});
  if(window.BOT) erbeBenennen(S.erbe.art==='t'?S.erbe.vt:S.erbe.vs);
}
const endeFeier=()=>!!(S.feier&&S.feier.welt==='ende');
function endeText(){
  const best=S.ende.art==='best', fl=S.flascheAuf;
  const P=best?[`Auf dem Küchentisch liegen der alte Kellerschlüssel${fl?', die leere Flasche vom ersten Jahrgang':''} und die volle vom Siegerwein der Weltweinschau.`,`„Den Schlüssel kannst du benutzen“, sagst du zu deinem Kind. „${fl?'Die leere bleibt, wo sie ist. Und die volle':'Und die Flasche'} ...“`,'„Ich weiß. Noch nicht.“']
    :fl?['Auf dem Küchentisch liegen der alte Kellerschlüssel und die leere Flasche vom ersten Jahrgang.','„Die ist ja leer“, sagt dein Kind.','„Die war nie zum Trinken da.“']
    :['Auf dem Küchentisch liegt der alte Kellerschlüssel.','„Den kannst du jetzt benutzen“, sagst du zu deinem Kind. „Den Rest findest du im Keller.“'];
  if(S.ende.alt&&!best) P.push('Auf dem Stuhl im Festsaal sitzt inzwischen jemand anderes. Aber wer ihn erreicht hat, steht in jeder Chronik.');
  if(nfName()) P.push(`Es übernimmt: ${nfName()}.`);
  return P;
}
// Seit 11.7 (A24): der Nachfolger nach der letzten Übergabe. S.ende.nf: {offen, art 't' oder 's', Vorschläge vt und vs, name, voll mit Familienname}.
const nfOffen=()=>!!(S&&S.ende&&S.ende.nf&&S.ende.nf.offen);
function nfVorschlag(){const f=S.ende.nf; return f.art==='s'?f.vs:f.vt}
function nfName(){const f=S&&S.ende&&S.ende.nf; return f&&!f.offen&&f.name?`${f.voll||f.name}, ${f.art==='s'?'der Sohn':'die Tochter'}`:''}
function nfBenennen(name){const f=S.ende.nf, fam=famName(); f.name=name; f.voll=(fam&&!name.includes(' ')?name+' '+fam:name).slice(0,40); f.offen=0}
function spielEnde(wie){
  const n=genNr(), alt=S.erbe||{}, best=amtEhre(), ab=amtAlt();
  (S.chronik=S.chronik||[]).push({n,name:S.ich||alt.name||'',art:S.anrede?(S.anrede==='w'?'t':'s'):alt.art||'',von:genJahr(n-1),bis:S.jahr,rang:S.rang,ans:S.ansehen,verm:vermoegen(),steuer:0,kredit:0,ende:1,...(ab?{alt:1}:{}),...(best?{ehr:1}:{})});
  S.ende={art:best?'best':'gut',wie,j:S.jahr,m:S.monat,stand:endStand(),...(ab?{alt:1}:{})};
  S.ende.platz=bestenEintrag();
  // Seit 11.7 (A24): Wer das Weingut nach der letzten Übergabe bekommt, wählst du vor dem Küchentisch wie bei jeder Übergabe (zeigeNachfolger).
  S.ende.nf={offen:1,art:Math.random()<.5?'t':'s',vt:ERB_NAMEN.t[rint(0,ERB_NAMEN.t.length-1)],vs:ERB_NAMEN.s[rint(0,ERB_NAMEN.s.length-1)],name:''};
  if(window.BOT) nfBenennen(nfVorschlag());
  // Seit 10.2 kommt das Gespräch am Küchentisch auf der Bild-Bühne (S.feier.welt 'ende'), danach die Chronik. Der Winzerbote meldet nur noch die Übergabe.
  S.wett=null; S.auktion=null; S.feier={welt:'ende'};
  if(wie==='gen') schlag(100,best?`${S.name}: Die Übergabe am Küchentisch`:`${S.name} geht in neue Hände`,`Zum Jahreswechsel übergibt ${S.ich||anr('der '+duN(),'die '+duN())} das Weingut an die nächste Generation. Damit schließt sich nach ${jahreTxt(S.ende.stand.jahre)} ${WO[S.region]} der Kreis für ${S.name}.${spLohn(SPENDEN.length-1)?` ${anr('Der Ehrenbürger','Die Ehrenbürgerin')} geht in den Ruhestand, das ganze Dorf zieht den Hut.`:''} Am Küchentisch wartet schon dein Kind, danach kommt die Chronik.`,ENDE_BILD[S.ende.art],{gold:1,sonder:1,du:1,schluss:1});
}
function erbeOffen(){return !!(S&&S.erbe&&S.erbe.offen)}
function erbeVorschlag(){const e=S.erbe; return e.art==='s'?e.vs:e.vt}
function erbeBenennen(name){
  const e=S.erbe, fam=famName(); e.name=name; e.offen=0;
  // Seit 7.9: Der Erbe ersetzt den eigenen Namen (Vorname mit dem Familiennamen) und bestimmt die Anrede.
  S.anrede=e.art==='t'?'w':'m'; if(S.ich) S.ich=(fam&&!name.includes(' ')?name+' '+fam:name).slice(0,40);
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
const eisEigen=()=>S.monat===11&&R().sorten.some(id=>S.felder[id].gefroren&&S.felder[id].menge>0);
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
  const Z=[], weg=verfallListe(); let uz=0, steuer=0;
  TOP=[]; FUSS=[];
  // Hoffest und Manager-Berichte aus dem alten Monat kommen in diese Ausgabe. Beim Hoffest zählt das Wetter des Festmonats.
  if(S.fest){
    const w=S.fest.w, f=HOFFEST_WETTER[w]||1, F=FESTE[S.fest.art||'hoffest'], n=F.name, a=ruhm(Math.round(festAns(F)*f),0,'Feste');
    const T={sonnig:'Bei strahlender Sonne kamen Hunderte Gäste',mild:'Bei mildem Wetter kamen viele Gäste',regen:'Im Regen kamen nur wenige Gäste',kalt:'Bei kühlem Wetter blieben einige Gäste zu Hause',frost:'Bei klirrender Kälte blieben einige Gäste zu Hause'};
    schlag(65,f>1?`Rauschendes ${n} bei ${S.name}`:f<.8?`${n} bei ${S.name} fällt ins Wasser`:`${n} bei ${S.name}`,`${T[w]||T.mild}, es gab Musik, ${S.fest.art==='weinfest'?'Zwiebelkuchen':'Flammkuchen'} und deinen Wein. Das ganze Dorf redet davon: +${a} Ansehen.`,f<.8?'hoffest-regen':'hoffest'); S.fest=null;
  }
  // Seit 11.5 (Teil C1): Der Winzerbote erklärt alten Spielständen einmal die neue Leute-Regel.
  if(S.leuteNeu){const n=S.leuteNeu, weg=[n.h&&`${n.h} Erntehelfer`,n.l&&`${n.l} Lagerarbeiter`].filter(Boolean).join(' und ');
    // Seit Teil D: derselbe Artikel erklärt auch das verdoppelte Ansehen, die Löhne und den Deckel für die Fläche.
    // Maik 20.11.2026: gekürzt, die Lager-Regel und die Begründung für den Deckel stehen nur noch im Buch.
    const dk=haDeckel(), dkT=dk<Infinity?` Als ${rangK(S.rang)} darfst du höchstens ${dk} ha Land besitzen${S.ha>dk?', was du schon darüber hast, behältst du':''}.`:'';
    schlag(60,'Neue Regeln für dein Weingut',`Der Weinbauverband hat neue Regeln. Ansehen zählt jetzt doppelt${S.ansehen?`, du hast ${num(S.ansehen)}`:''}, Präsident wird man mit ${num(RAENGE[RAENGE.length-1].ans)}.${dkT} Leute verdienen rund ${eur(lohnF(LOHN_START))} im Monat, Manager ${eur(lohnF(MGR_LOHN[0]))} bis ${eur(lohnF(MGR_LOHN[MGR_LOHN.length-1]))}. ${helferRegel()}.${weg?` ${weg} ${n.h+n.l===1?'ist':'sind'} deshalb ohne Abfindung gegangen.`:''} Deine Manager kommen jetzt mit dem Rang von selbst und steigen mit dir auf.${n.m?' Wer noch gefehlt hat, hat sich schon vorgestellt.':''}`,'arbeit'); S.leuteNeu=null}
  if(S.mgrLog){const T=['weingut','keller'].filter(b=>(S.mgrLog[b]||[]).length).map(b=>`Dein ${MGR_BEREICHE[b].name} meldet: ${S.mgrLog[b].join(', ')}.`); if(T.length) schlag(15,'Aus dem Gutsbüro',T.join(' '))}
  S.mgrLog=null;
  if(S.dauerLog&&S.dauerLog.length) Z.push(`📋 ${mgrG('handel').Dein} ${MGR_BEREICHE.handel.name}: ${S.dauerLog.join(', ')}.`);
  S.dauerLog=null;
  if(S.leuteLog&&S.leuteLog.length) Z.push(`🧑‍🌾 Deine Leute: ${S.leuteLog.join(', ')}.`);
  S.leuteLog=null;
  if(SPRUNG.length){Z.unshift(...SPRUNG); SPRUNG=[]}
  // Der Wettbewerb aus dem Vormonat wird jetzt gewertet, das Ergebnis steht in dieser Ausgabe.
  if(S.wett){if(!S.wett.fertig) wettAuswerten(); S.wett=null}
  if(weg.length){Z.push('Verdorben: '+weg.join('; ')+'.')}
  S.lots=S.lots.filter(l=>!(l.status==='trauben'||(l.status==='fass'&&(l.stufe==='feder'||l.fassMonate>=7))||(l.status==='flasche'&&l.flMonate>=lager(l).max)));
  for(const l of S.lots){if(l.status==='fass')l.fassMonate++; else if(l.status==='flasche')l.flMonate++}
  const K=kosten(); zahle(K.basis+K.loehne+K.zins); S.geld-=K.tilgung;
  if(S.kredit){S.kredit.rest-=K.tilgung; if(S.kredit.erb) S.kredit.erb=Math.max(0,S.kredit.erb-K.tilgung); if(S.kredit.rest<=0){S.kredit=null; Z.push('Dein Kredit ist abbezahlt.')}}
  if(S.geld<0){uz=Math.round(-S.geld*.01); zahle(uz)}
  // Für den Bodenschnitt zählt der Stand am Monatsende. S.nass merkt den Regenmonat für den Hinweis im Weinberg.
  S.bodenSum=(S.bodenSum||0)+S.boden; S.bodenN=(S.bodenN||0)+1;
  S.nass=S.wetter==='regen'?S.monat:null;
  S.monat++;
  S.boden=Math.max(0,S.boden-(S.nass!=null?BODEN_REGEN:BODEN_MONAT));
  if(S.monat>11){
    const ein=S.jahrEin, aus=S.jahrAus, gew=ein-aus;
    let jb=`Einnahmen ${eur(ein)}, Ausgaben ${eur(aus)}, ${gew>=0?'Gewinn':'Verlust'} ${eur(Math.abs(gew))}.`;
    // Seit 8.2: Spenden senken den Gewinn vor der Steuer, höchstens um SP_DECKEL (spAbzug).
    const spJ=S.spJahr||0, abz=spAbzug(gew);
    if(gew>0){steuer=Math.round((gew-abz)*STEUER); jb+=` Die positive Bilanz bringt +${ruhm(4)} Ansehen.${abz?` Deine Spenden senken den Gewinn um ${eur(abz)}.`:''} Steuer auf den Gewinn: ${eur(steuer)}.`}
    if(spJ&&!abz) jb+=` Gespendet hast du ${eur(spJ)}, ohne Gewinn senkt das keine Steuer.`;
    schlag(50,`Jahresbilanz ${S.jahr}: ${gew>=0?'Gewinn':'Verlust'} von ${eur(Math.abs(gew))}`,jb,'amt',{archiv:1});
    S.monat=0; S.jahr++; S.jahrEin=0; S.jahrAus=0; S.spJahr=0; S.duengungen=0; S.sonne=0; zahle(steuer);
    // Reben-Abnutzung: je Sorte ein gewürfelter Anteil aus der Spanne des Bodenschnitts, Frost kommt obendrauf. S.verlust merkt die Zahlen für Aktuelles.
    const schnitt=Math.round(S.bodenSum/S.bodenN), sp=verlustSpanne(schnitt), fp=frostPlus(), rebVor=rebenGesamt(); let totAlle=0;
    // Seit 13.2.1: Boden-Zähler. Ein Jahresschnitt ab BODEN_GUT zählt +1, sonst bleibt er stehen. Die Stufe fällt nie.
    if(schnitt>=BODEN_GUT) S.bodenZ=(S.bodenZ||0)+1;
    {const st=Math.max(S.bodenSt||0,stufeZu(S.bodenZ||0,BODEN_SCHWELLE)); if(st>(S.bodenSt||0)){S.bodenSt=st; Z.push(`🌱 Dein Boden ist jetzt ${BODEN_STUFEN[st]}.`)}}
    S.verlust={};
    for(const [si,id] of R().sorten.entries()){
      const f=S.felder[id]; feldReset(f);
      // Seit 13.2.2: Rebpflege-Zähler der Sorte. Bis Ende April des abgelaufenen Jahres geschnitten (f.schnitt) zählt PFLEGE_GUT, sonst PFLEGE_PATZER zurück.
      if(f.reben){
        const vor=f.pflSt||0; f.pflZ=f.schnitt===S.jahr-1?(f.pflZ||0)+PFLEGE_GUT:Math.max(0,(f.pflZ||0)-PFLEGE_PATZER); f.pflSt=stufeZu(f.pflZ,PFLEGE_SCHWELLE);
        if(f.pflSt>vor) Z.push(`✂️ Dein ${SORTEN[id].name} ist jetzt ${PFLEGE_STUFEN[f.pflSt]}.`);
        else if(f.pflSt<vor) Z.push(`✂️ Dein ${SORTEN[id].name} fällt auf ${PFLEGE_STUFEN[f.pflSt]} zurück, er wurde nicht rechtzeitig geschnitten.`);
      }
      if(f.reben){const tot=Math.min(f.reben,Math.round(f.reben*(festR(sp[1],sp[2],fest(7,si))+fp)/1000)*10); if(tot){f.reben-=tot; S.verlust[id]=tot; totAlle+=tot}}
    }
    if(totAlle) Z.push(`Zum Jahreswechsel sind ${String(Math.round(totAlle/rebVor*1000)/10).replace('.',',')}\u00a0% deiner Reben eingegangen (${R().sorten.filter(id=>S.verlust[id]).map(id=>`${num(S.verlust[id])} ${SORTEN[id].name}`).join(', ')}). Der Boden lag im Jahresschnitt bei ${schnitt}\u00a0%${fp?', dazu kam der Frost'+(spLohn(2)?'. '+FROST_FEUER:''):''}. Bis März kannst du nachpflanzen.`);
    S.bodenSum=0; S.bodenN=0; S.winterFrost=0; S.spaetFrost=false;
  }
  S.wetter=S.wetterNext; S.temp=tempFuer(S.monat,S.wetter,fest(8,0)); neuePrognose();
  // Frost fürs Reben-Sterben mitzählen: Wintermonate und Spätfrost zur Blüte. Der Kälteeinbruch im November zählt nicht.
  if(S.wetter==='frost'){if(S.monat===11||S.monat<=1) S.winterFrost=(S.winterFrost||0)+1; else if(S.monat===3||S.monat===4) S.spaetFrost=true}
  // Rebenmarkt: in der Pflanzzeit jeden Monat neu gewürfelt, ohne Vorschau.
  S.rebenF=S.monat<=2?Math.round(rnd(1-REBEN_SCHWANK,1+REBEN_SCHWANK)*100)/100:1;
  S.markt=clamp(S.markt+rnd(-.06,.06),.85,1.15);
  S.fassF=clamp((S.fassF||1)+rnd(-.08,.08),1-LAGER_SCHWANK,1+LAGER_SCHWANK); S.flaschF=clamp((S.flaschF||1)+rnd(-.08,.08),1-LAGER_SCHWANK,1+LAGER_SCHWANK);
  {const fr=R().sorten.filter(sorteFrei); S.rebenAng=S.monat<=2?fr[rint(0,fr.length-1)]:null}
  if(S.lage&&--S.lage.rest<=0){Z.push(S.lage.typ==='mode'?`Die Mode im Ausland ist vorbei, ${SORTEN[S.lage.sorte].name} kostet wieder so viel wie üblich.`:'Der Weinskandal ist vergessen, die Weinpreise erholen sich.'); S.lage=null}
  neuesLohnAngebot();
  const W=wachse(S.monat);
  schaedMonat(Z);
  // Seit 8.0 (Paket B): Der Laubschneider macht im Juni den Sommerschnitt, wenn er im Einsatz ist. Gemeldet wird im Winzerboten vom Juli.
  if(S.monat===6){const lb=S.maschinen.find(x=>x.typ==='laub');
    if(lb){const an=bonusMasch('laub');
      if(an){S.laubJahr=S.jahr; abnutz(an,LAUB_ABN); const a=ruhm(LAUB_ANS); Z.push(`✂️ Dein Laubschneider hat im Juni den Sommerschnitt gemacht: Die Lese ${S.jahr} bekommt ${LAUB_QP} Qualitätspunkt mehr, dazu +${a} Ansehen. Zustand jetzt ${an.zustand} %.`)}
      else Z.push(`✂️ Dein Laubschneider ${lb.zustand<MASCH_ROT?'ist ausgefallen':'hatte keinen Fahrer'}, einen Sommerschnitt gab es dieses Jahr nicht.`)}}
  // Seit 8.0 nutzen sich Maschinen nur noch bei der Lese ab (maschAbnutzung), die feste Abnutzung je Herbstmonat ist weg.
  // Der Weingut-Manager stellt nach dem Monatswechsel die Helfer für die Handlese ein, sobald Edelfäulnis da ist.
  {const n=mgrHandlese(), t=`${n===1?'einen Erntehelfer':n+' Erntehelfer'} für die Handlese eingestellt`;
    if(n){Z.push(`${MGR_BEREICHE.weingut.sym} Dein ${MGR_BEREICHE.weingut.name} hat ${t}.`); const mw=S.manager.weingut; mw.zuletzt=t; mw.zm=S.jahr*12+S.monat; mgrLogbuch('weingut',t)}}
  // Wetter als Thema für die Zeitung. Die Einzelheiten je Rebsorte stehen unter "Aus dem Weinberg".
  if(eisEigen()) schlag(66,...eisT('eigen'),'eiswein',{du:1});
  if((S.monat===3||S.monat===4)&&S.wetter==='frost'&&rebenGesamt()) schlag(62,'Spätfrost im Frühjahr','Eine Frostnacht hat die jungen Triebe geschädigt. Die Ernte fällt dieses Jahr kleiner aus.','spaetfrost',{du:1});
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
  if(schulden()-erbRest()>rahmen()){
    S.mahnung++;
    if(S.mahnung>=3){S.pleite=true; S.pleiteP=S.rang?bestenEintrag():0; schlag(90,`Pfändung bei ${S.name}`,'Der Gerichtsvollzieher steht vor der Tür. Dein Weingut ist pleite.','pleite',{du:1})}
    else{ruhm(-6); schlag(58,`${S.mahnung}. Mahnung der Bank`,`Deine Schulden von ${eur(schulden()-erbRest())} liegen über dem Kreditrahmen von ${eur(rahmen())}. Das kostet 6 Ansehen. Beim dritten Mal kommt der Gerichtsvollzieher.`,'bank',{du:1})}
  }else{S.mahnung=0; if(S.geld<0) Z.push('Dein Konto ist im Minus. Die Bank nimmt dafür 1 % Zinsen im Monat.')}
  // Seit 10.1: Endet die Partie in diesem Januar (spielEnde in generationMonat), passiert danach nichts mehr.
  if(!S.pleite){generationMonat(Z); if(!S.ende){geschichteMonat(); etappe3Monat(Z)}}
  // Die Zeitung zeigt den Bericht: kopf ist die Schlagzeile, art die Artikel, zeilen "Kurz gemeldet", wetter die Ereignisse im Weinberg, ehr die neuen Ehrungen.
  // k ist das, was zum Monatswechsel abgebucht wurde (steht bei der Bank).
  kompBote(Z); rufBote(Z); sektBote(Z); kaufBote();
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
    ...(fest?(alt.zs!=null?{zs:alt.zs}:{}):S.zeit!=null&&!S.zeitAlt?{zs:S.ende&&zr?zr.s:Math.round(S.zeit)}:{}),...(S.ende?{ende:S.ende.art,amt:S.amt?S.amt.zeit:0}:S.pleite?{ende:'pleite'}:{})});
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
    for(let i=alt+1;i<=S.rang;i++){const ri=RAENGE[i]; ehre(i===R_MAX?'👑':'🎖️',`Aufstieg! Du bist jetzt ${rangN(i)}.`,1,`Das ${i===R_MAX?bringtSatz(i):'bringt dir: '+bringt(i)}.${rahmenSatz(i)}${ri.weg?' '+anr(ri.weg,ri.wegW):''}`,i)}
    // Version 7.2: Feier nach der Zeitung, goldene Rang-Karte für diesen Monat. Seit 7.7 feiert auch der Präsident (Sieg-Szene), der Leserbrief bleibt bis Vizepräsident.
    // Seit 11.5 (Teil C1): Die Manager des neuen Rangs kommen von selbst und stellen sich nach der Feier vor.
    if(MGR_GLEICH) mgrKommen();
    S.rangNeu=S.jahr*12+S.monat;
    zeitAufstieg(alt,S.rang); rangMonMerk(alt,S.rang);
    S.feier={von:alt,zu:S.rang,platz:bestenEintrag()}; if(S.rang<R_MAX) S.aufBrief=S.rang;
    schlag(95,`Aufstieg: Du bist jetzt ${rangN(S.rang)}`,`Das ${bringtSatz(S.rang)}.${rahmenSatz(S.rang)}${r.weg?' '+anr(r.weg,r.wegW):''}`,wgBild(S.rang+1,'sommer'),{sonder:1,gold:1,du:1});   // Seit 12.4.3: Weingut-Bild der neuen Stufe statt 'aufstieg' (Maik 20.11.2026)
    if(S.rang===R_MAX&&!S.sieger) siegSpieler();
    else if(S.rang===R_MAX) schlag(99,`Du bist ${anr('Präsident','Präsidentin')}!`,`Der Weinbauverband wählt dich an seine Spitze. ${S.sieger} saß vor dir auf dem Stuhl im Festsaal und muss ihn jetzt räumen: Er gehört dir.${S.gesch&&S.gesch.flasche&&!S.flascheAuf?(S.flascheAuf=S.jahr,' Die Flasche vom ersten Jahrgang wird heute Abend doch noch geöffnet.'):''} ${AMT_AUSBLICK}`,S.flascheAuf===S.jahr?GEN_BILD.sieg:'sieg',{gold:1,du:1});
    // Seit 10.0: Das Amt beginnt in dem Monat, in dem der Spieler Präsident wird, auch wenn ein Gegner vorher schon Präsident war.
    if(S.rang===R_MAX&&!S.amt) amtStart();
  }
  freiBote(Z); leuteKommen(Z); mgrKommen(); kontrolleMonat(Z); sabotageGegenDich(Z);
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
  // Seit 10.1: Nach dem Brief ist jeden August Weltweinschau im eigenen Dorf, bis zum Sieg.
  if(S.monat===WELT_MONAT&&weltOffen()){
    neuerWettbewerb('welt');
    // Seit 10.2: Die erste Schau kommt auf die Bild-Bühne (A.schauB), danach steht sie nur im Winzerboten. Alte Stände mit schon gelaufener Schau bekommen keine Bühne mehr.
    const A=S.amt, erst=!A.schauB&&!(A.welt&&A.welt.length); A.schauB=1; if(erst) feierWelt('schau');
    schlag(74,`Weltweinschau ${S.jahr}: Die Welt ist zu Gast`,`${erst?`Am Holzbogen hängen Fahnen, ${spLohn(7)?'auf der Bank an der Spitzenlage sitzen Gäste aus zwanzig Ländern':'in den Gassen hört man zwanzig Sprachen'}, und beim Dorffest reicht der Wein zum ersten Mal nicht.`:'Am Holzbogen hängen wieder die Fahnen, und diesmal hat das Dorf genug Wein fürs Fest bestellt.'} Neun Weingüter aus aller Welt stellen sich der Jury. Du reichst diesen Monat im Rathaus einen verkaufsreifen Prädikatswein oder Sekt ein, das Ergebnis steht im nächsten Winzerboten.`,'weltweinschau');
  }
  // Auktion über drei Monate: angekündigt, dann wird geboten, danach steht das Ergebnis unten in der Zeitung.
  // Alte Spielstände ohne phase hatten ihren Bietmonat schon und bekommen jetzt das Ergebnis.
  const a=S.auktion, wo=WO[S.region], ab=S.rang>=R_AUKTION, nichtDu=` Mitbieten darfst du ab dem Rang ${RAENGE[R_AUKTION].name}.`;
  if(a&&a.phase!==0){FUSS.push('🔨 '+aukErgebnis()); S.auktion=null}
  else if(a){a.phase=1; schlag(56,a.spitze?`Heute wird geboten: die Spitzenlage ${wo}`:`Heute wird geboten: ${a.ha}\u00a0Hektar ${wo}`,`Im Saal sitzen ${a.bieter.length} Bieter, das Startgebot liegt bei ${eur(a.start)}.${!ab?nichtDu:aukDeckel(a)?' '+AUK_ZU_GROSS+' Warum, steht im Rathaus.':' Mitbieten kannst du diesen Monat im Rathaus.'}`,a.spitze?'spitzenlage':'auktion',{archiv:a.spitze?0:1})}
  // Spitzenlage: ab Vizepräsident alle drei Jahre eine Chance, in einem Auktionsmonat zur Hälfte. Nur Nachbarn bieten mit.
  if(!S.auktion&&!S.spitze&&S.rang>=R_SPITZE&&AUK_MONATE.includes(S.monat)&&S.jahr-(S.spitzeVers||0)>=3&&Math.random()<.5){
    neueAuktion(1); S.spitzeVers=S.jahr;
    schlag(57,`Die Spitzenlage ${wo} kommt unter den Hammer`,`Die beste Lage weit und breit: ${SPITZE_HA}\u00a0Hektar Steilhang in voller Südsonne. Nächsten Monat wird versteigert, das Startgebot liegt bei ${eur(SPITZE_START)}. Wer sie bekommt, erntet jedes Jahr süßere Trauben.`,'spitzenlage');
  }
  // Seit 13.4.1: aukF des Gebiets (Rheingau) auf die Chance einer Auktion.
  if(!S.auktion&&AUK_MONATE.includes(S.monat)&&(S.jahr-START_JAHR)*12+S.monat>=6&&Math.random()<AUK_CHANCE*(R().aukF||1)){
    neueAuktion();
    schlag(55,`Weinberg ${wo} zu versteigern`,`Nächsten Monat kommen ${S.auktion.ha}\u00a0Hektar unter den Hammer, das Startgebot liegt bei ${eur(S.auktion.start)}.${!ab?nichtDu:aukDeckel()?' '+AUK_ZU_GROSS:' Halte Geld oder Kreditrahmen bereit.'}`,'auktion',{archiv:1});
  }
  ladenMonat(Z);
  neueLaeden(); S.absatz=0;
  S.exLage.ex=clamp(S.exLage.ex+rnd(-.05,.05),.9,1.12);
  // Seit 10.0: Stimmung, Umfrage, Sabotage vor der Wahl und die Wahl selbst, nach allem, was in diesem Monat Ansehen gebracht oder gekostet hat.
  amtMonat();
  ereignisMonat();
}
/* ---- Weinkontrolle: unangekündigt, im Schnitt alle drei Jahre, spätestens nach vier. Nach einem Fund fünf Jahre lang jedes Jahr ---- */
function kontrNeu(){const k=S.kontr; if(k.scharf>0){k.scharf--; k.in=12}else k.in=rint(24,48)}
function panschListe(){return S.lots.filter(l=>l.pansch&&l.status!=='trauben')}
function strafeHoehe(){return Math.max(STRAFE_MIN,Math.round(2*panschListe().reduce((a,l)=>a+lotWert(l),0)/100)*100)}
function strafeAns(){return STRAFE_ANS+STRAFE_ANS_WEITER*(panschListe().length-1)}
function kontrolleMonat(Z){
  const k=S.kontr; if(--k.in>0) return;
  if(!panschListe().length){kontrNeu(); schlag(45,'Weinkontrolle ohne Befund',`Der Prüfer blättert durch dein Kellerbuch und findet nichts zu beanstanden. +${ruhm(4)} Ansehen.`,'kontrolle',{archiv:1}); return}
  // Gepanschter Wein im Keller: Der Spieler entscheidet im Dialog, ob er besticht. Bis dahin ist alles andere gesperrt.
  S.pruefer=1; schlag(85,'Weinkontrolle im Keller','Der Prüfer steht unangemeldet im Keller und will dein Kellerbuch sehen.','kontrolle',{archiv:1,du:1});
}
const bestechChance=n=>.5+.35*(n-BESTECH_MIN)/(BESTECH_MAX-BESTECH_MIN);
// Der Prüfer findet den gepanschten Wein. extra ist der zusätzliche Abzug nach einer abgelehnten Bestechung.
function pruefEnde(extra){
  const F=panschListe(), st=strafeHoehe(), ab=strafeAns()+(extra||0);
  S.lots=S.lots.filter(l=>!F.includes(l)); zahle(st); ruhm(-ab); S.kontr={in:12,scharf:5}; S.pruefer=0;
  return `${F.length===1?'Der gepanschte Wein wird':'Die gepanschten Weine werden'} vernichtet. Strafe: ${eur(st)}, ${ab} Ansehen weg. Fünf Jahre lang kommt der Prüfer jetzt jedes Jahr.`;
}
/* ---- Panschen: Most zuckern oder wässern, Fässer verschneiden ---- */
const mani=l=>(l.zucker||0)+(l.wasser||0)>0;
const maniLegal=(l,st)=>st==='tafel'&&(l.zucker||0)<=ZUCKER_ERLAUBT&&(l.wasser||0)<=ZUCKER_ERLAUBT;
const maniText=l=>[l.zucker?`gezuckert (+${l.zucker}\u00a0%)`:'',l.wasser?`gewässert (+${l.wasser}\u00a0%)`:''].filter(Boolean).join(' und ');
// Seit 8.0 (Paket B): Trauben aus einem Jahr mit Sommerschnitt (l.laub) bekommen LAUB_QP Punkte obendrauf, nach der Eignung, damit es genau so viele sind.
// Seit 13.2.1: Der Boden gibt BODEN_ST_QP Punkte je Stufe (l.bst, bei der Lese festgehalten) statt der Punkte aus dem Bodenzustand.
// Seit 13.2.2: dazu die Punkte der Rebpflege (l.pfl, bei der Lese festgehalten, PFLEGE_QP).
function qpFuer(l,st){return Math.max(1,Math.round((STUFEN[st].qp+(st==='eis'?EIS_WERT[eisStufe(l.oe)].qp:0)+Math.min(8,Math.floor((l.oe-mindest(st))/3))+Math.round(SORTEN[l.sorte].q/2)+Math.min(4,l.sonne||0)+BODEN_ST_QP*(l.bst||0)+pflegeQP(l.sorte,l.pfl))*eignung(l.sorte)))+(l.laub?LAUB_QP:0)}
// Schmiergeld für den Beamten: ein Anteil vom Wert des Weins, mindestens SCHMIER_MIN.
const schmierVon=w=>Math.max(SCHMIER_MIN,Math.round(w*SCHMIER_ANTEIL/100)*100);
function schmier(l,st){return schmierVon(l.liter*STUFEN[st].preis*(1+qpFuer(l,st)/100))}
const mischbar=l=>l.status==='fass'&&l.stufe&&l.stufe!=='feder';
const farbe=l=>SORTEN[l.sorte].farbe;
// Verschnitt zweier Fassweine: Der Wein mit der höheren Stufe gibt den Namen, Öchsle und Qualitätspunkte werden nach Menge gemittelt.
function mischung(a,b){
  if(STUFEN[b.stufe].rang>STUFEN[a.stufe].rang) [a,b]=[b,a];
  const L=a.liter+b.liter, o={a,b,liter:L,oe:Math.round((a.oe*a.liter+b.oe*b.liter)/L),qp:Math.round((a.qp*a.liter+b.qp*b.liter)/L)};
  o.schmier=schmierVon(L*STUFEN[a.stufe].preis*eisF(a)*(1+o.qp/100)); return o;
}
/* ---- Sabotage ---- */
const sabChance=n=>.3+.45*(n-SAB_MIN)/(SAB_MAX-SAB_MIN);
function sabSperre(){
  return !frei('sabotage')&&S.rang<SAB_RANG?`Sabotage geht erst ${freiText('sabotage')}.`:S.rang>=SAB_RANG?`Als ${duK()} machst du so etwas nicht mehr.`:S.monat<6?'Die Unterwelt ist nur von Juli bis Dezember zu sprechen.':S.sabJahr===S.jahr?'Für dieses Jahr hast du dein Glück schon versucht.'
    :S.geld<SAB_KONTAKT+SAB_MIN?`Du brauchst mindestens ${eur(SAB_KONTAKT+SAB_MIN)}: ${eur(SAB_KONTAKT)} für den Kontakt und ${eur(SAB_MIN)} Handgeld.`:'';
}
// Sabotage gegen den Spieler: nur vom Zocker, frühestens ab dem fünften Jahr, höchstens alle fünf Jahre. Schaden: ein Fass oder rund 15 % der Reben.
// Seit 10.0 steht der Schaden in sabSchaden, weil ihn auch der Herausforderer vor der Wahl anrichtet (wahl=1). Gibt false zurück, wenn es weder ein Fass noch genug Reben gibt.
function sabSchaden(g,wahl){
  const F=S.lots.filter(l=>l.status==='fass').sort((a,b)=>lotWert(b)-lotWert(a)), B=R().sorten.filter(id=>S.felder[id].reben>=500);
  if(!F.length&&!B.length) return false;
  const wer=wahl?`So kurz vor der Wahl glaubt im Verband keiner an einen Zufall. Man munkelt, ${g.name} stecke dahinter.`:`Man munkelt, ${g.name} stecke dahinter.`;
  if(F.length&&(Math.random()<.5||!B.length)){
    const l=F[0]; S.lots=S.lots.filter(x=>x!==l);
    schlag(85,'Sabotage im Keller!',`Nachts war jemand in deinem Keller: ${num(l.liter)}\u00a0l ${lotName(l)} sind vergiftet und mussten weg. ${wer}`,'sabotage',{du:1});
  }else{
    let weg=0;
    for(const id of B){const f=S.felder[id], tot=Math.round(f.reben*.15/100)*100; f.reben-=tot; weg+=tot; if(f.menge>0&&!f.gelesen) f.menge=Math.round(f.menge*.85)}
    schlag(85,'Sabotage im Weinberg!',`Nachts hat jemand in deinem Weinberg gewütet: ${rbn(weg)} Reben sind zerstört. ${wer}`,'sabotage',{du:1});
  }
  return true;
}
function sabotageGegenDich(Z){
  const g=S.gegner.find(x=>x.typ==='zocker');
  if(!g||S.monat<6||S.jahr-START_JAHR<4||S.jahr-(S.sabDich||0)<5||Math.random()>=.04) return;
  if(sabSchaden(g)) S.sabDich=S.jahr;
}
/* ---- Version 10.0: Amtszeit und Wahl (Spielende, Paket 1) ---- */
// S.amt gibt es ab dem Monat, in dem der Spieler Präsident wird: seit (Monat des Amtsantritts als monatNr), stimm (Stimmung im Verband, Kommazahl 0 bis 100),
// marke (so viel braucht es am Wahltag), wahl (Monat der nächsten Wahl), im (1 im Amt, 0 abgewählt), zeit (laufende Amtszeit), siege (gewonnene Wahlen),
// vert (davon im Amt verteidigt), kauf (gekaufte Stimmen dieser Wahl), geg (Herausforderer ab der Umfrage, id des Gegners, sonst null),
// sab (Monat der Sabotage vor der Wahl oder 0), stuhl (id des Gegners, der nach einer Abwahl auf dem Stuhl sitzt),
// wahlen (alle Wahlen: j, m, s Stimmung, marke, ok, im, geg Name). Paket 2 braucht vert und wahlen für den Schlüssel "Verband", die Chronik und die Bestenliste.
function amtStart(){S.amt={seit:monatNr(),stimm:STIMM_START+spStimm(),marke:MARKE_START,wahl:monatNr()+WAHL_JAHRE*12,im:1,zeit:1,siege:0,vert:0,kauf:0,geg:null,sab:0,stuhl:null,wahlen:[]}}
// Alte Spielstände: Wer in 9.0.1 schon Präsident ist, bekommt das Amt beim Laden, die Meldung dazu steht im nächsten Winzerboten.
function altAmt(){if(S.rang===R_MAX&&!S.amt){amtStart(); S.amt.alt=1}}
function stimmung(d){const A=S.amt; A.stimm=clamp(A.stimm+d,0,100)}
const amtAlt=()=>!!(S&&S.amt&&!S.amt.im), stimmZ=()=>Math.round(S.amt.stimm);
// Wie der Spieler gerade heißt: sein Rang, nach einer Abwahl Altpräsident oder Altpräsidentin.
// Seit 10.1: Nach dem Sieg bei der Weltweinschau heißt er überall Ehrenpräsident, auch nach einer späteren Abwahl.
const amtEhre=()=>!!(S&&S.amt&&S.amt.ehren);
const altP=()=>anr('Altpräsident','Altpräsidentin'), duN=()=>amtEhre()?ehrP():amtAlt()?altP():rangN(S.rang), duK=()=>amtEhre()?ehrP():amtAlt()?altP():rangK(S.rang);
const monJahr=nr=>`${MON[nr%12]} ${START_JAHR+Math.floor(nr/12)}`;
// Wahlkampf: von der Umfrage bis zur Wahl. Nur dann gibt es den Stimmenkauf und die Sabotage des Herausforderers.
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
  else if(A.sab&&nr>=A.sab) amtSabotage();
  amtBrief();
}
// Seit 10.1: die zwei Schlüssel zur Weltweinschau. Dorf: alle acht Spenden, als Spende oder über die Stiftung. Verband: mindestens eine gewonnene Wahl,
// im Amt verteidigt oder als Rückkehr. Er bleibt, auch wenn man später abgewählt wird. Sind beide da, kommt im selben Monat der Brief (A.brief = Monat).
const keyDorf=()=>!stFehlt(), keyVerband=()=>!!(S.amt&&S.amt.siege>=1);
const weltOffen=()=>!!(S.amt&&S.amt.brief&&!S.amt.ehren);
// Seit 10.3 (A19): Liegt die nächste Wahl oder der nächste August nicht mehr vor der letzten Übergabe, versprechen die Texte kein nächstes Mal.
const wahlAus=()=>!!(S.amt&&S.amt.wahl>=endeMonat());
const weltAus=()=>!!(S.amt&&(S.jahr-START_JAHR+(S.monat<WELT_MONAT?0:1))*12+WELT_MONAT>=endeMonat());
function amtBrief(){
  const A=S.amt; if(A.brief||!keyDorf()||!keyVerband()) return;
  A.brief=monatNr(); feierWelt('brief');
  // Seit 10.2 steht das Gespräch mit dem Bürgermeister auf der Bild-Bühne, die Zeitung bringt nur die Nachricht.
  schlag(94,'Ein Brief für das ganze Dorf',`Die Weltweinschau sucht einen Gastgeber, und der Bürgermeister hat ihr nur ein Dorf genannt: unseres. Ab jetzt kommen jeden August die besten Weingüter der Welt auf den Dorfplatz, und du reichst im Rathaus einen Wein ein. Wer die Schau gewinnt, wird ${ehrP()}.`,'einladung',{gold:1,du:1});
}
// Die Umfrage legt den Herausforderer fest und würfelt, ob er vor der Wahl sabotiert: 2 bis 9 Monate später, also mindestens 3 Monate vor der Wahl.
function amtUmfrage(){
  const A=S.amt, g=amtRivale(); A.geg=g?g.id:-1; A.kauf=0;
  A.sab=Math.random()<WSAB_CHANCE?monatNr()+rint(2,9):0;
  amtSchlag(88,'umfrage',{im:A.im,s:stimmZ(),marke:A.marke,wann:monJahr(A.wahl),...gPar(g)},'wahl');
}
// Zur Hälfte Schaden wie bei der Sabotage des Zockers, zur Hälfte ein Gerücht. Ohne Fass und ohne genug Reben wird es immer ein Gerücht.
// Die Fünf-Jahres-Sperre des Zockers läuft mit, damit nicht zwei Anschläge kurz hintereinander kommen.
function amtSabotage(){
  const A=S.amt, g=amtGegner(); A.sab=0; if(!g) return;
  S.sabDich=S.jahr;
  if(Math.random()<.5&&sabSchaden(g,1)) return;
  stimmung(-WSAB_GERUECHT); amtSchlag(85,'geruecht',{g:g.name},'wahl');
}
// Die Wahl: Liegt die gerundete Stimmung auf oder über der Marke, gewinnt der Spieler. Kein Würfel.
function amtWahl(){
  const A=S.amt, g=amtGegner()||amtRivale(), s=stimmZ(), marke=A.marke, ok=s>=marke, war=A.im;
  A.wahlen.push({j:S.jahr,m:S.monat,s,marke,ok:ok?1:0,im:war?1:0,geg:g?g.name:''});
  A.wahl=monatNr()+WAHL_JAHRE*12; A.kauf=0; A.geg=null; A.sab=0;
  const par={s,marke,wann:monJahr(A.wahl),letzte:wahlAus()?endeJahr():0,...gPar(g)};
  if(ok){
    A.siege++; if(war) A.vert++; A.zeit++; A.marke=Math.min(MARKE_MAX,marke+MARKE_PLUS); A.stimm=STIMM_START+spStimm(); A.im=1; A.stuhl=null;
    ehre('🗳️',war?`Wiedergewählt, ${A.zeit}. Amtszeit`:`Zurück im Amt, ${A.zeit}. Amtszeit`,0,`Stimmung ${s}, gebraucht ${marke}.`);
    amtSchlag(96,war?'gewonnen':'zurueck',{...par,zeit:A.zeit,neu:A.marke},'wahl',{gold:1});
  }else{
    // Seit 10.1 (Maik 18.11.2026): Nach der Abwahl sinkt die Marke um MARKE_ABWAHL, nie unter MARKE_START. Verliert der Altpräsident noch einmal, bleibt sie.
    A.stimm=STIMM_ALT+spStimm(); if(war){A.im=0; A.stuhl=g?g.id:null; A.marke=Math.max(MARKE_START,marke-MARKE_ABWAHL)}
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
  if(S.auktion&&S.auktion.phase!==0&&!S.auktion.ende&&S.rang>=R_AUKTION){const zuG=aukDeckel(), kann=!zuG&&aukNaechstes()<=aukLimit(); A.push({t:`🔨 Auktion diesen Monat: ${S.auktion.ha}\u00a0Hektar, Gebot steht bei ${eur(S.auktion.gebot)}`+(zuG?'. '+AUK_ZU_GROSS.slice(0,-1):kann?'':'. Zum Mitbieten reicht dein Geld nicht'),tab:'stadt',sub:'amt',...(kann?{rot:1}:{ruhig:1})})}
  // Wettbewerb: Rot nur mit einem zugelassenen Wein. Reicht der Manager ein, steht hier nichts. Seit 10.3 bleibt die Zeile bei der Weltweinschau immer stehen.
  if(S.wett&&!S.wett.fertig&&!S.wett.ein&&S.rang>=wettRang()&&(S.wett.typ==='welt'||!aufgabeAktiv('wett'))){const pass=S.lots.some(wettFaehig); A.push({t:`🏅 ${WETTNAME[S.wett.typ]}: `+(pass?'diesen Monat einen Wein einreichen':'diesen Monat, du hast aber keinen zugelassenen Wein'),tab:'stadt',sub:'amt',...(pass?{rot:1}:{ruhig:1})})}
  if(fehlText()) A.push({t:`${fehlText()}, vorher geht es nicht in den nächsten Monat`,rot:1,tab:'stadt',sub:'arbeit'});
  if(m>=5&&m<=10&&leseFaktor()<.75&&R().sorten.some(id=>S.felder[id].menge>0&&!S.felder[id].gelesen)) A.push({t:`Ernteleistung reicht nur für ${Math.floor(leseFaktor()*100)}\u00a0% der Reben`,rot:1,tab:'stadt',sub:'arbeit'});
  // Seit 8.0: Maschinen unter MASCH_ROT fallen aus (Rot), unter MASCH_GELB lohnt das Warten (Gelb). Wartet der Weingut-Manager nach der Lese, ist Gelb nur ein Hinweis.
  // Dazu Gelb für Maschinen ohne Fahrer und für Felder, denen Helfer für die Handlese fehlen.
  {const mw=aufgabeAktiv('warten');
  // Seit Paket B: Bei den Bonus-Maschinen ist Rot nur ein gelber Hinweis, es fällt nur der Bonus weg.
  for(const ma of S.maschinen) if(ma.zustand<MASCH_ROT) A.push({t:`🔧 ${maschName(ma)} bei ${ma.zustand} %: fällt aus, bis ${maschEr(ma)} gewartet ist${mTyp(ma).bonus?', solange fehlt der Bonus':''}`,...(mTyp(ma).bonus?{}:{rot:1}),tab:'gut',sub:'maschinen'});
    else if(ma.zustand<MASCH_GELB) A.push({t:`🔧 ${maschName(ma)} bei ${ma.zustand} %: `+(mw?`dein ${MGR_BEREICHE.weingut.name} wartet nach der Lese`:'Warten lohnt sich'),tab:'gut',sub:'maschinen',...(mw?{ruhig:1}:{})});
  const of=maschOhneFahrer().filter(x=>mTyp(x).leute==='helfer').length;
  if(maschOhneFahrer().some(x=>mTyp(x).leute==='lagerarb')) A.push({t:'🍾 Die Abfüllanlage steht still, es fehlt ein Lagerarbeiter',tab:'stadt',sub:'arbeit'});
  if(of&&!fehlText()) A.push({t:`🚜 ${of===1?'Eine Maschine steht':of+' Maschinen stehen'} still, es ${fahrerFehlen()===1?'fehlt ein Fahrer':'fehlen '+fahrerFehlen()+' Fahrer'}`,tab:'stadt',sub:'arbeit'});
  for(const id of R().sorten){const f=S.felder[id]; if(f.menge>0&&!f.gelesen&&handFehlt(f)) A.push({t:`✋ ${SORTEN[id].name}: für die Handlese fehlen ${handBedarf(f)-S.helfer} Erntehelfer, sonst nur Qualitätswein`,tab:'stadt',sub:'arbeit'})}}
  for(const l of S.lots) if(l.status==='trauben') A.push(aufgabeAktiv('keltern')?{t:`${SORTEN[l.sorte].name}-Trauben: dein ${MGR_BEREICHE.keller.name} keltert beim Weiterblättern`,tab:'keller',ruhig:1}:{t:`${SORTEN[l.sorte].name}-Trauben müssen diesen Monat gekeltert werden`,rot:1,tab:'keller'});
  for(const l of S.lots) if(l.status==='fass'){
    if(l.stufe==='feder') A.push({t:`Federweißer ${SORTEN[l.sorte].name} muss diesen Monat abgefüllt werden`,rot:1,tab:'keller'});
    else if(l.fassMonate>=5) A.push({t:`${lotName(l)}: verdirbt im Fass in ${8-l.fassMonate} Monaten`,rot:1,tab:l.stufe?'keller':'stadt',sub:l.stufe?'':'amt'});
  }
  const anm=S.lots.filter(l=>l.status==='fass'&&!l.stufe&&['feder',...REIHE].some(st=>!pruefeAnmeldung(l,st).length)).length;
  if(anm) A.push({t:`${anm} ${anm===1?'Fass kann':'Fässer können'} im Rathaus angemeldet werden`,tab:'stadt',sub:'amt'});
  const abf=S.lots.filter(l=>l.status==='fass'&&l.stufe&&l.stufe!=='feder');
  for(const l of abf) A.push({t:`${lotName(l)} kann abgefüllt werden`+(S.flaschen<abfFl(l)?` (es fehlen ${num(abfFl(l)-S.flaschen)} Flaschen)`:''),tab:'keller',ruhig:aufgabeAktiv('flaschen')?1:0});
  // Seit 8.2 führt die Warnung ins Kellerbuch (dort ist der Wein markiert und hat die passenden Knöpfe). Steht er im Regal, sagt sie das gleich dazu.
  for(const l of S.lots) if(l.status==='flasche'&&lager(l).max-l.flMonate<=2) A.push({t:`${lotName(l)}: nur noch ${lager(l).max-l.flMonate} Monate haltbar`+(l.regal?', steht im Regal, erst rausnehmen':''),rot:1,tab:'keller',sub:'buch'});
  if(m<=2&&S.verlust) for(const id of R().sorten) if(S.verlust[id]) A.push({t:`Über den Winter sind ${rbn(S.verlust[id])} ${SORTEN[id].name}-Reben eingegangen. Nachpflanzen`,tab:'gut',sub:'berg',ruhig:aufgabeAktiv('reben')?1:0});
  if(m<=2&&frei>0) A.push({t:`Pflanzzeit: Platz für ${rbn(frei)} Reben`,tab:'gut',sub:'berg',ruhig:1});
  // Version 7.3: Düngen steht an, sobald der Boden auf 70 % oder weniger fällt (Gelb), seit 7.9 Rot ab DUENG_ROT. Düngt der Weingut-Manager, nur ein ruhiger Hinweis.
  if(S.boden<=70&&S.duengungen<3) A.push(aufgabeAktiv('duengen')?{t:`Boden bei ${S.boden}\u00a0%: dein ${MGR_BEREICHE.weingut.name} düngt beim Weiterblättern`,tab:'gut',sub:'berg',ruhig:1}:{t:`🌱 Boden bei ${S.boden}\u00a0%: Düngen ist ${S.boden<=DUENG_ROT?'überfällig':'dran'}`,tab:'gut',sub:'berg',rot:S.boden<=DUENG_ROT?1:0});
  // Seit 13.2.4: Rebschnitt bis Ende April, im April rot.
  {const sn=R().sorten.filter(schnittOffen); if(sn.length) A.push({t:`✂️ Rebschnitt bis Ende April: ${sn.map(id=>SORTEN[id].name).join(', ')}`,tab:'gut',sub:'berg',rot:S.monat===SCHNITT_BIS?1:0})}
  // Seit 13.4.6: Der Weingut-Manager warnt, wenn zu viel der Ernte im Wagnis hängt (wagnisWarnung), Rot.
  {const ww=wagnisWarnung(); if(ww) A.push({t:`${MGR_BEREICHE.weingut.sym} Dein ${MGR_BEREICHE.weingut.name} warnt: ${Math.round(ww.anteil*100)} % deiner Ernte hängen im Wagnis (${ww.ids.map(id=>SORTEN[id].name).join(', ')})`,rot:1,tab:'gut',sub:'berg'})}
  // Seit 11.6: Warnung vor einem Schädling, Gelb. Spritzt der Weingut-Manager, nur ein ruhiger Hinweis.
  {const b=schaedWarn(); if(b&&!b.gespritzt){const T=SCHAED[b.art]; A.push(aufgabeAktiv('spritzen')?{t:`${T.sym} Warnung vor ${T.dem}: dein ${MGR_BEREICHE.weingut.name} spritzt beim Weiterblättern`,tab:'gut',sub:'berg',ruhig:1}:{t:`${T.sym} Warnung vor ${T.dem}: Spritzen halbiert den Schaden, nur diesen Monat`,tab:'gut',sub:'berg'})}}
  if(m===11){const t=steuerSchau(); if(t.steuer>0){
    A.push({t:`💶 Im Januar rund ${eur(t.steuer)} Steuer auf ${eur(t.gew)} Gewinn. Fassraum oder Flaschen kaufen senkt sie`,tab:'keller',sub:'lager',ruhig:1});
    if(S.duengungen<3&&S.boden<100) A.push({t:`💶 Steuer senken: noch düngen (${S.duengungen} von 3 Mal)`,tab:'gut',sub:'berg',ruhig:1});
    if(S.maschinen.some(x=>x.zustand<100)) A.push({t:'💶 Steuer senken: Maschinen warten',tab:'gut',sub:'maschinen',ruhig:1});
  }}
  // Seit 8.2: gelber Punkt im Rathaus im November und Dezember, solange die Spende des Rangs offen ist. Nie rot.
  {const s=spOffen(); if(s&&m>=10) A.push({t:`🤝 Spende für ${SPENDEN[s].z}: ${vonGeld(spBezahlt(),SPENDEN[s].b)}. Vor Silvester gespendet senkt sie die Steuer`,tab:'stadt',sub:'amt'})}
  if(m>=7&&R().sorten.some(id=>{const f=S.felder[id];return f.menge>0&&!f.gelesen&&(m<11||f.gefroren||f.edel)})) A.push({t:'Lese möglich',tab:'gut',sub:'berg',...(m===7?{ruhig:1}:{halt:1})});
  if(S.rang>=R_LADEN&&!aufgabeAktiv('regal')&&!regalWeine().length&&S.lots.some(l=>l.status==='flasche'&&preis(l)>0)) A.push({t:'🍷 Das Regal deiner Weinhandlung ist leer',tab:'stadt',sub:'laeden',ruhig:1});
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
function feierPunkte(von,zu){
  const P=[];
  for(let i=von+1;i<=zu;i++) for(const t of bringtTeile(i)) P.push([(FREI_SYM.find(s=>s[0].test(t))||[0,'🔓'])[1],gross(t)]);
  if(RAENGE[zu].rahmen>RAENGE[von].rahmen) P.push(['🏦',`Kreditrahmen ${eur(RAENGE[zu].rahmen)}`]);
  for(let i=von+1;i<=zu;i++) if(RAENGE[i].weg) P.push(['⚠️',anr(RAENGE[i].weg,RAENGE[i].wegW)]);
  return P;
}
const startPunkte=()=>[['🌱','3 Hektar kahler Weinberg'],['💶',`Startgeld ${eur(startGeld(S.schwer))}`],['🍇',`Deine erste Rebsorte: ${SORTEN[sortenFolge()[0]].name}`],['📅','Pflanzzeit bis März']];
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
  'Neun Weingüter aus aller Welt stellen sich der Jury. Fehlt nur noch deiner.']});
function weltFeier(){
  const F=S.feier, fl=!!S.flascheAuf;
  if(F.welt==='brief') return {B:[{bild:'einladung',ort:'✉️ Im eigenen Hof',h:'Ein Brief für das ganze Dorf',konf:8,p:['Der Bürgermeister steht mit einem Umschlag im Hof, das Siegel ist noch ganz.',
      '„Die Weltweinschau sucht einen Gastgeber. Die wollen diesmal kein Schloss, die wollen ein Dorf.“','„Und ich kenne nur eins, das sich das zutraut.“',
      'Hinter ihm am Zaun steht schon das halbe Dorf und tut so, als wäre es zufällig da.']},...(F.schau?[wfSchau()]:[])],
    kopf:'Post aus aller Welt',schrift:briefHtml(),titel:'Das bringt dir der Brief',
    P:[['🌍',`Jeden ${MON[WELT_MONAT]} ist Weltweinschau auf dem Dorfplatz`],['🍷','Deinen Wein reichst du im Rathaus ein'],['🎗️',`Platz 1 macht dich ${anr('zum Ehrenpräsidenten','zur Ehrenpräsidentin')}`],weltAus()?['⏳','Bis zur letzten Übergabe reicht die Zeit für keine Schau mehr']:['🔁','Wer verliert, tritt im nächsten Jahr wieder an']],
    knopf:F.schau?'Wein einreichen 🍷':'Wir machen das 💪'};
  if(F.welt==='schau') return {B:[wfSchau()],knopf:'Wein einreichen 🍷'};
  if(F.welt==='sieg') return {B:[{bild:'weltweinschau-sieg',ort:'🎆 Auf dem Dorfplatz, am Abend',h:`Du bist ${ehrP()}!`,konf:26,funken:1,p:['Über dem Dorfplatz steigt das Feuerwerk auf, und auf dem roten Tisch glänzt der Pokal mit der Weltkugel.',
      `${F.wein||'Dein Wein'} hat die besten Weingüter der Welt geschlagen, und das im eigenen Dorf.`,'Der Bürgermeister hat Tränen in den Augen und behauptet, das sei der Rauch.']},
    ...(fl?[{bild:'ehrenplatz',ort:'🕯️ Der Ehrenplatz',h:'Was war da drin?',konf:0,unten:1,p:['Zwischen den besten Weinen der Welt steht eine leere Flasche mit vergilbtem Etikett.',
      'Ein Prüfer aus Übersee bleibt davor stehen: „Was war da drin?“','„Unser erster. Besonders gut war er nicht.“','„Und warum steht er hier?“','„Weil ohne ihn keiner von den anderen da wäre.“']},
    {bild:'flasche-regal-zwei',ort:'🍾 Im Gewölbekeller',h:'Eine zweite Flasche im Regal',konf:0,p:['Am Abend, als alle weg sind, gehst du allein in den Keller.',
      'Eine Flasche vom Siegerwein kommt ins Regal, direkt neben die leere.','Aufs Etikett schreibst du: „Für den Tag, an dem einer von uns es besser macht.“',
      `${ratte()} schaut kurz vorbei und prüft, ob die neue auch einen Korken hat.`]}]:[])],
    kopf:'Herzlichen Glückwunsch!',schrift:ehrUrkHtml(),titel:'Das bringt dir der Sieg',
    P:[...(F.was||'').split(', ').filter(Boolean).map(x=>[/Ansehen/.test(x)?'⭐':/Qualit/.test(x)?'🍇':'💶',x]),['🎗️',`Den Titel ${ehrP()} nimmt dir keine Wahl mehr`],['🔑','Übergeben kannst du im Rathaus, wann du willst'],['🏆','Dein Weg zum besten Ende steht']],
    knopf:'Anstoßen 🥂'};
  const best=S.ende&&S.ende.art==='best';
  return {B:[{bild:ENDE_BILD[best?'best':'gut'],ort:'🔑 Am Küchentisch',h:best?'Die Übergabe am Küchentisch':`${S.name} geht in neue Hände`,konf:0,ruhig:1,p:endeText()}],knopf:'Zur Chronik 📜'};
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
  let nL=0,eL=0,nH=0,eH=0;
  if(aL) for(const [r,la] of Object.entries(S.laeden)) for(const l of ls().filter(l=>ladenPasst(l,r))){
    if(la.rest<=0) break; const n=Math.min(frei(l),la.rest); if(n<=0) continue;
    const p=ladenPreis(l,r), e=erloes(Math.round(n*p)); kassiere(e); la.rest-=n; l.liter-=n; nL+=n; eL+=e; kompVerkauf(l,n);
  }
  if(aH) for(const l of ls()){
    const w=wege(l)[0]; if(!w) continue; const fw=federHandel(l), n=fw?l.liter:Math.min(frei(l),Math.floor(marktRest()/w.p)); if(n<=0) continue;
    const e=erloes(Math.round(n*w.p)); kassiere(e); if(!fw) S.absatz=(S.absatz||0)+n*w.p; l.liter-=n; nH+=n; eH+=e; kompVerkauf(l,n);
  }
  S.lots=S.lots.filter(l=>l.liter>0);
  if(nL) L.push(`${num(nL)} Flaschen an Weinhandlungen für ${eur(eL)} verkauft`);
  if(nH) L.push(`${num(nH)} Flaschen an den Großhandel für ${eur(eH)} verkauft`);
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
    text:` ${wer} ${lae?'beliefert die Weinhandlungen bei jedem Weiterblättern mit passenden Weinen':'verkauft bei jedem Weiterblättern, so viel der Großhandel zum vollen Preis nimmt'}. Was am ehesten verdirbt, geht zuerst. Wie viel je Wein im Keller bleibt, stellst du im Betrieb bei deinen Managern ein. Von Hand verkaufen kannst du trotzdem jederzeit.`};
}
// Version 7.0 (Schritt D): Manager im Betrieb (statt Gutsverwalter), im Arbeitsamt und als Fenster von unten.
// Seit 7.5 hat jeder Manager im Betrieb ein eigenes Fenster mit Stufe, Lohn und den Schaltern seiner Aufgaben. Das Fenster von unten (AKT.mgr)
// kommt nach dem Einstellen oder Befördern im Arbeitsamt und zeigt dieselben Schalter (mgrSchalter).
// Wann ein Manager etwas erledigt hat, als Monat (und Jahr, wenn es nicht das laufende ist).
function mgrWann(z){const j=Math.floor(z/12); return MON[z%12]+(j!==S.jahr?' '+j:'')}
function mgrLogbuch(b,t){const m=S.manager[b], z=S.jahr*12+S.monat, L=m.log=m.log||[], e=L[L.length-1]; if(e&&e.z===z) e.t=t; else L.push({z,t}); if(L.length>MGR_LOG) L.splice(0,L.length-MGR_LOG)}
// Manager im Betrieb: {h} für die, die der Rang schon erlaubt, {zu} für die gesperrten (seit 10.6 leer, bis 10.5 zugeklappt mit Schloss unten).
function mgrHtml(){
  const B=Object.keys(MGR_BEREICHE), da=b=>S.rang>=mgrEintrag(b,1).rang;
  return {h:B.filter(da).map(mgrPersonal).join(''),zu:B.filter(b=>!da(b)).map(mgrPersonal).join('')};
}
// Was eine Stufe ohne Schalter bringt: der Kellermeister auf Stufe 3 lässt Wein schneller reifen, aber erst, wenn Schritt H einen Wert setzt.
function mgrExtra(e){return e.bereich==='keller'&&e.stufe===3&&(MGR_REIFE||MGR_REIFE_MIN)?['Wein reift schneller']:e.bereich==='weingut'&&e.stufe===3&&MGR_ABNUTZ?[`Maschinen nutzen sich ${Math.round(MGR_ABNUTZ*100)} % weniger ab`]:[]}
function mgrStufenText(e,st){const t=[...mgrAufg(e).map(k=>MGR_AUFGABEN[k].kurz),...mgrExtra(e)]; return `${e.stufe<=st?'✅':frei(mgrK(e))?'⬜':'🔒'} Stufe ${e.stufe} (${freiText(mgrK(e))})${t.length?': '+t.join(', '):''}`}
// Was früher der Gutsverwalter tat, seit 7.0 (Schritt D) aufgeteilt: Weingut-Manager (Reben, Düngen, Erntehelfer) und Kellermeister (Keltern, Lagerarbeiter, ab Stufe 2 Abfüllen und Sekt).
// Läuft beim Weiterblättern vor der Leute-Sperre, in derselben Reihenfolge wie beim Verwalter. Berichte stehen in S.mgrLog für die nächste Zeitung.
function mgrBetrieb(){
  if(!S.manager) return;
  const LW=[], LK=[], m=S.monat, neu={helfer:0,lagerarb:0}, hf=aufgabeAktiv('helfer'), la=aufgabeAktiv('lager');
  const stell=k=>{zahle(VERMITTLUNG); S[k]++; S.loehne[k].push(S.angebot[k]); S.loehne[k].sort((x,y)=>x-y); neu[k]++};
  if(aufgabeAktiv('reben')&&m<=2&&S.verlust) for(const id of R().sorten){
    const pr=rebenPreis(id), platz=()=>Math.min(S.verlust[id]||0,S.ha*HA_REBEN-rebenGesamt(),Math.floor(Math.max(0,S.geld-5000)/pr/10)*10);
    if(hf){let i=0; while(platz()>=10&&helferReben()<rebenGesamt()+platz()&&S.geld>5000+VERMITTLUNG&&i++<20) stell('helfer')}
    const n=Math.floor(Math.min(platz(),helferReben()-rebenGesamt())/10)*10;
    if(n>0){zahle(Math.round(n*pr*100)/100); const f=S.felder[id]; f.reben+=n; S.verlust[id]-=n; LW.push(`${rbn(n)} ${SORTEN[id].name}-Reben nachgepflanzt`)}
  }
  if(aufgabeAktiv('duengen')&&S.duengungen<3&&S.boden<100&&(S.boden<=70||(m===7&&S.boden<90))&&S.geld>=duengKosten()){const st=bonusMasch('duenger'); duenge(); LW.push(st?'mit dem Düngerstreuer gedüngt':'gedüngt')}
  if(aufgabeAktiv('spritzen')){const b=schaedWarn(); if(b&&!b.gespritzt){if(S.geld-mgrPuffer('weingut')>=spritzKosten()){spritze(); LW.push(`gegen ${SCHAED[b.art].den} gespritzt`)} else LW.push(`fürs Spritzen gegen ${SCHAED[b.art].den} hat das Geld nicht gereicht`)}}
  // Seit 8.0: Maschinen warten (Stufe 1, bis Paket B Stufe 2), alle fünf Maschinen. Nach der Lese, also vor August oder wenn kein Feld mehr hängt, jede Maschine unter MGR_WART_AB auf 100 %.
  // Er lässt mgrPuffer('weingut') auf dem Konto, reicht es nicht ganz, wartet er so weit, wie das Geld reicht.
  if(aufgabeAktiv('warten')&&(m<7||!R().sorten.some(id=>S.felder[id].menge>0&&!S.felder[id].gelesen))){
    const pu=mgrPuffer('weingut');
    for(const ma of S.maschinen.filter(x=>x.zustand<MGR_WART_AB)){
      const W=mTyp(ma).wart, n=Math.min(100-ma.zustand,Math.floor((S.geld-pu)/W)); if(n<1) continue;
      zahle(n*W); ma.zustand+=n; LW.push(`${maschName(ma)} auf ${ma.zustand} % gewartet`);
    }
  }
  // Seit 10.3 (B1): Eine ausgefallene Erntemaschine wartet er sofort, auch mitten in der Lese, bevor er weiter unten Leute für die Lücke einstellt.
  // Reicht das Geld über dem Puffer nicht bis MASCH_ROT, lässt er es und stellt wie bisher ein.
  if(aufgabeAktiv('warten')){
    const pu=mgrPuffer('weingut');
    for(const ma of S.maschinen.filter(x=>mTyp(x).ernte&&x.zustand<MASCH_ROT)){
      const W=mTyp(ma).wart, n=Math.min(100-ma.zustand,Math.floor((S.geld-pu)/W)); if(ma.zustand+n<MASCH_ROT) continue;
      zahle(n*W); ma.zustand+=n; LW.push(`${maschName(ma)} nach dem Ausfall auf ${ma.zustand} % gewartet`);
    }
  }
  if(hf){const nh=mgrHandlese(); if(nh) LW.push(`${nh===1?'einen Erntehelfer':nh+' Erntehelfer'} für die Handlese eingestellt`)}
  // Schritt F: Kellermeister (seit 8.5 ab Stufe 1, vorher Stufe 2) keltert die Lese beim Weiterblättern und kauft fehlenden Fassraum in Schritten von 500 l wie von Hand.
  // Für den Kauf lässt er mgrPuffer auf dem Konto, fehlende Lagerarbeiter stellt er nur mit der Aufgabe 'lager' ein. Reicht es nicht, bleiben die Trauben liegen
  // und die "Letzte Warnung" nennt den Grund (l.mgrNot). Mit Verlust keltern ("Trotzdem keltern") entscheidet nur der Spieler.
  if(aufgabeAktiv('keltern')){
    const pu=mgrPuffer('keller'), fp=fassPreis(); let kauf=0;
    for(const l of S.lots.filter(l=>l.status==='trauben')){
      const fehlt=l.liter-(S.fassraum-fassBelegt());
      if(fehlt>0){
        const n=Math.ceil(fehlt/500)*500, kost=Math.round(n*fp*100)/100;
        if(la){let i=0; while(fassKap()<S.fassraum+n&&S.geld-pu>=VERMITTLUNG+kost&&i++<20) stell('lagerarb')}
        if(fassKap()<S.fassraum+n){l.mgrNot='leute'; continue}
        if(S.geld-pu<kost){l.mgrNot='geld'; continue}
        zahle(kost); S.fassraum+=n; kauf+=n;
      }
      delete l.mgrNot; l.status='fass'; l.fassMonate=0; LK.push(`${num(l.liter)}\u00a0l ${SORTEN[l.sorte].name} gekeltert`);
    }
    if(kauf) LK.push(`${num(kauf)}\u00a0l Fassraum gekauft`);
  }
  if(aufgabeAktiv('flaschen')) for(const l of S.lots.filter(l=>l.status==='fass'&&l.stufe)){
    const fehlt=abfFl(l)-S.flaschen, fp=flaschePreis();
    if(fehlt>0){
      if(la){let i=0; while(flKap()<S.flaschen+fehlt&&S.geld>VERMITTLUNG+fehlt*fp&&i++<20) stell('lagerarb')}
      if(flKap()>=S.flaschen+fehlt&&S.geld>=fehlt*fp){zahle(Math.round(fehlt*fp*100)/100); S.flaschen+=fehlt}
    }
    if(S.flaschen>=abfFl(l)){const an=bonusMasch('abfuell'); fuelleAb(l); LK.push(`${lotName(l)} abgefüllt${an?' mit der Abfüllanlage':''}`)}
  }
  {const fe=leuteFehlen(); if(hf) for(let i=0;i<fe.helfer;i++) stell('helfer'); if(la) for(let i=0;i<fe.lagerarb;i++) stell('lagerarb')}
  // Seit Paket B: Fahrer für Düngerstreuer und Laubschneider (Stufe 3), den Bediener der Abfüllanlage stellt der Kellermeister mit 'lager' ein.
  if(hf){const n=fahrerFehlen(); for(let i=0;i<n;i++) stell('helfer')}
  if(la&&S.maschinen.some(x=>mTyp(x).leute==='lagerarb'&&x.zustand>=MASCH_ROT)&&!S.lagerarb) stell('lagerarb')
  if(neu.helfer) LW.unshift(`${neu.helfer} Erntehelfer eingestellt`);
  // Seit 10.3 (B2): Hängt kein Feld mehr, entlässt er wieder, wen er nur für die Handlese geholt hat (S.manager.weingut.handH), die teuersten zuerst.
  // Nie unter den Bedarf für Reben und Fahrer. Wer dann noch gebraucht wird, bleibt als fester Helfer.
  {const mw=S.manager.weingut;
  if(hf&&mw&&mw.handH&&!R().sorten.some(id=>S.felder[id].menge>0&&!S.felder[id].gelesen)){
    const fahrer=S.maschinen.filter(x=>x.zustand>=MASCH_ROT&&mTyp(x).leute==='helfer').reduce((a,x)=>a+mTyp(x).fahrer,0); let k=0;
    while(k<mw.handH&&S.helfer>0&&S.helfer-1>=fahrer&&helferReben(S.helfer-1)>=rebenGesamt()){S.helfer--; S.loehne.helfer.pop(); k++}
    mw.handH=0; if(k) LW.push(`${k===1?'einen Erntehelfer':k+' Erntehelfer'} nach der Handlese entlassen`);
  }}
  if(neu.lagerarb) LK.unshift(`${neu.lagerarb} Lagerarbeiter eingestellt`);
  mgrMelde('weingut',LW); mgrMelde('keller',LK);
  if(LW.length||LK.length) save();
}
// Seit 8.0: Weingut-Manager Stufe 3 (Aufgabe helfer) stellt ab August für jedes hängende Feld mit Edelfäulnis
// so viele Erntehelfer ein, wie die Handlese braucht, solange 5.000 € plus Vermittlung auf dem Konto sind. Liefert die Zahl der Eingestellten.
// Läuft beim Weiterblättern und gleich nach dem Monatswechsel, weil Edelfäulnis und Frost erst dort kommen.
function mgrHandlese(){
  if(!aufgabeAktiv('helfer')||S.monat<7) return 0;
  let n=0;
  for(const id of R().sorten){const f=S.felder[id]; if(!(f.menge>0)||f.gelesen||!handFeld(f)) continue;
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
  if(aufgabeAktiv('regal')&&S.rang>=R_LADEN){
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
    const land=w.typ==='land', l=S.lots.filter(wettFaehig).sort((a,b)=>b.qp+(land?0:reifeBonus(b))-a.qp-(land?0:reifeBonus(a)))[0];
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
function managerArbeit(){KOMP_LEISE++; try{mgrKommen(); mgrBetrieb(); leuteArbeit(); mgrHandel(); dauerAuftrag()}finally{KOMP_LEISE--}}
// Seit 13.5.2 (Bauplan 13.5): Arbeit der Leute nach ihrer Stufe (leuteSt), beim Weiterblättern nach den Managern, die vorher einkaufen und einstellen.
// Gearbeitet wird nur, wenn mindestens einer der Gruppe angestellt ist. Was sie tun, steht im nächsten Winzerboten (S.leuteLog).
function leuteMelde(L){if(L.length) S.leuteLog=(S.leuteLog||[]).concat(L)}
function leuteArbeit(){const L=[]; lagerArbeit(L); leuteMelde(L)}
// Lagerarbeiter: Stufe 1 keltert die Lese, sobald genug Fassraum frei ist, Stufe 2 füllt angemeldete Weine ab und klebt die Etiketten, sobald genug leere Flaschen da sind.
// Fassraum und Flaschen kaufen sie nicht, das macht der Kellermeister oder der Spieler. Stufe 3 stellt den Sekt her, der seit 13.3.3 mit der Lese in den Sektkeller geht,
// die Wahl 9 oder 24 Monate trifft weiter der Spieler. Was angemeldet wird, entscheidet nur er, deshalb füllen sie nur Angemeldetes ab.
function lagerArbeit(L){
  if(!S.lagerarb) return; const st=leuteSt('lagerarb');
  if(st>=1) for(const l of S.lots.filter(l=>l.status==='trauben')) if(l.liter<=S.fassraum-fassBelegt()){delete l.mgrNot; l.status='fass'; l.fassMonate=0; L.push(`${num(l.liter)}\u00a0l ${SORTEN[l.sorte].name} gekeltert`)}
  if(st>=2) for(const l of S.lots.filter(l=>l.status==='fass'&&l.stufe)) if(S.flaschen>=abfFl(l)){const an=bonusMasch('abfuell'); fuelleAb(l); L.push(`${lotName(l)} abgefüllt${an?' mit der Abfüllanlage':''}`)}
}
const lagerKann=n=>!!S.lagerarb&&leuteSt('lagerarb')>=n;
// Seit 12.6.4 (Maik 20.11.2026, Prüfliste Einstieg): ruhiger Einstieg. Nur neue Partien haben S.ein, darin S.ein.f mit den Fenstern, die schon frei sind.
// Ein Fenster aus EIN_REGEL bleibt weg, bis seine Bedingung einmal stimmt, danach bleibt es für immer. Alte Spielstände ohne S.ein sehen alles wie vorher.
// "Deine Weine" gibt es zweimal (Weinarchiv und Großhandel), im Großhandel heißt die Regel weine_gh.
const einFass=()=>S.lots.some(l=>l.status!=='trauben'), einFlasche=()=>S.lots.some(l=>l.status==='flasche');
const EIN_REGEL={
  // Der Boden fällt jeden Monat um 3 Punkte, unter 80 ist er schon im Februar. Deshalb erst ab Mai oder sobald "Das steht an" ab 70 % zum Düngen ruft (Annahme Claude).
  duengung:()=>monatNr()>=4||S.boden<=70,
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
// Kellerausbau in drei Stufen, je Stufe ab dem Rang in KELLER_RANG. Vor Jungwinzer ist das Fenster seit 10.6 ausgeblendet (bis 10.5 zugeklappt mit Schloss unten),
// danach steht unter dem Stand, ab welchem Rang die nächste Stufe geht (seit 8.6).
function kellerRangText(){return ` Stufe 1 (${KELLER_NAMEN[0]}) gibt es ab ${RAENGE[KELLER_RANG[0]].name}, Stufe 2 (${KELLER_NAMEN[1]}) ab ${RAENGE[KELLER_RANG[1]].name}, Stufe 3 (${KELLER_NAMEN[2]}) ab ${RAENGE[KELLER_RANG[2]].name}.`}
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
  const rl=KOMP_STUFE_ROLLE[l.stufe]; return rl&&l.sorte===so[rl]?'stufe_'+l.stufe:null;
}
const fuMon=id=>!S.ein&&FU_MON_ALT[id]!=null?FU_MON_ALT[id]:FU_MON[id];
const fuGes=id=>!!(S.fu&&S.fu.ges.includes(id));
// Seit 12.8: echter Bedarf an Leuten für e1-02, also mehr als die Familie allein schafft, schon eingestellte Leute, eine Maschine (braucht einen Fahrer) oder fehlende Leute.
function fuLeuteBedarf(){const f=leuteFehlen(); return S.ha>ALLEIN_HA||S.fassraum>ALLEIN_FASS||S.flaschen>ALLEIN_FL||S.helfer>0||S.lagerarb>0||S.maschinen.length>0||f.helfer>0||f.lagerarb>0}
// Seit 12.6: Fassraum nur, wenn er für die erwartete Menge nicht reicht, Edelfäulnis und Eiswein nur, wenn noch etwas hängt.
const fuMenge=()=>R().sorten.reduce((a,id)=>a+(S.felder[id].reben&&!S.felder[id].gelesen?S.felder[id].menge||0:0),0);
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
    if(a==='Dritte Sorte') return S.rollen?`Es ist ${L[2].name}, deine Spitzen-Sorte: Sie trägt wenig, bringt aber die beste Qualität und reift am längsten. Drei Sorten verteilen außerdem das Wetterrisiko.`:'Sie hat nur einen Stern, startet mit weniger Zucker und bringt weniger Qualitätspunkte. Dafür ist sie in manchen Gebieten der erste Rotwein, und drei Sorten verteilen das Wetterrisiko.';
    if(a==='Langsorte') return (L.find(x=>x.minL>=18)||s).name;
    // Seit 12.6.1: das echte Startgeld der Schwierigkeit (Einfach 80.000 €, sonst 60.000 €).
    if(a==='Startgeld') return eur(startGeld(S.schwer));
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
// Liest den Anteil p (0 bis 1) eines Feldes. Bei p<1 bleibt der Rest hängen. Der Boden verliert je Feld und Jahr nur einmal 4 Punkte.
// Seit 8.0: Felder mit Edelfäulnis oder gefrorenen Trauben liest die Hand, wenn genug Erntehelfer da sind (handlese), sonst die Maschine mit q.masch (höchstens Qualitätswein).
// Alle anderen Felder lesen Helfer und Maschinen zusammen, die Maschinen nach ihrem Anteil an der Ernteleistung. Das nutzt sie ab (maschAbnutzung).
function lese(id,la,p,hefe){
  // Seit 13.3.2: Ein Feld wird immer ganz gelesen, Teilen geht nicht.
  // Seit 13.3.3: Die Sekt-Sorte liest alles (alles) und geht ohne Grundwein in den Sektkeller, hefe ist SEKT_REIFE oder HEFE_LANG.
  p=1; const sk=sektSorte(id); if(sk){if(!S.sektkeller) return; la='alles'}
  const f=S.felder[id], q=feldQ(f,la), l=Math.round(feldLiter(f,la)*p); if(l<=0) return;
  const L=leistung(), M=maschLeistung();
  if(M>0&&!handlese(f)) maschAbnutzung(f.reben*p*leseFaktor()*M/L,M);
  const neu={id:S.nextId++,sorte:id,jahrgang:S.jahr,liter:l,oe:q.oe,leseart:la,edel:f.edel,eis:f.gefroren,...(q.masch?{masch:1}:{}),status:'trauben',stufe:null,qp:0,fassMonate:0,flMonate:0,sonne:S.sonne,...(S.laubJahr===S.jahr?{laub:1}:{}),boden:S.boden+4*R().sorten.filter(x=>S.felder[x].gelesen||S.felder[x].teil).length,bst:S.bodenSt||0,pfl:f.pflSt||0};
  if(sk){const h=hefe===HEFE_LANG?HEFE_LANG:SEKT_REIFE; Object.assign(neu,{status:'flasche',stufe:SEKT_GRUND,sekt:true,edel:false,eis:false,...(h>SEKT_REIFE?{hefe:h}:{}),med:[],bund:false});
    neu.qp=qpFuer(neu,SEKT_GRUND)+SEKT_QP+(h>SEKT_REIFE?HEFE_LANG_QP:0); zahle(Math.round(l*sektKosten()*100)/100); neu.ans=sektAnmelden(neu)}
  // Seit 13.4.6: Erlös der Lese für die Warnung des Weingut-Managers.
  {const st=sk?SEKT_GRUND:besteStufe(q); f.leseW=(f.leseW||0)+(st?leseWert(id,la,st,l):0)}
  S.lots.push(neu);
  if(!f.teil) S.boden=Math.max(0,S.boden-4);
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
