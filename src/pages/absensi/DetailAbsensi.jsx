import React, { useState, useEffect } from "react";
import {
  faArrowLeft,
  faMapMarkerAlt,
  faClock,
  faCalendarDay,
  faRulerVertical,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

const DetailAbsensi = () => {
  const { id_user } = useParams(); // Ambil id_user dari URL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [statusApproval, setStatusApproval] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [absen, setAbsen] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = absen.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(absen.length / itemsPerPage);

  useEffect(() => {
    const calculatePeriod = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      let startDate, endDate;

      if (now.getDate() < 21) {
        startDate = new Date(currentYear, currentMonth - 1, 21);
        endDate = new Date(currentYear, currentMonth, 20);
      } else {
        startDate = new Date(currentYear, currentMonth, 21);
        endDate = new Date(currentYear, currentMonth + 1, 20);
      }

      setPeriod(
        `${startDate.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} - ${endDate.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      );
    };

    calculatePeriod();
  }, []);

  useEffect(() => {
    const fetchAbsenData = async () => {
      try {
        const response = await fetch(`${apiUrl}/absen/${id_user}`);
        if (!response.ok) {
          throw new Error("Failed to fetch absen data");
        }
        const data = await response.json();
        setAbsen(data.absen || []);
        setSelectedItem(data);
      } catch (error) {
        console.error("Error fetching absen data:", error);
      }
    };

    if (id_user) {
      fetchAbsenData();
    }
  }, [id_user, apiUrl]);

  const handleViewClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsApproved(item?.status === 1);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleStatusUpdate = async (id_absen) => {
    if (!id_absen) return;
    setIsLoading(true);
    setError(null);
    const newStatus = 1;

    try {
      const response = await fetch(`${apiUrl}/absen/status/${id_absen}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Gagal memperbarui status");

      setStatusApproval((prevState) => ({
        ...prevState,
        [id_absen]: true,
      }));

      Swal.fire({
        title: "Status Diperbarui!",
        text: "Status absensi telah berhasil disetujui.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      setError("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onBackClick = () => navigate("/data-absensi");

  return (
    <div className="min-h-screen flex flex-col justify-start p-6">
      <div className="flex items-center mb-4">
        <FontAwesomeIcon
          icon={faArrowLeft}
          title="Kembali"
          onClick={onBackClick}
          className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
        />
        <h2 className="text-3xl font-bold text-gray-800 pb-1">Detail Absensi</h2>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-2 border border-gray-200 flex justify-between items-center">
        <div>
          {selectedItem ? (
            <>
              <h1 className="text-2xl font-bold">{selectedItem.nama}</h1>
              <p className="text-gray-600 text-sm font-semibold">{selectedItem.role}</p>
            </>
          ) : (
            <p className="text-gray-500 italic">Memuat data...</p>
          )}
        </div>
        <div>
          <span className="text-gray-600 text-sm">
            Periode Absen: {period || "N/A"}
          </span>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg mb-4">
        <table className="min-w-full border-collapse rounded-lg">
          <thead>
            <tr className="bg-green-500 text-white">
              {[
                "No.",
                "Tanggal",
                "Lokasi",
                "IN",
                "OUT",
                "Status",
                "Aksi",
              ].map((header, index) => (
                <th
                  key={index}
                  className={`py-1 px-4 font-semibold text-center ${index === 0 ? "first:rounded-tl-lg" : ""} ${index === 6 ? "last:rounded-tr-lg" : ""}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item.id_absen} className="border-b hover:bg-gray-100">
                  <td className="text-center py-1 px-4">{indexOfFirstItem + index + 1}</td>
                  <td className="text-center py-1 px-4">
                    {new Date(item.jam_mulai).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}
                  </td>
                  <td className="py-1 px-4">{item.lokasi}</td>
                  <td className="text-center py-1 px-4">
                    {new Date(item.jam_mulai).toLocaleTimeString("id-ID", {
                      timeZone: "Asia/Jakarta",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </td>
                  <td className="text-center py-1 px-4">
                    {item.jam_selesai
                      ? new Date(item.jam_selesai).toLocaleTimeString("id-ID", {
                          timeZone: "Asia/Jakarta",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "---"}
                  </td>
                  <td className="text-center py-1 px-4">
                    <span
                      className={`font-semibold ${statusApproval[item.id_absen] ? "text-green-600" : "text-red-600"}`}
                    >
                      {statusApproval[item.id_absen] ? "Disetujui" : "Belum Disetujui"}
                    </span>
                  </td>
                  <td className="text-center py-1 px-4">
                    <button
                      onClick={() => handleStatusUpdate(item.id_absen)}
                      className="bg-blue-500 text-white py-1 px-3 rounded-lg hover:bg-blue-600 transition"
                      disabled={statusApproval[item.id_absen] || isLoading}
                    >
                      {isLoading ? "Loading..." : "Setujui"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4 text-gray-500 italic"
                >
                  Tidak ada data absensi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="bg-gray-300 text-gray-800 py-1 px-4 rounded-lg hover:bg-gray-400"
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="text-gray-600">
          Halaman {currentPage} dari {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="bg-gray-300 text-gray-800 py-1 px-4 rounded-lg hover:bg-gray-400"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DetailAbsensi;
