/**
 * HeroArchetypePage — TR10 Jungian Hero Archetype
 *
 * User picks one of 12 archetypes. Their selection appears on the Dashboard
 * and prompts a daily question ("What would the Warrior in you do?").
 *
 * Once picked, they can record daily alignment with the archetype.
 */
import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { ARCHETYPES, getArchetypeById, getHeroAlignment } from '../utils/heroArchetype'

export default function HeroArchetypePage() {
  const { state, setHeroArchetype, recordHeroAlignment } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'
  const selectedId = state.heroArchetype?.selected
  const selected = getArchetypeById(selectedId)
  const alignment = getHeroAlignment(state)
  const [todayScore, setTodayScore] = useState(7)
  const today = new Date().toISOString().slice(0, 10)
  const todayLogged = state.heroArchetype?.alignmentLog?.[today]

  const pick = (archetype) => {
    setHeroArchetype(archetype.id)
    showToast(isAr ? `تم اختيار ${archetype.nameAr}` : `${archetype.nameEn} selected`, 'success', 1500)
  }

  const logAlignment = () => {
    recordHeroAlignment(todayScore)
    showToast(isAr ? 'تم تسجيل انسجامك ✓' : 'Alignment logged ✓', 'success', 1500)
  }

  return (
    <Layout
      title={isAr ? '🦸 نموذجك البطولي' : '🦸 Your Hero Archetype'}
      subtitle={isAr ? 'أي بطل داخلك يحكم يومك؟' : 'Which hero inside you rules your day?'}
    >
      <div className="space-y-4 pt-2">

        {/* Selected archetype hero card */}
        {selected ? (
          <SelectedHeroCard selected={selected} alignment={alignment} isAr={isAr}
            todayScore={todayScore} setTodayScore={setTodayScore}
            todayLogged={todayLogged} logAlignment={logAlignment} />
        ) : (
          <div className="rounded-2xl p-5 text-center" style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)',
            border: '1px dashed rgba(201,168,76,0.35)',
          }}>
            <div style={{ fontSize: 48 }}>🎭</div>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: '#c9a84c', marginTop: 10 }}>
              {isAr ? 'اختر نموذجك البطولي' : 'Choose Your Hero Archetype'}
            </h2>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 8, lineHeight: 1.5 }}>
              {isAr
                ? 'النماذج 12 من كارل يونغ — كل نموذج لديه جوهر، دافع، وظل. اختر الأقرب لك.'
                : '12 Jungian archetypes — each has an essence, motivation, and shadow. Pick the closest to you.'}
            </p>
          </div>
        )}

        {/* Archetype grid */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.05em', marginBottom: 10 }}>
            {selected
              ? (isAr ? '🔄 غيّر اختيارك' : '🔄 Change selection')
              : (isAr ? '👥 النماذج الاثنا عشر' : '👥 The 12 Archetypes')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ARCHETYPES.map(a => {
              const isSelected = a.id === selectedId
              return (
                <button
                  key={a.id}
                  onClick={() => pick(a)}
                  className="rounded-2xl p-3 text-start transition-all active:scale-[0.97]"
                  style={{
                    background: isSelected ? 'rgba(201,168,76,0.15)' : '#0e0e0e',
                    border: `1px solid ${isSelected ? 'rgba(201,168,76,0.4)' : '#1e1e1e'}`,
                    cursor: 'pointer',
                    minHeight: 80,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{a.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: isSelected ? '#c9a84c' : '#fff' }}>
                      {isAr ? a.nameAr : a.nameEn}
                    </span>
                    {isSelected && <span style={{ fontSize: 10, color: '#c9a84c' }}>✓</span>}
                  </div>
                  <p style={{ fontSize: 9, color: '#888', lineHeight: 1.3 }}>
                    {isAr ? a.essenceAr : a.essenceEn}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function SelectedHeroCard({ selected, alignment, isAr, todayScore, setTodayScore, todayLogged, logAlignment }) {
  return (
    <div className="rounded-2xl p-5" style={{
      background: 'linear-gradient(135deg, rgba(201,168,76,0.1), transparent)',
      border: '1px solid rgba(201,168,76,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 48, lineHeight: 1 }}>{selected.emoji}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, fontWeight: 900, color: '#c9a84c', letterSpacing: '0.1em' }}>
            {isAr ? 'بطلك' : 'YOUR HERO'}
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>
            {isAr ? selected.nameAr : selected.nameEn}
          </h2>
        </div>
        {alignment !== null && (
          <div style={{
            minWidth: 40, height: 40, borderRadius: '50%',
            background: `${alignment >= 7 ? '#2ecc71' : alignment >= 5 ? '#c9a84c' : '#e63946'}15`,
            border: `2px solid ${alignment >= 7 ? '#2ecc71' : alignment >= 5 ? '#c9a84c' : '#e63946'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 900, color: alignment >= 7 ? '#2ecc71' : alignment >= 5 ? '#c9a84c' : '#e63946',
          }}>{alignment}</div>
        )}
      </div>

      {/* Essence / Motivation / Shadow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <Attr label={isAr ? 'الجوهر' : 'Essence'} value={isAr ? selected.essenceAr : selected.essenceEn} color="#c9a84c" />
        <Attr label={isAr ? 'الدافع' : 'Motivation'} value={isAr ? selected.motivationAr : selected.motivationEn} color="#2ecc71" />
      </div>
      <Attr label={isAr ? 'الظل' : 'Shadow'} value={isAr ? selected.shadowAr : selected.shadowEn} color="#e63946" block />

      {/* Coaching question */}
      <div style={{
        marginTop: 14, padding: '12px 14px', borderRadius: 12,
        background: 'rgba(201,168,76,0.06)', border: '1px dashed rgba(201,168,76,0.35)',
      }}>
        <p style={{ fontSize: 10, fontWeight: 900, color: '#c9a84c', marginBottom: 4 }}>
          {isAr ? 'سؤال اليوم' : 'TODAY\'S QUESTION'}
        </p>
        <p style={{ fontSize: 12, color: '#eee', lineHeight: 1.5, fontStyle: 'italic' }}>
          {isAr ? selected.questionAr : selected.questionEn}
        </p>
      </div>

      {/* Daily alignment log */}
      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#bbb', marginBottom: 6 }}>
          {todayLogged
            ? (isAr ? `سجّلت اليوم: ${todayLogged}/10` : `Today logged: ${todayLogged}/10`)
            : (isAr
                ? `كم انسجمت مع ${selected.nameAr} اليوم؟`
                : `How much did you embody ${selected.nameEn} today?`)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="range" min={1} max={10} value={todayScore}
            onChange={e => setTodayScore(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#c9a84c' }}
          />
          <span style={{
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(201,168,76,0.15)', border: '2px solid #c9a84c',
            fontSize: 12, fontWeight: 900, color: '#c9a84c',
          }}>{todayScore}</span>
        </div>
        <button
          onClick={logAlignment}
          className="w-full mt-2 rounded-xl py-2 text-xs font-bold transition-all active:scale-[0.97]"
          style={{
            background: 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.3)',
            color: '#c9a84c',
          }}
        >
          {todayLogged
            ? (isAr ? '↻ تحديث انسجام اليوم' : '↻ Update Today')
            : (isAr ? 'سجّل انسجام اليوم' : 'Log Today')}
        </button>
      </div>
    </div>
  )
}

function Attr({ label, value, color, block }) {
  return (
    <div style={{
      padding: '8px 10px', borderRadius: 8,
      background: `${color}08`,
      border: `1px solid ${color}25`,
      gridColumn: block ? '1 / -1' : undefined,
    }}>
      <p style={{ fontSize: 9, fontWeight: 900, color, letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 11, color: '#ddd', marginTop: 2, lineHeight: 1.4 }}>{value}</p>
    </div>
  )
}
