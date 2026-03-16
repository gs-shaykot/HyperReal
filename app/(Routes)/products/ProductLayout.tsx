'use client'
import { Category } from '@/app/(Routes)/products/Category';
import { ProductCard } from '@/app/(Routes)/products/ProductCard';
import { ProductLayoutProps } from '@/app/types/Category';
import { useSelector } from 'react-redux';

export const ProductLayout = ({ categories, categoryId, products }: ProductLayoutProps) => {
    const theme = useSelector((state: any) => state.themeToggle.mode);

    return (
        <main className={`${theme === 'light' ? 'bg-main/80' : 'bg-white/90'}`}>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>

                {/* Sticky Red Header - stays below navbar */}
                <div className=" -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5 bg-zinc-950/90 mb-10">
                    <h1 className={`${theme === 'light' ? 'text-white' : 'text-zinc-900'} text-4xl font-bold uppercase tracking-wide`}>
                        All <span className="text-second">Products</span>
                    </h1>
                    <p className="mt-2 text-gray-200">
                        Archive of all available gear. Filter by category or search by collection.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
                    {/* Sticky Sidebar - stays below header */}
                    <aside className="lg:sticky lg:top-19.5 lg:self-start ">
                        <Category categories={categories} categoryId={categoryId} />
                    </aside>

                    {/* Product Cards scroll underneath */}
                    <section>
                        <div className="min-h-100">
                            <ProductCard products={products} />
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};