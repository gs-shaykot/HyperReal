import React from 'react';

const page = () => {
    return (
        <section className='space-y-4 p-6 text-zinc-100'>
            <div>
                <h1 className='text-2xl font-bold'>Settings</h1>
                <p className='mt-2 text-sm text-zinc-400'>Update your account preferences, security options, and notification settings.</p>
            </div>

            <div className='border border-zinc-800 bg-[#0f0f0f] p-4'>
                <p className='text-zinc-300'>Settings controls can be added here when you are ready to wire up the forms.</p>
            </div>
        </section>
    );
};

export default page;