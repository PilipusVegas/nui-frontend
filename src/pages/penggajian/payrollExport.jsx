import React, { useState } from 'react';

const PayrollExport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleDownload = () => {
    if (startDate && endDate) {
      console.log(`Downloading payroll data from ${startDate} to ${endDate}`);
      alert(`Payroll data from ${startDate} to ${endDate} is being downloaded.`);
    } else {
      alert('Please select both start and end dates.');
    }
  };

  return (
    <div className="bg-white  rounded-lg w-full">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col">
          <label className="block text-gray-700 text-xs font-semibold">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-gray-700 text-xs font-semibold">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>

        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
        >
          Download Payroll
        </button>
      </div>
    </div>
  );
};

export default PayrollExport;
