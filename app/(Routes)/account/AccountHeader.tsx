'use client'
import LogoutButton from '@/app/components/LogoutButton';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image';
import React from 'react'

export const AccountHeader = () => {
    const { data: session } = useSession();
    
    return (
        <div className='flex justify-between items-center px-4 py-6 bg-[#0f0f0f] shadow-2xl border-t-3 border-second overflow-hidden mt-8'>

            <div className='flex justify-between gap-5 items-center'>
                <div className='w-28 h-28 bg-second overflow-hidden'>
                    <Image src={session?.user.image || '/default-image.jpg'} alt="User Image" width={112} height={112} />
                </div>
                <div className='flex flex-col space-y-2'>
                    <span className='text-zinc-400'>OPERATIVE //</span>
                    <span className='text-3xl font-bold font-sans'>{session?.user.name}</span>
                    <span className='text-zinc-400'>Joined {session?.user.createdAt && new Date(session.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Signout Button */}
            <div className='relative'>
                <h1 className='text-9xl text-second/5 font-bold absolute -right-3 -bottom-20 z-5'>ID</h1>
                <button onClick={() => signOut({ callbackUrl: "/login" })} className='relative z-10 flex gap-2 justify-center items-center btn bg-main/40 rounded-none '>
                    <LogOut />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
