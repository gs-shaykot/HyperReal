"use client"
import { ProductDetailsProps } from '@/app/types/Category'
import { useMemo, useState } from 'react'

export const ProductDetails = ({ product }: ProductDetailsProps) => {
    // !EXTRACTED UNIQUE COLORS
    let Extractedcolor = useMemo(
        () => [...new Set(product.ProductVariants?.map(variant => variant.color))],
        [product.ProductVariants]
    );

    const [selectedColor, setSelectedColor] = useState(Extractedcolor[0]);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // !EXTRACTED SIZES BASED ON SELECTED COLOR 
    let ExtractedSize = useMemo(
        () => [...new Set(product.ProductVariants?.filter(variant => variant.color === selectedColor))],
        [product.ProductVariants, selectedColor]
    );

    // !SELECTED IMAGES BASED ON SELECTED COLOR
    let SelectedImage = product.productImages[Extractedcolor.indexOf(selectedColor)]?.imageUrl || product.productImages[0]?.imageUrl


    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* IMAGES */}
                <div className="relative h-120  w-12/12 ">
                    <img
                        src={SelectedImage || "/placeholder.png"}
                        alt={product.name}
                        className="object-cover h-full w-full rounded-lg"
                    />
                </div>
                {/* PRODUCT DETAILS */}
                <div className=''>
                    <h1 className='text-xl text-second font-bold uppercase tracking-wide'>{product.category.name}</h1>
                </div>
            </div>
        </div>
    )
}
