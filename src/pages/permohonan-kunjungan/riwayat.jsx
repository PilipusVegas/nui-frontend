import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
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

            {/* MODAL RIWAYAT USER */}
            <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Riwayat Kunjungan" note={selectedUser && `${selectedUser.nama_user} (${selectedUser.nip_user})`} size="lg">
                {selectedUser?.riwayat?.length === 0 ? (
                    <EmptyState message="Riwayat kunjungan kosong" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border border-gray-200 border-collapse">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-center font-semibold rounded-tl-lg">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Total Jarak
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Nominal
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold">
                                        Diproses Oleh
                                    </th>
                                    <th className="px-4 py-3 text-center font-semibold rounded-tr-lg">
                                        Menu
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {selectedUser?.riwayat?.map((r) => {
                                    const status = statusMap[r.status];

                                    return (
                                        <tr key={r.id_trip} className="border-t hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {formatFullDate(r.tanggal)}
                                            </td>

                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {(r.total_jarak / 1000).toFixed(2)} km
                                            </td>

                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                Rp {r.nominal?.toLocaleString("id-ID")}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                {status ? (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                                                        {status.label}
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-center text-xs text-gray-600">
                                                {r.approved_by || "-"}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(null);
                                                        navigate(`/permohonan-kunjungan/detail/${r.id_trip}`);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>





        </div>
    );
};

export default RiwayatKunjungan;
