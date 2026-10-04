import { AdminProducts } from '@/app/components/admin_component/products/AdminProducts';
import { getAdminProducts } from '@/utils/AdminUtils/getAdminProducts';
import { getCategories } from '@/utils/getCategories';
import { Plus } from 'lucide-react'

type ProductsPageProps = {
    searchParams: Promise<{
        search?: string;
        category?: string;
        page?: string;
    }>;
};

const ProductPage = async ({ searchParams }: ProductsPageProps) => {
    const params = await searchParams;

    const search = params.search ?? "";
    const categoryId = params.category;
    const page = Number(params.page ?? "1");

    const [categories, productData] =
        await Promise.all([
            getCategories(),
            getAdminProducts({
                search,
                categoryId,
                page,
            }),
        ]);

    return (
        <div className="bg-main light:bg-white min-h-screen p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold tracking-[0.08em] text-white light:text-zinc-900">
                        PRODUCTS
                    </h1>

                    <p className="mt-1 font-mono text-xs text-zinc-500">
                        {productData.total} products
                    </p>
                </div>

                <button
                    type="button"
                    className="inline-flex h-8 items-center gap-2 bg-second px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-90 cursor-pointer">
                    <Plus className="size-3.5" />
                    ADD PRODUCT
                </button>
            </div>
            <AdminProducts
                products={productData.products}
                categories={categories} 
                page={productData.page}
                totalPages={productData.totalPages}
            />
        </div>
    )
}
export default ProductPage