// Stationnement Pasly — service worker : met en cache l'application (jamais les données).
const CACHE = "sta-pasly-v7";
const COQUILLE = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./icone-192.png", "./icone-512.png", "./logo-pasly.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(COQUILLE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.hostname.endsWith("supabase.co")) return; // données : toujours en direct, jamais en cache
  if (u.origin === self.location.origin) { // application : réseau d'abord, cache si hors ligne
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))));
    return;
  }
  if (u.hostname === "cdn.jsdelivr.net") { // bibliothèques versionnées : cache d'abord
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return res; })));
  }
});
