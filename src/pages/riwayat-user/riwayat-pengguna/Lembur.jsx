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

  // ✅ STATE DATE (INI YANG PENTING)
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ PAKAI startDate & endDate
        const res = await fetchWithJwt(
          `${apiUrl}/lembur/riwayat/user?startDate=${startDate}&endDate=${endDate}`
        );

        const json = res?.data ? res : await res.json();

        const rawData = Array.isArray(json?.data?.riwayat)
          ? json.data.riwayat
          : [];

        const sorted = [...rawData].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setSummary({
          totalOvertime: json?.data?.total_overtime ?? 0,
          totalHour: json?.data?.total_hour ?? 0,
          totalApproved: json?.data?.total_approved ?? 0,
          totalRejected: json?.data?.total_rejected ?? 0,
        });

        setData(sorted);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiUrl, user?.id_user, startDate, endDate]); // ✅ dependency

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return data;

    return data.filter((item) =>
      `${item.lokasi} ${formatFullDate(item.tanggal)}`
        .toLowerCase()
        .includes(q)
    );
  }, [data, query]);

  const handleSearch = (input) => {
    const value =
      typeof input === "string" ? input : input.target.value;
    setQuery(value);
  };

  function getDuration(start, end) {
    if (!start || !end) return "-";
    const h1 = parseInt(start.split(":")[0]);
    const h2 = parseInt(end.split(":")[0]);
    const diff = h2 - h1;
    return diff > 0 ? diff : "-";
  }

  const formatPeriod = (s, e) => {
    if (!s || !e) return "-";
    return `${formatFullDate(s)} - ${formatFullDate(e)}`;
  };

  const emptyMessage = query
    ? "Tidak ada data yang cocok."
    : "Belum ada riwayat lembur.";

  return (
    <div className="space-y-3">

      {/* ================= SUMMARY ================= */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

        <div className="px-3 py-3 border-b border-gray-100">
          <p className="text-[13px] font-semibold text-gray-800">
            Riwayat Lembur
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Periode {formatPeriod(startDate, endDate)}
          </p>
        </div>

        <div className="grid grid-cols-4 divide-x divide-y divide-gray-100 text-center">
          <div className="py-3">
            <p className="text-[15px] font-semibold text-gray-900">
              {summary.totalOvertime}
            </p>
            <p className="text-[11px] text-gray-500">Pengajuan</p>
          </div>

          <div className="py-3">
            <p className="text-[15px] font-semibold text-blue-600">
              {summary.totalHour}
            </p>
            <p className="text-[11px] text-gray-500">Jam</p>
          </div>

          <div className="py-3">
            <p className="text-[15px] font-semibold text-green-600">
              {summary.totalApproved}
            </p>
            <p className="text-[11px] text-gray-500">Disetujui</p>
          </div>

          <div className="py-3">
            <p className="text-[15px] font-semibold text-red-600">
              {summary.totalRejected}
            </p>
            <p className="text-[11px] text-gray-500">Ditolak</p>
          </div>
        </div>
      </div>

      {/* ================= FILTER ================= */}
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

      {/* ================= LIST ================= */}
      <div className="space-y-2 pb-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-8 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-500" />
              <p className="text-[12px] text-gray-500">
                Memuat data lembur...
              </p>
            </div>
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm"
            >
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-[12px] font-semibold text-gray-800">
                    {formatFullDate(item.tanggal)}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-1 text-green-500"
                    />
                    {item.lokasi || "-"}
                  </p>
                </div>

                <span
                  className={`text-[10px] px-2 py-1 rounded-md font-medium ${
                    item.status === 1
                      ? "bg-green-50 text-green-600"
                      : item.status === 2
                      ? "bg-red-50 text-red-600"
                      : "bg-yellow-50 text-yellow-600"
                  }`}
                >
                  {item.status === 1
                    ? "Disetujui"
                    : item.status === 2
                    ? "Ditolak"
                    : "Pending"}
                </span>
              </div>

              <div className="grid grid-cols-3 text-center text-[11px] mt-2">
                <div>
                  <p className="text-gray-400">Mulai</p>
                  <p className="font-semibold text-gray-800">
                    {item.jam_mulai?.slice(0, 5) || "--"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">Durasi</p>
                  <p className="font-semibold">
                    {getDuration(item.jam_mulai, item.jam_selesai)} jam
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">Selesai</p>
                  <p className="font-semibold text-gray-800">
                    {item.jam_selesai?.slice(0, 5) || "--"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}