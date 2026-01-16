import { ArrowRight } from 'lucide-react'
import React from 'react'

export const Banner = () => {
    return (
        <div className="relative bg-main/90 overflow-hidden border-b border-zinc-800">
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: ` linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px) `,
                    backgroundSize: '40px 40px'
                }}
            />


            <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8">
                <p className="text-second border border-zinc-800 p-2 text-sm font-mono mb-8 tracking-wider">
                    • SYSTEM ONLINE // V.4.0
                </p>

                <div className='flex flex-col justify-center items-center'>
                    <h1 className="text-center mb-5 font-extrabold">
                        <span className="block text-6xl md:text-8xl  italic text-white">
                            DEFY THE
                        </span>
                        <span className="block text-6xl md:text-8xl  italic text-second stroke-text">
                            ORDINARY
                        </span>
                    </h1>
                    <p className='w-10/12 md:w-4/12 text-center mb-8'>The new collection features technical fabrics, oversized silhouettes, and experimental dyes designed for the urban nomad.</p>
                </div>

                <div className='flex flex-col md:flex-row justify-center items-center gap-3'>
                    <button className='group relative flex btn bg-second text-black font-bold shadow-none border-0 rounded-none hover:scale-105 hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-500 items-center gap-2'>
                        <span className="flex items-center gap-2">
                            SHOP THE DROP
                            <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                    </button>
                    <button className='btn shadow-none rounded-none bg-transparent hover:bg-white hover:text-black text-white border-2 hover:scale-105 transition-all duration-500'>
                        VIEW LOOKBOOK
                        <ArrowRight className="" />
                    </button>
                </div>
            </div>

        </div>
    )
}
