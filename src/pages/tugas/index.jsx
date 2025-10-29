import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    FooterMainBar,
    LoadingSpinner,
    EmptyState,
    ErrorState,
} from "../../components";
import MobileLayout from "../../layouts/mobileLayout";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatLongDate } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarAlt,
    faCircleCheck,
    faFlag,
    faClipboardList,
    faClock,
} from "@fortawesome/free-solid-svg-icons";

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

    // === Filter Berdasarkan Tab ===
    const filteredTasks = tasks.filter((t) => {
        const category = t.category?.toLowerCase();
        const finished = !!t.finished_at;

        if (activeTab === "urgent") return category === "urgent" && !finished;
        if (activeTab === "daily") return category === "daily" && !finished;
        if (activeTab === "history") return finished;
        if (activeTab === "all") return !finished && (category === "urgent" || category === "daily");
        return true;
    });

    const TaskCard = ({ t, navigate }) => {
        const isFinished = !!t.finished_at;
        const urgent = t.category?.toLowerCase() === "urgent";

        // === Warna dan Kontras ===
        const cardStyle = isFinished
            ? "border-gray-200 bg-gray-50"
            : urgent
                ? "border-red-400 bg-gradient-to-br from-red-50 to-red-100/50"
                : "border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-100/50";

        const accentColor = isFinished
            ? "text-gray-400"
            : urgent
                ? "text-red-600"
                : "text-emerald-600";

        const categoryLabel = isFinished
            ? "Tugas Selesai"
            : urgent
                ? "Tugas Darurat"
                : "Tugas Harian";

        return (
            <div onClick={() => navigate(`/tugas/${t.id}`)} className={`border ${cardStyle} rounded-md p-3 sm:p-3.5 shadow-sm cursor-pointer 
            hover:shadow-md hover:-translate-y-[2px] active:scale-[0.99] transition-all duration-200`}
            >
                {/* === Header === */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-xs text-gray-900 leading-tight truncate uppercase">
                            {t.nama_tugas}
                        </h2>

                        <div className="flex items-center gap-1 mt-1">
                            <FontAwesomeIcon icon={urgent ? faFlag : isFinished ? faCircleCheck : faClipboardList} className={`text-[10px] ${accentColor}`} />
                            <span className={`text-[11.5px] font-semibold uppercase ${accentColor}`}>
                                {categoryLabel}
                            </span>
                        </div>
                    </div>

                    <span
                        className={`text-[10.5px] px-2 py-0.5 rounded border font-medium tracking-wide whitespace-nowrap
                    ${isFinished
                                ? "border-gray-300 text-gray-600 bg-gray-100"
                                : urgent
                                    ? "border-red-400 text-red-700 bg-red-50"
                                    : "border-emerald-400 text-emerald-700 bg-emerald-50"}`}
                    >
                        {t.category}
                    </span>
                </div>

                {/* === Detail Info === */}
                <div className="text-[12px] text-gray-700 leading-relaxed space-y-1.5 mt-1">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-[11px] text-gray-400" />
                        <span>
                            <span className="font-semibold text-gray-900">Mulai:</span>{" "}
                            {formatLongDate(t.start_date)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-[11px] text-gray-400" />
                        <span>
                            <span className="font-semibold text-gray-900">Tenggat:</span>{" "}
                            {formatLongDate(t.deadline_at)}
                        </span>
                    </div>

                    {isFinished && (
                        <div className="border-t border-gray-200 pt-2 mt-2">
                            <p className="text-[11.5px] text-gray-600 italic flex items-center gap-1.5">
                                <FontAwesomeIcon
                                    icon={faCircleCheck}
                                    className="text-emerald-500 text-[10px]"
                                />
                                <span>
                                    <span className="font-medium text-gray-800">Selesai pada:</span>{" "}
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
            {/* === Sticky Tabs === */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="flex justify-between gap-2 px-3 py-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 text-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
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

            {/* === Kontainer Scroll === */}
            <div className="overflow-y-auto pb-24 pt-3 space-y-2" style={{ maxHeight: "calc(100vh - 120px)" }}>
                {loading ? (
                    <LoadingSpinner message="Memuat daftar tugas..." />
                ) : error ? (
                    <ErrorState
                        message="Tidak dapat memuat tugas"
                        detail="Terjadi gangguan jaringan atau server."
                        onRetry={() => window.location.reload()}
                    />
                ) : tasks.length === 0 ? (
                    <EmptyState
                        title="Belum Ada Tugas"
                        description="Semua tugas Anda akan tampil di sini setelah diberikan oleh atasan."
                    />
                ) : filteredTasks.length === 0 ? (
                    <p className="text-center text-xs text-gray-500 italic mt-5">
                        Tidak ada tugas pada kategori ini.
                    </p>
                ) : (
                    filteredTasks.map((t, i) => <TaskCard key={i} t={t} navigate={navigate} />)
                )}
            </div>

            <FooterMainBar />
        </MobileLayout>
    );
};

export default Tugas;
