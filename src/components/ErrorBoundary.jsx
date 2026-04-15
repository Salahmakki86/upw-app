import { Component, useState } from 'react'

function ErrorDetails({ error }) {
  const [show, setShow] = useState(false)
  const msg = error?.message || String(error || 'Unknown error')
  const stack = error?.stack || ''
  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        style={{ fontSize: 11, color: '#555', background: 'none', border: 'none', cursor: 'pointer', marginTop: 12, textDecoration: 'underline' }}
      >
        Show error details
      </button>
    )
  }
  return (
    <div style={{
      marginTop: 12, padding: 12, borderRadius: 10,
      background: '#1a1a1a', border: '1px solid #2a2a2a',
      textAlign: 'left', direction: 'ltr', maxHeight: 200, overflowY: 'auto',
    }}>
      <p style={{ fontSize: 12, color: '#e74c3c', fontWeight: 700, marginBottom: 6, wordBreak: 'break-all' }}>{msg}</p>
      <pre style={{ fontSize: 9, color: '#666', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{stack}</pre>
    </div>
  )
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReload() {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const isAr = typeof navigator !== 'undefined' &&
      (navigator.language || '').startsWith('ar')

    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'inherit',
      }}>
        <div style={{
          maxWidth: 360,
          width: '100%',
          background: '#111',
          border: '1px solid #222',
          borderRadius: 24,
          padding: '40px 28px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>💥</div>

          <p style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 8,
            lineHeight: 1.4,
          }}>
            {isAr ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'}
          </p>

          <p style={{
            fontSize: 12,
            color: '#666',
            marginBottom: 28,
          }}>
            {isAr ? 'بياناتك محفوظة بأمان' : 'Your data is safe'}
          </p>

          <button
            onClick={this.handleReload}
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a)',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: 14,
              padding: '13px 32px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              transition: 'opacity 0.2s',
            }}
            onMouseDown={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseUp={e => (e.currentTarget.style.opacity = '1')}
          >
            {isAr ? '🔄 إعادة التحميل' : '🔄 Reload'}
          </button>

          {/* Error details (for debugging) */}
          <ErrorDetails error={this.state.error} />
        </div>
      </div>
    )
  }
}
