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

export const AccountSidebar = () => {
  const pathname = usePathname();

  return (
    <div className='w-full bg-[#0f0f0f] border border-zinc-800 p-2'>
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
              <menu.icon className='h-5 w-5' />
              {menu.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
