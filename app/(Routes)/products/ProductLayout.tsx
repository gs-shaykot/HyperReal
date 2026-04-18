'use client'
import { Category } from '@/app/(Routes)/products/Category';
import { ProductCard } from '@/app/(Routes)/products/ProductCard';
import { ProductLayoutProps } from '@/app/types/Category';
import { useSelector } from 'react-redux';

export const ProductLayout = ({ categories, categoryId, products }: ProductLayoutProps) => {

    return ( 
        <main className={`light:bg-white/90 bg-main/80`}>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'> 
                <div className=" -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5  mb-10"> 
                    <h1 className={`light:text-zinc-900 text-white text-4xl font-bold uppercase tracking-wide`}>
                        All <span className="text-second">Products</span>
                    </h1>
                    <p className="mt-2 light:text-zinc-700 text-gray-200">
                        Archive of all available gear. Filter by category or search by collection.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
                    <aside className="lg:sticky lg:top-19.5 lg:self-start ">
                        {/* category */}
                        <Category categories={categories} categoryId={categoryId} />
                    </aside>
 
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