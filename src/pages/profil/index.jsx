import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faPhone,
  faUser,
  faPen,
  faUserCircle,
  faIdCard,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { LoadingSpinner, EmptyState, ErrorState } from "../../components";

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
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
          <LoadingSpinner message="Memuat data..." />
        </div>
      )}

      <div className="w-full space-y-5">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between sm:px-6">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-200">
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="text-5xl text-green-500"
                />
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {profileData?.nama || "Profil Pengguna"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {profileData?.role_name || "Data profil"}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/profile/edit/${user?.id_user}`)}
              className="inline-flex items-center gap-2 rounded-full border border-green-500 px-4 py-2 text-sm font-medium text-green-600 transition-colors duration-200 hover:bg-green-500 hover:text-white"
            >
              <FontAwesomeIcon icon={faPen} />
              <span>Edit Profil</span>
            </button>
          </div>
        </div>

        {error && <ErrorState message="Terjadi Kesalahan" detail={error} />}

        {!error && !isLoading && !profileData && (
          <EmptyState message="Data profil kosong" />
        )}

        {!error && profileData && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {profileFields.map((field, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <FontAwesomeIcon
                    icon={field.icon}
                    className="text-green-600 text-base"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">
                    {field.label}
                  </span>
                  <p className="mt-1 break-words text-sm font-semibold text-gray-900 sm:text-[0.95rem]">
                    {field.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;