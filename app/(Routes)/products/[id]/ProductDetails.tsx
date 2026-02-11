"use client"
import { ProductDetailsProps } from '@/app/types/Category'
import { Check, Minus, Plus } from 'lucide-react';
import { useMemo, useState } from 'react'
import { motion } from "framer-motion";

export const ProductDetails = ({ product }: ProductDetailsProps) => {

    // !EXTRACTED UNIQUE COLORS
    let Extractedcolor = useMemo(
        () => [...new Set(product.productVariants?.map(variant => variant.color))],
        [product.productVariants]
    );

    const [selectedColor, setSelectedColor] = useState(Extractedcolor[0]);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

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
                        {/* COLORS */}
                        <div className='mb-5'>
                            <h1 className='font-bold text-sm text-white mt-6 mb-2'>Colors: <span className='text-second'>{selectedColor}</span></h1>
                            <div className="flex gap-3">
                                {Extractedcolor.map(color => (
                                    <div className='flex justify-center items-center relative' key={color}>
                                        <button
                                            key={color}
                                            onClick={() => {
                                                setSelectedColor(color);
                                                setSelectedSize(null);
                                            }}
                                            className={`w-8 h-8 rounded-full border
                                            ${selectedColor === color ? "border-lime-400" : "border-gray-600"} ${color.toLowerCase() === 'neon breach' ? 'bg-second' : 'bg-[#1d2122]'}`}
                                            title={color}
                                        />
                                        {
                                            selectedColor === color && (
                                                <Check className={`${color.toLowerCase()==='neon breach' ? 'text-black' : 'text-white'} absolute font-bold`} size={18} strokeWidth={3}/>
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SIZES */}
                        <div className='mb-5'>
                            <h1 className='font-bold text-sm text-white mb-2'>SELECT SIZE:</h1>
                            <div>
                                {
                                    ExtractedSize.map(variant => (
                                        <button key={variant.id}
                                            onClick={() => setSelectedSize(variant.size)}
                                            className={`border border-zinc-500 px-3 py-1.5 mr-2 ${selectedSize === variant.size ? 'bg-second text-black' : 'text-white'}`}
                                        >
                                            {variant.size || "One Size"}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>

                        {/* ADD TO CART BUTTON */}
                        <div className='flex items-center justify-center gap-3 mt-2'>
                            {/* Quantity */}
                            <div className='flex items-center gap-4 border border-zinc-600 '>
                                <motion.div
                                    className='hover:bg-zinc-700 p-1.5 cursor-pointer'
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Minus className='text-white' onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : prev))} />
                                </motion.div>
                                <span className="text-white">{quantity}</span>
                                <motion.div
                                    className='hover:bg-zinc-700 p-1.5 cursor-pointer'
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Plus className='text-white' onClick={() => setQuantity((prev) => (prev < 10 ? prev + 1 : prev))} />
                                </motion.div>
                            </div>

                            {/* ADD TO CART BUTTON */}
                            <div className='flex-1'>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    className="cursor-pointer w-full bg-second py-1.5 shadow-none rounded-none font-semibold text-black">
                                    Add to Cart
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
