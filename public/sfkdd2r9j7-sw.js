// Service worker de la app privada: la deja abrir sin conexión.
// Solo guarda el código de la app (nunca datos: esos van cifrados en el dispositivo).
const CACHE = 'luna-v1';
const BASE = '/sfkdd2r9j7';
const SHELL = [BASE, `${BASE}/manifest.webmanifest`, `${BASE}/icon-192.png`, `${BASE}/icon-512.png`];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('luna-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// La app avisa de los archivos que ya cargó antes de que el service worker existiera.
self.addEventListener('message', (e) => {
  const urls = Array.isArray(e.data?.cache) ? e.data.cache : [];
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(
        urls
          .filter((u) => new URL(u, location.origin).origin === location.origin)
          .map((u) => c.match(u).then((hit) => hit || c.add(u)).catch(() => {}))
      )
    )
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // La página: primero la red (para tener siempre la última versión), si no hay, la guardada.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(BASE, copy));
          }
          return res;
        })
        .catch(() => caches.match(BASE))
    );
    return;
  }

  // Código, estilos e iconos: los de Next llevan hash y no cambian nunca.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith(`${BASE}/`)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
});
