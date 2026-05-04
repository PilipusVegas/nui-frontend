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
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="px-3 py-3 border-b border-gray-100">
          <p className="text-[13px] font-semibold text-gray-800">
            Riwayat Absensi
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Periode {formatPeriod(startDate, endDate)}
          </p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
          {/* Kehadiran */}
          <div className="py-3">
            <p className="text-[15px] font-semibold text-gray-900">
              {summary.totalDays}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">Kehadiran</p>
          </div>

          {/* Terlambat */}
          <div className="py-3">
            <p className="text-[15px] font-semibold text-red-600">
              {summary.totalLate}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">Terlambat</p>
          </div>

          {/* Lupa Absen */}
          <div className="py-3">
            <p className="text-[15px] font-semibold text-orange-500">
              {summary.totalForgotCheckout}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">Lupa Absen</p>
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
          placeholder="Cari riwayat absensi..."
        />
      </div>

      {/* Data area */}
      <div className="space-y-2 pb-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-8 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-500" />
              <p className="text-[12px] text-gray-500">
                Memuat riwayat absensi...
              </p>
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

            const isLate = !!item.keterlambatan;

            const isForgotCheckout =
              !item.jam_selesai &&
              new Date().toDateString() !==
                new Date(item.jam_mulai).toDateString();

            return (
              <div
                key={item.id_absen}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800">
                      {tglMasuk}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-gray-500">
                      {item.nama_shift || "-"}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-gray-500">
                    <p>Masuk</p>
                    <p className="font-medium text-gray-800">
                      {item.jam_mulai ? formatTime(item.jam_mulai) : "--:--"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <p className="text-gray-400">Tanggal Pulang</p>
                    <p className="mt-0.5 font-medium text-gray-700">
                      {tglPulang}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">Jam Pulang</p>
                    <p className="mt-0.5 font-medium text-gray-700">
                      {item.jam_selesai
                        ? formatTime(item.jam_selesai)
                        : "--:--"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-1 text-[11px] text-gray-500">
                  <div className="flex min-w-0 items-center gap-1">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-green-500"
                    />
                    <span className="truncate">
                      {item.lokasi_absen_mulai ?? "N/A"}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-orange-500"
                    />
                    <span className="truncate">
                      {item.lokasi_absen_selesai ?? "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {isLate && (
                    <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600">
                      Terlambat {item.keterlambatan} menit
                    </span>
                  )}

                  {isForgotCheckout && (
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-700">
                      Absen pulang kosong
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
