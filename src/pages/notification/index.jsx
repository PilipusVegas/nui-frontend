import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Fungsi untuk mendapatkan waktu saat ini
    const updateTime = () => {
      const now = new Date();
      const formattedTime = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${now.getFullYear()}`;
      setCurrentTime(formattedTime);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000); // Update setiap 1 menit

    // Membersihkan interval ketika komponen di-unmount
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Mengambil data notifikasi dari API
    fetch("/api/notifications")
      .then(response => response.json())
      .then(data => setNotifications(data))
      .catch(error => console.error("Error fetching notifications:", error));
  }, []);

  return (
    <MobileLayout title="Notification" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div className="bg-white p-4 rounded-lg hover:shadow-md border border-transparent hover:text-emerald-800 hover:border-emerald-800 mb-2">
        <div className="flex items-center space-x-1">
          <FontAwesomeIcon icon={faBell} className="transition-colors duration-300 pb-1 text-xs text-red-800" />
          <h5 className="text-l font-semibold mb-1">Notifications</h5>
          <p className="pb-1">•</p>
          <p className="pb-1 text-xs">{currentTime}</p>
        </div>
        <p className="text-xs">Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium consequatur nesciunt maiores temporibus, reiciendis nemo!</p>
      </div>
      

      {notifications.length > 0 ? (
        notifications.map((notif) => (
          <div key={notif._id} className="bg-white p-4 rounded-lg mb-2 border border-gray-300 shadow-sm">
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon icon={faBell} className="transition-colors duration-300 pb-1 text-xs text-red-800" />
              <h5 className="text-l font-semibold mb-1">Notification</h5>
              <p className="pb-1">•</p>
              <p className="pb-1 text-xs">{new Date(notif.tanggal).toLocaleDateString()}</p>
            </div>
            <p className="text-xs">{notif.message}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No notifications</p>
      )}
      
    </MobileLayout>
  );
};

export default Notification;
