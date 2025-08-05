import React, { useEffect, useState } from "react";
import { faArrowLeft, faSearch, faFolderOpen, faDownload, faEye   } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";

const DataPenggajian = () => {
  const allowedRoles = [1, 4, 6];
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [tanggalArray, setTanggalArray] = useState([]);
  const [dataAbsen, setDataAbsen] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateSelected, setIsDateSelected] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const user = getUserFromToken();
  const roleId = user?.id_role ?? 0;
  const canDownload = allowedRoles.includes(roleId);
  const handleBackClick = () => { navigate("/home");};
  
  const fetchPenggajianData = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const endpoint = `${apiUrl}/payroll/rekap?startDate=${startDate}&endDate=${endDate}`;
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
  
  const filteredAbsenData = dataAbsen
  .map((item) => ({
    ...item,
    nama: typeof item.nama === "string" ? item.nama : "-",
  }))
  .filter((item) =>
    item.nama.toLowerCase().includes(searchName.toLowerCase())
  );

  const handleRekapData = async () => {
    if (!filteredAbsenData.length) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Penggajian Karyawan");
    const offsetCol = 2;
    const offsetRow = 7;
    const tanggalColSpan = tanggalArray.length * 4;
    const totalCols = 3 + tanggalColSpan + 2;
    const jumlahKaryawan = filteredAbsenData.length;
  
    const summary1 = `Rekap data Periode : ${formatTanggal(startDate)} - ${formatTanggal(endDate)}`;
    const summary2 = `Jumlah karyawan pada periode ini : ${jumlahKaryawan} Karyawan`;
  
    // 🟡 Ringkasan
    worksheet.mergeCells(2, offsetCol, 2, offsetCol + totalCols - 1);
    worksheet.getCell(2, offsetCol).value = summary1;
    worksheet.getCell(2, offsetCol).font = { italic: true, size: 12 };
    worksheet.getCell(2, offsetCol).alignment = { vertical: "middle", horizontal: "left" };
  
    worksheet.mergeCells(3, offsetCol, 3, offsetCol + totalCols - 1);
    worksheet.getCell(3, offsetCol).value = summary2;
    worksheet.getCell(3, offsetCol).font = { italic: true, size: 12 };
    worksheet.getCell(3, offsetCol).alignment = { vertical: "middle", horizontal: "left" };
  
    worksheet.mergeCells(4, offsetCol, 4, offsetCol + totalCols - 1);
    worksheet.getCell(4, offsetCol).font = { italic: true, size: 12 };
    worksheet.getCell(4, offsetCol).alignment = { vertical: "middle", horizontal: "left" };
  
    // 🔵 Header
    const headerRow1 = ["Pegawai", "", "Jumlah"];
    const headerRow2 = ["NIP", "Nama", "Kehadiran"];
  
    tanggalArray.forEach((tgl) => {
      const formattedDate = formatTanggal(tgl);
      headerRow1.push(formattedDate, "", "", "");
      headerRow2.push("IN", "LATE", "OUT", "OVERTIME");
    });
  
    headerRow1.push("Jumlah", "");
    headerRow2.push("Keterlambatan", "Lemburan");
  
    worksheet.getRow(offsetRow + 1).values = Array(offsetCol - 1).fill(null).concat(headerRow1);
    worksheet.getRow(offsetRow + 2).values = Array(offsetCol - 1).fill(null).concat(headerRow2);
  
    // Merge header cells
    worksheet.mergeCells(offsetRow + 1, offsetCol, offsetRow + 1, offsetCol + 1); // Pegawai
    worksheet.mergeCells(offsetRow + 1, offsetCol + 2, offsetRow + 1, offsetCol + 2); // Jumlah
    tanggalArray.forEach((_, i) => {
      const start = offsetCol + 3 + i * 4;
      worksheet.mergeCells(offsetRow + 1, start, offsetRow + 1, start + 3);
    });
    worksheet.mergeCells(offsetRow + 1, offsetCol + 3 + tanggalColSpan, offsetRow + 1, offsetCol + 4 + tanggalColSpan); // Keterlambatan & Lembur
  
    // 🔴 Pewarnaan kolom hari Minggu dari header hingga baris terakhir karyawan
    tanggalArray.forEach((tgl, index) => {
      if (!isSunday(tgl)) return;

      const startCol = offsetCol + 3 + index * 4; // Kolom pertama untuk tanggal ini
      const endCol = startCol + 3; // IN, LATE, OUT, OVERTIME

      const startRow = offsetRow + 1; // Header (baris pertama tanggal)
      const endRow = offsetRow + 3 + jumlahKaryawan - 1; // Baris terakhir data karyawan

      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          const cell = worksheet.getCell(row, col);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDC2626" }, // Merah solid
          };
          cell.font = {
            color: { argb: "FFFFFFFF" },
            bold: true,
          };
        }
      }
    });

    // 🟣 Data Pegawai
    filteredAbsenData.forEach((item, index) => {
      const currentRowIndex = offsetRow + 3 + index;
      const baseRow = [
        item.nip ?? "-",
        item.nama,
        item.total_days,
      ];
    
      const excelRow = worksheet.getRow(currentRowIndex);
      excelRow.values = Array(offsetCol - 1).fill(null).concat(baseRow);
    
      let colIndex = offsetCol + 3;
    
      tanggalArray.forEach((tgl) => {
        const att = item.attendance?.[tgl] || {};
        const overtimeRaw = att.overtime ?? item.overtimes?.[tgl]?.durasi;
        const overtimeFormatted = formatOvertimeJamBulat(overtimeRaw);
    
        const isMinggu = isSunday(tgl);
        const isLate = parseInt(att.late ?? 0) > 0;
    
        const cellStyles = {
          minggu: {
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFDC2626" } },
            font: { color: { argb: "FFFFFFFF" }, bold: true },
          },
          late: {
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFB91C1C" } },
            font: { color: { argb: "FFFFFFFF" }, bold: true },
          },
        };
    
        const cellValues = [
          att.in ?? "-",
          att.late ?? "-",
          att.out ?? "-",
          overtimeFormatted,
        ];
    
        for (let i = 0; i < 4; i++) {
          const cell = worksheet.getCell(currentRowIndex, colIndex + i);
          cell.value = cellValues[i];
          if (cell.value === "-") {
            cell.font = { color: { argb: "FF9CA3AF" }, italic: true };
          }
          if (isMinggu) {
            Object.assign(cell, cellStyles.minggu);
          }
          if (i === 1 && isLate) {
            Object.assign(cell, cellStyles.late);
          }
        }
        colIndex += 4;
      });
    
      // ⬇ Tambahkan nilai jumlah keterlambatan dan lemburan di kolom paling akhir
      const lastLateCol = offsetCol + 3 + tanggalArray.length * 4;
      worksheet.getCell(currentRowIndex, lastLateCol).value = item.total_late ?? "-";
      worksheet.getCell(currentRowIndex, lastLateCol + 1).value = formatOvertimeJamBulat(item.total_overtime) ?? "-";
    });

    // Lebar kolom
    worksheet.columns = Array(offsetCol - 1).fill({ width: 4 }).concat([
      { width: 14 }, // NIP
      { width: 20 }, // Nama
      { width: 14 }, // Kehadiran
      ...tanggalArray.flatMap(() => [
        { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }
      ]),
      { width: 14 }, // Total Late
      { width: 14 }, // Total Overtime
    ]);
  
    // Border
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
    saveAs(blob, `Rekap Penggajian_${formatTanggal(startDate)}_s/d_${formatTanggal(endDate)}.xlsx`);
  };
  
  const formatTanggal = (tanggalString) => {
    const tanggal = new Date(tanggalString);
    const tgl = String(tanggal.getDate()).padStart(2, '0');
    const bln = String(tanggal.getMonth() + 1).padStart(2, '0');
    const thn = tanggal.getFullYear();
    return `${tgl}-${bln}-${thn}`;
  };

  const formatOvertimeJamBulat = (totalMenit) => {
    const menit = parseInt(totalMenit, 10);
    if (isNaN(menit) || menit < 60) return "-"; // hanya jika >= 60 menit baru dihitung jam
    const jam = Math.floor(menit / 60);
    return `${jam.toString().padStart(2, '0')}:00`;
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
      fetchPenggajianData();
    }
  }, [startDate, endDate]);


  const isSunday = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDay() === 0; // 0 = Minggu
  };

  return (
    <div className="flex flex-col justify-start">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Kiri: Tombol Kembali + Judul */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
              Kelola Penggajian Karyawan
            </h2>
          </div>

          {/* Kanan: Rentang Tanggal */}
          {isDateSelected && (
            <div className="flex flex-col sm:flex-row sm:items-end lg:items-center gap-2 w-full lg:w-auto">
              <div className="flex flex-col w-full max-w-md">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  Periode Tanggal: {startDate} s/d {endDate}
                </label>
                <div className="flex flex-nowrap gap-2">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full"/>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full"/>
                </div>
              </div>

              {/* Tombol Unduh Excel untuk Desktop */}
              {canDownload && (
                <button onClick={handleRekapData} disabled={filteredAbsenData.length === 0 || loading} className={`hidden sm:flex items-center justify-center gap-2 h-10 px-4 sm:mt-5 rounded-md shadow transition whitespace-nowrap ${filteredAbsenData.length === 0 || loading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  title="Unduh Excel"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span className="hidden sm:inline text-sm">Unduh Excel</span>
                </button>
              )}
            </div>
          )}
        </div>
        {isDateSelected && (
        <div className="w-full flex items-center gap-2 ">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input type="text" placeholder="Cari Nama Karyawan..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full h-10 border border-green-600 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"/>
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>

          {/* Tombol Unduh Excel - Mobile Only */}
          {canDownload && (
            <button onClick={handleRekapData} disabled={filteredAbsenData.length === 0 || loading} className={`flex items-center justify-center h-10 w-10 rounded-md transition sm:hidden ${filteredAbsenData.length === 0 || loading ? "bg-gray-300 text-white cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white" }`} title="Unduh Excel">
              <FontAwesomeIcon icon={faDownload} />
            </button>
          )}
        </div>
        )}
      </div>


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
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-1 text-xs text-center min-w-[70px]">Kehadiran</th>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-1 text-xs text-center min-w-[70px]">Keterlambatan</th>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-1 text-xs text-center min-w-[70px]">Lemburan</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsenData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-200">
                    <td className="border border-gray-300 px-3 py-1 text-xs text-center break-words">{item.nip}</td>
                    <td onClick={() => navigate(`/penggajian/${item.id_user}`)} className="relative group border border-gray-300 pl-2 pr-8 py-1 text-xs break-words font-semibold tracking-wider cursor-pointer  hover:bg-gray-200">
                      {/* Nama dengan efek hover */}
                      <span className="group-hover:text-green-600 group-hover:underline transition duration-200">
                        {item.nama}
                      </span>
                      {/* Ikon Mata */}
                      <div onClick={(e) => { e.stopPropagation(); navigate(`/penggajian/${item.id_user}`); }} className="absolute top-1/2 -translate-y-1/2 right-2 text-gray-400 group-hover:text-green-600 hidden group-hover:block transition duration-200" >
                        <FontAwesomeIcon icon={faEye} />
                      </div>
                    </td>
                    <td className="border border-gray-300 px-3 py-1 text-center text-xs">{item.total_days}</td>
                    <td className="border border-gray-300 px-3 py-1 text-center text-xs">{item.total_late}</td>
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
                  {tanggalArray.map((tanggal) => {
                    const isMinggu = isSunday(tanggal);
                    const headerClass = isMinggu ? "bg-red-600 text-white border border-red-800" : "bg-green-600 text-white";
                    return (
                      <th key={tanggal} colSpan={4} className={`sticky top-0 z-10 border border-green-800 px-2 py-1 text-center text-sm min-w-[120px] ${headerClass}`}>
                        {formatTanggal(tanggal)}
                      </th>
                    );
                  })}
                </tr>
                <tr>
                  {tanggalArray.map((tanggal) => {
                    const isMinggu = isSunday(tanggal);
                    const headerClass = isMinggu ? "bg-red-600 text-white border border-red-800" : "bg-green-500 text-white";
                    return (
                      <React.Fragment key={`inout-${tanggal}`}>
                        <th className={`sticky top-[20px] z-10 border border-green-600 px-2 py-1 text-xs text-center min-w-[60px] ${headerClass}`}>IN</th>
                        <th className={`sticky top-[20px] z-10 border border-green-600 px-2 py-1 text-xs text-center min-w-[60px] ${headerClass}`}>LATE</th>
                        <th className={`sticky top-[20px] z-10 border border-green-600 px-2 py-1 text-xs text-center min-w-[60px] ${headerClass}`}>OUT</th>
                        <th className={`sticky top-[20px] z-10 border border-green-600 px-2 py-1 text-xs text-center min-w-[60px] ${headerClass}`}>OVERTIME</th>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredAbsenData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-200">
                    {tanggalArray.map((tanggal) => {
                      const isMinggu = isSunday(tanggal);
                      const bgColor = isMinggu ? "bg-red-600 text-white font-bold" : "";
                      const inTime = item.attendance[tanggal]?.in || "-";
                      const outTime = item.attendance[tanggal]?.out || "-";
                      const lateMinutes = item.attendance[tanggal]?.late;
                      const LateTime = lateMinutes ? lateMinutes : "-";
                      const isLate = lateMinutes > 0;
                      const overtimeRaw = item.attendance[tanggal]?.overtime;
                      const Overtime = overtimeRaw !== null && overtimeRaw !== undefined && overtimeRaw !== "" && overtimeRaw !== "0" && overtimeRaw !== 0 ? formatOvertimeJamBulat(overtimeRaw) : "-";
                      return (
                        <React.Fragment key={`time-${tanggal}-${idx}`}>
                          <td className={`border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px] ${bgColor}`}>
                            <span className={inTime === "-" ? "text-gray-300" : ""}>
                              {inTime}
                            </span>
                          </td>
                          <td className={`border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px] ${bgColor} ${isLate ? "bg-red-700 text-white font-semibold" : "text-black"}`}>
                            <span className={LateTime === "-" ? "text-gray-300" : ""}>
                              {LateTime}
                            </span>
                          </td>
                          <td className={`border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px] ${bgColor}`}>
                            <span className={outTime === "-" ? "text-gray-300" : ""}>
                              {outTime}
                            </span>
                          </td>
                          <td className={`border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px] ${bgColor}`}>
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

export default DataPenggajian;
