// src/pages/riwayat/SuratDinas.jsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCity, faPlaneDeparture, faPlaneArrival } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SearchBar } from "../../../components";

export default function SuratDinas() {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const user = getUserFromToken();
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);     // khusus error 500
    const [notFound, setNotFound] = useState(false); // khusus 404

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/surat-dinas/riwayat/${user.id_user}`);

                // cek status response
                if (res.status === 404) {
                    setNotFound(true);
                    return; // langsung keluar, jangan parsing JSON
                }
                if (res.status >= 500) {
                    throw new Error("Terjadi kesalahan server");
                }
                if (!res.ok) {
                    throw new Error("Gagal memuat data surat dinas");
                }

                const json = await res.json();
                const sorted = json.data.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setData(sorted);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiUrl, user.id_user]);

    const filtered = data.filter((item) =>
        `${item.keterangan} ${formatFullDate(item.tgl_berangkat)}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    // State prioritas
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;
    if (notFound) return <EmptyState message="Tidak ada riwayat surat dinas ditemukan." />;

    return (
        <>
            <div className="relative mb-4">
                <SearchBar onSearch={setQuery} placeholder="Cari riwayat surat dinas..." />
            </div>

            <div className="px-1 pb-6 max-h-[460px] overflow-y-auto space-y-3">
                {filtered.length === 0 ? (
                    <EmptyState message="Tidak ada riwayat surat dinas ditemukan." />
                ) : (
                    filtered.map((item, idx) => {
                        const isDalamKota = item.kategori === "1";
                        const statusColor =
                            item.status === 1
                                ? "bg-green-600"
                                : item.status === 2
                                    ? "bg-red-600"
                                    : "bg-yellow-500";
                        const statusText =
                            item.status === 1 ? "Disetujui" : item.status === 2 ? "Ditolak" : "Pending";

                        return (
                            <div
                                key={idx}
                                className="rounded-md border border-gray-200 bg-white p-4 py-2.5 shadow-sm hover:shadow transition-shadow"
                            >
                                {/* Header: kategori & status */}
                                <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                                    <h2 className="text-xs font-medium text-gray-800">
                                        <span className="text-[9px]">Tanggal Pengajuan : </span> <br />{" "}
                                        {formatFullDate(item.created_at)}
                                    </h2>
                                    <span
                                        className={`px-3 py-0.5 text-xs font-medium text-white rounded-full ${statusColor}`}
                                    >
                                        {statusText}
                                    </span>
                                </div>

                                {/* Jadwal */}
                                <div className="space-y-1.5 text-xs text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCity} className="w-4" />
                                        <span>
                                            Dinas: {item.kategori === "1" ? "Dalam Kota" : "Luar Kota"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faPlaneDeparture} className="w-4 text-green-500" />
                                        <span>
                                            Berangkat:{" "}
                                            {item.tgl_berangkat ? formatFullDate(item.tgl_berangkat) : "-"}
                                        </span>
                                    </div>

                                    {!isDalamKota && (
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faPlaneArrival} className="w-4 text-blue-500" />
                                            <span>
                                                Pulang:{" "}
                                                {item.tgl_pulang ? formatFullDate(item.tgl_pulang) : "Belum pulang"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Keterangan */}
                                <div className="mt-3">
                                    <h3 className="text-xs font-semibold text-gray-800 mb-0.5">
                                        Keterangan :
                                    </h3>
                                    <p className="text-[10px] text-gray-700 leading-snug">{item.keterangan}</p>
                                </div>

                                {/* Approval info */}
                                {item.approved_at && (
                                    <div className="mt-3 border-t border-gray-200 pt-2 flex justify-between text-[11px] text-gray-500">
                                        <span>
                                            Disetujui oleh:
                                            <span className="font-medium text-gray-700 pl-1">
                                                {item.approved_by || "-"}
                                            </span>
                                        </span>
                                        <span>{formatFullDate(item.approved_at)}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}
