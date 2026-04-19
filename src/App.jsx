import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { LangProvider } from './context/LangContext'
import NotificationSetup from './components/NotificationSetup'
import MessageModal from './components/MessageModal'
import IdentityReinforcement from './components/IdentityReinforcement'
import { ToastProvider } from './context/ToastContext'

import LoginPage              from './pages/LoginPage'
import Dashboard              from './pages/Dashboard'
import TodayPage              from './pages/TodayPage'

// Lazy-loaded routes (code-split into separate chunks)
const AdminPage = lazy(() => import('./pages/AdminPage'))
const MorningRitual = lazy(() => import('./pages/MorningRitual'))
const StateManagement = lazy(() => import('./pages/StateManagement'))
const Goals = lazy(() => import('./pages/Goals'))
const WheelOfLife = lazy(() => import('./pages/WheelOfLife'))
const Beliefs = lazy(() => import('./pages/Beliefs'))
const EnergyChallenge = lazy(() => import('./pages/EnergyChallenge'))
const EveningRitual = lazy(() => import('./pages/EveningRitual'))
const Library = lazy(() => import('./pages/Library'))
const BusinessMastery = lazy(() => import('./pages/BusinessMastery'))
const DateWithDestiny = lazy(() => import('./pages/DateWithDestiny'))
const WeeklyReview = lazy(() => import('./pages/WeeklyReview'))
const FinancialFreedom = lazy(() => import('./pages/FinancialFreedom'))
const PersonalPower = lazy(() => import('./pages/PersonalPower'))
const FearToFpower = lazy(() => import('./pages/FearToFpower'))
const TimeOfLife = lazy(() => import('./pages/TimeOfLife'))
const DailyWins = lazy(() => import('./pages/DailyWins'))
const LetterToSelf = lazy(() => import('./pages/LetterToSelf'))
const ModelingExcellence = lazy(() => import('./pages/ModelingExcellence'))
const RelationshipMastery = lazy(() => import('./pages/RelationshipMastery'))
const EnergyProtocol = lazy(() => import('./pages/EnergyProtocol'))
const DailyChallenge = lazy(() => import('./pages/DailyChallenge'))
const Statistics = lazy(() => import('./pages/Statistics'))
const ScalingUp = lazy(() => import('./pages/ScalingUp'))
const Lifebook = lazy(() => import('./pages/Lifebook'))
const GratitudeJournal = lazy(() => import('./pages/GratitudeJournal'))
const HabitTracker = lazy(() => import('./pages/HabitTracker'))
const ReadingLog = lazy(() => import('./pages/ReadingLog'))
const VisionBoard = lazy(() => import('./pages/VisionBoard'))
const SleepTracker = lazy(() => import('./pages/SleepTracker'))
const Achievements = lazy(() => import('./pages/Achievements'))
const StudentProgress = lazy(() => import('./pages/StudentProgress'))
const CoachMessages = lazy(() => import('./pages/CoachMessages'))
const CommandCenter = lazy(() => import('./pages/CommandCenter'))
const CoachPrep = lazy(() => import('./pages/CoachPrep'))
const BaselinePage = lazy(() => import('./pages/BaselinePage'))
const InsightsPage = lazy(() => import('./pages/InsightsPage'))
const CommitmentPage = lazy(() => import('./pages/CommitmentPage'))
const GroupChallengePage = lazy(() => import('./pages/GroupChallengePage'))
const WeeklyReportPage = lazy(() => import('./pages/WeeklyReportPage'))
const MyWeeklySummary = lazy(() => import('./pages/MyWeeklySummary'))
const BusinessScorecard = lazy(() => import('./pages/BusinessScorecard'))
const Sprint90 = lazy(() => import('./pages/Sprint90'))
const PowerHour = lazy(() => import('./pages/PowerHour'))
const DecisionJournal = lazy(() => import('./pages/DecisionJournal'))
const SkillStack = lazy(() => import('./pages/SkillStack'))
const NetworkTracker = lazy(() => import('./pages/NetworkTracker'))
const SalesPipeline = lazy(() => import('./pages/SalesPipeline'))
const BizDashboard = lazy(() => import('./pages/BizDashboard'))
const CustomerAvatar = lazy(() => import('./pages/CustomerAvatar'))
const ContentTracker = lazy(() => import('./pages/ContentTracker'))
const SixHumanNeeds = lazy(() => import('./pages/SixHumanNeeds'))
const NACProcess = lazy(() => import('./pages/NACProcess'))
const CompellingFuture = lazy(() => import('./pages/CompellingFuture'))
const ValuesHierarchy = lazy(() => import('./pages/ValuesHierarchy'))
const Incantations = lazy(() => import('./pages/Incantations'))
const TransformationDashboard = lazy(() => import('./pages/TransformationDashboard'))
const UPWProgram = lazy(() => import('./pages/UPWProgram'))
const CelebrationRituals = lazy(() => import('./pages/CelebrationRituals'))
const LifeStoryReframing = lazy(() => import('./pages/LifeStoryReframing'))
const EmergencyToolkit = lazy(() => import('./pages/EmergencyToolkit'))
const VideoLibrary = lazy(() => import('./pages/VideoLibrary'))
const WeeklyPulse = lazy(() => import('./pages/WeeklyPulse'))
const MonthlyReset = lazy(() => import('./pages/MonthlyReset'))
import ErrorBoundary from './components/ErrorBoundary'
import { useApp } from './context/AppContext'

/**
 * SmartHome — redirects to /today if morning not done (before 2 PM),
 * otherwise shows Dashboard. Uses <Navigate> so URL changes properly
 * and the user can still navigate back to Dashboard via BottomNav.
 *
 * For brand-new users (< 3 mornings), ALWAYS redirect to /today
 * even after 2 PM to keep them focused and avoid dashboard overwhelm.
 */
function SmartHome() {
  const { state } = useApp()
  const hour = new Date().getHours()
  const morningCount = (state.morningLog || []).length

  // New users (< 3 mornings) → always go to focused /today page
  if (morningCount < 3) {
    return <Navigate to="/today" replace />
  }
  // Redirect to /today before 2pm if morning ritual not yet completed
  if (!state.morningDone && hour < 14) {
    return <Navigate to="/today" replace />
  }
  return <Dashboard />
}

function AppRoutes() {
  const { currentUser } = useAuth()
  // hasData: use backend's flag if available, otherwise fall back to token check
  const hasData = localStorage.getItem('upw-hasData') === '1' || !!localStorage.getItem('upw-token')

  if (!currentUser) return <LoginPage />

  return (
    <LangProvider>
      <ToastProvider>
      <AppProvider userId={currentUser.id} hasData={hasData}>
        <NotificationSetup />
        <MessageModal />
        <IdentityReinforcement />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}><Routes>
            <Route path="/"        element={<SmartHome />}       />
            <Route path="/dashboard" element={<Dashboard />}     />
            <Route path="/morning" element={<MorningRitual />}   />
            <Route path="/state"   element={<StateManagement />} />
            <Route path="/goals"   element={<Goals />}           />
            <Route path="/wheel"   element={<WheelOfLife />}     />
            <Route path="/beliefs" element={<Beliefs />}         />
            <Route path="/energy"  element={<EnergyChallenge />} />
            <Route path="/evening" element={<EveningRitual />}   />
            <Route path="/library"   element={<Library />}          />
            <Route path="/business"  element={currentUser.role === 'admin' ? <BusinessMastery /> : <Navigate to="/" />} />
            <Route path="/destiny"   element={<DateWithDestiny />}  />
            <Route path="/weekly"    element={<WeeklyReview />}     />
            <Route path="/freedom"   element={<FinancialFreedom />} />
            <Route path="/power30"   element={<PersonalPower />}    />
            <Route path="/fear"      element={<FearToFpower />}     />
            <Route path="/time"          element={<TimeOfLife />}          />
            <Route path="/wins"          element={<DailyWins />}           />
            <Route path="/letters"       element={<LetterToSelf />}        />
            <Route path="/modeling"      element={<ModelingExcellence />}  />
            <Route path="/relationships" element={<RelationshipMastery />} />
            <Route path="/protocol"      element={<EnergyProtocol />}      />
            <Route path="/challenge"     element={<DailyChallenge />}      />
            <Route path="/stats"         element={<Statistics />}          />
            <Route
              path="/scaling"
              element={currentUser.role === 'admin' ? <ScalingUp /> : <Navigate to="/" />}
            />
            <Route
              path="/lifebook"
              element={currentUser.role === 'admin' ? <Lifebook /> : <Navigate to="/" />}
            />
            <Route path="/gratitude"   element={<GratitudeJournal />} />
            <Route path="/habits"      element={<HabitTracker />}     />
            <Route path="/reading"     element={<ReadingLog />}        />
            <Route path="/vision"      element={<VisionBoard />}       />
            <Route path="/sleep"       element={<SleepTracker />}      />
            <Route path="/achievements" element={<Achievements />}     />
            <Route
              path="/students"
              element={currentUser.role === 'admin' ? <StudentProgress /> : <Navigate to="/" />}
            />
            <Route
              path="/coach-messages"
              element={currentUser.role === 'admin' ? <CoachMessages /> : <Navigate to="/" />}
            />
            <Route path="/today"          element={<TodayPage />}       />
            <Route path="/baseline"       element={<BaselinePage />}       />
            <Route path="/insights"       element={<InsightsPage />}       />
            <Route path="/commitment"     element={<CommitmentPage />}     />
            <Route path="/group-challenge" element={<GroupChallengePage />} />
            <Route path="/my-summary"     element={<MyWeeklySummary />}    />
            <Route path="/biz-scorecard" element={<BusinessScorecard />} />
            <Route path="/sprint90"      element={<Sprint90 />}          />
            <Route path="/power-hour"    element={<PowerHour />}         />
            <Route path="/decisions"     element={<DecisionJournal />}   />
            <Route path="/skills"        element={<SkillStack />}        />
            <Route path="/network"       element={<NetworkTracker />}    />
            <Route path="/pipeline"        element={<SalesPipeline />}     />
            <Route path="/biz-dashboard"   element={<BizDashboard />}      />
            <Route path="/avatar"          element={<CustomerAvatar />}    />
            <Route path="/content"         element={<ContentTracker />}    />
            <Route path="/six-needs"          element={<SixHumanNeeds />}          />
            <Route path="/nac"                element={<NACProcess />}             />
            <Route path="/compelling-future"  element={<CompellingFuture />}       />
            <Route path="/values"             element={<ValuesHierarchy />}         />
            <Route path="/incantations"       element={<Incantations />}           />
            <Route path="/transformation"     element={<TransformationDashboard />} />
            <Route path="/upw-program"        element={<UPWProgram />}             />
            <Route path="/celebration"        element={<CelebrationRituals />}     />
            <Route path="/life-story"         element={<LifeStoryReframing />}     />
            <Route path="/emergency"          element={<EmergencyToolkit />}       />
            <Route path="/weekly-pulse"       element={<WeeklyPulse />}            />
            <Route path="/monthly-reset"      element={<MonthlyReset />}           />
            <Route path="/videos"            element={<VideoLibrary />}           />
            <Route
              path="/weekly-report"
              element={currentUser.role === 'admin' ? <WeeklyReportPage /> : <Navigate to="/" />}
            />
            <Route
              path="/command-center"
              element={currentUser.role === 'admin' ? <CommandCenter /> : <Navigate to="/" />}
            />
            <Route
              path="/coach-prep"
              element={currentUser.role === 'admin' ? <CoachPrep /> : <Navigate to="/" />}
            />
            <Route
              path="/admin"
              element={currentUser.role === 'admin' ? <AdminPage /> : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes></Suspense>
        </BrowserRouter>
      </AppProvider>
      </ToastProvider>
    </LangProvider>
  )
}


// Loading indicator shown while lazy-loaded route chunks are fetched
function RouteFallback() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#090909', color: '#c9a84c'
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid rgba(201,168,76,0.2)',
        borderTopColor: '#c9a84c',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  )
}
