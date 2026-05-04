import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import {
  faClock,
  faInfo,
  faUserCheck,
  faDownload,
  faUserTimes,
  faCheckCircle,
  faUserXmark,
  faBusinessTime,
  faExclamationCircle,
  faInfoCircle,
  faCalendarDays,
  faCircleExclamation,
  faChartColumn,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import {
  LoadingSpinner,
  SectionHeader,
  EmptyState,
  ErrorState,
  Modal,
  SummaryCard,
  Button,
  DataView,
} from "../../components";
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
  const [overtimeModal, setOvertimeModal] = useState({
    open: false,
    list: [],
    tanggal: "",
  });
  const [totalKeterlambatan, setTotalKeterlambatan] = useState("-");
  const [remarkModal, setRemarkModal] = useState({
    open: false,
    remark: "",
    remarkBy: "",
  });

  const fetchPresensi = async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithJwt(
        `${apiUrl}/absen/rekap/${id}?startDate=${startDate}&endDate=${endDate}`,
      );
      if (!response.ok) throw new Error("Gagal mengambil data presensi.");
      const result = await response.json();
      const d = result.data || {};
      setDataUser(d);
      setAttendance(d.attendance || {});
      setTotalKehadiran(d.total_days || 0);
      setTotalKeterlambatan(
        typeof d.total_late === "number" ? `${d.total_late} Menit` : "-",
      );
      setTotalLembur(
        typeof d.total_overtime === "number" ? `${d.total_overtime} Jam` : "-",
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
      new Date(end).toISOString().split("T")[0],
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

  const summaryItems = [
    {
      key: "hadir",
      title: "Hadir",
      value: `${totalKehadiran} Hari`,
      variant: "success",
      icon: faCheckCircle,
      note: "Jumlah hari karyawan masuk kerja.",
    },
    {
      key: "terlambat",
      title: "Terlambat",
      value: totalKeterlambatan,
      variant: "danger",
      icon: faClock,
      note: "Jumlah keterlambatan dari jam kerja.",
    },
    {
      key: "alpha",
      title: "Alpha",
      value: `${dataUser?.total_alpha ?? 0} Hari`,
      variant: "warning",
      icon: faUserXmark,
      note: "Tidak masuk kerja (kecuali hari Minggu).",
    },
    {
      key: "lembur",
      title: "Lembur",
      value: totalLembur,
      variant: "info",
      icon: faBusinessTime,
      note: "Jumlah waktu kerja di luar jam kerja.",
    },
    {
      key: "empty_out",
      title: "Lupa Absen Pulang",
      value: `${dataUser?.total_empty_out ?? 0} Hari`,
      variant: "warning",
      icon: faExclamationCircle,
      note: "total tidak melakukan absen pulang.",
    },
  ];

  const attendanceRows = dateRange.map((tgl, i) => {
    const rec = attendance?.[tgl] || {};
    const isSunday = new Date(tgl).getDay() === 0;
    const isLeaveOrSick = rec?.remark_status === 4 || rec?.remark_status === 5;
    return {
      tgl,
      rec,
      isSunday,
      isLeaveOrSick,
    };
  });

  const attendanceColumns = [
    {
      key: "tanggal",
      label: "Tanggal",
      render: (row) => formatFullDate(row.tgl),
    },
    {
      key: "shift",
      label: "Shift",
      render: (row) => (row.isLeaveOrSick ? "-" : row.rec?.shift || "-"),
    },
    {
      key: "masuk",
      label: "Masuk",
      render: (row) =>
        row.isLeaveOrSick ? "-" : row.rec?.in ? formatTime(row.rec.in) : "-",
    },
    {
      key: "terlambat",
      label: "Terlambat",
      render: (row) => {
        const late = row.rec?.late;
        const showLate =
          !row.isLeaveOrSick && typeof late === "number" && late >= 1;
        return showLate ? late : "-";
      },
    },
    {
      key: "pulang",
      label: "Pulang",
      render: (row) =>
        row.isLeaveOrSick ? "-" : row.rec?.out ? formatTime(row.rec.out) : "-",
    },
    {
      key: "lembur",
      label: "Total Lembur",
      align: "center",
      render: (row) => {
        const rec = row.rec;

        return (
          <div className="flex items-center justify-center">
            {rec?.overtimes && rec.overtimes.length > 0 ? (
              <span
                onClick={() =>
                  setOvertimeModal({
                    open: true,
                    list: rec.overtimes,
                    tanggal: row.tgl,
                  })
                }
                className={`cursor-pointer ${
                  row.isSunday
                    ? "text-white"
                    : "text-black-500 hover:text-black-600 hover:underline"
                }`}
              >
                {rec.total_overtime}
              </span>
            ) : (
              <span
                className={`cursor-default ${row.isSunday ? "text-white" : "text-black-500 hover:text-black-600 hover:underline"}`}
              >
                -
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "remark",
      label: "Remark",
      render: (row) =>
        row.rec?.remark ? (
          <div className="flex justify-center">
            <Button
              size="sm"
              variant="detail"
              icon={faInfo}
              onClick={() =>
                setRemarkModal({
                  open: true,
                  remark: row.rec.remark,
                  remarkBy: row.rec.remark_by || "-",
                  remarkStatus: row.rec.remark_status ?? null,
                })
              }
            >
              Lihat
            </Button>
          </div>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div className="flex flex-col mb-10">
      <SectionHeader
        title="Detail Kelola Presensi"
        subtitle="Menampilkan rekap presensi lengkap karyawan, termasuk jam masuk, pulang, keterlambatan & Remark."
        onBack={() => navigate("/kelola-absensi")}
        actions={
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="lg"
              icon={faDownload}
              onClick={handleExport}
              loading={loading}
            >
              Rekap
            </Button>
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
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {dataUser?.nama || "-"}
              </h3>
              <span className="text-xs text-green-600 border border-green-300 px-3 py-1 rounded-md w-fit">
                {period || "-"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-4">
              <div>
                <p className="text-gray-600 text-xs mb-0.5">NIP</p>
                <p className="font-medium text-gray-700">
                  {dataUser?.nip || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-0.5">Divisi</p>
                <p className="font-medium text-gray-700">
                  {dataUser?.role || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-0.5">Perusahaan</p>
                <p className="font-medium text-gray-700">
                  {dataUser?.perusahaan || "-"}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Summary */}
            <SummaryCard items={summaryItems} showNote={true} />
          </div>
          <DataView
            data={attendanceRows}
            columns={attendanceColumns}
            isLoading={false}
            error={null}
            searchable={false}
            showIndex={true}
            itemsPerPage={Math.max(attendanceRows.length, 1)}
            showPagination={false}
            getRowClassName={(row, index) =>
              row.isSunday
                ? "bg-red-500 text-white font-semibold [&>td]:text-white"
                : index % 2 === 0
                  ? "bg-gray-50 hover:bg-gray-100"
                  : "bg-white hover:bg-gray-100"
            }
          />
        </>
      )}

      <Modal
        isOpen={remarkModal.open}
        onClose={() =>
          setRemarkModal({
            open: false,
            remark: "",
            remarkBy: "",
            remarkStatus: null,
          })
        }
        title="Detail Remark"
      >
        <div className="p-6 text-sm text-gray-800 space-y-5">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line min-h-[80px]">
            {remarkModal.remark || "Tidak ada keterangan tambahan."}
          </p>

          <div className="flex items-center justify-between border-t pt-3 text-xs">
            <span
              className={`px-3 py-1 rounded-full font-medium ${
                remarkModal.remarkStatus === 1
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
              Dibuat oleh:{" "}
              <span className="font-medium">{remarkModal.remarkBy || "-"}</span>
            </span>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={overtimeModal.open}
        onClose={() => setOvertimeModal({ open: false, list: [] })}
        title="Detail Lembur"
        note={`Tanggal: ${formatFullDate(overtimeModal.tanggal)}`}
        size="lg"
      >
        <div className="space-y-5 text-sm">
          {/* SUMMARY */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 border border-gray-200 border-t-4 border-t-green-500 rounded-xl bg-white">
              <p className="text-xs text-gray-700 mb-1">Total Pengajuan</p>
              <p className="text-xl font-semibold text-gray-900">
                {overtimeModal.list.length}
              </p>
            </div>

            <div className="p-4 border border-gray-200 border-t-4 border-t-green-500 rounded-xl bg-white">
              <p className="text-xs text-gray-700 mb-1">Total Jam Lembur</p>
              <p className="text-xl font-semibold text-gray-900">
                {overtimeModal.list.reduce(
                  (a, b) => a + (b.total_hour || 0),
                  0,
                )}{" "}
                Jam
              </p>
            </div>
          </div>

          {/* INFO */}
          <div className="flex items-start gap-3 p-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-xl">
            <FontAwesomeIcon icon={faInfoCircle} className="mt-[2px]" />
            <span>Semua pengajuan pada tanggal ini sudah disetujui.</span>
          </div>

          {/* LIST */}
          {overtimeModal.list.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              Tidak ada data lembur.
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {overtimeModal.list.map((item, i) => (
                <div
                  key={i}
                  className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-gray-900">
                      Pengajuan #{i + 1}
                    </p>
                    <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md">
                      {item.total_hour || 0} Jam
                    </span>
                  </div>

                  {/* TIME INFO */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Mulai</p>
                      <p className="font-semibold text-gray-800">
                        {item.overtime_start || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Selesai</p>
                      <p className="font-semibold text-gray-800">
                        {item.overtime_end || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Durasi</p>
                      <p className="font-semibold text-gray-800">
                        {item.total_hour || 0} Jam
                      </p>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-3 pt-3 border-t text-[11px] text-gray-700">
                    Disetujui oleh <b>{item.approved_by || "-"}</b>
                    <br />
                    {item.approved_at
                      ? new Date(item.approved_at).toLocaleString("id-ID")
                      : "-"}
                  </div>
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