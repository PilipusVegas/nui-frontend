import Swal from "sweetalert2";
import Select from "react-select";
import toast from "react-hot-toast";
import { Modal } from "../../components";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { formatFullDate } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const hours = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, "0")}:00`
);

const hourOptions = hours.map((h) => ({
  value: h,
  label: h,
}));

export default function Lembur() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [infoOpen, setInfoOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form, setForm] = useState({
    id_user: "",
    nama: "",
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    lokasi: null,
    keterangan: "",
  });

  const [lokasiList, setLokasiList] = useState([]);

  useEffect(() => {
    if (user) {
      setForm((p) => ({
        ...p,
        id_user: user.id_user,
        nama: user.nama_user,
      }));
    }
    fetchLokasi();
  }, []);

  const fetchLokasi = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/lokasi`);
      const data = await res.json();
      if (res.ok) setLokasiList(data.data || []);
    } catch {
      toast.error("Gagal memuat data lokasi.");
    }
  };

  const validate = () => {
    if (
      !form.tanggal ||
      !form.jam_mulai ||
      !form.jam_selesai ||
      !form.lokasi ||
      !form.keterangan
    ) {
      toast.error("Lengkapi seluruh data lembur.");
      return false;
    }

    if (form.jam_mulai === form.jam_selesai) {
      toast.error("Jam mulai dan jam selesai tidak boleh sama.");
      return false;
    }

    return true;
  };

  const confirmSubmit = async () => {
    return Swal.fire({
      title: "Konfirmasi Pengajuan",
      html: `
        <div style="text-align:left;font-size:14px;line-height:1.6">
          <div><strong>Tanggal</strong> : ${formatFullDate(form.tanggal)}</div>
          <div><strong>Waktu</strong> : ${form.jam_mulai} – ${form.jam_selesai}</div>
          <div><strong>Lokasi</strong> : ${form.lokasi.label}</div>
          <div style="margin-top:6px"><strong>Keterangan</strong> :</div>
          <div>${form.keterangan}</div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Kirim Pengajuan",
      cancelButtonText: "Periksa Kembali",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const confirm = await confirmSubmit();
    if (!confirm.isConfirmed) return;

    setSubmitLoading(true);
    try {
      const res = await fetchWithJwt(`${apiUrl}/lembur/simpan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_user: form.id_user,
          tanggal: form.tanggal,
          jam_mulai: form.jam_mulai,
          jam_selesai: form.jam_selesai,
          id_lokasi: form.lokasi.value,
          deskripsi: form.keterangan,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.message || "Gagal mengirim pengajuan.");
        return;
      }

      toast.success(data?.message || "Pengajuan lembur berhasil.");
      navigate("/riwayat-pengguna");
    } catch {
      toast.error("Terjadi gangguan sistem.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <MobileLayout title="Lembur">
        <form onSubmit={handleSubmit} className="pb-24 space-y-5">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-4">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl text-green-600">
                Formulir Lembur
              </h1>
              <button
                type="button"
                onClick={() => setInfoOpen(true)}
                className="text-green-600 hover:text-green-800"
              >
                <FontAwesomeIcon icon={faCircleInfo} size="lg" />
              </button>
            </div>

            {/* NAMA */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Nama</label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm border">
                {form.nama}
              </div>
            </div>

            {/* TANGGAL */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Tanggal Lembur</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tanggal: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* JAM */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium">Jam Mulai</label>
                <Select
                  options={hourOptions}
                  value={hourOptions.find((o) => o.value === form.jam_mulai)}
                  onChange={(o) =>
                    setForm((p) => ({ ...p, jam_mulai: o.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Jam Selesai</label>
                <Select
                  options={hourOptions}
                  value={hourOptions.find((o) => o.value === form.jam_selesai)}
                  onChange={(o) =>
                    setForm((p) => ({ ...p, jam_selesai: o.value }))
                  }
                />
              </div>
            </div>

            {/* LOKASI */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Lokasi Lembur</label>
              <Select
                options={lokasiList.map((l) => ({
                  value: l.id,
                  label: l.nama,
                }))}
                value={form.lokasi}
                onChange={(o) => setForm((p) => ({ ...p, lokasi: o }))}
                placeholder="Pilih lokasi..."
              />
            </div>

            {/* KETERANGAN */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Keterangan Lembur</label>
              <textarea
                rows={3}
                value={form.keterangan}
                onChange={(e) =>
                  setForm((p) => ({ ...p, keterangan: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-3 rounded-md bg-green-600 text-white font-semibold disabled:opacity-60"
            >
              {submitLoading ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </div>
        </form>
      </MobileLayout>

      {/* MODAL INFO */}
      <Modal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Ketentuan Lembur"
        note="Harap dibaca sebelum mengajukan."
        size="md"
      >
        <div className="space-y-3 text-sm leading-relaxed">
          <ul className="list-disc list-outside pl-5 space-y-2">
            <li>Pengajuan lembur wajib sesuai jam kerja.</li>
            <li>Jam mulai dan selesai tidak boleh sama.</li>
            <li>Pastikan tidak bertabrakan dengan lembur lain.</li>
            <li>Pengajuan tercatat di riwayat lembur.</li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
