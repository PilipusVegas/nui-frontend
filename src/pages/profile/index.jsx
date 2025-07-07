import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faPhone, faUser, faPen, faArrowRight, faUserCircle, faIdBadge, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    division: "",
    avatar: "https://via.placeholder.com/150",
    username: "",
    nip: ""
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id_user = localStorage.getItem("userId");
    if (!id_user) {
      console.error("User ID not found in localStorage.");
      setIsLoading(false);
      return;
    }

    fetch(`${apiUrl}/profil/${id_user}`)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(({ data: userProfile }) => {
        if (userProfile) {
          const userProfileData = {
            name: userProfile.nama,
            phone: userProfile.telp || "",
            division: userProfile.role_name || "No division",
            avatar: userProfile.foto || profileData.avatar,
            username: userProfile.username || "",
            nip: userProfile.nip || ""
          };
          setProfileData(userProfileData);
        }
      })
      .catch((error) => console.error("Error fetching profile data:", error))
      .finally(() => setIsLoading(false));
  }, [apiUrl]);

  if (isLoading) {
    return (
      <div className="loading animate-pulse text-center py-20 text-xl font-semibold text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <MobileLayout title="Profile">
      <div className="py-8 pb-4 px-7 min-w-full mx-auto bg-white rounded-xl shadow-xl space-y-2">
        {/* Avatar Section */}
        <div className="flex flex-col justify-center items-center mb-10">
          <div className="relative w-32 h-32 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r rounded-full shadow-md"></div>
            {profileData.foto ? (
              <img src={profileData.foto} alt="User Avatar" className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"/>
            ) : (
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
                <FontAwesomeIcon icon={faUserCircle} className="text-gray-400 w-32 h-32" />
              </div>
            )}
          </div>
          <button onClick={() => navigate(`/profile/edit/${localStorage.getItem("userId")}`)} className="flex items-center gap-2 border border-green-400 hover:bg-green-600 text-green-600 hover:text-white px-5 py-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 text-xs">
            <FontAwesomeIcon icon={faPen} />
            <span className="font-medium">Edit Profil</span>
          </button>
        </div>

        {/* Name */}
        <div className="flex items-center space-x-4 text-gray-600 font-medium mt-6">
          <FontAwesomeIcon icon={faUser} className="text-green-600 text-lg" />
          <div className="flex flex-col space-y-0">
            <span>Nama:</span>
            <span className="font-semibold text-gray-900 text-sm">
              {profileData.name || "-"}
            </span>
          </div>
        </div>
        <hr className="border-gray-300" />

        {/* NIP */}
        <div className="flex items-center space-x-4 text-gray-600 font-medium">
          <FontAwesomeIcon icon={faIdCard} className="text-green-600 text-lg" />
          <div className="flex flex-col space-y-1">
            <span>NIP:</span>
            <span className="font-semibold text-gray-900 text-sm">
              {profileData.nip || "-"}
            </span>
          </div>
        </div>
        <hr className="border-gray-300" />

        {/* Division */}
        <div className="flex items-center space-x-4 text-gray-600 font-medium">
          <FontAwesomeIcon icon={faBuilding} className="text-green-600 text-lg" />
          <div className="flex flex-col space-y-1">
            <span>Divisi:</span>
            <span className="font-semibold text-gray-900 text-sm">
              {profileData.division || "-"}
            </span>
          </div>
        </div>
        <hr className="border-gray-300" />

        {/* Phone */}
        <div className="flex items-center space-x-4 text-gray-600 font-medium">
          <FontAwesomeIcon icon={faPhone} className="text-green-600 text-lg" />
          <div className="flex flex-col w-full">
            <span className="text-sm">Telepon:</span>
            <span className="font-semibold text-gray-900 text-sm">
              {profileData.phone || "-"}
            </span>
          </div>
        </div>

        {/* saya mau memberi text saran ditengah sini */ }
        <div className="text-center text-[10px] uppercase tracking-wider text-gray-600 pt-5">
          PT. Nico Urban Indonesia 
        </div>

      </div>
    </MobileLayout>
  );
};

export default Profile;