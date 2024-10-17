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

        if (!startDate || !endDate) {
            alert("Silakan pilih rentang tanggal terlebih dahulu.");
            return;
        }

        const dates = getDateRange(startDate, endDate);
        const excelData = generateExcelData(dates);

        const worksheet = XLSX.utils.aoa_to_sheet(excelData);

        // Optional: Mengatur lebar kolom agar lebih rapi
        const columnWidths = [
            { wpx: 50 }, // No
            { wpx: 150 }, // Nama
            { wpx: 150 }, // Jumlah Kehadiran
        ];

        // Menambahkan lebar kolom untuk setiap subkolom tanggal
        dates.forEach(() => {
            columnWidths.push({ wpx: 80 }, { wpx: 50 }, { wpx: 80 }, { wpx: 50 });
        });

        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Data");
        XLSX.writeFile(workbook, "PayrollData.xlsx");
    };

    const getDateRange = (start, end) => {
        const dates = [];
        const startD = new Date(start);
        const endD = new Date(end);

        for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            dates.push(`${day}-${month}-${year}`);
        }
        return dates;
    };

    const generateExcelData = (dates) => {
        const excelData = [];
    
        // Baris Header Pertama (Tanggal)
        const headerRow1 = ["No", "Nama", "Jumlah Kehadiran"];
        dates.forEach(date => {
            headerRow1.push(date, "", "", ""); // Placeholder untuk IN, L, OUT, T
        });
        excelData.push(headerRow1);
    
        // Baris Header Kedua (IN, L, OUT, T di bawah tanggal)
        const headerRow2 = ["", "", ""];
        dates.forEach(() => {
            headerRow2.push("IN", "L", "OUT", "T");
        });
        excelData.push(headerRow2);
    
        // Data Pengguna
        payrollData.forEach((user, index) => {
            const userDetails = payrollDetail[user.id_user] || [];
            const row = [index + 1, user.nama_user, user.total_absen];
    
            dates.forEach(date => {
                const attendance = userDetails.find(detail => detail.tanggal_absen === date) || {};
                row.push(
                    attendance.absen_mulai || "0:00",   // IN
                    attendance.keterlambatan || "0:00", // L
                    attendance.absen_selesai || "0:00", // OUT
                    attendance.lembur || "0:00"         // T
                );
            });
            excelData.push(row);
        });
    
        // Membuat worksheet dari data excel
        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
        // Melakukan merge pada header tanggal (menggabungkan 4 kolom jadi satu per tanggal)
        const mergeRanges = [];
        dates.forEach((_, index) => {
            const colStart = 3 + (index * 4);  // Kolom awal dari setiap tanggal
            mergeRanges.push({
                s: { r: 0, c: colStart },   // Mulai dari baris 0 (headerRow1), kolom pertama dari tanggal
                e: { r: 0, c: colStart + 3 } // Sampai baris 0, kolom keempat dari tanggal (menyertakan IN, L, OUT, T)
            });
        });
        worksheet["!merges"] = mergeRanges;
    
        return worksheet;
    };
    
    
    return (
        <div>
            <h1>Payroll Export</h1>
            <div style={{ marginBottom: "20px" }}>
                <label>
                    Tanggal Mulai:
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ marginLeft: "10px", marginRight: "20px" }}
                    />
                </label>
                <label>
                    Tanggal Selesai:
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ marginLeft: "10px" }}
                    />
                </label>
            </div>
            <button onClick={handleDownload}>Download Excel</button>
        </div>
    );
};

export default PayrollExport;
