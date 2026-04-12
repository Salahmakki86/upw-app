import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'
import { upwApi } from '../api/upwApi'

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEK_WORDS = [
  { ar: 'حيوي',   en: 'Energetic'   },
  { ar: 'منجز',   en: 'Productive'  },
  { ar: 'صعب',    en: 'Challenging' },
  { ar: 'ممتع',   en: 'Enjoyable'   },
  { ar: 'متعلّم', en: 'Learning'    },
  { ar: 'مشغول',  en: 'Busy'        },
  { ar: 'هادئ',   en: 'Calm'        },
  { ar: 'ملهَم',  en: 'Inspired'    },
  { ar: 'متعب',   en: 'Tired'       },
  { ar: 'نامٍ',   en: 'Growing'     },
]

const INTENTION_WORDS = [
  { ar: 'تركيز',   en: 'Focus'      },
  { ar: 'شجاعة',   en: 'Courage'    },
  { ar: 'انضباط',  en: 'Discipline' },
  { ar: 'عطاء',    en: 'Giving'     },
  { ar: 'نمو',     en: 'Growth'     },
  { ar: 'إبداع',   en: 'Creativity' },
  { ar: 'حب',      en: 'Love'       },
  { ar: 'قوة',     en: 'Strength'   },
  { ar: 'سكينة',   en: 'Peace'      },
  { ar: 'امتنان',  en: 'Gratitude'  },
]

const LIFE_AREAS = [
  { key: 'body',          emoji: '💪', ar: 'الجسد',       en: 'Body'         },
  { key: 'emotions',      emoji: '❤️', ar: 'المشاعر',     en: 'Emotions'     },
  { key: 'relationships', emoji: '👥', ar: 'العلاقات',    en: 'Relationships'},
  { key: 'time',          emoji: '⏰', ar: 'الوقت',       en: 'Time'         },
  { key: 'career',        emoji: '🚀', ar: 'المهنة',      en: 'Career'       },
  { key: 'money',         emoji: '💰', ar: 'المال',       en: 'Money'        },
  { key: 'contribution',  emoji: '🌍', ar: 'المساهمة',   en: 'Contribution' },
]

const ENERGY_EMOJI = (v) => v <= 3 ? '🔋' : v <= 6 ? '⚡' : '🔥'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns "YYYY-WW" for a given Date */
function getWeekKey(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const w = Math.ceil(((d - jan4) / 86400000 + jan4.getDay() + 1) / 7)
  return `${d.getFullYear()}-${String(w).padStart(2, '0')}`
}

/** Returns week number (1–52) */
function getWeekNumber(date = new Date()) {
  const key = getWeekKey(date)
  return parseInt(key.split('-')[1], 10)
}

/** Returns [monday, sunday] formatted strings for the current week */
function getWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d) => `${d.getDate()}/${d.getMonth() + 1}`
  return `${fmt(monday)} — ${fmt(sunday)}`
}

/** Counts completed mornings in the last 7 days */
function countRecentMornings(state) {
  if (!state) return 0
  const today = new Date()
  let count = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    // morningDone only tracks today; use stateLog as proxy
    const entry = (state.stateLog || []).find(e => e.date === key)
    if (entry) count++
  }
  return count
}

/** Counts wins added in the last 7 days */
function countRecentWins(state) {
  if (!state) return 0
  const today = new Date()
  let count = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const wins = (state.dailyWins || {})[key] || []
    count += wins.length
  }
  return count
}

/** Average sleep hours over the last 7 days */
function avgSleep(state) {
  if (!state) return null
  const today = new Date()
  const entries = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const entry = (state.sleepLog || {})[key]
    if (entry && entry.hours) entries.push(Number(entry.hours))
  }
  if (!entries.length) return null
  return (entries.reduce((a, b) => a + b, 0) / entries.length).toFixed(1)
}

/** Days in last 7 that have at least one stateLog or dailyWins entry (proxy for activity) */
function last7DaysBars(state) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const morning = (state.stateLog || []).some(e => e.date === key) ? 1 : 0
    const evening = (state.eveningDone && key === today.toISOString().split('T')[0]) ? 1 : 0
    return { key, morning, evening, date: d.getDate() }
  })
}

// ─── Step Components ─────────────────────────────────────────────────────────

function StepDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-2" style={{ marginBottom: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 22 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current ? '#c9a84c' : i < current ? 'rgba(201,168,76,0.5)' : '#2a2a2a',
            transition: 'all 0.3s',
          }}
        />
      ))}
    </div>
  )
}

// Step 0 — Welcome
function StepWelcome({ onStart, isAr, weekNumber, weekDates, lastPulseDays }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
      <div
        style={{
          background: 'linear-gradient(135deg,#c9a84c,#a88930)',
          borderRadius: 20,
          padding: '12px 28px',
          display: 'inline-block',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: '#090909' }}>
          {isAr ? `الأسبوع ${weekNumber} من 52` : `Week ${weekNumber} of 52`}
        </span>
      </div>

      <p style={{ fontSize: 13, color: '#888' }}>{weekDates}</p>

      {lastPulseDays !== null && (
        <p style={{ fontSize: 14, color: '#666' }}>
          {isAr
            ? `آخر مرة أجريت فيها هذا الفحص: ${lastPulseDays === 0 ? 'اليوم' : `${lastPulseDays} يوم`}`
            : `Last pulse check: ${lastPulseDays === 0 ? 'today' : `${lastPulseDays} day${lastPulseDays !== 1 ? 's' : ''} ago`}`}
        </p>
      )}

      <p style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.3 }}>
        {isAr ? '📊 فحص النبض الأسبوعي' : '📊 Weekly Pulse Check'}
      </p>

      <p style={{ fontSize: 14, color: '#aaa', maxWidth: 280, lineHeight: 1.7 }}>
        {isAr
          ? '٥ أسئلة قوية لتقييم أسبوعك وتحديد مساركهُ القادم'
          : '5 powerful questions to review your week and set the next one up for success'}
      </p>

      <StepDots total={6} current={0} />

      <button
        onClick={onStart}
        style={{
          background: 'linear-gradient(135deg,#c9a84c,#a88930)',
          color: '#090909', borderRadius: 18, padding: '16px 48px',
          fontWeight: 800, fontSize: 17, border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
        }}
      >
        {isAr ? 'ابدأ — 3 دقائق فقط ⚡' : 'Start — only 3 minutes ⚡'}
      </button>
    </div>
  )
}

// Step 1 — State of the Week
function StepState({ data, onChange, onNext, isAr }) {
  return (
    <div className="flex flex-col gap-6 px-6 pt-4 pb-8">
      <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
        {isAr ? 'كيف كانت طاقتك هذا الأسبوع؟' : 'How was your energy this week?'}
      </p>

      {/* Energy Slider */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '18px 16px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>{ENERGY_EMOJI(data.energy)}</span>
          <span style={{ fontSize: 32, fontWeight: 900, color: '#c9a84c' }}>{data.energy}</span>
          <span style={{ fontSize: 13, color: '#666' }}>/10</span>
        </div>
        <input
          type="range" min={1} max={10} value={data.energy}
          onChange={e => onChange('energy', Number(e.target.value))}
          style={{ width: '100%', accentColor: '#c9a84c' }}
        />
        <div className="flex justify-between" style={{ marginTop: 4 }}>
          <span style={{ fontSize: 11, color: '#555' }}>🔋 منهك / Drained</span>
          <span style={{ fontSize: 11, color: '#555' }}>🔥 قمة / Peak</span>
        </div>
      </div>

      {/* Word Chips */}
      <div>
        <p style={{ fontSize: 14, color: '#aaa', marginBottom: 12, textAlign: 'center' }}>
          {isAr ? 'ما الكلمة التي تصف أسبوعك؟' : 'What one word describes your week?'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {WEEK_WORDS.map((w, i) => (
            <button
              key={i}
              onClick={() => onChange('word', isAr ? w.ar : w.en)}
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: '1px solid',
                background: data.word === (isAr ? w.ar : w.en) ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.04)',
                borderColor: data.word === (isAr ? w.ar : w.en) ? '#c9a84c' : '#2a2a2a',
                color: data.word === (isAr ? w.ar : w.en) ? '#c9a84c' : '#888',
              }}
            >
              {isAr ? w.ar : w.en}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!data.word}
        style={{
          background: data.word ? 'linear-gradient(135deg,#c9a84c,#a88930)' : '#222',
          color: data.word ? '#090909' : '#555',
          borderRadius: 16, padding: '16px', fontWeight: 700,
          fontSize: 16, border: 'none', cursor: data.word ? 'pointer' : 'default',
        }}
      >
        {isAr ? 'التالي →' : 'Next →'}
      </button>
    </div>
  )
}

// Step 2 — Progress Review
function StepProgress({ state, onNext, isAr }) {
  const mornings  = countRecentMornings(state)
  const wins      = countRecentWins(state)
  const sleep     = avgSleep(state)
  const streak    = state.streak || 0
  const bars      = last7DaysBars(state)

  const stats = [
    { emoji: '☀️', value: mornings, label: isAr ? `أكملت ${mornings} صباح هذا الأسبوع` : `You completed ${mornings} morning${mornings !== 1 ? 's' : ''} this week` },
    { emoji: '🎯', value: wins,     label: isAr ? `أضفت ${wins} انتصار` : `You logged ${wins} win${wins !== 1 ? 's' : ''}` },
    sleep !== null
      ? { emoji: '😴', value: sleep,   label: isAr ? `متوسط نومك ${sleep} ساعة` : `Average sleep ${sleep}h` }
      : null,
    { emoji: '🔥', value: streak,   label: isAr ? `سلسلتك الحالية ${streak} يوم` : `Current streak ${streak} day${streak !== 1 ? 's' : ''}` },
  ].filter(Boolean)

  // Best stat
  const bestIdx = [mornings, wins, sleep ? Number(sleep) : 0, streak].reduce((bi, v, i, arr) => v > arr[bi] ? i : bi, 0)

  return (
    <div className="flex flex-col gap-4 px-6 pt-4 pb-8">
      <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
        {isAr ? '📈 ملخص أسبوعك' : '📈 Your Week at a Glance'}
      </p>

      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            background: i === bestIdx ? 'rgba(201,168,76,0.12)' : '#111',
            border: `1px solid ${i === bestIdx ? '#c9a84c' : '#1e1e1e'}`,
            borderRadius: 14, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>{s.emoji}</span>
          <span style={{ fontSize: 14, color: i === bestIdx ? '#c9a84c' : '#ccc', fontWeight: i === bestIdx ? 700 : 400, flex: 1 }}>
            {s.label}
          </span>
          {i === bestIdx && <span style={{ fontSize: 11, color: '#c9a84c', fontWeight: 700 }}>★ Best</span>}
        </div>
      ))}

      {/* Mini bar chart */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '14px 16px' }}>
        <p style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
          {isAr ? 'نشاط آخر 7 أيام' : 'Last 7 days activity'}
        </p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 50 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div
                style={{
                  width: '100%', borderRadius: 4,
                  height: b.morning ? 32 : 8,
                  background: b.morning ? 'linear-gradient(180deg,#c9a84c,#a88930)' : '#222',
                  transition: 'height 0.4s',
                }}
              />
              <span style={{ fontSize: 9, color: '#555' }}>{b.date}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        style={{ background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
      >
        {isAr ? 'التالي →' : 'Next →'}
      </button>
    </div>
  )
}

// Step 3 — Win & Challenge
function StepWinChallenge({ data, onChange, onNext, isAr }) {
  const fields = [
    {
      key: 'win',
      label: isAr ? 'ما أكبر انتصار هذا الأسبوع؟' : 'What was your biggest win this week?',
      placeholder: isAr ? 'اكتب هنا...' : 'Write here...',
      accent: '#2ecc71',
    },
    {
      key: 'challenge',
      label: isAr ? 'ما التحدي الأكبر الذي واجهته؟' : 'What was your biggest challenge?',
      placeholder: isAr ? 'اكتب هنا...' : 'Write here...',
      accent: '#e63946',
    },
    {
      key: 'reframe',
      label: isAr ? 'كيف يمكنني تحويل هذا التحدي لانتصار؟' : 'How can I turn this challenge into a win?',
      placeholder: isAr ? 'اكتب هنا...' : 'Write here...',
      accent: '#c9a84c',
    },
  ]

  return (
    <div className="flex flex-col gap-5 px-6 pt-4 pb-8">
      <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
        {isAr ? '🏆 الانتصار والتحدي' : '🏆 Win & Challenge'}
      </p>

      {fields.map(f => (
        <div key={f.key}>
          <p style={{ fontSize: 13, color: f.accent, fontWeight: 600, marginBottom: 8 }}>{f.label}</p>
          <textarea
            value={data[f.key] || ''}
            onChange={e => onChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            rows={3}
            style={{
              width: '100%', background: '#111', border: `1px solid ${f.accent}33`,
              borderRadius: 14, color: '#fff', fontSize: 14, padding: '12px 14px',
              resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      ))}

      <button
        onClick={onNext}
        style={{ background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
      >
        {isAr ? 'التالي →' : 'Next →'}
      </button>
    </div>
  )
}

// Step 4 — Wheel Quick Check
function StepWheel({ data, onChange, onNext, isAr, lastWeekWheel }) {
  const lowestArea = LIFE_AREAS.reduce((low, a) => {
    const v = data[a.key] || 0
    return v < (data[low?.key] || 0) ? a : low
  }, LIFE_AREAS[0])

  return (
    <div className="flex flex-col gap-4 px-6 pt-4 pb-8">
      <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
        {isAr ? '🌐 عجلة الحياة السريعة' : '🌐 Quick Wheel Check'}
      </p>

      {LIFE_AREAS.map(area => {
        const val = data[area.key] || 0
        const lastVal = lastWeekWheel ? (lastWeekWheel[area.key] || 0) : null
        const diff = lastVal !== null ? val - lastVal : null

        return (
          <div
            key={area.key}
            style={{
              background: '#111', border: '1px solid #1e1e1e',
              borderRadius: 14, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{area.emoji}</span>
            <span style={{ fontSize: 14, color: '#ccc', flex: 1, fontWeight: 500 }}>
              {isAr ? area.ar : area.en}
            </span>
            {diff !== null && (
              <span style={{ fontSize: 11, color: diff > 0 ? '#2ecc71' : diff < 0 ? '#e63946' : '#666' }}>
                {diff > 0 ? `↑${diff}` : diff < 0 ? `↓${Math.abs(diff)}` : '→'}
              </span>
            )}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => onChange(area.key, star)}
                  style={{
                    fontSize: 20, background: 'none', border: 'none', cursor: 'pointer',
                    color: star <= val ? '#c9a84c' : '#333',
                    padding: '0 1px',
                    lineHeight: 1,
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {lowestArea && (data[lowestArea.key] || 0) > 0 && (
        <div
          style={{
            background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.25)',
            borderRadius: 14, padding: '12px 14px',
          }}
        >
          <p style={{ fontSize: 13, color: '#e63946' }}>
            {isAr
              ? `🎯 مجال يحتاج تركيزاً: ${lowestArea.ar} ${lowestArea.emoji}`
              : `🎯 Area needing focus: ${lowestArea.en} ${lowestArea.emoji}`}
          </p>
        </div>
      )}

      <button
        onClick={onNext}
        style={{ background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
      >
        {isAr ? 'التالي →' : 'Next →'}
      </button>
    </div>
  )
}

// Step 5 — Intention
function StepIntention({ data, onChange, onNext, isAr }) {
  const [customWord, setCustomWord] = useState('')

  function selectWord(w) {
    onChange('intentionWord', w)
    setCustomWord('')
  }

  return (
    <div className="flex flex-col gap-5 px-6 pt-4 pb-8">
      <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
        {isAr ? '🎯 نية الأسبوع القادم' : '🎯 Next Week\'s Intention'}
      </p>

      {/* Intention Word */}
      <div>
        <p style={{ fontSize: 13, color: '#c9a84c', fontWeight: 600, marginBottom: 10 }}>
          {isAr ? 'كلمة نيتك للأسبوع القادم:' : 'Your intention word for next week:'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
          {INTENTION_WORDS.map((w, i) => {
            const word = isAr ? w.ar : w.en
            return (
              <button
                key={i}
                onClick={() => selectWord(word)}
                style={{
                  padding: '7px 14px', borderRadius: 18, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  background: data.intentionWord === word ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.04)',
                  borderColor: data.intentionWord === word ? '#c9a84c' : '#2a2a2a',
                  color: data.intentionWord === word ? '#c9a84c' : '#888',
                }}
              >
                {word}
              </button>
            )
          })}
        </div>
        <input
          value={customWord}
          onChange={e => { setCustomWord(e.target.value); onChange('intentionWord', e.target.value) }}
          placeholder={isAr ? 'أو اكتب كلمتك الخاصة...' : 'Or type your own word...'}
          style={{
            width: '100%', background: '#111', border: '1px solid #2a2a2a',
            borderRadius: 12, color: '#fff', fontSize: 14, padding: '10px 14px',
            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Biggest Action */}
      <div>
        <p style={{ fontSize: 13, color: '#3498db', fontWeight: 600, marginBottom: 8 }}>
          {isAr ? 'الخطوة الواحدة الأكبر هذا الأسبوع:' : 'Your ONE biggest action this week:'}
        </p>
        <input
          value={data.bigAction || ''}
          onChange={e => onChange('bigAction', e.target.value)}
          placeholder={isAr ? 'الإجراء الأهم...' : 'The most important action...'}
          style={{
            width: '100%', background: '#111', border: '1px solid #3498db33',
            borderRadius: 12, color: '#fff', fontSize: 14, padding: '12px 14px',
            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Who I want to BE */}
      <div>
        <p style={{ fontSize: 13, color: '#9b59b6', fontWeight: 600, marginBottom: 8 }}>
          {isAr ? 'من تريد أن تكون في نهاية هذا الأسبوع؟' : 'Who do you want to BE by the end of this week?'}
        </p>
        <textarea
          value={data.beStatement || ''}
          onChange={e => onChange('beStatement', e.target.value)}
          placeholder={isAr ? 'أريد أن أكون شخصاً...' : 'I want to be someone who...'}
          rows={3}
          style={{
            width: '100%', background: '#111', border: '1px solid #9b59b633',
            borderRadius: 14, color: '#fff', fontSize: 14, padding: '12px 14px',
            resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={onNext}
        style={{ background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 16, padding: '16px', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' }}
      >
        {isAr ? 'عرض الملخص →' : 'View Summary →'}
      </button>
    </div>
  )
}

// Step 6 — Summary
function StepSummary({ pulse, weekNumber, weekDates, onComplete, isAr, pastPulses, similarWeek }) {
  const [sharing, setSharing] = useState(false)

  async function handleShare() {
    setSharing(true)
    try {
      const msg = isAr
        ? `📊 ملخص الأسبوع ${weekNumber}\n⚡ الطاقة: ${pulse.energy}/10\n🔤 كلمة الأسبوع: ${pulse.word}\n🏆 الانتصار: ${pulse.win}\n🎯 كلمة النية: ${pulse.intentionWord}`
        : `📊 Week ${weekNumber} Pulse\n⚡ Energy: ${pulse.energy}/10\n🔤 Word: ${pulse.word}\n🏆 Win: ${pulse.win}\n🎯 Intention: ${pulse.intentionWord}`
      await upwApi.sendCoachMessage({ body: msg })
    } catch {}
    setSharing(false)
  }

  return (
    <div className="flex flex-col gap-4 px-6 pt-4 pb-8">
      <p style={{ fontSize: 20, fontWeight: 800, color: '#c9a84c', textAlign: 'center' }}>
        {isAr ? '🌟 ملخص أسبوعك' : '🌟 Your Week Summary'}
      </p>

      {/* Summary Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04))',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 20, padding: '20px 18px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 13, color: '#888' }}>
            {isAr ? `الأسبوع ${weekNumber}` : `Week ${weekNumber}`}
          </span>
          <span style={{ fontSize: 12, color: '#666' }}>{weekDates}</span>
        </div>

        <SummaryRow emoji="⚡" label={isAr ? 'الطاقة' : 'Energy'} value={`${ENERGY_EMOJI(pulse.energy)} ${pulse.energy}/10`} />
        {pulse.word      && <SummaryRow emoji="🔤" label={isAr ? 'كلمة الأسبوع' : 'Week Word'} value={pulse.word} />}
        {pulse.win       && <SummaryRow emoji="🏆" label={isAr ? 'أكبر انتصار' : 'Biggest Win'} value={pulse.win} />}
        {pulse.challenge && <SummaryRow emoji="⚔️" label={isAr ? 'أكبر تحدٍّ' : 'Challenge'} value={pulse.challenge} />}
        {pulse.intentionWord && <SummaryRow emoji="🎯" label={isAr ? 'كلمة النية' : 'Intention'} value={pulse.intentionWord} />}
        {pulse.bigAction && <SummaryRow emoji="🚀" label={isAr ? 'الإجراء الأكبر' : 'Big Action'} value={pulse.bigAction} />}
      </div>

      {/* Similarity note */}
      {similarWeek && (
        <div
          style={{
            background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)',
            borderRadius: 14, padding: '12px 14px',
          }}
        >
          <p style={{ fontSize: 13, color: '#3498db' }}>
            {isAr
              ? `💡 هذا الأسبوع مشابه لـ الأسبوع ${similarWeek.weekNum} حيث كنت تشعر بـ "${similarWeek.word}"`
              : `💡 Similar to Week ${similarWeek.weekNum} when you felt "${similarWeek.word}"`}
          </p>
        </div>
      )}

      {/* Buttons */}
      <button
        onClick={handleShare}
        disabled={sharing}
        style={{
          background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 16, padding: '14px', color: '#c9a84c',
          fontWeight: 700, fontSize: 15, cursor: 'pointer',
        }}
      >
        {sharing ? '...' : isAr ? '📤 شارك مع مدربي' : '📤 Share with my coach'}
      </button>

      <button
        onClick={onComplete}
        style={{ background: 'linear-gradient(135deg,#c9a84c,#a88930)', color: '#090909', borderRadius: 16, padding: '16px', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer' }}
      >
        {isAr ? '✓ اختتم الفحص' : '✓ Complete Check-in'}
      </button>
    </div>
  )
}

function SummaryRow({ emoji, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 11, color: '#666', display: 'block' }}>{label}</span>
        <span style={{ fontSize: 14, color: '#ddd', fontWeight: 600 }}>{value}</span>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WeeklyPulse() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const weekKey    = getWeekKey()
  const weekNumber = getWeekNumber()
  const weekDates  = getWeekDates()

  const weeklyPulse   = state.weeklyPulse || {}
  const existingPulse = weeklyPulse[weekKey]

  // Find last completed pulse
  const lastPulseDays = (() => {
    const keys = Object.keys(weeklyPulse).sort().reverse()
    const lastKey = keys.find(k => k !== weekKey && weeklyPulse[k]?.completedAt)
    if (!lastKey) return null
    const ms = Date.now() - weeklyPulse[lastKey].completedAt
    return Math.floor(ms / 86400000)
  })()

  // Find similar week (same word)
  const similarWeek = (() => {
    if (!existingPulse?.word) return null
    const keys = Object.keys(weeklyPulse).sort().reverse()
    const match = keys.find(k => k !== weekKey && weeklyPulse[k]?.word === existingPulse.word)
    if (!match) return null
    return { weekNum: parseInt(match.split('-')[1], 10), word: weeklyPulse[match].word }
  })()

  // Get last week's wheel data for comparison
  const lastWeekWheel = (() => {
    const keys = Object.keys(weeklyPulse).sort().reverse()
    const lastKey = keys.find(k => k !== weekKey && weeklyPulse[k]?.wheel)
    return lastKey ? weeklyPulse[lastKey].wheel : null
  })()

  const [step, setStep] = useState(existingPulse?.completedAt ? 6 : 0)

  // Form state — pre-populate from existing pulse if any
  const [stateData, setStateData]   = useState({ energy: existingPulse?.energy || 5, word: existingPulse?.word || '' })
  const [winData,   setWinData]     = useState({ win: existingPulse?.win || '', challenge: existingPulse?.challenge || '', reframe: existingPulse?.reframe || '' })
  const [wheelData, setWheelData]   = useState(existingPulse?.wheel || {})
  const [intentData,setIntentData]  = useState({ intentionWord: existingPulse?.intentionWord || '', bigAction: existingPulse?.bigAction || '', beStatement: existingPulse?.beStatement || '' })

  function buildPulse(completed = false) {
    return {
      energy:        stateData.energy,
      word:          stateData.word,
      win:           winData.win,
      challenge:     winData.challenge,
      reframe:       winData.reframe,
      wheel:         wheelData,
      intentionWord: intentData.intentionWord,
      bigAction:     intentData.bigAction,
      beStatement:   intentData.beStatement,
      weekStar:      weekKey,
      ...(completed ? { completedAt: Date.now() } : {}),
    }
  }

  function savePulse(completed = false) {
    const pulse = buildPulse(completed)
    update('weeklyPulse', { ...weeklyPulse, [weekKey]: pulse })
  }

  function handleComplete() {
    savePulse(true)
    showToast(isAr ? '🌟 أحسنت! تم حفظ الفحص الأسبوعي' : '🌟 Weekly pulse saved!', 'gold')
  }

  const STEP_TITLES = isAr
    ? ['مرحباً', 'حالة الأسبوع', 'مراجعة التقدم', 'الانتصارات', 'عجلة الحياة', 'النية', 'الملخص']
    : ['Welcome', 'Week State', 'Progress', 'Wins', 'Wheel', 'Intention', 'Summary']

  return (
    <Layout
      title={isAr ? '📊 فحص النبض الأسبوعي' : '📊 Weekly Pulse'}
      subtitle={isAr ? `الأسبوع ${weekNumber} • ${weekDates}` : `Week ${weekNumber} • ${weekDates}`}
    >
      <div style={{ overflowY: 'auto', height: '100%', paddingBottom: 80 }}>

        {step > 0 && step < 6 && (
          <div style={{ padding: '8px 20px 0' }}>
            <StepDots total={6} current={step} />
          </div>
        )}

        {step === 0 && (
          <StepWelcome
            onStart={() => setStep(1)}
            isAr={isAr}
            weekNumber={weekNumber}
            weekDates={weekDates}
            lastPulseDays={lastPulseDays}
          />
        )}

        {step === 1 && (
          <StepState
            data={stateData}
            onChange={(k, v) => setStateData(prev => ({ ...prev, [k]: v }))}
            onNext={() => { savePulse(); setStep(2) }}
            isAr={isAr}
          />
        )}

        {step === 2 && (
          <StepProgress
            state={state}
            onNext={() => setStep(3)}
            isAr={isAr}
          />
        )}

        {step === 3 && (
          <StepWinChallenge
            data={winData}
            onChange={(k, v) => setWinData(prev => ({ ...prev, [k]: v }))}
            onNext={() => { savePulse(); setStep(4) }}
            isAr={isAr}
          />
        )}

        {step === 4 && (
          <StepWheel
            data={wheelData}
            onChange={(k, v) => setWheelData(prev => ({ ...prev, [k]: v }))}
            onNext={() => { savePulse(); setStep(5) }}
            isAr={isAr}
            lastWeekWheel={lastWeekWheel}
          />
        )}

        {step === 5 && (
          <StepIntention
            data={intentData}
            onChange={(k, v) => setIntentData(prev => ({ ...prev, [k]: v }))}
            onNext={() => { savePulse(); setStep(6) }}
            isAr={isAr}
          />
        )}

        {step === 6 && (
          <StepSummary
            pulse={buildPulse(false)}
            weekNumber={weekNumber}
            weekDates={weekDates}
            onComplete={handleComplete}
            isAr={isAr}
            pastPulses={weeklyPulse}
            similarWeek={similarWeek}
          />
        )}
      </div>
    </Layout>
  )
}
