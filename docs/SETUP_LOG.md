# Log Pekerjaan Setup SIPBAJA

Tanggal: 11 Oktober 2026. Sesi ini menjalankan plan setup project tanpa meminta approval install library (disetujui user untuk sesi ini).

## 1. Environment

- CLI default memakai PHP 8.3.30, sedangkan vendor mensyaratkan minimal PHP 8.4.1 dan aturan meminta PHP 8.5.11. Dampak: `php artisan` fatal di PHP default.
- Solusi: seluruh perintah Composer dan Artisan dijalankan dengan PHP 8.5.11 milik Laragon (`D:/laragon/bin/php/php-8.5.11-Win32-vs17-x64/php.exe`). PHP ini sudah memuat ext `pdo_sqlite`, `sqlite3`, dan `pgsql`.
- Hasil: Laravel Framework 13.34.0 berjalan normal.

## 2. Konfigurasi `.env`

- `APP_NAME`: `Laravel` menjadi `SIPBAJA`.
- `SESSION_LIFETIME`: `120` menjadi `60`, sesuai PRD (sesi berakhir otomatis setelah 60 menit tanpa aktivitas).
- `DB_CONNECTION` tetap `sqlite` (dev). File `database/database.sqlite` sudah ada.

## 3. Library

- `livewire/livewire` versi `^4.4` diinstall via Composer (sebelumnya hilang, padahal wajib oleh tech stack). Tambahan otomatis: tidak ada selain dependensi Livewire sendiri.
- `laravel/boost` BELUM diinstall. `AGENTS.md` mewajibkannya sebelum ubah kode aplikasi, tetapi aturan `DEVELOPMENT_RULES.md` melarang tambah paket tanpa approval. Menunggu putusan user karena konflik aturan.

## 4. Dokumen desain

- `docs/DATABASE_SIPBAJA.md`: skema `revisi_ke` diterapkan ulang (file sempat kembali ke versi tanpa `revisi_ke`). Kolom `revisi_ke` ada di `permohonan`, `pengadaan`, `pembayaran`, dan tiga tabel approval, plus UNIQUE objek+tahap+`revisi_ke` dan aturan kelulusan per `revisi_ke` aktif. Kolom `unit_id` di `permohonan` sudah ada di file, tidak jadi masalah.
- `docs/DEVELOPMENT_RULES.md`: tambah aturan Form Request. Setiap data masuk wajib kelas Request di `app/Http/Requests/`, nama PascalCase akhiran `Request`. Controller dan Livewire hanya memanggil validasi lalu mengirim `validated()` ke Service. `authorize()` menegakkan Policy/Gate per peran. `rules()` dan `messages()` Bahasa Indonesia.

## 5. Migrasi (23 file baru, sesuai desain database)

| File | Tabel |
|---|---|
| `2026_10_11_000001` | `roles` |
| `2026_10_11_000002` | `units` |
| `2026_10_11_000003` | `permissions` |
| `2026_10_11_000004` | alter `users` (rename `name` ke `nama`, tambah `role_id`, `unit_id`, `deleted_at`, hapus `remember_token` dan `email_verified_at`) |
| `2026_10_11_000005` | `role_permissions` (PK gabungan) |
| `2026_10_11_000006` | `maks` |
| `2026_10_11_000007` | `jenis_pengadaan` |
| `2026_10_11_000008` | `metode_pengadaan` |
| `2026_10_11_000009` | `level_pengadaan` |
| `2026_10_11_000010` | `permohonan` (termasuk `unit_id` dan `revisi_ke`) |
| `2026_10_11_000011` | `permohonan_mak` (UNIQUE ganda) |
| `2026_10_11_000012` | `pengadaan` (FK gabungan ke `permohonan_mak`, termasuk `revisi_ke`) |
| `2026_10_11_000013` | `kontrak` |
| `2026_10_11_000014` | `rencana_pembayaran` (UNIQUE kontrak+termin) |
| `2026_10_11_000015` | `pembayaran` (termasuk `revisi_ke`) |
| `2026_10_11_000016` | `reminder` |
| `2026_10_11_000017` | `penerimaan_barang` |
| `2026_10_11_000018` | `dokumen` (index `ref_type`+`ref_id`) |
| `2026_10_11_000019` | `approval_permohonan` (UNIQUE + `revisi_ke`) |
| `2026_10_11_000020` | `approval_pengadaan` (UNIQUE + `revisi_ke`) |
| `2026_10_11_000021` | `approval_pembayaran` (UNIQUE + `revisi_ke`) |
| `2026_10_11_000022` | `status_history` (index `ref_type`+`ref_id`) |
| `2026_10_11_000023` | `notifications` (index `ref_type`+`ref_id`) |

Hasil `php artisan migrate`: 23 migrasi DONE di SQLite dev. Tidak ada error.

## 6. Verifikasi

- Struktur kolom dicek via `Schema::getColumnListing`: `users` (`id,nama,email,password,created_at,updated_at,role_id,unit_id,deleted_at`), `permohonan` dan `pengadaan` sesuai desain termasuk `unit_id` dan `revisi_ke`.
- `php artisan test`: 2 test lolos.
- `pint --test`: lolos.
- `npm install` + `npm run build`: sukses. Build Vite selesai 1.92 detik, manifest dan aset tertulis di `public/build/`.

## 7. Asumsi yang diambil

- `decimal` tanpa presisi di desain dipetakan ke `decimal(19, 2)` di semua kolom uang.
- `created_at` tanpa `updated_at` di desain dipetakan ke satu kolom `timestamp created_at` dengan nilai default saat ini. Pengecualian: tabel `users` bawaan Laravel tetap memakai `created_at`+`updated_at` agar tidak merusak migrasi lama.
- Status string bebas tanpa enum atau CHECK, sesuai desain (daftar nilai ditetapkan saat implementasi).
- `cascadeOnDelete` dipakai pada FK anak-ke-induk transaksi (mis. `permohonan_mak`, `pengadaan` via kontrak), `nullOnDelete` pada FK opsional (`metode_id`, `ppk_id`, memo, bukti). Desain tidak mengatur perilaku hapus, jadi ini asumsi wajar.
- Skill `superpowers` tidak tersedia di environment ini, setup dijalankan manual mengikuti plan yang sudah dibahas.
- Aturan approval install library sesi ini dianggap mencakup Livewire (wajib stack). Boost dikecualikan karena konflik aturan tertulis.

## 8. Belum dikerjakan (tugas berikut)

- Seeder: roles, 4 MAK + akun PPK, jenis, metode, 3 level.
- Service, Policy, Observer, Request class, dan komponen Livewire per domain.
- Uji migrasi di PostgreSQL 18 (aturan: tanpa fitur khusus Postgres; migrasi ini hanya memakai tipe standar).

## 9. Lanjutan: Boost + Model (sesi sama)

- `laravel/boost` versi `^2.10` diinstall sebagai dev dependency. `php artisan boost:install` sukses. Aturan Boost aktif di `AGENTS.md`.
- 22 model di `app/Models/`: `Role`, `Permission`, `Unit`, `User` (ditulis ulang ikut desain + `SoftDeletes`), `Mak`, `JenisPengadaan`, `MetodePengadaan`, `LevelPengadaan`, `Permohonan`, `PermohonanMak`, `Pengadaan`, `Kontrak`, `RencanaPembayaran`, `Pembayaran`, `Reminder`, `PenerimaanBarang`, `Dokumen`, `ApprovalPermohonan`, `ApprovalPengadaan`, `ApprovalPembayaran`, `StatusHistory`, `Notification`. Isi hanya fillable, casts, dan relasi. Tanpa logika bisnis, sesuai aturan Service Layer.
- `UserFactory` diselaraskan (`nama`, `role_id` via factory, tanpa kolom yang sudah dihapus). `RoleFactory` baru dibuat.
- `pint --dirty`: 3 file dirapikan otomatis. `php artisan test`: 2 test lolos.

## 10. Seeder role

- `RoleSeeder` baru: 9 peran via `firstOrCreate` (idempoten). Terdaftar di `DatabaseSeeder`.
- `DatabaseSeeder` diperbaiki ikut skema baru: user uji pakai `nama` dan `role_id` Admin. Kolom lama (`name`, `email_verified_at`, `remember_token`) dibuang.
- Hasil: 9 role + 1 user uji di SQLite dev. `pint --dirty` rapikan 1 file. Test 2/2 lolos.
- Catatan: `db:seed` ulang gagal pada user uji karena email unik. Sama seperti bawaan Laravel. Reset via `migrate:fresh --seed` bila perlu.
