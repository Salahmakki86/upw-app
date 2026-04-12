import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame, ChevronLeft, Star, Zap, Sun, Moon, Target,
  BarChart2, BookOpen, Briefcase, Compass, Calendar,
  TrendingUp, Shield, Clock,
  Trophy, Mail, Users, Heart, Activity, Shuffle, PieChart,
  LogOut, Settings, NotebookPen, CheckSquare, Eye, Smile,
  MessageSquare, GraduationCap, Moon as MoonIcon,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'

const QUOTES = {
  ar: [
    { text: 'في لحظات قراراتك يتشكل مصيرك.', author: 'توني روبنز' },
    { text: 'ليس الظروف هي التي تحدد مصيرك، بل قراراتك.', author: 'توني روبنز' },
    { text: 'الحركة تخلق العاطفة — تحرّك الآن.', author: 'توني روبنز' },
    { text: 'حيث يذهب تركيزك تذهب طاقتك.', author: 'توني روبنز' },
    { text: 'لا أحد مكسور — فقط أنماط يمكن تغييرها.', author: 'توني روبنز' },
    { text: 'سر الحياة هو العطاء.', author: 'توني روبنز' },
    { text: 'النجاح بدون إشباع هو الفشل الأعظم.', author: 'توني روبنز' },
  ],
  en: [
    { text: 'It is in your moments of decision that your destiny is shaped.', author: 'Tony Robbins' },
    { text: "It's not your conditions but your decisions that shape your destiny.", author: 'Tony Robbins' },
    { text: 'Motion creates emotion — move NOW.', author: 'Tony Robbins' },
    { text: 'Where focus goes, energy flows.', author: 'Tony Robbins' },
    { text: 'Nobody is broken — only patterns that can be changed.', author: 'Tony Robbins' },
    { text: 'The secret to living is giving.', author: 'Tony Robbins' },
    { text: 'Success without fulfillment is the ultimate failure.', author: 'Tony Robbins' },
  ],
}

export default function Dashboard() {
  const { state, logState } = useApp()
  const navigate = useNavigate()
  const { lang, toggleLang, t } = useLang()
  const { currentUser, logout } = useAuth()
  const [showStateModal, setShowStateModal] = useState(false)
  const isAr = lang === 'ar'

  const today = new Date().toISOString().split('T')[0]
  const quote = QUOTES[lang][new Date().getDay() % QUOTES[lang].length]

  // ── Daily Journey ────────────────────────────────────────
  const todayHabits    = state.challengeLog?.[today] || []
  const todayHabitsCnt = todayHabits.length

  const journeySteps = [
    {
      path: '/morning', emoji: '☀️',
      labelAr: 'الصباح', labelEn: 'Morning',
      done: state.morningDone, color: '#c9a84c',
      subAr: state.morningDone ? 'مكتمل' : 'ابدأ',
      subEn: state.morningDone ? 'Done'  : 'Start',
    },
    {
      path: '/energy', emoji: '🔥',
      labelAr: 'الطاقة', labelEn: 'Energy',
      done: todayHabitsCnt > 0, color: '#e67e22',
      subAr: todayHabitsCnt > 0 ? `${todayHabitsCnt} عادات` : 'ابدأ',
      subEn: todayHabitsCnt > 0 ? `${todayHabitsCnt} habits` : 'Start',
    },
    {
      path: '/state', emoji: '⚡',
      labelAr: 'حالتك', labelEn: 'State',
      done: !!state.todayState, color: '#e63946',
      subAr: state.todayState === 'beautiful' ? '✨ جميلة' : state.todayState === 'suffering' ? '🌧 معاناة' : 'سجّل',
      subEn: state.todayState === 'beautiful' ? '✨ Beautiful' : state.todayState === 'suffering' ? '🌧 Suffering' : 'Log',
    },
    {
      path: '/evening', emoji: '🌙',
      labelAr: 'المساء', labelEn: 'Evening',
      done: state.eveningDone, color: '#9b59b6',
      subAr: state.eveningDone ? 'مكتمل' : 'لاحقاً',
      subEn: state.eveningDone ? 'Done'  : 'Later',
    },
  ]

  const donePct  = Math.round((journeySteps.filter(s => s.done).length / journeySteps.length) * 100)
  const allDone  = journeySteps.every(s => s.done)

  // ── 30-day State History ─────────────────────────────────
  const last30 = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i))
      return d.toISOString().split('T')[0]
    })
  }, [])

  const stateByDay = useMemo(() => {
    const map = {}
    ;(state.stateLog || []).forEach(s => { map[s.date] = s.state })
    return map
  }, [state.stateLog])

  const beautifulCnt = (state.stateLog || []).filter(s => s.state === 'beautiful').length
  const sufferingCnt = (state.stateLog || []).filter(s => s.state === 'suffering').length
  const hasStateHistory = (state.stateLog || []).length > 0

  // ── Quick Links ──────────────────────────────────────────
  const QUICK_LINKS = [
    { path: '/morning',  icon: Sun,      labelKey: 'dash_link_morning',  color: '#c9a84c' },
    { path: '/state',    icon: Zap,      labelKey: 'dash_link_state',    color: '#e63946' },
    { path: '/goals',    icon: Target,   labelKey: 'dash_link_goals',    color: '#3498db' },
    { path: '/wheel',    icon: BarChart2,labelKey: 'dash_link_wheel',    color: '#2ecc71' },
    { path: '/beliefs',  icon: Star,     labelKey: 'dash_link_beliefs',  color: '#9b59b6' },
    { path: '/energy',   icon: Flame,    labelKey: 'dash_link_energy',   color: '#e67e22' },
    { path: '/evening',  icon: Moon,     labelKey: 'dash_link_evening',  color: '#95a5a6' },
    { path: '/library',  icon: BookOpen, labelKey: 'dash_link_library',  color: '#1abc9c' },
    { path: '/business', icon: Briefcase,labelKey: 'dash_link_business', color: '#c9a84c' },
    { path: '/destiny',  icon: Compass,  labelKey: 'dash_link_destiny',  color: '#9b59b6' },
    { path: '/weekly',   icon: Calendar,    labelKey: 'dash_link_weekly',   color: '#3498db' },
    { path: '/freedom',  icon: TrendingUp,  labelKey: 'dash_link_freedom',  color: '#f1c40f' },
    { path: '/power30',  icon: Zap,         labelKey: 'dash_link_power30',  color: '#e67e22' },
    { path: '/fear',     icon: Shield,      labelKey: 'dash_link_fear',     color: '#9b59b6' },
    { path: '/time',          icon: Clock,     labelKey: 'dash_link_time',          color: '#1abc9c' },
    { path: '/wins',          icon: Trophy,    labelKey: 'dash_link_wins',          color: '#f1c40f' },
    { path: '/letters',       icon: Mail,      labelKey: 'dash_link_letters',       color: '#3498db' },
    { path: '/modeling',      icon: Users,     labelKey: 'dash_link_modeling',      color: '#2ecc71' },
    { path: '/relationships', icon: Heart,     labelKey: 'dash_link_relationships', color: '#e91e8c' },
    { path: '/protocol',      icon: Activity,  labelKey: 'dash_link_protocol',      color: '#1abc9c' },
    { path: '/challenge',     icon: Shuffle,   labelKey: 'dash_link_challenge',     color: '#e67e22' },
    { path: '/stats',         icon: PieChart,  labelKey: 'dash_link_stats',         color: '#9b59b6' },
    { path: '/scaling',       icon: TrendingUp,   labelKey: 'dash_link_scaling',    color: '#27ae60', adminOnly: true },
    { path: '/lifebook',      icon: NotebookPen,  labelKey: 'dash_link_lifebook',   color: '#8e44ad', adminOnly: true },
    { path: '/students',      icon: GraduationCap,labelKey: 'dash_link_students',   color: '#3498db', adminOnly: true },
    { path: '/coach-messages',icon: MessageSquare,labelKey: 'dash_link_coach_msg',  color: '#e74c3c', adminOnly: true },
    { path: '/gratitude',     icon: Smile,        labelKey: 'dash_link_gratitude',  color: '#f1c40f' },
    { path: '/habits',        icon: CheckSquare,  labelKey: 'dash_link_habits',     color: '#2ecc71' },
    { path: '/reading',       icon: BookOpen,     labelKey: 'dash_link_reading',    color: '#3498db' },
    { path: '/vision',        icon: Eye,          labelKey: 'dash_link_vision',     color: '#e91e8c' },
    { path: '/sleep',         icon: MoonIcon,     labelKey: 'dash_link_sleep',      color: '#9b59b6' },
    { path: '/achievements',  icon: Trophy,       labelKey: 'dash_link_achievements',color: '#c9a84c' },
  ]

  return (
    <div className="flex flex-col" style={{ background: '#090909', minHeight: '100%' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-14 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs mb-0.5" style={{ color: '#888' }}>
            {new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-black text-white">
            {isAr ? 'اطلق قواك الخفية' : 'Unleash Your Power'} <span style={{ color: '#c9a84c' }}>⚡</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleLang}
            className="flex items-center justify-center rounded-full font-bold text-xs transition-all duration-200 active:scale-90"
            style={{ width:36, height:36, background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c',
              fontFamily: isAr ? "'Inter', sans-serif" : "'Cairo', sans-serif" }}>
            {t('lang_toggle')}
          </button>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c' }}>
            <Flame size={12} />
            {state.streak} {t('day')}
          </div>
          {currentUser?.role === 'admin' && (
            <button onClick={() => navigate('/admin')}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)' }}>
              <Settings size={15} style={{ color: '#c9a84c' }} />
            </button>
          )}
          <button onClick={logout}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background:'rgba(255,107,122,0.1)', border:'1px solid rgba(255,107,122,0.3)' }}>
            <LogOut size={15} style={{ color: '#ff6b7a' }} />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-8">

        {/* ── State Card ─────────────────────────────────────── */}
        <button onClick={() => setShowStateModal(true)}
          className="w-full rounded-2xl p-4 text-right transition-all duration-200 active:scale-[0.98]"
          style={{
            background: state.todayState === 'beautiful' ? 'rgba(46,204,113,0.08)'
              : state.todayState === 'suffering' ? 'rgba(230,57,70,0.08)'
              : 'rgba(201,168,76,0.06)',
            border: `1px solid ${
              state.todayState === 'beautiful' ? 'rgba(46,204,113,0.3)'
              : state.todayState === 'suffering' ? 'rgba(230,57,70,0.3)'
              : 'rgba(201,168,76,0.2)'}`,
          }}>
          <div className="flex items-center justify-between">
            <div style={{ textAlign: isAr ? 'right' : 'left' }}>
              <p className="text-xs mb-1" style={{ color: '#888' }}>{t('dash_how_feel')}</p>
              <p className="text-base font-bold text-white">
                {state.todayState === 'beautiful' ? `✨ ${t('dash_beautiful')}`
                  : state.todayState === 'suffering' ? `🌧 ${t('dash_suffering')}`
                  : `👆 ${t('dash_choose_state')}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#888' }}>
                {state.todayState === 'beautiful' ? t('dash_beautiful_desc')
                  : state.todayState === 'suffering' ? t('dash_suffering_desc')
                  : t('dash_how_feel')}
              </p>
            </div>
            <div className="text-3xl">
              {state.todayState === 'beautiful' ? '🌟' : state.todayState === 'suffering' ? '⚡' : '❓'}
            </div>
          </div>
        </button>

        {/* ── يوم متكامل ─────────────────────────────────────── */}
        <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: `1px solid ${allDone ? '#c9a84c40' : '#1e1e1e'}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
              {isAr ? '🗓 يومك اليوم' : '🗓 Today\'s Journey'}
            </span>
            <span className="text-sm font-black" style={{ color: allDone ? '#2ecc71' : '#c9a84c' }}>
              {allDone ? (isAr ? '✅ مكتمل!' : '✅ Done!') : `${donePct}%`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full rounded-full h-1.5 mb-4" style={{ background: '#1a1a1a' }}>
            <div className="h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${donePct}%`, background: allDone ? '#2ecc71' : 'linear-gradient(90deg, #c9a84c, #e8c96a)' }} />
          </div>

          {/* 4 Steps */}
          <div className="grid grid-cols-4 gap-2">
            {journeySteps.map((step, i) => (
              <button key={i} onClick={() => navigate(step.path)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all active:scale-95"
                style={{
                  background: step.done ? step.color + '15' : '#151515',
                  border: `1px solid ${step.done ? step.color + '40' : '#252525'}`,
                }}>
                <span className="text-xl">{step.done ? '✅' : step.emoji}</span>
                <span className="text-center font-bold" style={{ fontSize: 9, color: step.done ? step.color : '#555' }}>
                  {isAr ? step.labelAr : step.labelEn}
                </span>
                <span className="text-center" style={{ fontSize: 8, color: step.done ? step.color + 'cc' : '#444' }}>
                  {isAr ? step.subAr : step.subEn}
                </span>
              </button>
            ))}
          </div>

          {/* Connector dots between steps */}
          {allDone && (
            <div className="mt-3 rounded-xl p-2 text-center" style={{ background: '#2ecc7110', border: '1px solid #2ecc7130' }}>
              <p className="text-xs font-bold" style={{ color: '#2ecc71' }}>
                {isAr ? '🏆 يوم كامل — أنت تبني شخصاً استثنائياً!' : '🏆 Full day complete — you\'re building an extraordinary self!'}
              </p>
            </div>
          )}
        </div>

        {/* ── 30-day State History ────────────────────────────── */}
        {hasStateHistory && (
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
                {isAr ? '📊 حالتك — آخر ٣٠ يوم' : '📊 Your State — Last 30 Days'}
              </span>
            </div>

            {/* Dots grid */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {last30.map((date, i) => {
                const s = stateByDay[date]
                const bg = s === 'beautiful' ? '#2ecc71' : s === 'suffering' ? '#e63946' : '#1e1e1e'
                const isToday = date === today
                return (
                  <div key={i}
                    className="rounded-full transition-all"
                    title={date}
                    style={{
                      width: 18, height: 18,
                      background: bg,
                      border: isToday ? '2px solid #c9a84c' : 'none',
                    }} />
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs" style={{ color: '#666' }}>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: '#2ecc71' }} />
                {isAr ? `جميلة: ${beautifulCnt}` : `Beautiful: ${beautifulCnt}`}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: '#e63946' }} />
                {isAr ? `معاناة: ${sufferingCnt}` : `Suffering: ${sufferingCnt}`}
              </span>
              {beautifulCnt + sufferingCnt > 0 && (
                <span style={{ color: beautifulCnt > sufferingCnt ? '#2ecc71' : '#888' }}>
                  {Math.round((beautifulCnt / (beautifulCnt + sufferingCnt)) * 100)}%
                  {isAr ? ' جميلة' : ' beautiful'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Tony Quote ─────────────────────────────────────── */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a1500 0%, #1a1a1a 100%)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #c9a84c, transparent)', transform: 'translate(30%, -30%)' }} />
          <p className="text-xs mb-3 font-semibold tracking-widest uppercase" style={{ color: '#c9a84c' }}>
            ✦ {t('dash_quote_title')}
          </p>
          <p className="text-base font-bold text-white leading-relaxed mb-2">"{quote.text}"</p>
          <p className="text-xs" style={{ color: '#888' }}>— {quote.author}</p>
        </div>

        {/* ── Goals Snapshot ─────────────────────────────────── */}
        {state.goals.length > 0 && (
          <button onClick={() => navigate('/goals')}
            className="card w-full text-right active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-white">{t('goals_title')}</p>
              <ChevronLeft size={16} style={{ color: '#888' }} />
            </div>
            <div className="space-y-2">
              {state.goals.slice(0, 3).map((g) => (
                <div key={g.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-medium">{g.result}</span>
                    <span style={{ color: '#c9a84c' }}>{g.progress || 0}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${g.progress || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </button>
        )}

        {/* ── Badges ─────────────────────────────────────────── */}
        {(() => {
          const badges = [
            {
              emoji: '🔥',
              labelAr: 'أسبوع متواصل',
              labelEn: '7-Day Streak',
              earned: (state.streak || 0) >= 7,
            },
            {
              emoji: '💎',
              labelAr: 'محارب الشهر',
              labelEn: 'Month Warrior',
              earned: (state.streak || 0) >= 30,
            },
            {
              emoji: '🎯',
              labelAr: 'صانع الأهداف',
              labelEn: 'Goal Maker',
              earned: (state.goals || []).length >= 1,
            },
            {
              emoji: '🏆',
              labelAr: 'منجز',
              labelEn: 'Achiever',
              earned: (state.goals || []).some(g => (g.progress || 0) >= 100),
            },
            {
              emoji: '⚡',
              labelAr: 'محرر القوة',
              labelEn: 'Power Unleashed',
              earned: !!(state.morningDone && state.eveningDone && state.todayState),
            },
            {
              emoji: '🌟',
              labelAr: 'عجلة الحياة',
              labelEn: 'Wheel Master',
              earned: (state.wheelHistory || []).length >= 3,
            },
            {
              emoji: '💰',
              labelAr: 'مسار الحرية',
              labelEn: 'Freedom Path',
              earned: (state.financialFreedom?.monthlyPassive || 0) > 0,
            },
            {
              emoji: '🦋',
              labelAr: 'محوّل',
              labelEn: 'Transformer',
              earned: (state.limitingBeliefs || []).length >= 1 && (state.empoweringBeliefs || []).length >= 1,
            },
          ]
          const earnedCount = badges.filter(b => b.earned).length
          return (
            <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#c9a84c' }}>
                  🏅 {isAr ? 'الأوسمة' : 'Badges'}
                </span>
                <span className="text-xs" style={{ color: '#888' }}>
                  {earnedCount}/{badges.length} {isAr ? 'مكتسبة' : 'earned'}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {badges.map((badge, i) => (
                  <div key={i}
                    className="flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl px-3 py-2.5 transition-all"
                    style={{
                      background: badge.earned ? 'rgba(201,168,76,0.12)' : '#1a1a1a',
                      border: `1px solid ${badge.earned ? 'rgba(201,168,76,0.4)' : '#2a2a2a'}`,
                      minWidth: 72,
                    }}>
                    <span className="text-xl" style={{ filter: badge.earned ? 'none' : 'grayscale(1) opacity(0.35)' }}>
                      {badge.emoji}
                    </span>
                    <span className="text-center leading-tight font-bold"
                      style={{ fontSize: 9, color: badge.earned ? '#c9a84c' : '#444' }}>
                      {isAr ? badge.labelAr : badge.labelEn}
                    </span>
                    {!badge.earned && (
                      <span style={{ fontSize: 9, color: '#333' }}>🔒</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── Quick Links Grid ────────────────────────────────── */}
        <div>
          <p className="section-title mb-3">{t('dash_quick_links')}</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_LINKS.filter(l => !l.adminOnly || currentUser?.role === 'admin').map((link) => {
              const Icon = link.icon
              return (
                <button key={link.path} onClick={() => navigate(link.path)}
                  className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-200 active:scale-95"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${link.color}18` }}>
                    <Icon size={18} style={{ color: link.color }} />
                  </div>
                  <span className="text-xs text-center leading-tight" style={{ color: '#aaa', fontSize: 9 }}>
                    {t(link.labelKey)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Affirmation Banner ──────────────────────────────── */}
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
              {isAr ? 'تذكّر قانونك الذهبي' : 'Your Golden Rule'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>
              {state.incantations[new Date().getHours() % state.incantations.length]}
            </p>
          </div>
        </div>

      </div>

      {/* ── State Modal ─────────────────────────────────────── */}
      {showStateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowStateModal(false)}>
          <div className="w-full max-w-[480px] rounded-t-3xl p-6 pb-10 animate-slide-up"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#333' }} />
            <p className="text-lg font-black text-white mb-1">{t('dash_how_feel')}</p>
            <p className="text-xs mb-5" style={{ color: '#888' }}>{t('dash_choose_state')}</p>
            <div className="space-y-3">
              {[
                { value: 'beautiful', label: `✨ ${t('dash_beautiful')}`, sub: t('dash_beautiful_desc'), color: 'rgba(46,204,113,' },
                { value: 'suffering', label: `🌧 ${t('dash_suffering')}`, sub: t('dash_suffering_desc'), color: 'rgba(230,57,70,' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => { logState(opt.value, opt.label); setShowStateModal(false) }}
                  className="w-full rounded-2xl p-4 text-right transition-all active:scale-[0.98]"
                  style={{ background: `${opt.color}0.1)`, border: `1px solid ${opt.color}0.3)` }}>
                  <p className="font-bold text-white">{opt.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#888' }}>{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
