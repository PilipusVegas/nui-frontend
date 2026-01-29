    import { useEffect, useState, useRef, useMemo, useCallback } from "react";
    import { MapRoute } from "../../components";
    import { getDistanceMeters } from "../../utils/locationUtils";
    import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
    import MobileLayout from "../../layouts/mobileLayout";
    import toast from "react-hot-toast";
    import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
    import { faMapLocationDot, faRoute } from "@fortawesome/free-solid-svg-icons";
    import Timeline from "./Timeline";
    import { Modal, LoadingSpinner, ErrorState, EmptyState } from "../../components/";
    import Webcam from "react-webcam";
    import Swal from "sweetalert2";
    import Select from "react-select";
    const MAX_RADIUS = 60;

    const Kunjungan = () => {
        const apiurl = process.env.REACT_APP_API_BASE_URL;
        const [userGPS, setUserGPS] = useState(null);
        const [stores, setStores] = useState([]);
        const [selectedStore, setSelectedStore] = useState(null);
        const [visitStarted, setVisitStarted] = useState(false);
        const [visitEnded, setVisitEnded] = useState(false);
        const [tripId, setTripId] = useState(null);
        const [history, setHistory] = useState([]);
        const [totalDistance, setTotalDistance] = useState(0);
        const [modalType, setModalType] = useState(null);
        const [note, setNote] = useState("");
        const [photoFile, setPhotoFile] = useState(null);
        const [photoPreview, setPhotoPreview] = useState(null);
        const [tripInfo, setTripInfo] = useState(null);
        const [showCheckpointForm, setShowCheckpointForm] = useState(false);
        const [isLoadingStores, setIsLoadingStores] = useState(true);
        const [storeError, setStoreError] = useState(null);
        const [cameraReady, setCameraReady] = useState(false);
        const [jadwalLokasi, setJadwalLokasi] = useState([]);
        const [idShift, setIdShift] = useState(null);
        const webcamRef = useRef(null);
        const timelineRef = useRef(null);
        const lastStoreName = history[history.length - 1]?.store;
        const activeCheckpoint = history.find(h => h.status === "in");
        const [jadwalReady, setJadwalReady] = useState(false);

        // ================= UTIL =================
        const parseKoordinat = (koordinat) => {
            if (!koordinat || !koordinat.includes(",")) return null;
            const [lat, lng] = koordinat.split(",").map(Number);
            return isNaN(lat) || isNaN(lng) ? null : { lat, lng };
        };

        const formatDistance = (m) => {
            if (m == null) return "-";
            return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
        };

        // ================= CALLBACK =================
        const handleDistance = useCallback((d) => {
            setTotalDistance(d);
        }, []);

        // ================= MEMO =================
        const activeCheckpointLocation = useMemo(() => {
            if (!activeCheckpoint?.id_lokasi) return null;
            const lokasi = stores.find(s => s.id === activeCheckpoint.id_lokasi);
            if (!lokasi?.koordinat) return null;
            return parseKoordinat(lokasi.koordinat);
        }, [activeCheckpoint, stores]);

        const distanceToActiveCheckpoint = useMemo(() => {
            if (!userGPS || !activeCheckpointLocation) return null;

            return Math.round(
                getDistanceMeters(
                    userGPS.lat,
                    userGPS.lng,
                    activeCheckpointLocation.lat,
                    activeCheckpointLocation.lng
                )
            );
        }, [userGPS, activeCheckpointLocation]);


        const shouldShowTimeline = useMemo(() => {
            return visitStarted && history.length > 0;
        }, [visitStarted, history]);


        const showMapRoute = useMemo(() => {
            if (!visitEnded && !activeCheckpoint) return true;

            return false;
        }, [visitEnded, activeCheckpoint]);


        const officeLocation = useMemo(() => {
            if (!stores.length) return null;

            const office = stores.find(l =>
                l.nama?.toLowerCase().includes("kantor")
            );

            if (!office?.koordinat) return null;

            return parseKoordinat(office.koordinat);
        }, [stores]);


        const distanceToOffice = useMemo(() => {
            if (!userGPS || !officeLocation) return null;

            return Math.round(
                getDistanceMeters(
                    userGPS.lat,
                    userGPS.lng,
                    officeLocation.lat,
                    officeLocation.lng
                )
            );
        }, [userGPS, officeLocation]);


        const hasVisitedCheckpoint = useMemo(() => {
            return history.some(h => h.status === "out");
        }, [history]);

        const isFirstCheckpoint = useMemo(() => {
            return visitStarted && !hasVisitedCheckpoint;
        }, [visitStarted, hasVisitedCheckpoint]);


        const destination = useMemo(() => {
            if (!selectedStore?.koordinat) return null;
            return parseKoordinat(selectedStore.koordinat);
        }, [selectedStore]);

        const filteredStoresBySchedule = useMemo(() => {
            if (!jadwalLokasi.length) return [];
            const allowedIds = jadwalLokasi.map((l) => l.id);
            return stores.filter((s) => allowedIds.includes(s.id));
        }, [stores, jadwalLokasi]);

        const storesWithDistance = useMemo(() => {
            if (!userGPS) return [];
            return filteredStoresBySchedule.map((s) => {
                const target = parseKoordinat(s.koordinat);
                if (!target) return { ...s, distance: null };

                return {
                    ...s,
                    distance: getDistanceMeters(
                        userGPS.lat,
                        userGPS.lng,
                        target.lat,
                        target.lng
                    ),
                };
            });
        }, [filteredStoresBySchedule, userGPS]);

        const storeOptions = useMemo(() => {
            return storesWithDistance
                .filter((s) => s.nama !== lastStoreName)
                .map((s) => ({
                    value: s.id,
                    label: s.nama,
                    data: s,
                }));
        }, [storesWithDistance, lastStoreName]);

        // ================= EFFECT =================
        useEffect(() => {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setUserGPS({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                },
                () => toast.error("Gagal mengakses GPS"),
                { enableHighAccuracy: true }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        }, []);

        useEffect(() => {
            const fetchStores = async () => {
                try {
                    setIsLoadingStores(true);
                    const res = await fetchWithJwt(`${apiurl}/lokasi`);
                    const json = await res.json();
                    setStores(json?.data || []);
                } catch {
                    setStoreError("Gagal memuat lokasi.");
                } finally {
                    setIsLoadingStores(false);
                }
            };

            fetchStores();
        }, [apiurl]);

        const fetchJadwalUser = async () => {
            try {
                const user = await getUserFromToken(apiurl);
                if (!user?.id_user) {
                    toast.error("User tidak ditemukan");
                    return;
                }

                const res = await fetchWithJwt(
                    `${apiurl}/jadwal/cek/${user.id_user}`
                );
                const json = await res.json();

                const jadwal = Array.isArray(json.data)
                    ? json.data[0]
                    : json.data;

                if (!jadwal?.id_shift) {
                    setIdShift(null);
                    setJadwalLokasi([]);
                    setJadwalReady(true);
                    return;
                }

                setIdShift(jadwal.id_shift);
                setJadwalLokasi(jadwal.lokasi || []);
                setJadwalReady(true);

            } catch (err) {
                console.error(err);
                toast.error("Gagal memuat jadwal kunjungan");
                setIdShift(null);
                setJadwalLokasi([]);
                setJadwalReady(true);
            }
        };


        useEffect(() => {
            fetchJadwalUser();
        }, []);


        const fetchTripHistory = async () => {
            try {
                const res = await fetchWithJwt(`${apiurl}/trip/user`);
                const json = await res.json();

                if (Array.isArray(json.data) && json.data.length === 0) {
                    setHistory([]);
                    setTripId(null);
                    setVisitStarted(false);
                    setVisitEnded(false);
                    setTotalDistance(0);
                    setTripInfo(null);
                    setShowCheckpointForm(false);
                    setModalType(null);
                    return;
                }

                let rawLokasi = Array.isArray(json.data.lokasi)
                    ? json.data.lokasi
                    : [];

                let lokasi = rawLokasi.map((l, i) => ({
                    id_trip_lokasi: l.id_trip_lokasi,
                    id_lokasi: l.id_lokasi,
                    nama: l.nama_lokasi,
                    status: i === 0 ? "start" : l.jam_selesai ? "out" : "in",
                    jam_in: l.jam_mulai,
                    jam_out: l.jam_selesai,
                    jarak: l.jarak_lokasi,
                }));

                // 🔑 FIX LOGIC END
                if (json.data.is_complete === 1 && lokasi.length >= 2) {
                    const endSource = lokasi.pop();
                    const lastCheckpoint = lokasi[lokasi.length - 1];
                    lokasi.push({
                        id_trip_lokasi: "end",
                        id_lokasi: null,
                        nama: "Akhir Kunjungan",
                        status: "end",
                        jam_in: endSource.jam_in || lastCheckpoint.jam_out,
                        jam_out: endSource.jam_out || lastCheckpoint.jam_out,
                        jarak: null,
                    });
                }

                // ⬇️ BARU SET STATE
                setHistory(lokasi);
                setTripId(json.data.id_trip);
                setVisitStarted(true);
                setVisitEnded(json.data.is_complete === 1);
                setTotalDistance(json.data.total_jarak || 0);
                setTripInfo(json.data);

            } catch (err) {
                console.error(err);
                setHistory([]);
                setTripId(null);
                setVisitStarted(false);
                setVisitEnded(false);
            }
        };


        useEffect(() => {
            fetchTripHistory();
        }, []);

        // ================= ACTION =================
        const capturePhoto = async () => {
            const imageSrc = webcamRef.current.getScreenshot();
            const blob = await fetch(imageSrc).then((r) => r.blob());
            setPhotoFile(new File([blob], "kunjungan.jpg", { type: "image/jpeg" }));
            setPhotoPreview(imageSrc);
        };

        const handleStartVisit = async () => {
            if (!jadwalReady) {
                toast.error("Sedang memuat jadwal, silakan tunggu");
                return;
            }

            if (!idShift) {
                toast.error("Anda tidak memiliki shift aktif hari ini");
                return;
            }

            if (!photoFile || !note) {
                toast.error("Foto dan keterangan wajib diisi");
                return;
            }

            try {
                const formData = new FormData();
                formData.append("id_shift", idShift); // ✅ PENTING
                formData.append("deskripsi", note);
                formData.append("foto", photoFile);
                formData.append("koordinat", `${userGPS.lat},${userGPS.lng}`);

                await fetchWithJwt(`${apiurl}/trip/user`, {
                    method: "POST",
                    body: formData,
                });

                setModalType(null);
                setNote("");
                setPhotoFile(null);
                setPhotoPreview(null);

                fetchTripHistory();
                toast.success("Kunjungan berhasil dimulai");

            } catch (err) {
                toast.error("Gagal memulai kunjungan");
            }
        };



        const handleCheckIn = async () => {
            if (!photoFile || !note || !selectedStore) {
                toast.error("Lengkapi foto, keterangan, dan lokasi");
                return;
            }

            if (!tripId) {
                toast.error("ID Trip tidak ditemukan");
                return;
            }

            const jarakKeLokasi = Math.round(selectedStore.distance);

            if (jarakKeLokasi > MAX_RADIUS) {
                toast.error(`Anda berada ${jarakKeLokasi}m dari lokasi`);
                return;
            }

            try {
                const formData = new FormData();
                formData.append("id_lokasi", selectedStore.id);
                formData.append("jarak", jarakKeLokasi);          // jarak ke lokasi
                formData.append("total_jarak", totalDistance);   // ⬅️ WAJIB
                formData.append("koordinat", `${userGPS.lat},${userGPS.lng}`);
                formData.append("foto", photoFile);
                formData.append("deskripsi", note);

                const res = await fetchWithJwt(
                    `${apiurl}/trip/user/in/${tripId}`,
                    { method: "PUT", body: formData }
                );

                if (!res.ok) {
                    let msg = "Gagal Check-In";
                    try {
                        const err = await res.json();
                        msg = err?.message || msg;
                    } catch { }
                    throw new Error(msg);
                }

                const json = await res.json();
                if (json?.success === false) {
                    throw new Error(json?.message || "Check-In ditolak server");
                }

                setModalType(null);
                setPhotoFile(null);
                setPhotoPreview(null);
                setNote("");
                setSelectedStore(null);
                setShowCheckpointForm(false);

                fetchTripHistory();
                toast.success("Check-In berhasil");

            } catch (err) {
                console.error(err);
                toast.error(err.message || "Gagal Check-In");
            }
        };


        const handleCheckOut = async () => {
            if (!photoFile) {
                toast.error("Foto wajib diambil untuk Check-Out");
                return;
            }

            if (!activeCheckpoint?.id_trip_lokasi) {
                toast.error("ID lokasi aktif tidak ditemukan");
                return;
            }

            if (distanceToActiveCheckpoint == null) {
                toast.error("Gagal menghitung jarak ke lokasi");
                return;
            }

            if (distanceToActiveCheckpoint > MAX_RADIUS) {
                showOutsideRadiusAlert(distanceToActiveCheckpoint);
                return;
            }

            try {
                const formData = new FormData();
                formData.append("foto", photoFile);
                formData.append("jarak", distanceToActiveCheckpoint);
                formData.append("koordinat", `${userGPS.lat},${userGPS.lng}`);

                const res = await fetchWithJwt(
                    `${apiurl}/trip/user/out/${activeCheckpoint.id_trip_lokasi}`,
                    {
                        method: "PUT",
                        body: formData,
                    }
                );

                if (!res.ok) {
                    let msg = "Gagal Check-Out";
                    try {
                        const err = await res.json();
                        msg = err?.message || msg;
                    } catch { }
                    throw new Error(msg);
                }

                const json = await res.json();
                if (json?.success === false) {
                    throw new Error(json?.message || "Check-Out ditolak server");
                }

                setModalType(null);
                setPhotoFile(null);
                setPhotoPreview(null);
                setNote("");

                fetchTripHistory();
                toast.success("Check-Out berhasil");

            } catch (err) {
                console.error(err);
                toast.error(err.message || "Gagal Check-Out");
            }
        };


        const handleEndVisit = async () => {
            if (!photoFile || !note) {
                toast.error("Foto dan keterangan wajib diisi");
                return;
            }
            if (!tripId) {
                toast.error("ID Trip tidak ditemukan");
                return;
            }
            if (activeCheckpoint) {
                toast.error("Masih ada lokasi yang belum di Check-Out");
                return;
            }
            if (!hasVisitedCheckpoint) {
                toast.error("Minimal harus mengunjungi 1 lokasi");
                return;
            }
            if (distanceToOffice == null) {
                toast.error("Gagal menghitung jarak ke kantor");
                return;
            }
            const lastLocation = history
                .filter(h => h.status === "out")
                .at(-1);
            if (!lastLocation?.id_lokasi) {
                toast.error("Lokasi terakhir tidak ditemukan");
                return;
            }
            try {
                const formData = new FormData();
                formData.append("id_lokasi", lastLocation.id_lokasi);
                formData.append("jarak", distanceToOffice);
                formData.append("koordinat", `${userGPS.lat},${userGPS.lng}`);
                formData.append("foto", photoFile);
                formData.append("deskripsi", note);
                const res = await fetchWithJwt(
                    `${apiurl}/trip/user/end/${tripId}`,
                    {
                        method: "PUT",
                        body: formData,
                    }
                );
                if (!res.ok) {
                    let msg = "Gagal mengakhiri kunjungan";
                    try {
                        const err = await res.json();
                        msg = err?.message || msg;
                    } catch { }
                    throw new Error(msg);
                }
                const json = await res.json();
                if (json?.success === false) {
                    throw new Error(json?.message || "Akhiri kunjungan ditolak server");
                }
                setModalType(null);
                setPhotoFile(null);
                setPhotoPreview(null);
                setNote("");
                fetchTripHistory();
                toast.success("Kunjungan berhasil diakhiri");
            } catch (err) {
                console.error(err);
                toast.error(err.message || "Gagal mengakhiri kunjungan");
            }
        };

        const handleCancelCheckpoint = () => {
            setShowCheckpointForm(false);
            setSelectedStore(null);
        };


        // ================= EARLY =================
        if (!userGPS) {
            return (
                <MobileLayout title="Kunjungan">
                    <LoadingSpinner message="Mengambil lokasi GPS..." />
                </MobileLayout>
            );
        }

        const MODAL_CONFIG = {
            start: {
                title: "Mulai Kunjungan",
                note: "Ambil foto dan isi keterangan."
            },
            checkpoint_first: {
                title: "Check-In & Absen Masuk",
                note: "Ambil foto dan isi keterangan sebagai Absen Masuk."
            },
            checkpoint: {
                title: "Check-In Lokasi",
                note: "Ambil foto dan isi keterangan untuk Check-In."
            },
            checkout: {
                title: "Check-Out Lokasi",
                note: "Ambil foto sebagai tanda selesai di lokasi ini."
            },
            end: {
                title: "Akhiri Kunjungan & Absen Pulang",
                note: "Ambil foto dan isi keterangan untuk Absen Pulang."
            }
        };

        const showOutsideRadiusAlert = (distance) => {
            Swal.fire({
                icon: "warning",
                title: "Anda berada di luar area lokasi",
                html: `
            <p style="font-size:13px; line-height:1.5">
                Jarak Anda saat ini <b>${formatDistance(distance)}</b> dari lokasi tujuan.
                <br/><br/>
                Silakan <b>berangkat ke titik lokasi tujuan</b> terlebih dahulu,
                lalu lakukan <b>Check-In di sana</b>.
                <br/><br/>
                Jika ingin pulang, <b>jangan lupa lakukan Check-Out di gerai</b>.
            </p>
            `,
                confirmButtonText: "Mengerti",
                confirmButtonColor: "#2563eb",
            });
        };



        const getModalKey = () => {
            if (modalType === "checkpoint" && isFirstCheckpoint) {
                return "checkpoint_first";
            }
            return modalType;
        };

        const resetModal = () => {
            setModalType(null);
            setNote("");
            setPhotoFile(null);
            setPhotoPreview(null);
            setSelectedStore(null);
        };


        // ================= RENDER =================
        return (
            <MobileLayout title="Kunjungan Teknisi">
                <div className="min-h-screen pb-28 space-y-4 bg-slate-50">
                    {showMapRoute && (
                        <div className="bg-white rounded-xl border p-2 px-3 pb-4 space-y-3">
                            <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-gray-800">
                                    Peta Perjalanan
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    {!visitStarted ? "Mulai perjalanan menuju gerai untuk Checkpoint pertama" : isFirstCheckpoint ? "Checkpoint pertama digunakan untuk Absen Masuk di gerai" : "Pantau posisi Anda selama menjalankan kunjungan"}
                                </p>
                            </div>

                            <MapRoute user={userGPS} destination={destination} onDistance={handleDistance} />
                            {visitStarted && showCheckpointForm && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700">
                                        {isFirstCheckpoint ? "Gerai untuk Checkpoint Pertama (Absen Masuk)" : "Lokasi Kerja yang Akan Dikunjungi"}
                                    </label>
                                    <Select options={storeOptions} placeholder={isFirstCheckpoint ? "Pilih gerai atau kantor" : "Pilih lokasi kerja yang akan dikunjungi"} onChange={(o) => setSelectedStore(o?.data || null)} />
                                    {selectedStore && (
                                        <div className={`flex items-start text-[11px] pl-1 ${selectedStore.distance <= MAX_RADIUS ? "text-emerald-700" : "text-rose-700"}`}>
                                            <div className="leading-relaxed">
                                                <p className="font-medium">
                                                    Jarak Anda ke lokasi ini:
                                                    <span className="font-semibold">
                                                        {" "}
                                                        {formatDistance(selectedStore.distance)}
                                                    </span>
                                                </p>

                                                <p className="text-[11px] opacity-90">
                                                    {selectedStore.distance <= MAX_RADIUS
                                                        ? isFirstCheckpoint ? "Anda berada di area gerai dan dapat melakukan Absen Masuk." : "Anda berada di area lokasi dan dapat melakukan Check-In."
                                                        : isFirstCheckpoint ? "Anda harus berada di area gerai untuk melakukan Absen Masuk." : `Anda berada di luar radius ${MAX_RADIUS} m. Dekati lokasi untuk Check-In.`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div ref={timelineRef}>
                        {shouldShowTimeline && (
                            <Timeline history={history} tripInfo={tripInfo} onCheckout={() => setModalType("checkout")} />
                        )}

                        {!visitStarted && (
                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-40">
                                <button onClick={() => setModalType("start")} className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold">
                                    Mulai Perjalanan Kunjungan
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {visitStarted && !visitEnded && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-40 space-y-2">
                        {!activeCheckpoint && !showCheckpointForm && (
                            <button onClick={() => setShowCheckpointForm(true)} className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold">
                                {isFirstCheckpoint ? "Checkpoint Pertama (Absen Masuk)" : "Tambah Lokasi Kunjungan"}
                            </button>
                        )}

                        {!activeCheckpoint && showCheckpointForm && (
                            <div className="flex gap-2">
                                <button onClick={handleCancelCheckpoint} className="flex-1 py-3 rounded-lg border border-gray-300 text-white text-xs font-semibold bg-red-500 hover:bg-red-600">
                                    Batalkan
                                </button>

                                <button
                                    onClick={() => {
                                        if (!selectedStore) {
                                            toast.error("Pilih lokasi terlebih dahulu");
                                            return;
                                        }

                                        if (
                                            selectedStore.distance == null ||
                                            Math.round(selectedStore.distance) > MAX_RADIUS
                                        ) {
                                            showOutsideRadiusAlert(selectedStore.distance);
                                            return;
                                        }

                                        setModalType("checkpoint");
                                    }}
                                    className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                                >
                                    {isFirstCheckpoint ? "Check-In & Absen Masuk" : "Check-In Lokasi"}
                                </button>

                            </div>
                        )}

                        {!activeCheckpoint && hasVisitedCheckpoint && !showCheckpointForm && (
                            <button onClick={() => setModalType("end")} className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold">
                                Akhiri Kunjungan & Absen Pulang
                            </button>
                        )}

                    </div>
                )}

                {(() => {
                    const modalKey = getModalKey();
                    const modalData = MODAL_CONFIG[modalKey];

                    return (
                        <Modal isOpen={["start", "checkpoint", "checkout", "end"].includes(modalType)} onClose={resetModal} title={modalData?.title} note={modalData?.note}
                            footer={
                                <button
                                    onClick={() => {
                                        if (modalType === "start") handleStartVisit();
                                        if (modalType === "checkpoint") handleCheckIn();
                                        if (modalType === "checkout") handleCheckOut();
                                        if (modalType === "end") handleEndVisit();
                                    }}
                                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold"
                                >
                                    {modalKey === "checkpoint_first" && "Simpan & Absen Masuk"}
                                    {modalKey === "checkpoint" && "Simpan Check-In"}
                                    {modalKey === "checkout" && "Simpan Check-Out"}
                                    {modalKey === "start" && "Mulai Kunjungan"}
                                    {modalKey === "end" && "Akhiri & Absen Pulang"}
                                </button>
                            }
                        >
                            {/* CAMERA */}
                            {!photoPreview ? (
                                <>
                                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-lg" onUserMedia={() => setCameraReady(true)} />
                                    <button onClick={capturePhoto} className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg">
                                        Ambil Foto
                                    </button>
                                </>
                            ) : (
                                <img src={photoPreview} className="rounded-lg" alt="preview" />
                            )}
                            <textarea className="w-full border rounded-lg p-2 mt-3 text-sm" placeholder="Contoh: Tiba di lokasi, kondisi aman, siap bekerja" value={note} onChange={(e) => setNote(e.target.value)} />
                        </Modal>
                    );
                })()}
            </MobileLayout>
        );
    };

    export default Kunjungan;
