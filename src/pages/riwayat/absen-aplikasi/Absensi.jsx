import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faMapMarkerAlt, faClock, faUserClock, } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate, formatTime } from "../../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SearchBar } from "../../../components";

export default function Absensi() {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const user = getUserFromToken();
    const [data, setData] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/absen/riwayat/${user.id_user}`);

                // === Perbedaan utama ===
                if (res.status === 404) {
                    setData([]);            // kosong → EmptyState otomatis muncul
                    return;                 // hentikan proses tanpa set error
                }

                if (!res.ok) throw new Error("Gagal memuat data absensi");

                const json = await res.json();
                const sorted = json.sort(
                    (a, b) => new Date(b.jam_mulai) - new Date(a.jam_mulai)
                );
                setData(sorted);
            } catch (e) {
                // hanya error selain 404
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiUrl, user.id_user]);


    useEffect(() => { setFiltered(data); }, [data]);

    const handleSearch = (e) => {
        const q = e.target.value.toLowerCase();
        setQuery(q);
        setFiltered(
            data.filter(i =>
                `${i.lokasi_absen} ${formatFullDate(i.jam_mulai)}`.toLowerCase().includes(q)
            )
        );
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;

    return (
        <>
            {/* Pencarian */}
            <div className="relative mb-4">
                <SearchBar onSearch={handleSearch} placeholder="Cari riwayat absensi..." />
            </div>

            <div className="pb-4 max-h-[460px] overflow-y-auto space-y-4">
                {filtered.length === 0 ? (
                    <EmptyState message="Belum ada riwayat absensi yang cocok." />
                ) : (
                    filtered.map((i) => {
                        const tglMasuk = formatFullDate(i.jam_mulai);
                        const tglPulang = i.jam_selesai ? formatFullDate(i.jam_selesai) : null;

                        return (
                            <div key={i.id_absen} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
                                {/* === Header: Tanggal & Shift === */}
                                <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700">{tglMasuk}</p>
                                    <span className="text-xs font-medium text-gray-600">
                                        {i.nama_shift}
                                    </span>
                                </div>

                                {/* === Section: Masuk === */}
                                <div className="px-4 py-2 space-y-1 border-b border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-medium text-gray-500">Masuk</p>
                                        <p className="text-[10px] text-gray-500 tracking-wide">{tglMasuk}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className={`font-semibold ${i.jam_mulai ? "text-green-600" : "text-gray-400"}`}>
                                                {i.jam_mulai ? formatTime(i.jam_mulai) : "—"}
                                            </span>
                                            {i.keterlambatan ? (
                                                <span className="text-[9px] text-red-700 tracking-wide mt-0.5">
                                                    Terlambat: {i.keterlambatan} Menit
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="flex items-start gap-2 text-xs text-gray-700">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500 mt-0.5" />
                                            <span>{i.lokasi_absen_mulai ?? "Lokasi tidak tercatat"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* === Section: Pulang (hanya jika jam_selesai ada) === */}
                                {i.jam_selesai && (
                                    <div className="px-4 py-2 space-y-1 border-b border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-medium text-gray-500">Pulang</p>
                                            <p className="text-[10px] text-gray-500 tracking-wide">{tglPulang}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`font-semibold ${i.jam_selesai ? "text-green-600" : "text-gray-400"}`}>
                                                {formatTime(i.jam_selesai)}
                                            </p>
                                            <div className="flex items-start gap-2 text-xs text-gray-700">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 mt-0.5" />
                                                <span>{i.lokasi_absen_selesai ?? "Lokasi tidak tercatat"}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}