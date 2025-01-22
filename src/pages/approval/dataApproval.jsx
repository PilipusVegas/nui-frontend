import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  faCheck,
  faArrowLeft,
  faClock,
  faUser,
  faInfoCircle,
  faMapMarkerAlt,
  faTimes,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
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
        setApprovalData(result.data); // Set all data initially
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
    const matchesSearch = approval.nama_user
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 0
        ? approval.status_lembur === 0
        : selectedStatus === 1
        ? approval.status_lembur === 1
        : selectedStatus === 2
        ? approval.status_lembur === 2
        : true; // If no status is selected, return all

    return matchesSearch && matchesStatus; // Combine both filters
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
        try {
          const response = await fetch(`${apiUrl}/lembur/approve/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: 1 }),
          });

          if (!response.ok) {
            throw new Error("Gagal menyetujui lembur.");
          }
          await fetchApprovalData();
          Swal.fire("Disetujui!", "Permohonan telah disetujui.", "success");
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
        try {
          const response = await fetch(`${apiUrl}/lembur/approve/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: 2 }),
          });

          if (!response.ok) {
            throw new Error("Gagal menolak lembur.");
          }
          await fetchApprovalData();
          Swal.fire("Ditolak!", "Permohonan telah ditolak.", "error");
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  // Handle modal opening with description
  const openModalWithDescription = (description) => {
    setModalDescription(description);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 justify-between">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Back to Home"
            onClick={handleBackClick}
            className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
          />
          <h1 className="text-2xl font-semibold text-gray-800">
            Data Approval Lembur
          </h1>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {["Permohonan Lembur", "Disetujui", "Ditolak"].map((label, i) => (
            <button
              key={i}
              className={`px-3 py-2 text-sm rounded-lg font-semibold ${
                selectedStatus === i
                  ? ["bg-yellow-400", "bg-green-500", "bg-red-500"][i] +
                    " text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setSelectedStatus(i)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            placeholder="Cari Nama Karyawan..."
            className="w-full sm:max-w-md border border-gray-300 p-2 rounded-lg"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel untuk Desktop */}
      <div className="hidden md:block">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            Loading...
          </div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-auto">
            <table className="min-w-full table-auto text-sm">
              <thead>
                <tr className="bg-green-500 text-white text-xs md:text-sm">
                  {[
                    "No.",
                    "Tanggal",
                    "Username",
                    "Lokasi",
                    "Deskripsi",
                    "Jam Mulai",
                    "Jam Selesai",
                    selectedStatus === 1 || selectedStatus === 2
                      ? "Status"
                      : "Aksi",
                  ].map((header) => (
                    <th key={header} className="py-2 px-4 text-center">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredApproval.length > 0 ? (
                  filteredApproval.map((approval, index) => (
                    <tr
                      key={approval.id_lembur}
                      className="hover:bg-gray-100 border-b border-gray-200"
                    >
                      <td className="py-2 px-4 text-center">{index + 1}</td>
                      <td className="py-2 px-4 text-center">
                        {new Date(approval.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-2 px-4">{approval.nama_user}</td>
                      <td className="py-2 px-4">{approval.lokasi}</td>
                      <td className="py-2 px-4 text-center">
                        <button
                          onClick={() =>
                            openModalWithDescription(approval.deskripsi)
                          }
                          className="text-blue-500"
                        >
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="mr-2 text-blue-500"
                          />
                          View
                        </button>
                      </td>

                      <td className="py-2 px-4 text-center">
                        {approval.jam_mulai}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {approval.jam_selesai}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {approval.status_lembur === 1 ? (
                          <span className="text-green-600 font-semibold">
                            Disetujui
                          </span>
                        ) : approval.status_lembur === 2 ? (
                          <span className="text-red-600 font-semibold">
                            Ditolak
                          </span>
                        ) : (
                          <div className="flex flex-col space-y-3">
                            {/* Tombol Setujui */}
                            <button
                              onClick={() => handleApprove(approval.id_lembur)}
                              className="flex items-center justify-center bg-green-500 text-white font-medium rounded-lg py-2 shadow-md hover:bg-green-600 hover:shadow-lg transition-transform transform hover:scale-105"
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="mr-2"
                              />
                              Setujui
                            </button>

                            {/* Tombol Tolak */}
                            <button
                              onClick={() => handleReject(approval.id_lembur)}
                              className="flex items-center justify-center bg-red-500 text-white font-medium rounded-lg py-2 shadow-md hover:bg-red-600 hover:shadow-lg transition-transform transform hover:scale-105"
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="mr-2"
                              />
                              Tolak
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-4 text-gray-500 italic"
                    >
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabel untuk Mobile */}
      <div className="md:hidden space-y-6">
        {filteredApproval.length > 0 ? (
          filteredApproval.map((approval, index) => (
            <div
              key={approval.id_lembur}
              className={`bg-white border-l-4 ${
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
                  <span className="font-semibold text-gray-800">
                    {new Date(approval.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
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
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-green-500 text-base"
                  />
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-800 font-semibold text-xs">
                        {approval.nama_user}
                      </p>
                      <span className="text-gray-700 text-xs font-normal">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-green-700 text-base mr-1"
                        />
                        {approval.lokasi}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Jam Mulai - Jam Selesai */}
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-yellow-500 text-base"
                  />
                  <p className="text-gray-800 text-xs">
                    <span className="font-medium">{approval.jam_mulai}</span> -{" "}
                    <span className="font-medium">{approval.jam_selesai}</span>
                  </p>
                </div>

                {/* Deskripsi */}
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-blue-500 text-base"
                  />
                  <button
                    onClick={() => openModalWithDescription(approval.deskripsi)}
                    className="text-blue-500 font-medium text-xs hover:text-blue-700 hover:underline transition duration-150"
                  >
                    Lihat Deskripsi
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {approval.status_lembur === 0 && (
                <div className="flex space-x-20">
                  <button
                    onClick={() => handleReject(approval.id_lembur)}
                    className="flex-1 flex items-center justify-center bg-red-500 text-white rounded-lg px-0 py-2 text-sm font-semibold hover:bg-red-600 transition-all"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  </button>
                  <button
                    onClick={() => handleApprove(approval.id_lembur)}
                    className="flex-1 flex items-center justify-center bg-green-500 text-white rounded-lg px-0 py-2 text-sm font-semibold hover:bg-green-600 transition-all"
                  >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-600"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-xl font-bold mb-4">Rincian Deskripsi</h2>
            <p>{modalDescription || "Deskripsi tidak tersedia."}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataApproval;
