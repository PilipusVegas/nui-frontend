import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { formatFullDate } from "../../utils/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { faCheck, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, Modal, LoadingSpinner, ErrorState, EmptyState, SearchBar, Pagination } from "../../components";

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
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-green-500 text-white text-xs md:text-sm uppercase tracking-wide">
                {["No.", "Tanggal Lembur", "Nama Karyawan", "Lokasi Lembur", "Rentang Waktu & Total Lembur", "Menu",].map((h, i) => (
                  <th key={i} className="py-2 px-4 text-center font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-gray-700">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-16">
                    <LoadingSpinner />
                  </td>
                </tr>
              )}

              {!isLoading && errorMessage && (
                <tr>
                  <td colSpan={6} className="py-16">
                    <ErrorState message="Gagal Memuat Data Lembur" detail={errorMessage} onRetry={fetchApprovalData} />
                  </td>
                </tr>
              )}

              {!isLoading && !errorMessage && paginatedData.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16">
                    <EmptyState title="Belum Ada Pengajuan Lembur" description="Tidak ada data lembur yang perlu diproses saat ini." />
                  </td>
                </tr>
              )}
              {!isLoading && !errorMessage && paginatedData.data.map((a, i) => {
                const idx = (currentPage - 1) * itemsPerPage + i + 1;
                return (
                  <tr key={a.id_lembur} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-4 text-center font-medium">{idx}</td>
                    <td className="py-2 px-4 text-center font-medium">{formatFullDate(a.tanggal)}</td>
                    <td className="py-2 px-4 text-left">
                      <div className="font-medium uppercase">{a.nama_user}</div>
                      <div className="text-xs text-gray-500">{a.role}</div>
                    </td>
                    <td className="py-2 px-4 text-center text-sm text-gray-600">
                      {a.lokasi || "-"}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <div className="font-medium">
                        {a.jam_mulai} – {a.jam_selesai}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: {a.total_lembur} jam
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button onClick={() => openModalWithDescription(a.deskripsi)} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded bg-blue-500 text-white hover:bg-blue-600">
                          <FontAwesomeIcon icon={faInfoCircle} />
                          Detail
                        </button>
                        <button onClick={() => handleApprove(a)} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded bg-green-500 text-white hover:bg-green-600">
                          <FontAwesomeIcon icon={faCheck} />
                          Setujui
                        </button>
                        <button onClick={() => handleReject(a)} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700">
                          <FontAwesomeIcon icon={faTimes} />
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
      </div>


      {/* ======= Mobile Card (Refined & Clean) ======= */}
      <div className="lg:hidden mb-10">
        {isLoading && (
          <LoadingSpinner />
        )}
        {!isLoading && errorMessage && (
          <ErrorState message="Gagal Memuat Data Lembur" detail={errorMessage} onRetry={fetchApprovalData} />
        )}
        {!isLoading && !errorMessage && paginatedData.data.length === 0 && (
          <EmptyState title="Belum Ada Pengajuan Lembur" description="Tidak ada pengajuan lembur yang perlu diproses saat ini." />
        )}

        {!isLoading && !errorMessage && paginatedData.data.length > 0 && (
          <div className="space-y-3">
            {paginatedData.data.map((item) => (
              <div key={item.id_lembur} className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-sm">
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      Nama Karyawan
                    </p>
                    <p className="font-semibold text-gray-800 uppercase">
                      {item.nama_user}
                    </p>
                    <p className="text-xs text-gray-500">{item.role}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      Tanggal Lembur
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {formatFullDate(item.tanggal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      Rentang Waktu & Durasi
                    </p>
                    <p className="text-xs text-gray-800 font-medium">
                      {item.jam_mulai} – {item.jam_selesai}
                      <span className="text-gray-600">
                        {" "}({item.total_lembur} jam)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      Lokasi Lembur
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.lokasi || "-"}
                    </p>
                  </div>
                </div>
                <div className="my-3 border-t border-gray-100" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => openModalWithDescription(item.deskripsi)} className="px-3 py-1.5 text-xs rounded bg-blue-500 text-white hover:bg-blue-600">
                    Detail
                  </button>
                  <button onClick={() => handleApprove(item)} className="px-3 py-1.5 text-xs rounded bg-green-600 text-white hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={() => handleReject(item)} className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
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

      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Informasi Persetujuan Lembur" note="Panduan Penggunaan" size="md">
        <div className="text-gray-700 leading-relaxed space-y-3 text-sm">
          <p> Halaman ini digunakan untuk meninjau dan memproses pengajuan lembur karyawan berdasarkan periode tertentu. Fitur ini membantu atasan atau tim HR memastikan pengajuan lembur dicatat dan diputuskan secara tepat.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Pencarian:</strong> Cari pengajuan berdasarkan nama karyawan.
            </li>
            <li>
              <strong>Informasi Lembur:</strong> Lihat tanggal, lokasi, durasi, dan detail kegiatan lembur.
            </li>
            <li>
              <strong>Detail:</strong> Klik tombol <em>Detail</em> untuk melihat deskripsi kegiatan lembur.
            </li>
            <li>
              <strong>Persetujuan:</strong> Gunakan tombol <em>Approve</em> atau
              <em> Reject</em> untuk menyetujui atau menolak pengajuan.
            </li>
          </ul> 
          <p className="italic text-gray-500 text-xs"> Tujuan utama fitur ini adalah memastikan proses lembur berjalan transparan, terdokumentasi, dan sesuai dengan kebijakan perusahaan.</p>
        </div>
      </Modal>


    </div>
  );
};

export default PersetujuanLembur;
