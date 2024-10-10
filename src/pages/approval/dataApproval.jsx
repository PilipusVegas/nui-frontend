import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DataApproval = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(0); // Default status filter
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [modalDescription, setModalDescription] = useState(""); // State for storing description in modal

  const handleBackClick = () => navigate("/home");

  const fetchApprovalData = async () => {
    try {
      const response = await fetch(`${apiUrl}/lembur/approve/`, { method: "GET" });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setApprovalData(result); // Set all data initially
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
        : true; // If no status is selected, return all

    return matchesSearch && matchesStatus; // Combine both filters
  });

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/lembur/approve/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: 1 }),
      });

      if (!response.ok) {
        throw new Error("Failed to update approval status");
      }
      fetchApprovalData();
      Swal.fire("Approved!", "", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/lembur/approve/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: 2 }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rejection status");
      }

      fetchApprovalData();

      Swal.fire("Rejected!", "", "error");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // Handle modal opening with description
  const openModalWithDescription = (description) => {
    setModalDescription(description);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-start p-6">
      <div className="flex items-center space-x-3 mb-6 justify-between">
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Back to Home"
            onClick={handleBackClick}
            className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
          />
          <h1 className="text-3xl font-semibold text-gray-800">Overview Data Approval</h1>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedStatus === 0 ? "bg-yellow-400 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedStatus(0)}
          >
            Permohonan Lembur
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedStatus === 1 ? "bg-green-500 text-white" : "bg-gray-200"}`}
            onClick={() => setSelectedStatus(1)}
          >
            Disetujui
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedStatus === 2 ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedStatus(2)}
          >
            Ditolak
          </button>
        </div>

        {/* Search Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            placeholder="Cari Nama Karyawan..."
            className="border border-gray-300 p-2 rounded-lg w-full max-w-md"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : errorMessage ? (
        <p className="text-red-500 text-center">{errorMessage}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-green-600 text-white uppercase text-sm">
              <tr>
                <th className="py-3 px-4 text-left">No.</th>
                <th className="py-3 px-4 text-left">Nama Karyawan</th>
                <th className="py-3 px-4 text-left">Tanggal</th>
                <th className="py-3 px-4 text-left">Lokasi</th>
                <th className="py-3 px-4 text-left">Deskripsi</th>
                <th className="py-3 px-4 text-left">Jam Mulai</th>
                <th className="py-3 px-4 text-left">Jam Selesai</th>
                <th className="py-3 px-4 text-center">{selectedStatus === 1 || selectedStatus === 2 ? "Status" : "Aksi"}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {filteredApproval.length > 0 ? (
                filteredApproval.map((approval, index) => (
                  <tr key={approval.id_lembur} className="hover:bg-gray-100 border-b border-gray-200">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{approval.nama_user}</td>
                    <td className="py-3 px-4">{new Date(approval.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="py-3 px-4">{approval.lokasi}</td>
                    {/* Deskripsi dengan klik untuk melihat detail */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openModalWithDescription(approval.deskripsi)}
                        className="text-blue-500 underline"
                      >
                        Lihat Deskripsi
                      </button>
                    </td>
                    <td className="py-3 px-4">{approval.jam_mulai}</td>
                    <td className="py-3 px-4">{approval.jam_selesai}</td>
                    <td className="py-3 px-4 flex justify-center space-x-2">
                      {approval.status_lembur === 1 ? (
                        <span className="text-green-600 font-semibold">Disetujui</span>
                      ) : approval.status_lembur === 2 ? (
                        <span className="text-red-600 font-semibold">Ditolak</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApprove(approval.id_lembur)}
                            className="bg-green-500 text-white rounded-lg px-4 py-2"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleReject(approval.id_lembur)}
                            className="bg-red-500 text-white rounded-lg px-4 py-2"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative bg-green-600 p-6 rounded-lg shadow-lg max-w-lg mx-auto transform transition-transform duration-300 ease-in-out scale-100 overflow-y-auto h-3/4">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-3 text-white text-3xl text-red-700">
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4 mt-5">Rincian Deskripsi :</h2>
            <p className="mb-6 text-white leading-relaxed">
              {modalDescription} Lorem ipsum dolor sit amet, consectetur adipisicing elit. Temporibus fuga alias porro quae
              tempore eligendi sapiente iste repellat aliquid, placeat fugiat, esse voluptates, voluptatum perferendis optio
              animi eveniet nobis aperiam ullam reprehenderit dolore est officiis. Error ab impedit nihil? Libero eum hic
              dolorem nemo suscipit! Animi deserunt odio sunt sit incidunt, maiores nulla eveniet dolorem vitae totam
              consequatur. lorem500
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataApproval;
