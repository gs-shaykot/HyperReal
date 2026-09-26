"use client"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, Moon, Sun } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useSession } from "next-auth/react"

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "DASHBOARD",
  "/admin/products": "PRODUCTS",
  "/admin/orders": "ORDERS",
  "/admin/users": "USERS",
  "/admin/coupons": "COUPONS",
  "/admin/analytics": "ANALYTICS",
  "/admin/settings": "SETTINGS",
}

export function AdminHeader() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname()
  const { data: session } = useSession();

  const pageTitle =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([path]) =>
      pathname.startsWith(`${path}/`)
    )?.[1] ??
    "ADMIN"

  return (
    <header className="px-2 sticky top-0 flex h-13 shrink-0 items-center border-b border-zinc-800 light:border-zinc-300 bg-dark light:bg-white">
      {/* Left section */}
      <div className="flex h-full items-center">
        <SidebarTrigger className="ml-2 size-8 md:hidden" />

        <div className="mx-3 h-4 w-px bg-border md:hidden" />

        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-lime-500" />

          <span className="text-[11px] font-semibold tracking-[0.14em] text-white light:text-zinc-700">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Right section */}
      <div className="ml-auto flex h-full items-center">
        <button className={`text-white light:text-zinc-900`}>
          <label className="swap swap-rotate">

            <input
              type="checkbox"
              checked={theme === 'light'}
              onChange={(e) => {
                setTheme(e.target.checked ? "light" : "dark");
              }}
            />

            {/* sun icon */}
            <Sun
              size={20}
              strokeWidth={1.2}
              className='swap-on fill-current'
            />

            {/* moon icon */}
            <Moon
              size={20}
              strokeWidth={1.2}
              className='swap-off fill-current'
            />

          </label>
        </button>

        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          className="
            relative
            flex
            size-9
            items-center
            justify-center
            light:text-zinc-600
            text-white
            transition-colors
            light:hover:text-zinc-800
            cursor-pointer
          "
        >
          <Bell className="size-4" />

          <span className="absolute right-2 top-2 size-1 rounded-full bg-lime-500" />
        </button>

        <div className="mx-3 h-5 w-px bg-border" />

        {/* Admin account */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="
                  mr-4
                  flex
                  h-full
                  items-center
                  gap-2
                  outline-none
                "
              />
            }
          >
            <Avatar className="size-5.5 rounded-none">
              <AvatarFallback
                className="rounded-none bg-lime-100 text-[9px] font-bold text-lime-700
                "
              >
                RT
              </AvatarFallback>
            </Avatar>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold leading-none light:text-gray-900 text-white">
                {
                  session?.user?.name
                }
              </p>

              <p className="mt-0.75 text-[9px] leading-none text-zinc-400">
                {
                  session?.user.role
                }
              </p>
            </div>

            <ChevronDown className="ml-1 size-3 text-gray-500" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-52 rounded-none"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-xs font-bold text-foreground">
                  {
                    session?.user?.name
                  }
                </p>

                <p className="mt-1 text-xs font-normal text-zinc-300">
                  {
                    session?.user?.email
                  }
                </p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className={'rounded-none cursor-pointer'}>
                <Link href="/admin/settings">Settings</Link>
              </DropdownMenuItem>

              <DropdownMenuItem className={'rounded-none cursor-pointer'}>
                <Link href="/">View Store</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" className={'rounded-none cursor-pointer'}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header >
  )
}