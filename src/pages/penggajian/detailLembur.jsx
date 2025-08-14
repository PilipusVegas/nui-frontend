import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faClock } from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";

const DetailLembur = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dataLembur, setDataLembur] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const handleBackClick = () => navigate(`/penggajian/${id}`);

    useEffect(() => {
        const fetchLembur = async () => {
            setLoading(true);
            try {
                const res = await fetchWithJwt(`${apiUrl}/lembur/riwayat/${id}`);
                const lemburArray = await res.json();

                // Ambil periode default
                const { start, end } = getDefaultPeriod();
                const startDate = new Date(start);
                const endDate = new Date(end);

                // Filter data berdasarkan tanggal
                const filtered = (Array.isArray(lemburArray) ? lemburArray : []).filter(item => {
                    const itemDate = new Date(item.tanggal);
                    return itemDate >= startDate && itemDate <= endDate;
                });

                setDataLembur(filtered);
            } catch (err) {
                console.error(err);
                setDataLembur([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLembur();
    }, [id, apiUrl]);

    const formatTanggal = (tanggal) => {
        const date = new Date(tanggal);
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatJam = (jam) => {
        if (!jam) return "-";
        const date = new Date(`1970-01-01T${jam}`);
        return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    };

    if (loading)
        return <div className="p-4 text-center">Memuat data...</div>;

    return (
        <div className="w-full space-y-6">
            {/* Header Back */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faArrowLeft} onClick={handleBackClick} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 p-3 rounded-full transition-all shadow-md" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Detail Lembur Karyawan
                    </h2>
                </div>
            </div>

            {/* Card Nama */}
            <div className="bg-white border rounded-xl shadow-md overflow-hidden p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                    Nama Karyawan
                </h3>
                <div className="text-green-700 font-bold text-xl sm:text-2xl">
                    {dataLembur[0]?.nama || "Nama Karyawan"}
                </div>
            </div>

            {/* Tabel Lembur */}
            <div className="bg-white border rounded-xl shadow-md">
                <table className="min-w-full border border-gray-200 text-sm sm:text-base">
                    <thead className="bg-green-600 text-white text-center">
                        <tr>
                            <th className="px-4 py-2 text-center rounded-tl-xl">Tanggal</th>
                            <th className="px-4 py-2 text-center">Lokasi</th>
                            <th className="px-4 py-2 text-center">Jam</th>
                            <th className="px-4 py-2 text-center">Deskripsi</th>
                            <th className="px-4 py-2 text-center rounded-tr-xl">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataLembur.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <FontAwesomeIcon icon={faClock} size="2x" />
                                        <span>Belum ada riwayat lembur</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            dataLembur.map((item) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50 transition-colors duration-200 text-center text-sm">
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {formatTanggal(item.tanggal)}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">{item.lokasi}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {formatJam(item.jam_mulai)} - {formatJam(item.jam_selesai)}
                                    </td>
                                    <td className="px-4 py-2 relative group max-w-xs">
                                        <span className="truncate block">{item.deskripsi}</span>
                                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-20 w-64">
                                            {item.deskripsi}
                                        </div>
                                    </td>
                                    <td className={`px-4 py-2 font-semibold ${item.status === 1 ? "text-green-600" : "text-red-600" }`}>
                                        {item.status === 1 ? "Disetujui" : "Ditolak"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

};

export default DetailLembur;
