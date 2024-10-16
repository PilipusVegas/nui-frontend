import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const PayrollExport = () => {
    const [payrollData, setPayrollData] = useState([]);
    const [payrollDetail, setPayrollDetail] = useState({});
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const apiUrl = "http://192.168.130.42:3002";

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
                    const detailPromises = payrollData.map(user => fetchPayrollDetail(user.id_user));
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
            dates.push(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`);
        }
        return dates;
    };

    const generateExcelData = (dates) => {
        const excelData = [["No", "Nama", "Jumlah Kehadiran"]];
        const attendanceTypesRow = ["", "IN", "L", "OUT", "T"];
        
        // Prepare the header for dates
        excelData.push(["", "", "", ...dates]);

        // Push attendance types under dates
        const typesRow = ["", "", "", ...attendanceTypesRow];
        excelData.push(typesRow);

        payrollData.forEach((user, index) => {
            const userDetails = payrollDetail[user.id_user] || [];
            const row = [index + 1, user.nama_user, userDetails.length];

            // Add attendance details for each date
            dates.forEach(date => {
                const attendance = userDetails.find(detail => detail.tanggal_absen === date) || {};
                row.push(
                    attendance.absen_mulai || "00:00",  // IN
                    attendance.keterlambatan || "00:00", // L
                    attendance.absen_selesai || "00:00", // OUT
                    attendance.lembur || "00:00"          // T
                );
            });
            excelData.push(row);
        });

        return excelData;
    };

    return (
        <div>
            <h1>Payroll Export</h1>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button onClick={handleDownload}>Download Excel</button>
        </div>
    );
};

export default PayrollExport;
