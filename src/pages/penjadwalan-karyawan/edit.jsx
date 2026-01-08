import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { SectionHeader } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";

const MAX_LOKASI = 7;

const EditPenjadwalan = () => {
    const { id } = useParams();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [shiftList, setShiftList] = useState([]);
    const [lokasiList, setLokasiList] = useState([]);

    const [userInfo, setUserInfo] = useState(null); // ⬅️ info karyawan
    const [form, setForm] = useState({
        id_shift: "",
        lokasi: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [jadwalRes, shiftRes, lokasiRes] = await Promise.all([
                fetchWithJwt(`${apiUrl}/jadwal/${id}`),
                fetchWithJwt(`${apiUrl}/shift`),
                fetchWithJwt(`${apiUrl}/lokasi`)
            ]);

            const jadwal = (await jadwalRes.json()).data;

            // ✅ FIX USER INFO
            setUserInfo({
                nama: jadwal.nama_user,
                role: jadwal.nama_shift
            });

            // ✅ FIX LOKASI (PAKAI id_lokasi)
            setForm({
                id_shift: jadwal.id_shift,
                lokasi: jadwal.lokasi.map(l => l.id_lokasi)
            });

            setShiftList((await shiftRes.json()).data || []);
            setLokasiList((await lokasiRes.json()).data || []);
        } catch (err) {
            toast.error("Gagal memuat data penjadwalan");
        } finally {
            setLoading(false);
        }
    };


    const handleTambahLokasi = (opt) => {
        if (!opt) return;

        setForm(prev => {
            if (prev.lokasi.length >= MAX_LOKASI) {
                toast.error(`Maksimal ${MAX_LOKASI} lokasi absensi`);
                return prev;
            }

            return {
                ...prev,
                lokasi: [...prev.lokasi, opt.value]
            };
        });
    };

    const handleHapusLokasi = (idLokasi) => {
        setForm(prev => ({
            ...prev,
            lokasi: prev.lokasi.filter(id => id !== idLokasi)
        }));
    };

    const handleSubmit = async () => {
        if (!form.id_shift || !form.lokasi.length) {
            toast.error("Shift dan lokasi wajib diisi");
            return;
        }

        const confirm = await Swal.fire({
            title: "Simpan Perubahan?",
            text: "Perubahan akan langsung diterapkan",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal",
            confirmButtonColor: "#16a34a"
        });

        if (!confirm.isConfirmed) return;

        await fetchWithJwt(`${apiUrl}/jadwal/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_shift: Number(form.id_shift),
                id_lokasi: form.lokasi
            })
        });

        toast.success("Perubahan berhasil disimpan");
        navigate(-1);
    };

    const selectStyle = {
        control: (base) => ({
            ...base,
            borderRadius: "0.5rem",
            minHeight: "42px"
        }),
        menuPortal: base => ({ ...base, zIndex: 9999 })
    };

    if (loading) {
        return <div className="p-6 text-sm text-gray-500">Memuat data...</div>;
    }

    return (
        <div>
            <SectionHeader title="Edit Penjadwalan" subtitle="Perbarui shift dan lokasi absensi karyawan" onBack={() => navigate(-1)}/>

            <div className="w-full mt-6 bg-white rounded-xl shadow-sm border p-6 space-y-6">

                {/* INFO KARYAWAN */}
                {userInfo && (
                    <div className="bg-gray-50 border rounded-lg p-4">
                        <div className="text-xs text-gray-500">Karyawan</div>
                        <div className="font-semibold text-gray-800">
                            {userInfo.nama}
                        </div>
                        <div className="text-xs text-gray-500">
                            {userInfo.role}
                        </div>
                    </div>
                )}

                {/* SHIFT */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shift Kerja
                    </label>
                    <Select
                        value={shiftList
                            .map(s => ({ value: s.id, label: s.nama }))
                            .find(s => s.value === form.id_shift)}
                        options={shiftList.map(s => ({
                            value: s.id,
                            label: s.nama
                        }))}
                        onChange={o =>
                            setForm(prev => ({ ...prev, id_shift: o?.value || "" }))
                        }
                        styles={selectStyle}
                        menuPortalTarget={document.body}
                    />
                </div>

                {/* LOKASI */}
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">
                            Lokasi Absensi
                        </label>
                        <span className="text-xs text-gray-500">
                            {form.lokasi.length}/{MAX_LOKASI}
                        </span>
                    </div>

                    <Select
                        placeholder={
                            form.lokasi.length >= MAX_LOKASI
                                ? "Maksimal lokasi tercapai"
                                : "Tambah lokasi..."
                        }
                        isDisabled={form.lokasi.length >= MAX_LOKASI}
                        value={null}
                        options={lokasiList
                            .filter(l => !form.lokasi.includes(l.id))
                            .map(l => ({ value: l.id, label: l.nama }))}
                        onChange={handleTambahLokasi}
                        styles={selectStyle}
                        menuPortalTarget={document.body}
                    />

                    {/* TAG LOKASI */}
                    {form.lokasi.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {lokasiList
                                .filter(l => form.lokasi.includes(l.id))
                                .map(l => (
                                    <span
                                        key={l.id}
                                        onClick={() => handleHapusLokasi(l.id)}
                                        className="cursor-pointer text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-red-100 hover:text-red-600 transition"
                                        title="Klik untuk menghapus"
                                    >
                                        {l.nama} ✕
                                    </span>
                                ))}
                        </div>
                    )}
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 text-sm font-semibold bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPenjadwalan;
