import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faInfoCircle, faPenFancy } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, Modal, Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";

const Penugasan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const [tugas, setTugas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openDetail, setOpenDetail] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // === Fetch Data ===
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
            <SectionHeader title="Data Penugasan" subtitle={`Menampilkan ${tugas.length} daftar tugas yang terdaftar.`} onBack={() => navigate("/")}
                actions={
                    <button className="flex items-center justify-center px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2" onClick={() => navigate("/penugasan/tambah")}>
                        <FontAwesomeIcon icon="plus" className="mr-2" />
                        Tambah Tugas
                    </button>
                }
            />

            {/* Search Bar */}
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
            <div className="hidden sm:block">
                <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-green-600 text-white font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-center w-16">No.</th>
                                <th className="px-4 py-3">Nama Tugas</th>
                                <th className="px-4 py-3 text-center">Kategori</th>
                                <th className="px-4 py-3 text-center">Deadline</th>
                                <th className="px-4 py-3 text-center">Jumlah Pekerjaan</th>
                                <th className="px-4 py-3 text-center w-32">Menu</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center">
                                        <LoadingSpinner size="lg" text="Memuat data penugasan..." />
                                    </td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center">
                                        <ErrorState message={error} onRetry={fetchTugas} />
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && currentTugas.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center">
                                        <EmptyState message="Belum ada data penugasan." />
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                !error &&
                                currentTugas.length > 0 &&
                                currentTugas.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <tr className="border-t hover:bg-gray-50 transition">
                                            <td className="px-4 py-2 text-center">
                                                {indexOfFirstItem + index + 1}
                                            </td>
                                            <td className="px-4 py-2 font-semibold text-gray-800">
                                                {item.nama}
                                            </td>
                                            <td className="px-4 py-2 text-center text-gray-700">
                                                {item.category}
                                            </td>
                                            <td className="px-4 py-2 text-center text-gray-700">
                                                {formatDate(item.deadline_at)}
                                            </td>
                                            <td className="px-4 py-2 text-center text-gray-700">
                                                {item.details?.length || 0} orang
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {/* Tombol Detail */}
                                                    <button
                                                        onClick={() => setOpenDetail(openDetail === item.id ? null : item.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold shadow-sm hover:bg-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                    >
                                                        <FontAwesomeIcon icon={faInfoCircle} className="text-[11px]" />
                                                        <span>Detail</span>
                                                    </button>

                                                    {/* Tombol Edit */}
                                                    <button
                                                        onClick={() => navigate(`/penugasan/edit/${item.id}`)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold shadow-sm hover:bg-amber-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                                    >
                                                        <FontAwesomeIcon icon={faPenFancy} className="text-[11px]" />
                                                        <span>Edit</span>
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>

                                        {openDetail === item.id && (
                                            <tr className="bg-gray-50 transition-all">
                                                <td colSpan="5" className="px-5 py-3 text-sm text-gray-700">
                                                    <div className="border-l-4 border-blue-500 pl-3">
                                                        <strong>Rincian Tugas:</strong>
                                                        <ul className="list-disc pl-5 mt-2 space-y-1">
                                                            {item.details?.map((d, idx) => (
                                                                <li key={d.id}>
                                                                    <span className="font-semibold">#{idx + 1}</span> –{" "}
                                                                    {d.deskripsi || "Tanpa deskripsi"}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Desktop */}
                {filteredTugas.length > itemsPerPage && (
                    <div className="mt-2">
                        <Pagination currentPage={currentPage} totalItems={filteredTugas.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            {/* === CARD MOBILE === */}
            <div className="sm:hidden space-y-4">
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
