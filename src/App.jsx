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


const DashboardLayout = () => {
  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full bg-[#0E0E0E] text-white font-sans overflow-hidden">
      {/* Sidebar Section */}
      <aside className="flex flex-row md:flex-col items-center justify-between border-t md:border-t-0 md:border-r border-[#2a2a2a] bg-[#141414] py-2 md:py-6 z-10 flex-shrink-0 h-[75px] md:h-full w-full md:w-[80px]">
        <div className="hidden md:flex mb-10 items-center justify-center">
          <div className="w-6 h-6 rounded-full border-[3px] border-white bg-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]"></div>
        </div>
        
        {/* Scrollable Navigation section */}
        <div className="flex flex-row md:flex-col items-center md:gap-4 w-full flex-1 overflow-x-auto md:overflow-x-hidden overflow-y-hidden md:overflow-y-auto px-4 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="flex flex-row md:flex-col items-center gap-4 w-max md:w-full flex-shrink-0 md:pb-6 pr-4 md:pr-0">
            <HomeBtn />
            <DSABtn />
            <DSAVsDEVBtn />
            <CompFundBtn />
            <AptitudeBtn />
            <CommBtn />
            <ContestBtn />
            <LogOutBtn />
          </div>
        </div>
      </aside>

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
          <Route path="/basic" element={<ProblemExplorer problemSet={AllTierData.basic.data} infoIndex={AllTierData.basic.infoIndex} />} />
          <Route path="/tier5" element={<ProblemExplorer problemSet={AllTierData.tier5.data} infoIndex={AllTierData.tier5.infoIndex} />} />
          <Route path="/tier4" element={<ProblemExplorer problemSet={AllTierData.tier4.data} infoIndex={AllTierData.tier4.infoIndex} />} />
          <Route path="/tier3" element={<ProblemExplorer problemSet={AllTierData.tier3.data} infoIndex={AllTierData.tier3.infoIndex} />} />
          <Route path="/tier2" element={<ProblemExplorer problemSet={AllTierData.tier2.data} infoIndex={AllTierData.tier2.infoIndex} />} />
          <Route path="/tier1" element={<ProblemExplorer problemSet={AllTierData.tier1.data} infoIndex={AllTierData.tier1.infoIndex} />} />
          <Route path="/master" element={<ProblemExplorer problemSet={AllTierData.master.data} infoIndex={AllTierData.master.infoIndex} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;