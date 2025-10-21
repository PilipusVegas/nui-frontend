import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faFileCircleCheck,
    faUpload,
    faCamera,
    faChevronRight,
    faLayerGroup,
    faFlag,
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
                        <div className={`relative rounded-xl border shadow-sm p-4 mb-5 transition-all duration-300 hover:shadow-md hover:-translate-y-[1px] ${task.finished_at ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-500" : task.category === "urgent" ? "bg-gradient-to-br from-rose-50 to-red-100 border-red-200 hover:from-rose-100 hover:to-red-50 hover:border-red-300" : "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-50 hover:border-emerald-300"}`}>
                            <h1 className={`text-sm sm:text-base font-semibold mb-3 tracking-tight leading-snug ${task.finished_at ? "text-gray-700" : "text-gray-900"}`}>
                                {task.nama_tugas}
                            </h1>

                            <div className={`space-y-1 mb-3 text-[11px] sm:text-[12px] ${task.finished_at ? "text-gray-500" : "text-gray-700"}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {!task.finished_at && (
                                        <>
                                            {task.category === "urgent" && (
                                                <span className="px-2 py-[1px] rounded-full bg-red-600 text-white text-[9px] font-semibold shadow-sm">
                                                    URGENT
                                                </span>
                                            )}
                                            {task.category === "daily" && (
                                                <span className="px-2 py-[1px] rounded-full bg-emerald-600 text-white text-[9px] font-semibold shadow-sm">
                                                    DAILY
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faFlag} className={`text-[10px] ${task.finished_at ? "text-gray-400" : task.category === "urgent" ? "text-red-600" : "text-emerald-600"}`} />
                                    <span>
                                        Deadline:{" "}
                                        
                                        <strong className={`${task.finished_at ? "text-gray-600" : task.category === "urgent" ? "text-red-700 font-semibold" : "text-gray-800"}`}>
                                            {formatFullDate(task.deadline_at)}
                                        </strong>
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faCalendarDays} className={`text-[9px] ${task.finished_at ? "text-gray-400" : task.category === "urgent" ? "text-red-500" : "text-emerald-600"}`} />
                                    <span>
                                        Tugas Dimulai:{" "}
                                        <strong className="text-gray-800">
                                            {formatFullDate(task.start_date)}
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            <div className="w-full border-t border-gray-200 my-2"></div>

                            <div className={`text-xs sm:text-[12px] leading-relaxed mb-3 tracking-tight ${task.finished_at ? "text-gray-600" : "text-gray-700"}`}>
                                <button type="button" onClick={() => setDetailOpen(!detailOpen)} className={`flex justify-between items-center w-full font-semibold p-2 rounded-md transition-all duration-300 ease-in-out focus:outline-none ${task.finished_at ? "text-gray-500 hover:bg-gray-100" : task.category === "urgent" ? "text-gray-700 hover:bg-red-50 hover:text-red-700 hover:shadow-sm active:scale-[0.98]" : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm active:scale-[0.98]"}`}>
                                    <span>Detail Tugas</span>
                                    <FontAwesomeIcon icon={faChevronRight} className={`transition-transform duration-300 ease-in-out ${detailOpen ? task.finished_at ? "rotate-90 text-gray-400" : task.category === "urgent" ? "rotate-90 text-red-600" : "rotate-90 text-emerald-600" : "rotate-0"}`}/>
                                </button>

                                {detailOpen && (
                                    <div className={`pl-3 border-l-2 border-dashed mt-1 ${task.finished_at ? "border-gray-300" : task.category === "urgent" ? "border-red-300" : "border-emerald-300"}`}>
                                        <p className={`whitespace-pre-line py-1 text-justify ${task.finished_at ? "text-gray-600" : "text-gray-800"}`}>
                                            {task.deskripsi || "Belum ada deskripsi tugas."}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {task.finished_at && (
                                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-700 mt-2">
                                    <FontAwesomeIcon icon={faFileCircleCheck} className="text-gray-500 text-[10px]"
                                    />
                                    <span>
                                        Selesai pada: <strong>{formatFullDate(task.finished_at)}</strong>
                                    </span>
                                </div>
                            )}

                            {/* --- Footer --- */}
                            <div className="w-full border-t border-gray-200 mt-3 pt-2 flex justify-between items-center text-[10px] sm:text-[11px] text-gray-600 font-medium italic">
                                <div>
                                    Kadiv: <span className="font-normal">{task.nama_kadiv || "-"}</span>
                                </div>
                                <div>Dibuat: {formatLongDate(task.created_at)}</div>
                            </div>
                        </div>


                        {/* --- Form Upload Bukti: hanya tampil jika belum selesai --- */}
                        {!task.finished_at && (
                            <form
                                onSubmit={handleUpload}
                                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5"
                            >
                                <h3 className="text-base font-semibold text-gray-800 mb-1">
                                    Bukti Penyelesaian
                                </h3>
                                <p className="text-xs text-gray-500 mb-4 leading-snug">
                                    Unggah atau ambil foto langsung dari kamera sebagai bukti bahwa tugas ini
                                    telah diselesaikan.
                                </p>

                                <div className="flex gap-3 mb-3">
                                    <button
                                        type="button"
                                        onClick={openCamera}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl transition-all active:scale-[0.97]"
                                    >
                                        <FontAwesomeIcon icon={faCamera} />
                                        Ambil Foto
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

                                {photo && (
                                    <div className="mb-4">
                                        <img
                                            src={URL.createObjectURL(photo)}
                                            alt="Preview"
                                            className="rounded-xl border border-gray-100 shadow-sm w-full"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className={`w-full py-2 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${uploading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-emerald-700 hover:bg-emerald-800 active:scale-[0.97]"
                                        } transition-all duration-200`}
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                    {uploading ? "Mengunggah..." : "Kirim Bukti"}
                                </button>
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
