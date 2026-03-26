export default function Card({ title, subtitle, bgColor, desc }) {
    return (
        <div className="flex flex-col items-center gap-4 rounded-[32px] bg-[#121212] p-4 cursor-pointer hover:bg-[#202224] transition-colors">
            <div className="flex h-[80px] w-full items-center justify-center rounded-full" style={{ backgroundColor: bgColor }}>
                <h1 className="text-xl font-bold text-white">{title}</h1>
            </div>
            <span className="font-semibold text-white pb-2">{subtitle}</span>
            <span className="text-xs text-[#888] leading-snug text-center">{desc}</span>
        </div>
    );
}