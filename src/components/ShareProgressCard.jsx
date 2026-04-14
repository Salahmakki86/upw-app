/**
 * ShareProgressCard — Generates a shareable progress card image
 * Uses HTML Canvas to render, then converts to blob for sharing/copying/downloading
 */
import { useState, useRef, useEffect } from 'react'
import { X, Share2, Copy, Download } from 'lucide-react'
import { calcMomentum, calcTransformationScore } from '../utils/transformationEngine'

const QUOTES_EN = [
  'It is in your moments of decision that your destiny is shaped.',
  'Where focus goes, energy flows.',
  'The secret to living is giving.',
  'Motion creates emotion — move NOW.',
  'The only limit to your impact is your imagination and commitment.',
]
const QUOTES_AR = [
  'في لحظات قراراتك يتشكّل مصيرك.',
  'حيث يذهب تركيزك تذهب طاقتك.',
  'سر الحياة هو العطاء.',
  'الحركة تخلق العاطفة — تحرّك الآن.',
  'الحد الوحيد لتأثيرك هو خيالك والتزامك.',
]

const MOMENTUM_LABELS = {
  strong:          { en: 'Strong Momentum',        ar: 'زخم قوي' },
  building:        { en: 'Building Momentum',       ar: 'زخم يتصاعد' },
  needs_attention: { en: 'Needs Attention',         ar: 'يحتاج اهتمام' },
}

export default function ShareProgressCard({ state, lang, onClose }) {
  const canvasRef = useRef(null)
  const [format, setFormat] = useState('story') // 'story' (1080x1920) or 'square' (1080x1080)
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const isAr = lang === 'ar'

  const W = 1080
  const H = format === 'story' ? 1920 : 1080

  // Compute stats
  const momentum = calcMomentum(state)
  const transformation = calcTransformationScore(state)
  const streak = state.streak || 0
  const goalsCompleted = (state.goals || []).filter(g => (g.progress || 0) >= 100).length
  const daysActive = (state.morningLog || []).length
  const beliefsTransformed = (state.empoweringBeliefs || []).length
  const quote = isAr
    ? QUOTES_AR[Math.floor(Math.random() * QUOTES_AR.length)]
    : QUOTES_EN[Math.floor(Math.random() * QUOTES_EN.length)]
  const momLabel = MOMENTUM_LABELS[momentum.status] || MOMENTUM_LABELS.building

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#0e0e0e'
    ctx.fillRect(0, 0, W, H)

    // Subtle radial glow behind score
    const grd = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, 400)
    grd.addColorStop(0, 'rgba(201,168,76,0.08)')
    grd.addColorStop(1, 'rgba(14,14,14,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)

    // Gold accent line at top
    ctx.fillStyle = '#c9a84c'
    ctx.fillRect(0, 0, W, 6)

    // Helper: draw centered text
    const centerText = (text, y, font, color) => {
      ctx.font = font
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, W / 2, y)
    }

    // Helper: draw right-aligned text (for Arabic)
    const drawText = (text, x, y, font, color, align = 'center') => {
      ctx.font = font
      ctx.fillStyle = color
      ctx.textAlign = align
      ctx.textBaseline = 'middle'
      ctx.fillText(text, x, y)
    }

    const isStory = format === 'story'
    const yBase = isStory ? 0 : -200 // shift everything up for square

    // ── 1. Header: UPW Coach logo text ──
    centerText('UPW COACH', (isStory ? 160 : 100) + yBase, 'bold 56px sans-serif', '#c9a84c')
    // Decorative line under header
    ctx.strokeStyle = 'rgba(201,168,76,0.4)'
    ctx.lineWidth = 2
    const lineY = (isStory ? 200 : 140) + yBase
    ctx.beginPath()
    ctx.moveTo(W / 2 - 120, lineY)
    ctx.lineTo(W / 2 + 120, lineY)
    ctx.stroke()

    // ── 2. Streak ──
    const streakY = (isStory ? 300 : 220) + yBase
    const streakText = isAr ? `${streak} يوم متواصل` : `${streak} Day Streak`
    centerText(streakText, streakY, 'bold 48px sans-serif', '#ffffff')
    // Fire emoji as text
    centerText('\uD83D\uDD25', streakY - 70, '64px sans-serif', '#fff')

    // ── 3. Transformation Score (big number) ──
    const scoreY = (isStory ? 540 : 420) + yBase
    // Score ring (drawn manually)
    const ringCx = W / 2
    const ringCy = scoreY
    const ringR = 130
    // Background ring
    ctx.beginPath()
    ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 14
    ctx.stroke()
    // Score arc
    const scoreAngle = (transformation.total / 100) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(ringCx, ringCy, ringR, -Math.PI / 2, -Math.PI / 2 + scoreAngle)
    ctx.strokeStyle = transformation.color
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.lineCap = 'butt'
    // Score number
    centerText(`${transformation.total}`, scoreY + 4, 'bold 96px sans-serif', '#ffffff')
    // Label
    const scoreLabelY = scoreY + ringR + 50
    const scoreLabel = isAr ? 'درجة التحوّل' : 'Transformation Score'
    centerText(scoreLabel, scoreLabelY, 'bold 36px sans-serif', '#888888')

    // ── 4. Momentum status ──
    const momY = scoreLabelY + 80
    const momText = isAr ? momLabel.ar : momLabel.en
    // Momentum pill background
    const pillW = ctx.measureText(momText).width + 80
    ctx.font = 'bold 34px sans-serif'
    const measuredW = ctx.measureText(momText).width + 80
    const pillH = 60
    const pillX = (W - measuredW) / 2
    const pillRadius = 30
    ctx.fillStyle = momentum.color + '20'
    ctx.beginPath()
    ctx.roundRect(pillX, momY - pillH / 2, measuredW, pillH, pillRadius)
    ctx.fill()
    ctx.strokeStyle = momentum.color + '60'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(pillX, momY - pillH / 2, measuredW, pillH, pillRadius)
    ctx.stroke()
    centerText(momText, momY, 'bold 34px sans-serif', momentum.color)

    // ── 5. Key stats row ──
    const statsY = momY + 120
    const stats = [
      { value: `${daysActive}`, label: isAr ? 'ايام نشطة' : 'Days Active' },
      { value: `${goalsCompleted}`, label: isAr ? 'اهداف محققة' : 'Goals Done' },
      { value: `${beliefsTransformed}`, label: isAr ? 'معتقدات محولة' : 'Beliefs Shifted' },
    ]
    const statSpacing = W / (stats.length + 1)
    stats.forEach((s, i) => {
      const sx = statSpacing * (i + 1)
      drawText(s.value, sx, statsY, 'bold 56px sans-serif', '#c9a84c', 'center')
      drawText(s.label, sx, statsY + 50, '28px sans-serif', '#666666', 'center')
    })

    // Divider lines between stats
    ctx.strokeStyle = '#222222'
    ctx.lineWidth = 1
    for (let i = 1; i < stats.length; i++) {
      const dx = statSpacing * (i + 0.5)
      ctx.beginPath()
      ctx.moveTo(dx, statsY - 40)
      ctx.lineTo(dx, statsY + 70)
      ctx.stroke()
    }

    // ── 6. Motivational quote ──
    const quoteY = isStory ? statsY + 200 : statsY + 160
    // Quote box background
    const qBoxH = isStory ? 220 : 180
    const qBoxW = W - 120
    const qBoxX = 60
    const qBoxY = quoteY - 40
    ctx.fillStyle = 'rgba(201,168,76,0.05)'
    ctx.beginPath()
    ctx.roundRect(qBoxX, qBoxY, qBoxW, qBoxH, 20)
    ctx.fill()
    ctx.strokeStyle = 'rgba(201,168,76,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(qBoxX, qBoxY, qBoxW, qBoxH, 20)
    ctx.stroke()

    // Quote mark
    centerText('\u201C', quoteY, 'bold 72px serif', 'rgba(201,168,76,0.3)')

    // Quote text — wrap lines
    ctx.font = 'italic 30px sans-serif'
    ctx.fillStyle = '#cccccc'
    ctx.textAlign = 'center'
    const maxLineW = qBoxW - 80
    const words = quote.split(' ')
    let line = ''
    const lines = []
    for (const word of words) {
      const test = line ? line + ' ' + word : word
      if (ctx.measureText(test).width > maxLineW) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    const lineHeight = 44
    const startQY = quoteY + 50
    lines.forEach((l, i) => {
      ctx.fillText(l, W / 2, startQY + i * lineHeight)
    })

    // Author
    const authorY = startQY + lines.length * lineHeight + 20
    centerText('— Tony Robbins', authorY, '26px sans-serif', '#888888')

    // ── 7. Footer watermark ──
    const footerY = H - 60
    centerText('tr.salahmakki.app', footerY, '28px sans-serif', 'rgba(201,168,76,0.4)')

    // Bottom gold accent line
    ctx.fillStyle = '#c9a84c'
    ctx.fillRect(0, H - 6, W, 6)

  }, [state, lang, format])

  // ── Share handler ──
  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
      const file = new File([blob], 'upw-progress.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: isAr ? 'تقدمي في UPW Coach' : 'My UPW Coach Progress',
          files: [file],
        })
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      } else {
        // Fallback: download
        handleDownload()
      }
    } catch (err) {
      if (err.name !== 'AbortError') handleDownload()
    }
  }

  // ── Copy handler ──
  const handleCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      handleDownload()
    }
  }

  // ── Download fallback ──
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'upw-progress.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-4 w-full max-w-md px-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="self-end w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all active:scale-90"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #333' }}
        >
          <X size={16} style={{ color: '#888' }} />
        </button>

        {/* Format toggle */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setFormat('story')}
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: format === 'story' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${format === 'story' ? 'rgba(201,168,76,0.5)' : '#333'}`,
              color: format === 'story' ? '#c9a84c' : '#666',
            }}
          >
            {isAr ? 'ستوري' : 'Story'} 9:16
          </button>
          <button
            onClick={() => setFormat('square')}
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: format === 'square' ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${format === 'square' ? 'rgba(201,168,76,0.5)' : '#333'}`,
              color: format === 'square' ? '#c9a84c' : '#666',
            }}
          >
            {isAr ? 'مربع' : 'Square'} 1:1
          </button>
        </div>

        {/* Canvas preview */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            width: '100%',
            maxWidth: format === 'story' ? 280 : 340,
            aspectRatio: format === 'story' ? '9/16' : '1/1',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(201,168,76,0.2)',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-2 w-full justify-center">
          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: shared
                ? 'linear-gradient(135deg,#2ecc71,#27ae60)'
                : 'linear-gradient(135deg,#c9a84c,#e8c96a)',
              color: '#0a0a0a',
            }}
          >
            <Share2 size={16} />
            {shared
              ? (isAr ? 'تمت المشاركة' : 'Shared!')
              : (isAr ? 'مشاركة' : 'Share')}
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: copied ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.05)',
              border: copied ? '1px solid rgba(46,204,113,0.4)' : '1px solid #333',
              color: copied ? '#2ecc71' : '#aaa',
            }}
          >
            <Copy size={16} />
            {copied
              ? (isAr ? 'تم النسخ' : 'Copied!')
              : (isAr ? 'نسخ' : 'Copy')}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid #333',
              color: '#888',
            }}
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
