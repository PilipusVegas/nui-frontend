// src/pages/riwayat/SuratDinas.jsx

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCity,
    faPlaneDeparture,
    faPlaneArrival
} from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";

import {
    LoadingSpinner,
    EmptyState,
    ErrorState,
    SearchBar
} from "../../../components";


export default function SuratDinas() {

    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const { start, end } = getDefaultPeriod();

    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");

    const [summary, setSummary] = useState({
        total_office_leave: 0,
        total_approved: 0,
        total_rejected: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);



    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithJwt(
                    `${apiUrl}/surat-dinas/riwayat/user?startDate=${start}&endDate=${end}`
                );
                if (res.status === 404) {
                    setNotFound(true);
                    return;
                }
                if (res.status >= 500) {
                    throw new Error("Terjadi kesalahan server");
                }
                const json = res?.data ? res : await res.json();
                const rawData = Array.isArray(json?.data?.riwayat)
                    ? json.data.riwayat
                    : [];
                const sorted = rawData.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setData(sorted);
                setSummary({
                    total_office_leave: json?.data?.total_office_leave || 0,
                    total_approved: json?.data?.total_approved || 0,
                    total_rejected: json?.data?.total_rejected || 0
                });
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiUrl, start, end]);



    const getKategoriDinas = (kategori) => {
        if (kategori === "1" || kategori === 1)
            return "Jabodetabek";
        if (kategori === "2" || kategori === 2)
            return "Jawa & Bali (Non-Jabodetabek)";
        if (kategori === "3" || kategori === 3)
            return "Luar Jawa & Bali";
        return "-";
    };



    const filtered = data.filter((item) =>
        `${item.keterangan} ${formatFullDate(item.tgl_berangkat)}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );



    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;
    if (notFound)
        return (
            <EmptyState message="Tidak ada riwayat surat dinas ditemukan." />
        );

    return (
        <>
            {/* Summary */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm mb-4">
                <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                        Ringkasan Dinas
                    </p>
                    <p className="text-[11px] text-gray-500">
                        Periode{" "}
                        <span className="font-medium text-gray-700">
                            {formatFullDate(start)} – {formatFullDate(end)}
                        </span>
                    </p>
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                    <div className="px-3 py-3 text-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                            Total Dinas
                        </p>
                        <p className="text-md font-semibold text-gray-900 tabular-nums">
                            {summary.total_office_leave}
                        </p>
                    </div>
                    <div className="px-3 py-3 text-center">
                        <p className="text-[10px] text-green-600 uppercase tracking-wide">
                            Disetujui
                        </p>
                        <p className="text-md font-semibold text-green-700 tabular-nums">
                            {summary.total_approved}
                        </p>
                    </div>
                    <div className="px-3 py-3 text-center">
                        <p className="text-[10px] text-red-600 uppercase tracking-wide">
                            Ditolak
                        </p>
                        <p className="text-md font-semibold text-red-700 tabular-nums">
                            {summary.total_rejected}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <SearchBar onSearch={setQuery} placeholder="Cari riwayat surat dinas..." />
            </div>

            {/* List */}
            <div className="px-1 pb-6 max-h-[460px] overflow-y-auto space-y-2">
                {filtered.length === 0 ? (
                    <EmptyState message="Tidak ada riwayat surat dinas ditemukan." />
                ) : (filtered.map((item) => {
                    const isAreaA = item.kategori === "1" || item.kategori === 1;
                    const statusText = item.status === 1 ? "Disetujui" : item.status === 2 ? "Ditolak" : "Pending";
                    const statusStyle = item.status === 1 ? "text-green-700 bg-green-100" : item.status === 2 ? "text-red-700 bg-red-100" : "text-amber-700 bg-amber-100";
                    return (
                        <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="text-[11px] text-gray-500">
                                        Tanggal pengajuan
                                    </p>
                                    <p className="text-xs font-semibold text-gray-900">
                                        {formatFullDate(item.created_at)}
                                    </p>
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-1 rounded-sm ${statusStyle}`}>
                                    {statusText}
                                </span>
                            </div>

                            {/* Kategori */}
                            <div className="mb-2">
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 font-medium">
                                    <FontAwesomeIcon icon={faCity} className="text-[10px]" />
                                    {getKategoriDinas(item.kategori)}
                                </span>
                            </div>

                            {/* Jadwal Perjalanan */}
                            <div className="rounded-lg py-2 mb-2 text-xs">
                                {isAreaA ? (
                                    <div>
                                        <p className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide">
                                            Tanggal Dinas
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {formatFullDate(item.tgl_berangkat) || "-"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide">
                                                Berangkat
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                {formatFullDate(item.tgl_berangkat) || "-"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide">
                                                Pulang
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                {formatFullDate(item.tgl_pulang) || "-"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Keterangan */}
                            {item.keterangan && (
                                <div className="text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mb-3 leading-relaxed break-words">
                                    <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                        Tugas Dinas
                                    </p>
                                    <p className="text-gray-800">
                                        {item.keterangan}
                                    </p>
                                </div>
                            )}

                            {/* Approval */}
                            {item.approved_at && (
                                <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-100 pt-2">
                                    <span>
                                        {item.status === 1 ? "Disetujui oleh" : "Ditolak oleh"}{" "}
                                        <span className="font-medium text-gray-700">
                                            {item.approved_by || "-"}
                                        </span>
                                    </span>
                                    <span>
                                        {formatFullDate(item.approved_at)}
                                    </span>
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