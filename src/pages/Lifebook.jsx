import { useState } from 'react'
import { CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

/* ─── 12 CATEGORIES ─────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    id: 'health',
    emoji: '💪',
    color: '#2ecc71',
    ar: { title: 'الصحة واللياقة', subtitle: 'جسمك هو منزلك الدائم الوحيد' },
    en: { title: 'Health & Fitness', subtitle: 'Your body is your only permanent home' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن الصحة والجسم؟ هل تؤمن أنك تستحق صحة مثالية؟',
          'ما الذي قيل لك عن الصحة في طفولتك؟ هل هذه المعتقدات تخدمك؟',
          'ما هي القيود التي تؤمن بها عن قدرتك الجسدية؟',
        ],
        vision: [
          'كيف يبدو جسمك المثالي؟ صف بالتفصيل — الوزن، الطاقة، القوة',
          'ماذا تستطيع أن تفعل بجسمك المثالي لا تستطيعه الآن؟',
          'كيف تشعر عند الاستيقاظ كل صباح؟ ما مستوى طاقتك؟',
          'ما عادات الأكل والنوم والرياضة التي تمارسها في حياتك المثالية؟',
        ],
        purpose: [
          'لماذا الصحة المثالية مهمة لك شخصياً؟',
          'من يعتمد عليك؟ كيف تؤثر صحتك على من تحب؟',
          'ما الذي ستُضحي به إذا لم تعتنِ بصحتك؟',
        ],
        strategy: [
          'ما 3 تغييرات فورية ستجريها على نظامك الغذائي؟',
          'ما برنامج التمارين الأسبوعي الذي ستلتزم به؟',
          'ما نظام النوم المثالي لك؟',
          'ما الفحوصات الطبية التي ستجريها هذا الشهر؟',
        ],
      },
      en: {
        beliefs: [
          'What do you believe about health and your body? Do you believe you deserve perfect health?',
          'What were you told about health in childhood? Do these beliefs serve you?',
          'What limitations do you believe about your physical capabilities?',
        ],
        vision: [
          'What does your ideal body look like? Describe in detail — weight, energy, strength',
          'What can you do with your ideal body that you cannot do now?',
          'How do you feel waking up each morning? What is your energy level?',
          'What eating, sleep, and exercise habits do you practice in your ideal life?',
        ],
        purpose: [
          'Why is perfect health personally important to you?',
          'Who depends on you? How does your health affect those you love?',
          'What will you sacrifice if you do not take care of your health?',
        ],
        strategy: [
          'What 3 immediate changes will you make to your diet?',
          'What weekly exercise routine will you commit to?',
          'What is your ideal sleep system?',
          'What medical check-ups will you schedule this month?',
        ],
      },
    },
  },
  {
    id: 'intellectual',
    emoji: '🧠',
    color: '#3498db',
    ar: { title: 'الحياة الفكرية', subtitle: 'عقلك يحتاج تغذية كالجسم تماماً' },
    en: { title: 'Intellectual Life', subtitle: 'Your mind needs nourishment just like your body' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن قدرتك على التعلم؟ هل أنت شخص ذكي؟',
          'هل تؤمن أنك تستطيع تعلم أي مهارة إذا التزمت بها؟',
          'ما الأفكار التي تعيق نموك الفكري؟',
        ],
        vision: [
          'ما المجالات التي تريد أن تصبح خبيراً فيها؟',
          'كم كتاباً تقرأ سنوياً في حياتك المثالية؟ في أي مجالات؟',
          'ما اللغات أو المهارات الجديدة التي تتقنها؟',
          'كيف تستخدم معرفتك لخدمة الآخرين وإضافة قيمة؟',
        ],
        purpose: [
          'لماذا النمو الفكري مهم لك؟ ما الذي يحفزك على التعلم؟',
          'كيف سيغير النمو الفكري حياتك ومستقبلك؟',
        ],
        strategy: [
          'ما الكتب الـ 12 التي ستقرأها هذا العام؟',
          'ما الدورات أو المهارات التي ستتعلمها في الـ 90 يوماً القادمة؟',
          'كيف تخصص وقتاً يومياً للقراءة والتعلم؟',
          'ما المصادر والأشخاص الذين ستتعلم منهم؟',
        ],
      },
      en: {
        beliefs: [
          'What do you believe about your ability to learn? Are you an intelligent person?',
          'Do you believe you can learn any skill if you commit to it?',
          'What ideas hinder your intellectual growth?',
        ],
        vision: [
          'What fields do you want to become an expert in?',
          'How many books do you read annually in your ideal life? In what areas?',
          'What new languages or skills have you mastered?',
          'How do you use your knowledge to serve others and add value?',
        ],
        purpose: [
          'Why is intellectual growth important to you? What motivates you to learn?',
          'How will intellectual growth change your life and future?',
        ],
        strategy: [
          'What 12 books will you read this year?',
          'What courses or skills will you learn in the next 90 days?',
          'How do you allocate daily time for reading and learning?',
          'What resources and people will you learn from?',
        ],
      },
    },
  },
  {
    id: 'emotional',
    emoji: '❤️',
    color: '#e74c3c',
    ar: { title: 'الحياة العاطفية', subtitle: 'مشاعرك تصنع تجربة حياتك' },
    en: { title: 'Emotional Life', subtitle: 'Your emotions create your life experience' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن المشاعر؟ هل الإحساس بها قوة أم ضعف؟',
          'ما المشاعر التي تسمح لنفسك بتجربتها؟ وما التي تكبتها؟',
          'هل تؤمن أنك تستحق السعادة والفرح الحقيقيين؟',
        ],
        vision: [
          'ما مشاعرك السائدة في حياتك المثالية؟ صف يوماً عاطفياً مثالياً',
          'كيف تتعامل مع الضغط والتحديات في نسختك المثالية؟',
          'كيف تعبّر عن مشاعرك بصدق وصحة مع من تحب؟',
        ],
        purpose: [
          'لماذا الصحة العاطفية أولوية لك؟',
          'كيف تؤثر صحتك العاطفية على قراراتك وعلاقاتك؟',
        ],
        strategy: [
          'ما الممارسات اليومية التي ستبني صحتك العاطفية؟',
          'كيف ستتعامل مع المشاعر السلبية عندما تظهر؟',
          'ما الحدود التي ستضعها لحماية طاقتك العاطفية؟',
          'هل ستطلب مساعدة متخصص؟ متى؟',
        ],
      },
      en: {
        beliefs: [
          'What do you believe about emotions? Is feeling them strength or weakness?',
          'What emotions do you allow yourself to experience? Which do you suppress?',
          'Do you believe you deserve genuine happiness and joy?',
        ],
        vision: [
          'What are your dominant emotions in your ideal life? Describe an ideal emotional day',
          'How do you handle stress and challenges in your ideal version?',
          'How do you express your emotions honestly and healthily with those you love?',
        ],
        purpose: [
          'Why is emotional health a priority for you?',
          'How does your emotional health affect your decisions and relationships?',
        ],
        strategy: [
          'What daily practices will build your emotional health?',
          'How will you deal with negative emotions when they arise?',
          'What boundaries will you set to protect your emotional energy?',
          'Will you seek professional help? When?',
        ],
      },
    },
  },
  {
    id: 'character',
    emoji: '🌟',
    color: '#c9a84c',
    ar: { title: 'الشخصية والقيم', subtitle: 'من أنت في الأوقات الصعبة — هذا هو شخصيتك الحقيقية' },
    en: { title: 'Character', subtitle: 'Who you are in hard times — that is your true character' },
    questions: {
      ar: {
        beliefs: [
          'ما القيم التي تؤمن بها عميقاً؟ ما الذي لن تتنازل عنه أبداً؟',
          'هل تتصرف دائماً وفق قيمك حتى حين لا يراك أحد؟',
          'ما الصفات التي تريد أن يصفك بها من يعرفونك بعد وفاتك؟',
        ],
        vision: [
          'صف شخصيتك المثالية بالتفصيل — الصدق، الشجاعة، الكرم...',
          'كيف تتصرف في المواقف الصعبة والاختبارات؟',
          'ما الإرث الشخصي الذي تريد تركه للعالم؟',
        ],
        purpose: [
          'لماذا بناء الشخصية القوية مهم لك شخصياً؟',
          'كيف تؤثر شخصيتك على من حولك وعلى مجتمعك؟',
        ],
        strategy: [
          'ما العادات اليومية التي تبني شخصيتك وقيمك؟',
          'ما الموقف الصعب الذي ستواجهه بشجاعة هذا الشهر؟',
          'ما الشخصيات التي ستنمذجها في بناء شخصيتك؟',
          'كيف ستُحاسب نفسك على الالتزام بقيمك؟',
        ],
      },
      en: {
        beliefs: [
          'What values do you deeply believe in? What will you never compromise on?',
          'Do you always act according to your values even when no one is watching?',
          'What qualities do you want those who know you to describe you with after your death?',
        ],
        vision: [
          'Describe your ideal character in detail — honesty, courage, generosity...',
          'How do you behave in difficult situations and tests?',
          'What personal legacy do you want to leave for the world?',
        ],
        purpose: [
          'Why is building strong character important to you personally?',
          'How does your character affect those around you and your community?',
        ],
        strategy: [
          'What daily habits build your character and values?',
          'What difficult situation will you face courageously this month?',
          'What characters will you model in building yours?',
          'How will you hold yourself accountable to living your values?',
        ],
      },
    },
  },
  {
    id: 'spiritual',
    emoji: '✨',
    color: '#9b59b6',
    ar: { title: 'الحياة الروحية', subtitle: 'اتصالك بشيء أكبر منك يمنحك معنى لا ينتهي' },
    en: { title: 'Spiritual Life', subtitle: 'Connection to something greater gives you endless meaning' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن الروحانية والغرض الأعلى؟',
          'هل تشعر بالاتصال بشيء أكبر منك؟ كيف؟',
          'ما دور الإيمان والشكر في حياتك؟',
        ],
        vision: [
          'كيف تبدو حياتك الروحية المثالية؟ ما الممارسات اليومية؟',
          'كيف تتصل بغرضك الأعلى وإحساسك بالمعنى؟',
          'كيف تخدم شيئاً أكبر من نفسك؟',
        ],
        purpose: [
          'لماذا الحياة الروحية مهمة لك شخصياً؟',
          'ما الذي يمنحك معنى عميقاً وإحساساً بالغرض؟',
        ],
        strategy: [
          'ما الممارسات الروحية اليومية التي ستلتزم بها؟',
          'كم وقتاً ستخصص للتأمل والتفكر والامتنان يومياً؟',
          'ما الكتب أو المعلمين الروحيين الذين ستتعلم منهم؟',
          'كيف ستخدم الآخرين كتعبير عن روحانيتك؟',
        ],
      },
      en: {
        beliefs: [
          'What are your beliefs about spirituality and higher purpose?',
          'Do you feel connected to something greater than yourself? How?',
          'What role do faith and gratitude play in your life?',
        ],
        vision: [
          'What does your ideal spiritual life look like? What are the daily practices?',
          'How do you connect with your higher purpose and sense of meaning?',
          'How do you serve something greater than yourself?',
        ],
        purpose: [
          'Why is spiritual life personally important to you?',
          'What gives you deep meaning and a sense of purpose?',
        ],
        strategy: [
          'What daily spiritual practices will you commit to?',
          'How much time will you dedicate to meditation, reflection, and gratitude daily?',
          'What spiritual books or teachers will you learn from?',
          'How will you serve others as an expression of your spirituality?',
        ],
      },
    },
  },
  {
    id: 'love',
    emoji: '💑',
    color: '#e91e8c',
    ar: { title: 'علاقة الحب', subtitle: 'الحب العميق هو أعظم تجربة إنسانية' },
    en: { title: 'Love Relationship', subtitle: 'Deep love is the greatest human experience' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن الحب والعلاقات؟ هل تستحق حباً عميقاً وحقيقياً؟',
          'ما الأنماط القديمة في علاقاتك التي تحتاج لتغييرها؟',
          'ما الذي تؤمن أن علاقة الحب المثالية تبدو عليه؟',
        ],
        vision: [
          'صف علاقة حبك المثالية بالتفصيل — التواصل، الاحترام، الشغف، النمو المشترك',
          'كيف تعامل شريك حياتك؟ كيف يعاملك؟',
          'ما التقاليد والطقوس التي تبنيان بها علاقتكما؟',
          'كيف تنمو معاً وكيف تدعمان أحلام كل منكما؟',
        ],
        purpose: [
          'لماذا علاقة الحب العميقة أولوية قصوى لك؟',
          'كيف تؤثر جودة علاقتك على كل جوانب حياتك الأخرى؟',
        ],
        strategy: [
          'ما الأفعال اليومية التي ستعمق علاقتك بشريكك؟',
          'ما الحدود الصحية التي ستضعها في علاقتك؟',
          'كيف ستتعامل مع الخلافات والأزمات بطريقة تقوّي العلاقة؟',
          'ما التقاليد الأسبوعية/الشهرية التي ستبنيها معاً؟',
        ],
      },
      en: {
        beliefs: [
          'What do you believe about love and relationships? Do you deserve deep and true love?',
          'What old patterns in your relationships need to change?',
          'What do you believe an ideal love relationship looks like?',
        ],
        vision: [
          'Describe your ideal love relationship in detail — communication, respect, passion, shared growth',
          'How do you treat your life partner? How do they treat you?',
          'What traditions and rituals do you build your relationship with?',
          'How do you grow together and support each other\'s dreams?',
        ],
        purpose: [
          'Why is a deep love relationship your highest priority?',
          'How does the quality of your relationship affect every other area of your life?',
        ],
        strategy: [
          'What daily actions will deepen your relationship with your partner?',
          'What healthy boundaries will you set in your relationship?',
          'How will you handle disagreements and crises in a way that strengthens the relationship?',
          'What weekly/monthly traditions will you build together?',
        ],
      },
    },
  },
  {
    id: 'parenting',
    emoji: '👨‍👩‍👧‍👦',
    color: '#f39c12',
    ar: { title: 'التربية والأبوة', subtitle: 'أطفالك يتعلمون من من أنت أكثر مما تقوله' },
    en: { title: 'Parenting', subtitle: 'Your children learn from who you are more than what you say' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن دورك كوالد/والدة؟',
          'ما الأنماط التي أخذتها من والديك وتريد الإبقاء عليها أو تغييرها؟',
          'ما الذي تؤمن أن الطفل يحتاجه ليكبر سعيداً وناجحاً؟',
        ],
        vision: [
          'صف علاقتك المثالية مع أطفالك — الاتصال، الحدود، المرح، التعلم',
          'ما القيم والمهارات التي تريد غرسها فيهم؟',
          'كيف يتذكرونك عندما يكبرون؟ ما الإرث العاطفي الذي تتركه لهم؟',
        ],
        purpose: [
          'لماذا التربية الاستثنائية أولوية كبرى لك؟',
          'كيف تؤثر جودة تربيتك على مستقبل أطفالك وعلى العالم؟',
        ],
        strategy: [
          'ما التقاليد الأسرية التي ستبنيها؟ العشاء الأسبوعي، الرحلات...',
          'كيف ستوازن بين الانضباط والحرية والمحبة غير المشروطة؟',
          'ما وقت الاتصال الحقيقي (بدون هاتف) الذي ستخصصه يومياً؟',
          'ما الكتب عن التربية التي ستقرأها لتطوير نفسك؟',
        ],
      },
      en: {
        beliefs: [
          'What do you believe about your role as a parent?',
          'What patterns did you take from your parents that you want to keep or change?',
          'What do you believe a child needs to grow up happy and successful?',
        ],
        vision: [
          'Describe your ideal relationship with your children — connection, boundaries, fun, learning',
          'What values and skills do you want to instill in them?',
          'How do they remember you when they grow up? What emotional legacy do you leave them?',
        ],
        purpose: [
          'Why is exceptional parenting a top priority for you?',
          'How does the quality of your parenting affect your children\'s future and the world?',
        ],
        strategy: [
          'What family traditions will you build? Weekly dinners, trips...',
          'How will you balance discipline, freedom, and unconditional love?',
          'What real connection time (no phone) will you dedicate daily?',
          'What parenting books will you read to develop yourself?',
        ],
      },
    },
  },
  {
    id: 'social',
    emoji: '🤝',
    color: '#1abc9c',
    ar: { title: 'الحياة الاجتماعية', subtitle: 'أنت متوسط الخمسة الأشخاص الأقرب إليك' },
    en: { title: 'Social Life', subtitle: 'You are the average of the 5 people closest to you' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن الصداقة والمجتمع؟ هل تستحق صداقات عميقة حقيقية؟',
          'هل تؤمن أن العلاقات الاجتماعية تستحق الاستثمار؟',
          'من هم الأشخاص الذين يؤثرون فيك إيجاباً وسلباً؟',
        ],
        vision: [
          'صف دائرتك الاجتماعية المثالية — أصدقاء، مرشدون، مجتمع',
          'ما نوع الصداقات التي تريدها؟ كيف تقضي الوقت معهم؟',
          'كيف تساهم في مجتمعك وتُضيف قيمة لمن حولك؟',
        ],
        purpose: [
          'لماذا الحياة الاجتماعية الغنية مهمة لك؟',
          'كيف تؤثر علاقاتك الاجتماعية على سعادتك ونجاحك؟',
        ],
        strategy: [
          'من هم الـ 5 أشخاص الذين ستقوّي علاقتك بهم هذا العام؟',
          'ما المجتمعات أو المجموعات التي ستنضم إليها؟',
          'كيف ستتخلص من العلاقات السامة بلطف وحزم؟',
          'ما التقاليد الاجتماعية الأسبوعية/الشهرية التي ستلتزم بها؟',
        ],
      },
      en: {
        beliefs: [
          'What do you believe about friendship and community? Do you deserve deep, genuine friendships?',
          'Do you believe social relationships are worth investing in?',
          'Who are the people who positively and negatively influence you?',
        ],
        vision: [
          'Describe your ideal social circle — friends, mentors, community',
          'What kind of friendships do you want? How do you spend time with them?',
          'How do you contribute to your community and add value to those around you?',
        ],
        purpose: [
          'Why is a rich social life important to you?',
          'How do your social relationships affect your happiness and success?',
        ],
        strategy: [
          'Who are the 5 people whose relationship you will strengthen this year?',
          'What communities or groups will you join?',
          'How will you release toxic relationships with kindness and firmness?',
          'What weekly/monthly social traditions will you commit to?',
        ],
      },
    },
  },
  {
    id: 'financial',
    emoji: '💰',
    color: '#27ae60',
    ar: { title: 'الحياة المالية', subtitle: 'المال أداة لحرية الاختيار — ليس غاية بحد ذاتها' },
    en: { title: 'Financial Life', subtitle: 'Money is a tool for freedom of choice — not an end in itself' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن المال والثروة؟ هل المال سيء أم جيد؟',
          'ما الأفكار التي تعيق وفرتك المالية؟',
          'هل تؤمن أنك تستحق الثروة والوفرة؟ لماذا أو لماذا لا؟',
        ],
        vision: [
          'صف حياتك المالية المثالية بالتفصيل — الدخل، المدخرات، الاستثمارات، الحرية',
          'ما صافي ثروتك في 5 سنوات؟ في 10 سنوات؟',
          'كيف تستخدم ثروتك لتعظيم أثرك في العالم؟',
          'ما الحرية المالية التي تبنيها وكيف تبدو حياتك عند تحقيقها؟',
        ],
        purpose: [
          'لماذا الحرية المالية مهمة لك؟ ماذا ستفعل بها؟',
          'كيف ستغير ثروتك حياة من تحب ومجتمعك؟',
        ],
        strategy: [
          'ما دخلك الحالي وما الهدف في 12 شهراً؟ كيف ستحققه؟',
          'ما نسبة الادخار والاستثمار التي ستلتزم بها شهرياً؟',
          'ما المهارات المالية التي ستتعلمها هذا العام؟',
          'ما الاستثمارات التي ستبدأ بها في الـ 90 يوماً القادمة؟',
        ],
      },
      en: {
        beliefs: [
          'What do you believe about money and wealth? Is money bad or good?',
          'What ideas hinder your financial abundance?',
          'Do you believe you deserve wealth and abundance? Why or why not?',
        ],
        vision: [
          'Describe your ideal financial life in detail — income, savings, investments, freedom',
          'What is your net worth in 5 years? In 10 years?',
          'How do you use your wealth to maximize your impact on the world?',
          'What financial freedom are you building and what does your life look like when you achieve it?',
        ],
        purpose: [
          'Why is financial freedom important to you? What will you do with it?',
          'How will your wealth change the lives of those you love and your community?',
        ],
        strategy: [
          'What is your current income and what is the goal in 12 months? How will you achieve it?',
          'What percentage of savings and investment will you commit to monthly?',
          'What financial skills will you learn this year?',
          'What investments will you start in the next 90 days?',
        ],
      },
    },
  },
  {
    id: 'career',
    emoji: '🚀',
    color: '#e67e22',
    ar: { title: 'المهنة والعمل', subtitle: 'عملك يجب أن يكون تعبيراً عن هويتك وقيمك' },
    en: { title: 'Career', subtitle: 'Your work should be an expression of your identity and values' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن العمل والنجاح المهني؟ هل تستحق عملاً تحبه؟',
          'هل تؤمن أن العمل يمكن أن يكون شغفاً وليس مجرد واجب؟',
          'ما القيود التي تؤمن بها عن قدراتك المهنية؟',
        ],
        vision: [
          'صف مسيرتك المهنية المثالية — ماذا تفعل؟ مع من؟ كيف تؤثر؟',
          'ما إنجازاتك المهنية في 5-10 سنوات؟',
          'كيف يؤدي عملك إلى خدمة الآخرين وترك أثر؟',
          'ما الاعتراف والتأثير الذي تريده في مجالك؟',
        ],
        purpose: [
          'لماذا عملك مهم؟ كيف يخدم الآخرين ويُضيف قيمة للعالم؟',
          'ما الشعور الذي تريد أن تحمله عن عملك كل يوم؟',
        ],
        strategy: [
          'ما المهارات التي ستطورها لتصل لمستوى احترافي أعلى؟',
          'ما العلاقات المهنية التي ستبنيها هذا العام؟',
          'ما الخطوات الثلاث الفورية لتقريبك من عملك المثالي؟',
          'كيف ستوازن بين النمو المهني والحياة الشخصية؟',
        ],
      },
      en: {
        beliefs: [
          'What do you believe about work and professional success? Do you deserve work you love?',
          'Do you believe work can be a passion and not just a duty?',
          'What limitations do you believe about your professional capabilities?',
        ],
        vision: [
          'Describe your ideal career — what do you do? With whom? How do you make an impact?',
          'What are your professional achievements in 5-10 years?',
          'How does your work lead to serving others and leaving a legacy?',
          'What recognition and influence do you want in your field?',
        ],
        purpose: [
          'Why is your work important? How does it serve others and add value to the world?',
          'What feeling do you want to carry about your work every day?',
        ],
        strategy: [
          'What skills will you develop to reach a higher professional level?',
          'What professional relationships will you build this year?',
          'What are the 3 immediate steps to bring you closer to your ideal work?',
          'How will you balance professional growth and personal life?',
        ],
      },
    },
  },
  {
    id: 'quality',
    emoji: '🌈',
    color: '#16a085',
    ar: { title: 'جودة الحياة', subtitle: 'لحظات السعادة لا تحدث بالصدفة — هي نتيجة اختيارات واعية' },
    en: { title: 'Quality of Life', subtitle: 'Moments of happiness don\'t happen by chance — they result from conscious choices' },
    questions: {
      ar: {
        beliefs: [
          'ما معتقداتك عن الاستمتاع بالحياة؟ هل تستحق المتعة والفرح؟',
          'هل تؤمن أنك بحاجة لكسب الراحة والمتعة أولاً؟',
          'ما الذي يعيق تمتعك الكامل بالحياة الآن؟',
        ],
        vision: [
          'صف بيئتك المثالية — منزلك، مدينتك، طبيعة حياتك اليومية',
          'ما الهوايات والمغامرات والتجارب التي تملأ حياتك؟',
          'ما السفر والاستكشاف الذي تفعله في حياتك المثالية؟',
          'كيف تبدو "يوم مثالي" في حياتك؟ صفه بالتفصيل',
        ],
        purpose: [
          'لماذا جودة الحياة العالية أولوية وليست ترفاً؟',
          'كيف تؤثر جودة حياتك على إبداعك وإنتاجيتك وعلاقاتك؟',
        ],
        strategy: [
          'ما المغامرة أو التجربة التي ستعيشها خلال الـ 90 يوماً القادمة؟',
          'كيف ستُدخل لحظات بهجة وجمال في يومك بشكل منتظم؟',
          'ما التغييرات في بيئتك التي ستجريها لترفع جودة حياتك؟',
          'ما السفر الذي ستخطط له هذا العام؟',
        ],
      },
      en: {
        beliefs: [
          'What do you believe about enjoying life? Do you deserve pleasure and joy?',
          'Do you believe you need to earn rest and pleasure first?',
          'What prevents you from fully enjoying life now?',
        ],
        vision: [
          'Describe your ideal environment — your home, city, daily life',
          'What hobbies, adventures, and experiences fill your life?',
          'What travel and exploration do you do in your ideal life?',
          'What does an "ideal day" in your life look like? Describe it in detail',
        ],
        purpose: [
          'Why is high quality of life a priority and not a luxury?',
          'How does the quality of your life affect your creativity, productivity, and relationships?',
        ],
        strategy: [
          'What adventure or experience will you live in the next 90 days?',
          'How will you regularly bring moments of joy and beauty into your day?',
          'What environmental changes will you make to raise your quality of life?',
          'What travel will you plan this year?',
        ],
      },
    },
  },
  {
    id: 'lifeVision',
    emoji: '🔭',
    color: '#8e44ad',
    ar: { title: 'رؤية الحياة', subtitle: 'رؤيتك الكبرى للحياة هي البوصلة التي توجّه كل قراراتك' },
    en: { title: 'Life Vision', subtitle: 'Your grand life vision is the compass that guides every decision' },
    questions: {
      ar: {
        beliefs: [
          'هل تؤمن أنك خُلقت لغرض عظيم؟ ما هو هذا الغرض؟',
          'ما المعتقدات الأساسية التي تشكّل نظرتك للحياة والعالم؟',
          'هل تؤمن أن حياة استثنائية ممكنة بالنسبة لك؟ لماذا؟',
        ],
        vision: [
          'صف رؤيتك الكاملة لحياتك — كيف تبدو حياتك المثالية في كل فئة؟',
          'ما الإرث الذي تريد تركه؟ بماذا تريد أن يُذكر اسمك؟',
          'ما الأثر الذي تريد إحداثه في حياة الآخرين وفي العالم؟',
          'ما الشعور الذي تريد حمله معك في اللحظات الأخيرة من حياتك؟',
        ],
        purpose: [
          'ما هو غرضك الأعلى وسبب وجودك؟',
          'كيف تربط كل فئات الحياة الـ 12 برؤيتك الكبرى؟',
        ],
        strategy: [
          'ما أهم 3 قرارات يجب أن تتخذها الآن لتبدأ العيش برؤيتك؟',
          'كيف ستراجع وتحدّث رؤيتك كل عام؟',
          'من هم الأشخاص الذين ستشارك رؤيتك معهم ليُحاسبوك عليها؟',
          'ما الخطوة الواحدة التي ستبدأ بها اليوم؟',
        ],
      },
      en: {
        beliefs: [
          'Do you believe you were created for a great purpose? What is that purpose?',
          'What core beliefs shape your view of life and the world?',
          'Do you believe an exceptional life is possible for you? Why?',
        ],
        vision: [
          'Describe your complete life vision — what does your ideal life look like in every category?',
          'What legacy do you want to leave? How do you want your name to be remembered?',
          'What impact do you want to make in others\' lives and in the world?',
          'What feeling do you want to carry with you in the last moments of your life?',
        ],
        purpose: [
          'What is your highest purpose and reason for being?',
          'How do you connect all 12 life categories to your grand vision?',
        ],
        strategy: [
          'What are the 3 most important decisions you must make now to start living your vision?',
          'How will you review and update your vision each year?',
          'Who are the people you will share your vision with to hold you accountable?',
          'What is the one step you will start with today?',
        ],
      },
    },
  },
]

const SECTION_META = {
  ar: [
    { id: 'beliefs', label: '🧩 معتقداتي', desc: 'ما الذي تؤمن به في هذا المجال؟' },
    { id: 'vision',   label: '🎯 رؤيتي',    desc: 'صف حياتك المثالية في هذا المجال بوضوح تام' },
    { id: 'purpose',  label: '🔥 سببي',     desc: 'لماذا هذا مهم لك؟ ما الذي يحفزك؟' },
    { id: 'strategy', label: '🗺️ استراتيجيتي', desc: 'كيف ستحقق رؤيتك؟ خطوات ملموسة' },
  ],
  en: [
    { id: 'beliefs', label: '🧩 Beliefs',  desc: 'What do you believe about this area?' },
    { id: 'vision',  label: '🎯 Vision',   desc: 'Describe your ideal life in this area with total clarity' },
    { id: 'purpose', label: '🔥 Purpose',  desc: 'Why does this matter to you? What drives you?' },
    { id: 'strategy',label: '🗺️ Strategy', desc: 'How will you achieve your vision? Concrete steps' },
  ],
}

/* ─── COMPONENT ─────────────────────────────────────────────────────── */
export default function Lifebook() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const lb = state.lifebook || {}
  const [activeCat, setActiveCat] = useState('health')
  const [openSection, setOpenSection] = useState('beliefs')

  const cat = CATEGORIES.find(c => c.id === activeCat)
  const catData = lb[activeCat] || {}
  const sections = SECTION_META[lang]

  // count how many categories have all 4 sections filled
  const completedCount = CATEGORIES.filter(c => {
    const d = lb[c.id] || {}
    return ['beliefs','vision','purpose','strategy'].every(s => (d[s] || '').trim().length > 30)
  }).length

  const saveField = (catId, section, value) => {
    const current = lb[catId] || {}
    update('lifebook', { ...lb, [catId]: { ...current, [section]: value } })
  }

  const markDone = (catId) => {
    const current = lb[catId] || {}
    update('lifebook', { ...lb, [catId]: { ...current, done: !current.done } })
  }

  const progressPct = Math.round((completedCount / 12) * 100)

  return (
    <Layout title={isAr ? '📖 كتابي الحياتي' : '📖 My Lifebook'} subtitle={isAr ? 'الكورس الذي يغير كل شيء — Lifebook' : 'The course that changes everything — Lifebook'} helpKey="lifebook">
      <div className="space-y-4 pt-2 pb-24">

        {/* Overall progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">
              {isAr ? `اكتملت ${completedCount} من 12 فئة` : `${completedCount} of 12 categories complete`}
            </span>
            <span className="text-xs font-black" style={{ color: '#c9a84c' }}>{progressPct}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          {completedCount === 12 && (
            <p className="text-xs text-center mt-2 font-bold" style={{ color: '#2ecc71' }}>
              🏆 {isAr ? 'كتابك الحياتي مكتمل! أنت استثنائي.' : 'Your Lifebook is complete! You are exceptional.'}
            </p>
          )}
        </div>

        {/* Category selector — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => {
            const d = lb[c.id] || {}
            const filled = ['beliefs','vision','purpose','strategy'].every(s => (d[s] || '').trim().length > 30)
            const active = activeCat === c.id
            return (
              <button
                key={c.id}
                onClick={() => { setActiveCat(c.id); setOpenSection('beliefs') }}
                className="flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all"
                style={{
                  background: active ? `${c.color}22` : '#111',
                  border: `1px solid ${active ? c.color + '88' : '#1e1e1e'}`,
                  minWidth: 64,
                }}
              >
                <span className="text-lg">{filled ? '✅' : c.emoji}</span>
                <span className="text-center leading-tight font-bold"
                  style={{ color: active ? c.color : '#555', fontSize: 9 }}>
                  {isAr ? c.ar.title.split(' ')[0] : c.en.title.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active category header */}
        <div className="rounded-2xl p-4" style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}33` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <h2 className="font-black text-white text-base">{isAr ? cat.ar.title : cat.en.title}</h2>
                <p className="text-xs mt-0.5" style={{ color: cat.color }}>
                  {isAr ? cat.ar.subtitle : cat.en.subtitle}
                </p>
              </div>
            </div>
            <button onClick={() => markDone(activeCat)} className="flex-shrink-0 ml-2">
              {(catData.done) ? (
                <CheckCircle size={24} style={{ color: '#2ecc71' }} />
              ) : (
                <Circle size={24} style={{ color: '#333' }} />
              )}
            </button>
          </div>
        </div>

        {/* 4 Sections — accordion */}
        {sections.map(sec => {
          const isOpen = openSection === sec.id
          const questions = cat.questions[lang][sec.id] || []
          const value = catData[sec.id] || ''
          const wordCount = value.trim().split(/\s+/).filter(Boolean).length

          return (
            <div key={sec.id} className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${isOpen ? cat.color + '44' : '#1e1e1e'}` }}>
              {/* Section header */}
              <button
                className="w-full flex items-center justify-between p-4"
                style={{ background: isOpen ? `${cat.color}10` : '#111' }}
                onClick={() => setOpenSection(isOpen ? null : sec.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">{sec.label}</span>
                  {value.trim().length > 30 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: '#2ecc7122', color: '#2ecc71' }}>✓</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {value.trim().length > 0 && (
                    <span className="text-xs" style={{ color: '#555' }}>{wordCount} {isAr ? 'كلمة' : 'words'}</span>
                  )}
                  {isOpen
                    ? <ChevronUp size={16} style={{ color: cat.color }} />
                    : <ChevronDown size={16} style={{ color: '#555' }} />}
                </div>
              </button>

              {/* Section content */}
              {isOpen && (
                <div className="p-4 space-y-3" style={{ background: '#0d0d0d' }}>
                  <p className="text-xs" style={{ color: '#666' }}>{sec.desc}</p>

                  {/* Guiding questions */}
                  <div className="rounded-xl p-3 space-y-2" style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}22` }}>
                    <p className="text-xs font-bold" style={{ color: cat.color }}>
                      💡 {isAr ? 'أسئلة مرشدة:' : 'Guiding questions:'}
                    </p>
                    {questions.map((q, i) => (
                      <p key={i} className="text-xs leading-relaxed" style={{ color: '#999' }}>
                        {i + 1}. {q}
                      </p>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={value}
                    onChange={e => saveField(activeCat, sec.id, e.target.value)}
                    placeholder={isAr ? 'اكتب هنا بحرية وبتفصيل كامل...' : 'Write here freely and in full detail...'}
                    rows={7}
                    className="input-dark resize-none text-sm w-full leading-relaxed"
                    dir={isAr ? 'rtl' : 'ltr'}
                  />

                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: '#444' }}>
                      {wordCount} {isAr ? 'كلمة' : 'words'}
                    </span>
                    {value.trim().length > 30 ? (
                      <span className="text-xs font-bold" style={{ color: '#2ecc71' }}>
                        ✅ {isAr ? 'مكتمل' : 'Complete'}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: '#444' }}>
                        {isAr ? `${Math.max(0, 30 - wordCount)} كلمة للإكمال` : `${Math.max(0, 30 - wordCount)} more words to complete`}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Navigation between categories */}
        <div className="flex gap-3">
          {CATEGORIES.findIndex(c => c.id === activeCat) > 0 && (
            <button
              onClick={() => {
                const idx = CATEGORIES.findIndex(c => c.id === activeCat)
                setActiveCat(CATEGORIES[idx - 1].id)
                setOpenSection('beliefs')
              }}
              className="flex-1 py-3 rounded-2xl text-sm font-bold"
              style={{ background: '#1a1a1a', color: '#888', border: '1px solid #222' }}
            >
              {isAr ? '→ الفئة السابقة' : '← Previous'}
            </button>
          )}
          {CATEGORIES.findIndex(c => c.id === activeCat) < CATEGORIES.length - 1 && (
            <button
              onClick={() => {
                const idx = CATEGORIES.findIndex(c => c.id === activeCat)
                setActiveCat(CATEGORIES[idx + 1].id)
                setOpenSection('beliefs')
              }}
              className="flex-1 py-3 rounded-2xl text-sm font-bold"
              style={{ background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }}
            >
              {isAr ? '← الفئة التالية' : 'Next →'}
            </button>
          )}
        </div>

      </div>
    </Layout>
  )
}
