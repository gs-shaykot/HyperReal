import { ProductLayoutProps } from '@/app/types/Category';
import { Funnel } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';

export const Category = ({ categories, activeId }: ProductLayoutProps) => {
    const theme = useSelector((state: any) => state.themeToggle.mode);

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

    const indentifyClassName = (isActive: boolean) => ` 
        cursor-pointer underline-offset-4
        transition-all duration-300 ease-out
        ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-800'} 
        ${isActive ? `
            text-blue-600 font-bold
            before:w-2 before:h-2 before:bg-second
            before:rounded-full before:inline-block before:mr-2
            translate-x-2
        ` : ''}`;


    return (
        <div>
            <div className={`border-b ${theme === 'light' ? 'border-zinc-800' : 'border-gray-300/85'} `}>
                <h2 className={`font-semibold mb-4 flex items-center text-second`}>
                    <Funnel />
                    Categories
                </h2>
            </div>
            <ul className='flex flex-col gap-3 mt-4 '>
                <li
                    onClick={() => setCategory(null)}
                    className={`${indentifyClassName(activeId === null)} cursor-pointer hover:text-second hover:translate-x-1 transition-transform duration-200 ease-out`}
                >
                    All
                </li>
                {categories.map((category) => {
                    const isActive = activeId === category.id;

                    return (
                        <li
                            key={category.id}
                            onClick={() => setCategory(category.id ?? null)}
                            className={`${indentifyClassName(activeId === category.id)} cursor-pointer hover:text-second hover:translate-x-1 transition-transform duration-200 ease-out`}
                        >
                            {category.name}
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}
