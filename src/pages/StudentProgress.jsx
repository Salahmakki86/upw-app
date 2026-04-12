import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, RefreshCw, Search, Flame, ChevronDown, ChevronUp,
  MessageCircle, Send, X, Check, Users, TrendingUp, Zap,
  Target, Sun, Moon, Star, BarChart2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { upwApi } from '../api/upwApi'

// ── Helpers ───────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0]

function daysAgo(dateStr) {
  if (!dateStr) return Infinity
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function lastActiveLabel(dateStr) {
  if (!dateStr) return 'لم يدخل بعد'
  const d = daysAgo(dateStr)
  if (d === 0) return 'نشط اليوم'
  if (d === 1) return 'أمس'
  if (d < 7)  return `منذ ${d} أيام`
  return new Date(dateStr).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}

function lastActiveColor(dateStr) {
  if (!dateStr) return '#555'
  const d = daysAgo(dateStr)
  if (d === 0) return '#4ade80'
  if (d <= 3)  return '#c9a84c'
  return '#ff6b7a'
}

/**
 * Calculate overall progress % from student state.
 * 5 pillars, each worth 20%:
 *   1. Morning done today
 *   2. Evening done today
 *   3. Has at least one goal
 *   4. Wheel of life filled (any score ≠ default null/undefined)
 *   5. Has at least one belief (limiting or empowering)
 */
function calcProgress(st) {
  if (!st) return 0
  const t = today()
  let score = 0
  if (st.morningDone && st.lastActiveDate === t) score += 20
  if (st.eveningDone && st.lastActiveDate === t) score += 20
  if (Array.isArray(st.goals) && st.goals.length > 0)           score += 20
  if (st.wheelScores && Object.values(st.wheelScores).some(v => v > 0)) score += 20
  const lb = Array.isArray(st.limitingBeliefs)   ? st.limitingBeliefs.length   : 0
  const eb = Array.isArray(st.empoweringBeliefs) ? st.empoweringBeliefs.length : 0
  if (lb + eb > 0) score += 20
  return score
}

function wheelAvg(wheelScores) {
  if (!wheelScores) return 0
  const vals = Object.values(wheelScores).filter(v => typeof v === 'number')
  if (!vals.length) return 0
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

function goalsCount(goals) {
  if (!Array.isArray(goals)) return { total: 0, done: 0 }
  return {
    total: goals.length,
    done:  goals.filter(g => g.progress >= 100 || g.done || g.completed).length,
  }
}

// ── Progress Ring ─────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 40, stroke = 3.5 }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 80 ? '#4ade80' : pct >= 40 ? '#c9a84c' : '#ff6b7a'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2a2a" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x="50%" y="50%"
        textAnchor="middle" dominantBaseline="central"
        style={{ fill: color, fontSize: size * 0.28, fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: 'center' }}
      >
        {pct}%
      </text>
    </svg>
  )
}

// ── Send Message Modal ────────────────────────────────────────────────────

function SendMessageModal({ student, onClose }) {
  const [text,    setText]    = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSend = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      await upwApi.sendCoachMessage({
        toUserId: student.id,
        message: text.trim(),
        type: 'motivation',
      })
      setSent(true)
      setTimeout(onClose, 1600)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', direction: 'rtl' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.3)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #222' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>رسالة لـ {student.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#555', direction: 'ltr' }}>{student.email}</p>
          </div>
          <button onClick={onClose} style={{ color: '#555' }}><X size={18} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {sent ? (
            <div className="text-center py-5">
              <Check size={36} className="mx-auto mb-2" style={{ color: '#4ade80' }} />
              <p className="text-sm font-bold" style={{ color: '#4ade80' }}>تم الإرسال بنجاح ✓</p>
            </div>
          ) : (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                rows={5}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ background: '#1e1e1e', border: '1px solid #333', color: '#fff' }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !text.trim()}
                className="w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)', color: '#0a0a0a' }}
              >
                {loading ? <RefreshCw size={15} className="animate-spin" /> : <><Send size={15} /> إرسال</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Expanded Student Details ──────────────────────────────────────────────

function StudentDetails({ userId }) {
  const [st,      setSt]      = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    upwApi.getStudentState(userId)
      .then(data => { setSt(data.state || data); setLoading(false) })
      .catch(e  => { setError(e.message); setLoading(false) })
  }, [userId])

  if (loading) return (
    <div className="flex items-center justify-center py-6">
      <RefreshCw size={16} className="animate-spin" style={{ color: '#c9a84c' }} />
    </div>
  )

  if (error) return (
    <p className="text-xs text-center py-4" style={{ color: '#ff6b7a' }}>تعذّر تحميل البيانات</p>
  )

  if (!st) return (
    <p className="text-xs text-center py-4" style={{ color: '#555' }}>لا توجد بيانات بعد</p>
  )

  const t      = today()
  const goals  = goalsCount(st.goals)
  const wAvg   = wheelAvg(st.wheelScores)
  const lb     = Array.isArray(st.limitingBeliefs)   ? st.limitingBeliefs.length   : 0
  const eb     = Array.isArray(st.empoweringBeliefs) ? st.empoweringBeliefs.length : 0
  const challengeDay = st.challengeDay || 0
  const name   = st.userName || '—'

  const Row = ({ icon, label, value, color = '#e8e8e8' }) => (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #1e1e1e' }}>
      <div className="flex items-center gap-2">
        <span style={{ color: '#555' }}>{icon}</span>
        <span className="text-xs" style={{ color: '#888' }}>{label}</span>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  )

  return (
    <div className="mt-3 rounded-xl p-4" style={{ background: '#181818', border: '1px solid #2a2a2a' }}>
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <Row icon={<Sun size={13} />}     label="الاسم"         value={name} />
          <Row icon={<Flame size={13} />}   label="الـ Streak"    value={`${st.streak || 0} يوم`} color="#f97316" />
          <Row icon={<Sun size={13} />}     label="صباح اليوم"    value={st.morningDone && st.lastActiveDate === t ? '✅' : '❌'} />
          <Row icon={<Moon size={13} />}    label="مساء اليوم"    value={st.eveningDone && st.lastActiveDate === t ? '✅' : '❌'} />
          <Row icon={<Target size={13} />}  label="الأهداف"       value={`${goals.done}/${goals.total}`} color="#c9a84c" />
        </div>
        <div>
          <Row icon={<BarChart2 size={13} />} label="متوسط العجلة"  value={wAvg}             color="#a78bfa" />
          <Row icon={<Star size={13} />}      label="معتقدات تمكين" value={eb}               color="#4ade80" />
          <Row icon={<Star size={13} />}      label="معتقدات محدودة" value={lb}              color="#fb923c" />
          <Row icon={<Zap size={13} />}       label="يوم التحدي"    value={challengeDay}     color="#38bdf8" />
          <Row icon={<TrendingUp size={13} />} label="التقدم الكلي" value={`${calcProgress(st)}%`} color="#4ade80" />
        </div>
      </div>

      {/* Wheel Scores */}
      {st.wheelScores && (
        <div className="mt-3">
          <p className="text-xs mb-2" style={{ color: '#555' }}>عجلة الحياة:</p>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.entries(st.wheelScores).map(([key, val]) => {
              const labels = { body: 'الجسد', emotions: 'المشاعر', relationships: 'علاقات', time: 'وقت', career: 'مهنة', money: 'مال', contribution: 'عطاء' }
              const pct = Math.round((val / 10) * 100)
              const color = pct >= 70 ? '#4ade80' : pct >= 40 ? '#c9a84c' : '#ff6b7a'
              return (
                <div key={key} className="rounded-lg p-2 text-center" style={{ background: '#1e1e1e' }}>
                  <p className="text-xs font-bold" style={{ color }}>{val}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#555' }}>{labels[key] || key}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Student Card ──────────────────────────────────────────────────────────

function StudentCard({ student, onMessage }) {
  const [expanded, setExpanded] = useState(false)

  const t       = today()
  const st      = student.state || {}
  const pct     = calcProgress(st)
  const streak  = st.streak || 0
  const lastAct = st.lastActiveDate || null
  const goals   = goalsCount(st.goals)
  const wAvg    = wheelAvg(st.wheelScores)
  const mDone   = st.morningDone && st.lastActiveDate === t
  const eDone   = st.eveningDone && st.lastActiveDate === t

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{ background: '#161616', border: `1px solid ${expanded ? 'rgba(201,168,76,0.35)' : '#2a2a2a'}` }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-base"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}
          >
            {student.name?.charAt(0) || '?'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold" style={{ color: '#e8e8e8' }}>{student.name}</span>
              {streak > 0 && (
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}
                >
                  <Flame size={10} /> {streak}
                </span>
              )}
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ background: lastActiveColor(lastAct) + '22', color: lastActiveColor(lastAct) }}
              >
                {lastActiveLabel(lastAct)}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#666', direction: 'ltr' }}>{student.email}</p>

            {/* Quick stats row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs" style={{ color: mDone ? '#4ade80' : '#555' }}>
                <Sun size={11} /> {mDone ? '✅' : '❌'}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: eDone ? '#4ade80' : '#555' }}>
                <Moon size={11} /> {eDone ? '✅' : '❌'}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: '#a78bfa' }}>
                <BarChart2 size={11} /> {wAvg}
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: '#c9a84c' }}>
                <Target size={11} /> {goals.done}/{goals.total}
              </span>
            </div>
          </div>

          {/* Progress ring + actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <ProgressRing pct={pct} size={42} />
            <div className="flex gap-1.5">
              <button
                onClick={() => onMessage(student)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}
                title="إرسال رسالة"
              >
                <MessageCircle size={13} />
              </button>
              <button
                onClick={() => setExpanded(v => !v)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#888' }}
              >
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4">
          <StudentDetails userId={student.id} />
        </div>
      )}
    </div>
  )
}

// ── Main StudentProgress ──────────────────────────────────────────────────

export default function StudentProgress() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [students,   setStudents]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [sortBy,     setSortBy]     = useState('streak') // 'streak' | 'lastActive' | 'name' | 'progress'
  const [msgStudent, setMsgStudent] = useState(null)

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}>
        <p style={{ color: '#ff6b7a' }}>غير مصرح</p>
      </div>
    )
  }

  const load = async () => {
    setLoading(true)
    try {
      const data = await upwApi.getProgress()
      // getProgress returns basic info; we enrich with state lazily per card
      // Map to consistent shape
      setStudents(
        data.map(s => ({
          id:    s.id,
          name:  s.name,
          email: s.email,
          state: {
            streak:         s.streak         ?? 0,
            lastActiveDate: s.lastActive     ?? null,
            morningDone:    s.morningDone    ?? false,
            eveningDone:    s.eveningDone    ?? false,
            goals:          s.goals          ?? [],
            wheelScores:    s.wheelScores    ?? null,
            limitingBeliefs:  s.limitingBeliefs  ?? [],
            empoweringBeliefs:s.empoweringBeliefs ?? [],
          },
        }))
      )
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const t = today()

  const filtered = useMemo(() => {
    let list = [...students]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(s => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      if (sortBy === 'streak')     return (b.state?.streak ?? 0) - (a.state?.streak ?? 0)
      if (sortBy === 'lastActive') return daysAgo(a.state?.lastActiveDate) - daysAgo(b.state?.lastActiveDate)
      if (sortBy === 'name')       return (a.name || '').localeCompare(b.name || '', 'ar')
      if (sortBy === 'progress')   return calcProgress(b.state) - calcProgress(a.state)
      return 0
    })
    return list
  }, [students, search, sortBy])

  const activeToday  = students.filter(s => s.state?.lastActiveDate === t).length
  const avgStreak    = students.length
    ? (students.reduce((sum, s) => sum + (s.state?.streak || 0), 0) / students.length).toFixed(1)
    : 0

  return (
    <div
      className="min-h-screen pb-10"
      style={{ background: 'linear-gradient(160deg, #090909 0%, #111 100%)', direction: 'rtl' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4"
        style={{ background: '#111', borderBottom: '1px solid #1e1e1e' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: '#1e1e1e' }}
        >
          <ArrowRight size={18} style={{ color: '#c9a84c' }} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <TrendingUp size={20} style={{ color: '#c9a84c' }} />
          <h1 className="text-lg font-black" style={{ color: '#e8e8e8' }}>تقدم الطلاب</h1>
        </div>
        <button
          onClick={load}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: '#1e1e1e' }}
        >
          <RefreshCw size={15} style={{ color: loading ? '#c9a84c' : '#666' }} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-4">

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'الطلاب', value: students.length, color: '#888', icon: <Users size={14} /> },
            { label: 'نشطون اليوم', value: activeToday, color: '#4ade80', icon: <Zap size={14} /> },
            { label: 'متوسط Streak', value: `${avgStreak} 🔥`, color: '#f97316', icon: <Flame size={14} /> },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-2xl p-3 text-center"
              style={{ background: '#161616', border: '1px solid #2a2a2a' }}
            >
              <div className="flex justify-center mb-1" style={{ color: item.color }}>{item.icon}</div>
              <p className="text-lg font-black leading-tight" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#555' }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-4" style={{ color: '#555' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الإيميل..."
            className="w-full rounded-xl pr-10 pl-4 py-3 text-sm outline-none"
            style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#e8e8e8' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 -translate-y-1/2 left-4"
              style={{ color: '#555' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'streak',     label: 'الـ Streak' },
            { key: 'lastActive', label: 'آخر نشاط' },
            { key: 'progress',   label: 'التقدم' },
            { key: 'name',       label: 'الاسم' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95"
              style={{
                background: sortBy === opt.key ? 'rgba(201,168,76,0.2)' : '#1e1e1e',
                border: sortBy === opt.key ? '1px solid rgba(201,168,76,0.5)' : '1px solid #2a2a2a',
                color: sortBy === opt.key ? '#c9a84c' : '#666',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Students List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={22} className="animate-spin" style={{ color: '#c9a84c' }} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: '#555' }}>
            {search ? 'لا نتائج للبحث' : 'لا يوجد طلاب بعد'}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(s => (
              <StudentCard
                key={s.id}
                student={s}
                onMessage={setMsgStudent}
              />
            ))}
          </div>
        )}

      </div>

      {msgStudent && (
        <SendMessageModal student={msgStudent} onClose={() => setMsgStudent(null)} />
      )}
    </div>
  )
}
