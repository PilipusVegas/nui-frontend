import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { exportRekapPresensi } from "./exportExcel";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { faFolderOpen, faFileDownload, faExpand, faRefresh, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { LoadingSpinner, SectionHeader, EmptyState, ErrorState, SearchBar, Modal } from "../../components/";
import { formatLongDate } from "../../utils/dateUtils";

const DataRekapAbsensi = () => {
  const Navigate = useNavigate();
  const user = getUserFromToken();
  const [error, setError] = useState(null);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState("nama");
  const [dataAbsen, setDataAbsen] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [sortOrder, setSortOrder] = useState("asc");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [tanggalArray, setTanggalArray] = useState([]);
  const canDownloadHRD = [1, 4, 6].includes(user.id_role);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState(false);

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let valA, valB;
      switch (sortKey) {
        case "late":
          valA = a.total_late ?? 0;
          valB = b.total_late ?? 0;
          break;
        case "overtime":
          valA = a.total_overtime ?? 0;
          valB = b.total_overtime ?? 0;
          break;
        case "kehadiran":
          valA = a.total_days ?? 0;
          valB = b.total_days ?? 0;
          break;
        case "alpha":
          valA = a.total_alpha ?? 0;
          valB = b.total_alpha ?? 0;
          break;
        default:
          valA = (a.nama || "").toString().toLowerCase();
          valB = (b.nama || "").toString().toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const fetchAbsenData = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      setLoading(true);
      const endpoint = `${apiUrl}/absen/rekap?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetchWithJwt(endpoint);
      if (!response.ok) throw new Error("Gagal mengambil data absensi.");
      const result = await response.json();
      const tanggal = result.date_range || [];
      const data = result.data || [];
      setTanggalArray(tanggal);
      setDataAbsen(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setDataAbsen([]);
      setTanggalArray([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAbsenData = sortData(
    dataAbsen
      .map(item => ({ ...item, nama: typeof item.nama === "string" ? item.nama : "-" }))
      .filter(item => item.nama.toLowerCase().includes(searchName.toLowerCase()))
  );

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    if (!startDate && !endDate) {
      const { start, end } = getDefaultPeriod();
      setStartDate(start);
      setEndDate(end);
    }
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      setIsDateSelected(true);
      fetchAbsenData();
    }
  }, [startDate, endDate]);

  const dayMeta = (tanggal) => {
    const day = new Date(tanggal).getDay();
    const isSunday = day === 0;
    return {
      isSunday,
      dayName: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][day],
      bg: isSunday ? "bg-red-600" : "bg-green-500",
      border: isSunday ? "border-red-800" : "border-green-600",
    };
  };

  const handleFullView = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Gagal masuk fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(`Gagal keluar fullscreen: ${err.message}`);
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start p-5">
      <SectionHeader title="Kelola Presensi Karyawan" subtitle="Monitoring Presensi Karyawan secara real-time, akurat & simpel." onBack={() => Navigate("/")}
        actions={
          <div className="flex items-center gap-2">
            {canDownloadHRD && (
              <button onClick={() => exportRekapPresensi({ filteredAbsenData, startDate, endDate, tanggalArray })} className={`flex items-center gap-2 h-10 px-4 font-semibold rounded-md shadow transition ${filteredAbsenData.length === 0 || loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                <FontAwesomeIcon icon={faFileDownload} />
                <span className="hidden sm:inline">Unduh Excel</span>
              </button>
            )}

            <button onClick={handleFullView} className="flex items-center gap-2 h-10 px-4 font-semibold rounded-md shadow bg-gray-500 hover:bg-gray-600 text-white transition">
              <FontAwesomeIcon icon={faExpand} />
              <span className="hidden sm:inline">Layar Penuh</span>
            </button>

            <button onClick={fetchAbsenData} disabled={loading} className={`flex items-center gap-2 h-10 px-4 font-semibold rounded-md shadow transition ${loading ? "bg-sky-400 text-white cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600 text-white"}`}>
              <FontAwesomeIcon icon={faRefresh} />
              <span className="hidden sm:inline">
                {loading ? "Memperbarui..." : "Perbarui"}
              </span>
            </button>

            <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-2 h-10 px-4 font-semibold rounded-md shadow bg-blue-500 hover:bg-blue-600 text-white transition">
              <FontAwesomeIcon icon={faCircleInfo} />
              <span className="hidden sm:inline">Informasi</span>
            </button>
          </div>
        }
      />

      <div className="w-full flex flex-row flex-wrap items-center justify-between gap-4 mb-4">
        <SearchBar placeholder="Cari Karyawan..." className="flex-1 min-w-[200px]" onSearch={(val) => setSearchName(val)} />
        <div className="flex items-center gap-1">
          <input type="date" className="border-2 border-gray-300 rounded-md px-2 py-2.5 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span className="mx-1 text-gray-600">s/d</span>
          <input type="date" className="border-2 border-gray-300 rounded-md px-2 py-2.5 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* Data Table */}
      {isDateSelected && !loading && !error && dataAbsen.length > 0 && (
        <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-300 bg-white">
          <div className="min-w-full max-w-[30vw]">
            <div className="flex w-full">
              <div className="flex flex-col border-r bg-white shrink-0" style={{ borderRight: "1px solid #ccc" }}>
                <table className="border-collapse w-full">
                  <thead>
                    <tr>
                      <th colSpan={2} className="sticky top-0 z-10 bg-green-500 text-white border border-green-600 px-3 py-2.5 text-[14px] text-center min-w-[150px]">
                        PEGAWAI
                      </th>
                      <th colSpan={4} className="sticky top-0 z-10 bg-green-500 text-white border border-green-600 px-3 py-2.5 text-[14px] text-center min-w-[80px]">
                        JUMLAH
                      </th>
                    </tr>
                    <tr>
                      <th className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-3 py-0.5 text-[11.5px] text-center min-w-[85px]">
                        NIP
                      </th>
                      <th className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-3 py-0.5 text-[11.5px] text-center min-w-[150px]">
                        NAMA KARYAWAN
                      </th>
                      <th onClick={() => toggleSort("kehadiran")} className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-0.5 text-[11.5px] text-center min-w-[60px]">
                        HADIR
                      </th>
                      <th onClick={() => toggleSort("alpha")} className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-0.5 text-[11.5px] text-center min-w-[60px]">
                        ALPHA
                      </th>
                      <th onClick={() => toggleSort("late")} className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-0.5 text-[11.5px] text-center min-w-[60px]">
                        TERLAMBAT
                      </th>
                      <th onClick={() => toggleSort("overtime")} className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-0.5 text-[11.5px] text-center min-w-[60px]">
                        LEMBUR
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAbsenData.map((item, idx) => {
                      const isLate = item.total_late > 1;
                      return (
                        <tr key={idx} onMouseEnter={() => setHoveredRow(idx)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className={hoveredRow === idx ? "bg-gray-200 transition-none" : "transition-none"}>
                          <td className="border border-gray-300 px-3 py-1 text-center text-xs break-words tracking-wider">{item.nip || "-"}</td>
                          <td onClick={() => { const url = `/kelola-absensi/${item.id_user}?startDate=${startDate}&endDate=${endDate}`; window.open(url, '_blank', 'noopener,noreferrer'); }} className="border border-gray-300 px-2 py-1 text-xs break-words font-semibold tracking-wider uppercase cursor-pointer hover:underline">
                            {item.nama}
                          </td>

                          <td className="border border-gray-300 px-3 py-1 text-center text-xs">{item.total_days || "-"}</td>
                          <td className="border border-gray-300 px-3 py-1 text-center text-xs">{item.total_alpha || "-"}</td>
                          <td className={`border border-gray-300 px-3 py-1 text-center text-xs ${isLate ? "text-red-700 font-bold" : ""}`}> {isLate ? item.total_late : "-"}</td>
                          <td className="border border-gray-300 px-3 py-1 text-center text-xs"> {(item.total_overtime || 0) > 0 ? item.total_overtime : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto" style={{ flexGrow: 1 }}>
                <table className="border-collapse w-full min-w-max bg-white">
                  <thead>
                    {/* Baris tanggal */}
                    <tr>
                      {tanggalArray.map(tgl => {
                        const m = dayMeta(tgl);
                        return (
                          <th key={tgl} colSpan={m.isSunday ? 6 : 4} className={`sticky top-0 z-10 text-white ${m.bg} ${m.border} border px-2 py-0.5 text-center text-xs min-w-[120px]`}>
                            {formatLongDate(tgl)}
                          </th>
                        );
                      })}
                    </tr>

                    {/* Baris nama hari */}
                    <tr>
                      {tanggalArray.map(tgl => {
                        const m = dayMeta(tgl);
                        return (
                          <th key={`hari-${tgl}`} colSpan={m.isSunday ? 6 : 4} className={`sticky top-0 z-20 text-white ${m.bg} ${m.border} border px-2 py-0.5 text-center text-xs`}>
                            {m.dayName}
                          </th>
                        );
                      })}
                    </tr>

                    {/* Baris label kolom */}
                    <tr>
                      {tanggalArray.map(tgl => {
                        const m = dayMeta(tgl);
                        // hanya tampilkan LM dan LP jika hari Minggu
                        const labels = m.isSunday ? ["IN", "LATE", "OUT", "T", "LM", "LP"] : ["IN", "LATE", "OUT", "T"];
                        return labels.map(label => (
                          <th key={`${tgl}-${label}`} className={`text-white ${m.bg} ${m.border} border px-1 py-0.5 text-[11.5px]`}>
                            {label}
                          </th>
                        ));
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAbsenData.map((item, rowIdx) => (
                      <tr
                        key={rowIdx}
                        onMouseEnter={() => setHoveredRow(rowIdx)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className="group"
                      >
                        {tanggalArray.map((tgl, colIdx) => {
                          const m = dayMeta(tgl);
                          const att = item.attendance[tgl] || {};
                          const inTime = att.in || "-";
                          const lateVal = att.late;
                          const lateMin = lateVal === null || lateVal === undefined || lateVal === 0 ? "-" : lateVal;
                          const outTime = att.out || "-";
                          const rawOt = att.overtime ?? item.overtimes?.[tgl]?.durasi;
                          const startOvertime = item.overtimes?.[tgl]?.mulai ?? "-";
                          const lastOvertime = item.overtimes?.[tgl]?.selesai ?? "-";
                          const overtime = rawOt === null || rawOt === undefined || rawOt === 0 ? "-" : rawOt;
                          const isEvenCol = colIdx % 2 === 0;

                          // === Style dasar tiap sel ===
                          const tdBase = `border px-2 py-1 text-center text-xs min-w-[50px] ${m.isSunday
                            ? "border-red-800 bg-red-600 text-white font-semibold group-hover:!bg-red-700 group-hover:!text-white"
                            : `border-gray-300 ${isEvenCol ? "bg-gray-100" : "bg-white"} group-hover:!bg-gray-200`
                            }`;

                          return (
                            <React.Fragment key={`${tgl}-${rowIdx}`}>
                              <td className={tdBase}>{inTime}</td>
                              <td className={`${tdBase} ${lateVal > 0 ? "text-red-700 font-bold" : ""}`}>{lateMin}</td>
                              <td className={tdBase}>{outTime}</td>
                              <td className={tdBase}>{overtime}</td>

                              {/* Hanya render LM & LP jika hari Minggu */}
                              {m.isSunday && (
                                <>
                                  <td className={tdBase}>{startOvertime}</td>
                                  <td className={tdBase}>{lastOvertime}</td>
                                </>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      )}

      {showInfoModal && (
        <Modal isOpen={showInfoModal} title="Informasi Halaman" note="Panduan singkat untuk memahami tombol dan label kolom." onClose={() => setShowInfoModal(false)}>
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFileDownload} className="text-green-600" />
              <span><b>Export Excel</b> – Unduh rekap presensi lengkap.</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faExpand} className="text-yellow-500" />
              <span><b>Fullscreen</b> – Perbesar tampilan tabel penuh layar.</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faRefresh} className="text-blue-600" />
              <span><b>Segarkan</b> – Muat ulang data sesuai rentang tanggal.</span>
            </div>
            <hr className="my-2 border-gray-300" />

            {/* Keterangan Kolom */}
            <div className="grid grid-cols-[50px_auto] gap-y-2 text-sm">
              <span className="font-bold text-green-700">IN</span>
              <span>Jam Absen Masuk Karyawan.</span>

              <span className="font-bold text-red-600">LATE</span>
              <span>Jumlah menit keterlambatan dibanding jam masuk.</span>

              <span className="font-bold text-indigo-700">OUT</span>
              <span>Jam Absen Pulang karyawan.</span>

              <span className="font-bold text-purple-700">T</span>
              <span>Total jam lembur (Overtime) karyawan.</span>

              <span className="font-bold text-purple-700">LM</span>
              <span>Jam Lembur masuk karyawan.</span>

              <span className="font-bold text-purple-700">LP</span>
              <span>Jam Lembur pulang karyawan.</span>
            </div>
            <hr className="my-2 border-gray-300" />
            <p className="mt-2 text-xs text-gray-500">
              Pastikan rentang tanggal sudah dipilih agar data ditampilkan lengkap.
            </p>
          </div>
        </Modal>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner message="Memuat data absensi..." />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-8">
          <ErrorState message={error} onRetry={() => { setLoading(true); fetchAbsenData(); }} />
        </div>
      )}

      {!loading && !error && dataAbsen.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-600">
          <EmptyState icon={faFolderOpen} title="Data kosong" subtitle="Silakan pilih rentang tanggal lain." />
        </div>
      )}
    </div>
  );
};

export default DataRekapAbsensi;