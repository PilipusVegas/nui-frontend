import toast from "react-hot-toast";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar, Pagination} from "../../components";

import DetailAbsensiTimModal from "../permohonan-absensi-tim/DetailAbsensiTimModal";

const ITEMS_PER_PAGE = 5;

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
    const handleUpdateStatus = async (item, status) => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/absen/status/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Gagal memperbarui status absensi.");

            toast.success(
                status === 1
                    ? "Permohonan absensi tim disetujui."
                    : "Permohonan absensi tim ditolak."
            );

            fetchApprovalData();
        } catch (err) {
            toast.error(err.message);
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
                <ErrorState
                    message="Gagal Memuat Data"
                    detail={errorMessage}
                    onRetry={fetchApprovalData}
                />
            )}

            {!isLoading && !errorMessage && filteredData.length === 0 && (
                <EmptyState
                    title="Tidak Ada Permohonan"
                    description="Belum ada permohonan absensi tim yang perlu divalidasi."
                />
            )}

            {!isLoading && !errorMessage && filteredData.length > 0 && (
                <div className="space-y-4">
                    {paginatedData.map((user) => (
                        <div
                            key={user.id_user}
                            className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between"
                        >
                            {/* INFO USER */}
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {user.nama}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.role} • {user.absen.length} permohonan
                                </p>
                            </div>

                            {/* ACTION */}
                            <button
                                onClick={() => openDetailModal(user)}
                                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Lihat Detail
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    ))}
                </div>
            )}


            {/* ===== PAGINATION ===== */}
            {filteredData.length > ITEMS_PER_PAGE && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    className="mt-6"
                />
            )}

            {/* ===== MODAL DETAIL ===== */}
            <DetailAbsensiTimModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                data={selectedItem}
                onApprove={(item) => handleUpdateStatus(item, 1)}
                onReject={(item) => handleUpdateStatus(item, 2)}
            />
        </div>
    );
};

export default PermohonanAbsensiTim;
