import { CategoryProps } from '@/app/types/Category'
import { Funnel } from 'lucide-react'
import { useState } from 'react';
import { useSelector } from 'react-redux';

export const Category = ({ categories }: CategoryProps) => {
    const theme = useSelector((state: any) => state.themeToggle.mode);
    const [activeId, setActiveId] = useState<string | number | null>(null);

    const indentifyClassName = (isActive: boolean) => ` 
        cursor-pointer hover:underline
        ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-800'} 
         ${isActive ? `
                text-blue-600 font-bold
                before:w-2 before:h-2 before:bg-second
                before:rounded-full before:inline-block before:mr-2
                relative left-2
  ` : ''} 
    `;

    return (
        <div>
            <div className={`border-b ${theme === 'light' ? 'border-zinc-800' : 'border-gray-300/85'} `}>
                <h2 className={`font-semibold mb-4 flex items-center text-second`}>
                    <Funnel />
                    Categories
                </h2>
            </div>
            <ul className='flex flex-col gap-3 mt-4'>
                <li
                    onClick={() => setActiveId(null)}
                    className={`${indentifyClassName(activeId === null)}`}
                >
                    All
                </li>
                {categories.map((category) => {
                    const isActive = activeId === category.id;

                    return (
                        <li
                            key={category.id}
                            onClick={() => setActiveId(category.id)}
                            className={`${indentifyClassName(activeId === category.id)}  hover:relative hover:left-2`}
                        >
                            {category.name}
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}
