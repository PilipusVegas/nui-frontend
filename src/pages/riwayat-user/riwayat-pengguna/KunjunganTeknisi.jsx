import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute, faMoneyBillWave, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SearchBar } from "../../../components";

export default function KunjunganTeknisi() {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const user = getUserFromToken();
    const [data, setData] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/trip/user/riwayat`);
                if (res.status === 404) {
                    setData([]);
                    return;
                }
                if (!res.ok) throw new Error("Gagal memuat data kunjungan");
                const json = await res.json();
                const sorted = (json.data || []).sort(
                    (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
                );
                setData(sorted);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiUrl, user?.id_user]);

    useEffect(() => {
        setFiltered(data);
    }, [data]);

    const handleSearch = (e) => {
        const q = e.target.value.toLowerCase();
        setQuery(q);

        setFiltered(
            data.filter((i) =>
                `${i.status} ${formatFullDate(i.tanggal)}`
                    .toLowerCase()
                    .includes(q)
            )
        );
    };

    const toggleDropdown = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;

    const formatDistance = (meter) => {
        if (!meter) return "0 m";
        return meter >= 1000
            ? `${(meter / 1000).toFixed(1)} km`
            : `${meter} m`;
    };

    const formatTimeRange = (start, end) => {
        if (!start) return "-";
        const startTime = new Date(start).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
        const endTime = end
            ? new Date(end).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            })
            : "-";
        return `${startTime} – ${endTime}`;
    };


    return (
        <>
            <div className="mb-3">
                <SearchBar onSearch={handleSearch} placeholder="Cari riwayat kunjungan..." />
            </div>

            <div className="pb-4 max-h-[460px] overflow-y-auto space-y-3">
                {filtered.length === 0 ? (
                    <EmptyState message="Belum ada riwayat kunjungan teknisi." />
                ) : (
                    filtered.map((i, idx) => {
                        const tanggal = formatFullDate(i.tanggal);

                        const statusMap = {
                            0: { text: "Pending", style: "bg-yellow-100 text-yellow-700" },
                            1: { text: "Disetujui", style: "bg-emerald-100 text-emerald-700" },
                            2: { text: "Ditolak", style: "bg-rose-100 text-rose-700" },
                        };

                        const status = statusMap[i.status] || {
                            text: "Unknown",
                            style: "bg-gray-100 text-gray-600",
                        };

                        return (
                            <div key={idx} className="rounded-xl border border-gray-200 bg-white px-4 py-3 space-y-3">
                                {/* ===== HEADER ===== */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-800">
                                        {tanggal}
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.style}`}>
                                        {status.text}
                                    </span>
                                </div>

                                {/* ===== SUMMARY ===== */}
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faRoute} className="text-blue-400"/>
                                        <span>{formatDistance(i.total_jarak)}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                                        <FontAwesomeIcon icon={faMoneyBillWave} />
                                        <span>
                                            Rp {Number(i.nominal || 0).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>

                                {/* ===== TOGGLE ===== */}
                                <button onClick={() => toggleDropdown(idx)} className="w-full flex items-center justify-between text-[11px] font-medium text-gray-600 pt-2 border-t">
                                    <span>Lihat detail lokasi</span>
                                    <FontAwesomeIcon icon={faChevronDown} className={`transition-transform ${openIndex === idx ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {/* ===== DETAIL LOKASI ===== */}
                                {openIndex === idx && (
                                    <div className="pt-2 space-y-2">
                                        {i.lokasi?.map((lok, lidx) => (
                                            <div key={lidx} className="flex items-start gap-3 text-[11px]">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-blue-400" />

                                                <div className="flex-1 flex justify-between text-gray-700">
                                                    <div>
                                                        <p className="font-medium">
                                                            {lok.nama_lokasi}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">
                                                            {formatTimeRange(lok.jam_mulai, lok.jam_selesai)}
                                                        </p>
                                                    </div>
                                                    <span className="text-gray-500">
                                                        {formatDistance(lok.jarak_lokasi)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
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