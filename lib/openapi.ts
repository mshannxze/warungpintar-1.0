// OpenAPI 3.0 specification for the Warung Madura backend API.
// Served as JSON via GET /api/docs and rendered with Swagger UI at /api-docs.

export type OpenAPISpec = Record<string, unknown>;

const errorResponse = {
    type: "object",
    properties: {
        error: {
            type: "object",
            properties: {
                message: { type: "string" },
                details: {},
            },
            required: ["message"],
        },
    },
};

const dataResponse = (schema: unknown) => ({
    type: "object",
    properties: { data: schema },
    required: ["data"],
});

const idParam = {
    name: "id",
    in: "path",
    required: true,
    schema: { type: "integer" },
};

const commonResponses = {
    Unauthorized: {
        description: "Belum login",
        content: { "application/json": { schema: errorResponse } },
    },
    Forbidden: {
        description: "Role tidak diizinkan / akun nonaktif",
        content: { "application/json": { schema: errorResponse } },
    },
    NotFound: {
        description: "Resource tidak ditemukan",
        content: { "application/json": { schema: errorResponse } },
    },
    Conflict: {
        description: "Konflik (mis. stok kurang, email duplikat)",
        content: { "application/json": { schema: errorResponse } },
    },
    ValidationError: {
        description: "Validasi Zod gagal",
        content: { "application/json": { schema: errorResponse } },
    },
    ServerError: {
        description: "Error server",
        content: { "application/json": { schema: errorResponse } },
    },
};

const stdErrorRefs = {
    "401": { $ref: "#/components/responses/Unauthorized" },
    "403": { $ref: "#/components/responses/Forbidden" },
    "404": { $ref: "#/components/responses/NotFound" },
    "422": { $ref: "#/components/responses/ValidationError" },
    "500": { $ref: "#/components/responses/ServerError" },
};

export function buildOpenApiSpec(): OpenAPISpec {
    return {
        openapi: "3.0.3",
        info: {
            title: "Warung Madura API",
            version: "1.0.0",
            description:
                "REST API untuk aplikasi POS & manajemen stok Warung Madura.\n\n" +
                "**Autentikasi**: Gunakan Supabase Auth (sign-in via UI `/sign-in`). " +
                "Setelah login, cookie sesi Supabase dikirim otomatis pada setiap request. " +
                "Untuk testing dari Swagger UI, pastikan Anda sudah login di tab lain terlebih dahulu.\n\n" +
                "**Response envelope**: Sukses `{ \"data\": <payload> }` · Gagal `{ \"error\": { \"message\", \"details\"? } }`",
        },
        servers: [{ url: "/", description: "Current host" }],
        tags: [
            { name: "Auth", description: "Autentikasi Supabase Auth" },
            { name: "Categories", description: "Kategori produk" },
            { name: "Products", description: "Produk warung" },
            { name: "Suppliers", description: "Pemasok / supplier" },
            { name: "Transactions", description: "Transaksi POS" },
            { name: "Stock-Ins", description: "Restock / kulakan" },
            { name: "Stock Movements", description: "Audit log pergerakan stok" },
            { name: "Users", description: "Manajemen user (owner only)" },
            { name: "Reports", description: "Laporan & dashboard" },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "sb-kwtoxrsxjwfwjvpmjxvi-auth-token",
                    description:
                        "Cookie sesi Supabase. Dikirim otomatis setelah login via `/sign-in`.",
                },
            },
            responses: commonResponses,
            schemas: {
                Error: errorResponse,
                Category: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        description: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                CategoryInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string" },
                        description: { type: "string", nullable: true },
                    },
                },
                Product: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        sku: { type: "string" },
                        name: { type: "string" },
                        categoryId: { type: "integer", nullable: true },
                        categoryName: { type: "string", nullable: true },
                        purchasePrice: { type: "string", description: "Decimal as string" },
                        sellingPrice: { type: "string", description: "Decimal as string" },
                        unit: { type: "string", nullable: true },
                        currentStock: { type: "integer" },
                        minStock: { type: "integer" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ProductCreateInput: {
                    type: "object",
                    required: ["sku", "name", "purchasePrice", "sellingPrice"],
                    properties: {
                        sku: { type: "string" },
                        name: { type: "string" },
                        categoryId: { type: "integer", nullable: true },
                        purchasePrice: { type: "string" },
                        sellingPrice: { type: "string" },
                        unit: { type: "string", nullable: true },
                        currentStock: { type: "integer", default: 0 },
                        minStock: { type: "integer", default: 0 },
                    },
                },
                ProductUpdateInput: {
                    type: "object",
                    properties: {
                        sku: { type: "string" },
                        name: { type: "string" },
                        categoryId: { type: "integer", nullable: true },
                        purchasePrice: { type: "string" },
                        sellingPrice: { type: "string" },
                        unit: { type: "string", nullable: true },
                        minStock: { type: "integer" },
                    },
                },
                Supplier: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        contactPerson: { type: "string", nullable: true },
                        phone: { type: "string", nullable: true },
                        address: { type: "string", nullable: true },
                        notes: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                SupplierInput: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: { type: "string" },
                        contactPerson: { type: "string", nullable: true },
                        phone: { type: "string", nullable: true },
                        address: { type: "string", nullable: true },
                        notes: { type: "string", nullable: true },
                    },
                },
                TransactionItemInput: {
                    type: "object",
                    required: ["productId", "quantity"],
                    properties: {
                        productId: { type: "integer" },
                        quantity: { type: "integer", minimum: 1 },
                    },
                },
                TransactionCreateInput: {
                    type: "object",
                    required: ["items", "paymentMethod"],
                    properties: {
                        items: {
                            type: "array",
                            items: { $ref: "#/components/schemas/TransactionItemInput" },
                        },
                        paymentMethod: {
                            type: "string",
                            enum: ["cash", "qris", "transfer"],
                        },
                        notes: { type: "string", nullable: true },
                    },
                },
                Transaction: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        invoiceNumber: { type: "string" },
                        cashierId: { type: "string" },
                        totalAmount: { type: "string" },
                        totalCost: { type: "string" },
                        paymentMethod: {
                            type: "string",
                            enum: ["cash", "qris", "transfer"],
                        },
                        status: {
                            type: "string",
                            enum: ["completed", "refunded"],
                        },
                        notes: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    productId: { type: "integer" },
                                    quantity: { type: "integer" },
                                    sellingPrice: { type: "string" },
                                    purchasePrice: { type: "string" },
                                },
                            },
                        },
                    },
                },
                StockInItemInput: {
                    type: "object",
                    required: ["productId", "quantity", "unitCost"],
                    properties: {
                        productId: { type: "integer" },
                        quantity: { type: "integer", minimum: 1 },
                        unitCost: { type: "string" },
                    },
                },
                StockInCreateInput: {
                    type: "object",
                    required: ["items"],
                    properties: {
                        supplierId: { type: "integer", nullable: true },
                        receivedDate: { type: "string", format: "date" },
                        notes: { type: "string", nullable: true },
                        items: {
                            type: "array",
                            items: { $ref: "#/components/schemas/StockInItemInput" },
                        },
                    },
                },
                StockIn: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        supplierId: { type: "integer", nullable: true },
                        receivedDate: { type: "string", format: "date" },
                        totalCost: { type: "string" },
                        notes: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                StockMovement: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        productId: { type: "integer" },
                        type: { type: "string", enum: ["in", "out", "adjustment"] },
                        quantity: { type: "integer" },
                        referenceType: { type: "string", nullable: true },
                        referenceId: { type: "integer", nullable: true },
                        notes: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        role: { type: "string", enum: ["owner", "cashier"] },
                        isActive: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                UserCreateInput: {
                    type: "object",
                    required: ["name", "email", "password", "role"],
                    properties: {
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 8 },
                        role: { type: "string", enum: ["owner", "cashier"] },
                    },
                },
                UserUpdateInput: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        role: { type: "string", enum: ["owner", "cashier"] },
                        isActive: { type: "boolean" },
                    },
                },
                DashboardReport: {
                    type: "object",
                    properties: {
                        today: {
                            type: "object",
                            properties: {
                                totalSales: { type: "number" },
                                totalCost: { type: "number" },
                                grossProfit: { type: "number" },
                                transactionCount: { type: "integer" },
                            },
                        },
                        lowStockCount: { type: "integer" },
                        lowStock: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Product" },
                        },
                        trend: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    day: { type: "string", format: "date" },
                                    total: { type: "string" },
                                    count: { type: "integer" },
                                },
                            },
                        },
                        topProducts: { type: "array", items: { type: "object" } },
                    },
                },
                SalesReport: {
                    type: "object",
                    properties: {
                        range: {
                            type: "object",
                            properties: {
                                from: { type: "string" },
                                to: { type: "string" },
                            },
                        },
                        summary: {
                            type: "object",
                            properties: {
                                transactionCount: { type: "integer" },
                                totalRevenue: { type: "number" },
                                totalCost: { type: "number" },
                                grossProfit: { type: "number" },
                                margin: { type: "number" },
                            },
                        },
                        categoryBreakdown: { type: "array", items: { type: "object" } },
                        transactions: { type: "array", items: { type: "object" } },
                    },
                },
            },
        },
        security: [{ cookieAuth: [] }],
        paths: {
            "/sign-in": {
                get: {
                    tags: ["Auth"],
                    summary: "Halaman login (UI)",
                    description:
                        "Halaman sign-in berbasis Supabase Auth. Login di sini sebelum menggunakan endpoint yang memerlukan autentikasi.",
                    security: [],
                    responses: { "200": { description: "HTML halaman login" } },
                },
            },
            "/sign-up": {
                get: {
                    tags: ["Auth"],
                    summary: "Halaman registrasi (UI)",
                    security: [],
                    responses: { "200": { description: "HTML halaman registrasi" } },
                },
            },
            "/api/auth/profile": {
                post: {
                    tags: ["Auth"],
                    summary: "Sinkronisasi profil setelah sign-up",
                    description:
                        "Membuat atau mengambil profil user di database setelah Supabase Auth berhasil. " +
                        "Dipanggil otomatis oleh UI setelah sign-up; tidak perlu dipanggil manual.",
                    responses: {
                        "200": {
                            description: "Profil user",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/User" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },
            "/auth/callback": {
                get: {
                    tags: ["Auth"],
                    summary: "Callback konfirmasi email",
                    description:
                        "Supabase mengarahkan ke sini setelah pengguna mengklik link konfirmasi email. " +
                        "Menukar code menjadi sesi lalu redirect ke `/dashboard`.",
                    security: [],
                    parameters: [
                        {
                            name: "code",
                            in: "query",
                            required: true,
                            schema: { type: "string" },
                            description: "Authorization code dari Supabase",
                        },
                    ],
                    responses: {
                        "302": { description: "Redirect ke /dashboard atau /sign-in?error=..." },
                    },
                },
            },

            "/api/categories": {
                get: {
                    tags: ["Categories"],
                    summary: "List categories",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Category" },
                                    }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                post: {
                    tags: ["Categories"],
                    summary: "Create category (owner)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CategoryInput" },
                            },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Created",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Category" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },
            "/api/categories/{id}": {
                parameters: [idParam],
                get: {
                    tags: ["Categories"],
                    summary: "Get category by id",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Category" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                put: {
                    tags: ["Categories"],
                    summary: "Update category (owner)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CategoryInput" },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Category" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                delete: {
                    tags: ["Categories"],
                    summary: "Delete category (owner)",
                    responses: { "204": { description: "No Content" }, ...stdErrorRefs },
                },
            },

            "/api/products": {
                get: {
                    tags: ["Products"],
                    summary: "List products",
                    parameters: [
                        { name: "search", in: "query", schema: { type: "string" } },
                        { name: "categoryId", in: "query", schema: { type: "integer" } },
                        {
                            name: "lowStock",
                            in: "query",
                            description: "Set to '1' untuk hanya produk di bawah minStock",
                            schema: { type: "string", enum: ["1"] },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Product" },
                                    }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                post: {
                    tags: ["Products"],
                    summary: "Create product (owner)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ProductCreateInput" },
                            },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Created",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Product" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },
            "/api/products/{id}": {
                parameters: [idParam],
                get: {
                    tags: ["Products"],
                    summary: "Get product",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Product" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                put: {
                    tags: ["Products"],
                    summary: "Update product (owner)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ProductUpdateInput" },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Product" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                delete: {
                    tags: ["Products"],
                    summary: "Delete product (owner)",
                    responses: { "204": { description: "No Content" }, ...stdErrorRefs },
                },
            },

            "/api/suppliers": {
                get: {
                    tags: ["Suppliers"],
                    summary: "List suppliers",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Supplier" },
                                    }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                post: {
                    tags: ["Suppliers"],
                    summary: "Create supplier (owner)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/SupplierInput" },
                            },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Created",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Supplier" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },
            "/api/suppliers/{id}": {
                parameters: [idParam],
                get: {
                    tags: ["Suppliers"],
                    summary: "Get supplier",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Supplier" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                put: {
                    tags: ["Suppliers"],
                    summary: "Update supplier (owner)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/SupplierInput" },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Supplier" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                delete: {
                    tags: ["Suppliers"],
                    summary: "Delete supplier (owner)",
                    responses: { "204": { description: "No Content" }, ...stdErrorRefs },
                },
            },

            "/api/transactions": {
                get: {
                    tags: ["Transactions"],
                    summary: "List transactions (cashier hanya melihat miliknya)",
                    parameters: [
                        { name: "from", in: "query", schema: { type: "string", format: "date" } },
                        { name: "to", in: "query", schema: { type: "string", format: "date" } },
                        { name: "cashierId", in: "query", schema: { type: "string" } },
                        { name: "limit", in: "query", schema: { type: "integer" } },
                    ],
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Transaction" },
                                    }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                post: {
                    tags: ["Transactions"],
                    summary: "Buat transaksi POS",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/TransactionCreateInput" },
                            },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Created",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Transaction" }),
                                },
                            },
                        },
                        "409": { $ref: "#/components/responses/Conflict" },
                        ...stdErrorRefs,
                    },
                },
            },
            "/api/transactions/{id}": {
                parameters: [idParam],
                get: {
                    tags: ["Transactions"],
                    summary: "Detail transaksi",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Transaction" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },
            "/api/transactions/{id}/refund": {
                parameters: [idParam],
                post: {
                    tags: ["Transactions"],
                    summary: "Refund transaksi (owner)",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/Transaction" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },

            "/api/stock-ins": {
                get: {
                    tags: ["Stock-Ins"],
                    summary: "List stock-ins",
                    parameters: [
                        { name: "limit", in: "query", schema: { type: "integer" } },
                    ],
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({
                                        type: "array",
                                        items: { $ref: "#/components/schemas/StockIn" },
                                    }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                post: {
                    tags: ["Stock-Ins"],
                    summary: "Catat stock-in (kulakan)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/StockInCreateInput" },
                            },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Created",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/StockIn" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },
            "/api/stock-ins/{id}": {
                parameters: [idParam],
                get: {
                    tags: ["Stock-Ins"],
                    summary: "Detail stock-in",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/StockIn" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },

            "/api/stock-movements": {
                get: {
                    tags: ["Stock Movements"],
                    summary: "List stock movements (audit log)",
                    parameters: [
                        { name: "productId", in: "query", schema: { type: "integer" } },
                        {
                            name: "type",
                            in: "query",
                            schema: {
                                type: "string",
                                enum: ["in", "out", "adjustment"],
                            },
                        },
                        { name: "from", in: "query", schema: { type: "string", format: "date" } },
                        { name: "to", in: "query", schema: { type: "string", format: "date" } },
                        { name: "limit", in: "query", schema: { type: "integer" } },
                    ],
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({
                                        type: "array",
                                        items: { $ref: "#/components/schemas/StockMovement" },
                                    }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },

            "/api/users": {
                get: {
                    tags: ["Users"],
                    summary: "List users (owner)",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({
                                        type: "array",
                                        items: { $ref: "#/components/schemas/User" },
                                    }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                post: {
                    tags: ["Users"],
                    summary: "Create user (owner)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/UserCreateInput" },
                            },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Created",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/User" }),
                                },
                            },
                        },
                        "409": { $ref: "#/components/responses/Conflict" },
                        ...stdErrorRefs,
                    },
                },
            },
            "/api/users/{id}": {
                parameters: [{ ...idParam, schema: { type: "string" } }],
                put: {
                    tags: ["Users"],
                    summary: "Update user (owner)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/UserUpdateInput" },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({ $ref: "#/components/schemas/User" }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
                delete: {
                    tags: ["Users"],
                    summary: "Delete user (owner)",
                    responses: { "204": { description: "No Content" }, ...stdErrorRefs },
                },
            },

            "/api/reports/dashboard": {
                get: {
                    tags: ["Reports"],
                    summary: "Dashboard summary",
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({
                                        $ref: "#/components/schemas/DashboardReport",
                                    }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },
            "/api/reports/sales": {
                get: {
                    tags: ["Reports"],
                    summary: "Sales report (owner)",
                    parameters: [
                        {
                            name: "period",
                            in: "query",
                            schema: {
                                type: "string",
                                enum: ["today", "7d", "30d", "month", "custom"],
                            },
                        },
                        { name: "from", in: "query", schema: { type: "string", format: "date" } },
                        { name: "to", in: "query", schema: { type: "string", format: "date" } },
                        { name: "cashierId", in: "query", schema: { type: "string" } },
                        { name: "categoryId", in: "query", schema: { type: "integer" } },
                    ],
                    responses: {
                        "200": {
                            description: "OK",
                            content: {
                                "application/json": {
                                    schema: dataResponse({
                                        $ref: "#/components/schemas/SalesReport",
                                    }),
                                },
                            },
                        },
                        ...stdErrorRefs,
                    },
                },
            },
        },
    };
}
