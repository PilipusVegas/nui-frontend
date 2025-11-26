import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faIdCard, faUserTie, faChildren, faBuilding, faPhone, faClock, faCarSide, faEdit} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
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
    text && text !== "-" ? text : <span className="text-gray-400 italic">Tidak tersedia</span>;

  const formatStatusNikah = (status) =>
    status
      ? status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : <span className="text-gray-400 italic">Tidak tersedia</span>;

  const formatStatusKaryawan = (status) =>
    status ? (
      <span className="text-green-600 font-semibold">Aktif</span>
    ) : (
      <span className="text-red-500 font-semibold">Non-Aktif</span>
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
      <SectionHeader title="Profil Karyawan" subtitle="Informasi lengkap dan relevan" onBack={() => navigate(-1)}
        actions={
          <button onClick={() => navigate(`/karyawan/edit/${id}`)} className="flex items-center gap-2 bg-yellow-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all duration-200">
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit Profil</span>
          </button>
        }
      />

      <main className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6 transition-all duration-300">
        {loading && <LoadingSpinner message="Memuat data karyawan..." />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && !karyawan && <EmptyState message="Data karyawan tidak ditemukan." />}

        {!loading && !error && karyawan && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoCard label="Nama Lengkap" value={safeText(karyawan.nama)} icon={faUser} />
            <InfoCard label="Username" value={safeText(karyawan.username)} icon={faUser} />
            <InfoCard label="NIP" value={safeText(karyawan.nip)} icon={faIdCard} />
            <InfoCard label="NIK" value={safeText(karyawan.nik)} icon={faIdCard} />
            <InfoCard label="Perusahaan" value={safeText(karyawan.perusahaan)} icon={faBuilding} />
            <InfoCard label="Divisi" value={safeText(karyawan.role_name)} icon={faUserTie} />
            <InfoCard label="No. HP" value={safeText(karyawan.telp)} icon={faPhone} />
            <InfoCard label="Shift" value={safeText(karyawan.shift)} icon={faClock} />
            <InfoCard label="Status Karyawan" value={formatStatusKaryawan(karyawan.status)} />
            <InfoCard label="Status Kendaraan" value={formatStatusKendaraan(karyawan.status_kendaraan)} icon={faCarSide} />
            <InfoCard label="Nomor SIM" value={safeText(karyawan.nomor_sim)} />
            <InfoCard label="Jenis SIM" value={safeText(karyawan.jenis_sim)} />
            <InfoCard label="Kuota Cuti" value={karyawan.kuota_cuti ?? 0} />
            <InfoCard label="Alamat" value={safeText(karyawan.alamat)} />
            <InfoCard label="Status Nikah" value={formatStatusNikah(karyawan.status_nikah)} />
            <InfoCard label="Jumlah Anak" value={karyawan.jml_anak ?? 0} icon={faChildren} />
          </div>
        )}
      </main>
    </div>
  );
};

// === SUB KOMPONEN ===
const InfoCard = ({ label, value, icon }) => (
  <div className="flex flex-col bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-green-400 hover:shadow-lg transition-all duration-200">
    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
      {icon && <FontAwesomeIcon icon={icon} className="text-green-500" />}
      {label}
    </div>
    <div className="text-gray-900 font-semibold text-sm">{value}</div>
  </div>
);

export default DetailKaryawan;
