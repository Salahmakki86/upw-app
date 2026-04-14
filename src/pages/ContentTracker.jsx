/**
 * Content Tracker — Education-Based Marketing
 * Inspired by Chet Holmes "Ultimate Sales Machine" Core Story methodology
 * Tab 1: Core Story  |  Tab 2: Content Calendar  |  Tab 3: Lead Magnets
 */
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

// ── Constants ─────────────────────────────────────────────────────────────────

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Email', 'Blog', 'Facebook', 'LinkedIn', 'WhatsApp']
const CONTENT_TYPES = {
  ar: ['بوست', 'ستوري', 'ريل', 'فيديو', 'إيميل', 'مقال'],
  en: ['Post', 'Story', 'Reel', 'Video', 'Email', 'Article'],
}
const MAGNET_TYPES = {
  ar: ['PDF', 'فيديو', 'ويبنار', 'تحدي', 'دورة مجانية', 'أداة', 'كتاب إلكتروني'],
  en: ['PDF', 'Video', 'Webinar', 'Challenge', 'Free Course', 'Tool', 'eBook'],
}

const labelStyle = {
  color: '#c9a84c',
  fontSize: 10,
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: 2,
  display: 'block',
  marginBottom: 4,
}

const inputStyle = {
  background: '#111',
  border: '1px solid #333',
  color: 'white',
  borderRadius: 12,
  padding: '10px 14px',
  width: '100%',
  fontSize: 13,
  outline: 'none',
}

const cardStyle = {
  background: '#0e0e0e',
  border: '1px solid #1e1e1e',
  borderRadius: 16,
}

const BLANK_CONTENT_LOG = {
  date: new Date().toISOString().slice(0, 10),
  platform: '',
  type: '',
  topic: '',
  caption: '',
  leadsGenerated: '',
}

const BLANK_MAGNET = {
  name: '',
  type: '',
  createdDate: new Date().toISOString().slice(0, 10),
  signups: '',
  conversionPct: '',
}

const TODAY = new Date().toISOString().slice(0, 10)

function getLast14Days() {
  const days = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.now() - i * 86400000)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function getWeekRange() {
  const now = new Date()
  const mon = new Date(now)
  mon.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1))
  return mon.toISOString().slice(0, 10)
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ContentTracker() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const [tab, setTab] = useState(0)

  const tabs = [
    { ar: 'القصة الأساسية', en: 'Core Story', icon: '📖' },
    { ar: 'جدول المحتوى', en: 'Calendar', icon: '📅' },
    { ar: 'مغناطيس العملاء', en: 'Lead Magnets', icon: '🧲' },
  ]

  return (
    <Layout
      title={isAr ? 'تتبّع المحتوى' : 'Content Tracker'}
      subtitle={isAr ? 'توقّف عن البيع، ابدأ بالتعليم — المال سيتبع' : 'Stop selling, start educating — the money will follow'}
    >
      <div className="space-y-4 pt-2">

        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl p-1" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
          {tabs.map((t, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: tab === i ? '#c9a84c' : 'transparent',
                color: tab === i ? '#000' : '#666',
              }}
            >
              {t.icon} {isAr ? t.ar : t.en}
            </button>
          ))}
        </div>

        {tab === 0 && <CoreStoryTab state={state} update={update} isAr={isAr} />}
        {tab === 1 && <ContentCalendarTab state={state} update={update} isAr={isAr} />}
        {tab === 2 && <LeadMagnetsTab state={state} update={update} isAr={isAr} />}
      </div>
    </Layout>
  )
}

// ── TAB 1 — Core Story ────────────────────────────────────────────────────────

function CoreStoryTab({ state, update, isAr }) {
  const cs = state.coreStory || {}
  const setCS = (key, val) => update('coreStory', { ...cs, [key]: val })

  const setStatistic = (idx, val) => {
    const stats = [...(cs.statistics || ['', '', ''])]
    stats[idx] = val
    setCS('statistics', stats)
  }

  const stats = cs.statistics || ['', '', '']

  return (
    <div className="space-y-4">

      {/* Quote */}
      <div className="rounded-2xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <p className="text-xs italic text-center" style={{ color: '#c9a84c' }}>
          "{isAr
            ? 'توقّف عن البيع، ابدأ بالتعليم — المال سيتبع'
            : 'Stop selling, start educating — the money will follow'}"
        </p>
        <p className="text-xs text-center mt-1" style={{ color: '#555' }}>— Chet Holmes / Tony Robbins</p>
      </div>

      {/* Core Story Title */}
      <div style={cardStyle} className="p-4">
        <span style={labelStyle}>{isAr ? 'عنوان قصتك الأساسية' : 'Core Story Title'}</span>
        <input
          style={inputStyle}
          placeholder={isAr ? 'مثال: لماذا 97% من الناس لا يحققون الحرية المالية؟' : 'e.g. Why 97% of people never achieve financial freedom'}
          value={cs.title || ''}
          onChange={e => setCS('title', e.target.value)}
        />
        <p className="text-xs mt-2" style={{ color: '#555' }}>
          {isAr
            ? 'عنوان تعليمي يجذب، لا عنوان بيعي'
            : 'An educational headline that attracts — not a sales pitch'}
        </p>
      </div>

      {/* Big Problem */}
      <div style={cardStyle} className="p-4">
        <span style={labelStyle}>🔥 {isAr ? 'المشكلة الكبرى في السوق' : 'The Big Problem in Your Market'}</span>
        <textarea
          style={{ ...inputStyle, resize: 'none' }}
          rows={3}
          placeholder={isAr
            ? 'علّم، لا تبيع. ما المشكلة الموجودة في سوقك التي يعاني منها الجميع؟'
            : 'Educate, don\'t sell. What is the BIG unsolved problem in your market?'}
          value={cs.bigProblem || ''}
          onChange={e => setCS('bigProblem', e.target.value)}
        />
      </div>

      {/* 3 Key Statistics */}
      <div style={cardStyle} className="p-4 space-y-2">
        <span style={labelStyle}>📊 {isAr ? '3 إحصاءات تُثبت المشكلة' : '3 Statistics that Prove the Problem'}</span>
        {stats.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-xs font-black w-4 flex-shrink-0" style={{ color: '#c9a84c' }}>{i + 1}</span>
            <input
              style={{ ...inputStyle, fontSize: 12 }}
              placeholder={isAr ? `الإحصاء ${i + 1} — مثال: 80% من...` : `Stat ${i + 1} — e.g. 80% of people...`}
              value={s}
              onChange={e => setStatistic(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Unique Solution */}
      <div style={cardStyle} className="p-4">
        <span style={labelStyle}>💡 {isAr ? 'حلّك الفريد' : 'Your Unique Solution'}</span>
        <textarea
          style={{ ...inputStyle, resize: 'none' }}
          rows={2}
          placeholder={isAr ? 'ما الحل الذي تقدمه لهذه المشكلة؟' : 'What solution do you offer to this problem?'}
          value={cs.uniqueSolution || ''}
          onChange={e => setCS('uniqueSolution', e.target.value)}
        />
      </div>

      {/* Differentiator */}
      <div style={cardStyle} className="p-4">
        <span style={labelStyle}>⭐ {isAr ? 'لماذا أنت وليس غيرك؟' : 'Your Differentiator (Why you vs others)'}</span>
        <textarea
          style={{ ...inputStyle, resize: 'none' }}
          rows={2}
          placeholder={isAr ? 'ما الذي يجعلك مختلفاً عن كل منافسيك؟' : 'What makes you different from every competitor?'}
          value={cs.differentiator || ''}
          onChange={e => setCS('differentiator', e.target.value)}
        />
      </div>

      {/* Transformation Promise */}
      <div style={cardStyle} className="p-4">
        <span style={labelStyle}>🚀 {isAr ? 'وعد التحوّل' : 'The Transformation Promise'}</span>
        <textarea
          style={{ ...inputStyle, resize: 'none' }}
          rows={2}
          placeholder={isAr ? 'بعد العمل معك، ماذا سيكون عليه حال العميل؟' : 'After working with you, where will your client be?'}
          value={cs.transformationPromise || ''}
          onChange={e => setCS('transformationPromise', e.target.value)}
        />
      </div>

      {/* Presentation Outline Preview */}
      {(cs.title || cs.bigProblem) && (
        <div style={{ ...cardStyle, border: '1px solid rgba(201,168,76,0.25)' }} className="p-4">
          <p style={labelStyle}>📋 {isAr ? 'مخطط العرض التقديمي' : 'Presentation Outline'}</p>
          <div className="space-y-2 mt-2">
            {[
              { icon: '📌', label: isAr ? 'العنوان' : 'Title', val: cs.title },
              { icon: '🔥', label: isAr ? 'المشكلة الكبرى' : 'Big Problem', val: cs.bigProblem },
              { icon: '📊', label: isAr ? 'الإحصاءات' : 'Statistics', val: stats.filter(Boolean).join(' • ') },
              { icon: '💡', label: isAr ? 'الحل الفريد' : 'Unique Solution', val: cs.uniqueSolution },
              { icon: '⭐', label: isAr ? 'المميز' : 'Differentiator', val: cs.differentiator },
              { icon: '🚀', label: isAr ? 'وعد التحوّل' : 'Promise', val: cs.transformationPromise },
            ].filter(r => r.val).map((row, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl p-2" style={{ background: '#1a1a1a' }}>
                <span className="flex-shrink-0">{row.icon}</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold block" style={{ color: '#c9a84c' }}>{row.label}</span>
                  <span className="text-xs text-white">{row.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => {/* state auto-syncs via debounce */}}
        className="w-full btn-gold py-3 text-sm"
        style={{ opacity: 0.7 }}
      >
        {isAr ? 'يُحفظ تلقائياً ✓' : 'Auto-saved ✓'}
      </button>
    </div>
  )
}

// ── TAB 2 — Content Calendar ──────────────────────────────────────────────────

function ContentCalendarTab({ state, update, isAr }) {
  const log = state.contentLog || []
  const ideas = state.contentIdeas || []

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK_CONTENT_LOG })
  const [newIdea, setNewIdea] = useState('')

  const last14 = getLast14Days()
  const weekStart = getWeekRange()

  const recentLog = log.filter(e => last14.includes(e.date))
  const thisWeek = log.filter(e => e.date >= weekStart)

  // Stats
  const totalWeek = thisWeek.length
  const platformCounts = PLATFORMS.reduce((acc, p) => {
    acc[p] = recentLog.filter(e => e.platform === p).length
    return acc
  }, {})
  const mostProductive = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]

  const leadsByPlatform = PLATFORMS.reduce((acc, p) => {
    const pItems = recentLog.filter(e => e.platform === p && Number(e.leadsGenerated) > 0)
    if (pItems.length > 0) {
      acc[p] = Math.round(pItems.reduce((s, e) => s + Number(e.leadsGenerated), 0) / pItems.length)
    }
    return acc
  }, {})
  const bestLeadsPlatform = Object.entries(leadsByPlatform).sort((a, b) => b[1] - a[1])[0]

  // ── Content → Revenue Attribution (cross-references contentLog with businessScorecard) ──
  const revenueAttribution = useMemo(() => {
    const scorecard = state.businessScorecard || {}
    if (!log.length || !Object.keys(scorecard).length) return null

    // Build set of dates with content posted
    const contentDates = new Set(log.map(e => e.date))

    // Gather all scorecard days that have leads > 0
    let contentDayLeads = []
    let nonContentDayLeads = []

    Object.entries(scorecard).forEach(([date, entry]) => {
      const leads = Number(entry?.leads) || 0
      if (contentDates.has(date)) {
        contentDayLeads.push(leads)
      } else {
        nonContentDayLeads.push(leads)
      }
    })

    // Need at least 3 overlapping days (days present in both systems)
    const totalOverlap = contentDayLeads.length + nonContentDayLeads.length
    if (totalOverlap < 3 || contentDayLeads.length === 0) return null

    const avgContentLeads = contentDayLeads.length > 0
      ? (contentDayLeads.reduce((s, v) => s + v, 0) / contentDayLeads.length).toFixed(1)
      : '0'
    const avgNonContentLeads = nonContentDayLeads.length > 0
      ? (nonContentDayLeads.reduce((s, v) => s + v, 0) / nonContentDayLeads.length).toFixed(1)
      : '0'

    return { avgContentLeads, avgNonContentLeads, contentDays: contentDayLeads.length, nonContentDays: nonContentDayLeads.length }
  }, [log, state.businessScorecard])

  // ── Smart Content Suggestion (best type + platform combo by leads) ──
  const smartSuggestion = useMemo(() => {
    const entriesWithLeads = log.filter(e => Number(e.leadsGenerated) > 0)
    if (entriesWithLeads.length < 3) return null

    // Best content TYPE by average leads
    const typeLeads = {}
    const typeCounts = {}
    entriesWithLeads.forEach(e => {
      if (!e.type) return
      typeLeads[e.type] = (typeLeads[e.type] || 0) + Number(e.leadsGenerated)
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1
    })
    const bestType = Object.entries(typeLeads)
      .map(([type, total]) => ({ type, avg: total / typeCounts[type] }))
      .sort((a, b) => b.avg - a.avg)[0]

    // Best PLATFORM by average leads
    const platLeads = {}
    const platCounts = {}
    entriesWithLeads.forEach(e => {
      if (!e.platform) return
      platLeads[e.platform] = (platLeads[e.platform] || 0) + Number(e.leadsGenerated)
      platCounts[e.platform] = (platCounts[e.platform] || 0) + 1
    })
    const bestPlat = Object.entries(platLeads)
      .map(([platform, total]) => ({ platform, avg: total / platCounts[platform] }))
      .sort((a, b) => b.avg - a.avg)[0]

    if (!bestType || !bestPlat) return null

    // Check the specific combo average
    const comboEntries = entriesWithLeads.filter(e => e.type === bestType.type && e.platform === bestPlat.platform)
    const comboAvg = comboEntries.length > 0
      ? (comboEntries.reduce((s, e) => s + Number(e.leadsGenerated), 0) / comboEntries.length).toFixed(1)
      : Math.max(bestType.avg, bestPlat.avg).toFixed(1)

    return { type: bestType.type, platform: bestPlat.platform, avg: comboAvg }
  }, [log])

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const saveLog = () => {
    if (!form.platform || !form.type || !form.topic.trim()) return
    const entry = { id: Date.now(), ...form }
    update('contentLog', [entry, ...log])
    setForm({ ...BLANK_CONTENT_LOG })
    setShowForm(false)
  }

  const deleteLog = (id) => update('contentLog', log.filter(e => e.id !== id))

  const addIdea = () => {
    if (!newIdea.trim()) return
    update('contentIdeas', [{ id: Date.now(), text: newIdea.trim(), used: false }, ...ideas])
    setNewIdea('')
  }

  const toggleIdeaUsed = (id) => {
    update('contentIdeas', ideas.map(i => i.id === id ? { ...i, used: !i.used } : i))
  }

  const deleteIdea = (id) => update('contentIdeas', ideas.filter(i => i.id !== id))

  const formatDate = (d) => new Date(d).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })

  const TYPES = CONTENT_TYPES[isAr ? 'ar' : 'en']

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label={isAr ? 'هذا الأسبوع' : 'This Week'}
          value={totalWeek}
          sub={isAr ? 'قطعة' : 'pieces'}
          color="#c9a84c"
        />
        <StatCard
          label={isAr ? 'أفضل منصة' : 'Top Platform'}
          value={mostProductive ? mostProductive[0] : '—'}
          sub={mostProductive ? `${mostProductive[1]}x` : ''}
          color="#3498db"
          small
        />
        <StatCard
          label={isAr ? 'أفضل ليدز' : 'Best Leads'}
          value={bestLeadsPlatform ? bestLeadsPlatform[0] : '—'}
          sub={bestLeadsPlatform ? `avg ${bestLeadsPlatform[1]}` : isAr ? 'لا بيانات' : 'no data'}
          color="#2ecc71"
          small
        />
      </div>

      {/* Content → Revenue Attribution */}
      {revenueAttribution && (
        <div className="rounded-2xl p-3 space-y-1" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs font-bold" style={{ color: '#c9a84c' }}>
            📊 {isAr ? 'ربط المحتوى بالإيرادات' : 'Content → Revenue Attribution'}
          </p>
          <div className="flex gap-2 mt-1">
            <div className="flex-1 rounded-xl p-2 text-center" style={{ background: '#1a1a1a' }}>
              <div className="text-sm font-black" style={{ color: '#2ecc71' }}>{revenueAttribution.avgContentLeads}</div>
              <div className="text-xs" style={{ color: '#888' }}>
                {isAr ? 'وسطي ليدز (أيام محتوى)' : 'Avg leads (content days)'}
              </div>
              <div className="text-xs" style={{ color: '#555' }}>{revenueAttribution.contentDays} {isAr ? 'يوم' : 'days'}</div>
            </div>
            <div className="flex-1 rounded-xl p-2 text-center" style={{ background: '#1a1a1a' }}>
              <div className="text-sm font-black" style={{ color: '#e74c3c' }}>{revenueAttribution.avgNonContentLeads}</div>
              <div className="text-xs" style={{ color: '#888' }}>
                {isAr ? 'وسطي ليدز (بدون محتوى)' : 'Avg leads (no content)'}
              </div>
              <div className="text-xs" style={{ color: '#555' }}>{revenueAttribution.nonContentDays} {isAr ? 'يوم' : 'days'}</div>
            </div>
          </div>
          <p className="text-xs mt-1" style={{ color: '#888' }}>
            {isAr
              ? `أيام نشر المحتوى → وسطي ${revenueAttribution.avgContentLeads} ليدز | بدون نشر → وسطي ${revenueAttribution.avgNonContentLeads} ليدز`
              : `Days with content posted → avg ${revenueAttribution.avgContentLeads} leads | Days without → avg ${revenueAttribution.avgNonContentLeads} leads`}
          </p>
        </div>
      )}

      {/* Smart Content Suggestion */}
      {smartSuggestion && (
        <div className="rounded-2xl p-3" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="text-xs font-bold" style={{ color: '#c9a84c' }}>
            💡 {isAr ? 'اقتراح ذكي للمحتوى' : 'Smart Content Suggestion'}
          </p>
          <p className="text-sm font-bold mt-1" style={{ color: '#fff' }}>
            {isAr
              ? `أفضل تركيبة: ${smartSuggestion.type} على ${smartSuggestion.platform} → وسطي ${smartSuggestion.avg} ليدز`
              : `Your best combo: ${smartSuggestion.type} on ${smartSuggestion.platform} → avg ${smartSuggestion.avg} leads`}
          </p>
          <p className="text-xs mt-1" style={{ color: '#555' }}>
            {isAr
              ? 'بناءً على بيانات المحتوى السابقة'
              : 'Based on your past content performance data'}
          </p>
        </div>
      )}

      {/* Add Content */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl py-3 font-bold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c' }}
        >
          + {isAr ? 'سجّل محتوى جديد' : 'Log New Content'}
        </button>
      ) : (
        <div style={{ ...cardStyle, border: '1px solid rgba(201,168,76,0.2)' }} className="p-4 space-y-3">
          <p style={labelStyle}>📝 {isAr ? 'محتوى جديد' : 'New Content'}</p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'التاريخ' : 'Date'}</label>
              <input type="date" style={{ ...inputStyle, fontSize: 12 }} value={form.date}
                onChange={e => setF('date', e.target.value)} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'المنصة' : 'Platform'}</label>
              <select style={{ ...inputStyle, fontSize: 12 }} value={form.platform} onChange={e => setF('platform', e.target.value)}>
                <option value="">—</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'النوع' : 'Type'}</label>
              <select style={{ ...inputStyle, fontSize: 12 }} value={form.type} onChange={e => setF('type', e.target.value)}>
                <option value="">—</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'ليدز جُمعت' : 'Leads Generated'}</label>
              <input type="number" min="0" style={{ ...inputStyle, fontSize: 12 }} value={form.leadsGenerated}
                placeholder="0" onChange={e => setF('leadsGenerated', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'موضوع المحتوى' : 'Topic'}</label>
            <input style={inputStyle}
              placeholder={isAr ? 'ما هو موضوع المحتوى؟' : 'What is this content about?'}
              value={form.topic} onChange={e => setF('topic', e.target.value)} />
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'مقتطف الكابشن (اختياري)' : 'Caption snippet (optional)'}</label>
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={2}
              placeholder={isAr ? 'أول سطر أو جملة مميزة...' : 'First line or a key sentence...'}
              value={form.caption} onChange={e => setF('caption', e.target.value)} />
          </div>

          <div className="flex gap-2">
            <button onClick={saveLog}
              disabled={!form.platform || !form.type || !form.topic.trim()}
              className="flex-1 btn-gold py-2.5 text-sm disabled:opacity-40">
              {isAr ? 'حفظ' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 text-sm py-2.5 rounded-xl" style={{ background: '#2a2a2a', color: '#888' }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Last 14 days */}
      <div style={cardStyle} className="p-4">
        <p style={labelStyle}>{isAr ? 'آخر 14 يوم' : 'Last 14 Days'}</p>
        {recentLog.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: '#555' }}>
            {isAr ? 'لا يوجد محتوى مسجّل بعد' : 'No content logged yet'}
          </p>
        ) : (
          <div className="space-y-2 mt-2">
            {recentLog.slice(0, 20).map(e => (
              <div key={e.id} className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: '#1a1a1a' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>{e.platform}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#2a2a2a', color: '#888' }}>{e.type}</span>
                    {Number(e.leadsGenerated) > 0 && (
                      <span className="text-xs font-bold" style={{ color: '#2ecc71' }}>+{e.leadsGenerated} leads</span>
                    )}
                    <span className="text-xs" style={{ color: '#555' }}>{formatDate(e.date)}</span>
                  </div>
                  <p className="text-xs text-white mt-0.5 truncate">{e.topic}</p>
                  {e.caption && (
                    <p className="text-xs italic mt-0.5 truncate" style={{ color: '#666' }}>"{e.caption}"</p>
                  )}
                </div>
                <button onClick={() => deleteLog(e.id)} className="flex-shrink-0 text-xs px-1.5 py-1 rounded-lg"
                  style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ideas Bank */}
      <div style={cardStyle} className="p-4">
        <p style={labelStyle}>💡 {isAr ? 'بنك أفكار المحتوى' : 'Content Ideas Bank'}</p>

        <div className="flex gap-2 mt-2">
          <input
            style={{ ...inputStyle, fontSize: 12 }}
            placeholder={isAr ? 'فكرة محتوى جديدة...' : 'New content idea...'}
            value={newIdea}
            onChange={e => setNewIdea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addIdea()}
          />
          <button onClick={addIdea}
            className="flex-shrink-0 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)' }}>
            +
          </button>
        </div>

        {ideas.length === 0 ? (
          <p className="text-xs text-center py-4 mt-2" style={{ color: '#555' }}>
            {isAr ? 'أضف أفكارك هنا لا تنساها' : 'Add ideas here so you never forget them'}
          </p>
        ) : (
          <div className="space-y-1.5 mt-3">
            {ideas.map(idea => (
              <div key={idea.id} className="flex items-center gap-2 rounded-xl p-2" style={{ background: '#1a1a1a' }}>
                <button onClick={() => toggleIdeaUsed(idea.id)}
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border transition-all"
                  style={{
                    borderColor: idea.used ? '#2ecc71' : '#444',
                    background: idea.used ? '#2ecc71' : 'transparent',
                  }}>
                  {idea.used && <span className="text-black text-xs font-black leading-none">✓</span>}
                </button>
                <span className="flex-1 text-xs text-white"
                  style={{ textDecoration: idea.used ? 'line-through' : 'none', opacity: idea.used ? 0.5 : 1 }}>
                  {idea.text}
                </span>
                {idea.used && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71' }}>
                    {isAr ? 'مُستخدم' : 'used'}
                  </span>
                )}
                <button onClick={() => deleteIdea(idea.id)} className="text-xs" style={{ color: '#444' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── TAB 3 — Lead Magnets ──────────────────────────────────────────────────────

function LeadMagnetsTab({ state, update, isAr }) {
  const magnets = state.leadMagnets || []
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...BLANK_MAGNET })
  const [editId, setEditId] = useState(null)

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const TYPES = MAGNET_TYPES[isAr ? 'ar' : 'en']

  const saveMagnet = () => {
    if (!form.name.trim() || !form.type) return
    const entry = { id: editId || Date.now(), ...form }
    if (editId) {
      update('leadMagnets', magnets.map(m => m.id === editId ? entry : m))
    } else {
      update('leadMagnets', [...magnets, entry])
    }
    setForm({ ...BLANK_MAGNET })
    setEditId(null)
    setShowForm(false)
  }

  const openEdit = (m) => {
    setForm({ ...BLANK_MAGNET, ...m })
    setEditId(m.id)
    setShowForm(true)
  }

  const deleteMagnet = (id) => update('leadMagnets', magnets.filter(m => m.id !== id))

  const totalSignups = magnets.reduce((s, m) => s + (Number(m.signups) || 0), 0)
  const avgConversion = magnets.filter(m => Number(m.conversionPct) > 0).length > 0
    ? Math.round(magnets.filter(m => Number(m.conversionPct) > 0)
        .reduce((s, m) => s + Number(m.conversionPct), 0)
        / magnets.filter(m => Number(m.conversionPct) > 0).length)
    : 0

  const bestMagnet = magnets.length > 0
    ? magnets.reduce((best, m) => (Number(m.signups) || 0) > (Number(best.signups) || 0) ? m : best, magnets[0])
    : null

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label={isAr ? 'مغناطيسات' : 'Magnets'} value={magnets.length} color="#c9a84c" />
        <StatCard label={isAr ? 'إجمالي' : 'Total Signups'} value={totalSignups} color="#3498db" />
        <StatCard label={isAr ? 'تحويل وسطي' : 'Avg Conv.'} value={avgConversion ? `${avgConversion}%` : '—'} color="#2ecc71" />
      </div>

      {/* Best performer */}
      {bestMagnet && Number(bestMagnet.signups) > 0 && (
        <div className="rounded-2xl p-3" style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)' }}>
          <p className="text-xs font-bold" style={{ color: '#2ecc71' }}>
            🏆 {isAr ? 'الأفضل أداءً:' : 'Best Performer:'} {bestMagnet.name}
            <span className="font-normal" style={{ color: '#888' }}>
              {' '}— {bestMagnet.signups} {isAr ? 'تسجيل' : 'signups'}
              {bestMagnet.conversionPct ? ` · ${bestMagnet.conversionPct}% ${isAr ? 'تحويل' : 'conv.'}` : ''}
            </span>
          </p>
        </div>
      )}

      {/* Add / Edit Form */}
      {!showForm ? (
        <button
          onClick={() => { setEditId(null); setForm({ ...BLANK_MAGNET }); setShowForm(true) }}
          className="w-full rounded-xl py-3 font-bold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px dashed rgba(201,168,76,0.4)', color: '#c9a84c' }}
        >
          + {isAr ? 'أضف مغناطيس جديد' : 'Add New Lead Magnet'}
        </button>
      ) : (
        <div style={{ ...cardStyle, border: '1px solid rgba(201,168,76,0.2)' }} className="p-4 space-y-3">
          <p style={labelStyle}>🧲 {editId ? (isAr ? 'تعديل المغناطيس' : 'Edit Lead Magnet') : (isAr ? 'مغناطيس جديد' : 'New Lead Magnet')}</p>

          <div>
            <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'اسم المغناطيس' : 'Lead Magnet Name'}</label>
            <input style={inputStyle}
              placeholder={isAr ? 'مثال: دليل الحرية المالية PDF' : 'e.g. Financial Freedom Guide PDF'}
              value={form.name} onChange={e => setF('name', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'النوع' : 'Type'}</label>
              <select style={{ ...inputStyle, fontSize: 12 }} value={form.type} onChange={e => setF('type', e.target.value)}>
                <option value="">—</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'تاريخ الإنشاء' : 'Created Date'}</label>
              <input type="date" style={{ ...inputStyle, fontSize: 12 }}
                value={form.createdDate} onChange={e => setF('createdDate', e.target.value)} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'التنزيلات / التسجيلات' : 'Downloads / Signups'}</label>
              <input type="number" min="0" style={{ ...inputStyle, fontSize: 12 }}
                placeholder="0" value={form.signups} onChange={e => setF('signups', e.target.value)} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#888' }}>{isAr ? 'التحويل إلى مدفوع (%)' : 'Conversion to Paid (%)'}</label>
              <input type="number" min="0" max="100" style={{ ...inputStyle, fontSize: 12 }}
                placeholder="0" value={form.conversionPct} onChange={e => setF('conversionPct', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={saveMagnet}
              disabled={!form.name.trim() || !form.type}
              className="flex-1 btn-gold py-2.5 text-sm disabled:opacity-40">
              {isAr ? 'حفظ' : 'Save'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-4 text-sm py-2.5 rounded-xl" style={{ background: '#2a2a2a', color: '#888' }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Magnet list */}
      {magnets.length === 0 && !showForm ? (
        <div className="text-center py-8" style={{ color: '#555' }}>
          <div className="text-5xl mb-3">🧲</div>
          <p className="text-sm">
            {isAr
              ? 'مغناطيس العملاء هو عرض مجاني يجلب لك الليدز'
              : 'A lead magnet is a free offer that brings you leads'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {magnets.map(m => {
            const signups = Number(m.signups) || 0
            const conv = Number(m.conversionPct) || 0
            const paidEstimate = signups > 0 && conv > 0 ? Math.round(signups * conv / 100) : null

            return (
              <div key={m.id} style={cardStyle} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{m.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: '#2a2a2a', color: '#888' }}>{m.type}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#555' }}>
                      {new Date(m.createdDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(m)} className="text-xs px-2 py-1.5 rounded-lg"
                      style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
                      {isAr ? 'تعديل' : 'Edit'}
                    </button>
                    <button onClick={() => deleteMagnet(m.id)} className="text-xs px-2 py-1.5 rounded-lg"
                      style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c' }}>
                      ✕
                    </button>
                  </div>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="rounded-xl p-2 text-center" style={{ background: '#1a1a1a' }}>
                    <div className="text-base font-black" style={{ color: '#3498db' }}>{signups}</div>
                    <div className="text-xs" style={{ color: '#555' }}>{isAr ? 'تسجيل' : 'Signups'}</div>
                  </div>
                  <div className="rounded-xl p-2 text-center" style={{ background: '#1a1a1a' }}>
                    <div className="text-base font-black" style={{ color: conv > 0 ? '#c9a84c' : '#444' }}>
                      {conv > 0 ? `${conv}%` : '—'}
                    </div>
                    <div className="text-xs" style={{ color: '#555' }}>{isAr ? 'تحويل' : 'Conv.'}</div>
                  </div>
                  <div className="rounded-xl p-2 text-center" style={{ background: '#1a1a1a' }}>
                    <div className="text-base font-black" style={{ color: paidEstimate ? '#2ecc71' : '#444' }}>
                      {paidEstimate !== null ? paidEstimate : '—'}
                    </div>
                    <div className="text-xs" style={{ color: '#555' }}>{isAr ? 'مدفوع تقدير' : 'Paid est.'}</div>
                  </div>
                </div>

                {/* Conversion progress bar */}
                {conv > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full" style={{ background: '#222' }}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(conv, 100)}%`, background: conv >= 10 ? '#2ecc71' : '#c9a84c' }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#555' }}>
                      {conv < 5
                        ? (isAr ? 'تحتاج تحسين التأهيل' : 'Needs better qualification')
                        : conv < 10
                          ? (isAr ? 'أداء جيد' : 'Good performance')
                          : (isAr ? 'أداء ممتاز!' : 'Excellent performance!')}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Chet Holmes tip */}
      {magnets.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: '#0e0e0e', border: '1px solid #1a1a1a' }}>
          <p className="text-xs" style={{ color: '#555' }}>
            {isAr
              ? '💡 Chet Holmes: "مغناطيس العملاء الجيد يُعلّم ولا يبيع — فيجعل الناس يثقون بك قبل أن تعرض أي شيء"'
              : '💡 Chet Holmes: "A great lead magnet teaches, not sells — making people trust you before you offer anything"'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Shared Sub-components ─────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, small }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
      <div className={small ? 'text-sm font-black' : 'text-xl font-black'} style={{ color }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: '#888' }}>{label}</div>
      {sub && <div className="text-xs" style={{ color: '#555' }}>{sub}</div>}
    </div>
  )
}
