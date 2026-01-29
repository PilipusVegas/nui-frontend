import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatForDB, formatForInput } from "../../utils/dateUtils";

const RemarkForm = ({ apiUrl, navigate, selectedDate, selectedUser, absenData, shifts, lokasi, onSuccess, }) => {

    const defaultFormData = {
        id_user: selectedUser?.id,
        id_absen: absenData?.id_absen || null,
        tipe_absensi: absenData?.tipe_absensi ?? (selectedUser?.face_registered ? 2 : 1),
        id_shift: absenData?.id_shift || selectedUser?.id_shift || null,
        id_lokasi_mulai: absenData?.id_lokasi_mulai || null,
        id_lokasi_selesai: absenData?.id_lokasi_selesai || null,
        jam_mulai: absenData?.jam_mulai ? formatForInput(absenData.jam_mulai, absenData.tipe_absensi) : "",
        jam_selesai: absenData?.jam_selesai ? formatForInput(absenData.jam_selesai, absenData.tipe_absensi) : "",
        remark: absenData?.remark || "",
        remark_status: absenData?.remark_status || null,
    };

    const [formData, setFormData] = useState(defaultFormData);
    const isCuti = formData.remark_status === 4;
    const isIzinSakit = formData.remark_status === 5;
    const needTanggalOnly = isCuti || isIzinSakit;

    /* CLEANUP CUTI / SAKIT */
    useEffect(() => {
        if (needTanggalOnly) {
            setFormData(f => ({
                ...f,
                jam_mulai: "",
                jam_selesai: "",
                id_lokasi_mulai: null,
                id_lokasi_selesai: null,
            }));
        }
    }, [needTanggalOnly]);


    useEffect(() => {
        const tipe = absenData?.tipe_absensi ?? (selectedUser?.face_registered ? 2 : 1);

        setFormData({
            id_user: selectedUser?.id,
            id_absen: absenData?.id_absen || null,
            tipe_absensi: tipe,
            id_shift: absenData?.id_shift || selectedUser?.id_shift || null,
            id_lokasi_mulai: absenData?.id_lokasi_mulai || null,
            id_lokasi_selesai: absenData?.id_lokasi_selesai || null,
            jam_mulai: absenData?.jam_mulai ? formatForInput(absenData.jam_mulai, tipe) : "",
            jam_selesai: absenData?.jam_selesai ? formatForInput(absenData.jam_selesai, tipe) : "",
            remark: absenData?.remark || "",
            remark_status: absenData?.remark_status || null,
        });
    }, [absenData, selectedUser, selectedDate]);



    /* SUBMIT (ASLI) */
    const handleSubmit = async e => {
        e.preventDefault();
        const f = formData;
        if (!f.id_user || !f.remark_status || !f.remark.trim()) {
            toast.error("Lengkapi data wajib");
            return;
        }
        if (!f.id_shift) {
            toast.error("Shift wajib ditentukan");
            return;
        }
        if (!needTanggalOnly && !f.jam_mulai) {
            toast.error("Jam masuk wajib diisi");
            return;
        }
        let jamMulai = null;
        let jamSelesai = null;

        if (!needTanggalOnly) {
            if (f.tipe_absensi === 1) {
                const baseDate = selectedDate;

                // jam masuk (selalu tanggal yang dipilih)
                jamMulai = formatForDB(`${baseDate}T${f.jam_mulai}`);

                if (f.jam_selesai) {
                    const isNextDay = f.jam_selesai < f.jam_mulai;

                    const tanggalPulang = isNextDay
                        ? new Date(
                            new Date(baseDate).setDate(
                                new Date(baseDate).getDate() + 1
                            )
                        )
                            .toISOString()
                            .split("T")[0]
                        : baseDate;

                    jamSelesai = formatForDB(`${tanggalPulang}T${f.jam_selesai}`);
                } else {
                    jamSelesai = null;
                }
            }
            else {
                jamMulai = formatForDB(`${selectedDate}T${f.jam_mulai}`);
                jamSelesai = f.jam_selesai
                    ? formatForDB(`${selectedDate}T${f.jam_selesai}`)
                    : null;
            }
        }

        const payload = {
            id_absen: f.id_absen,
            id_user: f.id_user,
            tipe_absensi: f.tipe_absensi,
            tanggal: selectedDate,
            id_shift: f.id_shift,
            jam_mulai: needTanggalOnly ? null : jamMulai,
            jam_selesai: needTanggalOnly ? null : jamSelesai,
            id_lokasi_mulai:
                needTanggalOnly || f.tipe_absensi !== 1
                    ? null
                    : f.id_lokasi_mulai,
            id_lokasi_selesai:
                needTanggalOnly || f.tipe_absensi !== 1
                    ? null
                    : f.id_lokasi_selesai,
            remark: f.remark,
            remark_status: f.remark_status,
        };

        try {
            await fetchWithJwt(`${apiUrl}/absen/manual`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            toast.success("Absen berhasil disimpan");
            onSuccess?.();
            navigate("/remark-absensi");
        } catch {
            toast.error("Gagal menyimpan absen");
        }
    };

    /* RENDER FORM RESULT */
    return (
        <form onSubmit={handleSubmit} className="space-y-10 border-t pt-6">

            {/* A. STATUS ABSENSI */}
            <div>
                <label className="block text-sm font-semibold text-gray-800">
                    Kategori Remark
                </label>
                <p className="text-xs text-gray-500 mb-2">
                    Menentukan kategori catatan atau izin pada tanggal ini
                </p>

                <Select
                    value={
                        formData.remark_status
                            ? {
                                value: formData.remark_status,
                                label: [
                                    "Absen Manual",
                                    "Izin Terlambat",
                                    "Izin Pulang Awal",
                                    "Cuti",
                                    "Izin Sakit",
                                    "Lupa Absen",
                                ][formData.remark_status - 1],
                            }
                            : null
                    }
                    onChange={opt =>
                        setFormData(f => ({
                            ...f,
                            remark_status: opt.value,
                        }))
                    }
                    options={[
                        { value: 1, label: "Absen Manual" },
                        { value: 2, label: "Izin Terlambat" },
                        { value: 3, label: "Izin Pulang Awal" },
                        { value: 4, label: "Cuti" },
                        { value: 5, label: "Izin Sakit" },
                        { value: 6, label: "Lupa Absen" },
                    ]}
                />
            </div>

            {/* B. METODE & SHIFT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* METODE ABSENSI */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800">
                        Metode Absensi
                    </label>
                    <p className="text-xs text-gray-500 mb-1">
                        Sistem absensi yang digunakan karyawan
                    </p>

                    <Select value={{ value: formData.tipe_absensi, label: formData.tipe_absensi === 1 ? "Aplikasi Absensi Online" : "Aplikasi Face Recoginition", }} isDisabled />
                </div>

                {/* SHIFT KERJA */}
                {!needTanggalOnly && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-800">
                            Shift Kerja
                        </label>
                        <p className="text-xs text-gray-500 mb-1">
                            Shift kerja yang berlaku pada hari ini
                        </p>

                        <Select options={shifts.map(s => ({
                            value: s.id,
                            label: s.nama,
                        }))}
                            value={formData.id_shift ? { value: formData.id_shift, label: shifts.find(s => s.id === formData.id_shift)?.nama, } : null}
                            onChange={opt =>
                                setFormData(f => ({
                                    ...f,
                                    id_shift: opt.value,
                                }))
                            }
                        />
                    </div>
                )}
            </div>

            {/* C. DETAIL ABSENSI */}
            {!needTanggalOnly && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800">
                            Jam Masuk
                        </label>
                        <p className="text-xs text-gray-500 mb-1">
                            Waktu karyawan mulai bekerja
                        </p>

                        <input type="time" step="60" value={formData.jam_mulai}
                            onChange={e =>
                                setFormData(f => ({
                                    ...f,
                                    jam_mulai: e.target.value,
                                }))
                            }
                            className="border rounded px-3 py-2 w-full"
                        />
                    </div>

                    {/* JAM PULANG */}
                    {formData.jam_mulai && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-800">
                                Jam Pulang
                            </label>
                            <p className="text-xs text-gray-500 mb-1">
                                Waktu karyawan selesai bekerja
                            </p>

                            <input type="time" step="60" value={formData.jam_selesai}
                                onChange={e =>
                                    setFormData(f => ({
                                        ...f,
                                        jam_selesai: e.target.value,
                                    }))
                                }
                                className="border rounded px-3 py-2 w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Jika jam pulang lebih kecil dari jam masuk, sistem otomatis mencatat jam pulang sebagai hari berikutnya.
                            </p>

                        </div>
                    )}

                    {/* LOKASI MASUK */}
                    {formData.tipe_absensi === 1 && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-800">
                                Lokasi Absen Masuk
                            </label>
                            <p className="text-xs text-gray-500 mb-1">
                                Lokasi karyawan saat absen masuk
                            </p>

                            <Select
                                options={lokasi.map(l => ({
                                    value: l.id,
                                    label: l.nama,
                                }))}
                                value={
                                    formData.id_lokasi_mulai
                                        ? {
                                            value: formData.id_lokasi_mulai,
                                            label: lokasi.find(
                                                l => l.id === formData.id_lokasi_mulai
                                            )?.nama,
                                        }
                                        : null
                                }
                                onChange={opt =>
                                    setFormData(f => ({
                                        ...f,
                                        id_lokasi_mulai: opt.value,
                                    }))
                                }
                            />
                        </div>
                    )}

                    {/* LOKASI PULANG */}
                    {formData.tipe_absensi === 1 && formData.jam_selesai && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-800">
                                Lokasi Absen Pulang
                            </label>
                            <p className="text-xs text-gray-500 mb-1">
                                Lokasi karyawan saat absen pulang
                            </p>

                            <Select
                                options={lokasi.map(l => ({
                                    value: l.id,
                                    label: l.nama,
                                }))}
                                value={
                                    formData.id_lokasi_selesai
                                        ? {
                                            value: formData.id_lokasi_selesai,
                                            label: lokasi.find(
                                                l => l.id === formData.id_lokasi_selesai
                                            )?.nama,
                                        }
                                        : null
                                }
                                onChange={opt =>
                                    setFormData(f => ({
                                        ...f,
                                        id_lokasi_selesai: opt.value,
                                    }))
                                }
                            />
                        </div>
                    )}
                </div>
            )}

            {/* D. CATATAN */}
            <div>
                <label className="block text-sm font-semibold text-gray-800">
                    Catatan
                </label>
                <p className="text-xs text-gray-500 mb-1">
                    Keterangan tambahan terkait absensi
                </p>

                <textarea className="border rounded px-3 py-2 w-full min-h-[100px]" placeholder="Isi catatan absensi di sini" value={formData.remark}
                    onChange={e =>
                        setFormData(f => ({
                            ...f,
                            remark: e.target.value,
                        }))
                    }
                />
            </div>

            {/* E. ACTION */}
            <div className="flex justify-between items-center pt-4">
                <button type="button" onClick={() => navigate("/")} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                    <FontAwesomeIcon icon={faTimes} /> Batalkan
                </button>

                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                    <FontAwesomeIcon icon={faSave} /> Simpan Perubahan
                </button>
            </div>

        </form>
    );
};

export default RemarkForm;