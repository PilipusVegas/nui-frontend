import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";
import { faCalendarAlt, faEye, faInfo, faSearch } from "@fortawesome/free-solid-svg-icons";
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

    useEffect(() => {
        const { start, end } = getDefaultPeriod();
        setStartDate(start);
        setEndDate(end);
    }, []);

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
                                    <th className="px-5 py-3 text-left font-semibold">Karyawan</th>
                                    <th className="px-5 py-3 text-center font-semibold">Status</th>
                                    <th className="px-5 py-3 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentUsers.map((user) => {
                                    const approvedCount = user.riwayat.filter((r) => r.status_dinas === 1).length;
                                    const rejectedCount = user.riwayat.filter((r) => r.status_dinas === 2).length;

                                    return (
                                        <tr key={user.id_user} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-5 py-1">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800 tracking-wide capitalize">
                                                        {user.nama_user}
                                                    </span>
                                                    <span className="text-gray-500 text-xs font-medium tracking-wide capitalize">
                                                        {user.role || "-"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-1 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <span className="px-3 py-1 rounded bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                                                        Approved {approvedCount}
                                                    </span>
                                                    <span className="px-3 py-1 rounded bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                                                        Rejected {rejectedCount}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-1 text-center">
                                                <button onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-2 py-1.5 rounded transition-colors shadow-sm">
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
                            const rejectedCount = user.riwayat.filter((r) => r.status_dinas === 2).length;

                            return (
                                <div key={user.id_user} onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-emerald-300 active:scale-[0.98] transition-all duration-200 cursor-pointer p-4">
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
                    {totalItems > itemsPerPage && (
                        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-6" />
                    )}
                </>
            )}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedUser(null); }} title={`Riwayat Perjalanan Dinas ${selectedUser?.nama_user || ""}`} note="Berikut adalah rangkuman riwayat perjalanan dinas. Silakan pilih data untuk melihat detail surat dinas secara lengkap." size="lg">

                {selectedUser ? (
                    <div className="space-y-4">
                        {selectedUser.riwayat?.length > 0 ? (

                            selectedUser.riwayat.map((r) => {
                                const isApproved = r.status_dinas === 1;
                                const statusLabel = isApproved ? "Disetujui" : "Ditolak";
                                const statusColor = isApproved ? "text-green-700" : "text-red-700";
                                const statusBg = isApproved ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
                                const kategoriLabel = r.kategori === "1" ? "Perjalanan Dinas Dalam Kota" : r.kategori === "2" ? "Perjalanan Dinas Luar Kota" : "Kategori Lain";
                                const kategoriBg = r.kategori === "1" ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200";

                                return (
                                    <div key={r.id} onClick={(e) => { e.stopPropagation(); navigate(`/pengajuan-dinas/${r.id}`); }} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all duration-200 p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-[11px] px-2.5 py-1 rounded border ${kategoriBg}`}>
                                                {kategoriLabel}
                                            </span>

                                            <span className={`text-[11px] px-2.5 py-1 rounded-full border ${statusBg} ${statusColor} font-semibold flex items-center gap-1`}>
                                                {isApproved ? (
                                                    <i className="fa-solid fa-check-circle"></i>
                                                ) : (
                                                    <i className="fa-solid fa-times-circle"></i>
                                                )}
                                                {isApproved ? "Approved" : "Rejected"}
                                            </span>
                                        </div>

                                        <div className="mb-1">
                                            <span className="text-[15px] font-semibold text-gray-900">
                                                {formatFullDate(r.tgl_berangkat)}
                                                {r.kategori === "2" && r.tgl_pulang && (
                                                    <> – {formatFullDate(r.tgl_pulang)}</>
                                                )}
                                            </span>
                                            {r.kategori === "2" && !r.tgl_pulang && (
                                                <span className="text-gray-500 ml-1"> • Belum Pulang</span>
                                            )}
                                        </div>

                                        <div className="text-xs text-gray-600 mb-2">
                                            Jam Berangkat: {r.waktu?.substring(0, 5) || "-"}
                                        </div>

                                        <div className="text-sm text-gray-700 mb-3 leading-snug line-clamp-2">
                                            {r.keterangan}
                                        </div>

                                        <div className={`text-[12px] ${statusColor} flex items-start`}>
                                            {isApproved ? (
                                                <i className="fa-solid fa-circle-check text-green-600 mt-[2px]"></i>
                                            ) : (
                                                <i className="fa-solid fa-circle-xmark text-red-600 mt-[2px]"></i>
                                            )}
                                            <span className="leading-tight">
                                                {statusLabel} oleh <strong>{r.approved_by || "-"}</strong>
                                                {r.approved_at && <> pada {formatFullDate(r.approved_at)}</>}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })

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

            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Panduan Riwayat Surat Dinas" note="Informasi ini membantu Anda memahami fitur dan cara menggunakan halaman riwayat surat dinas dengan efektif." size="lg">
                <div className="space-y-4 text-sm text-gray-700">
                    {/* Seksi Pencarian */}
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faSearch} className="text-blue-500 mt-1" />
                        <div>
                            <h4 className="font-semibold text-gray-900">Pencarian Karyawan</h4>
                            <p className="text-gray-600 mt-1">
                                Gunakan kolom pencarian untuk menemukan karyawan atau role tertentu. Hasil pencarian akan muncul secara real-time.
                            </p>
                        </div>
                    </div>

                    {/* Seksi Filter Tanggal */}
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500 mt-1" />
                        <div>
                            <h4 className="font-semibold text-gray-900">Filter Tanggal</h4>
                            <p className="text-gray-600 mt-1">
                                Gunakan input tanggal mulai dan tanggal akhir untuk menampilkan riwayat pengajuan dalam rentang waktu tertentu.
                            </p>
                        </div>
                    </div>

                    {/* Seksi Detail Riwayat */}
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

                    {/* Seksi Tips */}
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

        </div>
    );
};

export default RiwayatSuratDinas;
