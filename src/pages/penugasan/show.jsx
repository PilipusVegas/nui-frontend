import toast from "react-hot-toast";
import Swal from "sweetalert2";
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatFullDate, formatISODate } from "../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SectionHeader } from "../../components";
import { faTasks, faTag, faCamera, faCheck, faTimes, faPause, faUserGroup, faPlay, faRotateRight, faPen } from "@fortawesome/free-solid-svg-icons";

const DetailPenugasan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [tugas, setTugas] = useState({ details: [] });
    const [loading, setLoading] = useState(true);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const allApproved = tugas?.details?.every((d) => d.status === 1) ?? false;
    const allFinished = tugas?.details?.every((d) => d.finished_at !== null) ?? false;
    const canMarkComplete = allApproved && allFinished;

    const fetchTugas = async () => {
        try {
            setLoading(true);
            const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`);
            if (!res.ok) throw new Error(`Gagal mengambil data tugas. Status: ${res.status}`);
            const data = await res.json();
            setTugas(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTugas();
    }, [id, apiUrl]);

    /** === Handle Tandai Selesai === */
    const handleUpdateStatus = async () => {
        if (tugas.is_complete === 1) return;

        try {
            const url = `${apiUrl}/tugas/complete/${id}?completed=1`;
            const res = await fetchWithJwt(url);

            if (!res.ok) throw new Error(`Status ${res.status}`);

            toast.success("Penugasan berhasil diselesaikan.");
            setTugas((prev) => ({ ...prev, is_complete: 1 }));
        } catch (err) {
            console.error("Gagal memperbarui status:", err);
            toast.error("Gagal memperbarui status penugasan.");
        }
    };

    /** === Handle Pause / Resume === */
    const handleTogglePause = async (detailId, isPaused) => {
        try {
            const url = `${apiUrl}/tugas/pause/${detailId}?paused=${isPaused ? 0 : 1}`;
            const res = await fetchWithJwt(url);

            if (!res.ok) throw new Error(`Status ${res.status}`);

            setTugas((prev) => ({
                ...prev,
                details: prev.details.map((w) =>
                    w.id === detailId
                        ? {
                            ...w,
                            is_paused: isPaused ? 0 : 1,
                        }
                        : w
                ),
            }));

            if (isPaused) {
                toast.success("Tugas dilanjutkan kembali. Akses absensi pulang ditutup sampai tugas selesai.");
            } else {
                toast.success("Tugas dipause. Akses absensi pulang dibuka sementara.");
            }

        } catch (err) {
            console.error("Gagal toggle pause:", err);
            toast.error("Gagal memperbarui status tugas.");
        }
    };

    /** === Handle Lihat Foto === */
    const handleViewPhoto = (photoName) => {
        if (!photoName) return toast.error("Tidak ada foto tersedia.");
        window.open(`${apiUrl}/uploads/tugas/${photoName}`, "_blank");
    };

    /** === Handle Approval === */
    const handleApproval = async (detailId, status) => {
        try {
            const confirm = await Swal.fire({
                title: status === 1 ? "Setujui tugas?" : "Tolak tugas?",
                text: status === 1
                    ? "Pastikan pekerjaan ini sudah selesai dengan benar dan telah diperiksa sebelum menyetujui."
                    : "Tugas akan dikembalikan ke karyawan untuk diperbaiki dan dikirim ulang. Pastikan sudah konfirmasi ke karyawan sebelum menolak.",
                icon: status === 1 ? "question" : "warning",
                showCancelButton: true,
                confirmButtonText: status === 1 ? "Ya, setujui" : "Ya, tolak",
                cancelButtonText: "Batal",
                iconColor: status === 1 ? "#22C55E" : "#dc2626",
            });

            if (!confirm.isConfirmed) return;

            // Update status lokal
            const updatedDetails = tugas.details.map((w) =>
                w.id === detailId ? { ...w, status } : w
            );

            const payload = {
                nama: tugas.nama,
                start_date: formatISODate(tugas.start_date),
                deadline_at: formatISODate(tugas.deadline_at),
                category: tugas.category,
                is_complete: tugas.is_complete,
                worker_list: updatedDetails,
            };

            const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Status ${res.status}`);

            setTugas((prev) => ({ ...prev, details: updatedDetails }));
            toast.success(`Tugas berhasil ${status === 1 ? "disetujui" : "ditolak"}.`);

        } catch (err) {
            console.error("Gagal mengubah status:", err);
            toast.error("Gagal mengubah status pekerja.");
        }
    };

    const handleRefresh = async () => {
        toast.loading("Menyegarkan data...", { id: "refresh" });
        await fetchTugas();
        toast.success("Data berhasil diperbarui!", { id: "refresh" });
    };

    return (
        <div>
            <SectionHeader title="Detail Penugasan" subtitle="Informasi lengkap penugasan dan pekerja terkait" onBack={() => navigate("/penugasan")}
                actions={
                    <div>
                        <button onClick={handleRefresh} className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-blue-300 bg-blue-500 text-white hover:bg-blue-600 hover:shadow-sm transition-all" title="Segarkan Data">
                            <FontAwesomeIcon icon={faRotateRight} className="w-4 h-4" />
                            <span className="hidden sm:inline">Segarkan</span>
                        </button>
                    </div>
                }
            />

            <main className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-5 px-6 w-full transition-all duration-300 space-y-4">
                {loading && <LoadingSpinner message="Memuat data detail penugasan..." />}
                {!loading && error && <ErrorState message={error} />}
                {!loading && !error && !tugas && (
                    <EmptyState message="Data penugasan tidak ditemukan." />
                )}

                {!loading && !error && tugas && (
                    <>
                        <div>
                            <div className="flex flex-col mb-4 border-b border-gray-200 pb-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTasks} className="text-green-600" />
                                        Informasi Penugasan
                                    </h3>
                                    <div className="mt-2 sm:mt-0">
                                        {tugas.category ? (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-[3px] rounded-full text-xs font-semibold border
                    ${tugas.category === "urgent" ? "bg-red-100 text-red-700 border-red-200"
                                                    : tugas.category === "daily" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                        : "bg-blue-100 text-blue-700 border-blue-200"}`}
                                            >
                                                <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5" />
                                                {tugas.category?.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm font-medium">
                                                Tanpa Kategori
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Subjudul / Penjelasan */}
                                <p className="mt-1 text-sm text-gray-600">
                                    Detail penugasan ini mencakup kategori, tanggal mulai, batas waktu, dan daftar pekerja yang terlibat.
                                    Pastikan semua informasi diperiksa dengan cermat sebelum melakukan tindakan lebih lanjut.
                                </p>
                            </div>


                            <div className="mb-5">
                                {/* Header Nama Penugasan */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 mb-5">
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 tracking-wide mb-1">
                                            Nama Penugasan
                                        </p>
                                        <h3 className="text-md font-semibold text-gray-900 leading-snug tracking-tight break-words">
                                            {tugas.nama}
                                        </h3>
                                    </div>
                                </div>

                                {/* Detail Info */}
                                {(() => {
                                    const progress = tugas.details && tugas.details.length > 0
                                        ? (tugas.details.filter((d) => d.status === 1).length / tugas.details.length) * 100
                                        : 0;

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-sm text-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Mulai Penugasan</p>
                                                <p className="font-medium text-gray-800">{formatFullDate(tugas.start_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Batas Waktu</p>
                                                <p className="font-medium text-gray-800">{formatFullDate(tugas.deadline_at)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Status</p>
                                                <p className={`font-semibold ${tugas.is_complete ? "text-emerald-700" : "text-amber-700"}`}>
                                                    {tugas.is_complete ? "Selesai" : "Belum Selesai"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase mb-0.5">Progress Disetujui</p>
                                                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="absolute top-0 left-0 h-2 rounded-full transition-all duration-500 bg-emerald-500"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-[11px] text-gray-500 mt-1">{progress.toFixed(0)}%</p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Tombol Aksi di kanan */}
                                <div className="flex justify-end mt-4">
                                    <button disabled={tugas.is_complete || !canMarkComplete} onClick={handleUpdateStatus} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all 
                                        ${tugas.is_complete ? "bg-gray-300 text-gray-500 cursor-not-allowed" : canMarkComplete ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                                    >
                                        {tugas.is_complete ? "Terselesaikan" : "Tandai Selesai"}
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* === Daftar Pekerja === */}
                        <div className="mt-5">
                            <h3 className="text-lg font-bold text-green-600 flex items-center justify-between border-b border-gray-200 pb-2">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUserGroup} />
                                    Daftar Pekerjaan ({tugas.details?.length || 0})
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/penugasan/edit/${id}`)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-3 py-1.5 rounded text-sm flex items-center gap-2 shadow transition-all hover:scale-105"
                                >
                                    <FontAwesomeIcon icon={faPen} />
                                    Ubah Pekerja
                                </button>
                            </h3>

                            {tugas.details?.length > 0 ? (
                                <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto scrollbar-green mt-2 px-2">
                                    {tugas.details.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex flex-1 items-start sm:items-center gap-3 w-full">
                                                <span className="text-sm text-gray-400 font-medium w-5 flex-shrink-0 text-right mt-1 sm:mt-0">
                                                    {index + 1}.
                                                </span>

                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                        {item.nama_user}
                                                    </p>
                                                    <p className="text-xs text-gray-500 italic truncate">
                                                        {item.finished_at
                                                            ? `Selesai pada: ${formatFullDate(item.finished_at)}`
                                                            : "Sedang proses pengerjaan"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Tombol aksi */}
                                            <div className="flex flex-wrap justify-end gap-2 mt-2 sm:mt-0 sm:flex-shrink-0">
                                                {item.bukti_foto && (
                                                    <button
                                                        onClick={() => handleViewPhoto(item.bukti_foto)}
                                                        className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-md text-sm"
                                                        title="Bukti Foto"
                                                    >
                                                        <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Bukti</span>
                                                    </button>
                                                )}

                                                {item.bukti_foto && item.status === 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproval(item.id, 1)}
                                                            className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white hover:bg-blue-700 rounded-md text-sm"
                                                            title="Setujui"
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Setujui</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleApproval(item.id, 2)}
                                                            className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white hover:bg-red-700 rounded-md text-sm"
                                                            title="Tolak"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                                            <span className="hidden sm:inline">Tolak</span>
                                                        </button>
                                                    </>
                                                )}

                                                {tugas.category === "urgent" && !tugas.is_complete && item.status !== 1 && (
                                                    <button
                                                        onClick={() => handleTogglePause(item.id, item.is_paused)}
                                                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${item.is_paused
                                                            ? "bg-green-500 text-white hover:bg-green-600"
                                                            : "bg-orange-500 text-white hover:bg-orange-600"
                                                            }`}
                                                        title={item.is_paused ? "Lanjutkan" : "Pause"}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={item.is_paused ? faPlay : faPause}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="hidden sm:inline">{item.is_paused ? "Lanjut" : "Pause"}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="Belum ada pekerja terdaftar untuk tugas ini." />
                            )}
                        </div>

                    </>
                )}
            </main>
        </div>
    );
};

export default DetailPenugasan;