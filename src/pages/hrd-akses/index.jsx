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

    const toggleDetail = (id) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

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
                (item) =>
                    item.nama.toLowerCase().includes(lower) ||
                    item.perusahaan?.some((p) => p.nama.toLowerCase().includes(lower))
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
                    <div className="divide-y divide-gray-100">
                        {filteredList.map((hrd) => (
                            <div key={hrd.id_user} className="p-5 sm:p-6 hover:bg-gray-50 transition-all duration-300 rounded-xl">
                                {/* Header HRD */}
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-br from-green-200 to-green-300 text-green-800 p-4 px-5 rounded-full shadow-inner">
                                            <FontAwesomeIcon icon={faUserTie} className="text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-gray-900 font-semibold text-lg sm:text-xl truncate">
                                                {hrd.nama}
                                            </h3>
                                            <p className="text-gray-500 text-sm sm:text-base">
                                                Mengelola{" "}
                                                <span className="font-medium text-gray-700">{hrd.perusahaan?.length || 0}</span>{" "}
                                                perusahaan
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                                        <button
                                            onClick={() => navigate(`/akses-hrd/edit/${hrd.id_user}`)}
                                            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-sm"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => toggleDetail(hrd.id_user)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm flex items-center gap-2 transition-all duration-200 ${expandedId === hrd.id_user
                                                ? "bg-red-500 hover:bg-red-600"
                                                : "bg-blue-500 hover:bg-blue-600"
                                                }`}
                                        >
                                            <FontAwesomeIcon
                                                icon={expandedId === hrd.id_user ? faEyeSlash : faEye}
                                            />
                                            {expandedId === hrd.id_user ? "Tutup" : "Lihat"}
                                        </button>
                                    </div>
                                </div>

                                {/* Detail Perusahaan */}
                                {expandedId === hrd.id_user && (
                                    <div className="mt-5 sm:mt-6 pl-8 sm:pl-12">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {hrd.perusahaan.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="border border-gray-200 rounded-xl p-3 bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faBuilding}
                                                        className="text-green-600 text-base"
                                                    />
                                                    <span className="font-medium text-gray-700 truncate">{p.nama}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HrdAccess;
