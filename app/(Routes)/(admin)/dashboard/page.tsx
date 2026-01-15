'use client'
import { useSession } from 'next-auth/react';
import React from 'react'

export const page = () => {
    const { data: session, status } = useSession();
    console.log(session);

    return (
        <div>
            <h1>Admin Dashboard</h1>
        </div>
    )
}

export default page;