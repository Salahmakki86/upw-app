/**
 * Command Center — Batch 4
 * Coach's at-a-glance overview: student health, alerts, quick actions
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, AlertTriangle, TrendingUp, Eye, Send, RefreshCw,
  ChevronRight, Flame, Activity, Clock, Shield,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { upwApi } from '../api/upwApi'
import Layout from '../components/Layout'

function StatusDot({ color }) {
  return <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}44` }} />
}

function StudentHealthCard({ student, isAr, onView }) {
  const streak = student.streak || 0
  const lastActive = student.lastActiveDate
  const daysSince = lastActive ? Math.floor((Date.now() - new Date(lastActive)) / 86400000) : 99

  let statusColor = '#2ecc71'
  let statusLabel = isAr ? 'نشط' : 'Active'
  if (daysSince >= 7) { statusColor = '#e63946'; statusLabel = isAr ? 'غائب' : 'Absent' }
  else if (daysSince >= 3) { statusColor = '#f39c12'; statusLabel = isAr ? 'متراجع' : 'Declining' }
  else if (daysSince >= 1) { statusColor = '#c9a84c'; statusLabel = isAr ? 'بالأمس' : 'Yesterday' }

  return (
    <div className="rounded-xl p-3 flex items-center gap-3 transition-all active:scale-[0.98]"
      style={{ background: '#111', border: `1px solid ${statusColor}22` }}
      onClick={onView}
    >
      <StatusDot color={statusColor} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{student.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: statusColor }}>{statusLabel}</span>
          {streak > 0 && (
            <span className="text-xs flex items-center gap-0.5" style={{ color: '#e67e22' }}>
              <Flame size={10} /> {streak}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={14} style={{ color: '#444' }} />
    </div>
  )
}

export default function CommandCenter() {
  const { currentUser } = useAuth()
  const { lang } = useLang()
  const navigate = useNavigate()
  const isAr = lang === 'ar'
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const data = await upwApi.getProgress()
      setStudents(data || [])
      setLastRefresh(new Date())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  // Computed metrics
  const metrics = useMemo(() => {
    const total = students.length
    const today = new Date().toISOString().split('T')[0]
    const activeToday = students.filter(s => s.lastActiveDate === today).length
    const inactive3 = students.filter(s => {
      const d = s.lastActiveDate ? Math.floor((Date.now() - new Date(s.lastActiveDate)) / 86400000) : 99
      return d >= 3
    }).length
    const inactive7 = students.filter(s => {
      const d = s.lastActiveDate ? Math.floor((Date.now() - new Date(s.lastActiveDate)) / 86400000) : 99
      return d >= 7
    }).length
    const avgStreak = total > 0 ? Math.round(students.reduce((s, st) => s + (st.streak || 0), 0) / total) : 0
    const topStreak = Math.max(0, ...students.map(s => s.streak || 0))

    return { total, activeToday, inactive3, inactive7, avgStreak, topStreak }
  }, [students])

  // Sort: at-risk first, then by streak
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const dA = a.lastActiveDate ? Math.floor((Date.now() - new Date(a.lastActiveDate)) / 86400000) : 99
      const dB = b.lastActiveDate ? Math.floor((Date.now() - new Date(b.lastActiveDate)) / 86400000) : 99
      if (dA >= 3 && dB < 3) return -1
      if (dA < 3 && dB >= 3) return 1
      return (b.streak || 0) - (a.streak || 0)
    })
  }, [students])

  if (currentUser?.role !== 'admin') {
    navigate('/')
    return null
  }

  return (
    <Layout title={isAr ? 'مركز القيادة' : 'Command Center'} subtitle={isAr ? 'نظرة شاملة على الطلاب' : 'Student overview at a glance'}>
      <div className="space-y-4 pt-2">

        {/* Refresh */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {lastRefresh && (isAr ? `آخر تحديث: ${lastRefresh.toLocaleTimeString('ar-EG')}` : `Last refresh: ${lastRefresh.toLocaleTimeString()}`)}
          </p>
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {isAr ? 'تحديث' : 'Refresh'}
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl p-3 text-center" style={{ background: '#111', border: '1px solid #222' }}>
            <Users size={16} className="mx-auto mb-1" style={{ color: '#c9a84c' }} />
            <div className="text-xl font-black text-white">{metrics.total}</div>
            <div className="text-xs text-gray-500">{isAr ? 'إجمالي' : 'Total'}</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#111', border: '1px solid rgba(46,204,113,0.2)' }}>
            <Activity size={16} className="mx-auto mb-1" style={{ color: '#2ecc71' }} />
            <div className="text-xl font-black" style={{ color: '#2ecc71' }}>{metrics.activeToday}</div>
            <div className="text-xs text-gray-500">{isAr ? 'نشط اليوم' : 'Active Today'}</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#111', border: `1px solid ${metrics.inactive7 > 0 ? 'rgba(230,57,70,0.2)' : '#222'}` }}>
            <AlertTriangle size={16} className="mx-auto mb-1" style={{ color: metrics.inactive7 > 0 ? '#e63946' : '#888' }} />
            <div className="text-xl font-black" style={{ color: metrics.inactive7 > 0 ? '#e63946' : '#888' }}>{metrics.inactive7}</div>
            <div className="text-xs text-gray-500">{isAr ? 'غائب ٧+ يوم' : 'Absent 7d+'}</div>
          </div>
        </div>

        {/* Secondary metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#111', border: '1px solid #222' }}>
            <Flame size={20} style={{ color: '#e67e22' }} />
            <div>
              <div className="text-sm font-black text-white">{metrics.avgStreak} <span className="text-xs text-gray-500">{isAr ? 'متوسط' : 'avg'}</span></div>
              <div className="text-xs text-gray-500">{isAr ? 'السلاسل' : 'Streaks'}</div>
            </div>
          </div>
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#111', border: '1px solid #222' }}>
            <TrendingUp size={20} style={{ color: '#c9a84c' }} />
            <div>
              <div className="text-sm font-black text-white">{metrics.topStreak} <span className="text-xs text-gray-500">{isAr ? 'أعلى' : 'top'}</span></div>
              <div className="text-xs text-gray-500">{isAr ? 'أعلى سلسلة' : 'Top Streak'}</div>
            </div>
          </div>
        </div>

        {/* Alert banner */}
        {metrics.inactive3 > 0 && (
          <div className="rounded-xl p-3 flex items-center gap-3" style={{
            background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.2)',
          }}>
            <AlertTriangle size={18} style={{ color: '#e63946', flexShrink: 0 }} />
            <p className="text-xs text-gray-300">
              {isAr
                ? `⚠️ ${metrics.inactive3} طالب لم ينشطوا منذ ٣+ أيام — تدخّل سريع يمكن أن يعيدهم`
                : `⚠️ ${metrics.inactive3} students inactive for 3+ days — quick intervention can bring them back`}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => navigate('/coach-prep')}
            className="rounded-xl p-3 flex items-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(147,112,219,0.08)', border: '1px solid rgba(147,112,219,0.25)', textAlign: isAr ? 'right' : 'left' }}>
            <Shield size={18} style={{ color: '#9370db' }} />
            <span className="text-xs font-bold" style={{ color: '#9370db' }}>
              {isAr ? 'تحضير جلسة' : 'Session Prep'}
            </span>
          </button>
          <button onClick={() => navigate('/coach-messages')}
            className="rounded-xl p-3 flex items-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', textAlign: isAr ? 'right' : 'left' }}>
            <Send size={18} style={{ color: '#c9a84c' }} />
            <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>
              {isAr ? 'الرسائل' : 'Messages'}
            </span>
          </button>
        </div>

        {/* Student List */}
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[#c9a84c] mb-2">
            👥 {isAr ? 'الطلاب' : 'Students'} ({sortedStudents.length})
          </p>

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw size={20} className="animate-spin mx-auto mb-2" style={{ color: '#c9a84c' }} />
              <p className="text-xs text-gray-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedStudents.map(s => (
                <StudentHealthCard
                  key={s.id || s.email}
                  student={s}
                  isAr={isAr}
                  onView={() => navigate(`/coach-prep?student=${s.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
