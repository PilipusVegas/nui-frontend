// src/pages/riwayat-lembur/index.jsx
import { useEffect, useState, useMemo } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { faSearch, faInfoCircle, faMapMarkerAlt, faTriangleExclamation, faChevronUp, faChevronDown, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, Modal } from "../../components/";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";

const RiwayatLembur = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [approvalData, setApprovalData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDescription, setModalDescription] = useState("");
    const [expandedUser, setExpandedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const handleBackClick = () => navigate("/home");

    const fetchApprovalData = async () => {
        try {
            const response = await fetchWithJwt(`${apiUrl}/lembur/approve/`, { method: "GET" });
            if (!response.ok) throw new Error("Gagal mengambil data");
            const result = await response.json();
            if (Array.isArray(result.data)) setApprovalData(result.data);
        } catch (error) {
            console.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovalData();
    }, [apiUrl]);

    const filteredGroupedData = useMemo(() => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate + "T00:00:00");  // awal hari lokal
        const end = new Date(endDate + "T23:59:59");  // akhir hari lokal

        return Object.values(
            approvalData
                .filter(a => {
                    const t = new Date(a.tanggal);   // biarkan JS konversi ke lokal
                    return (
                        (a.status_lembur === 1 || a.status_lembur === 2) &&
                        a.nama_user.toLowerCase().includes(searchQuery.toLowerCase()) &&
                        t >= start && t <= end         // inklusif “sama dengan”
                    );
                })
                .reduce((acc, cur) => {
                    if (!acc[cur.nama_user]) acc[cur.nama_user] = { user: cur.nama_user, data: [] };
                    acc[cur.nama_user].data.push(cur);
                    return acc;
                }, {})
        );
    }, [approvalData, searchQuery, startDate, endDate]);


    const paginatedData = (() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            total: filteredGroupedData.length,
            data: filteredGroupedData.slice(startIndex, endIndex),
        };
    })();

    const toggleUserExpand = (nama) => {
        setExpandedUser((prev) => (prev === nama ? null : nama));
    };

    const openModalWithDescription = (description) => {
        setModalDescription(description);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalDescription("");
    };

    const calculateHours = (start, end) => {
        if (!start || !end) return 0;
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        const startDate = new Date(0, 0, 0, sh, sm);
        const endDate = new Date(0, 0, 0, eh, em);
        let diff = (endDate - startDate) / (1000 * 60 * 60); // jam
        if (diff < 0) diff += 24; // kalau lewat tengah malam
        return diff;
    };


    return (
        <div className="flex flex-col">
            <SectionHeader title="Riwayat Lembur" subtitle="Halaman ini menampilkan riwayat lembur karyawan yang sudah disetujui dan ditolak." onBack={handleBackClick}
                actions={
                    <div className="flex gap-2 flex-wrap items-center">
                        <input type="date" className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500" value={startDate || ""} onChange={(e) => setStartDate(e.target.value)} />
                        <span className="flex items-center text-gray-500">s/d</span>
                        <input type="date" className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500" value={endDate || ""} onChange={(e) => setEndDate(e.target.value)} />

                        {/* Tombol default periode */}
                        <button onClick={() => { const { start, end } = getDefaultPeriod(); setStartDate(start); setEndDate(end); }} className="p-3 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"   >
                            Periode Saat Ini
                        </button>
                    </div>
                }
            />

            {/* Search */}
            <div className="mb-4 w-full relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input type="text" value={searchQuery} placeholder="Cari Nama Karyawan..." className="w-full border border-gray-300 rounded-lg p-2.5 pl-10 shadow focus:outline-none focus:ring-2 focus:ring-green-500" onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="space-y-2.5">
                {!startDate || !endDate ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-6xl" />
                        <p>Silakan pilih rentang tanggal terlebih dahulu.</p>
                    </div>
                ) : paginatedData.data.length > 0 ? (
                    paginatedData.data.map((userGroup) => {
                        const countApproved = userGroup.data.filter((a) => a.status_lembur === 1).length;
                        const countRejected = userGroup.data.filter((a) => a.status_lembur === 2).length;
                        const countData = userGroup.data.length;
                        const totalJam = userGroup.data
                            .filter(a => a.status_lembur === 1) // hanya yang disetujui
                            .reduce(
                                (sum, a) => sum + calculateHours(a.jam_mulai, a.jam_selesai),
                                0
                            );

                        return (
                            <div key={userGroup.user} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition hover:shadow-lg">
                                {/* Header User */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-5 py-4 border-b border-green-200 bg-gradient-to-r from-green-50 via-white to-green-50">
                                    {/* Info Left */}
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="font-semibold text-green-800 capitalize tracking-wide">
                                            {userGroup.user}
                                        </span>
                                        <span className="text-gray-300">|</span>

                                        {countData > 0 && (
                                            <span className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 shadow-sm">
                                                Total: {countData}
                                            </span>
                                        )}
                                        {countApproved > 0 && (
                                            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 shadow-sm">
                                                Disetujui: {countApproved}
                                            </span>
                                        )}
                                        {countRejected > 0 && (
                                            <span className="bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-medium border border-red-200 shadow-sm">
                                                Ditolak: {countRejected}
                                            </span>
                                        )}
                                    </div>

                                    {/* Right Section */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg shadow-sm">
                                            Total Jam :{" "}
                                            <span className="font-bold text-green-800">{totalJam.toFixed(0)}</span> jam
                                        </span>
                                        <button onClick={() => toggleUserExpand(userGroup.user)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 hover:shadow-md transition-all duration-200">
                                            <FontAwesomeIcon icon={expandedUser === userGroup.user ? faChevronUp : faChevronDown} className="text-green-600 text-xs" />
                                            {expandedUser === userGroup.user ? "Tutup Detail" : "Lihat Detail"}
                                        </button>
                                    </div>
                                </div>

                                {/* Detail */}
                                {expandedUser === userGroup.user && (
                                    <div className="p-4">
                                        <div className="overflow-x-auto rounded-lg border border-green-200 shadow-sm">
                                            <table className="w-full text-sm border-collapse">
                                                <thead className="bg-green-500 text-white">
                                                    <tr>
                                                        {["Tanggal", "Jam", "Total Jam", "Lokasi", "Keterangan", "Status"].map((header) => (
                                                            <th key={header} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userGroup.data.map((approval) => {
                                                        const durasi = calculateHours(approval.jam_mulai, approval.jam_selesai);
                                                        return (
                                                            <tr key={approval.id_lembur} className="hover:bg-green-50 transition-colors">
                                                                <td className="px-3 py-1.5 border-t border-green-100 text-xs font-semibold">
                                                                    {new Date(approval.tanggal).toLocaleDateString("id-ID")}
                                                                </td>
                                                                <td className="px-3 py-1.5 border-t border-green-100 text-xs">
                                                                    {approval.jam_mulai} - {approval.jam_selesai}
                                                                </td>
                                                                <td className="px-3 py-1.5 border-t border-green-100">
                                                                    <span className="text-sm font-medium text-gray-800">
                                                                        {durasi.toFixed(0)}
                                                                    </span>
                                                                    <span className="ml-1 text-xs text-gray-500">
                                                                        jam
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-1.5 border-t border-green-100 text-xs">
                                                                    <div className="flex items-center gap-1 text-green-900">
                                                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
                                                                        {approval.lokasi}
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-1.5 border-t border-green-100 text-xs">
                                                                    <button onClick={() => openModalWithDescription(approval.deskripsi)} className="flex items-center gap-1 px-2 py-1 rounded-lg border border-green-300 text-green-700 text-xs font-medium hover:bg-green-50 hover:border-green-400 transition">
                                                                        <FontAwesomeIcon icon={faInfoCircle} className="text-green-600 text-sm" />
                                                                        Lihat Keterangan
                                                                    </button>
                                                                </td>
                                                                <td className="px-3 py-1.5 border-t border-green-100 text-xs">
                                                                    {approval.status_lembur === 1 && (
                                                                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                                                            ✅ oleh {approval.nama_approve || "N/A"}
                                                                        </span>
                                                                    )}
                                                                    {approval.status_lembur === 2 && (
                                                                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                                                            ❌ oleh {approval.nama_approve || "N/A"}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-6xl" />
                        <p>Tidak ada permohonan lembur.</p>
                    </div>
                )}
            </div>

            {paginatedData.total > itemsPerPage && (
                <div className="relative flex justify-center items-center mt-6 text-sm sm:text-base">
                    {/* Panah kiri */}
                    <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                        className={`absolute left-0 px-3 py-2 rounded-full border shadow-sm transition-all duration-200
                            ${currentPage === 1
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>

                    {/* Info halaman */}
                    <span className="px-5 py-2 rounded-full bg-white border border-gray-300 text-gray-700 font-semibold shadow-sm">
                        Halaman {currentPage} / {Math.ceil(paginatedData.total / itemsPerPage)}
                    </span>

                    {/* Panah kanan */}
                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, Math.ceil(paginatedData.total / itemsPerPage))
                            )
                        }
                        disabled={currentPage === Math.ceil(paginatedData.total / itemsPerPage)}
                        className={`absolute right-0 px-3 py-2 rounded-full border shadow-sm transition-all duration-200
                        ${currentPage === Math.ceil(paginatedData.total / itemsPerPage)
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                    >
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            )}


            {/* --- Modal: PENTING — diletakkan di dalam return agar bisa mengakses state/fungsi --- */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Detail Deskripsi" note="Keterangan tambahan dari pengajuan lembur" size="md">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{modalDescription || "Tidak ada deskripsi."}</p>
            </Modal>
        </div>
    );
};

export default RiwayatLembur;
