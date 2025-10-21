import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCircleCheck, faUpload, faCamera, faCalendarAlt, faUserTie, faFlag, } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import MobileLayout from "../../layouts/mobileLayout";
import { LoadingSpinner, ErrorState, EmptyState, FooterMainBar, } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate, formatLongDate } from "../../utils/dateUtils";

const DetailTugasMobile = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [detailOpen, setDetailOpen] = useState(true);
    const fileInputRef = useRef(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    // --- Ambil detail tugas ---
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

    // --- Upload bukti foto ---
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!photo) return toast.error("Silakan ambil atau pilih foto terlebih dahulu 📸");

        const formData = new FormData();
        formData.append("foto", photo);

        setUploading(true);
        try {
            const response = await fetchWithJwt(`${apiUrl}/tugas/user/${id}`, {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Bukti penyelesaian berhasil diunggah ✅");
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

    const openCamera = () => fileInputRef.current.click();

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
                        <div className={`relative w-full rounded-xl border border-gray-200 bg-white shadow-sm mb-4 p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-[1px] ${task.finished_at ? "opacity-70" : ""}`}>
                            <h1 className={`text-[13px] sm:text-[14px] font-semibold leading-snug mb-4 ${task.finished_at ? "text-gray-600" : "text-gray-900"}`}>
                                {task.nama_tugas}
                            </h1>

                            <div className={`flex items-center justify-between text-[11px] sm:text-[12px] mb-2 ${task.finished_at ? "text-gray-500" : "text-gray-700"}`}>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-gray-700 font-medium">Tenggat Waktu</span>
                                    <strong className={`${task.finished_at ? "text-gray-600" : task.category === "urgent" ? "text-red-700" : "text-gray-800"}`}>
                                        {formatFullDate(task.deadline_at)}
                                    </strong>
                                </div>

                                {!task.finished_at && (
                                    <div className={`self-center px-2 py-[2px] rounded-full text-white text-[10px] font-semibold tracking-wide shadow-sm ${task.category === "urgent" ? "bg-red-600/90" : task.category === "daily" ? "bg-emerald-600/90" : "bg-gray-500/80"}`}>
                                        {task.category?.toUpperCase()} TASK
                                    </div>
                                )}
                            </div>

                            <div className="w-full border-t border-dashed border-gray-200 mb-2"></div>

                            <div className={`text-[11px] sm:text-[12px] leading-relaxed tracking-tight mt-1 ${task.finished_at ? "text-gray-600" : "text-gray-800"}`}>
                                <div className={`rounded-md px-2 py-1.5 border-l-4 ${task.finished_at ? "border-gray-300 bg-gray-50" : task.category === "urgent" ? "border-red-400 bg-red-50/40" : "border-emerald-400 bg-emerald-50/40"}`}>
                                    <p className="whitespace-pre-line text-justify">
                                        <span className="block font-semibold mb-1 text-gray-700">
                                            Deskripsi Tugas
                                        </span>
                                        {task.deskripsi
                                            ? `${task.deskripsi}`
                                            : "Belum ada deskripsi tugas."}
                                    </p>
                                </div>
                            </div>

                            {task.finished_at && (
                                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-600 mt-2">
                                    <FontAwesomeIcon icon={faFileCircleCheck} className="text-gray-500" />
                                    <span>
                                        Selesai pada:{" "}
                                        <strong className="text-gray-700">
                                            {formatFullDate(task.finished_at)}
                                        </strong>
                                    </span>
                                </div>
                            )}

                            <div className="w-full border-t border-gray-100 mt-2 pt-2 flex justify-between items-center text-[9px] text-gray-500 font-medium">
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faUserTie} className="text-gray-400" />
                                    <span>Kadiv:</span>
                                    <span className="font-normal text-gray-700">{task.nama_kadiv || "-"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                                    <span>{formatLongDate(task.created_at)}</span>
                                </div>
                            </div>
                        </div>
                        {!task.finished_at && (
                            <form
                                onSubmit={handleUpload}
                                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                                        Bukti Penyelesaian
                                    </h3>
                                    <span className="text-[10px] px-2 py-[2px] bg-amber-100 text-amber-700 rounded-full font-medium">
                                        Wajib Dikirim
                                    </span>
                                </div>

                                {/* Info Ringkas */}
                                <p className="text-[11.5px] text-gray-500 leading-snug">
                                    Ambil foto langsung dari <strong>kamera</strong> Anda sebagai bukti bahwa tugas ini
                                    telah <strong>selesai dikerjakan</strong>. Pastikan foto tampak <strong>jelas, relevan</strong>,
                                    dan menunjukkan hasil pekerjaan Anda.
                                </p>

                                {/* Tombol Kamera */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 
                   text-white font-semibold text-[13px] py-2.5 rounded-xl shadow-sm 
                   transition-all active:scale-[0.97]"
                                    >
                                        <FontAwesomeIcon icon={faCamera} />
                                        Buka Kamera
                                    </button>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={(e) => setPhoto(e.target.files[0])}
                                    />
                                </div>

                                {/* Preview Foto */}
                                {photo && (
                                    <div className="border border-gray-200 rounded-xl overflow-hidden mt-3 shadow-sm">
                                        <img
                                            src={URL.createObjectURL(photo)}
                                            alt="Preview"
                                            className="w-full h-44 object-cover"
                                        />
                                        <div className="flex justify-between items-center px-3 py-1.5 bg-gray-50 text-[11px] text-gray-600 border-t">
                                            <span className="truncate">{photo.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setPhoto(null)}
                                                className="text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Tombol Kirim */}
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 
        shadow-sm transition-all duration-200 ${uploading
                                            ? "bg-gray-400 cursor-not-allowed text-white"
                                            : "bg-emerald-700 hover:bg-emerald-800 text-white active:scale-[0.97]"
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                    {uploading ? "Mengunggah..." : "Kirim Bukti"}
                                </button>

                                {/* Info Tambahan */}
                                <div className="text-[10.5px] text-gray-400 mt-2 leading-relaxed border-t border-dashed pt-2 space-y-1">
                                    <p>📷 Gunakan kamera belakang agar hasil lebih jelas.</p>
                                    <p>🕒 Unggah hanya sekali — jika ada kesalahan, hubungi atasan Anda.</p>
                                    <p>📡 Pastikan koneksi internet stabil saat mengirim foto.</p>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
            <FooterMainBar />
        </MobileLayout>
    );
};

export default DetailTugasMobile;
