/**
 * SmartReminder — Shows contextual reminders based on time of day and completion state.
 * Morning (6–11 AM): nudge to complete morning ritual if not done
 * Afternoon (12–5 PM): nudge for state + goals if not logged
 * Evening (7–11 PM): nudge for evening ritual if not done
 * Also provides a "turn on notifications" prompt if permission not granted.
 */
import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'

export default function SmartReminder({ state, isAr, navigate }) {
  const [dismissed, setDismissed] = useState(false)
  const [notifState, setNotifState] = useState('unknown') // 'unknown' | 'granted' | 'denied' | 'unsupported'

  const hour = new Date().getHours()

  useEffect(() => {
    if (!('Notification' in window)) {
      setNotifState('unsupported')
    } else {
      setNotifState(Notification.permission)
    }
  }, [])

  const requestNotifications = async () => {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotifState(perm)
    if (perm === 'granted') {
      localStorage.removeItem('push-declined')
      // Show a test notification
      new Notification(isAr ? 'تم تفعيل التذكيرات ✓' : 'Reminders enabled ✓', {
        body: isAr
          ? 'سنذكّرك بالصباح (٧ ص) والمساء (٨ م)'
          : 'We\'ll remind you at 7 AM (morning) and 8 PM (evening)',
        icon: '/icon-192.png',
      })
    }
  }

  // Determine what reminder to show
  const getReminder = () => {
    if (hour >= 6 && hour < 12 && !state.morningDone) {
      return {
        emoji: '☀️',
        labelAr: 'يومك بدأ — الطقس الصباحي ينتظرك',
        labelEn: 'Your day started — morning ritual awaits',
        subAr: 'الصباح القوي يبني يوماً استثنائياً',
        subEn: 'A strong morning builds an extraordinary day',
        path: '/morning',
        btnAr: 'ابدأ الآن',
        btnEn: 'Start Now',
        color: '#c9a84c',
        bg: 'linear-gradient(135deg, #1a1200 0%, #121212)',
        border: 'rgba(201,168,76,0.5)',
        glow: 'rgba(201,168,76,0.15)',
        urgent: true,
      }
    }
    if (hour >= 12 && hour < 17 && !state.todayState) {
      return {
        emoji: '⚡',
        labelAr: 'كيف حالك هذا الظهر؟',
        labelEn: 'How are you this afternoon?',
        subAr: 'سجّل حالتك واستمر في يومك بقوة',
        subEn: 'Log your state and power through your day',
        path: '/state',
        btnAr: 'سجّل حالتي',
        btnEn: 'Log State',
        color: '#e63946',
        bg: 'linear-gradient(135deg, #1a0a0a 0%, #121212)',
        border: 'rgba(230,57,70,0.4)',
        glow: 'rgba(230,57,70,0.1)',
        urgent: false,
      }
    }
    if (hour >= 19 && hour < 24 && !state.eveningDone) {
      return {
        emoji: '🌙',
        labelAr: 'أنهِ يومك بوعي — الطقس المسائي',
        labelEn: 'End your day with intention — evening ritual',
        subAr: 'التأمل في اليوم يُضاعف النمو',
        subEn: 'Reflecting on your day multiplies growth',
        path: '/evening',
        btnAr: 'ابدأ المساء',
        btnEn: 'Start Evening',
        color: '#9b59b6',
        bg: 'linear-gradient(135deg, #0e0a1a 0%, #121212)',
        border: 'rgba(155,89,182,0.4)',
        glow: 'rgba(155,89,182,0.1)',
        urgent: false,
      }
    }
    return null
  }

  const reminder = getReminder()

  if (dismissed) return null

  return (
    <div className="space-y-3">
      {/* Time-based reminder */}
      {reminder && (
        <div className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: reminder.bg,
            border: `1.5px solid ${reminder.border}`,
            boxShadow: reminder.urgent ? `0 0 24px ${reminder.glow}` : 'none',
          }}>
          {/* Dismiss */}
          <button onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <X size={12} color="#555" />
          </button>

          <div className="flex items-center gap-3">
            <span style={{ fontSize: 36 }}>{reminder.emoji}</span>
            <div className="flex-1" style={{ paddingRight: 20 }}>
              <p className="text-sm font-black text-white" style={{ lineHeight: 1.3 }}>
                {isAr ? reminder.labelAr : reminder.labelEn}
              </p>
              <p className="text-xs mt-1" style={{ color: '#888' }}>
                {isAr ? reminder.subAr : reminder.subEn}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(reminder.path)}
            className="w-full mt-3 rounded-xl py-2.5 font-black text-sm transition-all active:scale-95"
            style={{ background: reminder.color, color: '#fff' }}>
            {isAr ? reminder.btnAr : reminder.btnEn} →
          </button>
        </div>
      )}

      {/* Notification permission prompt (one-time, dismissable) */}
      {notifState === 'default' && !localStorage.getItem('notif-prompt-dismissed') && (
        <div className="rounded-2xl p-4" style={{ background: '#0f0f0f', border: '1px solid #1e1e1e' }}>
          <div className="flex items-start gap-3">
            <Bell size={20} color="#c9a84c" style={{ flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-0.5">
                {isAr ? 'فعّل تذكيرات يومية' : 'Enable daily reminders'}
              </p>
              <p className="text-xs mb-3" style={{ color: '#777' }}>
                {isAr
                  ? 'تذكير الصباح (٧ ص) + المساء (٨ م) لمساعدتك على الاستمرارية'
                  : 'Morning (7 AM) + evening (8 PM) reminders to keep you consistent'}
              </p>
              <div className="flex gap-2">
                <button onClick={requestNotifications}
                  className="flex-1 rounded-xl py-2 font-bold text-xs transition-all active:scale-95"
                  style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}>
                  🔔 {isAr ? 'فعّل' : 'Enable'}
                </button>
                <button onClick={() => {
                  localStorage.setItem('notif-prompt-dismissed', '1')
                  setNotifState('dismissed')
                }}
                  className="flex-1 rounded-xl py-2 font-bold text-xs transition-all"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#555' }}>
                  <BellOff size={12} className="inline mr-1" />
                  {isAr ? 'لاحقاً' : 'Later'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Granted confirmation */}
      {notifState === 'granted' && !localStorage.getItem('notif-confirmed') && (
        <div className="rounded-xl p-3 flex items-center gap-2"
          style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)' }}
          onClick={() => localStorage.setItem('notif-confirmed', '1')}>
          <Bell size={14} color="#2ecc71" />
          <p className="text-xs font-bold" style={{ color: '#2ecc71' }}>
            {isAr ? '✓ التذكيرات مفعّلة' : '✓ Reminders enabled'}
          </p>
        </div>
      )}
    </div>
  )
}
