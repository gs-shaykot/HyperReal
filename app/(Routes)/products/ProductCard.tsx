import { ProductProps } from '@/app/types/Category'
import { easeOut, motion } from "framer-motion";
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';

export const ProductCard = ({ products }: ProductProps) => {
    const theme = useSelector((state: any) => state.themeToggle.mode);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        className={`${theme === "dark"
                            ? "bg-white border-zinc-200 shadow-xs"
                            : "bg-zinc-900 border-transparent"
                            } border-2 overflow-hidden cursor-pointer group`}
                    >
                        {/* IMAGE */}
                        <div className="relative z-10 h-80 w-full overflow-hidden">
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
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </motion.div>

                            <div className="w-5 h-5 border-b border-r absolute bottom-2 right-2 z-20 group-hover:border-second transition-all" />
                            <div className="w-5 h-5 border-b border-l absolute bottom-2 left-2 z-20 group-hover:border-second transition-all" />
                        </div>

                        {/* CONTENT */}
                        <div className="px-3 py-2 text-sm">
                            <div className="flex justify-between items-center">
                                <h3
                                    className={`font-semibold ${theme === "dark" ? "text-black" : "text-white"
                                        }`}
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
                                {product.category.name}
                            </p>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    );
};