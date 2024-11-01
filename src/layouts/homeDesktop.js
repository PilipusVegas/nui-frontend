import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuSidebar from "../layouts/menuSidebar";

const HomeDesktop = ({ username, handleLogout, roleId, GetNamaDivisi }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [localTime, setLocalTime] = useState("");
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [totalAbsences, setTotalAbsences] = useState(0);
  const [totalApprovals, setTotalApprovals] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);

  const updateLocalTime = () => {
    const time = new Date().toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    setLocalTime(time);
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${apiUrl}/profil/`);
      const result = await response.json();
      setEmployees(result.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchLocation = async () => {
    try {
      const response = await fetch(`${apiUrl}/lokasi/`);
      const result = await response.json();
      setTotalLocations(result.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAbsences = async () => {
    try {
      const response = await fetch(`${apiUrl}/absen/`);
      const result = await response.json();

      if (Array.isArray(result)) {
        const totalStatus = result.reduce((acc, item) => acc + Number(item.unapproved), 0);
        setTotalAbsences(totalStatus);
      } else {
        setTotalAbsences(0);
      }
    } catch (error) {
      console.error("Error fetching absences:", error);
    }
  };

  const fetchApprovedByHRDAndPA = async () => {
    try {
      const response = await fetch(`${apiUrl}/lembur/approve`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const unapprovedOvertime = result.data.filter((item) => item.status_lembur === 0).length;
        setTotalApprovals(unapprovedOvertime);
      } else {
        console.error("Data format is incorrect or fetching failed");
      }
    } catch (error) {
      console.error("Error fetching lembur data:", error);
    }
  };

  const fetchPayroll = async () => {
    try {
      const response = await fetch(`${apiUrl}/payroll/`);
      const result = await response.json();
      setTotalPayroll(Array.isArray(result) ? result.length : 0);
    } catch (error) {
      console.error("Error fetching payroll:", error);
    }
  };

  // Handlers for navigation
  const handleCardClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);

    if (roleId === "4") {
      fetchAbsences();
      fetchPayroll();
    }

    if (roleId === "5") {
      fetchApprovedByHRDAndPA();
      fetchLocation();
    }

    if (roleId === "6") {
      fetchEmployees();
      fetchPayroll();
    }

    return () => clearInterval(intervalId);
  }, [roleId]);

  return (
    <div className="desktop-layout flex min-h-screen bg-gray-100">
      <MenuSidebar handleLogout={handleLogout} roleId={roleId} />
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

        <div className="mt-6 grid grid-cols-4 gap-4">
          {/* Cards for HRD */}
          {roleId === "4" && (
            <>
              <div
                onClick={() => handleCardClick("/data-absensi")}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-red-600 mb-3">{totalAbsences}</h4>
                <p className="text-xl font-semibold text-gray-700">Absensi</p>
              </div>
              <div
                onClick={() => handleCardClick("/data-penggajian")}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-purple-600 mb-3">{totalPayroll}</h4>
                <p className="text-xl font-semibold text-gray-700">Penggajian</p>
              </div>
            </>
          )}

          {/* Cards for HRD Staff */}
          {roleId === "6" && (
            <>
              <div
                onClick={() => handleCardClick("/data-karyawan")}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-green-600 mb-3">{employees.length || "0"}</h4>
                <p className="text-xl font-semibold text-gray-700">Karyawan</p>
              </div>
              <div
                onClick={() => handleCardClick("/data-penggajian")}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-purple-600 mb-3">{totalPayroll}</h4>
                <p className="text-xl font-semibold text-gray-700">Penggajian</p>
              </div>
            </>
          )}

          {/* Cards for BU ABI */}
          {roleId === "5" && (
            <>
              <div
                onClick={() => handleCardClick("/data-approval")}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-green-600 mb-3">{totalApprovals}</h4>
                <p className="text-xl font-semibold text-gray-700">Approval Lembur</p>
              </div>
              <div
                onClick={() => handleCardClick("/data-lokasi")}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-purple-600 mb-3">{totalLocations.length || "0"}</h4>
                <p className="text-xl font-semibold text-gray-700">Data Lokasi</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
