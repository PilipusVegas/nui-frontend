import React, { useEffect, useState } from "react";
import { faArrowLeft, faSearch, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const handleBackClick = () => {
    navigate("/home");
  };

  const fetchAbsenData = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/face/attendance/rekap?start=${startDate}&end=${endDate}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data absensi.");
      const result = await response.json();

      setTanggalArray(Array.isArray(result.date_range) ? result.date_range : []);
      setDataAbsen(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setDataAbsen([]);
      setTanggalArray([]);
    } finally {
      setLoading(false);
    }
  };

  // const handleTampilkanClick = () => {
  //   if (!startDate || !endDate) {
  //     alert("Silakan pilih rentang tanggal terlebih dahulu.");
  //     return;
  //   }
  //   setIsDateSelected(true);
  //   fetchAbsenData();
  // };

  // Filter berdasarkan search name
  const filteredAbsenData = dataAbsen.filter((item) =>
    item.nama.toLowerCase().includes(searchName.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAbsenData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAbsenData.length / itemsPerPage);

  const handleRekapData = async () => {
    if (!filteredAbsenData.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Absensi");

    const totalCols = 3 + tanggalArray.length * 3;
    const offsetCol = 2; // Spasi 1 kolom kiri
    const offsetRow = 4; // Mulai tabel di baris ke-4 (ringkasan di baris 2 dan 3)

    const jumlahKaryawan = filteredAbsenData.length;
    const summary1 = `Rekap data Periode : ${formatTanggal(startDate)} - ${formatTanggal(endDate)}`;
    const summary2 = `Jumlah karyawan pada periode ini : ${jumlahKaryawan} Karyawan`;

    // 🟡 Baris Ringkasan 1 (baris 2)
    worksheet.mergeCells(2, offsetCol, 2, offsetCol + totalCols - 1);
    const summaryCell1 = worksheet.getCell(2, offsetCol);
    summaryCell1.value = summary1;
    summaryCell1.font = { italic: true, size: 12 };
    summaryCell1.alignment = { vertical: 'middle', horizontal: 'left' };

    // 🟡 Baris Ringkasan 2 (baris 3)
    worksheet.mergeCells(3, offsetCol, 3, offsetCol + totalCols - 1);
    const summaryCell2 = worksheet.getCell(3, offsetCol);
    summaryCell2.value = summary2;
    summaryCell2.font = { italic: true, size: 12 };
    summaryCell2.alignment = { vertical: 'middle', horizontal: 'left' };


    // 🔵 Baris Header Utama (baris 5)
    const headerRow2 = ["Pegawai", "Jumlah", ""];
    tanggalArray.forEach((tgl) => {
      const formattedDate = formatTanggal(tgl);
      headerRow2.push(formattedDate, "", "");
    });
    worksheet.getRow(offsetRow + 1).values = Array(offsetCol - 1).fill(null).concat(headerRow2);

    // Merge kolom "Jumlah"
    worksheet.mergeCells(offsetRow + 1, offsetCol + 1, offsetRow + 1, offsetCol + 2);

    // Merge setiap tanggal (3 kolom per tanggal)
    tanggalArray.forEach((_, i) => {
      worksheet.mergeCells(
        offsetRow + 1,
        offsetCol + 3 + i * 3,
        offsetRow + 1,
        offsetCol + 5 + i * 3
      );
    });

    // 🔵 Baris Subheader (baris 6)
    const headerRow3 = ["Nama", "Kehadiran", "Keterlambatan"];
    tanggalArray.forEach(() => {
      headerRow3.push("IN", "OUT", "LATE");
    });
    worksheet.getRow(offsetRow + 2).values = Array(offsetCol - 1).fill(null).concat(headerRow3);

    // 🟣 Baris Data Pegawai (mulai baris 7)
    filteredAbsenData.forEach((item, index) => {
      const row = [item.nama, item.total_days, formatMenitToJamMenit(item.total_late)];
      tanggalArray.forEach((tgl) => {
        const attendance = item.attendance?.[tgl] || {};
        const inTime = attendance.in ?? "-";
        const outTime = attendance.out ?? "-";
        const lateTime = formatMenitToJamMenit(attendance.late);
        row.push(inTime, outTime, lateTime);
      });
      worksheet.getRow(offsetRow + 3 + index).values = Array(offsetCol - 1).fill(null).concat(row);
    });

    // 🔧 Lebar Kolom
    worksheet.columns = [
      {}, // kolom 1 (kosong)
      {}, // kolom 2 (kosong = offsetCol - 1)
      { width: 20 }, // Nama
      { width: 14 }, // Kehadiran
      { width: 14 }, // Keterlambatan
      ...tanggalArray.flatMap(() => [
        { width: 12 }, // IN
        { width: 12 }, // OUT
        { width: 12 }, // LATE
      ]),
    ];

    // 🧱 Tambahkan border ke SELAIN ringkasan (baris 4 ke bawah)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < offsetRow) return; // Lewati ringkasan
      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Rekap_Absensi_${formatTanggal(startDate)}_sampai_${formatTanggal(endDate)}.xlsx`);
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

  const getDefaultPeriod = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); 
    const start = new Date(year, month, 22);
    const end = new Date(year, month + 1, 21); 
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
  }, [startDate, endDate]);
  
  
  return (
    <div className="min-h-screen flex flex-col justify-start px-6 pt-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-4 md:space-y-0">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faArrowLeft}  title="Back to Home"  onClick={handleBackClick}  className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
          <h2 className="text-3xl font-bold text-gray-800 pb-1">Kelola Absensi Kantor</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-1" />
          <span className="text-sm">s/d</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-md px-4 py-1" />
          {/* <button onClick={handleTampilkanClick} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Tampilkan Data
          </button> */}
        </div>
      </div>

      {/* Search Bar */}
      {isDateSelected && (
        <div className="flex justify-end items-center w-full flex-wrap gap-4 mb-4">
          <div className="relative w-full md:w-80">
            <input type="text" placeholder="Cari nama" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="border border-gray-300 rounded-lg p-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-green-600"/>
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FontAwesomeIcon icon={faSearch} />
            </span>
          </div>
          <button onClick={handleRekapData} disabled={filteredAbsenData.length === 0} className={`font-semibold py-2 px-6 rounded-md shadow transition  ${filteredAbsenData.length === 0   ? "bg-gray-400 cursor-not-allowed text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}>
            Unduh Excel
          </button>
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
                  <th colSpan={2} className="sticky top-0 z-10 bg-green-600 text-white border border-green-700 px-3 py-1 text-sm text-center min-w-[150px]">
                    Pegawai
                  </th>
                  <th colSpan={2} className="sticky top-0 z-10 bg-green-600 text-white border border-green-700 px-3 py-1 text-sm text-center min-w-[80px]">
                    Jumlah
                  </th>
                </tr>
                <tr>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-3 py-2 text-sm text-center min-w-[150px]">
                    NIP
                  </th>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-3 py-2 text-sm text-center min-w-[150px]">
                    Nama
                  </th>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-3 py-2 text-sm text-center min-w-[80px]">
                    Kehadiran
                  </th>
                  <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-3 py-2 text-sm text-center min-w-[80px]">
                    Keterlambatan
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-3 py-2 text-sm break-words">
                      {item.nip}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm break-words">
                      {item.nama}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                      {item.total_days}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center text-sm">
                      {formatMenitToJamMenit(item.total_late)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT TABLE: Tanggal + In/Out (Scrollable) */}
          <div className="overflow-x-auto overflow-y-auto" style={{ flexGrow: 1 }}>
            <table className="border-collapse w-full min-w-max bg-white">
              <thead>
                <tr>
                  {tanggalArray.map((tanggal) => (
                    <th key={tanggal} colSpan={3} className="sticky top-0 z-10 bg-green-600 text-white border border-green-700 px-2 py-1 text-center text-sm min-w-[120px]">
                      {formatTanggal(tanggal)}
                    </th>
                  ))}
                </tr>
                <tr>
                  {tanggalArray.map((tanggal) => (
                    <React.Fragment key={`inout-${tanggal}`}>
                      <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-2 py-2 text-sm text-center min-w-[60px]">
                        In
                      </th>
                      <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-2 py-2 text-sm text-center min-w-[60px]">
                        Out
                      </th>
                      <th className="sticky top-[20px] z-10 bg-green-500 text-white border border-green-600 px-2 py-2 text-sm text-center min-w-[60px]">
                        Late
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    {tanggalArray.map((tanggal) => {
                      const inTime = item.attendance[tanggal]?.in ?? "-";
                      const outTime = item.attendance[tanggal]?.out ?? "-";
                      const lateMinutes = item.attendance[tanggal]?.late; 
                      const LateTime = formatMenitToJamMenit(lateMinutes) ?? "-";
                      const isLate = lateMinutes > 1;

                      return (
                        <React.Fragment key={`time-${tanggal}-${idx}`}>
                          <td className="border border-gray-300 px-2 py-2 text-center text-sm min-w-[60px]">
                            {inTime}
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-center text-sm min-w-[60px]">
                            {outTime}
                          </td>
                          <td className={`border border-gray-300 px-2 py-2 text-center text-sm min-w-[60px] ${isLate ? "bg-red-700 text-white font-semibold" : "text-black" }`}>
                            {LateTime}
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
