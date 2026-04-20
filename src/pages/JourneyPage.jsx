/**
 * JourneyPage — A1 90-Day Transformation Journey
 *
 * Chapters: Foundations (1-30) → Discovery (31-60) → Mastery (61-90)
 * Each day has a PRIMARY task + optional routes + possible milestone.
 *
 * If not active: invitation card to begin.
 * If active: today's primary task, chapter progress, optional routes, upcoming milestones.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import {
  CHAPTERS,
  computeCurrentDay,
  getCurrentChapter,
  getJourneyProgress,
  isTodayComplete,
  chapterProgress,
  getTodayPlan,
  DAY_PLAN,
} from '../utils/journeyEngine'

export default function JourneyPage() {
  const { state, startJourney90, completeJourneyDay } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const j = state.journey90 || {}

  if (!j.active) return <JourneyInvitation startJourney90={startJourney90} isAr={isAr} showToast={showToast} />

  const day = computeCurrentDay(state)
  const chapter = getCurrentChapter(state)
  const progress = getJourneyProgress(state)
  const todayDone = isTodayComplete(state)
  const ch = chapterProgress(state)
  const plan = getTodayPlan(state)

  const handleComplete = () => {
    completeJourneyDay(day)
    showToast(isAr ? `🎉 اليوم ${day} مكتمل` : `🎉 Day ${day} complete`, 'success', 2000)
  }

  // Upcoming milestones (next 5)
  const upcoming = useMemo(() => {
    const list = []
    for (let d = day + 1; d <= 90 && list.length < 5; d++) {
      if (DAY_PLAN[d]?.milestone) list.push({ day: d, milestone: DAY_PLAN[d].milestone })
    }
    return list
  }, [day])

  return (
    <Layout
      title={isAr ? '🧭 رحلة التحوّل — 90 يوم' : '🧭 90-Day Transformation'}
      subtitle={isAr ? `اليوم ${day} من 90` : `Day ${day} of 90`}
    >
      <div className="space-y-4 pt-2">

        {/* Hero: current chapter + day */}
        <div className="rounded-2xl p-5" style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.02))',
          border: '1px solid rgba(201,168,76,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 40, lineHeight: 1 }}>{chapter.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.1em' }}>
                {isAr ? 'الفصل' : 'CHAPTER'}
              </p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>
                {isAr ? chapter.titleAr : chapter.titleEn}
              </h2>
              <p style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>
                {isAr ? chapter.descAr : chapter.descEn}
              </p>
            </div>
            <div style={{
              width: 54, height: 54, borderRadius: '50%',
              background: `conic-gradient(#c9a84c ${progress * 3.6}deg, #1a1a1a 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 4, borderRadius: '50%', background: '#0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 900, color: '#c9a84c',
              }}>{progress}%</div>
            </div>
          </div>

          {/* Chapter progress bar */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', marginBottom: 4 }}>
              <span>{isAr ? 'تقدم الفصل' : 'Chapter Progress'}</span>
              <span>{ch.done}/{ch.total}</span>
            </div>
            <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(ch.done / ch.total) * 100}%`,
                background: 'linear-gradient(90deg, #c9a84c, #e5c670)',
                transition: 'width 0.6s',
              }}/>
            </div>
          </div>
        </div>

        {/* Today's primary task */}
        {plan && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em' }}>
                  {isAr ? 'مهمة اليوم' : "TODAY'S PRIMARY"}
                </p>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 4 }}>
                  {plan.primary.emoji} {isAr ? plan.primary.labelAr : plan.primary.labelEn}
                </h3>
              </div>
              {todayDone && (
                <span style={{
                  fontSize: 10, fontWeight: 900, color: '#2ecc71',
                  background: 'rgba(46,204,113,0.15)', padding: '4px 10px', borderRadius: 8,
                  border: '1px solid rgba(46,204,113,0.3)',
                }}>
                  {isAr ? 'مكتمل ✓' : 'Complete ✓'}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to={plan.primary.path}
                className="flex-1 rounded-xl text-center py-2.5 text-xs font-bold transition-all active:scale-[0.97]"
                style={{
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid rgba(201,168,76,0.35)',
                  color: '#c9a84c', textDecoration: 'none',
                }}
              >
                {isAr ? 'اذهب للمهمة' : 'Open Task'} →
              </Link>
              {!todayDone && (
                <button
                  onClick={handleComplete}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.97]"
                  style={{
                    background: 'rgba(46,204,113,0.15)',
                    border: '1px solid rgba(46,204,113,0.3)',
                    color: '#2ecc71',
                  }}
                >
                  ✓ {isAr ? 'أكملت' : 'Done'}
                </button>
              )}
            </div>

            {/* Milestone */}
            {plan.milestone && (
              <div style={{
                marginTop: 14, padding: '10px 14px', borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.04))',
                border: '1px solid rgba(201,168,76,0.4)',
              }}>
                <p style={{ fontSize: 9, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.1em' }}>
                  {isAr ? '✨ محطة خاصة' : '✨ MILESTONE'}
                </p>
                <Link
                  to={plan.milestone.path}
                  style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 4, display: 'block', textDecoration: 'none' }}
                >
                  {plan.milestone.emoji} {isAr ? plan.milestone.ar : plan.milestone.en} →
                </Link>
              </div>
            )}

            {/* Optional routes */}
            {plan.optional?.length > 0 && (
              <>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#888', marginTop: 14, marginBottom: 6 }}>
                  {isAr ? 'اختياري — مكافآت' : 'Optional bonuses'}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {plan.optional.map((o, i) => (
                    <Link
                      key={i}
                      to={o.path}
                      className="rounded-lg transition-all"
                      style={{
                        padding: '6px 10px',
                        background: '#141414',
                        border: '1px solid #222',
                        fontSize: 10, color: '#bbb',
                        textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      {o.emoji} {isAr ? o.labelAr : o.labelEn}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Chapters roadmap */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 12 }}>
            {isAr ? '🗺 خريطة الفصول' : '🗺 Chapter Map'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CHAPTERS.map(c => {
              const isCurrent = c.id === chapter.id
              const isDone = day > c.endDay
              return (
                <div key={c.id} style={{
                  padding: '10px 12px', borderRadius: 12,
                  background: isCurrent ? 'rgba(201,168,76,0.08)' : '#141414',
                  border: `1px solid ${isCurrent ? 'rgba(201,168,76,0.3)' : '#222'}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>{c.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: isDone ? '#888' : '#fff' }}>
                      {isAr ? c.titleAr : c.titleEn}
                    </p>
                    <p style={{ fontSize: 10, color: '#777' }}>
                      {isAr ? `أيام ${c.startDay}-${c.endDay}` : `Days ${c.startDay}-${c.endDay}`}
                    </p>
                  </div>
                  {isDone && <span style={{ fontSize: 12, color: '#2ecc71' }}>✓</span>}
                  {isCurrent && !isDone && (
                    <span style={{
                      fontSize: 9, fontWeight: 900, color: '#c9a84c',
                      background: 'rgba(201,168,76,0.15)', padding: '2px 8px', borderRadius: 6,
                    }}>
                      {isAr ? 'الآن' : 'NOW'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming milestones */}
        {upcoming.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 10 }}>
              {isAr ? '🎯 محطات قادمة' : '🎯 Upcoming Milestones'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.map(u => (
                <div key={u.day} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 10px', borderRadius: 8, background: '#141414',
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, color: '#c9a84c',
                    width: 36, textAlign: 'center',
                  }}>
                    {isAr ? `يوم ${u.day}` : `D${u.day}`}
                  </span>
                  <span style={{ fontSize: 14 }}>{u.milestone.emoji}</span>
                  <span style={{ fontSize: 11, color: '#ddd', flex: 1 }}>
                    {isAr ? u.milestone.ar : u.milestone.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}

function JourneyInvitation({ startJourney90, isAr, showToast }) {
  return (
    <Layout
      title={isAr ? '🧭 رحلة التحوّل' : '🧭 Transformation Journey'}
      subtitle={isAr ? '90 يوم لبناء نسخة جديدة منك' : '90 days to build a new you'}
    >
      <div className="space-y-4 pt-4">
        <div className="rounded-2xl p-6 text-center" style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.02))',
          border: '1px solid rgba(201,168,76,0.3)',
        }}>
          <div style={{ fontSize: 56 }}>🧭</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 12 }}>
            {isAr ? 'ابدأ رحلتك' : 'Begin Your Journey'}
          </h2>
          <p style={{ fontSize: 12, color: '#bbb', marginTop: 8, lineHeight: 1.6, maxWidth: 320, marginInline: 'auto' }}>
            {isAr
              ? 'تسعون يوماً من الممارسة المتدرجة — 3 فصول، 90 مهمة، 15 محطة تخرج. كل يوم مهمة أساسية + مكافآت اختيارية.'
              : '90 days of progressive practice — 3 chapters, 90 tasks, 15 milestone days. Every day: one core task + bonuses.'}
          </p>
        </div>

        {/* Chapter preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHAPTERS.map(c => (
            <div key={c.id} className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{c.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                    {isAr ? c.titleAr : c.titleEn}
                  </p>
                  <p style={{ fontSize: 10, color: '#888' }}>
                    {isAr ? `أيام ${c.startDay}-${c.endDay}` : `Days ${c.startDay}-${c.endDay}`}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 8, lineHeight: 1.5 }}>
                {isAr ? c.descAr : c.descEn}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            startJourney90()
            showToast(isAr ? '🚀 انطلقت الرحلة!' : '🚀 Journey begins!', 'success', 2000)
          }}
          className="w-full rounded-xl py-4 text-sm font-bold transition-all active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #c9a84c, #e5c670)',
            color: '#000',
            boxShadow: '0 8px 24px rgba(201,168,76,0.3)',
          }}
        >
          {isAr ? '🚀 ابدأ اليوم الأول' : '🚀 Start Day 1'}
        </button>
      </div>
    </Layout>
  )
}
