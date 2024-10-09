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
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [totalApprovals, setTotalApprovals] = useState(0);

  const handleAbsenceCardClick = () => {
    navigate("/data-absensi");
  };
  const handleOvertimeCardClick = () => {
    navigate("/data-lembur");
  };
  const handleEmployeeCardClick = () => {
    navigate("/data-karyawan");
  };
  const handleApprovalCardClick = () => {
    navigate("/data-approval");
  };
  const handlePayrollCardClick = () => {
    navigate("/data-penggajian");
  };

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
    } catch (error) {}
  };

  const fetchAbsences = async () => {
    try {
      const response = await fetch(`${apiUrl}/absen/`);
      const result = await response.json();

      // Check if the result is an array
      if (Array.isArray(result)) {
        // Calculate the total status by summing up the total_status values
        const totalStatus = result.reduce((acc, item) => {
          return acc + Number(item.total_status); // Convert to number before adding
        }, 0);

        // Set the total status
        setTotalAbsences(totalStatus); // Store the total status value
      } else {
        setTotalAbsences(0); // Set 0 if not an array
      }
    } catch (error) {
      console.error("Error fetching absences:", error);
    }
  };

  const fetchOvertime = async () => {
    try {
      const response = await fetch(`${apiUrl}/overtime/`);
      const result = await response.json();
      setTotalOvertime(Array.isArray(result) ? result.length : 0);
    } catch (error) {}
  };

  const fetchApprovals = async () => {
    try {
      const response = await fetch(`${apiUrl}/overtime/`);
      const result = await response.json();
      const filteredApprovals = Array.isArray(result) ? result.filter((request) => request.status === 0) : [];
      setTotalApprovals(filteredApprovals.length);
    } catch (error) {}
  };

  const fetchPayroll = async () => {
    try {
      const response = await fetch(`${apiUrl}/penggajian/`);
      const result = await response.json();
      setTotalPayroll(Array.isArray(result) ? result.length : 0);
    } catch (error) {}
  };

  useEffect(() => {
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);
    if (roleId === "4") {
      fetchEmployees();
      fetchAbsences();
      fetchOvertime();
      fetchPayroll();
    }
    if (roleId === "5") {
      fetchApprovals();
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
          {roleId === "4" && (
            <>
              <div
                onClick={handleEmployeeCardClick}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-green-600 mb-3">{employees.length}</h4>
                <p className="text-xl font-semibold text-gray-700">Karyawan</p>
              </div>
              <div
                onClick={handleAbsenceCardClick}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-red-600 mb-3">{totalAbsences}</h4>
                <p className="text-xl font-semibold text-gray-700">Absensi</p>
              </div>

              <div
                onClick={handleOvertimeCardClick}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-blue-600 mb-3">{totalOvertime}</h4>
                <p className="text-xl font-semibold text-gray-700">Lembur</p>
              </div>
              <div
                onClick={handlePayrollCardClick}
                className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
              >
                <h4 className="text-5xl font-bold text-purple-600 mb-3">{totalPayroll}</h4>
                <p className="text-xl font-semibold text-gray-700">Penggajian</p>
              </div>
            </>
          )}
          {roleId === "5" && (
            <div
              onClick={handleApprovalCardClick}
              className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
            >
              <h4 className="text-5xl font-bold text-green-600 mb-3">{totalApprovals}</h4>
              <p className="text-xl font-semibold text-gray-700">Approval Lembur</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
