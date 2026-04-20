/**
 * VoiceJournalPage — A5 Voice-First Journaling
 *
 * Uses MediaRecorder to capture a voice note, stores blob as data URL
 * in state.voiceJournal keyed by date. Playback from stored blob.
 *
 * If MediaRecorder or mic permission is unavailable, graceful fallback
 * to text entry.
 */
import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'

function formatMs(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function VoiceJournalPage() {
  const { state, today, addVoiceJournalEntry } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const mediaRecRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [textFallback, setTextFallback] = useState('')
  const [supportsVoice, setSupportsVoice] = useState(true)
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    setSupportsVoice(!!(navigator.mediaDevices && window.MediaRecorder))
    const PROMPTS_AR = [
      'ما أكثر شيء لفت انتباهك اليوم؟',
      'ما الشعور الذي لم تقل لأحد؟',
      'ما الذي تفخر به من يومك؟',
      'ماذا تختار أن تتركه وراءك الآن؟',
      'ما الدرس الأهم هذا الأسبوع؟',
    ]
    const PROMPTS_EN = [
      'What stood out most today?',
      'What feeling haven\'t you told anyone?',
      'What are you proud of from today?',
      'What do you choose to leave behind now?',
      'Most important lesson this week?',
    ]
    const arr = isAr ? PROMPTS_AR : PROMPTS_EN
    const day = new Date().getDay()
    setPrompt(arr[day % arr.length])
  }, [isAr])

  const todayEntries = (state.voiceJournal || {})[today] || []
  const allDates = Object.keys(state.voiceJournal || {}).sort().reverse().slice(0, 7)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        const dataURL = await blobToDataURL(blob)
        const durationMs = elapsed
        addVoiceJournalEntry({ dataURL, mimeType: blob.type, durationMs, prompt })
        showToast(isAr ? 'تم حفظ اليومية الصوتية ✓' : 'Voice entry saved ✓', 'success', 1500)
        stream.getTracks().forEach(t => t.stop())
        setElapsed(0)
      }
      mr.start()
      mediaRecRef.current = mr
      setRecording(true)
      const start = Date.now()
      timerRef.current = setInterval(() => setElapsed(Date.now() - start), 250)
    } catch (err) {
      showToast(isAr ? 'لم نتمكن من الوصول للميكروفون' : 'Could not access microphone', 'error', 2000)
      setSupportsVoice(false)
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    if (mediaRecRef.current && mediaRecRef.current.state === 'recording') {
      mediaRecRef.current.stop()
    }
    setRecording(false)
  }

  const saveText = () => {
    if (!textFallback.trim()) return
    addVoiceJournalEntry({ text: textFallback.trim(), prompt, durationMs: 0 })
    setTextFallback('')
    showToast(isAr ? 'تم الحفظ ✓' : 'Saved ✓', 'success', 1500)
  }

  useEffect(() => () => {
    clearInterval(timerRef.current)
    if (mediaRecRef.current && mediaRecRef.current.state === 'recording') {
      mediaRecRef.current.stop()
    }
  }, [])

  return (
    <Layout
      title={isAr ? '🎤 يوميات صوتية' : '🎤 Voice Journal'}
      subtitle={isAr ? 'اسمع نفسك — حقيقتك بين الكلمات' : 'Hear yourself — truth lives between words'}
    >
      <div className="space-y-4 pt-2">

        {/* Prompt */}
        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 6, letterSpacing: '0.05em' }}>
            {isAr ? '🎯 موضوع اليوم' : '🎯 Today\'s Prompt'}
          </p>
          <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.5, fontWeight: 700 }}>
            {prompt}
          </p>
        </div>

        {/* Recorder */}
        {supportsVoice ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            {recording ? (
              <>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(230,57,70,0.25), rgba(230,57,70,0.08))',
                  border: '3px solid #e63946',
                  margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'pulse-rec 1.5s ease-in-out infinite',
                }}>
                  <span style={{ fontSize: 36 }}>🔴</span>
                </div>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginTop: 14 }}>
                  {formatMs(elapsed)}
                </p>
                <p style={{ fontSize: 11, color: '#e63946', marginTop: 4 }}>
                  {isAr ? 'جاري التسجيل — تحدث بصدق' : 'Recording — speak the truth'}
                </p>
                <button
                  onClick={stopRecording}
                  className="mt-4 rounded-xl px-8 py-3 text-sm font-bold transition-all active:scale-[0.97]"
                  style={{
                    background: 'rgba(230,57,70,0.2)',
                    border: '1px solid rgba(230,57,70,0.4)',
                    color: '#e63946',
                  }}
                >
                  ⏹ {isAr ? 'أوقف التسجيل' : 'Stop & Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startRecording}
                  className="w-24 h-24 rounded-full transition-all active:scale-90"
                  style={{
                    background: 'linear-gradient(135deg, #c9a84c, #e5c670)',
                    border: 'none',
                    fontSize: 36,
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(201,168,76,0.4)',
                  }}
                >🎤</button>
                <p style={{ fontSize: 12, color: '#888', marginTop: 12 }}>
                  {isAr ? 'اضغط للتسجيل' : 'Tap to record'}
                </p>
              </>
            )}
            <style>{`
              @keyframes pulse-rec {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.06); }
              }
            `}</style>
          </div>
        ) : (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px dashed #2a2a2a' }}>
            <p style={{ fontSize: 10, color: '#888', marginBottom: 6 }}>
              {isAr
                ? 'الميكروفون غير متاح — استخدم الكتابة'
                : 'Microphone unavailable — use text instead'}
            </p>
            <textarea
              value={textFallback}
              onChange={e => setTextFallback(e.target.value)}
              placeholder={prompt}
              className="w-full rounded-lg p-3 text-xs"
              style={{ background: '#141414', border: '1px solid #222', color: '#fff', minHeight: 100 }}
            />
            <button
              onClick={saveText}
              disabled={!textFallback.trim()}
              className="w-full mt-2 rounded-xl py-2 text-xs font-bold"
              style={{
                background: !textFallback.trim() ? '#141414' : 'rgba(201,168,76,0.15)',
                border: `1px solid ${!textFallback.trim() ? '#222' : 'rgba(201,168,76,0.4)'}`,
                color: !textFallback.trim() ? '#555' : '#c9a84c',
                cursor: !textFallback.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {isAr ? 'احفظ' : 'Save'}
            </button>
          </div>
        )}

        {/* Today's entries */}
        {todayEntries.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 8 }}>
              {isAr ? '📅 اليوم' : '📅 Today'}
            </p>
            {todayEntries.map((e, i) => (
              <div key={e.id || i} style={{
                padding: '10px 12px', marginBottom: 6,
                background: '#141414', border: '1px solid #222', borderRadius: 10,
              }}>
                <p style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>
                  {new Date(e.ts).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  {e.durationMs > 0 && ` · ${formatMs(e.durationMs)}`}
                </p>
                {e.dataURL ? (
                  <audio controls src={e.dataURL} style={{ width: '100%', height: 36 }} />
                ) : (
                  <p style={{ fontSize: 11, color: '#ddd', lineHeight: 1.5 }}>{e.text}</p>
                )}
                {e.prompt && (
                  <p style={{ fontSize: 9, color: '#666', marginTop: 4, fontStyle: 'italic' }}>
                    {isAr ? 'موضوع: ' : 'Prompt: '}{e.prompt}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Past days */}
        {allDates.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 8 }}>
              {isAr ? '📆 آخر 7 أيام' : '📆 Last 7 days'}
            </p>
            {allDates.map(d => (
              <div key={d} style={{
                padding: '6px 10px',
                background: '#141414', border: '1px solid #222', borderRadius: 8, marginBottom: 4,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, color: '#ddd', fontWeight: 700 }}>{d}</span>
                <span style={{ fontSize: 10, color: '#888' }}>
                  {((state.voiceJournal || {})[d] || []).length} {isAr ? 'مداخلة' : 'entries'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}
