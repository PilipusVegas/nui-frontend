import React, { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const RiwayatAbsensi = () => {
  const [absensi, setAbsensi] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupedAbsensi, setGroupedAbsensi] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const id_user = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAbsensi = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/absen/riwayat/${id_user}`);
        if (!response.ok) {
          throw new Error("Gagal memuat data absensi.");
        }
        const data = await response.json();

        // Sort data by jam_mulai descending
        const sortedData = data.sort((a, b) => new Date(b.jam_mulai) - new Date(a.jam_mulai));

        // Group data by tags
        const groupedData = sortedData.reduce((acc, item) => {
          const tag = determineTag(item.jam_mulai);
          if (!acc[tag]) acc[tag] = [];
          acc[tag].push(item);
          return acc;
        }, {});

        setAbsensi(sortedData);
        setGroupedAbsensi(groupedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsensi();
  }, [id_user]);

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

  const determineTag = (jamMulai) => {
    const now = new Date();
    const date = new Date(jamMulai);

    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateToCompare = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = Math.floor((nowDate - dateToCompare) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays === 2) return "Lusa";
    return "Sudah Lama";
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = absensi.filter((item) => {
      const nameMatch = item.nama_user.toLowerCase().includes(query);
      const locationMatch = item.lokasi_absen.toLowerCase().includes(query);
      const dateMatch = formatDateTime(item.jam_mulai).toLowerCase().includes(query);
      return nameMatch || locationMatch || dateMatch;
    });

    const groupedData = filtered.reduce((acc, item) => {
      const tag = determineTag(item.jam_mulai);
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(item);
      return acc;
    }, {});

    setGroupedAbsensi(groupedData);
  };

  return (
    <MobileLayout title="Riwayat Absensi" onClick={() => navigate("/home")} className="p-6 bg-gray-100">
      <div className="container mx-auto py-2">
        {/* Card Utama */}
        <div className="bg-white px-5 py-5 rounded-lg shadow-lg">
          {/* Header: Nama, Role, dan Total Riwayat */}
          {absensi.length > 0 && (
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-green-900">{absensi[0].nama_user}</h2>
              <p className="text-sm text-gray-600">{absensi[0].role}</p>
              <div className="border-t border-green-900 mt-4"></div>
              <p className="text-xs text-gray-500 mt-2">Total Riwayat Absen: {absensi.length}</p>
            </div>
          )}

          {/* Input Pencarian */}
          <div className="mb-4 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 px-2 py-1 border border-green-300 rounded-lg"
              placeholder="Cari Riwayat Absensi..."
            />
          </div>

          {/* Data Riwayat Absensi */}
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
              Object.keys(groupedAbsensi).map((tag) => (
                <div key={tag} className="mb-6">
                  {/* Tag Header */}
                  <div className="sticky top-[-10px] bg-gray-100 py-1 text-center z-10 bg-green-100 rounded-md">
                    <div className="text-sm text-green-700 font-semibold">
                      <FontAwesomeIcon icon={faCalendarCheck} className="text-green-700 mr-2" />
                      {tag}
                    </div>
                  </div>
                  {/* Data Content */}
                  {groupedAbsensi[tag].map((item) => (
                    <div key={item.id_absen} className="rounded-lg text-xs my-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Lokasi:</span>
                        <span>{item.lokasi_absen}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Absen Masuk:</span>
                        <span>{formatDateTime(item.jam_mulai)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Absen Keluar:</span>
                        <span className={item.jam_selesai ? "" : "text-red-500 font-semibold"}>
                          {item.jam_selesai ? formatDateTime(item.jam_selesai) : "Jangan Lupa Absen Pulang"}
                        </span>
                      </div>
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

export default RiwayatAbsensi;
