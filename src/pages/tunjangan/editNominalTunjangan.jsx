// components/EditNominalTunjangan.jsx
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { Modal, LoadingSpinner } from "../../components";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const EditNominalTunjangan = ({ isOpen, onClose }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [tunjangan, setTunjangan] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchTunjangan = async () => {
        setLoading(true);
        try {
            const res = await fetchWithJwt(`${apiUrl}/tunjangan`);
            const json = await res.json();
            setTunjangan(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            toast.error("Gagal memuat data tunjangan");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (id, value) => {
        setTunjangan((prev) =>
            prev.map((t) => (t.id === id ? { ...t, nominal: value } : t))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = tunjangan.map(async (t) => {
                return fetchWithJwt(`${apiUrl}/tunjangan/${t.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nama: t.nama,
                        nominal: Number(t.nominal),
                        deskripsi: t.deskripsi,
                    }),
                });
            });

            await Promise.all(updates);
            toast.success("Nominal berhasil diperbarui. Silahkan refresh halaman.");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Gagal menyimpan perubahan.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchTunjangan();
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Atur Nominal Tunjangan" note="Ubah nominal tunjangan secara langsung di sini." size="xl"
            footer={
                <button onClick={handleSave} disabled={saving} className={`px-6 py-2 rounded-md font-semibold text-white shadow transition ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            }
        >
            {!loading && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 shadow-sm">
                    <p className="font-medium text-blue-800 mb-1">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                        Petunjuk Informasi:
                    </p>
                    <p>
                        Anda dapat menyesuaikan nominal tunjangan langsung pada kolom
                        “Nominal (Rp)”. Pastikan nilai yang dimasukkan sesuai dengan kebijakan
                        perusahaan dan tidak menggunakan tanda titik atau koma. Setelah selesai,
                        tekan tombol <span className="font-semibold text-blue-800">“Simpan Perubahan”</span> di bawah.
                    </p>
                </div>
            )}

            {loading ? (
                <div className="py-10 text-center">
                    <LoadingSpinner text="Memuat data tunjangan..." />
                </div>
            ) : (
                <table className="w-full border-collapse text-sm shadow-sm rounded-md overflow-hidden">
                    <thead>
                        <tr className="bg-green-600 text-white">
                            <th className="px-4 py-3 text-left font-semibold border rounded-tl-lg">
                                Nama Tunjangan
                            </th>
                            <th className="px-4 py-3 text-right font-semibold border rounded-tr-lg">
                                Nominal (Rp)
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tunjangan.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={2}
                                    className="py-6 text-center text-gray-500 bg-gray-50 border"
                                >
                                    Tidak ada data tunjangan.
                                </td>
                            </tr>
                        ) : (
                            tunjangan.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 transition-colors border-t"
                                >
                                    <td className="px-4 border-r">
                                        <div className="flex flex-col">
                                            <span className="text-gray-800 font-medium">
                                                {item.nama}
                                            </span>
                                            <span className="text-gray-600 text-xs">
                                                {item.deskripsi}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="relative inline-flex items-center w-40 border border-gray-300 rounded-md shadow-sm px-2 py-1 focus-within:ring-2 focus-within:ring-green-500 bg-white">
                                            <span className="absolute left-3 text-gray-500 text-sm">
                                                Rp
                                            </span>
                                            <input
                                                type="text"
                                                value={Number(item.nominal).toLocaleString("id-ID")}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\D/g, "");
                                                    handleChange(item.id, rawValue);
                                                }}
                                                className="pl-7 pr-2 w-full text-right bg-transparent focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </Modal>
    );

};

export default EditNominalTunjangan;
