import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SearchBar } from "../../../components";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";

export default function Lembur() {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const user = getUserFromToken();
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { start, end } = getDefaultPeriod();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithJwt(
                    `${apiUrl}/lembur/riwayat/user?startDate=${start}&endDate=${end}`
                );
                const json = res?.data ? res : await res.json();
                const rawData = Array.isArray(json?.data?.riwayat) ? json.data.riwayat : [];
                setSummary({
                    totalOvertime: json?.data?.total_overtime ?? 0,
                    totalHour: json?.data?.total_hour ?? 0,
                    totalApproved: json?.data?.total_approved ?? 0,
                    totalRejected: json?.data?.total_rejected ?? 0
                });
                const sorted = rawData.sort(
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
    }, [apiUrl, user.id_user, start, end]);



    const handleSearch = (input) => {
        const value =
            typeof input === "string"
                ? input
                : input.target.value;

        setQuery(value);
    };



    const filtered = data.filter((item) =>
        `${item.lokasi} ${formatFullDate(item.tanggal)}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );


    function getDuration(start, end) {
        if (!start || !end) return "-";
        const h1 = parseInt(start.split(":")[0]);
        const h2 = parseInt(end.split(":")[0]);
        const diff = h2 - h1;
        if (diff <= 0) return "-";
        return diff;
    }

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;



    return (
        <>
            {/* Ringkasan */}
            {summary && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 mb-4">

                    <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-800">
                            Ringkasan Lembur
                        </p>
                        <p className="text-[11px] text-gray-500">
                            Periode{" "}
                            <span className="font-medium text-gray-700">
                                {formatFullDate(start)} – {formatFullDate(end)}
                            </span>
                        </p>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-xs">
                                Total Pengajuan Lembur
                            </span>
                            <span className="font-semibold text-gray-900 text-sm tabular-nums">
                                {summary.totalOvertime}
                                <span className="text-xs text-gray-600 ml-1">Kali</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-xs">
                                Total Jam Lembur
                            </span>
                            <span className="font-semibold text-gray-900 text-sm tabular-nums">
                                {summary.totalHour}
                                <span className="text-xs text-gray-600 ml-1">jam</span>
                            </span>
                        </div>
                        <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                            <span className="text-gray-700 text-xs">
                                Disetujui
                            </span>
                            <span className="inline-flex items-center text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md tabular-nums">
                                {summary.totalApproved} Disetujui
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 text-xs">
                                Ditolak
                            </span>
                            <span className="inline-flex items-center text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md tabular-nums">
                                {summary.totalRejected} Ditolak
                            </span>
                        </div>
                    </div>
                </div>
            )}


            {/* Search */}
            <div className="relative mb-3">
                <SearchBar value={query} onSearch={handleSearch} placeholder="Cari riwayat lembur..." />
            </div>



            {/* Riwayat */}
            <div className="px-1 pb-6 max-h-[460px] overflow-y-auto space-y-3">

                {filtered.length === 0 ? (
                    <EmptyState message="Tidak ada riwayat lembur ditemukan." />
                ) : (filtered.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 py-3 shadow-sm hover:shadow-md transition-all">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3 space-y-1">
                            <div>
                                <p className="text-xs font-semibold text-gray-800">
                                    {formatFullDate(item.tanggal)}
                                </p>
                                <p className="text-[11px] text-gray-700">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-green-600" />
                                    {item.lokasi || "-"}
                                </p>
                            </div>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${item.status === 1 ? "text-green-700 bg-green-50" : item.status === 2 ? "text-red-700 bg-red-50" : "text-yellow-700 bg-yellow-50"}`}>
                                {item.status === 1 ? "Disetujui" : item.status === 2 ? "Ditolak" : "Pending"}
                            </span>
                        </div>

                        {/* Jam lembur */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col items-start">
                                <span className="text-[11px] text-gray-700">
                                    Mulai Lembur
                                </span>
                                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                                    {item.jam_mulai ? item.jam_mulai.slice(0, 5) : "-"}
                                </span>
                            </div>
                            <div className="flex flex-col items-center px-2">
                                <span className="text-[11px] text-gray-700">
                                    Durasi Lembur
                                </span>
                                <span className="text-sm font-semibold">
                                    {getDuration(item.jam_mulai, item.jam_selesai)} jam
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[11px] text-gray-700">
                                    Selesai Lembur
                                </span>
                                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                                    {item.jam_selesai ? item.jam_selesai.slice(0, 5) : "-"}
                                </span>
                            </div>
                        </div>

                        {item.status !== 0 && item.approved_at && (
                            <div className="flex items-center justify-between text-[10px] text-gray-600 mt-1">
                                <span>
                                    {item.status === 1 ? "Disetujui" : "Ditolak"}{" "}
                                    <span className="font-medium text-gray-600">
                                        {item.approved_by || "-"}
                                    </span>
                                </span>

                                <span>
                                    {formatFullDate(item.approved_at)}
                                </span>
                            </div>
                        )}
                    </div>
                ))
                )}
            </div>
        </>
    );
}