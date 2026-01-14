import Link from 'next/link';
import React from 'react'

export const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">

            {/* Card */}
            <div className=" w-full max-w-3xl grid grid-cols-1 lg:grid-cols-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">

                {/* LEFT PANEL */}
                <div className="p-10 flex flex-col justify-center space-y-4">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-extrabold leading-tight">
                            <span className="text-white">SYSTEM</span><br />
                            <span className="text-second">ACCESS</span>
                        </h1>

                        <p className="mt-3 text-sm text-zinc-400 max-w-sm">
                            Enter credentials to access the HyperReal mainframe.
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-3"> 
                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    IDENTITY / EMAIL
                                </span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your identity" className=" input w-full bg-black border border-zinc-700 text-gray-400 placeholder:text-zinc-700 focus:border-second" />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    PASSCODE
                                </span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter passcode"
                                className="input w-full bg-black border border-zinc-700 text-gray-400 placeholder:text-zinc-700 focus:border-second"
                            />
                        </div>

                        <button className="btn w-full bg-second text-black hover:bg-lime-400 tracking-widest font-semibold ">
                            INITIALIZE SESSION
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-xs text-zinc-500">
                        No identity found?{" "}
                        <Link href="/register" className="text-second hover:underline cursor-pointer">
                            CREATE OPERATIVE ACCOUNT
                        </Link>
                    </p>
                </div>

                {/* RIGHT PANEL */}
                <div className="relative hidden lg:flex items-center justify-center bg-zinc-950 group">

                    {/* Background image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition duration-500"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=60')",
                        }}
                    />

                    {/* Terminal Box */}
                    <div className="relative z-10 bg-white/10 backdrop-blur-md border border-second/60 rounded-lg p-4 w-64 text-sm font-mono text-second">
                        <div className="mb-4 text-lg">&gt;_</div>
                        <ul className="space-y-2">
                            <li>&gt; SECURE_CONNECTION_ESTABLISHED</li>
                            <li>&gt; ENCRYPTION_LEVEL_MAX</li>
                            <li>&gt; WELCOME_USER</li>
                        </ul>
                    </div> 
                </div>
            </div>
        </div>
    )
}

export default Login;