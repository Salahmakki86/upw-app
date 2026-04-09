import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { useApp } from '../context/AppContext'
import Layout from '../components/Layout'

// ─── كل بيانات صلاح الحقيقية من Google Drive ───────────────────────────────

const BUSINESS_MAP = {
  ar: {
    who: 'خبراء في قراءة الطاقة، الحدس، والتشخيص الروحي',
    what: 'نخلق تحولات جذرية من خلال دمج الحدس الروحي بالتحليل المالي العملي',
    serve: 'الأشخاص الذين يعانون من ألم نفسي أو مالي ويبحثون عن وضوح وسلام داخلي',
    problem: 'الضياع، التردد، الألم العاطفي، التعثر المالي، فقدان الثقة',
    why: 'لتحرير الناس من قيودهم الداخلية وتمكينهم من عيش حياة مزدهرة',
    where: 'إمبراطورية تدريب تدر 100,000$ شهرياً وتؤثر في آلاف الأرواح',
  },
  en: {
    who: 'Energy readers, intuition experts & spiritual diagnosticians',
    what: 'We create radical transformations by combining spiritual intuition with practical financial analysis',
    serve: 'People suffering from psychological/financial pain seeking clarity and inner peace',
    problem: 'Confusion, hesitation, emotional pain, financial struggles, lack of confidence',
    why: 'To liberate people from their internal limitations and empower them to live a prosperous life',
    where: 'A training empire generating $100K/month and impacting thousands of lives',
  }
}

const KPIS = {
  ar: [
    { label: 'الإيراد الشهري', current: '$20,000', target: '$50,000+', pct: 40, color: '#2ecc71' },
    { label: 'عدد العملاء', current: '100', target: '300+', pct: 33, color: '#3498db' },
    { label: 'متوسط قيمة الطلب', current: '$165', target: '$450', pct: 37, color: '#9b59b6' },
    { label: 'معدل التحويل', current: '10%', target: '25%', pct: 40, color: '#e67e22' },
  ],
  en: [
    { label: 'Monthly Revenue', current: '$20,000', target: '$50,000+', pct: 40, color: '#2ecc71' },
    { label: 'Clients', current: '100', target: '300+', pct: 33, color: '#3498db' },
    { label: 'Avg Order Value', current: '$165', target: '$450', pct: 37, color: '#9b59b6' },
    { label: 'Conversion Rate', current: '10%', target: '25%', pct: 40, color: '#e67e22' },
  ],
}

const FORCES_DATA = {
  ar: [
    {
      id: 1, emoji: '🗺️', color: '#3498db',
      title: 'خريطة العمل',
      subtitle: 'هويتك ووجهتك — الأساس الذي يبنى عليه كل شيء',
      tagline: 'من أنت؟ ماذا تبيع حقاً؟ وإلى أين تذهب؟',
      xfactor: 'الوحيد الذي يدمج الحدس الروحي بالتحليل المالي العملي',
      oneliner: 'أساعد الأشخاص الذين يعانون من ألم نفسي ومالي على اكتشاف حدسهم وتحويل حياتهم إلى ثقة وازدهار',
      sections: [
        { icon: '🎯', title: 'ما تبيعه حقاً', items: [
          'التحرر من الألم النفسي والصحي والمالي',
          'الوضوح والحدس والقدرة على اتخاذ قرارات أفضل',
          'الثقة والسلام الداخلي والازدهار',
        ]},
        { icon: '✨', title: 'موهبتك الأساسية (لا يملكها 95% من الناس)', items: [
          'القدرة على قراءة الطاقة والتشخيص الروحي',
          'دمج الحدس الروحي مع التحليل المالي العملي',
          'خلق تحولات جذرية لا مجرد تعليم معلومات',
        ]},
        { icon: '👥', title: 'من تحتاج في فريقك', items: [
          'مسوق ممتاز — لجلب العملاء ونشر الرسالة',
          'مدير عمليات — لتنظيم الأنظمة وإدارة الفريق',
          'مصمم ويب/صفحات هبوط — لتحسين التحويلات',
          'محرر فيديو — لإنتاج محتوى عالي الجودة',
        ]},
      ],
      actions: [
        'أكمل قصتك الشخصية (WHY) بصدق تام',
        'راجع خريطة العمل شهرياً وحدّثها',
        'شارك خريطة العمل مع الفريق كاملاً',
        'احفظ X-Factor وردّده يومياً مع فريقك',
        'راجع "أين ستكون بعد 6 أشهر" كل أسبوع',
      ],
    },
    {
      id: 2, emoji: '💡', color: '#9b59b6',
      title: 'الابتكار الاستراتيجي',
      subtitle: 'CANI — التحسين المستمر لا ينتهي أبداً',
      tagline: 'طرق جاي أبراهام الثلاث للنمو الهندسي',
      growth: [
        {
          icon: '👤', title: 'زيادة عدد العملاء',
          from: '100 عميل', to: '300+ عميل',
          strategies: [
            'تحسين معدل التحويل في صفحات الهبوط من 10% إلى 25%',
            'إطلاق برنامج إحالات يكافئ العملاء الحاليين',
            'التوسع: TikTok + LinkedIn + Instagram',
          ]
        },
        {
          icon: '💰', title: 'زيادة متوسط قيمة الطلب',
          from: '$165', to: '$450',
          strategies: [
            'Upsell: جلسة استشارة فردية بنصف السعر مع أي كورس',
            'Cross-sell: كورس التشافي المالي مع كورس الحدس',
            'Bundle: "حزمة التحول الشامل" — كورس + 3 جلسات + مجتمع = $500',
            'VIP: متابعة شخصية أسبوعية عبر WhatsApp',
          ]
        },
        {
          icon: '🔄', title: 'زيادة تكرار الشراء',
          from: '1 مرة', to: '3-5 مرات/سنة',
          strategies: [
            'برنامج اشتراك شهري $150 — محتوى حصري + جلسة جماعية',
            'حزم جلسات متابعة (3 أو 6 جلسات) بدلاً من جلسة واحدة',
            'مجتمع عملاء خاص مدفوع للتفاعل المستمر',
          ]
        },
      ],
      tests: [
        { name: 'حزمة التحول الشامل $500', hypothesis: 'العملاء مستعدون للدفع إذا حصلوا على الكل معاً', expected: '5 مبيعات = $2,500' },
        { name: 'برنامج الاشتراك الشهري $150', hypothesis: '20% من العملاء الحاليين سيشتركون', expected: '20 مشترك = $3,000 دخل متكرر' },
        { name: 'ضمان استرجاع الأموال', hypothesis: '"تحول حقيقي أو استرجاع أموالك" يرفع التحويل 50%', expected: 'التحويل يرتفع من 10% إلى 15%' },
      ],
      actions: [
        'ابدأ اختبار حزمة $500 على قائمة البريد الإلكتروني',
        'أطلق Beta للاشتراك الشهري للعملاء السابقين فقط',
        'غيّر صفحة الهبوط لإضافة ضمان الاسترجاع لأسبوعين',
        'أضف TikTok وLinkedIn لجدول المحتوى الأسبوعي',
        'سجّل النتائج أسبوعياً وحدّث الاختبارات',
      ],
    },
    {
      id: 3, emoji: '📢', color: '#e67e22',
      title: 'أنظمة التسويق',
      subtitle: 'من يعرفك؟ ولماذا يختارك دون غيرك؟',
      tagline: 'X-Factor: الوحيد الذي يجمع الحدس الروحي والتحليل المالي',
      channels: [
        { icon: '🔍', name: 'SEO', desc: 'مقالات طويلة عن التشافي الباطني — جذب عضوي ومجاني' },
        { icon: '📱', name: 'Social Media', desc: 'Instagram + Facebook + TikTok — محتوى يومي يُظهر التحولات' },
        { icon: '📧', name: 'Email Marketing', desc: 'Lead Magnet مجاني + سلسلة رسائل تبني الثقة تلقائياً' },
        { icon: '🤝', name: 'الإحالات', desc: 'نظام مكافآت للعملاء الحاليين على جلب عملاء جدد' },
        { icon: '💸', name: 'إعلانات مدفوعة', desc: 'Google Ads + Facebook Ads — استهداف دقيق للعميل المثالي' },
      ],
      actions: [
        'انشر محتوى يومياً يظهر تحولات حقيقية لعملائك',
        'أنشئ Lead Magnet مجاني (دليل أو تأمل) لبناء القائمة البريدية',
        'اكتب سلسلة 7 رسائل تلقائية تبني الثقة وتؤهل للشراء',
        'حدّد ميزانية إعلانات شهرية وقِس العائد بدقة',
        'أطلق برنامج الإحالات مع مكافأة واضحة',
      ],
    },
    {
      id: 4, emoji: '💼', color: '#e63946',
      title: 'إتقان المبيعات',
      subtitle: 'البيع خدمة — المحادثة الصادقة تبيع أكثر من الإقناع',
      tagline: 'الصيغة الذهبية: Connection → Discovery → Presentation → Close',
      steps: [
        { num: 1, name: 'الاتصال (Connection)', desc: 'ابنِ علاقة إنسانية حقيقية. الناس يشترون من الذين يحبونهم ويثقون بهم.' },
        { num: 2, name: 'اكتشاف الاحتياجات (Discovery)', desc: 'اسأل أسئلة عميقة: ما الألم النفسي؟ ما التعثر المالي؟ ما الذي جرّبوه ولم ينجح؟' },
        { num: 3, name: 'عرض الحل (Presentation)', desc: 'ركّز على التحول والفوائد، ليس خصائص الكورس. "ماذا سيتغير في حياتك".' },
        { num: 4, name: 'معالجة الاعتراضات', desc: 'كل اعتراض هو طلب مزيد من الثقة. قدّم ضمان الاسترجاع كدليل على ثقتك بنتائجك.' },
        { num: 5, name: 'الإغلاق (Close)', desc: 'اطلب البيع بثقة: "متى تريد أن تبدأ تحولك؟" — أنت تقدم قيمة حقيقية، لا تعتذر.' },
      ],
      actions: [
        'اكتب سكريبت محادثة المبيعات لعملائك تحديداً',
        'اجمع أكثر 10 اعتراضات تسمعها مع ردودها الأمثل',
        'سجّل 3 محادثات مبيعات واستمع لتحسين أدائك',
        'قِس نسبة التحويل الحالية في كل محادثة',
        'أضف ضمان "تحول حقيقي أو استرجاع أموالك" لكل عرض',
      ],
    },
    {
      id: 5, emoji: '💰', color: '#2ecc71',
      title: 'التحليل المالي',
      subtitle: 'أرقامك الحقيقية — من $20K إلى $50K+',
      tagline: 'من يعرف أرقامه يتحكم في مصيره',
      metrics: [
        { name: 'الإيرادات الشهرية', current: '$20,000', target: '$50,000+', color: '#2ecc71' },
        { name: 'عدد العملاء الجدد', current: '100', target: '300+', color: '#3498db' },
        { name: 'متوسط قيمة الطلب', current: '$165', target: '$450', color: '#9b59b6' },
        { name: 'معدل التحويل', current: '10%', target: '25%', color: '#e67e22' },
        { name: 'تكلفة اكتساب العميل (CAC)', current: 'يُحسب', target: 'أقل من $50', color: '#e63946' },
        { name: 'هامش الربح الصافي', current: 'يُحسب', target: '60%+', color: '#1abc9c' },
      ],
      actions: [
        'احسب CAC الدقيق لكل قناة تسويقية هذا الأسبوع',
        'احسب هامش الربح الصافي الشهري الآن',
        'ضع لوحة مؤشرات أسبوعية تراجعها كل أحد',
        'راجع التدفق النقدي كل أسبوعين على الأقل',
        'ابنِ توقعات لـ 90 يوم بـ 3 سيناريوهات',
      ],
    },
    {
      id: 6, emoji: '⚙️', color: '#1abc9c',
      title: 'التحسين والتوسع',
      subtitle: 'اعمل على عملك، لا فيه فقط',
      tagline: 'محركات النمو الخمسة — قِس كل واحد أسبوعياً',
      drivers: [
        { icon: '🌐', name: 'عدد الزوار إلى الموقع', desc: 'كم شخصاً يصلك أسبوعياً؟ هذا سقف كل شيء.' },
        { icon: '🎯', name: 'معدل التحويل', desc: 'من 10 زوار كم يشتري؟ الهدف: 25%.' },
        { icon: '💳', name: 'متوسط قيمة الطلب', desc: 'كم يدفع العميل في المتوسط؟ الهدف: $450.' },
        { icon: '🔁', name: 'تكرار الشراء', desc: 'كم مرة يشتري نفس العميل؟ الهدف: 3-5 مرات/سنة.' },
        { icon: '🛡️', name: 'الاحتفاظ بالعميل', desc: 'كم تدفع للاحتفاظ بعميل موجود؟ يجب أن يكون أقل من جلب جديد.' },
      ],
      phases: ['قياس الوضع الحالي', 'تحديد الفجوات', 'تطوير الحلول', 'التنفيذ', 'القياس والإبلاغ'],
      actions: [
        'حدّد 5 مهام تكرارية يمكن أتمتتها فوراً',
        'اكتب SOP لتسجيل العميل الجديد وتجهيزه',
        'قِس كل محرك من محركات النمو الخمسة أسبوعياً',
        'فوّض ما تقضي 80% وقتك فيه لأحد الفريق',
        'اسأل: هل يمكن مضاعفة العملاء بنفس الفريق؟',
      ],
    },
    {
      id: 7, emoji: '❤️', color: '#c9a84c',
      title: 'المعجبون المتحمسون',
      subtitle: 'عميل واحد سعيد يساوي 1000 إعلان',
      tagline: 'الصيغة الذهبية: أعطِ 3-4 أضعاف ما يتوقعون',
      strategies: [
        { icon: '🎁', name: 'قيمة غير متوقعة', desc: 'جلسة مجانية إضافية أو محتوى حصري بعد إتمام الكورس مباشرة.' },
        { icon: '🏘️', name: 'مجتمع داعم', desc: 'ابنِ مجتمعاً خاصاً للعملاء — المجتمع يبقيهم ويجلب لك عملاء جدد.' },
        { icon: '💌', name: 'متابعة شخصية', desc: 'اتصل بعملائك بعد أسبوع من انتهاء الكورس/الجلسات. يشعرون أنك تهتم حقاً.' },
        { icon: '🏆', name: 'الاحتفال بالنجاحات', desc: 'انشر قصص التحول في مجتمعك. هذا يحفّز الآخرين ويُثبّت ثقتهم.' },
      ],
      actions: [
        'أرسل رسالة شكر شخصية لأفضل 10 عملاء الأسبوع',
        'اجمع 5 testimonials مفصّلة من عملائك المتحولين',
        'أنشئ مجموعة واتساب أو تيليغرام للمجتمع الخاص',
        'اتصل بـ 3 عملاء سابقين وتابع تقدمهم',
        'قِس NPS كل ربع: "ما مدى احتمال توصيتك بي؟ من 1-10"',
      ],
    },
  ],
  en: [
    {
      id: 1, emoji: '🗺️', color: '#3498db',
      title: 'Business Map',
      subtitle: 'Your identity and destination — the foundation everything is built on',
      tagline: 'Who are you? What do you really sell? Where are you going?',
      xfactor: 'The only one who combines spiritual intuition with practical financial analysis',
      oneliner: 'I help people suffering from psychological/financial pain discover their intuition and transform their lives into confidence and prosperity',
      sections: [
        { icon: '🎯', title: 'What You Actually Sell', items: [
          'Liberation from psychological, health, and financial pain',
          'Clarity, intuition, and the ability to make better decisions',
          'Confidence, inner peace, and prosperity',
        ]},
        { icon: '✨', title: 'Your Core Talent (95% of people don\'t have it)', items: [
          'The ability to read energy and perform spiritual diagnosis',
          'Combining spiritual intuition with practical financial analysis',
          'Creating radical transformations, not just teaching information',
        ]},
        { icon: '👥', title: 'Who You Need on Your Team', items: [
          'Great marketer — to attract clients and spread the message',
          'Operations manager — to organize systems and manage the team',
          'Web/landing page designer — to improve conversions',
          'Video editor — to produce high-quality content',
        ]},
      ],
      actions: [
        'Complete your personal WHY story with total honesty',
        'Review your Business Map monthly and update it',
        'Share the Business Map with your entire team',
        'Memorize your X-Factor and repeat it daily with your team',
        'Review "Where will you be in 6 months?" every week',
      ],
    },
    {
      id: 2, emoji: '💡', color: '#9b59b6',
      title: 'Strategic Innovation',
      subtitle: 'CANI — Constant And Never-ending Improvement',
      tagline: 'Jay Abraham\'s 3 Methods for Exponential Growth',
      growth: [
        {
          icon: '👤', title: 'Increase Number of Clients',
          from: '100 clients', to: '300+ clients',
          strategies: [
            'Improve landing page conversion from 10% to 25%',
            'Launch a referral program rewarding existing clients',
            'Expand: TikTok + LinkedIn + Instagram',
          ]
        },
        {
          icon: '💰', title: 'Increase Average Order Value',
          from: '$165', to: '$450',
          strategies: [
            'Upsell: Consulting session at half price with any course',
            'Cross-sell: Financial healing course with intuition course',
            'Bundle: "Total Transformation Package" — course + 3 sessions + community = $500',
            'VIP: Personal weekly follow-up via WhatsApp',
          ]
        },
        {
          icon: '🔄', title: 'Increase Purchase Frequency',
          from: '1 time', to: '3-5 times/year',
          strategies: [
            'Monthly membership $150 — exclusive content + group session',
            'Follow-up session packs (3 or 6 sessions) instead of single sessions',
            'Private paid client community for continuous engagement',
          ]
        },
      ],
      tests: [
        { name: 'Total Transformation Bundle $500', hypothesis: 'Clients will pay when they get everything together', expected: '5 sales = $2,500' },
        { name: 'Monthly Membership Beta $150', hypothesis: '20% of existing clients will subscribe', expected: '20 subscribers = $3,000 recurring' },
        { name: 'Money-Back Guarantee', hypothesis: '"Real transformation or your money back" raises conversion 50%', expected: 'Conversion rises from 10% to 15%' },
      ],
      actions: [
        'Start testing the $500 bundle on your email list',
        'Launch the monthly membership Beta for past clients only',
        'Update landing page with money-back guarantee for 2 weeks',
        'Add TikTok and LinkedIn to the weekly content schedule',
        'Record results weekly and update tests',
      ],
    },
    {
      id: 3, emoji: '📢', color: '#e67e22',
      title: 'Marketing Systems',
      subtitle: 'Who knows you? And why do they choose you?',
      tagline: 'X-Factor: The only one combining spiritual intuition with practical financial analysis',
      channels: [
        { icon: '🔍', name: 'SEO', desc: 'Long-form articles on inner healing — free organic traffic that builds trust' },
        { icon: '📱', name: 'Social Media', desc: 'Instagram + Facebook + TikTok — daily content showing real transformations' },
        { icon: '📧', name: 'Email Marketing', desc: 'Free Lead Magnet + automated sequence that builds trust automatically' },
        { icon: '🤝', name: 'Referrals', desc: 'Incentive program rewarding existing clients for bringing new ones' },
        { icon: '💸', name: 'Paid Ads', desc: 'Google Ads + Facebook Ads — precise targeting of your ideal client' },
      ],
      actions: [
        'Post daily content showing real client transformations',
        'Create a free Lead Magnet (guide or meditation) to build your email list',
        'Write a 7-email automated sequence that builds trust and warms up buyers',
        'Set a monthly ads budget and measure ROI precisely',
        'Launch referral program with a clear reward',
      ],
    },
    {
      id: 4, emoji: '💼', color: '#e63946',
      title: 'Sales Mastery',
      subtitle: 'Selling is service — honest conversation sells more than persuasion',
      tagline: 'Golden Formula: Connection → Discovery → Presentation → Close',
      steps: [
        { num: 1, name: 'Connection', desc: 'Build a real human relationship. People buy from those they like and trust.' },
        { num: 2, name: 'Discovery', desc: 'Ask deep questions: What psychological pain? What financial struggle? What have they tried that didn\'t work?' },
        { num: 3, name: 'Presentation', desc: 'Focus on transformation and benefits, not course features. "What will change in your life."' },
        { num: 4, name: 'Objection Handling', desc: 'Every objection is a request for more trust. Offer money-back guarantee as proof of confidence in your results.' },
        { num: 5, name: 'Close', desc: 'Ask for the sale confidently: "When do you want to start your transformation?" — You offer real value, don\'t apologize.' },
      ],
      actions: [
        'Write a sales conversation script specific to your clients',
        'Collect the top 10 objections you hear with optimal responses',
        'Record 3 sales conversations and listen to improve',
        'Measure current conversion rate in every conversation',
        'Add "Real transformation or money back" guarantee to every offer',
      ],
    },
    {
      id: 5, emoji: '💰', color: '#2ecc71',
      title: 'Financial Analysis',
      subtitle: 'Your real numbers — from $20K to $50K+',
      tagline: 'Those who know their numbers control their destiny',
      metrics: [
        { name: 'Monthly Revenue', current: '$20,000', target: '$50,000+', color: '#2ecc71' },
        { name: 'New Clients', current: '100', target: '300+', color: '#3498db' },
        { name: 'Avg Order Value', current: '$165', target: '$450', color: '#9b59b6' },
        { name: 'Conversion Rate', current: '10%', target: '25%', color: '#e67e22' },
        { name: 'CAC', current: 'Calculate', target: 'Under $50', color: '#e63946' },
        { name: 'Net Profit Margin', current: 'Calculate', target: '60%+', color: '#1abc9c' },
      ],
      actions: [
        'Calculate exact CAC per marketing channel this week',
        'Calculate your net profit margin for this month',
        'Set up a weekly KPI dashboard — review every Sunday',
        'Review cash flow every 2 weeks minimum',
        'Build 90-day forecasts with 3 scenarios',
      ],
    },
    {
      id: 6, emoji: '⚙️', color: '#1abc9c',
      title: 'Optimization & Scale',
      subtitle: 'Work ON your business, not just IN it',
      tagline: 'The 5 Growth Drivers — measure each one weekly',
      drivers: [
        { icon: '🌐', name: 'Website Visitors', desc: 'How many people reach you weekly? This is the ceiling of everything.' },
        { icon: '🎯', name: 'Conversion Rate', desc: 'Of every 10 visitors, how many buy? Target: 25%.' },
        { icon: '💳', name: 'Avg Order Value', desc: 'How much does the average client pay? Target: $450.' },
        { icon: '🔁', name: 'Purchase Frequency', desc: 'How many times does the same client buy? Target: 3-5 times/year.' },
        { icon: '🛡️', name: 'Client Retention Cost', desc: 'What do you spend to keep an existing client? Should be less than acquiring new ones.' },
      ],
      phases: ['Measure current state', 'Identify gaps', 'Develop solutions', 'Execute', 'Measure & report'],
      actions: [
        'Identify 5 repetitive tasks that can be automated immediately',
        'Write an SOP for onboarding a new client',
        'Measure all 5 growth drivers weekly',
        'Delegate what you spend 80% of your time on',
        'Ask: can we double clients with the same team?',
      ],
    },
    {
      id: 7, emoji: '❤️', color: '#c9a84c',
      title: 'Raving Fans',
      subtitle: 'One happy client equals 1,000 ads',
      tagline: 'Golden formula: Give 3-4x more than they expect',
      strategies: [
        { icon: '🎁', name: 'Unexpected Value', desc: 'Free extra session or exclusive content right after completing the course.' },
        { icon: '🏘️', name: 'Supportive Community', desc: 'Build a private client community — it retains them and brings you new clients.' },
        { icon: '💌', name: 'Personal Follow-up', desc: 'Call your clients one week after finishing. They feel you truly care.' },
        { icon: '🏆', name: 'Celebrate Transformations', desc: 'Share transformation stories in your community. It motivates others and reinforces trust.' },
      ],
      actions: [
        'Send a personal thank-you note to your top 10 clients this week',
        'Collect 5 detailed testimonials from your transformed clients',
        'Create a private WhatsApp or Telegram community group',
        'Call 3 past clients and follow up on their progress',
        'Measure NPS each quarter: "How likely are you to recommend me? 1-10"',
      ],
    },
  ],
}

const WEEKLY_SCHEDULE = {
  ar: [
    { day: 'كل أحد', tasks: ['راجع لوحة التحكم الرئيسية (15 د)', 'حدّث مسار المبيعات (10 د)', 'راجع أداء التسويق (10 د)'] },
    { day: 'كل أربعاء', tasks: ['وقت التفكير الاستراتيجي (45 د)', 'اجتماع الفريق الأسبوعي (40 د)'] },
    { day: 'نهاية كل شهر', tasks: ['تحديث الأرقام المالية', 'مراجعة تقدم الـ 7 Forces', 'تحديث Gap Map'] },
  ],
  en: [
    { day: 'Every Sunday', tasks: ['Review main dashboard (15 min)', 'Update sales pipeline (10 min)', 'Review marketing performance (10 min)'] },
    { day: 'Every Wednesday', tasks: ['Strategic thinking time (45 min)', 'Weekly team meeting (40 min)'] },
    { day: 'End of every month', tasks: ['Update financial numbers', 'Review 7 Forces progress', 'Update Gap Map'] },
  ],
}

// ─── Sub-component: Force Detail View ────────────────────────────────────────

function ForceDetail({ force, lang, checkedActions, onToggleAction, onBack }) {
  const pct = force.actions.filter((_, i) => checkedActions[`${force.id}-${i}`]).length
  const pctVal = Math.round((pct / force.actions.length) * 100)

  return (
    <Layout
      title={`${force.emoji} ${force.title}`}
      subtitle={force.tagline}
      rightAction={
        <button
          onClick={onBack}
          className="text-xs px-3 py-1.5 rounded-full font-bold"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}
        >
          {lang === 'ar' ? '← رجوع' : '← Back'}
        </button>
      }
    >
      <div className="space-y-4 pt-2">

        {/* Overview bar */}
        <div className="rounded-2xl p-4" style={{ background: `${force.color}10`, border: `1px solid ${force.color}30` }}>
          <p className="text-sm leading-relaxed text-white mb-3">{force.subtitle}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full" style={{ background: '#222' }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${pctVal}%`, background: force.color }} />
            </div>
            <span className="text-xs font-bold" style={{ color: force.color }}>{pctVal}%</span>
          </div>
        </div>

        {/* Force #1 — Business Map */}
        {force.id === 1 && (
          <>
            <div className="rounded-2xl p-4 space-y-2" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#c9a84c' }}>X-FACTOR</p>
              <p className="text-sm font-bold text-white">"{force.xfactor}"</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#888' }}>One-Liner</p>
              <p className="text-sm text-white leading-relaxed">{force.oneliner}</p>
            </div>
            {force.sections.map((sec, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                <p className="text-sm font-bold text-white mb-2">{sec.icon} {sec.title}</p>
                {sec.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2 mb-1.5">
                    <span style={{ color: force.color }} className="text-xs mt-0.5">▸</span>
                    <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>{item}</p>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* Force #2 — Growth Methods */}
        {force.id === 2 && (
          <>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#666' }}>
              {lang === 'ar' ? 'طرق النمو الثلاث — جاي أبراهام' : '3 Growth Methods — Jay Abraham'}
            </p>
            {force.growth.map((g, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: `1px solid ${force.color}22` }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-white text-sm">{g.icon} {g.title}</p>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span style={{ color: '#555' }}>{g.from}</span>
                    <span style={{ color: force.color }}>→</span>
                    <span className="font-bold" style={{ color: force.color }}>{g.to}</span>
                  </div>
                </div>
                {g.strategies.map((s, j) => (
                  <div key={j} className="flex items-start gap-2 mb-1.5">
                    <span style={{ color: force.color }} className="text-xs mt-0.5">✓</span>
                    <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>{s}</p>
                  </div>
                ))}
              </div>
            ))}
            <p className="text-xs font-bold uppercase tracking-wider mt-2" style={{ color: '#666' }}>
              {lang === 'ar' ? 'الاختبارات الجارية' : 'Active Tests'}
            </p>
            {force.tests.map((test, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.2)' }}>
                <p className="text-sm font-bold text-white">{test.name}</p>
                <p className="text-xs mt-1" style={{ color: '#888' }}>{test.hypothesis}</p>
                <p className="text-xs mt-1 font-bold" style={{ color: '#9b59b6' }}>
                  {lang === 'ar' ? 'المتوقع:' : 'Expected:'} {test.expected}
                </p>
              </div>
            ))}
          </>
        )}

        {/* Force #3 — Marketing Channels */}
        {force.id === 3 && (
          <>
            <div className="rounded-2xl p-4" style={{ background: `${force.color}08`, border: `1px solid ${force.color}25` }}>
              <p className="text-xs font-bold mb-1" style={{ color: force.color }}>X-FACTOR</p>
              <p className="text-sm font-bold text-white">"{force.xfactor}"</p>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#666' }}>
              {lang === 'ar' ? 'القنوات الخمس' : '5 Channels'}
            </p>
            {force.channels.map((ch, i) => (
              <div key={i} className="rounded-xl p-3 flex items-start gap-3" style={{ background: '#1a1a1a', border: '1px solid #252525' }}>
                <span className="text-xl">{ch.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{ch.name}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#888' }}>{ch.desc}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Force #4 — Sales Steps */}
        {force.id === 4 && (
          <div className="space-y-2">
            {force.steps.map((step, i) => (
              <div key={i} className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#1a1a1a', border: '1px solid #252525' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: `${force.color}18`, color: force.color }}>
                  {step.num}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{step.name}</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#aaa' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Force #5 — Metrics */}
        {force.id === 5 && (
          <div className="grid grid-cols-2 gap-2">
            {force.metrics.map((m, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: '#1a1a1a', border: `1px solid ${m.color}22` }}>
                <p className="text-xs mb-2" style={{ color: '#666' }}>{m.name}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs" style={{ color: '#555' }}>{lang === 'ar' ? 'الآن' : 'Now'}</p>
                    <p className="text-sm font-bold text-white">{m.current}</p>
                  </div>
                  <span style={{ color: m.color }} className="text-xs">→</span>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: '#555' }}>{lang === 'ar' ? 'الهدف' : 'Target'}</p>
                    <p className="text-sm font-bold" style={{ color: m.color }}>{m.target}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Force #6 — Drivers */}
        {force.id === 6 && (
          <>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#666' }}>
              {lang === 'ar' ? 'محركات النمو الخمسة' : '5 Growth Drivers'}
            </p>
            {force.drivers.map((d, i) => (
              <div key={i} className="rounded-xl p-3 flex items-start gap-3" style={{ background: '#1a1a1a', border: '1px solid #252525' }}>
                <span className="text-xl">{d.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{d.name}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#888' }}>{d.desc}</p>
                </div>
              </div>
            ))}
            <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#888' }}>{lang === 'ar' ? 'مراحل التحسين' : 'Improvement Phases'}</p>
              <div className="flex flex-wrap gap-1.5">
                {force.phases.map((ph, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ background: `${force.color}15`, color: force.color }}>
                    {i + 1}. {ph}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Force #7 — Strategies */}
        {force.id === 7 && (
          <>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <p className="text-sm font-bold text-white">{lang === 'ar' ? 'النسبة الذهبية 3:1' : 'Golden Ratio 3:1'}</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#888' }}>
                {lang === 'ar'
                  ? 'لكل شيء يتوقعه عميلك، أعطه 3-4 أضعاف. هذا يحوّله من عميل راضٍ إلى معجب متحمس يبيع عنك.'
                  : 'For everything your client expects, give them 3-4x more. This transforms them from a satisfied client to a raving fan who sells for you.'}
              </p>
            </div>
            {force.strategies.map((s, i) => (
              <div key={i} className="rounded-xl p-3 flex items-start gap-3" style={{ background: '#1a1a1a', border: '1px solid #252525' }}>
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{s.name}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#888' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Action checklist — same for all */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#666' }}>
            {lang === 'ar' ? 'خطوات التطبيق' : 'Action Steps'}
          </p>
          <div className="space-y-2">
            {force.actions.map((action, i) => {
              const key = `${force.id}-${i}`
              const done = !!checkedActions[key]
              return (
                <button
                  key={i}
                  onClick={() => onToggleAction(key)}
                  className="w-full flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98] text-right"
                  style={{
                    background: done ? 'rgba(46,204,113,0.08)' : '#111',
                    border: `1px solid ${done ? 'rgba(46,204,113,0.25)' : '#1e1e1e'}`,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all"
                    style={{ borderColor: done ? '#2ecc71' : '#333', background: done ? 'rgba(46,204,113,0.2)' : 'transparent' }}
                  >
                    {done && <span className="text-xs text-green-400">✓</span>}
                  </div>
                  <span className="text-xs flex-1 leading-relaxed" style={{ color: done ? '#ddd' : '#888', textDecoration: done ? 'line-through' : 'none' }}>
                    {action}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </Layout>
  )
}

// ─── KPI definitions: targets + display config ───────────────────────────────

const KPI_CONFIG = {
  ar: [
    { key: 'revenue',    label: 'الإيراد الشهري',       unit: '$', target: 50000, targetLabel: '$50,000+', color: '#2ecc71', inputMode: 'numeric' },
    { key: 'clients',    label: 'عدد العملاء',           unit: '',  target: 300,   targetLabel: '300+',     color: '#3498db', inputMode: 'numeric' },
    { key: 'avgOrder',   label: 'متوسط قيمة الطلب',     unit: '$', target: 450,   targetLabel: '$450',     color: '#9b59b6', inputMode: 'numeric' },
    { key: 'conversion', label: 'معدل التحويل',          unit: '%', target: 25,    targetLabel: '25%',      color: '#e67e22', inputMode: 'decimal' },
    { key: 'cac',        label: 'تكلفة اكتساب العميل',  unit: '$', target: 50,    targetLabel: 'أقل من $50', color: '#e63946', inputMode: 'numeric', inverse: true },
    { key: 'margin',     label: 'هامش الربح الصافي',    unit: '%', target: 60,    targetLabel: '60%+',     color: '#1abc9c', inputMode: 'decimal' },
  ],
  en: [
    { key: 'revenue',    label: 'Monthly Revenue',      unit: '$', target: 50000, targetLabel: '$50,000+', color: '#2ecc71', inputMode: 'numeric' },
    { key: 'clients',    label: 'Clients',              unit: '',  target: 300,   targetLabel: '300+',     color: '#3498db', inputMode: 'numeric' },
    { key: 'avgOrder',   label: 'Avg Order Value',      unit: '$', target: 450,   targetLabel: '$450',     color: '#9b59b6', inputMode: 'numeric' },
    { key: 'conversion', label: 'Conversion Rate',      unit: '%', target: 25,    targetLabel: '25%',      color: '#e67e22', inputMode: 'decimal' },
    { key: 'cac',        label: 'CAC',                  unit: '$', target: 50,    targetLabel: 'Under $50', color: '#e63946', inputMode: 'numeric', inverse: true },
    { key: 'margin',     label: 'Net Profit Margin',    unit: '%', target: 60,    targetLabel: '60%+',     color: '#1abc9c', inputMode: 'decimal' },
  ],
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BusinessMastery() {
  const { lang } = useLang()
  const { state, updateBusinessKPI, saveBusinessSnapshot, toggleBusinessAction } = useApp()
  const [selectedForce, setSelectedForce] = useState(null)
  const [activeTab, setActiveTab] = useState('forces')
  const [editingKPI, setEditingKPI] = useState(null)     // key of KPI being edited
  const [inputVal, setInputVal] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  const forces   = FORCES_DATA[lang]
  const kpiDefs  = KPI_CONFIG[lang]
  const schedule = WEEKLY_SCHEDULE[lang]
  const bizMap   = BUSINESS_MAP[lang]

  const businessActions = state.businessActions || {}
  const kpis            = state.businessKPIs    || {}
  const history         = state.businessKPIHistory || []

  // ── helpers ──
  const getForceProgress = (forceId, actionsLen) => {
    let count = 0
    for (let i = 0; i < actionsLen; i++) {
      if (businessActions[`${forceId}-${i}`]) count++
    }
    return Math.round((count / actionsLen) * 100)
  }

  const totalProgress = () => {
    let done = 0, total = 0
    forces.forEach(f => {
      f.actions.forEach((_, i) => {
        total++
        if (businessActions[`${f.id}-${i}`]) done++
      })
    })
    return total === 0 ? 0 : Math.round((done / total) * 100)
  }

  const kpiPct = (def) => {
    const val = Number(kpis[def.key]) || 0
    if (def.inverse) return val === 0 ? 0 : Math.min(100, Math.round((def.target / val) * 100))
    return Math.min(100, Math.round((val / def.target) * 100))
  }

  const formatVal = (def) => {
    const val = Number(kpis[def.key]) || 0
    if (val === 0) return lang === 'ar' ? 'أدخل' : 'Enter'
    return def.unit === '$' && def.key === 'revenue'
      ? `$${val.toLocaleString()}`
      : `${def.unit}${val}`
  }

  const openEdit = (def) => {
    setEditingKPI(def.key)
    setInputVal(String(kpis[def.key] || ''))
  }

  const confirmEdit = () => {
    if (editingKPI && inputVal !== '') {
      updateBusinessKPI(editingKPI, Number(inputVal))
    }
    setEditingKPI(null)
    setInputVal('')
  }

  const handleSaveSnapshot = () => {
    saveBusinessSnapshot()
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  const formatMonth = (monthStr) => {
    const [y, m] = monthStr.split('-')
    const months = lang === 'ar'
      ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[parseInt(m, 10) - 1]} ${y}`
  }

  // ── force detail view ──
  if (selectedForce) {
    return (
      <ForceDetail
        force={selectedForce}
        lang={lang}
        checkedActions={businessActions}
        onToggleAction={toggleBusinessAction}
        onBack={() => setSelectedForce(null)}
      />
    )
  }

  const TABS = [
    { key: 'forces', label: lang === 'ar' ? '⚡ القوى' : '⚡ Forces' },
    { key: 'kpis',   label: lang === 'ar' ? '📊 أرقامي' : '📊 My KPIs' },
    { key: 'map',    label: lang === 'ar' ? '🗺️ خريطتي' : '🗺️ My Map' },
    { key: 'system', label: lang === 'ar' ? '📅 النظام' : '📅 System' },
  ]

  return (
    <Layout
      title={lang === 'ar' ? '🏆 إتقان الأعمال' : '🏆 Business Mastery'}
      subtitle={lang === 'ar' ? 'نظام صلاح للنمو — 7 قوى × بياناتك الحقيقية' : 'Salah\'s Growth System — 7 Forces × Your Real Data'}
    >
      <div className="space-y-4 pt-2">

        {/* Hero strip — live KPIs */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'linear-gradient(135deg,#1a1500,#1a1a1a)', border: '1px solid rgba(201,168,76,0.25)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">
              {lang === 'ar' ? 'تقدمك الإجمالي' : 'Overall Progress'}
            </p>
            <span className="text-sm font-black" style={{ color: '#c9a84c' }}>{totalProgress()}%</span>
          </div>
          <div className="h-2 rounded-full mb-3" style={{ background: '#222' }}>
            <div className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress()}%`, background: 'linear-gradient(90deg,#a88930,#e8c96a)' }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)' }}>
              <p className="text-xs" style={{ color: '#888' }}>{lang === 'ar' ? 'الإيراد الشهري' : 'Monthly Revenue'}</p>
              <p className="text-base font-black" style={{ color: '#2ecc71' }}>
                ${(Number(kpis.revenue) || 0).toLocaleString()}
              </p>
              <p className="text-xs font-bold" style={{ color: '#555' }}>→ $50K+</p>
            </div>
            <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)' }}>
              <p className="text-xs" style={{ color: '#888' }}>{lang === 'ar' ? 'العملاء' : 'Clients'}</p>
              <p className="text-base font-black" style={{ color: '#3498db' }}>
                {Number(kpis.clients) || 0}
              </p>
              <p className="text-xs font-bold" style={{ color: '#555' }}>→ 300+</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: activeTab === tab.key ? 'rgba(201,168,76,0.15)' : '#111',
                border: `1px solid ${activeTab === tab.key ? 'rgba(201,168,76,0.4)' : '#1e1e1e'}`,
                color: activeTab === tab.key ? '#c9a84c' : '#555',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: 7 Forces ─────────────────────────────────── */}
        {activeTab === 'forces' && (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: '#555' }}>
              {lang === 'ar' ? 'اضغط على أي قوة للتفاصيل والتطبيق' : 'Tap any Force for details and action steps'}
            </p>
            {forces.map((force) => {
              const pct = getForceProgress(force.id, force.actions.length)
              return (
                <button key={force.id} onClick={() => setSelectedForce(force)}
                  className="w-full rounded-2xl p-4 text-right transition-all active:scale-[0.98]"
                  style={{ background: '#1a1a1a', border: `1px solid ${pct > 0 ? force.color + '35' : '#252525'}` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: `${force.color}18`, color: force.color }}>
                      {force.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{force.emoji}</span>
                        <p className="font-bold text-white text-sm">{force.title}</p>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#666' }}>{force.subtitle}</p>
                      {pct > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full" style={{ background: '#222' }}>
                            <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: force.color }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: force.color }}>{pct}%</span>
                        </div>
                      )}
                    </div>
                    <span style={{ color: '#444', fontSize: 18 }}>{lang === 'ar' ? '←' : '→'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ─── Tab: KPIs — editable ─────────────────────────── */}
        {activeTab === 'kpis' && (
          <div className="space-y-3">

            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: '#555' }}>
                {lang === 'ar' ? 'اضغط على أي رقم لتحديثه' : 'Tap any number to update it'}
              </p>
              <button
                onClick={handleSaveSnapshot}
                className="text-xs px-3 py-1.5 rounded-full font-bold transition-all active:scale-95"
                style={{
                  background: savedFlash ? 'rgba(46,204,113,0.2)' : 'rgba(201,168,76,0.12)',
                  border: `1px solid ${savedFlash ? 'rgba(46,204,113,0.5)' : 'rgba(201,168,76,0.35)'}`,
                  color: savedFlash ? '#2ecc71' : '#c9a84c',
                }}
              >
                {savedFlash
                  ? (lang === 'ar' ? '✓ تم الحفظ' : '✓ Saved')
                  : (lang === 'ar' ? '💾 حفظ لقطة' : '💾 Save Snapshot')}
              </button>
            </div>

            {/* KPI cards — tappable */}
            {kpiDefs.map((def) => {
              const pct = kpiPct(def)
              const isEditing = editingKPI === def.key
              const val = Number(kpis[def.key]) || 0
              return (
                <div key={def.key} className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: `1px solid ${def.color}25` }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold" style={{ color: '#888' }}>{def.label}</p>
                    <p className="text-xs" style={{ color: '#555' }}>
                      {lang === 'ar' ? 'الهدف:' : 'Target:'} <span style={{ color: def.color }}>{def.targetLabel}</span>
                    </p>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold" style={{ color: def.color }}>{def.unit || ''}</span>
                      <input
                        autoFocus
                        type="number"
                        inputMode={def.inputMode}
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onBlur={confirmEdit}
                        onKeyDown={e => e.key === 'Enter' && confirmEdit()}
                        className="flex-1 rounded-xl px-3 py-2 text-base font-black text-white text-center"
                        style={{ background: '#0a0a0a', border: `1px solid ${def.color}60`, outline: 'none' }}
                        placeholder="0"
                      />
                      <button
                        onClick={confirmEdit}
                        className="px-3 py-2 rounded-xl text-xs font-bold"
                        style={{ background: `${def.color}20`, color: def.color }}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openEdit(def)}
                      className="w-full flex items-center justify-between mb-3 rounded-xl px-3 py-2 active:scale-[0.98] transition-all"
                      style={{ background: '#111', border: `1px solid ${val > 0 ? def.color + '30' : '#1e1e1e'}` }}
                    >
                      <p className="text-xs" style={{ color: '#555' }}>
                        {lang === 'ar' ? 'الآن' : 'Now'}
                      </p>
                      <p className="text-xl font-black" style={{ color: val > 0 ? 'white' : '#444' }}>
                        {val > 0
                          ? (def.unit === '$' && def.key === 'revenue'
                              ? `$${val.toLocaleString()}`
                              : `${val}${def.unit}`)
                          : (lang === 'ar' ? 'اضغط للإدخال' : 'Tap to enter')}
                      </p>
                      <span style={{ color: def.color, fontSize: 16 }}>✎</span>
                    </button>
                  )}

                  <div className="h-2 rounded-full mb-1" style={{ background: '#222' }}>
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: def.color }} />
                  </div>
                  <p className="text-xs text-right" style={{ color: pct >= 100 ? def.color : '#555' }}>
                    {pct >= 100 ? '🎉 ' : ''}{pct}% {lang === 'ar' ? 'من الهدف' : 'of target'}
                  </p>
                </div>
              )
            })}

            {/* Monthly history */}
            {history.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #252525' }}>
                <div className="px-4 py-2.5" style={{ background: 'rgba(201,168,76,0.08)', borderBottom: '1px solid #252525' }}>
                  <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                    📅 {lang === 'ar' ? 'السجل الشهري' : 'Monthly History'}
                  </p>
                </div>
                <div className="p-3 space-y-2">
                  {[...history].reverse().map((snap, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #1e1e1e' }}>
                      <p className="text-xs font-bold mb-2" style={{ color: '#c9a84c' }}>{formatMonth(snap.month)}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: lang === 'ar' ? 'الإيراد' : 'Revenue', val: `$${(snap.revenue || 0).toLocaleString()}`, c: '#2ecc71' },
                          { label: lang === 'ar' ? 'العملاء' : 'Clients', val: snap.clients || 0, c: '#3498db' },
                          { label: lang === 'ar' ? 'التحويل' : 'Conv.', val: `${snap.conversion || 0}%`, c: '#e67e22' },
                        ].map((item, j) => (
                          <div key={j} className="text-center">
                            <p className="text-xs" style={{ color: '#555' }}>{item.label}</p>
                            <p className="text-sm font-black" style={{ color: item.c }}>{item.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl p-4" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
                💡 {lang === 'ar' ? 'الخطوة التحويلية' : 'Game-Changing Step'}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>
                {lang === 'ar'
                  ? 'رفع متوسط قيمة الطلب من $165 إلى $450 وحده يضاعف إيراداتك مع نفس العدد من العملاء.'
                  : 'Raising avg order value from $165 to $450 alone doubles your revenue with the same number of clients.'}
              </p>
            </div>
          </div>
        )}

        {/* ─── Tab: Business Map ────────────────────────────── */}
        {activeTab === 'map' && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#555' }}>
              {lang === 'ar' ? 'خريطة عملك الرسمية — هويتك ووجهتك' : 'Your official business map — identity and destination'}
            </p>
            {[
              { key: 'who',    label: lang === 'ar' ? '👤 من نحن' : '👤 Who We Are' },
              { key: 'what',   label: lang === 'ar' ? '⚡ ماذا نفعل' : '⚡ What We Do' },
              { key: 'serve',  label: lang === 'ar' ? '🎯 من نخدم' : '🎯 Who We Serve' },
              { key: 'problem',label: lang === 'ar' ? '🔥 المشكلة التي نحلها' : '🔥 Problem We Solve' },
              { key: 'why',    label: lang === 'ar' ? '💎 لماذا نحن موجودون' : '💎 Why We Exist' },
              { key: 'where',  label: lang === 'ar' ? '🚀 إلى أين نذهب' : '🚀 Where We\'re Going' },
            ].map((item) => (
              <div key={item.key} className="rounded-xl p-4" style={{ background: '#1a1a1a', border: '1px solid #252525' }}>
                <p className="text-xs font-bold mb-1.5" style={{ color: '#c9a84c' }}>{item.label}</p>
                <p className="text-sm text-white leading-relaxed">{bizMap[item.key]}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── Tab: Weekly System ───────────────────────────── */}
        {activeTab === 'system' && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#555' }}>
              {lang === 'ar' ? 'جدول المراجعة الأسبوعية — الاتساق أهم من الكمال' : 'Weekly review schedule — consistency beats perfection'}
            </p>
            {schedule.map((block, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #252525' }}>
                <div className="px-4 py-2.5" style={{ background: 'rgba(201,168,76,0.08)', borderBottom: '1px solid #252525' }}>
                  <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>📅 {block.day}</p>
                </div>
                <div className="p-3 space-y-1.5">
                  {block.tasks.map((task, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span style={{ color: '#c9a84c' }} className="text-xs">▸</span>
                      <p className="text-xs" style={{ color: '#aaa' }}>{task}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-xs font-bold" style={{ color: '#c9a84c' }}>
                🔥 {lang === 'ar' ? 'قواعد النجاح' : 'Rules for Success'}
              </p>
              {(lang === 'ar' ? [
                'لا تنتظر حتى تكون الأرقام مثالية — ابدأ بما لديك الآن',
                'الاتساق أهم من الكمال — راجع النظام بانتظام',
                'شارك الفريق في تحديث الملفات لتوزيع المسؤولية',
                'احتفل بكل تقدم صغير — هذا يبني الزخم',
              ] : [
                "Don't wait for perfect numbers — start with what you have now",
                'Consistency beats perfection — review the system regularly',
                'Involve the team in updating files to distribute responsibility',
                'Celebrate every small win — this builds momentum',
              ]).map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ color: '#c9a84c' }} className="text-xs mt-0.5">✓</span>
                  <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
