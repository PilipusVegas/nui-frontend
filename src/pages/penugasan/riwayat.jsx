import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { faExclamationTriangle, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar,} from "../../components";

const RiwayatPenugasan = () => {
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [tugas, setTugas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchRiwayat = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithJwt(`${apiUrl}/tugas/riwayat`);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const json = await res.json();
            setTugas(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error("Gagal memuat data riwayat tugas:", err);
            setError("Gagal memuat data riwayat tugas. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiwayat();
    }, []);

    // === Filter Pencarian ===
    const filteredTugas = tugas.filter((t) =>
        t.nama.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    // === Pagination ===
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTugas = filteredTugas.slice(indexOfFirstItem, indexOfLastItem);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    // === Format Tanggal ===
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="w-full mx-auto">
            <SectionHeader
                title="Riwayat Penugasan"
                subtitle={`Menampilkan ${tugas.length} riwayat penugasan yang telah diselesaikan.`}
                onBack={() => navigate("/penugasan")}
                actions={
                    <button
                        onClick={() => navigate("/penugasan")}
                        className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        <FontAwesomeIcon icon={faClockRotateLeft} className="text-sm sm:text-base" />
                        <span className="hidden md:inline ml-2">Kembali</span>
                    </button>
                }
            />

            <div className="my-3">
                <SearchBar
                    className="max-w-lg sm:max-w-full"
                    placeholder="Cari nama tugas..."
                    onSearch={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* === TABLE DESKTOP === */}
            <div className="hidden md:block">
                <div className="mt-3 overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-md">
                    <table className="w-full text-sm text-left border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <thead className="bg-green-500 text-white font-semibold">
                            <tr>
                                <th className="px-5 py-3 text-center w-16">No.</th>
                                <th className="px-5 py-3">Judul Penugasan</th>
                                <th className="px-5 py-3 text-center">Kategori</th>
                                <th className="px-5 py-3 text-center">Deadline</th>
                                <th className="px-5 py-3 text-center">Jumlah Pekerjaan</th>
                                <th className="px-5 py-3 text-center w-50">Menu</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center">
                                        <LoadingSpinner size="lg" text="Memuat data riwayat..." />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center">
                                        <ErrorState message={error} onRetry={fetchRiwayat} />
                                    </td>
                                </tr>
                            ) : currentTugas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center">
                                        <EmptyState message="Belum ada riwayat penugasan." />
                                    </td>
                                </tr>
                            ) : (
                                currentTugas.map((item, index) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                                        <td className="px-5 py-2 text-center">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="px-5 py-2 font-semibold text-gray-800 uppercase truncate max-w-[200px]">
                                            {item.nama}
                                        </td>
                                        <td className="px-5 py-2 text-center">
                                            <span
                                                className={`inline-block px-1 py-0.5 text-sm font-semibold rounded-md capitalize min-w-[100px] ${item.category === "daily"
                                                        ? "bg-green-100 text-green-700 border border-green-300"
                                                        : item.category === "urgent"
                                                            ? "bg-red-100 text-red-700 border border-red-300"
                                                            : "bg-gray-100 text-gray-700 border border-gray-300"
                                                    }`}
                                            >
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
                                            <button
                                                onClick={() => navigate(`/penugasan/show/${item.id}`)}
                                                className="px-3 py-1.5 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredTugas.length > itemsPerPage && (
                    <div className="mt-2">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredTugas.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* === CARD MOBILE === */}
            <div className="md:hidden space-y-4">
                {loading && (
                    <div className="text-center py-10">
                        <LoadingSpinner text="Memuat data riwayat..." />
                    </div>
                )}
                {!loading && error && (
                    <ErrorState message={error} onRetry={fetchRiwayat} />
                )}
                {!loading && !error && currentTugas.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-5xl mb-3 text-gray-400"
                        />
                        <div className="text-base font-medium">
                            Belum ada riwayat penugasan.
                        </div>
                    </div>
                )}

                {!loading &&
                    !error &&
                    currentTugas.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-100 rounded-2xl shadow-md p-4 transition hover:shadow-lg"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-800 leading-snug">
                                        {item.nama}
                                    </h2>
                                    <div className="text-[11px] text-gray-500 mt-1">
                                        Deadline: {formatDate(item.deadline_at)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/penugasan/show/${item.id}`)}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                >
                                    Detail
                                </button>
                            </div>
                        </div>
                    ))}

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

export default RiwayatPenugasan;
