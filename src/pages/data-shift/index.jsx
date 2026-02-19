import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faClock, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState } from "../../components";
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
      const res = await fetchWithJwt(`${apiUrl}/shift/all`);
      if (!res.ok) throw new Error("Gagal mengambil data shift");
      const data = await res.json();

      const normalized = (data.data ?? []).map((item) => ({
        ...item,
        status: item.is_active,
      }));

      setShiftList(normalized);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const handleToggleShift = async (shift) => {
    const isActive = shift.status === 1;

    // Konfirmasi awal sebelum aksi
    const confirm = await Swal.fire({
      title: isActive ? "Nonaktifkan Shift?" : "Aktifkan Shift?",
      html: `
      <div style="text-align:left">
        <p>
          Anda akan <b>${isActive ? "menonaktifkan" : "mengaktifkan kembali"}</b>
          <b>${shift.nama}</b>.
        </p>
        <p style="margin-top:8px">
          ${isActive
          ? "Shift ini tidak akan digunakan sementara pada penjadwalan karyawan."
          : "Shift ini akan kembali tersedia dan dapat digunakan pada penjadwalan karyawan."}
        </p>
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isActive ? "Ya, Nonaktifkan Shift" : "Ya, Aktifkan Shift",
      cancelButtonText: "Batal",
      confirmButtonColor: isActive ? "#dc2626" : "#16a34a",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      // Request ke backend (sesuai kontrak backend: status)
      const res = await fetchWithJwt(`${apiUrl}/shift/${shift.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: isActive ? 0 : 1,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengubah status shift");

      // Pesan sukses yang informatif
      if (isActive) {
        await Swal.fire({
          icon: "success",
          title: "Shift Berhasil Dinonaktifkan",
          html: `
          <div style="text-align:left">
            <p>
              <b>${shift.nama}</b> berhasil <b>dinonaktifkan</b> dan
              <b>tidak akan muncul</b> pada menu penjadwalan karyawan.
            </p>
            <p style="margin-top:10px">
              <b>Tindak lanjut:</b><br/>
              Mohon informasikan kepada <b>Kepala Divisi masing-masing</b>
              agar segera melakukan penyesuaian jadwal kerja karyawan
              yang sebelumnya menggunakan shift ini.
            </p>
          </div>
        `,
          confirmButtonText: "Mengerti",
          confirmButtonColor: "#16a34a",
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "Shift Berhasil Diaktifkan",
          html: `
          <div style="text-align:left">
            <p>
              Shift <b>${shift.nama}</b> berhasil <b>diaktifkan kembali</b>.
            </p>
            <p style="margin-top:8px">
              Shift ini sekarang <b>tersedia dan dapat digunakan</b>
              di seluruh menu penjadwalan karyawan.
            </p>
          </div>
        `,
          confirmButtonText: "OK",
          confirmButtonColor: "#16a34a",
        });
      }

      // Refresh data
      fetchShift();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: err.message || "Terjadi kesalahan saat memperbarui status shift.",
      });
    }
  };


  return (
    <div className="w-full mx-auto">
      <SectionHeader title="Data Shift" subtitle="Daftar Data Jadwal Shift Karyawan." onBack={() => navigate(-1)}
        actions={
          <button
            onClick={() => navigate("/shift/tambah")}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition"
          >
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
          <EmptyState
            title="Belum Ada Shift"
            description="Saat ini belum ada data shift yang tersedia."
            icon={faClock}
            actionText="Tambah Shift"
            onAction={() => navigate("/shift/tambah")}
          />
        )}

        {!loading && !error && shiftList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {shiftList.map((shift) => (
              <div
                key={shift.id}
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
              >
                <div className="px-5 py-3 bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-between">
                  <h3 className="text-white font-semibold text-base tracking-wide">{shift.nama}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleShift(shift);
                    }}
                    title={shift.status === 1 ? "Nonaktifkan Shift" : "Aktifkan Shift"}
                    className={`transition ${shift.status === 1 ? "text-white hover:text-gray-200" : "text-gray-300 hover:text-white"
                      }`}
                  >
                    <FontAwesomeIcon icon={shift.status === 1 ? faToggleOn : faToggleOff} size="2xl" />
                  </button>
                </div>

                <div className="px-5 py-4 divide-y divide-gray-200">
                  {shift.detail.map((d, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 text-sm text-gray-700">
                      <span className="font-semibold text-gray-800 tracking-wide">{d.hari}</span>
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
