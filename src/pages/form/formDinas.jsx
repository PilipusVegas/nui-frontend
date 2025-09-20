import React, { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSuitcaseRolling } from "@fortawesome/free-solid-svg-icons";

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
          value: u.id,
          label: u.nama,
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

    // --- Validasi awal ---
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
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white shadow-md rounded-xl p-5 pb-12 space-y-3 border border-green-100">
        {/* Header */}
        <div className="mb-1 border-b border-gray-300 pb-2">
          <h1 className="text-xl font-extrabold text-emerald-700 tracking-tight">
            <FontAwesomeIcon icon={faSuitcaseRolling} className="text-emerald-700 mr-2" />
            Formulir Resmi Perjalanan Dinas
          </h1>
          <p className="text-xs text-gray-800 mt-1 font-medium">
            Globalindo Group · Pengajuan Resmi Perjalanan Dinas
          </p>
        </div>

        {/* Nama Karyawan */}
        <div>
          <label className="block text-xs font-medium text-gray-800">
            Nama Karyawan<span className="text-red-600">*</span>
          </label>
          <p className="text-[10px] text-gray-600 mb-1">
            Pilih karyawan yang akan melaksanakan perjalanan dinas.
          </p>
          <Select options={namaOptions} value={form.id_user} onChange={(v) => handleChange("id_user", v) || handleChange("nama", v?.label || "") } placeholder="Pilih Nama Karyawan"/>
        </div>

        {/* Kategori Dinas */}
        <div>
          <label className="block text-xs font-medium text-gray-800">
            Kategori Perjalanan<span className="text-red-600">*</span>
          </label>
          <p className="text-[10px] text-gray-600 mb-1">
            <strong>Dalam Kota</strong>: hanya memerlukan tanggal berangkat.
            <strong> Luar Kota</strong>: wajib mengisi tanggal pulang.
          </p>
          <Select options={[
              { value: 1, label: "Dalam Kota" },
              { value: 2, label: "Luar Kota" },
            ]}
            value={form.kategori}
            onChange={(v) => handleChange("kategori", v)}
            placeholder="Pilih Kategori Perjalanan"
          />
        </div>

        {/* Tanggal */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-800">
              Tanggal Berangkat<span className="text-red-600">*</span>
            </label>
            <p className="text-[10px] text-gray-600 mb-1">
              Isi tanggal dimulainya perjalanan dinas.
            </p>
            <input type="date" className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-green-400" value={form.tgl_berangkat} onChange={(e) => handleChange("tgl_berangkat", e.target.value)}/>
          </div>
          {form.kategori?.value === 2 && (
            <div>
              <label className="block text-xs font-medium text-gray-800">
                Tanggal Pulang<span className="text-red-600">*</span>
              </label>
              <p className="text-[10px] text-gray-600 mb-1">
                Wajib diisi untuk perjalanan dinas luar kota.
              </p>
              <input type="date" className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-green-400" value={form.tgl_pulang} onChange={(e) => handleChange("tgl_pulang", e.target.value)}/>
            </div>
          )}
        </div>

        {/* Jam */}
        <div>
          <label className="block text-xs font-medium text-gray-800">
            Jam Berangkat<span className="text-red-600">*</span>
          </label>
          <p className="text-[10px] text-gray-600 mb-1">
            Cantumkan jam keberangkatan sesuai rencana.
          </p>
          <input type="time" className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-green-400" value={form.waktu} onChange={(e) => handleChange("waktu", e.target.value)}/>
        </div>

        {/* Kepala Divisi */}
        <div>
          <label className="block text-xs font-medium text-gray-800">
            Kepala Divisi Penanggung Jawab<span className="text-red-600">*</span>
          </label>
          <p className="text-[10px] text-gray-600 mb-1">
            Pilih kepala divisi penanggung jawab.
          </p>
          <Select options={kadivOptions} value={form.id_kadiv} onChange={(v) => handleChange("id_kadiv", v)} placeholder="Pilih Kepala Divisi"/>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-medium text-gray-800">
            Keterangan Tugas<span className="text-red-600">*</span>
          </label>
          <p className="text-[10px] text-gray-600 mb-1">
            Tuliskan tujuan atau deskripsi singkat tugas perjalanan dinas.
          </p>
          <textarea className="w-full border rounded-md p-2 text-sm focus:ring-1 focus:ring-green-400" rows="2" value={form.keterangan} onChange={(e) => handleChange("keterangan", e.target.value)} placeholder="Tuliskan tujuan/deskripsi tugas"/>
        </div>

        {/* Konfirmasi */}
        <div className="flex items-start space-x-2 border-t p-3">
          <input type="checkbox" id="confirm" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1"/>
          <label htmlFor="confirm" className="text-[10px] text-gray-700 leading-snug">
            Dengan ini saya menyatakan bahwa seluruh data yang saya isi adalah
            <strong> benar, sah, dan dapat dipertanggungjawabkan</strong>.
            Saya memahami bahwa setiap penyalahgunaan atau pemberian data palsu
            dapat berakibat <strong>sanksi tegas</strong> sesuai kebijakan
            perusahaan.
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitLoading} className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition disabled:opacity-50 text-sm font-semibold">
          {submitLoading ? "Mengirim..." : "Kirim Pengajuan Dinas"}
        </button>
      </form>
    </div>
  );

}
