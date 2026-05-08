'use client'
import { ArrowLeft, Lock } from 'lucide-react'
import localFont from 'next/font/local'
import { useState } from 'react'


const hudson = localFont({
    src: "../../../fonts/Hudson NY Press.woff",
    display: "swap",
})



const page = () => {

    const Countries = [
        { name: 'Bangladesh (BDT)', value: 'bdt' },
        { name: 'United States (USD)', value: 'usd' },
        { name: 'United Kingdom (GBP)', value: 'gbp' },
        { name: 'Germany (EUR)', value: 'eur' },
        { name: 'Japan (JPY)', value: 'jpy' },
        { name: 'Australia (AUD)', value: 'aud' },
        { name: 'Canada (CAD)', value: 'cad' },
        { name: 'India (INR)', value: 'inr' },
    ]

    const [selectedCountry, setSelectedCountry] = useState('Bangladesh (BDT)');

    return (
        <div className=' bg-main light:bg-white'>
            <div className="max-w-7xl mx-auto p-4">
                {/* HEADER */}
                <div className='py-8'>
                    <button onClick={() => window.history.back()} className='text-xs flex items-center gap-2 text-zinc-300 light:text-zinc-700 cursor-pointer mb-2'>
                        <ArrowLeft size={18} /> Back to Cargo Hold
                    </button>
                    <h2 className={`${hudson.className} text-5xl light:text-zinc-900`} style={{ wordSpacing: '10px' }}>
                        SECURE <span className="text-second">TRANSFER</span>
                    </h2>
                    <div className='text-xs flex items-center py-3 text-zinc-400 mt-1 w-4/12' style={{ wordSpacing: '5px' }}>
                        <Lock size={16} className='mr-1' />
                        <h3>Encrypted Payment Protocol // 256-BIT</h3>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* RIGHT PANEL */}
                    <div className='md:col-span-8'>
                        <div className='bg-[#0f0f0f] p-6 border border-zinc-800 mb-8'>
                            <h2 className="text-sm tracking-widest text-second mb-6 font-mono">
                                — 01 // DELIVERY COORDINATES
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Full Name */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="JANE DOE"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="USER@GRID.NET"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Address  */}
                                <div className="md:col-span-2">
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="42 NEON ST, SECTOR 7"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="YOUR ORBITAL CITY"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Postal Code */}
                                <div>
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="00000"
                                        className="input w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
                                    />
                                </div>

                                {/* Country (full width) */}
                                <div className="md:col-span-2">
                                    <label className="label label-text text-xs text-gray-400 uppercase">
                                        Delivery Country
                                    </label>

                                    <select
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        className="select w-full bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm"
                                    >
                                        {
                                            Countries.map((country) => (
                                                <option key={country.value} value={country.value} className='hover:bg-second hover:text-zinc-900'>
                                                    {country.name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                            </div>
                        </div>

                        <div className='bg-[#0f0f0f] p-6 border border-zinc-800'>
                            <h2 className="text-sm tracking-widest text-second mb-6 font-mono">
                                — 02 // Payment Gateway
                            </h2>
                        </div>
                    </div>

                    {/* LEFT PANEL */}
                    <div className='md:col-span-4'>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default page