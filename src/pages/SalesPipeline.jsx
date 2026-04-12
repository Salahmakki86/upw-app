/**
 * Sales Pipeline Tracker
 * Tony Robbins sales funnel methodology — 5 stages + closed lost
 */
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const STAGES = [
  { key: 'prospects',    emoji: '🎯', en: 'Prospects',    ar: 'المحتملون',        color: '#3498db' },
  { key: 'leads',        emoji: '🧲', en: 'Leads',        ar: 'العملاء المهتمون', color: '#9b59b6' },
  { key: 'appointments', emoji: '📅', en: 'Appointments', ar: 'المواعيد',          color: '#e67e22' },
  { key: 'proposals',    emoji: '📋', en: 'Proposals',    ar: 'العروض',           color: '#f1c40f' },
  { key: 'closed_won',   emoji: '🏆', en: 'Closed Won',   ar: 'تم الإغلاق',       color: '#2ecc71' },
]

const STAGE_KEYS = STAGES.map(s => s.key)

const SOURCES = ['Instagram', 'Email', 'Referral', 'Ads', 'Cold', 'Other']

const EMPTY_FORM = {
  name: '', company: '', value: '', stage: 'prospects',
  source: 'Referral', notes: '',
}

const inputStyle = {
  background: '#111', border: '1px solid #333', color: 'white',
  borderRadius: 12, padding: '10px 14px', width: '100%',
  fontSize: 13, outline: 'none',
}

export default function SalesPipeline() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const pipeline = state.salesPipeline || { deals: [], closedLost: [] }
  const deals = pipeline.deals || []
  const closedLost = pipeline.closedLost || []

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  function savePipeline(newDeals, newLost) {
    update('salesPipeline', {
      deals: newDeals !== undefined ? newDeals : deals,
      closedLost: newLost !== undefined ? newLost : closedLost,
    })
  }

  function submitForm() {
    if (!form.name.trim()) return
    const now = new Date().toISOString().slice(0, 10)
    if (editId) {
      const updated = deals.map(d =>
        d.id === editId ? { ...d, ...form, value: Number(form.value) || 0 } : d
      )
      savePipeline(updated)
    } else {
      const newDeal = {
        id: `deal_${Date.now()}`,
        ...form,
        value: Number(form.value) || 0,
        createdAt: now,
        movedAt: now,
      }
      savePipeline([...deals, newDeal])
    }
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowForm(false)
  }

  function moveForward(deal) {
    const idx = STAGE_KEYS.indexOf(deal.stage)
    if (idx < 0 || idx >= STAGE_KEYS.length - 1) return
    const newStage = STAGE_KEYS[idx + 1]
    const now = new Date().toISOString().slice(0, 10)
    const updated = deals.map(d =>
      d.id === deal.id ? { ...d, stage: newStage, movedAt: now } : d
    )
    savePipeline(updated)
  }

  function moveBack(deal) {
    const idx = STAGE_KEYS.indexOf(deal.stage)
    if (idx <= 0) return
    const newStage = STAGE_KEYS[idx - 1]
    const now = new Date().toISOString().slice(0, 10)
    const updated = deals.map(d =>
      d.id === deal.id ? { ...d, stage: newStage, movedAt: now } : d
    )
    savePipeline(updated)
  }

  function closeLost(deal) {
    const newDeals = deals.filter(d => d.id !== deal.id)
    const newLost = [...closedLost, { ...deal, lostAt: new Date().toISOString().slice(0, 10) }]
    savePipeline(newDeals, newLost)
  }

  function deleteDeal(id) {
    savePipeline(deals.filter(d => d.id !== id))
  }

  function openEdit(deal) {
    setForm({
      name: deal.name || '', company: deal.company || '',
      value: deal.value || '', stage: deal.stage || 'prospects',
      source: deal.source || 'Referral', notes: deal.notes || '',
    })
    setEditId(deal.id)
    setShowForm(true)
  }

  // Stats
  const stageMap = useMemo(() => {
    const m = {}
    STAGES.forEach(s => { m[s.key] = [] })
    deals.forEach(d => { if (m[d.stage]) m[d.stage].push(d) })
    return m
  }, [deals])

  const totalValue = useMemo(
    () => deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
    [deals]
  )

  // Conversion rates between consecutive stages
  const conversionRates = useMemo(() => {
    return STAGE_KEYS.slice(0, -1).map((key, i) => {
      const current = stageMap[key]?.length || 0
      const next = stageMap[STAGE_KEYS[i + 1]]?.length || 0
      if (current === 0) return null
      return Math.round((next / current) * 100)
    })
  }, [stageMap])

  // Average deal velocity (days from created to movedAt)
  const avgVelocity = useMemo(() => {
    const moved = deals.filter(d => d.createdAt && d.movedAt && d.stage !== 'prospects')
    if (!moved.length) return null
    const total = moved.reduce((sum, d) => {
      const diff = (new Date(d.movedAt) - new Date(d.createdAt)) / (1000 * 60 * 60 * 24)
      return sum + Math.max(0, diff)
    }, 0)
    return Math.round(total / moved.length)
  }, [deals])

  const t = {
    title: isAr ? 'قمع المبيعات' : 'Sales Pipeline',
    subtitle: isAr ? 'تتبع صفقاتك عبر مراحل المبيعات' : 'Track your deals through the sales funnel',
    totalPipeline: isAr ? 'إجمالي قيمة الصفقات' : 'Total Pipeline Value',
    addDeal: isAr ? '+ إضافة صفقة' : '+ Add Deal',
    closedLostLabel: isAr ? 'مغلق (خسارة)' : 'Closed Lost',
    velocity: isAr ? 'متوسط سرعة الصفقة' : 'Avg Deal Velocity',
    days: isAr ? 'يوم' : 'days',
    funnel: isAr ? 'معدلات التحويل' : 'Conversion Rates',
    name: isAr ? 'الاسم' : 'Name',
    company: isAr ? 'الشركة' : 'Company',
    value: isAr ? 'القيمة ($)' : 'Value ($)',
    stage: isAr ? 'المرحلة' : 'Stage',
    source: isAr ? 'المصدر' : 'Source',
    notes: isAr ? 'ملاحظات' : 'Notes',
    save: isAr ? 'حفظ الصفقة' : 'Save Deal',
    cancel: isAr ? 'إلغاء' : 'Cancel',
    noDeals: isAr ? 'لا توجد صفقات في هذه المرحلة' : 'No deals in this stage',
    lostCount: isAr ? 'صفقة خاسرة' : 'lost deals',
  }

  return (
    <Layout title={t.title} subtitle={t.subtitle}>
      <div className="space-y-4 pt-2" dir={isAr ? 'rtl' : 'ltr'}>

        {/* Hero stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl p-3 text-center col-span-1"
            style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <div className="text-lg font-black" style={{ color: '#c9a84c' }}>
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#666' }}>{t.totalPipeline}</div>
          </div>
          <div className="rounded-xl p-3 text-center"
            style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <div className="text-lg font-black" style={{ color: '#e74c3c' }}>
              {closedLost.length}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#666' }}>{t.closedLostLabel}</div>
          </div>
          <div className="rounded-xl p-3 text-center"
            style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <div className="text-lg font-black" style={{ color: '#3498db' }}>
              {avgVelocity !== null ? `${avgVelocity}` : '—'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#666' }}>
              {avgVelocity !== null ? t.days : t.velocity}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            📊 {t.funnel}
          </p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STAGES.map((stage, i) => {
              const count = stageMap[stage.key]?.length || 0
              const rate = i < conversionRates.length ? conversionRates[i] : null
              return (
                <div key={stage.key} className="flex items-center gap-1 flex-shrink-0">
                  <div className="flex flex-col items-center"
                    style={{ minWidth: 60 }}>
                    <div className="rounded-lg px-2 py-1.5 text-center"
                      style={{ background: '#151515', border: `1px solid ${stage.color}33` }}>
                      <div className="text-base">{stage.emoji}</div>
                      <div className="text-xs font-black" style={{ color: stage.color }}>{count}</div>
                      <div className="text-xs" style={{ color: '#555', fontSize: 9, whiteSpace: 'nowrap' }}>
                        {isAr ? stage.ar : stage.en}
                      </div>
                    </div>
                  </div>
                  {rate !== null && (
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <div className="text-xs font-bold" style={{ color: rate >= 50 ? '#2ecc71' : rate >= 25 ? '#f1c40f' : '#e74c3c' }}>
                        {rate}%
                      </div>
                      <div style={{ color: '#444', fontSize: 14 }}>→</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Add Deal Button */}
        {!showForm && (
          <button
            onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }}
            className="w-full btn-gold py-3 text-sm"
          >
            {t.addDeal}
          </button>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.25)' }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              {editId ? (isAr ? 'تعديل الصفقة' : 'Edit Deal') : (isAr ? 'صفقة جديدة' : 'New Deal')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#888' }}>{t.name} *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={isAr ? 'اسم العميل' : 'Contact name'}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#888' }}>{t.company}</label>
                <input
                  style={inputStyle}
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder={isAr ? 'اسم الشركة' : 'Company'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#888' }}>{t.value}</label>
                <input
                  style={inputStyle}
                  type="number"
                  inputMode="numeric"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#888' }}>{t.stage}</label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.stage}
                  onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                >
                  {STAGES.map(s => (
                    <option key={s.key} value={s.key} style={{ background: '#111' }}>
                      {s.emoji} {isAr ? s.ar : s.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{t.source}</label>
              <div className="flex flex-wrap gap-1.5">
                {SOURCES.map(src => (
                  <button
                    key={src}
                    onClick={() => setForm(f => ({ ...f, source: src }))}
                    className="rounded-full px-3 py-1 text-xs font-bold transition-all"
                    style={{
                      background: form.source === src ? '#c9a84c' : '#1a1a1a',
                      color: form.source === src ? '#000' : '#888',
                      border: `1px solid ${form.source === src ? '#c9a84c' : '#333'}`,
                    }}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{t.notes}</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder={isAr ? 'ملاحظات اختيارية...' : 'Optional notes...'}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={submitForm} className="flex-1 btn-gold py-2.5 text-sm">
                💾 {t.save}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }}
                className="flex-1 py-2.5 text-sm rounded-xl font-bold transition-all"
                style={{ background: '#1a1a1a', color: '#888', border: '1px solid #333' }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Stage Columns */}
        {STAGES.map(stage => {
          const stageDeals = stageMap[stage.key] || []
          const stageValue = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
          return (
            <div key={stage.key} className="rounded-2xl p-4"
              style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
              {/* Stage header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span>{stage.emoji}</span>
                  <span className="text-sm font-black" style={{ color: stage.color }}>
                    {isAr ? stage.ar : stage.en}
                  </span>
                  <span className="text-xs font-bold rounded-full px-2 py-0.5"
                    style={{ background: `${stage.color}22`, color: stage.color }}>
                    {stageDeals.length}
                  </span>
                </div>
                {stageValue > 0 && (
                  <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>
                    ${stageValue.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Deals */}
              {stageDeals.length === 0 ? (
                <p className="text-xs text-center py-2" style={{ color: '#444' }}>{t.noDeals}</p>
              ) : (
                <div className="space-y-2">
                  {stageDeals.map(deal => {
                    const stageIdx = STAGE_KEYS.indexOf(deal.stage)
                    const isExpanded = expandedId === deal.id
                    return (
                      <div key={deal.id} className="rounded-xl overflow-hidden"
                        style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                        <div
                          className="flex items-center justify-between px-3 py-2.5 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : deal.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{deal.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {deal.company && (
                                <span className="text-xs" style={{ color: '#666' }}>{deal.company}</span>
                              )}
                              {deal.value > 0 && (
                                <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>
                                  ${Number(deal.value).toLocaleString()}
                                </span>
                              )}
                              <span className="text-xs rounded-full px-1.5 py-0.5"
                                style={{ background: '#1a1a1a', color: '#555', fontSize: 9 }}>
                                {deal.source}
                              </span>
                            </div>
                          </div>

                          {/* Move buttons */}
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={e => { e.stopPropagation(); moveBack(deal) }}
                              disabled={stageIdx <= 0}
                              className="rounded-lg px-2 py-1 text-xs font-bold transition-all"
                              style={{
                                background: stageIdx > 0 ? '#1a1a1a' : '#111',
                                color: stageIdx > 0 ? '#888' : '#333',
                                border: '1px solid #2a2a2a',
                              }}
                              title={isAr ? 'تراجع' : 'Move back'}
                            >
                              ←
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); moveForward(deal) }}
                              disabled={stageIdx >= STAGE_KEYS.length - 1}
                              className="rounded-lg px-2 py-1 text-xs font-bold transition-all"
                              style={{
                                background: stageIdx < STAGE_KEYS.length - 1 ? `${stage.color}22` : '#111',
                                color: stageIdx < STAGE_KEYS.length - 1 ? stage.color : '#333',
                                border: `1px solid ${stageIdx < STAGE_KEYS.length - 1 ? stage.color + '44' : '#2a2a2a'}`,
                              }}
                              title={isAr ? 'تقدم' : 'Move forward'}
                            >
                              →
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-0 space-y-2"
                            style={{ borderTop: '1px solid #1a1a1a' }}>
                            {deal.notes && (
                              <p className="text-xs" style={{ color: '#888' }}>{deal.notes}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs" style={{ color: '#555' }}>
                              <span>{isAr ? 'أُضيف:' : 'Added:'} {deal.createdAt}</span>
                              {deal.movedAt !== deal.createdAt && (
                                <span>· {isAr ? 'نُقل:' : 'Moved:'} {deal.movedAt}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(deal)}
                                className="flex-1 rounded-lg py-1.5 text-xs font-bold"
                                style={{ background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}
                              >
                                ✏️ {isAr ? 'تعديل' : 'Edit'}
                              </button>
                              <button
                                onClick={() => closeLost(deal)}
                                className="flex-1 rounded-lg py-1.5 text-xs font-bold"
                                style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)' }}
                              >
                                ❌ {isAr ? 'أغلق خاسرة' : 'Close Lost'}
                              </button>
                              <button
                                onClick={() => deleteDeal(deal.id)}
                                className="rounded-lg px-2 py-1.5 text-xs"
                                style={{ background: '#1a1a1a', color: '#555', border: '1px solid #2a2a2a' }}
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Closed Lost section */}
        {closedLost.length > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background: '#0e0e0e', border: '1px solid rgba(231,76,60,0.2)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#e74c3c' }}>
              ❌ {t.closedLostLabel} — {closedLost.length} {t.lostCount}
            </p>
            <div className="space-y-2">
              {closedLost.slice(-5).reverse().map(deal => (
                <div key={deal.id} className="flex items-center justify-between rounded-xl px-3 py-2"
                  style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#888' }}>{deal.name}</div>
                    {deal.company && (
                      <div className="text-xs" style={{ color: '#555' }}>{deal.company}</div>
                    )}
                  </div>
                  {deal.value > 0 && (
                    <span className="text-xs font-bold" style={{ color: '#e74c3c' }}>
                      -${Number(deal.value).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
