import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const Notification = () => {
  const [currentTime, setCurrentTime] = useState("");

  // Fungsi untuk mendapatkan waktu saat ini
  useEffect(() => {
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

  return (
    <MobileLayout title="Notification" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">

      

      

      <div className="bg-white p-4 rounded-lg hover:shadow-md border border-transparent hover:text-emerald-800 hover:border-emerald-800 mb-2">
        <div>
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon icon={faBell} className=" transition-colors duration-300 pb-1 text-xs text-blue-800" />
            <h5 className="text-l font-semibold mb-1">Notification</h5>
            <p className="pb-1">•</p>
            <p className="pb-1 text-xs">{currentTime}</p>
          </div>
        </div>
        <p className=" text-xs">Lorem ipsum dolor sit amet consectetur adipisicing elit. At, quae.</p>
      </div>

      <div className="bg-white p-4 rounded-lg hover:shadow-md border border-transparent hover:text-emerald-800 hover:border-emerald-800 mb-2">
        <div>
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon icon={faBell} className=" transition-colors duration-300 pb-1 text-xs text-blue-800" />
            <h5 className="text-l font-semibold mb-1">Notification</h5>
            <p className="pb-1">•</p>
            <p className="pb-1 text-xs">{currentTime}</p>
          </div>
        </div>
        <p className=" text-xs">Lorem ipsum dolor sit amet consectetur adipisicing elit. At, quae.</p>
      </div>
      <div className="bg-white p-4 rounded-lg hover:shadow-md border border-transparent hover:text-emerald-800 hover:border-emerald-800 mb-2">
        <div>
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon icon={faBell} className=" transition-colors duration-300 pb-1 text-xs text-blue-800" />
            <h5 className="text-l font-semibold mb-1">Notification</h5>
            <p className="pb-1">•</p>
            <p className="pb-1 text-xs">{currentTime}</p>
          </div>
        </div>
        <p className=" text-xs">Lorem ipsum dolor sit amet consectetur adipisicing elit. At, quae.</p>
      </div>
      
      
      
    </MobileLayout>
  );
};

export default Notification;
