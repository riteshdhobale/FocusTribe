// ─── StudyDate Service Worker ──────────────────────────────────────
// Minimal service worker for PWA installability + offline shell caching.
// Caches the app shell so the "Install App" prompt appears on mobile.

const CACHE_NAME = "studydate-v1";
const SHELL_ASSETS = [
  "/",
  "/favicon.png",
  "/manifest.json",
];

// Install — pre-cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn("[SW] Failed to cache some assets:", err);
      });
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network-first with cache fallback for navigation requests
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip non-http(s) requests (chrome-extension, etc.)
  if (!event.request.url.startsWith("http")) return;

  // For navigation requests (HTML pages), use network-first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/") || new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // For other assets, use cache-first for performance
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Don't cache non-ok or opaque responses
        if (!response || response.status !== 200) return response;
        // Cache static assets
        if (
          event.request.url.includes("/assets/") ||
          event.request.url.endsWith(".png") ||
          event.request.url.endsWith(".css")
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
