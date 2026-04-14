import { NavLink } from "react-router-dom"

export default function DSAVsDEVBtn() {
    return (<NavLink to="/dsaVsDev" className={({ isActive }) => `flex flex-row items-center gap-4 w-full px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-[#222] border border-[#333] text-white' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m7 15 3-3-3-3" />
            <path d="M13 15h4" />
        </svg>
        <span className="text-sm font-medium">DSA vs DEV</span>
    </NavLink>)
}
