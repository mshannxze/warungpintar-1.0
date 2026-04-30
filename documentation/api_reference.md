# API Reference — Warung Madura

> **Swagger UI**: jalankan dev server lalu buka [`/api-docs`](http://localhost:3000/api-docs).
> Spesifikasi OpenAPI 3.0 mentah tersedia di [`/api/docs`](http://localhost:3000/api/docs).

Semua endpoint mengembalikan JSON dengan envelope:

- Sukses: `{ "data": <payload> }` (atau `204 No Content`)
- Gagal: `{ "error": { "message": string, "details"?: any } }`

Otentikasi memakai cookie sesi BetterAuth. Sertakan cookie pada setiap request.

| Status | Arti |
|--------|------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (delete sukses) |
| 401 | Belum login |
| 403 | Role tidak diizinkan / akun nonaktif |
| 404 | Resource tidak ditemukan |
| 409 | Konflik (mis. stok kurang, email duplikat) |
| 422 | Validasi Zod gagal |
| 500 | Error server |

## Autentikasi

| Method | Path | Keterangan |
|--------|------|-----------|
| POST | `/api/auth/sign-up/email` | Daftar via BetterAuth |
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-out` | Logout |
| GET  | `/api/auth/get-session` | Sesi aktif |

## Categories

| Method | Path | Role |
|--------|------|------|
| GET    | `/api/categories` | any |
| POST   | `/api/categories` | owner |
| GET    | `/api/categories/:id` | any |
| PUT    | `/api/categories/:id` | owner |
| DELETE | `/api/categories/:id` | owner |

Body POST/PUT: `{ "name": string, "description"?: string }`

## Products

| Method | Path | Role |
|--------|------|------|
| GET    | `/api/products?search=&categoryId=&lowStock=1` | any |
| POST   | `/api/products` | owner |
| GET    | `/api/products/:id` | any |
| PUT    | `/api/products/:id` | owner |
| DELETE | `/api/products/:id` | owner |

Body POST: `{ sku, name, categoryId?, purchasePrice, sellingPrice, unit?, currentStock?, minStock? }`

## Suppliers

| Method | Path | Role |
|--------|------|------|
| GET    | `/api/suppliers` | any |
| POST   | `/api/suppliers` | owner |
| GET    | `/api/suppliers/:id` | any |
| PUT    | `/api/suppliers/:id` | owner |
| DELETE | `/api/suppliers/:id` | owner |

## Transactions (POS)

| Method | Path | Role |
|--------|------|------|
| GET    | `/api/transactions?from=&to=&cashierId=&limit=` | any (cashier hanya melihat miliknya) |
| POST   | `/api/transactions` | any |
| GET    | `/api/transactions/:id` | any (cashier hanya miliknya) |
| POST   | `/api/transactions/:id/refund` | owner |

POST body:
```json
{
  "items": [{ "productId": 1, "quantity": 2 }],
  "paymentMethod": "cash" | "qris" | "transfer",
  "notes": "opsional"
}
```

Side effects (atomic via `db.transaction`):
- Insert `transactions` + `transaction_items` (snapshot harga jual & beli)
- `products.current_stock -= quantity` per item
- Insert `stock_movements` (`type=out`, `reference_type=transaction`)

Refund (`POST /:id/refund`, owner only):
- `products.current_stock += quantity`
- Insert reverse `stock_movements` (`type=in`, `reference_type=refund`)
- `transactions.status = 'refunded'`

## Stock-Ins (Restock / Kulakan)

| Method | Path | Role |
|--------|------|------|
| GET    | `/api/stock-ins?limit=` | any |
| POST   | `/api/stock-ins` | any |
| GET    | `/api/stock-ins/:id` | any |

POST body:
```json
{
  "supplierId": 1,
  "receivedDate": "2026-04-29",
  "notes": "opsional",
  "items": [{ "productId": 1, "quantity": 24, "unitCost": "2500.00" }]
}
```

Side effects (atomic):
- Insert `stock_ins` + `stock_in_items`
- `products.current_stock += quantity`, `purchase_price = unitCost`
- Insert `stock_movements` (`type=in`, `reference_type=stock_in`)

## Stock Movements (Audit Log)

| Method | Path | Role |
|--------|------|------|
| GET    | `/api/stock-movements?productId=&type=&from=&to=&limit=` | any |

## Users (Owner Only)

| Method | Path | Role |
|--------|------|------|
| GET    | `/api/users` | owner |
| POST   | `/api/users` | owner |
| PUT    | `/api/users/:id` | owner |
| DELETE | `/api/users/:id` | owner |

POST body: `{ name, email, password, role: "owner"|"cashier" }`
PUT body : `{ name?, role?, isActive? }`

Owner tidak bisa menonaktifkan / menurunkan role akunnya sendiri.

## Reports (Owner Only kecuali dashboard)

### `GET /api/reports/dashboard` — any role
Output:
```json
{
  "today": { "totalSales": 0, "totalCost": 0, "grossProfit": 0, "transactionCount": 0 },
  "lowStockCount": 0,
  "lowStock": [...],
  "trend": [{ "day": "YYYY-MM-DD", "total": "...", "count": 0 }],
  "topProducts": [...]
}
```

### `GET /api/reports/sales` — owner
Query: `period=today|7d|30d|month|custom`, `from=YYYY-MM-DD`, `to=YYYY-MM-DD`, `cashierId=`, `categoryId=`

Output:
```json
{
  "range": { "from": "...", "to": "..." },
  "summary": {
    "transactionCount": 0,
    "totalRevenue": 0,
    "totalCost": 0,
    "grossProfit": 0,
    "margin": 0.0
  },
  "categoryBreakdown": [...],
  "transactions": [...]
}
```
