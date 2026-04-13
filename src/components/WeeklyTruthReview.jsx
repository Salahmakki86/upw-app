/**
 * Weekly Truth Review — Batch 3
 * Honest weekly assessment + patterns + week-over-week comparison
 */
import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import {
  generateWeeklyTruths,
  weekComparison,
  detectDayPatterns,
  detectSleepCorrelation,
  detectGoldenCombos,
  DAY_NAMES_AR,
  DAY_NAMES_EN,
} from '../utils/patternDetection'

function TruthBullet({ truth }) {
  const bgMap = {
    win: 'rgba(46,204,113,0.08)',
    good: 'rgba(201,168,76,0.08)',
    warn: 'rgba(243,156,18,0.08)',
    alert: 'rgba(230,57,70,0.08)',
  }
  const borderMap = {
    win: 'rgba(46,204,113,0.2)',
    good: 'rgba(201,168,76,0.2)',
    warn: 'rgba(243,156,18,0.2)',
    alert: 'rgba(230,57,70,0.2)',
  }
  return (
    <div
      className="flex items-start gap-3 rounded-xl p-3 transition-all"
      style={{ background: bgMap[truth.type], border: `1px solid ${borderMap[truth.type]}` }}
    >
      <span className="text-lg flex-shrink-0">{truth.emoji}</span>
      <p className="text-xs text-gray-300 leading-relaxed">{truth.text}</p>
    </div>
  )
}

function CompareBar({ label, current, previous, diff }) {
  const diffColor = diff > 0 ? '#2ecc71' : diff < 0 ? '#e63946' : '#888'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">{current}%</span>
          {diff !== 0 && (
            <span className="text-xs font-bold" style={{ color: diffColor }}>
              {diff > 0 ? '↑' : '↓'}{Math.abs(diff)}%
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 rounded-full overflow-hidden" style={{ background: '#222' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${current}%`, background: '#c9a84c' }} />
        </div>
      </div>
      <div className="flex gap-1 h-1">
        <div className="flex-1 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
          <div className="h-full rounded-full" style={{ width: `${previous}%`, background: '#555' }} />
        </div>
      </div>
    </div>
  )
}

export default function WeeklyTruthReview() {
  const { state } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const truths = useMemo(() => generateWeeklyTruths(state, isAr), [state, isAr])
  const comparison = useMemo(() => weekComparison(state), [state])
  const dayPatterns = useMemo(() => detectDayPatterns(state), [state])
  const sleepCorr = useMemo(() => detectSleepCorrelation(state), [state])
  const goldenCombos = useMemo(() => detectGoldenCombos(state), [state])

  const overallColor = comparison.diff.total > 5 ? '#2ecc71' : comparison.diff.total < -5 ? '#e63946' : '#c9a84c'
  const overallLabel = isAr
    ? (comparison.diff.total > 5 ? 'تحسّن!' : comparison.diff.total < -5 ? 'تراجع' : 'مستقر')
    : (comparison.diff.total > 5 ? 'Improving!' : comparison.diff.total < -5 ? 'Declining' : 'Stable')

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="rounded-2xl p-4" style={{
        background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.03))',
        border: '1px solid rgba(201,168,76,0.3)',
      }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="text-sm font-black text-[#c9a84c]">
              {isAr ? 'مراجعة حقيقة الأسبوع' : 'Weekly Truth Review'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: overallColor + '18', border: `1px solid ${overallColor}44` }}>
            <span className="text-xs font-bold" style={{ color: overallColor }}>
              {overallLabel}
            </span>
            <span className="text-xs font-black" style={{ color: overallColor }}>
              {comparison.diff.total > 0 ? '+' : ''}{comparison.diff.total}%
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {isAr ? 'الحقيقة وحدها تحررك — هذا ما يقوله بياناتك الأسبوعية' : 'Only the truth sets you free — here is what your weekly data says'}
        </p>
      </div>

      {/* Truth Bullets */}
      {truths.length > 0 && (
        <div className="space-y-2">
          {truths.map((t, i) => <TruthBullet key={i} truth={t} />)}
        </div>
      )}

      {/* Week-over-Week Comparison */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-[#c9a84c] uppercase tracking-wider">
            📊 {isAr ? 'مقارنة أسبوعية' : 'Week vs Week'}
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c9a84c]" />{isAr ? 'هذا' : 'This'}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#555]" />{isAr ? 'الماضي' : 'Last'}</span>
          </div>
        </div>
        <CompareBar label={isAr ? 'الروتين الصباحي' : 'Morning Ritual'} current={comparison.current.morning} previous={comparison.previous.morning} diff={comparison.diff.morning} />
        <CompareBar label={isAr ? 'العادات' : 'Habits'} current={comparison.current.habits} previous={comparison.previous.habits} diff={comparison.diff.habits} />
        <CompareBar label={isAr ? 'النوم ٧+' : 'Sleep 7+'} current={comparison.current.sleep} previous={comparison.previous.sleep} diff={comparison.diff.sleep} />
        <CompareBar label={isAr ? 'الامتنان' : 'Gratitude'} current={comparison.current.gratitude} previous={comparison.previous.gratitude} diff={comparison.diff.gratitude} />
      </div>

      {/* Pattern Insights */}
      {(dayPatterns || sleepCorr || goldenCombos) && (
        <div className="rounded-2xl p-4 space-y-3" style={{ background: '#0e0e0e', border: '1px solid rgba(147,112,219,0.2)' }}>
          <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#9370db' }}>
            🔍 {isAr ? 'أنماط مكتشفة' : 'Discovered Patterns'}
          </p>

          {/* Day-of-week pattern */}
          {dayPatterns && (
            <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #222' }}>
              <p className="text-xs text-gray-300">
                📅 {isAr
                  ? `أفضل يوم: ${DAY_NAMES_AR[dayPatterns.best.dow]} (${dayPatterns.best.avg}) — أضعف يوم: ${DAY_NAMES_AR[dayPatterns.worst.dow]} (${dayPatterns.worst.avg})`
                  : `Best day: ${DAY_NAMES_EN[dayPatterns.best.dow]} (${dayPatterns.best.avg}) — Worst: ${DAY_NAMES_EN[dayPatterns.worst.dow]} (${dayPatterns.worst.avg})`}
              </p>
            </div>
          )}

          {/* Sleep correlation */}
          {sleepCorr && (
            <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #222' }}>
              <p className="text-xs text-gray-300">
                😴 {isAr
                  ? `نوم ٧+ ساعات = ${sleepCorr.goodSleepExecRate}% تنفيذ ← نوم أقل = ${sleepCorr.poorSleepExecRate}% فقط (فرق ${sleepCorr.diff}%!)`
                  : `7+ hours sleep = ${sleepCorr.goodSleepExecRate}% execution → Less sleep = ${sleepCorr.poorSleepExecRate}% only (${sleepCorr.diff}% difference!)`}
              </p>
            </div>
          )}

          {/* Golden combos */}
          {goldenCombos && goldenCombos.length > 0 && (
            <div className="rounded-xl p-3 space-y-2" style={{ background: '#111', border: '1px solid #222' }}>
              <p className="text-xs font-bold" style={{ color: '#c9a84c' }}>
                ✨ {isAr ? 'التركيبات الذهبية في أفضل أيامك:' : 'Golden combos on your best days:'}
              </p>
              {goldenCombos.map((combo, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span>{combo.combo[0].emoji} + {combo.combo[1].emoji}</span>
                  <span className="text-gray-400">
                    {isAr ? combo.combo[0].ar : combo.combo[0].en} + {isAr ? combo.combo[1].ar : combo.combo[1].en}
                  </span>
                  <span className="font-bold" style={{ color: '#c9a84c' }}>({combo.pct}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
