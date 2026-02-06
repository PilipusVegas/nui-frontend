import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faClock, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, } from "../../components";
import Swal from "sweetalert2";

const JadwalShift = () => {
  const [shiftList, setShiftList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const fetchShift = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithJwt(`${apiUrl}/shift`);
      if (!res.ok) throw new Error("Gagal mengambil data shift");
      const data = await res.json();
      setShiftList(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const handleDeleteShift = async (id, namaShift) => {
    const result = await Swal.fire({
      title: "Konfirmasi Penghapusan",
      text: `Apakah Anda yakin ingin menghapus data shift "${namaShift}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626", // merah (danger)
      cancelButtonColor: "#6b7280",  // abu-abu
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetchWithJwt(`${apiUrl}/shift/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus data shift");
      }

      await Swal.fire({
        title: "Berhasil",
        text: "Data shift berhasil dihapus.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      fetchShift();
    } catch (err) {
      Swal.fire({
        title: "Gagal",
        text: err.message || "Terjadi kesalahan saat menghapus data shift.",
        icon: "error",
      });
    }
  };



  return (
    <div className="w-full mx-auto">
      <SectionHeader title="Data Shift" subtitle="Daftar Data Jadwal Shift Karyawan." onBack={() => navigate(-1)}
        actions={
          <button onClick={() => navigate("/shift/tambah")} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition">
            <FontAwesomeIcon icon={faPlus} />
            <span>Tambah</span>
          </button>
        }
      />

      <div className="mt-6">
        {loading && <LoadingSpinner message="Memuat data shift..." />}
        {!loading && error && (
          <ErrorState message="Gagal Memuat Shift" detail={error} onRetry={fetchShift} />
        )}
        {!loading && !error && shiftList.length === 0 && (
          <EmptyState title="Belum Ada Shift" description="Saat ini belum ada data shift yang tersedia." icon={faClock} actionText="Tambah Shift" onAction={() => navigate("/shift/tambah")} />
        )}

        {!loading && !error && shiftList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {shiftList.map((shift) => (
              <div key={shift.id} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
                <div className="px-5 py-3 bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-between">
                  <h3 className="text-white font-semibold text-base tracking-wide">
                    {shift.nama}
                  </h3>

                  <button onClick={(e) => { e.stopPropagation(); handleDeleteShift(shift.id, shift.nama);}} className="text-white hover:text-red-600 transition" title="Hapus Shift">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>

                <div className="px-5 py-4 divide-y divide-gray-200">
                  {shift.detail.map((d, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 text-sm text-gray-700">
                      <span className="font-semibold text-gray-800 tracking-wide">
                        {d.hari}
                      </span>

                      <span className="text-gray-600">
                        {d.jam_masuk} – {d.jam_pulang}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalShift;
