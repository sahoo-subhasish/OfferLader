import { NavLink } from "react-router-dom"

export default function DSAVsDEVBtn() {
    return (<NavLink to="/dsaVsDev" className="flex flex-col items-center gap-1 group text-center">
        {({ isActive }) => (
            <>
                <div className={`rounded-xl p-2.5 transition-all group-hover:bg-[#2a2a2a] ${isActive ? 'border border-[#333] bg-[#222] text-white' : 'text-[#888]'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m7 15 3-3-3-3" />
              <path d="M13 15h4" />
            </svg>
                </div>
                <span className={`text-[10px] font-medium transition-colors leading-tight ${isActive ? 'text-white' : 'text-[#888] group-hover:text-white'}`}>DSA vs<br/>DEV</span>
            </>
        )}
    </NavLink>)
}
