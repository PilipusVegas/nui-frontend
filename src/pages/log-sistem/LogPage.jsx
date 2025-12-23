import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader } from "../../components";
import LogTabs from "./LogTabs";
import LogCard from "./LogCard";
import LogSkeleton from "./LogSkeleton";

const TABS = ["ALL", "ABSENSI", "TUGAS", "PROFIL"];
const PAGE_SIZE = 50;

const LogPage = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [allLogs, setAllLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const endpoint = startDate && endDate ? `/log/date?startDate=${startDate}&endDate=${endDate}` : `/log`;
      const res = await fetchWithJwt(`${apiUrl}${endpoint}`);
      const json = res instanceof Response ? await res.json() : res;
      setAllLogs(Array.isArray(json?.data) ? json.data : []);
      setPage(1);
    } catch (err) {
      console.error("Gagal memuat log sistem:", err);
      setAllLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [startDate, endDate]);

  const filteredLogs = useMemo(() => {
    if (activeTab === "ALL") return allLogs;
    return allLogs.filter((l) => l.feature === activeTab);
  }, [allLogs, activeTab]);

  const visibleLogs = useMemo(() => {
    return filteredLogs.slice(0, page * PAGE_SIZE);
  }, [filteredLogs, page]);

  const hasMore = visibleLogs.length < filteredLogs.length;

  return (
    <div className="space-y-4">
      <SectionHeader title="Log Sistem" subtitle="Riwayat aktivitas pengguna dan sistem" onBack={() => navigate("/home")}/>
      <div className="w-full bg-white border rounded-xl px-4 py-3 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-medium text-gray-700">
          Rentang Tanggal
        </div>
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:w-auto">
          <input type="date" className="input input-sm w-full sm:w-[160px] min-w-0" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
          <span className="hidden sm:inline text-gray-400 text-sm">
            –
          </span>
          <input type="date" className="input input-sm w-full sm:w-[160px] min-w-0" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
        </div>
      </div>
      <LogTabs tabs={TABS} active={activeTab} onChange={(tab) => { setActiveTab(tab); setPage(1);}}/>
      <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto overscroll-contain scrollbar-green pr-1">
        {visibleLogs.map((log) => (
          <LogCard key={log.id} log={log} />
        ))}
        {loading && <LogSkeleton />}
        {!loading && visibleLogs.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            Tidak ada log pada rentang atau kategori ini.
          </p>
        )}
        {hasMore && !loading && (
          <button onClick={() => setPage((p) => p + 1)} className="w-full py-2 text-sm font-medium text-green-600 hover:underline">
            Muat lebih banyak
          </button>
        )}
      </div>
    </div>
  );
};

export default LogPage;
