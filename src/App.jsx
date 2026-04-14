import React from 'react';
import { BrowserRouter, Outlet, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AllTierData } from './Data/index';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import Contests from './components/Contests/Contests';
import ProblemExplorer from './components/ProblemExplorer';
import LogOutBtn from './components/LoginBtn';
import HomeBtn from './components/HomeBtn';
import ContestBtn from './components/ContestBtn';
import DSABtn from './components/DSABtn';
import DSAVsDEVBtn from './components/DSAVsDEVBtn';
import CompFundBtn from './components/CompFundBtn';
import AptitudeBtn from './components/AptitudeBtn';
import CommBtn from './components/CommBtn';
import DSA from './components/DSA/DSA';
import CSFunds from './components/CSFunds';
import { instructions } from './Data/Instructions';
import BlogsBtn from './components/BlogsBtn';


const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#0E0E0E] text-white font-sans overflow-hidden relative">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between px-6 border-b border-[#2a2a2a] bg-[#141414] h-[60px] flex-shrink-0 z-50">
        <div className="w-6 h-6 rounded-full border-[3px] border-white bg-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]"></div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-white p-2 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300 ease-in-out
        flex flex-col items-stretch justify-between 
        border-r border-[#2a2a2a] bg-[#141414]
        pt-6 z-40
        absolute md:relative top-[60px] md:top-0 left-0 
        w-full md:w-[260px] h-[calc(100dvh-60px)] md:h-full 
      `}>
        {/* Desktop Logo */}
        <div className="hidden md:flex mb-8 items-center justify-start px-8 gap-3 flex-shrink-0">
          <div className="w-6 h-6 rounded-full border-[3px] border-white bg-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]"></div>
          <span className="text-white font-bold text-lg tracking-wide">OfferLadder</span>
        </div>
        
        {/* Navigation Wrapper */}
        <div 
          className="flex flex-col items-stretch justify-start gap-2 w-full flex-1 overflow-hidden px-4 md:px-4 pt-4 md:pt-0"
          onClickCapture={() => setIsMobileMenuOpen(false)}
        >
          <HomeBtn />
          <DSABtn />
          {/* <DSAVsDEVBtn /> */}
          <CompFundBtn />
          <AptitudeBtn />
          {/* <CommBtn /> */}
          <ContestBtn />
          <BlogsBtn />
        </div>

        {/* Logout fixed at bottom */}
        <hr className="h-px bg-gray-400 border-none opacity-20" />
        <div className="flex-shrink-0 mt-auto pt-3 pb-6 md:pb-4 px-4 w-full" onClickCapture={() => setIsMobileMenuOpen(false)}>
          <LogOutBtn />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#111111] p-4 md:p-8 overflow-y-auto">
        <div className="w-full flex flex-col gap-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0E0E0E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={user ? <Navigate to="/home" replace /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login />}
        />

        <Route element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}>
          <Route path="/home" element={<Contests />} />
          <Route path="/DSA" element={<DSA />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/dsaVsDev" element={<Contests />} />
          <Route path="/computerFundamentals" element={<CSFunds />} />
          <Route path="/aptitude" element={<Contests />} />
          <Route path="/effectiveCommunication" element={<Contests />} />
          <Route path="/blogs" element={<Contests />} />
          <Route path="/basic" element={<ProblemExplorer problemSet={AllTierData.basic.data} infoIndex={AllTierData.basic.infoIndex} info={instructions[0]}/>} />
          <Route path="/tier5" element={<ProblemExplorer problemSet={AllTierData.tier5.data} infoIndex={AllTierData.tier5.infoIndex} info={instructions[1]}/>} />
          <Route path="/tier4" element={<ProblemExplorer problemSet={AllTierData.tier4.data} infoIndex={AllTierData.tier4.infoIndex} info={instructions[2]}/>} />
          <Route path="/tier3" element={<ProblemExplorer problemSet={AllTierData.tier3.data} infoIndex={AllTierData.tier3.infoIndex} info={instructions[3]}/>} />
          <Route path="/tier2" element={<ProblemExplorer problemSet={AllTierData.tier2.data} infoIndex={AllTierData.tier2.infoIndex} info={instructions[4]}/>} />
          <Route path="/tier1" element={<ProblemExplorer problemSet={AllTierData.tier1.data} infoIndex={AllTierData.tier1.infoIndex} info={instructions[5]}/>} />
          <Route path="/master" element={<ProblemExplorer problemSet={AllTierData.master.data} infoIndex={AllTierData.master.infoIndex} info={instructions[6]}/>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;