import { NavLink } from "react-router-dom"

export default function CompFundBtn() {
    return (<NavLink to="/computerFundamentals" className="flex flex-col items-center gap-1 group text-center">
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
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                      <rect x="9" y="9" width="6" height="6"></rect>
                      <line x1="9" y1="1" x2="9" y2="4"></line>
                      <line x1="15" y1="1" x2="15" y2="4"></line>
                      <line x1="9" y1="20" x2="9" y2="23"></line>
                      <line x1="15" y1="20" x2="15" y2="23"></line>
                      <line x1="20" y1="9" x2="23" y2="9"></line>
                      <line x1="20" y1="14" x2="23" y2="14"></line>
                      <line x1="1" y1="9" x2="4" y2="9"></line>
                      <line x1="1" y1="14" x2="4" y2="14"></line>
                    </svg>
                </div>
                <span className={`text-[10px] font-medium transition-colors leading-tight ${isActive ? 'text-white' : 'text-[#888] group-hover:text-white'}`}>CS<br/>Fund.</span>
            </>
        )}
    </NavLink>)
}
