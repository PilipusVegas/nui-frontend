import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes, faPlus, faTrash, faCopy } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import Select from "react-select";
import toast from "react-hot-toast";
import { SectionHeader } from "../../components";
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
    const [divisiList, setDivisiList] = useState([]);
    const [profilList, setProfilList] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                const [divisiRes, userRes, tugasRes] = await Promise.all([
                    fetchWithJwt(`${apiUrl}/karyawan/divisi`),
                    fetchWithJwt(`${apiUrl}/tugas/profil`),
                    fetchWithJwt(`${apiUrl}/tugas/${id}`),
                ]);

                const divisiData = await divisiRes.json();
                const userData = await userRes.json();
                const tugasData = await tugasRes.json();

                if (divisiData.success) setDivisiList(divisiData.data || []);
                if (userData.success) setProfilList(userData.data || []);

                if (tugasData.success && tugasData.data) {
                    const tugas = tugasData.data;
                    setNama(tugas.nama || "");
                    setStartDate(tugas.start_date?.split("T")[0] || "");
                    setDeadline(tugas.deadline_at?.split("T")[0] || "");
                    setCategory(tugas.category || "daily");

                    setWorkers(
                        tugas.details?.map((d) => {
                            const user = userData.data.find((u) => u.id_user === d.id_user);
                            const divisiId = user ? user.id_role : "";
                            const filtered = userData.data.filter(
                                (u) => String(u.id_role) === String(divisiId)
                            );

                            return {
                                id: divisiId,
                                id_user: d.id_user,
                                deskripsi: d.deskripsi,
                                filteredUsers: filtered,
                            };
                        }) || []
                    );
                }
            } catch (err) {
                toast.error("Gagal memuat data penugasan");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
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
            <SectionHeader title="Edit Penugasan" onBack={handleBack} subtitle="Silakan ubah informasi penugasan sesuai kebutuhan, lalu simpan untuk memperbarui data." />
            <form onSubmit={handleSubmit} className="flex-grow p-4 w-full mx-auto space-y-6">
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Nama Tugas</label>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>

                <div>
                    <label className="block mb-1 font-medium text-gray-700">Kategori</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        <option value="daily">Harian</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Tanggal Mulai</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Batas Waktu</label>
                        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
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
                        <button
                            type="button"
                            onClick={handleAddWorker}
                            className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-md text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Tambah Pekerja
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-green">
                        {workers.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">Belum ada pekerja ditambahkan.</p>
                        ) : (
                            workers.map((worker, index) => (
                                <div
                                    key={index}
                                    className="relative border border-green-500/30 rounded-xl bg-gradient-to-br from-green-100 to-white p-4 shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex justify-between items-start mb-4 pb-2 border-b border-green-500/30">
                                        <div>
                                            <h3 className="text-base font-semibold text-green-700">
                                                Rincian Penugasan {index + 1}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-4 px-2">
                                            <button className="text-lg text-blue-500 hover:text-blue-600 transition" type="button"
                                                onClick={() => {
                                                    const copied = { ...worker };
                                                    setWorkers((prev) => {
                                                        const updated = [...prev];
                                                        updated.splice(index + 1, 0, copied);
                                                        return updated;
                                                    });
                                                    toast.success(`Penugasan berhasil disalin`);
                                                }}
                                                title="Salin Penugasan Ini"
                                            >
                                                <FontAwesomeIcon icon={faCopy} />
                                            </button>

                                            {workers.length > 1 && (
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
                                                    .map((user) => ({ value: user.id_user, label: user.nama_user }))
                                                    .find((option) => option.value === worker.id_user) || null}
                                                onChange={(selectedOption) =>
                                                    handleWorkerChange(
                                                        index,
                                                        "id_user",
                                                        selectedOption ? selectedOption.value : ""
                                                    )
                                                }
                                                options={(worker.filteredUsers || []).map((user) => ({
                                                    value: user.id_user,
                                                    label: user.nama_user,
                                                }))}
                                                placeholder={
                                                    worker.id
                                                        ? "Pilih Karyawan..."
                                                        : "Pilih divisi terlebih dahulu"
                                                }
                                                isDisabled={!worker.id}
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

                                    {/* Deskripsi Penugasan */}
                                    <div>
                                        <label className="block text-md font-medium text-gray-800 mb-1">
                                            Deskripsi Penugasan
                                        </label>
                                        <textarea
                                            placeholder="Tuliskan deskripsi penugasan dengan jelas..."
                                            value={worker.deskripsi}
                                            onChange={(e) =>
                                                handleWorkerChange(index, "deskripsi", e.target.value)
                                            }
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-400/50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none text-gray-900"
                                            required
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>


                <div className="flex justify-between space-x-4 pt-6">
                    <button type="button" onClick={handleBack} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center shadow">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Batal
                    </button>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow">
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTugas;
