import { useState } from "react";

export default function StrategyBtn({ info }) {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    const renderStrategyText = (text) => {
        if (!text) return "No specific strategy defined for this tier yet. Focus on mastering the core patterns identified in the problem set.";
        
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-[#48D2A0] hover:underline transition-all">
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <>
            <button
                onClick={() => setIsOverlayOpen(true)}
                className="w-fit flex items-center gap-2 px-6 py-2 bg-[#1a1c1d] border border-[#2a2a2a] rounded-xl text-sm font-bold hover:border-[#48D2A0] transition-all active:scale-95 text-white"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
                Strategy
            </button>


            {isOverlayOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOverlayOpen(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="glass-card relative z-10 w-full max-w-2xl p-8 rounded-[32px] border border-[#2a2a2a] bg-[#0E0E0E] shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h2 className="text-2xl font-bold text-gradient">{info.title} Strategy</h2>
                            <button
                                onClick={() => setIsOverlayOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="text-[#aaa] leading-relaxed space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            <p className="whitespace-pre-wrap">{renderStrategyText(info.instruction)}</p>
                        </div>
                    </div>
                </div>

            )}
        </>
    )
}