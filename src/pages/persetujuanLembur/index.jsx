import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { faCheck, faArrowLeft, faClock, faUser, faInfoCircle, faMapMarkerAlt, faTimes, faSearch, faTriangleExclamation, faArrowRight,} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const DataApproval = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const user = getUserFromToken();
  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDescription, setModalDescription] = useState("");
  const handleBackClick = () => navigate("/home");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const paginatedData = (() => {
    const statusFiltered = approvalData.filter((approval) => {
      const matchesSearch = approval.nama_user.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && approval.status_lembur === selectedStatus;
    });
  
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      total: statusFiltered.length,
      data: statusFiltered.slice(startIndex, endIndex)
    };
  })();
  
  const fetchApprovalData = async () => {
    try {
      const response = await fetchWithJwt(`${apiUrl}/lembur/approve/`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      if (Array.isArray(result.data)) {
        setApprovalData(result.data);
      } else {
        setErrorMessage("Unexpected response format.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, [apiUrl]);

  // Filtered approval data based on selected status and search query
  const filteredApproval = approvalData.filter((approval) => {
    const matchesSearch = approval.nama_user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 0
        ? approval.status_lembur === 0
        : selectedStatus === 1
        ? approval.status_lembur === 1
        : selectedStatus === 2
        ? approval.status_lembur === 2
        : true; 
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id) => {
    Swal.fire({
      title: "Anda yakin ingin menyetujui?",
      text: "Tindakan ini menyetujui permohonan Lembur.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Setujui!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const userId = localStorage.getItem("userId");
        try {
          const response = await fetchWithJwt(`${apiUrl}/lembur/approve/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: 1,
              user_id: userId,
            }),
          });
  
          if (!response.ok) {
            throw new Error("Gagal menyetujui lembur.");
          }
          await fetchApprovalData();
          Swal.fire("Berhasil Disetujui!", "Permohonan telah berhasil disetujui.", "success");
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };
  
  const handleReject = async (id) => {
    Swal.fire({
      title: "Anda yakin ingin menolak?",
      text: "Tindakan ini menolak permohonan Lembur.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Tolak!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const userId = localStorage.getItem("userId");
        try {
          const response = await fetchWithJwt(`${apiUrl}/lembur/approve/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: 2,
              user_id: userId,
            }),
          });
          if (!response.ok) {
            throw new Error("Gagal menolak lembur.");
          }
          await fetchApprovalData();
          Swal.fire("Berhasil Ditolak!", "Permohonan telah berhasil ditolak.", "success");
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };
  
  const openModalWithDescription = (description) => {
    setModalDescription(description);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Header and Filter Section */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        {/* Header */}
        <div className="flex items-center w-full sm:w-auto">
          <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 pb-1">Persetujuan Lembur</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center w-full sm:w-auto">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"/>
            <input type="text" value={searchQuery} placeholder="Cari Nama Karyawan..." className="border border-gray-300 p-2 pl-10 rounded-lg w-full sm:max-w-md" onChange={(e) => setSearchQuery(e.target.value)}/>
          </div>

          {/* Filter Dropdown */}
          <select value={selectedStatus} onChange={(e) => { setSelectedStatus(Number(e.target.value)); setCurrentPage(1); }}  className="border border-gray-300 p-2 rounded-lg w-full sm:w-auto">
            <option value={0}>Permohonan Lembur</option>
            <option value={1}>Disetujui</option>
            <option value={2}>Ditolak</option>
          </select>
        </div>
      </div>

      {/* Tabel untuk Desktop */}
      <div className="hidden md:block">
          <div className="bg-white rounded-lg shadow-lg overflow-auto">
            <table className="min-w-full table-auto text-sm">
              <thead>
                <tr className="bg-green-500 text-white text-xs md:text-sm">
                  {[ "No.", "Tanggal", "Nama Karyawan", "Lokasi Tugas", "Deskripsi", "Waktu Lembur", selectedStatus === 1 || selectedStatus === 2 ? "Status" : "Menu",].map((header) => (
                    <th key={header} className="py-2 px-4 text-center">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700 text-center">
                {filteredApproval.length > 0 ? (
                  paginatedData.data.map((approval, index) => (
                    <tr key={approval.id_lembur} className="hover:bg-gray-100 border-b border-gray-200">
                      <td className="py-0.5 px-4 text-xs">{index + 1}</td>
                      <td className="py-0.5 px-4 text-xs">
                        {new Date(approval.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="text-left font-semibold py-0.5 px-4 text-xs">{approval.nama_user}</td>
                      <td className="py-0.5 px-4 text-xs">{approval.lokasi}</td>
                      <td className="py-0.5 px-4 text-xs text-center">
                      <div className="flex justify-center">
                        <button onClick={() => openModalWithDescription(approval.deskripsi)} className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white px-4 text-xs py-1 rounded font-semibold transition">
                          <FontAwesomeIcon icon={faSearch} />
                          <span>Detail</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 text-xs py-0.5 text-sm font-medium text-gray-700 whitespace-nowrap">
                      {approval.jam_mulai} <span className="text-gray-600 font-bold">-</span> {approval.jam_selesai}
                    </td>
                      <td className="py-0.5 px-4 text-xs">
                        {approval.status_lembur === 1 ? (
                          <>
                          <div className="flex flex-col space-y-0.5">
                            <span className="text-green-600 font-semibold">Disetujui</span>
                            <span className="text-gray-600 font-semibold text-xs">Oleh: {approval.nama_approve || "N/A"}</span>
                          </div>
                          </>
                        ) : approval.status_lembur === 2 ? (
                          <>
                          <div className="flex flex-col space-y-0.5">
                            <span className="text-green-600 font-semibold">Ditolak</span>
                            <span className="text-gray-600 font-semibold text-xs">Oleh: {approval.nama_approve || "N/A"}</span>
                          </div>
                          </>
                        ) : (
                          <div className="flex space-x-2 py-2 justify-center">
                            {/* saya ingin yang bisa menyetujui hanya id_role 5 dan 20 */}
                            {(user.id_role === 5 || user.id_role === 20) && (
                              <>
                                {user.id_user === 104 ? (
                                  <>
                                    <button disabled className="flex items-center justify-center space-x-2 bg-green-300 text-white px-4 text-xs py-2 rounded font-semibold opacity-60 cursor-not-allowed">
                                      <FontAwesomeIcon icon={faCheck} />
                                      <span>Setujui</span>
                                    </button>
                                    <button disabled className="flex items-center justify-center space-x-2 bg-red-300 text-white px-4 text-xs py-2 rounded font-semibold opacity-60 cursor-not-allowed">
                                      <FontAwesomeIcon icon={faTimes} />
                                      <span>Tolak</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleApprove(approval.id_lembur)} className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 text-xs py-2 rounded font-semibold transition">
                                      <FontAwesomeIcon icon={faCheck} />
                                      <span>Setujui</span>
                                    </button>
                                    <button onClick={() => handleReject(approval.id_lembur)} className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 text-xs py-2 rounded font-semibold transition">
                                      <FontAwesomeIcon icon={faTimes} />
                                      <span>Tolak</span>
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                            </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-20 text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-6xl text-gray-400" />
                        <p className="text-base font-medium text-gray-600">
                          Persetujuan Lembur Tidak Ditemukan.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>

      {/* Tabel untuk Mobile */}
      <div className="md:hidden space-y-4">
        {filteredApproval.length > 0 ? (
          paginatedData.data.map((approval) => (
            <div key={approval.id_lembur} className={`border-l-4 ${ approval.status_lembur === 1 ? "border-green-500" : approval.status_lembur === 2 ? "border-red-500" : "border-yellow-400" } bg-white rounded-lg shadow-sm p-4 space-y-3 text-sm`}>
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800">{approval.nama_user}</p>
                  <div className="text-gray-500 text-[10px] flex items-center gap-1">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
                    <span>{approval.lokasi}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-[11px] text-gray-400">
                    {new Date(approval.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric",})}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${ approval.status_lembur === 1 ? "bg-green-100 text-green-600" : approval.status_lembur === 2 ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600" }`}>
                    {approval.status_lembur === 1 ? "Disetujui" : approval.status_lembur === 2 ? "Ditolak" : "Pending"}
                  </span>
                </div>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between items-center gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="text-gray-500 text-sm" />
                  <span>
                    <span className="font-medium">{approval.jam_mulai}</span> -{" "}
                    <span className="font-medium">{approval.jam_selesai}</span>
                  </span>
                </div>
                <button onClick={() => openModalWithDescription(approval.deskripsi)} className="text-xs font-medium text-blue-600 underline hover:text-blue-700 transition flex items-center gap-1">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 text-sm" />
                  Lihat Deskripsi
                </button>
              </div>
              {approval.status_lembur === 0 && (user.id_user !== 104 && (user.id_role === 5 || user.id_role === 20)) && (
                <div className="pt-2 flex gap-4">
                  <button onClick={() => handleReject(approval.id_lembur)} className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-md font-semibold gap-2">
                    <FontAwesomeIcon icon={faTimes} />
                    Tolak
                  </button>
                  <button onClick={() => handleApprove(approval.id_lembur)} className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded-md font-semibold gap-2">
                    <FontAwesomeIcon icon={faCheck} />
                    Setujui
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm">Tidak ada data lembur.</p>
        )}
      </div>

      {paginatedData.total > itemsPerPage && (
        <div className="relative flex justify-center items-center mt-6 text-sm sm:text-base">
          {/* Panah kiri */}
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}
            className={`absolute left-0 px-3 py-2 rounded-full border shadow-sm transition-all duration-200
              ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>

          {/* Info halaman */}
          <span className="px-5 py-2 rounded-full bg-white border border-gray-300 text-gray-700 font-semibold shadow-sm">
            Halaman {currentPage} / {Math.ceil(paginatedData.total / itemsPerPage)}
          </span>

          {/* Panah kanan */}
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(paginatedData.total / itemsPerPage))
              )
            }
            disabled={currentPage === Math.ceil(paginatedData.total / itemsPerPage)}
            className={`absolute right-0 px-3 py-2 rounded-full border shadow-sm transition-all duration-200
              ${
                currentPage === Math.ceil(paginatedData.total / itemsPerPage)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      )}


      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="relative bg-white w-full max-w-2xl mx-auto rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300">
            
            {/* Tombol Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl transition"
              aria-label="Tutup"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {/* Judul Modal */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rincian Tugas</h2>

            {/* Isi Deskripsi */}
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {modalDescription || "Deskripsi tidak tersedia."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataApproval;
