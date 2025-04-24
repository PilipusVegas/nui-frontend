import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEye, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const SuratDinas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const filtered = data.filter((item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  useEffect(() => {
    const savedMulai = sessionStorage.getItem("suratmulai");
    const savedSelesai = sessionStorage.getItem("suratselesai");

    if (savedMulai && savedSelesai) {
      setStartDate(savedMulai);
      setEndDate(savedSelesai);
      fetchData(savedMulai, savedSelesai);
    }
  }, []);

  const fetchData = async (start = "", end = "") => {
    setLoading(true);
    try {
      const query = start && end ? `?startDate=${start}&endDate=${end}` : "";
      const res = await fetch(`${apiUrl}/surat-dinas${query}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();
      setData(result);
      setFilteredData(result);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      sessionStorage.setItem("suratmulai", startDate);
      sessionStorage.setItem("suratselesai", endDate);
      fetchData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const savedStart = localStorage.getItem("suratDinasStartDate");
    const savedEnd = localStorage.getItem("suratDinasEndDate");

    if (savedStart && savedEnd) {
      setStartDate(savedStart);
      setEndDate(savedEnd);
      fetchData(savedStart, savedEnd);
    }
  }, []);

  const formatTanggal = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    return status === 1
      ? { label: "Sudah di-ACC", color: "bg-green-100 text-green-800" }
      : { label: "Belum di-ACC", color: "bg-yellow-100 text-yellow-800" };
  };

  const handleDetail = (item) => {
    navigate(`/surat-dinas/${item.id}`);
  };

  return (
    <div className="w-full mx-auto p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-2 md:space-y-0">
        {/* Tombol Back */}
        <FontAwesomeIcon
          icon={faArrowLeft}
          title="Back to Home"
          onClick={handleBackClick}
          className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
        />

        {/* Judul */}
        <h1 className="text-xl sm:text-3xl font-bold text-gray-800  flex-1">
          Data Surat Dinas Keluar Kantor
        </h1>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              const value = e.target.value;
              setStartDate(value);
              sessionStorage.setItem("suratmulai", value); // simpan ke session
            }}
            className="p-2 border border-gray-300 rounded"
          />

          <span className="text-2xl">↔</span>

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              const value = e.target.value;
              setEndDate(value);
              sessionStorage.setItem("suratselesai", value); // simpan ke session
            }}
            className="p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
        {/* Catatan kiri */}
        <div className="text-gray-700 text-sm sm:text-base font-medium bg-green-50 border-l-4 border-green-400 px-3 py-2 rounded shadow-sm">
          Catatan: Surat dinas ini akan otomatis diteruskan ke KADIV masing-masing divisi untuk di
          ACC.
        </div>

        {/* Input Search kanan */}
        <div className="relative w-full sm:w-1/4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            placeholder="Cari nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
          />
        </div>
      </div>

      {!startDate || !endDate ? (
        <div className="text-center text-yellow-700 bg-yellow-100 p-4 rounded-lg mt-4 border border-yellow-300">
          Silakan pilih rentang tanggal terlebih dahulu untuk menampilkan data.
        </div>
      ) : (
        <>
          {/* Tabel Desktop */}
          <div className="hidden md:block overflow-x-auto rounded-xl shadow-md border border-green-600">
            <table className="min-w-full bg-white text-sm text-left">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-6 py-2 text-center">Tanggal</th>
                  <th className="px-6 py-2 text-center">Nama</th>
                  <th className="px-6 py-2 text-center">Divisi</th>
                  <th className="px-6 py-2 text-center">Jam Berangkat</th>
                  <th className="px-6 py-2 text-center">Status</th>
                  <th className="px-6 py-2 text-center">Menu</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const statusInfo = formatStatus(item.status);
                  return (
                    <tr key={item.id || index} className="border-b hover:bg-green-50">
                      <td className="px-6 py-2 text-center">{formatTanggal(item.tgl)}</td>
                      <td className="px-6 py-2 text-center capitalize">{item.nama}</td>
                      <td className="px-6 py-2 text-center">{item.divisi}</td>
                      <td className="px-6 py-2 text-center">{item.waktu}</td>
                      <td className="px-6 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-center">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                          onClick={() => handleDetail(item)}
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-2" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Card Mobile */}
          <div className="block md:hidden space-y-4">
            {filteredData.map((item, index) => {
              const statusInfo = formatStatus(item.status);
              return (
                <div key={item.id || index} className="border rounded-xl shadow p-4 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-green-700">-{item.nama}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p>
                    <strong>Divisi:</strong> {item.divisi}
                  </p>
                  <p>
                    <strong>Tanggal:</strong> {formatTanggal(item.tgl)}
                  </p>
                  <p>
                    <strong>Jadwal:</strong> {item.jadwal}
                  </p>
                  <p>
                    <strong>Berangkat:</strong> {item.waktu}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SuratDinas;
