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
  faCheckCircle,
  faTimesCircle,
  faUserEdit,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { LoadingSpinner, EmptyState, ErrorState, SectionHeader } from "../../components";


const DetailKaryawan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [karyawan, setKaryawan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TunjanganBadge = ({ label, active }) => (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-2 text-sm font-semibold ${active
        ? "border-green-300 bg-green-50 text-green-700"
        : "border-gray-200 bg-gray-50 text-gray-400"
        }`}
    >
      <span>{label}</span>
      <FontAwesomeIcon
        icon={active ? faCheckCircle : faTimesCircle}
        className={active ? "text-green-600" : "text-gray-400"}
      />
    </div>
  );

  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/profil/${id}`);
        if (!res.ok) throw new Error(`Gagal mengambil data (${res.status})`);
        const json = await res.json();
        setKaryawan(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchKaryawan();
  }, [id, apiUrl]);

  const safeText = (val) =>
    val && val !== "-" ? val : <span className="italic text-gray-400">Tidak tersedia</span>;

  const statusNikah = (val) =>
    val
      ? val
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Tidak tersedia";

  const statusKaryawan = (val) => (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${val ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
    >
      <FontAwesomeIcon icon={val ? faCheckCircle : faTimesCircle} />
      {val ? "Aktif Bekerja" : "Non-Aktif"}
    </span>
  );

  const statusKendaraan = (val) => {
    if (val === 1) return "Kendaraan Pribadi";
    if (val === 2) return "Kendaraan Kantor";
    if (val === 3) return "Transportasi Umum";
    return "Tidak diketahui";
  };

  return (
    <div className="space-y-2">
      <SectionHeader
        title="Profil Karyawan"
        subtitle="Informasi personal dan pekerjaan karyawan"
        onBack={() => navigate(-1)}
        actions={
          <button
            onClick={() => navigate(`/karyawan/edit/${id}`)}
            className="flex items-center gap-2 rounded bg-yellow-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-yellow-600"
          >
            <FontAwesomeIcon icon={faUserEdit} />
            Edit
          </button>
        }
      />

      <div className="rounded-2xl bg-white p-2">
        {loading && <LoadingSpinner message="Memuat profil karyawan..." />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && !karyawan && <EmptyState message="Data karyawan tidak ditemukan" />}

        {!loading && !error && karyawan && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4 rounded-xl border border-green-100 bg-green-50 p-5 md:col-span-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-3xl font-bold text-white">
                  {karyawan.nama?.charAt(0) || "?"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-900">{karyawan.nama}</h2>
                  <p className="mt-1 text-sm text-green-800 font-medium">
                    Kepala Divisi: {safeText(karyawan.nama_kadiv)}
                  </p>
                  <div className="mt-2">{statusKaryawan(karyawan.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoBadge label="NIP" value={safeText(karyawan.nip)} />
                <InfoBadge label="Shift" value={safeText(karyawan.shift)} />
                <InfoBadge label="Divisi" value={safeText(karyawan.role_name)} />
                <InfoBadge label="perusahaan" value={karyawan.perusahaan ?? 0} />
              </div>
            </div>

            {/* TUNJANGAN & FASILITAS */}
            <DataSection
              title={
                <div className="flex items-center justify-between">
                  <span>Tunjangan & Fasilitas</span>

                  <button
                    onClick={() => navigate(`/tunjangan-karyawan/${id}`)}
                    className="text-xs font-semibold text-green-600 hover:underline"
                  >
                    Kelola Tunjangan
                  </button>

                </div>
              }
            >

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TunjanganBadge label="Bensin" active={karyawan.tunjangan?.bensin === 1} />
                <TunjanganBadge label="Uang Makan" active={karyawan.tunjangan?.makan === 1} />
                <TunjanganBadge label="Dinas" active={karyawan.tunjangan?.dinas === 1} />
                <TunjanganBadge label="Penginapan" active={karyawan.tunjangan?.penginapan === 1} />

              </div>
            </DataSection>


            {/* BIODATA */}
            <DataSection title="Biodata Pribadi">
              <DataGrid>
                <DataItem icon={faIdCard} label="NIK" value={safeText(karyawan.nik)} />
                <DataItem icon={faChildren} label="Status Nikah" value={statusNikah(karyawan.status_nikah)} />
                <DataItem icon={faChildren} label="Jumlah Anak" value={karyawan.jml_anak ?? 0} />
              </DataGrid>
            </DataSection>

            {/* KONTAK */}
            <DataSection title="Kontak & Akun">
              <DataGrid>
                <DataItem icon={faPhone} label="No. HP" value={safeText(karyawan.telp)} />
                <DataItem icon={faUser} label="Username" value={safeText(karyawan.username)} />
              </DataGrid>
            </DataSection>

            <DataSection title="Administrasi & Payroll">
              <DataGrid>
                <DataItem icon={faIdCard} label="NPWP" value={safeText(karyawan.npwp)} />
                <DataItem icon={faIdCard} label="No. Rekening" value={safeText(karyawan.no_rek)} />
                {/* <DataItem icon={faBuilding} label="Alamat" value={safeText(karyawan.alamat)} /> */}
              </DataGrid>
            </DataSection>

            {/* STRUKTUR ORGANISASI */}
            {/* <DataSection title="Struktur Organisasi">
              <DataGrid>
                <DataItem icon={faUserTie} label="Kepala Divisi" value={safeText(karyawan.nama_kadiv)}/>
              </DataGrid>
            </DataSection> */}

            {/* PEKERJAAN */}
            <DataSection title="Informasi Pekerjaan">
              <DataGrid>
                <DataItem icon={faBuilding} label="Perusahaan" value={safeText(karyawan.perusahaan)} />
                <DataItem icon={faClock} label="Shift Kerja" value={safeText(karyawan.shift)} />
                <DataItem icon={faCarSide} label="Status Kendaraan" value={statusKendaraan(karyawan.status_kendaraan)} />
              </DataGrid>
            </DataSection>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= SUB ================= */
const DataSection = ({ title, children }) => (
  <section className="space-y-3">
    <h3 className="text-sm font-bold uppercase tracking-wide text-green-700">{title}</h3>
    {children}
  </section>
);

const DataGrid = ({ children }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
);

const DataItem = ({ label, value, icon }) => (
  <div className="rounded-xl border border-green-100 bg-white p-4 transition hover:border-green-400 hover:shadow">
    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-green-600">
      {icon && <FontAwesomeIcon icon={icon} />}
      {label}
    </div>
    <div className="text-sm font-semibold text-gray-800">{value}</div>
  </div>
);

const InfoBadge = ({ label, value }) => (
  <div className="rounded-lg border border-green-100 bg-white p-3 text-center">
    <div className="text-[11px] font-semibold uppercase text-green-600">{label}</div>
    <div className="text-sm font-bold text-gray-800">{value}</div>
  </div>
);

export default DetailKaryawan;
