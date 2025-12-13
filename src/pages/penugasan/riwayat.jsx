import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle,faEye } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar} from "../../components";
import { formatFullDate } from "../../utils/dateUtils";


const RiwayatPenugasan = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const itemsPerPage = 10;

    const [tugas, setTugas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchRiwayat = async () => {
            setLoading(true);
            try {
                const res = await fetchWithJwt(`${apiUrl}/tugas/riwayat`);
                const json = await res.json();
                setTugas(json.data || []);
            } catch {
                setError("Gagal memuat data riwayat tugas.");
            } finally {
                setLoading(false);
            }
        };
        fetchRiwayat();
    }, [apiUrl]);

    const filtered = tugas.filter((t) =>
        t.nama.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    const start = (currentPage - 1) * itemsPerPage;
    const current = filtered.slice(start, start + itemsPerPage);

    // const formatFullDate = (dateStr) => {
    //     const d = new Date(dateStr);
    //     return d.toLocaleDateString("id-ID", {
    //         day: "2-digit",
    //         month: "long",
    //         year: "numeric",
    //     });
    // };

    return (
        <div className="w-full mx-auto">
            <SectionHeader title="Riwayat Reminder" subtitle={`Menampilkan ${tugas.length} tugas yang telah diselesaikan.`} onBack={() => navigate("/penugasan")} />

            <div className="my-3">
                <SearchBar placeholder="Cari nama tugas..." onSearch={(v) => { setSearchTerm(v); setCurrentPage(1); }} />
            </div>

            {/* === DESKTOP (TABEL) === */}
            <div className="hidden lg:block">
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-green-500 text-white font-semibold">
                            <tr>
                                <th className="px-5 py-3 text-center w-12">No</th>
                                <th className="px-5 py-3 text-center">Kategori</th>
                                <th className="px-5 py-3">Nama Penugasan</th>
                                <th className="px-5 py-3 text-center">Tenggat Waktu</th>
                                <th className="px-5 py-3 text-center">Terselesaikan</th>
                                <th className="px-5 py-3 text-center">Status</th>
                                <th className="px-5 py-3 text-center">Jumlah Tugas</th>
                                <th className="px-5 py-3 text-center">Menu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10">
                                        <LoadingSpinner text="Memuat data penugasan..." />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10">
                                        <ErrorState message={error} />
                                    </td>
                                </tr>
                            ) : current.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-gray-500">
                                        <EmptyState message="Tidak ada data riwayat tugas." />
                                    </td>
                                </tr>
                            ) : (
                                current.map((item, i) => {
                                    const createdDate = new Date(item.created_at);
                                    const deadlineDate = new Date(item.deadline_at);
                                    const updatedDate = new Date(item.updated_at);
                                    const diff = Math.ceil((updatedDate - deadlineDate) / (1000 * 60 * 60 * 24));
                                    const isLate = diff > 0;

                                    return (
                                        <tr key={item.id} className="border-t hover:bg-green-50 transition-all duration-200">
                                            <td className="text-center py-2 text-gray-700 font-medium">
                                                {start + i + 1}
                                            </td>

                                            <td className="text-center py-2">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded capitalize border ${item.category === "urgent" ? "bg-red-100 text-red-700 border-red-300" : "bg-green-100 text-green-700 border-green-300"}`}>
                                                    {item.category}
                                                </span>
                                            </td>

                                            <td className="px-5 py-2 text-gray-800 max-w-[260px]">
                                                <div className="font-semibold truncate">
                                                    {item.nama}
                                                </div>
                                                <div className="text-[11px] text-gray-500">
                                                    Dibuat pada{" "}
                                                    <span className="font-medium text-gray-600">
                                                        {createdDate.toLocaleDateString("id-ID", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="text-center text-gray-700">
                                                {formatFullDate(item.deadline_at)}
                                            </td>

                                            <td className="text-center text-gray-700">
                                                {formatFullDate(item.updated_at)}
                                            </td>

                                            <td className="text-center">
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-semibold rounded-md ${isLate
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-green-100 text-green-700"
                                                        }`}
                                                >
                                                    {isLate ? `Terlambat ${diff} hari` : "Tepat waktu"}
                                                </span>
                                            </td>

                                            <td className="text-center text-gray-700 font-medium">
                                                {item.details?.length || 0}{" "}
                                                <span className="text-gray-500 font-normal text-xs">
                                                    Penugasan
                                                </span>
                                            </td>

                                            <td className="text-center">
                                                <button onClick={() => navigate(`/penugasan/show/${item.id}`)} className="px-3 py-2 rounded bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition">
                                                    <FontAwesomeIcon icon={faEye} className="mr-1" /> Detail
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {filtered.length > itemsPerPage && (
                    <div className="mt-3">
                        <Pagination currentPage={currentPage} totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage}/>
                    </div>
                )}
            </div>


            {/* === MOBILE (CARD) === */}
            <div className="lg:hidden space-y-3">
                {loading ? (
                    <div className="text-center py-10">
                        <LoadingSpinner text="Memuat data..." />
                    </div>
                ) : error ? (
                    <ErrorState message={error} />
                ) : current.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-4xl mb-3 text-green-400"
                        />
                        <p>Belum ada riwayat penugasan.</p>
                    </div>
                ) : (
                    current.map((item) => {
                        const createdDate = new Date(item.created_at);
                        const deadlineDate = new Date(item.deadline_at);
                        const updatedDate = new Date(item.updated_at);
                        const diff = Math.ceil(
                            (updatedDate - deadlineDate) / (1000 * 60 * 60 * 24)
                        );
                        const isLate = diff > 0;

                        return (
                            <div
                                key={item.id}
                                className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                {/* === BADGE CATEGORY === */}
                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide ${item.category === "urgent"
                                            ? "bg-red-100 text-red-700 border border-red-200"
                                            : "bg-green-100 text-green-700 border border-green-200"
                                            }`}
                                    >
                                        {item.category}
                                    </span>
                                </div>

                                {/* === TITLE & CREATED INFO === */}
                                <h3 className="text-[13px] font-semibold text-gray-900 leading-snug mb-1 pr-14">
                                    {item.nama}
                                </h3>
                                <p className="text-[11px] text-gray-500 mb-3">
                                    Dibuat pada{" "}
                                    <span className="font-medium text-gray-700">
                                        {formatFullDate(createdDate)}
                                    </span>
                                </p>

                                {/* === TASK INFO === */}
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <p className="text-gray-500">Deadline</p>
                                        <p className="font-semibold text-gray-800">
                                            {formatFullDate(item.deadline_at)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <p className="text-gray-500">Terakhir Diselesaikan</p>
                                        <p className="font-semibold text-gray-800">
                                            {formatFullDate(item.updated_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* === STATUS SECTION === */}
                                <div className="mt-2 flex justify-between items-center text-[11px]">
                                    <p className="text-gray-600">
                                        Dikerjakan oleh{" "}
                                        <span className="font-medium text-gray-800">
                                            {item.details?.length || 0} karyawan
                                        </span>
                                    </p>
                                    <span
                                        className={`px-2 py-0.5 rounded-md font-semibold ${isLate
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {isLate
                                            ? `Terlambat ${diff} hari`
                                            : "Tepat waktu"}
                                    </span>
                                </div>

                                {/* === FOOTER BUTTON === */}
                                <div className="mt-4 pt-2 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => navigate(`/penugasan/show/${item.id}`)}
                                        className="text-xs font-semibold text-white bg-green-500 hover:bg-green-600 transition px-4 py-1.5 rounded-md shadow-sm"
                                    >
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                {filtered.length > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filtered.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>


        </div>
    );
};

export default RiwayatPenugasan;
