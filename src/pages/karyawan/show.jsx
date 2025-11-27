import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faIdCard,
  faUserTie,
  faChildren,
  faBuilding,
  faPhone,
  faClock,
  faCarSide,
  faEdit,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import {
  LoadingSpinner,
  EmptyState,
  ErrorState,
  SectionHeader,
} from "../../components";

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
        setKaryawan(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchKaryawan();
  }, [id, apiUrl]);

  const safeText = (text) =>
    text && text !== "-" ? (
      text
    ) : (
      <span className="text-gray-400 italic">Tidak tersedia</span>
    );

  const formatStatusNikah = (status) =>
    status
      ? status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : "Tidak tersedia";

  const formatStatusKaryawan = (status) =>
    status ? (
      <span className="text-green-600 font-semibold">Aktif Bekerja</span>
    ) : (
      <span className="text-red-500 font-semibold">Non-Aktif Bekerja</span>
    );

  const formatStatusKendaraan = (status) =>
    status === 1
      ? "Kendaraan Pribadi"
      : status === 3
      ? "Transportasi Umum"
      : status === 2
      ? "Kendaraan Kantor"
      : "Belum diketahui";

  return (
    <div className="w-full">
      <SectionHeader
        title="Profil Karyawan"
        subtitle="Informasi lengkap, rapi, dan mudah dibaca"
        onBack={() => navigate(-1)}
        actions={
          <button
            onClick={() => navigate(`/karyawan/edit/${id}`)}
            className="flex items-center gap-2 bg-yellow-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all"
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit Profil</span>
          </button>
        }
      />

      <main className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-10 space-y-10">
        {loading && <LoadingSpinner message="Memuat data karyawan..." />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && !karyawan && (
          <EmptyState message="Data karyawan tidak ditemukan." />
        )}

        {/* === KONTEN UTAMA === */}
        {!loading && !error && karyawan && (
          <>
            {/* ==== HEADER PROFIL ==== */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-4xl font-bold shadow-inner">
                {karyawan.nama?.charAt(0).toUpperCase() ?? "?"}
              </div>

              {/* Info Singkat */}
              <div className="flex flex-col space-y-1">
                <h2 className="text-2xl font-bold text-gray-800">
                  {karyawan.nama}
                </h2>
                <p className="text-gray-500 text-sm">
                  {karyawan.role_name} • {karyawan.perusahaan}
                </p>
                <div className="text-sm">
                  Status: {formatStatusKaryawan(karyawan.status)}
                </div>
              </div>
            </div>

            {/* ==== BIODATA GRID ==== */}
            <div className="space-y-8">
              {/* Biodata */}
              <Section title="Biodata">
                <BiodataGrid>
                  <Info label="NIP" value={safeText(karyawan.nip)} icon={faIdCard} />
                  <Info label="NIK" value={safeText(karyawan.nik)} icon={faIdCard} />
                  <Info label="Status Nikah" value={formatStatusNikah(karyawan.status_nikah)} />
                  <Info label="Jumlah Anak" value={karyawan.jml_anak ?? 0} icon={faChildren} />
                  {/* <Info label="Alamat" value={safeText(karyawan.alamat)} icon={faHome} /> */}
                </BiodataGrid>
              </Section>

              {/* Kontak */}
              <Section title="Kontak">
                <BiodataGrid>
                  <Info label="No. HP" value={safeText(karyawan.telp)} icon={faPhone} />
                  <Info label="Username" value={safeText(karyawan.username)} icon={faUser} />
                </BiodataGrid>
              </Section>

              {/* Pekerjaan */}
              <Section title="Pekerjaan">
                <BiodataGrid>
                  <Info label="Divisi" value={safeText(karyawan.role_name)} icon={faUserTie} />
                  <Info label="Perusahaan" value={safeText(karyawan.perusahaan)} icon={faBuilding} />
                  <Info label="Shift" value={safeText(karyawan.shift)} icon={faClock} />
                  <Info label="Kuota Cuti" value={karyawan.kuota_cuti ?? 0} />
                </BiodataGrid>
              </Section>

              {/* Lainnya */}
              <Section title="Lainnya">
                <BiodataGrid>
                  <Info label="Status Kendaraan" value={formatStatusKendaraan(karyawan.status_kendaraan)} icon={faCarSide} />
                  {/* <Info label="Nomor SIM" value={safeText(karyawan.nomor_sim)} /> */}
                  {/* <Info label="Jenis SIM" value={safeText(karyawan.jenis_sim)} /> */}
                </BiodataGrid>
              </Section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

/* ======================== SUB KOMPONEN ====================== */

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    {children}
  </div>
);

const BiodataGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {children}
  </div>
);

const Info = ({ label, value, icon }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-400 hover:shadow transition-all">
    <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
      {icon && <FontAwesomeIcon icon={icon} className="text-green-500 text-sm" />}
      {label}
    </div>
    <div className="text-gray-900 font-semibold text-sm">{value}</div>
  </div>
);

export default DetailKaryawan;
