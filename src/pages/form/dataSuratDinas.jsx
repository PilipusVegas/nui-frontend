import React, { useEffect, useState } from 'react';
import {
  faCheck,
  faArrowLeft,
  faEye,
  faClock,
  faUser,
  faInfoCircle,
  faMapMarkerAlt,
  faTimes,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const SuratDinas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/surat-dinas`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Gagal memuat data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const formatTanggal = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatStatus = (status) => {
    return status === 1
      ? { label: 'Sudah di-ACC', color: 'bg-green-100 text-green-800' }
      : { label: 'Belum di-ACC', color: 'bg-yellow-100 text-yellow-800' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-green-600 font-semibold">
        Memuat data surat dinas...
      </div>
    );
  }

  const handleDetail = (item) => {
    navigate(`/surat-dinas/${item.id}`);
  };

  return (
    <div className="w-full mx-auto p-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-green-700 mb-4"></h2>
      <div className="flex items-center mb-4">
        <FontAwesomeIcon
          icon={faArrowLeft}
          title="Back to Home"
          onClick={handleBackClick}
          className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
        />
        <h1 className="text-xl sm:text-3xl font-bold text-gray-800 pb-1">Data Surat Dinas Keluar Kantor</h1>
      </div>

      {/* Catatan */}
      <div className="mb-4 bg-green-50 border-l-4 border-green-600 text-green-700 p-4 rounded">
        <p className="text-sm">
          <strong>Catatan:</strong> Surat dinas di atas telah terkirim ke Kepala Divisi masing-masing dan mereka sudah mengetahuinya.
        </p>
      </div>

      {/* Tampilan Desktop (Tabel) */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-md border border-green-600">
      <table className="min-w-full bg-white text-sm text-left">
  <thead className="bg-green-600 text-white">
    <tr>
      <th className="px-6 py-2 text-center">Tanggal</th>
      <th className="px-6 py-2 text-center">Nama</th>
      <th className="px-6 py-2 text-center">Divisi</th>
      <th className="px-6 py-2 text-center">Berangkat Jam</th>
      <th className="px-6 py-2 text-center">Status</th>
      <th className="px-6 py-2 text-center">Menu</th>
    </tr>
  </thead>
  <tbody>
    {data.map((item, index) => {
      const statusInfo = formatStatus(item.status);
      return (
        <tr key={item.id || index} className="border-b hover:bg-green-50">
          <td className="px-6 py-2 text-center">{formatTanggal(item.tgl)}</td>
          <td className="px-6 py-2 text-center capitalize">{item.nama}</td>
          <td className="px-6 py-2 text-center">{item.divisi}</td>
          <td className="px-6 py-2 text-center">{item.waktu}</td>
          <td className="px-6 py-2 text-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </td>
          <td className="px-6 py-2 text-center">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
              onClick={() => handleDetail(item)} // Pastikan fungsi handleDetail tersedia
            >
              <FontAwesomeIcon icon={faEye} className='mr-2' />
              Detail
            </button>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

      </div>

      {/* Tampilan Mobile (Card) */}
      <div className="block md:hidden space-y-4">
        {data.map((item, index) => {
          const statusInfo = formatStatus(item.status);
          return (
            <div key={item.id || index} className="border rounded-xl shadow p-4 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-green-700">-{item.nama}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p><strong>Divisi:</strong> {item.divisi}</p>
              <p><strong>Tanggal:</strong> {formatTanggal(item.tgl)}</p>
              <p><strong>Jadwal:</strong> {item.jadwal}</p>
              <p><strong>Berangkat:</strong> {item.waktu}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuratDinas;
