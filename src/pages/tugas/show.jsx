import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
                        <h1 className="text-[13px] font-semibold text-gray-900 mb-1 leading-snug">
                            {task.nama_tugas}
                        </h1>
                        <p className="text-[10px] text-gray-500 mb-3">
                            {formatFullDate(task.start_date)} · oleh {task.nama_kadiv}
                        </p>

                        {/* === INFORMASI SINGKAT === */}
                        <section className="border-y border-gray-100 py-2 mb-3">
                            <div className="grid grid-cols-2 gap-y-1 text-[10px] text-gray-700">
                                <div>
                                    <span className="font-medium text-gray-800">Kategori:</span>{" "}
                                    <span className={`uppercase ${task.category === "urgent" ? "text-red-600 font-semibold" : "text-green-600"}`}>
                                        {task.category}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-800">Tenggat:</span>{" "}
                                    <span className={`${task.category === "urgent" ? "text-red-600 font-semibold" : "text-gray-700"}`}>
                                        {formatFullDate(task.deadline_at)}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* === DESKRIPSI === */}
                        <section className="mb-3">
                            <h3 className="text-[11px] font-semibold text-green-600 mb-1">Deskripsi Penugasan</h3>
                            <p className="text-[11px] text-gray-800 leading-relaxed text-justify">
                                {task.deskripsi || "Belum ada deskripsi tugas dari Kadiv."}
                            </p>
                        </section>


                        {/* === STATUS === */}
                        <section className="mb-4">
                            <h3 className="text-[11px] font-semibold text-green-600 mb-1">Status Penugasan</h3>
                            {task.is_paused === 1 && (
                                <p className="text-[11px] text-amber-600">
                                    <FontAwesomeIcon icon={faPauseCircle} className="mr-1 text-amber-500" />
                                    Penugasan Ditunda Sementara.
                                </p>
                            )}
                            {task.status_tugas === 2 && (
                                <p className="text-[11px] text-red-600 font-medium">
                                    <FontAwesomeIcon icon={faCircleXmark} className="mr-1 text-red-500" />
                                    Pengajuan Ditolak, Mohon Revisi Segera.
                                </p>
                            )}
                            {task.status_tugas === 0 && task.finished_at && (
                                <p className="text-[11px] text-gray-600">
                                    <FontAwesomeIcon icon={faHourglassHalf} className="mr-1 text-gray-500" />
                                    Menunggu verifikasi.
                                </p>
                            )}
                            {task.status_tugas === 1 && (
                                <p className="text-[11px] text-emerald-600">
                                    <FontAwesomeIcon icon={faCircleCheck} className="mr-1 text-emerald-500" />
                                    Penugasan Selesai dan disetujui.
                                </p>
                            )}
                            {task.finished_at === null && (
                                <p className="text-[11px] text-gray-600">
                                    <FontAwesomeIcon icon={faHourglassHalf} className="mr-1 text-gray-500" />
                                    Tugas Belum Selesai, Mohon Selesaikan Secepatnya.
                                </p>
                            )}
                            {!task.finished_at && task.status_tugas === null && (
                                <p className="text-[11px] text-blue-600">
                                    <FontAwesomeIcon icon={faHammer} className="mr-1 text-blue-500" />
                                    Sedang dikerjakan.
                                </p>
                            )}
                        </section>


                        {/* === PENGUMPULAN HASIL PEKERJAAN === */}
                        <div className="mt-6 border-t border-gray-100 pt-5 pb-24">
                            <div className="flex items-center mb-4">
                                <span className="inline-block w-1 h-4 bg-green-500 rounded mr-2"></span>
                                <div>
                                    <h3 className="text-[13px] font-semibold text-gray-800">Bukti Penyelesaian Pekerjaan</h3>
                                    <p className="text-[10px] text-gray-500">Unggah foto hasil kerja Anda sebagai tanda penyelesaian tugas.</p>
                                </div>
                            </div>

                            {/* === KONDISI: TIDAK ADA FOTO === */}
                            {!photo && !isCameraOpen && (
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 p-3">
                                    {task.bukti_foto ? (
                                        <>
                                            <div className="rounded-lg overflow-hidden mb-3">
                                                <img src={`${apiUrl}/img/tugas/${task.bukti_foto}`} alt="Bukti" className="w-full h-48 object-cover rounded-lg"/>
                                            </div>
                                            <p className="text-[11px] text-gray-700 text-center leading-snug mb-3">
                                                {Number(task.status_tugas) === 2
                                                    ? "Tugas ini memerlukan pembaruan. Silakan unggah ulang bukti pekerjaan terbaru Anda."
                                                    : "Bukti pekerjaan telah dikirim dan menunggu verifikasi dari kepala divisi."}
                                            </p>

                                            {Number(task.status_tugas) === 2 && (
                                                <button type="button" onClick={() => setIsCameraOpen(true)} className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-2">
                                                    <FontAwesomeIcon icon={faSyncAlt} className="text-white text-xs" />
                                                    Ambil Ulang Foto
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center flex flex-col items-center justify-center py-5 text-gray-600">
                                            <p className="text-[11px] leading-snug mb-3 max-w-[260px]">
                                                Belum ada bukti penyelesaian tugas. Silakan ambil foto sebagai tanda bahwa pekerjaan telah selesai.
                                            </p>
                                            <button type="button" onClick={() => setIsCameraOpen(true)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-[11px] font-medium rounded-md shadow-sm transition-all">
                                                <FontAwesomeIcon icon={faCamera} className="text-white text-xs" />
                                                Ambil Foto & Kirim
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* === KONDISI: KAMERA TERBUKA === */}
                            {isCameraOpen && (
                                <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 shadow-inner p-3">
                                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-300 bg-black">
                                        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} className="w-full h-full object-cover"/>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={switchCamera} className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-2">
                                            <FontAwesomeIcon icon={faSyncAlt} />
                                            Ganti Kamera
                                        </button>
                                        <button
                                            onClick={() => {
                                                capturePhoto();
                                                setIsCameraOpen(false);
                                            }}
                                            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faCameraRetro} />
                                            Ambil Foto
                                        </button>
                                    </div>

                                    <p className="text-[10px] text-gray-500 text-center">
                                        Pastikan hasil kerja terlihat jelas dan pencahayaan cukup.
                                    </p>

                                    <button onClick={() => setIsCameraOpen(false)} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-2">
                                        <FontAwesomeIcon icon={faTimes} />
                                        Batalkan
                                    </button>
                                </div>
                            )}

                            {/* === KONDISI: SETELAH AMBIL FOTO === */}
                            {photo && !isCameraOpen && (
                                <div className="mt-4">
                                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm mb-3">
                                        <img src={photo} alt="Preview Bukti" className="w-full h-48 object-cover rounded-lg"/>
                                    </div>

                                    <div className="flex justify-between gap-3">
                                        <button onClick={() => setPhoto(null)} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-[11px] font-medium flex items-center justify-center gap-2">
                                            <FontAwesomeIcon icon={faTimes} />
                                            Ulangi
                                        </button>

                                        <button onClick={handleUpload} disabled={uploading}
                                            className={`flex-1 py-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-2 transition-all ${uploading
                                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                                    : "bg-green-600 hover:bg-green-700 text-white"
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                            {uploading ? "Mengirim..." : "Kirim Bukti"}
                                        </button>
                                    </div>

                                    <p className="text-[10px] text-gray-500 text-center mt-2">
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
