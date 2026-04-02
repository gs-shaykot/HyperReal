"use client"
import { ProductDetailsProps } from '@/app/types/Category'
import { Check, Minus, Plus } from 'lucide-react';
import { useMemo, useState } from 'react'
import { motion } from "framer-motion";

// make skeleton loading for this page. i will add this in /products/[id]/loading.tsx:
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
                    className="aspect-square bg-dark-surface border border-zinc-700 overflow-hidden relative">
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
                        <h1 className='light:text-zinc-900 text-white mt-3 text-3xl md:text-4xl font-bold uppercase italic mb-4'>{product.name}</h1>
                        <h2 className='light:text-zinc-900 font-bold text-white text-2xl'>&#x24;{product.price}</h2>
                        <p className='light:text-zinc-800 text-zinc-200 mt-2'>{product.description}</p>
                    </div>

                    {/* VARIANTS */}
                    <div className='border-b border-zinc-600 pb-10'> 
                        {/* COLORS */}
                        <div className='mb-5'>
                            <h1 className='font-bold text-sm light:text-zinc-900 text-white mt-6 mb-2'>Colors: <span className='text-second'>{selectedColor}</span></h1>
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
                                                <Check className={`${color.toLowerCase() === 'neon breach' ? 'text-black' : 'text-white'} absolute font-bold`} size={18} strokeWidth={3} />
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SIZES */}
                        <div className='mb-5'>
                            <h1 className='font-bold text-sm light:text-zinc-900 text-white mb-2'>SELECT SIZE:</h1>
                            <div>
                                {
                                    ExtractedSize.map(variant => (
                                        <button key={variant.id}
                                            onClick={() => setSelectedSize(variant.size)}
                                            className={`border border-zinc-500 px-3 py-1.5 mr-2 ${selectedSize === variant.size ? 'bg-second light:text-white text-black' : 'light:text-black text-white'}`}
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
                                    className='hover:bg-second group p-1.5 cursor-pointer'
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Minus className='light:text-black text-white group-hover:light:text-white group-hover:text-black' onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : prev))} />
                                </motion.div>
                                <span className="light:text-black text-white">{quantity}</span>
                                <motion.div
                                    className='hover:bg-second group p-1.5 cursor-pointer'
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Plus className='light:text-black text-white group-hover:light:text-white group-hover:text-black' onClick={() => setQuantity((prev) => (prev < 10 ? prev + 1 : prev))} />
                                </motion.div>
                            </div>

                            {/* ADD TO CART BUTTON */}
                            <div className='flex-1'>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    className="cursor-pointer w-full bg-second py-1.5 shadow-none rounded-none font-semibold light:text-white text-black">
                                    Add to Cart
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="tabs tabs-border ">
                        <input type="radio" name="my_tabs_2" className="tab px-5 pl-0 light:text-zinc-900 text-white/90" aria-label="DETAILS" />
                        <div className="tab-content light:text-zinc-900 text-white/70 font-light mt-3 text-sm">
                            <p>Constructed from premium industrial-grade materials. Reinforced stitching at stress points. Designed in Neo-Tokyo.</p>
                        </div>

                        <input type="radio" name="my_tabs_2" className="tab px-5 pl-0 light:text-zinc-900 text-white/90" aria-label="SHIPPING" defaultChecked />
                        <div className="tab-content light:text-zinc-900 text-white/70 font-light mt-3 text-sm">
                            <p>Free worldwide shipping on orders over $150. Standard delivery 5-7 business days. Express available at checkout.</p>
                        </div>

                        <input type="radio" name="my_tabs_2" className="tab px-5 pl-0 light:text-zinc-900 text-white/90" aria-label="RETURNS" />
                        <div className="tab-content light:text-zinc-900 text-white/70 font-light mt-3 text-sm">
                            <p>30-day return policy. Items must be unworn with tags attached. Free returns on all domestic orders.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
