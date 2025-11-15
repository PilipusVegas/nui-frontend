import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatLongDate } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

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
                        .filter((t) => t.status_tugas === 0 || t.status_tugas === 2)
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


    return (
        <div className="px-4 mt-4">
            {/* Header sejajar */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Penugasan</h3>
                <button onClick={() => navigate("/tugas")} className="flex items-center gap-1 text-[13px] font-medium text-green-600 hover:text-green-700 transition-all">
                    <span>Lihat Semua</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </button>
            </div>

            {/* Slider */}
            <div className="relative">
                <div ref={sliderRef} onScroll={handleScroll} className="flex space-x-3 overflow-x-auto scrollbar-hide py-2 scroll-smooth snap-x snap-mandatory">
                    {tasks.map((task) => (
                        <div key={task.id} onClick={() => navigate(`/tugas/${task.id}`)} className="min-w-[250px] max-w-[250px] bg-white rounded-xl shadow-sm p-3 border cursor-pointer hover:shadow-md hover:ring-1 hover:ring-green-300 transition-all duration-300 flex-shrink-0 flex flex-col justify-between border-gray-200 snap-start">
                            {/* Badge & Status */}
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${task.category === "urgent" ? "bg-red-500 text-white animate-pulse" : "bg-green-500 text-white"}`}>
                                    {task.category.toUpperCase()}
                                </span>
                                <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${getStatusColor(task)}`}>
                                    {getStatusLabel(task)}
                                </span>
                            </div>

                            {/* Judul satu baris */}
                            <h4 className="text-[13px] font-semibold text-gray-700 truncate mb-1">
                                {task.nama_tugas}
                            </h4>

                            {/* Info tanggal */}
                            <div className="text-[11px] text-gray-600 flex flex-col gap-0.5">
                                <div>
                                    <span className="font-semibold">Mulai Tugas:</span>{" "}
                                    {formatLongDate(task.start_date)}
                                </div>
                                <div>
                                    <span className="font-semibold">Tenggat Waktu:</span>{" "}
                                    {formatLongDate(task.deadline_at)}
                                </div>
                            </div>

                            {/* Revisi */}
                            {task.status_tugas === 2 && (
                                <div className="text-[11px] text-red-700 bg-red-100 px-2 py-1 rounded mt-1 font-medium">
                                    Perlu Revisi
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Slider indikator */}
                <div className="flex justify-center mt-2 space-x-1.5">
                    {activeTasks.map((_, idx) => (
                        <button key={idx} onClick={() => scrollToIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? "bg-green-500" : "bg-gray-300"}`} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskCardSlider;
