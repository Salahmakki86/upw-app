import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Play, ChevronDown, ChevronUp, ExternalLink, CheckCircle, Circle, X, Star } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useApp } from '../context/AppContext'
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
    takeawaysAr: ['التحضير الصباحي يحدد اتجاه يومك بالكامل', 'التنفس العميق يعيد ضبط جهازك العصبي', 'الامتنان يغير كيمياء دماغك فوراً', 'التصور الذهني يبرمج عقلك للنجاح'],
    takeawaysEn: ['Morning priming sets the direction of your entire day', 'Deep breathing resets your nervous system', 'Gratitude instantly changes your brain chemistry', 'Visualization programs your mind for success'],
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
    takeawaysAr: ['كل سلوك يهدف لتلبية حاجة من الاحتياجات الستة', 'النمو والمساهمة هما احتياجات الروح', 'الموارد ليست المشكلة — العاطفة هي المحرك', 'القرارات تصنع المصير وليس الظروف'],
    takeawaysEn: ['Every behavior aims to meet one of the 6 needs', 'Growth and contribution are needs of the spirit', 'Resources are not the problem — emotion is the driver', 'Decisions shape destiny, not conditions'],
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
    takeawaysAr: ['قصتك الحالية تحدد سقف نتائجك', 'أنت لست قصتك بل كاتبها', 'الهوية الجديدة تبدأ بقرار واحد', 'القصة المحدودة تعمل كدرع مزيف للحماية'],
    takeawaysEn: ['Your current story sets the ceiling on your results', 'You are not your story — you are its author', 'A new identity starts with one decision', 'Limiting stories act as false shields of protection'],
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
    takeawaysAr: ['القرار الحقيقي يقطع كل البدائل الأخرى', 'ثلاث قرارات تصنعها كل لحظة تشكل حياتك', 'الالتزام يحول القرار إلى واقع', 'القرارات المتكررة تبني الشخصية'],
    takeawaysEn: ['A real decision cuts off all other alternatives', 'Three decisions you make every moment shape your life', 'Commitment turns a decision into reality', 'Repeated decisions build character'],
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
    takeawaysAr: ['المعتقدات أوامر للعقل يطيعها بلا تردد', 'التجربة المرجعية هي أساس كل معتقد', 'يمكنك زعزعة أي معتقد محدود بالأسئلة', 'المعتقد التمكيني يفتح إمكانيات جديدة'],
    takeawaysEn: ['Beliefs are commands your brain obeys without hesitation', 'Reference experiences are the foundation of every belief', 'You can shake any limiting belief with questions', 'Empowering beliefs open new possibilities'],
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
    takeawaysAr: ['الساعة الأولى تحدد مسار يومك كله', 'الحركة الجسدية تكسر الجمود العقلي', 'خصص وقتاً للامتنان والتصور والتخطيط', 'الثبات على الروتين أهم من مدته'],
    takeawaysEn: ['The first hour sets the course of your whole day', 'Physical movement breaks mental inertia', 'Dedicate time for gratitude, visualization, and planning', 'Consistency matters more than duration'],
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
    takeawaysAr: ['الامتنان يقضي على الخوف والغضب فوراً', 'لا يمكن أن تشعر بالامتنان والخوف معاً', 'ثلاث دقائق امتنان تغير حالتك بالكامل', 'اشعر بالامتنان بجسدك لا بعقلك فقط'],
    takeawaysEn: ['Gratitude instantly eliminates fear and anger', 'You cannot feel grateful and fearful at the same time', 'Three minutes of gratitude shifts your entire state', 'Feel gratitude in your body, not just your mind'],
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
    takeawaysAr: ['الترديد يشرك الجسد والصوت والمشاعر معاً', 'التأكيد بلا شعور مجرد كلام فارغ', 'كرر بشدة حتى يصبح جزءاً من هويتك', 'الترديد اليومي يعيد برمجة عقلك الباطن'],
    takeawaysEn: ['Incantations engage body, voice, and emotion together', 'Affirmation without feeling is just empty words', 'Repeat with intensity until it becomes your identity', 'Daily incantation reprograms your subconscious'],
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
    takeawaysAr: ['تحسن 1% يومياً يعني 37 ضعفاً في سنة', 'لا تقارن نفسك بالآخرين بل بنفسك أمس', 'المراجعة المسائية تكشف فرص التحسن', 'التقدم الصغير المستمر يهزم القفزات الكبيرة'],
    takeawaysEn: ['1% daily improvement means 37x in a year', 'Compare yourself to yesterday, not to others', 'Evening review reveals improvement opportunities', 'Small consistent progress beats big leaps'],
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
    takeawaysAr: ['ابدأ بالنتيجة المرجوة وليس بالمهام', 'الغرض العاطفي هو الوقود الحقيقي للهدف', 'خطة العمل الضخمة تمنع التسويف', 'راجع أهدافك يومياً لتبقى في المسار'],
    takeawaysEn: ['Start with the desired result, not with tasks', 'Emotional purpose is the real fuel for any goal', 'Massive action plan prevents procrastination', 'Review your goals daily to stay on track'],
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
    takeawaysAr: ['الحياة المتوازنة تبدأ بتقييم صادق', 'ركز على المجال الأضعف لرفع الكل', 'قيّم نفسك كل شهر لتتبع تطورك', 'عدم التوازن يسبب ضغطاً خفياً مستمراً'],
    takeawaysEn: ['A balanced life starts with honest assessment', 'Focus on the weakest area to lift everything', 'Assess yourself monthly to track your growth', 'Imbalance creates constant hidden stress'],
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
    takeawaysAr: ['الرؤية القوية تسحبك ولا تحتاج دفعاً', 'اربط أهدافك بمشاعر عميقة وحقيقية', 'عش مستقبلك بالتصور قبل أن يتحقق', 'المستقبل المُلهِم يجعل التضحية سهلة'],
    takeawaysEn: ['A compelling vision pulls you — no pushing needed', 'Connect your goals to deep, real emotions', 'Live your future through visualization before it arrives', 'A compelling future makes sacrifice feel easy'],
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
    takeawaysAr: ['90 يوماً كافية لنتائج حقيقية وقصيرة بما يكفي للتركيز', 'قسّم الهدف الكبير إلى مراحل أسبوعية', 'المراجعة الأسبوعية تمنع الانحراف عن المسار', 'احتفل بالإنجازات الصغيرة لبناء الزخم'],
    takeawaysEn: ['90 days is enough for real results and short enough to focus', 'Break the big goal into weekly milestones', 'Weekly review prevents drifting off course', 'Celebrate small wins to build momentum'],
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
    takeawaysAr: ['الحالة تتحكم بكل شيء في حياتك', 'غيّر جسمك تتغير مشاعرك فوراً', 'تركيزك يحدد واقعك المُعاش', 'الكلمات التي تستخدمها تشكل تجربتك'],
    takeawaysEn: ['State controls everything in your life', 'Change your body, change your feelings instantly', 'Your focus determines your lived reality', 'The words you use shape your experience'],
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
    takeawaysAr: ['كسر النمط يوقف الحلقة السلبية فوراً', 'حركة مفاجئة أو صوت عالٍ يكسر أي حالة', 'النمط المتكرر يقوى كل مرة لا تكسره', 'استبدل النمط القديم بنمط تمكيني جديد'],
    takeawaysEn: ['Pattern interrupt stops the negative loop instantly', 'A sudden movement or loud sound breaks any state', 'Repeated patterns get stronger each time unchallenged', 'Replace the old pattern with an empowering new one'],
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
    takeawaysAr: ['كلمة واحدة تخفض شدة المشاعر السلبية', 'استبدل "غاضب" بـ"منزعج قليلاً" لتهدأ', 'ضخّم الكلمات الإيجابية لتقوّي مشاعرك', 'مفرداتك اليومية تبرمج حالتك بلا وعي'],
    takeawaysEn: ['One word can lower the intensity of negative emotions', 'Replace "furious" with "a bit annoyed" to calm down', 'Amplify positive words to strengthen your feelings', 'Your daily vocabulary programs your state unconsciously'],
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
    takeawaysAr: ['الخوف إشارة للنمو وليس للتوقف', 'كل شخص ناجح يشعر بالخوف ويتحرك رغمه', 'واجه الخوف الصغير أولاً لبناء الشجاعة', 'الخوف يتقلص كل مرة تواجهه فيها'],
    takeawaysEn: ['Fear signals growth, not a reason to stop', 'Every successful person feels fear and acts anyway', 'Face the small fear first to build courage', 'Fear shrinks every time you confront it'],
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
    takeawaysAr: ['التنفس العميق هو أسرع طريقة لرفع الطاقة', 'الجفاف يقتل طاقتك قبل أن تشعر بالعطش', 'الحركة الصباحية تنشط كل خلية في جسمك', 'التغذية القلوية تمنح طاقة مستدامة'],
    takeawaysEn: ['Deep breathing is the fastest way to boost energy', 'Dehydration kills your energy before you feel thirsty', 'Morning movement activates every cell in your body', 'Alkaline nutrition provides sustainable energy'],
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
    takeawaysAr: ['10 أيام كافية لكسر العادات القديمة', 'الالتزام الكامل لمدة قصيرة يبني الثقة', 'تتبع تقدمك يومياً يزيد الدافع', 'الطاقة عادة وليست موهبة'],
    takeawaysEn: ['10 days is enough to break old habits', 'Full commitment for a short period builds confidence', 'Tracking daily progress increases motivation', 'Energy is a habit, not a talent'],
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
    takeawaysAr: ['جودة النوم أهم من عدد الساعات', 'روتين ما قبل النوم يحدد عمق نومك', 'الشاشات قبل النوم تدمر جودة الراحة', 'الاستيقاظ بنشاط يبدأ من الليلة السابقة'],
    takeawaysEn: ['Sleep quality matters more than hours', 'Pre-sleep routine determines your sleep depth', 'Screens before bed destroy rest quality', 'Waking up energized starts the night before'],
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
    takeawaysAr: ['العلاقة الناجحة تحتاج رعاية يومية مستمرة', 'ركز على العطاء قبل الأخذ', 'التواصل العاطفي أهم من حل المشاكل', 'فهم احتياجات شريكك يغير كل شيء'],
    takeawaysEn: ['Successful relationships need daily nurturing', 'Focus on giving before taking', 'Emotional connection matters more than problem-solving', 'Understanding your partner\'s needs changes everything'],
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
    takeawaysAr: ['العطاء يمنحك سعادة أعمق من الأخذ', 'المساهمة هي الحاجة الأسمى عند البشر', 'ابدأ بالعطاء من حيث أنت الآن', 'العطاء يخلق وفرة في حياتك وحياة الآخرين'],
    takeawaysEn: ['Giving brings deeper happiness than receiving', 'Contribution is the highest human need', 'Start giving from where you are right now', 'Giving creates abundance in your life and others\''],
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
    takeawaysAr: ['الابتكار المستمر هو مفتاح البقاء في السوق', 'أضف قيمة أكثر مما يتوقعه العميل', 'القائد الفعّال يبني أنظمة لا تعتمد عليه', 'اعرف أرقامك المالية كل أسبوع'],
    takeawaysEn: ['Constant innovation is the key to market survival', 'Add more value than the customer expects', 'Effective leaders build systems that don\'t depend on them', 'Know your financial numbers every week'],
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
    takeawaysAr: ['الحرية المالية تبدأ بمعرفة رقمك الحقيقي', 'ادّخر نسبة ثابتة مهما كان دخلك', 'الاستثمار التلقائي يتغلب على التسويف', 'نوّع استثماراتك بين الأمان والنمو'],
    takeawaysEn: ['Financial freedom starts with knowing your real number', 'Save a fixed percentage regardless of your income', 'Automatic investing beats procrastination', 'Diversify investments between security and growth'],
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
    takeawaysAr: ['القيادة تأثير وليست منصباً', 'المعايير العالية تجذب الفريق المتميز', 'ألهم فريقك بالقدوة لا بالأوامر', 'تطوير الآخرين يضاعف تأثيرك'],
    takeawaysEn: ['Leadership is influence, not a position', 'High standards attract outstanding teams', 'Inspire your team by example, not by orders', 'Developing others multiplies your impact'],
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
    takeawaysAr: ['قوتك الداخلية موجودة وتنتظر الإطلاق', 'البيئة والأقران يشكلان مصيرك', 'المشي على النار يثبت أن حدودك وهمية', 'التغيير الحقيقي يحدث في لحظة قرار'],
    takeawaysEn: ['Your inner power exists and awaits release', 'Environment and peers shape your destiny', 'The fire walk proves your limits are imaginary', 'Real change happens in a moment of decision'],
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
    takeawaysAr: ['قيمك تحدد قراراتك ومصيرك', 'أعد ترتيب قيمك لتتوافق مع رؤيتك', 'الهوية الجديدة تتطلب قيماً جديدة', 'أربعة أيام يمكن أن تغير حياتك بالكامل'],
    takeawaysEn: ['Your values determine your decisions and destiny', 'Reorder your values to align with your vision', 'A new identity requires new values', 'Four days can completely change your life'],
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
    takeawaysAr: ['تخيل الألم المستقبلي يحرك قرار التغيير', 'عش تكلفة عدم التغيير بكل حواسك', 'ثم عش متعة التغيير بنفس الشدة', 'الرافعة العاطفية أقوى من المنطق'],
    takeawaysEn: ['Imagining future pain drives the decision to change', 'Feel the cost of not changing with all your senses', 'Then feel the pleasure of change with equal intensity', 'Emotional leverage is stronger than logic'],
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
    takeawaysAr: ['30 يوماً كافية لتأسيس عادات جديدة', 'كل يوم يبني على اليوم السابق', 'الالتزام اليومي يصنع التحول التراكمي', 'ابدأ بالتغييرات الصغيرة ثم وسّع'],
    takeawaysEn: ['30 days is enough to establish new habits', 'Each day builds on the previous one', 'Daily commitment creates cumulative transformation', 'Start with small changes then expand'],
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
    takeawaysAr: ['النجاح يترك أدلة — ابحث عن الأنماط', 'قلّد المعتقدات والاستراتيجيات والفسيولوجيا', 'اختصر سنوات بتعلم ممن سبقوك', 'النمذجة ليست نسخاً بل تكييفاً ذكياً'],
    takeawaysEn: ['Success leaves clues — look for the patterns', 'Model the beliefs, strategies, and physiology', 'Compress years by learning from those who came before', 'Modeling is not copying — it is smart adaptation'],
  },
]

/* ─── Watch Progress localStorage key ────────────────────────────────────── */
const LS_KEY = 'upw_watched_videos'

function loadWatched() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function saveWatched(set) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]))
}

/* ─── Smart Recommendations ──────────────────────────────────────────────── */

function getRecommendations(state) {
  const recs = []

  // 1. If user has beliefs data, recommend the beliefs video
  const hasBeliefs = (state.limitingBeliefs && state.limitingBeliefs.length > 0) ||
                     (state.empoweringBeliefs && state.empoweringBeliefs.length > 0)
  if (hasBeliefs) {
    const vid = VIDEOS.find(v => v.id === 'B-dPsLsEYBg') // Beliefs video
    if (vid) recs.push({ video: vid, reasonAr: 'بناءً على معتقداتك المسجلة', reasonEn: 'Based on your recorded beliefs' })
  }

  // 2. If user has low sleep (last 3 entries avg < 6 hours), recommend health videos
  if (state.sleepLog && typeof state.sleepLog === 'object') {
    const entries = Object.values(state.sleepLog)
    const recent = entries.slice(-3)
    if (recent.length > 0) {
      const avgHours = recent.reduce((sum, e) => sum + (e.hours || 0), 0) / recent.length
      if (avgHours < 6) {
        const vid = VIDEOS.find(v => v.id === 'l_NYrWqUR40') // Deep Sleep video
        if (vid) recs.push({ video: vid, reasonAr: 'نومك منخفض مؤخراً — حسّن جودة راحتك', reasonEn: 'Your sleep has been low — improve your rest' })
      }
    }
  }

  // 3. If user hasn't done morning ritual in 3 days, recommend daily ritual videos
  if (state.morningLog && Array.isArray(state.morningLog)) {
    const today = new Date()
    const threeDaysAgo = new Date(today)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const recentMornings = state.morningLog.filter(d => new Date(d) >= threeDaysAgo)
    if (recentMornings.length === 0) {
      const vid = VIDEOS.find(v => v.id === 'wM6exo00T5I') // Morning Routine video
      if (vid) recs.push({ video: vid, reasonAr: 'لم تمارس الطقس الصباحي منذ 3 أيام', reasonEn: 'You haven\'t done morning ritual in 3 days' })
    }
  } else {
    // No morning log at all — recommend morning ritual
    const vid = VIDEOS.find(v => v.id === 'wM6exo00T5I')
    if (vid) recs.push({ video: vid, reasonAr: 'ابدأ بالطقس الصباحي لتبني الزخم', reasonEn: 'Start with morning ritual to build momentum' })
  }

  // Deduplicate by video id and limit to 3
  const seen = new Set()
  return recs.filter(r => {
    if (seen.has(r.video.id)) return false
    seen.add(r.video.id)
    return true
  }).slice(0, 3)
}

/* ─── Video Card Component ────────────────────────────────────────────────── */

function VideoCard({ video, isAr, navigate, isWatched, onToggleWatched }) {
  const [playing, setPlaying] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [showTakeaways, setShowTakeaways] = useState(false)

  const ytDirectUrl   = `https://www.youtube.com/watch?v=${video.id}`
  const ytSearchUrl   = `https://www.youtube.com/results?search_query=Tony+Robbins+${encodeURIComponent(video.titleEn)}`
  const ytUrl         = imgError ? ytSearchUrl : ytDirectUrl

  const takeaways = isAr ? video.takeawaysAr : video.takeawaysEn

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#111', border: `1px solid ${isWatched ? 'rgba(201,168,76,0.3)' : '#1e1e1e'}` }}>
      {/* ── Thumbnail / Inline Player ── */}
      {playing ? (
        <div>
          <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
              title={isAr ? video.titleAr : video.titleEn}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: '12px 12px 0 0' }}
            />
            {/* Close / collapse button */}
            <button
              onClick={() => setPlaying(false)}
              style={{
                position: 'absolute', top: 8, right: 8, zIndex: 10,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} color="#fff" />
            </button>
          </div>
          {/* Fallback below iframe */}
          <div className="flex items-center justify-between px-3 py-2"
            style={{ background: '#0a0a0a', borderTop: '1px solid #1a1a1a' }}>
            <span className="text-xs" style={{ color: '#555' }}>
              {isAr ? 'الفيديو لا يعمل؟' : "Video not playing?"}
            </span>
            <a
              href={ytUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-1.5 transition-all active:scale-95"
              style={{ background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.25)', color: '#ff5555' }}
            >
              {isAr ? 'شاهد على يوتيوب' : 'Watch on YouTube'}
            </a>
          </div>
        </div>
      ) : (
        <button
          onClick={() => imgError ? window.open(ytUrl, '_blank') : setPlaying(true)}
          className="relative w-full"
          style={{ paddingTop: '56.25%' }}
        >
          {/* Thumbnail */}
          {imgError ? (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(145deg, #1c1400 0%, #111 100%)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '0 20px',
            }}>
              <span style={{ fontSize: 28 }}>🎬</span>
              <p style={{
                color: '#c9a84c', fontSize: 12, fontWeight: 700,
                textAlign: 'center', lineHeight: 1.5,
              }}>
                {isAr ? video.titleAr : video.titleEn}
              </p>
              <p style={{ color: '#555', fontSize: 11 }}>
                {isAr ? 'انقر للبحث على يوتيوب' : 'Tap to search on YouTube'}
              </p>
            </div>
          ) : (
            <img
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
              alt={isAr ? video.titleAr : video.titleEn}
              onError={() => setImgError(true)}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}

          {/* Play overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: imgError ? 'transparent' : 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!imgError && (
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(201,168,76,0.9)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Play size={24} fill="#fff" color="#fff" style={{ marginLeft: 3 }} />
              </div>
            )}
          </div>

          {/* Duration badge */}
          {!imgError && (
            <span style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.8)', color: '#fff',
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
            }}>{video.duration}</span>
          )}

          {/* Watched badge */}
          {isWatched && !imgError && (
            <span style={{
              position: 'absolute', top: 8, left: 8,
              background: 'rgba(201,168,76,0.9)', color: '#000',
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <CheckCircle size={12} /> {isAr ? 'تمت المشاهدة' : 'Watched'}
            </span>
          )}
        </button>
      )}

      {/* ── Info ── */}
      <div className="p-3">
        <h4 className="text-sm font-bold text-white mb-1" style={{ lineHeight: 1.4 }}>
          {isAr ? video.titleAr : video.titleEn}
        </h4>
        <p className="text-xs mb-3" style={{ color: '#888', lineHeight: 1.5 }}>
          {isAr ? video.descAr : video.descEn}
        </p>

        {/* ── Key Takeaways (expandable) ── */}
        {takeaways && takeaways.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowTakeaways(!showTakeaways)}
              className="flex items-center gap-1.5 text-xs font-bold transition-all"
              style={{ color: '#c9a84c', opacity: 0.9 }}
            >
              {showTakeaways ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {isAr ? '💡 أهم النقاط' : '💡 Key Takeaways'}
            </button>
            {showTakeaways && (
              <ul className="mt-2 space-y-1.5" style={{ paddingRight: isAr ? 8 : 0, paddingLeft: isAr ? 0 : 8 }}>
                {takeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#aaa', lineHeight: 1.6 }}>
                    <span style={{ color: '#c9a84c', flexShrink: 0, marginTop: 2 }}>&#x2022;</span>
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex items-center flex-wrap gap-2">
          {/* Mark as Watched toggle */}
          <button
            onClick={() => onToggleWatched(video.id)}
            className="flex items-center gap-1.5 text-xs font-bold rounded-xl px-3 py-1.5 transition-all active:scale-95"
            style={{
              background: isWatched ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isWatched ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: isWatched ? '#c9a84c' : '#777',
            }}
          >
            {isWatched
              ? <><CheckCircle size={13} /> {isAr ? 'شاهدت' : 'Watched'}</>
              : <><Circle size={13} /> {isAr ? 'شاهدت' : 'Mark Watched'}</>
            }
          </button>

          {/* YouTube button */}
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold rounded-xl px-3 py-1.5 transition-all active:scale-95"
            style={{
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid rgba(255,60,60,0.22)',
              color: '#ff5555',
            }}
          >
            ▶ {isAr ? 'يوتيوب' : 'YouTube'}
          </a>

          {/* Related tool link */}
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
    </div>
  )
}

/* ─── Recommendation Card (compact) ─────────────────────────────────────── */

function RecommendationCard({ rec, isAr, navigate, isWatched, onToggleWatched }) {
  const video = rec.video

  return (
    <div
      className="rounded-2xl p-3 flex gap-3"
      style={{
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.2)',
        minWidth: 280,
      }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 rounded-xl overflow-hidden relative"
        style={{ width: 100, height: 64 }}
      >
        <img
          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {isWatched && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={20} color="#c9a84c" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-white truncate" style={{ lineHeight: 1.4 }}>
          {isAr ? video.titleAr : video.titleEn}
        </h4>
        <p className="text-xs mt-0.5" style={{ color: '#c9a84c', lineHeight: 1.4 }}>
          {isAr ? rec.reasonAr : rec.reasonEn}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <button
            onClick={() => navigate('/videos')}
            className="text-xs font-bold"
            style={{ color: '#888' }}
          >
            {video.duration}
          </button>
          <button
            onClick={() => onToggleWatched(video.id)}
            className="text-xs font-bold flex items-center gap-1"
            style={{ color: isWatched ? '#c9a84c' : '#555' }}
          >
            {isWatched ? <CheckCircle size={11} /> : <Circle size={11} />}
            {isAr ? 'شاهدت' : 'Watched'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────────────────────── */

export default function VideoLibrary() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const navigate = useNavigate()
  const { state } = useApp()

  const [search, setSearch] = useState('')
  const [openCat, setOpenCat] = useState(CATEGORIES[0].key)
  const [watched, setWatched] = useState(() => loadWatched())

  // Persist watched to localStorage
  useEffect(() => {
    saveWatched(watched)
  }, [watched])

  const toggleWatched = (videoId) => {
    setWatched(prev => {
      const next = new Set(prev)
      if (next.has(videoId)) next.delete(videoId)
      else next.add(videoId)
      return next
    })
  }

  // Smart recommendations
  const recommendations = useMemo(() => getRecommendations(state), [state])

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

  // Watched counts per category
  const watchedCounts = useMemo(() => {
    const counts = {}
    CATEGORIES.forEach(c => {
      const catVideos = VIDEOS.filter(v => v.category === c.key)
      counts[c.key] = { watched: catVideos.filter(v => watched.has(v.id)).length, total: catVideos.length }
    })
    return counts
  }, [watched])

  const totalResults = filteredVideos.length
  const totalWatched = watched.size

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

        {/* Intro card with progress */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-xs" style={{ color: '#c9a84c', lineHeight: 1.7 }}>
            {isAr
              ? '🎬 شاهد الفيديو ثم طبّق مباشرة في الأداة المرتبطة. التعلم بدون تطبيق = ترفيه. التطبيق بدون فهم = تخبط. اجمع بينهما هنا.'
              : '🎬 Watch the video, then apply it directly in the linked tool. Learning without action = entertainment. Action without understanding = confusion. Combine both here.'}
          </p>
          {/* Overall progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#222' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  background: 'linear-gradient(90deg, #c9a84c, #e6c65a)',
                  width: `${(totalWatched / VIDEOS.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-bold" style={{ color: '#c9a84c', whiteSpace: 'nowrap' }}>
              {totalWatched}/{VIDEOS.length} {isAr ? 'شوهد' : 'watched'}
            </span>
          </div>
        </div>

        {/* ── Recommended for You ── */}
        {!search && recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Star size={16} color="#c9a84c" fill="#c9a84c" />
              <h3 className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                {isAr ? 'مقترح لك' : 'Recommended for You'}
              </h3>
            </div>
            <div className="space-y-2">
              {recommendations.map(rec => (
                <RecommendationCard
                  key={rec.video.id}
                  rec={rec}
                  isAr={isAr}
                  navigate={navigate}
                  isWatched={watched.has(rec.video.id)}
                  onToggleWatched={toggleWatched}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {CATEGORIES.map(cat => {
          const videos = grouped[cat.key] || []
          if (search && videos.length === 0) return null
          const isOpen = openCat === cat.key
          const wc = watchedCounts[cat.key]

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
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {isAr ? cat.labelAr : cat.labelEn}
                      {/* Watched count badge */}
                      {wc.watched > 0 && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                          style={{
                            background: wc.watched === wc.total ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)',
                            color: wc.watched === wc.total ? '#c9a84c' : '#666',
                            fontSize: 10,
                          }}
                        >
                          {wc.watched}/{wc.total} {isAr ? 'شوهد' : 'watched'}
                        </span>
                      )}
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
                    <VideoCard
                      key={v.id}
                      video={v}
                      isAr={isAr}
                      navigate={navigate}
                      isWatched={watched.has(v.id)}
                      onToggleWatched={toggleWatched}
                    />
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
              ? `${VIDEOS.length} فيديو في ${CATEGORIES.length} أقسام — ${totalWatched} تمت مشاهدته`
              : `${VIDEOS.length} videos in ${CATEGORIES.length} categories — ${totalWatched} watched`}
          </p>
        </div>
      </div>
    </Layout>
  )
}
