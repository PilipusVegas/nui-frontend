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
  <SectionHeader 
    title="Jam Kerja / Shift" 
    subtitle="Kelola jadwal shift karyawan dengan mudah."
    onBack={() => navigate(-1)}
    actions={
      <button 
        onClick={() => navigate("/shift/tambah")} 
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 
          hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg 
          transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 
          focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      >
        <FontAwesomeIcon icon={faPlus} />
        <span className="inline sm:hidden text-sm">Tambah</span>
        <span className="hidden sm:inline">Tambah Shift</span>
      </button>
    }
  />

  {/* GRID RESPONSIVE */}
  <div className="
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      md:grid-cols-3 
      lg:grid-cols-4 
      xl:grid-cols-5 
      gap-5 
      mt-6
    "
  >
    {shiftList.map((shift) => (
      <div 
        key={shift.id} 
        className="
          bg-white 
          rounded-2xl 
          border 
          border-gray-200 
          shadow-sm 
          hover:shadow-md 
          transition-all 
          duration-300 
          flex 
          flex-col
        "
      >
        {/* HEADER */}
        <div className="px-4 py-3 bg-green-600 text-white font-semibold text-base text-center tracking-wide rounded-t-2xl">
          {shift.nama}
        </div>

        {/* DETAIL (COMPACT MODE) */}
        <div className="p-3 flex flex-col gap-2">
          {shift.detail.map((d, idx) => (
            <div 
              key={idx} 
              className="
                flex 
                justify-between 
                items-center 
                bg-gray-50 
                hover:bg-green-50 
                transition 
                rounded-lg 
                px-3 
                py-2
                border 
                border-gray-100
                text-sm
              "
            >
              <span className="font-medium text-gray-800">{d.hari}</span>

              <span className="text-gray-600 text-xs sm:text-sm whitespace-nowrap">
                {d.jam_masuk} — {d.jam_pulang}
              </span>
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
