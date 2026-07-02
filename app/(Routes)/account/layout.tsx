import { AccountHeader } from '@/app/(Routes)/account/AccountHeader';
import { AccountSidebar } from '@/app/(Routes)/account/AccountSidebar'
import React from 'react'

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className='max-w-7xl mx-auto px-4 '>
            {/* Account Header */}
            <AccountHeader />
            <div className='grid grid-cols-[260px_1fr] gap-6 py-7'>
                <AccountSidebar />
                <section className='bg-zinc-900'>
                    {children}
                </section>
            </div>
        </main>
    );
}

export default AccountLayout