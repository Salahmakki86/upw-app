import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'
import { BookOpen, CheckCircle2, Circle, Lightbulb, RefreshCw, ArrowRight } from 'lucide-react'

const DISEMPOWERING_TEMPLATES = {
  ar: [
    'ظروفي منعتني من النجاح',
    'لم يؤمن بي أحد',
    'ارتكبت أخطاء لا يمكن إصلاحها',
    'ليس لدي الموارد الكافية',
    'فات الأوان عليّ',
  ],
  en: [
    'My circumstances prevented my success',
    'Nobody believed in me',
    'I made mistakes I can\'t undo',
    'I don\'t have enough resources',
    'It\'s too late for me',
  ],
}

const REFRAME_QUESTIONS = [
  {
    ar: 'ما الذي تعلمته من هذه التجربة بالضبط؟',
    en: 'What exactly did you learn from this experience?',
    placeholder_ar: 'اكتب ما تعلمته...',
    placeholder_en: 'Write what you learned...',
    key: 'q1',
  },
  {
    ar: 'كيف جعلك هذا أقوى أو أحكم؟',
    en: 'How did this make you stronger or wiser?',
    placeholder_ar: 'كيف نمت بسبب هذا؟',
    placeholder_en: 'How did you grow from this?',
    key: 'q2',
  },
  {
    ar: 'من كنت ستكون لو لم تمر بهذه التجربة؟',
    en: 'Who would you be if you hadn\'t gone through this?',
    placeholder_ar: 'تأمل الشخص الذي كنته لو لم تمر بهذا...',
    placeholder_en: 'Reflect on who you\'d be without this experience...',
    key: 'q3',
  },
]

const INSPIRING_REFRAMES = [
  {
    person: 'Tony Robbins',
    emoji: '🔥',
    old_ar:  'طفولة مليئة بالإساءة والفقر وعدم الاستقرار',
    old_en:  'An abusive childhood filled with poverty and instability',
    new_ar:  'تلك التجربة أصبحت وقود يدفعه لمساعدة الملايين حول العالم على تحويل حياتهم',
    new_en:  'That experience became the fuel driving him to help millions around the world transform their lives',
  },
  {
    person: 'Oprah Winfrey',
    emoji: '⭐',
    old_ar:  'فقر مدقع وصدمات متكررة في طفولة قاسية',
    old_en:  'Extreme poverty and repeated trauma through a harsh childhood',
    new_ar:  'ألمها عمّق تعاطفها حتى أصبحت أكثر الشخصيات الإعلامية تأثيراً في العالم',
    new_en:  'Her pain deepened her empathy until she became the most influential media personality in the world',
  },
  {
    person: 'Nelson Mandela',
    emoji: '✊',
    old_ar:  '27 سنة في السجن ظلماً وبعيداً عن كل ما يحب',
    old_en:  '27 years imprisoned unjustly, far from everyone he loved',
    new_ar:  'خرج بلا مرارة، وحوّل معاناته إلى حرية لشعب بأكمله وإرث يخلد إلى الأبد',
    new_en:  'He emerged with no bitterness, transforming his suffering into freedom for an entire people and an eternal legacy',
  },
]

const DEFAULT_STORY = {
  currentStory: '',
  template: '',
  q1: '',
  q2: '',
  q3: '',
  newStory: '',
  committed: false,
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function LifeStoryReframing() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const saved = state.lifeStory || DEFAULT_STORY

  function patchStory(patch) {
    update('lifeStory', { ...saved, ...patch })
  }

  function selectTemplate(tpl) {
    patchStory({ template: tpl, currentStory: tpl })
    showToast(isAr ? 'تم اختيار النموذج' : 'Template selected', 'info')
  }

  const newStoryWords  = useMemo(() => wordCount(saved.newStory), [saved.newStory])
  const oldStoryFilled = saved.currentStory.trim().length > 20
  const newStoryFilled = saved.newStory.trim().length > 20

  const templates = isAr ? DISEMPOWERING_TEMPLATES.ar : DISEMPOWERING_TEMPLATES.en

  return (
    <Layout
      title={isAr ? 'إعادة صياغة القصة' : 'Life Story Reframing'}
      subtitle={isAr ? 'قصتك عن الماضي تحدد ما تعتقد أنه ممكن — غيّرها وستغير مسار حياتك' : 'Your story about the past determines what you believe is possible — change it and you change your life'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ===== SECTION 1 — CURRENT STORY ===== */}
        <div className="card" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '1.5rem' }}>
          <h2 style={{ color: '#c9a84c', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {isAr ? '📖 قصتك الحالية' : '📖 Your Current Story'}
          </h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {isAr
              ? 'ما القصة المقيّدة التي تكررها على نفسك؟ اختر نموذجاً أو اكتب بنفسك'
              : 'What is the disempowering story you keep repeating to yourself? Pick a template or write your own'}
          </p>

          {/* Template chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {templates.map((tpl, i) => {
              const active = saved.template === tpl
              return (
                <button
                  key={i}
                  onClick={() => selectTemplate(tpl)}
                  style={{
                    background: active ? 'rgba(231,76,60,0.12)' : 'rgba(255,255,255,0.04)',
                    border: active ? '1px solid rgba(231,76,60,0.4)' : '1px solid #2a2a2a',
                    borderRadius: 20, padding: '0.4rem 0.9rem',
                    cursor: 'pointer', color: active ? '#e74c3c' : '#aaa', fontSize: '0.82rem',
                    transition: 'all 0.15s', textAlign: 'start',
                  }}
                >
                  {tpl}
                </button>
              )
            })}
          </div>

          <textarea
            className="input-dark"
            rows={4}
            value={saved.currentStory}
            onChange={e => patchStory({ currentStory: e.target.value, template: '' })}
            placeholder={
              isAr
                ? 'اكتب قصتك المقيّدة هنا... ما الذي قلته لنفسك مراراً حول لماذا لا تستطيع أو لماذا لم تنجح؟'
                : 'Write your disempowering story here... What have you been telling yourself about why you can\'t or haven\'t succeeded?'
            }
            style={{ width: '100%', resize: 'vertical', borderRadius: 10 }}
          />
        </div>

        {/* ===== SECTION 2 — DEEPER TRUTH ===== */}
        <div className="card" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '1.5rem' }}>
          <h2 style={{ color: '#c9a84c', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {isAr ? '🔍 الحقيقة الأعمق' : '🔍 The Deeper Truth'}
          </h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {isAr
              ? 'أجب على هذه الأسئلة بصدق — هي تكشف ما صنعته تجربتك بالفعل'
              : 'Answer these questions honestly — they reveal what your experience actually made of you'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {REFRAME_QUESTIONS.map((q, idx) => (
              <div key={q.key}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#c9a84c', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: 1,
                  }}>
                    {idx + 1}
                  </div>
                  <p style={{ color: '#ddd', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                    {isAr ? q.ar : q.en}
                  </p>
                </div>
                <textarea
                  className="input-dark"
                  rows={3}
                  value={saved[q.key] || ''}
                  onChange={e => patchStory({ [q.key]: e.target.value })}
                  placeholder={isAr ? q.placeholder_ar : q.placeholder_en}
                  style={{ width: '100%', resize: 'vertical', borderRadius: 10 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ===== SECTION 3 — NEW STORY ===== */}
        <div className="card" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '1.5rem' }}>
          <h2 style={{ color: '#c9a84c', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {isAr ? '✨ القصة الجديدة' : '✨ The New Story'}
          </h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {isAr ? 'اكتب النسخة المُمكِّنة من قصتك' : 'Write the empowering version of your story'}
          </p>

          {/* Starter phrase */}
          <div
            style={{
              background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}
          >
            <Lightbulb size={16} color="#c9a84c" style={{ flexShrink: 0 }} />
            <p style={{ color: '#c9a84c', fontSize: '0.9rem', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>
              {isAr ? '"هذه التجربة علّمتني أن..."' : '"This experience taught me that..."'}
            </p>
          </div>

          <textarea
            className="input-dark"
            rows={5}
            value={saved.newStory}
            onChange={e => patchStory({ newStory: e.target.value })}
            placeholder={
              isAr
                ? 'ابدأ بـ "هذه التجربة علّمتني أن..." — اكتب قصتك الجديدة المُمكِّنة بحرية...'
                : 'Start with "This experience taught me that..." — freely write your new empowering story...'
            }
            style={{ width: '100%', resize: 'vertical', borderRadius: 10 }}
          />

          {/* Word count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
            <span style={{
              color: newStoryWords >= 50 ? '#2ecc71' : '#888',
              fontSize: '0.8rem',
            }}>
              {newStoryWords} {isAr ? 'كلمة' : 'words'}
              {newStoryWords < 50 && (
                <span style={{ color: '#555' }}>
                  {' '}— {isAr ? `${50 - newStoryWords} كلمة للهدف` : `${50 - newStoryWords} more to reach goal`}
                </span>
              )}
            </span>
            {newStoryWords >= 50 && (
              <span style={{ color: '#2ecc71', fontSize: '0.8rem', fontWeight: 600 }}>
                ✓ {isAr ? 'قصة كاملة!' : 'Full story!'}
              </span>
            )}
          </div>

          <div style={{ height: '0.25rem', background: '#1e1e1e', borderRadius: 4, marginTop: '0.5rem', overflow: 'hidden' }}>
            <div
              className="progress-bar-bg"
              style={{ height: '100%', background: 'transparent' }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min((newStoryWords / 50) * 100, 100)}%`,
                  background: newStoryWords >= 50
                    ? 'linear-gradient(90deg, #2ecc71, #27ae60)'
                    : 'linear-gradient(90deg, #c9a84c, #a88930)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Commitment checkbox */}
          <button
            onClick={() => patchStory({ committed: !saved.committed })}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem',
            }}
          >
            {saved.committed
              ? <CheckCircle2 size={22} color="#c9a84c" />
              : <Circle size={22} color="#444" />
            }
            <span style={{ color: saved.committed ? '#c9a84c' : '#888', fontSize: '0.9rem', textAlign: 'start' }}>
              {isAr
                ? 'أتعهد أن أحكي هذه القصة بدلاً من القديمة — تعهد القصة الجديدة'
                : 'I commit to telling this story instead of the old one — New Story Pledge'}
            </span>
          </button>

          {saved.committed && (
            <div
              style={{
                marginTop: '0.75rem',
                background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 10, padding: '0.75rem 1rem', color: '#c9a84c', fontSize: '0.85rem',
              }}
            >
              {isAr
                ? '🎉 تعهدت بقصتك الجديدة. في كل مرة تُخبر فيها القصة القديمة، تذكر هذا التعهد.'
                : '🎉 You\'ve pledged your new story. Every time the old story surfaces, remember this commitment.'}
            </div>
          )}
        </div>

        {/* ===== SECTION 4 — TRANSFORMATION SUMMARY ===== */}
        {oldStoryFilled && newStoryFilled && (
          <div className="card" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '1.5rem' }}>
            <h2 style={{ color: '#c9a84c', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              {isAr ? '🔄 خلاصة التحول' : '🔄 Transformation Summary'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Old story card */}
              <div style={{
                background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.15)',
                borderRadius: 12, padding: '1rem',
              }}>
                <p style={{ color: '#e74c3c', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {isAr ? 'القصة القديمة' : 'Old Story'}
                </p>
                <p style={{
                  color: '#888', fontSize: '0.9rem', lineHeight: 1.6, margin: 0,
                  textDecoration: 'line-through', opacity: 0.7,
                }}>
                  {saved.currentStory.slice(0, 100)}{saved.currentStory.length > 100 ? '...' : ''}
                </p>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isAr
                    ? <ArrowRight size={18} color="#c9a84c" style={{ transform: 'rotate(180deg)' }} />
                    : <ArrowRight size={18} color="#c9a84c" />
                  }
                </div>
              </div>

              {/* New story card */}
              <div style={{
                background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)',
                borderRadius: 12, padding: '1rem',
                boxShadow: '0 0 16px rgba(201,168,76,0.06)',
              }}>
                <p style={{ color: '#c9a84c', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {isAr ? 'القصة الجديدة' : 'New Story'}
                </p>
                <p style={{ color: '#fff', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                  {saved.newStory.slice(0, 100)}{saved.newStory.length > 100 ? '...' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== SECTION 5 — INSPIRING REFRAMES ===== */}
        <div className="card" style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '1.5rem' }}>
          <h2 style={{ color: '#c9a84c', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {isAr ? '🌟 قصص مُلهِمة' : '🌟 Inspiring Reframes'}
          </h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {isAr
              ? 'أناس غيروا قصصهم وغيروا العالم'
              : 'People who changed their story and changed the world'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {INSPIRING_REFRAMES.map((story, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)',
                  borderRadius: 14, padding: '1.1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{story.emoji}</span>
                  <span style={{ color: '#c9a84c', fontWeight: 700, fontSize: '1rem' }}>{story.person}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {/* Old */}
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={{
                      background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.2)',
                      borderRadius: 6, padding: '0.15rem 0.5rem', color: '#e74c3c',
                      fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: 3,
                      textTransform: 'uppercase',
                    }}>
                      {isAr ? 'قبل' : 'BEFORE'}
                    </span>
                    <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                      {isAr ? story.old_ar : story.old_en}
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'rgba(201,168,76,0.1)', margin: '0.1rem 0' }} />

                  {/* New */}
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={{
                      background: 'rgba(46,204,113,0.12)', border: '1px solid rgba(46,204,113,0.2)',
                      borderRadius: 6, padding: '0.15rem 0.5rem', color: '#2ecc71',
                      fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: 3,
                      textTransform: 'uppercase',
                    }}>
                      {isAr ? 'بعد' : 'AFTER'}
                    </span>
                    <p style={{ color: '#ddd', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                      {isAr ? story.new_ar : story.new_en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tony quote */}
          <div
            style={{
              marginTop: '1.25rem',
              background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: 12, padding: '1rem',
              display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            }}
          >
            <BookOpen size={18} color="#c9a84c" style={{ flexShrink: 0, marginTop: 3 }} />
            <p style={{ color: '#ccc', fontSize: '0.88rem', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
              {isAr
                ? '"إذا غيرت قصتك، ستغير حياتك." — توني روبنز'
                : '"If you change your story, you will change your life." — Tony Robbins'}
            </p>
          </div>
        </div>

      </div>
    </Layout>
  )
}
