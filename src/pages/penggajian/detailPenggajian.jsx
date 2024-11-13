import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";

const DetailPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const { id_user } = useParams();
  const location = useLocation();
  const [dataUser, setDataUser] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("");
  const [totalKehadiran, setTotalKehadiran] = useState(0);
  const [totalKeterlambatan, setTotalKeterlambatan] = useState("00:00");
  const [totalLembur, setTotalLembur] = useState("00:00");

  const handleBackClick = () => {
    navigate(-1);
  };

  const fetchPayrollDetail = async () => {
    const startDate = sessionStorage.getItem("startDate");
    const endDate = sessionStorage.getItem("endDate");

    if (!startDate || !endDate) {
      setError("Please select a start date and end date.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/payroll/detail/${id_user}?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error("Failed to fetch payroll detail data");
      const result = await response.json();
      setDataUser(result);
      setPayrollData(result.data || []);

      // Calculate total kehadiran, keterlambatan, and lembur
      const kehadiranCount = result.data.filter((item) => item.id_absen !== null && item.tanggal_absen !== "-").length;

      // Keterlambatan: hitung total keterlambatan berdasarkan waktu absen_mulai lebih dari jam 22:00
      const keterlambatanTotal = result.data.reduce((acc, item) => {
        if (item.absen_mulai) {
          // Ambil waktu mulai absen (absen_mulai) dan konversi ke format 24 jam
          const [hours, minutes] = item.absen_mulai.split(":").map(Number);
          const absenTimeInMinutes = hours * 60 + minutes;

          // Bandingkan dengan jam 22:00 (22:00 = 1320 menit)
          const lateThresholdInMinutes = 22 * 60; // 22:00 dalam menit

          // Jika waktu absen lebih dari 22:00, hitung keterlambatan
          if (absenTimeInMinutes > lateThresholdInMinutes) {
            const lateMinutes = absenTimeInMinutes - lateThresholdInMinutes;
            acc += lateMinutes;
          }
        }
        return acc;
      }, 0);

      // Lembur: hitung total lembur dalam menit
      const lemburTotal = result.data.reduce((acc, item) => {
        if (item.lembur && item.lembur !== "null" && item.lembur !== "0:00") {
          const [hours, minutes] = item.lembur.split(":").map(Number);
          acc += hours * 60 + minutes;
        }
        return acc;
      }, 0);

      setTotalKehadiran(kehadiranCount);
      setTotalKeterlambatan(`${Math.floor(keterlambatanTotal / 60)} Jam ${keterlambatanTotal % 60} Menit`);
      setTotalLembur(`${Math.floor(lemburTotal / 60)} Jam ${lemburTotal % 60} Menit`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollDetail();
  }, [location.search]);

  const generateExcelData = (data) => {
    const excelData = [
      ["Nama", dataUser?.nama || "-"],
      ["Total Kehadiran", `${totalKehadiran} Hari`],
      ["Periode", period],
      ["Total Keterlambatan", totalKeterlambatan],
      ["Total Lembur", totalLembur],
      [],
      ["No", "Tanggal", "IN", "L", "OUT", "T"],
    ];

    data.forEach((item, index) => {
      excelData.push([
        index + 1,
        item.tanggal_absen || item.tanggal_lembur || "-",
        item.absen_mulai || "00:00",
        item.keterlambatan || "00:00",
        item.absen_selesai || "00:00",
        item.lembur || "00:00",
      ]);
    });

    return excelData;
  };

  const handleDownload = () => {
    if (!payrollData.length) {
      console.warn("No payroll data available for download.");
      return;
    }

    const excelData = generateExcelData(payrollData);
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Column 1: "Nama"
      { wch: 20 }, // Column 2: "Tanggal"
      { wch: 10 }, // Column 3: "IN"
      { wch: 10 }, // Column 4: "L"
      { wch: 10 }, // Column 5: "OUT"
      { wch: 10 }, // Column 6: "T"
    ];

    // Add border to all cells
    const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    // Loop through each cell and apply border
    for (let row = 0; row < excelData.length; row++) {
      for (let col = 0; col < excelData[row].length; col++) {
        const cellAddress = { r: row, c: col };
        if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
        worksheet[cellAddress].s = { border: borderStyle };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Data");
    XLSX.writeFile(workbook, "PayrollData.xlsx");
  };

  useEffect(() => {
    const startDate = sessionStorage.getItem("startDate");
    const endDate = sessionStorage.getItem("endDate");

    if (startDate && endDate) {
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);
      };

      setPeriod(`${formatDate(startDate)} - ${formatDate(endDate)}`);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Back"
            onClick={handleBackClick}
            className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-2 shadow-md"
          />
          <h2 className="text-3xl font-bold text-gray-800 pb-1">Detail Penggajian</h2>
        </div>
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-150"
        >
          Download Excel
        </button>
      </div>

      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error fetching data: {error}</p>
      ) : (
        <div className="min-h-screen">
          {/* Informasi Karyawan Card */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-gray-800">
            <p className="text-2xl font-semibold text-gray-900">{dataUser?.nama}</p>
            <div className="flex justify-between mt-3 text-sm text-gray-600">
              <span>
                <strong className="text-green-600">Kehadiran:</strong> {totalKehadiran} Hari
              </span>
              <span>
                <strong className="text-yellow-600">Terlambat:</strong> {totalKeterlambatan}
              </span>
              <span>
                <strong className="text-blue-600">Lembur:</strong> {totalLembur}
              </span>
            </div>
          </div>

          {/* Periode */}
          <p className="text-sm text-gray-500 mb-2 font-medium">Periode: {period}</p>

          {/* Tabel */}
          <div className="overflow-hidden rounded-lg shadow-lg">
            <table className="w-full bg-white border-collapse">
              <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <tr>
                  {["No", "Tanggal", "IN", "L", "OUT", "T"].map((header, index) => (
                    <th
                      key={index}
                      className="py-4 px-4 font-semibold text-sm uppercase border-b border-green-400 text-center"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payrollData.map((item, index) => {
                  const displayTanggal = item.tanggal_absen || item.tanggal_lembur || "-";

                  return (
                    <tr key={item.id_absen || index} className="hover:bg-green-50 transition-all duration-150">
                      <td className="py-3 px-4 text-center border-b border-gray-200">{index + 1}</td>
                      <td className="py-3 px-4 text-center border-b border-gray-200">{displayTanggal}</td>
                      <td className="py-3 px-4 text-center border-b border-gray-200">{item.absen_mulai || "--:--"}</td>
                      <td className="py-3 px-4 text-center border-b border-gray-200">{item.keterlambatan || "--:--"}</td>
                      <td className="py-3 px-4 text-center border-b border-gray-200">{item.absen_selesai || "--:--"}</td>
                      <td className="py-3 px-4 text-center border-b border-gray-200">{item.lembur || "--:--"}</td>
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
