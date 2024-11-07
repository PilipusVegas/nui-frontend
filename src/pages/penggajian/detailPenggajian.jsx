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
      const keterlambatanTotal = result.data.reduce((acc, item) => {
        const [hours, minutes] = item.keterlambatan ? item.keterlambatan.split(":").map(Number) : [0, 0];
        return acc + hours * 60 + minutes;
      }, 0);
      const lemburTotal = result.data.reduce((acc, item) => {
        const [hours, minutes] = item.lembur ? item.lembur.split(":").map(Number) : [0, 0];
        return acc + hours * 60 + minutes;
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
      setPeriod(`${startDate} - ${endDate}`);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
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
        <div>
          {/* Informasi Karyawan Card */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 w-full text-gray-800">
            <p className="text-2xl font-semibold text-gray-800">{dataUser?.nama}</p>
            <p className="text-sm text-gray-500 mb-1">{period}</p>
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                <strong>Kehadiran:</strong> {totalKehadiran} Hari
              </span>
              <span>
                <strong>Terlambat:</strong> {totalKeterlambatan}
              </span>
              <span>
                <strong>Lembur:</strong> {totalLembur}
              </span>
            </div>
          </div>

          {/* Tabel dengan warna thead */}
          <table className="w-full border-collapse rounded-lg bg-white shadow-lg overflow-hidden">
            <thead className="bg-green-600 text-white">
              <tr>
                {["No", "Tanggal", "IN", "L", "OUT", "T"].map((header, index) => (
                  <th key={index} className="py-3 px-4 text-left font-semibold text-center text-sm uppercase border-b border-green-400">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payrollData.map((item, index) => {
                // Cek apakah tanggal absen dan tanggal lembur sama
                const isSameDate = item.tanggal_absen === item.tanggal_lembur;

                // Tentukan tanggal yang akan ditampilkan
                const displayTanggal = item.tanggal_absen || item.tanggal_lembur || "-";

                return (
                  <tr key={item.id_absen || index} className="hover:bg-green-50 transition-all">
                    <td className="py-3 px-4 text-center border-b border-green-200">{index + 1}</td>
                    <td className="py-3 px-4 text-center border-b border-green-200">{displayTanggal}</td>
                    <td className="py-3 px-4 text-center border-b border-green-200">{item.absen_mulai || "00:00"}</td>
                    <td className="py-3 px-4 text-center border-b border-green-200">{item.keterlambatan || "00:00"}</td>
                    <td className="py-3 px-4 text-center border-b border-green-200">{item.absen_selesai || "00:00"}</td>
                    <td className="py-3 px-4 text-center border-b border-green-200">{item.lembur || "00:00"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DetailPenggajian;
