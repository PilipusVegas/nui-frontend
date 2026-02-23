import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Select from "react-select";
import Webcam from "react-webcam";
import React, { useEffect, useRef, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { LoadingSpinner } from "../../components";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import MapRadius from "../../components/maps/MapRadius";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { getDistanceMeters } from "../../utils/locationUtils";


const showDailyInfoSwal = async () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem("absen_tim_info");
    if (lastShown === todayKey) return;
    await Swal.fire({
        title: "Informasi Absensi Tim",
        html: `
    <div style="text-align:left;font-size:14px;line-height:1.6">
        <p>Menu <strong>Absensi Tim</strong> digunakan <strong>KHUSUS</strong>
        apabila terdapat <strong>anggota tim</strong> yang tidak dapat melakukan
        absensi mandiri karena kendala teknis pada perangkat pribadi.
        </p>
        <ul style="padding-left:18px;margin-top:6px">
            <li>Handphone pribadi rusak atau hilang</li>
            <li>Fungsi GPS tidak berjalan dengan baik</li>
            <li>Kamera perangkat tidak dapat digunakan</li>
        </ul>
        <p style="margin-top:10px">
            <strong>Perhatian:</strong><br/>
            Absensi <strong>SPV TETAP WAJIB</strong> dilakukan melalui
            <strong>menu Absen</strong> seperti biasa.
        </p>
        <p style="margin-top:6px">
            Melalui menu ini, <strong>SPV melakukan absensi ATAS NAMA anggota tim</strong>
            yang mengalami kendala, <strong>bukan untuk absensi SPV sendiri</strong>.
        </p>
        <p style="margin-top:6px">
            Pengambilan <strong>foto WAJIB dilakukan bersama SPV</strong> dan
            anggota tim yang mengalami kendala sebagai bentuk validasi kehadiran.
        </p>
        <p style="margin-top:10px;font-size:12px;color:#92400e">
        Catatan: Seluruh data absensi tim akan tercatat dalam sistem dan
        <strong>diverifikasi oleh Kepala Divisi masing-masing</strong>
        sesuai ketentuan yang berlaku.
        </p>
    </div>
    `,
        icon: "info",
        confirmButtonText: "Saya Mengerti",
        confirmButtonColor: "#16a34a",
        allowOutsideClick: false,
    });
    localStorage.setItem("absen_tim_info", todayKey);
};

export default function AbsenTim() {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [user, setUser] = useState(null);
    const [jadwal, setJadwal] = useState(null);
    const [lokasiList, setLokasiList] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedLokasi, setSelectedLokasi] = useState(null);
    const [foto, setFoto] = useState(null);
    const [deskripsi, setDeskripsi] = useState("");
    const [checkedUsers, setCheckedUsers] = useState({});
    const [loading, setLoading] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [userPos, setUserPos] = useState(null);
    const [isWithinRadius, setIsWithinRadius] = useState(false);
    const isFaceRecognitionAbsen = (m) => m.absen?.kategori_absen === 2;

    /* ================= INIT ================= */
    useEffect(() => {
        showDailyInfoSwal();
    }, []);

    useEffect(() => {
        const u = getUserFromToken();
        if (u) setUser(u);
    }, []);

    useEffect(() => {
        if (!user?.id_user) return;
        fetchJadwal();
        fetchMembers();
    }, [user?.id_user]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            toast.error("Browser tidak mendukung GPS");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserPos({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            () => {
                toast.error("Gagal mendapatkan lokasi GPS");
            },
            { enableHighAccuracy: true }
        );
    }, []);

    useEffect(() => {
        if (!userPos || !selectedLokasi) {
            setIsWithinRadius(false);
            return;
        }

        const distance = getDistanceMeters(
            userPos.lat,
            userPos.lng,
            selectedLokasi.lat,
            selectedLokasi.lng
        );

        setIsWithinRadius(distance <= 60);
    }, [userPos, selectedLokasi]);

    const fetchJadwal = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/jadwal/cek/${user.id_user}`);
            const json = await res.json();
            if (!res.ok) return toast.error(json?.message || "Gagal memuat jadwal");
            setJadwal(json.data);
            setLokasiList(json.data.lokasi || []);
        } catch {
            toast.error("Gagal memuat jadwal");
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/absen/tim/member`);
            const json = await res.json();
            if (!res.ok) return toast.error(json?.message || "Gagal memuat anggota");
            setMembers(json.data || []);
            const init = {};
            json.data.forEach((m) => {
                init[m.id_user] = false;
            });
            setCheckedUsers(init);
        } catch {
            toast.error("Gagal memuat anggota tim");
        }
    };

    /* ================= CAMERA ================= */
    const capturePhoto = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;

        fetch(imageSrc)
            .then((res) => res.blob())
            .then((blob) => {
                const file = new File([blob], "absen-tim.jpg", { type: "image/jpeg" });
                const previewUrl = URL.createObjectURL(file);
                setFoto(file);
                setFotoPreview(previewUrl);
                setCameraReady(false);
                stopCamera();
            });
    };

    const stopCamera = () => {
        const stream = webcamRef.current?.stream;
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
    };

    /* ================= VALIDATION ================= */
    const validate = () => {
        if (!selectedLokasi) {
            toast.error("Pilih lokasi absensi");
            return false;
        }
        if (!foto) {
            toast.error("Foto absensi wajib diambil");
            return false;
        }
        const total = Object.values(checkedUsers).filter(Boolean).length;
        if (total === 0) {
            toast.error("Pilih minimal satu anggota tim");
            return false;
        }
        if (!isWithinRadius) {
            toast.error("Anda berada di luar radius 60 meter lokasi kerja");
            return false;
        }
        return true;
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async () => {
        // VALIDASI FORM DASAR
        if (!validate()) return;

        // VALIDASI GPS (WAJIB UNTUK REAL-TIME ABSENSI)
        if (!userPos?.lat || !userPos?.lng) {
            toast.error("Lokasi GPS tidak tersedia. Aktifkan GPS dan coba kembali.");
            return;
        }

        // AMBIL DATA ANGGOTA YANG DIPILIH
        const selectedMembers = members.filter(
            (m) => checkedUsers[m.id_user]
        );

        const memberNamesHtml = selectedMembers
            .map((m) => `<li>${m.nama}</li>`)
            .join("");

        // KONFIRMASI DETAIL (WAJIB)
        const detailConfirm = await Swal.fire({
            title: "Konfirmasi Formulir",
            html: `
        <div style="text-align:left;font-size:14px;line-height:1.6">
            <p>
                <strong>Shift Aktif:</strong><br/>
                ${jadwal?.nama_shift || "-"}
            </p>

            <p style="margin-top:8px">
                <strong>Lokasi Absensi:</strong><br/>
                ${selectedLokasi?.label || "-"}
            </p>

            <p style="margin-top:10px">
                <strong>Anggota Tim yang Dipilih:</strong>
            </p>
            <ul style="padding-left:18px;margin-top:4px">
                ${memberNamesHtml}
            </ul>

            <p style="margin-top:12px;font-size:12px;color:#b91c1c">
                Pastikan seluruh data di atas sudah benar.<br/>
                Jika absensi diverifikasi dan <strong>DITOLAK</strong>,
                maka <strong>SEMUA nama yang dipilih akan ikut ditolak</strong>.
            </p>
        </div>
        `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Kirim Absensi",
            cancelButtonText: "Periksa Kembali",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#9ca3af",
            allowOutsideClick: false,
        });

        if (!detailConfirm.isConfirmed) return;

        // KOORDINAT REAL DARI GPS
        const koordinat = `${userPos.lat},${userPos.lng}`;

        // SIAPKAN FORM DATA
        const fd = new FormData();
        fd.append("foto", foto);
        fd.append("id_lokasi", selectedLokasi.value);
        fd.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
        fd.append("id_shift", jadwal.id_shift);
        fd.append("deskripsi", deskripsi);
        fd.append("koordinat_spv", koordinat); // opsional, tapi disarankan untuk audit

        // DATA ANGGOTA
        selectedMembers.forEach((m, i) => {
            const isInValue = m.absen?.jam_mulai ? 1 : 0;
            fd.append(`users[${i}][id_user]`, m.id_user);
            fd.append(`users[${i}][id_perusahaan]`, m.id_perusahaan);
            fd.append(`users[${i}][is_in]`, isInValue);
            fd.append(`users[${i}][koordinat]`, koordinat);
            if (m.absen?.id_absen) {
                fd.append(`users[${i}][id_absen]`, m.absen.id_absen);
            }
        });

        // SUBMIT KE SERVER
        setLoading(true);
        try {
            const res = await fetchWithJwt(`${apiUrl}/absen/tim`, {
                method: "POST",
                body: fd,
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(json?.message || "Gagal absensi");
                return;
            }

            toast.success(
                "Absensi tim berhasil dikirim. Data akan diverifikasi oleh Kepala Divisi sesuai ketentuan yang berlaku.",
                { duration: 2500 }
            );

            setTimeout(() => {
                navigate("/home");
            }, 1200);
        } catch {
            toast.error("Gangguan sistem");
        } finally {
            setLoading(false);
        }
    };

    const getAbsenStatus = (absen) => {
        // Belum pernah absen sama sekali
        if (!absen || (!absen.jam_mulai && !absen.jam_selesai)) {
            return {
                label: "Belum Absen",
                color: "bg-gray-100 text-gray-600 text-[10px]",
            };
        }
        if (absen.jam_mulai && !absen.jam_selesai) {
            return {
                label: "IN",
                color: "bg-green-100 text-green-700",
            };
        }
        if (absen.jam_mulai && absen.jam_selesai) {
            return {
                label: "COMPLETE",
                color: "bg-blue-100 text-blue-700",
            };
        }

        return {
            label: "Tidak Valid",
            color: "bg-red-100 text-red-700",
        };
    };


    /* ================= RENDER ================= */
    return (
        <MobileLayout title="Absensi Tim">
            <div className="pb-24">
                <div className="bg-white rounded-xl shadow-sm border p-4 space-y-5">

                    {/* ===== INFO SINGKAT ===== */}
                    <div className="text-sm text-gray-700 leading-relaxed">
                        <p className="font-medium mb-1">Ketentuan Absensi Tim</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                            <li>
                                Foto <strong>WAJIB bersama SPV & anggota tim</strong>
                            </li>
                            <li>
                                Data akan <strong>diverifikasi Kepala Divisi</strong>
                            </li>
                        </ul>
                    </div>

                    {/* ===== FOTO ===== */}
                    <div className="space-y-2">
                        <div className="flex items-start justify-between">
                            {/* KIRI: TITLE + NOTE */}
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">Foto Absensi</p>
                                <p className="text-[11px] text-gray-600">
                                    Pastikan semua anggota yang dipilih terlihat di foto
                                </p>
                            </div>

                            {/* KANAN: BUTTON */}
                            {foto && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (fotoPreview) URL.revokeObjectURL(fotoPreview);
                                        stopCamera();
                                        setFoto(null);
                                        setFotoPreview(null);
                                        setCameraReady(false);
                                    }}
                                    className="p-1.5 px-3 rounded-md bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 active:scale-95 transition"
                                    title="Ambil ulang foto"
                                    aria-label="Ambil ulang foto"
                                >
                                    <FontAwesomeIcon icon={faRotateLeft} size="sm" />
                                </button>
                            )}
                        </div>

                        {!foto ? (
                            <div className="rounded-lg border bg-gray-50 overflow-hidden">
                                <div className="relative w-full" style={{ paddingTop: "75%" }}>
                                    {!cameraReady && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <LoadingSpinner message="Menyiapkan kamera..." />
                                        </div>
                                    )}

                                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "environment" }}
                                        className={`absolute inset-0 w-full h-full object-cover ${cameraReady ? "block" : "hidden"}`}
                                        onUserMedia={() => setCameraReady(true)}
                                        onUserMediaError={() => toast.error("Kamera tidak dapat diakses")}
                                    />
                                </div>

                                {cameraReady && (
                                    <button type="button" onClick={capturePhoto} className="w-full py-2 bg-green-600 text-white text-sm font-medium">
                                        Ambil Foto
                                    </button>
                                )}
                            </div>
                        ) : (
                            <img src={fotoPreview} alt="Preview" className="w-full rounded-lg border object-cover" style={{ aspectRatio: "4 / 3" }} />
                        )}
                    </div>

                    {/* ===== SHIFT ===== */}
                    <div>
                        <label className="text-sm font-medium">Shift</label>
                        <input type="text" disabled value={jadwal?.nama_shift || ""} className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-gray-100" />
                        <p className="text-[11px] text-gray-600 mt-1">
                            Shift ditentukan Kepala Divisi dan tidak dapat diubah
                        </p>
                    </div>

                    {/* ===== LOKASI ===== */}
                    <div className="space-y-2">
                        {userPos && selectedLokasi?.lat && selectedLokasi?.lng && (
                            <MapRadius user={userPos} location={{ lat: selectedLokasi.lat, lng: selectedLokasi.lng }} radius={60} />
                        )}
                        <label className="text-sm font-medium">Lokasi Absensi</label>
                        <Select
                            options={lokasiList.map((l) => ({
                                value: l.id,
                                label: l.nama,
                                lat: l.latitude,
                                lng: l.longitude,
                            }))}
                            value={selectedLokasi}
                            onChange={setSelectedLokasi}
                            placeholder="Pilih lokasi"
                        />

                        {userPos && selectedLokasi && (
                            <p className={`text-xs font-medium ${isWithinRadius ? "text-green-600" : "text-red-600"}`}>
                                Jarak:{" "}
                                {Math.round(
                                    getDistanceMeters(
                                        userPos.lat,
                                        userPos.lng,
                                        selectedLokasi.lat,
                                        selectedLokasi.lng
                                    )
                                )}{" "}
                                m
                                {!isWithinRadius && " (di luar radius)"}
                            </p>
                        )}
                    </div>

                    {/* ===== ANGGOTA ===== */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Anggota Terkendala</p>
                        <p className="text-xs text-gray-500">
                            Pilih anggota yang tidak bisa absen mandiri
                        </p>

                        {members.length === 0 ? (
                            <p className="text-xs text-yellow-600">
                                Belum ada anggota tim
                            </p>
                        ) : (
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {members.map((m) => {
                                    const isFaceAbsen = m.absen?.kategori_absen === 2;
                                    const isCompleted = !!m.absen?.jam_selesai;
                                    const isDisabled = isFaceAbsen || isCompleted;
                                    const status = getAbsenStatus(m.absen);

                                    return (
                                        <label
                                            key={m.id_user}
                                            className={`flex items-center justify-between gap-3 p-2 rounded-lg border text-sm cursor-pointer
                                                ${isDisabled ? "bg-gray-100 text-gray-400" : "hover:bg-gray-50"}
                                            `}
                                            onClick={() => {
                                                if (isFaceAbsen) {
                                                    toast.error("Anggota ini sudah melakukan absensi Face Recognition dan tidak dapat menggunakan fitur Absensi Tim.");
                                                }
                                            }}
                                        >
                                            {/* KIRI: CHECKBOX + NAMA */}
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={!!checkedUsers[m.id_user]}
                                                    disabled={isDisabled}
                                                    onChange={(e) => {
                                                        if (isDisabled) return;
                                                        setCheckedUsers((p) => ({
                                                            ...p,
                                                            [m.id_user]: e.target.checked,
                                                        }));
                                                    }}
                                                />
                                                <span className="text-xs font-medium">{m.nama}</span>
                                            </div>

                                            {/* KANAN: STATUS BADGE */}
                                            <div className="flex items-center gap-2">
                                                {isFaceAbsen && (
                                                    <span className="text-[10px] text-red-500 font-medium">
                                                        Face Recognition
                                                    </span>
                                                )}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ===== ALASAN ===== */}
                    <div>
                        <label className="text-sm font-medium">Alasan Kendala</label>
                        <textarea rows={3} className="w-full mt-1 px-3 py-2 text-sm border rounded-lg" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Jelaskan kendala secara singkat dan jelas" />
                    </div>

                    {/* ===== SUBMIT ===== */}
                    <button disabled={loading} onClick={handleSubmit} className={`w-full py-3 rounded-lg text-white font-semibold ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
                        {loading ? "Mengirim..." : "Kirim Absensi Tim"}
                    </button>
                </div>
            </div>
        </MobileLayout>
    );
}