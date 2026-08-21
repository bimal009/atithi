import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/features/tenant/dashboard/app-sidebar'
import { SiteHeader } from '@/features/tenant/dashboard/site-header'
import { requireOnboardedUser } from '@/features/auth/server/session'
import React from 'react'

const DashboardLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) => {
  const { tenant } = await params
  const user = await requireOnboardedUser()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" tenant={tenant} />
      <SidebarInset>
        <SiteHeader tenant={tenant} user={user} />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout
