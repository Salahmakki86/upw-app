import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Play, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

/* ─── Video Data ──────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    key: 'foundations',
    labelAr: 'الأساسيات',
    labelEn: 'Foundations',
    emoji: '🧠',
    descAr: 'المفاهيم الأساسية التي يُبنى عليها كل شيء',
    descEn: 'Core concepts everything is built upon',
  },
  {
    key: 'daily',
    labelAr: 'الطقوس اليومية',
    labelEn: 'Daily Rituals',
    emoji: '☀️',
    descAr: 'الممارسات اليومية التي تبني الزخم',
    descEn: 'Daily practices that build momentum',
  },
  {
    key: 'goals',
    labelAr: 'الأهداف والرؤية',
    labelEn: 'Goals & Vision',
    emoji: '🎯',
    descAr: 'كيف تضع أهدافاً وتحققها بنظام RPM',
    descEn: 'How to set and achieve goals with RPM',
  },
  {
    key: 'emotions',
    labelAr: 'إدارة المشاعر',
    labelEn: 'Emotional Mastery',
    emoji: '⚡',
    descAr: 'السيطرة على حالتك العاطفية',
    descEn: 'Mastering your emotional state',
  },
  {
    key: 'health',
    labelAr: 'الصحة والطاقة',
    labelEn: 'Health & Energy',
    emoji: '💪',
    descAr: 'الحيوية والنشاط البدني',
    descEn: 'Vitality and physical energy',
  },
  {
    key: 'relationships',
    labelAr: 'العلاقات',
    labelEn: 'Relationships',
    emoji: '❤️',
    descAr: 'بناء علاقات استثنائية',
    descEn: 'Building extraordinary relationships',
  },
  {
    key: 'business',
    labelAr: 'الأعمال والمال',
    labelEn: 'Business & Finance',
    emoji: '💼',
    descAr: 'إتقان الأعمال والحرية المالية',
    descEn: 'Business mastery and financial freedom',
  },
  {
    key: 'transformation',
    labelAr: 'التحول الشامل',
    labelEn: 'Total Transformation',
    emoji: '🔥',
    descAr: 'محاضرات كاملة ومحتوى متعمق',
    descEn: 'Full talks and deep-dive content',
  },
]

const VIDEOS = [
  // ── Foundations ──────────────────────────────────────────────
  {
    id: 'faTGTgid8Uc',
    category: 'foundations',
    titleAr: 'التحضير الذهني — Priming مع توني',
    titleEn: 'Morning Priming with Tony Robbins',
    descAr: 'تمرين التحضير الذهني الكامل الذي يستخدمه توني كل صباح',
    descEn: 'The complete priming exercise Tony uses every morning',
    duration: '16:00',
    relatedPage: '/morning',
    relatedLabelAr: 'الطقس الصباحي',
    relatedLabelEn: 'Morning Ritual',
  },
  {
    id: 'Cpc-t-Dt7ok',
    category: 'foundations',
    titleAr: 'لماذا نفعل ما نفعل — TED Talk',
    titleEn: 'Why We Do What We Do — TED Talk',
    descAr: 'محاضرة TED الشهيرة: الاحتياجات الستة التي تُحرِّك كل سلوك بشري',
    descEn: 'Famous TED talk: the 6 needs that drive all human behavior',
    duration: '21:45',
    relatedPage: '/six-needs',
    relatedLabelAr: 'الاحتياجات الستة',
    relatedLabelEn: '6 Human Needs',
  },
  {
    id: 'gXDMoiEkyuQ',
    category: 'foundations',
    titleAr: 'غيّر قصتك — غيّر حياتك',
    titleEn: 'Change Your Story — Change Your Life',
    descAr: 'كيف تعيد كتابة قصتك المحدودة وتبني هوية جديدة',
    descEn: 'How to rewrite your limiting story and build a new identity',
    duration: '12:30',
    relatedPage: '/life-story',
    relatedLabelAr: 'إعادة صياغة القصة',
    relatedLabelEn: 'Life Story Reframing',
  },
  {
    id: 'vGKMBVJhkbs',
    category: 'foundations',
    titleAr: 'قوة القرارات — أنت من تصنع مصيرك',
    titleEn: 'The Power of Decisions',
    descAr: 'القرار هو اللحظة التي يتغير فيها كل شيء — كيف تقرر بقوة',
    descEn: 'A decision is the moment everything changes — how to decide powerfully',
    duration: '15:20',
    relatedPage: '/decisions',
    relatedLabelAr: 'سجل القرارات',
    relatedLabelEn: 'Decision Journal',
  },
  {
    id: 'B-dPsLsEYBg',
    category: 'foundations',
    titleAr: 'المعتقدات — ما الذي يمنعك حقاً؟',
    titleEn: 'Beliefs — What Really Holds You Back?',
    descAr: 'كيف تكسر المعتقدات المحدودة وتبني معتقدات تمكينية',
    descEn: 'How to break limiting beliefs and build empowering ones',
    duration: '18:00',
    relatedPage: '/beliefs',
    relatedLabelAr: 'المعتقدات',
    relatedLabelEn: 'Beliefs',
  },

  // ── Daily Rituals ───────────────────────────────────────────
  {
    id: 'wM6exo00T5I',
    category: 'daily',
    titleAr: 'روتين الصباح — Hour of Power',
    titleEn: 'Morning Routine — Hour of Power',
    descAr: 'كيف تبني ساعة قوة صباحية تغير يومك بالكامل',
    descEn: 'How to build a morning power hour that transforms your day',
    duration: '10:00',
    relatedPage: '/power-hour',
    relatedLabelAr: 'ساعة القوة',
    relatedLabelEn: 'Power Hour',
  },
  {
    id: 'rk_SMBIW1mg',
    category: 'daily',
    titleAr: 'قوة الامتنان — Gratitude',
    titleEn: 'The Power of Gratitude',
    descAr: 'لماذا الامتنان هو أقوى عاطفة وكيف تمارسه يومياً',
    descEn: 'Why gratitude is the most powerful emotion and how to practice it daily',
    duration: '8:30',
    relatedPage: '/gratitude',
    relatedLabelAr: 'دفتر الامتنان',
    relatedLabelEn: 'Gratitude Journal',
  },
  {
    id: 'kTp9MXjDFMg',
    category: 'daily',
    titleAr: 'الترديدات — Incantations',
    titleEn: 'Incantations — Not Just Affirmations',
    descAr: 'الفرق بين التأكيدات والترديدات: الجسد + الصوت + المشاعر',
    descEn: 'Difference between affirmations and incantations: body + voice + emotions',
    duration: '11:00',
    relatedPage: '/incantations',
    relatedLabelAr: 'الترديدات',
    relatedLabelEn: 'Incantations',
  },
  {
    id: 'QkJscbMdFqQ',
    category: 'daily',
    titleAr: 'CANI — التحسن المستمر كل يوم',
    titleEn: 'CANI — Constant And Never-ending Improvement',
    descAr: 'مبدأ التحسن 1% يومياً وكيف يتحول لنتائج ضخمة',
    descEn: 'The 1% daily improvement principle and how it compounds',
    duration: '9:00',
    relatedPage: '/evening',
    relatedLabelAr: 'الطقس المسائي',
    relatedLabelEn: 'Evening Ritual',
  },

  // ── Goals & Vision ──────────────────────────────────────────
  {
    id: 'bXuInZ6dFQg',
    category: 'goals',
    titleAr: 'نظام RPM لتحقيق الأهداف',
    titleEn: 'RPM System — Results Purpose Massive Action',
    descAr: 'النظام الذي يستخدمه توني لتحقيق أي هدف: النتيجة + الغرض + خطة ضخمة',
    descEn: 'Tony\'s system for achieving any goal: Result + Purpose + Massive Action Plan',
    duration: '14:00',
    relatedPage: '/goals',
    relatedLabelAr: 'الأهداف RPM',
    relatedLabelEn: 'Goals RPM',
  },
  {
    id: 'uxkn_bx0dAQ',
    category: 'goals',
    titleAr: 'عجلة الحياة — أين أنت الآن؟',
    titleEn: 'Wheel of Life — Where Are You Now?',
    descAr: 'تقييم 7 مجالات في حياتك لمعرفة أين تركز جهودك',
    descEn: 'Assess 7 areas of life to know where to focus your efforts',
    duration: '12:00',
    relatedPage: '/wheel',
    relatedLabelAr: 'عجلة الحياة',
    relatedLabelEn: 'Wheel of Life',
  },
  {
    id: 'fNTsSMIHnDY',
    category: 'goals',
    titleAr: 'صناعة مستقبل مُلهِم — Compelling Future',
    titleEn: 'Creating a Compelling Future',
    descAr: 'كيف تبني رؤية مستقبلية تسحبك نحوها بقوة لا تُقاوَم',
    descEn: 'How to build a vision so compelling it pulls you forward irresistibly',
    duration: '15:00',
    relatedPage: '/compelling-future',
    relatedLabelAr: 'المستقبل المُلهِم',
    relatedLabelEn: 'Compelling Future',
  },
  {
    id: 'tLBSfl0MY0Q',
    category: 'goals',
    titleAr: 'التخطيط لمدة 90 يوماً',
    titleEn: '90-Day Massive Action Plan',
    descAr: 'لماذا 90 يوماً هي المدة المثالية لتحقيق نتائج ملموسة',
    descEn: 'Why 90 days is the ideal timeframe for tangible results',
    duration: '10:00',
    relatedPage: '/sprint90',
    relatedLabelAr: 'سبرنت 90 يوم',
    relatedLabelEn: '90-Day Sprint',
  },

  // ── Emotional Mastery ───────────────────────────────────────
  {
    id: 'oZaIDsMiVMs',
    category: 'emotions',
    titleAr: 'الثالوث العاطفي — The Triad',
    titleEn: 'The Emotional Triad — Physiology, Focus, Language',
    descAr: '3 عناصر تتحكم في حالتك العاطفية: الجسد + التركيز + اللغة',
    descEn: '3 elements that control your state: physiology + focus + language',
    duration: '13:00',
    relatedPage: '/state',
    relatedLabelAr: 'إدارة الحالة',
    relatedLabelEn: 'State Management',
  },
  {
    id: 'GpfqLfMxz3o',
    category: 'emotions',
    titleAr: 'كيف تكسر النمط — Pattern Interrupt',
    titleEn: 'How to Break the Pattern — Pattern Interrupt',
    descAr: 'تقنية كسر النمط لتغيير حالتك فوراً',
    descEn: 'Pattern interrupt technique to change your state instantly',
    duration: '8:00',
    relatedPage: '/nac',
    relatedLabelAr: 'عملية NAC',
    relatedLabelEn: 'NAC Process',
  },
  {
    id: 'KuiIkOvCUjU',
    category: 'emotions',
    titleAr: 'إعادة صياغة المفردات — Transformational Vocabulary',
    titleEn: 'Transformational Vocabulary',
    descAr: 'كيف تغيير كلمة واحدة يغير شعورك بالكامل',
    descEn: 'How changing one word can completely change how you feel',
    duration: '11:00',
    relatedPage: '/state',
    relatedLabelAr: 'إدارة الحالة',
    relatedLabelEn: 'State Management',
  },
  {
    id: 'ID8h8K_RNQ0',
    category: 'emotions',
    titleAr: 'تحويل الخوف إلى قوة',
    titleEn: 'Turning Fear Into Power',
    descAr: 'الخوف ليس عدوك — إنه وقود. كيف تستخدمه لصالحك',
    descEn: 'Fear is not your enemy — it\'s fuel. How to use it to your advantage',
    duration: '14:00',
    relatedPage: '/fear',
    relatedLabelAr: 'من الخوف إلى القوة',
    relatedLabelEn: 'Fear to Power',
  },

  // ── Health & Energy ─────────────────────────────────────────
  {
    id: 'iHKvzVgZfWk',
    category: 'health',
    titleAr: 'بروتوكول الطاقة — كيف تعيش بحيوية',
    titleEn: 'Energy Protocol — How to Live with Vitality',
    descAr: 'التنفس + الماء + الحركة + التغذية = طاقة لا محدودة',
    descEn: 'Breathing + water + movement + nutrition = unlimited energy',
    duration: '16:00',
    relatedPage: '/protocol',
    relatedLabelAr: 'بروتوكول الطاقة',
    relatedLabelEn: 'Energy Protocol',
  },
  {
    id: '3vMLGMcnZIo',
    category: 'health',
    titleAr: 'تحدي الطاقة — 10 أيام',
    titleEn: '10-Day Energy Challenge',
    descAr: 'التحدي الذي يغير جسمك وعاداتك في 10 أيام فقط',
    descEn: 'The challenge that transforms your body and habits in 10 days',
    duration: '12:00',
    relatedPage: '/energy',
    relatedLabelAr: 'تحدي الطاقة',
    relatedLabelEn: 'Energy Challenge',
  },
  {
    id: 'l_NYrWqUR40',
    category: 'health',
    titleAr: 'النوم العميق والتعافي',
    titleEn: 'Deep Sleep & Recovery',
    descAr: 'كيف تحسّن جودة نومك لتستيقظ بطاقة كاملة',
    descEn: 'How to improve sleep quality and wake up fully energized',
    duration: '9:00',
    relatedPage: '/sleep',
    relatedLabelAr: 'متتبع النوم',
    relatedLabelEn: 'Sleep Tracker',
  },

  // ── Relationships ───────────────────────────────────────────
  {
    id: 'G2q1-VaEHvg',
    category: 'relationships',
    titleAr: 'أسرار العلاقات الناجحة',
    titleEn: 'Secrets of Successful Relationships',
    descAr: 'المبادئ الستة لبناء علاقات متينة ومُشبِعة',
    descEn: 'The 6 principles for building strong, fulfilling relationships',
    duration: '18:00',
    relatedPage: '/relationships',
    relatedLabelAr: 'إتقان العلاقات',
    relatedLabelEn: 'Relationship Mastery',
  },
  {
    id: '4bDPgo-BLBA',
    category: 'relationships',
    titleAr: 'فن العطاء — The Art of Giving',
    titleEn: 'The Art of Giving',
    descAr: 'سر السعادة الحقيقية: العطاء والمساهمة',
    descEn: 'The secret to real happiness: giving and contribution',
    duration: '10:00',
    relatedPage: '/relationships',
    relatedLabelAr: 'إتقان العلاقات',
    relatedLabelEn: 'Relationship Mastery',
  },

  // ── Business & Finance ──────────────────────────────────────
  {
    id: '9tnlVH70OFk',
    category: 'business',
    titleAr: 'إتقان الأعمال — Business Mastery',
    titleEn: 'Business Mastery — Key Principles',
    descAr: 'المبادئ الأساسية لبناء عمل ناجح ومستدام',
    descEn: 'Core principles for building a successful, sustainable business',
    duration: '20:00',
    relatedPage: '/business',
    relatedLabelAr: 'إتقان الأعمال',
    relatedLabelEn: 'Business Mastery',
  },
  {
    id: 'pwaWilO_Pig',
    category: 'business',
    titleAr: 'الحرية المالية — 7 خطوات',
    titleEn: 'Financial Freedom — 7 Steps',
    descAr: 'خارطة طريق واضحة للوصول إلى الحرية المالية',
    descEn: 'A clear roadmap to achieving financial freedom',
    duration: '15:00',
    relatedPage: '/freedom',
    relatedLabelAr: 'الحرية المالية',
    relatedLabelEn: 'Financial Freedom',
  },
  {
    id: 'AyZ5BFDwLHI',
    category: 'business',
    titleAr: 'القيادة — كيف تُلهِم فريقك',
    titleEn: 'Leadership — How to Inspire Your Team',
    descAr: 'المهارات القيادية التي تبني فرقاً استثنائية',
    descEn: 'Leadership skills that build extraordinary teams',
    duration: '14:00',
    relatedPage: '/scaling',
    relatedLabelAr: 'توسيع الأعمال',
    relatedLabelEn: 'Scaling Up',
  },

  // ── Total Transformation ────────────────────────────────────
  {
    id: 'BQ4yd2W50No',
    category: 'transformation',
    titleAr: 'UPW — حرر قوتك الداخلية (كامل)',
    titleEn: 'UPW — Unleash the Power Within (Full)',
    descAr: 'محاضرة كاملة من حدث UPW الشهير',
    descEn: 'Full talk from the famous UPW event',
    duration: '45:00',
    relatedPage: '/upw-program',
    relatedLabelAr: 'برنامج UPW',
    relatedLabelEn: 'UPW Program',
  },
  {
    id: 'B_fUHQCTHRY',
    category: 'transformation',
    titleAr: 'موعد مع القدر — الأيام الأربعة',
    titleEn: 'Date with Destiny — The 4 Days',
    descAr: 'لمحة عن برنامج Date with Destiny وكيف يغير القيم والهوية',
    descEn: 'Overview of Date with Destiny and how it transforms values and identity',
    duration: '25:00',
    relatedPage: '/destiny',
    relatedLabelAr: 'موعد مع القدر',
    relatedLabelEn: 'Date with Destiny',
  },
  {
    id: 'h6LBZECB73o',
    category: 'transformation',
    titleAr: 'عملية ديكنز — Dickens Process',
    titleEn: 'The Dickens Process',
    descAr: 'التقنية الأقوى لتغيير معتقداتك: عش مستقبلك بدون التغيير ثم معه',
    descEn: 'The most powerful technique: live your future without change, then with it',
    duration: '20:00',
    relatedPage: '/life-story',
    relatedLabelAr: 'إعادة صياغة القصة',
    relatedLabelEn: 'Life Story',
  },
  {
    id: 'ri5S_wx05qY',
    category: 'transformation',
    titleAr: 'القوة الشخصية — 30 يوم تحوّل',
    titleEn: 'Personal Power — 30-Day Transformation',
    descAr: 'لمحة عن برنامج القوة الشخصية و30 يوماً من التغيير المستمر',
    descEn: 'Overview of Personal Power and 30 days of continuous transformation',
    duration: '18:00',
    relatedPage: '/power30',
    relatedLabelAr: 'القوة الشخصية',
    relatedLabelEn: 'Personal Power',
  },
  {
    id: 'ByBGx-G-NvU',
    category: 'transformation',
    titleAr: 'Modeling — تعلم من الأفضل',
    titleEn: 'Modeling Excellence — Learn from the Best',
    descAr: 'كيف تنسخ استراتيجيات الناجحين وتختصر سنوات من التعلم',
    descEn: 'How to model strategies of the successful and compress years of learning',
    duration: '12:00',
    relatedPage: '/modeling',
    relatedLabelAr: 'نمذجة التميز',
    relatedLabelEn: 'Modeling Excellence',
  },
]

/* ─── Video Card Component ────────────────────────────────────────────────── */

function VideoCard({ video, isAr, navigate }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
      {/* Thumbnail / Player */}
      {playing ? (
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={isAr ? video.titleAr : video.titleEn}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      ) : (
        <button onClick={() => setPlaying(true)} className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <img
            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
            alt={isAr ? video.titleAr : video.titleEn}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Play overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(201,168,76,0.9)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={24} fill="#fff" color="#fff" style={{ marginLeft: 3 }} />
            </div>
          </div>
          {/* Duration badge */}
          <span style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.8)', color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
          }}>{video.duration}</span>
        </button>
      )}

      {/* Info */}
      <div className="p-3">
        <h4 className="text-sm font-bold text-white mb-1" style={{ lineHeight: 1.4 }}>
          {isAr ? video.titleAr : video.titleEn}
        </h4>
        <p className="text-xs mb-3" style={{ color: '#888', lineHeight: 1.5 }}>
          {isAr ? video.descAr : video.descEn}
        </p>
        {/* Related page link */}
        {video.relatedPage && (
          <button
            onClick={() => navigate(video.relatedPage)}
            className="flex items-center gap-1.5 text-xs font-bold transition-all"
            style={{ color: '#c9a84c' }}>
            <ExternalLink size={12} />
            {isAr ? `افتح: ${video.relatedLabelAr}` : `Open: ${video.relatedLabelEn}`}
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────────────────────── */

export default function VideoLibrary() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [openCat, setOpenCat] = useState(CATEGORIES[0].key)

  // Filter videos by search
  const filteredVideos = useMemo(() => {
    if (!search.trim()) return VIDEOS
    const q = search.toLowerCase()
    return VIDEOS.filter(v =>
      v.titleAr.toLowerCase().includes(q) ||
      v.titleEn.toLowerCase().includes(q) ||
      v.descAr.toLowerCase().includes(q) ||
      v.descEn.toLowerCase().includes(q)
    )
  }, [search])

  // Group by category
  const grouped = useMemo(() => {
    const map = {}
    CATEGORIES.forEach(c => { map[c.key] = [] })
    filteredVideos.forEach(v => {
      if (map[v.category]) map[v.category].push(v)
    })
    return map
  }, [filteredVideos])

  const totalResults = filteredVideos.length

  return (
    <Layout
      title={isAr ? 'مكتبة الفيديو' : 'Video Library'}
      subtitle={isAr ? 'تعلّم من توني روبنز مباشرة' : 'Learn directly from Tony Robbins'}
    >
      <div className="space-y-4 pt-2">

        {/* Search */}
        <div className="relative">
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث عن فيديو...' : 'Search videos...'}
            className="w-full py-3 pr-4 rounded-2xl text-sm text-white placeholder-gray-500"
            style={{ background: '#111', border: '1px solid #222', paddingLeft: 40, direction: 'ltr', textAlign: isAr ? 'right' : 'left' }}
          />
          {search && (
            <span className="text-xs absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#888' }}>
              {totalResults} {isAr ? 'نتيجة' : 'results'}
            </span>
          )}
        </div>

        {/* Intro card */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-xs" style={{ color: '#c9a84c', lineHeight: 1.7 }}>
            {isAr
              ? '🎬 شاهد الفيديو ثم طبّق مباشرة في الأداة المرتبطة. التعلم بدون تطبيق = ترفيه. التطبيق بدون فهم = تخبط. اجمع بينهما هنا.'
              : '🎬 Watch the video, then apply it directly in the linked tool. Learning without action = entertainment. Action without understanding = confusion. Combine both here.'}
          </p>
        </div>

        {/* Categories */}
        {CATEGORIES.map(cat => {
          const videos = grouped[cat.key] || []
          if (search && videos.length === 0) return null
          const isOpen = openCat === cat.key

          return (
            <div key={cat.key} className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
              {/* Category Header */}
              <button
                onClick={() => setOpenCat(isOpen ? null : cat.key)}
                className="w-full flex items-center justify-between p-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className={isAr ? 'text-right' : 'text-left'}>
                    <h3 className="text-sm font-bold text-white">
                      {isAr ? cat.labelAr : cat.labelEn}
                    </h3>
                    <p className="text-xs" style={{ color: '#666' }}>
                      {isAr ? cat.descAr : cat.descEn}
                      <span style={{ color: '#c9a84c', marginRight: 4, marginLeft: 4 }}>
                        ({videos.length})
                      </span>
                    </p>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={18} color="#555" /> : <ChevronDown size={18} color="#555" />}
              </button>

              {/* Videos Grid */}
              {isOpen && videos.length > 0 && (
                <div className="px-3 pb-4 space-y-3 animate-fade-in">
                  {videos.map(v => (
                    <VideoCard key={v.id} video={v} isAr={isAr} navigate={navigate} />
                  ))}
                </div>
              )}

              {/* Empty state for category */}
              {isOpen && videos.length === 0 && !search && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-center" style={{ color: '#555' }}>
                    {isAr ? 'قريباً...' : 'Coming soon...'}
                  </p>
                </div>
              )}
            </div>
          )
        })}

        {/* Stats footer */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: '#444' }}>
            {isAr
              ? `${VIDEOS.length} فيديو في ${CATEGORIES.length} أقسام`
              : `${VIDEOS.length} videos in ${CATEGORIES.length} categories`}
          </p>
        </div>
      </div>
    </Layout>
  )
}
