import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faPhone, faUser, faPen, faUserCircle, faIdCard, faPeopleGroup,} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const Profile = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const user = getUserFromToken();
  const [profileData, setProfileData] = useState({ name: "", phone: "", divisi: "", perusahaan: "", avatar: "https://via.placeholder.com/150", username: "", nip: "",});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id_user = user?.id_user;
    if (!id_user) {
      console.error("User ID not found.");
      setIsLoading(false);
      return;
    }

    fetchWithJwt(`${apiUrl}/profil/${id_user}`)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(({ data: userProfile }) => {
        if (userProfile) {
          setProfileData({
            name: userProfile.nama,
            phone: userProfile.telp || "N/A",
            divisi: userProfile.divisi || "N/A",
            perusahaan: userProfile.perusahaan,
            avatar: userProfile.foto || profileData.avatar,
            username: userProfile.username || "N/A",
            nip: userProfile.nip || "N/A",
          });
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

  // Konfigurasi field
  const profileFields = [
    { icon: faUser, label: "Nama", value: profileData.name || "N/A" },
    { icon: faIdCard, label: "NIP", value: profileData.nip || "N/A" },
    { icon: faPeopleGroup, label: "Divisi", value: profileData.divisi || "N/A" },
    { icon: faBuilding, label: "Perusahaan", value: profileData.perusahaan || "N/A" },
    { icon: faPhone, label: "Telepon", value: profileData.phone || "N/A" },
  ];

  return (
    <MobileLayout title="Profile">
      <div className="py-8 pb-4 px-7 min-w-full mx-auto bg-white rounded-xl shadow-xl space-y-3">
        {/* Avatar Section */}
        <div className="flex flex-col justify-center items-center mb-10">
          <div className="relative w-32 h-32 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r rounded-full shadow-md"></div>
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"/>
            ) : (
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
                <FontAwesomeIcon icon={faUserCircle} className="text-gray-400 w-32 h-32"/>
              </div>
            )}
          </div>
          <button onClick={() => navigate(`/profile/edit/${user?.id_user}`)} className="flex items-center gap-2 border border-green-400 hover:bg-green-600 text-green-600 hover:text-white px-5 py-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 text-xs">
            <FontAwesomeIcon icon={faPen} />
            <span className="font-medium">Edit Profil</span>
          </button>
        </div>

        {/* Render profile fields otomatis */}
        {profileFields.map((field, idx) => (
          <div key={idx}>
            <div className="flex items-center space-x-4 text-gray-600 font-medium">
              <FontAwesomeIcon icon={field.icon} className="text-green-600 text-lg" />
              <div className="flex flex-col space-y-0">
                <span>{field.label}:</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {field.value}
                </span>
              </div>
            </div>
            {idx < profileFields.length - 1 && (
              <hr className="border-gray-300 my-1" />
            )}
          </div>
        ))}
      </div>
    </MobileLayout>
  );
};

export default Profile;
