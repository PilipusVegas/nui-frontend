import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import toast from "react-hot-toast";
import { formatFullDate } from "../../utils/dateUtils";


const Kunjungan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const fetchTrip = async () => {
        try {
            setLoading(true);
            const res = await fetchWithJwt(`${apiUrl}/trip`);
            const json = await res.json();
            setData(json.data || []);
        } catch {
            setError("Gagal memuat data kunjungan");
            toast.error("Gagal memuat data kunjungan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrip();
    }, []);

    const handleDeleteTrip = async (id_trip) => {
        const confirm = window.confirm("Yakin ingin menghapus data kunjungan ini?");
        if (!confirm) return;

        try {
            setDeletingId(id_trip);
            const res = await fetchWithJwt(`${apiUrl}/trip/${id_trip}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Gagal menghapus data");
            }
            toast.success("Data kunjungan berhasil dihapus");
            fetchTrip();
        } catch (err) {
            toast.error("Gagal menghapus data kunjungan");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredData = data.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
            item.nama?.toLowerCase().includes(q) ||
            item.nip?.toLowerCase().includes(q) ||
            item.role?.toLowerCase().includes(q)
        );
    });

    const renderStatus = (isComplete) =>
        isComplete ? (
            <span className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                Perjalanan Selesai
            </span>
        ) : (
            <span className="px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                Perjalanan Berjalan
            </span>
        );

    return (
        <div className="bg-white flex flex-col">
            <SectionHeader title="Permohonan Kunjungan" subtitle="Verifikasi perjalanan yang diajukan karyawan" onBack={() => navigate(-1)} />

            <div className="my-3">
                <SearchBar placeholder="Cari nama, NIP, atau role..." onSearch={setSearchQuery} />
            </div>

            {loading && <LoadingSpinner />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && filteredData.length === 0 && (
                <EmptyState message="Tidak ada permohonan kunjungan" />
            )}

            {/* ================= DESKTOP ================= */}
            {!loading && !error && filteredData.length > 0 && (
                <div className="hidden md:block">
                    <table className="min-w-full text-sm">
                        <thead className="bg-green-500 text-white">
                            <tr>
                                <th className="px-4 py-3 text-center rounded-tl-lg">No</th>
                                <th className="px-4 py-3 text-center">NIP</th>
                                <th className="px-4 py-3 text-left">Nama</th>
                                <th className="px-4 py-3 text-center">Total Jarak</th>
                                <th className="px-4 py-3 text-center">Tanggal</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center rounded-tr-lg">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, i) => (
                                <tr key={item.id_kunjungan} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 text-center">{i + 1}</td>
                                    <td className="px-4 py-2 text-center">{item.nip}</td>
                                    <td className="px-4 py-2">
                                        <div className="font-semibold uppercase">
                                            {item.nama}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {item.role}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {(item.total_jarak / 1000).toFixed(2)} km
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {formatFullDate(item.tanggal)}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {renderStatus(item.is_complete)}
                                    </td>
                                    <td className="px-4 py-2 text-center space-x-2">
                                        <button onClick={() => navigate(`/permohonan-kunjungan/detail/${item.id_kunjungan}`)} className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded">
                                            <FontAwesomeIcon icon={faEye} /> Detail
                                        </button>

                                        <button onClick={() => handleDeleteTrip(item.id_kunjungan)} disabled={deletingId === item.id_kunjungan} className="px-3 py-1.5 text-xs bg-red-500 text-white rounded disabled:opacity-50">
                                            <FontAwesomeIcon icon={faTrash} /> Hapus
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ================= MOBILE ================= */}
            {!loading && !error && filteredData.length > 0 && (
                <div className="md:hidden space-y-3">
                    {filteredData.map(item => (
                        <div key={item.id_kunjungan} className="border rounded-xl p-4 bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold">{item.nama}</div>
                                    <div className="text-xs text-gray-500">
                                        {item.nip} • {item.role}
                                    </div>
                                </div>
                                {renderStatus(item.is_complete)}
                            </div>

                            <div className="mt-2 text-sm space-y-1">
                                <div>
                                    <b>Tanggal:</b> {formatFullDate(item.tanggal)}
                                </div>
                                <div>
                                    <b>Jarak:</b>{" "}
                                    {(item.total_jarak / 1000).toFixed(2)} km
                                </div>
                            </div>

                            <div className="mt-3">
                                <button onClick={() => navigate(`/permohonan-kunjungan/detail/${item.id_kunjungan}`)} className="w-full py-2 text-xs bg-blue-500 text-white rounded">
                                    <FontAwesomeIcon icon={faEye} /> Detail
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Kunjungan;