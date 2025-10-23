import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";

const EditTugas = () => {
    const { id } = useParams();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [nama, setNama] = useState("");
    const [startDate, setStartDate] = useState("");
    const [category, setCategory] = useState("daily");
    const [deadline, setDeadline] = useState("");
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Ambil data tugas berdasarkan ID
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`);
                if (!res.ok) throw new Error("Gagal memuat data tugas");
                const result = await res.json();

                if (result.success && result.data.length > 0) {
                    const tugas = result.data[0];

                    setNama(tugas.nama);
                    setStartDate(tugas.start_date?.split("T")[0] || "");
                    setDeadline(tugas.deadline_at?.split("T")[0] || "");
                    setCategory(tugas.category || "daily");
                    setWorkers(
                        tugas.details?.map((d) => ({
                            id: d.id,
                            id_user: d.id_user,
                            deskripsi: d.deskripsi,
                        })) || []
                    );
                } else {
                    throw new Error("Data tugas tidak ditemukan");
                }
            } catch (err) {
                Swal.fire("Gagal", err.message || "Tidak dapat memuat data tugas.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, id]);

    const handleAddWorker = () => {
        setWorkers([...workers, { id_user: "", deskripsi: "" }]);
    };

    const handleRemoveWorker = (index) => {
        const updated = [...workers];
        updated.splice(index, 1);
        setWorkers(updated);
    };

    const handleWorkerChange = (index, field, value) => {
        const updated = [...workers];
        updated[index][field] = value;
        setWorkers(updated);
    };

    const handleBack = async () => {
        const confirm = await Swal.fire({
            title: "Batalkan perubahan?",
            text: "Perubahan yang belum disimpan akan hilang.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, batalkan",
            cancelButtonText: "Kembali",
            iconColor: "#F87171",
        });
        if (confirm.isConfirmed) navigate("/penugasan");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const confirm = await Swal.fire({
            title: "Simpan perubahan?",
            text: "Perubahan akan disimpan ke sistem.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, simpan",
            cancelButtonText: "Batal",
            iconColor: "#22C55E",
        });
        if (!confirm.isConfirmed) return;

        try {
            const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nama,
                    start_date: startDate,
                    category,
                    deadline_at: deadline,
                    worker_list: workers.map((w) => ({
                        id: w.id,
                        id_user: w.id_user,
                        deskripsi: w.deskripsi,
                    })),
                }),
            });

            if (!res.ok) throw new Error("Gagal memperbarui tugas");

            Swal.fire({
                title: "Berhasil!",
                text: "Data tugas berhasil diperbarui.",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => navigate("/penugasan"));
        } catch (err) {
            Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menyimpan.", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600 text-lg font-medium animate-pulse">Memuat data tugas...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-4 bg-white shadow-sm border-b">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleBack}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Edit Tugas</h1>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-grow py-4 w-full mx-auto space-y-6">
                {/* Nama Tugas */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Nama Tugas</label>
                    <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>

                {/* Kategori */}
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Kategori</label>
                    <select value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option value="daily">Harian</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                {/* Start dan Deadline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Batas Waktu</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>

                {/* Daftar Pekerja */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">Daftar Pekerja</h2>
                        <button
                            type="button"
                            onClick={handleAddWorker}
                            className="text-green-600 hover:text-green-700 flex items-center"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                            Tambah Pekerja
                        </button>
                    </div>

                    {workers.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">Belum ada pekerja ditambahkan.</p>
                    ) : (
                        <div className="space-y-4">
                            {workers.map((worker, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-2"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                ID Karyawan
                                            </label>
                                            <input
                                                type="number"
                                                value={worker.id_user}
                                                onChange={(e) => handleWorkerChange(index, "id_user", e.target.value)}
                                                placeholder="Masukkan ID Karyawan"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                                Deskripsi Tugas
                                            </label>
                                            <input
                                                type="text"
                                                value={worker.deskripsi}
                                                onChange={(e) => handleWorkerChange(index, "deskripsi", e.target.value)}
                                                placeholder="Contoh: Membuat halaman dashboard"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveWorker(index)}
                                            className="text-red-500 hover:text-red-700 text-sm flex items-center"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-between space-x-4 pt-6">
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
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTugas;
