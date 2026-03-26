import React, { use } from 'react';
import { Link,useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const handleGoogleLogin = () => {
    
    navigate('/home');
  };

  const handleLinkedInLogin = () => {
    
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0E0E0E] text-white font-sans w-full">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#48D2A0]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="glass-card w-full max-w-[420px] p-10 sm:p-12 rounded-[40px] relative z-10 flex flex-col items-center text-center shadow-2xl">

        <Link 
          to="/" 
          className="w-16 h-16 rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] mb-8 hover:scale-105 transition-transform flex items-center justify-center bg-transparent"
          aria-label="Back to home"
        ></Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-gradient">Welcome Back</h1>
        <p className="text-[#888] text-sm font-medium mb-10">Sign in to continue your journey to mastery.</p>

        <div className="w-full flex flex-col gap-4">

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black py-4 px-6 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={handleLinkedInLogin}
            className="w-full bg-[#1a1c1d] border border-[#2a2a2a] hover:border-[#0A66C2] text-white py-4 px-6 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2" className="text-[#0A66C2]"/>
            </svg>
            Continue with LinkedIn
          </button>

        </div>

        <p className="mt-10 text-[#555] text-xs font-medium max-w-[260px] leading-relaxed">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-[#888] hover:text-white underline decoration-[#444] underline-offset-2 transition-colors">Terms of Service</Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-[#888] hover:text-white underline decoration-[#444] underline-offset-2 transition-colors">Privacy Policy</Link>.
        </p>

      </div>
    </div>
  );
}