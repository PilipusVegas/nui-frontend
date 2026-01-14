import { useEffect, useState } from "react";
import { MapRoute } from "../../components";
import { getDistanceMeters } from "../../utils/locationUtils";
import { fetchWithJwt } from "../../utils/jwtHelper";
import MobileLayout from "../../layouts/mobileLayout";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot, faCirclePlay, faFlagCheckered } from "@fortawesome/free-solid-svg-icons";
const MAX_RADIUS = 60;

const Kunjungan = () => {
    const apiurl = process.env.REACT_APP_API_BASE_URL;
    const [userGPS, setUserGPS] = useState(null);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [visitStarted, setVisitStarted] = useState(false);
    const [visitEnded, setVisitEnded] = useState(false);
    const [tripId, setTripId] = useState(null);
    const [tripHistory, setTripHistory] = useState([]);
    const [history, setHistory] = useState([]);
    const [totalDistance, setTotalDistance] = useState(0);
    
    /* ================= GPS ================= */
    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserGPS({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            (err) => console.error("GPS Error:", err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);


    /* ================= LOKASI ================= */
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await fetchWithJwt(`${apiurl}/lokasi`);
                const json = await res.json();
                setStores(json?.data || []);
            } catch (err) {
                console.error("Fetch lokasi error:", err);
            }
        };
        fetchStores();
    }, [apiurl]);


    /* ================= TRIP SERVER ================= */
    const fetchTripHistory = async () => {
        try {
            const res = await fetchWithJwt(`${apiurl}/trip/user`);
            const json = await res.json();
            setTripHistory(json.data || []);
        } catch (err) {
            console.error("Gagal ambil riwayat trip", err);
        }
    };

    useEffect(() => {
        fetchTripHistory();
    }, []);


    useEffect(() => {
        if (tripHistory.length > 0) {
            const todayTrip = tripHistory[0];

            setTripId(todayTrip.id_trip);
            setVisitStarted(true);
            setTotalDistance(todayTrip.total_jarak || 0);
            setVisitEnded(todayTrip.is_complete === 1);

            const timeline = todayTrip.lokasi.map((l, idx) => ({
                type: idx === 0 ? "start" : "checkpoint",
                label: idx === 0 ? "Start" : `Checkpoint ${idx}`,
                store: l.nama,
                time: "-",
                location: parseKoordinat(l.koordinat),
                distance: 0,
            }));

            // ⬇️ TAMBAHKAN END SEBAGAI STEP BARU
            if (todayTrip.is_complete === 1 && timeline.length > 0) {
                const last = timeline[timeline.length - 1];

                timeline.push({
                    type: "end",
                    label: "End",
                    store: last.store,
                    time: "-",
                    location: last.location,
                    distance: 0,
                });
            }
            setHistory(timeline);
        }
    }, [tripHistory]);




    /* ================= HELPERS ================= */
    const parseKoordinat = (koordinat) => {
        if (!koordinat) return null;
        const [lat, lng] = koordinat.split(",").map(v => parseFloat(v.trim()));
        return { lat, lng };
    };


    const getLocationName = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            return data.display_name || "Lokasi tidak dikenal";
        } catch {
            return "Lokasi tidak dikenal";
        }
    };


    /* ================= ACTIONS ================= */
    const handleStart = async () => {
        if (tripId && !visitEnded) {
            toast.error("Masih ada kunjungan aktif hari ini");
            return;
        }

        const locationName = await getLocationName(userGPS.lat, userGPS.lng);

        try {
            const res = await fetchWithJwt(`${apiurl}/trip/user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deskripsi: "Kunjungan Hari Ini",
                    foto: null,
                    lokasi: {
                        nama: locationName,
                        koordinat: `${userGPS.lat},${userGPS.lng}`,
                    },
                }),
            });

            const json = await res.json();

            if (!json.success) {
                toast.error("Gagal memulai kunjungan");
                return;
            }

            // Tidak perlu ambil json.data
            setVisitStarted(true);
            setVisitEnded(false);

            setHistory([
                {
                    type: "start",
                    label: "Start",
                    store: locationName,
                    time: new Date().toLocaleTimeString(),
                    location: userGPS,
                    distance: 0,
                },
            ]);

            fetchTripHistory(); // ambil id_trip dari sini
            toast.success("Kunjungan dimulai. Silakan menuju lokasi tujuan.");
        } catch (err) {
            console.error(err);
            toast.error("Gagal memulai kunjungan");
        }
    };



    const handleCheckpoint = async () => {
        if (!selectedStore) {
            toast.error("Silakan pilih lokasi kunjungan terlebih dahulu");
            return;
        }
        const koordinat = parseKoordinat(selectedStore.koordinat);
        const distance = getDistanceMeters(
            userGPS.lat,
            userGPS.lng,
            koordinat.lat,
            koordinat.lng
        );

        if (distance > MAX_RADIUS) {
            toast.error(`Anda belum berada di area ${selectedStore.nama}`);
            return;
        }
        const locationName = selectedStore.nama;
        try {
            await fetchWithJwt(`${apiurl}/trip/user/${tripId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jarak: distance,
                    lokasi: {
                        nama: selectedStore.nama,
                        koordinat: selectedStore.koordinat,
                        koordinat_user: `${userGPS.lat},${userGPS.lng}`,
                    }
                }),
            });
            setHistory(prev => [
                ...prev,
                {
                    type: "checkpoint",
                    label: `Checkpoint ${prev.filter(h => h.type === "checkpoint").length + 1}`,
                    store: selectedStore.nama,
                    time: new Date().toLocaleTimeString(),
                    location: koordinat,
                    distance: distance,
                }
            ]);

            fetchTripHistory();
            toast.success(`Lokasi ${locationName} berhasil dikunjungi`);
        } catch {
            toast.error("Gagal mengirim checkpoint");
        }
    };

    const handleEnd = async () => {
        try {
            await fetchWithJwt(`${apiurl}/trip/user/end/${tripId}`, { method: "PUT" });
            setVisitEnded(true);
            fetchTripHistory();
            toast.success("Kunjungan hari ini telah selesai.");
        } catch {
            toast.error("Gagal mengakhiri kunjungan");
        }
    };


    /* ================= LOADING ================= */
    if (!userGPS) {
        return (
            <MobileLayout title="Kunjungan">
                <div className="p-4 text-center text-sm text-gray-500">
                    Mengambil lokasi GPS...
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="Kunjungan">
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-1.5 py-2.5 space-y-6">
                <div className="relative overflow-hidden">
                    <MapRoute user={userGPS} destination={selectedStore ? parseKoordinat(selectedStore.koordinat) : null} />
                    <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 text-xs shadow-md flex items-center gap-2 z-[9999]">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <FontAwesomeIcon icon={faMapLocationDot} />
                        </div>
                        <div className="leading-snug text-gray-700 text-xs">
                            {!visitStarted ? "GPS sudah siap. Yuk, mulai kunjungan hari ini." : visitEnded ? "Kunjungan hari ini sudah selesai. Terima kasih." : "Sedang menuju lokasi tujuan. Tetap semangat."}
                        </div>
                    </div>
                </div>

                {/* TITLE */}
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Kunjungan Lapangan
                    </h1>
                    <p className="text-sm text-gray-500">
                        Pantau perjalanan kerja Anda secara real-time.
                    </p>
                </div>

                {/* PROGRESS STEPS */}
                <div className="flex items-center justify-between bg-white rounded-2xl shadow px-4 py-3 text-xs">
                    {[
                        { label: "Start", active: visitStarted, color: "green" },
                        { label: "Checkpoint", active: history.some(h => h.type === "checkpoint"), color: "blue" },
                        { label: "End", active: visitEnded, color: "red" },
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white
              ${step.active
                                    ? step.color === "green" ? "bg-green-500"
                                        : step.color === "blue" ? "bg-blue-500"
                                            : "bg-red-500"
                                    : "bg-gray-300"
                                }`}>
                                {i + 1}
                            </div>
                            <span className={`${step.active ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* SELECT LOCATION */}
                {visitStarted && !visitEnded && (
                    <div className="bg-white rounded-2xl shadow p-4 space-y-2">
                        <label className="text-xs font-medium text-gray-600">
                            Lokasi Checkpoint
                        </label>
                        <select
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                            onChange={(e) => {
                                const store = stores.find(s => String(s.id) === e.target.value);
                                setSelectedStore(store || null);
                            }}
                        >
                            <option value="">Pilih lokasi</option>
                            {stores.map(s => (
                                <option key={s.id} value={s.id}>{s.nama}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="space-y-3">
                    {!visitStarted && (
                        <button onClick={handleStart} className="w-full bg-green-600 text-white py-3 rounded-xl font-medium flex justify-center gap-3 shadow-md active:scale-95 transition">
                            <FontAwesomeIcon icon={faCirclePlay} />
                            Mulai Kunjungan
                        </button>
                    )}

                    {visitStarted && !visitEnded && (
                        <>
                            <button onClick={handleCheckpoint} className="w-full bg-white border border-gray-200 py-3 rounded-xl text-gray-700 flex justify-center gap-3 shadow-sm hover:bg-gray-50 active:scale-95 transition">
                                <FontAwesomeIcon icon={faMapLocationDot} />
                                Checkpoint Lokasi
                            </button>

                            <button onClick={handleEnd} className="w-full bg-red-600 text-white py-3 rounded-xl flex justify-center gap-3 shadow-md active:scale-95 transition"    >
                                <FontAwesomeIcon icon={faFlagCheckered} />
                                Selesaikan Kunjungan
                            </button>
                        </>
                    )}
                </div>

                {/* TIMELINE */}
                <div className="bg-white rounded-2xl shadow p-4 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Timeline Perjalanan
                    </h2>

                    {history.length === 0 ? (
                        <p className="text-xs text-gray-400">Belum ada aktivitas.</p>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-medium
                ${h.type === "start" ? "bg-green-500"
                                        : h.type === "checkpoint" ? "bg-blue-500"
                                            : "bg-red-500"}`}>
                                    {h.type === "start" ? "S" : h.type === "end" ? "E" : i}
                                </div>

                                <div className="flex-1 text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-800">{h.label}</span>
                                        <span className="text-gray-400">{h.time}</span>
                                    </div>
                                    <p className="text-gray-600 leading-snug">{h.store}</p>

                                    {h.distance > 0 && (
                                        <span className="inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[10px]">
                                            {h.distance.toFixed(0)} m dari titik sebelumnya
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </MobileLayout>
    );


};

export default Kunjungan;
