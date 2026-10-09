import type { CSSProperties, ReactNode } from "react"

import { AppSidebar } from "@/app/components/admin/app-sidebar"
import { AdminHeader } from "@/app/components/admin/admin-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/app/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
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

      <SidebarInset className="min-w-0 bg-white">
        <AdminHeader />

        <main className="min-w-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}