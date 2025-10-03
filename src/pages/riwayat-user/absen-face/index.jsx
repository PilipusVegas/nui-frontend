import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faSearch, faUndo, faFolderOpen, faExclamationTriangle, faBuilding, } from "@fortawesome/free-solid-svg-icons";
import { formatOvertimeJamBulat, formatFullDate, formatDate } from "../../../utils/dateUtils"
import { EmptyState } from "../../../components";

export default function RiwayatFace() {
    const [companies, setCompanies] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [form, setForm] = useState({ perusahaanId: "", userId: "", startDate: "", endDate: "", });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [riwayat, setRiwayat] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [allProfiles, setAllProfiles] = useState([]);

    // Ambil data perusahaan
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await fetch(`${apiUrl}/face/perusahaan`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data)) {
                        setCompanies(data.data);
                    }
                }
            } catch (err) {
                toast.error("Gagal ambil perusahaan");
                console.error("Gagal ambil perusahaan:", err);
            }
        };
        fetchCompanies();
    }, [apiUrl]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${apiUrl}/surat-dinas/profil`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data)) {
                        setAllProfiles(data.data); // simpan semua
                    }
                }
            } catch (err) {
                toast.error("Gagal ambil profil karyawan");
                console.error("Gagal ambil profil:", err);
            }
        };
        fetchProfile();
    }, [apiUrl]);

    useEffect(() => {
        if (!form.perusahaanId) {
            setProfiles([]);
            setForm((prev) => ({ ...prev, userId: "" }));
        } else {
            const filtered = allProfiles.filter(
                (p) => p.id_perusahaan === Number(form.perusahaanId)
            );
            setProfiles(filtered);
        }
    }, [form.perusahaanId, allProfiles]);

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!form.perusahaanId) next.perusahaanId = "Perusahaan wajib dipilih.";
        if (!form.userId) next.userId = "Nama wajib dipilih.";
        if (!form.startDate) next.startDate = "Tanggal mulai wajib diisi.";
        if (!form.endDate) next.endDate = "Tanggal selesai wajib diisi.";

        if (form.startDate && form.endDate) {
            const s = new Date(form.startDate);
            const e = new Date(form.endDate);
            if (e < s) next.endDate = "Tanggal selesai tidak boleh sebelum mulai.";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const url = `${apiUrl}/face/attendance/riwayat?id_user=${form.userId}&startDate=${form.startDate}&endDate=${form.endDate}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setRiwayat(data);
                    toast.success("Data riwayat berhasil diambil");
                } else {
                    toast.error(data.message || "Gagal ambil riwayat");
                }
            } else {
                const errMsg = await res.text();
                toast.error("Gagal ambil riwayat: " + errMsg);
            }
        } catch (err) {
            toast.error("Terjadi kesalahan koneksi ❌");
            console.error("Error fetch riwayat:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setForm({ perusahaanId: "", userId: "", startDate: "", endDate: "" });
        setErrors({});
        setRiwayat(null);
        setProfiles([]);
    };

    // react-select opsi
    const companyOptions = companies.map((c) => ({
        value: c.id,
        label: c.perusahaan,
    }));
    const profileOptions = profiles.map((p) => ({
        value: p.id,
        label: `${p.nama} (${p.role})`,
    }));

    // UI style helper
    const inputBase = "w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition shadow-sm";
    const labelBase = "text-sm font-medium text-gray-700";
    const errorText = "mt-1 text-xs text-red-600";
    const fieldWrap = "space-y-1.5";

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-5xl bg-white border border-gray-100 rounded-2xl shadow-md py-4 sm:py-6 px-4 md:p-10 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200">
                    <div className="space-y-1 flex-1">
                        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartPie} className="text-emerald-600" />
                            <span>Cek Riwayat Absensi</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-700 font-medium">
                            Pilih perusahaan dan nama karyawan lalu masukkan periode tanggal untuk melihat riwayat absensi face recognition anda.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-3">
                    {/* Perusahaan & Nama */}
                    <div className="space-y-4 divide-gray-200">
                        <div className={fieldWrap}>
                            <label htmlFor="perusahaanId" className={labelBase}>Perusahaan</label>
                            <Select id="perusahaanId" options={companyOptions} value={companyOptions.find((opt) => opt.value === form.perusahaanId) || null} onChange={(opt) => setField("perusahaanId", opt?.value || "")} placeholder={<div className="flex items-center gap-2"><FontAwesomeIcon icon={faBuilding} className="text-gray-400" />Pilih perusahaan...</div>} isSearchable className="text-sm" />
                            {errors.perusahaanId && <p className={errorText}>{errors.perusahaanId}</p>}
                        </div>

                        <div className={fieldWrap}>
                            <label htmlFor="userId" className={labelBase}>Nama</label>
                            <Select id="userId" options={profileOptions} value={profileOptions.find((opt) => opt.value === form.userId) || null} onChange={(opt) => setField("userId", opt?.value || "")} placeholder={<div className="flex items-center gap-2"><FontAwesomeIcon icon={faSearch} className="text-gray-400" />Pilih nama karyawan...</div>} isSearchable isDisabled={!form.perusahaanId} className="text-sm" />
                            {errors.userId && <p className={errorText}>{errors.userId}</p>}
                        </div>
                    </div>

                    {/* Tanggal */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                        <div className={fieldWrap}>
                            <label htmlFor="startDate" className={labelBase}>Tanggal Mulai</label>
                            <input id="startDate" type="date" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} className={inputBase} />
                            {errors.startDate && <p className={errorText}>{errors.startDate}</p>}
                        </div>

                        <div className={fieldWrap}>
                            <label htmlFor="endDate" className={labelBase}>Tanggal Selesai</label>
                            <input id="endDate" type="date" value={form.endDate} onChange={(e) => setField("endDate", e.target.value)} className={inputBase} />
                            {errors.endDate && <p className={errorText}>{errors.endDate}</p>}
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />
                        Pastikan tanggal selesai tidak lebih awal dari tanggal mulai.
                    </p>

                    <div className="flex flex-row flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200 w-full">
                        <button type="button" onClick={handleReset} className="px-4 py-2 rounded-lg border border-red-200 bg-red-500 text-white font-semibold shadow-sm  hover:bg-red-600 active:scale-[0.98] transition-all flex-1 sm:flex-none flex items-center justify-center gap-2">
                            <FontAwesomeIcon icon={faUndo} /> Reset
                        </button>

                        <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-emerald-600 font-semibold text-white shadow-sm  hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed  flex-1 sm:flex-none flex items-center justify-center gap-2">
                            {submitting ? (
                                <>
                                    <FontAwesomeIcon icon={faFolderOpen} spin /> Mengambil…
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faFolderOpen} /> Lihat Riwayat
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {riwayat && (
                    riwayat.data?.length > 0 ? (
                        <div className="space-y-6 pt-6 border-t border-gray-200">
                            <div className="space-y-6 pt-6 border-t border-gray-200">
                                {/* Ringkasan Riwayat */}
                                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 space-y-4">
                                    <h2 className="text-lg font-bold text-emerald-600 border-b border-gray-200 pb-2">Ringkasan Riwayat</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-xs text-gray-500">Nama</span>
                                            <span className="text-sm font-semibold text-gray-800">{riwayat.data[0].nama}</span>
                                        </div>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-xs text-gray-500">Perusahaan</span>
                                            <span className="text-sm font-semibold text-gray-800">{riwayat.data[0].perusahaan}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-between items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Tanggal Mulai</span>
                                            <span className="text-sm font-semibold text-gray-800">{form.startDate}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Tanggal Selesai</span>
                                            <span className="text-sm font-semibold text-gray-800">{form.endDate}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-between items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Total Terlambat</span>
                                            <span className="text-sm font-semibold text-red-600">{riwayat.data[0].total_late ?? 0} mnt</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Total Lembur</span>
                                            <span className="text-sm font-semibold text-emerald-600">{formatOvertimeJamBulat(riwayat.data[0].total_overtime ?? 0)} Jam</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">Total Absen</span>
                                            <span className="text-sm font-semibold text-gray-800">{riwayat.data[0].total_days ?? 0} hari</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop table */}
                                <div className="overflow-x-auto hidden sm:block">
                                    <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm text-sm border border-gray-200">
                                        <thead>
                                            <tr className="bg-emerald-600 text-white text-left">
                                                <th className="px-4 py-2 border-r border-gray-100">Tanggal</th>
                                                <th className="px-4 py-2 border-r border-gray-100">Jam Masuk</th>
                                                <th className="px-4 py-2 border-r border-gray-100">Jam Pulang</th>
                                                <th className="px-4 py-2 border-r border-gray-100">Terlambat (mnt)</th>
                                                <th className="px-4 py-2">Lembur (mnt)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {riwayat.date_range.map((tgl) => {
                                                const abs = riwayat.data[0].attendance[tgl];
                                                return (
                                                    <tr key={tgl} className="odd:bg-white even:bg-gray-50 border-b border-gray-100">
                                                        <td className="px-4 py-2 font-medium text-gray-700">{formatDate(tgl)}</td>
                                                        <td className="px-4 py-2">{abs?.in || "-"}</td>
                                                        <td className="px-4 py-2">{abs?.out || "-"}</td>
                                                        <td className={`px-4 py-2 ${abs?.late > 0 ? "text-red-700 font-bold rounded" : "text-gray-700"}`}>
                                                            {abs?.late ?? "-"}
                                                        </td>
                                                        <td className="px-4 py-2">{abs?.overtime ?? "-"}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards compact */}
                                <div className="sm:hidden max-h-[80vh] overflow-y-auto space-y-2">
                                    {riwayat.date_range.map((tgl) => {
                                        const abs = riwayat.data[0].attendance[tgl];
                                        return (
                                            <div key={tgl} className="rounded-lg border border-gray-100 shadow-sm overflow-hidden bg-white text-xs">

                                                {/* Header Tanggal */}
                                                <div className="bg-emerald-600 text-white text-center font-semibold py-1">
                                                    {formatFullDate(tgl)}
                                                </div>

                                                {/* Konten sejajar 4 data */}
                                                <div className="grid grid-cols-4 divide-x divide-gray-200">
                                                    <div className="flex flex-col items-center py-2">
                                                        <span className="text-gray-500">Masuk</span>
                                                        <span className="font-semibold text-gray-800">{abs?.in || "--:--"}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center py-2">
                                                        <span className="text-gray-500">Pulang</span>
                                                        <span className="font-semibold text-gray-800">{abs?.out || "--:--"}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center py-2">
                                                        <span className="text-gray-500">Terlambat</span>
                                                        <span className={abs?.late > 0 ? "text-red-600 font-bold" : "text-gray-800 font-semibold"}>
                                                            {abs?.late > 0 ? `${abs.late} mnt` : "-"}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col items-center py-2">
                                                        <span className="text-gray-500">Lembur</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {abs?.overtime > 0 ? `${abs.overtime} mnt` : "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 border-t border-gray-200">
                            <EmptyState title="Tidak Ada Data Absensi" description="Tidak ditemukan catatan absensi untuk periode yang dipilih. Karyawan kemungkinan tidak melakukan absensi Face Recognition pada rentang tanggal tersebut."/>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}