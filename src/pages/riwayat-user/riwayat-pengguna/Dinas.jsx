import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCity } from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";

import {
  EmptyState,
  ErrorState,
  SearchBar,
  DateRangeField,
} from "../../../components";

export default function RiwayatDinas() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const { start, end } = getDefaultPeriod();

  // ✅ DATE STATE (WAJIB)
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");

  const [summary, setSummary] = useState({
    total_office_leave: 0,
    total_approved: 0,
    total_rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchWithJwt(
          `${apiUrl}/surat-dinas/riwayat/user?startDate=${startDate}&endDate=${endDate}`,
        );

        if (res.status === 404) {
          setData([]);
          setSummary({
            total_office_leave: 0,
            total_approved: 0,
            total_rejected: 0,
          });
          return;
        }

        if (res.status >= 500) {
          throw new Error("Terjadi kesalahan server");
        }

        const json = res?.data ? res : await res.json();

        const rawData = Array.isArray(json?.data?.riwayat)
          ? json.data.riwayat
          : [];

        const sorted = [...rawData].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        setData(sorted);

        setSummary({
          total_office_leave: json?.data?.total_office_leave || 0,
          total_approved: json?.data?.total_approved || 0,
          total_rejected: json?.data?.total_rejected || 0,
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiUrl, startDate, endDate]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return data;

    return data.filter((item) =>
      `${item.keterangan} ${formatFullDate(item.tgl_berangkat)}`
        .toLowerCase()
        .includes(q),
    );
  }, [data, query]);

  const formatPeriod = (s, e) => {
    if (!s || !e) return "-";
    return `${formatFullDate(s)} - ${formatFullDate(e)}`;
  };

  const emptyMessage = query
    ? "Tidak ada data yang cocok."
    : "Belum ada riwayat surat dinas.";

  const getKategoriDinas = (kategori) => {
    if (kategori == 1) return "Jabodetabek";
    if (kategori == 2) return "Jawa & Bali";
    if (kategori == 3) return "Luar Jawa & Bali";
    return "-";
  };

  return (
    <div className="space-y-3">
      {/* Summary Mini */}
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-800">
              Riwayat Surat Dinas
            </p>

            <p className="truncate text-[9px] text-gray-600">
              {formatPeriod(startDate, endDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[13px] font-bold leading-none text-gray-900">
              {summary.total_office_leave}
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-gray-500">Total Pengajuan</p>
          </div>

          <div className="border-l border-gray-100 pl-2">
            <p className="text-[13px] font-bold leading-none text-green-600">
              {summary.total_approved}
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-gray-500">
              Disetujui
            </p>
          </div>

          <div className="border-l border-gray-100 pl-2">
            <p className="text-[13px] font-bold leading-none text-red-600">
              {summary.total_rejected}
            </p>

            <p className="mt-0.5 text-[9px] font-medium text-gray-500">
              Ditolak
            </p>
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
          onSearch={setQuery}
          placeholder="Cari riwayat surat dinas..."
        />
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-2 pb-4">
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-8 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-500" />
              <p className="text-[12px] text-gray-500">
                Memuat data surat dinas...
              </p>
            </div>
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          filtered.map((item) => {
            const statusText =
              item.status === 1
                ? "Disetujui"
                : item.status === 2
                  ? "Ditolak"
                  : "Pending";

            const statusStyle =
              item.status === 1
                ? "bg-green-50 text-green-600"
                : item.status === 2
                  ? "bg-red-50 text-red-600"
                  : "bg-yellow-50 text-yellow-600";

            const isAreaA = item.kategori == 1;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-[11px] text-gray-400">
                      Tanggal Pengajuan
                    </p>
                    <p className="text-[12px] font-semibold text-gray-800">
                      {formatFullDate(item.created_at)}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-1 rounded-md font-medium ${statusStyle}`}
                  >
                    {statusText}
                  </span>
                </div>

                {/* Kategori */}
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 font-medium">
                    <FontAwesomeIcon icon={faCity} />
                    {getKategoriDinas(item.kategori)}
                  </span>
                </div>

                {/* Tanggal */}
                <div className="grid grid-cols-2 text-[11px] mt-2">
                  <div>
                    <p className="text-gray-400">Berangkat</p>
                    <p className="font-semibold text-gray-800">
                      {formatFullDate(item.tgl_berangkat) || "-"}
                    </p>
                  </div>

                  {!isAreaA && (
                    <div className="text-right">
                      <p className="text-gray-400">Pulang</p>
                      <p className="font-semibold text-gray-800">
                        {formatFullDate(item.tgl_pulang) || "-"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Keterangan */}
                {item.keterangan && (
                  <div className="mt-2 text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2 py-2">
                    {item.keterangan}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
