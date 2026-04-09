import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const TIMEFRAMES = {
  ar: [
    { key: '3months', label: '3 أشهر', months: 3 },
    { key: '6months', label: '6 أشهر', months: 6 },
    { key: '1year',   label: 'سنة كاملة', months: 12 },
  ],
  en: [
    { key: '3months', label: '3 Months', months: 3 },
    { key: '6months', label: '6 Months', months: 6 },
    { key: '1year',   label: '1 Year',   months: 12 },
  ],
}

const PROMPTS = {
  ar: [
    'ما الذي تريد أن تكون عليه؟',
    'ما الذي ستنجزه؟',
    'كيف ستشعر؟',
    'ماذا ستقول لنفسك الآن؟',
  ],
  en: [
    'Who will you be?',
    'What will you have achieved?',
    'How will you feel?',
    'What would you tell your current self?',
  ],
}

function getOpenDate(months) {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

function formatCountdown(openDate, isAr) {
  const now = new Date()
  const open = new Date(openDate)
  const diff = open - now
  if (diff <= 0) return isAr ? 'حان وقت الفتح!' : 'Time to open!'
  const days = Math.ceil(diff / 86400000)
  if (days < 30) return isAr ? `${days} يوم` : `${days} days`
  const months = Math.floor(days / 30)
  return isAr ? `${months} شهر` : `${months} months`
}

export default function LetterToSelf() {
  const { state, addLetter, updateLetter, deleteLetter, today } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const [showForm, setShowForm] = useState(false)
  const [timeframeKey, setTimeframeKey] = useState('3months')
  const [letterText, setLetterText] = useState('')
  const [openedId, setOpenedId] = useState(null)

  const letters = state.letters || []
  const timeframes = TIMEFRAMES[lang]
  const selectedTF = timeframes.find(t => t.key === timeframeKey)

  const sealedLetters = useMemo(() => letters.filter(l => new Date(l.openDate) > new Date(today)), [letters, today])
  const openableLetters = useMemo(() => letters.filter(l => new Date(l.openDate) <= new Date(today)), [letters, today])

  const handleSave = () => {
    if (!letterText.trim()) return
    const tf = timeframes.find(t => t.key === timeframeKey)
    addLetter({
      timeframe: timeframeKey,
      writtenDate: today,
      openDate: getOpenDate(tf.months),
      text: letterText.trim(),
      opened: false,
    })
    setLetterText('')
    setShowForm(false)
  }

  return (
    <Layout title={t('letters_title')} subtitle={t('letters_subtitle')}>
      <div className="space-y-4 pt-2">

        {/* Tony Prompts */}
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.25)' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            ✦ {isAr ? 'أسئلة توجيهية' : 'Guiding Questions'}
          </p>
          <div className="space-y-1.5">
            {PROMPTS[lang].map((q, i) => (
              <p key={i} className="text-sm" style={{ color: '#aaa' }}>
                <span style={{ color: '#c9a84c' }}>{i + 1}. </span>{q}
              </p>
            ))}
          </div>
        </div>

        {/* New Letter Form */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)}
            className="w-full rounded-2xl py-4 font-bold text-base transition-all active:scale-[0.98]"
            style={{ background: 'rgba(201,168,76,0.08)', border: '2px dashed rgba(201,168,76,0.35)', color: '#c9a84c' }}>
            ✉ {isAr ? 'اكتب رسالة لنفسك' : 'Write a Letter to Yourself'}
          </button>
        ) : (
          <div className="rounded-2xl p-4 space-y-4" style={{ background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.3)' }}>
            <p className="text-sm font-black text-white">{isAr ? 'رسالة جديدة' : 'New Letter'}</p>

            {/* Timeframe */}
            <div>
              <p className="text-xs mb-2" style={{ color: '#888' }}>{isAr ? 'افتح الرسالة بعد:' : 'Open after:'}</p>
              <div className="flex gap-2">
                {timeframes.map(tf => (
                  <button key={tf.key} onClick={() => setTimeframeKey(tf.key)}
                    className="flex-1 rounded-xl py-2 text-xs font-bold transition-all"
                    style={{
                      background: timeframeKey === tf.key ? 'rgba(201,168,76,0.2)' : '#111',
                      border: `1px solid ${timeframeKey === tf.key ? '#c9a84c' : '#333'}`,
                      color: timeframeKey === tf.key ? '#c9a84c' : '#666'
                    }}>
                    {tf.label}
                  </button>
                ))}
              </div>
              {selectedTF && (
                <p className="text-xs mt-1.5" style={{ color: '#666' }}>
                  {isAr ? 'تاريخ الفتح:' : 'Open on:'} {getOpenDate(selectedTF.months)}
                </p>
              )}
            </div>

            {/* Letter textarea with paper styling */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'repeating-linear-gradient(transparent, transparent 28px, rgba(201,168,76,0.06) 28px, rgba(201,168,76,0.06) 29px)' }} />
              <textarea
                value={letterText}
                onChange={e => setLetterText(e.target.value)}
                placeholder={isAr ? 'عزيزي أنا المستقبلي...\n\nاكتب من قلبك. تحدث عن من ستكون، ما ستنجزه، كيف ستشعر...' : 'Dear future me...\n\nWrite from your heart. Talk about who you\'ll be, what you\'ll achieve, how you\'ll feel...'}
                className="w-full rounded-xl p-4 text-sm resize-none relative"
                style={{
                  background: 'rgba(30,25,10,0.9)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  color: '#ddd',
                  minHeight: 220,
                  lineHeight: '29px',
                  fontFamily: isAr ? "'Cairo', serif" : "'Georgia', serif",
                }}
                rows={8}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-gold flex-1 py-3">
                {isAr ? '🔒 ختم الرسالة' : '🔒 Seal Letter'}
              </button>
              <button onClick={() => { setShowForm(false); setLetterText('') }} className="btn-dark px-4">
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Sealed Letters */}
        {sealedLetters.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              🔒 {isAr ? 'رسائل مختومة' : 'Sealed Letters'} ({sealedLetters.length})
            </p>
            <div className="space-y-3">
              {sealedLetters.map(letter => {
                const tf = TIMEFRAMES[lang].find(t => t.key === letter.timeframe)
                return (
                  <div key={letter.id} className="rounded-xl p-4"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {isAr ? 'رسالة' : 'Letter'} — {tf?.label}
                        </p>
                        <p className="text-xs" style={{ color: '#888' }}>
                          {isAr ? 'كُتبت:' : 'Written:'} {letter.writtenDate}
                        </p>
                      </div>
                      <button onClick={() => deleteLetter(letter.id)}
                        className="text-xs px-2 py-1 rounded-lg" style={{ background: '#2a2a2a', color: '#888' }}>✕</button>
                    </div>
                    <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                      <p className="text-xs" style={{ color: '#888' }}>{isAr ? 'تفتح بعد' : 'Opens in'}</p>
                      <p className="text-lg font-black" style={{ color: '#c9a84c' }}>{formatCountdown(letter.openDate, isAr)}</p>
                      <p className="text-xs" style={{ color: '#666' }}>{letter.openDate}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Past / Openable Letters */}
        {openableLetters.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#2ecc71' }}>
              📭 {isAr ? 'رسائل جاهزة للفتح' : 'Letters Ready to Open'} ({openableLetters.length})
            </p>
            <div className="space-y-3">
              {openableLetters.map(letter => {
                const tf = TIMEFRAMES[lang].find(t => t.key === letter.timeframe)
                const isOpen = openedId === letter.id
                return (
                  <div key={letter.id} className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(46,204,113,0.25)' }}>
                    <div className="p-4" style={{ background: '#1a1a1a' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-white">{tf?.label}</p>
                          <p className="text-xs" style={{ color: '#888' }}>{letter.writtenDate}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setOpenedId(isOpen ? null : letter.id)}
                            className="text-xs px-3 py-1 rounded-lg font-bold transition-all"
                            style={{ background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', color: '#2ecc71' }}>
                            {isOpen ? (isAr ? 'إغلاق' : 'Close') : (isAr ? '📬 افتح' : '📬 Open')}
                          </button>
                          <button onClick={() => deleteLetter(letter.id)}
                            className="text-xs px-2 py-1 rounded-lg" style={{ background: '#2a2a2a', color: '#888' }}>✕</button>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="rounded-xl p-4 mt-3"
                          style={{
                            background: 'rgba(30,25,10,0.9)',
                            border: '1px solid rgba(201,168,76,0.2)',
                            fontFamily: isAr ? "'Cairo', serif" : "'Georgia', serif",
                            lineHeight: 1.8,
                          }}>
                          <p className="text-sm text-white whitespace-pre-wrap">{letter.text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {letters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">✉️</p>
            <p className="text-sm" style={{ color: '#555' }}>
              {isAr ? 'اكتب رسالتك الأولى لنفسك في المستقبل' : 'Write your first letter to your future self'}
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}
