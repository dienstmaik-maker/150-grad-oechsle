// Helfer für die App: legt alle Dateien des Spiels aufs Gerät, damit es ohne Netz läuft.
// Die Spielseite (index.html) kommt immer zuerst frisch aus dem Netz, so kommen neue Fassungen von selbst an. Ohne Netz gilt die gespeicherte.
// Bilder und Töne kommen aus dem Speicher. Ändert sich eines davon, die Nummer in LAGER erhöhen, dann lädt das Gerät alles neu.
const LAGER = 'oechsle-2';
const DATEIEN = [
  './', 'index.html', 'manifest.webmanifest',
  'bilder/amt.jpg',
  'bilder/arbeit.jpg',
  'bilder/aufstieg.jpg',
  'bilder/auktion.jpg',
  'bilder/bank.jpg',
  'bilder/erbschaft.jpg',
  'bilder/fass.png',
  'bilder/fassgang.jpg',
  'bilder/frost.jpg',
  'bilder/fruehling.jpg',
  'bilder/gegnerpraesident.jpg',
  'bilder/gut.jpg',
  'bilder/hagel.jpg',
  'bilder/helferweg.jpg',
  'bilder/herbst.jpg',
  'bilder/hoffest.jpg',
  'bilder/keller.jpg',
  'bilder/kellerbuch.jpg',
  'bilder/knopf-haupt.webp',
  'bilder/knopf-holz.webp',
  'bilder/knopf-schwarz.webp',
  'bilder/knopf-zweit.webp',
  'bilder/kontrolle.jpg',
  'bilder/laden.jpg',
  'bilder/lese.jpg',
  'bilder/maschine.jpg',
  'bilder/papier.jpg',
  'bilder/pleite.jpg',
  'bilder/praemierung.jpg',
  'bilder/rieslingmode.jpg',
  'bilder/sabotage.jpg',
  'bilder/sieg.jpg',
  'bilder/sommer.jpg',
  'bilder/spitzenlage.jpg',
  'bilder/stadt.jpg',
  'bilder/supersommer.jpg',
  'bilder/titel.jpg',
  'bilder/weinbotschafter.jpg',
  'bilder/weingut.jpg',
  'bilder/weinhandlung.jpg',
  'bilder/weinkritiker.jpg',
  'bilder/weinskandal.jpg',
  'bilder/winter.jpg',
  'bilder/zeitung-fuss.webp',
  'bilder/zeitung-kopf.webp',
  'bilder/zeitung-mitte.webp',
  'symbole/symbol-180.png',
  'symbole/symbol-192.png',
  'symbole/symbol-512.png',
  'symbole/symbol-rund-512.png',
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
// Die Musik ist groß: Fehlt beim Einrichten ein Stück, klappt der Rest trotzdem, und es wird beim ersten Abspielen nachgeholt.
const GROSS = f => f.startsWith('ton/musik-');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(LAGER).then(async c => {
    await c.addAll(DATEIEN.filter(f => !GROSS(f)));
    await Promise.all(DATEIEN.filter(GROSS).map(f => c.add(f).catch(() => {})));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(K => Promise.all(K.filter(k => k !== LAGER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(r.mode === 'navigate' || u.pathname.endsWith('/index.html') ? seite() : datei(r, u));
});

// Spielseite: erst das Netz (höchstens 3 Sekunden warten), sonst die gespeicherte Fassung.
async function seite() {
  const c = await caches.open(LAGER), alt = await c.match('index.html');
  try {
    const st = new AbortController(), uhr = setTimeout(() => st.abort(), alt ? 3000 : 20000);
    const neu = await fetch('index.html', { cache: 'no-store', signal: st.signal });
    clearTimeout(uhr);
    if (neu.ok) { c.put('index.html', neu.clone()); return neu; }
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
