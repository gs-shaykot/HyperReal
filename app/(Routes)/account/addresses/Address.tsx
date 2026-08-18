"use client"
import AddressModal from '@/app/(Routes)/account/addresses/AddressModal';
import { AddressSkeleton } from '@/app/components/skeletons/AddressSkeleton';
import { useMakePrimary } from '@/app/Hooks/useAddress';
import { AddressType } from '@/app/types/AddressType';
import { getAddresses } from '@/lib/addressApi';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Plus, Star, Trash2 } from 'lucide-react'
import React, { useState } from 'react'

export const Address = () => {
    const { data: addresses, isLoading } = useQuery({
        queryKey: ["address"],
        queryFn: getAddresses
    });
    const [open, setOpen] = useState(false);
    const makePrimary = useMakePrimary();

    if (isLoading) {
        return <AddressSkeleton />
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className='flex justify-between items-center mb-3'>
                <h1 className='text-2xl font-bold italic light:text-zinc-900 text-white'>Drop <span className='text-second'>Locations</span></h1>
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
                                <div key={idx} className={`border ${address.isDefault ? 'border-second' : 'border-zinc-700 light:border-zinc-300'} bg-[#0f0f0f] light:bg-white flex flex-col h-full relative transition-colors duration-200`}>
                                    <div className='p-3 flex gap-2 items-start'>
                                        <MapPin size={20} className='inline text-second mt-1.5' />
                                        <div className='space-y-1.5 flex-1'>
                                            <h1 className='font-bold text-sm light:text-zinc-900 text-white'>{address.label?.toUpperCase()}</h1>
                                            <p className='text-sm font-medium light:text-zinc-800 text-zinc-200'>{address.fullName}</p>
                                            <p className='text-sm border-dashed border-b border-zinc-700 light:border-zinc-300 pb-1 light:text-zinc-600 text-zinc-400'>{address.house},{address.street}</p>
                                            <div className='flex gap-2 justify-between items-center'>
                                                <p className='text-sm light:text-zinc-600 text-zinc-400'>{address.city},{address.zipCode}</p>
                                                <p className='flex items-center light:text-zinc-600 text-zinc-400'><Phone size={14} />: {address.phone}</p>
                                            </div>
                                            <p className='text-sm light:text-zinc-600 text-zinc-400'>{address.country}</p>
                                        </div>
                                    </div>
                                    <div className='mt-auto p-3 border-t border-zinc-700 light:border-zinc-300 border-dashed'>
                                        {
                                            address.isDefault ? (
                                                <button className="btn border-0 w-full rounded-none shadow-none bg-transparent light:hover:bg-zinc-100 hover:bg-[#262626] light:text-red-600 text-red-500">
                                                    <Trash2 size={16} strokeWidth={2} className='mr-2 ' />
                                                    REMOVE
                                                </button>
                                            ) : (
                                                <div className='flex justify-between items-center w-full gap-2'>
                                                    <button
                                                        onClick={() => makePrimary.mutate(address.id as string)}
                                                        className="btn border-0 w-6/12 rounded-none shadow-none bg-transparent light:hover:bg-zinc-100 hover:bg-[#262626] light:text-zinc-900 text-white">
                                                        <Star size={16} strokeWidth={2} className='mr-2 ' />
                                                        PRIMARY
                                                    </button>
                                                    <button className="btn border-0 w-6/12 rounded-none shadow-none bg-transparent light:hover:bg-zinc-100 hover:bg-[#262626] light:text-red-600 text-red-500">
                                                        <Trash2 size={16} strokeWidth={2} className='mr-2 ' />
                                                        REMOVE
                                                    </button>
                                                </div>
                                            )
                                        }
                                    </div>
                                    {
                                        address.isDefault && (
                                            <span className="badge badge-success bg-second text-zinc-900 rounded-none absolute top-0 right-0 border-0 font-bold">
                                                PRIMARY
                                            </span>
                                        )
                                    }
                                </div>
                            ))
                        }
                    </div>
                ) : (
                    <div className='p-4 border border-dashed border-zinc-700 light:border-zinc-300 bg-[#0f0f0f] light:bg-white h-52 flex justify-center items-center flex-col gap-4'>
                        <MapPin className='light:text-zinc-700 text-zinc-400' />
                        <p className='light:text-zinc-600 text-zinc-400'>No saved drop locations yet.</p>

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
        </div >
    )
}
