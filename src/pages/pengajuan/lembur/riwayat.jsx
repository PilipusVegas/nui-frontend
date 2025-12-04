import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SectionHeader, Modal, EmptyState, Pagination, SearchBar, LoadingSpinner, ErrorState } from "../../../components";
import { faInfoCircle, faMapMarkerAlt, faTriangleExclamation, } from "@fortawesome/free-solid-svg-icons";
import { formatFullDate } from "../../../utils/dateUtils";

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
                <div className="w-full sm:flex-grow">
                    <SearchBar onSearch={setSearchQuery} placeholder="Cari nama user..." className="w-full sm:w-auto" />
                </div>

                <div className="flex w-full sm:w-auto gap-2 items-center">
                    <input type="date" className="border border-gray-300 rounded-lg p-2 w-full sm:w-auto sm:min-w-[150px]" value={startDate || ""} onChange={(e) => setStartDate(e.target.value)} />
                    <span className="text-gray-500 whitespace-nowrap">s/d</span>
                    <input type="date" className="border border-gray-300 rounded-lg p-2 w-full sm:w-auto sm:min-w-[150px]" value={endDate || ""} onChange={(e) => setEndDate(e.target.value)} />
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
                    <div className="hidden sm:block overflow-hidden rounded-xl shadow border border-gray-200">
                        <table className="min-w-full text-sm">
                            <thead className="bg-green-500 text-white uppercase text-sm tracking-wide sticky top-0 z-10">
                                <tr>
                                    {["Nama Karyawan", "Total Riwayat", "Disetujui", "Ditolak", "Total Jam", "Detail"].map((h) => (
                                        <th key={h} className="px-4 py-2 text-center font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((user, idx) => (
                                    <tr key={user.id_user} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-all duration-200`}>
                                        <td className="px-4 py-2 font-medium text-left">
                                            <div className="flex flex-col leading-tight">
                                                <span className="font-semibold text-gray-900">{user.nama_user}</span>
                                                <span className="text-xs text-gray-500">{user.role}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-2 text-center">{user.riwayat.length}x Pengajuan</td>
                                        <td className="px-4 py-2 text-center text-green-700 font-semibold">{user.total_approved} Disetujui</td>
                                        <td className="px-4 py-2 text-center text-red-600 font-semibold">{user.total_rejected} Ditolak</td>
                                        <td className="px-4 py-2 text-center">{user.total_jam_approved} Jam</td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => openDetailModal(user)} className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition">
                                                <FontAwesomeIcon icon={faInfoCircle} />
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                    {/* ===== SUMMARY CARD MOBILE/TABLET ===== */}
                    <div className="grid gap-4 sm:hidden mt-4">
                        {paginatedData.map((user) => (
                            <div key={user.id_user} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition hover:shadow-lg hover:translate-y-1">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-base font-semibold text-gray-900 truncate">{user.nama_user}</p>
                                        <p className="text-sm text-gray-400">{user.role || "Role tidak tersedia"}</p>
                                    </div>
                                    <button onClick={() => openDetailModal(user)} className="inline-flex items-center gap-1 px-3 py-2 rounded  bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition">
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                        Detail
                                    </button>
                                </div>

                                {/* Summary Horizontal */}
                                <div className="flex justify-between text-sm text-gray-700 mt-2">
                                    <div className="flex-1 flex flex-col items-center p-2 bg-gray-50 rounded-lg mx-1">
                                        <span className="font-medium text-gray-500">Riwayat</span>
                                        <span className="font-semibold text-gray-900">{user.riwayat.length}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center p-2 bg-green-50 rounded-lg mx-1">
                                        <span className="font-medium text-green-700">Disetujui</span>
                                        <span className="font-semibold text-green-900">{user.total_approved}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center p-2 bg-red-50 rounded-lg mx-1">
                                        <span className="font-medium text-red-700">Ditolak</span>
                                        <span className="font-semibold text-red-900">{user.total_rejected}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center p-2 bg-gray-50 rounded-lg mx-1">
                                        <span className="font-medium text-gray-500">Total Jam</span>
                                        <span className="font-semibold text-gray-900">{user.total_jam_approved} Jam</span>
                                    </div>
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
