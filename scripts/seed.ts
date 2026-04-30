import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, suppliers } from "@/db/schema/warung";
import { user as userTable } from "@/db/schema/auth";
import { auth } from "@/lib/auth";

const SEED_OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? "owner@warungmadura.id";
const SEED_OWNER_PASSWORD =
    process.env.SEED_OWNER_PASSWORD ?? "OwnerPass123!";
const SEED_CASHIER_EMAIL =
    process.env.SEED_CASHIER_EMAIL ?? "kasir@warungmadura.id";
const SEED_CASHIER_PASSWORD =
    process.env.SEED_CASHIER_PASSWORD ?? "KasirPass123!";

async function ensureUser(
    name: string,
    email: string,
    password: string,
    role: "owner" | "cashier",
) {
    const [existing] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1);
    if (existing) {
        await db
            .update(userTable)
            .set({ role, isActive: true, name })
            .where(eq(userTable.id, existing.id));
        console.log(`✓ user exists: ${email}`);
        return existing.id;
    }
    const result = await auth.api.signUpEmail({
        body: { email, password, name },
    });
    const id = result.user?.id;
    if (!id) throw new Error(`Failed to create ${email}`);
    await db
        .update(userTable)
        .set({ role, isActive: true })
        .where(eq(userTable.id, id));
    console.log(`+ created user: ${email} (${role})`);
    return id;
}

async function ensureCategories() {
    const data = [
        { name: "Minuman", description: "Air mineral, teh, kopi, soft drink" },
        { name: "Makanan Ringan", description: "Snack, biskuit, keripik" },
        { name: "Rokok", description: "Aneka rokok kretek dan filter" },
        { name: "Sembako", description: "Beras, gula, minyak, tepung" },
        { name: "Kebutuhan Rumah", description: "Sabun, deterjen, sampo" },
    ];
    const map = new Map<string, number>();
    for (const c of data) {
        const [existing] = await db
            .select()
            .from(categories)
            .where(eq(categories.name, c.name))
            .limit(1);
        if (existing) {
            map.set(c.name, existing.id);
            continue;
        }
        const [row] = await db.insert(categories).values(c).returning();
        map.set(c.name, row.id);
        console.log(`+ category: ${c.name}`);
    }
    return map;
}

async function ensureSuppliers() {
    const data = [
        { name: "Toko Grosir Makmur", phone: "0812-3456-7890", address: "Pasar Induk Kramat Jati" },
        { name: "PT Distribusi Madura", phone: "0813-9876-5432", address: "Bangkalan, Madura" },
        { name: "CV Sumber Rezeki", phone: "0857-1122-3344", address: "Surabaya" },
    ];
    for (const s of data) {
        const [existing] = await db
            .select()
            .from(suppliers)
            .where(eq(suppliers.name, s.name))
            .limit(1);
        if (existing) continue;
        await db.insert(suppliers).values(s);
        console.log(`+ supplier: ${s.name}`);
    }
}

async function ensureProducts(catMap: Map<string, number>) {
    const data: Array<{
        sku: string;
        name: string;
        category: string;
        purchasePrice: number;
        sellingPrice: number;
        unit: string;
        currentStock: number;
        minStock: number;
    }> = [
        { sku: "MNM-AQUA-600", name: "Aqua 600ml", category: "Minuman", purchasePrice: 2500, sellingPrice: 4000, unit: "botol", currentStock: 48, minStock: 12 },
        { sku: "MNM-TEH-PUC", name: "Teh Pucuk Harum 350ml", category: "Minuman", purchasePrice: 3500, sellingPrice: 5000, unit: "botol", currentStock: 8, minStock: 12 },
        { sku: "MNM-KOP-KAPAL", name: "Kopi Kapal Api Sachet", category: "Minuman", purchasePrice: 1200, sellingPrice: 2000, unit: "sachet", currentStock: 120, minStock: 30 },
        { sku: "MR-CHITATO", name: "Chitato Sapi Panggang 68g", category: "Makanan Ringan", purchasePrice: 8000, sellingPrice: 11000, unit: "pcs", currentStock: 22, minStock: 10 },
        { sku: "MR-OREO", name: "Oreo Original 137g", category: "Makanan Ringan", purchasePrice: 7500, sellingPrice: 10500, unit: "pcs", currentStock: 4, minStock: 8 },
        { sku: "RKK-SMP-MILD", name: "Sampoerna Mild 16", category: "Rokok", purchasePrice: 28000, sellingPrice: 32000, unit: "bks", currentStock: 35, minStock: 20 },
        { sku: "RKK-DJI-SMR", name: "Djarum Super 12", category: "Rokok", purchasePrice: 24000, sellingPrice: 28000, unit: "bks", currentStock: 14, minStock: 15 },
        { sku: "SMB-BERAS-5KG", name: "Beras Premium 5kg", category: "Sembako", purchasePrice: 65000, sellingPrice: 75000, unit: "sak", currentStock: 18, minStock: 5 },
        { sku: "SMB-MIGOR-1L", name: "Minyak Goreng 1L", category: "Sembako", purchasePrice: 16000, sellingPrice: 19000, unit: "btl", currentStock: 6, minStock: 10 },
        { sku: "RT-SBN-LIFEBUOY", name: "Sabun Lifebuoy 75g", category: "Kebutuhan Rumah", purchasePrice: 3800, sellingPrice: 5500, unit: "pcs", currentStock: 26, minStock: 12 },
        { sku: "RT-DETJN", name: "Detergen Sachet Rinso", category: "Kebutuhan Rumah", purchasePrice: 1500, sellingPrice: 2500, unit: "sachet", currentStock: 60, minStock: 25 },
    ];
    for (const p of data) {
        const [existing] = await db
            .select()
            .from(products)
            .where(eq(products.sku, p.sku))
            .limit(1);
        if (existing) continue;
        await db.insert(products).values({
            sku: p.sku,
            name: p.name,
            categoryId: catMap.get(p.category) ?? null,
            purchasePrice: p.purchasePrice.toFixed(2),
            sellingPrice: p.sellingPrice.toFixed(2),
            unit: p.unit,
            currentStock: p.currentStock,
            minStock: p.minStock,
        });
        console.log(`+ product: ${p.sku} ${p.name}`);
    }
}

async function main() {
    console.log("→ Seeding Warung Madura DB");
    await ensureUser("Pemilik Warung", SEED_OWNER_EMAIL, SEED_OWNER_PASSWORD, "owner");
    await ensureUser("Kasir Demo", SEED_CASHIER_EMAIL, SEED_CASHIER_PASSWORD, "cashier");
    const catMap = await ensureCategories();
    await ensureSuppliers();
    await ensureProducts(catMap);
    console.log("✓ Seed selesai");
    process.exit(0);
}

main().catch((err) => {
    console.error("✗ Seed gagal:", err);
    process.exit(1);
});
