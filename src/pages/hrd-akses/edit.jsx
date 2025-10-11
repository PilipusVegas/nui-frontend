import Swal from "sweetalert2";
import Select from "react-select";
import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, } from "../../components";
import { faArrowLeft, faSave, faUserTie, faBuilding, faTimes, } from "@fortawesome/free-solid-svg-icons";

const EditHrdAccess = () => {
    const { id_user } = useParams();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [hrdData, setHrdData] = useState(null);
    const [allPerusahaan, setAllPerusahaan] = useState([]);
    const [selectedPerusahaan, setSelectedPerusahaan] = useState([]);

    /** --- Fetch Detail HRD --- **/
    const fetchHrdDetail = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/profil/hrd-access/${id_user}`);
            if (!res.ok) throw new Error("Gagal memuat detail HRD");
            const data = await res.json();
            setHrdData(data.data);
            setSelectedPerusahaan(
                data.data?.perusahaan?.map((p) => ({
                    value: p.id,
                    label: p.nama,
                })) || []
            );
        } catch (err) {
            setError("Gagal memuat detail HRD. Silakan coba lagi nanti.");
            console.error(err);
        }
    };

    /** --- Fetch Semua Perusahaan --- **/
    const fetchPerusahaan = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/perusahaan`);
            if (!res.ok) throw new Error("Gagal memuat data perusahaan");
            const data = await res.json();
            setAllPerusahaan(
                data.data.map((item) => ({
                    value: item.id,
                    label: item.nama,
                }))
            );
        } catch (err) {
            setError("Gagal memuat daftar perusahaan.");
            console.error(err);
        }
    };

    /** --- Load Data --- **/
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            await Promise.all([fetchHrdDetail(), fetchPerusahaan()]);
            setLoading(false);
        };
        loadData();
    }, [id_user]);

    /** --- Handle Submit --- **/
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hrdData) return;

        const payload = {
            id_hrd: hrdData.id_user,
            perusahaan_list: selectedPerusahaan.map((p) => p.value),
        };

        try {
            setSubmitting(true);
            const res = await fetchWithJwt(`${apiUrl}/profil/hrd-access/${id_user}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();

            if (result.success) {
                toast.success("Data akses HRD berhasil diperbarui!");
                navigate("/akses-hrd");
            } else {
                toast.error(result.message || "Gagal memperbarui data HRD");
            }
        } catch (err) {
            console.error("Gagal update data HRD:", err);
            toast.error("Terjadi kesalahan server.");
        } finally {
            setSubmitting(false);
        }
    };

    /** --- Hapus perusahaan dari list dengan Swal dan toast --- **/
    const handleRemovePerusahaan = (value, label) => {
        Swal.fire({
            title: "Hapus Perusahaan?",
            text: `Apakah Anda yakin ingin menghapus perusahaan "${label}" dari daftar?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                setSelectedPerusahaan((prev) =>
                    prev.filter((item) => item.value !== value)
                );
                toast.success(`Perusahaan "${label}" dihapus`);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                toast("Penghapusan dibatalkan");
            }
        });
    };

    /** --- Kondisi UI --- **/
    if (loading) return <LoadingSpinner message="Memuat data HRD..." />;
    if (error)
        return (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
        );
    if (!hrdData) return <EmptyState message="Data HRD tidak ditemukan." />;

    /** --- Tampilan Form --- **/
    return (
        <div className="w-full mx-auto">
            <SectionHeader title="Edit Akses HRD" subtitle="Form ini digunakan untuk mengedit perusahaan yang dapat diakses oleh HRD ini." onBack={() => navigate(-1)} />

            <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl border border-gray-200 p-8 mt-6 mx-auto min-h-[70vh] flex flex-col">
                {/* Data HRD */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                    <div className="flex-shrink-0 bg-gradient-to-br from-green-200 to-green-100 text-green-700 p-4 rounded-full shadow-md flex items-center justify-center">
                        <FontAwesomeIcon icon={faUserTie} className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-gray-900 font-semibold text-xl tracking-wide">
                            {hrdData.nama}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                            HRD yang memiliki akses mengelola beberapa perusahaan
                        </p>
                    </div>
                </div>

                {/* Pilihan Perusahaan */}
                <div className="mb-6 flex-1">
                    <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">
                        Cari Perusahaan
                    </label>
                    <Select isClearable isSearchable value={null}
                        onChange={(selectedOption) => {
                            if (selectedOption) {
                                const alreadyExists = selectedPerusahaan.some(
                                    (p) => p.value === selectedOption.value
                                );
                                if (!alreadyExists) {
                                    setSelectedPerusahaan((prev) => [...prev, selectedOption]);
                                }
                            }
                        }}
                        options={allPerusahaan.filter(
                            (p) => !selectedPerusahaan.some((sel) => sel.value === p.value)
                        )}
                        placeholder="Cari atau pilih perusahaan yang ingin ditambahkan..."
                        className="text-sm"
                        classNames={{
                            control: () =>
                                "border-gray-300 shadow-sm hover:border-green-400 focus:ring-2 focus:ring-green-200 rounded-lg",
                        }}
                    />

                    {selectedPerusahaan.length > 0 && (
                        <div className="mt-6">
                            <span className="block font-semibold text-gray-800 mb-3">
                                Perusahaan yang akan dikelola oleh HRD ini:
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedPerusahaan.map((p) => (
                                    <div key={p.value} className="relative border border-gray-200/70 bg-white rounded-xl p-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 text-green-600 p-2 px-3 rounded-lg">
                                                <FontAwesomeIcon icon={faBuilding} className="text-lg" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 text-sm uppercase">
                                                    {p.label}
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Tombol hapus */}
                                        <button type="button" onClick={() => handleRemovePerusahaan(p.value, p.label)} className="text-gray-400 hover:text-red-500 transition p-2 rounded-md">
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Tombol Aksi di paling bawah justify-between */}
                <div className="flex justify-between mt-auto pt-6 border-t border-gray-200">
                    <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 flex items-center gap-2">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Kembali
                    </button>

                    <button type="submit" disabled={submitting} className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200 ${submitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"}`}>
                        <FontAwesomeIcon icon={faSave} />
                        {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditHrdAccess;