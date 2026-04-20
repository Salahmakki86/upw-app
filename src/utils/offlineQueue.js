/**
 * Offline Queue — Wave 7 Advanced
 *
 * Queues mutation requests when the browser is offline and replays them when
 * connectivity is restored. Integrates with `upwApi.saveState` via a
 * single-slot latest-wins strategy (the most recent state payload is the one
 * that matters — older queued payloads are superseded).
 *
 * Public API:
 *   isOnline()               → boolean
 *   subscribeOnline(cb)      → unsubscribe function (called with true/false)
 *   queueStateSave(payload)  → void (persists payload locally; replays on reconnect)
 *   flushQueue(api)          → Promise<boolean> (true if a payload was sent)
 *   hasPendingSave()         → boolean
 *
 * Storage:
 *   localStorage key "upw:offlineQueue:latestState" holds the most recent
 *   pending payload (JSON). A successful flush removes it.
 */

const QUEUE_KEY = 'upw:offlineQueue:latestState'

export function isOnline() {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine !== false
}

export function subscribeOnline(cb) {
  if (typeof window === 'undefined') return () => {}
  const onOnline  = () => cb(true)
  const onOffline = () => cb(false)
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

export function queueStateSave(payload) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify({
      payload,
      queuedAt: Date.now(),
    }))
  } catch (e) {
    // Storage full or serialization failed — drop silently; next save attempt
    // will re-queue a fresh payload.
  }
}

export function hasPendingSave() {
  try {
    return !!localStorage.getItem(QUEUE_KEY)
  } catch {
    return false
  }
}

export function getPendingSave() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearPendingSave() {
  try { localStorage.removeItem(QUEUE_KEY) } catch {}
}

/**
 * Attempt to replay the queued payload through the provided api function.
 * @param {(payload: any) => Promise<any>} saveFn — e.g. upwApi.saveState
 * @returns {Promise<boolean>} true if a payload was flushed, false otherwise
 */
export async function flushQueue(saveFn) {
  if (!isOnline()) return false
  const pending = getPendingSave()
  if (!pending) return false
  try {
    await saveFn(pending.payload)
    clearPendingSave()
    return true
  } catch {
    // Leave it queued — next online event or manual flush will retry.
    return false
  }
}
