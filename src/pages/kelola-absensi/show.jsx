import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import { faClock, faInfo, faUserCheck, faDownload, faBusinessTime, faUserTimes, faExclamationCircle, faInfoCircle, faCalendarDays, faCircleExclamation, faChartColumn, faClipboardList, } from "@fortawesome/free-solid-svg-icons";
import { LoadingSpinner, SectionHeader, EmptyState, ErrorState, Modal } from "../../components";
import { exportExcelDetail } from "./exportExcelDetail";

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
  const [customStartDate, setCustomStartDate] = useState("");
  const [totalKehadiran, setTotalKehadiran] = useState(0);
  const [overtimeModal, setOvertimeModal] = useState({ open: false, list: [], tanggal: "", });
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
      setTotalKeterlambatan(typeof d.total_late === "number" ? `${d.total_late} Menit` : "-");
      setTotalLembur(typeof d.total_overtime === "number" ? `${d.total_overtime} Jam` : "-");
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
      setCustomStartDate(startQuery);
      setCustomEndDate(endQuery);
      fetchPresensi(startQuery, endQuery);
    } else {
      const { start: defStart, end: defEnd } = getDefaultPeriod();
      setCustomStartDate(defStart);
      setCustomEndDate(defEnd);
      fetchPresensi(defStart, defEnd);
    }
  }, [location.search]);

  const dateRange = Object.keys(attendance || {});

  const handleExport = async () => {
    try {
      toast.loading("Menyiapkan file Excel...");
      await exportExcelDetail({ dataUser, attendance, dateRange, period, totalKehadiran, totalKeterlambatan, totalLembur, customStartDate, customEndDate, });
      toast.dismiss();
      toast.success("File Excel berhasil diunduh!");
    } catch (error) {
      toast.dismiss();
      toast.error("Gagal mengekspor data.");
      console.error("Export error:", error);
    }
  };

  return (
    <div className="flex flex-col mb-10">
      <SectionHeader title="Detail Kelola Presensi" subtitle="Menampilkan rekap presensi lengkap karyawan, termasuk jam masuk, pulang, keterlambatan & Remark." onBack={() => navigate("/kelola-absensi")}
        actions={
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold">
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

      {!loading && error && <ErrorState message={error} onRetry={loadDefault} />}
      {!loading && !error && !dataUser && <EmptyState message="Data presensi tidak ditemukan." />}
      {!loading && !error && dataUser && (
        <>
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl p-4 mb-4 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
              <h3 className="text-lg md:text-xl font-bold tracking-wide text-gray-800 leading-snug uppercase">
                {dataUser?.nama || "-"}
              </h3>
              <p className="text-xs md:text-sm bg-white-100 text-black-700 border border-gray-200/50 px-3 py-1 rounded shadow-sm w-fit">
                Periode: {period || "-"}
              </p>
            </div>

            <div className="text-xs md:text-sm text-gray-700 space-y-1 border-b border-dashed border-gray-200 pb-3 mb-4">
              <div className="flex flex-wrap gap-2">
                <span className="font-medium text-gray-600 w-24">NIP</span>: {dataUser?.nip || "-"}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="font-medium text-gray-600 w-24">Divisi</span>:{" "}
                {dataUser?.role || "-"}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="font-medium text-gray-600 w-24">Perusahaan</span>:{" "}
                {dataUser?.perusahaan || "-"}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Kehadiran", value: `${totalKehadiran} Hari`, icon: faUserCheck, color: "text-green-600", bg: " ", },
                  { label: "Total Alpha (Tidak Masuk)", value: `${dataUser?.total_alpha ?? 0} Hari`, icon: faUserTimes, color: "text-gray-700", bg: "", },
                  { label: "Total Keterlambatan", value: totalKeterlambatan, icon: faClock, color: "text-red-600", bg: "", },
                  { label: "Total Lembur", value: totalLembur, icon: faBusinessTime, color: "text-amber-600", bg: "", },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${item.bg}`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${item.color} bg-white shadow-inner`}>
                      <FontAwesomeIcon icon={item.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600">{item.label}</p>
                      <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-100 ">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-amber-500 shadow-inner">
                    <FontAwesomeIcon icon={faExclamationCircle} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Lupa Absen Pulang</p>
                    <p className="text-base font-bold text-gray-800">
                      {dataUser?.total_empty_out ?? 0} Hari
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <table className="min-w-full border-collapse">
            <thead className="bg-green-500 text-white text-sm">
              <tr>
                <th className="px-2 py-2 border-t border-b rounded-tl-xl">No</th>
                <th className="px-2 py-2 border-t border-b">Tanggal</th>
                <th className="px-2 py-2 border-t border-b">Shift</th>
                <th className="px-2 py-2 border-t border-b">Masuk</th>
                <th className="px-2 py-2 border-t border-b">Terlambat</th>
                <th className="px-2 py-2 border-t border-b">Pulang</th>
                <th className="px-2 py-2 border-t border-b">Total Lembur</th>
                <th className="px-2 py-2 border-t border-b rounded-tr-xl">Remark</th>
              </tr>
            </thead>
            <tbody>
              {dateRange.map((tgl, i) => {
                const rec = attendance[tgl];
                const isSunday = new Date(tgl).getDay() === 0;
                const isLeaveOrSick = rec?.remark_status === 4 || rec?.remark_status === 5;

                return (
                  <tr className={`text-center text-xs border-t border-b  ${isSunday ? "bg-red-500 font-semibold [&>*]:text-white" : i % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}`}>
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2 font-semibold text-left">
                      {formatFullDate(tgl)}
                    </td>
                    <td className="px-4 py-2">
                      {isLeaveOrSick ? "-" : rec?.shift || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {isLeaveOrSick ? "-" : rec?.in ? formatTime(rec.in) : "-"}
                    </td>
                    <td className={`px-4 py-2 ${isSunday ? "text-white font-bold" : rec?.late >= 1 && !isLeaveOrSick ? "text-red-600 font-bold" : "text-gray-700"}`}>
                      {!isLeaveOrSick && typeof rec?.late === "number" && rec.late >= 1
                        ? rec.late
                        : "-"
                      }
                    </td>
                    <td className={`px-4 py-2 ${isSunday ? "text-white font-bold" : rec?.is_early_out && !isLeaveOrSick ? "text-red-600 font-bold bg-red-100" : "text-gray-700"}`}>
                      {isLeaveOrSick ? "-" : rec?.out ? formatTime(rec.out) : "-"}
                    </td>

                    <td className="px-3 py-1">
                      {rec?.overtimes && rec.overtimes.length > 0 ? (
                        <div onClick={() =>
                          setOvertimeModal({
                            open: true,
                            list: rec.overtimes,
                            tanggal: tgl,
                          })
                        }
                          className={`flex items-center justify-center cursor-pointer text-xs
                          ${isSunday ? "text-white" : "text-blue-500 hover:text-blue-600"}`}
                        >
                          <span className={`mr-1 inline-block w-[22px] text-center font-medium ${isSunday ? "text-white" : "text-black"}`}>
                            {rec.total_overtime}
                          </span>
                          <FontAwesomeIcon icon={faInfoCircle} className="text-sm text-blue-600 bg-white border border-white rounded-full" />
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {rec?.remark ? (
                        <div className="flex justify-center">
                          <button onClick={() =>
                            setRemarkModal({
                              open: true,
                              remark: rec.remark,
                              remarkBy: rec.remark_by || "-",
                              remarkStatus: rec.remark_status ?? null,
                            })
                          }
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2 py-1 rounded"
                          >
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

      <Modal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Informasi Halaman Presensi" note="Menampilkan data kehadiran karyawan secara real-time." size="lg">
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p> Halaman ini digunakan untuk memantau presensi karyawan, termasuk jam masuk, pulang, keterlambatan, lembur, dan catatan HRD.</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faDownload} className="text-blue-500 mt-1" />
              <span><b>Unduh Excel</b> – Ekspor data presensi ke laporan siap pakai.</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCalendarDays} className="text-green-500 mt-1" />
              <span><b>Periode Tanggal</b> – Filter data berdasarkan rentang waktu.</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 mt-1" />
              <span><b>Baris Merah</b> – Hari Minggu / non-kerja (tidak dihitung alpha).</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faChartColumn} className="text-amber-500 mt-1" />
              <span><b>Statistik</b> – Ringkasan hadir, terlambat, dan lembur.</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faClipboardList} className="text-purple-500 mt-1" />
              <span><b>Remark</b> – Catatan HRD seperti izin, sakit, atau dinas.</span>
            </li>
          </ul>
        </div>
      </Modal>


      <Modal isOpen={remarkModal.open} onClose={() => setRemarkModal({ open: false, remark: "", remarkBy: "", remarkStatus: null })} title="Detail Remark">
        <div className="p-6 text-sm text-gray-800 space-y-5">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line min-h-[80px]">
            {remarkModal.remark || "Tidak ada keterangan tambahan."}
          </p>

          <div className="flex items-center justify-between border-t pt-3 text-xs">
            <span
              className={`px-3 py-1 rounded-full font-medium ${remarkModal.remarkStatus === 1
                ? "bg-indigo-100 text-indigo-700"
                : remarkModal.remarkStatus === 2
                  ? "bg-yellow-100 text-yellow-700"
                  : remarkModal.remarkStatus === 3
                    ? "bg-red-100 text-red-700"
                    : remarkModal.remarkStatus === 4
                      ? "bg-green-100 text-green-700"
                      : remarkModal.remarkStatus === 5
                        ? "bg-pink-100 text-pink-700"
                        : remarkModal.remarkStatus === 6
                          ? "bg-blue-100 text-blue-700"
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
                        : remarkModal.remarkStatus === 6
                          ? "Lupa Absen"
                          : "Tidak Ada Status"}
            </span>

            <span className="italic text-gray-500">
              Dibuat oleh: <span className="font-medium">{remarkModal.remarkBy || "-"}</span>
            </span>
          </div>
        </div>
      </Modal>

      <Modal isOpen={overtimeModal.open} onClose={() => setOvertimeModal({ open: false, list: [] })} title="Detail Lembur" note={`Tanggal: ${formatFullDate(overtimeModal.tanggal)}`} size="lg">
        <div className="space-y-4 text-sm text-gray-700">

          {/* Ringkasan */}
          <div className="grid grid-cols-2 bg-white border rounded-lg text-center">
            <div className="p-3">
              <p className="text-xs text-gray-500">Jumlah Pengajuan</p>
              <p className="font-semibold text-gray-900">
                {overtimeModal.list.length} Pengajuan
              </p>
            </div>
            <div className="p-3 border-l">
              <p className="text-xs text-gray-500">Total Jam Lembur</p>
              <p className="font-semibold text-gray-900">
                {overtimeModal.list.reduce((a, b) => a + (b.total_hour || 0), 0)} Jam
              </p>
            </div>
          </div>

          {/* Informasi Status */}
          <div className="flex items-center gap-2 p-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>Seluruh pengajuan lembur pada tanggal ini telah disetujui dan diverifikasi.</span>
          </div>

          {/* Data Lembur */}
          {overtimeModal.list.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Tidak terdapat pengajuan lembur pada tanggal ini.
            </p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {overtimeModal.list.map((item, i) => (
                <div key={i} className="p-4 bg-white border rounded-lg text-xs">

                  <div className="flex justify-between mb-3">
                    <p className="font-semibold text-gray-900">
                      Pengajuan #{i + 1}
                    </p>
                    <p className="text-gray-500">
                      {item.total_hour || 0} Jam
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-gray-500">Mulai</p>
                      <p className="font-semibold">{item.overtime_start || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Selesai</p>
                      <p className="font-semibold">{item.overtime_end || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Durasi</p>
                      <p className="font-semibold">{item.total_hour || 0} Jam</p>
                    </div>
                  </div>

                  <p className="text-gray-500 mt-3">
                    Disetujui oleh <b>{item.approved_by || "-"}</b> •{" "}
                    {item.approved_at
                      ? new Date(item.approved_at).toLocaleString("id-ID")
                      : "-"}
                  </p>

                </div>
              ))}
            </div>
          )}

        </div>
      </Modal>


    </div>
  );
};

export default DetailKelolaPresensi;
