import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const TambahKaryawan = () => {
  const navigate = useNavigate();
  const [divisiList, setDivisiList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    nama: "",
    id_perusahaan: "",
    id_role: "",
    id_shift: "",
    telp: "",
    username: "",
    password: "",
    status: 1,
  });
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [divisiRes, shiftRes, perusahaanRes] = await Promise.all([
          fetch(`${apiUrl}/karyawan/divisi`),
          fetch(`${apiUrl}/shift`),
          fetch(`${apiUrl}/perusahaan`),
        ]);
        const divisiData = await divisiRes.json();
        const shiftData = await shiftRes.json();
        const perusahaanData = await perusahaanRes.json();
        setPerusahaanList(perusahaanData.data);
        setDivisiList(divisiData);
        setShiftList(shiftData.data);
      } catch (err) {
        console.error("Gagal fetch data tambahan", err);
      }
    };
    fetchData();
  }, [apiUrl]);

  const handleAdd = async () => {
    if (!currentUser.nama || !currentUser.username || !currentUser.password || !currentUser.id_perusahaan || !currentUser.id_role || !currentUser.id_shift) {
      return Swal.fire("Peringatan", "Kolom nama, username, password, perusahaan, role, dan shift harus diisi.", "warning");
    }
    try {
      const res = await fetch(`${apiUrl}/profil`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser),
      });
      const result = await res.json();
      if (result.success) {
        Swal.fire("Sukses", result.message, "success");
        navigate("/karyawan");
      } else {
        Swal.fire("Gagal", result.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan pada server.", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleStatus = () => {
    setCurrentUser((prev) => ({ ...prev, status: prev.status === 1 ? 0 : 1 }));
  };

  const handleBack = () => navigate("/karyawan");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Tambah Karyawan</h1>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="flex-grow p-10 w-full mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NIP */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">NIP</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan nomor induk pegawai.</p>
            <input type="text" name="nip" value={currentUser.nip} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          {/* Nama */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Nama Lengkap</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan <span className="font-semibold text-gray-800">nama lengkap</span> karyawan.</p>
            <input type="text" name="nama" value={currentUser.nama} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          {/* Telepon */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">No. Telepon</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan nomor telepon aktif.</p>
            <input type="text" name="telp" value={currentUser.telp} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          {/* Perusahaan */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Perusahaan</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Pilih perusahaan sesuai tempat kerja.</p>
            <select name="id_perusahaan" value={currentUser.id_perusahaan} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">Pilih Perusahaan</option>
              {perusahaanList.map((item) => (
                <option key={item.id} value={item.id}>{item.nama}</option>
              ))}
            </select>
          </div>

          {/* Divisi */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Divisi</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Pilih divisi sesuai tugasnya.</p>
            <select name="id_role" value={currentUser.id_role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">Pilih Divisi</option>
              {divisiList.map((item) => (
                <option key={item.id} value={item.id}>{item.nama}</option>
              ))}
            </select>
          </div>

          {/* Status Karyawan */}
          <div className="flex items-center space-x-3 mt-10">
            <label className="font-medium text-gray-700">Status Karyawan</label>
            <button type="button" onClick={handleToggleStatus} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${currentUser.status === 1 ? "bg-green-500" : "bg-gray-300"}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${currentUser.status === 1 ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <span className="text-sm text-gray-600">{currentUser.status === 1 ? "Aktif" : "Nonaktif"}</span>
          </div>

          {/* Username */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Username</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Username digunakan untuk login.</p>
            <input type="text" name="username" value={currentUser.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Isi untuk mengatur password login.</p>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={currentUser.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-10 outline-none" />
              <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 cursor-pointer text-gray-500">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>

          {/* Shift (col-span-2) */}
          <div className="md:col-span-2 border border-gray-300 rounded-xl p-4 bg-gray-50">
            <label className="block mb-1 font-medium text-gray-700">Shift</label>
            <p className="text-xs text-gray-500 mb-2 -mt-2">Jadwal kerja yang berlaku untuk karyawan ini.</p>
            <select name="id_shift" value={currentUser.id_shift || ""} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">Pilih Shift</option>
              {Array.isArray(shiftList) &&
                shiftList.map((item) => (
                  <option key={item.id} value={item.id}>{item.nama}</option>
                ))}
            </select>

            {/* Detail Shift */}
            {currentUser.id_shift && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Detail Shift:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-gray-300 rounded">
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="border px-2 py-1">Hari</th>
                        <th className="border px-2 py-1">Jam Masuk</th>
                        <th className="border px-2 py-1">Jam Pulang</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const selected = shiftList.find(s => String(s.id) === String(currentUser.id_shift));
                        const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                        const detailMap = Object.fromEntries((selected?.detail || []).map(d => [d.hari, d]));
                        return days.map((day) => (
                          <tr key={day} className="text-center">
                            <td className="border px-2 py-1">{day}</td>
                            <td className="border px-2 py-1">{detailMap[day]?.jam_masuk?.slice(0, 5) || '-'}</td>
                            <td className="border px-2 py-1">{detailMap[day]?.jam_pulang?.slice(0, 5) || '-'}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-between space-x-4 pt-6">
          <button
            type="button"
            onClick={handleBack}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center shadow"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Batal
          </button>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Simpan
          </button>
        </div>
      </form>

    </div>
  );
};

export default TambahKaryawan;
