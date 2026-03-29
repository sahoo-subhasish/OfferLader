import { NavLink } from "react-router-dom"

export default function CommBtn() {
    return (<NavLink to="/effectiveCommunication" className="flex flex-col items-center gap-1 group text-center">
        {({ isActive }) => (
            <>
                <div className={`rounded-xl p-2.5 transition-all group-hover:bg-[#2a2a2a] ${isActive ? 'border border-[#333] bg-[#222] text-white' : 'text-[#888]'}`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <span className={`text-[10px] font-medium transition-colors leading-tight ${isActive ? 'text-white' : 'text-[#888] group-hover:text-white'}`}><span>Effevtive</span><br/>Communication</span>
            </>
        )}
    </NavLink>)
}
