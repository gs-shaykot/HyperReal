'use client'
import { ArrowUpRight } from 'lucide-react'
import { easeOut, motion } from "framer-motion";
import { useSelector } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { div } from 'framer-motion/client';

export const HeatProductCard = ({ product }: any) => {
    console.log('Product with tags: ', product)
    const theme = useSelector((state: any) => state.themeToggle.mode);

    return (
        <div>
            <Link key={product.id} href={`/products/${product.id}`}>
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{
                        duration: 0.3,
                        ease: easeOut,
                    }}
                    whileHover={{
                        y: -6,
                        boxShadow: "0px 12px 24px rgba(0,0,0,0.15)",
                        borderColor: "#8fb300",
                    }}
                    className={`${theme === "dark"
                        ? "bg-white border-zinc-200 shadow-xs"
                        : "bg-zinc-900 border-transparent"
                        } border-2 overflow-hidden cursor-pointer group relative z-2`}
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
                            <h3
                                className={`font-semibold `}
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
                    {/* make the span look like the image i attached.. */}
                    {
                        product.tags.map((tag: string, index: number) => (
                            <span
                                key={index} className=" bg-second text-zinc-900 text-xs p-2 absolute top-2 left-2 z-10 font-bold">
                                {tag}
                            </span>
                        ))
                    }
                </motion.div>
            </Link>
        </div>
    )
}
