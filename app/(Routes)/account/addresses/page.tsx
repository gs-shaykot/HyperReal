import React from 'react';

const page = () => {
    return (
        <section className='space-y-4 p-6 text-zinc-100'>
            <div>
                <h1 className='text-2xl font-bold'>Addresses</h1>
                <p className='mt-2 text-sm text-zinc-400'>Manage saved shipping and billing addresses for faster checkout.</p>
            </div>

            <div className='border border-zinc-800 bg-[#0f0f0f] p-4'>
                <p className='text-zinc-300'>You have not added any addresses yet.</p>
            </div>
        </section>
    );
};

export default page;