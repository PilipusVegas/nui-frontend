import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt } from "../../utils/jwtHelper";
import {
    faSave,
    faTimes,
    faPlus,
    faTrash,
    faCopy,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { SectionHeader } from "../../components";
import Select from "react-select";

const TambahTugas = () => {
    const navigate = useNavigate();
    const [nama, setNama] = useState("");
    const [startDate, setStartDate] = useState("");
    const [deadlineAt, setDeadlineAt] = useState("");
    const [workerList, setWorkerList] = useState([{ id_user: "", deskripsi: "", telp: "" }]);

    const [profilList, setProfilList] = useState([]);
    const [category, setCategory] = useState("daily");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profilRes = await fetchWithJwt(`${apiUrl}/tugas/profil`);
                const profilData = await profilRes.json();
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

    const handleAddWorker = () => setWorkerList([...workerList, { id_user: "", deskripsi: "", telp: "" }]);
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

        // ✅ Aktifkan indikator loading di sini
        setLoading(true);

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
                        telp: w.telp.trim(),
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
        } finally {
            // ✅ Matikan indikator loading di sini
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex flex-col">
            <SectionHeader
                title="Tambah Penugasan"
                onBack={handleBack}
                subtitle="Tambah penugasan baru"
            />

            <form onSubmit={handleSubmit} className="flex-grow p-4 w-full mx-auto space-y-4">
                <div>
                    <label className="block font-medium text-gray-700">Tugas</label>
                    <p className="text-sm text-gray-500 mb-2">
                        Masukkan nama penugasan sebagai penanda secara ringkas.
                    </p>
                    <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value.slice(0, 150))}
                        maxLength={150}
                        required
                        placeholder="Masukkan Nama Penugasan"
                        className="w-full px-4 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maksimal 150 karakter ({nama.length}/150)</p>
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-700">Kategori Tugas</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-gray-300/50 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option value="daily">Daily – untuk tugas rutin atau kegiatan harian.</option>
                        <option value="urgent">
                            Urgent – untuk tugas yang bersifat mendesak dan perlu segera diselesaikan.
                        </option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Tanggal Mulai Penugasan</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full border border-gray-300/50 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Tenggat Waktu Penugasan</label>
                        <input
                            type="date"
                            value={deadlineAt}
                            onChange={(e) => setDeadlineAt(e.target.value)}
                            required
                            min={startDate || new Date().toISOString().split("T")[0]}
                            disabled={!startDate}
                            className={`w-full border border-gray-300/50 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${!startDate ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
                                }`}
                        />
                    </div>
                </div>

                <div className="pt-5">
                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

                        {/* Title & Description */}
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Daftar Penugasan Pekerja
                            </h2>

                            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                                Kelola daftar pekerja dan tugas dengan mudah, termasuk menyalin data untuk
                                mempercepat proses input.
                            </p>
                        </div>

                        {/* Button */}
                        <button type="button" onClick={handleAddWorker} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg  text-sm flex items-center justify-center gap-2 shadow transition-all hover:scale-105 w-full md:w-auto">
                            <FontAwesomeIcon icon={faPlus} />
                            Tambah Baru
                        </button>
                    </div>


                    {/* LIST CONTAINER */}
                    <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-4 scrollbar-green pb-20">
                        {workerList.map((worker, index) => (
                            <div key={index} className="border border-green-500/50 bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4">
                                {/* CARD HEADER */}
                                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                                    <h3 className="text-sm font-semibold text-green-700">Penugasan {index + 1}</h3>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const copied = { ...worker };
                                                setWorkerList((prev) => {
                                                    const updated = [...prev];
                                                    updated.splice(index + 1, 0, copied);
                                                    return updated;
                                                });
                                                toast.success("Penugasan berhasil disalin");
                                            }}
                                            className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-[11px] text-white flex items-center gap-1 shadow-sm transition"
                                        >
                                            <FontAwesomeIcon icon={faCopy} className="w-3 h-3" />
                                            Salin
                                        </button>

                                        {workerList.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveWorker(index)} className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-[11px] text-white flex items-center gap-1 shadow-sm transition">
                                                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* CARD CONTENT */}
                                <div className="mt-3 space-y-4 text-sm">

                                    <Select
                                        value={
                                            profilList
                                                .map((user) => ({
                                                    value: user.id_user,
                                                    label: user.nama_user,
                                                    role: user.role,
                                                    telp: user.telp,
                                                }))
                                                .find((option) => option.value === worker.id_user) || null
                                        }
                                        onChange={(selectedOption) => {
                                            handleWorkerChange(
                                                index,
                                                "id_user",
                                                selectedOption ? selectedOption.value : ""
                                            );
                                            handleWorkerChange(
                                                index,
                                                "telp",
                                                selectedOption ? selectedOption.telp : ""
                                            )
                                        }
                                        }
                                        options={profilList.map((user) => ({
                                            value: user.id_user,
                                            label: user.nama_user,
                                            role: user.role,
                                            telp: user.telp,
                                        }))}
                                        placeholder="Pilih karyawan yang akan ditugaskan..."
                                        required
                                        classNamePrefix="react-select"
                                        menuPortalTarget={document.body}
                                        formatOptionLabel={(option) => (
                                            <div className="flex justify-between w-full items-center">
                                                <span>{option.label}</span>
                                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-md">
                                                    {option.role}
                                                </span>
                                            </div>
                                        )}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: "#86efac",
                                                minHeight: "38px",
                                                fontSize: "0.9rem",
                                                backgroundColor: "white",
                                                borderRadius: "0.6rem",
                                                boxShadow: "none",
                                                "&:hover": { borderColor: "#16a34a" },
                                            }),
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                paddingTop: 8,
                                                paddingBottom: 8,
                                                fontSize: "0.9rem",
                                                backgroundColor: state.isSelected
                                                    ? "#16a34a"
                                                    : state.isFocused
                                                        ? "#dcfce7"
                                                        : "white",
                                                color: state.isSelected ? "white" : "#1f2937",
                                                cursor: "pointer",
                                            }),
                                        }}
                                    />


                                    {/* DESKRIPSI */}
                                    <div className="flex flex-col gap-1">
                                        <label className="font-medium text-gray-700">Deskripsi Pekerjaan</label>
                                        <textarea placeholder="Tuliskan deskripsi penugasan dengan detail dan jelas..." value={worker.deskripsi}
                                            onChange={(e) =>
                                                handleWorkerChange(
                                                    index,
                                                    "deskripsi",
                                                    e.target.value
                                                )
                                            }
                                            rows="3"
                                            className="w-full border border-green-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
                                            required
                                        />
                                    </div>

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
                    <button type="submit"
                        disabled={loading}
                        className={`${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                            } text-white px-4 py-2 rounded flex items-center shadow transition-all`}
                    >
                        {loading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSave} className="mr-2" />
                                Simpan Tugas
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TambahTugas;
