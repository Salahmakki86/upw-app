import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { LangProvider } from './context/LangContext'
import NotificationSetup from './components/NotificationSetup'
import MessageModal from './components/MessageModal'
import { ToastProvider } from './context/ToastContext'

import LoginPage    from './pages/LoginPage'
import AdminPage    from './pages/AdminPage'
import Dashboard    from './pages/Dashboard'
import MorningRitual   from './pages/MorningRitual'
import StateManagement from './pages/StateManagement'
import Goals           from './pages/Goals'
import WheelOfLife     from './pages/WheelOfLife'
import Beliefs         from './pages/Beliefs'
import EnergyChallenge from './pages/EnergyChallenge'
import EveningRitual   from './pages/EveningRitual'
import Library         from './pages/Library'
import BusinessMastery   from './pages/BusinessMastery'
import DateWithDestiny   from './pages/DateWithDestiny'
import WeeklyReview      from './pages/WeeklyReview'
import FinancialFreedom  from './pages/FinancialFreedom'
import PersonalPower     from './pages/PersonalPower'
import FearToFpower      from './pages/FearToFpower'
import TimeOfLife        from './pages/TimeOfLife'
import DailyWins         from './pages/DailyWins'
import LetterToSelf      from './pages/LetterToSelf'
import ModelingExcellence from './pages/ModelingExcellence'
import RelationshipMastery from './pages/RelationshipMastery'
import EnergyProtocol    from './pages/EnergyProtocol'
import DailyChallenge    from './pages/DailyChallenge'
import Statistics        from './pages/Statistics'
import ScalingUp        from './pages/ScalingUp'
import Lifebook         from './pages/Lifebook'
import GratitudeJournal from './pages/GratitudeJournal'
import HabitTracker     from './pages/HabitTracker'
import ReadingLog       from './pages/ReadingLog'
import VisionBoard      from './pages/VisionBoard'
import SleepTracker     from './pages/SleepTracker'
import Achievements     from './pages/Achievements'
import StudentProgress  from './pages/StudentProgress'
import CoachMessages    from './pages/CoachMessages'
import CommandCenter    from './pages/CommandCenter'
import CoachPrep        from './pages/CoachPrep'
import TodayPage        from './pages/TodayPage'
import BaselinePage     from './pages/BaselinePage'
import InsightsPage     from './pages/InsightsPage'
import CommitmentPage   from './pages/CommitmentPage'
import GroupChallengePage from './pages/GroupChallengePage'
import WeeklyReportPage from './pages/WeeklyReportPage'
import MyWeeklySummary from './pages/MyWeeklySummary'
import BusinessScorecard from './pages/BusinessScorecard'
import Sprint90 from './pages/Sprint90'
import PowerHour from './pages/PowerHour'
import DecisionJournal from './pages/DecisionJournal'
import SkillStack from './pages/SkillStack'
import NetworkTracker from './pages/NetworkTracker'
import SalesPipeline from './pages/SalesPipeline'
import BizDashboard from './pages/BizDashboard'
import CustomerAvatar from './pages/CustomerAvatar'
import ContentTracker from './pages/ContentTracker'
import SixHumanNeeds      from './pages/SixHumanNeeds'
import NACProcess         from './pages/NACProcess'
import CompellingFuture   from './pages/CompellingFuture'
import ValuesHierarchy    from './pages/ValuesHierarchy'
import Incantations       from './pages/Incantations'
import TransformationDashboard from './pages/TransformationDashboard'
import UPWProgram from './pages/UPWProgram'
import CelebrationRituals from './pages/CelebrationRituals'
import LifeStoryReframing from './pages/LifeStoryReframing'
import EmergencyToolkit from './pages/EmergencyToolkit'
import VideoLibrary from './pages/VideoLibrary'
import WeeklyPulse from './pages/WeeklyPulse'
import MonthlyReset from './pages/MonthlyReset'
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
  // hasData flag is stored after login to know if backend already has state
  const hasData = !!localStorage.getItem('upw-token')

  if (!currentUser) return <LoginPage />

  return (
    <LangProvider>
      <ToastProvider>
      <AppProvider userId={currentUser.id} hasData={hasData}>
        <NotificationSetup />
        <MessageModal />
        <BrowserRouter>
          <Routes>
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
          </Routes>
        </BrowserRouter>
      </AppProvider>
      </ToastProvider>
    </LangProvider>
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
