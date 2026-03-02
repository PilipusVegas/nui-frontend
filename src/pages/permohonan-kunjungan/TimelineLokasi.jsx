import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { formatTime } from "../../utils/dateUtils";
import { faClock, faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

/* ================= KONSTANTA ================= */
const KATEGORI = {
    1: { label: "Mulai Kunjungan", color: "bg-green-500" },
    2: { label: "Checkpoint", color: "bg-blue-500" },
    3: { label: "Kunjungan Berakhir", color: "bg-red-500" },
};

/* ================= MAIN ================= */
const TimelineLokasi = ({ lokasi = [], apiUrl, onDeleted }) => {
    let checkpointCounter = 0;

    return (
        <div className="relative">
            {lokasi.map((lok, idx) => {
                if (lok.kategori === 2) checkpointCounter++;
                const label =
                    lok.kategori === 2
                        ? `Checkpoint ${checkpointCounter}`
                        : (KATEGORI[lok.kategori]?.label ?? "-");
                const isLast = idx === lokasi.length - 1;
                return (
                    <TimelineItem
                        key={idx}
                        lok={lok}
                        label={label}
                        color={KATEGORI[lok.kategori]?.color}
                        apiUrl={apiUrl}
                        isLast={isLast}
                        onDeleted={onDeleted}
                    />
                );
            })}
        </div>
    );
};


/* ================= ITEM ================= */
const TimelineItem = ({
    lok,
    label,
    color,
    apiUrl,
    isLast,
    onDeleted,
}) => {
    const [open, setOpen] = useState(false);
    const user = getUserFromToken();
    const isKadiv = user?.is_kadiv?.status === true;
    const photos = [
        lok.photo_mulai && {
            src: `${apiUrl}/uploads/img/kunjungan/${lok.photo_mulai}`,
            label: "Mulai",
        },
        lok.photo_selesai && {
            src: `${apiUrl}/uploads/img/kunjungan/${lok.photo_selesai}`,
            label: "Selesai",
        },

    ].filter(Boolean);

    const handleDelete = async () => {
        if (!window.confirm("Yakin ingin menghapus checkpoint ini?")) return;

        try {
            const res = await fetchWithJwt(
                `${apiUrl}/trip/lokasi/${lok.id_trip_lokasi}`,
                { method: "DELETE" }
            );

            const json = await res.json();

            if (!res.ok || !json.success) {
                toast.error(json.message || "Gagal menghapus checkpoint");
                return;
            }

            toast.success("Checkpoint berhasil dihapus");
            onDeleted?.(); // refresh detail
        } catch {
            toast.error("Terjadi kesalahan saat menghapus lokasi");
        }
    };

    return (
        <div className="relative flex gap-4">
            {/* DOT + LINE */}
            <div className="relative flex justify-center w-8">
                {/* GARIS (HANYA JIKA BUKAN ITEM TERAKHIR) */}
                {!isLast && <div className="absolute top-0 bottom-0 w-px bg-gray-300" />}

                {/* DOT */}
                <div
                    className={`relative z-10 mt-1 w-4 h-4 rounded-full ${color} ring-4 ring-white shadow-md`}
                />
            </div>

            {/* CONTENT */}
            <div className="flex-1 pb-10">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                        {label}
                    </p>

                    {lok.kategori === 2 && isKadiv && (
                        <button
                            onClick={handleDelete}
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Hapus
                        </button>
                    )}
                </div>

                <p className="text-md text-gray-700 font-medium mt-0.5">{lok.nama_lokasi}</p>

                <div className="flex items-center gap-4 text-xs mt-1">
                    {/* MULAI KUNJUNGAN → JAM MULAI SAJA */}
                    {lok.kategori === 1 && lok.jam_mulai && (
                        <div className="flex items-center gap-1 text-green-600">
                            <FontAwesomeIcon icon={faClock} />
                            <span>{formatTime(lok.jam_mulai)}</span>
                        </div>
                    )}

                    {/* CHECKPOINT → BOLEH KEDUANYA */}
                    {lok.kategori === 2 && lok.jam_mulai && (
                        <div className="flex items-center gap-1 text-green-600">
                            <FontAwesomeIcon icon={faClock} />
                            <span>{formatTime(lok.jam_mulai)}</span>
                        </div>
                    )}

                    {lok.kategori === 2 && lok.jam_selesai && (
                        <div className="flex items-center gap-1 text-red-600">
                            <FontAwesomeIcon icon={faClock} />
                            <span>{formatTime(lok.jam_selesai)}</span>
                        </div>
                    )}

                    {/* KUNJUNGAN BERAKHIR → JAM SELESAI SAJA */}
                    {lok.kategori === 3 && lok.jam_selesai && (
                        <div className="flex items-center gap-1 text-red-600">
                            <FontAwesomeIcon icon={faClock} />
                            <span>{formatTime(lok.jam_selesai)}</span>
                        </div>
                    )}
                </div>

                {lok.deskripsi && (
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">
                            Keterangan:
                        </span>{" "}
                        {lok.deskripsi}
                    </p>
                )}

                {photos.length > 0 && (
                    <>
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {photos.map((p, i) => (
                                <div key={i} className="relative w-20 aspect-square cursor-pointer group" onClick={() => setOpen(true)}>
                                    <img src={p.src} alt="foto kunjungan" className="w-full h-full object-cover rounded-md border" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                        <FontAwesomeIcon icon={faEye} className="text-white text-lg" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 text-[10px] px-1 bg-black/60 text-white rounded-tl">
                                        {p.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Lightbox open={open} close={() => setOpen(false)} slides={photos} />
                    </>
                )}
            </div>
        </div>
    );
};

export default TimelineLokasi;
