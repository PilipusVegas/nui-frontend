import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faLocationDot,
  faStore,
  faUserClock,
  faHouse,
  faBuilding,
  faCheckCircle,
  faGlobeAsia,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatLongDate } from "../../../utils/dateUtils";
import {
  EmptyState,
  Badge,
  LoadingSpinner,
  ErrorState,
  SectionCard,
} from "../../index";

const getScheduleTypeLabel = (isPermanent) => {
  return isPermanent === 1 ? "Permanen" : "Periode";
};

const getSchedulePeriod = (schedule) => {
  if (!schedule) return "-";

  if (schedule.is_permanent === 1) return "Berlaku permanen";

  const start = schedule.tanggal_mulai
    ? formatLongDate(schedule.tanggal_mulai)
    : "-";

  const end = schedule.tanggal_selesai
    ? formatLongDate(schedule.tanggal_selesai)
    : "-";

  return `${start} - ${end}`;
};

const getStatusLabel = (isActive) => {
  return isActive ? "Aktif" : "Tidak Aktif";
};

const getStatusVariant = (isActive) => {
  return isActive ? "success" : "neutral";
};

const getLocationCategoryIcon = (category) => {
  if (category === 1) return faBuilding;
  if (category === 2) return faStore;
  if (category === 3) return faHouse;

  return faLocationDot;
};

const getLocationCategoryVariant = (category) => {
  if (category === 1) return "info";
  if (category === 2) return "success";
  if (category === 3) return "purple";

  return "neutral";
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <div className="flex shrink-0 items-center gap-1.5 text-[10.5px] font-medium text-zinc-500">
      <FontAwesomeIcon icon={icon} className="text-[10px] text-emerald-600" />
      <span>{label}</span>
    </div>

    <span className="min-w-0 truncate text-right text-[10.5px] font-semibold text-zinc-900">
      {value || "-"}
    </span>
  </div>
);

const LocationItem = ({ location }) => {
  const categoryIcon = getLocationCategoryIcon(location?.kategori);

  return (
    <div className="flex items-center gap-2 border-b border-zinc-100 py-1.5 last:border-b-0">
      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600">
        <FontAwesomeIcon icon={categoryIcon} className="text-[7px]" />
      </div>

      <h4 className="min-w-0 flex-1 truncate text-[11px] font-semibold text-zinc-900">
        {location?.nama || "-"}
      </h4>
    </div>
  );
};

const ScheduleNote = () => (
  <div className="mt-2 flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1">
    <FontAwesomeIcon
      icon={faCircleInfo}
      className="text-[8px] text-emerald-600"
    />

    <p className="text-[9.5px] font-medium text-emerald-700">
      Konfirmasi ke kepala divisi jika jadwal tidak sesuai.
    </p>
  </div>
);

const ScheduleContent = ({ schedule }) => {
  const totalLocation = schedule?.lokasi?.length || 0;

  return (
    <div className="rounded-lg border border-zinc-100 bg-white px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-zinc-500">
          Jadwal dari kepala divisi
        </p>

        <h3 className="truncate text-[13px] font-bold leading-5 text-zinc-950">
          {schedule?.nama_shift || "Jadwal kerja belum tersedia"}
        </h3>
      </div>
      <div className="my-2 border-t border-zinc-100" />
      <div className="divide-y divide-zinc-100">
        <InfoRow
          icon={faCalendarAlt}
          label="Periode"
          value={getSchedulePeriod(schedule)}
        />
        <InfoRow
          icon={faCheckCircle}
          label="Status"
          value={getStatusLabel(schedule?.is_active)}
        />
      </div>

      <div className="my-2 border-t border-zinc-100" />

      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900">
          <FontAwesomeIcon icon={faLocationDot} className="text-[11px] text-emerald-600"/>

          <span>Lokasi Absensi & Kunjungan</span>
        </div>

        <span className="text-[10px] font-semibold text-zinc-500">
          {totalLocation} lokasi
        </span>
      </div>

      {totalLocation === 0 ? (
        <div className="rounded-md border border-zinc-100 bg-white px-3 py-2 text-center text-[11px] font-medium text-zinc-500">
          Belum ada lokasi kerja yang tersedia.
        </div>
      ) : (
        <div className="max-h-[160px] overflow-y-auto pr-1 scrollbar-none">
          {schedule?.lokasi?.map((location) => (
            <LocationItem key={location.id} location={location} />
          ))}
        </div>
      )}
      <ScheduleNote />
    </div>
  );
};

const ScheduleSection = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const user = useMemo(() => getUserFromToken(), []);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const loadSchedule = useCallback(async () => {
    if (!user?.id_user) {
      setLoading(false);
      setErrorMessage("Data user tidak ditemukan.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetchWithJwt(`${apiUrl}/jadwal/cek/${user.id_user}`);

      if (!res.ok) throw new Error("Gagal mengambil data jadwal");

      const result = await res.json();
      setSchedule(result?.data || null);
    } catch (error) {
      console.error(error);
      setSchedule(null);
      setErrorMessage("Data jadwal belum berhasil dimuat.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, user?.id_user]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  return (
    <SectionCard>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-900">
          <FontAwesomeIcon
            icon={faUserClock}
            className="text-[12px] text-emerald-600"
          />

          <span>Jadwal Kerja</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Memuat data jadwal..." />
      ) : errorMessage ? (
        <ErrorState
          message="Gagal memuat jadwal"
          detail={errorMessage}
          onRetry={loadSchedule}
          retryText="Muat Ulang"
        />
      ) : !schedule ? (
        <EmptyState
          title="Tidak ada jadwal aktif."
          description="Jadwal kerja aktif akan tampil di sini."
        />
      ) : (
        <ScheduleContent schedule={schedule} />
      )}
    </SectionCard>
  );
};

export default ScheduleSection;
