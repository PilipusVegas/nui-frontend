import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { faSave, faTimes, faPlus, faTrash, faCopy, faSpinner, faCamera } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader } from "../../components";
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
    const webcamRef = useRef(null);

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
            formData.append("category", category);
            formData.append("start_date", startDate);
            formData.append("deadline_at", deadlineAt);

            workerList
                .filter((w) => w.id_user && w.deskripsi.trim())
                .forEach((worker, index) => {
                    formData.append(`worker_list[${index}][id_user]`, worker.id_user);
                    formData.append(`worker_list[${index}][deskripsi]`, worker.deskripsi.trim());
                    formData.append(`worker_list[${index}][telp]`, worker.telp || "");
                    formData.append(`worker_list[${index}][interval_notifikasi]`, 5); // contoh default
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
        if (photos.length >= MAX_PHOTO) {
            toast.error("Maksimal 3 foto");
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setPhotos((prev) => [...prev, imageSrc]);
        setShowCamera(false);
    };

    const handleRemovePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen flex flex-col">
            <SectionHeader title="Tambah Penugasan" onBack={handleBack} subtitle="Tambah penugasan baru" />

            <form onSubmit={handleSubmit} className="flex-grow p-4 w-full mx-auto space-y-4">
                <div>
                    <label className="block font-medium text-gray-700">Tugas</label>
                    <p className="text-sm text-gray-500 mb-2">
                        Masukkan nama penugasan sebagai penanda secara ringkas.
                    </p>
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value.slice(0, 150))} maxLength={150} required placeholder="Masukkan Nama Penugasan" className="w-full px-4 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    <p className="text-xs text-gray-400 mt-1">Maksimal 150 karakter ({nama.length}/150)</p>
                </div>

                {/* ===== DOKUMENTASI FOTO (OPSIONAL) ===== */}
                <div className="mt-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <label className="block font-medium text-gray-700">
                                Dokumentasi Foto
                                <span className="text-gray-400 text-sm font-normal"> (Opsional)</span>
                            </label>
                            <p className="text-sm text-gray-500">
                                Tambahkan foto pendukung jika diperlukan (maks. 3 foto).
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowCamera(true)}
                            disabled={photos.length >= MAX_PHOTO}
                            className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-2 text-sm shadow
                ${photos.length >= MAX_PHOTO
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            <FontAwesomeIcon icon={faCamera} />
                            Foto
                        </button>
                    </div>

                    {/* PREVIEW FOTO */}
                    {photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {photos.map((photo, index) => (
                                <div
                                    key={index}
                                    className="relative rounded-lg overflow-hidden border bg-gray-50"
                                >
                                    <img
                                        src={photo}
                                        alt={`Dokumentasi ${index + 1}`}
                                        className="w-full h-28 object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(index)}
                                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded shadow"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showCamera && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-md p-4 space-y-3">
                            <h4 className="font-semibold text-gray-800 text-center">
                                Ambil Foto Dokumentasi
                            </h4>

                            <div className="overflow-hidden rounded-lg border">
                                <Webcam
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ facingMode: "environment" }}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCamera(false)}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCapture}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                                >
                                    Ambil Foto
                                </button>
                            </div>
                        </div>
                    </div>
                )}


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
