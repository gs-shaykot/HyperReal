import { AdminOrders } from '@/app/components/admin_component/orders/AdminOrders';
import { getAdminOrders } from '@/utils/AdminUtils/getAdminOrders';
import React from 'react'

const OrderPage = async () => {
    const [ordersData] = await Promise.all([
        getAdminOrders({ page: 1, }),
    ]);
    console.log("ordersData", ordersData)
    return (
        <div className="bg-main light:bg-white min-h-screen p-4">
            <div>
                <h1 className="text-lg font-bold tracking-[0.08em] text-white light:text-zinc-900">
                    ORDERS
                </h1> 
            </div>

            <AdminOrders
                initialOrders={ordersData.orders}
                initialTotal={ordersData.total}
                initialTotalPages={ordersData.totalPages}
            />
        </div>
    )
}

export default OrderPage