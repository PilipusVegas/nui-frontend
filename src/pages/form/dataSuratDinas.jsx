import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEye,
  faCheck,
  faSearch,
  faArrowRight,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const SuratDinas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const roleId = parseInt(localStorage.getItem("roleId"));
  const navigate = useNavigate();

  const handleApprove = async (item) => {
    try {
      const response = await fetch(`${apiUrl}/surat-dinas/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: 1 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setData((prevData) =>
        prevData.map((dataItem) =>
          dataItem.id === item.id ? { ...dataItem, status: 1 } : dataItem
        )
      );
      setFilteredData((prevData) =>
        prevData.map((dataItem) =>
          dataItem.id === item.id ? { ...dataItem, status: 1 } : dataItem
        )
      );
    } catch (error) {
      console.error("Gagal menyetujui surat dinas:", error);
      alert("Terjadi kesalahan saat menyetujui surat dinas.");
    }
  };

  useEffect(() => {
    const filtered = data.filter((item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  useEffect(() => {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    fetchData(defaultStart, defaultEnd);
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
      fetchData(startDate, endDate);
    }
  }, [startDate, endDate]);
  

  const handleBackClick = () => {
    navigate(-1);
  };
  

  const formatTanggal = (isoDate) => {
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); 
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatStatus = (status) => {
    return status === 1
      ? { label: "Approved", color: "bg-green-600 text-white" }
      : { label: "Unapproved", color: "bg-gray-400 text-white" };
  };

  const handleDetail = (item) => {
    navigate(`/surat-dinas/${item.id}`);
  };

  const getDefaultDateRange = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 22); 
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 21); 
    const format = (date) => date.toISOString().split("T")[0]; 
    return {
      startDate: format(start),
      endDate: format(end),
    };
  };
  

  return (
    <div className="w-full mx-auto p-7">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        {/* Tombol Back & Judul */}
        <div className="flex items-center gap-3">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Kembali"
            onClick={handleBackClick}
            className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-md"
          />
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800">
            Data Surat Dinas Keluar Kantor
          </h1>
        </div>

        {/* Filter Rentang Tanggal */}
        <div className="flex flex-wrap items-end gap-3 text-sm text-gray-700">
          <div className="flex flex-col">
            <label htmlFor="start-date" className="mb-1 font-medium">
              Dari Tanggal
            </label>
            <input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
          </div>

          <div className="flex items-end pb-5 sm:pb-2">
            <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 h-5 w-5" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="end-date" className="mb-1 font-medium">
              Sampai Tanggal
            </label>
            <input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
        {/* Catatan kiri */}
        <div className="text-gray-700 text-[10px] sm:text-base font-medium bg-green-50 border-l-4 border-green-400 px-3 py-2 rounded shadow-sm">
          Catatan: Sistem akan mengirimkan surat dinas ini langsung kepada Kepala Divisi untuk
          ditinjau dan disetujui sesuai prosedur.
        </div>

        {/* Input Search kanan */}
        <div className="relative w-full sm:w-1/4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input type="text" placeholder="Cari nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"/>
        </div>
      </div>

      {!startDate || !endDate ? (
  <div className="flex items-center justify-center">
    <div className="text-center w-full text-yellow-700 bg-yellow-100 p-4 rounded-lg border border-yellow-300">
      <div className="text-3xl mb-2">
        <FontAwesomeIcon icon={faCalendarAlt} />
      </div>
      <div>
        Silakan pilih rentang tanggal terlebih dahulu untuk menampilkan data.
      </div>
    </div>
  </div>
      ) : (
        <>
          {/* Tabel Desktop */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full bg-white text-sm text-left">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-6 py-1 text-center">Tanggal</th>
                  <th className="px-6 py-1 text-center">Nama Karyawan</th>
                  {/* <th className="px-6 py-1 text-center">Divisi</th> */}
                  <th className="px-6 py-1 text-center">Jam Berangkat</th>
                  <th className="px-6 py-1 text-center">Status</th>
                  <th className="px-6 py-1 text-center">Menu</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-6xl mb-2 text-gray-400" />
                      <div className="mt-2 text-lg font-semibold">Tidak ada data surat dinas pada rentang tanggal ini.</div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => {
                    const statusInfo = formatStatus(item.status);
                    return (
                      <tr key={item.id || index} className="border-b hover:bg-green-50">
                        <td className="px-6 py-1 text-sm text-center">{formatTanggal(item.tgl)}</td>
                        <td className="px-6 py-1 text-left align-top">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium capitalize">{item.nama || "-"}</span>
                            <span className="text-[10px] text-gray-500 capitalize">{item.divisi || "-"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-1 text-sm text-center">{item.waktu || "-"}</td>
                        <td className="px-6 py-1 text-sm text-center">
                          <span className={`px-3 pb-0.5 rounded-full text-xs ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-1 text-sm text-center">
                          {item.status === 0 && roleId === 5 && (
                            <>
                              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs mr-2" onClick={() => handleApprove(item)}>
                                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                Setujui
                              </button>
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs" onClick={() => handleDetail(item)}>
                                <FontAwesomeIcon icon={faEye} className="mr-2" />
                                Detail
                              </button>
                            </>
                          )}
                          {item.status === 1 && (
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs" onClick={() => handleDetail(item)}>
                              <FontAwesomeIcon icon={faEye} className="mr-2" />
                              Detail
                            </button>
                          )}
                          {item.status === 0 && roleId !== 5 && (
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs" onClick={() => handleDetail(item)}>
                              <FontAwesomeIcon icon={faEye} className="mr-2" />
                              Detail
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Card Mobile */}
          <div className="block md:hidden space-y-3">
            {filteredData.map((item, index) => {
              const statusInfo = formatStatus(item.status);
              return (
                <div key={item.id || index} className="rounded-2xl border border-gray-100 shadow p-4 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.nama}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Tanggal</span>
                      <span>{formatTanggal(item.tgl)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jam</span>
                      <span>{item.waktu}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Keterangan</span>
                      <span>{item.jadwal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Divisi</span>
                      <span>{item.divisi}</span>
                    </div>
                  </div>

                  {item.status === 0 && roleId === 5 && (
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => handleApprove(item)} className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs transition">
                        <FontAwesomeIcon icon={faCheck} className="mr-1" />
                        Setujui
                      </button>
                      <button onClick={() => handleDetail(item)} className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs transition">
                        <FontAwesomeIcon icon={faEye} className="mr-1" />
                        Detail
                      </button>
                    </div>
                  )}
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
