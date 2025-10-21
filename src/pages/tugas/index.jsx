import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MobileLayout from "../../layouts/mobileLayout";
import { FooterMainBar, LoadingSpinner, EmptyState, ErrorState,} from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatLongDate } from "../../utils/dateUtils";

const Tugas = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
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

    const urgentTasks = tasks.filter(
        (t) => t.category?.toLowerCase() === "urgent" && !t.finished_at
    );
    const dailyTasks = tasks.filter(
        (t) => t.category?.toLowerCase() === "daily" && !t.finished_at
    );
    const historyTasks = tasks.filter((t) => t.finished_at);

    const TaskCard = ({ t }) => {
        const urgent = t.category?.toLowerCase() === "urgent";
        const isFinished = !!t.finished_at;
        const cardColor = isFinished ? "border-gray-300 bg-gray-100 text-gray-500" : urgent ? "border-red-500/30 bg-red-50 text-red-700" : "border-emerald-500/30 bg-emerald-50 text-emerald-700";
        const iconColor = isFinished ? "text-gray-400" : urgent ? "text-red-500" : "text-emerald-500";
        const textColor = isFinished ? "text-gray-600" : urgent ? "text-red-700" : "text-emerald-700";

        return (
            <div onClick={() => navigate(`/tugas/${t.id}`)} className={`border ${cardColor} rounded-md p-2 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200`}>
                <div className="flex justify-between items-center gap-2 pb-2 border-b border-gray-200">
                    <h2 className={`font-semibold capitalize text-xs truncate ${textColor}`}>
                        {t.nama_tugas}
                    </h2>
                    <span className={`px-2 text-[10px] font-medium uppercase rounded-full bg-white border ${textColor}`}>
                        {t.category}
                    </span>
                </div>

                {/* === WAKTU === */}
                <div className="mt-1 text-[11px] text-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-medium text-gray-800">Mulai</p>
                            <p>{formatLongDate(t.start_date)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-medium text-gray-800">Deadline</p>
                            <p>{formatLongDate(t.deadline_at)}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <MobileLayout title="Daftar Tugas">
            <div className="space-y-3 mb-20">
                {loading ? (
                    <LoadingSpinner message="Memuat daftar tugas..." />
                ) : error ? (
                    <ErrorState message="Tidak dapat memuat tugas" detail="Terjadi gangguan jaringan atau server." onRetry={() => window.location.reload()}/>
                ) : tasks.length === 0 ? (
                    <EmptyState title="Belum Ada Tugas" description="Semua tugas Anda akan tampil di sini setelah diberikan oleh atasan."/>
                ) : (
                    <>
                        {urgentTasks.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-red-600 mb-2 pl-1">Tugas Darurat</h3>
                                <div className="space-y-3">
                                    {urgentTasks.map((t, i) => (
                                        <TaskCard key={i} t={t} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {dailyTasks.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-emerald-600 mb-2 pl-1">Tugas Harian</h3>
                                <div className="space-y-3">
                                    {dailyTasks.map((t, i) => (
                                        <TaskCard key={i} t={t} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {historyTasks.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 mb-2 pl-1">Riwayat</h3>
                                <div className="space-y-3">
                                    {historyTasks.map((t, i) => (
                                        <TaskCard key={i} t={t} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <FooterMainBar />
        </MobileLayout>
    );
};

export default Tugas;
