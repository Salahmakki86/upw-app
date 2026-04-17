import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Send, RefreshCw, ChevronDown, Users, User,
  Flame, Zap, Bell, Trophy, Clock, X, Check,
  MessageCircle, Search,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { upwApi } from '../api/upwApi'

// ── Constants ─────────────────────────────────────────────────────────────

const MSG_TYPES = [
  { key: 'motivation', label: 'تحفيز',   labelEn: 'Motivation', icon: <Flame size={14} />,   color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  { key: 'challenge',  label: 'تحدي',    labelEn: 'Challenge',  icon: <Zap size={14} />,     color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
  { key: 'reminder',   label: 'تذكير',   labelEn: 'Reminder',   icon: <Bell size={14} />,    color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  { key: 'praise',     label: 'مديح',    labelEn: 'Praise',     icon: <Trophy size={14} />,  color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
]

const TEMPLATES = {
  motivation: [
    'أنت أقوى مما تتخيل. استمر! 🔥',
    'كل يوم تلتزم فيه يبنيك من الداخل 💪',
    'اليوم هو فرصتك لتكون نسخة أفضل 🌟',
    'تذكر سببك الأكبر — لماذا بدأت؟ 🎯',
    'القوة الحقيقية تظهر حين تريد الاستسلام ولا تفعل 🏆',
    'كل خطوة صغيرة تأخذها اليوم تُراكم نجاح الغد ✨',
  ],
  challenge: [
    'تحدى نفسك اليوم — اخرج من منطقة الراحة ⚡',
    'ماذا لو فعلت شيئاً يُخيفك قليلاً اليوم؟ 🚀',
    'تحدّيك لهذه الأسبوع: الالتزام بالروتين 100% بدون استثناء 💎',
    'تجرأ — فالشجاعة ليست غياب الخوف بل التصرف رغمه ⚔️',
    'اكتب الآن 3 أشياء ستفعلها اليوم تقربك من هدفك 📝',
    'تحدّى نفسك بقراءة 10 صفحات اليوم وشارك ما تعلمته 📚',
  ],
  reminder: [
    'لا تنسَ روتينك الصباحي اليوم ⚡',
    'تذكر — المساء وقت للامتنان والتأمل 🌙',
    'هل راجعت أهدافك هذا الأسبوع؟ 🎯',
    'روتينك صنع شخصيتك — لا تتركه اليوم 🔔',
    'تذكر أن تشرب كمية كافية من الماء اليوم 💧',
    'خصّص 5 دقائق الآن للتأمل أو التنفس العميق 🧘',
  ],
  praise: [
    'أنا فخور بتقدمك هذا الأسبوع 🏆',
    'لاحظت التزامك المستمر — هذا يعني الكثير 🌟',
    'أنت مثال يُحتذى به للمجموعة 👑',
    'ما تحققه الآن يُلهم الآخرين حولك ✨',
    'استمرارك رغم الصعوبات يدل على قوة حقيقية 💪',
    'أنت تسير في الاتجاه الصحيح — واصل 🚀',
  ],
}

const TEMPLATES_EN = {
  motivation: [
    'You are stronger than you think. Keep going! 🔥',
    'Every day you commit, you build yourself from within 💪',
    'Today is your chance to be a better version of yourself 🌟',
    'Remember your biggest reason — why did you start? 🎯',
    'Real strength shows when you want to quit but don\'t 🏆',
    'Every small step today accumulates tomorrow\'s success ✨',
  ],
  challenge: [
    'Challenge yourself today — step out of your comfort zone ⚡',
    'What if you did something that scares you a little today? 🚀',
    'Your challenge this week: 100% commitment with no exceptions 💎',
    'Be brave — courage isn\'t the absence of fear, it\'s acting despite it ⚔️',
    'Write 3 things you\'ll do today to get closer to your goal 📝',
    'Challenge yourself to read 10 pages today and share what you learned 📚',
  ],
  reminder: [
    'Don\'t forget your morning ritual today ⚡',
    'Remember — evenings are for gratitude and reflection 🌙',
    'Have you reviewed your goals this week? 🎯',
    'Your routine shapes your character — don\'t skip it today 🔔',
    'Remember to drink enough water today 💧',
    'Take 5 minutes now for meditation or deep breathing 🧘',
  ],
  praise: [
    'I\'m proud of your progress this week 🏆',
    'I noticed your consistent commitment — it means a lot 🌟',
    'You are a role model for the group 👑',
    'What you\'re achieving now inspires those around you ✨',
    'Your persistence through challenges shows real strength 💪',
    'You\'re going in the right direction — keep it up 🚀',
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────

function typeInfo(key) {
  return MSG_TYPES.find(t => t.key === key) || MSG_TYPES[0]
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ── Compose Section ───────────────────────────────────────────────────────

function ComposeSection({ students, onSent }) {
  const [toUserId,  setToUserId]  = useState('all')
  const [msgType,   setMsgType]   = useState('motivation')
  const [msgLang,   setMsgLang]   = useState('ar')  // 'ar' | 'en'
  const [text,      setText]      = useState('')
  const [loading,   setLoading]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const templates = msgLang === 'ar' ? TEMPLATES[msgType] : TEMPLATES_EN[msgType]
  const type      = typeInfo(msgType)

  const recipientLabel = useMemo(() => {
    if (toUserId === 'all') return 'الكل — All Students'
    const s = students.find(s => s.id === toUserId || String(s.id) === String(toUserId))
    return s ? s.name : 'طالب'
  }, [toUserId, students])

  const handleSend = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      await upwApi.sendCoachMessage({
        toUserId,
        body: text.trim(),
        type: msgType,
      })
      setSent(true)
      onSent()
      setTimeout(() => {
        setSent(false)
        setText('')
      }, 2000)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #1e1e1e' }}>
        <h2 className="text-base font-bold" style={{ color: '#c9a84c' }}>رسالة جديدة</h2>
      </div>

      <div className="p-5 flex flex-col gap-4">

        {/* Recipient Dropdown */}
        <div>
          <p className="text-xs mb-2" style={{ color: '#666' }}>المستلم</p>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(v => !v)}
              className="w-full rounded-xl px-4 py-3 text-sm flex items-center justify-between"
              style={{ background: '#1e1e1e', border: '1px solid #333', color: '#e8e8e8' }}
            >
              <div className="flex items-center gap-2">
                {toUserId === 'all'
                  ? <Users size={14} style={{ color: '#c9a84c' }} />
                  : <User  size={14} style={{ color: '#c9a84c' }} />
                }
                <span>{recipientLabel}</span>
              </div>
              <ChevronDown size={14} style={{ color: '#555' }} />
            </button>
            {showDropdown && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20 max-h-48 overflow-y-auto"
                style={{ background: '#1e1e1e', border: '1px solid #333', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
              >
                <button
                  onClick={() => { setToUserId('all'); setShowDropdown(false) }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-all"
                  style={{
                    color: toUserId === 'all' ? '#c9a84c' : '#e8e8e8',
                    background: toUserId === 'all' ? 'rgba(201,168,76,0.1)' : 'transparent',
                  }}
                >
                  <Users size={13} style={{ color: '#c9a84c' }} />
                  الكل — All Students
                </button>
                {students.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setToUserId(s.id); setShowDropdown(false) }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-all"
                    style={{
                      color: String(toUserId) === String(s.id) ? '#c9a84c' : '#e8e8e8',
                      background: String(toUserId) === String(s.id) ? 'rgba(201,168,76,0.1)' : 'transparent',
                      borderTop: '1px solid #2a2a2a',
                    }}
                  >
                    <User size={13} style={{ color: '#888' }} />
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Type */}
        <div>
          <p className="text-xs mb-2" style={{ color: '#666' }}>نوع الرسالة</p>
          <div className="grid grid-cols-4 gap-2">
            {MSG_TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => setMsgType(t.key)}
                className="flex flex-col items-center gap-1 rounded-xl p-2 py-3 text-xs font-bold transition-all active:scale-95"
                style={{
                  background: msgType === t.key ? t.bg : '#1e1e1e',
                  border: msgType === t.key ? `1px solid ${t.color}55` : '1px solid #2a2a2a',
                  color: msgType === t.key ? t.color : '#666',
                }}
              >
                <span style={{ color: msgType === t.key ? t.color : '#555' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Toggle */}
        <div className="flex gap-2">
          {[{ key: 'ar', label: 'عربي' }, { key: 'en', label: 'English' }].map(l => (
            <button
              key={l.key}
              onClick={() => setMsgLang(l.key)}
              className="flex-1 rounded-xl py-2 text-sm font-bold transition-all active:scale-95"
              style={{
                background: msgLang === l.key ? 'rgba(201,168,76,0.15)' : '#1e1e1e',
                border: msgLang === l.key ? '1px solid rgba(201,168,76,0.4)' : '1px solid #2a2a2a',
                color: msgLang === l.key ? '#c9a84c' : '#555',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Templates */}
        <div>
          <p className="text-xs mb-2" style={{ color: '#666' }}>قوالب جاهزة</p>
          <div className="grid grid-cols-1 gap-1.5">
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => setText(tpl)}
                className="text-right rounded-xl px-3 py-2.5 text-xs transition-all active:scale-98"
                style={{
                  background: text === tpl ? `${type.bg}` : '#1e1e1e',
                  border: text === tpl ? `1px solid ${type.color}55` : '1px solid #2a2a2a',
                  color: text === tpl ? type.color : '#aaa',
                  direction: msgLang === 'ar' ? 'rtl' : 'ltr',
                  lineHeight: 1.5,
                }}
              >
                {tpl}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs" style={{ color: '#666' }}>نص الرسالة</p>
            {text && (
              <button onClick={() => setText('')} className="text-xs" style={{ color: '#555' }}>
                مسح
              </button>
            )}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={msgLang === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
            rows={4}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{
              background: '#1e1e1e',
              border: '1px solid #333',
              color: '#fff',
              direction: msgLang === 'ar' ? 'rtl' : 'ltr',
            }}
          />
        </div>

        {/* Send button */}
        {sent ? (
          <div className="flex items-center justify-center gap-2 rounded-xl py-3" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <Check size={16} style={{ color: '#4ade80' }} />
            <span className="text-sm font-bold" style={{ color: '#4ade80' }}>تم الإرسال بنجاح ✓</span>
          </div>
        ) : (
          <button
            onClick={handleSend}
            disabled={loading || !text.trim()}
            className="w-full rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)', color: '#0a0a0a' }}
          >
            {loading
              ? <RefreshCw size={15} className="animate-spin" />
              : <><Send size={15} /> {toUserId === 'all' ? 'إرسال لجميع الطلاب' : 'إرسال'}</>
            }
          </button>
        )}
      </div>
    </div>
  )
}

// ── History Section ───────────────────────────────────────────────────────

function HistorySection({ messages, loading, students }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return messages
    const q = search.toLowerCase()
    return messages.filter(m =>
      (m.message || m.body || '').toLowerCase().includes(q) ||
      (m.recipientName || '').toLowerCase().includes(q)
    )
  }, [messages, search])

  const recipientName = (msg) => {
    if (!msg.toUserId || msg.toUserId === 'all') return 'الكل'
    const s = students.find(s => String(s.id) === String(msg.toUserId))
    return s ? s.name : 'طالب'
  }

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <RefreshCw size={18} className="animate-spin" style={{ color: '#c9a84c' }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold" style={{ color: '#c9a84c' }}>
          سجل الرسائل ({messages.length})
        </h2>
      </div>

      {/* Search */}
      {messages.length > 3 && (
        <div className="relative">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3" style={{ color: '#555' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث في الرسائل..."
            className="w-full rounded-xl pr-9 pl-4 py-2.5 text-sm outline-none"
            style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#e8e8e8' }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: '#555' }}>
          {search ? 'لا نتائج للبحث' : 'لا توجد رسائل بعد'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((msg, i) => {
            const t    = typeInfo(msg.type || 'motivation')
            const body = msg.message || msg.body || ''
            const date = msg.createdAt || msg.created_at || msg.sentAt
            return (
              <div
                key={msg.id || i}
                className="rounded-xl p-4"
                style={{ background: '#161616', border: '1px solid #2a2a2a' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: t.bg, color: t.color }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-xs font-bold rounded-full px-2 py-0.5"
                        style={{ background: t.bg, color: t.color }}
                      >
                        {t.label}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: '#888' }}>
                        {String(msg.toUserId) === 'all'
                          ? <><Users size={10} /> الكل</>
                          : <><User  size={10} /> {recipientName(msg)}</>
                        }
                      </span>
                      {date && (
                        <span className="text-xs flex items-center gap-1" style={{ color: '#444' }}>
                          <Clock size={10} /> {formatDate(date)}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: '#ccc', whiteSpace: 'pre-wrap' }}
                    >
                      {body}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main CoachMessages ────────────────────────────────────────────────────

export default function CoachMessages() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [students,  setStudents]  = useState([])
  const [messages,  setMessages]  = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const [tab,       setTab]       = useState('compose') // 'compose' | 'history'

  const loadStudents = async () => {
    try {
      const data = await upwApi.getProgress()
      setStudents(data.map(s => ({ id: s.id, name: s.name, email: s.email })))
    } catch {}
  }

  const loadMessages = async () => {
    setLoadingMsgs(true)
    try {
      const data = await upwApi.getCoachMessages()
      setMessages(Array.isArray(data) ? data.reverse() : [])
    } catch {
      setMessages([])
    }
    setLoadingMsgs(false)
  }

  useEffect(() => {
    loadStudents()
    loadMessages()
  }, [])

  const handleSent = () => {
    if (tab === 'history') loadMessages()
    else loadMessages() // refresh silently
  }

  // Admin-only guard (after all hooks — React rules of hooks)
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}>
        <p style={{ color: '#ff6b7a' }}>غير مصرح</p>
      </div>
    )
  }

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
          <MessageCircle size={20} style={{ color: '#c9a84c' }} />
          <h1 className="text-lg font-black" style={{ color: '#e8e8e8' }}>رسائل المدرب</h1>
        </div>
        <button
          onClick={loadMessages}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: '#1e1e1e' }}
        >
          <RefreshCw size={15} style={{ color: loadingMsgs ? '#c9a84c' : '#666' }} className={loadingMsgs ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a', background: '#161616' }}>
        {[
          { key: 'compose', label: 'إرسال رسالة', icon: <Send size={14} /> },
          { key: 'history', label: `السجل (${messages.length})`, icon: <Clock size={14} /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all"
            style={{
              background: tab === t.key ? 'rgba(201,168,76,0.15)' : 'transparent',
              color: tab === t.key ? '#c9a84c' : '#555',
              borderBottom: tab === t.key ? '2px solid #c9a84c' : '2px solid transparent',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        {tab === 'compose' && (
          <ComposeSection students={students} onSent={handleSent} />
        )}
        {tab === 'history' && (
          <HistorySection messages={messages} loading={loadingMsgs} students={students} />
        )}
      </div>
    </div>
  )
}
