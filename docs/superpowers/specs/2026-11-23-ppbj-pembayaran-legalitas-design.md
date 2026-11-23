# Design Spec: Alur Pembayaran Tagihan & Legalitas Vendor PPBJ (FR-40 s.d. FR-45)

**Tanggal:** 2026-11-23  
**Status:** Validated & Approved  
**Lingkup:** PPBJ Pengadaan Detail (`/ppbj/pengadaan/:id`), Backend RESTful API, State Guards, Dual Approval Integration

---

## 1. Latar Belakang & Tujuan
Setelah bagian Perlengkapan menerima barang dan menandatangani dokumen tanda terima fisik (BAST serta foto barang), bagian PPBJ memerlukan alur sistem untuk:
1. Menjadikan bukti penerimaan barang Perlengkapan sebagai rujukan pembuatan dokumen tagihan (**FR-40**).
2. Mengunggah draf tagihan/pembayaran yang merouting otomatis status ke dashboard PPK dan Bidang 2 untuk *dual approval* (**FR-41**).
3. Mengunggah ulang draf tagihan bila ada catatan revisi, asalkan belum mendapat persetujuan final (memo) (**FR-42**).
4. Mengunggah dokumen legalitas rekanan vendor, dengan syarat sistem mendeteksi kelengkapan memo persetujuan pembayaran dari PPK dan Bidang 2 (**FR-43**).
5. Menampilkan pratinjau dokumen legalitas vendor yang telah diunggah (**FR-44**).
6. Mengunggah ulang dokumen legalitas vendor selama bagian Keuangan belum memproses / mengunggah bukti pencairan dana (**FR-45**).

---

## 2. Arsitektur Data & State Machine

### 2.1 Hubungan Relasi Entitas
- `Pengadaan` hasOne `PenerimaanBarang` hasMany `Dokumen` (`ref_type: 'penerimaan_barang'`).
- `Pengadaan` hasOne `Kontrak` hasMany `RencanaPembayaran` hasOne `Pembayaran`.
- `Pembayaran` hasMany `Dokumen`:
  - `tipe_dokumen: 'dokumen_tagihan'` (bundel berkas invoice/tagihan PPBJ).
  - `tipe_dokumen: 'dokumen_legalitas_vendor'` (bundel berkas legalitas vendor).
- `Pembayaran` hasMany `ApprovalPembayaran`:
  - Record tahap `PPK` (`keputusan: 'disetujui' | 'ditolak'`, `memo_dokumen_id`).
  - Record tahap `BIDANG2` (`keputusan: 'disetujui' | 'ditolak'`, `memo_dokumen_id`).

### 2.2 Aturan Transisi Status (State Machine Guards)
1. **Penerimaan Barang**:
   - Jika `PenerimaanBarang` belum selesai, bagian pembayaran menampilkan informasi bahwa barang belum dicatat oleh Perlengkapan.
2. **Unggah Tagihan (FR-41)**:
   - Request: Berkas PDF (maks 10MB) + nominal tagihan (opsional, default ke nominal kontrak).
   - Mengubah status `Pembayaran` ke `menunggu_persetujuan`.
   - Mengubah status `Pengadaan` ke `pembayaran`.
3. **Re-upload Tagihan (FR-42)**:
   - Diizinkan hanya jika status `Pembayaran` adalah `menunggu_persetujuan` atau `perlu_revisi`, DAN belum ada persetujuan final (yaitu belum kedua memo disetujui).
   - Jika kedua memo sudah terbit (`disetujui`), re-upload tagihan diblokir (422 Unprocessable Content).
4. **Unggah Legalitas Vendor (FR-43, FR-44)**:
   - Guard: Wajib memverifikasi bahwa `ApprovalPembayaran` untuk `PPK` dan `BIDANG2` keduanya `disetujui` dan masing-masing memiliki memo.
   - Jika memo belum lengkap, endpoint mengembalikan error HTTP 403 / 422: *"Dokumen memo persetujuan dari PPK dan Bidang 2 belum lengkap"*.
   - Dokumen tersimpan dan dapat dipratinjau melalui endpoint preview dokumen standar.
5. **Re-upload Legalitas Vendor (FR-45)**:
   - Diizinkan selama Keuangan belum mengunggah bukti pencairan / pembayaran belum selesai (`pembayaran.status !== 'selesai'`).
   - Jika pembayaran sudah `selesai`, upload legalitas vendor dikunci permanen.

---

## 3. Spesifikasi Backend API

### 3.1 Endpoint Baru / Diperbarui
1. **`GET /api/v1/ppbj/pengadaan/{id}/pembayaran-context`**
   - Mengembalikan data kontekstual:
     - `penerimaan_barang`: detail tanda terima, tanggal terima, dokumen BAST, dan foto fisik dokumentasi barang (FR-40).
     - `pembayaran`: data record pembayaran, nominal, status (`menunggu_persetujuan`, `perlu_revisi`, `disetujui`, `siap_bayar`, `selesai`).
     - `dokumen_tagihan`: detail file tagihan aktif.
     - `approvals`: status persetujuan PPK dan Bidang 2 beserta memo persetujuan jika ada.
     - `can_upload_tagihan`: boolean (true jika belum disetujui final).
     - `can_upload_legalitas`: boolean (true jika dual approval memo lengkap dan keuangan belum selesai).
     - `dokumen_legalitas`: detail file legalitas vendor aktif.
     - `is_locked`: boolean (true jika sudah selesai di bagian Keuangan).

2. **`POST /api/v1/ppbj/pengadaan/{id}/dokumen-tagihan`**
   - Payload: `multipart/form-data`:
     - `dokumen_tagihan`: file PDF (mimes:pdf, max:10240)
     - `nominal`: numeric (opsional)
     - `catatan`: string (opsional)
   - Behavior:
     - Memeriksa guard `can_upload_tagihan`.
     - Menyimpan file ke storage `dokumen/pembayaran/tagihan/`.
     - Membuat / memperbarui record `Pembayaran` dan `Dokumen`.
     - Mencatat history log.

3. **`POST /api/v1/ppbj/pengadaan/{id}/legalitas-vendor`**
   - Payload: `multipart/form-data`:
     - `dokumen_legalitas`: file PDF (mimes:pdf, max:10240)
   - Behavior:
     - Memeriksa guard: memo PPK & Bidang 2 harus sudah disetujui, dan status pembayaran belum `selesai`.
     - Menyimpan file ke storage `dokumen/pembayaran/legalitas/`.
     - Membuat / memperbarui record `Dokumen` bertipe `dokumen_legalitas_vendor`.
     - Memperbarui status pembayaran menjadi siap diproses keuangan jika sebelumnya belum.

---

## 4. Spesifikasi Frontend UI/UX (`/ppbj/pengadaan/:id`)

Lokasi: Di dalam halaman detail pengadaan PPBJ `frontend/src/pages/PPBJ/Pengadaan/Show.tsx`.

### 4.1 Komponen Antarmuka:
1. **Section 1: Bukti Penerimaan Barang Perlengkapan (FR-40)**
   - Menampilkan status penerimaan barang oleh bagian Perlengkapan.
   - Kartu pratinjau: File BAST (PDF) dengan tombol pratinjau modal/tab baru.
   - Galeri foto fisik barang yang dapat diklik untuk memperbesar gambar (lightbox/preview).
2. **Section 2: Dokumen Tagihan / Pembayaran (FR-41 & FR-42)**
   - Indikator status tagihan: *Belum Diajukan*, *Menunggu Persetujuan*, *Perlu Revisi*, *Disetujui*.
   - Area Unggah / Drag-and-drop bundel dokumen tagihan (PDF).
   - Tombol Unggah Ulang (Re-upload) jika berstatus `perlu_revisi` atau `menunggu_persetujuan` sebelum memo terbit.
   - Status Dual Approval (badge persetujuan PPK dan Bidang 2).
3. **Section 3: Dokumen Legalitas Rekanan Vendor (FR-43 s.d. FR-45)**
   - Jika dual memo belum lengkap: Menampilkan alert informatif dengan status terkunci: *"Menunggu memo persetujuan dari PPK dan Bidang 2 sebelum legalitas vendor dapat diunggah"*.
   - Jika dual memo sudah lengkap: Area unggah bundel legalitas vendor aktif.
   - Menampilkan tautan/tombol pratinjau berkas legalitas yang telah diunggah (FR-44).
   - Tombol Unggah Ulang (Re-upload) tetap aktif selama Keuangan belum mencairkan dana / belum status `selesai` (FR-45).
   - Banner status apabila berkas sudah diteruskan ke Keuangan dan saat dana berhasil dicairkan.

---

## 5. Rencana Pengujian (Testing Strategy)

1. **Feature Tests Backend (`tests/Feature/PpbjPembayaranApiTest.php`)**:
   - `test_ppbj_can_fetch_pembayaran_context_with_perlengkapan_bast_and_photos` (FR-40).
   - `test_ppbj_can_upload_dokumen_tagihan_and_routes_to_dual_approval` (FR-41).
   - `test_ppbj_can_reupload_tagihan_when_status_needs_revision` (FR-42).
   - `test_ppbj_cannot_reupload_tagihan_after_both_memos_approved` (FR-42 guard).
   - `test_ppbj_cannot_upload_legalitas_vendor_before_memos_complete` (FR-43 guard).
   - `test_ppbj_can_upload_legalitas_vendor_after_both_memos_approved` (FR-43, FR-44).
   - `test_ppbj_can_reupload_legalitas_vendor_before_keuangan_processes` (FR-45).
   - `test_ppbj_cannot_reupload_legalitas_vendor_after_keuangan_completed` (FR-45 lock guard).
2. **Frontend Typecheck & Build**:
   - Validasi TypeScript contract pada `ppbjService.ts` dan antarmuka React.
   - Menjamin tidak ada regression build (`npm run build`).
