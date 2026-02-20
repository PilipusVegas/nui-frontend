import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faUserTie,
    faBuilding,
    faIdCard,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
    SectionHeader,
    LoadingSpinner,
    ErrorState,
    EmptyState,
} from "../../components";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const KelolaAnggotaTim = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [groupList, setGroupList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGroupKadiv = async () => {
        setLoading(true);
        setError(null);

        try {
            const user = getUserFromToken();

            // Validasi Kadiv
            if (!user?.is_kadiv?.status || !user?.is_kadiv?.id) {
                throw new Error("Akses ditolak. Anda bukan Kepala Divisi.");
            }

            const idKadiv = user.is_kadiv.id;

            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/group/kadiv/${idKadiv}`
            );

            if (!res.ok) {
                throw new Error("Gagal memuat data tim Kadiv");
            }

            const result = await res.json();
            setGroupList(result.data ?? []);
        } catch (err) {
            setError(err.message || "Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupKadiv();
    }, []);

    return (
        <div className="w-full mx-auto">
            <SectionHeader
                title="Kelola Anggota Tim"
                subtitle="Manajemen grup dan tim kerja yang berada di bawah tanggung jawab Anda."
                onBack={() => navigate(-1)}
                actions={
                    <button
                        onClick={() => navigate("/kelola-tim/tambah")}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span>Tambah Grup</span>
                    </button>
                }
            />

            <div className="mt-6">
                {loading && <LoadingSpinner message="Memuat data tim..." />}

                {!loading && error && (
                    <ErrorState
                        title="Gagal Memuat Data Tim"
                        message={error}
                        onRetry={fetchGroupKadiv}
                    />
                )}

                {!loading && !error && groupList.length === 0 && (
                    <EmptyState
                        title="Belum Ada Grup Tim"
                        description="Saat ini Anda belum memiliki grup tim yang dikelola."
                        icon={faUsers}
                        actionText="Tambah Grup"
                        onAction={() => navigate("/kelola-tim/tambah")}
                    />
                )}

                {!loading && !error && groupList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {groupList.map((group) => (
                            <div
                                key={group.id}
                                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                                onClick={() =>
                                    navigate(`/kelola-tim/detail/${group.id}`)
                                }
                            >
                                <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-t-lg">
                                    <h3 className="font-semibold tracking-wide">
                                        {group.nama_grup}
                                    </h3>
                                </div>

                                <div className="px-4 py-4 space-y-2 text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUserTie} className="text-indigo-600" />
                                        <span className="font-medium">{group.nama_kadiv}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faIdCard} className="text-gray-500" />
                                        <span>NIP: {group.nip_kadiv}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faBuilding} className="text-gray-500" />
                                        <span className="truncate">{group.perusahaan_kadiv}</span>
                                    </div>

                                    {group.id_leader === null && (
                                        <div className="text-xs text-red-600 font-semibold mt-2">
                                            ⚠ Belum ada Leader
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KelolaAnggotaTim;