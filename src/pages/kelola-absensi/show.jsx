import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import React, { useState, useEffect } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { formatFullDate, formatTime, formatOvertimeJamBulat, formatDateForFilename, } from "../../utils/dateUtils";
import { faClock, faDownload, faExclamationTriangle, faInfo, faUserCheck, } from "@fortawesome/free-solid-svg-icons";
import { LoadingSpinner, SectionHeader, EmptyState, ErrorState, Modal } from "../../components";

const DetailKelolaPresensi = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(true);
  const [dataUser, setDataUser] = useState(null);
  const [attendance, setAttendance] = useState({});
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [totalLembur, setTotalLembur] = useState("-");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [customEndDate, setCustomEndDate] = useState("");
  const [totalKehadiran, setTotalKehadiran] = useState(0);
  const [customStartDate, setCustomStartDate] = useState("");
  const [totalKeterlambatan, setTotalKeterlambatan] = useState("-");
  const [remarkModal, setRemarkModal] = useState({ open: false, remark: "", remarkBy: "" });

  const fetchPresensi = async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithJwt(
        `${apiUrl}/absen/rekap/${id}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data presensi.");
      const result = await response.json();
      const d = result.data || {};
      setDataUser(d);
      setAttendance(d.attendance || {});
      setTotalKehadiran(d.total_days || 0);
      setTotalKeterlambatan(
        typeof d.total_late === "number" ? `${d.total_late} Menit` : "-"
      );
      setTotalLembur(
        typeof d.total_overtime === "number" ? `${d.total_overtime} Jam` : "-"
      );
      setPeriod(`${formatFullDate(startDate)} s/d ${formatFullDate(endDate)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDefault = () => {
    const { start, end } = getDefaultPeriod();
    fetchPresensi(
      new Date(start).toISOString().split("T")[0],
      new Date(end).toISOString().split("T")[0]
    );
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const startQuery = query.get("startDate");
    const endQuery = query.get("endDate");

    if (startQuery && endQuery) {
      // gunakan query dari URL
      setCustomStartDate(startQuery);
      setCustomEndDate(endQuery);
      fetchPresensi(startQuery, endQuery);
    } else {
      // fallback ke default
      const { start: defStart, end: defEnd } = getDefaultPeriod();
      setCustomStartDate(defStart);
      setCustomEndDate(defEnd);
      fetchPresensi(defStart, defEnd);
    }
  }, [location.search]);

  const dateRange = Object.keys(attendance || {});

  // --- EXPORT EXCEL ---
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Rekap Presensi");

    const addRow = (vals, bold = false) => {
      const r = sheet.addRow(vals);
      r.eachCell((c) => {
        c.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        c.alignment = { horizontal: "left", vertical: "middle" };
        if (bold) c.font = { bold: true };
      });
    };

    // ===== Informasi Karyawan =====
    sheet.addRow([]);
    sheet.addRow(["Nama", dataUser?.nama || ""]);
    sheet.addRow(["NIP", dataUser?.nip || ""]);
    sheet.addRow(["Divisi", dataUser?.role || ""]);
    sheet.addRow(["Periode", period || ""]);
    sheet.addRow(["Total Hari Hadir", `${totalKehadiran} Hari`]);
    sheet.addRow(["Total Terlambat", totalKeterlambatan || 0]);
    sheet.addRow(["Total Lembur", totalLembur || 0]);
    sheet.addRow([]);

    // ===== Header Tabel =====
    const header = ["No", "Tanggal", "Shift", "Masuk", "Terlambat (Menit)", "Pulang", "Lembur", "Remark"];
    const headerRow = sheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF16A34A" },
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ===== Data Tabel =====
    dateRange.forEach((tgl, i) => {
      const rec = attendance[tgl];
      const isSunday = new Date(tgl).getDay() === 0;

      const row = sheet.addRow([
        i + 1,
        tgl,
        rec?.shift || "-",
        rec?.in ? formatTime(rec.in) : "-",
        typeof rec?.late === "number" ? rec.late : "-",
        rec?.out ? formatTime(rec.out) : "-",
        rec?.overtime ?? "-",
        rec?.remark ?? "-"   // << Remark ditambahkan di sini
      ]);

      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          horizontal: colNumber === 2 || colNumber === 8 ? "left" : "center", // tanggal & remark rata kiri
          vertical: "middle",
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        if (isSunday) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDC2626" }, // merah
          };
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        }
      });
    });

    // ===== Auto Width =====
    sheet.columns.forEach((col, idx) => {
      let max = idx === 7 ? 30 : 12; // Kolom Remark lebih lebar
      col.eachCell?.((c) => {
        const len = c.value ? c.value.toString().length : 0;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });


    // ===== Save File =====
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buf]),
      `RekapPresensi_${dataUser?.nip || "User"}_${formatDateForFilename(
        customStartDate
      )}_${formatDateForFilename(customEndDate)}.xlsx`
    );
  };

  return (
    <div className="flex flex-col mb-10">
      <SectionHeader title="Detail Kelola Presensi" subtitle="Menampilkan rekap presensi lengkap karyawan, termasuk jam masuk, pulang, keterlambatan & Remark." onBack={() => navigate("/kelola-absensi")}
        actions={
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold">
              <FontAwesomeIcon icon={faDownload} />
              <span className="hidden sm:block">Unduh Excel</span>
            </button>
            <button onClick={() => setIsInfoOpen(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-semibold">
              <FontAwesomeIcon icon={faInfo} />
              <span className="hidden sm:block">Informasi</span>
            </button>
          </div>
        }
      />

      {loading && (
        <div className="py-10 flex justify-center">
          <LoadingSpinner size="lg" label="Memuat data presensi..." />
        </div>
      )}

      {!loading && error && (
        <ErrorState message={error} onRetry={loadDefault} />
      )}

      {!loading && !error && !dataUser && (
        <EmptyState message="Data presensi tidak ditemukan." />
      )}

      {!loading && !error && dataUser && (
        <>
          <div className="bg-white/90 backdrop-blur-sm border border-green-200 shadow-green-200 rounded-2xl shadow-sm p-4 mb-4 transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
              <h3 className="text-lg font-bold tracking-wide text-gray-800 leading-tight uppercase">
                {dataUser?.nama || "-"}
              </h3>
              <p className="mt-2 md:mt-0 text-xs bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full shadow-sm">
                Periode&nbsp;:&nbsp;{period || "-"}
              </p>
            </div>

            {/* Informasi User */}
            <div className="text-xs text-gray-700 space-y-1 border-b border-dashed border-gray-200 pb-3 mb-4">
              <div>
                <span className="inline-block w-24 font-medium text-gray-600">NIP</span>: {dataUser?.nip || "-"}
              </div>
              <div>
                <span className="inline-block w-24 font-medium text-gray-600">Divisi</span>: {dataUser?.role || "-"}
              </div>
              <div>
                <span className="inline-block w-24 font-medium text-gray-600">Perusahaan</span>: {dataUser?.perusahaan || "-"}
              </div>
            </div>

            {/* Statistik ringkas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Total Kehadiran", value: totalKehadiran ? `${totalKehadiran} Hari` : "N/A", color: "green", icon: faUserCheck, },
                { label: "Total Lembur", value: totalLembur, color: "yellow", icon: faClock, },
                { label: "Total Keterlambatan", value: totalKeterlambatan ? totalKeterlambatan : "N/A", color: "red", icon: faExclamationTriangle, },
              ].map((it, i) => (
                <div key={i} className="flex items-center border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-${it.color}-100 text-${it.color}-600 text-sm`}>
                    <FontAwesomeIcon icon={it.icon} size="sm" />
                  </div>
                  <div className="ml-2">
                    <p className="text-[11px] text-gray-700 leading-tight font-medium tracking-wider"> {it.label}</p>
                    <p className={`text-sm font-semibold text-${it.color}-700 leading-tight`}> {it.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel */}
          <table className="min-w-full border-collapse">
            <thead className="bg-green-500 text-white text-sm">
              <tr>
                <th className="px-2 py-2 border-t border-b rounded-tl-xl">No</th>
                <th className="px-2 py-2 border-t border-b">Tanggal</th>
                <th className="px-2 py-2 border-t border-b">Shift</th>
                <th className="px-2 py-2 border-t border-b">Masuk</th>
                <th className="px-2 py-2 border-t border-b">Terlambat</th>
                <th className="px-2 py-2 border-t border-b">Pulang</th>
                <th className="px-2 py-2 border-t border-b">Total Jam Lembur</th>
                <th className="px-2 py-2 border-t border-b">Mulai Lembur</th>
                <th className="px-2 py-2 border-t border-b">Selesai Lembur</th>
                <th className="px-2 py-2 border-t border-b rounded-tr-xl">Remark</th>
              </tr>
            </thead>
            <tbody>
              {dateRange.map((tgl, i) => {
                const rec = attendance[tgl];
                const isSunday = new Date(tgl).getDay() === 0;

                return (
                  <tr key={i} className={`text-center text-xs border-t border-b ${isSunday ? "bg-red-500 text-white font-semibold" : i % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}`}>
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2 font-semibold tracking-wide text-left">
                      {formatFullDate(tgl)}
                    </td>
                    <td className="px-4 py-2">{rec?.shift || "-"}</td>
                    <td className="px-4 py-2">
                      {rec?.in ? formatTime(rec.in) : "-"}
                    </td>
                    <td className={`px-4 py-2 ${rec?.late >= 1 ? "text-red-600 font-bold" : "text-gray-700"}`}>
                      {typeof rec?.late === "number" && rec.late >= 1 ? `${rec.late} Menit` : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {rec?.out ? formatTime(rec.out) : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {typeof rec?.overtime === "number" ? rec.overtime : "-"}
                    </td>
                    <td className="px-4 py-2">{rec?.overtime_start || "-"}</td>
                    <td className="px-4 py-2">{rec?.overtime_end || "-"}</td>

                    <td className="px-4 py-2">
                      {rec?.remark ? (
                        <div className="flex justify-center">
                          <button onClick={() => setRemarkModal({ open: true, remark: rec.remark, remarkBy: rec.remark_by || "-", remarkStatus: rec.remark_status ?? null, })} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2 py-1 rounded">
                            <FontAwesomeIcon icon={faInfo} className="w-3 h-3" />
                            Lihat
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {/* Modal Informasi */}
      <Modal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Informasi Halaman Presensi" note="Data diambil langsung dari sistem absensi dan selalu menyesuaikan pembaruan terbaru.">
        <div className="space-y-4 text-sm text-gray-700">
          <p> Halaman ini menampilkan <span className="font-semibold text-emerald-600">rekap presensi karyawan</span> lengkap per hari: jam masuk, jam pulang, keterlambatan, lembur, dan catatan tambahan (remark).</p>

          <div className="space-y-2">
            {/* Unduh Excel */}
            <div className="flex items-start gap-2 bg-blue-50 p-2 rounded">
              <FontAwesomeIcon icon={faDownload} className="text-blue-600 mt-1" />
              <p><span className="font-medium">Unduh Excel:</span> ekspor seluruh data presensi ke file Excel.</p>
            </div>

            {/* Filter Tanggal */}
            <div className="flex items-start gap-2 bg-green-50 p-2 rounded">
              <FontAwesomeIcon icon={faClock} className="text-green-600 mt-1" />
              <p><span className="font-medium">Filter Tanggal:</span> tampilkan data sesuai rentang tanggal tertentu.</p>
            </div>

            {/* Tabel Merah */}
            <div className="flex items-start gap-2 bg-red-50 p-2 rounded">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mt-1" />
              <p><span className="font-medium">Tabel Merah:</span> baris merah menandakan <b>hari Minggu</b>.</p>
            </div>

            {/* Statistik Ringkas */}
            <div className="flex items-start gap-2 bg-yellow-50 p-2 rounded">
              <FontAwesomeIcon icon={faUserCheck} className="text-yellow-600 mt-1" />
              <p><span className="font-medium">Statistik Ringkas:</span> total hadir, lembur, dan keterlambatan di atas tabel.</p>
            </div>

            {/* Kolom Remark */}
            <div className="flex items-start gap-2 bg-purple-50 p-2 rounded">
              <FontAwesomeIcon icon={faInfo} className="text-purple-600 mt-1" />
              <p><span className="font-medium">Kolom Remark:</span> catatan khusus (izin, sakit, dinas luar, atau tambahan HRD).</p>
            </div>
          </div>
        </div>
      </Modal>


      <Modal isOpen={remarkModal.open} onClose={() => setRemarkModal({ open: false, remark: "", remarkBy: "", remarkStatus: null })} title="Detail Remark">
        <div className="p-6 text-sm text-gray-800 space-y-5">

          {/* Isi Remark */}
          <p className="text-gray-700 leading-relaxed whitespace-pre-line min-h-[80px]">
            {remarkModal.remark || "Tidak ada keterangan tambahan."}
          </p>

          {/* Status & Info pembuat sejajar bawah */}
          <div className="flex items-center justify-between border-t pt-3 text-xs">
            <span className={`px-3 py-1 rounded-full font-medium ${remarkModal.remarkStatus === 1
              ? "bg-indigo-100 text-indigo-700"
              : remarkModal.remarkStatus === 2
                ? "bg-yellow-100 text-yellow-700"
                : remarkModal.remarkStatus === 3
                  ? "bg-red-100 text-red-700"
                  : remarkModal.remarkStatus === 4
                    ? "bg-green-100 text-green-700"
                    : remarkModal.remarkStatus === 5
                      ? "bg-pink-100 text-pink-700"
                      : "bg-gray-100 text-gray-500"
              }`}
            >
              {remarkModal.remarkStatus === 1
                ? "Absen Manual"
                : remarkModal.remarkStatus === 2
                  ? "Izin Terlambat"
                  : remarkModal.remarkStatus === 3
                    ? "Izin Pulang Cepat"
                    : remarkModal.remarkStatus === 4
                      ? "Cuti"
                      : remarkModal.remarkStatus === 5
                        ? "Izin Sakit"
                        : "Tidak Ada Status"}
            </span>

            <span className="italic text-gray-500">
              Dibuat oleh: <span className="font-medium">{remarkModal.remarkBy || "-"}</span>
            </span>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default DetailKelolaPresensi;