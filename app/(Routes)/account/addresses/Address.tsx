"use client"
import AddressModal from '@/app/(Routes)/account/addresses/AddressModal';
import { Plus } from 'lucide-react'
import React, { useState } from 'react'

export const Address = () => {
    const [open, setOpen] = useState(false);
    return (
        <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold italic'>Drop <span className='text-second'>Locations</span></h1>

            <button
                onClick={() => setOpen(true)}
                className='light:text-white text-black group relative flex btn btn-md bg-second font-bold shadow-none border-0 rounded-none hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300 hover:scale-105'>

                <span className={` flex items-center gap-2`}>
                    <Plus size={16} strokeWidth={2} />
                    ADD LOCATION
                </span>
            </button>
            <AddressModal open={open} onCloseAction={() => setOpen(false)} />
        </div>
    )
}
