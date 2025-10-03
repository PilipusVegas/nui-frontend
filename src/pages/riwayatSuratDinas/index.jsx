import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, SearchBar, Pagination, EmptyState, ErrorState } from "../../components";

const RiwayatSuratDinas = () => {
    const { start: defaultStart, end: defaultEnd } = getDefaultPeriod();
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [endDate, setEndDate] = useState(defaultEnd);
    const [startDate, setStartDate] = useState(defaultStart);
    const [openUser, setOpenUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    /** ---------- Fetch Data ---------- */
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetchWithJwt(
                `${apiUrl}/surat-dinas/riwayat?startDate=${startDate}&endDate=${endDate}`
            );
            if (!res.ok) throw new Error("Gagal memuat data");
            const result = await res.json();
            setData(result.data || []);
            setError(null); // reset error kalau sukses
        } catch (err) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiUrl]);

    /** ---------- Filter Search ---------- */
    const filteredUsers = data.filter((u) => {
        const term = searchTerm.toLowerCase();
        return (
            u.nama_user.toLowerCase().includes(term) ||
            (u.role || "").toLowerCase().includes(term)
        );
    });

    // hitung slice untuk pagination
    const totalItems = filteredUsers.length;
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

    // reset ke page 1 kalau search berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    return (
        <div className="w-full">
            <SectionHeader title="Riwayat Surat Dinas" subtitle="Semua pengajuan yang telah disetujui dikelompokkan per karyawan" onBack={() => navigate(-1)} />

            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                    <SearchBar onSearch={setSearchTerm} placeholder="Cari karyawan..." />
                </div>

                {/* Rentang Tanggal + Periode Saat Ini */}
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2.5 text-sm border border-gray-300 rounded-md" />
                    <span className="px-2 text-gray-500">–</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2.5 text-sm border border-gray-300 rounded-md" />

                    <button onClick={() => { const { start, end } = getDefaultPeriod(); setStartDate(start); setEndDate(end); }} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                        Periode Saat Ini
                    </button>
                </div>
            </div>

            {loading ? (
                <LoadingSpinner message="Memuat riwayat..." />
            ) : error ? (
                <ErrorState message={error} onRetry={fetchData} />
            ) : filteredUsers.length === 0 ? (
                <EmptyState icon={faCalendarAlt} title="Belum ada riwayat surat dinas" description="Data riwayat surat dinas akan muncul di sini setelah ada pengajuan yang disetujui." />
            ) : (
                <>
                    <div className="overflow-x-auto rounded-lg shadow-md bg-white border border-gray-200">
                        <table className="min-w-full text-sm border-collapse">
                            {/* Header Utama */}
                            <thead className="bg-green-500 text-white uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold">Nama Karyawan</th>
                                    <th className="px-5 py-3 text-center font-semibold">Status</th>
                                    <th className="px-5 py-3 text-center font-semibold">Detail</th>
                                </tr>
                            </thead>

                            {/* Body */}
                            <tbody className="divide-y divide-gray-200">
                                {currentUsers.map((user) => {
                                    const isOpen = openUser === user.id_user;
                                    const approvedCount = user.riwayat.filter(r => r.status_dinas === 1).length;
                                    const rejectedCount = user.riwayat.filter(r => r.status_dinas !== 1).length;

                                    return (
                                        <React.Fragment key={user.id_user}>
                                            {/* Baris Karyawan */}
                                            <tr className="hover:bg-gray-50 cursor-pointer transition-colors duration-150" onClick={() => setOpenUser(isOpen ? null : user.id_user)}>
                                                {/* Nama & Role */}
                                                <td className="px-5 py-3 border-b border-gray-200">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-800 capitalize">{user.nama_user}</span>
                                                        <span className="text-gray-500 text-sm mt-0.5 capitalize">{user.role || "-"}</span>
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-5 py-3 text-center border-b border-gray-200">
                                                    <div className="flex justify-center gap-2">
                                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                                                            Approved: {approvedCount}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                                                            Rejected: {rejectedCount}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Menu / Chevron */}
                                                <td className="px-5 py-3 text-center border-b border-gray-200">
                                                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-gray-600" />
                                                </td>
                                            </tr>

                                            {/* Expand Riwayat */}
                                            {isOpen && (
                                                <tr>
                                                    <td colSpan={3} className="p-4 bg-gray-50 rounded-b-lg">
                                                        <div className="overflow-x-auto w-full">
                                                            <table className="w-full text-sm">
                                                                {/* Header Riwayat */}
                                                                <thead className="bg-green-600 text-white uppercase text-xs tracking-wide">
                                                                    <tr>
                                                                        <th className="px-4 py-2 text-center font-medium rounded-tl-lg">No</th>
                                                                        <th className="px-4 py-2 text-left font-medium">Tanggal & Jam</th>
                                                                        <th className="px-4 py-2 text-center font-medium">Disetujui Oleh</th>
                                                                        <th className="px-4 py-2 text-center font-medium">Status</th>
                                                                        <th className="px-4 py-2 text-center font-medium rounded-tr-lg">Aksi</th>
                                                                    </tr>
                                                                </thead>

                                                                <tbody className="bg-white divide-y divide-gray-100">
                                                                    {user.riwayat.map((r, idx) => (
                                                                        <tr key={r.id} className="hover:bg-gray-100 transition-colors duration-200">
                                                                            <td className="px-4 py-2 text-center font-medium text-gray-700">{idx + 1}</td>
                                                                            <td className="px-4 py-2 text-gray-700">
                                                                                <div className="flex flex-col gap-1">
                                                                                    <span className="font-medium">
                                                                                        {formatFullDate(r.tgl_berangkat)}
                                                                                        {r.tgl_pulang && ` – ${formatFullDate(r.tgl_pulang)}`}
                                                                                    </span>
                                                                                    <span className="text-sm text-gray-500">{r.waktu?.substring(0, 5) || "-"}</span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-2 text-center text-gray-700">{r.approved_by || "-"}</td>
                                                                            <td className="px-4 py-2 text-center">
                                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status_dinas === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                                                    {r.status_dinas === 1 ? "Approved" : "Rejected"}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-4 py-2 text-center">
                                                                                {r.keterangan ? (
                                                                                    <button
                                                                                        onClick={() => navigate(`/pengajuan-dinas/${r.id}`)}
                                                                                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                                                                                    >
                                                                                        Lihat Detail
                                                                                    </button>
                                                                                ) : "-"}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-6" />
                </>
            )}
        </div>
    );
};

export default RiwayatSuratDinas;
