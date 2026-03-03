// src/pages/data-kendaraan/Tambah.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Modal } from "../../components/";
import { fetchWithJwt } from "../../utils/jwtHelper";
import Select from "react-select";

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

  useEffect(() => {
    if (!isOpen) {
      setForm({
        nama: "",
        kategori: 1,
        tahun: "",
        konsumsi_bb: "",
        id_bb: "",
      });
    }
  }, [isOpen]);
  const navigate = useNavigate();

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

  const bbmOptions = bbmList.map((bbm) => ({
    value: bbm.id,
    label: bbm.nama,
  }));

  const handleAddBBM = () => {
    onClose();
    navigate("/jenis-bbm");
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

      const json = await res.json().catch(() => null);

      if (res.ok) {
        Swal.fire("Berhasil", json?.message || "Kendaraan berhasil ditambahkan", "success");

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
        Swal.fire(
          "Gagal",
          json?.message || "Gagal menambahkan kendaraan",
          "error"
        );
      }
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err?.message || "Terjadi kesalahan sistem",
        "error"
      );
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
          <button onClick={handleSubmit} disabled={isSubmitting || bbmList.length === 0} className="ml-2 px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Nama Kendaraan</label>
          <input name="nama" value={form.nama} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Kategori</label>
          <select name="kategori" value={form.kategori} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
            {Object.entries(KATEGORI_KENDARAAN).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Tahun</label>
          <input type="number" name="tahun" value={form.tahun} onChange={handleChange} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Konsumsi BBM (km/l)</label>
          <input
            type="number"
            name="konsumsi_bb"
            value={form.konsumsi_bb}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Jenis BBM</label>

          <Select
            options={bbmOptions}
            value={bbmOptions.find((o) => o.value === Number(form.id_bb)) || null}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                id_bb: selected ? selected.value : "",
              }))
            }
            placeholder="Pilih jenis BBM"
            isClearable
            className="mt-1 text-sm"
            classNamePrefix="react-select"
            /* FIX dropdown tenggelam di modal */
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            /* Pesan saat user search & data tidak ada */
            noOptionsMessage={({ inputValue }) =>
              inputValue ? (
                <div className="px-2 py-1 text-xs text-gray-600">
                  <p>Data BBM yang Anda cari tidak ada.</p>
                  <button
                    type="button"
                    onClick={handleAddBBM}
                    className="mt-1 text-blue-600 font-medium hover:underline"
                  >
                    Tambah data BBM
                  </button>
                </div>
              ) : (
                "Ketik untuk mencari BBM"
              )
            }
          />

          {/* Pesan KHUSUS jika BBM memang kosong dari API */}
          {bbmList.length === 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Data BBM belum tersedia.{" "}
              <button
                type="button"
                onClick={handleAddBBM}
                className="text-blue-600 font-medium hover:underline"
              >
                Tambah data BBM
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TambahKendaraan;
