import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Select from "react-select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { SectionHeader } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faTimes, faInfoCircle, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

const EditPenjadwalan = () => {
    const { id_user } = useParams();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [shiftList, setShiftList] = useState([]);
    const [lokasiList, setLokasiList] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [form, setForm] = useState({
        id_shift: "",
        lokasi: [],
        start_date: "",
        end_date: "",
        id_user: null
    });
    const [searchParams] = useSearchParams();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const [isActive, setIsActive] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [isPermanent, setIsPermanent] = useState(false);
    const mode = searchParams.get("mode");
    const [isLockedPermanent, setIsLockedPermanent] = useState(false);
    const [isStartDateLocked, setIsStartDateLocked] = useState(false);
    const isModeRange = mode === "range";
    const isModePermanent = mode === "permanent";
    const [originalRange, setOriginalRange] = useState({ start: null, end: null });

    const fetchData = async () => {
        try {
            setLoading(true);
            const url =
                mode === "permanent"
                    ? `${apiUrl}/jadwal/${id_user}?mode=permanent`
                    : `${apiUrl}/jadwal/${id_user}?mode=range&startDate=${startDate}&endDate=${endDate}`;
            const [jadwalRes, shiftRes, lokasiRes] = await Promise.all([
                fetchWithJwt(url),
                fetchWithJwt(`${apiUrl}/shift`),
                fetchWithJwt(`${apiUrl}/lokasi`)
            ]);
            const json = await jadwalRes.json();
            const jadwal = Array.isArray(json.data) ? json.data[0] : json.data;
            setOriginalRange({
                start: jadwal.tgl_mulai,
                end: jadwal.tgl_selesai
            });
            setIsPermanent(jadwal.is_permanent === 1);
            setIsLockedPermanent(jadwal.is_permanent === 1);
            setIsActive(jadwal.is_active);
            setUserInfo({
                nama: jadwal.nama_user,
                role: jadwal.role_user
            });
            setForm({
                id_shift: jadwal.id_shift,
                lokasi: jadwal.lokasi.map(l => l.id),
                start_date: jadwal.tgl_mulai || "",
                end_date: jadwal.tgl_selesai || "",
                id_user: jadwal.id_user
            });
            const shifts = (await shiftRes.json()).data || [];
            setShiftList(shifts);
            setSelectedShift(shifts.find(s => s.id === jadwal.id_shift));
            setLokasiList((await lokasiRes.json()).data || []);
        } catch (err) {
            toast.error("Gagal memuat data penjadwalan");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const handleTambahLokasi = (opt) => {
        if (!opt) return;

        setForm(prev => ({
            ...prev,
            lokasi: [...prev.lokasi, opt.value]
        }));
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
        if (
            !isPermanent &&
            form.start_date &&
            form.end_date &&
            form.end_date < form.start_date
        ) {
            toast.error("Tanggal selesai tidak boleh lebih awal dari tanggal mulai");
            return;
        }
        const confirm = await Swal.fire({
            title: "Simpan Perubahan?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal",
            confirmButtonColor: "#16a34a"
        });
        if (!confirm.isConfirmed) return;
        try {
            const url = isPermanent
                ? `${apiUrl}/jadwal/${id_user}?mode=permanent`
                : `${apiUrl}/jadwal/${id_user}?mode=range&startDate=${originalRange.start}&endDate=${originalRange.end}`;
            const payload = {
                id_shift: Number(form.id_shift),
                location: form.lokasi,
                is_permanent: isPermanent ? 1 : 0
            };
            if (!isPermanent) {
                payload.start_date = form.start_date;
                payload.end_date = form.end_date;
            }
            const res = await fetchWithJwt(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Gagal menyimpan perubahan");
            toast.success("Perubahan berhasil disimpan");
            navigate(-1);
        } catch (err) {
            toast.error(err.message || "Terjadi kesalahan");
        }
    };


    const selectStyle = {
        control: (base) => ({
            ...base,
            borderRadius: "0.5rem",
            minHeight: "42px"
        }),
        menu: (base) => ({
            ...base,
            marginBottom: "6px"
        }),
        menuPortal: base => ({
            ...base,
            zIndex: 9999
        })
    };


    // helper tanggal
    const normalizeDate = (date) =>
        new Date(date).setHours(0, 0, 0, 0);

    const isRangeOngoing = (start, end) => {
        if (!start || !end) return false;
        const today = normalizeDate(new Date());
        const startDate = normalizeDate(start);
        const endDate = normalizeDate(end);
        return today >= startDate && today <= endDate;
    };

    const isStartDatePassed = (start) => {
        if (!start) return false;
        const today = normalizeDate(new Date());
        const startDate = normalizeDate(start);
        return startDate < today;
    };

    // 🔥 TARUH DI SINI
    const isStartDateDisabled =
        isModeRange &&
        (
            isRangeOngoing(form.start_date, form.end_date) ||
            isStartDatePassed(form.start_date)
        );

    if (loading) {
        return <div className="p-6 text-sm text-gray-500">Memuat data...</div>;
    }

    return (
        <div>
            <SectionHeader title="Edit Penjadwalan" subtitle="Perbarui shift dan lokasi absensi karyawan" onBack={() => navigate(-1)} />
            <div className="w-full mt-6 bg-white rounded-xl shadow-sm border p-6 space-y-6">
                {/* INFO KARYAWAN */}
                {userInfo && (
                    <div className="flex items-center gap-5 border rounded-xl p-5 bg-white">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                            <FontAwesomeIcon icon={faUser} className="text-lg" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-medium text-gray-500">
                                Karyawan
                            </div>
                            <div className="text-base font-semibold text-gray-800 leading-tight">
                                {userInfo.nama}
                            </div>
                            <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-0.5 rounded-md">
                                <FontAwesomeIcon icon={faUserGroup} className="text-xs" />
                                <span>{userInfo.role}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shift Kerja
                    </label>
                    <Select value={shiftList
                        .map(s => ({ value: s.id, label: s.nama }))
                        .find(s => s.value === form.id_shift)}
                        options={shiftList.map(s => ({
                            value: s.id,
                            label: s.nama
                        }))}
                        onChange={o => {
                            const shift = shiftList.find(s => s.id === o?.value);
                            setForm(prev => ({
                                ...prev,
                                id_shift: o?.value || ""
                            }));
                            setSelectedShift(shift || null);
                        }}
                        styles={selectStyle}
                        menuPortalTarget={document.body}
                    />
                    {selectedShift && (
                        <div className="mt-4 border rounded-xl p-4 bg-gray-50">
                            <div className="text-sm font-semibold text-gray-800 mb-3">
                                Detail Jadwal Shift
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {selectedShift.detail.map((d, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border rounded-lg px-3 py-2">
                                        <span className="font-medium text-gray-700">
                                            {d.hari}
                                        </span>
                                        <span className="text-gray-600">
                                            {d.jam_masuk} – {d.jam_pulang}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {isModePermanent && (
                    <div className="border rounded-xl p-5 bg-white space-y-2">
                        <div className="text-base font-semibold text-gray-800">
                            Jenis Jadwal
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                                <FontAwesomeIcon icon={faInfoCircle} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Jadwal Permanent
                                </p>
                                <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">
                                    Jadwal ini bersifat permanen dan berlaku tanpa tanggal mulai maupun tanggal selesai.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!isPermanent && !isLockedPermanent && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Mulai
                            </label>
                            <input type="date" value={form.start_date} disabled={isStartDateDisabled} onChange={e =>
                                setForm(prev => ({
                                    ...prev,
                                    start_date: e.target.value
                                }))
                            }
                                className={`w-full border rounded-lg px-3 py-2 text-sm ${isStartDateDisabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                            />
                            {isStartDateDisabled && (
                                <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faLock} />
                                    Tanggal mulai tidak dapat diubah karena sudah berjalan atau telah terlewat
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Selesai
                            </label>
                            <input type="date" value={form.end_date} onChange={e => setForm(prev => ({ ...prev, end_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm" />
                        </div>
                    </div>
                )}

                {/* LOKASI */}
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">
                            Lokasi Absensi
                        </label>
                        <span className="text-xs text-gray-500">
                            {form.lokasi.length} lokasi dipilih
                        </span>
                    </div>

                    <Select placeholder="Tambah lokasi..." value={null} options={lokasiList.filter(l => !form.lokasi.includes(l.id)).map(l => ({ value: l.id, label: l.nama }))}
                        onChange={handleTambahLokasi}
                        styles={selectStyle}
                        menuPortalTarget={document.body}
                        menuPlacement="top"
                        menuPosition="fixed"
                    />


                    {/* TAG LOKASI */}
                    {form.lokasi.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {lokasiList
                                .filter(l => form.lokasi.includes(l.id))
                                .map(l => (
                                    <div key={l.id} className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                                        <span className="select-none">
                                            {l.nama}
                                        </span>
                                        <button type="button" onClick={() => handleHapusLokasi(l.id)} className="flex items-center justify-center w-4 h-4 rounded-full text-green-700 hover:text-red-600 hover:bg-red-100 transition" title="Hapus lokasi">
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300">
                        Batal
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2 text-sm font-semibold bg-green-500 text-white rounded hover:bg-green-600">
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPenjadwalan;