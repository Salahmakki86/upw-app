import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const AREAS_META = {
  ar: [
    { key: 'body',          label: 'الجسد والصحة',     emoji: '💪' },
    { key: 'work',          label: 'العمل والمهنة',    emoji: '💼' },
    { key: 'relationships', label: 'العلاقات',         emoji: '❤️' },
    { key: 'learning',      label: 'التعلم والنمو',    emoji: '📚' },
    { key: 'fun',           label: 'الترفيه والمتعة',  emoji: '🎉' },
    { key: 'spirituality',  label: 'الروحانية',        emoji: '🌙' },
    { key: 'rest',          label: 'الراحة والنوم',    emoji: '😴' },
  ],
  en: [
    { key: 'body',          label: 'Body & Health',    emoji: '💪' },
    { key: 'work',          label: 'Work & Career',    emoji: '💼' },
    { key: 'relationships', label: 'Relationships',    emoji: '❤️' },
    { key: 'learning',      label: 'Learning & Growth', emoji: '📚' },
    { key: 'fun',           label: 'Fun & Recreation', emoji: '🎉' },
    { key: 'spirituality',  label: 'Spirituality',     emoji: '🌙' },
    { key: 'rest',          label: 'Rest & Sleep',     emoji: '😴' },
  ],
}

const WEEK_DAYS = {
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

const BLOCK_LABELS = {
  ar: ['الصباح', 'الظهيرة', 'المساء'],
  en: ['Morning', 'Afternoon', 'Evening'],
}

const TOTAL_HOURS = 168

export default function TimeOfLife() {
  const { state, updateTimeOfLife } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const tol     = state.timeOfLife || {}
  const areas   = tol.areas   || {}
  const bigRocks = tol.bigRocks || ['', '', '', '', '']
  const timeValues = tol.timeValues || ''
  const weekTemplate = tol.weekTemplate || {}

  const [activeSection, setActiveSection] = useState('analysis')

  const AREAS = AREAS_META[lang]

  const totalCurrentHours = AREAS.reduce((sum, a) => {
    return sum + Number((areas[a.key] || {}).current || 0)
  }, 0)
  const totalIdealHours = AREAS.reduce((sum, a) => {
    return sum + Number((areas[a.key] || {}).ideal || 0)
  }, 0)

  const setAreaVal = (key, field, val) => {
    const prev = areas[key] || { current: 0, ideal: 0 }
    updateTimeOfLife('areas', { ...areas, [key]: { ...prev, [field]: val } })
  }

  const setBigRock = (i, val) => {
    const arr = [...bigRocks]
    arr[i] = val
    updateTimeOfLife('bigRocks', arr)
  }

  const setWeekBlock = (day, block, val) => {
    const dayData = weekTemplate[day] || {}
    updateTimeOfLife('weekTemplate', {
      ...weekTemplate,
      [day]: { ...dayData, [block]: val }
    })
  }

  const sections = [
    { key: 'analysis',  labelAr: 'تحليل الوقت',  labelEn: 'Time Analysis',    emoji: '📊' },
    { key: 'bigRocks',  labelAr: 'الصخور الكبيرة', labelEn: 'Big Rocks',       emoji: '🪨' },
    { key: 'weekly',    labelAr: 'نمط أسبوعي',    labelEn: 'Weekly Template',   emoji: '📅' },
    { key: 'values',    labelAr: 'قيم الوقت',     labelEn: 'Time Values',       emoji: '💎' },
  ]

  return (
    <Layout title={t('time_title')} subtitle={t('time_subtitle')}>
      <div className="space-y-4 pt-2">

        {/* 168 Hours Banner */}
        <div className="rounded-2xl p-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(26,188,156,0.12), #1a1a1a)', border: '1px solid rgba(26,188,156,0.3)' }}>
          <p className="text-4xl font-black" style={{ color: '#1abc9c' }}>168</p>
          <p className="text-xs mt-1 font-bold" style={{ color: '#888' }}>
            {isAr ? 'ساعة متاحة كل أسبوع — كيف تستخدمها؟' : 'hours available every week — how are you using them?'}
          </p>
        </div>

        {/* Section Tabs */}
        <div className="grid grid-cols-4 gap-1.5">
          {sections.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-center"
              style={{
                background: activeSection === s.key ? 'rgba(26,188,156,0.15)' : '#1a1a1a',
                border: `1px solid ${activeSection === s.key ? 'rgba(26,188,156,0.4)' : '#2a2a2a'}`,
              }}>
              <span>{s.emoji}</span>
              <span className="text-xs font-bold" style={{ color: activeSection === s.key ? '#1abc9c' : '#555', fontSize: 9 }}>
                {isAr ? s.labelAr : s.labelEn}
              </span>
            </button>
          ))}
        </div>

        {/* Section 1: Time Analysis */}
        {activeSection === 'analysis' && (
          <div className="space-y-3">
            <div className="flex justify-between text-xs px-1">
              <span style={{ color: '#888' }}>{isAr ? 'الساعات المستخدمة حالياً' : 'Current hours used'}</span>
              <span style={{ color: totalCurrentHours > TOTAL_HOURS ? '#e63946' : '#1abc9c' }} className="font-bold">
                {totalCurrentHours} / {TOTAL_HOURS}
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
              <div className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((totalCurrentHours / TOTAL_HOURS) * 100, 100)}%`,
                  background: totalCurrentHours > TOTAL_HOURS ? '#e63946' : 'linear-gradient(90deg, #1abc9c, #2ecc71)',
                }} />
            </div>

            {AREAS.map(area => {
              const areaData  = areas[area.key] || { current: 0, ideal: 0 }
              const current   = Number(areaData.current || 0)
              const ideal     = Number(areaData.ideal   || 0)
              const gap       = ideal - current
              return (
                <div key={area.key} className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{area.emoji}</span>
                    <span className="text-sm font-bold text-white">{area.label}</span>
                    {gap !== 0 && (
                      <span className="text-xs ml-auto px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: gap > 0 ? 'rgba(46,204,113,0.1)' : 'rgba(230,57,70,0.1)',
                          color: gap > 0 ? '#2ecc71' : '#e63946',
                        }}>
                        {gap > 0 ? '+' : ''}{gap}h
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#666' }}>{isAr ? 'الحالي (ساعة/أسبوع)' : 'Current (hrs/week)'}</p>
                      <input
                        type="range" min={0} max={80} value={current}
                        onChange={e => setAreaVal(area.key, 'current', Number(e.target.value))}
                        className="w-full"
                        style={{ accentColor: '#e63946' }}
                      />
                      <p className="text-xs font-bold text-center" style={{ color: '#e63946' }}>{current}h</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#666' }}>{isAr ? 'المثالي (ساعة/أسبوع)' : 'Ideal (hrs/week)'}</p>
                      <input
                        type="range" min={0} max={80} value={ideal}
                        onChange={e => setAreaVal(area.key, 'ideal', Number(e.target.value))}
                        className="w-full"
                        style={{ accentColor: '#1abc9c' }}
                      />
                      <p className="text-xs font-bold text-center" style={{ color: '#1abc9c' }}>{ideal}h</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Ideal total */}
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(26,188,156,0.08)', border: '1px solid rgba(26,188,156,0.2)' }}>
              <p className="text-xs" style={{ color: '#888' }}>
                {isAr ? 'إجمالي الساعات المثالية:' : 'Total ideal hours:'}{' '}
                <span className="font-black" style={{ color: totalIdealHours > TOTAL_HOURS ? '#e63946' : '#1abc9c' }}>
                  {totalIdealHours} / {TOTAL_HOURS}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Section 2: Big Rocks */}
        {activeSection === 'bigRocks' && (
          <div className="space-y-3">
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
                {isAr
                  ? 'الصخور الكبيرة هي أولوياتك الأهم — ضعها في تقويمك أولاً قبل أي شيء آخر.'
                  : 'Big Rocks are your most important priorities — schedule them first before anything else.'}
              </p>
            </div>
            {bigRocks.map((rock, i) => (
              <div key={i} className="card flex items-center gap-3">
                <span className="text-xl flex-shrink-0">🪨</span>
                <div className="flex-1">
                  <p className="text-xs mb-1 font-bold" style={{ color: '#c9a84c' }}>
                    {isAr ? `الأولوية ${i + 1}` : `Priority ${i + 1}`}
                  </p>
                  <input
                    value={rock}
                    onChange={e => setBigRock(i, e.target.value)}
                    placeholder={isAr ? 'أهم شيء في حياتك...' : 'Most important thing in your life...'}
                    className="input-dark text-sm w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section 3: Weekly Template */}
        {activeSection === 'weekly' && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#888' }}>
              {isAr ? 'خطط بلوكات وقتك الأسبوعية (صباح / ظهر / مساء)' : 'Plan your weekly time blocks (Morning / Afternoon / Evening)'}
            </p>
            {WEEK_DAYS[lang].map((day, di) => (
              <div key={di} className="card">
                <p className="text-sm font-bold text-white mb-2">{day}</p>
                <div className="grid grid-cols-3 gap-2">
                  {BLOCK_LABELS[lang].map((block, bi) => (
                    <div key={bi}>
                      <p className="text-xs mb-1 font-bold" style={{ color: '#666' }}>{block}</p>
                      <input
                        value={(weekTemplate[di] || {})[bi] || ''}
                        onChange={e => setWeekBlock(di, bi, e.target.value)}
                        placeholder="..."
                        className="input-dark text-xs w-full py-1.5"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section 4: Time Values */}
        {activeSection === 'values' && (
          <div className="space-y-4">
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.2)' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
                {isAr
                  ? 'ماذا يعني لك الوقت؟ كيف تريد أن تستثمر حياتك؟ ما الإرث الذي تريد تركه؟'
                  : 'What does time mean to you? How do you want to invest your life? What legacy do you want to leave?'}
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-bold text-white mb-2">
                {isAr ? '💎 قيمة الوقت في حياتي' : '💎 What time means in my life'}
              </p>
              <textarea
                value={timeValues}
                onChange={e => updateTimeOfLife('timeValues', e.target.value)}
                placeholder={isAr
                  ? 'اكتب تأملك حول الوقت، ما يعنيه لك، وكيف تريد استثماره...'
                  : 'Write your reflection on time, what it means to you, and how you want to invest it...'}
                rows={8}
                className="input-dark resize-none text-sm w-full"
              />
            </div>

            {/* RPM Quote */}
            <div className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(26,188,156,0.07)', border: '1px solid rgba(26,188,156,0.15)' }}>
              <p className="text-sm font-bold" style={{ color: '#1abc9c' }}>
                {isAr
                  ? '"لا تدير وقتك — أدر حياتك"'
                  : '"Don\'t manage your time — manage your life"'}
              </p>
              <p className="text-xs mt-1" style={{ color: '#555' }}>— Tony Robbins</p>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
