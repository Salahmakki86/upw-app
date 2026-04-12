import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame, Users, TrendingUp, Activity, AlertCircle, CheckCircle,
  ChevronLeft, RefreshCw, MessageCircle, Clock, BarChart2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { upwApi } from '../api/upwApi'

// ── Helpers ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d) =>
    d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
  return `${fmt(monday)} — ${fmt(sunday)}`
}

function getLast7DayKeys() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })
}

function daysAgo(dateStr) {
  if (!dateStr) return Infinity
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function lastActiveLabel(dateStr, isAr) {
  if (!dateStr) return isAr ? 'لم يدخل بعد' : 'Never logged in'
  const d = daysAgo(dateStr)
  if (d === 0) return isAr ? 'نشط اليوم' : 'Active today'
  if (d === 1) return isAr ? 'أمس' : 'Yesterday'
  if (d < 7) return isAr ? `منذ ${d} أيام` : `${d} days ago`
  return new Date(dateStr).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    day: 'numeric',
    month: 'short',
  })
}

function lastActiveColor(dateStr) {
  if (!dateStr) return '#555'
  const d = daysAgo(dateStr)
  if (d === 0) return '#4ade80'
  if (d <= 3) return '#c9a84c'
  return '#ff6b7a'
}

function calcWeekStats(st) {
  if (!st) return null
  const last7 = getLast7DayKeys()

  // Streak
  const streak = st.streak ?? 0

  // Gratitude days in last 7
  const gratitude = st.gratitude || {}
  const gratitudeDays = last7.filter((d) => {
    const entry = gratitude[d] || []
    return entry.filter((v) => v && v.trim()).length >= 3
  }).length

  // Sleep avg from sleepLog (array of { date, hours })
  const sleepLog = Array.isArray(st.sleepLog) ? st.sleepLog : []
  const sleepEntries = sleepLog.filter((e) => last7.includes(e?.date))
  const sleepAvg =
    sleepEntries.length > 0
      ? (
          sleepEntries.reduce((acc, e) => acc + (parseFloat(e.hours) || 0), 0) /
          sleepEntries.length
        ).toFixed(1)
      : null

  // Habit days: days in last 7 where habitLog has entries
  const habitLog = st.habitLog || st.challengeLog || {}
  const habitDays = last7.filter((d) => {
    const entry = habitLog[d]
    if (!entry) return false
    if (Array.isArray(entry)) return entry.length > 0
    if (typeof entry === 'object') return Object.keys(entry).length > 0
    return !!entry
  }).length

  // stateLog days in last 7
  const stateLog = Array.isArray(st.stateLog) ? st.stateLog : []
  const activityDays = stateLog.filter((e) => last7.includes(e?.date)).length

  // Days since last activity
  const lastActive = st.lastActiveDate || null
  const daysSinceActive = daysAgo(lastActive)
  const needsAttention = streak === 0 || daysSinceActive >= 3

  return { streak, gratitudeDays, sleepAvg, habitDays, activityDays, needsAttention, lastActive }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MiniBar({ value, max = 7, color = '#c9a84c' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div
      style={{ background: '#1a1a1a', borderRadius: 6, height: 6, overflow: 'hidden', flex: 1 }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 6,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  )
}

function StatRow({ icon, labelAr, labelEn, value, max, color, isAr }) {
  const displayVal = value == null ? '—' : typeof value === 'number' ? value : value
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: '#888', fontSize: 13, width: 16, textAlign: 'center' }}>{icon}</span>
      <span style={{ color: '#888', fontSize: 12, minWidth: 90 }}>{isAr ? labelAr : labelEn}</span>
      <MiniBar value={typeof value === 'number' ? value : 0} max={max} color={color} />
      <span style={{ color: '#ccc', fontSize: 12, minWidth: 28, textAlign: 'end' }}>
        {displayVal}
      </span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse"
      style={{ background: '#0e0e0e', border: '1px solid #1c1c1c' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div style={{ width: 120, height: 14, background: '#1e1e1e', borderRadius: 6 }} />
          <div style={{ width: 80, height: 10, background: '#1a1a1a', borderRadius: 6, marginTop: 6 }} />
        </div>
        <div style={{ width: 60, height: 22, background: '#1e1e1e', borderRadius: 8 }} />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <div style={{ width: 16, height: 10, background: '#1a1a1a', borderRadius: 4 }} />
          <div style={{ width: 90, height: 10, background: '#1a1a1a', borderRadius: 4 }} />
          <div style={{ flex: 1, height: 6, background: '#1a1a1a', borderRadius: 6 }} />
          <div style={{ width: 24, height: 10, background: '#1a1a1a', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  )
}

function StudentCard({ student, stats, error, isAr, onMessage }) {
  if (error) {
    return (
      <div
        className="rounded-2xl p-5"
        style={{ background: '#0e0e0e', border: '1px solid #1c1c1c' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: '#1a1a1a', color: '#555' }}
          >
            {(student.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#ccc' }}>
              {student.name || student.email}
            </p>
          </div>
        </div>
        <p className="text-xs" style={{ color: '#555' }}>
          {isAr ? 'بيانات غير متاحة' : 'Data unavailable'}
        </p>
      </div>
    )
  }

  if (!stats) return <SkeletonCard />

  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{
        background: '#0e0e0e',
        border: stats.needsAttention
          ? '1px solid rgba(255,107,122,0.35)'
          : '1px solid #1c1c1c',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: '#161616', color: '#c9a84c', border: '1px solid #2a2a2a' }}
          >
            {(student.name || student.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#e8e8e8' }}>
              {student.name || student.email}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: lastActiveColor(stats.lastActive) }}
            >
              {lastActiveLabel(stats.lastActive, isAr)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {stats.needsAttention && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'rgba(255,107,122,0.15)',
                color: '#ff6b7a',
                border: '1px solid rgba(255,107,122,0.25)',
              }}
            >
              {isAr ? '⚠ يحتاج تشجيعاً' : '⚠ Needs encouragement'}
            </span>
          )}
          {!stats.needsAttention && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'rgba(74,222,128,0.12)',
                color: '#4ade80',
                border: '1px solid rgba(74,222,128,0.2)',
              }}
            >
              {isAr ? '✓ نشط' : '✓ Active'}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-2 mb-4">
        <StatRow
          icon="🔥"
          labelAr="السلسلة"
          labelEn="Streak"
          value={stats.streak}
          max={30}
          color="#f97316"
          isAr={isAr}
        />
        <StatRow
          icon="🙏"
          labelAr="أيام الامتنان"
          labelEn="Gratitude days"
          value={stats.gratitudeDays}
          max={7}
          color="#c9a84c"
          isAr={isAr}
        />
        <StatRow
          icon="💪"
          labelAr="أيام العادات"
          labelEn="Habit days"
          value={stats.habitDays}
          max={7}
          color="#a855f7"
          isAr={isAr}
        />
        <StatRow
          icon="😴"
          labelAr="متوسط النوم"
          labelEn="Sleep avg (h)"
          value={stats.sleepAvg !== null ? parseFloat(stats.sleepAvg) : 0}
          max={10}
          color="#3b82f6"
          isAr={isAr}
        />
      </div>

      {/* Send message */}
      <button
        onClick={() => onMessage(student)}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 active:scale-95 transition-all text-sm font-medium"
        style={{
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.3)',
          color: '#c9a84c',
        }}
      >
        <MessageCircle size={15} />
        {isAr ? 'أرسل رسالة' : 'Send message'}
      </button>
    </div>
  )
}

// ── Quick send message modal ───────────────────────────────────────────────

function MessageModal({ student, onClose, isAr }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      await upwApi.sendMessage(student.id, text.trim())
      setSent(true)
      setTimeout(onClose, 1500)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#111', border: '1px solid rgba(201,168,76,0.3)' }}
      >
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: '1px solid #1e1e1e', direction: isAr ? 'rtl' : 'ltr' }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
              {isAr ? `رسالة لـ ${student.name || student.email}` : `Message to ${student.name || student.email}`}
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#555' }}>✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={32} className="mx-auto mb-2" style={{ color: '#4ade80' }} />
              <p className="text-sm font-bold" style={{ color: '#4ade80' }}>
                {isAr ? 'تم الإرسال ✓' : 'Sent ✓'}
              </p>
            </div>
          ) : (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                rows={4}
                className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                style={{
                  background: '#0e0e0e',
                  border: '1px solid #2a2a2a',
                  color: '#e0e0e0',
                  textAlign: isAr ? 'right' : 'left',
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !text.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm active:scale-95 transition-all"
                style={{
                  background: loading || !text.trim() ? '#1e1e1e' : '#c9a84c',
                  color: loading || !text.trim() ? '#555' : '#000',
                }}
              >
                {loading ? '...' : isAr ? 'إرسال' : 'Send'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function WeeklyReportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [students, setStudents] = useState([])
  const [statsMap, setStatsMap] = useState({}) // { [userId]: stats | null | 'error' }
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [messageTarget, setMessageTarget] = useState(null)

  const weekRange = useMemo(() => getWeekRange(), [])

  const loadData = async () => {
    setLoading(true)
    setStatsMap({})
    try {
      const list = await upwApi.getStudents()
      const top10 = list.slice(0, 10)
      setStudents(top10)

      const results = await Promise.allSettled(
        top10.map((s) => upwApi.getStudentState(s.id))
      )

      const map = {}
      results.forEach((res, i) => {
        const id = top10[i].id
        if (res.status === 'fulfilled') {
          map[id] = calcWeekStats(res.value?.state || res.value)
        } else {
          map[id] = 'error'
        }
      })
      setStatsMap(map)
    } catch (e) {
      console.error('WeeklyReportPage load error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  // Sorted: needs attention first
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const sa = statsMap[a.id]
      const sb = statsMap[b.id]
      const aNeed = sa === 'error' || sa?.needsAttention ? 1 : 0
      const bNeed = sb === 'error' || sb?.needsAttention ? 1 : 0
      return bNeed - aNeed
    })
  }, [students, statsMap])

  // Summary stats
  const totalStudents = students.length
  const activeThisWeek = students.filter((s) => {
    const st = statsMap[s.id]
    return st && st !== 'error' && !st.needsAttention
  }).length
  const needAttentionCount = students.filter((s) => {
    const st = statsMap[s.id]
    return st === 'error' || st?.needsAttention
  }).length

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#090909', direction: isAr ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 pt-safe-top flex items-center justify-between py-4"
        style={{ background: 'rgba(9,9,9,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1a1a1a' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
          style={{ background: '#1a1a1a' }}
        >
          <ChevronLeft size={18} style={{ color: '#888', transform: isAr ? 'rotate(180deg)' : 'none' }} />
        </button>

        <div className="text-center">
          <h1 className="font-bold text-base" style={{ color: '#e8e8e8' }}>
            {isAr ? 'التقرير الأسبوعي' : 'Weekly Report'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#c9a84c' }}>
            {weekRange}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
          style={{ background: '#1a1a1a' }}
        >
          <RefreshCw
            size={16}
            style={{ color: refreshing ? '#c9a84c' : '#888' }}
            className={refreshing ? 'animate-spin' : ''}
          />
        </button>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Summary strip */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#0e0e0e', border: '1px solid #1c1c1c' }}
        >
          <p
            className="text-xs font-semibold mb-3 uppercase tracking-widest"
            style={{ color: '#555' }}
          >
            {isAr ? 'ملخص الأسبوع' : 'Week Summary'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: <Users size={16} />,
                value: loading ? '—' : totalStudents,
                labelAr: 'إجمالي',
                labelEn: 'Total',
                color: '#c9a84c',
              },
              {
                icon: <Activity size={16} />,
                value: loading ? '—' : activeThisWeek,
                labelAr: 'نشطون',
                labelEn: 'Active',
                color: '#4ade80',
              },
              {
                icon: <AlertCircle size={16} />,
                value: loading ? '—' : needAttentionCount,
                labelAr: 'يحتاج عناية',
                labelEn: 'Need care',
                color: '#ff6b7a',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl p-3 text-center"
                style={{ background: '#0a0a0a', border: '1px solid #1a1a1a' }}
              >
                <div
                  className="flex items-center justify-center mb-1"
                  style={{ color: item.color }}
                >
                  {item.icon}
                </div>
                <p className="font-bold text-xl" style={{ color: item.color }}>
                  {item.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>
                  {isAr ? item.labelAr : item.labelEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Student cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sortedStudents.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto mb-3" style={{ color: '#333' }} />
            <p style={{ color: '#555' }}>{isAr ? 'لا يوجد طلاب' : 'No students found'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                stats={
                  statsMap[student.id] === 'error'
                    ? undefined
                    : statsMap[student.id]
                }
                error={statsMap[student.id] === 'error'}
                isAr={isAr}
                onMessage={setMessageTarget}
              />
            ))}
          </div>
        )}

        {/* Note about top-10 limit */}
        {!loading && students.length === 10 && (
          <p className="text-center text-xs pb-2" style={{ color: '#444' }}>
            {isAr ? 'يظهر أول ١٠ طلاب فقط' : 'Showing first 10 students only'}
          </p>
        )}
      </div>

      {/* Message modal */}
      {messageTarget && (
        <MessageModal
          student={messageTarget}
          isAr={isAr}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  )
}
