import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faInfoCircle,
  faSpinner,
  faCircleInfo,
  faTimes,
  faCalendarAlt,
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

const SuratDinas = () => {
  const itemsPerPage = 10;
  const user = getUserFromToken();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas`);
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

  const refreshData = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas`);
      if (!res.ok) throw new Error("Gagal memuat data surat dinas");
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat memuat data surat dinas");
    }
  };

  const handleApprove = async (item) => {
    setApprovingId(item.id);

    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1 }),
      });

      if (!res.ok) throw new Error("Gagal menyetujui surat dinas");

      // Update data lokal agar tidak refetch
      setData(prev =>
        prev.map(d => (d.id === item.id ? { ...d, status: 1 } : d))
      );

      toast.success(`Surat dinas ${item.nama} disetujui`);
      await refreshData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat menyetujui surat dinas");
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

      // Update data lokal
      setData(prev =>
        prev.map(d => (d.id === item.id ? { ...d, status: 2 } : d))
      );

      toast.success(`Surat dinas ${item.nama} ditolak`);
      await refreshData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat menolak surat dinas");
    } finally {
      setApprovingId(null);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

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
      <SectionHeader title="Pengajuan Surat Dinas" subtitle="Menampilkan pengajuan surat dinas yang ditujukan kepada Anda sebagai kepala divisi atau Tim HRD." onBack={() => navigate(-1)}
        actions={
          <button onClick={() => setShowInfoModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm shadow flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleInfo} />
            Informasi
          </button>
        }
      />

      {/* SEARCH BAR */}
      <div className="my-4 w-full">
        <SearchBar onSearch={(val) => setSearchTerm(val)} placeholder="Cari nama..." />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="hidden lg:block overflow-x-auto rounded-xl shadow-md">
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
              {error && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <ErrorState message={error} onRetry={fetchData} />
                  </td>
                </tr>
              )}
              {!error && currentItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <EmptyState
                      icon={faCalendarAlt}
                      title="Belum ada pengajuan"
                      description="Tidak ada pengajuan surat dinas saat ini."
                    />
                  </td>
                </tr>
              )}
              {!error &&
                currentItems.length > 0 &&
                currentItems.map((item, index) => {
                  const tglBerangkat = formatFullDate(item.tgl_berangkat);
                  const tglPulang = item.tgl_pulang
                    ? formatFullDate(item.tgl_pulang)
                    : null;
                  const jamBerangkat = item.waktu ? item.waktu.substring(0, 5) : "-";

                  return (
                    <tr key={item.id} className="border-b hover:bg-green-50 transition-colors">
                      <td className="px-4 py-1.5 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-1.5">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {tglPulang ? `${tglBerangkat} – ${tglPulang}` : tglBerangkat}
                          </span>
                          <span className="text-xs text-gray-600">Jam Berangkat : {jamBerangkat}</span>
                        </div>
                      </td>
                      <td className="px-4 py-1.5 text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-semibold capitalize">{item.nama || "-"}</span>
                          <span className="text-xs text-gray-500 capitalize">{item.divisi || "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-1.5 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                          Pending
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-center">
                        <div className="flex flex-col md:flex-row md:justify-center gap-2">
                          {/* Tombol Setujui */}
                          <button onClick={() => handleApprove(item)} className="px-3 py-1.5 rounded text-xs font-medium shadow-sm transition bg-green-600 hover:bg-green-700 text-white">
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                            Setujui
                          </button>

                          {/* Tombol Tolak */}
                          <button onClick={() => handleReject(item)} className="px-3 py-1.5 rounded text-xs font-medium shadow-sm transition bg-red-600 hover:bg-red-700 text-white">
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Tolak
                          </button>

                          {/* Tombol Detail */}
                          <button onClick={() => handleDetail(item)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm transition">
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
            const tglPulang = item.tgl_pulang ? formatFullDate(item.tgl_pulang) : null;
            const jamBerangkat = item.waktu ? item.waktu.substring(0, 5) : "-";

            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">Tanggal Dinas</p>
                    <p className="font-semibold text-gray-800">
                      {tglPulang ? `${tglBerangkat} – ${tglPulang}` : tglBerangkat}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Jam Berangkat: <span className="font-medium">{jamBerangkat}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow">
                    Pending
                  </span>
                </div>
                <div className="mt-3">
                  <p className="font-bold text-gray-800 capitalize">{item.nama || "-"}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.divisi || "-"}</p>
                </div>
                <div className="mt-5 pt-4 border-t flex justify-end gap-2">
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={approvingId === item.id}
                    className={`px-3 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-1 transition ${approvingId === item.id ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                  >
                    {approvingId === item.id ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faCheck} />}
                    <span>Setujui</span>
                  </button>
                  <button onClick={() => handleReject(item)} disabled={approvingId === item.id} className={`px-3 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-1 transition ${approvingId === item.id ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}>
                    {approvingId === item.id ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faTimes} />}
                    <span>Tolak</span>
                  </button>
                  <button onClick={() => handleDetail(item)} className="px-3 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white transition">
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

      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Informasi Surat Dinas"
        note="Panduan singkat penggunaan halaman ini"
        size="md"
      >
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Halaman <b>Pengajuan Surat Dinas</b> digunakan untuk memantau, meninjau, dan
            memproses semua permohonan perjalanan dinas dari karyawan. Sebagai Kepala
            Divisi atau Tim HRD, Anda dapat melihat detail, memvalidasi, dan memberikan
            keputusan secara langsung melalui halaman ini.
          </p>

          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="mt-1 text-blue-500" />
              <div>
                <b>Pencarian Nama Pegawai:</b> Ketik nama karyawan pada kolom pencarian untuk
                menemukan pengajuan dengan cepat dan efisien.
              </div>
            </li>

            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="mt-1 text-indigo-500" />
              <div>
                <b>Detail Pengajuan:</b> Tekan tombol <span className="font-medium text-blue-600"> Detail </span>
                untuk melihat informasi lengkap, termasuk tujuan perjalanan, tanggal berangkat–
                pulang, kategori dinas (Dalam/Luar Kota), dan alasan pengajuan.
              </div>
            </li>

            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCheck} className="mt-1 text-green-500" />
              <div>
                <b>Persetujuan:</b> Gunakan tombol hijau <span className="font-medium">Setujui</span>
                untuk menyetujui pengajuan yang telah diverifikasi. Pengajuan kategori
                <b>Luar Kota</b> otomatis menandai karyawan berhak atas tunjangan dinas.
              </div>
            </li>

            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faTimes} className="mt-1 text-red-500" />
              <div>
                <b>Penolakan:</b> Gunakan tombol merah <span className="font-medium">Tolak</span>
                jika pengajuan tidak memenuhi ketentuan atau memerlukan revisi.
              </div>
            </li>
          </ul>

          <p>
            Pastikan semua informasi sudah benar sebelum memberikan keputusan untuk menjaga
            ketertiban administrasi dan memastikan akurasi data perjalanan dinas.
          </p>
        </div>
      </Modal>

    </div>
  );
};

export default SuratDinas;
