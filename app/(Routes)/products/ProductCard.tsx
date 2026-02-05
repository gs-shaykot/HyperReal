import { ProductProps } from '@/app/types/Category'
import { easeOut, motion } from "framer-motion";
import Image from 'next/image';


export const ProductCard = ({ products }: ProductProps) => {
    console.log('Product in', products)
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' >
            {
                products?.map(product => (
                    <motion.div key={product.id}>
                        <div>
                            <Image width={100} height={100} src={product.productImages[0].imageUrl} alt={product.name} />
                        </div>
                    </motion.div>
                ))
            }
        </div>
    )
}
