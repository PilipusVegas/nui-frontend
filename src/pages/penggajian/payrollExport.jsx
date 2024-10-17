import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const PayrollExport = () => {
    const [payrollData, setPayrollData] = useState([]);
    const [payrollDetail, setPayrollDetail] = useState({});
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    // Fetch payroll data when component mounts
    useEffect(() => {
        const fetchPayrollData = async () => {
            try {
                const response = await fetch(`${apiUrl}/payroll/`);
                const result = await response.json();
                setPayrollData(result);
            } catch (error) {
                console.error("Error fetching payroll data:", error);
            }
        };
        fetchPayrollData();
    }, [apiUrl]);

    // Fetch payroll details based on selected date range
    useEffect(() => {
        const fetchAllPayrollDetails = async () => {
            if (payrollData.length > 0 && startDate && endDate) {
                try {
                    const detailPromises = payrollData.map((user) => fetchPayrollDetail(user.id_user));
                    const results = await Promise.all(detailPromises);
                    const details = results.reduce((acc, result, index) => {
                        acc[payrollData[index].id_user] = result.data || [];
                        return acc;
                    }, {});
                    setPayrollDetail(details);
                } catch (error) {
                    console.error("Error fetching payroll details:", error);
                }
            }
        };
        fetchAllPayrollDetails();
    }, [payrollData, startDate, endDate]);

    const fetchPayrollDetail = async (id_user) => {
        try {
            const response = await fetch(`${apiUrl}/payroll/detail/${id_user}?start=${startDate}&end=${endDate}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching detail payroll for user ${id_user}:`, error);
            return { data: [] };
        }
    };

    const handleDownload = () => {
        if (!payrollData.length) {
            console.warn("No payroll data available for download.");
            return;
        }

        const dates = getDateRange(startDate, endDate);
        const excelData = generateExcelData(dates);

        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Data");
        XLSX.writeFile(workbook, "PayrollData.xlsx");
    };

    const getDateRange = (start, end) => {
        const dates = [];
        const startDate = new Date(start);
        const endDate = new Date(end);

        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(
                `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
            );
        }
        return dates;
    };

    const generateExcelData = (dates) => {
        const excelData = [["No", "Nama", "Jumlah Kehadiran"]];

        // Header untuk tanggal
        const dateHeader = dates.flatMap((date) => [date, "", "", ""]);
        excelData[0] = [...excelData[0], ...dateHeader];

        // Baris untuk jenis kehadiran
        const typesRow = [];
        dates.forEach(() => {
            typesRow.push("IN", "L", "OUT", "T");
        });
        excelData.push(["", "", "", ...typesRow]);

        // Menambahkan data pengguna
        payrollData.forEach((user, index) => {
            const userDetails = payrollDetail[user.id_user] || [];
            const row = [index + 1, user.nama_user, userDetails.length]; // Ambil jumlah kehadiran

            // Menambahkan detail kehadiran untuk setiap tanggal
            dates.forEach((date) => {
              const formattedDate = date.split("/").reverse().join("-"); // Format tanggal untuk pencocokan
              const attendance = userDetails.find((detail) => detail.tanggal_absen === formattedDate) || {};
          
              row.push(
                  attendance.absen_mulai || "0:00", // IN
                  attendance.keterlambatan || "0:00", // L
                  attendance.absen_selesai || "0:00", // OUT
                  attendance.lembur || "0:00" // T
              );
          });
          
            excelData.push(row);
        });

        return excelData;
    };

    return (
        <div>
            <div className="flex items-end space-x-4">
                <div>
                    <label htmlFor="startDate" className="sr-only">
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        className="border border-gray-300 rounded px-3 py-2"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="sr-only">
                        End Date
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        className="border border-gray-300 rounded px-3 py-2"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <div>
                    <button onClick={handleDownload} className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition">
                        Download Excel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PayrollExport;
