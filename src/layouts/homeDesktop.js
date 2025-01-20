import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuSidebar from "../layouts/menuSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faMoneyCheckAlt,
  faThumbsUp,
  faMapMarkerAlt,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

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
      month: "short",
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
      console.error("Error fetching locations:", error);
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

  const fetchApprovedByPA = async () => {
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
      fetchApprovedByPA();
      fetchLocation();
    }

    if (roleId === "6") {
      fetchEmployees();
      fetchPayroll();
    }

    if (roleId === "1") {
      fetchAbsences();
      fetchPayroll();
      fetchApprovedByPA();
      fetchLocation();
      fetchEmployees();
    }

    return () => clearInterval(intervalId);
  }, [roleId]);

  return (
    <div className="desktop-layout flex min-h-screen bg-gray-100">
      <MenuSidebar handleLogout={handleLogout} roleId={roleId} />
      <div className="flex-1 px-5 bg-white shadow-lg rounded-lg transition-all duration-300 ease-in-out">
        <div className="mt-6 p-6 sm:p-12 bg-gradient-to-b from-green-900 to-green-600 text-white rounded-lg shadow-md flex flex-col md:flex-row items-center md:items-start justify-between">
          {/* Divisi dan Lokasi */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-xl font-semibold">Selamat Datang,</h2>
            <h3 className="text-4xl font-extrabold">{username || "User"}</h3>
            <p className="text-gray-200 text-lg mt-2">{localTime}</p>
          </div>

          {/* Divisi Info */}
          <div className="text-right hidden md:block">{GetNamaDivisi(roleId)} • Kantor Palem</div>
        </div>

        <div className="mt-6">
          {/* Cards for Role 1 (Admin, bisa lihat semua) */}
          {roleId === "1" && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        onClick={() => handleCardClick("/data-absensi")}
        className="flex items-center justify-between p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
      >
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-gray-700">Absensi</p>
          <h4 className="text-5xl font-bold text-red-600">{totalAbsences}</h4>
        </div>
        <FontAwesomeIcon icon={faCalendarAlt} className="text-red-600 text-3xl" />
      </div>
      <div
        onClick={() => handleCardClick("/data-penggajian")}
        className="flex items-center justify-between p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
      >
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-gray-700">Penggajian</p>
          <h4 className="text-5xl font-bold text-purple-600">{totalPayroll}</h4>
        </div>
        <FontAwesomeIcon icon={faMoneyCheckAlt} className="text-purple-600 text-3xl" />
      </div>
      <div
        onClick={() => handleCardClick("/data-approval")}
        className="flex items-center justify-between p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
      >
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-gray-700">Approval Lembur</p>
          <h4 className="text-5xl font-bold text-green-600">{totalApprovals}</h4>
        </div>
        <FontAwesomeIcon icon={faThumbsUp} className="text-green-600 text-3xl" />
      </div>
      <div
        onClick={() => handleCardClick("/data-lokasi")}
        className="flex items-center justify-between p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
      >
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-gray-700">Data Lokasi</p>
          <h4 className="text-5xl font-bold text-green-600">{totalLocations.length || "0"}</h4>
        </div>
        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 text-3xl" />
      </div>
      <div
        onClick={() => handleCardClick("/data-karyawan")}
        className="flex items-center justify-between p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
      >
        <div className="flex flex-col">
          <p className="text-xl font-semibold text-gray-700">Karyawan</p>
          <h4 className="text-5xl font-bold text-green-600">{employees.length || "0"}</h4>
        </div>
        <FontAwesomeIcon icon={faUsers} className="text-green-600 text-3xl" />
      </div>
    </div>
  )}

          {/* PA Role Cards */}
          {roleId === "5" && (
            <div className="flex flex-col md:flex-row gap-4">
              <div
                onClick={() => handleCardClick("/data-lokasi")}
                className="w-full p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 text-3xl mb-3" />
                <h4 className="text-5xl font-bold text-green-600 mb-3">
                  {totalLocations.length || "0"}
                </h4>
                <p className="text-xl font-semibold text-gray-700">Data Lokasi</p>
              </div>
              <div
                onClick={() => handleCardClick("/data-approval")}
                className="w-full p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={faThumbsUp} className="text-green-600 text-3xl mb-3" />
                <h4 className="text-5xl font-bold text-green-600 mb-3">{totalApprovals}</h4>
                <p className="text-xl font-semibold text-gray-700">Approval Lembur</p>
              </div>
            </div>
          )}

          {/* MANAGER HRD Role Cards */}
          {roleId === "4" && (
            <div className="flex flex-col md:flex-row gap-4">
              <div
                onClick={() => handleCardClick("/data-absensi")}
                className="w-full p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="text-red-600 text-3xl mb-3" />
                <h4 className="text-5xl font-bold text-red-600 mb-3">{totalAbsences}</h4>
                <p className="text-xl font-semibold text-gray-700">Absensi</p>
              </div>
              <div
                onClick={() => handleCardClick("/data-penggajian")}
                className="w-full p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={faMoneyCheckAlt} className="text-purple-600 text-3xl mb-3" />
                <h4 className="text-5xl font-bold text-purple-600 mb-3">{totalPayroll}</h4>
                <p className="text-xl font-semibold text-gray-700">Penggajian</p>
              </div>
            </div>
          )}

          {/* Staff HRD Role Cards */}
          {roleId === "6" && (
            <div className="flex flex-col md:flex-row gap-4">
              <div
                onClick={() => handleCardClick("/data-karyawan")}
                className="w-full p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={faUsers} className="text-green-600 text-3xl mb-3" />
                <h4 className="text-5xl font-bold text-green-600 mb-3">
                  {employees.length || "0"}
                </h4>
                <p className="text-xl font-semibold text-gray-700">Karyawan</p>
              </div>
              <div
                onClick={() => handleCardClick("/data-penggajian")}
                className="w-full p-8 bg-white rounded-lg shadow-md transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <FontAwesomeIcon icon={faMoneyCheckAlt} className="text-purple-600 text-3xl mb-3" />
                <h4 className="text-5xl font-bold text-purple-600 mb-3">{totalPayroll}</h4>
                <p className="text-xl font-semibold text-gray-700">Penggajian</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
