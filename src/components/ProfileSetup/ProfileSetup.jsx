import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { useNavigate, useLocation } from 'react-router-dom';

const InputField = ({ icon, label, name, value, onChange, required, placeholder, type = "text" }) => (
  <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
    <label className="text-[10px] sm:text-xs font-semibold text-[#888] uppercase tracking-wider ml-1 flex items-center gap-1">
      {label} {required && <span className="text-[#48D2A0] text-sm sm:text-lg leading-none">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#555] group-focus-within:text-[#48D2A0] transition-colors duration-300">
        {React.cloneElement(icon, { className: "w-4 h-4 sm:w-5 sm:h-5" })}
      </div>
      <input
        required={required}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg sm:rounded-xl pl-9 sm:pl-11 pr-3 py-2.5 sm:py-3.5 text-white text-xs sm:text-sm placeholder-[#333] focus:outline-none focus:border-white focus:ring-1 focus:ring-[#48D2A0]/30 transition-all duration-300 hover:border-[#333] shadow-inner shadow-black/50"
      />
    </div>
  </div>
);

export default function ProfileSetup() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.displayName || '',
    university: user?.university || '',
    batch: user?.batch || '',
    branch: user?.branch || '',
    whatsapp: user?.whatsapp || '',
    vjudgeId: user?.vjudgeId || ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const newUserData = {
        fullName: formData.fullName,
        university: formData.university,
        batch: formData.batch,
        branch: formData.branch,
        whatsapp: formData.whatsapp,
        vjudgeId: formData.vjudgeId,
        email: user.email,
        // Only set these on first-time creation — do NOT overwrite for existing users
        ...(!user.role && { role: "user" }),
        ...(!user.solvedProblems && { solvedProblems: {} }),
        ...(!user.createdAt && { createdAt: new Date().toISOString() }),
      };

      await setDoc(userDocRef, newUserData, { merge: true });

      // Update global context — clear both flags, preserve existing role/solvedProblems
      setUser({ ...user, ...newUserData, isNewUser: false, isProfileIncomplete: false });

      navigate(location.state?.from || '/home');
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-[100dvh] flex items-center justify-center p-0 sm:p-8 relative overflow-hidden bg-[#050505] text-white font-sans w-full">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#48D2A0]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#1a1a1a]/40 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 pointer-events-none"></div>

      <div className="w-full h-full sm:h-auto max-w-[850px] relative z-10 flex flex-col md:flex-row sm:shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:border border-[#222] bg-[#0E0E0E]/80 backdrop-blur-xl sm:rounded-[32px] overflow-hidden">

        {/* Left Side - Welcome Panel (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-[40%] bg-gradient-to-br from-[#141414] to-[#0A0A0A] p-8 md:p-10 flex-col justify-between border-r border-[#222] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#48D2A0]/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-[#333] flex items-center justify-center mb-8 shadow-inner shadow-black/50">
              <div className="w-5 h-5 rounded-full border-[3px] border-white bg-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3 text-white leading-tight">
              Welcome to <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#888]">Algo2Offer</span>
            </h1>
            <p className="text-[#888] text-sm leading-relaxed mt-4">
              Complete your profile setup to unlock full access.
            </p>
          </div>

          <div className="mt-12 md:mt-0">
            <div className="flex items-center gap-3 text-sm text-[#555] font-medium">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#48D2A0] shadow-[0_0_8px_rgba(72,210,160,0.5)]"></div>
              </div>
              <span>Step 1 of 1</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[60%] p-6 sm:p-8 md:p-10 bg-[#111111]/50 flex flex-col justify-center h-full">

          {/* Mobile Header */}
          <div className="md:hidden mb-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#333] flex items-center justify-center mb-3 shadow-inner shadow-black/50">
              <div className="w-4 h-4 rounded-full border-[2px] border-white bg-transparent shadow-[0_0_12px_rgba(255,255,255,0.6)]"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Complete Profile</h1>
            <p className="text-[#888] text-xs mt-1">Unlock full access.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-5 w-full max-w-[400px] md:max-w-none mx-auto">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              <InputField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="John Doe"
                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
              />
              <InputField
                label="University/College"
                name="university"
                value={formData.university}
                onChange={handleChange}
                required
                placeholder="e.g. MIT, Stanford"
                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              <InputField
                label="Batch"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                required
                placeholder="e.g. 2025"
                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
              />
              <InputField
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
                placeholder="e.g. CSE, ECE"
                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              <InputField
                label="Whatsapp Number"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                required
                placeholder="+1 234 567 890"
                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
              />
              <InputField
                label="Vjudge ID"
                name="vjudgeId"
                value={formData.vjudgeId}
                onChange={handleChange}
                required
                placeholder="johndoe"
                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 sm:mt-4 bg-white text-black py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-[#e0e0e0] hover:scale-[1.01] transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Profile...
                </>
              ) : (
                <>
                  Complete Setup
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
