import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { faSave, faTimes, faPlus, faTrash, faCopy } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader } from "../../components";
import Select from "react-select";

const TambahTugas = () => {
    const navigate = useNavigate();
    const [nama, setNama] = useState("");
    const [startDate, setStartDate] = useState("");
    const [divisiList, setDivisiList] = useState([]);
    const [deadlineAt, setDeadlineAt] = useState("");
    const [profilList, setProfilList] = useState([]);
    const [category, setCategory] = useState("daily");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [workerList, setWorkerList] = useState([{ id_user: "", deskripsi: "", filteredUsers: [] }]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [divRes, profilRes] = await Promise.all([
                    fetchWithJwt(`${apiUrl}/karyawan/divisi`),
                    fetchWithJwt(`${apiUrl}/profil`)
                ]);

                const divData = await divRes.json();
                const profilData = await profilRes.json();

                setDivisiList(divData?.data || []);
                setProfilList(profilData?.data || []);
            } catch (error) {
                console.error("Gagal memuat data:", error);
            }
        };

        fetchData();
    }, [apiUrl]);

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


    const handleAddWorker = () => setWorkerList([...workerList, { id_user: "", deskripsi: "" }]);
    const handleRemoveWorker = async (index) => {
        const confirm = await Swal.fire({
            title: "Hapus penugasan pada karyawan ini?",
            text: "Data penugasan akan dihapus dari daftar penugasan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            iconColor: "#f87171",
        });
        if (confirm.isConfirmed) {
            setWorkerList((prev) => prev.filter((_, i) => i !== index));
            toast.success("Pekerja berhasil dihapus dari daftar penugasan.");
        }
    };

    const handleWorkerChange = (index, field, value) => {
        const updated = [...workerList];
        updated[index][field] = value;
        setWorkerList(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const today = new Date().toISOString().split("T")[0];

        if (!nama.trim() || !startDate || !deadlineAt) {
            Swal.fire("Peringatan", "Nama, tanggal mulai, dan deadline wajib diisi!", "warning");
            return;
        }

        if (startDate < today) {
            Swal.fire("Peringatan", "Tanggal mulai tidak boleh mundur dari hari ini!", "warning");
            return;
        }

        if (deadlineAt < startDate) {
            Swal.fire("Peringatan", "Deadline tidak boleh kurang dari tanggal mulai!", "warning");
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
                worker_list: workerList
                    .filter((w) => w.id_user && w.deskripsi.trim())
                    .map((w) => ({
                        id_user: Number(w.id_user),
                        deskripsi: w.deskripsi.trim(),
                    })),
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
            <SectionHeader title="Tambah Penugasan" onBack={handleBack} subtitle="Tambah penugasan baru" />

            <form onSubmit={handleSubmit} className="flex-grow p-4 w-full mx-auto space-y-4">
                <div>
                    <label className="block font-medium text-gray-700">
                        Nama Tugas
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                        Masukkan nama penugasan sebagai penanda secara ringkas.
                    </p>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value.slice(0, 150))} maxLength={150} required placeholder="Masukkan Nama Penugasan" className="w-full px-4 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
                    <p className="text-xs text-gray-400 mt-1">
                        Maksimal 150 karakter ({nama.length}/150)
                    </p>

                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-700">Kategori Tugas</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300/50 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        <option value="daily">Daily – untuk tugas rutin atau kegiatan harian.</option>
                        <option value="urgent">Urgent – untuk tugas yang bersifat mendesak dan perlu segera diselesaikan.</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            Tanggal Mulai Penugasan
                        </label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} className="w-full border border-gray-300/50 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">
                            Tenggat Waktu Penugasan
                        </label>
                        <input type="date" value={deadlineAt} onChange={(e) => setDeadlineAt(e.target.value)} required min={startDate || new Date().toISOString().split("T")[0]} disabled={!startDate} className={`w-full border border-gray-300/50 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${!startDate ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`} />
                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Daftar Penugasan Pekerja</h2>
                            <p className="text-sm text-gray-600">
                                Kelola daftar pekerja dan tugas dengan mudah, termasuk menyalin data untuk mempercepat proses input.
                            </p>
                        </div>
                        <button type="button" onClick={handleAddWorker} className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-md text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105">
                            <FontAwesomeIcon icon={faPlus} />
                            Tambah Pekerja
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-green">
                        {workerList.map((worker, index) => (
                            <div key={index} className="relative border border-green-500/30 rounded-xl bg-gradient-to-br from-green-100 to-white p-4 shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="flex justify-between items-start mb-4 pb-2 border-b border-green-500/30">
                                    <div>
                                        <h3 className="text-base font-semibold text-green-700">
                                            Rincian Penugasan {index + 1}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-4 px-2">
                                        <button type="button" onClick={() => {
                                            const copied = { ...worker };
                                            setWorkerList((prev) => {
                                                const updated = [...prev];
                                                updated.splice(index + 1, 0, copied);
                                                return updated;
                                            });
                                            toast.success(`Penugasan berhasil disalin`);
                                        }}
                                            className="text-lg text-blue-500 hover:text-blue-600 transition"
                                            title="Copy Penugasan Ini"
                                        >
                                            <FontAwesomeIcon icon={faCopy} />
                                        </button>
                                        {workerList.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveWorker(index)} className="text-lg text-red-500 hover:text-red-600 transition" title="Hapus pekerja ini">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-md font-medium text-gray-800 mb-1">
                                            Divisi Karyawan
                                        </label>
                                        <Select
                                            value={
                                                divisiList
                                                    .filter((div) => div.id !== 1)
                                                    .map((div) => ({ value: div.id, label: div.nama }))
                                                    .find((option) => option.value === worker.id) || null
                                            }
                                            onChange={(selectedOption) => {
                                                const divisiId = selectedOption ? selectedOption.value : "";
                                                handleWorkerChange(index, "id", divisiId);

                                                if (divisiId) {
                                                    const filtered = profilList.filter(
                                                        (user) => String(user.id_role) === String(divisiId)
                                                    );
                                                    handleWorkerChange(index, "filteredUsers", filtered);
                                                } else {
                                                    handleWorkerChange(index, "filteredUsers", []);
                                                }
                                            }}
                                            options={divisiList
                                                .filter((div) => div.id !== 1)
                                                .map((div) => ({ value: div.id, label: div.nama }))}
                                            placeholder="Pilih Divisi..."
                                            classNamePrefix="react-select"
                                            required
                                            menuPortalTarget={document.body}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: "#9CA3AF",
                                                    borderRadius: "0.5rem",
                                                    minHeight: "38px",
                                                    boxShadow: "none",
                                                    "&:hover": { borderColor: "#22C55E" },
                                                }),
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                    </div>

                                    {/* Pilih Karyawan */}
                                    <div>
                                        <label className="block text-md font-medium text-gray-800 mb-1">
                                            Nama Karyawan
                                        </label>
                                        <Select
                                            value={(worker.filteredUsers || [])
                                                .map((user) => ({ value: user.id, label: user.nama }))
                                                .find((option) => option.value === worker.id_user) || null}
                                            onChange={(selectedOption) => {
                                                handleWorkerChange(index, "id_user", selectedOption ? selectedOption.value : "");
                                            }}
                                            options={(worker.filteredUsers || []).map((user) => ({
                                                value: user.id,
                                                label: user.nama,
                                            }))}
                                            placeholder={worker.id ? "Pilih Karyawan..." : "Pilih divisi terlebih dahulu"}
                                            isDisabled={!worker.id}
                                            required
                                            classNamePrefix="react-select"
                                            menuPortalTarget={document.body}
                                            styles={{
                                                control: (base, state) => ({
                                                    ...base,
                                                    borderColor: state.isDisabled ? "#E5E7EB" : "#9CA3AF",
                                                    borderRadius: "0.5rem",
                                                    minHeight: "38px",
                                                    backgroundColor: state.isDisabled ? "#F9FAFB" : "white",
                                                    boxShadow: "none",
                                                    "&:hover": { borderColor: "#22C55E" },
                                                }),
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-md font-medium text-gray-800 mb-1">
                                        Deskripsi Penugasan
                                    </label>
                                    <textarea placeholder="Tuliskan deskripsi penugasan dengan jelas..." value={worker.deskripsi} onChange={(e) => handleWorkerChange(index, "deskripsi", e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none text-gray-900" required />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between space-x-4 pt-4">
                    <button type="button" onClick={handleBack} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center shadow">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Batal
                    </button>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow">
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Simpan Tugas
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TambahTugas;