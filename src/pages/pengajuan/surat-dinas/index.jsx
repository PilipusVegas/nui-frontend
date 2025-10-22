import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCalendarAlt, faInfoCircle, faSpinner, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import { SectionHeader, LoadingSpinner, SearchBar, EmptyState, ErrorState, Pagination, Modal } from "../../../components";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";

const SuratDinas = () => {
  const itemsPerPage = 10;
  const user = getUserFromToken();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const { start, end } = getDefaultPeriod();
  const [endDate, setEndDate] = useState(end);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [startDate, setStartDate] = useState(start);
  const [showInfoModal, setShowInfoModal] = useState(false);

  /** ----------------- FETCH DATA ----------------- */
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithJwt(
        `${apiUrl}/surat-dinas?startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) throw new Error("Gagal memuat data surat dinas");

      const result = await res.json();
      setData(result.data || []);
      // ✅ tidak ada toast success, cukup update state
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(err.message || "Terjadi kesalahan saat memuat data surat dinas");
    } finally {
      setLoading(false);
    }
  };
  /** ----------------- APPROVE ----------------- */
  const handleApprove = async (item) => {
    setApprovingId(item.id); // tandai tombol yang sedang diproses
    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1 }),
      });
      if (!res.ok) throw new Error("Gagal menyetujui surat dinas");

      toast.success(`Surat dinas ${item.nama} disetujui ✅`);

      // reload data biar update otomatis
      await fetchData();
    } catch (err) {
      console.error("Gagal menyetujui surat dinas:", err);
      toast.error(err.message || "Terjadi kesalahan saat menyetujui surat dinas");
    } finally {
      setApprovingId(null); // reset
    }
  };

  /** ----------------- FILTERING ----------------- */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [startDate, endDate]);

  useEffect(() => {
    setFilteredData(
      data.filter((item) =>
        (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setCurrentPage(1); // reset halaman tiap search
  }, [searchTerm, data]);

  const handleDetail = (item) => navigate(`/pengajuan-dinas/${item.id}`);

  // pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="w-full mx-auto">
      <SectionHeader title="Pengajuan Surat Dinas" subtitle="Menampilkan hanya pengajuan surat dinas yang ditujukan kepada Anda sebagai kepala divisi atau Tim HRD." onBack={() => navigate(-1)}
        actions={
          <button onClick={() => setShowInfoModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm shadow flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleInfo} />
            Informasi
          </button>
        }
      />

      {/* Search + Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 my-4">
        <SearchBar
          onSearch={(val) => setSearchTerm(val)}
          placeholder="Cari nama..."
        />


        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-md px-2 py-2.5 text-sm" />
          <span>-</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-md px-2 py-2.5 text-sm" />

          <button onClick={() => {
            const { start, end } = getDefaultPeriod();
            setStartDate(start);
            setEndDate(end);
          }}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2.5 rounded-md text-sm shadow"
          >
            Periode Saat Ini
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* ✅ Tampilan Desktop (Tabel) */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full text-sm bg-white">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="px-5 py-3 text-center">No.</th>
                  <th className="px-5 py-3 text-center">Tanggal & Jam Dinas</th>
                  <th className="px-5 py-3 text-center">Nama / Divisi</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Menu</th>
                </tr>
              </thead>
              <tbody>
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <ErrorState message={error} onRetry={fetchData} />
                    </td>
                  </tr>
                )}

                {!loading && !error && currentItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <EmptyState
                        icon={faCalendarAlt}
                        title="Belum ada pengajuan"
                        description="Tidak ada pengajuan surat dinas dalam periode ini."
                      />
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  currentItems.length > 0 &&
                  currentItems.map((item, index) => {
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
                        <td className="px-5 py-1 text-center">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-5 py-1">
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
                        <td className="px-5 py-1 text-center">
                          <div className="flex flex-col items-center md:items-start">
                            <span className="font-semibold capitalize">
                              {item.nama || "-"}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {item.divisi || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-1 text-center">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-white">
                            Pending
                          </span>
                        </td>
                        <td className="px-5 py-1 text-center space-x-3">
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={approvingId === item.id}
                            className={`px-4 py-1 rounded-md text-sm font-medium shadow-sm transition  
                        ${approvingId === item.id
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                          >
                            {approvingId === item.id ? (
                              <span className="flex items-center justify-center">
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="mr-1 animate-spin"
                                />
                                Menyimpan...
                              </span>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                Setujui
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDetail(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm transition"
                          >
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* ✅ Tampilan Mobile (Card List) */}
          <div className="md:hidden space-y-3">
            {currentItems.length === 0 && !loading && !error ? (
              <EmptyState
                icon={faCalendarAlt}
                title="Belum ada pengajuan"
                description="Tidak ada pengajuan surat dinas dalam periode ini."
              />
            ) : (
              currentItems.map((item) => {
                const tglBerangkat = formatFullDate(item.tgl_berangkat);
                const tglPulang = item.tgl_pulang
                  ? formatFullDate(item.tgl_pulang)
                  : null;
                const jamBerangkat = item.waktu
                  ? item.waktu.substring(0, 5)
                  : "-";

                return (
                  <div
                    key={item.id}
                    className="bg-white shadow-sm rounded-xl border border-gray-100 p-3 transition hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-semibold text-sm capitalize text-gray-800">
                          {item.nama || "-"}
                        </h2>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.divisi || "-"}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-500 text-white font-medium">
                        Pending
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-700">
                      <p>
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-1 text-green-600"
                        />
                        {tglPulang
                          ? `${tglBerangkat} – ${tglPulang}`
                          : tglBerangkat}
                      </p>
                      <p className="mt-1">
                        Jam Berangkat:{" "}
                        <span className="font-medium">{jamBerangkat}</span>
                      </p>
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={approvingId === item.id}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium shadow-sm transition  
                    ${approvingId === item.id
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                      >
                        {approvingId === item.id ? (
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faCheck} />
                        )}
                        {approvingId === item.id ? "Menyimpan..." : "Setujui"}
                      </button>

                      <button
                        onClick={() => handleDetail(item)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-medium shadow-sm transition"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Detail
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={(page) => setCurrentPage(page)} />
        </div>
      )}

      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Informasi Surat Dinas" note="Panduan singkat penggunaan halaman ini" size="md">
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Halaman <b>Pengajuan Surat Dinas</b> digunakan untuk memantau dan mengelola pengajuan perjalanan dinas
            yang ditujukan kepada Anda sebagai Kepala Divisi atau Tim HRD.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><b>Filter Periode:</b> Pilih rentang tanggal atau gunakan tombol <i>Periode Saat Ini</i> untuk menampilkan data sesuai bulan berjalan.</li>
            <li><b>Pencarian:</b> Gunakan kolom pencarian untuk menemukan pegawai berdasarkan nama.</li>
            <li><b>Setujui:</b> Klik tombol <span className="text-green-600 font-semibold">Setujui</span> untuk menyetujui pengajuan yang valid.</li>
            <li><b>Detail:</b> Tekan tombol <span className="text-blue-600 font-semibold">Detail</span> untuk melihat informasi lengkap sebelum mengambil keputusan.</li>
          </ul>
          <p className="text-xs text-gray-500 italic">
            *Status pengajuan yang sudah disetujui akan otomatis diperbarui pada tabel.
          </p>
        </div>
      </Modal>

    </div>
  );
};

export default SuratDinas;