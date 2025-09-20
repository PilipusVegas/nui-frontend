import React, { useState, useEffect } from "react";
import { faArrowLeft, faMapMarkerAlt, faRulerVertical, faEye, faClock, faCalendarAlt, faUser, faArrowRight, faCalendarCheck, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { Modal } from "../../components/";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader } from "../../components";

const DetailAbsensi = () => {
  const user = getUserFromToken();
  const { id_user } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [selectedAbsen, setSelectedAbsen] = useState(null);
  const [cardNama, setCardNama] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [statusApproval, setStatusApproval] = useState({});
  const [CurrentItems, setCurrentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [absen, setAbsen] = useState([]);
  const itemsPerPage = 30;
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
    if (!id_user) return;
    const fetchAbsenData = async () => {
      const res = await fetchWithJwt(`${apiUrl}/absen/${id_user}`);
      const data = await res.json();
      setCardNama(data);
      setAbsen(data.absen || []);
      setEmployeeInfo({
        nama: data.nama,
        nip: data.nip,
        perusahaan: data.perusahaan,
        role: data.role,
      });
    };
    fetchAbsenData();
  }, [id_user, apiUrl]);


  const handleViewClick = (item) => {
    setSelectedItem(item);
    setSelectedAbsen(item);
    setIsModalOpen(true);
    setIsApproved(item?.status === 1);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

      toast.success("Status absensi berhasil disetujui", { duration: 3000, position: "top-right", });
      await fetchAbsenData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Gagal memperbarui status. Silakan coba lagi.", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDistance = (meters) => {
    if (meters == null) return "-";
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(2)} km`; // 2 desimal
  };


  return (
    <div className="flex flex-col justify-start">
      <SectionHeader title="Detail Persetujuan Presensi" subtitle="Detail Persetujuan Absensi Karyawan" onBack={() => navigate("/persetujuan-absensi")} />

      {cardNama && (
        <div className="w-full bg-white border border-green-200 rounded-2xl shadow-md p-4 mb-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
            <div className="flex flex-col gap-1 sm:gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 uppercase">{cardNama.nama}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                <p><span className="font-medium text-green-600">NIP:</span> {cardNama.nip}</p>
                <p><span className="font-medium text-green-600">Divisi:</span> {cardNama.role}</p>
                <p><span className="font-medium text-green-600">Perusahaan:</span> {cardNama.perusahaan}</p>
              </div>
            </div>
            <div className="sm:text-right text-sm text-gray-600 border-t sm:border-t-0 sm:border-l sm:pl-4 border-green-100 pt-2 sm:pt-0">
              <p className="font-semibold text-green-600">Periode Absen</p>
              <p className="text-sm">{formatFullDate(getDefaultPeriod().start)} s/d {formatFullDate(getDefaultPeriod().end)}</p>
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-400 rounded-md px-3 py-2 text-sm text-green-800 shadow-sm">
            <p className="font-semibold mb-1">Catatan:</p>
            <p className="text-xs sm:text-sm leading-tight tracking-wide">
              Data ini akan dihapus otomatis setelah periode berganti. Pastikan seluruh absensi telah <span className="font-semibold text-green-700">disetujui</span> sebelum akhir periode agar masuk ke proses penggajian karyawan secara valid.
            </p>
          </div>
        </div>
      )}


      {/* Card-Style Absensi Table for Mobile */}
      <div className="rounded-lg mb-4 overflow-hidden">
        <div className="hidden md:block">
          <table className="min-w-full border-collapse rounded-lg">
            <thead>
              <tr className="bg-green-600 text-white">
                {["Tanggal", "Shift", "Lokasi Mulai", "Lokasi Selesai", "IN", "OUT", "LATE", "Status", "Menu"].map(
                  (header, index) => (
                    <th key={index} className={`py-1 mb-1 px-4 font-semibold text-center ${index === 0 ? "first:rounded-tl-lg" : ""} ${index === 6 ? "last:rounded-tr-lg" : ""}`}>
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
                      {formatFullDate(item.jam_mulai)}
                    </td>
                    <td className="text-center py-1 px-4 text-xs">{item.shift}</td>
                    <td className="py-1 px-4 text-xs text-center font-semibold tracking-wider uppercase">{item.lokasi_mulai || "---"}</td>
                    <td className="py-1 px-4 text-xs text-center font-semibold tracking-wider uppercase">{item.lokasi_selesai || "---"}</td>
                    <td className="text-center py-1 px-4 text-xs">
                      {formatTime(item.jam_mulai)}
                    </td>
                    <td className="text-center text-xs py-1 px-4">
                      {item.jam_selesai ? new Date(item.jam_selesai).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false, }) : "---"}
                    </td>
                    <td className={`text-center py-1 px-4 text-xs ${item.keterlambatan && item.keterlambatan !== "00:00" ? "text-red-500 font-semibold" : ""}`}>
                      {item.keterlambatan || "--:--"}
                    </td>
                    <td className="text-center py-1 px-4">
                      <span className={`font-semibold px-2 py-1 rounded-full text-[10px] tracking-wider ${item.status == 1 ? "bg-green-600 text-white px-3" : "bg-red-600 text-white"}`}>
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
                    {item.lokasi_mulai || "---"}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">Status:</p>
                    <div className={`w-3 h-3 rounded-full ${statusApproval[item.id_absen] ? "bg-green-500" : "bg-red-500"}`}></div>
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
                      {formatTime(item.jam_mulai)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      <strong className="text-gray-700">Keluar:</strong>{" "}
                      {formatTime(item.jam_selesai) || "---"}
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

      {/* PAGINATION */}
      <div className="relative w-full mt-6 flex items-center justify-center">
        <div className="absolute left-0">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700 text-white shadow-md"}`} title="Halaman Sebelumnya">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>
        <div className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm">
          Halaman {currentPage} / {totalPages}
        </div>
        <div className="absolute right-0">
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700 text-white shadow-md"}`} title="Halaman Berikutnya">
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>


      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Detail Absensi" note="Periksa detail absensi karyawan sebelum melakukan persetujuan." size="xl">
        <div className="space-y-4 text-sm text-gray-700">
          {/* === Identitas Karyawan === */}
          <div className="bg-white rounded-xl p-2.5 px-4 shadow-sm border border-gray-200">
            <h4 className="text-gray-700 font-medium mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 text-base">
              <FontAwesomeIcon icon={faUser} className="text-green-600" />
              Informasi Karyawan
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <p><span className="font-semibold">Nama:</span> {employeeInfo?.nama}</p>
              <p><span className="font-semibold">NIP:</span> {employeeInfo?.nip}</p>
              <p><span className="font-semibold">Perusahaan:</span> {employeeInfo?.perusahaan}</p>
              <p><span className="font-semibold">Role:</span> {employeeInfo?.role}</p>
            </div>
          </div>

          {/* === Detail Presensi === */}
          <div className="bg-white border border-gray-200 rounded-2xl py-3 px-4 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-1">
              <div className="flex items-center gap-3 p-1">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-green-600 text-2xl" />
                <div className="flex flex-col tracking-wide">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Ringkasan Absensi
                  </h3>
                  <p className="text-xs text-gray-600 -mt-0.5">
                    Detail Kehadiran Karyawan
                  </p>
                </div>
              </div>
              {selectedAbsen?.jam_mulai && (
                <p className="text-sm font-medium text-gray-600">
                  {formatFullDate(selectedAbsen.jam_mulai)}
                </p>
              )}
            </div>

            {selectedAbsen ? (
              <div className="space-y-2">
                {/* Shift & Status */}
                <div className="flex justify-between items-center mb-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                  {/* Shift */}
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="text-green-500 text-sm" />
                    <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
                      {selectedAbsen.shift || "-"}
                    </h3>
                  </div>

                  {/* Status */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors ${selectedAbsen.status === 1 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {selectedAbsen.status === 1 ? "Sudah Disetujui" : "Menunggu Persetujuan"}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: "Absen Masuk", jam: selectedAbsen.jam_mulai, lokasi: selectedAbsen.lokasi_mulai, titik: selectedAbsen.titik_mulai_pengguna, foto: selectedAbsen.foto_mulai, jarak: selectedAbsen.jarak_mulai, keterlambatan: selectedAbsen.keterlambatan },
                    { label: "Absen Pulang", jam: selectedAbsen.jam_selesai, lokasi: selectedAbsen.lokasi_selesai, titik: selectedAbsen.titik_selesai_pengguna, foto: selectedAbsen.foto_selesai, jarak: selectedAbsen.jarak_selesai },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1">

                      {/* Header */}
                      <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-800">{item.label}</h4>
                      </div>

                      {/* Konten */}
                      <div className="flex p-4 gap-4">
                        {/* Foto */}
                        <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200 hover:shadow-inner transition-transform transform hover:scale-105">
                          {item.foto ? (
                            <a href={item.foto} target="_blank" rel="noopener noreferrer">
                              <img src={item.foto} alt={item.label} className="w-full h-full object-cover" />
                            </a>
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-400 text-xs">Tidak ada foto</div>
                          )}
                        </div>

                        {/* Detail */}
                        <div className="flex flex-col justify-between text-sm text-gray-700 w-full space-y-2">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                            <span className="font-medium text-gray-900">Waktu:</span>
                            <span>{item.jam ? formatTime(item.jam) : "-"}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
                            <span className="font-medium text-gray-900">Tanggal:</span>
                            <span>{formatFullDate(item.jam)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-xs" />
                            <span className="font-medium text-gray-900">Lokasi Kerja:</span>
                            <span>{item.lokasi || "-"}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faRulerVertical} className="text-gray-400 text-xs" />
                            <span className="font-medium text-gray-900">Lokasi Absen:</span>
                            {item.titik ? (
                              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.titik)}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">
                                Lihat di GMaps
                              </a>
                            ) : (
                              <span>-</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faRulerVertical} className="text-gray-400 text-xs" />
                            <span className="font-medium text-gray-900">Jarak:</span>
                            <span>{formatDistance(item.jarak)}</span>
                          </div>

                          {i === 0 && item.keterlambatan !== "00:00" && (
                            <div className="text-red-600 font-semibold">
                              Keterlambatan: {item.keterlambatan}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Deskripsi Karyawan */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Keterangan Karyawan:</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedAbsen.deskripsi || <span className="italic text-gray-400">Tidak ada keterangan</span>}
                  </p>
                </div>


                {/* Aksi HRD */}
                {(user.id_role === 1 || user.id_role === 4) && (
                  <div className="flex justify-end">
                    {selectedAbsen.status !== 1 ? (
                      <button onClick={() => handleStatusUpdate(selectedAbsen.id_absen)} disabled={isLoading} className={`px-6 py-2 rounded-lg text-white font-medium tracking-wide transition ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                        {isLoading ? "Memproses..." : "Setujui"}
                      </button>
                    ) : (
                      <button className="px-6 py-2 rounded-lg bg-gray-300 text-white cursor-not-allowed">
                        Sudah Disetujui
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">Tidak ada data presensi.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DetailAbsensi;
