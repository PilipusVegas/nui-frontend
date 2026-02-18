import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import {
    SectionHeader,
    Modal,
    LoadingSpinner,
    ErrorState,
    EmptyState,
    SearchBar,
    Pagination,
} from "../../components";

const PermohonanAbsensiTim = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const itemsPerPage = 10;

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [approvalData, setApprovalData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [modalDescription, setModalDescription] = useState("");

    /* ================= PAGINATION + SEARCH ================= */
    const paginatedData = (() => {
        const filtered = approvalData.filter((a) =>
            a.nama_user.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const startIndex = (currentPage - 1) * itemsPerPage;
        return {
            total: filtered.length,
            data: filtered.slice(startIndex, startIndex + itemsPerPage),
        };
    })();

    /* ================= FETCH DATA ================= */
    const fetchApprovalData = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const res = await fetchWithJwt(`${apiUrl}/absen/status/batch`);
            if (res.status === 404) {
                setApprovalData([]);
                return;
            }
            if (!res.ok) {
                throw new Error("Gagal mengambil data permohonan absensi.");
            }

            const result = await res.json();

            const flattened = Array.isArray(result.data)
                ? result.data.flatMap((user) =>
                    (user.absen || [])
                        .filter((absen) => absen.kategori === 3) // ✅ kategori 3
                        .map((absen) => ({
                            ...absen,
                            nama_user: user.nama,
                            nip: user.nip,
                            role: user.role,
                        }))
                )
                : [];

            setApprovalData(flattened);
        } catch (err) {
            setErrorMessage(err.message || "Terjadi kesalahan sistem.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovalData();
    }, [apiUrl]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    /* ================= ACTIONS ================= */
    const openModalWithDescription = (desc) => {
        setModalDescription(desc);
        setIsModalOpen(true);
    };

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
                    ? "Permohonan absensi berhasil disetujui."
                    : "Permohonan absensi ditolak."
            );

            fetchApprovalData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleApprove = (item) => handleUpdateStatus(item, 1);
    const handleReject = (item) => handleUpdateStatus(item, 2);

    /* ================= RENDER ================= */
    return (
        <div className="flex flex-col">
            <SectionHeader title="Permohonan Absensi Tim" subtitle="Daftar permohonan validasi absensi anggota tim" onBack={() => navigate("/home")}
                actions={
                    <button onClick={() => setIsInfoModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-md font-medium">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <span className="hidden sm:inline">Informasi</span>
                    </button>
                }
            />

            <div className="mb-4">
                <SearchBar
                    value={searchQuery}
                    onSearch={setSearchQuery}
                    placeholder="Cari Nama Karyawan..."
                />
            </div>

            {/* ================= MOBILE CARD ================= */}
            <div className="lg:hidden space-y-4">
                {isLoading && <LoadingSpinner />}

                {!isLoading && errorMessage && (
                    <ErrorState
                        message="Gagal Memuat Data"
                        detail={errorMessage}
                        onRetry={fetchApprovalData}
                    />
                )}

                {!isLoading && !errorMessage && paginatedData.data.length === 0 && (
                    <EmptyState
                        title="Tidak Ada Permohonan"
                        description="Belum ada permohonan absensi."
                    />
                )}

                {!isLoading &&
                    !errorMessage &&
                    paginatedData.data.map((a) => (
                        <div key={a.id} className="bg-white border rounded-lg shadow-sm p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold uppercase">
                                        {a.nama_user}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {a.role}
                                    </div>
                                </div>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                    Kategori Khusus
                                </span>
                            </div>

                            <div className="text-sm space-y-1">
                                <div>
                                    <span className="font-medium">Tanggal:</span>{" "}
                                    {formatFullDate(a.tanggal_absen)}
                                </div>
                                <div>
                                    <span className="font-medium">Shift:</span>{" "}
                                    {a.nama_shift} ({a.shift_masuk} –{" "}
                                    {a.shift_pulang})
                                </div>
                                <div>
                                    <span className="font-medium">Lokasi:</span>{" "}
                                    {a.tempat_mulai || "-"}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button onClick={() => openModalWithDescription(a.deskripsi)} className="flex-1 text-xs py-2 rounded bg-blue-500 text-white">
                                    Detail
                                </button>
                                <button onClick={() => handleApprove(a)} className="flex-1 text-xs py-2 rounded bg-green-600 text-white">
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>
                                <button onClick={() => handleReject(a)} className="flex-1 text-xs py-2 rounded bg-red-600 text-white">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        </div>
                    ))}
            </div>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden lg:block">
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-green-600 text-white uppercase text-xs">
                                <th className="py-3 px-4 text-center font-semibold">No</th>
                                <th className="py-3 px-4 text-center font-semibold">Tanggal</th>
                                <th className="py-3 px-4 text-left font-semibold">Karyawan</th>
                                <th className="py-3 px-4 text-center font-semibold">Shift</th>
                                <th className="py-3 px-4 text-left font-semibold">Lokasi</th>
                                <th className="py-3 px-4 text-center font-semibold">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {isLoading && (
                                <tr>
                                    <td colSpan={6} className="py-20">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            )}

                            {!isLoading && errorMessage && (
                                <tr>
                                    <td colSpan={6} className="py-20">
                                        <ErrorState
                                            message="Gagal Memuat Data"
                                            detail={errorMessage}
                                            onRetry={fetchApprovalData}
                                        />
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !errorMessage && paginatedData.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20">
                                        <EmptyState
                                            title="Tidak Ada Permohonan"
                                            description="Belum ada permohonan absensi."
                                        />
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                !errorMessage &&
                                paginatedData.data.map((a, i) => {
                                    const idx =
                                        (currentPage - 1) * itemsPerPage + i + 1;

                                    return (
                                        <tr key={a.id} className="hover:bg-gray-50">
                                            {/* NO */}
                                            <td className="text-center font-medium">
                                                {idx}
                                            </td>

                                            {/* TANGGAL */}
                                            <td className="text-center">
                                                {formatFullDate(a.tanggal_absen)}
                                            </td>

                                            {/* KARYAWAN */}
                                            <td>
                                                <div className="font-semibold uppercase">
                                                    {a.nama_user}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {a.role}
                                                </div>
                                            </td>

                                            {/* SHIFT */}
                                            <td className="text-center">
                                                <div className="font-medium">
                                                    {a.nama_shift}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {a.shift_masuk} – {a.shift_pulang}
                                                </div>
                                            </td>

                                            {/* LOKASI */}
                                            <td className="text-sm">
                                                <div>{a.tempat_mulai || "-"}</div>
                                                <div className="text-xs text-gray-500">
                                                    Jarak: {a.jarak_mulai ?? "-"} m
                                                </div>
                                            </td>

                                            {/* AKSI */}
                                            <td>
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            openModalWithDescription(
                                                                a.deskripsi
                                                            )
                                                        }
                                                        className="px-3 py-1 text-xs rounded bg-blue-500 hover:bg-blue-600 text-white"
                                                    >
                                                        Detail
                                                    </button>

                                                    <button onClick={() => handleApprove(a)} className="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white">
                                                        <FontAwesomeIcon icon={faCheck} />
                                                    </button>

                                                    <button onClick={() => handleReject(a)} className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white">
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>


            {paginatedData.total > itemsPerPage && (
                <Pagination currentPage={currentPage} totalItems={paginatedData.total} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-6" />
            )}

            {/* ================= MODALS ================= */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Rincian Absensi"
                note="Detail aktivitas absensi"
            >
                <p className="whitespace-pre-line text-gray-600">
                    {modalDescription || "Tidak ada deskripsi."}
                </p>
            </Modal>

            <Modal isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                title="Informasi Permohonan Absensi"
                note="Panduan Penggunaan"
            >
                <p className="text-sm text-gray-600">
                    Halaman ini digunakan untuk memvalidasi absensi anggota tim,
                    termasuk absensi dinas dan kepatuhan jam kerja.
                </p>
            </Modal>
        </div>
    );
};

export default PermohonanAbsensiTim;
