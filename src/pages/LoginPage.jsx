import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const ok = login(email.trim(), password)
    if (!ok) setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #111111 50%, #0d0b08 100%)' }}
    >
      {/* Logo / Title */}
      <div className="mb-10 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)',
            boxShadow: '0 0 40px rgba(201,168,76,0.35)',
          }}
        >
          <span className="text-3xl font-black" style={{ color: '#0a0a0a' }}>UPW</span>
        </div>
        <h1 className="text-2xl font-black tracking-wide" style={{ color: '#e8c96a' }}>
          Unleash The Power Within
        </h1>
        <p className="text-sm mt-1" style={{ color: '#666' }}>
          أدخل بياناتك للمتابعة
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" style={{ color: '#999' }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                background: '#1e1e1e',
                border: '1px solid #333',
                color: '#fff',
                direction: 'ltr',
              }}
              onFocus={e => e.target.style.borderColor = '#c9a84c'}
              onBlur={e => e.target.style.borderColor = '#333'}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" style={{ color: '#999' }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
              style={{
                background: '#1e1e1e',
                border: '1px solid #333',
                color: '#fff',
                direction: 'ltr',
              }}
              onFocus={e => e.target.style.borderColor = '#c9a84c'}
              onBlur={e => e.target.style.borderColor = '#333'}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm text-center"
              style={{ background: 'rgba(220,53,69,0.15)', color: '#ff6b7a', border: '1px solid rgba(220,53,69,0.3)' }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 font-black text-sm tracking-wide transition-all duration-200 active:scale-95 mt-1"
            style={{
              background: loading
                ? '#5a4a20'
                : 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #a88930 100%)',
              color: '#0a0a0a',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(201,168,76,0.3)',
            }}
          >
            {loading ? '...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
