import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faEdit, faTrash, faCloudDownload, faPlus } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const PenjadwalanKaryawan = () => {
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

    const fetchPenjadwalan = async () => {
        try {
            setLoading(true);
            const res = await fetchWithJwt(`${apiUrl}/jadwal`);
            const json = await res.json();
            setData(json.data || []);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat data penjadwalan");
            toast.error("Gagal memuat data penjadwalan");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchPenjadwalan();
    }, []);


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
            fetchPenjadwalan();
        } catch (err) {
            console.error(err);
            toast.error("Gagal menghapus penjadwalan", { id: toastId });
        }
    };

    const filteredData = data.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
            item.nama?.toLowerCase().includes(q) ||
            item.role?.toLowerCase().includes(q) ||
            item.jadwal?.nama_shift?.toLowerCase().includes(q) ||
            item.jadwal?.lokasi?.some(l =>
                l.nama?.toLowerCase().includes(q)
            )
        );
    });

    return (
        <div className="bg-white flex flex-col">
            <SectionHeader title="Penjadwalan Karyawan" subtitle="Atur Shift dan Lokasi Absensi Karyawan Lapangan"
                onBack={() => navigate(-1)}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => navigate("/penjadwalan/tambah", { state: { scheduledUserIds }})} className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold bg-green-500 rounded">
                            <FontAwesomeIcon icon={faPlus} />
                            Tambah
                        </button>
                        {/* <button className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold bg-blue-500 rounded">
                            <FontAwesomeIcon icon={faCloudDownload} />
                            Sinkron SPK
                        </button> */}
                    </div>
                }
            />

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
                                    <th className="px-4 py-3 text-center rounded-tl-lg">
                                        No.
                                    </th>
                                    <th className="px-4 py-3 text-left align-middle">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-center align-middle">
                                        Shift
                                    </th>
                                    <th className="px-4 py-3 text-center align-middle">
                                        Lokasi
                                    </th>
                                    <th className="px-4 py-3 text-center align-middle rounded-tr-lg">
                                        Menu
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, i) => {
                                    const lokasi = item.jadwal?.lokasi || [];
                                    const first = lokasi.length > 0 ? lokasi[0] : null;
                                    return (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-1.5 align-middle text-center">
                                                {i + 1}
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-left">
                                                <div className="font-semibold text-gray-800">
                                                    {item.nama}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.role}
                                                </div>
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-center">
                                                {item.jadwal.nama_shift}
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-center relative">
                                                <div className="inline-flex items-center gap-2 cursor-pointer justify-center" onMouseEnter={() => setExpandedRow(i)} onMouseLeave={() => setExpandedRow(null)} onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
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
                                                            {lokasi.map((l) => (
                                                                <li key={l.id}>• {l.nama}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-1.5 align-middle">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => navigate(`/penjadwalan/edit/${item.id_user}`)} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                        <span className="text-xs font-medium">Edit</span>
                                                    </button>

                                                    <button onClick={() => handleDelete(item.id_user)} className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                        <span className="text-xs font-medium">Hapus</span>
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
                            const lokasi = item.jadwal?.lokasi || [];
                            const first = lokasi[0];
                            return (
                                <div key={i} className="border rounded-xl p-4 bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {item.nama}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.role}
                                            </div>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                            {item.jadwal.nama_shift}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Lokasi:</span>
                                            <span className="truncate max-w-[160px]">
                                                {first ? first.nama : "-"}
                                            </span>

                                            {lokasi.length > 1 && (
                                                <span onClick={() => setExpandedRow(expandedRow === i ? null : i)} className="text-xs bg-gray-200 px-2 rounded cursor-pointer">
                                                    +{lokasi.length - 1}
                                                </span>
                                            )}
                                        </div>

                                        {expandedRow === i && (
                                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                                                {lokasi.map((l) => (
                                                    <div key={l.id}> • {l.nama}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2 mt-4">
                                        <button onClick={() => navigate(`/penjadwalan/edit/${item.id_user}`)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-yellow-500 text-white rounded">
                                            <FontAwesomeIcon icon={faEdit} />
                                            Edit
                                        </button>

                                        <button onClick={() => handleDelete(item.id_user)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded">
                                            <FontAwesomeIcon icon={faTrash} />
                                            Hapus
                                        </button>
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

export default PenjadwalanKaryawan;
