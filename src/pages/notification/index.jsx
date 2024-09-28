import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import MobileLayout from "../../layouts/mobileLayout";
import NotificationDetail from "./notificationDetail";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [timeAgo, setTimeAgo] = useState([]);
  const [clickedNotifications, setClickedNotifications] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const id_user = localStorage.getItem("userId");
    if (!id_user) {
      console.log("No user ID found in localStorage. Skipping fetch.");
      setNotifications([]);
      setLoading(false);
      return;
    }
    if (hasFetched) return;

    // console.log("Fetching notifications for user:", id_user);
    fetch(`${apiUrl}/notif/user/${id_user}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); 
      })
      .then((data) => {
        const filteredNotifications = data.data.filter((notification) => {
          const notificationTime = new Date(notification.created_at);
          const now = new Date(); 
          const diffInDays = Math.floor((now - notificationTime) / (1000 * 60 * 60 * 24));
          return diffInDays < 3;
        });
        setNotifications(filteredNotifications);
        calculateTimeAgo(filteredNotifications);
        setHasFetched(true);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      })
      .finally(() => setLoading(false)); // Set loading to false after fetch
  }, [hasFetched, apiUrl]);

  const calculateTimeAgo = (notifications) => {
    const now = new Date();
    const updatedTimes = notifications.map((notification) => {
      const notificationTime = new Date(notification.created_at);
      const diffInMs = now - notificationTime;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes < 60) {
        return `${diffInMinutes} menit yang lalu`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} jam yang lalu`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} hari yang lalu`;
      }
    });
    setTimeAgo(updatedTimes);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      calculateTimeAgo(notifications);
    }, 60000);
    return () => clearInterval(timer);
  }, [notifications]);

  const handleNotificationClick = (id) => {
    const notification = notifications.find((notif) => notif.id === id);
    if (notification?.is_read || clickedNotifications.includes(id)) {
      setSelectedNotification(notification);
      setShowDetail(true);
      return;
    }

    // Mark the notification as read
    fetch(`${apiUrl}/notif/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_read: 1 }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update notification status");
        }
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === id ? { ...notification, is_read: 1 } : notification
          )
        );
        setClickedNotifications((prevClicked) => [...prevClicked, id]);
        setShowDetail(true);
        setSelectedNotification(notification);
        // console.log(notification);
      })
      .catch((error) => console.error("Error updating notification status:", error));
  };

  if (loading) return <h1 className="text-center text-gray-500">Loading...</h1>;

  return (
    <MobileLayout title="Notification" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      {showDetail ? (
        <NotificationDetail notification={selectedNotification} onBack={() => setShowDetail(false)} />
      ) : notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification.id)}
            className={`p-4 rounded-lg mb-2 border border-gray-300 shadow-sm cursor-pointer ${
              notification.is_read || clickedNotifications.includes(notification.id)
                ? "bg-gray-300"
                : "bg-white border-green-800"
            }`}
          >
            <div className="flex items-center space-x-1 mb-0 pb-0">
              <FontAwesomeIcon icon={faBell} className="transition-colors duration-300 pb-1 text-xs text-green-800" />
              <p className="text-xs text-gray-500 font-semibold mb-1">Notifikasi</p>
              <p className="pb-1 text-gray-500">•</p>
              <p className="pb-1 text-xs text-gray-500">{timeAgo[index] || "Beberapa saat yang lalu"}</p>
              <p className="pb-1 text-gray-500">•</p>
              <p className="pb-1 text-xs text-gray-500">{notification.is_read ? "Sudah dibaca" : "Belum dibaca"}</p>
            </div>
            <h6 className="text-l font-semibold mb-1 text-balance text-wrap text-justify break-words overflow-hidden">{notification.type.length > 35 ? `${notification.type.slice(0, 35)}...` : notification.type}</h6>
            <p className="text-l text-gray-500">{notification.message.length > 30 ? `${notification.message.slice(0, 30)}...` : notification.message}</p>
          </div>
        ))
      ) : (
        <h1 className="text-center text-gray-500">No notifications</h1>
      )}
    </MobileLayout>
  );  
};

export default Notification;
