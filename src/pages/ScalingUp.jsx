import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'
import { Plus, Trash2, Check } from 'lucide-react'

const TAB_STYLE_ACTIVE = {
  background: 'rgba(201,168,76,0.15)',
  border: '1px solid rgba(201,168,76,0.4)',
  color: '#c9a84c',
}
const TAB_STYLE_INACTIVE = {
  background: '#111',
  border: '1px solid #1e1e1e',
  color: '#666',
}
const CARD_STYLE = {
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
}

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
      {children}
    </p>
  )
}

function FieldLabel({ children }) {
  return (
    <p className="text-xs mb-1.5 font-medium" style={{ color: '#888' }}>
      {children}
    </p>
  )
}

// ─── Tab 1: Plan ─────────────────────────────────────────────────────────────
function TabPlan({ su, updateScalingUp, isAr }) {
  const annualRocks = su.annualRocks || ['', '', '', '', '']
  const quarterlyRocks = su.quarterlyRocks || ['', '', '']

  function setAnnualRock(i, val) {
    const next = [...annualRocks]
    next[i] = val
    updateScalingUp('annualRocks', next)
  }
  function setQuarterlyRock(i, val) {
    const next = [...quarterlyRocks]
    next[i] = val
    updateScalingUp('quarterlyRocks', next)
  }

  return (
    <div>
      {/* BHAG */}
      <div style={CARD_STYLE}>
        <SectionTitle>🎯 BHAG — {isAr ? 'الهدف الكبير الجريء' : 'Big Hairy Audacious Goal'}</SectionTitle>
        <FieldLabel>{isAr ? 'أين ستكون خلال 10-25 سنة؟' : 'Where will you be in 10–25 years?'}</FieldLabel>
        <textarea
          className="input-dark w-full"
          rows={3}
          value={su.bhag || ''}
          onChange={e => updateScalingUp('bhag', e.target.value)}
          placeholder={isAr
            ? 'مثال: أن أكون المدرب رقم 1 في العالم العربي بإيرادات 10 ملايين سنوياً...'
            : 'e.g. Be the #1 coach in my region with $10M annual revenue...'}
        />
      </div>

      {/* Core Purpose */}
      <div style={CARD_STYLE}>
        <SectionTitle>💡 {isAr ? 'الغرض الجوهري' : 'Core Purpose'}</SectionTitle>
        <FieldLabel>{isAr ? 'لماذا توجد؟ ما الذي تبنيه في الوجود؟' : 'Why do you exist? What are you building in the world?'}</FieldLabel>
        <textarea
          className="input-dark w-full"
          rows={3}
          value={su.corePurpose || ''}
          onChange={e => updateScalingUp('corePurpose', e.target.value)}
          placeholder={isAr
            ? 'مثال: تحرير الناس من قيودهم الداخلية وتمكينهم من عيش حياة مزدهرة...'
            : 'e.g. Free people from their internal limits and empower them to live a thriving life...'}
        />
      </div>

      {/* Brand Promise + Core Customer */}
      <div style={CARD_STYLE}>
        <SectionTitle>🤝 {isAr ? 'الوعد والعميل' : 'Brand Promise & Core Customer'}</SectionTitle>
        <FieldLabel>{isAr ? 'وعدك للعميل في جملة واحدة' : 'Your promise to the client in one sentence'}</FieldLabel>
        <input
          className="input-dark w-full mb-4"
          value={su.brandPromise || ''}
          onChange={e => updateScalingUp('brandPromise', e.target.value)}
          placeholder={isAr
            ? 'مثال: نضمن لك تحولاً جذرياً في 90 يوماً أو نعيد لك أموالك...'
            : 'e.g. We guarantee a radical transformation in 90 days or your money back...'}
        />
        <FieldLabel>{isAr ? 'من هو عميلك الأساسي المثالي؟' : 'Who is your ideal core customer?'}</FieldLabel>
        <input
          className="input-dark w-full"
          value={su.coreCustomer || ''}
          onChange={e => updateScalingUp('coreCustomer', e.target.value)}
          placeholder={isAr
            ? 'مثال: رجل/امرأة 28-45 يعاني من ألم نفسي أو مالي ويريد التحول...'
            : 'e.g. Men/women 28–45 experiencing emotional or financial pain who want transformation...'}
        />
      </div>

      {/* 3-5 Year Targets */}
      <div style={CARD_STYLE}>
        <SectionTitle>📈 {isAr ? 'أهداف 3-5 سنوات' : '3–5 Year Targets'}</SectionTitle>
        <FieldLabel>{isAr ? 'الأهداف القابلة للقياس' : 'Measurable targets'}</FieldLabel>
        <textarea
          className="input-dark w-full"
          rows={4}
          value={su.targets3_5 || ''}
          onChange={e => updateScalingUp('targets3_5', e.target.value)}
          placeholder={isAr
            ? 'مثال:\n- إيراد 1M$ سنوياً\n- 5,000 عميل نشط\n- فريق من 10 أشخاص\n- منصة تدريب أونلاين'
            : 'e.g.\n- $1M annual revenue\n- 5,000 active clients\n- Team of 10\n- Online training platform'}
        />
      </div>

      {/* Annual Rocks */}
      <div style={CARD_STYLE}>
        <SectionTitle>🪨 {isAr ? 'الصخور السنوية' : 'Annual Rocks'}</SectionTitle>
        <FieldLabel>{isAr ? 'أهم 5 أشياء هذه السنة' : 'Top 5 priorities this year'}</FieldLabel>
        <div className="space-y-2">
          {annualRocks.map((rock, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold w-16 flex-shrink-0" style={{ color: '#c9a84c' }}>
                {isAr ? `الأولوية ${i + 1}` : `Priority ${i + 1}`}
              </span>
              <input
                className="input-dark flex-1"
                value={rock}
                onChange={e => setAnnualRock(i, e.target.value)}
                placeholder={isAr ? `الأولوية رقم ${i + 1}...` : `Priority ${i + 1}...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quarterly Rocks */}
      <div style={CARD_STYLE}>
        <SectionTitle>⚡ {isAr ? 'الصخور الربعية' : 'Quarterly Rocks'}</SectionTitle>
        <FieldLabel>{isAr ? 'أهم 3 أشياء هذا الربع' : 'Top 3 priorities this quarter'}</FieldLabel>
        <div className="space-y-2">
          {quarterlyRocks.map((rock, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold w-16 flex-shrink-0" style={{ color: '#3498db' }}>
                Q {i + 1}
              </span>
              <input
                className="input-dark flex-1"
                value={rock}
                onChange={e => setQuarterlyRock(i, e.target.value)}
                placeholder={isAr ? `الصخرة ${i + 1} لهذا الربع...` : `Rock ${i + 1} for this quarter...`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab 2: Daily ────────────────────────────────────────────────────────────
function TabDaily({ su, updateScalingUp, today, isAr }) {
  const dailyPriorities = su.dailyPriorities || {}
  const todayData = dailyPriorities[today] || { top1: '', top3: [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }] }

  function updateTodayTop1(val) {
    const next = { ...dailyPriorities, [today]: { ...todayData, top1: val } }
    updateScalingUp('dailyPriorities', next)
  }

  function updateTop3Item(i, field, val) {
    const top3 = [...(todayData.top3 || [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }])]
    top3[i] = { ...top3[i], [field]: val }
    const next = { ...dailyPriorities, [today]: { ...todayData, top3 } }
    updateScalingUp('dailyPriorities', next)
  }

  const top3 = todayData.top3 || [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }]
  const allDone = top3.every(t => t.done)

  // Last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <div>
      {/* Today's #1 */}
      <div style={{ ...CARD_STYLE, background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.25)' }}>
        <SectionTitle>🥇 {isAr ? 'أولويتك رقم 1 اليوم' : "Today's #1 Priority"}</SectionTitle>
        <FieldLabel>
          {isAr
            ? 'الشيء الواحد الذي لو أنجزته اليوم سيجعل كل شيء آخر أسهل أو غير ضروري'
            : 'The ONE thing that if done today will make everything else easier or unnecessary'}
        </FieldLabel>
        <input
          className="input-dark w-full text-lg font-bold"
          style={{ fontSize: 16, color: '#c9a84c' }}
          value={todayData.top1 || ''}
          onChange={e => updateTodayTop1(e.target.value)}
          placeholder={isAr ? 'ما هو الشيء الواحد الأهم اليوم؟' : 'What is the most important thing today?'}
        />
      </div>

      {/* Top 3 */}
      <div style={CARD_STYLE}>
        <SectionTitle>✅ {isAr ? 'أهم 3 أشياء اليوم' : "Today's Top 3"}</SectionTitle>
        {allDone && (
          <div className="mb-3 rounded-xl p-3 text-center" style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)' }}>
            <p className="text-sm font-bold" style={{ color: '#2ecc71' }}>
              {isAr ? '🎉 رائع! أنهيت كل مهامك الثلاث اليوم!' : '🎉 Outstanding! You completed all 3 tasks today!'}
            </p>
          </div>
        )}
        <div className="space-y-3">
          {top3.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => updateTop3Item(i, 'done', !item.done)}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: item.done ? '#2ecc71' : 'transparent',
                  border: `2px solid ${item.done ? '#2ecc71' : '#444'}`,
                }}
              >
                {item.done && <Check size={14} color="#fff" />}
              </button>
              <input
                className="input-dark flex-1"
                style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.6 : 1 }}
                value={item.text || ''}
                onChange={e => updateTop3Item(i, 'text', e.target.value)}
                placeholder={isAr ? `المهمة ${i + 1}...` : `Task ${i + 1}...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Last 7 days history */}
      <div style={CARD_STYLE}>
        <SectionTitle>📅 {isAr ? 'آخر 7 أيام' : 'Last 7 Days'}</SectionTitle>
        <div className="space-y-2">
          {last7.map(date => {
            const dayData = dailyPriorities[date]
            if (!dayData) {
              return (
                <div key={date} className="flex items-center gap-3 py-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: '#2a2a2a' }} />
                  <span className="text-xs" style={{ color: '#444' }}>{date}</span>
                  <span className="text-xs" style={{ color: '#333' }}>{isAr ? 'لا يوجد' : 'No entry'}</span>
                </div>
              )
            }
            const dayTop3 = dayData.top3 || []
            const dayAllDone = dayTop3.length > 0 && dayTop3.every(t => t.done)
            const isToday = date === today
            return (
              <div key={date} className="flex items-center gap-3 py-2"
                style={{ borderBottom: '1px solid #1a1a1a' }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: dayData.top1 ? '#c9a84c' : '#2a2a2a' }} />
                <span className="text-xs flex-shrink-0" style={{ color: '#666', minWidth: 90 }}>
                  {isToday ? (isAr ? 'اليوم' : 'Today') : date}
                </span>
                <span className="text-xs flex-1 truncate"
                  style={{
                    color: dayAllDone ? '#666' : '#aaa',
                    textDecoration: dayAllDone ? 'line-through' : 'none',
                  }}>
                  {dayData.top1 || '—'}
                </span>
                {dayAllDone && <span className="text-xs" style={{ color: '#2ecc71' }}>✓</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Tab 3: People ───────────────────────────────────────────────────────────
function TabPeople({ su, updateScalingUp, isAr }) {
  const team = su.team || []
  const network = su.network || []

  function addTeamMember() {
    const next = [...team, { id: Date.now(), name: '', role: '', accountability: '', keyResult: '' }]
    updateScalingUp('team', next)
  }
  function updateTeamMember(id, field, val) {
    const next = team.map(m => m.id === id ? { ...m, [field]: val } : m)
    updateScalingUp('team', next)
  }
  function deleteTeamMember(id) {
    updateScalingUp('team', team.filter(m => m.id !== id))
  }

  function addNetworkContact() {
    const next = [...network, { id: Date.now(), name: '', title: '', action: '', done: false }]
    updateScalingUp('network', next)
  }
  function updateNetworkContact(id, field, val) {
    const next = network.map(c => c.id === id ? { ...c, [field]: val } : c)
    updateScalingUp('network', next)
  }
  function deleteNetworkContact(id) {
    updateScalingUp('network', network.filter(c => c.id !== id))
  }

  return (
    <div>
      {/* Team */}
      <div style={CARD_STYLE}>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>👥 {isAr ? 'الفريق' : 'Team'}</SectionTitle>
          <button onClick={addTeamMember} className="btn-gold flex items-center gap-1 text-xs px-3 py-1.5">
            <Plus size={13} /> {isAr ? 'إضافة' : 'Add'}
          </button>
        </div>
        {team.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: '#444' }}>
            {isAr ? 'لا يوجد أعضاء في الفريق بعد — اضغط إضافة' : 'No team members yet — press Add'}
          </p>
        )}
        <div className="space-y-4">
          {team.map(member => (
            <div key={member.id} className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>
                  {isAr ? 'عضو الفريق' : 'Team Member'}
                </span>
                <button onClick={() => deleteTeamMember(member.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)' }}>
                  <Trash2 size={12} color="#e63946" />
                </button>
              </div>
              <div className="space-y-2">
                <input className="input-dark w-full"
                  placeholder={isAr ? 'الاسم' : 'Name'}
                  value={member.name} onChange={e => updateTeamMember(member.id, 'name', e.target.value)} />
                <input className="input-dark w-full"
                  placeholder={isAr ? 'الدور / الوظيفة' : 'Role / Position'}
                  value={member.role} onChange={e => updateTeamMember(member.id, 'role', e.target.value)} />
                <input className="input-dark w-full"
                  placeholder={isAr ? 'المسؤولية الرئيسية' : 'Key Accountability'}
                  value={member.accountability} onChange={e => updateTeamMember(member.id, 'accountability', e.target.value)} />
                <input className="input-dark w-full"
                  placeholder={isAr ? 'مقياس النتيجة الرئيسية' : 'Key Result Metric'}
                  value={member.keyResult} onChange={e => updateTeamMember(member.id, 'keyResult', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network */}
      <div style={CARD_STYLE}>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>🌐 {isAr ? 'الشبكة' : 'Network'}</SectionTitle>
          <button onClick={addNetworkContact} className="btn-gold flex items-center gap-1 text-xs px-3 py-1.5">
            <Plus size={13} /> {isAr ? 'إضافة' : 'Add'}
          </button>
        </div>
        {network.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: '#444' }}>
            {isAr ? 'لا يوجد اتصالات بعد — اضغط إضافة' : 'No contacts yet — press Add'}
          </p>
        )}
        <div className="space-y-3">
          {network.map(contact => (
            <div key={contact.id} className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #222' }}>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => updateNetworkContact(contact.id, 'done', !contact.done)}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: contact.done ? '#2ecc71' : 'transparent',
                      border: `2px solid ${contact.done ? '#2ecc71' : '#444'}`,
                    }}>
                    {contact.done && <Check size={10} color="#fff" />}
                  </div>
                  <span className="text-xs font-bold" style={{ color: contact.done ? '#2ecc71' : '#c9a84c' }}>
                    {contact.done
                      ? (isAr ? 'تم التواصل' : 'Connected')
                      : (isAr ? 'اتصال مهم' : 'Key Contact')}
                  </span>
                </button>
                <button onClick={() => deleteNetworkContact(contact.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)' }}>
                  <Trash2 size={12} color="#e63946" />
                </button>
              </div>
              <div className="space-y-2">
                <input className="input-dark w-full"
                  placeholder={isAr ? 'الاسم' : 'Name'}
                  value={contact.name} onChange={e => updateNetworkContact(contact.id, 'name', e.target.value)} />
                <input className="input-dark w-full"
                  placeholder={isAr ? 'المسمى الوظيفي / الشركة' : 'Title / Company'}
                  value={contact.title} onChange={e => updateNetworkContact(contact.id, 'title', e.target.value)} />
                <input className="input-dark w-full"
                  placeholder={isAr ? 'الإجراء المطلوب' : 'Required Action'}
                  value={contact.action} onChange={e => updateNetworkContact(contact.id, 'action', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab 4: Cash ─────────────────────────────────────────────────────────────
function TabCash({ su, updateScalingUp, isAr }) {
  const cashMetrics = su.cashMetrics || { arr: '', cac: '', ltv: '', runway: '' }
  const cashStrategies = su.cashStrategies || [false, false, false, false, false]

  function updateMetric(key, val) {
    updateScalingUp('cashMetrics', { ...cashMetrics, [key]: val })
  }
  function toggleStrategy(i) {
    const next = [...cashStrategies]
    next[i] = !next[i]
    updateScalingUp('cashStrategies', next)
  }

  const ltvNum = parseFloat(cashMetrics.ltv) || 0
  const cacNum = parseFloat(cashMetrics.cac) || 0
  const ltvCacRatio = cacNum > 0 ? (ltvNum / cacNum).toFixed(1) : '—'
  const ratioColor = cacNum > 0 ? (ltvNum / cacNum >= 3 ? '#2ecc71' : ltvNum / cacNum >= 1 ? '#f1c40f' : '#e63946') : '#888'

  const STRATEGIES = {
    ar: [
      'بيع قبل الإنتاج — اقبل دفعة مقدمة',
      'اشتراكات شهرية — تدفق نقدي منتظم',
      'برنامج ولاء — دفع مسبق للعملاء',
      'شراكات استراتيجية — موارد بدون تكلفة',
      'تمويل العملاء — ادفع للموردين بعد القبض',
    ],
    en: [
      'Sell before you build — accept upfront payment',
      'Monthly subscriptions — consistent cash flow',
      'Loyalty program — customers pay in advance',
      'Strategic partnerships — resources at no cost',
      'Customer-funded model — pay suppliers after you collect',
    ],
  }

  const strategies = STRATEGIES[isAr ? 'ar' : 'en']

  return (
    <div>
      {/* Key Metrics */}
      <div style={CARD_STYLE}>
        <SectionTitle>💰 {isAr ? 'المقاييس الرئيسية' : 'Key Metrics'}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <FieldLabel>{isAr ? 'ARR — الإيرادات السنوية' : 'ARR — Annual Recurring Revenue'}</FieldLabel>
            <input className="input-dark w-full" placeholder="$0" type="number"
              value={cashMetrics.arr} onChange={e => updateMetric('arr', e.target.value)} />
          </div>
          <div>
            <FieldLabel>{isAr ? 'CAC — تكلفة اكتساب العميل' : 'CAC — Customer Acquisition Cost'}</FieldLabel>
            <input className="input-dark w-full" placeholder="$0" type="number"
              value={cashMetrics.cac} onChange={e => updateMetric('cac', e.target.value)} />
          </div>
          <div>
            <FieldLabel>{isAr ? 'LTV — قيمة العميل مدى الحياة' : 'LTV — Lifetime Value'}</FieldLabel>
            <input className="input-dark w-full" placeholder="$0" type="number"
              value={cashMetrics.ltv} onChange={e => updateMetric('ltv', e.target.value)} />
          </div>
          <div>
            <FieldLabel>{isAr ? 'Runway — أشهر النقد المتبقية' : 'Runway — Months of cash left'}</FieldLabel>
            <input className="input-dark w-full"
              placeholder={isAr ? '0 شهر' : '0 months'} type="number"
              value={cashMetrics.runway} onChange={e => updateMetric('runway', e.target.value)} />
          </div>
        </div>

        {/* LTV:CAC Ratio */}
        <div className="rounded-xl p-3 text-center" style={{ background: '#111', border: `1px solid ${ratioColor}33` }}>
          <p className="text-xs mb-1" style={{ color: '#888' }}>{isAr ? 'نسبة LTV:CAC' : 'LTV:CAC Ratio'}</p>
          <p className="text-3xl font-black" style={{ color: ratioColor }}>{ltvCacRatio}</p>
          <p className="text-xs mt-1" style={{ color: '#666' }}>
            {cacNum === 0
              ? (isAr ? 'أدخل CAC لحساب النسبة' : 'Enter CAC to calculate ratio')
              : ltvNum / cacNum >= 3
                ? (isAr ? '✅ ممتاز — تجاوزت المعيار الذهبي (3:1)' : '✅ Excellent — exceeded the golden standard (3:1)')
                : ltvNum / cacNum >= 1
                  ? (isAr ? '⚠️ مقبول — يحتاج تحسين' : '⚠️ Acceptable — needs improvement')
                  : (isAr ? '❌ تحذير — تكسب أقل مما تنفق' : '❌ Warning — earning less than you spend')}
          </p>
        </div>
      </div>

      {/* Customer-Funded Strategies */}
      <div style={CARD_STYLE}>
        <SectionTitle>🚀 {isAr ? 'استراتيجيات تمويل العملاء' : 'Customer-Funded Strategies'}</SectionTitle>
        <FieldLabel>{isAr ? 'ضع علامة على الاستراتيجيات التي تطبقها' : 'Mark the strategies you are implementing'}</FieldLabel>
        <div className="space-y-3">
          {strategies.map((strategy, i) => (
            <button key={i}
              onClick={() => toggleStrategy(i)}
              className="w-full flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98] text-right"
              style={{
                background: cashStrategies[i] ? 'rgba(201,168,76,0.1)' : '#111',
                border: `1px solid ${cashStrategies[i] ? 'rgba(201,168,76,0.4)' : '#222'}`,
              }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: cashStrategies[i] ? '#c9a84c' : 'transparent',
                  border: `2px solid ${cashStrategies[i] ? '#c9a84c' : '#444'}`,
                }}>
                {cashStrategies[i] && <Check size={12} color="#000" />}
              </div>
              <span className="text-sm flex-1 text-right" style={{ color: cashStrategies[i] ? '#c9a84c' : '#888' }}>
                {strategy}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl p-3 text-center" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
          <p className="text-xs" style={{ color: '#888' }}>
            <span style={{ color: '#c9a84c', fontWeight: 'bold' }}>
              {cashStrategies.filter(Boolean).length}
            </span>
            {' / 5 '}
            {isAr ? 'استراتيجيات مفعّلة' : 'strategies active'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ScalingUp() {
  const { state, updateScalingUp, today } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const [activeTab, setActiveTab] = useState(0)

  const su = state.scalingUp || {
    bhag: '', corePurpose: '', brandPromise: '', coreCustomer: '',
    targets3_5: '',
    annualRocks: ['', '', '', '', ''],
    quarterlyRocks: ['', '', ''],
    dailyPriorities: {},
    team: [],
    network: [],
    cashMetrics: { arr: '', cac: '', ltv: '', runway: '' },
    cashStrategies: [false, false, false, false, false],
  }

  const TABS = [
    { labelAr: '🎯 الخطة',  labelEn: '🎯 Plan' },
    { labelAr: '⚡ اليوم',  labelEn: '⚡ Daily' },
    { labelAr: '👥 الناس',  labelEn: '👥 People' },
    { labelAr: '💰 النقد',  labelEn: '💰 Cash' },
  ]

  return (
    <Layout title="Scaling Up" subtitle={isAr ? 'نمو وتوسع الأعمال' : 'Business Growth & Scale'} helpKey="scaling">
      <div dir={isAr ? 'rtl' : 'ltr'}>
        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mb-5">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className="rounded-xl py-2.5 text-center transition-all active:scale-95"
              style={{
                ...(activeTab === i ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE),
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 0 && (
          <TabPlan su={su} updateScalingUp={updateScalingUp} isAr={isAr} />
        )}
        {activeTab === 1 && (
          <TabDaily su={su} updateScalingUp={updateScalingUp} today={today} isAr={isAr} />
        )}
        {activeTab === 2 && (
          <TabPeople su={su} updateScalingUp={updateScalingUp} isAr={isAr} />
        )}
        {activeTab === 3 && (
          <TabCash su={su} updateScalingUp={updateScalingUp} isAr={isAr} />
        )}

        {/* Auto-save note */}
        <div className="mt-2 text-center">
          <p className="text-xs" style={{ color: '#333' }}>
            {isAr ? 'يتم الحفظ تلقائياً' : 'Auto-saved'}
          </p>
        </div>
      </div>
    </Layout>
  )
}
