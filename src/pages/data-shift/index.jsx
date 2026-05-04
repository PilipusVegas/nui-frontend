import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faClock, faToggleOn, faToggleOff, faTrash, faSun, faCloudSun, faMoon} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, Button,} from "../../components";
import Swal from "sweetalert2";

const parseTimeToMinutes = (time) => {
  if (!time || typeof time !== "string") return null;

  const parts = time.split(":").map((v) => Number(v));
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return null;

  const [hour, minute] = parts;
  return hour * 60 + minute;
};

const getShiftPeriod = (time) => {
  const minutes = parseTimeToMinutes(time);

  if (minutes === null) {
    return {
      label: "Shift",
      icon: faClock,
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      panelClass: "from-slate-50 to-white",
    };
  }

  const pagiStart = 5 * 60; // 05:00
  const siangStart = 11 * 60; // 11:00
  const malamStart = 15 * 60; // 15:00

  if (minutes >= pagiStart && minutes < siangStart) {
    return {
      label: "Pagi",
      icon: faSun,
      badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
      panelClass: "from-amber-200 to-white",
    };
  }

  if (minutes >= siangStart && minutes < malamStart) {
    return {
      label: "Siang",
      icon: faCloudSun,
      badgeClass: "bg-sky-100 text-sky-700 border-sky-200",
      panelClass: "from-sky-200 to-white",
    };
  }

  return {
    label: "Malam",
    icon: faMoon,
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
    panelClass: "from-indigo-200 to-white",
  };
};

const getFirstShiftTime = (detail = []) => {
  if (!Array.isArray(detail) || detail.length === 0) return null;
  return detail[0]?.jam_masuk ?? null;
};

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
        detail: Array.isArray(item.detail) ? item.detail : [],
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

    const confirm = await Swal.fire({
      title: isActive ? "Nonaktifkan Shift?" : "Aktifkan Shift?",
      html: `
        <div style="text-align:left">
          <p>
            Anda akan <b>${isActive ? "menonaktifkan" : "mengaktifkan kembali"}</b>
            <b> ${shift.nama}</b>.
          </p>
          <p style="margin-top:8px">
            ${
              isActive
                ? "Shift ini tidak akan digunakan sementara pada penjadwalan karyawan."
                : "Shift ini akan kembali tersedia dan dapat digunakan pada penjadwalan karyawan."
            }
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isActive
        ? "Ya, Nonaktifkan Shift"
        : "Ya, Aktifkan Shift",
      cancelButtonText: "Batal",
      confirmButtonColor: isActive ? "#dc2626" : "#16a34a",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
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

      await Swal.fire({
        icon: "success",
        title: isActive
          ? "Shift Berhasil Dinonaktifkan"
          : "Shift Berhasil Diaktifkan",
        html: `
          <div style="text-align:left">
            <p>
              <b>${shift.nama}</b> berhasil <b>${isActive ? "dinonaktifkan" : "diaktifkan kembali"}</b>.
            </p>
            <p style="margin-top:8px">
              ${
                isActive
                  ? "Shift ini tidak lagi muncul di menu penjadwalan karyawan."
                  : "Shift ini sekarang sudah tersedia kembali untuk digunakan."
              }
            </p>
          </div>
        `,
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#16a34a",
      });

      fetchShift();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: err.message || "Terjadi kesalahan saat memperbarui status shift.",
      });
    }
  };

  const handleDeleteShift = async (shift) => {
    const confirm = await Swal.fire({
      title: "Hapus Shift?",
      html: `
        <div style="text-align:left">
          <p>
            Shift <b>${shift.nama}</b> akan <b>dihapus permanen</b>.
          </p>
          <p style="margin-top:8px;color:#dc2626">
            Data ini tidak dapat dikembalikan.
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchWithJwt(`${apiUrl}/shift/${shift.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus shift");

      await Swal.fire({
        icon: "success",
        title: "Shift Dihapus",
        text: `Shift ${shift.nama} berhasil dihapus.`,
        confirmButtonColor: "#16a34a",
      });

      fetchShift();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: err.message || "Gagal menghapus shift.",
      });
    }
  };

  return (
    <div>
      <SectionHeader
        title="Data Shift"
        subtitle="Daftar jadwal shift karyawan yang tersusun rapi dan mudah dipantau."
        onBack={() => navigate(-1)}
        actions={
          <Button
            variant="primary"
            icon={faPlus}
            onClick={() => navigate("/shift/tambah")}
          >
            Tambah Shift
          </Button>
        }
      />

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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5 items-stretch">
            {shiftList.map((shift) => {
              const firstTime = getFirstShiftTime(shift.detail);
              const period = getShiftPeriod(firstTime);
              const isActive = shift.status === 1;

              return (
                <div
                  key={shift.id}
                  className={`group flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm shadow-gray-400 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    isActive ? "border-emerald-100" : "border-slate-200 opacity-95"
                  }`}
                >
                  <div className={`relative overflow-hidden bg-gradient-to-r ${period.panelClass} border-b border-slate-100 px-4 sm:px-5 py-3`}>
                    <div className="flex items-start justify-between gap-2">
                      {/* LEFT BADGES */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${period.badgeClass}`}>
                          <FontAwesomeIcon icon={period.icon} />
                          {period.label}
                        </span>

                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>

                      {/* RIGHT ACTIONS (ALWAYS TOP - FIXED) */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleShift(shift);
                          }}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 ${
                            isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          <FontAwesomeIcon icon={isActive ? faToggleOn : faToggleOff} size="lg"/>
                        </button>

                        <button onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShift(shift);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition active:scale-90"
                        >
                          <FontAwesomeIcon icon={faTrash} size="md" />
                        </button>
                      </div>
                    </div>

                    {/* TITLE ROW */}
                    <div>
                      <h3
                        className="text-md sm:text-lg font-bold leading-snug break-words"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={shift.nama}
                      >
                        {shift.nama}
                      </h3>
                    </div>
                  </div>

                  <div className="flex-1 px-5">
                    {shift.detail.length > 0 ? (
                      <div className="divide-y divide-slate-200">
                        {shift.detail.map((d, idx) => {
                          const rowPeriod = getShiftPeriod(d.jam_masuk);

                          return (
                            <div key={idx} className="flex justify-between sm:flex-row sm:items-center sm:justify-between py-2.5 gap-2">
                              {/* LEFT SIDE */}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                  {d.hari}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Jadwal kerja harian
                                </p>
                              </div>

                              {/* RIGHT SIDE */}
                              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${rowPeriod.badgeClass}`}>
                                  <FontAwesomeIcon icon={rowPeriod.icon} />
                                  {rowPeriod.label}
                                </span> 
                                <span className="rounded-full px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                                  {d.jam_masuk} - {d.jam_pulang}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-[120px] items-center justify-center px-4 text-center">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Detail shift belum tersedia
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Tambahkan jadwal hari dan jam untuk shift ini.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JadwalShift;
