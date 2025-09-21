import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faIdCard, faMoneyCheckAlt, faUserTie, faChildren, } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { LoadingSpinner, EmptyState, ErrorState, SectionHeader, } from "../../components";

const DetailKaryawan = () => {
  const { id } = useParams();
  const user = getUserFromToken();
  const navigate = useNavigate();
  const [karyawan, setKaryawan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/profil/${id}`);
        if (!res.ok)
          throw new Error(`Gagal mengambil data karyawan. Status: ${res.status}`);
        const data = await res.json();
        setKaryawan({
          ...data.data,
          foto:
            data.data.foto &&
              data.data.foto !== "-" &&
              data.data.foto.trim() !== "" &&
              data.data.foto.split("/").pop() !== ""
              ? data.data.foto
              : null,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchKaryawan();
  }, [id, apiUrl]);

  const safeText = (text) =>
    text && text !== "-" ? text : <span className="text-gray-400">N/A</span>;

  const formatStatusNikah = (status) =>
    status
      ? status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
      : <span className="text-gray-400">N/A</span>;

  const showExtraInfo = user?.id_perusahaan !== 1 && user?.id_perusahaan !== 4;

  return (
    <div>
      <SectionHeader title="Detail Karyawan" subtitle="Informasi lengkap karyawan" onBack={() => navigate("/karyawan")} />

      <main className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6 pt-4 w-full transition-all duration-300 space-y-8">
        {loading && <LoadingSpinner message="Memuat data karyawan..." />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && !karyawan && ( <EmptyState message="Data karyawan tidak ditemukan." />)}
        {!loading && !error && karyawan && (
          <>
            <SectionTitle text="Biodata Karyawan" />

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Foto */}
              {karyawan?.foto ? (
                <img src={karyawan.foto} alt={`Foto profil ${karyawan?.nama || ""}`} className="w-40 h-56 sm:w-48 sm:h-64 object-cover rounded-xl shadow-md border border-gray-200" />
              ) : (
                <div className="w-40 h-56 sm:w-48 sm:h-64 flex items-center justify-center bg-gray-100 rounded-xl shadow-md border border-gray-200">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400 text-6xl sm:text-7xl" />
                </div>
              )}

              {/* Biodata */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BioItem label="Nama Lengkap" value={safeText(karyawan.nama)} />
                <BioItem label="NIP" value={safeText(karyawan.nip)} />
                <BioItem label="Perusahaan" value={safeText(karyawan.perusahaan)} />
                <BioItem label="Divisi" value={safeText(karyawan.role_name)} />
                <BioItem label="Username Login" value={safeText(karyawan.username)} />
                <BioItem label="No. Handphone" value={safeText(karyawan.telp)} />
                <BioItem label="Shift" value={safeText(karyawan.shift)} />
                <BioItem label="Status Karyawan" value={safeText(karyawan.status ? "Aktif" : "Non-Aktif")} />
              </div>
            </div>

            {/* Informasi Tambahan */}
            {showExtraInfo && (
              <>
                <SectionTitle text="Informasi Tambahan" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: faIdCard, label: "NIK", value: safeText(karyawan.nik) },
                    { icon: faMoneyCheckAlt, label: "NPWP", value: safeText(karyawan.npwp) },
                    { icon: faMoneyCheckAlt, label: "No. Rekening", value: safeText(karyawan.no_rek) },
                    { icon: faUserTie, label: "Status Nikah", value: formatStatusNikah(karyawan.status_nikah), },
                    { icon: faChildren, label: "Jumlah Anak", value: karyawan.jml_anak ?? (<span className="text-gray-400">N/A</span>), },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-transform hover:-translate-y-1">
                      <FontAwesomeIcon icon={item.icon} className="text-green-500 w-6 h-6 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-gray-500 text-sm">{item.label}</div>
                        <div className="text-gray-900 font-semibold">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const SectionTitle = ({ text }) => (
  <h2 className="text-lg sm:text-xl font-bold text-green-700 border-b border-gray-200 pb-2">
    {text}
  </h2>
);

const BioItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-900 font-semibold">{value}</span>
  </div>
);

export default DetailKaryawan;