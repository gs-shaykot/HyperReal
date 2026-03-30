"use client"
import { ArrowUpRight } from 'lucide-react'
import { motion } from "framer-motion";
import Image from 'next/image';
import Link from 'next/link';

export const HeatProductWrapper = ({ productsWithTags }: { productsWithTags: any[] }) => {

    return (
        <div className="max-w-7xl px-4 mx-auto py-10">
            <div className='flex justify-between items-center  mb-7 md:mb-10'> 
                <h2 className={`light:text-zinc-900 text-white text-2xl md:text-4xl italic font-bold transition-colors duration-200`}>TRENDING<span className='text-second'> HEAT</span></h2>

                <Link href="/products" className="text-sm hidden md:block text-gray-400 group hover:text-second transition-colors duration-200 relative right-2">
                    VIEW ALL <span className='group-hover:relative group-hover:left-1 group-hover:transition group-hover:delay-150'>→</span>
                </Link>
            </div>
            <div className="grid griwd-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                {
                    productsWithTags.map((product) => (
                        // CARDS
                        <div key={product.id} >
                            <Link href={`/products/${product.id}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    whileHover={{
                                        y: -6,
                                        boxShadow: "0px 12px 24px rgba(0,0,0,0.15)",
                                        borderColor: "#8fb300",
                                    }} 
                                    className={`light:bg-white bg-zinc-900 border-2 border-transparent shadow-md overflow-hidden relative z-2 group cursor-pointer`}
                                >

                                    {/* IMAGE */}
                                    <div className="relative z-10 h-80 w-full overflow-hidden">
                                        <div
                                            className="h-full w-full"
                                        >
                                            <Image
                                                src={product.productImages?.[0]?.imageUrl || "/placeholder.png"}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />

                                        </div>

                                        <div className="w-5 h-5 border-b border-r absolute bottom-2 right-2 z-20 group-hover:border-second transition-all" />
                                        <div className="w-5 h-5 border-b border-l absolute bottom-2 left-2 z-20 group-hover:border-second transition-all" />
                                    </div>

                                    {/* CONTENT */}
                                    <div className="px-3 py-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            {/* ${theme === "dark" ? "text-zinc-900" : "text-white"} */}
                                            <h3
                                                className={`font-semibold light:text-zinc-900 text-white group-hover:text-second `}
                                            >
                                                {product.name}
                                            </h3>

                                            <div className="flex items-center gap-1">
                                                <h3 className="text-second font-bold">
                                                    &#36;{product.price}
                                                </h3>
                                                <ArrowUpRight
                                                    className="text-zinc-400 group-hover:text-second"
                                                    size={18}
                                                />
                                            </div>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {product.category?.name}
                                        </p>
                                    </div>

                                    {
                                        product.tags.map((tag: string, index: number) => (
                                            <span
                                                key={index} className=" bg-second text-black text-xs p-2 absolute top-2 left-2 z-10 font-bold">
                                                {tag}
                                            </span>
                                        ))
                                    }

                                </motion.div>
                            </Link>
                        </div>
                    ))
                }
            </div>
            {/* ${theme === "dark" ? "text-zinc-900 border-zinc-800" : "text-second border-second"} */}
            <Link href="/products" className={`text-sm block md:hidden group transition-colors duration-200 relative md:right-2 border py-2 text-center mt-3 `}>
                VIEW ALL <span className='group-hover:relative group-hover:left-1 group-hover:transition group-hover:delay-150'>→</span>
            </Link>
        </div>
    )
}
