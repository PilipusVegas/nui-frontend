import React, { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";

export default function SuratDinasPage() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [namaOptions, setNamaOptions] = useState([]);
  const [kadivOptions, setKadivOptions] = useState([]);
  const [profilLoading, setProfilLoading] = useState(true);
  const [form, setForm] = useState({
    id_user: null,
    nama: "",
    kategori: null,
    keterangan: "",
    tgl_berangkat: "",
    tgl_pulang: "",
    waktu: "",
    id_kadiv: null,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const loadProfil = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/surat-dinas/profil`);
        if (!res.ok) throw new Error();
        const result = await res.json();

        const allEmployees = result.data.map((u) => ({
          value: u.id_user,
          label: u.nama_user,
          id_role: u.id_role,
        }));

        setNamaOptions(allEmployees);

        const kadivFiltered = allEmployees
          .filter((u) => [4, 5, 20].includes(u.id_role))
          .map((u) => ({ value: u.value, label: u.label }));
        setKadivOptions(kadivFiltered);
      } catch {
        toast.error("Gagal memuat data profil");
      } finally {
        setProfilLoading(false);
      }
    };
    loadProfil();
  }, [apiUrl]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /** ✅ Submit dengan konfirmasi Swal */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirm) {
      toast.error("Anda harus menyetujui pernyataan kebenaran data.");
      return;
    }
    if (
      !form.id_user ||
      !form.kategori ||
      !form.tgl_berangkat ||
      !form.waktu ||
      !form.id_kadiv
    ) {
      toast.error("Lengkapi seluruh data wajib.");
      return;
    }
    if (form.kategori.value === 2 && !form.tgl_pulang) {
      toast.error("Tanggal pulang wajib diisi untuk dinas luar kota.");
      return;
    }

    // ✅ Validasi tanggal pulang ≥ tanggal berangkat
    if (
      form.kategori.value === 2 &&
      new Date(form.tgl_pulang) < new Date(form.tgl_berangkat)
    ) {
      toast.error("Tanggal pulang tidak boleh lebih awal dari tanggal berangkat.");
      return;
    }

    // --- Rangkai teks konfirmasi ---
    const tanggalInfo =
      form.kategori.value === 2
        ? `dari ${form.tgl_berangkat} sampai ${form.tgl_pulang}`
        : `pada ${form.tgl_berangkat}`;
    const jamInfo = `pukul ${form.waktu}`;
    const kadivNama = form.id_kadiv?.label || "—";

    const textKonfirmasi = `
      Apakah Anda benar-benar melakukan perjalanan dinas 
      ${tanggalInfo} ${jamInfo}
      dengan Kepala Divisi penanggung jawab: <b>${kadivNama}</b> ?
    `;

    // --- Tampilkan dialog konfirmasi ---
    const result = await Swal.fire({
      title: "Konfirmasi Perjalanan Dinas",
      html: textKonfirmasi,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Kirim",
      cancelButtonText: "Batal",
      confirmButtonColor: "#059669", // hijau tegas
      cancelButtonColor: "#d33",
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    // --- Kirim ke server bila disetujui ---
    setSubmitLoading(true);
    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_user: form.id_user.value,
          nama: form.nama,
          kategori: form.kategori.value,
          keterangan: form.keterangan,
          tgl_berangkat: form.tgl_berangkat,
          tgl_pulang: form.kategori.value === 2 ? form.tgl_pulang : null,
          waktu: form.waktu,
          id_kadiv: form.id_kadiv.value,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Form berhasil dikirim");
      // Reset form
      setForm({
        id_user: null,
        nama: "",
        kategori: null,
        keterangan: "",
        tgl_berangkat: "",
        tgl_pulang: "",
        waktu: "",
        id_kadiv: null,
      });
      setConfirm(false);
    } catch {
      toast.error("Terjadi kesalahan pengiriman");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (profilLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Memuat data profil…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-3">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white/90 backdrop-blur border border-emerald-100 rounded-3xl shadow-2xl p-6 pb-8 space-y-4">
        {/* Header */}
        <header className="text-center border-b border-emerald-200 pb-4">
          <h1 className="text-xl font-bold tracking-wide text-emerald-800">
            Formulir Perjalanan Dinas
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Globalindo Group
          </p>
        </header>

        {/* Nama Karyawan */}
        <section>
          <label className="block text-sm font-semibold tracking-wide text-gray-900">
            Nama Karyawan<span className="text-red-600">*</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 mb-2">
            Pilih karyawan yang akan melaksanakan perjalanan dinas.
          </p>
          <Select classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#d1d5db",
                boxShadow: "none",
                ":hover": { borderColor: "#10b981" },
              }),
            }}
            options={namaOptions}
            value={form.id_user}
            onChange={(v) => {
              handleChange("id_user", v);
              handleChange("nama", v?.label || "");
            }}
            placeholder="Pilih Nama Karyawan"
          />
        </section>

        {/* Kategori Perjalanan */}
        <section>
          <label className="block text-sm font-semibold tracking-wide text-gray-900">
            Kategori Perjalanan<span className="text-red-600">*</span>
          </label>
          <p className="text-[10px] text-gray-700 mt-0.5 mb-2 tracking-wide">
            <strong>Dalam Kota:</strong> hanya tanggal berangkat. <br />
            <strong>Luar Kota:</strong> wajib isi tanggal pulang.
          </p>
          <Select
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#d1d5db",
                ":hover": { borderColor: "#10b981" },
              }),
            }}
            options={[
              { value: 1, label: "Dalam Kota" },
              { value: 2, label: "Luar Kota" },
            ]}
            value={form.kategori}
            onChange={(v) => handleChange("kategori", v)}
            placeholder="Pilih Kategori Perjalanan"
          />
        </section>

        {/* Tanggal */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Tanggal Berangkat<span className="text-red-600">*</span>
            </label>
            <input type="date" className="mt-2 w-full border border-gray-300 rounded-lg p-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" value={form.tgl_berangkat} onChange={(e) => handleChange("tgl_berangkat", e.target.value)} />
          </div>
          {form.kategori?.value === 2 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Tanggal Pulang<span className="text-red-600">*</span>
              </label>
              <input type="date" className="mt-2 w-full border border-gray-300 rounded-lg p-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" value={form.tgl_pulang} onChange={(e) => handleChange("tgl_pulang", e.target.value)} />
            </div>
          )}
        </section>

        {/* Jam */}
        <section>
          <label className="block text-sm font-semibold text-gray-900">
            Jam Berangkat<span className="text-red-600">*</span>
          </label>
          <input type="time" className="mt-2 w-full border border-gray-300 rounded-lg p-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" value={form.waktu} onChange={(e) => handleChange("waktu", e.target.value)} />
        </section>

        {/* Kepala Divisi */}
        <section>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Kepala Divisi Penanggung Jawab<span className="text-red-600">*</span>
          </label>
          <Select
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#d1d5db",
                ":hover": { borderColor: "#10b981" },
              }),
            }}
            options={kadivOptions}
            value={form.id_kadiv}
            onChange={(v) => handleChange("id_kadiv", v)}
            placeholder="Pilih Kepala Divisi"
          />
        </section>

        {/* Keterangan */}
        <section>
          <label className="block text-sm font-semibold text-gray-900">
            Keterangan Tugas<span className="text-red-600">*</span>
          </label>
          <textarea className="mt-2 w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-emerald-500 focus:ring-emerald-500" rows="3" placeholder="Tuliskan tujuan/deskripsi tugas" value={form.keterangan} onChange={(e) => handleChange("keterangan", e.target.value)} />
        </section>

        {/* Konfirmasi */}
        <section className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-4 flex items-start gap-3">
          <input type="checkbox" id="confirm" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1 accent-emerald-600" />
          <label htmlFor="confirm" className="text-[10px] text-gray-800 leading-snug tracking-wide">
            Dengan ini saya menyatakan seluruh data yang saya isi
            <strong> benar, sah, dan dapat dipertanggungjawabkan</strong>.
          </label>
        </section>

        {/* Submit */}
        <button type="submit" disabled={submitLoading} className=" w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold tracking-wide shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed">
          {submitLoading ? "Mengirim..." : "Kirim Pengajuan Dinas"}
        </button>
      </form>
    </div>
  );

}
