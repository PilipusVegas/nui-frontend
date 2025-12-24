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

  return (
    <div className="w-full mx-auto">
      {/* SECTION HEADER — SELALU TAMPIL */}
      <SectionHeader
        title="Jam Kerja / Shift"
        subtitle="Kelola jadwal shift karyawan dengan mudah."
        onBack={() => navigate(-1)}
        actions={
          <button
            onClick={() => navigate("/shift/tambah")}
            className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5
              bg-gradient-to-r from-green-500 to-green-600
              hover:from-green-600 hover:to-green-700
              text-white font-medium rounded-lg shadow-md
              transition-all active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Tambah Shift</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        }
      />

      {/* CONTENT */}
      <div className="mt-6">
        {loading && <LoadingSpinner message="Memuat data shift..." />}

        {!loading && error && (
          <ErrorState
            message="Gagal Memuat Shift"
            detail={error}
            onRetry={fetchShift}
          />
        )}

        {!loading && !error && shiftList.length === 0 && (
          <EmptyState
            title="Belum Ada Shift"
            description="Saat ini belum ada data shift yang tersedia."
            icon={faClock}
            actionText="Tambah Shift"
            onAction={() => navigate("/shift/tambah")}
          />
        )}

        {!loading && !error && shiftList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {shiftList.map((shift) => (
              <div
                key={shift.id}
                className="bg-white border rounded-2xl shadow-md hover:shadow-xl transition"
              >
                <div className="px-4 py-4 bg-gradient-to-r from-green-600 to-green-500 flex justify-between">
                  <h3 className="text-white font-semibold">{shift.nama}</h3>
                  <span className="text-white text-sm opacity-90">{shift.id}</span>
                </div>

                <div className="p-4 py-2">
                  {shift.detail.map((d, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between py-1 text-sm">
                        <span className="font-semibold">{d.hari}</span>
                        <span>{d.jam_masuk} — {d.jam_pulang}</span>
                      </div>
                      {idx !== shift.detail.length - 1 && (
                        <div className="border-b my-1" />
                      )}
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
