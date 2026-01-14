import React, { useState, useEffect } from "react";
import { faEye, faClock, faUser, faCalendarCheck, faSort, faSortUp, faSortDown, faBus, faMotorcycle, faMoon, faFileSignature, faMoneyBillWave, faExclamationTriangle, faUserCheck, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWithJwt, getUserFromToken } from "../../../utils/jwtHelper";
import { getDefaultPeriod } from "../../../utils/getDefaultPeriod";
import { Modal } from "../../../components";
import { formatFullDate, formatTime } from "../../../utils/dateUtils";
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader, SearchBar, Pagination } from "../../../components";

const DetailAbsensi = () => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const user = getUserFromToken();
  const { id_user } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [selectedAbsen, setSelectedAbsen] = useState(null);
  const [cardNama, setCardNama] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [absen, setAbsen] = useState([]);
  const itemsPerPage = 25;
  const Navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const filteredAbsen = absen.filter((item) => {
    const tanggal = formatFullDate(item.jam_mulai).toLowerCase();
    const lokasiMulai = (item.lokasi_mulai || "").toLowerCase();
    const lokasiSelesai = (item.lokasi_selesai || "").toLowerCase();
    const shift = (item.shift || "").toLowerCase();
    return (
      tanggal.includes(searchTerm) ||
      lokasiMulai.includes(searchTerm) ||
      lokasiSelesai.includes(searchTerm) ||
      shift.includes(searchTerm)
    );
  });

  const sortedAbsen = [...filteredAbsen].sort((a, b) => {
    if (!sortColumn) return 0;

    let valA, valB;
    switch (sortColumn) {
      case "tanggal":
        valA = new Date(a.jam_mulai).getTime();
        valB = new Date(b.jam_mulai).getTime();
        break;
      case "status":
        valA = Number(a.status ?? 0);
        valB = Number(b.status ?? 0);
        break;
      default:
        valA = String(a[sortColumn] || "").toLowerCase();
        valB = String(b[sortColumn] || "").toLowerCase();
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAbsen.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAbsen.length / itemsPerPage);

  const handleSearch = (query) => {
    setSearchTerm(query.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const fetchAbsenData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithJwt(`${apiUrl}/absen/${id_user}`);
      if (!response.ok) throw new Error("Gagal memuat data absensi");

      const data = await response.json();
      setCardNama(data);
      setAbsen(data.absen || []);
      setEmployeeInfo({
        nama: data.nama,
        nip: data.nip,
        perusahaan: data.perusahaan,
        role: data.role,
        kendaraan: data.status_kendaraan,
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
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
        kendaraan: data.status_kendaraan,
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
    const selectedAbsen = absen.find((item) => item.id_absen === id_absen);
    const conditions = calculateConditions(selectedAbsen);
    try {
      setIsLoading(true);

      const response = await fetchWithJwt(`${apiUrl}/absen/status/${id_absen}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1, }),
      });

      if (!response.ok) throw new Error("Gagal memperbarui status");

      const result = await response.json();

      toast.success("Absensi disetujui.", { duration: 3000 });

      // Ambil nilai asli dari calculateConditions agar detail transportnya tetap ada
      const { transport_pribadi, transport_umum, night_shift } = conditions;

      // Tidak punya tunjangan apa pun
      if (!transport_pribadi && !transport_umum && !night_shift) {
        await fetchAbsenData();
        setIsModalOpen(false);
        return;
      }

      // Tentukan isi Swal
      const tunjanganList = [];
      if (transport_pribadi) tunjanganList.push("Tunjangan Transportasi (Kendaraan Pribadi)");
      if (transport_umum) tunjanganList.push("Tunjangan Transportasi (Kendaraan Umum)");
      if (night_shift) tunjanganList.push("Tunjangan Shift Malam");

      Swal.fire({
        title: "Absensi Disetujui",
        text: "Absensi karyawan telah disetujui.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#10B981",
      });

      await fetchAbsenData();
      setIsModalOpen(false);

    } catch (error) {
      toast.error("Gagal memperbarui status. Silakan coba lagi.", {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDistance = (meters) => {
    if (meters == null) return "-";
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const handleReject = async (id_absen) => {
    if (!id_absen) return;

    const result = await Swal.fire({
      title: "Konfirmasi Penolakan Absensi",
      html: `
        <div class="text-gray-700 text-sm leading-relaxed">
          <p>Apakah Anda yakin ingin <b class="text-red-600">menolak absensi ini</b>?</p>
          <p class="mt-2 text-[13px] text-red-600 font-medium">
            Data absensi yang ditolak <u>tidak akan masuk ke proses rekapitulasi penggajian</u> 
            dan <u>tidak akan tampil pada rekapitulasi bulanan</u>.
          </p>
          <p class="mt-3 text-[13px] text-gray-600">
            Tindakan ini bersifat <b>final</b> dan tidak dapat dibatalkan.
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Tolak Absensi",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      const response = await fetchWithJwt(`${apiUrl}/absen/status/${id_absen}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 2 }),
      });

      if (!response.ok) throw new Error("Gagal menolak absensi");

      toast.success("Absensi berhasil ditolak dan tidak masuk ke penggajian.", {
        duration: 5000,
      });
      await fetchAbsenData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Gagal menolak absensi. Silakan coba lagi.", { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateConditions = (absen) => {
    const nightShiftIds = [2, 3];
    const excludedLocations = [63, 64, 66];

    const idShift = +absen.id_shift;
    const locStart = +absen.id_lokasi_mulai;
    const locEnd = +absen.id_lokasi_selesai;
    const statusKendaraan = +absen.status_kendaraan;

    const transportAllowed = !(excludedLocations.includes(locStart) && excludedLocations.includes(locEnd));

    return {
      night_shift: nightShiftIds.includes(idShift),
      transport_pribadi: statusKendaraan === 1 && transportAllowed,
      transport_umum: statusKendaraan === 3 && transportAllowed,
    };
  };


  return (
    <div className="flex flex-col justify-start">
      <SectionHeader title="Detail Persetujuan Presensi" subtitle="Detail Persetujuan Absensi Karyawan" onBack={() => Navigate("/pengajuan-absensi")} />

      {cardNama ? (
        <div className="w-full rounded-xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-semibold">
                {cardNama.nama?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight hover:text-emerald-700 cursor-pointer transition-colors" onClick={() => Navigate(`/karyawan/show/${cardNama.id_user}`)}>
                  {cardNama.nama}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                    {cardNama.role || "–"}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md">
                    {cardNama.perusahaan || "–"}
                  </span>
                  <span className="text-gray-400">NIP:</span>
                  <span className="font-medium text-gray-800">{cardNama.nip || "–"}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-3 border-t sm:border-t-0 sm:border-l border-emerald-100 pt-4 sm:pt-0 sm:pl-6">
              <div className="text-sm text-gray-700">
                <p className="font-medium text-emerald-600">Periode Absen</p>
                <p className="font-semibold mt-0.5">
                  {formatFullDate(getDefaultPeriod().start)} – {formatFullDate(getDefaultPeriod().end)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white border border-emerald-100 rounded-xl shadow-sm p-5 space-y-3 animate-pulse">
          <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 w-2/5 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}

      <SearchBar onSearch={handleSearch} placeholder="Cari Tanggal / Lokasi Absen..." className="my-4" />

      <div className="rounded-lg mb-4 overflow-hidden">
        <div className="hidden md:block">
          <table className="min-w-full border-collapse rounded-lg">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="py-2 px-4 font-semibold text-center first:rounded-tl-lg cursor-pointer" onClick={() => handleSort("tanggal")}>
                  <div className="flex items-center justify-center gap-3">
                    Tanggal
                    <FontAwesomeIcon icon={sortColumn === "tanggal" ? sortDirection === "asc" ? faSortUp : faSortDown : faSort} className="text-xs" />
                  </div>
                </th>

                {["Shift", "Lokasi Mulai", "Lokasi Selesai", "IN", "OUT", "LATE"].map((header, i) => (
                  <th key={i} className="py-2 px-4 font-semibold text-center">
                    {header}
                  </th>
                ))}

                <th className="py-2 px-4 font-semibold text-center cursor-pointer" onClick={() => handleSort("status")}>
                  <div className="flex items-center justify-center gap-3">
                    Status
                    <FontAwesomeIcon icon={sortColumn === "status" ? sortDirection === "asc" ? faSortUp : faSortDown : faSort} className="text-xs" />
                  </div>
                </th>

                <th className="py-2 px-4 font-semibold text-center last:rounded-tr-lg">
                  Menu
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="9" className="py-6">
                    <LoadingSpinner size="md" />
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td colSpan="9">
                    <ErrorState message={error} onRetry={fetchAbsenData} />
                  </td>
                </tr>
              )}
              {!isLoading && !error && currentItems.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <EmptyState message="Tidak ada data absensi yang belum disetujui." />
                  </td>
                </tr>
              )}
              {!isLoading && !error &&
                currentItems.map((item) => (
                  <tr key={item.id_absen} className="border-b hover:bg-gray-100">
                    <td className="text-center py-1 px-4 text-xs">{formatFullDate(item.jam_mulai)}</td>
                    <td className="text-center py-1 px-4 text-xs">{item.shift}</td>
                    <td className="py-1 px-4 text-xs text-center font-semibold tracking-wider uppercase">{item.lokasi_mulai || "---"}</td>
                    <td className="py-1 px-4 text-xs text-center font-semibold tracking-wider uppercase">{item.lokasi_selesai || "---"}</td>
                    <td className="text-center py-1 px-4 text-xs">{formatTime(item.jam_mulai)}</td>
                    <td className="text-center text-xs py-1 px-4">{item.jam_selesai ? formatTime(item.jam_selesai) : "---"}</td>
                    <td className={`text-center py-1 px-4 text-xs ${item.keterlambatan && item.keterlambatan !== "00:00" ? "text-red-500 font-semibold" : ""}`}>
                      {item.keterlambatan || "--:--"}
                    </td>
                    <td className="text-center py-1 px-4">
                      <span className={`inline-flex y-center items-center font-semibold px-3 py-1 rounded-full text-[10px] tracking-wider ${item.status == 1 ? "bg-green-600 text-white" : item.status == 2 ? "bg-red-600 text-white" : "bg-yellow-500 text-white"}`}>
                        {item.status == 1 ? "Approved" : item.status == 2 ? "Rejected" : "Unapproved"}
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
              }
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div key={item.id_absen} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="flex justify-between items-center   bg-gray-50 px-4 py-2 border-b">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-700">
                      {formatFullDate(item.jam_mulai)}
                    </p>
                    <p className="text-[12px] text-gray-500 tracking-wide">
                      Shift: <span className="font-medium text-gray-700">{item.shift || "---"}</span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full border 
                ${item.status == 1
                        ? "bg-green-50 text-green-700 border-green-200"
                        : item.status == 2
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                  >
                    {item.status == 1 ? "Disetujui" : item.status == 2 ? "Ditolak" : "Menunggu"}
                  </span>
                </div>

                {/* Body: Lokasi & Jam */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-1/2">
                      <p className="text-[11px] text-gray-500 uppercase font-medium">Lokasi Mulai</p>
                      <p className="text-[13px] font-semibold text-gray-700">
                        {item.lokasi_mulai || "---"}
                      </p>
                    </div>
                    <div className="w-1/2 text-right">
                      <p className="text-[11px] text-gray-500 uppercase font-medium">Lokasi Selesai</p>
                      <p className="text-[13px] font-semibold text-gray-700">
                        {item.lokasi_selesai || "---"}
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-200 my-2" />

                  <div className="grid grid-cols-3 text-center">
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium uppercase">Masuk</p>
                      <p className="text-[13px] font-semibold text-gray-700">
                        {formatTime(item.jam_mulai)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium uppercase">Keluar</p>
                      <p className="text-[13px] font-semibold text-gray-700">
                        {item.jam_selesai ? formatTime(item.jam_selesai) : "---"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium uppercase">Terlambat</p>
                      <p className={`text-[13px] font-semibold ${item.keterlambatan && item.keterlambatan !== "00:00" ? "text-red-600" : "text-gray-700"}`}>
                        {item.keterlambatan || "--:--"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer: Tombol Aksi */}
                <div className="bg-gray-50 px-4 py-2 flex justify-end">
                  <button onClick={() => handleViewClick(item)} className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] px-3 py-1.5 rounded-lg font-medium transition-all duration-200">
                    <FontAwesomeIcon icon={faEye} className="mr-1.5" />
                    Detail
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="Tidak ada data absensi yang belum disetujui." />
          )}
        </div>
      </div>

      {/* PAGINATION */}
      <Pagination currentPage={currentPage} totalItems={filteredAbsen.length} itemsPerPage={itemsPerPage} onPageChange={(page) => setCurrentPage(page)} className="mt-6" />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Detail Absensi" note="Periksa dengan cermat sebelum memberikan keputusan." size="xl"
        // footer={
        //   (user.id_role === 1 || user.id_role === 4) && selectedAbsen?.status === 0 && (
        //     <div className="flex flex-wrap justify-end gap-3">
        //       <button onClick={() => handleReject(selectedAbsen?.id_absen)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition" disabled={isLoading}>
        //         Tolak Absensi
        //       </button>
        //       <button onClick={() => handleStatusUpdate(selectedAbsen?.id_absen)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition" disabled={isLoading}>
        //         Setujui Absensi
        //       </button>
        //     </div>
        //   )
        // }
      >
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-gray-700">

          {/* Jika belum ada data */}
          {!selectedAbsen ? (
            <div className="p-6 text-center text-gray-500 italic">
              Data absensi tidak ditemukan atau belum dimuat.
            </div>
          ) : (
            <>
              {/* 🔹 Info Box / Note Section */}
              <div className="bg-green-50 border-l-4 border-green-600 p-3 text-sm text-green-800 rounded">
                <p>
                  <strong>Catatan:</strong> Mohon periksa kembali detail absensi seperti waktu, lokasi, dan foto pendukung sebelum memberikan keputusan persetujuan atau penolakan.
                </p>
              </div>

              {/* 🔸 SECTION 1 — Informasi Karyawan */}
              <section className="p-5 border-b border-gray-100">
                <h4 className="flex items-center gap-2 text-base font-semibold text-green-700 mb-3">
                  <FontAwesomeIcon icon={faUser} className="text-green-500" />
                  Informasi Karyawan
                </h4>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm leading-relaxed">
                  <p><strong>Nama:</strong> {employeeInfo?.nama || "-"}</p>
                  <p><strong>NIP:</strong> {employeeInfo?.nip || "-"}</p>
                  <p><strong>Perusahaan:</strong> {employeeInfo?.perusahaan || "-"}</p>
                  <p><strong>Role:</strong> {employeeInfo?.role || "-"}</p>
                  <p>
                    <strong>Kendaraan:</strong>{" "}
                    {selectedAbsen?.status_kendaraan === 1 ? "Milik Pribadi" : selectedAbsen?.status_kendaraan === 2 ? "Milik Perusahaan" : "Belum Ada Data"}
                  </p>
                </div>
              </section>

              {/* 🔸 SECTION 2 — Ringkasan Absensi */}
              <section className="p-5 border-b border-gray-100">
                <h4 className="flex items-center gap-2 text-base font-semibold text-green-700 mb-3">
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-green-500" />
                  Ringkasan Absensi
                </h4>

                <div className="flex justify-between items-start sm:items-center mb-3">
                  {selectedAbsen?.jam_mulai ? (
                    <span className="text-sm font-medium text-gray-600">
                      {formatFullDate(selectedAbsen.jam_mulai)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Tanggal tidak tersedia</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border transition-all ${selectedAbsen?.status === 1 ? "bg-green-100 text-green-700 border-green-300" : selectedAbsen?.status === 2 ? "bg-red-100 text-red-700 border-red-300" : "bg-yellow-100 text-yellow-700 border-yellow-300"}`}>
                    {selectedAbsen?.status === 1 ? "Sudah Disetujui" : selectedAbsen?.status === 2 ? "Telah Ditolak" : "Menunggu Persetujuan"}
                  </span>
                </div>

                <div className="p-3 bg-green-50 rounded-md border border-green-100 text-sm">
                  <p><strong>Shift:</strong> {selectedAbsen?.shift || "-"}</p>
                </div>
              </section>

              {/* 🔸 SECTION 3 — Tunjangan & Shift */}
              {(() => {
                const conditions = calculateConditions(selectedAbsen);

                if (conditions.transport_pribadi || conditions.transport_umum || conditions.night_shift) {
                  return (
                    <section className="p-5 border-b border-gray-100">
                      <h4 className="flex items-center gap-2 text-base font-semibold text-green-700 mb-3">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
                        Informasi Tunjangan & Shift
                      </h4>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {conditions.transport_pribadi && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-100 text-sm">
                            <FontAwesomeIcon icon={faMotorcycle} className="text-green-500" />
                            <span className="font-medium">Tunjangan Transportasi (Kendaraan Pribadi)</span>
                          </div>
                        )}

                        {conditions.transport_umum && (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-100 text-sm">
                            <FontAwesomeIcon icon={faBus} className="text-blue-500" />
                            <span className="font-medium">Tunjangan Transportasi (Kendaraan Umum)</span>
                          </div>
                        )}

                        {conditions.night_shift && (
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-100 text-sm">
                            <FontAwesomeIcon icon={faMoon} className="text-green-500" />
                            <span className="font-medium">Mendapat Tunjangan Shift Malam</span>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                }

                return null;
              })()}



              {/* 🔸 SECTION 4 — Absen Masuk & Pulang */}
              <section className="p-6">
                {/* Header Section */}
                <h4 className="flex items-center gap-2 text-base font-semibold text-green-700 mb-6">
                  <FontAwesomeIcon icon={faClock} className="text-green-600" />
                  Detail Absen Masuk & Pulang
                </h4>

                {/* Dua Card Sejajar */}
                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    {
                      label: "Absen Masuk",
                      jam: selectedAbsen?.jam_mulai,
                      lokasi: selectedAbsen?.lokasi_mulai,
                      titik: selectedAbsen?.titik_mulai_pengguna,
                      foto: selectedAbsen?.foto_mulai,
                      jarak: selectedAbsen?.jarak_mulai,
                      keterlambatan: selectedAbsen?.keterlambatan,
                    },
                    {
                      label: "Absen Pulang",
                      jam: selectedAbsen?.jam_selesai,
                      lokasi: selectedAbsen?.lokasi_selesai,
                      titik: selectedAbsen?.titik_selesai_pengguna,
                      foto: selectedAbsen?.foto_selesai,
                      jarak: selectedAbsen?.jarak_selesai,
                    },
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="bg-green-50 border-b border-green-100 px-5 py-3 rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                            <FontAwesomeIcon icon={faClock} className="text-green-600 text-lg" />
                          </div>

                          <div className="flex flex-col leading-tight">
                            <h5 className="text-green-700 font-semibold text-sm">{item.label}</h5>
                            <p className="text-green-600 text-xs">{item.jam ? formatFullDate(item.jam) : "-"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Isi Card */}
                      <div className="flex flex-col sm:flex-row items-start gap-6 p-5">
                          <div className="w-32 h-32 rounded-lg overflow-hidden border border-green-100 shadow-sm flex-shrink-0 bg-green-50">
                          {item.foto ? (
                            <a href={item.foto} target="_blank" rel="noopener noreferrer">
                              <img src={item.foto} alt={item.label} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                            </a>
                          ) : (
                            <div className="flex h-full items-center justify-center text-green-400 text-xs">
                              Tidak ada foto
                            </div>
                          )}
                        </div>

                        {/* INFORMASI */}
                        <div className="flex-1 flex flex-col gap-3 text-gray-700">
                          <div>
                            <p className="text-xs text-gray-500">Waktu</p>
                            <p className="font-medium text-gray-800">
                              {item.jam ? formatTime(item.jam) : "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Jadwal Kerja</p>
                            <p className="font-medium text-gray-800">{item.lokasi || "-"}</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Lokasi Absen Karyawan</p>
                            {item.titik ? (
                              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.titik)}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 underline hover:text-green-800 inline-block">
                                Lihat di Maps
                              </a>
                            ) : (
                              <p className="font-medium text-gray-800">-</p>
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-500">Jarak Lokasi Bekerja dari Titik Presensi</p>
                              <p className="font-medium text-gray-800">{formatDistance(item.jarak)}</p>
                            </div>

                            {i === 0 && item.keterlambatan && item.keterlambatan !== "00:00" && (
                              <div className="text-red-600 font-semibold text-sm flex items-center gap-1">
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <span>{item.keterlambatan}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>


              {/* 🔸 SECTION 5 — Keterangan Karyawan */}
              <section className="p-5">
                <h4 className="flex items-center gap-2 text-base font-semibold text-green-700 mb-2">
                  <FontAwesomeIcon icon={faFileSignature} className="text-green-500" />
                  Keterangan Karyawan
                </h4>
                <p className="text-gray-700 bg-green-50 p-3 rounded border border-green-100 text-sm">
                  {selectedAbsen?.deskripsi || (
                    <span className="italic text-gray-400">Tidak ada keterangan tambahan.</span>
                  )}
                </p>
              </section>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DetailAbsensi;
