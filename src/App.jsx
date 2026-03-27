import React from 'react';
import LandingPage from './components/LandingPage/LandingPage';
import LogOutBtn from './components/LoginBtn';
import HomeBtn from './components/HomeBtn';
import ContestBtn from './components/ContestBtn';
import Home from './components/Home/Home';
import Contests from './components/Contests/Contests';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import ProblemExplorer from './components/ProblemExplorer';
import { AllTierData } from './Data/index';
import Login from './components/Login/Login';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#0E0E0E] text-white font-sans overflow-hidden">

      {/* Sidebar Section */}
      <aside className="flex w-[80px] flex-col items-center border-r border-[#2a2a2a] bg-[#141414] py-6 z-10 flex-shrink-0">

        {/* Logo */}
        <div className="mb-10 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-[3px] border-white bg-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]"></div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col items-center gap-6 w-full">

          <HomeBtn />
          <ContestBtn />
        </div>

        <LogOutBtn />
      </aside>

      <main className="flex-1 bg-[#111111] p-8 overflow-y-auto">

        <div className="w-full flex flex-col gap-10">
          <Outlet />
        </div>
      </main>
    </div>

      )
};

      function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/basic" element={<ProblemExplorer problemSet={AllTierData.basic.data} infoIndex={AllTierData.basic.infoIndex} />} />
          <Route path="/tier5" element={<ProblemExplorer problemSet={AllTierData.tier5.data} infoIndex={AllTierData.tier5.infoIndex} />} />
          <Route path="/tier4" element={<ProblemExplorer problemSet={AllTierData.tier4.data} infoIndex={AllTierData.tier4.infoIndex} />} />
          <Route path="/tier3" element={<ProblemExplorer problemSet={AllTierData.tier3.data} infoIndex={AllTierData.tier3.infoIndex} />} />
          <Route path="/tier2" element={<ProblemExplorer problemSet={AllTierData.tier2.data} infoIndex={AllTierData.tier2.infoIndex} />} />
          <Route path="/tier1" element={<ProblemExplorer problemSet={AllTierData.tier1.data} infoIndex={AllTierData.tier1.infoIndex} />} />
          <Route path="/master" element={<ProblemExplorer problemSet={AllTierData.master.data} infoIndex={AllTierData.master.infoIndex} />} />
        </Route>
        </Routes>
    </BrowserRouter >
  );
}

export default App;