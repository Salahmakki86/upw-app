/**
 * JourneyStageMap — Visual 4-stage transformation journey progress
 * Shows current stage, progress within stage, and what unlocks next.
 */
import { useMemo } from 'react'
import { Lock } from 'lucide-react'
import { STAGES, getStageProgress } from '../utils/featureUnlock'

const STAGE_TOOLS = {
  1: { ar: ['الصباح', 'المساء', 'الحالة', 'الامتنان', 'العادات', 'الانتصارات'],       en: ['Morning', 'Evening', 'State', 'Gratitude', 'Habits', 'Wins'] },
  2: { ar: ['الأهداف RPM', 'عجلة الحياة', 'المعتقدات', 'الترديدات', 'النوم', 'الرؤية'], en: ['Goals RPM', 'Wheel of Life', 'Beliefs', 'Incantations', 'Sleep', 'Vision'] },
  3: { ar: ['NAC', 'القيم', 'المستقبل', 'الخوف→قوة', 'الرؤية', 'السلوك'],              en: ['NAC', 'Values', 'Future', 'Fear→Power', 'Life Story', 'UPW'] },
  4: { ar: ['العلاقات', 'البروتوكول', 'موعد مع القدر', 'القوة الشخصية', 'النمذجة', 'كل شيء'], en: ['Relationships', 'Protocol', 'Destiny', 'Personal Power', 'Modeling', 'All Tools'] },
}

export default function JourneyStageMap({ state, isAr }) {
  const { tier, currentStage, nextStage, pct, remaining, count } = useMemo(
    () => getStageProgress(state),
    [state.morningLog, state.streak]
  )

  return (
    <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
          🗺 {isAr ? 'رحلة التحول' : 'Transformation Journey'}
        </span>
        <span className="text-xs font-bold" style={{ color: '#666' }}>
          {count} {isAr ? 'صباح مكتمل' : 'mornings done'}
        </span>
      </div>

      {/* Stage Timeline */}
      <div className="relative mb-5">
        {/* Connecting line */}
        <div style={{
          position: 'absolute', top: 20, left: 20, right: 20,
          height: 2, background: '#222', zIndex: 0,
        }} />
        {/* Progress line */}
        <div style={{
          position: 'absolute', top: 20, left: 20,
          width: `${((tier - 1) / 3) * 100}%`,
          height: 2,
          background: 'linear-gradient(90deg, #c9a84c, #e8c96a)',
          zIndex: 1,
          transition: 'width 0.8s ease',
        }} />

        {/* Stage dots */}
        <div className="flex justify-between relative" style={{ zIndex: 2 }}>
          {STAGES.map((s) => {
            const done = tier > s.stage
            const current = tier === s.stage
            return (
              <div key={s.stage} className="flex flex-col items-center gap-1.5" style={{ width: 52 }}>
                {/* Dot */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                  background: done ? s.color + '20' : current ? s.color + '15' : '#1a1a1a',
                  border: `2px solid ${done ? s.color : current ? s.color + '80' : '#2a2a2a'}`,
                  boxShadow: current ? `0 0 12px ${s.color}40` : 'none',
                  transition: 'all 0.4s ease',
                }}>
                  {done ? '✅' : current ? s.emoji : <Lock size={14} color="#444" />}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: 9, fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
                  color: done ? s.color : current ? s.color : '#444',
                }}>
                  {isAr ? s.labelAr : s.labelEn}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current stage details */}
      <div className="rounded-xl p-3 mb-3" style={{
        background: currentStage.color + '08',
        border: `1px solid ${currentStage.color}30`,
      }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold" style={{ color: currentStage.color }}>
            {currentStage.emoji} {isAr ? `المرحلة ${tier}: ${currentStage.labelAr}` : `Stage ${tier}: ${currentStage.labelEn}`}
          </p>
          {nextStage && (
            <span className="text-xs" style={{ color: '#555' }}>
              {pct}%
            </span>
          )}
        </div>

        {/* Progress bar within current stage */}
        {nextStage && (
          <div className="w-full rounded-full mb-2" style={{ height: 4, background: '#1a1a1a' }}>
            <div className="rounded-full transition-all duration-700" style={{
              height: 4,
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${currentStage.color}, ${nextStage.color})`,
            }} />
          </div>
        )}

        {/* Tools unlocked in current stage */}
        <div className="flex flex-wrap gap-1 mt-2">
          {(STAGE_TOOLS[tier]?.[isAr ? 'ar' : 'en'] || []).map((tool, i) => (
            <span key={i} className="text-xs rounded-full px-2 py-0.5 font-semibold" style={{
              background: currentStage.color + '12',
              color: currentStage.color,
              border: `1px solid ${currentStage.color}25`,
            }}>
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Next stage teaser */}
      {nextStage && remaining > 0 && (
        <div className="rounded-xl p-3 flex items-center gap-3" style={{
          background: '#111',
          border: '1px solid #1e1e1e',
        }}>
          <div style={{ fontSize: 24, filter: 'grayscale(0.6) opacity(0.5)' }}>{nextStage.emoji}</div>
          <div className="flex-1">
            <p className="text-xs font-bold" style={{ color: '#666' }}>
              {isAr ? `المرحلة التالية: ${nextStage.labelAr}` : `Next: ${nextStage.labelEn}`}
            </p>
            <p className="text-xs" style={{ color: '#444' }}>
              {isAr
                ? `${remaining} صباح${remaining === 1 ? '' : 'اً'} لفتح ${(STAGE_TOOLS[nextStage.stage]?.[isAr ? 'ar' : 'en'] || []).join('، ')}`
                : `${remaining} morning${remaining === 1 ? '' : 's'} to unlock ${(STAGE_TOOLS[nextStage.stage]?.en || []).join(', ')}`}
            </p>
          </div>
          <span style={{ color: '#333', fontSize: 16 }}>🔒</span>
        </div>
      )}

      {/* Maxed out */}
      {tier === 4 && (
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <p className="text-sm font-black" style={{ color: '#c9a84c' }}>
            🔥 {isAr ? 'كل شيء مفتوح — أنت محارب حقيقي!' : 'Everything unlocked — you\'re a true warrior!'}
          </p>
        </div>
      )}
    </div>
  )
}
