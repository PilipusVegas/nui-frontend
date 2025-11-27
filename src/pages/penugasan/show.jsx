import toast from "react-hot-toast";
import Swal from "sweetalert2";
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatFullDate, formatCustomDateTime } from "../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SectionHeader, Modal } from "../../components";
import { faTasks, faClock, faSpinner, faPause, faUserGroup, faPlay, faRotateRight, faCircle, faInfoCircle, faCheckCircle, faTimesCircle, faChevronDown, faChevronUp, faPlayCircle, } from "@fortawesome/free-solid-svg-icons";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

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
    const [openLogs, setOpenLogs] = useState(false);
    const [openLightbox, setOpenLightbox] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);

    const handleOpenLightbox = (imageUrl) => {
        setLightboxImages([{ src: imageUrl }]);
        setOpenLightbox(true);
    };

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

    const handleUpdateStatus = async () => {
        if (tugas.is_complete === 1) return;
        try {
            const url = `${apiUrl}/tugas/complete/${id}?completed=1`;
            const res = await fetchWithJwt(url);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            setTugas((prev) => ({ ...prev, is_complete: 1 }));
            toast.success("Penugasan berhasil diselesaikan.");
            navigate("/penugasan/riwayat");
        } catch (err) {
            console.error("Gagal memperbarui status:", err);
            toast.error("Gagal memperbarui status penugasan.");
        }
    };

    const handleTogglePause = async (detailId, isPaused) => {
        try {
            let confirmAction;

            if (!isPaused) {
                confirmAction = await Swal.fire({
                    title: "Pause tugas ini?",
                    text: "Saat tugas dipause, karyawan dapat melakukan absensi pulang sementara.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Pause Sekarang",
                    cancelButtonText: "Batal",
                });
            } else {
                confirmAction = await Swal.fire({
                    title: "Lanjutkan tugas?",
                    text: "Tugas akan dilanjutkan dan akses absensi pulang ditutup kembali.",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Lanjutkan",
                    cancelButtonText: "Batal",
                });
            }

            if (!confirmAction.isConfirmed) return;

            const url = `${apiUrl}/tugas/pause/${detailId}?paused=${isPaused ? 0 : 1}`;
            const res = await fetchWithJwt(url);

            if (!res.ok) throw new Error(`Status ${res.status}`);

            setTugas((prev) => ({
                ...prev,
                details: prev.details.map((w) =>
                    w.id === detailId
                        ? { ...w, is_paused: isPaused ? 0 : 1 }
                        : w
                ),
            }));

            if (isPaused) {
                toast.success("Tugas dilanjutkan kembali. Akses absensi pulang ditutup kembali.");
            } else {
                toast.success("Tugas berhasil dipause. Akses absensi pulang dibuka sementara.");
            }

        } catch (err) {
            console.error("Gagal toggle pause:", err);
            toast.error("Gagal memperbarui status tugas.");
        }
    };


    const handleApproval = async (detailId, status) => {
        try {
            let deskripsi = "";

            if (status === 2) {
                const { value: input } = await Swal.fire({
                    title: "Tolak tugas?",
                    text: "Tugas akan dikembalikan ke karyawan. Mohon berikan keterangan penolakan.",
                    input: "textarea",
                    inputPlaceholder: "Masukkan keterangan penolakan...",
                    inputAttributes: {
                        "aria-label": "Masukkan keterangan penolakan",
                    },
                    showCancelButton: true,
                    confirmButtonText: "Kirim Penolakan",
                    cancelButtonText: "Batal",
                    icon: "warning",
                });

                if (!input) return;
                deskripsi = input.trim();
            } else {
                const confirm = await Swal.fire({
                    title: "Setujui tugas?",
                    text: "Pastikan pekerjaan sudah benar sebelum disetujui.",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Ya, setujui",
                    cancelButtonText: "Batal",
                });
                if (!confirm.isConfirmed) return;
            }

            const url = `${apiUrl}/tugas/status/${detailId}`;
            const body = JSON.stringify({ status, deskripsi });

            const res = await fetchWithJwt(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
            });

            if (!res.ok) throw new Error(`Gagal update status (${res.status})`);

            // Update state
            setTugas((prev) => ({
                ...prev,
                details: prev.details.map((item) =>
                    item.id === detailId ? { ...item, status, deskripsi } : item
                ),
            }));

            if (selectedDetail && selectedDetail.id === detailId) {
                setSelectedDetail((prev) => ({ ...prev, status, deskripsi }));
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

    // Helper render status label
    function renderStatusLabel(item) {
        if (!item.finished_at) {
            return (
                <p className="text-xs sm:text-sm font-medium text-blue-600 flex items-center gap-1">
                    <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                    Sedang proses pengerjaan
                </p>
            );
        }
        switch (item.status) {
            case 0:
                return (
                    <p className="text-xs sm:text-sm font-medium text-yellow-600 flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
                        Menunggu persetujuan
                    </p>
                );
            case 1:
                return (
                    <p className="text-xs sm:text-sm font-medium text-green-600 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                        {`Selesai pada: ${formatFullDate(item.finished_at)}`}
                    </p>
                );
            case 2:
                return (
                    <p className="text-xs sm:text-sm font-medium text-red-600 flex items-center gap-1">
                        <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3" />
                        Ditolak — perlu revisi
                    </p>
                );
            case 3:
                return (
                    <p className="text-xs sm:text-sm font-medium text-orange-600 flex items-center gap-1">
                        <FontAwesomeIcon icon={faPause} className="w-3 h-3" />
                        Dipause
                    </p>
                );
            default:
                return null;
        }
    }

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
                {!loading && !error && !tugas && <EmptyState message="Data penugasan tidak ditemukan." />}

                {!loading && !error && tugas && (
                    <>
                        <div>
                            <div className="flex flex-col mb-4 border-b border-gray-200/50 pb-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-md font-bold text-green-600 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTasks} className="text-green-600" />
                                        INFORMASI PENUGASAN
                                    </h3>
                                    <div className="mt-2 sm:mt-0">
                                        {tugas.category ? (
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-[3px] rounded-full text-xs font-semibold border
                                                    ${tugas.category === "urgent"
                                                        ? "bg-red-100 text-red-700 border-red-200"
                                                        : tugas.category === "daily"
                                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                            : "bg-blue-100 text-blue-700 border-blue-200"
                                                    }`}
                                            >
                                                {tugas.category?.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm font-medium">Tanpa Kategori</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-5 px-0 sm:px-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5">
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 tracking-wide mb-1">TUGAS</p>
                                        <h3 className="text-md font-semibold text-gray-900 leading-snug tracking-tight break-words capitalize">
                                            {tugas.nama}
                                        </h3>
                                    </div>
                                </div>

                                {(() => {
                                    const progress =
                                        tugas.details && tugas.details.length > 0
                                            ? (tugas.details.filter((d) => d.status === 1).length /
                                                tugas.details.length) *
                                            100
                                            : 0;

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-sm text-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Mulai Penugasan</p>
                                                <p className="font-medium text-gray-800">
                                                    {formatFullDate(tugas.start_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Batas Waktu</p>
                                                <p className="font-medium text-gray-800">
                                                    {formatFullDate(tugas.deadline_at)}
                                                </p>
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
                                                        {tugas.details?.filter((d) => d.status === 1).length || 0} dari{" "}
                                                        {tugas.details?.length || 0} tugas diverifikasi
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="flex justify-end mt-4">
                                    <button disabled={tugas.is_complete || !canMarkComplete} onClick={handleUpdateStatus} className={`px-4 py-2 text-sm font-medium rounded-md transition-all 
                                        ${tugas.is_complete
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : canMarkComplete
                                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        {tugas.is_complete ? "Terselesaikan" : "Tandai Selesai"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <h3 className="text-md font-bold text-green-600 border-b border-gray-200 pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                                {/* TITLE */}
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUserGroup} />
                                    DAFTAR PEKERJA
                                </div>

                                {/* BADGE STATUS */}
                                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-semibold">
                                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-300">
                                        Total: {tugas.details?.length || 0}
                                    </span>
                                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 border border-green-300">
                                        Selesai: {tugas.details?.filter(d => d.status === 1).length || 0}
                                    </span>
                                    <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
                                        Pending: {tugas.details?.filter(d => d.status === 0).length || 0}
                                    </span>
                                    <span className="px-2 py-1 rounded bg-red-100 text-red-700 border border-red-300">
                                        Ditolak: {tugas.details?.filter(d => d.status === 2).length || 0}
                                    </span>
                                    <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 border border-orange-300">
                                        Pause: {tugas.details?.filter(d => d.is_paused === 1).length || 0}
                                    </span>
                                </div>
                            </h3>

                            {tugas.details?.length > 0 ? (
                                <div className="divide-y divide-gray-200 max-h-[50vh] overflow-y-auto scrollbar-green mt-2 px-2">
                                    {tugas.details.map((item, index) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 transition">
                                            <div className="flex items-start gap-3 w-full">
                                                <span className="text-sm text-gray-700 font-medium flex-shrink-0 text-right flex items-start mt-3">
                                                    {index + 1}.
                                                </span>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex flex-col">
                                                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                            {" "}
                                                            {item.nama_user}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1 cursor-pointer select-none" onClick={() => setOpenLogs(openLogs === item.id ? null : item.id)}>
                                                            {renderStatusLabel(item)}
                                                            <FontAwesomeIcon icon={openLogs === item.id ? faChevronUp : faChevronDown} className="text-gray-600 w-3 h-3 transition-transform duration-200" />
                                                        </div>
                                                    </div>

                                                    {openLogs === item.id && (
                                                        <div className="mt-4 relative max-h-[60vh] overflow-y-auto scrollbar-none">
                                                            {item.logs?.length > 0 ? (
                                                                <div className="relative">
                                                                    {item.logs.map((log, index) => {
                                                                        let icon, iconColor;
                                                                        switch (log.status) {
                                                                            case 0:
                                                                                icon = faClock;
                                                                                iconColor = "text-yellow-500";
                                                                                break;
                                                                            case 1:
                                                                                icon = faCheckCircle;
                                                                                iconColor = "text-green-500";
                                                                                break;
                                                                            case 2:
                                                                                icon = faTimesCircle;
                                                                                iconColor = "text-red-500";
                                                                                break;
                                                                            case 3:
                                                                                icon = faPause;
                                                                                iconColor = "text-orange-500";
                                                                                break;
                                                                            case 4:
                                                                                icon = faPlayCircle;
                                                                                iconColor = "text-blue-500";
                                                                                break;
                                                                            default:
                                                                                icon = faCircle;
                                                                                iconColor = "text-gray-400";
                                                                        }

                                                                        return (
                                                                            <div key={log.id} className="relative mb-10">
                                                                                <div className="absolute top-0">
                                                                                    <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200">
                                                                                        <FontAwesomeIcon icon={icon} className={`w-3 h-3 ${iconColor}`} />
                                                                                    </div>
                                                                                </div>

                                                                                <div className="ml-10 text-xs text-gray-700">
                                                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                                                                        <span className="text-gray-500 text-xs">
                                                                                            {formatCustomDateTime(log.created_at)}
                                                                                        </span>
                                                                                        <span className="font-semibold">
                                                                                            {log.judul || "-"}
                                                                                        </span>
                                                                                    </div>
                                                                                    {log.text && (
                                                                                        <p className="text-gray-600 mt-1 text-xs">{log.text}</p>
                                                                                    )}
                                                                                </div>

                                                                                {index !== item.logs.length - 1 && (
                                                                                    <div className="absolute left-2 top-8 w-px h-full bg-gray-300"></div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-gray-400">Tidak ada aktivitas.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-row flex-wrap items-center justify-end gap-2 mt-6 sm:mt-0 sm:flex-shrink-0">
                                                <button onClick={() => handleOpenDetail(item)} className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition" title="Lihat Detail Pekerjaan">
                                                    <FontAwesomeIcon icon={faInfoCircle} className="w-3.5 h-3.5" />
                                                    <span>Detail</span>
                                                </button>

                                                {tugas.category === "urgent" && (
                                                    <>
                                                        {item.status === 1 ? (
                                                            <button disabled className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs sm:text-sm font-medium bg-gray-400 text-white cursor-not-allowed" title="Pekerjaan Tuntas">
                                                                <FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5" />
                                                                <span>Tuntas</span>
                                                            </button>
                                                        ) : (
                                                            !tugas.is_complete && (
                                                                <button onClick={() => handleTogglePause(item.id, item.is_paused)}
                                                                    className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs sm:text-sm font-medium transition ${item.is_paused ? "bg-green-500 text-white hover:bg-green-600" : "bg-orange-500 text-white hover:bg-orange-600"}`}
                                                                    title={item.is_paused ? "Lanjutkan" : "Pause"}
                                                                >
                                                                    <FontAwesomeIcon icon={item.is_paused ? faPlay : faPause} className="w-3.5 h-3.5" />
                                                                    <span>{item.is_paused ? "Lanjut" : "Tunda"}</span>
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Detail Pekerjaan" note={selectedDetail ? selectedDetail.nama_user : ""} size="lg"
                footer={
                    selectedDetail?.finished_at &&
                    (selectedDetail.status === 0 ? (
                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <button onClick={() => handleApproval(selectedDetail.id, 1)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md">
                                Setujui
                            </button>

                            <button onClick={() => handleApproval(selectedDetail.id, 2)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md">
                                Tolak
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-center w-full">
                            {selectedDetail.status === 1 ? "Penugasan telah disetujui" : "Pengajuan telah ditolak"}
                        </p>
                    ))
                }
            >
                {selectedDetail ? (
                    <div className="text-gray-700 space-y-4 p-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <p className="text-[11px] uppercase font-semibold text-gray-500">Nama Karyawan</p>
                                <p className="text-[14px] font-semibold">{selectedDetail.nama_user}</p>
                            </div>

                            <div>
                                <p className="text-[11px] uppercase font-semibold text-gray-500">
                                    Waktu Penyelesaian
                                </p>
                                <p className="text-[14px]">
                                    {selectedDetail.finished_at ? formatFullDate(selectedDetail.finished_at) : "Belum selesai"}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        <div>
                            <h3 className="text-[12px] font-semibold text-gray-600 uppercase mb-1">Tugas</h3>
                            <div className="max-h-[220px] overflow-y-auto text-[13px] whitespace-pre-line">
                                {selectedDetail.deskripsi?.trim() ? selectedDetail.deskripsi : "Tidak ada deskripsi yang diberikan."}
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        <div>
                            <h3 className="text-[12px] font-semibold text-gray-600 uppercase mb-2">Bukti Foto</h3>

                            {selectedDetail?.submission?.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {selectedDetail.submission.map((sub) => (
                                        <img src={`${apiUrl}/uploads/img/tugas/${sub.bukti_foto}`} alt="Bukti" className="w-full h-24 object-cover rounded-md cursor-pointer" onClick={() => handleOpenLightbox(`${apiUrl}/uploads/img/tugas/${sub.bukti_foto}`)} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-[13px]">Tidak ada bukti foto.</p>
                            )}
                        </div>

                        <div className="border-t border-gray-200"></div>

                        <div>
                            <h3 className="text-[12px] font-semibold text-gray-600 uppercase mb-1">
                                Deskripsi Pengajuan
                            </h3>
                            <p className="text-[13px] whitespace-pre-line">
                                {selectedDetail.deskripsi_pengajuan?.trim()
                                    ? selectedDetail.deskripsi_pengajuan
                                    : "Tidak ada deskripsi pengajuan."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Tidak ada detail yang dipilih.</p>
                )}
            </Modal>

            <Lightbox open={openLightbox} close={() => setOpenLightbox(false)} slides={lightboxImages} plugins={[Captions]} />

        </div>
    );
};

export default DetailPenugasan;
