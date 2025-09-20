import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faCheck, faSearch, faCalendarAlt, } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { formatFullDate } from "../../utils/dateUtils";
import { SectionHeader, LoadingSpinner } from "../../components";

const SuratDinas = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const user = getUserFromToken();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /** ----------------- FETCH DATA ----------------- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas`);
      if (!res.ok) throw new Error("Gagal fetch");
      const result = await res.json();

      setData(result.data || []);
      setFilteredData(result.data || []);
      toast.success("Data surat dinas berhasil dimuat");
    } catch (err) {
      console.error("Gagal memuat data:", err);
      toast.error("Gagal memuat data surat dinas");
    } finally {
      setLoading(false);
    }
  };

  /** ----------------- APPROVE ----------------- */
  const handleApprove = async (item) => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1 }),
      });
      if (!res.ok) throw new Error("Response not OK");

      setData((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, status: 1 } : d))
      );
      setFilteredData((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, status: 1 } : d))
      );

      toast.success(`Surat dinas ${item.nama} disetujui ✅`);
    } catch (err) {
      console.error("Gagal menyetujui surat dinas:", err);
      toast.error("Terjadi kesalahan saat menyetujui surat dinas");
    }
  };

  /** ----------------- FILTERING ----------------- */
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredData(
      data
        .filter(item => item.status === 0) // hanya yang belum disetujui
        .filter(item => (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, data]);


  useEffect(() => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = data.filter((i) => {
      const t = new Date(i.tgl_berangkat);
      return t >= start && t <= end;
    });

    const lower = searchTerm.toLowerCase();
    setFilteredData(
      filtered.filter((i) => (i.nama || "").toLowerCase().includes(lower))
    );
  }, [startDate, endDate, searchTerm, data]);

  /** ----------------- UTIL ----------------- */
  const setCurrentPeriod = () => {
    const { start, end } = getDefaultPeriod();
    setStartDate(start);
    setEndDate(end);
    toast("Periode default diterapkan", { icon: "📅" });
  };

  const formatStatus = (status) =>
    status === 1
      ? { label: "Approved", color: "bg-green-600 text-white" }
      : { label: "Unapproved", color: "bg-gray-400 text-white" };

  const handleDetail = (item) => navigate(`/surat-dinas/${item.id}`);

  /** ----------------- RENDER ----------------- */
  return (
    <div className="w-full mx-auto">
      <SectionHeader
        title="Data Surat Dinas Keluar Kantor"
        subtitle="Daftar surat dinas yang telah diajukan dan diverifikasi"
        onBack={() => navigate(-1)}
        actions={
          <div className="flex flex-wrap items-end gap-6 w-full">
            {/* Rentang tanggal */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Dari</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>
              <span className="pb-2 text-gray-600">s/d</span>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium">Sampai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Tombol periode default */}
            <button
              onClick={setCurrentPeriod}
              className="ml-auto px-5 py-3 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm transition"
            >
              Periode Saat Ini
            </button>
          </div>
        }
      />

      {/* Search */}
      <div className="my-4 relative w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-500">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <input
          type="text"
          placeholder="Cari nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Loading & Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full text-sm bg-white">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-5 py-3 text-center">No.</th>
                <th className="px-5 py-3 text-center">Tanggal & Jam Dinas</th>
                <th className="px-5 py-3 text-center">Nama / Divisi</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Menu</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-5xl mb-2 text-gray-400"
                    />
                    <div className="font-semibold">
                      Tidak ada data pada rentang ini.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const status = formatStatus(item.status);
                  const tglBerangkat = formatFullDate(item.tgl_berangkat);
                  const tglPulang = item.tgl_pulang
                    ? formatFullDate(item.tgl_pulang)
                    : null;
                  const jamBerangkat = item.waktu
                    ? item.waktu.substring(0, 5)
                    : "-";

                  return (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-green-50 transition"
                    >
                      <td className="px-5 py-2 text-center">{index + 1}</td>

                      {/* Tanggal & Waktu */}
                      <td className="px-5 py-2">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {tglPulang
                              ? `${tglBerangkat} – ${tglPulang}`
                              : tglBerangkat}
                          </span>
                          <span className="text-sm text-gray-600 mt-1">
                            Jam Berangkat : {jamBerangkat}
                          </span>
                        </div>
                      </td>

                      {/* Nama & Divisi */}
                      <td className="px-5 py-2 text-center">
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-semibold capitalize">
                            {item.nama || "-"}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {item.divisi || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-2 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Menu */}
                      <td className="px-5 py-2 text-center space-x-3">
                        {item.status === 0 && item.id_kadiv === user.id && (
                          <button onClick={() => handleApprove(item)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition">
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                            Setujui
                          </button>
                        )}

                        <button onClick={() => handleDetail(item)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition">
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SuratDinas;