// import React, { useState, useEffect } from "react";
// import * as XLSX from "xlsx";

// const PayrollExport = () => {
    
//     const apiUrl = process.env.REACT_APP_API_BASE_URL; // Mendapatkan URL API dari environment variables

//     const handleDownload = () => {
//         if (!payrollData.length) {
//             console.warn("No payroll data available for download.");
//             return; // Menghentikan eksekusi jika tidak ada data
//         }

//         const dates = getDateRange(startDate, endDate); // Mengambil rentang tanggal
//         const excelData = generateExcelData(dates); // Menghasilkan data untuk Excel

//         const worksheet = XLSX.utils.aoa_to_sheet(excelData); // Membuat worksheet dari data
//         const workbook = XLSX.utils.book_new(); // Membuat workbook baru
//         XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Data"); // Menambahkan worksheet ke workbook
//         XLSX.writeFile(workbook, "PayrollData.xlsx"); // Menyimpan file Excel
//     };

//     const getDateRange = (start, end) => {
//         const dates = [];
//         const startDate = new Date(start);
//         const endDate = new Date(end);

//         for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
//             dates.push(
//                 `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
//             );
//         }
//         return dates; // Mengembalikan array tanggal
//     };

//     const generateExcelData = (dates) => {
//         const excelData = [["No", "Nama", "Jumlah Kehadiran"]]; // Header Excel

//         // Header untuk tanggal
//         const dateHeader = dates.flatMap((date) => [date, "", "", ""]);
//         excelData[0] = [...excelData[0], ...dateHeader];

//         // Baris untuk jenis kehadiran
//         const typesRow = [];
//         dates.forEach(() => {
//             typesRow.push("IN", "L", "OUT", "T");
//         });
//         excelData.push(["", "", "", ...typesRow]);

//         // Menambahkan data pengguna
//         payrollData.forEach((user, index) => {
//             const userDetails = payrollDetail[user.id_user] || [];
//             const row = [index + 1, user.nama_user, userDetails.length]; // Ambil jumlah kehadiran

//             // Menambahkan detail kehadiran untuk setiap tanggal
//             dates.forEach((date) => {
//                 const formattedDate = date.split("/").reverse().join("-"); // Format tanggal untuk pencocokan
//                 const attendance = userDetails.find((detail) => detail.tanggal_absen === formattedDate) || {};

//                 row.push(
//                     attendance.absen_mulai || "0:00", // IN
//                     attendance.keterlambatan || "0:00", // L
//                     attendance.absen_selesai || "0:00", // OUT
//                     attendance.lembur || "0:00" // T
//                 );
//             });

//             excelData.push(row); // Menambahkan row ke data Excel
//         });

//         return excelData; // Mengembalikan data Excel
//     };

//     return (
//         <div>
         
//         </div>
//     );
// };

// export default PayrollExport;
