"use client"

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
} from "@/components/ui/sidebar"

import { SidebarTrigger } from "@/components/ui/sidebar"

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
                                    render={<Link href={item.href} />}
                                    isActive={isActive}
                                    tooltip={item.title}
                                    className=" h-9 rounded-none text-[11px] font-semibold tracking-[0.12em] transition-none   hover:bg-second hover:text-zinc-900">
                                    <Icon className="size-3.75" />
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter />
        </Sidebar>
    )
}