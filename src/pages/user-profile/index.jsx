import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faPhone, faUser, faPen, faUserCircle, faIdCard, faPeopleGroup,} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { FooterMainBar, LoadingSpinner, EmptyState, ErrorState } from "../../components";

const Profile = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const user = getUserFromToken();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id_user = user?.id_user;
    if (!id_user) {
      setError("User ID tidak ditemukan");
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/profil/${id_user}`);
        if (!res.ok) throw new Error("Gagal memuat data profil");
        const { data } = await res.json();
        if (!data) throw new Error("Data profil kosong");

        setProfileData({
          nama: data.nama || "N/A",
          nip: data.nip || "N/A",
          role_name: data.role_name || "N/A",
          perusahaan: data.perusahaan || "N/A",
          telp: data.telp || "N/A",
          foto: data.foto ? `${apiUrl}${data.foto}` : null,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [apiUrl, user?.id_user]);

  const profileFields = profileData
    ? [
      { icon: faUser, label: "Nama", value: profileData.nama },
      { icon: faIdCard, label: "NIP", value: profileData.nip },
      { icon: faPeopleGroup, label: "Divisi", value: profileData.role_name },
      { icon: faBuilding, label: "Perusahaan", value: profileData.perusahaan },
      { icon: faPhone, label: "Telepon", value: profileData.telp },
    ]
    : [];

  return (
    <MobileLayout title="Profil Karyawan">
      <div className="p-3 min-w-full mx-auto space-y-4">
        <div className="flex flex-col justify-center items-center mb-5">
          <div className="relative w-24 h-24 mb-4">
            {profileData?.foto ? (
              <img src={profileData.foto} alt="User Avatar" className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"/>
            ) : (
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
                <FontAwesomeIcon icon={faUserCircle} className="text-gray-400 text-5xl" />
              </div>
            )}
          </div>

          <button onClick={() => navigate(`/profile/edit/${user?.id_user}`)} className="flex items-center gap-2 border border-green-500 text-green-600 hover:bg-green-600 hover:text-white px-5 py-2 rounded-full shadow-md text-xs transition-all duration-300">
            <FontAwesomeIcon icon={faPen} />
            <span className="font-medium">Edit Profil</span>
          </button>
        </div>

        {/* Status Loading / Error */}
        {error && <ErrorState message="Terjadi Kesalahan" detail={error} />}
        {!error && !isLoading && !profileData && <EmptyState message="Data profil kosong" />}

        {/* Data Profil */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10 rounded-xl">
              <LoadingSpinner message="Memuat data..." />
            </div>
          )}

          {!error && profileData && (
            <div className="space-y-3">
              {profileFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-3 px-1 py-2 border-b border-gray-300 last:border-none">
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                    <FontAwesomeIcon icon={field.icon} className="text-green-600 text-[1.05rem]"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide leading-tight">
                      {field.label}
                    </span>
                    <span className="text-gray-900 text-[0.9rem] font-semibold leading-snug">
                      {field.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <FooterMainBar />
    </MobileLayout>
  );
};

export default Profile;