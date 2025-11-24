/* === DETAIL TUGAS MOBILE (FLOW SUDAH DIBENARKAN) === */

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCamera,
    faChevronDown,
    faChevronRight,
    faCircleCheck,
    faCircleXmark,
    faHammer,
    faHourglassHalf,
    faInfoCircle,
    faPauseCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import MobileLayout from "../../layouts/mobileLayout";
import { LoadingSpinner, ErrorState, EmptyState, FooterMainBar } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatDateTime, formatFullDate, formatLongDate } from "../../utils/dateUtils";
import Webcam from "react-webcam";

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

    /* === LOAD DETAIL TUGAS === */
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

    /* === FOTO === */
    const capturePhoto = () => {
        const screenshot = webcamRef.current?.getScreenshot();
        if (screenshot) setPhotos((prev) => [...prev, screenshot]);
    };

    const switchCamera = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    };

    /* === UPLOAD === */
    const handleUpload = async () => {
        if (photos.length === 0) return toast.error("Ambil minimal 1 foto 📸");
        if (!description.trim()) return toast.error("Deskripsi wajib diisi 📝");

        const formData = new FormData();

        for (let i = 0; i < photos.length; i++) {
            const blob = await (await fetch(photos[i])).blob();
            formData.append("foto", blob, `bukti_${i}.jpg`);
        }

        formData.append("deskripsi", description);

        const method = task?.status_tugas === 2 ? "PUT" : "POST";
        setUploading(true);

        try {
            const response = await fetchWithJwt(`${apiUrl}/tugas/user/${id}`, {
                method,
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Pengumpulan tugas berhasil ✓");
                setPhotos([]);
                setDescription("");
                setPhotoConfirmed(false);
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
                        {/* === DROPDOWN SECTION TUGAS === */}
                        <div className="border rounded-lg mb-4">
                            <button className="w-full p-3 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-semibold text-gray-900">
                                        INFORMASI PENUGASAN
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-[1.5px] rounded text-[8px] font-semibold uppercase ${task.category === "urgent" ? "bg-red-100 text-red-600 animate-pulse" : "bg-green-100 text-green-700"}`}>
                                            {task.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between text-[10px] text-gray-700">
                                    <span className="font-medium">Dibuat Oleh:</span>
                                    <span className="text-gray-800">
                                        {task.nama_kadiv}
                                    </span>
                                </div>

                                <div className="flex justify-between text-[10px] text-gray-700">
                                    <span className="font-medium">Dimulai Pada:</span>
                                    <span className="text-gray-800">
                                        {formatFullDate(task.start_date)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-[10px] text-gray-700">
                                    <span className="font-medium">Tenggat Waktu:</span>
                                    <span className={`${task.category === "urgent" ? "text-red-600 font-semibold" : "text-gray-800"}`}>
                                        {formatFullDate(task.deadline_at)}
                                    </span>
                                </div>
                            </button>

                            <div className="px-3 py-3 border-t border-gray-100 space-y-3 text-[10px]">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-green-600 text-[11px]">Tugas</h3>
                                    <p className="text-[12px] font-medium text-gray-900 leading-snug break-words">
                                        {task.nama_tugas}
                                    </p>
                                </div>
                                <hr className="border-gray-200" />
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-green-600 text-[11px]">Deskripsi Penugasan</h3>
                                    <p className="text-gray-700 text-[10px] leading-relaxed break-words text-justify">
                                        {task.deskripsi || "Tidak ada deskripsi."}
                                    </p>
                                </div>
                            </div>
                        </div>


                        {/* === STATUS & BUKTI PENGUMPULAN TUGAS === */}
                        <div className="border rounded-lg mb-4">
                            <button
                                onClick={() => setOpenBukti(!openBukti)}
                                className="w-full text-left"
                            >
                                <div className="p-3 flex justify-between items-center">
                                    <h3 className="text-[12px] font-semibold">BUKTI PENGUMPULAN TUGAS</h3>
                                    <FontAwesomeIcon
                                        icon={openBukti ? faChevronDown : faChevronRight}
                                        className="text-[12px] text-gray-600"
                                    />
                                </div>

                                {/* Status Ringkas */}
                                <div className="px-3 pb-3">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-semibold text-gray-700">Status</span>

                                        {task.is_paused === 1 && (
                                            <span className="flex items-center gap-1 text-amber-600">
                                                <FontAwesomeIcon icon={faPauseCircle} /> Ditunda
                                            </span>
                                        )}

                                        {!task.finished_at && task.status_tugas === 0 && task.is_paused !== 1 && (
                                            <span className="flex items-center gap-1 text-blue-600">
                                                <FontAwesomeIcon icon={faHammer} /> Belum Dikerjakan
                                            </span>
                                        )}

                                        {task.finished_at && task.status_tugas === 0 && (
                                            <span className="flex items-center gap-1 text-gray-600">
                                                <FontAwesomeIcon icon={faHourglassHalf} /> Menunggu Verifikasi
                                            </span>
                                        )}

                                        {task.finished_at && task.status_tugas === 1 && (
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <FontAwesomeIcon icon={faCircleCheck} /> Disetujui
                                            </span>
                                        )}

                                        {task.finished_at && task.status_tugas === 2 && (
                                            <span className="flex items-center gap-1 text-red-600">
                                                <FontAwesomeIcon icon={faCircleXmark} /> Ditolak
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Konten Dropdown */}
                            {openBukti && (
                                <div className="p-3 text-[11px] border-t border-gray-100 space-y-4">

                                    {/* ==============================
                Jika Status Bukan Disetujui → Infobox + Foto Lama + Tombol Kirim
            ============================== */}
                                    {task.status_tugas !== 1 && (
                                        <>
                                            {/* Infobox Modern */}
                                            <div className="flex items-start p-2 bg-green-50 border border-green-200 rounded-md space-x-2 text-[10px]">
                                                <FontAwesomeIcon icon={faInfoCircle} className="text-green-500 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-green-700 mb-1">Informasi Pengumpulan</h4>
                                                    <p className="text-gray-700 leading-snug">
                                                        {task.finished_at
                                                            ? "Tugas sudah dikirim dan menunggu verifikasi Kadiv."
                                                            : "Silakan kirim bukti tugas sebelum deadline."}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Foto Lama */}
                                            {task.submission?.length > 0 && (
                                                <div>
                                                    <h5 className="font-semibold text-gray-700 mb-1">Foto yang Sudah Dikirim</h5>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {task.submission.map((file, i) => (
                                                            <img
                                                                key={i}
                                                                src={`${apiUrl}/uploads/img/tugas/${file}`}
                                                                className="w-full h-24 object-cover rounded-md border"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tombol Ambil Foto */}
                                            {!isCameraOpen && (
                                                <button
                                                    onClick={() => setIsCameraOpen(true)}
                                                    className="w-full py-2 bg-green-600 text-white rounded-md"
                                                >
                                                    <FontAwesomeIcon icon={faCamera} className="mr-1" />
                                                    Ambil / Kirim Foto
                                                </button>
                                            )}

                                            {/* Kamera */}
                                            {isCameraOpen && (
                                                <div className="p-2 border rounded-md bg-gray-50">
                                                    <div className="w-full aspect-[4/3] bg-black rounded-md overflow-hidden">
                                                        <Webcam
                                                            ref={webcamRef}
                                                            screenshotFormat="image/jpeg"
                                                            videoConstraints={{ facingMode }}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    <div className="flex gap-2 mt-2">
                                                        <button onClick={switchCamera} className="flex-1 py-2 bg-gray-200 rounded-md">
                                                            Ganti Kamera
                                                        </button>
                                                        <button
                                                            onClick={() => { capturePhoto(); setIsCameraOpen(false); }}
                                                            className="flex-1 py-2 bg-green-600 text-white rounded-md"
                                                        >
                                                            Ambil Foto
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => setIsCameraOpen(false)}
                                                        className="w-full mt-2 py-2 bg-gray-100 rounded-md"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            )}

                                            {/* Deskripsi + Kirim */}
                                            {photos.length > 0 && (
                                                <div className="mt-2">
                                                    <textarea
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        rows={3}
                                                        placeholder="Tuliskan deskripsi singkat hasil pekerjaan..."
                                                        className="w-full p-2 border rounded-md"
                                                    />
                                                    <button
                                                        onClick={handleUpload}
                                                        disabled={uploading}
                                                        className={`w-full mt-2 py-2 rounded-md text-white ${uploading ? "bg-gray-400" : "bg-blue-600"
                                                            }`}
                                                    >
                                                        {uploading ? "Mengirim..." : "Kirim Ke Kadiv"}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
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
