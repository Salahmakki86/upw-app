/**
 * NotificationsPrefsPage — M7 Notification Preferences
 *
 * Users choose WHAT gets notified, WHEN, and how many per day.
 * Persisted in state.notificationPrefs; NotificationSetup reads these
 * (when we integrate scheduler later it will respect these).
 */
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

const CATEGORIES = [
  { key: 'morningRitual', emoji: '☀️', ar: 'تذكير الطقس الصباحي', en: 'Morning ritual reminder' },
  { key: 'eveningReflect', emoji: '🌙', ar: 'تذكير التأمل المسائي', en: 'Evening reflection reminder' },
  { key: 'stateCheck',     emoji: '⚡', ar: 'فحص الحالة', en: 'State check-in' },
  { key: 'identityCheck',  emoji: '🎭', ar: 'فحص الهوية', en: 'Identity check-in' },
  { key: 'gratitude',      emoji: '🙏', ar: 'الامتنان',    en: 'Gratitude reminder' },
  { key: 'weeklyPulse',    emoji: '📊', ar: 'نبض الأسبوع', en: 'Weekly pulse' },
  { key: 'challenges',     emoji: '🎯', ar: 'تحديات',       en: 'Challenge reminders' },
  { key: 'coach',          emoji: '💬', ar: 'رسائل المدرب', en: 'Coach messages' },
  { key: 'celebrations',   emoji: '🎉', ar: 'احتفالات',     en: 'Celebrations' },
]

const FREQS = [
  { id: 'essential', ar: 'أساسي فقط', en: 'Essentials only',  maxPerDay: 2 },
  { id: 'balanced',  ar: 'متوازن',    en: 'Balanced',         maxPerDay: 4 },
  { id: 'full',      ar: 'كامل',      en: 'Full',             maxPerDay: 8 },
  { id: 'silent',    ar: 'صامت',      en: 'Silent',           maxPerDay: 0 },
]

export default function NotificationsPrefsPage() {
  const { state, updateNotificationPref } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const prefs = state.notificationPrefs || {}
  const channels = prefs.channels || {}
  const freq = prefs.frequency || 'balanced'
  const quiet = prefs.quietHours || { start: '22:00', end: '07:00' }

  const toggleChannel = (key) => {
    updateNotificationPref('channels', {
      ...channels,
      [key]: channels[key] !== false ? false : true,
    })
  }

  const setFreq = (id) => {
    updateNotificationPref('frequency', id)
    showToast(isAr ? 'تم تحديث التواتر' : 'Frequency updated', 'success', 1200)
  }

  const setQuietStart = (v) => updateNotificationPref('quietHours', { ...quiet, start: v })
  const setQuietEnd   = (v) => updateNotificationPref('quietHours', { ...quiet, end: v })

  return (
    <Layout
      title={isAr ? '🔔 تفضيلات الإشعارات' : '🔔 Notification Preferences'}
      subtitle={isAr ? 'أنت تتحكم فيما يصلك ومتى' : 'You control what you get and when'}
    >
      <div className="space-y-4 pt-2">

        {/* Frequency */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 10 }}>
            {isAr ? '⚙️ التواتر الكلي' : '⚙️ Overall frequency'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {FREQS.map(f => (
              <button
                key={f.id}
                onClick={() => setFreq(f.id)}
                className="rounded-xl py-2.5 text-xs font-bold transition-all"
                style={{
                  background: freq === f.id ? 'rgba(201,168,76,0.15)' : '#141414',
                  border: `1px solid ${freq === f.id ? 'rgba(201,168,76,0.4)' : '#222'}`,
                  color: freq === f.id ? '#c9a84c' : '#888',
                }}
              >
                {isAr ? f.ar : f.en}
                <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2, opacity: 0.7 }}>
                  {isAr ? `حتى ${f.maxPerDay} يومياً` : `up to ${f.maxPerDay}/day`}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 10 }}>
            {isAr ? '📋 القنوات' : '📋 Channels'}
          </p>
          {CATEGORIES.map(c => {
            const on = channels[c.key] !== false
            return (
              <div
                key={c.key}
                onClick={() => toggleChannel(c.key)}
                role="switch"
                aria-checked={on}
                tabIndex={0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', marginBottom: 4,
                  background: on ? 'rgba(201,168,76,0.06)' : '#141414',
                  border: `1px solid ${on ? 'rgba(201,168,76,0.25)' : '#222'}`,
                  borderRadius: 10, cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 18 }}>{c.emoji}</span>
                <span style={{ flex: 1, fontSize: 12, color: on ? '#fff' : '#777', fontWeight: 700 }}>
                  {isAr ? c.ar : c.en}
                </span>
                <div style={{
                  width: 32, height: 18, borderRadius: 9,
                  background: on ? 'rgba(201,168,76,0.4)' : '#222',
                  position: 'relative', transition: 'background 0.2s',
                }}>
                  <div style={{
                    position: 'absolute', top: 2,
                    insetInlineStart: on ? 16 : 2,
                    width: 14, height: 14, borderRadius: '50%',
                    background: on ? '#c9a84c' : '#444',
                    transition: 'inset-inline-start 0.2s',
                  }}/>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quiet hours */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 10 }}>
            {isAr ? '🌙 ساعات الهدوء' : '🌙 Quiet hours'}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>
                {isAr ? 'من' : 'From'}
              </label>
              <input
                type="time"
                value={quiet.start}
                onChange={e => setQuietStart(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs"
                style={{ background: '#141414', border: '1px solid #222', color: '#fff' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>
                {isAr ? 'إلى' : 'To'}
              </label>
              <input
                type="time"
                value={quiet.end}
                onChange={e => setQuietEnd(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs"
                style={{ background: '#141414', border: '1px solid #222', color: '#fff' }}
              />
            </div>
          </div>
          <p style={{ fontSize: 9, color: '#666', marginTop: 6 }}>
            {isAr
              ? 'لا إشعارات خلال هذه الساعات'
              : 'No notifications during these hours'}
          </p>
        </div>
      </div>
    </Layout>
  )
}
