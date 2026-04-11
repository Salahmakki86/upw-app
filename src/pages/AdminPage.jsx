import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Plus, Trash2, Users, Eye, EyeOff, Link, Check,
  RefreshCw, Flame, TrendingUp, MessageCircle, X, Send,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { upwApi } from '../api/upwApi'

// ── Small component: 7-day activity dots ─────────────────────────────────
function WeekDots({ activity }) {
  const days = ['أ', 'إ', 'ث', 'أر', 'خ', 'ج', 'س']
  return (
    <div className="flex items-center gap-1 mt-1">
      {activity.map((active, i) => (
        <div
          key={i}
          title={days[i]}
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: active
              ? 'rgba(74,222,128,0.25)'
              : 'rgba(255,255,255,0.05)',
            border: active ? '1px solid rgba(74,222,128,0.5)' : '1px solid #2a2a2a',
          }}
        >
          {active ? (
            <div className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
          ) : (
            <div className="w-2 h-2 rounded-full" style={{ background: '#333' }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Send message modal ────────────────────────────────────────────────────
function SendMessageModal({ student, onClose }) {
  const [text,    setText]    = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

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
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', direction: 'rtl' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#161616', border: '1px solid rgba(201,168,76,0.3)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #222' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>رسالة لـ {student.name}</p>
            <p className="text-xs" style={{ color: '#555', direction: 'ltr' }}>{student.email}</p>
          </div>
          <button onClick={onClose} style={{ color: '#555' }}><X size={18} /></button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {sent ? (
            <div className="text-center py-4">
              <Check size={32} className="mx-auto mb-2" style={{ color: '#4ade80' }} />
              <p className="text-sm font-bold" style={{ color: '#4ade80' }}>تم الإرسال ✓</p>
            </div>
          ) : (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ background: '#1e1e1e', border: '1px solid #333', color: '#fff' }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !text.trim()}
                className="w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)', color: '#0a0a0a' }}
              >
                {loading ? '...' : <><Send size={15} /> إرسال</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Progress tab ──────────────────────────────────────────────────────────
function ProgressTab() {
  const [progress,   setProgress]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [msgStudent, setMsgStudent] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setProgress(await upwApi.getProgress()) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const today = new Date().toISOString().split('T')[0]

  const statusColor = (lastActive) => {
    if (!lastActive) return '#555'
    const days = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000)
    if (days === 0) return '#4ade80'
    if (days <= 3)  return '#c9a84c'
    return '#ff6b7a'
  }

  const statusLabel = (lastActive) => {
    if (!lastActive) return 'لم يدخل بعد'
    const days = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000)
    if (days === 0) return 'نشط اليوم'
    if (days === 1) return 'أمس'
    return `منذ ${days} أيام`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw size={20} className="animate-spin" style={{ color: '#c9a84c' }} />
      </div>
    )
  }

  if (progress.length === 0) {
    return (
      <p className="text-sm text-center py-10" style={{ color: '#555' }}>لا يوجد طلاب بعد</p>
    )
  }

  return (
    <>
      {msgStudent && (
        <SendMessageModal student={msgStudent} onClose={() => { setMsgStudent(null) }} />
      )}

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'نشطون اليوم', value: progress.filter(s => s.lastActive === today).length, color: '#4ade80' },
          { label: 'أعلى streak', value: Math.max(...progress.map(s => s.streak), 0) + ' يوم', color: '#c9a84c' },
          { label: 'إجمالي', value: progress.length, color: '#888' },
        ].map(item => (
          <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}>
            <p className="text-lg font-black" style={{ color: item.color }}>{item.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#555' }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Students */}
      <div className="flex flex-col gap-3">
        {progress
          .sort((a, b) => (b.streak - a.streak) || (b.totalDays - a.totalDays))
          .map(s => (
            <div
              key={s.id}
              className="rounded-xl p-4"
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
            >
              <div className="flex items-start justify-between gap-2">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold" style={{ color: '#e8e8e8' }}>{s.name}</span>
                    {/* Streak badge */}
                    {s.streak > 0 && (
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}
                      >
                        <Flame size={11} /> {s.streak}
                      </span>
                    )}
                    {/* Status dot */}
                    <span
                      className="text-xs rounded-full px-2 py-0.5"
                      style={{ background: statusColor(s.lastActive) + '22', color: statusColor(s.lastActive) }}
                    >
                      {statusLabel(s.lastActive)}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#888', direction: 'ltr' }}>{s.email}</p>
                  <p className="text-xs" style={{ color: '#555' }}>
                    {s.totalDays} {s.totalDays === 1 ? 'يوم نشاط' : 'يوم نشاط'}
                  </p>
                  <WeekDots activity={s.weekActivity} />
                </div>
                {/* Right: message button */}
                <button
                  onClick={() => setMsgStudent(s)}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}
                  title="إرسال رسالة"
                >
                  <MessageCircle size={14} />
                </button>
              </div>
            </div>
          ))
        }
      </div>

      <button
        onClick={load}
        className="w-full mt-2 rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ background: '#1e1e1e', color: '#555', border: '1px solid #2a2a2a' }}
      >
        <RefreshCw size={14} /> تحديث
      </button>
    </>
  )
}

// ── Main AdminPage ────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate()
  const { users, addUser, deleteUser, currentUser, refreshUsers } = useAuth()

  const [tab,      setTab]     = useState('students') // 'students' | 'progress'
  const [form,     setForm]    = useState({ name: '', email: '', password: '' })
  const [showPw,   setShowPw]  = useState(false)
  const [error,    setError]   = useState('')
  const [success,  setSuccess] = useState('')
  const [loading,  setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <p style={{ color: '#ff6b7a' }}>غير مصرح</p>
      </div>
    )
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return setError('يرجى ملء جميع الحقول')
    }
    setLoading(true)
    const result = await addUser(form)
    setLoading(false)
    if (result?.error) return setError(result.error)
    setSuccess(`تم إضافة ${form.name} بنجاح ✓`)
    setForm({ name: '', email: '', password: '' })
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`حذف ${u.name}؟`)) return
    await deleteUser(u.id)
  }

  const copyCredentials = (u) => {
    const text = `رابط البرنامج: ${window.location.origin}\nالبريد: ${u.email}\nكلمة المرور: (التي حددتها)`
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(u.id)
      setTimeout(() => setCopiedId(null), 2500)
    })
  }

  const students = users.filter(u => u.role === 'student')

  return (
    <div
      className="min-h-screen pb-10"
      style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #111111 100%)', direction: 'rtl' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4"
        style={{ background: '#111', borderBottom: '1px solid #222' }}
      >
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: '#1e1e1e' }}
        >
          <ArrowRight size={18} style={{ color: '#c9a84c' }} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Users size={20} style={{ color: '#c9a84c' }} />
          <h1 className="text-lg font-black" style={{ color: '#e8e8e8' }}>لوحة تحكم المدير</h1>
        </div>
        <button
          onClick={refreshUsers}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: '#1e1e1e' }}
        >
          <RefreshCw size={15} style={{ color: '#888' }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mx-4 mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a', background: '#161616' }}>
        {[
          { key: 'students', label: 'الطلاب',  icon: <Users size={15} /> },
          { key: 'progress', label: 'التقدم',   icon: <TrendingUp size={15} /> },
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

      <div className="max-w-lg mx-auto px-4 pt-5 flex flex-col gap-5">

        {/* ── STUDENTS TAB ── */}
        {tab === 'students' && (
          <>
            {/* Add User Form */}
            <div className="rounded-2xl p-6" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
              <h2 className="text-base font-bold mb-5" style={{ color: '#c9a84c' }}>إضافة طالب جديد</h2>
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="الاسم"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#1e1e1e', border: '1px solid #333', color: '#fff' }}
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#1e1e1e', border: '1px solid #333', color: '#fff', direction: 'ltr' }}
                />
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="كلمة المرور"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: '#1e1e1e', border: '1px solid #333', color: '#fff', direction: 'ltr' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#666' }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error   && <p className="text-sm text-center" style={{ color: '#ff6b7a' }}>{error}</p>}
                {success && <p className="text-sm text-center" style={{ color: '#4ade80' }}>{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)', color: '#0a0a0a' }}
                >
                  {loading ? '...' : <><Plus size={16} /> إضافة</>}
                </button>
              </form>
            </div>

            {/* Students list */}
            <div className="rounded-2xl p-6" style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
              <h2 className="text-base font-bold mb-4" style={{ color: '#c9a84c' }}>
                الطلاب ({students.length})
              </h2>

              {students.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <Link size={14} style={{ color: '#c9a84c', marginTop: 2, flexShrink: 0 }} />
                  <p className="text-xs leading-relaxed" style={{ color: '#999' }}>
                    الطالب يدخل من أي جهاز بالبريد الإلكتروني وكلمة المرور — لا يحتاج رابط دعوة
                  </p>
                </div>
              )}

              {students.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: '#555' }}>لا يوجد طلاب بعد</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {students.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-sm font-semibold" style={{ color: '#e8e8e8' }}>{u.name}</span>
                        <span className="text-xs truncate" style={{ color: '#999', direction: 'ltr' }}>{u.email}</span>
                        {u.last_sync && (
                          <span className="text-xs" style={{ color: '#444' }}>
                            آخر مزامنة: {new Date(u.last_sync).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyCredentials(u)}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                          style={{ background: copiedId === u.id ? 'rgba(46,204,113,0.2)' : 'rgba(201,168,76,0.15)', color: copiedId === u.id ? '#4ade80' : '#c9a84c' }}
                          title="نسخ معلومات الدخول"
                        >
                          {copiedId === u.id ? <Check size={14} /> : <Link size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                          style={{ background: 'rgba(220,53,69,0.15)', color: '#ff6b7a' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PROGRESS TAB ── */}
        {tab === 'progress' && <ProgressTab />}

        {/* Admin Info */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <span className="text-xl">👑</span>
          <div>
            <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>المدير</p>
            <p className="text-xs" style={{ color: '#888', direction: 'ltr' }}>salah.prana@gmail.com</p>
          </div>
        </div>

      </div>
    </div>
  )
}
