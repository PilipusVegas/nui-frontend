import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';

const PayrollComponent = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const detailPenggajian = [
    { user: 'John Doe', date: '2024-10-01', kehadiran: 8, lembur: 2 },
    { user: 'John Doe', date: '2024-10-02', kehadiran: 8, lembur: 0 },
    { user: 'Jane Doe', date: '2024-10-01', kehadiran: 8, lembur: 3 },
  ];

  const filterData = () => {
    return detailPenggajian.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const downloadExcel = () => {
    const filteredData = filterData();
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Data');
    XLSX.writeFile(workbook, 'PayrollData.xlsx');
  };

  return (
    <div>
      <h1>Payroll Data</h1>
      <div>
        <label>Start Date: </label>
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
      </div>
      <div>
        <label>End Date: </label>
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
      </div>
      <button onClick={downloadExcel}>Download Excel</button>
    </div>
  );
};

export default PayrollComponent;
