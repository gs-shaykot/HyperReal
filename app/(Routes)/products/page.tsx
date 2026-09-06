import { ProductLayout } from '@/app/(Routes)/products/ProductLayout';
import { getCategories } from '@/utils/getCategories';
import { getProducts } from '@/utils/getProducts';

const page = async () => {
    const categories = await getCategories();
    const products = await getProducts()

    return (
        <div>
            <ProductLayout categories={categories} products={products} />
        </div>
    )
}

export default page