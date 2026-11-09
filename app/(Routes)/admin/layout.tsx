import type { CSSProperties, ReactNode } from "react"
import { redirect } from "next/navigation"
import { getAdminUser } from "@/lib/auth/getAdminUser"

import { AppSidebar } from "@/app/components/admin/app-sidebar"
import { AdminHeader } from "@/app/components/admin/admin-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/app/components/ui/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const admin = await getAdminUser()
  if (!admin) redirect("/login?callbackUrl=%2Fadmin")

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "200px",
          "--sidebar-width-icon": "52px",
        } as CSSProperties
      }
    >
      <AppSidebar />

      <SidebarInset className="theme-aware-route min-w-0 bg-main light:bg-white">
        <AdminHeader />

        <main className="min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}