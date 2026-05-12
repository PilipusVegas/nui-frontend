import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faPhone,
  faPen,
  faUserCircle,
  faIdCard,
  faPeopleGroup,
  faShieldHalved,
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
        { icon: faIdCard, label: "NIP", value: profileData.nip },
        { icon: faPeopleGroup, label: "Divisi", value: profileData.role_name },
        { icon: faBuilding, label: "Perusahaan", value: profileData.perusahaan },
        { icon: faPhone, label: "Telepon", value: profileData.telp },
      ]
    : [];

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex min-h-[420px] items-center justify-center rounded-3xl bg-white/80 backdrop-blur-md">
          <LoadingSpinner message="Memuat data profil..." />
        </div>
      )}

      {error && <ErrorState message="Terjadi Kesalahan" detail={error} />}

      {!error && !isLoading && !profileData && (
        <EmptyState message="Data profil kosong" />
      )}

      {!error && profileData && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          {/* HERO */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-lime-50">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-green-300/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />

            <div className="relative px-4 py-5 sm:px-7 sm:py-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-green-100 sm:h-[72px] sm:w-[72px]">
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="text-[44px] text-green-600 sm:text-5xl"
                    />

                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white ring-4 ring-white">
                      <FontAwesomeIcon
                        icon={faShieldHalved}
                        className="text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="min-w-0 max-w-full">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-green-700 sm:text-[11px]">
                      Profil Pengguna
                    </p>

                    <h2 className="max-w-full break-words text-lg font-bold leading-snug text-slate-950 sm:text-xl md:text-2xl">
                      {profileData.nama}
                    </h2>

                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
                      Data identitas pengguna yang terdaftar di sistem.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/profile/edit/${user?.id_user}`)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-green-700 active:scale-[0.98] sm:w-auto"
                >
                  <FontAwesomeIcon icon={faPen} className="text-xs" />
                  Edit Profil
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="px-4 py-5 sm:px-7 sm:py-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900">
                  Informasi Akun
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Ringkasan data utama pengguna.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700 ring-1 ring-green-100">
                Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-2">
              {profileFields.map((field, idx) => {
                const isLastOdd =
                  profileFields.length % 2 !== 0 &&
                  idx === profileFields.length - 1;

                return (
                  <div
                    key={idx}
                    className={`group flex min-w-0 items-start gap-3 border-b border-slate-100 px-4 py-4 transition-all duration-200 hover:bg-green-50/40 md:odd:border-r ${
                      isLastOdd ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 ring-1 ring-green-100 transition-all duration-200 group-hover:bg-green-100">
                      <FontAwesomeIcon icon={field.icon} className="text-sm" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        {field.label}
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]">
                        {field.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;