import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faClock,
  faUserCheck,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatCustomDateTime, formatFullDate } from "../../../utils/dateUtils";
import {
  EmptyState,
  ErrorState,
  SearchBar,
  LoadingSpinner,
} from "../../../components";

const STATUS_MAP = {
  0: {
    label: "Pending",
    chipClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    dotClass: "bg-amber-500",
  },
  1: {
    label: "Disetujui",
    chipClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    dotClass: "bg-emerald-500",
  },
  2: {
    label: "Ditolak",
    chipClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    dotClass: "bg-rose-500",
  },
};

export default function KunjunganTeknisi() {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const user = getUserFromToken();

  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchWithJwt(`${apiUrl}/trip/user/riwayat`);
        if (!res.ok) throw new Error("Gagal memuat data kunjungan");

        const json = await res.json();
        const sorted = [...(json.data || [])].sort(
          (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
        );

        setData(sorted);
      } catch (e) {
        setError(e.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiUrl, user?.id_user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;

    return data.filter((item) => {
      const text = `
        ${item.approved_by || ""}
        ${item.nama_lokasi || ""}
        ${item.total_jarak || ""}
        ${formatFullDate(item.tanggal) || ""}
      `
        .toLowerCase()
        .replace(/\s+/g, " ");

      return text.includes(q);
    });
  }, [data, query]);

  const summary = useMemo(() => {
    return {
      total: data.length,
      approved: data.filter((i) => i.status === 1).length,
      rejected: data.filter((i) => i.status === 2).length,
      pending: data.filter((i) => i.status === 0).length,
    };
  }, [data]);

  const toggleDropdown = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    return new Date(time).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDistance = (meter) => {
    if (meter == null || meter === "") return "0 m";
    const value = Number(meter);
    if (Number.isNaN(value)) return "-";

    return value >= 1000
      ? `${(value / 1000).toFixed(1)} km`
      : `${Math.round(value)} m`;
  };

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-3">
      {/* ================= SUMMARY ================= */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-3 py-3">
          <p className="text-[13px] font-semibold text-gray-800">
            Riwayat Kunjungan Teknisi
          </p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Ringkasan aktivitas kunjungan
          </p>
        </div>

        <div className="grid grid-cols-4 divide-x divide-gray-100 text-center">
          <div className="py-3">
            <p className="text-[15px] font-semibold text-gray-900">
              {summary.total}
            </p>
            <p className="text-[11px] text-gray-500">Total</p>
          </div>

          <div className="py-3">
            <p className="text-[15px] font-semibold text-amber-600">
              {summary.pending}
            </p>
            <p className="text-[11px] text-gray-500">Pending</p>
          </div>

          <div className="py-3">
            <p className="text-[15px] font-semibold text-emerald-600">
              {summary.approved}
            </p>
            <p className="text-[11px] text-gray-500">Disetujui</p>
          </div>

          <div className="py-3">
            <p className="text-[15px] font-semibold text-rose-600">
              {summary.rejected}
            </p>
            <p className="text-[11px] text-gray-500">Ditolak</p>
          </div>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <SearchBar
        value={query}
        onSearch={(input) => {
          const value =
            typeof input === "string" ? input : input?.target?.value || "";
          setQuery(value);
        }}
        placeholder="Cari riwayat kunjungan..."
      />

      {/* ================= LIST ================= */}
      <div className="pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState message="Belum ada riwayat kunjungan teknisi." />
        ) : (
          <div>
            {filtered.map((item, idx) => {
              const tanggal = formatFullDate(item.tanggal);
              const status = STATUS_MAP[item.status] || STATUS_MAP[0];
              const isOpen = openIndex === idx;

              const checkpoints =
                item.lokasi?.filter((l) => l.kategori === 2) || [];
              const isTripEnded = item.lokasi?.some((l) => l.kategori === 3);

              return (
                <div key={idx} className="relative mb-5">
                  <div className="rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
                    {/* header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800">
                          {tanggal}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                          <FontAwesomeIcon
                            icon={faUserCheck}
                            className="text-emerald-500"
                          />
                          <span className="truncate">
                            {item.approved_by || "-"} •{" "}
                            {formatCustomDateTime(item.approved_at)}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${status.chipClass}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* action */}
                    <button
                      onClick={() => toggleDropdown(idx)}
                      className="mt-3 flex w-full items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-left text-[11px] text-gray-600 transition hover:bg-gray-100 hover:text-emerald-600"
                    >
                      <span className="font-medium">
                        {isOpen
                          ? "Sembunyikan detail"
                          : "Lihat detail kunjungan"}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-medium tabular-nums">
                          {formatDistance(item.total_jarak)}
                        </span>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* detail */}
                    {isOpen && (
                      <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <FontAwesomeIcon
                            icon={faRoute}
                            className="text-gray-400"
                          />
                          <span>
                            {item.lokasi?.length || 0} titik perjalanan
                            {checkpoints.length > 0
                              ? ` • ${checkpoints.length} checkpoint`
                              : ""}
                            {isTripEnded ? " • selesai" : ""}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {item.lokasi?.map((lok, i) => {
                            const isLast = i === item.lokasi.length - 1;

                            return (
                              <div key={i} className="relative pl-5">
                                <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-gray-400 ring-4 ring-white" />
                                {!isLast && (
                                  <div className="absolute left-[5px] top-4 bottom-[-12px] w-px bg-gray-200" />
                                )}

                                <div className="space-y-1">
                                  <p className="text-[11px] font-semibold text-gray-800">
                                    {lok.nama_lokasi || "-"}
                                  </p>

                                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                    <FontAwesomeIcon
                                      icon={faClock}
                                      className="text-gray-400"
                                    />
                                    <span>
                                      {formatTime(lok.jam_mulai)} -{" "}
                                      {formatTime(lok.jam_selesai)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
