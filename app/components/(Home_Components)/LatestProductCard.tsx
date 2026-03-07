'use client'
import React from 'react'
import { useSelector } from 'react-redux';

export const LatestProductCard = ({ products }: { products: any[] }) => {
    console.log(products)
    const theme = useSelector((state: any) => state.themeToggle.mode);

    return (
        <div className={`${theme === 'light' ? 'bg-main/80 border-zinc-800' : 'bg-halfWhite'} relative overflow-hidden border-b border-zinc-800 my-10 py-10`}>
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: ` linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px) `,
                    backgroundSize: '40px 40px'
                }}
            />
            <div className='max-w-7xl px-4 mx-auto'>
                <h2 className='text-5xl italic font-bold'>LATEST<span className='text-second'> RLEASES</span></h2>
                <div>

                </div>
            </div>
        </div>
    )
}
