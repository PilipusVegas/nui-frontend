import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faClock, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatCustomDateTime, formatFullDate } from "../../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SearchBar } from "../../../components";

const STATUS_MAP = {
    0: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700",
    },
    1: {
        label: "Disetujui",
        className: "bg-emerald-100 text-emerald-700",
    },
    2: {
        label: "Ditolak",
        className: "bg-rose-100 text-rose-700",
    },
};

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
                formatFullDate(i.tanggal).toLowerCase().includes(q)
            )
        );
    };

    const toggleDropdown = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    const formatTime = (time) => {
        if (!time) return "-";
        return new Date(time).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const kategoriConfig = (kategori, index) => {
        if (kategori === 1)
            return {
                color: "bg-emerald-500",
                title: "Mulai Kunjungan"
            };
        if (kategori === 2)
            return {
                color: "bg-blue-500",
                title: `Checkpoint ${index}`
            };
        return {
            color: "bg-rose-500",
            title: "Kunjungan Berakhir"
        };
    };

    const formatDistance = (meter) => {
        if (!meter) return "0 m";
        return meter >= 1000
            ? `${(meter / 1000).toFixed(1)} km`
            : `${Math.round(meter)} m`;
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;

    return (
        <>
            <div className="mb-3">
                <SearchBar onSearch={handleSearch} placeholder="Cari riwayat kunjungan..." />
            </div>

            <div className="pb-4 max-h-[460px] overflow-y-auto space-y-3">
                {filtered.length === 0 ? (
                    <EmptyState message="Belum ada riwayat kunjungan teknisi." />
                ) : (
                    filtered.map((item, idx) => {
                        const tanggal = formatFullDate(item.tanggal);

                        return (
                            <div key={idx} className="rounded-xl border bg-white px-4 py-3 space-y-3">
                                {/* HEADER */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-800">
                                        {tanggal}
                                    </span>
                                    {(() => {
                                        const status = STATUS_MAP[item.status] || {
                                            label: "Unknown",
                                            className: "bg-gray-100 text-gray-600",
                                        };

                                        return (
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.className}`}
                                            >
                                                {status.label}
                                            </span>
                                        );
                                    })()}
                                </div>

                                {/* APPROVAL INFO */}
                                <div className="flex items-center gap-2 text-xs">
                                    <FontAwesomeIcon icon={faUserCheck} className="text-emerald-600" />
                                    <span className="text-gray-800">
                                        Disetujui oleh{" "}
                                        <b className="text-emerald-700">{item.approved_by}</b>
                                        <span className="mx-1 text-gray-400">•</span>
                                        <span className="text-gray-600">
                                            {formatCustomDateTime(item.approved_at)}
                                        </span>
                                    </span>
                                </div>

                                <button onClick={() => toggleDropdown(idx)} className="group w-full flex items-center justify-between text-[11px] text-gray-600 pt-2 border-t transition-colors duration-200">
                                    {/* LEFT */}
                                    <span className="group-hover:text-emerald-600 group-hover:font-semibold transition-colors">
                                        Lihat detail kunjungan
                                    </span>

                                    {/* RIGHT */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500 font-medium">
                                            Total Jarak : {formatDistance(item.total_jarak)}
                                        </span>

                                        <FontAwesomeIcon icon={faChevronDown}
                                            className={`transition-all duration-300
                                                ${openIndex === idx ? "rotate-180 text-gray-800" : ""}
                                                group-hover:translate-y-0.5
                                            `}
                                        />
                                    </div>
                                </button>

                                {openIndex === idx && (
                                    <div className="pt-4">
                                        {item.lokasi?.map((lok, lidx) => {
                                            const config = kategoriConfig(lok.kategori, lidx);
                                            const isLast = lidx === item.lokasi.length - 1;

                                            return (
                                                <div key={lidx} className="flex gap-4 relative">
                                                    {/* TIMELINE COLUMN */}
                                                    <div className="relative flex justify-center shrink-0 w-4">
                                                        {/* BULATAN */}
                                                        <div className={`w-4 h-4 rounded-full ${config.color} ring-4 ring-white z-10`} />

                                                        {/* GARIS KE ITEM BERIKUTNYA */}
                                                        {!isLast && (
                                                            <div className="absolute top-4 bottom-0 w-px bg-gray-300" />
                                                        )}
                                                    </div>

                                                    {/* CONTENT */}
                                                    <div className="flex-1 text-xs text-gray-700 space-y-1 pb-4">
                                                        <p className="font-semibold">
                                                            {config.title}
                                                        </p>

                                                        <p className="text-gray-800">
                                                            {lok.nama_lokasi}
                                                        </p>

                                                        <div className="flex gap-4 text-[11px]">
                                                            <span className="flex items-center gap-1 text-emerald-600">
                                                                <FontAwesomeIcon icon={faClock} />
                                                                {formatTime(lok.jam_mulai)}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-rose-600">
                                                                <FontAwesomeIcon icon={faClock} />
                                                                {formatTime(lok.jam_selesai)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
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