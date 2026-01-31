import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faEye, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
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
    const scheduledUserIds = data.map(item => item.id_user);
    const getStatusPriority = (item) => { return item.has_ongoing ? 1 : 0; };
    const [statusSort, setStatusSort] = useState("empty-first");

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

    const handleDelete = async (id_user) => {
        const confirm = await Swal.fire({
            title: "Hapus Penjadwalan?",
            text: "Data yang dihapus tidak dapat dikembalikan",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280"
        });
        if (!confirm.isConfirmed) return;
        const toastId = toast.loading("Menghapus data...");
        try {
            await fetchWithJwt(`${apiUrl}/jadwal/all/${id_user}`, {
                method: "DELETE"
            });

            toast.success("Berhasil dihapus", { id: toastId });
            fetchPenjadwalan();
        } catch (err) {
            console.error(err);
            toast.error("Gagal menghapus data", { id: toastId });
        }
    };


    const filteredData = data
        .filter(item => {
            const q = searchQuery.toLowerCase();
            return (
                item.nama?.toLowerCase().includes(q) ||
                item.nip?.toLowerCase().includes(q) ||
                item.role?.toLowerCase().includes(q)
            );
        })
        .slice()
        .sort((a, b) => {
            const aPriority = getStatusPriority(a);
            const bPriority = getStatusPriority(b);

            if (statusSort === "empty-first") {
                if (aPriority !== bPriority) return aPriority - bPriority;
            } else {
                if (aPriority !== bPriority) return bPriority - aPriority;
            }
            return a.nama.localeCompare(b.nama);
        });


    const renderStatus = (hasOngoing) => {
        return !hasOngoing ? (
            <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                Jadwal Kosong
            </span>
        ) : (
            <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                Jadwal Tersedia
            </span>
        );
    };

    return (
        <div className="bg-white flex flex-col">
            <SectionHeader title="Penjadwalan Karyawan" subtitle="Daftar karyawan dan status ketersediaan" onBack={() => navigate(-1)}
                actions={
                    <button onClick={() => navigate("/penjadwalan/tambah", { state: { scheduledUserIds } })} className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold bg-green-500 rounded">
                        <FontAwesomeIcon icon={faPlus} />
                        Tambah Baru
                    </button>
                }
            />

            <SearchBar placeholder="Cari nama, NIP, atau role..." onSearch={setSearchQuery} className="my-3" />

            {loading && <LoadingSpinner />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && data.length === 0 && (
                <EmptyState message="Data karyawan kosong" />
            )}

            {!loading && !error && data.length > 0 && (
                <div className="hidden md:block mb-20">
                    <table className="min-w-full text-sm">
                        <thead className="bg-green-500 text-white">
                            <tr>
                                <th className="px-4 py-3 text-center rounded-tl-lg">
                                    No
                                </th>
                                <th className="px-4 py-3 text-center">
                                    NIP
                                </th>
                                <th className="px-4 py-3 text-left">
                                    Nama
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Divisi
                                </th>
                                <th className="px-4 py-3 text-center">
                                    <button onClick={() => setStatusSort(prev => prev === "empty-first" ? "available-first" : "empty-first")} className="flex items-center justify-center gap-2 w-full hover:text-gray-200 transition cursor-pointer" title="Urutkan status" type="button">
                                        <span>Status</span>
                                        <FontAwesomeIcon icon={statusSort === "empty-first" ? faSortUp : faSortDown} />
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-center rounded-tr-lg">
                                    Menu
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.map((item, i) => (
                                <tr key={item.id_user} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 text-center">{i + 1}</td>
                                    <td className="px-4 py-2 text-center">{item.nip}</td>
                                    <td className="px-4 py-2 font-semibold">{item.nama}</td>
                                    <td className="px-4 py-2 text-center">{item.role}</td>
                                    <td className="px-4 py-2 text-center">
                                        {renderStatus(item.has_ongoing)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => navigate(`/penjadwalan/detail/${item.id_user}`)} className="px-3 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded">
                                                <FontAwesomeIcon icon={faEye} /> Detail
                                            </button>
                                            {/* <button onClick={() => handleDelete(item.id_user)} className="px-3 py-2 bg-red-500 text-white rounded">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button> */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* MOBILE VIEW */}
            {!loading && !error && data.length > 0 && (
                <div className="block md:hidden space-y-3 mb-20">
                    {filteredData.map((item) => (
                        <div key={item.id_user} className="border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3">
                            {/* Content */}
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-base text-gray-900">
                                    {item.nama}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {item.nip} • {item.role}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2">
                                {renderStatus(item.has_ongoing)}

                                <button onClick={() => navigate(`/penjadwalan/detail/${item.id_user}`)} className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md">
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

export default PenjadwalanKaryawan;
