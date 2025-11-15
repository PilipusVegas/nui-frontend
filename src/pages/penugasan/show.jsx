import toast from "react-hot-toast";
import Swal from "sweetalert2";
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatFullDate, formatISODate } from "../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SectionHeader, Modal } from "../../components";
import { faTasks, faTag, faCamera, faCheck, faTimes, faPause, faUserGroup, faPlay, faRotateRight, faPen, faInfoCircle, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-solid-svg-icons/faClock";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";

const DetailPenugasan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [tugas, setTugas] = useState({ details: [] });
    const [loading, setLoading] = useState(true);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

            setTugas((prev) => ({ ...prev, is_complete: 1 }));
            toast.success("Penugasan berhasil diselesaikan.");

            // === 🌿 Swal versi lebih profesional & informatif ===
            await Swal.fire({
                title: "Penugasan Telah Diselesaikan",
                text: "Semua pekerjaan dalam penugasan ini telah diverifikasi dan selesai dengan baik. Anda dapat melihat detailnya di halaman riwayat penugasan.",
                icon: "success",
                confirmButtonText: "Lihat Riwayat",
                confirmButtonColor: "#16A34A", // hijau khas
                background: "#f9fafb",
                color: "#111827",
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                    popup: "rounded-xl shadow-lg",
                    confirmButton: "px-4 py-2 text-sm font-medium rounded-md",
                },
            });

            // Arahkan ke halaman riwayat penugasan
            navigate("/penugasan/riwayat");

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
        window.open(`${apiUrl}/uploads/img/tugas/${photoName}`, "_blank");
    };

    /** === Handle Approval === */
    const handleApproval = async (detailId, status) => {
        try {
            const confirm = await Swal.fire({
                title: status === 1 ? "Setujui tugas?" : "Tolak tugas?",
                text: status === 1 ? "Pastikan pekerjaan sudah benar sebelum disetujui." : "Tugas akan dikembalikan ke karyawan untuk diperbaiki.",
                icon: status === 1 ? "question" : "warning",
                showCancelButton: true,
                confirmButtonText: status === 1 ? "Ya, setujui" : "Ya, tolak",
                cancelButtonText: "Batal",
                iconColor: status === 1 ? "#22C55E" : "#dc2626",
            });

            if (!confirm.isConfirmed) return;

            const url = `${apiUrl}/tugas/status/${detailId}?status=${status}`;
            const res = await fetchWithJwt(url, { method: "GET" });

            if (!res.ok) throw new Error(`Gagal update status (${res.status})`);

            setTugas((prev) => ({
                ...prev,
                details: prev.details.map((item) =>
                    item.id === detailId ? { ...item, status } : item
                ),
            }));

            if (selectedDetail && selectedDetail.id === detailId) {
                setSelectedDetail((prev) => ({ ...prev, status }));
            }

            toast.success(`Tugas berhasil ${status === 1 ? "disetujui" : "ditolak"}.`);
        } catch (err) {
            console.error("Gagal memperbarui status tugas:", err);
            toast.error("Gagal memperbarui status tugas.");
        }
    };


    const handleRefresh = async () => {
        toast.loading("Menyegarkan data...", { id: "refresh" });
        try {
            await fetchTugas();
            toast.success("Data berhasil diperbarui!", { id: "refresh" });
        } catch (err) {
            console.error("Refresh gagal:", err);
            toast.error("Gagal memperbarui data!", { id: "refresh" });
        }
    };


    const handleOpenDetail = (detail) => {
        setSelectedDetail(detail);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedDetail(null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <SectionHeader title="Detail Penugasan" subtitle="Informasi lengkap penugasan dan pekerja terkait" onBack={() => navigate(-1)}
                actions={
                    <div>
                        <button onClick={handleRefresh} className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-blue-300 bg-blue-500 text-white hover:bg-blue-600 hover:shadow-sm transition-all" title="Segarkan Data">
                            <FontAwesomeIcon icon={faRotateRight} className="w-4 h-4" />
                            <span className="hidden sm:inline">Segarkan</span>
                        </button>
                    </div>
                }
            />

            <main className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-3 px-6 w-full transition-all duration-300 space-y-4">
                {loading && <LoadingSpinner message="Memuat data detail penugasan..." />}
                {!loading && error && <ErrorState message={error} />}
                {!loading && !error && !tugas && (
                    <EmptyState message="Data penugasan tidak ditemukan." />
                )}

                {!loading && !error && tugas && (
                    <>
                        <div>
                            <div className="flex flex-col mb-4 border-b border-gray-200/50 pb-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTasks} className="text-green-600" />
                                        Informasi Penugasan
                                    </h3>
                                    <div className="mt-2 sm:mt-0">
                                        {tugas.category ? (
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-[3px] rounded-full text-xs font-semibold border
                                                    ${tugas.category === "urgent" ? "bg-red-100 text-red-700 border-red-200" : tugas.category === "daily" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}
                                            >
                                                {tugas.category?.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm font-medium">
                                                Tanpa Kategori
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-5 px-0 sm:px-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5">
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 tracking-wide mb-1">
                                            Judul Penugasan
                                        </p>
                                        <h3 className="text-md font-semibold text-gray-900 leading-snug tracking-tight break-words capitalize">
                                            {tugas.nama}
                                        </h3>
                                    </div>
                                </div>

                                {/* Detail Info */}
                                {(() => {
                                    const progress = tugas.details && tugas.details.length > 0 ? (tugas.details.filter((d) => d.status === 1).length / tugas.details.length) * 100 : 0;

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
                                                <p className="text-xs text-gray-500 uppercase mb-1">Tugas Diverifikasi</p>
                                                <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="absolute top-0 left-0 h-2 rounded-full transition-all duration-500 bg-emerald-500" style={{ width: `${progress}%` }}></div>
                                                </div>
                                                <div className="flex items-center justify-between mt-1 tracking-wide">
                                                    <p className="text-[11px] text-gray-500">{progress.toFixed(0)}%</p>
                                                    <p className="text-[11px] text-gray-500 italic">
                                                        {tugas.details?.filter(d => d.status === 1).length || 0} dari {tugas.details?.length || 0} tugas diverifikasi
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Tombol Aksi di kanan */}
                                <div className="flex justify-end mt-4">
                                    <button disabled={tugas.is_complete || !canMarkComplete} onClick={handleUpdateStatus} className={`px-4 py-2 text-sm font-medium rounded-md transition-all 
                                        ${tugas.is_complete ? "bg-gray-300 text-gray-500 cursor-not-allowed" : canMarkComplete ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                                    >
                                        {tugas.is_complete ? "Terselesaikan" : "Tandai Selesai"}
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* === Daftar Pekerja === */}
                        <div className="mt-5">
                            <h3 className="text-md font-bold text-green-600 flex items-center justify-between border-b border-gray-200 pb-2">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUserGroup} />
                                    Daftar {tugas.details?.length || 0} Pekerjaan
                                </div>
                            </h3>

                            {tugas.details?.length > 0 ? (
                                <div className="divide-y divide-gray-200 max-h-[50vh] overflow-y-auto scrollbar-green mt-2 px-2">
                                    {tugas.details.map((item, index) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 hover:bg-gray-50 transition">
                                            <div className="flex flex-1 items-start sm:items-center gap-3 w-full">
                                                <span className="text-sm text-gray-400 font-medium w-5 flex-shrink-0 text-right mt-1 sm:mt-0">
                                                    {index + 1}.
                                                </span>

                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                        {item.nama_user}
                                                    </p>

                                                    {/* Status pekerjaan */}
                                                    {!item.finished_at ? (
                                                        <p className="text-xs sm:text-sm font-medium text-blue-600 flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                                                            Sedang proses pengerjaan
                                                        </p>
                                                    ) : item.status === 0 ? (
                                                        <p className="text-xs sm:text-sm font-medium text-yellow-600 flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                                                            Menunggu persetujuan
                                                        </p>
                                                    ) : item.status === 1 ? (
                                                        <p className="text-xs sm:text-sm font-medium text-green-600 flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                                                            {`Selesai pada: ${formatFullDate(item.finished_at)}`}
                                                        </p>
                                                    ) : item.status === 2 ? (
                                                        <p className="text-xs sm:text-sm font-medium text-red-600 flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3" />
                                                            Ditolak — perlu revisi
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="flex flex-row flex-wrap items-center justify-end gap-2 mt-2 sm:mt-0 sm:gap-3 sm:flex-shrink-0">
                                                <button onClick={() => handleOpenDetail(item)} className="flex items-center justify-center gap-2 w-24 px-3 py-2 rounded-md text-sm font-medium tracking-wide bg-blue-500 text-white hover:bg-blue-600 transition" title="Lihat Detail Pekerjaan">
                                                    <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4" />
                                                    <span>Detail</span>
                                                </button>

                                                {tugas.category === "urgent" && (
                                                    <>
                                                        {item.status === 1 ? (
                                                            <button disabled className="flex items-center justify-center gap-2 w-24 px-3 py-2 rounded-md text-sm font-medium tracking-wide bg-gray-400 text-white cursor-not-allowed" title="Pekerjaan Tuntas">
                                                                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                                                                <span>Tuntas</span>
                                                            </button>
                                                        ) : (
                                                            !tugas.is_complete && (
                                                                <button onClick={() => handleTogglePause(item.id, item.is_paused)} className={`flex items-center justify-center gap-2 w-24 px-3 py-2 rounded-md text-sm font-medium tracking-wide transition ${item.is_paused ? "bg-green-500 text-white hover:bg-green-600" : "bg-orange-500 text-white hover:bg-orange-600"}`} title={item.is_paused ? "Lanjutkan" : "Pause"}>
                                                                    <FontAwesomeIcon icon={item.is_paused ? faPlay : faPause} className="w-4 h-4" />
                                                                    <span>
                                                                        {item.is_paused ? "Lanjut" : "Tunda"}
                                                                    </span>
                                                                </button>
                                                            )
                                                        )}
                                                    </>
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

            {/* === Modal Detail Pekerja === */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Detail Pekerjaan" note={selectedDetail ? selectedDetail.nama_user : ""} size="lg">
                {selectedDetail ? (
                    <div className="space-y-5 text-gray-700">
                        {/* === Informasi Utama === */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                                <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                                    Nama Karyawan
                                </p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                    {selectedDetail.nama_user}
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                                <p className="text-[11px] font-medium text-gray-500 uppercase mb-1">
                                    Waktu Penyelesaian
                                </p>
                                <p className="font-medium text-sm sm:text-base text-gray-800">
                                    {selectedDetail.finished_at
                                        ? formatFullDate(selectedDetail.finished_at)
                                        : "Belum selesai"}
                                </p>
                            </div>
                        </div>

                        {/* === Deskripsi Tugas === */}
                        <div>
                            <p className="text-[11px] font-medium text-gray-500 uppercase mb-1.5">
                                Deskripsi Tugas
                            </p>
                            <div className="p-4 rounded-lg bg-white border border-gray-200 text-sm text-gray-800 leading-relaxed max-h-[250px] overflow-y-auto shadow-sm">
                                {selectedDetail.deskripsi?.trim()
                                    ? selectedDetail.deskripsi
                                    : "Tidak ada deskripsi yang diberikan."}
                            </div>
                        </div>

                        {/* === Bukti Foto === */}
                        <div>
                            <p className="text-[11px] font-medium text-gray-500 uppercase mb-1.5">
                                Bukti Foto Penyelesaian
                            </p>
                            {selectedDetail.bukti_foto ? (
                                <div className="flex justify-center">
                                    <img
                                        src={`${apiUrl}/uploads/img/tugas/${selectedDetail.bukti_foto}`}
                                        alt="Bukti pekerjaan"
                                        className="rounded-lg shadow-md border border-gray-200 w-full max-w-sm sm:max-w-xs object-cover transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
                                        onClick={() => handleViewPhoto(selectedDetail.bukti_foto)}
                                    />
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm italic">
                                    Tidak ada bukti foto tersedia.
                                </p>
                            )}
                        </div>

                        {/* === Status / Aksi === */}
                        {selectedDetail.finished_at && (
                            <div className="pt-3 border-t border-gray-100">
                                {selectedDetail.status === 0 ? (
                                    <div className="flex flex-col sm:flex-row justify-end sm:gap-3 gap-2">
                                        <button
                                            onClick={() =>
                                                handleApproval(selectedDetail.id, 1)
                                            }
                                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm w-full sm:w-auto"
                                        >
                                            <FontAwesomeIcon icon={faCheck} />
                                            <span>Setujui</span>
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleApproval(selectedDetail.id, 2)
                                            }
                                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm w-full sm:w-auto"
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                            <span>Tolak</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center bg-gray-50 text-gray-700 font-medium rounded-md py-2 mt-2 text-sm border border-gray-200 shadow-inner">
                                        <FontAwesomeIcon
                                            icon={
                                                selectedDetail.status === 1
                                                    ? faCheckCircle
                                                    : faTimesCircle
                                            }
                                            className={`w-4 h-4 mr-2 ${selectedDetail.status === 1
                                                ? "text-green-600"
                                                : "text-red-500"
                                                }`}
                                        />
                                        {selectedDetail.status === 1
                                            ? "Penugasan telah disetujui dan diverifikasi"
                                            : "Penugasan telah ditolak dan tugas dikembalikan ke karyawan"}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">Tidak ada detail yang dipilih.</p>
                )}
            </Modal>




        </div>
    );
};

export default DetailPenugasan;