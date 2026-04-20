/**
 * ChallengeLibraryPage — A7 Challenge Marketplace
 *
 * User picks from 12 curated multi-day challenges. Tracks daily progress
 * through state.challengeMarketplace.accepted[].progress.
 */
import { useState } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { CHALLENGES, isChallengeAccepted, getChallengeProgress } from '../utils/challengeLibrary'

const CATS = [
  { id: 'all',        ar: 'الكل', en: 'All' },
  { id: 'discipline', ar: 'انضباط', en: 'Discipline' },
  { id: 'mindset',    ar: 'عقلية', en: 'Mindset' },
  { id: 'health',     ar: 'صحة', en: 'Health' },
  { id: 'identity',   ar: 'هوية', en: 'Identity' },
  { id: 'relationships', ar: 'علاقات', en: 'Relationships' },
  { id: 'finances',   ar: 'مالية', en: 'Finances' },
  { id: 'career',     ar: 'مهني', en: 'Career' },
  { id: 'learning',   ar: 'تعلّم', en: 'Learning' },
  { id: 'celebration',ar: 'احتفال', en: 'Celebration' },
]

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export default function ChallengeLibraryPage() {
  const { state, acceptMarketChallenge, updateMarketChallenge, completeMarketChallenge } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const [category, setCategory] = useState('all')
  const today = todayStr()

  const filtered = category === 'all'
    ? CHALLENGES
    : CHALLENGES.filter(c => c.category === category)

  const accepted = (state.challengeMarketplace?.accepted) || []
  const completed = (state.challengeMarketplace?.completed) || []

  const accept = (ch) => {
    if (isChallengeAccepted(state, ch.id)) return
    acceptMarketChallenge({ challengeId: ch.id, emoji: ch.emoji })
    showToast(isAr ? 'قبلت التحدي 🎯' : 'Challenge accepted 🎯', 'success', 1500)
  }

  const markToday = (challengeId) => {
    const current = accepted.find(a => a.challengeId === challengeId)
    if (!current) return
    const progress = { ...(current.progress || {}), [today]: true }
    updateMarketChallenge(challengeId, { progress })
    showToast(isAr ? '✓ يوم اليوم' : '✓ Today done', 'success', 1200)
  }

  const finish = (challengeId) => {
    completeMarketChallenge(challengeId)
    showToast(isAr ? '🏆 اكتمل التحدي!' : '🏆 Challenge complete!', 'success', 1800)
  }

  return (
    <Layout
      title={isAr ? '🗺 سوق التحديات' : '🗺 Challenge Library'}
      subtitle={isAr ? 'تحديات مُعدّة لتغيير حياتك' : 'Curated challenges to change your life'}
    >
      <div className="space-y-4 pt-2">

        {/* Active challenges */}
        {accepted.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 8 }}>
              {isAr ? `🔥 نشطة (${accepted.length})` : `🔥 Active (${accepted.length})`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {accepted.map(a => {
                const ch = CHALLENGES.find(c => c.id === a.challengeId)
                if (!ch) return null
                const progress = getChallengeProgress(state, ch.id)
                const doneToday = !!(a.progress || {})[today]
                const isComplete = progress.daysDone >= progress.daysTotal
                return (
                  <div key={ch.id} className="rounded-2xl p-4" style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)',
                    border: '1px solid rgba(201,168,76,0.3)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{ch.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>
                          {isAr ? ch.titleAr : ch.titleEn}
                        </p>
                        <p style={{ fontSize: 10, color: '#888' }}>
                          {isAr ? `اليوم ${progress.daysDone}/${progress.daysTotal}` : `Day ${progress.daysDone}/${progress.daysTotal}`}
                        </p>
                      </div>
                      <div style={{ minWidth: 40, fontSize: 11, fontWeight: 900, color: '#c9a84c' }}>
                        {progress.pct}%
                      </div>
                    </div>
                    <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${progress.pct}%`,
                        background: 'linear-gradient(90deg, #c9a84c, #e5c670)', transition: 'width 0.4s',
                      }}/>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      {!doneToday && !isComplete && (
                        <button
                          onClick={() => markToday(ch.id)}
                          className="flex-1 rounded-lg py-2 text-xs font-bold"
                          style={{
                            background: 'rgba(46,204,113,0.15)',
                            border: '1px solid rgba(46,204,113,0.3)',
                            color: '#2ecc71',
                          }}
                        >
                          {isAr ? '✓ اليوم تم' : '✓ Today done'}
                        </button>
                      )}
                      {doneToday && !isComplete && (
                        <span className="flex-1 rounded-lg py-2 text-xs font-bold text-center"
                          style={{
                            background: 'rgba(46,204,113,0.08)',
                            border: '1px solid rgba(46,204,113,0.2)',
                            color: '#2ecc71',
                          }}
                        >
                          ✓ {isAr ? 'سجّلت اليوم' : 'Logged today'}
                        </span>
                      )}
                      {isComplete && (
                        <button
                          onClick={() => finish(ch.id)}
                          className="flex-1 rounded-lg py-2 text-xs font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #c9a84c, #e5c670)',
                            color: '#000',
                          }}
                        >
                          🏆 {isAr ? 'أنهِ التحدي' : 'Finish Challenge'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATS.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap flex-shrink-0"
              style={{
                background: category === cat.id ? 'rgba(201,168,76,0.15)' : '#141414',
                border: `1px solid ${category === cat.id ? 'rgba(201,168,76,0.4)' : '#222'}`,
                color: category === cat.id ? '#c9a84c' : '#888',
              }}
            >{isAr ? cat.ar : cat.en}</button>
          ))}
        </div>

        {/* Library grid */}
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(ch => {
            const accepted = isChallengeAccepted(state, ch.id)
            return (
              <div key={ch.id} className="rounded-2xl p-4" style={{
                background: '#0e0e0e', border: '1px solid #1e1e1e',
                opacity: accepted ? 0.6 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28,
                  }}>{ch.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                      {isAr ? ch.titleAr : ch.titleEn}
                    </p>
                    <p style={{ fontSize: 10, color: '#888', marginTop: 4, lineHeight: 1.4 }}>
                      {isAr ? ch.descAr : ch.descEn}
                    </p>
                  </div>
                </div>
                {!accepted ? (
                  <button
                    onClick={() => accept(ch)}
                    className="w-full mt-3 rounded-lg py-2 text-xs font-bold"
                    style={{
                      background: 'rgba(201,168,76,0.12)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      color: '#c9a84c',
                    }}
                  >
                    🎯 {isAr ? 'قبول التحدي' : 'Accept Challenge'}
                  </button>
                ) : (
                  <div className="mt-3 text-center text-xs" style={{ color: '#666' }}>
                    ✓ {isAr ? 'نشط' : 'Active'}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Completed history */}
        {completed.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 8 }}>
              {isAr ? `🏆 أُنهيت (${completed.length})` : `🏆 Completed (${completed.length})`}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {completed.map((c, i) => {
                const ch = CHALLENGES.find(x => x.id === c.challengeId)
                if (!ch) return null
                return (
                  <div key={c.challengeId + i} style={{
                    padding: '8px 10px', background: '#141414',
                    border: '1px solid #222', borderRadius: 8,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>{ch.emoji}</span>
                    <span style={{ flex: 1, fontSize: 11, color: '#ddd' }}>
                      {isAr ? ch.titleAr : ch.titleEn}
                    </span>
                    <span style={{ fontSize: 16, color: '#2ecc71' }}>✓</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
