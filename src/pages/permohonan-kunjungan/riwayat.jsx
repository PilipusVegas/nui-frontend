import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faA, faArrowRight, faEye } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, SearchBar, Modal } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import { getDefaultPeriodWeek } from "../../utils/getDefaultPeriod";
import toast from "react-hot-toast";

const RiwayatKunjungan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const defaultPeriod = getDefaultPeriodWeek();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState(defaultPeriod.start);
    const [endDate, setEndDate] = useState(defaultPeriod.end);
    const [selectedUser, setSelectedUser] = useState(null);

    /* FETCH DATA */
    const fetchRiwayat = async () => {
        try {
            setLoading(true);
            const res = await fetchWithJwt(
                `${apiUrl}/trip/riwayat?startDate=${startDate}&endDate=${endDate}`
            );
            const json = await res.json();
            setData(json.data || []);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat riwayat kunjungan");
            toast.error("Gagal memuat riwayat kunjungan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiwayat();
    }, [startDate, endDate]);

    /* FILTER */
    const filteredData = data.filter((user) => {
        const q = searchQuery.toLowerCase();
        return (
            user.nama_user?.toLowerCase().includes(q) ||
            user.nip_user?.toLowerCase().includes(q)
        );
    });

    const statusMap = {
        1: {
            label: "Disetujui",
            className: "bg-green-100 text-green-700",
        },
        2: {
            label: "Ditolak",
            className: "bg-red-100 text-red-700",
        },
    };


    return (
        <div className="bg-white flex flex-col">
            <SectionHeader title="Riwayat Kunjungan" subtitle="Data historis kunjungan karyawan"
                onBack={() => navigate(-1)}
                actions={
                    <div className="flex gap-2">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                }
            />

            <div className="my-3">
                <SearchBar placeholder="Cari nama atau NIP..." onSearch={setSearchQuery} />
            </div>

            {loading && <LoadingSpinner />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && filteredData.length === 0 && (
                <EmptyState message="Data tidak ditemukan" />
            )}

            {!loading && !error && filteredData.length > 0 && (
                <div className="hidden md:block">
                    <table className="table-auto w-full border-collapse text-sm">
                        <thead className="bg-green-500 text-white">
                            <tr>
                                <th className="px-4 py-3 text-center rounded-tl-lg">
                                    No
                                </th>
                                <th className="px-4 py-3 text-center">
                                    NIP
                                </th>
                                <th className="px-4 py-3 text-left">
                                    Nama Karyawan
                                </th>
                                <th className="px-4 py-3 text-center">
                                    Total Riwayat
                                </th>
                                <th className="px-4 py-3 text-center rounded-tr-lg">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.map((user, i) => (
                                <tr key={user.id_user} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 text-center">{i + 1}</td>
                                    <td className="px-4 py-2 text-center">{user.nip_user}</td>
                                    <td className="px-4 py-2 font-semibold uppercase">
                                        {user.nama_user}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {user.riwayat?.length || 0}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button onClick={() => setSelectedUser(user)} className="flex items-center gap-1 px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 mx-auto">
                                            <FontAwesomeIcon icon={faEye} />
                                            Lihat Riwayat
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
                    {filteredData.map((user) => (
                        <div key={user.id_user} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            {/* HEADER */}
                            <div>
                                <div className="font-semibold text-sm uppercase">
                                    {user.nama_user}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {user.nip_user}
                                </div>
                            </div>

                            {/* INFO */}
                            <div className="mt-2 text-xs text-gray-600">
                                Total Riwayat:{" "}
                                <span className="font-semibold">
                                    {user.riwayat?.length || 0}
                                </span>
                            </div>

                            {/* ACTION */}
                            <div className="mt-3 flex justify-end">
                                <button onClick={() => setSelectedUser(user)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-md transition">
                                    <FontAwesomeIcon icon={faEye} />
                                    Lihat
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL RIWAYAT USER */}
            <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Riwayat Kunjungan" note={selectedUser && `${selectedUser.nama_user} (${selectedUser.nip_user})`} size="lg">
                {selectedUser?.riwayat?.length === 0 ? (
                    <EmptyState message="Riwayat kunjungan kosong" />
                ) : (
                    <>
                        <div className="border border-gray-200 rounded-lg bg-white mb-4">
                            {/* HEADER */}
                            <div className="px-4 py-3 border-b border-gray-100 flex flex-col">
                                <span className="text-sm font-semibold text-gray-800">
                                    Ringkasan Kunjungan
                                </span>
                                <span className="text-xs text-gray-600">
                                    Periode {formatFullDate(startDate)} - {formatFullDate(endDate)}
                                </span>
                            </div>
                            {/* SUMMARY */}
                            <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-y-4 text-sm">
                                <div>
                                    <div className="text-xs text-gray-600">
                                        Disetujui
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {selectedUser?.total_approved ?? 0}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600">
                                        Ditolak
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {selectedUser?.total_rejected ?? 0}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600">
                                        Total Jarak
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {((selectedUser?.sum_distance ?? 0) / 1000).toFixed(2)} km
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600">
                                        Total Nominal
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        Rp {(selectedUser?.sum_nominal ?? 0).toLocaleString("id-ID")}
                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="max-h-[420px] overflow-y-auto pr-1 space-y-3">
                            {selectedUser?.riwayat?.map((r) => {
                                const status = statusMap[r.status];
                                return (
                                    <div key={r.id_trip} className="group border border-gray-200 rounded-xl p-4 bg-white hover:border-gray-300 hover:shadow-sm transition">

                                        {/* HEADER */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-800">
                                                    {formatFullDate(r.tanggal)}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Diproses oleh {r.approved_by || "-"}
                                                </div>
                                            </div>

                                            {status && (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            )}
                                        </div>


                                        {/* INFO */}
                                        <div className="grid grid-cols-2 gap-6 mt-4 text-sm">
                                            <div>
                                                <div className="text-xs text-gray-400 mb-1">
                                                    Total Jarak
                                                </div>
                                                <div className="font-semibold text-gray-800">
                                                    {(r.total_jarak / 1000).toFixed(2)} km
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400 mb-1">
                                                    Nominal
                                                </div>
                                                <div className="font-semibold text-gray-800">
                                                    Rp {r.nominal?.toLocaleString("id-ID")}
                                                </div>
                                            </div>
                                        </div>


                                        {/* META */}
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                            <div className="text-xs text-gray-400">
                                                Disetujui pada {r.approved_at ? formatFullDate(r.approved_at) : "-"}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(null);
                                                    navigate(`/permohonan-kunjungan/detail/${r.id_trip}`);
                                                }}
                                                className="group inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                                            >
                                                Lihat selengkapnya
                                                <FontAwesomeIcon
                                                    icon={faArrowRight}
                                                    className="text-xs opacity-70 group-hover:opacity-100 transition"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </Modal>

        </div>
    );
};

export default RiwayatKunjungan;
