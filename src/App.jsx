import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { LangProvider } from './context/LangContext'
import NotificationSetup from './components/NotificationSetup'
import MessageModal from './components/MessageModal'

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
import TodayPage        from './pages/TodayPage'
import BaselinePage     from './pages/BaselinePage'
import InsightsPage     from './pages/InsightsPage'
import CommitmentPage   from './pages/CommitmentPage'
import GroupChallengePage from './pages/GroupChallengePage'
import WeeklyReportPage from './pages/WeeklyReportPage'

function AppRoutes() {
  const { currentUser } = useAuth()
  // hasData flag is stored after login to know if backend already has state
  const hasData = !!localStorage.getItem('upw-token')

  if (!currentUser) return <LoginPage />

  return (
    <LangProvider>
      <AppProvider userId={currentUser.id} hasData={hasData}>
        <NotificationSetup />
        <MessageModal />
        <BrowserRouter>
          <Routes>
            <Route path="/"        element={<Dashboard />}       />
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
            <Route path="/today"          element={<TodayPage />}          />
            <Route path="/baseline"       element={<BaselinePage />}       />
            <Route path="/insights"       element={<InsightsPage />}       />
            <Route path="/commitment"     element={<CommitmentPage />}     />
            <Route path="/group-challenge" element={<GroupChallengePage />} />
            <Route
              path="/weekly-report"
              element={currentUser.role === 'admin' ? <WeeklyReportPage /> : <Navigate to="/" />}
            />
            <Route
              path="/admin"
              element={currentUser.role === 'admin' ? <AdminPage /> : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </LangProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
