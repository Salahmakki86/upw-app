import { useState } from 'react'
import Layout from '../components/Layout'
import { useLang } from '../context/LangContext'

const CONCEPTS_DATA = {
  ar: [
    { category: 'الأساس', emoji: '🏛️', items: [
      { title: 'الثالوث العاطفي', desc: 'جسمك + تركيزك + لغتك = حالتك العاطفية الكاملة. غيّر واحداً وتغير الكل.' },
      { title: 'الحالة الجميلة vs المعاناة', desc: 'كل لحظة أنت في إحدى الحالتين. اختر بوعي أين تضع نفسك.' },
      { title: 'القرارات الثلاثة', desc: 'ما تركز عليه + ما يعنيه لك + ماذا ستفعل = مصيرك كل لحظة.' },
      { title: 'البيت العاطفي', desc: 'حالتك العاطفية الافتراضية. يمكن تغييرها بالوعي والممارسة اليومية.' },
    ]},
    { category: 'الأدوات', emoji: '🔧', items: [
      { title: 'التكرارات الصوتية', desc: 'ليس مجرد كلمات — بل عيشها بكل جسمك وصوتك وعاطفتك.' },
      { title: 'أسئلة القوة', desc: 'أسئلة صباحية ومسائية توجه تركيزك نحو الامتنان والإمكانية.' },
      { title: 'ساعة القوة', desc: 'حركة + تعلم + تخطيط + امتنان = 60 دقيقة تبني يومك الاستثنائي.' },
      { title: 'التحضير الذهني', desc: 'روتين 10-15 دقيقة صباحياً: تنفس → امتنان → شفاء → تخيل.' },
    ]},
    { category: 'التحول', emoji: '⚡', items: [
      { title: 'عملية ديكنز', desc: 'رحلة عبر الزمن لاستشعار ألم عدم التغيير ومتعة التحول. أقوى تمرين في UPW.' },
      { title: 'التكييف العصبي NAC', desc: 'ارتباط الألم بالقديم والمتعة بالجديد = تغيير دائم في السلوك.' },
      { title: 'قاطع النمط', desc: 'اكسر النمط السلبي بفعل مفاجئ قبل أن يستحكم.' },
      { title: 'نمذجة التميز', desc: 'ابحث عمّن حقق ما تريده وانسخ معتقداته واستراتيجياته.' },
    ]},
    { category: 'الأهداف', emoji: '🎯', items: [
      { title: 'نظام RPM', desc: 'النتيجة (R) + الغرض (P) + خطة العمل (M) = وصفة تحقيق أي هدف.' },
      { title: 'معادلة النجاح المطلق', desc: 'وضوح + سبب + إجراء ضخم + مراقبة + تعديل = النجاح الحتمي.' },
      { title: 'الهدف ضرورة لا رغبة', desc: 'اربط ألماً هائلاً بعدم التحرك ومتعة عظيمة بالوصول.' },
      { title: 'إغلاق الفجوة', desc: 'الفجوة بين الآن وهدفك هي سلسلة خطوات محددة — وليست هوّة.' },
    ]},
    { category: 'الاحتياجات', emoji: '❤️', items: [
      { title: 'اليقين', desc: 'الحاجة للأمان والاستقرار. الإفراط فيه يقتل النمو.' },
      { title: 'التنوع', desc: 'الحاجة للتغيير والمفاجآت والتحديات. بدونه تتجمد.' },
      { title: 'الأهمية', desc: 'الحاجة للشعور بالتميز والقيمة. تشبعه بالإنجاز لا الغرور.' },
      { title: 'الحب والتواصل', desc: 'الحاجة الأعمق. اشبعها بالعطاء قبل الأخذ.' },
      { title: 'النمو', desc: 'روح الإنسان. إذا لم تنمُ فأنت تتراجع — لا يوجد ثبات.' },
      { title: 'المساهمة', desc: 'سر الحياة. العطاء يملأ فراغاً لا يملأه أي شيء آخر.' },
    ]},
    { category: 'مبادئ النجاح', emoji: '🏆', items: [
      { title: 'المبدأ الأول: القوة في القرار', desc: 'كل شيء بدأ بقرار. القرار يغير كيمياء جسمك فوراً.' },
      { title: 'المبدأ الثاني: إدارة قوتك', desc: 'طاقتك أثمن مورد — جسمك، عقلك، وقتك، عواطفك.' },
      { title: 'المبدأ الثالث: الإتقان في العلاقات', desc: 'نجاحك يتناسب طردياً مع جودة علاقاتك.' },
      { title: 'المبدأ الرابع: الصحة هي الثروة', desc: 'بدون جسم قوي كل الثروة لا معنى لها.' },
      { title: 'المبدأ الخامس: إدارة المال', desc: 'لا تعمل من أجل المال — اجعل المال يعمل من أجلك.' },
      { title: 'المبدأ السادس: الوقت هو الحياة', desc: 'لا تدير وقتك — أدر حياتك. الوقت لا يُعاد.' },
      { title: 'المبدأ السابع: العطاء والمساهمة', desc: 'سر الحياة هو العطاء — ما تعطيه يعود إليك مضاعفاً.' },
    ]},
  ],
  en: [
    { category: 'Foundation', emoji: '🏛️', items: [
      { title: 'The Triad', desc: 'Your body + your focus + your language = your complete emotional state. Change one and you change everything.' },
      { title: 'Beautiful State vs. Suffering', desc: 'Every moment you are in one of two states. Choose consciously where you place yourself.' },
      { title: 'Three Decisions', desc: 'What you focus on + what it means + what you do = your destiny every moment.' },
      { title: 'Home Base Emotion', desc: 'Your default emotional state. It can be changed through awareness and daily practice.' },
    ]},
    { category: 'Tools', emoji: '🔧', items: [
      { title: 'Incantations', desc: 'Not just words — live them with your whole body, voice, and emotion.' },
      { title: 'Power Questions', desc: 'Morning and evening questions that direct your focus toward gratitude and possibility.' },
      { title: 'Hour of Power', desc: 'Movement + learning + planning + gratitude = 60 minutes that build your extraordinary day.' },
      { title: 'Priming', desc: '10-15 minute morning routine: breathing → gratitude → healing → visualization.' },
    ]},
    { category: 'Transformation', emoji: '⚡', items: [
      { title: 'Dickens Process', desc: 'A time journey to feel the pain of not changing and the pleasure of transformation. The most powerful UPW exercise.' },
      { title: 'NAC — Neuro-Associative Conditioning', desc: 'Linking pain to the old and pleasure to the new = permanent behavioral change.' },
      { title: 'Pattern Interrupt', desc: 'Break a negative pattern with a surprising action before it takes hold.' },
      { title: 'Modeling Excellence', desc: 'Find someone who achieved what you want and copy their beliefs and strategies.' },
    ]},
    { category: 'Goals', emoji: '🎯', items: [
      { title: 'RPM System', desc: 'Result (R) + Purpose (P) + Massive Action Plan (M) = recipe for achieving any goal.' },
      { title: 'Ultimate Success Formula', desc: 'Clarity + reason + massive action + monitoring + adjustment = inevitable success.' },
      { title: 'Must vs. Want', desc: 'Link enormous pain to not moving and tremendous pleasure to arriving.' },
      { title: 'Closing the Gap', desc: 'The gap between now and your goal is a specific chain of steps — not an abyss.' },
    ]},
    { category: 'Needs', emoji: '❤️', items: [
      { title: 'Certainty', desc: 'The need for safety and stability. Too much of it kills growth.' },
      { title: 'Variety', desc: 'The need for change, surprises, and challenges. Without it you freeze.' },
      { title: 'Significance', desc: 'The need to feel unique and valued. Fill it through achievement, not arrogance.' },
      { title: 'Love & Connection', desc: 'The deepest need. Fill it by giving before taking.' },
      { title: 'Growth', desc: 'The spirit of humanity. If you\'re not growing, you\'re dying — there is no standing still.' },
      { title: 'Contribution', desc: 'The secret to living. Giving fills a void that nothing else can fill.' },
    ]},
    { category: '7 Success Principles', emoji: '🏆', items: [
      { title: 'Principle 1: The Power of Decision', desc: 'Everything begins with a decision. A decision instantly changes the chemistry of your body.' },
      { title: 'Principle 2: Managing Your Power', desc: 'Your energy is your most precious resource — your body, mind, time, and emotions.' },
      { title: 'Principle 3: Mastery in Relationships', desc: 'Your success is directly proportional to the quality of your relationships.' },
      { title: 'Principle 4: Health is Wealth', desc: 'Without a strong body, all wealth is meaningless.' },
      { title: 'Principle 5: Money Management', desc: "Don't work for money — make money work for you." },
      { title: 'Principle 6: Time is Life', desc: "Don't manage your time — manage your life. Time cannot be reclaimed." },
      { title: 'Principle 7: Giving & Contribution', desc: 'The secret to living is giving — what you give returns to you multiplied.' },
    ]},
  ]
}

export default function Library() {
  const { lang, t } = useLang()
  const [openCategory, setOpenCategory] = useState(null)
  const [openItem, setOpenItem] = useState(null)

  const CONCEPTS = CONCEPTS_DATA[lang]

  return (
    <Layout title={t('library_title')} subtitle={t('library_subtitle')} helpKey="library">
      <div className="space-y-3 pt-2">
        {CONCEPTS.map((cat) => (
          <div key={cat.category} className="rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <button
              onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
              className="w-full flex items-center justify-between p-4 text-right"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.emoji}</span>
                <span className="font-bold text-white">{cat.category}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c' }}>
                  {cat.items.length}
                </span>
              </div>
              <span style={{ color: '#555' }}>{openCategory === cat.category ? '▲' : '▼'}</span>
            </button>

            {openCategory === cat.category && (
              <div className="px-4 pb-4 space-y-2 animate-fade-in" style={{ borderTop: '1px solid #222' }}>
                {cat.items.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setOpenItem(openItem === item.title ? null : item.title)}
                    className="w-full text-right rounded-xl p-3 transition-all"
                    style={{
                      background: openItem === item.title ? 'rgba(201,168,76,0.08)' : '#111',
                      border: `1px solid ${openItem === item.title ? 'rgba(201,168,76,0.25)' : '#1e1e1e'}`,
                    }}
                  >
                    <p className="text-sm font-bold" style={{ color: openItem === item.title ? '#c9a84c' : '#ddd' }}>
                      {item.title}
                    </p>
                    {openItem === item.title && (
                      <p className="text-xs mt-2 leading-relaxed animate-fade-in" style={{ color: '#aaa' }}>
                        {item.desc}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Quote */}
        <div className="rounded-2xl p-5 text-center mt-4"
          style={{ background: 'linear-gradient(135deg, #1a1500, #1a1a1a)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-sm font-bold text-white leading-relaxed mb-2">{t('library_quote')}</p>
          <p className="text-xs" style={{ color: '#888' }}>{t('library_quote_author')}</p>
        </div>
      </div>
    </Layout>
  )
}
