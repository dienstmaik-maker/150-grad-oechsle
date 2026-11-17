// Helfer für die App: legt alle Dateien des Spiels aufs Gerät, damit es ohne Netz läuft.
// Die Spielseite (index.html) und das Buch (anleitung.js) kommen immer zuerst frisch aus dem Netz, so kommen neue Fassungen von selbst an. Ohne Netz gilt die gespeicherte.
// Bilder und Töne kommen aus dem Speicher. Ändert sich eines davon, die Nummer in LAGER erhöhen, dann lädt das Gerät alles neu.
const LAGER = 'oechsle-21';
const DATEIEN = [
  './', 'index.html', 'manifest.webmanifest', 'anleitung.js',
  'bilder/amt.jpg',
  'bilder/arbeit.jpg',
  'bilder/aufstieg.jpg',
  'bilder/auktion.jpg',
  'bilder/bank.jpg',
  'bilder/brett-dunkel.jpg',
  'bilder/brett-hell.jpg',
  'bilder/brett-honig.jpg',
  'bilder/ehrung-hof.jpg',
  'bilder/ehrung-saal.jpg',
  'bilder/erbschaft.jpg',
  'bilder/fass.png',
  'bilder/fassgang.jpg',
  'bilder/flasche-festsaal.jpg',
  'bilder/flasche-kueche.jpg',
  'bilder/flasche-regal.jpg',
  'bilder/frost.jpg',
  'bilder/fruehling.jpg',
  'bilder/gebiet-franken.webp',
  'bilder/gebiet-mosel.webp',
  'bilder/gebiet-pfalz.webp',
  'bilder/gebiet-rheingau.webp',
  'bilder/gebiet-rheinhessen.webp',
  'bilder/gebiet-wuerttemberg.webp',
  'bilder/gegnerpraesident.jpg',
  'bilder/gut.jpg',
  'bilder/hagel.jpg',
  'bilder/helferweg.jpg',
  'bilder/herbst.jpg',
  'bilder/hoffest.jpg',
  'bilder/keller.jpg',
  'bilder/kellerbuch.jpg',
  'bilder/knitter.webp',
  'bilder/kontrolle.jpg',
  'bilder/laden.jpg',
  'bilder/lese.jpg',
  'bilder/manager-handel.jpg',
  'bilder/manager-keller.jpg',
  'bilder/manager-weingut.jpg',
  'bilder/maschine.jpg',
  'bilder/papier.jpg',
  'bilder/pleite.jpg',
  'bilder/praemierung.jpg',
  'bilder/rahmen.webp',
  'bilder/rieslingmode.jpg',
  'bilder/sabotage.jpg',
  'bilder/schild-haupt.webp',
  'bilder/schild-wag.webp',
  'bilder/schild-zweit.webp',
  'bilder/sieg.jpg',
  'bilder/siegel-rot.webp',
  'bilder/siegel.webp',
  'bilder/sommer.jpg',
  'bilder/spitzenlage.jpg',
  'bilder/stadt.jpg',
  'bilder/szene-1.jpg',
  'bilder/szene-2.jpg',
  'bilder/szene-3.jpg',
  'bilder/szene-5.jpg',
  'bilder/szene-7.jpg',
  'bilder/szene-sieg.jpg',
  'bilder/supersommer.jpg',
  'bilder/titel.jpg',
  'bilder/urkunde.webp',
  'bilder/weinbotschafter.jpg',
  'bilder/weingut.jpg',
  'bilder/weinhandlung.jpg',
  'bilder/weinkritiker.jpg',
  'bilder/weinskandal.jpg',
  'bilder/winter.jpg',
  'bilder/zeitung-fuss.webp',
  'bilder/zeitung-kopf.webp',
  'bilder/winzer-kopf-dick.webp',
  'bilder/zeitung-mitte.webp',
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
  e.respondWith(r.mode === 'navigate' || u.pathname.endsWith('/index.html') ? seite('index.html') : u.pathname.endsWith('/anleitung.js') ? seite('anleitung.js') : datei(r, u));
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
