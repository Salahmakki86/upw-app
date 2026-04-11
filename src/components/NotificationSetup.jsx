import { useEffect } from 'react'
import { upwApi } from '../api/upwApi'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  const arr     = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export default function NotificationSetup() {
  useEffect(() => {
    // Only run in browser with push support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    // User already declined
    if (localStorage.getItem('push-declined')) return

    async function setup() {
      try {
        const reg = await navigator.serviceWorker.ready

        // Already subscribed — re-save to backend (keeps subscription fresh)
        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          await upwApi.subscribePush(existing.toJSON()).catch(() => {})
          return
        }

        // Get VAPID public key
        const { publicKey } = await upwApi.getVapidKey().catch(() => ({ publicKey: null }))
        if (!publicKey) return

        // Request permission
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') {
          localStorage.setItem('push-declined', '1')
          return
        }

        // Subscribe
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
        await upwApi.subscribePush(sub.toJSON())
      } catch (e) {
        // Silent fail — push is optional
      }
    }

    // Small delay so the SW has time to activate
    const t = setTimeout(setup, 3000)
    return () => clearTimeout(t)
  }, [])

  return null
}
