const VERSION = 'fiado-v1'
const APP_SHELL = ['/offline.html', '/manifest.json']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // La API siempre va a la red: los saldos de deuda tienen que ser siempre reales
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // Navegación entre páginas: red primero, si falla mostramos offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    )
    return
  }

  // Estáticos (js, css, imágenes, fuentes): cache primero, se actualiza en segundo plano
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone()
            caches.open(VERSION).then((cache) => cache.put(request, clone))
          }
          return networkResponse
        })
        .catch(() => cached)
      return cached || fetchPromise
    })
  )
})