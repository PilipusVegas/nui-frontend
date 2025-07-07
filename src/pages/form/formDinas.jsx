import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

const FormDinas = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [listNama, setListNama] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredNama, setFilteredNama] = useState(listNama);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); 
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ nama: "", nomorTelepon: "", divisi: "" });
  const [kadivList, setKadivList] = useState([]);


  const fetchNama = async () => {
    try {
      const res = await fetch(`${apiUrl}/profil`);
      const data = await res.json();
      setListNama(data.data);
    } catch (err) {
      console.error("Gagal mengambil data nama:", err);
    }
  };
  
  useEffect(() => {
    fetchNama();
  }, []);
  
  

  useEffect(() => {
    if (query === "") {
      setFilteredNama(listNama);
    } else {
      setFilteredNama(
        listNama.filter((item) => item.nama.toLowerCase().includes(query.toLowerCase()))
      );
    }
  }, [query, listNama]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (nama) => {
    const selected = listNama.find((item) => item.nama === nama);
  
    if (selected) {
      setForm((prev) => ({
        ...prev,
        nama: selected.nama,
        kadiv: selected.kadiv, 
      }));
      setQuery(selected.nama);
      setShowDropdown(false);
    }
  };
  

  const [form, setForm] = useState({
    nama: "",
    tanggal: "",
    bagian: null,
    jadwalTugas: "",
    jamBerangkat: "",
    setuju: false,
    kadiv: "",
  });



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (name === "bagian") {
      setForm((prev) => ({
        ...prev,
        bagian: value ? parseInt(value, 10) : null,
      }));
    } else if (name === "setuju") {
      setForm((prev) => ({ ...prev, setuju: checked }));
    } else if (name === "kadiv") {
      setForm((prev) => ({
        ...prev,
        kadiv: value ? parseInt(value, 10) : null,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.setuju) {
      Swal.fire("Oops!", "Anda harus menyetujui perjanjian terlebih dahulu.", "warning");
      return;
    }
    if (form.bagian === null) {
      Swal.fire("Peringatan", "Anda harus memilih salah satu bagian.", "warning");
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

      const payload = {
        nama: form.nama,
        tgl: form.tanggal,
        bagian: form.bagian,
        jadwal: form.jadwalTugas,
        waktu: form.jamBerangkat,
        kadiv: form.kadiv, // 🟢 Tambahkan ini
      };
      

      const response = await fetch(`${apiUrl}/surat-dinas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal mengirim data");
      }
      localStorage.setItem("lastSubmit", Date.now().toString());

      const data = await response.json();
      console.log("Data dikirim:", data);

      Swal.fire(
        "Berhasil terkirim!",
        "Mohon tunggu konfirmasi dari Kepala Divisi nya melalui whatsapp ya!",
        "success"
      );

      setForm({
        nama: "",
        tanggal: "",
        bagian: null,
        jadwalTugas: "",
        jamBerangkat: "",
        setuju: false,
        kadiv: "", 
      });
      
    } catch (error) {
      Swal.fire("Gagal", error.message || "Terjadi kesalahan saat mengirim data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "bagian") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10), 
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 2. Di dalam handleSubmitRegistration:
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.nohp || !formData.bagian) {
      Swal.fire("Oops!", "Semua field harus diisi.", "warning");
      return;
    }

    try {
      const payload = {
        nama: formData.nama,
        nohp: formData.nohp,
        bagian: formData.bagian,
      };

      const response = await fetch(`${apiUrl}/surat-dinas/regis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal mendaftar, coba lagi.");
      }

      const data = await response.json();
      console.log("Registrasi berhasil:", data);

      Swal.fire("Pendaftaran berhasil!", "Akun Anda telah terdaftar", "success");
      setIsOpen(false);

      // 🟢 Refresh data nama
      fetchNama();

    } catch (error) {
      Swal.fire("Gagal", error.message || "Terjadi kesalahan saat mendaftar.", "error");
    }
  };


  useEffect(() => {
    const fetchDivisi = async () => {
      try {
        const response = await fetch(`${apiUrl}/karyawan/divisi`);
        const data = await response.json();
        setDivisiList(data);
      } catch (error) {
        console.error("Gagal mengambil data divisi:", error);
      }
    };
  
    fetchDivisi();
  }, []);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4" style={{ backgroundImage: "url('/wall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed", backgroundBlendMode: "overlay", backgroundColor: "rgba(0, 0, 0, 0.25)",  }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-2 sm:space-y-3"
      >
        <h2 className="text-lg sm:text-2xl font-bold text-center text-[#326058]">
          Formulir Dinas keluar kantor <br /> PT Nico Urban Indonesia
        </h2>

        {/* Nama */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Nama</label>
          <input type="text" value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            required
            className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:px-3 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            placeholder="Ketik atau pilih nama"
          />
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

        <div className="text-sm font-semibold">
          Nama belum terdaftar?{" "}
          <span onClick={() => setIsOpen(true)} className="cursor-pointer font-bold text-green-600 hover:text-green-700">
            Register
          </span>
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Tanggal</label>
          <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"/>
        </div>

        {/* Bagian */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Bagian</label>
          <select name="bagian" value={form.bagian} onChange={handleChange} className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition">
            <option value="">Pilih Bagian</option>
            {divisiList.map((divisi) => (
              <option key={divisi.id} value={divisi.id}>
                {divisi.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Kepala Divisi</label>
          <select
            name="kadiv"
            value={form.kadiv}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          >
            <option value="">Pilih Kadiv</option>
            {listNama
              .filter((profil) => profil.id_role === 5) 
              .map((divisi) => (
                <option key={divisi.id} value={divisi.id}>
                  {divisi.nama}
                </option>
              ))}
          </select>
        </div>

        {/* Jadwal Tugas */}
        <div>
          <label className="block text-gray-700 font-medium mb-1 text-sm">Jadwal Tugas Ke</label>
          <textarea name="jadwalTugas" value={form.jadwalTugas} onChange={handleChange} rows="2" required className="w-full rounded-xl border border-gray-300 px-3 py-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition" placeholder="Deskripsikan tujuan tugas dinas" />
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
              <b> setiap bentuk kebohongan, manipulasi, atau penyalahgunaan data </b> akan dikenakan
              sanksi sesuai aturan perusahaan, termasuk namun tidak terbatas pada:
              <b>
                {" "}
                penurunan jabatan, pemotongan gaji, atau pemutusan hubungan kerja secara sepihak.{" "}
              </b>
            </span>
          </label>
        </div>

        {/* Tombol Submit */}
        <button type="submit" disabled={loading}
          className={`w-full ${
            loading ? "bg-gray-400" : "bg-[#326058] hover:bg-[#326058]"
          } text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md`}
        >
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

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
              Formulir Pendaftaran
            </h2>
            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} required className="mt-1 w-full border rounded-md px-3 py-2 text-sm shadow-sm focus:ring focus:ring-green-200"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                <input type="tel" name="nohp" value={formData.nohp} onChange={handleInputChange} required className="mt-1 w-full border rounded-md px-3 py-2 text-sm shadow-sm focus:ring focus:ring-green-200"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Divisi</label>
                <select name="bagian" value={formData.bagian} onChange={handleInputChange} required className="mt-1 w-full border rounded-md px-3 py-2 text-sm shadow-sm focus:ring focus:ring-green-200">
                <option value="">Pilih Bagian</option>
                  {divisiList.map((divisi) => (
                    <option key={divisi.id} value={divisi.id}>
                      {divisi.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-400 rounded-md hover:bg-gray-400 text-sm text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#326058] text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Daftar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormDinas;
