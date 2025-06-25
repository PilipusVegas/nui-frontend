import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMoneyCheckAlt, faThumbsUp, faMapMarkerAlt, faUsers, faClipboardCheck, faMapMarkedAlt, faPenFancy, faBuilding, faUserCheck, faUsersCog, } from "@fortawesome/free-solid-svg-icons";

const HomeDesktop = ({ roleId }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [localTime, setLocalTime] = useState("");
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [totalAbsences, setTotalAbsences] = useState(0);
  const [totalAbsencesKantor, setTotalAbsencesKantor] = useState(0);
  const [totalApprovals, setTotalApprovals] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);
  const [TotalSuratDinas, setTotalSuratDinas] = useState(0);
  const [totalDivisi, setTotalDivisi] = useState(0);
  const [profile, setProfile] = useState({});

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

  const getPeriodRange = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 22);
    const endDate = new Date(today.getFullYear(), today.getMonth(), 21);
    const formatDate = (date) => date.toISOString().split("T")[0];
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
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

  const fetchAbsencesKantor = async () => {
    try {
      const { startDate, endDate } = getPeriodRange();
      const response = await fetch(`${apiUrl}/face/attendance/rekap?start=${startDate}&end=${endDate}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const totalDays = result.data.reduce((acc, item) => acc + (item.total_days || 0), 0);
        setTotalAbsencesKantor(totalDays);
      } else {
        setTotalAbsencesKantor(0);
      }
    } catch (error) {
      console.error("Error fetching absences:", error);
      setTotalAbsencesKantor(0);
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
      const { startDate, endDate } = getPeriodRange();
      const response = await fetch(`${apiUrl}/payroll?startDate=${startDate}&endDate=${endDate}`);
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

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${apiUrl}/profil/`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const storedUserId = localStorage.getItem("userId"); // Ambil dari localStorage
        const userProfile = result.data.find((profile) => String(profile.id) === storedUserId); // Cari yang id cocok
        if (userProfile) {
          setProfile(userProfile);
        } else {
          console.error("User profile not found in API data.");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);
    const roleActions = {
      1: [fetchAbsences, fetchPayroll, fetchApprovedByPA, fetchLocation, fetchEmployees, fetchSuratDinas, fetchAbsencesKantor],
      4: [dataDivisi, fetchEmployees, fetchAbsences, fetchPayroll, fetchSuratDinas],
      5: [fetchApprovedByPA, fetchAbsences, fetchLocation, fetchSuratDinas],
      6: [fetchEmployees, dataDivisi, fetchPayroll, fetchSuratDinas],
      13: [fetchPayroll, fetchEmployees, fetchSuratDinas],
    };
    roleActions[roleId]?.forEach(fn => fn());
    return () => clearInterval(intervalId);
  }, [roleId]);
  useEffect(() => {
    fetchProfile();
  }, []);

  const cardsByRole = {
    1: [
      //ADMIN
      { title: "Presensi Kehadiran", icon: faUserCheck, color: "text-blue-500", link: "/absensi" },
      { title: "Presensi Lapangan", count: totalAbsences, icon: faMapMarkedAlt, color: "text-green-500", link: "/data-absensi" },
      { title: "Presensi Kantor", count: totalAbsencesKantor, icon: faBuilding, color: "text-indigo-500", link: "/absensi-kantor" },
      { title: "Surat Dinas", count: TotalSuratDinas, icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas", },
      { title: "Penggajian", count: totalPayroll, icon: faMoneyCheckAlt, color: "text-amber-500", link: "/data-penggajian", },
      { title: "Persetujuan Lembur", count: totalApprovals, icon: faThumbsUp, color: "text-emerald-500", link: "/data-approval", },
      { title: "Data Lokasi Presensi", count: totalLocations?.length || "0", icon: faMapMarkerAlt, color: "text-orange-500", link: "/data-lokasi", },
      { title: "Karyawan", count: employees?.length || "0", icon: faUsers, color: "text-violet-500", link: "/karyawan", },
      // { title: "Bukti Survey", icon: faClipboardCheck, color: "text-emerald-500", link: "/survey" },
    ],
    4: [
      // MANAGER HRD
      { title: "Presensi Kehadiran", icon: faUserCheck, color: "text-blue-500", link: "/absensi" },
      { title: "Presensi Lapangan", count: totalAbsences, icon: faMapMarkedAlt, color: "text-green-500", link: "/data-absensi", },
      { title: "Presensi Kantor", count: totalAbsences, icon: faBuilding, color: "text-indigo-500", link: "/absensi-kantor", },
      { title: "Karyawan", count: employees?.length || "0", icon: faUsers, color: "text-violet-500", link: "/karyawan", },
      { title: "Rekap Absensi", count: totalAbsences, icon: faCalendarAlt, color: "text-blue-500", link: "/data-absensi", },
      { title: "Divisi", count: totalDivisi, icon: faUsersCog, color: "text-blue-500", link: "/divisi" },
      { title: "Surat Dinas", count: TotalSuratDinas, icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas", },
      { title: "Penggajian", count: totalPayroll, icon: faMoneyCheckAlt, color: "text-amber-500", link: "/data-penggajian", },
    ],
    5: [
      // PA
      { title: "Presensi Kehadiran", icon: faUserCheck, color: "text-blue-500", link: "/absensi" },
      { title: "Persetujuan Lembur", count: totalApprovals, icon: faThumbsUp, color: "text-emerald-500", link: "/data-approval", },
      { title: "Rekap Absensi", count: totalAbsences, icon: faCalendarAlt, color: "text-blue-500", link: "/data-absensi", },
      { title: "Data Lokasi Presensi", count: totalLocations?.length || "0", icon: faMapMarkerAlt, color: "text-orange-500", link: "/data-lokasi", },
      { title: "Surat Dinas", count: TotalSuratDinas, icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas", },
    ],
    6: [
      //STAFF HRD
      { title: "Presensi Kehadiran", icon: faUserCheck, color: "text-blue-500", link: "/absensi" },
      { title: "Karyawan", count: employees?.length || "0", icon: faUsers, color: "text-violet-500", link: "/karyawan" },
      { title: "Surat Dinas", count: TotalSuratDinas, icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas", },
      { title: "Penggajian", count: totalPayroll, icon: faMoneyCheckAlt, color: "text-amber-500", link: "/data-penggajian", },
      { title: "Divisi", count: totalDivisi, icon: faUsersCog, color: "text-blue-500", link: "/divisi", },
    ],
    13: [
      //GA
      { title: "Presensi Kehadiran", icon: faUserCheck, color: "text-blue-500", link: "/absensi" },
      { title: "Karyawan", count: employees?.length || "0", icon: faUsers, color: "text-violet-500", link: "/karyawan", },
      { title: "Surat Dinas", count: TotalSuratDinas, icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas", },
      { title: "Penggajian", count: totalPayroll, icon: faMoneyCheckAlt, color: "text-amber-500", link: "/data-penggajian", },
    ],
  };

  const DashboardCard = ({ title, count, icon, color = "text-green-600", onClick }) => (
    <div onClick={onClick} className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:ring-2 hover:ring-green-300/30">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 tracking-wide">
          {title}
        </p>
        {count !== undefined && (
          <h4 className={`text-4xl font-extrabold tracking-tight ${color}`}>
            {count}
          </h4>
        )}
      </div>
      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-green-50 transition-all duration-300">
        <FontAwesomeIcon icon={icon} className={`text-2xl ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 px-5 bg-white shadow-md rounded-lg transition-all duration-300 ease-in-out pb-10">
        <div className="mt-6 p-6 sm:p-8 bg-gradient-to-br from-green-600 to-green-500 text-white rounded-2xl shadow-md border border-transparent flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-white/90">Selamat Datang,</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {profile.nama || "User"}
            </h3>
            <p className="text-white/80 text-base sm:text-lg mt-1">{localTime}</p>
          </div>
          <div className="text-sm sm:text-base font-medium text-white/90 md:text-right">
            {profile.role || "-"} <span className="mx-1">•</span> Kantor Palem
          </div>
        </div>
        <div className="mt-6">
          {/* Cards for Role 1 (Admin, bisa lihat semua) */}
          {cardsByRole[roleId] && (
            <div className={`grid grid-cols-1 ${cardsByRole[roleId].length > 2 ? "md:grid-cols-4" : "md:grid-cols-2"} gap-4`}>
              {cardsByRole[roleId].map((card, index) => (
                <DashboardCard key={index} title={card.title} count={card.count} icon={card.icon} color={card.color} onClick={() => handleCardClick(card.link)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
