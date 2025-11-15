import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, SearchBar, Pagination, EmptyState, ErrorState, Modal } from "../../components";

const RiwayatSuratDinas = () => {
    const { start: defaultStart, end: defaultEnd } = getDefaultPeriod();
    const navigate = useNavigate();
    const itemsPerPage = 10;
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetchWithJwt(
                `${apiUrl}/surat-dinas/riwayat?startDate=${startDate}&endDate=${endDate}`
            );
            if (!res.ok) throw new Error("Gagal memuat data");
            const result = await res.json();
            setData(result.data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [apiUrl, startDate, endDate]);

    const filteredUsers = data.filter((u) => {
        const term = searchTerm.toLowerCase();
        return (
            u.nama_user.toLowerCase().includes(term) ||
            (u.role || "").toLowerCase().includes(term)
        );
    });

    const totalItems = filteredUsers.length;
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="w-full">
            <SectionHeader title="Riwayat Surat Dinas" subtitle="Daftar pengajuan surat dinas yang telah diproses" onBack={() => navigate(-1)} />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3 w-full">
                <div className="w-full sm:w-1/2">
                    <SearchBar onSearch={setSearchTerm} placeholder="Cari karyawan..." />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none w-full sm:w-40"/>
                        <span className="text-gray-500">–</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none w-full sm:w-40"/>
                    </div>
                    <button onClick={() => { const { start, end } = getDefaultPeriod(); setStartDate(start); setEndDate(end);}} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto">
                        Periode Saat Ini
                    </button>
                </div>
            </div>


            {loading ? (
                <LoadingSpinner message="Memuat riwayat..." />
            ) : error ? (
                <ErrorState message={error} onRetry={fetchData} />
            ) : filteredUsers.length === 0 ? (
                <EmptyState icon={faCalendarAlt} title="Belum ada riwayat surat dinas" description="Data akan muncul setelah ada pengajuan yang disetujui." />
            ) : (
                <>
                    <div className="hidden sm:block overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-green-500 text-white text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold">Karyawan</th>
                                    <th className="px-5 py-3 text-center font-semibold">Status</th>
                                    <th className="px-5 py-3 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentUsers.map((user) => {
                                    const approvedCount = user.riwayat.filter((r) => r.status_dinas === 1).length;
                                    const rejectedCount = user.riwayat.filter((r) => r.status_dinas !== 1).length;

                                    return (
                                        <tr key={user.id_user} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-5 py-1">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800 capitalize">
                                                        {user.nama_user}
                                                    </span>
                                                    <span className="text-gray-500 text-sm capitalize">
                                                        {user.role || "-"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-1 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                                                        Approved {approvedCount}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                                                        Rejected {rejectedCount}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-1 text-center">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded transition-colors shadow-sm"
                                                >
                                                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="sm:hidden space-y-3">
                        {currentUsers.map((user) => {
                            const approvedCount = user.riwayat.filter((r) => r.status_dinas === 1).length;
                            const rejectedCount = user.riwayat.filter((r) => r.status_dinas !== 1).length;

                            return (
                                <div
                                    key={user.id_user}
                                    onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                    className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-emerald-300 active:scale-[0.98] transition-all duration-200 cursor-pointer p-4"
                                >
                                    {/* === Header Card === */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="text-[15px] font-semibold text-gray-900 leading-tight capitalize">
                                                {user.nama_user}
                                            </span>
                                            <span className="text-[12.5px] text-gray-500 mt-0.5 capitalize">
                                                {user.role || "-"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
                                            <FontAwesomeIcon icon={faEye} className="text-[13px]" />
                                        </div>
                                    </div>

                                    {/* === Status Badges === */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11.5px] font-semibold border border-green-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Approved {approvedCount}
                                        </span>
                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[11.5px] font-semibold border border-red-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            Rejected {rejectedCount}
                                        </span>
                                    </div>

                                    {/* === Divider + Info === */}
                                    <div className="mt-3 border-t border-gray-100 pt-2 text-[11.5px] text-gray-500 flex items-center justify-between">
                                        <span>Total Riwayat</span>
                                        <span className="font-semibold text-gray-700">
                                            {user.riwayat.length} Pengajuan
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-6" />
                </>
            )}

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedUser(null); }} title={`${selectedUser?.nama_user || ""}`} note="Detail RIwayat Surat Dinas" size="lg">
                {selectedUser ? (
                    <div className="space-y-2">
                        {selectedUser.riwayat?.length > 0 ? (
                            selectedUser.riwayat.map((r) => (
                                <div key={r.id} onClick={(e) => { e.stopPropagation(); navigate(`/pengajuan-dinas/${r.id}`); }} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all duration-200 p-3 sm:p-4 flex justify-between items-center">
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-[14px] font-semibold text-gray-800">
                                            {formatFullDate(r.tgl_berangkat)}
                                            {r.tgl_pulang && ` – ${formatFullDate(r.tgl_pulang)}`}
                                        </span>

                                        <span className="text-xs text-gray-500">
                                            Jam: {r.waktu?.substring(0, 5) || "-"}
                                        </span>

                                        <span className="text-[12px] text-gray-500 mt-0.5">
                                            {r.status_dinas === 1 ? `Disetujui oleh ${r.approved_by || "-"}` : `Ditolak oleh ${r.approved_by || "-"}`}
                                        </span>
                                    </div>

                                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${r.status_dinas === 1 ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                                        {r.status_dinas === 1 ? "Approved" : "Rejected"}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">
                                Tidak ada data riwayat yang tersedia.
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                        Tidak ada data riwayat yang tersedia.
                    </p>
                )}
            </Modal>
        </div>
    );
};

export default RiwayatSuratDinas;
