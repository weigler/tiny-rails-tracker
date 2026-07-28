// Service worker mínimo — só existe pra deixar o app instalável.
// Não faz cache agressivo: sempre busca a rede primeiro (o app já funciona
// offline por causa do localStorage, mas o HTML/JS em si só precisa carregar uma vez).

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
