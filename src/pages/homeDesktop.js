import MenuSidebar from "./menuSidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomeDesktop = ({ username, handleLogout, roleId, GetNamaDivisi }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [localTime, setLocalTime] = useState("");
  const [totalAbsences, setTotalAbsences] = useState(0);
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [displayedAbsen, setDisplayedAbsen] = useState(0);
  const [displayedLembur, setDisplayedLembur] = useState(0);
  const [displayedEmployees, setDisplayedEmployees] = useState(0);

  const handleAbsenceCardClick = () => {navigate("/data-absensi")};
  const handleOvertimeCardClick = () => {navigate("/data-lembur")};
  const handleEmployeeCardClick = () => {navigate("/data-karyawan")};

  const updateLocalTime = () => {
    const time = new Date().toLocaleString("id-ID", {weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"});
    setLocalTime(time);
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${apiUrl}/profil/`);
      const result = await response.json();
      setEmployees(result.data || []);
    } catch (error) {
    }
  };

  const fetchAbsences = async () => {
    try {
      const response = await fetch(`${apiUrl}/absen/`);
      const result = await response.json();
      if (Array.isArray(result)) {
        setTotalAbsences(result.length);
      } else {
        setTotalAbsences(0);
      }
    } catch (error) {
    }
  };
  
  const fetchOvertime = async () => {
    try {
      const response = await fetch(`${apiUrl}/overtime/`);
      const result = await response.json();
      if (Array.isArray(result)) {
        setTotalOvertime(result.length);
      } else {
        setTotalOvertime(0);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);
    fetchEmployees();
    fetchAbsences();
    fetchOvertime();
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (employees.length === 0) return;
    let start = 0;
    const end = employees.length;
    const duration = 1500;
    const incrementTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setDisplayedEmployees(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [employees]);

  useEffect(() => {
    if (totalAbsences <= 0) return;
    let start = 0;
    const end = totalAbsences;
    const duration = 1500;
    const incrementTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setDisplayedAbsen(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [totalAbsences]);

  useEffect(() => {
    if (totalOvertime <= 0) return;
    let start = 0;
    const end = totalOvertime;
    const duration = 1500;
    const incrementTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setDisplayedLembur(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [totalOvertime]);

  return (
    <div className="desktop-layout flex min-h-screen bg-gray-100">
      <MenuSidebar handleLogout={handleLogout} />
      <div className="flex-1 px-8 bg-white shadow-lg rounded-lg transition-all duration-300 ease-in-out">
        <div className="mt-6 p-8 bg-gradient-to-br from-green-700 via-green-700 to-green-700 text-white rounded-lg shadow-md relative">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Selamat Datang,</h2>
            <h3 className="text-4xl font-extrabold">{username || "User"}</h3>
            <p className="text-gray-200 text-lg mt-2">{localTime}</p>
          </div>
          <div className="absolute top-10 right-8 text-white text-l px-2 py-1 font-bold rounded-lg bg-opacity-30">
            {GetNamaDivisi(roleId)} • Kantor Palem
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div onClick={handleEmployeeCardClick} className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer">
            <h4 className="text-5xl font-bold text-green-600 mb-3 transition duration-500 ease-in-out">
              {displayedEmployees}
            </h4>
            <p className="text-xl font-semibold text-gray-700">Total Karyawan</p>
          </div>
          <div onClick={handleAbsenceCardClick} className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer">
            <h4 className="text-5xl font-bold text-red-600 mb-3 transition duration-500 ease-in-out">
              {displayedAbsen}
            </h4>
            <p className="text-xl font-semibold text-gray-700">Total Absen</p>
          </div>
          <div onClick={handleOvertimeCardClick} className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer">
            <h4 className="text-5xl font-bold text-blue-600 mb-3 transition duration-500 ease-in-out">
              {displayedLembur}
            </h4>
            <p className="text-xl font-semibold text-gray-700">Total Lembur</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-600"></p>
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
