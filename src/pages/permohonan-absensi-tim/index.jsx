import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faCalendarDay, faClock, } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal, LoadingSpinner, ErrorState, EmptyState, SearchBar, Pagination, } from "../../components";


const PermohonanAbsensiTim = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const itemsPerPage = 5;
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [approvalData, setApprovalData] = useState([]);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxSlides, setLightboxSlides] = useState([]);

    const openLightbox = (slides) => {
        setLightboxSlides(slides);
        setLightboxOpen(true);
    };

    /* ===== PAGINATION + SEARCH ===== */
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

    /* ===== FETCH DATA ===== */
    const fetchApprovalData = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const res = await fetchWithJwt(`${apiUrl}/absen/pending?kategori=3`);
            if (res.status === 404) {
                setApprovalData([]);
                return;
            }
            if (!res.ok) throw new Error("Gagal mengambil data permohonan absensi.");
            const result = await res.json();
            const flattened = Array.isArray(result.data)
                ? result.data.flatMap((user) =>
                    (user.absen || [])
                        .filter((a) => a.kategori === 3)
                        .map((a) => ({
                            ...a,
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

    /* ===== ACTION ===== */
    const handleUpdateStatus = async (item, status) => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/absen/status/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Gagal memperbarui status absensi.");
            toast.success(status === 1 ? "Permohonan absensi tim disetujui." : "Permohonan absensi tim ditolak.");
            fetchApprovalData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleApprove = (item) => handleUpdateStatus(item, 1);
    const handleReject = (item) => handleUpdateStatus(item, 2);

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
                <SearchBar value={searchQuery} onSearch={setSearchQuery} placeholder="Cari Nama Karyawan..." />
            </div>
            {isLoading && <LoadingSpinner />}
            {!isLoading && errorMessage && (
                <ErrorState message="Gagal Memuat Data" detail={errorMessage} onRetry={fetchApprovalData} />
            )}
            {!isLoading && !errorMessage && paginatedData.data.length === 0 && (
                <EmptyState title="Tidak Ada Permohonan" description="Belum ada permohonan absensi Tim." />
            )}


            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {!isLoading &&
                    !errorMessage &&
                    paginatedData.data.map((a) => {
                        const fotoMulai = a.foto_mulai ? `${apiUrl}/uploads/img/absen/${a.foto_mulai}`
                            : null;
                        const fotoSelesai = a.foto_selesai
                            ? `${apiUrl}/uploads/img/absen/${a.foto_selesai}`
                            : null;

                        return (
                            <div
                                key={a.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 flex flex-col gap-5"
                            >
                                {/* HEADER */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            {a.nama_user}
                                        </h3>
                                        <p className="text-xs text-gray-500">{a.role}</p>
                                    </div>

                                    <span className="text-[11px] px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                                        Absensi Tim
                                    </span>
                                </div>

                                {/* SUBMITTER */}
                                <div className="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2">
                                    Diajukan oleh{" "}
                                    <span className="font-medium text-gray-800">
                                        {a.created_by || "-"}
                                    </span>
                                </div>

                                {/* INFO SHIFT */}
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon
                                            icon={faCalendarDay}
                                            className="text-gray-400 text-sm"
                                        />
                                        <span>{formatFullDate(a.tanggal_absen)}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon
                                            icon={faClock}
                                            className="text-gray-400 text-sm"
                                        />
                                        <span>
                                            {a.nama_shift} ({a.shift_masuk} – {a.shift_pulang})
                                        </span>
                                    </div>
                                </div>

                                {/* ABSENSI */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* MASUK */}
                                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                                        <p className="text-[11px] font-semibold text-gray-500 uppercase">
                                            Absen Masuk
                                        </p>

                                        <div className="flex items-center gap-3">
                                            {fotoMulai ? (
                                                <button
                                                    onClick={() =>
                                                        openLightbox([{ src: fotoMulai, title: "Absen Masuk" }])
                                                    }
                                                    className="shrink-0"
                                                >
                                                    <img
                                                        src={fotoMulai}
                                                        alt="Absen Masuk"
                                                        className="w-14 h-14 rounded-lg object-cover"
                                                    />
                                                </button>
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                                                    No Photo
                                                </div>
                                            )}

                                            <div className="flex flex-col leading-tight">
                                                <span className="text-xs text-gray-500">Jam Masuk</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {a.absen_masuk ? formatTime(a.absen_masuk) : "-"}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-600 truncate">
                                            {a.tempat_mulai || "-"}
                                        </p>
                                    </div>

                                    {/* PULANG */}
                                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                                        <p className="text-[11px] font-semibold text-gray-500 uppercase">
                                            Absen Pulang
                                        </p>

                                        <div className="flex items-center gap-3">
                                            {fotoSelesai ? (
                                                <button
                                                    onClick={() =>
                                                        openLightbox([{ src: fotoSelesai, title: "Absen Pulang" }])
                                                    }
                                                    className="shrink-0"
                                                >
                                                    <img
                                                        src={fotoSelesai}
                                                        alt="Absen Pulang"
                                                        className="w-14 h-14 rounded-lg object-cover"
                                                    />
                                                </button>
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                                                    No Photo
                                                </div>
                                            )}

                                            <div className="flex flex-col leading-tight">
                                                <span className="text-xs text-gray-500">Jam Pulang</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {a.absen_pulang ? formatTime(a.absen_pulang) : "-"}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-600 truncate">
                                            {a.tempat_selesai || "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* KENDALA */}
                                <div className="text-sm text-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">Deskripsi Kendala</p>
                                    <p className="leading-relaxed">{a.deskripsi || "-"}</p>
                                </div>

                                {/* ACTION */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button onClick={() => handleReject(a)} className="py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition">
                                        Tolak
                                    </button>

                                    <button onClick={() => handleApprove(a)} className="py-2 rounded-lg bg-green-600 text-sm text-white hover:bg-green-700 transition"  >
                                        Setujui
                                    </button>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {paginatedData.total > itemsPerPage && (
                <Pagination currentPage={currentPage} totalItems={paginatedData.total} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-6" />
            )}


            {/* ===== LIGHTBOX ===== */}
            <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={lightboxSlides} />
        </div>
    );
};

export default PermohonanAbsensiTim;
