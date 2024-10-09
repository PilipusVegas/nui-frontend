import * as XLSX from "xlsx";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DataPenggajian = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [endDate, setEndDate] = useState(new Date("2024-10-10"));
  const [startDate, setStartDate] = useState(new Date("2024-10-01"));
  const [currentDate, setCurrentDate] = useState(new Date("2024-10-01"));

  const [penggajianData] = useState([
    {
      id_user: 1,
      nama: "Andi",
      divisi: "IT",
      records: [
        { date: "01/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "02/10/2024", in: "08:10", l: "00:20", out: "17:10", t: "01:50" },
        { date: "03/10/2024", in: "08:00", l: "00:25", out: "17:00", t: "01:35" },
        { date: "04/10/2024", in: "08:05", l: "00:15", out: "17:05", t: "01:45" },
        { date: "05/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "06/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "07/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "08/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "09/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "10/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
      ],
    },
    {
      id_user: 2,
      nama: "Budi",
      divisi: "HR",
      records: [
        { date: "01/10/2024", in: "08:15", l: "00:45", out: "17:15", t: "01:30" },
        { date: "02/10/2024", in: "08:20", l: "00:25", out: "17:20", t: "01:35" },
        { date: "03/10/2024", in: "08:10", l: "00:20", out: "17:10", t: "01:50" },
        { date: "04/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "05/10/2024", in: "08:05", l: "00:15", out: "17:05", t: "01:45" },
        { date: "06/10/2024", in: "08:30", l: "00:30", out: "17:30", t: "01:30" },
        { date: "07/10/2024", in: "08:10", l: "00:20", out: "17:10", t: "01:50" },
        { date: "08/10/2024", in: "08:05", l: "00:30", out: "17:05", t: "01:45" },
        { date: "09/10/2024", in: "08:15", l: "00:30", out: "17:15", t: "01:45" },
        { date: "10/10/2024", in: "08:20", l: "00:25", out: "17:20", t: "01:35" },
      ],
    },
    {
      id_user: 3,
      nama: "Cici",
      divisi: "Finance",
      records: [
        { date: "01/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "02/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "03/10/2024", in: "08:05", l: "00:20", out: "17:05", t: "01:45" },
        { date: "04/10/2024", in: "08:10", l: "00:25", out: "17:10", t: "01:35" },
        { date: "05/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "06/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "07/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "08/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "09/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
        { date: "10/10/2024", in: "08:00", l: "00:30", out: "17:00", t: "02:00" },
      ],
    },
  ]);  

  const handleBackClick = () => {
    navigate("/home");
  };

  const handleDownload = () => {
    const filteredData = penggajianData.map((penggajian) => {
      return {
        Nama: penggajian.nama,
        Divisi: penggajian.divisi,
        Records: penggajian.records.filter((record) => {
          const recordDate = new Date(record.date.split("/").reverse().join("-"));
          return recordDate >= startDate && recordDate <= endDate;
        }),
      };
    });
    const headerRow1 = ["No", "Nama", "Jumlah Kehadiran"];
    const headerRow2 = ["", "", ""];
    const uniqueDates = new Set();
  
    filteredData.forEach((item) => {
      item.Records.forEach((record) => {
        uniqueDates.add(record.date);
      });
    });
  
    const uniqueDatesArray = [...uniqueDates];
    uniqueDatesArray.forEach(date => {
      headerRow1.push(date, "", "", "");
      headerRow2.push("In", "L", "Out", "T");
    });
    const dataToDownload = [];
    dataToDownload.push(headerRow1);
    dataToDownload.push(headerRow2);
    filteredData.forEach((item, userIndex) => {
      const jumlahKehadiran = item.Records.filter(record => record.in).length;
      const userRow = [userIndex + 1, item.Nama, jumlahKehadiran];
      uniqueDatesArray.forEach(date => {
        const record = item.Records.find(r => r.date === date);
        if (record) {
          userRow.push(record.in, record.l, record.out, record.t);
        } else {
          userRow.push("", "", "", "");
        }
      });
      dataToDownload.push(userRow);
    });
    const ws = XLSX.utils.aoa_to_sheet(dataToDownload);
    const merges = [];
    let colStart = 3;
    uniqueDatesArray.forEach(() => {
      merges.push({
        s: { r: 0, c: colStart },
        e: { r: 0, c: colStart + 3 }
      });
      colStart += 4;
    });
    ws['!merges'] = merges;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Penggajian");
    XLSX.writeFile(wb, "data_penggajian.xlsx");
  };

  const handlePreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    if (previousDay >= startDate) {setCurrentDate(previousDay)}
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    if (nextDay <= endDate) {setCurrentDate(nextDay)}
  };

  const filteredPenggajian = penggajianData.filter((penggajian) => {
    return penggajian.nama.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
            <h1 className="text-4xl font-bold text-gray-800 pb-1">DATA PENGGAJIAN</h1>
          </div>
        </div>
        <div className="flex mb-4 items-center space-x-4">
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              if (date) {
                setStartDate(date);
                if (date > endDate) {setEndDate(date)}
              }
            }}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="dd/MM/yyyy"
            className="border p-2 rounded-md"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              if (date) {
                setEndDate(date);
              }
            }}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            dateFormat="dd/MM/yyyy"
            className="border p-2 rounded-md"
          />
          <button onClick={handleDownload} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Unduh Data</button>
        </div>
        <div className="flex mb-4 items-center space-x-4">
          <input type="text" value={searchQuery} placeholder="Cari Nama Karyawan..." className="border p-2 rounded-md w-full flex-grow" onChange={(e) => {setSearchQuery(e.target.value)}}/>
        </div>
        <div className="flex mb-4 items-center justify-center space-x-4">
          <button onClick={handlePreviousDay} className="flex items-center justify-center px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-lg font-bold">{currentDate.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}</div>
          <button onClick={handleNextDay} className="flex items-center justify-center px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mb-8">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-green-800 text-white uppercase text-sm leading-normal sticky top-0">
              <tr>
                <th className="py-3 px-4 text-left">No.</th>
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-left">Divisi</th>
                <th className="py-3 px-4 text-left">Jumlah Kehadiran</th>
                <th className="py-3 px-4 text-left">In</th>
                <th className="py-3 px-4 text-left">L</th>
                <th className="py-3 px-4 text-left">Out</th>
                <th className="py-3 px-4 text-left">T</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 text-sm font-light">
              {filteredPenggajian.length > 0 ? (
                filteredPenggajian.map((penggajian, index) => {
                  const jumlahKehadiran = penggajian.records.length;
                  const records = penggajian.records.filter((record) => record.date === currentDate.toLocaleDateString("en-GB"));
                  return records.map((record, recordIndex) => (
                    <tr key={`${penggajian.id_user}-${recordIndex}`} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-4 text-left">{index + 1}</td>
                      <td className="py-3 px-4 text-left">{penggajian.nama}</td>
                      <td className="py-3 px-4 text-left">{penggajian.divisi}</td>
                      <td className="py-3 px-4 text-left">{jumlahKehadiran}</td>
                      <td className="py-3 px-4 text-left">{record.in}</td>
                      <td className="py-3 px-4 text-left">{record.l}</td>
                      <td className="py-3 px-4 text-left">{record.out}</td>
                      <td className="py-3 px-4 text-left">{record.t}</td>
                    </tr>
                  ));
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-3 px-4 text-center">Data tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataPenggajian;
