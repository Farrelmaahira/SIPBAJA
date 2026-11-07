# SIPBAJA RESTful API Contract Specification

Dokumen ini merupakan kontrak resmi API (*API Contract*) antara **Backend (Laravel 11)** dan **Frontend (React/TypeScript)** untuk aplikasi **SIPBAJA (Sistem Informasi Pengadaan Barang dan Jasa)**.

---

## 1. Standar Arsitektur & Protokol

### 1.1 Base URL & Versi
- **Local Development:** `http://localhost:8000/api/v1`
- **User Profile Endpoint:** `http://localhost:8000/api/user`
- **Sanctum CSRF Cookie:** `http://localhost:8000/sanctum/csrf-cookie`

### 1.2 Header Standar Permintaan (Request Headers)
Semua panggilan API wajib menyertakan header berikut:

```http
Accept: application/json
Content-Type: application/json
```
*(Kecuali pada endpoint unggah dokumen yang menggunakan `multipart/form-data`, di mana browser/Axios akan otomatis mengatur `Content-Type` berserta boundary).*

### 1.3 Skema Autentikasi
SIPBAJA mendukung dua mode otentikasi via Laravel Sanctum:

1. **Bearer Token (Direkomendasikan untuk SPA & API Client):**
   ```http
   Authorization: Bearer <token>
   ```
2. **Stateful Session Cookie (SPA Cookie):**
   - Mendapatkan CSRF cookie via `GET /sanctum/csrf-cookie`.
   - Mengirim header `X-XSRF-TOKEN: <decoded_cookie_value>`.

---

## 2. Standar Struktur Response Global

### 2.1 HTTP Status Codes
| Code | Deskripsi | Kapan Digunakan |
| :--- | :--- | :--- |
| **200 OK** | Permintaan berhasil diproses | Query data (`GET`), perubahan data sukses (`PUT`/`POST`) |
| **201 Created** | Data baru berhasil dibuat | Pembuatan data baru (`POST`) |
| **204 No Content** | Berhasil tanpa konten balikan | Penghapusan data (`DELETE`), logout |
| **400 Bad Request** | Format request tidak valid | Parameter malformed |
| **401 Unauthenticated** | Belum login atau token tidak valid / kadaluwarsa | Token kosong, salah, atau dicabut |
| **403 Forbidden** | Terotentikasi, namun tidak memiliki izin/role | Role pengguna tidak sesuai dengan endpoint |
| **404 Not Found** | Data atau route tidak ditemukan | Model binding tidak menemukan id |
| **422 Unprocessable Content** | Gagal validasi data form / aturan bisnis | Input tidak valid, duplikat, atau ketergantungan relasi |
| **429 Too Many Requests** | Terkena pembatasan rate limit | Percobaan login berulang kali gagal |
| **500 Internal Server Error** | Kesalahan sistem tak terduga pada server | Bug backend / database crash |

---

### 2.2 Struktur Success Response

#### A. Single Object / Mutation Success
```json
{
  "message": "Pengguna berhasil ditambahkan.",
  "user": {
    "id": 10,
    "nama": "Staff Pengadaan Baru",
    "email": "staff@pnj.ac.id",
    "role_id": 1,
    "unit_id": 2,
    "created_at": "2026-11-01T21:00:00.000000Z",
    "updated_at": "2026-11-01T21:00:00.000000Z"
  }
}
```

#### B. Paginated Collection
```json
{
  "data": [
    {
      "id": 1,
      "nama": "Admin Sistem"
    }
  ],
  "current_page": 1,
  "first_page_url": "http://localhost:8000/api/v1/admin/pengguna?page=1",
  "from": 1,
  "last_page": 5,
  "last_page_url": "http://localhost:8000/api/v1/admin/pengguna?page=5",
  "links": [
    { "url": null, "label": "&laquo; Sebelumnya", "active": false },
    { "url": "http://localhost:8000/api/v1/admin/pengguna?page=1", "label": "1", "active": true }
  ],
  "next_page_url": "http://localhost:8000/api/v1/admin/pengguna?page=2",
  "path": "http://localhost:8000/api/v1/admin/pengguna",
  "per_page": 10,
  "prev_page_url": null,
  "to": 10,
  "total": 48
}
```

---

### 2.3 Struktur Error Response

#### A. 422 Unprocessable Content (Validasi Form)
Format standar Laravel Validation Error berbahasa Indonesia:
```json
{
  "message": "Nominal atau estimasi anggaran wajib diisi.",
  "errors": {
    "judul": [
      "Judul pengadaan wajib diisi."
    ],
    "estimasi_anggaran": [
      "Nominal atau estimasi anggaran wajib diisi.",
      "Estimasi anggaran minimal Rp 1."
    ],
    "file_dokumen": [
      "Surat permohonan harus berformat PDF (.pdf)."
    ]
  }
}
```

#### B. 422 Unprocessable Content (Aturan Bisnis / Integritas Relasi)
```json
{
  "message": "Unit kerja dipakai pengguna atau permohonan dan tidak bisa dihapus."
}
```

#### C. 401 Unauthenticated (Belum Login / Token Kedaluwarsa)
```json
{
  "message": "Unauthenticated."
}
```

#### D. 403 Forbidden (Peran Tidak Diizinkan)
```json
{
  "message": "Akses ditolak untuk peran Anda."
}
```

#### E. 404 Not Found (Data Tidak Ditemukan)
```json
{
  "message": "No query results for model [App\\Models\\User] 999"
}
```

#### F. 429 Too Many Requests (Rate Limiter Throttling)
```json
{
  "message": "Terlalu banyak percobaan login. Coba lagi dalam 60 detik."
}
```

#### G. 500 Internal Server Error (Server Failure)
```json
{
  "message": "Server Error"
}
```

---

## 3. Spesifikasi Detail Endpoint per Modul

---

### 3.1 Autentikasi & Sesi Pengguna

#### 1. Inisialisasi CSRF Cookie
- **Method & URL:** `GET /sanctum/csrf-cookie`
- **Akses:** Publik (Guest)
- **Success Response (204 No Content):** Set Cookie `XSRF-TOKEN` dan `laravel_session`.

---

#### 2. Login
- **Method & URL:** `POST /api/v1/login`
- **Akses:** Publik (Guest)
- **Request Body (JSON):**
  ```json
  {
    "login": "admin@pnj.ac.id",
    "password": "password123",
    "remember": true
  }
  ```
  *Aturan:*
  - `login`: string, required (dapat berupa alamat email atau nama username).
  - `password`: string, required, min 8 karakter.
  - `remember`: boolean, optional (default: false). Jika true, masa aktif token 30 hari. Jika false, 1 hari.
- **Success Response (200 OK):**
  ```json
  {
    "user": {
      "id": 1,
      "nama": "Admin",
      "email": "admin@pnj.ac.id",
      "role_id": 1,
      "unit_id": null,
      "Role": {
        "id": 1,
        "nama": "Admin"
      }
    },
    "role": "admin",
    "token": "1|nB4fLz...",
    "token_type": "Bearer",
    "expires_at": "2026-12-01T21:00:00.000000Z"
  }
  ```
- **Error Responses:**
  - `422 Unprocessable Content`: Kredensial tidak cocok atau validasi kosong.
    ```json
    {
      "message": "Kredensial tidak cocok dengan data kami.",
      "errors": {
        "login": ["Kredensial tidak cocok dengan data kami."]
      }
    }
    ```
  - `429 Too Many Requests`: Gagal 5 kali berturut-turut.

---

#### 3. Get Authenticated User Profile
- **Method & URL:** `GET /api/user`
- **Akses:** Terotentikasi (`auth:sanctum`)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "nama": "Admin",
    "email": "admin@pnj.ac.id",
    "role_id": 1,
    "unit_id": null,
    "Role": {
      "id": 1,
      "nama": "Admin"
    }
  }
  ```
- **Error Response:**
  - `401 Unauthenticated`: Token tidak ada atau kadaluwarsa.

---

#### 4. Logout
- **Method & URL:** `POST /api/v1/logout`
- **Akses:** Terotentikasi (`auth:sanctum`)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (204 No Content):** (Body kosong, token dihapus dari database).
- **Error Response:**
  - `401 Unauthenticated`

---

### 3.2 Modul Admin (`role:Admin`)

Prefix Rute: `/api/v1/admin`

#### 1. Dashboard Admin
- **Method & URL:** `GET /api/v1/admin/dashboard`
- **Success Response (200 OK):**
  ```json
  {
    "stats": [
      { "label": "Total Pengguna", "value": 24, "unit": "Akun", "variant": "primary" },
      { "label": "Unit Terdaftar", "value": 8, "unit": "Unit", "variant": "info" },
      { "label": "MAK Aktif", "value": 4, "unit": "MAK", "variant": "success" }
    ],
    "recentUsers": [
      { "id": 1, "nama": "Dr. Ahmad Farhan", "email": "farhan@pnj.ac.id", "role": "Perencanaan", "unit": "Pusat Perencanaan", "status": "aktif", "tanggal": "14 Mei 2026" }
    ]
  }
  ```
- **Error Response:** `403 Forbidden` jika bukan Admin.

---

#### 2. Manajemen Pengguna (CRUD)

- **List Pengguna:** `GET /api/v1/admin/pengguna?q={keyword}&page={page}`
  - **Success Response (200 OK):**
    ```json
    {
      "users": { /* Paginated User Collection */ },
      "roles": [{ "id": 1, "nama": "Admin" }],
      "units": [{ "id": 1, "nama": "Teknik Informatika" }],
      "filters": { "q": "" }
    }
    ```

- **Tambah Pengguna:** `POST /api/v1/admin/pengguna`
  - **Request Body (JSON):**
    ```json
    {
      "nama": "Staff Pengadaan",
      "email": "staff@pnj.ac.id",
      "password": "password123",
      "role_id": 1,
      "unit_id": 1
    }
    ```
  - **Success Response (201 Created):**
    ```json
    {
      "message": "Pengguna berhasil ditambahkan.",
      "user": { "id": 5, "nama": "Staff Pengadaan", "email": "staff@pnj.ac.id" }
    }
    ```
  - **Error Response (422):**
    ```json
    {
      "message": "Email sudah dipakai pengguna lain.",
      "errors": { "email": ["Email sudah dipakai pengguna lain."] }
    }
    ```

- **Ubah Pengguna:** `PUT /api/v1/admin/pengguna/{id}`
  - **Request Body:** Sesuai body pembuatan (`password` bersifat optional).
  - **Success Response (200 OK):** `{ "message": "Pengguna berhasil diubah.", "user": { ... } }`

- **Hapus Pengguna:** `DELETE /api/v1/admin/pengguna/{id}`
  - **Success Response (204 No Content)**

---

#### 3. Manajemen Unit Kerja (CRUD)

- **List Unit Kerja:** `GET /api/v1/admin/unit-kerja?q={keyword}&page={page}`
- **Tambah Unit Kerja:** `POST /api/v1/admin/unit-kerja`
  - **Request Body:** `{ "nama": "Jurusan Teknik Elektro" }`
  - **Success Response (201 Created):** `{ "message": "Unit kerja berhasil ditambahkan.", "unit": { ... } }`
- **Ubah Unit Kerja:** `PUT /api/v1/admin/unit-kerja/{id}`
- **Hapus Unit Kerja:** `DELETE /api/v1/admin/unit-kerja/{id}`
  - **Success Response (204 No Content)**
  - **Error Response (422):**
    ```json
    {
      "message": "Unit kerja dipakai pengguna atau permohonan dan tidak bisa dihapus."
    }
    ```

---

#### 4. Manajemen Mata Anggaran Kegiatan (MAK)

- **List MAK:** `GET /api/v1/admin/mak?q={keyword}&page={page}`
- **Tambah MAK:** `POST /api/v1/admin/mak`
  - **Request Body:** `{ "nama": "521111 - Belanja Operasional", "ppk_user_id": 6 }`
  - **Success Response (201 Created):** `{ "message": "MAK berhasil ditambahkan.", "mak": { ... } }`
- **Ubah MAK:** `PUT /api/v1/admin/mak/{id}`
- **Hapus MAK:** `DELETE /api/v1/admin/mak/{id}`
  - **Error Response (422):** `{ "message": "MAK dipakai permohonan dan tidak bisa dihapus." }`

---

#### 5. Role & Role Permission Matrix

- **List Role:** `GET /api/v1/admin/role`
- **Tambah Role:** `POST /api/v1/admin/role` -> `{ "nama": "Auditor" }`
- **Hapus Role:** `DELETE /api/v1/admin/role/{id}`
- **Matrix Role Permission:** `GET /api/v1/admin/role-permission`
  - **Success Response (200 OK):**
    ```json
    {
      "roles": [{ "id": 1, "nama": "Admin" }],
      "groupedPermissions": {
        "akun": [{ "id": 1, "kode": "akun.view" }, { "id": 2, "kode": "akun.create" }]
      },
      "assignments": {
        "1": [1, 2, 3, 4]
      },
      "selectedRoleId": 0
    }
    ```
- **Update Role Permissions:** `PUT /api/v1/admin/role-permission/{roleId}`
  - **Request Body:** `{ "permission_ids": [1, 2, 5, 8] }`
  - **Success Response (200 OK):** `{ "message": "Hak akses berhasil disimpan." }`

---

### 3.3 Modul Pemohon (`role:Pemohon`)

Prefix Rute: `/api/v1/pemohon`

#### 1. Dashboard Pemohon
- **Method & URL:** `GET /api/v1/pemohon/dashboard`
- **Success Response (200 OK):** Statistik dan rekap permohonan milik user saat ini.

---

#### 2. Daftar & Detail Permohonan
- **Method & URL:** `GET /api/v1/pemohon/permohonan?status={status}&search={search}&page={page}`
  - Parameter `status` (opsional): status tunggal, format dipisah koma (contoh: `menunggu_persetujuan,sedang_diproses`), atau array. Pilihan status: `semua`, `menunggu_persetujuan`, `menunggu_verifikasi`, `sedang_diproses`, `disetujui`, `ditolak`.
  - Parameter `search` (opsional): kata kunci pencarian nomor surat atau judul pengadaan.
  - Parameter `page` (opsional): nomor halaman paginasi (default 1).
  - **Success Response (200 OK):**
    ```json
    {
      "permohonanList": {
        "current_page": 1,
        "data": [
          {
            "id": 1,
            "unit_id": 2,
            "created_by": 5,
            "nomor_surat": "01010-FF-11",
            "judul": "Pengadaan Komputer Lab",
            "ringkasan_tujuan": "Kebutuhan praktikum mahasiswa",
            "estimasi_anggaran": 185000000,
            "revisi_ke": 0,
            "status": "menunggu_bidang2",
            "created_at": "2026-10-12T10:00:00.000000Z",
            "dokumen": []
          }
        ],
        "from": 1,
        "last_page": 24,
        "per_page": 10,
        "to": 10,
        "total": 238
      },
      "filters": { "status": "semua", "search": "" }
    }
    ```

---

#### 3. Detail Lengkap Permohonan
- **Method & URL:** `GET /api/v1/pemohon/permohonan/{permohonanId}`
- **Success Response (200 OK):**
  ```json
  {
    "permohonan": {
      "id": 1,
      "nomor_surat": "111-FFF-111",
      "judul": "Pengadaan Komputer Lab",
      "ringkasan_tujuan": "Kebutuhan praktikum mahasiswa",
      "estimasi_anggaran": 185000000,
      "revisi_ke": 0,
      "status": "menunggu_bidang2",
      "created_at": "2026-10-12T10:00:00.000000Z",
      "unit_id": 2,
      "unit_nama": "Jurusan Teknik Informatika & Komputer",
      "created_by": 5,
      "pembuat_nama": "Admin Jurusan",
      "dokumen": {
        "id": 1,
        "nama_asli": "Surat_Permohonan_Pengadaan_Komputer.pdf",
        "ukuran_bytes": 8388608,
        "mime_type": "application/pdf",
        "download_url": "/api/v1/pemohon/permohonan/1/dokumen"
      },
      "catatan_penolakan": null,
      "timeline_stages": [
        {
          "tahap": "permohonan",
          "label": "Permohonan",
          "status": "active",
          "keterangan": "Menunggu persetujuan"
        },
        {
          "tahap": "pengadaan",
          "label": "Pengadaan",
          "status": "pending",
          "keterangan": "Menunggu proses pengadaan"
        },
        {
          "tahap": "pembelian",
          "label": "Pembelian Barang",
          "status": "pending",
          "keterangan": "Menunggu pembelian barang"
        },
        {
          "tahap": "penerimaan",
          "label": "Penerimaan Barang",
          "status": "pending",
          "keterangan": "Menunggu barang diterima"
        },
        {
          "tahap": "selesai",
          "label": "Selesai",
          "status": "pending",
          "keterangan": "Menunggu penyelesaian"
        }
      ],
      "history": [
        {
          "id": 1,
          "status_lama": null,
          "status_baru": "diajukan",
          "deskripsi": "Permohonan diajukan oleh Jurusan Teknik Informatika & Komputer",
          "actor_nama": "Admin Jurusan",
          "actor_role": "Pemohon",
          "waktu": "12-10-2026 10:00"
        }
      ]
    }
  }
  ```
- **Error Response (403 Forbidden):** Akses ditolak untuk unit lain (`{ "message": "Akses tidak diizinkan untuk unit lain." }`).
- **Error Response (404 Not Found):** Permohonan tidak ditemukan.

---

#### 4. Submit Permohonan Baru (Multipart)
- **Method & URL:** `POST /api/v1/pemohon/permohonan`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `judul`: string, required, max: 255.
  - `estimasi_anggaran`: numeric, required, min: 1.
  - `nomor_surat`: string, optional, max: 100.
  - `ringkasan_tujuan`: string, optional, max: 1000.
  - `file_dokumen`: file (PDF only, max: 10MB), required.
- **Success Response (201 Created):**
  ```json
  {
    "message": "Permohonan pengadaan berhasil dikirim dan masuk antrean verifikasi.",
    "permohonan": {
      "id": 12,
      "judul": "Pengadaan PC Laboratorium",
      "estimasi_anggaran": 45000000,
      "status": "menunggu_verifikasi"
    }
  }
  ```
- **Error Response (422 Unprocessable Content):**
  ```json
  {
    "message": "Surat permohonan harus berformat PDF (.pdf).",
    "errors": {
      "file_dokumen": ["Surat permohonan harus berformat PDF (.pdf)."]
    }
  }
  ```

---

#### 5. Unduh Berkas Dokumen Permohonan
- **Method & URL:** `GET /api/v1/pemohon/permohonan/{permohonanId}/dokumen`
- **Success Response (200 OK):** File binary stream (`application/pdf`) dengan header `Content-Disposition: attachment; filename="Surat_Permohonan.pdf"`.
- **Error Response (403 Forbidden):** Jika bukan pemilik dokumen atau unit tidak cocok.

---

#### 6. Submit Revisi Permohonan (Multipart)
- **Method & URL:** `POST /api/v1/pemohon/permohonan/{permohonanId}/revisi`
- **Akses:** Terotentikasi (`role:Pemohon`, kepemilikan unit kerja)
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `judul`: string, required, max: 255.
  - `estimasi_anggaran`: numeric, required, min: 1.
  - `ringkasan_tujuan`: string, optional, max: 1000.
  - `file_dokumen`: file (PDF), optional, max: 10240 KB (10 MB). Jika diunggah, berkas versi baru disimpan tanpa menghapus riwayat berkas sebelumnya. Jika tidak diunggah, berkas aktif saat ini dipertahankan.
- **Success Response (200 OK):**
  ```json
  {
    "message": "Permohonan pengadaan berhasil diperbaiki dan diajukan ulang.",
    "permohonan": {
      "id": 1,
      "nomor_surat": "01014-FF-11",
      "judul": "Pengadaan Printer Laboratorium Perbaikan",
      "ringkasan_tujuan": "Perbaikan spesifikasi",
      "estimasi_anggaran": 26500000,
      "revisi_ke": 1,
      "status": "diajukan"
    }
  }
  ```
- **Error Responses:**
  - `403 Forbidden`: Jika permohonan milik unit lain.
  - `422 Unprocessable Content`: Jika status permohonan bukan `ditolak` atau validasi isian gagal.

---

### 3.4 Modul Perencanaan (`role:Perencanaan`)

Prefix Rute: `/api/v1/perencanaan`

#### 1. Dashboard Perencanaan
- **Method & URL:** `GET /api/v1/perencanaan/dashboard`
- **Success Response (200 OK):** Mengembalikan data statistik ringkasan pengajuan masuk, verifikasi, dan RKAKL.

#### 2. Daftar & Detail Pengajuan
- **List Pengajuan:** `GET /api/v1/perencanaan/pengajuan?status={status}&search={search}`
- **Detail Pengajuan:** `GET /api/v1/perencanaan/pengajuan/{permohonanId}`
  - **Success Response (200 OK):**
    ```json
    {
      "detail": {
        "id": 1,
        "nomor_surat": "042/TI/PNJ/2026",
        "judul": "Pengadaan Laptop",
        "estimasi_anggaran": 45000000,
        "status": "menunggu_verifikasi",
        "unit": { "nama": "Teknik Informatika" },
        "dokumen": [{ "id": 1, "nama_asli": "Surat_042.pdf" }]
      },
      "recentNotifications": [],
      "unreadNotificationsCount": 0
    }
    ```

#### 3. Verifikasi / Approve Permohonan
- **Method & URL:** `POST /api/v1/perencanaan/pengajuan/{permohonanId}/approve`
- **Request Body (JSON):**
  ```json
  {
    "mak_ids": [1]
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Permohonan berhasil diverifikasi dan diteruskan ke tahap berikutnya."
  }
  ```
- **Error Response (422):** `{ "errors": { "mak_ids": ["Mata Anggaran Kegiatan wajib dipilih."] } }`

#### 4. Penolakan / Reject Permohonan
- **Method & URL:** `POST /api/v1/perencanaan/pengajuan/{permohonanId}/reject`
- **Request Body (JSON):**
  ```json
  {
    "alasan": "Rincian spesifikasi barang belum dilampirkan secara lengkap."
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Permohonan telah ditolak dan dikembalikan ke pemohon."
  }
  ```

#### 5. Kirim ke Pengadaan (PPBJ)
- **Method & URL:** `POST /api/v1/perencanaan/pengajuan/{permohonanId}/kirim-pengadaan`
- **Request Body (JSON):** `{ "mak_id": 1 }`
- **Success Response (200 OK):** `{ "message": "Jenis MAK pengadaan berhasil ditetapkan dan dikirim." }`

#### 6. Manajemen Jenis MAK & RKAKL
- **List Jenis MAK:** `GET /api/v1/perencanaan/jenis-mak?q={keyword}`
- **Tambah Jenis MAK:** `POST /api/v1/perencanaan/jenis-mak`
  - Body: `{ "kode": "MAK-01", "nama": "Belanja Komputer", "ppk_user_id": 6, "penanggung_jawab": "PPK Kampus" }`
  - Response (201 Created): `{ "message": "Jenis MAK baru berhasil ditambahkan.", "mak": { ... } }`
- **Update Dokumen RKAKL:** `POST /api/v1/perencanaan/rkakl`
  - Body: `{ "filename": "RKAKL_2026_v5.pdf" }`
  - Response (200 OK): `{ "message": "Dokumen RKAKL berhasil diperbarui dengan versi terbaru." }`

#### 7. Notifikasi
- **List Notifikasi:** `GET /api/v1/perencanaan/notifikasi?tab=semua`
- **Tandai Semua Dibaca:** `POST /api/v1/perencanaan/notifikasi/read-all`
- **Tandai Satu Dibaca:** `POST /api/v1/perencanaan/notifikasi/{notificationId}/read`

---

### 3.5 Modul Bidang 2 (Wakil Direktur II) (`role:Bidang 2`)

Prefix Rute: `/api/v1/bidang-2`

- **Dashboard:** `GET /api/v1/bidang-2/dashboard?tahun=2026`
  - **Success Response (200 OK):**
    ```json
    {
      "ringkasan": { "total_pengajuan": 15, "total_anggaran": 540000000 },
      "riwayatTerbaru": [],
      "statistikBulanan": [],
      "totalDisetujui": 12,
      "totalDitolak": 2,
      "tahunAktif": 2026
    }
    ```
- **List Pengajuan:** `GET /api/v1/bidang-2/pengajuan?status=semua&search=`
- **Detail Pengajuan:** `GET /api/v1/bidang-2/pengajuan/{id}`
  - **Success Response (200 OK):**
    ```json
    {
      "permohonan": {
        "id": 1,
        "nomor_surat": "111-FFF-111",
        "judul": "Pengadaan Komputer",
        "ringkasan_tujuan": "Kebutuhan praktikum mahasiswa di laboratorium",
        "unit_nama": "Jurusan Teknik Informatika & Komputer",
        "estimasi_anggaran": 100000000,
        "revisi_ke": 0,
        "status": "menunggu_bidang2",
        "tanggal_pengajuan": "04 Maret 2027",
        "created_at": "2027-03-04T08:00:00Z",
        "mak_list": [
          { "id": 1, "kode": "532111", "nama": "Belanja Modal Peralatan dan Mesin" }
        ],
        "dokumen": {
          "id": 10,
          "nama_asli": "Surat_Permohonan_Pengadaan_Komputer.pdf",
          "ukuran_bytes": 8388608,
          "mime_type": "application/pdf",
          "download_url": "/api/v1/bidang-2/permohonan/1/dokumen"
        },
        "catatan_perencanaan": {
          "pemeriksa_nama": "Tim Perencanaan",
          "pemeriksa_peran": "Tim Perencanaan",
          "tanggal": "05 Maret 2027, 09:30",
          "catatan": "Jenis MAK 532111 telah diverifikasi. Mohon periksa kesesuaian nominal dengan Dokumen RKAKL terbaru sebelum memberi keputusan."
        },
        "rkakl_aktif": {
          "versi": 3,
          "nama_asli": "RKAKL_TA_2026_Satker_Politeknik_v3.pdf",
          "updated_at": "12 Okt 2026",
          "download_url": "/api/v1/bidang-2/rkakl"
        },
        "keputusan_bidang2": null
      }
    }
    ```
- **Persetujuan Permohonan (Approval dengan Memo):** `POST /api/v1/bidang-2/pengajuan/{id}/approve`
  - **Content-Type:** `multipart/form-data`
  - **Form Data:**
    - `file_memo`: file (PDF), required, max 20480 KB (20 MB).
  - **Success Response (200 OK):**
    ```json
    {
      "message": "Permohonan berhasil disetujui dan memo persetujuan telah tersimpan.",
      "permohonan": { "id": 1, "status": "disetujui" }
    }
    ```
- **Penolakan Permohonan (Rejection dengan Alasan):** `POST /api/v1/bidang-2/pengajuan/{id}/reject`
  - **Content-Type:** `application/json`
  - **Request Body:**
    ```json
    {
      "alasan": "Estimasi anggaran melebihi alokasi MAK semester ini. Harap disesuaikan."
    }
    ```
  - **Success Response (200 OK):**
    ```json
    {
      "message": "Permohonan berhasil ditolak dan catatan telah diteruskan ke pemohon serta Perencanaan.",
      "permohonan": { "id": 1, "status": "ditolak", "revisi_ke": 1 }
    }
    ```
- **Unduh Memo Persetujuan:** `GET /api/v1/bidang-2/pengajuan/{id}/memo`
- **List Dokumen RKAKL:** `GET /api/v1/bidang-2/rkakl`
- **Unduh Dokumen:** `GET /api/v1/bidang-2/permohonan/{permohonanId}/dokumen`

---

### 3.6 Modul PPBJ (`role:PPBJ`)

Prefix Rute: `/api/v1/ppbj`

#### 1. Dashboard PPBJ
- **Method & URL:** `GET /api/v1/ppbj/dashboard`
- **Success Response (200 OK):** Rekap paket pengadaan, antrean pemaketan, dan status review.

#### 2. List & Detail Permohonan
- **List:** `GET /api/v1/ppbj/permohonan`
- **Detail:** `GET /api/v1/ppbj/permohonan/{id}`

#### 3. Simpan Draft Paket Pengadaan
- **Method & URL:** `POST /api/v1/ppbj/permohonan/{id}/pengadaan/draft`
- **Request Body (JSON):**
  ```json
  {
    "items": [
      {
        "permohonan_mak_id": 1,
        "jenis_id": 1,
        "metode_id": 1,
        "nominal": 45000000,
        "level_id": 1
      }
    ]
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Paket pengadaan berhasil disimpan sebagai draft."
  }
  ```
- **Error Response (422):** Validasi paket pengadaan kosong atau nominal kurang dari 1.

#### 4. Hapus Draft Pengadaan
- **Method & URL:** `DELETE /api/v1/ppbj/pengadaan/{id}`
- **Success Response (204 No Content)**

#### 5. Submit Seluruh Paket ke Reviewer
- **Method & URL:** `POST /api/v1/ppbj/permohonan/{id}/pengadaan/submit`
- **Success Response (200 OK):**
  ```json
  {
    "message": "Seluruh paket pengadaan berhasil dikirim ke reviewer dan permohonan telah dikunci."
  }
  ```

---

### 3.7 Modul PP (Pejabat Pengadaan) (`role:PP`)

Prefix Rute: `/api/v1/pp`

#### 1. Dashboard & List Pengajuan
- **Dashboard:** `GET /api/v1/pp/dashboard`
- **List Pengajuan:** `GET /api/v1/pp/pengajuan?q={keyword}&statuses[]={status}`
- **Detail Pengadaan:** `GET /api/v1/pp/pengajuan/{pengadaanId}`
- **Review Form:** `GET /api/v1/pp/pengajuan/{pengadaanId}/review`

#### 2. Persetujuan (Approve) Pengadaan oleh PP
- **Method & URL:** `POST /api/v1/pp/pengajuan/{pengadaanId}/approve`
- **Success Response (200 OK):**
  ```json
  {
    "message": "Dokumen pengadaan berhasil disetujui dan diteruskan ke PPK."
  }
  ```

#### 3. Penolakan / Revisi (Reject) Pengadaan oleh PP
- **Method & URL:** `POST /api/v1/pp/pengajuan/{pengadaanId}/reject`
- **Request Body (JSON):**
  ```json
  {
    "alasan": "Metode pengadaan harus menggunakan E-Katalog bukan Pengadaan Langsung."
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Dokumen pengadaan berhasil ditolak dan dikembalikan ke PPBJ untuk direvisi."
  }
  ```
- **Error Response (422):** `{ "errors": { "alasan": ["Alasan penolakan minimal 5 karakter."] } }`

---

### 3.8 Modul PPK (Pejabat Pembuat Komitmen) (`role:PPK`)

Prefix Rute: `/api/v1/ppk`

#### 1. Dashboard, List & Review Pengadaan
- **Dashboard:** `GET /api/v1/ppk/dashboard`
- **List Pengajuan:** `GET /api/v1/ppk/pengajuan?q={keyword}&statuses[]={status}`
- **Review Form:** `GET /api/v1/ppk/pengajuan/{pengadaanId}/review`

#### 2. Approve & Reject Dokumen Pengadaan
- **Approve:** `POST /api/v1/ppk/pengajuan/{pengadaanId}/approve`
  - Response (200 OK): `{ "message": "Dokumen pengadaan berhasil disetujui oleh PPK." }`
- **Reject:** `POST /api/v1/ppk/pengajuan/{pengadaanId}/reject`
  - Body: `{ "alasan": "Spesifikasi perlu verifikasi teknis ulang." }`
  - Response (200 OK): `{ "message": "Dokumen pengadaan ditolak dan dikembalikan ke PPBJ." }`

#### 3. Review & Persetujuan Dokumen Pembayaran
- **Detail Form Pembayaran:** `GET /api/v1/ppk/pengajuan/{pengadaanId}/pembayaran`
- **Approve Pembayaran:** `POST /api/v1/ppk/pengajuan/{pengadaanId}/pembayaran/approve`
  - Body (JSON):
    ```json
    {
      "filename": "Memo_Persetujuan_042_TI_PNJ_2026.pdf",
      "catatan": "Disetujui untuk termin pertama 100% barang diterima."
    }
    ```
  - Response (200 OK): `{ "message": "Dokumen pembayaran beserta Memo Persetujuan berhasil disetujui." }`
- **Reject Pembayaran:** `POST /api/v1/ppk/pengajuan/{pengadaanId}/pembayaran/reject`
  - Body: `{ "alasan": "Faktur pajak belum valid." }`
  - Response (200 OK): `{ "message": "Dokumen pembayaran telah ditolak beserta catatan revisi." }`

---

### 3.9 Modul Perlengkapan & Keuangan

- **Dashboard Perlengkapan:** `GET /api/v1/perlengkapan/dashboard` (`role:Perlengkapan`)
- **Dashboard Keuangan:** `GET /api/v1/keuangan/dashboard` (`role:Keuangan`)
  - Success Response: `200 OK`

---

## 4. Panduan Penanganan Error di Frontend (Axios Interceptors)

Untuk menangani skema respons di atas secara seragam di frontend TypeScript, terapkan pattern interceptor berikut pada [frontend/src/services/api.ts](file:///d:/Farrel/PROJECTS/sipbaja/frontend/src/services/api.ts):

```typescript
import axios, { AxiosError } from 'axios';

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          // Token kadaluwarsa atau belum login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Tidak memiliki wewenang role
          console.error('Forbidden:', data.message || 'Akses ditolak.');
          break;

        case 422:
          // Error validasi form - data.errors berisi mapping field -> string[]
          console.warn('Validation Error:', data.errors);
          break;

        case 429:
          // Throttled
          console.warn('Rate Limited:', data.message);
          break;

        case 500:
          console.error('Server Internal Error');
          break;
      }
    }
    return Promise.reject(error);
  }
);
```

