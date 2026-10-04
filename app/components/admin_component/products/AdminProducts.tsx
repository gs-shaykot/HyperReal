import { AdminProduct } from "@/app/types/AdminProduct";
 
import { ProductsToolbar } from "./ProductsToolbar";
import { ProductsTable } from "./ProductsTable";
import { ProductsPagination } from "./ProductsPagination";

type Category = {
    id: string;
    name: string;
};

type AdminProductsProps = {
    products: AdminProduct[];
    categories: Category[]; 
    page: number;
    totalPages: number;
};

export const AdminProducts = ({
    products,
    categories, 
    page,
    totalPages,
}: AdminProductsProps) => {
    return (
        <div className="min-h-screen bg-main px-4 py-6 light:bg-white">
            <div className="w-full"> 

                <ProductsToolbar
                    categories={categories}
                />

                <ProductsTable
                    products={products}
                />

                <ProductsPagination
                    page={page}
                    totalPages={totalPages}
                />
            </div>
        </div>
    );
};