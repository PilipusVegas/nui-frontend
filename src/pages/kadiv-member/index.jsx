import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar, Modal } from "../../components";
import DetailKadiv from "./show";
import FormAccessKadiv from "./formAccessKadiv";
import AddMemberModal from "./addMember";

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
    const [currentKadivId, setCurrentKadivId] = useState(null);
    const [currentKadivName, setCurrentKadivName] = useState("");

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
                        <button onClick={() => { setEditKadiv(null); setFormModalOpen(true);}} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-sm transition-all duration-200 font-semibold">
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

                    <div className="overflow-x-auto bg-white border border-gray-100 rounded-md shadow-sm">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-green-500 text-white shadow-sm">
                                <tr>
                                    <th className="py-2 px-4 text-center font-semibold">NIP</th>
                                    <th className="py-2 px-4 text-left font-semibold">Kepala Divisi</th>
                                    <th className="py-2 px-4 font-semibold text-center">Perusahaan</th>
                                    <th className="py-2 px-4 text-center font-semibold">Menu</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredList.map((kadiv) => (
                                    <React.Fragment key={kadiv.id}>
                                        <tr className="hover:bg-green-50/60 transition-all duration-200">
                                            <td className="py-2 px-4 text-center font-medium text-gray-800">
                                                {kadiv.nip}
                                            </td>
                                            <td className="py-2 px-4 text-left">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">
                                                        {kadiv.nama}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        ID Kadiv : {kadiv.id_user} 
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 text-center font-medium text-gray-800">
                                                {kadiv.perusahaan}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                <div className="flex justify-center gap-2 flex-wrap">
                                                    {/* <button onClick={() => { setCurrentKadivId(kadiv.id); setCurrentKadivName(kadiv.nama); setAddMemberModalOpen(true); }} className="px-3 py-1.5 rounded bg-green-500 hover:bg-green-600 text-white text-sm flex items-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95">
                                                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                                        Anggota
                                                    </button> */}
                                                    <button onClick={() => { setEditKadiv(kadiv); setFormModalOpen(true);}} className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-500 text-white text-sm flex items-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95">
                                                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => toggleDetail(kadiv.id)} className="px-3 py-1.5 rounded text-sm text-white flex items-center gap-1.5 shadow-sm bg-blue-400 hover:bg-blue-500 transition-all duration-200 active:scale-95">
                                                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                                                        Detail
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Detail Kepala Divisi" note="Informasi lengkap mengenai kepala divisi dan member yang berada di bawahnya." size="xl">
                <DetailKadiv data={selectedKadiv} />
            </Modal>
            <FormAccessKadiv isOpen={formModalOpen} onClose={() => setFormModalOpen(false)} onSuccess={fetchKadivAccess} editData={editKadiv} />
            <AddMemberModal isOpen={addMemberModalOpen} onClose={() => setAddMemberModalOpen(false)} idKadiv={currentKadivId}  kadivName={currentKadivName} onSuccess={fetchKadivAccess} />
        </div>
    );
};

export default KadivMember;
