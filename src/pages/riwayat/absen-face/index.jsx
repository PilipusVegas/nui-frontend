import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faSearch, faUndo, faFolderOpen, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

export default function RiwayatFace() {
    const [profiles, setProfiles] = useState([]);
    const [form, setForm] = useState({ userId: "", startDate: "", endDate: "" });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [riwayat, setRiwayat] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    // ambil data profil
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${apiUrl}/surat-dinas/profil`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data)) {
                        setProfiles(data.data);
                    }
                }
            } catch (err) {
                toast.error("Gagal ambil profil");
                console.error("Gagal ambil profil:", err);
            }
        };
        fetchProfile();
    }, [apiUrl]);

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = () => {
        const next = {};
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
            const res = await fetch (url);
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
        setForm({ userId: "", startDate: "", endDate: "" });
        setErrors({});
        setRiwayat(null);
    };

    // react-select opsi
    const options = profiles.map((p) => ({
        value: p.id,
        label: `${p.nama} (${p.role})`,
    }));

    // UI style helper
    const inputBase = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition shadow-sm";
    const labelBase = "text-sm font-medium text-gray-700";
    const errorText = "mt-1 text-xs text-red-600";
    const fieldWrap = "space-y-1.5";

    return (
        <div className="w-full min-h-screen bg-gray-50 p-2 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-5xl bg-white border border-gray-100 rounded-2xl shadow-md p-6  md:p-10 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1 flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartPie} className="text-emerald-600" />
                            <span>Cek Riwayat Absensi</span>
                        </h1>
                        <p className="text-sm text-gray-500">
                            Masukkan periode tanggal untuk melihat riwayat absensi Anda.
                        </p>
                    </div>
                    {/* <span className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                            {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </span> */}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Nama */}
                    <div className={fieldWrap}>
                        <label htmlFor="userId" className={`${labelBase} font-medium`}>
                            Nama
                        </label>
                        <Select id="userId" options={options} value={options.find((opt) => opt.value === form.userId) || null} onChange={(opt) => setField("userId", opt?.value || "")}
                            placeholder={
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                    Ketik atau pilih nama...
                                </div>
                            }
                            isSearchable
                            className="text-sm"
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    borderRadius: "0.75rem",
                                    borderColor: state.isFocused ? "#10b981" : "#e5e7eb",
                                    boxShadow: state.isFocused ? "0 0 0 2px rgba(16,185,129,0.2)" : "none",
                                    padding: "4px",
                                    transition: "all 0.2s ease",
                                    "&:hover": { borderColor: "#10b981" },
                                }),
                            }}
                        />
                        {errors.userId && <p className={errorText}>{errors.userId}</p>}
                    </div>

                    {/* Tanggal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={fieldWrap}>
                            <label htmlFor="startDate" className={`${labelBase} font-medium`}>
                                Tanggal Mulai
                            </label>
                            <input id="startDate" type="date" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} className={`${inputBase} transition-all focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500`} />
                            {errors.startDate && <p className={errorText}>{errors.startDate}</p>}
                        </div>

                        <div className={fieldWrap}>
                            <label htmlFor="endDate" className={`${labelBase} font-medium`}>
                                Tanggal Selesai
                            </label>
                            <input id="endDate" type="date" value={form.endDate} onChange={(e) => setField("endDate", e.target.value)} className={`${inputBase} transition-all focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500`} />
                            {errors.endDate && <p className={errorText}>{errors.endDate}</p>}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                        {/* Teks info */}
                        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />
                            Pastikan tanggal selesai tidak lebih awal dari tanggal mulai.
                        </p>

                        {/* Tombol */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <button type="button" onClick={handleReset} className="px-4 py-2 rounded-lg border border-red-200 bg-red-500 text-white font-semibold shadow-sm hover:bg-red-600 active:scale-[0.98] transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                                <FontAwesomeIcon icon={faUndo} /> Reset
                            </button>

                            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center gap-2">
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
                    </div>
                </form>

                {/* Tabel hasil */}
                {riwayat && riwayat.data?.length > 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">Rekap Kehadiran</span>
                                <span className="text-lg font-semibold text-gray-800">{riwayat.data[0].nama}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">Perusahaan</span>
                                <span className="text-lg font-semibold text-gray-800">{riwayat.data[0].perusahaan}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">Tanggal Mulai</span>
                                <span className="text-lg font-semibold text-gray-800">{form.startDate}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">Tanggal Selesai</span>
                                <span className="text-lg font-semibold text-gray-800">{form.endDate}</span>
                            </div>
                        </div>

                        {/* Desktop: Table */}
                        <div className="overflow-x-auto hidden sm:block">
                            <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm text-sm">
                                <thead>
                                    <tr className="bg-emerald-600 text-white text-left">
                                        <th className="px-4 py-2">Tanggal</th>
                                        <th className="px-4 py-2">Jam Masuk</th>
                                        <th className="px-4 py-2">Jam Pulang</th>
                                        <th className="px-4 py-2">Terlambat (mnt)</th>
                                        <th className="px-4 py-2">Lembur (mnt)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riwayat.date_range.map((tgl) => {
                                        const abs = riwayat.data[0].attendance[tgl];
                                        return (
                                            <tr key={tgl} className="odd:bg-white even:bg-gray-50 border-b border-gray-100">
                                                <td className="px-4 py-2 font-medium text-gray-700">{tgl}</td>
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

                        {/* Mobile: Compact Cards */}
                        <div className="sm:hidden space-y-2">
                            {riwayat.date_range.map((tgl) => {
                                const abs = riwayat.data[0].attendance[tgl];
                                return (
                                    <div key={tgl} className="border rounded-lg p-3 shadow-sm bg-white text-sm">
                                        {/* Header tanggal */}
                                        <p className="font-semibold text-gray-800 mb-2">{tgl}</p>
                                        {/* Data compact dalam grid */}
                                        <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                                            <div>
                                                <span className="text-gray-600 font-medium">Masuk:</span>{" "}
                                                {abs?.in || "-"}
                                            </div>
                                            <div>
                                                <span className="text-gray-600 font-medium">Pulang:</span>{" "}
                                                {abs?.out || "-"}
                                            </div>
                                            <div className={`${abs?.late > 0 ? "bg-red-600 text-white font-bold rounded px-2 py-0.5" : "text-gray-700"}`}>
                                                Terlambat: {abs?.late ?? "-"}
                                            </div>
                                            <div>
                                                <span className="text-gray-600 font-medium">Lembur:</span>{" "}
                                                {abs?.overtime ?? "-"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
