import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader, MapRouteMulti } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import TimelineLokasi from "./TimelineLokasi";

/* ================= KONSTANTA ================= */
const STATUS_APPROVAL_MAP = {
    0: { label: "Menunggu Persetujuan", className: "bg-slate-50 text-slate-700 ring-1 ring-slate-200", },
    1: { label: "Disetujui", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", },
    2: { label: "Ditolak", className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", },
};


const formatMeter = (v) => {
    const value = Number(v);
    if (v === null || v === undefined || isNaN(value)) return "-";
    if (value >= 1000) {
        return `${(value / 1000).toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
        })} km`;
    }
    return `${value.toLocaleString("id-ID")} m`;
};

const formatRupiah = (v) => {
    const num = Number(v);
    if (v === null || v === undefined || isNaN(num)) return "-";
    return `Rp ${num.toLocaleString("id-ID")}`;
};


/* ================= MAIN COMPONENT ================= */
const DetailKunjungan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalJarakMap, setTotalJarakMap] = useState(null);

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
            const payload = {
                status,
                total_jarak: Number(totalJarakMap ?? data.total_jarak ?? 0),
            };
            const res = await fetchWithJwt(
                `${apiUrl}/trip/${data.id_trip}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            const json = await res.json();
            if (!res.ok || !json.success) {
                toast.error(json.message || "Gagal memperbarui status kunjungan");
                return;
            }
            toast.success(status === 1 ? "Kunjungan berhasil disetujui" : "Kunjungan berhasil ditolak");
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
        <div className="bg-white flex flex-col">
            {/* ================= HEADER ================= */}
            <SectionHeader title="Detail Kunjungan" subtitle={`${data.nama} • ${data.role}`} onBack={() => navigate(-1)} />

            {/* ================= INFO UTAMA ================= */}
            <div className="border rounded-xl bg-white overflow-hidden">
                {/* HEADER */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Informasi Kunjungan
                        </h3>
                        <p className="text-sm text-gray-500">
                            Ringkasan dan detail kunjungan karyawan
                        </p>
                    </div>

                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full
                        ${STATUS_APPROVAL_MAP[data.status]?.className}
                    `}
                    >
                        {STATUS_APPROVAL_MAP[data.status]?.label}
                    </span>
                </div>

                {/* BODY */}
                <div className="p-4 space-y-3">
                    {/* ================= BIODATA ================= */}
                    <SectionTitle title="Biodata Karyawan" />
                    <InfoGrid>
                        <InfoItem label="Nama Lengkap" value={data.nama} />
                        <InfoItem label="NIP" value={data.nip} />
                        <InfoItem label="Jabatan" value={data.role} />
                        <InfoItem label="Tanggal Kunjungan" value={formatFullDate(data.tanggal)} />
                    </InfoGrid>

                    <Divider />

                    {/* ================= KENDARAAN ================= */}
                    {data.kendaraan && (
                        <>
                            <SectionTitle title="Informasi Kendaraan" />
                            <InfoGrid>
                                <InfoItem label="Kendaraan" value={`${data.kendaraan.nama_kendaraan} (${data.kendaraan.tahun_kendaraan})`} />
                                <InfoItem label="Jenis BBM" value={data.kendaraan.nama_bb} />
                                <InfoItem label="Konsumsi BBM" value={`${data.kendaraan.konsumsi_bb} km / liter`} />
                                <InfoItem label="Harga BBM" value={formatRupiah(data.kendaraan.harga_bb)} />
                            </InfoGrid>
                            <Divider />
                        </>
                    )}

                    {/* ================= PERJALANAN ================= */}
                    <SectionTitle title="Ringkasan Perjalanan" />
                    <InfoGrid>
                        <InfoItem label="Total Jarak (Map)" value={formatMeter(totalJarakMap ?? data.total_jarak)} highlight />
                        <InfoItem label="Jumlah Lokasi" value={`${data.lokasi?.length || 0} titik`} />
                        <InfoItem label="Status Perjalanan" value={data.is_complete ? "Selesai" : "Belum Selesai"} />
                    </InfoGrid>
                    <Divider />

                    {/* ================= TUNJANGAN ================= */}
                    <SectionTitle title="Ringkasan Tunjangan" />

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left border-b">Total Jarak</th>
                                    <th className="px-3 py-2 text-left border-b">Harga BBM (Pertalite)</th>
                                    <th className="px-3 py-2 text-left border-b">Nominal Dasar</th>
                                    <th className="px-3 py-2 text-left border-b">46%</th>
                                    <th className="px-3 py-2 text-left border-b">Reimburse</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="text-gray-800">
                                    <td className="px-3 py-2 border-b">
                                        {formatMeter(totalJarakMap ?? data.total_jarak)}
                                    </td>
                                    <td className="px-3 py-2 border-b">
                                        {formatRupiah(data.kendaraan?.harga_bb)}
                                    </td>
                                    <td className="px-3 py-2 border-b">
                                        {formatRupiah(data.base_nominal)}
                                    </td>
                                    <td className="px-3 py-2 border-b">
                                        {formatRupiah(data.nominal_percent) || 0}
                                    </td>
                                    <td className="px-3 py-2 border-b font-semibold text-green-600">
                                        {formatRupiah(data.nominal)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* TOTAL */}
                    <div className="flex justify-end pt-2">
                        <p className="text-sm font-semibold text-gray-800">
                            Total Reimburse :{" "}
                            <span className="text-green-600">
                                {formatRupiah(data.nominal)}
                            </span>
                        </p>
                    </div>

                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                        <p className="font-semibold">Ketentuan :</p>
                        <ol className="list-decimal ml-4 space-y-1">
                            <li>
                                Jarak tempuh dihitung pulang–pergi (PP). <br />
                                Contoh: dari rumah ke gerai A → kantor → gerai B tetap dihitung.
                                Namun, apabila aktivitas hanya di kantor saja, maka jarak akan tetap 0
                                meskipun kunjungan disetujui atau ditolak.
                            </li>
                            <li>
                                Klaim BBM dihitung berdasarkan konsumsi BBM per liter dengan rumus:
                                <br />
                                <span className="italic">
                                    Klaim BBM (Rp) = (Jarak tempuh / Standar km per liter) × Harga BBM per liter + 46%
                                </span>
                            </li>
                        </ol>
                    </div>

                    {/* ================= ACTION APPROVAL ================= */}
                    {data.status !== 1 && data.status !== 2 && (
                        <>
                            <Divider />
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => handleUpdateStatus(2)} className="px-4 py-2 text-sm rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition">
                                    Tolak
                                </button>
                                <button onClick={() => handleUpdateStatus(1)} className="px-4 py-2 text-sm rounded-md bg-green-500 text-white font-semibold hover:bg-green-600 transition">
                                    Setujui
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ================= TIMELINE + MAP ================= */}
            {data.lokasi?.length > 0 && (
                <div className="border rounded-xl bg-white overflow-hidden my-6">
                    <div className="px-4 py-3 border-b">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Rangkaian Lokasi Kunjungan
                        </h3>
                        <p className="text-sm text-gray-500">
                            Urutan perjalanan dan rute yang ditempuh
                        </p>
                    </div>
                    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto lg:h-[490px] overflow-hidden">
                        {data.lokasi.length > 1 && (
                            <div className="order-1 lg:order-2 flex flex-col h-[220px] lg:h-full">
                                <h4 className="text-md font-bold tracking-wide text-gray-700 mb-3">
                                    Peta Rute Perjalanan
                                </h4>
                                <div className="flex-1 rounded-lg overflow-hidden border">
                                    <MapRouteMulti locations={data.lokasi} onDistanceCalculated={(meter) => setTotalJarakMap(meter)} />
                                </div>
                            </div>
                        )}
                        <div className="order-2 lg:order-1 flex flex-col min-h-0">
                            <h4 className="text-md font-bold tracking-wide text-gray-700 mb-3">
                                Detail Timeline Kunjungan
                            </h4>
                            <div className="flex-1 lg:overflow-y-auto scrollbar-green pr-1">
                                <TimelineLokasi lokasi={data.lokasi} apiUrl={apiUrl} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ================= SUB COMPONENT ================= */
const InfoItem = ({ label, value, highlight }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`font-semibold ${highlight ? "text-green-600" : "text-gray-800"}`}>
            {value}
        </p>
    </div>
);

const SectionTitle = ({ title }) => (
    <h4 className="text-sm font-bold uppercase tracking-wide text-gray-700">
        {title}
    </h4>
);

const Divider = () => (
    <div className="border-t border-dashed border-gray-200" />
);

const InfoGrid = ({ children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
    </div>
);

export default DetailKunjungan;