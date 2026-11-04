"use client"
import { useCallback, useEffect, useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Archive,
    BarChart3,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    Tag,
    Users,
    Eye,
    LogOut,
    Truck,
    UserRoundCog,
    Globe2,
    MapPinned,
    RotateCcw,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/app/components/ui/sidebar"
import { signOut } from "next-auth/react";

import { SidebarTrigger } from "@/app/components/ui/sidebar"

const navigationItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Products",
        href: "/admin/products",
        icon: Package,
    },
    {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        title: "Fulfillment",
        href: "/admin/fulfillment",
        icon: Truck,
    },
    {
        title: "Returns & Refunds",
        href: "/admin/returns",
        icon: RotateCcw,
    },
    {
        title: "Couriers",
        href: "/admin/couriers",
        icon: UserRoundCog,
    },
    {
        title: "Delivery Zones",
        href: "/admin/delivery-zones",
        icon: MapPinned,
    },
    {
        title: "International Shipping",
        href: "/admin/international-shipping",
        icon: Globe2,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Coupons",
        href: "/admin/coupons",
        icon: Tag,
    },
    {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const [counts, setCounts] = useState({ orders: 0, fulfillment: 0, users: 0, international: 0 })
    const refreshCounts = useCallback(async () => {
        const response = await fetch("/api/admin/notifications", { cache: "no-store" }).catch(() => null)
        if (!response?.ok) return
        const result = await response.json()
        if (result.success && result.data?.counts) setCounts(result.data.counts)
    }, [])
    useEffect(() => { void refreshCounts(); const timer = window.setInterval(refreshCounts, 30000); return () => window.clearInterval(timer) }, [refreshCounts])
    const markRead = async (href: string) => {
        const category = href === "/admin/orders" ? "orders" : href === "/admin/fulfillment" ? "fulfillment" : href === "/admin/users" ? "users" : null
        if (!category) return
        setCounts(current => ({ ...current, [category]: 0 }))
        await fetch("/api/admin/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category }) })
    }
    const { state } = useSidebar()

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-zinc-800 light:border-zinc-300"
        >
            {/* Sidebar Header */}
            <SidebarHeader className="h-13 border-b border-zinc-800 light:border-zinc-300">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex h-8 items-center gap-2">

                            <SidebarTrigger className="size-8 shrink-0" />

                            {state === "expanded" && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-2"
                                >
                                    <div className="flex size-5 items-center justify-center rounded-sm text-second">
                                        <Archive size={16} />
                                    </div>

                                    <span className="text-[13px] font-bold tracking-[0.12em]">
                                        HYPER{" "}
                                        <span className="text-second italic">
                                            ADMIN
                                        </span>
                                    </span>
                                </Link>
                            )}
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Navigation */}
            <SidebarContent className="pt-3">
                <SidebarMenu className="gap-1 px-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon

                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/admin" &&
                                pathname.startsWith(`${item.href}/`))

                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    onClick={() => void markRead(item.href)}
                                    render={<Link href={item.href} />}
                                    isActive={isActive}
                                    tooltip={item.title}
                                    className=" h-9 rounded-none text-[11px] font-semibold tracking-[0.12em] transition-none   hover:bg-second hover:text-zinc-900">
                                    <Icon className="size-3.75" />
                                    <span>{item.title}</span>
                                    {(item.href === "/admin/orders" && counts.orders > 0 || item.href === "/admin/fulfillment" && counts.fulfillment > 0 || item.href === "/admin/users" && counts.users > 0) && <span className="ml-auto rounded-sm bg-red-500 px-1 text-[9px] font-bold text-white">{item.href === "/admin/orders" ? counts.orders : item.href === "/admin/fulfillment" ? counts.fulfillment : item.href === "/admin/users" ? counts.users : counts.international}</span>}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="mt-auto border-t border-zinc-800 px-2 py-3 light:border-zinc-300">
                <SidebarMenu className="gap-1">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            render={<Link href="/" />}
                            tooltip="View Store"
                            className="h-9 rounded-none text-[11px] font-semibold tracking-[0.12em] text-zinc-800 transition-colors hover:bg-second hover:text-zinc-900"
                        >
                            <Eye className="size-3.75" />
                            <span>VIEW STORE</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Logout"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="h-9 rounded-none text-[11px] font-semibold tracking-[0.12em] text-zinc-800 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                        >
                            <LogOut className="size-3.75" />
                            <span>LOGOUT</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}