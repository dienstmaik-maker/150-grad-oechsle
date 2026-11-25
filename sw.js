// Helfer für die App: legt alle Dateien des Spiels aufs Gerät, damit es ohne Netz läuft.
// Die Spielseite (index.html), das Buch (anleitung.js) und seit 8.1 die Sprechblasen (fuehrer.js) kommen immer zuerst frisch aus dem Netz, so kommen neue Fassungen von selbst an. Ohne Netz gilt die gespeicherte.
// Seit 13.1 steht der Code in zahlen.js, kern.js und oberflaeche.js. Sie kommen wie die Seite zuerst frisch, sonst sähe ein Handy einen halben alten Stand.
// Bilder und Töne kommen aus dem Speicher. Ändert sich eines davon, die Nummer in LAGER erhöhen, dann lädt das Gerät alles neu.
const LAGER = 'oechsle-47';
const FRISCH = ['anleitung.js', 'fuehrer.js', 'zahlen.js', 'kern.js', 'oberflaeche.js'];
const DATEIEN = [
  './', 'index.html', 'manifest.webmanifest', 'anleitung.js', 'fuehrer.js', 'zahlen.js', 'kern.js', 'oberflaeche.js',
  'bilder/amt.jpg',
  'bilder/arbeit.jpg',
  'bilder/aufstieg.jpg',
  'bilder/auktion.jpg',
  'bilder/bank.jpg',
  'bilder/brett-dunkel.jpg',
  'bilder/holz-keller.jpg',
  'bilder/holz-stadt.jpg',
  'bilder/holz-weingut.jpg',
  'bilder/karte-neu.webp',
  'bilder/knopf-aktiv.webp',
  'bilder/knopf-dunkel.webp',
  'bilder/knopf-hell.webp',
  'bilder/knopf-rot.webp',
  'bilder/rahmen-neu.webp',
  'bilder/brett-hell.jpg',
  'bilder/brett-honig.jpg',
  'bilder/ehrenplatz.jpg',
  'bilder/ehrung-hof.jpg',
  'bilder/ehrung-saal.jpg',
  'bilder/einladung.jpg',
  'bilder/eiswein.jpg',
  'bilder/erbschaft.jpg',
  'bilder/fass.png',
  'bilder/fassgang.jpg',
  'bilder/flasche-festsaal.jpg',
  'bilder/flasche-kueche-leer.jpg',
  'bilder/flasche-kueche-zwei.jpg',
  'bilder/flasche-kueche.jpg',
  'bilder/flasche-regal-zwei.jpg',
  'bilder/flasche-regal.jpg',
  'bilder/frost.jpg',
  'bilder/fuehrer-winzer.jpg',
  'bilder/fruehling.jpg',
  'bilder/gebiet-franken.webp',
  'bilder/gebiet-mosel.webp',
  'bilder/gebiet-pfalz.webp',
  'bilder/gebiet-rheingau.webp',
  'bilder/gebiet-rheinhessen.webp',
  'bilder/gebiet-wuerttemberg.webp',
  'bilder/gegnerpraesident.jpg',
  'bilder/hagel.jpg',
  'bilder/helferweg.jpg',
  'bilder/herbst.jpg',
  'bilder/hoffest.jpg',
  'bilder/hoffest-regen.jpg',
  'bilder/holzbogen.jpg',
  'bilder/kellerbuch.jpg',
  'bilder/knitter.webp',
  'bilder/kontrolle.jpg',
  'bilder/laden.jpg',
  'bilder/lese.jpg',
  'bilder/manager-handel.jpg',
  'bilder/manager-keller.jpg',
  'bilder/manager-weingut.jpg',
  'bilder/maschine.jpg',
  // Seit 12.2: Timos Bilder für Maschinen, Schädlinge und Sektkeller.
  'bilder/masch-abfuell.jpg',
  'bilder/nah-kelterhaus.jpg',
  'bilder/nah-festwiese.jpg',
  'bilder/nah-gaestezimmer.jpg',
  'bilder/nah-turmstube.jpg',
  'bilder/nah-steillage.jpg',
  'bilder/masch-duenger.jpg',
  'bilder/masch-gross.jpg',
  'bilder/masch-klein.jpg',
  'bilder/masch-laub.jpg',
  'bilder/wickler.jpg',
  'bilder/mehltau.jpg',
  'bilder/kirsch.jpg',
  'bilder/sektkeller.jpg',
  'bilder/panorama-keller-teil-1.jpg',
  'bilder/panorama-keller-teil-2.jpg',
  'bilder/panorama-keller-teil-3.jpg',
  'bilder/panorama-keller-teil-4.jpg',
  'bilder/panorama-stadt-teil-1.jpg',
  'bilder/panorama-stadt-teil-2.jpg',
  'bilder/panorama-stadt-teil-3.jpg',
  'bilder/panorama-stadt-teil-4.jpg',
  'bilder/panorama-stadt-teil-5.jpg',
  'bilder/panorama-weingut-sommer-teil-1.jpg',
  'bilder/panorama-weingut-sommer-teil-2.jpg',
  'bilder/panorama-weingut-sommer-teil-3.jpg',
  'bilder/panorama-weingut-sommer-teil-4.jpg',
  'bilder/panorama-weingut-sommer-teil-5.jpg',
  'bilder/papier.jpg',
  'bilder/pleite.jpg',
  'bilder/praemierung.jpg',
  'bilder/rahmen.webp',
  'bilder/rebenmarkt.jpg',
  'bilder/rieslingmode.jpg',
  'bilder/sabotage.jpg',
  'bilder/schild-haupt.webp',
  'bilder/schild-wag.webp',
  'bilder/schild-zweit.webp',
  'bilder/sieg.jpg',
  'bilder/siegel-rot.webp',
  'bilder/siegel.webp',
  'bilder/sitzbank.jpg',
  'bilder/sommer.jpg',
  'bilder/spaetfrost.jpg',
  'bilder/spitzenlage.jpg',
  'bilder/szene-1.jpg',
  'bilder/szene-2.jpg',
  'bilder/szene-3.jpg',
  'bilder/szene-5.jpg',
  'bilder/szene-7.jpg',
  'bilder/szene-sieg.jpg',
  'bilder/supersommer.jpg',
  'bilder/titel.jpg',
  'bilder/titel-hochkant.jpg',
  'bilder/urkunde.webp',
  'bilder/wahl.jpg',
  'bilder/weinbotschafter.jpg',
  'bilder/weltweinschau-sieg.jpg',
  'bilder/weltweinschau.jpg',
  'bilder/weingut.jpg',
  'bilder/weinhandlung.jpg',
  'bilder/weinkritiker.jpg',
  'bilder/weinskandal.jpg',
  'bilder/winter.jpg',
  'bilder/winzer-kopf-dick.webp',
  'bilder/zeitung-fuss.webp',
  'bilder/zeitung-kopf.webp',
  'bilder/zeitung-mitte.webp',
  'bilder/sym-rebstufe.webp',
  'bilder/sym-bodenstufe.webp',
  'bilder/sym-duenger.webp',
  'bilder/sym-schloss.webp',
  'bilder/sym-mitarbeiter.webp',
  'bilder/tab-weingut.webp',
  'bilder/tab-kellerei.webp',
  'bilder/tab-stadt.webp',
  'bilder/tab-klemmbrett.webp',
  'bilder/aufg-traube.webp',
  'bilder/aufg-traktor.webp',
  'bilder/aufg-fass.webp',
  'bilder/aufg-haendler.webp',
  'bilder/kopf-kalender.webp',
  'bilder/kopf-muenzen.webp',
  'bilder/leute-erntehelferin.jpg',
  'bilder/siegel-qba.webp',
  'bilder/siegel-kab.webp',
  'bilder/siegel-spat.webp',
  'bilder/siegel-aus.webp',
  'bilder/siegel-ba.webp',
  'bilder/siegel-tba.webp',
  'bilder/siegel-eis.webp',
  'bilder/jz-fruehling.webp',
  'bilder/jz-sommer.webp',
  'bilder/jz-herbst.webp',
  'bilder/jz-winter.webp',
  'bilder/maschkarte-klein.webp',
  'bilder/maschkarte-gross.webp',
  'bilder/maschkarte-duenger.webp',
  'bilder/maschkarte-laub.webp',
  'bilder/maschkarte-abfuell.webp',
  'schrift/alegreya-kursiv.woff2',
  'schrift/alegreya-sc-fett.woff2',
  'schrift/alegreya-sc.woff2',
  'schrift/alegreya.woff2',
  'schrift/fraktur-voll.woff2',
  'schrift/pinyon.woff2',
  'symbole/symbol-180.png',
  'symbole/symbol-192.png',
  'symbole/symbol-512.png',
  'symbole/symbol-rund-512.png',
  'ton/fanfare.mp3',
  'ton/hammer.mp3',
  'ton/kasse.mp3',
  'ton/klick.mp3',
  'ton/korken.mp3',
  'ton/menue.mp3',
  'ton/musik-befoerderung.mp3',
  'ton/musik-kellerei.mp3',
  'ton/musik-pfaendung.mp3',
  'ton/musik-stadt.mp3',
  'ton/musik-weingut.mp3',
  'ton/musik-wettbewerb.mp3',
  'ton/schere.mp3',
  'ton/stempel.mp3',
];
// Version 9.0: Die 40 Bilder "Weingut wächst" (bilder/weingut-NN-<jahreszeit>.jpg) stehen bewusst nicht in DATEIEN. Das Spiel lädt nur die der eigenen Stufe, datei() legt sie ab.
// Version 7.7: Platz für die Feier-Videos aus 8.1 (szene-start.mp4, szene-1.mp4 bis szene-8.mp4, szene-sieg.mp4).
// Sie laden nach dem Einrichten im Hintergrund nach, fehlt eines, zeigt das Spiel das Standbild. Die Liste füllt erst 8.1.
const VIDEOS = [];
// Die Musik ist groß: Fehlt beim Einrichten ein Stück, klappt der Rest trotzdem, und es wird beim ersten Abspielen nachgeholt.
const GROSS = f => f.startsWith('ton/musik-');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(LAGER).then(async c => {
    // cache: 'reload' holt jede Datei frisch vom Server, am Browser-Zwischenspeicher vorbei (seit 7.5.1, sonst blieb das alte Weingut-Bild hängen).
    const frisch = f => new Request(f, { cache: 'reload' });
    await c.addAll(DATEIEN.filter(f => !GROSS(f)).map(frisch));
    await Promise.all(DATEIEN.filter(GROSS).map(f => c.add(frisch(f)).catch(() => {})));
  }).then(() => self.skipWaiting()));
  // Videos warten nicht auf das Einrichten, sie kommen danach im Hintergrund.
  caches.open(LAGER).then(c => Promise.all(VIDEOS.map(f => c.add(new Request(f, { cache: 'reload' })).catch(() => {}))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(K => Promise.all(K.filter(k => k !== LAGER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  const name = u.pathname.split('/').pop();
  e.respondWith(r.mode === 'navigate' || u.pathname.endsWith('/index.html') ? seite('index.html') : FRISCH.includes(name) ? seite(name) : datei(r, u));
});

// Spielseite und Buch: erst das Netz (höchstens 3 Sekunden warten), sonst die gespeicherte Fassung.
async function seite(name) {
  const c = await caches.open(LAGER), alt = await c.match(name);
  try {
    const st = new AbortController(), uhr = setTimeout(() => st.abort(), alt ? 3000 : 20000);
    const neu = await fetch(name, { cache: 'no-store', signal: st.signal });
    clearTimeout(uhr);
    if (neu.ok) { c.put(name, neu.clone()); return neu; }
  } catch (e) {}
  return alt || Response.error();
}
// Bilder und Töne: erst der Speicher, sonst das Netz (und dann in den Speicher).
// Musik fragt der Browser stückweise ab (Range). Aus der ganzen gespeicherten Datei wird dann das gewünschte Stück geschnitten.
async function datei(r, u) {
  const c = await caches.open(LAGER), adr = u.origin + u.pathname;
  let a = await c.match(adr);
  if (!a) {
    a = await fetch(adr);
    if (a.ok && a.status === 200) c.put(adr, a.clone());
  }
  const bereich = r.headers.get('range');
  if (!bereich || a.status !== 200) return a;
  const buf = await a.arrayBuffer(), m = /bytes=(\d+)-(\d*)/.exec(bereich) || [];
  const von = +m[1] || 0, bis = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(von, bis + 1), { status: 206, statusText: 'Partial Content', headers: {
    'Content-Type': a.headers.get('Content-Type') || 'audio/mpeg', 'Content-Range': `bytes ${von}-${bis}/${buf.byteLength}`,
    'Content-Length': String(bis - von + 1), 'Accept-Ranges': 'bytes' } });
}
