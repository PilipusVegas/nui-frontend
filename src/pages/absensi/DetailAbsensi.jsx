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
  const [cardNama, setCardNama] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [statusApproval, setStatusApproval] = useState({});
  const [CurrentItems, setCurrentItems] = useState([]);
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
        setCardNama(data);
      } catch (error) {
        console.error("Error fetching absen data:", error);
      }
    };
    if (id_user) {
      fetchAbsenData();
    }
  }, [id_user, apiUrl]);

  useEffect(() => {
    const fetchAbsenData = async () => {
      try {
        const response = await fetch(`${apiUrl}/absen/${id_user}`);
        if (!response.ok) {
          throw new Error("Failed to fetch absen data");
        }
        const data = await response.json();
        console.log("Data fetched:", data);
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

    const selectedAbsen = absen.find((item) => item.id_absen === id_absen);
    const isOutMissing = !selectedAbsen.jam_selesai;

    // Show confirmation if 'OUT' is missing
    if (isOutMissing) {
      const result = await Swal.fire({
        title: "Konfirmasi Persetujuan",
        text: "Absen belum diselesaikan apakah anda ingin menyetujui absensi ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Setujui",
        cancelButtonText: "Batal",
      });

      if (!result.isConfirmed) return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/absen/status/${id_absen}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1 }),
      });

      if (!response.ok) throw new Error("Gagal memperbarui status");

      setStatusApproval((prevState) => ({
        ...prevState,
        [id_absen]: true,
      }));

      setCurrentItems((prevItems) => prevItems.filter((item) => item.id_absen !== id_absen));

      // Menampilkan SweetAlert dengan posisi top-end, tanpa tombol konfirmasi
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "Status absensi berhasil disetujui",
        showConfirmButton: false,
        timer: 1500, // Timer untuk auto-hide setelah 1.5 detik
      });

      // Reload the page after SweetAlert is shown
      window.location.reload();
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

      {cardNama && cardNama.nama && cardNama.role && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-2 border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{cardNama.nama}</h1>
            <p className="text-gray-600 text-sm font-semibold">{cardNama.role}</p>
            <span className="text-gray-600 text-sm pb-0 mb-0">Periode Absen : {period}</span>
          </div>
        </div>
      )}

      {/* Card-Style Absensi Table for Mobile */}
      <div className="bg-white shadow-md rounded-lg mb-4 overflow-hidden">
        <div className="hidden md:block">
          <table className="min-w-full border-collapse rounded-lg">
            <thead>
              <tr className="bg-green-500 text-white">
                {["No.", "Tanggal", "Lokasi", "IN", "OUT", "Status", "Aksi"].map(
                  (header, index) => (
                    <th
                      key={index}
                      className={`py-1 px-4 font-semibold text-center ${
                        index === 0 ? "first:rounded-tl-lg" : ""
                      } ${index === 6 ? "last:rounded-tr-lg" : ""}`}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {currentItems.filter((item) => !statusApproval[item.id_absen]).length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id_absen} className="border-b hover:bg-gray-100">
                    <td className="text-center py-1 px-4">{indexOfFirstItem + index + 1}</td>
                    <td className="text-center py-1 px-4">
                      {new Date(item.jam_mulai).toLocaleDateString("id-ID", {
                        timeZone: "Asia/Jakarta",
                      })}
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
                        className={`font-semibold ${
                          statusApproval[item.id_absen] ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {statusApproval[item.id_absen] ? "Disetujui" : "Belum Disetujui"}
                      </span>
                    </td>
                    <td className="text-center py-1 px-4">
                      <button
                        onClick={() => handleViewClick(item)}
                        className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition-colors duration-150"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-2 px-4 text-center italic">
                    Tidak ada data absensi yang belum disetujui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View as Cards */}
        <div className="md:hidden">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div
                key={item.id_absen}
                className="shadow-lg rounded-xl p-6 max-w-xs w-full mx-auto mb-6"
              >

                {/* Status */}
                <div className="mb-4 justify-between flex">
                  <p className="text-sm text-gray-500">Status :</p>
                  <span
                    className={`text-sm font-semibold ${
                      statusApproval[item.id_absen] ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {statusApproval[item.id_absen] ? "Disetujui" : "Belum Disetujui"}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Lokasi and Action Button (Eye Icon) */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <strong>Lokasi:</strong>
                    <p>{item.lokasi}</p>
                  </div>

                  {/* Action Button (Eye Icon) */}
                  <button
                    onClick={() => handleViewClick(item)}
                    className=" text-white hover:text-blue-600 px-4 py-2 bg-blue-600 rounded-lg"
                  >
                    <FontAwesomeIcon icon={faEye} className="text-lg" />
                  </button>
                </div>


                

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Jam Masuk dan Jam Keluar (Sejajar) */}
                <div className="flex justify-between items-center">
                  <div>
                    <strong className="text-gray-700">Masuk</strong>
                    <p className="text-sm text-gray-500">
                      {new Date(item.jam_mulai).toLocaleTimeString("id-ID", {
                        timeZone: "Asia/Jakarta",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-700">Keluar</strong>
                    <p className="text-sm text-gray-500">
                      {item.jam_selesai
                        ? new Date(item.jam_selesai).toLocaleTimeString("id-ID", {
                            timeZone: "Asia/Jakarta",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "---"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="italic text-center">Tidak ada data absensi.</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-5 rounded-full font-medium transition-all duration-200 ${
            currentPage === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-900 shadow-lg"
          }`}
        >
          &#8592;
        </button>
        <span className="text-sm font-semibold pt-2">{`${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-5 rounded-full font-medium transition-all duration-200 ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-900 shadow-lg"
          }`}
        >
          &#8594;
        </button>
      </div>

      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-6 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full relative max-h-[calc(100vh-150px)] overflow-y-auto">
            {/* Header Sticky */}
            <div className="sticky top-[-10px] z-10 bg-white px-4 pt-6 pb-4">
              {/* Tombol Tutup */}
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-5 text-4xl text-red-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full transition duration-200"
              >
                &times;
              </button>

              {/* Judul */}
              <h3 className="text-xl font-bold  text-left text-gray-700">Detail Lokasi :</h3>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {/* Lokasi */}
            <div className="bg-white rounded-lg shadow-lg p-4 mx-4 mb-3">
              <h4 className="text-base font-semibold text-gray-700">
                Lokasi: <span className="font-normal">{selectedItem.lokasi}</span>
              </h4>
              <hr className="my-4 border-gray-300" />

              <h4 className="text-base font-semibold text-gray-700">Rincian Tugas:</h4>
              <p className="text-gray-600 break-words">{selectedItem.deskripsi}</p>
            </div>

            {/* Grid: Absen Mulai & Absen Selesai */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mx-4">
              {/* Absen Mulai */}
              <div className="bg-green-100 rounded-lg shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <a
                    href={selectedItem.foto_mulai || "#"}
                    target={selectedItem.foto_mulai ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                  >
                    {selectedItem.foto_mulai ? (
                      <img
                        src={selectedItem.foto_mulai}
                        alt="Foto Mulai"
                        className="w-full h-48 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-xl text-gray-500">
                        Foto tidak tersedia
                      </div>
                    )}
                  </a>
                  <div>
                    <h4 className="text-base font-semibold text-gray-700">Absen Mulai</h4>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      {selectedItem.jam_mulai
                        ? new Date(selectedItem.jam_mulai).toLocaleTimeString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })
                        : "-"}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                      {selectedItem.jam_mulai
                        ? new Date(selectedItem.jam_mulai).toLocaleDateString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })
                        : "-"}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                      {selectedItem.lokasi_mulai ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            selectedItem.lokasi_mulai
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          Open in maps
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faRulerVertical} className="mr-2" />
                      {selectedItem.distance_start ? `${selectedItem.distance_start} Meter` : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Absen Selesai */}
              <div className="bg-red-100 rounded-lg shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <a
                    href={selectedItem.foto_selesai || "#"}
                    target={selectedItem.foto_selesai ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                  >
                    {selectedItem.foto_selesai ? (
                      <img
                        src={selectedItem.foto_selesai}
                        alt="Foto Selesai"
                        className="w-full h-48 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-xl text-gray-500">
                        Foto tidak tersedia
                      </div>
                    )}
                  </a>
                  <div>
                    <h4 className="text-base font-semibold text-gray-700">Absen Selesai</h4>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      {selectedItem.jam_selesai
                        ? new Date(selectedItem.jam_selesai).toLocaleTimeString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })
                        : "-"}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                      {selectedItem.jam_selesai
                        ? new Date(selectedItem.jam_selesai).toLocaleDateString("id-ID", {
                            timeZone: "Asia/Jakarta",
                          })
                        : "-"}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                      {selectedItem.lokasi_selesai ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            selectedItem.lokasi_selesai
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          Open in maps
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faRulerVertical} className="mr-2" />
                      {selectedItem.distance_end ? `${selectedItem.distance_end} Meter` : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Persetujuan */}
            <div className="my-4 flex justify-end mx-4">
              {!statusApproval[selectedItem?.id_absen] ? (
                <button
                  onClick={() => handleStatusUpdate(selectedItem.id_absen)}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md text-white ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {isLoading ? "Mengupdate..." : "Setujui"}
                </button>
              ) : (
                <button className="px-6 py-2 rounded-md bg-gray-300 text-white cursor-not-allowed">
                  Sudah Disetujui
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
    </div>
  );
};

export default DetailAbsensi;
