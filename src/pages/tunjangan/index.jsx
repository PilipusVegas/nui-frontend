import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faExclamationTriangle,
    faInfoCircle,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchWithJwt } from "../../utils/jwtHelper";
import {
    SectionHeader,
    Modal,
    Pagination,
    LoadingSpinner,
    ErrorState,
    EmptyState,
    SearchBar,
} from "../../components";

const PengaturanTunjangan = () => {
    const [tunjangan, setTunjangan] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [nama, setNama] = useState("");
    const [nominal, setNominal] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [openDetail, setOpenDetail] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    // Fetch Tunjangan
    const fetchTunjangan = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithJwt(`${apiUrl}/tunjangan`);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const json = await res.json();
            setTunjangan(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error("Gagal memuat data tunjangan:", err);
            setError("Gagal memuat data tunjangan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTunjangan();
    }, []);

    // Filter & Pagination
    const filteredTunjangan = tunjangan.filter((t) =>
        t.nama.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentTunjangan = filteredTunjangan.slice(indexOfFirst, indexOfLast);

    const handlePageChange = (page) => setCurrentPage(page);

    // Submit Form
    // Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nama.trim() || !nominal || !deskripsi.trim()) {
            toast.error("Semua kolom wajib diisi!");
            return;
        }

        try {
            const url = editId
                ? `${apiUrl}/tunjangan/${editId}` // endpoint untuk edit
                : `${apiUrl}/tunjangan`;         // endpoint untuk tambah
            const method = editId ? "PUT" : "POST"; // PUT untuk edit, POST untuk tambah

            const res = await fetchWithJwt(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama, nominal: Number(nominal), deskripsi }),
            });

            if (!res.ok) {
                let msg = `Gagal menyimpan (status ${res.status})`;
                try {
                    const errJson = await res.json();
                    if (errJson?.message) msg = errJson.message;
                } catch (_) { }
                throw new Error(msg);
            }

            toast.success(editId ? "Tunjangan berhasil diperbarui." : "Tunjangan berhasil ditambahkan.");
            setIsModalOpen(false);
            setNama("");
            setNominal("");
            setDeskripsi("");
            setEditId(null);
            fetchTunjangan();
        } catch (err) {
            console.error("Gagal menyimpan data:", err);
            toast.error(err.message || "Terjadi kesalahan saat menyimpan data.");
        }
    };


    // Edit Data
    const handleEdit = (item) => {
        setNama(item.nama);
        setNominal(item.nominal);
        setDeskripsi(item.deskripsi || "");
        setEditId(item.id);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full mx-auto">
            <SectionHeader
                title="Pengaturan Tunjangan"
                subtitle={`Menampilkan ${tunjangan.length} jenis tunjangan.`}
                onBack={() => navigate("/")}
                actions={
                    <button
                        onClick={() => {
                            setEditId(null);
                            setNama("");
                            setNominal("");
                            setDeskripsi("");
                            setIsModalOpen(true);
                        }}
                        className="flex items-center justify-center px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-base sm:mr-2" />
                        <span className="hidden sm:inline text-base">Tambah Tunjangan</span>
                    </button>
                }
            />

            <div className="my-3">
                <SearchBar
                    placeholder="Cari nama tunjangan..."
                    onSearch={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block">
                <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-green-500 text-white font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-center w-16">No.</th>
                                <th className="px-4 py-3">Nama Tunjangan</th>
                                <th className="px-4 py-3 text-right w-32">Nominal</th>
                                <th className="px-4 py-3 text-center w-52">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan="4" className="py-10 text-center">
                                        <LoadingSpinner size="lg" text="Memuat data tunjangan..." />
                                    </td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td colSpan="4" className="py-10 text-center">
                                        <ErrorState message={error} onRetry={fetchTunjangan} />
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && currentTunjangan.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-10 text-center">
                                        <EmptyState message="Belum ada data tunjangan." />
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                !error &&
                                currentTunjangan.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <tr className="border-t hover:bg-gray-50 transition">
                                            <td className="px-4 py-2 text-center">
                                                {indexOfFirst + index + 1}
                                            </td>
                                            <td className="px-4 py-2 font-semibold text-gray-800">
                                                {item.nama}
                                            </td>
                                            <td className="px-4 py-2 text-right text-gray-700">
                                                Rp {item.nominal.toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="flex items-center text-xs gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition hover:scale-105"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setOpenDetail(openDetail === item.id ? null : item.id)
                                                        }
                                                        className="flex items-center text-xs gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition hover:scale-105"
                                                    >
                                                        <FontAwesomeIcon icon={faInfoCircle} /> Detail
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {openDetail === item.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="4" className="px-4 py-2 text-sm text-gray-700">
                                                    <div className="p-2 border-l-4 border-green-500 bg-green-50 rounded-md">
                                                        <strong>Deskripsi:</strong>
                                                        <p className="mt-1">
                                                            {item.deskripsi || "Tidak ada deskripsi"}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                        </tbody>
                    </table>
                </div>
                {filteredTunjangan.length > itemsPerPage && (
                    <div className="mt-2">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredTunjangan.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Mobile Card */}
            <div className="sm:hidden space-y-4">
                {currentTunjangan.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-6xl mb-3 text-gray-400"
                        />
                        <div className="text-lg font-medium">
                            Oops! Belum ada data tunjangan.
                        </div>
                    </div>
                ) : (
                    currentTunjangan.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-100 rounded-2xl shadow-md p-4 transition hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="text-base font-semibold text-gray-800 leading-tight">
                                        {item.nama}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Rp {item.nominal.toLocaleString("id-ID")}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-[10px] font-medium shadow-sm transition whitespace-nowrap"
                                >
                                    <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                                </button>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2" />
                            <div
                                className={`text-[10px] text-justify ${!item.deskripsi ? "text-gray-400 italic" : "text-gray-600"
                                    } leading-snug`}
                            >
                                {item.deskripsi || "Tidak ada deskripsi"}
                            </div>
                        </div>
                    ))
                )}
                {filteredTunjangan.length > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredTunjangan.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Modal Tambah/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setNama("");
                    setNominal("");
                    setDeskripsi("");
                    setEditId(null);
                }}
                title={editId ? "Edit Tunjangan" : "Tambah Tunjangan"}
                note="Isi data tunjangan dengan lengkap dan benar!"
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Nama Tunjangan
                        </label>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            required
                            placeholder="Masukkan nama tunjangan"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Nominal (Rp)
                        </label>
                        <input
                            type="number"
                            value={nominal}
                            onChange={(e) => setNominal(e.target.value)}
                            required
                            placeholder="Masukkan nominal tunjangan"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            rows={6}
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            required
                            placeholder="Tulis deskripsi singkat tentang tunjangan ini"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                    </div>

                    <div className="text-right">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PengaturanTunjangan;
