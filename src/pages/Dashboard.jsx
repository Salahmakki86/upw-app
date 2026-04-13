import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame, ChevronLeft, ChevronDown, ChevronUp, Search,
  Star, Zap, Sun, Moon, Target,
  BarChart2, BookOpen, Briefcase, Compass, Calendar,
  TrendingUp, Shield, Clock,
  Trophy, Mail, Users, Heart, Activity, Shuffle, PieChart,
  LogOut, Settings, NotebookPen, CheckSquare, Eye, Smile, Play,
  MessageSquare, GraduationCap, Moon as MoonIcon,
  LifeBuoy, Brain, Sparkles, FileText, Swords,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import { upwApi } from '../api/upwApi'
import OnboardingModal from '../components/OnboardingModal'
import SearchModal from '../components/SearchModal'
import DiscoveryCard from '../components/DiscoveryCard'
import GoalNudge from '../components/GoalNudge'
import MilestoneModal from '../components/MilestoneModal'
import { calcDailyScore, DAILY_TASKS_TOTAL } from '../utils/dailyScore'
import { checkMilestones } from '../utils/milestones'
import { getUnlockTier, isFeatureUnlocked, getNextUnlockMessage, getStageProgress } from '../utils/featureUnlock'
import JourneyStageMap from '../components/JourneyStageMap'
import SmartReminder from '../components/SmartReminder'
import TransformationPulse from '../components/TransformationPulse'
import StateCheckin from '../components/StateCheckin'
import AdaptiveNudge from '../components/AdaptiveNudge'
import ProfileAssessment from '../components/ProfileAssessment'
import StaleGoalNudge from '../components/StaleGoalNudge'
import WeeklyAutoReport from '../components/WeeklyAutoReport'
import GuidedJourney from '../components/GuidedJourney'
import { getCategoryOrder } from '../utils/adaptivePath'
import { getDashboardVisibility, getUIComplexity } from '../utils/progressiveUI'

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

const FIRST_STEPS = [
  { emoji: '☀️', labelAr: 'الروتين الصباحي', labelEn: 'Morning Ritual',   path: '/morning', descAr: 'ابدأ يومك بقوة وطاقة', descEn: 'Start your day with power' },
  { emoji: '🎯', labelAr: 'أضف أول هدف',     labelEn: 'Add First Goal',   path: '/goals',   descAr: 'حدد ما تريد تحقيقه',   descEn: 'Define what you want' },
  { emoji: '⚡', labelAr: 'سجّل حالتك',       labelEn: 'Log Your State',   path: '/state',   descAr: 'راقب طاقتك اليومية',   descEn: 'Track your daily energy' },
]

export default function Dashboard() {
  const { state, logState, update } = useApp()
  const navigate = useNavigate()
  const { lang, toggleLang, t } = useLang()
  const { currentUser, logout } = useAuth()
  const [showStateModal, setShowStateModal] = useState(false)
  const [showSearch, setShowSearch]       = useState(false)
  const [supportSent, setSupportSent]     = useState(false)
  const [openCats, setOpenCats]           = useState(() => {
    const base = { daily: true, learn: true, goals: false, programs: false, planning: false, business: false, tools: false, admin: false }
    // Auto-open the user's focus category from onboarding profile
    const profile = state.onboardingProfile
    if (profile?.focusPath) {
      const focusMap = { energy: 'daily', goals: 'goals', mindset: 'goals', business: 'business', balance: 'daily' }
      const key = focusMap[profile.focusPath]
      if (key) base[key] = true
    }
    return base
  })
  const [milestoneToShow, setMilestoneToShow] = useState(null)
  const isAr = lang === 'ar'

  const toggleCat = (key) => setOpenCats(prev => ({ ...prev, [key]: !prev[key] }))

  const sendSupport = useCallback(async () => {
    try {
      await upwApi.sendCoachMessage({ toUserId: 'admin', body: isAr ? '🙋 الطالب يحتاج دعماً الآن' : '🙋 Student needs support now', type: 'reminder' })
    } catch {}
    setSupportSent(true)
    setTimeout(() => setSupportSent(false), 3000)
  }, [isAr])

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

  // ── Daily Score (7 tasks) ────────────────────────────────
  const dailyScore = useMemo(() => calcDailyScore(state), [state])

  // #8 — Check for milestones
  useMemo(() => {
    const m = checkMilestones(state)
    if (m && !milestoneToShow) setMilestoneToShow(m)
  }, [state.streak, state.gratitude, state.goals])

  // ── Categorised Links ────────────────────────────────────
  const LINK_CATEGORIES = [
    {
      key: 'daily',
      labelAr: '🌅 يومك',
      labelEn: '🌅 Your Day',
      links: [
        { path: '/today',         icon: Sparkles,    labelKey: 'dash_link_today',         color: '#c9a84c' },
        { path: '/morning',       icon: Sun,         labelKey: 'dash_link_morning',       color: '#f39c12' },
        { path: '/state',         icon: Zap,         labelKey: 'dash_link_state',         color: '#e63946' },
        { path: '/evening',       icon: Moon,        labelKey: 'dash_link_evening',       color: '#95a5a6' },
        { path: '/gratitude',     icon: Smile,       labelKey: 'dash_link_gratitude',     color: '#f1c40f' },
        { path: '/habits',        icon: CheckSquare, labelKey: 'dash_link_habits',        color: '#2ecc71' },
        { path: '/wins',          icon: Trophy,      labelKey: 'dash_link_wins',          color: '#f1c40f' },
        { path: '/sleep',         icon: MoonIcon,    labelKey: 'dash_link_sleep',         color: '#9b59b6' },
      ],
    },
    {
      key: 'learn',
      labelAr: '📖 تعلّم',
      labelEn: '📖 Learn',
      alwaysUnlocked: true,
      links: [
        { path: '/videos',        icon: Play,        labelKey: 'dash_link_videos',        color: '#e63946' },
        { path: '/library',       icon: BookOpen,    labelKey: 'dash_link_library',       color: '#1abc9c' },
        { path: '/upw-program',   icon: Flame,       labelKey: 'dash_link_upw_program',   color: '#e63946' },
        { path: '/achievements',  icon: Trophy,      labelKey: 'dash_link_achievements',  color: '#c9a84c' },
        { path: '/stats',         icon: PieChart,    labelKey: 'dash_link_stats',         color: '#9b59b6' },
        { path: '/incantations',  icon: Sparkles,    labelKey: 'dash_link_incantations',  color: '#c9a84c' },
      ],
    },
    {
      key: 'goals',
      labelAr: '🎯 أهدافك وتطورك',
      labelEn: '🎯 Goals & Growth',
      links: [
        { path: '/goals',    icon: Target,     labelKey: 'dash_link_goals',     color: '#3498db' },
        { path: '/wheel',    icon: BarChart2,  labelKey: 'dash_link_wheel',     color: '#2ecc71' },
        { path: '/beliefs',  icon: Star,       labelKey: 'dash_link_beliefs',   color: '#9b59b6' },
        { path: '/compelling-future', icon: Eye,  labelKey: 'dash_link_compelling_future', color: '#3498db' },
        { path: '/values',   icon: Star,       labelKey: 'dash_link_values',    color: '#f1c40f' },
        { path: '/six-needs',icon: Heart,      labelKey: 'dash_link_six_needs', color: '#e91e8c' },
        { path: '/transformation', icon: BarChart2, labelKey: 'dash_link_transformation', color: '#2ecc71' },
      ],
    },
    {
      key: 'programs',
      labelAr: '🚀 البرامج والتحديات',
      labelEn: '🚀 Programs & Challenges',
      links: [
        { path: '/energy',       icon: Flame,       labelKey: 'dash_link_energy',        color: '#e67e22' },
        { path: '/challenge',    icon: Shuffle,     labelKey: 'dash_link_challenge',     color: '#e67e22' },
        { path: '/group-challenge',icon: Swords,    labelKey: 'dash_link_group_challenge',color: '#e67e22' },
        { path: '/power30',      icon: Zap,         labelKey: 'dash_link_power30',       color: '#e67e22' },
        { path: '/destiny',      icon: Compass,     labelKey: 'dash_link_destiny',       color: '#9b59b6' },
        { path: '/nac',          icon: Zap,         labelKey: 'dash_link_nac',           color: '#e63946' },
        { path: '/fear',         icon: Shield,      labelKey: 'dash_link_fear',          color: '#9b59b6' },
        { path: '/life-story',   icon: BookOpen,    labelKey: 'dash_link_life_story',    color: '#9b59b6' },
        { path: '/modeling',     icon: Users,       labelKey: 'dash_link_modeling',      color: '#2ecc71' },
        { path: '/relationships',icon: Heart,       labelKey: 'dash_link_relationships', color: '#e91e8c' },
        { path: '/protocol',     icon: Activity,    labelKey: 'dash_link_protocol',      color: '#1abc9c' },
        { path: '/emergency',    icon: Zap,         labelKey: 'dash_link_emergency',     color: '#e63946' },
      ],
    },
    {
      key: 'planning',
      labelAr: '📋 التخطيط والتأمل',
      labelEn: '📋 Planning & Reflection',
      links: [
        { path: '/weekly-pulse',  icon: BarChart2,   labelKey: 'dash_link_weekly_pulse',  color: '#3498db' },
        { path: '/monthly-reset', icon: Calendar,    labelKey: 'dash_link_monthly_reset', color: '#c9a84c' },
        { path: '/weekly',        icon: Calendar,    labelKey: 'dash_link_weekly',        color: '#3498db' },
        { path: '/freedom',       icon: TrendingUp,  labelKey: 'dash_link_freedom',       color: '#f1c40f' },
        { path: '/time',          icon: Clock,       labelKey: 'dash_link_time',          color: '#1abc9c' },
        { path: '/commitment',    icon: FileText,    labelKey: 'dash_link_commitment',    color: '#e91e8c' },
        { path: '/letters',       icon: Mail,        labelKey: 'dash_link_letters',       color: '#3498db' },
        { path: '/celebration',   icon: Star,        labelKey: 'dash_link_celebration',   color: '#f1c40f' },
        { path: '/vision',        icon: Eye,         labelKey: 'dash_link_vision',        color: '#e91e8c' },
        { path: '/reading',       icon: BookOpen,    labelKey: 'dash_link_reading',       color: '#3498db' },
      ],
    },
    {
      key: 'business',
      labelAr: '💼 تطوير العمل',
      labelEn: '💼 Business',
      links: [
        { path: '/biz-dashboard', icon: BarChart2,  labelKey: 'dash_link_biz_dashboard', color: '#c9a84c' },
        { path: '/biz-scorecard', icon: CheckSquare,labelKey: 'dash_link_biz_scorecard', color: '#c9a84c' },
        { path: '/pipeline',      icon: TrendingUp, labelKey: 'dash_link_pipeline',       color: '#2ecc71' },
        { path: '/sprint90',      icon: Target,     labelKey: 'dash_link_sprint90',       color: '#e67e22' },
        { path: '/power-hour',    icon: Clock,      labelKey: 'dash_link_power_hour',     color: '#e74c3c' },
        { path: '/decisions',     icon: Compass,    labelKey: 'dash_link_decisions',      color: '#9b59b6' },
        { path: '/skills',        icon: TrendingUp, labelKey: 'dash_link_skills',         color: '#3498db' },
        { path: '/network',       icon: Users,      labelKey: 'dash_link_network',        color: '#2ecc71' },
        { path: '/avatar',        icon: Users,      labelKey: 'dash_link_avatar',         color: '#e91e8c' },
        { path: '/content',       icon: BookOpen,   labelKey: 'dash_link_content',        color: '#e67e22' },
      ],
    },
    {
      key: 'tools',
      labelAr: '🔧 الأدوات',
      labelEn: '🔧 Tools',
      links: [
        { path: '/insights',    icon: Brain,      labelKey: 'dash_link_insights',    color: '#9b59b6' },
        { path: '/baseline',    icon: BarChart2,  labelKey: 'dash_link_baseline',    color: '#3498db' },
        { path: '/my-summary',  icon: BarChart2,  labelKey: 'dash_link_my_summary',  color: '#27ae60' },
      ],
    },
    {
      key: 'admin',
      labelAr: '👨‍💼 إدارة',
      labelEn: '👨‍💼 Admin',
      adminOnly: true,
      links: [
        { path: '/command-center', icon: Shield,        labelKey: 'dash_link_command',      color: '#9370db' },
        { path: '/coach-prep',     icon: Eye,           labelKey: 'dash_link_prep',         color: '#1abc9c' },
        { path: '/students',       icon: GraduationCap, labelKey: 'dash_link_students',     color: '#3498db' },
        { path: '/coach-messages', icon: MessageSquare, labelKey: 'dash_link_coach_msg',    color: '#e74c3c' },
        { path: '/weekly-report',  icon: Calendar,      labelKey: 'dash_link_weekly_report',color: '#27ae60' },
        { path: '/business',      icon: Briefcase,     labelKey: 'dash_link_business',     color: '#c9a84c' },
        { path: '/scaling',       icon: TrendingUp,    labelKey: 'dash_link_scaling',      color: '#27ae60' },
        { path: '/lifebook',      icon: NotebookPen,   labelKey: 'dash_link_lifebook',     color: '#8e44ad' },
      ],
    },
  ]

  const dashScore = dailyScore
  const dashPct   = Math.round((dashScore / DAILY_TASKS_TOTAL) * 100)
  const dashComplete = dashScore === DAILY_TASKS_TOTAL

  // #6 — Progressive unlocking
  const unlockTier = useMemo(() => getUnlockTier(state), [state.morningLog, state.streak])
  const nextUnlockMsg = getNextUnlockMessage(unlockTier, lang, state)
  const { remaining: stagesRemaining } = useMemo(() => getStageProgress(state), [state.morningLog, state.streak])

  // Progressive UI — show fewer elements for new users
  const vis = useMemo(() => getDashboardVisibility(state), [state.morningLog])
  const uiLevel = useMemo(() => getUIComplexity(state), [state.morningLog])

  // Filter categories by visibility level
  const visibleCategoryKeys = useMemo(() => {
    const keys = new Set()
    keys.add('daily')   // always visible
    keys.add('learn')   // always visible
    if (vis.goalsCategory)    keys.add('goals')
    if (vis.programsCategory) keys.add('programs')
    if (vis.planningCategory) keys.add('planning')
    if (vis.businessCategory) keys.add('business')
    if (vis.toolsCategory)    keys.add('tools')
    keys.add('admin')  // handled by adminOnly filter
    return keys
  }, [vis])

  return (
    <div className="flex flex-col" style={{ background: '#090909', minHeight: '100%' }}>

      {/* ── Daily Progress Bar (Dashboard has its own layout) ── */}
      <div style={{ height: 3, background: '#111', flexShrink: 0 }}>
        <div style={{
          height: '100%', width: `${dashPct}%`,
          background: dashComplete
            ? 'linear-gradient(90deg,#2ecc71,#27ae60)'
            : 'linear-gradient(90deg,#c9a84c,#e8c96a)',
          transition: 'width 0.6s ease',
          boxShadow: dashComplete ? '0 0 6px #2ecc7180' : '0 0 6px #c9a84c60',
        }} />
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <div>
          <p className="text-xs mb-0.5" style={{ color: '#888' }}>
            {new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-black text-white">
            {isAr ? 'أهلاً' : 'Hey'}{' '}
            <span style={{ color: '#c9a84c' }}>
              {state.userName || (isAr ? 'المحارب' : 'Warrior')} ⚡
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid #2a2a2a' }}>
            <Search size={15} style={{ color: '#aaa' }} />
          </button>
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

        {/* ── Start Here card (new users) ─────────────────────── */}
        {!state.startHereDismissed && (state.streak || 0) < 3 && !state.morningDone && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#1a1500,#181818)', border: '1px solid rgba(201,168,76,0.4)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div>
                <p className="text-xs font-black" style={{ color: '#c9a84c' }}>
                  🚀 {isAr ? 'ابدأ رحلتك من هنا' : 'Start Your Journey Here'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#666' }}>
                  {isAr ? '٣ خطوات تبنى عليها كل شيء' : '3 steps everything else is built on'}
                </p>
              </div>
              <button onClick={() => update('startHereDismissed', true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', fontSize: 16 }}>
                ×
              </button>
            </div>
            {/* Steps */}
            <div className="px-3 pb-4 space-y-2">
              {FIRST_STEPS.map((step, i) => (
                <button key={i} onClick={() => navigate(step.path)}
                  className="w-full flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98]"
                  style={{ background: '#111', border: '1px solid #222', textAlign: isAr ? 'right' : 'left' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(201,168,76,0.12)', fontSize: 16 }}>
                    {step.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{isAr ? step.labelAr : step.labelEn}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#555' }}>{isAr ? step.descAr : step.descEn}</p>
                  </div>
                  <span style={{ color: '#333', fontSize: 14 }}>{isAr ? '←' : '→'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Smart Reminder (time-based nudge + notification prompt) ── */}
        {vis.smartReminder && <SmartReminder state={state} isAr={isAr} navigate={navigate} />}

        {/* ── Adaptive Nudge (personalized recommendations) ──── */}
        {vis.adaptiveNudge && <AdaptiveNudge />}

        {/* ── Stale Goal Nudge — Coaching dialogue for stuck goals ── */}
        {vis.staleGoalNudge && <StaleGoalNudge />}

        {/* ── Guided 30-Day Journey (Fix #15) ── */}
        {vis.guidedJourney && <GuidedJourney />}

        {/* ── Weekly Auto Report (Fix #18) ── */}
        {vis.weeklyReport && <WeeklyAutoReport />}

        {/* ── Enhanced State Check-in ─────────────────────────── */}
        {state.stateCheckin?.[today] ? (
          <StateCheckin compact onDone={() => setShowStateModal(false)} />
        ) : (
          <StateCheckin onDone={() => {}} />
        )}

        {/* ── Transformation Intelligence ─────────────────────── */}
        {vis.transformPulse && <TransformationPulse />}

        {/* ── Today's Plan (from yesterday's evening) ────────── */}
        {vis.todaysPlan && (() => {
          const yKey = (() => {
            const d = new Date(); d.setDate(d.getDate() - 1)
            return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          })()
          const ePlan = (state.eveningLog?.[yKey]?.tomorrow || []).filter(t => t && t.trim())
          const tPlan = (state.eveningLog?.[today]?.tomorrow || []).filter(t => t && t.trim())
          const tasks = ePlan.length > 0 ? ePlan : tPlan
          const checked = state.todayPlanChecked?.[today] || {}
          const doneN = tasks.filter((_, i) => checked[i]).length
          if (tasks.length === 0) return null
          return (
            <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.25)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black" style={{ color: '#c9a84c' }}>
                  📋 {isAr ? 'خطة اليوم' : "Today's Plan"}
                </span>
                <span className="text-xs font-bold" style={{ color: doneN === tasks.length ? '#2ecc71' : '#888' }}>
                  {doneN}/{tasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {tasks.map((t, i) => {
                  const done = !!checked[i]
                  return (
                    <button key={i}
                      onClick={() => {
                        const ex = state.todayPlanChecked || {}
                        const tc = { ...(ex[today] || {}), [i]: !done }
                        update('todayPlanChecked', { ...ex, [today]: tc })
                      }}
                      className="w-full flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98]"
                      style={{
                        background: done ? 'rgba(46,204,113,0.06)' : '#111',
                        border: `1px solid ${done ? 'rgba(46,204,113,0.25)' : '#1e1e1e'}`,
                        textAlign: isAr ? 'right' : 'left',
                      }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                        border: `2px solid ${done ? '#2ecc71' : '#333'}`,
                        background: done ? 'rgba(46,204,113,0.15)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {done && <span style={{ color: '#2ecc71', fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span className="text-xs font-semibold flex-1" style={{
                        color: done ? '#666' : '#ddd',
                        textDecoration: done ? 'line-through' : 'none',
                      }}>{t}</span>
                    </button>
                  )
                })}
              </div>
              {doneN === tasks.length && (
                <p className="text-xs font-bold text-center mt-2" style={{ color: '#2ecc71' }}>
                  ✅ {isAr ? 'أنجزت كل المهام!' : 'All tasks done!'}
                </p>
              )}
            </div>
          )
        })()}

        {/* #1 — Discovery of the Day */}
        {vis.discoveryCard && <DiscoveryCard />}

        {/* #4 — Goal Nudge */}
        {vis.goalNudge && <GoalNudge />}

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

        {/* ── Journey Stage Map ──────────────────────────────── */}
        {vis.journeyStageMap && <JourneyStageMap state={state} isAr={isAr} />}

        {/* ── 30-day State History ────────────────────────────── */}
        {vis.stateHistory && hasStateHistory && (
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
        {vis.goalsSnapshot && state.goals.length > 0 && (
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
        {vis.badges && (() => {
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

        {/* ── Categorised Links ───────────────────────────────── */}
        <div className="space-y-3">
          <p className="section-title">{t('dash_quick_links')}</p>

          {(() => {
            const catOrder = getCategoryOrder(state.onboardingProfile)
            const sorted = [...LINK_CATEGORIES].sort((a, b) => {
              const iA = catOrder.indexOf(a.key)
              const iB = catOrder.indexOf(b.key)
              return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB)
            })
            return sorted
          })()
            .filter(cat => visibleCategoryKeys.has(cat.key))
            .filter(cat => !cat.adminOnly || currentUser?.role === 'admin')
            .map(cat => {
              const isOpen = openCats[cat.key]
              return (
                <div key={cat.key} className="rounded-2xl overflow-hidden"
                  style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>

                  {/* Category header — tap to toggle */}
                  <button
                    onClick={() => toggleCat(cat.key)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-all active:opacity-70"
                  >
                    <span className="text-sm font-black" style={{ color: isOpen ? '#c9a84c' : '#777' }}>
                      {isAr ? cat.labelAr : cat.labelEn}
                    </span>
                    {isOpen
                      ? <ChevronUp size={15} style={{ color: '#c9a84c' }} />
                      : <ChevronDown size={15} style={{ color: '#444' }} />}
                  </button>

                  {/* Links grid — collapsible */}
                  {isOpen && (
                    <div className="grid grid-cols-4 gap-2 px-3 pb-3">
                      {cat.links.map(link => {
                        const Icon = link.icon
                        const locked = !cat.alwaysUnlocked && !isFeatureUnlocked(link.path, unlockTier)
                        return (
                          <button key={link.path}
                            onClick={() => !locked && navigate(link.path)}
                            className="flex flex-col items-center gap-2 rounded-xl p-2.5 transition-all duration-200 active:scale-95 relative"
                            style={{
                              background: '#151515', border: '1px solid #252525',
                              opacity: locked ? 0.4 : 1,
                              filter: locked ? 'grayscale(0.8)' : 'none',
                            }}>
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                              style={{ background: `${link.color}18` }}>
                              {locked ? <span style={{ fontSize: 14 }}>🔒</span> : <Icon size={17} style={{ color: link.color }} />}
                            </div>
                            <span className="text-center leading-tight font-semibold"
                              style={{ color: locked ? '#444' : '#aaa', fontSize: 9 }}>
                              {t(link.labelKey)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
        </div>

        {/* #6 — Unlock Progress (compact version after Journey Map) */}
        {vis.unlockProgress && unlockTier < 4 && stagesRemaining > 0 && (
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)' }}>
            <p className="text-xs font-semibold" style={{ color: '#888' }}>
              🔓 {nextUnlockMsg}
            </p>
          </div>
        )}

        {/* ── Affirmation Banner ──────────────────────────────── */}
        {vis.affirmation && (
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
        )}

      </div>

      {/* ── Search Modal ───────────────────────────────────── */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      {/* ── Onboarding (first login) ───────────────────────── */}
      {!state.onboardingDone && (
        <OnboardingModal onDone={() => {}} />
      )}

      {/* ── Profile Assessment (existing users without profile) ── */}
      {state.onboardingDone && !state.onboardingProfile?.goalArea && (
        <ProfileAssessment />
      )}

      {/* ── Support Button (students only) ─────────────────── */}
      {currentUser?.role !== 'admin' && (
        <button
          onClick={sendSupport}
          className="fixed z-40 flex items-center gap-2 rounded-full px-4 py-3 font-bold text-sm transition-all active:scale-95"
          style={{
            bottom: 84, left: isAr ? 16 : 'auto', right: isAr ? 'auto' : 16,
            background: supportSent ? 'linear-gradient(135deg,#2ecc71,#27ae60)' : 'linear-gradient(135deg,#c9a84c,#e8c96a)',
            color: '#0a0a0a',
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
          }}
        >
          <LifeBuoy size={16} />
          {supportSent
            ? (isAr ? 'تم الإرسال ✓' : 'Sent ✓')
            : (isAr ? 'أحتاج دعماً' : 'Need Support')}
        </button>
      )}

      {/* #8 — Milestone Celebration Modal */}
      {milestoneToShow && (
        <MilestoneModal
          milestone={milestoneToShow}
          lang={lang}
          onClose={() => {
            const celebrated = state.celebratedMilestones || []
            update('celebratedMilestones', [...celebrated, milestoneToShow.id])
            setMilestoneToShow(null)
          }}
        />
      )}

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
