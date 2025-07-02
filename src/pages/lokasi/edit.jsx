import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const EditLokasi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [nama, setNama] = useState("");
  const [koordinat, setKoordinat] = useState("");

  const handleBack = async () => {
    const confirm = await Swal.fire({
      title: "Batalkan perubahan?",
      text: "Perubahan yang belum disimpan akan hilang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, batalkan",
      cancelButtonText: "Kembali",
      iconColor: "#F87171",
    });
    if (confirm.isConfirmed) {
      navigate("/lokasi-presensi");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiUrl}/lokasi/${id}`);
        if (!res.ok) throw new Error("Gagal memuat data lokasi.");
        const data = await res.json();
  
        const lokasi = data.data || data;
        if (!lokasi.nama || !lokasi.koordinat) throw new Error("Data lokasi tidak lengkap.");
  
        setNama(lokasi.nama);
        setKoordinat(lokasi.koordinat);
      } catch (err) {
        Swal.fire("Gagal", err.message || "Gagal memuat data lokasi.", "error");
      }
    };
    fetchData();
  }, [id]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirm = await Swal.fire({
      title: "Simpan perubahan?",
      text: "Data lokasi akan diperbarui.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
      iconColor: "#22C55E",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${apiUrl}/lokasi/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, koordinat }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan.");
      Swal.fire({
        title: "Berhasil!",
        text: "Data lokasi berhasil diperbarui.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => navigate("/lokasi-presensi"));
    } catch (err) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menyimpan.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Edit Lokasi</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-grow p-10 w-full mx-auto space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Nama Lokasi</label>
          <p className="text-xs text-gray-500 mb-2">Perbarui nama lokasi jika diperlukan.</p>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Koordinat</label>
          <p className="text-xs text-gray-500 mb-2">Perbarui koordinat presisi lokasi.</p>
          <input type="text" value={koordinat} onChange={(e) => setKoordinat(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
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

export default EditLokasi;
