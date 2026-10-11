# Database SIPBAJA

Dokumentasi tabel database Sistem Informasi Pengadaan Barang dan Jasa (SIPBAJA). Database: PostgreSQL 18, 23 tabel dalam 5 kelompok.

**Notasi:** `PK` primary key, `FK → tabel` foreign key, `NOT NULL` wajib diisi, `NULL` boleh kosong, `UNIQUE` tidak boleh duplikat.

## 1. Ringkasan Tabel

| Kelompok | Tabel | Fungsi singkat |
|---|---|---|
| Akses dan organisasi | `roles` | Daftar peran pengguna |
| | `permissions` | Daftar izin akses fitur |
| | `role_permissions` | Penghubung peran dan izin |
| | `units` | Jurusan/Unit/Bidang pemohon |
| | `users` | Akun pengguna |
| Data referensi | `maks` | 4 MAK dan PPK yang bertugas |
| | `jenis_pengadaan` | Jenis pengadaan |
| | `metode_pengadaan` | Metode pengadaan |
| | `level_pengadaan` | Level pengadaan berdasarkan nominal |
| Transaksi inti | `permohonan` | Permohonan pengadaan dari unit |
| | `permohonan_mak` | MAK yang dipilih Perencanaan untuk satu permohonan |
| | `pengadaan` | Hasil pecahan permohonan yang disusun PPBJ |
| | `kontrak` | Kontrak/SPK/Surat Pesanan |
| | `rencana_pembayaran` | Rencana termin yang disepakati saat kontrak terbit |
| | `pembayaran` | Realisasi pembayaran per termin |
| | `reminder` | Pengingat pembayaran per termin |
| | `penerimaan_barang` | Serah-terima barang oleh Perlengkapan |
| Persetujuan | `approval_permohonan` | Keputusan Perencanaan dan Bidang 2 atas permohonan |
| | `approval_pengadaan` | Keputusan PP dan PPK atas dokumen pengadaan |
| | `approval_pembayaran` | Keputusan PPK dan Bidang 2 atas dokumen pembayaran |
| Lintas proses | `dokumen` | Semua file yang diunggah |
| | `status_history` | Riwayat perubahan status |
| | `notifications` | Notifikasi in-app dan email |

## 2. Relasi Antar Tabel

| Relasi | Keterangan |
|---|---|
| `roles` 1 → N `users` | Satu pengguna memiliki satu peran |
| `roles` N ↔ N `permissions` | Lewat `role_permissions` |
| `units` 1 → N `users` | Hanya terisi untuk pengguna Jurusan/Unit/Bidang |
| `units` 1 → N `permohonan` | Unit asal permohonan |
| `users` 1 → N `permohonan` | Pengguna yang mengajukan |
| `users` 1 → N `maks` | PPK yang bertugas pada MAK |
| `permohonan` 1 → N `permohonan_mak` | Satu permohonan bisa memakai beberapa MAK |
| `maks` 1 → N `permohonan_mak` | MAK yang dipilih |
| `permohonan` 1 → N `pengadaan` | Satu permohonan bisa dipecah jadi beberapa pengadaan |
| `permohonan_mak` 1 → N `pengadaan` | Satu MAK bisa membiayai beberapa pengadaan |
| `jenis_pengadaan`, `metode_pengadaan`, `level_pengadaan` 1 → N `pengadaan` | Atribut tiap pengadaan |
| `users` (PPK) 1 → N `pengadaan` | PPK yang ditugaskan |
| `pengadaan` 1 → 0..1 `kontrak` | Kontrak terbit setelah pembelian |
| `kontrak` 1 → N `rencana_pembayaran` | Rencana termin per kontrak |
| `rencana_pembayaran` 1 → 0..1 `pembayaran` | Satu termin direalisasikan satu pembayaran |
| `rencana_pembayaran` 1 → N `reminder` | Pengingat per termin |
| `pengadaan` 1 → 0..1 `penerimaan_barang` | Serah-terima barang |
| `permohonan` 1 → N `approval_permohonan` | Keputusan Perencanaan dan Bidang 2 |
| `pengadaan` 1 → N `approval_pengadaan` | Keputusan PP dan PPK |
| `pembayaran` 1 → N `approval_pembayaran` | Keputusan PPK dan Bidang 2 |
| `users` 1 → N ketiga tabel approval | Pengguna yang memutuskan (`actor_id`) |
| `approval_permohonan`, `approval_pembayaran` N → 0..1 `dokumen` | Memo persetujuan (`memo_dokumen_id`) |
| `approval_pengadaan` N → 0..1 `dokumen` | Bukti tanda tangan PPK (`bukti_tanda_tangan_id`) |
| `dokumen`, `status_history`, `notifications` → objek lain | Polymorphic lewat `ref_type` dan `ref_id` (lihat bagian 7) |

## 3. Akses dan Organisasi

### `roles`
Wadah peran (Jurusan/Unit/Bidang, Perencanaan, Bidang 2, PPBJ, PP, PPK, Perlengkapan, Keuangan, Admin) agar bisa dikelola tanpa mengubah kode.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik peran |
| nama | string | UNIQUE | Nama peran, dipakai untuk menentukan dashboard dan akses |

### `permissions`
Daftar izin akses per fitur sebagai dasar RBAC.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik izin |
| kode | string | UNIQUE | Kode izin, mis. `pengadaan.create`, `pembayaran.approve` |

### `role_permissions`
Menghubungkan peran dengan izin yang dimilikinya.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| role_id | bigint | PK, FK → roles | Peran yang diberi izin |
| permission_id | bigint | PK, FK → permissions | Izin yang diberikan |

Primary key gabungan `(role_id, permission_id)` mencegah baris ganda.

### `units`
Data Jurusan/Unit/Bidang agar filter dan rekap per unit konsisten, tidak bergantung pada teks bebas.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik unit |
| nama | string | NOT NULL | Nama jurusan/unit/bidang |

### `users`
Akun pengguna untuk login dan penanda aktor di seluruh proses.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik pengguna |
| role_id | bigint | FK → roles, NOT NULL | Peran pengguna |
| unit_id | bigint | FK → units, NULL | Unit pengguna, hanya terisi untuk pemohon |
| nama | string | NOT NULL | Nama pengguna |
| email | string | UNIQUE, NOT NULL | Kredensial login |
| password | string | NOT NULL | Hash bcrypt, tidak pernah disimpan sebagai teks asli |
| deleted_at | timestamp | NULL | Soft delete, agar riwayat approval dan unggahan tetap utuh saat akun dihapus |

## 4. Data Referensi

### `maks`
Empat MAK (BLU Fisik, BLU Non-Fisik, RM Fisik, RM Non-Fisik). Setiap MAK punya satu PPK yang bertugas.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik MAK |
| nama | string | UNIQUE, NOT NULL | Nama MAK |
| ppk_user_id | bigint | FK → users, NOT NULL | PPK yang bertugas untuk MAK ini, dasar penugasan PPK pada pengadaan |

### `jenis_pengadaan`

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik jenis |
| nama | string | UNIQUE, NOT NULL | Nama jenis (Barang, Jasa, Konstruksi) |

### `metode_pengadaan`

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik metode |
| nama | string | UNIQUE, NOT NULL | Nama metode (Inaproc, SPSE, Tender, Non-Tender) |

### `level_pengadaan`
Menyimpan batas nominal agar aturan level tidak ditulis mati di kode.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik level |
| nama | string | NOT NULL | Label level, mis. "<50jt", "50-200jt", ">200jt" |
| min_nominal | decimal | NOT NULL | Batas bawah nominal |
| max_nominal | decimal | NULL | Batas atas nominal, kosong untuk level tertinggi |
| perlu_review_pp | boolean | NOT NULL | PP wajib ikut mereview pada level ini. PPK selalu wajib mereview di semua level |

## 5. Transaksi Inti

### `permohonan`
Pengajuan awal dari Jurusan/Unit/Bidang. Dipisah dari `pengadaan` karena satu permohonan bisa menghasilkan beberapa pengadaan dengan progres berbeda.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik permohonan |
| unit_id | bigint | FK → units, NOT NULL | Unit asal pemohon, dasar visibilitas progres per unit |
| created_by | bigint | FK → users, NOT NULL | Pengguna yang mengajukan |
| nomor_surat | string | NOT NULL | Nomor surat dari Srikandi |
| judul | string | NOT NULL | Judul pengadaan |
| ringkasan_tujuan | text | NOT NULL | Ringkasan tujuan pengadaan |
| estimasi_anggaran | decimal | NOT NULL | Estimasi anggaran awal dari pemohon |
| revisi_ke | int | NOT NULL, DEFAULT 0 | Nomor revisi aktif. 0 = pengajuan awal. Naik 1 setiap ada penolakan |
| status | string | NOT NULL | Status permohonan, mis. diajukan, menunggu_bidang2, disetujui, ditolak |
| created_at | timestamp | NOT NULL | Waktu pengajuan, dasar filter bulan dan tahun |

### `permohonan_mak`
MAK yang ditentukan Perencanaan untuk satu permohonan. Satu permohonan bisa memakai beberapa MAK. Perencanaan tidak mengisi nominal per MAK.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik pilihan MAK |
| permohonan_id | bigint | FK → permohonan, NOT NULL | Permohonan yang memakai MAK ini |
| mak_id | bigint | FK → maks, NOT NULL | MAK yang dipilih |
| ditentukan_oleh | bigint | FK → users, NOT NULL | Pengguna Perencanaan yang menentukan |
| created_at | timestamp | NOT NULL | Waktu ditentukan |

Constraint tambahan:
- `UNIQUE (permohonan_id, mak_id)`: MAK yang sama tidak dipilih dua kali pada satu permohonan.
- `UNIQUE (permohonan_id, id)`: sasaran foreign key gabungan dari `pengadaan`.

Satu baris `permohonan_mak` boleh tidak dipakai pengadaan manapun.

### `pengadaan`
Hasil pecahan permohonan yang disusun PPBJ. Satu pengadaan dibiayai tepat satu MAK, dan satu MAK bisa membiayai beberapa pengadaan dari permohonan yang sama.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik pengadaan |
| permohonan_id | bigint | FK → permohonan, NOT NULL | Permohonan asal pengadaan |
| permohonan_mak_id | bigint | FK → permohonan_mak, NOT NULL | Satu-satunya MAK yang membiayai pengadaan ini. MAK ditarik lewat kolom ini |
| jenis_id | bigint | FK → jenis_pengadaan, NOT NULL | Jenis pengadaan |
| metode_id | bigint | FK → metode_pengadaan, NULL | Metode pengadaan, diisi belakangan oleh PPBJ |
| level_id | bigint | FK → level_pengadaan, NOT NULL | Level berdasarkan nominal, menentukan reviewer |
| ppk_id | bigint | FK → users, NULL | PPK yang ditugaskan, mengikuti MAK |
| nominal | decimal | NOT NULL | Nilai pengadaan ini |
| revisi_ke | int | NOT NULL, DEFAULT 0 | Nomor revisi aktif. 0 = susunan awal. Naik 1 setiap ada penolakan |
| status | string | NOT NULL | Status progres pengadaan (daftar nilai ditetapkan saat implementasi) |
| created_at | timestamp | NOT NULL | Waktu dibuat |

Constraint tambahan: foreign key gabungan `(permohonan_id, permohonan_mak_id)` → `permohonan_mak(permohonan_id, id)`, sehingga pengadaan tidak bisa memakai MAK dari permohonan lain.

### `kontrak`
Kontrak/SPK/Surat Pesanan yang diterbitkan PPBJ setelah pembelian.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik kontrak |
| pengadaan_id | bigint | FK → pengadaan, UNIQUE, NOT NULL | Pengadaan yang dikontrakkan |
| tipe | string | NOT NULL | Kontrak, SPK, atau Surat Pesanan |
| nomor | string | NOT NULL | Nomor kontrak |
| tanggal | date | NOT NULL | Tanggal terbit |

### `rencana_pembayaran`
Rencana termin yang disepakati sejak kontrak diterbitkan. Dipisah dari `pembayaran` karena rencana dibuat sekali di awal, sedangkan realisasi terjadi bertahap.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik rencana termin |
| kontrak_id | bigint | FK → kontrak, NOT NULL | Kontrak pemilik rencana |
| termin_ke | int | NOT NULL | Urutan termin |
| nominal_rencana | decimal | NOT NULL | Nominal yang disepakati untuk termin ini |
| tanggal_jatuh_tempo | date | NULL | Target tanggal pembayaran termin |
| status | string | NOT NULL | `menunggu` atau `lunas`, disimpan eksplisit untuk kebutuhan audit |
| created_at | timestamp | NOT NULL | Waktu rencana dibuat |

Constraint tambahan (usulan): `UNIQUE (kontrak_id, termin_ke)`.

### `pembayaran`
Realisasi pembayaran per termin. Terhubung ke kontrak hanya lewat `rencana_pembayaran`, tanpa `kontrak_id` atau `termin_ke` sendiri.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik pembayaran |
| rencana_pembayaran_id | bigint | FK → rencana_pembayaran, UNIQUE, NOT NULL | Termin yang direalisasikan, relasi 1 banding 1 |
| nominal | decimal | NOT NULL | Nominal yang dibayarkan, wajib sama persis dengan `nominal_rencana` |
| revisi_ke | int | NOT NULL, DEFAULT 0 | Nomor revisi aktif. 0 = pengajuan awal. Naik 1 setiap ada penolakan |
| status | string | NOT NULL | menunggu_ppk, menunggu_bidang2, disetujui, ditolak, dibayar |

### `reminder`
Pengingat pembayaran yang ditentukan PPBJ, ditautkan per termin.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik pengingat |
| rencana_pembayaran_id | bigint | FK → rencana_pembayaran, NOT NULL | Termin yang diingatkan |
| tanggal_reminder | date | NOT NULL | Tanggal pengingat muncul, bisa berbeda dari tanggal jatuh tempo |
| jenis | string | NOT NULL | Jenis pengingat, mis. pembayaran |
| dibuat_oleh | bigint | FK → users, NOT NULL | PPBJ yang menentukan |

### `penerimaan_barang`
Catatan serah-terima barang oleh Perlengkapan. Foto dan berita acara disimpan di `dokumen`.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik penerimaan |
| pengadaan_id | bigint | FK → pengadaan, UNIQUE, NOT NULL | Pengadaan yang diterima barangnya |
| tanggal_terima | date | NOT NULL | Tanggal barang diterima |
| diterima_oleh | bigint | FK → users, NOT NULL | Pengguna Perlengkapan yang menandatangani |

## 6. Persetujuan (Approval)

Setiap proses yang butuh persetujuan punya tabel sendiri, sehingga foreign key menjaga integritas data dan aturan tiap proses (berurutan, paralel, atau bergantung level) bisa disesuaikan. Pada ketiganya, `alasan` wajib diisi saat `keputusan = ditolak` (divalidasi di aplikasi). Setiap keputusan membawa `revisi_ke` yang sama dengan `revisi_ke` induk saat keputusan dibuat. Hanya keputusan dengan `revisi_ke` sama dengan induk yang sah; baris lama murni riwayat. Pasang `UNIQUE (id_objek, tahap, revisi_ke)` dan index pada kolom id objeknya.

### `approval_permohonan`
Keputusan atas permohonan: Perencanaan (ketersediaan anggaran dan penentuan MAK), lalu Bidang 2 (persetujuan awal).

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik keputusan |
| permohonan_id | bigint | FK → permohonan, NOT NULL | Permohonan yang diputuskan |
| tahap | string | NOT NULL | `PERENCANAAN` atau `BIDANG2` |
| revisi_ke | int | NOT NULL | Salinan `permohonan.revisi_ke` saat diputuskan. Hanya baris dengan nilai sama dengan induk yang sah |
| keputusan | string | NOT NULL | `disetujui` atau `ditolak` |
| alasan | text | NULL | Alasan penolakan |
| memo_dokumen_id | bigint | FK → dokumen, NULL | Memo persetujuan, diisi Bidang 2 saat menyetujui |
| actor_id | bigint | FK → users, NOT NULL | Pengguna yang memutuskan |
| created_at | timestamp | NOT NULL | Waktu keputusan |

Constraint tambahan: `UNIQUE (permohonan_id, tahap, revisi_ke)`.

### `approval_pengadaan`
Keputusan review dokumen pengadaan. PPK wajib di semua level, PP ikut pada level yang `perlu_review_pp` bernilai true.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik keputusan |
| pengadaan_id | bigint | FK → pengadaan, NOT NULL | Pengadaan yang direview |
| tahap | string | NOT NULL | `PP` atau `PPK` |
| revisi_ke | int | NOT NULL | Salinan `pengadaan.revisi_ke` saat direview. Hanya baris dengan nilai sama dengan induk yang sah |
| keputusan | string | NOT NULL | `disetujui` atau `ditolak` |
| alasan | text | NULL | Alasan penolakan |
| bukti_tanda_tangan_id | bigint | FK → dokumen, NULL | Bukti tanda tangan, diisi PPK saat menyetujui |
| actor_id | bigint | FK → users, NOT NULL | Pengguna yang memutuskan |
| created_at | timestamp | NOT NULL | Waktu keputusan |

Constraint tambahan: `UNIQUE (pengadaan_id, tahap, revisi_ke)`.

### `approval_pembayaran`
Keputusan atas dokumen pembayaran. PPK dan Bidang 2 sama-sama wajib menyetujui sebelum Keuangan dapat memproses.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik keputusan |
| pembayaran_id | bigint | FK → pembayaran, NOT NULL | Pembayaran yang diputuskan |
| tahap | string | NOT NULL | `PPK` atau `BIDANG2` |
| revisi_ke | int | NOT NULL | Salinan `pembayaran.revisi_ke` saat diputuskan. Hanya baris dengan nilai sama dengan induk yang sah |
| keputusan | string | NOT NULL | `disetujui` atau `ditolak` |
| alasan | text | NULL | Alasan penolakan |
| memo_dokumen_id | bigint | FK → dokumen, NULL | Memo persetujuan pembayaran, diisi saat menyetujui |
| actor_id | bigint | FK → users, NOT NULL | Pengguna yang memutuskan |
| created_at | timestamp | NOT NULL | Waktu keputusan |

Constraint tambahan: `UNIQUE (pembayaran_id, tahap, revisi_ke)`.

## 7. Lintas Proses (Polymorphic)

Tiga tabel ini memakai pasangan kolom `ref_type` (nama objek) dan `ref_id` (id objek) agar satu tabel bisa melekat ke banyak jenis objek. Database tidak bisa memasang foreign key untuk pasangan ini, jadi integritasnya dijaga aplikasi. Pasang index gabungan `(ref_type, ref_id)` di setiap tabel ini.

### `dokumen`
Semua file yang diunggah, termasuk memo persetujuan.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik dokumen |
| ref_type | string | NOT NULL | Objek pemilik: permohonan, pengadaan, kontrak, pembayaran, penerimaan_barang |
| ref_id | bigint | NOT NULL | Id objek di tabel sesuai `ref_type` |
| tipe_dokumen | string | NOT NULL | Jenis dokumen, mis. RKAKL, surat_permohonan, dokumen_pengadaan, foto_barang, berita_acara, bukti_bayar, legalitas_vendor, memo_persetujuan, bukti_tanda_tangan |
| versi | int | NOT NULL | Naik setiap unggah ulang, versi lama tidak dihapus |
| nama_asli | string | NOT NULL | Nama file asli dari pengguna |
| nama_hash | string | NOT NULL | Nama file hasil hash yang dipakai di server |
| mime_type | string | NOT NULL | Tipe file sebenarnya, divalidasi saat unggah |
| ukuran_bytes | bigint | NOT NULL | Ukuran file, maksimal 10 MB |
| uploaded_by | bigint | FK → users, NOT NULL | Pengguna yang mengunggah |
| created_at | timestamp | NOT NULL | Waktu unggah |

Memo persetujuan dimiliki permohonan atau pembayaran, dan bukti tanda tangan PPK dimiliki pengadaan. Keduanya dihubungkan ke keputusan terkait lewat foreign key di tabel approval, sehingga terikat ke siapa yang menyetujui dan kapan.

### `status_history`
Riwayat perubahan status beserta aktor dan waktunya, dasar tracking progres dan pemicu notifikasi.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik riwayat |
| ref_type | string | NOT NULL | permohonan, pengadaan, atau pembayaran |
| ref_id | bigint | NOT NULL | Id objek yang statusnya berubah |
| status_lama | string | NULL | Status sebelum berubah, kosong pada status pertama |
| status_baru | string | NOT NULL | Status sesudah berubah |
| actor_id | bigint | FK → users, NOT NULL | Pengguna yang memicu perubahan |
| created_at | timestamp | NOT NULL | Waktu perubahan, dasar urutan tracking |

### `notifications`
Notifikasi in-app dan email, satu baris per saluran per penerima.

| Kolom | Tipe | Constraint | Fungsi |
|---|---|---|---|
| id | bigint | PK | Identitas unik notifikasi |
| user_id | bigint | FK → users, NOT NULL | Penerima |
| channel | string | NOT NULL | `in_app` atau `email` |
| judul | string | NOT NULL | Judul notifikasi |
| pesan | text | NOT NULL | Isi notifikasi |
| ref_type | string | NULL | Objek terkait, untuk tautan langsung |
| ref_id | bigint | NULL | Id objek terkait |
| read_at | timestamp | NULL | Kosong berarti belum dibaca |
| created_at | timestamp | NOT NULL | Waktu dibuat |

## 8. Aturan yang Dijaga di Aplikasi

Aturan berikut tidak bisa ditegakkan oleh constraint database sehingga harus divalidasi di Laravel:

- Alasan wajib diisi pada tabel approval mana pun saat `keputusan = ditolak`.
- Setiap penolakan menaikkan `revisi_ke` induk sebesar 1. Keputusan baru wajib membawa `revisi_ke` baru. Kelulusan dihitung hanya dari baris approval dengan `revisi_ke` sama dengan induk.
- Pembayaran hanya muncul bagi Keuangan jika `approval_pembayaran` memiliki keputusan `disetujui` untuk tahap `PPK` dan `BIDANG2` pada pembayaran dan `revisi_ke` yang sama.
- Pengadaan hanya lanjut ke pembelian jika `approval_pengadaan` berisi keputusan `disetujui` dari PPK (dengan `bukti_tanda_tangan_id` terisi) pada `revisi_ke` aktif di semua level, dan dari PP bila `level_pengadaan.perlu_review_pp` bernilai true. Urutan PP dan PPK tidak dikunci database.
- Memo persetujuan wajib terunggah (`memo_dokumen_id` terisi) saat Bidang 2 menyetujui permohonan dan saat PPK atau Bidang 2 menyetujui pembayaran.
- `pembayaran.nominal` harus sama persis dengan `rencana_pembayaran.nominal_rencana`.
- `pengadaan.permohonan_mak_id` hanya boleh diubah selama dokumen pengadaan belum dikirim ke penanggung jawab. `ppk_id` mengikuti MAK yang dipilih.
- `rencana_pembayaran.status` berubah menjadi `lunas` saat pembayaran terkait tercatat (lewat Observer).
- Visibilitas progres permohonan dibatasi per `unit_id` (lewat Policy).
- Setiap baris baru di `status_history` memicu pembuatan `notifications` ke pemohon (lewat Observer).

## 9. Catatan Terbuka

- **Penanda revisi selesai.** Kolom `revisi_ke` di `permohonan`, `pengadaan`, `pembayaran` dan tiga tabel approval menutup masalah putaran revisi.
