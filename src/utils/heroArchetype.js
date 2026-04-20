/**
 * 12 Jungian Hero Archetypes
 * TR10 — Identity made tangible through archetypal narrative
 */

export const ARCHETYPES = [
  {
    id: 'warrior',
    emoji: '⚔️',
    nameAr: 'المحارب', nameEn: 'The Warrior',
    essenceAr: 'الشجاعة، الانضباط، الحماية', essenceEn: 'Courage, discipline, protection',
    motivationAr: 'إثبات القيمة عبر أفعال شجاعة', motivationEn: 'Prove worth through courageous action',
    shadowAr: 'العدوانية، القسوة، الحاجة للفوز دائماً', shadowEn: 'Aggression, ruthlessness, need to always win',
    questionAr: 'ماذا يفعل المحارب بداخلك الآن؟', questionEn: 'What would the Warrior in you do right now?',
  },
  {
    id: 'sage',
    emoji: '🦉',
    nameAr: 'الحكيم', nameEn: 'The Sage',
    essenceAr: 'الحقيقة، الفهم، الحكمة', essenceEn: 'Truth, understanding, wisdom',
    motivationAr: 'فهم العالم بعمق', motivationEn: 'Understand the world deeply',
    shadowAr: 'البرودة، الانعزال، الحكم على الآخرين', shadowEn: 'Coldness, isolation, judgment',
    questionAr: 'ما الحقيقة التي تتجنب مواجهتها؟', questionEn: 'What truth are you avoiding?',
  },
  {
    id: 'creator',
    emoji: '🎨',
    nameAr: 'المبدع', nameEn: 'The Creator',
    essenceAr: 'التعبير، الابتكار، الجمال', essenceEn: 'Expression, innovation, beauty',
    motivationAr: 'صنع شيء ذي معنى ودائم', motivationEn: 'Create something meaningful and lasting',
    shadowAr: 'الكمالية، الإرهاق الإبداعي', shadowEn: 'Perfectionism, creative burnout',
    questionAr: 'ماذا تريد أن تخلق قبل أن تموت؟', questionEn: 'What do you want to create before you die?',
  },
  {
    id: 'lover',
    emoji: '💝',
    nameAr: 'العاشق', nameEn: 'The Lover',
    essenceAr: 'الاتصال، الحميمية، العاطفة', essenceEn: 'Connection, intimacy, passion',
    motivationAr: 'عيش الحب والتواصل العميق', motivationEn: 'Live love and deep connection',
    shadowAr: 'الحاجة للإعجاب، فقدان الذات في الآخر', shadowEn: 'Neediness, losing self in others',
    questionAr: 'من يحتاج منك حبّاً عميقاً اليوم؟', questionEn: 'Who needs your deep love today?',
  },
  {
    id: 'ruler',
    emoji: '👑',
    nameAr: 'الحاكم', nameEn: 'The Ruler',
    essenceAr: 'القيادة، النظام، المسؤولية', essenceEn: 'Leadership, order, responsibility',
    motivationAr: 'خلق بيئة ناجحة ومنتجة', motivationEn: 'Create successful, productive environment',
    shadowAr: 'السيطرة، الصلابة، التسلط', shadowEn: 'Control, rigidity, tyranny',
    questionAr: 'أين تحتاج أن تقود أكثر؟', questionEn: 'Where do you need to lead more?',
  },
  {
    id: 'magician',
    emoji: '✨',
    nameAr: 'الساحر', nameEn: 'The Magician',
    essenceAr: 'التحوّل، القوى الخفية، الوعي', essenceEn: 'Transformation, hidden powers, awareness',
    motivationAr: 'تحويل المستحيل إلى ممكن', motivationEn: 'Turn the impossible into possible',
    shadowAr: 'التلاعب، الذاتية، الخداع', shadowEn: 'Manipulation, narcissism, deception',
    questionAr: 'أي سحر كامن بداخلك لم تستخدمه بعد؟', questionEn: 'What hidden magic in you remains unused?',
  },
  {
    id: 'innocent',
    emoji: '🌸',
    nameAr: 'البريء', nameEn: 'The Innocent',
    essenceAr: 'الأمل، التفاؤل، الإيمان', essenceEn: 'Hope, optimism, faith',
    motivationAr: 'العيش في سعادة صافية', motivationEn: 'Live in pure happiness',
    shadowAr: 'الإنكار، السذاجة، الخوف من الظلام', shadowEn: 'Denial, naivety, fear of darkness',
    questionAr: 'ما الخير الذي تستطيع رؤيته الآن؟', questionEn: 'What good can you see right now?',
  },
  {
    id: 'explorer',
    emoji: '🧭',
    nameAr: 'المستكشف', nameEn: 'The Explorer',
    essenceAr: 'الحرية، الاكتشاف، الاستقلال', essenceEn: 'Freedom, discovery, independence',
    motivationAr: 'اكتشاف الذات والعالم', motivationEn: 'Discover self and world',
    shadowAr: 'الهروب، عدم الالتزام، الاغتراب', shadowEn: 'Escapism, non-commitment, alienation',
    questionAr: 'أين تحتاج أن تغامر؟', questionEn: 'Where do you need to venture?',
  },
  {
    id: 'hero',
    emoji: '🦸',
    nameAr: 'البطل', nameEn: 'The Hero',
    essenceAr: 'الشجاعة، التضحية، النصر', essenceEn: 'Courage, sacrifice, victory',
    motivationAr: 'إثبات القيمة عبر التحدي والنصر', motivationEn: 'Prove worth through challenge and victory',
    shadowAr: 'الغطرسة، الحاجة للإثبات المستمر', shadowEn: 'Arrogance, constant need to prove',
    questionAr: 'ما التنين الذي عليك مواجهته؟', questionEn: 'What dragon must you face?',
  },
  {
    id: 'caregiver',
    emoji: '🤲',
    nameAr: 'الراعي', nameEn: 'The Caregiver',
    essenceAr: 'العطاء، الرحمة، حماية الآخرين', essenceEn: 'Giving, compassion, protecting others',
    motivationAr: 'مساعدة الآخرين والعناية بهم', motivationEn: 'Help and care for others',
    shadowAr: 'الشهيد، الإنهاك، فقدان الذات', shadowEn: 'Martyrdom, burnout, self-loss',
    questionAr: 'هل ترعى نفسك بنفس القوة التي ترعى بها الآخرين؟', questionEn: 'Do you care for yourself as fiercely as others?',
  },
  {
    id: 'jester',
    emoji: '🎭',
    nameAr: 'المرح', nameEn: 'The Jester',
    essenceAr: 'المرح، البهجة، العيش للحظة', essenceEn: 'Fun, joy, living for the moment',
    motivationAr: 'الاستمتاع وإدخال البهجة', motivationEn: 'Enjoy and bring joy',
    shadowAr: 'التفاهة، الهروب، إيذاء الآخرين بالسخرية', shadowEn: 'Frivolity, escapism, hurting others via mockery',
    questionAr: 'أين فقدت روح المرح؟', questionEn: 'Where have you lost your joy?',
  },
  {
    id: 'everyman',
    emoji: '🤝',
    nameAr: 'الإنسان العادي', nameEn: 'The Everyman',
    essenceAr: 'الواقعية، الانتماء، التواضع', essenceEn: 'Realism, belonging, humility',
    motivationAr: 'الانتماء للمجتمع والتواصل', motivationEn: 'Belong to community and connect',
    shadowAr: 'فقدان الهوية، الذوبان، الخوف من التميّز', shadowEn: 'Identity loss, conformity, fear of standing out',
    questionAr: 'أين تختبئ خلف "العادية"؟', questionEn: 'Where are you hiding behind ordinariness?',
  },
]

export function getArchetypeById(id) {
  return ARCHETYPES.find(a => a.id === id) || null
}

/**
 * Get rolling alignment avg over last 7 days for the selected archetype.
 */
export function getHeroAlignment(state) {
  const log = state.heroArchetype?.alignmentLog || {}
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })
  const scores = days.map(d => log[d]).filter(v => typeof v === 'number')
  if (scores.length === 0) return null
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round(avg * 10) / 10
}
