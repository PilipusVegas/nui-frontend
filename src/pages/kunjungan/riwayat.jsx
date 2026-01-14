import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute, faClock, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const RiwayatKunjungan = () => {
    const apiurl = process.env.REACT_APP_API_BASE_URL;
    const [riwayat, setRiwayat] = useState([]);

    useEffect(() => {
        const fetchRiwayat = async () => {
            try {
                const res = await fetchWithJwt(`${apiurl}/trip/user/riwayat`);
                const json = await res.json();
                setRiwayat(json.data || []);
            } catch (err) {
                console.error("Gagal ambil riwayat:", err);
            }
        };

        fetchRiwayat();
    }, [apiurl]);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const getStatusBadge = (status) => {
        if (status === 1)
            return (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] flex items-center gap-1">
                    <FontAwesomeIcon icon={faCheckCircle} /> Disetujui
                </span>
            );
        if (status === 2)
            return (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] flex items-center gap-1">
                    <FontAwesomeIcon icon={faTimesCircle} /> Ditolak
                </span>
            );
        return (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-[10px] flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} /> Menunggu
            </span>
        );
    };

    return (
        <MobileLayout title="Riwayat Kunjungan">
            <div className="p-2 space-y-4 max-w-md mx-auto">

                {/* LIST RIWAYAT */}
                {riwayat.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-4 text-center text-xs text-gray-500">
                        Belum ada riwayat kunjungan.
                    </div>
                ) : (
                    riwayat.map((trip, i) => (
                        <div key={i} className="bg-white rounded-xl shadow p-4 space-y-3">

                            {/* TOP INFO */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-400">Tanggal</p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {formatDate(trip.tanggal)}
                                    </p>
                                </div>
                                {getStatusBadge(trip.status)}
                            </div>

                            {/* DESKRIPSI */}
                            <div className="text-xs text-gray-600">
                                {trip.deskripsi}
                            </div>

                            {/* JARAK */}
                            <div className="flex items-center gap-2 text-xs text-gray-700">
                                <FontAwesomeIcon icon={faRoute} className="text-blue-500" />
                                Total jarak: {(trip.total_jarak / 1000).toFixed(2)} km
                            </div>

                            {/* TIMELINE */}
                            <div className="space-y-2 border-t pt-3">
                                <p className="text-xs font-semibold text-gray-600">
                                    Timeline Lokasi
                                </p>

                                {trip.lokasi.map((lokasi, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">

                                        {/* DOT */}
                                        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                                            {idx === 0 ? "S" : idx + 0}
                                        </div>

                                        {/* CONTENT */}
                                        <div className="flex-1 text-xs space-y-1">
                                            <p className="font-medium text-gray-700">
                                                {idx === 0 ? "Start" : `Checkpoint ${idx}`}
                                            </p>
                                            <p className="text-gray-600 leading-snug text-[10px]">
                                                {lokasi.nama}
                                            </p>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </MobileLayout>
    );
};

export default RiwayatKunjungan;
