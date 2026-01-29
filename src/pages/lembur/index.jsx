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

/* =======================
   CONSTANT
======================= */
const hours = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, "0")}:00`
);

const hourOptions = hours.map((h) => ({
  value: h,
  label: h,
}));

/* =======================
   COMPONENT
======================= */
export default function Lembur() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  /* =======================
     STATE
  ======================= */
  const [user, setUser] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [lokasiList, setLokasiList] = useState([]);

  const [form, setForm] = useState({
    id_user: "",
    nama: "",
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    lokasi: null,
    keterangan: "",
  });

  /* =======================
     INIT USER (ONCE)
  ======================= */
  useEffect(() => {
    const u = getUserFromToken();
    if (u) setUser(u);
  }, []);

  /* =======================
     FETCH JADWAL USER
  ======================= */
  useEffect(() => {
    if (!user?.id_user) return;

    setForm((p) => ({
      ...p,
      id_user: user.id_user,
      nama: user.nama_user,
    }));

    fetchJadwalUser(user.id_user);
  }, [user?.id_user]);

  const fetchJadwalUser = async (idUser) => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/jadwal/cek/${idUser}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Gagal memuat jadwal.");
        return;
      }

      setLokasiList(data.data?.lokasi || []);
    } catch {
      toast.error("Gagal memuat jadwal user.");
    }
  };

  /* =======================
     VALIDATION
  ======================= */
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

    const isLokasiValid = lokasiList.some(
      (l) => l.id === form.lokasi?.value
    );

    if (!isLokasiValid) {
      toast.error("Lokasi lembur tidak sesuai dengan jadwal Anda.");
      return false;
    }

    return true;
  };

  /* =======================
     CONFIRMATION
  ======================= */
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

  /* =======================
     SUBMIT
  ======================= */
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

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      <MobileLayout title="Lembur">
        <form onSubmit={handleSubmit} className="pb-24 space-y-5">
          <div className="bg-white rounded-xl shadow border p-4 space-y-4">

            <div className="flex items-center justify-between">
              <h1 className="font-bold text-xl text-green-600">
                Formulir Lembur
              </h1>
              <button
                type="button"
                onClick={() => setInfoOpen(true)}
                className="text-green-600"
              >
                <FontAwesomeIcon icon={faCircleInfo} size="lg" />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium">Nama</label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm border">
                {form.nama}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tanggal Lembur</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tanggal: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium">Jam Mulai</label>
                <Select
                  options={hourOptions}
                  value={hourOptions.find(
                    (o) => o.value === form.jam_mulai
                  )}
                  onChange={(o) =>
                    setForm((p) => ({ ...p, jam_mulai: o.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Jam Selesai</label>
                <Select
                  options={hourOptions}
                  value={hourOptions.find(
                    (o) => o.value === form.jam_selesai
                  )}
                  onChange={(o) =>
                    setForm((p) => ({ ...p, jam_selesai: o.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Lokasi Lembur</label>
              <Select
                options={lokasiList.map((l) => ({
                  value: l.id,
                  label: l.nama,
                }))}
                value={form.lokasi}
                onChange={(o) =>
                  setForm((p) => ({ ...p, lokasi: o }))
                }
                placeholder="Pilih lokasi sesuai jadwal..."
                noOptionsMessage={() =>
                  "Tidak ada lokasi lembur sesuai jadwal"
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Keterangan Lembur</label>
              <textarea rows={3} value={form.keterangan} onChange={(e) => setForm((p) => ({ ...p, keterangan: e.target.value })) } className="w-full rounded-lg border px-3 py-2 text-sm"/>
            </div>

            <button type="submit" disabled={submitLoading} className="w-full py-3 rounded-md bg-green-600 text-white font-semibold disabled:opacity-60">
              {submitLoading ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </div>
        </form>
      </MobileLayout>

      <Modal isOpen={infoOpen} onClose={() => setInfoOpen(false)} title="Ketentuan Pengajuan Lembur" note="Baca dengan teliti sebelum mengajukan lembur" size="md">
        <div className="space-y-4 text-sm leading-relaxed text-gray-800">

          <ul className="list-disc pl-5 space-y-3">

            <li>
              Pengajuan lembur <strong>WAJIB DIISI DENGAN JUJUR</strong> dan
              <strong> DAPAT DIPERTANGGUNGJAWABKAN</strong>.
              <br />
              Setiap data yang Anda isi akan dicatat sebagai dokumen resmi perusahaan.
            </li>

            <li>
              <strong>Lokasi lembur HARUS sesuai</strong> dengan lokasi yang telah
              <strong> dijadwalkan oleh Kepala Divisi</strong>.
              <br />
              Anda <strong>tidak dapat memilih lokasi di luar jadwal</strong> yang
              telah ditentukan.
            </li>

            <li>
              Mohon <strong>TELITI saat mengisi formulir</strong>.
              <br />
              Kesalahan input (tanggal, jam, lokasi, atau keterangan) dapat menyebabkan
              pengajuan <strong>DITOLAK</strong> atau dianggap
              <strong> TIDAK SAH</strong>.
            </li>

            <li>
              Jam lembur diisi dalam format <strong>JAM BULAT</strong>
              (tanpa menit).
              <br />
              Jika waktu lembur <strong>belum mencapai satu jam penuh</strong>,
              maka <strong>WAJIB menggunakan jam bulat sebelumnya</strong>.
            </li>

            <li>
              <strong>Contoh sederhana:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  Lembur mulai pukul <strong>18:10</strong> → isi <strong>18:00</strong>
                </li>
                <li>
                  Lembur selesai pukul <strong>21:45</strong> → isi <strong>21:00</strong>
                </li>
                <li>
                  Lembur dari <strong>18:50 – 19:20</strong> → isi
                  <strong> 18:00 – 19:00</strong>
                </li>
              </ul>
            </li>

            <li>
              Jam mulai dan jam selesai <strong>TIDAK BOLEH SAMA</strong>.
              <br />
              Jika diisi sama, sistem akan
              <strong> MENOLAK pengajuan secara otomatis</strong>.
            </li>

            <li>
              Keterangan lembur harus diisi dengan
              <strong> JELAS, SINGKAT, DAN SESUAI AKTIVITAS </strong>
              yang dikerjakan saat lembur.
            </li>

            <li>
              Seluruh pengajuan lembur akan
              <strong> DIVERIFIKASI</strong> dan tercatat dalam
              <strong> Riwayat Lembur</strong>.
            </li>

            <li>
              Pengajuan yang <strong>tidak sesuai ketentuan </strong>
              akan <strong>TIDAK DIPROSES</strong>
              tanpa pemberitahuan ulang.
            </li>
          </ul>
          <div className="pt-3 text-xs text-red-600 font-semibold">
            Catatan Penting: Kesalahan pengisian data sepenuhnya menjadi tanggung jawab pengaju.
          </div>
        </div>
      </Modal>

    </>
  );
}
