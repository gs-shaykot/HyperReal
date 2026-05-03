import localFont from 'next/font/local';

const hudson = localFont({
    src: "../../../fonts/Hudson NY Press.woff",
    display: "swap",
})

const loading = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 text-white pb-20">
            <h2 className={`${hudson.className} text-5xl font-bold italic py-6 tracking-wide`}>
                CARGO <span className="text-second">HOLD</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6 space-y-4">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-32 bg-[#1a1a1a] border border-zinc-800 animate-pulse"
                        />
                    ))}
                </div>

                <div className="md:col-span-6 h-96 bg-[#1a1a1a] border border-zinc-800 animate-pulse" />
            </div>
        </div>
    )
}

export default loading
