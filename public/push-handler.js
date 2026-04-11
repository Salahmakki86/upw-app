// Push notification handler — imported by generated service worker
self.addEventListener('push', function (event) {
  if (!event.data) return
  var data = {}
  try { data = event.data.json() } catch (e) { data = { title: 'اطلق قواك الخفية', body: event.data.text() } }

  var title = data.title || 'اطلق قواك الخفية'
  var options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  var url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cls) {
      for (var i = 0; i < cls.length; i++) {
        if ('focus' in cls[i]) { cls[i].focus(); return }
      }
      return clients.openWindow(url)
    })
  )
})
