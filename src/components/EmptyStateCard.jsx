/**
 * EmptyStateCard — Reusable empty-state coaching card
 *
 * Instead of blank sections saying "No data", this tells the user
 * why it matters, what to do next, and links directly to the starter action.
 *
 * Usage:
 *   <EmptyStateCard
 *     emoji="🎯"
 *     titleAr="..."  titleEn="..."
 *     bodyAr="..."   bodyEn="..."
 *     ctaAr="..."    ctaEn="..."
 *     ctaPath="/goals"
 *   />
 */
import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'

export default function EmptyStateCard({
  emoji = '✨',
  titleAr, titleEn,
  bodyAr, bodyEn,
  ctaAr, ctaEn,
  ctaPath,
  ctaOnClick,
  accentColor = '#c9a84c',
  compact = false,
}) {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const content = (
    <div
      className="rounded-2xl transition-all"
      style={{
        padding: compact ? '14px 14px' : '20px 18px',
        background: `linear-gradient(135deg, ${accentColor}08, transparent)`,
        border: `1px dashed ${accentColor}40`,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: compact ? 32 : 44, lineHeight: 1, marginBottom: 8 }}>{emoji}</div>
      {(titleAr || titleEn) && (
        <h3 style={{
          fontSize: compact ? 13 : 15, fontWeight: 900,
          color: accentColor, marginBottom: 6,
        }}>
          {isAr ? titleAr : titleEn}
        </h3>
      )}
      {(bodyAr || bodyEn) && (
        <p style={{
          fontSize: compact ? 10 : 12,
          color: '#aaa', lineHeight: 1.5, marginBottom: (ctaAr || ctaEn) ? 14 : 0,
          maxWidth: 320, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {isAr ? bodyAr : bodyEn}
        </p>
      )}
      {(ctaAr || ctaEn) && (
        <div
          role={ctaOnClick ? 'button' : undefined}
          className="inline-flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-[0.97]"
          style={{
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}40`,
            color: accentColor,
            cursor: 'pointer',
          }}
          onClick={ctaOnClick}
        >
          {isAr ? ctaAr : ctaEn}
          <span>→</span>
        </div>
      )}
    </div>
  )

  if (ctaPath && !ctaOnClick) {
    return <Link to={ctaPath} style={{ textDecoration: 'none', display: 'block' }}>{content}</Link>
  }
  return content
}
