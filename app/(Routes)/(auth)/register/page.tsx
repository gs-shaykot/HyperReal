import Link from 'next/link';
import React from 'react'

export const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-main/95 px-4">
            <div className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-lg shadow-xl">
                {/* Neon top bar */}
                <div className="absolute top-0 left-0 h-1 w-full bg-second rounded-t-lg" />

                <div className="p-8 pt-10 space-y-3">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide leading-tight">
                            <span className="text-white">NEW</span>{" "}
                            <span className="text-second italic">OPERATIVE</span>
                        </h1>

                        <p className="mt-2 text-sm text-zinc-400">
                            Join the syndicate. Early access to drops and exclusive gear.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-3"> 
                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    EMAIL ADDRESS
                                </span>
                            </label>
                            <input
                                type="email"
                                className="placeholder:text-zinc-800 text-gray-400 input w-full bg-black border border-zinc-700 focus:border-second focus:outline-none"
                                placeholder='Enter your email address'
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    SET PASSCODE
                                </span>
                            </label>
                            <input
                                type="password"
                                className="placeholder:text-zinc-800 text-gray-400 input w-full bg-black border border-zinc-700 focus:border-second focus:outline-none"
                                placeholder='Enter your passcode'
                            />
                        </div>

                        
                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    PROFILE IMAGE
                                </span>
                            </label>

                            <input
                                type="file"
                                className="file-input file-input-neutral w-full bg-black border-zinc-700 text-zinc-400 focus:border-lime-400"
                            />
                        </div>

                        {/* CTA */}
                        <button className="btn shadow-none w-full bg-white text-black hover:bg-zinc-200 tracking-widest font-semibold mt-2">
                            JOIN SYNDICATE
                        </button>
                    </form>

                    {/* Footer link */}
                    <div className="text-center pt-2">
                        <Link
                            href="/login"
                            className="text-xs text-zinc-500 hover:text-lime-400 tracking-wide"
                        >
                            RETURN TO LOGIN
                        </Link>
                        
                    </div>

                </div>
            </div>
        </div>

    )
}

export default Register;