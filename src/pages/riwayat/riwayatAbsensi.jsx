import React, { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCalendarCheck, faClock } from "@fortawesome/free-solid-svg-icons";
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
        const [absensiRes, lemburRes] = await Promise.all([
          fetch(`${apiUrl}/absen/riwayat/${id_user}`),
          fetch(`${apiUrl}/lembur/riwayat/${id_user}`),
        ]);
        if (!absensiRes.ok || !lemburRes.ok) throw new Error("Gagal memuat data.");
        const absensiData = await absensiRes.json();
        const lemburData = await lemburRes.json();

        const sortedAbsensi = absensiData.sort(
          (a, b) => new Date(b.jam_mulai) - new Date(a.jam_mulai)
        );
        const sortedLembur = lemburData.sort(
          (a, b) => new Date(b.jam_mulai) - new Date(a.jam_mulai)
        );

        setAbsensi(sortedAbsensi);
        setLembur(sortedLembur);
        setGroupedData(groupDataByTag(sortedAbsensi));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, id_user]);

  const groupDataByTag = (data) => {
    return data.reduce((acc, item) => {
      const tag = determineTag(item.jam_mulai);
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(item);
      return acc;
    }, {});
  };

  const determineTag = (jamMulai) => {
    const now = new Date();
    const date = new Date(jamMulai);
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    return "Sudah Lama";
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  
    const currentData = activeTab === "absensi" ? absensi : lembur;
  
    const filtered = currentData.filter((item) => {
      if (activeTab === "absensi") {
        // Pastikan properti tidak undefined
        const nameMatch = item.nama_user?.toLowerCase().includes(query);
        const locationMatch = item.lokasi_absen?.toLowerCase().includes(query);
        const dateMatch = formatDateTime(item.jam_mulai || "").toLowerCase().includes(query);
        return nameMatch || locationMatch || dateMatch;
      } else {
        // Pastikan properti tidak undefined
        const nameMatch = item.nama_user?.toLowerCase().includes(query);
        const locationMatch = item.lokasi?.toLowerCase().includes(query);
        const dateMatch = formatDateTime(item.tanggal || "").toLowerCase().includes(query);
        return nameMatch || locationMatch || dateMatch;
      }
    });
  
    setGroupedData(groupDataByTag(filtered));
  };
  
  

  const formatDateTime = (dateTime) => {
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
    return new Date(dateTime).toLocaleString("id-ID", options);
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
              setGroupedData(groupDataByTag(absensi));
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
              setGroupedData(groupDataByTag(lembur));
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
    <div className="text-center py-4">
      <div className="spinner-border animate-spin text-green-500" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <p className="text-sm text-gray-600">Memuat data, harap tunggu...</p>
    </div>
  ) : error ? (
    <div className="text-center py-4 text-red-500">
      <p>{error}</p>
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
              <span>
                {activeTab === "absensi" ? item.lokasi_absen : item.lokasi}
              </span>
            </div>
            {/* Tanggal atau Absen Masuk */}
            <div className="flex justify-between mb-2">
              <span className="font-semibold">
                {activeTab === "absensi" ? "Absen Masuk:" : "Tanggal:"}
              </span>
              <span>
                {activeTab === "absensi"
                  ? formatDateTime(item.jam_mulai)
                  : formatDateTime(item.tanggal)}
              </span>
            </div>
            {/* Absen Keluar atau Jam Mulai */}
            <div className="flex justify-between mb-2">
              <span className="font-semibold">
                {activeTab === "absensi" ? "Absen Keluar:" : "Jam Mulai:"}
              </span>
              <span className={item.jam_selesai ? "" : "text-red-500 font-semibold"}>
                {activeTab === "absensi"
                  ? item.jam_selesai
                    ? formatDateTime(item.jam_selesai)
                    : "Belum Selesai"
                  : item.jam_mulai}
              </span>
            </div>
            {/* Jam Selesai (Lembur) */}
            {activeTab === "lembur" && (
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Jam Selesai:</span>
                <span>{item.jam_selesai || "Belum Selesai"}</span>
              </div>
            )}
            <div className="border-t border-green-900 mt-4"></div>
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
