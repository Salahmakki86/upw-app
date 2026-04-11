import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { upwApi } from '../api/upwApi'

const INITIAL_STATE = {
  // Streak
  streak: 0,
  lastActiveDate: null,

  // Emotional state log: [{ date, state: 'beautiful'|'suffering', label }]
  stateLog: [],
  todayState: null, // 'beautiful' | 'suffering' | null

  // Morning ritual progress today
  morningDone: false,
  primingPhasesDone: [], // indices 0-3

  // Evening ritual
  eveningDone: false,

  // Goals (RPM)
  goals: [],

  // Beliefs
  limitingBeliefs: [],
  empoweringBeliefs: [],

  // Wheel of Life scores (7 areas, 0-10)
  wheelScores: {
    body:         5,
    emotions:     5,
    relationships:5,
    time:         5,
    career:       5,
    money:        5,
    contribution: 5,
  },
  wheelHistory: [], // [{ date, scores }]

  // Energy Challenge (10-day)
  challengeDay:    0,
  challengeActive: false,
  challengeStart:  null,
  challengeLog:    {}, // { 'YYYY-MM-DD': [checkedHabitIndices] }

  // Incantations
  incantations: [
    'أنا قوي وقادر على تحقيق أي شيء!',
    'كل يوم أنمو وأتطور بشكل مستمر!',
    'أنا أستحق الحب والنجاح والوفرة!',
    'طاقتي لا حدود لها وحياتي استثنائية!',
    'أنا أصنع مصيري بقراراتي كل لحظة!',
  ],

  // Power Questions answers log
  morningAnswers: {},
  eveningAnswers: {},

  // Settings
  userName: 'المحارب',

  // Business Mastery KPIs
  businessKPIs: {
    revenue:    20000,
    clients:    100,
    avgOrder:   165,
    conversion: 10,
    cac:        0,
    margin:     0,
  },
  // Monthly snapshots: [{ date, month, revenue, clients, avgOrder, conversion, cac, margin }]
  businessKPIHistory: [],
  // Completed action steps per force: { '1-0': true, '2-3': true, ... }
  businessActions: {},

  // Weekly reviews: [{ week: 'YYYY-WW', date, text }]
  weeklyReflections: [],

  // Date with Destiny
  dwd: {
    daysDone:            {},   // { day1: true, ... }
    exercises:           {},   // { 'day1-0': true, ... }
    needsScores:         { certainty: 5, variety: 5, significance: 5, love: 5, growth: 5, contribution: 5 },
    values:              ['', '', '', '', '', ''],
    primaryQuestion:     '',
    emotionalHomeCurrent:[],
    emotionalHomeNew:    [],
    identityStatements:  '',
    globalBeliefs:       '',
    mission:             '',
    legacy:              '',
    vision:              '',
    actionSteps:         '',
  },

  // Financial Freedom
  financialFreedom: {
    currentLevel: 1,
    netWorth: 0,
    monthlyPassive: 0,
    monthlyExpenses: 5000,
    levelNotes: {},
  },

  // Personal Power 30-day
  personalPower: {
    active: false,
    startDate: null,
    daysDone: {},
  },

  // Fear to Power
  fearToFpower: {
    fears: [],
  },

  // Time of Life
  timeOfLife: {
    areas: { body: { current: 0, ideal: 0 }, work: { current: 0, ideal: 0 }, relationships: { current: 0, ideal: 0 }, learning: { current: 0, ideal: 0 }, fun: { current: 0, ideal: 0 }, spirituality: { current: 0, ideal: 0 }, rest: { current: 0, ideal: 0 } },
    bigRocks: ['', '', '', '', ''],
    timeValues: '',
  },

  // Annual Plan
  annualPlan: {
    year: 2026,
    vision: '',
    themes: ['', '', ''],
    q1: '', q2: '', q3: '', q4: '',
    wordOfYear: '',
    challenges: ['', '', ''],
  },

  // Magic Questions answers
  magicQuestions: {},

  // Daily Wins
  dailyWins: {},  // { 'YYYY-MM-DD': [{ id, text, category, emoji, ts }] }

  // Letters to Self
  letters: [],  // [{ id, timeframe, writtenDate, openDate, text }]

  // Modeling Excellence
  modeling: {
    models: [],
    strategyAnswers: {},
    weeksDone: {},
  },

  // Relationship Mastery
  relationships: {
    ratings: { family: 5, partner: 5, friends: 5, colleagues: 5, self: 5, community: 5 },
    givingPlan: [
      { person: '', action: '', done: false },
      { person: '', action: '', done: false },
      { person: '', action: '', done: false },
      { person: '', action: '', done: false },
      { person: '', action: '', done: false },
    ],
    needsAnswers: {},
  },

  // Energy Protocol
  energyProtocol: {},  // { 'YYYY-MM-DD': { water: 0, coldExposure: false, movement: '', steps: '', nutrition: [] } }

  // Daily Challenges
  dailyChallenges: {
    history: [],
    accepted: {},
    completed: {},
  },
}

const AppContext = createContext(null)

// Admin keeps the original key; students get their own namespace
function storageKey(userId) {
  return userId === 'admin' ? 'upw-state' : 'upw-state-' + userId
}

const STUDENT_INITIAL_STATE = {
  ...INITIAL_STATE,
  businessKPIs: { revenue: 0, clients: 0, avgOrder: 0, conversion: 0, cac: 0, margin: 0 },
}

function loadState(userId) {
  const base = userId === 'admin' ? INITIAL_STATE : STUDENT_INITIAL_STATE
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? { ...base, ...JSON.parse(raw) } : base
  } catch {
    return base
  }
}

function saveState(state, userId) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state))
  } catch {}
}

export function AppProvider({ children, userId, hasData }) {
  const [state, setStateRaw] = useState(() => loadState(userId))
  const [syncing, setSyncing] = useState(false)
  const syncTimer = useRef(null)
  const isMounted = useRef(true)

  // On mount: fetch state from backend (or upload localStorage if first time)
  useEffect(() => {
    isMounted.current = true
    async function initSync() {
      try {
        if (hasData) {
          // Pull from backend
          const { state: remoteState } = await upwApi.getState()
          if (remoteState && isMounted.current) {
            const base = userId === 'admin' ? INITIAL_STATE : STUDENT_INITIAL_STATE
            const merged = { ...base, ...remoteState }
            setStateRaw(merged)
            saveState(merged, userId)
          }
        } else {
          // First sync: push localStorage state to backend
          const localState = loadState(userId)
          await upwApi.saveState(localState)
        }
      } catch {}
    }
    initSync()
    return () => { isMounted.current = false }
  }, [userId]) // eslint-disable-line

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveState(next, userId)
      // Debounced sync to backend (3 seconds)
      if (syncTimer.current) clearTimeout(syncTimer.current)
      syncTimer.current = setTimeout(() => {
        upwApi.saveState(next).catch(() => {})
      }, 3000)
      return next
    })
  }, [userId])

  const update = useCallback((key, value) => {
    setState(prev => ({ ...prev, [key]: value }))
  }, [setState])

  // Today's date string
  const today = new Date().toISOString().split('T')[0]

  // Log emotional state
  const logState = useCallback((stateVal, label) => {
    setState(prev => ({
      ...prev,
      todayState: stateVal,
      stateLog: [
        ...prev.stateLog.filter(e => e.date !== today),
        { date: today, state: stateVal, label, ts: Date.now() },
      ],
    }))
  }, [setState, today])

  // Complete morning ritual
  const completeMorning = useCallback(() => {
    setState(prev => {
      const newStreak = prev.lastActiveDate === today
        ? prev.streak
        : prev.lastActiveDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
          ? prev.streak + 1
          : 1
      return { ...prev, morningDone: true, streak: newStreak, lastActiveDate: today }
    })
  }, [setState, today])

  // Add goal
  const addGoal = useCallback((goal) => {
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, { id: Date.now(), ...goal, createdAt: today, progress: 0 }],
    }))
  }, [setState, today])

  // Update goal
  const updateGoal = useCallback((id, patch) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...patch } : g),
    }))
  }, [setState])

  // Delete goal
  const deleteGoal = useCallback((id) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }))
  }, [setState])

  // Update wheel score
  const updateWheel = useCallback((area, score) => {
    setState(prev => ({
      ...prev,
      wheelScores: { ...prev.wheelScores, [area]: score },
    }))
  }, [setState])

  // Save wheel snapshot
  const saveWheelSnapshot = useCallback(() => {
    setState(prev => ({
      ...prev,
      wheelHistory: [
        ...prev.wheelHistory,
        { date: today, scores: { ...prev.wheelScores } },
      ],
    }))
  }, [setState, today])

  // Challenge habit toggle
  const toggleChallengeHabit = useCallback((date, habitIdx) => {
    setState(prev => {
      const dayLog = prev.challengeLog[date] || []
      const next = dayLog.includes(habitIdx)
        ? dayLog.filter(i => i !== habitIdx)
        : [...dayLog, habitIdx]
      return { ...prev, challengeLog: { ...prev.challengeLog, [date]: next } }
    })
  }, [setState])

  // Start challenge
  const startChallenge = useCallback(() => {
    setState(prev => ({ ...prev, challengeActive: true, challengeStart: today, challengeDay: 1 }))
  }, [setState, today])

  // Add belief
  const addBelief = useCallback((type, text) => {
    const key = type === 'limiting' ? 'limitingBeliefs' : 'empoweringBeliefs'
    setState(prev => ({
      ...prev,
      [key]: [...prev[key], { id: Date.now(), text, createdAt: today }],
    }))
  }, [setState, today])

  // Update a single business KPI value
  const updateBusinessKPI = useCallback((key, value) => {
    setState(prev => ({
      ...prev,
      businessKPIs: { ...prev.businessKPIs, [key]: value },
    }))
  }, [setState])

  // Save a monthly KPI snapshot
  const saveBusinessSnapshot = useCallback(() => {
    setState(prev => {
      const month = today.slice(0, 7) // 'YYYY-MM'
      const existing = prev.businessKPIHistory.filter(s => s.month !== month)
      return {
        ...prev,
        businessKPIHistory: [
          ...existing,
          { date: today, month, ...prev.businessKPIs },
        ],
      }
    })
  }, [setState, today])

  // Toggle a business action checkbox
  const toggleBusinessAction = useCallback((key) => {
    setState(prev => ({
      ...prev,
      businessActions: { ...prev.businessActions, [key]: !prev.businessActions[key] },
    }))
  }, [setState])

  // Save weekly reflection
  const saveWeeklyReflection = useCallback((text) => {
    setState(prev => {
      const week = (() => {
        const d = new Date(); const jan4 = new Date(d.getFullYear(), 0, 4)
        const w = Math.ceil(((d - jan4) / 86400000 + jan4.getDay() + 1) / 7)
        return `${d.getFullYear()}-W${String(w).padStart(2, '0')}`
      })()
      const existing = (prev.weeklyReflections || []).filter(r => r.week !== week)
      return { ...prev, weeklyReflections: [...existing, { week, date: today, text }] }
    })
  }, [setState, today])

  // Update a single Date with Destiny field (top-level key inside dwd)
  const updateDwd = useCallback((key, value) => {
    setState(prev => ({
      ...prev,
      dwd: { ...(prev.dwd || {}), [key]: value },
    }))
  }, [setState])

  // Remove belief
  const removeBelief = useCallback((type, id) => {
    const key = type === 'limiting' ? 'limitingBeliefs' : 'empoweringBeliefs'
    setState(prev => ({
      ...prev,
      [key]: prev[key].filter(b => b.id !== id),
    }))
  }, [setState])

  // Financial Freedom
  const updateFinancialFreedom = useCallback((key, value) => {
    setState(prev => ({ ...prev, financialFreedom: { ...(prev.financialFreedom || {}), [key]: value } }))
  }, [setState])

  // Personal Power
  const togglePersonalPowerDay = useCallback((dateKey) => {
    setState(prev => {
      const pp = prev.personalPower || {}
      const daysDone = { ...(pp.daysDone || {}) }
      daysDone[dateKey] = !daysDone[dateKey]
      return { ...prev, personalPower: { ...pp, daysDone, active: true, startDate: pp.startDate || today } }
    })
  }, [setState, today])

  const updatePersonalPower = useCallback((key, value) => {
    setState(prev => ({ ...prev, personalPower: { ...(prev.personalPower || {}), [key]: value } }))
  }, [setState])

  // Fear to Power
  const addFear = useCallback((fearText) => {
    setState(prev => ({
      ...prev,
      fearToFpower: {
        ...(prev.fearToFpower || {}),
        fears: [...((prev.fearToFpower || {}).fears || []), { id: Date.now(), fear: fearText, steps: {}, done: false }]
      }
    }))
  }, [setState])

  const updateFear = useCallback((id, patch) => {
    setState(prev => ({
      ...prev,
      fearToFpower: {
        ...(prev.fearToFpower || {}),
        fears: ((prev.fearToFpower || {}).fears || []).map(f => f.id === id ? { ...f, ...patch } : f)
      }
    }))
  }, [setState])

  const deleteFear = useCallback((id) => {
    setState(prev => ({
      ...prev,
      fearToFpower: {
        ...(prev.fearToFpower || {}),
        fears: ((prev.fearToFpower || {}).fears || []).filter(f => f.id !== id)
      }
    }))
  }, [setState])

  // Time of Life
  const updateTimeOfLife = useCallback((key, value) => {
    setState(prev => ({ ...prev, timeOfLife: { ...(prev.timeOfLife || {}), [key]: value } }))
  }, [setState])

  // Annual Plan
  const updateAnnualPlan = useCallback((key, value) => {
    setState(prev => ({ ...prev, annualPlan: { ...(prev.annualPlan || {}), [key]: value } }))
  }, [setState])

  // Magic Questions
  const updateMagicQuestions = useCallback((key, value) => {
    setState(prev => ({ ...prev, magicQuestions: { ...(prev.magicQuestions || {}), [key]: value } }))
  }, [setState])

  // Daily Wins
  const addWin = useCallback((date, win) => {
    setState(prev => {
      const wins = prev.dailyWins || {}
      const dayWins = wins[date] || []
      return { ...prev, dailyWins: { ...wins, [date]: [...dayWins, { id: Date.now(), ...win, ts: Date.now() }] } }
    })
  }, [setState])

  const deleteWin = useCallback((date, id) => {
    setState(prev => {
      const wins = prev.dailyWins || {}
      const dayWins = (wins[date] || []).filter(w => w.id !== id)
      return { ...prev, dailyWins: { ...wins, [date]: dayWins } }
    })
  }, [setState])

  // Letters to Self
  const addLetter = useCallback((letter) => {
    setState(prev => ({ ...prev, letters: [...(prev.letters || []), { id: Date.now(), ...letter }] }))
  }, [setState])

  const updateLetter = useCallback((id, patch) => {
    setState(prev => ({ ...prev, letters: (prev.letters || []).map(l => l.id === id ? { ...l, ...patch } : l) }))
  }, [setState])

  const deleteLetter = useCallback((id) => {
    setState(prev => ({ ...prev, letters: (prev.letters || []).filter(l => l.id !== id) }))
  }, [setState])

  // Modeling Excellence
  const updateModeling = useCallback((key, value) => {
    setState(prev => ({ ...prev, modeling: { ...(prev.modeling || {}), [key]: value } }))
  }, [setState])

  // Relationship Mastery
  const updateRelationships = useCallback((key, value) => {
    setState(prev => ({ ...prev, relationships: { ...(prev.relationships || {}), [key]: value } }))
  }, [setState])

  // Energy Protocol
  const updateEnergyProtocol = useCallback((date, key, value) => {
    setState(prev => {
      const ep = prev.energyProtocol || {}
      const dayData = ep[date] || {}
      return { ...prev, energyProtocol: { ...ep, [date]: { ...dayData, [key]: value } } }
    })
  }, [setState])

  // Daily Challenges
  const acceptChallenge = useCallback((date, challenge) => {
    setState(prev => ({
      ...prev,
      dailyChallenges: {
        ...(prev.dailyChallenges || {}),
        accepted: { ...((prev.dailyChallenges || {}).accepted || {}), [date]: challenge }
      }
    }))
  }, [setState])

  const completeChallenge = useCallback((date) => {
    setState(prev => ({
      ...prev,
      dailyChallenges: {
        ...(prev.dailyChallenges || {}),
        completed: { ...((prev.dailyChallenges || {}).completed || {}), [date]: true },
        history: [
          ...((prev.dailyChallenges || {}).history || []).filter(h => h.date !== date),
          { date, challenge: ((prev.dailyChallenges || {}).accepted || {})[date], done: true }
        ]
      }
    }))
  }, [setState])

  return (
    <AppContext.Provider value={{
      state, setState, update,
      today,
      logState,
      completeMorning,
      addGoal, updateGoal, deleteGoal,
      updateWheel, saveWheelSnapshot,
      toggleChallengeHabit, startChallenge,
      addBelief, removeBelief,
      updateBusinessKPI, saveBusinessSnapshot, toggleBusinessAction,
      saveWeeklyReflection,
      updateDwd,
      updateFinancialFreedom,
      togglePersonalPowerDay, updatePersonalPower,
      addFear, updateFear, deleteFear,
      updateTimeOfLife,
      updateAnnualPlan,
      updateMagicQuestions,
      addWin, deleteWin,
      addLetter, updateLetter, deleteLetter,
      updateModeling,
      updateRelationships,
      updateEnergyProtocol,
      acceptChallenge, completeChallenge,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
