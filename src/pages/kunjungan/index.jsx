import { useEffect, useMemo, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { MapRoute, LoadingSpinner } from "../../components";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { getDistanceMeters } from "../../utils/locationUtils";
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

    const activeCheckpoint = history.find(h => h.status === "in");

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
            const filtered = (json.data || []).filter(
                (l) => l.kategori === 1 || l.kategori === 2
            );
            setStores(filtered);
        } catch (err) {
            toast.error("Gagal memuat data lokasi");
            setStores([]);
        }
    };

    const fetchJadwal = async () => {
        const user = await getUserFromToken(apiurl);
        const res = await fetchWithJwt(`${apiurl}/jadwal/cek/${user.id_user}`);
        const json = await res.json();
        const jadwal = Array.isArray(json.data) ? json.data[0] : json.data;

        setShiftId(jadwal?.id_shift || null);
        setLokasiUser(jadwal?.lokasi_user || null);
    };

    const fetchTrip = async () => {
        const res = await fetchWithJwt(`${apiurl}/trip/user`);
        const json = await res.json();
        if (!json.data?.lokasi) return;

        setTripId(json.data.id_trip);
        setHistory(
            json.data.lokasi.map(l => ({
                id: l.id_trip_lokasi,
                status: l.jam_selesai ? "out" : "in",
                id_lokasi: l.id_lokasi
            }))
        );
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
        if (!shiftId) return toast.error("Tidak ada shift aktif");
        if (!note || !photo) return toast.error("Foto & keterangan wajib");
        if (!validateLokasiUser()) return;

        if (!lokasiUser?.id_lokasi) {
            toast.error("Lokasi awal tidak valid");
            return;
        }

        const fd = new FormData();
        fd.append("id_shift", shiftId);
        fd.append("id_lokasi", lokasiUser.id_lokasi);
        fd.append("foto", photo);
        fd.append("deskripsi", note);
        fd.append("koordinat", `${gps.lat},${gps.lng}`);

        await fetchWithJwt(`${apiurl}/trip/user`, {
            method: "POST",
            body: fd,
        });

        toast.success("Kunjungan dimulai");
        setModal(null);
        fetchTrip();
    };

    const checkIn = async () => {
        if (!selectedStore) return toast.error("Pilih lokasi");
        if (!photo) return toast.error("Foto & keterangan wajib");
        const target = parseCoord(selectedStore.koordinat);
        const jarak = Math.round(getDistanceMeters(gps.lat, gps.lng, target.lat, target.lng));
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
        setModal(null);
        fetchTrip();
    };

    const activeLocation = useMemo(
        () => history.find(h => h.status === "in"),
        [history]
    );

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

                {!tripId && (
                    <div className="bg-white rounded-xl border px-4 py-4 space-y-4">
                        <div className="space-y-0.5">
                            <p className="text-base font-semibold text-gray-800">
                                Fitur Kunjungan Kerja
                            </p>
                            <p className="text-sm text-gray-500 leading-snug">
                                Digunakan untuk mencatat dan memantau perjalanan kunjungan kerja
                                dari awal hingga selesai.
                            </p>
                        </div>

                        {/* Info list */}
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 text-gray-400" />
                                <p className="leading-snug">
                                    Lokasi tercatat otomatis selama perjalanan
                                </p>
                            </div>

                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faCamera} className="mt-0.5 text-gray-400" />
                                <p className="leading-snug">
                                    Foto diperlukan sebagai bukti di setiap tahap
                                </p>
                            </div>

                            <div className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faClock} className="mt-0.5 text-gray-400" />
                                <p className="leading-snug">
                                    Aktivitas tersimpan dalam timeline kunjungan
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <button onClick={() => setModal("start")} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition">
                            Mulai Kunjungan
                        </button>

                    </div>
                )}

                {tripId && !activeCheckpoint && (
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

                        <button
                            onClick={() => {
                                if (!selectedStore) {
                                    toast.error("Silakan pilih lokasi terlebih dahulu");
                                    return;
                                }
                                setModal("checkin");
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                        >
                            Check-In Lokasi
                        </button>
                    </div>
                )}
            </div>

            <KunjunganActionModal
                isOpen={!!modal}
                title={modal === "start" ? "Mulai Kunjungan" : "Check-In Lokasi"}
                submitLabel="Simpan"
                onSubmit={modal === "start" ? startVisit : checkIn}
                onClose={() => {
                    setModal(null);
                    setPhoto(null);
                    setPhotoPreview(null);
                    setNote("");
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