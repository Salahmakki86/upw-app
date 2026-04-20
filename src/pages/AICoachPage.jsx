/**
 * AICoachPage — A2 AI Coach (UI shell)
 *
 * Note: Backend integration is intentionally NOT wired here — this is
 * a fully working UI shell with local message log + snapshot context.
 * When an API is connected later, only `sendToBackend` needs to be
 * implemented inside handleSend.
 *
 * Current behavior:
 *   • User can type a question
 *   • We attach a snapshot of their state (goals, last mood, identity)
 *   • We log the message locally (addAICoachMessage)
 *   • We return a canned "coach" response built from their data
 *     — this already provides value without LLM access.
 */
import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { getPrimaryIdentity, getAlignmentTrend } from '../utils/identityEngine'

/**
 * Local coach that responds without an API by crafting replies from
 * the user's own data. This is genuinely useful — it reflects
 * their current state back at them.
 */
function localCoachReply(state, isAr, userMsg) {
  const identity = getPrimaryIdentity(state, isAr)
  const { avg } = getAlignmentTrend(state)
  const activeGoals = (state.goals || []).filter(g => !g.completed)
  const topGoal = activeGoals[0]
  const today = new Date().toISOString().slice(0, 10)
  const stateToday = state.stateCheckin?.[today]
  const msg = (userMsg || '').toLowerCase()

  const lines = []

  if (msg.includes('عمل') || msg.includes('work') || msg.includes('job')) {
    lines.push(isAr
      ? `أنت "${identity}". في العمل، اسأل: هل ما تفعله الآن يخدم هذه الهوية؟`
      : `You are "${identity}". At work, ask: does what you're doing right now serve that identity?`)
  } else if (msg.includes('علاق') || msg.includes('relat') || msg.includes('love')) {
    lines.push(isAr
      ? 'العلاقات مرآة. ما ترفضه في الآخر غالباً ما ترفضه في نفسك.'
      : 'Relationships are mirrors. What you reject in others is often what you reject in yourself.')
  } else if (msg.includes('خاف') || msg.includes('afraid') || msg.includes('fear')) {
    lines.push(isAr
      ? 'الخوف طاقة — نفس الإثارة لكن بلون مختلف. غيّر ما تركز عليه، يتغيّر كل شيء.'
      : 'Fear is energy — same as excitement, different color. Change your focus, change everything.')
  } else if (msg.includes('هدف') || msg.includes('goal') || msg.includes('dream')) {
    if (topGoal) {
      lines.push(isAr
        ? `هدفك "${topGoal.title}" — ما الفعل الجبّار الذي إن فعلته اليوم يغيّر المسار؟`
        : `Your goal "${topGoal.title}" — what massive action done TODAY changes the trajectory?`)
    } else {
      lines.push(isAr
        ? 'لا هدف واضح الآن؟ هذه فرصة. اكتب الآن هدفاً واحداً تهتم به حقاً.'
        : 'No clear goal right now? That\'s an opportunity. Write ONE goal you genuinely care about.')
    }
  } else {
    lines.push(isAr
      ? `أنت "${identity}". ما سؤالك الحقيقي تحت هذا السؤال؟`
      : `You are "${identity}". What's the real question underneath this one?`)
  }

  if (avg !== null && avg < 5) {
    lines.push(isAr
      ? '⚡ انسجامك منخفض هذا الأسبوع. ابدأ بإعادة ضبط 60 ثانية قبل الإجابة على أي شيء.'
      : '⚡ Your alignment is low this week. Start with a 60-sec triad reset before answering anything.')
  }
  if (stateToday && (stateToday.energy + stateToday.mood + stateToday.clarity) / 3 < 5) {
    lines.push(isAr
      ? '🌫 حالتك منخفضة اليوم. تذكر: لا تتخذ قرارات كبرى وأنت في هذه الحالة.'
      : '🌫 Your state is low today. Remember: don\'t make big decisions from this state.')
  }

  return lines.join('\n\n')
}

export default function AICoachPage() {
  const { state, addAICoachMessage } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const messages = state.aiCoachLog || []
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length])

  const send = () => {
    const text = input.trim()
    if (!text || busy) return
    setBusy(true)

    // Snapshot for context (does not expose PII beyond what's already local)
    const snapshotContext = {
      identity: getPrimaryIdentity(state, isAr),
      mood7: getAlignmentTrend(state).avg,
      activeGoals: (state.goals || []).filter(g => !g.completed).slice(0, 3).map(g => g.title),
    }
    addAICoachMessage('user', text, snapshotContext)
    setInput('')

    // Simulate reply
    setTimeout(() => {
      const reply = localCoachReply(state, isAr, text)
      addAICoachMessage('coach', reply, null)
      setBusy(false)
    }, 500)
  }

  const suggestedPrompts = isAr ? [
    'ما الفعل الواحد اليوم يغيّر مساري؟',
    'أشعر بالإرهاق. ماذا أفعل؟',
    'لا أستطيع أن أقرر. ساعدني.',
    'كيف أحافظ على الزخم؟',
  ] : [
    'What\'s the one action today that changes my trajectory?',
    'I feel overwhelmed. What should I do?',
    'I can\'t decide. Help me.',
    'How do I maintain momentum?',
  ]

  return (
    <Layout
      title={isAr ? '💬 المدرب الذكي' : '💬 AI Coach'}
      subtitle={isAr ? 'مرآة واعية لحالتك الحقيقية' : 'A conscious mirror for your true state'}
    >
      <div className="flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>

        {/* Note */}
        <div style={{
          padding: '8px 12px', marginBottom: 8,
          background: 'rgba(201,168,76,0.05)',
          border: '1px dashed rgba(201,168,76,0.25)',
          borderRadius: 10, fontSize: 10, color: '#888',
        }}>
          {isAr
            ? 'ℹ️ يعمل محلياً — يستند إلى بياناتك فقط. عند توصيل API سيصبح أعمق.'
            : 'ℹ️ Runs locally — uses your data only. Deeper responses once API is connected.'}
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 2px' }}>
          {messages.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>🧘</div>
              <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                {isAr ? 'اسأل المدرب أي شيء عن حياتك' : 'Ask the coach anything about your life'}
              </p>
            </div>
          )}

          {messages.map(m => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 8,
              }}
            >
              <div style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                background: m.role === 'user' ? 'rgba(201,168,76,0.15)' : '#141414',
                border: `1px solid ${m.role === 'user' ? 'rgba(201,168,76,0.3)' : '#222'}`,
                fontSize: 12, color: '#eee', whiteSpace: 'pre-wrap', lineHeight: 1.5,
              }}>
                {m.content}
              </div>
            </div>
          ))}

          {busy && (
            <div style={{ padding: 10, fontSize: 11, color: '#888' }}>
              {isAr ? '...' : '...'}
            </div>
          )}
        </div>

        {/* Suggested prompts (only when empty) */}
        {messages.length === 0 && (
          <div style={{ marginBottom: 8 }}>
            <p style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>
              {isAr ? 'جرّب:' : 'Try:'}
            </p>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setInput(p)}
                  className="rounded-lg px-3 py-1.5 text-xs whitespace-nowrap flex-shrink-0"
                  style={{
                    background: '#141414', border: '1px solid #222',
                    color: '#c9a84c', fontWeight: 700,
                  }}
                >{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={isAr ? 'اسأل...' : 'Ask...'}
            className="flex-1 rounded-xl px-3 py-2 text-sm"
            style={{ background: '#141414', border: '1px solid #222', color: '#fff' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || busy}
            className="rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-[0.97]"
            style={{
              background: !input.trim() ? '#141414' : 'rgba(201,168,76,0.15)',
              border: `1px solid ${!input.trim() ? '#222' : 'rgba(201,168,76,0.4)'}`,
              color: !input.trim() ? '#555' : '#c9a84c',
              cursor: !input.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {isAr ? 'أرسل' : 'Send'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
