import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { faExclamationTriangle, faPlus, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal, Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";
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
    const [openDetail, setOpenDetail] = useState(null);

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

    // === Filter Search ===
    const filteredTugas = tugas.filter((t) =>
        t.nama.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    // === Pagination ===
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTugas = filteredTugas.slice(indexOfFirstItem, indexOfLastItem);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    // === Format Date ===
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    };

    return (
        <div className="w-full mx-auto">
            <SectionHeader title="Daftar Penugasan" subtitle={`Menampilkan ${tugas.length} data penugasan yang tercatat dalam sistem.`} onBack={() => navigate("/")}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => navigate("/penugasan/tambah")} className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                            <FontAwesomeIcon icon={faPlus} className="text-sm sm:text-base" />
                            <span className="hidden md:inline ml-2">Tambah</span>
                        </button>
                        <button onClick={() => navigate("/penugasan/riwayat")} className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                            <FontAwesomeIcon icon={faClockRotateLeft} className="text-sm sm:text-base" />
                            <span className="hidden md:inline ml-2">Riwayat</span>
                        </button>
                    </div>
                }
            />

            <div className="my-3">
                <SearchBar className="max-w-lg sm:max-w-full" placeholder="Cari nama tugas..." onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }} />
            </div>

            {/* === TABLE DESKTOP === */}
            <div className="hidden md:block">
                <div className="mt-3 overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-md">
                    <table className="w-full text-sm text-left border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <thead className="bg-green-500 text-white font-semibold">
                            <tr>
                                <th className="px-5 py-3 text-center w-16">No.</th>
                                <th className="px-5 py-3">Judul Penugasan</th>
                                <th className="px-5 py-3 text-center">Kategori Tugas</th>
                                <th className="px-5 py-3 text-center">Deadline</th>
                                <th className="px-5 py-3 text-center">Jumlah Pekerjaan</th>
                                <th className="px-5 py-3 text-center w-50">Menu</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center">
                                        <LoadingSpinner size="lg" text="Memuat data penugasan..." />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center">
                                        <ErrorState message={error} onRetry={fetchTugas} />
                                    </td>
                                </tr>
                            ) : currentTugas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center">
                                        <EmptyState message="Belum ada data penugasan." />
                                    </td>
                                </tr>
                            ) : (
                                currentTugas.map((item, index) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                                        <td className="px-5 py-2 text-center">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="px-5 py-2 font-semibold text-gray-800 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap uppercase">
                                            {item.nama}
                                        </td>

                                        <td className="px-5 py-2 text-center">
                                            <span className={`inline-block px-1 py-0.5 text-sm font-semibold rounded-md capitalize min-w-[100px] ${item.category === "daily" ? "bg-green-100 text-green-700 border border-green-300" : item.category === "urgent" ? "bg-red-100 text-red-700 border border-red-300" : "bg-gray-100 text-gray-700 border border-gray-300"}`}>
                                                {item.category}
                                            </span>
                                        </td>

                                        <td className="px-5 py-2 text-center text-gray-700">
                                            {formatDate(item.deadline_at)}
                                        </td>
                                        <td className="px-5 py-2 text-center text-gray-700">
                                            {item.details?.length || 0} orang
                                        </td>
                                        <td className="px-5 py-2 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => navigate(`/penugasan/show/${item.id}`)} className="px-3 py-1.5 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition">
                                                    Detail
                                                </button>
                                                <button onClick={() => navigate(`/penugasan/edit/${item.id}`)} className="px-3 py-1.5 rounded bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 rounded bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition">
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredTugas.length > itemsPerPage && (
                    <div className="mt-2">
                        <Pagination currentPage={currentPage} totalItems={filteredTugas.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>


            {/* === CARD MOBILE === */}
            <div className="md:hidden space-y-4">
                {loading && (
                    <div className="text-center py-10">
                        <LoadingSpinner text="Memuat data penugasan..." />
                    </div>
                )}
                {!loading && error && (
                    <ErrorState message={error} onRetry={fetchTugas} />
                )}
                {!loading && !error && currentTugas.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-5xl mb-3 text-gray-400"
                        />
                        <div className="text-base font-medium">
                            Belum ada data penugasan.
                        </div>
                    </div>
                )}

                {!loading &&
                    !error &&
                    currentTugas.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-md p-4 transition hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-800 leading-snug">
                                        {item.nama}
                                    </h2>
                                    <div className="text-[11px] text-gray-500 mt-1">
                                        Deadline: {formatDate(item.deadline_at)}
                                    </div>
                                </div>
                                <button onClick={() =>
                                    setOpenDetail(openDetail === item.id ? null : item.id)
                                }
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                >
                                    Lihat Detail
                                </button>
                            </div>

                            {openDetail === item.id && (
                                <div className="mt-3 border-t pt-2 border-dashed border-gray-300 text-[11px] text-gray-700 space-y-1">
                                    {item.details?.map((d, idx) => (
                                        <p key={d.id}>
                                            <span className="font-semibold">#{idx + 1}</span> –{" "}
                                            {d.deskripsi || "Tanpa deskripsi"}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                {/* Pagination Mobile */}
                {filteredTugas.length > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredTugas.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default Penugasan;
