import { useState, useMemo } from 'react'
import { Moon, Sun, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

/* ─── HELPERS ───────────────────────────────────────────────────────── */
function calcHours(bedtime, waketime) {
  if (!bedtime || !waketime) return null
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = waketime.split(':').map(Number)
  let diff = (wh * 60 + wm) - (bh * 60 + bm)
  if (diff < 0) diff += 24 * 60  // crossed midnight
  return Math.round((diff / 60) * 10) / 10
}

function hoursColor(h) {
  if (h === null) return '#555'
  if (h < 6) return '#e74c3c'
  if (h < 7) return '#e67e22'
  if (h < 8) return '#c9a84c'
  return '#2ecc71'
}

function sleepScore(hours, quality) {
  if (hours === null || !quality) return null
  return Math.round((hours / 8) * 50 + (quality / 10) * 50)
}

function getDateKey(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return d.toISOString().split('T')[0]
}

function formatDateDisplay(dateStr, isAr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
}

/* ─── WEEKLY BAR CHART ──────────────────────────────────────────────── */
function WeeklyChart({ sleepLog, t, isAr }) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const key = getDateKey(i)
    const entry = sleepLog[key]
    days.push({ key, entry })
  }

  const maxH = 10
  const dayLabels = isAr
    ? ['أحد', 'اثن', 'ثلا', 'أرب', 'خمس', 'جمع', 'سبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="card p-4 mb-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#c9a84c' }}>
        {t('آخر 7 أيام', 'Last 7 Nights')}
      </h3>
      <div className="flex items-end justify-between gap-1" style={{ height: 80 }}>
        {days.map(({ key, entry }) => {
          const h = entry?.hours ?? null
          const color = hoursColor(h)
          const heightPct = h !== null ? Math.min((h / maxH) * 100, 100) : 0
          const d = new Date(key + 'T00:00:00')
          const dayIdx = d.getDay()
          return (
            <div key={key} className="flex flex-col items-center flex-1 gap-1">
              <div
                className="text-xs font-semibold"
                style={{ color: h !== null ? color : '#444', fontSize: '10px' }}
              >
                {h !== null ? `${h}h` : '—'}
              </div>
              <div className="w-full flex items-end" style={{ height: 56 }}>
                <div
                  className="w-full rounded-t transition-all duration-500"
                  style={{
                    height: `${heightPct}%`,
                    background: h !== null ? color : '#222',
                    minHeight: h !== null ? 3 : 0,
                  }}
                />
              </div>
              <div className="text-xs" style={{ color: '#555', fontSize: '9px' }}>
                {dayLabels[dayIdx]}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {[
          { color: '#e74c3c', label: t('< 6h', '< 6h') },
          { color: '#e67e22', label: t('6-7h', '6-7h') },
          { color: '#c9a84c', label: t('7-8h', '7-8h') },
          { color: '#2ecc71', label: t('8h+', '8h+') },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
            <span className="text-xs" style={{ color: '#777' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── SCORE TIPS ────────────────────────────────────────────────────── */
function ScoreTips({ score, t, isAr }) {
  if (score === null) return null

  let level, color, emoji, tips
  if (score < 60) {
    level = t('يحتاج تحسين', 'Needs Improvement')
    color = '#e74c3c'
    emoji = '⚠️'
    tips = isAr ? [
      'حاول النوم قبل الساعة 11 مساءً',
      'أبعد الشاشات قبل النوم بساعة',
      'درجة حرارة الغرفة المثالية 18-20°م',
      'تجنب الكافيين بعد الساعة 2 ظهراً',
    ] : [
      'Try sleeping before 11 PM',
      'Avoid screens 1 hour before bed',
      'Ideal room temperature: 65-68°F',
      'Avoid caffeine after 2 PM',
    ]
  } else if (score < 80) {
    level = t('جيد', 'Good')
    color = '#c9a84c'
    emoji = '👍'
    tips = isAr ? [
      'نومك جيد — حافظ على التوقيت المنتظم',
      'أضف 30 دقيقة إضافية لتصل للمثالي',
      'التمارين الصباحية تحسّن جودة النوم',
    ] : [
      'Good sleep — maintain a regular schedule',
      'Add 30 more minutes to reach optimal',
      'Morning exercise improves sleep quality',
    ]
  } else {
    level = t('ممتاز', 'Excellent')
    color = '#2ecc71'
    emoji = '🌟'
    tips = isAr ? [
      'نوم ممتاز! جسمك يشكرك',
      'حافظ على هذا الروتين الرائع',
      'النوم المثالي يزيد الطاقة والتركيز بـ 40%',
    ] : [
      'Excellent sleep! Your body thanks you',
      'Keep this amazing routine',
      'Optimal sleep boosts energy & focus by 40%',
    ]
  }

  return (
    <div className="card p-4 mb-4" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <span className="font-bold text-sm" style={{ color }}>{level}</span>
        <span className="text-xs ml-auto font-bold" style={{ color, fontSize: '20px' }}>
          {score}
        </span>
        <span className="text-xs" style={{ color: '#888' }}>/100</span>
      </div>
      <ul className="space-y-1">
        {tips.map((tip, i) => (
          <li key={i} className="text-xs flex items-start gap-2" style={{ color: '#aaa' }}>
            <span style={{ color, marginTop: 1 }}>•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────────────────────── */
export default function SleepTracker() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const sleepLog = state.sleepLog || {}
  const today = getDateKey(0)
  const todayEntry = sleepLog[today] || {}

  const [bedtime, setBedtime] = useState(todayEntry.bedtime || '')
  const [waketime, setWaketime] = useState(todayEntry.waketime || '')
  const [quality, setQuality] = useState(todayEntry.quality || 7)
  const [notes, setNotes] = useState(todayEntry.notes || '')
  const [showHistory, setShowHistory] = useState(false)

  const t = (ar, en) => isAr ? ar : en

  // Auto-calc hours
  const hours = calcHours(bedtime, waketime)

  const saveEntry = () => {
    const entry = {
      bedtime,
      waketime,
      hours: hours ?? todayEntry.hours ?? null,
      quality: Number(quality),
      notes: notes.trim(),
    }
    update('sleepLog', { ...sleepLog, [today]: entry })
  }

  // Weekly stats
  const weekStats = useMemo(() => {
    const entries = []
    for (let i = 0; i < 7; i++) {
      const key = getDateKey(i)
      if (sleepLog[key]?.hours) entries.push(sleepLog[key])
    }
    const avgHours = entries.length
      ? Math.round((entries.reduce((s, e) => s + e.hours, 0) / entries.length) * 10) / 10
      : null
    const avgQuality = entries.length
      ? Math.round(entries.reduce((s, e) => s + (e.quality || 0), 0) / entries.length * 10) / 10
      : null
    return { avgHours, avgQuality, count: entries.length }
  }, [sleepLog])

  // Streak: consecutive days logged ending today
  const streak = useMemo(() => {
    let s = 0
    let i = 0
    while (true) {
      const key = getDateKey(i)
      if (!sleepLog[key]?.hours) break
      s++
      i++
    }
    return s
  }, [sleepLog])

  // Today's score
  const todayScore = useMemo(() => {
    const h = hours ?? todayEntry.hours ?? null
    const q = quality || todayEntry.quality || null
    return sleepScore(h, q)
  }, [hours, quality, todayEntry])

  // Last 14 days for history
  const history = useMemo(() => {
    const result = []
    for (let i = 1; i <= 14; i++) {
      const key = getDateKey(i)
      if (sleepLog[key]) result.push({ key, ...sleepLog[key] })
    }
    return result
  }, [sleepLog])

  return (
    <Layout
      title={t('متتبع النوم', 'Sleep Tracker')}
      subtitle={t('النوم الجيد أساس كل شيء عظيم', 'Good sleep is the foundation of everything great')}
    >
      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card p-3 text-center">
          <div className="text-xl font-bold" style={{ color: '#c9a84c' }}>
            {weekStats.avgHours ?? '—'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#888' }}>
            {t('متوسط ساعات', 'Avg Hours')}
          </div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-bold" style={{ color: '#9b59b6' }}>
            {weekStats.avgQuality ?? '—'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#888' }}>
            {t('متوسط الجودة', 'Avg Quality')}
          </div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xl font-bold" style={{ color: '#e67e22' }}>
            {streak}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#888' }}>
            {t('أيام متواصلة', 'Day Streak')}
          </div>
        </div>
      </div>

      {/* Today's Entry */}
      <div className="card p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#c9a84c' }}>
          <Moon size={16} />
          {t('تسجيل الليلة', 'Tonight\'s Log')}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Bedtime */}
          <div>
            <label className="block text-xs mb-1" style={{ color: '#888' }}>
              <Moon size={11} className="inline mr-1" />
              {t('وقت النوم', 'Bedtime')}
            </label>
            <input
              type="time"
              className="input-dark w-full"
              value={bedtime}
              onChange={e => setBedtime(e.target.value)}
            />
          </div>
          {/* Wake time */}
          <div>
            <label className="block text-xs mb-1" style={{ color: '#888' }}>
              <Sun size={11} className="inline mr-1" />
              {t('وقت الاستيقاظ', 'Wake Time')}
            </label>
            <input
              type="time"
              className="input-dark w-full"
              value={waketime}
              onChange={e => setWaketime(e.target.value)}
            />
          </div>
        </div>

        {/* Auto hours display */}
        {hours !== null && (
          <div
            className="flex items-center justify-center gap-2 py-2 rounded-lg mb-3"
            style={{ background: `${hoursColor(hours)}22`, border: `1px solid ${hoursColor(hours)}44` }}
          >
            <Clock size={14} style={{ color: hoursColor(hours) }} />
            <span className="font-bold text-sm" style={{ color: hoursColor(hours) }}>
              {hours} {t('ساعات نوم', 'hours of sleep')}
            </span>
          </div>
        )}

        {/* Quality Slider */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs" style={{ color: '#888' }}>
              <Star size={11} className="inline mr-1" />
              {t('جودة النوم', 'Sleep Quality')}
            </label>
            <span className="font-bold text-sm" style={{ color: '#c9a84c' }}>
              {quality}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={quality}
            onChange={e => setQuality(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: '#c9a84c' }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: '#555' }}>
            <span>{t('سيء جداً', 'Very Poor')}</span>
            <span>{t('ممتاز', 'Excellent')}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-3">
          <label className="block text-xs mb-1" style={{ color: '#888' }}>
            {t('ملاحظات', 'Notes')}
          </label>
          <textarea
            className="input-dark w-full resize-none text-sm"
            rows={2}
            placeholder={t('كيف كان نومك؟ أحلام؟ استيقاظ مبكر؟', 'How was your sleep? Dreams? Early wake-up?')}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            dir={isAr ? 'rtl' : 'ltr'}
          />
        </div>

        <button className="btn-gold w-full" onClick={saveEntry}>
          {t('حفظ تسجيل النوم', 'Save Sleep Log')}
        </button>
      </div>

      {/* Weekly Chart */}
      <WeeklyChart sleepLog={sleepLog} t={t} isAr={isAr} />

      {/* Sleep Score & Tips */}
      {todayScore !== null && (
        <div className="card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: '#c9a84c' }}>
              {t('نقاط النوم اليوم', 'Today\'s Sleep Score')}
            </h3>
          </div>
          {/* Score bar */}
          <div className="relative mb-3">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${todayScore}%`,
                  background: todayScore < 60 ? '#e74c3c' : todayScore < 80 ? '#c9a84c' : '#2ecc71',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div
              className="text-right text-xs font-bold mt-1"
              style={{ color: todayScore < 60 ? '#e74c3c' : todayScore < 80 ? '#c9a84c' : '#2ecc71' }}
            >
              {todayScore}/100
            </div>
          </div>
          <p className="text-xs" style={{ color: '#666' }}>
            {t(
              '= (ساعات/8 × 50) + (جودة/10 × 50)',
              '= (hours/8 × 50) + (quality/10 × 50)',
            )}
          </p>
        </div>
      )}

      <ScoreTips score={todayScore} t={t} isAr={isAr} />

      {/* History */}
      {history.length > 0 && (
        <div className="card p-4">
          <button
            className="flex justify-between items-center w-full"
            onClick={() => setShowHistory(!showHistory)}
          >
            <h3 className="text-sm font-semibold" style={{ color: '#c9a84c' }}>
              {t('آخر 14 يوم', 'Last 14 Days')}
            </h3>
            {showHistory
              ? <ChevronUp size={16} style={{ color: '#888' }} />
              : <ChevronDown size={16} style={{ color: '#888' }} />
            }
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {history.map(entry => {
                const sc = sleepScore(entry.hours, entry.quality)
                return (
                  <div
                    key={entry.key}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: '#1a1a1a' }}
                  >
                    <div className="text-xs font-mono" style={{ color: '#666', minWidth: 60 }}>
                      {formatDateDisplay(entry.key, isAr)}
                    </div>
                    <div
                      className="font-bold text-sm"
                      style={{ color: hoursColor(entry.hours), minWidth: 36 }}
                    >
                      {entry.hours ? `${entry.hours}h` : '—'}
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                      <Star size={10} style={{ color: '#c9a84c' }} />
                      <span className="text-xs" style={{ color: '#888' }}>
                        {entry.quality ?? '—'}/10
                      </span>
                    </div>
                    {sc !== null && (
                      <div
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{
                          background: sc < 60 ? '#e74c3c22' : sc < 80 ? '#c9a84c22' : '#2ecc7122',
                          color: sc < 60 ? '#e74c3c' : sc < 80 ? '#c9a84c' : '#2ecc71',
                        }}
                      >
                        {sc}
                      </div>
                    )}
                    {entry.bedtime && entry.waketime && (
                      <div className="text-xs" style={{ color: '#555' }}>
                        {entry.bedtime} → {entry.waketime}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
