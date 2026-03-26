export default function HomeBtn() { 
    return (
        <button className="flex flex-col items-center gap-1 group">
                    <div className="rounded-xl p-2.5 text-[#888] transition-all group-hover:bg-[#222] group-hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                    </div>
                    <span className="text-[10px] font-medium text-[#888] group-hover:text-white transition-colors">Contests</span>
                  </button>
    )
}