import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { Modal } from "../../components/";

const EditKendaraanKaryawan = ({
  isOpen,
  onClose,
  apiUrl,
  idUserKendaraan,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id_user: null,
    id_kendaraan: "",
  });

  const [infoUser, setInfoUser] = useState({
    nama_user: "",
    nip_user: "",
    role: "",
    perusahaan: "",
  });

  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    if (isOpen && idUserKendaraan) {
      fetchInitialData();
    }
  }, [isOpen, idUserKendaraan]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      /* ===== PROFIL USER ===== */
      const profilRes = await fetchWithJwt(`${apiUrl}/profil`);
      let profilJson = {};
      try {
        profilJson = await profilRes.json();
      } catch {}

      if (!profilRes.ok) {
        throw new Error(profilJson?.message || "Gagal memuat profil");
      }

      const user = profilJson.data[0];

      setInfoUser({
        nama_user: user.nama,
        nip_user: user.nip,
        role: user.role,
        perusahaan: user.perusahaan,
      });

      /* ===== MASTER VEHICLES ===== */
      const vehicleRes = await fetchWithJwt(`${apiUrl}/vehicles`);
      let vehicleJson = {};
      try {
        vehicleJson = await vehicleRes.json();
      } catch {}

      if (!vehicleRes.ok) {
        throw new Error(vehicleJson?.message || "Gagal memuat kendaraan");
      }

      setVehicles(vehicleJson.data || []);

      /* ===== RELASI USER–KENDARAAN ===== */
      const relasiRes = await fetchWithJwt(
        `${apiUrl}/vehicles/users/${idUserKendaraan}`,
      );

      let relasiJson = {};
      try {
        relasiJson = await relasiRes.json();
      } catch {}

      if (!relasiRes.ok) {
        throw new Error(relasiJson?.message || "Gagal memuat relasi");
      }

      setForm({
        id_user: relasiJson.data.id_user,
        id_kendaraan: relasiJson.data.id_kendaraan,
      });
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal memuat data", "error");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.id_kendaraan) {
      Swal.fire("Validasi", "Silakan pilih kendaraan", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await fetchWithJwt(
        `${apiUrl}/vehicles/users/${idUserKendaraan}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_user: form.id_user,
            id_kendaraan: Number(form.id_kendaraan),
          }),
        },
      );

      // 🔥 AMBIL RESPONSE BACKEND
      let json = {};
      try {
        json = await res.json();
      } catch {}

      // 🔥 HANDLE ERROR MESSAGE DARI BE
      if (!res.ok) {
        throw new Error(json?.message || "Gagal menyimpan perubahan");
      }
      Swal.fire(
        "Berhasil",
        json?.message || "Kendaraan berhasil diperbarui",
        "success",
      );
      onClose();
      onSuccess?.();
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.message || "Terjadi kesalahan pada sistem",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = vehicles.find(
    (v) => v.id === Number(form.id_kendaraan),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Kendaraan Karyawan"
      note="Pilih kendaraan dari data master. Spesifikasi kendaraan bersifat read-only."
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
          >
            Simpan Perubahan
          </button>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-gray-500">Memuat data...</p>
      ) : (
        <div className="space-y-6">
          {/* ================= INFO KARYAWAN ================= */}
          <div className="border rounded-xl p-4 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Informasi Karyawan
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-gray-500">Nama</p>
                <p className="font-medium">{infoUser.nama_user}</p>
              </div>
              <div>
                <p className="text-gray-500">NIP</p>
                <p className="font-medium">{infoUser.nip_user}</p>
              </div>
              <div>
                <p className="text-gray-500">Role</p>
                <p className="font-medium">{infoUser.role}</p>
              </div>
              <div>
                <p className="text-gray-500">Perusahaan</p>
                <p className="font-medium">{infoUser.perusahaan}</p>
              </div>
            </div>
          </div>

          {/* ================= PILIH KENDARAAN ================= */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kendaraan yang Digunakan
            </label>
            <select
              value={form.id_kendaraan}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  id_kendaraan: e.target.value,
                }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">— Pilih Kendaraan —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nama} ({v.tahun}) · {v.nama_bb}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Kendaraan diambil dari data master
            </p>
          </div>

          {/* ================= DETAIL KENDARAAN ================= */}
          {selectedVehicle && (
            <div className="border rounded-xl p-4 bg-white shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Detail Kendaraan
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Nama Kendaraan</p>
                  <p className="font-medium">{selectedVehicle.nama}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tahun</p>
                  <p className="font-medium">{selectedVehicle.tahun}</p>
                </div>
                <div>
                  <p className="text-gray-500">Konsumsi BBM</p>
                  <p className="font-medium">
                    {selectedVehicle.konsumsi_bb} km/l
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Jenis BBM</p>
                  <p className="font-medium">{selectedVehicle.nama_bb}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Harga BBM</p>
                  <p className="font-medium">
                    Rp {selectedVehicle.harga_bb.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default EditKendaraanKaryawan;
