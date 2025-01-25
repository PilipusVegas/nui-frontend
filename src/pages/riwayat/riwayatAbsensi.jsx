import React, { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendarCheck,
  faClock,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Riwayat = () => {
  const [activeTab, setActiveTab] = useState("absensi");
  const [absensi, setAbsensi] = useState([]);
  const [lembur, setLembur] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const id_user = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mengambil data dari kedua API secara bersamaan
        const [absensiRes, lemburRes] = await Promise.all([
          fetch(`${apiUrl}/absen/riwayat/${id_user}`),
          fetch(`${apiUrl}/lembur/riwayat/${id_user}`),
        ]);
  
        // Mengecek apakah salah satu API gagal
        if (!absensiRes.ok && !lemburRes.ok) throw new Error("Gagal memuat data.");
  
        // Mengambil data JSON dari API yang berhasil
        const absensiData = absensiRes.ok ? await absensiRes.json() : [];
        const lemburData = lemburRes.ok ? await lemburRes.json() : [];
  
        console.log("Absensi Data:", absensiData); // Debug data API
        console.log("Lembur Data:", lemburData);
  
        // Cek apakah ada data dari absensi atau lembur
        if (absensiData.length > 0) {
          const sortedAbsensi = absensiData.sort(
            (a, b) => new Date(b.jam_mulai) - new Date(a.jam_mulai)
          );
          setAbsensi(sortedAbsensi);
          setGroupedData(groupDataByTag(sortedAbsensi, "jam_mulai"));
        } else {
          setAbsensi([]); // Jika tidak ada data absensi, set sebagai array kosong
        }
  
        if (lemburData.length > 0) {
          const sortedLembur = lemburData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
          setLembur(sortedLembur);
        } else {
          setLembur([]); // Jika tidak ada data lembur, set sebagai array kosong
        }
  
        // Jika keduanya kosong, bisa memilih untuk menampilkan error atau pesan lainnya
        if (absensiData.length === 0 && lemburData.length === 0) {
          setError("Data absensi dan lembur tidak ditemukan.");
        }
      } catch (err) {
        console.error(err); // Log error untuk debug
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [apiUrl, id_user]);
  

  const groupDataByTag = (data, dateField) => {
    const now = new Date();
    const tags = { "Hari ini": [], Kemarin: [], Lusa: [], "Sudah Lama": [] };

    data.forEach((item) => {
      const dateValue = item[dateField];
      if (!dateValue) return; // Abaikan jika nilai tanggal tidak valid
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return; // Abaikan tanggal yang tidak valid

      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) tags["Hari ini"].push(item);
      else if (diffDays === 1) tags["Kemarin"].push(item);
      else if (diffDays === 2) tags["Lusa"].push(item);
      else tags["Sudah Lama"].push(item);
    });

    return Object.fromEntries(Object.entries(tags).filter(([, items]) => items.length > 0));
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const currentData = activeTab === "absensi" ? absensi : lembur;

    const filtered = currentData.filter((item) => {
      if (activeTab === "absensi") {
        const nameMatch = item.nama_user?.toLowerCase().includes(query);
        const locationMatch = item.lokasi_absen?.toLowerCase().includes(query);
        const dateMatch = formatDateTime(item.jam_mulai || "")
          .toLowerCase()
          .includes(query);
        return nameMatch || locationMatch || dateMatch;
      } else {
        const nameMatch = item.nama_user?.toLowerCase().includes(query);
        const locationMatch = item.lokasi?.toLowerCase().includes(query);
        const dateMatch = formatDateTime(item.tanggal || "")
          .toLowerCase()
          .includes(query);
        return nameMatch || locationMatch || dateMatch;
      }
    });

    setGroupedData(groupDataByTag(filtered, activeTab === "absensi" ? "jam_mulai" : "tanggal"));
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime || isNaN(new Date(dateTime).getTime())) {
      return "Tanggal tidak valid"; // Validasi jika nilai tanggal tidak valid
    }
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const date = new Date(dateTime);
    return date.toLocaleString("id-ID", options);
  };

  const formatTime = (time) => {
    if (!time) return "Jam tidak valid"; // Validasi jika kosong
    const [hour, minute, second] = time.split(":"); // Pecah string "HH:mm:ss"
    const date = new Date(); // Gunakan tanggal hari ini
    date.setHours(parseInt(hour), parseInt(minute), parseInt(second));
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <MobileLayout title="Riwayat" onClick={() => navigate("/home")} className="p-6 bg-gray-100">
      <div className="container mx-auto py-2">
        {/* Tabs */}
        <div className="flex justify-around border-b border-gray-300 mb-4">
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "absensi"
                ? "border-b-2 border-green-500 text-green-700"
                : "text-gray-600"
            }`}
            onClick={() => {
              setActiveTab("absensi");
              setGroupedData(groupDataByTag(absensi, "jam_mulai"));
            }}
          >
            <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
            Absensi
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "lembur"
                ? "border-b-2 border-green-500 text-green-700"
                : "text-gray-600"
            }`}
            onClick={() => {
              setActiveTab("lembur");
              setGroupedData(groupDataByTag(lembur, "tanggal"));
            }}
          >
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            Lembur
          </button>
        </div>

        {/* Card Utama */}
        <div className="bg-white px-5 py-5 rounded-lg shadow-lg">
          {/* Header */}
          {(absensi.length > 0 || lembur.length > 0) && (
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-green-900">
                {absensi.length > 0
                  ? absensi[0].nama_user
                  : lembur.length > 0
                  ? lembur[0].nama_user
                  : "Tidak Ada Data"}
              </h2>
              <p className="text-sm text-gray-600">
                {absensi.length > 0
                  ? absensi[0].role
                  : lembur.length > 0
                  ? lembur[0].role
                  : "Tidak Ada Role"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Total Riwayat {activeTab === "absensi" ? "Absen" : "Lembur"}:{" "}
                {(activeTab === "absensi" ? absensi : lembur).length}
              </p>
            </div>
          )}

          {/* Input Pencarian */}
          <div className="my-4 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 px-2 py-1 border border-green-300 rounded-lg"
              placeholder={`Cari Riwayat ${activeTab === "absensi" ? "Absensi" : "Lembur"}...`}
            />
          </div>

          {/* Data Riwayat */}
          <div className="max-h-[430px] overflow-y-auto pt-2">
            {loading ? (
              <div className="text-center py-4 animate-pulse">
                <div className="spinner-border text-green-500" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <FontAwesomeIcon
                  color="gray"
                  icon={faSpinner}
                  className="text-5xl mb-2 animate-spin"
                />
                <p className="text-sm text-gray-600">
                  Sabar, ini bukan error tetapi sedang loading
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-gray-500">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl mb-2" />
                <p>{"Data riwayat tidak ditemukan coba cek jaringan anda" || { error }}</p>
              </div>
            ) : Object.keys(groupedData).length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <FontAwesomeIcon icon={faSearch} className="text-4xl mb-4" />
                <p>Data yang Anda cari tidak ditemukan</p>
              </div>
            ) : (
              Object.keys(groupedData).map((tag) => (
                <div key={tag} className="mb-6">
                  {/* Tag Header */}
                  <div className="sticky top-[-10px] bg-gray-100 py-1 text-center z-10 bg-green-100 rounded-md">
                    <div className="text-sm text-green-700 font-semibold">
                      <FontAwesomeIcon icon={faCalendarCheck} className="text-green-700 mr-2" />
                      {tag}
                    </div>
                  </div>
                  {/* Data Content */}
                  {groupedData[tag].map((item) => (
                    <div key={item.id || item.id_absen} className="rounded-lg text-xs my-4">
                      {/* Lokasi */}
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Lokasi:</span>
                        <span>{activeTab === "absensi" ? item.lokasi_absen : item.lokasi}</span>
                      </div>
                      {/* Tanggal atau Absen Masuk */}
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">
                          {activeTab === "absensi" ? "Absen Masuk:" : "Tanggal:"}
                        </span>
                        <span>
                          {activeTab === "absensi"
                            ? formatDateTime(item.jam_mulai)
                            : new Intl.DateTimeFormat("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }).format(new Date(item.tanggal))}
                        </span>
                      </div>
                      {/* Absen Keluar atau Jam Mulai */}
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">
                          {activeTab === "absensi" ? "Absen Keluar:" : "Jam Mulai:"}
                        </span>
                        <span>
                          {activeTab === "absensi"
                            ? item.jam_selesai
                              ? formatDateTime(item.jam_selesai)
                              : "Belum Selesai"
                            : item.jam_mulai
                            ? formatTime(item.jam_mulai)
                            : "Tanggal tidak valid"}
                        </span>
                      </div>
                      {/* Jam Selesai (Lembur) */}
                      {activeTab === "lembur" && (
                        <>
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold">Jam Selesai:</span>
                            <span>{formatTime(item.jam_selesai) || "Belum Selesai"}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold">Status:</span>
                            <span
                              className={`px-2  rounded-full text-white font-semibold text-sm ${
                                item.status === 0
                                  ? "bg-yellow-500"
                                  : item.status === 1
                                  ? "bg-green-500"
                                  : item.status === 2
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                              }`}
                            >
                              {item.status === 0
                                ? "Pending"
                                : item.status === 1
                                ? "Disetujui"
                                : item.status === 2
                                ? "Ditolak"
                                : "Belum Selesai"}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="border-t border-green-900 mt-4 "></div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Riwayat;
