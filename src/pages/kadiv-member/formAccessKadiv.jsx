import React, { useEffect, useState } from "react";
import { Modal } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";

const FormAccessKadiv = ({ isOpen, onClose, onSuccess, editData }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [idKadiv, setIdKadiv] = useState("");
    const [loading, setLoading] = useState(false);

    // Jika edit, isi data lama
    useEffect(() => {
        if (editData) {
            setIdKadiv(editData.id_user);
        } else {
            setIdKadiv("");
        }
    }, [editData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { id_user: Number(idKadiv) };

            let url = `${apiUrl}/profil/kadiv-access`;
            let method = "POST";

            if (editData) {
                url = `${apiUrl}/profil/kadiv-access/${editData.id}`;
                method = "PUT";
            }

            const res = await fetchWithJwt(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                onSuccess();
                onClose();
            } else {
                console.error("Gagal menyimpan data:", data.message);
            }
        } catch (err) {
            console.error("Terjadi kesalahan:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? "Edit Kadiv Access" : "Tambah Kadiv Access"}
            note="Masukkan ID User untuk mengatur akses Kadiv."
        >
            <form onSubmit={handleSubmit} className="grid gap-4 text-sm text-gray-700">

                <div>
                    <label className="block mb-1 font-medium">ID User</label>
                    <input
                        type="number"
                        value={idKadiv}
                        onChange={(e) => setIdKadiv(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-green-200"
                        placeholder="Masukkan ID User..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow active:scale-95 transition-all"
                >
                    {loading ? "Menyimpan..." : editData ? "Perbarui" : "Tambah"}
                </button>
            </form>
        </Modal>
    );
};

export default FormAccessKadiv;
