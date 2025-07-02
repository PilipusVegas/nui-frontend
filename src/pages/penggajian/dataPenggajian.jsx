import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch, faEye, faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const DataPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [payrollData, setPayrollData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("now");
  const [historyList, setHistoryList] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [activeUserDetailId, setActiveUserDetailId] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [currentPeriod, setCurrentPeriod] = useState({ startDate: "", endDate: "" });
  const navigate = useNavigate();

  const getCurrentPeriod = () => {
    const now = new Date();
    const start = new Date(
      now.getDate() >= 21 ? now.getFullYear() : now.getFullYear(),
      now.getMonth() + (now.getDate() >= 21 ? 0 : -1), 22);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(21);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const fetchPayrollData = async (startDate, endDate) => {
    try {
      const res = await fetch(`${apiUrl}/payroll?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      return result;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchCurrentPeriodData = async () => {
    const { startDate, endDate } = getCurrentPeriod();
    setCurrentPeriod({ startDate, endDate });
    const data = await fetchPayrollData(startDate, endDate);
    setPayrollData(data);
  };

  const fetchHistoryPeriods = () => {
    const periods = [];
    const now = new Date();
    for (let i = 1; i < 12; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 22);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(21);
      periods.push({
        id: i,
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        data: null,
      });
    }
    setHistoryList(periods);
  };

  const handleToggleDetail = async (userId, startDate, endDate) => {
    if (activeUserDetailId === userId) {
      setActiveUserDetailId(null);
      return;
    }

    setActiveUserDetailId(userId);

    // Jika datanya sudah pernah diambil, jangan ambil lagi
    if (userDetails[userId]) return;

    try {
      const res = await fetch(
        `${apiUrl}/payroll/detail/${userId}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) throw new Error("Gagal memuat detail");
      const result = await res.json();

      // Simpan ke state userDetails
      setUserDetails((prev) => ({
        ...prev,
        [userId]: result,
      }));
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal memuat detail user", "error");
    }
  };

  useEffect(() => {
    if (activeTab === "now") fetchCurrentPeriodData();
    if (activeTab === "history") fetchHistoryPeriods();
  }, [activeTab]);

  const handleExpand = async (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
    if (historyList[index].data) return;

    const updated = [...historyList];
    const data = await fetchPayrollData(historyList[index].startDate, historyList[index].endDate);
    updated[index].data = data;
    setHistoryList(updated);
  };

  const filteredData = (data) =>
    data.filter(
      (item) => !searchQuery || item.nama_user.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleDetailClick = (id_user, startDate, endDate) => {
    const finalStartDate = startDate || currentPeriod.startDate;
    const finalEndDate = endDate || currentPeriod.endDate;

    if (finalStartDate && finalEndDate) {
      // Simpan ke sessionStorage
      sessionStorage.setItem("startDate", finalStartDate);
      sessionStorage.setItem("endDate", finalEndDate);

      const url = `/data-penggajian/${id_user}`;
      navigate(url);
    } else {
      Swal.fire(
        "Error",
        "Pilih rentang tanggal terlebih dahulu untuk melihat detail atau merekap data",
        "error"
      );
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="px-6 pt-4 pb-20 min-h-screen">
      <div className="mb-6">
        {/* Header: Judul dan Tombol Kembali */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon
              icon={faArrowLeft}
              onClick={() => navigate("/home")}
              className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition rounded-full p-3 shadow-lg"
            />
            <h1 className="text-3xl font-bold text-gray-800">Data Penggajian</h1>
          </div>
        </div>

        {/* Tabs dan Search Container */}
        <div className="flex justify-between items-start mt-2 mb-2 flex-wrap gap-3">
          {/* Kumpulan Tombol Tab */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("now")}
              className={`px-4 py-1 rounded-full border border-white shadow-sm  font-medium transition-all 
                ${
                  activeTab === "now"
                    ? "text-xs bg-green-600 text-white"
                    : "text-sm bg-gray-300 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Periode Sekarang
              {activeTab === "now" && (
                <div className="text-[11px] text-white transition-opacity duration-500 ease-in-out opacity-100">
                  <p>
                    {currentPeriod.startDate} - {currentPeriod.endDate}
                  </p>
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-full border border-white shadow-sm text-sm font-medium transition-all 
                ${
                  activeTab === "history"
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Periode 1 Tahun Lalu
            </button>
          </div>

          {/* Search Box */}
          {activeTab === "now" && (
            <div className="relative w-full sm:w-auto sm:min-w-[250px]">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Cari Nama Karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {activeTab === "now" && (
        <div>
          {filteredData(payrollData).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead>
                  <tr className="bg-green-500 text-white">
                    {["No.", "Nama Karyawan", "Total Kehadiran", "Total Lembur", "Menu"].map(
                      (header, index) => (
                        <th
                          key={index}
                          className={`py-1 px-4 text-center font-semibold text-sm uppercase tracking-wider ${
                            index === 0 ? "first:rounded-tl-lg" : ""
                          } ${index === 4 ? "last:rounded-tr-lg" : ""}`}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData(payrollData).map((item, index) => (
                    <tr
                      key={item.id_user}
                      className={`hover:bg-gray-100 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                    >
                      <td className="border-b px-4 py-1 text-xs text-center">{index + 1}</td>
                      <td className="border-b px-4 py-1 text-left align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.nama_user}</span>
                          <span className="text-[10px] text-gray-500">{item.role}</span>
                        </div>
                      </td>
                      <td className="border-b px-4 py-1 text-xs text-center">
                        {item.total_absen} Hari
                      </td>
                      <td className="border-b px-4 py-1 text-xs text-center">
                        {item.total_jam_lembur || "0:00"}
                      </td>
                      <td className="border-b px-4 py-1 text-xs text-center">
                        <button className="text-white hover:bg-blue-600 px-3 py-1 bg-blue-500 rounded text-xs transition" title="Lihat Detail" onClick={() => handleDetailClick(item.id_user)}>
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 py-10">
              <FontAwesomeIcon icon={faSearch} className="text-4xl mb-3 animate-pulse text-gray-400"/>
              <p className="text-sm font-medium">Data pada periode ini belum tersedia</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-2">
          {historyList.map((period, index) => {
            const data = filteredData(period.data || []);
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);

            const formatTanggal = (tanggal) =>
              tanggal.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

            return (
              <div key={period.id} className="border rounded-xl shadow-sm overflow-hidden">
                {/* Header Periode */}
                <div onClick={() => handleExpand(index)} className="bg-white hover:bg-gray-200 p-5 flex justify-between items-center cursor-pointer transition-colors">
                  <span className="font-semibold text-gray-700">
                    Periode {formatTanggal(start)} - {formatTanggal(end)}
                  </span>
                  <FontAwesomeIcon icon={expandedIndex === index ? faChevronUp : faChevronDown} className="text-gray-500"/>
                </div>

                {/* Konten Expand */}
                {expandedIndex === index && (
                  <div className="p-5 bg-white border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">
                        Menampilkan data periode: {formatTanggal(start)} - {formatTanggal(end)}
                      </span>
                      {/* <button
                        onClick={() => data.length > 0 && handlePrint()}
                        disabled={data.length === 0}
                        className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-md transition shadow ${
                          data.length === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        <FontAwesomeIcon icon={faPrint} />
                        Cetak PDF
                      </button> */}
                    </div>

                    {data.length > 0 ? (
                      <div className="space-y-3">
                        {data.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-50 border">
                            {/* Baris Utama */}
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => handleToggleDetail(item.id_user, period.startDate, period.endDate)}>
                              <p className="font-semibold text-gray-800">{item.nama_user}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>
                                  {item.total_absen} Hari | {item.total_jam_lembur || "0:00"} Lembur
                                </span>
                                <FontAwesomeIcon
                                  icon={
                                    activeUserDetailId === item.id_user
                                      ? faChevronUp
                                      : faChevronDown
                                  }
                                  className="text-gray-500"
                                />
                              </div>
                            </div>

                            {activeUserDetailId === item.id_user && (
                              <div className="mt-3 p-3 rounded-md bg-white border text-sm text-gray-700 overflow-x-auto">
                                {userDetails[item.id_user] ? (
                                  <>
                                    <table className="min-w-full text-sm">
                                      <thead className="bg-green-600 text-white">
                                        <tr>
                                          <th className="px-2 py-1 rounded-tl-lg">Tanggal</th>
                                          <th className="border px-2 py-1">Absen Mulai</th>
                                          <th className="border px-2 py-1">Absen Selesai</th>
                                          <th className="border px-2 py-1">Keterlambatan</th>
                                          <th className="border px-2 py-1">Mulai Lembur</th>
                                          <th className="border px-2 py-1">Selesai Lembur</th>
                                          <th className="px-2 py-1 rounded-tr-lg">Total Lembur</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(() => {
                                          // Gabungkan data absen dan lembur berdasarkan tanggal
                                          const merged = {};
                                          userDetails[item.id_user].data.forEach((detail) => {
                                            const tanggal =
                                              detail.tanggal_absen || detail.tanggal_lembur;
                                            if (!merged[tanggal]) {
                                              merged[tanggal] = { ...detail };
                                            } else {
                                              merged[tanggal] = { ...merged[tanggal], ...detail };
                                            }
                                          });

                                          return Object.entries(merged).map(
                                            ([tanggal, data], idx) => (
                                              <tr key={idx} className="hover:bg-gray-50">
                                                <td className="border px-2 py-1">{tanggal}</td>
                                                <td className="border px-2 py-1">
                                                  {data.absen_mulai || "-"}
                                                </td>
                                                <td className="border px-2 py-1">
                                                  {data.absen_selesai || "-"}
                                                </td>
                                                <td className="border px-2 py-1">
                                                  {data.keterlambatan || "-"}
                                                </td>
                                                <td className="border px-2 py-1">
                                                  {data.mulai_lembur || "-"}
                                                </td>
                                                <td className="border px-2 py-1">
                                                  {data.selesai_lembur || "-"}
                                                </td>
                                                <td className="border px-2 py-1">
                                                  {data.lembur || "-"}
                                                </td>
                                              </tr>
                                            )
                                          );
                                        })()}
                                      </tbody>
                                    </table>
                                  </>
                                ) : (
                                  <p className="italic text-gray-500">Memuat detail...</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8">
                        <FontAwesomeIcon icon={faSearch} className="text-4xl mb-3 animate-pulse" />
                        <p className="text-sm font-medium">
                          Data pada periode ini kosong atau tidak ditemukan.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DataPenggajian;