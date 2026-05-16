import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import {
  EmptyState,
  ErrorState,
  SearchBar,
  DateRangeField,
} from "../../../components";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";

export default function Lembur() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const user = getUserFromToken();
  const { start, end } = getDefaultPeriod();

  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalOvertime: 0,
    totalHour: 0,
    totalApproved: 0,
    totalRejected: 0,
  });

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatClock = (time) => {
    if (!time) return "--:--";
    return time.slice(0, 5);
  };

  const getDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "-";

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;

    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }

    const diffMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours && minutes) return `${hours}j ${minutes}m`;
    if (hours) return `${hours}j`;
    return `${minutes}m`;
  };

  const getStatusLabel = (status) => {
    if (status === 1) return "Disetujui";
    if (status === 2) return "Ditolak";
    return "Pending";
  };

  const getStatusClass = (status) => {
    if (status === 1) {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (status === 2) {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  const formatPeriod = (s, e) => {
    if (!s || !e) return "-";
    return `${formatFullDate(s)} - ${formatFullDate(e)}`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchWithJwt(
          `${apiUrl}/lembur/riwayat/user?startDate=${startDate}&endDate=${endDate}`,
        );

        if (!res.ok) {
          throw new Error("Gagal memuat data lembur");
        }

        const json = await res.json();

        const rawData = Array.isArray(json?.data?.riwayat)
          ? json.data.riwayat
          : [];

        const sorted = [...rawData].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        setSummary({
          totalOvertime: json?.data?.total_overtime ?? 0,
          totalHour: json?.data?.total_hour ?? 0,
          totalApproved: json?.data?.total_approved ?? 0,
          totalRejected: json?.data?.total_rejected ?? 0,
        });

        setData(sorted);
      } catch (e) {
        setError(e.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiUrl, user?.id_user, startDate, endDate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return data;

    return data.filter((item) => {
      const text = `
        ${item.lokasi || ""}
        ${item.deskripsi || ""}
        ${item.approved_by || ""}
        ${getStatusLabel(item.status)}
        ${item.tanggal ? formatFullDate(item.tanggal) : ""}
        ${item.created_at ? formatFullDate(item.created_at) : ""}
      `
        .toLowerCase()
        .replace(/\s+/g, " ");

      return text.includes(q);
    });
  }, [data, query]);

  const handleSearch = (input) => {
    const value =
      typeof input === "string" ? input : input?.target?.value || "";
    setQuery(value);
  };

  const emptyMessage = query
    ? "Tidak ada data yang cocok."
    : "Belum ada riwayat lembur.";

  return (
    <div className="space-y-3">
      {/* Summary Mini */}
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-800">
              Riwayat Lembur
            </p>
            <p className="truncate text-[9px] text-gray-600">
              {formatPeriod(startDate, endDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <p className="text-[13px] font-bold leading-none text-gray-900">
              {summary.totalOvertime}
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-gray-500">
              Pengajuan
            </p>
          </div>

          <div className="border-l border-gray-100 pl-2">
            <p className="text-[13px] font-bold leading-none text-blue-600">
              {summary.totalHour}
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-gray-500">
              Jam Total
            </p>
          </div>

          <div className="border-l border-gray-100 pl-2">
            <p className="text-[13px] font-bold leading-none text-green-600">
              {summary.totalApproved}
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-gray-500">
              Disetujui
            </p>
          </div>

          <div className="border-l border-gray-100 pl-2">
            <p className="text-[13px] font-bold leading-none text-red-600">
              {summary.totalRejected}
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-gray-500">
              Ditolak
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="space-y-2">
        <DateRangeField
          startDate={startDate}
          endDate={endDate}
          onChangeStart={setStartDate}
          onChangeEnd={setEndDate}
        />

        <SearchBar
          value={query}
          onSearch={handleSearch}
          placeholder="Cari riwayat lembur..."
        />
      </div>

      {/* List */}
      <div className="space-y-1.5 pb-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-8 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-500" />
              <p className="text-[12px] text-gray-500">Memuat data lembur...</p>
            </div>
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          filtered.map((item) => {
            const tanggalLembur = item.tanggal
              ? formatFullDate(item.tanggal)
              : "-";
            const tanggalDiajukan = item.created_at
              ? formatFullDate(item.created_at)
              : "-";
            const tanggalDisetujui = item.approved_at
              ? formatFullDate(item.approved_at)
              : null;

            const jamMulai = formatClock(item.jam_mulai);
            const jamSelesai = formatClock(item.jam_selesai);
            const durasi = getDuration(item.jam_mulai, item.jam_selesai);

            return (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[11px] font-semibold text-gray-900">
                        {tanggalLembur}
                      </p>
                    </div>

                    <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[10px] font-medium text-gray-500">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="shrink-0 text-green-600"
                      />
                      <span className="truncate">
                        {item.lokasi || "Lokasi tidak tersedia"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold ${getStatusClass(
                      item.status,
                    )}`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                {/* Time */}
                <div className="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-center border-t border-gray-100 pt-1.5">
                  <div>
                    <p className="text-[9px] font-medium text-gray-600">
                      Mulai
                    </p>
                    <p className="text-[12px] font-bold leading-tight text-gray-900">
                      {jamMulai}
                    </p>
                  </div>

                  <div className="px-2 text-center">
                    <p className="text-[9px] font-medium text-gray-600">
                      Durasi
                    </p>
                    <p className="text-[11px] font-bold leading-tight text-blue-600">
                      {durasi}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-medium text-gray-600">
                      Selesai
                    </p>
                    <p className="text-[12px] font-bold leading-tight text-gray-900">
                      {jamSelesai}
                    </p>
                  </div>
                </div>


                {/* Footer */}
                <div className="mt-1 pt-2 flex items-center border-t border-gray-100 justify-between gap-2 text-[9px] font-medium text-gray-600">
                  <span className="truncate">Diajukan: {tanggalDiajukan}</span>

                  {item.approved_by ? (
                    <span className="truncate text-right text-gray-500">
                      Oleh: {item.approved_by}
                    </span>
                  ) : (
                    <span className="shrink-0 text-gray-600">
                      Belum diproses
                    </span>
                  )}
                </div>

                {tanggalDisetujui && (
                  <p className="mt-0.5 truncate text-right text-[9px] font-medium text-gray-600">
                    Diproses: {tanggalDisetujui}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
