"use client"; 
import { AdminProduct } from "@/app/types/AdminProduct";
import { ProductRow } from "./ProductRow";

type ProductsTableProps = {
    products: AdminProduct[];
};

export const ProductsTable = ({
    products,
}: ProductsTableProps) => {
    
    return (
        <div className="overflow-x-auto border border-zinc-800 light:border-zinc-200">
            <table className="w-full min-w-205 border-collapse">
                <thead>
                    <tr className="bg-white/2 light:bg-black/2">
                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Product
                        </th>

                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Category
                        </th>

                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Price
                        </th>

                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Badge
                        </th>

                        <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Sizes
                        </th>

                        <th className="px-3 py-3 text-right text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductRow
                                key={product.id}
                                product={product}
                            />
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-4 py-16 text-center font-mono text-xs text-zinc-500"
                            >
                                NO PRODUCTS FOUND
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};