import React, { useEffect, useState } from 'react';
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faSearch, faList, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const RiwayatAbsensi = () => {
  const [absensi, setAbsensi] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAbsensi, setFilteredAbsensi] = useState([]);
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
          throw new Error('Gagal memuat data absensi.');
        }
        const data = await response.json();
        setAbsensi(data);
        setFilteredAbsensi(data);
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
      weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    };
    return new Date(dateTime).toLocaleString('id-ID', options);
  };

  const determineTag = (jamMulai) => {
    const now = new Date();
    const date = new Date(jamMulai);
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Hari ini";
    if (diff === 1) return "Kemarin";
    if (diff === 2) return "Lusa";
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

    setFilteredAbsensi(filtered);
  };

  return (
    <MobileLayout title="Riwayat Absensi" onClick={() => navigate("/home")} className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div className="container mx-auto py-2">
        <div className="mb-2 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 p-1 border border-gray-300 rounded-lg"
            placeholder="Cari Riwayat Absensi..."
          />
        </div>

        <div className="bg-white px-5 py-5 rounded-lg shadow">
  {absensi.length > 0 && (
    <div className="text-center mb-4">
      <h2 className="text-xl font-semibold text-green-900">{absensi[0].nama_user}</h2>
      <p className="text-sm text-gray-600">{absensi[0].role}</p>
      <div className="border-t border-green-900 mt-4"></div>
      <p className="text-xs text-gray-500 mt-2">Total Riwayat Absen: {absensi.length}</p>
    </div>
  )}

  <div className="max-h-[370px] overflow-y-auto pt-2 relative">
    {loading ? (
      <div className="text-center py-4">
        <div className="spinner-border animate-spin text-green-500" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="text-sm text-gray-600">Memuat data, harap tunggu...</p>
      </div>
    ) : error ? (
      <div className="text-center py-4 text-red-500">
        <FontAwesomeIcon icon={faList} className="text-red-400 text-2xl mb-2" />
        <p>{error}</p>
      </div>
    ) : filteredAbsensi.length > 0 ? (
      filteredAbsensi.map((item, index) => {
        // Determine the tag
        const currentTag = determineTag(item.jam_mulai);
        
        return (
          <div key={item.id_absen} className="rounded-lg text-xs mb-4">
            {/* Determine Tag */}
            {(index === 0 || currentTag !== determineTag(filteredAbsensi[index - 1].jam_mulai)) && (
              <div className="sticky top-[-1px] bg-white py-1 text-center z-10 border-b border-green-100">
                <div className="text-sm text-green-700 font-semibold">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-green-700 mr-2" />
                  {currentTag}
                </div>
              </div>
            )}

            <div className="px-3 bg-green-900 text-white font-bold text-xs rounded-sm inline-block mb-2">
              <span>{index + 1}</span>
            </div>
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
                {item.jam_selesai ? formatDateTime(item.jam_selesai) : "Jangan Lupa Absen pulang"}
              </span>
            </div>
            <div className="border-t border-green-900 mt-4"></div>
          </div>
        );
      })
    ) : (
      <div className="text-center text-gray-600">
        <FontAwesomeIcon icon={faList} className="text-gray-400 text-2xl mb-2" />
        <p>Data tidak ditemukan</p>
      </div>
    )}
  </div>
</div>

      </div>
    </MobileLayout>
  );
};

export default RiwayatAbsensi;
