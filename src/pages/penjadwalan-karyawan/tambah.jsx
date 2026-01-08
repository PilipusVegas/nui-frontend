import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import toast from "react-hot-toast";
import { SectionHeader } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
const MAX_LOKASI = 7;
const selectStyle = {
    control: (base) => ({
        ...base,
        borderRadius: "0.5rem",
        minHeight: "42px"
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 })
};

const TambahPenjadwalan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [profilList, setProfilList] = useState([]);
    const [shiftList, setShiftList] = useState([]);
    const [scheduledUserIds, setScheduledUserIds] = useState([]);
    const [lokasiList, setLokasiList] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ id_user: "", id_shift: "", lokasi: [] });

    useEffect(() => {
        fetchMaster();
        fetchScheduledUsers();
    }, [apiUrl]);

    const fetchMaster = async () => {
        try {
            const [p, s, l] = await Promise.all([
                fetchWithJwt(`${apiUrl}/profil`),
                fetchWithJwt(`${apiUrl}/shift`),
                fetchWithJwt(`${apiUrl}/lokasi`)
            ]);

            setProfilList((await p.json()).data || []);
            setShiftList((await s.json()).data || []);
            setLokasiList((await l.json()).data || []);
        } catch {
            toast.error("Gagal memuat data master");
        }
    };

    const fetchScheduledUsers = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/jadwal`);
            if (!res.ok) throw new Error();
            const json = await res.json();
            const ids = (json.data || [])
                .map(item => item.id_user)
                .filter(Boolean);
            setScheduledUserIds(ids);
        } catch {
            toast.error("Gagal memuat data penjadwalan");
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
        if (submitting) return;
        if (!form.id_user || !form.id_shift || !form.lokasi.length) {
            toast.error("Karyawan, shift, dan lokasi wajib diisi");
            return;
        }
        try {
            setSubmitting(true);
            await fetchWithJwt(`${apiUrl}/jadwal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_user: Number(form.id_user),
                    id_shift: Number(form.id_shift),
                    location: form.lokasi
                })
            });
            toast.success("Penjadwalan berhasil ditambahkan");
            navigate(-1);
        } catch (err) {
            toast.error("Gagal menambahkan penjadwalan");
        } finally {
            setSubmitting(false);
        }
    };


    const userOptions = profilList
        .filter(p => !scheduledUserIds.includes(p.id))
        .map(p => ({
            value: p.id,
            label: `${p.nama} — ${p.role}`
        }));


    return (
        <div>
            <SectionHeader title="Tambah Penjadwalan" subtitle="Atur shift dan lokasi absensi karyawan" onBack={() => navigate(-1)} />
            <div className="mx-auto mt-6 bg-white rounded-xl shadow-sm border w-full px-4 sm:px-6 py-6 space-y-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Karyawan
                    </label>
                    <Select placeholder={userOptions.length === 0 ? "Semua karyawan sudah terjadwal" : "Pilih karyawan..."} options={userOptions} isDisabled={userOptions.length === 0} onChange={o => setForm(prev => ({ ...prev, id_user: o?.value || "" }))} styles={selectStyle} menuPortalTarget={document.body}/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shift Kerja
                    </label>
                    <Select
                        placeholder="Pilih shift..."
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
                        placeholder={form.lokasi.length >= MAX_LOKASI ? "Maksimal lokasi tercapai" : "Tambah lokasi..."}
                        isDisabled={form.lokasi.length >= MAX_LOKASI}
                        value={null}
                        options={lokasiList
                            .filter(l => !form.lokasi.includes(l.id))
                            .map(l => ({ value: l.id, label: l.nama }))}
                        onChange={handleTambahLokasi}
                        styles={selectStyle}
                        menuPortalTarget={document.body}
                    />

                    {form.lokasi.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {lokasiList
                                .filter(l => form.lokasi.includes(l.id))
                                .map(l => (
                                    <span key={l.id} onClick={() => handleHapusLokasi(l.id)} title="Klik untuk menghapus" className="cursor-pointer text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-red-100 hover:text-red-600 transition">
                                        {l.nama} 
                                        <FontAwesomeIcon icon={faTimes} className="ml-1" />
                                    </span>
                                ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300" disabled={submitting}>
                        Batal
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} className={`px-5 py-2 text-sm font-semibold rounded text-white ${submitting ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}>
                        {submitting ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TambahPenjadwalan;
