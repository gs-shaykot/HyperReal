'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';

export const LatestProductCard = ({ products }: { products: any[] }) => {
    // console.log(products)

    const theme = useSelector((state: any) => state.themeToggle.mode);

    const featured = products[0];
    const others = products.slice(1, 5);
    // console.log(others)

    return (
        <div className={`${theme === 'light' ? 'bg-main/80 border-zinc-800' : 'bg-white'} relative overflow-hidden border-b border-zinc-800 py-5`}>
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: ` linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px) `,
                    backgroundSize: '40px 40px'
                }}
            />
            <section className="max-w-7xl mx-auto px-6 py-16 text-white relative z-10">

                {/* Heading */}
                <div className="flex justify-between items-center mb-7 md:mb-10">
                    <h2 className={`${theme === "dark" ? "text-zinc-900" : "text-white"} text-2xl md:text-4xl font-extrabold tracking-widest italic`}>
                        LATEST <span className="text-second">RELEASES</span>
                    </h2>

                    <Link href="/products" className="text-sm hidden md:block text-gray-400 group hover:text-second transition-colors duration-200 relative right-2">
                        VIEW ALL <span className='group-hover:relative group-hover:left-1 group-hover:transition group-hover:delay-150'>→</span>
                    </Link>
                </div>

                {/* Layout */}
                <div className="grid lg:grid-cols-2 gap-8 ">
                    {/* Featured Product */}
                    <div className="relative w-full h-134 border group border-neutral-800 overflow-hidden">
                        <Image
                            src={featured.productImages[0].imageUrl}
                            alt={featured.name}
                            fill
                            className="object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-105 z-10"
                        />

                        <div className='absolute bottom-3 px-5 z-20 space-y-1'>
                            <h2 className='bg-second text-[10px] w-30 text-black p-1 font-bold'>FEATURED RELEASED</h2>
                            <h2 className='text-3xl font-bold group-hover:text-second'>{featured.name}</h2>
                            <p className='text-sm text-zinc-400'>{featured.description}</p>
                            <div className="flex justify-between">
                                <h2 className='font-bold'>${featured.price.toFixed(2)}</h2>
                                <Link href={`/products/${featured.id}`} className="text-sm text-second">
                                    <span className="group-hover:mr-1 ease-linear  transition-all duration-100">SHOP NOW</span> →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Grid Products */}
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                        {others.map((product) => (
                            <div key={product.id} className="relative w-full h-64 border group hover:border-second border-neutral-800 overflow-hidden">
                                <Link href={`/products/${product.id}`} className="absolute inset-0 z-10">
                                    <div
                                        className="relative w-full h-64 group border border-neutral-800 overflow-hidden group"
                                    >
                                        {/* Product Image */}
                                        <Image
                                            src={product.productImages[1].imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                                        />

                                        {/* NEW badge */}
                                        <span className="absolute top-2 left-2 text-xs bg-second text-black px-2 py-1 z-20">
                                            NEW
                                        </span>
                                        <div className="absolute bottom-2 left-2 z-20">
                                            <p className="text-xs text-second uppercase">
                                                {product.category.name}
                                            </p>
                                            <h3 className="font-semibold group-hover:text-second">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-300">
                                                ${product.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div >

                <Link href="/products" className={`${theme === "dark" ? "text-zinc-900 border-zinc-800" : "text-second border-second"} text-sm block md:hidden group transition-colors duration-200 relative md:right-2 border py-2 text-center mt-3 `}>
                    VIEW ALL <span className='group-hover:relative group-hover:left-1 group-hover:transition group-hover:delay-150'>→</span>
                </Link>
            </section >
        </div >
    )
}
