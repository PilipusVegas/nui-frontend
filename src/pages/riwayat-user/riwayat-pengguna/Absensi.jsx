import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate, formatTime } from "../../../utils/dateUtils";
import {
  EmptyState,
  ErrorState,
  SearchBar,
  DateRangeField,
} from "../../../components";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";

export default function Absensi() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const user = getUserFromToken();
  const { start, end } = getDefaultPeriod();

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({
    totalDays: 0,
    totalLate: 0,
    totalForgotCheckout: 0,
  });
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchWithJwt(
          `${apiUrl}/absen/riwayat/user?startDate=${startDate}&endDate=${endDate}`,
        );

        if (res.status === 404) {
          setData([]);
          setSummary({
            totalDays: 0,
            totalLate: 0,
            totalForgotCheckout: 0,
          });
          return;
        }

        if (!res.ok) {
          throw new Error("Gagal memuat data absensi");
        }

        const json = await res.json();
        const riwayat = json.data?.riwayat || [];

        const sorted = [...riwayat].sort(
          (a, b) => new Date(b.jam_mulai) - new Date(a.jam_mulai),
        );

        const forgotCheckoutCount = sorted.filter((item) => {
          if (!item.jam_mulai || item.jam_selesai) return false;
          return (
            new Date().toDateString() !==
            new Date(item.jam_mulai).toDateString()
          );
        }).length;

        setSummary({
          totalDays: json.data?.total_days || 0,
          totalLate: json.data?.total_late || 0,
          totalForgotCheckout: forgotCheckoutCount,
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

  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return data;

    return data.filter((item) => {
      const text = `
        ${item.lokasi_absen_mulai || ""}
        ${item.lokasi_absen_selesai || ""}
        ${item.nama_shift || ""}
        ${item.jam_mulai || ""}
        ${item.jam_selesai || ""}
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

  const formatPeriod = (s, e) => {
    if (!s || !e) return "-";
    return `${formatFullDate(s)} - ${formatFullDate(e)}`;
  };

  const emptyMessage = query
    ? "Tidak ada riwayat yang cocok dengan pencarian."
    : "Belum ada riwayat absensi pada periode ini.";

  return (
    <div className="space-y-3">
      {/* Summary Mini */}
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-800">
              Riwayat Absensi
            </p>
            <p className="truncate text-[9px] text-gray-600">
              {formatPeriod(startDate, endDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[13px] font-bold leading-none text-gray-900">
              {summary.totalDays}
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-gray-500">Total Hadir</p>
          </div>

          <div className="border-l border-gray-100 pl-2">
            <p className="text-[13px] font-bold leading-none text-red-600">
              {summary.totalLate}
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-gray-500">Menit Terlambat</p>
          </div>

          <div className="border-l border-gray-100 pl-2">
            <p className="text-[13px] font-bold leading-none text-orange-500">
              {summary.totalForgotCheckout}
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-gray-500">Lupa Absen</p>
          </div>
        </div>
      </div>

      {/* Filter Compact */}
      <div className="space-y-3">
        <DateRangeField
          startDate={startDate}
          endDate={endDate}
          onChangeStart={setStartDate}
          onChangeEnd={setEndDate}
        />

        <SearchBar
          value={query}
          onSearch={handleSearch}
          placeholder="Cari absensi..."
        />
      </div>

      {/* Data Area */}
      <div className="space-y-1.5 pb-3">
        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-6 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-green-500" />
              <p className="text-[11px] text-gray-500">Memuat riwayat...</p>
            </div>
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredData.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          filteredData.map((item) => {
            const tglMasuk = item.jam_mulai
              ? formatFullDate(item.jam_mulai)
              : "-";
            const tglPulang = item.jam_selesai
              ? formatFullDate(item.jam_selesai)
              : "-";

            const jamMasuk = item.jam_mulai
              ? formatTime(item.jam_mulai)
              : "--:--";
            const jamPulang = item.jam_selesai
              ? formatTime(item.jam_selesai)
              : "--:--";

            const isLate = !!item.keterlambatan;

            const isForgotCheckout =
              !item.jam_selesai &&
              new Date().toDateString() !==
                new Date(item.jam_mulai).toDateString();

            return (
              <div
                key={item.id_absen}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-[11px] font-semibold text-gray-900">
                        {tglMasuk}
                      </p>

                      {isLate && (
                        <span className="shrink-0 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold text-red-600">
                          Telat {item.keterlambatan}m
                        </span>
                      )}

                      {isForgotCheckout && (
                        <span className="shrink-0 rounded-md border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[9px] font-semibold text-gray-600">
                          Belum pulang
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-[10px] font-medium text-gray-500">
                      {item.nama_shift || "-"}
                    </p>
                  </div>
                </div>

                {/* Masuk & Pulang */}
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-green-600">
                      Masuk
                    </p>

                    <p className="mt-0.5 text-[11px] font-bold text-gray-900">
                      {jamMasuk}
                    </p>

                    <p className="truncate text-[9px] font-medium text-gray-500">
                      {tglMasuk}
                    </p>

                    <div className="mt-1 flex min-w-0 items-center gap-1 text-[10px] text-gray-600">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="shrink-0 text-green-600"
                      />
                      <span className="truncate">
                        {item.lokasi_absen_mulai ||
                          "Lokasi masuk tidak tersedia"}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 text-right">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-orange-500">
                      Pulang
                    </p>

                    <p className="mt-0.5 text-[11px] font-bold text-gray-900">
                      {jamPulang}
                    </p>

                    <p className="truncate text-[9px] font-medium text-gray-500">
                      {tglPulang}
                    </p>

                    <div className="mt-1 flex min-w-0 items-center justify-end gap-1 text-[10px] text-gray-600">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="shrink-0 text-orange-500"
                      />
                      <span className="truncate">
                        {item.lokasi_absen_selesai || "Belum tersedia"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
