import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faBell } from "@fortawesome/free-solid-svg-icons";

const NotificationDetail = ({ notification, onBack }) => {
  return (
    <div
      className={`bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto ${
        !notification.is_read ? "border-l-4 border-green-500" : ""
      }`}
    >
      {/* Header with Back Button */}
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-500 hover:bg-green-200 focus:outline-none transition duration-150 ease-in-out"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
        </button>
        <h6 className="text-lg font-semibold text-gray-800 ml-2 pb-1">Detail Notifikasi</h6>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      {/* Notification Icon and Meta Info */}
      <div className="flex items-start mb-4">
        <FontAwesomeIcon icon={faBell} className="text-3xl text-green-800 pt-2 px-2" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">
            {notification.type.length > 34 ? `${notification.type.slice(0, 34)}...` : notification.type}
          </p>
          <div className="flex items-center text-gray-500 text-xs space-x-1 mt-1">
            <p>
              {new Date(notification.created_at).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
              })}
            </p>
            <span>•</span>
            <p>{notification.is_read ? "Sudah dibaca" : "Belum dibaca"}</p>
          </div>
        </div>
      </div>

      {/* Notification Message */}
      <div className="px-2 pt-3">
        <p className="font-semibold text-gray-800 mb-3">Isi Pesan :</p>
        <div className="max-h-40 overflow-y-auto">
          <p className="text-gray-700 text-base leading-relaxed break-words whitespace-pre-wrap">{notification.message}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
