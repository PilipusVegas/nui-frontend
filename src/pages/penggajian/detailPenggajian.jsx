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

  const handleBackClick = () => {
    navigate(-1);
  };

  const fetchPayrollDetail = async () => {
    const query = new URLSearchParams(location.search);
    const startDate = query.get("startDate");
    const endDate = query.get("endDate");

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
    const totalKehadiran = data.filter((item) => item.id_absen !== null && item.tanggal_absen !== "-").length;
    const totalKeterlambatan = data.reduce((acc, item) => {
      const [hours, minutes] = item.keterlambatan ? item.keterlambatan.split(":").map(Number) : [0, 0];
      return acc + hours * 60 + minutes;
    }, 0);
    const totalLembur = data.reduce((acc, item) => {
      const [hours, minutes] = item.lembur ? item.lembur.split(":").map(Number) : [0, 0];
      return acc + hours * 60 + minutes;
    }, 0);

    const excelData = [
      ["Nama", dataUser?.nama || "-"],
      ["Total Kehadiran", `${totalKehadiran} Hari`],
      ["Periode", period],
      ["Total Keterlambatan", `${Math.floor(totalKeterlambatan / 60)} Jam ${totalKeterlambatan % 60} Menit`],
      ["Total Lembur", `${Math.floor(totalLembur / 60)} Jam ${totalLembur % 60} Menit`],
      [],
      ["No", "Tanggal", "IN", "Keterlambatan", "OUT", "Lembur"],
    ];

    data.forEach((item, index) => {
      excelData.push([
        index + 1,
        item.tanggal_absen || item.tanggal_lembur,
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
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Data");
    XLSX.writeFile(workbook, "PayrollData.xlsx");
  };

  useEffect(() => {
    const calculatePeriod = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      let startDate, endDate;

      if (now.getDate() < 21) {
        startDate = new Date(currentYear, currentMonth - 1, 21);
        endDate = new Date(currentYear, currentMonth, 20);
      } else {
        startDate = new Date(currentYear, currentMonth, 21);
        endDate = new Date(currentYear, currentMonth + 1, 20);
      }
      setPeriod(
        `${startDate.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })} - ${endDate.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}`
      );
    };
    calculatePeriod();
  }, []);

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Back"
            onClick={handleBackClick}
            className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-2 shadow-md"
          />
          <h2 className="text-2xl font-bold text-gray-800">Detail Penggajian</h2>
        </div>
        <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-150">
          Download Excel
        </button>
      </div>

      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error fetching data: {error}</p>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mt-4 mb-2">Informasi Karyawan</h2>
          <p><strong>ID User:</strong> {dataUser?.id_user}</p>
          <p><strong>Nama:</strong> {dataUser?.nama}</p>
          <table className="min-w-full border-collapse border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Tanggal</th>
                <th className="border px-4 py-2">Absen Mulai</th>
                <th className="border px-4 py-2">Absen Selesai</th>
                <th className="border px-4 py-2">Keterlambatan</th>
                <th className="border px-4 py-2">Lembur</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((item) => (
                <tr key={item.id_absen} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{item.tanggal_absen}</td>
                  <td className="border px-4 py-2">{item.absen_mulai}</td>
                  <td className="border px-4 py-2">{item.absen_selesai}</td>
                  <td className="border px-4 py-2">{item.keterlambatan}</td>
                  <td className="border px-4 py-2">{item.lembur || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DetailPenggajian;
