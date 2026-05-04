import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faLocationDot,
  faUserCheck,
  faMapLocation,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import {
  SectionHeader,
  Pagination,
  LoadingSpinner,
  ErrorState,
  EmptyState,
  DateRangeField,
  SearchBar,
} from "../../components";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";

const BantuanCheckout = () => {
  const defaultPeriod = getDefaultPeriod();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(defaultPeriod.start);
  const [endDate, setEndDate] = useState(defaultPeriod.end);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 7;
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithJwt(
          `${apiUrl}/trip/log?startDate=${startDate}&endDate=${endDate}`,
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);

        const json = await res.json();
        setLogs(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error("Gagal memuat logs:", err);
        setError("Gagal memuat log update checkout.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    setCurrentPage(1);
  }, [apiUrl, startDate, endDate]);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.nama_user?.toLowerCase().includes(term) ||
      log.nama_editor?.toLowerCase().includes(term) ||
      log.lokasi?.toLowerCase().includes(term)
    );
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="w-full mx-auto">
      <SectionHeader title="List Update Checkout" subtitle="Menampilkan data checkout kunjungan yang dibantu kepala divisi akibat anggota lupa checkout." onBack={() => navigate("/")}/>

      {/* FILTER BAR */}
      <div className="mt-4 mb-4">
        <div className="flex flex-col justify-end gap-3 md:flex-row md:items-center">
          {/* SEARCH */}
          <SearchBar placeholder="Cari nama anggota, editor, atau lokasi..."
            onSearch={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
            className="w-full md:flex-1"
          />

          {/* DATE RANGE */}
          <DateRangeField
            startDate={startDate}
            endDate={endDate}
            onChangeStart={(value) => {
              setStartDate(value);
              setCurrentPage(1);
            }}
            onChangeEnd={(value) => {
              setEndDate(value);
              setCurrentPage(1);
            }}
            className="w-full md:w-auto"
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading && (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" text="Memuat logs..." />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={() => {}} />}
      {!loading && !error && filteredLogs.length === 0 && (
        <EmptyState message="Belum ada update checkout." />
      )}

      {!loading && !error && currentLogs.length > 0 && (
        <div className="space-y-2">
          {currentLogs.map((log) => (
            <div
              key={log.id}
              className="
        group rounded-xl border border-slate-200 bg-white
        px-4 py-3 shadow-sm transition-all duration-200
        hover:border-slate-300 hover:shadow-md
      "
            >
              <div className="flex items-start gap-3">
                {/* ICON */}
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <FontAwesomeIcon icon={faClock} className="text-[13px]" />
                </div>

                {/* CONTENT */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    {/* MAIN TEXT */}
                    <div className="min-w-0">
                      <p className="text-sm leading-relaxed text-slate-800">
                        <span className="font-semibold text-slate-950">
                          {log.nama_editor}
                        </span>{" "}
                        membantu checkout untuk{" "}
                        <span className="font-semibold text-slate-950">
                          {log.nama_user}
                        </span>
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-xs text-emerald-600">
                        <FontAwesomeIcon
                          icon={faMapLocation}
                          className="text-[10px]"
                        />
                        <span className="truncate">{log.lokasi}</span>
                      </div>
                    </div>

                    {/* TIME */}
                    <div className="flex shrink-0 items-center gap-2 text-xs text-slate-700 sm:pl-4">
                      <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                      <span className="whitespace-nowrap">
                        {formatDate(log.jam_selesai)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredLogs.length > itemsPerPage && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default BantuanCheckout;
