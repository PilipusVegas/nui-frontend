import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import Swal from "sweetalert2";

const EditPerusahaan = () => {
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [selectedShifts, setSelectedShifts] = useState([]);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const fetchPerusahaan = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/perusahaan/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      setNama(data?.data?.nama || "");
      setAlamat(data?.data?.alamat || "");

      // ⬇️ SHIFT DISIMPAN DI STATE, TAPI TIDAK DITAMPILKAN
      const shiftIds = data?.data?.shift
        ?.map((s) => s.id)
        .filter(Boolean) || [];

      setSelectedShifts(shiftIds);
    } catch {
      Swal.fire("Error", "Gagal memuat data perusahaan", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Nama perusahaan wajib diisi",
        text: "Silakan masukkan nama perusahaan.",
      });
    }

    if (!alamat.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Alamat tidak boleh kosong",
        text: "Mohon isi alamat lengkap perusahaan.",
      });
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menyimpan?",
      text: "Perubahan data perusahaan akan disimpan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchWithJwt(`${apiUrl}/perusahaan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          alamat,
          // ⬇️ SHIFT TETAP TERKIRIM
          detailShift: selectedShifts.map((id) => ({
            id_shift: id,
          })),
        }),
      });

      if (!res.ok) throw new Error();

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data perusahaan berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/perusahaan");
    } catch {
      Swal.fire(
        "Gagal menyimpan",
        "Terjadi kesalahan saat memperbarui data perusahaan.",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center pb-4 bg-white shadow-sm border-b">
        <button onClick={() => navigate("/perusahaan")} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full mr-2">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Edit Perusahaan
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-grow pt-5 sm:p-4 w-full mx-auto space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Nama Perusahaan
          </label>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Alamat
          </label>
          <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} rows="3" className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div className="flex justify-between pt-4">
          <button type="button" onClick={() => navigate("/perusahaan")} className="bg-red-500 text-white px-4 py-2 rounded flex items-center">
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Batal
          </button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded flex items-center">
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPerusahaan;
