import React, { useState } from "react";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import Swal from "sweetalert2";

const Tambah = ({ onSuccess, onCancel }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [nama, setNama] = useState("");
    const [loading, setLoading] = useState(false);
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nama.trim()) {
            Swal.fire("Validasi Gagal", "Nama grup wajib diisi", "warning");
            return;
        }

        try {
            setLoading(true);

            const user = getUserFromToken();
            const idKadiv = user?.is_kadiv?.id;

            if (!idKadiv) {
                throw new Error("ID Kadiv tidak ditemukan");
            }

            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/group`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nama: nama.trim(),
                        id_kadiv: idKadiv,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Gagal menambahkan grup");
            }

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Grup tim berhasil ditambahkan",
                timer: 1500,
                showConfirmButton: false,
            });

            onSuccess?.();
        } catch (err) {
            Swal.fire(
                "Terjadi Kesalahan",
                err.message || "Gagal menyimpan data",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Grup
                </label>
                <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Tim Operasional"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2
                        focus:outline-none focus:ring-2 focus:ring-green-500
                        focus:border-green-500"
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-md border border-gray-300
                        text-gray-600 hover:bg-gray-100 transition"
                >
                    Batal
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-green-600 text-white
                        hover:bg-green-700 transition disabled:opacity-60"
                >
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>
            </div>
        </form>
    );
};

export default Tambah;