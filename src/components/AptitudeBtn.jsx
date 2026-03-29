import { NavLink } from "react-router-dom"

export default function AptitudeBtn() {
    return (<NavLink to="/aptitude" className="flex flex-col items-center gap-1 group text-center">
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
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                </div>
                <span className={`text-[10px] font-medium transition-colors leading-tight ${isActive ? 'text-white' : 'text-[#888] group-hover:text-white'}`}>Aptitude</span>
            </>
        )}
    </NavLink>)
}
