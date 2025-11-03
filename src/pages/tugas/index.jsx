import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FooterMainBar, LoadingSpinner, EmptyState, ErrorState } from "../../components";
import MobileLayout from "../../layouts/mobileLayout";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatLongDate } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCircleCheck, faClipboardList, faClock } from "@fortawesome/free-solid-svg-icons";

const Tugas = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/tugas/user`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setTasks(data?.data || []);
            } catch {
                setError(true);
                toast.error("Gagal memuat data tugas");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [apiUrl]);

    const getDeadlineStatus = (deadline_at, finished_at = null) => {
        if (!deadline_at) return "-";
        const deadline = new Date(deadline_at);
        const now = finished_at ? new Date(finished_at) : new Date();
        const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `Terlambat ${Math.abs(diff)} hari`;
        if (diff === 0) return "Tenggat hari ini";
        return `Sisa ${diff} hari lagi`;
    };

    const filteredTasks = tasks.filter((t) => {
        const category = t.category?.toLowerCase();
        const isFinished = !!t.finished_at;
        const approval = t.status_persetujuan;
        if (activeTab === "urgent")
            return category === "urgent" && t.status_tugas !== 1;

        if (activeTab === "daily")
            return category === "daily" && t.status_tugas !== 1;

        if (activeTab === "history")
            return t.status_tugas === 1;


        if (activeTab === "all") {
            const isPending = isFinished && approval === 0;
            const isRevision = t.status_tugas === 2;
            return (
                (category === "urgent" || category === "daily") &&
                (!isFinished || isPending || isRevision)
            );
        }
        return true;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.status_tugas === 2 && b.status_tugas !== 2) return -1;
        if (a.status_tugas !== 2 && b.status_tugas === 2) return 1;

        const aPending = a.finished_at && a.status_persetujuan === 0;
        const bPending = b.finished_at && b.status_persetujuan === 0;
        if (aPending && !bPending) return 1;
        if (!aPending && bPending) return -1;

        if (a.category === "urgent" && b.category !== "urgent") return -1;
        if (a.category !== "urgent" && b.category === "urgent") return 1;

        const aDeadline = new Date(a.deadline_at);
        const bDeadline = new Date(b.deadline_at);
        return aDeadline - bDeadline;
    });



    const TaskCard = ({ t }) => {
        const isUrgent = t.category?.toLowerCase() === "urgent";
        const isDaily = t.category?.toLowerCase() === "daily";
        const isHistory = activeTab === "history";

        let borderColor = "";
        let textColor = "";
        let iconUsed = faClipboardList;
        let iconColor = "";
        let statusLabel = "";

        if (isHistory) {
            borderColor = "border-gray-300";
            textColor = "text-gray-500";
            iconColor = "text-gray-400";
            statusLabel = "Tugas Selesai";
        }
        else if (t.finished_at && t.status_tugas === 0) {
            borderColor = "border-amber-400";
            textColor = "text-amber-600";
            iconColor = "text-amber-500";
            statusLabel = "Menunggu Persetujuan";
        }
        else if (t.finished_at && t.status_tugas === 2) {
            borderColor = "border-rose-500";
            textColor = "text-rose-600";
            iconColor = "text-rose-500";
            statusLabel = isUrgent
                ? "Pengajuan Ditolak, Revisi Segera !"
                : "Pengajuan Ditolak, Revisi Segera !";
        }
        else if (t.finished_at && t.status_tugas === 1) {
            borderColor = "border-emerald-400";
            textColor = "text-emerald-600";
            iconColor = "text-emerald-500";
            statusLabel = "Selesai";
        }
        else if (isUrgent) {
            borderColor = "border-rose-400";
            textColor = "text-rose-600";
            iconColor = "text-rose-500";
            statusLabel = "Prioritas Utama";
        }
        else if (isDaily) {
            borderColor = "border-emerald-400";
            textColor = "text-emerald-600";
            iconColor = "text-emerald-500";
            statusLabel = "Pekerjaan Harian";
        }
        else {
            borderColor = "border-blue-400";
            textColor = "text-blue-600";
            iconColor = "text-blue-500";
            statusLabel = "Sedang Dikerjakan";
        }


        const categoryColor = isUrgent ? "border-rose-400 text-rose-600" : isDaily ? "border-emerald-400 text-emerald-600" : "border-gray-300 text-gray-500";
        const deadlineInfo = getDeadlineStatus(t.deadline_at);

        return (
            <div onClick={() => navigate(`/tugas/${t.id}`)} className={`border ${borderColor} rounded-lg p-2.5 shadow-sm bg-white cursor-pointer  transition-all duration-200 hover:shadow-md hover:-translate-y-[2px] active:scale-[0.99]`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-1.5">
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-[9.5px] text-gray-900 leading-tight truncate uppercase">
                            {t.nama_tugas}
                        </h2>
                        <div className="flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={iconUsed} className={`text-[9px] ${iconColor}`} />
                            <span className={`text-[9px] font-semibold uppercase ${textColor}`}>
                                {statusLabel}
                            </span>
                        </div>
                    </div>

                    <span
                        className={`text-[8.5px] px-1.5 py-0.5 rounded-full border font-medium tracking-wide whitespace-nowrap ${categoryColor}`}
                    >
                        {t.category}
                    </span>
                </div>

                {/* Info Detail */}
                <div className="text-[9px] text-gray-700 space-y-1 mt-1">
                    <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faClock} className="text-[8px] text-blue-400" />
                        <span>
                            <span className="font-medium text-gray-800">Mulai:</span>{" "}
                            {formatLongDate(t.start_date)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px] text-emerald-400" />
                        <span>
                            <span className="font-medium text-gray-800">Tenggat:</span> {formatLongDate(t.deadline_at)}{" "}
                            {activeTab !== "history" && (
                                <span
                                    className={`ml-1 text-[10px] font-medium ${deadlineInfo.includes("Terlambat")
                                        ? "text-rose-600"
                                        : deadlineInfo.includes("hari ini")
                                            ? "text-amber-600"
                                            : "text-emerald-600"
                                        }`}
                                >
                                    ({deadlineInfo})
                                </span>
                            )}
                        </span>
                    </div>


                    {t.finished_at && (
                        <div className="border-t border-gray-200 pt-1.5 mt-1.5">
                            <p className="text-[8.5px] text-gray-600 italic flex items-center gap-1">
                                <FontAwesomeIcon
                                    icon={faCircleCheck}
                                    className="text-emerald-500 text-[8px]"
                                />
                                <span>
                                    <span className="font-medium text-gray-800">Selesai:</span>{" "}
                                    {formatLongDate(t.finished_at)}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const tabs = [
        { key: "all", label: "Semua" },
        { key: "urgent", label: "Darurat" },
        { key: "daily", label: "Harian" },
        { key: "history", label: "Riwayat" },
    ];

    return (
        <MobileLayout title="Daftar Tugas">
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="flex justify-between gap-2 px-3 py-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 text-center px-3 py-1.5 rounded-full text-[9.5px] font-medium transition-all duration-200
                                    ${isActive
                                        ? "bg-green-500 text-white shadow-sm scale-[1.03]"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div
                className="overflow-y-auto pb-24 pt-3 space-y-2"
                style={{ maxHeight: "calc(100vh - 120px)" }}
            >
                {loading ? (
                    <LoadingSpinner message="Memuat daftar tugas..." />
                ) : error ? (
                    <ErrorState
                        message="Tidak dapat memuat tugas"
                        detail="Terjadi gangguan jaringan atau server."
                        onRetry={() => window.location.reload()}
                    />
                ) : tasks.length === 0 ? (
                    <EmptyState title="Belum Ada Tugas" description="Semua tugas Anda akan tampil di sini setelah diberikan oleh atasan." />
                ) : sortedTasks.length === 0 ? (
                    <p className="text-center text-[9px] text-gray-500 italic mt-5">
                        Tidak ada tugas pada kategori ini.
                    </p>
                ) : (
                    sortedTasks.map((t, i) => <TaskCard key={i} t={t} />)
                )}
            </div>

            <FooterMainBar />
        </MobileLayout>
    );
};

export default Tugas;
