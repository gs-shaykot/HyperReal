"use client"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Bell, ChevronDown, Moon, Sun } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/app/components/ui/sidebar"
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
  "/admin/delivery-zones": "DELIVERY ZONES",
  "/admin/international-shipping": "INTERNATIONAL SHIPPING",
}

export function AdminHeader() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname()
  const { data: session } = useSession();
  type AdminNotice = { id: string; type: string; title: string; message: string; href: string | null; readAt: string | null; createdAt: string }
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [notices, setNotices] = useState<AdminNotice[]>([])
  const [unreadTotal, setUnreadTotal] = useState(0)
  const loadNotices = useCallback(async () => {
    const response = await fetch("/api/admin/notifications", { cache: "no-store" }).catch(() => null)
    if (!response?.ok) return
    const result = await response.json()
    if (result.success) { setNotices(result.data.notifications ?? []); setUnreadTotal(result.data.counts.total ?? 0) }
  }, [])
  useEffect(() => { void loadNotices(); const timer = window.setInterval(loadNotices, 30000); return () => window.clearInterval(timer) }, [loadNotices])
  const markNoticeRead = async (id: string) => { await fetch("/api/admin/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: id }) }); await loadNotices() }
  const markAllRead = async () => { await fetch("/api/admin/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) }); await loadNotices() }

  const pageTitle =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([path]) =>
      pathname.startsWith(`${path}/`)
    )?.[1] ??
    "DASHBOARD"

  return (
    <header className="px-2 sticky top-0 z-20 flex h-13 shrink-0 items-center border-b border-zinc-800 light:border-zinc-300 bg-dark light:bg-white">
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

        {/* Admin notifications dropdown */}
        <div className="relative">
          <button type="button" aria-label="Notifications" aria-expanded={noticeOpen} onClick={() => { setNoticeOpen(value => !value); void loadNotices() }} className="relative flex size-9 items-center justify-center light:text-zinc-600 text-white transition-colors hover:text-second cursor-pointer">
            <Bell className="size-4" />
            {unreadTotal > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[9px] font-bold leading-4 text-white">{unreadTotal > 99 ? "99+" : unreadTotal}</span>}
          </button>
          {noticeOpen && <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1rem)] border border-zinc-200 bg-white text-zinc-900 shadow-xl dark:border-zinc-700 dark:bg-zinc-950 dark:text-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800"><span className="text-xs font-bold">Notifications</span><button onClick={() => void markAllRead()} className="text-[10px] text-second hover:underline">Mark all read</button></div>
            <div className="max-h-80 overflow-y-auto">
              {notices.length === 0 ? <p className="p-5 text-center text-xs text-zinc-500">You're all caught up.</p> : notices.map(notice => <div key={notice.id} className={`border-b border-zinc-100 dark:border-zinc-800 ${notice.readAt ? "opacity-60" : "bg-lime-50/60 dark:bg-lime-950/20"}`}>
                <Link href={notice.href ?? "/admin"} onClick={() => { setNoticeOpen(false); if (!notice.readAt) void markNoticeRead(notice.id) }} className="block px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <div className="flex items-start gap-2"><span className={"mt-1 size-1.5 shrink-0 rounded-full " + (notice.readAt ? "bg-zinc-300" : "bg-lime-500")} /><div><p className="text-xs font-semibold">{notice.title}</p><p className="mt-0.5 text-[11px] text-zinc-500">{notice.message}</p><p className="mt-1 text-[9px] text-zinc-400">{new Date(notice.createdAt).toLocaleString()}</p></div></div>
                </Link>
              </div>)}
            </div>
            <div className="border-t border-zinc-200 p-2 text-center dark:border-zinc-800"><button onClick={() => setNoticeOpen(false)} className="text-[10px] text-zinc-500 hover:text-second">Close</button></div>
          </div>}
        </div>
        <div className="mx-3 h-5 w-px bg-border" />

        {/* Admin account */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="mr-4 flex h-full items-center gap-2 outline-none"
              />
            }
          >

            <Avatar className="size-7 shrink-0 rounded-none overflow-hidden after:content-none">
              <AvatarImage
                src={session?.user?.image ?? undefined}
                alt={session?.user?.name ?? "User profile"}
                className="size-full rounded-none object-cover"
              />
              <AvatarFallback className="size-full rounded-none bg-lime-100 text-[9px] font-bold text-lime-700">
                {session?.user?.name?.charAt(0).toUpperCase()}
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

                <p className="mt-1 text-xs font-normal text-zinc-400 light:text-zinc-700">
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