import { useState } from "react";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import { Modal } from "../../components";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSuitcaseRolling, faGasPump, faHotel} from "@fortawesome/free-solid-svg-icons";

const DetailAbsensiTimModal = ({ isOpen, onClose, data, onApprove, onReject}) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxSlides, setLightboxSlides] = useState([]);

    if (!data) return null;

    const openLightbox = (src, title) => {
        setLightboxSlides([{ src, title }]);
        setLightboxOpen(true);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`Detail Absensi Tim • ${data.nama}`} size="lg">
                <div className="space-y-4">
                    {data.absen.map((a) => (
                        <div key={a.id} className="bg-white border rounded-xl p-4 space-y-3">
                            {/* HEADER */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatFullDate(a.tanggal_absen)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Shift {a.nama_shift} ({a.shift_masuk} – {a.shift_pulang})
                                    </p>
                                </div>
                            </div>

                            {/* META */}
                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>
                                    Diajukan oleh{" "}
                                    <span className="font-medium text-gray-800">
                                        {a.created_by || "-"}
                                    </span>
                                </span>

                                {/* TUNJANGAN ICON */}
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    {a.dinas?.is_dinas && (
                                        <FontAwesomeIcon icon={faSuitcaseRolling} title="Tunjangan Dinas"/>
                                    )}
                                    {a.tunjangan?.transport && (
                                        <FontAwesomeIcon icon={faGasPump} title="Tunjangan Transport"/>
                                    )}
                                    {a.tunjangan?.night_shift && (
                                        <FontAwesomeIcon icon={faHotel} title="Night Shift"/>
                                    )}
                                </div>
                            </div>

                            {/* JAM ABSEN */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 rounded-lg p-2.5">
                                    <p className="text-[11px] text-gray-500">Masuk</p>
                                    <p className="font-medium">
                                        {a.absen_masuk ? formatTime(a.absen_masuk) : "-"}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-2.5">
                                    <p className="text-[11px] text-gray-500">Pulang</p>
                                    <p className="font-medium">
                                        {a.absen_pulang ? formatTime(a.absen_pulang) : "-"}
                                    </p>
                                </div>
                            </div>

                            {/* FOTO */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Masuk", file: a.foto_mulai },
                                    { label: "Pulang", file: a.foto_selesai },
                                ].map((f) => (
                                    <div key={f.label}>
                                        <p className="text-[11px] text-gray-500 mb-1">
                                            Foto {f.label}
                                        </p>
                                        {f.file ? (
                                            <button
                                                onClick={() =>
                                                    openLightbox(
                                                        `${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${f.file}`,
                                                        `Absen ${f.label}`
                                                    )
                                                }
                                                className="block"
                                            >
                                                <img src={`${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${f.file}`} alt={`Foto ${f.label}`} className="h-24 w-full object-cover rounded-lg border hover:opacity-90 transition"/>
                                            </button>
                                        ) : (
                                            <div className="h-24 flex items-center justify-center text-xs text-gray-400 border rounded-lg">
                                                Tidak ada foto
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* DESKRIPSI */}
                            {a.deskripsi && (
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {a.deskripsi}
                                </p>
                            )}

                            {/* ACTION */}
                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <button onClick={() => onReject(a)} className="px-4 py-1.5 text-sm rounded-md border bg-red-500 text-white hover:bg-red-600">
                                    Tolak
                                </button>
                                <button onClick={() => onApprove(a)} className="px-4 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700">
                                    Setujui
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={lightboxSlides}/>
        </>
    );
};

export default DetailAbsensiTimModal;
