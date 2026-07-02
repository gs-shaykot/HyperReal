import React from 'react';

const page = () => {
    return (
        <section className='space-y-4 p-6 text-zinc-100'>
            <div>
                <h1 className='text-2xl font-bold'>Wishlist</h1>
                <p className='mt-2 text-sm text-zinc-400'>Keep track of products you want to revisit or buy later.</p>
            </div>

            <div className='border border-zinc-800 bg-[#0f0f0f] p-4'>
                <p className='text-zinc-300'>Your wishlist is empty for now.</p>
            </div>
        </section>
    );
};

export default page;