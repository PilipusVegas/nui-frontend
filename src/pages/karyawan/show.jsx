import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faIdCard,
  faMoneyCheckAlt,
  faUserTie,
  faChildren,
  faBuilding,
  faPhone,
  faClock,
  faCarSide,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { LoadingSpinner, EmptyState, ErrorState, SectionHeader } from "../../components";

const DetailKaryawan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [karyawan, setKaryawan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/profil/${id}`);
        if (!res.ok) throw new Error(`Gagal mengambil data. (${res.status})`);
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
    text && text !== "-" ? text : <span className="text-gray-400 italic">Tidak tersedia</span>;

  const formatStatusNikah = (status) =>
    status
      ? status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : <span className="text-gray-400 italic">Tidak tersedia</span>;

  return (
    <div className="w-full">
      <SectionHeader
        title="Detail Karyawan"
        subtitle="Informasi profil lengkap karyawan"
        onBack={() => navigate("/karyawan")}
        actions={
          <button
            onClick={() => navigate(`/karyawan/edit/${id}`)}
            className="flex items-center gap-2 bg-yellow-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faUserTie} />
            <span>Edit Data</span>
          </button>
        }
      />

      <main className="bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-8 transition-all duration-300">
        {loading && <LoadingSpinner message="Memuat data karyawan..." />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && !karyawan && <EmptyState message="Data karyawan tidak ditemukan." />}

        {!loading && !error && karyawan && (
          <>
            {/* === BIODATA === */}
            <SectionTitle text="Biodata Karyawan" />
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* FOTO PROFIL */}
              {karyawan.foto ? (
                <img
                  src={karyawan.foto}
                  alt={`Foto ${karyawan.nama || ""}`}
                  className="w-36 h-48 sm:w-44 sm:h-56 object-cover rounded-xl shadow-md border border-gray-200"
                />
              ) : (
                <div className="w-36 h-48 sm:w-44 sm:h-56 flex items-center justify-center bg-gray-100 rounded-xl shadow-inner border border-gray-200">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400 text-5xl sm:text-6xl" />
                </div>
              )}

              {/* INFO BIODATA */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BioItem label="Nama Lengkap" value={safeText(karyawan.nama)} />
                <BioItem label="NIP" value={safeText(karyawan.nip)} />
                <BioItem label="Perusahaan" value={safeText(karyawan.perusahaan)} icon={faBuilding} />
                <BioItem label="Divisi" value={safeText(karyawan.role_name)} icon={faUserTie} />
                <BioItem label="No. HP" value={safeText(karyawan.telp)} icon={faPhone} />
                <BioItem label="Shift" value={safeText(karyawan.shift)} icon={faClock} />
                <BioItem label="Status Karyawan" value={ karyawan.status ? <span className="text-green-600 font-semibold">Aktif</span> : <span className="text-red-500 font-semibold">Non-Aktif</span>}/>
                <BioItem label="Status Kendaraan" value={ karyawan.status_kendaraan === 1 ? "Kendaraan Pribadi" : karyawan.status_kendaraan === 2 ? "Kendaraan Kantor" : "Tidak Mendapat Tunjangan"} icon={faCarSide}/>
              </div>
            </div>

            {/* === INFORMASI TAMBAHAN === */}
            <SectionTitle text="Informasi Tambahan" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: faIdCard, label: "NIK", value: safeText(karyawan.nik) },
                { icon: faMoneyCheckAlt, label: "NPWP", value: safeText(karyawan.npwp) },
                { icon: faMoneyCheckAlt, label: "No. Rekening", value: safeText(karyawan.no_rek) },
                { icon: faUserTie, label: "Status Nikah", value: formatStatusNikah(karyawan.status_nikah) },
                { icon: faChildren, label: "Jumlah Anak", value: karyawan.jml_anak ?? <span className="text-gray-400 italic">0</span> },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={item.icon} className="text-green-500 w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-xs">{item.label}</div>
                    <div className="text-gray-900 font-semibold text-sm">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// === SUB KOMPONEN ===
const SectionTitle = ({ text }) => (
  <h2 className="text-base sm:text-lg font-bold text-green-700 border-l-4 border-green-500 pl-3">
    {text}
  </h2>
);

const BioItem = ({ label, value, icon }) => (
  <div className="flex flex-col bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-green-400 transition-colors">
    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-0.5">
      {icon && <FontAwesomeIcon icon={icon} className="text-green-500" />}
      {label}
    </div>
    <span className="text-gray-900 font-semibold text-sm">{value}</span>
  </div>
);

export default DetailKaryawan;
