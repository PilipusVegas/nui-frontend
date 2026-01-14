import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faEdit, faTrash, faPlus, faEye, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../../components";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { formatFullDate } from "../../../utils/dateUtils";

const Kunjungan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);
    const scheduledUserIds = data
        .map(item => item.id_user)
        .filter(Boolean);

    const fetchTrip = async () => {
        try {
            setLoading(true);
            const res = await fetchWithJwt(`${apiUrl}/trip`);
            const json = await res.json();
            setData(json.data || []);
        } catch (err) {
            setError("Gagal memuat data kunjungan");
            toast.error("Gagal memuat data kunjungan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrip();
    }, []);


    const statusMap = {
        0: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700" },
        1: { label: "Disetujui", color: "bg-green-100 text-green-700" },
        2: { label: "Ditolak", color: "bg-red-100 text-red-700" }
    };


    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Hapus Penjadwalan?",
            text: "Data penjadwalan yang dihapus tidak dapat dikembalikan",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280"
        });
        if (!confirm.isConfirmed) return;
        const toastId = toast.loading("Menghapus penjadwalan...");

        try {
            await fetchWithJwt(
                `${apiUrl}/jadwal/${id}`,
                { method: "DELETE" }
            );

            toast.success("Penjadwalan berhasil dihapus", { id: toastId });
            fetchTrip();
        } catch (err) {
            console.error(err);
            toast.error("Gagal menghapus penjadwalan", { id: toastId });
        }
    };

    const filteredData = data.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
            item.nama_user?.toLowerCase().includes(q) ||
            item.nip?.toLowerCase().includes(q) ||
            item.role?.toLowerCase().includes(q) ||
            item.lokasi?.some(l => l.nama?.toLowerCase().includes(q))
        );
    });


    return (
        <div className="bg-white flex flex-col">
            <SectionHeader title="Daftar Pengajuan Kunjungan" subtitle="Monitoring dan verifikasi perjalanan dinas karyawan" onBack={() => navigate(-1)}/>

            <div className="my-2">
                <SearchBar placeholder="Cari nama, role, shift, atau lokasi..." onSearch={setSearchQuery} />
            </div>

            {loading && <LoadingSpinner />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && data.length === 0 && (
                <EmptyState message="Data penjadwalan kosong" />
            )}

            {!loading && !error && data.length > 0 && (
                <>
                    <div className="hidden md:block">
                        <table className="min-w-full text-sm">
                            <thead className="bg-green-500 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-center rounded-tl-lg">No.</th>
                                    <th className="px-4 py-3 text-center align-middle">NIP</th>
                                    <th className="px-4 py-3 text-left align-middle">Nama Karyawan</th>
                                    <th className="px-4 py-3 text-center align-middle">Total Jarak</th>
                                    <th className="px-4 py-3 text-center align-middle">Tanggal Kunjungan</th>
                                    <th className="px-4 py-3 text-center align-middle">Lokasi Kunjungan</th>
                                    <th className="px-4 py-3 text-center align-middle">Status Pengajuan</th>
                                    <th className="px-4 py-3 text-center align-middle rounded-tr-lg">Menu</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredData.map((item, i) => {
                                    const lokasi = item.lokasi || [];
                                    const first = lokasi.length > 0 ? lokasi[0] : null;
                                    const tripStatus = statusMap[item.status];
                                    return (
                                        <tr key={item.id_kunjungan} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-1.5 align-middle text-center">
                                                {i + 1}
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-center">
                                                {item.nip}
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-left">
                                                <div className="font-semibold text-gray-800 uppercase">
                                                    {item.nama_user}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.role}
                                                </div>
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-center">
                                                {(item.total_jarak / 1000).toFixed(2)} km
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-center">
                                                {formatFullDate(item.tanggal)}
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-center relative">
                                                <div className="inline-flex items-center gap-2 cursor-pointer justify-center" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                                                    <span className="truncate max-w-[180px]">
                                                        {first ? first.nama : "-"}
                                                    </span>
                                                    {lokasi.length > 1 && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                            +{lokasi.length - 1}
                                                        </span>
                                                    )}
                                                    <FontAwesomeIcon icon={faChevronDown} className={`text-gray-500 transition ${expandedRow === i ? "rotate-180" : ""}`} />
                                                </div>

                                                {expandedRow === i && lokasi.length > 0 && (
                                                    <div className="absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-max min-w-[180px] bg-white border rounded-lg shadow-lg p-3 text-left">
                                                        <div className="text-xs font-semibold text-gray-600 mb-1">
                                                            Daftar Lokasi
                                                        </div>
                                                        <ul className="space-y-1 text-sm text-gray-700">
                                                            {lokasi.map((l, idx) => (
                                                                <li key={idx}>• {l.nama}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-1.5 align-middle text-center">
                                                <span className={`px-3 py-1 rounded text-xs font-medium ${tripStatus.color}`}>
                                                    {tripStatus.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => navigate(`/pengajuan/kunjungan/detail/${item.id_kunjungan}`, { state: { trip: item } })} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                                                        <FontAwesomeIcon icon={faEye} />
                                                        Detail
                                                    </button>

                                                    {/* Approve */}
                                                    <button
                                                        // onClick={() => handleApprove(item.id_kunjungan)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 transition"
                                                    >
                                                        <FontAwesomeIcon icon={faCheck} />
                                                        Approve
                                                    </button>

                                                    {/* Reject */}
                                                    <button
                                                        // onClick={() => handleReject(item.id_kunjungan)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 transition"
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden space-y-3">
                        {filteredData.map((item, i) => {
                            const lokasi = item.lokasi || [];
                            const first = lokasi[0];
                            const tripStatus = statusMap[item.status];

                            return (
                                <div key={item.id_kunjungan} className="border rounded-xl p-4 bg-white shadow-sm">
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="font-semibold">{item.nama_user}</div>
                                            <div className="text-xs text-gray-500">{item.nip} • {item.role}</div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${tripStatus.color}`}>
                                            {tripStatus.label}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm">
                                        <div><b>Jarak:</b> {(item.total_jarak / 1000).toFixed(2)} km</div>
                                        <div className="mt-1">
                                            <b>Lokasi:</b> {first?.nama}
                                            {lokasi.length > 1 && ` (+${lokasi.length - 1})`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default Kunjungan;
