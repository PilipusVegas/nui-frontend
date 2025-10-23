import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";

const TambahTugas = () => {
    const [nama, setNama] = useState("");
    const [category, setCategory] = useState("daily");
    const [startDate, setStartDate] = useState("");
    const [deadlineAt, setDeadlineAt] = useState("");
    const [workerList, setWorkerList] = useState([
        { id_user: "", deskripsi: "" },
    ]);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    // 🔙 Konfirmasi kembali
    const handleBack = async () => {
        const confirm = await Swal.fire({
            title: "Batalkan penambahan tugas?",
            text: "Data yang belum disimpan akan hilang.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, batalkan",
            cancelButtonText: "Kembali",
            iconColor: "#F87171",
        });
        if (confirm.isConfirmed) navigate("/penugasan");
    };

    // ➕ Tambah pekerja baru
    const handleAddWorker = () => {
        setWorkerList([...workerList, { id_user: "", deskripsi: "" }]);
    };

    // 🗑️ Hapus pekerja tertentu
    const handleRemoveWorker = (index) => {
        const updated = workerList.filter((_, i) => i !== index);
        setWorkerList(updated);
    };

    // 📝 Update field pekerja
    const handleWorkerChange = (index, field, value) => {
        const updated = [...workerList];
        updated[index][field] = value;
        setWorkerList(updated);
    };

    // 💾 Simpan data tugas
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nama.trim() || !startDate || !deadlineAt) {
            Swal.fire("Peringatan", "Nama, tanggal mulai, dan deadline wajib diisi!", "warning");
            return;
        }

        const confirm = await Swal.fire({
            title: "Simpan tugas baru?",
            text: "Data penugasan akan disimpan ke sistem.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, simpan",
            cancelButtonText: "Batal",
            iconColor: "#22C55E",
        });
        if (!confirm.isConfirmed) return;

        try {
            const payload = {
                nama,
                category,
                start_date: startDate,
                deadline_at: deadlineAt,
                worker_list: workerList.filter((w) => w.id_user && w.deskripsi.trim()),
            };

            const res = await fetchWithJwt(`${apiUrl}/tugas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Gagal menambahkan tugas.");

            Swal.fire({
                title: "Berhasil!",
                text: "Tugas baru berhasil ditambahkan.",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => navigate("/penugasan"));
        } catch (err) {
            Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menambah tugas.", "error");
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleBack}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Tambah Penugasan
                    </h1>
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="flex-grow px-5 sm:px-10 py-8 w-full mx-auto space-y-6"
            >
                {/* Nama Tugas */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Nama Tugas</label>
                    <p className="text-xs text-gray-500 mb-2">
                        Tulis nama penugasan secara jelas dan deskriptif.
                    </p>
                    <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        required
                        placeholder="Contoh: Rombak Aplikasi Absensi"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>

                {/* Kategori */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Kategori</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        <option value="daily">Daily</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                {/* Tanggal Mulai & Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Deadline</label>
                        <input
                            type="date"
                            value={deadlineAt}
                            onChange={(e) => setDeadlineAt(e.target.value)}
                            required
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>

                {/* Daftar Pekerja */}
                <div className="border border-gray-200 bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Daftar Pekerja
                        </h2>
                        <button
                            type="button"
                            onClick={handleAddWorker}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faPlus} /> Tambah
                        </button>
                    </div>

                    <div className="space-y-4">
                        {workerList.map((worker, index) => (
                            <div
                                key={index}
                                className="p-4 border border-gray-100 rounded-lg bg-gray-50 relative"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ID User
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Masukkan ID karyawan"
                                            value={worker.id_user}
                                            onChange={(e) =>
                                                handleWorkerChange(index, "id_user", e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi Tugas
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Deskripsi singkat"
                                            value={worker.deskripsi}
                                            onChange={(e) =>
                                                handleWorkerChange(index, "deskripsi", e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                {workerList.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveWorker(index)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                                        title="Hapus pekerja ini"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-between space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center shadow"
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow"
                    >
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Simpan Tugas
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TambahTugas;
