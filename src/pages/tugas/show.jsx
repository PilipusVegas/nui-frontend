/* === DETAIL TUGAS MOBILE (FLOW SUDAH DIBENARKAN) === */

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faChevronDown, faChevronRight, faCircleCheck, faCircleXmark, faHammer, faHourglassHalf, faInfoCircle, faPauseCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import MobileLayout from "../../layouts/mobileLayout";
import { LoadingSpinner, ErrorState, EmptyState, FooterMainBar } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import Webcam from "react-webcam";
import Zoom from "react-medium-image-zoom";
import 'react-medium-image-zoom/dist/styles.css';


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
        if (photos.length === 0) return toast.error("Ambil minimal 1 foto");
        if (!description.trim()) return toast.error("Deskripsi wajib diisi");

        const formData = new FormData();

        // Lampirkan foto
        for (let i = 0; i < photos.length; i++) {
            const blob = await (await fetch(photos[i])).blob();
            formData.append("foto", blob, `bukti_${i}.jpg`);
        }

        // Lampirkan deskripsi
        formData.append("deskripsi", description);

        setUploading(true);

        try {
            const response = await fetchWithJwt(`${apiUrl}/tugas/user/${id}`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Pengumpulan tugas berhasil ✓");
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
                            <button onClick={() => setOpenBukti(!openBukti)} className="w-full text-left">
                                <div className="p-3 flex justify-between items-center">
                                    <h3 className="text-[12px] font-semibold">BUKTI PENGUMPULAN TUGAS</h3>
                                    <FontAwesomeIcon icon={openBukti ? faChevronDown : faChevronRight} className="text-[12px] text-gray-600" />
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

                                        {!task.finished_at && task.status_tugas === 0 && (
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
                                                <FontAwesomeIcon icon={faCircleXmark} /> Revisi Segera
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {openBukti && (
                                <div className="p-3 text-[11px] border-t border-gray-100 space-y-5">

                                    {/* ========================= INFOBOX STATUS ========================= */}
                                    <div
                                        className={`p-2 border rounded-md flex gap-2 text-[10px] ${task.status_tugas === 1
                                            ? "bg-emerald-50 border-emerald-200"
                                            : task.status_tugas === 2
                                                ? "bg-red-50 border-red-200"
                                                : "bg-blue-50 border-blue-200"
                                            }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={faInfoCircle}
                                            className={`mt-0.5 ${task.status_tugas === 1
                                                ? "text-emerald-600"
                                                : task.status_tugas === 2
                                                    ? "text-red-500"
                                                    : "text-blue-500"
                                                }`}
                                        />

                                        <div>
                                            <h4 className="font-semibold mb-1">
                                                {task.status_tugas === 1 && "Tugas Disetujui"}
                                                {task.status_tugas === 2 && "Tugas Perlu Revisi"}
                                                {task.status_tugas === 0 && task.finished_at && "Menunggu Verifikasi"}
                                                {!task.finished_at && "Unggah Bukti Penyelesaian"}
                                            </h4>

                                            <p className="text-gray-700 leading-snug">
                                                {task.status_tugas === 2
                                                    ? "Tugas ditolak. Silakan kirim ulang foto revisi disertai perbaikan."
                                                    : task.status_tugas === 1
                                                        ? "Tugas telah disetujui oleh kepala divisi."
                                                        : task.finished_at
                                                            ? "Tugas sudah dikirim dan sedang menunggu verifikasi."
                                                            : "Kirim bukti hasil pekerjaan sebelum deadline."}
                                            </p>
                                        </div>
                                    </div>


                                    {/* ========================= DESKRIPSI PENOLAKAN ========================= */}
                                    {task.status_tugas === 2 && task.deskripsi_penolakan && (
                                        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                                            <p className="font-semibold text-red-700 mb-1">Alasan Penolakan:</p>
                                            <p className="text-[10px] text-red-700 leading-snug whitespace-pre-wrap">
                                                {task.deskripsi_penolakan}
                                            </p>
                                        </div>
                                    )}

                                    {/* ========================= FOTO LAMA ========================= */}
                                    {task.submission?.length > 0 && photos.length === 0 && (
                                        <div>
                                            <h5 className="font-semibold text-gray-700 mb-2">
                                                {task.status_tugas === 2
                                                    ? "Foto Lama (Sebelum Revisi)"
                                                    : "Foto yang Sudah Dikirim"}
                                            </h5>

                                            <div className="grid grid-cols-3 gap-2">
                                                {task.submission.map((file, i) => (
                                                    <Zoom>
                                                        <img
                                                            key={i}
                                                            src={`${apiUrl}/uploads/img/tugas/${file}`}
                                                            className="w-full h-24 object-cover rounded-md border cursor-pointer"
                                                        />
                                                    </Zoom>

                                                ))}
                                            </div>

                                            {/* Detail Submisi Lama */}
                                            {task.deskripsi_pengajuan && (
                                                <div className="mt-3 p-2 bg-gray-50 border rounded-md">
                                                    <p className="font-semibold text-gray-700 mb-1">Deskripsi Pengumpulan Lama:</p>
                                                    <p className="text-[10px] text-gray-600 leading-snug whitespace-pre-wrap">
                                                        {task.deskripsi_pengajuan}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}


                                    {/* ========================= KAMERA ========================= */}
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

                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={switchCamera}
                                                    className="flex-1 py-2 bg-gray-200 rounded-md"
                                                >
                                                    Ganti Kamera
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        capturePhoto();      // ⬅ foto ditambahkan ke array
                                                    }}
                                                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                                                >
                                                    Ambil Foto
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => setIsCameraOpen(false)}
                                                className="w-full mt-3 py-2 bg-gray-100 rounded-md"
                                            >
                                                Selesai Ambil Foto
                                            </button>
                                        </div>
                                    )}


                                    {/* ========================= PREVIEW FOTO BARU ========================= */}
                                    {photos.length > 0 && (
                                        <div>
                                            <h5 className="font-semibold text-gray-700 mb-2">
                                                {task.status_tugas === 2 ? "Foto Baru (Revisi)" : "Foto Baru"}
                                            </h5>

                                            <div className="grid grid-cols-3 gap-2">
                                                {photos.map((img, i) => (
                                                    <div key={i} className="relative">
                                                        <Zoom>
                                                            <img src={img} className="w-full h-24 object-cover rounded-md border cursor-pointer" />
                                                        </Zoom>


                                                        {/* Tombol X */}
                                                        <button onClick={() => { const updated = photos.filter((_, index) => index !== i); setPhotos(updated); }}
                                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white w-5 h-5 flex items-center justify-center rounded-full"
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}


                                    {/* ========================= DESKRIPSI + SUBMIT ========================= */}
                                    {photos.length > 0 && (
                                        <div className="mt-2">

                                            <label className="block mb-1 text-sm font-semibold text-gray-700">
                                                {task.status_tugas === 2
                                                    ? "Deskripsi Perbaikan / Revisi"
                                                    : "Deskripsi Hasil Pekerjaan"}
                                            </label>

                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={3}
                                                placeholder={
                                                    task.status_tugas === 2
                                                        ? "Jelaskan perbaikan atau revisi yang dilakukan..."
                                                        : "Tuliskan deskripsi singkat hasil pekerjaan..."
                                                }
                                                className="w-full p-2 border rounded-md"
                                            />

                                            <button
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className={`w-full mt-3 py-2 rounded-md text-white ${uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                                                    }`}
                                            >
                                                {uploading
                                                    ? "Mengirim..."
                                                    : task.status_tugas === 2
                                                        ? "Kirim Revisi ke Kadiv"
                                                        : "Kirim Ke Kadiv"}
                                            </button>
                                        </div>
                                    )}



                                    {/* ========================= BUTTON BUKA KAMERA ========================= */}
                                    {!isCameraOpen &&
                                        photos.length === 0 &&
                                        (task.status_tugas === 2 || !task.finished_at) && (
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => setIsCameraOpen(true)}
                                                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                                                >
                                                    <FontAwesomeIcon icon={faCamera} className="mr-1" />
                                                    {task.status_tugas === 2
                                                        ? "Ambil Foto Revisi"
                                                        : "Ambil / Kirim Foto"}
                                                </button>
                                            </div>
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
