import { AdminProducts } from "@/app/components/admin_component/products/AdminProducts";
import { ProductHeader } from "@/app/components/admin_component/products/ProductHeader";
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
            <ProductHeader total={productData.total} categories={categories} />

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