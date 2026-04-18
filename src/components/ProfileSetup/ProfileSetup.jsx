import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';

export default function ProfileSetup() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    githubId: '',
    linkedinId: '',
    vjudgeId: '',
    leetcodeId: '',
    codeforcesId: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const newUserData = {
        fullName: formData.fullName,
        githubId: formData.githubId,
        linkedinId: formData.linkedinId,
        vjudgeId: formData.vjudgeId,
        leetcodeId: formData.leetcodeId,
        codeforcesId: formData.codeforcesId,
        role: "user",
        solvedProblems: {},
        email: user.email,
        createdAt: new Date().toISOString()
      };

      await setDoc(userDocRef, newUserData);
      
      // Update global context
      setUser({ ...user, ...newUserData, isNewUser: false });
      
      navigate('/home');
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0E0E0E] text-white font-sans w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#48D2A0]/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="glass-card w-full max-w-[500px] p-8 sm:p-10 rounded-[30px] relative z-10 flex flex-col shadow-2xl border border-[#2a2a2a] bg-[#141414]/80 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white text-center">Complete Profile</h1>
        <p className="text-[#888] text-sm font-medium mb-8 text-center">Tell us a bit more about yourself.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-1">Full Name <span className="text-red-500">*</span></label>
            <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#48D2A0] transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-1">GitHub ID <span className="text-red-500">*</span></label>
            <input required type="text" name="githubId" value={formData.githubId} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#48D2A0] transition-colors" placeholder="e.g. octocat" />
          </div>

          <div>
             <label className="block text-sm font-medium text-[#ccc] mb-1">LinkedIn ID <span className="text-red-500">*</span></label>
            <input required type="text" name="linkedinId" value={formData.linkedinId} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#48D2A0] transition-colors" placeholder="e.g. john-doe" />
          </div>

          <div>
             <label className="block text-sm font-medium text-[#ccc] mb-1">Vjudge ID <span className="text-red-500">*</span></label>
            <input required type="text" name="vjudgeId" value={formData.vjudgeId} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#48D2A0] transition-colors" placeholder="e.g. johndoe" />
          </div>

          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#ccc] mb-1">Leetcode ID</label>
              <input type="text" name="leetcodeId" value={formData.leetcodeId} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#48D2A0] transition-colors" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#ccc] mb-1">Codeforces ID</label>
              <input type="text" name="codeforcesId" value={formData.codeforcesId} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#48D2A0] transition-colors" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-white text-black py-4 px-6 rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center"
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
