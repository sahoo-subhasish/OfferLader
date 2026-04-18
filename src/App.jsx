import React from 'react';
import { BrowserRouter, Outlet, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AllTierData } from './Data/index';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import Contests from './components/Contests/Contests';
import Blogs from './components/Blogs/Blogs';
import BlogDetail from './components/Blogs/BlogDetail';
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
import DSAOutlet from './components/DSA/DSAOutlet';
import ProfileSetup from './components/ProfileSetup/ProfileSetup';
import AdminDashboard from './components/Admin/pages/AdminDashboard';
import AdminManagement from './components/Admin/pages/AdminManagement';
import AdminContests from './components/Admin/pages/AdminContests';
import AdminBlogs from './components/Admin/pages/AdminBlogs';
import { NavLink } from 'react-router-dom';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { user } = useAuth();

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
          
          {user?.role === 'admin' && (
            <div className="mt-4 flex flex-col gap-2">
              <div className="px-4 py-2 text-xs font-bold text-[#555] uppercase tracking-wider">Admin Area</div>
              
              <NavLink to="/admin" end className={({ isActive }) => `flex flex-row items-center gap-4 w-full px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-[#222] border border-[#333] text-white' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                <span className="text-sm font-medium">Dashboard</span>
              </NavLink>

              <NavLink to="/admin/managers" className={({ isActive }) => `flex flex-row items-center gap-4 w-full px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-[#222] border border-[#333] text-white' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span className="text-sm font-medium">Managers</span>
              </NavLink>

              <NavLink to="/admin/contests" className={({ isActive }) => `flex flex-row items-center gap-4 w-full px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-[#222] border border-[#333] text-white' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                <span className="text-sm font-medium">Manage Contests</span>
              </NavLink>

              <NavLink to="/admin/blogs" className={({ isActive }) => `flex flex-row items-center gap-4 w-full px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-[#222] border border-[#333] text-white' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span className="text-sm font-medium">Manage Blogs</span>
              </NavLink>
            </div>
          )}
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

        <Route
          path="/profile-setup"
          element={user && user.isNewUser ? <ProfileSetup /> : <Navigate to={user ? "/home" : "/login"} replace />}
        />

        <Route element={user ? (user.isNewUser ? <Navigate to="/profile-setup" replace /> : <DashboardLayout />) : <Navigate to="/login" replace />}>
          <Route path="/home" element={<Home />} />
          <Route path="/DSA" element={<DSAOutlet />} >

            <Route index element={<DSA />} />

            <Route path="basic" element={<ProblemExplorer problemSet={AllTierData.basic.data} infoIndex={AllTierData.basic.infoIndex} info={instructions[0]} />} />
            <Route path="tier5" element={<ProblemExplorer problemSet={AllTierData.tier5.data} infoIndex={AllTierData.tier5.infoIndex} info={instructions[1]} />} />
            <Route path="tier4" element={<ProblemExplorer problemSet={AllTierData.tier4.data} infoIndex={AllTierData.tier4.infoIndex} info={instructions[2]} />} />
            <Route path="tier3" element={<ProblemExplorer problemSet={AllTierData.tier3.data} infoIndex={AllTierData.tier3.infoIndex} info={instructions[3]} />} />
            <Route path="tier2" element={<ProblemExplorer problemSet={AllTierData.tier2.data} infoIndex={AllTierData.tier2.infoIndex} info={instructions[4]} />} />
            <Route path="tier1" element={<ProblemExplorer problemSet={AllTierData.tier1.data} infoIndex={AllTierData.tier1.infoIndex} info={instructions[5]} />} />
            <Route path="master" element={<ProblemExplorer problemSet={AllTierData.master.data} infoIndex={AllTierData.master.infoIndex} info={instructions[6]} />} />

          </Route>
          <Route path="/contests" element={<Contests />} />
          <Route path="/dsaVsDev" element={<Contests />} />
          <Route path="/computerFundamentals" element={<CSFunds />} />
          <Route path="/effectiveCommunication" element={<Contests />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          
          {user?.role === 'admin' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/managers" element={<AdminManagement />} />
              <Route path="/admin/contests" element={<AdminContests />} />
              <Route path="/admin/blogs" element={<AdminBlogs />} />
            </>
          )}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;