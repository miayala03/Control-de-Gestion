/* Service worker: permite usar la app sin internet una vez abierta.
   Si cambiás archivos y no ves los cambios en el celular, subí el número
   de version (por ejemplo v4, v5...) y volvé a subir a GitHub.        */
const VERSION = 'induccion-v3';
const ARCHIVOS = [
  './',
  './index.html',
  './estilos.css',
  './contenido.js',
  './app.js',
  './estaciones.js',
  './turno.js',
  './tablero.js',
  './manifest.webmanifest',
  './iconos/icono-180.png',
  './iconos/icono-192.png',
  './iconos/icono-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(VERSION).then(c => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
