'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';

export const LatestProductCard = ({ products }: { products: any[] }) => {
    console.log(products)

    const theme = useSelector((state: any) => state.themeToggle.mode);

    const featured = products[0];
    console.log(featured)
    const others = products.slice(1, 5);

    return (
        <div className={`${theme === 'light' ? 'bg-main/80 border-zinc-800' : 'bg-halfWhite'} relative overflow-hidden border-b border-zinc-800 my-10 py-10`}>
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: ` linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px) `,
                    backgroundSize: '40px 40px'
                }}
            />
            <section className="max-w-7xl mx-auto px-6 py-16 text-white relative z-10">

                {/* Heading */}
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-bold tracking-widest">
                        LATEST <span className="text-lime-400">RELEASES</span>
                    </h2>

                    <Link href="/products" className="text-sm text-gray-400 hover:text-second transition-colors duration-200">
                        VIEW ALL →
                    </Link>
                </div>

                {/* Layout */}
                <div className="grid lg:grid-cols-2 gap-8 ">
                    {/* Featured Product */}
                    <div className="relative w-full h-130 border group border-neutral-800 overflow-hidden">
                        <Image
                            src={featured.productImages[0].imageUrl}
                            alt={featured.name}
                            fill
                            className="object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-105 z-10"
                        />

                        <div className='absolute bottom-3 px-5 z-20 space-y-1'>
                            <h2 className='bg-second text-[10px] w-28 text-black p-1 font-bold'>FEATURED RELEASED</h2>
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
                    <div className="grid grid-cols-2 gap-6">
                        {others.map((product) => (
                            <div
                                key={product.id}
                                className=""
                            >

                            </div>
                        ))}

                    </div>
                </div>
            </section>
        </div>
    )
}
