import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const TABS = [
    {
        key: "ongoing",
        label: "Sedang Berjalan",
        description: "Jadwal aktif dan sedang berlangsung saat ini",
    },
    {
        key: "future",
        label: "Akan Datang",
        description: "Jadwal yang akan berlaku pada periode berikutnya",
    },
    {
        key: "history",
        label: "Riwayat",
        description: "Jadwal yang telah selesai dan tidak aktif",
    },
];

const CountBadge = ({ count, color }) => {
    if (!count) return null;

    return (
        <span className={`ml-2 px-2 rounded-full text-[10px] font-semibold ${color}`}>
            {count}
        </span>
    );
};


const DetailPenjadwalan = () => {
    const { id_user } = useParams();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState("ongoing");
    const [data, setData] = useState(null);

    /* FETCH DATA */
    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);

            const res = await fetchWithJwt(
                `${apiUrl}/jadwal/detail/${id_user}`
            );
            const json = await res.json();

            if (!res.ok) {
                throw new Error(json?.message || "Gagal memuat data");
            }

            const detailArray = Array.isArray(json?.data)
                ? json.data
                : json?.data
                    ? [json.data]
                    : [];

            if (!detailArray.length) {
                throw new Error("Data penjadwalan tidak ditemukan");
            }

            setData(detailArray[0]);
        } catch (err) {
            console.error(err);
            setError(true);
            toast.error("Gagal memuat detail penjadwalan");
        } finally {
            setLoading(false);
        }
    }, [apiUrl, id_user]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleDeleteFuture = async (startDate, endDate) => {
        const confirm = await Swal.fire({
            title: "Hapus Jadwal?",
            text: "Jadwal yang akan datang ini akan dihapus dan tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
        });

        if (!confirm.isConfirmed) return;

        const toastId = toast.loading("Menghapus jadwal...");

        try {
            await fetchWithJwt(
                `${apiUrl}/jadwal/${id_user}?startDate=${startDate}&endDate=${endDate}`,
                { method: "DELETE" }
            );

            toast.success("Jadwal berhasil dihapus", { id: toastId });
            fetchDetail();
        } catch (err) {
            console.error(err);
            toast.error("Gagal menghapus jadwal", { id: toastId });
        }
    };


    /* GROUPING */
    const groupByDate = (list = []) => {
        if (!Array.isArray(list) || !list.length) return [];

        const grouped = {};
        list.forEach((item) => {
            const key = `${item.tgl_mulai}_${item.tgl_selesai}`;
            if (!grouped[key]) {
                grouped[key] = {
                    tgl_mulai: item.tgl_mulai,
                    tgl_selesai: item.tgl_selesai,
                    shift: item.shift,
                    lokasi: [],
                };
            }
            grouped[key].lokasi.push(item.lokasi);
        });

        return Object.values(grouped).sort(
            (a, b) => new Date(b.tgl_mulai) - new Date(a.tgl_mulai)
        );
    };

    const getGroupedCount = (list = []) => {
        return groupByDate(list).length;
    };


    /* CARD LIST */
    const renderGroupedList = (list) => {
        const grouped = groupByDate(list);
        if (!grouped.length) {
            return <EmptyState message="Tidak ada jadwal" />;
        }

        const isEditable = activeTab === "ongoing" || activeTab === "future";

        const statusConfig = {
            ongoing: {
                label: "Sedang Berjalan",
                color: "bg-green-500",
            },
            future: {
                label: "Akan Datang",
                color: "bg-blue-500",
            },
            history: {
                label: "Riwayat",
                color: "bg-gray-400",
            },
        };


        return (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {grouped.map((item, index) => (
                    <div key={index} className="px-5 py-4 border-b last:border-b-0 hover:bg-gray-50 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <span className={`mt-1 w-2.5 h-2.5 rounded-full ${statusConfig[activeTab].color}`} />

                                <div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {formatFullDate(item.tgl_mulai)} –{" "}
                                        {formatFullDate(item.tgl_selesai)}
                                    </div>

                                    <div className="mt-0.5 text-xs text-gray-600">
                                        Jadwal Shift : {" "}
                                        <span className="font-medium text-gray-800">
                                            {item.shift}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ACTION */}
                            {isEditable && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/penjadwalan/edit/${id_user}?startDate=${item.tgl_mulai}&endDate=${item.tgl_selesai}`
                                            )
                                        }
                                        className="px-3 py-1.5 text-xs font-medium rounded bg-yellow-500 text-white hover:bg-yellow-600"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                        Edit
                                    </button>

                                    {activeTab === "future" && (
                                        <button
                                            onClick={() =>
                                                handleDeleteFuture(
                                                    item.tgl_mulai,
                                                    item.tgl_selesai
                                                )
                                            }
                                            className="px-3 py-1.5 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Lokasi Penugasan
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {item.lokasi.map((lokasi, idx) => (
                                    <span key={idx} className="px-3 py-1 text-xs rounded-md border border-gray-200 text-gray-800">
                                        {lokasi}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message="Gagal memuat data" />;

    return (
        <div>
            <SectionHeader title="Detail Penjadwalan" subtitle="Kelola Penjadwalan Karyawan." onBack={() => navigate(-1)}
                actions={
                    <button onClick={() => navigate(`/penjadwalan/tambah-jadwal/${id_user}`)}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Tambah Jadwal
                    </button>
                }
            />

            <div className="mt-6 bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Informasi Karyawan
                </div>

                {/* NAMA */}
                <div className="mt-1 text-lg font-semibold text-gray-900">
                    {data?.nama}
                </div>

                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-700">
                        {data?.role}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>
                        {data?.perusahaan}
                    </span>
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex justify-center flex-1 gap-6">
                    <div className="flex flex-1 justify-center gap-8">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.key;

                            return (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`text-left pb-3 transition ${isActive ? "border-b-2 border-green-600" : "border-b-2 border-transparent hover:border-gray-300"}`}>
                                    <div className="flex items-center text-sm font-semibold">
                                        <span className={isActive ? "text-green-600" : "text-gray-700"}>
                                            {tab.label}
                                        </span>
                                        {tab.key === "future" && (
                                            <CountBadge count={getGroupedCount(data?.future)} color="bg-blue-100 text-blue-700" />
                                        )}
                                        {tab.key === "history" && (
                                            <CountBadge count={getGroupedCount(data?.history)} color="bg-gray-200 text-gray-700" />
                                        )}
                                    </div>

                                    <div className="text-xs text-gray-500 leading-tight">
                                        {tab.description}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="mt-6">
                {activeTab === "ongoing" &&
                    renderGroupedList(data?.ongoing)}

                {activeTab === "future" &&
                    renderGroupedList(data?.future)}

                {activeTab === "history" &&
                    renderGroupedList(data?.history)}
            </div>
        </div>
    );
};

export default DetailPenjadwalan;
