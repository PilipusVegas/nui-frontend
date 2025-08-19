const cardInfo = {
  "Persetujuan Presensi": `Menu ini digunakan oleh HRD atau atasan untuk memberikan persetujuan atas presensi (absensi) harian karyawan teknisi lapangan. 

Presensi dapat disetujui apabila memenuhi ketentuan berikut:
- Lokasi absen sesuai atau berada dekat dengan lokasi kerja yang ditentukan.
- Foto absensi valid, jelas, dan sesuai ketentuan.
- Sistem pelacakan lokasi terhubung dengan Google Maps untuk memastikan keakuratan.

Hanya presensi karyawan lapangan yang dilakukan secara online di lokasi kerja yang dapat disetujui. 
Presensi yang lokasinya jauh dari titik kerja atau menggunakan foto yang tidak sesuai tidak boleh disetujui.`,

  "Kelola Presensi": `Menu ini digunakan untuk melihat dan memantau kehadiran seluruh karyawan, baik karyawan kantor maupun teknisi lapangan.

Informasi yang tersedia meliputi:
- Jam masuk kerja
- Jam pulang kerja
- Keterlambatan (late)
- Lembur (overtime)
- Rekapitulasi data presensi

Menu ini dipakai oleh HRD untuk pencatatan kehadiran karyawan. 
Perubahan data presensi hanya boleh dilakukan dengan alasan yang jelas dan didukung bukti yang sah.`,

  "Dinas Keluar Kantor": `Menu ini digunakan untuk mengelola pengajuan dan persetujuan surat dinas karyawan yang ditugaskan keluar kantor.

Fitur yang tersedia:
- Pengajuan surat dinas oleh karyawan
- Persetujuan atau penolakan oleh atasan
- Riwayat surat dinas

Menu ini diperuntukkan bagi karyawan kantor yang mendapat tugas luar. 
Tidak boleh digunakan untuk kepentingan pribadi di luar urusan pekerjaan.`,

  "Kelola Penggajian": `Menu ini digunakan untuk menghitung dan mengelola gaji karyawan berdasarkan data presensi, keterlambatan, dan lembur.

Fitur yang tersedia:
- Melihat detail gaji per karyawan
- Rekapitulasi gaji seluruh karyawan

Menu ini hanya digunakan oleh HRD untuk keperluan pencatatan gaji. 
Proses penggajian tidak boleh dilakukan sebelum data presensi dan lembur selesai diverifikasi.`,

  "Persetujuan Lembur": `Menu ini menampilkan daftar pengajuan lembur dari karyawan teknisi lapangan.

Fitur yang tersedia:
- Melihat detail pengajuan lembur
- Menyetujui atau menolak pengajuan
- Terhubung langsung dengan sistem penggajian

Persetujuan hanya dapat dilakukan oleh kepala divisi atau atasan. 
Jangan menyetujui lembur tanpa bukti adanya pekerjaan tambahan yang jelas.`,

  "Titik Lokasi Absensi": `Menu ini digunakan untuk mengatur titik lokasi absensi karyawan teknisi lapangan.

Fitur yang tersedia:
- Menambah, mengedit, dan menghapus lokasi presensi
- Menentukan radius validasi presensi
- Sinkronisasi lokasi dengan Google Maps

Menu ini hanya dapat digunakan oleh admin atau kepala divisi. 
Lokasi yang ditentukan harus nyata dan akurat, tidak boleh fiktif.`,

  "Kelola Karyawan": `Menu ini memuat seluruh data karyawan perusahaan.

Fitur yang tersedia:
- Menambah, mengedit, dan menghapus data karyawan
- Mengatur divisi, shift, perusahaan, dan informasi kontak karyawan
- Jika karyawan ditempatkan di perusahaan baru, shift perusahaan tersebut harus ditambahkan terlebih dahulu di menu Kelola Perusahaan

Menu ini digunakan oleh HRD untuk pencatatan data karyawan. 
Pastikan setiap data karyawan diisi lengkap dan tidak boleh dibiarkan kosong.`,

  "Kelola Struktur Divisi": `Menu ini digunakan untuk mengelola struktur organisasi perusahaan.

Fitur yang tersedia:
- Menambah dan mengatur nama divisi
- Menentukan peran dan tanggung jawab setiap divisi

Divisi wajib diatur sebelum mengelola data karyawan. 
Divisi yang masih digunakan oleh karyawan aktif tidak boleh dihapus.`,

  "Kelola Jam Kerja": `Menu ini digunakan untuk mengatur jadwal atau jam kerja karyawan, baik teknisi lapangan maupun karyawan kantor.

Fitur yang tersedia:
- Menentukan jam masuk, jam keluar, dan aturan kerja tiap shift
- Satu shift dapat dipakai oleh lebih dari satu karyawan maupun perusahaan

Shift harus dipasangkan dengan data karyawan saat diinput. 
Jangan membuat shift tanpa jadwal yang jelas, karena data shift bersifat permanen dan krusial untuk perhitungan presensi, keterlambatan, dan lembur.`,

  "Kelola Perusahaan": `Menu ini digunakan untuk mengelola data perusahaan yang menjadi tempat karyawan bekerja.

Fitur yang tersedia:
- Menambah dan mengedit nama perusahaan
- Menentukan daftar shift yang berlaku di perusahaan

Data perusahaan wajib diisi sebelum menambahkan karyawan. 
Pastikan informasi perusahaan lengkap dan valid, tidak boleh dibuat secara asal.`
};

export default cardInfo;
