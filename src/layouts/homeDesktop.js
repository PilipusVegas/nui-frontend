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
  faClipboardCheck,
  faPenFancy
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
  const [TotalSuratDinas, setTotalSuratDinas] = useState(0);
  const [totalDivisi, setTotalDivisi] = useState(0);

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

  const dataDivisi = async () => {
    try {
      const response = await fetch(`${apiUrl}/karyawan/divisi/`);
      const result = await response.json();
      setTotalDivisi(Array.isArray(result) ? result.length : 0);
    } catch (error) {
      console.error("Error fetching Divisi:", error);
    }
  };

  const fetchSuratDinas = async () => {
    try {
      const response = await fetch(`${apiUrl}/surat-dinas/`);
      const result = await response.json();
      setTotalSuratDinas(Array.isArray(result) ? result.length : 0);
    } catch (error) {
      console.error("Error fetching surat dinas:", error);
    }
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);

    if (roleId === "4") {
      dataDivisi();
      fetchEmployees();
      fetchAbsences();
      fetchPayroll();
      fetchSuratDinas();
    }

    if (roleId === "5") {
      fetchApprovedByPA();
      fetchLocation();
    }

    if (roleId === "6") {
      fetchEmployees();
      fetchPayroll();
      fetchSuratDinas();
    }

    if (roleId === "1") {
      fetchAbsences();
      fetchPayroll();
      fetchApprovedByPA();
      fetchLocation();
      fetchEmployees();
      fetchSuratDinas();
    }

    if (roleId === "1") {
      fetchPayroll();
      // fetchApprovedByPA();
      // fetchLocation();
      fetchEmployees();
      fetchSuratDinas();
    }

    return () => clearInterval(intervalId);
  }, [roleId]);

  const DashboardCard = ({ title, count, icon, color, onClick }) => (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-8 py-6 bg-white rounded-lg shadow-md border border-gray-200 transition-transform transform hover:shadow-xl cursor-pointer"
    >
      <div className="flex flex-col">
        <p className="text-xl font-semibold text-gray-700">{title}</p>
        {count !== undefined && (
          <h4 className={`text-5xl font-bold ${color}`}>{count}</h4>
        )}
      </div>
      <FontAwesomeIcon icon={icon} className={`${color} text-4xl`} />
    </div>
  );
  
  const cardsByRole = {
    "1": [//ADMIN
      { title: "Absensi", count: totalAbsences, icon: faCalendarAlt, color: "text-blue-500", link: "/data-absensi" },
      { title: "Surat Dinas", count: TotalSuratDinas, icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas" },
      { title: "Penggajian", count: totalPayroll, icon: faMoneyCheckAlt, color: "text-amber-500", link: "/data-penggajian" },
      { title: "Approval Lembur", count: totalApprovals, icon: faThumbsUp, color: "text-emerald-500", link: "/data-approval" },
      { title: "Data Lokasi", count: totalLocations?.length || "0", icon: faMapMarkerAlt, color: "text-orange-500", link: "/data-lokasi" },
      { title: "Karyawan", count: employees?.length || "0", icon: faUsers, color: "text-violet-500", link: "/data-karyawan" },
      { title: "Bukti Survey", icon: faClipboardCheck, color: "text-emerald-500", link: "/survey" },
    ],
    "4": [// MANAGER HRD
      { title: "Karyawan", count: employees?.length || "0", icon: faUsers, color: "text-violet-500", link: "/data-karyawan" },
      { title: "Absensi", count: totalAbsences, icon: faCalendarAlt, color: "text-blue-500", link: "/data-absensi" },
      { title: "Divisi", count: totalDivisi, icon: faCalendarAlt, color: "text-blue-500", link: "/divisi" },
      { title: "Surat Dinas", count: TotalSuratDinas, icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas" },
      { title: "Penggajian", count: totalPayroll, icon: faMoneyCheckAlt, color: "text-amber-500", link: "/data-penggajian" },
    ],
    "5": [ // PA
      { title: "Approval Lembur", count: totalApprovals, icon: faThumbsUp, color: "text-emerald-500", link: "/data-approval" },
      { title: "Data Lokasi", count: totalLocations?.length || "0", icon: faMapMarkerAlt, color: "text-orange-500", link: "/data-lokasi" },
    ],
    "6": [ //STAFF HRD
      { title: "Karyawan", count: employees?.length || "0", icon: faUsers, color: "text-violet-500", link: "/data-karyawan" },
      { title: "Surat Dinas", count: TotalSuratDinas, icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas"},
      { title: "Penggajian", count: totalPayroll, icon: faMoneyCheckAlt, color: "text-amber-500", link: "/data-penggajian" }
    ],
    "13": [ //GA
      { title: "Karyawan", count: employees?.length || "0", icon: faUsers, color: "text-violet-500", link: "/data-karyawan" },
      { title: "Surat Dinas", count: TotalSuratDinas, icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas"},
      { title: "Penggajian", count: totalPayroll, icon: faMoneyCheckAlt, color: "text-amber-500", link: "/data-penggajian" }
    ]
  }; 

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 px-5 bg-white shadow-md rounded-lg transition-all duration-300 ease-in-out pb-10">
        <div className="mt-6 p-6 sm:p-8 bg-gradient-to-b from-green-700 to-green-600 text-white rounded-lg shadow-md border border-gray-300 flex flex-col md:flex-row items-center md:items-start justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-xl font-semibold">Selamat Datang,</h2>
            <h3 className="text-4xl font-extrabold">{username || "User"}</h3>
            <p className="text-gray-200 text-lg mt-2">{localTime}</p>
          </div>
          <div className="text-right hidden md:block">{GetNamaDivisi(roleId)} • Kantor Palem</div>
        </div>

        <div className="mt-6">
          {/* Cards for Role 1 (Admin, bisa lihat semua) */}
          {cardsByRole[roleId] && (
          <div className={`grid grid-cols-1 ${cardsByRole[roleId].length > 2 ? "md:grid-cols-4" : "md:grid-cols-2"} gap-4`}>
            {cardsByRole[roleId].map((card, index) => (
              <DashboardCard
                key={index}
                title={card.title}
                count={card.count}
                icon={card.icon}
                color={card.color}
                onClick={() => handleCardClick(card.link)}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
