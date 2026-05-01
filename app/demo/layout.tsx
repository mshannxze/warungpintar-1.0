import Link from "next/link";
import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DemoSidebar } from "@/components/warung/demo-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";
import "../(app)/theme.css";

export default async function DemoLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

    return (
        <SidebarProvider
            defaultOpen={defaultOpen}
            style={{ "--sidebar-width": "calc(var(--spacing) * 72)" } as React.CSSProperties}
        >
            <DemoSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                    <FlaskConical className="w-4 h-4 shrink-0" />
                    <span>
                        <Badge variant="secondary" className="mr-2 text-xs">Mode Demo</Badge>
                        Anda sedang melihat versi demo dengan data contoh. Transaksi tidak tersimpan.
                    </span>
                </div>
                <div className="flex flex-1 flex-col">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
