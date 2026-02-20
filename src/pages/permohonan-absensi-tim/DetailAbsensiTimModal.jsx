import { useState } from "react";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import { Modal } from "../../components";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faLocationDot, faClock } from "@fortawesome/free-solid-svg-icons";

const DetailAbsensiTimModal = ({ isOpen, onClose, data, onApprove, onReject }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxSlides, setLightboxSlides] = useState([]);

    if (!data) return null;

    const openLightbox = (src, title) => {
        setLightboxSlides([{ src, title }]);
        setLightboxOpen(true);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`Detail Absensi Tim • ${data.nama}`} note="Detail permohonan absensi tim yang diajukan oleh team leader" size="lg">
                <div className="space-y-4">
                    {data.absen.map((a) => (
                        <div key={a.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 space-y-3">
                            {/* HEADER */}
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">

                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                                        {formatFullDate(a.tanggal_absen)}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-gray-800">
                                                {a.nama_shift}
                                            </span>
                                        </div>

                                        <span className="hidden sm:inline text-gray-300">•</span>

                                        <div className="flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faClock} className="text-emerald-600" />
                                            <span>
                                                {a.shift_masuk} – {a.shift_pulang}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* STATUS / DIAJUKAN OLEH */}
                                <div className="flex sm:justify-end">
                                    <div className="flex sm:justify-end">
                                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-emerald-700 bg-emerald-50/40 rounded-md whitespace-nowrap">
                                            <FontAwesomeIcon icon={faUserTie} className="text-emerald-600 text-xs"/>
                                            <span className="opacity-80">
                                                Diajukan oleh
                                            </span>
                                            <span className="font-medium text-emerald-800">
                                                {a.created_by || "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* SEPARATOR */}
                            <div className="h-px bg-gray-100" />

                            {/* WAKTU, LOKASI & BUKTI */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                {/* MASUK */}
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-600 uppercase mb-2">
                                        Absen Masuk
                                    </p>

                                    <div className="flex gap-3">
                                        {/* FOTO */}
                                        <div className="shrink-0">
                                            {a.foto_mulai ? (
                                                <button
                                                    onClick={() =>
                                                        openLightbox(
                                                            `${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${a.foto_mulai}`,
                                                            "Foto Absen Masuk"
                                                        )
                                                    }
                                                    className="group relative"
                                                >
                                                    <img
                                                        src={`${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${a.foto_mulai}`}
                                                        alt="Foto Absen Masuk"
                                                        className="h-14 w-14 object-cover rounded-md border hover:opacity-90 transition"
                                                    />
                                                    <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/10 transition" />
                                                </button>
                                            ) : (
                                                <div className="h-14 w-14 flex items-center justify-center text-[10px] text-gray-400 border rounded-md">
                                                    Tidak ada
                                                </div>
                                            )}
                                        </div>

                                        {/* INFO */}
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            {/* TANGGAL */}
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {a.absen_masuk ? formatFullDate(a.absen_masuk) : "-"}
                                            </p>

                                            {/* JAM */}
                                            <p className="text-xs text-gray-500">
                                                {a.absen_masuk ? formatTime(a.absen_masuk) : "-"}
                                            </p>

                                            {/* LOKASI */}
                                            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                                                <FontAwesomeIcon
                                                    icon={faLocationDot}
                                                    className="mt-0.5 text-emerald-600"
                                                />
                                                <span className="line-clamp-2">
                                                    {a.tempat_mulai || "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PULANG */}
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-[11px] font-semibold tracking-wide text-gray-600 uppercase mb-2">
                                        Absen Pulang
                                    </p>

                                    <div className="flex gap-3">
                                        {/* FOTO */}
                                        <div className="shrink-0">
                                            {a.foto_selesai ? (
                                                <button onClick={() => openLightbox(`${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${a.foto_selesai}`, "Foto Absen Pulang")} className="group relative">
                                                    <img src={`${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${a.foto_selesai}`} alt="Foto Absen Pulang" className="h-14 w-14 object-cover rounded-md border hover:opacity-90 transition" />
                                                    <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/10 transition" />
                                                </button>
                                            ) : (
                                                <div className="h-14 w-14 flex items-center justify-center text-[10px] text-gray-400 border rounded-md">
                                                    Tidak ada
                                                </div>
                                            )}
                                        </div>

                                        {/* INFO */}
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            {/* TANGGAL */}
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {a.absen_pulang ? formatFullDate(a.absen_pulang) : "-"}
                                            </p>

                                            {/* JAM */}
                                            <p className="text-xs text-gray-500">
                                                {a.absen_pulang ? formatTime(a.absen_pulang) : "-"}
                                            </p>

                                            {/* LOKASI */}
                                            <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                                                <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 text-emerald-600" />
                                                <span className="line-clamp-2">
                                                    {a.tempat_selesai || "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* KETERANGAN */}
                            {a.deskripsi && (
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    <span className="font-medium text-gray-800">Keterangan Kendala:</span>{" "}
                                    {a.deskripsi}
                                </p>
                            )}

                            {/* ACTION */}
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                <button onClick={() => onReject(a)} className="px-4 py-1.5 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] transition">
                                    Tolak
                                </button>
                                <button onClick={() => onApprove(a)} className="px-4 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition">
                                    Setujui
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={lightboxSlides} />
        </>
    );
};

export default DetailAbsensiTimModal;
