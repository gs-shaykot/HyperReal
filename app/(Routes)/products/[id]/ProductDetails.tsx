"use client"
import { ProductDetailsProps } from '@/app/types/Category'
import { useMemo, useState } from 'react'

export const ProductDetails = ({ product }: ProductDetailsProps) => {

    // !EXTRACTED UNIQUE COLORS
    let Extractedcolor = useMemo(
        () => [...new Set(product.productVariants?.map(variant => variant.color))],
        [product.productVariants]
    );

    const [selectedColor, setSelectedColor] = useState(Extractedcolor[0]);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // !EXTRACTED SIZES BASED ON SELECTED COLOR 
    let ExtractedSize = useMemo(
        () => [...new Set(product.productVariants?.filter(variant => variant.color === selectedColor))],
        [product.productVariants, selectedColor]
    );

    // !SELECTED IMAGES BASED ON SELECTED COLOR
    let SelectedImage = product.productImages[Extractedcolor.indexOf(selectedColor)]?.imageUrl || product.productImages[0]?.imageUrl

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* IMAGES CONTAINER */}
                <div
                    className="aspect-square bg-dark-surface border border-border overflow-hidden relative">
                    <img
                        src={SelectedImage || "/placeholder.png"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* PRODUCT DETAILS */}
                <div className=''>
                    {/* Basic Informations */}
                    <div>
                        <h1 className='text-xl text-second font-bold uppercase tracking-wide'>
                            {product.category.name} <span className='text-sm'>// {product.category.slug}</span>
                        </h1>
                        <h1 className='text-white mt-3 text-3xl md:text-4xl font-bold uppercase italic mb-4'>{product.name}</h1>
                        <h2 className='text-white text-2xl'>&#x24;{product.price}</h2>
                        <p className='text-zinc-500 mt-2'>{product.description}</p>
                    </div>

                    {/* VARIANTS */}
                    <div>
                        <h1 className='font-bold text-base text-white mt-6'>Colors: <span className='text-second'>{selectedColor}</span></h1>
                        <div className="flex gap-3">
                            {Extractedcolor.map(color => (
                                <button
                                    key={color}
                                    onClick={() => {
                                        setSelectedColor(color);
                                        setSelectedSize(null);
                                    }}
                                    className={`w-8 h-8 rounded-full border
                                    ${selectedColor === color ? "border-lime-400" : "border-gray-600"}`}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
