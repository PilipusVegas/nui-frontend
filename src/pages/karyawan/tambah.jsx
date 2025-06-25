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

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleAdd();}} className="flex-grow p-10 w-full mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Nama Lengkap</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan <span className="font-semibold text-gray-800">nama lengkap</span> karyawan.</p>
            <input type="text" name="nama" value={currentUser.nama} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
          </div>

          {/* Telepon */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">No. Telepon</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan nomor telepon aktif.</p>
            <input type="text" name="telp" value={currentUser.telp} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
          </div>

          {/* Perusahaan */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Perusahaan</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Pilih perusahaan sesuai tempat kerja.</p>
            <select name="id_perusahaan" value={currentUser.id_perusahaan} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">Pilih Perusahaan</option>
              {perusahaanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
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
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Shift */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Shift</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Jadwal kerja yang berlaku.</p>
            <select name="id_shift" value={currentUser.id_shift} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">Pilih Shift</option>
              {Array.isArray(shiftList) &&
                shiftList.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.nama} ({item.jam_masuk} - {item.jam_pulang})
                    </option>
                ))}
            </select>
          </div>

           {/* Status Toggle */}
           <div className="flex items-center space-x-3 mt-10">
            <label className="font-medium text-gray-700">Status Karyawan</label>
            <button type="button" onClick={handleToggleStatus} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${ currentUser.status === 1 ? "bg-green-500" : "bg-gray-300" }`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${ currentUser.status === 1 ? "translate-x-6" : "translate-x-0" }`}></div>
            </button>
            <span className="text-sm text-gray-600">
              {currentUser.status === 1 ? "Aktif" : "Nonaktif"}
            </span>
          </div>

          {/* Username */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Username</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Username digunakan untuk login.</p>
            <input type="text" name="username" value={currentUser.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Isi untuk mengatur password login.</p>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={currentUser.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-10 outline-none"/>
              <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 cursor-pointer text-gray-500">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
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
