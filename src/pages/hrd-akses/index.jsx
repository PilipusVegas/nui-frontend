import React, { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faUserTie, faEye, faEyeSlash, faEdit, faPlus, } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar, } from "../../components";

const HrdAccess = () => {
    const [hrdList, setHrdList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const toggleDetail = (id) => { setExpandedId((prev) => (prev === id ? null : id)); };

    const fetchHrdAccess = async () => {
        try {
            setLoading(true);
            setError(false);
            const res = await fetchWithJwt(`${apiUrl}/profil/hrd-access`);
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                setHrdList(data.data);
                setFilteredList(data.data);
            } else {
                setHrdList([]);
                setFilteredList([]);
            }
        } catch (err) {
            console.error("Gagal memuat data HRD:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredList(hrdList);
            return;
        }
        const lower = searchTerm.toLowerCase();
        setFilteredList(
            hrdList.filter(
                (item) => item.nama.toLowerCase().includes(lower) || item.perusahaan?.some((p) => p.nama.toLowerCase().includes(lower))
            )
        );
    }, [searchTerm, hrdList]);

    useEffect(() => {
        fetchHrdAccess();
    }, []);

    return (
        <div className="w-full mx-auto animate-fadeIn">
            <SectionHeader title="Akses HRD" subtitle="Kelola daftar HRD beserta perusahaan yang mereka tangani." onBack={() => navigate(-1)}
                actions={
                    <div>
                        <button onClick={() => navigate("/akses-hrd/tambah")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-sm transition-all duration-200">
                            <FontAwesomeIcon icon={faPlus} />
                            Tambah HRD
                        </button>
                    </div>
                }
            />
            <SearchBar placeholder="Cari nama HRD atau perusahaan..." onSearch={(val) => setSearchTerm(val)} className="mb-4" />
            <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner text="Memuat data HRD..." />
                    </div>
                ) : error ? (
                    <ErrorState message="Gagal memuat data HRD. Silakan coba lagi nanti." onRetry={fetchHrdAccess} />
                ) : filteredList.length === 0 ? (
                    <EmptyState message="Belum ada data HRD yang tersedia." />
                ) : (
                    <div className="overflow-x-auto bg-white border border-gray-100 rounded-md shadow-md">
                        <table className="min-w-full text-sm text-gray-700 border-collapse">
                            <thead className="bg-green-500 text-white">
                                <tr>
                                    <th className="py-3 px-4 text-center font-semibold">Nama HRD</th>
                                    <th className="py-3 px-4 text-center font-semibold">Mengelola</th>
                                    <th className="py-3 px-4 text-center font-semibold">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredList.map((hrd) => (
                                    <React.Fragment key={hrd.id_user}>
                                        <tr className="hover:bg-green-50 transition-all duration-200">
                                            <td className="py-3 px-4 text-center flex items-center gap-3">
                                                <div className="bg-green-500 p-2.5 px-3 text-white rounded-full">
                                                    <FontAwesomeIcon icon={faUserTie} className="text-base" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{hrd.nama}</p>
                                                    <p className="text-xs text-left text-gray-500">{hrd.id_user}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center text-gray-700">
                                                {hrd.perusahaan?.length || 0}{" "}
                                                <span className="text-gray-500">Perusahaan</span>
                                            </td>
                                            <td className="py-3 px-4 text-center text-center">
                                                <div className="flex justify-center gap-2 flex-wrap">
                                                    <button onClick={() => navigate(`/akses-hrd/edit/${hrd.id_user}`)} className="px-3 py-1.5 rounded-md bg-amber-400 hover:bg-amber-500 text-white text-sm flex items-center gap-1.5 shadow-sm transition-all duration-200">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                        Edit
                                                    </button>

                                                    <button onClick={() => toggleDetail(hrd.id_user)}
                                                        className={`px-3 py-1.5 rounded-md text-sm text-white flex items-center gap-1.5 shadow-sm transition-all duration-200 ${expandedId === hrd.id_user
                                                            ? "bg-red-400 hover:bg-red-500"
                                                            : "bg-blue-400 hover:bg-blue-500"
                                                            }`}
                                                    >
                                                        <FontAwesomeIcon icon={expandedId === hrd.id_user ? faEyeSlash : faEye} />
                                                        {expandedId === hrd.id_user ? "Tutup" : "Lihat"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {expandedId === hrd.id_user && (
                                            <tr className="bg-emerald-50/40 border-t border-emerald-100 transition-all duration-300">
                                                <td colSpan="4" className="p-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                        {hrd.perusahaan.length > 0 ? (
                                                            hrd.perusahaan.map((p, index) => (
                                                                <div
                                                                    key={p.id}
                                                                    className="bg-white border border-emerald-100 rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-[2px]"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                                                                            <FontAwesomeIcon icon={faBuilding} className="text-base" />
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="text-sm font-semibold text-gray-800 leading-tight">
                                                                                {p.nama}
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="col-span-full text-center text-gray-500 italic py-6 bg-white/80 rounded-xl border border-emerald-100">
                                                                Tidak ada data perusahaan untuk HRD ini.
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                )}
            </div>
        </div>
    );
};

export default HrdAccess;
