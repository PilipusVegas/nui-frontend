import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
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
  const [totalKeterlambatan, setTotalKeterlambatan] = useState("-");
  const [totalLembur, setTotalLembur] = useState("-");

  const handleBackClick = () => navigate(-1);

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
      const response = await fetch(
        `${apiUrl}/payroll/detail/${id_user}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch payroll detail data");
      const result = await response.json();
      setDataUser(result);
      setPayrollData(result.data || []);
      const kehadiranCount = result.data.filter(
        (item) => item.id_absen !== null && item.tanggal_absen !== "-"
      ).length;

      const keterlambatanTotal = result.data.reduce((acc, item) => {
        if (item.absen_mulai) {
          const [hours, minutes] = item.absen_mulai.split(":").map(Number);
          const absenTimeInMinutes = hours * 60 + minutes;
          const lateThresholdInMinutes = 22 * 60;
          if (absenTimeInMinutes > lateThresholdInMinutes) {
            acc += absenTimeInMinutes - lateThresholdInMinutes;
          }
        }
        return acc;
      }, 0);

      const lemburTotal = result.data.reduce((acc, item) => {
        if (item.lembur && item.lembur !== "null" && item.lembur !== "0:00") {
          const [hours, minutes] = item.lembur.split(":").map(Number);
          acc += hours * 60 + minutes;
        }
        return acc;
      }, 0);

      setTotalKehadiran(kehadiranCount);
      setTotalKeterlambatan(
        `${Math.floor(keterlambatanTotal / 60)} Jam ${keterlambatanTotal % 60} Menit`
      );
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

  const generateExcelData = (data) => {
    const excelData = [
      [], 
      ["Nama", dataUser?.nama || "-"],
      ["Total Kehadiran", `${totalKehadiran} Hari`],
      ["Periode", period],
      ["Total Lembur", totalLembur],
      [],
      ["No", "Tanggal", "IN", "OUT", "T"],
    ];

    data.forEach((item, index) => {
      excelData.push([
        index + 1,
        item.tanggal_absen || item.tanggal_lembur || "-",
        item.absen_mulai || "-",
        item.absen_selesai === "0:00" ? "-" : item.absen_selesai,
        item.lembur || "-",
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
    worksheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 10 }];

    const today = new Date();
    const formattedDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(today.getDate()).padStart(2, "0")}`;
    const fileName = `${formattedDate}_${dataUser?.nama}_${dataUser?.role}.xlsx`;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Data");
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faArrowLeft}
            onClick={handleBackClick}
            className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 p-2 rounded-full"
          />
          <h2 className="text-2xl font-bold pb-1 text-gray-800">Detail Penggajian</h2>
        </div>
        <button
          onClick={handleDownload}
          className="bg-blue-600 flex text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faDownload} className="pt-1" />
          <span className="sm:block hidden ml-2 ">Unduh Data</span>
        </button>
      </div>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div>
          <div className="bg-white shadow rounded-lg p-4 mb-4">
            {/* Header */}
            <div className="mb-3 text-center">
              <p className="text-lg font-bold text-gray-900">
                {dataUser?.nama || "Nama Tidak Tersedia"}
              </p>
              <p className="text-sm font-medium text-gray-500">
                {dataUser?.role || "Role Tidak Tersedia"}
              </p>
            </div>

            {/* Informasi Periode */}
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500">
                <strong className="text-gray-700">Periode:</strong> {period || "Tidak Tersedia"}
              </p>
            </div>

            {/* Kehadiran, Jam Kerja, dan Lembur */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              <div className="px-3 py-2 rounded-lg bg-blue-100 text-center">
                <p className="text-xl font-bold text-blue-600">{totalKehadiran || 0}</p>
                <p className="text-sm text-blue-800">Kehadiran</p>
              </div>
              <div className="px-3 py-2 rounded-lg bg-yellow-100 text-center">
                <p className="text-lg sm:text-xl font-bold text-yellow-600">{totalLembur || 0}</p>
                <p className="text-sm text-yellow-800">Lembur (Jam)</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg">
            {/* Tabel untuk layar besar */}
            <table className="table-auto w-full hidden md:table">
              <thead>
                <tr className="bg-green-600 text-white text-sm">
                  {["No", "Tanggal", "IN", "OUT", "T"].map((header, i) => (
                    <th
                      key={i}
                      className={`px-4 py-1 ${
                        i === 0 ? "rounded-tl-lg " : i === 4 ? "rounded-tr-lg " : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payrollData.map((item, i) => (
                  <tr key={i} className="text-center text-sm">
                    <td className="border px-4">{i + 1}</td>
                    <td className="border px-4">
                      {item.tanggal_absen || item.tanggal_lembur || "-"}
                    </td>
                    <td className="border px-4">{item.absen_mulai || "-"}</td>
                    <td className="border px-4">
                      {item.absen_selesai === "0:00" ? "-" : item.absen_selesai}
                    </td>
                    <td className="border px-4">{item.lembur || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Card untuk layar kecil */}
            <div className="md:hidden">
              {payrollData.map((item, i) => (
                <div
                  key={i}
                  className="bg-white shadow-lg rounded-xl p-5 mb-2 border border-gray-200 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Tanggal */}
                  <div className="flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500 mr-2 text-lg" />
                    <span className="text-lg font-semibold text-gray-900">
                      {item.tanggal_absen || item.tanggal_lembur || "Tidak Tersedia"}
                    </span>
                  </div>

                  {/* Informasi Kehadiran */}
                  <div className="grid grid-cols-3 gap-4 bg-gray-200 rounded-xl p-3">
                    {/* IN */}
                    <div className="flex flex-col items-center text-center bg-white p-2 rounded-lg shadow-md">
                      <span className="text-sm font-semibold text-green-600">IN</span>
                      <span className="text-md text-gray-700">{item.absen_mulai || "-"}</span>
                    </div>

                    {/* OUT */}
                    <div className="flex flex-col items-center text-center bg-white p-2 rounded-lg shadow-md">
                      <span className="text-sm font-semibold text-red-600">OUT</span>
                      <span className="text-md text-gray-700">{item.absen_selesai || "-"}</span>
                    </div>

                    {/* T (Lembur) */}
                    <div className="flex flex-col items-center text-center bg-white p-2 rounded-lg shadow-md">
                      <span className="text-sm font-semibold text-blue-600">T</span>
                      <span className="text-md text-gray-700">{item.lembur || "-"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPenggajian;
