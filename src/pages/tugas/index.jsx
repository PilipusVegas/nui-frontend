import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FooterMainBar, LoadingSpinner, EmptyState, ErrorState } from "../../components";
import MobileLayout from "../../layouts/mobileLayout";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatLongDate } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faClipboardList, faClock, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

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

    const getStatusLabel = (task) => {
        if (task.is_paused === 1) return "Ditunda";
        if (task.status_tugas === 2) return "Ditolak, Revisi Segera !";
        if (task.status_tugas === 0 && task.finished_at) return "Menunggu Verifikasi";
        if (task.status_tugas === 0 && !task.finished_at) return "Belum Selesai";
        return "Selesai";
    };

    const getStatusColor = (task) => {
        if (task.is_paused === 1) return "bg-blue-100 text-blue-700";
        if (task.status_tugas === 2) return "bg-red-100 text-red-700";
        if (task.status_tugas === 0 && task.finished_at) return "bg-yellow-100 text-yellow-700";
        if (task.status_tugas === 0 && !task.finished_at) return "bg-gray-100 text-gray-700";
        return "bg-green-100 text-green-700";
    };

    const getCategoryColor = (category) => {
        const c = category?.toLowerCase();
        if (c === "urgent") return "bg-red-600 text-white";
        if (c === "daily") return "bg-green-600 text-white";
        return "bg-gray-600 text-white";
    };

    const filteredTasks = tasks.filter((t) => {
        const category = t.category?.toLowerCase();
        const isFinished = !!t.finished_at;
        const approval = t.status_persetujuan;

        if (activeTab === "urgent") return category === "urgent" && t.status_tugas !== 1;
        if (activeTab === "daily") return category === "daily" && t.status_tugas !== 1;
        if (activeTab === "history") return t.status_tugas === 1;

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
        const aDeadline = new Date(a.deadline_at);
        const bDeadline = new Date(b.deadline_at);
        return aDeadline - bDeadline;
    });

    const TaskCard = ({ t }) => {
        const deadlineInfo = getDeadlineStatus(t.deadline_at);

        return (
            <div
                onClick={() => navigate(`/tugas/${t.id}`)}
                className="
                bg-white border border-gray-200 rounded-xl p-4
                shadow-sm hover:shadow-md 
                transition-all duration-200 
                active:scale-[0.97] cursor-pointer
            "
            >
                {/* Header: Category & Status */}
                <div className="flex justify-between items-start mb-3">
                    {/* Category */}
                    <span
                        className={`
                        text-[11px] px-2 py-[4px] rounded-md font-semibold 
                        uppercase tracking-wide
                        ${getCategoryColor(t.category)}
                    `}
                    >
                        {t.category}
                    </span>

                    {/* Status */}
                    <span
                        className={`
                        text-[11px] px-2 py-[4px] rounded-md font-semibold 
                        uppercase flex items-center gap-1.5
                        ${getStatusColor(t)}
                    `}
                    >
                        <FontAwesomeIcon icon={faClipboardList} className="text-[10px]" />
                        {getStatusLabel(t)}
                    </span>
                </div>

                {/* Title */}
                <h2 className="font-semibold text-[14px] text-gray-900 leading-snug mb-2 line-clamp-2">
                    {t.nama_tugas}
                </h2>

                {/* Deadline */}
                {t.status_tugas !== 1 && (
                    <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-[12px] text-green-600" />
                        <span className="text-[12px] text-gray-700">
                            <span className="font-medium text-gray-900">Tenggat:</span> {formatLongDate(t.deadline_at)}
                            <span
                                className={`
                                ml-1 font-semibold
                                ${deadlineInfo.includes("Terlambat")
                                        ? "text-red-600"
                                        : deadlineInfo.includes("hari ini")
                                            ? "text-amber-600"
                                            : "text-green-600"
                                    }
                            `}
                            >
                                ({deadlineInfo})
                            </span>
                        </span>
                    </div>
                )}

                {/* Body Info */}
                <div className="text-[12px] text-gray-700 space-y-2">

                    {/* Start Date */}
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-[12px] text-green-500" />
                        <span>
                            <span className="font-medium text-gray-900">Mulai:</span> {formatLongDate(t.start_date)}
                        </span>
                    </div>

                    {/* Finish */}
                    {t.finished_at && (
                        <div className="flex items-center gap-2 text-gray-600 italic">
                            <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-[12px]" />
                            <span className="not-italic">
                                <span className="font-medium text-gray-900">Selesai:</span>{" "}
                                {formatLongDate(t.finished_at)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };


    const countAll = tasks.filter((t) => {
        const category = t.category?.toLowerCase();
        const isFinished = !!t.finished_at;
        const isPending = isFinished && t.status_persetujuan === 0;
        const isRevision = t.status_tugas === 2;

        return (
            (category === "urgent" || category === "daily") &&
            (!isFinished || isPending || isRevision)
        );
    }).length;

    const countUrgent = tasks.filter((t) => t.category?.toLowerCase() === "urgent" && t.status_tugas !== 1).length;
    const countDaily = tasks.filter((t) => t.category?.toLowerCase() === "daily" && t.status_tugas !== 1).length;


    return (
        <MobileLayout title="Daftar Tugas">
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
                <div className="flex justify-between px-3 py-1.5">

                    {/* Semua */}
                    <button onClick={() => setActiveTab("all")} className="flex-1 flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[13px] font-semibold transition-colors ${activeTab === "all" ? "text-green-600" : "text-gray-600"}`}>
                                Semua
                            </span>

                            {countAll > 0 && (
                                <span className={`text-[8.5px] font-semibold px-2 py-[2px] rounded-md min-w-min transition-all whitespace-nowrap
                                    ${activeTab === "all" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
                                >
                                    {countAll}
                                </span>
                            )}

                        </div>

                        <div className={`h-[2px] mt-1 rounded-full transition-all duration-200 w-10
                            ${activeTab === "all" ? "bg-green-600" : "bg-transparent"}`}
                        ></div>
                    </button>

                    {/* Urgent */}
                    <button onClick={() => setActiveTab("urgent")} className="flex-1 flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[13px] font-semibold transition-colors
                                ${activeTab === "urgent" ? "text-red-600" : "text-gray-600"}`}
                            >
                                Urgent
                            </span>

                            {countUrgent > 0 && (
                                <span className={`text-[8.5px] font-semibold px-2 py-[2px] rounded-md min-w-min transition-all whitespace-nowrap
                                    ${activeTab === "urgent" ? "bg-red-50 text-red-600 border border-red-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
                                >
                                    {countUrgent}
                                </span>
                            )}

                        </div>

                        <div className={`h-[2px] mt-1 rounded-full transition-all duration-200 w-10
                            ${activeTab === "urgent" ? "bg-red-500" : "bg-transparent"}`}
                        ></div>
                    </button>

                    {/* Daily */}
                    <button onClick={() => setActiveTab("daily")} className="flex-1 flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[13px] font-semibold transition-colors
                                ${activeTab === "daily" ? "text-green-700" : "text-gray-600"}`}
                            >
                                Daily
                            </span>

                            {countDaily > 0 && (
                                <span className={`text-[8.5px] font-semibold px-2 py-[2px] rounded-md min-w-min transition-all whitespace-nowrap
                                    ${activeTab === "daily" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
                                >
                                    {countDaily}
                                </span>
                            )}

                        </div>

                        <div className={`h-[2px] mt-1 rounded-full transition-all duration-200 w-10 ${activeTab === "daily" ? "bg-green-700" : "bg-transparent"}`}></div>
                    </button>

                    {/* Riwayat */}
                    <button onClick={() => setActiveTab("history")} className="flex-1 flex flex-col items-center">
                        <span className={`text-[13px] font-semibold transition-colors
                            ${activeTab === "history" ? "text-gray-800" : "text-gray-600"}`}
                        >
                            Riwayat
                        </span>

                        <div className={`h-[2px] mt-1 rounded-full transition-all duration-200 w-10
                            ${activeTab === "history" ? "bg-gray-800" : "bg-transparent"}`}
                        ></div>
                    </button>

                </div>
            </div>


            {/* Daftar Tugas */}
            <div className="overflow-y-auto scrollbar-none pb-24 pt-3 space-y-2" style={{ maxHeight: "calc(100vh - 120px)" }}>
                {loading ? (
                    <LoadingSpinner message="Memuat daftar tugas..." />
                ) : error ? (
                    <ErrorState message="Tidak dapat memuat tugas" detail="Terjadi gangguan jaringan atau server." onRetry={() => window.location.reload()} />
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
