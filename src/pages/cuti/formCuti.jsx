import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import MobileLayout from "../../layouts/mobileLayout";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function FormCuti() {
    const [tglMulai, setTglMulai] = useState("");
    const [tglSelesai, setTglSelesai] = useState("");
    const [jmlHari, setJmlHari] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [loading, setLoading] = useState(false);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🔹 Validasi tanggal
        if (tglMulai && tglSelesai && new Date(tglSelesai) < new Date(tglMulai)) {
            toast.error("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
            return;
        }

        const result = await Swal.fire({
            title: "Konfirmasi Pengajuan",
            text: "Apakah data cuti sudah benar?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, ajukan!",
            cancelButtonText: "Periksa lagi",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        setLoading(true);

        try {
            const response = await fetchWithJwt(`${apiUrl}/cuti`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jml_hari: Number(jmlHari),
                    tgl_mulai: tglMulai,
                    tgl_selesai: tglSelesai,
                    keterangan,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Terjadi kesalahan saat mengajukan cuti.");
            }

            toast.success("Pengajuan cuti berhasil dikirim!");
            navigate("/riwayat-cuti"); // 🔹 Redirect setelah sukses
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout title="Form Pengajuan Cuti">
            <div className="mx-auto bg-white p-4 px-2">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tanggal Mulai */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-0.5 text-sm">
                            Tanggal Mulai Cuti
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Pilih hari pertama cuti Anda dengan teliti.
                        </p>
                        <input type="date" value={tglMulai} onChange={(e) => setTglMulai(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>

                    {/* Tanggal Selesai */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-0.5 text-sm">
                            Tanggal Selesai Cuti
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Pastikan tanggal selesai tidak lebih awal dari tanggal mulai.
                        </p>
                        <input type="date" value={tglSelesai} onChange={(e) => setTglSelesai(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>

                    {/* Jumlah Hari */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-0.5 text-sm">
                            Jumlah Hari Cuti
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Isi sesuai dengan total hari yang Anda ajukan.
                        </p>
                        <input type="number" min={1} value={jmlHari} onChange={(e) => setJmlHari(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Masukkan jumlah hari cuti" required />
                    </div>

                    {/* Keterangan */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-0.5 text-sm">
                            Keterangan Cuti
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Berikan alasan singkat agar HR memahami kebutuhan cuti Anda.
                        </p>
                        <textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Contoh: Liburan keluarga / urusan pribadi" rows={4} required />
                    </div>

                    {/* Tombol */}
                    <button type="submit" disabled={loading} className={`w-full py-3 rounded-md text-white font-semibold text-lg shadow-md transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                        {loading ? "Mengirim..." : "Ajukan Cuti"}
                    </button>
                </form>
            </div>
        </MobileLayout>
    );
}
