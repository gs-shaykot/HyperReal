import { AdminProducts } from "@/app/components/admin_component/products/AdminProducts";
import { getAdminProducts } from "@/utils/AdminUtils/getAdminProducts";
import { getCategories } from "@/utils/getCategories";
import { Plus } from "lucide-react";


const ProductPage = async () => {
    const [categories, productData] = await Promise.all([
        getCategories(),
        getAdminProducts({ page: 1, }),
    ]);

    return (
        <div className="min-h-screen bg-main p-4 light:bg-white">
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
                    className="inline-flex h-8 items-center gap-2 bg-second px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-90 ">
                    <Plus className="size-3.5" />
                    ADD PRODUCT
                </button>
            </div>

            <AdminProducts
                initialProducts={
                    productData.products
                }
                initialTotal={
                    productData.total
                }
                initialTotalPages={
                    productData.totalPages
                }
                categories={categories}
            />
        </div>
    );
};

export default ProductPage;