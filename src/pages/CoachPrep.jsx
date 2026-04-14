/**
 * Coach Prep Page — Batch 4
 * Pre-session preparation: full student profile + smart interventions + heatmap
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, User, Flame, Target, Brain, Moon, Heart,
  TrendingUp, AlertTriangle, CheckCircle, Send, RefreshCw,
  ChevronDown, ChevronUp, Copy, ClipboardCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { upwApi } from '../api/upwApi'
import { detectInterventions, severityColor } from '../utils/interventions'
import { analyzeStudentPatterns, getStudentSummary } from '../utils/studentPatterns'
import { detectRootCause, calcMomentum, calcTransformationScore } from '../utils/transformationEngine'
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

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
}

function getLast14Days() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return d.toISOString().slice(0, 10)
  })
}

function StudentBrief({ studentState, studentName, isAr, showToast }) {
  const [copied, setCopied] = useState(false)

  const brief = useMemo(() => {
    if (!studentState) return null
    const s = studentState
    const days7 = getLast7Days()
    const days14 = getLast14Days()

    // Root Cause
    const rootCause = detectRootCause(s)

    // Momentum
    const momentum = calcMomentum(s)

    // Transformation Score
    const transformation = calcTransformationScore(s)

    // Sleep pattern — average last 7 days
    const sleepEntries = days7.map(d => s.sleepLog?.[d]?.hours).filter(Boolean)
    const avgSleep = sleepEntries.length > 0
      ? Math.round((sleepEntries.reduce((a, b) => a + b, 0) / sleepEntries.length) * 10) / 10
      : null

    // Ritual consistency — morning log count last 14 days
    const morningLog = s.morningLog || []
    const morningCount14 = days14.filter(d => morningLog.includes(d)).length

    // Goals analysis — active vs stale
    const goals = s.goals || []
    const activeGoals = goals.filter(g => (g.progress || 0) < 100)
    const staleGoals = goals.filter(g => {
      if ((g.progress || 0) >= 100) return false
      if ((g.progress || 0) === 0) return true
      // Check if goal has an updatedAt or fallback to no update detection
      if (g.updatedAt) {
        const daysSinceUpdate = Math.floor((Date.now() - new Date(g.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
        return daysSinceUpdate >= 14
      }
      return (g.progress || 0) === 0
    })

    // Belief balance
    const limitingCount = (s.limitingBeliefs || []).length
    const empoweringCount = (s.empoweringBeliefs || []).length

    // Recent reflections — evening log last 7 entries
    const reflections = []
    for (const d of days7) {
      const entry = s.eveningLog?.[d]
      if (entry) {
        const text = entry.reflection || entry.gratitude || entry.highlight || entry.lesson || ''
        if (text.trim()) {
          reflections.push({ date: d, text: text.trim() })
        }
      }
      if (reflections.length >= 3) break
    }

    // Smart question log — last 7 entries
    const smartQLog = (s.smartQuestionLog || []).slice(-7)

    // Power questions log — last 7 entries
    const powerQLog = (s.powerQuestionsLog || []).slice(-7)

    // Build focus areas
    const focusAreas = []
    if (rootCause.type !== 'thriving' && rootCause.type !== 'exploring') {
      focusAreas.push(isAr ? rootCause.labelAr : rootCause.labelEn)
    }
    if (staleGoals.length > 0) {
      focusAreas.push(isAr ? `${staleGoals.length} أهداف راكدة — تحتاج مراجعة` : `${staleGoals.length} stale goal(s) — need review`)
    }
    if (limitingCount > empoweringCount) {
      focusAreas.push(isAr ? 'معتقدات مقيدة أكثر من المحفزة — يحتاج عمل على الهوية' : 'More limiting than empowering beliefs — identity work needed')
    }
    if (avgSleep !== null && avgSleep < 6.5) {
      focusAreas.push(isAr ? `نوم منخفض (${avgSleep}h) — يؤثر على كل شيء` : `Low sleep (${avgSleep}h) — affecting everything`)
    }
    if (morningCount14 < 5) {
      focusAreas.push(isAr ? 'التزام صباحي ضعيف — يحتاج بناء عادة' : 'Weak morning ritual — habit building needed')
    }
    if (momentum.status === 'needs_attention') {
      focusAreas.push(isAr ? 'زخم منخفض — يحتاج خطة إعادة تفعيل' : 'Low momentum — needs reactivation plan')
    }
    // Ensure at least one focus area
    if (focusAreas.length === 0) {
      focusAreas.push(isAr ? 'استمر على هذا المسار الممتاز!' : 'Keep up the excellent trajectory!')
    }

    return {
      rootCause,
      momentum,
      transformation,
      avgSleep,
      morningCount14,
      activeGoals: activeGoals.length,
      staleGoals: staleGoals.length,
      empoweringCount,
      limitingCount,
      reflections,
      smartQLog,
      powerQLog,
      focusAreas,
    }
  }, [studentState, isAr])

  if (!brief) return null

  const name = studentName || (isAr ? 'الطالب' : 'Student')
  const trendLabels = { up: isAr ? 'صاعد' : 'rising', down: isAr ? 'هابط' : 'falling', stable: isAr ? 'مستقر' : 'stable' }
  const levelLabels = {
    exceptional: isAr ? 'استثنائي' : 'exceptional',
    strong: isAr ? 'قوي' : 'strong',
    building: isAr ? 'يبني' : 'building',
    starting: isAr ? 'يبدأ' : 'starting',
    beginning: isAr ? 'بداية' : 'beginning',
  }

  const rootLabel = isAr ? brief.rootCause.labelAr : brief.rootCause.labelEn
  const rootDesc = isAr ? brief.rootCause.descAr : brief.rootCause.descEn

  // Build plain-text version for clipboard
  function buildPlainText() {
    const lines = []
    const sep = '\u2501'.repeat(36)
    lines.push(`\ud83d\udccb Coaching Brief \u2014 ${name}`)
    lines.push(sep)
    lines.push(`\ud83d\udd0b Root Cause: ${brief.rootCause.type} \u2014 ${isAr ? brief.rootCause.labelAr : brief.rootCause.labelEn}`)
    lines.push(`\ud83d\udcca Transformation: ${brief.transformation.total}/100 (${levelLabels[brief.transformation.level]})`)
    lines.push(`\ud83d\udd25 Momentum: ${brief.momentum.score}/100 (${trendLabels[brief.momentum.trend]})`)
    lines.push(`\ud83d\ude34 Sleep: avg ${brief.avgSleep !== null ? brief.avgSleep + 'h' : 'N/A'} (last 7 days)`)
    lines.push(`\u2600\ufe0f Rituals: ${brief.morningCount14}/14 mornings done`)
    lines.push(`\ud83c\udfaf Goals: ${brief.activeGoals} active, ${brief.staleGoals} stale`)
    lines.push(`\ud83e\ude9e Beliefs: ${brief.empoweringCount} empowering vs ${brief.limitingCount} limiting`)
    lines.push('')
    if (brief.reflections.length > 0) {
      lines.push(`\ud83d\udcdd Recent Reflections:`)
      brief.reflections.forEach(r => {
        const excerpt = r.text.length > 80 ? r.text.slice(0, 80) + '...' : r.text
        lines.push(`- "${excerpt}"`)
      })
      lines.push('')
    }
    lines.push(`\u26a0\ufe0f Focus Areas:`)
    brief.focusAreas.forEach((f, i) => {
      lines.push(`${i + 1}. ${f}`)
    })
    return lines.join('\n')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildPlainText())
      setCopied(true)
      showToast?.(isAr ? 'تم النسخ!' : 'Brief copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast?.(isAr ? 'فشل النسخ' : 'Copy failed', 'error')
    }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.35)' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))' }}>
        <div>
          <p className="text-sm font-black" style={{ color: '#c9a84c' }}>
            {'\ud83d\udccb'} {isAr ? 'ملخص الكوتشنج' : 'Coaching Brief'} — {name}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: copied ? 'rgba(46,204,113,0.15)' : 'rgba(201,168,76,0.1)',
            color: copied ? '#2ecc71' : '#c9a84c',
            border: `1px solid ${copied ? 'rgba(46,204,113,0.3)' : 'rgba(201,168,76,0.25)'}`,
          }}
        >
          {copied ? <ClipboardCheck size={12} /> : <Copy size={12} />}
          {copied ? (isAr ? 'تم!' : 'Copied!') : (isAr ? 'نسخ' : 'Copy')}
        </button>
      </div>

      {/* Brief Body */}
      <div className="px-4 py-3 space-y-2.5" style={{ fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace" }}>
        {/* Root Cause */}
        <div className="flex items-start gap-2">
          <span className="text-sm flex-shrink-0">{brief.rootCause.emoji || '\ud83d\udd0b'}</span>
          <div className="min-w-0">
            <span className="text-xs font-bold" style={{ color: brief.rootCause.color || '#888' }}>
              {isAr ? 'السبب الجذري' : 'Root Cause'}: {brief.rootCause.type}
            </span>
            <p className="text-xs mt-0.5" style={{ color: '#999' }}>{rootDesc}</p>
          </div>
        </div>

        {/* Transformation */}
        <div className="flex items-center gap-2">
          <span className="text-sm flex-shrink-0">{'\ud83d\udcca'}</span>
          <span className="text-xs" style={{ color: '#ddd' }}>
            <span className="font-bold" style={{ color: brief.transformation.color }}>
              {isAr ? 'التحول' : 'Transformation'}: {brief.transformation.total}/100
            </span>
            <span style={{ color: '#777' }}> ({levelLabels[brief.transformation.level]})</span>
          </span>
        </div>

        {/* Momentum */}
        <div className="flex items-center gap-2">
          <span className="text-sm flex-shrink-0">{'\ud83d\udd25'}</span>
          <span className="text-xs" style={{ color: '#ddd' }}>
            <span className="font-bold" style={{ color: brief.momentum.color }}>
              {isAr ? 'الزخم' : 'Momentum'}: {brief.momentum.score}/100
            </span>
            <span style={{ color: '#777' }}> ({trendLabels[brief.momentum.trend]})</span>
          </span>
        </div>

        {/* Sleep */}
        <div className="flex items-center gap-2">
          <span className="text-sm flex-shrink-0">{'\ud83d\ude34'}</span>
          <span className="text-xs" style={{ color: '#ddd' }}>
            <span className="font-bold" style={{ color: brief.avgSleep !== null && brief.avgSleep < 6.5 ? '#e63946' : '#2ecc71' }}>
              {isAr ? 'النوم' : 'Sleep'}: {brief.avgSleep !== null ? `avg ${brief.avgSleep}h` : 'N/A'}
            </span>
            <span style={{ color: '#777' }}> ({isAr ? 'آخر ٧ أيام' : 'last 7 days'})</span>
          </span>
        </div>

        {/* Rituals */}
        <div className="flex items-center gap-2">
          <span className="text-sm flex-shrink-0">{'\u2600\ufe0f'}</span>
          <span className="text-xs" style={{ color: '#ddd' }}>
            <span className="font-bold" style={{ color: brief.morningCount14 >= 10 ? '#2ecc71' : brief.morningCount14 >= 5 ? '#f39c12' : '#e63946' }}>
              {isAr ? 'الطقوس' : 'Rituals'}: {brief.morningCount14}/14
            </span>
            <span style={{ color: '#777' }}> {isAr ? 'صباحات مكتملة' : 'mornings done'}</span>
          </span>
        </div>

        {/* Goals */}
        <div className="flex items-center gap-2">
          <span className="text-sm flex-shrink-0">{'\ud83c\udfaf'}</span>
          <span className="text-xs" style={{ color: '#ddd' }}>
            <span className="font-bold" style={{ color: '#3498db' }}>
              {isAr ? 'الأهداف' : 'Goals'}: {brief.activeGoals} {isAr ? 'نشط' : 'active'}
            </span>
            {brief.staleGoals > 0 && (
              <span style={{ color: '#e63946' }}>, {brief.staleGoals} {isAr ? 'راكد' : 'stale'}</span>
            )}
          </span>
        </div>

        {/* Beliefs */}
        <div className="flex items-center gap-2">
          <span className="text-sm flex-shrink-0">{'\ud83e\ude9e'}</span>
          <span className="text-xs" style={{ color: '#ddd' }}>
            <span className="font-bold" style={{ color: brief.empoweringCount >= brief.limitingCount ? '#2ecc71' : '#e63946' }}>
              {isAr ? 'المعتقدات' : 'Beliefs'}:
            </span>
            {' '}{brief.empoweringCount} {isAr ? 'محفزة' : 'empowering'} vs {brief.limitingCount} {isAr ? 'مقيدة' : 'limiting'}
          </span>
        </div>

        {/* Separator */}
        <div style={{ borderTop: '1px solid #222', margin: '8px 0' }} />

        {/* Recent Reflections */}
        {brief.reflections.length > 0 && (
          <div>
            <p className="text-xs font-bold mb-1.5" style={{ color: '#c9a84c' }}>
              {'\ud83d\udcdd'} {isAr ? 'آخر التأملات' : 'Recent Reflections'}
            </p>
            <div className="space-y-1.5">
              {brief.reflections.map((r, i) => (
                <p key={i} className="text-xs rounded-lg px-2.5 py-1.5" style={{ color: '#aaa', background: '#111', fontStyle: 'italic' }}>
                  "{r.text.length > 100 ? r.text.slice(0, 100) + '...' : r.text}"
                  <span className="ml-1" style={{ color: '#555', fontSize: 10, fontStyle: 'normal' }}>{r.date}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Smart / Power Questions */}
        {(brief.smartQLog.length > 0 || brief.powerQLog.length > 0) && (
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: '#9b59b6' }}>
              {'\ud83e\udde0'} {isAr ? 'نشاط الأسئلة' : 'Question Activity'}
            </p>
            <p className="text-xs" style={{ color: '#888' }}>
              {brief.smartQLog.length > 0 && (
                <span>{brief.smartQLog.length} {isAr ? 'أسئلة ذكية' : 'smart questions'}</span>
              )}
              {brief.smartQLog.length > 0 && brief.powerQLog.length > 0 && ' | '}
              {brief.powerQLog.length > 0 && (
                <span>{brief.powerQLog.length} {isAr ? 'أسئلة قوة' : 'power questions'}</span>
              )}
              <span style={{ color: '#555' }}> ({isAr ? 'آخر ٧' : 'last 7'})</span>
            </p>
          </div>
        )}

        {/* Separator */}
        <div style={{ borderTop: '1px solid #222', margin: '8px 0' }} />

        {/* Focus Areas */}
        <div>
          <p className="text-xs font-bold mb-1.5" style={{ color: '#e63946' }}>
            {'\u26a0\ufe0f'} {isAr ? 'مناطق التركيز' : 'Focus Areas'}
          </p>
          <div className="space-y-1">
            {brief.focusAreas.map((area, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-black flex-shrink-0" style={{ color: '#c9a84c', minWidth: 14 }}>{i + 1}.</span>
                <p className="text-xs" style={{ color: '#ccc' }}>{area}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transformation Breakdown mini-bar */}
        <div style={{ borderTop: '1px solid #222', margin: '8px 0' }} />
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: '#777' }}>
            {isAr ? 'تفصيل التحول' : 'Transformation Breakdown'}
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { key: 'discipline', label: isAr ? 'انضباط' : 'Discipline', color: '#c9a84c' },
              { key: 'state', label: isAr ? 'حالة' : 'State', color: '#3498db' },
              { key: 'progress', label: isAr ? 'تقدم' : 'Progress', color: '#2ecc71' },
              { key: 'depth', label: isAr ? 'عمق' : 'Depth', color: '#9b59b6' },
            ].map(item => (
              <div key={item.key} className="text-center">
                <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: '#222' }}>
                  <div className="h-full rounded-full" style={{ width: `${brief.transformation.breakdown[item.key]}%`, background: item.color }} />
                </div>
                <span className="text-xs font-bold" style={{ color: item.color, fontSize: 10 }}>
                  {brief.transformation.breakdown[item.key]}%
                </span>
                <p className="text-xs" style={{ color: '#555', fontSize: 9 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
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

  // Fix #13 — Deep student pattern analysis
  const studentPatterns = useMemo(() => {
    if (!studentState) return []
    return analyzeStudentPatterns(studentState, isAr)
  }, [studentState, isAr])

  const studentSummaryText = useMemo(() => {
    if (!studentState) return ''
    return getStudentSummary(studentState, isAr)
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
            {/* Student Brief — comprehensive coaching summary */}
            <StudentBrief
              studentState={studentState}
              studentName={student?.name}
              isAr={isAr}
              showToast={showToast}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2">
              <MetricCard emoji="🔥" value={studentState.streak || 0} label={isAr ? 'سلسلة' : 'Streak'} color="#e67e22" />
              <MetricCard emoji="🎯" value={(studentState.goals || []).length} label={isAr ? 'أهداف' : 'Goals'} color="#3498db" />
              <MetricCard emoji="😊" value={(studentState.stateLog || []).filter(s => s.state === 'beautiful').length} label={isAr ? 'جميل' : 'Beautiful'} color="#2ecc71" />
              <MetricCard emoji="😟" value={(studentState.stateLog || []).filter(s => s.state === 'suffering').length} label={isAr ? 'معاناة' : 'Suffering'} color="#e63946" />
            </div>

            {/* Student Summary (Fix #13) */}
            {studentSummaryText && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
                  📋 {isAr ? 'ملخص سريع' : 'Quick Summary'}
                </p>
                <p className="text-xs" style={{ color: '#bbb' }}>{studentSummaryText}</p>
              </div>
            )}

            {/* Heatmap */}
            <HeatmapGrid studentState={studentState} isAr={isAr} />

            {/* Student Patterns (Fix #13 — Coach sees patterns) */}
            {studentPatterns.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#9b59b6' }}>
                  🔍 {isAr ? 'أنماط مكتشفة' : 'Detected Patterns'} ({studentPatterns.length})
                </p>
                {studentPatterns.map((pattern, i) => {
                  const typeColors = { critical: '#e63946', warning: '#f39c12', info: '#3498db', strength: '#2ecc71' }
                  const color = typeColors[pattern.type] || '#888'
                  return (
                    <div key={i} className="rounded-xl p-3" style={{ background: '#111', border: `1px solid ${color}22` }}>
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{pattern.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold" style={{ color }}>
                            {isAr ? pattern.titleAr : pattern.titleEn}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#888' }}>
                            {isAr ? pattern.detailAr : pattern.detailEn}
                          </p>
                          <div className="rounded-lg p-2 mt-2" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                            <p className="text-xs" style={{ color: '#666' }}>
                              <span style={{ fontWeight: 700, color }}>💡 {isAr ? 'نصيحة:' : 'Coach tip:'}</span>{' '}
                              {isAr ? pattern.coachTipAr : pattern.coachTipEn}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

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
