import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate, formatTime } from "../../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SearchBar } from "../../../components";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";

export default function Absensi() {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const user = getUserFromToken();
    const [data, setData] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [summary, setSummary] = useState(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { start, end } = getDefaultPeriod();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithJwt(
                    `${apiUrl}/absen/riwayat/user?startDate=${start}&endDate=${end}`
                );
                if (res.status === 404) {
                    setData([]);
                    setFiltered([]);
                    return;
                }
                if (!res.ok) throw new Error("Gagal memuat data absensi");
                const json = await res.json();
                const riwayat = json.data?.riwayat || [];
                const sorted = riwayat.sort(
                    (a, b) => new Date(b.jam_mulai) - new Date(a.jam_mulai)
                );
                setSummary({
                    totalDays: json.data?.total_days || 0,
                    totalLate: json.data?.total_late || 0
                });
                setData(sorted);
                setFiltered(sorted);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiUrl, user.id_user, start, end]);



    const handleSearch = (input) => {
        const q = typeof input === "string"
            ? input.toLowerCase()
            : input.target.value.toLowerCase();
        setQuery(q);
        const filteredData = data.filter((i) =>
            `${i.lokasi_absen_mulai} ${formatFullDate(i.jam_mulai)}`
                .toLowerCase()
                .includes(q)
        );
        setFiltered(filteredData);
    };

    const formatPeriod = (start, end) => {
        const startDate = formatFullDate(start);
        const endDate = formatFullDate(end);
        return `${startDate} - ${endDate}`;
    };


    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;

    return (
        <>
            {/* Ringkasan Periode */}
            {summary && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm mb-4">
                    {/* Header */}
                    <div className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">
                            Ringkasan Absensi
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Periode <span className="font-medium text-gray-700">{formatPeriod(start, end)}</span>
                        </p>
                    </div>
                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>
                    {/* Statistik */}
                    <div className="grid grid-cols-2 divide-x divide-gray-200 text-center">
                        <div className="py-2">
                            <p className="text-md font-semibold text-gray-900">
                                {summary.totalDays}
                            </p>
                            <p className="text-xs text-gray-700 font-normal mt-0.5">
                                Hari Kehadiran
                            </p>
                        </div>
                        <div className="py-2">
                            <p className="text-md font-semibold text-red-600">
                                {summary.totalLate}
                            </p>
                            <p className="text-xs text-gray-700 font-normal mt-0.5">
                                Menit Terlambat
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
                <SearchBar value={query} onSearch={handleSearch} placeholder="Cari riwayat absensi..." />
            </div>

            <div className="pb-4 max-h-[460px] overflow-y-auto space-y-3">

                {filtered.length === 0 ? (
                    <EmptyState message="Belum ada riwayat absensi yang cocok." />
                ) : (filtered.map((i) => {
                    const tglMasuk = formatFullDate(i.jam_mulai);
                    const tglPulang = i.jam_selesai ? formatFullDate(i.jam_selesai) : "-";
                    const isLate = !!i.keterlambatan;
                    const isForgotCheckout = !i.jam_selesai && new Date().toDateString() !== new Date(i.jam_mulai).toDateString();
                    return (
                        <div key={i.id_absen} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs font-semibold text-gray-800">
                                    {tglMasuk}
                                </div>
                                <div className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">
                                    {i.nama_shift}
                                </div>
                            </div>


                            {/* Jam kerja */}
                            <div className="flex justify-center items-center gap-3 text-lg font-semibold mb-3">
                                <span className="text-green-600">
                                    {i.jam_mulai ? formatTime(i.jam_mulai) : "--:--"}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className={i.jam_selesai ? "text-green-600" : "text-gray-400"}>
                                    {i.jam_selesai ? formatTime(i.jam_selesai) : "--:--"}
                                </span>
                            </div>


                            {/* Tanggal detail */}
                            <div className="grid grid-cols-2 text-xs text-gray-500 mb-3">
                                <div>
                                    <div className="text-gray-400">Tanggal Masuk</div>
                                    <div className="font-medium text-gray-700">{tglMasuk}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-400">Tanggal Pulang</div>
                                    <div className="font-medium text-gray-700">{tglPulang}</div>
                                </div>
                            </div>


                            {/* Lokasi */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                <div className="flex items-center gap-1 min-w-0">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500" />
                                    <span className="truncate">{i.lokasi_absen_mulai ?? "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-1 min-w-0 justify-end">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500" />
                                    <span className="truncate">{i.lokasi_absen_selesai ?? "N/A"}</span>
                                </div>
                            </div>


                            {/* Status */}
                            <div className="flex justify-between items-center mt-2 text-[11px]">
                                <div>
                                    {isLate && (
                                        <span className="px-2 py-0.5 rounded-sm bg-red-100 text-red-600 font-medium">
                                            Terlambat {i.keterlambatan} menit
                                        </span>
                                    )}
                                </div>
                                <div>
                                    {isForgotCheckout && (
                                        <span className="px-2 py-0.5 rounded-sm bg-red-100 text-red-700 font-medium">
                                            Absen Pulang Kosong!
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
                )}
            </div>
        </>
    );
}