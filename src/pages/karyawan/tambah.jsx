import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";

const TambahKaryawan = () => {
  const navigate = useNavigate();
  const [divisiList, setDivisiList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState({ nama: "", id_perusahaan: "", id_role: "", id_shift: "", telp: "", username: "", password: "", status: 1, perusahaan_hrd: []});
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [managedCompanies, setManagedCompanies] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [divisiRes, shiftRes, perusahaanRes] = await Promise.all([
          fetchWithJwt(`${apiUrl}/karyawan/divisi`),
          fetchWithJwt(`${apiUrl}/shift`),
          fetchWithJwt(`${apiUrl}/perusahaan`),
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
      const payload = {
        ...currentUser,
        perusahaan_hrd: managedCompanies.map(id => ({ id_perusahaan: id }))
      };
      const res = await fetchWithJwt(`${apiUrl}/profil`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    if (name === "id_perusahaan") {
      setCurrentUser((prev) => ({ ...prev, id_perusahaan: value, id_shift: "" }));
      return;
    }
    if (name === "id_role") {
      const roleId = parseInt(value);
      if (roleId === 4 || roleId === 6) {
        setManagedCompanies([]);
      } else {
        setManagedCompanies([]);
        setCurrentUser(prev => ({ ...prev, perusahaan_hrd: [] }));
      }
    }
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };
  

  const handleToggleStatus = () => {
    setCurrentUser((prev) => ({ ...prev, status: prev.status === 1 ? 0 : 1 }));
  };

  const handleBack = () => navigate("/karyawan");

  return (
    <div className="bg-white flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-3 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Tambah Karyawan</h1>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="flex-grow py-5 px-3 w-full mx-auto space-y-4">
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

           {/* Divisi */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">Divisi</label>
              <p className="text-xs text-gray-500 mb-2 -mt-1.5">Pilih divisi sesuai tugasnya.</p>
              <select name="id_role" value={currentUser.id_role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                <option value="">Pilih Divisi</option>
                {divisiList
                  .filter((item) => item.id !== 1) // Menyaring role id 1
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama}
                    </option>
                  ))}
              </select>
            </div>


          {/* Telepon */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">No. Telepon</label>
            <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan nomor telepon aktif.</p>
            <input type="text" name="telp" value={currentUser.telp} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          {(currentUser.id_role === "4" || currentUser.id_role === "6") && (
            <div className="md:col-span-2 border-4 border-green-200 rounded-2xl p-5 shadow-sm transition-all duration-300">
              <label className="block text-md font-semibold text-gray-800 mb-1">
                Pilih Perusahaan yang akan dikelola
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Pilih satu per satu perusahaan yang akan dikelola oleh HRD ini.
              </p>

              <div className="relative">
                <select defaultValue="" onChange={(e) => { const selectedId = parseInt(e.target.value); if (!isNaN(selectedId) && !managedCompanies.includes(selectedId)) { setManagedCompanies([...managedCompanies, selectedId]); } e.target.value = ""; }} className="w-full px-4 py-2 border rounded-lg text-sm transition-all outline-none bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option value="" disabled hidden>
                    Pilih perusahaan...
                  </option>

                  {perusahaanList.filter((item) => !managedCompanies.includes(item.id)).length > 0 ? (
                    perusahaanList
                      .filter((item) => !managedCompanies.includes(item.id))
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nama}
                        </option>
                      ))
                  ) : (
                    <option value="" disabled>
                      Tidak ada perusahaan tersedia
                    </option>
                  )}
                </select>

                {/* Note kecil */}
                {perusahaanList.filter((item) => !managedCompanies.includes(item.id)).length === 0 && (
                  <p className="mt-2 text-xs text-gray-500 italic">
                    Semua perusahaan telah dipilih. Tambahkan perusahaan baru di menu <span className="text-[10px] cursor-pointer font-medium bg-green-100 text-green-700 px-3 py-0.5 rounded-md hover:bg-green-200 border border-green-300 transition" onClick={() => navigate("/perusahaan")}>Kelola Perusahaan</span>
                  </p>
                )}
              </div>

              {managedCompanies.length > 0 && (
                  <div className="mt-5 bg-white border border-green-300 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      HRD ini mengelola {managedCompanies.length} {managedCompanies.length > 1 ? "perusahaan" : "perusahaan"}:
                      </h4>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {perusahaanList
                          .filter((item) => managedCompanies.includes(item.id))
                          .map((item) => (
                          <div key={item.id} className="group flex justify-between items-center bg-green-50 border border-green-300 text-green-800 rounded-lg px-3 py-2 text-sm hover:bg-green-100 transition">
                              <span className="truncate max-w-[85%]">{item.nama}</span>
                              <button onClick={() => setManagedCompanies(managedCompanies.filter((id) => id !== item.id))} className="ml-2 text-red-500 hover:text-red-600" title="Hapus">
                              <FontAwesomeIcon icon={faTimes} className="text-xs" />
                              </button>
                          </div>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          )}

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

                {/* Keterangan jumlah shift */}
                {currentUser.id_perusahaan !== "" && currentUser.id_perusahaan !== null && !isNaN(currentUser.id_perusahaan) && (
                (() => {
                    const idPerusahaan = parseInt(currentUser.id_perusahaan);
                    const jumlahShift = shiftList.filter((shift) =>
                    shift.perusahaan.some((p) => p.id_perusahaan === idPerusahaan)
                    ).length;

                    return (
                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                        <p>
                        Perusahaan ini memiliki <strong>{jumlahShift}</strong> shift.
                        </p>
                        {jumlahShift === 0 && (
                        <span onClick={() => navigate(`/perusahaan/edit/${idPerusahaan}`)} className="cursor-pointer px-2 py-0.5 bg-green-50 border border-green-400 text-green-700 rounded-md hover:bg-green-100 transition">
                            Tambah shift
                        </span>
                        )}
                    </div>
                    );
                })()
                )}
                </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Shift</label>
            <p className="text-xs text-gray-500 mb-2 -mt-2">Jadwal kerja yang berlaku untuk karyawan ini.</p>
            <select name="id_shift" value={currentUser.id_shift || ""} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">Pilih Shift</option>
              {shiftList
                .filter((shift) =>
                  shift.perusahaan.some(p => p.id_perusahaan === parseInt(currentUser.id_perusahaan))
                )
                .map((item) => (
                  <option key={item.id} value={item.id}>{item.nama}</option>
                ))}
            </select>
          </div>

          {currentUser.id_shift && (
            <div className="md:col-span-2 mt-5 bg-white border border-green-300 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Detail Shift:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm rounded">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="border px-2 py-1 rounded-tl-md">Hari</th>
                      <th className="border px-2 py-1">Jam Masuk</th>
                      <th className="border px-2 py-1 rounded-tr-md">Jam Pulang</th>
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

          {/* Status Karyawan */}
          <div className="md:col-span-2 flex items-center space-x-3 mt-10 justify-center">
            <label className="font-medium text-gray-700">Status Karyawan</label>
            <button type="button" onClick={handleToggleStatus} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${currentUser.status === 1 ? "bg-green-500" : "bg-gray-300"}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${currentUser.status === 1 ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <span className="text-sm text-gray-600">{currentUser.status === 1 ? "Aktif" : "Nonaktif"}</span>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-between space-x-4 pt-6">
          <button type="button" onClick={handleBack} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center shadow">
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Batal
          </button>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow">
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Simpan
          </button>
        </div>
      </form>

    </div>
  );
};

export default TambahKaryawan;
