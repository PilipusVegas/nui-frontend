import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { formatTime, formatForDB } from "../../utils/dateUtils";
import { faClock, faEye, faTrash, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { Modal } from "../../components";


/* ================= KONSTANTA ================= */
const KATEGORI = {
    1: { label: "Berangkat Kunjungan", color: "bg-green-500" },
    2: { label: "Lokasi Kunjungan", color: "bg-blue-500" },
};

/* ================= MAIN ================= */
const TimelineLokasi = ({ lokasi = [], apiUrl, statusTrip, onDeleted }) => {
    let checkpointCounter = 0;
    const checkpoints = lokasi.filter(l => l.kategori === 2);

    const getCheckpointIndex = (lok) =>
        checkpoints.indexOf(lok);

    return (
        <div className="relative">
            {lokasi.map((lok, idx) => {
                if (lok.kategori === 2) checkpointCounter++;
                const label = lok.kategori === 2 ? `Lokasi Kunjungan ${checkpointCounter}` : (KATEGORI[lok.kategori]?.label ?? "-");
                const isLast = idx === lokasi.length - 1;
                return (
                    <TimelineItem key={idx} lok={lok} label={label} color={KATEGORI[lok.kategori]?.color} apiUrl={apiUrl} isLast={isLast} statusTrip={statusTrip} onDeleted={onDeleted} checkpointIndex={getCheckpointIndex(lok)} checkpointTotal={checkpoints.length} />
                );
            })}
        </div>
    );
};


/* ================= ITEM ================= */
const TimelineItem = ({ lok, label, color, apiUrl, isLast, statusTrip, onDeleted, checkpointIndex, checkpointTotal, }) => {
    const [open, setOpen] = useState(false);
    const user = getUserFromToken();
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [checkoutTime, setCheckoutTime] = useState("");
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


    const handleSubmitCheckout = async () => {
        if (!checkoutTime) {
            toast.error("Silakan pilih tanggal dan jam check-out");
            return;
        }
        // format waktu untuk database
        const waktu = formatForDB(checkoutTime);
        setLoadingCheckout(true);
        const toastId = toast.loading("Memproses check-out...");
        try {
            const res = await fetchWithJwt(
                `${apiUrl}/trip/checkout/${lok.id_trip_lokasi}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        waktu: waktu
                    }),
                }
            );
            const json = await res.json();
            if (!res.ok || !json.success) {
                toast.dismiss(toastId);
                toast.error(json.message || "Gagal melakukan check-out");
                return;
            }
            toast.dismiss(toastId);
            toast.success("Check-out berhasil dibantu");
            setShowCheckoutModal(false);
            setCheckoutTime("");
            onDeleted?.();
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Terjadi kesalahan saat melakukan check-out");
        } finally {
            setLoadingCheckout(false);
        }
    };


    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Hapus Checkpoint?",
            text: "Checkpoint yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
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
                toast.error(json.message || "Gagal menghapus checkpoint");
                return;
            }
            toast.success("Checkpoint berhasil dihapus");
            onDeleted?.();
        } catch {
            toast.error("Terjadi kesalahan saat menghapus lokasi");
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
                            {checkpointIndex === checkpointTotal - 1 && lok.jam_selesai && (
                                <span className="ml-2 flex items-center gap-1 font-semibold text-red-700">
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                    Absen Pulang
                                </span>
                            )}
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

                {/* ================= BANTU CHECKOUT ================= */}
                {lok.kategori === 2 &&
                    lok.jam_mulai &&
                    !lok.jam_selesai &&
                    checkpointIndex === checkpointTotal - 1 &&
                    statusTrip === 0 && isKadiv && (
                        <div className="mt-3">
                            <button onClick={() => setShowCheckoutModal(true)} disabled={loadingCheckout || statusTrip !== 0} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-md shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                <FontAwesomeIcon icon={faClock} />
                                Bantu Check-out dari lokasi ini
                            </button>
                        </div>
                    )}
            </div>

            <Modal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} title="Bantu Check-out Karyawan" note="Masukkan tanggal dan jam selesai kunjungan."
                size="sm"
                footer={
                    <div className="flex gap-2">
                        <button onClick={() => setShowCheckoutModal(false)} className="px-4 py-2 text-sm bg-gray-300 rounded-md hover:bg-gray-300">
                            Batal
                        </button>
                        <button onClick={handleSubmitCheckout} className="px-4 py-2 text-sm text-white bg-orange-500 rounded-md hover:bg-orange-600">
                            Simpan Check-out
                        </button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                        Tanggal & Jam Check-out
                    </label>

                    <input type="datetime-local" value={checkoutTime} onChange={(e) => setCheckoutTime(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />

                    <p className="text-xs text-gray-500">
                        Pastikan waktu yang dimasukkan sesuai dengan kondisi sebenarnya di lapangan.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default TimelineLokasi;
