import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faPlus, faTrash, faCopy, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import Select from "react-select";
import toast from "react-hot-toast";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState } from "../../components";

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
    const [error, setError] = useState(null);
    const [divisiList, setDivisiList] = useState([]);
    const [idTugas, setIdTugas] = useState(null);
    const [profilList, setProfilList] = useState([]);
    const [saving, setSaving] = useState(false);


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
                    setIdTugas(tugas.id);
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
                                id_detail: d.id,
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
        setWorkers([...workers, { id_user: "", deskripsi: "", id_tugas: idTugas }]);
    };

    const handleRemoveWorker = async (index) => {
        const worker = workers[index];

        const confirm = await Swal.fire({
            title: "Hapus penugasan ini?",
            text: "Data yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6B7280",
        });

        if (!confirm.isConfirmed) return;

        try {
            if (worker.id_detail) {
                const res = await fetchWithJwt(`${apiUrl}/tugas/user/${worker.id_detail}`, {
                    method: "DELETE",
                });

                if (!res.ok) throw new Error(`Gagal menghapus pekerja dengan ID ${worker.id_detail}`);
            }

            setWorkers((prev) => prev.filter((_, i) => i !== index));

            toast.success("Penugasan pekerja berhasil dihapus");
        } catch (error) {
            console.error("Error menghapus pekerja:", error);
            toast.error("Gagal menghapus penugasan pekerja");
        }
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

        setSaving(true);

        try {
            const payload = {
                nama,
                start_date: startDate,
                category,
                deadline_at: deadline,
                worker_list: workers.map((w) => {
                    const workerPayload = {
                        id_user: w.id_user,
                        deskripsi: w.deskripsi,
                        id_tugas: idTugas
                    };
                    if (w.id_detail) workerPayload.id = w.id_detail;
                    return workerPayload;
                }),
            };

            const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
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
        } finally {
            setSaving(false);
        }
    };



    if (loading) return <LoadingSpinner message="Memuat data penugasan..." />;
    if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    if (!workers.length && !nama)
        return <EmptyState message="Data tugas tidak ditemukan atau belum tersedia." />;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <SectionHeader title="Edit Penugasan" onBack={handleBack} subtitle="Silakan ubah informasi penugasan sesuai kebutuhan, lalu simpan untuk memperbarui data." />
            <form onSubmit={handleSubmit} className="flex-grow p-4 w-full mx-auto space-y-6">
                <div>
                    <label className="block mb-1 font-medium text-gray-700">Tugas</label>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value.slice(0, 150))} maxLength={150} required placeholder="Masukkan Nama Penugasan" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    <p className="text-xs text-gray-400 mt-1">
                        Maksimal 150 karakter ({nama.length}/150)
                    </p>
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
                        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={startDate || undefined} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
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

                    <div className="max-h-[55vh] overflow-y-auto pr-1 scrollbar-green">
                        {workers.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">Belum ada pekerja ditambahkan.</p>
                        ) : (
                            workers.map((worker, index) => (
                                <div
                                    key={index}
                                    className="relative border border-green-400/40 rounded-lg bg-white/80 shadow-sm hover:shadow-md transition-all duration-200 mb-3"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-center px-3 py-2 border-b border-green-300/40 bg-green-50">
                                        <h3 className="text-sm font-semibold text-green-700">
                                            Penugasan {index + 1}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {/* Tombol Salin */}
                                            <button
                                                type="button"
                                                title="Salin Penugasan"
                                                onClick={() => {
                                                    const { id_detail, ...copied } = worker;
                                                    setWorkers((prev) => {
                                                        const updated = [...prev];
                                                        updated.splice(index + 1, 0, copied);
                                                        return updated;
                                                    });
                                                    toast.success("Penugasan berhasil disalin");
                                                }}
                                                className="flex items-center gap-1 px-3 py-[6px] rounded-md text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all duration-150 shadow-sm"
                                            >
                                                <FontAwesomeIcon icon={faCopy} className="w-3 h-3" />
                                                <span>Salin</span>
                                            </button>

                                            {/* Tombol Hapus */}
                                            {workers.length > 1 && (
                                                <button
                                                    type="button"
                                                    title="Hapus Penugasan"
                                                    onClick={() => handleRemoveWorker(index)}
                                                    className="flex items-center gap-1 px-3 py-[6px] rounded-md text-xs font-medium text-white bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all duration-150 shadow-sm"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                                    <span>Hapus</span>
                                                </button>
                                            )}
                                        </div>

                                    </div>

                                    {/* Isi compact */}
                                    <div className="divide-y divide-gray-200 text-sm">
                                        {/* Divisi */}
                                        <div className="grid grid-cols-3 sm:grid-cols-4 items-center px-3 py-1.5">
                                            <span className="text-gray-700 font-medium col-span-1">Divisi</span>
                                            <div className="col-span-2 sm:col-span-3">
                                                <Select
                                                    value={divisiList
                                                        .filter((d) => d.id !== 1)
                                                        .map((d) => ({ value: d.id, label: d.nama }))
                                                        .find((opt) => opt.value === worker.id) || null}
                                                    onChange={(opt) => {
                                                        const divisiId = opt ? opt.value : "";
                                                        handleWorkerChange(index, "id", divisiId);
                                                        handleWorkerChange(
                                                            index,
                                                            "filteredUsers",
                                                            divisiId
                                                                ? profilList.filter(
                                                                    (u) => String(u.id_role) === String(divisiId)
                                                                )
                                                                : []
                                                        );
                                                    }}
                                                    options={divisiList
                                                        .filter((d) => d.id !== 1)
                                                        .map((d) => ({ value: d.id, label: d.nama }))}
                                                    placeholder="Pilih Divisi..."
                                                    classNamePrefix="react-select"
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            minHeight: "32px",
                                                            borderRadius: "0.375rem",
                                                            fontSize: "0.85rem",
                                                            boxShadow: "none",
                                                            borderColor: "#d1d5db",
                                                            "&:hover": { borderColor: "#16a34a" },
                                                        }),
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </div>
                                        </div>

                                        {/* Karyawan */}
                                        <div className="grid grid-cols-3 sm:grid-cols-4 items-center px-3 py-1.5">
                                            <span className="text-gray-700 font-medium col-span-1">Karyawan</span>
                                            <div className="col-span-2 sm:col-span-3">
                                                <Select
                                                    value={(worker.filteredUsers || [])
                                                        .map((u) => ({ value: u.id_user, label: u.nama_user }))
                                                        .find((opt) => opt.value === worker.id_user) || null}
                                                    onChange={(opt) =>
                                                        handleWorkerChange(index, "id_user", opt ? opt.value : "")
                                                    }
                                                    options={(worker.filteredUsers || []).map((u) => ({
                                                        value: u.id_user,
                                                        label: u.nama_user,
                                                    }))}
                                                    placeholder={
                                                        worker.id ? "Pilih Karyawan..." : "Pilih divisi dahulu"
                                                    }
                                                    isDisabled={!worker.id}
                                                    classNamePrefix="react-select"
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            minHeight: "32px",
                                                            borderRadius: "0.375rem",
                                                            fontSize: "0.85rem",
                                                            backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
                                                            borderColor: state.isDisabled ? "#e5e7eb" : "#d1d5db",
                                                            "&:hover": { borderColor: "#16a34a" },
                                                        }),
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </div>
                                        </div>

                                        {/* Deskripsi */}
                                        <div className="grid grid-cols-3 sm:grid-cols-4 items-start px-3 py-1.5">
                                            <span className="text-gray-700 font-medium col-span-1">Deskripsi Pekerjaan</span>
                                            <div className="col-span-2 sm:col-span-3">
                                                <textarea
                                                    value={worker.deskripsi}
                                                    onChange={(e) =>
                                                        handleWorkerChange(index, "deskripsi", e.target.value)
                                                    }
                                                    placeholder="Tuliskan deskripsi..."
                                                    rows="3"
                                                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 outline-none resize-none"
                                                />
                                            </div>
                                        </div>
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
                    <button type="submit" disabled={saving} className={`${saving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded flex items-center shadow transition-all`}>
                        {saving ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSave} className="mr-2" />
                                Simpan Perubahan
                            </>
                        )}
                    </button>

                </div>
            </form>
        </div>
    );
};

export default EditTugas;
