'use client'
import { useSession } from 'next-auth/react';
import React from 'react'

// i did as you said but there is a problem. When i reload the page, it doesn't check wether the theme is dark or light. if dark it should show the color text-red-600. in the screenshot i attached you can see that the theme is dark but the text color is showing pink. But when i change the theme to light and then back to dark, it shows the correct color.  
export const page = () => {
    const { data: session, status } = useSession();

    return (
        <div>
            <h1 className='light:text-red-600 text-pink-400'>Admin Dashboard</h1>
        </div>
    )
}

export default page;