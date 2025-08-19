import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

const FormDinas = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [listNama, setListNama] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredNama, setFilteredNama] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ id_user: "", id_role: null,  nama: "", tanggal: "", jadwalTugas: "", jamBerangkat: "", setuju: false, kadiv: "",});

  // FETCH PROFIL NAMA
  const fetchNama = async () => {
    try {
      const res = await fetch(`${apiUrl}/surat-dinas/profil`);
      const data = await res.json();
      const arr = Array.isArray(data?.data) ? data.data : [];
      setListNama(arr);
      setFilteredNama(arr);
    } catch (err) {
      console.error("Gagal mengambil data nama:", err);
    }
  };

  useEffect(() => {
    fetchNama();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FILTER NAMA KETIKA KETIK
  useEffect(() => {
    if (!query) {
      setFilteredNama(listNama);
    } else {
      const q = query.toLowerCase();
      setFilteredNama(
        listNama.filter((item) => (item?.nama || "").toLowerCase().includes(q))
      );
    }
  }, [query, listNama]);

  // CLOSE DROPDOWN KETIKA KLIK DI LUAR
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // PILIH NAMA DARI DROPDOWN
  const handleSelect = (nama) => {
    const selected = listNama.find((item) => item.nama === nama);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        id_user: selected.id,
        id_role: selected.id_role,
        nama: selected.nama,
      }));
      setQuery(selected.nama);
      setShowDropdown(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "setuju") {
      setForm((prev) => ({ ...prev, setuju: e.target.checked }));
    } else if (name === "kadiv") {
      setForm((prev) => ({ ...prev, kadiv: value ? parseInt(value, 10) : "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDASI
    if (!form.setuju) {
      Swal.fire("Oops!", "Anda harus menyetujui perjanjian terlebih dahulu.", "warning");
      return;
    }
    if (!form.id_user || form.id_role == null) {
      Swal.fire("Peringatan", "Silakan pilih Nama dari daftar.", "warning");
      return;
    }

    const lastSubmit = localStorage.getItem("lastSubmit");
    if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < 60 * 1000) {
      Swal.fire(
        "Tunggu Sebentar",
        "Anda hanya dapat mengirim form ini satu kali setiap 1 menit.",
        "info"
      );
      return;
    }

    try {
      setLoading(true);

      // CATATAN: jika backend Anda sudah menerima key `id_role`,
      // ganti `bagian` menjadi `id_role` di payload.
      const payload = {
        id_user: form.id_user,
        nama: form.nama,
        tgl: form.tanggal,
        bagian: form.id_role, // ← ambil dari profil (id_role)
        // id_role: form.id_role, // ← gunakan baris ini bila endpoint pakai id_role
        jadwal: form.jadwalTugas,
        waktu: form.jamBerangkat,
        kadiv: form.kadiv,
      };

      const response = await fetch(`${apiUrl}/surat-dinas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal mengirim data");

      localStorage.setItem("lastSubmit", Date.now().toString());
      await response.json();

      Swal.fire(
        "Berhasil terkirim!",
        "Mohon tunggu konfirmasi dari Kepala Divisi nya melalui whatsapp ya!",
        "success"
      );

      // RESET FORM
      setForm({
        id_user: "",
        id_role: null,
        nama: "",
        tanggal: "",
        jadwalTugas: "",
        jamBerangkat: "",
        setuju: false,
        kadiv: "",
      });
      setQuery("");
      setShowDropdown(false);
    } catch (error) {
      Swal.fire("Gagal", error.message || "Terjadi kesalahan saat mengirim data.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/wall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed", backgroundBlendMode: "overlay", backgroundColor: "rgba(0, 0, 0, 0.25)",}}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-2 sm:space-y-3">
        <h2 className="text-lg sm:text-2xl font-bold text-center text-[#326058]">
          Formulir Dinas keluar kantor <br /> PT Nico Urban Indonesia
        </h2>

        {/* Nama */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Nama</label>
          <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setShowDropdown(true);}} onFocus={() => setShowDropdown(true)} required className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:px-3 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition" placeholder="Ketik atau pilih nama"/>
          {showDropdown && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-md max-h-60 overflow-y-auto">
              {filteredNama.length > 0 ? (
                filteredNama.map((item) => (
                  <li key={item.id} className="px-4 py-2 cursor-pointer hover:bg-green-100 text-sm" onClick={() => handleSelect(item.nama)}>
                    {item.nama}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500 text-sm">Tidak ditemukan</li>
              )}
            </ul>
          )}
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Tanggal</label>
          <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"/>
        </div>

        {/* Kepala Divisi */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Kepala Divisi</label>
          <select name="kadiv" value={form.kadiv} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition">
            <option value="">Pilih Kadiv</option>
            {listNama
              .filter((profil) => profil.id_role === 5 || profil.id_role === 20)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
          </select>
        </div>

        {/* Jadwal Tugas */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Jadwal Tugas Ke</label>
          <textarea name="jadwalTugas" value={form.jadwalTugas} onChange={handleChange} rows="2" required className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition" placeholder="Deskripsikan tujuan tugas dinas"/>
        </div>

        {/* Jam Berangkat */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Berangkat Jam</label>
          <input type="time" name="jamBerangkat" value={form.jamBerangkat} onChange={handleChange} required className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"/>
        </div>

        {/* Persetujuan */}
        <div>
          <label className="flex items-start space-x-2 text-xs text-justify sm:text-xs text-red-600 font-medium">
            <input type="checkbox" name="setuju" checked={form.setuju} onChange={handleChange} className="h-3 w-5 mt-1 text-red-600 rounded focus:ring-2 focus:ring-red-500"/>
            <span>
              Saya menyatakan bahwa seluruh data yang saya isikan adalah benar. Saya memahami bahwa
              <b> setiap bentuk kebohongan, manipulasi, atau penyalahgunaan data </b> akan dikenakan sanksi sesuai aturan
              perusahaan, termasuk namun tidak terbatas pada:<b> penurunan jabatan, pemotongan gaji, atau pemutusan hubungan kerja secara sepihak. </b>
            </span>
          </label>
        </div>

        {/* Tombol Submit */}
        <button type="submit" disabled={loading} className={`w-full ${loading ? "bg-gray-400" : "bg-[#326058] hover:bg-[#326058]"} text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md`}>
          {loading ? "Mengirim..." : "Kirim Form"}
        </button>

        {/* Tombol Kembali */}
        <button type="button" onClick={() => window.history.back()} className="w-full mt-3 border-2 border-[#326058] text-[#326058] py-3 rounded-xl font-semibold hover:bg-green-50 transition duration-300">
          Kembali
        </button>

        {/* Link Login */}
        <div className="pt-4 text-center text-sm">
          <a href="/login" className="text-gray-700 hover:underline">
            Sudah punya akun? <span className="text-[#326058] font-semibold">Login</span>
          </a>
        </div>
      </form>
    </div>
  );
};

export default FormDinas;
