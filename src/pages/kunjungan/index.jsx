import { useEffect, useMemo, useState, useRef } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { MapRoute, LoadingSpinner } from "../../components";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { getDistanceMeters } from "../../utils/locationUtils";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import KunjunganActionModal from "./KunjunganActionModal";
import Timeline from "./Timeline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCamera, faClock, faRotateRight, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
const MAX_RADIUS = 60;

export default function Kunjungan() {
    const apiurl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    // ================= STATE UTAMA =================
    const [gps, setGps] = useState(null);
    const [shiftId, setShiftId] = useState(null);
    const [lokasiUser, setLokasiUser] = useState(null);
    const [tripId, setTripId] = useState(null);
    const [history, setHistory] = useState([]);
    const [modal, setModal] = useState(null);
    const [note, setNote] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [tripInfo, setTripInfo] = useState(null);
    const [prerequisite, setPrerequisite] = useState({ status_kendaraan: null, user_lokasi: null });
    const [jadwalLokasi, setJadwalLokasi] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const gpsErrorShown = useRef(false);


    // ================= UTIL =================
    const parseCoord = (str) => {
        if (!str) return null;
        const [lat, lng] = str.split(",").map(Number);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return null;
        }
        return { lat, lng };
    };

    // ================= DERIVED =================
    const nearbyLocation = useMemo(() => {
        if (!gps || !jadwalLokasi.length) return null;
        let closest = null;
        for (const loc of jadwalLokasi) {
            const coord = parseCoord(`${loc.latitude},${loc.longitude}`);
            if (!coord) continue;
            const distance = getDistanceMeters(gps.lat, gps.lng, coord.lat, coord.lng);
            if (distance <= MAX_RADIUS) {
                if (!closest || distance < closest.distance) {
                    closest = { ...loc, distance };
                }
            }
        }
        return closest;
    }, [gps, jadwalLokasi]);

    // ================= EFFECT =================
    useEffect(() => {
        const id = navigator.geolocation.watchPosition(
            (p) => {
                setGps({
                    lat: p.coords.latitude,
                    lng: p.coords.longitude
                });
            },
            () => {
                if (!gpsErrorShown.current) {
                    toast.error("GPS tidak aktif");
                    gpsErrorShown.current = true;
                }
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000,
            }
        );

        return () => navigator.geolocation.clearWatch(id);
    }, []);

    useEffect(() => {
        fetchJadwal();
        fetchTrip();
    }, []);


    // ================= FETCH =================
    const fetchJadwal = async () => {
        try {
            const user = await getUserFromToken(apiurl);
            const res = await fetchWithJwt(`${apiurl}/jadwal/cek/${user.id_user}`);
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.message || "Gagal memuat jadwal");
                return;
            }
            const jadwal = Array.isArray(json.data) ? json.data[0] : json.data;
            setShiftId(jadwal?.id_shift || null);
            setLokasiUser(jadwal?.lokasi_user || null);
            setJadwalLokasi((jadwal?.lokasi || []).filter((l) => l.kategori === 1 || l.kategori === 2));
        } catch {
            toast.error("Gagal mengambil data jadwal");
        }
    };

    const fetchTrip = async () => {
        try {
            const res = await fetchWithJwt(`${apiurl}/trip/user`);
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.message);
                return;
            }
            setPrerequisite({
                status_kendaraan: json.data.status_kendaraan,
                user_lokasi: json.data.user_lokasi,
            });
            // ❗ Jika tidak ada trip aktif → reset semua state
            if (!json.data || !json.data.lokasi || json.data.lokasi.length === 0) {
                setTripId(null);
                setTripInfo(null);
                setHistory([]);
                return;
            }
            setTripId(json.data.id_trip);
            setTripInfo({
                id_trip: json.data.id_trip,
                tanggal: json.data.tanggal,
                created_at: json.data.created_at,
            });
            setHistory(
                json.data.lokasi.map((l) => ({
                    id: l.id_trip_lokasi,
                    kategori: l.kategori,
                    nama: l.nama_lokasi,
                    jam_mulai: l.jam_mulai,
                    jam_selesai: l.jam_selesai,
                    jarak: l.jarak,
                    deskripsi: l.deskripsi,
                    id_lokasi: l.id_lokasi,
                    lat: l.latitude ? Number(l.latitude) : null,
                    lng: l.longitude ? Number(l.longitude) : null,
                })),
            );
        } catch {
            toast.error("Koneksi ke server gagal");
        }
    };

    // ================= ACTION =================
    const startVisit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (!shiftId) return toast.error("Tidak ada shift aktif");
            if (!photo) return toast.error("Foto wajib diambil");
            const fd = new FormData();
            fd.append("id_shift", shiftId);
            fd.append("foto", photo);
            const res = await fetchWithJwt(`${apiurl}/trip/user`, {
                method: "POST",
                body: fd,
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.message);
                return;
            }
            toast.success(json.message);
            resetModalState();
            setModal(null);
            fetchTrip();
        } catch {
            toast.error("Koneksi ke server gagal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const checkIn = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (!tripId) {
                toast.error("Silakan berangkat kunjungan terlebih dahulu.");
                return;
            }
            if (!nearbyLocation) {
                toast.error("Anda tidak berada di lokasi kunjungan");
                return;
            }
            if (nearbyLocation.id === lastVisitedLocationId) {
                toast.error(
                    "Anda baru saja mengunjungi lokasi ini. Silakan kunjungi lokasi lain terlebih dahulu.",
                );
                return;
            }
            if (!photo) {
                toast.error("Foto & keterangan wajib");
                return;
            }
            const target = parseCoord(`${nearbyLocation.latitude},${nearbyLocation.longitude}`);
            const jarak = Math.round(getDistanceMeters(gps.lat, gps.lng, target.lat, target.lng));
            if (jarak > MAX_RADIUS) {
                toast.error("Anda di luar radius lokasi");
                return;
            }
            const fd = new FormData();
            fd.append("id_lokasi", nearbyLocation.id);
            fd.append("foto", photo);
            fd.append("deskripsi", note);
            fd.append("koordinat", `${gps.lat},${gps.lng}`);
            const res = await fetchWithJwt(`${apiurl}/trip/user/in/${tripId}`, {
                method: "PUT",
                body: fd,
            });
            const json = await res.json();
            if (res.status === 409) {
                toast.error(json.message || "Tidak dapat check-in");
                return;
            }
            if (!res.ok) {
                toast.error(json.message || "Gagal check-in");
                return;
            }
            toast.success(json.message || "Check-in berhasil");
            resetModalState();
            setModal(null);
            fetchTrip();
        } catch (err) {
            toast.error("Koneksi ke server gagal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const checkOut = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (!activeLocation?.id) {
                toast.error("Lokasi aktif tidak ditemukan");
                return;
            }
            if (!photo) {
                toast.error("Foto & keterangan wajib");
                return;
            }
            if (!gps?.lat || !gps?.lng) {
                toast.error("GPS belum siap");
                return;
            }
            const lokasiJadwal = jadwalLokasi.find((l) => l.id === activeLocation.id_lokasi);
            if (!lokasiJadwal) {
                toast.error("Koordinat lokasi jadwal tidak ditemukan");
                return;
            }
            const jarak = Math.round(
                getDistanceMeters(gps.lat, gps.lng, lokasiJadwal.latitude, lokasiJadwal.longitude),
            );
            if (jarak > MAX_RADIUS) {
                toast.error("Anda berada di luar radius lokasi kunjungan anda.");
                return;
            }
            const fd = new FormData();
            fd.append("foto", photo);
            fd.append("koordinat", `${gps.lat},${gps.lng}`);
            const res = await fetchWithJwt(`${apiurl}/trip/user/out/${activeLocation.id}`, {
                method: "PUT",
                body: fd,
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.message || "Checkout gagal");
                return;
            }
            toast.success("Checkout berhasil");
            resetModalState();
            setModal(null);
            fetchTrip();
        } catch (err) {
            console.error(err);
            toast.error("Koneksi ke server gagal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasTrip = history.length > 0;
    const activeLocation = useMemo(() => {
        return history.find((h) => h.kategori === 2 && h.jam_selesai === null) || null;
    }, [history]);

    const lastVisitedLocationId = useMemo(() => {
        if (!history.length) return null;
        const last = [...history].filter((h) => h.jam_selesai !== null).slice(-1)[0];
        return last?.id_lokasi ?? null;
    }, [history]);

    const showVisitGuide = useMemo(() => {
        if (!hasTrip) return false;
        if (activeLocation) return false;
        if (nearbyLocation) return false;
        return true;
    }, [hasTrip, activeLocation, nearbyLocation]);

    const resetModalState = () => {
        setNote("");
        setPhoto(null);
        setPhotoPreview(null);
    };

    // ================= SWAL =================
    const validateKunjunganPrerequisite = () => {
        const kendaraanValid = prerequisite.status_kendaraan === true;
        const lokasiRumahValid = prerequisite.user_lokasi === true;
        if (!kendaraanValid && !lokasiRumahValid) {
            Swal.fire({
                icon: "warning",
                title: "Data Belum Lengkap",
                html: `
                    <p style="text-align:left">
                        Wah, belum ada informasi terkait <b>data kendaraan</b> dan <b>lokasi rumah</b> kamu.
                        <br/><br/>
                        Syarat menggunakan fitur <b>Kunjungan</b> adalah seluruh data wajib sudah diinput oleh
                        <b>Kepala Divisi</b> masing-masing.
                        <br/><br/>
                        Silakan hubungi Kepala Divisi untuk melengkapi data tersebut.
                    </p>
                `,
                confirmButtonText: "Mengerti",
            });
            return false;
        }
        if (!kendaraanValid) {
            Swal.fire({
                icon: "warning",
                title: "Data Kendaraan Belum Ada",
                text: "Data kendaraan kamu belum tersedia. Silakan hubungi Kepala Divisi untuk menambahkan data kendaraan.",
                confirmButtonText: "Mengerti",
            });
            return false;
        }
        if (!lokasiRumahValid) {
            Swal.fire({
                icon: "warning",
                title: "Lokasi Rumah Belum Diset",
                text: "Lokasi rumah kamu belum ditentukan. Silakan hubungi Kepala Divisi untuk melengkapinya.",
                confirmButtonText: "Mengerti",
            });
            return false;
        }
        return true;
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        const toastId = toast.loading("Memperbarui data...");
        try {
            await fetchJadwal();
            await fetchTrip();
            toast.dismiss(toastId); // tutup loading
            toast.success("Data berhasil diperbarui");
        } catch {
            toast.dismiss(toastId);
            toast.error("Gagal memperbarui data");
        } finally {
            setIsRefreshing(false);
        }
    };


    // ================= EARLY =================
    if (!gps) {
        return (
            <MobileLayout title="Kunjungan">
                <LoadingSpinner message="Mengambil lokasi GPS..."/>
            </MobileLayout>
        );
    }

    // ================= RENDER =================
    return (
        <MobileLayout title="Kunjungan">
            <div className="space-y-4 pb-32 scrollbar-none">
                <div className="bg-white rounded-xl border p-3">
                    <div className="mb-2 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                Peta Posisi Anda
                            </p>
                            <p className="text-[11px] text-gray-500">
                                Digunakan untuk memastikan Anda berada di lokasi yang sesuai
                            </p>
                        </div>
                        <button onClick={handleRefresh} className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm transition">
                            <FontAwesomeIcon icon={faRotateRight} className={`text-[11px] ${isRefreshing ? "animate-spin" : ""}`} />
                            <span className="font-medium">Perbarui</span>
                        </button>
                    </div>
                    <MapRoute user={gps}
                        locations={jadwalLokasi.map((l) => ({
                            id: l.id,
                            nama: l.nama,
                            koordinat: `${l.latitude},${l.longitude}`,
                        }))}
                    />

                    {showVisitGuide && (
                        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
                            <p className="text-xs font-semibold text-blue-600 mb-2">
                                Cara Menggunakan Peta Kunjungan
                            </p>
                            <ul className="text-[11px] text-blue-600 space-y-1 list-disc pl-4 leading-snug">
                                <li>Ikon <b>toko berwarna orange</b> di peta menunjukkan <b>lokasi kunjungan yang sudah dijadwalkan oleh Kepala Divisi</b>.</li>
                                <li>Datangi lokasi tersebut untuk melakukan kunjungan sesuai jadwal yang telah ditentukan.</li>
                                <li>Jika posisi Anda sudah berada di sekitar lokasi (±60 meter), tombol <b>Mulai Kunjungan</b> akan muncul.</li>
                                <li>Tekan <b>Mulai Kunjungan</b> saat tiba di lokasi.</li>
                                <li>Setelah pekerjaan selesai, tekan <b>Selesai Kunjungan</b> di lokasi yang sama.</li>
                            </ul>

                            <p className="text-[11px] text-blue-600 mt-2">
                                Pastikan <b>GPS aktif</b> agar sistem dapat mendeteksi posisi Anda dengan benar.
                            </p>
                        </div>
                    )}

                    {activeLocation && (
                        <div className="mt-4 bg-white border rounded-xl p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 text-amber-600">
                                    <FontAwesomeIcon icon={faLocationDot} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Lokasi kunjungan saat ini</p>
                                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                                        {activeLocation.nama}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setModal("checkout")} className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg text-sm font-semibold transition">
                                Selesai Kunjungan
                            </button>
                        </div>
                    )}

                    {hasTrip && nearbyLocation && !activeLocation && nearbyLocation.id !== lastVisitedLocationId && (
                            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4 backdrop-blur-sm shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <p className="text-xs text-blue-700">Anda berada di area lokasi kunjungan</p>
                                        <p className="text-md font-semibold text-blue-900 leading-snug">
                                            {nearbyLocation.nama}
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Silakan mulai kunjungan untuk mencatat kedatangan Anda.
                                        </p>
                                    </div>
                                </div>
                                <button disabled={isSubmitting} onClick={() => setModal("checkin")} className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition animate-pulse">
                                    Mulai Kunjungan
                                </button>
                            </div>
                        )}

                    {hasTrip &&
                        nearbyLocation &&
                        !activeLocation &&
                        nearbyLocation.id === lastVisitedLocationId && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center mt-3">
                                <div className="flex justify-center mb-1">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-600">
                                        <FontAwesomeIcon icon={faLocationDot} className="text-sm" />
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-amber-700">
                                    Lokasi ini baru saja Anda kunjungi
                                </p>
                                <p className="text-[11px] text-gray-600 mt-1 leading-snug">
                                    Satu lokasi tidak dapat dikunjungi secara berurutan. Silakan kunjungi lokasi lain terlebih dahulu.
                                    Tombol <b>Mulai Kunjungan</b> akan muncul otomatis jika Anda berada dalam radius <b>60 meter</b> dari lokasi yang dijadwalkan.
                                </p>
                            </div>
                        )}
                </div>

                {hasTrip && tripInfo && (
                    <Timeline history={history} tripInfo={tripInfo} />
                )}

                {!hasTrip && (
                    <div className="bg-white rounded-xl border px-4 py-4 space-y-4">
                        <div className="space-y-1">
                            <p className="text-base font-semibold text-gray-800">Penjelasan Fitur Kunjungan</p>
                            <p className="text-xs text-gray-600 leading-snug">
                                Digunakan untuk mencatat perjalanan kerja sekaligus absensi.
                            </p>
                        </div>
                        <div className="space-y-3 text-[11px] text-justify text-gray-700 max-h-44 overflow-y-auto scrollbar-green pr-1 tracking-wide">
                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faClock} className="mt-1 text-green-600" />
                                <p className="leading-normal">
                                    Tekan <b>Berangkat Kunjungan</b> untuk memulai perjalanan kerja.
                                    Setelah perjalanan dimulai, Anda dapat melakukan kunjungan ke lokasi yang telah dijadwalkan.
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-green-600" />
                                <p className="leading-normal">
                                    Saat berada dalam radius <b>60 meter</b> dari lokasi kunjungan, tekan
                                    <b> Mulai Kunjungan</b> untuk mencatat kedatangan Anda.
                                    <b> Mulai Kunjungan pertama</b> akan tercatat sebagai <b>absensi masuk</b>.
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faCamera} className="mt-1 text-green-600" />
                                <p className="leading-normal">
                                    Setelah pekerjaan di lokasi selesai, tekan <b>Selesai Kunjungan</b>.
                                    Setelah satu lokasi selesai dikunjungi, Anda dapat langsung melanjutkan
                                    ke lokasi kunjungan berikutnya jika masih ada jadwal yang tersedia.
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-1 text-amber-500" />
                                <p className="leading-normal">
                                    Saat ini tidak ada lagi fitur <b>Akhiri Kunjungan</b>.
                                    Sistem akan mencatat <b>Selesai Kunjungan terakhir</b> sebagai
                                    <b> absensi pulang</b>.
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-1 text-red-500" />
                                <p className="leading-normal">
                                    Timeline kunjungan akan otomatis <b>reset setiap 22 jam sejak waktu berangkat</b>.
                                    Pastikan Anda melakukan <b>Selesai Kunjungan</b> terakhir saat benar-benar
                                    telah selesai bekerja dan <b>tidak lebih awal dari jadwal pulang shift</b>.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (!validateKunjunganPrerequisite()) return;
                                toast("Mulai bisa dilakukan di mana saja. Check-in lokasi wajib radius 60 meter.", {
                                    duration: 4000,
                                });
                                setTimeout(() => setModal("start"), 400);
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition animate-pulse"
                        >
                            Berangkat Kunjungan
                        </button>
                    </div>
                )}
            </div>

            <KunjunganActionModal
                isOpen={!!modal}
                title={
                    modal === "start"
                        ? "Berangkat Kunjungan"
                        : modal === "checkin"
                            ? "Konfirmasi Mulai Kunjungan"
                            : "Konfirmasi Selesai Kunjungan"
                }
                noteText={modal === "checkin" ? "Tuliskan tujuan kunjungan." : null}
                submitLabel="Simpan"
                onSubmit={modal === "start" ? startVisit : modal === "checkin" ? checkIn : checkOut}
                onClose={() => {
                    resetModalState();
                    setModal(null);
                }}
                note={note}
                setNote={setNote}
                photoPreview={photoPreview}
                setPhotoPreview={setPhotoPreview}
                setPhotoFile={setPhoto}
                isSubmitting={isSubmitting}
            />
        </MobileLayout>
    );
}
