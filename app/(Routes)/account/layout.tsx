import { AccountHeader } from '@/app/(Routes)/account/AccountHeader';
import { AccountSidebar } from '@/app/(Routes)/account/AccountSidebar'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import React from 'react'

const AccountLayout = async ({ children }: { children: React.ReactNode }) => {

    const session = await getServerSession(authOptions);
    const { id, name, email } = session?.user || {};

    const [orderCount, TotalPayment] = await prisma.$transaction([
        prisma.order.count({
            where: {
                userId: id
            }
        }),
        prisma.payment.aggregate({
            where: {
                order: {
                    userId: id,
                }
            },
            _sum: {
                totalProductPriceInUSD: true,
            }
        })
    ]);

    console.log("Order Count: ", orderCount);
    console.log("Total Payment: ", TotalPayment._sum.totalProductPriceInUSD);

    return (
        <main className='max-w-7xl mx-auto px-4 '>
            {/* Account Header */}
            <AccountHeader />
            <div className='grid grid-cols-[260px_1fr] gap-6 py-7'>
                <AccountSidebar orderCount={orderCount as number} TotalPayment={TotalPayment._sum.totalProductPriceInUSD as number} />
                <section>
                    {children}
                </section>
            </div>
        </main>
    );
}

export default AccountLayout