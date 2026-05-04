import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { id } from "date-fns/locale";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPlus,
  faTrash,
  faCalendarDays,
  faUserCheck,
  faClock,
  faUmbrellaBeach,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

import { SectionHeader, Modal, Button, EmptyState } from "../../components";

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const EVENT_META = {
  present: {
    label: "Hadir",
    icon: faUserCheck,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100",
  },
  overtime: {
    label: "Lembur",
    icon: faClock,
    className:
      "bg-orange-50 text-orange-700 border-orange-200 ring-orange-100",
  },
  leave: {
    label: "Cuti",
    icon: faUmbrellaBeach,
    className: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-100",
  },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "present" });
  const navigate = useNavigate();

  const [events, setEvents] = useState([
    { id: 1, title: "Masuk Kantor", date: new Date(), type: "present" },
    { id: 2, title: "Lembur Backend", date: new Date(), type: "overtime" },
  ]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { locale: id });
  const endDate = endOfWeek(monthEnd, { locale: id });

  const calendarDays = useMemo(() => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [startDate, endDate]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => isSameDay(new Date(e.date), selectedDate));
  }, [events, selectedDate]);

  const monthEvents = useMemo(() => {
    return events.filter((e) => isSameMonth(new Date(e.date), currentDate));
  }, [events, currentDate]);

  const monthLabel = format(currentDate, "MMMM yyyy", { locale: id });
  const selectedLabel = selectedDate
    ? format(selectedDate, "dd MMMM yyyy", { locale: id })
    : "-";

  const getEventsByDate = (date) =>
    events.filter((e) => isSameDay(new Date(e.date), date));

  const openModal = (day) => {
    setSelectedDate(day);
    setModalOpen(true);
  };

  const goPrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const goNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleAddEvent = () => {
    if (!selectedDate) {
      toast.error("Tanggal belum dipilih");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Judul aktivitas wajib diisi");
      return;
    }

    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: form.title.trim(),
        type: form.type,
        date: selectedDate,
      },
    ]);

    toast.success("Aktivitas berhasil ditambahkan");
    setForm({ title: "", type: "present" });
    setModalOpen(false);
  };

  const handleDelete = async (eventId) => {
    const result = await Swal.fire({
      title: "Hapus aktivitas ini?",
      text: "Data yang sudah dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success("Aktivitas berhasil dihapus");
    }
  };

  const openAddForSelectedDate = () => {
    if (!selectedDate) setSelectedDate(new Date());
    setModalOpen(true);
  };

  const renderEventBadge = (event) => {
    const meta = EVENT_META[event.type] || EVENT_META.present;

    return (
      <div
        key={event.id}
        className={`inline-flex w-full items-center gap-2 rounded-xl border px-2.5 py-1 text-[11px] font-medium ring-1 ${meta.className}`}
        title={event.title}
      >
        <FontAwesomeIcon icon={meta.icon} className="text-[10px] shrink-0" />
        <span className="min-w-0 truncate">{event.title}</span>
      </div>
    );
  };

  const handleBack = () => navigate(-1);

  return (
    <div>
      <Toaster position="top-right" />

      <SectionHeader
        title="Kalender Absensi"
        subtitle="Kelola kehadiran, lembur, cuti, dan aktivitas kerja dengan tampilan yang rapi."
        onBack={handleBack}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={faCalendarDays}
              onClick={goToday}
              className="w-full sm:w-auto rounded-xl"
            >
              Hari Ini
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={faChevronLeft}
              onClick={goPrevMonth}
              className="rounded-xl"
            />

            <Button
              variant="outline"
              size="sm"
              icon={faChevronRight}
              iconPosition="right"
              onClick={goNextMonth}
              className="rounded-xl"
            />

            <Button
              variant="primary"
              size="sm"
              icon={faPlus}
              onClick={openAddForSelectedDate}
              className="w-full sm:w-auto rounded-xl"
            >
              Tambah
            </Button>
          </>
        }
      />

      {/* RINGKASAN */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Bulan Aktif
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-800">{monthLabel}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Aktivitas Bulan Ini
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-800">
            {monthEvents.length} data
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tanggal Terpilih
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-800">{selectedLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.53fr)_minmax(320px,0.75fr)]">
        {/* CALENDAR */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 sm:px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Kalender Bulanan
              </p>
              <h2 className="mt-1 text-sm sm:text-base font-semibold text-slate-800 truncate">
                {monthLabel}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                icon={faChevronLeft}
                onClick={goPrevMonth}
                className="rounded-xl"
              />
              <Button
                variant="outline"
                size="sm"
                icon={faChevronRight}
                iconPosition="right"
                onClick={goNextMonth}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Mobile tetap kotak, tidak dipaksa gepeng */}
          <div className="overflow-x-auto">
            <div className="min-w-[720px] p-3 sm:p-4">
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs sm:text-sm font-semibold text-slate-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const dayEvents = getEventsByDate(day);
                  const isOutsideMonth = !isSameMonth(day, currentDate);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => openModal(day)}
                      className={[
                        "group flex aspect-[1.06] flex-col justify-between rounded-2xl border p-3 text-left transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2",
                        isOutsideMonth
                          ? "border-slate-200 bg-slate-50 text-slate-400"
                          : "border-slate-200 bg-white text-slate-800 hover:-translate-y-[1px] hover:border-green-300 hover:shadow-sm",
                        isSelected
                          ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                          : "",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={[
                              "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                              isToday
                                ? "bg-green-600 text-white"
                                : "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {format(day, "d")}
                          </span>
                        </div>

                        {isToday && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            Hari ini
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-col gap-1.5">
                        {dayEvents.slice(0, 2).map(renderEventBadge)}

                        {dayEvents.length > 2 && (
                          <div className="text-[11px] font-medium text-slate-500">
                            +{dayEvents.length - 2} lainnya
                          </div>
                        )}

                        {dayEvents.length === 0 && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                            <FontAwesomeIcon icon={faCircleInfo} className="text-[10px]" />
                            Tidak ada aktivitas
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR DETAIL */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Detail Tanggal
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-800 truncate">
                {selectedLabel}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Aktivitas yang tercatat pada tanggal ini.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={faPlus}
              onClick={openAddForSelectedDate}
              className="rounded-xl shrink-0"
            >
              Tambah
            </Button>
          </div>

          <div className="mt-5">
            {selectedEvents.length === 0 ? (
              <EmptyState
                title="Belum ada aktivitas"
                description="Tanggal ini belum memiliki aktivitas. Tambahkan data agar kalender lebih informatif."
                actionText="Tambah Aktivitas"
                onAction={openAddForSelectedDate}
              />
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((ev) => {
                  const meta = EVENT_META[ev.type] || EVENT_META.present;

                  return (
                    <div
                      key={ev.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
                            >
                              <FontAwesomeIcon icon={meta.icon} className="text-[10px]" />
                              {meta.label}
                            </span>
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-800 break-words">
                            {ev.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {format(new Date(ev.date), "dd MMMM yyyy", {
                              locale: id,
                            })}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(ev.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 hover:border-rose-300 active:scale-95"
                          title="Hapus"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tambah Aktivitas"
        note={
          selectedDate
            ? format(selectedDate, "dd MMMM yyyy", { locale: id })
            : "Pilih tanggal untuk menambahkan aktivitas."
        }
        size="md"
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="w-full sm:w-auto rounded-xl"
            >
              Batal
            </Button>

            <Button
              variant="primary"
              icon={faPlus}
              onClick={handleAddEvent}
              className="w-full sm:w-auto rounded-xl"
            >
              Simpan
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tanggal aktif
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {selectedDate
                ? format(selectedDate, "EEEE, dd MMMM yyyy", { locale: id })
                : "-"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Judul aktivitas
              </label>
              <input
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="Contoh: Meeting dengan tim"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Jenis aktivitas
              </label>
              <select
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="present">Hadir</option>
                <option value="overtime">Lembur</option>
                <option value="leave">Cuti</option>
              </select>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-800">
                Aktivitas pada tanggal ini
              </h4>
              <span className="text-xs text-slate-500">
                {selectedEvents.length} data
              </span>
            </div>

            {selectedEvents.length === 0 ? (
              <EmptyState
                title="Belum ada data"
                description="Silakan tambahkan aktivitas pertama untuk tanggal ini."
                actionText="Tambah Sekarang"
                onAction={handleAddEvent}
              />
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((ev) => {
                  const meta = EVENT_META[ev.type] || EVENT_META.present;

                  return (
                    <div
                      key={ev.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}
                          >
                            <FontAwesomeIcon icon={meta.icon} className="text-[10px]" />
                            {meta.label}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-slate-800 break-words">
                          {ev.title}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 hover:border-rose-300 active:scale-95"
                        title="Hapus"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}