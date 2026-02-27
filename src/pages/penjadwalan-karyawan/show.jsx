import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbtack, faClock, faHistory, faEdit, faTrash, faPlus, faUser, faUserGroup, faBuilding } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

/* ================== TAB CONFIG ================== */
const TABS = [
    {
        key: "permanent",
        label: "Jadwal Permanent",
        icon: faThumbtack,
        tone: "green",
        title: "Jadwal Permanent",
        description: "Jadwal utama yang berlaku secara terus-menerus tanpa batas tanggal. Jadwal ini digunakan sebagai acuan apabila tidak terdapat jadwal lain yang sedang aktif.",
    },
    {
        key: "future",
        label: "Akan Datang",
        icon: faClock,
        tone: "yellow",
        title: "Jadwal Yang Akan Datang",
        description: "Jadwal yang telah dijadwalkan dan akan mulai berlaku pada tanggal tertentu. Selama belum aktif, jadwal ini masih dapat diubah atau dihapus.",
    },
    {
        key: "history",
        label: "Riwayat",
        icon: faHistory,
        tone: "gray",
        title: "Riwayat Jadwal",
        description: "Jadwal yang sudah selesai dan tidak lagi berlaku. Digunakan hanya untuk melihat data sebelumnya.",
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
    const [activeTab, setActiveTab] = useState("permanent");
    const [data, setData] = useState(null);

    const fetchDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const res = await fetchWithJwt(
                `${apiUrl}/jadwal/detail/${id_user}`
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json?.message);
            setData(json.data);
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


    const handleDelete = async ({ mode, startDate, endDate }) => {
        const isPermanent = mode === "permanent";
        const confirm = await Swal.fire({
            title: "Hapus Jadwal?",
            text: isPermanent
                ? "Jadwal tetap akan dihapus dan tidak dapat dikembalikan."
                : "Jadwal ini akan dihapus dan tidak dapat dikembalikan.",
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
            let url = `${apiUrl}/jadwal/${id_user}?mode=${mode}`;
            if (mode === "range") {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            await fetchWithJwt(url, { method: "DELETE" });
            toast.success("Jadwal berhasil dihapus", { id: toastId });
            fetchDetail();
        } catch (err) {
            console.error(err);
            toast.error("Gagal menghapus jadwal", { id: toastId });
        }
    };


    /* ================== HELPERS ================== */
    const groupByDate = (list = []) => {
        if (!Array.isArray(list)) return [];
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

    const getGroupedCount = (list = []) => groupByDate(list).length;

    const renderPermanentTab = () => {
        if (!data?.permanent?.length) {
            return <EmptyState message="Tidak ada jadwal tetap." />;
        }
        const hasOngoing = data?.ongoing?.length > 0;
        return renderScheduleCard({
            title: "Jadwal Permanent",
            subtitle: `Shift: ${data.permanent[0].shift}`,
            status: hasOngoing ? "Tidak Aktif" : "Aktif",
            statusClass: hasOngoing
                ? "bg-gray-100 text-gray-600"
                : "bg-green-100 text-green-700",
            lokasi: data.permanent.map(p => p.lokasi),
            onEdit: () =>
                navigate(`/penjadwalan/edit/${id_user}?mode=permanent`),
            onDelete: () => handleDelete({ mode: "permanent" }),
        });
    };


    const renderTabDescription = () => {
        const tab = TABS.find((t) => t.key === activeTab);
        if (!tab) return null;
        const toneMap = {
            green: "bg-green-50 border-green-200 text-green-800",
            blue: "bg-blue-50 border-blue-200 text-blue-800",
            yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
            gray: "bg-gray-50 border-gray-200 text-gray-800",
        };

        return (
            <div className={`mt-6 border rounded-xl px-5 py-4 flex gap-4 items-start ${toneMap[tab.tone]}`}>
                <div className="mt-0.5">
                    <FontAwesomeIcon icon={tab.icon} className="text-lg opacity-80" />
                </div>
                <div>
                    <div className="text-sm font-semibold">
                        {tab.title}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed opacity-90">
                        {tab.description}
                    </p>
                </div>
            </div>
        );
    };


    /* ================== RENDER RANGE ================== */
    const renderGroupedList = (list = []) => {
        const grouped = groupByDate(list);
        if (!grouped.length) {
            return <EmptyState message="Tidak ada jadwal" />;
        }
        const statusConfig = {
            future: {
                label: "Terjadwal",
                badge: "bg-blue-100 text-blue-700",
            },
            history: {
                label: "Selesai",
                badge: "bg-gray-100 text-gray-600",
            },
        };
        const status = statusConfig[activeTab];

        return (
            <div className="space-y-4">
                {grouped.map((item, index) =>
                    renderScheduleCard({
                        title: `${formatFullDate(item.tgl_mulai)} – ${formatFullDate(item.tgl_selesai)}`,
                        subtitle: `${item.shift}`,
                        status: status.label,
                        statusClass: status.badge,
                        lokasi: item.lokasi,
                        onEdit:
                            activeTab === "future"
                                ? () =>
                                    navigate(
                                        `/penjadwalan/edit/${id_user}?mode=range&startDate=${item.tgl_mulai}&endDate=${item.tgl_selesai}`
                                    )
                                : null,
                        onDelete:
                            activeTab === "future"
                                ? () =>
                                    handleDelete({
                                        mode: "range",
                                        startDate: item.tgl_mulai,
                                        endDate: item.tgl_selesai,
                                    })
                                : null,
                    })
                )}
            </div>
        );
    };


    const handleEditCurrentSchedule = () => {
        if (!currentSchedule) return;
        if (currentSchedule.type === "permanent") {
            navigate(`/penjadwalan/edit/${id_user}?mode=permanent`);
        } else {
            navigate(`/penjadwalan/edit/${id_user}?mode=range&startDate=${currentSchedule.tgl_mulai}&endDate=${currentSchedule.tgl_selesai}`);
        }
    };

    /* ================== DERIVED DATA ================== */
    const currentRange = Array.isArray(data?.ongoing) && data.ongoing.length ? groupByDate(data.ongoing)[0] : null;

    const currentPermanent =
        !currentRange &&
            Array.isArray(data?.permanent) &&
            data.permanent.length
            ? {
                type: "permanent",
                shift: data.permanent[0].shift,
                lokasi: data.permanent.map(p => p.lokasi),
                tgl_mulai: null,
                tgl_selesai: null,
            }
            : null;

    const currentSchedule = currentRange
        ? { ...currentRange, type: "range" }
        : currentPermanent;

    const scheduleType = currentSchedule?.type === "range" ? "Rentang Tanggal" : currentSchedule?.type === "permanent" ? "Jadwal Permanent" : "-";

    const visibleTabs = TABS.filter((tab) => {
        if (tab.key === "permanent") {
            return Array.isArray(data?.permanent) && data.permanent.length > 0;
        }
        return true;
    });

    useEffect(() => {
        if (loading) return;
        if (!visibleTabs.find((t) => t.key === activeTab)) {
            setActiveTab(visibleTabs[0]?.key || "");
        }
    }, [visibleTabs, activeTab, loading]);


    /* ================== STATE ================== */
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message="Gagal memuat data" />;


    const renderScheduleCard = ({ title, subtitle, status, statusClass, lokasi = [], onEdit, onDelete, }) => (
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-800">
                        {title}
                    </div>
                    {subtitle && (
                        <div>
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Shift
                            </div>
                            <div className="mt-0.5 text-sm font-semibold text-gray-900">
                                {subtitle}
                            </div>
                        </div>
                    )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                    {status}
                </span>
            </div>
            <div className="border-t border-gray-100" />
            <div>
                <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                    Lokasi Penugasan
                </div>
                <div className="flex flex-wrap gap-2">
                    {lokasi.map((lok, idx) => (
                        <span key={idx} className="inline-flex items-start gap-2 px-3 py-1.5 rounded-md text-xs border border-gray-200 text-gray-700">
                            {lok}
                        </span>
                    ))}
                </div>
            </div>

            {/* ACTION */}
            {(onEdit || onDelete) && (
                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                    {onEdit && (
                        <button onClick={onEdit} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md bg-yellow-500 text-white hover:bg-yellow-600">
                            <FontAwesomeIcon icon={faEdit} />
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={onDelete} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200">
                            <FontAwesomeIcon icon={faTrash} />
                            Hapus
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="mb-20">
            <SectionHeader title="Detail Penjadwalan" subtitle="Kelola Penjadwalan Karyawan" onBack={() => navigate(-1)}
                actions={
                    <button onClick={() => navigate(`/penjadwalan/tambah-jadwal/${id_user}`)} className="px-4 py-2 bg-green-600 text-white rounded-md">
                        <FontAwesomeIcon icon={faPlus} /> Tambah Jadwal
                    </button>
                }
            />

            <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 px-6 py-5">
                    <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-sm">
                        <FontAwesomeIcon icon={faUser} className="text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-lg font-semibold text-gray-900 truncate">
                            {data?.nama}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faUserGroup} className="text-gray-400" />
                                {data?.role}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
                                {data?.perusahaan}
                            </span>
                        </div>
                    </div>
                </div>

                {currentSchedule && (
                    <div className="px-6 py-1.5 bg-green-600">
                        <h2 className="text-xs font-semibold text-white tracking-wide">
                            JADWAL YANG SEDANG BERJALAN
                        </h2>
                    </div>
                )}

                {!currentSchedule && (
                    <>
                        <div className="px-6 py-1.5 bg-gray-200">
                            <h2 className="text-xs font-semibold text-gray-700 tracking-wide">
                                JADWAL YANG SEDANG BERJALAN
                            </h2>
                        </div>

                        <div className="px-6 py-8 bg-gray-50 border-t border-gray-200">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <FontAwesomeIcon icon={faClock} className="text-lg" />
                                </div>
                                <div className="text-sm font-semibold text-gray-700">
                                    Tidak Ada Jadwal yang Sedang Berjalan
                                </div>
                                <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                                    Saat ini karyawan belum memiliki jadwal aktif.
                                    Jadwal permanent akan digunakan apabila tidak ada jadwal rentang tanggal yang aktif.
                                </p>
                                <button onClick={() => navigate(`/penjadwalan/tambah-jadwal/${id_user}`)} className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700">
                                    <FontAwesomeIcon icon={faPlus} />
                                    Tambah Jadwal
                                </button>
                            </div>
                        </div>
                    </>
                )}


                {currentSchedule && (
                    <div className="px-6 py-5 bg-green-50/40 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="flex gap-4">
                                <div className="w-9 h-9 rounded-lg bg-white border border-green-100 flex items-center justify-center text-green-600">
                                    <FontAwesomeIcon icon={faClock} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                        Periode
                                    </div>
                                    <div className="mt-0.5 text-sm font-semibold text-gray-900 leading-snug">
                                        {currentSchedule.type === "range" ? (
                                            <>
                                                {formatFullDate(currentSchedule.tgl_mulai)} –{" "}
                                                {formatFullDate(currentSchedule.tgl_selesai)}
                                            </>
                                        ) : (
                                            <span className="text-gray-700">∞ (Tanpa Batas)</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-9 h-9 rounded-lg bg-white border border-green-100 flex items-center justify-center text-green-600">
                                    <FontAwesomeIcon icon={faHistory} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                        Shift
                                    </div>
                                    <div className="mt-0.5 text-sm font-semibold text-gray-900">
                                        {currentSchedule.shift}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-9 h-9 rounded-lg bg-white border border-green-100 flex items-center justify-center text-green-600">
                                    <FontAwesomeIcon icon={faThumbtack} />
                                </div>
                                <div>
                                    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                        Tipe Penjadwalan
                                    </div>
                                    <div className="mt-0.5 text-sm font-semibold text-gray-900">
                                        {scheduleType}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-9 h-9 rounded-lg bg-white border border-green-100 flex items-center justify-center text-green-600 mt-0.5">
                                <FontAwesomeIcon icon={faBuilding} />
                            </div>
                            <div className="flex-1">
                                <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Lokasi Penugasan
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentSchedule.lokasi.map((lok, idx) => (
                                        <span key={idx} className="px-2 py-1 text-[11px] rounded-md bg-white font-medium border border-green-100 text-gray-800">
                                            {lok}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-green-100 flex justify-end">
                            <button onClick={handleEditCurrentSchedule} className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md bg-yellow-500 text-white hover:bg-yellow-600">
                                <FontAwesomeIcon icon={faEdit} />
                                Edit Jadwal
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-center">
                <div className="flex gap-10">
                    {visibleTabs.map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`pb-2 text-sm font-semibold transition ${activeTab === tab.key ? "border-b-2 border-green-600 text-green-600" : "text-gray-600 hover:text-gray-800"}`}>
                            <div className="flex items-center gap-1">
                                {tab.label}
                                {tab.key === "future" && (
                                    <CountBadge count={getGroupedCount(data?.future)} color="bg-blue-100 text-blue-700" />
                                )}
                                {tab.key === "history" && (
                                    <CountBadge count={getGroupedCount(data?.history)} color="bg-gray-200 text-gray-700" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {renderTabDescription()}
            <div className="mt-6">
                {activeTab === "permanent" && renderPermanentTab()}
                {activeTab === "future" && renderGroupedList(data?.future)}
                {activeTab === "history" && renderGroupedList(data?.history)}
            </div>
        </div>
    );
};

export default DetailPenjadwalan;
