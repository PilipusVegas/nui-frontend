import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow, faBriefcase, faFileSignature, faSackDollar, faCheckCircle, faMapPin, faUserGroup, faNetworkWired, faClockRotateLeft, faCity,faCircleInfo, faTimes  } from "@fortawesome/free-solid-svg-icons";
import { getUserFromToken } from "../utils/jwtHelper";

const HomeDesktop = () => {
  const navigate = useNavigate();
  const [localTime, setLocalTime] = useState("");
  const [profile, setProfile] = useState({});
  const [roleId, setRoleId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [infoTitle, setInfoTitle] = useState("");



  const handleCardClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setProfile({
        nama: user.nama_user,
        role: user.role,
      });
      setRoleId(Number(user.id_role));
    } else {
      console.error("Token tidak ditemukan atau invalid.");
    }
  }, []);

  const updateLocalTime = () => {
    const time = new Date().toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    setLocalTime(time);
  };

  useEffect(() => {
    if (roleId === null) return;
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);
    return () => clearInterval(intervalId);
  }, [roleId]);
  
  const allCards = [
    { title: "Persetujuan Presensi Harian", icon: faLocationArrow, color: "text-emerald-500", link: "/persetujuan-presensi", roles: [1, 4, 5, 6, 20],},
    { title: "Kelola Presensi Karyawan", icon: faBriefcase, color: "text-blue-500", link: "/kelola-presensi", roles: [1, 4, 5, 6 ],},
    { title: "Surat Dinas", icon: faFileSignature,  color: "text-sky-500", link: "/surat-dinas", roles: [1, 4, 5, 6, 13],},
    { title: "Penggajian", icon: faSackDollar, color: "text-yellow-500", link: "/penggajian",  roles: [1, 4, 6, 13],},
    { title: "Persetujuan Lembur", icon: faCheckCircle, color: "text-teal-500", link: "/persetujuan-lembur", roles: [1, 4, 5, 6, 20],},
    { title: "Data Lokasi Presensi", icon: faMapPin, color: "text-orange-500", link: "/lokasi-presensi", roles: [1, 5],},
    { title: "Karyawan", icon: faUserGroup, color: "text-violet-500", link: "/karyawan", roles: [1, 4, 6, 13],},
    { title: "Divisi", icon: faNetworkWired, color: "text-indigo-500", link: "/divisi", roles: [1, 4, 6],},
    { title: "Shift", icon: faClockRotateLeft, color: "text-rose-500", link: "/shift", roles: [1, 4, 6],},
    { title: "Perusahaan", icon: faCity, color: "text-blue-700", link: "/perusahaan", roles: [1, 4, 6]},
  ];

  const cardInfo = {
    "Persetujuan Presensi Harian": `Menu ini digunakan khusus oleh HRD atau atasan untuk menyetujui presensi (absensi) harian dari karyawan teknisi lapangan. 
  
    Presensi yang sah harus memenuhi beberapa kriteria berikut:
  - Lokasi absen harus berada dekat dengan lokasi kerja yang telah ditentukan.
  - Foto yang digunakan saat absen harus valid dan jelas.
  - Terdapat fitur pelacakan lokasi yang terhubung dengan Google Maps untuk memastikan keakuratan lokasi absen.
  
  ✅ Hanya karyawan lapangan yang melakukan absen online di lokasi kerja yang dapat disetujui.
  🚫 Tidak boleh menyetujui presensi yang lokasinya jauh dari lokasi kerja yang ditentukan atau foto yang tidak sesuai.`,
  

    "Kelola Presensi Karyawan": `Menu ini berfungsi untuk melihat dan memantau kehadiran semua karyawan setiap hari, baik karyawan kantor maupun teknisi lapangan.
  Fitur yang tersedia di antaranya:
  - Jam masuk kerja
  - Jam pulang kerja
  - Keterlambatan (late)
  - Lembur (overtime)
  - Rekapitulasi data presensi
  
  ✅ Digunakan oleh HRD untuk kebutuhan pencatatan presensi karyawan.
  🚫 Tidak boleh mengubah data presensi tanpa alasan yang sah dan bukti pendukung.`,
  

    "Surat Dinas": `Menu ini mengelola pengajuan dan persetujuan surat dinas dari karyawan yang mendapat tugas keluar kantor (dinas luar).
  Fitur meliputi:
  - Pengajuan surat dinas
  - Persetujuan dari atasan
  - Riwayat surat dinas
  
  ✅ diperuntukan digunakan oleh karyawan kantor yang ingin bekerja di luar kantor.
  🚫 Tidak boleh digunakan untuk kegiatan di luar kepentingan kerja.`,
  
    "Penggajian": `Menu ini digunakan untuk menghitung dan mengelola gaji karyawan berdasarkan data:
  - Kehadiran (presensi)
  - Keterlambatan
  - Lembur
  
  Terdapat juga fitur:
  - Melihat detail per karyawan
  - Rekapitulasi keseluruhan data presensi karyawan
  
  ✅ Digunakan oleh HRD untuk kebutuhan pencatatan gaji.
  🚫 Tidak boleh memproses gaji sebelum data presensi dan lembur disetujui terlebih dahulu.`,
  
    "Persetujuan Lembur": `Menu ini menampilkan daftar formulir lembur yang diajukan oleh karyawan teknisi lapangan.
  Fitur:
  - Melihat detail pengajuan lembur
  - Menyetujui atau menolak pengajuan
  - Terkoneksi dengan sistem penggajian
  
  ✅ Hanya kepala divisi atau atasan yang berwenang menyetujui.
  🚫 Jangan menyetujui lembur tanpa adanya bukti pekerjaan tambahan yang jelas.
    `,
  
    "Data Lokasi Presensi": `Menu ini digunakan untuk mengelola titik-titik lokasi absensi untuk teknisi lapangan.
  Fitur:
  - Menambah, mengedit, atau menghapus lokasi presensi
  - Menentukan radius validasi presensi
  - Sinkronisasi dengan Google Maps
  
  ✅ Digunakan oleh admin atau kepala divisi untuk menentukan titik lokasi presensi.
  🚫 Tidak boleh membuat lokasi fiktif atau tidak sesuai kenyataan dan usahakan titik koordinat lokasinya akurat.`,
  
    "Karyawan": `Menu ini berisi seluruh data karyawan perusahaan.
  Fitur:
  - Tambah, edit, dan hapus data karyawan
  - Menentukan divisi, shift, perusahaan tempat bekerja, dan informasi kontak
  - jika ingin menambahkan shift pada karyawan di perusahaan baru, maka harus menambahkan shift terlebih dahulu di menu kelola perusahaan
  
  ✅ Digunakan oleh HRD untuk kebutuhan pencatatan data karyawan.
  🚫 Jangan sampai data karyawan kosong atau tidak diisi lengkap.`,
  
    "Divisi": `Menu ini digunakan untuk mengelola struktur organisasi di dalam perusahaan.
  Fitur:
  - Menambah dan mengatur nama divisi
  - Menentukan peran dan tanggung jawab divisi
  
  ✅ Wajib diatur sebelum mengelola data karyawan.
  🚫 Tidak boleh menghapus divisi yang masih terpakai oleh karyawan aktif.`,
  
    "Shift": `Menu ini mengatur jadwal kerja atau jam kerja karyawan, baik teknisi lapangan maupun karyawan kantor.
  Fitur:
  - Menentukan jam masuk, jam keluar, dan aturan kerja per shift
  - Setiap shift bisa digunakan oleh lebih dari satu karyawan
  - Setiap shift bisa digunakan oleh lebih dari satu perusahaan
  
  ✅ Harus dipasangkan dengan karyawan saat data karyawan diinput.
  🚫 Jangan buat shift tanpa waktu kerja yang jelas. Data shift tidak bisa diubah atau dihapus karena sangat krusial untuk pencatatan presensi dan menghitung keterlambatan dan lembur.
    `,
  
    "Perusahaan": `Menu ini mengelola data perusahaan dan untuk ditambahkan pada karyawan yang bekerja di masing-masing perusahaan.
  Fitur:
  - Menambah dan mengedit nama perusahaan
  - Menentukan daftar shift yang berlaku di perusahaan tersebut
  
  ✅ Wajib diisi sebelum menambahkan karyawan.
  🚫 Tidak boleh membuat perusahaan tanpa informasi yang lengkap dan valid.`
  };
  
  const filteredCards = roleId !== null ? allCards.filter((card) => card.roles.includes(roleId)) : [];

  const DashboardCard = ({ title, icon, color = "text-green-600", onClick }) => (
    <div onClick={onClick} className="group relative flex flex-col justify-between p-5 bg-white rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-green-300/50 hover:-translate-y-1">
      {/* Tombol Info */}
      <button onClick={(e) => { e.stopPropagation(); setInfoTitle(title);  setInfoContent(cardInfo[title] || "Informasi belum tersedia."); setShowInfoModal(true);}} className="absolute top-2 right-2 text-blue-400 hover:text-blue-500">
        <FontAwesomeIcon icon={faCircleInfo} className="text-xl" />
      </button>

      {/* Ikon */}
      <div className="relative w-14 h-14 mx-auto flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full bg-white shadow-inner border border-gray-100 group-hover:scale-95" />
        <FontAwesomeIcon icon={icon} className={`relative z-10 text-2xl ${color} group-hover:scale-125 group-hover:rotate-[6deg]`} />
      </div>
      {/* Teks */}
      <div className="text-center">
        <p className="text-sm sm:text-base font-semibold text-gray-700 group-hover:text-green-700 tracking-wide line-clamp-2">
          {title}
        </p>
      </div>
    </div>
  );
  
  return (
    <div className="flex bg-gray-100">
      <div className="flex-1 bg-white rounded-lg transition-all duration-300 ease-in-out">
      <div className="relative overflow-hidden p-4 sm:p-10 rounded-2xl shadow-xl border border-white/20 bg-gradient-to-br from-green-600 to-green-500 text-white duration-300 hover:shadow-xl group">
        {/* Glow Ambient */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />

        {/* GIF Kucing di kanan bawah */}
        <div className="absolute bottom-2 right-4 w-20 sm:w-32 opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none z-0">
          <img src="https://i.pinimg.com/originals/5f/93/49/5f934966a1d20bae1909c9ef2278bd4c.gif" alt="Kucing lucu" className="w-full h-auto object-contain"/>
        </div>

        {/* Konten */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6">
          {/* Profil & Waktu */}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-sm sm:text-base font-medium text-white/80 tracking-wide">
              Selamat Datang,
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md capitalize">
              {profile.nama || "User"}
            </h3>
            <p className="text-white/80 text-xs sm:text-lg font-semibold mt-1">
              {localTime}
            </p>
          </div>

          {/* Role */}
          <div className="text-sm sm:text-base font-semibold text-white/90 sm:text-right">
            <span className="inline-block bg-white/20 px-4 py-1 rounded-full shadow-sm tracking-wide">
              {profile.role || "-"}
            </span>
          </div>
        </div>
      </div>

        <div className="mt-6">
          {filteredCards.length === 0 ? (
            <p className="text-center text-gray-400">Tidak ada data yang ditampilkan untuk role ini.</p>
          ) : (
            <div className={`grid grid-cols-2 ${filteredCards.length > 2 ? "md:grid-cols-4" : "md:grid-cols-2"} gap-4`}>
              {filteredCards.map((card, index) => (
                <DashboardCard key={index} title={card.title} count={card.count} icon={card.icon} color={card.color} onClick={() => handleCardClick(card.link)}/>
              ))}
            </div>
          )}
        </div>

        {showInfoModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-2xl rounded-xl shadow-2xl overflow-hidden relative">
              
              {/* Header Section */}
              <div className="flex items-center justify-between px-6 py-4 bg-green-500 border-b border-gray-200">
                <h2 className="text-xl font-bold text-white">Informasi Menu</h2>
                <button className="text-white hover:text-red-500 transition-colors" onClick={() => setShowInfoModal(false)} aria-label="Tutup">
                  <FontAwesomeIcon icon={faTimes} className="text-3xl" />
                </button>
              </div>

              {/* Konten */}
              <div className="px-6 pb-7 pt-5 space-y-2">
                <h3 className="text-base sm:text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                  {infoTitle}
                </h3>
                
                {/* Wrapper untuk teks dengan scroll jika tinggi melebihi batas */}
                <div className="max-h-80 overflow-y-auto scrollbar-green pr-1">
                  <p className="text-xs sm:text-base text-gray-700 leading-relaxed whitespace-pre-line tracking-wide">
                    {infoContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeDesktop;
