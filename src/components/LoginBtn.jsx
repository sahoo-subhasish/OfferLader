import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

export default function LogOutBtn() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  
  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

  return (
    <div className="mt-auto pb-2 relative">
      <button
        onClick={handleLogout} 
        className="flex flex-col items-center gap-1 group"
      >
        <div className="rounded-full bg-[#2a2a2a] p-2 text-[#888] transition-all group-hover:text-white hover:bg-[#333]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span className="text-[10px] font-medium text-[#888] group-hover:text-white transition-colors">
          Logout
        </span>
      </button>
    </div>
  );
}