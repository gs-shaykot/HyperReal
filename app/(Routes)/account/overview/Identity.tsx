'use client'
import { Mail, Phone, Save, Shield, SquarePen, User, X } from 'lucide-react'
import React, { useState } from 'react'

export const Identity = ({ id, name, email, image }: { id: string; name: string; email: string; image: string }) => {

    const [isEditing, setIsEditing] = useState(false)

    return (
        <div className="border border-neutral-700 bg-[#0f0f0f] p-3">
            <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold">
                    Identity Matrix
                </h2>
                <div>
                    {
                        isEditing && (
                            <div className='flex items-center justify-between'>
                                <button onClick={() => setIsEditing(false)} className="mr-2 btn btn-sm btn-outline rounded-none border-0 bg-transparent hover:bg-[#262626] light:hover:bg-zinc-900 hover:text-white">
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button className='light:text-white text-black group relative flex btn btn-sm bg-second font-bold shadow-none border-0 rounded-none hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300 hover:scale-105'>

                                    <span className={` flex items-center gap-2`}>
                                        <Save size={16} strokeWidth={2} />
                                        SAVE
                                    </span>
                                </button>
                            </div>
                        )
                    }
                    {
                        !isEditing && ( 
                            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline rounded-none hover:bg-white light:hover:bg-zinc-900 hover:text-zinc-900">
                                <SquarePen size={16} />
                                Edit
                            </button>
                        )
                    }
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">

                <div className="border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-3 ">
                        <User size={18} strokeWidth={0.75} />
                        <p className="text-neutral-500 text-sm">
                            Full Name
                        </p>
                    </div>

                    <h3 className="pb-2 text-sm">{name || "Your Name"}</h3>
                </div>

                <div className="border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-3 ">
                        <Shield size={18} strokeWidth={0.75} />
                        <p className="text-neutral-500 text-sm">
                            Role
                        </p>
                    </div>

                    <h3 className="pb-2 text-sm">{"USER"}</h3>
                </div>

                <div className="border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-3 ">
                        <Mail size={18} strokeWidth={0.75} />
                        <p className="text-neutral-500 text-sm">
                            Email
                        </p>
                    </div>

                    <h3 className="pb-2 text-sm">{email || "gs@email.com"}</h3>
                </div>

                <div className="border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-3 ">
                        <Phone size={18} strokeWidth={0.75} />
                        <p className="text-neutral-500 text-sm">
                            Phone
                        </p>
                    </div>

                    <h3 className="pb-2 text-sm">{"+8801XXXXXXXXX"}</h3>
                </div>

            </div>

        </div>
    )
}
