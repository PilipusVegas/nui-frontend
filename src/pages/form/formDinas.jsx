import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const FormDinas = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [form, setForm] = useState({
    nama: '',
    tanggal: '',
    bagian: null,
    jadwalTugas: '',
    jamBerangkat: '',
    setuju: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'bagian') {
      setForm((prev) => ({
        ...prev,
        bagian: checked ? parseInt(value, 10) : null,
      }));
    } else if (name === 'setuju') {
      setForm((prev) => ({ ...prev, setuju: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.setuju) {
      Swal.fire('Oops!', 'Anda harus menyetujui perjanjian terlebih dahulu.', 'warning');
      return;
    }

    if (form.bagian === null) {
      Swal.fire('Peringatan', 'Anda harus memilih salah satu bagian.', 'warning');
      return;
    }

    const lastSubmit = localStorage.getItem('lastSubmit');
    if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < 60 * 1000) {
      Swal.fire('Tunggu Sebentar', 'Anda hanya dapat mengirim form ini satu kali setiap 1 menit.', 'info');
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
      };

      const response = await fetch(`${apiUrl}/surat-dinas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim data');
      }

      localStorage.setItem('lastSubmit', Date.now().toString());

      const data = await response.json();
      console.log('Data dikirim:', data);

      Swal.fire('Berhasil!', 'Form berhasil dikirim!', 'success');

      setForm({
        nama: '',
        tanggal: '',
        bagian: null,
        jadwalTugas: '',
        jamBerangkat: '',
        setuju: false,
      });
    } catch (error) {
      Swal.fire('Gagal', error.message || 'Terjadi kesalahan saat mengirim data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/wall.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0, 0, 0, 0.25)",
      }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 space-y-3"
      >
        <h2 className="text-lg sm:text-3xl font-bold text-center text-green-700">
          Formulir Dinas <br /> PT Nico Urban Indonesia
        </h2>

        {/* Nama */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Nama</label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Tanggal</label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
        </div>

        {/* Bagian */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Bagian</label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center space-x-2 text-gray-600">
              <input
                type="checkbox"
                name="bagian"
                value="2"
                checked={form.bagian === 2}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-green-600"
              />
              <span>Divisi IT</span>
            </label>
            <label className="inline-flex items-center space-x-2 text-gray-600">
              <input
                type="checkbox"
                name="bagian"
                value="3"
                checked={form.bagian === 3}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-green-600"
              />
              <span>Divisi Teknisi</span>
            </label>
            <label className="inline-flex items-center space-x-2 text-gray-600">
              <input
                type="checkbox"
                name="bagian"
                value="6"
                checked={form.bagian === 6}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-green-600"
              />
              <span>Staff HRD</span>
            </label>
          </div>
        </div>

        {/* Jadwal Tugas */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Jadwal Tugas Ke</label>
          <textarea
            name="jadwalTugas"
            value={form.jadwalTugas}
            onChange={handleChange}
            rows="3"
            required
            className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            placeholder="Deskripsikan tujuan tugas dinas"
          />
        </div>

        {/* Jam Berangkat */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Berangkat Jam</label>
          <input
            type="time"
            name="jamBerangkat"
            value={form.jamBerangkat}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
        </div>

        {/* Persetujuan */}
        <div>
          <label className="flex items-start space-x-2 text-xs text-justify sm:text-sm text-red-600 font-medium">
            <input
              type="checkbox"
              name="setuju"
              checked={form.setuju}
              onChange={handleChange}
              className="h-5 w-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
            />
            <span>
              Saya menyatakan bahwa seluruh data yang saya isikan adalah benar. Saya memahami bahwa
              <b> setiap bentuk kebohongan, manipulasi, atau penyalahgunaan data </b> akan dikenakan sanksi
              sesuai aturan perusahaan, termasuk namun tidak terbatas pada:
              <b> penurunan jabatan, pemotongan gaji, atau pemutusan hubungan kerja secara sepihak. </b>
            </span>
          </label>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md`}
        >
          {loading ? 'Mengirim...' : 'Kirim Form'}
        </button>

        {/* Tombol Kembali */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-full mt-3 border-2 border-green-600 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition duration-300"
        >
          Kembali
        </button>

        {/* Link Login */}
        <div className="pt-4 text-center text-sm">
          <a href="/login" className="text-gray-700 hover:underline">
            Sudah punya akun? <span className="text-green-600 font-semibold">Login</span>
          </a>
        </div>
      </form>
    </div>
  );
};

export default FormDinas;
