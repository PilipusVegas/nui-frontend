import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

const TambahPerusahaan = () => {
    const [nama, setNama] = useState("");
    const [alamat, setAlamat] = useState("");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${apiUrl}/perusahaan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama, alamat}),
            });
            if (!res.ok) throw new Error("Gagal menambahkan perusahaan");

            navigate("/perusahaan");
        } catch (err) {
            console.error("Terjadi kesalahan saat menambah:", err);
            alert("Gagal menambahkan data. Silakan coba lagi.");
        }
    };

    const handleBack = () => navigate("/perusahaan");

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
                <div className="flex items-center space-x-2">
                    <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full" title="Kembali">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Tambah Perusahaan</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow p-10 w-full mx-auto space-y-6">
            <div>
                <label className="block mb-1 font-medium text-gray-700">Nama Perusahaan</label>
                <p className="text-xs text-gray-500 mb-2">Masukkan nama lengkap perusahaan.</p>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
            </div>
            <div>
                <label className="block mb-1 font-medium text-gray-700">Alamat</label>
                <p className="text-xs text-gray-500 mb-2">Tuliskan alamat lengkap lokasi kantor perusahaan.</p>
                <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} rows="3" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"></textarea>
            </div>
            <div className="flex justify-between space-x-4 pt-4">
                <button type="button" onClick={handleBack} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center shadow">
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Batal
                </button>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow">
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Simpan Perubahan
                </button>
            </div>
            </form>
        </div>
    );
};

export default TambahPerusahaan;
