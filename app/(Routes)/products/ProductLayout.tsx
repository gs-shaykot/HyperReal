'use client'
import { Category } from '@/app/(Routes)/products/Category';
import { CategoryProps } from '@/app/types/Category'
import React from 'react'
import { useSelector } from 'react-redux';

export const ProductLayout = ({ categories }: CategoryProps) => {
    const theme = useSelector((state: any) => state.themeToggle.mode);

    return (
        <main className={`h-screen ${theme === 'light' ? 'bg-main/80 border-zinc-800' : 'bg-halfWhite/90 border-gray-300/85'} `}>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>
                <div className="mb-10">
                    <h1 className={`${theme === 'light' ? 'text-white' : 'text-zinc-900'} text-4xl font-bold uppercase tracking-wide`}>
                        All <span className="text-lime-400">Products</span>
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Archive of all available gear. Filter by category or search by collection.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
                    <aside>
                        <Category categories={categories} />
                    </aside>
                    <section>
                    </section>
                </div>
            </div>
        </main>
    )
}
