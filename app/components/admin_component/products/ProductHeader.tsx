
"use client";

import { ProductModal } from "@/app/components/admin_component/products/ProductModal";
import { Category } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type ProductHeaderProps = {
    total: number;
    categories: Category[];
};

export const ProductHeader = ({
    total,
    categories,
}: ProductHeaderProps) => {
    const router = useRouter();

    const [productModalOpen, setProductModalOpen] = useState(false);
    const [categorySectionOpen, setCategorySectionOpen] = useState(false);
    const [categoryName, setCategoryName] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const handleCreateCategory = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const name = categoryName.trim().replace(/\s+/g, " ");

        if (!name) {
            toast.error("Enter a category name.");
            return;
        }

        if (name.length > 60) {
            toast.error("Category name must be 60 characters or fewer.");
            return;
        }

        setIsCreatingCategory(true);

        try {
            const response = await axios.post("/api/admin/categories", {
                name,
            });

            toast.success(
                response.data.message || "Category created successfully."
            );

            setCategoryName("");

            // Refresh server-provided categories used by the filter and product modal.
            router.refresh();
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

            toast.error(message || "Failed to create category.");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-bold tracking-[0.08em] text-white light:text-zinc-900">
                            PRODUCTS
                        </h1>

                        <p className="mt-1 font-mono text-xs text-zinc-500">
                            {total} products
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setCategorySectionOpen((open) => !open)
                            }
                            aria-expanded={categorySectionOpen}
                            aria-controls="manage-categories"
                            className={`inline-flex h-9 items-center gap-2 border px-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                                categorySectionOpen
                                    ? "border-second text-second"
                                    : "border-zinc-800 text-white hover:border-second hover:text-second light:border-zinc-300 light:text-zinc-900"
                            }`}
                        >
                            {categorySectionOpen ? (
                                <ChevronDown
                                    size={14}
                                    className="rotate-180"
                                />
                            ) : (
                                <Plus size={14} />
                            )}
                            CATEGORY
                        </button>

                        <button
                            type="button"
                            onClick={() => setProductModalOpen(true)}
                            className="inline-flex h-9 items-center gap-2 bg-second px-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-black transition-opacity hover:opacity-90"
                        >
                            <Plus size={14} />
                            ADD PRODUCT
                        </button>
                    </div>
                </div>

                {categorySectionOpen && (
                    <section
                        id="manage-categories"
                        className="border border-zinc-800 bg-black/10 p-4 light:border-zinc-200 light:bg-zinc-50"
                    >
                        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.1em] text-white light:text-zinc-900">
                            MANAGE CATEGORIES
                        </h2>

                        <form
                            onSubmit={handleCreateCategory}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <input
                                type="text"
                                value={categoryName}
                                onChange={(event) =>
                                    setCategoryName(event.target.value)
                                }
                                maxLength={60}
                                placeholder="New category name (e.g. Eyewear)"
                                aria-label="New category name"
                                disabled={isCreatingCategory}
                                className="h-11 min-w-0 flex-1 border border-zinc-800 bg-transparent px-4 font-mono text-xs text-white outline-none placeholder:text-zinc-500 focus:border-second disabled:opacity-60 light:border-zinc-300 light:text-zinc-900"
                            />

                            <button
                                type="submit"
                                disabled={
                                    isCreatingCategory ||
                                    !categoryName.trim()
                                }
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-second px-5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isCreatingCategory ? (
                                    <>
                                        <span className="size-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                        ADDING...
                                    </>
                                ) : (
                                    "ADD CATEGORY"
                                )}
                            </button>
                        </form>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <span
                                        key={category.id}
                                        className="border border-zinc-800 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-400 light:border-zinc-300 light:text-zinc-600"
                                    >
                                        {category.name}
                                    </span>
                                ))
                            ) : (
                                <p className="font-mono text-[10px] text-zinc-500">
                                    No categories created yet.
                                </p>
                            )}
                        </div>
                    </section>
                )}
            </div>

            <ProductModal
                open={productModalOpen}
                onCloseAction={() => setProductModalOpen(false)}
                categories={categories}
            />
        </>
    );
};
