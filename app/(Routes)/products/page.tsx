import { ProductLayout } from '@/app/(Routes)/products/ProductLayout';
import { getCategories } from '@/utils/getCategories';
import { getProducts } from '@/utils/getProducts';
import argon2 from 'argon2';

type SeachProps = {
    searchParams: {
        category?: string
    }
}

export const page = async ({ searchParams }: SeachProps) => {

    const { category } = await searchParams || null;
    const categoryId = category ?? null;
    const categories = await getCategories();
    const products = await getProducts(categoryId ?? undefined)

    const pass = await argon2.needsRehash('$argon2id$v=19$m=65536,t=3,p=4$E/Ts/hZf44zerCGU1spPtA$SG6g6htlo+kUmbwqsLoLN91tFYKfRlzvyxVjo/Yt4Jo');
    console.log(pass)

    return (
        <div>
            <ProductLayout categories={categories} categoryId={categoryId} products={products} />
        </div>
    )
}

export default page