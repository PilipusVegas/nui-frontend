import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCalendarAlt,
  faInfoCircle,
  faSpinner,
  faCircleInfo,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import {
  SectionHeader,
  LoadingSpinner,
  SearchBar,
  EmptyState,
  ErrorState,
  Pagination,
  Modal,
} from "../../../components";
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
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(
        err.message || "Terjadi kesalahan saat memuat data surat dinas"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item) => {
    setApprovingId(item.id);
    const isLuarKota = item.kategori === "2";

    const body = {
      status: 1,
      condition: {
        dinas: isLuarKota ? true : false,
      },
    };

    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Gagal menyetujui surat dinas");

      toast.success(
        isLuarKota
          ? `Surat dinas ${item.nama} disetujui (Luar Kota) ✈️`
          : `Surat dinas ${item.nama} disetujui ✅`
      );

      await fetchData();
    } catch (err) {
      console.error("Gagal menyetujui surat dinas:", err);
      toast.error(
        err.message || "Terjadi kesalahan saat menyetujui surat dinas"
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (item) => {
    setApprovingId(item.id);

    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 2 }),
      });

      if (!res.ok) throw new Error("Gagal menolak surat dinas");

      toast.success(`Surat dinas ${item.nama} ditolak ❌`);
      await fetchData();
    } catch (err) {
      console.error("Gagal menolak surat dinas:", err);
      toast.error(err.message || "Terjadi kesalahan saat menolak data");
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    setFilteredData(
      data.filter((item) =>
        (item.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setCurrentPage(1);
  }, [searchTerm, data]);

  const handleDetail = (item) => navigate(`/pengajuan-dinas/${item.id}`);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="w-full mx-auto">
      <SectionHeader
        title="Pengajuan Surat Dinas"
        subtitle="Menampilkan hanya pengajuan surat dinas yang ditujukan kepada Anda sebagai kepala divisi atau Tim HRD."
        onBack={() => navigate(-1)}
        actions={
          <button
            onClick={() => setShowInfoModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm shadow flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faCircleInfo} />
            Informasi
          </button>
        }
      />

      {/* FILTER BAR */}
      <div className="my-4">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">

          {/* SEARCH - FLEX GROW DI DESKTOP */}
          <div className="w-full lg:flex-1">
            <SearchBar
              onSearch={(val) => setSearchTerm(val)}
              placeholder="Cari nama..."
            />
          </div>

          {/* RIGHT SIDE: TANGGAL + BUTTON */}
          <div className="w-full lg:w-auto flex flex-col lg:flex-row gap-2">

            {/* RENTANG TANGGAL */}
            <div className="flex gap-2 w-full lg:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-2.5 text-sm w-full lg:w-40"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-2.5 text-sm w-full lg:w-40"
              />
            </div>

            {/* BUTTON PERIODE */}
            <button
              onClick={() => {
                const { start, end } = getDefaultPeriod();
                setStartDate(start);
                setEndDate(end);
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2.5 rounded-md text-sm shadow w-full lg:w-auto"
            >
              Periode Saat Ini
            </button>

          </div>
        </div>
      </div>


      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="hidden lg:block overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full text-sm bg-white border border-gray-200">
            <thead className="bg-green-500 text-white text-sm">
              <tr>
                <th className="px-4 py-3 text-center font-semibold">No.</th>
                <th className="px-4 py-3 text-center font-semibold">Tanggal & Jam Dinas</th>
                <th className="px-4 py-3 text-center font-semibold">Nama / Divisi</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Menu</th>
              </tr>
            </thead>

            <tbody>
              {/* JIKA ERROR */}
              {error && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <ErrorState message={error} onRetry={fetchData} />
                  </td>
                </tr>
              )}

              {/* JIKA TIDAK ERROR DAN DATA KOSONG */}
              {!error && currentItems.length === 0 && (
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

              {/* LIST DATA */}
              {!error &&
                currentItems.length > 0 &&
                currentItems.map((item, index) => {
                  const tglBerangkat = formatFullDate(item.tgl_berangkat);
                  const tglPulang = item.tgl_pulang ? formatFullDate(item.tgl_pulang) : null;
                  const jamBerangkat = item.waktu ? item.waktu.substring(0, 5) : "-";

                  return (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-green-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-center">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {tglPulang ? `${tglBerangkat} – ${tglPulang}` : tglBerangkat}
                          </span>
                          <span className="text-xs text-gray-600">
                            Jam Berangkat : {jamBerangkat}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-semibold capitalize">
                            {item.nama || "-"}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {item.divisi || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                          Pending
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col md:flex-row md:justify-center gap-2">

                          {/* APPROVE */}
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={approvingId === item.id}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition ${approvingId === item.id
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

                          {/* REJECT */}
                          <button
                            onClick={() => handleReject(item)}
                            disabled={approvingId === item.id}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition ${approvingId === item.id
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
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
                                <FontAwesomeIcon icon={faTimes} className="mr-1" />
                                Tolak
                              </>
                            )}
                          </button>

                          {/* DETAIL */}
                          <button
                            onClick={() => handleDetail(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow-sm transition"
                          >
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}


      {/* MOBILE CARD VIEW */}
      <div className="lg:hidden space-y-4 mt-4">
        {!error &&
          currentItems.length > 0 &&
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
                className="bg-white border border-gray-200 rounded-xl shadow-md p-4"
              >
                {/* STATUS */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">Tanggal Dinas</p>
                    <p className="font-semibold text-gray-800">
                      {tglPulang
                        ? `${tglBerangkat} – ${tglPulang}`
                        : tglBerangkat}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Jam Berangkat:{" "}
                      <span className="font-medium">{jamBerangkat}</span>
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow">
                    Pending
                  </span>
                </div>

                {/* NAMA + DIVISI */}
                <div className="mt-3">
                  <p className="font-bold text-gray-800 capitalize">
                    {item.nama || "-"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {item.divisi || "-"}
                  </p>
                </div>

                {/* ACTION BAR — SEJAJAR DI BAWAH KANAN */}
                <div className="mt-5 pt-4 border-t flex justify-end gap-2">

                  {/* APPROVE */}
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={approvingId === item.id}
                    className={`px-3 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-1 transition ${approvingId === item.id
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                  >
                    {approvingId === item.id ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faCheck} />
                    )}
                    <span>Setujui</span>
                  </button>

                  {/* REJECT */}
                  <button
                    onClick={() => handleReject(item)}
                    disabled={approvingId === item.id}
                    className={`px-3 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-1 transition ${approvingId === item.id
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                  >
                    {approvingId === item.id ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faTimes} />
                    )}
                    <span>Tolak</span>
                  </button>

                  {/* DETAIL */}
                  <button
                    onClick={() => handleDetail(item)}
                    className="px-3 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>Detail</span>
                  </button>

                </div>
              </div>
            );
          })}
      </div>


      {/* PAGINATION */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={(page) => setCurrentPage(page)} />
        </div>
      )}

      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Informasi Surat Dinas" note="Panduan singkat penggunaan halaman ini" size="md">
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">

          <p>
            Halaman <b>Pengajuan Surat Dinas</b> berfungsi untuk memantau, meninjau,
            dan memproses seluruh permohonan perjalanan dinas yang diajukan karyawan.
            Anda sebagai Kepala Divisi atau Tim HRD dapat melakukan pengecekan detail,
            validasi data, hingga memberikan keputusan langsung melalui halaman ini.
          </p>

          <ul className="list-disc list-inside space-y-1">
            <li>
              <b>Filter Periode:</b> Gunakan rentang tanggal untuk menampilkan data
              pengajuan pada periode tertentu. Tombol <i>Periode Saat Ini</i> membantu
              menampilkan pengajuan pada periode berjalan secara cepat.
            </li>

            <li>
              <b>Pencarian Nama Pegawai:</b> Ketik nama pada kolom pencarian untuk
              menemukan pengajuan dari pegawai tertentu dengan lebih efisien.
            </li>

            <li>
              <b>Detail Pengajuan:</b> Tekan tombol biru <i>Detail</i> untuk melihat
              informasi lengkap seperti tujuan perjalanan, tanggal berangkat–pulang,
              kategori dinas (Dalam/Luar Kota), dan alasan pengajuan.
            </li>

            <li>
              <b>Persetujuan:</b> Gunakan tombol hijau untuk menyetujui pengajuan yang
              telah diverifikasi. Untuk pengajuan kategori <b>Luar Kota</b>, sistem
              akan otomatis menandai bahwa karyawan berhak atas tunjangan dinas.
            </li>

            <li>
              <b>Penolakan:</b> Gunakan tombol merah jika pengajuan tidak memenuhi
              ketentuan atau membutuhkan revisi.
            </li>
          </ul>

          <p>
            Pastikan semua informasi sudah benar sebelum memberikan keputusan guna
            menjaga ketertiban administrasi dan akurasi data perjalanan dinas.
          </p>

        </div>
      </Modal>

    </div>
  );
};

export default SuratDinas;
