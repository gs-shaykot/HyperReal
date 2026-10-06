"use client";
import { X, Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Category = {
    id: string;
    name: string;
};

export type ProductModalData = {
    name?: string;
    category?: Category;
    price?: number;
    description?: string;
    badge?: string;
    sizes?: string[];
    stock?: number;
    stockBySize?: Record<string, number>;
    imageUrl?: string;
};

type ProductModalProps = {
    open: boolean;
    onCloseAction: () => void;
    product?: ProductModalData;
    categories: Category[];
};

const BADGES = [
    "NEW",
    "BESTSELLER",
    "LIMITED",
    "DROP 004",
    "RESTOCK",
    "SALE",
    "3-PACK",
];

const SIZES = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "30",
    "32",
    "34",
    "36",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "ONE SIZE",
];

export const ProductModal = ({ open, onCloseAction, product, categories }: ProductModalProps) => {
    const isEdit = Boolean(product);

    const [name, setName] = useState("");

    const [category, setCategory] = useState("");

    const [price, setPrice] = useState("");

    const [description, setDescription] = useState("");

    const [badge, setBadge] = useState("");

    const [sizes, setSizes] = useState<string[]>([]);

    const [sameStockForEverySize, setSameStockForEverySize] = useState(true);

    const [sameStock, setSameStock] = useState("");

    const [stockBySize, setStockBySize] = useState<Record<string, string>>({});

    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        if (product) {
            setName(product.name ?? "");

            setCategory(
                product.category?.id ?? ""
            );

            setPrice(
                product.price !== undefined
                    ? String(product.price)
                    : ""
            );

            setDescription(
                product.description ?? ""
            );

            setBadge(
                product.badge ?? ""
            );

            const productSizes = product.sizes ?? [];

            setSizes(productSizes);

            setSameStockForEverySize(true);

            setSameStock(
                product.stock !== undefined
                    ? String(product.stock)
                    : ""
            );

            setStockBySize(
                product.stockBySize
                    ? Object.fromEntries(
                        Object.entries(product.stockBySize).map(
                            ([size, stock]) => [
                                size,
                                String(stock),
                            ]
                        )
                    )
                    : Object.fromEntries(
                        productSizes.map((size) => [
                            size,
                            "0",
                        ])
                    )
            );

            setImageUrl(
                product.imageUrl ?? ""
            );

            return;
        }

        setName("");
        setCategory("");
        setPrice("");
        setDescription("");
        setBadge("");
        setSizes([]);
        setSameStockForEverySize(true);
        setSameStock("");
        setStockBySize({});
        setImageUrl("");
    }, [product, open]);

    if (!open) {
        return null;
    }

    const toggleSize = (
        size: string
    ) => {
        setSizes((current) => {
            const selected = current.includes(size);

            if (selected) {
                setStockBySize((stocks) => {
                    const next = { ...stocks };
                    delete next[size];
                    return next;
                });

                return current.filter(
                    (item) => item !== size
                );
            }

            setStockBySize((stocks) => ({
                ...stocks,
                [size]: sameStock || "0",
            }));

            return [...current, size];
        });
    };

    const handleSameStockChange = (checked: boolean) => {
        setSameStockForEverySize(checked);

        if (!checked) {
            setStockBySize((current) => {
                const next = { ...current };

                sizes.forEach((size) => {
                    if (next[size] === undefined) {
                        next[size] = sameStock || "0";
                    }
                });

                return next;
            });
        }
    };

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        const data = {
            name,
            category,
            price: Number(price),
            description,
            badge,
            sizes,
            stock: sameStockForEverySize ? Number(sameStock) : undefined,
            stockBySize: sameStockForEverySize
                ? Object.fromEntries(
                    sizes.map((size) => [
                        size,
                        Number(sameStock),
                    ])
                )
                : Object.fromEntries(
                    sizes.map((size) => [
                        size,
                        Number(stockBySize[size] ?? 0),
                    ])
                ),
            imageUrl,
        };

        console.log(
            isEdit
                ? "Edit product:"
                : "Add product:",
            data
        );

        /*
         * Actual API/database operation will be
         * connected when we build product CRUD.
         */
    };

    return createPortal(
        <dialog className="modal modal-open">
            <div
                className="
                    modal-box
                    max-w-3xl
                    rounded-none
                    border
                    border-zinc-800
                    bg-main
                    p-0
                    text-white
                    shadow-xl
                    light:bg-white
                    light:text-zinc-900
                "
            >
                {/* Header */}
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-zinc-800
                        px-6
                        py-4
                        light:border-zinc-300
                    "
                >
                    <h2
                        className="
                            font-mono
                            text-base
                            font-bold
                            uppercase
                            tracking-[0.12em]
                        "
                    >
                        {isEdit
                            ? "EDIT PRODUCT"
                            : "ADD PRODUCT"}
                    </h2>

                    <button
                        type="button"
                        onClick={onCloseAction}
                        className="
                            text-zinc-400
                            transition-colors
                            hover:text-white
                            light:hover:text-zinc-900
                            cursor-pointer
                        "
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Content */}
                <form
                    onSubmit={handleSubmit}
                    className="max-h-[calc(100vh-140px)] overflow-y-auto px-6 py-6"
                >
                    {/* Product Name */}
                    <div>
                        <label
                            className="
                                mb-2
                                block
                                font-mono
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-zinc-400
                                light:text-zinc-700
                            "
                        >
                            Product Name *
                        </label>

                        <input
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            required
                            className="
                                h-12
                                w-full
                                rounded-none
                                border
                                border-zinc-800
                                bg-dark
                                px-4
                                font-mono
                                text-sm
                                text-white
                                outline-none
                                focus:border-zinc-500
                                light:border-zinc-300
                                light:bg-white
                                light:text-zinc-900
                            "
                        />
                    </div>

                    {/* Category + Price */}
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label
                                className="
                                    mb-2
                                    block
                                    font-mono
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-zinc-400
                                    light:text-zinc-700
                                "
                            >
                                Category *
                            </label>

                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(
                                        event.target.value
                                    )
                                }
                                required
                                className="
                                    h-12
                                    w-full
                                    rounded-none
                                    border
                                    border-zinc-800
                                    bg-dark
                                    px-4
                                    font-mono
                                    text-sm
                                    text-white
                                    outline-none
                                    focus:border-zinc-500
                                    light:border-zinc-300
                                    light:bg-white
                                    light:text-zinc-900
                                "
                            >
                                <option value="">
                                    Select category
                                </option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                className="
                                    mb-2
                                    block
                                    font-mono
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-zinc-400
                                    light:text-zinc-700
                                "
                            >
                                Price (USD) *
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(event) =>
                                    setPrice(
                                        event.target.value
                                    )
                                }
                                required
                                className="
                                    h-12
                                    w-full
                                    rounded-none
                                    border
                                    border-zinc-800
                                    bg-dark
                                    px-4
                                    font-mono
                                    text-sm
                                    text-white
                                    outline-none
                                    focus:border-zinc-500
                                    light:border-zinc-300
                                    light:bg-white
                                    light:text-zinc-900
                                "
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-5">
                        <label
                            className="
                                mb-2
                                block
                                font-mono
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-zinc-400
                                light:text-zinc-700
                            "
                        >
                            Description *
                        </label>

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            required
                            rows={4}
                            className="
                                w-full
                                resize-none
                                rounded-none
                                border
                                border-zinc-800
                                bg-dark
                                px-4
                                py-3
                                font-mono
                                text-sm
                                leading-relaxed
                                text-white
                                outline-none
                                focus:border-zinc-500
                                light:border-zinc-300
                                light:bg-white
                                light:text-zinc-900
                            "
                        />
                    </div>

                    {/* Badge */}
                    <div className="mt-6">
                        <label
                            className="
                                mb-2
                                block
                                font-mono
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-zinc-400
                                light:text-zinc-700
                            ">
                            Badge
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {BADGES.map(
                                (item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setBadge(badge === item ? "" : item)}
                                        className={`
                                            h-8
                                            border
                                            px-3
                                            font-mono
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            transition-colors
                                            cursor-pointer
                                            ${badge ===
                                                item
                                                ? "border-second bg-second text-black"
                                                : "border-zinc-800 text-zinc-400 hover:border-zinc-500"
                                            }
                                        `}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="mt-6">
                        <label
                            className="
                                mb-2
                                block
                                font-mono
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-zinc-400
                                light:text-zinc-700
                            "
                        >
                            Sizes
                        </label>

                        <div className="flex flex-wrap gap-2">
                            {SIZES.map((size) => {
                                const selected = sizes.includes(size);

                                return (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() =>
                                            toggleSize(
                                                size
                                            )
                                        }
                                        className={`
                                                min-w-11
                                                h-8
                                                border
                                                px-3
                                                font-mono
                                                text-[9px]
                                                font-bold
                                                transition-colors
                                                cursor-pointer
                                                ${selected
                                                ? "border-second bg-second text-black"
                                                : "border-zinc-800 text-zinc-400 hover:border-zinc-500"
                                            }
                                            `}
                                    >
                                        {size}
                                    </button>
                                );
                            }
                            )}
                        </div>
                    </div>

                    {/* Stock */}
                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between gap-4">
                            <label
                                className="
                                    block
                                    font-mono
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-zinc-400
                                    light:text-zinc-700
                                "
                            >
                                Stock
                            </label>

                            <label
                                className="
                                    flex
                                    cursor-pointer
                                    items-center
                                    gap-2
                                    font-mono
                                    text-[9px]
                                    font-bold
                                    uppercase
                                    tracking-[0.08em]
                                    text-zinc-400
                                    light:text-zinc-700
                                "
                            >
                                <input
                                    type="checkbox"
                                    checked={sameStockForEverySize}
                                    onChange={(event) => handleSameStockChange(event.target.checked)}
                                    className="
                                        size-3.5
                                        cursor-pointer
                                        accent-second
                                    "
                                />

                                Same stock for every size
                            </label>
                        </div>

                        {sizes.length === 0 ? (
                            <div
                                className="
                                    flex
                                    min-h-11
                                    items-center
                                    border
                                    border-dashed
                                    border-zinc-800
                                    px-4
                                    font-mono
                                    text-[10px]
                                    text-zinc-500
                                    light:border-zinc-300
                                "
                            >
                                // Select sizes first to set stock
                            </div>
                        ) : sameStockForEverySize ? (
                            <input
                                type="number"
                                min="0"
                                value={sameStock}
                                onChange={(event) =>
                                    setSameStock(
                                        event.target.value
                                    )
                                }
                                className="
                                    h-11
                                    w-full
                                    rounded-none
                                    border
                                    border-zinc-800
                                    bg-dark
                                    px-4
                                    font-mono
                                    text-sm
                                    text-white
                                    outline-none
                                    focus:border-zinc-500
                                    light:border-zinc-300
                                    light:bg-white
                                    light:text-zinc-900
                                "
                            />
                        ) : (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                                {sizes.map((size) => (
                                    <div
                                        key={size}
                                        className="
                                            flex
                                            h-11
                                            border
                                            border-zinc-800
                                            bg-dark
                                            light:border-zinc-300
                                            light:bg-white
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                w-12
                                                shrink-0
                                                items-center
                                                justify-center
                                                border-r
                                                border-zinc-800
                                                font-mono
                                                text-[10px]
                                                font-bold
                                                text-zinc-400
                                                light:border-zinc-300
                                                light:text-zinc-700
                                            "
                                        >
                                            {size}
                                        </div>

                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                stockBySize[
                                                size
                                                ] ?? "0"
                                            }
                                            onChange={(event) =>
                                                setStockBySize(
                                                    (current) => ({
                                                        ...current,
                                                        [size]: event.target.value,
                                                    })
                                                )
                                            }
                                            className="
                                                min-w-0
                                                flex-1
                                                bg-transparent
                                                px-3
                                                font-mono
                                                text-sm
                                                text-white
                                                outline-none
                                                light:text-zinc-900
                                            "
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Image URL */}
                    <div className="mt-6">
                        <label
                            className="
                                mb-2
                                block
                                font-mono
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-zinc-400
                                light:text-zinc-700
                            "
                        >
                            Image URL
                        </label>

                        <input
                            value={imageUrl}
                            onChange={(event) =>
                                setImageUrl(
                                    event.target.value
                                )
                            }
                            className="
                                h-12
                                w-full
                                rounded-none
                                border
                                border-zinc-800
                                bg-dark
                                px-4
                                font-mono
                                text-sm
                                text-white
                                outline-none
                                focus:border-zinc-500
                                light:border-zinc-300
                                light:bg-white
                                light:text-zinc-900
                            "
                        />
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex gap-3">
                        <button
                            type="submit"
                            className="
                                flex
                                h-12
                                flex-1
                                items-center
                                justify-center
                                gap-2
                                bg-second
                                font-mono
                                text-[11px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-black
                                transition-opacity
                                hover:opacity-90
                                cursor-pointer
                            "
                        >
                            <Check className="size-4" />

                            {isEdit
                                ? "SAVE CHANGES"
                                : "ADD PRODUCT"}
                        </button>

                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="
                                h-12
                                border
                                border-zinc-800
                                px-7
                                font-mono
                                text-[11px]
                                font-bold
                                uppercase
                                tracking-[0.12em]
                                text-white
                                transition-colors
                                hover:bg-zinc-900
                                light:border-zinc-300
                                light:text-zinc-900
                                light:hover:bg-zinc-100
                                cursor-pointer
                            "
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>

            {/* Backdrop */}
            <form
                method="dialog"
                className="modal-backdrop"
            >
                <button
                    type="button"
                    onClick={onCloseAction}
                >
                    close
                </button>
            </form>
        </dialog>,
        document.body
    );
};