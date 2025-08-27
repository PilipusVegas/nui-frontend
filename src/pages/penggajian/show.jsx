import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendarAlt, faDownload } from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const DetailPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const { id_user } = useParams();
  const location = useLocation();
  const [dataUser, setDataUser] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("");
  const [totalKehadiran, setTotalKehadiran] = useState(0);
  const [totalLembur, setTotalLembur] = useState("-");
  const [totalKeterlambatan, setTotalKeterlambatan] = useState("-");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const handleBackClick = () => navigate("/penggajian");

  const fetchPayrollDetailCustom = async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithJwt(
        `${apiUrl}/payroll/rekap/${id_user}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data penggajian.");
      const result = await response.json();
      setDataUser(result.data);
      setAttendance(result.data.attendance || {});
      setTotalKehadiran(result.data.total_hari + " Hari" || 0);
      setTotalKeterlambatan(result.data.total_terlambat + " Menit" || "-");
      setTotalLembur(`${Math.floor((result.data.total_overtime || 0) / 60)} Jam`);
      setPeriod(`${startDate} s/d ${endDate}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollDetail = async () => {
    const { start, end } = getDefaultPeriod();
    const startDate = new Date(start).toISOString().split("T")[0];
    const endDate = new Date(end).toISOString().split("T")[0];
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithJwt(
        `${apiUrl}/penggajian/${id_user}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data penggajian.");
      const result = await response.json();

      setDataUser(result.data);
      setAttendance(result.data.attendance || {});
      setTotalKehadiran(result.data.total_hari + " Hari" || 0);
      setTotalKeterlambatan(result.data.total_terlambat + " Menit" || "-");
      setTotalLembur(`${Math.floor((result.data.total_overtime || 0) / 60)} Jam`);
      setPeriod(`${formatTanggalIndonesia(startDate)} s/d ${formatTanggalIndonesia(endDate)}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollDetail();
  }, [location.search]);
  const date_range = Object.keys(attendance || {});

  const handleRekapData = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Rekap Penggajian");
    const addRowWithBorder = (values, style = {}) => {
      const row = sheet.addRow(values);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "left" }; // rata kiri
        if (style.font) cell.font = style.font;
      });
    };

    const addInfoRow = (values) => {
      const row = sheet.addRow(values);
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "left" };
      });
    };

    sheet.addRow([]);
    addInfoRow(["Nama", dataUser?.nama || "-"]);
    addInfoRow(["NIP", dataUser?.nip || "-"]);
    addInfoRow(["Divisi", dataUser?.role || "-"]);
    addInfoRow(["Perusahaan", dataUser?.perusahaan || "-"]);
    addInfoRow(["Periode", period || "-"]);
    addInfoRow(["Total Kehadiran", dataUser?.total_hari + " Hari" || "0"]);
    addInfoRow(["Total Keterlambatan", dataUser?.total_terlambat + " Menit" || "0"]);
    addInfoRow([
      "Total Lemburan",
      dataUser?.total_overtime
        ? `${String(Math.floor(dataUser.total_overtime / 60)).padStart(2, "0")}:${String(dataUser.total_overtime % 60).padStart(2, "0")} Jam`
        : "00:00 Jam",
    ]);
    sheet.addRow([]);

    addRowWithBorder(
      ["No", "Tanggal", "Shift", "IN", "LATE", "OUT", "OVERTIME"],
      { font: { bold: true } }
    );

    date_range.forEach((tanggal, i) => {
      const record = attendance[tanggal];
      const day = new Date(tanggal).getDay(); // 0 = Minggu
      const isSunday = day === 0;

      const row = sheet.addRow([
        i + 1,
        tanggal,
        record?.shift || " ",
        record?.in || " ",
        record?.late || " ",
        record?.out || " ",
        record?.overtime ? `${String(Math.floor(record.overtime / 60)).padStart(2, "0")}:${String(record.overtime % 60).padStart(2, "0")}` : " "
      ]);

      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: isSunday ? { argb: "FFFFFFFF" } : undefined },
          left: { style: "thin", color: isSunday ? { argb: "FFFFFFFF" } : undefined },
          bottom: { style: "thin", color: isSunday ? { argb: "FFFFFFFF" } : undefined },
          right: { style: "thin", color: isSunday ? { argb: "FFFFFFFF" } : undefined },
        };
        cell.alignment = { horizontal: "left" };
        if (isSunday) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDC2626" }, // Merah tailwind 600
          };
          cell.font = {
            color: { argb: "FFFFFFFF" }, // Putih
            bold: true,
          };
        }
      });
    });

    sheet.columns.forEach((col) => {
      let max = 10;
      col.eachCell?.((cell) => {
        const len = cell.value?.toString().length || 10;
        if (len > max) max = len;
      });
      col.width = max + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const query = new URLSearchParams(location.search);
    const start = query.get("start") || getDefaultPeriod().start;
    const end = query.get("end") || getDefaultPeriod().end;
    const startFormatted = formatTanggalForFilename(start);
    const endFormatted = formatTanggalForFilename(end);
    const fileName = `Rekap_${dataUser?.nip || "NIP"}_${startFormatted}_${endFormatted}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  };


  const handleCustomFilter = async () => {
    if (!customStartDate || !customEndDate) return alert("Harap pilih rentang tanggal.");
    navigate(`?start=${customStartDate}&end=${customEndDate}`);
    setIsCustom(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithJwt(
        `${apiUrl}/payroll/rekap/${id_user}?startDate=${customStartDate}&endDate=${customEndDate}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data penggajian.");
      const result = await response.json();
      setDataUser(result.data);
      setAttendance(result.data.attendance || {});
      setTotalKehadiran(result.data.total_hari + " Hari" || 0);
      setTotalKeterlambatan(result.data.total_terlambat + " Menit" || "-");
      setTotalLembur(`${Math.floor((result.data.total_overtime || 0) / 60)} Jam`);
      setPeriod(`${customStartDate} s/d ${customEndDate}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setIsCustom(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const start = query.get("start");
    const end = query.get("end");

    if (start && end) {
      // Jika user sebelumnya filter custom, jalankan langsung fetch custom
      setCustomStartDate(start);
      setCustomEndDate(end);
      fetchPayrollDetailCustom(start, end);
    } else {
      // Jika tidak ada query, ambil default
      fetchPayrollDetail();
    }
  }, [location.search]);


  const formatTanggalIndonesia = (tanggalString) => {
    const tanggal = new Date(tanggalString);
    const day = String(tanggal.getDate()).padStart(2, "0");
    const month = String(tanggal.getMonth() + 1).padStart(2, "0");
    const year = tanggal.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTanggalForFilename = (tanggalString) => {
    const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const tanggal = new Date(tanggalString);
    const tgl = String(tanggal.getDate()).padStart(2, "0");
    const bln = bulan[tanggal.getMonth()];
    const thn = tanggal.getFullYear();
    return `${tgl}-${bln}-${thn}`;
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faArrowLeft} onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 p-2 sm:p-3 rounded-full" />
          <h2 className="text-xl sm:text-3xl font-bold pb-1 text-gray-800">Detail Penggajian Karyawan</h2>
        </div>
        {!loading && dataUser && (
          <button onClick={handleRekapData} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            <FontAwesomeIcon icon={faDownload} />
            <span className="block sm:hidden">Unduh</span>
            <span className="hidden sm:block">Unduh Excel</span>
          </button>
        )}
      </div>
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="bg-gray-200 h-8 w-1/3 rounded"></div>
          <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>

          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg shadow-sm">
          <FontAwesomeIcon icon="triangle-exclamation" className="text-3xl mb-2 text-red-500" />
          <h3 className="text-lg font-semibold mb-1">Terjadi Kesalahan</h3>
          <p className="text-sm">{error || "Maaf, data tidak dapat dimuat saat ini. Silakan coba beberapa saat lagi."}</p>
        </div>
      ) : (
        <div>

          {/* CARD SUMMARY - Ringkasan Ramping */}
          <div className="bg-white border border-green-200 rounded-2xl shadow-sm p-5 w-full mx-auto mb-4">
            {/* Header: Nama & Periode */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center sm:text-left uppercase tracking-widest">
                {dataUser?.nama || "Nama Tidak Tersedia"}
              </h2>
              <p className="text-xs text-center sm:text-left text-green-800 font-semibold tracking-wider bg-green-100 border border-green-200 px-3 py-1 rounded-full mt-2 md:mt-0">
                Periode Default : {period || "Tidak Tersedia"}
              </p>
            </div>

            {/* Info User */}
            <div className="text-sm text-gray-700 space-y-2 border-b-2 border-dashed border-green-200 pb-4 mb-4">
              <div><strong className="inline-block w-24">NIP</strong>: {dataUser?.nip || "-"}</div>
              <div><strong className="inline-block w-24">Divisi</strong>: {dataUser?.role || "-"}</div>
              <div><strong className="inline-block w-24">Perusahaan</strong>: {dataUser?.perusahaan || "-"}</div>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-center">
              {[
                { heading: "Total", label: "Kehadiran", value: totalKehadiran || 0 },
                { heading: "Total", label: "Lemburan", value: totalLembur || 0, highlight: true, link: `/penggajian/detail-lembur/${id_user}`},
                { heading: "Total", label: "Keterlambatan", value: totalKeterlambatan || 0 },
              ].map((item, index) => (
                <div key={index} className={` bg-green-50 border border-green-200 rounded-lg px-2 py-2 sm:py-4 shadow-sm ${item.highlight ? 'cursor-pointer transition-all duration-300 hover:bg-green-100 hover:shadow-lg' : ''}`} onClick={() => item.link && (window.location.href = item.link)}>
                  <p className="text-[10px] sm:text-xs text-green-800 font-medium mb-0.5 tracking-tight">
                    {item.heading}
                  </p>
                  <p className={`text-xs sm:text-lg font-bold tracking-wide ${item.highlight ? 'text-green-700' : 'text-green-700'}`}>
                    {item.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-green-800 font-medium mt-0.5 tracking-tight">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg">
            {/* Filter Tanggal Custom */}
            <div className="mb-4 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">Keterangan Kode Warna:</span>
                <div className="w-4 h-4 bg-red-600 rounded-sm" />
                <span className="text-gray-600 font-medium">Hari Minggu</span>
              </div>

              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <label htmlFor="startDate" className="text-gray-700">Dari</label>
                <input type="date" id="startDate" className="border border-gray-300 rounded-md px-2 py-1 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                <label htmlFor="endDate" className="text-gray-700">s/d</label>
                <input type="date" id="endDate" className="border border-gray-300 rounded-md px-2 py-1 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                <button onClick={handleCustomFilter} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-xs font-semibold">
                  Tampilkan
                </button>
              </div>
            </div>

            {/* Tabel untuk layar besar */}
            <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden text-sm">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-2">No</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Shift</th>
                  <th className="px-4 py-2">Masuk</th>
                  <th className="px-4 py-2">Terlambat</th>
                  <th className="px-4 py-2">Pulang</th>
                  <th className="px-4 py-2">Lemburan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {date_range.map((tanggal, i) => {
                  const record = attendance[tanggal];
                  const day = new Date(tanggal).getDay(); // 0 = Sunday
                  const isSunday = day === 0;
                  return (
                    <tr key={i} className={`text-center hover:bg-gray-200 text-sm ${isSunday ? "bg-red-600 text-white font-semibold hover:bg-red-700" : "text-gray-700"}`}>
                      <td className="px-4 py-0.5">{i + 1}</td>
                      <td className="px-4 py-0.5">{formatTanggalIndonesia(tanggal)}</td>
                      <td className="px-4 py-0.5">{record?.shift || "-"}</td>
                      <td className="px-4 py-0.5">{record?.in || "-"}</td>
                      <td className={`px-4 py-0.5 text-sm ${typeof record?.late === "number" ? record.late >= 1 ? "text-red-600 font-semibold" : "text-gray-800" : "text-gray-300 font-bold"}`}>
                        {typeof record?.late === "number" ? record.late === 0 ? 0 : `${record.late} Menit` : "-"}
                      </td>
                      <td className="px-4 py-0.5">{record?.out || "-"}</td>
                      <td className="px-4 py-0.5">
                        {typeof record?.overtime === "number"
                          ? `${String(Math.floor(record.overtime / 60)).padStart(2, "0")}:00`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPenggajian;