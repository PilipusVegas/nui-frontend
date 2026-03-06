import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import toast from "react-hot-toast";
import { formatFullDate } from "../../utils/dateUtils";
import Swal from "sweetalert2";


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

        const result = await Swal.fire({
            title: "Hapus Kunjungan?",
            text: "Data kunjungan yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            setDeletingId(id_trip);

            const res = await fetchWithJwt(`${apiUrl}/trip/${id_trip}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Gagal menghapus data");
            }

            await Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Data kunjungan berhasil dihapus",
                timer: 1500,
                showConfirmButton: false,
            });

            fetchTrip();

        } catch (err) {

            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Gagal menghapus data kunjungan",
            });

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
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
                Perjalanan Selesai
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">
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
                <div className="hidden lg:block">
                    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full table-auto text-sm">
                            <thead className="bg-green-500 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-center rounded-tl-lg whitespace-nowrap">No</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap">NIP</th>
                                    <th className="px-4 py-3 text-left whitespace-nowrap">Nama</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap">Tanggal</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap">Status</th>
                                    <th className="px-4 py-3 text-center rounded-tr-lg whitespace-nowrap w-[200px]">
                                        Menu
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredData.map((item, i) => (
                                    <tr key={item.id_kunjungan} className="border-b hover:bg-gray-50 transition">
                                        <td className="px-4 py-2 text-center whitespace-nowrap">
                                            {i + 1}
                                        </td>
                                        <td className="px-4 py-2 text-center whitespace-nowrap">
                                            {item.nip}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="font-semibold uppercase whitespace-nowrap">
                                                {item.nama}
                                            </div>
                                            <div className="text-xs text-gray-500 whitespace-nowrap">
                                                {item.role}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center whitespace-nowrap">
                                            {formatFullDate(item.tanggal)}
                                        </td>
                                        <td className="px-4 py-2 text-center whitespace-nowrap">
                                            {renderStatus(item.is_complete)}
                                        </td>
                                        {/* AKSI */}
                                        <td className="px-4 py-2">
                                            <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                                <button onClick={() => navigate(`/permohonan-kunjungan/detail/${item.id_kunjungan}`)}
                                                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition whitespace-nowrap"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                    Detail
                                                </button>

                                                <button onClick={() => handleDeleteTrip(item.id_kunjungan)} disabled={deletingId === item.id_kunjungan}
                                                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition disabled:opacity-50"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    {deletingId === item.id_kunjungan ? "Menghapus..." : "Hapus"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ================= MOBILE ================= */}
            {!loading && !error && filteredData.length > 0 && (
                <div className="lg:hidden space-y-3">
                    {filteredData.map((item) => (
                        <div key={item.id_kunjungan} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            {/* HEADER */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-sm">
                                        {item.nama}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {item.nip} • {item.role}
                                    </div>
                                </div>
                                {renderStatus(item.is_complete)}
                            </div>

                            {/* CONTENT */}
                            <div className="mt-2 text-xs text-gray-600 space-y-1">
                                <div>
                                    <span className="font-medium">Tanggal:</span>{" "}
                                    {formatFullDate(item.tanggal)}
                                </div>
                            </div>

                            {/* ACTION - kanan bawah */}
                            <div className="mt-3 flex justify-end gap-2">
                                <button onClick={() => navigate(`/permohonan-kunjungan/detail/${item.id_kunjungan}`)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                    Detail
                                </button>

                                <button onClick={() => handleDeleteTrip(item.id_kunjungan)} disabled={deletingId === item.id_kunjungan} className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-md transition disabled:opacity-50">
                                    <FontAwesomeIcon icon={faTrash} />
                                    {deletingId === item.id_kunjungan ? "Menghapus..." : "Hapus"}
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