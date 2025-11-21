import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { faPlus, faEye, faTrash, faPen, faClipboardList, faPause, faChartLine, faListCheck, faFire, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal, Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar, SummaryCard, } from "../../components";
import Swal from "sweetalert2";

const Penugasan = () => {
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const [tugas, setTugas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchTugas = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithJwt(`${apiUrl}/tugas`);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const json = await res.json();
            setTugas(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error("Gagal memuat data tugas:", err);
            setError("Gagal memuat data tugas. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTugas();
    }, []);

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Konfirmasi Penghapusan",
            text: "Yakin ingin menghapus penugasan ini? jika terhapus, penugasan tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        });
        if (!confirm.isConfirmed) return;
        try {
            const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            await res.json();
            toast.success("Penugasan berhasil dihapus.");
            fetchTugas();
        } catch (err) {
            console.error("Gagal menghapus penugasan:", err);
            toast.error("Gagal menghapus penugasan. Silakan coba lagi.");
        }
    };

    const filteredTugas = tugas.filter((t) =>
        t.nama.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTugas = filteredTugas.slice(indexOfFirstItem, indexOfLastItem);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    };

    // === SUMMARY COUNT TAMBAHAN ===
    const totalButuhApproval = tugas.reduce((acc, t) => {
        const count = t.details?.filter(d => d.finished_at && d.status === 0).length || 0;
        return acc + count;
    }, 0);
    const totalPaused = tugas.reduce((acc, t) => {
        const count = t.details?.filter(d => d.is_paused === 1).length || 0;
        return acc + count;
    }, 0);
    const averageProgress = (() => {
        if (tugas.length === 0) return 0;
        const list = tugas.map(t => {
            const total = t.details?.length || 0;
            const selesai = t.details?.filter(d => d.finished_at)?.length || 0;
            return total > 0 ? (selesai / total) * 100 : 0;
        });
        const avg = list.reduce((a, b) => a + b, 0) / list.length;
        return Math.round(avg);
    })();
    const jumlahPenugasan = tugas.length;
    const kategoriUrgent = tugas.filter(t => t.category === "urgent").length;
    const kategoriDaily = tugas.filter(t => t.category === "daily").length;


    return (
        <div className="w-full mx-auto">
            <SectionHeader title="Daftar Penugasan" subtitle={`Menampilkan ${tugas.length} data penugasan yang tercatat dalam sistem.`} onBack={() => navigate("/")}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => navigate("/penugasan/tambah")} className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                            <FontAwesomeIcon icon={faPlus} className="text-sm sm:text-base" />
                            <span className="hidden md:inline ml-2">Tambah Tugas</span>
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
                <SummaryCard icon={faClipboardList} title="Butuh Approval" value={totalButuhApproval} />
                <SummaryCard icon={faPause} title="Tugas Di-Pause" value={totalPaused} />
                <SummaryCard icon={faChartLine} title="Rata-Rata Progress" value={`${averageProgress}%`} />
                <SummaryCard icon={faListCheck} title="Jumlah Penugasan" value={jumlahPenugasan} />
                <SummaryCard icon={faFire} title="Kategori Urgent" value={kategoriUrgent} />
                <SummaryCard icon={faCalendar} title="Kategori Daily" value={kategoriDaily} />
            </div>

            <div className="my-3">
                <SearchBar className="max-w-lg sm:max-w-full" placeholder="Cari nama tugas..." onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }} />
            </div>

            <div className="space-y-5 mt-4">
                {loading && (
                    <div className="text-center py-10">
                        <LoadingSpinner text="Memuat data penugasan..." />
                    </div>
                )}

                {!loading && error && <ErrorState message={error} onRetry={fetchTugas} />}

                {!loading && !error && currentTugas.length === 0 && (
                    <EmptyState message="Belum ada data penugasan." />
                )}

                {!loading &&
                    !error &&
                    currentTugas.map((item, index) => {
                        const totalPekerja = item.details?.length || 0;
                        const selesai = item.details?.filter(d => d.finished_at && [0, 1].includes(d.status))?.length || 0;
                        const progressPersen = totalPekerja > 0 ? Math.round((selesai / totalPekerja) * 100) : 0;

                        const pendingCount = item.details?.filter(d => d.finished_at && d.status === 0)?.length || 0;
                        const disetujuiCount = item.details?.filter(d => d.status === 1)?.length || 0;
                        const ditolakCount = item.details?.filter(d => d.status === 2)?.length || 0;
                        const ditundaCount = item.details?.filter(d => d.is_paused === 1)?.length || 0;

                        const now = new Date();
                        const deadline = new Date(item.deadline_at);
                        const diffHari = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

                        const waktuStatus =
                            diffHari > 0
                                ? `Tersisa ${diffHari} hari`
                                : diffHari === 0
                                    ? "Hari terakhir"
                                    : `Terlambat ${Math.abs(diffHari)} hari`;

                        return (
                            <div key={item.id} className=" bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md  transition-all duration-300 p-4 flex flex-col gap-3">

                                {/* ===== WRAPPER ===== */}
                                <div className="flex flex-col gap-4 w-full">

                                    {/* ===== HEADER (NOMOR + JUDUL) ===== */}
                                    <div className="flex items-start gap-2">
                                        <span className="text-sm font-semibold text-gray-500 mt-[2px]">
                                            {indexOfFirstItem + index + 1}.
                                        </span>

                                        <h2 className="text-[16px] font-semibold text-gray-900 leading-snug line-clamp-2 break-words">
                                            {item.nama}
                                        </h2>
                                    </div>

                                    {/* ===== INFO GRID ===== */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">

                                        {/* LEFT BLOCK — TANGGAL */}
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <span className="text-sm text-gray-500">Mulai</span>
                                                <div className="text-base font-semibold">{formatDate(item.start_date)}</div>
                                            </div>

                                            <div>
                                                <span className="text-sm text-gray-500">Tenggat Waktu</span>
                                                <div className="text-base font-semibold">{formatDate(item.deadline_at)}</div>
                                            </div>
                                        </div>

                                        {/* RIGHT BLOCK — PENUGASAN + BADGE + DONUT */}
                                        <div className="flex items-center justify-between md:justify-end gap-6 flex-wrap">

                                            {/* PENUGASAN */}
                                            <div className="flex flex-col min-w-[70px]">
                                                <span className="text-sm text-gray-500">Penugasan</span>
                                                <span className="text-base font-semibold">{totalPekerja}</span>
                                            </div>

                                            {/* BADGE */}
                                            <span
                                                className={`px-3 py-[6px] text-xs font-medium rounded-md border capitalize
          ${item.category === "urgent"
                                                        ? "bg-red-100 text-red-700 border-red-200"
                                                        : "bg-green-100 text-green-700 border-green-200"
                                                    }
        `}
                                            >
                                                {item.category}
                                            </span>

                                            {/* DONUT */}
                                            <div className="relative h-11 w-11">
                                                <svg className="h-11 w-11">
                                                    <circle cx="22" cy="22" r="16" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                                    <circle
                                                        cx="22" cy="22" r="16"
                                                        stroke="#f59e0b"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        strokeDasharray={2 * Math.PI * 16}
                                                        strokeDashoffset={(2 * Math.PI * 16) * (1 - progressPersen / 100)}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-gray-700">
                                                    {progressPersen}%
                                                </span>
                                            </div>

                                        </div>
                                    </div>

                                    {/* ===== STATUS COUNTERS ===== */}
                                    <div className="flex flex-wrap gap-5 text-[11px] mt-1">

                                        <div className="text-center min-w-[60px]">
                                            <p className="text-blue-700 font-semibold">Pending</p>
                                            <p className="font-bold text-blue-800 text-[12px]">{pendingCount}</p>
                                        </div>

                                        <div className="text-center min-w-[60px]">
                                            <p className="text-green-700 font-semibold">Disetujui</p>
                                            <p className="font-bold text-green-800 text-[12px]">{disetujuiCount}</p>
                                        </div>

                                        <div className="text-center min-w-[60px]">
                                            <p className="text-red-700 font-semibold">Ditolak</p>
                                            <p className="font-bold text-red-800 text-[12px]">{ditolakCount}</p>
                                        </div>

                                        {item.category === "urgent" && (
                                            <div className="text-center min-w-[60px]">
                                                <p className="text-amber-700 font-semibold">Ditunda</p>
                                                <p className="font-bold text-amber-800 text-[12px]">{ditundaCount}</p>
                                            </div>
                                        )}
                                    </div>

                                </div>


                                <div className="flex justify-end mt-2">
                                    <div className="flex flex-col items-end">
                                        <div className="flex gap-2">
                                            <button onClick={() => navigate(`/penugasan/show/${item.id}`)} className=" flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 text-white text-[11px] hover:bg-blue-700 transition">
                                                <FontAwesomeIcon icon={faEye} />
                                                <span>Lihat</span>
                                            </button>
                                            <button onClick={() => navigate(`/penugasan/edit/${item.id}`)} className=" flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 text-white text-[11px] hover:bg-amber-600 transition">
                                                <FontAwesomeIcon icon={faPen} />
                                                <span>Edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className=" flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 text-white text-[11px] hover:bg-red-700 transition">
                                                <FontAwesomeIcon icon={faTrash} />
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                {filteredTugas.length > itemsPerPage && (
                    <div className="mt-4">
                        <Pagination currentPage={currentPage} totalItems={filteredTugas.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>



            <Modal isOpen={false} onClose={() => { }} title="Detail Penugasan" note="Informasi fitur menu  penugasan lengkap akan ditampilkan di sini.">
                <div></div>
            </Modal>
        </div>
    );
};

export default Penugasan;
