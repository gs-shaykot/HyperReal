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
    <div className="w-full lg:sticky lg:top-19.5 lg:self-start">
      {/* Menu */}
      <div className='w-full bg-[#0f0f0f] light:bg-white border border-zinc-800 p-2 mb-3'>
        <ul className='scrollbar-hidden flex flex-row flex-nowrap gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0'>
          {menus.map((menu) => (
            <li key={menu.title} className='shrink-0 lg:w-full'>
              <Link
                href={menu.href}
                className={`flex items-center gap-3 p-2 text-sm font-medium transition-colors whitespace-nowrap lg:justify-start justify-center ${pathname === menu.href
                  ? "bg-second text-zinc-900 light:text-white font-bold font-sans"
                  : "text-white light:text-zinc-900 hover:bg-zinc-800 hover:text-white"
                  }`}
              >
                <menu.icon className='h-5 w-5' />
                <span>{menu.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className='hidden w-full bg-[#0f0f0f] light:bg-white border border-zinc-800 p-2 lg:block'>
        <ul>
          <li className="p-2 py-3 border-b border-zinc-800">
            <h2 className="mb-2 text-white light:text-zinc-800">TOTAL SPENT</h2>
            <span className="text-second">${TotalPayment ? TotalPayment?.toFixed(2) : "00"}</span>
          </li>
          <li className="p-2 py-3 border-b border-zinc-800">
            <h2 className="mb-2 text-white light:text-zinc-800">ORDERS</h2>
            <span className="text-second">{orderCount}</span>
          </li>
          <li className="p-2 py-3">
            <h2 className="mb-2 text-white light:text-zinc-800">TIER</h2>
            <span className="text-second">BRONZE</span>
          </li>
        </ul>
      </div>

    </div>
  )
}
