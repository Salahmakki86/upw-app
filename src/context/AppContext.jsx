import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { upwApi } from '../api/upwApi'
import { useToast } from './ToastContext'

const INITIAL_STATE = {
  // Streak
  streak: 0,
  lastActiveDate: null,
  morningLog: [], // ['YYYY-MM-DD', ...] — one entry per day morning was completed

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
  userName: '',

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
    buckets: {
      security: { target: 60, current: 0, items: ['صناديق المؤشرات', 'سندات', 'حساب توفير', 'تأمين'] },
      growth:   { target: 30, current: 0, items: ['أسهم نمو', 'عقارات', 'أسهم توزيعات', 'صناديق ETF'] },
      dream:    { target: 10, current: 0, items: ['عملات رقمية', 'شركات ناشئة', 'مشاريع مضاربة'] },
    },
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

  // 6 Human Needs
  sixNeedsScores: { certainty: 5, variety: 5, significance: 5, love: 5, growth: 5, contribution: 5 },
  sixNeedsSources: {},
  sixNeedsVehicle: '',

  // NAC Sessions
  nacSessions: [],

  // Compelling Future
  compellingFuture: { '1yr': {}, '3yr': {}, '5yr': {}, '10yr': {} },

  // Values Hierarchy
  valuesHierarchy: { selected: [], ranked: [], rules: {}, classification: {} },

  // Three Decisions (keyed by date)
  threeDecisions: {},

  // Emotional Flooding log
  floodingLog: [],

  // CANI log (keyed by date)
  caniLog: {},

  // Incantation practice streak
  incantationStreak: 0,
  lastIncantationDate: null,

  // Celebration Rituals
  celebrationRituals: { selectedRituals: [], winsLog: [] },

  // Life Story Reframing
  lifeStory: { currentStory: '', template: '', q1: '', q2: '', q3: '', newStory: '', committed: false },

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
    blueprints: {},
  },

  // Energy Protocol
  energyProtocol: {},  // { 'YYYY-MM-DD': { water: 0, coldExposure: false, movement: '', steps: '', nutrition: [] } }

  // Daily Challenges
  dailyChallenges: {
    history: [],
    accepted: {},
    completed: {},
  },

  // Lifebook
  lifebook: {},

  // Gratitude Journal: { 'YYYY-MM-DD': ['thing1','thing2','thing3'] }
  gratitude: {},

  // Habit Tracker
  habitTracker: { list: [], log: {} },

  // Reading Log
  readingLog: { books: [], yearlyGoal: 12 },

  // Vision Board
  visionBoard: { cards: [] },

  // Sleep Log: { 'YYYY-MM-DD': { hours, quality, notes, bedtime, waketime } }
  sleepLog: {},

  // Achievements
  achievements: { unlocked: [], seen: [] },

  // Coach messages received (for students)
  coachMessages: [],

  // Onboarding
  onboardingDone: false,
  startHereDismissed: false,

  // Baseline assessment: { date, scores: { health, career, finances, relationships, family, fun, growth, spirituality, contribution, environment } }
  baseline: null,

  // Commitment contract: { text, name, why, signedAt, date }
  commitment: null,

  // Group challenge: { active: null | { id, titleAr, titleEn, emoji, startDate, daysLog: {} } }
  groupChallenge: null,

  // Scaling Up
  scalingUp: {
    bhag: '', corePurpose: '', brandPromise: '', coreCustomer: '',
    targets3_5: '',
    annualRocks: ['', '', '', '', ''],
    quarterlyRocks: ['', '', ''],
    dailyPriorities: {},
    team: [],
    network: [],
    cashMetrics: { arr: '', cac: '', ltv: '', runway: '' },
    cashStrategies: [false, false, false, false, false],
  },

  // #8 — Celebrated milestones tracking
  celebratedMilestones: [],

  // Business Development Features
  businessWeeklyReview: {},  // { 'YYYY-WW': { revenueActual, revenueTarget, topWins, biggestBlocker, blockerPlan, decisionNeeded, selfRating, notes } }
  businessScorecard: {},  // { 'YYYY-MM-DD': { calls, leads, revenue, topWin, blocker } }
  sprint90: {},           // { goal, metric, startDate, weeks: [...] }
  powerHour: {},          // { 'YYYY-MM-DD': { task, startedAt, result, completedAt } }
  decisionJournal: [],    // [{ id, decision, reason, alternatives, expectedResult, emotion, date, reviewDate, review }]
  skillStack: { scores: {}, history: [], customSkills: null },
  networkTracker: [],     // [{ id, name, role, value, lastContact, nextFollowUp, given, type }]

  // New Business Intelligence Features
  salesPipeline: { deals: [], closedLost: [] },  // Sales funnel stages
  customerAvatars: [],   // [{ id, name, primaryAvatar, ageRange, gender, painPoints, ... }]
  coreStory: {},         // { title, bigProblem, stats, solution, differentiator, transformation }
  contentLog: [],        // [{ id, date, platform, type, topic, caption, leadsGenerated }]
  contentIdeas: [],      // [{ id, idea, used, createdAt }]
  leadMagnets: [],       // [{ id, name, type, createdDate, signups, conversionPct }]

  // Library concept notes: { [conceptTitle]: noteText }
  conceptNotes: {},

  // UPW 4-day program
  upwProgram: {
    daysDone: { day1: false, day2: false, day3: false, day4: false },
    exercises: {},
    exerciseData: {},
    reflections: { day1: '', day2: '', day3: '', day4: '' },
    startDate: null,
  },

  // Emergency Toolkit usage log
  emergencyLog: [],   // [{ date, tool, ts }]

  // SOS state-change log: [{ date, time, result }]
  sosLog: [],

  // Weekly Pulse check-ins: { 'YYYY-WW': { energy, word, win, challenge, reframe, intentions, weekStar, completedAt } }
  weeklyPulse: {},

  // Monthly Reset ceremonies: [{ monthKey, completedAt, wins, release, word, goal, scores }]
  monthlyResets: [],

  // Evening ritual daily log: { 'YYYY-MM-DD': { answers, gratitude, dayRating, tomorrow, reflection, completedAt } }
  eveningLog: {},

  // Dickens Process sessions: [{ date, belief, answers, joyText, newBelief, completedAt }]
  dickensLog: [],

  // Power Question answers log: [{ date, question, answer, ts }]
  powerQuestionLog: [],
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
  const { showToast } = useToast()

  // Today's date string (local time, not UTC) — must be defined before any useEffect that uses it
  function getLocalToday() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  const today = getLocalToday()
  // Yesterday in local time (NOT UTC) — used for streak calculation
  const yesterday = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })()

  // Recalculate streak from morningLog (array of 'YYYY-MM-DD' strings) or stateLog
  function recalcStreak(merged, todayStr, yesterdayStr) {
    // Build a set of days the user was active (morningLog takes priority, fallback to stateLog)
    const activeDays = new Set([
      ...(merged.morningLog || []),
      ...(merged.stateLog || []).map(e => e.date),
    ])
    if (merged.lastActiveDate) activeDays.add(merged.lastActiveDate)
    if (merged.morningDone)    activeDays.add(todayStr)

    // Count consecutive days going backwards from today (or yesterday if today not active)
    const startFrom = activeDays.has(todayStr) ? todayStr : yesterdayStr
    if (!activeDays.has(startFrom)) return merged.streak // nothing to repair

    let count = 0
    const d = new Date()
    if (!activeDays.has(todayStr)) d.setDate(d.getDate() - 1) // start from yesterday
    while (true) {
      const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      if (!activeDays.has(ds)) break
      count++
      d.setDate(d.getDate() - 1)
    }
    return count > (merged.streak || 0) ? count : (merged.streak || 0)
  }

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
            let merged = { ...base, ...remoteState }
            // Apply daily reset if date has changed (prevents backend overwriting in-memory reset)
            const isNewDay = merged.lastActiveDate && merged.lastActiveDate !== today
            // todayState always reflects today's stateLog — independent of lastActiveDate
            const correctTodayState = (merged.stateLog || []).find(e => e.date === today)?.state || null
            if (isNewDay || merged.todayState !== correctTodayState) {
              merged = {
                ...merged,
                todayState: correctTodayState,
                ...(isNewDay ? {
                  morningDone:       false,
                  eveningDone:       false,
                  primingPhasesDone: [],
                } : {}),
              }
            }
            // Auto-repair streak in case UTC bug caused incorrect resets
            const repairedStreak = recalcStreak(merged, today, yesterday)
            if (repairedStreak !== merged.streak) {
              merged = { ...merged, streak: repairedStreak }
            }
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

  // ── Daily reset: clear today-flags when a new day starts ──────────────────
  useEffect(() => {
    setStateRaw(prev => {
      // todayState: always sync with today's stateLog entry (independent of lastActiveDate)
      // This ensures emotional state resets even if morning was never completed
      const correctTodayState = (prev.stateLog || []).find(e => e.date === today)?.state || null

      // Morning/evening flags: only reset when lastActiveDate indicates a previous day
      const isNewDay = !!prev.lastActiveDate && prev.lastActiveDate !== today
      const needsUpdate = isNewDay || prev.todayState !== correctTodayState
      if (!needsUpdate) return prev // nothing to change

      const next = {
        ...prev,
        todayState: correctTodayState,
        ...(isNewDay ? {
          morningDone:       false,
          eveningDone:       false,
          primingPhasesDone: [],
        } : {}),
      }
      saveState(next, userId)  // persist to localStorage immediately
      return next
    })
  }, [today, userId]) // re-runs whenever the date changes

  // Track consecutive sync failures for smart toast behaviour
  const syncFailCount = useRef(0)

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveState(next, userId)   // ← always persisted to localStorage first

      // Debounced sync to backend (3 s) with retry
      if (syncTimer.current) clearTimeout(syncTimer.current)
      syncTimer.current = setTimeout(() => {
        const attempt = (retries) => {
          upwApi.saveState(next)
            .then(() => {
              // Show success toast only after recovering from failures
              if (syncFailCount.current > 0) {
                const _lang = localStorage.getItem('upw-lang') || 'ar'
                showToast(_lang === 'ar' ? 'تمت المزامنة ✓' : 'Synced ✓', 'success', 1500)
              }
              syncFailCount.current = 0
            })
            .catch(() => {
              if (retries > 0) {
                // Silent retry after 5 s
                setTimeout(() => attempt(retries - 1), 5000)
              } else {
                syncFailCount.current++
                // Only show a subtle warning after 3+ consecutive failures
                if (syncFailCount.current >= 3) {
                  const _lang = localStorage.getItem('upw-lang') || 'ar'
                  showToast(
                    _lang === 'ar'
                      ? 'بياناتك محفوظة محلياً — المزامنة ستتم لاحقاً'
                      : 'Data saved locally — sync will retry later',
                    'info', 3000
                  )
                  syncFailCount.current = 0   // reset so we don't spam
                }
              }
            })
        }
        attempt(2)   // up to 3 tries total
      }, 3000)
      return next
    })
  }, [userId])

  const update = useCallback((key, value) => {
    setState(prev => ({ ...prev, [key]: value }))
  }, [setState])

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
        ? prev.streak                      // already completed today — keep streak
        : prev.lastActiveDate === yesterday
          ? (prev.streak || 0) + 1         // completed yesterday — increment
          : 1                              // missed a day — reset to 1
      // morningLog: reliable day-by-day history for streak recalculation
      const morningLog = [...new Set([...(prev.morningLog || []), today])]
      return { ...prev, morningDone: true, streak: newStreak, lastActiveDate: today, morningLog }
    })
  }, [setState, today, yesterday])

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

  // Scaling Up
  const updateScalingUp = useCallback((key, value) => {
    setState(prev => ({ ...prev, scalingUp: { ...(prev.scalingUp || {}), [key]: value } }))
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

  // ── Always derive todayState from stateLog — never trust the stored value ──
  // This eliminates ALL edge cases where todayState could be stale across a day boundary.
  // stateLog is the source of truth; todayState is just a convenience snapshot.
  const computedTodayState = (state.stateLog || []).find(e => e.date === today)?.state || null
  const stateWithDerivedToday = computedTodayState !== state.todayState
    ? { ...state, todayState: computedTodayState }
    : state

  return (
    <AppContext.Provider value={{
      state: stateWithDerivedToday, setState, update,
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
      updateScalingUp,
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
