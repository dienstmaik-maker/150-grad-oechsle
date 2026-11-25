// 150 Grad Öchsle: Oberfläche. Anzeige und Knöpfe, startet das Spiel. Seit 13.1 eigene Datei, vorher in index.html.
// Lädt nach zahlen.js und kern.js, alle Namen sind global.
'use strict';
/* ================= Helfer ================= */
const $=s=>document.querySelector(s);
const badge=b=>b?`<span class="badge ${b==='rot'?'rot':''}"></span>`:'';
// MORT ist das Stück, das gerade laufen soll. SMUSIK ist ein Stück, das ein offenes Fenster verlangt (Wettbewerb). MSP: Abspieler je Stück, FXB: geladene Geräusche.
let AC=null, AN=false, MORT=null, MKEY=null, SMUSIK=null, FXT=-1; // Der Ton startet erst mit dem ersten Tipp, vorher lässt ihn kein Browser zu.
function tonAn(){
  if(AN) return; AN=true;
  try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}
  setInterval(mischer,TAKT);
  if(AC&&NETZ) for(const n of TOENE) fetch('ton/'+n+'.mp3').then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(b=>{FXB[n]=b}).catch(()=>{});
  musikStell();
}
// Ein Abspieler: v ist seine Lautstärke jetzt (0 bis 1), z das Ziel, dt die Sekunden für eine volle Blende.
function stimme(name){
  const el=new Audio('ton/musik-'+MUSIK[name]+'.mp3'), s={el,g:null,v:0,z:0,dt:BLENDE};
  el.preload='auto'; el.loop=true;
  if(AC&&NETZ) try{s.g=AC.createGain(); s.g.gain.value=0; AC.createMediaElementSource(el).connect(s.g); s.g.connect(AC.destination)}catch(e){s.g=null}
  if(!s.g) el.volume=0;
  return s;
}
// Stellt die Ziele neu: Nur das Stück des Ortes spielt, alles andere blendet aus.
// neu: Der Ort hat gewechselt. Nur dann spielt bei der Stellung kurz ein kurzes Stück, sonst bleibt es still.
function musikStell(neu){
  if(!AN) return;
  const an=TON.musik!=='aus'&&MORT&&!document.hidden;
  for(const n in MSP) if(!an||n!==MORT) for(const s of MSP[n].s) if(s){s.z=0; s.dt=BLENDE}
  if(!an) return;
  const P=MSP[MORT]||(MSP[MORT]={s:[stimme(MORT),null],akt:0}), a=P.s[P.akt];
  if(TON.musik==='an'||musikVoll()){P.ende=0; a.z=1; a.dt=BLENDE; spiel(a.el); return}
  if(!neu) return;
  // Kurz: Läuft das Stück schon hörbar, spielt es von dort noch KURZ Sekunden weiter. Sonst startet es an einer zufälligen Stelle.
  if(a.v===0||a.el.paused){
    const el=a.el, setz=()=>{try{el.currentTime=Math.random()*Math.max(0,el.duration-KURZ-2*KURZ_BLENDE)}catch(e){}};
    if(el.duration) setz(); else el.addEventListener('loadedmetadata',setz,{once:true});
  }
  P.ende=performance.now()+KURZ*1000; a.z=1; a.dt=KURZ_BLENDE; spiel(a.el);
}
// Version 7.8: Ton als zwei Zeilen untereinander, je Knopf und Regler daneben (Maik 17.11.2026). Die Knöpfe sind gleich breit, damit die Regler bündig stehen.
function tonZeile(id,knopf,k){return `<div style="display:flex;align-items:center;gap:10px;margin:8px 0"><button class="klein" data-a="ton" data-id="${id}" style="flex:0 0 11.5em;margin:0">${knopf}</button>`
  +`<input type="range" min="0" max="100" step="5" value="${TON[k]}" oninput="tonLaut('${k}',this.value)" style="flex:1;min-width:0" aria-label="Lautstärke"><b class="tlz-${k}" style="flex:0 0 3em;text-align:right">${TON[k]}\u00a0%</b></div>`}
// Regler bewegt: wirkt sofort (Musik auch auf das, was gerade spielt) und wird gemerkt.
function tonLaut(k,v){TON[k]=+v; if(k==='laut') for(const n in MSP) for(const s of MSP[n].s) if(s) laut(s); document.querySelectorAll('.tlz-'+k).forEach(e=>e.textContent=TON[k]+'\u00a0%'); try{localStorage.setItem(TON_KEY,JSON.stringify(TON))}catch(e){}}
let ZEIT_T=performance.now(), ZEIT_TIPP=performance.now(), ZEIT_OFFEN=0;
function zeitTipp(){ZEIT_TIPP=performance.now(); ZEIT_OFFEN=0}
['pointerdown','keydown','wheel','touchmove'].forEach(n=>document.addEventListener(n,zeitTipp,{capture:true,passive:true}));
setInterval(()=>{
  const t=performance.now(), d=Math.min(2,(t-ZEIT_T)/1000); ZEIT_T=t;
  // Auf dem Titelbild (#titel gefüllt) zählt sie noch nicht.
  if(!S||window.BOT||document.hidden||S.zeit==null){ZEIT_OFFEN=0; return}
  const ti=document.getElementById('titel'); if(ti&&ti.innerHTML){ZEIT_OFFEN=0; return}
  if(t-ZEIT_TIPP>=ZEIT_LEER*1000){if(ZEIT_OFFEN){S.zeit=Math.max(0,S.zeit-ZEIT_OFFEN); ZEIT_OFFEN=0}; return}
  S.zeit+=d; ZEIT_OFFEN+=d;
},1000);
function zeitStand(){
  if(S.zeit==null) return '';
  const kv=(a,x)=>`<div class="kv"><span>${a}</span><span>${x}</span></div>`, mon=monatNr()-(S.zeitAb||0);
  const L=(S.zeitRang||[]).slice().sort((a,b)=>a.r-b.r);
  return `<h4 class="gs">⏱️ Spielzeit</h4>${kv('Gesamt',zeitTxt(S.zeit))}${kv('Je Spieljahr',mon>=1?zeitTxt(S.zeit/mon*12):'noch kein Monat')}
    ${L.length?`<h4 class="gk">Bis zum Rang</h4>${L.map(x=>kv(esc(rangN(x.r)),`Jahr ${x.j}, nach ${zeitTxt(x.s)}`)).join('')}`:''}
    ${S.zeitAlt?`<p class="mut" style="margin:6px 0 0">Gezählt seit 8.3, die Zeit davor kennt das Spiel nicht.</p>`:''}`;
}
document.addEventListener('visibilitychange',()=>{
  if(S&&!window.BOT&&S.zeit!=null){ZEIT_OFFEN=0; if(document.hidden) save(); else zeitTipp()}
  if(!AN) return;
  if(document.hidden){for(const n in MSP) for(const s of MSP[n].s) if(s){s.v=s.z=0; laut(s); s.el.pause()}}
  else{if(AC&&AC.state==='suspended') AC.resume(); musikStell()}
});
// Kurzes Geräusch, mal-fach im Abstand von 400 ms (Auktionshammer). Der Tipp-Klick schweigt, wenn im selben Augenblick schon ein anderes Geräusch kam.
function fx(name,mal){
  if(!AN||!TON.fx) return;
  const t=performance.now(); if(name==='klick'&&t-FXT<80) return; FXT=t;
  for(let i=0;i<(mal||1);i++){
    if(AC&&FXB[name]){const q=AC.createBufferSource(), g=AC.createGain(); g.gain.value=TON.fxLaut/100; q.buffer=FXB[name]; q.connect(g); g.connect(AC.destination); q.start(AC.currentTime+i*.4)}
    else setTimeout(()=>{const el=new Audio('ton/'+name+'.mp3'); el.volume=TON.fxLaut/100; spiel(el)},i*400);
  }
}
function tonKnoepfe(){return `<div class="card"><h3>🔊 Ton</h3>${tonZeilen()}</div>`}

/* ================= Bilder ================= */
// Alle Bilder liegen als Dateien im Ordner bilder (gebaut von _medien_bauen.py).
// Stationen statt Streifen (Weingut seit 9.1, Kellerei und Stadt seit 9.2): Jeder Unterreiter hat sein eigenes Bild von Timo (PANO_BILD Pixel groß), das Spiel gleitet von Bild zu Bild.
// Die Teilbilder passen an den Nähten nicht zusammen, deshalb kein durchgehender Schwenk. Gewechselt wird über die Leiste unten, durch Wischen übers Bild oder Tippen an den Bildrand.
let PANO_ALT={tab:null}, ORT_ALT=null;
// Je Ort eine eigene Hintergrundfarbe (Klasse am html-Element). Die Leiste des Handys ganz oben bekommt die Farbe der Kopfleiste.
function ortFarbe(tab){const h=document.documentElement; h.className='ort-'+tab; const m=$('meta[name="theme-color"]'); if(m) m.content=getComputedStyle(h).getPropertyValue('--kopf').trim()||'#7b1e3a'}
const sbild=n=>`<div class="sbild" style="background-image:url(bilder/${n}.jpg)${SBILD_POS[n]?';background-position:'+SBILD_POS[n]:''}"></div>`;
// Das Bild des Ortes mit Holzrahmen. Unten im Bild steht, wo man ist. Gewechselt wird über die Leiste unten, durch Wischen übers Bild oder Tippen auf ein Motiv.
function ortBild(titel){
  const L=SUBS[TAB];
  return `<div class="pano ${TAB} s-${SUB} teile" data-a="bild"><div class="ptitel"><b>${L.find(s=>s[0]===SUB)[1]} ${esc(titel)}</b></div></div>`;
}
// Dauer des Jahreszeiten-Wechsels im Winzerboten und wann danach die Zeitung herunterrollt (zuerst 2,5 s, Maik 18.11.2026: länger, jetzt 4 s und 1,5 s Ruhe).
let JZ_DAUER=4000, JZ_ROLLE=600+JZ_DAUER+1500, JZ_TEILE=18;
// Teilchen beim Jahreszeiten-Wechsel: Blüten, Laub, Schnee, im Sommer ein paar aufsteigende Lichtpunkte.
function teilchen(jz){
  const n=jz==='sommer'?Math.round(JZ_TEILE*.55):JZ_TEILE;
  return `<div class="iteile ${jz}">${Array.from({length:n},(_,k)=>`<i style="left:${(k*53+7)%100}%;animation-delay:${(.5+(k*.29)%2.2).toFixed(2)}s;animation-duration:${(3.2+(k%4)*.6).toFixed(1)}s;--d:${(k%2?1:-1)*(12+k*7%34)}px"></i>`).join('')}</div>`;
}
function tafelText(el,T){
  // Alte Spielstände ohne eigenen Namen zeigen nur das Weingut. Nach einer Übergabe steht hier der Erbe.
  const t=tafelOrt(el,T), ich=S.ich||(S.erbe&&S.erbe.name)||'', adr=`${WAND_STR[S.region]||'Weinstraße'} ${wandNr(S.name||'')}`, d=document.createElement('div');
  d.className='tafel'; d.setAttribute('aria-hidden','true');
  d.style.cssText=`left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px;font-size:${t.w/100}px`;
  d.innerHTML=`<i>Weinhof und Weinberg der Familie</i><b>${esc(S.name)}</b>${ich?`<em>${esc(ich)}</em>`:''}<span class="orn">~ ❦ ~</span><s>${esc(adr)}</s><u>Weinbaugebiet ${esc(R().name)}</u>`;
  el.append(d);
  const lang=[...d.querySelectorAll('i,b,em')], k=[S.name,ich,Math.round(t.w)].join('|'), fit=TAFEL_FIT[k];
  if(fit) return lang.forEach((e,i)=>{if(fit[i]) e.style.fontSize=fit[i]+'px'});
  const pass=()=>lang.map(e=>{e.style.fontSize=''; let f=parseFloat(getComputedStyle(e).fontSize), g=0; while(e.offsetWidth>t.w*.9&&f>4){f-=.5; g=f; e.style.fontSize=f+'px'} return g});
  const r=pass();
  if(document.fonts&&document.fonts.status!=='loaded') document.fonts.ready.then(()=>{if(d.isConnected) pass()}); else TAFEL_FIT[k]=r;
}
function teilEbene(el,sub){
  const i=document.createElement('i'); i.style.backgroundImage=`url(bilder/${PANO_TEILE[TAB][sub]}.jpg)`;
  el.insertBefore(i,el.querySelector('.ptitel'));
  const T=(PANO_TAFEL[TAB]||{})[sub]; if(T) tafelText(i,T);
  return i;
}
// Stationswechsel: Im selben Hauptreiter gleitet das neue Bild aus der Laufrichtung mit weicher Kante herein, das alte wandert leicht mit.
// Hat das alte Bild eine Tafel, zoomt es erst zurück. Hat das neue eine, zoomt es nach kurzer Ruhe darauf. Sonst (anderer Hauptreiter, Knopf gedrückt, Handy gedreht) steht das Bild sofort ruhig da.
// Das Spiel baut die Seite bei jeder Aktion neu auf. Läuft dabei noch ein Wechsel, setzt er an derselben Stelle fort (t0 und ende in PANO_ALT, die Abläufe starten mit negativer Verzögerung).
function teileStell(){
  const el=$('.pano.teile'); if(!el) return;
  el.querySelectorAll(':scope>i').forEach(x=>x.remove());
  Object.values(PANO_TEILE[TAB]).forEach(n=>{if(TEILE_DA.has(n)) return; TEILE_DA.add(n); const b=new Image(); b.src=`bilder/${n}.jpg`});
  const jetzt=performance.now(), A=PANO_ALT, T=PANO_TAFEL[TAB]||{};
  let von=null, t0=jetzt;
  if(A.tab===TAB&&A.sub&&A.sub!==SUB) von=A.sub;
  else if(A.tab===TAB&&A.sub===SUB&&A.von&&jetzt<A.ende){von=A.von; t0=A.t0}
  if(!el.animate||matchMedia('(prefers-reduced-motion:reduce)').matches) von=null;
  const alt=von?teilEbene(el,von):null, neu=teilEbene(el,SUB), zn=T[SUB]&&tafelZoom(neu,T[SUB]);
  if(zn){neu.style.transformOrigin=zn.mitte; neu.style.transform=zn.zoom}
  if(!alt){PANO_ALT={tab:TAB,sub:SUB}; return}
  const L=SUBS[TAB].map(s=>s[0]), r=L.indexOf(SUB)>L.indexOf(von)?1:-1, za=T[von]&&tafelZoom(alt,T[von]), ab=za?TAFEL_RAUS:0;
  const o=(dauer,start,fill,easing=PANO_KURVE)=>({duration:dauer,delay:start-(jetzt-t0),easing,fill});
  if(za){alt.style.transformOrigin=za.mitte; alt.animate([{transform:za.zoom},{transform:'none'}],o(TAFEL_RAUS,0,'both','ease-in-out'))}
  alt.animate([{transform:'translateX(0)'},{transform:`translateX(${-r*9}%)`}],o(GLEIT_MS,ab,'forwards'));
  neu.style.maskImage=neu.style.webkitMaskImage=`linear-gradient(${r>0?'to left':'to right'},#000 calc(var(--pk) - 30%),transparent var(--pk))`;
  neu.animate([{'--pk':'0%',transform:`translateX(${r*9}%)`},{'--pk':'130%',transform:'translateX(0)'}],o(GLEIT_MS,ab,'both'))
    .finished.then(()=>{alt.remove(); neu.style.maskImage=neu.style.webkitMaskImage=''},()=>{});
  let ende=ab+GLEIT_MS;
  if(zn){neu.animate([{transform:'none'},{transform:zn.zoom}],o(TAFEL_REIN,ende+TAFEL_RUHE,'forwards')); ende+=TAFEL_RUHE+TAFEL_REIN}
  PANO_ALT={tab:TAB,sub:SUB,von,t0,ende:t0+ende};
}
const panoStell=teileStell;
// Seit 8.1: Ändert sich die Fenstergröße (Handy drehen, Browser breiter), Bild und Tafel-Text ohne Gleiten neu ausrichten. Sonst blieb der Text am alten Platz stehen (Maik 17.11.2026).
let PANO_RS=0;
addEventListener('resize',()=>{cancelAnimationFrame(PANO_RS); PANO_RS=requestAnimationFrame(()=>{if(!S||!$('.pano')) return; PANO_ALT={tab:null}; panoStell()})});
// Tipp ins Bild: Es ist nur ein Motiv zu sehen. Ein Tipp ins linke Drittel geht einen Ort zurück, ins rechte einen vor, die Mitte macht nichts (Annahme Claude 18.11.2026).
function panoTipp(e){
  const el=e.target.closest('.pano'); if(!el||!PANO_TEILE[TAB]) return null;
  const b=el.getBoundingClientRect(), fr=(e.clientX-b.left)/b.width, L=SUBS[TAB].map(s=>s[0]); return L[L.indexOf(SUB)+(fr<1/3?-1:fr>2/3?1:0)]||null;
}
// Alte Spielstände: Edelfäulnis unter dem Auslese-Wert gab es nur nach der früheren Regel. Sie fällt weg, damit Kabinett und Spätlese nicht verloren gehen.
// Seit Version 3.3 darf sie schon ab dem Spätlese-Wert kommen, deshalb läuft das nur einmal bei Spielständen ohne S.edel33.
function altEdel(){
  if(S.edel33) return; S.edel33=1;
  const a=R().min.aus;
  for(const l of S.lots) if(!l.stufe&&l.edel&&!l.eis&&l.oe<a) l.edel=false;
  for(const f of Object.values(S.felder)) if(f.edel&&!f.gefroren&&f.oe<a){f.edel=false; f.edelGeprueft=false}
}
// Zusatz in den Verkaufsfenstern (seit Teil D): Der Betrag steht dort schon mit dem Zuschlag.
function rufTxt(){const k=RUF_BONUS?rufStufe():0; return k?`<br>🏅 mit ${rufProz(k)} % Ruf des Hauses`:''}
let RUF_M=0;
// Meldung unten im Bild, derselbe Platz wie beim Siegel. nach=1: alter Spielstand, die Stufe wird nachgereicht.
function rufMeldung(k,nach){
  const el=$('#ksiegel'); if(!el||!S||!k) return;
  const t=`Ruf des Hauses: ${RUF_NAMEN[k-1]}`, u=nach?`Deine ${kompZahlen().hab} Siegel reichen für Stufe ${k} von ${RUF_STUFEN.length}, die Händler zahlen dir ${rufProz(k)} % mehr`:`Stufe ${k} von ${RUF_STUFEN.length}, die Händler zahlen dir ${rufProz(k)} % mehr`;
  el.dataset.id=''; el.innerHTML=`<i class="ksg s3 an"></i><div><b>${esc(t)}</b><small>${esc(u)}</small></div>`;
  el.classList.toggle('oben',$('#sheet').classList.contains('an')); el.classList.add('an'); fx('korken');
  clearTimeout(KOMP_AUS); KOMP_AUS=setTimeout(()=>el.classList.remove('an'),4200);
}
// Fenster im Büro bei den Erfolgen: Stufe und Zuschlag, die Siegel, der Weg zur nächsten Stufe, darunter die Ehrungen.
function rufFenster(){
  const n=rufStufe(), z=kompZahlen(), S7=RUF_STUFEN.length, nx=RUF_STUFEN[n], J=S.rufJ||[];
  const kopf=`<div class="gold" style="font-size:17px">${n?`Stufe ${n} von ${S7}, die Händler zahlen ${rufProz(n)} % mehr`:`Noch keine Stufe`}</div>`
    +`<div class="mut">${num(z.hab)} von ${num(z.max)} Siegeln${nx?`, ${nx-z.hab===1?'noch 1 Siegel':`noch ${nx-z.hab} Siegel`} bis Stufe ${n+1}`:', alle Stufen erreicht'}</div>`;
  const zeile=k=>{const da=k<n, j=J[k]; return `<div class="rl"><span>${da?'🏅':'🔒'}</span><div><b>${esc(RUF_NAMEN[k])}</b><span class="mut">${da?(j?`${MON[j.m]} ${j.j}, `:'')+`Stufe ${k+1}`:`ab ${RUF_STUFEN[k]} Siegeln`}, +${rufProz(k+1)} %</span></div></div>`};
  const L=Array.from({length:Math.min(S7,n+1)},(_,k)=>zeile(k)).reverse();
  return fenster('ruf','Ruf des Hauses',kopf+L.join(''),{buch:'buero',kn:pk('archivGeh','Siegelbrett','',{sec:1,id:'brett'}),
    i:`Je mehr Siegel du auf dem Siegelbrett sammelst, desto besser ist der Ruf deines Hauses. Bei ${RUF_STUFEN.slice(0,-1).join(', ')} und ${RUF_STUFEN[S7-1]} Siegeln steigt er um eine Stufe. Jede bringt eine Ehrung und ${rufProz(1)} % mehr bei jedem Verkauf: Großhandel, Exporthandel, Weinhandlungen, deine eigene Weinhandlung, Sekt und Federweißer. Mit allen sieben sind es ${rufProz(S7)} %. Es zählen die Siegel dieser Partie, das Album über alle Partien wirkt nicht mit.`});
}
function stZahle(n){
  const s=stOffen(); if(!s) return; const D=SPENDEN[s], b=stPreis(s);
  if(!S.stift||S.stift.s!==s) S.stift={s,bez:0};
  n=Math.min(n,b-S.stift.bez,Math.max(0,S.geld)); if(n<=0) return;
  S.geld-=n; S.stift.bez+=n; S.spJahr=(S.spJahr||0)+n;
  if(S.stift.bez<b){fx('kasse'); return}
  S.stift=null; ruhm(D.ans,1,'Stiftung');
  (S.spenden=S.spenden||[]).push({s,j:S.jahr,m:S.monat,n:S.ich||'',w:frau()?1:0,g:genNr(),st:1});
  (S.stBote=S.stBote||[]).push(s);
  if(s===8){S.feier={spende:8}; TAB='feier'; FSTUFE=0; return}
  fx('korken'); openSheet(`${sbild(stFoto(s))}<h3>🤝 Die Stiftung holt nach</h3><p>„Besser spät als nie“, sagt der Bürgermeister. „${esc(D.z.charAt(0).toUpperCase()+D.z.slice(1))}: Das ist jetzt erledigt, und das Dorf vergisst es dir nicht.“</p>
    <div class="spehre">${spEhrHtml(s,'neu')}</div><div class="spbringt"><div>⭐ ${D.ans} Ansehen</div></div>
    <div class="btns"><button data-a="close">Danke schön 🥂</button></div>`);
}
// Kleine Feier (Stufe 1 bis 7): Bild, Dank vom Bürgermeister, Schild oder Urkunde, was es bringt. Keine Fanfare.
function spDankHtml(s){
  const D=SPENDEN[s];
  return `${sbild(spFoto(s))}<h3>🤝 Das Dorf sagt Danke</h3>${SP_DANK[s].map(t=>`<p>${esc(t)}</p>`).join('')}${s===7?spBankTafel():''}
    <div class="spehre">${spEhrHtml(s,'neu')}</div>
    <div class="spbringt"><div>⭐ ${D.ans} Ansehen</div><div>🎁 ${esc(D.lohn)}</div></div>
    <div class="btns"><button data-a="close">Danke schön 🥂</button></div>`;
}
const spBankTafel=()=>`<div class="spmessing">Ein Platz zum Verweilen,<br>gestiftet vom Weingut ${esc(S.name)}</div>`;
// Die Ehrung einer Stufe: rundes Schild (Stufe 1 bis 4) oder Urkunde (ab Stufe 5, Stufe 8 als Ehrenbürgerbrief). e ist der Eintrag aus S.spenden.
function spEhrHtml(s,kl,e){
  const D=SPENDEN[s]; e=e||(S.spenden||[]).find(x=>x.s===s)||{j:S.jahr,m:S.monat,n:S.ich||'',w:frau()?1:0};
  if(s<=4) return `<div class="spschild m-${D.ehre} ${kl||''}"><small>Die Gemeinde dankt</small><b>${esc(D.kurz)}</b><i>${e.j}</i></div>`;
  const wer=e.n||S.name, inh=e.n?`<p>${e.w?'Inhaberin':'Inhaber'} von ${esc(S.name)}</p>`:'';
  const mitte=s===8?`<p>Der Gemeinderat ernennt</p><b class="uname">${esc(wer)}</b>${inh}<p>${e.w?"zur":"zum"}</p><b class="urang">${e.w?"Ehrenbürgerin":"Ehrenbürger"}</b>`
    :`<p>Die Gemeinde dankt</p><b class="uname">${esc(wer)}</b>${inh}<p>für die Spende für</p><b class="urang lang">${esc(D.z)}</b>`;
  return `<div class="urk ${kl||''}"><div class="utext"><div class="utitel">${s===8?'Ehrenbrief':'Dankesurkunde'}</div>${mitte}<small>${MON[e.m]} ${e.j} · ${esc(REGIONEN[S.region].name)}</small></div><div class="usiegel"></div></div>`;
}
// Seit 12.3 (Maik 20.11.2026) steht "Familie …" in Alegreya SC fett statt Fraktur, seit 12.3.5 geschnitzt: Gold mit Verlauf, Ranken und feine Goldlinie.
// Namenstafel unter dem Holzbogen: alle Generationen aus der Chronik und die heutige, die Ehrenbürger-Generation mit Stern.
function spTafel(){
  // Seit 12.3.5: Rolle vor dem Namen (Gründer, Sohn, Enkel, Urenkel, Ururenkel …), ohne Namen nur die Rolle, nie mehr "Generation 1" (Maik 20.11.2026).
  const C=S.chronik||[], n=genNr(), e=S.erbe||{}, w=art=>art==='t', rolle=(nr,art)=>nr===1?(w(art)?'Gründerin':'Gründer'):nr===2?(w(art)?'Tochter':'Sohn'):nr===3?(w(art)?'Enkelin':'Enkel'):'Ur'+'ur'.repeat(nr-4)+(w(art)?'enkelin':'enkel');
  const Z=C.map(c=>[c.n,c.name,rolle(c.n,c.art),`${c.von} bis ${c.bis}`]);
  Z.push([n,S.ich||e.name||'',rolle(n,S.anrede?(S.anrede==='w'?'t':'s'):e.art),`seit ${genJahr(n-1)}`]);
  return `<div class="sptafel"><b><span class="ranke">❦</span>Familie ${esc(S.name)}<span class="ranke r">❦</span></b><div class="linie"></div>${Z.map(([nr,name,r,j])=>`<div>${spBuerger(nr)?'★ ':''}<span class="grolle">${r}</span>${name?' '+esc(name):''}, ${j}</div>`).join('')}</div>`;
}
function spBogenHtml(){return `<div class="spbogen" style="background-image:url(bilder/${bogenBild()}.jpg)"></div>${SP_BILD.bogen?'':`<div class="spspruch">„${SP_SPRUCH}“</div>`}${spTafel()}`}
function medHtml(l){return l.med&&l.med.length?`<div class="gold" style="font-size:14px">${l.med.map(esc).join(' · ')}</div>`:''}

// Fehlende Erntehelfer: so viele, wie man mindestens einstellen muss. Seit 8.0 machen neue Helfer auch stillstehende Maschinen wieder flott.
function helferFehlen(){const b=rebenGesamt(); let k=0; while(helferReben(S.helfer+k)<b) k++; return k}
function dot(id){return `<i class="dot ${SORTEN[id].farbe==='weiss'?'weiss':'rotw'}"></i>`}

// Was gefrorenen Trauben für Eiswein fehlt (ohne die Leseart, die wählt man beim Lesen).
function eisFehlt(f){const g=pruefeQualitaet('eis',feldQ(f,'reif')).filter(x=>!x.startsWith('Leseart')); return g.length?`<b>Kein Eiswein:</b> ${g.join(', ')}`:''}
// Seit 8.0: Satz zur Handlese für Felder mit Edelfäulnis, vor leer.
function handText(f,vor){
  if(!handFeld(f)||!(f.menge>0)||f.gelesen) return '';
  // Seit 14.2.4 auch für Weinberge ohne Maschine (Platzhalter, Wortlaut in Meilenstein 17).
  const n=handBedarf(f), w=f.gefroren?'Gefrorene Trauben':f.edel?'Trauben mit Edelfäulnis':'Diesen Weinberg';
  if(handFehlt(f)) return `${vor}<b>✋ Handlese:</b> <span class="rot">${w} liest man von Hand, dafür brauchst du ${n} Erntehelfer, du hast ${S.helfer}. Liest du so, liest die Maschine, und es gibt höchstens Qualitätswein.</span>`;
  return `${vor}<b>✋ Handlese:</b> ${w} liest man von Hand. ${n?`Dafür brauchst du ${n} Erntehelfer, ${S.helfer>=n?`deine ${S.helfer} reichen`:`du hast ${S.helfer}, mehr Trauben bleiben hängen`}`:'Dieses Feld schafft deine Familie allein'}.`;
}
// Seit 13.4.2 (Bauplan 13.4): was das Hängenlassen bringt, im Weinberg unter der Lese-Hilfe. Wortlaut seit 13.8.
function wagnisHinweis(id){
  const f=S.felder[id], m=S.monat, w=feldWeg(id), wm=Math.round((1-WARTEN_MENGE)*100);
  if(f.gefroren||!(f.menge>0)||f.gelesen) return '';
  // Seit 13.6.2 steht die Chance vor den Sätzen, die sie nutzen (vorher brach der Hinweis im Wagnis mit einem Fehler ab). jh nennt das Jahrhundertjahr.
  const p=wagnisChance(id), cz=p!=null&&chanceZeige(p), rat=p!=null&&chanceRat(p), ch=p==null?'':cz?` Chance: <b>${cz}</b>.${rat?` Der alte Winzer: „Ich würde ${rat}.“`:''}`:' Wie gut die Chance ist, verraten nur die Zeichen: der Sommer, ein Schädlingsjahr und die Alten im Winzerboten.', a=wagnisFeld(id)&&jhArt(), jh=a&&!jhEcht()?` 🌟 ${JH_ART[a].name}, aber nur ein Vorgeschmack: Einen Jahrhundertwein gibt es diesmal nicht, das Wagnis läuft wie sonst.`:a==='winter'?' 🌟 Jahrhundertwinter: Gelingt der Eiswein, wird er der Jahrhundertwein.':a==='sommer'?(tbaOffen()?' 🌟 Jahrhundertsommer: Die Edelfäulnis ist sicher, gelingt die Trockenbeerenauslese, wird sie der Jahrhundertwein.':' 🌟 Jahrhundertsommer: Die Edelfäulnis ist sicher. Der Jahrhundertwein wäre die Trockenbeerenauslese, die gibt es erst ab einem höheren Rang.'):'';
  if(f.wagnis==='frost') return `<br><b>🎲 Wagnis Eiswein:</b> Dein ${SORTEN[id].name} wartet auf Frost im Dezember. Klappt es nicht, ist die Ernte dieses Feldes weg.${ch}${a==='winter'?jh:''}`;
  if(f.wagnis==='edel') return m!==10?'':tbaOffen()?`<br><b>🎲 Wagnis Trockenbeerenauslese:</b> Lässt du die Beerenauslese bis Dezember hängen, kann daraus eine Trockenbeerenauslese werden. Klappt es nicht, ist alles weg, und der Monat kostet ${wm} % Menge.${ch}${a==='sommer'?jh:''}`:'<br><span class="rot">Im Dezember verfault, was noch hängt.</span>';
  const zwei=wegeOffen().length>1, wahl=zwei?` Dein Weg: ${w==='edel'?'bis November auf Edelfäulnis':'bis Dezember auf Frost'}, wählen kannst du bis Oktober.`:'', tend=R().weg==='beide'&&m>=8?` Tendenz im Winzerboten: ${herbstTend().name}.`:'';
  if(m<=9&&w) return `<br><b>🎲 Wagnis:</b>${tend}${wahl} ${w==='edel'?'Lässt du die Trauben bis November hängen, kann Edelfäulnis eine Beerenauslese bringen.':'Lässt du die Trauben bis Dezember hängen, kann Frost einen Eiswein bringen.'} Klappt es nicht, ist die Ernte dieses Feldes weg. Jeder Monat über Oktober kostet ${wm} % Menge.${ch}${a&&JH_ART[a].weg===w?jh:''}`;
  if(m>=9) return `<br><span class="rot">${m===9?`Ab November kostet jeder Monat ${wm} % Menge, im Dezember verfault, was noch hängt.`:'Im Dezember verfault, was noch hängt.'}</span>`;
  return '';
}
// Seit 13.4.3: Sind zwei Wege offen, wählt der Spieler bis Oktober, wie lange er wartet. Der gewählte Weg ist der volle Knopf.
function wagnisKnoepfe(id){
  const f=S.felder[id], m=S.monat; if(m<7||m>9||f.gelesen||!(f.menge>0)||f.wagnis||!wagnisFeld(id)||wegeOffen().length<2) return [];
  const w=feldWeg(id); return [['edel','🍯 Bis Nov.'],['frost','❄️ Bis Dez.']].map(([k,t])=>`<button class="klein${w===k?'':' sec'}" data-a="wagnisWahl" data-id="${id}" data-w="${k}">${t}</button>`);
}
function leseHilfe(f){
  if(sektSorte(feldId(f))) return S.sektkeller?`<b>Jetzt möglich:</b> Sekt, ${num(feldLiter(f,'alles'))} Flaschen. Bei der Lese wählst du ${SEKT_REIFE} oder ${HEFE_LANG} Monate auf der Hefe.`:'<b>Ohne Sektkeller kein Sekt.</b> Die Sekt-Sorte macht nur Sekt.';
  let best=null,bla=null;
  for(const la of ['alles','reif','ueber']){const b=besteStufe(feldQ(f,la)); if(b&&(!best||STUFEN[b].rang>STUFEN[best].rang)){best=b;bla=la}}
  let h=best?`<b>Jetzt möglich:</b> ${stufeText(best,feldQ(f,bla).oe)}${STUFEN[best].lese||best==='eis'?'':' (jede Leseart)'}${STUFEN[best].lese?` (Leseart: ${LESE[bla]})`:''}${best==='eis'?' (Leseart: nur reife oder nur überreife Trauben, nicht beides zusammen)':''}`:'<b>Jetzt möglich:</b> noch nichts, der Zucker reicht nicht';
  if(f.gefroren){const e=best==='eis'?'':eisFehlt(f); return h+(e?'<br>'+e:'')+handText(f,'<br>')}
  h+=handText(f,'<br>');
  const rang=best?STUFEN[best].rang:0;
  // Seit 13.4.2: Beerenauslese, Trockenbeerenauslese und Eiswein kommen nur über das Wagnis (wagnisHinweis), sie stehen hier nicht mehr.
  const ziel=['tafel','qba','kab','spat','aus'].find(st=>STUFEN[st].rang>rang&&rolleDarf(feldId(f),st));
  // Seit 8.0: Liest die Maschine, weil Helfer für die Handlese fehlen, sagt das handText schon, eine "Nächste Stufe" gibt es dann nicht.
  if(ziel&&!handFehlt(f)){
    const la=STUFEN[ziel].lese||'alles', g=pruefeQualitaet(ziel,feldQ(f,la)).filter(x=>!x.startsWith('Leseart'));
    h+=`<br><b>Nächste Stufe:</b> ${STUFEN[ziel].name}`+(g.length?`. Dafür: ${g.join(', ')}`:` mit Leseart „${LESE[la]}“`);
    if(STUFEN[ziel].lese&&g.length) h+=`, Leseart „${LESE[la]}“`;
  }
  return h;
}

// Neues Siegel: Zeile für den nächsten Winzerboten, Album, und die Siegel-Meldung unten im Bild.
// KOMP_LEISE: Beim Monatswechsel und bei der Arbeit der Manager kommt keine Meldung, dann reicht die Zeile im Winzerboten.
let KOMP_LEISE=0, KOMP_Q=[], KOMP_T=0, KOMP_AUS=0, KOMP_AKT='sorte';
function kompMeldung(){
  KOMP_T=0; const el=$('#ksiegel'), Q=KOMP_Q; KOMP_Q=[];
  if(!el||!S||!Q.length) return;
  const [id,st]=Q[Q.length-1], t=Q.length===1?`Neues Siegel: ${KOMP[id].titel}`:`${Q.length} neue Siegel`, u=Q.length===1?`${KOMP_ST[st]} auf dem Siegelbrett`:Q.map(q=>KOMP[q[0]].titel).join(', ');
  el.dataset.id=id; el.innerHTML=`<i class="ksg s${st} an"></i><div><b>${esc(t)}</b><small>${esc(u)}</small></div>`;
  // Liegt ein Fenster von unten offen, kommt die Meldung oben, sonst verdeckt sie dessen Knöpfe.
  el.classList.toggle('oben',$('#sheet').classList.contains('an')); el.classList.add('an'); fx('korken');
  clearTimeout(KOMP_AUS); KOMP_AUS=setTimeout(()=>el.classList.remove('an'),3600);
  // Seit 11.5 (Teil D): Bringt das Siegel eine neue Stufe im Ruf des Hauses, folgt deren Meldung, sobald die des Siegels weg ist.
  if(RUF_M){const k=RUF_M; RUF_M=0; KOMP_AUS=setTimeout(()=>{el.classList.remove('an'); KOMP_AUS=setTimeout(()=>rufMeldung(k),450)},3200)}
}
/* ---- Anzeige: Fenster von unten, aus dem Kellerbuch und aus dem Büro ---- */
const kompSiegel=(st,k)=>`<span class="ksg3${k?' '+k:''}">${[1,2,3].map(i=>`<i class="ksg s${i}${st>=i?' an':''}"></i>`).join('')}</span>`;
function kompZeile(id){
  const D=KOMP[id], st=kompSt(id);
  if(D.wissen) return `<button class="bzeile" data-a="kompEintrag" data-id="${id}"><div class="bz1"><b>${esc(D.titel)}${id==='gebiet_'+S.region?' (dein Gebiet)':''}${lexNeu(id)?'<span class="lneu">Neu</span>':''}</b><span class="kpf">›</span></div><div class="bz2">${esc(kompKurz(id))}</div></button>`;
  return `<button class="bzeile${st?'':' kzu'}" data-a="kompEintrag" data-id="${id}"><div class="bz1"><b>${esc(D.titel)}</b>${kompSiegel(st)}</div>${D.immer?`<div class="bz2">${D.text()}</div>`:''}<div class="${D.immer?'bz3':'bz2'}">${esc(kompNaechst(id))}</div></button>`;
}
const kompEtikett=id=>`<span class="getik${kompBocks(id)?' bb':''}">${kompBocks(id)?'Bocksbeutel':'Gold-Etikett'}</span>`;
function kompBrettZeile(id){
  const D=KOMP[id], e=(S.komp||{})[id]||{st:0}, st=e.st||0, W=D.w, name=id==='sekt'?(S.rollen?'Regional-Sekt':'Sekt'):D.name;
  const lauf=st<3&&(st<2||W[2]);
  return `<button class="bzeile sz${st?'':' leer'}${st>=3?' gold':''}" data-a="kompEintrag" data-id="${id}"><div class="bz1"><b>${esc(name)}</b>${kompSiegel(st)}</div>`
    +`<div class="bz2">${st>=3?`<span>✔ Alle drei Siegel</span>${kompEtikett(id)}`:esc(kompNaechst(id))}</div>${lauf?`<div class="bar g"><i style="width:${Math.min(100,(e.f||0)/W[st]*100)}%"></i></div>`:''}</button>`;
}
function vBrett(){
  const z=kompZahlen(), n=rufStufe(), S7=RUF_STUFEN.length, nx=RUF_STUFEN[n], RL=kompRollen(), fr=S.region==='franken';
  const marken=RUF_STUFEN.map(x=>`<u style="left:${(x/z.max*100).toFixed(2)}%"></u>`).join('');
  const ruf=(n?`${RUF_NAMEN[n-1]}: Die Händler zahlen ${rufProz(n)} % mehr.`:'Noch keine Stufe.')+(nx?` Noch ${nx-z.hab===1?'1 Siegel':`${nx-z.hab} Siegel`} bis Stufe ${n+1}, ${RUF_NAMEN[n]}.`:' Alle Stufen erreicht.');
  let h=fenster('brett','Siegelbrett',`<div class="kv"><span>Siegel in dieser Partie</span><span>${z.hab} von ${z.max}</span></div><div class="bar g stb"><i style="width:${z.hab/z.max*100}%"></i>${marken}</div>
    <div class="kv"><span>🏛️ Ruf des Hauses</span><span>${n?`Stufe ${n} von ${S7}`:'noch keine Stufe'}</span></div><div class="fstand ruf">${ruf}</div>`,{
    i:`Für die neun Stufen und den Sekt gibt es je drei Siegel, und jeder Eintrag hängt an einer deiner Rebsorten: Federweißer bis Spätlese an der Menge-Sorte, Auslese bis Eiswein an der Spitzen-Sorte, der Sekt an der Sekt-Sorte. Bronze und Silber bringen verkaufte Flaschen, Gold viele Flaschen oder eine Goldmedaille. Mit allen drei Siegeln bekommt der Wein sein Gold-Etikett${fr?', ein Silvaner in Franken den Bocksbeutel':''}. Bei ${RUF_STUFEN.slice(0,-1).join(', ')} und ${RUF_STUFEN[S7-1]} Siegeln steigt der Ruf des Hauses um eine Stufe, jede bringt ${rufProz(1)} % mehr bei jedem Verkauf. Ein Tipp auf einen Wein zeigt seine Geschichte und was noch fehlt. Die Siegel zählen je Partie, das Album merkt sich deine besten über alle Partien.`});
  for(const [rl,rn] of KOMP_BRETT){
    const I=kompBrettIds(rl), hab=I.reduce((a,id)=>a+kompSt(id),0), alt=rl==='sekt'&&!S.rollen;
    h+=fenster('brett_'+rl,`${esc(alt?'Sekt':SORTEN[RL[rl]].name)}<small>${alt?'jede Sorte zählt':rn} · ${hab} von ${I.length*3} Siegeln</small>`,`<div class="fzl">${I.map(kompBrettZeile).join('')}</div>`,{buch:false});
  }
  const A=kompAlbumLies(), an=KOMP_ALBUM.filter(id=>A[id]).length, sg=KOMP_ALBUM.reduce((s,id)=>s+Math.min(3,Math.max(0,Math.floor(+A[id]||0))),0), alt=KOMP_ALBUM_ALT.filter(id=>A[id]).length;
  return h+`<p class="fussnote album">📚 Album über alle Partien: ${an} von ${KOMP_ALBUM.length} Weinen entdeckt, ${sg} von ${KOMP_ALBUM.length*3} Siegeln.${alt?`<br>Aus der Zeit vor Version 11.4: ${alt} von ${KOMP_ALBUM_ALT.length} Einträgen.`:''}</p>`;
}
function vLexikon(){
  if(!KOMP_KAP.some(k=>k[0]===KOMP_AKT)) KOMP_AKT='sorte';
  const K=KOMP_KAP.find(k=>k[0]===KOMP_AKT), L=lexSeiten(K[0]);
  return fenster('lexikon',`Lexikon<small>${lexAlle().length} Seiten zum Nachlesen, ohne Siegel</small>`,`<div class="chips kchips">${KOMP_KAP.map(k=>`<button class="chip ${k[0]===KOMP_AKT?'an':''}" data-a="kompKap" data-id="${k[0]}">${k[1]} ${k[2]}${lexSeiten(k[0]).some(lexNeu)?'<i class="lpunkt"></i>':''}</button>`).join('')}</div>
    <h4 class="gk">${K[1]} ${K[3]} · ${L.length} ${L.length===1?'Seite':'Seiten'}</h4><div class="fzl">${L.map(kompZeile).join('')}</div>`,{
    i:'Alles zum Nachlesen, ohne Siegel: deine Rebsorten, die Edelfäulnis und die Regeln zur Reifezeit, Gebiet und Lagen, Keller und Technik und die Gefahren. Oben wählst du ein Kapitel, ein Tipp auf eine Seite zeigt ihre Geschichte und was im Spiel gilt. Neue Seiten, zum Beispiel ein Schädling nach dem ersten Schädlingsjahr, tragen ein gelbes „Neu“, bis du sie einmal geöffnet hast.'});
}
// Eine Seite: Geschichte, die Zeile "Im Spiel" und bei Einträgen mit Siegeln die drei Bedingungen. Die Geschichte gibt es mit dem ersten Siegel, auf Wissens-Seiten sofort.
function kompEintragHtml(id){
  const D=KOMP[id], w=D.wissen, e=(S.komp||{})[id]||{st:0}, st=w?0:e.st||0, K=KOMP_KAP.find(k=>k[0]===D.kap), aid=w?null:kompAlbumId(id), A=aid?Math.floor(+kompAlbumLies()[aid]||0):0;
  const bal=(a,b)=>`<div class="bar g"><i style="width:${Math.min(100,(a||0)/b*100)}%"></i></div>`;
  const bed=(i,extra)=>`<div class="kbed"><i class="ksg s${i}${st>=i?' an':''}"></i><div><b>${KOMP_ST[i]}, ${KOMP_ST_WORT[i]}</b><span>${esc(kompBed(D,e,i))}${extra||''}</span>${st===i-1&&(i<3||D.w[2])?bal(e.f,D.w[i-1]):''}</div></div>`;
  return `${KOMP_BILD(id)?sbild(KOMP_BILD(id)):''}<h3>${K[1]} ${esc(D.titel)}</h3><p class="mut" style="margin:-4px 0 8px">${w?K[3]:(KOMP_BRETT.find(b=>b[0]===D.rl)||[0,K[3]])[1]} · ${w?'zum Nachlesen':st?`${KOMP_ST[st]}, ${KOMP_ST_WORT[st]}`:'noch kein Siegel'}</p>
    <p>${st||w?kompGeschichte(id):'<span class="mut">Die Geschichte dazu gibt es mit dem ersten Siegel.</span>'}</p>
    <div class="hilfe kspiel"><b>📌 Im Spiel</b><br>${D.text()}</div>
    ${w?'':`<p class="mut">${esc(kompZaehlt(id))}</p>${bed(1)}${bed(2)}${bed(3,`${/\.$/.test(kompBed(D,e,3))?'':'.'} Dafür gibt es ${kompBocks(id)?'den Bocksbeutel':'das Gold-Etikett'}.`+(st<2?' Gold zählt erst, wenn du Silber hast.':'')+(e.gm&&!D.w[2]&&st<3?' ✔ Die Goldmedaille hast du schon.':''))}
    ${A>st?`<p class="mut" style="margin-top:8px">📚 Im Album aus einer anderen Partie: ${KOMP_ST[A]}.</p>`:''}`}
    ${e.l?`<div class="kv" style="margin-top:8px"><span>Bisher gelesen</span><span>${num(e.l)} l</span></div>`:''}
    <div class="btns"><button class="sec" data-a="archivGeh" data-id="${w?'lexikon':'brett'}">Zurück</button></div>`;
}
// Seit 11.8: Alle Wege ins frühere Weinkompendium führen ins Weinarchiv, aufs Siegelbrett oder ins Lexikon.
function archivGeh(teil){
  if(!S) return; if($('#sheet').classList.contains('an')) closeSheet();
  const da=TAB==='keller'&&SUB==='buch'; ARCHIV=ARCHIV_B.some(b=>b[0]===teil)?teil:'brett'; FI_AUF.clear(); geh('keller','buch'); render(); if(!da) window.scrollTo(0,0);
}
// Fenster im Büro: Zähler und die Wege aufs Siegelbrett und ins Lexikon (seit 11.8).
function kompFenster(){
  const z=kompZahlen();
  return fenster('komp','Weinarchiv',`<div class="kv"><span>Siegel in dieser Partie</span><span>${z.hab} von ${z.max}</span></div><div class="bar g"><i style="width:${z.hab/z.max*100}%"></i></div>`,{buch:'buch',kn:[pk('archivGeh','Siegelbrett','',{id:'brett'}),pk('archivGeh','Lexikon','',{sec:1,id:'lexikon'})],
    i:`Dein Weinarchiv steht in der Kellerei: deine Weine, das Siegelbrett und das Lexikon. Für die neun Stufen und den Sekt gibt es je drei Siegel, und jeder Eintrag hängt an einer deiner Rebsorten, zum Beispiel „${esc(KOMP.stufe_kab.titel)}“. Bronze und Silber bringen verkaufte Flaschen, Gold viele Flaschen oder eine Goldmedaille. Mit den Siegeln steigt der Ruf des Hauses. Über deine Rebsorten, Gebiet, Keller, Technik und Gefahren liest du im Lexikon nach, ohne Siegel. Die Siegel zählen je Partie, das Album merkt sich deine besten über alle Partien.`});
}

// Der Winzerbote: Themen melden sich mit schlag() in TOP, das wichtigste wird Schlagzeile, der Rest Artikel. FUSS sammelt Kurzes für ganz unten.
let TOP=[], FUSS=[];
// p ist die Wichtigkeit, bild ein Foto aus bilder/, o weitere Angaben (archiv, sonder, gold, ende, liste, stand, wett).
// Version 4.1 bis 8.0: Rat vom alten Winzer, ein Tipp je Ausgabe in den ersten zwei Spieljahren. Seit 8.1 (Paket B, Maik 17.11.2026) gibt es den Rat
// nur noch als Sprechblase des Spielführers, die Ecke im Winzerboten füllt von Anfang an die Rubrik (Annahme Claude).
function ratHtml(b,k){
  const u=!k.sonder&&!k.ende&&b.rub&&typeof b.rub==='object'?b.rub:null;
  return u?`<div class="zrat"><h4>${esc(u.h)}</h4>${esc(u.text)}${u.von?`<br><i>${esc(u.von)}</i>`:''}</div>`:'';
}
const nfZeile=()=>nfName()?`<div class="mut" style="margin-top:8px">Es übernimmt: ${esc(nfName())}.</div>`:'';
function zeigeNachfolger(){
  const f=S.ende.nf, alt=$('#nfname'), name=alt?alt.value:f.name;
  openSheet(`${sbild(GEN_BILD.uebergabe)}<h3>Der letzte Schlüssel</h3><p>Zum letzten Mal liegt der alte Kellerschlüssel auf dem Küchentisch. Mit dieser Übergabe endet die Partie, danach kommt die Chronik.</p>
    <h3>Wer übernimmt?</h3><div class="chips">${[['t','Die Tochter'],['s','Der Sohn']].map(([k,t])=>`<button class="chip ${f.art===k?'an':''}" data-a="nfArt" data-id="${k}">${t}</button>`).join('')}</div>
    <input type="text" id="nfname" maxlength="20" placeholder="${esc(nfVorschlag())}" value="${esc(name)}">
    <div class="btns"><button data-a="nfJa">Zum Küchentisch</button></div>`);
}
// Reiter ende: Bild der Übergabe, die Geschichte, die Chronik als Abspann, die Bestenliste und der Knopf für ein neues Spiel.
// Die Chronik: Generationen, der Weg durch die Ränge, die Wahlen, die Weltweinschauen, Spenden mit Stiftung, Medaillen und das Weingut in seinen Stufen.
function vEnde(){
  const E=S.ende, A=S.amt||{}, st=E.stand||{}, C=S.chronik||[], L=bestenZeilen();
  const kv=(a,x)=>`<div class="kv"><span>${a}</span><span>${x}</span></div>`, karte=(t,h)=>h?`<div class="card"><h3>${t}</h3>${h}</div>`:'';
  const wer=(nr,name,art)=>nr===1?(name?`${esc(name)}, ${art==='t'?'die Gründerin':'der Gründer'}`:'die Gründung'):name?`${esc(name)}, ${art==='s'?'der Sohn':'die Tochter'}`:'die nächste Generation';
  const titel=c=>c.ehr?(c.art==='t'?'Ehrenpräsidentin':'Ehrenpräsident'):c.alt?(c.art==='t'?'Altpräsidentin':'Altpräsident'):c.art==='t'&&RAENGE[c.rang].kw||RAENGE[c.rang].kurz;
  const gen=C.map(c=>`<div class="rl"><span>${c.n}.</span><div><b>${c.von} bis ${c.bis}: ${wer(c.n,c.name,c.art)}</b><span class="mut">übergeben als ${titel(c)} mit ${num(c.ans)} Ansehen</span></div></div>`).join('');
  // Ränge: Monat und Jahr aus den Ehrungen (je Aufstieg eine), die Spielzeit aus S.zeitRang.
  const R_=(S.ehrungen||[]).filter(e=>e.a&&e.r!=null).sort((a,b)=>a.r-b.r);
  const raenge=R_.map(e=>{const z=(S.zeitRang||[]).find(x=>x.r===e.r); return kv(esc(e.w&&RAENGE[e.r].w||RAENGE[e.r].name),`${MON[e.m]} ${e.j}${z&&!S.zeitAlt?`<small class="bzs">${zeitTxt(z.s)}</small>`:''}`)}).join('');
  const W=A.wahlen||[], wahlen=W.length?W.map(w=>kv(`${MON[w.m]} ${w.j}${w.geg?' gegen '+esc(w.geg):''}`,`${w.ok?(w.im?'gewonnen':'zurück im Amt'):(w.im?'abgewählt':'verloren')} · ${w.s} zu ${w.marke}`)).join('')
    :`<div class="mut">Zu einer Wahl ist es nicht mehr gekommen.</div>`;
  // Seit 13.6.5: Jahr und Generation des Sieges und jeder Krone, darunter jede Schau mit ihrer Klasse (alte Einträge ohne Klasse wie bisher).
  const WS=A.welt||[], KR=A.kronen||[], kName=k=>(KRONEN.find(K=>K.k===k)||{}).name||'';
  const welt=A.brief?((A.ehren?kv('🎗️ Der Sieg',`${A.ehren.j}${A.ehren.gen?`, ${A.ehren.gen}. Generation`:''}`):'')
    +KRONEN.map(K=>{const x=KR.find(y=>y.k===K.k); return kv(`${K.sym} ${K.name}`,x?`${x.j}, ${x.gen}. Generation`:'nicht geholt')}).join('')
    +(WS.length?WS.map(w=>kv(`${w.j}${w.kl?' · '+kName(w.kl):''}${w.wein?': '+esc(w.wein):''}`,w.platz===1?(w.kl?'👑 Krone':'🌍 Sieg'):w.platz?`Platz ${w.platz}`:'nicht angetreten')).join(''):`<div class="mut">Der Brief kam ${monJahr(A.brief).replace(/^(\S+) /,'im $1 ')}, zu einer Schau ist es nicht mehr gekommen.</div>`))
    :`<div class="mut">Die Weltweinschau kam nie ins Dorf. Dafür hätte es alle ${SPENDEN.length-1} Spenden und eine gewonnene Wahl gebraucht.</div>`;
  const SP=(S.spenden||[]).slice().sort((a,b)=>a.s-b.s), spenden=SP.length?SP.map(x=>kv(esc(spKurz(x.s,x))+(x.st?' (Stiftung)':''),`${MON[x.m]} ${x.j}`)).join('')+(SP.length<SPENDEN.length-1?`<div class="mut">${SP.length} von ${SPENDEN.length-1} Stufen.</div>`:''):'';
  const wein=(S.ehrungen||[]).filter(e=>!e.a&&MED_NAME[e.i]), med=wein.length?`<div class="gold" style="font-size:17px">${ehrSumme(wein)}</div>`:'';
  const stufen=Array.from({length:Math.min(10,S.rang+1)},(_,k)=>`<div style="background-image:url(bilder/${wgBild(k+1,'sommer')}.jpg)"><span>${esc(rangK(k))}</span></div>`).join('');
  const amtZ=A.zeit?`${A.zeit} ${A.zeit===1?'Amtszeit':'Amtszeiten'}`:'';
  return `<div id="ende"><div class="ehero" style="background-image:url(bilder/${ENDE_BILD.best}.jpg)"><div><small>Das beste Ende</small><b>Die Übergabe am Küchentisch</b></div></div>
  <div class="ein">
    <div class="card etext">${endeText().map(x=>`<p>${esc(x)}</p>`).join('')}<p class="mut">${MON[E.m]} ${E.j}: ${esc(S.ich||S.name)} übergibt als ${duN()}. Mehr geht nicht: ${anr('Präsident','Präsidentin')}, alle ${KRONEN.length} Kronen der Weltweinschau, ${ehrP()}.</p></div>
    <div class="card"><h3>📜 Chronik von ${esc(S.name)}</h3>${kv('Gespielt',`${st.jahre} Jahre, ${genNr()} ${genNr()===1?'Generation':'Generationen'}`)}${S.zeit!=null?kv('Spielzeit',zeitTxt(S.zeit)+(S.zeitAlt?' (seit 8.3)':'')):''}${kv('Vermögen',eur(st.verm||0))}${kv('Ansehen',num(st.ans||0))}${amtZ?kv('Im Amt',amtZ):''}${kv('Das Ende',ENDE_NAME[E.art])}${A.ehren?kv('Der Sieg',`${A.ehren.j}${A.ehren.gen?`, ${A.ehren.gen}. Generation`:''}`):''}${E.platz?kv('Bestenliste',`Platz ${E.platz}`):''}</div>
    ${karte('👪 Die Generationen',gen+nfZeile())}${karte('🪜 Der Weg nach oben',raenge)}
    ${stufen?`<div class="card"><h3>🏡 Das Weingut wächst</h3><div class="ewg">${stufen}</div></div>`:''}
    ${karte('🗳️ Die Wahlen im Verband',wahlen)}${karte('🌍 Die Weltweinschau',welt)}${karte('🤝 Für das Dorf',spenden)}${karte('🏅 Medaillen',med)}
    ${L.length?`<div class="card"><h3>🏆 Bestenliste</h3>${L.map(bestenZeile).join('')}</div>`:''}
    <div class="mut" style="margin:0 0 10px">Dieser Spielstand ist abgeschlossen. Er bleibt mit seiner Chronik auf seinem Platz liegen, bis du ihn löschst.</div>
    <div class="btns"><button data-a="titelNeu">Neues Spiel</button><button data-a="menue">Spielstände</button></div>
  </div></div>`;
}
// Das Schriftstück zur Übergabe: Geschichte, Zahlen, dann Tochter oder Sohn und der Vorname. Bis zum Übergeben geht nichts anderes.
function zeigeErbe(){
  const e=S.erbe, T=GEN_TEXT[e.k]||GEN_TEXT.weiter, alt=$('#erbname'), name=alt?alt.value:e.name;
  openSheet(`${sbild(GEN_BILD.uebergabe)}<h3>${esc(T.t)}</h3>${T.p().map(x=>`<p>${esc(x)}</p>`).join('')}${e.ratte?'<p>Im Korkenlager wuselt es. Die Kleine heißt natürlich auch Frau Öchsle.</p>':''}
    <p class="mut">Erbschaftssteuer: ${eur(e.steuer)}, ${pz(ERB_STEUER)} von ${eur(e.verm)} Vermögen.${e.kredit?` Davon leiht dir die Bank ${eur(e.kredit)} über ${ERB_LAUFZEIT} Monate, das zählt nicht gegen deinen Kreditrahmen.`:''} Ansehen: ${num(e.ansVor)} vorher, ${num(e.ans)} jetzt. Rang, Fläche, Keller, Wein, Leute und Manager bleiben.</p>
    <h3>Wer übernimmt?</h3><div class="chips">${[['t','Die Tochter'],['s','Der Sohn']].map(([k,t])=>`<button class="chip ${e.art===k?'an':''}" data-a="erbeArt" data-id="${k}">${t}</button>`).join('')}</div>
    <input type="text" id="erbname" maxlength="20" placeholder="${esc(erbeVorschlag())}" value="${esc(name)}">
    <div class="btns"><button data-a="erbeJa">Übergeben</button></div>`);
}
// Schriftstück ohne Eingabe (bisher nur der Anfang). S.erz merkt es bis zum nächsten Zeichnen, der Test-Spieler schließt es gleich wieder.
function zeigeErz(){
  const T=GEN_TEXT[S.erz]; S.erz=null; save(); if(!T) return;
  openSheet(`${sbild(GEN_BILD[T===GEN_TEXT.anfang?'anfang':'uebergabe'])}<h3>${esc(T.t)}</h3>${T.p().map(x=>`<p>${esc(x)}</p>`).join('')}${T.mut?`<p class="mut">${esc(T.mut())}</p>`:''}<div class="btns"><button data-a="close">Weiter</button></div>`);
}
// Generationen-Chronik im Büro.
function chronikHtml(){
  const C=S.chronik||[], n=genNr(), e=S.erbe, wer=(nr,name,art)=>nr===1?(name?`${esc(name)}, ${art==='t'?'die Gründerin':'der Gründer'}`:'die Gründung'):name?`${esc(name)}, ${art==='s'?'der Sohn':'die Tochter'}`:'die nächste Generation';
  return fenster('chronik','Generationen-Chronik',`${C.map(c=>`<div class="rl"><span>${c.n}.</span><div><b>${c.von} bis ${c.bis}: ${wer(c.n,c.name,c.art)}</b><span class="mut">übergeben als ${c.ehr?(c.art==='t'?'Ehrenpräsidentin':'Ehrenpräsident'):c.alt?(c.art==='t'?'Altpräsidentin':'Altpräsident'):c.art==='t'&&RAENGE[c.rang].kw||RAENGE[c.rang].kurz} mit ${num(c.ans)} Ansehen${c.ende?'':`, Erbschaftssteuer ${eur(c.steuer)}`}</span></div></div>`).join('')}
    ${S.ende?'':`<div class="rl du"><span>${n}.</span><div><b>seit ${genJahr(n-1)}: ${wer(n,S.ich||(e&&e.name),S.anrede?(S.anrede==='w'?'t':'s'):e&&e.art)}</b><span class="mut">${S.flascheAuf?'Die Flasche vom ersten Jahrgang ist getrunken. ':S.gesch&&S.gesch.flasche?'Die Flasche vom ersten Jahrgang liegt noch im Regal. ':''}${amtEhre()?`Letzte Übergabe im Januar ${endeJahr()}`:`Nächste Übergabe im Januar ${genJahr(n)}`}</span></div></div>`}${S.ende?nfZeile():''}`,{
    buch:'generationen',i:`Alle ${GEN_JAHRE} Jahre übernimmt die nächste Generation. Vom Ansehen bleiben ${pz(ERB_ANSEHEN)}, als Ehrenbürger ${pz(SP_ERBE)}, ${pz(ERB_STEUER)} vom Vermögen gehen als Erbschaftssteuer weg, alles andere bleibt. Zu Ende ist die Partie erst mit allen ${KRONEN.length} Kronen der Weltweinschau: Danach übergibst du ein letztes Mal, ohne Erbschaftssteuer, und es folgt die Chronik.`});
}
function bestenZeilen(){
  return besten().map((e,i)=>({platz:i+1,du:S&&e.d===S.bestenD,name:e.ich||e.name,
    sub:`${e.ich?e.name+' · ':''}${e.rang===R_MAX?'👑 ':''}${e.w&&(RAENGE[e.rang]||{}).kw||(RAENGE[e.rang]||RAENGE[0]).kurz} · ${(DIFF[e.schwer]||{}).name||''}${e.gen>1?` · ${e.gen}. Generation`:''}${e.amt?` · ${e.amt} ${e.amt===1?'Amtszeit':'Amtszeiten'}`:''}${ENDE_NAME[e.ende]?' · '+ENDE_NAME[e.ende]:''}${e.sj?` · Sieg ${e.sj}, ${e.sg}. Generation`:''}`,
    rechts:bestenZeit(e)+(e.zs!=null?`<small class="bzs">${zeitTxt(e.zs)}</small>`:'')}));
}
const bestenZeile=x=>`<div class="rl ${x.du?'du':''}"><span>${x.platz}.</span><div><b>${esc(x.name)}</b><span class="mut">${esc(x.sub)}</span></div><b class="rz">${x.rechts}</b></div>`;
function bestenHtml(){
  const L=bestenZeilen();
  return `<div class="card"><h3>🏆 Bestenliste</h3>${L.length?L.map(bestenZeile).join(''):`<div class="mut">Noch leer. ${BESTEN_I}</div>`}</div>`;
}
// Bilanz in der Sonderausgabe: Zahlen, Bestenliste, Knopf für ein neues Spiel.
function endeHtml(k){
  const st=k.stand||{}, L=bestenZeilen();
  const z=(t,w)=>`<div><small>${t}</small><b${String(w).length>10?' class="lang"':''}>${w}</b></div>`;
  return `<div class="zstand">${z('Gespielt',`${st.jahre} Jahre`)}${z('Rang',RAENGE[st.rang]?rangK(st.rang):RAENGE[0].kurz)}${z('Platz',`${st.platz}. von ${S.gegner.length+1}`)}${z('Vermögen',eur(st.verm||0))}${z('Ansehen',num(st.ans||0))}</div>
    ${L.length?`<div class="zart"><h3>Die Bestenliste</h3><div class="zliste">${L.map(x=>`<div class="${x.du?'du':''}"><span>${x.platz}.</span><b>${esc(x.name)}<small>${esc(x.sub)}</small></b><span>${x.rechts}</span></div>`).join('')}</div></div>`:''}
    <div class="zknopf"><button data-a="infoWeiter">Weiterspielen ▶</button> <button data-a="titelNeu">Neues Spiel</button></div>`;
}
function zeigePruefer(){
  const F=panschListe(), max=Math.floor(Math.min(BESTECH_MAX,S.geld)/1000)*1000;
  openSheet(`${sbild('kontrolle')}<h3>🔍 Weinkontrolle</h3><p>Der Prüfer steht im Keller und will dein Kellerbuch sehen. Darin ${F.length===1?'steht ein gepanschter Wein':`stehen ${F.length} gepanschte Weine`}:</p>
    <ul class="kl">${F.map(l=>`<li>${esc(lotName(l))}, ${num(l.liter)}\u00a0l</li>`).join('')}</ul>
    <p class="mut">${F.length===1?'Findet er ihn, wird er vernichtet':'Findet er sie, werden sie vernichtet'}. ${verwarnOffen()?KONTR_TEXT.verwarnErst:`Dazu kommen ${eur(strafeHoehe())} Strafe${strafeAns()?` und ${strafeAns()} Ansehen Abzug`:''}, und fünf Jahre lang kommt er jedes Jahr wieder.`}</p>
    <div class="btns"><button class="wag" data-a="pruefBestechen" ${max<BESTECH_MIN?'disabled':''}>Bestechen</button><button data-a="pruefJa">Prüfen lassen</button></div>`);
}
// Alle Texte zum Amt an einer Stelle. k ist der Fall, p sind die gemerkten Zahlen und Namen. Fällt eine Übergabe in denselben Monat,
// schreibt erbeBenennen die Texte mit der neuen Anrede noch einmal (Merkmal amt an der Schlagzeile).
function amtTxt(k,p){
  const P=anr('Präsident','Präsidentin'), AP=altP(), kopf='Der Weinbauverband hat gewählt.';
  const latte=p.neu>p.marke?` Dann liegt die Latte höher: Du brauchst ${p.neu}.`:` Die Latte bleibt bei ${p.neu}.`;
  if(k==='umfrage'){
    const vorn=p.s>=p.marke, klar=p.s>=p.marke+15, hilf=klar?'Das sieht gut aus. Aber die Stimmung bröckelt jeden Monat ein wenig, also bleib sichtbar.'
      :vorn?'Das ist knapp, denn bis zur Wahl bröckelt die Stimmung jeden Monat. Medaillen, ein Hoffest und alles, was Ansehen bringt, halten dich vorn.'
      :'Das reicht nicht. Jetzt helfen Medaillen, ein Hoffest und alles, was Ansehen bringt. Wer es eilig hat, findet im Rathaus auch andere Wege.';
    return {t:klar?(p.im?'Umfrage zur Wahl: Du liegst vorn':'Umfrage zur Wahl: Der Stuhl wackelt'):vorn?'Umfrage zur Wahl: Es wird eng':'Umfrage zur Wahl: Es reicht noch nicht',
      text:`In einem Jahr, im ${p.wann}, wählt der Weinbauverband. ${p.im?`${p.g} ${p.wo} fordert dich heraus.`:`Du trittst gegen ${p.g} an, ${p.gw?'die':'der'} seit deiner Abwahl auf dem Stuhl sitzt.`} In der Umfrage des Winzerboten steht die Stimmung für dich bei ${p.s} von 100, am Wahltag brauchst du ${p.marke}. ${hilf}`};
  }
  if(k==='gewonnen') return {t:`Wiedergewählt: Du bleibst ${P}`,text:`${kopf} Die Stimmung für dich lag bei ${p.s}, gebraucht hast du ${p.marke}. ${p.g} gratuliert mit zusammengebissenen Zähnen. ${p.letzte?`Deine ${p.zeit}. Amtszeit beginnt. Es war deine letzte Wahl: Im Januar ${p.letzte} übergibst du das Weingut.`:`Deine ${p.zeit}. Amtszeit beginnt, die nächste Wahl ist im ${p.wann}.${latte}`}`};
  if(k==='zurueck') return {t:`Zurück auf dem Stuhl: Du bist wieder ${P}`,text:`${kopf} Die Stimmung für dich lag bei ${p.s}, gebraucht hast du ${p.marke}. ${p.g} räumt den Stuhl im Festsaal, das Kissen ist noch warm. ${p.letzte?`Deine ${p.zeit}. Amtszeit beginnt. Es war deine letzte Wahl: Im Januar ${p.letzte} übergibst du das Weingut.`:`Deine ${p.zeit}. Amtszeit beginnt, die nächste Wahl ist im ${p.wann}.${latte}`}`};
  if(k==='verloren') return {t:`Abgewählt: ${p.g} übernimmt den Stuhl`,text:`${kopf} Die Stimmung für dich lag bei ${p.s}, gebraucht hättest du ${p.marke}. ${p.g} ${p.wo} sitzt jetzt auf dem Stuhl im Festsaal. ${amtEhre()?`Den Stuhl bist du los, ${ehrP()} bleibst du, und du`:`Du bist ${AP} und`} behältst alles, was du aufgebaut hast: Rang, Fläche, Geld und Ansehen. ${p.letzte?`Eine weitere Wahl gibt es für dich nicht mehr: Im Januar ${p.letzte} übergibst du das Weingut.`:`Im ${p.wann} wird wieder gewählt. Dann kannst du dir den Stuhl zurückholen${p.neu!=null?(p.neu<p.marke?`, und dafür reichen dann ${p.neu}`:`, dafür brauchst du wieder ${p.neu}`):''}.`}`};
  if(k==='wieder') return {t:`${p.g} bleibt auf dem Stuhl`,text:`${kopf} Die Stimmung für dich lag bei ${p.s}, gebraucht hättest du ${p.marke}. ${p.g} bleibt ${p.gw?'Präsidentin':'Präsident'}, du bleibst ${amtEhre()?ehrP():AP}. ${p.letzte?`Eine weitere Wahl gibt es für dich nicht mehr: Im Januar ${p.letzte} übergibst du das Weingut.`:`Im ${p.wann} wird wieder gewählt.`}`};
  if(k==='skandal') return {t:'Stimmenkauf im Verband aufgeflogen',text:`Ein Umschlag ist am falschen Tisch gelandet. Jetzt weiß der ganze Verband, dass bei ${S.name} Stimmen gekauft werden sollten. Das Geld ist weg, und die Stimmung für dich ist um ${KAUF_STRAFE} gefallen.`};
  return {t:'Im Verband wird jetzt gewählt',text:`Der Weinbauverband hat seine Satzung geändert: Ab sofort wird alle ${WAHL_JAHRE} Jahre gewählt, und auch ${anr('der Präsident','die Präsidentin')} muss sich stellen. Die Stimmung für dich steht bei ${p.s} von 100, deine erste Wahl ist im ${p.wann}. Alles dazu steht im Rathaus im Fenster „Weinbauverband“.`};
}
function zeigePleite(){
  openSheet(`${sbild('pleite')}<h3>Dein Weingut ist pleite</h3><p>Der Gerichtsvollzieher hat gepfändet. Deine Schulden von ${eur(schulden())} lagen dreimal in Folge über dem Kreditrahmen.</p>${(st=>`<h4 class="gk">Was bis hierher geschafft war</h4><div class="kv"><span>Gespielt</span><span>${st.jahre} Jahre, ${genNr()}. Generation</span></div><div class="kv"><span>Rang</span><span>${esc(duN())}</span></div><div class="kv"><span>Platz</span><span>${st.platz}. von ${S.gegner.length+1}</span></div><div class="kv"><span>Ansehen</span><span>${num(st.ans)}</span></div>${S.pleiteP?`<div class="kv"><span>Bestenliste</span><span>Platz ${S.pleiteP}, als pleite</span></div>`:''}`)(endStand())}
    <h4 class="gk">👪 Die Generationen</h4>${pleiteGen()}
    <p class="mut">Der Spielstand bleibt mit allem liegen, bis du ihn löschst. Ein neues Spiel kannst du auch auf einem freien Platz unter „Spielstände“ beginnen.</p>
    <div class="btns"><button class="sec" data-a="menue">Spielstände</button><button data-a="pleiteNeu">Neues Spiel</button></div>`);
}
// Seit 11.7 (A29): die Generationen im Pleite-Fenster, wie in der Chronik, die laufende mit dem Jahr der Pfändung.
function pleiteGen(){
  const C=S.chronik||[], n=genNr(), e=S.erbe;
  const wer=(nr,name,art)=>nr===1?(name?`${esc(name)}, ${art==='t'?'die Gründerin':'der Gründer'}`:'die Gründung'):name?`${esc(name)}, ${art==='s'?'der Sohn':'die Tochter'}`:'die nächste Generation';
  const titel=c=>c.ehr?(c.art==='t'?'Ehrenpräsidentin':'Ehrenpräsident'):c.alt?(c.art==='t'?'Altpräsidentin':'Altpräsident'):c.art==='t'&&RAENGE[c.rang].kw||RAENGE[c.rang].kurz;
  return C.map(c=>`<div class="rl"><span>${c.n}.</span><div><b>${c.von} bis ${c.bis}: ${wer(c.n,c.name,c.art)}</b><span class="mut">übergeben als ${titel(c)} mit ${num(c.ans)} Ansehen</span></div></div>`).join('')
    +`<div class="rl du"><span>${n}.</span><div><b>${genJahr(n-1)} bis ${S.jahr}: ${wer(n,S.ich||(e&&e.name),S.anrede?(S.anrede==='w'?'t':'s'):e&&e.art)}</b><span class="mut">gepfändet als ${esc(rangK(S.rang))} mit ${num(S.ansehen)} Ansehen</span></div></div>`;
}

function neuLies(){const a=$('#nm'), b=$('#nmI'); if(a) NEU.name=a.value; if(b) NEU.ich=b.value}
function vStart(){
  const namen=`<label class="feld">Dein Name<input type="text" id="nmI" maxlength="30" placeholder="Vorname Nachname" autocomplete="off" value="${esc(NEU.ich||'')}"></label>
    <label class="feld">Name des Weinguts<input type="text" id="nm" maxlength="${NAME_MAX}" placeholder="Rebenreich" autocomplete="off" value="${esc(NEU.name)}"></label>
    <div class="feld">Anrede</div><div class="zwei">${[['m','Herr'],['w','Frau']].map(([k,x])=>`<button class="wahl neuwahl ${NEU.anrede===k?'an':''}" data-a="neuOpt" data-k="anrede" data-v="${k}"><b>${x}</b></button>`).join('')}</div>`;
  const gebiete=Object.entries(REGIONEN).map(([id,r])=>{
    // Seit 13.4.1: statt der Schilder leicht, mittel, riskant der Satz zur Spielweise und bei der Pfalz der Hinweis für die erste Partie.
    const G=GEBIET_TEXT[id], an=NEU.region===id, sb=steckbrief(id,{fen:1,neu:!!ROLLEN_NEU});
    return fenster('g_'+id,r.name,`<button class="wahl gwahl" data-a="region" data-id="${id}" aria-pressed="${an}"><img class="gs" src="bilder/gebiet-${id}.webp" alt=""><span><b>🎯 ${G.spiel}</b>${G.erst?`<small>⭐ ${G.erst}</small>`:''}<small>${an?'✓ Gewählt':'Tippen zum Wählen'}</small></span></button>`,
      {kl:an?'gan':'',buch:'',i:`<div class="sb"><b>${sb.name}</b> <span class="mut">${sb.art}</span>${sb.rumpf}</div>`})}).join('');
  return `<div id="top"><div><b>150 Grad Öchsle</b><small>Neues Spiel auf Spielstand ${SLOT+1}</small></div></div><main>
  ${[0,1,2].some(i=>roh(i))?'<div class="btns" style="margin:0 0 12px"><button class="sec klein" data-a="menue">◀ Zu den Spielständen</button></div>':''}
  ${liesAlt(SLOT)?`<div class="card mut">📜 ${ALT_SATZ}</div>`:''}
  ${fenster('neu_namen','Namen',namen,{buch:'',i:'Dein Name steht auf dem Kaufvertrag, auf jeder Urkunde, in der Bestenliste, in der Chronik und im Winzerboten. Der Name des Weinguts steht am Hof, in der Rangliste und in den Schlagzeilen. Die Anrede bestimmt, ob du Winzer oder Winzerin, Inhaber oder Inhaberin bist. Übernimmt später dein Kind, ersetzt sein Name deinen.'})}
  ${gebiete}
  ${fenster('neu_mit','Mitspieler',`<div class="kv"><span>🍇 Computer-Winzer</span><span>3</span></div><div class="fleer">🔒 Online mit Freunden, kommt später</div>`,{buch:'',i:'Du spielst gegen drei Computer-Winzer: die Vorsichtige, den Qualitätsfanatiker und den Zocker. Sie spielen nach denselben Regeln wie du und wollen auch Präsident werden. Später kannst du hier Freunde einladen.'})}
  ${''/* Seit 13.7.7: Die Meisterprüfung bleibt ausgegraut, bis auf diesem Gerät einmal in den Gesellenjahren übergeben wurde. */}
  ${fenster('neu_schwer','Schwierigkeit',`<div class="zwei stufu">${Object.entries(DIFF).map(([id,d])=>{const zu=id===MEISTER_STUFE&&!meisterFrei();
    return `<button class="wahl neuwahl stufk ${NEU.schwer===id&&!zu?'an':''}" data-a="neuOpt" data-k="schwer" data-v="${id}"${zu?' disabled':''}><small>${d.kurz}</small><b>${d.name}</b>${zu?`<em class="sperr">🔒 ${MEISTER_SPERRE}</em>`:''}</button>`}).join('')}</div>`,{buch:'',
    i:Object.values(DIFF).map(d=>`<b>${d.name}:</b> ${d.text}`).join('<br>')+(meisterFrei()?'':`<br><br>Die ${DIFF[MEISTER_STUFE].name} wartet, bis du einmal in den ${DIFF[MEISTER_VON].name}n ein Weingut an die nächste Generation übergeben hast. Das merkt sich dein Gerät über alle Partien, und es reist mit „Als Datei sichern“ mit.`)+`<br><br>Bis zum Präsidenten dauert es rund 100 bis 120 Spieljahre, danach kommen noch die Jahre im Amt. Alle ${GEN_JAHRE} Jahre übernimmt die nächste Generation, Präsident wird meist erst dein Enkel. Gespeichert wird nach jedem Monat, du kannst also jederzeit aufhören.`})}
  ${''/* Seit 12.6.8 (Maik 21.11.2026): keine Frage "Mit Spielführer?" mehr, jede neue Partie startet mit Spielführer, ausschalten geht im Büro. */}
  <div class="btns"><button data-a="start">Spiel starten</button></div></main>`;
}
// Liste der drei Speicherplätze: weiterspielen, neu anfangen, als Datei sichern, aus Datei laden, löschen.
function vSlots(){
  return `<div id="top"><div><b>150 Grad Öchsle</b><small>Spielstände</small></div></div><main>
  ${[0,1,2].map(i=>{const o=lies(i), alt=liesAlt(i);return `<div class="card"><h3>Spielstand ${i+1}</h3>${alt?`<b>${esc(alt.name)}</b><div class="mut">${ALT_SATZ}</div>
    <div class="btns"><button data-a="slotNeu" data-id="${i}">Neues Spiel</button><button class="wag klein" data-a="slotWegFrage" data-id="${i}">Löschen</button></div>`:o?`<b>${esc(o.name)}</b>
    <div class="mut">${esc(MON[o.monat]||'')} ${esc(o.jahr)} · ${REGIONEN[o.region].name} · ${o.amt&&o.amt.ehren?(o.anrede==='w'?'Ehrenpräsidentin':'Ehrenpräsident'):o.amt&&!o.amt.im?(o.anrede==='w'?'Altpräsidentin':'Altpräsident'):(RAENGE[o.rang]||RAENGE[0]).kurz} · ${o.ende?(ENDE_NAME[o.ende.art]||'beendet'):eur(+o.geld||0)}</div>
    <div class="btns"><button data-a="slotLaden" data-id="${i}">${o.ende?'Chronik ansehen':'Weiterspielen'}</button></div>
    <div class="btns"><button class="klein" data-a="slotSichern" data-id="${i}">Als Datei sichern</button><button class="wag klein" data-a="slotWegFrage" data-id="${i}">Löschen</button></div>`
    :`<div class="mut">Leer</div><div class="btns"><button data-a="slotNeu" data-id="${i}">Neues Spiel</button><button data-a="slotDatei" data-id="${i}">Aus Datei laden</button></div>`}</div>`}).join('')}
  ${bestenHtml()}
  <div class="mut" style="margin:0 0 12px">Gespeichert wird von selbst nach jedem Monat. Mit „Als Datei sichern“ bekommst du eine Datei, die du aufheben oder auf ein anderes Gerät mitnehmen kannst.</div>
  ${tonKnoepfe()}<div class="mut" style="margin:0 0 12px">Bilder, Musik und Geräusche sind mit KI erstellt (Musik mit Treblo, Geräusche mit ElevenLabs, elevenlabs.io).</div></main>`;
}
function rangLeiter(){const r=S.rang;
  return `<h4 class="gs">🪜 Rang ${r+1} von ${RAENGE.length}</h4><div class="rleiter">${RAENGE.map((x,i)=>{const k=i<r?'ok':i===r?'jetzt':'zu';
    return `<div class="rgl ${k}"><b>${k==='ok'?'✓':k==='jetzt'?'▸':'🔒'}</b><span>${k==='jetzt'?duK():rangK(i)}</span>${k==='zu'?`<small>${LEITER[i]}</small>`:''}</div>`}).join('')}</div>`}
// Fenster "Aktueller Rang" in Aktuelles (seit 7.4 auf dem Fenster-Baustein). Im Monat des Aufstiegs leuchtet es golden (seit 7.2).
function vRang(){
  const r=S.rang, n=RAENGE[r+1], v=vermoegen(), bep=flaecheBep(), frei=Math.round((S.ha-bep)*10)/10;
  const w=(ist,soll)=>soll?clamp(ist/soll*100,0,100):100;
  const bar=(ist,soll)=>`<div class="bar ${ist>=soll?'':'g'}"><i style="width:${w(ist,soll)}%"></i></div>`;
  // Fläche: hell die gekaufte, dunkel die bepflanzte. Zählen tut nur die bepflanzte.
  const barF=soll=>`<div class="bar fl ${bep>=soll?'':'g'}"><i class="hell" style="width:${w(S.ha,soll)}%"></i><i style="width:${w(bep,soll)}%"></i></div>`;
  const nach=frei>0?`<div class="mut" style="margin:-4px 0 8px">Noch ${rbn(frei*HA_REBEN)} Reben frei zum Nachpflanzen (${frei.toLocaleString('de-DE')} ha).</div>`:'';
  const neu=S.rangNeu===S.jahr*12+S.monat;
  const h=(n?`<div class="kv"><span>⭐ Ansehen</span><span>${num(S.ansehen)} von ${num(n.ans)}</span></div>${bar(S.ansehen,n.ans)}
    <div class="kv"><span>🌱 Bepflanzt</span><span>${bep.toLocaleString('de-DE')} von ${n.ha} Hektar</span></div>${barF(n.ha)}${nach}${S.ha<n.ha&&!maklerGrund()?`<div class="mut" style="margin:-4px 0 8px">Keine Auktion in Sicht? Der Makler im Rathaus verkauft dir einen Hektar für ${eur(MAKLER_PREIS)}.</div>`:''}
    <div class="kv"><span>💰 Vermögen</span><span>${eur(v)} von ${eur(n.verm)}</span></div>${bar(v,n.verm)}
    <div class="mut">Der Aufstieg zum Rang ${n.name} ${bringtSatz(r+1)}.${rahmenSatz(r+1)} Dafür brauchst du alles drei zugleich.</div>`
    :`<div class="kv"><span>⭐ Ansehen</span><span>${num(S.ansehen)}</span></div><div class="kv"><span>💰 Vermögen</span><span>${eur(v)}</span></div>`
      // Seit 10.0: Am Ziel stehen die Stimmung im Verband und die nächste Wahl.
      +(S.amt?`<div class="kv"><span>🗳️ Stimmung im Verband</span><span>${stimmZ()} von 100</span></div>${amtBalken()}<div class="mut">${amtSatz()}</div>${weltZeile()}${kz('',`<button class="klein" data-a="tab" data-id="stadt" data-sub="amt">🗳️ Zum Weinbauverband</button>`)}`
        :`<div class="fleer" style="margin-top:6px">Höher geht es nicht.</div>`))   // Seit 10.2.1 ohne Rangleiter, der Rang steht in der Überschrift (Maik 19.11.2026).
    +(S.sieger&&!S.amt?`<div class="mut" style="margin-top:6px">🪑 Auf dem Stuhl im Festsaal: ${esc(S.sieger)}</div>`:'');
  // Seit 10.6 (Maik 20.11.2026): Die drei Regler stehen direkt unter der Überschrift, der übrige Text darunter. Die Generation steht im i.
  const gen=`Du bist die ${genNr()}. Generation, ${amtEhre()?`die letzte Übergabe ist im Januar ${endeJahr()}`:`die nächste übernimmt im Januar ${genJahr(genNr())}`}.<br><br>`;
  return fenster('rang',`${neu?'<span class="rneuB">Neu</span> ':''}Aktueller Rang: ${duN()}`,h,{kl:neu?'rneu':'',buch:'ziel',
    i:gen+'Dein Ziel ist der Stuhl des Präsidenten im Weinbauverband und danach die drei Kronen der Weltweinschau. Gewonnen ist die Partie mit der dritten Krone, dann folgen die letzte Übergabe und die Chronik. Jeder Aufstieg braucht Ansehen, bepflanzte Fläche und Vermögen zugleich. Bei der Fläche zählt nur, was bepflanzt ist: Der helle Balken zeigt dein gekauftes Land, der dunkle das bepflanzte.'+(S.amt?` Wer ${anr('Präsident','Präsidentin')} ist, muss das Amt alle ${WAHL_JAHRE} Jahre in einer Wahl verteidigen. Die Regeln stehen im Rathaus im Fenster „Weinbauverband“.`:'')});
}
// Version 10.0: Balken der Stimmung von 0 bis 100, der Strich ist die Marke des Herausforderers.
function amtBalken(){const A=S.amt, s=stimmZ(); return `<div class="bar stb ${s>=A.marke?'':'g'}"><i style="width:${s}%"></i><u style="left:${A.marke}%"></u></div>`}
// Seit 10.1: Zeile zur Weltweinschau in der Rang-Karte und im Fenster "Weinbauverband", erst nach dem Brief.
function weltZeile(){
  const A=S.amt; if(!A||!A.brief) return '';
  // Seit 13.6.3: Kronen und was gerade ansteht.
  return `<div class="kv"><span>🌍 Weltweinschau</span><span>${A.ehren?`alle Kronen, die letzte ${A.ehren.j}`:`${kronen().length} von ${KRONEN.length} Kronen · ${schauAnm()?'Anmeldung diesen Monat':S.schau?'Schau im '+MON[WELT_MONAT]:'Anmeldung im '+wettNaechst('welt')}`}</span></div>`;
}
// Seit 13.6.6: Fenster "Weltweinschau" im Rathaus nach dem Brief: die drei Kronen mit Jahr und Generation, welche dran ist, und die Anmeldung im Januar.
// Wortlaut seit 13.8.
function vWeltschau(){
  const A=S.amt; if(!A||!A.brief) return '';
  const kl=A.ehren?null:S.schau?S.schau.kl:kroneKl(), s=S.schau, K=kl!=null?KRONEN[kl]:null;
  const z=KRONEN.map((X,i)=>{const x=kronen().find(y=>y.k===X.k); return `<div class="kv"><span>${x?'✅':i===kl?'▶️':'⏳'} ${X.sym} ${X.name}</span><span>${x?`${x.j}, ${x.gen}. Generation`:i===kl?'dieses Jahr dran':'danach'}</span></div>`}).join('');
  const satz=!K?`Alle ${KRONEN.length} Kronen geholt, die letzte ${A.ehren.j}. Als ${ehrP()} trittst du nicht mehr an.`
    :`${kroneText(K)} ${schauAnm()?(s.ein?`Angemeldet: ${esc(s.ein.name)}. Tauschen geht bis zum Monatsende.`:'<span class="rot">Angemeldet wird nur diesen Monat.</span>'):s?`${s.ein?`Angemeldet: ${esc(s.ein.name)}.`:'Kein Wein angemeldet.'} Die Schau ist im ${MON[WELT_MONAT]}.`:`Angemeldet wird im ${wettNaechst('welt')}, die Schau ist im ${MON[WELT_MONAT]}.`}`;
  const n=schauAnm()?S.lots.filter(l=>schauFaehig(l)).length:0;
  return fenster('weltschau','Weltweinschau',z+`<div class="mut">${satz}</div>${K?`<div class="kv"><span>⭐ Der Favorit</span><span>${esc(K.fav.split(',')[0])}</span></div><div class="mut"><small>${esc(K.gesch||'')}</small></div>${A.schauB||(s&&s.ein)?'':`<div class="mut">Die erste Krone gibt es im ${MON[WELT_MONAT]} nach deiner ersten Anmeldung im ${MON[WELT_ANM]}.</div>`}`:''}`,{
    stand:K?`${kronen().length} von ${KRONEN.length} Kronen`:'',
    kn:schauAnm()?[pk('schau',s.ein?'Tauschen':n?'Wein anmelden':'Ansehen','',{sec:!!s.ein||!n})]:[],
    i:`Jedes Jahr im ${MON[WELT_MONAT]} ist Weltweinschau auf dem Dorfplatz, angemeldet wird im ${MON[WELT_ANM]}. Es geht um eine Krone nach der anderen: ${KRONEN.map(X=>`die ${X.name} mit ${X.was}`).join(', ')}. Verlierst du, ist im nächsten Jahr dieselbe Krone dran, gewonnene Kronen bleiben, auch nach einer Abwahl. Jede Krone bringt ${KRONE_ANS} Ansehen.${KRONEN.filter(X=>X.sorten).map(X=>KRONE_SORTE_TEXT.info.replace('{krone}',X.name)).join('')} Mit der dritten wirst du ${ehrP()}, danach kommen die letzte Übergabe und die Chronik.`});
}
// Fenster "Weinbauverband" im Rathaus, nur mit Amt (im Amt oder abgewählt): Balken mit Marke, Amtszeiten, nächste Wahl, im Wahlkampf der Herausforderer
// und der Knopf "Stimmen kaufen". Die Regeln stehen im i.
function vVerband(){
  const A=S.amt, s=stimmZ(), kampf=amtKampf(), g=amtGegner(), st=!A.im&&S.gegner.find(x=>x.id===A.stuhl), frei=KAUF_MAX-A.kauf;
  const inhalt=`<div class="kv"><span>🗳️ Stimmung im Verband</span><span>${s} von 100</span></div>${amtBalken()}
    <div class="kv"><span>${A.im?'Am Wahltag brauchst du':'Für die Rückkehr brauchst du'}</span><span>${A.marke}</span></div>
    <div class="kv"><span>${A.im?'Deine Amtszeit':'Deine Amtszeiten bisher'}</span><span>${A.zeit}${A.im?'.':''}</span></div>
    <div class="kv"><span>Nächste Wahl</span><span>${wahlAus()?'keine mehr':monJahr(A.wahl)}</span></div>
    ${st?`<div class="kv"><span>Auf dem Stuhl</span><span>${esc(st.name)}</span></div>`:kampf&&g?`<div class="kv"><span>${gFrau(g)?'Herausforderin':'Herausforderer'}</span><span>${esc(g.name)}</span></div>`:''}
    <h4 class="gk">Der Weg zur Weltweinschau</h4>
    <div class="kv"><span>${keyDorf()?'✅':'🔑'} Dorf: alle ${SPENDEN.length-1} Spenden</span><span>${keyDorf()?'erledigt':`${SPENDEN.length-1-stAnzahl()} von ${SPENDEN.length-1}`}</span></div>
    <div class="kv"><span>${keyVerband()?'✅':'🔑'} Verband: eine gewonnene Wahl</span><span>${keyVerband()?'erledigt':'offen'}</span></div>
    ${A.brief?weltZeile():`<div class="mut">Mit beiden Schlüsseln kommt der Brief: Dann ist die Weltweinschau jedes Jahr im ${MON[WELT_MONAT]} bei dir im Dorf, mit ${KRONEN.length} Kronen nacheinander.${keyDorf()?'':' Verpasste Spenden holt unten die Stiftung nach.'}</div>`}
    <h4 class="gk">Die Übergabe</h4>
    ${A.ehren?`<div class="kv"><span>Letzte Übergabe</span><span>Januar ${endeJahr()}</span></div><div class="mut">Mit ihr endet die Partie, es folgt die Chronik.</div>`
      :`<div class="kv"><span>Nächste Generation</span><span>Januar ${genJahr(genNr())}</span></div><div class="mut">Zu Ende ist die Partie erst mit allen ${KRONEN.length} Kronen der Weltweinschau. Bis dahin übernimmt alle ${GEN_JAHRE} Jahre die nächste Generation und tritt weiter an.</div>`}`;
  const kn=[...(kampf?[pk('stimmKauf','Stimmen kaufen',eur(KAUF_PREIS),{klein:`+${KAUF_PLUS} Stimmung`,wag:1,aus:frei<=0,arm:S.geld<KAUF_PREIS})]:[])];
  return fenster('verband','Weinbauverband',inhalt,{
    stand:kampf?(s>=A.marke?'Wahlkampf: Im Moment reicht die Stimmung. Bis zur Wahl bröckelt sie aber weiter.':'<span class="rot">Wahlkampf: Im Moment reicht die Stimmung nicht.</span>'):`Die Umfrage kommt im ${monJahr(A.wahl-WAHL_UMFRAGE)}, ein Jahr vor der Wahl.`,
    links:kampf?(frei<=0?`Mehr als ${KAUF_MAX} Käufe je Wahl gehen nicht.`:`Noch ${frei} von ${KAUF_MAX} Käufen. Jeder fliegt mit ${pz(KAUF_SKANDAL)} auf.`):'',
    kn,
    buch:'wahl',i:`Als ${anr('Präsident','Präsidentin')} musst du dein Amt alle ${WAHL_JAHRE} Jahre verteidigen. Es zählt die Stimmung im Verband: Liegt sie am Wahltag auf oder über der Marke (der Strich im Balken), bleibst du im Amt. Gewürfelt wird nicht.<br><br><b>Was die Stimmung hebt:</b> alles, was Ansehen bringt, zum Beispiel Medaillen, ein Hoffest, Sekt oder eine saubere Weinkontrolle. Von jedem gewonnenen Ansehen gehen ${pz(STIMM_PLUS)} auf die Stimmung. Nur das Ansehen aus der Stiftung fürs Dorf zählt nicht.<br><b>Was sie drückt:</b> Jeder Monat kostet ${String(STIMM_MONAT).replace('.',',')}, und jeder Abzug beim Ansehen schlägt voll durch.<br><br><b>Die Marke:</b> Dein Herausforderer ist der stärkste Gegner. Bei der ersten Wahl brauchst du ${MARKE_START}, nach jeder gewonnenen Wahl ${MARKE_PLUS} mehr, höchstens ${MARKE_MAX}. Nach jeder gewonnenen Wahl startet die Stimmung wieder bei ${STIMM_START}. Als ${anr('Ehrenbürger','Ehrenbürgerin')} startest du immer ${SP_STIMM} Punkte höher.<br><br><b>Wahlkampf:</b> Ein Jahr vor der Wahl bringt der Winzerbote die Umfrage. Ab dann kannst du hier Stimmen kaufen: ${eur(KAUF_PREIS)} vom Konto für ${KAUF_PLUS} Punkte, höchstens ${KAUF_MAX} Mal je Wahl. Jeder Kauf fliegt mit ${pz(KAUF_SKANDAL)} auf, dann ist das Geld weg und die Stimmung fällt um ${KAUF_STRAFE}. Auch der Herausforderer spielt im Wahlkampf nicht immer sauber.<br><br><b>Abgewählt:</b> Der Herausforderer übernimmt den Stuhl, du behältst alles andere. Die Stimmung startet dann bei ${STIMM_ALT}, die Marke sinkt um ${MARKE_ABWAHL} (nie unter ${MARKE_START}), und bei der nächsten Wahl kannst du dir den Stuhl zurückholen.<br><br><b>Weltweinschau:</b> Mit zwei Schlüsseln holst du sie ins Dorf. Dorf: alle ${SPENDEN.length-1} Spenden, verpasste holt die Stiftung fürs Dorf nach. Verband: eine gewonnene Wahl, auch eine Rückkehr zählt. Dann ist jeden August Schau, und du reichst im Fenster „Wettbewerbe“ einen verkaufsreifen Prädikatswein oder Sekt ein, gern auch jedes Jahr denselben. Platz 1 macht dich ${anr('zum Ehrenpräsidenten','zur Ehrenpräsidentin')}.<br><br><b>Übergabe:</b> Als ${anr('Präsident','Präsidentin')} übergibst du nur noch einmal, danach endet die Partie mit der Chronik. Die Familie wartet damit bis zum Januar nach deiner zweiten Wahl. Mit „Weingut übergeben“ gehst du früher, wann du willst. Erbschaftssteuer fällt dabei nicht an.`});
}
function ranglisteHtml(){
  return rangListe().map((x,i)=>`<div class="rl ${x.du?'du':''}"><span>${i+1}.</span><div><b>${esc(x.name)}</b><span class="mut">${esc(x.sub)}<br>${x.du?duK():x.stuhl?(x.w?'Präsidentin':'Präsident'):x.rang===R_MAX?(x.w?'Herausforderin':'Herausforderer'):x.w&&RAENGE[x.rang].kw||RAENGE[x.rang].kurz} · ${num(x.ans)} Ansehen · ${x.ha} ha · ${eur(x.verm)}<br>${x.du&&S.amt?`🗳️ Stimmung ${stimmZ()} · ${wahlAus()?'keine Wahl mehr':'Wahl im '+monJahr(S.amt.wahl)}`:x.stuhl?'🪑 sitzt auf dem Stuhl im Festsaal':bisZiel(x.rang)}</span></div></div>`).join('');
}
// Fenster "Dein Rang" im Büro bei den Erfolgen: der Rang, das nächste Ziel in drei Zeilen und der Platz in der Rangliste.
// Die Kennung bleibt 'rangliste', damit der Spielführer (k09) weiter das i findet. Die Balken und alles Weitere stehen in Aktuelles (vRang).
function bueroRang(){
  const n=RAENGE[S.rang+1], v=vermoegen(), bep=flaecheBep(), L=rangListe(), platz=L.findIndex(x=>x.du)+1, vor=L[platz-2];
  const z=(t,ist,soll,txt)=>`<div class="kv"><span>${ist>=soll?'✅':'▫️'} ${t}</span><span>${txt}</span></div>`;
  const ziel=n?`<div class="mut" style="margin-bottom:2px">Nächstes Ziel: <b>${esc(frau()&&n.w||n.name)}</b></div>
    ${z('Ansehen',S.ansehen,n.ans,`${num(S.ansehen)} von ${num(n.ans)}`)}${z('Bepflanzt',bep,n.ha,`${bep.toLocaleString('de-DE')} von ${n.ha} Hektar`)}${z('Vermögen',v,n.verm,vonGeld(v,n.verm))}`
    :`<div class="kv"><span>⭐ Ansehen</span><span>${num(S.ansehen)}</span></div><div class="kv"><span>💰 Vermögen</span><span>${eur(v)}</span></div>${S.amt?`<div class="kv"><span>🗳️ Stimmung im Verband</span><span>${stimmZ()} von 100</span></div>`:''}`;
  return fenster('rangliste',`Dein Rang: ${duN()}`,ziel,{buch:'gegner',
    hin:[GEGNER_AKT[aktNr()-1],weltFormZeile(),S.sieger&&!S.amt&&`🪑 Auf dem Stuhl im Festsaal: ${esc(S.sieger)}`],
    links:`📊 Platz ${platz} von ${L.length}${vor?`, vor dir ${esc(vor.name)}`:', du führst'}`,
    kn:pk('rangliste','Rangliste','',{sec:1}),
    i:`Für den Aufstieg brauchst du Ansehen, bepflanzte Fläche und Vermögen zugleich. Die Balken dazu und was der nächste Rang bringt, stehen unter „Aktuelles“.<br><br>„Rangliste“ zeigt dich und deine Gegner. ${RANGL_I}`});
}
// "Weiter bis etwas ansteht": blättert ruhige Monate am Stück, höchstens zwölf. Hält an, sobald sprungHalt() einen Grund nennt,
// oder einer Warnung beim Weiterblättern. SPRUNG trägt die Schlagzeilen der übersprungenen Monate in die letzte Zeitung ("Kurz gemeldet").
let SPRUNG=[];
function lohnAngebot(k){const n=S.angebot[k], lage=lohnLage(n);return `<span class="${lage==='günstig'?'gruen':lage==='teuer'?'rot':''}">${eur(n)}, ${lage}</span>`}
function marktBericht(){
  const z=[];
  if(S.monat<=2) z.push(['Reben',proz(S.rebenF||1)+(S.rebenAng?`, ${SORTEN[S.rebenAng].name} ${proz(1-REBEN_ANGEBOT)}`:'')]);
  z.push(['Fassraum',`${eur2(fassPreis())} je Liter, ${proz(S.fassF||1)}`],['Flaschen',`${eur2(flaschePreis())} je Stück, ${proz(S.flaschF||1)}`],['Erntehelfer',eur(S.angebot.helfer)+' im Monat'],['Kellerleute',eur(S.angebot.lagerarb)+' im Monat'],['Weinpreise',proz(S.markt)]); if((DIFF[S.schwer]||{}).land) z.push(['Landpreise',proz(S.landF||1)]);
  if(S.lage) z.push([S.lage.typ==='mode'?SORTEN[S.lage.sorte].name:'Weinskandal',`${proz(S.lage.f)}, noch ${S.lage.rest} ${S.lage.rest===1?'Monat':'Monate'}`]);
  return '<h4>Marktbericht</h4>'+z.map(x=>`<div class="zz"><b>${x[0]}</b>${x[1]}</div>`).join('');
}
// Öchsle am Stock, ab August, solange noch Trauben hängen.
function oeBericht(){
  const kurz=f=>f.gelesen?'gelesen':f.menge<=0?'keine Trauben':`${f.oe}°${f.plus>0?` (+${f.plus})`:''} · ${num(f.menge)}\u00a0l${f.gefroren?' · ❄️':f.edel?' · edelfaul':''}`;
  return '<h4>Öchsle am Stock</h4>'+weinberge().filter(id=>S.felder[id].reben).map(id=>`<div class="zz"><b>${dot(id)}${SORTEN[id].name}</b>${kurz(S.felder[id])}</div>`).join('');
}
// Die Infoseite als Zeitung "Der Winzerbote". Das Bild der Jahreszeit liegt dahinter, die Zeitung beginnt etwa auf halber Höhe.
function vMonat(){
  let b=S.bericht||{titel:`${MON[S.monat]} ${S.jahr}`,zeilen:[]};
  // Alte Spielstände kennen nur Zeilen: Die erste wird zur Schlagzeile.
  if(!b.kopf){const z=b.zeilen||[]; b={...b,kopf:z.length?{t:z[0],text:''}:{t:FLAUTE[S.monat],text:FLAUTE_TEXT[S.monat]},art:[],zeilen:z.slice(1)}}
  const k=b.kopf, W=b.wetter||[], E=(b.ehr||[]).filter(e=>!e.a), bild=monatBild(), Z=b.zeilen||[], F=b.fuss||[];
  // Version 9.0: Weingut der eigenen Stufe. Beginnt eine neue Jahreszeit, liegt erst die alte darunter (S.bildJz merkt sich die zuletzt gezeigte), außer im Monat eines Aufstiegs.
  const wg=/^weingut-/.test(bild), st=wgStufe(), jz=JZ[S.monat], wech=wg&&S.bildJz&&S.bildJz!==jz&&!wgAuf(S.feier)?wgBild(st,S.bildJz):null;
  const blur=wg&&!wgGross(st)?`<div class="iblur" style="background-image:url(bilder/${bild}.jpg)"></div>`:'';
  const hinten=blur+(wech?`<div class="ibild" style="background-image:url(bilder/${wech}.jpg)"></div><div class="ibild ineu" style="background-image:url(bilder/${bild}.jpg);--jzd:${JZ_DAUER}ms"></div>${teilchen(jz)}`
    :`<div class="ibild" style="background-image:url(bilder/${bild}.jpg)"></div>`);
  const foto=(x,kl)=>x.bild&&/^[\w-]+$/.test(x.bild)?`<div class="zfoto ${kl||''} ${x.archiv?'archiv':''} ${x.gold?'gold':''}" style="background-image:url(bilder/${x.bild}.jpg)"></div>`:'';
  const liste=x=>x.liste?`<div class="zliste">${x.liste.map(r=>`<div class="${r.du?'du':''}"><span>${esc(r.platz)}.</span><b>${r.m?esc(r.m)+' ':''}${esc(r.name)}</b><span>${esc(r.p)} P.</span></div>`).join('')}</div>`:'';
  // Artikel: höchstens ein kleines Foto, und nie dasselbe wie oben.
  let frei=1;
  const art=(b.art||[]).map(a=>{const f=(frei||a.foto)&&a.bild&&a.bild!==k.bild?(a.foto||(frei=0),foto(a,'klein')):''; return `<div class="zart">${f}<h3>${esc(a.t)}</h3>${a.text?`<p>${esc(a.text)}</p>`:''}${liste(a)}</div>`}).join('');
  const haengt=S.monat>=7&&weinberge().some(id=>S.felder[id].menge>0&&!S.felder[id].gelesen);
  const nah=wg?nahBild(st):null;
  const rechts=`<h4>Dein Weingut</h4>${nah?`<div class="zluft gross" style="background-image:url(bilder/${nah[0]}.jpg)"></div><div class="znah">${nah[2]}</div>`:wg?`<div class="zluft${wgGross(st)?' gross':''}" style="background-image:url(bilder/${bild}.jpg)"></div>`:''}<div class="zvier"><div class="zz"><b>Rang</b>${duK()}</div><div class="zz"><b>Boden</b><span class="${bodenMin()<80?'rot':''}">${bodenMin()}\u00a0%${weinberge().some(id=>duengOffen(id)&&!helferDuengt(id)&&S.felder[id].boden<80)?', Düngen ist dran':''}</span></div>
    <div class="zz"><b>Ansehen</b>${num(S.ansehen)}</div><div class="zz"><b>Konto</b><span class="${S.geld<0?'rot':''}">${eur(S.geld)}</span></div></div>`;   // Seit 10.2.1 zwei Spalten: Rang und Ansehen links, Boden und Konto rechts (Maik 19.11.2026)
  return `<div id="info" class="${wg?'wg'+(wgGross(st)?' gross':'')+(wech?' jzw':''):bild}">${hinten}<div class="iverl"></div>
  <div class="zt"><div class="zkopf"></div><div class="zmitte">
    <div class="ztitel">Der Winzerbote</div>
    <div class="zleiste"><span>${R().name}</span><span>${esc(b.titel)}</span><span>Nr. ${b.nr||1}</span></div>
    ${k.sonder?'<div class="zsonder">Sonderausgabe</div>':''}
    <h1 class="zschlag">${esc(k.t)}</h1>${foto(k)}
    ${k.text?`<p class="zlead ${/^\p{L}/u.test(k.text)?'init':''}">${esc(k.text)}</p>`:''}
    ${E.map(e=>`<div class="zehr"><span>${esc(e.i)}</span><b>${esc(e.t)}</b></div>`).join('')}
    ${liste(k)}${k.ende?endeHtml(k):''}
    <div class="zwetter"><div><small>Wetter heute</small>${wetterText()}</div><div><small>Vorhersage ${MON[(S.monat+1)%12]}</small>${progText()}</div></div>
    ${ratHtml(b,k)}${art}
    ${W.length?`<div class="zart"><h3>Aus dem Weinberg</h3><ul>${W.map(z=>`<li>${esc(z)}</li>`).join('')}</ul></div>`:''}
    ${Z.length?`<div class="zart"><h3>Kurz gemeldet</h3><ul>${Z.map(z=>`<li>${esc(z)}</li>`).join('')}</ul></div>`:''}
    <div class="zzwei"><div>${haengt?oeBericht():marktBericht()}</div><div>${rechts}</div></div>
    ${F.length?`<div class="zfussz">${F.map(t=>`<p>${esc(t)}</p>`).join('')}</div>`:''}
  </div><div class="zende"></div></div>
  <div class="ifuss"><button data-a="infoWeiter">${k.schluss?'Zum Küchentisch':k.ende?'Weiterspielen':'Weiter'} ▶</button></div><div class="ischw"></div></div>`;
}
// ---- Version 7.2: Aufstiegsfeier nach dem Winzerboten, seit 7.7 mit Geschichte und auch beim Spielstart ----
// FSTUFE 0 ist die Bild-Bühne mit dem Kapitel, 1 die Urkunde (beim Start der Kaufvertrag). FT hält die Zeitgeber für Siegel und Freischaltungen.
// S.feier: {von, zu} beim Aufstieg (mehrere Ränge in einem Monat: Bühne und Kapitel vom höchsten), {start:1} beim Spielstart, platz = Platz in der Bestenliste.
let FSTUFE=1, FT=[];
// Die Bild-Bühne: Standbild mit Schwenk und Zoom (still = ruhig und unscharf hinter der Urkunde), darüber später das stumme Video aus 8.1.
// Das Video spielt einmal und bleibt auf dem letzten Bild stehen. Fehlt es (zum Beispiel ohne Internet), bleibt das bewegte Bild.
function szeneHtml(k,still){
  const z=SZENEN[k], vid=!still&&SZENE_VIDEO.includes(z.video);
  return `<div class="fbild ${still?'still':'bewegt'}" style="background-image:url(bilder/${z.bild}.jpg);--p0:${z.p0};--p1:${z.p1};--o:${z.o};--s:${z.s}"></div>`
    +(vid?`<video class="fvid" src="bilder/${z.video}.mp4" poster="bilder/${z.bild}.jpg" muted playsinline autoplay preload="auto" onerror="this.remove()"></video>`:'');
}
// Seit 11.7 (A13, Maik 20.11.2026): Bei einem Aufstieg über mehrere Ränge kommen die Kapitel aller neuen Ränge nacheinander auf dieselbe Bühne,
// jedes mit dem Rang als Zwischenzeile. Bild und Überschrift bleiben beim höchsten Rang.
function feierKapitel(F){
  const p=s=>`<p>${esc(s)}</p>`;
  if(F.start||F.von==null||F.zu-F.von<2) return kapitel(feierSzene(F)).map(p);
  const L=[]; for(let r=F.von+1;r<=F.zu;r++) L.push(`<p class="fzw">${esc(rangN(r))}</p>`,...kapitel(r).map(p));
  return L;
}
// Kurzer Schnitt aus Schwarz beim Wechsel zwischen Zeitung, Feier und Aktuelles.
function schnitt(){const s=document.createElement('div');s.className='schnitt';document.body.appendChild(s);setTimeout(()=>s.remove(),600)}
// Die Urkunde selbst: Papier mit Rand, Text in der freien Mitte, Siegel im Kreis unten.
function urkHtml(i,m,j,kl,p){
  // Seit 7.9 steht der eigene Name auf der Urkunde. p ist der Stand beim Stempeln (Name und Anrede), alte Urkunden ohne Namen bleiben beim alten Text.
  p=p||{n:S.ich||'',w:frau()?1:0};
  const rn=p.w&&RAENGE[i].w||RAENGE[i].name, wer=p.n?`<p>Der Weinbauverband ernennt</p><b class="uname">${esc(p.n)}</b><p>${p.w?'Inhaberin':'Inhaber'} von ${esc(S.name)}</p>`
    :`<p>Der Weinbauverband ernennt ${p.w?'die Inhaberin':'den Inhaber'} von</p><b class="uname">${esc(S.name)}</b>`;
  // Seit 8.3 steht auf der Urkunde zum Präsidenten die Spielzeit bis dahin.
  const z=i===R_MAX&&(S.zeitRang||[]).find(x=>x.r===i), zt=z?`<small class="uzeit">Spielzeit ${zeitTxt(z.s)}${S.zeitAlt?' (seit 8.3)':''}</small>`:'';
  return `<div class="urk ${kl||''}"><div class="utext${zt?' mz':''}"><div class="utitel">Urkunde</div>${wer}<p>zum Rang</p><b class="urang${rn.length>20?' lang':''}">${esc(rn)}</b><small>${MON[m]} ${j} · ${esc(REGIONEN[S.region].name)}</small>${zt}</div><div class="usiegel"></div></div>`;
}
// Version 7.7: Kaufvertrag beim Spielstart, im Stil der Urkunde.
function vertragHtml(){
  return `<div class="urk vertrag neu"><div class="utext"><div class="utitel">Kaufvertrag</div><p>Verkauft an</p><b class="uname">${esc(S.ich||S.name)}</b><p>${S.ich?esc(S.name)+':<br>':''}drei Hektar Weinberg, ein alter Gewölbekeller<br>und eine Untermieterin im Keller</p><small>Sommer ${START_JAHR-1} · ${esc(REGIONEN[S.region].name)}</small></div><div class="usiegel"></div></div>`;
}
// Seit 10.2: funken = goldene Funken statt bunter Schnipsel, beim Sieg der Weltweinschau.
function konfetti(n,funken){
  const F=funken?['#f0c75a','#ffe39a','#e8b84a','#fff4d0']:['#f0c75a','#d9a520','#fbeede','#9b2a4a','#e8b84a'];
  return `<div class="konf${funken?' funken':''}">${Array.from({length:n},(_,k)=>`<i style="left:${(k*37+11)%100}%;animation-delay:${((k*.29)%4).toFixed(2)}s;animation-duration:${(4.2+(k%5)*.7).toFixed(1)}s;background:${F[k%F.length]};transform:rotate(${k*47%360}deg)"></i>`).join('')}</div>`;
}
function vSpFeier(){
  // Mit Maiks Holzbogen schwenkt die Bühne am Handy langsam von links nach rechts über den Balken mit dem Spruch, die Karte steht unten.
  const B=SP_BILD.bogen, pos=B?'--p0:20% 50%;--p1:75% 50%;--o:50% 22%;--s:1.06':'--p0:45% 50%;--p1:55% 50%;--o:50% 45%;--s:1.15';
  const bild=k=>`<div class="fbild ${k}" style="background-image:url(bilder/${bogenBild()}.jpg);${pos}"></div>`;
  if(FSTUFE===0) return `<div id="feier" class="buehne${B?' unten':''}" data-a="feierAlle">${bild('bewegt')}<div class="fglanz"></div>${konfetti(12)}<div class="fverl"></div>
    <div class="fkarte"><small>🤝 Auf dem Dorfplatz</small><h2>Das Dorf sagt Danke!</h2>${spKapitel().map(s=>`<p>${esc(s)}</p>`).join('')}</div>
    <div class="ifuss"><button data-a="feierWeiter">Zum Ehrenbrief ▶</button></div><div class="ischw"></div></div>`;
  const P=[['⭐',`${SPENDEN[8].ans} Ansehen`],['🪵','Der Holzbogen auf dem Dorfplatz, im Rathaus jederzeit anzusehen'],['👪',`Bei der nächsten Übergabe bleiben ${pz(SP_ERBE)} statt ${pz(ERB_ANSEHEN)} vom Ansehen`],['🗳️',`Im Verband startet die Stimmung für dich bei ${STIMM_START+SP_STIMM} statt ${STIMM_START}`]];
  return `<div id="feier" class="urkseite">${bild('still')}<div class="fdunkel"></div>${konfetti(6)}
    <div class="fin"><div class="fkopf">Herzlichen Glückwunsch!</div>${spEhrHtml(8,'neu')}
    ${SP_BILD.bogen?'':`<div class="spspruch hell">„${SP_SPRUCH}“</div>`}${spTafel()}
    <div class="fliste"><h3>Das bringt dir der Dank des Dorfs</h3>${P.map((p,n)=>`<div style="animation-delay:${(2.8+n*.8).toFixed(2)}s"><span>${p[0]}</span>${esc(p[1])}</div>`).join('')}</div></div>
    <div class="ifuss"><button data-a="feierEnde">Danke schön 🥂</button></div><div class="ischw"></div></div>`;
}
function spFeierStart(){
  if(FSTUFE===0){
    const el=$('#feier'), karte=$('#feier .fkarte');
    if(matchMedia('(prefers-reduced-motion:reduce)').matches) return el.classList.add('alle');
    [...karte.querySelectorAll('p')].forEach((p,n)=>FT.push(setTimeout(()=>{p.classList.add('da'); karte.scrollTop=karte.scrollHeight},(1.4+n*SATZ_TAKT)*1000)));
    return;
  }
  FT.push(setTimeout(()=>fx('stempel'),2000));
  for(let k=0;k<3;k++) FT.push(setTimeout(()=>fx('klick'),2800+k*800));
}
// Bei der Wende erst nach dem Rauszoomen überblenden.
function vWachs(F){
  // Seit 10.2.1 auch beim Spielstart nach dem Kaufvertrag: Hof 1 im Sommer blendet in die Jahreszeit des Startmonats über, dann kommt der Winzerbote (Maik 19.11.2026).
  if(F.start){const bs=(z,kl)=>`<div class="wbild ${kl}" style="background-image:url(bilder/${wgBild(1,z)}.jpg);--wr:1.5"></div>`;
    return `<div id="feier" class="buehne wachs wtor" data-a="wachsAlle">${bs('sommer','walt')}${bs(JZ[S.monat],'wneu')}<div class="fverl"></div>
    <div class="fkarte"><small>🏡 ${esc(S.name)}</small><h2><span class="wvon">Gekauft im Sommer</span><span class="wzu">${MON[S.monat]} ${S.jahr}: Es geht los</span></h2>
    <p class="wsatz">Viel Arbeit, aber jetzt gehört er dir.</p></div>
    <div class="ifuss"><button data-a="feierEnde">Zum Winzerboten ▶</button></div><div class="ischw"></div></div>`}
  const a=F.von+1, b=F.zu+1, rn=i=>esc(frau()&&RAENGE[i].w||RAENGE[i].name);
  const bild=(st,kl)=>`<div class="wbild ${kl}${wgGross(st)?' gross':''}" style="background-image:url(bilder/${wgBild(st,'sommer')}.jpg);--wr:${wgGross(st)?1.777:1.5}"></div>`;
  const art=b<=4?' wtor':a<=4?' wwende':' wlang';
  return `<div id="feier" class="buehne wachs${art}" data-a="wachsAlle">${bild(a,'walt')}${bild(b,'wneu')}<div class="fverl"></div>
    <div class="fkarte"><small>🏡 Dein Weingut wächst</small><h2><span class="wvon">${rn(F.von)}</span><span class="wzu">${rn(F.zu)}</span></h2>
    <p class="wsatz">${b===5?'Dein Gut ist zu groß für das Tor geworden.':b===10?'Das ganze Gut hat sich herausgeputzt.':'Schau dich um, was alles neu ist.'}</p></div>
    <div class="ifuss"><button data-a="feierBuehne">Zur Feier ▶</button></div><div class="ischw"></div></div>`;
}
const wfBild=(b,kl)=>`<div class="fbild ${kl}" style="background-image:url(bilder/${b}.jpg);${WF_POS[b]||''}"></div>`;
// Der Brief der Weltweinschau und die Urkunde zum Ehrenpräsidenten, im Stil der Urkunde.
function briefHtml(){
  return `<div class="urk vertrag neu"><div class="utext"><div class="utitel">Einladung</div><p>Die Weltweinschau bittet</p><b class="uname">${esc(S.ich||S.name)}</b><p>${S.ich?esc(S.name)+' und das ganze Dorf':'und das ganze Dorf'}<br>um die Ehre, Gastgeber zu sein</p><small>${weltAus()?'':`Jeden ${MON[WELT_MONAT]} ab ${wettNaechst('welt').split(' ')[1]} · `}${esc(REGIONEN[S.region].name)}</small></div><div class="usiegel"></div></div>`;
}
// Seit 13.6.3: Urkunde zu einer Krone der Weltweinschau, Wortlaut seit 13.8.
function kroneUrkHtml(K){return `<div class="urk neu"><div class="utext"><div class="utitel">${esc(K.name)}</div><p>Die Weltweinschau ehrt</p><b class="uname">${esc(S.ich||S.name)}</b><p>${S.ich?esc(S.name):''}</p><small>${MON[S.monat]} ${S.jahr} · Weltweinschau im eigenen Dorf</small></div><div class="usiegel"></div></div>`}
function ehrUrkHtml(){
  const w=frau(), wer=S.ich?`<p>Der Weinbauverband ernennt</p><b class="uname">${esc(S.ich)}</b><p>${w?'Inhaberin':'Inhaber'} von ${esc(S.name)}</p>`:`<p>Der Weinbauverband ernennt ${w?'die Inhaberin':'den Inhaber'} von</p><b class="uname">${esc(S.name)}</b>`;
  return `<div class="urk neu"><div class="utext"><div class="utitel">Urkunde</div>${wer}<p>${w?'zur':'zum'}</p><b class="urang">${esc(ehrP())}</b><small>${MON[S.monat]} ${S.jahr} · Weltweinschau im eigenen Dorf</small></div><div class="usiegel"></div></div>`;
}
function vWeltFeier(){
  const C=weltFeier(), n=C.B.length, last=FSTUFE>=n-1;
  if(FSTUFE<n){
    const b=C.B[FSTUFE], weiter=!last?['weltWeiter','Weiter ▶']:C.schrift?['weltWeiter',S.feier.welt==='brief'?'Zum Brief ▶':'Zur Urkunde ▶']:['feierEnde',C.knopf];
    return `<div id="feier" class="buehne${b.unten?' unten':''}" data-a="feierAlle">${wfBild(b.bild,'bewegt')}${b.ruhig?'':'<div class="fglanz"></div>'}${b.konf?konfetti(b.konf,b.funken):''}<div class="fverl"></div>
    <div class="fkarte"><small>${b.ort}</small><h2>${esc(b.h)}</h2>${b.p.map(s=>`<p>${esc(s)}</p>`).join('')}</div>
    <div class="ifuss"><button data-a="${weiter[0]}">${weiter[1]}</button></div><div class="ischw"></div></div>`;
  }
  return `<div id="feier" class="urkseite">${wfBild(C.B[0].bild,'still')}<div class="fdunkel"></div>${konfetti(S.feier.welt==='sieg'?12:6,S.feier.welt==='sieg')}
    <div class="fin"><div class="fkopf">${C.kopf}</div>${C.schrift}
    <div class="fliste"><h3>${C.titel}</h3>${C.P.map((p,k)=>`<div style="animation-delay:${(2.8+k*.8).toFixed(2)}s"><span>${p[0]}</span>${esc(p[1])}</div>`).join('')}</div></div>
    <div class="ifuss"><button data-a="feierEnde">${C.knopf}</button></div><div class="ischw"></div></div>`;
}
function weltFeierStart(){
  const C=weltFeier(), el=$('#feier');
  if(FSTUFE<C.B.length){
    if(FSTUFE===0&&S.feier.welt==='sieg'&&TON.musik==='aus') FT.push(setTimeout(()=>fx('fanfare'),250));
    const karte=$('#feier .fkarte');
    if(matchMedia('(prefers-reduced-motion:reduce)').matches) return el.classList.add('alle');
    [...karte.querySelectorAll('p')].forEach((p,n)=>FT.push(setTimeout(()=>{p.classList.add('da'); karte.scrollTop=karte.scrollHeight},(1.4+n*SATZ_TAKT)*1000)));
    return;
  }
  FT.push(setTimeout(()=>fx('stempel'),2000));
  for(let k=0;k<C.P.length;k++) FT.push(setTimeout(()=>fx('klick'),2800+k*800));
}
function vFeier(){
  if(S.feier&&S.feier.welt) return vWeltFeier();
  if(S.feier&&S.feier.spende) return vSpFeier();
  const F=S.feier||{von:Math.max(0,S.rang-1),zu:S.rang}, i=F.zu, k=feierSzene(F);
  if(FSTUFE===-1) return vWachs(F);
  if(FSTUFE===0) return `<div id="feier" class="buehne" data-a="feierAlle">${szeneHtml(k)}<div class="fglanz"></div>${konfetti(konfN(k))}<div class="fverl"></div>
    <div class="fkarte"><small>${SZENEN[k].ort}</small><h2>${k?`Du bist jetzt ${esc(rangN(i))}!`:'Die Anzeige'}</h2>${feierKapitel(F).join('')}</div>
    <div class="ifuss"><button data-a="feierWeiter">${k?'Zur Urkunde':'Zum Kaufvertrag'} ▶</button></div><div class="ischw"></div></div>`;
  const P=F.start?startPunkte():feierPunkte(F.von,i);
  return `<div id="feier" class="urkseite">${szeneHtml(k,1)}<div class="fdunkel"></div>${konfetti(konfN(k)>>1)}
    <div class="fin"><div class="fkopf">${F.start?'Auf gute Nachbarschaft!':'Herzlichen Glückwunsch!'}</div>${F.start?vertragHtml():urkHtml(i,S.monat,S.jahr,'neu')}
    ${F.platz?`<p class="fgruss">🏆 Du stehst jetzt in der Bestenliste auf Platz ${F.platz}.</p>`:''}
    <div class="fliste">${F.start?'<h3>Damit fängst du an</h3>':''}${P.map((p,n)=>p[2]==='h'?`<h3 style="animation-delay:${(2.8+n*.8).toFixed(2)}s">${esc(p[1])}</h3>`:`<div style="animation-delay:${(2.8+n*.8).toFixed(2)}s"><span>${p[0]}</span>${esc(p[1])}</div>`).join('')}</div></div>
    <div class="ifuss"><button data-a="feierEnde">${F.start?'Anpacken 💪':'Anstoßen 🥂'}</button></div><div class="ischw"></div></div>`;
}
// Töne passend zu den Bewegungen: das Siegel fällt nach 1,6 s (Stempel bei 2 s), dann ab 2,8 s alle 0,8 s ein Punkt mit leisem Klick (7.3 ruhiger, vorher 0,9 s und 0,45 s).
// Version 7.3: Die Fanfare hängt an den Geräuschen und spielt nur bei ausgeschalteter Musik (sonst läuft die Aufstiegsmusik).
// Seit 7.7 kommt sie bei jedem Aufstieg auf der Bühne, beim Spielstart nicht.
function feierStart(){
  feierStopp();
  if(S.feier&&S.feier.welt) return weltFeierStart();
  if(S.feier&&S.feier.spende) return spFeierStart();
  const F=S.feier||{von:S.rang-1,zu:S.rang};
  if(FSTUFE===-1){const el=$('#feier'); FT.push(setTimeout(()=>el.classList.add('neu'),matchMedia('(prefers-reduced-motion:reduce)').matches?300:el.classList.contains('wwende')?WACHS_WENDE:WACHS_WECHSEL)); return}
  if(FSTUFE===0){
    if(TON.musik==='aus'&&!F.start) FT.push(setTimeout(()=>fx('fanfare'),250));
    // Das Kapitel kommt Satz für Satz im Takt der Geschichte, die Karte wächst dabei nach oben. Ohne Bewegung steht alles gleich da.
    const el=$('#feier'), karte=$('#feier .fkarte');
    if(matchMedia('(prefers-reduced-motion:reduce)').matches) return el.classList.add('alle');
    [...karte.querySelectorAll('p')].forEach((p,n)=>FT.push(setTimeout(()=>{p.classList.add('da'); karte.scrollTop=karte.scrollHeight},(1.4+n*SATZ_TAKT)*1000)));
    return;
  }
  const n=F.start?startPunkte().length:feierPunkte(F.von,F.zu).length;
  FT.push(setTimeout(()=>fx('stempel'),2000));
  for(let k=0;k<n;k++) FT.push(setTimeout(()=>fx('klick'),2800+k*800));
}
function urkWand(){
  const U=(S.ehrungen||[]).map((e,n)=>[e,n]).filter(([e])=>e.a&&urkRang(e)>=0);
  if(!U.length) return `<div class="mut">Noch keine. Der erste Aufstieg führt zum ${RAENGE[1].name}, dann hängt hier deine erste Urkunde.</div>`+spWand();
  return `<div class="uwand">${U.map(([e,n])=>`<button class="umini" data-a="urkunde" data-n="${n}"><b>${esc(e.w&&RAENGE[urkRang(e)].kw||RAENGE[urkRang(e)].kurz)}</b><small>${e.j?`${MON[e.m].slice(0,3)} ${e.j}`:''}</small></button>`).join('')}</div><div class="mut" style="margin-top:6px">Tipp auf eine Urkunde, dann siehst du sie groß.</div>`+spWand();
}
// Version 9.0: Fenster "Mein Weingut" im Büro neben den Urkunden. Ein großes Sommerbild, darunter 10 Knöpfe für die Stufen (Maik 18.11.2026, ohne Regler für die Jahreszeit).
// Start bei der aktuellen Stufe. Die nächste Stufe (Schloss) steht als dunkler Schatten mit Rangname da, die übrigen Knöpfe sind grau und gehen nicht.
// WG_SICHT hält die gewählte Stufe bis zum nächsten Monat. Geladen wird nur das Sommerbild der gezeigten Stufe.
let WG_SICHT=null;
// Seit 10.2.1 "Dein Rang": nur die erreichten Ränge und der nächste mit Schloss, dahinter "+ x weitere" und darunter der Name des nächsten Rangs (Maik 19.11.2026).
function wgFenster(){
  const max=S.rang+1, n=Math.min(10,max+1), rest=10-n, nx=max<10?RAENGE[max]:null;
  return fenster('meingut','Mein Weingut',`<div class="wgbild"><div class="wgl"></div><div class="wgsch"></div><div class="wgtxt"></div></div>
    <div class="wgregler"><b>Dein Rang</b></div><div class="wgst">${Array.from({length:n},(_,k)=>`<button class="klein" data-a="wgSt" data-st="${k+1}">${k+1>max?'🔒':k+1}</button>`).join('')}${rest>0?`<span class="mut wgrest">+ ${rest} weitere</span>`:''}</div>
    ${nx?`<div class="mut wgnx">Nächster Rang: 🔒 <b>${esc(frau()&&nx.w||nx.name)}</b></div>`:''}`,
    {buch:'ziel',i:'Mit jedem Rang wächst dein Weingut. Unten tippst du auf einen Rang und siehst, wie dein Weingut damals aussah. Der nächste Rang bleibt im Dunkeln, bis du aufsteigst.'});
}
// Zeichnet Bild, Text und Knöpfe der gewählten Stufe, ohne das Büro neu aufzubauen (die Seite springt nicht).
function wgZeig(){
  const b=document.querySelector('.wgbild'); if(!b) return; const max=S.rang+1, st=Math.min(wgSicht().st,10), zu=st>max, rn=esc(frau()&&RAENGE[st-1].w||RAENGE[st-1].name);
  b.classList.toggle('zu',zu); b.style.setProperty('--wgz',`url(bilder/${wgBild(st,'sommer')}.jpg)`);
  if(!zu) b.querySelector('.wgl').style.backgroundImage=`url(bilder/${wgBild(st,'sommer')}.jpg)`;
  b.querySelector('.wgtxt').innerHTML=zu?`<i>🔒</i><b>${rn}</b>Nächster Rang`:`<b>${rn}</b>Stufe ${st} · ${wgSeit(st-1)}`;
  (b.closest('.fen')||b.parentNode).querySelectorAll('.wgst button[data-st]').forEach(x=>x.classList.toggle('sec',+x.dataset.st!==st));
}
function wgStart(){const b=document.querySelector('.wgbild'); if(!b||b.dataset.ok) return; b.dataset.ok=1; wgZeig()}
// Seit 8.2: unter den Urkunden die Ehrungen für die Spenden, Schilder rund, ab Stufe 5 als kleine Urkunde.
function spWand(){
  const E=(S.spenden||[]).slice().sort((a,b)=>a.s-b.s); if(!E.length) return '';
  return `<div class="mut" style="margin:12px 0 6px">Dank für deine Spenden</div><div class="uwand spw">${E.map(e=>{const D=SPENDEN[e.s];
    return `<button class="${e.s<=4?'spmini m-'+D.ehre:'umini'}" data-a="spEhre" data-n="${e.s}"><b>${esc(spFuge(spKurz(e.s,e)))}</b><small>${e.s<=4?e.j:`${MON[e.m].slice(0,3)} ${e.j}`}</small></button>`}).join('')}</div>`;
}
const sterne=n=>`<span class="sterne">${'★'.repeat(n)}<i>${'★'.repeat(3-n)}</i></span>`;
// Seit 11.4: o.neu wählt die Fassung (Rollen oder alte Sorten), ohne Angabe gilt die der laufenden Partie (rollenAn).
function steckbrief(id,o={}){
  const neu=o.neu??rollenAn(), r=REG(id,neu), [sym,art]=gebietArt(r), mi=r.min, pz=x=>Math.round(x*100)+'\u00a0%';
  // Seit 13.4.1: Stärke und Problem aus den Konstanten in REGIONEN, dazu der Weg im Herbst. Wortlaut seit 13.8.
  const bonus=r.wettPlus?'Steillagen-Ruf':r.preisF?'berühmte Lage':r.ertragF>1?'volle Trauben':r.aukPreisF<1?'günstiges Land':r.reifeF>1?'Flaschenreife':r.festF>1?'Feste':'';
  const stark=[r.ertragF>1?`Die Reben tragen ${pz(r.ertragF-1)} mehr.`:'',r.aukPreisF<1?`Land ist bei Auktionen ${pz(1-r.aukPreisF)} günstiger.`:'',
    r.reifeF>1?`Wein gewinnt in der Flasche ${pz(r.reifeF-1)} schneller an Wert.`:'',r.festF>1?`Feste bringen ${pz(r.festF-1)} mehr Ansehen.`:'',
    r.wettPlus?`Bei Wettbewerben zählt jeder Wein ${r.wettPlus} Punkte mehr.`:'',r.preisF?`Jeder Wein bringt ${pz(r.preisF-1)} mehr Geld.`:'',r.sektPreisF>1?`Sekt bringt ${pz(r.sektPreisF-1)} mehr Geld.`:''].join(' ').trim();
  const schwach=[r.weg==='edel'?'Eiswein gibt es nur in einem harten Winter, den der Winzerbote ankündigt.':r.weg==='frost'?'Trockenbeerenauslese ist schwer: Edelfäulnis gibt es nur in einem goldenen Herbst, den der Winzerbote ankündigt.':'',
    r.handLohnF>1?`Die Lese von Hand kostet ${pz(r.handLohnF-1)} mehr Lohn.`:'',r.steil?'In der Steillage fahren weder Erntemaschine noch Vollernter, gelesen wird von Hand.':'',r.aukF<1?`Es gibt ${pz(1-r.aukF)} weniger Auktionen.`:'',
    r.ertragF<1?`Die Reben tragen ${pz(1-r.ertragF)} weniger.`:'',r.sektPreisF<1?`Sekt bringt ${pz(1-r.sektPreisF)} weniger Geld.`:''].join(' ').trim();
  const wegT={edel:'Edelfäulnis, wer bis November wartet',frost:'Eiswein, wer bis Dezember wartet',beide:'Edelfäulnis und Eiswein, mit der Tendenz im Winzerboten'}[r.weg];
  const G=gebietText(id,neu), lohnt=G.lohnt, SF=sortenFolge(id,neu);
  const stars=SF.filter(s=>SORTEN[s].sektStar).map(s=>SORTEN[s].name);
  const sekt=`<span class="sterne">${'🍾'.repeat(G.sekt)}<i>${'🍾'.repeat(3-G.sekt)}</i></span>`;
  // Seit 7.0: dazu, ab wann die Sorte kommt (sortenFolge, SORTE_RANG).
  const so=SF.map((s,i)=>{const e=eignung(s,id); return `${dot(s)}${SORTEN[s].name} ${rolleVon(s)?`<span class="rolle">${rolleVon(s).name}</span>`:sterne(e>=1?3:e>=.85?2:1)} <span class="mut">${i?`ab ${RAENGE[SORTE_RANG[i]].name}`:'zum Start'}</span>`}).join('<br>');
  const kv=(a,x)=>`<div class="kv"><span>${a}</span><span>${x}</span></div>`;
  // o.fen (seit 7.4): ohne eigene Karte, für das zugeklappte Fenster "Dein Gebiet" im Weinberg. Kopf und Rumpf kommen einzeln zurück.
  const rumpf=`<div class="schild">🎯 ${G.spiel}${G.erst?` · ⭐ ${G.erst}`:''}</div><div class="sbz">${so}</div>
    ${kv('💶 Geld',sterne(r.preisF?3:2))}${kv('🎖️ Ansehen',sterne(r.wettPlus?3:2))}${neu?kv('🍾 Regional-Sekt',`vom ${stars[0]}`):kv('🍾 Sekt-Potenzial',sekt)}
    <div class="mut" style="font-size:13px">${neu?`Sekt vom ${stars[0]} bringt ${Math.round((SEKT_STAR-1)*100)} % mehr als Sekt aus den anderen Sorten.`:stars.length?`Sekt-Stars hier: ${stars.join(' und ')}, sie bringen als Sekt ${Math.round((SEKT_STAR-1)*100)} % mehr.`:'Hier wächst keine Sekt-Star-Sorte.'} Sekt gibt es ab ${RAENGE[R_SEKT].name}.</div>
    <div class="sbz">💪 ${stark}<br>⚠️ ${schwach}</div>
    <div class="sbz">📏 Hürden: Spätlese ${mi.spat}°, Auslese ${mi.aus}°, Beerenauslese ${mi.ba}°</div>
    ${kv('🍂 Herbst der Spitzen-Sorte',wegT)}${kv('🌸 Spätfrost im Frühjahr',`rund jedes ${SPAET_JAHR}. Jahr`)}
    <div class="lohnt">🎯 Lohnt sich hier: ${lohnt}</div>
    <div class="sbz"><b>So gehst du vor</b><ol class="strat">${G.strat.map(x=>`<li>${x}</li>`).join('')}</ol></div>`;
  return o.fen?{name:`${sym} ${r.name}`,art:`${art}${bonus?', '+bonus:''}`,rumpf}:`<div class="card sb"><h3>${sym} ${r.name}<small>${art}${bonus?', '+bonus:''}</small></h3>${rumpf}${o.buch?mib('gebiete'):''}</div>`;
}
// Version 4.1: Buch mit der Spielanleitung, Texte in anleitung.js. BUCH: null = zu, '' = Inhaltsverzeichnis, sonst die Kennung des Kapitels.
// "📖 Mehr im Buch" hinter dem i eines Fensters schlägt das Kapitel des Ortes auf (BUCH_ORT), Fenster von unten haben eigene Links (Kasse, Lese, Anmelden, Weinlexikon).
let BUCH=null;
const mib=id=>`<span class="mib" data-a="buch" data-id="${id}">📖 Mehr im Buch</span>`;
// Im Kapitel Gebiete stehen statt fester Zahlen die sechs Steckbriefe aus dem Code.
function gebieteGenauer(){
  const h=m=>REIHE.filter(st=>m[st]).map(st=>`${STUFEN[st].name} ${m[st]}°`).join(', ');
  return `<details open><summary>Genauer</summary><ul><li>Hürden in allen Gebieten: ${h(MIN_NORMAL)}.</li>
    <li>${rollenAn()?`Jedes Gebiet hat drei Rebsorten mit festen Rollen. Wie viel Zucker die Trauben bilden, hängt an Lage und Sorte, mehr im Weinkompendium unter „Klima je Weinberg“ (seit dem Nachtrag zu 14.5.4, Platzhalter, Wortlaut in Meilenstein 17). Spielstände von vor Version 11.4 behalten ihre alten Sorten mit Sternen.`:`Die Sorte mit ★★★ startet mit dem vollen Zucker, die anderen mindestens 1° darunter.${sternPreisText()}`}</li></ul>${Object.keys(REGIONEN).map(id=>steckbrief(id)).join('')}</details>`;
}
function buchZeig(){
  const b=$('#buch'); if(BUCH==null){b.className=''; b.innerHTML=''; return}
  const K=buchKap(), i=K.findIndex(k=>k.id===BUCH), k=K[i], vor=K[i+1], zur=K[i-1];
  const h=i<0?`<div class="binh"><h2>Inhalt</h2>${ANLEITUNG.map(t=>`<h3>${t.titel}</h3>${t.kap.map(k=>`<div class="bz" data-a="buch" data-id="${k.id}"><span>${k.nr}.</span>${k.titel}</div>`).join('')}`).join('')}</div>`
    :`<div class="bnr">Kapitel ${k.nr} von ${K.length}</div><h2>${k.titel}</h2><div class="kurz"><b>Kurz gesagt:</b> ${k.kurz}</div>${k.p}${k.id==='gebiete'?gebieteGenauer():k.g?`<details><summary>Genauer</summary>${k.g}</details>`:''}`;
  b.innerHTML=`<div class="bkopf"><b>Spielanleitung</b><button class="sec klein" data-a="buchZu" aria-label="Buch schließen">✕</button></div><div class="binnen">${h}</div>
    <div class="bfuss"><button class="sec klein" data-a="buch" data-id="${zur?zur.id:''}" ${zur?'':'disabled'}>◀ Zurück</button>${i<0?'':`<button class="klein" data-a="buch" data-id="">☰ Inhalt</button>`}<button class="klein" data-a="buch" data-id="${i<0?K[0].id:vor?vor.id:''}" ${i<0||vor?'':'disabled'}>Weiter ▶</button></div>`;
  b.className='an'; $('.binnen',b).scrollTop=0;
}
// Betrieb (seit 7.4 auf dem Fenster-Baustein, seit 7.5 mit dem Personal): Dein Betrieb, die drei Manager untereinander, Deine Leute, das Fest.
// Von Juni bis August steht das Fest oben, solange es nicht gefeiert ist. Was der Rang noch sperrt, ist seit 10.6 ausgeblendet (bis 10.5 zugeklappt mit Schloss unten).
// Der Gebiets-Steckbrief steht seit 7.4 im Weinberg.
function vBetrieb(){
  const F=hoffestHtml(), M=mgrHtml();
  return (F.jetzt?F.h:'')+fenster('betrieb','Dein Betrieb',`<div class="kv"><span>Anbaugebiet</span><span>${R().name}</span></div>
    <div class="kv"><span>Fläche</span><span>${S.ha} Hektar, ${Math.round(rebenGesamt()/(S.ha*HA_REBEN)*100)} % bepflanzt</span></div>
    <div class="kv"><span>Lagen</span><span>${hangZeile()}</span></div>
    <div class="kv"><span>Bepflanzt</span><span>${rbn(rebenGesamt())} von ${rbn(S.ha*HA_REBEN)} Reben</span></div>
    ${S.spitze?`<div class="kv"><span>Spitzenlage</span><span>${SPITZE_HA} Hektar Südhang, ${KLIMA_WORT.spitzenlage}</span></div>`:''}
    <div class="kv"><span>Fassraum belegt</span><span>${num(fassBelegt())} von ${num(S.fassraum)} l</span></div>
    <div class="kv"><span>Leere Flaschen</span><span>${num(S.flaschen)}</span></div>
    ${einFrei('leute')?'':`<div class="kv"><span>Deine Leute</span><span>Familie, schafft ${ALLEIN_HA} Hektar</span></div>`}
    <div class="kv"><span>Maschinen</span><span>${S.maschinen.length}${S.maschinen.length?`, ${maschVerteilung().length} im Einsatz`:''}</span></div>
    <div class="kv"><span>Löhne im Monat</span><span>${eur(kosten().loehne)}</span></div>
    <div class="kv"><span>Feste Kosten im Monat</span><span>${(k=>eur(k.basis+k.loehne+k.tilgung+k.zins))(kosten())}</span></div>
    ${S.kredit?`<div class="kv"><span>Kredit, Restschuld</span><span>${eur(S.kredit.rest)}</span></div>`:''}`,{
    i:'Hier siehst du dein Weingut auf einen Blick: Fläche, Fassraum, Kosten und Kredit. Feste Kosten sind Betriebskosten, Löhne und die Kreditrate, sie gehen jeden Monat von selbst ab. Darunter stehen deine Manager und deine Leute. Den Steckbrief deines Gebiets findest du im Weinberg.'})
    +M.h+leuteHtml()+(F.jetzt?'':F.h||'')+M.zu+(F.zu||'');
}
// Seit 7.5: Erntehelfer und Lagerarbeiter im Betrieb, je eine Zeile mit Anzahl, Aufgabe und Lohn. Eingestellt und entlassen wird im Arbeitsamt.
function leuteHtml(){
  const fe=leuteFehlen(), ms=maschHelfer();
  const z=(k,name,aufg)=>`<div class="fz"><b>${name}</b><div class="mut">${aufg}</div><div class="kv"><span>Angestellt</span><span>${S[k]}</span></div>
    <div class="kv"><span>Stufe</span><span>${leuteSt(k)} von 3</span></div><div class="mut">${leuteStufeText(k)}</div>
    ${S[k]?`<div class="kv"><span>Lohn im Monat</span><span>${eur(lohnSumme(k))}</span></div>`:''}${fe[k]?`<div class="rot" style="font-size:14px;margin-top:4px">${fe[k]===1?'Es fehlt einer':'Es fehlen '+fe[k]}, vorher geht es nicht in den nächsten Monat.</div>`:''}</div>`;
  return fenster('leute','Deine Leute',[
    z('helfer','Erntehelfer',`Fest angestellt, pflegen die Reben und lesen die Trauben. Einer je ${haWort(REBEN_JE_HELFER/HA_REBEN)} Reben${ALLEIN_HA?`, die ersten ${ALLEIN_HA} Hektar schafft deine Familie`:''}${ms?`, deine Erntemaschinen im Einsatz decken ${haWort(ms)} ab`:''}. ${S.rang>=R_STREU?'Sie fahren auch die Maschinen und lesen':'Sie lesen auch'} Edelfäulnis und Eiswein von Hand.`),
    z('lagerarb','Kellerleute',`Betreuen Fassraum und leere Flaschen. Einer je ${num(FASS_JE_LAGERARB)} l Fassraum und ${num(flJeLager())} Flaschen${bonusMasch('abfuell')?', mit der Abfüllanlage':''}${ALLEIN_FASS||ALLEIN_FL?`, ${num(ALLEIN_FASS)} l und ${num(ALLEIN_FL)} Flaschen betreust du selbst`:''}.${maschFrei('abfuell')||S.maschinen.some(x=>x.typ==='abfuell')?' Einer bedient auch die Abfüllanlage.':''}`)],{
    hin:[aufgabeAktiv('helfer')&&`${MGR_BEREICHE.weingut.sym} Dein ${MGR_BEREICHE.weingut.name} stellt fehlende Erntehelfer beim Weiterblättern ein.`,
      aufgabeAktiv('lager')&&`${MGR_BEREICHE.weingut.sym} Dein ${MGR_BEREICHE.weingut.name} stellt fehlende Kellerleute beim Weiterblättern ein.`,csChef('leute')],
    kn:pk('arbeitsamt','Zum Arbeitsamt','',{sec:1}),buch:'arbeit',
    i:`${helferRegel()}. ${lagerRegel()}. Deine Leute brauchst du das ganze Jahr: Fehlt jemand, geht es nicht in den nächsten Monat. Einstellen und entlassen kannst du im Arbeitsamt. Dort schwankt der Lohn jeden Monat zwischen ${eur(lohnF(LOHN_MIN))} und ${eur(lohnF(LOHN_MAX))}, wer eingestellt ist, behält seinen Lohn.`});
}
function reserveChips(){const d=S.dauer||{}; return `<div class="chips" style="flex-wrap:wrap">${DAUER_RESERVE.map(n=>`<button class="chip ${(+d.reserve||0)===n?'an':''}" data-a="dauerRes" data-id="${n}">${n?num(n):'keine'}</button>`).join('')}</div>`}
function mgrLogHtml(b){
  const L=((S.manager||{})[b]||{}).log||[];
  return `<div style="margin-top:8px"><b>Zuletzt erledigt</b></div>`+(L.length?L.slice().reverse().map(e=>`<div style="margin-top:3px"><b>${mgrWann(e.z)}:</b> ${esc(e.t)}</div>`).join('')
    :`<div>Noch nichts. Hier stehen später die letzten sechs Monate, in denen ${mgrG(b).er} etwas erledigt hat.</div>`);
}
function mgrPersonal(b){
  const M=MGR_BEREICHE[b], st=mgrSt(b), E=MANAGER.filter(e=>e.bereich===b), G=mgrG(b), n=mgrNaechste(b), id='p_'+b;
  const mI=`${G.Er} erledigt beim Weiterblättern, was du hier einschaltest, und berichtet im Winzerboten. Einkäufe zahlt ${G.er} aus deiner Kasse. ${G.Er} gehört fest zum Gut und steigt mit deinem Rang von selbst auf.`;
  const stufen=`<div class="fstand" style="margin:6px 0 0">${E.map(e=>mgrStufenText(e,st)).join('<br>')}</div>`;
  if(!st&&!frei(mgrK(E[0]))) return fenster(id,M.name,'',{zu:freiText(mgrK(E[0])),buch:'manager',i:mI+stufen});
  if(!st) return fenster(id,M.name,`<div class="kv"><span>Stufe</span><span>kommt mit dem nächsten Monat</span></div>${stufen}`,{
    buch:'manager',i:mI});
  return fenster(id,M.name,`<div class="pkopf">${M.bild?`<div class="mgrbild" style="background-image:url(bilder/${M.bild})"></div>`:''}<div>
    <div class="kv"><span>Stufe</span><span>${st} von ${E.length}</span></div><div class="kv"><span>Lohn im Monat</span><span>${eur(mgrEintrag(b,st).lohn)}</span></div></div></div>
    ${mgrSchalter(b)}`,{
    links:n?`Stufe ${n.stufe} kommt ${freiText(mgrK(n))}.`:'',buch:'manager',i:mI+mgrLogHtml(b)});
}
function pufferChips(b){const p=mgrPuffer(b); return `<div class="chips" style="flex-wrap:wrap">${MGR_PUFFER.map(n=>`<button class="chip ${p===n?'an':''}" data-a="mgrPuffer" data-b="${b}" data-id="${n}">${n?eur(n):'nichts'}</button>`).join('')}</div>`}
// Seit 7.5 ein Fenster "Manager" im Arbeitsamt: je Manager eine Zeile mit Stufe und Lohn. Seit 11.5 (Teil C1) ohne Knopf, die Manager kommen von selbst.
// Die Schalter der Aufgaben stehen im Betrieb. Vor dem Rang des ersten Managers ist das Fenster seit 10.6 ausgeblendet (bis 10.5 zugeklappt mit Schloss unten).
function mgrAmt(){
  // Seit 10.6: nur die Manager, die der Rang schon freigibt, die anderen tauchen erst mit ihrem Rang auf.
  const B=Object.keys(MGR_BEREICHE).filter(b=>mgrSt(b)>0);
  const mgI='Manager nehmen dir Arbeit ab. Jeder kommt mit seinem Rang von selbst dazu und steigt mit späteren Rängen auf, einstellen und befördern musst du niemanden. Jede Stufe bringt neue Aufgaben, sie sind gleich eingeschaltet. Was du lieber selbst machst, schaltest du im Betrieb ab. Manager gehören fest zum Gut, entlassen kannst du sie nicht. Ihr Lohn hängt nur an der Stufe und läuft weiter, auch wenn du alle Schalter ausschaltest.';
  const stufen=B.map(b=>`<div style="margin-top:6px"><b>${MGR_BEREICHE[b].name}</b><br>${MANAGER.filter(e=>e.bereich===b).map(e=>mgrStufenText(e,mgrSt(b))).join('<br>')}</div>`).join('');
  if(!B.length) return fenster('mgr_amt','Manager','',{zu:freiText(mgrK(MANAGER[0])),buch:'manager',i:mgI+stufen});
  return fenster('mgr_amt','Manager',B.map(b=>{
    const st=mgrSt(b), n=mgrNaechste(b), E=MANAGER.filter(e=>e.bereich===b), neu=n?mgrAufg(n).map(k=>MGR_AUFGABEN[k].kurz):[];
    return fz(MGR_BEREICHE[b].name,st?`Stufe ${st} von ${E.length}, ${eur(mgrEintrag(b,st).lohn)} Lohn im Monat`:'Kommt mit dem nächsten Monat',
      n?`Stufe ${n.stufe} (${freiText(mgrK(n))})${neu.length?': '+neu.join(', '):''}, dann ${eur(n.lohn)} Lohn`:'Höchste Stufe erreicht')}),{buch:'manager',i:mgI+stufen});
}
// Schalter je Aufgabe der erreichten Stufen, darunter die noch fehlenden Stufen und die Auswahl für Reserve und Geldgrenze.
// Steht seit 7.5 im Fenster des Managers im Betrieb und im Fenster von unten, beide zeigen dasselbe.
function mgrSchalter(b){
  const st=mgrSt(b), E=MANAGER.filter(e=>e.bereich===b), G=mgrG(b);
  const teil=e=>e.stufe>st?`<div class="mut" style="margin:0 0 8px">${mgrStufenText(e,st)}</div>`
    :mgrAufg(e).filter(k=>!CS_AUFG[k]).map(k=>{const an=aufgabeAktiv(k); return `<button class="wahl schalter ${an?'an':''}" data-a="mgrAn" data-id="${k}">${an?'✅':'⬜'} ${k==='laeden'||k==='handel'?'📋 ':''}${MGR_AUFGABEN[k].text}</button>`}).join('');
  return E.map(teil).join('')
    +(b==='weingut'&&aufgabeAktiv('plan')?`<div class="mitte" style="margin:2px 0 8px"><button class="klein" data-a="einsatz">📋 Einsatzplan öffnen</button></div>`:'') // seit 14.7.4
    +(b==='weingut'&&st?`<div style="margin-top:8px"><b>${CHEFSACHE_TEXT.titel}</b></div><div class="mut">${CHEFSACHE_TEXT.kopf}</div>${csInhalt()}`:'') // seit 14.7.5
    +(b==='handel'&&st?`<div class="mut" style="margin:8px 0 6px">${verkaufText('grenze')}</div>`:'') // seit 14.7.6, Annahme 24
    +(b==='handel'&&(aufgabeAktiv('laeden')||aufgabeAktiv('handel')||aufgabeAktiv('regal'))?`<div class="mut" style="margin:8px 0 6px">Je Wein bleiben im Keller, außer kurz vorm Verderben:</div>${reserveChips()}`:'')
    +(b==='handel'&&aufgabeAktiv('fest')||b==='weingut'&&mgrPufferFuer().length?`<div class="mut" style="margin:8px 0 6px">${b==='weingut'?'Für '+wortListe(mgrPufferFuer()):'Für das Fest'} gibt ${G.er} nur so viel aus, dass mindestens das auf dem Konto bleibt:</div>${pufferChips(b)}`:'');
}
// Seit 14.7.2 (Annahme 5): wofür der Weingut-Manager seine Geldgrenze nimmt. Platzhalter, Wortlaut in Meilenstein 17.
function mgrPufferFuer(){return [(aufgabeAktiv('fass')||aufgabeAktiv('flaschen'))&&'Fassraum und Flaschen',(aufgabeAktiv('helfer')||aufgabeAktiv('lager'))&&'das Einstellen'].filter(Boolean)}
function wortListe(L){return L.length>1?L.slice(0,-1).join(', ')+' und '+L[L.length-1]:L.join('')
}
// Fenster von unten: Porträt, Lohn, zuletzt Erledigtes, die Schalter (mgrSchalter) und der Knopf zum Befördern. Öffnet sich nach Einstellen oder Befördern.
let MGR_OFFEN=null;
// Seit 11.5 (Teil C1): Kommt ein Manager neu oder steigt er auf, stellt er sich in diesem Fenster vor (MGR_NEU, Eintrag aus S.mgrNeu): wer er ist, was er abnimmt, was er im Monat kostet.
let MGR_NEU=0;
function mgrFenster(b){
  const M=MGR_BEREICHE[b], st=mgrSt(b), E=MANAGER.filter(e=>e.bereich===b), m=(S.manager||{})[b]||{};
  const G=mgrG(b), q=MGR_NEU&&(S.mgrNeu||[])[0], neu=q&&q.b===b?q:null, n=mgrNaechste(b), lohn=st?eur(mgrEintrag(b,st).lohn):'';
  const was=neu?E.filter(e=>e.stufe>neu.von&&e.stufe<=st).flatMap(e=>mgrAufg(e).map(k=>MGR_AUFGABEN[k].kurz)):[];
  const vor=!neu?'':(neu.von?`<p><b>${G.Dein} ${M.name} ist mit dir aufgestiegen und jetzt auf Stufe ${st}.</b> ${was.length?`Neu dazu: ${was.join(', ')}. `:''}${G.Er} bekommt jetzt ${lohn} im Monat.</p>`
    :`<p><b>${G.Dein} ${M.name} stellt sich vor.</b> Mit deinem Rang gehört ${G.er} ab jetzt fest zu deinem Weingut${was.length?` und übernimmt: ${was.join(', ')}`:''}. ${G.Er} bekommt ${lohn} im Monat.</p>`)
    +`<p class="mut">Alles Neue ist eingeschaltet. Was du lieber selbst machst, schaltest du hier oder später im Betrieb ab, der Lohn läuft trotzdem weiter.</p>`;
  return `${M.bild?`<div class="mgrportraet" style="background-image:url(bilder/${M.bild})"></div>`:''}<h3>${M.sym} ${st?G.Dein+' '+M.name:M.name}</h3>
  ${vor}<div class="mut" style="margin-bottom:8px">${st?`Stufe ${st} von ${E.length}. ${G.Er} erledigt beim Weiterblättern, was du hier einschaltest, und berichtet im Winzerboten. Einkäufe zahlt ${G.er} aus deiner Kasse.`:`${G.Er} kommt mit dem Rang ${RAENGE[E[0].rang].name} von selbst.`}</div>
  ${st?`<div class="kv"><span>Lohn im Monat</span><span>${lohn}</span></div>`:''}
  ${m.zuletzt?`<div class="kv"><span>Zuletzt</span><span>${esc(m.zuletzt)}</span></div>`:''}
  ${mgrSchalter(b)}
  ${n&&st&&!neu?`<div class="mut" style="margin:8px 0">Stufe ${n.stufe} kommt ${freiText(mgrK(n))}.</div>`:''}${mib('manager')}
  ${neu?`<div class="mitte"><button class="siegel" data-a="mgrDa">Okay</button></div>`:`<div class="btns"><button class="sec" data-a="close">Zurück</button></div>`}`;
}
// Stellt den nächsten Manager aus S.mgrNeu vor, sobald Zeitung und Feier vorbei sind und kein Fenster offen ist. Läuft am Ende von render.
function mgrVorstellen(){
  if(!S||window.BOT||S.ende||!S.mgrNeu||!S.mgrNeu.length||S.feier||!SUBS[TAB]||$('#sheet').classList.contains('an')) return;
  if(!mgrSt(S.mgrNeu[0].b)){S.mgrNeu.shift(); return}
  MGR_OFFEN=S.mgrNeu[0].b; MGR_NEU=1; openSheet(mgrFenster(MGR_OFFEN));
}
// Hoffest ab Verbandsvorstand: Juni bis August, einmal im Jahr.
// Weinfest ab Winzermeister, ab Verbandsvorstand wird daraus das Hoffest. Beide teilen sich Bild, Monate und S.festJahr.
// Seit 7.4 als Fenster: {h, jetzt} oder vor dem Rang {zu}. jetzt heißt: Es ist Festzeit und noch nicht gefeiert, dann steht das Fenster im Betrieb oben.
function hoffestHtml(){
  const art=festArt(), F=FESTE[art||'weinfest'], m=S.monat, zeit=m>=5&&m<=7, schon=S.festJahr===S.jahr;
  const fI=`${F.text} bringt Ansehen. Gefeiert wird von Juni bis August, einmal im Jahr. Das Wetter im Festmonat entscheidet mit: Sonne bringt mehr, Regen weniger.${art!=='hoffest'?` Ab dem Rang ${RAENGE[R_HOFFEST].name} wird daraus das große Hoffest.`:''}`;
  if(!art) return {zu:fenster('fest',F.name,'',{zu:`ab dem Rang ${RAENGE[R_WEINFEST].name}`,i:fI})};
  const mf=!schon&&aufgabeAktiv('fest');
  return {jetzt:zeit&&!schon,h:fenster('fest',F.name,`<div class="kbild" style="background-image:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.7)),url(bilder/hoffest.jpg)"><b>🎉 ${F.name}</b><span>Juni bis August, einmal im Jahr</span></div>
    <div class="kv"><span>Kosten</span><span>${eur(F.preis)}</span></div><div class="kv"><span>Bringt</span><span>rund ${Math.round(festAns(F))} Ansehen</span></div>`,{
    hin:[mf&&`${MGR_BEREICHE.handel.sym} ${mgrG('handel').Dein} ${MGR_BEREICHE.handel.name} richtet das Fest aus, bei Sonne oder spätestens im August.`],
    links:schon?(S.fest?'Das Fest steigt diesen Monat, der Bericht kommt im nächsten Winzerboten.':`Das ${F.name} ${S.jahr} ist gefeiert. Nächstes Jahr wieder.`):zeit?'':'Gefeiert wird von Juni bis August.',
    kn:pk('hoffest','Feiern',eur(F.preis),{aus:!(zeit&&!schon),arm:S.geld<F.preis}),i:fI})};
}
// Aktuelles: der Rang und darunter die anklickbaren Hinweise, die zur passenden Stelle führen.
// Version 4.0: Kauf- und Verkaufsknopf mit dem Preis drauf. o: id, n (data-Werte), sec (zweiter Knopf), aus (gesperrt),
// arm (Geld fehlt: grau, aber antippbar, die Aktion erklärt es), klein (kleine Zeile unter dem Preis, etwa der Preis je Stück).
function pk(a,t,p,o={}){
  const at=['id','n'].filter(x=>o[x]!=null).map(x=>` data-${x}="${o[x]}"`).join('');
  return `<button class="pk${o.sec?' sec':''}${o.wag?' wag':''}${o.arm?' arm':''}" data-a="${a}"${at}${o.aus?' disabled':''}><span>${t}</span>${p?`<b>${p}</b>`:''}${o.klein?`<small>${o.klein}</small>`:''}</button>`;
}
// Zeile unten in der Karte: links eine kurze Erklärung, rechts die Knöpfe untereinander.
function kz(links,...kn){return `<div class="kz${links?'':' reihe'}"><div>${links||''}</div><div class="kzk">${kn.join('')}</div></div>`}
// Kurze Karte für einen Ort, an dem am Anfang noch nichts steht (ein Satz, was hier später passiert).
function einKarte(id,titel,text){return `<section class="card fen"><header class="fkopf"><h3>${titel}</h3></header><div class="fin"><div class="fleer">${text}</div></div></section>`}
function fenster(id,titel,inhalt,o={}){
  if(einZu(id)) return '';
  const auf=FI_AUF.has(id), buch=o.buch===undefined?BUCH_ORT[SUB]:o.buch;
  const i=o.iWort?`<button class="fi wort" data-a="${o.iAkt}">${o.iWort}</button>`
    :o.i?`<button class="fi${auf?' an':''}" data-a="fi" data-id="${id}" aria-label="Erklärung zu ${esc(titel)}" aria-expanded="${auf}"><i>i</i></button>`:'';
  const info=o.i&&!o.iWort?`<div class="finfo"${auf?'':' hidden'}>${o.i}${buch?mib(buch):''}</div>`:'';
  if(o.zu) return '';
  const kern=Array.isArray(inhalt)?(inhalt.length?`<div class="fzl">${inhalt.join('')}</div>`:`<div class="fleer">${o.leer||'Gerade gibt es hier nichts zu tun.'}</div>`):(inhalt||'');
  return `<section class="card fen${o.kl?' '+o.kl:''}"><header class="fkopf"><h3>${titel}</h3>${i}</header>${info}<div class="fin">${(o.hin||[]).filter(Boolean).map(t=>`<div class="hilfe">${t}</div>`).join('')}${o.stand?`<div class="fstand">${o.stand}</div>`:''}${kern}${o.links||[].concat(o.kn||[]).length?kz(o.links||'',...[].concat(o.kn||[])):''}</div></section>`;
}
// Zeile im Fenster für einen Wein oder Posten: Name, graue Angaben, darunter links Zustand oder Warnung, rechts der Knopf.
function fz(name,angaben,zustand,...kn){return `<div class="fz"><b>${name}</b>${angaben?`<div class="mut">${angaben}</div>`:''}${zustand||kn.length?kz(zustand||'',...kn):''}</div>`}
// Aktuelles (seit 7.4 auf dem Fenster-Baustein): "Das steht an" ganz oben (Maik, Version 4.4), der Rang darunter.
function vAktuell(){
  const A=aufgaben(), an=stehtAn()||fuSperre();
  return fenster('ansteht','Das steht an',A.length?A.map(a=>`<button class="task ${a.rot?'rot':a.ruhig?'hin':'gelb'}" data-a="${a.akt||'tab'}" data-id="${a.tab||''}" data-sub="${a.sub||''}">${a.rot?'⚠️ ':''}${esc(a.t)}</button>`).join(''):[],{
    leer:'Diesen Monat steht nichts an. Du kannst weiterblättern.',
    kn:an?`<button class="klein" data-a="tab" data-id="monat">📰 Winzerbote</button>`:`<div class="zweikn"><button class="klein" data-a="tab" data-id="monat">📰 Winzerbote</button><button class="klein" data-a="weiterBis">⏩ Weiter bis etwas ansteht</button></div>`,
    i:'Hier steht, was diesen Monat zu tun ist. Ein Tipp führt dich direkt an den Ort. <b>Rot</b> kann nicht warten, <b>Gelb</b> hat Zeit, <b>Grau</b> ist nur ein Hinweis. Die Punkte an den Reitern zeigen dasselbe, Hinweise bekommen keinen Punkt.<br><br>⏩ „Weiter bis etwas ansteht“ blättert am Stück, höchstens zwölf Monate. Es hält nur bei Rot und bei Schlagzeilen, die dich selbst betreffen. Bei Gelb und bei Hinweisen blättert es weiter. Ausnahme ist die Lese: Von September bis November hält es einmal im Monat, solange Trauben hängen, im Dezember nur bei gefrorenen Trauben.<br><br>Geboten und eingereicht wird im Rathaus, der Tipp hier führt dich hin. „Winzerbote“ zeigt die letzte Ausgabe noch einmal. Tipps gibt dir der Spielführer in der Sprechblase.'+(fuSperre()?(S.ein?'<br><br>Mit dem Spielführer gibt es ⏩ ab April, bis dahin zeigt dir der alte Winzer das Pflanzen.':'<br><br>Mit dem Spielführer gibt es ⏩ erst ab dem Januar des zweiten Jahres, im ersten Jahr kommt fast jeden Monat ein Tipp.'):'')})+vRang();
}
// Maschinen (seit 7.4 auf dem Fenster-Baustein): "Deine Maschinen" mit einer Zeile je Maschine, darunter je Bauart ein Fenster zum Kaufen.
// Was der Rang noch sperrt, ist seit 10.6 ausgeblendet (bis 10.5 zugeklappt mit Schloss unten): die kleine Maschine ab Winzermeister, der Vollernter ab Gutsherr.
function vMaschinen(){
  const saison=S.monat<=2, zu=[];
  // Seit 8.0: Fahrer-Regel, Abnutzung je Lese, Gelb und Rot, Pflege-Bonus. Alle Zahlen aus den Konstanten bei MASCH.
  // Seit Paket B: drei Bonus-Maschinen (bonus:1), je eine im Betrieb. Sie lesen nicht und zählen nicht als Helfer, bei Rot oder ohne Fahrer fällt nur ihr Bonus weg.
  const mI=`Kaufen und verkaufen kannst du von Januar bis März, warten das ganze Jahr.<br><br>🚜 <b>Keine Leute, keine Bewegung:</b> Jede Maschine braucht ihre Leute: die Erntemaschine ${MASCH.klein.fahrer} Fahrer, der Vollernter ${MASCH.gross.fahrer}, Düngerstreuer und Laubschneider je ${MASCH.duenger.fahrer}, die Abfüllanlage ${MASCH.abfuell.fahrer} Kellermensch. Fahrer sind deine Erntehelfer, wer welche Maschine fährt, ist egal. Reichen sie nicht für alle, bekommen erst die Erntemaschinen ihre Fahrer, die großen zuerst. Eine Maschine ohne Fahrer steht still: Eine Erntemaschine zählt dann weder als Helfer noch bei der Ernteleistung, bei den anderen fällt der Bonus weg.<br><br>🔧 <b>Abnutzung:</b> Eine Maschine nutzt sich nur im Einsatz ab. Eine Erntemaschine verliert voll ausgelastet im Jahr rund ${ABNUTZ_VOLL} Prozentpunkte, halb ausgelastet rund die Hälfte, und mit dem Zustand sinkt ihre Leistung bei der Lese. Der Düngerstreuer verliert rund ${STREU_ABN} je Düngung, der Laubschneider rund ${LAUB_ABN} je Sommer, die Abfüllanlage rund ${ABF_ABN} je ${num(ABF_NORM)} Flaschen. Unter ${MASCH_GELB} % lohnt sich das Warten, unter ${MASCH_ROT} % fällt sie ganz aus, bis sie gewartet ist. Bei Düngerstreuer, Laubschneider und Abfüllanlage hält dich das nicht auf, dann fehlt nur der Bonus.<br><br>✨ <b>Pflege lohnt sich:</b> Steht sie vor dem Einsatz bei ${PFLEGE[0][0]} % oder mehr, nutzt sie sich um ein Fünftel weniger ab, bei den Erntemaschinen zählt der Stand vor der ersten Lese des Jahres. Unter ${PFLEGE[1][0]} % nutzt sie sich um zwei Fünftel mehr ab.`;
  // Wie der Bonus genutzt wird, steht unter dem Bonus im Kauf-Fenster.
  const wie={duenger:`Er hilft beim Düngen, von Hand und bei deinem ${MGR_BEREICHE.weingut.name}.`,laub:'Er läuft im Juni von selbst, sobald er da ist und einen Fahrer hat.',abfuell:'Sie hilft beim Abfüllen, von Hand und bei deinen Kellergesellen.'};
  let h=fenster('maschinen','Deine Maschinen',S.maschinen.map((ma,i)=>{const T=mTyp(ma), st=maschStatus(ma), ein=st==='im Einsatz', gl=S.maschinen.filter(x=>mTyp(x)===T), nr=gl.length>1?' '+(gl.indexOf(ma)+1):''; return `<div class="fz"><b>${T.name}${nr}</b>
    <div class="kv"><span>Einsatz</span><span class="${ein?'':'rot'}">${st}</span></div>
    <div class="kv"><span>Zustand</span><span class="${ma.zustand<MASCH_ROT?'rot':''}">${ma.zustand} %${ma.zustand<MASCH_ROT?'':ma.zustand<MASCH_GELB?', Warten lohnt sich':''}</span></div><div class="bar"><i style="width:${ma.zustand}%"></i></div>
    ${T.bonus?`<div class="kv"><span>Bonus</span><span class="${ein?'':'rot'}">${ein?'wirkt':'fällt weg'}</span></div>`:`<div class="kv"><span>Leistung</span><span>${ein?rbn(T.leist*ma.zustand/100):0} Reben</span></div>`}
    ${kz(saison?'':'Verkaufen geht wieder ab Januar.',pk('maschWarten','Warten','',{id:i,aus:ma.zustand>=100,arm:S.geld<T.wart,klein:`${eur(T.wart)} je %`}),saison?pk('maschVerkauf','Verkaufen','+'+eur(T.preis*.5*ma.zustand/100),{id:i,sec:1}):'')}</div>`}),{
    hin:[csBeiMgr()?csZeile('warten'):kellerWartet()?`🔧 Deine Kellerhelfer warten nach der Lese jede Maschine unter ${MGR_WART_AB} % auf 100 %, eine ausgefallene Erntemaschine sofort.`:csIst('warten')],   // seit 14.7.3, Platzhalter, Wortlaut in Meilenstein 17
    kn:csKnopf('warten')||[],   // seit 14.7.5
    leer:'Du hast noch keine Maschine.',i:`${mI}<br><br>Warten bringt den Zustand wieder hoch, verkaufen bringt die Hälfte vom Neupreis, je nach Zustand.`});
  for(const [id,T] of Object.entries(MASCH)){
    if(R().steil&&T.ernte) continue;
    const titel=`Neue${T.f?' ':'r '}${T.name}`, lw=T.leute==='lagerarb'?(T.fahrer===1?'Kellermensch':'Kellerleute'):'Fahrer', fa=`braucht ${T.fahrer} ${lw}`, hat=maschEins(id)&&S.maschinen.some(x=>x.typ===id);
    const was=(T.bonus?`${MASCH_BONUS[id]()}. ${wie[id]} Mehr als ${T.f?'eine':'einen'} brauchst du nicht`:`Schafft ${rbn(T.leist)} Reben bei der Lese und deckt übers Jahr ${T.helfer} Hektar Reben ab${T.eins?`. Mehr als ${T.f?'eine':'einen'} gibt es nicht, alles darüber lesen deine Erntehelfer von Hand, einer je ${REBEN_JE_HELFER/HA_REBEN} Hektar`:''}`)+`, ${fa}. Die Wartung kostet ${eur(T.wart)} je Prozentpunkt.<br><br>${mI}`;
    if(!maschFrei(id)){zu.push(fenster('kauf_'+id,titel,'',{zu:maschFreiText(id),i:was})); continue}
    h+=fenster('kauf_'+id,titel,(T.bonus?`<div class="mut" style="margin-bottom:4px">${MASCH_BONUS[id]()}.</div>`:`<div class="kv"><span>Leistung bei der Lese</span><span>${rbn(T.leist)} Reben</span></div>
      <div class="kv"><span>Deckt übers Jahr ab</span><span>${T.helfer} Hektar Reben</span></div>`)+`<div class="kv"><span>${lw}</span><span>${fa}</span></div><div class="kv"><span>Wartung</span><span>${eur(T.wart)} je %</span></div>`
      // Seit 14.6.8 (Antwort zu D3): in Lehr- und Gesellenjahren ein Satz, wie viele deiner Reben die Erntemaschine lesen darf. Platzhalter, Wortlaut in Meilenstein 17.
      +(T.ernte&&MASCH_FORM_STUFEN.includes(S.schwer)?`<div class="mut" style="margin-top:4px">${MASCH_FORM_TEXT.kauf.replace('{er}',maschEr({typ:id})).replace('{formen}',MASCH_FORM_TEXT.formen[id]).replace('{g}',rbn(rebenGesamt())).replace('{n}',rbn(maschFormReben(T)))}</div>`:'')
      // Seit 15.1.1 (Bauplan 15.1 Annahme 1): derselbe Satz beim Laubschneider, wie viele deiner Reben er schneiden darf. Platzhalter, Wortlaut in Meilenstein 17.
      +(T===MASCH.laub&&MASCH_FORM_STUFEN.includes(S.schwer)?`<div class="mut" style="margin-top:4px">${MASCH_FORM_TEXT.kaufLaub.replace('{formen}',MASCH_FORM_TEXT.formen.laub).replace('{g}',rbn(rebenGesamt())).replace('{n}',rbn(laubFormReben()))}</div>`:''),{
      links:hat?`Du hast schon ${T.f?'eine':'einen'}.`:saison?'':'Zu kaufen von Januar bis März.',kn:pk('maschKauf','Kaufen',eur(T.preis),{id,aus:!saison||hat,arm:S.geld<T.preis}),i:was});
  }
  // Seit 13.5.5: Ausbau der Abfüllanlage auf Stufe 2, für jede Anlage, die noch auf Stufe 1 ist. Wie der Kauf von Januar bis März.
  {const A=S.maschinen.filter(x=>x.typ==='abfuell'), ein=A.find(x=>abfStufe(x)<2), was=`Stufe 2: ${Math.round(ABF_PLUS2*100)} statt ${Math.round(ABF_PLUS*100)} % mehr Flaschen aus jedem Fass, ein Kellermensch betreut ${num(ABF_FLASCHEN2)} statt ${num(ABF_FLASCHEN)} leere Flaschen.`;
  if(A.length&&!frei('masch_abfuell2')) zu.push(fenster('ausbau_abfuell','Abfüllanlage ausbauen','',{zu:freiText('masch_abfuell2'),i:was}));
  else if(A.length) h+=fenster('ausbau_abfuell','Abfüllanlage ausbauen',`<div class="mut" style="margin-bottom:4px">${was}</div>`,{
    links:!ein?'Deine Abfüllanlage ist schon auf Stufe 2.':saison?'':'Ausbauen geht von Januar bis März.',kn:pk('abfAusbau','Ausbauen',eur(ABF_PREIS2),{aus:!saison||!ein,arm:S.geld<ABF_PREIS2}),i:was})}
  if(einZu('maschinen')) return einKarte('maschinen','Noch alles von Hand',`Am Anfang machst du alles von Hand. Maschinen kommen nach und nach, der Düngerstreuer ${maschFreiText('duenger')}.`);
  return h+zu.join('');
}
function ehrSumme(wein){
  const n={}; for(const e of wein) n[e.i]=(n[e.i]||0)+1;
  return Object.keys(n).sort((a,b)=>(Object.keys(MED_NAME).indexOf(a)+9)%9-(Object.keys(MED_NAME).indexOf(b)+9)%9).map(i=>`<span style="white-space:nowrap">${n[i]}× ${i} ${MED_NAME[i]||''}</span>`).join(' · ');
}
// Seit 7.9: Fehlt der eigene Name (alter Spielstand oder leer gelassen), steht im Büro ganz oben ein Fenster zum Nachtragen.
function namenFenster(){
  if(S.ich) return '';
  const w=frau(), e=S.erbe&&S.erbe.name||'';
  return fenster('namen','Deine Namen',`<label class="feld">Dein Name<input type="text" id="bnI" maxlength="30" placeholder="Vorname Nachname" autocomplete="off" value="${esc(e)}"></label>
    <label class="feld">Name des Weinguts<input type="text" id="bnG" maxlength="${NAME_MAX}" autocomplete="off" value="${esc(S.name)}"></label>
    <div class="feld">Anrede</div><div class="zwei" id="bnA">${[['m','Herr'],['w','Frau']].map(([k,x])=>`<button class="wahl ${(k==='w')===w?'an':''}" data-a="bAnrede" data-v="${k}"><b>${x}</b></button>`).join('')}</div>`,{
    buch:'',hin:[S.ein?'✍️ Beim Start ist dein Name leer geblieben, trag ihn hier ein.':'✍️ Seit Version 7.9 gibt es zwei Namen: deinen eigenen und den des Weinguts. Trag hier beide ein.'],kn:'<button class="klein" data-a="namenJa">Speichern</button>',
    i:'Dein Name steht künftig auf Urkunden, in der Bestenliste, in der Chronik und im Winzerboten. Der Name des Weinguts steht am Hof und in den Schlagzeilen. Urkunden, die schon an der Wand hängen, bleiben, wie sie sind.'});
}
let BUERO='erfolge';
function bueroKacheln(){return `<div class="bkach" role="tablist" aria-label="Bereiche im Büro">${bueroBer().map(([k,s,n])=>`<button class="wahl${BUERO===k?' an':''}" role="tab" aria-selected="${BUERO===k}" data-a="buero" data-id="${k}"><i>${s}</i>${n}</button>`).join('')}</div>`}
function bueroErfolge(){
  const E=(S.ehrungen||[]).slice().reverse(), wein=E.filter(e=>!e.a), sz=kompZahlen();
  const zeile=e=>`<div class="rl"><span>${esc(e.i)}</span><div><b>${esc(e.t)}</b>${e.j?`<span class="mut">${MON[e.m]} ${e.j}</span>`:''}</div></div>`;
  return bueroRang()
    +fenster('ehrungen','Ehrungen für deine Weine',wein.length?`<div class="gold" style="font-size:17px;margin-bottom:6px">${ehrSumme(wein)}</div><div class="mut">Zuletzt:</div>`+wein.slice(0,3).map(zeile).join(''):[],{
      leer:'Noch keine Ehrungen.',buch:'wettbewerb',links:`🏅 Siegelbrett: ${sz.hab} von ${sz.max} Siegeln`,kn:pk('archivGeh','Aufschlagen','',{sec:1,id:'brett'}),
      i:'Medaillen gibt es bei der Landesprämierung, beim Bundeswettbewerb und als Präsident bei der Weltweinschau. Sie bringen Ansehen und machen den Wein wertvoller. Darunter steht, wie viele Siegel du auf dem Siegelbrett gesammelt hast.'})
    +rufFenster()
    +(S.rang>=R_BOTSCHAFT?fenster('botschafter','Weinbotschafter',`<div class="kbild" style="background-image:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.7)),url(bilder/weinbotschafter.jpg);height:150px"><b>🎗️ Weinbotschafter ${WO[S.region]}</b></div>
      <div class="kv"><span>Jeden Januar</span><span>+${BOTSCHAFT_ANS} Ansehen</span></div>`,{buch:'ziel',i:`Seit dem Rang ${RAENGE[R_BOTSCHAFT].name} bist du Weinbotschafter ${WO[S.region]}. Für deine Reisen bekommst du jeden Januar ${BOTSCHAFT_ANS} Ansehen.`}):'')
    +fenster('urkunden','Deine Urkunden',urkWand(),{buch:'ziel',i:'Für jeden Aufstieg bekommst du eine Urkunde. Sie hängt hier an der Wand, die erste gibt es mit dem Aufstieg zum zweiten Rang. Darunter hängen die Schilder und Urkunden für deine Spenden im Rathaus.'});
}
function bueroWissen(){
  return fenster('anleitung','Spielanleitung','',{links:`Alles zum Nachschlagen in ${buchKap().length} kurzen Kapiteln, von der Bedienung bis zum Spielführer.`,kn:pk('buch','Aufschlagen',''),
      i:'Das Büro hat vier Bereiche, oben wählst du einen aus. <b>Erfolge:</b> dein Rang mit dem Platz in der Rangliste, Ehrungen und Urkunden. <b>Wissen:</b> Spielanleitung, Weinarchiv und Spielführer. <b>Familie:</b> Mein Weingut, Chronik und Bestenliste. <b>Einstellungen:</b> Ton, dein Spiel mit den Spielständen und deine Idee. Das kleine i erklärt jedes Fenster kurz, „Mehr im Buch“ schlägt das passende Kapitel auf.'})
    +kompFenster()
    +fuFenster();
}
function bueroEinst(){
  return fenster('ton','Ton',tonZeilen(),{i:'Musik „an“ spielt durchgehend, „kurz“ spielt beim Wechsel zwischen Weingut, Kellerei und Stadt ein paar Sekunden, „aus“ ist still. Feiern, Wettbewerbe und Pfändung laufen auch bei „kurz“ in voller Länge. Mit den Reglern stellst du Musik und Geräusche getrennt leiser oder lauter.'})
    +fenster('spiel','Dein Spiel',`<div class="kv"><span>Speicherplatz</span><span>Spielstand ${SLOT+1}</span></div><div class="kv"><span>Schwierigkeit</span><span>${DIFF[S.schwer].name} (${DIFF[S.schwer].kurz.toLowerCase()})</span></div>`
      // Seit 8.5.1: Knopf "Spiel laden" statt "Spielstände", die Erklärung steht sichtbar beim passenden Knopf.
      +`<div class="fzl">${fz('Spiel laden','Hier lädst du einen anderen oder älteren Spielstand oder sicherst ihn als Datei.','',pk('menue','Spiel laden','',{sec:1}))}${fz('Neues Spiel','Löscht diesen Spielstand und fängt von vorn an.','',pk('neuFrage','Neues Spiel','',{sec:1}))}</div>`,{buch:'bedienung',
      i:'Gespeichert wird von selbst nach jedem Monat.'})
    // Seit 11.0 (Idee A, Maik 19.11.2026): Ideen der Spieler gehen als Text über WhatsApp oder "Teilen" raus, ohne Nummer oder Adresse im Code.
    +fenster('idee','💡 Deine Idee','<div class="mut">Dir fehlt etwas im Spiel, oder etwas stört dich? Sag es uns.</div>',{buch:'buero',
      kn:[pk('idee','Ich gebe meine Idee weiter',''),pk('ausblick','Was geplant ist','',{sec:1})],
      i:'Schreib oder sprich deine Idee ins Textfeld, das Mikrofon deiner Tastatur schreibt mit. Danach schickst du sie über WhatsApp oder „Teilen“ an Maik. Das Spiel selbst verschickt nichts und kennt keine Nummer, den Empfänger wählst du aus deinen Kontakten. „Was geplant ist“ zeigt, woran schon gearbeitet wird.'})
    +`<div class="fussnote">Bilder, Musik und Geräusche sind mit KI erstellt (Musik mit Treblo, Geräusche mit ElevenLabs, elevenlabs.io).</div>`;
}
// Seit 14.2.4: Erziehungsform. Gefragt wird beim ersten Pflanzen in einen leeren Weinberg, nicht in den Lehrjahren (Entscheidung 19), ohne Wahl gilt die passende.
// Seit 14.5.3 (Annahme 11): Die Formwahl kommt in allen Spielstufen, in den Lehrjahren mit der empfohlenen Form als Vorauswahl.
const formFrage=id=>!(S.felder[id]||{}).reben&&formenFuer(id).length>1;
// Wer liest in diesem Weinberg mit dieser Form. Platzhalter, Wortlaut in Meilenstein 17.
// Seit 14.5.3 (Entscheidungen 40 und 42): für jede Sorte gleich, der Kordon nur mit dem Vollernter.
const formLese=(id,fm)=>{const F=FORMEN[fm]; return R().steil?'von Hand, an der Mosel fährt keine Maschine':F.masch===1?'jede Erntemaschine erlaubt':F.masch==='voll'?(vollDa()?'der Vollernter liest':'von Hand, bis der Vollernter kommt'):'nur von Hand'};
// Steckbrief einer Form für die Wahl und das Umstellen.
const formSteck=(id,fm)=>{const F=FORMEN[fm]; return `${Math.round(F.menge*100)} % Menge${F.schutz!=null?`, halber Verlust bei Spätfrost und Oktoberregen`:''}, ${F.qual} Punkte Qualität, ${epT(F.ep)} Punkte im Jahr, Rebschnitt ${eur(F.haErz)} je Hektar${F.ha!==F.haErz?` bis zum Rebstock, danach ${eur(F.ha)}`:''}, Lese ${formLese(id,fm)}`};
// Seit 14.7.4 (Bauplan 14.7, Annahmen 8 bis 16): Inhalt des Einsatzplans, je Weinberg mit Reben Rebschnitt und Düngen (der Chef-Weinberg), Laubschnitt
// ab dem Winzermeister und Ausdünnen ab dem Gutsherrn, je Chefsache oder Automatik. Ohne Erntehelfer und in den Lehrjahren ohne Wahl beim Chef-Weinberg,
// ohne die Stufe der Leute Chefsache ohne Wahl. Steht im Weinberg und als Sheet aus dem Fenster des Weingut-Managers. Platzhalter, Wortlaut in Meilenstein 17.
function einsatzInhalt(){
  const T=EINSATZ_TEXT, chip=(id,art,w,an)=>`<button class="chip ${an?'an':''}" data-a="planSetz" data-id="${id}" data-art="${art}" data-w="${w}">${T[w]}</button>`, wahl=(id,art,a)=>`<div class="chips">${chip(id,art,'chef',a==='chef')}${chip(id,art,'auto',a==='auto')}</div>`;
  return chefKandidaten().map(id=>{const sa=helferSchneidet(id)?'auto':'chef', frei_=helferKann(1)&&!chefStill();
    let z=`<div style="margin-top:8px"><b>${dot(id)}${esc(SORTEN[id].name)}</b></div><div class="kv"><span>${T.schnitt}</span><span>${!helferKann(1)?`${T.chef}. ${T.ohneLeute}`:chefStill()?`${T[sa]}. ${T.still}`:''}</span></div>`;
    if(frei_) z+=wahl(id,'schnitt',sa);
    if(chefRat()===id&&helferSchneidet(id)) z+=`<div class="mut">👴 ${CHEF_RAT_SATZ.replace('{sorte}',SORTEN[id].name)}</div>`;
    for(const [art,da,ab] of [['laub',frei('laub_hand'),T.abLaub],['ausd',ausdFrei(),T.abAusd]]) if(da){
      z+=`<div class="kv"><span>${T[art]}</span><span>${planAutoKann(art)?'':`${T.chef}, ${ab}`}</span></div>`; if(planAutoKann(art)) z+=wahl(id,art,planArt(id,art))}
    return z}).join('')||'<div class="fleer">Noch kein Weinberg mit Reben.</div>';
}
const einsatzSheet=()=>`<div class="einsatzSh"><h3>📋 Einsatzplan</h3><p class="mut">${EINSATZ_TEXT.kopf}</p>${einsatzInhalt()}<div class="btns"><button class="sec" data-a="close">Zurück</button></div></div>`;
const einsatzAuf=()=>$('#sheet').classList.contains('an')&&!!$('#sheet .einsatzSh');
// Seit 14.7.5 (Bauplan 14.7, Annahmen 14 bis 16): Chefsache für Keller, Einkauf und Einstellen. Ab dem Weingut-Manager der Block "Chefsache" in seinem Fenster
// (csInhalt, Muster wie der Einsatzplan), an der Arbeit nur die Info-Zeile (csZeile). Vorher sitzen die Schalter der Keller-Arbeiten an der Arbeit (csKnopf, csIst),
// Einkauf und Einstellen macht der Chef dann ohne Schalter (Annahme 15). Platzhalter, Wortlaut in Meilenstein 17.
function csVorwahl(){const T=CHEFSACHE_TEXT, v=sektVorwahl(), chip=(h,t)=>`<button class="chip ${v===h?'an':''}" data-a="sektWahl" data-h="${h}">${t.replace('{h}',h)}</button>`;
  return `<div class="mut" style="margin-top:4px">${T.vorwahl}</div><div class="chips">${chip(SEKT_REIFE,T.reif)}${chip(HEFE_LANG,T.hefe)}</div>`}
function csInhalt(){
  const T=CHEFSACHE_TEXT, E=EINSATZ_TEXT, chip=(k,w,an)=>`<button class="chip ${an?'an':''}" data-a="csSetz" data-id="${k}" data-w="${w}">${E[w]}</button>`;
  return CS_ARBEIT.filter(k=>k!=='sekt'||sektRang()).map(k=>{const ok=csKann(k), c=chefsache(k);
    const ab=CS_STUFE[k]?T.ab.replace('{wer}',leuteStName('lagerarb',CS_STUFE[k])):T.abStufe.replace('{n}',mgrAufgabe(k==='leute'?'helfer':k).stufe);
    return `<div class="kv"><span>${T[k]}</span><span>${ok?'':`${E.chef}, ${ab}`}</span></div>`+(ok?`<div class="chips">${chip(k,'chef',c)}${chip(k,'auto',!c)}</div>`:'')+(k==='sekt'&&ok&&!c?csVorwahl():'')}).join('');
}
const csZeile=k=>csBeiMgr()&&csKann(k)?(chefsache(k)?CHEFSACHE_ZEILE.chef:CHEFSACHE_ZEILE[k].replace('{wer}','deine '+leuteStName('lagerarb',CS_STUFE[k]||1))):'';
const csChef=k=>csBeiMgr()&&csKann(k)&&chefsache(k)?CHEFSACHE_ZEILE.chef:'';
const csIst=k=>!csBeiMgr()&&csKann(k)&&chefsache(k)?CHEFSACHE_TEXT.ist.replace('{arbeit}',CHEFSACHE_TEXT[k]):'';
function csKnopf(k){if(csBeiMgr()||!CS_STUFE[k]||!csKann(k)) return ''; const T=CHEFSACHE_TEXT, c=chefsache(k);
  return `<button class="klein" data-a="csSetz" data-id="${k}" data-w="${c?'auto':'chef'}">${T.knopf.replace('{arbeit}',T.kurz[k]||T[k]).replace('{stellung}',c?EINSATZ_TEXT.auto:T.selbst)}</button>`}
// Weinberg (seit 7.4 auf dem Fenster-Baustein): je Sorte ein Fenster (seit 4.4 oben), dann Düngung und Übersicht, darunter zugeklappt der Steckbrief des Gebiets.
// Sorten, die der Rang noch sperrt, sind seit 10.6 ausgeblendet (bis 10.5 zugeklappt mit Schloss unten). Lese-Hinweise und rote Warnungen bleiben sichtbar, die Erklärungen stehen im i.
function vBerg(){
  const m=S.monat, ges=S.ha*HA_REBEN, bep=rebenGesamt(), frei=ges-bep, ant=ges?bep/ges*100:0;
  const phase=PHASE, fp=frostPlus(), WM=`${MGR_BEREICHE.weingut.sym} Dein ${MGR_BEREICHE.weingut.name}`, wm=`Dein ${MGR_BEREICHE.weingut.name}`;
  const mr=aufgabeAktiv('reben'), mh=aufgabeAktiv('helfer'), rot=t=>`<div class="rot" style="font-size:14px;margin-top:4px">${t}</div>`;
  const feldI=`Gepflanzt und gerodet wird nur von Januar bis März, gelesen ab August. Je länger die Trauben hängen, desto mehr Öchsle und desto höher die Weinstufe. Aber Regen, Kälteeinbruch und fehlender Frost können alles kosten. ${S.rollen?'Jede Sorte hat ihre Rolle: Die Menge-Sorte trägt viel, die Sekt-Sorte gibt den besten Sekt, die Spitzen-Sorte die besten Weine.':'Die Sterne zeigen, wie gut die Sorte in dein Gebiet passt.'}${mr?` ${wm} pflanzt von Januar bis März nach, was über den Winter eingegangen ist.`:''}`;
  let h='', zu='';
  for(const id of weinberge()){
    const f=S.felder[id], so=SORTEN[id], titel=dot(id)+so.name;
    if(!f.reben&&!sorteFrei(id)){zu+=fenster('feld_'+id,titel,'',{zu:`ab dem Rang ${RAENGE[sorteAb(id)].name}`,i:`${sorteSchild(id)}. ${feldI}`}); continue}
    let z=`<div class="kv"><span>Reben</span><span>${rbn(f.reben)}</span></div><div class="kv"><span>${rolleVon(id)?'Rolle':'Eignung'}</span><span>${rolleVon(id)?rolleVon(id).name:eigText(eignung(id))}</span></div>`;
    // Seit 13.4.9: Lage der Sorte. Seit dem Nachtrag zu 14.5 (jede Lage eine Sorte) für jede Sorte ihre eine Lage mit dem freien Platz dort, der Sekt-Abzug ist weg.
    // Seit 14.4.4: Die Spitzenlage mit ihrer Fläche und ihrem eigenen Boden. Platzhalter, Wortlaut in Meilenstein 17.
    if(istSL(id)) z+=`<div class="kv"><span>Lage</span><span>${LAGEN.sued.sym} ${SL_NAME}, ${SPITZE_HA} Hektar Südhang</span></div><div class="kv"><span>Boden</span><span>${BODEN_STUFEN[wbBoden(id)]}, ${epT(wbBodenP(id))} von ${BODEN_MAX} Punkten</span></div>`;
    else z+=`<div class="kv"><span>Lage</span><span>${LAGEN[lageVon(id)].sym} nur ${LAGEN[lageVon(id)].kurz}, Platz für ${rbn(platzFuer(id))} Reben</span></div>`;
    // Seit dem Nachtrag zu 14.5.4: das Klima des Weinbergs in Worten (klimaText), ohne Zahlen. Platzhalter, Wortlaut in Meilenstein 17.
    if(f.reben) z+=`<div class="kv"><span>Klima</span><span>${klimaText(id)}</span></div>`;
    // Seit 13.2.6: Pflegestufe mit Zähler, Deckel und Rebschnitt. Wortlaut seit 13.8.
    // Seit 14.2.2: Entwicklungspunkte mit der nächsten Schwelle und der Wirkung der Stufe. Platzhalter, Wortlaut in Meilenstein 17.
    if(f.reben){const st=f.pflSt||0, SW=epSchwelle(id); z+=`<div class="kv"><span>Pflege</span><span>${st>=PFLEGE_STUFEN.length-1?`${PFLEGE_STUFEN[st]}, höher geht es nicht`:`${PFLEGE_STUFEN[st]}, ab ${epT(SW[st+1])} Punkten ${PFLEGE_STUFEN[st+1]}`}</span></div>
      <div class="kv"><span>Entwicklungspunkte</span><span>${epT(f.ep||0)} von ${EP_MAX}</span></div>
      <div class="kv"><span>Wirkung der Stufe</span><span>${Math.round(STUFE_MENGE[st]*100)}\u00a0% Menge</span></div>
      <div class="kv"><span>${EINSATZ_TEXT.schnitt}</span><span>${helferSchneidet(id)?`${EINSATZ_TEXT.auto}, ${leuteStName('helfer',leuteSt('helfer'))}`:`${EINSATZ_TEXT.chef}, du selbst`}, +${epT(epJahrSoll(id))} Punkte im guten Jahr</span></div>
      <div class="kv"><span>Boden</span><span class="${f.boden<80?'rot':''}">${f.boden} %, Jahresschnitt bisher ${bodenSchnitt(id)} %</span></div><div class="bar"><i style="width:${f.boden}%"></i></div>`}
    // Seit 14.5.2 (Annahmen 5 und 8): Qualität des Weinbergs mit ihren Bausteinen, in allen Spielstufen. Seit dem Nachtrag zu 14.5.2 mit "von 100" und,
    // sobald das Ausdünnen frei ist, mit dem Baustein Ausdünnen. Platzhalter, Wortlaut in Meilenstein 17.
    if(f.reben){const Q=qualTeile(id); z+=`<div class="kv"><span>Qualität</span><span>${Q.q} von 100 Punkten: Pflege ${Math.round(Q.pflege)}, Boden ${Math.round(Q.boden)}, Form ${Q.form}, Laubschnitt ${Q.laub}${ausdFrei()?`, Ausdünnen ${Q.ausd}`:''}</span></div>`}
    // Seit 14.2.4: Erziehungsform mit Wirkung und Lese, seit 14.5.3 in allen Spielstufen. Platzhalter, Wortlaut in Meilenstein 17.
    if(f.reben){z+=`<div class="kv"><span>Erziehungsform</span><span>${FORMEN[formVon(id)].name}, ${Math.round(formMenge(id)*100)} % Menge, ${FORMEN[formVon(id)].qual} Punkte Qualität</span></div>
      <div class="kv"><span>Lese</span><span>${formLese(id,formVon(id))}</span></div>`}
    if(f.reben) z+=`
      <div class="kv"><span>Deckel</span><span>${deckel(id)}° Öchsle</span></div>
      <div class="kv"><span>Rebschnitt ${S.jahr}</span><span${f.schnitt!==S.jahr&&m>SCHNITT_BIS?' class="rot"':''}>${f.schnitt===S.jahr?'✂️ geschnitten':m<=SCHNITT_BIS?'offen bis Ende April':`nicht geschnitten, verwildert um ${VERWILDERN[Math.min(VERWILDERN.length,(f.wild||0)+1)-1]} Punkte`}</span></div>`;
    if(!f.reben) z+=`<div class="kv"><span>Preis je Rebe</span><span>${eur2(rebenPreis(id)/STOCK_F)}</span></div><div class="kv"><span>Ertrag je Rebe</span><span>rund ${String(Math.round(so.ertrag*(R().ertragF||1)/STOCK_F*10)/10).replace('.',',')} l</span></div><div class="fleer" style="margin-top:6px">Nicht angebaut.</div>`;
    else if(f.gelesen) z+=`<div class="mut">✂️ Für dieses Jahr gelesen.</div>${S.lots.some(l=>l.status==='trauben'&&l.sorte===id)?rot('Die Trauben müssen diesen Monat im Keller ins Fass.'):''}`;
    else if(f.teil&&f.menge<=0) z+=`<div class="mut">Ein Teil ist gelesen, der Rest ist verloren.</div>`;
    else if(m<5) z+=`<div class="kv"><span>Stand</span><span>${phase[m]}</span></div>`;
    else if(m===5) z+=`<div class="kv"><span>Fruchtansatz</span><span>rund ${num(f.menge)} l erwartet</span></div>`;
    else if(f.menge<=0) z+=`<div class="mut">Keine Trauben mehr am Stock.</div>`;
    else{
      z+=`<div class="kv"><span>Öchsle</span><span>${f.oe}°${f.plus>0?` (+${f.plus}° in diesem Monat)`:''}</span></div><div class="bar g"><i style="width:${f.oe/1.5}%"></i></div>
      <div class="kv"><span>Menge am Stock</span><span>${num(f.menge)} l</span></div>
      <div class="kv"><span>Reif</span><span>${f.reif} %</span></div><div class="bar"><i style="width:${f.reif}%"></i></div>
      <div class="kv"><span>davon überreif</span><span>${f.ueber} %</span></div><div class="bar w"><i style="width:${f.ueber}%"></i></div>
      <div class="kv"><span>Edelfäulnis</span><span>${f.edel?'ja':!wagnisFeld(id)?'nie bei dieser Sorte':'nur über das Wagnis im Herbst'}</span></div>
      ${f.gefroren?'<div class="kv"><span>Zustand</span><span>❄️ gefroren</span></div>':''}
      ${f.teil?'<div class="mut">Ein Teil ist schon gelesen, der Rest hängt noch.</div>':''}
      ${m>=7?`<div class="hilfe">${leseHilfe(f)}${wagnisHinweis(id)}</div>`:''}`;
    }
    const sektOhne=sektSorte(id)&&!S.sektkeller, kannLesen=m>=7&&f.menge>0&&!f.gelesen&&(m<11||f.gefroren||f.edel)&&!sektOhne, pflanz=m<=2&&sorteFrei(id)&&!sektOhne&&!(istSL(id)&&slPlatz()<10), schnitt=schnittOffen(id), haengt=f.reben&&f.menge>0&&!f.gelesen&&m>5&&m<7;
    h+=fenster('feld_'+id,titel,z,{buch:m>=7?'lese':'berg',
      hin:[mr&&m<=2&&S.verlust&&S.verlust[id]>0&&`${WM} pflanzt beim Weiterblättern nach.`,helferKann(3)&&pflanzPlan(id)>=10&&`🌱 Deine Erntehelfer pflanzen bis März ${rbn(pflanzPlan(id))} Reben nach.${pflanzPlan(id)<pflanzSoll(id)&&!pflanzMitA(id)?' Den übrigen Platz bekommt dein Auftrag.':''}`,
        helferSchneidet(id)&&schnitt&&`✂️ Deine ${leuteStName('helfer',leuteSt('helfer'))} schneiden beim Weiterblättern, sobald das Geld reicht.`,chefRat()===id&&helferSchneidet(id)&&`👴 ${CHEF_RAT_SATZ.replace('{sorte}',SORTEN[id].name)}`,
        // Seit 14.7.4 (Annahme 16): Schreibt der Weingut-Manager den Plan, steht hier nur die Info-Zeile, die Automatik von Laubschnitt und Ausdünnen als Hinweis.
        f.reben&&planBeiMgr()&&helferKann(1)&&!chefStill()&&EINSATZ_TEXT.zeile.replace('{arbeit}',EINSATZ_TEXT.schnitt).replace('{stellung}',EINSATZ_TEXT[helferSchneidet(id)?'auto':'chef']),
        laubHandOffen(id)&&autoLaub(id)&&EINSATZ_TEXT.autoLaub.replace('{wer}',leuteStName('helfer',2)),ausdOffen(id)&&autoAusd(id)&&EINSATZ_TEXT.autoAusd.replace('{wer}',leuteStName('helfer',3)),(()=>{const ww=wagnisWarnung(); return ww&&ww.ids.includes(id)&&`${WM} warnt: ${Math.round(ww.anteil*100)} % deiner Ernte hängen im Wagnis.`})()],
      // Seit 13.4.6: Am Lese-Knopf steht die Chance des Wagnisses in Worten.
      links:kannLesen&&wagnisChance(id)!=null&&chanceZeige(wagnisChance(id))?`🎲 Warten: Chance ${chanceZeige(wagnisChance(id))}${chanceRat(wagnisChance(id))?`, der alte Winzer würde ${chanceRat(wagnisChance(id))}`:''}`:sektOhne?'Die Sekt-Sorte macht nur Sekt, erst den Sektkeller kaufen.':pflanz&&platzFuer(id)<10?(istSL(id)?'Auf deinem Land ist kein Platz mehr frei.':LAGE_SATZ.voll.replace('{lage}',LAGE_SATZ.auf[lageVon(id)])):laubHandOffen(id)?`✂️ Sommerschnitt von Hand: ${eur(laubHandKosten(id))}`:ausdOffen(id)?AUSD_LINKS.replace('{kosten}',eur(ausdKosten(id))).replace('{m}',`${Math.round(AUSD_MENGE*100)} %`).replace('{qp}',AUSD_QP):haengt?'Lese ab August.':schnitt?`✂️ Rebschnitt bis Ende April: ${eur(schnittKosten(id))}`:'',
      kn:[kannLesen&&`<button class="klein" data-a="lesen" data-id="${id}">Lesen</button>`,...wagnisKnoepfe(id),schnitt&&!helferSchneidet(id)&&`<button class="klein" data-a="schneiden" data-id="${id}" ${S.geld<schnittKosten(id)?'disabled':''}>Schneiden</button>`,laubHandOffen(id)&&`<button class="klein" data-a="sommerHand" data-id="${id}" ${S.geld<laubHandKosten(id)?'disabled':''}>Sommerschnitt</button>`,ausdOffen(id)&&`<button class="klein" data-a="ausduennen" data-id="${id}" ${S.geld<ausdKosten(id)?'disabled':''}>Ausdünnen</button>`,f.reben&&!istSL(id)&&m<=SCHNITT_BIS&&formenFuer(id).length>1&&`<button class="klein" data-a="formAendern" data-id="${id}">Form ändern</button>`,helferKann(1)&&f.reben&&!chefStill()&&!planBeiMgr()&&`<button class="klein" data-a="schneider" data-id="${id}">${helferSchneidet(id)?'Selbst schneiden und düngen':'Schnitt und Düngen abgeben'}</button>`,
        ...['laub','ausd'].map(art=>f.reben&&!planBeiMgr()&&planAutoKann(art)&&(art==='laub'?frei('laub_hand'):ausdFrei())&&`<button class="klein" data-a="planSetz" data-id="${id}" data-art="${art}" data-w="${planArt(id,art)==='auto'?'chef':'auto'}">${EINSATZ_TEXT[art]}: ${planArt(id,art)==='auto'?'selbst machen':EINSATZ_TEXT.auto}</button>`),pflanz&&(helferKann(3)?`<button class="klein" data-a="${formFrage(id)?'formWahl':'pflanzAuftrag'}" data-id="${id}" data-weiter="pflanzAuftrag">Auftrag</button>`:`<button class="klein" data-a="${formFrage(id)?'formWahl':'pflanzen'}" data-id="${id}" data-weiter="pflanzen" ${platzFuer(id)<10?'disabled':''}>Pflanzen</button>`),pflanz&&f.reben&&!istSL(id)&&`<button class="klein wag" data-a="roden" data-id="${id}">Roden</button>`].filter(Boolean),i:feldI});
  }
  // Seit 14.7.4 (Bauplan 14.7, Annahmen 8 bis 16): das Fenster Einsatzplan, sobald der Weingut-Manager den Plan schreibt.
  if(planBeiMgr()) h+=fenster('einsatz','📋 Einsatzplan',einsatzInhalt(),{i:EINSATZ_TEXT.kopf});
  // Seit 14.2.5: die drei Lagen einzeln mit Stufe, Punkten und dem, was ein gutes Bodenjahr bringt. Platzhalter, Wortlaut in Meilenstein 17.
  // Seit 14.7.4 (Annahme 10): Bodenstand, Düngen und Zuwachs je Weinberg, je Weinberg ein Knopf, der Chef kann jeden Weinberg düngen (Annahme 23).
  const BT=lagenBelegung().T, wbLage=lg=>R().sorten.find(id=>lageVon(id)===lg), zdVon=id=>zuwachsVon(id&&helferDuengt(id)?'helfer':'chef',1);
  const DW=weinberge().filter(id=>S.felder[id].reben>0), BSW=DW.map(bodenSchnitt), vGut=verlustSpanne(BSW.length?Math.max(...BSW):BODEN_START), vMag=verlustSpanne(BSW.length?Math.min(...BSW):BODEN_START);
  h+=fenster('duengung','Düngung',`${LAGE_REIHE.filter(lg=>hangHa(lg)>0||lageBodenP(lg)>0).map(lg=>{const st=lageBoden(lg), P=lageBodenP(lg); return `<div class="kv"><span>${LAGEN[lg].sym} ${LAGEN[lg].kurz}</span><span>${BODEN_STUFEN[st]}${st<BODEN_STUFEN.length-1?`, ab ${BODEN_SCHWELLE[st+1]} Punkten ${BODEN_STUFEN[st+1]}`:''}</span></div>
    <div class="mut">${epT(P)} von ${BODEN_MAX} Punkten, ${BT[lg]>0?`+${epT(BODEN_PUNKTE[lg]*zdVon(wbLage(lg)))} im guten Bodenjahr`:'ohne Reben, sammelt nichts'}</div>`}).join('')}
    <div class="mut">Ein Jahresschnitt ab ${BODEN_GUT} % zählt als gutes Bodenjahr. Punkte sammelt nur bepflanztes Land, neu bepflanztes Land verdünnt sie.</div>
    ${DW.map(id=>{const f=S.felder[id]; return `<div class="kv" style="margin-top:6px"><span>${dot(id)}${SORTEN[id].name}</span><span class="${f.boden<80?'rot':''}">${f.boden} %, ${bodenText(f.boden)}</span></div><div class="bar"><i style="width:${f.boden}%"></i></div>
    <div class="mut"><span class="${bodenSchnitt(id)<BODEN_GUT?'rot':''}">Jahresschnitt bisher ${bodenSchnitt(id)} %</span>, gedüngt ${f.duengN||0} von ${DUENG_MAX} Mal, ${helferDuengt(id)?`${EINSATZ_TEXT.auto}: ${leuteStName('helfer',leuteSt('helfer'))}, ${Math.round(zdVon(id)*100)}&nbsp;% Zuwachs`:`${EINSATZ_TEXT.chef}: du selbst, voller Zuwachs`}</div>`}).join('')}
    ${S.nass!=null?rot(`🌧️ Der Regen im ${MON[S.nass]} hat den Boden ausgewaschen.`):''}
    <div class="mut">Zum Jahreswechsel gehen voraussichtlich ${vGut[1]+fp} bis ${vMag[2]+fp} % der Reben ein, je nach Boden des Weinbergs${fp?(spLohn(2)?' (mit Frost, die Frostfeuer der Feuerwehr retten die Hälfte)':' (mit Frost)'):''}.</div>`,{
    hin:[DW.some(helferDuengt)&&'🧑‍🌾 Deine Erntehelfer düngen die Weinberge auf Automatik beim Weiterblättern, wenn der Boden mager wird.',bonusMasch('duenger')&&`🚜 Mit dem Düngerstreuer: ${STREU_PLUS} statt ${DUENG_PLUS} Punkte Boden und ${Math.round(STREU_RABATT*100)} % billiger.`],
    kn:DW.map(id=>pk('duengen',`Düngen: ${SORTEN[id].name}`,eur(duengKosten(id)),{id,aus:!duengOffen(id),arm:S.geld<duengKosten(id)})),
    i:`Jeder Weinberg hat seinen eigenen Boden. Er verliert jeden Monat ${BODEN_MONAT} Punkte, in einem Regenmonat ${BODEN_REGEN}, und mit jeder Lese 4. Einmal Düngen bringt ${DUENG_PLUS}, mit dem Düngerstreuer ${STREU_PLUS} und ${Math.round(STREU_RABATT*100)} % billiger, höchstens ${DUENG_MAX} Mal im Jahr je Weinberg, bezahlt nach seinen Hektar. Ein guter Boden bringt mehr Trauben, bessere Weine und weniger tote Reben: Je besser der Bodenschnitt des Jahres, desto weniger Reben gehen zum Jahreswechsel ein. Deinen Chef-Weinberg düngst du selbst, die Weinberge auf Automatik düngen deine Erntehelfer, sobald der Boden auf ${HELFER_DUENG} % fällt, im August schon unter 90 %.`});
  h+=fenster('uebersicht','Übersicht',`<div class="kv"><span>Bepflanzt</span><span>${rbn(bep)} von ${rbn(ges)} Reben</span></div><div class="bar"><i style="width:${ant}%"></i></div>
    <div class="kv"><span>Fläche</span><span>${S.ha} Hektar, ${Math.round(ant)} % bepflanzt</span></div>
    ${LAGE_REIHE.filter(lg=>hangHa(lg)>0).map(lg=>`<div class="kv"><span>${LAGEN[lg].sym} ${LAGEN[lg].kurz}</span><span>${String(hangHa(lg)).replace('.',',')}\u00a0ha${lg==='sued'?`${S.spitze?`, davon ${SPITZE_HA} Spitzenlage`:''}, Spitzen-Sorte ${String(Math.round((handReben()-slFl())/HA_REBEN*10)/10).replace('.',',')}\u00a0ha`:''}</span></div>`).join('')}
    <div class="kv"><span>Platz für</span><span>${rbn(frei)} Reben</span></div>
    ${m<=2?`<div class="mut">🌱 Rebenmarkt: ${rebenMarktText()}.</div>`:''}
    ${weinberge().filter(id=>S.felder[id].reben).map(id=>`<div class="kv"><span>${dot(id)}${SORTEN[id].name}</span><span>${rbn(S.felder[id].reben)} Reben</span></div>`).join('')}
    <div class="kv"><span>Wetter jetzt</span><span>${wetterText()}</span></div>
    <div class="kv"><span>Vorhersage ${MON[(m+1)%12]}</span><span>${progText()}</span></div>
    <div class="kv"><span>Deine Leute reichen für</span><span class="${leuteFehlen().helfer?'rot':''}">${rbn(helferReben())} Reben</span></div>
    <div class="kv"><span>Ernteleistung</span><span class="${leseFaktor()<1?'rot':''}">${rbn(leistung())} Reben</span></div>
    ${leseFaktor()<1?rot(`Bei der Lese bleiben ${100-Math.round(leseFaktor()*100)} % hängen.`):''}`,{
    hin:[mh&&`${WM} stellt fehlende Erntehelfer beim Weiterblättern ein.`],
    i:`Für den Aufstieg zählt nur die bepflanzte Fläche. ${helferRegel()}, fehlt einer, geht es nicht in den nächsten Monat. Die Ernteleistung zählt bei der Lese: Reicht sie nicht für alle Reben, bleibt ein Teil der Trauben hängen. Leute stellst du im Arbeitsamt ein, Maschinen kaufst du unter „Maschinen“.`});
  const G=steckbrief(S.region,{fen:1}), auf=FI_AUF.has('gebiet+');
  h+=fenster('gebiet','Dein Gebiet',`<div class="gkopf"><img class="gs" src="bilder/gebiet-${S.region}.webp" alt=""><div class="kv"><span>${G.name}</span><span>${G.art}</span></div></div><div class="sb fklapp"${auf?'':' hidden'}>${G.rumpf}</div>`,{buch:'gebiete',
    kn:`<button class="klein" data-a="klapp" data-id="gebiet" data-auf="Zuklappen" data-zu="Steckbrief zeigen">${auf?'Zuklappen':'Steckbrief zeigen'}</button>`,
    i:'Jedes Gebiet hat eine eigene Stärke. In warmen Gebieten gibt es öfter edelsüße Weine, in kühlen öfter Eiswein, in der Mitte mehr Medaillen oder mehr Geld. Der Steckbrief zeigt, welche Sorten hier passen, was sich lohnt und wie du am besten vorgehst.'});
  return h+zu;
}
// Startansicht des Kellers (seit 7.4 das Muster für den Fenster-Baustein): Keltern und Abfüllen oben, dann Sekt, darunter der Vorrat als kleines Fenster (Maik 17.11.2026).
// Solange Sekt gesperrt ist, steht sein Fenster zugeklappt ganz unten.
function vKellerStart(){
  const tr=S.lots.filter(l=>l.status==='trauben'), fa=S.lots.filter(l=>l.status==='fass'), bel=fassBelegt(), frei=Math.max(0,S.fassraum-bel);
  const KM=MGR_BEREICHE.weingut.name, mon=n=>n===1?'Monat':'Monaten', mk=aufgabeAktiv('fass'), mf=aufgabeAktiv('flaschen');
  let h=fenster('keltern','Wein keltern',tr.map(l=>fz(dot(l.sorte)+SORTEN[l.sorte].name,
      `${num(l.liter)} l Trauben · ${l.oe}° Öchsle · ${LESE[l.leseart]}${mani(l)?' · 🤫 '+maniText(l):''}`,
      `<span class="rot">Muss diesen Monat ins Fass, sonst verdirbt alles.${l.liter>frei?` Frei sind nur ${num(frei)} l Fassraum.`:''}</span>`,
      `<button class="klein" data-a="keltern" data-id="${l.id}">Keltern</button>`)),{
    leer:'Keine Trauben im Kelterhaus.',
    hin:[mk&&`🌿 Dein ${KM} kauft fehlenden Fassraum dazu.`,csBeiMgr()?csZeile('keltern'):kellerMacht('keltern')?'🛢️ Deine Kellerleute keltern beim Weiterblättern, sobald genug Fassraum frei ist.':csIst('keltern')],
    kn:csKnopf('keltern')||[],   // seit 14.7.5
    i:`Frisch gelesene Trauben müssen im Monat der Lese ins Fass. Sie brauchen freien Fassraum, was nicht hineinpasst, geht verloren.${mk?` Dein ${KM} kauft fehlenden Fassraum dazu.`:''}${kellerMacht('keltern')?' Deine Kellerleute keltern von selbst, sobald genug Fassraum frei ist. Von Hand keltern kannst du trotzdem jederzeit.':''}`});
  h+=fenster('abfuellen','Wein abfüllen',fa.map(l=>{const rest=8-l.fassMonate; return fz(dot(l.sorte)+lotName(l),
      `${num(l.liter)} l · ${l.oe}° Öchsle · seit ${l.fassMonate} ${mon(l.fassMonate)} im Fass`,
      `${l.stufe?'':'Noch nicht angemeldet. '}<span class="${l.fassMonate>=5?'rot':''}">Verdirbt in ${rest} ${mon(rest)}.</span>${l.stufe&&abfFl(l)>l.liter?` Mit der Abfüllanlage ${num(abfFl(l))} Flaschen.`:''}${l.stufe&&S.flaschen<abfFl(l)?` <span class="rot">Es fehlen ${num(abfFl(l)-S.flaschen)} leere Flaschen.</span>`:''}`,
      l.stufe?`<button class="klein" data-a="abfuellen" data-id="${l.id}">Abfüllen</button>`:`<button class="klein" data-a="anmelden" data-id="${l.id}">Anmelden</button>`)}),{
    leer:'Alle Fässer sind leer.', kn:csKnopf('abfuellen')||[],   // seit 14.7.5
    hin:[mf&&`🍷 Dein ${KM} kauft fehlende Flaschen dazu.`,csBeiMgr()?csZeile('abfuellen'):kellerMacht('abfuellen')?'🍾 Deine Kellerleute füllen angemeldete Weine beim Weiterblättern ab, sobald genug leere Flaschen da sind.':csIst('abfuellen'),bonusMasch('abfuell')&&`🍾 Mit der Abfüllanlage kommen ${Math.round(abfPlus()*100)} % mehr Flaschen aus jedem Fass.`],
    i:`Der Wein bleibt mindestens einen Monat im Fass und höchstens sieben, danach verdirbt er. Abfüllen geht erst nach der Anmeldung im Rathaus. Abgefüllt wird immer das ganze Fass, ein Liter je Flasche. Mit der Abfüllanlage geht nichts daneben, dann kommen ${Math.round(ABF_PLUS*100)} % mehr Flaschen heraus, dafür brauchst du auch so viele leere.${mf?` Dein ${KM} kauft die Flaschen für angemeldete Fässer, anmelden musst du selbst.`:''}${kellerMacht('abfuellen')?' Deine Kellerleute füllen angemeldete Fässer von selbst ab.':''}`});
  const sektI=`Die ${ROLLEN.sekt.name} macht nur Sekt. Nach der Lese legst du die Trauben noch im selben Monat in den Sektkeller, ohne Grundwein, und ist die Hefezeit um, füllst du ihn ab. Ab dem Kellermeister macht das dein Kellermeister. Er reift ${SEKT_REIFE} Monate, mit ${HEFE_LANG} Monaten auf der Hefe kostet er ${HEFE_LANG_P} % mehr und bekommt bei der Jury ${HEFE_LANG_P} Punkte mehr. Das Hefelager wählst du bei der Lese.`;
  const vorrat=fenster('vorrat','Vorrat',`<div class="kv"><span>Fassraum</span><span>${num(bel)} von ${num(S.fassraum)} l</span></div><div class="kv"><span>Leere Flaschen (1 l)</span><span>${num(S.flaschen)}</span></div>`,
    {buch:'lager',i:'Fassraum und leere Flaschen kaufst du im Lager, beides braucht Kellerleute. Fassraum am besten vor der Lese kaufen, Flaschen vor dem Abfüllen.'});
  // Seit 12.1 (Maik 20.11.2026): eine Karte Sektkeller. Vor dem Kauf nur der Kaufknopf, danach die Weine für Sekt und, sobald der Rang reicht, der Ausbau-Knopf für die Anlage.
  if(!sektRang()) return h||vorrat?h+vorrat:einKarte('keller','Noch keine Trauben','Nach der Lese kelterst du hier deine Trauben, später füllst du den Wein ab. Bis zur ersten Lese ab August ist es hier still.');
  if(!S.sektkeller) return h+fenster('sekt','Sektkeller','',{
    links:'Ohne Sektkeller gibt es keinen Sekt.',
    kn:pk('sektKeller','Kaufen',eur(SEKTKELLER_PREIS),{klein:'einmal',arm:S.geld<SEKTKELLER_PREIS}),
    i:`Im Sektkeller gärt dein Wein ein zweites Mal, diesmal in der Flasche. Du kaufst ihn einmal für ${eur(SEKTKELLER_PREIS)}, danach machst du hier Sekt. ${sektI} Sektflasche, Korken und Agraffe kosten ${eur2(sektKosten())} je Flasche.`})+vorrat;
  const an=!!S.sektAnlage, ak=!an&&fuR65Zeit();   // 13.5.8: frei ist hier der freie Fassraum, deshalb über fuR65Zeit (Fehler seit 13.5.1)
  // Seit 13.5.8: Sekt-Trauben in den Sektkeller legen und fertigen Sekt abfüllen, von Hand bis Lagerarbeiter Stufe 3.
  const l3=kellerMacht('sekt'), sk=sektKosten();   // seit 14.7.5 nur auf Automatik
  h+=fenster('sekt','Sektkeller',[...sektTrauben().map(l=>fz(dot(l.sorte)+lotName(l),`${num(l.liter)} Flaschen · frisch gelesen · ${l.hefe||SEKT_REIFE} Monate auf der Hefe gewählt`,
      l3?'Deine Kellerleute legen ihn beim Weiterblättern in den Sektkeller.':`<span class="rot">Muss diesen Monat in den Sektkeller, sonst verdirbt alles.</span> Sektflasche, Korken und Agraffe kosten ${eur(Math.round(l.liter*sk))}.`,
      `<button class="klein" data-a="sektUmlagern" data-id="${l.id}">In den Sektkeller</button>`)),
    ...sektAufHefe().map(l=>{const n=lager(l).min-l.flMonate, fe=n<=0; return fz(dot(l.sorte)+lotName(l),`${num(l.liter)} Flaschen · Qualität ${l.qp}`,
      fe?(l3?'Die Hefezeit ist um, deine Kellerleute füllen ihn beim Weiterblättern ab.':'Die Hefezeit ist um, jetzt abfüllen. Erst danach kannst du ihn verkaufen.'):`Noch ${n} ${n===1?'Monat':'Monate'} auf der Hefe.${l3&&n===1?' Deine Kellerleute füllen ihn beim Weiterblättern ab.':''}`,
      ...(fe?[`<button class="klein" data-a="sektAbfuellen" data-id="${l.id}">Abfüllen</button>`]:[]))})],{
    leer:'Gerade liegt kein Sekt auf der Hefe. Neuer Sekt kommt mit der Lese der Sekt-Sorte.',
    hin:[csBeiMgr()?csZeile('sekt'):l3?'🥂 Deine Kellerleute legen den Sekt in den Sektkeller und füllen ihn ab, wenn die Hefezeit um ist.':csIst('sekt'),an&&`🍾 Mit der ${SEKT_ANLAGE_NAME} kostet jede Flasche nur ${eur2(sektKosten())}.`],
    stand:sektAnsText()+(!csBeiMgr()&&l3?csVorwahl():''),   // seit 14.7.5: die Vorwahl der Hefezeit, bis der Weingut-Manager kommt
    links:ak?`Ausbau: ${SEKT_ANLAGE_NAME}, jede Flasche kostet dann die Hälfte.`:'',
    kn:[ak&&pk('sektAnlage','Ausbauen',eur(SEKT_ANLAGE_PREIS),{klein:'Anlage',arm:S.geld<SEKT_ANLAGE_PREIS}),csKnopf('sekt')].filter(Boolean),
    i:`${sektI} Sektflasche, Korken und Agraffe kosten ${eur2(sektKosten())} je Flasche${an?`, dank der ${SEKT_ANLAGE_NAME} nur die Hälfte`:ak?`. Mit der ${SEKT_ANLAGE_NAME} wird nicht mehr von Hand degorgiert und verkorkt, dann kostet jede Flasche die Hälfte`:''}.`});
  return h+vorrat;
}
// Lager (seit 7.4 auf dem Fenster-Baustein): Fässer, Flaschen, Kellerausbau. Der Zustand steht als Zeilen im Fenster, die Erklärungen im i.
// Was der Kellermeister von selbst kauft, steht als kurzer Hinweis im Fenster, ob er dafür Lagerarbeiter einstellt, im i.
function vLager(){
  const bel=fassBelegt(), KM=MGR_BEREICHE.weingut.name, la=aufgabeAktiv('lager'), mk=aufgabeAktiv('fass'), mf=aufgabeAktiv('flaschen');
  const kf=fassKap()-S.fassraum, kl=flKap()-S.flaschen;
  const leute=la?' Fehlen dafür Kellerleute, stellt er sie ein.':' Fehlen dafür Kellerleute, kauft er nichts.';
  if(einZu('faesser')&&einZu('flaschen')&&!S.keller&&!kellerFrei(0)) return einKarte('lager','Noch genug Platz',`Hier kaufst du Fässer und Flaschen. Noch reichen ${num(S.fassraum)} l Fassraum und ${num(S.flaschen)} leere Flaschen, vor der Lese schaust du wieder rein.`);
  return fenster('faesser','Fässer',`<div class="kv"><span>Fassraum belegt</span><span>${num(bel)} von ${num(S.fassraum)} l</span></div><div class="bar w"><i style="width:${S.fassraum?bel/S.fassraum*100:0}%"></i></div>
    <div class="kv"><span>Betreut (Kellerleute: ${S.lagerarb})</span><span>bis ${num(fassKap())} l</span></div>`,{
    hin:[mk&&`🌿 Dein ${KM} kauft fehlenden Fassraum beim Keltern dazu.`,csChef('fass')],
    links:kf<500?'Für mehr Fassraum brauchst du mehr Kellerleute.':`Möglich sind noch ${num(kf)} l.`,
    kn:pk('kaufFass','Kaufen',eur2(fassPreis()),{klein:'je Liter',arm:kf<500||S.geld<500*fassPreis()}),
    i:`Fassraum brauchst du zum Keltern, kauf ihn am besten vor der Lese. ${ALLEIN_FASS?`${num(ALLEIN_FASS)} l betreust du selbst, jeder Kellermensch ${num(FASS_JE_LAGERARB)} l dazu`:`Ein Kellermensch betreut ${num(FASS_JE_LAGERARB)} l Fassraum`}. Der Preis schwankt jeden Monat.${mk?` Dein ${KM} kauft beim Keltern nur so viel, wie gerade fehlt.${leute}`:''}`})
  // Seit 10.6 (Maik 20.11.2026): Leiste wie beim Fassraum, darunter, was du selbst betreust und was die Lagerarbeiter dazu schaffen.
  +fenster('flaschen','Flaschen',`<div class="kv"><span>Flaschenplatz belegt</span><span>${num(S.flaschen)} von ${num(flKap())}</span></div><div class="bar w"><i style="width:${flKap()?Math.min(100,S.flaschen/flKap()*100):0}%"></i></div>
    <div class="kv"><span>Betreust du selbst</span><span>${num(ALLEIN_FL)}</span></div>
    <div class="kv"><span>Kellerleute (${S.lagerarb}) betreuen</span><span>+ ${num(flKap()-ALLEIN_FL)}</span></div>`,{
    hin:[mf&&`🍷 Dein ${KM} kauft fehlende Flaschen beim Abfüllen dazu.`,csChef('flaschen')],
    links:kl<100?'Für mehr Flaschen brauchst du mehr Kellerleute.':`Möglich sind noch ${num(kl)} Flaschen.`,
    kn:pk('kaufFlaschen','Kaufen',eur2(flaschePreis()),{klein:'je Flasche',arm:kl<100||S.geld<100*flaschePreis()}),
    i:`Leere Flaschen brauchst du zum Abfüllen, ein Liter je Flasche. Kauf sie am besten vor dem Abfüllen. ${ALLEIN_FL?`${num(ALLEIN_FL)} leere Flaschen betreust du selbst, jeder Kellermensch ${num(FLASCHEN_JE_LAGERARB)} dazu`:`Ein Kellermensch betreut ${num(FLASCHEN_JE_LAGERARB)} leere Flaschen`}, mit der Abfüllanlage im Einsatz ${num(ABF_FLASCHEN)}. Der Preis schwankt jeden Monat.${mf?` Dein ${KM} kauft beim Abfüllen nur so viele, wie gerade fehlen.${leute}`:''}`})
  +kellerAusHtml();
}
function kellerAusHtml(){
  const K=S.keller||0, pr=KELLER_PREISE[K], N=KELLER_PREISE.length;
  const was='Jede Stufe lässt Prädikatsweine und Eiswein einen Monat früher verkaufsreif werden, und jeder Wein gewinnt beim Reifen in der Flasche schneller an Wert.'+kellerRangText();
  if(pr!=null&&!K&&!kellerFrei(0)) return fenster('ausbau','Kellerausbau','',{zu:`mit ${kellerMit(0)}`,i:`${was} Ausbauen kannst du mit ${kellerMit(0)} im Kellerbuch.`});
  const stand=`<div class="kv"><span>Ausgebaut</span><span>Stufe ${K} von ${N}</span></div>${K?`<div class="kv"><span>Zuletzt gebaut</span><span>${KELLER_NAMEN[K-1]}</span></div>`:''}<div class="bar w"><i style="width:${K/N*100}%"></i></div>
    ${K?`<div class="kv"><span>Prädikat und Eiswein</span><span>${K} ${K===1?'Monat':'Monate'} früher reif</span></div>`:''}`;
  if(pr==null) return fenster('ausbau','Kellerausbau',stand+`<div class="fleer" style="margin-top:6px">Dein Keller ist fertig ausgebaut.</div>`,{i:was});
  if(!kellerFrei(K)) return fenster('ausbau','Kellerausbau',stand+`<div class="fleer" style="margin-top:6px">🔒 Stufe ${K+1} (${KELLER_NAMEN[K]}) kannst du mit ${kellerMit(K)} im Kellerbuch ausbauen.</div>`,{i:was});
  return fenster('ausbau','Kellerausbau',stand,{kn:pk('kellerAus','Ausbauen',eur(pr),{klein:KELLER_NAMEN[K],arm:S.geld<pr}),i:was});
}
// Hintertür im Keller (seit 7.4 auf dem Fenster-Baustein): Zuckern und Wässern, Verschneiden, darunter der Weinprüfer als Zustand. Die Sabotage ist seit 13.5.9 raus.
// Die roten Zeilen zu gepanschtem Wein und zum Prüfer stehen immer sichtbar im Fenster "Weinprüfer", die Erklärungen im i.
function vSabotage(){
  const tr=S.lots.filter(l=>l.status==='trauben'), mi=S.lots.filter(mischbar), paare=mi.some(a=>mi.some(b=>a!==b&&farbe(a)===farbe(b))), P=panschListe().length, scharf=S.kontr.scharf>0;
  // Seit 14.4.6: Im 1. Akt ist die Hintertür zu, sie geht mit dem Rang FREI.hintertuer auf. Platzhalter, Wortlaut in Meilenstein 17.
  if(!hinterOffen()) return einKarte('hinter','Die Hintertür ist zu',KONTR_TEXT.zu.replace('{rang}',RAENGE[FREI.hintertuer.r].name));
  // Seit 14.4.6: Was das Fenster "Weinprüfer" zeigt, je Spielstufe (KONTR_ZEIGE): Lehrjahre die Warnung des alten Winzers in Zahlen,
  // Gesellenjahre Strafe und Abstand, Meisterprüfung keine Zahlen.
  const kz=KONTR_ZEIGE[S.schwer], kA=kontrAbstand(), kAbst=scharf?'jedes Jahr':`alle ${kA[0]} bis ${kA[1]} Monate`, kStrafe=KONTR_TEXT.strafe.replace('{min}',eur(STRAFE_MIN))+(strafeAns()?`, ${strafeAns()} Ansehen`:'');
  if(['zuckern','verschneiden','pruefer'].every(einZu)) return einKarte('hinter','Noch alles sauber','Hinter dieser Tür geht es nicht ganz sauber zu. Bis zur ersten Lese gibt es hier nichts zu tun.');
  return fenster('zuckern','Most zuckern oder wässern',tr.map(l=>fz(dot(l.sorte)+SORTEN[l.sorte].name,
      `${num(l.liter)} l Trauben · ${l.oe}° Öchsle${l.oe>=deckel(l.sorte)?' · am Deckel':''}${mani(l)?' · 🤫 '+maniText(l):''}`,'',
      `<button class="klein wag" data-a="zuckern" data-id="${l.id}" data-k="wasser" ${(l.wasser||0)>=ZUCKER_MAX?'disabled':''}>Wässern</button>`,
      `<button class="klein wag" data-a="zuckern" data-id="${l.id}" data-k="zucker" ${zuckerBis(l)<1?'disabled':''}>Zuckern</button>`)),{
    leer:'Gerade liegen keine Trauben im Kelterhaus.',
    i:`Geht nur mit frisch gelesenen Trauben, bevor sie gekeltert sind. Zucker hebt die Öchsle, aber höchstens bis zum Deckel des Weinbergs, aus dem die Trauben kommen. Liegt der Most schon am Deckel, geht kein Zucker mehr. Wasser streckt die Menge und senkt die Öchsle. Beides geht um höchstens ${ZUCKER_MAX} %. Bis ${ZUCKER_ERLAUBT} % sind erlaubt, wenn du den Wein als Tafelwein anmeldest. Alles andere ist Panscherei und geht nur gegen Schmiergeld durchs Rathaus.`})
  +fenster('verschneiden','Fässer verschneiden','',{
    links:paare?'':'Dafür brauchst du zwei angemeldete Fassweine gleicher Farbe.',
    kn:`<button class="klein wag" data-a="misch1" ${paare?'':'disabled'}>Fässer mischen</button>`,
    i:'Zwei angemeldete Fassweine gleicher Farbe werden zu einem. Der bessere Name bleibt, Öchsle und Qualität werden gemittelt. Streng verboten, der Beamte will dafür Schmiergeld.'})
  +fenster('pruefer','Weinprüfer',`<div class="kv"><span>Gepanschte Weine im Keller</span><span${P?' class="rot"':''}>${P}</span></div>
    ${kz!=='nichts'?`<div class="kv"><span>Kontrolle</span><span${scharf?' class="rot"':''}>${kAbst}</span></div><div class="kv"><span>Strafe bei einem Fund</span><span>${kStrafe}</span></div>`:''}
    ${kz==='warnung'?`<div style="font-size:14px;margin-top:4px">${kontrWarn()}${verwarnOffen()?' '+KONTR_TEXT.verwarnErst:''}</div>`:''}
    ${scharf?'<div class="rot" style="font-size:14px;margin-top:4px">Der Prüfer hat dich auf dem Kieker.</div>':''}`,{
    i:`Hinter der unscheinbaren Tür geht es nicht ganz sauber zu. Der Weinprüfer kommt unangemeldet${kz!=='nichts'?`, alle ${kA[0]} bis ${kA[1]} Monate`:''}. Was bis dahin verkauft ist, findet er nicht mehr.`});
}
function vStadt(){
  let h=kopf({amt:'Rathaus',handel:'Großhandel',laeden:ladenFrei()?'Deine Weinhandlung':'Weinhandel',bank:'Bank',arbeit:'Arbeitsamt'}[SUB]);
  // Rathaus (seit 7.4 auf dem Fenster-Baustein): festes Fenster "Wein anmelden" mit der Anzahl, darunter Makler und Kontrolle anregen.
  // Was der Rang noch sperrt, ist seit 10.6 ausgeblendet (bis 10.5 zugeklappt mit Schloss unten). Am Ziel (Präsident) gibt es keinen Makler mehr.
  if(SUB==='amt'){
    const fa=S.lots.filter(l=>l.status==='fass'&&!l.stufe).sort(BSORT_F.dringend), zu=[], mon=n=>n===1?'Monat':'Monaten';
    // Seit 10.0: Mit Amt steht der Weinbauverband ganz oben.
    if(S.amt) h+=vVerband()+vWeltschau();
    h+=fenster('anmelden','Wein anmelden',`<div class="kv"><span>Fassweine ohne Anmeldung</span><span>${fa.length}</span></div>`
      +(fa.length?`<div class="fzl ab">${fa.map(l=>{const rest=8-l.fassMonate; return fz(dot(l.sorte)+lotName(l),
        `${num(l.liter)} l · ${l.oe}° Öchsle · ${LESE[l.leseart]} · Edelfäulnis ${l.edel?'ja':'nein'}${mani(l)?' · 🤫 '+maniText(l):''}`,
        `<span class="${l.fassMonate>=5?'rot':''}">Verdirbt in ${rest} ${mon(rest)}.</span>`,
        `<button class="klein" data-a="anmelden" data-id="${l.id}">Anmelden</button>`)}).join('')}</div>`
      :`<div class="fleer" style="margin-top:6px">Kein Fasswein wartet auf die Anmeldung.</div>`),{
      i:'Im Rathaus meldest du deinen Fasswein an. Erst dann bekommt er seine Stufe und darf in die Flasche. Welche Stufen für einen Wein möglich sind, siehst du nach dem Tipp auf „Anmelden“. Was zuerst verdirbt, steht oben.'});
    // Seit 7.9: feste Fenster "Wettbewerbe" und "Auktionen". Einreichen und Bieten gehen hier, die Tipps in "Das steht an" führen her.
    const wI=`Bei der Landesprämierung im Februar treten die Winzer deines Gebiets mit Prädikatsweinen vom letzten Jahrgang an.${S.rang>=R_BUND?' Der Bundeswettbewerb ist alle drei Jahre im Juni, mit verkaufsreifen Prädikatsweinen und Sekten aus der Flasche.':''} Eingereicht wird im Monat der Ausschreibung, das Ergebnis steht im nächsten Winzerboten. Ein Platz auf dem Treppchen bringt Ansehen und Punkte für den Wein.${S.amt&&S.amt.brief?` Die Weltweinschau ist jeden ${MON[WELT_MONAT]} bei dir im Dorf, angemeldet wird im ${MON[WELT_ANM]}. Jedes Jahr geht es um eine Krone, in fester Reihenfolge: ${KRONEN.map(K=>K.name).join(', ')}. Verlierst du, ist im nächsten Jahr dieselbe Krone dran.`:''}`;
    if(S.rang<R_LAND) zu.push(fenster('wettb','Wettbewerbe','',{zu:`ab dem Rang ${RAENGE[R_LAND].name}`,i:wI}));
    else{
      const w=S.wett&&!S.wett.fertig?S.wett:null, mb=aufgabeAktiv('wett')?mgrAufgabe('wett').bereich:'';
      const wz=typ=>{
        const name=WETTNAME[typ], rg=typ==='bund'?R_BUND:R_LAND;
        if(S.rang<rg) return '';   // Seit 10.6: Der Bundeswettbewerb taucht erst mit seinem Rang auf.
        if(!w||w.typ!==typ) return fz(name,`Gerade nichts, als Nächstes im ${wettNaechst(typ)}.`);
        const n=S.lots.filter(wettFaehig).length;
        return fz(`${name} ${S.jahr}`,w.ein?`Eingereicht: ${esc(w.ein.name)}`:n?`${n} ${n===1?'Wein ist':'Weine sind'} zugelassen`:'Du hast gerade keinen zugelassenen Wein.',
          w.ein?'Tauschen geht bis zum Monatsende.':n&&(!mb||typ==='welt')?'<span class="rot">Einreichen geht nur diesen Monat.</span>':'',
          `<button class="klein${w.ein||!n?' sec':''}" data-a="wettbewerb">${w.ein?'Tauschen':n?'Einreichen':'Ansehen'}</button>`)};
      // Seit 13.6.3: die Weltweinschau mit der Krone, die gerade dran ist. Angemeldet wird nur im Januar.
      const sz=()=>{
        if(amtEhre()) return fz('🌍 '+WETTNAME.welt,`Alle ${KRONEN.length} Kronen geholt, die letzte ${S.amt.ehren.j}. Als ${ehrP()} trittst du nicht mehr an.`);
        const s=S.schau, K=KRONEN[s?s.kl:kroneKl()];
        if(!schauAnm()) return fz(`🌍 ${WETTNAME.welt} · ${K.name}`,s?`${s.ein?'Angemeldet: '+esc(s.ein.name):'Kein Wein angemeldet'}. Die Schau ist im ${MON[WELT_MONAT]}.`:`Als Nächstes Anmeldung im ${wettNaechst('welt')}.`);
        const n=S.lots.filter(l=>schauFaehig(l)).length;
        return fz(`🌍 ${WETTNAME.welt} ${S.jahr} · ${K.name}`,s.ein?`Angemeldet: ${esc(s.ein.name)}`:n?`${n} ${n===1?'Wein ist':'Weine sind'} zugelassen`:esc(kroneFehltText(s.kl))||'Du hast gerade keinen zugelassenen Wein.',
          s.ein?'Tauschen geht bis zum Monatsende.':n?'<span class="rot">Anmelden geht nur diesen Monat.</span>':'',
          `<button class="klein${s.ein||!n?' sec':''}" data-a="schau">${s.ein?'Tauschen':n?'Anmelden':'Ansehen'}</button>`)};
      h+=fenster('wettb','Wettbewerbe',[wz('land'),wz('bund'),...(S.amt&&S.amt.brief?[sz()]:[])],{hin:[mb&&`${MGR_BEREICHE[mb].sym} ${mgrG(mb).Dein} ${MGR_BEREICHE[mb].name} reicht beim Weiterblättern deinen besten Wein ein.${S.amt&&S.amt.brief?' Den Wein für die Weltweinschau wählst du selbst.':''}`],i:wI});
    }
    const aI=`Bei einer Auktion kommt Land unter den Hammer, meist viel billiger als beim Makler. Der Winzerbote kündigt sie einen Monat vorher an, im Monat danach bietest du hier mit. Mitgehen kannst du bis Konto plus freier Kreditrahmen. Auktionen gibt es nicht jedes Jahr, geboten wird wenn, dann im ${AUK_MONATE.map(m=>MON[(m+1)%12]).join(', ').replace(/, ([^,]*)$/,' oder $1')}.${deckelSatz()?' '+deckelSatz():''}`;
    if(S.rang<R_AUKTION) zu.push(fenster('auktionen','Auktionen','',{zu:`ab dem Rang ${RAENGE[R_AUKTION].name}`,i:aI}));
    else{
      const a=S.auktion, was=a?`${a.spitze?'Spitzenlage':losLage(a).sym+' '+losLage(a).kurz} mit ${a.ha}\u00a0Hektar`:'', lim=Math.max(0,aukLimit()), zuG=a&&aukDeckel(a)?`<span class="rot">${AUK_ZU_GROSS}</span>`:'';
      h+=fenster('auktionen','Auktionen',!a?[]
        :a.phase===0?[fz(was,`Geboten wird im ${MON[(S.monat+1)%12]} · Startgebot ${eur(a.start)}`,zuG||((aukZeichen(a,a.start)?aukZeichen(a,a.start)+' ':'')+(lim>=aukPreis(a.start,a)?`Du kannst bis ${eur(lim)} mitgehen.`:`<span class="rot">Fürs Startgebot fehlen dir ${eur(aukPreis(a.start,a)-lim)}.</span>`)),`<button class="klein" data-a="auktion">Ansehen</button>`)]
        :a.ende?[fz(was,'Die Auktion ist beendet.','',`<button class="klein" data-a="auktion">Ansehen</button>`)]
        :[fz(was,`${a.fuehrer?'Höchstgebot':'Startgebot'} ${eur(a.gebot)}${a.fuehrer?' von '+esc(a.fuehrer):''}`,zuG||((aukZeichen(a,aukNaechstes())?aukZeichen(a,aukNaechstes())+' ':'')+(aukPreis(aukNaechstes(),a)<=lim?'<span class="rot">Geboten wird nur diesen Monat.</span>':'Zum Mitbieten reicht dein Geld nicht.')),`<button class="klein" data-a="auktion">${zuG?'Ansehen':'Bieten'}</button>`)],
        {leer:`Gerade nichts, als Nächstes frühestens im ${aukNaechst()}.`,i:aI});
    }
    const mkI=`Der Makler kennt Winzer, die ihr Land lieber still verkaufen. Ein Hektar kostet bei ihm ${eur(MAKLER_PREIS)}, bei einer Auktion meist viel weniger. ${HA_NEU?`Mit dem Rang hat er mehr für dich: ${maklerStaffel()}. Er verkauft aber nur`:'Er verkauft dir höchstens einen Hektar im Jahr und nur'}, wenn dir für den nächsten Rang allein noch Land fehlt.${deckelSatz()?' '+deckelSatz():''}`;
    if(S.rang<R_MAKLER) zu.push(fenster('makler','Makler','',{zu:`ab dem Rang ${RAENGE[R_MAKLER].name}`,i:mkI}));
    else if(S.rang<R_MAX){
      const g=maklerGrund(), n=RAENGE[S.rang+1];
      h+=fenster('makler','Makler',`<div class="kv"><span>Deine Fläche</span><span>${S.ha}${haDeckel()<Infinity?' von höchstens '+haDeckel():''} Hektar</span></div><div class="kv"><span>Für den nächsten Rang</span><span>${n.ha} Hektar bepflanzt</span></div>${maklerHa()>1?`<div class="kv"><span>Beim Makler dieses Jahr</span><span>${maklerDiesJahr()} von ${maklerHa()} Hektar</span></div>`:''}`,{
        links:g,kn:pk('makler','Kaufen',eur(MAKLER_PREIS),{klein:'1 Hektar',aus:!!g,arm:S.geld<MAKLER_PREIS}),i:mkI});
    }
    const anI=`Einmal im Jahr kannst du dem Prüfer einen Hinweis geben. Findet er bei einem Gegner gepanschten Wein, kostet ihn das ${ANREG_ANS} Ansehen und Strafe. Findet er nichts, kostet dich die falsche Verdächtigung ${ANREG_FEHL} Ansehen. Gerüchte im Winzerboten helfen beim Raten.`;
    if(S.rang<R_KONTROLLE) zu.push(fenster('anreg','Kontrolle anregen','',{zu:`ab dem Rang ${RAENGE[R_KONTROLLE].name}`,i:anI}));
    else{
      const schon=S.anregJahr===S.jahr;
      h+=fenster('anreg','Kontrolle anregen',S.gegner.map(g=>fz(esc(g.name)+(g.geruecht?' 🗣️':''),`${GEGNER_TYP[g.typ].art}, ${WO[g.region]}`,[g.geruecht?'Es gibt Gerüchte.':'',anregZeichen(g)].filter(Boolean).join(' '),
        `<button class="klein" data-a="anreg" data-id="${g.id}" ${schon?'disabled':''}>Hinweis geben</button>`)),{
        stand:schon?'Für dieses Jahr hast du deinen Hinweis schon gegeben.':'Dein Hinweis für dieses Jahr ist noch frei.',i:anI});
    }
    // Version 8.2: Spenden. Je Rang eine Stufe, Raten, Stand und der Dank des Dorfs. Nach der Bank und dem Holzbogen kann man beide hier wieder ansehen.
    const spI=`Jeder Rang vom ${RAENGE[1].name} bis zum ${RAENGE[SPENDEN.length-1].name} hat eine Spende für das Dorf. Du zahlst in Raten, so viel und so oft du willst. Jede Rate senkt den Gewinn ihres Jahres und damit die Steuer, aber höchstens um ${pz(SP_DECKEL)} des Gewinns. Wer über mehrere Jahre verteilt zahlt, spart öfter.<br><br>Den Dank des Dorfs gibt es erst beim vollen Betrag: Ansehen, ein Schild oder eine Urkunde fürs Büro und eine Belohnung für dein Weingut. Steigst du vorher auf, verfällt der Rest, das Gezahlte senkt dann nur noch die Steuer.<br><br>Wer alle ${SPENDEN.length-1} Spenden schafft, hält später einen der zwei Schlüssel zur Weltweinschau in der Hand.`;
    if(S.rang<1) zu.push(fenster('spenden','Spenden','',{zu:`ab dem Rang ${RAENGE[1].name}`,i:spI}));
    else{
      const s=spOffen(), D=s&&SPENDEN[s], bez=spBezahlt(), st=D?D.b/SP_TEIL:0, fertig=(S.spenden||[]).length;
      const ansehen=[spLohn(7)&&pk('spBank','Bank ansehen','',{sec:1}),spFertig(8)&&pk('spBogen','Holzbogen ansehen','',{sec:1})].filter(Boolean);
      const inhalt=s?`<div class="kv"><span>Stufe ${s}: für ${esc(D.z)}</span><span>${eur(D.b)}</span></div>
        <div class="kv"><span>Gespendet</span><span>${vonGeld(bez,D.b)}</span></div><div class="bar ${bez>=D.b?'':'g'}"><i style="width:${Math.round(bez/D.b*100)}%"></i></div>
        <div class="mut">Dank des Dorfs: ${D.ans} Ansehen, ${s<=4?'ein Schild':s===8?'der Ehrenbrief':'eine Urkunde'} fürs Büro. ${esc(D.lohn)}.</div>`
        :`<div class="fleer">${S.rang>=SPENDEN.length?(stFehlt()?`Als ${anr('Präsident','Präsidentin')} spendest du nicht mehr. Was du verpasst hast, holt die Stiftung fürs Dorf nach.`:`Als ${anr('Präsident','Präsidentin')} spendest du nicht mehr, das Dorf weiß, was es an dir hat.`):S.rang===SPENDEN.length-1?'Das war die letzte Spende. Das ganze Dorf kennt deinen Namen.':`Die Spende für ${esc(SPENDEN[S.rang].z)} ist erledigt. Die nächste kommt mit dem Rang ${RAENGE[S.rang+1].name}.`}</div>`;
      h+=fenster('spenden','Spenden',inhalt,{
        stand:`${fertig} von ${SPENDEN.length-1} Spenden erledigt${S.spJahr?` · dieses Jahr ${eur(S.spJahr)} gespendet`:''}`,
        links:s?`Raten ab ${eur(Math.min(st,D.b-bez))}. Jede senkt die Steuer dieses Jahres.`:'',
        kn:[...(s?[pk('spenden','Spenden','',{klein:`noch ${eur(D.b-bez)}`,arm:S.geld<Math.min(st,D.b-bez)})]:[]),...ansehen],i:spI});
    }
    // Seit 10.1: Stiftung fürs Dorf, nur mit Amt und nur solange eine Spende fehlt. Die niedrigste verpasste Stufe zuerst, zum STIFT_FAKTOR-fachen Preis.
    {const s=stOffen(); if(s){
      const D=SPENDEN[s], b=stPreis(s), bez=stBezahlt(), st=b/SP_TEIL, n=stAnzahl();
      h+=fenster('stiftung','Stiftung fürs Dorf',`<div class="kv"><span>Stufe ${s}: für ${esc(D.z)}</span><span>${eur(b)}</span></div>
        <div class="kv"><span>Eingezahlt</span><span>${vonGeld(bez,b)}</span></div><div class="bar ${bez>=b?'':'g'}"><i style="width:${Math.round(bez/b*100)}%"></i></div>
        <div class="mut">Dank des Dorfs: ${D.ans} Ansehen und ${s<=4?'das Schild':s===8?'der Ehrenbrief':'die Urkunde'} fürs Büro. ${s===8?'Der Holzbogen auf dem Dorfplatz kommt mit.':'Die Belohnung der Spende gibt es nicht mehr.'}</div>`,{
        stand:`${n===1?'Eine Spende fehlt':n+' Spenden fehlen'} dem Dorf noch${S.spJahr?` · dieses Jahr ${eur(S.spJahr)} gegeben`:''}`,
        links:`Raten ab ${eur(Math.min(st,b-bez))}. Jede senkt die Steuer dieses Jahres.`,
        kn:pk('stiften','Einzahlen','',{klein:`noch ${eur(b-bez)}`,arm:S.geld<Math.min(st,b-bez)}),buch:'wahl',
        i:`Die Stiftung holt nach, was du auf dem Weg nach oben nicht gespendet hast, eine Stufe nach der anderen und zum ${STIFT_FAKTOR===2?'doppelten':STIFT_FAKTOR+'-fachen'} Preis. Du zahlst in Raten wie bei den Spenden, mit demselben Steuervorteil (höchstens ${pz(SP_DECKEL)} des Gewinns).<br><br>Beim vollen Betrag gibt es das Ansehen und die Ehrung der Spende, aber nicht mehr ihre Belohnung. Nur der Holzbogen der letzten Stufe kommt mit. Auf die Stimmung im Verband zählt dieses Ansehen nicht. Sind alle ${SPENDEN.length-1} Stufen erledigt, hast du den Schlüssel „Dorf“ für die Weltweinschau.`});
    }}
    h+=zu.join('');
    if(einZu('anmelden')&&!S.amt&&S.rang<1&&!stOffen()) h+=einKarte('rathaus','Noch kein Wein','Im Rathaus meldest du deinen Wein an, sobald er im Fass liegt. Erst dann darf er in die Flasche.');
  }
  // Großhandel (seit 7.4 auf dem Fenster-Baustein): "Markt diesen Monat" mit Marktlage und Budget, darunter "Deine Weine" als Liste zum Antippen.
  // Die Liste steht fest nach Dringlichkeit. Budget und Exporthandel stehen im i, vom Dauerauftrag bleibt eine Zeile (dauerInfo).
  if(SUB==='handel'){
    const fl=S.lots.filter(l=>l.status==='flasche'&&!l.regal).sort(BSORT_F.dringend), exSt=exportStufen(), pzx=f=>`+${Math.round((f-1)*100)} %`, D=dauerInfo('handel');
    h+=fenster('markt','Markt diesen Monat',`<div class="kv"><span>Marktlage</span><span>${S.markt>1.04?'gut 📈':S.markt<.96?'schwach 📉':'normal'}</span></div>
      ${S.lage?`<div class="kv"><span>${S.lage.typ==='mode'?SORTEN[S.lage.sorte].name+' gefragt':'Weinskandal'}</span><span>${proz(S.lage.f)}</span></div>`:''}
      <div class="kv"><span>Budget übrig</span><span>${eur(marktRest())} von ${eur(marktFrei())}</span></div>`,{
      i:`Der Großhandel zahlt jeden Monat nur bis zu seinem Budget den vollen Preis. Was über das Budget geht, drückt den Preis, und was du an Weinhandlungen verkaufst, zählt nicht mit. Jeder Rang hebt das Budget um ${eur(MARKT_RANG)}, jeder bepflanzte Hektar über ${HA_FREI} um ${eur(MARKT_HA)}.
      ${exSt?`<div style="margin-top:6px">🌍 Der Exporthandel nimmt dir mit jedem Rang mehr ab, gerade hebt er das Budget um ${eur(MARKT_EXPORT*exSt)}${exSt<EXPORT_STUFEN?`, ab dem Rang ${RAENGE[S.rang+1].name} um ${eur(MARKT_EXPORT*(exSt+1))}`:''}. Er zahlt mehr als das Inland:</div>
      ${EXPORT_ZEILEN.map(([k,t])=>`<div class="kv"><span>${t}</span><span>${pzx(EXPORT_F[k])}</span></div>`).join('')}`
      :`<div style="margin-top:6px">🌍 Den Exporthandel gibt es ${freiText('export')}. Er zahlt mehr als das Inland und nimmt dir mit jedem Rang mehr ab.</div>`}`});
    // Ist noch nichts verkaufsreif, steht oben, wann der erste Wein so weit ist (seit 5.0).
    const erst=fl.length&&!fl.some(l=>preis(l))?fl.map(l=>({l,n:lager(l).min-l.flMonate})).sort((a,b)=>a.n-b.n)[0]:null;
    // Kurze Zeilen wie im Kellerbuch. Der Preis ist der beste Absatzweg mit der Marktlage nach den Verkäufen dieses Monats.
    h+=fenster('weine','Deine Weine',fl.map(l=>{const W=wege(l),L=lager(l),H=haltText(l),nm=`<b>${dot(l.sorte)}${esc(lotName(l))}${l.med&&l.med.length?' 🏅':''}</b>`,z2=`<div class="bz2">${num(l.liter)} Flaschen · Qualität ${l.qp}</div>`,z3=`<div class="bz3 ${H.r<=2?'rot':''}">${H.t}</div>`;
      if(!W.length){const n=L.min-l.flMonate; return `<button class="bzeile" data-a="buchDetail" data-id="${l.id}"><div class="bz1">${nm}<span>reif in ${n} ${n===1?'Monat':'Monaten'}</span></div>${z2}${z3}</button>`}
      // Seit 7.9 (Weg A): Unter dem Preis steht, wie viele Flaschen der Großhandel diesen Monat noch zum vollen Preis nimmt. Gerechnet wird mit dem Rest
      // des Budgets, also nach jedem Verkauf neu. Vorher galt marktF(0), der Preis der ersten Flasche: Der blieb voll, auch wenn das Budget gerade aufgebraucht war.
      const w=W[0], fw=federHandel(l), voll=fw?l.liter:Math.min(l.liter,Math.floor(marktRest()/w.p)), satt=!fw&&voll<1;
      const zv=fw?'':`<div class="bz2">${satt?`alle zusammen im Schnitt ${eur2(w.p*marktF(l.liter*w.p))} je Flasche`:voll>=l.liter?'alle zum vollen Preis':`noch ${voll===1?'1 Flasche':num(voll)+' Flaschen'} zum vollen Preis`}</div>`;
      return `<button class="bzeile" data-a="verkaufen" data-id="${l.id}"><div class="bz1">${nm}<span>${satt?'Markt satt 📉':(w.name==='Inland'?'':w.flag+' ')+eur2(w.p)}</span></div>${z2}${zv}${z3}</button>`}),{
      leer:'Kein Flaschenwein im Lager.',
      hin:[D.hin,erst&&`⏳ Noch nichts verkaufsreif. Als Erstes reif: ${esc(lotName(erst.l))} im ${inMonaten(erst.n)}.`],
      stand:D.stand,
      i:`Antippen verkauft. Der Preis je Flasche gilt für den besten Absatzweg, Zoll ist abgezogen. Darunter steht, wie viele Flaschen der Großhandel diesen Monat noch zum vollen Preis nimmt. „Markt satt 📉“ heißt: Das Budget ist weg, jede weitere Flasche drückt den Preis. Was zuerst verdirbt, steht oben.${ladenFrei()?' Weine im Regal deiner Weinhandlung fehlen hier.':''} Wein aus dem Fass meldest du im Rathaus an und füllst ihn danach im Keller ab. Tafel- und Qualitätswein sind zwei Monate danach verkaufsreif.${D.text}`});
    if(einZu('markt')&&einZu('weine_gh')) h+=einKarte('gross','Noch kein Wein','Hier verkaufst du deinen Wein, sobald er in der Flasche und verkaufsreif ist.');
  }
  // Weinhandel (seit 7.4 auf dem Fenster-Baustein), Reihenfolge nach der Regel "was diesen Monat ansteht, Handgriffe, Zustand, Gesperrtes":
  // die Weinhandlungen der anderen Gebiete mit ihrem Wunsch des Monats, dann "Ins Regal stellen" und "Dein Regal" der eigenen Weinhandlung (ab R_LADEN).
  // Vorher steht "Eigene Weinhandlung" zugeklappt mit Schloss unten. Die beiden kleinen Bilder sind raus, sie kommen in den Fenstern von unten.
  if(SUB==='laeden'){
    const n=S.lots.filter(ladenOk).length, D=dauerInfo('laeden'), HM=`${mgrG('handel').Dein} ${MGR_BEREICHE.handel.name}`, mr=aufgabeAktiv('regal'), mehr=Math.round((LADEN_EIGEN_F-1)*100);
    // Ohne passenden Wein sagt ein Hinweis, was fehlt und ab wann es geht (seit 5.0). Wie man zu Kabinett kommt, steht im i.
    const bald=n?null:S.lots.filter(l=>l.status==='flasche'&&!l.regal&&!preis(l)&&(l.sekt||STUFEN[l.stufe].rang>=3)).map(l=>({l,n:lager(l).min-l.flMonate})).sort((a,b)=>a.n-b.n)[0];
    h+=fenster('laeden','Weinhandlungen',Object.entries(S.laeden).map(([r,d])=>{const k=S.lots.filter(l=>ladenPasst(l,r)).length;
        return fz(`Weinhandlung ${WO[r]}`,`Sucht diesen Monat nur ${wunschName(d.wunsch)}`,
          d.rest<=0?'Nimmt diesen Monat nichts mehr.':`Nimmt noch ${num(d.rest)} Flaschen, ${k?`${k} ${k===1?'Wein passt':'Weine passen'}`:'du hast keinen passenden Wein'}.`,
          `<button class="klein" data-a="ladenAngebot" data-id="${r}"${d.rest>0&&k?'':' disabled'}>Anbieten</button>`)}),{
      hin:[D.hin,!n&&`🍷 <b>Noch kein passender Wein.</b> ${bald?`Als Erstes reif: ${esc(lotName(bald.l))} im ${inMonaten(bald.n)}.`:'Weinhandlungen nehmen nur Prädikatswein ab Kabinett oder Sekt.'} Bis dahin verkaufst du im Großhandel.`],
      stand:D.stand,
      i:`Weinhandlungen in den anderen Anbaugebieten zahlen mehr als der Großhandel. Sie nehmen aber nur Prädikatswein und Sekt, jede nur das, was sie gerade sucht, und jeden Monat nur eine kleine Menge. Für Kabinett liest du reife Trauben ab ${R().min.kab}° ohne Edelfäulnis, anmelden darfst du ab Januar, danach reift er je nach Sorte noch einige Monate in der Flasche (📜 Weinarchiv, Lexikon).${D.text}`});
    const regalI=`Was im Regal steht, verkauft sich jeden Monat von selbst, das Teuerste zuerst, bis ${eur(ladenEigen())} Listenwert. Dafür bekommst du ${mehr} % mehr als den Listenpreis. Regalweine fehlen im Großhandel.`;
    if(ladenFrei()){
      const rg=regalWeine(), kann=S.lots.filter(l=>l.status==='flasche'&&!l.regal&&preis(l)>0).sort((a,b)=>preis(b)-preis(a));
      h+=fenster('regalRein','Ins Regal stellen',kann.map(l=>`<button class="bzeile" data-a="regal" data-id="${l.id}"><div class="bz1"><b>${dot(l.sorte)}${esc(lotName(l))}</b><span>${eur2(preis(l)*LADEN_EIGEN_F)}</span></div><div class="bz2">${num(l.liter)} Flaschen · im Großhandel ${eur2(wege(l)[0].p)}</div></button>`),{
        leer:'Gerade hast du keinen verkaufsreifen Flaschenwein fürs Regal.',
        hin:[mr&&`${MGR_BEREICHE.handel.sym} ${HM} füllt das Regal beim Weiterblättern.`],
        i:`Antippen stellt einen Wein ins Regal, rechts steht sein Preis dort. ${regalI}${mr?` ${HM} füllt das Regal von selbst, mit Wein für rund ${MGR_REGAL} Monate.`:''}`});
      h+=fenster('regal','Dein Regal',rg.length?`<div class="kv"><span>Flaschen im Regal</span><span>${num(rg.reduce((a,l)=>a+l.liter,0))}</span></div>
        <div class="fzl ab">${rg.map(l=>`<button class="bzeile" data-a="buchDetail" data-id="${l.id}"><div class="bz1"><b>${dot(l.sorte)}${esc(lotName(l))}</b><span>${preis(l)?eur2(preis(l)*LADEN_EIGEN_F):'nicht verkaufsreif'}</span></div><div class="bz2">${num(l.liter)} Flaschen</div></button>`).join('')}</div>`:[],{
        leer:'Das Regal ist leer.',
        i:`${regalI} Antippen zeigt alle Angaben, dort nimmst du einen Wein auch wieder aus dem Regal.`});
    } else h+=fenster('regal','Eigene Weinhandlung','',{zu:freiText('laden'),i:`Eine eigene Weinhandlung bekommst du ${freiText('laden')}. ${regalI}`});
    if(einZu('laeden')&&!ladenFrei()) h+=einKarte('handel','Noch kein passender Wein','Ab Kabinett oder Sekt kaufen hier Weinhandlungen aus den anderen Gebieten. Bis dahin verkaufst du im Großhandel.');
  }
  // Bank (seit 7.4 auf dem Fenster-Baustein): "Dein Konto" mit dem, was zuletzt abgebucht wurde, darunter der Kredit.
  // Seit 7.9.2 steht dort der Spielraum bis zur Mahnung: Kreditrahmen minus Schulden, der Kredit für die Erbschaftssteuer zählt nicht mit.
  if(SUB==='bank'){
    const k=S.kredit, K=kosten(), ab=S.bericht&&S.bericht.k, kv=(a,x)=>x?`<div class="kv"><span>${a}</span><span>${eur(x)}</span></div>`:'';
    h+=fenster('konto','Dein Konto',`<div class="kv"><span>Kontostand</span><span class="${S.geld<0?'rot':''}">${eur(S.geld)}</span></div>
      <div class="kv"><span>Kreditrahmen</span><span>${eur(rahmen())}</span></div>
      <div class="kv"><span>Schulden gesamt</span><span class="${schulden()>rahmen()?'rot':''}">${eur(schulden())}</span></div>
      ${(l=>l<0?`<div class="kv"><span>Über dem Kreditrahmen</span><span class="rot">${eur(-l)}</span></div>`:`<div class="kv"><span>Spielraum bis zur Mahnung</span><span>${eur(l)}</span></div>`)(rahmen()-(schulden()-erbRest()))}
      ${S.mahnung?`<div class="rot" style="font-size:14px;margin-top:4px">⚠️ ${S.mahnung}. Mahnung in Folge. Beim dritten Mal kommt der Gerichtsvollzieher.</div>`:''}
      ${S.stundBis!=null&&monatNr()<S.stundBis?`<div style="font-size:14px;margin-top:4px">🕊️ Die Bank stundet noch ${S.stundBis-monatNr()} Monate, so lange mahnt sie nicht.</div>`:''}
      ${ab?`<div class="fzl ab"><div class="fstand" style="margin-bottom:2px">Zum letzten Monatswechsel abgebucht</div>
      ${kv('Betriebskosten',ab.basis)}${kv('Löhne',ab.loehne)}${kv('Kreditrate',ab.rate)}${kv('Überziehungszinsen',ab.ueberz)}${kv('Steuer auf den Jahresgewinn',ab.steuer)}
      <div class="kv"><span><b>Zusammen</b></span><span>${eur(ab.basis+ab.loehne+ab.rate+ab.ueberz+ab.steuer)}</span></div></div>`:''}`,{
      i:'Hier siehst du Kontostand, Kreditrahmen und was zuletzt abgebucht wurde. Der Kreditrahmen wächst mit deinem Rang. Minus auf dem Konto und Kredit zählen zusammen als Schulden. Der Spielraum zeigt, wie viel bis zum Kreditrahmen noch frei ist. Liegst du beim Monatswechsel darüber, mahnt die Bank, das kostet 6 Ansehen. Beim dritten Mal in Folge kommt der Gerichtsvollzieher.'});
    const krI='Einen Kredit gibt es ab 5.000 €, Laufzeit 12 bis 48 Monate, 6 % Zinsen im Jahr auf die Restschuld. Die Rate wird jeden Monat von selbst abgebucht. Vorzeitig ablösen geht jederzeit, ohne Gebühr.';
    h+=k?fenster('kredit','Dein Kredit',`<div class="kv"><span>Restschuld</span><span>${eur(k.rest)}</span></div>
      <div class="kv"><span>Rate diesen Monat</span><span>${eur(K.tilgung+K.zins)}</span></div>
      <div class="kv"><span>Restlaufzeit</span><span>${Math.ceil(k.rest/k.tilgung)} Monate</span></div>`,{
      links:S.geld<k.rest?'Zum Ablösen reicht dein Geld gerade nicht.':'',kn:pk('tilgen','Ablösen',eur(k.rest),{arm:S.geld<k.rest}),i:krI})
     :fenster('kredit','Kredit',`<div class="kv"><span>Möglich</span><span>5.000 € bis ${eur(rahmen())}</span></div>
      <div class="kv"><span>Zinsen im Jahr</span><span>6 %</span></div>
      <div class="kv"><span>Laufzeit</span><span>12 bis 48 Monate</span></div>`,{kn:pk('kredit','Aufnehmen',''),i:krI});
  }
  // Arbeitsamt (seit 7.4 auf dem Fenster-Baustein): Erntehelfer, Lagerarbeiter, darunter je Manager ein Fenster. Die Erklärtexte stehen im i,
  // sichtbar bleiben Zustand, rote Warnungen und der Hinweis, wenn ein Manager das Einstellen übernimmt.
  if(SUB==='arbeit'){
    const bed=rebenGesamt(), lei=leistung(), fe=leuteFehlen(), ms=maschErnte().length, KM=MGR_BEREICHE.weingut.name, WM=MGR_BEREICHE.weingut.name;
    const ohneGeld=k=>fe[k]?`<div class="rot" style="font-size:14px;margin:4px 0">${fe[k]===1?'Es fehlt einer':'Es fehlen '+fe[k]}, vorher geht es nicht in den nächsten Monat. Einstellen geht jetzt auch ohne Geld, dein Konto rutscht dann ins Minus.</div>`:'';
    const lohnTeil=k=>{const a=S.loehne[k];
      return `<div class="kv"><span>Angestellt</span><span>${S[k]}</span></div>
      ${a.length?`<div class="kv lang"><span>Ihre Löhne</span><span>${lohnListe(k)}</span></div><div class="kv"><span>Lohnkosten im Monat</span><span>${eur(lohnSumme(k))}</span></div>`:''}
      <div class="kv"><span>Angebot diesen Monat</span>${lohnAngebot(k)}</div>`};
    const lohnKnoepfe=k=>{const a=S.loehne[k];
      return [pk('helfer','Einstellen',eur(VERMITTLUNG),{id:k,n:1,arm:S.geld<VERMITTLUNG&&!leuteFehlen()[k],klein:`+${eur(S.angebot[k])} Lohn`}),pk('helfer','Entlassen','',{id:k,n:-1,sec:1,aus:S[k]<1,klein:a.length?`−${eur(a[a.length-1])} Lohn`:''})]};
    const amtI=`Der Lohn beim Arbeitsamt schwankt jeden Monat zwischen ${eur(lohnF(LOHN_MIN))} und ${eur(lohnF(LOHN_MAX))}. Wer eingestellt ist, behält seinen Lohn. Die Vermittlung kostet einmalig ${eur(VERMITTLUNG)}. Entlassen wird immer der teuerste. Deine Leute brauchst du das ganze Jahr: Fehlt jemand, geht es nicht in den nächsten Monat.`;
    h+=fenster('helfer','Erntehelfer',`${lohnTeil('helfer')}
      ${ms?`<div class="kv"><span>Erntemaschinen</span><span>${ms}, ${maschEinsatz().length} im Einsatz, ${maschEinsatz().length===1?'deckt':'decken'} ${haWort(maschHelfer())} ab</span></div>`:''}
      ${fahrerFehlen()?`<div class="kv"><span>Fahrer fehlen</span><span class="rot">${fahrerFehlen()}</span></div>`:''}
      ${ALLEIN_HA?`<div class="kv"><span>Deine Familie schafft</span><span>${rbn(alleinReben())} Reben</span></div>`:''}
      <div class="kv"><span>Gebraucht für ${rbn(bed)} Reben</span><span class="${fe.helfer?'rot':''}">${helferBedarf()}</span></div>
      <div class="kv"><span>Deine Leute reichen für</span><span>${rbn(helferReben())} Reben</span></div>
      ${ohneGeld('helfer')}
      <div class="kv"><span>Ernteleistung</span><span class="${lei<bed?'rot':''}">${rbn(lei)} von ${rbn(bed)} Reben</span></div>
      <div class="bar"><i style="width:${bed?Math.min(100,lei/bed*100):100}%"></i></div>`,{
      hin:[aufgabeAktiv('helfer')&&`${MGR_BEREICHE.weingut.sym} Dein ${WM} stellt fehlende Erntehelfer beim Weiterblättern ein.`,csChef('leute')],
      kn:lohnKnoepfe('helfer'),
      i:`${helferRegel()}. Eine Erntemaschine im Einsatz deckt ${MASCH_HELFER} Hektar ab, ein Vollernter ${VOLL_HELFER}. Das gilt nur mit Fahrern: Die Erntemaschine braucht ${MASCH.klein.fahrer}, der Vollernter ${MASCH.gross.fahrer}, gefahren wird von deinen Erntehelfern. Düngerstreuer und Laubschneider brauchen je ${MASCH.duenger.fahrer}, sie bekommen ihre Fahrer erst nach den Erntemaschinen. Trauben mit Edelfäulnis liest man von Hand, dafür brauchst du je ${rbn(HAND_REBEN)} Reben des Felds einen Erntehelfer${ALLEIN_HA?`, die ersten ${rbn(alleinReben())} liest deine Familie`:''}, sonst liest die Maschine und es gibt höchstens Qualitätswein. Pflanzen kannst du nur so viel, wie deine Leute schaffen. Bei der Lese leistet eine abgenutzte Maschine weniger. ${amtI}${aufgabeAktiv('helfer')?` Dein ${WM} stellt zum Angebot des Monats ein, entlassen musst du selbst. Nur die Helfer für die Handlese schickt er nach der Lese wieder heim.`:''}`});
    h+=fenster('lagerarb','Kellerleute',`${lohnTeil('lagerarb')}
      <div class="kv"><span>Gebraucht</span><span class="${fe.lagerarb?'rot':''}">${lagerBedarf()}</span></div>
      <div class="kv"><span>Fassraum</span><span>${num(S.fassraum)} l, betreut bis ${num(fassKap())} l</span></div>
      <div class="kv"><span>Leere Flaschen</span><span>${num(S.flaschen)}, betreut bis ${num(flKap())}</span></div>
      ${ohneGeld('lagerarb')}`,{
      hin:[aufgabeAktiv('lager')&&`${MGR_BEREICHE.weingut.sym} Dein ${KM} stellt fehlende Kellerleute beim Weiterblättern ein.`,csChef('leute')],
      kn:lohnKnoepfe('lagerarb'),
      i:`${lagerRegel()}, mit der Abfüllanlage im Einsatz ${num(ABF_FLASCHEN)} Flaschen. Einer deiner Kellerleute bedient sie. Mehr Fassraum oder Flaschen kaufen kannst du erst mit mehr Leuten. ${amtI}${aufgabeAktiv('lager')?` Dein ${KM} stellt zum Angebot des Monats ein, entlassen musst du selbst.`:''}`});
    // Seit 12.6.4 (Entscheidung 4): Solange die Familie alles schafft, steht hier nur eine Karte.
    if(einZu('helfer')&&einZu('lagerarb')) h+=einKarte('amt','Noch packt die Familie an',`Noch packst du mit deiner Familie allein an. Ab ${ALLEIN_HA} Hektar brauchst du Helfer, dann geht hier die Tür auf.`);
    h+=mgrAmt();
  }
  return h;
}
let ARCHIV='weine';
function archivKacheln(){return `<div class="bkach" role="tablist" aria-label="Teile im Weinarchiv">${ARCHIV_B.map(([k,s,n])=>`<button class="wahl${ARCHIV===k?' an':''}" role="tab" aria-selected="${ARCHIV===k}" data-a="archiv" data-id="${k}"><i>${s}</i>${n}${k==='lexikon'&&lexNeuZahl()?'<span class="lneu">Neu</span>':''}</button>`).join('')}</div>`}
function kompLotZeile(l){const id=kompLotId(l); return id?`<div class="kv"><span>Zählt für</span><span>${esc(KOMP[id].titel)} ${kompSiegel(kompSt(id),'klein')}</span></div>`:''}
// Deine Weine (seit 7.4 auf dem Fenster-Baustein): Zahl und geschätzter Wert, darunter je Wein eine kurze Zeile, fest nach Dringlichkeit.
// Antippen zeigt alle Angaben und die passenden Knöpfe. Seit 11.8 ein normales i statt des grauen Worts "Weinkompendium", und rechts unten die drei kleinen Siegel des Eintrags, für den der Wein zählt.
function vWeine(){
  const ls=S.lots.filter(l=>l.status!=='trauben').slice().sort(BSORT_F.dringend), wert=ls.reduce((a,l)=>a+lotWert(l),0),
    o={i:'Alle deine Weine im Fass und in der Flasche, was zuerst verdirbt, steht oben. Rot heißt, bald ist es zu spät. Die drei kleinen Siegel rechts zeigen, wie weit der Eintrag auf dem Siegelbrett ist, für den dieser Wein zählt. Wein im Fass, gepanschter Wein und Stufen aus einer anderen Sorte zählen nicht.'};
  if(einZu('weine')) return einKarte('weine','Noch keine Weine','Nach der ersten Lese stehen hier alle deine Weine, im Fass und in der Flasche.');
  if(!ls.length) return fenster('weine','Deine Weine',[],{...o,leer:'Noch keine Einträge. Hier stehen später alle deine Weine im Fass und in der Flasche.'});
  return fenster('weine','Deine Weine',`<div class="kv"><span>Weine im Fass und in der Flasche</span><span>${ls.length}</span></div>
    <div class="kv"><span>Geschätzter Wert</span><span>${eur(Math.round(wert/100)*100)}</span></div>
    <div class="fstand" style="margin:2px 0 0">Antippen zeigt alle Angaben. Was zuerst verdirbt, steht oben.</div>
    <div class="fzl ab">${ls.map(l=>{
      const fl=l.status==='flasche', L=l.stufe?lager(l):null, p=preis(l), H=haltText(l), kid=kompLotId(l);
      const pr=p?eur2(p):fl?`reif in ${L.min-l.flMonate} ${L.min-l.flMonate===1?'Monat':'Monaten'}`:'im Fass';
      return `<button class="bzeile" data-a="buchDetail" data-id="${l.id}"><div class="bz1"><b>${dot(l.sorte)}${esc(lotName(l))}${l.pansch?' 🤫':''}${l.regal?' 🏪':''}${l.med&&l.med.length?' 🏅':''}</b><span>${pr}</span></div>
      <div class="bz2">${l.stufe?'':'nicht angemeldet · '}Qualität ${l.qp} · ${num(l.liter)} ${fl?'Flaschen':'l im Fass'}</div>
      <div class="bz3 ${kid?'dws ':''}${H.r<=2?'rot':''}">${kid?`<span>${H.t}</span>${kompSiegel(kompSt(kid),'klein')}`:H.t}</div></button>`}).join('')}</div>`,o);
}
// Winzerbote: Erst steht das Bild allein da, dann rollt sich die Zeitung wie eine Schriftrolle vom oberen Rand ab, bis ihr Kopf oben steht.
// Oben hängt immer die Rolle. Ganz hochgeschoben verschwindet die Zeitung darin und gibt das Bild frei, Tippen auf die Rolle rollt sie wieder ab.
// ZW merkt sich Ausgabe und Position, damit ein neues Zeichnen derselben Ausgabe nicht wieder von vorn weht.
let ZW=null;
function zGleite(el,ziel,ms){const von=el.scrollTop,t0=performance.now();let ab=0;const halt=()=>ab=1;el.addEventListener('touchstart',halt,{once:true,passive:true});el.addEventListener('wheel',halt,{once:true,passive:true});
  (function f(t){if(ab||!el.isConnected)return;const x=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-x,3);el.scrollTop=von+(ziel-von)*e;if(x<1)requestAnimationFrame(f)})(t0)}
// Aufrollen: Die Zeitung steht schon an ihrem Platz und wird von oben nach unten freigegeben, die Rolle läuft an der Kante mit.
function zRolle(el,z,ziel){
  if(!el.isConnected) return; el.scrollTop=ziel; ZW.top=ziel; z.classList.remove('zu');
  const h=z.offsetHeight, sicht=Math.min(innerHeight,h), ms=1300, e='cubic-bezier(.25,.6,.3,1)';
  const r=document.createElement('div'); r.className='zrolle'; el.appendChild(r);
  z.animate([{clipPath:`inset(0 0 ${h}px 0)`},{clipPath:`inset(0 0 ${h-sicht}px 0)`}],{duration:ms,easing:e});
  r.animate([{transform:'translateY(-15px)'},{transform:`translateY(${sicht-15}px)`,opacity:1,offset:ms/(ms+250)},{transform:`translateY(${sicht+20}px)`,opacity:0}],{duration:ms+250,easing:e,fill:'forwards'}).onfinish=()=>r.remove();
}
function zRolleTeil(el,z,ziel){
  if(!el.isConnected) return; el.scrollTop=ziel; ZW.top=ziel; z.classList.remove('zu');
  const h=z.offsetHeight, sicht=Math.min(innerHeight,h), a=Math.round(sicht*Z_TEIL), e='cubic-bezier(.25,.6,.3,1)';
  const r=document.createElement('div'); r.className='zrolle'; el.appendChild(r);
  const k1=z.animate([{clipPath:`inset(0 0 ${h}px 0)`},{clipPath:`inset(0 0 ${h-a}px 0)`}],{duration:1100,easing:e,fill:'forwards'});
  r.animate([{transform:'translateY(-15px)'},{transform:`translateY(${a-15}px)`}],{duration:1100,easing:e,fill:'forwards'});
  let fertig=0; const A=['click','touchstart','wheel'];
  const rest=ev=>{
    if(fertig||ev&&ev.target&&ev.target.closest&&ev.target.closest('button')) return; fertig=1; A.forEach(n=>el.removeEventListener(n,rest));
    const k2=z.animate([{clipPath:`inset(0 0 ${h-a}px 0)`},{clipPath:`inset(0 0 ${h-sicht}px 0)`}],{duration:1000,easing:e,fill:'forwards'});
    k2.onfinish=()=>{k1.cancel(); k2.cancel()};
    r.getAnimations().forEach(x=>x.cancel());
    r.animate([{transform:`translateY(${a-15}px)`},{transform:`translateY(${sicht-15}px)`,opacity:1,offset:.83},{transform:`translateY(${sicht+20}px)`,opacity:0}],{duration:1200,easing:e,fill:'forwards'}).onfinish=()=>r.remove();
  };
  A.forEach(n=>el.addEventListener(n,rest,{passive:true}));
}
function zWehen(){
  const el=$('#info'); if(!el) return; const z=el.querySelector('.zt'), b=S.bericht||{}, key=`${b.titel}|${b.nr}`;
  const ziel=()=>0, ruhig=matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(ZW&&ZW.key===key) el.scrollTop=ZW.top;
  // Version 9.0: Beim Jahreszeiten-Wechsel rollt die Zeitung erst herunter, wenn die neue Jahreszeit ganz da ist. Die gezeigte Jahreszeit merkt sich S.bildJz.
  else{ZW={key,top:0}; const wech=!!el.querySelector('.ineu'); if(el.classList.contains('wg')) S.bildJz=JZ[S.monat]; wgVorladen();
    if(ruhig) el.scrollTop=ziel(); else{z.classList.add('zu'); if(!wech) setTimeout(()=>zRolle(el,z,ziel()),900)}
    // Der Wechsel startet erst, wenn das neue Bild geladen ist (höchstens 1,5 s warten), sonst ruckelt es. Die Zeitung rollt danach.
    if(wech){const n=el.querySelector('.ineu'), u=(/url\("?([^")]+)/.exec(n.style.backgroundImage)||[])[1], im=new Image(); let da=0;
      const los=()=>{if(da++||!el.isConnected) return; el.classList.add('los'); if(!ruhig) setTimeout(()=>zRolleTeil(el,z,ziel()),JZ_ROLLE)};
      im.src=u||''; (im.decode?im.decode():Promise.resolve()).then(los,los); setTimeout(los,1500)}
    // Version 7.2: Bei einer Sonderausgabe knallt der Stempel drauf, sobald die Zeitung ausgerollt ist.
    const so=z.querySelector('.zsonder'); if(so&&!(b.kopf&&b.kopf.ende)){so.classList.add('stempeln'); setTimeout(()=>{if(so.isConnected) fx('stempel')},ruhig?100:2350)}}
  el.addEventListener('scroll',()=>{ZW.top=el.scrollTop},{passive:true});
  const o=document.createElement('div'); o.className='zrolle oben'; o.addEventListener('click',()=>zGleite(el,0,900)); el.appendChild(o);
  z.addEventListener('click',e=>{if(e.target.closest('button'))return; if(z.getBoundingClientRect().bottom<innerHeight*.25) zGleite(el,0,900)});
}
// Seit 14.7.7: Blasen mit eigenem Auslöser (FU_EIGEN) behalten ihn, auch wenn ihre Kennung nach einem Rang aussieht.
if(typeof FUEHRER!=='undefined') for(const id in FUEHRER){const x=fuRang(id); if(x&&!FU_EIGEN[id]) FU_WANN[id]=()=>{const rm=(S.fu.rm||{})[x.r]; return rm!=null&&S.rang>=x.r&&monatNr()>=rm+Math.ceil(fuPlatz(id))-1&&(!FU_BEFOERD[id]||mgrSt(FUEHRER[id].s)>=1)}}
function fuLandZuViel(){
  const a=S.auktion; if(!a||a.phase===0||a.ende||S.rang<R_AUKTION) return false;
  const p=Math.min(...R().sorten.filter(sorteFrei).map(rebenPreis));
  return S.geld-aukNaechstes()<a.ha*HA_REBEN*p;
}
Object.assign(FU_WANN,{
  'r6-5':()=>fuR65Zeit()&&!!S.sektkeller&&!S.sektAnlage,
  'm5':()=>S.fu.h0===0&&kompZahlen().hab>0,
  'm6':fuM6,
  'w1':()=>TAB==='stadt'&&SUB==='amt'&&S.lots.some(fuKabFrueh),
  'w2':()=>TAB==='stadt'&&SUB==='amt'&&fuLandZuViel(),
  'w3':()=>S.fu.w3===monatNr(),
  'w4':()=>TAB==='stadt'&&SUB==='amt'&&S.lots.some(fuReiht),
  'w5':()=>S.monat===4&&(monatNr()>=12||!!S.ein)&&bodenMin()<80,
  'w6':()=>S.lots.some(fuLange),
  'w7':()=>S.geld<0,
  'w8':()=>S.monat===5&&monatNr()>=12&&weinberge().reduce((a,id)=>a+(S.felder[id].reben?S.felder[id].menge||0:0),0)>S.fassraum-fassBelegt(),
  // Seit 13.4.6: w9 warnt nach Maiks Regel, wenn zu viel der Ernte im Wagnis hängt (wagnisWarnung), h1 erklärt das Wagnis beim ersten Mal.
  'w9':()=>!!wagnisWarnung(),
  'h1':()=>S.monat>=7&&S.monat<=9&&weinberge().some(id=>wagnisChance(id)!=null),
  // Seit 13.4.9: h2 und h3 beim ersten angekündigten Los mit kühler Höhenlage und mit steilem Südhang (die Spitzenlage zählt mit).
  'h2':()=>S.rang>=R_AUKTION&&!!S.auktion&&S.auktion.lage==='hoehe',
  'h3':()=>S.rang>=R_AUKTION&&!!S.auktion&&S.auktion.lage==='sued',
  // Version 8.2: r3-4 kommt nicht nach Monaten, sondern sobald der gelbe Punkt der Spende im Rathaus zum ersten Mal leuchtet (November oder Dezember).
  'r3-4':()=>S.monat>=10&&spOffen()>0,
  // Seit 10.2: p1 im Monat nach dem Brief der Weltweinschau (solange sie nicht gewonnen ist), p2 im Monat nach dem Sieg.
  'p1':()=>!!(S.amt&&S.amt.brief&&!S.amt.ehren)&&monatNr()>S.amt.brief,
  'p2':()=>!!(S.amt&&S.amt.ehren)&&monatNr()>(S.amt.ehren.j-START_JAHR)*12+S.amt.ehren.m,
  // Seit 10.3: Amtsantritt (C23), Abschied des alten Winzers (A1), Anlässe (C28).
  'a1':()=>!!(S.amt&&S.amt.im&&!S.amt.alt)&&monatNr()>S.amt.seit&&monatNr()<=S.amt.seit+12,
  'g2-1':()=>genNr()===2&&fuGenFrisch(),
  'm1':()=>fuEhrNeu(e=>!!MED_NAME[e.i]),
  'm2':()=>S.fu.auk!=null&&monatNr()-S.fu.auk<=1,
  'm3':()=>genNr()>=3&&fuGenFrisch(),
  'm4':()=>fuEhrNeu(e=>e.i==='🏆')
});
// "Zeig mir, wo": Ort und was dort golden leuchtet. sel ist eine Liste, die erste Stelle, die es gibt, gilt.
// Bei Fenster-Tipps leuchtet das i (Regel 3), bei den Kern-Blasen der Knopf selbst.
const fiSel=id=>`[data-a="fi"][data-id="${id}"]`;
const FU_ZEIG={
  // Seit 12.6: e1-0a ohne Ziel, e1-01 führt in den Weinberg.
  'e1-01':{tab:'gut',sub:'berg',sel:['#subs [data-id="berg"]']},
  'e1-02':{tab:'stadt',sub:'arbeit',sel:[fiSel('helfer'),fiSel('lagerarb')]},
  'e1-03':{tab:'gut',sub:'berg',sel:['[data-a="fi"][data-id^="feld_"]']},
  'e1-04':{sel:['#weiter']},
  'e1-05':{tab:'gut',sub:'aktuell',sel:[fiSel('ansteht')]},
  'e1-06':{sel:['#top .geld']},
  'e1-07':{tab:'gut',sub:'berg',sel:['[data-a="pflanzen"]','[data-a="fi"][data-id^="feld_"]']},
  'e1-08':{sel:['#top .wtr']},
  'e1-09':{tab:'gut',sub:'berg',sel:[fiSel('duengung')]},
  'e1-10':{tab:'keller',sub:'lager',sel:[fiSel('faesser')]},
  'e1-11':{tab:'gut',sub:'berg',sel:['[data-a="fi"][data-id^="feld_"]']},
  'e1-12':{tab:'gut',sub:'berg',sel:['[data-a="lesen"]','[data-a="fi"][data-id^="feld_"]']},
  'e1-13':{tab:'keller',sub:'start',sel:['[data-a="keltern"]']},
  'e1-14':{tab:'stadt',sub:'amt',sel:['[data-a="anmelden"]',fiSel('anmelden')]},
  'e1-15':{tab:'keller',sub:'start',sel:['[data-a="abfuellen"]','[data-a="anmelden"]']},
  'e1-16':{tab:'stadt',sub:'handel',sel:['[data-a="verkaufen"]']},
  'e1-17':{tab:'gut',sub:'berg',sel:['[data-a="lesen"]','[data-a="fi"][data-id^="feld_"]']},
  'e1-18':{tab:'gut',sub:'berg',sel:['[data-a="lesen"]','[data-a="fi"][data-id^="feld_"]']},
  'z2-01':{tab:'stadt',sub:'amt',sel:['[data-a="anmelden"]',fiSel('anmelden')]},
  'e1-19':{tab:'gut',sub:'aktuell',sel:['[data-a="weiterBis"]']},
  'k01':{tab:'gut',sub:'aktuell',sel:['[data-a="weiterBis"]']},
  'z2-02':{tab:'gut',sub:'berg',sel:['[data-a="pflanzen"]','[data-a="fi"][data-id^="feld_"]']},
  'z2-03':{tab:'keller',sub:'buch',sel:['.bzeile[data-a="buchDetail"]','[data-a="archiv"][data-id="brett"]']},
  'z2-04':{tab:'stadt',sub:'bank',sel:[fiSel('kredit')]},
  'z2-05':{tab:'stadt',sub:'laeden',sel:[fiSel('laeden'),'#subs [data-id="laeden"]']},
  'z2-06':{tab:'gut',sub:'aktuell',sel:[fiSel('rang')]},
  'z2-07':{tab:'gut',sub:'berg',sel:['[data-a="lesen"]','[data-a="fi"][data-id^="feld_"]']},
  'z2-08':{tab:'keller',sub:'buch',sel:['.bzeile[data-a="buchDetail"]','[data-a="archiv"][data-id="brett"]']},
  // Paket B: Rang-Neuheiten. Beim Befördern leuchtet der Knopf des Managers im Arbeitsamt.
  'r3-1':{tab:'stadt',sub:'amt',sel:[fiSel('auktionen'),fiSel('makler')]},
  'r3-2':{tab:'gut',sub:'berg',sel:['[data-a="fi"][data-id^="feld_"]']},
  'r3-3':{tab:'keller',sub:'lager',sel:[fiSel('ausbau')]},
  'r3-4':{tab:'stadt',sub:'amt',sel:[fiSel('spenden')]},
  'r4-1':{tab:'stadt',sub:'arbeit',sel:[fiSel('mgr_amt')]},
  'r4-2':{tab:'stadt',sub:'handel',sel:[fiSel('markt')]},
  'r4-3':{tab:'keller',sub:'start',sel:[fiSel('sekt')]},
  'r4-4':{tab:'gut',sub:'maschinen',sel:[fiSel('kauf_duenger')]},
  'r5-1':{tab:'stadt',sub:'arbeit',sel:[fiSel('lagerarb')]},   // seit 14.7.7 die Kellerleute, wie r7-3 und r10-3
  'r5-2':{tab:'stadt',sub:'amt',sel:[fiSel('wettb')]},
  'r5-3':{tab:'gut',sub:'betrieb',sel:[fiSel('fest')]},
  'r5-4':{tab:'gut',sub:'maschinen',sel:[fiSel('kauf_klein')]},
  'r6-1':{tab:'stadt',sub:'arbeit',sel:[fiSel('mgr_amt')]},
  'r6-2':{tab:'gut',sub:'berg',sel:['[data-a="fi"][data-id^="feld_"]']},
  'r6-3':{tab:'gut',sub:'maschinen',sel:[fiSel('kauf_laub')]},
  'r6-4':{tab:'stadt',sub:'arbeit',sel:['[data-a="mgrStufe"][data-id="handel"]',fiSel('mgr_amt')]},
  'r6-5':{tab:'keller',sub:'start',sel:['[data-a="sektAnlage"]',fiSel('sekt')]},
  'r7-1':{tab:'stadt',sub:'amt',sel:[fiSel('wettb')]},
  'r7-2':{tab:'gut',sub:'maschinen',sel:[fiSel('kauf_gross')]},
  'r7-3':{tab:'stadt',sub:'arbeit',sel:[fiSel('lagerarb')]},
  'r8-1':{tab:'stadt',sub:'laeden',sel:[fiSel('regalRein'),fiSel('regal')]},
  'r8-2':{tab:'gut',sub:'maschinen',sel:[fiSel('kauf_abfuell')]},
  'r8-3':{tab:'stadt',sub:'arbeit',sel:['[data-a="mgrStufe"][data-id="weingut"]',fiSel('mgr_amt')]},
  'r8-4':{tab:'gut',sub:'buero',sel:[fiSel('botschafter')]},
  'r9-1':{tab:'gut',sub:'betrieb',sel:[fiSel('fest')]},
  'r9-2':{tab:'stadt',sub:'arbeit',sel:['[data-a="mgrStufe"][data-id="handel"]',fiSel('mgr_amt')]},
  'r9-3':{tab:'stadt',sub:'amt',sel:[fiSel('anreg')]},
  'r10-1':{tab:'stadt',sub:'amt',sel:[fiSel('auktionen')]},
  'p1':{tab:'stadt',sub:'amt',sel:[fiSel('wettb')]},
  'a1':{tab:'stadt',sub:'amt',sel:[fiSel('verband')]},
  'm1':{tab:'gut',sub:'buero',sel:[fiSel('urkunden')]},
  'm2':{tab:'stadt',sub:'amt',sel:[fiSel('makler'),fiSel('auktionen')]},
  'm3':{tab:'keller',sub:'buch',sel:['.bzeile[data-a="buchDetail"]','[data-a="archiv"][data-id="brett"]']},
  'm4':{tab:'stadt',sub:'amt',sel:[fiSel('wettb')]},
  // Seit 12.8: archiv schlägt im Weinarchiv gleich das Siegelbrett auf.
  'm5':{tab:'keller',sub:'buch',archiv:'brett',sel:[fiSel('brett')]},
  'm6':{tab:'keller',sub:'buch',archiv:'brett',sel:['.album',fiSel('brett')]},
  'p2':{tab:'stadt',sub:'amt',sel:[fiSel('verband')]},
  'r10-2':{tab:'stadt',sub:'arbeit',sel:['[data-a="mgrStufe"][data-id="weingut"]',fiSel('mgr_amt')]},
  'r10-3':{tab:'stadt',sub:'arbeit',sel:[fiSel('lagerarb')]},
  // Seit 14.7.7: die Figur draußen und Einsatzplan und Chefsache beim Weingut-Manager.
  'l1':{tab:'stadt',sub:'arbeit',sel:[fiSel('helfer')]},
  'l4':{tab:'gut',sub:'betrieb',sel:[fiSel('p_weingut')]},
  'l5':{tab:'gut',sub:'betrieb',sel:[fiSel('p_weingut')]},
  // Warnungen: sel darf eine Funktion sein, dann leuchtet genau das betroffene Fass.
  'w1':{tab:'stadt',sub:'amt',sel:()=>{const l=S.lots.find(fuKabFrueh); return [l?`[data-a="anmelden"][data-id="${l.id}"]`:'',fiSel('anmelden')]}},
  'w2':{tab:'stadt',sub:'amt',sel:[fiSel('auktionen')]},
  'w3':{tab:'stadt',sub:'handel',sel:[fiSel('markt')]},
  'w4':{tab:'stadt',sub:'amt',sel:()=>{const l=S.lots.find(fuReiht); return [l?`[data-a="anmelden"][data-id="${l.id}"]`:'',fiSel('anmelden')]}},
  'w5':{tab:'gut',sub:'berg',sel:[fiSel('duengung')]},
  'w6':{tab:'keller',sub:'buch',sel:()=>{const l=S.lots.find(fuLange); return [l?`.bzeile[data-a="buchDetail"][data-id="${l.id}"]`:'','[data-a="archiv"][data-id="brett"]']}},
  'w7':{tab:'stadt',sub:'bank',sel:[fiSel('kredit')]},
  'w8':{tab:'keller',sub:'lager',sel:[fiSel('faesser')]},
  'w9':{tab:'gut',sub:'berg',sel:['[data-a="lesen"]','[data-a="fi"][data-id^="feld_"]']},
  'h1':{tab:'gut',sub:'berg',sel:['[data-a="lesen"]','[data-a="fi"][data-id^="feld_"]']},
  'h2':{tab:'stadt',sub:'amt',sel:[fiSel('auktionen')]},
  'h3':{tab:'stadt',sub:'amt',sel:[fiSel('auktionen')]},
  // Kniffe
  'k02':{tab:'keller',sub:'lager',sel:[fiSel('faesser')]},
  'k03':{tab:'keller',sub:'buch',sel:['[data-a="archiv"][data-id="brett"]']},
  'k04':{tab:'gut',sub:'berg',sel:['[data-a="lesen"]','[data-a="fi"][data-id^="feld_"]']},
  'k05':{tab:'gut',sub:'berg',sel:[fiSel('gebiet')]},
  'k06':{tab:'gut',sub:'maschinen',sel:[fiSel('maschinen')]},
  'k07':{tab:'gut',sub:'betrieb',sel:[fiSel('p_handel')]},
  'k08':{tab:'keller',sub:'sabotage',sel:[fiSel('zuckern'),'#subs [data-id="sabotage"]']},
  'k09':{tab:'gut',sub:'buero',sel:[fiSel('rangliste')]},
  'k10':{tab:'gut',sub:'buero',sel:[fiSel('urkunden')]},
  'k11':{tab:'gut',sub:'buero',sel:[fiSel('chronik')]},
  'k12':{sel:['#top .wtr']}
};
// Je zwei Sätze ein Absatz, damit lange Tipps am Handy lesbar bleiben.
function fuAbsaetze(t){
  const s=t.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„"])/), P=[];
  for(let i=0;i<s.length;i+=2) P.push(s.slice(i,i+2).join(' '));
  return P.map(p=>`<p>${esc(p)}</p>`).join('');
}
// FU_PAUSE: Nach "Zeig mir, wo" wartet die nächste Blase, bis der Spieler selbst etwas antippt, damit sie den leuchtenden Knopf nicht verdeckt.
// Seit 10.3: FU_WO = bei der Blase wurde "Zeig mir, wo" getippt (gilt als gelesen), FU_ZM = Monat, in dem sie aufging,
// FU_SPAET = abgelegte Kern-Blasen und Warnungen mit ihrem Monat, sie kommen erst im nächsten Monat wieder.
// Seit 12.7: FU_OFFEN = Blase offen, FU_VL = Verlauf beim Öffnen, FU_FILTER = 'alle' oder ein Sprecher, FU_POS = Stelle in der gefilterten Liste (hinten der neueste).
let FU_AKT=null, FU_RUHE=0, FU_UHR=null, FU_PAUSE=false, FU_OFFEN=false, FU_WO=false, FU_ZM=-1, FU_SPAET={}, FU_VL=null, FU_FILTER='alle', FU_POS=0;
function fuBlaseZu(){
  ['#fuehrer','#fdunkel'].forEach(q=>{const x=$(q); if(x) x.remove()}); document.querySelectorAll('.fkreis').forEach(x=>x.remove());
  document.body.classList.remove('fuoffen'); FU_OFFEN=false; FU_VL=null; fuKopfStell();
}
// Seit 12.6.2 (Maik 20.11.2026): Ein grüner Punkt zeigt den Weg der offenen Blase, erst am Hauptreiter, dann am Unterreiter, am Ziel ist er weg.
// Er sitzt links, damit Rot und Gelb aus "Das steht an" rechts daneben sichtbar bleiben. Gilt auch, solange die Blase als Kopf am Rand wartet.
function fuPunkt(){
  const d=$('#dock'); if(!d) return; d.querySelectorAll('.badge.gruen').forEach(x=>x.remove());
  const z=FU_AKT&&FU_ZEIG[FU_AKT]; if(!z||!z.tab||!SUBS[TAB]) return;
  const el=TAB!==z.tab?d.querySelector(`#tabs [data-id="${z.tab}"]`):z.sub&&SUB!==z.sub?d.querySelector(`#subs [data-id="${z.sub}"]`):null;
  if(el) el.insertAdjacentHTML('beforeend','<span class="badge gruen"></span>');
}
// Seit 12.7.1 (Maik 21.11.2026): Der Kopf in der Statusleiste zeigt den, der zuletzt gesprochen hat, bei offener Blase den Sprecher des Tipps,
// der gerade darin steht. 💬, solange der neue Tipp noch nicht mit "Verstanden" oder "Zeig mir, wo" gelesen ist. Leuchtet, solange die Blase offen ist.
function fuKopfStell(){
  const k=$('#tkopf'); if(!k||!S||!S.fu) return;
  const x=FU_OFFEN&&FU_VL?fuListe()[FU_POS]:null, V=x?null:fuVerlauf();
  const s=x?x.s:V.length?V[V.length-1].s:fuStandSp(), P=FU_SPRECHER[s]||FU_SPRECHER.winzer;
  k.classList.toggle('offen',FU_OFFEN);
  k.style.backgroundImage=P.bild?`url(bilder/${P.bild}.jpg)`:'none';
  k.setAttribute('aria-label',P.name+(FU_OFFEN?': Blase zuklappen':': Tipps öffnen'));
  k.innerHTML=(P.bild?'':P.sym||'📜')+(FU_AKT&&!FU_WO&&!FU_OFFEN?'<b>💬</b>':'');
}
// Bleiben neben dem Kopf weniger als 6 Pixel Luft, wird links der Monat abgekürzt ("Sep. 2068") und rechts der Rang ausgeblendet. Nach jedem render() einmal.
function fuTopMess(){
  const t=$('#top'), k=$('#tkopf'); if(!t||!k) return;
  const w=t.querySelector('.wtr'), g=t.querySelector('.geld'), kr=k.getBoundingClientRect(), rg=g&&g.querySelector('small');
  if(rg){rg.style.display=''; if(g.getBoundingClientRect().left-kr.right<6) rg.style.display='none'}
  const mb=w&&w.querySelector('b'); if(mb&&kr.left-w.getBoundingClientRect().right<6) mb.textContent=mb.textContent.replace(/^(\S{3})\S{2,}/,'$1.');
}
// Öffnet die Blase beim neuesten Eintrag mit "Alle" (Entscheidung 10: "31 von 31", ‹ geht zurück in der Zeit).
function fuOeffne(){
  FU_VL=fuVerlauf(); FU_FILTER='alle'; FU_POS=FU_VL.length-1; FU_OFFEN=true;
  if(!$('#fuehrer')){
    for(let i=1;i<=3;i++){const c=document.createElement('i'); c.className='fkreis k'+i; document.body.appendChild(c)}
    const el=document.createElement('div'); el.id='fuehrer'; el.setAttribute('role','dialog'); document.body.appendChild(el);
  }
  document.body.classList.add('fuoffen'); fuBlase(); fuKopfStell();
}
// Inhalt der Blase für den Eintrag an FU_POS: Leiste mit Gesichtern, Name und Kurzname, Text, Knöpfe und Blättern.
function fuBlase(){
  const el=$('#fuehrer'); if(!el) return;
  const L=fuListe(), x=L[FU_POS];
  let d=$('#fdunkel');
  if(!x){
    const P=FU_SPRECHER[fuStandSp()]; el.setAttribute('aria-label',P.name); if(d) d.remove();
    el.innerHTML=`<div class="fnamen"><div><b class="fname">${P.name}</b><span class="frolle">${P.rolle}</span></div></div>
      <div class="ftext"><p class="fnix">Noch keine Tipps. Sobald etwas ansteht, melde ich mich hier.</p></div><div class="fschatten">▼ weiter unten mehr</div>
      <div class="fknopf"><button class="klein sec" data-a="fuZu">Zuklappen</button></div>`;
    return fuLage();
  }
  const b=FUEHRER[x.id], P=FU_SPRECHER[x.s]||FU_SPRECHER.winzer, text=fuText(b[x.k]||b.t,x.c), akt=x.id===FU_AKT;
  // Entscheidung 11: Die Leiste mit den Gesichtern erst ab zwei Sprechern, nur wer schon gesprochen hat.
  const sp=[...new Set(FU_VL.map(v=>v.s))];
  const leiste=sp.length<2?'':`<div class="fleiste"><button class="alle${FU_FILTER==='alle'?' an':''}" data-a="fuFilter" data-id="alle">Alle</button>${sp.map(s=>{const Q=FU_SPRECHER[s]||FU_SPRECHER.winzer;
    return `<button class="gesicht${FU_FILTER===s?' an':''}" data-a="fuFilter" data-id="${s}" aria-label="${Q.name}" title="${Q.name}"${Q.bild?` style="background-image:url(bilder/${Q.bild}.jpg)"`:''}>${Q.bild?'':Q.sym||'📜'}</button>`}).join('')}</div>`;
  el.setAttribute('aria-label',P.name);
  el.innerHTML=`${leiste}<div class="fnamen"><div><b class="fname">${P.name}</b><span class="frolle">${esc(b.n||P.rolle)}</span></div>${akt&&!FU_WO?'<span class="fneu">Neu</span>':''}</div>
    <div class="ftext">${fuAbsaetze(text)}</div><div class="fschatten">▼ weiter unten mehr</div>
    <div class="fknopf">${FU_ZEIG[x.id]?`<button class="klein" data-a="fuWo" data-id="${x.id}">Zeig mir, wo</button>`:''}${akt?`<button class="klein" data-a="fuOk">${x.id==='e1-0a'&&FU_ZEIG[x.id]?'Bleib ruhig da':'Verstanden'}</button>`:'<button class="klein sec" data-a="fuZu">Zuklappen</button>'}</div>
    ${b.b?`<span class="fbuch" data-a="fuBuch" data-id="${b.b}">📖 Mehr im Buch</span>`:''}
    <div class="fblatt"><button data-a="fuBlatt" data-id="-1" aria-label="Älterer Tipp"${FU_POS<=0?' disabled':''}>‹</button><span>${FU_POS+1} von ${L.length}</span><button data-a="fuBlatt" data-id="1" aria-label="Neuerer Tipp"${FU_POS>=L.length-1?' disabled':''}>›</button></div>`;
  // Lange Tipps dunkeln das Spiel dahinter ab wie bisher.
  if(text.length>=FU_LANG){if(!d){d=document.createElement('div'); d.id='fdunkel'; document.body.appendChild(d)}} else if(d) d.remove();
  fuLage();
}
// Lage von Kreisen und Blase unter dem Kopf, der Text darf bis kurz vor den unteren Rand reichen, sonst scrollt er.
function fuLage(){
  const k=$('#tkopf'), el=$('#fuehrer'); if(!k||!el) return;
  const r=k.getBoundingClientRect(), mx=r.left+r.width/2, ky=r.bottom;
  document.querySelectorAll('.fkreis').forEach((c,i)=>{const [w,dx,dy]=[[8,10,4],[12,18,14],[17,10,28]][i]; c.style.left=(mx+dx-w/2)+'px'; c.style.top=(ky+dy)+'px'});
  el.style.top=(ky+50)+'px';
  const t=el.querySelector('.ftext'), sch=el.querySelector('.fschatten'); if(!t) return;
  t.style.maxHeight='none'; const rest=el.offsetHeight-t.offsetHeight; t.style.maxHeight=Math.max(140,innerHeight-(ky+50)-rest-12)+'px';
  const pruef=()=>{sch.style.display=t.scrollHeight>t.clientHeight+4?'':'none'; sch.style.opacity=t.scrollTop+t.clientHeight>=t.scrollHeight-4?0:1};
  t.onscroll=pruef; pruef();
}
addEventListener('resize',()=>{fuTopMess(); if(FU_OFFEN) fuLage()});
function fuehrerZeig(){
  if(!fuBereit()) return fuehrerWeg();
  if(!SUBS[TAB]) return fuehrerWeg();
  // Seit 10.3 (C1): Nur eine offene Blase hält die nächste auf. Ein geparkter Kopf macht Platz, sobald eine andere Blase dran ist.
  if(FU_OFFEN||FU_PAUSE||$('#sheet').classList.contains('an')||$('#titel').classList.contains('an')||$('#buch').classList.contains('an')||S.pleite||S.pruefer||erbeOffen()) return;
  fuehrerPruef();
  const id=fuNaechste(); if(!id) return;
  const w=FU_RUHE-Date.now(); if(w>0){clearTimeout(FU_UHR); FU_UHR=setTimeout(fuehrerZeig,w+20); return}
  if(FU_AKT) fuAblegen();
  // Seit 12.7.2: Der Sprecher wird gemerkt, damit der Verlauf den Tipp später mit demselben Gesicht und Text zeigt.
  const sp=fuSprecher(id); S.fu.sp=S.fu.sp||{}; S.fu.sp[id]={s:sp.s,...(sp.k?{k:sp.k}:{}),...(sp.chef?{c:1}:{})};
  FU_AKT=id; FU_ZM=monatNr(); FU_WO=false;
  fuOeffne();
  fuPunkt(); fx('menue');
}
// Fenster "Spielführer" im Büro (Paket B): drei Stellungen und "Tipps von vorn".
function fuFenster(){
  const f=S.fu||fuNeu(), st=!f.an?'aus':f.nur?'neu':'alle';
  const W=[['alle','💬 Alle Tipps'],['neu','🎓 Nur Neuheiten und Warnungen'],['aus','🔕 Aus']];
  return fenster('fuehrer','Spielführer',W.map(([k,x])=>`<button class="wahl schalter ${st===k?'an':''}" data-a="fuStell" data-id="${k}">${st===k?'✅':'⬜'} ${x}</button>`).join(''),{
    links:'Warnungen und Kniffe noch einmal',kn:pk('fuVorn','Tipps von vorn','',{sec:1,aus:!f.an}),buch:'fuehrer',
    i:'Der alte Winzer und, sobald sie da sind, deine zwei Manager und deine Leute draußen und im Keller melden sich in einer Sprechblase: wenn etwas zum ersten Mal ansteht, nach jedem Aufstieg, bei typischen Fehlern und ab dem dritten Jahr ab und zu mit einem Kniff. Der alte Winzer verabschiedet sich nach der ersten Übergabe an dein Kind, danach sprechen nur noch die Manager. Das Gesicht dessen, der zuletzt gesprochen hat, sitzt oben in der Mitte der Leiste, mit 💬, solange ein neuer Tipp ungelesen ist. Ein Tipp darauf öffnet die Blase jederzeit, noch ein Tipp, ein Tipp daneben oder „Zeig mir, wo“ klappt sie zu. Unten in der Blase blätterst du mit ‹ und › durch alle Tipps, die schon dran waren, ab zwei Sprechern zeigen die Gesichter oben in der Blase nur die Tipps von einem. „Alle Tipps“ ist für Neulinge, „Nur Neuheiten und Warnungen“ für alle, die das Spiel kennen. Mit allen Tipps gibt es ⏩ „Weiter bis etwas ansteht“ erst ab dem zweiten Jahr. „Tipps von vorn“ holt Warnungen und Kniffe zurück, in den ersten zwei Jahren auch den Rest des Fahrplans, und leert den Verlauf. Bei „Aus“ verschwindet auch das Gesicht oben.'});
}
function fuLeuchte(z){
  const el=(typeof z.sel==='function'?z.sel():z.sel||[]).filter(Boolean).map(s=>document.querySelector(s)).find(Boolean); if(!el) return;
  if(!el.closest('#top,#dock')) el.scrollIntoView({block:'center',behavior:'smooth'});
  el.classList.remove('fleuchte'); void el.offsetWidth; el.classList.add('fleuchte');
  setTimeout(()=>el.classList.remove('fleuchte'),4200);
}

function render(){
  if(S&&typeof chefNorm==='function') chefNorm();
  if(!S){fuehrerWeg(); FU_PAUSE=false; ortFarbe('gut'); ORT_ALT=null; musikOrt(musikWahl()); $('#app').innerHTML=START==='neu'||![0,1,2].some(i=>roh(i))?vStart():vSlots(); return}
  // Seit 10.1: Ein abgeschlossener Spielstand zeigt nur noch die letzte Ausgabe vom Winzerboten und danach die Chronik.
  if(S.ende&&TAB!=='monat'&&!(TAB==='feier'&&endeFeier())) TAB='ende';
  einPruef(); fuehrerPruef(); fuErlCheck();
  // Seit 10.3: Beim Monatswechsel wird ein Kopf abgelegt (fuAblegen), Kern-Blasen und Warnungen kommen danach wieder. Eine offene Blase kommt ohnehin wieder.
  if(!SUBS[TAB]){if(FU_AKT&&!FU_OFFEN) fuAblegen(); else fuehrerWeg()}
  if(SUBS[TAB]&&!SUBS[TAB].some(s=>s[0]===SUB)) SUB=START_SUB[TAB];
  // Kellerbuch und Aktuelles öffnen sich mit einem eigenen Geräusch.
  ortFarbe(SUBS[TAB]?TAB:'gut');
  const ort=SUBS[TAB]?TAB+'/'+SUB:TAB; if(ort!==ORT_ALT){FI_AUF.clear(); if(ORT_ALT&&(ort==='keller/buch'||ort==='gut/aktuell')) fx('menue'); ORT_ALT=ort}
  musikOrt(musikWahl());
  if(ort==='stadt/laeden') S.ladenSeh=S.jahr*12+S.monat;
  const fehlt=fehlText(), v={monat:vMonat,feier:vFeier,gut:vGut,keller:vKeller,stadt:vStadt,ende:vEnde}[TAB]();
  if(TAB==='ende'){$('#app').innerHTML=v; return}
  if(TAB==='feier'){$('#app').innerHTML=v; feierStart(); return}
  const tabs=[['gut','🏡','Weingut'],['keller',FASS,'Kellerei'],['stadt','🏛️','Stadt']], B=badges();
  if(TAB==='monat'){$('#app').innerHTML=v; zWehen(); return}
  // Seit 12.7 (Maik 21.11.2026): Gebiet und Ansehen fliegen aus der Statusleiste, rechts steht nur noch der Rang, in der Mitte sitzt der Kopf des Spielführers.
  $('#app').innerHTML=`<div id="top"><div class="wtr" data-a="wetterInfo"><b>${MON[S.monat]} ${S.jahr}</b><small>${wetterText()}</small></div>${fuBereit()?'<button id="tkopf" data-a="fuKopf"></button>':''}<div class="geld" data-a="geldInfo"><b>${geldKurz(S.geld)}</b><small>${duK()}</small></div></div>
  <main>${v}</main>
  <nav id="dock">${SUBS[TAB]?`<div id="subs">${SUBS[TAB].map(s=>`<button class="${SUB===s[0]?'an':''}" data-a="sub" data-id="${s[0]}"><i>${s[1]}</i><b>${SUB_NAME[s[0]]}</b>${SUB===s[0]?'':badge(B[TAB+'/'+s[0]])}</button>`).join('')}</div>`:''}<div id="tabs">${tabs.map(t=>`<button class="${TAB===t[0]?'an':''}" data-a="tab" data-id="${t[0]}"><span>${t[1]}</span>${t[2]}${badge(B[t[0]])}</button>`).join('')}<button id="weiter" class="${fehlt?'zu':''}" data-a="weiter"><span>${fehlt?'🔒':'▶'}</span>${fehlt?'Leute fehlen':'Nächster Monat'}</button></div></nav>`;
  panoStell(); wgStart();
  fuKopfStell(); fuTopMess(); if(FU_OFFEN) fuLage();
  fuehrerZeig(); fuPunkt();
  mgrVorstellen();
}

/* ================= Dialoge ================= */
// musik: Stück, das läuft, solange das Fenster offen ist. bild: Bild oben in der Meldung.
function openSheet(h,musik){$('#sheet').innerHTML=`<div>${h}</div>`;$('#sheet').classList.add('an');SMUSIK=musik||null;musikOrt(musikWahl())}
function closeSheet(){$('#sheet').classList.remove('an');$('#sheet').innerHTML='';SL=null;SMUSIK=null;musikOrt(musikWahl());setTimeout(fuehrerZeig,0)}
// Seit dem Nachtrag zu 14.5.2 (Annahme 34): Nachfrage im Sommer, Lehrjahre mit Rat in Zahlen, Gesellenjahre mit kurzem Hinweis (SOMMER_FRAGE).
// Je Weinberg ein Knopf für die Arbeit, darunter "Weiter ohne". Platzhalter, Wortlaut in Meilenstein 17.
function zeigeSommerFrage(F){const A=SOMMER_ARBEIT[F[0].art], rat=SOMMER_FRAGE[S.schwer]==='rat', pz=x=>`${Math.round(x*100)} %`;
  const satz=x=>(rat?SOMMER_RAT:SOMMER_HINWEIS).replace('{sorte}',SORTEN[x.id].name).replace('{arbeit}',A.name).replace('{q}',x.q).replace('{vor}',x.vor)
    .replace('{stufe}',STUFEN[x.st].name).replace('{ans}',ANSPRUCH[x.st]).replace('{kosten}',eur(x.kosten)).replace('{menge}',A.menge.replace('{m}',pz(x.art==='laub'?LAUB_MENGE:AUSD_MENGE)));
  openSheet(`<h3>${esc(A.titel)}?</h3>${F.map(x=>`<p>${esc(satz(x))}</p><div class="mitte"><button class="klein" data-a="${x.art==='laub'?'sommerHand':'ausduennen'}" data-id="${x.id}" ${S.geld<x.kosten?'disabled':''}>${esc(A.name)}: ${esc(SORTEN[x.id].name)}</button></div>`).join('')}
    ${rat?`<p class="mut">${esc(SOMMER_FUSS)}</p>`:''}<div class="btns"><button class="sec" data-a="close">Zurück</button><button data-a="sommerOhne">Weiter ohne</button></div>`)}
function meldung(t,text,bild){openSheet(`${bild?sbild(bild):''}<h3>${esc(t)}</h3><p>${esc(text)}</p><div class="mitte"><button class="siegel" data-a="close">Okay</button></div>`)}
let SL=null;
function mengeSheet(o){
  SL=o; const st=o.step||1, rs=o.rangeStep||st, max=Math.floor(o.max/rs)*rs;
  openSheet(`${o.bild?sbild(o.bild):''}<h3>${esc(o.titel)}</h3>${o.text?`<p class="mut">${o.text}</p>`:''}<div class="slval" id="slv"></div>
  <input type="range" id="slr" min="${o.min||0}" max="${max}" step="${rs}" data-st="${st}" value="${Math.min(max,o.start==null?max:o.start)}">
  ${o.wahl?`<div class="chips swahl">${o.wahl.map(([w,x])=>`<button class="chip${w===o.w?' an':''}" data-a="slWahl" data-id="${w}">${x}</button>`).join('')}</div>`:''}
  <div class="btns"><button class="klein" data-a="slMinus">− ${(o.zahl||num)(st)}</button><button class="klein" data-a="slPlus">+ ${(o.zahl||num)(st)}</button></div>
  <div class="btns"><button class="sec" data-a="close">Abbrechen</button><button id="slok" ${o.wag?'class="wag" ':''}data-a="slOk">${esc(o.okText)}</button></div>`);
  $('#slr').addEventListener('input',slUpd); slUpd();
}
function slUpd(){if(!SL)return;const n=+$('#slr').value;$('#slv').innerHTML=SL.info(n);$('#slok').disabled=n<=0}
// Hinweis mit dem direkten Weg zum Arbeitsamt, für alles, was an fehlenden Leuten scheitert. text ist fertiges HTML.
function leuteSheet(titel,text){openSheet(`${sbild('arbeit')}<h3>${esc(titel)}</h3>${text}
  <div class="kv"><span>Angebot Erntehelfer</span>${lohnAngebot('helfer')}</div><div class="kv"><span>Angebot Kellerleute</span>${lohnAngebot('lagerarb')}</div>
  <div class="btns"><button class="sec" data-a="close">Zurück</button><button data-a="arbeitsamt">Zum Arbeitsamt</button></div>`)}

/* ================= Aktionen ================= */
const AKT={
  buch(d){BUCH=d.id||''; buchZeig()},
  buchZu(){BUCH=null; buchZeig(); fuehrerZeig()},
  // Version 8.1: Knöpfe der Sprechblase. "Zeig mir, wo" springt zum Ort und lässt dort golden leuchten, aufgeklappt wird nichts.
  fuOk(){fuFertig(); FU_RUHE=Date.now()+350; fuehrerZeig()},
  fuStell(d){const f=S.fu; f.an=d.id==='aus'?0:1; f.nur=d.id==='neu'?1:0;
    // Seit 10.3 (C21): Wer ab dem dritten Jahr auf "Alle Tipps" stellt, bekommt den Fahrplan der ersten zwei Jahre nicht nachgeliefert.
    if(d.id==='alle'&&monatNr()>=24){FU_PLAN.forEach(id=>{if(!f.ges.includes(id)) f.ges.push(id)}); f.q=f.q.filter(id=>!FU_PLAN.includes(id))}
    if(!f.an){FU_PAUSE=false; fuehrerWeg()} else if(FU_AKT&&!fuErlaubt(FU_AKT)) fuehrerWeg(); save(); const y=window.scrollY; render(); window.scrollTo(0,y)},
  // Seit 12.7.2: "Tipps von vorn" leert auch den Verlauf (vl), was fuAlt als erledigt einträgt, zählt nicht mit.
  fuVorn(){const f=S.fu; if(!f||!f.an) return; const n=fuAlt(); n.an=f.an; n.nur=f.nur; n.geld=f.geld; n.rm=f.rm||{};
    // Seit 12.8: Die Siegel-Blasen sind Anlässe und kommen nicht noch einmal.
    n.h0=f.h0; n.m5m=f.m5m; for(const id of ['m5','m6']) if(f.ges.includes(id)&&!n.ges.includes(id)) n.ges.push(id); n.vl=n.ges.length; n.sp={}; S.fu=n; fuehrerWeg(); FU_PAUSE=false; save(); render();
    meldung('Tipps von vorn','Warnungen und Kniffe kommen wieder, sobald sie passen. In den ersten zwei Jahren kommt auch der Rest des Fahrplans.')},
  // Seit 10.2.1: "Zeig mir, wo" klappt die Blase zum Kopf zusammen, statt sie abzuhaken. Weg ist sie erst mit "Verstanden" oder wenn die Aufgabe erledigt ist.
  // Seit 12.7: "Zeig mir, wo" geht auch bei älteren Tipps aus dem Verlauf. Beim neuen Tipp gilt er damit als gelesen (FU_WO).
  fuWo(d){const id=d&&d.id||FU_AKT, z=FU_ZEIG[id]; if(!z) return; fuBlaseZu(); if(id===FU_AKT) FU_WO=true; FU_PAUSE=true; fuKopfStell(); if(z.tab){geh(z.tab,z.sub); if(z.sub==='buch') ARCHIV=z.archiv||'weine'; if(z.sub==='buero'){const m=/data-id="(\w+)"/.exec((z.sel||[])[0]||''); if(m&&BUERO_WO[m[1]]) BUERO=BUERO_WO[m[1]]} render(); window.scrollTo(0,0)} setTimeout(()=>fuLeuchte(z),z.tab?120:0)},
  // Seit 12.7 (Maik 20.11.2026): Ein Tipp auf den Kopf in der Statusleiste öffnet die Blase jederzeit, noch ein Tipp klappt sie zu.
  // Wie ein Tipp daneben: Wer zuklappt, bekommt den nächsten Tipp erst mit dem Tipp danach (FU_PAUSE).
  fuKopf(){if(FU_OFFEN){fuBlaseZu(); FU_PAUSE=true} else fuOeffne()},
  fuZu(){fuBlaseZu(); FU_PAUSE=true},
  // Blättern: ‹ zurück in der Zeit, › stößt beim neuesten an die Wand. Der Kopf oben wechselt das Gesicht (Entscheidung 13).
  fuBlatt(d){const L=fuListe(); FU_POS=clamp(FU_POS+(+d.id),0,L.length-1); fuBlase(); fuKopfStell()},
  // Leiste mit Gesichtern: zeigt nur die Tipps dieses Sprechers, beim neuesten.
  fuFilter(d){FU_FILTER=d.id; FU_POS=fuListe().length-1; fuBlase(); fuKopfStell()},
  fuBuch(d){BUCH=d.id||''; buchZeig()},
  // Seit 8.0.1 "Dein Stand" statt "Deine Kasse": Kasse, Bis zum nächsten Rang (alle drei Bedingungen mit Balken wie in vRang) und die Rangleiter.
  geldInfo(){if(S.fu&&!S.fu.geld){S.fu.geld=1; save()} const K=kosten(), k=S.kredit, kv=(a,x,c)=>`<div class="kv"><span>${a}</span><span class="${c||''}">${x}</span></div>`, n=RAENGE[S.rang+1];
    let ziel='';
    if(n){const v=vermoegen(), bep=flaecheBep(), w=(ist,soll)=>clamp(ist/soll*100,0,100), bar=(ist,soll)=>`<div class="bar ${ist>=soll?'':'g'}"><i style="width:${w(ist,soll)}%"></i></div>`;
      ziel=`<h4 class="gs">🎯 Bis zum nächsten Rang</h4>${kv('⭐ Ansehen',`${num(S.ansehen)} von ${num(n.ans)}`)}${bar(S.ansehen,n.ans)}${kv('🌱 Bepflanzt',`${bep.toLocaleString('de-DE')} von ${n.ha} ha`)}<div class="bar fl ${bep>=n.ha?'':'g'}"><i class="hell" style="width:${w(S.ha,n.ha)}%"></i><i style="width:${w(bep,n.ha)}%"></i></div>${kv('💰 Vermögen',vonGeld(v,n.verm))}${bar(v,n.verm)}`}
    // Seit 10.0: Am Ziel steht hier die Stimmung im Verband mit der nächsten Wahl.
    // Seit 12.7: Das Ansehen steht nicht mehr in der Statusleiste, deshalb hier auch auf dem höchsten Rang.
    if(!n) ziel=`<h4 class="gs">🏆 Am Ziel</h4>${kv('⭐ Ansehen',num(S.ansehen))}`;
    if(!n&&S.amt) ziel+=`<h4 class="gs">🗳️ Weinbauverband</h4>${kv('Stimmung im Verband',`${stimmZ()} von 100`)}${amtBalken()}<div class="mut" style="margin-bottom:8px">${amtSatz()}</div>`;
    openSheet(`<h3>📋 Dein Stand</h3><h4 class="gs">💶 Kasse</h4>${kv('🏦 Kontostand',eur(S.geld),S.geld<0?'rot':'')}<h4 class="gk">Dieses Jahr bisher</h4>${kv('📈 Einnahmen',eur(S.jahrEin),'gruen')}${kv('📉 Ausgaben',eur(S.jahrAus),'rot')}${kv('⚖️ Ergebnis',eur(S.jahrEin-S.jahrAus),S.jahrEin>=S.jahrAus?'gruen':'rot')}
    <h4 class="gk">Jeden Monat fällig</h4>${kv('Löhne',eur(K.loehne))}${kv('Feste Kosten',eur(K.basis))}${k?kv('Zinsen',eur(K.zins))+kv('Tilgung',eur(K.tilgung))+kv('Kredit offen',eur(k.rest)):''}${kv('Zusammen',eur(K.basis+K.loehne+K.zins+K.tilgung))}${ziel}${rangLeiter()}${zeitStand()}
    ${mib('geld')}<div class="btns"><button data-a="zurBank">🏦 Zur Bank</button><button data-a="close">Okay</button></div>`)},
  // Version 7.6: Wetter oben links als Blatt.
  wetterInfo(){fx('menue'); const kv=(a,x)=>`<div class="kv"><span>${a}</span><span>${x}</span></div>`;
    openSheet(`<h3>🌤️ Wetter</h3>${kv('Gebiet',R().name)}${kv('Heute, '+MON[S.monat],wetterText())}${kv('Vorhersage '+MON[(S.monat+1)%12],progText())}<p class="mut" style="margin:10px 0 0">Die Vorhersage stimmt meistens, aber nicht immer.</p><div class="btns"><button data-a="close">Okay</button></div>`)},
  zurBank(){closeSheet();geh('stadt','bank');render();window.scrollTo(0,0)},
  fi(d,e){const f=e.target.closest('.fen'), b=f.querySelector('.fi'), x=f.querySelector('.finfo'), auf=x.hidden; x.hidden=!auf; b.classList.toggle('an',auf); b.setAttribute('aria-expanded',auf); if(auf) FI_AUF.add(d.id); else FI_AUF.delete(d.id)},
  // Zugeklappter Teil eines Fensters (Steckbrief im Weinberg): auf und zu ohne neues Zeichnen, offen bleibt er bis zum Ortswechsel.
  klapp(d,e){const b=e.target.closest('button'), x=b.closest('.fen').querySelector('.fklapp'), auf=x.hidden; x.hidden=!auf; b.textContent=auf?d.auf:d.zu; if(auf) FI_AUF.add(d.id+'+'); else FI_AUF.delete(d.id+'+')},
  region(d){neuLies();NEU.region=d.id;const y=window.scrollY;render();window.scrollTo(0,y)},
  neuOpt(d){if(d.k==='schwer'&&d.v===MEISTER_STUFE&&!meisterFrei()) return; neuLies();NEU[d.k]=d.v;const y=window.scrollY;render();window.scrollTo(0,y)},
  // Seit 7.9: Namen im Büro nachtragen (alte Spielstände oder leer gelassen).
  bAnrede(d,e){for(const b of e.target.closest('.zwei').children) b.classList.toggle('an',b.dataset.v===d.v)},
  namenJa(){const i=($('#bnI').value||'').trim().slice(0,30), g=($('#bnG').value||'').trim(), a=document.querySelector('#bnA .an'); if(!i) return meldung('Dein Name fehlt','Trag oben deinen Namen ein, dann speichere noch einmal.'); S.ich=i; if(g&&g!==S.name) S.name=g.slice(0,NAME_MAX); S.anrede=a&&a.dataset.v==='w'?'w':'m'; save(); render()},
  start(){neuLies();neuesSpiel();window.scrollTo(0,0)},
  auktion(){
    const a=S.auktion; if(!a) return;
    // Angekündigt: nur der Hinweis, geboten wird erst nächsten Monat.
    if(a.phase===0) return openSheet(`${sbild(a.spitze?'spitzenlage':'auktion')}<h3>🔨 Auktion im ${MON[(S.monat+1)%12]}</h3><p>${losText(a)} ${WO[S.region]} kommen nächsten Monat unter den Hammer. ${losLage(a).satz} Startgebot ${eur(a.start)}, geboten wird in Schritten von ${eur(a.schritt)}.</p>
      <p class="mut">${S.rang<R_AUKTION?`Mitbieten darfst du ab dem Rang ${RAENGE[R_AUKTION].name}.`:aukDeckel(a)?`${AUK_ZU_GROSS} ${aukDeckel(a)}`:`${aukZeichen(a,a.start)?aukZeichen(a,a.start)+' ':''}Mitgehen kannst du bis Konto plus freier Kreditrahmen, gerade sind das ${eur(Math.max(0,aukLimit()))}.`}</p><div class="mitte"><button class="siegel" data-a="close">Okay</button></div>`);
    if(S.rang<R_AUKTION) return;
    if(a.ende) return openSheet(`${sbild(a.spitze?'spitzenlage':'auktion')}<h3>🔨 Auktion beendet</h3><p>${esc(a.text)}</p><div class="mitte"><button class="siegel" data-a="close">Okay</button></div>`);
    // Seit 11.5 (Teil B): Passt das Los nicht unter den Deckel, gibt es nur die Erklärung. Die anderen machen es zum Monatswechsel unter sich aus.
    if(aukDeckel(a)) return openSheet(`${sbild('auktion')}<h3>🔨 Auktion: ${losText(a)} ${WO[S.region]}</h3><p>${AUK_ZU_GROSS} ${aukDeckel(a)}</p><p class="mut">${a.fuehrer?'Höchstgebot':'Startgebot'} ${eur(a.gebot)}${a.fuehrer?' von '+esc(a.fuehrer):''}.</p><div class="mitte"><button class="siegel" data-a="close">Okay</button></div>`);
    const x=aukNaechstes(), lim=aukLimit();
    openSheet(`${sbild(a.spitze?'spitzenlage':'auktion')}<h3>🔨 Auktion: ${losText(a)} ${WO[S.region]}</h3>
      <p class="mut">${losLage(a).satz} Im Saal sitzen außer dir ${a.bieter.length} Bieter. Wie weit sie gehen, verrät keiner.</p>
      <div class="gebot"><span class="mut">${a.fuehrer?'Höchstgebot':'Startgebot'}</span><b>${eur(a.gebot)}</b><span>${a.fuehrer?'von '+esc(a.fuehrer):'noch kein Gebot'}</span></div>
      ${a.text?`<p>${esc(a.text)}</p>`:''}
      ${aukZeichen(a,x)?`<p>${aukZeichen(a,x)}</p>`:''}
      <p class="mut">Du kannst bis ${eur(Math.max(0,lim))} mitgehen (Konto plus freier Kreditrahmen).</p>
      <div class="btns"><button class="sec" data-a="aukRaus">Aussteigen</button><button data-a="bieten" ${aukPreis(x,a)>lim?'disabled':''}>Bieten: ${eur(x)}</button></div>
      <div class="btns"><button class="sec klein" data-a="close">Später weitermachen</button></div>`);
  },
  bieten(){
    const a=S.auktion; if(!a||a.ende||a.phase===0||S.rang<R_AUKTION||aukDeckel(a)) return;
    // Seit 14.4.5: Über der Schwelle zahlst du beim Zuschlag das Gebot mal Aufschlag (aukPreis), geboten wird im Saal für alle gleich.
    const x=aukNaechstes(), px=aukPreis(x,a); if(px>aukLimit()) return;
    const K=a.bieter.filter(b=>b.limit>=x+a.schritt);
    if(K.length){
      const b=K[rint(0,K.length-1)], sprung=Math.random()<.2&&b.limit>=x+2*a.schritt?2:1;
      a.gebot=x+sprung*a.schritt; a.fuehrer=b.name; a.text=`Du bietest ${eur(x)}. ${b.name} geht sofort drüber.`;
    }else{
      a.gebot=x; a.fuehrer='du'; a.ende='du'; S.geld-=px; a.preisDu=px; landDazu(a.lage||'einfach',a.ha); if(a.lage==='sued') aukGlueck(); fx('hammer',3);
      a.text=`Zum Ersten, zum Zweiten, zum Dritten! ${losText(a)} gehören dir für ${eur(px)}. +${ruhm(2*(3+Math.min(a.ha,7)))} Ansehen. Dein Weingut hat jetzt ${S.ha}\u00a0Hektar.`;
      // Seit 14.4.4: Die Spitzenlage ist ein eigener Weinberg (slKauf), fertig bepflanzt. Platzhalter, Wortlaut in Meilenstein 17.
      if(a.spitze){S.spitze=1; slKauf(); a.text+=` Die Spitzenlage gehört dir: +${ruhm(SPITZE_ANS)} Ansehen. Sie steht fertig bepflanzt als eigener Weinberg da, dort ist es ${KLIMA_WORT.spitzenlage} als am einfachen Hang.`}
      if(S.geld<0) a.text+=` Dein Konto steht jetzt im Minus, das kostet 1 % Zinsen im Monat. Ein Kredit bei der Bank kostet nur ${Math.round(ZINS*100)} % im Jahr.`;
    }
    save();render();AKT.auktion();
  },
  aukRaus(){const a=S.auktion; if(!a||a.ende||a.phase===0) return; aukOhneDich(); if(S.fu&&a.ende!=='niemand'&&S.fu.auk==null) S.fu.auk=monatNr(); if(a.ende!=='niemand') fx('hammer',3); a.text='Du steigst aus. '+a.text; save();render();AKT.auktion()},
  wettbewerb(){
    const w=S.wett; if(!w||w.fertig) return;
    const land=w.typ==='land', e=w.ein, ls=S.rang>=wettRang()?S.lots.filter(wettFaehig).sort((a,b)=>juryGrund(b,!land)-juryGrund(a,!land)):[]; // seit 14.5.7 nach den Punkten der Jury
    const welt=w.typ==='welt';
    wettSheet(`${sbild(welt?'weltweinschau':'praemierung')}<h3>${welt?'🌍':'🏅'} ${WETTNAME[w.typ]} ${S.jahr}</h3>
      ${e?`<p>Eingereicht: <b>${esc(e.name)}</b>. Das Ergebnis steht im nächsten Winzerboten. Bis zum Monatsende kannst du noch tauschen.</p>`:''}
      <p class="mut">${land?`Zugelassen sind angemeldete Prädikatsweine vom Jahrgang ${S.jahr-1}. Du reichst einen Wein ein, er bleibt dir erhalten.`:welt?`Neun Weingüter aus aller Welt sind zu Gast auf dem Dorfplatz. Zugelassen sind verkaufsreife Prädikatsweine und Sekte aus der Flasche, auch gereifte und schon prämierte. Derselbe Wein darf jedes Jahr wieder antreten, Medaille und Punkte bekommt er aber nur beim ersten Mal. Platz 1 macht dich ${anr('zum Ehrenpräsidenten','zur Ehrenpräsidentin')}.`:'Alle Winzer treten gegeneinander an. Zugelassen sind verkaufsreife Prädikatsweine und Sekte aus der Flasche, auch gereifte und schon prämierte. Aufs Treppchen kommt jeder Wein hier nur einmal.'}</p>
      ${S.rang<wettRang()?`<div class="card mut">Mitmachen darfst du ab dem Rang ${RAENGE[wettRang()].name}.</div>`:ls.length?ls.map(l=>`<button class="wahl ${e&&e.id===l.id?'an':''}" data-a="wettJa" data-id="${l.id}"><b>${dot(l.sorte)}${esc(lotName(l))}</b><br><span class="mut">${juryText(l,!land)}</span></button>`).join(''):`<div class="card mut">Du hast gerade keinen zugelassenen Wein.${land?' Meldest du diesen Monat noch einen Prädikatswein vom letzten Jahrgang an, kannst du teilnehmen.':''}</div>`}
      <div class="btns"><button class="sec" data-a="close">${e||!ls.length?'Schließen':'Später entscheiden'}</button></div>`);
  },
  // Seit 13.6.3: Anmeldung zur Weltweinschau, nur im Januar, nur Weine der Klasse, die dran ist. Die Punkte stehen beim Anmelden fest.
  schau(){
    const s=S.schau; if(!s) return; const K=KRONEN[s.kl], e=s.ein, an=schauAnm(), ls=an?S.lots.filter(l=>schauFaehig(l)).sort((a,b)=>schauPunkte(b)-schauPunkte(a)):[];
    wettSheet(`${sbild('weltweinschau')}<h3>${K.sym} ${WETTNAME.welt} ${S.jahr}: ${K.name}</h3>
      ${e?`<p>Angemeldet: <b>${esc(e.name)}</b>. Die Schau ist im ${MON[WELT_MONAT]}, das Ergebnis steht im Winzerboten danach.${an?' Bis zum Monatsende kannst du noch tauschen.':''}</p>`:''}
      <p class="mut">${kroneText(K)} Zugelassen sind verkaufsreife Weine aus der Flasche, nicht gepanscht und lange genug gelagert, auch gereifte und schon prämierte. Es zählen die Punkte. Als Favorit gilt ${esc(s.feld.find(x=>x.fav).name)}.</p>
      ${kroneFehlt(s.kl).length?`<div class="card rot">${esc(kroneFehltText(s.kl))}</div>`:''}
      ${!an?'':ls.length?ls.map(l=>`<button class="wahl ${e&&e.id===l.id?'an':''}" data-a="schauJa" data-id="${l.id}"><b>${dot(l.sorte)}${esc(lotName(l))}</b><br><span class="mut">${juryText(l,1)}</span></button>`).join(''):kroneFehlt(s.kl).length?'':`<div class="card mut">Du hast gerade keinen zugelassenen Wein für die ${K.name}.</div>`}
      <div class="btns"><button class="sec" data-a="close">${e||!ls.length?'Schließen':'Später entscheiden'}</button></div>`);
  },
  schauJa(d){
    const l=lot(d.id); if(!schauEinreichen(l)) return; fx('korken'); save(); render();
    wettSheet(`${sbild('weltweinschau')}<h3>🌍 Angemeldet</h3><p>${esc(S.schau.ein.name)} tritt im ${MON[WELT_MONAT]} bei der Weltweinschau um die ${KRONEN[S.schau.kl].name} an.</p><div class="mitte"><button class="siegel" data-a="close">Okay</button></div>`);
  },
  // Einreichen: Die Punkte stehen jetzt fest, gewertet wird beim Monatswechsel.
  wettJa(d){
    const l=lot(d.id), w=S.wett; if(!w||w.fertig||S.rang<wettRang()||!wettFaehig(l)) return;
    fx('korken'); w.ein={id:l.id,name:lotName(l),p:wettPunkte(l),sorte:l.sorte,stufe:l.stufe,sekt:l.sekt?1:0}; save(); render();
    wettSheet(`${sbild(w.typ==='welt'?'weltweinschau':'praemierung')}<h3>🏅 Eingereicht</h3><p>${esc(w.ein.name)} steht bei der Jury ${w.typ==='land'?'der Landesprämierung':w.typ==='welt'?'der Weltweinschau':'des Bundeswettbewerbs'}. Probiert wird diesen Monat, das Ergebnis steht im nächsten Winzerboten.</p><div class="mitte"><button class="siegel" data-a="close">Okay</button></div>`);
  },
  ladenAngebot(d){
    const r=d.id, la=S.laeden[r], ls=S.lots.filter(l=>ladenPasst(l,r)).sort((a,b)=>ladenPreis(b,r)-ladenPreis(a,r));
    openSheet(`${sbild('laden')}<h3>Weinhandlung ${WO[r]}</h3><p class="mut">Sucht nur <b>${wunschName(la.wunsch)}</b> und nimmt noch ${num(la.rest)} Flaschen. Zum Vergleich steht der beste Preis im Großhandel dabei.</p>${ls.length?'':`<div class="card mut">Gerade hast du ${WUNSCH[la.wunsch]?`keinen ${WUNSCH[la.wunsch]}`:'keinen passenden Wein'} für diese Weinhandlung.</div>`}
      ${ls.map(l=>`<button class="wahl" data-a="ladenVerkauf" data-id="${l.id}" data-r="${r}"><b>${dot(l.sorte)}${esc(lotName(l))}</b><br><span class="mut">${num(l.liter)} Flaschen · hier ${eur2(ladenPreis(l,r))} · Großhandel ${eur2(wege(l)[0].p)}</span></button>`).join('')}
      <div class="btns"><button class="sec" data-a="close">Schließen</button></div>`);
  },
  ladenVerkauf(d){
    const l=lot(d.id), la=S.laeden[d.r], p=ladenPreis(l,d.r), max=Math.min(l.liter,la.rest);
    mengeSheet({titel:`${lotName(l)} an die Weinhandlung`,bild:'laden',text:`${eur2(p)} je Flasche, höchstens ${num(la.rest)} Flaschen. Die Weinhandlung zahlt immer voll, der Großhandel merkt davon nichts.`,max,rangeStep:1,step:max>200?10:1,start:max,okText:'Verkaufen',
      info:n=>`<b>${num(n)} Flaschen</b>bringt dir ${eur(erloes(n*p))}${rufTxt()}`,
      ok:n=>{kassiere(erloes(n*p));kompVerkauf(l,n);la.rest-=n;l.liter-=n;if(l.liter<=0)S.lots=S.lots.filter(x=>x!==l)}});
  },
  tab(d,e){if(d.id===TAB&&!d.sub&&window.scrollY>20){window.scrollTo({top:0,behavior:'smooth'});return} geh(d.id,d.sub);render();window.scrollTo(0,0)},
  infoWeiter(){
    const el=$('#info'); if(!el||el.classList.contains('aus')) return;
    el.classList.add('aus');
    // Seit 7.2 kommt nach einem Aufstieg erst die Feier, dann Aktuelles.
    // Seit 7.7 beginnt jede Feier mit der Bild-Bühne.
    // Seit 9.0 kommt bei einem Aufstieg vorher die Szene "Dein Weingut wächst" (FSTUFE -1).
    // Seit 10.2 kommt auch vor der Chronik eine Feier: die Übergabe am Küchentisch.
    setTimeout(()=>{if(S.ende&&!endeFeier()) TAB='ende'; else if(S.feier){TAB='feier'; FSTUFE=wgAuf(S.feier)?-1:0} else geh('gut','aktuell'); render();window.scrollTo(0,0);schnitt()},matchMedia('(prefers-reduced-motion:reduce)').matches?0:450);
  },
  wachsAlle(){feierStopp(); const el=$('#feier'); if(el) el.classList.add('neu')},
  feierBuehne(){feierStopp(); FSTUFE=0; render(); schnitt()},
  feierAlle(){const el=$('#feier'), k=$('#feier .fkarte'); if(!el||!k) return; el.classList.add('alle'); k.scrollTop=k.scrollHeight},
  feierWeiter(){feierStopp(); FSTUFE=1; render(); schnitt()},
  weltWeiter(){feierStopp(); FSTUFE++; render(); schnitt()},
  // Version 9.0: Stufe im Fenster "Mein Weingut" wählen, ohne das Büro neu zu zeichnen.
  wgSt(d){wgSicht().st=+d.st; wgZeig()},
  // Nach dem Anstoßen geht es zu Aktuelles, nach dem Kaufvertrag zur ersten Ausgabe vom Winzerboten.
  feierEnde(){
    const el=$('#feier'); if(!el||el.classList.contains('aus')) return;
    const start=S.feier&&S.feier.start, sp=S.feier&&S.feier.spende, w=S.feier&&S.feier.welt, amt=w==='brief';
    // Seit 10.2.1: Nach dem Kaufvertrag erst die Szene vom Hof im Sommer zum Startmonat, dann der Winzerbote.
    if(start&&FSTUFE!==-1){feierStopp(); FSTUFE=-1; render(); window.scrollTo(0,0); schnitt(); return}
    feierStopp(); if(!start&&w!=='ende') fx('korken'); S.feier=null; const nach=!start&&!sp&&!amt&&w!=='ende'&&feierNach(); save(); el.classList.add('aus');
    // Seit 10.2: Nach dem Brief geht es ins Rathaus, nach der Übergabe zur Chronik. Seit 13.6.3 wird vor der Schau angemeldet, danach geht es zu Aktuelles.
    setTimeout(()=>{if(nach){TAB='feier'; FSTUFE=wgAuf(S.feier)?-1:0} else if(start) TAB='monat'; else if(w==='ende') TAB='ende'; else if(sp||amt) geh('stadt','amt'); else geh('gut','aktuell'); render();window.scrollTo(0,0);schnitt()},matchMedia('(prefers-reduced-motion:reduce)').matches?0:450);
  },
  urkunde(d){
    const e=(S.ehrungen||[])[+d.n]; if(!e) return; const i=urkRang(e);
    openSheet(`<h2>🎖️ ${esc(e.w&&RAENGE[i].w||RAENGE[i].name)}</h2>${urkHtml(i,e.m||0,e.j||S.jahr,'gross','n' in e?e:{n:'',w:0})}${e.x?`<div class="mut" style="margin:10px 0">${esc(e.x)}</div>`:''}<div class="btns"><button data-a="close">Schließen</button></div>`,'auf');
  },
  // Version 8.2: Spenden im Rathaus, die Ehrungen dafür im Büro, Bank und Holzbogen zum Ansehen.
  spenden(){
    const s=spOffen(); if(!s) return; const D=SPENDEN[s], st=D.b/SP_TEIL, rest=D.b-spBezahlt(), max=Math.min(rest,Math.floor(Math.max(0,S.geld)/st)*st);
    if(max<=0) return meldung('Zu wenig Geld',`Die kleinste Rate sind ${eur(Math.min(st,rest))}. So viel ist gerade nicht auf deinem Konto.`,'amt');
    const t=steuerSchau();
    mengeSheet({titel:`Spende für ${D.z}`,bild:'amt',text:`Noch offen sind ${eur(rest)} von ${eur(D.b)}. Den Dank des Dorfs gibt es, sobald alles gezahlt ist. Steigst du vorher auf, verfällt der Rest.`,max,step:st,okText:'Spenden',
      info:n=>`<b>${eur(n)}</b>${n>=rest?'Damit ist die Spende voll.':`Danach sind noch ${eur(rest-n)} offen.`}<br><small>${spSteuerText(t,n)}</small>`,
      ok:n=>spZahle(n)});
  },
  // Version 10.1: Stiftung fürs Dorf (Raten wie bei den Spenden) und die freiwillige Übergabe im Fenster "Weinbauverband".
  stiften(){
    const s=stOffen(); if(!s) return; const D=SPENDEN[s], b=stPreis(s), st=b/SP_TEIL, rest=b-stBezahlt(), max=Math.min(rest,Math.floor(Math.max(0,S.geld)/st)*st);
    if(max<=0) return meldung('Zu wenig Geld',`Die kleinste Rate sind ${eur(Math.min(st,rest))}. So viel ist gerade nicht auf deinem Konto.`,'amt');
    const t=steuerSchau();
    mengeSheet({titel:`Stiftung: ${D.kurz}`,bild:'amt',text:`Die Stiftung holt die Spende für ${D.z} nach. Noch offen sind ${eur(rest)} von ${eur(b)}. Ansehen und Ehrung gibt es, sobald alles gezahlt ist.`,max,step:st,okText:'Einzahlen',
      info:n=>`<b>${eur(n)}</b>${n>=rest?'Damit ist die Stufe voll.':`Danach sind noch ${eur(rest-n)} offen.`}<br><small>${spSteuerText(t,n)}</small>`,
      ok:n=>stZahle(n)});
  },
  // Seit 13.6.4 gibt es keine freiwillige Übergabe mehr: Wer aufhören will, startet eine neue Partie (Maik 21.11.2026, Entscheidung 2).
  // Seit 11.7 (A24): Nachfolger wählen. Bei der freiwilligen Übergabe geht es danach gleich an den Küchentisch, zum Jahreswechsel erst mit dem Knopf im Winzerboten.
  nfArt(d){if(!nfOffen()) return; S.ende.nf.art=d.id==='s'?'s':'t'; zeigeNachfolger()},
  nfJa(){if(!nfOffen()) return; const n=(($('#nfname')||{}).value||'').trim().slice(0,20)||nfVorschlag(); nfBenennen(n); closeSheet(); save();
    if(S.ende.wie==='frei'){TAB='feier'; FSTUFE=0} render(); window.scrollTo(0,0); if(TAB==='feier') schnitt()},
  spEhre(d){
    const s=+d.n, e=(S.spenden||[]).find(x=>x.s===s); if(!e) return; const D=SPENDEN[s];
    openSheet(`<h2>🤝 ${esc(spKurz(s,e))}</h2>${spEhrHtml(s,'gross',e)}<p class="mut" style="margin:10px 0">${e.st?`Nachgeholt von der Stiftung im ${MON[e.m]} ${e.j}, für ${esc(D.z)}.${s===8?' Der Holzbogen kam mit.':''}`:`Gespendet für ${esc(D.z)} im ${MON[e.m]} ${e.j}. ${esc(D.lohn)}.`}</p>${s===8?spBogenHtml():s===7&&!e.st?`<div class="spbogen" style="background-image:url(bilder/${bankBild()}.jpg)"></div>${spBankTafel()}`:''}<div class="btns"><button data-a="close">Schließen</button></div>`);
  },
  spBank(){openSheet(`<h3>🪑 Die Bank am Wanderweg</h3><div class="spbogen" style="background-image:url(bilder/${bankBild()}.jpg)"></div>${spBankTafel()}<p class="mut">Über der Spitzenlage, mit Blick über den Fluss ins Tal.</p><div class="btns"><button data-a="close">Schließen</button></div>`)},
  spBogen(){openSheet(`<h3>🪵 Der Holzbogen</h3>${spBogenHtml()}<div class="btns"><button data-a="close">Schließen</button></div>`)},
  sub(d){SUB=d.id;render();window.scrollTo(0,0)},
  // Seit 11.2: Bereich im Büro wählen und die ganze Rangliste als Fenster von unten.
  buero(d){if(BUERO===d.id) return; BUERO=d.id; FI_AUF.clear(); render()},
  rangliste(){openSheet(`<h3>Rangliste</h3><p class="mut">${GEGNER_AKT[aktNr()-1]}</p>${weltForm()?`<p class="mut">${weltFormZeile()}</p>`:''}<p class="mut">${RANGL_I}</p>${ranglisteHtml()}<div class="mitte"><button class="siegel" data-a="close">Okay</button></div>`)},
  arbeitsamt(){closeSheet();geh('stadt','arbeit');render();window.scrollTo(0,0)},
  // Seit 11.1 öffnet der Knopf im Kellerbuch das Weinkompendium. Der Name der Aktion bleibt, die Sprechblasen zeigen darauf.
  weinQual(){archivGeh('brett')},
  kompAuf(d){const el=$('#ksiegel'); if(el) el.classList.remove('an'); if(S) kompAuf(d&&d.id)},
  kompKap(d){if(!KOMP_KAP.some(k=>k[0]===d.id)||KOMP_AKT===d.id) return; KOMP_AKT=d.id; render()},
  archiv(d){if(ARCHIV===d.id) return; ARCHIV=d.id; FI_AUF.clear(); render()},
  archivGeh(d){archivGeh(d.id)},
  kompEintrag(d){if(S&&KOMP[d.id]) kompAuf(d.id)},
  // Ein Wein aus dem Kellerbuch mit allen Angaben und den Knöpfen, die gerade passen.
  buchDetail(d){
    const l=lot(d.id); if(!l||l.status==='trauben') return;
    const fl=l.status==='flasche', L=l.stufe?lager(l):null, p=preis(l), W=wege(l), kn=[];
    if(!fl&&!l.stufe) kn.push(`<button data-a="anmelden" data-id="${l.id}">Im Rathaus anmelden</button>`);
    if(!fl&&l.stufe) kn.push(`<button data-a="abfuellen" data-id="${l.id}">Abfüllen (${num(l.liter)} Flaschen)</button>`);
    if(fl&&ladenFrei()) kn.push(l.regal?`<button data-a="regalRaus" data-id="${l.id}">Aus dem Regal nehmen</button>`:p?`<button data-a="regal" data-id="${l.id}">Ins Regal stellen</button>`:'');
    if(W.length&&!l.regal) kn.push(`<button data-a="verkaufen" data-id="${l.id}">Verkaufen ${W[0].flag} ${eur2(W[0].p)}</button>`);
    openSheet(`${sbild('kellerbuch')}<h3>${dot(l.sorte)}${esc(lotName(l))}</h3>${l.stufe?'':'<div class="mut">Noch nicht angemeldet</div>'}${l.pansch?'<div class="rot">🤫 gepanscht</div>':''}${l.regal?'<div class="mut">🏪 Steht im Regal deiner Weinhandlung</div>':''}${medHtml(l)}${kompLotZeile(l)}
    <div class="kv"><span>Menge</span><span>${num(l.liter)} ${fl?'Flaschen':'l'}</span></div>
    <div class="kv"><span>Lagerort</span><span>${fl?'Flasche':'Fass'}</span></div>
    <div class="kv"><span>Lagert seit</span><span>${fl?l.flMonate:l.fassMonate} Monaten</span></div>
    <div class="kv"><span>Noch haltbar</span><span>${fl?(L.max===Infinity?'unbegrenzt':(L.max-l.flMonate)+' Monate'):(8-l.fassMonate)+' Monate im Fass'}</span></div>
    ${fl?`<div class="bar g"><i style="width:${L.max===Infinity?Math.min(100,l.flMonate/(L.min*3)*100):l.flMonate/L.max*100}%"></i></div>`:''}
    <div class="kv"><span>Öchsle bei der Lese</span><span>${l.oe}°</span></div>
    ${l.stufe&&oeUeber(l.stufe,l)?`<div class="kv"><span>Öchsle über der Schwelle</span><span>${oeUeber(l.stufe,l)}° · ${pz(oePreisF(l.stufe,l)-1)} mehr Preis</span></div>`:''}
    <div class="kv"><span>Qualität</span><span>${l.qp}</span></div>
    ${l.medP?`<div class="kv"><span>Medaillen</span><span>+${l.medP} Punkte · ${pz(l.medP*PUNKT_PREIS)} mehr Preis</span></div>`:''}
    ${l.sektP?`<div class="kv"><span>Hefelager</span><span>${l.sektP>0?'+':'−'}${Math.abs(l.sektP)} Punkte · ${pz(Math.abs(l.sektP)*PUNKT_PREIS)} ${l.sektP>0?'mehr':'weniger'} Preis</span></div>`:''}
    ${l.durch?`<div class="kv"><span>Weinprüfer</span><span>durchgefallen als ${STUFEN[l.durch].name} · ${pz(DURCH_PREIS)} weniger Preis</span></div>`:''}
    ${jhWein(l)?`<div class="kv"><span>Jahrhundertwein</span><span>${pz(JH_PREIS)} mehr Preis</span></div>`:''}
    <div class="kv"><span>Preis je Flasche</span><span>${p?eur2(p):fl?`reif in ${L.min-l.flMonate} Monaten`:'noch im Fass'}</span></div>
    ${p?`<div class="kv"><span>Gesamtwert</span><span>${eur(p*l.liter)}</span></div>`:''}
    ${kn.length?`<div class="btns">${kn.join('')}</div>`:''}<div class="btns"><button class="sec" data-a="close">Schließen</button></div>`);
  },
  // Version 7.8: Musik schaltet reihum an, kurz, aus. Beim Umschalten auf kurz kommt gleich eine Hörprobe.
  ton(d){if(d.id==='musik') TON.musik={an:'kurz',kurz:'aus',aus:'an'}[TON.musik]||'kurz'; else TON[d.id]=!TON[d.id];try{localStorage.setItem(TON_KEY,JSON.stringify(TON))}catch(e){}tonAn();musikStell(d.id==='musik');const y=window.scrollY;render();window.scrollTo(0,y)},
  /* ---- Spielstände ---- */
  menue(){if(S)save();closeSheet();S=null;START=null;render();window.scrollTo(0,0)},
  slotLaden(d){const o=lies(+d.id);if(!o)return;SLOT=+d.id;nimm(o);geh('gut');save();render();window.scrollTo(0,0)},
  slotNeu(d){SLOT=+d.id;START='neu';NEU=neuStart();render();window.scrollTo(0,0)},
  slotWegFrage(d){
    const o=lies(+d.id); if(!o) return;
    openSheet(`<h3>Spielstand ${+d.id+1} löschen?</h3><p>${esc(o.name)}, ${esc(MON[o.monat]||'')} ${esc(o.jahr)}. Das lässt sich nicht rückgängig machen. Sichere ihn vorher als Datei, wenn du ihn behalten willst.</p><div class="btns"><button class="sec" data-a="close">Abbrechen</button><button class="wag" data-a="slotWeg" data-id="${+d.id}">Ja, löschen</button></div>`);
  },
  slotWeg(d){closeSheet();try{localStorage.removeItem(KEYS[+d.id])}catch(e){}render()},
  slotSichern(d){
    if(S&&+d.id===SLOT) save(); // seit 8.3, damit die Spielzeit bis jetzt mitgeht
    const o=lies(+d.id); if(!o) return;
    const a=document.createElement('a'), url=URL.createObjectURL(new Blob([JSON.stringify({...o,album:kompAlbumLies(),...(meisterFrei()?{meister:1}:{})})],{type:'application/json'}));
    a.href=url; a.download=`Öchsle ${String(o.name).replace(/[^\wäöüÄÖÜß -]/g,'').trim()||'Spielstand'} ${o.jahr}-${String(o.monat+1).padStart(2,'0')}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),5000);
  },
  slotDatei(d){ZIEL=+d.id;const f=$('#datei');f.value='';f.click()},
  close(){closeSheet()},
  slMinus(){const r=$('#slr');r.value=Math.max(+r.min,+r.value-(+r.dataset.st));slUpd()},
  slPlus(){const r=$('#slr');r.value=Math.min(+r.max,+r.value+(+r.dataset.st));slUpd()},
  slOk(){const n=+$('#slr').value,f=SL.ok,w=SL.w;closeSheet();f(n,w);save();render()},
  // Seit 12.1: Wahl im Mengen-Fenster (o.wahl, o.w), zum Beispiel 9 oder 24 Monate Hefelager beim Sekt.
  slWahl(d){if(!SL) return; SL.w=+d.id; document.querySelectorAll('[data-a="slWahl"]').forEach(b=>b.classList.toggle('an',+b.dataset.id===SL.w)); slUpd()},
  neuFrage(){openSheet(`<h3>Neues Spiel beginnen?</h3><p>Spielstand ${SLOT+1} wird dabei gelöscht. Für ein zweites Spiel nimm unter „Spielstände“ einen freien Platz.</p><div class="btns"><button class="sec" data-a="close">Abbrechen</button><button class="wag" data-a="neuJa">Ja, neu anfangen</button></div>`)},
  // Seit 11.7 (A29): Nach der Pleite löscht "Neues Spiel" den Stand erst nach einer Nachfrage, "Zurück" holt das Pleite-Fenster wieder.
  pleiteNeu(){if(!S||!S.pleite) return; openSheet(`<h3>Neues Spiel beginnen?</h3><p>Spielstand ${SLOT+1} mit ${esc(S.name)} wird dabei gelöscht, auch seine Chronik. Behalten kannst du ihn, wenn du unter „Spielstände“ einen freien Platz nimmst.</p><div class="btns"><button class="sec" data-a="pleiteZurueck">Zurück</button><button class="wag" data-a="neuJa">Ja, neu anfangen</button></div>`)},
  pleiteZurueck(){if(S&&S.pleite) zeigePleite()},
  neuJa(){closeSheet();try{localStorage.removeItem(KEYS[SLOT])}catch(e){}S=null;NEU=neuStart();START='neu';render();window.scrollTo(0,0)},
  /* ---- Titelbild und Geschichte ---- */
  titelWeiter(){titelZu(); if(!S){const i=[0,1,2].find(i=>lies(i)); return i==null?AKT.titelNeu():AKT.slotLaden({id:i})} geh('gut');render();window.scrollTo(0,0)},
  // Neues Spiel kommt auf den ersten freien Platz. Sind alle belegt, zeigt die Liste der Spielstände, wo man Platz schafft.
  titelNeu(){
    titelZu(); if(S)save(); S=null; START=null;
    // Erst ein ganz leerer Platz, sonst einer mit einem alten Spielstand aus der Zeit vor 7.0.
    const i=[0,1,2].find(i=>!roh(i))??[0,1,2].find(i=>!lies(i));
    if(i==null){render();window.scrollTo(0,0);return meldung('Alle Plätze belegt','Alle drei Spielstände sind belegt. Lösch einen, am besten nachdem du ihn als Datei gesichert hast, dann ist Platz für ein neues Spiel.')}
    AKT.slotNeu({id:i});
  },
  // Seit 11.0: Ideen-Knopf im Büro. Der Entwurf bleibt auf dem Gerät liegen, bis die Idee rausgegangen ist.
  idee(){
    let alt=''; try{alt=localStorage.getItem(IDEE_KEY)||''}catch(e){}
    openSheet(`<h3>💡 Deine Idee</h3><p class="mut">Tipp ins Feld und schreib los. Mit dem Mikrofon 🎤 deiner Tastatur kannst du auch einfach sprechen.</p>
      <textarea id="ideeT" maxlength="${IDEE_MAX}" placeholder="Was fehlt dir, was stört dich, was wäre schön?">${esc(alt)}</textarea>
      <p class="mut" style="margin-top:8px">Danach wählst du Maik aus deinen Kontakten. Das Spiel selbst verschickt nichts.</p>
      <div class="btns"><button data-a="ideeWa">WhatsApp</button>${navigator.share?'<button data-a="ideeTeilen">Teilen</button>':''}</div>
      <div class="btns"><button class="sec" data-a="close">Zurück</button></div>`);
    $('#ideeT').addEventListener('input',e=>{try{localStorage.setItem(IDEE_KEY,e.target.value)}catch(x){}});
  },
  ideeWa(){const t=ideeText(); if(!t) return; ideeFertig(); window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank')},
  ideeTeilen(){const t=ideeText(); if(!t) return; navigator.share({text:t}).then(ideeFertig).catch(()=>{})},
  ausblick(){openSheet(`<h3>Was geplant ist</h3><p class="mut">Daran wird gearbeitet. Reihenfolge und Umfang können sich noch ändern.</p>${ausblickHtml()}<div class="mitte"><button class="siegel" data-a="close">Okay</button></div>`)},
  titelChronik(){zeigeChronik()},
  titelChronikZu(){const c=document.querySelector('#titel .tchron'); if(c) c.remove()},
  // Seit 12.9: klappt eine Etappe in der Chronik auf oder zu, die vorher offene klappt zu.
  titelEtappe(d,e){const z=e.target.closest('.tchz1'); if(!z) return; const auf=!z.classList.contains('auf');
    for(const x of z.parentNode.parentNode.querySelectorAll('.tchz1.auf')) x.classList.remove('auf'); if(auf) z.classList.add('auf')},
  titelLaden(){titelZu(); if(S)save(); S=null; START=null; render(); window.scrollTo(0,0)},
  weiter(){
    if(S.ende) return;
    if(S.pleite) return zeigePleite();
    managerArbeit();
    // Leute-Regel: Ohne genug Erntehelfer und Lagerarbeiter geht es nicht in den nächsten Monat.
    const fl=fehlText(), fe=leuteFehlen();
    if(fl) return leuteSheet('⚠️ Zu wenig Leute',`<p>${fl}. Vorher geht es nicht in den nächsten Monat.</p>
      ${fe.helfer?`<p class="mut">${helferRegel()}. Du hast ${rbn(rebenGesamt())} Reben, deine Leute reichen für ${rbn(helferReben())}. ${S.monat<=2?`Statt einzustellen, kannst du bis März auch Reben roden${maschFrei('klein')&&!S.maschinen.some(x=>x.typ==='klein')?' oder eine Erntemaschine kaufen':''}.`:''}${maschOhneFahrer().length||S.maschinen.some(m=>m.zustand<MASCH_ROT)?` Eine Maschine zählt nur im Einsatz, also mit Fahrer und ab ${MASCH_ROT}\u00a0% Zustand.`:''}</p>`:''}
      ${fe.lagerarb?`<p class="mut">${lagerRegel(flSperre())}. Du hast ${num(S.fassraum)}\u00a0l Fassraum und ${num(S.flaschen)} leere Flaschen.</p>`:''}
      <p class="mut">Einstellen geht auch ohne Geld, dein Konto rutscht dann ins Minus.</p>`);
    // Seit dem Nachtrag zu 14.5.2 (Annahme 34): Nachfrage zum Sommerschnitt und zum Ausdünnen, nur wenn die Arbeit die nächste Weinstufe bringt.
    const sf=sommerFrage(); if(sf.length) return zeigeSommerFrage(sf);
    const v=verfallListe(), t=S.monat===11?steuerSchau():null, st=!!(t&&t.steuer>0);
    if(v.length||st) openSheet(`<h3>⚠️ Letzte Warnung</h3>${v.length?`<p>Wenn du jetzt weiterblätterst, geht das verloren:</p><ul class="kl">${v.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${st?`<p>💶 Zum Jahreswechsel zahlst du rund ${eur(t.steuer)} Steuer auf rund ${eur(t.gew)} Gewinn. Was du jetzt noch kaufst, senkt die Steuer.</p>`:''}<div class="btns"><button class="sec" data-a="close">Zurück</button><button ${v.length?'class="wag" ':''}data-a="weiterJa">${v.length?'Trotzdem weiter':'Weiter'}</button></div>`);
    else monatWeiter();
  },
  weiterJa(){closeSheet();monatWeiter()},
  // Schritt G 7.0: Übergabe an die nächste Generation. Ohne Eingabe gilt der Vorschlag.
  erbeArt(d){if(!erbeOffen()) return; S.erbe.art=d.id==='s'?'s':'t'; zeigeErbe()},
  erbeJa(){if(!erbeOffen()) return; const n=(($('#erbname')||{}).value||'').trim().slice(0,20)||erbeVorschlag(); erbeBenennen(n); closeSheet(); save(); render(); window.scrollTo(0,0)},
  async weiterBis(){
    if(fuSperre()) return AKT.weiter();
    closeSheet(); const L=[];
    for(let n=0;n<SPRUNG_MAX;n++){
      if(S.ende) return;
      if(S.pleite) return zeigePleite();
      managerArbeit();
      if(fehlText()||sommerFrage().length||verfallListe().length||(S.monat===11&&steuerSchau().steuer>0)){if(n) break; return AKT.weiter()}
      SPRUNG=L.slice(); monatWeiter();
      if(S.pleite||S.ende||S.pruefer||erbeOffen()||$('#sheet').classList.contains('an')) return;
      const top=TOP.slice().sort((a,b)=>b.p-a.p)[0];
      if(sprungHalt().length||fuHalt()) break;
      L.push(`⏩ ${MON[S.monat]}: ${top?top.t:'ein ruhiger Monat'}`);
      await new Promise(r=>setTimeout(r,120));
    }
  },
  // Version 7.0 (Schritt D): Manager. mgr öffnet das Fenster, mgrStufe stellt ein oder befördert um eine Stufe, mgrAn schaltet eine Aufgabe.
  mgr(d){MGR_OFFEN=d.id; MGR_NEU=0; openSheet(mgrFenster(d.id))},
  // Seit 11.5 (Teil C1): Einstellen und Befördern gibt es nicht mehr (mgrKommen). mgrDa schließt die Vorstellung, der nächste Manager aus S.mgrNeu folgt beim Zeichnen.
  mgrDa(){if(S.mgrNeu) S.mgrNeu.shift(); MGR_NEU=0; MGR_OFFEN=null; closeSheet(); save(); const y=window.scrollY; render(); window.scrollTo(0,y)},
  mgrAn(d){
    const e=mgrAufgabe(d.id); if(!e||!aufgabeDa(d.id)) return;
    const m=S.manager[e.bereich]; m.an=m.an||{}; m.an[d.id]=m.an[d.id]?0:1;
    save(); const y=window.scrollY; render(); window.scrollTo(0,y);
    if(MGR_OFFEN&&$('#sheet').classList.contains('an')) openSheet(mgrFenster(MGR_OFFEN));
  },
  mgrPuffer(d){
    const m=(S.manager||{})[d.b]; if(!m) return; m.puffer=+d.id; save(); const y=window.scrollY; render(); window.scrollTo(0,y);
    if(MGR_OFFEN&&$('#sheet').classList.contains('an')) openSheet(mgrFenster(MGR_OFFEN));
  },
  dauerRes(d){
    S.dauer=S.dauer||{}; S.dauer.reserve=+d.id; save(); const y=window.scrollY; render(); window.scrollTo(0,y);
    if(MGR_OFFEN&&$('#sheet').classList.contains('an')) openSheet(mgrFenster(MGR_OFFEN));
  },
  makler(){
    const g=maklerGrund(); if(g) return meldung('Der Makler hat nichts für dich',g);
    if(S.geld<MAKLER_PREIS) return meldung('Zu wenig Geld',`Ein Hektar kostet beim Makler ${eur(MAKLER_PREIS)}. Einen Kredit gibt es bei der Bank.`);
    openSheet(`<h3>🏠 Einen Hektar kaufen?</h3><p>Der Makler hat einen Weinberg mit 1\u00a0Hektar ${WO[S.region]} für ${eur(MAKLER_PREIS)}.</p><p class="mut">Für den Aufstieg zählt er erst, wenn er bepflanzt ist. Gepflanzt wird von Januar bis März.</p><div class="btns"><button class="sec" data-a="close">Lieber nicht</button><button data-a="maklerJa">Kaufen</button></div>`);
  },
  maklerJa(){
    if(maklerGrund()||S.geld<MAKLER_PREIS) return;
    S.geld-=MAKLER_PREIS; landDazu('einfach',1); S.maklerN=maklerDiesJahr()+1; S.maklerJahr=S.jahr; fx('stempel'); closeSheet(); save(); render();
    meldung('Der Vertrag ist unterschrieben',`Dir gehört jetzt 1 Hektar mehr, zusammen ${S.ha} Hektar.${S.monat<=2?' Du kannst ihn gleich bepflanzen.':' Bepflanzen kannst du ihn ab Januar.'}${maklerGrund()?'':' Der Makler hat dieses Jahr noch mehr für dich.'}`);
  },
  kellerAus(){
    const K=S.keller||0, pr=KELLER_PREISE[K];
    if(pr==null||!kellerFrei(K)) return;
    if(S.geld<pr) return meldung('Zu wenig Geld',`Die nächste Stufe kostet ${eur(pr)}.`,'fassgang');
    openSheet(`${sbild('fassgang')}<h3>🏗️ Keller ausbauen?</h3><p>Stufe ${K+1} von ${KELLER_PREISE.length}, ${KELLER_NAMEN[K]}, kostet ${eur(pr)}.</p><p class="mut">Danach dürfen Prädikatsweine und Eiswein ${K+1} ${K?'Monate':'Monat'} früher aus dem Keller, und jeder Wein gewinnt beim Reifen schneller an Wert.</p><div class="btns"><button class="sec" data-a="close">Lieber nicht</button><button data-a="kellerAusJa">Ausbauen</button></div>`);
  },
  kellerAusJa(){
    const K=S.keller||0, pr=KELLER_PREISE[K];
    if(pr==null||!kellerFrei(K)||S.geld<pr) return;
    zahle(pr); S.keller=K+1; fx('stempel'); closeSheet(); save(); render();
    meldung('Der Keller ist ausgebaut',`Stufe ${S.keller} von ${KELLER_PREISE.length}, ${KELLER_NAMEN[S.keller-1]}, ist fertig. Prädikatsweine und Eiswein sind jetzt ${S.keller} ${S.keller===1?'Monat':'Monate'} früher verkaufsreif.`,'fassgang');
  },
  hoffest(){
    const art=festArt(), F=FESTE[art];
    if(!art||S.festJahr===S.jahr||S.monat<5||S.monat>7) return;
    if(S.geld<F.preis) return meldung('Zu wenig Geld',`Das ${F.name} kostet ${eur(F.preis)}.`,'hoffest');
    const a=Math.round(festAns(F)*(HOFFEST_WETTER[S.wetter]||1)*DIFF[S.schwer].ans);
    openSheet(`${sbild('hoffest')}<h3>🎉 ${F.name} feiern?</h3><p>${F.kurz}. Das kostet ${eur(F.preis)}.</p><p class="mut">Gefeiert wird Ende ${MON[S.monat]}, das Wetter: ${WETTER[S.wetter].join(' ')}. Damit bringt das Fest rund ${a} Ansehen.</p><div class="btns"><button class="sec" data-a="close">Lieber nicht</button><button data-a="hoffestJa">Feiern</button></div>`);
  },
  hoffestJa(){
    const art=festArt(); if(!art||S.festJahr===S.jahr||S.geld<FESTE[art].preis) return;
    zahle(FESTE[art].preis); S.festJahr=S.jahr; S.fest={w:S.wetter,art}; fx('stempel'); closeSheet(); save(); render();
    meldung('Die Einladungen sind raus','Das Fest steigt Ende des Monats. Wie es war, steht im nächsten Winzerboten.','hoffest');
  },
  anreg(d){
    const g=S.gegner[+d.id]; if(!g||S.rang<R_KONTROLLE||S.anregJahr===S.jahr) return;
    openSheet(`${sbild('kontrolle')}<h3>🔍 Prüfer zu ${esc(g.name)} schicken?</h3><p>Du gibst dem Prüfer einen Hinweis auf ${esc(g.name)} ${WO[g.region]}. Er kommt im Lauf des Monats, das Ergebnis steht im nächsten Winzerboten.</p><p class="mut">Gepanschter Wein: ${esc(g.name)} verliert ${ANREG_ANS} Ansehen und zahlt Strafe. Nichts gefunden: Du verlierst ${ANREG_FEHL} Ansehen.</p><div class="btns"><button class="sec" data-a="close">Lieber nicht</button><button class="wag" data-a="anregJa" data-id="${g.id}">Prüfer schicken</button></div>`);
  },
  anregJa(d){
    const g=S.gegner[+d.id]; if(!g||S.rang<R_KONTROLLE||S.anregJahr===S.jahr) return;
    g.angeregt=1; S.anregJahr=S.jahr; fx('stempel'); closeSheet(); save(); render();
    meldung('Der Hinweis ist raus','Der Prüfer kümmert sich darum. Das Ergebnis steht im nächsten Winzerboten.','kontrolle');
  },
  // Eigene Weinhandlung: Ins Regal stellen teilt den Wein wie beim Sekt, aus dem Regal nehmen legt ihn zurück ins Lager.
  regal(d){
    const l=lot(d.id), p=l&&preis(l); if(!l||l.regal||!p||!ladenFrei()) return;
    mengeSheet({titel:`${lotName(l)} ins Regal`,bild:'weinhandlung',text:`Deine Weinhandlung verkauft jeden Monat von selbst, das Teuerste zuerst, bis ${eur(ladenEigen())} Listenwert. Sie bringt ${eur2(p*LADEN_EIGEN_F)} je Flasche statt ${eur2(p)}. Was im Regal steht, fehlt im Großhandel.`,max:l.liter,rangeStep:1,step:l.liter>2000?100:l.liter>200?10:1,start:Math.min(l.liter,Math.ceil(ladenEigen()/p)),okText:'Ins Regal',
      info:n=>`<b>${num(n)} Flaschen</b>bringt im Regal rund ${eur(n*p*LADEN_EIGEN_F)}`,
      ok:n=>{fx('korken'); regalStellen(l,n)}});
  },
  regalRaus(d){const l=lot(d.id); if(!l) return; l.regal=false; weinZusammen(l); closeSheet(); save(); render()},
  // Seit 14.7.4 je Weinberg (d.id).
  duengen(d){
    const id=d&&d.id; if(!id||!duengOffen(id)) return; const k=duengKosten(id);
    if(S.geld<k) return meldung('Zu wenig Geld',`Düngen kostet ${eur(k)}.`);
    duenge(id);fx('stempel');save();render();
  },
  // Seit 13.2.4: Rebschnitt von Hand, je Sorte einmal von Januar bis April.
  // Seit 13.4.3: Weg des Wagnisses wählen, solange es noch nicht entschieden ist.
  wagnisWahl(d){const f=S.felder[d.id]; if(!f||f.wagnis||!wegeOffen().includes(d.w)) return; f.weg=d.w; save(); render()},
  schneiden(d){
    if(!schnittOffen(d.id)) return; const k=schnittKosten(d.id);
    if(S.geld<k) return meldung('Zu wenig Geld',`Der Rebschnitt kostet ${eur(k)}.`);
    chefNorm(); if(chefSchnitte()>=CHEF_SCHNITT_MAX){const sc=weinberge().filter(id=>S.felder[id].schnitt===S.jahr&&S.felder[id].schnittWer!=='helfer'&&S.felder[id].schnittWer!=='kauf').map(id=>SORTEN[id].name).join(' und '); return meldung('Keine Zeit mehr',`${CHEF_SCHNITT_MAX===1?'Mehr als einen Weinberg':`Mehr als ${CHEF_SCHNITT_MAX} Weinberge`} schaffst du in einem Winter nicht selbst. Diesen Winter hast du schon den ${sc} geschnitten.`)} // Platzhalter, Wortlaut in Meilenstein 17
    schneide(d.id);fx('schere');save();render();
    meldung('Geschnitten',`Der ${SORTEN[d.id].name} ist für dieses Jahr geschnitten, für ${eur(k)}. Zum Jahreswechsel bringt das Entwicklungspunkte.`); // Platzhalter, Wortlaut in Meilenstein 17
  },
  // Seit 14.2.3: Rebschnitt je Weinberg abgeben oder selbst machen, Düngen für das ganze Weingut.
  // Seit 14.4.3 (Chef-Grenze): "Selbst schneiden" teilt den Chef diesem Weinberg zu, der bisherige geht mit einem Hinweis an die Leute. Hat der Chef diesen Winter
  // schon geschnitten, kommt der neue erst im nächsten Winter dran (Platzhalter, Wortlaut in Meilenstein 17). In den Lehrjahren teilt das Spiel selbst zu.
  // Seit 14.7.4 (Annahme 9): Rebschnitt und Düngen zusammen, der Chef-Weinberg. Der Hinweis nennt den abgegebenen Weinberg (Platzhalter, Wortlaut in Meilenstein 17).
  // Aus dem Einsatzplan aufgerufen, kommt das Sheet danach wieder, wenn es keinen Hinweis gibt. Das Düngen fürs ganze Gut (duengWer) ist weg.
  schneider(d){const f=S.felder[d.id]; if(!f||!helferKann(1)||chefStill()) return; const y=window.scrollY, sh=einsatzAuf();
    if(f.schneider==='helfer'){const weg=chefZuteilen(d.id), voll=chefSchnitte()>=CHEF_SCHNITT_MAX&&schnittOffen(d.id); save(); render(); window.scrollTo(0,y);
      if(weg.length||voll) meldung('Neuer Chef-Weinberg',`${weg.length?EINSATZ_TEXT.weg.replace('{sorte}',`Den ${weg.map(x=>SORTEN[x].name).join(' und ')}`).replace('{wer}',leuteStName('helfer',leuteSt('helfer')))+' ':''}${EINSATZ_TEXT.neuChef.replace('{sorte}',SORTEN[d.id].name)}${voll?' Schneiden kannst du ihn erst im nächsten Winter, diesen hast du schon geschnitten.':''}`);
      else if(sh) openSheet(einsatzSheet()); return}
    f.schneider='helfer'; save(); render(); window.scrollTo(0,y); if(sh) openSheet(einsatzSheet())},
  // Seit 14.7.4: Schalter des Einsatzplans (art 'schnitt', 'laub' oder 'ausd', w 'chef' oder 'auto'). Automatik nur, wenn die Stufe der Leute die Arbeit kann.
  planSetz(d){const f=S.felder[d.id]; if(!f||!f.reben) return; const w=d.w==='auto'?'auto':'chef';
    if(d.art==='schnitt'){if((w==='auto')!==helferSchneidet(d.id)) AKT.schneider({id:d.id}); return}
    if(!['laub','ausd'].includes(d.art)||(w==='auto'&&!planAutoKann(d.art))) return;
    const y=window.scrollY, sh=einsatzAuf(); (f.plan=f.plan||{})[d.art]=w; save(); render(); window.scrollTo(0,y); if(sh) openSheet(einsatzSheet())},
  einsatz(){if(!planBeiMgr()) return; MGR_OFFEN=null; openSheet(einsatzSheet())},
  // Seit 14.7.5: Chefsache je Arbeit (w 'chef' oder 'auto') und die Vorwahl der Hefezeit. Automatik nur, wenn die Stufe sie kann (csKann).
  csSetz(d){if(!CS_ARBEIT.includes(d.id)||(d.w==='auto'&&!csKann(d.id))) return; csSetzen(d.id,d.w==='auto'?'auto':'chef');
    save(); const y=window.scrollY; render(); window.scrollTo(0,y); if(MGR_OFFEN&&$('#sheet').classList.contains('an')) openSheet(mgrFenster(MGR_OFFEN))},
  sektWahl(d){S.sektWahl=+d.h===HEFE_LANG?HEFE_LANG:SEKT_REIFE; save(); const y=window.scrollY; render(); window.scrollTo(0,y); if(MGR_OFFEN&&$('#sheet').classList.contains('an')) openSheet(mgrFenster(MGR_OFFEN))},
  // Seit 14.2.4: Wahl der Erziehungsform beim ersten Pflanzen, als halbhohes Fenster. Seit 14.5.3 (Annahme 11) je Spielstufe: In den Lehrjahren ist die
  // empfohlene Form vorausgewählt (d.sel, änderbar), der alte Winzer nennt Empfehlung, Wahl fürs Leben und Maschinen-Regel. In den Gesellenjahren nennt das
  // Fenster Wahl fürs Leben und Maschinen-Regel mit dem Rat, ohne Vorauswahl. In der Meisterprüfung nur die Steckbriefe, beides steht im Weinkompendium.
  // Platzhalter, Wortlaut in Meilenstein 17.
  formWahl(d){const id=d.id, rl=rolleK(id), lehr=S.schwer==='einfach', rat=S.schwer!=='schwer', weiter=d.weiter==='pflanzAuftrag'?'pflanzAuftrag':'pflanzen', F=formenFuer(id);
    const sel=lehr?(F.includes(d.sel)?d.sel:F.includes(FORM_PASST[rl])?FORM_PASST[rl]:F[0]):null;
    const knopf=fm=>lehr?`<button class="${fm===sel?'':'sec'}" data-a="formWahl" data-id="${id}" data-weiter="${weiter}" data-sel="${fm}">${fm===sel?'✓ ':''}${FORMEN[fm].name}</button>`
      :`<button data-a="formNimm" data-id="${id}" data-form="${fm}" data-weiter="${weiter}">${FORMEN[fm].name}</button>`;
    openSheet(`<h3>${esc(SORTEN[id].name)}: Erziehungsform</h3>${rat?`<p class="mut">${FORM_WAHL_SATZ} ${FORM_MASCH_SATZ}</p><p>👴 ${FORM_RAT[rl]||''}</p>`:''}${lehr?`<p class="mut">${FORM_VORAUS}</p>`:''}
      ${F.map(fm=>`<div class="kv"><span><b>${FORMEN[fm].name}</b>${rat&&fm===FORM_PASST[rl]?' 👴':''}</span><span>${formSteck(id,fm)}</span></div>${rat&&fm==='pfahl'?`<div class="mut">${FORM_PFAHL_HAND}</div>`:''}<div class="mitte">${knopf(fm)}</div>`).join('')}
      <div class="btns"><button class="sec" data-a="close">Abbrechen</button>${lehr?`<button data-a="formNimm" data-id="${id}" data-form="${sel}" data-weiter="${weiter}">Pflanzen am ${FORMEN[sel].name}</button>`:''}</div>`)},
  formNimm(d){const f=S.felder[d.id]; if(!f||f.reben||!formenFuer(d.id).includes(d.form)) return; f.form=d.form; closeSheet(); AKT[d.weiter==='pflanzAuftrag'?'pflanzAuftrag':'pflanzen']({id:d.id})},
  // Seit 14.2.4: Umstellen mit Sicherheitsabfrage (Annahme 12), nur von Januar bis April, seit 14.5.3 in allen Spielstufen.
  formAendern(d){if(istSL(d.id)) return; const id=d.id, alt=formVon(id), andere=formenFuer(id).filter(x=>x!==alt);
    if(andere.length===1) return AKT.formUmFrage({id,form:andere[0]});
    openSheet(`<h3>${esc(SORTEN[id].name)}: Form ändern</h3><p class="mut">Jetzt am ${FORMEN[alt].name}. ${FORM_WAHL_SATZ}</p>
      ${andere.map(fm=>`<div class="kv"><span><b>${FORMEN[fm].name}</b></span><span>${formSteck(id,fm)}</span></div><div class="mitte"><button data-a="formUmFrage" data-id="${id}" data-form="${fm}">${FORMEN[fm].name}</button></div>`).join('')}
      <div class="btns"><button class="sec" data-a="close">Abbrechen</button></div>`)},
  // Seit 14.5.3 (Bauplan 14.5, Unteretappe 3): Die Abfrage nennt in allen Spielstufen die drei Verluste in Zahlen: alle Entwicklungspunkte, die Jahre mit
  // halber Ernte bis zum Rebstock und die Weinstufen, deren Anspruch (ANSPRUCH) der Weinberg danach nicht mehr erreicht. Platzhalter, Wortlaut in Meilenstein 17.
  formUmFrage(d){const id=d.id, f=S.felder[id], k=formUmKosten(id,d.form), qa=qualWb(id), qn=qualTeile(id,{ep:0,pflSt:0,form:d.form,laub:0}).q,
      weg=Object.keys(STUFEN).filter(st=>ANSPRUCH[st]<=qa&&ANSPRUCH[st]>qn).map(st=>STUFEN[st].name);
    openSheet(`<h3>Auf ${FORMEN[d.form].name} umstellen?</h3><p>Der ${esc(SORTEN[id].name)} fängt mit der Erziehung von vorn an. Du verlierst:</p>
      <ol><li>alle ${epT(f.ep||0)} Entwicklungspunkte, die Stufe fällt von ${PFLEGE_STUFEN[f.pflSt||0]} auf ${PFLEGE_STUFEN[0]},</li><li>${EP_REBSTOCK_JAHRE} Jahre lang ${Math.round(STUFE_MENGE[0]*100)} % Ernte, bis der Rebstock wieder steht,</li>
      <li>${weg.length?`diese Weinstufen, deren Qualität der Weinberg dann nicht mehr schafft: ${weg.join(', ')}`:'keine Weinstufe, die Qualität reicht weiter'} (Qualität ${qa} jetzt, ${qn} danach).</li></ol><p class="mut">Die Reben bleiben stehen.</p><p class="mut">Das Umstellen kostet einen Rebschnitt der neuen Form, ${eur(k)}, und zählt als Rebschnitt ${S.jahr}. ${formSteck(id,d.form)}.</p>
      <div class="btns"><button class="sec" data-a="close">Abbrechen</button><button class="wag" data-a="formUm" data-id="${id}" data-form="${d.form}" ${S.geld<k?'disabled':''}>Umstellen</button></div>`)},
  formUm(d){const id=d.id, f=S.felder[id]; if(!f||!f.reben||S.schwer==='einfach'||S.monat>SCHNITT_BIS||!formenFuer(id).includes(d.form)||d.form===formVon(id)) return closeSheet();
    const k=formUmKosten(id,d.form); if(S.geld<k) return meldung('Zu wenig Geld',`Das Umstellen kostet ${eur(k)}.`);
    formUmstellen(id,d.form); fx('schere'); save(); render(); meldung('Umgestellt',`Der ${SORTEN[id].name} steht jetzt am ${FORMEN[d.form].name} und fängt als ${PFLEGE_STUFEN[0]} von vorn an.`)},
  // Seit 14.2.4: Sommerschnitt von Hand im Juni (Annahme 18). Platzhalter, Wortlaut in Meilenstein 17.
  sommerHand(d){const id=d.id; if(!laubHandOffen(id)) return; const k=laubHandKosten(id); if(S.geld<k) return meldung('Zu wenig Geld',`Der Sommerschnitt von Hand kostet ${eur(k)}.`);
    const a=laubHand(id); fx('schere'); save(); render(); meldung('Sommerschnitt',`Der ${SORTEN[id].name} ist für ${eur(k)} von Hand geschnitten: Die Lese ${S.jahr} bekommt ${LAUB_QP} Punkte Qualität und ${Math.round(LAUB_MENGE*100)} % mehr Menge${a?`, dazu +${a} Ansehen`:''}.`)},
  // Seit dem Nachtrag zu 14.5.2 (Annahmen 31 bis 34): Ausdünnen von Hand im August, ab dem Gutsherrn. Platzhalter, Wortlaut in Meilenstein 17.
  ausduennen(d){const id=d.id; if(!ausdOffen(id)) return; const k=ausdKosten(id); if(S.geld<k) return meldung('Zu wenig Geld',`Das Ausdünnen kostet ${eur(k)}.`);
    ausduennen(id); fx('schere'); save(); render();
    meldung('Ausdünnen',AUSD_MELDUNG.replace('{sorte}',SORTEN[id].name).replace('{kosten}',eur(k)).replace('{jahr}',S.jahr).replace('{qp}',AUSD_QP).replace('{m}',`${Math.round(AUSD_MENGE*100)} %`))},
  // Nachfrage im Sommer (Annahme 34): "Weiter ohne" fragt in diesem Monat nicht mehr und blättert weiter wie sonst.
  sommerOhne(){S.sommerGefragt=monatNr(); closeSheet(); AKT.weiter()},
  pflanzen(d){
    if(!sorteFrei(d.id)) return meldung('Noch nicht',`${SORTEN[d.id].name} kannst du ab dem Rang ${RAENGE[sorteAb(d.id)].name} pflanzen.`);
    if(sektSorte(d.id)&&!S.sektkeller) return meldung('Erst der Sektkeller',`Die ${ROLLEN.sekt.name} macht nur Sekt. Kauf erst den Sektkeller im Keller.`);
    // Seit 13.4.9: Die Spitzen-Sorte nur auf freiem Südhang. Seit dem Nachtrag zu 14.5 (jede Lage eine Sorte) jede Sorte nur auf freiem Land ihrer Lage (platzFuer).
    if(!istSL(d.id)&&platzFuer(d.id)<10) return meldung(`Kein Platz: ${LAGEN[lageVon(d.id)].kurz}`,lageKeinSatz(d.id)); // Platzhalter, Wortlaut in Meilenstein 17
    if(istSL(d.id)&&slPlatz()<10) return meldung('Kein Platz',`Auf deiner ${SL_NAME} stehen alle Reben, nachgepflanzt wird nur, was eingegangen ist.`); // Platzhalter, Wortlaut in Meilenstein 17
    const so=SORTEN[d.id], pr=rebenPreis(d.id), frei=platzFuer(d.id), kap=helferReben()-rebenGesamt(), max=Math.min(frei,kap,Math.floor(S.geld/pr/10)*10);
    if(frei>=10&&kap<10) return leuteSheet('Zu wenige Erntehelfer',`<p>${helferRegel()}. Deine Leute reichen für ${rbn(helferReben())} Reben, gepflanzt sind ${rbn(rebenGesamt())}.</p><p class="mut">Stell erst beim Arbeitsamt ein${maschFrei('klein')&&!S.maschinen.some(x=>x.typ==='klein')?` oder kauf eine Erntemaschine, mit ${MASCH.klein.fahrer} Fahrer deckt sie ${MASCH_HELFER} Hektar ab`:''}.</p>`);
    if(max<10) return meldung('Geht gerade nicht',`Dir fehlt das Geld oder der Platz für ${rbn(10)} Reben.`);
    mengeSheet({titel:`${so.name} pflanzen`,text:`${eur2(pr/STOCK_F)} je Rebe${pr!==so.preis?`, üblich sind ${eur2(so.preis/STOCK_F)}`:''}. Neue Reben übernehmen die Pflegestufe der Sorte. Deine Erntehelfer reichen noch für ${rbn(kap)} Reben${kap<frei?', für mehr musst du erst einstellen':''}.${istSL(d.id)?'':' '+lageNurSatz(d.id)}`,max,step:10,start:Math.min(max,1000),okText:'Pflanzen',zahl:rbn,
      info:n=>`<b>${rbn(n)} Reben</b>kostet ${eur(n*pr)}`,
      ok:n=>{fx('stempel');zahle(Math.round(n*pr*100)/100);const f=S.felder[d.id];rebenDazu(d.id,n);if(S.verlust&&S.verlust[d.id])S.verlust[d.id]=Math.max(0,S.verlust[d.id]-n)}});
  },
  // Seit 13.5.3: Ab Erntehelfer Stufe 3 gibt der Spieler nur noch den Auftrag, Sorte und Menge. Gepflanzt wird beim Weiterblättern bis März.
  pflanzAuftrag(d){
    if(!sorteFrei(d.id)) return meldung('Noch nicht',`${SORTEN[d.id].name} kannst du ab dem Rang ${RAENGE[sorteAb(d.id)].name} pflanzen.`);
    if(sektSorte(d.id)&&!S.sektkeller) return meldung('Erst der Sektkeller',`Die ${ROLLEN.sekt.name} macht nur Sekt. Kauf erst den Sektkeller im Keller.`);
    const f=S.felder[d.id], andere=R().sorten.filter(x=>x!==d.id&&lageVon(x)===lageVon(d.id)&&pflanzMitA(x)).reduce((a,x)=>a+pflanzSoll(x),0), v=(S.verlust||{})[d.id]||0, max=Math.max(0,(istSL(d.id)?slPlatz():platzFuer(d.id)-andere)-v); // seit dem Nachtrag zu 14.5 nur die eigene Lage
    // Seit 13.5.8 (Entscheidung 11): Der Platz eingegangener Reben anderer Sorten ohne Auftrag zählt mit, der Auftrag bekommt ihn zuerst.
    const fremd=R().sorten.filter(x=>x!==d.id&&!pflanzMitA(x)).reduce((a,x)=>a+((S.verlust||{})[x]||0),0);
    if(max<10&&!f.auftrag&&!v&&!istSL(d.id)) return meldung(`Kein Platz: ${LAGEN[lageVon(d.id)].kurz}`,lageKeinSatz(d.id));
    if(max<10&&!f.auftrag) return meldung('Kein Platz',`Auf deinem Land ist kein Platz mehr frei${v?`, deine Erntehelfer pflanzen nur die ${rbn(v)} eingegangenen Reben nach`:''}.`);
    mengeSheet({titel:`Auftrag: ${SORTEN[d.id].name}`,text:`Deine Erntehelfer pflanzen bis März, ${mgrSt('weingut')?`die Reben kauft ${mgrG('weingut').dein} ${MGR_BEREICHE.weingut.name} so günstig wie möglich`:'die Reben kaufen sie gleich zum Preis des Monats'}.${v?` Die ${rbn(v)} eingegangenen Reben pflanzen sie sowieso nach.`:''}${fremd>=10?` Dein Auftrag bekommt den Platz eingegangener Reben anderer Sorten zuerst, ohne Auftrag pflanzen sie dort die alte Sorte nach.`:''}`,
      max,step:10,start:Math.min(max,f.auftrag||1000),okText:'Auftrag geben',zahl:rbn,
      info:n=>`<b>${rbn(n)} Reben</b>${String(Math.round(n/HA_REBEN*10)/10).replace('.',',')}\u00a0Hektar, heute ${eur(n*rebenPreis(d.id))}`,
      ok:n=>{fx('stempel');f.auftrag=n}});
  },
  roden(d){
    const f=S.felder[d.id]; if(!f||istSL(d.id)) return; // seit 14.4.4: die Spitzenlage wird nicht gerodet
    mengeSheet({titel:`${SORTEN[d.id].name} roden`,text:`Roden kostet ${eur2(.5/STOCK_F)} je Rebe. ${istSL(d.id)?'Die Fläche wird frei.':LAGE_SATZ.roden.replace('{lage}',LAGEN[lageVon(d.id)].name)}`,max:f.reben,step:10,start:0,okText:'Roden',zahl:rbn,
      info:n=>`<b>${rbn(n)} Reben</b>kostet ${eur(n*.5)}`,
      ok:n=>{zahle(n*.5);f.reben-=n;if(!f.reben) delete f.form}});
  },
  lesen(d){
    const f=S.felder[d.id], so=SORTEN[d.id];
    // Seit 13.3.3: Die Sekt-Sorte wählt nur das Hefelager, gelesen wird alles.
    if(sektSorte(d.id)){
      const l=feldLiter(f,'alles'), k=Math.round(l*sektKosten());
      // Seit 14.7.5: Macht der Kellermeister den Sekt (Automatik), gilt die Vorwahl des Spielers, dann steht nur sie hier (Annahme 14).
      const vw=kellerMacht('sekt'), opt=[[SEKT_REIFE,`${SEKT_REIFE} Monate reifen`],[HEFE_LANG,`${HEFE_LANG} Monate auf der Hefe`]].filter(([h])=>!vw||h===sektVorwahl()).map(([h,t])=>`<button class="wahl" data-a="sektLeseJa" data-id="${d.id}" data-h="${h}" ${l<=0||!S.sektkeller?'disabled':''}><b>${t}</b><br><span class="mut">${num(l)} Flaschen Sekt${h>SEKT_REIFE?` · +${HEFE_LANG_P} % Preis und Jury-Punkte`:''} · verkaufsreif ${inMonaten(h)}</span></button>`).join('');
      return openSheet(`${sbild('sektkeller')}<h3>${so.name} lesen</h3><p class="mut">Die ${ROLLEN.sekt.name} macht nur Sekt. Nach der Lese legst du die Trauben noch diesen Monat in den Sektkeller${kellerMacht('sekt')?', das machen deine Kellerleute':''}. Sektflasche, Korken und Agraffe kosten dann ${eur(k)}. ${vw?CHEFSACHE_TEXT.lese.replace('{wo}',CHEFSACHE_TEXT[csBeiMgr()?'woMgr':'woKeller']):'Hier wählst du nur, wie lange er auf der Hefe liegt.'}</p>${S.sektkeller?'':'<p class="rot">Ohne Sektkeller gibt es keinen Sekt.</p>'}${leseFaktor()<1?`<p class="rot">Deine Ernteleistung reicht nur für ${Math.floor(leseFaktor()*100)}\u00a0%. Den Rest liest keiner, er ist verloren.</p>`:''}${opt}${mib('lese')}<div class="btns"><button class="sec" data-a="close">Abbrechen</button></div>`);
    }
    const opt=['reif','ueber','alles'].map(la=>{const b=besteStufe(feldQ(f,la)),l=feldLiter(f,la);
      return `<button class="wahl" data-a="leseFrage" data-id="${d.id}" data-la="${la}" ${l<=0?'disabled':''}><b>${LESE[la]}</b><br><span class="mut">${num(l)}\u00a0l mit ${feldQ(f,la).oe}° Öchsle · reicht für: ${b?stufeText(b,feldQ(f,la).oe):'nichts'}${b?`<br>💶 Wert rund ${eur(leseWert(d.id,la,b,l))}<br>${verkaufAb(d.id,b)}`:''}</span></button>`}).join('');
    openSheet(`${sbild(f.gefroren?'eiswein':'lese')}<h3>${so.name} lesen</h3><p class="mut">Jedes Feld liest du nur einmal im Jahr. Was die Leseart nicht mitnimmt, ist danach verloren. Die Trauben müssen noch diesen Monat gekeltert werden.${MOST_UEBER<1&&f.ueber>0?` Überreife Trauben sind schon eingetrocknet und geben nur ${Math.round(MOST_UEBER*100)} % Most.`:''}</p>${f.gefroren?`<p class="hilfe" style="margin:0 0 10px">${eisFehlt(f)?eisFehlt(f)+'. Es reicht nur für die Stufen oben.':'Eiswein gibt es nur aus reifen oder aus überreifen Trauben, nicht aus beiden zusammen.'}</p>`:wagnisHinweis(d.id)?`<p class="hilfe" style="margin:0 0 10px">${wagnisHinweis(d.id).replace(/^<br>/,'')}</p>`:''}${leseFaktor()<1?`<p class="rot">Deine Ernteleistung reicht nur für ${Math.floor(leseFaktor()*100)}\u00a0%. Den Rest liest keiner, er ist verloren.</p>`:''}${handFeld(f)?`<p class="hilfe" style="margin:0 0 10px">${handText(f,'')}${handFehlt(f)?' Stell vorher beim Arbeitsamt ein, dann liest die Hand.':''}</p>`:''}${opt}${mib('lese')}<div class="btns"><button class="sec" data-a="close">Abbrechen</button></div>`);
  },
  // Version 5.1 (Paket 10): Sicherheitsabfrage, bevor gelesen wird. "Zurück" führt wieder zur Wahl der Leseart.
  leseFrage(d){
    const f=S.felder[d.id], so=SORTEN[d.id], q=feldQ(f,d.la), l=feldLiter(f,d.la), b=besteStufe(q); if(l<=0) return;
    openSheet(`<h3>${so.name} jetzt lesen?</h3><p>Du liest ${LESE[d.la]}${q.masch?' mit der Maschine':handFeld(f)?' von Hand':''}: ${num(l)} l mit ${q.oe}° Öchsle, das reicht für ${b?stufeText(b,q.oe):'nichts'}.${b?` Wert rund ${eur(leseWert(d.id,d.la,b,l))}.`:''}</p>${q.masch?`<p class="rot">Für die Handlese fehlen ${handBedarf(f)-S.helfer} Erntehelfer, deshalb gibt es höchstens Qualitätswein.</p>`:''}<p class="mut">Danach ist das Feld für dieses Jahr gelesen. Das lässt sich nicht rückgängig machen.</p><div class="mitte"><button class="siegel" data-a="leseJa" data-id="${d.id}" data-la="${d.la}">Okay</button></div><div class="btns"><button class="sec" data-a="lesen" data-id="${d.id}">Zurück</button></div>`);
  },
  // Eine Lese je Feld und Jahr: Die Leseart nimmt das ganze Feld. Alte Spielstände mit angefangener Teil-Lese lesen so den Rest.
  // Version 4.4: danach im Weinberg bleiben und neu zeichnen, damit der Lesen-Knopf sofort verschwindet.
  sektLeseJa(d){const f=S.felder[d.id]; closeSheet(); if(!sektSorte(d.id)||feldLiter(f,'alles')<=0) return; const t=TAB,s=SUB,y=window.scrollY, l=lese(d.id,'alles',1,+d.h); TAB=t; SUB=s; save(); render(); window.scrollTo(0,y);
    if(l) meldung('Sekt-Trauben im Keller',`${num(l.liter)} Flaschen ${lotName(l)} warten im Keller. ${kellerMacht('sekt')?'Deine Kellerleute legen sie beim Weiterblättern in den Sektkeller.':'Leg sie noch diesen Monat im Keller in den Sektkeller, sonst verderben sie.'} Nach ${lager(l).min} Monaten auf der Hefe wird abgefüllt.`,'sektkeller')},
  // Seit 13.5.8: die zwei Handgriffe beim Sekt, bis Lagerarbeiter Stufe 3.
  sektUmlagern(d){const l=lot(d.id); if(!sektUmlagern(l)) return; save(); render(); meldung('Sekt auf der Hefe',`${num(l.liter)} Flaschen ${lotName(l)} liegen jetzt im Sektkeller, abfüllen kannst du ${inMonaten(lager(l).min)}.${l.ans?` +${l.ans} Ansehen für den ersten Sekt des Jahres.`:''}`,'sektkeller')},
  sektAbfuellen(d){const l=lot(d.id); if(!l||!sektFertig(l)) return; sektAbfuellen(l); save(); render()},
  leseJa(d){const f=S.felder[d.id]; closeSheet(); if(feldLiter(f,d.la)<=0) return; const t=TAB,s=SUB,y=window.scrollY; lese(d.id,d.la,1); TAB=t; SUB=s; save(); render(); window.scrollTo(0,y)},
  /* ---- Hintertür: Panschen ---- */
  zuckern(d){
    const l=lot(d.id), k=d.k, zu=k==='zucker'; if(!l||l.status!=='trauben'||!hinterOffen()) return;
    const hat=l[k]||0, bis=zu?zuckerBis(l):ZUCKER_MAX-hat; if(bis<1) return;   // seit 13.7.8: Zucker nur bis zum Deckel des Weinbergs
    const neu=n=>zu?{oe:zuckerOe(l,n),liter:l.liter}:{oe:Math.round(l.oe/(1+n/100)),liter:Math.round(l.liter*(1+n/100))};
    mengeSheet({titel:zu?'Most zuckern':'Most wässern',text:zu?`Zucker hebt die Öchsle um den gewählten Anteil, höchstens bis zum Deckel des Weinbergs (${deckel(l.sorte)}°).`:'Wasser streckt die Menge um den gewählten Anteil, die Öchsle sinken entsprechend.',min:1,max:bis,step:1,start:Math.min(5,bis),okText:zu?'Zuckern':'Wässern',wag:1,
      info:n=>{const x=neu(n);return `<b>${n}\u00a0%</b>danach ${num(x.liter)}\u00a0l mit ${x.oe}° Öchsle<br><span class="${hat+n>ZUCKER_ERLAUBT?'rot':'mut'}">${hat+n>ZUCKER_ERLAUBT?'Über '+ZUCKER_ERLAUBT+' %: Das ist Panscherei.':'Als Tafelwein noch erlaubt.'}</span>${hat+n>ZUCKER_ERLAUBT&&KONTR_ZEIGE[S.schwer]==='warnung'?`<br><span class="mut">${kontrWarn()}</span>`:''}`},
      ok:n=>{if(zu) return zuckerDazu(l,n); const x=neu(n);l.oe=x.oe;l.liter=x.liter;l[k]=hat+n}});   // seit dem Nachtrag zu 14.7.1 merkt sich zuckerDazu die Öchsle davor
  },
  misch1(){
    if(!hinterOffen()) return;
    const mi=S.lots.filter(mischbar), ls=mi.filter(a=>mi.some(b=>a!==b&&farbe(a)===farbe(b)));
    openSheet(`${sbild('fassgang')}<h3>Fässer verschneiden</h3><p class="mut">Wähle das erste Fass.</p>${ls.map(l=>`<button class="wahl" data-a="misch2" data-id="${l.id}"><b>${dot(l.sorte)}${esc(lotName(l))}</b><br><span class="mut">${num(l.liter)}\u00a0l · ${l.oe}° Öchsle · Qualität ${l.qp}</span></button>`).join('')}<div class="btns"><button class="sec" data-a="close">Abbrechen</button></div>`);
  },
  misch2(d){
    const a=lot(d.id); if(!a) return;
    const ls=S.lots.filter(b=>mischbar(b)&&b!==a&&farbe(b)===farbe(a));
    openSheet(`${sbild('fassgang')}<h3>${esc(lotName(a))} mischen mit</h3>${ls.map(b=>{const m=mischung(a,b);return `<button class="wahl" data-a="misch3" data-id="${a.id}" data-b="${b.id}"><b>${dot(b.sorte)}${esc(lotName(b))}</b><br><span class="mut">${num(b.liter)}\u00a0l · ergibt ${num(m.liter)}\u00a0l ${STUFEN[m.a.stufe].name} mit Qualität ${m.qp}</span></button>`}).join('')}<div class="btns"><button class="sec" data-a="close">Abbrechen</button></div>`);
  },
  misch3(d){
    const a=lot(d.id), b=lot(d.b); if(!a||!b) return; const m=mischung(a,b);
    openSheet(`${sbild('fassgang')}<h3>Wirklich verschneiden?</h3><p>Aus ${esc(lotName(m.a))} (${num(m.a.liter)}\u00a0l) und ${esc(lotName(m.b))} (${num(m.b.liter)}\u00a0l) werden ${num(m.liter)}\u00a0l ${esc(lotName(m.a))}.</p>
      <div class="kv"><span>Öchsle</span><span>${m.oe}°</span></div><div class="kv"><span>Qualität</span><span>${m.qp}</span></div><div class="kv"><span>Schmiergeld für den Beamten</span><span>${eur(m.schmier)}</span></div>
      <p class="rot">Der Wein gilt als gepanscht. Findet ihn der Prüfer, wird er vernichtet und es gibt Strafe.</p>
      <div class="btns"><button class="sec" data-a="close">Lieber nicht</button><button class="wag" data-a="mischJa" data-id="${a.id}" data-b="${b.id}" ${S.geld<m.schmier?'disabled':''}>Verschneiden</button></div>`);
  },
  mischJa(d){
    const x=lot(d.id), y=lot(d.b); if(!x||!y||!mischbar(x)||!mischbar(y)||!hinterOffen()) return; const m=mischung(x,y), a=m.a;
    if(S.geld<m.schmier) return;
    closeSheet(); fx('stempel'); zahle(m.schmier);
    // Seit 13.2.2: Der Verschnitt trägt die niedrigere Pflege- und Boden-Stufe der beiden Weine, für Preisbonus und Namen.
    Object.assign(a,{liter:m.liter,oe:m.oe,qp:m.qp,fassMonate:Math.max(a.fassMonate,m.b.fassMonate),pansch:true,jh:a.jh&&m.b.jh?1:0,...(a.durch||m.b.durch?{durch:a.durch||m.b.durch}:{}),pfl:Math.min(a.pfl||0,m.b.pfl||0),bst:Math.min(a.bst||0,m.b.bst||0),...(m.oeT!=null?{oeT:m.oeT}:{})});
    S.lots=S.lots.filter(l=>l!==m.b); save();render();
    meldung('Verschnitten',`${lotName(a)}: ${num(a.liter)}\u00a0l mit Qualität ${a.qp}. Bis er verkauft ist, darf ihn kein Prüfer finden.`,'fassgang');
  },
  /* ---- Weinkontrolle ---- */
  pruefJa(){if(!S.pruefer) return; const t=pruefEnde(0); save();render(); meldung('🔍 Erwischt',t,'kontrolle')},
  pruefBestechen(){
    if(!S.pruefer) return;
    const max=Math.floor(Math.min(BESTECH_MAX,S.geld)/1000)*1000; if(max<BESTECH_MIN) return;
    mengeSheet({titel:'Prüfer bestechen',text:`Je dicker der Umschlag, desto eher nimmt er ihn. Lehnt er ab, behältst du dein Geld, aber er prüft erst recht${strafeAns(BESTECH_NEIN_ANS)>strafeAns()?` und es kostet ${BESTECH_NEIN_ANS} Ansehen extra`:''}.`,min:BESTECH_MIN,max,step:1000,start:Math.min(max,20000),okText:'Umschlag rüberschieben',bild:'kontrolle',wag:1,
      info:n=>`<b>${eur(n)}</b>Er nimmt mit ${Math.round(bestechChance(n)*100)}\u00a0% an`,
      ok:n=>{
        if(Math.random()<bestechChance(n)){zahle(n); kontrNeu(); S.pruefer=0; meldung('🔍 Glück gehabt','Der Prüfer steckt den Umschlag ein, blättert kurz durchs Kellerbuch und findet nichts.','kontrolle')}
        else{meldung('🔍 Erwischt','Der Prüfer schiebt den Umschlag zurück und schaut jetzt ganz genau hin. '+pruefEnde(BESTECH_NEIN_ANS),'kontrolle')}
      }});
  },
  /* ---- Version 10.0: Stimmen kaufen im Wahlkampf, höchstens KAUF_MAX je Wahl, nur mit Geld auf dem Konto. Auch ein aufgeflogener Kauf zählt mit ---- */
  stimmKauf(){
    const A=S.amt; if(!amtKampf()||A.kauf>=KAUF_MAX) return;
    if(S.geld<KAUF_PREIS) return meldung('Zu wenig Geld',`Stimmen kosten ${eur(KAUF_PREIS)}. So viel liegt gerade nicht auf deinem Konto, und einen Kredit gibt es dafür nicht.`,'wahl');
    const frei=KAUF_MAX-A.kauf;
    openSheet(`${sbild('wahl')}<h3>🗳️ Stimmen kaufen</h3><p>Ein paar dicke Umschläge an den richtigen Tischen, und der Verband sieht dich gleich freundlicher. Ein Präsident spielt keine schmutzigen Spiele. Offiziell. Das kostet ${eur(KAUF_PREIS)} und hebt die Stimmung um ${KAUF_PLUS}.</p>
      <p class="mut">Mit ${pz(KAUF_SKANDAL)} fliegt es auf. Dann ist das Geld weg, die Stimmung fällt um ${KAUF_STRAFE} und der Winzerbote bringt den Skandal. ${frei===1?'Das ist dein letzter Kauf vor dieser Wahl.':`Vor dieser Wahl gehen noch ${frei} Käufe.`}</p>
      <div class="btns"><button class="sec" data-a="close">Lieber nicht</button><button class="wag" data-a="stimmKaufJa">Umschläge verteilen</button></div>`);
  },
  stimmKaufJa(){
    const A=S.amt; if(!amtKampf()||A.kauf>=KAUF_MAX||S.geld<KAUF_PREIS) return;
    closeSheet(); A.kauf++; zahle(KAUF_PREIS);
    if(Math.random()<KAUF_SKANDAL){
      stimmung(-KAUF_STRAFE); A.skandal=1; save();render();
      meldung('🗳️ Aufgeflogen',`Ein Umschlag ist am falschen Tisch gelandet. Die ${eur(KAUF_PREIS)} sind weg, und die Stimmung fällt um ${KAUF_STRAFE} auf ${stimmZ()}. Im nächsten Winzerboten steht der Skandal.`,'wahl');
    }else{
      stimmung(KAUF_PLUS); save();render();
      meldung('🗳️ Es hat geklappt',`Die Umschläge sind angekommen. An ein paar Tischen im Verband redet man plötzlich freundlicher über dich. Die Stimmung steigt um ${KAUF_PLUS} auf ${stimmZ()}.`,'wahl');
    }
  },
  // Tipp ins Bild öffnet den Ort des Motivs.
  bild(d,e){const s=panoTipp(e); if(s&&s!==SUB){SUB=s;render()}},
  keltern(d){
    const l=lot(d.id), frei=S.fassraum-fassBelegt();
    if(frei<=0) return meldung('Kein Fassraum frei','Kauf erst Fassraum dazu, sonst kannst du nicht keltern.','fassgang');
    if(l.liter>frei) return openSheet(`${sbild('fassgang')}<h3>Fassraum reicht nicht</h3><p>Frei sind ${num(frei)}\u00a0l, du hast ${num(l.liter)}\u00a0l Trauben. Wenn du jetzt kelterst, gehen ${num(l.liter-frei)}\u00a0l verloren.</p><div class="btns"><button data-a="close">Erst Fassraum kaufen</button><button class="wag" data-a="kelternJa" data-id="${l.id}">Trotzdem keltern</button></div>`);
    AKT.kelternJa(d);
  },
  kelternJa(d){const l=lot(d.id);closeSheet();l.liter=Math.min(l.liter,S.fassraum-fassBelegt());l.status='fass';l.fassMonate=0;save();render()},
  kaufFass(){
    const kap=fassKap()-S.fassraum, max=Math.min(20000,kap,Math.floor(S.geld/fassPreis()/500)*500);
    if(kap<500) return leuteSheet('Zu wenige Kellerleute',`<p>${lagerRegel()}. Betreut werden so ${num(fassKap())}\u00a0l, du hast schon ${num(S.fassraum)}\u00a0l.</p><p class="mut">Für mehr Fassraum stell erst beim Arbeitsamt ein.</p>`);
    if(max<500) return meldung('Zu wenig Geld',`500 l Fassraum kosten ${eur(500*fassPreis())}.`);
    mengeSheet({titel:'Fassraum kaufen',bild:'fassgang',text:`${eur2(fassPreis())} je Liter Fassraum. Betreut werden noch ${num(kap)}\u00a0l mehr.`,max,step:500,start:Math.min(max,2000),okText:'Kaufen',
      info:n=>`<b>${num(n)}\u00a0l</b>kostet ${eur(n*fassPreis())}`,ok:n=>{fx('stempel');zahle(n*fassPreis());S.fassraum+=n}});
  },
  kaufFlaschen(){
    const kap=flKap()-S.flaschen, max=Math.min(30000,kap,Math.floor(S.geld/flaschePreis()/100)*100);
    if(kap<100) return leuteSheet('Zu wenige Kellerleute',`<p>${lagerRegel(flJeLager())}. Betreut werden so ${num(flKap())} leere Flaschen, du hast schon ${num(S.flaschen)}.</p><p class="mut">Für mehr Flaschen stell erst beim Arbeitsamt ein, oder füll erst Wein ab.</p>`);
    if(max<100) return meldung('Zu wenig Geld',`100 Flaschen kosten ${eur(100*flaschePreis())}.`);
    mengeSheet({titel:'Leere Flaschen kaufen',text:`${eur2(flaschePreis())} je Flasche (1 Liter). Betreut werden noch ${num(kap)} mehr.`,max,step:100,start:Math.min(max,2000),okText:'Kaufen',
      info:n=>`<b>${num(n)} Flaschen</b>kostet ${eur(n*flaschePreis())}`,ok:n=>{fx('stempel');zahle(n*flaschePreis());S.flaschen+=n}});
  },
  anmelden(d){
    const l=lot(d.id);
    const M=mani(l);
    // Oben die Stufen, die jetzt gehen. Darunter der Hinweis auf Stufen, die nur am Januar scheitern. Der Rest ist zugeklappt.
    const A=[...REIHE].reverse().concat('feder').filter(st=>rolleDarf(l.sorte,st)).map(st=>({st,g:pruefeAnmeldung(l,st)}));
    const jan=a=>a.g.length&&S.jahr===l.jahrgang&&a.g.every(x=>/Januar/.test(x));
    // Seit 14.5.6: Stufen, bei denen allein die Punkte fehlen, stehen ab dem 2. Akt als Wagnis da (wag), nicht mehr unter "Nicht möglich".
    const wag=A.filter(a=>a.g.length&&pruefFehlt(l,a.st)), ok=A.filter(a=>!a.g.length), spaeter=A.filter(jan), nein=A.filter(a=>a.g.length&&!wag.includes(a));
    const zeig=PRUEFER_ZEIGE[S.schwer]||'';
    // Seit 14.5.6: die Presse beim Präsidenten als eigener Knopf unter der Stufe, in den Lehrjahren mit Rat ab PRESSE_RAT_AB Chance. Platzhalter, Wortlaut in Meilenstein 17.
    const presseZeile=(st,p,wg)=>presseGeht(l,st)?`<div class="row"><span class="mut">${zeig==='chance'&&presseRat(p)?PRESSE_RAT:''}</span><button class="klein wag" data-a="anmeldeJa" data-id="${l.id}" data-st="${st}" data-presse="1"${wg?' data-wag="1"':''}>${PRESSE_KNOPF}</button></div>`:'';
    const zeile=({st,g})=>{const s=STUFEN[st],ill=M&&!maniLegal(l,st);
      return `<div class="stufe"><div class="row"><b>${g.length?'✗':'✓'} ${s.name}</b>${g.length?'':`<button class="klein ${ill?'wag':''}" data-a="anmeldeJa" data-id="${l.id}" data-st="${st}">${ill?`🤫 Unter der Hand (${eur(s.geb+schmier(l,st))})`:`Anmelden${s.geb?' ('+eur(s.geb)+')':''}`}</button>`}</div>${g.length?`<div class="mut">${g.map(esc).join(' · ')}</div>`:oeUeber(st,l)?`<div class="mut">${oeUeber(st,l)}° über der Schwelle, Preis +${pz(oePreisF(st,l)-1)}</div>`:''}${g.length?'':presseZeile(st,1,0)}</div>`};
    // Seit 14.5.6: das Wagnis je Spielstufe (PRUEFER_ZEIGE): Lehrjahre Chance und Rat, Gesellenjahre die fehlenden Punkte, Meisterprüfung nur das Urteil.
    const wagZeile=({st})=>{const s=STUFEN[st], n=pruefFehlt(l,st), p=pruefChance(n), an=ansNeu(l,st)?ansDurch(st):0;
      const info=WAGNIS_INFO[zeig].replace('{p}',pz(p)).replace('{fehlt}',`Es ${n===1?'fehlt 1 Punkt':`fehlen ${n} Punkte`} Qualität (ab ${ANSPRUCH[st]} Punkten)`)
        .replace('{tiefer}',STUFEN[herabStufe(l,st)].name).replace('{abschlag}',pz(DURCH_PREIS)).replace('{ans}',an?WAGNIS_ANS.replace('{n}',an):'')+(zeig==='chance'?' '+(pruefRat(l,st,n)?WAGNIS_RAT_JA:WAGNIS_RAT_NEIN):'');
      return `<div class="stufe"><div class="row"><b>⚖️ ${s.name}</b><button class="klein wag" data-a="anmeldeJa" data-id="${l.id}" data-st="${st}" data-wag="1">${WAGNIS_KNOPF}${s.geb?' ('+eur(s.geb)+')':''}</button></div><div class="mut">${esc(info)}</div>${presseZeile(st,p,1)}</div>`};
    const presseKopf=presseFrei()&&[...ok,...wag].some(a=>presseGeht(l,a.st))?`<div class="hilfe" style="margin:10px 0">${PRESSE_INFO}</div>`:presseRecht()&&!presseFrei()?`<div class="mut" style="margin:10px 0">${PRESSE_SCHON}</div>`:'';
    // Seit 14.5.5: Der Weinprüfer nennt, welcher Schlüssel zur nächsten Stufe fehlt (Rang, Öchsle, Punkte), in allen Spielstufen.
    // Gepanschter Most geht an ihm vorbei (unter der Hand, Entscheidungen 53 und 59). Platzhalter, Wortlaut in Meilenstein 17.
    // Seit 14.5.6: Steht die nächste Stufe schon als Wagnis da, sagt die Zeile des Wagnisses je Spielstufe, was fehlt (Meisterprüfung nur das Urteil).
    const PN=M?null:prueferNaechste(l), pruefer=PN&&PN.g.length&&!wag.some(a=>a.st===PN.st)?`<div class="hilfe" style="margin:10px 0">${PRUEFER_NAECHSTE.replace('{stufe}',STUFEN[PN.st].name).replace('{fehlt}',PN.g.map(esc).join(' · '))}</div>`:'';
    const zeilen=presseKopf+(ok.length?ok.map(zeile).join(''):'<div class="mut">Gerade geht keine Stufe.</div>')+(wag.length?`<div style="margin-top:10px"><b>${WAGNIS_KOPF}</b></div>${wag.map(wagZeile).join('')}`:'')+pruefer
      +(spaeter.length?`<div class="hilfe" style="margin:10px 0">📅 Ab Januar möglich: <b>${spaeter.map(a=>STUFEN[a.st].name).join(', ')}</b>.${ok.length?' Meldest du jetzt an, verschenkst du die bessere Stufe.':''}</div>`:'')
      +(nein.length?`<details class="stz"><summary>Nicht möglich (${nein.length})</summary>${nein.map(zeile).join('')}</details>`:'');
    openSheet(`${sbild('amt')}<h3>${esc(lotName(l))} anmelden</h3><p class="mut">${num(l.liter)}\u00a0l · ${l.oe}° Öchsle · ${LESE[l.leseart]} · Edelfäulnis ${l.edel?'ja':'nein'} · ${l.fassMonate} Monate im Fass</p>${M?`<p class="hilfe" style="margin:0 0 10px">🤫 Dieser Most ist ${maniText(l)}. Erlaubt ist das nur beim Tafelwein bis ${ZUCKER_ERLAUBT}\u00a0%. Alles andere geht nur unter der Hand gegen Schmiergeld, und der Wein gilt dann als gepanscht.</p>`:''}${zeilen}${mib('keller')}<div class="btns"><button class="sec" data-a="close">Schließen</button></div>`);
  },
  anmeldeJa(d){
    const l=lot(d.id), st=d.st, s=STUFEN[st]; if(!l||!s) return;
    // Seit 14.5.6: mit Wagnis (d.wag) nur, wenn allein die Punkte fehlen (pruefFehlt), sonst wie bisher nur sicher. Mit Presse (d.presse) nur, wenn sie geht.
    const n=d.wag?pruefFehlt(l,st):0; if(d.wag?!n:pruefeAnmeldung(l,st).length) return;
    const presse=!!d.presse&&presseGeht(l,st); if(d.presse&&!presse) return;
    // Gepanschter Most: nur unter der Hand, mit Schmiergeld und ohne Ansehen. Seit 14.5.5 bringt jeder gezuckerte oder gewässerte Wein kein Ansehen (ohneAns),
    // auch der erlaubte Tafelwein (Entscheidungen 53 und 59), und bekommt nur, was seine Qualität sicher hergibt (dritter Schlüssel in pruefeQualitaet).
    const ill=mani(l)&&!maniLegal(l,st), sg=ill?schmier(l,st):0, ohneAns=mani(l);
    if(ill&&S.geld<s.geb+sg) return meldung('Zu wenig Geld',`Der Beamte will ${eur(sg)} Schmiergeld${s.geb?`, dazu kommt die Gebühr von ${eur(s.geb)}`:''}.`);
    zahle(s.geb+sg); if(ill) l.pansch=true;
    // Seit 14.5.6: das Urteil fällt sofort und fest (Annahme 22). Durchgefallen: herabgestuft mit Kennzeichen (l.durch merkt die angemeldete Stufe), die Gebühr ist weg.
    // Für den Kellerausbau zählt die Stufe nach dem Urteil (Maik 25.11.2026, Frage 6).
    const ok=!n||urteil(l,st,pruefChance(n)), stE=ok?st:herabStufe(l,st); l.stufe=stE; if(!ok) l.durch=st;
    if(presse) S.presseJ={j:S.jahr,n:(S.presseJ&&S.presseJ.j===S.jahr?S.presseJ.n:0)+1};
    const kw=kellerWein(l,stE);
    // Seit 14.5.2 (Annahme 1): Die Qualität hat der Wein seit der Lese (l.qp), die Anmeldung rechnet nichts mehr.
    // Ansehen gibt es je Sorte, Jahrgang und Stufe nur einmal, auch wenn die Lese auf mehrere Fässer verteilt ist. S.ansGeb merkt sich das.
    // Seit 14.5.6 gilt der Schlüssel auch für den durchgefallenen Wein, das Durchfallen kostet je Weinberg, Jahrgang und Stufe einmal.
    const ak=ansKey(l,st), AG=S.ansGeb=(S.ansGeb||[]).filter(k=>+k.split('|')[1]>=S.jahr-2), erst=!AG.includes(ak);
    if(s.ans&&!ohneAns&&erst) AG.push(ak);
    // Seit 13.6.2: Der Jahrhundertwein bringt bei der Anmeldung einmal JH_ANS Ansehen dazu, je Jahrgang einmal (S.jhAns).
    const jhA=ok&&jhWein(l)&&!ohneAns&&!(S.jhAns=S.jhAns||[]).includes(l.jahrgang); if(jhA) S.jhAns.push(l.jahrgang);
    // Seit 14.2.6: plus 1 Ansehen je ANS_JE_QP Punkte (bis 14.5.4 dazu minus ANSPRUCH_ANS je fehlendem Punkt, ausgeschaltet).
    // Seit 14.5.6 mit der Presse (ansErfolg), durchgefallen kein Ansehen und ab dem 3. Akt der Abzug (ansDurch). JH_ANS wird nicht verdoppelt.
    const dn=!ok&&erst&&!ohneAns?ansDurch(st,presse):0;
    const ans=ok?(s.ans&&!ohneAns&&erst?ruhm(ansErfolg(l,st,presse),0,'Weine'):0)+(jhA?ruhm(JH_ANS,0,'Weine'):0):dn?ruhm(-dn,0,'Weine'):0;closeSheet();save();render();fx('stempel');
    const urt=n?(ok?URTEIL_JA.replace('{stufe}',s.name):URTEIL_NEIN.replace('{tiefer}',STUFEN[stE].name).replace('{abschlag}',pz(DURCH_PREIS)))+' ':'', pr=presse?(ok?PRESSE_JA:PRESSE_NEIN):'';
    meldung(ok?'Angemeldet':'Durchgefallen',`${urt}${lotName(l)} steht jetzt mit Qualität ${l.qp} im Kellerbuch.`+(ill?` Der Beamte hat ${eur(sg)} eingesteckt. Bis der Wein verkauft ist, darf ihn kein Prüfer finden.`:'')+pr+(!ok?(ans?URTEIL_ANS_MINUS.replace('{n}',ans):''):ans?` +${ans} Ansehen.`:s.ans&&!ohneAns?' Ansehen gab es für diesen Jahrgang und diese Stufe schon.':s.ans&&!ill?PANSCH_OHNE_ANS:'')+(stE==='feder'?' Federweißer muss noch diesen Monat in die Flasche.':' Jetzt darf er abgefüllt werden.')+kw,'kellerbuch');
  },
  abfuellen(d){
    const l=lot(d.id); closeSheet();
    if(!l||!l.stufe) return;
    const n=abfFl(l);
    if(S.flaschen<n) return meldung('Zu wenige Flaschen',`Abgefüllt wird immer das ganze Fass. Du brauchst ${num(n)} Flaschen${n>l.liter?' (mit der Abfüllanlage)':''} und hast ${num(S.flaschen)}. Es fehlen ${num(n-S.flaschen)}.`);
    fuelleAb(l);fx('korken');save();render();
  },
  sektKeller(){
    if(!sektRang()||S.sektkeller) return;
    if(S.geld<SEKTKELLER_PREIS) return meldung('Zu wenig Geld',`Der Sektkeller kostet ${eur(SEKTKELLER_PREIS)}.`,'fassgang');
    openSheet(`${sbild('sektkeller')}<h3>🍾 Sektkeller kaufen?</h3><p>Ein Gewölbe mit Rüttelpulten für deinen Sekt, einmal ${eur(SEKTKELLER_PREIS)}.</p><p class="mut">Danach wird die Lese deiner Sekt-Sorte hier zu Sekt. Sektflasche, Korken und Agraffe kosten ${eur2(sektKosten())} je Flasche.</p><div class="btns"><button class="sec" data-a="close">Lieber nicht</button><button data-a="sektKellerJa">Kaufen</button></div>`);
  },
  sektKellerJa(){
    if(!sektRang()||S.sektkeller||S.geld<SEKTKELLER_PREIS) return;
    zahle(SEKTKELLER_PREIS); S.sektkeller=1; fx('stempel'); closeSheet();
    boteMerk(`${S.name} baut einen Sektkeller`,'Unter dem Weingut ist ein Gewölbe mit Rüttelpulten entstanden. Dort liegt der Sekt bald auf der Hefe, und jede Flasche wird gedreht, bis die Hefe im Hals sitzt.','sektkeller');
    save(); render();
    meldung('Der Sektkeller ist fertig',`Ab jetzt wird die Lese deiner ${ROLLEN.sekt.name} hier zu Sekt.`,'sektkeller');
  },
  sektAnlage(){
    if(!S.sektkeller||S.sektAnlage||!frei('sekt_anlage')) return;
    if(S.geld<SEKT_ANLAGE_PREIS) return meldung('Zu wenig Geld',`Die ${SEKT_ANLAGE_NAME} kostet ${eur(SEKT_ANLAGE_PREIS)}.`,'fassgang');
    openSheet(`${sbild('fassgang')}<h3>🍾 Sektkeller ausbauen?</h3><p>Die ${SEKT_ANLAGE_NAME} kostet einmal ${eur(SEKT_ANLAGE_PREIS)}.</p><p class="mut">Degorgieren und Verkorken laufen dann nicht mehr von Hand. Jede Flasche Sekt kostet die Hälfte, ${eur2(Math.round(SEKT_KOSTEN*SEKT_ANLAGE_F*100)/100)} statt ${eur2(SEKT_KOSTEN)}. Sie braucht keine Leute und keine Wartung.</p><div class="btns"><button class="sec" data-a="close">Lieber nicht</button><button data-a="sektAnlageJa">Ausbauen</button></div>`);
  },
  sektAnlageJa(){
    if(!S.sektkeller||S.sektAnlage||!frei('sekt_anlage')||S.geld<SEKT_ANLAGE_PREIS) return;
    zahle(SEKT_ANLAGE_PREIS); S.sektAnlage=1; fx('stempel'); closeSheet(); save(); render();
    meldung('Die Anlage läuft',`Mit der ${SEKT_ANLAGE_NAME} kostet jede Flasche Sekt nur noch ${eur2(sektKosten())}.`,'fassgang');
  },
  kredit(){
    if(S.kredit) return;
    if(rahmen()<5000) return meldung('Kein Kredit','Die Bank vergibt Kredite erst ab 5.000 €, dein Rahmen reicht dafür noch nicht.','bank');
    mengeSheet({titel:'Kredit aufnehmen',bild:'bank',text:`Dein Kreditrahmen: ${eur(rahmen())}. Mindestens 5.000 €.`,min:5000,max:rahmen(),step:1000,start:Math.min(10000,rahmen()),okText:'Weiter',
      info:n=>`<b>${eur(n)}</b>Die Laufzeit wählst du im nächsten Schritt`,
      ok:n=>{
        if(n<5000) return meldung('Zu wenig','Die Bank vergibt Kredite erst ab 5.000 €.');
        openSheet(`${sbild('bank')}<h3>Laufzeit für ${eur(n)}</h3>${[12,24,36,48].map(m=>`<button class="wahl" data-a="kreditJa" data-n="${n}" data-m="${m}"><b>${m} Monate</b><br><span class="mut">erste Rate ${eur(n/m+n*ZINS/12)}, Zinsen gesamt rund ${eur(n*ZINS/12*(m+1)/2)}</span></button>`).join('')}<div class="btns"><button class="sec" data-a="close">Abbrechen</button></div>`);
      }});
  },
  kreditJa(d){const n=+d.n,m=+d.m;closeSheet();if(S.kredit)return;S.kredit={rest:n,tilgung:Math.ceil(n/m)};S.geld+=n;fx('kasse');save();render()},
  tilgen(){const k=S.kredit;if(!k)return;if(S.geld<k.rest)return meldung('Zu wenig Geld',`Zum Ablösen brauchst du ${eur(k.rest)} auf dem Konto.`,'bank');S.geld-=k.rest;S.kredit=null;fx('stempel');save();render()},
  helfer(d){
    const k=d.id, a=S.loehne[k];
    // Niemand darf festhängen: Fehlen Leute dieser Art, geht Einstellen auch ohne Geld, das Konto rutscht dann ins Minus.
    if(+d.n>0){if(S.geld<VERMITTLUNG&&!leuteFehlen()[k]) return meldung('Zu wenig Geld',`Die Vermittlung kostet ${eur(VERMITTLUNG)}.`);zahle(VERMITTLUNG);S[k]++;a.push(S.angebot[k]);a.sort((x,y)=>x-y);fx('stempel')}
    else if(S[k]>0){S[k]--;a.pop()}
    save();render();
  },
  maschKauf(d){
    const id=d&&MASCH[d.id]?d.id:'klein', T=MASCH[id];
    if(S.monat>2||!maschFrei(id)) return;
    if(maschEins(id)&&S.maschinen.some(x=>x.typ===id)) return meldung('Schon da',`${T.f?'Eine':'Einen'} ${T.name} hast du schon, ${T.bonus?'ein zweiter Bonus kommt nicht dazu':`${T.f?'eine zweite':'einen zweiten'} gibt es nicht`}.`);
    if(S.geld<T.preis) return meldung('Zu wenig Geld',`${T.f?'Eine':'Ein'} ${T.name} kostet ${eur(T.preis)}.`);
    // Seit 12.2: Meldung mit Timos Bild, beim ersten Gerät der Art dazu ein Artikel im nächsten Winzerboten.
    const MB=S.maschBote=S.maschBote||{}, erst=!MB[id]&&!S.maschinen.some(x=>x.typ===id);
    zahle(T.preis);S.maschinen.push({typ:id,zustand:100});fx('stempel');
    if(erst){MB[id]=1; boteMerk(`Neue${T.f?'':'r'} ${T.name} bei ${S.name}`,MASCH_BOTE[id],'masch-'+id)}
    save();render();
    meldung(`${T.f?'Die':'Der'} ${T.name} ist da`,`${MASCH_KAUF[id]} ${T.f?'Sie':'Er'} braucht ${T.fahrer} ${T.leute==='helfer'?'Erntehelfer als Fahrer':'Kellerleute'}.`,'masch-'+id);
  },
  abfAusbau(){
    const ma=S.maschinen.find(x=>x.typ==='abfuell'&&abfStufe(x)<2); if(!ma||S.monat>2||!frei('masch_abfuell2')) return;
    if(S.geld<ABF_PREIS2) return meldung('Zu wenig Geld',`Der Ausbau kostet ${eur(ABF_PREIS2)}.`);
    zahle(ABF_PREIS2); ma.stufe=2; fx('stempel'); save(); render();
    meldung('Die Abfüllanlage ist ausgebaut',`Stufe 2: ${Math.round(ABF_PLUS2*100)} % mehr Flaschen aus jedem Fass, ein Kellermensch betreut jetzt ${num(ABF_FLASCHEN2)} leere Flaschen.`,'masch-abfuell');
  },
  maschVerkauf(d){if(S.monat>2)return;const ma=S.maschinen[+d.id];if(!ma)return;kassiere(Math.round(mTyp(ma).preis*.5*ma.zustand/100));S.maschinen.splice(+d.id,1);save();render()},
  maschWarten(d){
    const ma=S.maschinen[+d.id], W=mTyp(ma).wart, max=Math.min(100-ma.zustand,Math.floor(S.geld/W));
    if(max<1) return meldung('Geht gerade nicht','Dir fehlt das Geld für die Wartung.');
    const T=mTyp(ma), er=maschEr(ma);
    mengeSheet({titel:`${T.name} warten`,text:`${eur(W)} je Prozentpunkt. Steht ${er} ${T.ernte?'vor der ersten Lese des Jahres':'vor dem Einsatz'} bei ${PFLEGE[0][0]} % oder mehr, nutzt ${er} sich weniger ab, unter ${PFLEGE[1][0]} % mehr. Unter ${MASCH_ROT} % fällt ${er} aus${T.bonus?', dann fehlt der Bonus':''}.`,max,rangeStep:1,step:5,start:max,okText:'Warten',
      info:n=>`<b>auf ${ma.zustand+n}\u00a0%</b>kostet ${eur(n*W)}`,ok:n=>{fx('stempel');zahle(n*W);ma.zustand+=n}});
  },
  verkaufen(d){
    const l=lot(d.id), w=wege(l)[0]; if(!w||l.regal) return; const p=w.p, fw=federHandel(l);
    mengeSheet({titel:`${lotName(l)} verkaufen`,text:`${w.flag} ${w.name}: ${eur2(p)} je Flasche. ${fw?'Federweißer kauft der Weinhändler in jeder Menge zum vollen Preis, am Budget des Großhandels vorbei. Schnelles Geld für den Notfall, aber reich wird damit keiner. Er hält nur 3 Monate.':marktRest()?`Zum vollen Preis kauft der Großhandel diesen Monat noch für ${eur(marktRest())}, danach sinkt er.`:'Der Markt ist diesen Monat satt, der Preis ist gedrückt. Nächsten Monat zahlt der Großhandel wieder voll.'}${fw?'':' Was du behältst, reift weiter.'}`,max:l.liter,rangeStep:1,step:l.liter>2000?100:l.liter>200?10:1,start:fw?l.liter:Math.min(l.liter,Math.floor(marktRest()/p)||l.liter),okText:'Verkaufen',
      info:n=>{const f=fw?1:marktF(n*p);return `<b>${num(n)} Flaschen</b>bringt dir ${eur(erloes(Math.round(n*p*f)))}${rufTxt()}${f<.995?`<br>📉 im Schnitt ${eur2(p*f)} je Flasche, der Markt ist satt`:''}`},
      ok:n=>{if(!fw&&S.fu&&marktF(n*p)<.995) S.fu.w3=monatNr(); kassiere(erloes(Math.round(n*p*(fw?1:marktF(n*p)))));kompVerkauf(l,n);if(!fw)S.absatz=(S.absatz||0)+n*p;l.liter-=n;if(l.liter<=0)S.lots=S.lots.filter(x=>x!==l)}});
  }
};
function zeigeTitel(){
  // Seit 8.5.1 zwei Knöpfe: Weiterspielen (nur mit Spielstand) und Neues Spiel. Andere Spielstände lädt man im Büro. Ohne Spielstand steht klein "Aus Datei laden" darunter,
  // damit eine gesicherte Datei auch auf einem neuen Gerät ankommt. Darunter die Namen in zwei Blöcken und klein die Technik mit der Nennung, die ElevenLabs im Gratis-Tarif verlangt.
  const t=$('#titel'), hat=[0,1,2].some(lies), alt=!hat&&[0,1,2].some(liesAlt); t.className='an'; delete t.dataset.a;
  // Seit 8.4 (Maik 18.11.2026): Titel mit Gradzeichen und höher, damit mehr vom Torbogen zu sehen ist. Keine Spielanleitung mehr hier (die liegt im Büro),
  // die Namen stehen unten über der Version, Timo als Chef-Tester. Seit 10.4 (Maik 19.11.2026) nennt die Technik auch die Bild-KI, Claude bleibt vorn.
  t.innerHTML=`<h1>150° Öchsle</h1><div class="unter">Vom kahlen Hang in den Festsaal des Weinbauverbands</div><div class="fuss">
    ${alt?'<div class="version alt">Dein Spielstand stammt aus einer älteren Version und läuft hier nicht weiter. Mit „Neues Spiel“ fängst du neu an.</div>':''}
    <div class="tkn">${hat?'<button data-a="titelWeiter">Weiterspielen</button>':''}<button ${hat?'class="sec" ':''}data-a="titelNeu">Neues Spiel</button>${hat?'':'<button class="tdatei" data-a="titelLaden">Gesicherten Spielstand aus Datei laden</button>'}</div>
    <div class="nenn">${TITEL_NAMEN.map(([r,v,n])=>`<div class="blk">${r.map(z=>`<span class="rz">${z}</span>`).join('')}<span class="nz">${v} ${n}</span></div>`).join('')}</div>
    <div class="tech"><span>Programmiert mit Claude (Anthropic)</span><br><span>Bilder: GPT Image (OpenAI)</span> · <span>Musik: Treblo</span><br><span>Geräusche: ElevenLabs (elevenlabs.io)</span> · <button class="tver${neuHinweis(hat)?' neu':''}" data-a="titelChronik">Version ${VERSION}<i>✨ Neu</i></button></div></div>`;
  titelBuendig(t); if(document.fonts) document.fonts.ready.then(()=>titelBuendig(t));
}
function ausblickHtml(){return `<div class="ausbl">${AUSBLICK.map(([t,x])=>`<div><b>${t}</b>${esc(x)}</div>`).join('')}</div>`}
function ideeText(){
  const f=$('#ideeT'), t=f?f.value.trim().slice(0,IDEE_MAX):'';
  if(!t){if(f){f.placeholder='Schreib oder sprich erst deine Idee hier hinein.'; f.focus()} return ''}
  return `💡 Idee für 150° Öchsle (Version ${VERSION}):\n${t}`;
}
const wnPunkte=p=>p&&p.length?`<ul>${p.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'';
function wasNeuHtml(){return WAS_NEU.map(b=>`<div class="wnb"><div class="wnk"><b>${b.k}</b>${b.d?`<small>${b.d}</small>`:''}</div>${wnPunkte(b.p)}${b.v.map(([z,n,t,d,p])=>`<div class="tchz1${p&&p.length?'" data-a="titelEtappe':' kurz'}"><b>${z?z+' ':''}${n}</b><strong>${esc(t)}</strong><small>${d?d.slice(0,6):''}${p&&p.length?'<i class="wnz"></i>':''}</small>${wnPunkte(p)}</div>`).join('')}</div>`).join('')}
function zeigeChronik(){
  const t=$('#titel'); if(!t||t.querySelector('.tchron')) return;
  t.insertAdjacentHTML('beforeend',`<div class="tchron"><div class="tchz" data-a="titelChronikZu"></div><div class="card tchk">
    <div class="tchl"><h3>Was geplant ist</h3>${ausblickHtml()}<h3>Was ist neu</h3>${wasNeuHtml()}</div>
    <div class="mitte"><button class="siegel" data-a="titelChronikZu">Okay</button></div></div></div>`);
}
// Bringt in jedem Block die Rollenzeilen per Buchstabenabstand und den Namen per Wortabstand (nur zwischen Vor- und Nachname) auf dieselbe Breite.
function titelBuendig(t){
  const breit=e=>e.getBoundingClientRect().width;
  for(const x of t.querySelectorAll('.nenn .blk')){
    const rz=[...x.querySelectorAll('.rz')], nz=x.querySelector('.nz');
    rz.forEach(z=>{z.style.letterSpacing='0px'; z.style.marginRight='0px'}); nz.style.wordSpacing='0px';
    const W=Math.max(breit(nz),...rz.map(breit)); if(!W) continue;
    for(const z of rz){const n=z.textContent.length; for(let i=0;i<4;i++){const ls=parseFloat(z.style.letterSpacing)||0, neu=ls+(W-(breit(z)-ls))/(n-1); z.style.letterSpacing=neu+'px'; z.style.marginRight=(-neu)+'px'}}
    for(let i=0;i<3;i++){const ws=parseFloat(nz.style.wordSpacing)||0; nz.style.wordSpacing=(ws+(W-breit(nz)))+'px'}
  }
  // Seit 10.4 (Maik 19.11.2026): Die Knöpfe sind genau so breit wie der Namensblock, vom M bei Maik bis zum t bei Timo Dienst.
  const bl=[...t.querySelectorAll('.nenn .blk')], kn=t.querySelector('.tkn');
  if(bl.length&&kn){const w=bl[bl.length-1].getBoundingClientRect().right-bl[0].getBoundingClientRect().left; if(w>0) kn.style.maxWidth=Math.round(w)+'px'}
}
function titelZu(){const t=$('#titel'); t.className=''; t.innerHTML=''; delete t.dataset.a}

/* ================= Tippen und Wischen ================= */
// Wischen über das Bild wechselt zum Ort daneben, an den Enden ist Schluss. Am Laptop geht es auch mit gedrückter Maus und mit den Pfeiltasten.
let WISCH=null, WISCH_ZEIT=0;
document.addEventListener('pointerdown',e=>{WISCH=e.target.closest('.pano')?{x:e.clientX,y:e.clientY}:null});
document.addEventListener('pointercancel',()=>{WISCH=null});
document.addEventListener('pointerup',e=>{
  if(!WISCH) return; const dx=e.clientX-WISCH.x, dy=e.clientY-WISCH.y; WISCH=null;
  if(Math.abs(dx)<40||Math.abs(dx)<Math.abs(dy)*1.5) return;
  WISCH_ZEIT=Date.now(); FU_PAUSE=false; tonAn(); subNachbar(dx<0?1:-1);
});
document.addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight') return;
  if($('#sheet').classList.contains('an')||$('#titel').classList.contains('an')||$('#buch').classList.contains('an')||/INPUT|TEXTAREA/.test(e.target.tagName)) return;
  subNachbar(e.key==='ArrowLeft'?-1:1);
});
document.addEventListener('click',e=>{
  // Seit 10.2.1: Ein Tipp neben die Sprechblase klappt sie zum Kopf zusammen, der Tipp selbst wirkt trotzdem (Maik 19.11.2026).
  // Seit 10.3: Der Tipp, der die Blase wegklappt, holt nicht gleich die nächste, die kommt erst mit dem Tipp danach.
  // Seit 12.7: gilt für jede offene Blase, auch beim Blättern im Verlauf. Der Kopf oben klappt selbst auf und zu.
  const park=!!(FU_OFFEN&&!e.target.closest('#fuehrer,#tkopf,#titel')); if(park) fuBlaseZu();
  // Nach einem Wischen zählt das Loslassen nicht als Tipp.
  const b=e.target.closest('[data-a]'); if(!b||b.disabled||Date.now()-WISCH_ZEIT<350) return;
  tonAn(); if(AC&&AC.state==='suspended') AC.resume();
  const a=b.dataset.a, vorn=/^titel/.test(a);
  if(!vorn&&S&&S.pleite&&!['neuJa','pleiteNeu','pleiteZurueck','tab','sub','close','weiter','menue','ton','infoWeiter','feierAlle','feierWeiter','wachsAlle','feierBuehne','feierEnde','buch','buchZu'].includes(a)) return;
  // Seit 10.1: Nach dem Ende gehen nur noch Chronik, neues Spiel, Spielstände, Ton und Buch, seit 10.2 auch die Feier am Küchentisch.
  // Seit 11.7: Solange der Nachfolger fehlt, geht nur das Wählen (dazu Ton, Spielstände und Buch).
  if(!vorn&&nfOffen()&&!['nfJa','nfArt','ton','menue','buch','buchZu'].includes(a)) return zeigeNachfolger();
  if(!vorn&&S&&S.ende&&!['menue','close','ton','infoWeiter','feierEnde','feierAlle','buch','buchZu','neuFrage','neuJa','idee','ideeWa','ideeTeilen','ausblick','nfJa','nfArt'].includes(a)) return;
  // Solange der Weinprüfer wartet, geht nichts anderes.
  if(!vorn&&S&&S.pruefer&&!['pruefJa','pruefBestechen','slMinus','slPlus','slOk','slWahl','close','ton','menue','buch','buchZu'].includes(a)) return zeigePruefer();
  // Schritt G 7.0: Solange die Übergabe offen ist, geht nur das Übergeben.
  if(!vorn&&erbeOffen()&&!['erbeJa','erbeArt','ton','menue','buch','buchZu'].includes(a)) return zeigeErbe();
  if(a!=='fuWo') FU_PAUSE=park;
  const f=AKT[a]; if(f){f(b.dataset,e); fx('klick')}
  if(!FU_OFFEN&&!FU_PAUSE) setTimeout(fuehrerZeig,0);
});
$('#datei').addEventListener('change',e=>{const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>dateiLaden(String(r.result),ZIEL); r.readAsText(f)});
$('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet'&&!SL)closeSheet()});
load(); meisterAbgleich(); render(); zeigeTitel();
// Als App: Der Helfer sw.js legt alle Dateien aufs Gerät, danach läuft das Spiel ohne Netz und holt sich neue Fassungen von selbst.
// Am Laptop (localhost) bleibt er aus, damit beim Bauen nichts Altes hängen bleibt. Zum Testen dort: ?app an die Adresse hängen.
if('serviceWorker' in navigator&&(location.protocol==='https:'||/[?&]app\b/.test(location.search))) navigator.serviceWorker.register('sw.js').catch(()=>{});
// Bittet den Browser, die Spielstände nicht von selbst wegzuräumen.
if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(()=>{});
