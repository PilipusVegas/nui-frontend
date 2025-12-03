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
                        .filter((t) =>
                            // t.is_paused !== 1 &&
                            t.status_tugas !== 1 &&
                            !(t.status_tugas === 0 && t.finished_at) // pending → hide
                        )
                        .sort((a, b) => {

                            if (a.is_paused === 1 && b.is_paused !== 1) return -1;
                            if (a.is_paused !== 1 && b.is_paused === 1) return 1;
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
        if (task.is_paused === 1)
            return "bg-amber-200 text-amber-800";
        if (task.status_tugas === 2)
            return "bg-red-200 text-red-800";
        if (task.status_tugas === 0 && task.finished_at)
            return "bg-orange-200 text-orange-800";
        if (task.status_tugas === 0 && !task.finished_at)
            return "bg-blue-200 text-blue-800";
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
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Daftar Pekerjaan Kamu</h3>
                <button onClick={() => navigate("/tugas")} className="flex items-center gap-1 text-[13px] font-medium text-green-600 hover:text-green-700 hover:underline transition-all">
                    <span>Lihat Semua</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </button>
            </div>

            {/* Slider */}
            <div className="relative">
                <div ref={sliderRef} onScroll={handleScroll} className="flex space-x-3 overflow-x-auto scrollbar-none py-2 scroll-smooth snap-x snap-mandatory">
                    {tasks.map((task) => (
                        <div key={task.id} className="relative snap-center">
                            <div onClick={() => navigate(`/tugas/${task.id}`)} className="w-[300px] bg-white rounded-xl border border-gray-200 shadow-sm p-3 cursor-pointer  hover:shadow-md hover:-translate-y-[2px] transition-all duration-200  flex flex-col gap-2">
                                {/* Badge Header */}
                                <div className="flex justify-between items-center">
                                    <span className={` text-[9px] font-semibold px-2 py-[2px] rounded-full shadow-sm ${task.category === 'urgent' ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>
                                        {task.category.toUpperCase()}
                                    </span>

                                    <span className={` text-[9px] px-2 py-[2px] rounded-full shadow-sm ${getStatusColor(task)}`}>
                                        {getStatusLabel(task)}
                                    </span>
                                </div>

                                <h4 className="text-[11.5px] font-semibold text-gray-900 leading-snug line-clamp-2 h-[32px]">
                                    {task.nama_tugas}
                                </h4>

                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-bold text-red-600">
                                        {getDaysLeft(task.deadline_at)}
                                    </p>

                                    {task.status_tugas === 2 && (
                                        <span className="bg-red-500 text-white text-[9px] px-2 py-[2px] rounded-full shadow-sm font-medium">
                                            Perlu Revisi !
                                        </span>
                                    )}
                                </div>

                                <div className="text-[9.5px] text-gray-700 leading-tight space-y-[1px]">
                                    <p>
                                        <span className="font-semibold">Mulai:</span>{' '}
                                        {formatLongDate(task.start_date)}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Deadline:</span>{' '}
                                        {formatLongDate(task.deadline_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-2 space-x-1.5">
                    {tasks.map((_, idx) => (
                        <button key={idx} onClick={() => scrollToIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-green-500 scale-110' : 'bg-gray-300'}`}/>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default TaskCardSlider;
