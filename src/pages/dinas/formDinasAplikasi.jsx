import Swal from "sweetalert2";
import Select from "react-select";
import toast from "react-hot-toast";
import { Modal } from "../../components";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { formatFullDate } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";


export default function SuratDinasPage() {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [infoOpen, setInfoOpen] = useState(false);
    const [form, setForm] = useState({
        id_user: null,
        nama: "",
        kategori: null,
        tgl_berangkat: "",
        tgl_pulang: "",
        waktu: "",
        keterangan: "",
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [confirm, setConfirm] = useState(false);
    useEffect(() => {
        const user = getUserFromToken();
        if (user) {
            setForm((prev) => ({
                ...prev,
                id_user: user.id_user,
                nama: user.nama_user,
            }));
        }
    }, []);


    const handleChange = (field, value) => {
        setForm((prev) => {
            if (
                field === "tgl_berangkat" &&
                prev.tgl_pulang &&
                new Date(prev.tgl_pulang) < new Date(value)
            ) {
                toast.error("Tanggal pulang tidak boleh sebelum tanggal berangkat");
                return {
                    ...prev,
                    tgl_berangkat: value,
                    tgl_pulang: "",
                };
            }
            return { ...prev, [field]: value };
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!confirm) return toast.error("Silakan setujui pernyataan data.");
        if (!form.kategori || !form.tgl_berangkat || !form.waktu)
            return toast.error("Lengkapi seluruh data wajib.");
        if (
            form.kategori.value === 2 &&
            (!form.tgl_pulang ||
                new Date(form.tgl_pulang) < new Date(form.tgl_berangkat))
        ) {
            return toast.error("Tanggal pulang harus valid.");
        }
        const isLuarKota = form.kategori.value === 2;
        const tanggalTampil = isLuarKota
            ? `${formatFullDate(form.tgl_berangkat)} s/d ${formatFullDate(form.tgl_pulang)}`
            : formatFullDate(form.tgl_berangkat);
        const confirmSwal = await Swal.fire({
            title: "Konfirmasi Pengajuan",
            html: `
                <div style="text-align:left; font-size:14px; line-height:1.6">
                    <p>
                        Anda akan mengajukan <strong>Perjalanan Dinas</strong> dengan rincian berikut:
                    </p>
                    <div style="margin:8px 0 14px; padding:10px;">
                        <div><strong>Jenis Perjalanan</strong> : ${form.kategori.label}</div>
                        <div><strong>Tanggal</strong> : ${tanggalTampil}</div>
                        <div><strong>Waktu</strong> : ${form.waktu}</div>
                    </div>
                    <p style="margin-top:8px">
                        Pastikan seluruh data sudah <strong>benar dan sesuai</strong> sebelum dikirim.
                    </p>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Kirim Pengajuan",
            cancelButtonText: "Periksa Kembali",
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#9ca3af",
            reverseButtons: true,
            focusCancel: true,
        });

        if (!confirmSwal.isConfirmed) return;

        setSubmitLoading(true);
        try {
            const res = await fetchWithJwt(`${apiUrl}/surat-dinas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_user: form.id_user,
                    kategori: form.kategori.value,
                    tgl_berangkat: form.tgl_berangkat,
                    tgl_pulang: form.kategori.value === 2 ? form.tgl_pulang : null,
                    waktu: form.waktu,
                    keterangan: form.keterangan,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const message =
                    data?.message ||
                    data?.error ||
                    "Terjadi kesalahan pada sistem.";

                if (res.status === 401) {
                    await Swal.fire({
                        icon: "warning",
                        title: "Sesi Berakhir",
                        text: message || "Silakan login kembali.",
                        confirmButtonText: "OK",
                    });
                    return;
                }

                if (res.status === 403) {
                    await Swal.fire({
                        icon: "error",
                        title: "Akses Ditolak",
                        text: message || "Anda tidak memiliki izin untuk melakukan aksi ini.",
                        confirmButtonText: "OK",
                    });
                    return;
                }

                if (res.status >= 400 && res.status < 500) {
                    toast.error(message);
                    return;
                }

                await Swal.fire({
                    icon: "error",
                    title: "Terjadi Kesalahan",
                    text: message || "Silakan coba beberapa saat lagi.",
                    confirmButtonText: "OK",
                });
                return;
            }

            toast.success(data?.message || "Pengajuan berhasil dikirim");

            setTimeout(() => {
                navigate("/home");
            }, 1200);

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Kesalahan Sistem",
                text: "Terjadi gangguan koneksi atau sistem.",
                confirmButtonText: "OK",
            });
        } finally {
            setSubmitLoading(false);
        }
    };


    return (
        <>
            <MobileLayout title="Perjalanan Dinas">
                <form onSubmit={handleSubmit} className="pb-24 space-y-5">
                    <div className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="font-bold text-xl text-green-600">
                                Formulir Perjalanan Dinas
                            </h1>

                            <button type="button" onClick={() => setInfoOpen(true)} className="text-green-600 hover:text-green-800 transition" title="Informasi & Ketentuan">
                                <FontAwesomeIcon icon={faCircleInfo} size="lg" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Nama</label>
                            <div className="px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium border">
                                {form.nama}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Perjalanan Dinas Ke?</label>
                            <Select options={[{ value: 1, label: "Jabodetabek" }, { value: 2, label: "Luar Jabodetabek" },]} value={form.kategori} onChange={(v) => handleChange("kategori", v)} placeholder="Pilih kategori..." className="text-sm py-1" />
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Tanggal Berangkat
                                </label>
                                <input type="date" className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" value={form.tgl_berangkat} onChange={(e) => handleChange("tgl_berangkat", e.target.value)} />
                            </div>

                            {form.kategori?.value === 2 && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Tanggal Pulang
                                    </label>
                                    <input type="date" min={form.tgl_berangkat || undefined} className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" value={form.tgl_pulang} onChange={(e) => handleChange("tgl_pulang", e.target.value)} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Jam Berangkat</label>
                            <input type="time" className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" value={form.waktu} onChange={(e) => handleChange("waktu", e.target.value)} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Keterangan</label>
                            <textarea rows={2} className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Tujuan perjalanan..." value={form.keterangan} onChange={(e) => handleChange("keterangan", e.target.value)} />
                        </div>

                        <label className="flex gap-3 rounded-lg p-3 border border-green-600/20 cursor-pointer">
                            <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1 accent-green-600" />
                            <span className="text-xs leading-snug ">
                                Saya menyatakan data yang saya isi <strong>benar, jujur, dan dapat dipertanggungjawabkan</strong>.
                            </span>
                        </label>

                        <button type="submit" disabled={submitLoading} className="w-full py-3 rounded-md bg-green-600 text-white font-semibold disabled:opacity-60 active:scale-[0.98] transition">
                            {submitLoading ? "Mengirim..." : "Kirim Pengajuan"}
                        </button>
                    </div>
                </form>
            </MobileLayout>

            <Modal isOpen={infoOpen} onClose={() => setInfoOpen(false)} title="Ketentuan Perjalanan Dinas" note="Harap dibaca dan dipahami." size="md">
                <div className="space-y-5 text-sm leading-relaxed text-gray-800">
                    <p>
                        Formulir ini merupakan <strong>permohonan resmi perjalanan dinas </strong>
                        yang digunakan oleh karyawan dalam menjalankan tugas perusahaan.
                    </p>
                    <div>
                        <h3 className="font-semibold mb-2 text-gray-900">
                            Ketentuan Umum
                        </h3>
                        <ul className="list-disc list-outside pl-5 space-y-2">
                            <li>
                                Pengajuan perjalanan dinas <strong>wajib dilakukan sebelum keberangkatan</strong>.
                            </li>
                            <li>
                                Data yang diisi harus <strong>benar, lengkap, dan sesuai kondisi sebenarnya</strong>.
                            </li>
                            <li>
                                Untuk perjalanan <strong>luar kota</strong>, tanggal berangkat dan pulang
                                wajib diisi sesuai durasi tugas.
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2 text-gray-900">
                            Tanggung Jawab & Konsekuensi
                        </h3>
                        <ul className="list-disc list-outside pl-5 space-y-2">
                            <li>
                                Ketidakjujuran, manipulasi data, atau informasi tidak sesuai
                                dapat menyebabkan <strong>penolakan pengajuan</strong>.
                            </li>
                            <li>
                                Perusahaan berhak melakukan <strong>verifikasi dan evaluasi </strong>
                                atas seluruh pengajuan perjalanan dinas.
                            </li>
                            <li>
                                Pelanggaran terhadap ketentuan ini dapat dikenakan
                                <strong> tindakan disiplin sesuai peraturan perusahaan</strong>.
                            </li>
                        </ul>
                    </div>
                    <div className="pt-3 border-t text-xs text-gray-600 leading-relaxed">
                        Dengan melanjutkan pengajuan, Anda dianggap telah
                        <strong> membaca, memahami, dan menyetujui </strong>
                        seluruh ketentuan yang berlaku.
                    </div>
                </div>
            </Modal>
        </>
    );
}
