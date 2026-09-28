import React from 'react'

type statCardProps = {
    title: string,
    value: string | number,
    subtitle: string,
    change: number,
    icon: React.ReactNode
}

export const OverviewStatCard = ({ title, value, subtitle, change, icon }: statCardProps) => {
    return (
        <article className='flex flex-col border border-white/15 bg-dark p-5 text-halfWhite light:border-black/15 light:bg-white light:text-main'>
            <div className='flex items-start justify-between gap-4'>
                <h2 className='font-mono text-sm font-bold tracking-[0.14em] text-white/65 light:text-main/65'>
                    {title}
                </h2>
                <div
                    aria-hidden='true'
                    className='flex size-10 shrink-0 items-center justify-center bg-white/10 text-second light:bg-main/5'
                >
                    <span className=' '>{icon}</span>
                </div>
            </div>

            <div className='mt-3'>
                <p className='font-mono text-xl font-bold leading-none tracking-tight text-white light:text-main'>
                    {value}
                </p>
                <p className='mt-2 font-mono text-sm text-white/60 light:text-main/60'>
                    {subtitle}
                </p>
                <p className={`${change >= 0 ? 'text-second' : 'text-red-500'} mt-4 font-mono text-sm font-bold tracking-wide `}>
                    {/* colorize the change ▲ or ▼ using css based on its value */}
                    <span aria-hidden='true'>
                        {change >= 0 ? '▲ ' : '▼ '}
                    </span>
                     {change >= 0 ? '+' : ''}{change}% vs last month
                </p>
            </div>
        </article>
    )
}
