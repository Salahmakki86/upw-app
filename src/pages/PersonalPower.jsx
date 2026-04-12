import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const DAYS_DATA = {
  ar: [
    { day: 1,  theme: 'قوة القرار',      task: 'اتخذ 3 قرارات لا رجعة فيها اليوم وأعلنها' },
    { day: 2,  theme: 'قوة الهدف',       task: 'اكتب مستقبلك المقنع بتفاصيل دقيقة ومثيرة' },
    { day: 3,  theme: 'قوة الأسئلة',     task: 'استخدم أسئلة تمكينية طوال اليوم — تجنب الأسئلة السلبية' },
    { day: 4,  theme: 'قوة الحركة',      task: '30 دقيقة حركة مع موسيقى تحفيزية — أطلق الطاقة' },
    { day: 5,  theme: 'قوة الامتنان',    task: 'اكتب 10 أشياء تشعر بالامتنان لها بعمق حقيقي' },
    { day: 6,  theme: 'قوة اللغة',       task: 'استبدل 5 كلمات سلبية في قاموسك اليومي' },
    { day: 7,  theme: 'قوة التركيز',     task: 'ركّز فقط على الحلول — امنع عقلك من المشاكل' },
    { day: 8,  theme: 'قوة القيم',       task: 'حدد قيمك الخمس الأساسية وعش وفقها اليوم' },
    { day: 9,  theme: 'قوة المعتقدات',   task: 'حدد معتقداً مقيِّداً واحداً وحوّله لمعتقد تمكيني' },
    { day: 10, theme: 'قوة العطاء',      task: 'افعل شيئاً جميلاً لشخص آخر دون انتظار مقابل' },
    { day: 11, theme: 'قوة القرار II',   task: 'راجع قراراتك — هل أنت ملتزم؟ جدّد الالتزام' },
    { day: 12, theme: 'قوة الهدف II',    task: 'اقرأ مستقبلك المكتوب بصوت عالٍ مع مشاعر' },
    { day: 13, theme: 'قوة الأسئلة II',  task: 'اكتب 5 أسئلة قوية تسألها نفسك كل صباح' },
    { day: 14, theme: 'قوة الحركة II',   task: 'مارس رياضة جديدة أو تجربة جسدية جديدة' },
    { day: 15, theme: 'قوة الامتنان II', task: 'عبّر عن امتنانك لشخص مهم في حياتك' },
    { day: 16, theme: 'قوة اللغة II',    task: 'أعد صياغة 3 تحديات في حياتك كفرص' },
    { day: 17, theme: 'قوة التركيز II',  task: 'احجب كل المشتتات لـ 90 دقيقة وأنجز أهم مهمة' },
    { day: 18, theme: 'قوة القيم II',    task: 'قيّم يومك — هل كانت أفعالك تعكس قيمك؟' },
    { day: 19, theme: 'قوة المعتقدات II', task: 'أضف 3 معتقدات تمكينية جديدة لحياتك' },
    { day: 20, theme: 'قوة العطاء II',   task: 'تطوع أو ساهم في عمل خيري بشكل ملموس' },
    { day: 21, theme: 'إتقان الجسد',     task: 'حدد 3 عادات صحية وابدأ تطبيقها اليوم' },
    { day: 22, theme: 'إتقان العقل',     task: 'اقرأ 30 دقيقة في موضوع يطور عقلك' },
    { day: 23, theme: 'إتقان العلاقات',  task: 'عزّز علاقة مهمة — تواصل عميق مع شخص تحبه' },
    { day: 24, theme: 'إتقان الوقت',     task: 'خطط غداً بدقة — حدد أولويات حقيقية' },
    { day: 25, theme: 'إتقان المال',     task: 'راجع وضعك المالي — خطوة واحدة نحو الحرية' },
    { day: 26, theme: 'إتقان الطاقة',    task: 'حافظ على طاقتك عالية طوال اليوم — لاحظ ما يرفعها' },
    { day: 27, theme: 'إتقان العطاء',    task: 'فكر في إرثك — ماذا تريد أن تترك للعالم؟' },
    { day: 28, theme: 'تكامل الدروس',    task: 'اكتب أهم 7 دروس تعلمتها في هذا التحدي' },
    { day: 29, theme: 'قوة الالتزام',    task: 'أعلن التزاماتك الجديدة لشخص تحبه' },
    { day: 30, theme: 'يوم الإطلاق',     task: 'احتفل بإنجازك وخطط للمرحلة التالية من حياتك!' },
  ],
  en: [
    { day: 1,  theme: 'Power of Decision',     task: 'Make 3 unbreakable decisions today and declare them' },
    { day: 2,  theme: 'Power of Purpose',      task: 'Write your compelling future with vivid, exciting detail' },
    { day: 3,  theme: 'Power of Questions',    task: 'Use empowering questions all day — avoid negative ones' },
    { day: 4,  theme: 'Power of Motion',       task: '30 minutes of movement with motivating music — release energy' },
    { day: 5,  theme: 'Power of Gratitude',    task: 'Write 10 things you feel deeply grateful for' },
    { day: 6,  theme: 'Power of Language',     task: 'Replace 5 disempowering words in your daily vocabulary' },
    { day: 7,  theme: 'Power of Focus',        task: 'Focus only on solutions — prevent your mind from dwelling on problems' },
    { day: 8,  theme: 'Power of Values',       task: 'Define your top 5 core values and live by them today' },
    { day: 9,  theme: 'Power of Beliefs',      task: 'Identify one limiting belief and transform it to an empowering one' },
    { day: 10, theme: 'Power of Contribution', task: 'Do something generous for someone else with no expectation of return' },
    { day: 11, theme: 'Power of Decision II',  task: 'Review your decisions — are you committed? Renew your commitment' },
    { day: 12, theme: 'Power of Purpose II',   task: 'Read your written compelling future out loud with emotion' },
    { day: 13, theme: 'Power of Questions II', task: 'Write 5 powerful questions to ask yourself every morning' },
    { day: 14, theme: 'Power of Motion II',    task: 'Try a new sport or new physical experience' },
    { day: 15, theme: 'Power of Gratitude II', task: 'Express your gratitude to someone important in your life' },
    { day: 16, theme: 'Power of Language II',  task: 'Reframe 3 challenges in your life as opportunities' },
    { day: 17, theme: 'Power of Focus II',     task: 'Block all distractions for 90 minutes and complete your top priority' },
    { day: 18, theme: 'Power of Values II',    task: 'Rate your day — did your actions reflect your values?' },
    { day: 19, theme: 'Power of Beliefs II',   task: 'Add 3 new empowering beliefs to your life' },
    { day: 20, theme: 'Power of Contribution II', task: 'Volunteer or contribute to a charitable cause tangibly' },
    { day: 21, theme: 'Mastery of Body',       task: 'Identify 3 healthy habits and start applying them today' },
    { day: 22, theme: 'Mastery of Mind',       task: 'Read for 30 minutes on a topic that develops your mind' },
    { day: 23, theme: 'Mastery of Relationships', task: 'Deepen an important relationship — have a meaningful conversation' },
    { day: 24, theme: 'Mastery of Time',       task: 'Plan tomorrow precisely — set real priorities' },
    { day: 25, theme: 'Mastery of Money',      task: 'Review your finances — take one step toward freedom' },
    { day: 26, theme: 'Mastery of Energy',     task: 'Keep your energy high all day — notice what raises it' },
    { day: 27, theme: 'Mastery of Giving',     task: 'Think about your legacy — what do you want to leave the world?' },
    { day: 28, theme: 'Integration',           task: 'Write the 7 most important lessons from this challenge' },
    { day: 29, theme: 'Power of Commitment',   task: 'Declare your new commitments to someone you love' },
    { day: 30, theme: 'Launch Day',            task: 'Celebrate your achievement and plan the next phase of your life!' },
  ],
}

const MOTIVATIONAL = {
  ar: [
    'كل يوم تنجزه يبني شخصاً أقوى!',
    'أنت في طريق التحول — لا تتوقف!',
    'نصف الطريق — قوتك تتضاعف كل يوم!',
    'أسبوعان من الانضباط يغيران حياتك!',
    'أنت على وشك إطلاق نسخة جديدة منك!',
  ],
  en: [
    'Every day you complete builds a stronger you!',
    "You're on the path of transformation — don't stop!",
    'Halfway there — your power multiplies every day!',
    'Two weeks of discipline changes your life!',
    "You're about to launch a new version of yourself!",
  ],
}

export default function PersonalPower() {
  const { state, togglePersonalPowerDay, updatePersonalPower } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const pp = state.personalPower || {}
  const daysDone  = pp.daysDone  || {}
  const startDate = pp.startDate

  const DAYS = DAYS_DATA[lang]

  const doneCount  = DAYS.filter(d => daysDone[d.day]).length
  const totalDays  = 30
  const pct        = Math.round((doneCount / totalDays) * 100)

  // Streak calc
  let streak = 0
  for (let i = doneCount; i >= 1; i--) {
    if (daysDone[i]) streak++
    else break
  }

  // Motivational message index
  const msgIdx = Math.floor(doneCount / 6) % MOTIVATIONAL[lang].length
  const motivMsg = MOTIVATIONAL[lang][msgIdx]

  const today = new Date().toISOString().split('T')[0]

  const handleStart = () => {
    updatePersonalPower('active', true)
    updatePersonalPower('startDate', today)
  }

  if (!pp.active && !pp.startDate) {
    return (
      <Layout title={t('power30_title')} subtitle={t('power30_subtitle')}>
        <div className="space-y-4 pt-2">
          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(230,126,34,0.15), #1a1a1a)', border: '1px solid rgba(230,126,34,0.3)' }}>
            <p className="text-6xl mb-4">⚡</p>
            <p className="text-xl font-black text-white mb-2">{t('power30_title')}</p>
            <p className="text-sm mb-4" style={{ color: '#888' }}>
              {isAr
                ? '٣٠ يوماً من الممارسة اليومية لبناء عقلية القوة الشخصية'
                : '30 days of daily practice to build a Personal Power mindset'}
            </p>
            <button onClick={handleStart} className="btn-gold px-8 py-3">
              {isAr ? '🚀 ابدأ التحدي' : '🚀 Start the Challenge'}
            </button>
          </div>
          <div className="card space-y-3">
            <p className="text-sm font-bold text-white">{isAr ? 'ماذا ستفعل كل يوم:' : 'What you\'ll do each day:'}</p>
            {DAYS.slice(0, 5).map(d => (
              <div key={d.day} className="flex items-start gap-3">
                <span className="text-xs font-black w-6 text-center" style={{ color: '#c9a84c' }}>{d.day}</span>
                <div>
                  <p className="text-xs font-bold text-white">{d.theme}</p>
                  <p className="text-xs" style={{ color: '#666' }}>{d.task}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-center" style={{ color: '#555' }}>
              {isAr ? '...و ٢٥ يوماً أخرى' : '...and 25 more days'}
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={t('power30_title')} subtitle={t('power30_subtitle')} helpKey="power30">
      <div className="space-y-4 pt-2">

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: isAr ? 'مكتمل' : 'Done',   value: doneCount, color: '#2ecc71' },
            { label: isAr ? 'متبقي' : 'Left',    value: totalDays - doneCount, color: '#888' },
            { label: isAr ? 'سلسلة' : 'Streak',  value: streak, color: '#c9a84c' },
          ].map(s => (
            <div key={s.label} className="card text-center py-3">
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="card">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: '#888' }}>{isAr ? 'التقدم الإجمالي' : 'Overall Progress'}</span>
            <span style={{ color: '#c9a84c' }} className="font-bold">{pct}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
            <div className="h-3 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #e67e22, #c9a84c)' }} />
          </div>
          {doneCount > 0 && (
            <p className="text-xs mt-2 text-center font-bold" style={{ color: '#c9a84c' }}>{motivMsg}</p>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="card">
          <p className="text-sm font-bold text-white mb-3">
            {isAr ? '📅 جدول الـ ٣٠ يوم' : '📅 30-Day Calendar'}
          </p>
          <div className="grid grid-cols-6 gap-2">
            {DAYS.map((d) => {
              const done = daysDone[d.day]
              return (
                <button
                  key={d.day}
                  onClick={() => togglePersonalPowerDay(d.day)}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all active:scale-90"
                  style={{
                    background: done ? 'rgba(230,126,34,0.2)' : '#111',
                    border: `1px solid ${done ? '#e67e22' : '#1e1e1e'}`,
                  }}>
                  <span className="text-xs font-black" style={{ color: done ? '#e67e22' : '#444' }}>
                    {done ? '✓' : d.day}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Today's Task */}
        {DAYS.map((d) => {
          if (!daysDone[d.day] && (d.day === 1 || daysDone[d.day - 1])) {
            return (
              <div key={d.day} className="rounded-2xl p-4"
                style={{ background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.3)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#e67e22' }}>
                  ⚡ {isAr ? `اليوم ${d.day} — ${d.theme}` : `Day ${d.day} — ${d.theme}`}
                </p>
                <p className="text-sm text-white font-bold">{d.task}</p>
                <button
                  onClick={() => togglePersonalPowerDay(d.day)}
                  className="mt-3 w-full py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'rgba(46,204,113,0.15)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.3)' }}>
                  {isAr ? '✓ أنجزت مهمة اليوم' : '✓ Completed today\'s task'}
                </button>
              </div>
            )
          }
          return null
        })}

        {/* Day List */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
            {isAr ? 'كل الأيام' : 'All Days'}
          </p>
          <div className="space-y-2">
            {DAYS.map((d) => {
              const done = daysDone[d.day]
              return (
                <div key={d.day}
                  className="rounded-xl p-3 flex items-center gap-3 transition-all"
                  style={{
                    background: done ? 'rgba(46,204,113,0.06)' : '#1a1a1a',
                    border: `1px solid ${done ? 'rgba(46,204,113,0.2)' : '#2a2a2a'}`,
                  }}>
                  <button
                    onClick={() => togglePersonalPowerDay(d.day)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: done ? '#2ecc71' : '#111',
                      border: `1px solid ${done ? '#2ecc71' : '#333'}`,
                    }}>
                    {done && <span className="text-xs font-black text-white">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: done ? '#2ecc71' : '#c9a84c' }}>
                      {isAr ? `يوم ${d.day}:` : `Day ${d.day}:`} {d.theme}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#666' }}>{d.task}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Completion */}
        {doneCount === 30 && (
          <div className="rounded-2xl p-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(46,204,113,0.15), #1a1a1a)', border: '2px solid rgba(46,204,113,0.4)' }}>
            <p className="text-5xl mb-3">🏆</p>
            <p className="text-xl font-black text-white mb-1">
              {isAr ? 'أتممت التحدي!' : 'Challenge Complete!'}
            </p>
            <p className="text-sm" style={{ color: '#2ecc71' }}>
              {isAr ? '٣٠ يوم من القوة الشخصية — أنت شخص مختلف الآن!' : '30 days of personal power — you are a different person now!'}
            </p>
          </div>
        )}

      </div>
    </Layout>
  )
}
