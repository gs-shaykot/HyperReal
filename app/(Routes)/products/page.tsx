import { ProductLayout } from '@/app/(Routes)/products/ProductLayout';
import { getCategories } from '@/utils/getCategories';
import { getProducts } from '@/utils/getProducts';

type ProductsPageProps = {
    searchParams: Promise<{
        search?: string;
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        inStock?: string;
        sort?: string;
    }>;
};

const page = async ({ searchParams }: ProductsPageProps) => {
    const { search, category, minPrice, maxPrice, inStock, sort } = await searchParams;
    const categoryId = category ?? null;
    const categories = await getCategories();
    const products = await getProducts({ search, categoryId, minPrice, maxPrice, inStockOnly: inStock === 'true', sort });

    return (
        <div>
            <ProductLayout categories={categories} categoryId={categoryId} products={products} />
        </div>
    )
}

export default page