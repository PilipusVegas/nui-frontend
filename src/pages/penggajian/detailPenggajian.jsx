import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const DetailPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const { id_user } = useParams();
  const [dataUser, setDataUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("");
  const [payrollData, setPayrollData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchPayrollDetail = async () => {
      try {
        const response = await fetch(`${apiUrl}/payroll/detail/${id_user}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setDataUser(result);
        setPayrollData(result.data || []);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrollDetail();
  }, [apiUrl, id_user]);

  const handleDownload = () => {
    const filteredData = getFilteredData();
    if (!filteredData.length) {
      console.warn("No payroll data available for download.");
      return;
    }

    const excelData = generateExcelData(filteredData);
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Mengatur border dan style pada setiap sel
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue; // Lewati sel kosong

        // Tambahkan border
        worksheet[cellAddress].s = {
          border: {
            top: { style: "bold", color: { rgb: "#000000" } },
            bottom: { style: "bold", color: { rgb: "#000000" } },
            left: { style: "bold", color: { rgb: "#000000" } },
            right: { style: "bold", color: { rgb: "#000000" } },
          },
          alignment: {
            horizontal: "center", // Mengatur teks di tengah secara horizontal
            vertical: "center", // Mengatur teks di tengah secara vertikal
          },
        };
      }
    }

    // Mengatur lebar kolom
    worksheet["!cols"] = [
      { wpx: 145 }, // Kolom "No" (lebar 40 pixel)
      { wpx: 250 }, // Kolom "Tanggal" (lebar 100 pixel)
      { wpx: 50 }, // Kolom "IN" (lebar 50 pixel)
      { wpx: 50 }, // Kolom "L" (lebar 50 pixel)
      { wpx: 50 }, // Kolom "OUT" (lebar 50 pixel)
      { wpx: 50 }, // Kolom "T" (lebar 50 pixel)
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Data");
    XLSX.writeFile(workbook, "PayrollData.xlsx");
  };

  const generateExcelData = (data) => {
    const totalKehadiran = data.filter((item) => item.id_absen !== null && item.tanggal_absen !== "-").length;
    const excelData = [
      ["Nama", dataUser?.nama || "-"],
      ["Total Kehadiran", totalKehadiran + " Hari"],
      ["Periode", period],
      ["Total Keterlambatan", `${Math.floor(totalKeterlambatan / 60)} Jam ${totalKeterlambatan % 60} Menit`],
      ["Total Lembur", `${Math.floor(totalLembur / 60)} Jam ${totalLembur % 60} Menit`],
      [],
      ["No", "Tanggal", "IN", "L", "OUT", "T"],
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

  const getFilteredData = () => {
    // Jika startDate atau endDate tidak ditentukan, kembalikan seluruh payrollData
    if (!startDate || !endDate) return payrollData;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Menetapkan waktu akhir ke akhir hari

    // Mengurangi 1 hari dari tanggal mulai
    start.setDate(start.getDate() - 1);

    console.log("Filtering data from", start, "to", end);

    const filtered = payrollData.filter((item) => {
      let date;

      // Mendapatkan tanggal dari item, menggunakan fungsi parseDate
      if (item.tanggal_absen) {
        date = parseDate(item.tanggal_absen);
      } else if (item.tanggal_lembur) {
        date = parseDate(item.tanggal_lembur);
      } else {
        return false; // Jika tidak ada tanggal, abaikan item ini
      }

      console.log("Item Date:", date);

      // Memeriksa apakah tanggal dalam rentang, termasuk tanggal yang dimodifikasi
      return date >= start && date <= end; // Termasuk tanggal mulai - 1 dan tanggal akhir
    });

    console.log("Filtered Data:", filtered);
    return filtered;
  };

  // Fungsi parseDate tetap sama
  const parseDate = (dateString) => {
    const parts = dateString.split("-"); // Memisahkan tanggal
    return new Date(parts[2], parts[1] - 1, parts[0]); // Membuat objek Date
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
        `${startDate.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} - ${endDate.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      );
    };

    calculatePeriod();
  }, []);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error fetching data: {error.message}</p>;

  const filteredData = getFilteredData();

  const totalKeterlambatan = filteredData.reduce((acc, item) => {
    const [hours, minutes] = item.keterlambatan ? item.keterlambatan.split(":").map(Number) : [0, 0];
    return acc + hours * 60 + minutes;
  }, 0);

  const totalLembur = filteredData.reduce((acc, item) => {
    const [hours, minutes] = item.lembur ? item.lembur.split(":").map(Number) : [0, 0];
    return acc + hours * 60 + minutes;
  }, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Back to Home"
            onClick={handleBackClick}
            className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
          />
          <h1 className="text-3xl font-bold text-gray-800">Detail Penggajian Bulanan</h1>
        </div>
        <div className="ml-auto">
          <div className="flex items-end space-x-4">
            <div>
              <button
                onClick={handleDownload}
                className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition"
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {dataUser && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200 flex flex-col md:flex-row justify-between items-start">
          <div className="flex-grow">
            <h1 className="text-3xl font-semibold text-gray-800 mb-2">{dataUser.nama}</h1>
            <p className="text-gray-600">
              Total Kehadiran:{" "}
              <span className="font-medium">
                {filteredData.filter((item) => item.id_absen !== null && item.tanggal_absen !== "-").length} Hari
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Total Keterlambatan:{" "}
              <span className="font-medium">
                {Math.floor(totalKeterlambatan / 60)} Jam {totalKeterlambatan % 60} Menit
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Total Lembur:{" "}
              <span className="font-medium">
                {Math.floor(totalLembur / 60)} Jam {totalLembur % 60} Menit
              </span>
            </p>
          </div>
          <div className="md:ml-auto text-right mt-4 md:mt-0">
            <p className="text-sm text-gray-500">
              Periode: <span className="font-medium">{period}</span>
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-green-500 text-white">
              {["No.", "Tanggal", "IN", "L", "OUT", "T"].map((header, index) => (
                <th key={index} className="py-3 px-4 text-center font-semibold text-sm uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData
              .sort((a, b) => {
                // Compare dates: prioritize absen, then lembur
                const dateA = new Date(a.tanggal_absen || a.tanggal_lembur);
                const dateB = new Date(b.tanggal_absen || b.tanggal_lembur);
                return dateB - dateA; // Sort from newest to oldest
              })
              .map((item, index) => (
                <tr key={index}>
                  <td className="border px-6 py-1 text-center">{index + 1}</td>
                  <td className="py-2 px-4 border-b border-gray-200 text-center">
                    {item.tanggal_absen || item.tanggal_lembur || "-"}
                  </td>
                  <td className="border px-6 py-1 text-center">{item.absen_mulai || "00:00"}</td>
                  <td className="border px-6 py-1 text-center">{item.keterlambatan || "00:00"}</td>
                  <td className="border px-6 py-1 text-center">{item.absen_selesai || "00:00"}</td>
                  <td className="border px-6 py-1 text-center">{item.lembur || "00:00"}</td>
                </tr>
              ))}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100">
              <td colSpan="3" className="px-6 py-2 text-right border">
                Total :
              </td>
              <td className="border px-6 py-2 text-center">
                {Math.floor(totalKeterlambatan / 60)} Jam {totalKeterlambatan % 60} Menit
              </td>
              <td colSpan="1"></td>
              <td className="border px-6 py-2 text-center">
                {Math.floor(totalLembur / 60)} Jam {totalLembur % 60} Menit
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DetailPenggajian;
