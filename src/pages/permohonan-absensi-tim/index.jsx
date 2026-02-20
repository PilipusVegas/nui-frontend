import toast from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faChevronRight, faIdBadge } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar, Pagination } from "../../components";
import DetailAbsensiTimModal from "../permohonan-absensi-tim/DetailAbsensiTimModal";

const ITEMS_PER_PAGE = 10;

const PermohonanAbsensiTim = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    /* ================= STATE ================= */
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [approvalList, setApprovalList] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    /* ================= FETCH ================= */
    const fetchApprovalData = useCallback(async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const res = await fetchWithJwt(`${apiUrl}/absen/pending?kategori=3`);
            if (res.status === 404) {
                setApprovalList([]);
                return;
            }
            if (!res.ok) throw new Error("Gagal mengambil data permohonan absensi.");
            const result = await res.json();

            // FLATTEN: 1 ABSEN = 1 ITEM
            const usersWithPendingAbsen = Array.isArray(result.data)
                ? result.data
                    .map((user) => ({
                        ...user,
                        absen: (user.absen || []).filter((a) => a.kategori === 3),
                    }))
                    .filter((user) => user.absen.length > 0)
                : [];

            setApprovalList(usersWithPendingAbsen);

        } catch (err) {
            setErrorMessage(err.message || "Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        fetchApprovalData();
    }, [fetchApprovalData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    /* ================= FILTER + PAGINATION ================= */
    const filteredData = approvalList.filter((item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    /* ================= ACTION ================= */
    const handleUpdateStatus = async (absenId, action) => {
        try {
            const payload = {
                id_absen_approved: action === "approve" ? [absenId] : [],
                id_absen_rejected: action === "reject" ? [absenId] : [],
            };

            const res = await fetchWithJwt(`${apiUrl}/absen/pending`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Gagal memperbarui status absensi.");

            toast.success(
                action === "approve"
                    ? "Permohonan absensi tim disetujui."
                    : "Permohonan absensi tim ditolak."
            );

            // 🔑 UPDATE MODAL DATA (INI KUNCI)
            setSelectedItem((prev) => {
                if (!prev) return prev;

                const updatedAbsen = prev.absen.filter(
                    (a) => a.id !== absenId
                );

                // Kalau masih ada absen → update modal
                if (updatedAbsen.length > 0) {
                    return { ...prev, absen: updatedAbsen };
                }

                // Kalau sudah habis → tutup modal
                setIsDetailOpen(false);
                return null;
            });

            // Tetap sync list utama
            fetchApprovalData();

        } catch (err) {
            toast.error(err.message || "Terjadi kesalahan.");
        }
    };

    const openDetailModal = (item) => {
        setSelectedItem(item);
        setIsDetailOpen(true);
    };

    /* ================= RENDER ================= */
    return (
        <div className="flex flex-col">
            {/* ===== HEADER ===== */}
            <SectionHeader
                title="Permohonan Absensi Tim"
                subtitle="Daftar permohonan validasi absensi anggota tim"
                onBack={() => navigate("/home")}
                actions={
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-md font-medium">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span className="hidden sm:inline">Informasi</span>
                    </button>
                }
            />

            {/* ===== SEARCH ===== */}
            <div className="mb-4">
                <SearchBar
                    value={searchQuery}
                    onSearch={setSearchQuery}
                    placeholder="Cari nama karyawan…"
                />
            </div>

            {/* ===== STATE HANDLER ===== */}
            {isLoading && <LoadingSpinner />}

            {!isLoading && errorMessage && (
                <ErrorState message="Gagal Memuat Data" detail={errorMessage} onRetry={fetchApprovalData} />
            )}

            {!isLoading && !errorMessage && filteredData.length === 0 && (
                <EmptyState title="Tidak Ada Permohonan" description="Belum ada permohonan absensi tim yang perlu divalidasi." />
            )}

            {!isLoading && !errorMessage && filteredData.length > 0 && (
                <div className="space-y-4">
                    {paginatedData.map((user) => (
                        <div
                            key={user.id_user}
                            onClick={() => openDetailModal(user)}
                            className="
    group relative
    bg-white border border-gray-200
    rounded-xl px-4 py-4
    hover:border-emerald-400 hover:shadow-sm
    transition-all cursor-pointer
  "
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                                {/* LEFT CONTENT */}
                                <div className="flex gap-3">
                                    {/* ACCENT */}
                                    <div className="pt-1">
                                        <span
                                            className="
            block w-2.5 h-2.5 rounded-full
            bg-emerald-500
            shadow-[0_0_0_4px_rgba(16,185,129,0.12)]
          "
                                        />
                                    </div>

                                    {/* TEXT */}
                                    <div className="flex flex-col gap-1.5">
                                        {/* NAMA */}
                                        <p className="text-sm font-semibold text-gray-900">
                                            {user.nama}
                                        </p>

                                        {/* ROLE + NIP */}
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-700">
                                            <FontAwesomeIcon icon={faIdBadge} className="text-emerald-600" />
                                            <span>{user.role}</span>
                                            <span className="text-gray-400">•</span>
                                            <span>NIP {user.nip}</span>
                                        </div>

                                        {/* JUMLAH PERMOHONAN */}
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                                            <FontAwesomeIcon icon={faInfoCircle} />
                                            <span>
                                                <span className="font-semibold">{user.absen.length}</span>{" "}
                                                permohonan belum diverifikasi
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION */}
                                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 ml-auto self-start sm:self-center group-hover:text-emerald-700">
                                    <span className="hidden sm:inline">Lihat Detail</span>
                                    <span className="sm:hidden">Detail</span>
                                    <FontAwesomeIcon icon={faChevronRight} className="group-hover:translate-x-0.5 transition" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* ===== PAGINATION ===== */}
            {filteredData.length > ITEMS_PER_PAGE && (
                <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} className="mt-6" />
            )}

            {/* ===== MODAL DETAIL ===== */}
            <DetailAbsensiTimModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                data={selectedItem}
                onApprove={(absen) => handleUpdateStatus(absen.id, "approve")}
                onReject={(absen) => handleUpdateStatus(absen.id, "reject")}
            />
        </div>
    );
};

export default PermohonanAbsensiTim;
