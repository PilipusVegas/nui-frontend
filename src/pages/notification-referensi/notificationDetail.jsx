import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const NotificationDetail = ({ notification, setShowDetail }) => {

  return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <button
          onClick={() => setShowDetail(false)}
          className="top-2 right-2"
          aria-label="Close"
        > Close
        </button>
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
  );
};

export default NotificationDetail;
