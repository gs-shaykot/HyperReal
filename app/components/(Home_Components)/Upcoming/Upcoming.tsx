import LaunchCountdown from '@/app/components/(Home_Components)/Upcoming/CustomCountdown';
import React from 'react'

export const Upcoming = () => {
    let product_name = "VOID RUNNER V3";
    const launchDate = "2026-04-29T00:00:00";
    
    return (
        <section className='w-full py-10 bg-second flex items-center justify-center'>
            <div className='max-w-7xl h-full mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-5 '>
                <div className='flex flex-col items-start justify-center space-y-3'>
                    <div className='w-36 px-2 bg-black text-white text-xs flex items-center justify-between'>
                        <span className='w-2 h-2 rounded-full bg-red-500 animate-pulse' />
                        <h1>UPCOMING RELEASE</h1>
                    </div>

                    <h1 className='text-8xl font-bold font-inter!'>
                        {
                            product_name.split(" ").map((word, idx) => (
                                idx === product_name.split(" ").length - 1
                                    ? (
                                        <span key={idx} className="block  stroke-second italic">
                                            {word.toUpperCase()}
                                        </span>
                                    )
                                    : (
                                        <span key={idx} className={`block text-zinc-900`}>
                                            {word.toUpperCase()}
                                        </span>
                                    )
                            ))
                        }
                    </h1>
                    <p className='w-10/12 light:text-black text-zinc-900 font-bold'>
                        The next iteration of urban mobility. Featuring adaptive bio-mesh and enhanced kinetic absorption. Drops globally next week.
                    </p>
                    <button className="cursor-pointer bg-black text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-all hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none">SET REMINDER</button>
                </div>
                <div className='flex items-center justify-center'>
                    <LaunchCountdown targetDate={launchDate} />
                </div>
            </div>
        </section>
    )
}
