import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatFullDate, formatCustomDateTime } from "../../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";
import { faCalendarAlt, faEye, faInfo, faInfoCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, SearchBar, Pagination, EmptyState, ErrorState, Modal } from "../../../components";

const RiwayatSuratDinas = () => {
    const navigate = useNavigate();
    const itemsPerPage = 10;
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [summaryFilter, setSummaryFilter] = useState(null);

    useEffect(() => {
        const { start, end } = getDefaultPeriod();
        setStartDate(start);
        setEndDate(end);
    }, []);

    const fetchData = async () => {
        if (!startDate || !endDate) return;

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
            <SectionHeader title="Riwayat Surat Dinas" subtitle="Daftar pengajuan surat dinas yang telah diproses. Sesuaikan anggal untuk menampilkan data." onBack={() => navigate(-1)}
                actions={
                    <button onClick={() => setIsInfoModalOpen(true)} className="flex items-center justify-center px-4 sm:px-4 py-2 text-sm font-semibold rounded-md text-white bg-blue-500 hover:bg-blue-600 gap-1" >
                        <FontAwesomeIcon icon={faInfo} className="mr-0 sm:mr-1" />
                        <span className="hidden sm:inline">Informasi</span>
                    </button>
                }
            />

            <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="w-full sm:flex-1">
                    <SearchBar onSearch={setSearchTerm} placeholder="Cari karyawan..." />
                </div>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="w-full sm:w-auto flex items-center gap-2">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none w-full sm:w-40" />
                        <span className="text-gray-500">s/d</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none w-full sm:w-40" />
                    </div>
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
                    <div className="hidden sm:block overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-green-500 text-white text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-center font-semibold w-12">No</th>
                                    <th className="px-5 py-3 text-left font-semibold">Nama Karyawan</th>
                                    <th className="px-5 py-3 text-center font-semibold">Kategori Dinas</th>
                                    <th className="px-5 py-3 text-center font-semibold">Status</th>
                                    <th className="px-5 py-3 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {currentUsers.map((user, index) => {
                                    const nomor = indexOfFirst + index + 1;
                                    const dalamJabodetabek = user.riwayat.filter(
                                        (r) => r.kategori === "1"
                                    ).length;
                                    const luarJabodetabek = user.riwayat.filter(
                                        (r) => r.kategori === "2"
                                    ).length;
                                    const approvedCount = user.riwayat.filter(
                                        (r) => r.status_dinas === 1
                                    ).length;
                                    const rejectedCount = user.riwayat.filter(
                                        (r) => r.status_dinas === 2
                                    ).length;
                                    return (
                                        <tr key={user.id_user} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-8 py-1 text-center font-semibold text-gray-600">
                                                {nomor}
                                            </td>

                                            <td className="px-5 py-1">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800 uppercase">
                                                        {user.nama_user}
                                                    </span>
                                                    <span className="text-xs text-gray-500 capitalize">
                                                        {user.role || "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-1 text-center">
                                                <div className="flex justify-center flex-wrap gap-2">
                                                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                                                        Jabodetabek {dalamJabodetabek}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                                                        Luar Jabodetabek {luarJabodetabek}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-1 text-center">
                                                <div className="flex justify-center flex-wrap gap-2">
                                                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                                                        Disetujui {approvedCount}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                                                        Ditolak {rejectedCount}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* AKSI */}
                                            <td className="px-5 py-1 text-center">
                                                <button onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition">
                                                    <FontAwesomeIcon icon={faEye} className="mr-1" />
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
                            const dalamJabodetabek = user.riwayat.filter(
                                (r) => r.kategori === "1"
                            ).length;

                            const luarJabodetabek = user.riwayat.filter(
                                (r) => r.kategori === "2"
                            ).length;

                            const approvedCount = user.riwayat.filter(
                                (r) => r.status_dinas === 1
                            ).length;

                            const rejectedCount = user.riwayat.filter(
                                (r) => r.status_dinas === 2
                            ).length;

                            return (
                                <div key={user.id_user} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[15px] font-semibold text-gray-900 capitalize">
                                                {user.nama_user}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">
                                                {user.role || "-"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Kategori</span>
                                            <div className="flex gap-2">
                                                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                                                    Jabodetabek: {dalamJabodetabek}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                                                    Luar Jabodetabek: {luarJabodetabek}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Status Pengajuan</span>
                                            <div className="flex gap-2">
                                                <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-700 font-semibold border border-green-200">
                                                    Disetujui: {approvedCount}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-semibold border border-red-200">
                                                    Ditolak: {rejectedCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            Total: <b className="text-gray-700">{user.riwayat.length}</b> Pengajuan
                                        </span>

                                        <button onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} className="flex items-center gap-1 px-4 py-2 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition">
                                            <FontAwesomeIcon icon={faInfoCircle} />
                                            Detail
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalItems > itemsPerPage && (
                        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-6" />
                    )}
                </>
            )}

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedUser(null); setSummaryFilter(null); }} title={`Riwayat Dinas ${selectedUser?.nama_user || ""}`} note="Rangkuman riwayat pada rentang periode ini." size="lg">
                {selectedUser ? (() => {
                    const riwayat = selectedUser.riwayat || [];
                    const totalApproved = riwayat.filter(r => r.status_dinas === 1).length;
                    const totalRejected = riwayat.filter(r => r.status_dinas === 2).length;
                    const totalJabodetabek = riwayat.filter(r => r.kategori === "1").length;
                    const totalLuar = riwayat.filter(r => r.kategori === "2").length;
                    const filteredRiwayat = riwayat.filter(r => {
                        if (summaryFilter === "approved") return r.status_dinas === 1;
                        if (summaryFilter === "rejected") return r.status_dinas === 2;
                        if (summaryFilter === "jabodetabek") return r.kategori === "1";
                        if (summaryFilter === "luar") return r.kategori === "2";
                        return true;
                    });

                    return (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { key: "approved", label: "Disetujui", value: totalApproved, active: summaryFilter === "approved", base: "green", },
                                    { key: "rejected", label: "Ditolak", value: totalRejected, active: summaryFilter === "rejected", base: "red", },
                                    { key: "jabodetabek", label: "Jabodetabek", value: totalJabodetabek, active: summaryFilter === "jabodetabek", base: "blue", },
                                    { key: "luar", label: "Luar Jabodetabek", value: totalLuar, active: summaryFilter === "luar", base: "purple", },
                                ].map(card => (
                                    <button key={card.key}
                                        onClick={() => setSummaryFilter(card.active ? null : card.key)}
                                        className={`p-3 rounded-xl border text-left transition
                                        ${card.active ? `bg-${card.base}-100 border-${card.base}-400` : `bg-white border-gray-200 hover:bg-${card.base}-50`}`}
                                    >
                                        <p className="text-xs text-gray-500">{card.label}</p>
                                        <p className={`text-lg font-bold text-${card.base}-700`}>
                                            {card.value}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {filteredRiwayat.length > 0 ? (
                                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                                    {filteredRiwayat.map((r) => {
                                        const isApproved = r.status_dinas === 1;
                                        const statusLabel = isApproved ? "Disetujui" : "Ditolak";
                                        const statusStyle = isApproved
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-red-50 text-red-700 border-red-200";
                                        const kategoriLabel = r.kategori === "1" ? "Jabodetabek" : "Luar Jabodetabek";
                                        const kategoriStyle = r.kategori === "1"
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-purple-50 text-purple-700 border-purple-200";

                                        return (
                                            <div key={r.id} onClick={(e) => { e.stopPropagation(); window.open(`/pengajuan-dinas/${r.id}`, "_blank");}}
                                                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition cursor-pointer"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${kategoriStyle}`}>
                                                        {kategoriLabel}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusStyle}`}>
                                                        {statusLabel}
                                                    </span>
                                                </div>

                                                <p className="text-sm sm:text-[15px] font-semibold text-gray-900">
                                                    {formatFullDate(r.tgl_berangkat)}
                                                    {r.kategori === "2" && r.tgl_pulang && (
                                                        <> – {formatFullDate(r.tgl_pulang)}</>
                                                    )}
                                                </p>

                                                <div className="mt-1 text-xs sm:text-sm text-gray-600 flex gap-x-4">
                                                    <span>
                                                        Jam: <b>{r.waktu?.substring(0, 5) || "-"}</b>
                                                    </span>
                                                    {r.kategori === "2" && !r.tgl_pulang && (
                                                        <span className="text-amber-600 font-semibold">
                                                            Belum Pulang
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-2 text-xs text-gray-500">
                                                    {statusLabel} oleh{" "}
                                                    <span className="font-semibold text-gray-700">
                                                        {r.approved_by || "-"}
                                                    </span>
                                                    {r.approved_at && (
                                                        <> • {formatCustomDateTime(r.approved_at)}</>
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-6">
                                    Tidak ada data sesuai filter.
                                </p>
                            )}
                        </div>
                    );
                })() : (
                    <p className="text-gray-500 text-sm text-center py-6">
                        Tidak ada data riwayat yang tersedia.
                    </p>
                )}
            </Modal>



            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Panduan Riwayat Surat Dinas" note="Informasi ini membantu Anda memahami fitur dan cara menggunakan halaman riwayat surat dinas dengan efektif." size="lg">
                <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faSearch} className="text-blue-500 mt-1" />
                        <div>
                            <h4 className="font-semibold text-gray-900">Pencarian Karyawan</h4>
                            <p className="text-gray-600 mt-1">
                                Gunakan kolom pencarian untuk menemukan karyawan atau role tertentu. Hasil pencarian akan muncul secara real-time.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500 mt-1" />
                        <div>
                            <h4 className="font-semibold text-gray-900">Filter Tanggal</h4>
                            <p className="text-gray-600 mt-1">
                                Gunakan input tanggal mulai dan tanggal akhir untuk menampilkan riwayat pengajuan dalam rentang waktu tertentu.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faEye} className="text-indigo-500 mt-1" />
                        <div>
                            <h4 className="font-semibold text-gray-900">Detail Pengajuan</h4>
                            <p className="text-gray-600 mt-1">
                                Klik tombol <strong>Detail</strong> untuk melihat informasi lengkap pengajuan surat dinas, termasuk:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-2">
                                <li>Status pengajuan: <span className="px-2 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">Approved</span> atau <span className="px-2 rounded-full bg-red-50 text-red-700 font-semibold border border-red-200">Rejected</span>.</li>
                                <li>Kategori perjalanan dinas (Dalam Kota / Luar Kota).</li>
                                <li>Tanggal dan jam keberangkatan, serta tanggal pulang jika ada.</li>
                                <li>Keterangan tambahan dari karyawan atau catatan HRD.</li>
                                <li>Nama petugas yang menyetujui atau menolak beserta tanggal persetujuan.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faInfo} className="text-yellow-500 mt-1" />
                        <div>
                            <h4 className="font-semibold text-gray-900">Tips Penggunaan</h4>
                            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-2">
                                <li>Gunakan filter tanggal untuk membatasi data yang muncul agar lebih mudah dikelola.</li>
                                <li>Kombinasikan pencarian dan filter untuk menemukan riwayat tertentu dengan cepat.</li>
                                <li>Periksa label status untuk mengetahui mana pengajuan yang disetujui atau ditolak.</li>
                                <li>Pastikan semua informasi penting diperiksa sebelum mengambil keputusan terkait pengajuan dinas.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Modal>

        </div >
    );
};

export default RiwayatSuratDinas;
