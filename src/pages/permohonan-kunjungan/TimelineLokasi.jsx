import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { formatTime } from "../../utils/dateUtils";
import { faClock, faEye, faTrash, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

/* ================= KONSTANTA ================= */
const KATEGORI = {
    1: { label: "Berangkat Kunjungan", color: "bg-green-500" },
    2: { label: "Lokasi Kunjungan", color: "bg-blue-500" },
    3: { label: "Kunjungan Berakhir", color: "bg-red-500" },
};

/* ================= MAIN ================= */
const TimelineLokasi = ({ lokasi = [], apiUrl, statusTrip, onDeleted }) => {
    let checkpointCounter = 0;
    const checkpoints = lokasi.filter(l => l.kategori === 2);
    const isTripEnded = lokasi.some(l => l.kategori === 3);

    const getCheckpointIndex = (lok) =>
        checkpoints.findIndex(c => c === lok);

    return (
        <div className="relative">
            {lokasi.map((lok, idx) => {
                if (lok.kategori === 2) checkpointCounter++;
                const label = lok.kategori === 2 ? `Lokasi Kunjungan ${checkpointCounter}` : (KATEGORI[lok.kategori]?.label ?? "-");
                const isLast = idx === lokasi.length - 1;
                return (
                    <TimelineItem
                        key={idx}
                        lok={lok}
                        label={label}
                        color={KATEGORI[lok.kategori]?.color}
                        apiUrl={apiUrl}
                        isLast={isLast}
                        statusTrip={statusTrip}
                        onDeleted={onDeleted}
                        checkpointIndex={getCheckpointIndex(lok)}
                        checkpointTotal={checkpoints.length}
                        isTripEnded={isTripEnded}
                    />
                );
            })}
        </div>
    );
};


/* ================= ITEM ================= */
const TimelineItem = ({ lok, label, color, apiUrl, isLast, statusTrip, onDeleted, checkpointIndex, checkpointTotal, isTripEnded,}) => {
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
        const result = await Swal.fire({
            title: "Hapus Checkpoint?",
            text: "Checkpoint yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626", // merah
            cancelButtonColor: "#6b7280", // abu-abu
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetchWithJwt(
                `${apiUrl}/trip/lokasi/${lok.id_trip_lokasi}`,
                { method: "DELETE" }
            );
            const json = await res.json();

            if (!res.ok || !json.success) {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: json.message || "Gagal menghapus checkpoint",
                });
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Checkpoint berhasil dihapus",
                timer: 2000,
                showConfirmButton: false,
            });

            onDeleted?.();
        } catch {
            Swal.fire({
                icon: "error",
                title: "Kesalahan",
                text: "Terjadi kesalahan saat menghapus lokasi",
            });
        }
    };

    return (
        <div className="relative flex gap-4">
            <div className="relative flex justify-center w-8">
                {!isLast && <div className="absolute top-0 bottom-0 w-px bg-gray-300" />}
                <div
                    className={`relative z-10 mt-1 w-4 h-4 rounded-full ${color} ring-4 ring-white shadow-md`}
                />
            </div>
            <div className="flex-1 pb-10">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                        {label}
                    </p>

                    {lok.kategori === 2 && isKadiv && statusTrip === 0 && (
                        <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 active:bg-red-700 transition">
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            Hapus
                        </button>
                    )}
                </div>
                <p className="text-md text-gray-700 font-medium mt-0.5">{lok.nama_lokasi}</p>
                <div className="mt-1 space-y-1.5 text-xs">

                    {/* ================= MULAI KUNJUNGAN ================= */}
                    {lok.kategori === 1 && lok.jam_mulai && (
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-green-600" />
                            <span className="font-medium text-gray-700 text-sm">Berangkat Kunjungan</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] text-green-600" />
                            <span className="text-gray-700 text-sm">{formatTime(lok.jam_mulai)}</span>
                        </div>
                    )}

                    {/* ================= CHECK-IN ================= */}
                    {lok.kategori === 2 && lok.jam_mulai && (
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-green-600" />
                            <span className="font-medium text-gray-700 text-sm">Mulai Kunjungan</span>
                            <span className="text-gray-700 text-sm">{formatTime(lok.jam_mulai)}</span>

                            {/* ABSEN MASUK */}
                            {checkpointIndex === 0 && (
                                <span className="ml-2 flex items-center gap-1 font-semibold text-green-700">
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                    Absen Masuk
                                </span>
                            )}
                        </div>
                    )}

                    {/* ================= CHECK-OUT ================= */}
                    {lok.kategori === 2 && lok.jam_selesai && (
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-red-600" />
                            <span className="font-medium text-gray-700 text-sm">Selesai Kunjungan</span>
                            <span className="text-gray-700 text-sm">{formatTime(lok.jam_selesai)}</span>

                            {/* ABSEN PULANG */}
                            {checkpointIndex === checkpointTotal - 1 && isTripEnded && (
                                <span className="ml-2 flex items-center gap-1 font-semibold text-red-700">
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                    Absen Pulang
                                </span>
                            )}
                        </div>
                    )}

                    {/* ================= KUNJUNGAN BERAKHIR ================= */}
                    {lok.kategori === 3 && lok.jam_selesai && (
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="text-red-600" />
                            <span className="font-medium text-gray-700 text-sm">Kunjungan Berakhir</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px] text-red-600" />
                            <span className="text-gray-700 text-sm">{formatTime(lok.jam_selesai)}</span>
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
