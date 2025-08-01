import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronDown, faChevronUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import {fetchWithJwt} from "../../utils/jwtHelper"

const HistoryPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [historyList, setHistoryList] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [activeUserDetailId, setActiveUserDetailId] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRange, setFilterRange] = useState("1tahun");
  const navigate = useNavigate();

  const fetchPayrollData = async (startDate, endDate) => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/payroll?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchHistoryPeriods = () => {
    const periods = [];
    const now = new Date();
    let range = 12;
    if (filterRange === "6bulan") range = 6;
    else if (filterRange === "5tahun") range = 60;
    for (let i = 1; i <= range; i++) {
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

  const handleExpand = async (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
    if (historyList[index].data) return;
    const updated = [...historyList];
    const data = await fetchPayrollData(updated[index].startDate, updated[index].endDate);
    updated[index].data = data;
    setHistoryList(updated);
  };

  const handleToggleDetail = async (userId, startDate, endDate) => {
    if (activeUserDetailId === userId) {
      setActiveUserDetailId(null);
      return;
    }
    setActiveUserDetailId(userId);
    if (userDetails[userId]) return;
    try {
      const res = await fetchWithJwt(`${apiUrl}/payroll/detail/${userId}?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Gagal memuat detail");
      const result = await res.json();
      setUserDetails((prev) => ({ ...prev, [userId]: result }));
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Gagal memuat detail user", "error");
    }
  };

  const filteredData = (data) =>
    data?.filter((item) => !searchQuery || item.nama_user.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    fetchHistoryPeriods();
  }, [filterRange]);

  const formatTanggal = (tanggal) =>
    tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="px-6 pt-4 pb-20 min-h-screen">
      <div className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          {/* Kiri: Kembali + Judul */}
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faArrowLeft} onClick={() => navigate("/home")} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition rounded-full p-3 shadow-lg"/>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Riwayat Penggajian</h1>
          </div>

          {/* Kanan: Filter */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Tampilkan :</label>
            <select value={filterRange} onChange={(e) => setFilterRange(e.target.value)} className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none">
              <option value="6bulan">6 Bulan Terakhir</option>
              <option value="1tahun">1 Tahun Terakhir</option>
              <option value="5tahun">5 Tahun Terakhir</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {historyList.map((period, index) => {
            const data = filteredData(period.data || []);
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);

            return (
              <div key={period.id} className="border rounded-md shadow-sm overflow-hidden">
                <div onClick={() => handleExpand(index)} className="bg-white hover:bg-gray-200 py-3 px-5 flex justify-between items-center cursor-pointer transition-colors">
                  <span className="font-semibold text-gray-700">
                    Periode {formatTanggal(start)} - {formatTanggal(end)}
                  </span>
                  <FontAwesomeIcon icon={expandedIndex === index ? faChevronUp : faChevronDown} className="text-gray-500" />
                </div>

                {expandedIndex === index && (
                  <div className="p-5 bg-white border-t">
                    {data.length > 0 ? (
                      <div className="space-y-3">
                        {data.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-gray-50 border">
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => handleToggleDetail(item.id_user, period.startDate, period.endDate)}>
                              <p className="font-semibold text-gray-800">{item.nama_user}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>
                                  {item.total_absen} Hari | {item.total_jam_lembur || "0:00"} Lembur
                                </span>
                                <FontAwesomeIcon icon={activeUserDetailId === item.id_user ? faChevronUp : faChevronDown} className="text-gray-500"/>
                              </div>
                            </div>

                            {activeUserDetailId === item.id_user && (
                              <div className="mt-3 p-3 rounded-md bg-white border text-sm text-gray-700 overflow-x-auto">
                                {userDetails[item.id_user] ? (
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
                                        const merged = {};
                                        userDetails[item.id_user].data.forEach((detail) => {
                                          const tanggal = detail.tanggal_absen || detail.tanggal_lembur;
                                          if (!merged[tanggal]) {
                                            merged[tanggal] = { ...detail };
                                          } else {
                                            merged[tanggal] = { ...merged[tanggal], ...detail };
                                          }
                                        });
                                        return Object.entries(merged).map(([tanggal, data], idx) => (
                                          <tr key={idx} className="hover:bg-gray-50">
                                            <td className="border px-2 py-1">{tanggal}</td>
                                            <td className="border px-2 py-1">{data.absen_mulai || "-"}</td>
                                            <td className="border px-2 py-1">{data.absen_selesai || "-"}</td>
                                            <td className="border px-2 py-1">{data.keterlambatan || "-"}</td>
                                            <td className="border px-2 py-1">{data.mulai_lembur || "-"}</td>
                                            <td className="border px-2 py-1">{data.selesai_lembur || "-"}</td>
                                            <td className="border px-2 py-1">{data.lembur || "-"}</td>
                                          </tr>
                                        ));
                                      })()}
                                    </tbody>
                                  </table>
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
                        <p className="text-sm font-medium">Data periode ini kosong atau tidak ditemukan.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryPenggajian;
