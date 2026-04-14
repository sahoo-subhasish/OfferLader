import { NavLink } from "react-router-dom"

export default function ContestBtn() { 
    return (
        <NavLink to="/contests" className={({ isActive }) => `flex flex-row items-center gap-4 w-full px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-[#222] border border-[#333] text-white' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span className="text-sm font-medium">Contests</span>
        </NavLink>
    )
}