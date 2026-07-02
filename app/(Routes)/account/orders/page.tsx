import React from 'react';

const page = () => {
    return (
        <section className='space-y-4 p-6 text-zinc-100'>
            <div>
                <h1 className='text-2xl font-bold'>Orders</h1>
                <p className='mt-2 text-sm text-zinc-400'>Review your recent purchases, delivery progress, and order history.</p>
            </div>

            <div className='border border-zinc-800 bg-[#0f0f0f] p-4'>
                <p className='text-zinc-300'>No orders to display yet. Your order history will appear here once you place a purchase.</p>
            </div>
        </section>
    );
};

export default page;
