import { ProductLayout } from '@/app/(Routes)/products/ProductLayout';
import { getCategories } from '@/utils/getCategories';
import { getProducts } from '@/utils/getProducts';
import argon2 from 'argon2';

type SeachProps = {
    searchParams: {
        category?: string
    }
}

const page = async ({ searchParams }: SeachProps) => {

    const { category } = await searchParams || null;
    
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