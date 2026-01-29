import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader, MapRouteMulti } from "../../../components";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatFullDate, formatTime } from "../../../utils/dateUtils";
import toast from "react-hot-toast";

/* ================= KONSTANTA ================= */
const KATEGORI_MAP = {
    1: { label: "Mulai Kunjungan", color: "bg-blue-100 text-blue-700" },
    2: { label: "Checkpoint", color: "bg-amber-100 text-amber-700" },
    3: { label: "Akhiri Kunjungan", color: "bg-emerald-100 text-emerald-700" },
};

const STATUS_APPROVAL_MAP = {
    0: { label: "Menunggu Persetujuan", color: "bg-gray-100 text-gray-700" },
    1: { label: "Disetujui", color: "bg-green-100 text-green-700" },
    2: { label: "Ditolak", color: "bg-red-100 text-red-700" },
};


const formatMeter = (v = 0) => {
    const value = Number(v);

    if (value >= 1000) {
        return `${(value / 1000).toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
        })} km`;
    }

    return `${value.toLocaleString("id-ID")} m`;
};


/* ================= MAIN COMPONENT ================= */
const DetailKunjungan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await fetchWithJwt(`${apiUrl}/trip/${id}`);
            const json = await res.json();

            if (!json.success || !json.data) {
                setData(null);
                return;
            }

            setData(json.data);
        } catch (err) {
            setError("Gagal memuat detail kunjungan");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/trip/${data.id_trip}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }), // status = 1 atau 2
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                toast.error(json.message || "Gagal memperbarui status kunjungan");
                return;
            }

            toast.success(
                status === 1
                    ? "Kunjungan berhasil disetujui"
                    : "Kunjungan berhasil ditolak"
            );

            fetchDetail();
        } catch (err) {
            toast.error("Terjadi kesalahan saat memperbarui status");
        }
    };


    useEffect(() => {
        fetchDetail();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} onRetry={fetchDetail} />;
    if (!data) return <EmptyState message="Data kunjungan tidak ditemukan" />;

    return (
        <div className="bg-white flex flex-col gap-6">
            {/* ================= HEADER ================= */}
            <SectionHeader title="Detail Kunjungan" subtitle={`${data.nama} • ${data.role}`} onBack={() => navigate(-1)} />

            {/* ================= INFO UTAMA ================= */}
            <div className="border rounded-xl overflow-hidden bg-white">

                {/* HEADER CARD */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">
                            Informasi Utama
                        </h3>
                        <p className="text-xs text-gray-500">
                            Ringkasan data kunjungan
                        </p>
                    </div>

                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_APPROVAL_MAP[data.status]?.color}`}>
                        {STATUS_APPROVAL_MAP[data.status]?.label || "-"}
                    </span>
                </div>

                {/* BODY */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem label="Nama" value={data.nama} />
                    <InfoItem label="NIP" value={data.nip} />
                    <InfoItem label="Tanggal" value={formatFullDate(data.tanggal)} />
                    <InfoItem label="Status Perjalanan" value={data.is_complete ? "Perjalanan Selesai" : "Belum Selesai"} highlight/>
                    <InfoItem label="Total Jarak" value={formatMeter(data.total_jarak)} />
                    <InfoItem label="Nominal" value={`Rp ${data.nominal.toLocaleString("id-ID")}`} />

                    {/* ACTION */}
                    {data.status !== 1 && data.status !== 2 && (
                        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                            <button onClick={() => handleUpdateStatus(2)} className="px-4 py-2 text-sm rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition">
                                Tolak
                            </button>
                            <button onClick={() => handleUpdateStatus(1)} className="px-4 py-2 text-sm rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 transition">
                                Setujui
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= MAP ================= */}
            {data.lokasi?.length > 1 && (
                <div className="border rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">
                        Rute Perjalanan
                    </h3>
                    <MapRouteMulti locations={data.lokasi} />
                </div>
            )}

            {/* ================= DETAIL LOKASI ================= */}
            <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Detail Lokasi Kunjungan
                </h3>

                <div className="space-y-4">
                    {data.lokasi.map((lok, idx) => {
                        const kategori = KATEGORI_MAP[lok.kategori];
                        const checkpointNumber =
                            lok.kategori === 2 ? data.lokasi
                                .slice(0, idx + 1)
                                .filter((l) => l.kategori === 2).length
                                : null;
                        const photos = [
                            lok.photo_mulai && { src: `${apiUrl}/uploads/img/kunjungan/${lok.photo_mulai}`, },
                            lok.photo_selesai && { src: `${apiUrl}/uploads/img/kunjungan/${lok.photo_selesai}`, },
                        ].filter(Boolean);
                        return (
                            <LokasiCard key={idx} index={idx} lok={lok} kategori={kategori} photos={photos} checkpointNumber={checkpointNumber} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/* ================= SUB COMPONENT ================= */
const InfoItem = ({ label, value, highlight }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-semibold ${highlight ? "text-green-600" : "text-gray-800"}`}>
            {value}
        </p>
    </div>
);

const DetailItem = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
    </div>
);

const LokasiCard = ({ index, lok, kategori, photos, checkpointNumber }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border rounded-xl p-4 hover:shadow-sm transition">
            <div className="flex justify-between items-start gap-3">
                <div>
                    <p className="font-semibold text-gray-800">
                        {index + 1}. {lok.nama_lokasi}
                    </p>
                    {lok.deskripsi && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            {lok.deskripsi}
                        </p>
                    )}
                </div>

                <span className={`text-xs px-2 py-1 rounded ${kategori?.color}`}>
                    {lok.kategori === 2 ? `${kategori.label} ${checkpointNumber}` : kategori.label}
                </span>
            </div>
            <div className="border-t my-3" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <DetailItem label="Rentang Jam" value={`${formatTime(lok.jam_mulai)} – ${formatTime(lok.jam_selesai)}`} />
                <DetailItem label="Jarak Karyawan Dengan Titik Lokasi" value={`${formatMeter(lok.jarak_mulai)}`} />
                <DetailItem label="Jarak Antar Lokasi Sebelumnya" value={formatMeter(lok.jarak_lokasi)} />
            </div>

            {photos.length > 0 && (
                <>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {photos.map((p, i) => (
                            <div key={i} className="group relative w-20 aspect-square cursor-pointer" onClick={() => setOpen(true)}>
                                <img src={p.src} alt="foto lokasi" className="w-full h-full rounded-md object-cover border group-hover:opacity-90 transition" />

                                <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white">
                                    {i === 0 ? "Mulai" : "Selesai"}
                                </span>
                            </div>
                        ))}
                    </div>

                    <Lightbox open={open} close={() => setOpen(false)} slides={photos} />
                </>
            )}
        </div>
    );
};

export default DetailKunjungan;
