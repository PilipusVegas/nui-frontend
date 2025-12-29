import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { formatFullDate } from "../../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { faCheck, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal, LoadingSpinner, ErrorState, EmptyState, SearchBar, Pagination } from "../../../components";

const PersetujuanLembur = () => {
  const itemsPerPage = 10;
  const navigate = useNavigate();
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

  const fetchApprovalData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await fetchWithJwt(`${apiUrl}/lembur/approve`);

      // === KHUSUS 404: anggap data kosong ===
      if (res.status === 404) {
        setApprovalData([]);
        return;
      }

      // === ERROR SELAIN 404 ===
      if (!res.ok) {
        throw new Error("Gagal mengambil data lembur.");
      }

      const result = await res.json();

      if (Array.isArray(result.data)) {
        setApprovalData(result.data);
      } else {
        setApprovalData([]);
      }
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchApprovalData();
  }, [apiUrl]);


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
        body = { status }; // hanya kirim status
      } else {
        throw new Error("Data lembur tidak valid.");
      }

      const res = await fetchWithJwt(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status.");

      // Hanya pakai toast
      if (status === 1) {
        toast.success("Pengajuan lembur berhasil disetujui.");
      } else if (status === 2) {
        toast.error("Pengajuan lembur ditolak.");
      }

      fetchApprovalData();
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
            <button onClick={() => setIsInfoModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-md font-medium">
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
      </div>

      <div className="hidden lg:block">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-green-500 text-white text-xs md:text-sm uppercase tracking-wide">
                {["No.", "Tanggal & Lokasi", "Nama Karyawan", "Waktu Lembur & Total", "Detail", "Menu"].map((h, i) => (
                  <th key={i} className="py-2 px-4 text-center font-semibold whitespace-nowrap">{h}</th>
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
                    <ErrorState message={errorMessage} onRetry={fetchApprovalData} />
                  </td>
                </tr>
              ) : paginatedData.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <EmptyState title="Belum ada pengajuan lembur" description="Saat ini tidak ada pengajuan lembur yang perlu diproses."/>
                  </td>
                </tr>
              ) : (
                paginatedData.data.map((a, i) => {
                  const idx = (currentPage - 1) * itemsPerPage + i + 1;

                  return (
                    <tr key={a.id_lembur} className="hover:bg-gray-50 transition-colors">

                      <td className="py-2 px-4 text-center font-medium">{idx}</td>

                      <td className="py-2 px-4 text-left">
                        <div className="font-medium">{formatFullDate(a.tanggal)}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{a.lokasi}</div>
                      </td>

                      <td className="py-2 px-4 text-left">
                        <div className="font-medium">{a.nama_user}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{a.role}</div>
                      </td>

                      <td className="py-2 px-4 text-left font-medium">
                        <div>{a.jam_mulai} – {a.jam_selesai}</div>
                        <div className="text-gray-500 text-xs mt-0.5">Total: {a.total_lembur} jam</div>
                      </td>

                      <td className="py-1 px-4 text-center">
                        <button onClick={() => openModalWithDescription(a.deskripsi)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition">
                          <FontAwesomeIcon icon={faInfoCircle} /> Detail
                        </button>
                      </td>

                      <td className="py-3 px-4 flex justify-center gap-2">
                        <button onClick={() => handleApprove(a)} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded bg-green-500 text-white hover:bg-green-600 transition">
                          <FontAwesomeIcon icon={faCheck} /> Approve
                        </button>
                        <button onClick={() => handleReject(a)} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition">
                          <FontAwesomeIcon icon={faTimes} /> Reject
                        </button>
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
      <div className="lg:hidden space-y-3 mb-10">
        {paginatedData.data.length > 0 ? (
          paginatedData.data.map((item) => (
            <div key={item.id_lembur} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">{item.nama_user}</p>
                  <p className="text-[11px] text-gray-500">{item.role}</p>
                  <p className="text-[11px] text-gray-500">{item.lokasi}</p>
                </div>
                <span className="text-[11px] text-gray-400">{formatFullDate(item.tanggal)}</span>
              </div>

              <div className="text-gray-700 mb-2">
                <p className="font-medium">{item.jam_mulai} – {item.jam_selesai}</p>
                <p className="text-xs text-gray-500">Total: {item.total_lembur} jam</p>
              </div>

              <hr className="border-gray-100 mb-2" />

              <div className="flex justify-between items-center">
                <button onClick={() => openModalWithDescription(item.deskripsi)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  Detail
                </button>

                {/* Approve / Reject Buttons */}
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(item)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition">
                    <FontAwesomeIcon icon={faCheck} />
                    Approve
                  </button>

                  <button onClick={() => handleReject(item)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition">
                    <FontAwesomeIcon icon={faTimes} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm">Tidak ada data lembur.</p>
        )}
      </div>


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
