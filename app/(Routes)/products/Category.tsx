import { CategoryProps } from '@/app/types/Category'
import { Funnel } from 'lucide-react'
import React from 'react'

export const Category = ({ categories }: CategoryProps) => {
    return (
        <div>
            <div className="border-b border-zinc-300">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Funnel />
                    Categories
                </h2>
            </div>
        </div>
    )
}
