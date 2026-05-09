import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faChevronRight,
  faLayerGroup,
  faTasks,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatLongDate } from "../../../utils/dateUtils";
import Empty from "../../feedback/Empty";
import SectionCard from "../SectionCard";

const getDeadlineStatus = (deadline_at, finished_at = null) => {
  if (!deadline_at) return "-";

  const deadline = new Date(deadline_at);
  const now = finished_at ? new Date(finished_at) : new Date();

  const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  if (diff < 0) return `Terlambat ${Math.abs(diff)} hari`;
  if (diff === 0) return "Tenggat hari ini";

  return `Sisa ${diff} hari`;
};

const getStatusLabel = (task) => {
  if (task.is_paused === 1) return "Ditunda";
  if (task.status_tugas === 2) return "Revisi";
  if (task.status_tugas === 0 && task.finished_at) return "Menunggu Verifikasi";
  if (task.status_tugas === 0 && !task.finished_at) return "Belum Selesai";

  return "Selesai";
};

const getStatusColor = (task) => {
  if (task.is_paused === 1) return "bg-blue-50 text-blue-700 border-blue-100";
  if (task.status_tugas === 2) return "bg-red-50 text-red-700 border-red-100";
  if (task.status_tugas === 0 && task.finished_at)
    return "bg-yellow-50 text-yellow-700 border-yellow-100";
  if (task.status_tugas === 0 && !task.finished_at)
    return "bg-gray-50 text-gray-600 border-gray-100";

  return "bg-green-50 text-green-700 border-green-100";
};

const getCategoryColor = (category) => {
  const c = category?.toLowerCase();

  if (c === "urgent") return "bg-red-600 text-white";
  if (c === "daily") return "bg-green-600 text-white";

  return "bg-gray-600 text-white";
};

const getDeadlineColor = (info) => {
  if (info.includes("Terlambat")) return "text-red-600";
  if (info.includes("hari ini")) return "text-amber-600";

  return "text-green-600";
};

const TaskCard = ({ t, onClick }) => {
  const deadlineInfo = getDeadlineStatus(t.deadline_at);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-4 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm hover:border-green-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className={`text-[10px] px-2 py-[3px] rounded-full font-semibold uppercase tracking-wide ${getCategoryColor(
            t.category,
          )}`}
        >
          {t.category || "-"}
        </span>

        <span
          className={`text-[10px] px-2 py-[3px] rounded-full font-semibold uppercase border ${getStatusColor(
            t,
          )}`}
        >
          {getStatusLabel(t)}
        </span>
      </div>

      <h2 className="font-semibold text-[14px] text-gray-900 leading-snug mb-3 line-clamp-2">
        {t.nama_tugas}
      </h2>

      {t.status_tugas !== 1 && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="text-[11px] text-green-600 shrink-0"
            />
            <span className="text-[11px] text-gray-500 truncate">
              {formatLongDate(t.deadline_at)}
            </span>
          </div>

          <span
            className={`text-[11px] font-semibold shrink-0 ${getDeadlineColor(
              deadlineInfo,
            )}`}
          >
            {deadlineInfo}
          </span>
        </div>
      )}
    </div>
  );
};

const TaskSection = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/tugas/user`);

        if (!res.ok) throw new Error("Gagal mengambil data tugas");

        const data = await res.json();
        const all = data?.data || [];

        const active = all.filter((t) => {
          const category = t.category?.toLowerCase();

          const isFinished = !!t.finished_at;
          const isPending = isFinished && t.status_persetujuan === 0;
          const isRevision = t.status_tugas === 2;

          return (
            (category === "urgent" || category === "daily") &&
            (!isFinished || isPending || isRevision)
          );
        });

        active.sort((a, b) => {
          if (a.status_tugas === 2 && b.status_tugas !== 2) return -1;
          if (a.status_tugas !== 2 && b.status_tugas === 2) return 1;

          const dateA = a.deadline_at
            ? new Date(a.deadline_at).getTime()
            : Infinity;
          const dateB = b.deadline_at
            ? new Date(b.deadline_at).getTime()
            : Infinity;

          return dateA - dateB;
        });

        setTasks(active);
      } catch (error) {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiUrl]);

  if (loading) {
    return (
      <SectionCard>
        <div className="mb-4">
          <p className="text-sm font-semibold text-black">Tugas Aktif</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Tugas yang perlu kamu selesaikan
          </p>
        </div>

        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <div>
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="mb-4 flex items-center gap-2 text-xs">
            <FontAwesomeIcon icon={faTasks} className="text-green-600" />
            <p className="font-semibold tracking-wide">Tugas</p>
          </div>

          <button
            onClick={() => navigate("/tugas")}
            className="flex items-center gap-1 text-[11px] font-semibold text-green-600 hover:text-green-700 transition-colors shrink-0 pt-0.5"
          >
            Lihat
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
          </button>
        </div>

        {tasks.length === 0 ? (
          <Empty title="Tidak ada tugas hari ini." />
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                t={t}
                onClick={() => navigate(`/tugas/${t.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default TaskSection;
