import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUserTie, faBuilding, faIdCard, faPlus, } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Tambah from "./Tambah";
import Show from "./Show";
import { Modal } from "../../components";

import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, } from "../../components";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const KelolaAnggotaTim = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [groupList, setGroupList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openTambah, setOpenTambah] = useState(false);
    const [openShow, setOpenShow] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [selectedGroupName, setSelectedGroupName] = useState("");

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
        <>
            <div className="w-full mx-auto">
                <SectionHeader title="Kelola Anggota Tim" subtitle="Manajemen grup dan tim kerja yang berada di bawah tanggung jawab Anda." onBack={() => navigate(-1)}
                    actions={
                        <button onClick={() => setOpenTambah(true)}
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
                        <ErrorState title="Gagal Memuat Data Tim" message={error} onRetry={fetchGroupKadiv} />
                    )}

                    {!loading && !error && groupList.length === 0 && (
                        <EmptyState title="Belum Ada Grup Tim" description="Saat ini Anda belum memiliki grup tim yang dikelola." icon={faUsers} actionText="Tambah Grup" onAction={() => navigate("/kelola-tim/tambah")} />
                    )}

                    {!loading && !error && groupList.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {groupList.map((group) => {
                                const hasLeader = Boolean(group.id_leader);

                                return (
                                    <div key={group.id} onClick={() => { setSelectedGroupId(group.id); setSelectedGroupName(group.nama_grup); setOpenShow(true); }}
                                        className={`group bg-white border rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
                                        ${hasLeader ? "border-gray-200 hover:border-green-600" : "border-green-300"}
                                    `}
                                    >
                                        {/* Header */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {group.nama_grup}
                                            </h3>
                                        </div>

                                        {/* Content */}
                                        <div className="px-4 py-5 space-y-4">
                                            {/* Leader */}
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`flex items-center justify-center w-9 h-9 rounded-full
                                                    ${hasLeader ? "bg-green-100 text-green-700" : "bg-green-100 text-green-700"}
                                                `}
                                                >
                                                    <FontAwesomeIcon icon={faUserTie} />
                                                </div>

                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500">
                                                        Team Leader
                                                    </p>

                                                    {hasLeader ? (
                                                        <p className="font-semibold text-gray-900">
                                                            {group.nama_leader}
                                                        </p>
                                                    ) : (
                                                        <p className="font-semibold text-green-700">
                                                            Belum ditentukan
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-md ${hasLeader ? "bg-green-50 text-green-700 border border-green-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                                                    {hasLeader ? "Leader Aktif" : "Perlu Penetapan Leader"}
                                                </span>
                                                <span className="text-xs text-gray-400 group-hover:text-green-600 transition">
                                                    Lihat Detail →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Modal isOpen={openTambah} onClose={() => setOpenTambah(false)} title="Tambah Grup Tim" note="Buat grup kerja baru di bawah tanggung jawab Anda sebagai Kepala Divisi." size="sm" footer={null}>
                <Tambah onSuccess={() => { setOpenTambah(false); fetchGroupKadiv(); }} onCancel={() => setOpenTambah(false)} />
            </Modal>
            <Modal isOpen={openShow} onClose={() => { setOpenShow(false); setSelectedGroupId(null); setSelectedGroupName("");}} title={`Detail Grup ${selectedGroupName}`} note="Halaman ini menampilkan struktur tim dalam grup ini. Anda dapat melihat siapa yang menjadi Team Leader dan mengatur peran anggota sesuai kebutuhan." size="lg">
                {selectedGroupId && (
                    <Show idGroup={selectedGroupId} />
                )}
            </Modal>
        </>
    );
};

export default KelolaAnggotaTim;