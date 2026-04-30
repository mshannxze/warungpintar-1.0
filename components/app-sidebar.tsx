"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import {
  IconApi,
  IconBoxSeam,
  IconCash,
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconSearch,
  IconSettings,
  IconShoppingCart,
  IconTruckLoading,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "POS Kasir", url: "/pos", icon: IconShoppingCart },
  { title: "Produk", url: "/products", icon: IconBoxSeam },
  { title: "Stok Masuk", url: "/stock-in", icon: IconTruckLoading },
  { title: "Transaksi", url: "/transactions", icon: IconCash },
  { title: "Laporan", url: "/reports", icon: IconChartBar, ownerOnly: true },
  { title: "Pengguna", url: "/users", icon: IconUsers, ownerOnly: true },
]

const navSecondary = [
  { title: "Pengaturan", url: "#", icon: IconSettings },
  { title: "Bantuan", url: "#", icon: IconHelp },
  { title: "Cari", url: "#", icon: IconSearch },
  { title: "API Docs", url: "/api-docs", icon: IconApi },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const userData = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email,
        avatar: session.user.image || "",
      }
    : {
        name: "Demo Owner",
        email: "owner@warungmadura.id",
        avatar: "",
      }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="flex items-center gap-2">
                <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm font-bold">
                  W
                </span>
                <span className="text-base font-semibold">Warung Madura</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} pathname={pathname} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
