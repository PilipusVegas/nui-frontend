import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCalendarAlt,
  faChevronRight,
  faClock,
  faTasks,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatLongDate } from "../../../utils/dateUtils";
import {
  EmptyState,
  Badge,
  LoadingSpinner,
  ErrorState,
  SectionCard,
} from "../../index";

const getDeadlineStatus = (deadline_at, finished_at = null) => {
  if (!deadline_at) return "-";

  const deadline = new Date(deadline_at);
  const now = finished_at ? new Date(finished_at) : new Date();

  const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  if (diff < 0) return `Terlambat ${Math.abs(diff)} hari`;
  if (diff === 0) return "Tenggat hari ini";

  return `Sisa ${diff} hari`;
};

const getCategoryCardStyle = (category) => {
  const c = category?.toLowerCase();

  if (c === "urgent") {
    return "border-red-100 bg-red-50/50 hover:bg-red-50";
  }

  if (c === "daily") {
    return "border-green-100 bg-green-50/50 hover:bg-green-50";
  }

  return "border-slate-100 bg-slate-50/60 hover:bg-slate-50";
};

const getCategoryIconColor = (category) => {
  const c = category?.toLowerCase();

  if (c === "urgent") return "text-red-600";
  if (c === "daily") return "text-green-600";

  return "text-slate-500";
};

const getStatusLabel = (task) => {
  if (task.is_paused === 1) return "Ditunda";
  if (task.status_tugas === 2) return "Revisi";
  if (task.status_tugas === 0 && task.finished_at) return "Menunggu Verifikasi";
  if (task.status_tugas === 0 && !task.finished_at) return "Belum Selesai";

  return "Selesai";
};

const getStatusVariant = (task) => {
  if (task.is_paused === 1) return "info";
  if (task.status_tugas === 2) return "danger";
  if (task.status_tugas === 0 && task.finished_at) return "warning";
  if (task.status_tugas === 0 && !task.finished_at) return "neutral";

  return "success";
};

const getCategoryVariant = (category) => {
  const c = category?.toLowerCase();

  if (c === "urgent") return "danger";
  if (c === "daily") return "success";

  return "neutral";
};

const getDeadlineVariant = (text) => {
  if (text.includes("Terlambat")) return "danger";
  if (text.includes("hari ini")) return "warning";

  return "success";
};

const formatTimeOnly = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex min-w-0 items-center gap-1.5">
    <FontAwesomeIcon
      icon={icon}
      className="shrink-0 text-[10px] text-green-600"
    />

    <span className="shrink-0 text-[10px] text-slate-400">{label}</span>

    <span className="min-w-0 truncate text-[10.5px] font-semibold text-slate-700">
      {value || "-"}
    </span>
  </div>
);

const TaskCard = ({ task, onClick }) => {
  const deadlineInfo = getDeadlineStatus(task.deadline_at, task.finished_at);
  const categoryColor = getCategoryIconColor(task.category);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-200 hover:shadow-sm ${getCategoryCardStyle(
        task.category,
      )}`}
    >
      <div className="flex items-start gap-2.5">
        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Top Row */}
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <Badge
                variant={getCategoryVariant(task.category)}
                tone="soft"
                size="xs"
                rounded="full"
                uppercase
              >
                {task.category || "-"}
              </Badge>

              <Badge
                variant={getDeadlineVariant(deadlineInfo)}
                tone="soft"
                size="xs"
                rounded="full"
              >
                {deadlineInfo}
              </Badge>

              <Badge
                variant={getStatusVariant(task)}
                tone="soft"
                size="xs"
                rounded="full"
                className="max-w-[130px]"
              >
                <span className="truncate">{getStatusLabel(task)}</span>
              </Badge>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[9px] font-medium text-slate-500">
                Lihat detail
              </span>

              <FontAwesomeIcon
                icon={faChevronRight}
                className={`text-[10px] transition-all duration-200 group-hover:translate-x-0.5 ${categoryColor}`}
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 break-words text-[13px] font-semibold leading-5 text-slate-900">
            {task.nama_tugas || "Tanpa nama tugas"}
          </h3>

          {/* Description */}
          {task.deskripsi && (
            <p className="mt-0.5 line-clamp-1 break-words text-[10.5px] leading-4 text-slate-500">
              {task.deskripsi}
            </p>
          )}

          {/* Bottom Section */}
          <div className="mt-2 flex items-end justify-between gap-3">
            {/* Meta Info */}
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
              <span className="inline-flex max-w-[145px] items-center gap-1 truncate">
                <FontAwesomeIcon
                  icon={faClock}
                  className={`shrink-0 text-[9px] ${categoryColor}`}
                />

                <span className="truncate">
                  Mulai {formatLongDate(task.start_date)}
                </span>
              </span>

              <span className="inline-flex max-w-[160px] items-center gap-1 truncate">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className={`shrink-0 text-[9px] ${categoryColor}`}
                />

                <span className="truncate">
                  Deadline {formatLongDate(task.deadline_at)}
                </span>
              </span>

              <span className="inline-flex max-w-[120px] items-center gap-1 truncate">
                <FontAwesomeIcon
                  icon={faUserTie}
                  className={`shrink-0 text-[9px] ${categoryColor}`}
                />

                <span className="truncate">{task.nama_kadiv || "-"}</span>
              </span>
            </div>

            {/* Right Bottom */}
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-[9px] font-medium text-slate-500">
              <FontAwesomeIcon
                icon={faBell}
                className={`text-[8px] ${categoryColor}`}
              />

              <span>{task.interval_notifikasi || 0} menit</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

const TaskSection = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetchWithJwt(`${apiUrl}/tugas/user`);

      if (!res.ok) throw new Error("Gagal mengambil data tugas");

      const result = await res.json();
      const allTasks = result?.data || [];

      const activeTasks = allTasks.filter((task) => {
        const category = task.category?.toLowerCase();

        const isAllowedCategory = category === "urgent" || category === "daily";
        const isFinished = !!task.finished_at;
        const isRevision = task.status_tugas === 2;
        const isWaitingVerification = isFinished && task.status_tugas === 0;

        return (
          isAllowedCategory &&
          (!isFinished || isRevision || isWaitingVerification)
        );
      });

      activeTasks.sort((a, b) => {
        const categoryA = a.category?.toLowerCase();
        const categoryB = b.category?.toLowerCase();

        // PRIORITAS CATEGORY
        if (categoryA === "urgent" && categoryB !== "urgent") return -1;
        if (categoryA !== "urgent" && categoryB === "urgent") return 1;

        // PRIORITAS REVISI
        if (a.status_tugas === 2 && b.status_tugas !== 2) return -1;
        if (a.status_tugas !== 2 && b.status_tugas === 2) return 1;

        // PRIORITAS DEADLINE TERDEKAT
        const dateA = a.deadline_at
          ? new Date(a.deadline_at).getTime()
          : Infinity;
        const dateB = b.deadline_at
          ? new Date(b.deadline_at).getTime()
          : Infinity;
        return dateA - dateB;
      });

      setTasks(activeTasks);
    } catch (error) {
      console.error(error);
      setTasks([]);
      setErrorMessage("Data tugas belum berhasil dimuat.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <SectionCard>
      <div className="mb-3 flex items-center justify-between gap-3">
        {/* HEADER */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-700">
          <FontAwesomeIcon
            icon={faTasks}
            className="text-[12px] text-green-600"
          />

          <span>Tugas</span>
        </div>

        {/* ACTION */}
        <button
          type="button"
          onClick={() => navigate("/tugas")}
          className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-green-700 transition-colors active:scale-95"
        >
          <span className="hover:underline">Lihat semua</span>

          <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat data tugas..." />
      ) : errorMessage ? (
        <ErrorState
          message="Gagal memuat tugas"
          detail={errorMessage}
          onRetry={loadTasks}
          retryText="Muat Ulang"
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="Tidak ada tugas aktif."
          description="Semua tugas aktif akan tampil di sini."
        />
      ) : (
        <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1 scrollbar-none">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => navigate(`/tugas/${task.id}`)}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default TaskSection;
