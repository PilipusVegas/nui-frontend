// src/pages/riwayat/Lembur.jsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faClock, faMapMarkerAlt, } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate, formatTime } from "../../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SearchBar } from "../../../components";

export default function Lembur() {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const user = getUserFromToken();
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/lembur/riwayat/${user.id_user}`);

                if (res.status === 404) {
                    // Data tidak ditemukan → tampilkan EmptyState
                    setData([]);
                    return; // jangan lempar error
                }

                if (!res.ok) throw new Error("Gagal memuat data lembur");

                const json = await res.json();
                const sorted = json.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setData(sorted);
            } catch (e) {
                // Hanya error selain 404
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiUrl, user.id_user]);


    const filtered = data.filter((item) =>
        `${item.lokasi} ${formatFullDate(item.tanggal)}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;

    return (
        <>
            {/* Search bar */}
            <div className="relative mb-4">
                <SearchBar onSearch={setQuery} placeholder="Cari riwayat lembur..." />
            </div>

            <div className="px-1 pb-6 max-h-[460px] overflow-y-auto space-y-4">
                {filtered.length === 0 ? (
                    <EmptyState message="Tidak ada riwayat lembur ditemukan." />
                ) : (
                    filtered.map((item) => (
                        <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                            {/* Header: Tanggal & Status */}
                            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                                <div className="text-sm font-semibold text-gray-800">
                                    {formatFullDate(item.tanggal)}
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${item.status === 1 ? "bg-green-500" : item.status === 2 ? "bg-red-500" : "bg-yellow-500"}`}>
                                    {item.status === 1 ? "Disetujui" : item.status === 2 ? "Ditolak" : "Pending"}
                                </span>
                            </div>

                            {/* Waktu mulai & selesai */}
                            <div className="flex justify-center items-center gap-8 text-sm text-gray-700 mb-3">
                                <div className="flex items-center gap-1">
                                    <span>
                                        Mulai :
                                        <span className={`pl-1 font-semibold ${item.jam_mulai ? "text-green-600" : "text-gray-400"}`}>
                                            {item.jam_mulai ? item.jam_mulai.slice(0, 5) : "N/A"}
                                        </span>
                                    </span>
                                </div>
                                <div className="h-5 w-px bg-gray-300" />
                                <div className="flex items-center gap-1">
                                    <span>
                                        Selesai :
                                        <span className={`pl-1 font-semibold ${item.jam_selesai ? "text-green-600" : "text-gray-400"}`}>
                                            {item.jam_selesai ? item.jam_selesai.slice(0, 5) : "N/A"}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Lokasi */}
                            <div className="flex items-center justify-center text-gray-600 text-sm border-t border-gray-200 py-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-green-500" />
                                {item.lokasi || "-"}
                            </div>

                            {/* Approved info */}
                            {item.approved_at ? (
                                <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-200 pt-2">
                                    <div>
                                        Approved by:{" "}
                                        <span className="font-medium text-gray-700">
                                            {item.approved_by || "-"}
                                        </span>
                                    </div>
                                    <div>
                                        {item.approved_at ? formatFullDate(item.approved_at) : "Belum disetujui"}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ))
                )}
            </div>

        </>
    );
}
