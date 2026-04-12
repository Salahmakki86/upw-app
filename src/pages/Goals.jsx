import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Check, Pencil } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const TIMEFRAMES = {
  ar: ['30 يوم', '90 يوم', 'سنة', '3 سنوات'],
  en: ['30 days', '90 days', '1 year', '3 years'],
}

function GoalCard({ goal, onUpdate, onDelete, t }) {
  const [expanded, setExpanded] = useState(false)
  const [editProg, setEditProg] = useState(false)
  const [prog, setProg] = useState(goal.progress || 0)
  const [showWeeklyNote, setShowWeeklyNote] = useState(false)
  const [weeklyNote, setWeeklyNote] = useState(goal.weeklyNote || '')
  const [dailyInput, setDailyInput] = useState('')
  const [editingDaily, setEditingDaily] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const dailyLog = goal.dailyLog || {}       // { 'YYYY-MM-DD': { task, done } }
  const actionsDone = goal.actionsDone || {} // { actionIndex: true }
  const actions = (goal.actions || []).filter(a => a.trim())

  // Streak: consecutive days with done=true
  let streak = 0
  let checkDate = today
  while (dailyLog[checkDate]?.done) {
    streak++
    const d = new Date(checkDate)
    d.setDate(d.getDate() - 1)
    checkDate = d.toISOString().split('T')[0]
  }

  // Last 7 days dots
  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    last7.push(d.toISOString().split('T')[0])
  }

  const todayEntry = dailyLog[today] || null
  const doneToday = !!todayEntry?.done

  // Progress: from action steps if present, else manual
  const doneCount = actions.length > 0 ? actions.filter((_, i) => actionsDone[i]).length : null
  const autoProgress = doneCount !== null
    ? Math.round((doneCount / actions.length) * 100)
    : null
  const displayProgress = autoProgress !== null ? autoProgress : (goal.progress || 0)

  // Save today's daily goal task
  const saveDailyTask = () => {
    if (!dailyInput.trim()) return
    const newLog = { ...dailyLog, [today]: { task: dailyInput.trim(), done: false } }
    onUpdate(goal.id, { dailyLog: newLog })
    setDailyInput('')
    setEditingDaily(false)
  }

  // Toggle today's task done/undone
  const toggleTodayDone = () => {
    if (!todayEntry) return
    const newLog = { ...dailyLog, [today]: { ...todayEntry, done: !todayEntry.done } }
    onUpdate(goal.id, { dailyLog: newLog })
  }

  // Toggle an action step done
  const toggleAction = (i) => {
    const updated = { ...actionsDone, [i]: !actionsDone[i] }
    onUpdate(goal.id, {
      actionsDone: updated,
      progress: Math.round((Object.values(updated).filter(Boolean).length / actions.length) * 100),
    })
  }

  const saveWeeklyNote = () => { onUpdate(goal.id, { weeklyNote }); setShowWeeklyNote(false) }
  const saveProg = () => { onUpdate(goal.id, { progress: prog }); setEditProg(false) }

  return (
    <div className="rounded-2xl overflow-hidden transition-all" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                {goal.timeframe}
              </span>
              {streak > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,107,53,0.15)', color: '#ff6b35' }}>
                  🔥 {streak} يوم
                </span>
              )}
            </div>
            <h3 className="font-bold text-white text-sm leading-snug">{goal.result}</h3>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => setExpanded(!expanded)} className="p-1.5" style={{ color: '#666' }}>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button onClick={() => onDelete(goal.id)} className="p-1.5" style={{ color: '#555' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: '#888' }}>{t('goals_progress')}</span>
            {autoProgress === null ? (
              <button onClick={() => setEditProg(true)} style={{ color: '#c9a84c' }}>{displayProgress}%</button>
            ) : (
              <span style={{ color: '#c9a84c' }}>
                {doneCount}/{actions.length} خطوات — {displayProgress}%
              </span>
            )}
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${displayProgress}%` }} />
          </div>
        </div>

        {editProg && autoProgress === null && (
          <div className="flex gap-2 mt-2 items-center">
            <input type="range" min={0} max={100} value={prog}
              onChange={e => setProg(Number(e.target.value))} className="flex-1" />
            <span className="text-xs font-bold w-8 text-center" style={{ color: '#c9a84c' }}>{prog}%</span>
            <button onClick={saveProg} className="p-1.5 rounded-lg"
              style={{ background: 'rgba(46,204,113,0.2)', color: '#2ecc71' }}>
              <Check size={14} />
            </button>
          </div>
        )}

        {/* 7-day dots */}
        <div className="flex gap-1 mt-2.5 justify-end items-center">
          <span className="text-xs ml-1" style={{ color: '#444' }}>آخر 7 أيام</span>
          {last7.map(d => (
            <div key={d} title={d} className="w-2.5 h-2.5 rounded-full"
              style={{
                background: dailyLog[d]?.done ? '#c9a84c' : dailyLog[d]?.task ? '#555' : '#252525',
              }} />
          ))}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4 animate-fade-in" style={{ borderColor: '#222' }}>

          {/* ── Daily Goal ── */}
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: '#c9a84c' }}>📅 هدف اليوم لهذا الهدف:</p>

            {todayEntry ? (
              /* Already has today's task */
              <div className="rounded-xl p-3" style={{
                background: doneToday ? 'rgba(46,204,113,0.07)' : 'rgba(201,168,76,0.07)',
                border: `1px solid ${doneToday ? 'rgba(46,204,113,0.2)' : 'rgba(201,168,76,0.2)'}`,
              }}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={toggleTodayDone}
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 transition-all"
                    style={{
                      background: doneToday ? '#2ecc71' : 'transparent',
                      border: `2px solid ${doneToday ? '#2ecc71' : '#c9a84c'}`,
                    }}>
                    {doneToday && <Check size={13} color="white" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-bold mb-0.5" style={{ color: doneToday ? '#2ecc71' : '#c9a84c' }}>
                      {doneToday ? '✓ أنجزت هدف اليوم!' : 'اضغط لتأكيد الإنجاز'}
                    </p>
                    <p className="text-xs leading-relaxed" style={{
                      color: doneToday ? '#666' : '#ddd',
                      textDecoration: doneToday ? 'line-through' : 'none',
                    }}>
                      {todayEntry.task}
                    </p>
                  </div>
                  <button
                    onClick={() => { setDailyInput(todayEntry.task); setEditingDaily(true) }}
                    className="p-1" style={{ color: '#555' }}>
                    <Pencil size={11} />
                  </button>
                </div>
              </div>
            ) : editingDaily ? (
              /* Input mode */
              <div className="space-y-2">
                <input
                  value={dailyInput}
                  onChange={e => setDailyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveDailyTask()}
                  placeholder="ماذا ستفعل اليوم لتحقيق هذا الهدف؟"
                  className="input-dark text-xs w-full py-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={saveDailyTask}
                    className="flex-1 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                    حفظ هدف اليوم
                  </button>
                  <button onClick={() => setEditingDaily(false)}
                    className="px-3 py-1.5 text-xs" style={{ color: '#555' }}>
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              /* Empty — prompt to set */
              <button
                onClick={() => setEditingDaily(true)}
                className="w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                style={{
                  border: '1px dashed #333',
                  color: '#666',
                  background: 'transparent',
                }}>
                <Plus size={12} /> حدد هدفك لهذا الهدف اليوم
              </button>
            )}
          </div>

          {/* ── Action Steps (checkable) ── */}
          {actions.length > 0 && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: '#c9a84c' }}>
                🎯 خطة العمل:
                <span className="mr-1 font-normal" style={{ color: '#666' }}>
                  ({doneCount}/{actions.length})
                </span>
              </p>
              <div className="space-y-2">
                {actions.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <button
                      onClick={() => toggleAction(i)}
                      className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-all"
                      style={{
                        background: actionsDone[i] ? 'rgba(46,204,113,0.2)' : '#1e1e1e',
                        border: `1px solid ${actionsDone[i] ? '#2ecc71' : '#333'}`,
                      }}>
                      {actionsDone[i] && <Check size={10} color="#2ecc71" />}
                    </button>
                    <p className="text-xs flex-1 mt-0.5" style={{
                      color: actionsDone[i] ? '#555' : '#aaa',
                      textDecoration: actionsDone[i] ? 'line-through' : 'none',
                    }}>{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Purpose ── */}
          {goal.purpose && (
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>⚡ لماذا هذا ضرورة مطلقة:</p>
              <p className="text-xs leading-relaxed" style={{ color: '#bbb' }}>{goal.purpose}</p>
            </div>
          )}

          {/* ── Weekly Note ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold" style={{ color: '#c9a84c' }}>📝 مراجعة أسبوعية:</p>
              <button
                onClick={() => { setShowWeeklyNote(v => !v); setWeeklyNote(goal.weeklyNote || '') }}
                className="text-xs" style={{ color: '#666' }}>
                {showWeeklyNote ? 'إغلاق' : (goal.weeklyNote ? 'تعديل' : 'أضف ملاحظة')}
              </button>
            </div>
            {showWeeklyNote ? (
              <div>
                <textarea
                  value={weeklyNote}
                  onChange={e => setWeeklyNote(e.target.value)}
                  placeholder="كيف تسير الأمور هذا الأسبوع؟ ما الذي يعمل؟ ما الذي يحتاج تعديل؟"
                  rows={3}
                  className="input-dark resize-none text-xs w-full"
                />
                <button onClick={saveWeeklyNote}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
                  حفظ الملاحظة
                </button>
              </div>
            ) : goal.weeklyNote ? (
              <p className="text-xs leading-relaxed" style={{ color: '#888' }}>{goal.weeklyNote}</p>
            ) : (
              <p className="text-xs" style={{ color: '#444' }}>لم تتم مراجعة أسبوعية بعد</p>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

function AddGoalModal({ onClose, onSave, t, lang }) {
  const TF = TIMEFRAMES[lang]
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    result: '', purpose: '', timeframe: TF[1],
    pain: '', pleasure: '', actions: ['', '', ''],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setAction = (i, v) => { const a = [...form.actions]; a[i] = v; set('actions', a) }

  const STEP_INFO = [
    { title: `R — ${t('goals_step_result')}`, subtitle: lang === 'ar' ? 'الوضوح هو القوة! حدد هدفك بدقة شديدة' : 'Clarity is power! Define your goal with extreme precision' },
    { title: `P — ${t('goals_step_purpose')}`, subtitle: lang === 'ar' ? 'الأسباب تأتي أولاً — الإجابات تأتي ثانياً' : 'Reasons come first — answers come second' },
    { title: `M — ${t('goals_step_map')}`, subtitle: lang === 'ar' ? 'اتخذ إجراءات ضخمة وفورية' : 'Take massive immediate action' },
  ]

  const renderContent = () => {
    if (step === 0) return (
      <div className="space-y-3">
        <textarea value={form.result} onChange={e => set('result', e.target.value)}
          placeholder={t('goals_result_placeholder')} rows={3} className="input-dark resize-none text-sm" />
        <div>
          <p className="text-xs mb-2" style={{ color: '#888' }}>{t('goals_timeframe')}:</p>
          <div className="grid grid-cols-4 gap-1.5">
            {TF.map(tf => (
              <button key={tf} onClick={() => set('timeframe', tf)}
                className="py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: form.timeframe === tf ? 'rgba(201,168,76,0.15)' : '#111',
                  border: `1px solid ${form.timeframe === tf ? 'rgba(201,168,76,0.4)' : '#222'}`,
                  color: form.timeframe === tf ? '#c9a84c' : '#666',
                }}>
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
    if (step === 1) return (
      <div className="space-y-3">
        <textarea value={form.purpose} onChange={e => set('purpose', e.target.value)}
          placeholder={t('goals_purpose_placeholder')} rows={3} className="input-dark resize-none text-sm" />
        <div>
          <p className="text-xs mb-1.5" style={{ color: '#e63946' }}>😰 {t('goals_pain')}</p>
          <textarea value={form.pain} onChange={e => set('pain', e.target.value)}
            placeholder={t('goals_pain_placeholder')} rows={2} className="input-dark resize-none text-sm" />
        </div>
        <div>
          <p className="text-xs mb-1.5" style={{ color: '#2ecc71' }}>🌟 {t('goals_pleasure')}</p>
          <textarea value={form.pleasure} onChange={e => set('pleasure', e.target.value)}
            placeholder={t('goals_pleasure_placeholder')} rows={2} className="input-dark resize-none text-sm" />
        </div>
      </div>
    )
    return (
      <div className="space-y-3">
        <p className="text-xs" style={{ color: '#888' }}>
          {lang === 'ar' ? 'حدد الخطوات الرئيسية لتحقيق هدفك — إنجازها يحسب نسبة التقدم تلقائياً:' : 'Key action steps — completing them tracks your progress automatically:'}
        </p>
        {form.actions.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-bold w-5 text-center" style={{ color: '#c9a84c' }}>{i + 1}</span>
            <input value={a} onChange={e => setAction(i, e.target.value)}
              placeholder={`${t('goals_action_placeholder')} ${i + 1}`} className="input-dark flex-1 text-sm py-2" />
          </div>
        ))}
        <button onClick={() => set('actions', [...form.actions, ''])}
          className="text-xs flex items-center gap-1" style={{ color: '#c9a84c' }}>
          <Plus size={12} /> {t('add')}
        </button>
      </div>
    )
  }

  const canNext = step === 0 ? form.result.trim() : step === 1 ? form.purpose.trim() : true

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
      <div
        className="w-full max-w-[480px] rounded-t-3xl animate-slide-up flex flex-col"
        style={{ background: '#141414', border: '1px solid #2a2a2a', maxHeight: '88vh' }}
      >
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: '#333' }} />
          <div className="flex gap-2 mb-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all"
                style={{ background: i <= step ? '#c9a84c' : '#222' }} />
            ))}
          </div>
          <h3 className="text-lg font-black text-white mb-0.5">{STEP_INFO[step].title}</h3>
          <p className="text-xs" style={{ color: '#888' }}>{STEP_INFO[step].subtitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {renderContent()}
        </div>

        <div className="px-5 pt-3 pb-8 flex-shrink-0 flex gap-3" style={{ borderTop: '1px solid #222' }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-dark px-5 py-3 text-sm">← {t('back')}</button>
          )}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext}
              className="flex-1 btn-gold py-3 text-sm disabled:opacity-40">
              {t('next')} →
            </button>
          ) : (
            <button onClick={() => onSave({ ...form, actions: form.actions.filter(a => a.trim()) })}
              className="flex-1 btn-gold py-3 text-sm">
              ✓ {t('goals_add')}
            </button>
          )}
          <button onClick={onClose} className="px-4 py-3 text-xs" style={{ color: '#555' }}>{t('cancel')}</button>
        </div>
      </div>
    </div>
  )
}

function AnnualPlanTab({ lang, t }) {
  const { state, updateAnnualPlan } = useApp()
  const plan = state.annualPlan || {}
  const currentYear = new Date().getFullYear()

  const set = (key, value) => updateAnnualPlan(key, value)
  const setTheme = (i, v) => { const arr = [...(plan.themes || ['', '', ''])]; arr[i] = v; set('themes', arr) }
  const setChallenge = (i, v) => { const arr = [...(plan.challenges || ['', '', ''])]; arr[i] = v; set('challenges', arr) }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.3)' }}>
        <p className="text-3xl font-black" style={{ color: '#c9a84c' }}>{plan.year || currentYear}</p>
        <p className="text-xs mt-1" style={{ color: '#888' }}>{lang === 'ar' ? 'خطة السنة' : 'Annual Plan'}</p>
      </div>

      <div className="card">
        <p className="text-sm font-bold text-white mb-2">🌟 {lang === 'ar' ? 'رؤية السنة' : 'Year Vision'}</p>
        <textarea value={plan.vision || ''} onChange={e => set('vision', e.target.value)}
          placeholder={lang === 'ar' ? 'كيف تريد أن تكون حياتك نهاية هذه السنة؟' : 'How do you want your life to look at the end of this year?'}
          rows={4} className="input-dark resize-none text-sm w-full" />
      </div>

      <div className="card">
        <p className="text-sm font-bold text-white mb-2">🎯 {lang === 'ar' ? 'ثلاثة موضوعات للسنة' : '3 Themes for the Year'}</p>
        <p className="text-xs mb-3" style={{ color: '#888' }}>{lang === 'ar' ? 'مثال: صحة، مال، علاقات' : 'e.g., Health, Money, Relationships'}</p>
        {[0, 1, 2].map(i => (
          <input key={i} value={(plan.themes || ['', '', ''])[i] || ''}
            onChange={e => setTheme(i, e.target.value)}
            placeholder={lang === 'ar' ? `الموضوع ${i + 1}...` : `Theme ${i + 1}...`}
            className="input-dark text-sm w-full mb-2" />
        ))}
      </div>

      <div className="card">
        <p className="text-sm font-bold text-white mb-3">📅 {lang === 'ar' ? 'أهداف ربع سنوية' : 'Quarterly Goals'}</p>
        {['q1', 'q2', 'q3', 'q4'].map((q, i) => (
          <div key={q} className="mb-3">
            <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>Q{i + 1} — {lang === 'ar' ? `الربع ${i + 1}` : `Quarter ${i + 1}`}</p>
            <textarea value={plan[q] || ''} onChange={e => set(q, e.target.value)}
              placeholder={lang === 'ar' ? `أهداف الربع ${i + 1}...` : `Quarter ${i + 1} goals...`}
              rows={2} className="input-dark resize-none text-sm w-full" />
          </div>
        ))}
      </div>

      <div className="card">
        <p className="text-sm font-bold text-white mb-2">✨ {lang === 'ar' ? 'كلمة السنة' : 'Word of the Year'}</p>
        <input value={plan.wordOfYear || ''} onChange={e => set('wordOfYear', e.target.value)}
          placeholder={lang === 'ar' ? 'كلمة واحدة تلخص سنتك...' : 'One word that defines your year...'}
          className="input-dark text-sm w-full text-center font-bold" />
        {plan.wordOfYear && (
          <p className="text-center mt-2 text-2xl font-black" style={{ color: '#c9a84c' }}>{plan.wordOfYear}</p>
        )}
      </div>

      <div className="card">
        <p className="text-sm font-bold text-white mb-2">💪 {lang === 'ar' ? 'ثلاثة تحديات للتغلب عليها' : '3 Challenges to Overcome'}</p>
        {[0, 1, 2].map(i => (
          <input key={i} value={(plan.challenges || ['', '', ''])[i] || ''}
            onChange={e => setChallenge(i, e.target.value)}
            placeholder={lang === 'ar' ? `تحدٍّ ${i + 1}...` : `Challenge ${i + 1}...`}
            className="input-dark text-sm w-full mb-2" />
        ))}
      </div>

      <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)' }}>
        <p className="text-sm font-bold" style={{ color: '#2ecc71' }}>
          {lang === 'ar' ? '✅ يتم الحفظ تلقائياً' : '✅ Saved automatically'}
        </p>
      </div>
    </div>
  )
}

export default function Goals() {
  const { state, addGoal, updateGoal, deleteGoal } = useApp()
  const { lang, t } = useLang()
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState('goals')

  const handleSave = (goal) => { addGoal(goal); setShowAdd(false) }

  const activeGoals = state.goals.filter(g => (g.progress || 0) < 100)
  const doneGoals   = state.goals.filter(g => (g.progress || 0) >= 100)

  const RPM_TIPS = {
    ar: ['حدد هدفك بوضوح تام', 'اعرف أسبابك العميقة', 'اتخذ إجراءات ضخمة وفورية', 'راقب النتائج باستمرار', 'غيّر نهجك حتى تنجح'],
    en: ['Define your goal with total clarity', 'Know your deep reasons', 'Take massive immediate action', 'Monitor results consistently', 'Change your approach until you succeed'],
  }

  return (
    <Layout title={t('goals_title')} subtitle={t('goals_subtitle')}>
      <div className="space-y-4 pt-2">

        <div className="flex gap-2">
          {['goals', 'annual'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: activeTab === tab ? 'rgba(201,168,76,0.15)' : '#111',
                border: `1px solid ${activeTab === tab ? 'rgba(201,168,76,0.4)' : '#1e1e1e'}`,
                color: activeTab === tab ? '#c9a84c' : '#666',
              }}>
              {tab === 'goals' ? `🎯 ${lang === 'ar' ? 'أهدافي' : 'My Goals'}` : `📅 ${lang === 'ar' ? 'خطة السنة' : 'Annual Plan'}`}
            </button>
          ))}
        </div>

        {activeTab === 'annual' ? (
          <AnnualPlanTab lang={lang} t={t} />
        ) : (
          <>
            <button onClick={() => setShowAdd(true)} className="w-full btn-gold py-3 text-sm">
              <Plus size={16} /> {t('goals_add')}
            </button>

            {state.goals.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { labelKey: 'goals_total',     value: state.goals.length,  color: '#888'    },
                  { labelKey: 'goals_active',    value: activeGoals.length,  color: '#c9a84c' },
                  { labelKey: 'goals_completed', value: doneGoals.length,    color: '#2ecc71' },
                ].map(s => (
                  <div key={s.labelKey} className="card text-center py-3">
                    <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#666' }}>{t(s.labelKey)}</p>
                  </div>
                ))}
              </div>
            )}

            {activeGoals.length === 0 && doneGoals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-base font-bold text-white mb-1">{t('goals_empty')}</p>
              </div>
            ) : (
              <>
                {activeGoals.length > 0 && (
                  <div>
                    <p className="section-title">{t('goals_active')}</p>
                    <div className="space-y-3">
                      {activeGoals.map(g => <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} t={t} />)}
                    </div>
                  </div>
                )}
                {doneGoals.length > 0 && (
                  <div>
                    <p className="section-title">{t('goals_completed')} 🏆</p>
                    <div className="space-y-3">
                      {doneGoals.map(g => <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} t={t} />)}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#c9a84c' }}>⚡ {lang === 'ar' ? 'معادلة النجاح المطلق' : 'Absolute Success Formula'}</p>
              <div className="space-y-1.5 text-xs" style={{ color: '#888' }}>
                {RPM_TIPS[lang].map((tip, i) => <p key={i}>{i + 1}. {tip}</p>)}
              </div>
            </div>
          </>
        )}
      </div>

      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} onSave={handleSave} t={t} lang={lang} />}
    </Layout>
  )
}
