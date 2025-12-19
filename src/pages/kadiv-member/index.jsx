import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPlus, faUserGear } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar, Modal } from "../../components";
import DetailKadiv from "./show";
import FormAccessKadiv from "./formAccessKadiv";

const KadivMember = () => {
    const [kadivList, setKadivList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedKadiv, setSelectedKadiv] = useState(null);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editKadiv, setEditKadiv] = useState(null);
    const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);

    const toggleDetail = async (id) => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/profil/kadiv-access/${id}`);
            const data = await res.json();

            if (data.success) {
                setSelectedKadiv(data.data);
                setDetailModalOpen(true);
            }
        } catch (err) {
            console.error("Gagal mengambil detail kadiv:", err);
        }
    };

    const fetchKadivAccess = async () => {
        try {
            setLoading(true);
            setError(false);

            const res = await fetchWithJwt(`${apiUrl}/profil/kadiv-access`);
            const data = await res.json();

            if (data.success && Array.isArray(data.data)) {
                setKadivList(data.data);
                setFilteredList(data.data);
            } else {
                setKadivList([]);
                setFilteredList([]);
            }
        } catch (err) {
            console.error("Gagal memuat data Kadiv:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredList(kadivList);
            return;
        }

        const lower = searchTerm.toLowerCase();
        setFilteredList(
            kadivList.filter(
                (item) =>
                    item.nama.toLowerCase().includes(lower) ||
                    item.nip.toLowerCase().includes(lower)
            )
        );
    }, [searchTerm, kadivList]);

    useEffect(() => {
        fetchKadivAccess();
    }, []);

    return (
        <div className="w-full mx-auto animate-fadeIn">
            <SectionHeader title="Kelola Kepala Divisi & Anggota Tim" subtitle="Kelola daftar kepala divisi beserta informasinya." onBack={() => navigate(-1)}
                actions={
                    <div>
                        <button onClick={() => { setEditKadiv(null); setFormModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-sm transition-all duration-200 font-semibold">
                            <FontAwesomeIcon icon={faPlus} />
                            <span className="hidden sm:inline">Kepala Divisi</span>
                        </button>
                    </div>
                }
            />
            <SearchBar placeholder="Cari nama kadiv atau NIP..." onSearch={(val) => setSearchTerm(val)} className="mb-4" />
            <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner text="Memuat data Kadiv..." />
                    </div>
                ) : error ? (
                    <ErrorState message="Gagal memuat data Kadiv. Silakan coba lagi nanti." onRetry={fetchKadivAccess} />
                ) : filteredList.length === 0 ? (
                    <EmptyState message="Belum ada data Kadiv yang tersedia." />
                ) : (

                    <div className="hidden md:block overflow-x-auto bg-white border border-gray-100 rounded-md shadow-sm">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-green-500 text-white shadow-sm">
                                <tr>
                                    <th className="py-2 px-4 text-center font-semibold">NIP</th>
                                    <th className="py-2 px-4 text-left font-semibold">Kepala Divisi</th>
                                    <th className="py-2 px-4 text-center font-semibold">Perusahaan</th>
                                    <th className="py-2 px-4 text-center font-semibold">Menu</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredList.map((kadiv) => (
                                    <tr key={kadiv.id} className="hover:bg-green-50/60 transition">
                                        <td className="py-2 px-4 text-center font-medium">
                                            {kadiv.nip}
                                        </td>

                                        <td className="py-2 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{kadiv.nama}</span>
                                                <span className="text-xs text-gray-500">
                                                    ID Kadiv : {kadiv.id_user}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-2 px-4 text-center">
                                            {kadiv.perusahaan}
                                        </td>

                                        <td className="py-2 px-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => { setEditKadiv(kadiv); setFormModalOpen(true); }} className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-white rounded text-sm flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faUserGear} />
                                                    Ganti
                                                </button>

                                                <button onClick={() => toggleDetail(kadiv.id)} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faEye} />
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ================= MOBILE CARD ================= */}
                <div className="md:hidden space-y-3">
                    {filteredList.map((kadiv) => (
                        <div key={kadiv.id} className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-500">NIP</p>
                                    <p className="font-semibold text-gray-900">{kadiv.nip}</p>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    Kadiv
                                </span>
                            </div>

                            {/* Content */}
                            <div className="mt-3 space-y-1">
                                <p className="font-semibold text-gray-900">
                                    {kadiv.nama}
                                </p>
                                <p className="text-xs text-gray-500">
                                    ID Kadiv : {kadiv.id_user}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Perusahaan:</span> {kadiv.perusahaan}
                                </p>
                            </div>

                            {/* Action */}
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => { setEditKadiv(kadiv); setFormModalOpen(true); }} className="flex-1 px-3 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded text-sm flex items-center justify-center gap-1">
                                    <FontAwesomeIcon icon={faUserGear} />
                                    Ganti
                                </button>

                                <button onClick={() => toggleDetail(kadiv.id)} className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center justify-center gap-1">
                                    <FontAwesomeIcon icon={faEye} />
                                    Detail
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Detail Kepala Divisi" note="Informasi lengkap mengenai kepala divisi dan member yang berada di bawahnya." size="xl">
                <DetailKadiv data={selectedKadiv} />
            </Modal>
            <FormAccessKadiv isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} onSuccess={fetchKadivAccess} editData={editKadiv} />
        </div>
    );
};

export default KadivMember;
