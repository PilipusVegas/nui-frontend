import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SectionHeader, Modal, EmptyState, Pagination, SearchBar, LoadingSpinner, ErrorState } from "../../components/";
import { faInfoCircle, faMapMarkerAlt, faTriangleExclamation, } from "@fortawesome/free-solid-svg-icons";
import { formatFullDate } from "../../utils/dateUtils";

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
    const [modalDescription, setModalDescription] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [modalSearchQuery, setModalSearchQuery] = useState("");


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

    const filteredData = approvalData.filter(u =>
        u.nama_user.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredRiwayat = selectedUser?.riwayat.filter(item => {
        const tanggalFull = formatFullDate(item.tanggal); // "Minggu, 21 September 2025"
        const tanggalLower = tanggalFull.toLowerCase();   // "minggu, 21 september 2025"
        const lokasi = (item.lokasi ?? "").toLowerCase();
        const query = modalSearchQuery.toLowerCase();

        return tanggalLower.includes(query) || lokasi.includes(query);
    }) || [];

    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openDetailModal = (user) => {
        setSelectedUser(user);
        setModalSearchQuery(""); // reset search setiap kali modal dibuka
        setIsDetailModalOpen(true);
    };


    const closeModal = () => { setModalDescription(""); setIsModalOpen(false); };

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
                <EmptyState icon={faTriangleExclamation} text="Tidak ada riwayat lembur pada periode ini." />
            ) : (
                <div>

                    {/* ===== TABLE UNTUK DESKTOP ===== */}
                    <table className="min-w-full text-sm border-collapse hidden sm:table">
                        <thead className="bg-green-600 text-white uppercase text-sm tracking-wide sticky top-0 z-10">
                            <tr>
                                {["Nama Karyawan", "Total Riwayat", "Disetujui", "Ditolak", "Total Jam", "Detail"].map((h) => (
                                    <th key={h} className="px-4 py-2 text-center font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.map((user, idx) => (
                                <tr key={user.id_user} className={`transition-all duration-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                                    <td className="px-4 py-2 font-medium text-left">{user.nama_user}</td>
                                    <td className="px-4 py-2 text-center">{user.riwayat.length}</td>
                                    <td className="px-4 py-2 text-center">{user.total_approved} Disetujui</td>
                                    <td className="px-4 py-2 text-center">{user.total_rejected} Ditolak</td>
                                    <td className="px-4 py-2 text-center">{user.total_jam_approved} Jam</td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => openDetailModal(user)} className="inline-flex items-center text-xs justify-center gap-1 px-2 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                                            <FontAwesomeIcon icon={faInfoCircle} className="text-white" />
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ===== CARD UNTUK MOBILE/TABLET VERTICAL RAPI ===== */}
                    <div className="grid gap-3 sm:hidden mt-3">
                        {paginatedData.map((user) => (
                            <div
                                key={user.id_user}
                                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition flex flex-col"
                            >
                                {/* Nama Karyawan */}
                                <p className="text-base font-semibold text-gray-900 mb-3 truncate">{user.nama_user}</p>

                                {/* Statistik lembur vertikal */}
                                <div className="flex flex-col divide-y divide-gray-100 text-gray-700 text-sm mb-3">
                                    <div className="flex justify-between py-1">
                                        <span className="font-medium text-gray-600">Riwayat</span>
                                        <span className="font-semibold text-gray-900">{user.riwayat.length}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="font-medium text-gray-600">Disetujui</span>
                                        <span className="font-semibold text-gray-900">{user.total_approved}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="font-medium text-gray-600">Ditolak</span>
                                        <span className="font-semibold text-gray-900">{user.total_rejected}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="font-medium text-gray-600">Total Jam</span>
                                        <span className="font-semibold text-gray-900">{user.total_jam_approved} Jam</span>
                                    </div>
                                </div>

                                {/* Tombol Detail */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => openDetailModal(user)}
                                        className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-xs shadow-sm"
                                    >
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-white" />
                                        Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            )}

            {filteredData.length > itemsPerPage && (
                <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            )}

            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Detail Riwayat Lembur ${selectedUser?.nama_user}`} note="Data riwayat lembur karyawan akan ditampilkan disini berdasarkan rentang tanggal yang dipilih." size="xl">

                {selectedUser && (
                    <div className="space-y-4">

                        <div className="bg-white p-3 rounded-lg border border-black/10 shadow-sm">
                            <h3 className="text-sm font-semibold text-black mb-2">Informasi Lembur</h3>
                            <p className="text-sm text-black/70 leading-relaxed">
                                Riwayat lembur yang diajukan karyawan pada periode terpilih.
                                Setiap entri memuat tanggal, durasi, lokasi, status, dan informasi persetujuan.
                                Tampilan ini dirancang agar ringkas, mudah dibaca, dan nyaman digunakan.
                            </p>
                        </div>

                        <SearchBar onSearch={setModalSearchQuery} placeholder="Cari riwayat berdasarkan tanggal atau lokasi..." className="w-full" />

                        <div className="max-h-[360px] overflow-y-auto scrollbar-green px-1">
                            <div className="space-y-3">

                                {filteredRiwayat.map((item, idx) => {
                                    const tanggal = formatFullDate(item.tanggal);
                                    const approvedAt = item.approved_at ? formatFullDate(item.approved_at) : "-";

                                    return (
                                        <div key={idx} className="bg-white border border-black/10 rounded-lg p-3 shadow-sm hover:shadow transition-all duration-150 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="text-[10px] text-black/50 font-medium">Tanggal</p>
                                                    <p className="text-[12px] font-semibold text-black">{tanggal}</p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] text-black/50 font-medium">Lokasi</p>
                                                    <p className="text-[12px] font-semibold text-black">{item.lokasi ?? "-"}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <p className="text-[10px] text-black/50 font-medium">Mulai</p>
                                                    <p className="text-[12px] font-semibold text-black">{item.jam_mulai || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-black/50 font-medium">Selesai</p>
                                                    <p className="text-[12px] font-semibold text-black">{item.jam_selesai || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-black/50 font-medium">Total</p>
                                                    <p className="text-[12px] font-semibold text-black">{item.total_hour ?? 0} Jam</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-1 border-t border-black/10">
                                                <p className="text-[10px] text-black/70 leading-tight">
                                                    Disetujui oleh{" "}
                                                    <span className="font-semibold text-black">{item.approved_by ?? "N/A"}</span>{" "}
                                                    pada <span className="font-semibold text-black">{approvedAt}</span>
                                                </p>

                                                <p className="text-[11px] font-semibold text-black">
                                                    {item.status_lembur === 1
                                                        ? "Disetujui"
                                                        : item.status_lembur === 0
                                                            ? "Menunggu"
                                                            : "Ditolak"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>
                    </div>
                )}
            </Modal>


            <Modal isOpen={isModalOpen} onClose={closeModal} title="Detail Deskripsi" note="Keterangan tambahan dari pengajuan lembur" size="md">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{modalDescription || "Tidak ada deskripsi."}</p>
            </Modal>
        </div >
    );
};

export default RiwayatLembur;
