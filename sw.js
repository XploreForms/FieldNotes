const CACHE = 'fsl-comments-v2.13.3';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

// Save a fresh copy of every file (skipping the browser's own cache), then wait until the tech taps Update.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('message', e => { if (e.data === 'skip-waiting') self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Open instantly from the phone's saved copy (works with no signal). New versions arrive as a new
// service worker, which the page offers as an Update, so this version's files are never mixed with newer ones.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => hit ||
      fetch(e.request).catch(() => e.request.mode === 'navigate' ? c.match('./index.html') : Response.error())))
  );
});
