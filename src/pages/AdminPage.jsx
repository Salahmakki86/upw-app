import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plus, Trash2, Users, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminPage() {
  const navigate = useNavigate()
  const { users, addUser, deleteUser, currentUser } = useAuth()

  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <p style={{ color: '#ff6b7a' }}>غير مصرح</p>
      </div>
    )
  }

  const handleAdd = (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return setError('يرجى ملء جميع الحقول')
    }
    const result = addUser(form)
    if (!result) return setError('هذا البريد الإلكتروني مستخدم بالفعل')
    setSuccess(`تم إضافة ${form.name} بنجاح ✓`)
    setForm({ name: '', email: '', password: '' })
    setTimeout(() => setSuccess(''), 3000)
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
        <div className="flex items-center gap-2">
          <Users size={20} style={{ color: '#c9a84c' }} />
          <h1 className="text-lg font-black" style={{ color: '#e8e8e8' }}>لوحة تحكم المدير</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-6">

        {/* Add User Form */}
        <div
          className="rounded-2xl p-6"
          style={{ background: '#161616', border: '1px solid #2a2a2a' }}
        >
          <h2 className="text-base font-bold mb-5" style={{ color: '#c9a84c' }}>
            إضافة طالب جديد
          </h2>
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
                className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-12"
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
              className="w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)',
                color: '#0a0a0a',
              }}
            >
              <Plus size={16} />
              إضافة
            </button>
          </form>
        </div>

        {/* Students List */}
        <div
          className="rounded-2xl p-6"
          style={{ background: '#161616', border: '1px solid #2a2a2a' }}
        >
          <h2 className="text-base font-bold mb-4" style={{ color: '#c9a84c' }}>
            الطلاب ({students.length})
          </h2>

          {students.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: '#555' }}>
              لا يوجد طلاب بعد
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {students.map(u => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: '#1e1e1e', border: '1px solid #2a2a2a' }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold" style={{ color: '#e8e8e8' }}>{u.name}</span>
                    <span className="text-xs" style={{ color: '#666', direction: 'ltr' }}>{u.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`حذف ${u.name}؟`)) deleteUser(u.id)
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                    style={{ background: 'rgba(220,53,69,0.15)', color: '#ff6b7a' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
