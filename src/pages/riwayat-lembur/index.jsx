import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SectionHeader, Modal, EmptyState, Pagination, SearchBar, LoadingSpinner, ErrorState } from "../../components/";
import { faInfoCircle, faMapMarkerAlt, faTriangleExclamation, faSpinner, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { formatFullDate, formatTime } from "../../utils/dateUtils";

const RiwayatLembur = () => {
    const itemsPerPage = 10;
    const Navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [approvalData, setApprovalData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [modalDescription, setModalDescription] = useState("");

    // --- Fetch data ---
    const fetchApprovalData = async () => {
        if (!startDate || !endDate) return;
        setIsLoading(true);
        try {
            const res = await fetchWithJwt(`${apiUrl}/lembur/riwayat?startDate=${startDate}&endDate=${endDate}`);
            if (!res.ok) throw new Error("Gagal mengambil data");
            const json = await res.json();
            setApprovalData(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error(err);
            setApprovalData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const { start, end } = getDefaultPeriod();
        setStartDate(start);
        setEndDate(end);
    }, []);

    useEffect(() => { fetchApprovalData(); }, [apiUrl, startDate, endDate]);
    useEffect(() => { setCurrentPage(1); }, [searchQuery, startDate, endDate]);

    // --- Filtering per search ---
    const filteredData = approvalData.filter(u =>
        u.nama_user.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openModalWithDescription = (desc) => { setModalDescription(desc); setIsModalOpen(true); };
    const closeModal = () => { setModalDescription(""); setIsModalOpen(false); };

    const calculateHours = (start, end) => {
        if (!start || !end) return 0;
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        let diff = (new Date(0, 0, 0, eh, em) - new Date(0, 0, 0, sh, sm)) / 3600000;
        if (diff < 0) diff += 24;
        return diff;
    };

    return (
        <div className="flex flex-col">
            <SectionHeader title="Riwayat Lembur" subtitle="Halaman ini menampilkan riwayat lembur yang sudah disetujui dan ditolak." onBack={() => Navigate("/")} />

            <div className="mb-4 w-full flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-grow flex gap-2">
                    <SearchBar onSearch={setSearchQuery} placeholder="Cari nama user..." className="flex-grow" />
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                    <input type="date" className="border border-gray-300 rounded-lg p-2" value={startDate || ""} onChange={(e) => setStartDate(e.target.value)} />
                    <span className="text-gray-500">-</span>
                    <input type="date" className="border border-gray-300 rounded-lg p-2" value={endDate || ""} onChange={(e) => setEndDate(e.target.value)} />
                    <button onClick={() => { const { start, end } = getDefaultPeriod(); setStartDate(start); setEndDate(end); }} className="p-3 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700">
                        Periode Saat Ini
                    </button>
                </div>
            </div>

            {!startDate || !endDate ? (
                <EmptyState icon={faTriangleExclamation} text="Silakan pilih rentang tanggal terlebih dahulu." />
            ) : isLoading ? (
                <LoadingSpinner text="Memuat data lembur..." />
            ) : filteredData.length === 0 ? (
                <EmptyState icon={faTriangleExclamation} text="Tidak ada riwayat lembur pada periode ini."/>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
                    <table className="min-w-full text-sm border-collapse">
                        <thead className="bg-green-500 text-white uppercase text-sm tracking-wide sticky top-0 z-10">
                            <tr>
                                {["Nama Karyawan", "Total Riwayat", "Disetujui", "Ditolak", "Total Jam", "Detail"].map((h) => (
                                    <th key={h} className="px-5 py-3 text-center font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.map((user, idx) => (
                                <React.Fragment key={user.id_user}>
                                    <tr className={`cursor-pointer transition-all duration-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50`} onClick={() => setExpandedUserId(prev => (prev === user.id_user ? null : user.id_user))}>
                                        <td className="px-5 py-3 font-medium text-left">{user.nama_user}</td>
                                        <td className="px-5 py-3 text-center">{user.riwayat.length}</td>
                                        <td className="px-5 py-3 text-center">{user.total_approved} Disetujui</td>
                                        <td className="px-5 py-3 text-center">{user.total_rejected} Ditolak</td>
                                        <td className="px-5 py-3 text-center">{user.total_jam_approved} Jam Disetujui</td>
                                        <td className="px-5 py-3 text-center">
                                            <FontAwesomeIcon icon={expandedUserId === user.id_user ? faChevronUp : faChevronDown} className="text-gray-500" />
                                        </td>
                                    </tr>

                                    {expandedUserId === user.id_user && (
                                        <tr>
                                            <td colSpan={6} className="p-5">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full text-xs border-collapse">
                                                        <thead className="bg-green-500 text-white font-semibold uppercase">
                                                            <tr>
                                                                {["Tanggal", "Lokasi", "Jam", "Total Jam", "Keterangan", "Status"].map((h, idx, arr) => (
                                                                    <th key={h} className={`px-4 py-2 text-center ${idx === 0 ? "rounded-l-md" : idx === arr.length - 1 ? "rounded-r-md" : ""}`}>
                                                                        {h}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {user.riwayat.map((item, jdx) => {
                                                                const durasi = calculateHours(item.jam_mulai, item.jam_selesai);
                                                                return (
                                                                    <tr key={item.id_lembur} className={`${jdx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-100 transition-colors`}>
                                                                        <td className="px-4 py-2 font-medium text-left">{formatFullDate(item.tanggal)}</td>
                                                                        <td className="px-4 py-2 flex items-start justify-start gap-1 text-green-900">
                                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
                                                                            {item.lokasi || "-"}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            {[item.jam_mulai, item.jam_selesai].map(t => {
                                                                                const [h, m] = t.split(":");
                                                                                return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
                                                                            }).join(" - ")}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">{durasi.toFixed(0)} jam</td>

                                                                        <td className="px-4 py-2 text-center">
                                                                            <button onClick={() => openModalWithDescription(item.deskripsi)} className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg border border-green-300 text-green-700 hover:bg-green-100 transition">
                                                                                <FontAwesomeIcon icon={faInfoCircle} className="text-green-600 text-sm" />
                                                                                Lihat
                                                                            </button>
                                                                        </td>

                                                                        <td className="px-4 py-2 text-center font-semibold">
                                                                            {item.status_lembur === 1 ? (
                                                                                <span className="text-green-700">Disetujui: {item.approved_by || "N/A"}</span>
                                                                            ) : (
                                                                                <span className="text-red-700">Ditolak: {item.approved_by || "N/A"}</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredData.length > itemsPerPage && (
                <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title="Detail Deskripsi" note="Keterangan tambahan dari pengajuan lembur" size="md">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{modalDescription || "Tidak ada deskripsi."}</p>
            </Modal>
        </div>
    );
};

export default RiwayatLembur;
