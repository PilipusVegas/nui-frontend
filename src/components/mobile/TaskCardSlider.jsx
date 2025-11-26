import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatLongDate } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const TaskCardSlider = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/tugas/user`);
                if (!res.ok) throw new Error("Failed to fetch tasks");
                const data = await res.json();
                if (data.success) {
                    const filtered = data.data
                        .filter((t) =>
                            t.is_paused !== 1 &&
                            t.status_tugas !== 1 &&
                            !(t.status_tugas === 0 && t.finished_at) // pending → hide
                        )
                        .sort((a, b) => {
                            // 1️⃣ Prioritaskan yang ditolak (perlu revisi)
                            if (a.status_tugas === 2 && b.status_tugas !== 2) return -1;
                            if (a.status_tugas !== 2 && b.status_tugas === 2) return 1;

                            // 2️⃣ Urutkan berdasarkan kategori urgent setelah itu
                            if (a.category === "urgent" && b.category !== "urgent") return -1;
                            if (a.category !== "urgent" && b.category === "urgent") return 1;

                            return 0;
                        });
                    setTasks(filtered);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [apiUrl]);

    const activeTasks = tasks.filter((t) => t.status_tugas === 0 || t.status_tugas === 2);

    const handleScroll = () => {
        if (!sliderRef.current) return;
        const scrollLeft = sliderRef.current.scrollLeft;
        const cardWidth = sliderRef.current.firstChild.offsetWidth + 12;
        const index = Math.round(scrollLeft / cardWidth);
        setActiveIndex(index);
    };

    const scrollToIndex = (index) => {
        if (!sliderRef.current) return;
        const cardWidth = sliderRef.current.firstChild.offsetWidth + 12;
        sliderRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading tugas...</div>;
    if (!tasks.length) return null;

    const getStatusLabel = (task) => {
        if (task.is_paused === 1) return "Ditunda";
        if (task.status_tugas === 2) return "Ditolak";
        if (task.status_tugas === 0 && task.finished_at) return "Pending";
        if (task.status_tugas === 0 && !task.finished_at) return "Belum Selesai";
        return "";
    };

    const getStatusColor = (task) => {
        if (task.is_paused === 1) return "bg-blue-100 text-blue-800"; // ✅ warna khusus Ditunda
        if (task.status_tugas === 2) return "bg-red-100 text-red-800";
        if (task.status_tugas === 0 && task.finished_at) return "bg-yellow-100 text-yellow-800";
        if (task.status_tugas === 0 && !task.finished_at) return "bg-gray-100 text-gray-800";
        return "";
    };

    const getDaysLeft = (deadline) => {
        const now = new Date();
        const end = new Date(deadline);
        const diff = end - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days <= 0 ? "Lewat Tenggat" : `${days} hari lagi`;
    };



    return (
        <div className="px-4 mt-4">
            {/* Header sejajar */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Penugasan</h3>
                <button onClick={() => navigate("/tugas")} className="flex items-center gap-1 text-[13px] font-medium text-green-600 hover:text-green-700 hover:underline transition-all">
                    <span>Lihat Semua</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </button>
            </div>

            {/* Slider */}
            <div className="relative">
                <div ref={sliderRef} onScroll={handleScroll} className="flex space-x-3 overflow-x-auto scrollbar-hide py-2 scroll-smooth snap-x snap-mandatory">
                    {tasks.map((task) => (
                        <div key={task.id} className="relative">

                            {/* Card utama ramping */}
                            <div onClick={() => navigate(`/tugas/${task.id}`)}
                                className="w-[210px] bg-white rounded-lg border border-gray-200 shadow-sm p-2.5 
            cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col gap-1.5 relative"
                            >

                                {/* Kategori + Status */}
                                <div className="flex justify-between items-center">
                                    <span className={`text-[9px] font-semibold px-1.5 py-[1px] rounded
                        ${task.category === 'urgent'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-green-600 text-white'}`}
                                    >
                                        {task.category.toUpperCase()}
                                    </span>

                                    <span className={`text-[9px] px-1.5 py-[1px] rounded ${getStatusColor(task)}`}>
                                        {getStatusLabel(task)}
                                    </span>
                                </div>

                                {/* Judul */}
                                <h4 className="text-[11px] font-semibold text-gray-800 leading-snug line-clamp-1">
                                    {task.nama_tugas}
                                </h4>

                                {/* Deadline + Badge Revisi sejajar */}
                                <div className="flex justify-between items-center">

                                    {/* Countdown */}
                                    <p className="text-[10px] font-bold text-red-600">
                                        {getDaysLeft(task.deadline_at)}
                                    </p>

                                    {/* Badge Revisi (lebih terbaca) */}
                                    {task.status_tugas === 2 && (
                                        <span className="bg-red-500 text-white text-[9px] px-2 py-[1.5px] rounded-full shadow-sm font-medium">
                                            Perlu Revisi !
                                        </span>
                                    )}
                                </div>

                                {/* Tanggal */}
                                <div className="text-[9.5px] text-gray-700 leading-tight space-y-[1px]">
                                    <p><span className="font-semibold">Mulai:</span> {formatLongDate(task.start_date)}</p>
                                    <p><span className="font-semibold">Deadline:</span> {formatLongDate(task.deadline_at)}</p>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

                {/* Slider indikator */}
                <div className="flex justify-center mt-2 space-x-1.5">
                    {tasks.map((_, idx) => (
                        <button key={idx} onClick={() => scrollToIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? "bg-green-500" : "bg-gray-300"}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskCardSlider;
