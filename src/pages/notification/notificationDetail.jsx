import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const NotificationDetail = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const [notification, setNotification] = useState(null);

  // Simulasi mengambil detail notifikasi berdasarkan ID
  useEffect(() => {
    const fetchNotificationDetail = async () => {
      try {
        const response = await fetch(`http://192.168.130.42:3002/notif/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setNotification(data); // Misalkan data adalah notifikasi yang diambil
      } catch (error) {
        console.error("Error fetching notification detail:", error);
      }
    };

    fetchNotificationDetail();
  }, [id]);

  if (!notification) {
    return <div className="text-center">Loading...</div>; 
  }

  return (
    <MobileLayout title="Detail Notifikasi">
      <div className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <FontAwesomeIcon icon={faBell} className="text-primary h-6 w-6 mr-2" />
          <h2 className="text-xl font-bold">{notification.title}</h2>
        </div>
        <p className="text-sm text-gray-500">{notification.date}</p>
        <p className="mt-4">{notification.content}</p>
      </div>
    </MobileLayout>
  );
};

export default NotificationDetail;
