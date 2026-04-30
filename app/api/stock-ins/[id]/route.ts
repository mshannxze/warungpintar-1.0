import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
    products,
    stockInItems,
    stockIns,
    suppliers,
} from "@/db/schema/warung";
import { user as userTable } from "@/db/schema/auth";
import { getAuthContext, HttpError } from "@/lib/api/auth-guard";
import { handleError, ok } from "@/lib/api/responses";
import { uuidParamSchema } from "@/lib/api/validators";

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        await getAuthContext();
        const { id } = uuidParamSchema.parse(await params);
        const [header] = await db
            .select({
                id: stockIns.id,
                userId: stockIns.userId,
                userName: userTable.name,
                supplierId: stockIns.supplierId,
                supplierName: suppliers.name,
                totalCost: stockIns.totalCost,
                receivedDate: stockIns.receivedDate,
                notes: stockIns.notes,
                createdAt: stockIns.createdAt,
            })
            .from(stockIns)
            .leftJoin(userTable, eq(userTable.id, stockIns.userId))
            .leftJoin(suppliers, eq(suppliers.id, stockIns.supplierId))
            .where(eq(stockIns.id, id))
            .limit(1);
        if (!header) throw new HttpError(404, "Stok masuk tidak ditemukan");
        const items = await db
            .select({
                id: stockInItems.id,
                productId: stockInItems.productId,
                productName: products.name,
                quantity: stockInItems.quantity,
                unitCost: stockInItems.unitCost,
            })
            .from(stockInItems)
            .leftJoin(products, eq(products.id, stockInItems.productId))
            .where(eq(stockInItems.stockInId, id));
        return ok({ ...header, items });
    } catch (e) {
        return handleError(e);
    }
}
