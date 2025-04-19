import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendarAlt, faDownload } from "@fortawesome/free-solid-svg-icons";
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
  const [totalLembur, setTotalLembur] = useState("-");
  const [activeTab, setActiveTab] = useState("absen");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const filteredData = payrollData.filter((item) => {
    if (activeTab === "absen") {
      return item.tanggal_absen; // Hanya tampilkan data absen
    } else {
      return item.tanggal_lembur; // Hanya tampilkan data lembur
    }
  });

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
        (item) => item.id_absen !== null && item.tanggal_absen !== "-" && !item.id_lembur
      ).length;

      const lemburTotal = result.data.reduce((acc, item) => {
        if (item.lembur && item.lembur !== "null" && item.lembur !== "0:00") {
          const [hours, minutes] = item.lembur.split(":").map(Number);
          acc += hours * 60 + minutes;
        }
        return acc;
      }, 0);

      setTotalKehadiran(kehadiranCount);
      setTotalLembur(`${Math.floor(lemburTotal / 60)} Jam`);
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
      ["No", "Tanggal", "Masuk", "Keluar", "Lembur"],
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
          <FontAwesomeIcon icon={faArrowLeft} onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 p-2 rounded-full"/>
          <h2 className="text-2xl font-bold pb-1 text-gray-800">Detail Penggajian</h2>
        </div>
        <button onClick={handleDownload} className="bg-blue-600 flex text-white px-4 py-2 rounded-lg hover:bg-blue-700">
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
              {/* Tab Absen */}
              <div
                className={`px-3 py-2 rounded-lg bg-blue-100 text-center cursor-pointer transition-all duration-300 
                    ${
                      activeTab === "absen"
                        ? "border-2 border-blue-500 shadow-sm shadow-blue-300"
                        : "border border-transparent"
                    }`}
                onClick={() => handleTabClick("absen")}
              >
                <p className="text-xl font-bold text-blue-600">{totalKehadiran || 0}</p>
                <p className="text-sm text-blue-800">Total Kehadiran</p>
              </div>

              {/* Tab Lembur */}
              <div
                className={`px-3 py-2 rounded-lg bg-yellow-100 text-center cursor-pointer transition-all duration-300 
                    ${
                      activeTab === "lembur"
                        ? "border-2 border-yellow-500 shadow-sm shadow-yellow-300"
                        : "border border-transparent"
                    }`}
                onClick={() => handleTabClick("lembur")}
              >
                <p className="text-lg sm:text-xl font-bold text-yellow-600">{totalLembur || 0}</p>
                <p className="text-sm text-yellow-800">Total Lembur</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg">
            {/* Tabel untuk layar besar */}
            <table className="table-auto w-full hidden md:table">
              <thead>
                <tr className="bg-green-600 text-white text-sm">
                  {["No"]
                    .concat(activeTab === "absen" ? ["Tanggal absen", "IN", "OUT"] : [])
                    .concat(
                      activeTab === "lembur" ? ["Tanggal Lembur", "Start", "End", "Lembur"] : []
                    )
                    .map((header, i, arr) => (
                      <th
                        key={i}
                        className={`px-4 py-1 ${
                          i === 0 ? "rounded-tl-lg " : i === arr.length - 1 ? "rounded-tr-lg " : ""
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <tr key={i} className="text-center text-sm">
                    <td className="border px-4">{i + 1}</td>
                    <td className="border px-4">
                      {activeTab === "absen" ? item.tanggal_absen : item.tanggal_lembur || "-"}
                    </td>
                    <td className="border px-4">
                      {activeTab === "absen" ? item.absen_mulai : item.mulai_lembur || "-"}
                    </td>
                    <td className="border px-4">
                      {activeTab === "absen"
                        ? item.absen_selesai === "0:00"
                          ? "-"
                          : item.absen_selesai
                        : item.selesai_lembur || "-"}
                    </td>
                    {activeTab === "lembur" && (
                      <td className="border px-4">{item.lembur || "-"}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Card untuk layar kecil */}
            <div className="md:hidden">
              {filteredData.map((item, i) => (
                <div
                  key={i}
                  className="bg-white shadow-lg rounded-xl p-5 mb-2 border border-gray-200 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Tanggal */}
                  <div className="flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500 mr-2 text-lg" />
                    <span className="text-lg font-semibold text-gray-900">
                      {activeTab === "absen"
                        ? item.tanggal_absen
                        : item.tanggal_lembur || "Tidak Tersedia"}
                    </span>
                  </div>

                  {/* Informasi Kehadiran atau Lembur */}
                  <div
                    className={`grid ${
                      activeTab === "absen" ? "grid-cols-2" : "grid-cols-3"
                    } gap-4 bg-gray-200 rounded-xl p-3`}
                  >
                    {/* IN */}
                    <div className="flex flex-col items-center text-center bg-white p-2 rounded-lg shadow-md">
                      <span className="text-sm font-semibold text-green-600">Masuk</span>
                      <span className="text-md text-gray-700">
                        {activeTab === "absen" ? item.absen_mulai || "-" : item.mulai_lembur || "-"}
                      </span>
                    </div>

                    {/* OUT */}
                    <div className="flex flex-col items-center text-center bg-white p-2 rounded-lg shadow-md">
                      <span className="text-sm font-semibold text-red-600">Keluar</span>
                      <span className="text-md text-gray-700">
                        {activeTab === "absen"
                          ? item.absen_selesai || "-"
                          : item.selesai_lembur || "-"}
                      </span>
                    </div>

                    {/* T (Lembur) hanya jika di tab Lembur */}
                    {activeTab === "lembur" && (
                      <div className="flex flex-col items-center text-center bg-white p-2 rounded-lg shadow-md">
                        <span className="text-sm font-semibold text-blue-600">Lembur</span>
                        <span className="text-md text-gray-700">{item.lembur || "-"}</span>
                      </div>
                    )}
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
