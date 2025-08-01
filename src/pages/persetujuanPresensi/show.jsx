import React, { useState, useEffect } from "react";
import { faArrowLeft, faMapMarkerAlt, faClock, faCalendarDay, faRulerVertical, faEye, faTimes, faClipboardList, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import {getDefaultPeriod} from "../../utils/getDefaultPeriod";

const DetailAbsensi = () => {
  const user = getUserFromToken();
  const { id_user } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cardNama, setCardNama] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [statusApproval, setStatusApproval] = useState({});
  const [CurrentItems, setCurrentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [absen, setAbsen] = useState([]);
  const itemsPerPage = 15;
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = absen.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(absen.length / itemsPerPage);
    const fetchAbsenData = async () => {
      try {
        const response = await fetchWithJwt(`${apiUrl}/absen/${id_user}`);
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

  useEffect(() => {
    if (id_user) {
      fetchAbsenData();
    }
  }, [id_user, apiUrl]);

  useEffect(() => {
    const fetchAbsenData = async () => {
      try {
        const response = await fetchWithJwt(`${apiUrl}/absen/${id_user}`);
        if (!response.ok) {
          throw new Error("Failed to fetch absen data");
        }
        const data = await response.json();
        // console.log("Data fetched:", data);
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
      const response = await fetchWithJwt(`${apiUrl}/absen/status/${id_absen}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1 }),
      });
  
      if (!response.ok) throw new Error("Gagal memperbarui status");
  
      setStatusApproval((prevState) => ({
        ...prevState,
        [id_absen]: true,
      }));
  
      setCurrentItems((prevItems) =>
        prevItems.filter((item) => item.id_absen !== id_absen)
      );
  
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "Status absensi berhasil disetujui",
        showConfirmButton: false,
        timer: 1500,
      });
  
      await fetchAbsenData();
      setIsModalOpen(false); 
    } catch (error) {
      console.error("Failed to update status:", error);
      setError("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const onBackClick = () => navigate("/persetujuan-presensi");

  return (
    <div className="flex flex-col justify-start">
      <div className="flex items-center mb-4">
        <FontAwesomeIcon icon={faArrowLeft} title="Kembali" onClick={onBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-2.5 sm:p-3 shadow-lg" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 pb-1">Detail Persetujuan Presensi</h2>
      </div>

      {cardNama && cardNama.nama && cardNama.role && (
        <div className="w-full bg-white border border-green-200 rounded-2xl shadow-md px-5 py-5 mb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            
            {/* Kiri: Informasi Karyawan */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 uppercase">{cardNama.nama}</h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-0 gap-y-2 text-sm text-gray-700">
                <p><span className="font-medium text-green-600">NIP:</span> {cardNama.nip}</p>
                <p><span className="font-medium text-green-600">Divisi:</span> {cardNama.role}</p>
                <p><span className="font-medium text-green-600">Perusahaan:</span> {cardNama.perusahaan}</p>
              </div>
            </div>

            {/* Kanan: Periode Absen */}
            <div className="mt-3 sm:mt-0 sm:text-right text-sm text-gray-600 border-t sm:border-t-0 sm:border-l sm:pl-4 border-green-100 pt-3 sm:pt-0">
              <p className="font-semibold text-green-600">Periode Absen</p>
              <p>{getDefaultPeriod().start} s/d {getDefaultPeriod().end}</p>
            </div>
          </div>

          {/* Catatan Informasi */}
          <div className="mt-5 bg-green-50 border-l-4 border-green-400 rounded-md px-4 py-3 text-sm text-green-800 shadow-sm">
            <p className="font-semibold mb-1">📌 Catatan Penting:</p>
            <p className="text-[10px] sm:text-sm tracking-wide"> Data ini akan dihapus secara otomatis setelah periode berganti. Pastikan seluruh absensi telah <span className="font-semibold text-green-700">disetujui</span> sebelum akhir periode, agar masuk ke dalam proses penggajian karyawan secara valid dan menyeluruh.</p>
          </div>
        </div>
      )}

      {/* Card-Style Absensi Table for Mobile */}
      <div className="rounded-lg mb-4 overflow-hidden">
        <div className="hidden md:block">
          <table className="min-w-full border-collapse rounded-lg">
            <thead>
              <tr className="bg-green-600 text-white">
                {["Tanggal", "Lokasi", "Shift", "IN", "OUT", "LATE", "Status", "Menu"].map(
                  (header, index) => (
                    <th key={index} className={`py-1 mb-1 px-4 font-semibold text-center ${index === 0 ? "first:rounded-tl-lg" : ""
                      } ${index === 6 ? "last:rounded-tr-lg" : ""}`}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
            {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id_absen} className="border-b hover:bg-gray-100">
                    <td className="text-center py-1 px-4 text-xs">
                      {new Date(item.jam_mulai).toLocaleDateString("id-ID", {
                        timeZone: "Asia/Jakarta",
                      })}
                    </td>
                    <td className="py-1 px-4 text-xs font-semibold tracking-wider uppercase">{item.lokasi}</td>
                    <td className="text-center py-1 px-4 text-xs">{item.shift || "---"}</td>
                    <td className="text-center py-1 px-4 text-xs">
                      {new Date(item.jam_mulai).toLocaleTimeString("id-ID", {
                        timeZone: "Asia/Jakarta",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td className="text-center text-xs py-1 px-4">
                      {item.jam_selesai ? new Date(item.jam_selesai).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false,}) : "---"}
                    </td>
                    <td className={`text-center py-1 px-4 text-xs ${item.keterlambatan && item.keterlambatan !== "00:00" ? "text-red-500 font-semibold" : ""}`}>
                      {item.keterlambatan || "00:00"}
                    </td>
                    <td className="text-center py-1 px-4">
                      <span className={`font-semibold px-2 py-1 rounded-full text-[10px] tracking-wider ${ item.status == 1 ? "bg-green-600 text-white px-3" : "bg-red-600 text-white" }`}>
                        {item.status == 1 ? "Approved" : "Unapproved"}
                      </span>
                    </td>
                    <td className="text-center text-xs py-1 px-4">
                      <button onClick={() => handleViewClick(item)} className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition-colors duration-150">
                        <FontAwesomeIcon icon={faEye} className="text-xs mr-1" />
                        Detail
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
              <div key={item.id_absen} className="p-4 sm:p-6 mb-2 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                {/* Status */}
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500 items-center">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-lg mr-1 text-green-600" />
                    {item.lokasi}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">Status:</p>
                    <div className={`w-3 h-3 rounded-full ${statusApproval[item.id_absen] ? "bg-green-500" : "bg-red-500" }`}></div>
                  </div>
                </div>

                <hr className="border-gray-500 mb-4" />

                {/* Lokasi */}
                <div className="mb-0"></div>

                {/* Jam Masuk dan Keluar */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      <strong className="text-gray-700">Masuk:</strong>{" "}
                      {new Date(item.jam_mulai).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false,})}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      <strong className="text-gray-700">Keluar:</strong>{" "}
                      {item.jam_selesai ? new Date(item.jam_selesai).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false, }) : "---"}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => handleViewClick(item)} className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-lg transition-colors duration-200">
                      <FontAwesomeIcon icon={faEye} className="text-sm" />
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="italic text-center text-gray-500">Tidak ada data absensi.</p>
          )}
        </div>
      </div>

      <div className="relative w-full mt-6 flex items-center justify-center">
        {/* Panah Kiri (Prev) di KIRI POJOK */}
        <div className="absolute left-0">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${ currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700 text-white shadow-md"}`} title="Halaman Sebelumnya">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>

        {/* Indikator Tengah */}
        <div className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm">
          Halaman {currentPage} / {totalPages}
        </div>

        {/* Panah Kanan (Next) di KANAN POJOK */}
        <div className="absolute right-0">
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200
              ${ currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700 text-white shadow-md"}`}
            title="Halaman Berikutnya"
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>


      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center px-4 sm:px-6">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-gray-200 relative">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-gray-800">Detail Presensi</h3>
              <button onClick={handleCloseModal} className="text-2xl text-red-500 hover:text-gray-700">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 text-sm text-gray-700">
              {/* Shift & Lokasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <h4 className="text-gray-500 font-medium mb-1">Shift</h4>
                  <p className="text-base font-bold text-blue-600">{selectedItem.shift || "Tidak tersedia"}</p>
                </div>
                <div>
                  <h4 className="text-gray-500 font-medium mb-1">Lokasi</h4>
                  <p className="text-gray-700">{selectedItem.lokasi || <span className="italic text-gray-400">Tidak tersedia</span>}</p>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-gray-500 font-medium mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faClipboardList} className="text-indigo-500" />
                  Rincian Tugas
                </h4>
                <p className="text-gray-700 break-words">{selectedItem.deskripsi || <span className="italic text-gray-400">Tidak ada deskripsi</span>}</p>
              </div>

              {/* Absen Mulai & Selesai */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Komponen Reusable */}
                {[{ title: "Absen Mulai", color: "green", foto: selectedItem.foto_mulai, jam: selectedItem.jam_mulai, lokasi: selectedItem.lokasi_mulai, distance: selectedItem.distance_start}, 
                  { title: "Absen Selesai", color: "red", foto: selectedItem.foto_selesai, jam: selectedItem.jam_selesai, lokasi: selectedItem.lokasi_selesai, distance: selectedItem.distance_end}
                ].map((item, idx) => (
                  <div key={idx} className={`flex border rounded-xl shadow-sm overflow-hidden bg-gradient-to-tr from-${item.color}-50 to-white border-${item.color}-200`}>
                    {/* Foto */}
                    <div className="w-1/2 bg-white">
                      {item.foto ? (
                        <a href={item.foto} target="_blank" rel="noopener noreferrer">
                          <img src={item.foto} alt={`Foto ${item.title}`} className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <div className="flex items-center justify-center h-full text-zinc-400 bg-zinc-100">Tidak ada foto</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="w-1/2 p-4 flex flex-col justify-between">
                      <div>
                        <p className={`text-xs font-medium uppercase text-${item.color}-500`}>{item.title}</p>
                        <h3 className="text-lg font-semibold">
                          {item.jam ? new Date(item.jam).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" }) : <span className="italic text-zinc-400">-</span>}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {item.jam ? new Date(item.jam).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }) : <span className="italic">-</span>}
                        </p>
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className={`text-${item.color}-400`} />
                          {item.lokasi ? (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.lokasi)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                              Lihat Lokasi
                            </a>
                          ) : (
                            <span className="italic text-zinc-400">Tidak tersedia</span>
                          )}
                        </p>
                        <p className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faRulerVertical} className={`text-${item.color}-400`} />
                          {item.distance ? `${item.distance} m` : <span className="italic text-zinc-400">-</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tombol Persetujuan */}
              {(user.id_role === 1 || user.id_role === 4 || user.id_role === 6) && (
                <div className="flex justify-end pt-4">
                  {!statusApproval[selectedItem?.id_absen] ? (
                    <button
                      onClick={() => handleStatusUpdate(selectedItem.id_absen)}
                      disabled={isLoading}
                      className={`px-6 py-2 rounded-md text-white transition font-medium ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                      {isLoading ? "Mengupdate..." : "Setujui"}
                    </button>
                  ) : (
                    <button className="px-6 py-2 rounded-md bg-gray-300 text-white cursor-not-allowed">
                      Sudah Disetujui
                    </button>
                  )}
                </div>
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
