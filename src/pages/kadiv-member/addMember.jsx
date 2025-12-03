import React, { useEffect, useState } from "react";
import Select from "react-select";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { Modal, LoadingSpinner, ErrorState } from "../../components";
import SearchBar from "../../components/common/SearchBar";
import { toast } from "react-hot-toast";

const AddMemberModal = ({ isOpen, onClose, idKadiv, onSuccess, kadivName }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [allMembers, setAllMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [divisiList, setDivisiList] = useState([]);
    const [selectedDivisi, setSelectedDivisi] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [checkAll, setCheckAll] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(false);

            const divisiRes = await fetchWithJwt(`${apiUrl}/karyawan/divisi`);
            const divisiData = await divisiRes.json();

            const profilRes = await fetchWithJwt(`${apiUrl}/profil`);
            const profilData = await profilRes.json();

            if (divisiData.success && profilData.success) {
                // Filter divisi id !== 1
                const filteredDivisi = divisiData.data.filter(d => d.id !== 1);
                setDivisiList(filteredDivisi.map(d => ({ value: d.id, label: d.nama })));

                // Filter profil: tidak kadiv, tidak member, status aktif, role !== 1
                const membersFiltered = profilData.data.filter(
                    m => !m.is_kadiv && !m.is_member && m.status === 1 && m.id_role !== 1
                );
                setAllMembers(membersFiltered);
                setFilteredMembers(membersFiltered);
            } else {
                setAllMembers([]);
                setFilteredMembers([]);
            }
        } catch (err) {
            console.error("Gagal memuat data:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (isOpen) {
            fetchData();
            setSelectedMembers([]);
            setSelectedDivisi(null);
            setSearchTerm("");
            setCheckAll(false);
        }
    }, [isOpen]);

    useEffect(() => {
        let filtered = allMembers;
        if (selectedDivisi) filtered = filtered.filter(m => m.id_role === selectedDivisi.value);
        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                m => m.nama.toLowerCase().includes(lower) || m.nip.toLowerCase().includes(lower)
            );
        }
        setFilteredMembers(filtered);
        setCheckAll(filtered.length > 0 && filtered.every(m => selectedMembers.includes(m.id)));
    }, [searchTerm, selectedDivisi, allMembers, selectedMembers]);

    const toggleSelect = id => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleCheckAll = () => {
        if (checkAll) {
            setSelectedMembers(prev => prev.filter(id => !filteredMembers.some(m => m.id === id)));
        } else {
            const idsToAdd = filteredMembers.map(m => m.id).filter(id => !selectedMembers.includes(id));
            setSelectedMembers([...selectedMembers, ...idsToAdd]);
        }
        setCheckAll(!checkAll);
    };

    const handleSubmit = async () => {
        if (selectedMembers.length === 0) return toast.error("Pilih minimal 1 member");
        try {
            setSubmitting(true);
            const res = await fetchWithJwt(`${apiUrl}/profil/kadiv-access/member/batch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_kadiv: idKadiv, member_ids: selectedMembers }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Member berhasil ditambahkan!");
                onSuccess();
                onClose();
            } else toast.error(data.message || "Gagal menambahkan member");
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan server");
        } finally {
            setSubmitting(false);
        }
    };


    const footerContent = (
        <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-6 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white font-medium shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
                Batal
            </button>
            <button onClick={handleSubmit} disabled={submitting || filteredMembers.length === 0} className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Menyimpan..." : "Simpan"}
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Tambahkan Anggota untuk ${kadivName}`} size="xl" note="Silakan pilih anggota yang akan bergabung ke tim ini." footer={footerContent}>
            {loading ? (
                <div className="py-10 flex justify-center">
                    <LoadingSpinner text="Memuat daftar member..." />
                </div>
            ) : error ? (
                <ErrorState message="Gagal memuat data. Silakan coba lagi nanti." onRetry={fetchData} />
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row gap-3 mb-3">
                        {/* Filter Divisi di kiri, sekitar 1/3 lebar */}
                        <div className="sm:w-1/3 w-full">
                            <Select options={divisiList} value={selectedDivisi} onChange={setSelectedDivisi} isClearable placeholder="Filter divisi..." className="w-full"
                                menuPortalTarget={document.body}   // Pindahkan dropdown ke body
                                menuPosition="fixed"               // Agar dropdown tidak terpotong modal
                                styles={{
                                    menuPortal: base => ({ ...base, zIndex: 9999 }) // Pastikan muncul di atas semua
                                }}
                            />
                        </div>

                        {/* Search di kanan, 2/3 lebar */}
                        <div className="sm:w-2/3 w-full">
                            <SearchBar placeholder="Cari nama atau NIP..." onSearch={setSearchTerm} className="w-full"/>
                        </div>
                    </div>



                    <div className="flex justify-between items-center mb-3 text-sm">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={checkAll} onChange={toggleCheckAll} className="form-checkbox h-4 w-4 text-green-500" />
                            <span className="font-medium">Pilih Semua</span>
                        </div>
                        <div className="inline-block px-3 py-1 bg-green-50 text-green-700 font-medium rounded-md">
                            Terpilih: {selectedMembers.length} Member
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-lg p-2 bg-white shadow-sm">
                        {allMembers.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-6">
                                Belum ada member yang tersedia.
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-6">
                                Tidak ada member sesuai filter / pencarian
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredMembers.map(member => (
                                    <label key={member.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition  ${selectedMembers.includes(member.id) ? "bg-green-50 border border-green-200" : "hover:bg-gray-50"}`}>
                                        <input type="checkbox" checked={selectedMembers.includes(member.id)} onChange={() => toggleSelect(member.id)} className="form-checkbox h-4 w-4 text-green-500" />
                                        <div className="flex-1 flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-800">{member.nama}</span>
                                                <span className="text-xs text-gray-500">{member.role}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{member.nip}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
};

export default AddMemberModal;
