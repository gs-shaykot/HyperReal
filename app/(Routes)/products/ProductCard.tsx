import { ProductProps } from '@/app/types/Category'
import { easeOut, motion } from "framer-motion";
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';


export const ProductCard = ({ products }: ProductProps) => {
    console.log('Product in', products)
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' >
            {
                products?.map(product => (
                    <motion.div
                        key={product.id}
                        initial={{ y: 0 }}
                        whileHover={{
                            y: -6,
                            boxShadow: "0px 12px 24px rgba(0,0,0,0.15)",
                            borderColor: "#8fb300",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="border-2 border-transparent bg-zinc-900 overflow-hidden cursor-pointer group"
                    >
                        {/* IMAGE */}
                        <div className="relative h-80 w-full overflow-hidden">
                            <motion.div
                                whileHover={{ scale: 1.09 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="h-full w-full"
                            >
                                <Image
                                    src={product.productImages?.[0]?.imageUrl || "/placeholder.png"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </motion.div>
                        </div>

                        {/* CONTENT */}
                        <div className="px-3 py-2 text-sm">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-white">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-1">
                                    <h3 className='text-second font-bold'>&#36;{product.price}</h3>
                                    <ArrowUpRight className='text-zinc-400 group-hover:text-second' size={18} />
                                </div>
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                {product.category.name}
                            </p>
                        </div>
                    </motion.div>
                ))
            }
        </div>
    )
}
