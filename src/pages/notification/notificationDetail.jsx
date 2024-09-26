import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faBell } from "@fortawesome/free-solid-svg-icons";

const NotificationDetail = ({ notification, onBack }) => {
  return (
    <div className={`bg-white shadow-lg rounded-2xl p-6 sm:p-10 mx-4 sm:mx-auto ${
        !notification.is_read ? "border-l-4 border-green-500" : ""
      }`}
    >
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 focus:outline-none transition duration-200 ease-in-out"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
        </button>
        <h6 className="text-lg sm:text-xl font-semibold text-gray-800 ml-3">Detail Notifikasi</h6>
      </div>

      <div className="border-t border-gray-200 my-6"></div>

      {/* Notification Icon and Meta Info */}
      <div className="flex items-start mb-6">
        <FontAwesomeIcon icon={faBell} className="text-3xl text-green-600 pt-2 px-3" />
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900">Notification</p>
          <div className="flex items-center text-gray-500 text-sm space-x-3">
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
      <div className="bg-gray-50 rounded-xl p-4 sm:p-6 shadow-inner">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 break-words overflow-hidden">
          {notification.type}
        </h1>
        <p className="text-sm font-semibold text-gray-600 mt-2">Isi Pesan:</p>
        <div className="max-h-60 overflow-y-auto">
          <p className="text-gray-700 leading-relaxed text-sm text-justify break-words overflow-hidden">
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetail;
