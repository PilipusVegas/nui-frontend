// src/pages/data-bbm/Tambah.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "../../components/";
import { fetchWithJwt } from "../../utils/jwtHelper";

// Mapping
const KATEGORI_LABEL = {
  1: "Bensin",
  2: "Listrik",
};

const SATUAN_BY_KATEGORI = {
  1: 1, // Bensin -> Liter
  2: 2, // Listrik -> kWh
};

const SATUAN_LABEL = {
  1: "Liter",
  2: "kWh",
};

const TambahBBM = ({ isOpen, onClose, apiUrl, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    kategori: 1,
    harga: "",
    satuan: 1,
  });

  /* Sinkron satuan saat kategori berubah */
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      satuan: SATUAN_BY_KATEGORI[prev.kategori],
    }));
  }, [form.kategori]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.harga) {
      Swal.fire("Validasi", "Nama dan harga wajib diisi", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nama: form.nama.trim(),
        kategori: Number(form.kategori),
        harga: Number(form.harga),
        satuan: Number(form.satuan),
      };

      const response = await fetchWithJwt(`${apiUrl}/fuels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire("Berhasil", "Data BBM berhasil ditambahkan", "success");
        setForm({ nama: "", kategori: 1, harga: "", satuan: 1 });
        onSuccess?.();
        onClose();
      } else {
        Swal.fire("Gagal", "Gagal menambahkan data BBM", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Jenis BBM"
      note="Isi data BBM yang akan digunakan sebagai acuan perhitungan fitur kunjungan."
      footer={
        <div className="w-full flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="
              w-full sm:w-auto
              px-4 py-2
              rounded-lg
              bg-gray-200 hover:bg-gray-300
              text-sm font-medium
              transition
            "
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="
              w-full sm:w-auto
              px-6 py-2
              rounded-lg
              bg-green-600 hover:bg-green-700
              text-white text-sm font-medium
              transition
              disabled:opacity-50
            "
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nama */}
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Nama BBM</label>
          <input
            name="nama"
            value={form.nama}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Contoh: Pertalite"
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="text-sm font-medium">Kategori</label>
          <select
            name="kategori"
            value={form.kategori}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value={1}>{KATEGORI_LABEL[1]}</option>
            <option value={2}>{KATEGORI_LABEL[2]}</option>
          </select>
        </div>

        {/* Satuan (readonly, auto) */}
        <div>
          <label className="text-sm font-medium">Satuan</label>
          <input
            value={SATUAN_LABEL[form.satuan]}
            disabled
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600"
          />
        </div>

        {/* Harga */}
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">
            Harga per {SATUAN_LABEL[form.satuan]}
          </label>
          <input
            type="number"
            name="harga"
            value={form.harga}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Contoh: 10000"
          />
        </div>
      </div>
    </Modal>
  );
};

export default TambahBBM;