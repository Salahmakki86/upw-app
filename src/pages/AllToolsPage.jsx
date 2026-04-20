/**
 * AllToolsPage — M1 Central Index (Discoverability Fix)
 *
 * Problem: 67 routes exist but only 5 are in BottomNav. New users have no idea
 * the other 62 exist. This page is the master index, grouped by category.
 *
 * Category-first organization mirrors the mental model of a UPW student.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

const GROUPS = [
  {
    id: 'daily',
    emoji: '☀️',
    titleAr: 'اليوم — الممارسة اليومية',
    titleEn: 'Today — Daily Practice',
    items: [
      { emoji: '☀️', path: '/morning',     ar: 'الطقس الصباحي',   en: 'Morning Ritual' },
      { emoji: '🌙', path: '/evening',     ar: 'الطقس المسائي',   en: 'Evening Ritual' },
      { emoji: '⚡', path: '/state',       ar: 'حالتك الآن',     en: 'Your State' },
      { emoji: '🙏', path: '/gratitude',   ar: 'الامتنان',        en: 'Gratitude Journal' },
      { emoji: '🏆', path: '/wins',        ar: 'انتصارات اليوم',  en: 'Daily Wins' },
      { emoji: '😴', path: '/sleep',       ar: 'سجل النوم',      en: 'Sleep Tracker' },
      { emoji: '📅', path: '/habits',      ar: 'متتبع العادات',  en: 'Habit Tracker' },
      { emoji: '🎯', path: '/challenge',   ar: 'تحدي اليوم',     en: "Today's Challenge" },
    ]
  },
  {
    id: 'identity',
    emoji: '🎭',
    titleAr: 'الهوية والقيم',
    titleEn: 'Identity & Values',
    items: [
      { emoji: '🎭', path: '/identity',    ar: 'هويتي اليومية',   en: 'Daily Identity' },
      { emoji: '🦸', path: '/hero-archetype', ar: 'النموذج البطولي', en: 'Hero Archetype' },
      { emoji: '💎', path: '/values',      ar: 'هرم قيمي',       en: 'Values Hierarchy' },
      { emoji: '🧠', path: '/beliefs',     ar: 'المعتقدات',      en: 'Beliefs' },
      { emoji: '🔷', path: '/six-needs',   ar: 'الحاجات الست',   en: '6 Human Needs' },
      { emoji: '🌌', path: '/destiny',     ar: 'موعد مع القدر',  en: 'Date with Destiny' },
      { emoji: '✍️', path: '/values-in-action', ar: 'قيمك في القرارات', en: 'Values in Action' },
      { emoji: '📜', path: '/commitment',  ar: 'عهد الالتزام',   en: 'Commitment' },
      { emoji: '💌', path: '/letters',     ar: 'رسائل لنفسك',    en: 'Letters to Self' },
    ]
  },
  {
    id: 'goals',
    emoji: '🎯',
    titleAr: 'الأهداف والمستقبل',
    titleEn: 'Goals & Future',
    items: [
      { emoji: '🎯', path: '/goals',            ar: 'أهدافي',           en: 'My Goals' },
      { emoji: '🎡', path: '/wheel',            ar: 'عجلة الحياة',     en: 'Wheel of Life' },
      { emoji: '🔮', path: '/compelling-future',ar: 'مستقبل مقنع',     en: 'Compelling Future' },
      { emoji: '🎨', path: '/vision',           ar: 'لوح الرؤية',      en: 'Vision Board' },
      { emoji: '⚔️', path: '/pain-pleasure',   ar: 'مصفوفة الألم واللذة', en: 'Pain-Pleasure Matrix' },
      { emoji: '🚀', path: '/massive-action',   ar: 'الفعل الجبار',    en: 'Massive Action' },
      { emoji: '🧭', path: '/journey',          ar: 'رحلة التحوّل 90 يوم', en: '90-Day Journey' },
      { emoji: '🏔', path: '/baseline',         ar: 'نقطة الانطلاق',   en: 'Baseline' },
    ]
  },
  {
    id: 'state',
    emoji: '🔥',
    titleAr: 'الحالة والطاقة',
    titleEn: 'State & Energy',
    items: [
      { emoji: '⚡', path: '/power30',      ar: 'قوة شخصية 30 يوم', en: 'Personal Power 30' },
      { emoji: '🔥', path: '/energy',       ar: 'تحدي الطاقة',       en: 'Energy Challenge' },
      { emoji: '🏃', path: '/protocol',     ar: 'بروتوكول الطاقة',  en: 'Energy Protocol' },
      { emoji: '🗣', path: '/incantations', ar: 'التعويذات',        en: 'Incantations' },
      { emoji: '🆘', path: '/emergency',    ar: 'الإسعاف العاطفي',  en: 'Emergency Toolkit' },
      { emoji: '⚔️', path: '/fear',        ar: 'خوف إلى قوة',      en: 'Fear to Power' },
      { emoji: '🔁', path: '/nac',          ar: 'تكييف NAC',        en: 'NAC Process' },
      { emoji: '🏠', path: '/emotional-home', ar: 'بيتي العاطفي',   en: 'Emotional Home' },
    ]
  },
  {
    id: 'growth',
    emoji: '📚',
    titleAr: 'النمو والتعلم',
    titleEn: 'Growth & Learning',
    items: [
      { emoji: '📚', path: '/reading',   ar: 'سجل القراءة',     en: 'Reading Log' },
      { emoji: '🎥', path: '/videos',    ar: 'مكتبة الفيديو',   en: 'Video Library' },
      { emoji: '📖', path: '/library',   ar: 'مكتبة الموارد',   en: 'Library' },
      { emoji: '🎓', path: '/modeling',  ar: 'النمذجة',          en: 'Modeling Excellence' },
      { emoji: '🧩', path: '/skills',    ar: 'تكديس المهارات',  en: 'Skill Stack' },
      { emoji: '📝', path: '/life-story',ar: 'إعادة صياغة قصتي', en: 'Life Story Reframing' },
    ]
  },
  {
    id: 'relationships',
    emoji: '❤️',
    titleAr: 'العلاقات والتواصل',
    titleEn: 'Relationships',
    items: [
      { emoji: '❤️', path: '/relationships', ar: 'إتقان العلاقات', en: 'Relationship Mastery' },
      { emoji: '🤝', path: '/network',       ar: 'شبكة العلاقات',  en: 'Network Tracker' },
    ]
  },
  {
    id: 'finance',
    emoji: '💰',
    titleAr: 'المال والعمل',
    titleEn: 'Money & Work',
    items: [
      { emoji: '💰', path: '/freedom',   ar: 'الحرية المالية',  en: 'Financial Freedom' },
      { emoji: '⏱', path: '/power-hour', ar: 'ساعة القوة',      en: 'Power Hour' },
      { emoji: '🧠', path: '/decisions', ar: 'سجل القرارات',    en: 'Decision Journal' },
    ]
  },
  {
    id: 'reflection',
    emoji: '🔍',
    titleAr: 'المراجعة والوعي',
    titleEn: 'Review & Awareness',
    items: [
      { emoji: '📊', path: '/weekly-pulse',    ar: 'نبض الأسبوع',      en: 'Weekly Pulse' },
      { emoji: '🔍', path: '/weekly',          ar: 'المراجعة الأسبوعية', en: 'Weekly Review' },
      { emoji: '🧩', path: '/weekly-questions',ar: 'أسئلة القوة الأسبوعية', en: 'Weekly Power Questions' },
      { emoji: '🔭', path: '/blueprint-check', ar: 'مراجعة الخطة الشهرية', en: 'Blueprint Check' },
      { emoji: '🌑', path: '/monthly-reset',   ar: 'إعادة ضبط الشهر',  en: 'Monthly Reset' },
      { emoji: '📈', path: '/stats',           ar: 'إحصاءاتي',         en: 'Statistics' },
      { emoji: '💡', path: '/insights',        ar: 'الرؤى',            en: 'Insights' },
      { emoji: '📊', path: '/analytics',       ar: 'لوحة التحليلات',  en: 'Analytics Dashboard' },
      { emoji: '📅', path: '/my-summary',      ar: 'ملخصي الأسبوعي',   en: 'My Weekly Summary' },
      { emoji: '🏆', path: '/achievements',    ar: 'الإنجازات',        en: 'Achievements' },
      { emoji: '🌟', path: '/transformation',  ar: 'لوحة التحوّل',     en: 'Transformation Dashboard' },
    ]
  },
  {
    id: 'practice',
    emoji: '🎭',
    titleAr: 'تمارين ومسارات',
    titleEn: 'Practices & Tracks',
    items: [
      { emoji: '🏁', path: '/sprint90',       ar: 'سباق 90 يوم',       en: '90 Day Sprint' },
      { emoji: '📓', path: '/lifebook',       ar: 'كتاب الحياة',      en: 'Life Book' },
      { emoji: '🎓', path: '/upw-program',    ar: 'برنامج UPW',      en: 'UPW Program' },
      { emoji: '🎉', path: '/celebration',    ar: 'احتفالات النصر',   en: 'Celebration Rituals' },
      { emoji: '🕓', path: '/time',           ar: 'زمن الحياة',       en: 'Time of Life' },
      { emoji: '🎤', path: '/voice-journal',  ar: 'يوميات صوتية',     en: 'Voice Journal' },
      { emoji: '🗺', path: '/challenge-library', ar: 'سوق التحديات',  en: 'Challenge Library' },
    ]
  },
  {
    id: 'ai',
    emoji: '🧠',
    titleAr: 'مدرب ذكي',
    titleEn: 'Smart Coach',
    items: [
      { emoji: '💬', path: '/ai-coach',       ar: 'المدرب الذكي',       en: 'AI Coach' },
    ]
  },
]

const ADMIN_GROUP = {
  id: 'admin',
  emoji: '⚙️',
  titleAr: 'إدارة',
  titleEn: 'Admin',
  items: [
    { emoji: '🖥',  path: '/command-center', ar: 'مركز القيادة',   en: 'Command Center' },
    { emoji: '👥', path: '/students',        ar: 'تقدم الطلاب',    en: 'Student Progress' },
    { emoji: '💬', path: '/coach-messages',  ar: 'رسائل المدرب',   en: 'Coach Messages' },
    { emoji: '📋', path: '/coach-prep',      ar: 'تحضير المدرب',   en: 'Coach Prep' },
    { emoji: '📝', path: '/weekly-report',   ar: 'تقرير أسبوعي',   en: 'Weekly Report' },
    { emoji: '💼', path: '/business',        ar: 'إتقان العمل',    en: 'Business Mastery' },
    { emoji: '📊', path: '/biz-dashboard',   ar: 'لوحة العمل',     en: 'Biz Dashboard' },
    { emoji: '💹', path: '/biz-scorecard',   ar: 'بطاقة أداء',     en: 'Business Scorecard' },
    { emoji: '📣', path: '/pipeline',        ar: 'قمع المبيعات',   en: 'Sales Pipeline' },
    { emoji: '🧑', path: '/avatar',          ar: 'الشخصية المثالية',en: 'Customer Avatar' },
    { emoji: '📝', path: '/content',         ar: 'متتبع المحتوى',  en: 'Content Tracker' },
    { emoji: '🚀', path: '/scaling',         ar: 'التوسّع',        en: 'Scaling Up' },
    { emoji: '👤', path: '/admin',           ar: 'إدارة المستخدمين', en: 'User Admin' },
    { emoji: '🏁', path: '/group-challenge', ar: 'تحدي جماعي',    en: 'Group Challenge' },
  ]
}

export default function AllToolsPage() {
  const { state } = useApp()
  const { currentUser } = useAuth()
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const isAdmin = currentUser?.role === 'admin'
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState('all')

  const allGroups = useMemo(() => {
    const g = [...GROUPS]
    if (isAdmin) g.push(ADMIN_GROUP)
    return g
  }, [isAdmin])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allGroups
      .filter(g => activeGroup === 'all' || g.id === activeGroup)
      .map(g => ({
        ...g,
        items: g.items.filter(i =>
          !q || i.ar.toLowerCase().includes(q) || i.en.toLowerCase().includes(q) || i.path.includes(q)
        )
      }))
      .filter(g => g.items.length > 0)
  }, [allGroups, query, activeGroup])

  const totalCount = allGroups.reduce((s, g) => s + g.items.length, 0)

  return (
    <Layout
      title={isAr ? '🗺 كل الأدوات' : '🗺 All Tools'}
      subtitle={isAr ? `كل أدوات التحوّل (${totalCount})` : `Every transformation tool (${totalCount})`}
    >
      <div className="space-y-4 pt-2">

        {/* Search */}
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={isAr ? 'ابحث عن أداة...' : 'Search a tool...'}
          aria-label={isAr ? 'ابحث' : 'Search'}
          className="w-full rounded-2xl px-4 py-3 text-sm"
          style={{ background: '#0e0e0e', border: '1px solid #222', color: '#fff' }}
        />

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <Chip active={activeGroup === 'all'} onClick={() => setActiveGroup('all')}>
            {isAr ? '🌍 الكل' : '🌍 All'}
          </Chip>
          {allGroups.map(g => (
            <Chip key={g.id} active={activeGroup === g.id} onClick={() => setActiveGroup(g.id)}>
              {g.emoji} {isAr ? g.titleAr.split(' — ')[0] : g.titleEn.split(' — ')[0]}
            </Chip>
          ))}
        </div>

        {/* Groups */}
        {filtered.map(group => (
          <section key={group.id}>
            <h2 style={{
              fontSize: 11, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em',
              marginBottom: 8, textTransform: 'uppercase',
            }}>
              {group.emoji} {isAr ? group.titleAr : group.titleEn}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="rounded-2xl p-3 transition-all active:scale-[0.97]"
                  style={{
                    background: '#0e0e0e',
                    border: '1px solid #1e1e1e',
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 8,
                    minHeight: 54,
                  }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{item.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#ddd', lineHeight: 1.3 }}>
                    {isAr ? item.ar : item.en}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl p-6 text-center" style={{ background: '#0e0e0e', border: '1px dashed #222' }}>
            <div style={{ fontSize: 32 }}>🔎</div>
            <p style={{ color: '#888', marginTop: 8 }}>
              {isAr ? 'لا نتائج. جرّب كلمة أخرى.' : 'No tools match. Try a different keyword.'}
            </p>
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </Layout>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap flex-shrink-0"
      style={{
        background: active ? 'rgba(201,168,76,0.15)' : '#141414',
        border: `1px solid ${active ? 'rgba(201,168,76,0.4)' : '#222'}`,
        color: active ? '#c9a84c' : '#888',
      }}
    >{children}</button>
  )
}
