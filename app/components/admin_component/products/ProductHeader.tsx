"use client"
import { ProductModal } from '@/app/components/admin_component/products/ProductModal';
import { Category } from '@prisma/client';
import { Plus } from 'lucide-react'
import React, { useState } from 'react'

type ProductHeaderProps = {
    total: number;
    categories: Category[];
};

export const ProductHeader = ({ total, categories }: ProductHeaderProps) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold tracking-[0.08em] text-white light:text-zinc-900">
                        PRODUCTS
                    </h1>

                    <p className="mt-1 font-mono text-xs text-zinc-500">
                        {total} products
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setOpen(true)
                    }
                    className="inline-flex h-8 items-center gap-2 bg-second px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-90 cursor-pointer">
                    <Plus className="size-3.5" />
                    ADD PRODUCT
                </button>
            </div>

            <ProductModal
                open={open}
                onCloseAction={() =>
                    setOpen(false)
                }
                categories={categories}
            />
        </>
    )
}
