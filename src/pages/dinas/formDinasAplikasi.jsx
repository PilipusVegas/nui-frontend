import React, { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faChevronDown, faChevronUp,} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

export default function SuratDinasPage() {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

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
    const [infoOpen, setInfoOpen] = useState(true);

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

    const handleChange = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!confirm) return toast.error("Silakan setujui pernyataan data.");
        if (!form.kategori || !form.tgl_berangkat || !form.waktu)
            return toast.error("Lengkapi seluruh data wajib.");
        if (
            form.kategori.value === 2 &&
            (!form.tgl_pulang || new Date(form.tgl_pulang) < new Date(form.tgl_berangkat))
        )
            return toast.error("Tanggal pulang harus valid.");

        const tanggalInfo =
            form.kategori.value === 2
                ? `${form.tgl_berangkat} s/d ${form.tgl_pulang}`
                : form.tgl_berangkat;

        const result = await Swal.fire({
            title: "Konfirmasi Perjalanan Dinas",
            html: `Apakah benar melakukan perjalanan dinas <strong>${tanggalInfo}</strong> pukul <strong>${form.waktu}</strong>?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Kirim",
            cancelButtonText: "Batal",
            confirmButtonColor: "#059669",
            cancelButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

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

            if (!res.ok) throw new Error();

            toast.success("Form berhasil dikirim");
            setForm((prev) => ({
                ...prev,
                kategori: null,
                tgl_berangkat: "",
                tgl_pulang: "",
                waktu: "",
                keterangan: "",
            }));
            setConfirm(false);
        } catch {
            toast.error("Gagal mengirim data");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <MobileLayout title="Surat Dinas">

            <form onSubmit={handleSubmit} className="w-full space-y-6 p-2 pb-14">

                <div className="rounded overflow-hidden border border-blue-400 shadow bg-white">

                    {/* HEADER */}
                    <div onClick={() => setInfoOpen(!infoOpen)} className="flex justify-between items-center cursor-pointer bg-blue-100 px-4 py-3">
                        <div className="flex items-center gap-2 text-blue-800 font-bold">
                            <FontAwesomeIcon icon={faCircleInfo} />
                            Panduan Pengajuan Dinas
                        </div>

                        <FontAwesomeIcon icon={infoOpen ? faChevronUp : faChevronDown} className="text-blue-700"/>
                    </div>

                    {/* CONTENT */}
                    {infoOpen && (
                        <div className="px-4 py-4 bg-blue-50 text-blue-900 text-sm space-y-4 border-t border-blue-300">

                            {/* TITLE */}
                            <p className="font-bold text-blue-900">
                                Informasi Wajib Dibaca Sebelum Mengajukan:
                            </p>

                            {/* POINTS */}
                            <ul className="list-disc list-inside space-y-2 leading-relaxed">

                                <li>
                                    Semua data pada formulir ini adalah
                                    <span className="font-semibold"> wajib diisi </span>
                                    untuk memastikan proses perjalanan dinas berjalan lancar.
                                </li>

                                <li>
                                    Pengisian harus dilakukan melalui
                                    <span className="font-semibold"> akun masing-masing </span>
                                    untuk menghindari kesalahan identitas dan mencegah penyalahgunaan.
                                </li>

                                <li>
                                    Jika Anda pergi keluar kota,
                                    <span className="font-semibold"> cukup isi satu kali </span>
                                    dengan rentang tanggal berangkat dan pulang.
                                    Sistem akan otomatis mencatat seluruh periode perjalanan Anda.
                                </li>

                                <li>
                                    Pastikan memilih
                                    <span className="font-semibold"> kategori perjalanan </span>
                                    yang benar (Dalam Kota / Luar Kota) agar proses persetujuan lebih cepat.
                                </li>

                                <li>
                                    Isi tanggal dan waktu keberangkatan secara
                                    <span className="font-semibold"> akurat dan jujur. </span>
                                    Keterangan yang tidak sesuai dapat menghambat proses dinas,
                                    menimbulkan revisi, dan dapat dianggap sebagai pelanggaran.
                                </li>

                                <li>
                                    Tulis tujuan perjalanan dengan
                                    <span className="font-semibold"> jelas, singkat, dan langsung pada maksudnya </span>
                                    agar mudah dipahami oleh pihak yang memverifikasi.
                                </li>

                            </ul>

                            {/* FOOTNOTE */}
                            <p className="text-xs text-blue-700 leading-relaxed pt-1">
                                Pengajuan yang diisi dengan lengkap, benar, dan jujur akan mempercepat proses validasi,
                                mencegah kesalahan data, dan membantu memastikan perjalanan dinas Anda tercatat resmi sesuai aturan.
                            </p>
                        </div>
                    )}
                </div>


                {/* NAMA */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-800">Nama</label>
                    <div className="p-2 rounded bg-gray-100 text-gray-800 font-medium border border-gray-300">
                        {form.nama}
                    </div>
                </div>

                {/* KATEGORI */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-800">Dinas Ke?</label>
                    <Select
                        options={[
                            { value: 1, label: "Dalam Kota" },
                            { value: 2, label: "Luar Kota" },
                        ]}
                        value={form.kategori}
                        onChange={(v) => handleChange("kategori", v)}
                        placeholder="Pilih kategori perjalanan..."
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderRadius: "0.3rem",
                                borderColor: "#9ca3af",
                                padding: "2px",
                                boxShadow: "none",
                                ":hover": { borderColor: "#2563eb" }
                            }),
                        }}
                    />
                </div>

                {/* TANGGAL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-800">Tanggal Berangkat</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={form.tgl_berangkat}
                            onChange={(e) => handleChange("tgl_berangkat", e.target.value)}
                        />
                    </div>

                    {form.kategori?.value === 2 && (
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-800">Tanggal Pulang</label>
                            <input
                                type="date"
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={form.tgl_pulang}
                                onChange={(e) => handleChange("tgl_pulang", e.target.value)}
                            />
                        </div>
                    )}

                </div>

                {/* JAM */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-800">Jam Berangkat</label>
                    <input
                        type="time"
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={form.waktu}
                        onChange={(e) => handleChange("waktu", e.target.value)}
                    />
                </div>

                {/* KETERANGAN */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-800">Keterangan</label>
                    <textarea
                        rows="2"
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Tujuan perjalanan..."
                        value={form.keterangan}
                        onChange={(e) => handleChange("keterangan", e.target.value)}
                    />
                </div>

                {/* KONFIRMASI ANTI-KETIDAKJUJURAN */}
                <label className="flex items-start gap-3 bg-blue-50 border border-blue-400 rounded p-3 cursor-pointer">
                    <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1 accent-blue-700 w-4 h-4" />

                    <span className="text-xs text-blue-900 leading-5 font-medium select-none">
                        Saya menyatakan bahwa seluruh data yang saya isi adalah
                        <span className="font-bold"> benar, akurat, dan sesuai kondisi sebenarnya</span>.
                        Saya memahami bahwa <span className="font-bold text-blue-800">setiap bentuk ketidakjujuran,
                            manipulasi, atau kecurangan data</span> dapat dikenakan tindakan sesuai aturan perusahaan
                        termasuk pembatalan pengajuan dan proses disiplin internal.
                    </span>
                </label>

                {/* SUBMIT */}
                <button type="submit" disabled={submitLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded shadow transition-all">
                    {submitLoading ? "Mengirim..." : "Kirim"}
                </button>
            </form>

        </MobileLayout>
    );



}
