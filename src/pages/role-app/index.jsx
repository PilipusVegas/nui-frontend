import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faExclamationTriangle, faPlus, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader } from "../../components";
import { Modal, Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";

const RoleApp = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [editId, setEditId] = useState(null);
    const [detailRole, setDetailRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const fetchRoles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithJwt(`${apiUrl}/role-apps`);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const json = await res.json();
            setRoles(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error("Gagal memuat data role:", err);
            setError("Gagal memuat data role aplikasi. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const filteredRoles = roles.filter((r) => {
        const term = searchTerm.trim().toLowerCase();
        if (/^\d+$/.test(term)) return String(r.id) === term;
        return r.nama.toLowerCase().includes(term);
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRoles = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nama.trim() || !deskripsi.trim()) {
            toast.error("Nama dan deskripsi wajib diisi.");
            return;
        }

        const url = editId ? `${apiUrl}/role-apps/${editId}` : `${apiUrl}/role-apps`;
        const method = editId ? "PUT" : "POST";

        try {
            const res = await fetchWithJwt(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama, deskripsi }),
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.message || `Gagal menyimpan data (status ${res.status})`);
            }

            toast.success(editId ? "Role berhasil diperbarui." : "Role baru berhasil ditambahkan.");
            setNama("");
            setDeskripsi("");
            setEditId(null);
            setIsModalOpen(false);
            fetchRoles();
        } catch (err) {
            console.error("Error menyimpan role:", err);
            toast.error(err.message || "Terjadi kesalahan saat menyimpan data role.");
        }
    };

    const handleEdit = (item) => {
        setNama(item.nama);
        setDeskripsi(item.deskripsi || "");
        setEditId(item.id);
        setIsModalOpen(true);
    };

    const handleDetail = (item) => {
        setDetailRole(item);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="w-full mx-auto">
            <SectionHeader
                title="Role Aplikasi"
                subtitle={`Menampilkan ${roles.length} role yang terdaftar.`}
                onBack={() => navigate("/")}
                actions={
                    <button
                        onClick={() => {
                            setEditId(null);
                            setNama("");
                            setDeskripsi("");
                            setIsModalOpen(true);
                        }}
                        title="Tambah Role"
                        className="flex items-center justify-center px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-base sm:mr-2" />
                        <span className="hidden sm:inline text-base">Tambah Role</span>
                    </button>
                }
            />

            <div className="my-3">
                <SearchBar placeholder="Cari nama role..." onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }} />
            </div>

            {/* Tabel Desktop */}
            <div className="hidden sm:block">
                <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-green-500 text-white font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-center w-20">No.</th>
                                <th className="px-4 py-3">Nama Role</th>
                                <th className="px-4 py-3 text-center w-48">Menu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan="3" className="py-10 text-center">
                                        <LoadingSpinner size="lg" text="Memuat data role..." />
                                    </td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td colSpan="3" className="py-10 text-center">
                                        <ErrorState message={error} onRetry={fetchRoles} />
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && currentRoles.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="py-10 text-center">
                                        <EmptyState message="Belum ada data role aplikasi." />
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && currentRoles.length > 0 &&
                                currentRoles.map((item, index) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                                        <td className="px-4 py-1.5 text-center">{indexOfFirstItem + index + 1}</td>
                                        <td className="px-4 py-1.5 font-semibold text-gray-800 flex items-center gap-2 uppercase">{item.nama}</td>
                                        <td className="px-4 py-1.5 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="flex items-center text-xs gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition hover:scale-105"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDetail(item)}
                                                    className="flex items-center text-xs gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition hover:scale-105"
                                                >
                                                    <FontAwesomeIcon icon={faInfoCircle} /> Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {filteredRoles.length > itemsPerPage && (
                    <div className="mt-2">
                        <Pagination currentPage={currentPage} totalItems={filteredRoles.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>

            {/* Modal Tambah/Edit */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setNama(""); setDeskripsi(""); setEditId(null); }} title={editId ? "Edit Role Aplikasi" : "Tambah Role Aplikasi"} note="Isi data role aplikasi dengan lengkap dan benar!" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Role</label>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            required
                            placeholder="Masukkan nama role"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Deskripsi</label>
                        <textarea
                            rows={8}
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            required
                            placeholder="Tuliskan deskripsi peran ini"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                    </div>
                    <div className="text-right">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition">
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Detail */}
            {detailRole && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => { setIsDetailModalOpen(false); setDetailRole(null); }}
                    title={`Detail Role: ${detailRole.nama}`}
                    size="md"
                >
                    <div className="p-2 text-gray-700">
                        <strong>Deskripsi:</strong>
                        <p className="mt-2">{detailRole.deskripsi || "Tidak ada deskripsi"}</p>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default RoleApp;
