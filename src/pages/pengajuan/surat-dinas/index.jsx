import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faInfoCircle, faSpinner, faCircleInfo, faTimes, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import { SectionHeader, LoadingSpinner, SearchBar, EmptyState, ErrorState, Pagination, Modal, } from "../../../components";

const SuratDinas = () => {
  const itemsPerPage = 10;
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
      if (res.status === 404) {
        setData([]);
        return;
      }
      if (!res.ok) {
        throw new Error("Gagal memuat data surat dinas");
      }
      const result = await res.json();
      setData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan sistem");
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };


  const refreshData = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas`);
      if (res.status === 404) {
        setData([]);
        return;
      }
      if (!res.ok) {
        throw new Error("Gagal memuat data surat dinas");
      }
      const result = await res.json();
      setData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan sistem");
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

  const getKategoriDinas = (kategori) => {
    if (kategori === "1" || kategori === 1) return "Jabodetabek";
    if (kategori === "2" || kategori === 2) return "Luar Jabodetabek";
    return "-";
  };


  return (
    <div className="w-full mx-auto">
      <SectionHeader title="Pengajuan Surat Dinas" subtitle="Menampilkan pengajuan surat dinas yang ditujukan kepada Anda sebagai kepala divisi atau Tim HRD." onBack={() => navigate(-1)}
        actions={
          <button onClick={() => setShowInfoModal(true)} aria-label="Informasi Surat Dinas" title="Informasi Surat Dinas"
            className="bg-blue-500 hover:bg-blue-600 text-white shadow flex items-center justify-center gap-2 w-9 h-9 md:w-auto md:h-auto md:px-3 md:py-2 rounded-md text-sm"
          >
            <FontAwesomeIcon icon={faCircleInfo} />
            <span className="hidden md:inline">Informasi</span>
          </button>
        }
      />

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
                <th className="px-4 py-3 text-left font-semibold">Tanggal & Jam Berangkat</th>
                <th className="px-4 py-3 text-center font-semibold">Nama Karyawan / Divisi</th>
                <th className="px-4 py-3 text-center font-semibold min-w-[160px]"> Kategori Dinas</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Menu</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <ErrorState message={error} onRetry={fetchData} />
                  </td>
                </tr>
              )}
              {!error && currentItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <EmptyState icon={faCalendarAlt} title="Belum ada pengajuan" description="Tidak ada pengajuan surat dinas saat ini." />
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
                          <span className="font-medium text-xs">
                            {tglPulang ? `${tglBerangkat} – ${tglPulang}` : tglBerangkat}
                          </span>
                          <span className="text-xs text-gray-600">Jam Berangkat : {jamBerangkat}</span>
                        </div>
                      </td>

                      <td className="px-4 py-1.5 text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-semibold uppercase text-xs">{item.nama || "-"}</span>
                          <span className="text-xs text-gray-500 capitalize">{item.divisi || "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-1.5 text-center whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${item.kategori == 1 ? "bg-blue-100 text-blue-700 px-6" : "bg-purple-100 text-purple-700"}`}
                        >
                          {getKategoriDinas(item.kategori)}
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                          Pending
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-center">
                        <div className="flex flex-col md:flex-row md:justify-center gap-2">
                          <button onClick={() => handleDetail(item)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium shadow-sm transition">
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                            Detail
                          </button>
                          <button onClick={() => handleApprove(item)} className="px-3 py-1.5 rounded text-xs font-medium shadow-sm transition bg-green-600 hover:bg-green-700 text-white">
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                            Setujui
                          </button>
                          <button onClick={() => handleReject(item)} className="px-3 py-1.5 rounded text-xs font-medium shadow-sm transition bg-red-600 hover:bg-red-700 text-white">
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            Tolak
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
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                    ${item.kategori == 1 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                  >
                    {getKategoriDinas(item.kategori)}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 capitalize">
                    {item.nama || "-"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {item.divisi || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Tanggal Dinas</p>
                  <p className="font-semibold text-gray-800 text-[13px]">
                    {tglPulang ? `${tglBerangkat} – ${tglPulang}` : tglBerangkat}
                  </p>
                  <p className="text-sm text-gray-600">
                    Jam Berangkat: <span className="font-medium">{jamBerangkat}</span>
                  </p>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button onClick={() => handleDetail(item)} className="px-3 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <span>Detail</span>
                  </button>

                  <button onClick={() => handleApprove(item)} disabled={approvingId === item.id}
                    className={`px-3 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-1 transition
                    ${approvingId === item.id ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}
                  >
                    {approvingId === item.id ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />  : <FontAwesomeIcon icon={faCheck} />}
                    <span>Setujui</span>
                  </button>

                  <button onClick={() => handleReject(item)} disabled={approvingId === item.id}
                    className={`px-3 py-2 rounded-lg text-sm font-medium shadow flex items-center gap-1 transition
                    ${approvingId === item.id ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
                  >
                    {approvingId === item.id
                      ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      : <FontAwesomeIcon icon={faTimes} />
                    }
                    <span>Tolak</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>


      {!loading && !error && filteredData.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={(page) => setCurrentPage(page)} />
        </div>
      )}

      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Informasi Pengajuan Surat Dinas" note="Panduan penggunaan halaman pengajuan surat dinas" size="lg">
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">

          <p>
            Halaman <b>Pengajuan Surat Dinas</b> digunakan untuk meninjau dan memproses
            pengajuan perjalanan dinas karyawan. Halaman ini membantu Kepala Divisi dan
            Tim HRD dalam melakukan verifikasi serta pengambilan keputusan secara tepat.
          </p>

          <div className="space-y-2">
            <p className="font-semibold text-gray-800">Kategori Dinas</p>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-3 w-3 rounded-full bg-blue-500"></span>
                <div>
                  <b>Jabodetabek</b> — Perjalanan dinas dalam wilayah Jabodetabek dan
                  <b> tidak mendapatkan tunjangan perjalanan dinas</b>.
                </div>
              </li>

              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-3 w-6 rounded-full bg-purple-500"></span>
                <div>
                  <b>Luar Jabodetabek</b> — Perjalanan dinas di luar wilayah Jabodetabek dan
                  <b> secara otomatis berhak mendapatkan tunjangan perjalanan dinas</b>.
                  Pastikan karyawan sudah ditandai sebagai yang berhak mendapatkan tunjangan
                  melalui fitur <b>Tunjangan Karyawan</b>.
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="mt-1 text-blue-500" />
              <div>
                <b>Pencarian:</b> Gunakan kolom pencarian untuk menemukan pengajuan
                berdasarkan nama karyawan.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="mt-1 text-blue-600" />
              <div>
                <b>Detail:</b> Tombol <span className="font-medium text-blue-600">Detail </span>
                digunakan untuk melihat informasi lengkap pengajuan.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCheck} className="mt-1 text-green-600" />
              <div>
                <b>Setujui:</b> Menyetujui pengajuan yang telah diverifikasi dengan benar.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FontAwesomeIcon icon={faTimes} className="mt-1 text-red-600" />
              <div>
                <b>Tolak:</b> Menolak pengajuan yang tidak sesuai atau memerlukan perbaikan.
              </div>
            </div>
          </div>

          <p className="pt-2">
            Pastikan seluruh informasi sudah sesuai sebelum memberikan keputusan
            untuk menjaga akurasi data dan ketertiban administrasi.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default SuratDinas;
