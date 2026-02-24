// src/pages/data-kendaraan/Edit.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "../../components/";
import { fetchWithJwt } from "../../utils/jwtHelper";

const KATEGORI_KENDARAAN = {
  1: "Motor",
  2: "Mobil",
};

const EditKendaraan = ({ isOpen, onClose, apiUrl, data, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bbmList, setBbmList] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    kategori: 1,
    tahun: "",
    konsumsi_bb: "",
    id_bb: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        nama: data.nama ?? "",
        kategori: data.kategori ?? 1,
        tahun: data.tahun ?? "",
        konsumsi_bb: data.konsumsi_bb ?? "",
        id_bb: data.id_bb ?? "",
      });
    }
  }, [data, isOpen]);

  useEffect(() => {
    if (isOpen) fetchBBM();
  }, [isOpen]);

  const fetchBBM = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/fuels`);
      const json = await res.json();
      setBbmList(Array.isArray(json.data) ? json.data : []);
    } catch {
      setBbmList([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.nama || !form.tahun || !form.konsumsi_bb || !form.id_bb) {
      Swal.fire("Validasi", "Semua field wajib diisi", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nama: form.nama.trim(),
        kategori: Number(form.kategori),
        tahun: String(form.tahun),
        konsumsi_bb: Number(form.konsumsi_bb),
        id_bb: Number(form.id_bb),
      };

      const res = await fetchWithJwt(
        `${apiUrl}/vehicles/${data.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        Swal.fire("Berhasil", "Data kendaraan diperbarui", "success");
        onSuccess?.();
        onClose();
      } else {
        Swal.fire("Gagal", "Gagal memperbarui data", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Kendaraan"
      note="Perubahan data kendaraan akan mempengaruhi perhitungan konsumsi BBM."
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="ml-2 px-6 py-2 bg-green-600 text-white rounded-lg">
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </>
      }
    >
      {/* Struktur form SAMA dengan Tambah */}
      {/* agar konsisten */}
      {/* (disengaja tidak diulang penjelasan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Nama Kendaraan</label>
          <input name="nama" value={form.nama} onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Kategori</label>
          <select name="kategori" value={form.kategori} onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
            {Object.entries(KATEGORI_KENDARAAN).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Tahun</label>
          <input type="number" name="tahun" value={form.tahun}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Konsumsi BBM (km/l)</label>
          <input type="number" name="konsumsi_bb" value={form.konsumsi_bb}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Jenis BBM</label>
          <select name="id_bb" value={form.id_bb} onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
            {bbmList.map((bbm) => (
              <option key={bbm.id} value={bbm.id}>{bbm.nama}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default EditKendaraan;