import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { LangProvider } from './context/LangContext'

import Dashboard       from './pages/Dashboard'
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

export default function App() {
  return (
    <LangProvider>
      <AppProvider>
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
            <Route path="/business"  element={<BusinessMastery />}  />
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
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </LangProvider>
  )
}
