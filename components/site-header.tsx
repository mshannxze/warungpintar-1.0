"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pos": "Point of Sale",
  "/products": "Manajemen Produk",
  "/stock-in": "Stok Masuk",
  "/transactions": "Riwayat Transaksi",
  "/reports": "Laporan Penjualan",
  "/users": "Manajemen Pengguna",
}

export function SiteHeader() {
  const pathname = usePathname()
  const matched = Object.keys(titles).find((p) => pathname?.startsWith(p))
  const title = matched ? titles[matched] : "Warung Madura"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <Badge variant="outline" className="ml-3 gap-1.5 hidden sm:inline-flex">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <Activity className="h-3 w-3" />
          Live
        </Badge>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
