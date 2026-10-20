
"use client";

import { ProductDetailsProps } from "@/app/types/Category";
import { Check, HeartPlus, Minus, Package, Plus, Star, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/app/Hooks/useCart";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/app/Hooks/useWishlist";
import { useQuery } from "@tanstack/react-query";
import { Getwishlist } from "@/lib/account_helpers/wishlistAPI";
import axios from "axios";

type ReviewSummary = {
    averageRating: number;
    totalReviews: number;
};

export const ProductDetails = ({ product }: ProductDetailsProps) => {
    const { data: session } = useSession();
    const [isSizeSelected, setIsSizeSelected] = useState(false);

    const mutation = useCart();
    const toggleWishlistMutation = useWishlist();

    const { data: wishlistItems } = useQuery({
        queryKey: ["wishlist"],
        queryFn: Getwishlist,
    });

    const { data: reviewSummary } = useQuery<ReviewSummary>({
        queryKey: ["product-review-summary", product.id],
        queryFn: async () => {
            const response = await axios.get(
                `/api/products/${product.id}/reviews`
            );

            return {
                averageRating: response.data.data.averageRating,
                totalReviews: response.data.data.totalReviews,
            };
        },
        staleTime: 60_000,
    });

    const isWishlisted = useMemo(() => {
        return wishlistItems?.some(
            (item: any) => item?.product?.id === product.id
        );
    }, [wishlistItems, product.id]);

    const productVariants = useMemo(
        () => product.productVariants ?? [],
        [product.productVariants]
    );

    const Extractedcolor = useMemo(() => {
        const colors = new Map<string, string | null | undefined>();

        for (const variant of productVariants) {
            if (!colors.has(variant.color) || !colors.get(variant.color)) {
                colors.set(variant.color, variant.hex);
            }
        }

        return [...colors].map(([name, hex]) => ({ name, hex }));
    }, [productVariants]);

    const [selectedColor, setSelectedColor] = useState(
        Extractedcolor.find(
            (color) => color.name.toLowerCase() === "neon breach"
        )?.name ?? Extractedcolor[0]?.name
    );

    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    const ExtractedSize = useMemo(
        () =>
            [...new Set(
                productVariants.filter(
                    (variant) => variant.color === selectedColor
                )
            )],
        [productVariants, selectedColor]
    );

    const ExtractedVariant = useMemo(
        () =>
            productVariants.find(
                (variant) =>
                    variant.color === selectedColor &&
                    variant.size === selectedSize
            ),
        [productVariants, selectedColor, selectedSize]
    );

    const extractedStock = ExtractedVariant?.stock ?? 0;
    const isOutOfStock = selectedSize !== null && extractedStock <= 0;

    const SelectedImage = useMemo(() => {
        return (
            product.productImages?.find(
                (img) => img.color === selectedColor
            )?.imageUrl ?? product.productImages[1]?.imageUrl
        );
    }, [product.productImages, selectedColor]);

    const scrollToReviews = useCallback(() => {
        document
            .getElementById("product-reviews")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    const averageRating = reviewSummary?.averageRating ?? 0;
    const totalReviews = reviewSummary?.totalReviews ?? 0;

    const handlePrimaryAction = () => {
        if (!session?.user) {
            toast.custom(() => (
                <div className="bg-zinc-900! light:bg-white! text-second! text-sm light:text-zinc-900! light:shadow border border-zinc-800 light:border-0 px-4 py-2 rounded shadow flex items-center gap-2">
                    <X className="text-red-500" />
                    {isOutOfStock ? (
                        <>
                            Please sign in to get notified <br /> when this
                            item is back in stock
                        </>
                    ) : (
                        <>
                            Please sign in to add items <br /> to your cart
                        </>
                    )}
                </div>
            ));
            return;
        }

        if (!selectedSize) {
            toast.error("Please select a size");
            return;
        }

        if (isOutOfStock) {
            toast.success("We'll notify you when this item is back in stock.");
            return;
        }

        const selectedVariant = productVariants.find(
            (variant) =>
                variant.color === selectedColor &&
                variant.size === selectedSize
        );

        if (!selectedVariant) {
            toast.error("Selected variant not available");
            return;
        }

        mutation.mutate({
            variantId: selectedVariant.id,
            quantity,
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* IMAGES CONTAINER */}
                <div className="aspect-square bg-dark-surface border border-zinc-700 overflow-hidden relative">
                    <img
                        src={SelectedImage || "/placeholder.png"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* PRODUCT DETAILS */}
                <div>
                    {/* Basic Informations */}
                    <div>
                        <h1 className="text-xl text-second font-bold uppercase tracking-wide">
                            {product.category.name}{" "}
                            <span className="text-sm">
                                // {product.category.slug}
                            </span>
                        </h1>

                        <h1 className="light:text-zinc-900 text-white mt-3 text-3xl md:text-4xl font-bold uppercase italic mb-4">
                            {product.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="light:text-zinc-900 font-bold text-white text-2xl">
                                &#36;{Number(product.price).toFixed(2)}
                            </h2>

                            <button
                                type="button"
                                onClick={scrollToReviews}
                                aria-label={`Rated ${averageRating.toFixed(1)} out of 5 from ${totalReviews} reviews. Jump to reviews.`}
                                className="inline-flex min-h-8 items-center gap-2 border border-zinc-800 bg-[#101010] px-2.5 py-1 font-mono transition-colors hover:border-[#c8ff00] focus-visible:outline focus-visible:outline-[#c8ff00] cursor-pointer"
                            >
                                <span className="inline-flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            strokeWidth={1.5}
                                            fill={
                                                star <= Math.round(averageRating)
                                                    ? "#c8ff00"
                                                    : "transparent"
                                            }
                                            color={
                                                star <= Math.round(averageRating)
                                                    ? "#c8ff00"
                                                    : "#555555"
                                            }
                                        />
                                    ))}
                                </span>

                                <span className="text-[11px] text-zinc-400">
                                    {totalReviews > 0
                                        ? `${averageRating.toFixed(1)} · ${totalReviews} ${
                                              totalReviews === 1
                                                  ? "REVIEW"
                                                  : "REVIEWS"
                                          }`
                                        : "NO REVIEWS"}
                                </span>
                            </button>
                        </div>

                        {selectedSize === null ? (
                            <div className="flex items-center text-zinc-400 light:text-zinc-700 mt-2 py-1.5">
                                <span className="w-2 h-2 rounded-full bg-second mr-2" />
                                <p>Select a size to see availability</p>
                            </div>
                        ) : (
                            <div>
                                {extractedStock > 0 ? (
                                    <div className="flex items-center gap-3 my-2">
                                        <p className="text-second font-bold">
                                            In Stock:
                                        </p>
                                        <p>{extractedStock} in stock</p>
                                    </div>
                                ) : (
                                    <div className="bg-red-500/20 border border-red-500 px-3 py-2 my-2">
                                        <div className="flex items-center gap-2 text-red-400 text-sm">
                                            <Package size={18} />
                                            <p className="font-bold">
                                                Out of Stock
                                            </p>
                                        </div>
                                        <p className="text-zinc-500 text-sm mt-1">
                                            // This unit is depleted. Restock
                                            unscheduled — join the transmission
                                            list to get notified.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="light:text-zinc-800 text-zinc-200 mt-2">
                            {product.description}
                        </p>
                    </div>

                    {/* VARIANTS */}
                    <div className="border-b border-zinc-600 pb-10">
                        {/* COLORS */}
                        <div className="mb-5">
                            <h1 className="font-bold text-sm light:text-zinc-900 text-white mt-6 mb-2">
                                Colors:{" "}
                                <span className="text-second">
                                    {selectedColor}
                                </span>
                            </h1>

                            <div className="flex gap-3">
                                {Extractedcolor.map((color) => (
                                    <div
                                        className="flex justify-center items-center relative"
                                        key={color.name}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedColor(color.name);
                                                setSelectedSize(null);
                                            }}
                                            className={`w-8 h-8 rounded-full border ${
                                                selectedColor === color.name
                                                    ? "border-second"
                                                    : "border-gray-600"
                                            } ${
                                                !color.hex &&
                                                color.name.toLowerCase() ===
                                                    "neon breach"
                                                    ? "bg-second"
                                                    : !color.hex
                                                      ? "bg-[#1d2122]"
                                                      : ""
                                            }`}
                                            style={
                                                color.hex
                                                    ? {
                                                          backgroundColor:
                                                              color.hex,
                                                      }
                                                    : undefined
                                            }
                                            title={color.name}
                                            aria-label={color.name}
                                        />

                                        {selectedColor === color.name && (
                                            <Check
                                                className={`${
                                                    !color.hex &&
                                                    color.name.toLowerCase() ===
                                                        "neon breach"
                                                        ? "text-black"
                                                        : "text-white"
                                                } absolute font-bold pointer-events-none`}
                                                size={18}
                                                strokeWidth={3}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SIZES */}
                        <div className="mb-5">
                            <h1 className="font-bold text-sm light:text-zinc-900 text-white mb-2">
                                SELECT SIZE:
                            </h1>

                            <div>
                                {ExtractedSize.map((variant) => (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedSize(variant.size)
                                        }
                                        className={`border border-zinc-500 px-3 py-1.5 mr-2 ${
                                            selectedSize === variant.size
                                                ? "bg-second light:text-white text-black"
                                                : "light:text-black text-white"
                                        }`}
                                    >
                                        {variant.size || "One Size"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 mt-2">
                            {/* Quantity */}
                            <div className="flex items-center gap-4 border border-zinc-600">
                                <motion.div
                                    className="hover:bg-second group p-1.5 cursor-pointer"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Minus
                                        className="light:text-black text-white group-hover:light:text-white group-hover:text-black"
                                        onClick={() =>
                                            setQuantity((prev) =>
                                                prev > 1 ? prev - 1 : prev
                                            )
                                        }
                                    />
                                </motion.div>

                                <span className="light:text-black text-white">
                                    {quantity}
                                </span>

                                <motion.div
                                    className="hover:bg-second group p-1.5 cursor-pointer"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Plus
                                        className="light:text-black text-white group-hover:light:text-white group-hover:text-black"
                                        onClick={() =>
                                            setQuantity((prev) =>
                                                prev < 10 ? prev + 1 : prev
                                            )
                                        }
                                    />
                                </motion.div>
                            </div>

                            {/* ADD TO CART BUTTON */}
                            <div className="flex-1">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePrimaryAction}
                                    className="cursor-pointer w-full bg-second py-1.5 shadow-none rounded-none font-semibold light:text-white text-black"
                                >
                                    {isOutOfStock ? "Notify me" : "Add to Cart"}
                                </motion.button>
                            </div>

                            {/* WISHLIST */}
                            <div>
                                <motion.button
                                    onClick={() => {
                                        if (!session?.user) {
                                            toast.error(
                                                "Please sign in to manage your wishlist"
                                            );
                                            return;
                                        }

                                        if (!isWishlisted && !selectedSize) {
                                            toast.error(
                                                "Please select a size"
                                            );
                                            return;
                                        }

                                        if (!isWishlisted && !ExtractedVariant) {
                                            toast.error(
                                                "Selected variant not available"
                                            );
                                            return;
                                        }

                                        toggleWishlistMutation.mutate({
                                            productId: product.id,
                                            isWishlisted,
                                            variantId:
                                                ExtractedVariant?.id ?? "",
                                        });
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`border py-1.5 px-3 cursor-pointer transition hover:scale-105 ${
                                        isWishlisted
                                            ? "bg-second/30 border-second text-second"
                                            : "border-zinc-600"
                                    }`}
                                >
                                    <HeartPlus />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="tabs tabs-border">
                        <input
                            type="radio"
                            name="my_tabs_2"
                            className="tab px-5 pl-0 light:text-zinc-900 text-white/90"
                            aria-label="DETAILS"
                        />
                        <div className="tab-content light:text-zinc-900 text-white/70 font-light mt-3 text-sm">
                            <p>
                                Constructed from premium industrial-grade
                                materials. Reinforced stitching at stress
                                points. Designed in Neo-Tokyo.
                            </p>
                        </div>

                        <input
                            type="radio"
                            name="my_tabs_2"
                            className="tab px-5 pl-0 light:text-zinc-900 text-white/90"
                            aria-label="SHIPPING"
                            defaultChecked
                        />
                        <div className="tab-content light:text-zinc-900 text-white/70 font-light mt-3 text-sm">
                            <p>
                                Free worldwide shipping on orders over $2500.
                                Standard delivery 5-7 business days. Express
                                available at checkout.
                            </p>
                        </div>

                        <input
                            type="radio"
                            name="my_tabs_2"
                            className="tab px-5 pl-0 light:text-zinc-900 text-white/90"
                            aria-label="RETURNS"
                        />
                        <div className="tab-content light:text-zinc-900 text-white/70 font-light mt-3 text-sm">
                            <p>
                                30-day return policy. Items must be unworn with
                                tags attached. Free returns on all domestic
                                orders.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
