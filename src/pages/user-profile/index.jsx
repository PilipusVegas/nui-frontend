import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faPhone, faUser, faPen, faUserCircle, faIdCard, faPeopleGroup} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { FooterMainBar, LoadingSpinner, EmptyState, ErrorState } from "../../components";

const Profile = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    divisi: "",
    perusahaan: "",
    avatar: "https://via.placeholder.com/150",
    username: "",
    nip: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id_user = user?.id_user;
    if (!id_user) {
      setError("User ID tidak ditemukan");
      setIsLoading(false);
      return;
    }

    fetchWithJwt(`${apiUrl}/profil/${id_user}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data profil");
        return res.json();
      })
      .then(({ data }) => {
        if (!data) throw new Error("Data profil kosong");
        setProfileData({
          name: data.nama,
          phone: data.telp || "N/A",
          divisi: data.divisi || "N/A",
          perusahaan: data.perusahaan || "N/A",
          avatar: data.foto || profileData.avatar,
          username: data.username || "N/A",
          nip: data.nip || "N/A",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  const profileFields = [
    { icon: faUser, label: "Nama", value: profileData.name || "N/A" },
    { icon: faIdCard, label: "NIP", value: profileData.nip || "N/A" },
    { icon: faPeopleGroup, label: "Divisi", value: profileData.divisi || "N/A" },
    { icon: faBuilding, label: "Perusahaan", value: profileData.perusahaan || "N/A" },
    { icon: faPhone, label: "Telepon", value: profileData.phone || "N/A" },
  ];

  return (
    <MobileLayout title="Profil Karyawan">
      <div className="py-8 pb-4 px-7 min-w-full mx-auto bg-white rounded-xl shadow-xl space-y-3">
        {/* Avatar Section selalu tampil */}
        <div className="flex flex-col justify-center items-center mb-10">
          <div className="relative w-32 h-32 mb-4">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"/>
            ) : (
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
                <FontAwesomeIcon icon={faUserCircle} className="text-gray-400 w-32 h-32" />
              </div>
            )}
          </div>
          <button onClick={() => navigate(`/profile/edit/${user?.id_user}`)} className="flex items-center gap-2 border border-green-400 hover:bg-green-600 text-green-600 hover:text-white px-5 py-2 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 text-xs">
            <FontAwesomeIcon icon={faPen} />
            <span className="font-medium">Edit Profil</span>
          </button>
        </div>

        {/* Kondisi error / kosong */}
        {error && <ErrorState message="Terjadi Kesalahan" detail={error} />}
        {!error && !isLoading && !profileData.name && (
          <EmptyState message="Data profil kosong" />
        )}

        {/* Data profil: tetap render, hanya beri overlay loading */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 flex justify-center items-center z-10 rounded-xl">
              <LoadingSpinner message="Memuat data..." />
            </div>
          )}

          {!error && profileFields.map((field, idx) => (
            <div key={idx}>
              <div className="flex items-center space-x-4 text-gray-600 font-medium">
                <FontAwesomeIcon icon={field.icon} className="text-green-600 text-lg" />
                <div className="flex flex-col">
                  <span>{field.label}:</span>
                  <span className="font-semibold text-gray-900 text-sm">{field.value}</span>
                </div>
              </div>
              {idx < profileFields.length - 1 && <hr className="border-gray-300 my-1" />}
            </div>
          ))}
        </div>
      </div>
      <FooterMainBar />
    </MobileLayout>
  );
};

export default Profile;
