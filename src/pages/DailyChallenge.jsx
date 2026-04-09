import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const ALL_CHALLENGES = [
  // State (5)
  { id: 1, cat: 'state', ar: 'افعل وضعية القوة لدقيقتين قبل كل اجتماع أو لقاء مهم', en: 'Do a power pose for 2 minutes before every important meeting' },
  { id: 2, cat: 'state', ar: 'غيّر جسدك كل ساعة — قف، تمدد، تنفس بعمق', en: 'Change your physiology every hour — stand, stretch, breathe deep' },
  { id: 3, cat: 'state', ar: 'ابتسم لمدة 60 ثانية متواصلة في الصباح', en: 'Smile for 60 seconds straight in the morning' },
  { id: 4, cat: 'state', ar: 'قبل كل تحدي اليوم قل: "هذا يحدث لصالحي"', en: 'Before every challenge today say: "This is happening for me"' },
  { id: 5, cat: 'state', ar: 'استمع لأغنية تحفيزية وتحرك بكل طاقتك لمدة 3 دقائق', en: 'Listen to a power song and move with full energy for 3 minutes' },

  // Mindset (10)
  { id: 6, cat: 'mindset', ar: 'استبدل كلمة "لا أستطيع" بـ"كيف يمكنني؟" طوال اليوم', en: 'Replace "I can\'t" with "How can I?" all day' },
  { id: 7, cat: 'mindset', ar: 'اكتب 10 أشياء أنت ممتنّ لها اليوم — تفاصيل', en: 'Write 10 things you\'re grateful for today — with details' },
  { id: 8, cat: 'mindset', ar: 'اسأل نفسك كل ساعة: "ما أحسن شيء يمكنني فعله الآن؟"', en: 'Ask yourself every hour: "What\'s the best thing I can do right now?"' },
  { id: 9, cat: 'mindset', ar: 'لا تشتكِ ولا تُبرر طوال اليوم — فقط الحلول', en: 'No complaints and no excuses all day — only solutions' },
  { id: 10, cat: 'mindset', ar: 'اقرأ 10 صفحات من كتاب تطوير ذاتي اليوم', en: 'Read 10 pages of a self-development book today' },
  { id: 11, cat: 'mindset', ar: 'اكتب 3 قرارات جريئة تريد اتخاذها واختر واحداً', en: 'Write 3 bold decisions you want to make and choose one' },
  { id: 12, cat: 'mindset', ar: 'خصص 30 دقيقة للتخطيط لشهر قادم', en: 'Spend 30 minutes planning the next month' },
  { id: 13, cat: 'mindset', ar: 'حدد معتقداً محدودًا وحوّله لمعتقد تمكيني', en: 'Identify one limiting belief and transform it to empowering' },
  { id: 14, cat: 'mindset', ar: 'اكتب رؤيتك لحياتك بعد 5 سنوات بأقصى تفاصيل', en: 'Write your life vision 5 years from now in max detail' },
  { id: 15, cat: 'mindset', ar: 'تأمل 10 دقائق بتركيز كامل — لا هاتف لا تشتيت', en: 'Meditate 10 minutes with full focus — no phone no distraction' },

  // Relationship (5)
  { id: 16, cat: 'relationship', ar: 'قل لـ 3 أشخاص ما الذي تقدّره فيهم تحديداً', en: 'Tell 3 people exactly what you appreciate about them' },
  { id: 17, cat: 'relationship', ar: 'اتصل بشخص لم تتحدث معه منذ فترة', en: 'Call someone you haven\'t spoken to in a while' },
  { id: 18, cat: 'relationship', ar: 'استمع للآخرين اليوم دون مقاطعة — فقط استمع', en: 'Listen to others today without interrupting — just listen' },
  { id: 19, cat: 'relationship', ar: 'افعل شيئاً غير متوقع لشخص تحبه', en: 'Do something unexpected for someone you love' },
  { id: 20, cat: 'relationship', ar: 'اعتذر لشخص تشعر أنك قصّرت معه', en: 'Apologize to someone you feel you\'ve let down' },

  // Body (10)
  { id: 21, cat: 'body', ar: 'اقفز 100 قفزة مقسّمة على اليوم', en: 'Do 100 jumping jacks spread throughout the day' },
  { id: 22, cat: 'body', ar: 'اشرب لتر ماء قبل الغداء', en: 'Drink 1 liter of water before lunch' },
  { id: 23, cat: 'body', ar: 'تناول وجبة صحية كاملة — خضروات وبروتين', en: 'Eat one complete healthy meal — vegetables and protein' },
  { id: 24, cat: 'body', ar: 'امشِ 30 دقيقة في الهواء الطلق', en: 'Walk 30 minutes outside in fresh air' },
  { id: 25, cat: 'body', ar: 'نم في وقت محدد الليلة — لا شاشات ساعة قبل النوم', en: 'Sleep at a fixed time tonight — no screens 1 hour before bed' },
  { id: 26, cat: 'body', ar: 'اعمل تمارين تمدد لـ 15 دقيقة', en: 'Do stretching exercises for 15 minutes' },
  { id: 27, cat: 'body', ar: 'تجنب السكر والطعام المعالج طوال اليوم', en: 'Avoid sugar and processed food all day' },
  { id: 28, cat: 'body', ar: 'افعل 30 تمرين ضغط خلال اليوم', en: 'Do 30 push-ups during the day' },
  { id: 29, cat: 'body', ar: 'اجلس للاسترخاء 5 دقائق دون أي شاشة', en: 'Sit and relax for 5 minutes without any screen' },
  { id: 30, cat: 'body', ar: 'ابدأ يومك بـ 30 نفساً عميقاً', en: 'Start your day with 30 deep breaths' },

  // Growth (10)
  { id: 31, cat: 'growth', ar: 'تعلم شيئاً جديداً وعلّمه لشخص آخر', en: 'Learn one new thing and teach it to someone' },
  { id: 32, cat: 'growth', ar: 'اسأل شخصاً ناجحاً عن سر نجاحه', en: 'Ask a successful person about the secret of their success' },
  { id: 33, cat: 'growth', ar: 'خصص ساعة لمهارة تريد إتقانها', en: 'Dedicate one hour to a skill you want to master' },
  { id: 34, cat: 'growth', ar: 'استمع لبودكاست تحفيزي أثناء التنقل', en: 'Listen to a motivational podcast while commuting' },
  { id: 35, cat: 'growth', ar: 'اكتب 5 أشياء تعلمتها هذا الأسبوع', en: 'Write 5 things you learned this week' },
  { id: 36, cat: 'growth', ar: 'خذ دورة أو شاهد محاضرة متخصصة في مجالك', en: 'Take a course or watch a lecture in your field' },
  { id: 37, cat: 'growth', ar: 'اخرج من منطقة الراحة في شيء واحد صغير اليوم', en: 'Step out of your comfort zone in one small thing today' },
  { id: 38, cat: 'growth', ar: 'تحدّث مع شخص من خلفية مختلفة وتعلم منه', en: 'Talk to someone from a different background and learn from them' },
  { id: 39, cat: 'growth', ar: 'راجع أهدافك وحدّث تقدمك', en: 'Review your goals and update your progress' },
  { id: 40, cat: 'growth', ar: 'اكتب خطة عمل لهدف طال تأجيله', en: 'Write an action plan for a long-delayed goal' },

  // Giving (5)
  { id: 41, cat: 'giving', ar: 'افعل فعل عطاء مجهول النوع لشخص لا تعرفه', en: 'Do one anonymous act of kindness for a stranger' },
  { id: 42, cat: 'giving', ar: 'تبرع بشيء لا تستخدمه لمن يحتاجه', en: 'Donate something you don\'t use to someone who needs it' },
  { id: 43, cat: 'giving', ar: 'قدّم مساعدة عملية لشخص في حاجة اليوم', en: 'Offer practical help to someone in need today' },
  { id: 44, cat: 'giving', ar: 'اكتب رسالة شكر حقيقية لشخص غيّر حياتك', en: 'Write a genuine thank-you letter to someone who changed your life' },
  { id: 45, cat: 'giving', ar: 'ابتسم وقل كلمة طيبة لكل شخص تقابله اليوم', en: 'Smile and say a kind word to every person you meet today' },

  // Financial (5)
  { id: 46, cat: 'financial', ar: 'سجّل كل ريال تنفقه اليوم بدقة', en: 'Track every dollar you spend today with precision' },
  { id: 47, cat: 'financial', ar: 'راجع ميزانيتك وحدد مكان الهدر', en: 'Review your budget and identify where money is wasted' },
  { id: 48, cat: 'financial', ar: 'فكر في مصدر دخل إضافي واكتب خطوة أولى', en: 'Think of an extra income source and write the first step' },
  { id: 49, cat: 'financial', ar: 'ادخر مبلغاً صغيراً اليوم مهما كان', en: 'Save a small amount today no matter what' },
  { id: 50, cat: 'financial', ar: 'ابحث عن استثمار واحد يمكنك البدء به بموارد محدودة', en: 'Research one investment you can start with limited resources' },
]

const CATEGORIES = {
  ar: {
    state: { label: 'الحالة', color: '#e63946', emoji: '⚡' },
    mindset: { label: 'العقلية', color: '#9b59b6', emoji: '🧠' },
    relationship: { label: 'العلاقات', color: '#e91e8c', emoji: '❤️' },
    body: { label: 'الجسد', color: '#2ecc71', emoji: '💪' },
    growth: { label: 'النمو', color: '#3498db', emoji: '📈' },
    giving: { label: 'العطاء', color: '#1abc9c', emoji: '🎁' },
    financial: { label: 'المال', color: '#c9a84c', emoji: '💰' },
  },
  en: {
    state: { label: 'State', color: '#e63946', emoji: '⚡' },
    mindset: { label: 'Mindset', color: '#9b59b6', emoji: '🧠' },
    relationship: { label: 'Relationships', color: '#e91e8c', emoji: '❤️' },
    body: { label: 'Body', color: '#2ecc71', emoji: '💪' },
    growth: { label: 'Growth', color: '#3498db', emoji: '📈' },
    giving: { label: 'Giving', color: '#1abc9c', emoji: '🎁' },
    financial: { label: 'Financial', color: '#c9a84c', emoji: '💰' },
  },
}

export default function DailyChallenge() {
  const { state, acceptChallenge, completeChallenge, today } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'

  const [view, setView] = useState('today') // 'today' | 'all'
  const [filterCat, setFilterCat] = useState('all')

  const dc = state.dailyChallenges || { history: [], accepted: {}, completed: {} }
  const accepted = dc.accepted || {}
  const completed = dc.completed || {}
  const history = dc.history || []

  // Seeded by date
  const todayChallenge = useMemo(() => {
    const dateSum = today.replace(/-/g, '').split('').reduce((a, b) => a + parseInt(b), 0)
    return ALL_CHALLENGES[dateSum % ALL_CHALLENGES.length]
  }, [today])

  const isAccepted = !!accepted[today]
  const isCompleted = !!completed[today]

  const cats = CATEGORIES[lang]

  const filteredChallenges = filterCat === 'all' ? ALL_CHALLENGES : ALL_CHALLENGES.filter(c => c.cat === filterCat)

  // Streak
  const streak = useMemo(() => {
    let s = 0
    const completedDates = Object.keys(completed).sort().reverse()
    for (let i = 0; i < completedDates.length; i++) {
      const expected = new Date()
      expected.setDate(expected.getDate() - i)
      if (completedDates[i] === expected.toISOString().split('T')[0]) s++
      else break
    }
    return s
  }, [completed])

  return (
    <Layout title={t('challenge_title')} subtitle={t('challenge_subtitle')}>
      <div className="space-y-4 pt-2">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: isAr ? 'سلسلة' : 'Streak', value: streak, color: '#e67e22' },
            { label: isAr ? 'مكتملة' : 'Completed', value: Object.keys(completed).length, color: '#2ecc71' },
            { label: isAr ? 'التحديات' : 'Challenges', value: ALL_CHALLENGES.length, color: '#9b59b6' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          {[
            { key: 'today', label: isAr ? 'تحدي اليوم' : "Today's Challenge" },
            { key: 'all', label: isAr ? 'كل التحديات' : 'All Challenges' },
          ].map(v => (
            <button key={v.key} onClick={() => setView(v.key)}
              className="flex-1 py-2.5 text-xs font-bold transition-all"
              style={{ background: view === v.key ? 'rgba(230,126,34,0.15)' : 'transparent', color: view === v.key ? '#e67e22' : '#666', borderRight: v.key === 'today' ? '1px solid #2a2a2a' : 'none' }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* Today's Challenge */}
        {view === 'today' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: isCompleted ? 'rgba(46,204,113,0.08)' : 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: `1px solid ${isCompleted ? 'rgba(46,204,113,0.3)' : 'rgba(201,168,76,0.25)'}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#e67e22' }}>
                  {isAr ? '🔥 تحدي اليوم' : '🔥 Today\'s Challenge'}
                </span>
                <span className="text-xs rounded-full px-2 py-0.5"
                  style={{ background: `${cats[todayChallenge.cat]?.color}20`, color: cats[todayChallenge.cat]?.color }}>
                  {cats[todayChallenge.cat]?.emoji} {cats[todayChallenge.cat]?.label}
                </span>
              </div>

              <p className="text-lg font-black text-white leading-relaxed mb-4">
                {isAr ? todayChallenge.ar : todayChallenge.en}
              </p>

              {isCompleted ? (
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)' }}>
                  <p className="font-black text-white">✅ {isAr ? 'أنجزت هذا التحدي!' : 'Challenge Completed!'}</p>
                  <p className="text-xs mt-1" style={{ color: '#2ecc71' }}>
                    {isAr ? 'أحسنت! أنت تبني إنساناً استثنائياً' : 'Well done! You\'re building an extraordinary self'}
                  </p>
                </div>
              ) : isAccepted ? (
                <div className="space-y-2">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(230,126,34,0.1)', border: '1px solid rgba(230,126,34,0.25)' }}>
                    <p className="text-xs font-bold" style={{ color: '#e67e22' }}>
                      {isAr ? '💪 قبلت التحدي!' : '💪 Challenge Accepted!'}
                    </p>
                  </div>
                  <button onClick={() => completeChallenge(today)}
                    className="w-full rounded-xl py-3 font-black text-sm transition-all active:scale-[0.98]"
                    style={{ background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', color: '#2ecc71' }}>
                    ✅ {isAr ? 'أنجزته!' : 'I Did It!'}
                  </button>
                </div>
              ) : (
                <button onClick={() => acceptChallenge(today, todayChallenge)}
                  className="btn-gold w-full py-3 text-base font-black">
                  {isAr ? '⚡ أقبل التحدي!' : '⚡ Accept Challenge!'}
                </button>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
                  📅 {isAr ? 'آخر التحديات المكتملة' : 'Recent Completed Challenges'}
                </p>
                <div className="space-y-2">
                  {history.filter(h => h.done).slice(-10).reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl p-3"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <span className="text-xs mt-0.5" style={{ color: '#888' }}>{h.date}</span>
                      <p className="text-xs text-white flex-1">
                        {h.challenge ? (isAr ? h.challenge.ar : h.challenge.en) : '...'}
                      </p>
                      <span style={{ color: '#2ecc71' }}>✅</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Challenges */}
        {view === 'all' && (
          <div className="space-y-3">
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setFilterCat('all')}
                className="rounded-full px-3 py-1.5 text-xs font-bold flex-shrink-0 transition-all"
                style={{ background: filterCat === 'all' ? 'rgba(201,168,76,0.2)' : '#1a1a1a', border: `1px solid ${filterCat === 'all' ? '#c9a84c' : '#2a2a2a'}`, color: filterCat === 'all' ? '#c9a84c' : '#666' }}>
                {isAr ? 'الكل' : 'All'} ({ALL_CHALLENGES.length})
              </button>
              {Object.entries(cats).map(([key, cat]) => (
                <button key={key} onClick={() => setFilterCat(key)}
                  className="rounded-full px-3 py-1.5 text-xs font-bold flex-shrink-0 transition-all"
                  style={{ background: filterCat === key ? `${cat.color}20` : '#1a1a1a', border: `1px solid ${filterCat === key ? cat.color : '#2a2a2a'}`, color: filterCat === key ? cat.color : '#666' }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredChallenges.map(ch => {
                const cat = cats[ch.cat]
                return (
                  <div key={ch.id} className="rounded-xl p-3"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div className="flex items-start gap-2">
                      <span className="text-base flex-shrink-0">{cat?.emoji}</span>
                      <p className="text-sm text-white flex-1">{isAr ? ch.ar : ch.en}</p>
                    </div>
                    <span className="text-xs rounded-full px-2 py-0.5 mt-1.5 inline-block"
                      style={{ background: `${cat?.color}15`, color: cat?.color }}>
                      {cat?.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
