  import { useState, useEffect } from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import Swal from "sweetalert2";
  import { faCalendarCheck, faClock, faBell, faHistory, faThList, faHome, faUser, faSignOutAlt, faQuestionCircle, faMapMarkerAlt, faArrowRight, faList, faPen, faPenFancy, faPeopleGroup,} from "@fortawesome/free-solid-svg-icons";
  import { fetchWithJwt, getUserFromToken  } from "../utils/jwtHelper";

  const HomeMobile = ({ handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profileData, setProfileData] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const user = getUserFromToken();
    const [loading, setLoading] = useState(true);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    useEffect(() => {
      const user = getUserFromToken();
      const idUser = user?.id_user;
      if (idUser) {
        const fetchNotifications = async () => {
          try {
            setLoading(true);
            const response = await fetchWithJwt(`${apiUrl}/notif/user/${idUser}`, {
              headers: { "Cache-Control": "no-cache" },
            });
            if (!response.ok) {
              throw new Error("Gagal mengambil data notifikasi");
            }
            const data = await response.json();
            const unreadNotifications = data?.data?.some((notif) => notif.is_read === 0);
            setHasNewNotifications(unreadNotifications);
          } catch (error) {
            console.error("Terjadi kesalahan:", error);
          } finally {
            setLoading(false);
          }
        };
        fetchNotifications();
      } else {
        setLoading(false);
      }
      return () => {
        setLoading(false);
      };
    }, [apiUrl]);
    


    useEffect(() => {
      const user = getUserFromToken();
      const idUser = user?.id_user;
      if (!idUser) return;
      const fetchProfile = async () => {
        try {
          const res = await fetchWithJwt(`${apiUrl}/profil/${idUser}`);
          const result = await res.json();
          if (result.success) {
            setProfileData(result.data);
          }
        } catch (err) {
          console.error("Gagal memuat data profil:", err);
        }
      };
      fetchProfile();
    }, [apiUrl]);


    useEffect(() => {
      const user = getUserFromToken();
      const idUser = user?.id_user;
      const fetchAttendance = async () => {
        try {
          const response = await fetchWithJwt(`${apiUrl}/absen/riwayat/${idUser}`);
          if (!response.ok) {
            throw new Error("Failed to fetch attendance data");
          }
          const data = await response.json();
          setAttendanceData(data);
        } catch (error) {
          console.error("Error fetching attendance:", error);
        }
      };
      if (idUser) fetchAttendance();
    }, [apiUrl]);


    const handleNotificationClick = () => {
      navigate("/notification");
      setHasNewNotifications(false);
    };

    const IconButton = ({ icon, image, label, onClick, color, hasNotification, isActive,}) => (
      <button onClick={onClick} aria-label={label} className={`flex flex-col items-center justify-center mb-1 py-2 px-4 relative transition-all duration-300 rounded-full ${ isActive ? "bg-white text-green-900" : " hover:text-green-900 px-2" }`}>
        <div className="relative">
          {icon && <FontAwesomeIcon icon={icon} className={`text-lg ${color}`} />}
          {image && (
            <div className={`p-3 rounded-lg ${color}`}>
              <img src={image} alt={label} className="w-8 h-8 object-contain mx-auto"/>
            </div>
          
          )}
          {hasNotification && (
            <>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
            </>
          )}
        </div>
        <span className="mt-1 text-xs font-medium">{label}</span>
      </button>
    );
    

    const calculateTotalHours = (startTime, endTime) => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end - start;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
    };

    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    };

    const confirmLogout = () => {
      Swal.fire({
        title: "Konfirmasi Logout",
        text: "Terimakasih atas kerja keras anda! Tetap semangat",
        icon: "question",
        cancelButtonText: "Batal",
        showCancelButton: true,
        confirmButtonText: "Ya, logout",
        confirmButtonColor: "#3085d6",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          handleLogout(); 
        }
      });
    };

    return (
      <div className="flex flex-col font-sans bg-gray-50 min-h-screen">
        {/* Header Hero */}
        <div className="bg-green-700 rounded-b-2xl px-8 py-2 relative shadow-lg">
          <button onClick={confirmLogout} title="Logout" className="absolute top-3 right-3 text-xl text-white hover:text-green-700 transition-colors hover:bg-white px-2 py-1 rounded-full">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
          <div className="flex flex-col py-5">
            <h2 className="text-sm font-semibold text-white">Selamat Bekerja,</h2>
            <div className="text-3xl font-bold text-white mb-2">
              {user?.nama_user || "User"}
            </div>
            <div className="text-sm text-white font-semibold inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-md w-fit">
              <FontAwesomeIcon icon={faPeopleGroup} className="mr-1" />
              {profileData?.role_name || "N/A"}
            </div>
          </div>
        </div>

        {/* NOTIFIKASI CARD */}
        {/* <div className="flex flex-row items-center p-1 mt-2">
          <span className="text-sm font-semibold pl-3">Notifikasi</span>
        </div>
        <div className="grid grid-cols-4 gap-2 px-4">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} setShowDetail={setShowDetail} />
          ))}
        </div> */}

        {/* MENU UTAMA */}
        <div className="flex flex-row items-center p-1 mt-2">
          <span className="text-sm font-semibold pl-3">Menu Utama</span>
        </div>
        <div className="grid grid-cols-4 gap-2 px-4">
          <IconButton icon={faCalendarCheck} label="Absen" onClick={() => navigate("/absensi")} color="p-4 rounded-lg bg-green-100 text-xl text-emerald-500"/>
          <IconButton icon={faClock} label="Lembur" onClick={() => navigate("/lembur")} color="p-4 rounded-lg bg-green-100 text-xl text-teal-500"/>
          <IconButton icon={faPenFancy} label="e-Form" onClick={() => navigate("/form")} color="p-4 rounded-lg bg-green-100 text-xl text-blue-500"/>
          <IconButton icon={faBell} label="Notifikasi" onClick={handleNotificationClick} hasNotification={hasNewNotifications} color="p-4 rounded-lg bg-green-100 text-xl text-amber-600"/> 
          <IconButton icon={faHistory} label="Riwayat" onClick={() => navigate("/riwayat-absensi")} color="p-4 rounded-lg bg-green-100 text-xl text-indigo-600"/>
          <IconButton icon={faThList} label="Lainnya" onClick={() => navigate("/menu")} color="p-4 rounded-lg bg-green-100 text-xl text-teal-600"/>
          <IconButton image="/NOS.png" label="NOS" onClick={() => window.open("https://nos.nicourbanindonesia.com/mypanel/maintenance", "_blank")} color="bg-green-100"/>
        </div>
        {/* MENU UTAMA */}

        {/* MENU BANTUAN */}
        <div className="flex items-center pl-4 mb-2 pt-3">
          <span className="text-sm font-semibold text-gray-800 mr-2">Bantuan</span>
          <FontAwesomeIcon icon={faQuestionCircle} className="text-md text-green-600" />
        </div>

        <div className="flex gap-4 px-4">
          {/* Team IT Card */}
          <div className="flex items-center gap-3 p-4 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition-all duration-300 w-full md:w-1/2" onClick={() => window.open("https://wa.me/628980128222", "_blank")}>
            <FontAwesomeIcon className="text-green-500 text-xl" icon={faWhatsapp} />
            <span className="font-medium text-gray-800">Team IT</span>
          </div>

          {/* Team Leader Card */}
          <div className="flex items-center gap-3 p-4 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 transition-all duration-300 w-full md:w-1/2" onClick={() => window.open("https://wa.me/6287819999599", "_blank")}>
            <FontAwesomeIcon className="text-green-500 text-xl" icon={faWhatsapp} />
            <span className="font-medium text-gray-800">Team Leader</span>
          </div>
        </div>

        {/* RIWAYAT */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2 py-2 bg-gray-50 rounded-lg">
            {/* Icon History */}
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faHistory} className="text-sm text-green-600" />
              <h2 className="text-sm font-bold text-gray-800">Riwayat Absensi</h2>
            </div>

            {/* Link "See all" */}
            <p className="text-md text-green-600 hover:text-green-800">
              <button onClick={() => navigate("/riwayat-absensi")} className="transition duration-200 ease-in-out hover:underline">
                see more <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </p>
          </div>

          <div className="grid gap-2 pb-20">
            {attendanceData.slice(0, 3).map((item) => (
              <div key={item.id_absen} className="flex flex-col bg-white shadow rounded-lg p-3">
                {/* Baris Utama: Tanggal, Check In, Check Out, Total Jam */}
                <div className="flex items-center justify-between text-center">
                  {/* Bagian Tanggal */}
                  <div className="flex flex-col items-center bg-green-600 py-4 px-4 rounded-lg">
                    <div className="text-4xl font-bold text-white">
                      {new Date(item.jam_mulai).getDate()}
                    </div>
                    <div className="text-xs text-white">
                      {new Date(item.jam_mulai).toLocaleDateString("id-ID", {
                        weekday: "long",
                      })}
                    </div>
                  </div>

                  {/* Bagian Waktu */}
                  <div className="flex-1 grid gap-3 text-center">
                    {/* Baris pertama: Waktu (Check In, Check Out, Total) */}
                    <div className="grid grid-cols-3 gap-1">
                      <div className="border-r border-gray-400">
                        <div className="text-lg font-bold text-gray-700">
                          {formatTime(item.jam_mulai)}
                        </div>
                        <span className="text-xs text-gray-600 ">Check In</span>
                      </div>
                      <div className="border-r border-gray-400">
                        <div className="text-lg text-gray-700 font-bold">
                          {item.jam_selesai ? formatTime(item.jam_selesai) : "-"}
                        </div>
                        <span className="text-xs text-gray-600">Check Out</span>
                      </div>
                      <div>
                        <div className="text-lg text-green-700 font-bold">
                          {item.jam_selesai ? calculateTotalHours(item.jam_mulai, item.jam_selesai) : "-"}
                        </div>
                        <span className="text-xs text-gray-600">Total Jam</span>
                      </div>
                    </div>

                    {/* Baris kedua: Lokasi */}
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-700">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" color="green" />
                        {item.lokasi_absen || "No location provided"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MENU FOOTER */}
        <div className="fixed bottom-[-5px] left-0 w-full flex justify-around items-center p-2 bg-green-700 shadow-md text-white rounded-t-2xl">
          <IconButton icon={faHome} label="Home" isActive={location.pathname === "/home"} onClick={() => navigate("/home")}/>
          <IconButton icon={faHistory} label="Riwayat" isActive={location.pathname === "/riwayat-absensi"} onClick={() => navigate("/riwayat-absensi")}/>
          <IconButton icon={faUser}  label="Profil" isActive={location.pathname === "/profile"} onClick={() => navigate("/profile")}/>
        </div>
        {/* MENU FOOTER */}
      </div>
    );
  };

  export default HomeMobile;
