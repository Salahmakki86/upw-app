/**
 * #3 — Power Hour
 * 60-minute focused deep work timer with daily tracking
 */
import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import Layout from '../components/Layout'

const DURATION = 60 * 60 // 60 minutes in seconds

export default function PowerHour() {
  const { state, update } = useApp()
  const { lang } = useLang()
  const { showToast } = useToast()
  const isAr = lang === 'ar'

  const today = new Date().toISOString().slice(0, 10)
  const powerLog = state.powerHour || {}
  const todayEntry = powerLog[today]

  const [task, setTask] = useState(todayEntry?.task || '')
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(!!todayEntry?.completedAt)
  const [result, setResult] = useState(todayEntry?.result || '')
  const intervalRef = useRef(null)

  // Restore started state if session began today but not completed
  useEffect(() => {
    if (todayEntry?.startedAt && !todayEntry?.completedAt) {
      setStarted(true)
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(v => {
          if (v <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setDone(true)
            showToast(isAr ? 'ساعة القوة اكتملت! 🏆' : 'Power Hour complete! 🏆', 'gold', 4000)
            return 0
          }
          return v - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running]) // eslint-disable-line

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const secs = (timeLeft % 60).toString().padStart(2, '0')
  const progressPct = ((DURATION - timeLeft) / DURATION) * 100

  const startSession = () => {
    if (!task.trim()) return
    setStarted(true)
    setRunning(true)
    const newLog = { ...powerLog, [today]: { task: task.trim(), startedAt: Date.now() } }
    update('powerHour', newLog)
  }

  const saveResult = () => {
    const newLog = { ...powerLog, [today]: { ...powerLog[today], result: result.trim(), completedAt: Date.now() } }
    update('powerHour', newLog)
    showToast(isAr ? 'تم الحفظ ✓' : 'Saved ✓', 'success')
  }

  // Streak
  const streak = (() => {
    let count = 0
    const cursor = new Date()
    while (true) {
      const key = cursor.toISOString().slice(0, 10)
      if (powerLog[key]?.completedAt) { count++; cursor.setDate(cursor.getDate() - 1) }
      else break
    }
    return count
  })()

  // Last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })

  if (done || todayEntry?.completedAt) {
    return (
      <Layout title={isAr ? 'ساعة القوة' : 'Power Hour'} subtitle={isAr ? 'التركيز الأعمق' : 'Deep Focus'}>
        <div className="space-y-4 pt-4">
          <div className="text-center py-6">
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-xl font-black text-white mb-1">
              {isAr ? 'ساعة القوة مكتملة!' : 'Power Hour Complete!'}
            </h2>
            <p className="text-sm" style={{ color: '#888' }}>
              {isAr ? `المهمة: "${todayEntry?.task || task}"` : `Task: "${todayEntry?.task || task}"`}
            </p>
            {streak > 1 && (
              <p className="text-sm font-bold mt-2" style={{ color: '#c9a84c' }}>
                🔥 {streak} {isAr ? 'يوم متواصل من التركيز العميق' : 'consecutive deep focus days'}
              </p>
            )}
          </div>

          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid rgba(201,168,76,0.2)' }}>
            <label className="text-xs font-bold block mb-2" style={{ color: '#c9a84c' }}>
              📝 {isAr ? 'ماذا أنجزت؟' : 'What did you accomplish?'}
            </label>
            <textarea
              value={result}
              onChange={e => setResult(e.target.value)}
              placeholder={isAr ? 'سجّل إنجازك من ساعة القوة...' : 'Record your Power Hour accomplishment...'}
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white resize-none"
              style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
            />
            <button onClick={saveResult} className="w-full btn-gold py-2.5 text-sm mt-3">
              💾 {isAr ? 'احفظ النتيجة' : 'Save Result'}
            </button>
          </div>

          {/* 7-day tracker */}
          <div className="rounded-2xl p-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>
              📅 {isAr ? 'آخر ٧ أيام' : 'Last 7 Days'}
            </p>
            <div className="flex gap-2 justify-center">
              {last7.map(d => {
                const entry = powerLog[d]
                const completed = !!entry?.completedAt
                return (
                  <div key={d} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: completed ? '#2ecc7120' : '#1a1a1a', border: `1px solid ${completed ? '#2ecc7150' : '#2a2a2a'}` }}>
                      <span style={{ fontSize: 12 }}>{completed ? '✅' : '·'}</span>
                    </div>
                    <span className="text-xs" style={{ color: d === today ? '#c9a84c' : '#555', fontSize: 8 }}>
                      {new Date(d).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (started) {
    return (
      <Layout title={isAr ? 'ساعة القوة' : 'Power Hour'} subtitle={isAr ? `🎯 ${task}` : `🎯 ${task}`}>
        <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
          {/* Task */}
          <p className="text-xs font-bold mb-6" style={{ color: '#c9a84c' }}>
            🎯 {task}
          </p>

          {/* Timer circle */}
          <div className="relative mb-6">
            <svg width={220} height={220} className="transform -rotate-90">
              <circle cx={110} cy={110} r={100} fill="none" stroke="#1e1e1e" strokeWidth={6} />
              <circle cx={110} cy={110} r={100} fill="none"
                stroke={timeLeft < 300 ? '#e74c3c' : '#c9a84c'}
                strokeWidth={6} strokeLinecap="round"
                strokeDasharray={628} strokeDashoffset={628 - (progressPct / 100) * 628}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-widest"
                style={{ color: timeLeft < 300 ? '#e74c3c' : '#c9a84c', fontVariantNumeric: 'tabular-nums' }}>
                {mins}:{secs}
              </span>
              <span className="text-xs mt-1" style={{ color: '#666' }}>
                {isAr ? 'دقيقة متبقية' : 'minutes remaining'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button onClick={() => setRunning(!running)}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}>
              {running ? <Pause size={18} /> : <Play size={18} />}
              {running ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'استمر' : 'Resume')}
            </button>
            <button onClick={() => { setTimeLeft(DURATION); setRunning(false) }}
              className="p-3 rounded-2xl" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <RotateCcw size={18} style={{ color: '#888' }} />
            </button>
          </div>

          <p className="text-xs mt-6" style={{ color: '#444' }}>
            {isAr ? 'لا تشتت. لا هاتف. فقط أنت والمهمة.' : 'No distractions. No phone. Just you and the task.'}
          </p>
        </div>
      </Layout>
    )
  }

  // Pre-start screen
  return (
    <Layout
      title={isAr ? 'ساعة القوة' : 'Power Hour'}
      subtitle={isAr ? '٦٠ دقيقة تركيز عميق على أهم مهمة' : '60 minutes of deep focus on your #1 task'}
    >
      <div className="space-y-4 pt-4">
        <div className="text-center py-4">
          <div className="text-5xl mb-3">⏱</div>
          <p className="text-sm text-white font-bold mb-1">
            {isAr ? 'ما المهمة الوحيدة إذا أنجزتها اليوم تتغير نتائجك؟' : 'What is the ONE task that would change your results today?'}
          </p>
          <p className="text-xs" style={{ color: '#888' }}>
            {isAr ? 'توني يقول: "حيث يذهب تركيزك تذهب طاقتك"' : 'Tony says: "Where focus goes, energy flows"'}
          </p>
        </div>

        <textarea
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder={isAr ? 'اكتب مهمتك الأهم...' : 'Write your most important task...'}
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
          style={{ background: '#111', border: '1px solid #333', outline: 'none' }}
        />

        <button onClick={startSession} disabled={!task.trim()}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #c9a84c, #a88930)', color: '#090909' }}>
          ⏱ {isAr ? 'ابدأ ساعة القوة' : 'Start Power Hour'}
        </button>

        {streak > 0 && (
          <p className="text-center text-xs font-bold" style={{ color: '#c9a84c' }}>
            🔥 {streak} {isAr ? 'يوم متواصل' : 'day streak'}
          </p>
        )}
      </div>
    </Layout>
  )
}
