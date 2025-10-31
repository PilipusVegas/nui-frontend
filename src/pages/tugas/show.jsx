import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCircleCheck, faChevronUp, faCalendarAlt, faUserTie, faChevronRight, faTrash, faClipboardList, faPauseCircle, faCircleXmark, faHammer, faClock, faHourglassHalf, faCircleCheck, faUser } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import MobileLayout from "../../layouts/mobileLayout";
import { LoadingSpinner, ErrorState, EmptyState, FooterMainBar, } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate, formatLongDate } from "../../utils/dateUtils";
import Webcam from "react-webcam";


const DetailTugasMobile = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const webcamRef = useRef(null);
    const [facingMode, setFacingMode] = useState("environment");
    const [isOpen, setIsOpen] = useState(true);
    const toggleOpen = () => setIsOpen(prev => !prev);
    const capturePhoto = () => {
        if (!webcamRef.current) return;
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) setPhoto(screenshot);
    };

    const switchCamera = () => {
        setFacingMode(prev => (prev === "user" ? "environment" : "user"));
    };

    const loadTaskDetail = () => {
        setLoading(true);
        setError(false);
        fetchWithJwt(`${apiUrl}/tugas/user/${id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Gagal memuat detail tugas");
                return res.json();
            })
            .then((data) => {
                if (data.success) setTask(data.data);
                else toast.error(data.message || "Data tugas tidak ditemukan 😞");
            })
            .catch(() => {
                setError(true);
                toast.error("Gagal memuat data tugas");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadTaskDetail();
    }, [id]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!photo) return toast.error("Silakan ambil atau pilih foto terlebih dahulu 📸");

        const formData = new FormData();
        const blob = await (await fetch(photo)).blob();
        formData.append("foto", blob, "bukti.jpg");
        const method = task?.status_tugas === 2 ? "PUT" : "POST";
        setUploading(true);
        try {
            const response = await fetchWithJwt(`${apiUrl}/tugas/user/${id}`, {
                method,
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                toast.success(
                    method === "PUT"
                        ? "Bukti foto berhasil diubah"
                        : "Bukti foto berhasil diunggah"
                );
                setIsCameraOpen(false);
                setPhoto(null);
                loadTaskDetail();
            } else {
                toast.error(result.message || "Gagal mengunggah foto ❌");
            }
        } catch {
            toast.error("Terjadi kesalahan saat mengunggah foto");
        } finally {
            setUploading(false);
        }
    };

    return (
        <MobileLayout title="Detail Tugas">
            <div className="mb-24">
                {loading ? (
                    <LoadingSpinner message="Memuat detail tugas..." />
                ) : error ? (
                    <ErrorState message="Gagal memuat detail tugas" detail="Terjadi masalah koneksi atau data tidak tersedia." onRetry={loadTaskDetail} retryText="Coba Lagi" />
                ) : !task ? (
                    <EmptyState title="Data Tidak Ditemukan" description="Tugas ini tidak tersedia atau sudah dihapus." />
                ) : (
                    <>
                        {/* === KARTU INFORMASI TUGAS === */}
                        <div className={`relative w-full rounded-xl border bg-white shadow-sm mb-4 p-4 transition-all duration-300
                            ${task.status_tugas === 2 ? "border-red-400" : ""}
                            ${task.category === "urgent" && task.is_paused === 1 ? "border-amber-400" : ""}
                            ${task.finished_at && task.status_tugas !== 2 ? "border-gray-300 opacity-85" : ""}
                            ${!task.finished_at && task.status_tugas === null ? "border-blue-400" : ""}
                        `}
                        >
                            {/* === HEADER === */}
                            <div className="flex justify-between items-start mb-3">
                                <h1 className={`text-sm font-semibold leading-tight tracking-wide ${task.status_tugas === 2 ? "text-red-700" : "text-gray-900"}`}>
                                    {task.nama_tugas}
                                </h1>
                                <span
                                    className={`px-2 py-[2px] rounded-full text-white text-[10px] font-semibold shadow-sm ${task.category === "urgent"
                                        ? "bg-red-600"
                                        : task.category === "daily"
                                            ? "bg-emerald-600"
                                            : "bg-gray-500"
                                        }`}
                                >
                                    {task.category?.toUpperCase()}
                                </span>
                            </div>

                            {/* === INFORMASI PENGGUNA === */}
                            <div className="text-[10px] text-gray-700 space-y-1 mb-3">
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faUser} className="text-gray-400 text-[10px]" />
                                    <span className="font-medium">Nama Pengguna:</span>
                                    <span className="text-gray-800">{task.nama_user}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faUserTie} className="text-gray-400 text-[10px]" />
                                    <span className="font-medium">Kadiv:</span>
                                    <span className="text-gray-800">{task.nama_kadiv}</span>
                                </div>
                            </div>

                            {/* === TENGGAT WAKTU & PERIODE === */}
                            <div className="text-[10px] text-gray-700 space-y-1 mb-3">
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-[10px]" />
                                    <span className="font-medium">Tanggal Dibuat:</span>
                                    <span className="text-gray-800">{formatFullDate(task.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faClock} className="text-gray-400 text-[10px]" />
                                    <span className="font-medium">Tanggal Mulai:</span>
                                    <span className="text-gray-800">{formatFullDate(task.start_date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faHourglassHalf} className="text-gray-400 text-[10px]" />
                                    <span className="font-medium">Tenggat Waktu:</span>
                                    <span
                                        className={`font-semibold ${task.category === "urgent" ? "text-red-700" : "text-gray-800"
                                            }`}
                                    >
                                        {formatFullDate(task.deadline_at)}
                                    </span>
                                </div>
                            </div>

                            {/* === DESKRIPSI === */}
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <p className="text-[10px] leading-relaxed text-gray-700 text-justify break-words whitespace-pre-line">
                                    {task.deskripsi || "Belum ada deskripsi tugas dari Kadiv."}
                                </p>
                            </div>

                            {/* === STATUS === */}
                            <div className="mt-3 border-t border-gray-100 pt-2 text-[10px] space-y-1 leading-snug">
                                {task.is_paused === 1 && (
                                    <div className="flex items-start gap-1 text-amber-600 font-medium">
                                        <FontAwesomeIcon icon={faPauseCircle} className="text-amber-500 text-[10px] mt-[2px]" />
                                        <span>
                                            Tugas sedang <strong>ditunda sementara</strong> oleh atasan.
                                        </span>
                                    </div>
                                )}

                                {task.status_tugas === 2 && (
                                    <div className="flex items-start gap-1 text-red-600 font-medium">
                                        <FontAwesomeIcon icon={faCircleXmark} className="text-red-500 text-[10px] mt-[2px]" />
                                        <span>
                                            Pengajuan <strong>ditolak</strong> — mohon lakukan <strong>revisi segera</strong>.
                                        </span>
                                    </div>
                                )}

                                {task.status_tugas === 0 && task.finished_at && (
                                    <div className="flex items-start gap-1 text-gray-600 font-medium">
                                        <FontAwesomeIcon icon={faHourglassHalf} className="text-gray-500 text-[10px] mt-[2px]" />
                                        <span>
                                            Tugas telah <strong>dikumpulkan</strong> dan menunggu <strong>verifikasi</strong>.
                                        </span>
                                    </div>
                                )}

                                {task.status_tugas === 1 && (
                                    <div className="flex items-start gap-1 text-emerald-600 font-medium">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500 text-[10px] mt-[2px]" />
                                        <span>
                                            Tugas <strong>selesai</strong> dan telah <strong>disetujui</strong> oleh atasan.
                                        </span>
                                    </div>
                                )}

                                {!task.finished_at && task.status_tugas === null && (
                                    <div className="flex items-start gap-1 text-blue-600 font-medium">
                                        <FontAwesomeIcon icon={faHammer} className="text-blue-500 text-[10px] mt-[2px]" />
                                        <span>
                                            Tugas sedang <strong>dikerjakan</strong>. Pastikan diselesaikan tepat waktu.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* === WAKTU SELESAI === */}
                            {task.finished_at && (
                                <div className="flex items-center gap-1 text-[9px] text-gray-600 mt-2 border-t border-gray-100 pt-2">
                                    <FontAwesomeIcon icon={faClock} className="text-gray-500 text-[10px]" />
                                    <span>
                                        Diselesaikan pada{" "}
                                        <strong className="text-gray-800">{formatFullDate(task.finished_at)}</strong>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* === KARTU BUKTI PENYELESAIAN === */}
                        {task.finished_at && task.bukti_foto && (
                            <div
                                className={`relative mt-4 pl-3 border-l-4 ${task.status_tugas === 2
                                    ? "border-red-500"
                                    : task.status_tugas === 1
                                        ? "border-green-500"
                                        : "border-gray-400"
                                    }`}
                            >
                                {/* Header Section */}
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-semibold text-gray-900 tracking-wide">
                                        Bukti Penyelesaian
                                    </h3>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.status_tugas === 0
                                            ? "bg-gray-100 text-gray-600"
                                            : task.status_tugas === 1
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {task.status_tugas === 0
                                            ? "Menunggu"
                                            : task.status_tugas === 1
                                                ? "Disetujui"
                                                : "Ditolak"}
                                    </span>
                                </div>

                                {/* Foto Sebelumnya */}
                                {!photo && !isCameraOpen && (
                                    <div className="relative overflow-hidden rounded-xl shadow-sm border border-gray-200">
                                        <img
                                            src={`${apiUrl}/img/tugas/${task.bukti_foto}`}
                                            alt="Bukti Sebelumnya"
                                            className="w-full h-52 object-cover transition-all duration-200"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-3 py-1.5 font-medium text-center">
                                            Foto Sebelumnya
                                        </div>

                                        {/* Tombol Revisi */}
                                        {Number(task.status_tugas) === 2 && (
                                            <button
                                                type="button"
                                                onClick={() => setIsCameraOpen(true)}
                                                className="absolute bottom-3 right-3 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-md shadow-sm"
                                            >
                                                Ambil Ulang Foto
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Mode Kamera */}
                                {isCameraOpen && (
                                    <div className="mt-3 space-y-2">
                                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-gray-200">
                                            <Webcam
                                                ref={webcamRef}
                                                screenshotFormat="image/jpeg"
                                                videoConstraints={{ facingMode }}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={switchCamera}
                                                className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                                            >
                                                Ganti Kamera
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    capturePhoto();
                                                    setIsCameraOpen(false);
                                                }}
                                                className="flex-1 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                                            >
                                                Ambil Foto
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsCameraOpen(false)}
                                            className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md mt-2 text-sm"
                                        >
                                            Batalkan
                                        </button>
                                    </div>
                                )}

                                {/* Foto Revisi */}
                                {photo && !isCameraOpen && (
                                    <div className="mt-4">
                                        <h4 className="text-xs font-semibold text-gray-700 mb-1">
                                            Foto Revisi (Baru)
                                        </h4>
                                        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                            <img
                                                src={photo}
                                                alt="Preview Revisi"
                                                className="w-full h-52 object-cover"
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setPhoto(null)}
                                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm disabled:bg-gray-400"
                                            >
                                                {uploading ? "Mengunggah..." : "Kirim Revisi"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                    </>
                )}
            </div>
            <FooterMainBar />
        </MobileLayout>
    );
};

export default DetailTugasMobile;