import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faClock, faClockFour } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState } from "../../components";

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
      const result = Array.isArray(data) ? data : data.data ?? [];
      setShiftList(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat shift");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  if (loading) return <LoadingSpinner message="Memuat data shift..." />;

  if (error) return <ErrorState message="Gagal Memuat Shift" detail={error} onRetry={fetchShift} />;

  if (shiftList.length === 0)
    return (
      <EmptyState title="Belum Ada Shift" description="Saat ini belum ada data shift yang tersedia. Silakan tambahkan shift terlebih dahulu." icon={faClock} actionText="Tambah Shift" onAction={() => navigate("/shift/tambah")} />
    );

  return (
    <div className="w-full mx-auto">
      <SectionHeader title="Jam Kerja / Shift" subtitle="Kelola jadwal shift karyawan dengan mudah." onBack={() => navigate(-1)}
        actions={
          <button onClick={() => navigate("/shift/tambah")} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
            <FontAwesomeIcon icon={faPlus} />
            <span className="inline sm:hidden text-sm">Tambah</span>
            <span className="hidden sm:inline">Tambah Shift</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
        {shiftList.map((shift) => (
          <div key={shift.id} className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-green-600 text-white font-semibold text-lg text-center rounded-t-2xl tracking-wide">
              {shift.nama}
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
              {shift.detail.map((d, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 px-3 border-b border-gray-100 last:border-b-0 hover:bg-green-50 rounded-md transition-colors duration-200">
                  <span className="font-medium text-gray-800">{d.hari}</span>
                  <span className="text-gray-600 text-sm flex items-center gap-3">
                    <FontAwesomeIcon icon={faClockFour} className="text-green-500" />
                    {d.jam_masuk} - {d.jam_pulang}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer (opsional: misal tombol detail/ubah) */}
            {/* <div className="px-4 py-2 bg-gray-50 text-center">
        <button className="text-green-600 font-medium hover:underline">Detail</button>
      </div> */}
          </div>
        ))}
      </div>


    </div>
  );
};

export default JadwalShift;
