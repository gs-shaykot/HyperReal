import Image from 'next/image'

export const ComboPack = () => {
    return (
        <section className='py-10'>
            <div className='max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
                <div className='p-2 relative'>
                    <Image src='https://res.cloudinary.com/dloasaxt1/image/upload/v1774972677/Gemini_Generated_Image_27smmz27smmz27sm_i8wim3.png' alt='ComboPack'
                        className='border light:border-zinc-400 border-zinc-700 p-2 box-border'
                        width={500} height={500} />
                    <span className='absolute top-0 left-8 light:bg-white bg-main light:border-zinc-500 border light:text-zinc-900 text-white text-xs font-bold px-2 py-1'>UNFILTERED</span>
                </div>
                <div className='space-y-7'>
                    <h1 className='text-6xl font-bold light:text-zinc-900 text-white '>
                        CHAOS & <br /> <span className='text-second'>CONTROL</span>
                    </h1>

                    <p className='w-10/12 light:text-zinc-600 text-zinc-300'>
                        Our latest editorial explores the tension between urban decay and digital perfection. Shot on location in Tokyo's underground districts.
                    </p>
                    
                    
                    <ul className='list-[circle] list-inside mt-4 light:text-zinc-900 text-white marker:text-second'>
                        <li>CYBER-SHELL PARKA</li>
                        <li>STEALTH JOGGER</li>
                        <li>Void Runner V2</li>
                    </ul>
                    <button className='btn rounded-none shadow-none bg-transparent hover:bg-white light:hover:bg-main hover:text-zinc-900 light:hover:text-white light:border-zinc-900 border-white '>
                        READ THE STORY
                    </button>
                </div>
            </div>
        </section>
    )
}
