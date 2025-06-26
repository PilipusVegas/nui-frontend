import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMoneyCheckAlt, faThumbsUp, faMapMarkerAlt, faUsers, faMapMarkedAlt, faPenFancy, faBuilding, faUserCheck, faUsersCog, } from "@fortawesome/free-solid-svg-icons";

const HomeDesktop = () => {
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
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const storedRoleId = localStorage.getItem("roleId");
    if (storedRoleId) {
      setRoleId(Number(storedRoleId));
    }
  }, []);

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
    const startDate = new Date(today.getFullYear(), today.getMonth(), 22);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 21);
    const formatDate = (date) => date.toISOString().split("T")[0];
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };
  };

  const fetchAndHandle = async ({ endpoint, setter, onSuccess }) => {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`);
      const result = await response.json();
      const value = onSuccess(result);
      setter(value);
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    }
  };
  
  const fetchEmployees = () =>
  fetchAndHandle({
    endpoint: "/profil/",
    setter: setEmployees,
    onSuccess: (res) => res.data || [],
  });

const fetchLocation = () =>
  fetchAndHandle({
    endpoint: "/lokasi/",
    setter: setTotalLocations,
    onSuccess: (res) => res.data || [],
  });

const fetchDivisi = () =>
  fetchAndHandle({
    endpoint: "/karyawan/divisi/",
    setter: setTotalDivisi,
    onSuccess: (res) => Array.isArray(res) ? res.length : 0,
  });

const fetchSuratDinas = () =>
  fetchAndHandle({
    endpoint: "/surat-dinas/",
    setter: setTotalSuratDinas,
    onSuccess: (res) => Array.isArray(res) ? res.length : 0,
  });

const fetchApprovedByPA = () =>
  fetchAndHandle({
    endpoint: "/lembur/approve",
    setter: setTotalApprovals,
    onSuccess: (res) =>
      res.success && Array.isArray(res.data)
        ? res.data.filter((item) => item.status_lembur === 0).length
        : 0,
  });

const fetchPayroll = () => {
  const { startDate, endDate } = getPeriodRange();
  return fetchAndHandle({
    endpoint: `/payroll?startDate=${startDate}&endDate=${endDate}`,
    setter: setTotalPayroll,
    onSuccess: (res) => Array.isArray(res) ? res.length : 0,
  });
};

const fetchAbsences = () =>
  fetchAndHandle({
    endpoint: "/absen/",
    setter: setTotalAbsences,
    onSuccess: (res) =>
      Array.isArray(res)
        ? res.reduce((acc, item) => acc + Number(item.unapproved), 0)
        : 0,
  });

const fetchAbsencesKantor = () => {
  const { startDate, endDate } = getPeriodRange();
  return fetchAndHandle({
    endpoint: `/face/attendance/rekap?start=${startDate}&end=${endDate}`,
    setter: setTotalAbsencesKantor,
    onSuccess: (res) =>
      res.success && Array.isArray(res.data)
        ? res.data.reduce((acc, item) => acc + (item.total_days || 0), 0)
        : 0,
  });
};

const fetchProfile = async () => {
  try {
    const response = await fetch(`${apiUrl}/profil/`);
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      const storedUserId = localStorage.getItem("userId");
      const userProfile = result.data.find((profile) => String(profile.id) === storedUserId);
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

  const handleCardClick = (path) => {
    navigate(path);
  };

  const fetchTasks = [
    { fn: fetchDivisi, roles: [1, 4, 6] },
    { fn: fetchAbsences, roles: [1, 4, 5, 6] },
    { fn: fetchPayroll, roles: [1, 4, 6, 13] },
    { fn: fetchApprovedByPA, roles: [1, 5] },
    { fn: fetchLocation, roles: [1, 5] },
    { fn: fetchEmployees, roles: [1, 4, 6, 13] },
    { fn: fetchSuratDinas, roles: [1, 4, 5, 6, 13] },
    { fn: fetchAbsencesKantor, roles: [1, 4, 6] },
  ];
  
  useEffect(() => {
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);
    fetchProfile();
    fetchTasks.forEach(({ fn, roles }) => {
      if (roles.includes(roleId)) fn();
    });
    return () => clearInterval(intervalId);
  }, [roleId]);
  
  const allCards = [
    // { title: "Presensi Kehadiran", icon: faUserCheck, color: "text-blue-500", link: "/absensi", roles: [1, 4, 5, 6, 13],},
    { title: "Presensi Lapangan", icon: faMapMarkedAlt, color: "text-green-500", link: "/data-absensi", count: totalAbsences, roles: [1, 4, 6],},
    { title: "Presensi Kantor", icon: faBuilding, color: "text-indigo-500", link: "/absensi-kantor", count: totalAbsencesKantor, roles: [1, 4, 6],},
    { title: "Surat Dinas", icon: faPenFancy, color: "text-blue-500", link: "/surat-dinas", count: TotalSuratDinas, roles: [1, 4, 5, 6, 13],},
    { title: "Penggajian", icon: faMoneyCheckAlt, color: "text-amber-500", link: "/data-penggajian", count: totalPayroll, roles: [1, 4, 6, 13],},
    { title: "Persetujuan Lembur", icon: faThumbsUp, color: "text-emerald-500", link: "/data-approval", count: totalApprovals, roles: [1, 5],},
    { title: "Data Lokasi Presensi", icon: faMapMarkerAlt, color: "text-orange-500", link: "/data-lokasi", count: totalLocations?.length || 0, roles: [1, 5],},
    { title: "Karyawan", icon: faUsers, color: "text-violet-500", link: "/karyawan", count: employees?.length || 0, roles: [1, 4, 6, 13],},
    { title: "Divisi", icon: faUsersCog, color: "text-blue-500", link: "/divisi", count: totalDivisi, roles: [1, 4, 6],},
  ];
  const filteredCards = roleId !== null ? allCards.filter((card) => card.roles.includes(roleId)) : [];


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
          {filteredCards.length === 0 ? (
            <p className="text-center text-gray-400">Tidak ada data yang ditampilkan untuk role ini.</p>
          ) : (
            <div className={`grid grid-cols-1 ${filteredCards.length > 2 ? "md:grid-cols-4" : "md:grid-cols-2"} gap-4`}>
              {filteredCards.map((card, index) => (
                <DashboardCard key={index} title={card.title} count={card.count} icon={card.icon} color={card.color} onClick={() => handleCardClick(card.link)}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
