import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faChevronDown, faChevronRight, faCircleCheck, faCircleXmark, faHammer, faHourglassHalf, faInfoCircle, faPauseCircle, faTimes, } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import MobileLayout from "../../layouts/mobileLayout";
import { LoadingSpinner, ErrorState, EmptyState, FooterMainBar } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import Webcam from "react-webcam";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const DetailTugasMobile = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openBukti, setOpenBukti] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [photoConfirmed, setPhotoConfirmed] = useState(false);
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const webcamRef = useRef(null);
    const [facingMode, setFacingMode] = useState("environment");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (images, index) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
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
                else toast.error(data.message || "Data tugas tidak ditemukan");
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
        if (photos.length >= 3) {
            toast.error("Maksimal 3 foto");
            return;
        }

        const screenshot = webcamRef.current?.getScreenshot();
        if (screenshot) setPhotos((prev) => [...prev, screenshot]);
    };

    const switchCamera = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    };

    /* === UPLOAD === */
    const handleUpload = async () => {
        if (photos.length === 0) return toast.error("Ambil minimal 1 foto");
        if (!description.trim()) return toast.error("Deskripsi wajib diisi");

        const formData = new FormData();

        // Lampirkan foto
        for (let i = 0; i < photos.length; i++) {
            const blob = await (await fetch(photos[i])).blob();
            formData.append("foto", blob, `bukti_${i}.jpg`);
        }

        formData.append("deskripsi", description);

        setUploading(true);

        try {
            const response = await fetchWithJwt(`${apiUrl}/tugas/user/${id}`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Pengumpulan tugas berhasil");
                setPhotos([]);
                setDescription("");
                setPhotoConfirmed(false);
                setIsCameraOpen(false);
                loadTaskDetail();
            } else {
                toast.error(result.message || "Gagal mengirim data");
            }
        } catch {
            toast.error("Kesalahan jaringan");
        } finally {
            setUploading(false);
        }
    };

    const getDeadlineStatus = (deadline_at, finished_at = null) => {
        if (!deadline_at) return "-";
        const deadline = new Date(deadline_at);
        const now = finished_at ? new Date(finished_at) : new Date();
        const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `Terlambat ${Math.abs(diff)} hari`;
        if (diff === 0) return "Tenggat hari ini !";
        return `Sisa ${diff} hari lagi`;
    };

    const getTaskStatusUI = (task) => {
        if (task.is_paused === 1) {
            return {
                label: "Ditunda",
                color: "text-amber-600",
                icon: faPauseCircle,
                box: "bg-amber-50 border-amber-200 text-amber-700",
                title: "Tugas Ditunda",
                desc: "Pengerjaan tugas sedang ditunda sementara.",
            };
        }

        if (!task.finished_at && task.status_tugas === 0) {
            return {
                label: "Belum Dikerjakan",
                color: "text-blue-600",
                icon: faHammer,
                box: "bg-blue-50 border-blue-200 text-blue-700",
                title: "Unggah Bukti Penyelesaian",
                desc: "Kirim bukti hasil pekerjaan sebelum tenggat waktu.",
            };
        }

        if (task.finished_at && task.status_tugas === 0) {
            return {
                label: "Menunggu Verifikasi",
                color: "text-gray-600",
                icon: faHourglassHalf,
                box: "bg-gray-50 border-gray-200 text-gray-700",
                title: "Menunggu Verifikasi",
                desc: "Tugas sudah dikirim dan sedang diverifikasi.",
            };
        }

        if (task.status_tugas === 1) {
            return {
                label: "Disetujui",
                color: "text-emerald-600",
                icon: faCircleCheck,
                box: "bg-emerald-50 border-emerald-200 text-emerald-700",
                title: "Tugas Disetujui",
                desc: "Tugas telah disetujui oleh kepala divisi.",
            };
        }

        if (task.status_tugas === 2) {
            return {
                label: "Revisi",
                color: "text-red-600",
                icon: faCircleXmark,
                box: "bg-red-50 border-red-200 text-red-700",
                title: "Tugas Perlu Revisi",
                desc: "Tugas ditolak. Silakan kirim ulang dengan perbaikan.",
            };
        }
        return {};
    };

    const statusUI = task ? getTaskStatusUI(task) : null;

    const getSlidesFromImages = (images) =>
        images.map((img) => ({
            src: `${apiUrl}/uploads/img/tugas/${img}`,
        }));


    return (
        <MobileLayout title="Detail Tugas">
            <div className="pb-24">
                {loading ? (
                    <LoadingSpinner message="Memuat detail tugas..." />
                ) : error ? (
                    <ErrorState message="Gagal memuat detail tugas" detail="Masalah koneksi atau data tidak tersedia." onRetry={loadTaskDetail} retryText="Coba Lagi" />
                ) : !task ? (
                    <EmptyState title="Data Tidak Ditemukan" description="Tugas ini tidak tersedia atau sudah dihapus." />
                ) : (
                    <>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                            <div className="px-4 py-3 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-semibold text-gray-900 tracking-wide">
                                        INFORMASI PENUGASAN
                                    </h3>

                                    <span className={`px-2 py-[2px] rounded text-[9px] font-semibold uppercase ${task.category === "urgent" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                                        {task.category}
                                    </span>
                                </div>
                            </div>

                            <div className="px-4 py-3 space-y-1 text-[11px] text-gray-600">
                                <div className="flex justify-between">
                                    <span>Dibuat oleh</span>
                                    <span className="font-medium text-gray-800">
                                        {task.nama_kadiv || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Mulai</span>
                                    <span>{formatFullDate(task.start_date)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Tenggat</span>
                                    <span className={task.category === "urgent" ? "text-red-600 font-semibold" : "text-gray-800"}>
                                        {formatFullDate(task.deadline_at)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sisa Waktu</span>
                                    <span className={task.category === "urgent" ? "text-red-600 font-semibold" : "text-gray-800"}>
                                        {getDeadlineStatus(task.deadline_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="px-4 py-3 border-t space-y-3">
                                <div>
                                    <p className="text-[11px] font-semibold text-green-600">
                                        JUDUL TUGAS
                                    </p>
                                    <p className="text-xs font-semibold text-gray-900 leading-snug break-words">
                                        {task.nama_tugas}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[11px] font-semibold text-green-600">
                                        PENJELASAN TUGAS
                                    </p>
                                    <p className="text-[11px] text-gray-700 leading-relaxed text-justify break-words">
                                        {task.deskripsi_tugas || "Tidak ada deskripsi."}
                                    </p>
                                </div>
                            </div>

                            {task.attachement?.length > 0 && (
                                <div className="px-4 py-3 border-t">
                                    <p className="text-[11px] font-semibold text-green-600 mb-2">
                                        LAMPIRAN PENDUKUNG
                                    </p>

                                    <div className="grid grid-cols-3 gap-2">
                                        {task.attachement.map((img, index) => (
                                            <div key={index} className="aspect-square rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:shadow-sm transition"
                                                onClick={() =>
                                                    openLightbox(
                                                        getSlidesFromImages(task.attachement),
                                                        index
                                                    )
                                                }

                                            >
                                                <img src={`${apiUrl}/uploads/img/tugas/${img}`} alt="Lampiran tugas" className="max-w-full max-h-full object-contain" loading="lazy"/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="px-4 py-3 border-t space-y-3">
                                <div>
                                    <p className="text-[11px] font-semibold text-green-600">
                                        DESKRIPSI TUGAS ANDA
                                    </p>
                                    <p className="text-[11px] text-gray-700 leading-relaxed text-justify break-words">
                                        {task.deskripsi}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ===================== BUKTI PENGUMPULAN TUGAS ===================== */}
                        <div className="border rounded-lg mb-4 overflow-hidden bg-white">
                            <button onClick={() => setOpenBukti((prev) => !prev)} className="w-full text-left">
                                <div className="px-3 py-3 flex justify-between items-center">
                                    <h3 className="text-[12px] font-semibold text-gray-800">
                                        BUKTI PENGUMPULAN TUGAS
                                    </h3>
                                    <FontAwesomeIcon icon={openBukti ? faChevronDown : faChevronRight} className="text-[12px] text-gray-500" />
                                </div>
                                {statusUI && (
                                    <div className="px-3 pb-3 flex justify-between items-center text-[10px]">
                                        <span className="font-semibold text-gray-700">Status</span>

                                        <span className={`flex items-center gap-1 ${statusUI.color}`}>
                                            <FontAwesomeIcon icon={statusUI.icon} />
                                            {statusUI.label}
                                        </span>
                                    </div>
                                )}
                            </button>

                            {openBukti && statusUI && (
                                <div className="px-3 py-3 border-t border-gray-100 space-y-5 text-[11px]">
                                    <div className={`p-3 rounded-md border ${statusUI.box}`}>
                                        <div className="flex items-start gap-2 mb-2">
                                            <FontAwesomeIcon icon={statusUI.icon} className="mt-0.5 text-[12px]" />
                                            <h4 className="font-semibold text-[12px]">
                                                {statusUI.title}
                                            </h4>
                                        </div>

                                        <p className="mb-2">{statusUI.desc}</p>

                                        {task.status_tugas === 2 && task.deskripsi_penolakan && (
                                            <div className="mt-2 pl-4 border-l-2 border-red-300">
                                                <p className="font-semibold mb-1 text-[11px]">
                                                    Alasan Penolakan
                                                </p>
                                                <p className="text-[10px] whitespace-pre-wrap break-words">
                                                    {task.deskripsi_penolakan}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {task.submission?.length > 0 && photos.length === 0 && (
                                        <div>
                                            <h5 className="font-semibold text-gray-700 mb-2">
                                                {task.status_tugas === 2 ? "Foto Lama (Sebelum Revisi)" : "Foto yang Sudah Dikirim"}
                                            </h5>

                                            <div className="grid grid-cols-3 gap-2">
                                                {task.submission.map((file, i) => (
                                                    <img key={i} src={`${apiUrl}/uploads/img/tugas/${file}`} onClick={() => openLightbox( task.submission.map((f) => ({ src: `${apiUrl}/uploads/img/tugas/${f}`,})), i )} className="w-full h-24 object-cover rounded-md border cursor-pointer"/>
                                                ))}
                                            </div>

                                            {task.deskripsi_pengajuan && (
                                                <div className="mt-3 p-2 bg-gray-50 border rounded-md">
                                                    <p className="font-semibold text-gray-700 mb-1">
                                                        Deskripsi Pengumpulan
                                                    </p>
                                                    <p className="text-[10px] text-gray-600 whitespace-pre-wrap break-words">
                                                        {task.deskripsi_pengajuan}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ================= KAMERA ================= */}
                                    {isCameraOpen && (
                                        <div className="p-2 border rounded-md bg-gray-50">
                                            <div className="w-full aspect-[4/3] bg-black rounded-md overflow-hidden">
                                                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} className="w-full h-full object-cover"/>
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                <button onClick={switchCamera} className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                                    Ganti Kamera
                                                </button>

                                                <button
                                                    onClick={capturePhoto}
                                                    className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                                >
                                                    Ambil Foto
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => setIsCameraOpen(false)}
                                                className="w-full mt-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                            >
                                                Selesai Ambil Foto
                                            </button>
                                        </div>
                                    )}

                                    {/* ================= PREVIEW FOTO BARU ================= */}
                                    {photos.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h5 className="font-semibold text-gray-700">
                                                    {task.status_tugas === 2
                                                        ? "Foto Baru (Revisi)"
                                                        : "Foto Baru"}
                                                </h5>
                                                <span className="text-[10px] text-gray-600">
                                                    {photos.length}/3 foto
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                {photos.map((img, i) => (
                                                    <div key={i} className="relative">
                                                        <img
                                                            src={img}
                                                            onClick={() =>
                                                                openLightbox(
                                                                    photos.map((p) => ({ src: p })),
                                                                    i
                                                                )
                                                            }
                                                            className="w-full h-24 object-cover rounded-md border cursor-pointer"
                                                        />

                                                        <button
                                                            onClick={() =>
                                                                setPhotos((prev) =>
                                                                    prev.filter((_, index) => index !== i)
                                                                )
                                                            }
                                                            className="absolute top-1 right-1 bg-black/50 text-white w-5 h-5 flex items-center justify-center rounded-full"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ================= DESKRIPSI + SUBMIT ================= */}
                                    {photos.length > 0 && (
                                        <div>
                                            <label className="block mb-1 text-sm font-semibold text-gray-700">
                                                {task.status_tugas === 2
                                                    ? "Deskripsi Perbaikan / Revisi"
                                                    : "Deskripsi Hasil Pekerjaan"}
                                            </label>

                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={3}
                                                className="w-full p-2 border rounded-md"
                                                placeholder="Tuliskan deskripsi pekerjaan..."
                                            />

                                            <button
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className={`w-full mt-3 py-2 rounded-md font-medium text-white text-lg ${uploading
                                                    ? "bg-gray-400"
                                                    : "bg-green-600 hover:bg-green-700"
                                                    }`}
                                            >
                                                {uploading
                                                    ? "Mengirim..."
                                                    : task.status_tugas === 2
                                                        ? "Kirim Revisi Pekerjaan"
                                                        : "Kirim Hasil Pekerjaan"}
                                            </button>
                                        </div>
                                    )}

                                    {/* ================= BUKA KAMERA ================= */}
                                    {!isCameraOpen &&
                                        photos.length === 0 &&
                                        (task.status_tugas === 2 || !task.finished_at) && (
                                            <button
                                                onClick={() => setIsCameraOpen(true)}
                                                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                                            >
                                                <FontAwesomeIcon icon={faCamera} className="mr-1" />
                                                {task.status_tugas === 2 ? "Ambil Foto Revisi" : "Ambil / Kirim Foto"}
                                            </button>
                                        )}
                                </div>
                            )}
                        </div>

                    </>
                )}
            </div>
            <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={lightboxImages} index={lightboxIndex} plugins={[Thumbnails]} />

            <FooterMainBar />
        </MobileLayout>
    );
};

export default DetailTugasMobile;
