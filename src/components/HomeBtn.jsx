import { NavLink } from "react-router-dom"

export default function HomeBtn() { 
    return (<NavLink to="/Home" className="flex flex-col items-center gap-1 group">
            {({ isActive }) => (
                <>
                  <div className={`rounded-xl p-2.5 transition-all group-hover:bg-[#2a2a2a] ${isActive ? 'border border-[#333] bg-[#222] text-white' : 'text-[#888]'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-white' : 'text-[#888] group-hover:text-white'}`}>Home</span>
                </>
              )}
          </NavLink>)
}