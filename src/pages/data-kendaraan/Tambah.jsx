// src/pages/data-kendaraan/Tambah.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Modal } from "../../components/";
import { fetchWithJwt } from "../../utils/jwtHelper";

const KATEGORI_KENDARAAN = {
  1: "Motor",
  2: "Mobil",
};

const TambahKendaraan = ({ isOpen, onClose, apiUrl, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bbmList, setBbmList] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    kategori: 1,
    tahun: "",
    konsumsi_bb: "",
    id_bb: "",
  });

  /* Fetch BBM */
  useEffect(() => {
    if (isOpen) fetchBBM();
  }, [isOpen]);

  const fetchBBM = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/fuels`);
      const json = await res.json();
      setBbmList(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error(err);
      setBbmList([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { nama, kategori, tahun, konsumsi_bb, id_bb } = form;

    if (!nama || !tahun || !konsumsi_bb || !id_bb) {
      Swal.fire("Validasi", "Semua field wajib diisi", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nama: nama.trim(),
        kategori: Number(kategori),
        tahun: String(tahun),
        konsumsi_bb: Number(konsumsi_bb),
        id_bb: Number(id_bb),
      };

      const res = await fetchWithJwt(`${apiUrl}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Kendaraan berhasil ditambahkan", "success");
        onSuccess?.();
        onClose();
        setForm({
          nama: "",
          kategori: 1,
          tahun: "",
          konsumsi_bb: "",
          id_bb: "",
        });
      } else {
        Swal.fire("Gagal", "Gagal menambahkan kendaraan", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Kendaraan" note="Data kendaraan digunakan untuk perhitungan konsumsi BBM pada fitur kunjungan."
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="ml-2 px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </>
      }
    >
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
            <option value="">-- Pilih BBM --</option>
            {bbmList.map((bbm) => (
              <option key={bbm.id} value={bbm.id}>
                {bbm.nama}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default TambahKendaraan;