"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
} from "@tabler/icons-react";

import { NavSecondary } from "@/components/nav-secondary";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

const demoNavItems = [
    { title: "Dashboard", url: "/demo/dashboard", icon: IconDashboard },
    { title: "POS Kasir", url: "/demo/pos", icon: IconShoppingCart },
];

const lockedNavItems = [
    { title: "Produk", icon: IconBoxSeam },
    { title: "Stok Masuk", icon: IconTruckLoading },
    { title: "Transaksi", icon: IconCash },
    { title: "Laporan", icon: IconChartBar },
    { title: "Pengguna", icon: IconUsers },
];

const navSecondary = [
    { title: "Pengaturan", url: "#", icon: IconSettings },
    { title: "Bantuan", url: "#", icon: IconHelp },
    { title: "Cari", url: "#", icon: IconSearch },
];

const DEMO_USER = {
    name: "Demo Owner",
    email: "demo@warungmadura.id",
    avatar: "",
};

export function DemoSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
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
                <SidebarGroup>
                    <SidebarGroupContent className="flex flex-col gap-2">
                        <SidebarMenu>
                            {demoNavItems.map((item) => {
                                const isActive = pathname?.startsWith(item.url);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground">Perlu Login</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {lockedNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton tooltip={item.title} disabled className="opacity-40 cursor-not-allowed">
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={DEMO_USER} />
            </SidebarFooter>
        </Sidebar>
    );
}
