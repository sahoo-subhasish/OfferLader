import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen font-sans bg-[#0E0E0E] text-white overflow-x-hidden">

      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 hero-gradient -mt-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] sm:w-[800px] h-[300px] sm:h-[400px] bg-white/5 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="z-10 text-center space-y-6 sm:space-y-8 max-w-4xl mt-10">
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-gradient leading-tight">
            MASTER THE <br /> OFFER LADDER.
          </h1>
          
          <p className="text-[#888] text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-2">
            A structured roadmap for technical interviews. Track your progress from Basic fundamentals to Master-level algorithms with curated problem sets.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 w-full px-4 sm:px-0">
            <Link to="/login" className="w-full sm:w-auto bg-white text-black px-8 sm:px-10 py-4 rounded-2xl font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              START SOLVING
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

          <div className="glass-card md:col-span-2 p-6 sm:p-8 md:p-10 rounded-[28px] md:rounded-[40px] flex flex-col justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Progress Visualization</h2>
              <p className="text-[#888] text-sm sm:text-base max-w-sm">Every Tier comes with dedicated progress bars. Monitor your Easy, Medium, and Hard problem counts in a clean, high-performance interface.</p>
            </div>
            <div className="mt-8 sm:mt-12 flex items-end gap-4 sm:gap-6">
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="h-2 w-full bg-[#1a1c1d] rounded-full border border-[#2a2a2a] overflow-hidden">
                  <div className="h-full w-[80%] bg-[#48D2A0] shadow-[0_0_10px_#48D2A033]"></div>
                </div>
                <div className="h-2 w-[60%] bg-[#1a1c1d] rounded-full border border-[#2a2a2a] overflow-hidden">
                  <div className="h-full w-full bg-[#F6B846] shadow-[0_0_10px_#F6B84633]"></div>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white">84%</div>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 md:p-10 rounded-[28px] md:rounded-[40px] flex flex-col justify-center items-center text-center group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-3xl bg-[#FF716C]/10 border border-[#FF716C]/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="#FF716C" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-white transition-colors">Master Set</h3>
            <p className="text-[#666] text-xs sm:text-sm leading-relaxed">Top-tier problems for advanced engineers targeting MAANG.</p>
          </div>

          <div className="glass-card md:col-span-3 p-6 sm:p-8 md:p-10 rounded-[28px] md:rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold">Comprehensive Roadmap</h3>
              <p className="text-[#666] text-sm sm:text-base">Six structured tiers covering Arrays, Dynamic Programming, and Graphs.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full md:w-auto">
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#1a1c1d] border border-[#2a2a2a] text-[10px] sm:text-xs font-bold text-[#888] hover:text-white hover:border-[#444] transition-colors flex-1 sm:flex-none text-center">TIER 1</div>
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#1a1c1d] border border-[#2a2a2a] text-[10px] sm:text-xs font-bold text-[#888] hover:text-white hover:border-[#444] transition-colors flex-1 sm:flex-none text-center">TIER 2</div>
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#1a1c1d] border border-[#2a2a2a] text-[10px] sm:text-xs font-bold text-[#888] hover:text-white hover:border-[#444] transition-colors flex-1 sm:flex-none text-center">TIER 3</div>
              <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white text-black text-[10px] sm:text-xs font-bold hover:bg-gray-200 transition-colors flex-1 sm:flex-none text-center">MORE</div>
            </div>
          </div>

        </div>
      </section>

      <footer className="py-8 sm:py-12 border-t border-[#2a2a2a] text-center">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-[3px] border-white mx-auto mb-4 sm:mb-6 shadow-[0_0_12px_rgba(255,255,255,0.6)]"></div>
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[#444] px-4">© 2026 OfferLader. All Rights Reserved.</p>
      </footer>
    </div>
  );
}