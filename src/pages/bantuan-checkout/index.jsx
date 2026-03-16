import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch, faUser, faClock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader } from "../../components";
import { Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";

const BantuanCheckout = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithJwt(`${apiUrl}/trip/log?startDate=${getDefaultPeriod().start}&endDate=${getDefaultPeriod().end}`);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const json = await res.json();
            setLogs(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error("Gagal memuat logs:", err);
            setError("Gagal memuat log update checkout.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter((log) => {
        const term = searchTerm.toLowerCase();
        return (
            log.nama_user?.toLowerCase().includes(term) ||
            log.nama_editor?.toLowerCase().includes(term) ||
            log.lokasi?.toLowerCase().includes(term)
        );
    });

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);
    const handlePageChange = (page) => setCurrentPage(page);
    const formatDate = (date) => {
        return new Date(date).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    return (
        <div className="w-full mx-auto">
            <SectionHeader title="List Update Checkout" subtitle="Menampilkan checkout kunjungan yang dibantu oleh kepala divisi ketika anggota tim lupa melakukan checkout lokasi." onBack={() => navigate("/")} />
            <div className="my-3">
                <SearchBar placeholder="Cari nama anggota, editor, atau lokasi..." onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }} />
            </div>

            {/* CONTENT */}
            {loading && (
                <div className="py-16 text-center">
                    <LoadingSpinner size="lg" text="Memuat logs..." />
                </div>
            )}
            {!loading && error && (
                <ErrorState message={error} onRetry={fetchLogs} />
            )}
            {!loading && !error && filteredLogs.length === 0 && (
                <EmptyState message="Belum ada update checkout." />
            )}
            {!loading && !error && currentLogs.length > 0 && (
                <div className="space-y-3">
                    {currentLogs.map((log) => (
                        <div
                            key={log.id}
                            className="relative bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
                        >

                            {/* Accent bar */}
                            <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l-xl"></div>

                            <div className="ml-2">

                                {/* Informasi utama */}
                                <p className="text-[15px] text-gray-800 leading-relaxed">
                                    <span className="font-semibold text-gray-900">
                                        {log.nama_editor}
                                    </span>{" "}
                                    membantu proses checkout kunjungan untuk{" "}
                                    <span className="font-semibold text-gray-900">
                                        {log.nama_user}
                                    </span>
                                </p>

                                {/* Lokasi */}
                                <p className="text-sm text-gray-600 mt-1">
                                    di lokasi kunjungan <span className="font-medium">{log.lokasi}</span>
                                </p>

                                {/* Metadata */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">

                                    <div className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={faClock} className="text-[11px]" />
                                        {formatDate(log.jam_selesai)}
                                    </div>

                                    <span className="text-gray-300">•</span>

                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PAGINATION */}
            {filteredLogs.length > itemsPerPage && (
                <div className="mt-4">
                    <Pagination currentPage={currentPage} totalItems={filteredLogs.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
                </div>
            )}
        </div>
    );
};

export default BantuanCheckout;