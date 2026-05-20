import prisma from "@/lib/prisma"

export const getOrderDetails = async (orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            orderItems: {
                include: { variant: { include: { product: true } } }
            }
        }
    })
    return order;
}
export default getOrderDetails;