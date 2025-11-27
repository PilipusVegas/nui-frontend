import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faChevronDown, faInfoCircle, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { SectionHeader } from "../../components";
import Select from "react-select";

const TambahKaryawan = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [divisiList, setDivisiList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState({ nip: "", nik: "", npwp: "", no_rek: "", nama: "", status_nikah: "", jml_anak: 0, id_perusahaan: "", id_role: "", id_shift: "", telp: "", username: "", password: "", status: 1, });
  const [showShiftDetails, setShowShiftDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userToken = getUserFromToken(); // Ambil data user dari JWT
        const [divisiRes, shiftRes, perusahaanRes] = await Promise.all([
          fetchWithJwt(`${apiUrl}/karyawan/divisi`),
          fetchWithJwt(`${apiUrl}/shift`),
          fetchWithJwt(`${apiUrl}/perusahaan`),
        ]);
        const divisiData = await divisiRes.json();
        const shiftData = await shiftRes.json();
        const perusahaanData = await perusahaanRes.json();

        // Filter perusahaan hanya yang ada di perusahaan_dikelola
        const filteredPerusahaan = perusahaanData.data.filter(p =>
          userToken.perusahaan_dikelola.includes(p.id)
        );

        setPerusahaanList(filteredPerusahaan);
        setDivisiList(divisiData.data);
        setShiftList(shiftData.data);
      } catch (err) {
        console.error("Gagal fetch data tambahan", err);
      }
    };
    fetchData();
  }, [apiUrl]);


  const handleAdd = async () => {
    if (!currentUser.nip || !currentUser.nama || !currentUser.id_perusahaan || !currentUser.id_role || !currentUser.id_shift) {
      return Swal.fire("Peringatan", "Kolom nama, perusahaan, role, dan shift harus diisi.", "warning");
    }

    try {
      const payload = { ...currentUser };
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
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleStatus = () => {
    setCurrentUser((prev) => ({ ...prev, status: prev.status === 1 ? 0 : 1 }));
  };

  const handleBack = () => navigate("/karyawan");

  return (
    <div className="bg-white flex flex-col">
      <SectionHeader title="Tambah Karyawan" onBack={handleBack} subtitle="Formulir untuk menambahkan karyawan baru." />

      <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="flex-grow pb-20 px-3 w-full mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="col-span-full flex flex-col">
            <div className="flex items-center">
              <h3 className="text-lg font-bold text-green-600">
                Biodata Lengkap Karyawan
              </h3>
              <div className="flex-grow h-1 bg-green-500 ml-4 mt-1"></div>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-0">
              Lengkapi data pribadi karyawan dengan lengkap dan benar.
            </p>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Nama Lengkap</label>
            <input type="text" name="nama" value={currentUser.nama} onChange={handleChange} placeholder="Masukkan nama lengkap karyawan" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">NIK</label>
            <input type="text" name="nik" value={currentUser.nik} onChange={handleChange} placeholder="Masukkan Nomor Induk Kependudukan" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 mb-1">Nomor Induk Pegawai (NIP)</label>
            <input type="text" name="nip" value={currentUser.nip} placeholder="Masukkan NIP Karyawan" onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">NPWP</label>
            <input type="text" name="npwp" value={currentUser.npwp} onChange={handleChange} placeholder="Masukkan Nomor Pokok Wajib Pajak" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">No. Telepon</label>
            <input type="text" name="telp" value={currentUser.telp} onChange={handleChange} placeholder="Masukkan nomor telepon aktif" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Nomor Rekening</label>
            <input type="text" name="no_rek" value={currentUser.no_rek} onChange={handleChange} placeholder="Masukkan nomor rekening karyawan" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Status Pernikahan</label>
            <select name="status_nikah" value={currentUser.status_nikah || ""} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">Pilih Status</option>
              <option value="Belum_Menikah">Belum Menikah</option>
              <option value="Sudah_Menikah">Sudah Menikah</option>
              <option value="Cerai">Cerai</option>
            </select>
          </div>

          {currentUser.status_nikah === "Sudah_Menikah" && (
            <div>
              <label className="block mb-1 font-medium text-gray-700">Jumlah Anak</label>
              <input type="number" name="jml_anak" value={currentUser.jml_anak || 0} onChange={handleChange} min="0" placeholder="Masukkan jumlah anak (0 jika tidak ada)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Status Kendaraan <span className="text-gray-400 text-sm font-normal">(Opsional)</span>
            </label>

            <select name="status_kendaraan"
              value={currentUser.status_kendaraan !== undefined && currentUser.status_kendaraan !== null ? currentUser.status_kendaraan : 0}
              onChange={(e) => {
                const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                handleChange({ target: { name: "status_kendaraan", value } });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="0">Pilih Status Kendaraan</option>
              <option value="1">Menggunakan Kendaraan Pribadi (Menerima Tunjangan)</option>
              <option value="3">Menggunakan Kendaraan Umum (Menerima Tunjangan)</option>
              <option value="2">Menggunakan Kendaraan Kantor (Tidak Menerima Tunjangan)</option>
            </select>
          </div>


          <div className="col-span-full flex flex-col mt-4">
            <div className="flex items-center">
              <h3 className="text-lg font-bold text-green-600">
                Penempatan Kerja & Divisi
              </h3>
              <div className="flex-grow h-1 bg-green-500 ml-4 mt-1"></div>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-0">
              Tentukan perusahaan dan divisi tempat karyawan ini bekerja.
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Perusahaan</label>
            <Select
              placeholder="Pilih Perusahaan"
              isClearable
              classNamePrefix="react-select"
              options={perusahaanList.map((item) => ({
                value: item.id,
                label: item.nama,
              }))}
              value={
                currentUser.id_perusahaan
                  ? { value: currentUser.id_perusahaan, label: perusahaanList.find(p => p.id === currentUser.id_perusahaan)?.nama }
                  : null
              }
              onChange={(selected) =>
                handleChange({ target: { name: "id_perusahaan", value: selected?.value || "" } })
              }
            />


            {/* Keterangan jumlah shift */}
            {currentUser.id_perusahaan && (
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

          {/* Divisi */}
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Divisi</label>
            <Select
              options={divisiList.filter((item) => item.id !== 1).map((item) => ({
                value: item.id,
                label: item.nama,
              }))}
              value={
                currentUser.id_role
                  ? { value: currentUser.id_role, label: divisiList.find(d => d.id === currentUser.id_role)?.nama }
                  : null
              }
              onChange={(selected) =>
                handleChange({ target: { name: "id_role", value: selected?.value || "" } })
              }
              placeholder="Pilih Divisi"
              isClearable
              classNamePrefix="react-select"
            />
          </div>


          <div className="col-span-full flex flex-col mt-4">
            <div className="flex items-center">
              <h3 className="text-lg font-bold text-green-600">
                Kelola Jadwal Kerja
              </h3>
              <div className="flex-grow h-1 bg-green-500 ml-4 mt-1"></div>
            </div>

            <p className="text-sm text-gray-500 mt-1 ml-0">
              Pilih dan atur shift yang berlaku untuk karyawan ini agar jadwal kerja lebih terstruktur.
            </p>
          </div>

          {/* Shift */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Shift / Jadwal Kerja Karyawan</label>
            <select name="id_shift" value={currentUser.id_shift || ""} disabled={!currentUser.id_perusahaan} className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${!currentUser.id_perusahaan ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
              onChange={(e) => {
                const selectedId = e.target.value;
                handleChange(e);
                const selectedShift = shiftList.find(s => String(s.id) === String(selectedId)) || null;
                setCurrentUser(prev => ({ ...prev, shift: selectedShift }));
              }}
            >
              <option value="">{currentUser.id_perusahaan ? "Pilih Shift" : "Pilih Perusahaan terlebih dahulu"}</option>
              {shiftList
                .filter((shift) =>
                  shift.perusahaan.some(p => p.id_perusahaan === parseInt(currentUser.id_perusahaan))
                )
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
            </select>
          </div>

          {currentUser.id_shift && (
            <div className="md:col-span-2 border border-gray-300 bg-green-500 rounded-md">
              <button type="button" className="w-full px-4 py-3 flex justify-between items-center text-white font-semibold focus:outline-none" onClick={() => setShowShiftDetails((prev) => !prev)}>
                <p className="font-semibold mb-1">Detail Jadwal {currentUser.shift.nama}</p>
                <FontAwesomeIcon icon={faChevronDown} className={`transition-transform duration-200 ${showShiftDetails ? "rotate-180" : "rotate-0"}`} />
              </button>

              {showShiftDetails && (
                <div className="p-4 border-t border-green-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm rounded-xl">
                      <thead className="rounded-md">
                        <tr className="bg-green-200 text-green-600 rounded-md">
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
            </div>
          )}

          <div className="col-span-full flex flex-col mt-4">
            <div className="flex items-center">
              <h3 className="text-lg font-bold text-green-600">Pengaturan Akun Login</h3>
              <div className="flex-grow h-1 bg-green-500 ml-4 mt-1"></div>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Tentukan tipe karyawan dan atur kredensial login karyawan.
            </p>

            <div className="mt-3 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg shadow-sm">
              <p className="text-green-800 font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} />
                Informasi:
              </p>
              <ul className="list-disc list-inside ml-6 mt-2 text-gray-700 space-y-1 text-sm">
                <li>
                  <strong>Karyawan Kantor:</strong> Harus <strong>daftar wajah</strong> di perangkat <strong>Face Recognition</strong> (tablet/mesin kantor) sebelum bisa absen.
                  Username dan password tidak wajib karena absensi lewat wajah.
                </li>
                <li>
                  <strong>Karyawan Lapangan:</strong> Wajib absen lewat <strong>Aplikasi Absensi Online</strong> di handphone, dengan <strong>username</strong> dan <strong>password</strong>.
                  Sistem memakai <strong>kamera</strong> dan <strong>GPS</strong> untuk memastikan lokasi kehadiran.
                </li>
              </ul>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">Username</label>
                <input type="text" name="username" value={currentUser.username} onChange={handleChange} placeholder="Masukkan username (opsional)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={currentUser.password} onChange={handleChange} placeholder="Masukkan password (opsional)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-10 outline-none" />
                  <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 cursor-pointer text-gray-500">
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-6 bg-white rounded-2xl shadow-lg border border-green-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800">Status Karyawan</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Tentukan apakah karyawan ini masih <span className="font-semibold text-green-700">aktif bekerja</span> atau <span className="font-semibold text-red-600">nonaktif bekerja</span>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${currentUser.status === 1 ? "text-green-700" : "text-red-500"}`}>
                  {currentUser.status === 1 ? "AKTIF" : "NONAKTIF"}
                </span>
                <button type="button" onClick={handleToggleStatus} className={`w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${currentUser.status === 1 ? "bg-green-500" : "bg-gray-300"}`} title="Ubah Status">
                  <div className={`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ${currentUser.status === 1 ? "translate-x-8" : "translate-x-0"}`} />
                </button>
              </div>
            </div>

            <div className="mt-2 p-5 bg-green-50 border-l-4 border-green-400 rounded-xl shadow-sm">
              <p className="font-semibold text-green-800 mb-2 text-base flex items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} className="text-green-700" />
                Informasi Status Karyawan
              </p>
              <ul className="list-disc list-inside ml-6 mt-2 text-gray-700 space-y-1">
                <li>
                  <span className="font-semibold text-green-700">Karyawan aktif:</span> dapat login, mengakses sistem, dan melakukan absensi sesuai metode yang berlaku.
                </li>
                <li>
                  <span className="font-semibold text-red-600">Karyawan nonaktif:</span> tidak memiliki akses, dan aktivitas absensi tidak akan tercatat.
                </li>
              </ul>
              <p className="mt-2 text-gray-700">
                Pastikan selalu memperbarui status karyawan saat ada perubahan, agar data kehadiran tetap <strong>akurat</strong> dan <strong>tercatat</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-10 flex flex-row justify-end gap-3 flex-wrap">
          <button type="button" onClick={handleBack} className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto px-4 py-2.5 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Batalkan
          </button>

          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-4 py-2.5 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Simpan Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahKaryawan;