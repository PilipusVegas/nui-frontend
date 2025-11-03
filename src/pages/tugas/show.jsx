import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTag,
    faUserTie,
    faClock,
    faHourglassHalf,
    faCircleCheck,
    faCircleXmark,
    faPauseCircle,
    faCamera,
    faSyncAlt,
    faPaperPlane,
    faTimes,
    faCameraRetro,
    faHammer,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import MobileLayout from "../../layouts/mobileLayout";
import {
    LoadingSpinner,
    ErrorState,
    EmptyState,
    FooterMainBar,
} from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import Webcam from "react-webcam";

const DetailTugasMobile = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const webcamRef = useRef(null);
    const [facingMode, setFacingMode] = useState("environment");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

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

    const capturePhoto = () => {
        if (!webcamRef.current) return;
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) setPhoto(screenshot);
    };

    const switchCamera = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    };

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
            } else toast.error(result.message || "Gagal mengunggah foto ❌");
        } catch {
            toast.error("Terjadi kesalahan saat mengunggah foto");
        } finally {
            setUploading(false);
        }
    };

    return (
        <MobileLayout title="Detail Tugas">
            <div className="p-2 pb-24">
                {loading ? (
                    <LoadingSpinner message="Memuat detail tugas..." />
                ) : error ? (
                    <ErrorState message="Gagal memuat detail tugas" detail="Terjadi masalah koneksi atau data tidak tersedia." onRetry={loadTaskDetail} retryText="Coba Lagi" />
                ) : !task ? (
                    <EmptyState title="Data Tidak Ditemukan" description="Tugas ini tidak tersedia atau sudah dihapus." />
                ) : (
                    <>
                        <h1 className="text-sm font-bold text-gray-900 leading-snug mb-2 capitalize break-words">
                            {task.nama_tugas}
                        </h1>

                        <div className="text-[10px] sm:text-[11px] text-gray-700 mb-3 border-b border-gray-200 pb-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">

                                {/* Dibuat Oleh */}
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faUserTie} className="mr-2 text-green-500 w-3.5" />
                                    <span className="font-semibold text-gray-800 mr-1">Dibuat Oleh:</span>
                                    <span className="truncate text-gray-700">{task.nama_kadiv}</span>
                                </div>

                                {/* Mulai */}
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faClock} className="mr-2 text-green-500 w-3.5" />
                                    <span className="font-semibold text-gray-800 mr-1">Tugas Dimulai:</span>
                                    <span className="text-gray-700">{formatFullDate(task.start_date)}</span>
                                </div>

                                {/* Tenggat */}
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faHourglassHalf} className="mr-2 text-green-500 w-3.5" />
                                    <span className="font-semibold text-gray-800 mr-1">Tenggat Waktu:</span>
                                    <span className={`${task.category === "urgent" ? "text-red-600 font-semibold" : "text-green-700 font-medium"}`}>
                                        {formatFullDate(task.deadline_at)}
                                    </span>
                                </div>

                                {/* Kategori */}
                                <div className="flex items-center">
                                    <FontAwesomeIcon icon={faTag} className="mr-2 text-green-500 w-3.5" />
                                    <span className="font-semibold text-gray-800 mr-1">Kategori:</span>
                                    <span className={`uppercase font-semibold ${task.category === "urgent" ? "text-red-600" : task.category === "daily" ? "text-green-700" : "text-gray-700"}`}>
                                        {task.category}
                                    </span>
                                </div>
                            </div>
                        </div>


                        {/* === DESKRIPSI PENUGASAN === */}
                        <div className="mt-4 mb-4">
                            <h3 className="text-xs font-semibold text-green-600 mb-1">
                                Deskripsi Penugasan :
                            </h3>
                            <p className="text-[12px] leading-relaxed text-gray-800 whitespace-pre-line text-justify">
                                {task.deskripsi || "Belum ada deskripsi tugas dari Kadiv."}
                            </p>
                        </div>


                        {/* === STATUS === */}
                        <div className="text-[11px] space-y-1 mb-4 border-t border-gray-200 pt-5">
                            {task.is_paused === 1 && (
                                <p className="text-amber-600 font-medium">
                                    <FontAwesomeIcon icon={faPauseCircle} className="mr-1 text-amber-500" />
                                    Tugas sedang <strong>ditunda sementara</strong>.
                                </p>
                            )}
                            {task.status_tugas === 2 && (
                                <p className="text-red-600 font-medium">
                                    <FontAwesomeIcon icon={faCircleXmark} className="mr-1 text-red-500" />
                                    Pengajuan <strong>ditolak</strong> — mohon revisi segera.
                                </p>
                            )}
                            {task.status_tugas === 0 && task.finished_at && (
                                <p className="text-gray-600 font-medium">
                                    <FontAwesomeIcon icon={faHourglassHalf} className="mr-1 text-gray-500" />
                                    Menunggu <strong>verifikasi</strong> dari atasan.
                                </p>
                            )}
                            {task.status_tugas === 1 && (
                                <p className="text-emerald-600 font-medium">
                                    <FontAwesomeIcon icon={faCircleCheck} className="mr-1 text-emerald-500" />
                                    Tugas <strong>selesai</strong> dan telah <strong>disetujui</strong>.
                                </p>
                            )}
                            {!task.finished_at && task.status_tugas === null && (
                                <p className="text-blue-600 font-medium">
                                    <FontAwesomeIcon icon={faHammer} className="mr-1 text-blue-500" />
                                    Sedang <strong>dikerjakan</strong>, selesaikan tepat waktu.
                                </p>
                            )}
                        </div>

                        {/* === PENGUMPULAN HASIL PEKERJAAN === */}
                        <div className="mt-6 border-t border-gray-200 pt-5 pb-24">
                            <h3 className="text-[15px] font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="inline-block w-1 h-4 bg-green-500 rounded"></span>
                                Bukti Penyelesaian Pekerjaan
                            </h3>

                            {/* === KONDISI SAAT TIDAK ADA FOTO DAN KAMERA TERTUTUP === */}
                            {!photo && !isCameraOpen && (
                                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300 p-3">
                                    {task.bukti_foto ? (
                                        <>
                                            <div className="overflow-hidden rounded-xl">
                                                <img src={`${apiUrl}/img/tugas/${task.bukti_foto}`} alt="Bukti" className="w-full h-52 sm:h-64 object-cover rounded-xl transition-transform duration-500 scale-x-[-1]" />
                                            </div>

                                            <div className="text-center mt-3">
                                                <p className="text-[12px] text-gray-600 mb-1">
                                                    Bukti hasil pekerjaan telah dikirim.
                                                    {Number(task.status_tugas) === 2 ? " Tugas memerlukan pembaruan, silakan unggah ulang secepatnya!." : " Menunggu verifikasi dari kepala divisi."}
                                                </p>

                                                {Number(task.status_tugas) === 2 && (
                                                    <button type="button" onClick={() => setIsCameraOpen(true)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-md shadow-sm transition-all">
                                                        <FontAwesomeIcon icon={faSyncAlt} className="text-white text-xs" />
                                                        Ambil Ulang Foto
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-gray-600">
                                            <p className="text-xs sm:text-sm mb-3 text-center">
                                                Belum ada bukti penyelesaian pekerjaan.
                                                Silakan ambil foto untuk menandai bahwa pekerjaan ini telah selesai.
                                            </p>
                                            <button type="button" onClick={() => setIsCameraOpen(true)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-md shadow-md transition-all">
                                                <FontAwesomeIcon icon={faCamera} className="text-white text-xs" />
                                                Ambil Foto & Kirim Hasil
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* === TAMPILAN KAMERA === */}
                            {isCameraOpen && (
                                <div className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-inner p-3">
                                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300 bg-black">
                                        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} className="w-full h-full object-cover scale-x-[-1]" />
                                    </div>

                                    <div className="flex flex-row gap-2">
                                        <button onClick={switchCamera} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2">
                                            <FontAwesomeIcon icon={faSyncAlt} />
                                            Ganti Kamera
                                        </button>
                                        <button onClick={() => { capturePhoto(); setIsCameraOpen(false); }} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2">
                                            <FontAwesomeIcon icon={faCameraRetro} />
                                            Ambil Foto
                                        </button>
                                    </div>

                                    <small className="text-[11px] text-gray-500 text-center block">
                                        Pastikan hasil kerja terlihat jelas dan pencahayaan cukup.
                                    </small>

                                    <button onClick={() => setIsCameraOpen(false)} className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2">
                                        <FontAwesomeIcon icon={faTimes} />
                                        Batalkan
                                    </button>
                                </div>
                            )}

                            {/* === TAMPILAN FOTO SETELAH AMBIL FOTO === */}
                            {photo && !isCameraOpen && (
                                <div className="mt-5">
                                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 text-center">
                                        {task.bukti_foto ? "Foto Revisi Hasil Pekerjaan" : "Bukti Hasil Pekerjaan"}
                                    </h4>

                                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                        <img src={photo} alt="Preview Bukti" className="w-full h-52 sm:h-64 object-cover rounded-xl transition-transform duration-500 scale-x-[-1]" />
                                    </div>

                                    <div className="flex flex-row justify-between items-center gap-3 mt-4">
                                        <button onClick={() => setPhoto(null)} className="w-1/2 min-h-[44px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-all shadow-sm">
                                            <FontAwesomeIcon icon={faTimes} />
                                            <span>Ulangi</span>
                                        </button>

                                        <button onClick={handleUpload} disabled={uploading} className={`w-1/2 min-h-[44px] flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all shadow-sm ${uploading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                            <span>{uploading ? "Mengirim..." : "Kirim Bukti"}</span>
                                        </button>
                                    </div>

                                    <p className="text-[11px] text-gray-500 text-center mt-2">
                                        Pastikan foto yang dikirim sudah benar dan mewakili hasil pekerjaan Anda.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <FooterMainBar />
        </MobileLayout>
    );
};

export default DetailTugasMobile;
