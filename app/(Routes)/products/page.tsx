import { ProductLayout } from '@/app/(Routes)/products/ProductLayout';
import { getCategories } from '@/utils/getCategories';
import { getProducts } from '@/utils/getProducts';

type ProductsPageProps = {
    searchParams: Promise<{
        category?: string;
    }>;
};

const page = async ({ searchParams }: ProductsPageProps) => {
    const { category } = await searchParams;
    const categoryId = category ?? null;
    const categories = await getCategories();
    const products = await getProducts(categoryId ?? undefined)

    return (
        <div>
            <ProductLayout categories={categories} categoryId={categoryId} products={products} />
        </div>
    )
}

export default page