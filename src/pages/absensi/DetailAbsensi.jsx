import React, { useState, useEffect } from "react";
import { faArrowLeft, faMapMarkerAlt, faClock, faCalendarDay, faRulerVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";

const DetailAbsensi = ({ absen, onBackClick, onPostStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("");

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
        })} - ${endDate.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}`
      );
    };

    calculatePeriod();
  }, []);

  useEffect(() => {
    if (Array.isArray(absen) && absen.length > 0) {
      const firstItem = absen[0];
      setSelectedItem(firstItem);
      setIsApproved(firstItem?.status === 1);
    }
  }, [absen]);

  const handleViewClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsApproved(item?.status === 1);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleStatusUpdate = async () => {
    if (!selectedItem?.id_absen) {
      console.error("ID is required to update status");
      return;
    }

    setIsLoading(true);
    const newStatus = 1;
    try {
      await onPostStatus(selectedItem.id_absen, newStatus);
      setIsApproved(true);
      handleCloseModal();

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

      {selectedItem && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-2 border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{selectedItem.nama}</h1>
            <p className="text-gray-600 text-lg font-semibold">{selectedItem.role}</p>
            <span className="text-gray-600 text-sm pb-0 mb-0">Periode Absen : {period}</span>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg mb-4">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-green-500 text-white">
              <th className="py-2 px-4 font-semibold text-center">No.</th>
              <th className="py-2 px-4 font-semibold text-center">Lokasi</th>
              <th className="py-2 px-4 font-semibold text-center">Jam Mulai</th>
              <th className="py-2 px-4 font-semibold text-center">Jam Pulang</th>
              <th className="py-2 px-4 font-semibold text-center">Keterangan</th>
              <th className="py-2 px-4 font-semibold text-center">Tanggal</th>
              <th className="py-2 px-4 font-semibold text-center">Status</th>
              <th className="py-2 px-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {absen.length > 0 ? (
              absen.map((item, index) => (
                <tr key={item.id_absen} className="border-b hover:bg-gray-100">
                  <td className="text-center px-4 py-2">{index + 1}</td>
                  <td className="text-center py-2 px-4">{item.lokasi}</td>
                  <td className="text-center py-2 px-4">
                    {new Date(item.jam_mulai).toLocaleTimeString("id-ID", {
                      timeZone: "Asia/Jakarta",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false, // Use 24-hour format
                    })}
                  </td>

                  <td className="text-center py-2 px-4">
                    {item.jam_selesai
                      ? new Date(item.jam_selesai).toLocaleTimeString("id-ID", {
                          timeZone: "Asia/Jakarta",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false, // Use 24-hour format
                        })
                      : "belum pulang"}
                  </td>

                  <td
                    className={`text-center ${
                      new Date(item.jam_mulai).getHours() >= 8 ? "text-red-500 font-bold" : "text-green-500 font-bold"
                    }`}
                  >
                    {new Date(item.jam_mulai).getHours() >= 8 ? "Terlambat" : "Tepat Waktu"}
                  </td>

                  <td className="text-center py-2 px-4">
                    {new Date(item.jam_mulai).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}
                  </td>
                  <td className="text-center py-2 px-4">
                    <span className={`font-semibold ${item.status === 1 ? "text-green-500" : "text-red-500"}`}>
                      {item.status === 1 ? "Disetujui" : "Belum Disetujui"}
                    </span>
                  </td>
                  <td className="text-center py-2 px-4">
                    <button
                      onClick={() => handleViewClick(item)}
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors duration-150"
                    >
                      Lihat
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-2 px-4 text-center italic">
                  Tidak ada data absensi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full relative max-h-screen overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-1 right-5 text-4xl text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full transition duration-200"
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-4 text-left text-gray-700">Detail Lokasi : </h3>

            {error && <p className="text-red-500">{error}</p>}

            <div className="bg-white rounded-lg shadow-lg p-4 mb-3">
              <h4 className="text-base font-semibold text-gray-700">
                Lokasi: <span className="font-normal">{selectedItem.lokasi}</span>
              </h4>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 mb-3">
              <h4 className="text-base font-semibold text-gray-700">Rincian Tugas:</h4>
              <p className="text-gray-600 break-words overflow-hidden">{selectedItem.deskripsi}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Absen Mulai */}
              <div className="bg-green-100 rounded-lg shadow-lg p-4">
                {" "}
                {/* Warna hijau untuk Absen Mulai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Link untuk gambar */}
                  <a href={selectedItem.foto_mulai} target="_blank" rel="noopener noreferrer">
                    <img src={selectedItem.foto_mulai} alt="Foto Mulai" className="w-full h-48 object-contain rounded-xl" />
                  </a>
                  <div>
                    <h4 className="text-base font-semibold text-gray-700">Absen Mulai</h4>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      {new Date(selectedItem.jam_mulai).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                      {new Date(selectedItem.jam_mulai).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}
                    </p>
                    {/* Lokasi Mulai sebagai tautan ke Google Maps */}
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
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
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faRulerVertical} className="mr-2" />
                      {selectedItem.distance_start} Meter
                    </p>
                  </div>
                </div>
              </div>

              {/* Absen Selesai */}
              <div className="bg-red-100 rounded-lg shadow-lg p-4">
                {" "}
                {/* Warna merah untuk Absen Selesai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Link untuk gambar */}
                  <a href={selectedItem.foto_selesai} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedItem.foto_selesai}
                      alt="Foto Selesai"
                      className="w-full h-48 object-contain rounded-xl"
                    />
                  </a>
                  <div>
                    <h4 className="text-base font-semibold text-gray-700">Absen Selesai</h4>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      {new Date(selectedItem.jam_selesai).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })}
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
                      {new Date(selectedItem.jam_selesai).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}
                    </p>
                    {/* Lokasi Selesai sebagai tautan ke Google Maps */}
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
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
                    </p>
                    <p className="text-gray-700 flex items-center">
                      <FontAwesomeIcon icon={faRulerVertical} className="mr-2" />
                      {selectedItem.distance_end} Meter
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              {!isApproved ? (
                <button
                  onClick={handleStatusUpdate}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md text-white ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {isLoading ? "Mengupdate..." : "Setujui"}
                </button>
              ) : (
                <button className="px-6 py-2 rounded-md bg-gray-300 text-white cursor-not-allowed">Sudah Disetujui</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailAbsensi;