# Product Requirements Document: SIPBAJA (Sistem Informasi Pengadaan Barang dan Jasa)

## Product Overview

**Product Vision:** SIPBAJA adalah aplikasi web terpusat yang mendigitalkan seluruh proses pengadaan barang dan jasa kampus, dari pengajuan permohonan, persetujuan bertingkat, pembelian, dan penerimaan barang, sampai pembayaran per termin, sehingga setiap pihak dapat bekerja dan memantau progres di satu tempat.

**Target Users:**
- **Primer:** Jurusan/Unit/Bidang (pemohon), Perencanaan, Bidang 2 (WD2), PPBJ, PP, PPK, Perlengkapan, dan Keuangan sebagai aktor dalam alur pengadaan.
- **Sekunder:** Admin, yang mengelola akun pengguna.

**Business Objectives:**
- Memusatkan data dan dokumen pengadaan dalam satu sistem.
- Memberi pemohon visibilitas progres pengajuan tanpa harus bertanya manual.
- Memastikan aturan persetujuan bertingkat dan persetujuan ganda pembayaran dijalankan konsisten oleh sistem.
- Membatasi akses fitur sesuai peran masing-masing aktor.

**Success Metrics:** (kualitatif, tanpa target angka)
- Pengaju permohonan dapat melacak status permohonan yang sudah dibuat.
- Semua data pengadaan tersimpan secara terpusat.
- Tidak ada pembayaran yang diproses sebelum disetujui PPK dan Bidang 2.
- Tidak ada pembayaran yang terlambat.

## Feature Requirements

**Priority:** 1 = prioritas utama, 2 = prioritas kedua, 3 = prioritas terakhir.

| Feature | Description | User Stories | Priority | Acceptance Criteria | Dependencies |
|---------|-------------|--------------|----------|---------------------|--------------|
| **Autentikasi dan akses berbasis peran** | Login dan pengalihan ke dashboard sesuai peran. Setiap pengguna hanya melihat menu dan fitur sesuai wewenangnya. | Sebagai pengguna, saya ingin masuk dan langsung melihat fitur yang relevan dengan peran saya. | 1 | Kredensial divalidasi. Pengguna diarahkan ke dashboard sesuai peran. Tidak ada akses lintas peran. | Manajemen akun |
| **Manajemen akun** | Admin membuat, melihat, mengubah, dan menghapus akun pengguna. | Sebagai Admin, saya ingin mengelola akun semua pengguna aplikasi. | 1 (buat), 2 (lihat, ubah), 3 (hapus) | Admin dapat membuat akun untuk semua peran. Akun yang tidak terpakai dapat dihapus tanpa merusak riwayat. | - |
| **Pengajuan permohonan pengadaan** | Unit menginput nomor surat, judul, unit asal, ringkasan tujuan, dan estimasi anggaran, serta mengunggah dokumen permohonan. Dokumen dapat diunggah ulang saat revisi. | Sebagai pemohon, saya ingin mengajukan dan merevisi permohonan pengadaan secara online. | 1 (pengajuan), 2 (unggah ulang) | Permohonan tersimpan terpusat. Dokumen yang diunggah ulang tidak menghapus versi sebelumnya. | Autentikasi |
| **Verifikasi anggaran dan pengelolaan MAK** | Perencanaan menyetujui atau menolak permohonan dan menentukan jenis MAK. MAK dapat diubah selama dokumen pengadaan belum disetujui PPK dan Bidang 2. | Sebagai Perencanaan, saya ingin memastikan anggaran tersedia dan menentukan kategori anggaran tiap pengadaan. | 1 (verifikasi, penentuan, perubahan MAK), 2 (unggah RKAKL) | Penolakan wajib disertai alasan. Perubahan MAK setelah persetujuan PPK dan Bidang 2 ditolak sistem, dan perubahan MAK mengganti PPK yang bertugas. | Pengajuan permohonan |
| **Persetujuan bertingkat** | Bidang 2 memberi persetujuan awal dengan mengunggah memo, atau menolak disertai alasan. | Sebagai Bidang 2, saya ingin menyetujui atau menolak permohonan dengan dokumen dan alasan yang tercatat. | 1 | Persetujuan menyertakan memo. Penolakan menyertakan alasan. Keputusan tercatat beserta aktor dan waktunya. | Verifikasi anggaran |
| **Pengelolaan paket pengadaan** | PPBJ memecah satu permohonan menjadi beberapa pengadaan, menentukan jenis pengadaan, metode pengadaan, dan level pengadaan berdasarkan nominal (<50 juta, 50–200 juta, >200 juta), lalu menugaskan satu dari empat PPK sesuai jenis anggaran. Setiap pengadaan memakai tepat satu MAK dari daftar yang ditentukan Perencanaan. Dokumen pengadaan dapat diunggah dan diunggah ulang. | Sebagai PPBJ, saya ingin menyusun paket pengadaan dan menentukan siapa yang mereview. | 1 (pecah, metode, level, unggah, penugasan PPK), 2 (unggah ulang, pemantauan) | Satu permohonan dapat menghasilkan beberapa pengadaan. Level ditentukan otomatis dari nominal. PPK yang ditugaskan sesuai jenis MAK dan berganti saat MAK berubah. | Persetujuan bertingkat |
| **Review dokumen pengadaan** | PP mereview pengadaan bernilai 50–200 juta. PPK menandatangani review di semua level dengan mengunggah bukti tanda tangan. | Sebagai PP atau PPK, saya ingin meninjau dokumen pengadaan yang menjadi tanggung jawab saya. | 1 | PP hanya melihat pengadaan level 50–200 juta. PPK hanya melihat pengadaan yang ditugaskan kepadanya. | Pengelolaan paket pengadaan |
| **Kontrak dan rencana pembayaran per termin** | PPBJ menerbitkan Kontrak/SPK/Surat Pesanan, menetapkan rencana pembayaran per termin sejak kontrak terbit, dan menentukan tanggal pengingat tiap termin. | Sebagai PPBJ, saya ingin menetapkan jadwal dan nominal termin saat kontrak diterbitkan. | 1 | Setiap termin memiliki nominal dan jatuh tempo. Pengingat terhubung ke termin tertentu. | Review dokumen pengadaan |
| **Penerimaan barang** | Perlengkapan melihat dokumen pengadaan dan SPK, mengunggah foto dokumentasi barang, dan mengunggah berita acara penerimaan yang sudah ditandatangani. | Sebagai Perlengkapan, saya ingin mencatat penerimaan barang beserta bukti dokumentasinya. | 1 (foto, berita acara), 2 (melihat dokumen) | Foto dan berita acara tersimpan dan terhubung ke pengadaan terkait. | Kontrak |
| **Pembayaran per termin dengan persetujuan ganda** | PPBJ mengunggah dokumen pembayaran dan legalitas vendor per termin. PPK dan Bidang 2 sama-sama harus menyetujui dengan memo, atau menolak dengan alasan. Keuangan hanya melihat pembayaran yang disetujui keduanya, lalu mengunggah bukti pembayaran. | Sebagai Keuangan, saya hanya ingin memproses pembayaran yang sudah disetujui lengkap. | 1 | Pembayaran tidak muncul untuk Keuangan sebelum PPK dan Bidang 2 sama-sama menyetujui. Nominal pembayaran harus sama persis dengan rencana termin. | Kontrak dan rencana pembayaran, Penerimaan barang |
| **Tracking status dan notifikasi** | Riwayat perubahan status lengkap dengan aktor dan waktunya, progres terlihat per unit, notifikasi in-app dan email saat status berubah, serta pengingat pembayaran bagi PPBJ, PPK, dan Keuangan. | Sebagai pemohon, saya ingin melihat progres permohonan dan pengadaannya serta diberi tahu saat ada perubahan. | 1 (tracking), 2 (notifikasi, pengingat) | Rekan satu unit dapat memantau progres yang sama. Pengingat muncul pada tanggal yang ditentukan PPBJ. | Seluruh alur pengadaan |
| **Pencarian, filter, dan rekap** | Pencarian permohonan, filter berdasarkan bulan, tahun, status, nomor surat, dan unit, serta rekap total anggaran per kategori untuk Bidang 2, PPBJ, PPK, dan Keuangan. | Sebagai Bidang 2, PPBJ, PPK, atau Keuangan, saya ingin menyaring dokumen dan melihat rekap anggaran. | 2 | Filter dan pencarian mengembalikan data yang sesuai. Rekap menjumlahkan nominal pengadaan per kategori anggaran. | Pengelolaan paket pengadaan |

**Di luar cakupan versi awal:** aplikasi mobile, REST API publik, dan integrasi otomatis dengan Srikandi (nomor surat diinput manual).

## Non-Functional Requirements

### Performance
- **Load Time:** Pemuatan halaman dan pembaruan status selesai dalam ≤3 detik pada kondisi normal.
- **Concurrent Users:** Sistem dapat diakses 100 pengguna bersamaan tanpa crash atau error.
- **Response Time:** Rata-rata waktu respons ≤3 detik pada pengujian beban dengan 100 pengguna virtual.

### Security
- **Authentication:** Login dengan kredensial. Password disimpan sebagai hash bcrypt dan tidak pernah ditampilkan atau dicatat dalam teks asli. Sesi berakhir otomatis setelah 60 menit tanpa aktivitas.
- **Authorization:** Akses berbasis peran (RBAC). Setiap peran hanya dapat mengakses menu dan fitur sesuai wewenangnya, dan pembatasan ditegakkan di sisi server.
- **Data Protection:** Unggahan hanya berformat PDF, JPG, atau PNG, divalidasi berdasarkan tipe file asli, dengan ukuran maksimal 10 MB per file. Nama file di-hash sebelum disimpan sehingga nama asli tidak dapat ditebak lewat URL.

### Compatibility
- **Devices:** Perangkat desktop atau laptop sebagai target utama (asumsi).
- **Browsers:** Browser modern versi terbaru (asumsi).
- **Screen Sizes:** Tampilan responsif dasar (asumsi).

### Accessibility
- **Compliance Level:** Tidak ada target kepatuhan spesifik pada versi awal.
- **Specific Requirements:** Tidak ada.

## Technical Specifications

### Frontend
- **Technology Stack:** React dengan Inertia.js dan Tailwind CSS dalam satu aplikasi monolitik (routing Laravel di server, render React di client).
- **Design System:** Belum ditentukan.
- **Responsive Design:** Responsif dasar menggunakan utilitas Tailwind.

### Backend
- **Technology Stack:** PHP 8.5.11 dengan Laravel 13.
- **API Requirements:** Tidak ada REST API karena aplikasi monolitik Inertia (komunikasi via protokol Inertia, bukan REST). Lapisan API (Laravel Sanctum untuk autentikasi dan Scribe untuk dokumentasi) baru ditambahkan jika nanti ada konsumen eksternal.
- **Database:** PostgreSQL 18, relasional. Data dokumen, persetujuan, dan riwayat status disimpan dalam tabel bersama yang dapat merujuk ke berbagai objek pengadaan.
