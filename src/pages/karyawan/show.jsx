import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faUser, faIdCard, faMoneyCheckAlt, faEnvelopeOpenText,
  faPhone, faBuilding, faUsers, faClock, faUserTie, faChildren,
  faCheckCircle, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";

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
        if (!res.ok) throw new Error(`Gagal mengambil data karyawan. Status: ${res.status}`);
        const data = await res.json();

        setKaryawan({
          ...data.data,
          foto:
            data.data.foto &&
              data.data.foto !== "-" &&
              data.data.foto.trim() !== "" &&
              data.data.foto.split("/").pop() !== ""
              ? data.data.foto
              : null
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchKaryawan();
  }, [id, apiUrl]);

  const handleBack = () => navigate("/karyawan");

  const safeText = (text) =>
    text && text !== "-" ? text : <span className="text-gray-400">N/A</span>;

  const formatStatusNikah = (status) =>
    status
      ? status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : <span className="text-gray-400">N/A</span>;

  const statusLabel = (status) =>
    status === 1 ? (
      <span className="inline-flex items-center gap-2 text-green-600 font-semibold text-lg">
        <FontAwesomeIcon icon={faCheckCircle} /> Aktif
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 text-red-600 font-semibold text-lg">
        <FontAwesomeIcon icon={faTimesCircle} /> Nonaktif
      </span>
    );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div>
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-5">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full transition" title="Kembali">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Detail Karyawan</h1>
        </div>
      </div>

      <main>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col lg:flex-row gap-8 w-full transition-all duration-300">
          {/* Foto Profil */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            {karyawan?.foto ? (
              <img src={karyawan.foto} alt={`Foto profil ${karyawan?.nama || ""}`} className="w-40 h-56 sm:w-48 sm:h-64 object-cover rounded-xl shadow-md border border-gray-200 transition-transform transform hover:scale-105"/>
            ) : (
              <div className="w-40 h-56 sm:w-48 sm:h-64 flex items-center justify-center bg-gray-100 rounded-xl shadow-md border border-gray-200">
                <FontAwesomeIcon icon={faUser} className="text-gray-400 text-6xl sm:text-7xl" />
              </div>
            )}
            <div className="mt-2 px-4 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
              {statusLabel(karyawan.status)}
            </div>
          </div>

          {/* Detail Data */}
          <div className="flex-1">
            <SectionTitle text="Data Pribadi Karyawan" className="text-green-700" />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: faUser, label: "Nama Lengkap", value: safeText(karyawan.nama) },
                { icon: faIdCard, label: "NIK", value: safeText(karyawan.nik) },
                { icon: faIdCard, label: "NIP", value: safeText(karyawan.nip) },
                { icon: faMoneyCheckAlt, label: "NPWP", value: safeText(karyawan.npwp) },
                { icon: faMoneyCheckAlt, label: "No. Rekening", value: safeText(karyawan.no_rek) },
                { icon: faEnvelopeOpenText, label: "Username", value: safeText(karyawan.username) },
                { icon: faPhone, label: "Telepon", value: safeText(karyawan.telp) },
                { icon: faBuilding, label: "Perusahaan", value: safeText(karyawan.perusahaan) },
                { icon: faUsers, label: "Divisi", value: safeText(karyawan.role_name) },
                { icon: faClock, label: "Shift / Jabatan", value: safeText(karyawan.shift) },
                { icon: faUserTie, label: "Status Nikah", value: formatStatusNikah(karyawan.status_nikah) },
                { icon: faChildren, label: "Jumlah Anak", value: karyawan.jml_anak ?? <span className="text-gray-400">N/A</span> }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-transform transform hover:-translate-y-1">
                  <FontAwesomeIcon icon={item.icon} className="text-green-500 w-6 h-6 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-gray-500 text-sm">{item.label}</div>
                    <div className="text-gray-900 font-semibold">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SectionTitle = ({ text }) => (
  <h2 className="text-lg sm:text-xl font-bold text-green-700 border-b border-gray-200 pb-2">
    {text}
  </h2>
);

const DetailField = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 border-b border-gray-100 py-3">
    <FontAwesomeIcon icon={icon} className="text-green-600 w-5 h-5 flex-shrink-0" />
    <span className="font-medium text-gray-700 w-40 sm:w-48">{label}:</span>
    <span className="flex-1 text-gray-900">{value}</span>
  </div>
);

const LoadingState = () => (
  <div className="flex justify-center items-center h-screen bg-white">
    <p className="text-gray-500 text-lg">Loading data karyawan...</p>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="flex justify-center items-center h-screen bg-white">
    <p className="text-red-600 font-semibold">{error}</p>
  </div>
);

export default DetailKaryawan;
