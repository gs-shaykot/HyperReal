import { ProductProps } from '@/app/types/Category'
import { easeOut, motion } from "framer-motion";
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';


export const ProductCard = ({ products }: ProductProps) => {

    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {products?.map((product, index) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{
                            duration: 0.3,
                            ease: easeOut,
                            delay: index * 0.08,
                        }}
                        whileHover={{
                            y: -6,
                            boxShadow: "0px 12px 24px rgba(0,0,0,0.15)",
                            borderColor: "#8fb300",
                        }}
                        className="overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer group"
                    >
                        {/* IMAGE */}
                        <div className="relative z-10 aspect-square w-full overflow-hidden bg-black">
                            <motion.div
                                whileHover={{ scale: 1.09 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="h-full w-full"
                            >
                                <Image
                                    src={
                                        product.productImages?.[0]?.imageUrl ||
                                        "/placeholder.png"
                                    }
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </motion.div>

                            <span className="w-5 h-5 border-b border-r absolute bottom-2 right-2 z-20 group-hover:border-second transition-all" />
                            <span className="w-5 h-5 border-b border-l absolute bottom-2 left-2 z-20 group-hover:border-second transition-all" />
                        </div>

                        {/* CONTENT */}
                        <div className="bg-zinc-900 px-3 py-2 text-sm light:bg-white">
                            <div className="flex justify-between items-center">
                                <h3
                                    className="truncate text-xs font-bold uppercase"
                                >
                                    {product.name}
                                </h3>

                                <div className="flex items-center gap-1">
                                    <h3 className="text-xs font-bold text-second">
                                        &#36;{product.price}
                                    </h3>
                                    <ArrowUpRight
                                        className="text-zinc-400 group-hover:text-second"
                                        size={14}
                                    />
                                </div>
                            </div>

                            <p className="mt-1 text-[10px] uppercase text-gray-500">
                                {product.category.name}
                            </p>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
};
