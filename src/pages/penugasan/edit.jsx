import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faPlus, faTrash, faCopy, faSpinner, faUpload, faCamera } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import Select from "react-select";
import toast from "react-hot-toast";
import Webcam from "react-webcam";

import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, Modal } from "../../components";

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
    const [idTugas, setIdTugas] = useState(null);
    const [profilList, setProfilList] = useState([]);
    const [saving, setSaving] = useState(false);
    const MAX_PHOTO = 3;
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [showCamera, setShowCamera] = useState(false);
    const [facingMode, setFacingMode] = useState("environment");
    const webcamRef = useRef(null);

    const totalPhotoCount = existingPhotos.length + newPhotos.length;

    const isPhotoLimitReached = () => {
        if (totalPhotoCount >= MAX_PHOTO) {
            toast.error(
                "Maksimal 3 foto. Hapus foto lama terlebih dahulu untuk menambah foto baru."
            );
            return true;
        }
        return false;
    };


    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [userRes, tugasRes] = await Promise.all([
                    fetchWithJwt(`${apiUrl}/tugas/profil`),
                    fetchWithJwt(`${apiUrl}/tugas/${id}`),
                ]);

                const userData = await userRes.json();
                const tugasData = await tugasRes.json();
                if (userData.success) setProfilList(userData.data || [])
                if (tugasData.success && tugasData.data) {
                    const tugas = tugasData.data;
                    setIdTugas(tugas.id);
                    setNama(tugas.nama || "");
                    setStartDate(tugas.start_date?.split("T")[0] || "");
                    setDeadline(tugas.deadline_at?.split("T")[0] || "");
                    setCategory(tugas.category || "daily");

                    setWorkers(
                        tugas.details?.map((d) => ({
                            id_user: d.id_user,
                            deskripsi: d.deskripsi,
                            telp: d.telp || "",
                            interval_notifikasi: d.interval_notifikasi ?? 60,
                            id_detail: d.id,
                        })) || []
                    );

                    if (tugas.attachment) {
                        setExistingPhotos(
                            tugas.attachment.map((a) => ({
                                id: a.id,
                                url: `${apiUrl}/uploads/img/tugas/${a.bukti_foto}`,
                            }))
                        );
                    }
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
        setWorkers([...workers, { id_user: "", deskripsi: "", telp: "", id_tugas: idTugas }]);
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
            const formData = new FormData();

            formData.append("nama", nama);
            formData.append("start_date", startDate);
            formData.append("category", category);
            formData.append("deadline_at", deadline);

            workers.forEach((w, index) => {
                if (w.id_detail) {
                    formData.append(`worker_list[${index}][id]`, w.id_detail);
                }

                formData.append(`worker_list[${index}][id_user]`, w.id_user);
                formData.append(`worker_list[${index}][id_tugas]`, idTugas);
                formData.append(`worker_list[${index}][deskripsi]`, w.deskripsi);
                formData.append(`worker_list[${index}][interval_notifikasi]`, w.interval_notifikasi);

                // OPTIONAL – sesuaikan dengan backend
                // formData.append(`worker_list[${index}][is_paused]`, w.is_paused ?? 0);
                formData.append(`worker_list[${index}][status]`, w.status ?? 0);
            });


            newPhotos.forEach((file) => {
                formData.append("foto", file);
            });

            const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) throw new Error("Gagal memperbarui tugas");

            Swal.fire({
                title: "Berhasil!",
                text: "Data tugas berhasil diperbarui.",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => navigate("/penugasan"));

        } catch (err) {
            Swal.fire(
                "Gagal",
                err.message || "Terjadi kesalahan saat menyimpan.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    const base64ToFile = (base64, filename) => {
        const arr = base64.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    };


    const handleCapture = () => {
        if (!webcamRef.current) {
            toast.error("Kamera belum siap");
            return;
        }

        if (isPhotoLimitReached()) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            toast.error("Gagal mengambil foto");
            return;
        }

        const file = base64ToFile(
            imageSrc,
            `foto_${Date.now()}.jpg`
        );

        setNewPhotos(prev => [...prev, file]);
        setShowCamera(false);
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

                {/* ===== DOKUMENTASI FOTO (OPSIONAL) ===== */}
                <div className="mt-4 space-y-3">

                    {/* HEADER */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start sm:items-center">
                        <div>
                            <label className="block font-medium text-gray-700">
                                Dokumentasi Foto
                                <span className="text-gray-400 text-sm font-normal"> (Opsional)</span>
                            </label>
                            <p className="text-sm text-gray-500 max-w-md">
                                Foto lama tetap tersimpan. Anda dapat menambah atau menghapus foto.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">

                            {/* INPUT FILE */}
                            <input type="file" id="photoUpload" hidden accept="image/jpeg,image/png" multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    const allowed = ["image/jpeg", "image/png"];
                                    const validFiles = files.filter(f => allowed.includes(f.type));

                                    if (isPhotoLimitReached()) {
                                        e.target.value = "";
                                        return;
                                    }

                                    const remainingSlot = MAX_PHOTO - totalPhotoCount;

                                    validFiles.slice(0, remainingSlot).forEach(file => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setNewPhotos(prev => [...prev, reader.result]);
                                        };
                                        reader.readAsDataURL(file);
                                    });

                                    if (validFiles.length > remainingSlot) {
                                        toast.error(
                                            "Sebagian foto tidak ditambahkan karena batas maksimal 3 foto."
                                        );
                                    }

                                    e.target.value = "";
                                }}

                            />

                            <div onClick={() => { if (isPhotoLimitReached()) return; document.getElementById("photoUpload").click(); }} className="cursor-pointer rounded-xl border-2 border-dashed px-5 py-4 transition-all flex items-center gap-3 sm:min-w-[220px] bg-green-50 border-gray-300 hover:border-green-500">
                                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUpload} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 text-sm">Upload Foto</p>
                                    <p className="text-xs text-gray-500">JPG / PNG</p>
                                </div>
                            </div>

                            {/* KAMERA */}
                            <div onClick={() => { if (isPhotoLimitReached()) return; setShowCamera(true); }}
                                className="cursor-pointer rounded-xl border-2 border-dashed px-5 py-4 transition-all flex items-center gap-3 sm:min-w-[220px] bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-500">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCamera} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 text-sm">Ambil Foto</p>
                                    <p className="text-xs text-gray-500">Kamera</p>
                                </div>
                            </div>

                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                {existingPhotos.length + newPhotos.length}/{MAX_PHOTO}
                            </span>
                        </div>
                    </div>

                    {/* PREVIEW FOTO */}
                    {(existingPhotos.length > 0 || newPhotos.length > 0) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[...existingPhotos, ...newPhotos].map((photo, index) => {
                                const isExisting = index < existingPhotos.length;
                                const imageSrc = isExisting ? photo.url : URL.createObjectURL(photo);

                                const handleRemove = () => {
                                    if (isExisting) {
                                        setExistingPhotos(prev =>
                                            prev.filter(p => p.id !== photo.id)
                                        );
                                    } else {
                                        const newIndex = index - existingPhotos.length;
                                        setNewPhotos(prev =>
                                            prev.filter((_, i) => i !== newIndex)
                                        );
                                    }
                                };

                                return (
                                    <div key={isExisting ? `old-${photo.id}` : `new-${index}`} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm hover:shadow-lg transition">
                                        <div className="aspect-[4/3] w-full">
                                            <img src={imageSrc} alt={`Dokumentasi ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                        <button type="button" onClick={handleRemove} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur text-red-600 flex items-center justify-center shadow transition hover:bg-red-600 hover:text-white" title="Hapus foto">
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                        <span className="absolute bottom-2 left-2 text-xs font-medium bg-black/60 text-white px-2 py-0.5 rounded-md">
                                            Foto {index + 1}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>


                <div>
                    <label className="block mb-1 font-medium text-gray-700">Kategori</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        <option value="daily">Daily</option>
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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Daftar Penugasan Pekerja
                            </h2>

                            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                                Pantau dan kelola daftar pekerja serta tugas yang terkait. Anda juga dapat menyalin data untuk mempercepat proses input.
                            </p>
                        </div>

                        <button type="button" onClick={handleAddWorker} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 shadow transition-all hover:scale-105 w-full md:w-auto">
                            <FontAwesomeIcon icon={faPlus} />
                            Tambah Pekerja
                        </button>
                    </div>


                    {/* LIST CONTAINER */}
                    <div className="max-h-[100vh] overflow-y-auto space-y-2 pb-24 pr-1 scrollbar-green">

                        {workers.length === 0 && (
                            <p className="text-gray-500 text-sm italic">
                                Belum ada pekerja ditambahkan.
                            </p>
                        )}

                        {workers.map((worker, index) => (
                            <div key={index} className="relative bg-white rounded-xl border border-gray-200 p-3 transition hover:shadow-md">
                                {/* ACCENT STRIP */}
                                <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l-xl" />

                                {/* HEADER */}
                                <div className="flex items-start justify-between mb-3 pl-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 text-sm font-semibold rounded bg-green-100 text-green-700">
                                            #{index + 1}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800">
                                            Penugasan Karyawan
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* SALIN */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const { id_detail, ...copied } = worker;
                                                setWorkers((prev) => {
                                                    const updated = [...prev];
                                                    updated.splice(index + 1, 0, copied);
                                                    return updated;
                                                });
                                                toast.success("Penugasan berhasil disalin");
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 transition"
                                        >
                                            <FontAwesomeIcon icon={faCopy} className="text-sm" />
                                            <span className="hidden sm:inline">Salin</span>
                                        </button>

                                        {/* HAPUS */}
                                        {workers.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveWorker(index)} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 transition">
                                                <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                                <span className="hidden sm:inline">Hapus</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* BODY */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2 text-sm">

                                    {/* KARYAWAN */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Karyawan yang Ditugaskan
                                        </label>

                                        <Select
                                            value={
                                                profilList
                                                    .map((u) => ({
                                                        value: u.id_user,
                                                        label: u.nama_user,
                                                        telp: u.telp,
                                                    }))
                                                    .find((opt) => opt.value === worker.id_user) || null
                                            }
                                            onChange={(opt) => {
                                                handleWorkerChange(index, "id_user", opt?.value || "");
                                                handleWorkerChange(index, "telp", opt?.telp || "");
                                            }}
                                            options={profilList.map((u) => ({
                                                value: u.id_user,
                                                label: u.nama_user,
                                                telp: u.telp,
                                            }))}
                                            placeholder="Pilih karyawan"
                                            classNamePrefix="react-select"
                                            menuPortalTarget={document.body}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    minHeight: "42px",
                                                    borderRadius: "0.6rem",
                                                    borderColor: "#d1d5db",
                                                    fontSize: "14px",
                                                    boxShadow: "none",
                                                    "&:hover": { borderColor: "#22c55e" },
                                                }),
                                            }}
                                        />
                                    </div>

                                    {/* PENGINGAT */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Pengingat Tugas (Menit)
                                        </label>

                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {[15, 30, 60, 120].map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() =>
                                                        handleWorkerChange(index, "interval_notifikasi", val)
                                                    }
                                                    className={`px-2.5 py-1 rounded-full text-xs border
                        ${worker.interval_notifikasi === val
                                                            ? "bg-green-600 text-white border-green-600"
                                                            : "bg-gray-50 text-gray-600 border-gray-300 hover:border-green-500"
                                                        }`}
                                                >
                                                    {val}m
                                                </button>
                                            ))}

                                            <input
                                                type="number"
                                                min={1}
                                                max={1440}
                                                value={worker.interval_notifikasi}
                                                onChange={(e) =>
                                                    handleWorkerChange(
                                                        index,
                                                        "interval_notifikasi",
                                                        Number(e.target.value || 60)
                                                    )
                                                }
                                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded-md
                    focus:ring-1 focus:ring-green-500"
                                            />
                                        </div>

                                        <span className="text-xs text-gray-600 mt-1 block">
                                            Sistem akan mengirim pengingat secara berkala.
                                        </span>
                                    </div>

                                    {/* DESKRIPSI — SEKARANG SEJAJAR */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Deskripsi Pekerjaan
                                        </label>

                                        <textarea
                                            rows={2}
                                            placeholder="Contoh: Periksa stok gudang dan laporkan hasilnya."
                                            value={worker.deskripsi}
                                            onChange={(e) =>
                                                handleWorkerChange(index, "deskripsi", e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 resize-none"
                                            required
                                        />
                                    </div>
                                </div>

                            </div>
                        ))}
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

            <Modal isOpen={showCamera} onClose={() => setShowCamera(false)} title="Ambil Foto Dokumentasi" note="Pastikan objek terlihat jelas sebelum mengambil foto." size="xl"
                footer={
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowCamera(false)} className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white">
                            Batal
                        </button>

                        <button type="button" onClick={() =>
                            setFacingMode(prev =>
                                prev === "environment" ? "user" : "environment"
                            )
                        }
                            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            Ganti Kamera
                        </button>

                        <button type="button" onClick={handleCapture} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white">
                            Ambil Foto
                        </button>
                    </div>
                }
            >
                <div className="overflow-hidden rounded-lg border">
                    <Webcam key={facingMode} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} className="w-full" />
                </div>
            </Modal>

        </div>
    );
};

export default EditTugas;
