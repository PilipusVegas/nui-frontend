import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { formatFullDate } from "../../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { faCheck, faInfoCircle, faTimes, faHistory } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal, LoadingSpinner, ErrorState, EmptyState, SearchBar, Pagination } from "../../../components";

const PersetujuanLembur = () => {
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [endDate, setEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [approvalData, setApprovalData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalDescription, setModalDescription] = useState("");

  const paginatedData = (() => {
    const filtered = approvalData.filter((a) =>
      a.nama_user.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      total: filtered.length,
      data: filtered.slice(startIndex, startIndex + itemsPerPage),
    };
  })();

  const fetchApprovalData = async (s = startDate, e = endDate) => {
    if (!s || !e) return;
    try {
      setIsLoading(true);
      setErrorMessage("");
      const qs = `?startDate=${s}&endDate=${e}`;
      const res = await fetchWithJwt(`${apiUrl}/lembur/approve${qs}`);
      if (!res.ok) throw new Error("Gagal mengambil data.");
      const result = await res.json();
      if (Array.isArray(result.data)) {
        setApprovalData(result.data);
      } else {
        setErrorMessage("Format respons tidak sesuai, mungkin sebagian data hilang.");
        setApprovalData(result.data || []);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { start, end } = getDefaultPeriod();
    setStartDate(start);
    setEndDate(end);
    fetchApprovalData(start, end);
  }, [apiUrl]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchApprovalData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const handleUseDefaultPeriod = () => {
    const { start, end } = getDefaultPeriod();
    setStartDate(start);
    setEndDate(end);
    fetchApprovalData(start, end);
  };

  const openModalWithDescription = (desc) => {
    setModalDescription(desc);
    setIsModalOpen(true);
  };

const handleUpdateStatus = async (item, status) => {
  try {
    let endpoint = "";
    let body = {};

    if (item.id_absen) {
      endpoint = `${apiUrl}/lembur/approve-kantor/${item.id_absen}`;
      body = { status, deskripsi: item.deskripsi || "" };
    } else if (item.id_lembur) {
      endpoint = `${apiUrl}/lembur/approve/${item.id_lembur}`;

      // Kondisi lembur
      const isLemburValid =
        item.total_lembur > 5 && ![63, 64, 66].includes(item.id_lokasi);
      body = {
        status,
        condition: { lembur: isLemburValid },
      };
    } else {
      throw new Error("Data lembur tidak valid.");
    }

    const res = await fetchWithJwt(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Gagal memperbarui status.");

    // Tampilkan notifikasi sesuai kondisi
    if (status === 1) {
      if (item.total_lembur > 5 && ![63, 64, 66].includes(item.id_lokasi)) {
        Swal.fire({
          icon: "success",
          title: "Selamat!",
          text: "Karyawan ini akan mendapatkan tunjangan lembur.",
        });
      } else {
        toast.success("Pengajuan lembur berhasil disetujui.");
      }
    } else if (status === 2) {
      toast.error("Pengajuan lembur ditolak.");
    }

    fetchApprovalData(startDate, endDate);
  } catch (err) {
    setErrorMessage(err.message);
    toast.error(err.message);
  }
};


  const handleApprove = (item) => handleUpdateStatus(item, 1);
  const handleReject = (item) => handleUpdateStatus(item, 2);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  return (
    <div className="flex flex-col">
      <SectionHeader title="Pengajuan Lembur" subtitle="Daftar pengajuan lembur berdasarkan periode" onBack={() => navigate("/home")}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/riwayat-lembur")} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium">
              <FontAwesomeIcon icon={faHistory} />
              <span className="sm:inline hidden">Lihat Riwayat</span>
            </button>

            <button onClick={() => setIsInfoModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
              <FontAwesomeIcon icon={faInfoCircle} />
              <span className="sm:inline hidden">Informasi</span>
            </button>
          </div>
        }
      />


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full mb-4">
        <div className="w-full sm:flex-1">
          <SearchBar value={searchQuery} onSearch={(val) => setSearchQuery(val)} placeholder="Cari Nama Karyawan..." className="w-full" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
            <span className="font-medium">-</span>
            <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
          </div>

          <button onClick={handleUseDefaultPeriod} className="px-4 py-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600">
            Periode Saat Ini
          </button>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-green-500 text-white text-xs md:text-sm uppercase tracking-wider">
                {["No.", "Tanggal & Lokasi", "Nama Karyawan", "Waktu Lembur & Total", "Detail", "Menu",].map((h) => (
                  <th key={h} className="py-3 px-5 text-center font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <ErrorState message={errorMessage} onRetry={() => fetchApprovalData(startDate, endDate)} />
                  </td>
                </tr>
              ) : paginatedData.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <EmptyState title="Tidak ada pengajuan lembur" description="Belum ada pengajuan lembur untuk periode ini." />
                  </td>
                </tr>
              ) : (
                paginatedData.data.map((a, i) => {
                  const start = new Date(`1970-01-01T${a.jam_mulai}`);
                  const end = new Date(`1970-01-01T${a.jam_selesai}`);
                  const duration = ((end - start) / 1000 / 60).toFixed(0);
                  const hours = Math.floor(duration / 60);
                  const idx = (currentPage - 1) * itemsPerPage + i + 1;

                  return (
                    <tr key={a.id_lembur} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-5 text-center font-medium">
                        {idx}
                      </td>
                      <td className="py-2.5 px-5">
                        <div className="font-medium"> {formatFullDate(a.tanggal)}</div>
                        <div className="text-gray-500 text-xs mt-0.5"> {a.lokasi}</div>
                      </td>
                      <td className="py-2.5 px-5">
                        <div className="font-medium"> {(a.nama_user)}</div>
                        <div className="text-gray-500 text-xs mt-0.5"> {a.role}</div>
                      </td>
                      <td className="py-2.5 px-5 text-center font-medium">
                        <div> {a.jam_mulai} – {a.jam_selesai}</div>
                        <div className="text-gray-500 text-xs mt-0.5"> Total: {a.total_lembur} jam</div>
                      </td>

                      <td className="py-2.5 px-5 text-center">
                        <button onClick={() => openModalWithDescription(a.deskripsi)} className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600">
                          <FontAwesomeIcon icon={faInfoCircle} />
                          Detail
                        </button>
                      </td>

                      <td className="py-2.5 px-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleApprove(a)} className="px-3 py-1 gap-1 font-semibold inline-flex items-center text-sm rounded-md bg-green-500 text-white hover:bg-green-600">
                            <FontAwesomeIcon icon={faCheck} />
                            Approve
                          </button>
                          <button onClick={() => handleReject(a)} className="px-3 py-1 gap-1 font-semibold inline-flex items-center text-sm rounded-md bg-red-600 text-white hover:bg-red-700">
                            <FontAwesomeIcon icon={faTimes} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======= Mobile Card ======= */}
      <div className="md:hidden space-y-4 mb-10">
        {paginatedData.data.length > 0 ? (
          paginatedData.data.map((item, i) => {
            const start = new Date(`1970-01-01T${item.jam_mulai}`);
            const end = new Date(`1970-01-01T${item.jam_selesai}`);
            const duration = ((end - start) / 1000 / 60).toFixed(0);
            const hours = Math.floor(duration / 60);

            return (
              <div key={item.id_lembur} className="border-l-4 border-yellow-400 bg-white rounded-lg shadow-sm p-4 space-y-3 text-sm">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{item.nama_user}</p>
                    <p className="text-[11px] text-gray-500">{item.role}</p>
                    <p className="text-[11px] text-gray-500">{item.lokasi}</p>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {formatFullDate(item.tanggal)}
                  </span>
                </div>

                <hr className="border-gray-100" />

                {/* Jam + Total */}
                <div className="text-gray-700">
                  <p className="font-medium">
                    {item.jam_mulai} - {item.jam_selesai}
                  </p>
                  <p className="text-xs text-gray-500">Total: {hours} jam</p>
                </div>

                {/* Detail */}
                <button onClick={() => openModalWithDescription(item.deskripsi)} className="text-xs font-medium text-blue-600 hover:underline">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                  Lihat Deskripsi
                </button>

                {/* Menu (Approve / Reject) */}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleApprove(item.id_lembur)} className="flex-1 px-3 py-1 gap-1 font-semibold inline-flex items-center justify-center text-sm rounded-md bg-green-600 text-white hover:bg-green-700">
                    <FontAwesomeIcon icon={faCheck} />
                    Approve
                  </button>
                  <button onClick={() => handleReject(item.id_lembur)} className="flex-1 px-3 py-1 gap-1 font-semibold inline-flex items-center justify-center text-sm rounded-md bg-red-600 text-white hover:bg-red-700">
                    <FontAwesomeIcon icon={faTimes} />
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-400 text-sm">Tidak ada data lembur.</p>
        )}
      </div>

      {/* Pagination */}
      {paginatedData.total > itemsPerPage && (
        <Pagination currentPage={currentPage} totalItems={paginatedData.total} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-6" />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Rincian Tugas" note="Detail Kegiatan Lembur" size="md">
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {modalDescription || "Deskripsi tidak tersedia."}
        </p>
      </Modal>

      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Informasi Halaman Persetujuan Lembur" note="Panduan Singkat" size="md">
        <div className="text-gray-700 leading-relaxed space-y-2 text-sm">
          <p>
            Halaman ini menampilkan pengajuan lembur karyawan berdasarkan periode tertentu,
            memudahkan HRD atau atasan untuk memantau dan mengambil keputusan dengan cepat.
          </p>

          <ul className="list-disc list-inside space-y-1">
            <li><strong>Pencarian:</strong> Temukan pengajuan berdasarkan nama karyawan.</li>
            <li><strong>Periode:</strong> Filter pengajuan sesuai tanggal; klik "Periode Saat Ini" untuk default.</li>
            <li><strong>Detail Lembur:</strong> Lihat deskripsi lembur per karyawan dengan tombol Detail.</li>
            <li><strong>Aksi Persetujuan:</strong> Approve atau Reject langsung dari tabel/kartu.</li>
            <li><strong>Riwayat:</strong> Akses pengajuan sebelumnya melalui tombol "Lihat Riwayat".</li>
          </ul>

          <p className="italic text-gray-500 text-xs">
            Tujuan: Memastikan pengajuan lembur tercatat, disetujui atau ditolak secara tepat, transparan, dan efisien.
          </p>
        </div>
      </Modal>



    </div>
  );
};

export default PersetujuanLembur;
