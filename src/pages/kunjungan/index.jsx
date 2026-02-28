import { useEffect, useMemo, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { MapRoute, LoadingSpinner } from "../../components";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { getDistanceMeters } from "../../utils/locationUtils";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Select from "react-select";
import KunjunganActionModal from "./KunjunganActionModal";
import Timeline from "./Timeline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCamera, faClock } from "@fortawesome/free-solid-svg-icons";
const MAX_RADIUS = 600000;

export default function Kunjungan() {
    const apiurl = process.env.REACT_APP_API_BASE_URL;
    // ================= STATE UTAMA =================
    const [gps, setGps] = useState(null);
    const [shiftId, setShiftId] = useState(null);
    const [lokasiUser, setLokasiUser] = useState(null);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [tripId, setTripId] = useState(null);
    const [history, setHistory] = useState([]);
    const [modal, setModal] = useState(null);
    const [note, setNote] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [tripInfo, setTripInfo] = useState(null);
    const [showAddLocation, setShowAddLocation] = useState(false);
    const [prerequisite, setPrerequisite] = useState({ status_kendaraan: null, user_lokasi: null, });

    // ================= UTIL =================
    const parseCoord = (str) => {
        if (!str) return null;
        const [lat, lng] = str.split(",").map(Number);
        return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
    };

    // ================= DERIVED =================
    const lokasiUserCoord = useMemo(
        () => parseCoord(lokasiUser?.koordinat_lokasi),
        [lokasiUser]
    );

    const destination = useMemo(() => {
        if (!selectedStore?.koordinat) return null;
        return parseCoord(selectedStore.koordinat);
    }, [selectedStore]);

    const distanceToLokasiUser = useMemo(() => {
        if (!gps || !lokasiUserCoord) return null;
        return Math.round(
            getDistanceMeters(gps.lat, gps.lng, lokasiUserCoord.lat, lokasiUserCoord.lng)
        );
    }, [gps, lokasiUserCoord]);

    // ================= EFFECT =================
    useEffect(() => {
        const id = navigator.geolocation.watchPosition(
            p => setGps({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => toast.error("GPS tidak aktif"),
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(id);
    }, []);

    useEffect(() => {
        fetchStores();
        fetchJadwal();
        fetchTrip();
    }, []);

    // ================= FETCH =================
    const fetchStores = async () => {
        try {
            const res = await fetchWithJwt(`${apiurl}/lokasi`);
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.message);
                return;
            }
            setStores(
                (json.data || []).filter(l => l.kategori === 1 || l.kategori === 2)
            );
        } catch {
            toast.error("Koneksi ke server gagal");
        }
    };

    const fetchJadwal = async () => {
        try {
            const user = await getUserFromToken(apiurl);
            const res = await fetchWithJwt(`${apiurl}/jadwal/cek/${user.id_user}`);
            if (!res.ok) {
                const json = await res.json();
                toast.error(json.message || "Gagal memuat jadwal");
                return;
            }
            const json = await res.json();
            const jadwal = Array.isArray(json.data) ? json.data[0] : json.data;
            setShiftId(jadwal?.id_shift || null);
            setLokasiUser(jadwal?.lokasi_user || null);
        } catch (err) {
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
            if (!json.data?.lokasi) return;
            setTripId(json.data.id_trip);
            setTripInfo({
                id_trip: json.data.id_trip,
                tanggal: json.data.tanggal,
                is_complete: json.data.is_complete,
                total_jarak: json.data.total_jarak,
                nominal: json.data.nominal,
            });
            setHistory(
                json.data.lokasi.map(l => ({
                    id: l.id_trip_lokasi,
                    kategori: l.kategori,
                    nama: l.nama_lokasi,
                    jam_mulai: l.jam_mulai,
                    jam_selesai: l.jam_selesai,
                    jarak: l.jarak,
                    deskripsi: l.deskripsi,
                    id_lokasi: l.id_lokasi,
                }))
            );
        } catch {
            toast.error("Koneksi ke server gagal");
        }
    };

    // ================= VALIDATION =================
    const validateLokasiUser = () => {
        if (!lokasiUserCoord) {
            toast.error("Lokasi awal belum ditentukan admin");
            return false;
        }
        if (distanceToLokasiUser > MAX_RADIUS) {
            toast.error("Anda tidak berada di lokasi awal");
            return false;
        }
        return true;
    };

    // ================= ACTION =================
    const startVisit = async () => {
        try {
            if (!shiftId) return toast.error("Tidak ada shift aktif");
            if (!note || !photo) return toast.error("Foto & keterangan wajib");
            if (!validateLokasiUser()) return;
            const fd = new FormData();
            fd.append("id_shift", shiftId);
            fd.append("id_lokasi", lokasiUser.id_lokasi);
            fd.append("foto", photo);
            fd.append("deskripsi", note);
            fd.append("koordinat", `${gps.lat},${gps.lng}`);
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
        }
    };

    const checkIn = async () => {
        if (!selectedStore) return toast.error("Pilih lokasi");
        if (!photo) return toast.error("Foto & keterangan wajib");
        const target = parseCoord(selectedStore.koordinat);
        const jarak = Math.round(
            getDistanceMeters(gps.lat, gps.lng, target.lat, target.lng)
        );
        if (jarak > MAX_RADIUS) return toast.error("Anda di luar radius lokasi");
        const fd = new FormData();
        fd.append("id_lokasi", selectedStore.id);
        fd.append("jarak", jarak);
        fd.append("foto", photo);
        fd.append("deskripsi", note);
        fd.append("koordinat", `${gps.lat},${gps.lng}`);
        await fetchWithJwt(`${apiurl}/trip/user/in/${tripId}`, {
            method: "PUT",
            body: fd
        });
        toast.success("Check-in berhasil");
        resetModalState();
        setShowAddLocation(false);
        setSelectedStore(null);
        setModal(null);
        fetchTrip();
    };

    const checkOut = async () => {
        if (!activeLocation?.id) {
            return toast.error("Lokasi aktif tidak ditemukan");
        }
        if (!photo) {
            return toast.error("Foto & keterangan wajib");
        }
        const fd = new FormData();
        fd.append("foto", photo);
        fd.append("deskripsi", note);
        fd.append("koordinat", `${gps.lat},${gps.lng}`);
        await fetchWithJwt(
            `${apiurl}/trip/user/out/${activeLocation.id}`,
            {
                method: "PUT",
                body: fd,
            }
        );
        toast.success("Check-out lokasi berhasil");
        resetModalState();
        setModal(null);
        fetchTrip();
    };

    const endTrip = async () => {
        if (!photo) return toast.error("Foto wajib diambil");
        if (!note) return toast.error("Keterangan wajib diisi");
        if (!lokasiUser?.id_lokasi) {
            return toast.error("Lokasi rumah belum diset oleh admin");
        }
        const fd = new FormData();
        fd.append("id_lokasi", lokasiUser.id_lokasi); // ⬅️ FIX UTAMA
        fd.append("foto", photo);
        fd.append("deskripsi", note);
        fd.append("koordinat", `${gps.lat},${gps.lng}`); // posisi real user
        await fetchWithJwt(
            `${apiurl}/trip/user/end/${tripId}`,
            {
                method: "PUT",
                body: fd,
            }
        );
        toast.success("Kunjungan berhasil diakhiri");
        resetModalState();
        setModal(null);
        fetchTrip();
    };

    const hasTrip = history.length > 0;
    const activeLocation = useMemo(
        () => history.find(h => h.jam_selesai === null),
        [history]
    );

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
                text:
                    "Data kendaraan kamu belum tersedia. Silakan hubungi Kepala Divisi untuk menambahkan data kendaraan.",
                confirmButtonText: "Mengerti",
            });
            return false;
        }

        if (!lokasiRumahValid) {
            Swal.fire({
                icon: "warning",
                title: "Lokasi Rumah Belum Diset",
                text:
                    "Lokasi rumah kamu belum ditentukan. Silakan hubungi Kepala Divisi untuk melengkapinya.",
                confirmButtonText: "Mengerti",
            });
            return false;
        }

        return true;
    };

    // ================= EARLY =================
    if (!gps) {
        return (
            <MobileLayout title="Kunjungan">
                <LoadingSpinner message="Mengambil lokasi GPS..." />
            </MobileLayout>
        );
    }


    // ================= RENDER =================
    return (
        <MobileLayout title="Kunjungan">
            <div className="space-y-4 pb-32 scrollbar-none">
                <div className="bg-white rounded-xl border p-3">
                    <div className="mb-1">
                        <p className="text-sm font-semibold text-gray-800">
                            Peta Posisi Anda
                        </p>
                        <p className="text-[11px] text-gray-500">
                            Digunakan untuk memastikan Anda berada di lokasi yang sesuai
                        </p>
                    </div>
                    <MapRoute user={gps} destination={destination} />
                </div>

                {!hasTrip && (
                    <div className="bg-white rounded-xl border px-4 py-4 space-y-4">
                        <div className="space-y-0.5">
                            <p className="text-base font-semibold text-gray-800">
                                Penjelasan Tentang Fitur Kunjungan
                            </p>
                            <p className="text-sm text-gray-500 leading-snug">
                                Digunakan untuk mencatat dan memantau perjalanan kunjungan kerja
                                dari awal hingga selesai.
                            </p>
                        </div>

                        {/* Info list */}
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 text-green-600" />
                                <p className="leading-snug">
                                    Lokasi tercatat otomatis selama perjalanan
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faCamera} className="mt-0.5 text-green-600" />
                                <p className="leading-snug">
                                    Foto diperlukan sebagai bukti di setiap tahap
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faClock} className="mt-0.5 text-green-600" />
                                <p className="leading-snug">
                                    Aktivitas tersimpan dalam timeline kunjungan
                                </p>
                            </div>
                        </div>
                        <button onClick={() => { if (!validateKunjunganPrerequisite()) return; setModal("start"); }} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition">
                            Mulai Kunjungan
                        </button>
                    </div>
                )}

                {hasTrip &&
                    tripInfo?.is_complete === 0 &&
                    !activeLocation &&
                    showAddLocation && (   // ⬅️ KUNCI UTAMA
                        <div className="space-y-3 rounded-xl border bg-white p-4">
                            <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-gray-800">
                                    Pilih Lokasi Kunjungan
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    Check-In hanya dapat dilakukan jika Anda berada
                                    <b className="text-gray-700"> maksimal 60 meter</b> dari lokasi.
                                </p>
                            </div>

                            <Select
                                placeholder="Pilih lokasi kerja / gerai"
                                options={stores.map(s => ({
                                    label: s.nama,
                                    value: s.id,
                                    data: s,
                                }))}
                                onChange={o => setSelectedStore(o?.data || null)}
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddLocation(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium"
                                >
                                    Batal
                                </button>

                                <button
                                    onClick={() => {
                                        if (!selectedStore) {
                                            toast.error("Silakan pilih lokasi terlebih dahulu");
                                            return;
                                        }
                                        setModal("checkin");
                                    }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                                >
                                    Check-In Lokasi
                                </button>
                            </div>
                        </div>
                    )}

                {hasTrip && tripInfo && (
                    <Timeline history={history} tripInfo={tripInfo} activeLocation={activeLocation} onCheckout={() => setModal("checkout")} onEndTrip={() => setModal("end")}
                        canAddLocation={
                            tripInfo?.is_complete === 0 &&
                            !activeLocation
                        }
                        onAddLocation={() => setShowAddLocation(true)}
                    />
                )}
            </div>


            <KunjunganActionModal
                isOpen={!!modal}
                title={
                    modal === "start"
                        ? "Mulai Kunjungan"
                        : modal === "checkin"
                            ? "Check-In Lokasi"
                            : modal === "checkout"
                                ? "Check-Out Lokasi"
                                : "Akhiri Kunjungan"
                }
                submitLabel="Simpan"
                onSubmit={
                    modal === "start"
                        ? startVisit
                        : modal === "checkin"
                            ? checkIn
                            : modal === "checkout"
                                ? checkOut
                                : endTrip
                }
                onClose={() => {
                    resetModalState();
                    setModal(null);
                }}
                note={note}
                setNote={setNote}
                photoPreview={photoPreview}
                setPhotoPreview={setPhotoPreview}
                setPhotoFile={setPhoto}
            />
        </MobileLayout>
    );
}