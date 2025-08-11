import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEye, faEyeSlash, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const EditKaryawan = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [divisiList, setDivisiList] = useState([]);
    const [shiftList, setShiftList] = useState([]);
    const [perusahaanList, setPerusahaanList] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [currentUser, setCurrentUser] = useState({});
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [managedCompanies, setManagedCompanies] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [divisiRes, shiftRes, userRes, perusahaanRes] = await Promise.all([
                    fetchWithJwt(`${apiUrl}/karyawan/divisi`),
                    fetchWithJwt(`${apiUrl}/shift`),
                    fetchWithJwt(`${apiUrl}/profil/${id}`),
                    fetchWithJwt(`${apiUrl}/perusahaan`),
                ]);
                const divisiData = await divisiRes.json();
                const shiftData = await shiftRes.json();
                const userData = await userRes.json();
                const perusahaanData = await perusahaanRes.json();
                setDivisiList(divisiData);
                setShiftList(shiftData.data);
                setPerusahaanList(perusahaanData.data);
                if (userData.success) {
                    const user = userData.data;
                    setCurrentUser(user);
                
                    // Ambil perusahaan yang dikelola jika role HRD
                    if (user.id_role === 4 || user.id_role === 6) {
                        const perusahaanHRDIds = user.perusahaan_hrd?.map(p => p.id_perusahaan) || [];
                        setManagedCompanies(perusahaanHRDIds);
                    }
                }
            } catch (err) {
                console.error("Gagal fetch data", err);
            }
        };
        fetchData();
    }, [apiUrl, id]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            let updatedValue = value;
        
            if (name === "id_perusahaan") {
            setCurrentUser((prev) => ({
                ...prev,
                id_perusahaan: parseInt(value),
                id_shift: null,
            }));
            return;
            }
        
            if (name === "id_role" || name === "id_shift") {
            updatedValue = parseInt(value);
            }
        
            setCurrentUser((prev) => ({ ...prev, [name]: updatedValue }));
        };

    const handleBack = () => {
        navigate("/karyawan");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...currentUser,
            ...(currentUser.id_role === 4 || currentUser.id_role === 6
                ? {perusahaan_hrd: managedCompanies.map((id) => ({ id_perusahaan: id,})),}
                : {}),
        };
        try {
            const res = await fetchWithJwt(`${apiUrl}/profil/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const responseData = await res.json();
            if (responseData.success) {
                Swal.fire("Berhasil", "Data berhasil diperbarui", "success");
                navigate("/karyawan");
            } else {
                Swal.fire("Gagal", responseData.message || "Terjadi kesalahan", "error");
            }
        } catch (err) {
            Swal.fire("Error", "Gagal menghubungi server", "error");
        }
    };

    const handleToggleStatus = () => {
        setCurrentUser((prev) => ({ ...prev, status: prev.status === 1 ? 0 : 1 }));
    };

    return (
        <div className="bg-white flex flex-col">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-2 bg-white">
                <div className="flex items-center space-x-2">
                    <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full" title="Kembali">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Edit Karyawan</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow pb-5 px-3 w-full mx-auto space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* === Biodata Karyawan === */}
                    <div className="col-span-full flex items-center gap-4 my-3">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-green-600 to-transparent" />
                    <h3 className="text-base md:text-lg font-semibold tracking-wide text-green-700 uppercase whitespace-nowrap">
                        Data Pribadi Karyawan
                    </h3>
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-green-600 to-transparent" />
                    </div>

                    {/* NIK */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">NIK</label>
                        <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan Nomor Induk Kependudukan (NIK).</p>
                        <input type="text" name="nip" value={currentUser.nik} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    {/* NIP */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">NIP</label>
                        <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan nomor induk pegawai.</p>
                        <input type="text" name="nip" value={currentUser.nip} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    {/* NPWP */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">NPWP</label>
                        <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan Nomor Pokok Wajib Pajak (NPWP).</p>
                        <input type="text" name="nip" value={currentUser.npwp} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
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

                    {/* No Rekening */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Nomor Rekening</label>
                        <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan Nomor Rekening Karyawan.</p>
                        <input type="text" name="ne_rek" value={currentUser.no_rek} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    {/* STATUS NIKAH */}
                    <div>
                    <label className="block mb-1 font-medium text-gray-700">Status Nikah</label>
                    <p className="text-xs text-gray-500 mb-2 -mt-1.5">Pilih status pernikahan karyawan.</p>
                    <select name="status_nikah" value={currentUser.status_nikah || ""} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                        <option value="">Pilih Status</option>
                        <option value="Belum_Menikah">Belum Menikah</option>
                        <option value="Sudah_Menikah">Sudah Menikah</option>
                        <option value="Cerai">Cerai</option>
                    </select>
                    </div>

                    {/* JUMLAH ANAK - Tampilkan jika Sudah Menikah */}
                    {currentUser.status_nikah === "Sudah_Menikah" && (
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Jumlah Anak</label>
                        <p className="text-xs text-gray-500 mb-2 -mt-1.5">Masukkan jumlah anak (jika ada). Jika belum mempunyai anak maka isi 0 saja</p>
                        <input type="number" name="jml_anak" value={currentUser.jml_anak || ""} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"/>
                    </div>
                    )}

                    {/* === PENEMPATAN KERJA & DIVISI === */}
                    <div className="col-span-full flex items-center gap-4 my-3">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-green-600 to-transparent" />
                    <h3 className="text-base md:text-lg font-semibold tracking-wide text-green-700 uppercase whitespace-nowrap">
                        Penempatan Kerja & Divisi
                    </h3>
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-green-600 to-transparent" />
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

                    {/* Keterangan jumlah shift */}
                    {currentUser.id_perusahaan !== "" && currentUser.id_perusahaan !== null && !isNaN(currentUser.id_perusahaan) && (
                    (() => {
                        const idPerusahaan = parseInt(currentUser.id_perusahaan);
                        const jumlahShift = shiftList.filter((shift) =>
                        shift.perusahaan.some((p) => p.id_perusahaan === idPerusahaan)
                        ).length;

                        return (
                        <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                            <p> Perusahaan ini memiliki <strong>{jumlahShift}</strong> shift. </p>
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
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Divisi</label>
                        <p className="text-xs text-gray-500 mb-2 -mt-1.5">Pilih divisi sesuai tugasnya.</p>
                        <select name="id_role" value={currentUser.id_role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                            <option value="">Pilih Divisi</option>
                            {divisiList
                                .filter((item) => item.id !== 1) // Filter role dengan id 1
                                .map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}
                        </select>
                    </div>

                     {/* Pengelolaan Perusahaan */}
                    {(currentUser.id_role === 4 || currentUser.id_role === 6) && (
                        <div className="md:col-span-2 border-4 border-green-300 border-dashed rounded-2xl p-5 shadow-sm transition-all duration-300">
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
                                            <button onClick={() => setManagedCompanies(managedCompanies.filter((id) => id !== item.id))} className="ml-2 text-red-500 hover:text-red-600" title="Hapus" >
                                            <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                            </button>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === PENEMPATAN KERJA & DIVISI === */}
                    <div className="col-span-full flex items-center gap-4 my-3">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-green-600 to-transparent" />
                    <h3 className="text-base md:text-lg font-semibold tracking-wide text-green-700 uppercase whitespace-nowrap">
                        kelola jadwal kerja
                    </h3>
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-green-600 to-transparent" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Shift</label>
                        <p className="text-xs text-gray-500 mb-2 -mt-2">
                            Pilih jadwal kerja yang berlaku untuk karyawan ini.
                        </p>
                        <select name="id_shift" value={currentUser.id_shift || ""} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                            <option value="">Pilih Shift</option>
                            {shiftList.filter((shift) => shift.perusahaan.some( (p) => p.id_perusahaan === parseInt(currentUser.id_perusahaan)))
                            .map((item) => (
                                <option key={item.id} value={item.id}>
                                {item.nama}
                                </option>
                            ))}
                            { shiftList.filter((shift) => shift.perusahaan.some( (p) => p.id_perusahaan === parseInt(currentUser.id_perusahaan))).length === 0 && (
                                <option disabled value="">
                                Belum ada shift untuk perusahaan ini
                                </option>
                            )
                            }
                        </select>
                    </div>

                    {Boolean(currentUser.id_shift) && Number(currentUser.id_shift) !== 0 && (
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

                    {/* === PENEMPATAN KERJA & DIVISI === */}
                    <div className="col-span-full flex items-center gap-4 my-3">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-green-600 to-transparent" />
                    <h3 className="text-base md:text-lg font-semibold tracking-wide text-green-700 uppercase whitespace-nowrap">
                        akun absensi karyawan
                    </h3>
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-green-600 to-transparent" />
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

                    {/* Status Karyawan */}
                    <div className="md:col-span-2 mt-6 flex flex-col gap-3 rounded-xl border border-green-400 bg-white shadow-sm p-5">
                    <div className="flex items-center justify-between">
                        <div>
                        <h4 className="text-sm font-semibold text-gray-800 tracking-wide">
                            Status Karyawan
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Tentukan apakah karyawan ini <span className="font-medium text-green-700">masih aktif bekerja</span> dan bisa melakukan absensi.
                        </p>
                        </div>

                        {/* Toggle Switch */}
                        <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${ currentUser.status === 1 ? "text-green-700" : "text-red-500"}`}>
                            {currentUser.status === 1 ? "AKTIF" : "NONAKTIF"}
                        </span>
                        <button type="button" onClick={handleToggleStatus} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${ currentUser.status === 1 ? "bg-green-500" : "bg-gray-300"}`} title="Ubah Status">
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${ currentUser.status === 1 ? "translate-x-6" : "translate-x-0"}`}/>
                        </button>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-2 text-sm text-gray-700 bg-green-50 border border-green-200 rounded-md p-4 leading-relaxed tracking-wide">
                    <p className="font-semibold text-gray-800 mb-2">Panduan Penggunaan Absensi</p>

                    <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-600">
                        <li>
                        <strong className="text-green-700">Karyawan Lapangan</strong> 
                        <span> wajib menggunakan </span> 
                        <strong>Aplikasi Absensi Online</strong> untuk melakukan presensi harian.
                        </li>
                        <li>
                        <strong className="text-green-700">Karyawan Kantor</strong> 
                        <span> wajib menggunakan </span>
                        <strong>Absensi Face Recognition</strong> di perangkat kantor.
                        </li>
                    </ul>

                    <p className="mt-2 text-sm text-gray-600">
                        Sistem <strong className="text-red-600">tidak memperbolehkan penggunaan silang</strong>. 
                        Data dari absensi lapangan dan kantor diproses secara <strong>terpisah</strong>.
                    </p>

                    <p className="mt-3 text-sm text-gray-700">
                        <strong>Status Aktif</strong> diperlukan agar karyawan bisa login dan melakukan absensi sesuai penugasannya.
                        Jika status <span className="font-semibold text-red-600">Nonaktif</span>, maka akses absensi akan <strong>dinonaktifkan sepenuhnya</strong>.
                    </p>
                    </div>
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
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditKaryawan;
