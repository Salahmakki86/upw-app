/**
 * Coach Prep Page — Batch 4
 * Pre-session preparation: full student profile + smart interventions + heatmap
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, User, Flame, Target, Brain, Moon, Heart,
  TrendingUp, AlertTriangle, CheckCircle, Send, RefreshCw,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { upwApi } from '../api/upwApi'
import { detectInterventions, severityColor } from '../utils/interventions'
import Layout from '../components/Layout'

function MetricCard({ emoji, value, label, color }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: '#111', border: '1px solid #222' }}>
      <span className="text-lg">{emoji}</span>
      <div className="text-lg font-black mt-0.5" style={{ color: color || '#c9a84c' }}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function InterventionCard({ intervention, isAr, onSendMsg }) {
  const color = severityColor(intervention.severity)
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#111', border: `1px solid ${color}33` }}>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-start gap-3"
        style={{ textAlign: isAr ? 'right' : 'left' }}>
        <span className="text-lg flex-shrink-0">{intervention.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color }}>
            {isAr ? intervention.titleAr : intervention.titleEn}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isAr ? intervention.descAr : intervention.descEn}
          </p>
        </div>
        {expanded ? <ChevronUp size={14} style={{ color: '#444' }} /> : <ChevronDown size={14} style={{ color: '#444' }} />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t animate-fade-in" style={{ borderColor: '#222' }}>
          <div className="rounded-lg p-2.5 mt-2" style={{ background: color + '10', border: `1px solid ${color}22` }}>
            <p className="text-xs font-bold mb-0.5" style={{ color }}>
              💡 {isAr ? 'الإجراء المقترح:' : 'Suggested Action:'}
            </p>
            <p className="text-xs text-gray-400">
              {isAr ? intervention.actionAr : intervention.actionEn}
            </p>
          </div>
          <button onClick={onSendMsg}
            className="mt-2 w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
            style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}>
            <Send size={12} /> {isAr ? 'أرسل رسالة' : 'Send Message'}
          </button>
        </div>
      )}
    </div>
  )
}

function HeatmapGrid({ studentState, isAr }) {
  const days = useMemo(() => {
    const result = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      let count = 0
      const s = studentState
      if ((s.morningLog || []).includes(key)) count++
      if (s.eveningLog?.[key]) count++
      if (((s.gratitude?.[key]) || []).filter(Boolean).length >= 3) count++
      if ((s.habitTracker?.log?.[key] || []).length > 0) count++
      if ((s.stateLog || []).some(l => l.date === key)) count++
      if (s.sleepLog?.[key]) count++
      result.push({ key, count, day: d.getDate() })
    }
    return result
  }, [studentState])

  const heatColor = (c) => {
    if (c === 0) return '#1a1a1a'
    if (c <= 1) return 'rgba(201,168,76,0.2)'
    if (c <= 2) return 'rgba(201,168,76,0.4)'
    if (c <= 3) return 'rgba(201,168,76,0.6)'
    return '#c9a84c'
  }

  return (
    <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #222' }}>
      <p className="text-xs font-bold mb-2 text-[#c9a84c]">
        📊 {isAr ? 'خريطة النشاط — آخر ٣٠ يوم' : 'Activity Heatmap — Last 30 Days'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3 }}>
        {days.map(d => (
          <div key={d.key} title={`${d.key}: ${d.count} activities`}
            className="rounded-sm aspect-square flex items-center justify-center"
            style={{ background: heatColor(d.count) }}>
            <span className="text-xs font-bold" style={{ color: d.count > 0 ? '#fff' : '#333', fontSize: 8 }}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-2">
        {[
          { c: 0, l: isAr ? 'لا شيء' : 'None' },
          { c: 1, l: '1-2' },
          { c: 3, l: '3-4' },
          { c: 5, l: '5+' },
        ].map(item => (
          <div key={item.c} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: heatColor(item.c) }} />
            <span className="text-xs text-gray-600">{item.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CoachPrep() {
  const { currentUser } = useAuth()
  const { lang } = useLang()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAr = lang === 'ar'

  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState(searchParams.get('student') || '')
  const [studentState, setStudentState] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    upwApi.getProgress().then(d => setStudents(d || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedId) { setStudentState(null); return }
    setLoading(true)
    upwApi.getStudentState(selectedId)
      .then(data => setStudentState(data?.state || data || null))
      .catch(() => setStudentState(null))
      .finally(() => setLoading(false))
  }, [selectedId])

  const interventions = useMemo(() => {
    if (!studentState) return []
    return detectInterventions(studentState, isAr)
  }, [studentState, isAr])

  const student = students.find(s => s.id === selectedId)

  async function sendMessage() {
    if (!msgText.trim() || !selectedId) return
    setSending(true)
    try {
      await upwApi.sendMessage(selectedId, msgText.trim())
      showToast(isAr ? 'تم إرسال الرسالة' : 'Message sent', 'success')
      setMsgText('')
    } catch (e) {
      showToast(e.message, 'error')
    }
    setSending(false)
  }

  if (currentUser?.role !== 'admin') { navigate('/'); return null }

  return (
    <Layout title={isAr ? 'تحضير الجلسة' : 'Session Prep'} subtitle={isAr ? 'ملف الطالب قبل الكوتشنج' : 'Student profile before coaching'}>
      <div className="space-y-4 pt-2">

        {/* Student Selector */}
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm font-bold"
          style={{ background: '#111', border: '1px solid #333', color: '#c9a84c', outline: 'none' }}
        >
          <option value="">{isAr ? '— اختر طالباً —' : '— Select Student —'}</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
          ))}
        </select>

        {loading && (
          <div className="text-center py-8">
            <RefreshCw size={20} className="animate-spin mx-auto" style={{ color: '#c9a84c' }} />
          </div>
        )}

        {studentState && !loading && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2">
              <MetricCard emoji="🔥" value={studentState.streak || 0} label={isAr ? 'سلسلة' : 'Streak'} color="#e67e22" />
              <MetricCard emoji="🎯" value={(studentState.goals || []).length} label={isAr ? 'أهداف' : 'Goals'} color="#3498db" />
              <MetricCard emoji="😊" value={(studentState.stateLog || []).filter(s => s.state === 'beautiful').length} label={isAr ? 'جميل' : 'Beautiful'} color="#2ecc71" />
              <MetricCard emoji="😟" value={(studentState.stateLog || []).filter(s => s.state === 'suffering').length} label={isAr ? 'معاناة' : 'Suffering'} color="#e63946" />
            </div>

            {/* Heatmap */}
            <HeatmapGrid studentState={studentState} isAr={isAr} />

            {/* Deep Metrics */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #222' }}>
                <p className="text-xs text-gray-500 mb-1">{isAr ? 'معتقدات مقيدة' : 'Limiting Beliefs'}</p>
                <p className="text-lg font-black" style={{ color: '#e63946' }}>{(studentState.limitingBeliefs || []).length}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #222' }}>
                <p className="text-xs text-gray-500 mb-1">{isAr ? 'معتقدات محفزة' : 'Empowering Beliefs'}</p>
                <p className="text-lg font-black" style={{ color: '#2ecc71' }}>{(studentState.empoweringBeliefs || []).length}</p>
              </div>
            </div>

            {/* Goals Summary */}
            {(studentState.goals || []).length > 0 && (
              <div className="rounded-xl p-3 space-y-2" style={{ background: '#111', border: '1px solid #222' }}>
                <p className="text-xs font-bold text-[#c9a84c]">🎯 {isAr ? 'الأهداف' : 'Goals'}</p>
                {(studentState.goals || []).slice(0, 5).map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-1.5 rounded-full overflow-hidden" style={{ background: '#222' }}>
                      <div className="h-full rounded-full" style={{ width: `${g.progress || 0}%`, background: (g.progress || 0) >= 100 ? '#2ecc71' : '#c9a84c' }} />
                    </div>
                    <span className="text-xs text-gray-400 flex-1 truncate">{g.result}</span>
                    <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>{g.progress || 0}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Smart Interventions */}
            {interventions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#e63946' }}>
                  ⚡ {isAr ? 'تدخلات مقترحة' : 'Suggested Interventions'} ({interventions.length})
                </p>
                {interventions.map((intv, i) => (
                  <InterventionCard
                    key={i}
                    intervention={intv}
                    isAr={isAr}
                    onSendMsg={() => setMsgText(isAr ? intv.actionAr : intv.actionEn)}
                  />
                ))}
              </div>
            )}

            {interventions.length === 0 && (
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)' }}>
                <CheckCircle size={24} className="mx-auto mb-2" style={{ color: '#2ecc71' }} />
                <p className="text-sm font-bold" style={{ color: '#2ecc71' }}>
                  {isAr ? 'لا تدخلات مطلوبة — الطالب في حالة جيدة!' : 'No interventions needed — student is doing well!'}
                </p>
              </div>
            )}

            {/* Quick Message */}
            <div className="rounded-xl p-3 space-y-2" style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-xs font-bold text-[#c9a84c]">
                ✉️ {isAr ? 'رسالة سريعة' : 'Quick Message'}
              </p>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                placeholder={isAr ? 'اكتب رسالة للطالب...' : 'Write a message to the student...'}
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-sm text-white resize-none"
                style={{ background: '#0a0a0a', border: '1px solid #333', outline: 'none' }}
              />
              <button onClick={sendMessage} disabled={sending || !msgText.trim()}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-black disabled:opacity-40 flex items-center justify-center gap-1"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #f0c96e)' }}>
                <Send size={14} /> {sending ? '...' : isAr ? 'إرسال' : 'Send'}
              </button>
            </div>
          </>
        )}

        {!selectedId && !loading && (
          <div className="text-center py-12">
            <User size={40} className="mx-auto mb-3" style={{ color: '#333' }} />
            <p className="text-sm text-gray-500">
              {isAr ? 'اختر طالباً لعرض ملفه الكامل والتدخلات المقترحة' : 'Select a student to view their full profile and suggested interventions'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
