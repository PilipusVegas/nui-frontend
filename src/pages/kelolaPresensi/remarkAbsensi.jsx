import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import Select from "react-select";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import toast from "react-hot-toast";
import SectionHeader from "../../components/desktop/SectionHeader";

const AbsenManual = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const user = getUserFromToken();
    const navigate = useNavigate();
    const [profil, setProfil] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [lokasi, setLokasi] = useState([]);
    const [absenData, setAbsenData] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [formData, setFormData] = useState({
        id_user: null,
        tipe_absensi: null,
        id_shift: null,
        id_lokasi: null,
        waktu_absen: "",
        jam_selesai: "",
        remark: "",
        remark_by: user.id_user,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [u, s, l] = await Promise.all([
                    fetchWithJwt(`${apiUrl}/profil`).then((res) => res.json()),
                    fetchWithJwt(`${apiUrl}/shift`).then((res) => res.json()),
                    fetchWithJwt(`${apiUrl}/lokasi`).then((res) => res.json()),
                ]);
                setProfil(u.data || []);
                setShifts(s.data || []);
                setLokasi(l.data || []);
            } catch (err) {
                toast.error("Gagal memuat data pilihan");
            }
        };
        fetchData();
    }, [apiUrl]);

    // Ambil data absensi by user & tanggal
    const fetchAbsenByUser = async (userId, date) => {
        if (!userId || !date) return;
        try {
            const res = await fetchWithJwt(`${apiUrl}/absen/cek/${userId}?tanggal=${date}`);
            const data = await res.json();
            setAbsenData(data.data || null);

            if (data.data) {
                setFormData((prev) => ({
                    ...prev,
                    tipe_absensi: data.data.tipe_absensi,
                    id_shift: data.data.id_shift,
                    id_lokasi: data.data.id_lokasi,
                    waktu_absen: data.data.waktu_absen,
                    remark: data.data.remark,
                }));
            }
        } catch (err) {
            toast.error("Gagal mengambil data absensi");
        }
    };

    const handleBack = async () => {
        const confirm = await Swal.fire({
            title: "Batalkan absensi manual?",
            text: "Data yang belum disimpan akan hilang.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, batalkan",
            cancelButtonText: "Kembali",
            iconColor: "#F87171",
        });
        if (confirm.isConfirmed) navigate("/");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi
        if (!formData.tipe_absensi) return toast.error("Tipe karyawan wajib dipilih");
        if (!formData.id_user) return toast.error("Nama karyawan wajib dipilih");
        if (!formData.id_shift) return toast.error("Shift wajib dipilih");
        if (formData.tipe_absensi === 1 && !formData.id_lokasi) return toast.error("Lokasi wajib dipilih untuk karyawan lapangan");
        if (!formData.waktu_absen) return toast.error("Waktu absen wajib diisi");
        if (!formData.remark) return toast.error("Remark wajib diisi");

        try {
            const res = await fetchWithJwt(`${apiUrl}/absen/manual`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Gagal menyimpan absen manual");
            toast.success("Absen manual berhasil disimpan");
            navigate("/"); // redirect
        } catch (err) {
            toast.error(err.message || "Terjadi kesalahan saat menyimpan");
        }
    };

    return (
        <div className="flex flex-col">
            <SectionHeader title="Remark Absensi" subtitle="Catat absensi karyawan secara manual, tambahkan remark, dan ubah status jika diperlukan" onBack={handleBack}/>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-grow p-4 w-full mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-0.5 font-medium text-gray-800">Tipe Karyawan</label>
                        <p className="text-xs text-gray-500 mb-2">
                            Pilih tipe karyawan. <b>Lapangan</b> wajib isi lokasi, <b>Kantor</b> tidak perlu.
                        </p>
                        <Select
                            options={[
                                { value: 1, label: "Lapangan" },
                                { value: 2, label: "Kantor" },
                            ]}
                            value={formData.tipe_absensi ? {
                                value: formData.tipe_absensi,
                                label: formData.tipe_absensi === 1 ? "Lapangan" : "Kantor",
                            } : null}
                            onChange={(opt) => setFormData((prev) => ({ ...prev, tipe_absensi: opt.value }))}
                            placeholder="Pilih tipe karyawan"
                        />
                    </div>

                    {/* Nama Karyawan */}
                    <div>
                        <label className="block mb-0.5 font-medium text-gray-800">Nama Karyawan</label>
                        <p className="text-xs text-gray-500 mb-2">
                            Pilih karyawan untuk mencatat absensinya. Setelah dipilih, data absen per tanggal akan muncul.
                        </p>
                        <Select
                            options={profil.map((u) => ({ value: u.id, label: u.nama, role: u.role }))}
                            value={formData.id_user ? {
                                value: formData.id_user,
                                label: profil.find((u) => u.id === formData.id_user)?.nama || "",
                                role: profil.find((u) => u.id === formData.id_user)?.role || "",
                            } : null}
                            onChange={(opt) => setFormData((prev) => ({
                                ...prev,
                                id_user: opt.value
                            }))}
                            onBlur={() => fetchAbsenByUser(formData.id_user, selectedDate)}
                            placeholder="Pilih karyawan"
                            formatOptionLabel={(data) => (
                                <div className="flex justify-between items-center">
                                    <span>{data.label}</span>
                                    <span className="text-xs text-gray-500 italic">{data.role}</span>
                                </div>
                            )}
                        />
                    </div>

                    {/* Pilih Tanggal */}
                    <div>
                        <label className="block mb-0.5 font-medium text-gray-800">Tanggal</label>
                        <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); fetchAbsenByUser(formData.id_user, e.target.value); }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
                    </div>

                    {/* Shift */}
                    <div>
                        <label className="block mb-0.5 font-medium text-gray-800">Shift</label>
                        <Select
                            options={shifts.map((s) => ({ value: s.id, label: s.nama }))}
                            value={formData.id_shift ? {
                                value: formData.id_shift,
                                label: shifts.find((s) => s.id === formData.id_shift)?.nama || "",
                            } : null}
                            onChange={(opt) => setFormData((prev) => ({ ...prev, id_shift: opt.value }))}
                            placeholder="Pilih shift"
                        />
                    </div>

                    {/* Lokasi (hanya lapangan) */}
                    {formData.tipe_absensi === 1 && (
                        <div>
                            <label className="block mb-0.5 font-medium text-gray-800">Lokasi</label>
                            <Select
                                options={lokasi.map((l) => ({ value: l.id, label: l.nama }))}
                                value={formData.id_lokasi ? {
                                    value: formData.id_lokasi,
                                    label: lokasi.find((l) => l.id === formData.id_lokasi)?.nama || "",
                                } : null}
                                onChange={(opt) => setFormData((prev) => ({ ...prev, id_lokasi: opt.value }))}
                                placeholder="Pilih lokasi"
                            />
                        </div>
                    )}

                    {/* Remark */}
                    <div>
                        <label className="block mb-0.5 font-medium text-gray-800">Remark</label>
                        <input
                            type="text"
                            value={formData.remark}
                            onChange={(e) => setFormData((prev) => ({ ...prev, remark: e.target.value }))}
                            placeholder="Contoh: Absen manual karena server error"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>

                {/* Action */}
                <div className="flex justify-between space-x-4 pt-4">
                    <button type="button" onClick={handleBack} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded f lex items-center shadow">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" /> Batal
                    </button>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow">
                        <FontAwesomeIcon icon={faSave} className="mr-2" /> Simpan Absen
                    </button>
                </div>

                {/* Data Absensi yang bisa diedit */}
                {absenData && (
                    <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="font-semibold text-gray-700 mb-2">Data Absensi Tanggal {selectedDate}</h4>
                        <div className="space-y-2">
                            <p><b>Shift:</b> {shifts.find((s) => s.id === absenData.id_shift)?.nama || "-"}</p>
                            <p><b>Lokasi:</b> {lokasi.find((l) => l.id === absenData.id_lokasi)?.nama || "-"}</p>
                            <p><b>Waktu Absen:</b> {absenData.waktu_absen || "-"}</p>
                            <p><b>Remark:</b> {absenData.remark || "-"}</p>
                            <p><b>Status Remark:</b> {absenData.status_remark || "Belum diubah"}</p>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AbsenManual;
