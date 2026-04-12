import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import Layout from '../components/Layout'

const HABITS_DATA = {
  ar: [
    { emoji: '💧', label: '3 لترات ماء (+ ليمون)' },
    { emoji: '🥗', label: '70% غذاء غني بالماء' },
    { emoji: '🌿', label: 'مكملات خضراء (سبيرولينا)' },
    { emoji: '🚫', label: 'تجنب السكر والمشروبات الغازية' },
    { emoji: '🏃', label: 'تمارين هوائية 30 دقيقة' },
    { emoji: '💨', label: 'تمرين التنفس 1:4:2 × 3' },
    { emoji: '🥑', label: 'دهون صحية في الوجبات' },
    { emoji: '🚫', label: 'تجنب الأطعمة المصنعة' },
    { emoji: '😴', label: 'نوم 7-8 ساعات' },
    { emoji: '🙏', label: 'الامتنان صباحاً ومساءً' },
  ],
  en: [
    { emoji: '💧', label: '3 liters of water (+ lemon)' },
    { emoji: '🥗', label: '70% water-rich foods' },
    { emoji: '🌿', label: 'Green supplements (spirulina)' },
    { emoji: '🚫', label: 'Avoid sugar & soft drinks' },
    { emoji: '🏃', label: '30-min aerobic exercise' },
    { emoji: '💨', label: '1:4:2 breathing exercise × 3' },
    { emoji: '🥑', label: 'Healthy fats with meals' },
    { emoji: '🚫', label: 'Avoid processed foods' },
    { emoji: '😴', label: '7–8 hours of sleep' },
    { emoji: '🙏', label: 'Gratitude morning & evening' },
  ],
}

const GIFTS_DATA = {
  ar: [
    { emoji: '💨', title: 'التنفس الحيوي',   color: '#3498db', desc: 'تمرين 1:4:2 يضاعف الأكسجين ويصرف السموم' },
    { emoji: '💧', title: 'الماء الحي',       color: '#3498db', desc: '3 لترات يومياً + ليمون طازج' },
    { emoji: '🥑', title: 'الزيوت الصحية',   color: '#2ecc71', desc: 'زيتون، جوز الهند، أوميغا 3' },
    { emoji: '🥦', title: 'القلوية',          color: '#27ae60', desc: '70% غذاء قلوي — أخضر حي' },
    { emoji: '🏃', title: 'الحركة الهوائية', color: '#c9a84c', desc: '6 مرات أسبوعياً × 30 دقيقة' },
    { emoji: '🌾', title: 'التغذية القصوى',  color: '#e67e22', desc: 'أغذية حية وطازجة وغنية بالإنزيمات' },
    { emoji: '🧘', title: 'الاستقامة',        color: '#9b59b6', desc: 'وضعية جسمك تؤثر مباشرة على طاقتك' },
    { emoji: '🧠', title: 'العقل الموجّه',    color: '#c9a84c', desc: 'التأمل والامتنان يوجه طاقتك للشفاء' },
  ],
  en: [
    { emoji: '💨', title: 'Vital Breathing',  color: '#3498db', desc: '1:4:2 exercise doubles oxygen and expels toxins' },
    { emoji: '💧', title: 'Living Water',     color: '#3498db', desc: '3 liters daily + fresh lemon' },
    { emoji: '🥑', title: 'Healthy Oils',    color: '#2ecc71', desc: 'Olive oil, coconut oil, omega-3' },
    { emoji: '🥦', title: 'Alkalinity',      color: '#27ae60', desc: '70% alkaline food — living greens' },
    { emoji: '🏃', title: 'Aerobic Movement',color: '#c9a84c', desc: '6 times a week × 30 minutes' },
    { emoji: '🌾', title: 'Peak Nutrition',  color: '#e67e22', desc: 'Living, fresh, enzyme-rich foods' },
    { emoji: '🧘', title: 'Posture',         color: '#9b59b6', desc: 'Your body posture directly affects your energy' },
    { emoji: '🧠', title: 'Directed Mind',   color: '#c9a84c', desc: 'Meditation & gratitude direct your energy to healing' },
  ],
}

const POISONS_DATA = {
  ar: [
    { emoji: '☠️', title: 'الدهون المصنعة',   color: '#e63946', effect: 'تسد الشرايين — تقتل الطاقة' },
    { emoji: '☠️', title: 'اللحوم الحيوانية', color: '#e63946', effect: '24-72 ساعة للهضم — تستنزف طاقتك' },
    { emoji: '☠️', title: 'منتجات الألبان',   color: '#e67e22', effect: 'تنتج مخاطاً وتسبب التهابات' },
    { emoji: '☠️', title: 'إدمان الأحماض',   color: '#e67e22', effect: 'قهوة مفرطة + سكر + غازيات = خراب' },
  ],
  en: [
    { emoji: '☠️', title: 'Processed Fats',  color: '#e63946', effect: 'Clogs arteries — kills energy' },
    { emoji: '☠️', title: 'Animal Meats',    color: '#e63946', effect: '24–72 hrs to digest — drains your energy' },
    { emoji: '☠️', title: 'Dairy Products',  color: '#e67e22', effect: 'Produces mucus and causes inflammation' },
    { emoji: '☠️', title: 'Acid Addiction',  color: '#e67e22', effect: 'Excess coffee + sugar + soft drinks = damage' },
  ],
}

function HabitDay({ date, habitLog, onToggle, t, habits }) {
  const checked = habitLog || []
  const pct = Math.round((checked.length / habits.length) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">{t('energy_habits_title')}</p>
        <span
          className="text-sm font-black"
          style={{ color: pct === 100 ? '#2ecc71' : pct > 60 ? '#c9a84c' : '#888' }}
        >
          {pct}%
        </span>
      </div>
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg,#27ae60,#2ecc71)'
              : 'linear-gradient(90deg,#a88930,#e8c96a)',
          }}
        />
      </div>
      <div className="space-y-1.5">
        {habits.map((h, i) => {
          const done = checked.includes(i)
          return (
            <button
              key={i}
              onClick={() => onToggle(date, i)}
              className="w-full flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98] text-right"
              style={{
                background: done ? 'rgba(46,204,113,0.08)' : '#111',
                border: `1px solid ${done ? 'rgba(46,204,113,0.25)' : '#1e1e1e'}`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all"
                style={{
                  borderColor: done ? '#2ecc71' : '#333',
                  background: done ? 'rgba(46,204,113,0.2)' : 'transparent',
                }}
              >
                {done && <span className="text-xs text-green-400">✓</span>}
              </div>
              <span className="text-sm">{h.emoji}</span>
              <span
                className="text-xs flex-1 text-right"
                style={{ color: done ? '#ddd' : '#888', textDecoration: done ? 'line-through' : 'none' }}
              >
                {h.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function EnergyChallenge() {
  const { state, toggleChallengeHabit, startChallenge, today } = useApp()
  const { lang, t } = useLang()
  const isAr = lang === 'ar'
  const [tab, setTab] = useState('challenge')

  const isActive = state.challengeActive
  const todayLog = state.challengeLog[today] || []

  const HABITS = HABITS_DATA[lang]
  const GIFTS = GIFTS_DATA[lang]
  const POISONS = POISONS_DATA[lang]

  const TABS = [
    { key: 'challenge', label: `🔥 ${t('energy_tab_challenge')}` },
    { key: 'gifts',    label: `🎁 ${t('energy_tab_gifts')}` },
    { key: 'poisons',  label: `☠️ ${t('energy_tab_poisons')}` },
  ]

  return (
    <Layout title={t('energy_title')} subtitle={t('energy_subtitle')} helpKey="energy">
      <div className="space-y-4 pt-2">

        {/* Tab bar */}
        <div className="flex gap-1.5">
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: tab === tb.key ? 'rgba(201,168,76,0.15)' : '#111',
                border: `1px solid ${tab === tb.key ? 'rgba(201,168,76,0.4)' : '#1e1e1e'}`,
                color: tab === tb.key ? '#c9a84c' : '#666' }}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* Challenge tab */}
        {tab === 'challenge' && (
          <>
            {!isActive ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-5xl">⚡</p>
                <h3 className="text-xl font-black text-white">
                  {isAr ? 'تحدي الـ 10 أيام' : '10-Day Challenge'}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
                  {isAr
                    ? '10 أيام متواصلة لتطبيق مبادئ الطاقة النقية. الأيام الأولى صعبة — ثم ستشعر بطاقة لم تعرفها من قبل.'
                    : '10 consecutive days applying pure energy principles. The first days are tough — then you\'ll feel energy you\'ve never known before.'}
                </p>
                <button onClick={startChallenge} className="btn-gold px-8 py-4 text-base w-full">
                  🔥 {t('energy_start_challenge')}!
                </button>
              </div>
            ) : (
              <>
                {/* Progress days */}
                <div className="card">
                  <p className="text-sm font-bold text-white mb-3">{t('energy_grid_title')}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 10 }, (_, i) => {
                      const d = new Date(state.challengeStart)
                      d.setDate(d.getDate() + i)
                      const dateStr = d.toISOString().split('T')[0]
                      const log = state.challengeLog[dateStr] || []
                      const pct = (log.length / HABITS.length) * 100
                      const isToday = dateStr === today
                      const isPast = dateStr < today
                      return (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black"
                          style={{
                            background: pct === 100 ? 'rgba(46,204,113,0.2)'
                              : isPast ? 'rgba(230,57,70,0.1)'
                              : isToday ? 'rgba(201,168,76,0.15)'
                              : '#111',
                            border: `1px solid ${pct === 100 ? 'rgba(46,204,113,0.4)'
                              : isToday ? 'rgba(201,168,76,0.4)'
                              : '#1e1e1e'}`,
                            color: pct === 100 ? '#2ecc71' : isToday ? '#c9a84c' : '#555',
                          }}
                        >
                          {pct === 100 ? '✓' : i + 1}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <HabitDay date={today} habitLog={todayLog} onToggle={toggleChallengeHabit} t={t} habits={HABITS} />
              </>
            )}
          </>
        )}

        {/* Gifts tab */}
        {tab === 'gifts' && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#888' }}>
              {isAr ? 'الهدايا الثمانية — 8 مبادئ للطاقة النقية' : '8 Gifts — 8 Principles of Pure Energy'}
            </p>
            {GIFTS.map((g, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: '#1a1a1a', border: `1px solid ${g.color}22` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: `${g.color}15` }}
                >
                  {g.emoji}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{g.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#888' }}>{g.desc}</p>
                </div>
                <span
                  className="text-xs font-bold flex-shrink-0"
                  style={{ color: g.color }}
                >
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Poisons tab */}
        {tab === 'poisons' && (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#888' }}>
              {isAr ? 'السموم الأربعة — تجنّبها طوال التحدي' : 'The Four Poisons — avoid them throughout the challenge'}
            </p>
            {POISONS.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.2)' }}
              >
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <p className="font-bold text-sm text-white">{p.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#e63946' }}>{p.effect}</p>
                </div>
              </div>
            ))}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: '#c9a84c' }}>
                💡 {isAr ? 'نصيحة البداية' : 'Starting Tip'}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#aaa' }}>
                {isAr
                  ? 'الأيام 1-3 قد تشعر بصداع وتعب — هذا طبيعي وهو تخلص من السموم. بعد اليوم 4 ستشعر بفارق حقيقي في طاقتك.'
                  : 'Days 1–3 you may feel headaches and fatigue — this is normal detoxification. After day 4 you will feel a real difference in your energy.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
