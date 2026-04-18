import { ProductLayoutProps } from '@/app/types/Category';
import { Funnel } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'; 
export const Category = ({ categories, categoryId }: ProductLayoutProps) => { 

    const router = useRouter();
    const searchParams = useSearchParams();

    const setCategory = (categoryId: string | number | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (categoryId === null) {
            params.delete('category');
        }
        else {
            params.set('category', String(categoryId));
        }
        router.push(`/products?${params.toString()}`);
    };
 
    const activeCategoryClass = (isActive: boolean) => ` 
        cursor-pointer 
        transition-all duration-300 ease-out 
        ${isActive ? ` 
            lg:before:w-2 lg:before:h-2 lg:before:bg-second
            lg:before:rounded-full lg:before:inline-block lg:before:mr-2
            lg:translate-x-2
            bg-second lg:bg-transparent ` : ''}`;


    return (
        <div className=''> 
            <div className={`border-b `}>
                <h2 className={`font-semibold mb-4 flex items-center text-second`}>
                    <Funnel />
                    Categories
                </h2>
            </div>
            <ul className='flex flex-wrap lg:flex-col gap-2 md:gap-3 mt-4 '>
                <li
                    onClick={() => setCategory(null)}
                    className={`${activeCategoryClass(categoryId === null)}text-xs sm:text-base border lg:border-0 p-1 lg:p-0 cursor-pointer hover:text-second lg:hover:translate-x-1 transition-transform duration-200 ease-out`}
                >
                    All
                </li>
                {categories.map((category) => {
                    const isActive = categoryId === category.id;

                    return (
                        <li
                            key={category.id}
                            onClick={() => setCategory(category.id ?? null)}
                            className={`${activeCategoryClass(categoryId === category.id)}text-xs md:text-base border lg:border-0 p-1 lg:p-0 cursor-pointer hover:text-second lg:hover:translate-x-1 transition-transform duration-200 ease-out`}
                        >
                            {category.name}
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}