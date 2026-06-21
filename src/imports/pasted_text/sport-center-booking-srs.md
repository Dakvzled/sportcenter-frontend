SOFTWARE REQUIREMENT SPECIFICATION (SRS)
Proyek Rekayasa Perangkat Lunak
SISTEM BOOKING LAPANGAN SPORT CENTER SOLO

Layanan Reservasi Online Lapangan Olahraga
Badminton | Voli | Futsal | Mini Soccer | Basket

Informasi
Keterangan
Mata Kuliah
Rekayasa Perangkat Lunak
Dosen Pengampu
Slamet Kurniawan Fahrurozi, S.Pd., M.Pd.
Tahun Akademik
2025 - Genap
Nomor Dokumen
DOC-02-SRS
Versi
1.0
Tanggal
Mei 2025
Ketua Kelompok
Eka
Anggota
Dhani, Eka, Daaris, Vella, Salsa
Penanggung Jawab SRS
Eka


BAB I 
PENDAHULUAN

Tujuan Dokumen
Dokumen Software Requirement Specification (SRS) ini bertujuan untuk mendefinisikan secara lengkap dan terstruktur semua kebutuhan fungsional dan non-fungsional dari Sistem Booking Lapangan Sport Center Solo. Dokumen ini menjadi acuan bagi tim pengembang, pengelola, dan pemangku kepentingan dalam proses pengembangan, pengujian, dan validasi sistem.

Ruang Lingkup
Sistem yang dikembangkan adalah aplikasi web bernama Sport Center Solo Booking System (SCSBS) yang mencakup:
Modul pendaftaran dan autentikasi pengguna
Modul pengecekan ketersediaan dan pemesanan lapangan
Modul pembayaran dan konfirmasi reservasi
Modul notifikasi dan pengingat jadwal
Modul manajemen lapangan dan jadwal oleh admin
Modul laporan dan statistik penggunaan
Sistem ini mendukung 5 jenis lapangan: Badminton, Voli, Futsal, Mini Soccer, dan Basket. Sistem tidak mencakup manajemen keuangan lanjutan, penggajian karyawan, atau integrasi dengan sistem eksternal lain di luar pembayaran digital.

Definisi, Akronim, dan Singkatan
Istilah / Singkatan
Definisi
SCSBS
Sport Center Solo Booking System
SRS
Software Requirement Specification
User / Pengguna
Individu yang menggunakan sistem untuk memesan lapangan
Admin
Pengelola sistem yang bertugas memverifikasi pemesanan dan mengelola data
Booking / Reservasi
Proses pemesanan slot waktu penggunaan lapangan
Slot
Unit waktu penggunaan lapangan (biasanya 1 jam per slot)
FR
Functional Requirement (Kebutuhan Fungsional)
NFR
Non-Functional Requirement (Kebutuhan Non-Fungsional)


Referensi
IEEE Std 830-1998 – IEEE Recommended Practice for Software Requirements Specifications
Dokumen Identifikasi Masalah Sport Center Solo (DOC-01-IM)
Rancangan Tugas dan Evaluasi Mata Kuliah RPL 2025/Genap

Gambaran Umum Dokumen
Dokumen SRS ini disusun dengan struktur sebagai berikut:
Bab I: Pendahuluan – tujuan, ruang lingkup, dan definisi
Bab II: Deskripsi Umum Sistem – perspektif, fungsi utama, dan asumsi
Bab III: Kebutuhan Fungsional – deskripsi tiap fitur sistem
Bab IV: Kebutuhan Non-Fungsional – performa, keamanan, dan kompatibilitas
Bab V: Kebutuhan Pengguna – kebutuhan dari sudut pandang pengguna akhir
Bab VI: Kebutuhan Sistem – spesifikasi teknis perangkat keras dan lunak
Bab VII: Use Case Description – alur interaksi pengguna dengan sistem

BAB II
DESKRIPSI UMUM SISTEM

Perspektif Produk
Sistem Booking Lapangan Sport Center Solo merupakan aplikasi web baru yang dikembangkan untuk menggantikan proses reservasi manual. Sistem ini berdiri sebagai web mandiri (standalone) dengan akses melalui browser web di perangkat desktop. Sistem terhubung dengan layanan email untuk notifikasi dan sistem pembayaran untuk konfirmasi transaksi.

Fungsi Utama Produk
No
Fungsi
Keterangan
1
Manajemen Akun
Registrasi, login, lupa password, edit profil pengguna
2
Pencarian & Pengecekan Jadwal
Melihat ketersediaan lapangan berdasarkan jenis, tanggal, dan waktu
3
Pemesanan Lapangan
Memilih lapangan, slot waktu, dan membuat reservasi
4
Pembayaran
Upload bukti pembayaran dan konfirmasi oleh admin
5
Manajemen Reservasi
Melihat, membatalkan, atau reschedule reservasi aktif
6
Notifikasi
Pemberitahuan status reservasi, pembayaran, dan pengingat jadwal
7
Panel Admin
Kelola lapangan, jadwal, pengguna, dan verifikasi pembayaran
8
Laporan
Dashboard laporan keuangan dan statistik penggunaan lapangan


Karakteristik Pengguna
Jenis Pengguna
Hak Akses
Kemampuan yang Dibutuhkan
Tamu (Guest)
Terbatas
Dapat melihat jadwal dan informasi lapangan tanpa login
Pengguna (User)
Penuh
Registrasi, login, pesan lapangan, kelola reservasi, bayar
Admin
Penuh + Admin
Kelola lapangan, jadwal, verifikasi pembayaran, lihat laporan
Super Admin
Semua Fitur
Konfigurasi sistem, manajemen admin, akses semua data


Asumsi dan Ketergantungan
Pengguna memiliki perangkat (komputer/smartphone) dengan browser modern dan koneksi internet
Sport Center Solo memiliki koneksi internet yang stabil untuk operasional sistem
Pembayaran dilakukan melalui transfer bank atau dompet digital, bukan gateway pembayaran otomatis
Sistem dikembangkan menggunakan metodologi Scrum dengan sprint 2 mingguan
Data jadwal dan harga lapangan diinput secara manual oleh admin melalui panel admin

BAB III
KEBUTUHAN FUNGSIONAL

Modul Manajemen Pengguna
FR-01	: Registrasi Akun
Deskripsi: Sistem harus menyediakan form registrasi bagi calon pengguna baru.
Input: Nama lengkap, alamat email, nomor telepon, password, konfirmasi password.
Proses: Sistem memvalidasi format email, mengecek keunikan email, meng-hash password, dan menyimpan data.
Output: Akun pengguna baru dibuat; email verifikasi dikirimkan.
Kondisi Error: Email sudah terdaftar (tampil pesan error); Format tidak valid (validasi inline).
FR-02: Login dan Autentikasi
Deskripsi: Pengguna terdaftar dapat masuk ke sistem menggunakan email dan password.
Input: Email dan password.
Proses: Verifikasi kredensial, generate session token, catat waktu login.
Output: Pengguna masuk ke dashboard sesuai perannya.
Kondisi Error: Email/password salah (tampil pesan, batasi 5 kali percobaan); Akun tidak aktif (tampil pesan verifikasi).
FR-03: Lupa Password
Deskripsi: Pengguna yang lupa password dapat mereset melalui email.
Proses: Verifikasi email, kirim link reset (valid 1 jam), pengguna set password baru.
FR-04: Manajemen Profil
Deskripsi: Pengguna dapat melihat dan mengedit data profil pribadi.
Input: Nama, nomor telepon, foto profil.
Proses: Validasi dan pembaruan data di database.

Modul Pencarian dan Pengecekan Ketersediaan
FR-05: Tampilan Kalender Lapangan
Deskripsi: Sistem menampilkan kalender ketersediaan slot untuk setiap jenis lapangan.
Input: Pilihan jenis lapangan dan tanggal.
Output: Tampilan visual slot tersedia (hijau), terpesan (merah), dan diblokir (abu-abu) per jam dari pukul 06.00 hingga 23.00.

FR-06: Filter dan Pencarian
Deskripsi: Pengguna dapat memfilter jadwal berdasarkan jenis lapangan, tanggal, dan rentang waktu.
Input: Jenis lapangan (Badminton/Voli/Futsal/Mini Soccer/Basket), tanggal, jam mulai, jam selesai.
Output: Daftar slot yang sesuai dengan filter.

Modul Pemesanan Lapangan
FR-07: Membuat Reservasi
Deskripsi: Pengguna terdaftar dapat membuat reservasi lapangan untuk slot yang tersedia.
Input: Jenis lapangan, tanggal, jam mulai, jam selesai, jumlah orang, catatan tambahan.
Proses: Cek ketersediaan slot yang dipilih, Hitung total biaya berdasarkan durasi dan tarif lapangan, Kunci slot sementara selama 15 menit untuk proses pembayaran, Buat entri reservasi dengan status PENDING
Output: Detail reservasi ditampilkan; pengguna diarahkan ke halaman pembayaran.
Kondisi Error: Slot sudah tidak tersedia (informasikan dan arahkan ke slot lain); Session timeout 15 menit (reservasi dibatalkan otomatis).
FR-08: Konfirmasi Pembayaran
Deskripsi: Pengguna mengunggah bukti pembayaran untuk dikonfirmasi admin.
Input: File foto/screenshot bukti transfer (format JPG/PNG, maks 2MB), metode pembayaran.
Proses: Upload file, ubah status reservasi menjadi WAITING_CONFIRMATION, notifikasi ke admin.
Output: Status reservasi berubah; konfirmasi dikirim ke email pengguna.
FR-09: Pembatalan Reservasi
Deskripsi: Pengguna dapat membatalkan reservasi sesuai kebijakan pembatalan.
Kebijakan:
H-2 atau lebih: refund 100%
H-1: refund 50%
Hari H atau kurang dari 24 jam: tidak ada refund
Proses: Cek waktu pembatalan, hitung refund, ubah status CANCELLED, bebaskan slot.
FR-10: Riwayat Reservasi
Deskripsi: Pengguna dapat melihat semua riwayat reservasi (aktif, selesai, dibatalkan).
Output: Tabel riwayat dengan detail tanggal, lapangan, durasi, biaya, dan status.
Modul Notifikasi
FR-11: Notifikasi Email Otomatis
Deskripsi: Sistem mengirimkan notifikasi email pada event-event berikut:
Konfirmasi pembuatan reservasi (status PENDING)
Konfirmasi pembayaran diterima (status CONFIRMED)
Pengingat H-1 sebelum jadwal bermain
Notifikasi pembatalan reservasi
Notifikasi pembayaran ditolak (disertai alasan)
Modul Admin
FR-12: Manajemen Data Lapangan
Deskripsi: Admin dapat menambah, mengedit, dan menonaktifkan data lapangan.
Data lapangan meliputi: nama lapangan, jenis olahraga, kapasitas, tarif per jam (weekday/weekend), foto lapangan, status aktif/nonaktif.
FR-13: Manajemen Jadwal dan Blokir
Deskripsi: Admin dapat memblokir slot waktu tertentu untuk keperluan pemeliharaan, event khusus, atau alasan operasional lainnya.
FR-14: Verifikasi Pembayaran
Deskripsi: Admin dapat melihat daftar reservasi yang menunggu verifikasi pembayaran.
Aksi: Konfirmasi (ubah status ke CONFIRMED) atau Tolak (ubah status ke PAYMENT_REJECTED disertai alasan).
FR-15: Manajemen Pengguna
Deskripsi: Admin dapat melihat daftar pengguna, memblokir akun yang bermasalah, dan mereset password.
FR-16: Dashboard Laporan
Deskripsi: Admin dapat mengakses laporan:
Total pendapatan harian/mingguan/bulanan
Jumlah reservasi per jenis lapangan
Tingkat hunian lapangan (persentase slot terpakai)
Data pengguna aktif
Grafik tren penggunaan lapangan
BAB IV
KEBUTUHAN NON-FUNGSIONAL

Performa
Parameter
Spesifikasi
Waktu Respons Halaman
< 3 detik untuk halaman utama pada koneksi broadband normal
Waktu Respons Pencarian
< 2 detik untuk query ketersediaan jadwal
Concurrent Users
Mendukung minimal 50 pengguna aktif secara bersamaan
Waktu Proses Booking
< 5 detik dari submit form hingga konfirmasi sistem
Uptime
Minimum 99% availability (tidak termasuk maintenance terjadwal)


Keamanan
Semua komunikasi data menggunakan protokol HTTPS/SSL
Password disimpan menggunakan algoritma hashing bcrypt (min. 10 salt rounds)
Sesi pengguna menggunakan JWT token dengan expiry 24 jam
Proteksi terhadap serangan SQL Injection melalui prepared statements
Proteksi terhadap serangan Cross-Site Scripting (XSS) melalui sanitasi input
Pembatasan percobaan login (maksimal 5 kali; akun dikunci 15 menit)
Validasi ukuran dan tipe file saat upload bukti pembayaran
Backup database dilakukan setiap hari secara otomatis
Kegunaan (Usability)
Antarmuka responsif dan dapat diakses melalui perangkat mobile (smartphone) maupun desktop
Navigasi intuitif; pengguna baru dapat menyelesaikan proses booking dalam maksimal 5 menit tanpa panduan
Tersedia pesan error yang informatif dan mudah dipahami
Kalender ketersediaan ditampilkan dengan kode warna yang jelas dan mudah dibaca
Form input memiliki placeholder dan label yang jelas
Keandalan (Reliability)
Sistem harus menangani kegagalan transaksi tanpa menyebabkan inkonsistensi data (menggunakan database transaction)
Mekanisme pencegahan double booking melalui database locking
Log aktivitas sistem tersimpan untuk keperluan audit dan debugging
Kompatibilitas
Kompatibel dengan browser modern: Google Chrome (versi 90+), Mozilla Firefox (versi 88+), Microsoft Edge (versi 90+), dan Safari (versi 14+)
Responsif pada layar dengan resolusi minimal 320px (mobile) hingga 1920px (desktop)
Tidak memerlukan instalasi plugin atau software tambahan di sisi pengguna
Pemeliharaan
Kode program mengikuti standar PSR (PHP) atau ESLint (JavaScript) untuk kemudahan pemeliharaan
Arsitektur MVC (Model-View-Controller) untuk pemisahan logika yang jelas
Dokumentasi kode tersedia dalam bahasa Indonesia
Sistem versi menggunakan Git dengan branching strategy (main, develop, feature branches)

BAB V
KEBUTUHAN PENGGUNA

Kebutuhan Pengguna Akhir (Customer)
No
Kebutuhan Pengguna
Fitur Sistem yang Memenuhi
1
Ingin mengetahui jadwal lapangan yang tersedia tanpa harus datang ke lokasi
FR-05, FR-06 (Kalender & Filter)
2
Ingin memesan lapangan secara online kapan saja dan di mana saja
FR-07 (Buat Reservasi)
3
Ingin mendapatkan konfirmasi pemesanan secara langsung
FR-08, FR-11 (Pembayaran & Notifikasi)
4
Ingin dapat membatalkan atau mengubah jadwal pemesanan
FR-09 (Pembatalan & Reschedule)
5
Ingin melihat riwayat semua pemesanan yang pernah dilakukan
FR-10 (Riwayat Reservasi)
6
Ingin mendapatkan pengingat sebelum jadwal bermain
FR-11 (Notifikasi H-1)
7
Ingin proses pembayaran mudah dan aman
FR-08 (Konfirmasi Pembayaran)


Kebutuhan Admin / Pengelola
No
Kebutuhan Admin
Fitur Sistem yang Memenuhi
1
Ingin memverifikasi pembayaran dengan mudah dan cepat
FR-14 (Verifikasi Pembayaran)
2
Ingin memblokir jadwal tertentu untuk pemeliharaan
FR-13 (Blokir Jadwal)
3
Ingin memantau semua reservasi secara real-time
FR-16 (Dashboard Admin)
4
Ingin mengakses laporan keuangan dan statistik penggunaan
FR-16 (Laporan)
5
Ingin mengelola data dan tarif dengan mudah
FR-12 (Manajemen Lapangan)
6
Ingin dapat mengelola akun pengguna yang bermasalah
FR-15 (Manajemen User)


BAB VI
KEBUTUHAN SISTEM

Kebutuhan Perangkat Lunak (Software)
Komponen
Teknologi
Keterangan
Frontend
HTML
Komponen UI dinamis dan interaktif
Backend
Django Framework
Framework MVC untuk logika bisnis dan API
Database
MySQL 8.0
Penyimpanan data relasional
Web Server
Apache / Nginx
Melayani request HTTP/HTTPS
Versi Kontrol
Git / GitHub
Manajemen kode sumber dan kolaborasi tim
Tools Pengembangan
VS Code & Laragon
Lingkungan pengembangan lokal
Testing
K6, Robot Framework
Unit testing dan API testing


 Kebutuhan Perangkat Keras (Hardware)
Server
Prosesor: Dual Core 2.0 GHz atau lebih
RAM: Minimal 2 GB (direkomendasikan 4 GB)
Storage: Minimal 20 GB SSD
Koneksi Internet: Minimal 10 Mbps upload
Pengguna
Desktop/Laptop: Prosesor 1 GHz, RAM 1 GB, Browser modern
Smartphone: Android 8.0+ / iOS 13+ dengan browser mobile
Koneksi Internet: Minimal 1 Mbps
Arsitektur Sistem
Sistem menggunakan arsitektur Three-Tier:
Presentation Layer: Antarmuka web yang diakses pengguna melalui browser
Business Logic Layer: Server backend (Laravel) yang memproses request, validasi, dan logika bisnis
Data Layer: Database MySQL yang menyimpan seluruh data sistem




BAB VII
USE CASE DESCRIPTION

Ringkasan Use Case
Berikut adalah daftar semua use case dalam sistem:
UC-ID
Aktor
Nama Use Case
Deskripsi Singkat
UC-01
Tamu, Pengguna
Melihat Jadwal Lapangan
Melihat ketersediaan slot untuk semua jenis lapangan
UC-02
Tamu
Mendaftar Akun
Membuat akun baru sebagai pengguna terdaftar
UC-03
Pengguna
Login
Masuk ke sistem menggunakan email dan password
UC-04
Pengguna
Memesan Lapangan
Memilih dan memesan slot lapangan yang tersedia
UC-05
Pengguna
Mengunggah Bukti Bayar
Upload bukti pembayaran untuk konfirmasi admin
UC-06
Pengguna
Membatalkan Reservasi
Membatalkan reservasi yang aktif sesuai kebijakan
UC-07
Pengguna
Melihat Riwayat
Melihat daftar semua reservasi yang pernah dibuat
UC-08
Pengguna
Edit Profil
Memperbarui data profil dan informasi akun
UC-09
Admin
Verifikasi Pembayaran
Mengkonfirmasi atau menolak bukti pembayaran
UC-10
Admin
Kelola Lapangan
Menambah/edit/nonaktifkan data lapangan dan tarif
UC-11
Admin
Blokir Jadwal
Memblokir slot waktu untuk keperluan pemeliharaan
UC-12
Admin
Kelola Pengguna
Memantau dan mengelola akun pengguna
UC-13
Admin
Lihat Laporan
Mengakses dashboard laporan dan statistik



Deskripsi Use Case Detail
UC-04: Memesan Lapangan (Booking)
Properti
Keterangan
Use Case ID
UC-04
Nama
Memesan Lapangan
Aktor Utama
Pengguna (User)
Aktor Pendukung
Sistem (pengecekan ketersediaan)
Deskripsi
Pengguna yang telah login memilih jenis lapangan, tanggal, dan slot waktu yang diinginkan untuk membuat reservasi.
Pra-kondisi
Pengguna telah login; Slot yang diinginkan tersedia
Pasca-kondisi
Reservasi berhasil dibuat dengan status PENDING; Slot dikunci sementara; Notifikasi email dikirim
Main Flow
1. Pengguna memilih jenis lapangan
2. Sistem menampilkan kalender ketersediaan
3. Pengguna memilih tanggal dan slot waktu
4. Sistem menampilkan detail dan total biaya
5. Pengguna mengisi form data tambahan (jumlah orang, catatan)
6. Pengguna mengklik 'Pesan Sekarang'
7. Sistem memvalidasi ketersediaan final
8. Sistem membuat entri reservasi (status PENDING)
9. Sistem menampilkan halaman konfirmasi dan arahan pembayaran
Alternative Flow
Alt 7a: Slot sudah dipesan orang lain -> Sistem informasikan dan tawarkan slot lain
Alt 6a: Pengguna membatalkan di tengah proses -> Slot dibebaskan, kembali ke halaman pencarian
Exception Flow
Timeout 15 menit pada langkah 6-9 -> Slot dibebaskan otomatis; Pengguna diarahkan mulai ulang


UC-09: Verifikasi Pembayaran (Admin)
Properti
Keterangan
Use Case ID
UC-09
Nama
Verifikasi Pembayaran
Aktor Utama
Admin
Deskripsi
Admin memverifikasi bukti pembayaran yang diunggah pengguna untuk mengkonfirmasi atau menolak reservasi.
Pra-kondisi
Admin telah login; Terdapat reservasi dengan status WAITING_CONFIRMATION
Pasca-kondisi (Konfirmasi)
Status reservasi berubah menjadi CONFIRMED; Notifikasi email konfirmasi dikirim ke pengguna
Pasca-kondisi (Tolak)
Status reservasi berubah menjadi PAYMENT_REJECTED; Slot dibebaskan; Notifikasi penolakan dikirim ke pengguna beserta alasan
Main Flow
Admin membuka menu 'Verifikasi Pembayaran'
Sistem menampilkan daftar reservasi WAITING_CONFIRMATION
Admin memilih satu reservasi
Sistem menampilkan detail reservasi dan bukti pembayaran
Admin memeriksa bukti pembayaran
Admin mengklik 'Konfirmasi' atau 'Tolak'
Jika tolak: Admin mengisi alasan penolakan
Sistem memperbarui status reservasi
Sistem mengirimkan notifikasi email ke pengguna


UC-06: Membatalkan Reservasi
Properti
Keterangan
Use Case ID
UC-06
Nama
Membatalkan Reservasi
Aktor Utama
Pengguna (User)
Deskripsi
Pengguna membatalkan reservasi yang sudah dikonfirmasi sebelum jadwal bermain.
Pra-kondisi
Pengguna telah login; Memiliki reservasi aktif dengan status CONFIRMED
Pasca-kondisi
Reservasi berstatus CANCELLED; Slot dibebaskan; Proses refund sesuai kebijakan
Main Flow
Pengguna membuka halaman 'Riwayat Reservasi'
Pengguna memilih reservasi aktif
Pengguna mengklik 'Batalkan Reservasi'
Sistem menampilkan informasi kebijakan pembatalan dan estimasi refund
Pengguna mengkonfirmasi pembatalan
Sistem memperbarui status menjadi CANCELLED
Sistem membebaskan slot
Sistem memproses refund sesuai kebijakan
Notifikasi pembatalan dikirim ke email pengguna
Alternative Flow
Alt 3a: Reservasi sudah dalam waktu H (tidak bisa dibatalkan) -> Sistem informasikan tidak dapat membatalkan dan tampilkan kebijakan



BAB VIII
PENUTUP
 
Dokumen SRS ini telah mendefinisikan secara lengkap seluruh kebutuhan Sistem Booking Lapangan Sport Center Solo, mencakup kebutuhan fungsional (FR-01 hingga FR-16), kebutuhan non-fungsional (performa, keamanan, usability, keandalan, kompatibilitas), kebutuhan pengguna, kebutuhan sistem, serta deskripsi use case detail.
Dokumen ini akan menjadi landasan untuk tahap Design Modeling (UML), pengembangan prototype, dan pengujian sistem. Setiap perubahan kebutuhan harus didokumentasikan sebagai revisi SRS dengan nomor versi yang diperbarui.



