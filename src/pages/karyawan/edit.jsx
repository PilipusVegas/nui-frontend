import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faInfoCircle, faSave, faTimes, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { SectionHeader } from "../../components";
import Select from "react-select";

const EditKaryawan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shiftList, setShiftList] = useState([]);
    const [divisiList, setDivisiList] = useState([]);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [currentUser, setCurrentUser] = useState({});
    const [perusahaanList, setPerusahaanList] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showShiftDetails, setShowShiftDetails] = useState(false);
    const [kadivList, setKadivList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [initialPlacement, setInitialPlacement] = useState(null);
    const [loginUser, setLoginUser] = useState(null);
    const allowKadivInput =
        loginUser &&
        [1, 4].includes(Number(loginUser.id_perusahaan));

    const isMovedPlacement =
        initialPlacement &&
        (
            currentUser.id_kadiv !== initialPlacement.id_kadiv ||
            currentUser.id_kadiv_group !== initialPlacement.id_kadiv_group
        );
    // ambil grup yang sedang dipilih
    const selectedGroup = groupList.find(
        (g) => g.id === currentUser.id_kadiv_group
    );

    // cek apakah grup sudah punya leader
    const groupHasLeader = Boolean(selectedGroup?.id_leader);

    const disableLeaderSelect = groupHasLeader;

    useEffect(() => {
        const user = getUserFromToken();
        setLoginUser(user);
    }, []);



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

                setDivisiList(divisiData.data);
                setShiftList(shiftData.data);

                if (userData.success) {
                    setCurrentUser(userData.data);

                    setInitialPlacement({
                        id_kadiv: userData.data.id_kadiv,
                        id_kadiv_group: userData.data.id_kadiv_group,
                    });
                }


                setPerusahaanList(perusahaanData.data);
            } catch (err) {
                console.error("Gagal fetch data", err);
            }
        };

        fetchData();
    }, [apiUrl, id]);

    useEffect(() => {
        const fetchKadiv = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/profil/kadiv-access`);
                const data = await res.json();
                if (data.success) setKadivList(data.data);
            } catch (err) {
                console.error("Gagal fetch Kadiv", err);
            }
        };
        fetchKadiv();
    }, [apiUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setCurrentUser((prev) => {
            // PILIH PERUSAHAAN
            if (name === "id_perusahaan") {
                const id_perusahaan = value === "" ? null : Number(value);

                return {
                    ...prev,
                    id_perusahaan,
                    id_role: null,
                    id_kadiv: null,
                    id_kadiv_group: null,
                    level: null,
                };
            }

            // PILIH DIVISI
            if (name === "id_role") {
                const id_role = value === "" ? null : Number(value);

                return {
                    ...prev,
                    id_role,
                    id_kadiv: null,
                    id_kadiv_group: null,
                    level: null,
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });
    };


    useEffect(() => {
        if (!currentUser?.id_kadiv) return;

        const fetchGroup = async () => {
            try {
                const res = await fetchWithJwt(
                    `${apiUrl}/profil/kadiv-access/group/kadiv/${currentUser.id_kadiv}`
                );
                const json = await res.json();

                if (json.success) {
                    setGroupList(json.data);
                }
            } catch (err) {
                console.error("Gagal fetch group", err);
            }
        };

        fetchGroup();
    }, [apiUrl, currentUser?.id_kadiv]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...currentUser };
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
            <SectionHeader
                title="Edit Karyawan"
                onBack={() => navigate(-1)}
                subtitle="Formulir untuk mengedit data karyawan"
            />
            <form onSubmit={handleSubmit} className="flex-grow pb-5 px-3 w-full mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-full flex flex-col">
                        <div className="flex items-center">
                            <h3 className="text-lg font-bold text-green-600">Biodata Lengkap Karyawan</h3>
                            <div className="flex-grow h-1 bg-green-500 ml-4 mt-1"></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 ml-0">
                            Lengkapi data pribadi karyawan dengan lengkap dan benar.
                        </p>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Nama Lengkap</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-1.5">
                            Masukkan <span className="font-semibold text-gray-800">nama lengkap</span> karyawan.
                        </p>
                        <input type="text" name="nama" value={currentUser.nama} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">NIK</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-1.5">
                            Masukkan Nomor Induk Kependudukan (NIK).
                        </p>
                        <input type="text" name="nik" value={currentUser.nik} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">NIP</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-1.5">Masukkan nomor induk pegawai.</p>
                        <input type="text" name="nip" value={currentUser.nip} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">NPWP</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-1.5">
                            Masukkan Nomor Pokok Wajib Pajak (NPWP).
                        </p>
                        <input type="text" name="npwp" value={currentUser.npwp} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">No. Telepon</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-1.5">Masukkan nomor telepon aktif.</p>
                        <input type="text" name="telp" value={currentUser.telp} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Nomor Rekening</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-1.5">Masukkan Nomor Rekening Karyawan.</p>
                        <input type="text" name="no_rek" value={currentUser.no_rek} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Status Pernikahan</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-1.5">Pilih status pernikahan karyawan.</p>
                        <select
                            name="status_nikah"
                            value={currentUser.status_nikah || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        >
                            <option value="">Pilih Status</option>
                            <option value="Belum_Menikah">Belum Menikah</option>
                            <option value="Sudah_Menikah">Sudah Menikah</option>
                            <option value="Cerai">Cerai</option>
                        </select>
                    </div>

                    {currentUser.status_nikah === "Sudah_Menikah" && (
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Jumlah Anak</label>
                            <p className="text-sm text-gray-500 mb-2 -mt-1.5">
                                Masukkan jumlah anak (jika ada). Jika belum mempunyai anak maka isi 0 saja
                            </p>
                            <input type="number" name="jml_anak" value={currentUser.jml_anak || ""} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                        </div>
                    )}

                    <div className="col-span-full flex flex-col mt-4">
                        <div className="flex items-center">
                            <h3 className="text-lg font-bold text-green-600">Penempatan Kerja & Divisi</h3>
                            <div className="flex-grow h-1 bg-green-500 ml-4 mt-1"></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 ml-0">
                            Tentukan perusahaan dan divisi tempat karyawan ini bekerja.
                        </p>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Perusahaan</label>
                        <select name="id_perusahaan" value={currentUser.id_perusahaan ?? ""} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                            <option value="">Pilih Perusahaan</option>
                            {perusahaanList.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nama}
                                </option>
                            ))}
                        </select>

                        {currentUser.id_perusahaan !== "" &&
                            currentUser.id_perusahaan !== null &&
                            !isNaN(currentUser.id_perusahaan) &&
                            (() => {
                                const idPerusahaan = parseInt(currentUser.id_perusahaan);
                                const jumlahShift = shiftList.filter((shift) =>
                                    shift.perusahaan.some((p) => p.id_perusahaan === idPerusahaan)
                                ).length;

                                return (
                                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                                        <p>
                                            {" "}
                                            Perusahaan ini memiliki <strong>{jumlahShift}</strong> shift.{" "}
                                        </p>
                                        {jumlahShift === 0 && (
                                            <span
                                                onClick={() => navigate(`/perusahaan/edit/${idPerusahaan}`)}
                                                className="cursor-pointer px-2 py-0.5 bg-green-50 border border-green-400 text-green-700 rounded-md hover:bg-green-100 transition"
                                            >
                                                Tambah shift
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}
                    </div>

                    {Number.isInteger(currentUser.id_perusahaan) && (
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Divisi</label>
                            <select name="id_role" value={currentUser.id_role ?? ""} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                                <option value="">Pilih Divisi</option>
                                {divisiList
                                    .filter((d) => d.id !== 1)
                                    .map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}


                    {allowKadivInput && Number.isInteger(currentUser.id_role) && !currentUser.is_kadiv && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Kepala Divisi
                            </label>

                            <Select
                                options={kadivList.map((k) => ({
                                    value: k.id,
                                    label: k.nama,
                                }))}
                                value={
                                    Number.isInteger(currentUser.id_kadiv)
                                        ? {
                                            value: currentUser.id_kadiv,
                                            label: kadivList.find(
                                                (k) => k.id === currentUser.id_kadiv
                                            )?.nama,
                                        }
                                        : null
                                }
                                onChange={(selected) =>
                                    setCurrentUser((prev) => ({
                                        ...prev,
                                        id_kadiv: selected ? selected.value : null,
                                        id_kadiv_group: null,
                                        level: null,
                                    }))
                                }
                                placeholder="Pilih Kepala Divisi"
                                isClearable
                            />
                        </div>
                    )}


                    {allowKadivInput && Number.isInteger(currentUser.id_kadiv) && (
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Tim / Grup</label>
                            <select
                                value={currentUser.id_kadiv_group ?? ""}
                                onChange={(e) =>
                                    setCurrentUser((prev) => ({
                                        ...prev,
                                        id_kadiv_group:
                                            e.target.value === ""
                                                ? null
                                                : Number(e.target.value),
                                        level: 2,
                                    }))
                                }
                                className="w-full px-4 py-2 border-2 rounded-lg"
                            >
                                <option value="">Pilih Tim</option>
                                {groupList.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.nama_grup}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {allowKadivInput && Number.isInteger(currentUser.id_kadiv_group) && (
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">
                                Peran di Tim
                            </label>

                            <p className="text-xs text-gray-500 mb-1">
                                {groupHasLeader
                                    ? "Tim ini sudah memiliki Team Leader."
                                    : isMovedPlacement
                                        ? "Peran tidak dapat diubah karena karyawan telah pindah tim."
                                        : "Tentukan peran karyawan dalam tim."}
                            </p>

                            <select
                                name="level"
                                value={currentUser.level ?? 2}
                                onChange={handleChange}
                                disabled={disableLeaderSelect}
                                className={`w-full px-4 py-2 border-2 rounded-lg
                ${disableLeaderSelect ? "bg-gray-100 cursor-not-allowed" : ""}
            `}
                            >
                                {/* Team Leader hanya muncul jika BELUM ADA leader */}
                                {!groupHasLeader && (
                                    <option value={1}>Team Leader</option>
                                )}
                                <option value={2}>Anggota</option>
                            </select>
                        </div>
                    )}

                    <div className="col-span-full flex flex-col mt-4">
                        <div className="flex items-center">
                            <h3 className="text-lg font-bold text-green-600">Kelola Jadwal Kerja</h3>
                            <div className="flex-grow h-1 bg-green-500 ml-4 mt-1"></div>
                        </div>

                        <p className="text-sm text-gray-500 mt-1 ml-0">
                            Pilih dan atur shift yang berlaku untuk karyawan ini agar jadwal kerja lebih
                            terstruktur.
                        </p>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Shift</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-2">
                            Pilih jadwal kerja yang berlaku untuk karyawan ini.
                        </p>

                        <select name="id_shift" value={currentUser?.id_shift || ""} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                            <option value="">Pilih Shift</option>

                            {(shiftList || [])
                                .filter((shift) =>
                                    (shift.perusahaan || []).some(
                                        (p) => p.id_perusahaan === parseInt(currentUser?.id_perusahaan)
                                    )
                                )
                                .map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama}
                                    </option>
                                ))}

                            {(shiftList || []).filter((shift) =>
                                (shift.perusahaan || []).some(
                                    (p) => p.id_perusahaan === parseInt(currentUser?.id_perusahaan)
                                )
                            ).length === 0 && (
                                    <option disabled value="">
                                        Belum ada shift untuk perusahaan ini
                                    </option>
                                )}
                        </select>
                    </div>

                    {currentUser?.id_shift && (
                        <div className="md:col-span-2 border border-gray-300 bg-green-500 rounded-md">
                            <button type="button" className="w-full px-4 py-3 flex justify-between items-center text-white font-semibold focus:outline-none" onClick={() => setShowShiftDetails((prev) => !prev)}>
                                <p className="font-semibold mb-1">Detail Jadwal {currentUser?.shift || "-"}</p>
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
                                                    const selected = (shiftList || []).find(
                                                        (s) => String(s.id) === String(currentUser?.id_shift)
                                                    );
                                                    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
                                                    const detailMap = Object.fromEntries(
                                                        (selected?.detail || []).map((d) => [d.hari, d])
                                                    );

                                                    return days.map((day) => (
                                                        <tr key={day} className="text-center">
                                                            <td className="border px-2 py-1">{day}</td>
                                                            <td className="border px-2 py-1">
                                                                {detailMap[day]?.jam_masuk?.slice(0, 5) || "-"}
                                                            </td>
                                                            <td className="border px-2 py-1">
                                                                {detailMap[day]?.jam_pulang?.slice(0, 5) || "-"}
                                                            </td>
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
                                    <strong>Karyawan Kantor:</strong> Harus <strong>daftar wajah</strong> di perangkat{" "}
                                    <strong>Face Recognition</strong> (tablet/mesin kantor) sebelum bisa absen.
                                    Username dan password tidak wajib karena absensi lewat wajah.
                                </li>
                                <li>
                                    <strong>Karyawan Lapangan:</strong> Wajib absen lewat{" "}
                                    <strong>Aplikasi Absensi Online</strong> di handphone, dengan{" "}
                                    <strong>username</strong> dan <strong>password</strong>. Sistem memakai{" "}
                                    <strong>kamera</strong> dan <strong>GPS</strong> untuk memastikan lokasi
                                    kehadiran.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Username</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-1.5">
                            Usenaame wajib diisi untuk karyawan lapangan.
                        </p>
                        <input type="text" name="username" value={currentUser.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Password</label>
                        <p className="text-sm text-gray-500 mb-2 -mt-1.5">
                            Password wajib diisi untuk karyawan lapangan.
                        </p>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} name="password" value={currentUser.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-10 outline-none" />
                            <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 cursor-pointer text-gray-500">
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </span>
                        </div>
                    </div>

                    <div className="md:col-span-2 p-6 bg-white rounded-2xl shadow-lg border border-green-300">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-lg font-bold text-gray-800">Status Karyawan</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    Tentukan apakah karyawan ini masih{" "}
                                    <span className="font-semibold text-green-700">aktif bekerja</span> atau{" "}
                                    <span className="font-semibold text-red-600">nonaktif bekerja</span>.
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
                                    <span className="font-semibold text-green-700">Karyawan aktif:</span> dapat login,
                                    mengakses sistem, dan melakukan absensi sesuai metode yang berlaku.
                                </li>
                                <li>
                                    <span className="font-semibold text-red-600">Karyawan nonaktif:</span> tidak
                                    memiliki akses, dan aktivitas absensi tidak akan tercatat.
                                </li>
                            </ul>
                            <p className="mt-2 text-gray-700">
                                Pastikan selalu memperbarui status karyawan saat ada perubahan, agar data kehadiran
                                tetap <strong>akurat</strong> dan <strong>tercatat</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-10 flex flex-row justify-end gap-3 flex-wrap">
                    <button type="button" onClick={() => navigate("/karyawan")} className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto px-4 py-2.5 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Batalkan
                    </button>

                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-4 py-2.5 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditKaryawan;
