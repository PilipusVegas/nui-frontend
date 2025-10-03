import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faExclamationTriangle, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import SectionHeader from "../../components/desktop/SectionHeader";
import Modal from "../../components/desktop/Modal";

const ManajemenHariLibur = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [listLibur, setListLibur] = useState([]);
    const [tanggal, setTanggal] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [perusahaan, setPerusahaan] = useState("");
    const [listPerusahaan, setListPerusahaan] = useState([]);
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();
    
    const fetchHariLibur = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/libur`);
            const data = await res.json();
            if (data?.success) {
                setListLibur(data.data || []);
            } else {
                setListLibur([]);
            }
        } catch (err) {
            console.error("Gagal memuat data hari libur:", err);
            setListLibur([]);
        }
    };

    // Fetch daftar perusahaan (opsional, kalau multi perusahaan)
    const fetchPerusahaan = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/perusahaan`);
            const data = await res.json();
            if (data?.status?.toLowerCase() === "success") {
                setListPerusahaan(data.data || []);
            } else {
                setListPerusahaan([]);
            }
        } catch (err) {
            console.error("Gagal memuat data perusahaan:", err);
        }
    };

    useEffect(() => {
        fetchHariLibur();
        fetchPerusahaan();
    }, []);

    // Submit Tambah/Edit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tanggal.trim() || !keterangan.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Data tidak lengkap",
                text: "Tanggal dan keterangan wajib diisi.",
                confirmButtonColor: "#16a34a",
            });
            return;
        }

        const url = editId ? `${apiUrl}/hari-libur/${editId}` : `${apiUrl}/hari-libur`;
        const method = editId ? "PUT" : "POST";

        try {
            await fetchWithJwt(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tanggal,
                    keterangan,
                    id_perusahaan: perusahaan || null,
                }),
            });

            await Swal.fire({
                icon: "success",
                title: editId ? "Berhasil diperbarui" : "Berhasil ditambahkan",
                text: `Hari libur berhasil ${editId ? "diperbarui" : "ditambahkan"}.`,
                confirmButtonColor: "#16a34a",
            });

            setTanggal("");
            setKeterangan("");
            setPerusahaan("");
            setEditId(null);
            setIsModalOpen(false);
            fetchHariLibur();
        } catch (err) {
            console.error("Gagal menyimpan data:", err);
            Swal.fire({
                icon: "error",
                title: "Gagal menyimpan",
                text: "Terjadi kesalahan saat menyimpan data.",
                confirmButtonColor: "#dc2626",
            });
        }
    };

    const handleEdit = (item) => {
        setTanggal(item.tanggal);
        setKeterangan(item.keterangan || "");
        setPerusahaan(item.id_perusahaan || "");
        setEditId(item.id);
        setIsModalOpen(true);
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <div className="w-full mx-auto">
            {/* Header */}
            <SectionHeader title="Manajemen Hari Libur" subtitle="Kelola daftar hari libur per perusahaan di sini." onBack={handleBackClick}
                actions={
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                        <FontAwesomeIcon icon={faPlus} className="text-sm sm:text-base" />
                        <span className="hidden sm:inline">Tambah Hari Libur</span>
                    </button>
                }
            />

            {/* Tabel Desktop */}
            <div className="hidden sm:block">
                <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-green-600 text-white">
                            <tr>
                                <th className="px-4 py-2 text-center w-16 font-bold">#</th>
                                <th className="px-4 py-2">Tanggal</th>
                                <th className="px-4 py-2">Keterangan</th>
                                <th className="px-4 py-2">Perusahaan</th>
                                <th className="px-4 py-2 text-center w-40">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listLibur.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">
                                        <FontAwesomeIcon
                                            icon={faExclamationTriangle}
                                            className="text-6xl mb-2 text-gray-400"
                                        />
                                        <div className="text-lg font-medium">
                                            Oops! Data hari libur tidak ditemukan.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                listLibur.map((item, index) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-100">
                                        <td className="px-4 py-2 text-center font-bold">{index + 1}</td>
                                        <td className="px-4 py-2">{item.tanggal}</td>
                                        <td className="px-4 py-2">
                                            <div className="font-semibold">{item.nama}</div>
                                            <div className="text-gray-600 text-sm">{item.keterangan}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.detailPerusahaan && item.detailPerusahaan.length > 0 ? (
                                                <ul className="list-disc list-inside space-y-1 text-sm">
                                                    {item.detailPerusahaan.map((p) => (
                                                        <li key={p.id_perusahaan}>{p.perusahaan}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="italic text-gray-500">Semua (Libur Nasional)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-yellow-500 rounded-md text-white text-sm hover:bg-yellow-600 transition"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* Modal Tambah/Edit */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setTanggal(""); setKeterangan(""); setPerusahaan(""); setEditId(null); }} title={editId ? "Edit Hari Libur" : "Tambah Hari Libur"} note="Lengkapi form ini untuk menambahkan hari libur perusahaan." size="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Tanggal</label>
                        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Keterangan</label>
                        <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} required className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500" placeholder="Contoh: Libur Nasional / Cuti Bersama" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Perusahaan</label>
                        <select value={perusahaan} onChange={(e) => setPerusahaan(e.target.value)} className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500">
                            <option value="1">Semua (Libur Nasional)</option>
                            <option value="2">Cuti Bersama</option>
                            {listPerusahaan.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nama}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="text-right">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow">
                            Simpan
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManajemenHariLibur;
