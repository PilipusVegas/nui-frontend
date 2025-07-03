import React, { useEffect, useState } from "react";
import { faArrowLeft, faSearch, faFolderOpen, faDownload   } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const AbsensiKantor = () => {
  const navigate = useNavigate();
  const [absenData, setAbsenData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [tanggalArray, setTanggalArray] = useState([]);
  const [dataAbsen, setDataAbsen] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateSelected, setIsDateSelected] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const roleId = parseInt(localStorage.getItem("roleId"), 10);
  const allowedRoles = [4, 6];
  const canDownload = allowedRoles.includes(roleId);
  const canChangeTipe = allowedRoles.includes(roleId);
  const [tipeKaryawan, setTipeKaryawan] = useState(canChangeTipe ? "kantor" : "lapangan");
  
  

  const handleBackClick = () => {
    navigate("/home");
  };

  const fetchAbsenData = async () => {
    if (!startDate || !endDate) return;
  
    setLoading(true);
    try {
      const endpoint =
        tipeKaryawan === "kantor"
          ? `${apiUrl}/face/attendance/rekap?start=${startDate}&end=${endDate}`
          : `${apiUrl}/rekap?startDate=${startDate}&endDate=${endDate}`;
  
      const response = await fetch(endpoint);
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
  

  const filteredAbsenData = dataAbsen
  .map((item) => ({
    ...item,
    nama: typeof item.nama === "string" ? item.nama : "-",
  }))
  .filter((item) => item.nama.toLowerCase().includes(searchName.toLowerCase()));


  const handleRekapData = async () => {
    if (!filteredAbsenData.length) return;
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Absensi");
  
    const totalCols = 5 + tanggalArray.length * 4;
    const offsetCol = 2;
    const offsetRow = 4;
  
    const jumlahKaryawan = filteredAbsenData.length;
    const summary1 = `Rekap data Periode : ${formatTanggal(startDate)} - ${formatTanggal(endDate)}`;
    const summary2 = `Jumlah karyawan pada periode ini : ${jumlahKaryawan} Karyawan`;
  
    // 🟡 Ringkasan
    worksheet.mergeCells(2, offsetCol, 2, offsetCol + totalCols - 1);
    const summaryCell1 = worksheet.getCell(2, offsetCol);
    summaryCell1.value = summary1;
    summaryCell1.font = { italic: true, size: 12 };
    summaryCell1.alignment = { vertical: 'middle', horizontal: 'left' };
  
    worksheet.mergeCells(3, offsetCol, 3, offsetCol + totalCols - 1);
    const summaryCell2 = worksheet.getCell(3, offsetCol);
    summaryCell2.value = summary2;
    summaryCell2.font = { italic: true, size: 12 };
    summaryCell2.alignment = { vertical: 'middle', horizontal: 'left' };
  
    // 🔵 Header Utama (baris 5)
    const headerRow2 = ["Pegawai", "", "Jumlah", "", ""];
    tanggalArray.forEach((tgl) => {
      const formattedDate = formatTanggal(tgl);
      headerRow2.push(formattedDate, "", "", "");
    });
    worksheet.getRow(offsetRow + 1).values = Array(offsetCol - 1).fill(null).concat(headerRow2);
  
    // Merge "Pegawai" (NIP + Nama)
    worksheet.mergeCells(offsetRow + 1, offsetCol, offsetRow + 1, offsetCol + 1);
  
    // Merge "Jumlah" (Kehadiran, Keterlambatan, Lemburan)
    worksheet.mergeCells(offsetRow + 1, offsetCol + 2, offsetRow + 1, offsetCol + 4);
  
    // Merge setiap tanggal (4 kolom: IN, OUT, LATE, OVERTIME)
    tanggalArray.forEach((_, i) => {
      const start = offsetCol + 5 + i * 4;
      const end = start + 3;
      worksheet.mergeCells(offsetRow + 1, start, offsetRow + 1, end);
    });
  
    // 🔵 Baris Subheader (baris 6)
    const headerRow3 = ["NIP", "Nama", "Kehadiran", "Keterlambatan", "Lemburan"];
    tanggalArray.forEach(() => {
      headerRow3.push("IN", "OUT", "LATE", "OVERTIME");
    });
    worksheet.getRow(offsetRow + 2).values = Array(offsetCol - 1).fill(null).concat(headerRow3);
  
    // 🟣 Baris Data Pegawai
    filteredAbsenData.forEach((item, index) => {
        const row = [
          item.nip ?? "-",
          item.nama,
          item.total_days,
          formatMenitToJamMenit(item.total_late),
          formatOvertimeJamBulat(item.total_overtime),
        ];
        tanggalArray.forEach((tgl) => {
          const att = item.attendance?.[tgl] || {};
          const overtimeRaw = att.overtime ?? item.overtimes?.[tgl]?.durasi;
        
          const overtimeFormatted =
            tipeKaryawan === "lapangan"
              ? (overtimeRaw && overtimeRaw !== "0" ? overtimeRaw : "-")
              : formatOvertimeJamBulat(overtimeRaw);
        
          row.push(
            att.in ?? "-",
            att.out ?? "-",
            formatMenitToJamMenit(att.late),
            overtimeFormatted
          );
        });
        
      worksheet.getRow(offsetRow + 3 + index).values = Array(offsetCol - 1).fill(null).concat(row);
    });
  
    // 🔧 Lebar kolom
    worksheet.columns = [
      {}, // kolom 1 (kosong)
      {}, // kolom 2 (kosong = offsetCol - 1)
      { width: 14 }, // NIP
      { width: 20 }, // Nama
      { width: 14 }, // Kehadiran
      { width: 14 }, // Terlambat
      { width: 14 }, // Lembur
      ...tanggalArray.flatMap(() => [
        { width: 12 }, // IN
        { width: 12 }, // OUT
        { width: 12 }, // LATE
        { width: 12 }, // OVERTIME
      ]),
    ];
  
    // 🧱 Tambahkan border dari baris ke-4 ke bawah
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < offsetRow) return;
      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
  
    // 💾 Simpan file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Rekap_Presensi_${formatTanggal(startDate)}_sampai_${formatTanggal(endDate)}.xlsx`);
  };

  const formatTanggal = (tanggalString) => {
    const tanggal = new Date(tanggalString);
    const tgl = String(tanggal.getDate()).padStart(2, '0');
    const bln = String(tanggal.getMonth() + 1).padStart(2, '0');
    const thn = tanggal.getFullYear();
    return `${tgl}-${bln}-${thn}`;
  };

  const formatMenitToJamMenit = (totalMenit) => {
    if (!totalMenit || isNaN(totalMenit)) return "-";
    const jam = Math.floor(totalMenit / 60);
    const menit = totalMenit % 60;
    return `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}`;
  };

  const formatOvertimeJamBulat = (totalMenit) => {
    const menit = parseInt(totalMenit, 10);
    if (!menit || isNaN(menit)) return "-";
    const jam = Math.floor(menit / 60);
    return `${jam.toString().padStart(2, '0')}:00`;
  };
  
  
  const getDefaultPeriod = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); 
    const start = new Date(year, month - 1, 22);
    const end = new Date(year, month, 21); 
    const toInputDate = (date) => date.toISOString().split("T")[0];
    return {
      start: toInputDate(start),
      end: toInputDate(end),
    };
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
  }, [startDate, endDate, tipeKaryawan]);
  
  return (
    <div className="min-h-screen flex flex-col justify-start px-6 pt-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        {/* Kiri: Tombol Kembali dan Judul */}
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            Kelola Presensi Karyawan
          </h2>
        </div>

        {/* Kanan: Rentang Tanggal dan Select Tipe Karyawan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
          {/* Rentang Tanggal */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Periode Tanggal: {startDate} s/d {endDate}
            </label>
            <div className="flex flex-row items-center gap-2 sm:gap-3">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-auto"/>
              <span className="text-sm text-gray-700">s/d</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-auto"/>
            </div>
          </div>

          {/* Select Tipe Karyawan */}
          {canChangeTipe && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">Tampilkan Dari : </label>
              <select value={tipeKaryawan} onChange={(e) => setTipeKaryawan(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto">
                <option value="kantor">Aplikasi Face Recognition</option>
                <option value="lapangan">Aplikasi Absensi Online</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {isDateSelected && (
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        {/* Kolom kiri: Search */}
        <div className="w-full md:w-auto flex-1 relative">
          <input type="text" placeholder="Cari Karyawan..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"/>
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>

    {/* Kolom kanan: Tombol hanya untuk role tertentu */}
    {canDownload && (
      <div className="flex items-center gap-4 flex-wrap md:flex-nowrap justify-end w-full md:w-auto">
        <button onClick={handleRekapData} disabled={filteredAbsenData.length === 0 || loading} className={`flex items-center justify-center gap-2 h-10 px-4 font-semibold rounded-md shadow transition ${
            filteredAbsenData.length === 0 || loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          <FontAwesomeIcon icon={faDownload} />
          <span className="hidden md:inline">Unduh Excel</span>
        </button>
      </div>
    )}
  </div>
)}


      {/* Data Table */}
      {isDateSelected && !error && dataAbsen.length > 0 && (
        <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-300 bg-white">
        <div className="min-w-full max-w-[30vw]">
          <div className="flex w-full">
          {/* LEFT TABLE: Pegawai + Jumlah Kehadiran */}
          <div className="flex flex-col border-r bg-white shrink-0" style={{ borderRight: "1px solid #ccc" }}>
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th colSpan={2} className="sticky top-0 z-10 bg-green-600 text-white border border-green-700 px-3 py-1 text-sm text-center min-w-[150px]">Pegawai</th>
                  <th colSpan={3} className="sticky top-0 z-10 bg-green-600 text-white border border-green-700 px-3 py-1 text-sm text-center min-w-[80px]">Jumlah</th>
                </tr>
                <tr>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-3 py-1 text-xs text-center min-w-[100px]">NIP</th>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-3 py-1 text-xs text-center min-w-[150px]">Nama</th>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-1 text-xs text-center min-w-[80px]">Kehadiran</th>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-1 text-xs text-center min-w-[80px]">Keterlambatan</th>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-1 text-xs text-center min-w-[80px]">Lemburan</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsenData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-3 py-1 text-xs break-words">{item.nip}</td>
                    <td className="border border-gray-300 px-3 py-1 text-xs break-words font-semibold tracking-wider">{item.nama}</td>
                    <td className="border border-gray-300 px-3 py-1 text-center text-xs">{item.total_days}</td>
                    <td className="border border-gray-300 px-3 py-1 text-center text-xs">{formatMenitToJamMenit(item.total_late)}</td>
                    <td className="border border-gray-300 px-3 py-1 text-center text-xs">{formatOvertimeJamBulat(item.total_overtime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto" style={{ flexGrow: 1 }}>
            <table className="border-collapse w-full min-w-max bg-white">
              <thead>
                <tr>
                  {tanggalArray.map((tanggal) => (
                    <th key={tanggal} colSpan={4} className="sticky top-0 z-10 bg-green-600 text-white border border-green-800 px-2 py-1 text-center text-sm min-w-[120px]">
                      {formatTanggal(tanggal)}
                    </th>
                  ))}
                </tr>
                <tr>
                  {tanggalArray.map((tanggal) => (
                    <React.Fragment key={`inout-${tanggal}`}>
                      <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-2 py-1 text-xs text-center min-w-[60px]">In</th>
                      <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-2 py-1 text-xs text-center min-w-[60px]">Out</th>
                      <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-2 py-1 text-xs text-center min-w-[60px]">Late</th>
                      <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-2 py-1 text-xs text-center min-w-[60px]">Overtime</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAbsenData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    {tanggalArray.map((tanggal) => {
                      const inTime = item.attendance[tanggal]?.in || "-";
                      const outTime = item.attendance[tanggal]?.out || "-";
                      const lateMinutes = item.attendance[tanggal]?.late;
                      const LateTime = lateMinutes ? formatMenitToJamMenit(lateMinutes) : "-";
                      const isLate = lateMinutes > 1;
                      const overtimeRaw = item.attendance[tanggal]?.overtime ?? item.overtimes?.[tanggal]?.durasi;
                      const Overtime = overtimeRaw !== null && overtimeRaw !== undefined && overtimeRaw !== "" && overtimeRaw !== "0" && overtimeRaw !== 0 ? (tipeKaryawan === "lapangan" ? overtimeRaw : formatOvertimeJamBulat(overtimeRaw)) : "-";
                      return (
                        <React.Fragment key={`time-${tanggal}-${idx}`}>
                          <td className="border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px]">
                            <span className={inTime === "-" ? "text-gray-300" : ""}>
                              {inTime}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px]">
                            <span className={outTime === "-" ? "text-gray-300" : ""}>
                              {outTime}
                            </span>
                          </td>
                          <td className={`border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px] ${isLate ? "bg-red-700 text-white font-semibold" : "text-black"}`}>
                            <span className={LateTime === "-" ? "text-gray-300" : ""}>
                              {LateTime}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px]">
                            <span className={Overtime === "-" ? "text-gray-300" : ""}>
                              {Overtime}
                            </span>
                          </td>
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

      {!isDateSelected && (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-gray-600">
            <FontAwesomeIcon icon={faSearch} className="text-5xl mb-4 text-green-600 animate-pulse" />
            <p className="text-lg font-medium">
              Pilih rentang tanggal terlebih dahulu untuk menampilkan data
            </p>
          </div>
        </div>
      )}

      {/* Loading & Error */}
      {loading && <p className="text-center text-gray-500 mt-6">Loading data...</p>}
      {!loading && !error && isDateSelected && dataAbsen.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-12 text-gray-600">
          <FontAwesomeIcon icon={faFolderOpen} className="text-6xl mb-4 text-gray-600" />
          <p className="text-lg font-semibold">Data pada periode ini masih kosong</p>
          <p className="text-sm text-gray-500">Silakan pilih rentang tanggal yang lain</p>
        </div>
      )}
    </div>
  );
};

export default AbsensiKantor;
