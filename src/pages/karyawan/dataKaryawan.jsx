import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faEdit, faTrash, faSearch, faPlus, faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const DataKaryawan = () => {
  const editable = getUserFromToken();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [users, setUsers] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [shiftList, setShiftList] = useState([]);
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // "1" untuk aktif, "0" untuk nonaktif
  const itemsPerPage = 12;
  const handleBackClick = () => navigate("/home");
  const indexOfFirstUser = (currentPage - 1) * itemsPerPage;

  const fetchData = async (endpoint) => {
    try {
      const res = await fetchWithJwt(`${apiUrl}${endpoint}`);
      const json = await res.json();
      if (res.ok && (json.data || Array.isArray(json))) {
        return json.data || json;
      } else {
        throw new Error(json.message || "Gagal mengambil data.");
      }
    } catch (err) {
      throw new Error(err.message || "Terjadi kesalahan koneksi.");
    }
  };
  
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [users, divisi] = await Promise.all([
          fetchData("/profil"),
          fetchData("/karyawan/divisi"),
        ]);
        const filteredUsers = editable?.id_role === 1 
          ? users 
          : users.filter((user) => user.id_role !== 4); // misal: selain Manajer HRD
        setUsers(filteredUsers);
        setDivisiList(divisi);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [apiUrl, editable]);
  
  
  
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
      (user?.nama?.toLowerCase().includes(query) ||
      user?.nip?.toLowerCase().includes(query) ||
      user?.perusahaan?.toLowerCase().includes(query) ||
      user?.role?.toLowerCase().includes(query) ||
      (user?.shift || "").toLowerCase().includes(query) ||
      (user?.status === 1 ? "aktif" : "nonaktif").includes(query));
    const matchShift = !selectedShift || user.shift?.toLowerCase() === selectedShift.toLowerCase();
    const matchStatus = selectedStatus === "" || user.status?.toString() === selectedStatus;
    return matchSearch && matchShift && matchStatus;
  });
    const currentUsers = filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handleDelete = (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        setLoadingAction(true);
        const res = await fetchWithJwt(`${apiUrl}/profil/${id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          Swal.fire("Berhasil!", json.message, "success");
          setUsers((prev) => prev.filter((user) => user.id !== id));
        } else {
          Swal.fire("Gagal", json.message, "error");
        }
      } catch {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
      } finally {
        setLoadingAction(false);
      }
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedShift, selectedStatus]);
  
  return (
    <div className="flex flex-col">
      <div className="flex-grow">
        <div className="flex flex-col gap-2">
        {/* BARIS ATAS: JUDUL + TOMBOL TAMBAH */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Kiri: Icon Back + Judul */}
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition rounded-full p-2 sm:p-3 shadow-lg" onClick={handleBackClick} title="Back to Home"/>
            <h1 className="text-lg sm:text-3xl font-bold text-gray-800">Kelola Karyawan</h1>
          </div>

          {/* Kanan: Tombol Tambah */}
          <button onClick={() => navigate("/karyawan/tambah")} className="bg-green-600 flex items-center justify-center text-white px-3 py-1.5 sm:px-4 sm:py-3 font-semibold sm:font-bold rounded-md hover:bg-green-700 transition whitespace-nowrap text-xs sm:text-sm">
            <FontAwesomeIcon icon={faPlus} className="mr-2 text-sm sm:text-base" />
            <span className="inline sm:hidden pb-0.5">Tambah</span>
            <span className="hidden sm:inline">Tambah Karyawan</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4 mb-4">
          {/* Search Input */}
          <div className="order-2 sm:order-1 relative w-full sm:flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari karyawan..." aria-label="Search Karyawan" className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 pl-9 pr-3 py-1.5 rounded-md w-full text-xs sm:text-sm"/>
          </div>

          {/* Filter Controls */}
          <div className="order-1 sm:order-2 grid grid-cols-2 gap-2 sm:gap-3 w-full sm:max-w-sm">
            {/* Filter Shift */}
            <div>
              <label htmlFor="filter-shift" className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5 block">
                Jadwal Shift
              </label>
              <select id="filter-shift" value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 px-2 py-1.5 rounded-md text-xs sm:text-sm w-full">
                <option value="">Semua</option>
                {[...new Set(users.map((u) => u.shift).filter(Boolean))].map((shiftName, i) => (
                  <option key={i} value={shiftName}>
                    {shiftName}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label htmlFor="filter-status" className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5 block">
                Status
              </label>
              <select id="filter-status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 px-2 py-1.5 rounded-md text-xs sm:text-sm w-full">
                <option value="">Semua</option>
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>
        
        </div>
            <div className="relative mb-0 hidden md:block">
              <table className="min-w-full table-auto bg-white border-collapse shadow-md rounded-lg">
                <thead>
                  <tr className="bg-green-600 text-white py-2 text-sm px-4">
                    {["No.", "Perusahaan", "NIP", "Nama Karyawan", "Jadwal Shift", "Status", "Menu"].map(
                      (header, index) => (
                        <th key={index} className={`px-4 py-2 font-semibold text-center ${ index === 0 ? "first:rounded-tl-lg " : "last:rounded-tr-lg" }`}>
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="text-gray-800 text-sm">
                  {Array.isArray(currentUsers) && currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-100 transition duration-150">
                        <td className=" px-4 text-center border-b border-gray-200">
                        {indexOfFirstUser + index + 1}
                        </td>
                        <td className=" px-4 border-b border-gray-200 tracking-wide text-center">
                          <span className={user.perusahaan ? "" : "text-gray-400 italic text-xs"}>
                            {user.perusahaan || "N/A"}
                          </span>
                        </td>
                        <td className=" px-4 border-b border-gray-200 tracking-wide text-center">
                          <span className={user.nip ? "" : "text-gray-400 italic text-xs"}>
                            {user.nip || "N/A"}
                          </span>
                        </td>
                        <td className=" px-4 border-b border-gray-200 tracking-wide">
                          <div className="font-semibold text-sm capitalize">{user.nama || "Unknown Name"}</div>
                          <div className="text-xs text-gray-500">{user.role || "Unknown Role"}</div>
                        </td>
                        <td className=" px-4 border-b border-gray-200 tracking-wide text-center">
                          <span className={user.shift ? "" : "text-gray-400 italic text-xs"}>
                            {user.shift || "N/A"}
                          </span>
                        </td>
                        <td className="text-center  border-b border-gray-200">
                          <span className={`px-3 pb-0.5 text-sm font-semibold rounded-full ${ user.status === 1 ? 'bg-emerald-500 text-white text-xs' : 'bg-gray-500 text-white text-xs'}`}>
                            {user.status === 1 ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-center border-b border-gray-200 flex justify-center gap-2">
                        {/* yang bisa edit hanya user role_id = 1 dan 4*/}
                        <>
                          <button onClick={() => navigate(`/karyawan/edit/${user.id}`)} className={`px-3 py-1 pb-1.5 rounded text-white text-xs flex items-center justify-center  ${[1, 4].includes(editable?.id_role) ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400 cursor-not-allowed"}`} disabled={!([1, 4].includes(editable?.id_role))} title="Edit">
                            <FontAwesomeIcon icon={faEdit} className="mr-2" />
                            Edit
                          </button>
                          <button onClick={() => handleDelete(user.id)} className={`px-3 py-1 pb-1.5 rounded text-white text-xs flex items-center justify-center  ${[1, 4].includes(editable?.id_role) ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"}`} disabled={!([1, 4].includes(editable?.id_role))} title="Hapus">
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Hapus
                          </button>
                        </>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-10 px-4 text-center text-gray-500 border-b border-gray-200">
                        <div className="flex flex-col items-center justify-center">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-6xl text-gray-400 mb-3" />
                          <p className="text-base font-medium text-gray-600">Oops! Data karyawan gagal dimuat. Coba cek koneksi kamu dulu, ya</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {Array.isArray(currentUsers) && currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <div key={user.id} className="bg-white border border-gray-200 rounded-lg shadow-sm text-xs text-gray-700 mb-3 overflow-hidden">
                    {/* Section 1: Header (Nama, NIP, Role, Status) */}
                    <div className="px-3 py-2 border-b">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800 capitalize leading-snug">
                            {user.nama || "Unknown Name"}
                          </div>
                          <div className="text-[11px] text-gray-500 leading-tight">
                            NIP:{" "}
                            <span className={user.nip ? "" : "italic text-gray-400"}>
                              {user.nip || "N/A"}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 leading-tight">
                            {user.role || "Unknown Role"}
                          </div>
                        </div>
                        <div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ user.status === 1 ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500" }`}>
                            {user.status === 1 ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Info Ringkas */}
                    <div className="px-3 py-2 border-b grid grid-cols-2 gap-x-2">
                      <div>
                        <div className="text-[11px] text-gray-400 mb-0.5">Perusahaan</div>
                        <div className={user.perusahaan ? "" : "italic text-gray-300"}>
                          {user.perusahaan || "N/A"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-gray-400 mb-0.5">Shift</div>
                        <div className={user.shift ? "" : "italic text-gray-300"}>
                          {user.shift || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Aksi */}
                    <div className="px-3 py-2 flex justify-end gap-2 bg-gray-50">
                    <>
                      <button onClick={() => navigate(`/karyawan/edit/${user.id}`)} title="Edit" className={`text-white text-[11px] px-2 py-0.5 rounded flex items-center justify-center ${[1, 4].includes(editable?.id_role) ? "bg-yellow-400 hover:bg-yellow-500" : "bg-gray-400 cursor-not-allowed"}`} disabled={!([1, 4].includes(editable?.id_role))}>
                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(user.id)} title="Hapus" className={`text-white text-[11px] px-2 py-0.5 rounded flex items-center justify-center ${[1, 4].includes(editable?.id_role) ? "bg-red-500 hover:bg-red-600" : "bg-gray-400 cursor-not-allowed"}`} disabled={!([1, 4].includes(editable?.id_role))}>
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        Hapus
                      </button>
                    </>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-10">
                  Tidak ada karyawan ditemukan
                </div>
              )}
            </div>
            
          {/* Pagination - Versi Estetik dan Ramping */}
          <div className="relative w-full flex justify-center items-center mt-5 text-gray-700">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`absolute left-0 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                ${ currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white shadow-md"}`} title="Halaman Sebelumnya"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-base" />
            </button>
            <span className="text-sm font-medium px-6 py-2 rounded-full border border-gray-200 bg-white shadow-sm tracking-wide">
              Halaman {currentPage} <span className="text-gray-400">/</span> {Math.ceil(filteredUsers.length / itemsPerPage)}
            </span>
            <button onClick={() =>  setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
              className={`absolute right-0 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                ${ currentPage === Math.ceil(filteredUsers.length / itemsPerPage) ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white shadow-md"}`} title="Halaman Berikutnya"
            >
              <FontAwesomeIcon icon={faArrowRight} className="text-base" />
            </button>
          </div>
      </div>
    </div>
  );
};

export default DataKaryawan;
