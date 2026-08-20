// sw.js
// Caches the app shell so the Drawing Board keeps working with no
// internet connection - useful for classrooms with patchy connectivity.
//
// Strategy: serve from cache immediately when available (fast + works
// offline), while quietly fetching a fresh copy in the background to
// keep the cache up to date for next time.

const CACHE_VERSION = "drawing-board-v1";

// Bump CACHE_VERSION whenever you ship new app files so old caches get
// cleared out on the next visit.
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./script.js",
  "./manifest.webmanifest",
  "./assets/style.css",
  "./assets/i18n.js",
  "./assets/i18n.css",
  "./assets/pwa.css",
  "./assets/pwa.js",
  "./assets/paper.jpg",
  "./assets/sketch.jpg",
  "./icons/rectangle.svg",
  "./icons/circle.svg",
  "./icons/triangle.svg",
  "./icons/line.svg",
  "./icons/polygone.svg",
  "./icons/brush.svg",
  "./icons/eraser.svg",
  "./icons/spray.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch(() => {
            // Skip files that don't exist in this project (e.g. optional
            // background images) so one missing file doesn't break setup.
            console.warn("[sw] could not cache:", url);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
