import React from 'react';
import LoginBtn from './components/LoginBtn';
import HomeBtn from './components/HomeBtn';
import ContestBtn from './components/ContestBtn';
import Home from './components/Home/Home';
import Contests from './components/Contests/Contests';
import Basic from './components/Basic/Basic';
import Tier5 from './components/T5/Tier5';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
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
        
        <LoginBtn />
      </aside>

      
      <main className="flex-1 bg-[#111111] p-8 overflow-y-auto">
        
        <div className="w-full flex flex-col gap-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/basic" element={<Basic />} />
            <Route path="/tier5" element={<Tier5 />} />
          </Routes>
          

        </div>
      </main>
      
    </div>
    </BrowserRouter>
  );
}

export default App;