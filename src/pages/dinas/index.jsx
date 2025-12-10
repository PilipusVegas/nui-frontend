import React, { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

export default function SuratDinasPage() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [namaOptions, setNamaOptions] = useState([]);
  const [profilLoading, setProfilLoading] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

  const [form, setForm] = useState({
    id_user: null,
    nama: "",
    kategori: null,
    keterangan: "",
    tgl_berangkat: "",
    tgl_pulang: "",
    waktu: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // ==========================================================
  // LOAD PROFIL
  // ==========================================================
  useEffect(() => {
    const loadProfil = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/surat-dinas/profil`);
        if (!res.ok) throw new Error();
        const result = await res.json();

        const allEmployees = result.data.map((u) => ({
          value: u.id_user,
          label: u.nama_user,
        }));

        setNamaOptions(allEmployees);
      } catch {
        toast.error("Gagal memuat data profil.");
      } finally {
        setProfilLoading(false);
      }
    };
    loadProfil();
  }, [apiUrl]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ==========================================================
  // SUBMIT FORM
  // ==========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirm) {
      toast.error("Anda wajib menyetujui pernyataan kebenaran data.");
      return;
    }

    if (!form.id_user || !form.kategori || !form.tgl_berangkat || !form.waktu) {
      toast.error("Lengkapi seluruh data wajib.");
      return;
    }

    if (form.kategori.value === 2 && !form.tgl_pulang) {
      toast.error("Tanggal pulang wajib untuk perjalanan luar kota.");
      return;
    }

    if (
      form.kategori.value === 2 &&
      new Date(form.tgl_pulang) < new Date(form.tgl_berangkat)
    ) {
      toast.error("Tanggal pulang tidak boleh lebih awal dari tanggal berangkat.");
      return;
    }

    const tanggalInfo =
      form.kategori.value === 2
        ? `dari ${form.tgl_berangkat} sampai ${form.tgl_pulang}`
        : `pada ${form.tgl_berangkat}`;
    const jamInfo = `pukul ${form.waktu}`;

    const result = await Swal.fire({
      title: "Konfirmasi Pengajuan",
      html: `
        Apakah Anda yakin melakukan perjalanan dinas 
        <b>${tanggalInfo}</b> ${jamInfo}?<br>
        Data akan diproses secara resmi.
      `,
      icon: "question",
      confirmButtonText: "Ya, Kirim",
      cancelButtonText: "Batal",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

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
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Pengajuan berhasil dikirim.");

      setForm({
        id_user: null,
        nama: "",
        kategori: null,
        keterangan: "",
        tgl_berangkat: "",
        tgl_pulang: "",
        waktu: "",
      });
      setConfirm(false);
    } catch {
      toast.error("Terjadi kesalahan saat mengirim data.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (profilLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Memuat data…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-3">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white/90 backdrop-blur border border-emerald-100 rounded-3xl shadow-2xl p-6 pb-7 space-y-5">
        <header className="text-center border-b border-emerald-200 pb-4">
          <h1 className="text-xl font-bold tracking-wide text-emerald-800">
            Formulir Perjalanan Dinas
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Globalindo Group
          </p>
        </header>
        <div className="rounded-xl overflow-hidden border border-blue-300 shadow bg-white">
          <div onClick={() => setInfoOpen(!infoOpen)} className="flex justify-between items-center cursor-pointer bg-blue-100 px-4 py-3">
            <div className="flex items-center gap-2 text-blue-800 font-semibold">
              <FontAwesomeIcon icon={faCircleInfo} />
              Panduan Pengisian Formulir
            </div>
            <FontAwesomeIcon icon={infoOpen ? faChevronUp : faChevronDown} className="text-blue-800"/>
          </div>

          {infoOpen && (
            <div className="px-4 py-4 bg-blue-50 text-blue-900 text-sm space-y-4 border-t border-blue-300">

              {/* TITLE */}
              <p className="font-bold text-blue-900">
                Informasi Wajib Dibaca Sebelum Mengajukan:
              </p>

              {/* POINTS */}
              <ul className="list-disc list-inside space-y-2 leading-relaxed">

                <li>
                  Semua data pada formulir ini adalah
                  <span className="font-semibold"> wajib diisi </span>
                  untuk memastikan proses perjalanan dinas berjalan lancar.
                </li>

                <li>
                  Pengisian harus menggunakaN
                  <span className="font-semibold"> Nama Masing-Masing </span>
                  untuk menghindari kesalahan identitas dan mencegah penyalahgunaan.
                </li>

                <li>
                  Jika Anda pergi keluar kota,
                  <span className="font-semibold"> cukup isi satu kali </span>
                  dengan rentang tanggal berangkat dan pulang.
                  Sistem akan otomatis mencatat seluruh periode perjalanan Anda.
                </li>

                <li>
                  Pastikan memilih
                  <span className="font-semibold"> kategori perjalanan </span>
                  yang benar (Dalam Kota / Luar Kota) agar proses persetujuan lebih cepat.
                </li>

                <li>
                  Isi tanggal dan waktu keberangkatan secara
                  <span className="font-semibold"> akurat dan jujur. </span>
                  Keterangan yang tidak sesuai dapat menghambat proses dinas,
                  menimbulkan revisi, dan dapat dianggap sebagai pelanggaran.
                </li>

                <li>
                  Tulis tujuan perjalanan dengan
                  <span className="font-semibold"> jelas, singkat, dan langsung pada maksudnya </span>
                  agar mudah dipahami oleh pihak yang memverifikasi.
                </li>

              </ul>

              {/* FOOTNOTE */}
              <p className="text-xs text-blue-700 leading-relaxed pt-1">
                Pengajuan yang diisi dengan lengkap, benar, dan jujur akan mempercepat proses validasi,
                mencegah kesalahan data, dan membantu memastikan perjalanan dinas Anda tercatat resmi sesuai aturan.
              </p>
            </div>
          )}
        </div>
        {/* Nama */}
        <section>
          <label className="block text-sm font-semibold text-gray-900">
            Nama Karyawan <span className="text-red-600">*</span>
          </label>
          <Select
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: "#d1d5db",
                ":hover": { borderColor: "#10b981" },
              }),
            }}
            options={namaOptions}
            value={form.id_user}
            onChange={(v) => {
              handleChange("id_user", v);
              handleChange("nama", v?.label || "");
            }}
            placeholder="Pilih Nama"
          />
        </section>

        {/* Kategori */}
        <section>
          <label className="block text-sm font-semibold text-gray-900">
            Kategori Perjalanan <span className="text-red-600">*</span>
          </label>
          <Select
            options={[
              { value: 1, label: "Dalam Kota" },
              { value: 2, label: "Luar Kota" },
            ]}
            value={form.kategori}
            onChange={(v) => handleChange("kategori", v)}
            placeholder="Pilih Kategori"
          />
        </section>

        {/* Tanggal */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Tanggal Berangkat <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              className="mt-2 w-full border border-gray-300 rounded-lg p-3 text-sm"
              value={form.tgl_berangkat}
              onChange={(e) => handleChange("tgl_berangkat", e.target.value)}
            />
          </div>

          {form.kategori?.value === 2 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Tanggal Pulang <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                className="mt-2 w-full border border-gray-300 rounded-lg p-3 text-sm"
                value={form.tgl_pulang}
                onChange={(e) => handleChange("tgl_pulang", e.target.value)}
              />
            </div>
          )}
        </section>

        {/* Jam */}
        <section>
          <label className="block text-sm font-semibold text-gray-900">
            Jam Berangkat <span className="text-red-600">*</span>
          </label>
          <input
            type="time"
            className="mt-2 w-full border border-gray-300 rounded-lg p-3 text-sm"
            value={form.waktu}
            onChange={(e) => handleChange("waktu", e.target.value)}
          />
        </section>

        {/* Keterangan */}
        <section>
          <label className="block text-sm font-semibold text-gray-900">
            Keterangan Tugas <span className="text-red-600">*</span>
          </label>
          <textarea
            className="mt-2 w-full border border-gray-300 rounded-lg p-3 text-sm"
            rows="3"
            placeholder="Tuliskan tujuan perjalanan..."
            value={form.keterangan}
            onChange={(e) => handleChange("keterangan", e.target.value)}
          />
        </section>

        {/* Konfirmasi */}
        <section
          className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start gap-3 cursor-pointer"
          onClick={() => setConfirm(!confirm)}
        >
          <input
            type="checkbox"
            id="confirm"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
            className="mt-1 accent-emerald-600 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />

          <label
            htmlFor="confirm"
            className="text-[11px] text-gray-900 leading-snug cursor-pointer"
          >
            Saya menyatakan bahwa seluruh data yang saya isi
            <strong> benar dan dapat dipertanggungjawabkan.</strong>
          </label>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitLoading}
          className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold tracking-wide shadow-md transition disabled:opacity-50"
        >
          {submitLoading ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </form>
    </div>
  );
}
