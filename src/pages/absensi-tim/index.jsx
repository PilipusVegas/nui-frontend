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
    const [distanceMeter, setDistanceMeter] = useState(null);

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

                // 🔴 INI PENTING
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
        if (!validate()) return;

        // AMBIL DATA YANG DIPILIH
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

        // SUBMIT KE SERVER
        const fd = new FormData();
        fd.append("foto", foto);
        fd.append("id_lokasi", selectedLokasi.value);
        fd.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
        fd.append("id_shift", jadwal.id_shift);
        fd.append("deskripsi", deskripsi);

        let i = 0;
        selectedMembers.forEach((m) => {
            const isInValue = m.absen?.jam_mulai ? 1 : 0;

            fd.append(`users[${i}][id_user]`, m.id_user);
            fd.append(`users[${i}][id_perusahaan]`, m.id_perusahaan);
            fd.append(`users[${i}][is_in]`, isInValue);
            fd.append(`users[${i}][koordinat]`, "-5.094422,119.512561");

            if (m.absen?.id_absen) {
                fd.append(`users[${i}][id_absen]`, m.absen.id_absen);
            }

            i++;
        });

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

    /* ================= RENDER ================= */
    return (
        <MobileLayout title="Absensi Tim">
            <div className="pb-24">
                <div className="bg-white rounded-2xl shadow border p-4 space-y-5">
                    <div>
                        {/* HEADER */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="space-y-0.5">
                                <span className="text-sm font-medium block">
                                    Foto Absensi
                                </span>
                                <span className="text-[10px] text-gray-500 leading-tight-mt-2">
                                    Ambil foto <strong>bersama SPV</strong> dan <strong>anggota yang terkendala.</strong>
                                </span>
                            </div>

                            {foto && (
                                <button type="button"
                                    onClick={() => {
                                        if (fotoPreview) {
                                            URL.revokeObjectURL(fotoPreview);
                                        }
                                        stopCamera();
                                        setFoto(null);
                                        setFotoPreview(null);
                                        setCameraReady(false);
                                    }}
                                    className="flex items-center justify-center text-red-600 hover:text-red-700 bg-red-100 border border-red-300 rounded-md px-3 py-3 shadow"
                                    title="Ambil Ulang Foto"
                                >
                                    <FontAwesomeIcon icon={faRotateLeft} />
                                </button>
                            )}
                        </div>

                        {/* CONTENT */}
                        {!foto ? (
                            <div className="rounded-xl border bg-gray-50 overflow-hidden">
                                <div className="relative w-full" style={{ paddingTop: "75%" }}>
                                    {!cameraReady && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <LoadingSpinner message="Menyiapkan kamera, mohon tunggu..." />
                                        </div>
                                    )}

                                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg"
                                        videoConstraints={{
                                            facingMode: "environment",
                                            width: { ideal: 1280 },
                                            height: { ideal: 960 },
                                        }}
                                        className={`absolute inset-0 w-full h-full object-cover ${cameraReady ? "block" : "hidden"
                                            }`}
                                        onUserMedia={() => setCameraReady(true)}
                                        onUserMediaError={() => {
                                            setCameraReady(false);
                                            toast.error("Kamera tidak dapat diakses. Periksa izin kamera.");
                                        }}
                                    />
                                </div>

                                {cameraReady && (
                                    <button type="button" onClick={capturePhoto} className="w-full py-2 bg-green-600 text-white font-semibold">
                                        Ambil Foto
                                    </button>
                                )}
                            </div>
                        ) : (
                            <img src={fotoPreview} alt="Preview" className="w-full rounded-xl border object-cover" style={{ aspectRatio: "4 / 3" }} />
                        )}
                    </div>

                    {/* SHIFT (INPUT DISABLED) */}
                    <div>
                        <label className="text-sm font-medium">Shift Aktif</label>
                        <input type="text" disabled value={jadwal?.nama_shift || ""} className="w-full mt-1 px-3 py-2 text-sm rounded-lg border bg-gray-100" />
                    </div>

                    {/* MAP LOKASI */}
                    {userPos && selectedLokasi?.lat && selectedLokasi?.lng && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Peta Lokasi Absensi</div>
                            <MapRadius user={userPos} location={{ lat: selectedLokasi.lat, lng: selectedLokasi.lng }} radius={60} />
                        </div>
                    )}

                    {/* LOKASI */}
                    <div>
                        <label className="text-sm font-medium">Lokasi Absensi</label>
                        <Select
                            options={lokasiList.map((l) => ({
                                value: l.id,
                                label: l.nama,
                                lat: l.latitude,
                                lng: l.longitude,
                                radius: 60,
                            }))}
                            value={selectedLokasi}
                            onChange={setSelectedLokasi}
                            placeholder="Pilih lokasi sesuai jadwal"
                        />
                    </div>

                    {/* ANGGOTA TIM (SCROLLABLE) */}
                    <div>
                        <div className="text-sm font-medium mb-2">
                            Anggota Tim Anda
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {members.map((m) => {
                                const isDisabled = !!m.absen?.jam_selesai;
                                return (
                                    <label key={m.id_user}
                                        className={`flex items-center gap-3 p-2 rounded-lg border text-sm cursor-pointer
                                        ${isDisabled ? "bg-gray-100 text-gray-400" : ""}`}
                                        onClick={() => {
                                            if (isDisabled) {
                                                toast.error(
                                                    "Absensi karyawan ini sudah lengkap. Absensi berikutnya dapat dilakukan setelah 24 jam."
                                                );
                                            }
                                        }}
                                    >
                                        <input type="checkbox" checked={!!checkedUsers[m.id_user]} disabled={isDisabled}
                                            onChange={(e) =>
                                                setCheckedUsers((p) => ({
                                                    ...p,
                                                    [m.id_user]: e.target.checked,
                                                }))
                                            }
                                        />
                                        <span className="leading-tight">{m.nama}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Alasan Kendala</label>
                        <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Contoh: Absensi pagi tim lapangan" />
                    </div>
                    <button disabled={loading} onClick={handleSubmit} className={`w-full py-3 rounded-lg font-semibold text-white
                        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                    >
                        {loading ? "Mengirim..." : "Kirim Absensi Tim"}
                    </button>
                </div>
            </div>
        </MobileLayout>
    );
}