import React, { useEffect, useState } from 'react';
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faSearch, faList } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const RiwayatAbsensi = () => {
  const [absensi, setAbsensi] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAbsensi, setFilteredAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();


  useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        const response = await fetch(`${apiUrl}/absen/riwayat/12`);
        const data = await response.json();
        setAbsensi(data);
        setFilteredAbsensi(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching absensi data:', error);
        setLoading(false);
      }
    };

    fetchAbsensi();
  }, []);

  const formatDateTime = (dateTime) => {
    try {
      const options = {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      };
      return new Date(dateTime).toLocaleString('id-ID', options);
    } catch (error) {
      return '';
    }
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

  if (loading) {
    return (
      <MobileLayout title="Riwayat Absensi" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
        <div className="container mx-auto py-6 text-center">
          <div className="spinner-border animate-spin text-green-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </MobileLayout>
    );
  }

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
            className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
            placeholder="Cari Nama, Lokasi, atau Tanggal"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-[0px_3px_5px_-1px_rgba(0,0,0,0.2),0px_-3px_5px_-1px_rgba(0,0,0,0.1)]">
          <div className="space-y-4">
            {/* Nama dan Role */}
            {absensi.length > 0 && (
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-green-900">{absensi[0].nama_user}</h2>
                <p className="text-sm text-gray-600">{absensi[0].role}</p>
                <div className="border-t border-green-900 mt-4"></div>
                <p className="text-xs text-gray-500 mt-2">Total Riwayat Absen: {absensi.length}</p>
              </div>
            )}

            {/* Riwayat Absensi */}
            <div className="max-h-[370px] overflow-y-auto px-1 pt-2">
              {filteredAbsensi.length > 0 ? (
                filteredAbsensi.map((item, index) => (
                  <div key={item.id_absen} className="rounded-lg text-xs mb-4">
                    {/* Index berdasarkan data asli */}
                    <div className="px-3 bg-green-900 text-white font-bold text-xs rounded-sm inline-block mb-2">
                      <span>{absensi.findIndex((originalItem) => originalItem.id_absen === item.id_absen) + 1}</span>
                    </div>

                    {/* Lokasi */}
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Lokasi:</span>
                      <span>{item.lokasi_absen}</span>
                    </div>

                    {/* Absen Masuk */}
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Absen Masuk:</span>
                      <span>{formatDateTime(item.jam_mulai)}</span>
                    </div>

                    {/* Absen Keluar */}
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Absen Keluar:</span>
                      <span 
                        className={item.jam_selesai ? "" : "text-red-500 font-semibold"}
                      >
                        {item.jam_selesai ? formatDateTime(item.jam_selesai) : "Jangan Lupa Absen pulang"}
                      </span>
                    </div>


                    {/* Divider */}
                    <div className="border-t border-green-900 mt-4"></div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-600">
                  <FontAwesomeIcon icon={faList} className="text-gray-400 text-2xl mb-2" />
                  <p>Data tidak ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default RiwayatAbsensi;
