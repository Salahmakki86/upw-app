import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { ArrowLeft, ChevronLeft, PenLine, CheckCircle, Edit3, FileText } from 'lucide-react'

export default function CommitmentPage() {
  const { state, update, today } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const commitment = state.commitment

  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(commitment?.text || '')
  const [why, setWhy] = useState(commitment?.why || '')
  const [name, setName] = useState(commitment?.name || '')
  const [error, setError] = useState('')
  const [readFlash, setReadFlash] = useState(false)

  function handleSign() {
    if (!text.trim() || !why.trim() || !name.trim()) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields')
      return
    }
    setError('')
    update('commitment', {
      text: text.trim(),
      why: why.trim(),
      name: name.trim(),
      signedAt: new Date().toISOString(),
      date: today,
    })
    setEditing(false)
  }

  function handleEdit() {
    setText(commitment?.text || '')
    setWhy(commitment?.why || '')
    setName(commitment?.name || '')
    setError('')
    setEditing(true)
  }

  function handleReadToday() {
    setReadFlash(true)
    setTimeout(() => setReadFlash(false), 2500)
  }

  function formatDate(isoStr) {
    if (!isoStr) return ''
    try {
      const d = new Date(isoStr)
      return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch { return isoStr }
  }

  const showForm = !commitment || editing

  const inputStyle = {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 12,
    color: '#fff',
    fontSize: 15,
    padding: '12px 14px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
    direction: isAr ? 'rtl' : 'ltr',
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.6,
  }

  const labelStyle = {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
    display: 'block',
  }

  // ---- FORM VIEW ----
  if (showForm) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090909',
        color: '#fff',
        fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
        direction: isAr ? 'rtl' : 'ltr',
        paddingBottom: 40,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #1e1e1e',
          position: 'sticky',
          top: 0,
          background: '#090909',
          zIndex: 10,
        }}>
          <button
            onClick={() => editing ? setEditing(false) : navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
            className="active:scale-95 transition-all"
          >
            {isAr ? <ChevronLeft size={22} style={{ transform: 'scaleX(-1)' }} /> : <ArrowLeft size={22} />}
          </button>
          <h1 style={{ marginInlineStart: 12, fontSize: 18, fontWeight: 700, margin: 0, marginLeft: 12 }}>
            {isAr ? 'عقد التزامي' : 'My Commitment Contract'}
          </h1>
        </div>

        <div style={{ padding: '24px 16px' }}>
          {/* Intro */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📜</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              {isAr ? 'عقد التزامي' : 'My Commitment Contract'}
            </h2>
            <p style={{ color: '#888', fontSize: 14, maxWidth: 300, margin: '0 auto', lineHeight: 1.7 }}>
              {isAr
                ? 'اكتب التزامك، وقّع عليه، وعد إليه كل يوم'
                : 'Write your commitment, sign it, revisit it daily'}
            </p>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Commitment text */}
            <div>
              <label style={labelStyle}>
                {isAr ? 'التزامي هو...' : 'My commitment is...'}
              </label>
              <textarea
                rows={5}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={isAr ? 'أتعهد أمام نفسي بأن أكون...' : 'I commit to myself to be...'}
                style={inputStyle}
              />
            </div>

            {/* Why */}
            <div>
              <label style={labelStyle}>
                {isAr ? 'لماذا هذا مهم لي' : 'Why this matters to me'}
              </label>
              <textarea
                rows={3}
                value={why}
                onChange={e => setWhy(e.target.value)}
                placeholder={isAr ? 'هذا مهم لي لأن...' : 'This matters to me because...'}
                style={inputStyle}
              />
            </div>

            {/* Name */}
            <div>
              <label style={labelStyle}>
                {isAr ? 'اسمي — التوقيع' : 'My Name — Signature'}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isAr ? 'اكتب اسمك هنا...' : 'Write your name here...'}
                style={{ ...inputStyle, resize: undefined }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#f87171',
                fontSize: 14,
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            {/* Sign button */}
            <button
              onClick={handleSign}
              className="active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                color: '#000',
                border: 'none',
                borderRadius: 14,
                padding: '16px',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <PenLine size={18} />
              {isAr ? 'وقّع العقد' : 'Sign the Contract'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- SIGNED CONTRACT VIEW ----
  return (
    <div style={{
      minHeight: '100vh',
      background: '#090909',
      color: '#fff',
      fontFamily: isAr ? "'Cairo', sans-serif" : "'Inter', sans-serif",
      direction: isAr ? 'rtl' : 'ltr',
      paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #1e1e1e',
        position: 'sticky',
        top: 0,
        background: '#090909',
        zIndex: 10,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
          className="active:scale-95 transition-all"
        >
          {isAr ? <ChevronLeft size={22} style={{ transform: 'scaleX(-1)' }} /> : <ArrowLeft size={22} />}
        </button>
        <h1 style={{ marginInlineStart: 12, fontSize: 18, fontWeight: 700 }}>
          {isAr ? 'عقد التزامي' : 'My Commitment Contract'}
        </h1>
      </div>

      <div style={{ padding: '24px 16px' }}>
        {/* Contract scroll header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48 }}>📜</div>
        </div>

        {/* The contract card */}
        <div style={{
          background: '#0e0e0e',
          border: '1px solid rgba(201,168,76,0.4)',
          borderRadius: 20,
          padding: '28px 24px',
          boxShadow: '0 0 30px rgba(201,168,76,0.1)',
          marginBottom: 20,
        }}>
          {/* Contract heading */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              color: '#c9a84c',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              {isAr ? 'عقد الالتزام الشخصي' : 'PERSONAL COMMITMENT CONTRACT'}
            </div>
            <div style={{ width: 60, height: 1, background: 'rgba(201,168,76,0.3)', margin: '0 auto' }} />
          </div>

          {/* Commitment text section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              color: '#c9a84c',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <FileText size={13} />
              {isAr ? 'التزامي هو:' : 'My commitment is:'}
            </div>
            <div style={{
              color: '#f0f0f0',
              fontSize: 17,
              lineHeight: 1.8,
              fontWeight: 500,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 12,
              padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              {commitment.text}
            </div>
          </div>

          {/* Why section */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              color: '#c9a84c',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 10,
            }}>
              {isAr ? 'لماذا هذا مهم لي:' : 'Why this matters to me:'}
            </div>
            <div style={{
              color: '#bbb',
              fontSize: 14,
              lineHeight: 1.7,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 12,
              padding: '12px 14px',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              {commitment.why}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', marginBottom: 20 }} />

          {/* Signature section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <div style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>
                {isAr ? 'التوقيع' : 'Signature'}
              </div>
              <div style={{
                color: '#c9a84c',
                fontSize: 22,
                fontStyle: 'italic',
                fontWeight: 700,
                letterSpacing: 1,
              }}>
                {commitment.name}
              </div>
            </div>
            <div style={{ textAlign: isAr ? 'left' : 'right' }}>
              <div style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>
                {isAr ? 'تاريخ التوقيع' : 'Date signed'}
              </div>
              <div style={{ color: '#888', fontSize: 13 }}>
                {formatDate(commitment.signedAt)}
              </div>
              <div style={{ marginTop: 4, fontSize: 20 }}>🔏</div>
            </div>
          </div>
        </div>

        {/* Read today confirmation flash */}
        {readFlash && (
          <div style={{
            background: 'rgba(74,222,128,0.12)',
            border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: 14,
            padding: '14px',
            textAlign: 'center',
            marginBottom: 12,
            color: '#4ade80',
            fontWeight: 700,
            fontSize: 15,
            animation: 'fadeIn 0.3s ease',
          }}>
            ✅ {isAr ? 'رائع! استمر في هذا الطريق 🌟' : 'Amazing! Keep going on this path 🌟'}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleReadToday}
            className="active:scale-95 transition-all"
            style={{
              background: readFlash ? '#166534' : 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: readFlash ? '#4ade80' : '#000',
              border: 'none',
              borderRadius: 14,
              padding: '16px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.3s',
            }}
          >
            <CheckCircle size={18} />
            {isAr ? 'قرأت التزامي اليوم ✓' : 'I read my commitment today ✓'}
          </button>

          <button
            onClick={handleEdit}
            className="active:scale-95 transition-all"
            style={{
              background: 'none',
              border: '1px solid #2a2a2a',
              color: '#aaa',
              borderRadius: 14,
              padding: '12px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Edit3 size={15} />
            {isAr ? 'تعديل' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  )
}
