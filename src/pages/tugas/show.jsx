import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCircleCheck, faUpload, faCamera, faChevronDown, faChevronUp, faCalendarAlt, faUserTie, faFlag, faChevronRight, faTrash, faClipboardList, } from "@fortawesome/free-solid-svg-icons";
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
                        {/* Kartu Tugas */}
                        <div className={`relative w-full rounded-xl border border-gray-200 bg-white shadow-sm mb-3 p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-[1px] ${task.finished_at ? "opacity-70" : ""}`}>
                            <h1 className={`text-[13px] sm:text-[14px] uppercase font-semibold leading-snug mb-2 ${task.finished_at ? "text-gray-600" : "text-gray-900"}`}>
                                {task.nama_tugas}
                            </h1>

                            <div className={`flex items-center justify-between text-[10px] mb-2 ${task.finished_at ? "text-gray-500" : "text-gray-700"}`}>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-gray-700">Tenggat Waktu</span>
                                    <strong className={`${task.finished_at ? "text-gray-600" : task.category === "urgent" ? "text-red-700" : "text-gray-800"}`}>
                                        {formatFullDate(task.deadline_at)}
                                    </strong>
                                </div>

                                <div className={`self-center px-2 py-[2px] rounded-full text-white text-[10px] font-semibold tracking-wide shadow-sm
                                    ${task.finished_at ? "bg-gray-400/90" : task.category === "urgent" ? "bg-red-600/90" : task.category === "daily" ? "bg-emerald-600/90" : "bg-gray-500/80"}`}>
                                    {task.category?.toUpperCase()} TASK
                                </div>
                            </div>

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
                        </div>

                        {/* Kartu Perintah Tugas */}
                        <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
                            <div className={`flex justify-between items-center p-3 cursor-pointer transition-colors duration-150 hover:bg-gray-200 ${task.finished_at ? "bg-gray-50" : task.category === "urgent" ? "bg-red-50/20" : "bg-emerald-50/20"}`} onClick={toggleOpen}>
                                <span className="font-medium text-gray-800 text-xs uppercase">
                                    <FontAwesomeIcon icon={faClipboardList} className="text-gray-600 mr-2" />
                                    Deskripsi Perintah Tugas
                                </span>
                                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronRight} className="text-gray-500 transition-transform duration-150" />
                            </div>

                            <div className={`px-3 ${isOpen ? "p-2 border-t border-gray-100" : "py-0 border-t-0"} 
                                overflow-hidden ${isOpen ? "max-h-[400px] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"}`}>
                                <p className="text-gray-800 text-xs leading-relaxed tracking-wide text-justify break-words whitespace-pre-line">
                                    {task.deskripsi ? task.deskripsi : "Belum ada deskripsi tugas."}
                                </p>
                            </div>

                        </div>

                        {task.finished_at && task.bukti_foto ? (
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 py-3 space-y-3">
                                <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Bukti Penyelesaian
                                    </h3>

                                    {task.status_tugas === 0 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                            Pending
                                        </span>
                                    )}
                                    {task.status_tugas === 1 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                            Disetujui
                                        </span>
                                    )}
                                    {task.status_tugas === 2 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                                            Ditolak
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                {!isCameraOpen && (
                                    <div className="relative border border-gray-200 rounded-xl overflow-hidden">
                                    <img src={photo || `${apiUrl}/img/tugas/${task.bukti_foto}`} alt="Bukti Tugas" className="w-full h-52 object-cover scale-x-[-1]"/>
                                    </div>
                                )}

                                {Number(task.status_tugas) === 2 && !isCameraOpen && !photo && (
                                    <div className="flex justify-end">
                                    <button type="button" onClick={() => setIsCameraOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md transition">
                                        Edit Foto
                                    </button>
                                    </div>
                                )}

                                {/* Kamera aktif */}
                                {isCameraOpen && (
                                    <div className="space-y-2">
                                    <div className="w-full aspect-[4/3] rounded-md overflow-hidden border border-gray-200">
                                        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} className="w-full h-full object-cover scale-x-[-1]" mirrored={facingMode === "user"}/>
                                    </div>

                                    <div className="flex gap-2">
                                        <button type="button" onClick={switchCamera} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                                        Ganti Kamera
                                        </button>
                                        <button type="button" onClick={() => { capturePhoto(); setIsCameraOpen(false);}} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                                        Ambil Foto
                                        </button>
                                    </div>

                                    <button type="button" onClick={() => setIsCameraOpen(false)} className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md mt-2">
                                        Batalkan
                                    </button>
                                    </div>
                                )}

                                {photo && !isCameraOpen && (
                                    <div className="flex gap-2">
                                    <button type="button" onClick={() => setPhoto(null)} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
                                        Batal
                                    </button>
                                    <button type="button" onClick={handleUpload} disabled={uploading} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:bg-gray-400">
                                        {uploading ? "Mengunggah..." : "Kirim Bukti"}
                                    </button>
                                    </div>
                                )}
                                </div>
                            </div>
                        ) : !task.finished_at ? (
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 space-y-4">
                                <h3 className="text-base font-semibold text-gray-900">Serahkan Bukti Tugas</h3>

                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Ambil foto langsung dari kamera sebagai bukti tugas selesai. Pastikan foto jelas.
                                </p>

                                {!isCameraOpen && !photo && (
                                    <button onClick={() => setIsCameraOpen(true)} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition">
                                        Buka Kamera
                                    </button>
                                )}

                                {/* Tampilan kamera */}
                                {isCameraOpen && !photo && (
                                    <div className="space-y-2">
                                        <div className="w-full aspect-[4/3] rounded-md overflow-hidden border border-gray-200">
                                            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} className="w-full h-full object-cover scale-x-[-1]" mirrored={facingMode === "user"}/>
                                        </div>

                                        <div className="flex gap-2">
                                            <button type="button" onClick={switchCamera} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition">
                                                Switch Kamera
                                            </button>
                                            <button type="button" onClick={() => { capturePhoto(); setIsCameraOpen(false);}} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition">
                                                Ambil Foto
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Preview foto */}
                                {photo && (
                                    <div className="space-y-3">
                                        <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200">
                                            <img src={photo} alt="Preview" className="w-full h-52 object-cover rounded-2xl scale-x-[-1]" />
                                        </div>

                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => setPhoto(null)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition">
                                                Batal
                                            </button>
                                            <button type="submit" disabled={uploading} onClick={handleUpload} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                                                {uploading ? "Mengunggah..." : "Kirim Bukti"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </>
                )}
            </div>
            <FooterMainBar />
        </MobileLayout>
    );
};

export default DetailTugasMobile;
