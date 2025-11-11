import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faExclamationTriangle, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import SectionHeader from "../../components/desktop/SectionHeader";
import Modal from "../../components/desktop/Modal";

const PerangkatAbsensi = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [menu, setMenu] = useState([]);
    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();

    // Fetch data menu
    const fetchMenu = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/mesin`);
            const data = await res.json();
            if (data?.success) {
                setMenu(data.data || []);
            } else {
                setMenu([]);
            }
        } catch (err) {
            console.error("Gagal memuat data menu:", err);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    // Submit Tambah/Edit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nama.trim() || !deskripsi.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Data tidak lengkap",
                text: "Nama perangkat dan deskripsi wajib diisi.",
                confirmButtonColor: "#16a34a",
            });
            return;
        }

        const url = editId ? `${apiUrl}/mesin/${editId}` : `${apiUrl}/mesin`;
        const method = editId ? "PUT" : "POST";

        try {
            await fetchWithJwt(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama, deskripsi }),
            });

            await Swal.fire({
                icon: "success",
                title: editId ? "Berhasil diperbarui" : "Berhasil ditambahkan",
                text: `Perangkat berhasil ${editId ? "diperbarui" : "ditambahkan"}.`,
                confirmButtonColor: "#16a34a",
            });

            setNama("");
            setDeskripsi("");
            setEditId(null);
            setIsModalOpen(false);
            fetchMenu();
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
        setNama(item.nama);
        setDeskripsi(item.deskripsi || "");
        setEditId(item.id);
        setIsModalOpen(true);
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <div className="w-full mx-auto">
            {/* Header */}
            <SectionHeader title="Perangkat Absensi" subtitle="Kelola daftar lokasi perangkat absensi di sini." onBack={handleBackClick}
                actions={
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                        <FontAwesomeIcon icon={faPlus} className="text-sm sm:text-base" />
                        <span className="hidden sm:inline">Tambah Perangkat</span>
                    </button>
                }
            />

            {/* Tabel Desktop */}
            <div className="hidden sm:block">
                <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-green-600 text-white">
                            <tr>
                                <th className="px-4 py-2 text-center w-24 font-bold">#</th>
                                <th className="px-4 py-2">Nama & Lokasi Perangkat</th>
                                <th className="px-4 py-2 text-center w-60">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menu.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-10 text-gray-500">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl mb-2 text-gray-400" />
                                        <div className="text-lg font-medium">Oops! Data perangkat tidak ditemukan.</div>
                                    </td>
                                </tr>
                            ) : (
                                menu.map((item, index) => (
                                    <tr key={item.id} className="border-t hover:bg-gray-200">
                                        <td className="px-4 py-2 text-center font-bold">{index + 1}</td>
                                        <td className="px-4 py-2">
                                            <div className="font-semibold text-gray-800">{item.nama}</div>
                                            <div className="text-sm leading-relaxed text-gray-600 break-words max-w-10xl">{item.deskripsi || "Tidak ada deskripsi"}</div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => handleEdit(item)} className="p-1 px-3 bg-yellow-500 rounded-md text-white hover:bg-yellow-600 transition">
                                                <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Card Mobile */}
            <div className="sm:hidden space-y-3 pb-6">
                {menu.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-3 text-gray-300" />
                        <p className="text-sm font-medium">Oops! Belum ada data perangkat.</p>
                    </div>
                ) : (
                    menu.map((item, index) => (
                        <div
                            key={item.id}
                            className="relative bg-white rounded-xl border border-gray-100 shadow-sm p-4 transition hover:shadow-md"
                        >
                            <button
                                onClick={() => handleEdit(item)}
                                className="absolute top-3 right-3 text-yellow-500 hover:text-yellow-600 transition"
                            >
                                <FontAwesomeIcon icon={faEdit} className="text-sm" />
                            </button>

                            <div className="flex flex-col space-y-2">
                                {/* Nomor urut */}
                                <span className="self-start text-xs font-semibold text-white bg-green-500/90 px-2.5 py-1 rounded-lg shadow-sm">
                                    {index + 1}
                                </span>
                                <h3 className="text-sm font-semibold text-gray-800 leading-snug">{item.nama}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{item.deskripsi}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Tambah/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setNama("");
                    setDeskripsi("");
                    setEditId(null);
                }}
                title={editId ? "Edit Perangkat" : "Tambah Perangkat"}
                note="Lengkapi form ini untuk menambahkan perangkat absensi dalam sistem."
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Nama Device Mesin</label>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                            placeholder="Masukkan nama perangkat"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Deskripsi</label>
                        <textarea
                            rows={3}
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 resize-none"
                            placeholder="Tulis deskripsi perangkat"
                        />
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

export default PerangkatAbsensi;
