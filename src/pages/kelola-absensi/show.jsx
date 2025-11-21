import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import {
  faClock,
  faExclamationTriangle,
  faInfo,
  faUserCheck,
  faDownload,
  faBusinessTime,
  faUserTimes,
  faExclamationCircle,
  faMoneyBillWave,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
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
      await exportExcelDetail({
        dataUser,
        attendance,
        dateRange,
        period,
        totalKehadiran,
        totalKeterlambatan,
        totalLembur,
        customStartDate,
        customEndDate,
      });
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

            {/* Statistik Ringkas Presensi */}
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Kehadiran", value: `${totalKehadiran} Hari`, icon: faUserCheck, color: "text-green-600", bg: "bg-green-50",},
                  { label: "Total Lembur", value: totalLembur, icon: faBusinessTime, color: "text-amber-600", bg: "bg-amber-50",},
                  { label: "Total Keterlambatan", value: totalKeterlambatan, icon: faClock, color: "text-red-600", bg: "bg-red-50",},
                  { label: "Total Alpha (Tidak Masuk)", value: `${dataUser?.total_alpha ?? 0} Hari`, icon: faUserTimes, color: "text-gray-700", bg: "bg-gray-50",},
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

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-100 p-4 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                <p className="flex items-center gap-2 text-gray-700">
                  <FontAwesomeIcon icon={faExclamationCircle} className="text-amber-500" />
                  Total Hari <b>Lupa Absen Pulang:</b>{" "}
                  <span className="font-semibold text-gray-800">
                    {dataUser?.total_empty_out ?? 0} Hari
                  </span>
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-red-500" />
                  Total Potongan:{" "}
                  <span className="font-bold text-red-600">
                    - Rp {dataUser?.total_nominal_empty_out?.toLocaleString("id-ID") ?? 0}
                  </span>
                </p>
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
                {/* <th className="px-2 py-2 border-t border-b">Mulai Lembur</th>
                <th className="px-2 py-2 border-t border-b">Selesai Lembur</th> */}
                <th className="px-2 py-2 border-t border-b">Potongan</th>
                <th className="px-2 py-2 border-t border-b rounded-tr-xl">Remark</th>
              </tr>
            </thead>
            <tbody>
              {dateRange.map((tgl, i) => {
                const rec = attendance[tgl];
                const isSunday = new Date(tgl).getDay() === 0;

                return (
                  <tr className={`text-center text-xs border-t border-b  ${isSunday ? "bg-red-500 font-semibold [&>*]:text-white" : i % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}`}>
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2 font-semibold text-left">
                      {formatFullDate(tgl)}
                    </td>
                    <td className="px-4 py-2">{rec?.shift || "-"}</td>
                    <td className="px-4 py-2">
                      {rec?.in ? formatTime(rec.in) : "-"}
                    </td>
                    <td className={`px-4 py-2 ${isSunday ? "text-white font-bold" : rec?.late >= 1 ? "text-red-600 font-bold" : "text-gray-700"}`}>
                      {typeof rec?.late === "number" && rec.late >= 1 ? `${rec.late}` : "-"}
                    </td>
                    <td className={`px-4 py-2 ${isSunday ? "text-white font-bold" : rec?.is_early_out ? "text-red-600 font-bold bg-red-100" : "text-gray-700"}`}>
                      {rec?.out ? formatTime(rec.out) : "-"}
                    </td>
                    <td className="px-3 py-1">
                      {rec?.overtimes && rec.overtimes.length > 0 ? (
                        <div
                          onClick={() =>
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

                          <FontAwesomeIcon icon={faInfoCircle} className="text-sm text-blue-600 bg-white border border-white rounded-full"/>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    {/* <td className="px-4 py-2">
                      {isSunday ? rec?.overtime_start ?? "-" : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {isSunday ? rec?.overtime_end ?? "-" : "-"}
                    </td> */}
                    <td className="px-4 py-2">
                      {rec?.nominal_empty_out && rec.nominal_empty_out !== 0
                        ? `- Rp ${rec.nominal_empty_out.toLocaleString("id-ID")}`
                        : "-"}
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

      <Modal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} title="Informasi Halaman Presensi" note="Halaman ini menampilkan data kehadiran karyawan secara real-time dan terus diperbarui oleh sistem absensi." size="xl">
        <div className="space-y-5 text-sm text-gray-700 bg-white leading-relaxed">
          <p>
            Halaman ini berfungsi untuk{" "}
            <span className="font-semibold text-emerald-700">
              memantau dan merekap presensi karyawan
            </span>{" "}
            setiap hari. Data yang ditampilkan mencakup jam masuk, jam pulang, keterlambatan,
            lembur, serta catatan tambahan dari HRD atau sistem absensi otomatis.
          </p>

          {/* Penjelasan Fitur */}
          <div className="space-y-3">
            {/* Unduh Excel */}
            <div className="flex items-start gap-2 border border-gray-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faDownload} className="text-blue-500 mt-1" />
              <p>
                <span className="font-medium">Unduh Excel:</span> fitur ini digunakan untuk
                mengekspor seluruh data presensi ke dalam format Excel yang telah diformat secara
                rapi dan siap pakai untuk laporan kehadiran, administrasi HRD, maupun audit
                kepegawaian.
              </p>
            </div>

            {/* Filter Tanggal */}
            <div className="flex items-start gap-2 border border-gray-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faClock} className="text-green-500 mt-1" />
              <p>
                <span className="font-medium">Periode Tanggal:</span> memungkinkan pengguna untuk
                menampilkan data presensi berdasarkan rentang waktu tertentu. Fitur ini berguna
                untuk analisis periode kerja, evaluasi bulanan, maupun pengecekan absensi mingguan
                secara spesifik.
              </p>
            </div>

            {/* Hari Minggu dan Non-Kerja */}
            <div className="flex items-start gap-2 border border-gray-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-1" />
              <p>
                <span className="font-medium">Warna Merah pada Baris Tabel:</span> menandakan bahwa
                tanggal tersebut merupakan <b>hari Minggu</b> atau <b>hari non-kerja</b>. Data pada
                hari ini tidak dihitung sebagai keterlambatan maupun alpha.
                <br />
                Selain itu, <b>Sabtu pertama di awal bulan</b> juga
                <b> tidak dihitung sebagai Alpha.</b> mengikuti kebijakan perusahaan.
              </p>
            </div>

            {/* Statistik Ringkas */}
            <div className="flex items-start gap-2 border border-gray-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faUserCheck} className="text-amber-500 mt-1" />
              <p>
                <span className="font-medium">Statistik Ringkas:</span> bagian ini menampilkan
                ringkasan kehadiran seperti total hari hadir, jumlah keterlambatan, dan total jam
                lembur yang dihitung secara otomatis berdasarkan data presensi aktif dalam periode
                yang dipilih.
              </p>
            </div>

            {/* Kolom Remark */}
            <div className="flex items-start gap-4 border border-gray-100 p-3 rounded-lg">
              <FontAwesomeIcon icon={faInfo} className="text-purple-500 mt-1" />
              <p>
                <span className="font-medium">Kolom Remark:</span> berisi catatan tambahan yang
                diinput oleh HRD, seperti <b>izin, sakit, dinas luar, atau absen manual</b>.
                Pengguna dapat meninjau detail remark dengan menekan tombol <b>“Lihat”</b> pada
                setiap baris data.
              </p>
            </div>
          </div>

          {/* Catatan Penutup */}
          <p className="text-xs text-gray-500 italic pt-3 border-t border-gray-200">
            💡 <b>Tip:</b> Gunakan fitur <b>Filter Tanggal di kelola presensi</b> untuk meninjau
            kehadiran berdasarkan periode tertentu, lalu ekspor hasilnya ke Excel untuk pelaporan
            resmi atau evaluasi kinerja karyawan.
          </p>
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

      <Modal isOpen={overtimeModal.open} onClose={() => setOvertimeModal({ open: false, list: [] })} title={`Detail Lembur`} size="lg" note="Rangkuman lembur pada hari yang dipilih. Gunakan daftar di bawah untuk melihat waktu mulai, selesai, dan total jam lembur.">
        <div className="space-y-4 text-sm text-gray-700">

          {/* ========================= RINGKASAN ========================= */}
          <div className="rounded-md border border-gray-200 p-2 px-3 bg-white">
            <p className="font-semibold text-sm mb-1 pb-1.5 border-b border-gray-200">
              Ringkasan Lembur
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">

              <div className="py-1 text-center">
                <p className="text-gray-600 text-xs mb-1">Total Pengajuan</p>
                <p className="text-gray-900 font-semibold text-sm">
                  {overtimeModal.list.length} Kali
                </p>
              </div>

              <div className="py-1 text-center">
                <p className="text-gray-600 text-xs mb-1">Total Jam Lembur</p>
                <p className="text-gray-900 font-semibold text-sm">
                  {overtimeModal.list.reduce((a, b) => a + (b.total_hour || 0), 0)} Jam
                </p>
              </div>

              <div className="py-1 text-center">
                <p className="text-gray-600 text-xs mb-1">Tanggal</p>
                <p className="text-gray-900 font-semibold text-sm">
                  {formatFullDate(overtimeModal.tanggal)}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 mb-3">
            <p className="flex items-center gap-2 font-semibold text-blue-700 mb-1">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 pb-0.5" />
              Informasi
            </p>
            <p className="text-[13px] text-blue-900 leading-relaxed">
              Data lembur yang tampil di bawah ini adalah data yang <span className="font-semibold">sudah diajukan oleh karyawan, disetujui, dan diverifikasi</span> oleh kepala divisi masing-masing.
              Seluruh informasi ini <span className="font-semibold">valid</span> dan telah melewati prosedur resmi perusahaan.
            </p>
          </div>

          {overtimeModal.list.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Tidak ada data lembur.</p>
          ) : (
            <div className="border border-gray-300 rounded-lg bg-white shadow-sm ">

              <div className="px-4 py-3 border-b border-gray-200 sticky top-0 z-10">
                <p className="font-semibold text-gray-900 text-sm">
                  Histori Pengajuan Lembur Terverifikasi ({overtimeModal.list.length})
                </p>
              </div>

              <div className="divide-y divide-gray-200 max-h-[320px] overflow-y-auto scrollbar-green">
                {overtimeModal.list.map((item, index) => (
                  <div key={index} className={`px-4 py-2 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

                      <p className="text-gray-700 text-[13px] font-medium sm:w-1/3">
                        Pengajuan Ke-{index + 1}
                      </p>

                      <div className="grid grid-cols-3 sm:w-2/3 text-[12px] gap-2 sm:gap-4">
                        <div className="flex flex-col sm:border-r sm:border-gray-200 sm:pr-4">
                          <span className="text-gray-500 font-medium">Mulai</span>
                          <span className="text-gray-900 font-semibold mt-[2px]">
                            {item.overtime_start ?? "-"}
                          </span>
                        </div>

                        <div className="flex flex-col sm:border-r sm:border-gray-200 sm:pr-4">
                          <span className="text-gray-500 font-medium">Selesai</span>
                          <span className="text-gray-900 font-semibold mt-[2px]">
                            {item.overtime_end ?? "-"}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-gray-500 font-medium">Durasi</span>
                          <span className="text-gray-900 font-semibold mt-[2px]">
                            {item.total_hour ?? 0} Jam
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DetailKelolaPresensi;
