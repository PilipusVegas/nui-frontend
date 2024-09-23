import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const NotificationDetail = () => {
  const { id } = useParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    const fetchNotificationDetail = async () => {
      try {
        const id_user = localStorage.getItem("userId");
        const response = await fetch(`${apiUrl}/notif/user/${id_user}`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const notificationDetail = result.data.find((notif) => notif.id === parseInt(id));
          setNotification(notificationDetail);
        } else {
          throw new Error("Notification not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationDetail();
  }, [id, apiUrl]);

  if (loading) return <div className="text-center text-lg font-semibold">Loading...</div>;
  if (error) return <div className="text-center text-red-500 text-lg font-semibold">Error: {error}</div>;
  if (!notification) return <div className="text-center text-lg font-semibold">Notification not found</div>;

  return (
    <MobileLayout title="Detail Notifikasi">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-green-500 text-white rounded-full p-2">
            <FontAwesomeIcon icon={faBell} className="text-xl" />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-gray-800">Notifikasi</h5>
            <div className="flex items-center text-gray-500 space-x-1">
              <p className="text-xs">
                {new Date(notification.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
              </p>

              <span>•</span>
              <p className="text-xs">{notification.is_read ? "Sudah dibaca" : "Belum dibaca"}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        {/* Judul dan Tipe Notifikasi */}
        <h6 className="text-lg font-semibold text-gray-800 mb-2">{notification.type}</h6>
        <p className="text-gray-700 text-base leading-relaxed">{notification.message}</p>
      </div>
    </MobileLayout>
  );
};

export default NotificationDetail;
