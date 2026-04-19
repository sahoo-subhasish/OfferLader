import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

export default function LogOutBtn({ isMinimized }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  
  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

  return (
    <div className={`relative flex-shrink-0 w-full ${isMinimized ? 'px-0' : 'px-2'}`}>
      <button
        onClick={handleLogout} 
        title="Logout"
        className={`flex flex-row items-center gap-4 w-full py-3 rounded-xl transition-all group text-[#888] hover:bg-[#1a1a1a] hover:text-white ${isMinimized ? 'justify-center px-0' : 'px-4'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        {!isMinimized && <span className="text-sm font-medium transition-colors">
          Logout
        </span>}
      </button>
    </div>
  );
}