import React, { useEffect, useState } from "react";
import { faSearch, faFolderOpen, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import SectionHeader from "../../components/desktop/SectionHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatFullDate, formatShortDate, formatOvertimeJamBulat, isSunday } from "../../utils/dateUtils";

const AbsensiKantor = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const user = getUserFromToken();
  const canChangeTipe = [1, 4].includes(user.id_perusahaan);
  const canDownloadHRD = [1, 4, 6].includes(user.id_role);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [tanggalArray, setTanggalArray] = useState([]);
  const [dataAbsen, setDataAbsen] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [tipeKaryawan, setTipeKaryawan] = useState(canChangeTipe ? "kantor" : "lapangan");
  const handleBackClick = () => { navigate("/home"); };

  const fetchAbsenData = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const endpoint = tipeKaryawan === "kantor" ? `${apiUrl}/face/attendance/rekap?start=${startDate}&end=${endDate}` : `${apiUrl}/rekap?startDate=${startDate}&endDate=${endDate}`;
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

  const filteredAbsenData = dataAbsen.map((item) => ({
    ...item,
    nama: typeof item.nama === "string" ? item.nama : "-",
  }))
    .filter((item) =>
      item.nama.toLowerCase().includes(searchName.toLowerCase())
    );

  const handleRekapData = async () => {
    if (!filteredAbsenData.length) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Kelola Presensi");
    const offsetCol = 2;
    const offsetRow = 7;
    const tanggalColSpan = tanggalArray.length * 4;
    const totalCols = 3 + tanggalColSpan + 2;
    const jumlahKaryawan = filteredAbsenData.length;
    const summary1 = `Periode Rekapitulasi Presensi: ${formatFullDate(startDate)} - ${formatFullDate(endDate)}`;
    const summary2 = `Jumlah Karyawan: ${jumlahKaryawan} orang`;
    const summary3 = `Tipe Karyawan: ${tipeKaryawan === "kantor" ? "Karyawan Kantor (Face Recognition)" : "Karyawan Lapangan (Aplikasi Absensi Online)"}`;
    const summary4 = `Catatan: Presensi Lapangan dilakukan via aplikasi absensi online (berbasis lokasi kerja). Presensi Kantor menggunakan sistem Face Recognition. Data ini menyajikan ringkasan kehadiran, keterlambatan, dan lemburan secara terstruktur untuk keperluan monitoring dan evaluasi.`;
    worksheet.mergeCells(2, offsetCol, 2, offsetCol + totalCols - 1);
    worksheet.getCell(2, offsetCol).value = summary1;
    worksheet.getCell(2, offsetCol).font = { bold: true, size: 16 };
    worksheet.getCell(2, offsetCol).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.mergeCells(3, offsetCol, 3, offsetCol + totalCols - 1);
    worksheet.getCell(3, offsetCol).value = summary2;
    worksheet.getCell(3, offsetCol).font = { size: 12 };
    worksheet.getCell(3, offsetCol).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.mergeCells(4, offsetCol, 4, offsetCol + totalCols - 1);
    worksheet.getCell(4, offsetCol).value = summary3;
    worksheet.getCell(4, offsetCol).font = { size: 12 };
    worksheet.getCell(4, offsetCol).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.mergeCells(5, offsetCol, 5, offsetCol + totalCols - 1);
    worksheet.getCell(5, offsetCol).value = summary4;
    worksheet.getCell(5, offsetCol).font = { size: 10, color: { argb: "FF6B7280" }, italic: true };
    worksheet.getCell(5, offsetCol).alignment = { vertical: "middle", horizontal: "left" };

    // 🔵 Header
    const headerRow1 = ["Pegawai", "", "Jumlah", "", ""];
    const headerRow2 = ["NIP", "Nama", "Kehadiran", "Keterlambatan", "Lemburan"];

    tanggalArray.forEach((tgl) => {
      const formattedDate = formatShortDate(tgl);
      headerRow1.push(formattedDate, "", "", "");
      headerRow2.push("IN", "LATE", "OUT", "T");
    });

    worksheet.getRow(offsetRow + 1).values = Array(offsetCol - 1).fill(null).concat(headerRow1);
    worksheet.getRow(offsetRow + 2).values = Array(offsetCol - 1).fill(null).concat(headerRow2);

    // Merge header cells
    worksheet.mergeCells(offsetRow + 1, offsetCol, offsetRow + 1, offsetCol + 1); // Pegawai
    worksheet.mergeCells(offsetRow + 1, offsetCol + 2, offsetRow + 1, offsetCol + 4); // Jumlah
    tanggalArray.forEach((_, i) => {
      const start = offsetCol + 5 + i * 4;
      worksheet.mergeCells(offsetRow + 1, start, offsetRow + 1, start + 3);
    });

    // 🔴 Pewarnaan kolom hari Minggu dari header hingga baris terakhir karyawan
    tanggalArray.forEach((tgl, index) => {
      if (!isSunday(tgl)) return;

      // posisi kolom tanggal pertama sekarang ada di offsetCol + 5
      const startCol = offsetCol + 5 + index * 4;
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
        item.nip ?? "",
        item.nama,
        item.total_days ?? "",
        item.total_late ?? "",
        formatOvertimeJamBulat(item.total_overtime) ?? ""
      ];

      const excelRow = worksheet.getRow(currentRowIndex);
      excelRow.values = Array(offsetCol - 1).fill(null).concat(baseRow);
      let colIndex = offsetCol + 5;
      const isEmptyValue = (val) => val === null || val === undefined || val === "" || val === 0;
      tanggalArray.forEach((tgl) => {
        const att = item.attendance?.[tgl] || {};
        const overtimeRaw = att.overtime ?? item.overtimes?.[tgl]?.durasi;
        const overtimeFormatted = formatOvertimeJamBulat(overtimeRaw);
        const isMinggu = isSunday(tgl);
        const lateValue = parseInt(att.late ?? 0);
        const isLate = lateValue >= 1;

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
          isEmptyValue(att.in) ? "" : att.in,
          (lateValue === 0 || isNaN(lateValue)) ? "" : lateValue.toString(),
          isEmptyValue(att.out) ? "" : att.out,
          overtimeFormatted,
        ];

        for (let i = 0; i < 4; i++) {
          const cell = worksheet.getCell(currentRowIndex, colIndex + i);
          cell.value = cellValues[i];
          if (cell.value === "") { cell.font = { color: { argb: "FF9CA3AF" }, italic: true }; }
          if (i === 1 && cell.value === "" && isMinggu) { cell.font = { color: { argb: "FFFFFFFF" }, bold: true }; }
          if (isMinggu) { Object.assign(cell, cellStyles.minggu); }
          if (i === 1 && isLate) {
            Object.assign(cell, cellStyles.late);
          }
        }
        colIndex += 4;
      });
    });

    // Lebar kolom
    worksheet.columns = Array(offsetCol - 1).fill({ width: 4 }).concat([
      { width: 10 }, // NIP
      { width: 28 }, // Nama
      { width: 10 }, // Kehadiran
      { width: 14 }, // Keterlambatan
      { width: 10 }, // Lemburan
      ...tanggalArray.flatMap(() => [
        { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 }
      ])
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
    const tipeLabel = tipeKaryawan === "kantor" ? "Kantor" : "Lapangan";
    const namaFile = `Rekap_Presensi_${tipeLabel}_${formatShortDate(startDate)}_${formatShortDate(endDate)}.xlsx`;
    saveAs(blob, namaFile);
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
    <div className="min-h-screen flex flex-col justify-start">
      <SectionHeader title="Kelola Presensi Karyawan" subtitle="Monitoring Presensi Karyawan secara real-time dan akurat." onBack={handleBackClick}
        actions={
          <>
            {/* Filter Periode */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                Periode Tanggal: {startDate} s/d {endDate}
              </label>
              <div className="flex flex-row items-center gap-2 sm:gap-3">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-auto" />
                <span className="text-sm text-gray-700">s/d</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-auto" />
              </div>
            </div>

            {/* Filter Tipe Karyawan */}
            {canChangeTipe && (
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">
                  Tampilkan Dari :
                </label>
                <select value={tipeKaryawan} onChange={(e) => setTipeKaryawan(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto">
                  <option value="kantor">Aplikasi Face Recognition</option>
                  <option value="lapangan">Aplikasi Absensi Online</option>
                </select>
              </div>
            )}
          </>
        }
      />

      {isDateSelected && (
        <div className="w-full flex flex-row flex-wrap items-center justify-between gap-4 mb-4">
          {/* Kiri: Search */}
          <div className="flex-1 relative min-w-[200px]">
            <input type="text" placeholder="Cari Karyawan..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>

          {/* Kanan: Buttons */}
          <div className="flex items-center">
            {canDownloadHRD && (
              <button onClick={handleRekapData} disabled={filteredAbsenData.length === 0 || loading} className={`flex items-center justify-center gap-2 h-10 px-4 font-semibold rounded-md shadow transition ${filteredAbsenData.length === 0 || loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                <FontAwesomeIcon icon={faDownload} />
                <span className="hidden sm:inline">Unduh Excel</span>
              </button>
            )}
          </div>
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
                      <th colSpan={2} className="sticky top-0 z-10 bg-green-600 text-white border border-green-700 px-3 py-2.5 text-sm text-center min-w-[150px]">
                        Pegawai
                      </th>
                      <th colSpan={3} className="sticky top-0 z-10 bg-green-600 text-white border border-green-700 px-3 py-2.5 text-sm text-center min-w-[80px]">
                        Jumlah
                      </th>
                    </tr>

                    <tr>
                      <th className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-3 py-1 text-xs text-center min-w-[85px]">
                        NIP
                      </th>
                      <th className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-3 py-1 text-xs text-center min-w-[150px]">
                        Nama
                      </th>
                      <th className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-1 text-xs text-center min-w-[60px]">
                        Hadir
                      </th>
                      <th className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-1 text-xs text-center min-w-[60px]">
                        Terlambat
                      </th>
                      <th className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-1 text-xs text-center min-w-[60px]">
                        Lembur
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAbsenData.map((item, idx) => {
                      const isLate = item.total_late > 1; // hanya kalau lebih dari 1 menit
                      return (
                        <tr key={idx} className="hover:bg-gray-200">
                          <td className="border border-gray-300 px-3 py-1 text-center text-xs break-words">{item.nip}</td>
                          <td className="border border-gray-300 px-3 py-1 text-xs break-words font-semibold tracking-wider capitalize">
                            {item.nama}
                          </td>
                          <td className="border border-gray-300 px-3 py-1 text-center text-xs">{item.total_days}</td>
                          {/* Kolom Terlambat */}
                          <td className={`border border-gray-300 px-3 py-1 text-center text-xs ${isLate ? "text-red-700 font-bold" : ""}`}>
                            {isLate ? item.total_late : "-"}
                          </td>
                          <td className="border border-gray-300 px-3 py-1 text-center text-xs">
                            {formatOvertimeJamBulat(item.total_overtime)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto" style={{ flexGrow: 1 }}>
                <table className="border-collapse w-full min-w-max bg-white">
                  <thead>
                    <tr>
                      {tanggalArray.map((tanggal) => {
                        const day = new Date(tanggal).getDay();
                        const isSunday = day === 0;
                        const bgColor = isSunday ? "bg-red-600" : "bg-green-600";
                        const borderColor = isSunday ? "border-red-800" : "border-gray-300";
                        return (
                          <th key={tanggal} colSpan={4} className={`sticky top-0 z-10 text-white ${bgColor} ${borderColor} border px-2 py-0.5 text-center text-xs min-w-[120px]`}>
                            {formatShortDate(tanggal)}
                          </th>
                        );
                      })}
                    </tr>
                    <tr>
                      {tanggalArray.map((tanggal) => {
                        const dayIndex = new Date(tanggal).getDay();
                        const hariArray = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
                        const hari = hariArray[dayIndex];
                        const isSunday = dayIndex === 0;
                        const bgColor = isSunday ? "bg-red-700" : "bg-green-600";
                        const borderColor = isSunday ? "border-red-900" : "border-gray-300";
                        return (
                          <th key={`hari-${tanggal}`} colSpan={4} className={`sticky top-0 z-20 text-white ${bgColor} ${borderColor} border px-2 py-0.5 text-center text-xs`}>
                            {hari}
                          </th>
                        );
                      })}
                    </tr>
                    <tr>
                      {tanggalArray.map((tanggal) => {
                        const day = new Date(tanggal).getDay();
                        const isSunday = day === 0;
                        const bgColor = isSunday ? "bg-red-600" : "bg-green-500";
                        const borderColor = isSunday ? "border-red-800" : "border-gray-300";
                        return (
                          <React.Fragment key={tanggal}>
                            <th className={`text-white ${bgColor} ${borderColor} border px-1 py-1 text-xs`}>IN</th>
                            <th className={`text-white ${bgColor} ${borderColor} border px-1 py-1 text-xs`}>LATE</th>
                            <th className={`text-white ${bgColor} ${borderColor} border px-1 py-1 text-xs`}>OUT</th>
                            <th className={`text-white ${bgColor} ${borderColor} border px-1 py-1 text-xs`}>OVERTIME</th>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAbsenData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-200">
                        {tanggalArray.map((tanggal) => {
                          const inTime = item.attendance[tanggal]?.in || "-";
                          const outTime = item.attendance[tanggal]?.out || "-";
                          const lateMinutes = item.attendance[tanggal]?.late;
                          const LateTime = lateMinutes ? lateMinutes : "-";
                          const isLate = lateMinutes > 0;
                          const overtimeRaw = item.attendance[tanggal]?.overtime ?? item.overtimes?.[tanggal]?.durasi;
                          const Overtime =
                            overtimeRaw !== null && overtimeRaw !== undefined && overtimeRaw !== "" && overtimeRaw !== "0" && overtimeRaw !== 0
                              ? tipeKaryawan === "lapangan"
                                ? overtimeRaw
                                : formatOvertimeJamBulat(overtimeRaw)
                              : "-";
                          const day = new Date(tanggal).getDay();
                          const isSunday = day === 0;
                          const tdClass = `border border-gray-300 px-2 py-1 text-center text-xs min-w-[60px] ${isSunday ? "bg-red-600 text-white font-semibold" : ""
                            }`;

                          return (
                            <React.Fragment key={`time-${tanggal}-${idx}`}>
                              <td className={tdClass}>
                                <span className={(inTime === "-" && !isSunday) ? "text-gray-300" : ""}>
                                  {inTime}
                                </span>
                              </td>
                              <td className={`${tdClass} ${isLate ? "text-red-700 bg-red-200 font-bold" : ""}`}>
                                <span className={LateTime === "-" ? "text-gray-300" : ""}>
                                  {LateTime}
                                </span>
                              </td>
                              <td className={tdClass}>
                                <span className={outTime === "-" ? "text-gray-300" : ""}>
                                  {outTime}
                                </span>
                              </td>
                              <td className={tdClass}>
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
      {loading && <LoadingSpinner message="Mohon tunggu, data absensi sedang diproses..." />}
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
