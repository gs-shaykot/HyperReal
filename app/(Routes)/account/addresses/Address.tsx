"use client"
import AddressModal from '@/app/(Routes)/account/addresses/AddressModal';
import { AddressType } from '@/app/types/AddressType';
import { getAddresses } from '@/lib/addressApi';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Plus } from 'lucide-react'
import Link from 'next/link';
import React, { useState } from 'react'

export const Address = () => {
    const { data: addresses, isLoading } = useQuery({
        queryKey: ["address"],
        queryFn: getAddresses
    });
    const [open, setOpen] = useState(false);
    console.log("Addresses fetched: ", addresses);
    return (
        <div>
            {/* Header */}
            <div className='flex justify-between items-center mb-3'>
                <h1 className='text-2xl font-bold italic'>Drop <span className='text-second'>Locations</span></h1>
                <button
                    onClick={() => setOpen(true)}
                    className='light:text-white text-black group relative flex btn btn-md bg-second font-bold shadow-none border-0 rounded-none hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300 hover:scale-105'>
                    <span className={` flex items-center gap-2`}>
                        <Plus size={16} strokeWidth={2} />
                        ADD LOCATION
                    </span>
                </button>
            </div>

            {/* Address Modal */}
            <AddressModal open={open} onCloseAction={() => setOpen(false)} />

            {/* Address List */}
            {
                addresses?.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {
                            addresses?.map((address: AddressType, idx: any) => (
                                <div key={idx} className='border border-zinc-700 p-3 flex gap-2 items-start'>
                                    <MapPin size={20} className='inline text-second mt-1.5' />
                                    <div className='space-y-1.5 flex-1'>
                                        <h1 className='font-1.5old text-lg'>{address.label?.toUpperCase()}</h1>
                                        <p className='text-lg font-medium'>{address.fullName}</p>
                                        <p className='text-sm border-dashed border-b border-zinc-700 pb-1'>{address.house},{address.street}</p>
                                        <div className='flex gap-2 justify-between items-center'>
                                            <p className='text-sm'>{address.city},{address.zipCode}</p>
                                            <p className='flex items-center'><Phone size={14}/>: {address.phone}</p>
                                        </div>
                                        <p className='text-sm'>{address.country}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ) : (
                    <div className='p-4 border border-dashed border-zinc-700 h-52 flex justify-center items-center flex-col gap-4'>
                        <MapPin />
                        <p className='text-zinc-400'>No saved drop locations yet.</p>

                        <button
                            onClick={() => setOpen(true)}
                            className='light:text-white text-black group relative flex btn btn-md bg-second font-bold shadow-none border-0 rounded-none hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300 hover:scale-105'>

                            <span className={` flex items-center gap-2`}>
                                <Plus size={16} strokeWidth={2} />
                                ADD LOCATION
                            </span>
                        </button>
                    </div>
                )
            }
        </div>
    )
}
