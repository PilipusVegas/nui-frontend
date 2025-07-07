import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { faCheck, faArrowLeft, faClock, faUser, faInfoCircle, faMapMarkerAlt, faTimes, faSearch, faTriangleExclamation,} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DataApproval = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDescription, setModalDescription] = useState("");
  const handleBackClick = () => navigate("/home");

  const fetchApprovalData = async () => {
    try {
      const response = await fetch(`${apiUrl}/lembur/approve/`, {
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
          const response = await fetch(`${apiUrl}/lembur/approve/${id}`, {
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
          const response = await fetch(`${apiUrl}/lembur/approve/${id}`, {
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
    <div className="min-h-screen flex flex-col p-6">
      {/* Header and Filter Section */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        {/* Header */}
        <div className="flex items-center w-full sm:w-auto">
          <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 pb-1">Persetujuan Lembur</h1>
        </div>

        {/* Wrapper untuk Search Bar dan Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          {/* Wrapper untuk ikon dan input */}
          <div className="relative flex items-center w-full sm:w-auto">
            {/* Ikon pencarian */}
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"/>
            {/* Search Input */}
            <input type="text" value={searchQuery} placeholder="Cari Nama Karyawan..." className="border border-gray-300 p-2 pl-10 rounded-lg w-full sm:max-w-md" onChange={(e) => setSearchQuery(e.target.value)}/>
          </div>

          {/* Filter Dropdown */}
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(Number(e.target.value))} className="border border-gray-300 p-2 rounded-lg w-full sm:w-auto">
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
                    <th key={header} className="py-1 px-4 text-center">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700 text-center">
                {filteredApproval.length > 0 ? (
                  filteredApproval.map((approval, index) => (
                    <tr key={approval.id_lembur} className="hover:bg-gray-100 border-b border-gray-200">
                      <td className="py-1 px-4">{index + 1}</td>
                      <td className="py-1 px-4">
                        {new Date(approval.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="text-left font-semibold py-1 px-4">{approval.nama_user}</td>
                      <td className="py-1 px-4">{approval.lokasi}</td>
                      <td className="py-1 px-4 text-center">
                      <div className="flex justify-center">
                        <button onClick={() => openModalWithDescription(approval.deskripsi)} className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white text-xs px-4 py-1 rounded font-semibold transition">
                          <FontAwesomeIcon icon={faSearch} />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-1 text-sm font-medium text-gray-700 whitespace-nowrap">
                      {approval.jam_mulai} <span className="text-gray-600 font-bold">-</span> {approval.jam_selesai}
                    </td>
                      <td className="py-1 px-4">
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
                          <div className="flex space-x-2 justify-center">
                              <button onClick={() => handleApprove(approval.id_lembur)} className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-1 rounded font-semibold transition">
                                <FontAwesomeIcon icon={faCheck} />
                                <span>Setujui</span>
                              </button>
                              <button onClick={() => handleReject(approval.id_lembur)} className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 rounded font-semibold transition">
                                <FontAwesomeIcon icon={faTimes} />
                                <span>Tolak</span>
                              </button>
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
      <div className="md:hidden space-y-6">
        {filteredApproval.length > 0 ? (
          filteredApproval.map((approval, index) => (
            <div key={approval.id_lembur} className={`bg-white border-l-4 ${
                approval.status_lembur === 1
                  ? "border-green-500"
                  : approval.status_lembur === 2
                  ? "border-red-500"
                  : "border-yellow-400"
              } shadow-md rounded-lg p-4 flex flex-col space-y-4`}
            >
              {/* Header Card */}
              <div className="flex justify-between items-center">
                <p className="text-gray-600 text-sm">
                  {" "}
                  <span className="text-gray-700 text-xs font-normal">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-700 text-base mr-1"/>
                    {approval.lokasi}
                  </span>
                </p>
                <span
                  className={`px-1 py-1 rounded-full text-xs font-semibold ${
                    approval.status_lembur === 1
                      ? "bg-green-100 text-green-600"
                      : approval.status_lembur === 2
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-200 text-yellow-600"
                  }`}
                >
                  {approval.status_lembur === 1
                    ? "Disetujui"
                    : approval.status_lembur === 2
                    ? "Ditolak"
                    : "Pending"}
                </span>
              </div>

              {/* Body Card */}
              <div className="grid grid-cols-1 gap-4 p-4 bg-white rounded-lg shadow-md">
                {/* Nama User & Lokasi */}
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="text-gray-500 text-base" />
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-800 font-semibold text-sm">{approval.nama_user}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-800 font-semibold text-xs">
                      {new Date(approval.tanggal).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Jam Mulai - Jam Selesai */}
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="text-gray-500 text-base" />
                  <p className="text-gray-800 text-xs">
                    <span className="font-medium">{approval.jam_mulai}</span> -{" "}
                    <span className="font-medium">{approval.jam_selesai}</span>
                  </p>
                </div>

                {/* Deskripsi */}
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-gray-500 text-base" />
                  <button onClick={() => openModalWithDescription(approval.deskripsi)} className="text font-medium text-xs underline hover:text-blue-700 hover:underline transition duration-150">
                    Lihat Deskripsi
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {approval.status_lembur === 0 && (
                <div className="flex space-x-20">
                  <button onClick={() => handleReject(approval.id_lembur)} className="flex-1 flex items-center justify-center bg-red-500 text-white rounded-lg px-0 py-2 text-sm font-semibold hover:bg-red-600 transition-all">
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  </button>
                  <button onClick={() => handleApprove(approval.id_lembur)} className="flex-1 flex items-center justify-center bg-green-500 text-white rounded-lg px-0 py-2 text-sm font-semibold hover:bg-green-600 transition-all">
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">Data tidak ditemukan.</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-3 text-gray-600 hover:text-red-600">
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-xl font-bold mb-4">Rincian Tugas</h2>
            <p>{modalDescription || "Deskripsi tidak tersedia."}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataApproval;
