import React, { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faInfoCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal } from "../../components";
import { formatForDB, formatForInput } from "../../utils/dateUtils";

const AbsenManual = () => {
    const navigate = useNavigate();
    const user = getUserFromToken();
    const [profil, setProfil] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [lokasi, setLokasi] = useState([]);
    const [idUser, setIdUser] = useState(null);
    const [absenData, setAbsenData] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [showInfo, setShowInfo] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const getDefaultTipeAbsensi = (user) => user.face_registered ? 2 : 1;
    const [selectedDate, setSelectedDate] = useState(() => { return new Date().toISOString().split("T")[0]; });

    useEffect(() => {
        if (!idUser) {
            setSelectedUser(null);
            setFormData(defaultFormData(null));
            return;
        }

        const userDetail = profil.find(p => p.id === idUser);
        setSelectedUser(userDetail || null);

        if (userDetail) {
            setFormData(f => ({
                ...f,
                id_user: idUser,
                tipe_absensi: getDefaultTipeAbsensi(userDetail),
                id_shift: userDetail.id_shift || null,
            }));
        }
    }, [idUser, profil]);


    const defaultFormData = (idUser = null) => ({
        id_user: idUser,
        id_absen: null,
        tipe_absensi: null,
        id_shift: null,
        id_lokasi_mulai: null,
        id_lokasi_selesai: null,
        jam_mulai: "",
        jam_selesai: "",
        remark: "",
        remark_status: null,
    });
    const [formData, setFormData] = useState(defaultFormData(idUser));

    useEffect(() => {
        (async () => {
            try {
                const [u, s, l] = await Promise.all([
                    fetchWithJwt(`${apiUrl}/profil`).then(r => r.json()),
                    fetchWithJwt(`${apiUrl}/shift`).then(r => r.json()),
                    fetchWithJwt(`${apiUrl}/lokasi`).then(r => r.json()),
                ]);

                // Filter user dengan status 1
                const filteredProfil = (u.data || []).filter(user => user.status === 1);

                setProfil(filteredProfil);
                setShifts(s.data || []);
                setLokasi(l.data || []);
            } catch {
                toast.error("Gagal memuat data awal");
            }
        })();
    }, [apiUrl]);

    const cekAbsen = async () => {
        if (!idUser || !selectedDate) {
            toast.error("Pilih karyawan dan tanggal dulu");
            return;
        }

        const day = new Date(selectedDate).getDay();
        if (day === 0) {
            toast.error("Hari Minggu tidak bisa dipilih, karena jadwal shift hanya sampai Sabtu. Silahkan pilih tanggal lain");
            return;
        }
        try {
            const res = await fetchWithJwt(`${apiUrl}/absen/cek-manual/${idUser}?date=${selectedDate}`);
            const data = await res.json();
            const absen = Array.isArray(data.data) ? data.data[0] || null : data.data || null;
            setAbsenData(absen);
            setIsChecked(true);

            if (absen) {
                // Kalau ada data absen → isi dari absen
                setFormData(f => ({
                    ...defaultFormData(idUser),
                    id_absen: absen.id_absen,
                    tipe_absensi: absen.tipe_absensi ?? null,
                    id_shift: absen.id_shift ?? null,
                    id_lokasi_mulai: absen.id_lokasi_mulai ?? null,
                    id_lokasi_selesai: absen.id_lokasi_selesai ?? null,
                    jam_mulai: absen?.jam_mulai ? formatForInput(absen.jam_mulai, absen.tipe_absensi) : "",
                    jam_selesai: absen.jam_selesai ? formatForInput(absen.jam_selesai, absen.tipe_absensi) : "",
                    remark: absen.remark ?? "",
                    remark_status: absen.remark_status ?? null,
                }));
                toast.success("Data absen ditemukan, form sudah terisi");
            } else {
                const userDetail = profil.find(p => p.id === idUser);
                setFormData(f => ({
                    ...defaultFormData(idUser),
                    tipe_absensi: getDefaultTipeAbsensi(userDetail),
                    id_shift: userDetail.id_shift || null,
                }));
                toast("Belum ada absen pada tanggal ini");
            }
        } catch {
            toast.error("Gagal mengambil data absen");
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const f = formData;
        if (!f.id_user || !f.tipe_absensi || !f.id_shift || !f.jam_mulai || !f.remark || !f.remark_status) {
            toast.error("Lengkapi semua field");
            return;
        }

        let fullJamMulai;
        let fullJamSelesai = f.jam_selesai || null;

        if (f.tipe_absensi === 1) {
            // Lapangan → jam_mulai sudah datetime-local
            fullJamMulai = f.jam_mulai;
            fullJamSelesai = f.jam_selesai || null;
        } else {
            // Kantor → gabungkan selectedDate + jam
            fullJamMulai = `${selectedDate}T${f.jam_mulai}`;
            fullJamSelesai = f.jam_selesai ? `${selectedDate}T${f.jam_selesai}` : null;
        }


        // Validasi jam_mulai untuk lapangan
        if (f.tipe_absensi === 1) {
            const startDateTime = new Date(fullJamMulai);
            const minDateTime = new Date(selectedDate);
            // ijinkan jika masih dalam range ±1 hari
            if (startDateTime.getTime() < minDateTime.getTime() - (24 * 60 * 60 * 1000)) {
                toast.error("Jam mulai terlalu jauh sebelum tanggal yang dipilih");
                return;
            }
        }

        try {
            const payload = {
                ...f,
                jam_mulai: formatForDB(fullJamMulai),
                jam_selesai: fullJamSelesai ? formatForDB(fullJamSelesai) : null,
                id_lokasi_mulai: f.tipe_absensi === 1 ? f.id_lokasi_mulai : null,
                id_lokasi_selesai: f.tipe_absensi === 1 ? f.id_lokasi_selesai : null,
            };

            const res = await fetchWithJwt(`${apiUrl}/absen/manual`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error();

            toast.success(f.id_absen ? "Absen berhasil diperbarui" : "Absen baru berhasil ditambahkan");

            // Reset form
            setFormData(defaultFormData(null));
            setAbsenData(null);
            setIsChecked(false);
            setIdUser(null);
            setSelectedDate("");
            navigate("/remark-absensi");
        } catch {
            toast.error("Gagal menyimpan absen");
        }
    };


    useEffect(() => {
        setIsChecked(false);
        setAbsenData(null);
        setFormData(defaultFormData(idUser));
    }, [idUser]);


    return (
        <div className="flex flex-col">
            <SectionHeader title="Remark Absensi" subtitle="Cek dan kelola absensi karyawan. Jika belum absen, buat baru; jika sudah, perbarui datanya." onBack={() => navigate("/")}
                actions={
                    <button type="button" onClick={() => setShowInfo(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center rounded-md">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                        Informasi Fitur Remark
                    </button>}
            />

            <div className="p-4 space-y-6 mb-20">
                {selectedUser && (
                    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 space-y-3">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <h3 className="text-xl font-semibold text-gray-900">{selectedUser.nama}</h3>
                            <span className={`text-sm font-medium ${selectedUser.face_registered ? "text-green-700 bg-green-100 px-3 py-1 rounded" : "text-blue-700 bg-blue-100 px-3 py-1 rounded"}`}>
                                {selectedUser.face_registered ? "Karyawan Kantor" : "Karyawan Lapangan"}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-sm">
                            {selectedUser.nik && (
                                <div>
                                    <p className="font-medium text-gray-800">NIK / NIP</p>
                                    <p>{selectedUser.nik}</p>
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-800">Perusahaan</p>
                                <p>{selectedUser.perusahaan || "-"}</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Shift</p>
                                <p>{selectedUser.shift || "-"}</p>
                            </div>
                            {selectedUser.role && (
                                <div>
                                    <p className="font-medium text-gray-800">Divisi / Role</p>
                                    <p>{selectedUser.role}</p>
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-800">Status Bekerja</p>
                                <p>{selectedUser.status ? "Aktif" : "Tidak Aktif"}</p>
                            </div>
                        </div>

                        <div>
                            <p className="font-medium text-gray-800 mb-1">Absensi</p>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                {selectedUser.face_registered ? "Karyawan terdaftar pada sistem Face Recognition dan melakukan absensi melalui pemindaian wajah." : "Karyawan tidak terdaftar pada sistem Face Recognition dan menggunakan aplikasi absensi online."}
                            </p>
                        </div>

                        <p className="text-xs text-gray-400 italic">
                            Catatan: Pastikan data karyawan selalu diperbarui agar laporan kehadiran tetap akurat.
                        </p>
                    </div>
                )}

                <form onSubmit={e => { e.preventDefault(); cekAbsen(); }}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Cari Tanggal Absen
                            </label>
                            <input type="date" className="border rounded-md px-3 py-1.5 border-gray-300 w-full focus:ring-2 focus:ring-green-500 focus:outline-none" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Cari Nama Karyawan
                            </label>
                            <div onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (idUser) cekAbsen(); } }}>
                                <Select options={profil.map(p => ({ value: p.id, label: p.nama }))} value={idUser ? { value: idUser, label: profil.find(p => p.id === idUser)?.nama } : null} onChange={(opt) => setIdUser(opt?.value || null)} placeholder="Pilih karyawan" isClearable />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium shadow-sm flex items-center transition">
                            <FontAwesomeIcon icon={faSearch} className="mr-2" />
                            Cek Absensi
                        </button>
                    </div>
                </form>

                {isChecked && (
                    <form onSubmit={handleSubmit} className="space-y-6 border-t border-gray-200 pt-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipe Absensi</label>
                                <Select value={formData.tipe_absensi ? { value: formData.tipe_absensi, label: formData.tipe_absensi === 1 ? "Lapangan" : "Kantor" } : null}
                                    onChange={opt => setFormData(f => ({ ...f, tipe_absensi: opt.value }))}
                                    options={[
                                        { value: 1, label: "Absensi Online Lapangan" },
                                        { value: 2, label: "Absensi Pemindai Wajah ( Face Recognition )" }
                                    ]}
                                    isDisabled={!!absenData}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Shift Kerja</label>
                                <Select options={shifts.map(s => ({ value: s.id, label: s.nama }))} value={formData.id_shift ? { value: formData.id_shift, label: shifts.find(s => s.id === formData.id_shift)?.nama } : null} onChange={opt => setFormData(f => ({ ...f, id_shift: opt.value }))} />
                            </div>

                            {formData.tipe_absensi === 1 && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Lokasi Mulai</label>
                                    <Select options={lokasi.map(l => ({ value: l.id, label: l.nama }))} value={formData.id_lokasi_mulai ? { value: formData.id_lokasi_mulai, label: lokasi.find(l => l.id === formData.id_lokasi_mulai)?.nama } : null} onChange={opt => setFormData(f => ({ ...f, id_lokasi_mulai: opt.value }))} />
                                </div>
                            )}

                            {formData.tipe_absensi === 1 && absenData && formData.jam_mulai && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Lokasi Selesai</label>
                                    <Select options={lokasi.map(l => ({ value: l.id, label: l.nama }))} value={formData.id_lokasi_selesai ? { value: formData.id_lokasi_selesai, label: lokasi.find(l => l.id === formData.id_lokasi_selesai)?.nama } : null} onChange={opt => setFormData(f => ({ ...f, id_lokasi_selesai: opt.value }))} />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Jam Masuk</label>
                                <input lang="id" type={formData.tipe_absensi === 1 ? "datetime-local" : "time"} step="60" value={formData.jam_mulai || ""} onChange={e => setFormData(f => ({ ...f, jam_mulai: e.target.value }))} className="border rounded px-3 py-2 w-full" />
                            </div>

                            {absenData && formData.jam_mulai && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jam Pulang</label>
                                    <input type={formData.tipe_absensi === 1 ? "datetime-local" : "time"} className="border rounded px-3 py-2 w-full" value={formData.jam_selesai || ""} onChange={e => setFormData(f => ({ ...f, jam_selesai: e.target.value }))} />
                                </div>
                            )}

                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Catatan / Remark</label>
                                <div>
                                    <textarea className="border rounded px-3 py-2 w-full resize-y min-h-[80px]" placeholder="Tuliskan alasan, contoh: sakit, dinas luar, izin datang terlambat..." value={formData.remark} onChange={e => setFormData(f => ({ ...f, remark: e.target.value }))} disabled={!!absenData?.remark_by && !!formData.remark} />

                                    {absenData?.remark_by && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Data absen ini sudah diremark oleh: {absenData.remark_by}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Status Remark</label>
                                <Select value={formData.remark_status ? { value: formData.remark_status, label: formData.remark_status === 1 ? "Absen Manual" : formData.remark_status === 2 ? "Izin Terlambat" : formData.remark_status === 3 ? "Izin Pulang Awal" : "Cuti", } : null}
                                    onChange={(opt) =>
                                        setFormData((f) => ({
                                            ...f,
                                            remark_status: opt.value,
                                        }))
                                    }
                                    options={[
                                        { value: 1, label: "Absen Manual" },
                                        { value: 2, label: "Izin Terlambat" },
                                        { value: 3, label: "Izin Pulang Awal" },
                                        { value: 4, label: "Cuti" },
                                    ]}
                                    isDisabled={!!absenData?.remark_by && !!formData.remark_status}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button type="button" onClick={() => navigate("/")} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center">
                                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Batal
                            </button>
                            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center">
                                <FontAwesomeIcon icon={faSave} className="mr-2" /> {absenData ? "Perbarui Absen" : "Simpan Absen"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="Informasi Absensi Manual" note="Panduan lengkap penggunaan fitur Absensi Manual" size="xl">
                <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                    <p>
                        Fitur <b>Remark Absensi</b> disediakan sebagai solusi darurat ketika
                        absensi otomatis melalui kamera dan GPS tidak dapat dilakukan
                        (misalnya karena kendala teknis, perangkat bermasalah, atau kondisi
                        force majeure lainnya). Dengan fitur ini, admin/HR dapat
                        <b> mengecek</b>, <b>menambahkan</b>, atau <b>memperbarui</b> data
                        absensi karyawan secara langsung.
                    </p>

                    <h3 className="font-semibold text-green-600">1. Pemilihan Awal</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Pilih <b>Nama Karyawan</b> dari daftar.</li>
                        <li>Tentukan <b>Tanggal Absensi</b> yang ingin diperiksa atau dibuat.</li>
                        <li>Klik tombol <b>Cek Absensi</b>:
                            <ul className="list-circle pl-6">
                                <li>Jika data sudah ada → form otomatis terisi, siap untuk diperbarui.</li>
                                <li>Jika belum ada → form kosong, siap untuk dibuat baru.</li>
                            </ul>
                        </li>
                    </ul>

                    <h3 className="font-semibold text-green-600">2. Tipe Karyawan</h3>
                    <p>Pilih tipe karyawan sesuai penempatan:</p>
                    <ul className="list-disc pl-5">
                        <li><b>Karyawan Lapangan</b>: wajib mengisi <b>Lokasi Mulai</b> dan <b>Lokasi Selesai</b>.</li>
                        <li><b>Karyawan Kantor</b>: cukup memilih shift dan jam kerja.</li>
                    </ul>

                    <h3 className="font-semibold text-green-600">3. Data Shift & Jam Kerja</h3>
                    <ul className="list-disc pl-5">
                        <li>Pilih <b>Shift</b> sesuai jadwal karyawan.</li>
                        <li>Isi <b>Jam Masuk</b> (wajib) dan <b>Jam Pulang</b> (opsional, bila karyawan sudah pulang namun lupa absen).</li>
                    </ul>

                    <h3 className="font-semibold text-green-600">4. Remark & Status</h3>
                    <ul className="list-disc pl-5">
                        <li>
                            Tambahkan <b>Remark</b> bila ada catatan khusus
                            (contoh: "lupa absen pulang", "izin terlambat karena macet", "kendala sinyal").
                        </li>
                        <li>
                            Pilih <b>Status Remark</b> sesuai dengan kondisi aktual karyawan:
                            <ul className="list-circle pl-6">
                                <li>
                                    <b>Absen Manual</b>: digunakan apabila data absensi harus dibuat secara
                                    manual karena kendala teknis seperti perangkat rusak, sistem error,
                                    atau keadaan darurat (*force majeure*). Meskipun dibuat manual, data ini
                                    tetap tercatat sebagai absensi resmi dan sah.
                                </li>
                                <li>
                                    <b>Izin Terlambat</b>: digunakan jika karyawan telah memberi
                                    pemberitahuan sebelumnya kepada HR atau atasan terkait keterlambatan
                                    (contoh: kemacetan, keperluan keluarga, urusan pribadi mendesak, dll.).
                                    Dengan status ini, waktu keterlambatan tidak akan dihitung sehingga tidak
                                    memengaruhi rekap keterlambatan karyawan.
                                </li>
                                <li>
                                    <b>Izin Pulang Awal</b>: digunakan bila karyawan harus meninggalkan
                                    pekerjaan lebih awal dengan izin dari HR atau atasan (contoh: urusan
                                    keluarga, keadaan darurat, keperluan pribadi, dll.). Status ini akan
                                    menandai absensi sebagai <i>setengah hari kerja</i> (half-day).
                                </li>
                                <li>
                                    <b>Cuti</b>: digunakan bila karyawan tidak masuk kerja selama satu hari
                                    penuh atau lebih karena telah mengajukan cuti resmi kepada HR/atasan.
                                    Contohnya seperti cuti tahunan, cuti sakit, cuti melahirkan, atau cuti
                                    penting lainnya. Dengan status ini, sistem akan menandai hari tersebut
                                    sebagai <i>hari tidak bekerja resmi</i> tanpa dianggap absen.
                                </li>
                            </ul>
                        </li>
                    </ul>

                    <h3 className="font-semibold text-green-600">5. Simpan & Kelola</h3>
                    <ul className="list-disc pl-5">
                        <li><b>Simpan Absen</b>: membuat data absensi baru.</li>
                        <li><b>Perbarui Absen</b>: memperbarui data absensi yang sudah ada.</li>
                        <li><b>Kosongkan Input</b>: mereset form agar bisa diisi ulang.</li>
                        <li><b>Batal</b>: keluar tanpa menyimpan perubahan.</li>
                    </ul>

                    <p className="italic text-gray-600">
                        ⚠️ Wajib diisi: Tipe Karyawan, Shift, Jam Masuk, Remark, dan Status Remark.
                        Gunakan fitur ini hanya bila absensi otomatis tidak dapat dilakukan.
                    </p>
                </div>
            </Modal>

        </div>
    );
};

export default AbsenManual;
