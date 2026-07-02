"use client"
import { Heart, MapPin, Package, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    title: "Overview",
    href: "/account/overview",
    icon: User,
  },
  {
    title: "Orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    title: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    title: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
  },
  {
    title: "Settings",
    href: "/account/settings",
    icon: Settings,
  },
];

export const AccountSidebar = ({ orderCount, TotalPayment }: { orderCount: number; TotalPayment: number }) => {
  const pathname = usePathname();

  return (
    <div>
      <div className='w-full bg-[#0f0f0f] border border-zinc-800 p-2 mb-3'>
        <ul className='flex flex-col gap-2'>
          {menus.map((menu) => (
            <li key={menu.title}>
              <Link
                href={menu.href}
                className={`flex items-center gap-3 p-2 text-sm font-medium transition-colors ${pathname === menu.href
                  ? "bg-second text-zinc-900 font-bold font-sans"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
              >
                <menu.icon className={`h-5 w-5 text-second ${pathname === menu.href ? "text-zinc-900" : ""}`}/>
                {menu.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className='w-full bg-[#0f0f0f] border border-zinc-800 p-2'>
        <ul>
          <li>
            <h2>TOTAL SPENT</h2>
            <span>${TotalPayment?.toFixed(2)}</span>
          </li>
          <li>
            <h2>ORDERS</h2>
            <span>{orderCount}</span>
          </li>
          <li>
            <h2>TIER</h2>
            <span>BRONZE</span>
          </li>
        </ul>
      </div>

    </div>
  )
}
