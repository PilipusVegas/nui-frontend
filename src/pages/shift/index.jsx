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
          <button onClick={() => navigate("/shift/tambah")} className=" flex items-center justify-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
            <FontAwesomeIcon icon={faPlus} className="text-sm sm:text-base" />
            <span className="inline sm:hidden text-sm">Tambah</span>
            <span className="hidden sm:inline">Tambah Shift</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
        {shiftList.map((shift) => (
          <div key={shift.id} className="bg-white border border-gray-100 rounded-2xl  shadow-md  hover:shadow-xl  transition-all  duration-300  overflow-hidden">
            <div className="px-4 py-4 bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white tracking-wide">
                {shift.nama}
              </h3>

              <p className="text-white text-sm font-medium opacity-90">
                {shift.id}
              </p>
            </div>

            <div className="p-4 py-2">
              {shift.detail.map((d, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-gray-800 text-sm">
                      {d.hari}
                    </span>
                    <span className="text-gray-700 text-sm whitespace-nowrap font-medium">
                      {d.jam_masuk} — {d.jam_pulang}
                    </span>
                  </div>
                  {idx !== shift.detail.length - 1 && (
                    <div className="border-b border-gray-200 my-1"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

  );
};

export default JadwalShift;
