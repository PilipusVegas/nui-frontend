import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { faSave, faTimes, faPlus, faTrash, faCopy, faSpinner, faCamera, faUpload } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal, LoadingSpinner } from "../../components";
import Select from "react-select";
import Webcam from "react-webcam";

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
    const MAX_PHOTO = 3;
    const [photos, setPhotos] = useState([]);
    const [showCamera, setShowCamera] = useState(false);
    const [facingMode, setFacingMode] = useState("environment");
    const webcamRef = useRef(null);
    const [deskripsiTugas, setDeskripsiTugas] = useState("");
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        if (showCamera) {
            setIsCameraReady(false);
        }
    }, [showCamera, facingMode]);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setStartDate(today);
    }, []);

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

    const handleAddWorker = () =>
        setWorkerList(prev => [
            ...prev,
            { id_user: "", deskripsi: "", telp: "", interval_notifikasi: 60 }
        ]);


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

        const confirm = await Swal.fire({
            title: "Simpan tugas baru?",
            text: "Data penugasan akan disimpan ke sistem.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, simpan",
            cancelButtonText: "Batal",
        });

        if (!confirm.isConfirmed) return;

        setLoading(true);

        try {
            const formData = new FormData();

            // ===== DATA UTAMA =====
            formData.append("nama", nama);
            formData.append("deskripsi", deskripsiTugas);
            formData.append("category", category);
            formData.append("start_date", startDate);
            formData.append("deadline_at", deadlineAt);

            workerList
                .filter((w) => w.id_user && w.deskripsi.trim())
                .forEach((worker, index) => {
                    formData.append(`worker_list[${index}][id_user]`, worker.id_user);
                    formData.append(`worker_list[${index}][deskripsi]`, worker.deskripsi.trim());
                    formData.append(`worker_list[${index}][telp]`, worker.telp || "");
                    formData.append(`worker_list[${index}][interval_notifikasi]`, worker.interval_notifikasi || 60);
                });

            // ===== FOTO (BINARY) =====
            photos.forEach((photo, index) => {
                const file = base64ToFile(photo, `foto_${index + 1}.jpg`);
                formData.append("foto", file);
            });

            const res = await fetchWithJwt(`${apiUrl}/tugas`, {
                method: "POST",
                body: formData, // ❗ JANGAN SET HEADER
            });

            if (!res.ok) throw new Error("Gagal menambahkan tugas.");

            Swal.fire("Berhasil!", "Tugas berhasil ditambahkan.", "success")
                .then(() => navigate("/penugasan"));
        } catch (err) {
            Swal.fire("Gagal", err.message, "error");
        } finally {
            setLoading(false);
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

        if (photos.length >= MAX_PHOTO) {
            toast.error("Maksimal 3 foto");
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot();

        if (!imageSrc) {
            toast.error("Gagal mengambil foto");
            return;
        }

        setPhotos((prev) => [...prev, imageSrc]);
        setShowCamera(false);
    };


    const handleRemovePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSwitchCamera = () => {
        setFacingMode((prev) =>
            prev === "environment" ? "user" : "environment"
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <SectionHeader title="Tambah Reminder" onBack={handleBack} subtitle="Tambah Reminder baru" />

            <form onSubmit={handleSubmit} className="flex-grow p-4 w-full mx-auto space-y-4">
                <div>
                    <label className="block font-medium text-gray-700">Tugas</label>
                    <p className="text-sm text-gray-500 mb-2">
                        Masukkan nama Reminder sebagai penanda secara ringkas.
                    </p>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value.slice(0, 150))} maxLength={150} required placeholder="Masukkan Nama Penugasan" className="w-full px-4 py-2 border-2 border-gray-400/50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    <p className="text-xs text-gray-400 mt-1">Maksimal 150 karakter ({nama.length}/150)</p>
                </div>

                <div>
                    <label className="block font-medium text-gray-700">
                        Deskripsi Tugas
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                        Jelaskan detail tugas secara umum agar mudah dipahami.
                    </p>
                    <textarea rows={3} value={deskripsiTugas} onChange={(e) => setDeskripsiTugas(e.target.value.slice(0, 500))} maxLength={500} placeholder="Contoh: Reminder ini digunakan untuk memastikan aktivitas operasional harian berjalan sesuai jadwal." className="w-full px-4 py-2 border-2 border-gray-400/50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none" />
                    <p className="text-xs text-gray-400 mt-1">
                        Maksimal 500 karakter ({deskripsiTugas.length}/500)
                    </p>
                </div>

                {/* ===== DOKUMENTASI FOTO (OPSIONAL) ===== */}
                <div className="mt-4 space-y-3">
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start sm:items-center">
                        <div>
                            <label className="block font-medium text-gray-700">
                                Dokumentasi Foto
                                <span className="text-gray-400 text-sm font-normal"> (Opsional)</span>
                            </label>
                            <p className="text-sm text-gray-500 max-w-md">
                                Tambahkan foto pendukung jika diperlukan (maks. 3 foto).
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <input type="file" id="photoUpload" hidden accept="image/jpeg,image/png" multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    const allowed = ["image/jpeg", "image/png"];

                                    const validFiles = files.filter(f => allowed.includes(f.type));

                                    if (photos.length + validFiles.length > MAX_PHOTO) {
                                        toast.error(`Maksimal ${MAX_PHOTO} foto`);
                                        return;
                                    }

                                    validFiles.forEach(file => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setPhotos(prev => [...prev, reader.result]);
                                        };
                                        reader.readAsDataURL(file);
                                    });

                                    e.target.value = "";
                                }}
                            />

                            <div onClick={() => { if (photos.length >= MAX_PHOTO) return; document.getElementById("photoUpload").click(); }}
                                className={`cursor-pointer rounded-xl border-2 border-dashed px-5 py-4 transition-all flex items-center gap-3 sm:min-w-[220px]
                                ${photos.length >= MAX_PHOTO ? "bg-gray-100 border-gray-300 cursor-not-allowed" : "bg-green-50 border-gray-300 hover:border-green-500"}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUpload} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 text-sm">
                                        Upload Foto
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        JPG / PNG
                                    </p>
                                </div>
                            </div>

                            <div onClick={() => photos.length < MAX_PHOTO && setShowCamera(true)}
                                className={`cursor-pointer rounded-xl border-2 border-dashed px-5 py-4 transition-all flex items-center gap-3 sm:min-w-[220px]
                                ${photos.length >= MAX_PHOTO ? "bg-gray-100 border-gray-300 cursor-not-allowed" : "bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-500"}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCamera} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 text-sm">
                                        Ambil Foto
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Kamera
                                    </p>
                                </div>
                            </div>

                            <span className="text-xs text-gray-500 whitespace-nowrap sm:ml-1">
                                {photos.length}/{MAX_PHOTO}
                            </span>
                        </div>
                    </div>

                    {photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {photos.map((photo, index) => (
                                <div key={index} className=" group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm hover:shadow-lg transition">
                                    <div className="aspect-[4/3] w-full">
                                        <img src={photo} alt={`Dokumentasi ${index + 1}`} className=" w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <div className=" absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                    <button type="button" onClick={() => handleRemovePhoto(index)} className=" absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur text-red-600 flex items-center justify-center shadow transition hover:bg-red-600 hover:text-white">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                    <span className="absolute bottom-2 left-2 text-xs font-medium bg-black/60 text-white px-2 py-0.5 rounded-md">
                                        Foto {index + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                <div>
                    <label className="block mb-1 font-medium text-gray-700">Kategori Tugas</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300/50 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        <option value="daily">Daily</option>
                        <option value="urgent">
                            Urgent
                        </option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Tanggal Mulai Penugasan</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} className="w-full border border-gray-300/50 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Tenggat Waktu Penugasan</label>
                        <input type="date" value={deadlineAt} onChange={(e) => setDeadlineAt(e.target.value)} required min={startDate || new Date().toISOString().split("T")[0]} disabled={!startDate} className={`w-full border border-gray-300/50 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${!startDate ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}/>
                    </div>
                </div>

                <div className="pt-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Daftar Penugasan Pekerja
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                                Kelola daftar pekerja dan tugas dengan mudah, termasuk menyalin data untuk
                                mempercepat proses input.
                            </p>
                        </div>
                        <button type="button" onClick={handleAddWorker} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg  text-sm flex items-center justify-center gap-2 shadow transition-all hover:scale-105 w-full md:w-auto">
                            <FontAwesomeIcon icon={faPlus} />
                            Tambah Baru
                        </button>
                    </div>

                    <div className="max-h-[100vh] overflow-y-auto scrollbar-green space-y-2 pb-24 pr-1">
                        {workerList.map((worker, index) => (
                            <div key={index} className="relative bg-white rounded-xl border border-gray-200 p-3 transition hover:shadow-md">
                                <div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l-xl" />
                                <div className="flex items-start justify-between mb-3 pl-2 gap-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 text-sm font-semibold rounded bg-green-100 text-green-700">
                                                #{index + 1}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-800">
                                                Penugasan Karyawan
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button type="button" aria-label="Salin penugasan"
                                            onClick={() => {
                                                const copied = { ...worker };
                                                setWorkerList((prev) => {
                                                    const updated = [...prev];
                                                    updated.splice(index + 1, 0, copied);
                                                    return updated;
                                                });
                                                toast.success("Penugasan berhasil disalin");
                                            }}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 transition"
                                        >
                                            <FontAwesomeIcon icon={faCopy} className="text-sm" />
                                            <span className="hidden sm:inline">Salin</span>
                                        </button>

                                        {workerList.length > 1 && (
                                            <button type="button" aria-label="Hapus penugasan" onClick={() => handleRemoveWorker(index)}
                                                className=" flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 transition"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-sm" />
                                                <span className="hidden sm:inline">Hapus</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 text-sm">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Karyawan yang Ditugaskan
                                        </label>

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
                                                handleWorkerChange(index, "id_user", selectedOption?.value || "");
                                                handleWorkerChange(index, "telp", selectedOption?.telp || "");
                                                handleWorkerChange(index, "role", selectedOption?.role || "");
                                            }}
                                            options={profilList.map((user) => ({
                                                value: user.id_user,
                                                label: user.nama_user,
                                                role: user.role,
                                                telp: user.telp,
                                            }))}
                                            placeholder="Pilih karyawan"
                                            classNamePrefix="react-select"
                                            menuPortalTarget={document.body}

                                            formatOptionLabel={(option) => (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {option.label}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {option.role}
                                                    </span>
                                                </div>
                                            )}

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
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                            }}
                                        />
                                    </div>


                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Pengingat Tugas (Menit)
                                        </label>

                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {[15, 30, 60, 120].map((val) => (
                                                <button key={val} type="button" onClick={() => handleWorkerChange(index, "interval_notifikasi", val)}
                                                    className={`px-2.5 py-1 rounded-full text-xs border
                                                    ${worker.interval_notifikasi === val ? "bg-green-600 text-white border-green-600" : "bg-gray-50 text-gray-600 border-gray-300 hover:border-green-500"}`}
                                                >
                                                    {val}m
                                                </button>
                                            ))}

                                            <input type="number" min={1} max={1440} value={worker.interval_notifikasi}
                                                onChange={(e) =>
                                                    handleWorkerChange(
                                                        index,
                                                        "interval_notifikasi",
                                                        Number(e.target.value || 60)
                                                    )
                                                }
                                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500
                                            "
                                            />
                                        </div>

                                        <span className="text-xs text-gray-600 mt-1 block">
                                            Sistem akan mengirim pengingat setiap {worker.interval_notifikasi || 60} menit.
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Deskripsi Pekerjaan
                                        </label>

                                        <textarea rows={2} placeholder="Contoh: Periksa stok gudang dan laporkan hasilnya." value={worker.deskripsi} onChange={(e) => handleWorkerChange(index, "deskripsi", e.target.value)} className=" w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 resize-none" required/>
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
                    <button type="submit" disabled={loading} className={`${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded flex items-center shadow transition-all`}>
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


            <Modal isOpen={showCamera} onClose={() => setShowCamera(false)} title="Ambil Foto Dokumentasi" note="Posisikan kamera dengan jelas sebelum mengambil foto." size="xl"
                footer={
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowCamera(false)} className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white">
                            Batal
                        </button>

                        <button type="button" onClick={handleSwitchCamera} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
                            Ganti Kamera
                        </button>

                        <button type="button" onClick={handleCapture} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                            Ambil Foto
                        </button>
                    </div>
                }
            >
                <div className="w-full max-w-4xl mx-auto">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black">
                        {!isCameraReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black">
                                <LoadingSpinner message="Mengaktifkan kamera..." />
                            </div>
                        )}
                        <Webcam key={facingMode} ref={webcamRef} audio={false} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} onUserMedia={() => setIsCameraReady(true)} onUserMediaError={() => setIsCameraReady(false)} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TambahTugas;
