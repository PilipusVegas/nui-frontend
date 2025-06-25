import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

const EditPerusahaan = () => {
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const fetchPerusahaan = async () => {
    try {
      const res = await fetch(`${apiUrl}/perusahaan/${id}`);
      if (!res.ok) throw new Error("Gagal mengambil data perusahaan.");
      const data = await res.json();
      setNama(data.nama || "");
      setAlamat(data.alamat || "");
    } catch (err) {
      console.error("Error:", err);
      alert("Gagal memuat data perusahaan.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/perusahaan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, alamat }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan.");
      navigate("/perusahaan");
    } catch (err) {
      console.error("Error saat menyimpan:", err);
      alert("Gagal memperbarui data perusahaan.");
    }
  };

  const handleBack = () => navigate("/perusahaan");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full" title="Kembali">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Edit Perusahaan</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-grow p-10 w-full mx-auto space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Nama Perusahaan</label>
          <p className="text-xs text-gray-500 mb-2">Masukkan nama resmi perusahaan yang ingin diperbarui.</p>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Alamat</label>
          <p className="text-xs text-gray-500 mb-2">Alamat lengkap kantor perusahaan terbaru.</p>
          <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} rows="3" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"></textarea>
        </div>

        {/* Tombol Aksi */}
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

export default EditPerusahaan;
