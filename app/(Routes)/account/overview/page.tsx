import { Identity } from "@/app/(Routes)/account/overview/Identity";
import StatCard from "@/app/(Routes)/account/StatCard";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ArrowRight, CircleCheckBig, Clock, Heart, Package, } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function OverviewPage() {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const session = await getServerSession(authOptions);

  const orders = await prisma.order.findMany({
    where: {
      userId: session?.user.id
    },
    select: {
      id: true,
      status: true,
      orderCode: true,
      createdAt: true,
      orderItems: {
        select: {
          quantity: true,
        }
      },
      payments: {
        select: {
          country: true,
          paidAmountInBDT: true,
          totalProductPriceInUSD: true,
        }
      }
    }
  })

  return (
    <div className="space-y-6 ">

      <div className="grid grid-cols-3 gap-5">
        <StatCard
          title="Orders"
          value={orders.length}
          icon={<Package />}
        />
        <StatCard
          title="Delivered"
          value={1}
          icon={<CircleCheckBig />}
        />
        <StatCard
          title="Wishlist"
          value={3}
          icon={<Heart />}
        />
      </div>

      <Identity />

      <div className="border border-neutral-700 bg-[#0f0f0f] light:bg-white p-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            RECENT ORDERS
          </h2>
          <div className="flex items-center text-sm text-second transition-colors hover:border-b hover:border-second">
            <Link href="/account/orders">
              View All
            </Link>
            <ArrowRight size={16} />
          </div>
        </div>

        {
          orders.length > 0 ? (
            <div>
              {
                orders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center border border-zinc-800 hover:border-second p-3 mb-2">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-second" />
                      <div>
                        <p>{order.orderCode}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <p>{order.createdAt.toLocaleDateString()}</p>
                          <span className="w-2 h-2 bg-transparent border border-second rounded-full" />
                          <p>{order.orderItems.reduce((total, item) => total + item.quantity, 0)} items</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {
                        order.payments.map((payment, index) => (
                          payment.country === 'BD' ? (
                            <p key={index} className="text-sm font-semibold">
                              ৳ {payment.paidAmountInBDT.toFixed(2)}
                            </p>
                          ) : (
                            <p key={index} className="text-sm font-semibold">
                              ${payment.totalProductPriceInUSD.toFixed(2)}
                            </p>
                          )
                        ))
                      }
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">
                No recent orders found.
              </p>
            </div>
          )
        }

      </div>

    </div>
  );
}