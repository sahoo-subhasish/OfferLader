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

const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#0E0E0E] text-white font-sans overflow-hidden">
      {/* Sidebar Section */}
      <aside className="flex w-[80px] flex-col items-center border-r border-[#2a2a2a] bg-[#141414] py-6 z-10 flex-shrink-0">
        <div className="mb-10 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-[3px] border-white bg-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]"></div>
        </div>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;