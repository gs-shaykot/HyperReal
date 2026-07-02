import React from 'react';

const page = () => {
  return (
    <section className='space-y-4 p-6 text-zinc-100'>
      <div>
        <h1 className='text-2xl font-bold'>Account Overview</h1>
        <p className='mt-2 text-sm text-zinc-400'>A quick summary of your account activity and profile status.</p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='border border-zinc-800 bg-[#0f0f0f] p-4'>
          <h2 className='text-sm uppercase tracking-[0.2em] text-zinc-500'>Profile</h2>
          <p className='mt-2 text-zinc-300'>Keep your personal details, contact info, and preferences up to date.</p>
        </div>
        <div className='border border-zinc-800 bg-[#0f0f0f] p-4'>
          <h2 className='text-sm uppercase tracking-[0.2em] text-zinc-500'>Recent Activity</h2>
          <p className='mt-2 text-zinc-300'>Track orders, saved items, and other account actions from one place.</p>
        </div>
      </div>
    </section>
  );
};

export default page;