/**
 * StreakInsurance — Shows when streak was saved by insurance
 * Gold/green card with shield, bilingual text, dismiss button
 */
import { useLang } from '../context/LangContext'

export default function StreakInsurance({ onDismiss }) {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(46,204,113,0.08), rgba(201,168,76,0.08))',
        border: '1px solid rgba(46,204,113,0.25)',
        padding: '14px 16px',
        textAlign: isAr ? 'right' : 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>🛡️</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#2ecc71', marginBottom: 3 }}>
            {isAr ? 'تأمين السلسلة مُفعّل!' : 'Streak insurance activated!'}
          </p>
          <p style={{ fontSize: 11, fontWeight: 500, color: '#aaa', lineHeight: 1.5 }}>
            {isAr
              ? 'أكملت 5 من آخر 7 أيام — سلسلتك في أمان. فاتك يوم واحد لكنك لم تتوقف!'
              : 'You completed 5/7 days — your streak is safe. You missed a day but you didn\'t stop!'}
          </p>
        </div>
      </div>
      {onDismiss && (
        <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end', marginTop: 10 }}>
          <button
            onClick={onDismiss}
            className="transition-all active:scale-95"
            style={{
              fontSize: 10, fontWeight: 700,
              color: '#2ecc71',
              background: 'rgba(46,204,113,0.1)',
              border: '1px solid rgba(46,204,113,0.3)',
              borderRadius: 8,
              padding: '5px 14px',
              cursor: 'pointer',
            }}
          >
            {isAr ? 'فهمت ✓' : 'Got it ✓'}
          </button>
        </div>
      )}
    </div>
  )
}
