/**
 * PDF / printable export helpers.
 * Uses browser's window.print() with a styled iframe.
 * No external dependencies — works offline.
 */

function escapeHtml(s) {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Download arbitrary JSON as a file.
 */
export function downloadJson(filename, data) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return { filename, size: blob.size }
}

/**
 * Download a HTML-based PDF (uses browser print-to-PDF).
 */
export function printMonthlyJournal(state, isAr, monthKey) {
  const mk = monthKey || new Date().toISOString().slice(0, 7)
  const monthLabelAr = new Date(mk + '-01').toLocaleDateString('ar', { month: 'long', year: 'numeric' })
  const monthLabelEn = new Date(mk + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })
  const title = isAr ? 'مفكرتي الشهرية' : 'My Monthly Journal'

  // Gather month data
  const wins = state.dailyWins || {}
  const gratitude = state.gratitude || {}
  const eveningLog = state.eveningLog || {}
  const stateCheckin = state.stateCheckin || {}
  const sleepLog = state.sleepLog || {}

  const monthDates = Object.keys({ ...wins, ...gratitude, ...eveningLog })
    .filter(d => d.startsWith(mk))
    .sort()

  // Wins
  const winsHtml = monthDates.map(d => {
    const dayWins = wins[d] || []
    if (dayWins.length === 0) return ''
    return `<div class="entry"><span class="date">${escapeHtml(d)}</span><ul>${
      dayWins.map(w => `<li>${escapeHtml(w.text || '')}</li>`).join('')
    }</ul></div>`
  }).filter(Boolean).join('')

  // Gratitude
  const gratitudeHtml = monthDates.map(d => {
    const items = (gratitude[d] || []).filter(Boolean)
    if (items.length === 0) return ''
    return `<div class="entry"><span class="date">${escapeHtml(d)}</span><ul>${
      items.map(g => `<li>${escapeHtml(g)}</li>`).join('')
    }</ul></div>`
  }).filter(Boolean).join('')

  // Reflections (evening)
  const reflectionsHtml = monthDates.map(d => {
    const ev = eveningLog[d]
    if (!ev || !ev.reflection) return ''
    return `<div class="entry"><span class="date">${escapeHtml(d)}</span><p>${escapeHtml(ev.reflection)}</p></div>`
  }).filter(Boolean).join('')

  // Sleep average
  const sleepHours = monthDates.map(d => sleepLog[d]?.hours).filter(Boolean)
  const avgSleep = sleepHours.length > 0
    ? Math.round((sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length) * 10) / 10
    : null

  // State average
  const stateDays = monthDates.map(d => stateCheckin[d])
    .filter(v => v && typeof v.energy === 'number')
    .map(v => (v.energy + v.mood + v.clarity) / 3)
  const avgState = stateDays.length > 0
    ? Math.round((stateDays.reduce((a, b) => a + b, 0) / stateDays.length) * 10) / 10
    : null

  const html = `<!doctype html>
  <html ${isAr ? 'lang="ar" dir="rtl"' : 'lang="en" dir="ltr"'}>
  <head>
    <meta charset="utf-8"/>
    <title>${escapeHtml(title)} — ${escapeHtml(isAr ? monthLabelAr : monthLabelEn)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: ${isAr ? "'Cairo', 'Amiri', serif" : "'Inter', sans-serif"};
        background: #fff; color: #111;
        margin: 0; padding: 32px 40px;
        line-height: 1.6;
      }
      h1 {
        font-size: 32px; margin: 0 0 4px;
        color: #a88930;
        border-bottom: 3px solid #c9a84c;
        padding-bottom: 8px;
      }
      h2 {
        font-size: 22px; margin: 36px 0 12px;
        color: #111;
        border-bottom: 1px solid #e5c670;
        padding-bottom: 4px;
      }
      .period { font-size: 16px; color: #666; margin-bottom: 20px; }
      .stats {
        display: flex; gap: 20px; margin: 20px 0;
        background: #faf6e8; border: 1px solid #e5c670; border-radius: 8px; padding: 16px;
      }
      .stat { flex: 1; text-align: center; }
      .stat-value { font-size: 24px; font-weight: 700; color: #a88930; }
      .stat-label { font-size: 11px; color: #666; letter-spacing: 1px; text-transform: uppercase; }
      .entry { margin: 12px 0; padding: 10px 14px; background: #fafafa; border-${isAr ? 'right' : 'left'}: 3px solid #c9a84c; border-radius: 4px; page-break-inside: avoid; }
      .date { font-size: 12px; font-weight: 700; color: #a88930; }
      ul { margin: 6px 0 0 0; padding-${isAr ? 'right' : 'left'}: 20px; }
      li { margin-bottom: 4px; }
      p { margin: 6px 0 0 0; white-space: pre-wrap; }
      .empty { color: #999; font-style: italic; padding: 10px 0; }
      .footer {
        margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd;
        font-size: 11px; color: #888; text-align: center;
      }
      @media print {
        body { padding: 20px; }
        h2 { page-break-after: avoid; }
      }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <div class="period">${escapeHtml(isAr ? monthLabelAr : monthLabelEn)}</div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${monthDates.length}</div>
        <div class="stat-label">${escapeHtml(isAr ? 'أيام نشطة' : 'Active Days')}</div>
      </div>
      <div class="stat">
        <div class="stat-value">${avgSleep !== null ? avgSleep : '—'}</div>
        <div class="stat-label">${escapeHtml(isAr ? 'متوسط النوم' : 'Avg Sleep')}</div>
      </div>
      <div class="stat">
        <div class="stat-value">${avgState !== null ? avgState : '—'}</div>
        <div class="stat-label">${escapeHtml(isAr ? 'متوسط الحالة' : 'Avg State')}</div>
      </div>
    </div>

    <h2>🏆 ${escapeHtml(isAr ? 'انتصاراتي' : 'My Wins')}</h2>
    ${winsHtml || `<div class="empty">${escapeHtml(isAr ? 'لم تسجّل انتصارات هذا الشهر' : 'No wins logged this month')}</div>`}

    <h2>🙏 ${escapeHtml(isAr ? 'امتناني' : 'Gratitude')}</h2>
    ${gratitudeHtml || `<div class="empty">${escapeHtml(isAr ? 'لم تسجّل امتناناً هذا الشهر' : 'No gratitude logged this month')}</div>`}

    <h2>📖 ${escapeHtml(isAr ? 'تأملاتي' : 'Reflections')}</h2>
    ${reflectionsHtml || `<div class="empty">${escapeHtml(isAr ? 'لم تسجّل تأملات هذا الشهر' : 'No reflections logged this month')}</div>`}

    <div class="footer">
      ${escapeHtml(isAr ? 'قواك — من بياناتك أنت' : 'Your Power — from your own data')}
      · ${escapeHtml(new Date().toISOString().slice(0, 10))}
    </div>
  </body>
  </html>`

  // Open in new window for printing
  const w = window.open('', '_blank', 'width=800,height=600')
  if (!w) {
    alert(isAr ? 'المتصفح حجب النافذة — يرجى السماح بالنوافذ المنبثقة' : 'Popup blocked — please allow popups')
    return null
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  // Delay print slightly for rendering
  setTimeout(() => { try { w.print() } catch {} }, 600)
  return { monthKey: mk }
}
