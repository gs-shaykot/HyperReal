"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

import { AdminProduct } from "@/app/types/AdminProduct";
import { ProductBadge } from "./product-badge";
import { useState } from "react";
import { ProductModal } from "@/app/components/admin_component/products/ProductModal";
import { Category } from "@/app/components/admin_component/products/ProductsToolbar";

type ProductRowProps = {
    product: AdminProduct;
    categories: Category[];
};

export const ProductRow = ({ product, categories }: ProductRowProps) => {
    const [open, setOpen] = useState(false);

    const sizes = Array.from(
        new Set(
            product.productVariants
                .map((variant) => variant.size)
                .filter(Boolean)
        )
    );

    const visibleSizes = sizes.slice(0, 4);
    const remainingSizes = Math.max(sizes.length - visibleSizes.length, 0);

    const colors = Array.from(
        new Map(
            product.productVariants.map((variant) => [
                variant.color,
                {
                    id: variant.color,
                    name: variant.color,
                    hex: variant.hex ?? "#000000",
                    imageUrl:
                        product.productImages.find(
                            (image) =>
                                image.color === variant.color
                        )?.imageUrl ?? "",
                },
            ])
        ).values()
    );

    const stockBySize = Object.fromEntries(
        Array.from(
            new Map(
                product.productVariants.map((variant) => [
                    variant.size,
                    variant.stock,
                ])
            )
        )
    );

    return (
        <>
            <tr
                className="border-t border-zinc-800 transition-colors hover:bg-white/2.5 light:border-zinc-200 light:hover:bg-black/2"
            >
                {/* PRODUCT */}
                <td className="px-3 py-3">
                    <div className="flex min-w-55 items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden bg-zinc-100">
                            <Image
                                src={
                                    product.productImages[0]?.imageUrl ??
                                    "/placeholder.png"
                                }
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-contain"
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold uppercase text-white light:text-zinc-900">
                                {product.name}
                            </p>

                            <p className="mt-0.5 font-mono text-[9px] uppercase text-zinc-500">
                                REF-{product.id.slice(0, 4).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </td>

                {/* CATEGORY */}
                <td className="px-3 py-3">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                        {product.category.name}
                    </span>
                </td>

                {/* PRICE */}
                <td className="px-3 py-3">
                    <span className="font-mono text-[10px] font-bold text-white light:text-zinc-900">
                        ${product.price.toFixed(0)}
                    </span>
                </td>

                {/* BADGE */}
                <td className="px-3 py-3">
                    <ProductBadge
                        totalSold={product.totalSold}
                        createdAt={product.createdAt}
                        isAvailable={product.isAvailable}
                    />
                </td>

                {/* SIZES */}
                <td className="px-3 py-3">
                    <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-400">
                        {visibleSizes.map((size) => (
                            <span key={size}>
                                {size}
                                {size !==
                                    visibleSizes[
                                    visibleSizes.length - 1
                                    ]
                                    ? ","
                                    : ""}
                            </span>
                        ))}

                        {remainingSizes > 0 && (
                            <span>,...</span>
                        )}
                    </div>
                </td>

                {/* ACTIONS */}
                <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            aria-label={`Edit ${product.name}`}
                            onClick={() => setOpen(true)}
                            className="text-zinc-500 transition-colors hover:text-white light:hover:text-zinc-900 cursor-pointer"
                        >
                            <Pencil className="size-3.5" />
                        </button>

                        <button
                            type="button"
                            aria-label={`Delete ${product.name}`}
                            className="text-zinc-500 transition-colors hover:text-red-400 cursor-pointer"
                        >
                            <Trash2 className="size-3.5" />
                        </button>
                    </div>
                </td>
            </tr>

            <ProductModal
                open={open}
                onCloseAction={() => setOpen(false)}
                product={{
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    description: product.description,
                    sizes,
                    stockBySize,
                    colors,
                }}
                categories={categories}
            />
        </>
    );
};