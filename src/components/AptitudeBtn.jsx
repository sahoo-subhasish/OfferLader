import { NavLink } from "react-router-dom"

export default function AptitudeBtn({ isMinimized }) {
    return (<NavLink to="/aptitude" title="Aptitude" className={({ isActive }) => `flex flex-row items-center gap-4 w-full px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-[#222] border border-[#333] text-white' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'} ${isMinimized ? 'justify-center px-0' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        {!isMinimized && <span className="text-sm font-medium">Aptitude</span>}
    </NavLink>)
}
