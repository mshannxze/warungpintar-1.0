# PRD — Project Requirements Document

**Nama Proyek:** Pengembangan Sistem Informasi Persediaan Barang Berbasis Web dengan Fitur Pemantauan Stok Real-Time dan Laporan Keuangan Terintegrasi untuk Warung Madura

## 1. Overview
Aplikasi ini bertujuan untuk mendigitalkan pencatatan stok dan transaksi penjualan pada Warung Madura, yang selama ini umumnya dilakukan secara manual menggunakan buku catatan. Masalah utama yang ingin diselesaikan adalah **ketidakmampuan pemilik untuk memantau stok dan transaksi secara langsung ketika tidak berada di lokasi warung**, sehingga pemilik sulit mengambil keputusan bisnis (misalnya kapan harus kulakan/restock atau apakah kasir melakukan pencatatan dengan benar) secara cepat dan akurat.

Tujuan utama aplikasi adalah menyediakan platform berbasis web yang **real-time** dan **multi-device**, sehingga pemilik dapat memonitor operasional warung dari mana saja (HP, tablet, atau laptop), sementara kasir tetap dapat mencatat transaksi harian dengan mudah. Sistem juga akan mengotomatisasi pencatatan stok masuk/keluar berdasarkan transaksi, serta menyediakan laporan penjualan dan keuangan yang terintegrasi.

## 2. Requirements
Berikut adalah persyaratan tingkat tinggi untuk pengembangan sistem:
- **Aksesibilitas:** Aplikasi harus dapat diakses melalui Web Browser pada berbagai perangkat (smartphone, tablet, laptop, desktop) dengan tampilan **responsif**.
- **Pengguna:** Sistem mendukung **multi-user** dengan role terpisah, yaitu **Pemilik (Owner)** dan **Kasir (Cashier)**. Setiap role memiliki hak akses yang berbeda.
- **Real-Time Sync:** Perubahan data (transaksi, stok) yang dilakukan oleh kasir di warung harus **langsung tersinkronisasi** dan dapat dilihat oleh pemilik tanpa perlu refresh manual.
- **Otomatisasi Stok:** Stok produk harus otomatis berkurang saat terjadi transaksi penjualan, dan otomatis bertambah saat ada pencatatan stok masuk (restock).
- **Laporan Terintegrasi:** Sistem menyediakan laporan penjualan harian, mingguan, dan bulanan, termasuk kalkulasi keuntungan kotor (gross profit) berdasarkan harga beli dan harga jual.
- **Keamanan:** Autentikasi wajib untuk semua pengguna menggunakan email dan password. Data sensitif (password) harus di-hash.
- **Cloud-Based:** Aplikasi dideploy di cloud agar dapat diakses dari mana saja tanpa infrastruktur lokal di warung.

## 3. Core Features
Fitur-fitur kunci yang harus ada dalam versi pertama (MVP):

1.  **Dashboard Real-Time**
    - Ringkasan total penjualan hari ini, jumlah transaksi, dan produk terlaris.
    - **Panel Peringatan Stok Rendah:** Daftar produk yang stoknya di bawah batas minimum.
    - Grafik tren penjualan 7 hari terakhir.
    - Indikator sinkronisasi real-time (live indicator).
2.  **Manajemen Produk (Master Data)**
    - Tambah, Edit, Hapus, dan Lihat daftar produk.
    - Kolom wajib: Nama Produk, SKU/Barcode, Kategori, Harga Beli, Harga Jual, Satuan, Stok Saat Ini, dan Minimum Stok.
    - Pengelolaan kategori produk (Makanan Ringan, Minuman, Rokok, Sembako, dll).
3.  **Pencatatan Transaksi Penjualan (Point of Sale)**
    - Form kasir untuk input transaksi penjualan.
    - Pilih produk, input jumlah, dan sistem otomatis kalkulasi total.
    - Dukungan beberapa metode pembayaran (Tunai, QRIS, Transfer).
    - Cetak/tampilkan struk digital setelah transaksi sukses.
    - **Stok otomatis berkurang** setelah transaksi tersimpan.
4.  **Pencatatan Stok Masuk (Restock/Kulakan)**
    - Form untuk mencatat barang masuk dari supplier.
    - Input: Pilih Produk, Jumlah, Harga Beli, Supplier, dan Tanggal.
    - **Stok otomatis bertambah** setelah pencatatan disimpan.
5.  **Laporan Penjualan & Keuangan Terintegrasi**
    - Laporan penjualan harian, mingguan, dan bulanan.
    - Kalkulasi otomatis: Total Pendapatan, Total Modal (HPP), dan Laba Kotor.
    - Export laporan ke format CSV/PDF.
    - Filter berdasarkan rentang tanggal, kategori, dan kasir.
6.  **Manajemen User & Role**
    - Pemilik dapat menambah/menghapus akun kasir.
    - Dua role: `owner` (akses penuh) dan `cashier` (akses terbatas pada transaksi).

## 4. User Flow
Alur kerja aplikasi dibagi berdasarkan role pengguna. Berikut visualisasi UML untuk memudahkan pemahaman:

### 4.1 Use Case Diagram
Diagram berikut menggambarkan interaksi antara aktor (Pemilik & Kasir) dengan fitur-fitur sistem:

```mermaid
flowchart LR
    Owner(("👤<br/>Pemilik<br/>(Owner)"))
    Cashier(("👤<br/>Kasir<br/>(Cashier)"))

    subgraph SISTEM["Sistem Informasi Persediaan Warung Madura"]
        UC1([Login])
        UC2([Lihat Dashboard<br/>Real-Time])
        UC3([Kelola Produk &<br/>Master Data])
        UC4([Kelola User &<br/>Role])
        UC5([Lihat Laporan<br/>Keuangan])
        UC6([Proses Transaksi<br/>Penjualan])
        UC7([Catat Stok Masuk<br/>Restock])
        UC8([Cetak Struk<br/>Penjualan])
        UC9([Export Laporan<br/>CSV/PDF])
    end

    Owner --- UC1
    Owner --- UC2
    Owner --- UC3
    Owner --- UC4
    Owner --- UC5
    Owner --- UC9

    Cashier --- UC1
    Cashier --- UC6
    Cashier --- UC7
    Cashier --- UC8

    UC6 -.includes.-> UC8
    UC5 -.extends.-> UC9

    style Owner fill:#FFE5B4,stroke:#FF8C00
    style Cashier fill:#B4E5FF,stroke:#0080FF
    style SISTEM fill:#F5F5F5,stroke:#666
```

**Keterangan Hak Akses:**
| Use Case | Pemilik | Kasir |
|----------|:-------:|:-----:|
| Login | ✅ | ✅ |
| Dashboard Real-Time | ✅ (full) | ✅ (terbatas) |
| Kelola Produk | ✅ | ❌ (read-only) |
| Kelola User | ✅ | ❌ |
| Laporan Keuangan | ✅ | ❌ |
| Transaksi Penjualan | ✅ | ✅ |
| Stok Masuk | ✅ | ✅ |

### 4.2 Activity Diagram — Alur Kasir (Cashier)
Diagram aktivitas berikut menggambarkan langkah-langkah operasional kasir saat menggunakan sistem di warung:

```mermaid
flowchart TD
    Start([🟢 Mulai]) --> Login[/Login dengan<br/>Email & Password/]
    Login --> Auth{Kredensial<br/>Valid?}
    Auth -->|Tidak| ErrorLogin[Tampilkan Error]
    ErrorLogin --> Login
    Auth -->|Ya| Menu{Pilih Menu}

    Menu -->|Transaksi Penjualan| T1[Buka Form POS]
    T1 --> T2[Pilih Produk<br/>dari Daftar]
    T2 --> T3[Input Jumlah]
    T3 --> CekStok{Stok<br/>Mencukupi?}
    CekStok -->|Tidak| WarnStok[Tampilkan<br/>Peringatan Stok]
    WarnStok --> T2
    CekStok -->|Ya| T4{Tambah Produk<br/>Lain?}
    T4 -->|Ya| T2
    T4 -->|Tidak| T5[Pilih Metode Bayar<br/>Tunai/QRIS/Transfer]
    T5 --> T6[Simpan Transaksi]
    T6 --> T7[/Sistem Otomatis:<br/>- Kurangi Stok<br/>- Catat Movement<br/>- Push ke Realtime/]
    T7 --> T8[Tampilkan &<br/>Cetak Struk]
    T8 --> Menu

    Menu -->|Stok Masuk| S1[Buka Form Stok Masuk]
    S1 --> S2[Pilih Produk]
    S2 --> S3[Pilih Supplier]
    S3 --> S4[Input Jumlah &<br/>Harga Beli]
    S4 --> S5[Simpan Data]
    S5 --> S6[/Sistem Otomatis:<br/>- Tambah Stok<br/>- Catat Movement/]
    S6 --> Menu

    Menu -->|Logout| End([🔴 Selesai])

    style Start fill:#90EE90
    style End fill:#FFB6C1
    style T7 fill:#FFFACD
    style S6 fill:#FFFACD
    style ErrorLogin fill:#FFCCCB
    style WarnStok fill:#FFCCCB
```

### 4.3 Activity Diagram — Alur Pemilik (Owner)
Diagram aktivitas berikut menggambarkan alur monitoring dan manajemen yang dilakukan pemilik dari jarak jauh:

```mermaid
flowchart TD
    Start([🟢 Mulai]) --> Login[/Login dari HP/Laptop<br/>Email & Password/]
    Login --> Auth{Kredensial<br/>Valid?}
    Auth -->|Tidak| ErrorLogin[Tampilkan Error]
    ErrorLogin --> Login
    Auth -->|Ya| Dashboard[Buka Dashboard<br/>Real-Time]
    Dashboard --> Subscribe[/Subscribe ke<br/>Supabase Realtime/]
    Subscribe --> Menu{Pilih Aksi}

    Menu -->|Monitor Live| M1[Pantau Transaksi<br/>& Penjualan Live]
    M1 --> M2{Ada Stok<br/>di Bawah Minimum?}
    M2 -->|Ya| M3[Hubungi Kasir/Supplier<br/>untuk Restock]
    M2 -->|Tidak| Menu
    M3 --> Menu

    Menu -->|Lihat Laporan| L1[Pilih Periode<br/>Harian/Mingguan/Bulanan]
    L1 --> L2[Sistem Generate Laporan]
    L2 --> L3[Tampilkan:<br/>Pendapatan, HPP, Laba Kotor]
    L3 --> L4{Export<br/>Laporan?}
    L4 -->|Ya| L5[Download CSV/PDF]
    L4 -->|Tidak| Menu
    L5 --> Menu

    Menu -->|Kelola Produk| P1{Aksi Produk?}
    P1 -->|Tambah| P2[Input Data Produk Baru]
    P1 -->|Edit| P3[Update Harga/Stok Min]
    P1 -->|Hapus| P4[Konfirmasi Hapus]
    P2 --> PSave[Simpan ke Database]
    P3 --> PSave
    P4 --> PSave
    PSave --> Menu

    Menu -->|Kelola User| U1{Aksi User?}
    U1 -->|Tambah Kasir| U2[Buat Akun Baru]
    U1 -->|Nonaktifkan| U3[Set is_active = false]
    U2 --> USave[Simpan Perubahan]
    U3 --> USave
    USave --> Menu

    Menu -->|Logout| End([🔴 Selesai])

    style Start fill:#90EE90
    style End fill:#FFB6C1
    style Subscribe fill:#FFFACD
    style L3 fill:#E0FFE0
    style ErrorLogin fill:#FFCCCB
```

### 4.4 Sequence Diagram — Login & Role-Based Routing
Diagram sekuens berikut menggambarkan urutan interaksi antar komponen sistem saat user melakukan login. Sistem akan otomatis mengarahkan user ke halaman yang sesuai dengan role-nya (Owner → Dashboard, Cashier → POS):

```mermaid
sequenceDiagram
    actor User as User<br/>(Owner / Cashier)
    participant UI as Frontend<br/>(Next.js)
    participant Auth as BetterAuth
    participant DB as Supabase<br/>(PostgreSQL)

    User->>UI: Akses halaman /login
    UI-->>User: Tampilkan Form Login
    User->>UI: Submit email & password
    UI->>Auth: signIn(email, password)
    Auth->>DB: SELECT user WHERE email = ?
    DB-->>Auth: Return user record
    Auth->>Auth: Verifikasi password hash

    alt Kredensial Valid
        Auth->>Auth: Generate session token
        Auth->>DB: INSERT session
        DB-->>Auth: Konfirmasi session
        Auth-->>UI: Set cookie + role info

        alt Role = "owner"
            UI->>UI: Redirect ke /dashboard
            UI-->>User: Dashboard Pemilik<br/>(akses penuh)
        else Role = "cashier"
            UI->>UI: Redirect ke /pos
            UI-->>User: Halaman POS<br/>(akses terbatas)
        end

    else Kredensial Invalid
        Auth-->>UI: Response 401 Unauthorized
        UI-->>User: Tampilkan pesan<br/>"Email atau password salah"
    end
```

**Catatan Keamanan:**
- Setiap request API selanjutnya akan menyertakan session cookie yang divalidasi oleh BetterAuth.
- Middleware Next.js akan memeriksa role sebelum mengizinkan akses ke route tertentu (misalnya `/laporan` hanya untuk owner).

### 4.5 State Diagram — Siklus Hidup Transaksi
Diagram state berikut menggambarkan perubahan status sebuah transaksi penjualan dari dibuat hingga selesai. Ini membantu developer memahami logika bisnis dan validasi yang harus diterapkan di setiap tahap:

```mermaid
stateDiagram-v2
    [*] --> Draft: Kasir buka<br/>form POS
    Draft --> Draft: Tambah / Ubah /<br/>Hapus item

    Draft --> Validating: Klik tombol<br/>"Bayar"
    Validating --> Draft: Stok tidak<br/>mencukupi
    Validating --> Pending: Stok valid,<br/>tunggu pembayaran

    Pending --> Completed: Pembayaran<br/>berhasil
    Pending --> Cancelled: Kasir batalkan<br/>transaksi

    Completed --> Refunded: Owner setujui<br/>refund

    Completed --> [*]
    Cancelled --> [*]
    Refunded --> [*]

    note right of Completed
        Aksi otomatis sistem:
        • Kurangi stok produk
        • Insert stock_movement
        • Push update via Realtime
        • Generate & cetak struk
    end note

    note left of Refunded
        Aksi otomatis sistem:
        • Kembalikan stok
        • Catat reverse movement
        • Hanya owner yang berhak
    end note
```

**Penjelasan State:**

| State | Deskripsi | Boleh Diakses Oleh |
|-------|-----------|---------------------|
| **Draft** | Transaksi sedang disusun, belum disimpan ke DB | Cashier, Owner |
| **Validating** | Sistem mengecek ketersediaan stok | Sistem (otomatis) |
| **Pending** | Menunggu konfirmasi pembayaran (untuk QRIS/Transfer) | Cashier, Owner |
| **Completed** | Transaksi berhasil, stok sudah dikurangi | — (final state) |
| **Cancelled** | Transaksi dibatalkan sebelum pembayaran | — (final state) |
| **Refunded** | Transaksi di-refund, stok dikembalikan | Hanya Owner |

### 4.6 Ringkasan Naratif
**Alur Kasir (Cashier):**
1.  Login menggunakan email dan password di perangkat warung (tablet/laptop).
2.  Saat pembeli datang, membuka menu "Transaksi Baru", memilih produk, input jumlah, memilih metode pembayaran, lalu menyimpan.
3.  Sistem otomatis mengurangi stok, mencatat transaksi, dan mencetak struk.
4.  Saat supplier mengirim barang, membuka menu "Stok Masuk", input data, lalu simpan — stok bertambah otomatis.

**Alur Pemilik (Owner):**
1.  Login remote dari HP/laptop di lokasi mana pun.
2.  Memantau Dashboard real-time untuk melihat transaksi live, total penjualan hari ini, dan stok yang menipis.
3.  Membuka menu "Laporan" untuk melihat rekap harian/bulanan dan menganalisis laba kotor.
4.  Mengelola master data produk dan akun user kasir kapan pun diperlukan.

## 5. Architecture
Berikut adalah gambaran arsitektur sistem dan aliran data, khususnya mekanisme sinkronisasi real-time antara kasir dan pemilik:

```mermaid
sequenceDiagram
    participant Cashier as Kasir (Browser)
    participant Owner as Pemilik (Browser)
    participant FE as Frontend (Next.js @ Vercel)
    participant BE as Backend API (Node.js)
    participant Auth as BetterAuth
    participant DB as Database (Supabase PostgreSQL)
    participant RT as Supabase Realtime

    Note over Cashier, RT: Skenario: Kasir Memproses Transaksi, Pemilik Monitor Real-Time

    Owner->>FE: Buka Dashboard (dari rumah)
    FE->>Auth: Verifikasi Session Token
    Auth-->>FE: Token Valid
    FE->>RT: Subscribe ke channel "transactions"
    RT-->>FE: Koneksi WebSocket Established

    Cashier->>FE: Input Transaksi Penjualan
    FE->>BE: POST /api/transactions
    BE->>Auth: Validasi Session & Role
    Auth-->>BE: Role = cashier, Authorized
    BE->>DB: INSERT transaction + transaction_items
    BE->>DB: UPDATE stock (kurangi qty produk)
    BE->>DB: INSERT stock_movement (log)
    DB-->>BE: Konfirmasi Sukses
    BE-->>FE: Response 201 Created
    FE-->>Cashier: Tampilkan Struk & Notifikasi

    DB->>RT: Trigger Perubahan Data
    RT-->>FE: Push Update via WebSocket
    FE-->>Owner: Dashboard Update Otomatis (tanpa refresh)
```

**Penjelasan Alur:**
- **Frontend (Next.js)** di-deploy di Vercel dan menjadi antarmuka untuk semua pengguna.
- **Backend Logic** dijalankan via Next.js API Routes (Node.js runtime) untuk memproses request bisnis.
- **BetterAuth** menangani session management dan role-based access control.
- **Supabase** menyediakan PostgreSQL sebagai database sekaligus **Supabase Realtime** untuk mekanisme WebSocket yang memungkinkan sinkronisasi data live ke dashboard pemilik.

## 6. Database Schema

Berikut adalah Entity Relationship Diagram (ERD) yang menggambarkan struktur database utama:

```mermaid
erDiagram
    users {
        uuid id PK
        string email
        string password_hash
        string name
        string role
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    categories {
        int id PK
        string name
        string description
        datetime created_at
    }

    products {
        int id PK
        string sku
        string name
        int category_id FK
        decimal purchase_price
        decimal selling_price
        string unit
        int current_stock
        int min_stock
        datetime created_at
        datetime updated_at
    }

    suppliers {
        int id PK
        string name
        string phone
        string address
        datetime created_at
    }

    transactions {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        decimal total_cost
        string payment_method
        datetime created_at
    }

    transaction_items {
        int id PK
        uuid transaction_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal unit_cost
        decimal subtotal
    }

    stock_ins {
        uuid id PK
        uuid user_id FK
        int supplier_id FK
        decimal total_cost
        date received_date
        datetime created_at
    }

    stock_in_items {
        int id PK
        uuid stock_in_id FK
        int product_id FK
        int quantity
        decimal unit_cost
    }

    stock_movements {
        int id PK
        int product_id FK
        string type
        int quantity
        string reference_type
        uuid reference_id
        string notes
        uuid user_id FK
        datetime created_at
    }

    users ||--o{ transactions : "creates"
    users ||--o{ stock_ins : "creates"
    users ||--o{ stock_movements : "performs"
    categories ||--o{ products : "categorizes"
    products ||--o{ transaction_items : "sold in"
    products ||--o{ stock_in_items : "restocked in"
    products ||--o{ stock_movements : "tracked in"
    transactions ||--o{ transaction_items : "contains"
    stock_ins ||--o{ stock_in_items : "contains"
    suppliers ||--o{ stock_ins : "supplies"
```

| Tabel | Deskripsi |
|-------|-----------|
| **users** | Data pengguna sistem dengan role `owner` atau `cashier`. Dikelola oleh BetterAuth. |
| **categories** | Kategori produk (contoh: Minuman, Makanan Ringan, Rokok, Sembako). |
| **products** | Master data produk, termasuk harga beli, harga jual, stok, dan batas minimum. |
| **suppliers** | Data supplier/pemasok tempat warung kulakan barang. |
| **transactions** | Header transaksi penjualan, mencatat total, metode bayar, dan kasir yang input. |
| **transaction_items** | Detail item per transaksi, menyimpan harga jual dan harga beli saat transaksi terjadi (snapshot untuk akurasi laporan laba). |
| **stock_ins** | Header pencatatan stok masuk/restock dari supplier. |
| **stock_in_items** | Detail item per transaksi stok masuk. |
| **stock_movements** | Log audit semua pergerakan stok (IN/OUT), terhubung ke transaksi atau stock_in sebagai referensi. |

## 7. Design & Technical Constraints
Bagian ini mengatur batasan teknis dan panduan desain yang wajib dipatuhi selama pengembangan.

1.  **Technology Stack (Wajib):**
    Sistem dibangun menggunakan stack teknologi yang telah ditetapkan untuk menjaga konsistensi, performa, dan kemudahan deployment:
    -   **Frontend (UI & Tampilan User):** `Next.js` — menggunakan App Router dan React Server Components untuk performa optimal dan SEO-friendly.
    -   **Backend (Logic & API Server):** `Node.js` — diimplementasikan via Next.js API Routes atau Route Handlers, sehingga backend & frontend berada dalam satu codebase monorepo.
    -   **Database (Penyimpanan Data):** `PostgreSQL` via `Supabase` — sekaligus memanfaatkan fitur **Supabase Realtime** untuk WebSocket subscription pada tabel `transactions` dan `stock_movements`.
    -   **Deployment (Hosting & Infra):** `Vercel` — auto-deploy dari Git dengan CI/CD otomatis, SSL, dan CDN global.
    -   **Authentication:** `BetterAuth` — untuk sign-in email/password, session management, dan role-based access control (RBAC).

2.  **Typography Rules:**
    Sistem antarmuka (UI) wajib menggunakan konfigurasi font variable sebagai berikut untuk menjaga konsistensi visual:
    -   **Sans:** `Geist Mono, ui-monospace, monospace`
    -   **Serif:** `serif`
    -   **Mono:** `JetBrains Mono, monospace`

3.  **Responsiveness & UX:**
    -   Aplikasi wajib mobile-first (karena pemilik sering mengakses via HP).
    -   Halaman POS (kasir) dioptimasi untuk tablet dengan touch-friendly buttons (minimum 44x44px).
    -   Semua interaksi krusial (simpan transaksi, hapus produk) harus memberikan feedback visual (loading state, toast notification).

4.  **Performance Constraints:**
    -   Waktu response API untuk transaksi penjualan harus di bawah **500ms** (kritis untuk pengalaman kasir).
    -   Initial page load (LCP) maksimal **2.5 detik** di koneksi 4G.

5.  **Security Constraints:**
    -   Semua endpoint API wajib diverifikasi session-nya oleh BetterAuth.
    -   Role `cashier` tidak boleh mengakses endpoint manajemen user, manajemen produk (hanya read), dan laporan keuangan.
    -   Password wajib di-hash menggunakan algoritma yang disediakan BetterAuth (tidak pernah disimpan plaintext).

## 8. Development Methodology
Pengembangan sistem menggunakan metodologi **Waterfall** yang dilengkapi dengan fase **User Acceptance Testing (UAT)** di akhir. Pendekatan ini dipilih karena kebutuhan sudah relatif stabil dan terdefinisi jelas dalam PRD ini, sehingga cocok dengan pendekatan sekuensial.

### 8.1 Fase Waterfall

```mermaid
flowchart LR
    A[1. Requirement<br/>Analysis] --> B[2. System<br/>Design]
    B --> C[3. Implementation<br/>Coding]
    C --> D[4. Integration<br/>Testing]
    D --> E[5. UAT<br/>User Acceptance]
    E --> F[6. Deployment<br/>Maintenance]
```

| Fase | Deliverable Utama | Estimasi Durasi |
|------|-------------------|-----------------|
| **1. Requirement Analysis** | Dokumen PRD final, wawancara dengan pemilik warung | 1 minggu |
| **2. System Design** | ERD, wireframe UI, API contract, arsitektur teknis | 2 minggu |
| **3. Implementation** | Kode frontend (Next.js), backend (Node.js), skema DB (Supabase), integrasi BetterAuth | 6 minggu |
| **4. Integration Testing** | Unit test, integration test, bug fixing | 2 minggu |
| **5. UAT** | Skenario uji oleh pemilik & kasir, dokumen hasil UAT, revisi berdasarkan feedback | 2 minggu |
| **6. Deployment** | Aplikasi live di Vercel, dokumentasi user, training kasir | 1 minggu |

### 8.2 Skenario UAT (User Acceptance Testing)
UAT dilakukan langsung di warung dengan pemilik dan kasir sebagai penguji. Beberapa skenario utama yang akan diuji:

1.  **UAT-01: Login Multi-Device**
    Pemilik login dari HP di rumah, bersamaan dengan kasir yang login di tablet warung. Kedua session harus berjalan independen.
2.  **UAT-02: Transaksi Penjualan Real-Time**
    Kasir melakukan transaksi, dan pemilik harus melihat update di dashboard dalam waktu <3 detik tanpa refresh manual.
3.  **UAT-03: Akurasi Stok Otomatis**
    Setelah 10 transaksi penjualan, cek apakah stok di master produk sesuai (stok awal - total terjual).
4.  **UAT-04: Stok Masuk**
    Kasir mencatat kedatangan barang dari supplier, stok harus bertambah sesuai input.
5.  **UAT-05: Laporan Keuangan**
    Generate laporan penjualan harian, cek akurasi total pendapatan, total HPP, dan laba kotor.
6.  **UAT-06: Role-Based Access**
    Akun kasir mencoba mengakses halaman laporan keuangan dan manajemen user — sistem harus menolak.
7.  **UAT-07: Peringatan Stok Rendah**
    Turunkan stok produk hingga di bawah minimum, dashboard harus menampilkan alert.

Sistem dinyatakan **accepted** jika ≥95% skenario UAT berstatus PASS dan tidak ada bug dengan severity Critical/High yang tersisa.
