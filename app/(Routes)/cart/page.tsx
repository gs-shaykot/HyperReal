'use client'
import { fetchCartApi } from '@/lib/cartAPIs'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react'

const page = () => {
    const { data: session } = useSession();
    const { data: cart = [] } = useQuery({
        queryKey: ["cart"],
        queryFn: fetchCartApi,
        enabled: !!session?.user
    });
    
    useEffect(() => {
        console.log("Cart from Cart: ", cart);
    }, [cart])

    return (
        <div>
            CART
        </div>
    )
}

export default page