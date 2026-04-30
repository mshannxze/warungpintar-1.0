import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BarChart3,
  Boxes,
  ClipboardCheck,
  LayoutDashboard,
  PackagePlus,
  ScanBarcode,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Real-Time",
    description:
      "Pantau penjualan harian, transaksi live, dan stok menipis langsung dari HP atau laptop di mana pun.",
  },
  {
    icon: Boxes,
    title: "Manajemen Produk",
    description:
      "Kelola master data produk lengkap dengan SKU, kategori, harga beli/jual, dan minimum stok.",
  },
  {
    icon: ScanBarcode,
    title: "Point of Sale",
    description:
      "Form kasir cepat untuk transaksi penjualan, otomatis mengurangi stok dan mencetak struk digital.",
  },
  {
    icon: PackagePlus,
    title: "Stok Masuk",
    description:
      "Catat kulakan dari supplier dengan mudah — stok bertambah otomatis dan tercatat di log movement.",
  },
  {
    icon: BarChart3,
    title: "Laporan Terintegrasi",
    description:
      "Laporan penjualan harian, mingguan, bulanan dengan kalkulasi laba kotor otomatis. Export CSV/PDF.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-User & Role",
    description:
      "Pemilik dan kasir punya hak akses berbeda. Aman, terkontrol, dan teraudit lewat log movement.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <header className="px-4 sm:px-6 lg:px-10 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">
            W
          </div>
          <span className="font-semibold tracking-tight">Warung Madura</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <AuthButtons />
          <ThemeToggle />
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-10 pb-16">
        <section className="max-w-5xl mx-auto text-center pt-8 sm:pt-14">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Real-time sync · Multi-device · Cloud-based
          </Badge>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
            Sistem Persediaan & POS
            <br className="hidden sm:block" /> untuk Warung Madura
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Digitalkan pencatatan stok dan transaksi warung Anda. Pantau penjualan
            secara langsung, kelola produk, dan dapatkan laporan keuangan otomatis
            — semua dari satu tempat.
          </p>
          <div className="mt-8">
            <HeroAuthButtons />
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => (
            <Card key={feat.title} className="p-6 transition hover:shadow-md">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 grid place-items-center mb-4">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg mb-1.5">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feat.description}
              </p>
            </Card>
          ))}
        </section>

        <section className="max-w-5xl mx-auto mt-14">
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border-amber-500/20">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  Akses dari mana saja
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Pemilik bisa monitor warung dari rumah lewat HP, sementara kasir
                  tetap mencatat transaksi di tablet warung. Setiap perubahan
                  langsung tersinkronisasi tanpa perlu refresh manual.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> Mobile-first
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5" /> Audit log
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <Wallet className="w-3.5 h-3.5" /> Multi-payment
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Penjualan Hari Ini</p>
                  <p className="text-xl font-bold mt-1">Rp 1.245.000</p>
                  <p className="text-xs text-emerald-600 mt-1">+12% vs kemarin</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Transaksi</p>
                  <p className="text-xl font-bold mt-1">37</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    rata-rata Rp 33.6rb
                  </p>
                </Card>
                <Card className="p-4 col-span-2">
                  <p className="text-xs text-muted-foreground">Stok Rendah</p>
                  <p className="text-xl font-bold mt-1 text-amber-600">
                    4 produk
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Teh Pucuk, Oreo, Minyak Goreng, Sprite
                  </p>
                </Card>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link href="/demo/dashboard">Lihat Dashboard Demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/demo/pos">Buka Halaman POS</Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Warung Madura · Sistem Informasi Persediaan
      </footer>
    </div>
  );
}
