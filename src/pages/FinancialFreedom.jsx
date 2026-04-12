import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const LEVELS_DATA = {
  ar: [
    {
      num: 1,
      name: 'الأمن المالي',
      desc: 'تغطية احتياجاتك الأساسية (سكن، طعام، مواصلات، رعاية صحية) من الدخل السلبي.',
      requirements: 'دخل سلبي يغطي أساسيات معيشتك الشهرية.',
      strategies: ['صندوق الطوارئ 3-6 أشهر', 'تأمين صحي', 'استثمار بسيط في صناديق المؤشرات', 'خفض الديون'],
      color: '#e63946',
      emoji: '🏠',
    },
    {
      num: 2,
      name: 'الحيوية المالية',
      desc: 'تغطية نصف مصاريفك الترفيهية من الدخل السلبي، مع تغطية الاحتياجات بالكامل.',
      requirements: 'دخل سلبي يغطي الاحتياجات + 50% من الكماليات.',
      strategies: ['استثمار منتظم شهري', 'عقار للإيجار', 'توزيعات أسهم', 'مشروع جانبي'],
      color: '#e67e22',
      emoji: '⚡',
    },
    {
      num: 3,
      name: 'الراحة المالية',
      desc: 'تغطية كل مصاريفك الحالية بالكامل من الدخل السلبي.',
      requirements: 'الدخل السلبي = إجمالي مصاريفك الشهرية.',
      strategies: ['محفظة استثمارية متنوعة', 'عقارات متعددة', 'أعمال تعمل بدونك', 'ملكية فكرية'],
      color: '#f1c40f',
      emoji: '🌟',
    },
    {
      num: 4,
      name: 'الاستقلال المالي',
      desc: 'العيش بأسلوب حياتك المطلوب كاملاً من الدخل السلبي.',
      requirements: 'الدخل السلبي يمول أسلوب حياتك المرغوب.',
      strategies: ['محفظة 25x مصاريفك السنوية', 'قاعدة 4% للسحب', 'دخل متعدد المصادر', 'بناء الثروة بثبات'],
      color: '#2ecc71',
      emoji: '🦅',
    },
    {
      num: 5,
      name: 'الحرية المالية',
      desc: 'العيش بأسلوب حياتك الحلم مع كماليات إضافية من الدخل السلبي.',
      requirements: 'الدخل السلبي يفوق مصاريف حياتك الحلم.',
      strategies: ['استثمارات ضخمة متنوعة', 'سفر وتجارب', 'عقارات تجارية', 'أسهم النمو'],
      color: '#3498db',
      emoji: '✈️',
    },
    {
      num: 6,
      name: 'الثروة المطلقة',
      desc: 'دخل سلبي يعادل 5 أضعاف مصاريف حياتك الحلم.',
      requirements: 'الدخل السلبي = 5x مصاريف حياتك الحلم.',
      strategies: ['صناديق الاستثمار الكبيرة', 'ملكية شركات', 'استثمارات بديلة', 'ميراث جيلي'],
      color: '#9b59b6',
      emoji: '💎',
    },
    {
      num: 7,
      name: 'الوفرة المطلقة',
      desc: 'لا حدود للثروة — قادر على العطاء بشكل هائل وتغيير العالم.',
      requirements: 'ثروة لا محدودة — مُرَكَّبة ومتنامية تلقائياً.',
      strategies: ['مؤسسات خيرية', 'صناديق العائلة', 'استثمارات عالمية', 'إرث ومساهمة كبرى'],
      color: '#c9a84c',
      emoji: '🌍',
    },
  ],
  en: [
    {
      num: 1,
      name: 'Financial Security',
      desc: 'Your basic needs (housing, food, transport, healthcare) are covered by passive income.',
      requirements: 'Passive income covers your basic monthly living needs.',
      strategies: ['3-6 month emergency fund', 'Health insurance', 'Index fund investing', 'Reduce debt'],
      color: '#e63946',
      emoji: '🏠',
    },
    {
      num: 2,
      name: 'Financial Vitality',
      desc: 'Half your lifestyle extras are covered by passive income, with all basics fully covered.',
      requirements: 'Passive income covers needs + 50% of luxuries.',
      strategies: ['Monthly automatic investing', 'Rental property', 'Dividend stocks', 'Side business'],
      color: '#e67e22',
      emoji: '⚡',
    },
    {
      num: 3,
      name: 'Financial Comfort',
      desc: 'All your current expenses are covered by passive income.',
      requirements: 'Passive income = your total monthly expenses.',
      strategies: ['Diversified investment portfolio', 'Multiple properties', 'Business that runs without you', 'Intellectual property'],
      color: '#f1c40f',
      emoji: '🌟',
    },
    {
      num: 4,
      name: 'Financial Independence',
      desc: 'Your desired lifestyle is fully funded by passive income.',
      requirements: 'Passive income funds your desired lifestyle.',
      strategies: ['25x annual expenses portfolio', '4% withdrawal rule', 'Multiple income sources', 'Steady wealth building'],
      color: '#2ecc71',
      emoji: '🦅',
    },
    {
      num: 5,
      name: 'Financial Freedom',
      desc: 'Your dream lifestyle plus extras is funded by passive income.',
      requirements: 'Passive income exceeds your dream lifestyle expenses.',
      strategies: ['Large diversified investments', 'Travel and experiences', 'Commercial real estate', 'Growth stocks'],
      color: '#3498db',
      emoji: '✈️',
    },
    {
      num: 6,
      name: 'Absolute Wealth',
      desc: 'Passive income equals 5x your dream lifestyle expenses.',
      requirements: 'Passive income = 5x your dream lifestyle.',
      strategies: ['Large investment funds', 'Business ownership', 'Alternative investments', 'Generational wealth'],
      color: '#9b59b6',
      emoji: '💎',
    },
    {
      num: 7,
      name: 'Absolute Abundance',
      desc: 'Unlimited wealth — able to give massively and change the world.',
      requirements: 'Unlimited, compounding wealth that grows automatically.',
      strategies: ['Charitable foundations', 'Family office', 'Global investments', 'Massive legacy & contribution'],
      color: '#c9a84c',
      emoji: '🌍',
    },
  ],
}

const BUCKET_CONFIG = {
  ar: [
    {
      key: 'security',
      label: 'الأمان',
      sublabel: 'Bucket 1',
      desc: 'مخاطرة منخفضة، نمو ثابت — سندات، أسواق المال، المعاشات. الهدف: لا تخسر أصلك أبداً.',
      emoji: '🛡️',
      color: '#2ecc71',
      defaultTarget: 60,
      defaultItems: ['سندات حكومية', 'صناديق سوق المال', 'معاشات'],
    },
    {
      key: 'growth',
      label: 'النمو والمخاطرة',
      sublabel: 'Bucket 2',
      desc: 'مخاطرة أعلى، عوائد أعلى — أسهم، عقارات، أسهم خاصة.',
      emoji: '📈',
      color: '#3498db',
      defaultTarget: 30,
      defaultItems: ['أسهم النمو', 'صناديق الاستثمار العقاري', 'أسهم خاصة'],
    },
    {
      key: 'dream',
      label: 'الأحلام',
      sublabel: 'Bucket 3',
      desc: 'مخاطرة عالية / مضاربة / متعة — كريبتو، ستارتأب، استثمارات جريئة.',
      emoji: '🚀',
      color: '#e67e22',
      defaultTarget: 10,
      defaultItems: ['عملات مشفرة', 'شركات ناشئة', 'استثمارات بديلة'],
    },
  ],
  en: [
    {
      key: 'security',
      label: 'Security',
      sublabel: 'Bucket 1',
      desc: 'Low-risk, steady growth — bonds, money market, annuities. Goal: never lose your principal.',
      emoji: '🛡️',
      color: '#2ecc71',
      defaultTarget: 60,
      defaultItems: ['Government bonds', 'Money market funds', 'Annuities'],
    },
    {
      key: 'growth',
      label: 'Risk / Growth',
      sublabel: 'Bucket 2',
      desc: 'Higher risk/reward — stocks, real estate, private equity.',
      emoji: '📈',
      color: '#3498db',
      defaultTarget: 30,
      defaultItems: ['Growth stocks', 'REITs', 'Private equity'],
    },
    {
      key: 'dream',
      label: 'Dream',
      sublabel: 'Bucket 3',
      desc: 'Risky / speculative / fun money — crypto, startups, bold bets.',
      emoji: '🚀',
      color: '#e67e22',
      defaultTarget: 10,
      defaultItems: ['Crypto', 'Startup investments', 'Alternative assets'],
    },
  ],
}

function calcLevel(monthlyPassive, monthlyExpenses) {
  const ratio = monthlyExpenses > 0 ? monthlyPassive / monthlyExpenses : 0
  if (ratio <= 0) return 1
  if (ratio < 0.3) return 1
  if (ratio < 0.7) return 2
  if (ratio < 1.0) return 3
  if (ratio < 1.5) return 4
  if (ratio < 3.0) return 5
  if (ratio < 5.0) return 6
  return 7
}

export default function FinancialFreedom() {
  const { state, updateFinancialFreedom } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const ff = state.financialFreedom || {}
  const monthlyPassive  = Number(ff.monthlyPassive  || 0)
  const monthlyExpenses = Number(ff.monthlyExpenses || 5000)
  const netWorth        = Number(ff.netWorth        || 0)
  const levelNotes      = ff.levelNotes || {}

  const autoLevel = calcLevel(monthlyPassive, monthlyExpenses)
  const LEVELS    = LEVELS_DATA[lang]
  const BUCKETS   = BUCKET_CONFIG[lang]

  const [expandedLevel, setExpandedLevel] = useState(null)
  const [editNote, setEditNote] = useState(null)
  const [noteText, setNoteText] = useState('')

  // Bucket state helpers
  const [newBucketItem, setNewBucketItem] = useState({ security: '', growth: '', dream: '' })

  const rawBuckets = ff.buckets || {}
  const getBucket = (key, cfg) => ({
    target:  rawBuckets[key]?.target  ?? cfg.defaultTarget,
    current: rawBuckets[key]?.current ?? 0,
    items:   rawBuckets[key]?.items   ?? [...cfg.defaultItems],
  })

  const bucketData = BUCKETS.reduce((acc, cfg) => {
    acc[cfg.key] = getBucket(cfg.key, cfg)
    return acc
  }, {})

  const updateBucket = (key, patch) => {
    const updated = {
      ...BUCKETS.reduce((a, c) => ({ ...a, [c.key]: bucketData[c.key] }), {}),
      [key]: { ...bucketData[key], ...patch },
    }
    updateFinancialFreedom('buckets', updated)
  }

  const addBucketItem = (key) => {
    const text = newBucketItem[key]?.trim()
    if (!text) return
    const items = [...bucketData[key].items, text]
    updateBucket(key, { items })
    setNewBucketItem(prev => ({ ...prev, [key]: '' }))
  }

  const removeBucketItem = (key, idx) => {
    const items = bucketData[key].items.filter((_, i) => i !== idx)
    updateBucket(key, { items })
  }

  const pct = monthlyExpenses > 0 ? Math.min((monthlyPassive / monthlyExpenses) * 100, 100) : 0

  const saveNote = (num) => {
    const newNotes = { ...levelNotes, [num]: noteText }
    updateFinancialFreedom('levelNotes', newNotes)
    setEditNote(null)
    setNoteText('')
  }

  // Bucket calculations
  const totalPortfolio = BUCKETS.reduce((sum, cfg) => sum + Number(bucketData[cfg.key].current || 0), 0)

  const getBucketActualPct = (key) => {
    if (totalPortfolio <= 0) return 0
    return (Number(bucketData[key].current || 0) / totalPortfolio) * 100
  }

  const rebalanceAlerts = BUCKETS.filter(cfg => {
    const actual = getBucketActualPct(cfg.key)
    const target = Number(bucketData[cfg.key].target || 0)
    return totalPortfolio > 0 && Math.abs(actual - target) > 10
  })

  return (
    <Layout title={t('freedom_title')} subtitle={t('freedom_subtitle')} helpKey="freedom">
      <div className="space-y-4 pt-2">

        {/* Current Level Badge */}
        <div className="rounded-2xl p-5 text-center"
          style={{ background: `linear-gradient(135deg, ${LEVELS[autoLevel - 1].color}18, #1a1a1a)`, border: `2px solid ${LEVELS[autoLevel - 1].color}44` }}>
          <p className="text-xs font-bold mb-1" style={{ color: LEVELS[autoLevel - 1].color }}>
            {isAr ? 'مستواك الحالي' : 'Your Current Level'}
          </p>
          <p className="text-5xl mb-2">{LEVELS[autoLevel - 1].emoji}</p>
          <p className="text-xl font-black text-white">{LEVELS[autoLevel - 1].name}</p>
          <p className="text-xs mt-2" style={{ color: '#888' }}>
            {isAr ? `المستوى ${autoLevel} من 7` : `Level ${autoLevel} of 7`}
          </p>
        </div>

        {/* Input Fields */}
        <div className="card space-y-3">
          <p className="text-sm font-bold text-white mb-1">{isAr ? '📊 بياناتك المالية' : '📊 Your Financial Data'}</p>
          {[
            { key: 'netWorth',        labelAr: 'صافي الثروة',           labelEn: 'Net Worth',               val: ff.netWorth        || 0 },
            { key: 'monthlyPassive',  labelAr: 'الدخل السلبي الشهري',   labelEn: 'Monthly Passive Income',  val: ff.monthlyPassive  || 0 },
            { key: 'monthlyExpenses', labelAr: 'المصاريف الشهرية',      labelEn: 'Monthly Expenses',        val: ff.monthlyExpenses || 5000 },
          ].map(field => (
            <div key={field.key}>
              <p className="text-xs mb-1" style={{ color: '#888' }}>{isAr ? field.labelAr : field.labelEn}</p>
              <input
                type="number"
                value={field.val}
                onChange={e => updateFinancialFreedom(field.key, Number(e.target.value))}
                className="input-dark text-sm w-full"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="card">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: '#888' }}>{isAr ? 'نسبة تغطية المصاريف بالدخل السلبي' : 'Passive income coverage ratio'}</span>
            <span style={{ color: '#c9a84c' }} className="font-bold">{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
            <div className="h-3 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${LEVELS[autoLevel - 1].color}, ${LEVELS[Math.min(autoLevel, 6)].color})` }} />
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: '#666' }}>
            {isAr
              ? `${monthlyPassive.toLocaleString()} / ${monthlyExpenses.toLocaleString()} شهرياً`
              : `${monthlyPassive.toLocaleString()} / ${monthlyExpenses.toLocaleString()} per month`}
          </p>
        </div>

        {/* Vertical Ladder */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            {isAr ? '🪜 سلم الحرية المالية' : '🪜 Financial Freedom Ladder'}
          </p>
          <div className="space-y-2">
            {[...LEVELS].reverse().map((level) => {
              const isCurrentLevel = level.num === autoLevel
              const isAbove        = level.num > autoLevel
              const isExpanded     = expandedLevel === level.num

              return (
                <div key={level.num}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: isCurrentLevel ? `${level.color}12` : '#1a1a1a',
                    border: `1px solid ${isCurrentLevel ? level.color + '55' : '#2a2a2a'}`,
                    opacity: isAbove ? 0.5 : 1,
                  }}>
                  <button
                    onClick={() => setExpandedLevel(isExpanded ? null : level.num)}
                    className="w-full flex items-center gap-3 p-4 text-right">
                    <span className="text-2xl flex-shrink-0">{isAbove ? '🔒' : level.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                          style={{ background: `${level.color}20`, color: level.color }}>
                          {isAr ? `${level.num}` : `${level.num}`}
                        </span>
                        <span className="font-bold text-white text-sm">{level.name}</span>
                        {isCurrentLevel && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: '#c9a84c20', color: '#c9a84c' }}>
                            {isAr ? '← أنت هنا' : '← You are here'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ color: '#555' }}>{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 animate-fade-in" style={{ borderTop: '1px solid #222' }}>
                      <p className="text-xs leading-relaxed pt-3" style={{ color: '#aaa' }}>{level.desc}</p>
                      <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
                          {isAr ? '⚡ المتطلبات:' : '⚡ Requirements:'}
                        </p>
                        <p className="text-xs" style={{ color: '#888' }}>{level.requirements}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold mb-2" style={{ color: '#2ecc71' }}>
                          {isAr ? '🎯 استراتيجيات:' : '🎯 Strategies:'}
                        </p>
                        <div className="space-y-1">
                          {level.strategies.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#aaa' }}>
                              <span style={{ color: level.color }}>•</span>{s}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <p className="text-xs font-bold mb-1" style={{ color: '#888' }}>
                          {isAr ? '📝 ملاحظاتي:' : '📝 My Notes:'}
                        </p>
                        {editNote === level.num ? (
                          <div className="space-y-2">
                            <textarea
                              value={noteText}
                              onChange={e => setNoteText(e.target.value)}
                              placeholder={isAr ? 'اكتب ملاحظاتك...' : 'Write your notes...'}
                              rows={3}
                              className="input-dark resize-none text-xs w-full"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveNote(level.num)}
                                className="flex-1 py-1.5 rounded-xl text-xs font-bold"
                                style={{ background: 'rgba(46,204,113,0.15)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.3)' }}>
                                {isAr ? 'حفظ' : 'Save'}
                              </button>
                              <button onClick={() => setEditNote(null)}
                                className="px-3 py-1.5 rounded-xl text-xs"
                                style={{ color: '#555' }}>
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditNote(level.num); setNoteText(levelNotes[level.num] || '') }}
                            className="w-full text-right rounded-xl p-2.5 text-xs transition-all"
                            style={{ background: '#111', border: '1px dashed #333', color: levelNotes[level.num] ? '#aaa' : '#444' }}>
                            {levelNotes[level.num] || (isAr ? '+ أضف ملاحظة...' : '+ Add note...')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Next Level Tip */}
        {autoLevel < 7 && (
          <div className="rounded-2xl p-4"
            style={{ background: `${LEVELS[autoLevel].color}10`, border: `1px solid ${LEVELS[autoLevel].color}30` }}>
            <p className="text-xs font-bold mb-1" style={{ color: LEVELS[autoLevel].color }}>
              {isAr ? `🚀 المستوى التالي: ${LEVELS[autoLevel].name}` : `🚀 Next Level: ${LEVELS[autoLevel].name}`}
            </p>
            <p className="text-xs" style={{ color: '#888' }}>{LEVELS[autoLevel].requirements}</p>
          </div>
        )}

        {/* ─────────────────────────────────────────────── */}
        {/* 3-Bucket System */}
        {/* ─────────────────────────────────────────────── */}
        <div>
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #0d1a0d, #1a1a1a)', border: '1px solid rgba(46,204,113,0.2)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#2ecc71' }}>
              🪣 {isAr ? 'نظام الدلاء الثلاثة' : '3-Bucket System'}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
              {isAr
                ? 'من كتاب "MONEY Master the Game" لتوني روبينز — قسّم محفظتك إلى ثلاثة دلاء بحسب المخاطرة والهدف.'
                : 'From Tony Robbins\' "MONEY Master the Game" — divide your portfolio into 3 buckets by risk level and purpose.'}
            </p>
          </div>

          {/* Bucket Cards */}
          <div className="space-y-4">
            {BUCKETS.map(cfg => {
              const bd = bucketData[cfg.key]
              const currentNum = Number(bd.current || 0)
              const targetPct  = Number(bd.target  || 0)
              const actualPct  = getBucketActualPct(cfg.key)
              const fillPct    = targetPct > 0 ? Math.min((actualPct / targetPct) * 100, 100) : 0

              return (
                <div key={cfg.key} className="rounded-2xl overflow-hidden"
                  style={{ background: '#1a1a1a', border: `1px solid ${cfg.color}33` }}>

                  {/* Bucket Header */}
                  <div className="px-4 pt-4 pb-3 flex items-center gap-3"
                    style={{ borderBottom: `1px solid ${cfg.color}22` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}33` }}>
                      {cfg.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${cfg.color}20`, color: cfg.color }}>
                          {cfg.sublabel}
                        </span>
                        <span className="font-black text-white text-sm">{cfg.label}</span>
                      </div>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#666' }}>{cfg.desc}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">

                    {/* Target % and Current Amount */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs mb-1.5" style={{ color: '#888' }}>
                          {isAr ? 'النسبة المستهدفة (%)' : 'Target % of portfolio'}
                        </p>
                        <input
                          type="number"
                          min="0" max="100"
                          value={bd.target}
                          onChange={e => updateBucket(cfg.key, { target: Number(e.target.value) })}
                          style={{ background: '#111', border: `1px solid ${cfg.color}33`, color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <p className="text-xs mb-1.5" style={{ color: '#888' }}>
                          {isAr ? 'المبلغ الحالي' : 'Current amount'}
                        </p>
                        <input
                          type="number"
                          min="0"
                          value={bd.current}
                          onChange={e => updateBucket(cfg.key, { current: Number(e.target.value) })}
                          style={{ background: '#111', border: `1px solid ${cfg.color}33`, color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', fontSize: 13 }}
                        />
                      </div>
                    </div>

                    {/* Fill the Bucket Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-xs font-bold" style={{ color: cfg.color }}>
                          {isAr ? 'امتلاء الدلو' : 'Fill the Bucket'}
                        </p>
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#888' }}>
                          <span style={{ color: cfg.color, fontWeight: 'bold' }}>{actualPct.toFixed(1)}%</span>
                          <span>{isAr ? 'من' : '/'}</span>
                          <span>{targetPct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-4 rounded-full overflow-hidden relative" style={{ background: '#111' }}>
                        <div
                          className="h-4 rounded-full transition-all duration-700"
                          style={{
                            width: `${fillPct}%`,
                            background: `linear-gradient(90deg, ${cfg.color}99, ${cfg.color})`,
                          }}
                        />
                        {fillPct >= 100 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-black text-white" style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
                              {isAr ? '✓ مكتمل' : '✓ Full'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* What goes in this bucket */}
                    <div>
                      <p className="text-xs font-bold mb-2" style={{ color: '#888' }}>
                        {isAr ? 'محتويات هذا الدلو:' : 'What goes in this bucket:'}
                      </p>
                      <div className="space-y-1.5 mb-2">
                        {bd.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                              style={{ background: '#111', border: `1px solid ${cfg.color}22`, color: '#aaa' }}>
                              <span style={{ color: cfg.color }}>•</span>
                              {item}
                            </div>
                            <button
                              onClick={() => removeBucketItem(cfg.key, idx)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs transition-all"
                              style={{ background: 'rgba(230,57,70,0.1)', color: '#e63946', border: '1px solid rgba(230,57,70,0.2)' }}>
                              −
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={newBucketItem[cfg.key] || ''}
                          onChange={e => setNewBucketItem(prev => ({ ...prev, [cfg.key]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addBucketItem(cfg.key)}
                          placeholder={isAr ? 'أضف عنصراً...' : 'Add item...'}
                          style={{ background: '#111', border: `1px solid ${cfg.color}33`, color: 'white', borderRadius: 8, padding: '7px 12px', flex: 1, fontSize: 12 }}
                        />
                        <button
                          onClick={() => addBucketItem(cfg.key)}
                          className="px-3 rounded-lg text-sm font-black transition-all"
                          style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>

          {/* Portfolio Summary */}
          <div className="mt-4 rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-black text-white">
                {isAr ? '📊 إجمالي المحفظة' : '📊 Total Portfolio'}
              </p>
              <p className="text-lg font-black" style={{ color: '#c9a84c' }}>
                {totalPortfolio.toLocaleString()}
              </p>
            </div>

            {/* Allocation Pie Bar */}
            {totalPortfolio > 0 ? (
              <div>
                <p className="text-xs mb-2" style={{ color: '#666' }}>
                  {isAr ? 'توزيع المحفظة:' : 'Portfolio allocation:'}
                </p>
                <div className="flex w-full h-8 rounded-xl overflow-hidden">
                  {BUCKETS.map(cfg => {
                    const pctVal = getBucketActualPct(cfg.key)
                    if (pctVal <= 0) return null
                    return (
                      <div
                        key={cfg.key}
                        className="flex items-center justify-center transition-all duration-500"
                        style={{
                          width: `${pctVal}%`,
                          background: cfg.color,
                          minWidth: pctVal > 0 ? 2 : 0,
                        }}>
                        {pctVal > 8 && (
                          <span className="text-xs font-black text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                            {pctVal.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-2">
                  {BUCKETS.map(cfg => (
                    <div key={cfg.key} className="flex items-center gap-1.5 text-xs" style={{ color: '#888' }}>
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: cfg.color }} />
                      <span>{cfg.emoji} {cfg.label}</span>
                      <span style={{ color: cfg.color, fontWeight: 'bold' }}>{getBucketActualPct(cfg.key).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-center py-2" style={{ color: '#444' }}>
                {isAr ? 'أضف مبالغ للدلاء لرؤية التوزيع' : 'Add amounts to buckets to see allocation'}
              </p>
            )}
          </div>

          {/* Rebalancing Alerts */}
          {rebalanceAlerts.length > 0 && (
            <div className="mt-3 rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <p className="text-xs font-black mb-2" style={{ color: '#c9a84c' }}>
                ⚖️ {isAr ? 'تنبيه: إعادة التوازن مطلوبة' : 'Rebalancing Alert'}
              </p>
              <div className="space-y-2">
                {rebalanceAlerts.map(cfg => {
                  const actual = getBucketActualPct(cfg.key)
                  const target = Number(bucketData[cfg.key].target || 0)
                  const diff   = actual - target
                  return (
                    <div key={cfg.key} className="flex items-center gap-2 text-xs" style={{ color: '#aaa' }}>
                      <span>{cfg.emoji}</span>
                      <span className="font-bold" style={{ color: cfg.color }}>{cfg.label}:</span>
                      <span>
                        {isAr
                          ? `${actual.toFixed(1)}% (الهدف: ${target}%) — ${diff > 0 ? 'أعلى' : 'أدنى'} بـ ${Math.abs(diff).toFixed(1)}%`
                          : `${actual.toFixed(1)}% (target: ${target}%) — ${diff > 0 ? 'over' : 'under'} by ${Math.abs(diff).toFixed(1)}%`}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs mt-2" style={{ color: '#666' }}>
                {isAr
                  ? 'يُوصى بإعادة التوازن عند تجاوز الفجوة 10% من الهدف.'
                  : 'Rebalancing is recommended when any bucket drifts more than 10% from its target.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
