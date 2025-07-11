import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faEdit, faTrash, faSearch, faPlus, faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";

const DataKaryawan = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [users, setUsers] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [selectedPerusahaan, setSelectedPerusahaan] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const itemsPerPage = 12;
  const handleBackClick = () => navigate("/home");
  const indexOfFirstUser = (currentPage - 1) * itemsPerPage;

  const fetchData = async (endpoint) => {
    try {
      const res = await fetch(`${apiUrl}${endpoint}`);
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
        const [users, divisi, perusahaan] = await Promise.all([
          fetchData("/profil"),
          fetchData("/karyawan/divisi"),
          fetchData("/perusahaan"),
        ]);
        setUsers(users);
        setDivisiList(divisi);
        setPerusahaanList(perusahaan);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [apiUrl]);
  
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
    (user?.nama?.toLowerCase().includes(query) ||
     user?.nip?.toLowerCase().includes(query) ||
     user?.perusahaan?.toLowerCase().includes(query) ||
     user?.role?.toLowerCase().includes(query) ||
     (user?.shift || "").toLowerCase().includes(query) ||
     (user?.status === 1 ? "aktif" : "nonaktif").includes(query));
  
  
    const matchPerusahaan =
      !selectedPerusahaan || user.id_perusahaan?.toString() === selectedPerusahaan;
  
    return matchSearch && matchPerusahaan;
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
        const res = await fetch(`${apiUrl}/profil/${id}`, { method: "DELETE" });
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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 pt-8 md:pt-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg" onClick={handleBackClick} title="Back to Home"/>
            <h1 className="text-3xl font-bold text-gray-800 pb-1">Kelola Karyawan</h1>
          </div>

          <div className="flex items-end gap-3 ml-auto">
        {/* Label + Select */}
        <div className="flex flex-col">
          <label htmlFor="filter-perusahaan" className="text-xs font-medium text-gray-600 mb-1 ml-1">
            Tampilkan dari
          </label>
          <select id="filter-perusahaan" value={selectedPerusahaan} onChange={(e) => setSelectedPerusahaan(e.target.value)} className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 px-3 py-2 rounded-md">
            <option value="">Semua Perusahaan</option>
            {perusahaanList.map((perusahaan) => (
              <option key={perusahaan.id} value={perusahaan.id}>
                {perusahaan.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Tombol Tambah */}
        <button onClick={() => navigate("/karyawan/tambah")} className="bg-green-600 flex items-center text-white px-4 py-2 font-bold rounded-md hover:bg-green-700 transition duration-150">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          <span>Tambah Karyawan</span>
        </button>
      </div>
        </div>

        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari data karyawan..." aria-label="Search Karyawan" className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 px-2 py-2 pl-10 pr-4 w-full rounded-md transition duration-200 ease-in-out"/>
        </div>
      </div>



            <div className="relative mb-0 hidden md:block">
              <table className="min-w-full table-auto bg-white border-collapse shadow-md rounded-lg">
                <thead>
                  <tr className="bg-green-600 text-white py-1 text-sm px-4">
                    {["No.", "Perusahaan", "NIP", "Nama Karyawan", "Jadwal Shift", "Status", "Menu"].map(
                      (header, index) => (
                        <th key={index} className={`px-4 py-1 font-semibold text-center ${ index === 0 ? "first:rounded-tl-lg" : "" } ${index === 5 ? "last:rounded-tr-lg" : ""}`}>
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
                        <button onClick={() => navigate(`/karyawan/edit/${user.id}`)} className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 pb-1.5 rounded text-white text-xs" title="Edit">
                          <FontAwesomeIcon icon={faEdit} className="mr-2" />
                          Edit
                        </button>
                          <button onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 pb-1.5 rounded text-white text-xs" title="Delete">
                            <FontAwesomeIcon icon={faTrash} className="mr-2"/>
                            Hapus
                          </button>
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

            <div className="flex justify-center text-center space-x-2 mt-4 hidden md:block">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-5 rounded-full font-medium transition-all duration-200 ${ currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-900 shadow-lg" }`}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>

              <span className="px-4 rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm">
                {currentPage} / {Math.ceil(filteredUsers.length / itemsPerPage)}
              </span>

              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                className={`px-5 rounded-full font-xl transition-all duration-200 ${
                  currentPage === Math.ceil(filteredUsers.length / itemsPerPage)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-900 shadow-lg"
                }`}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>

            
            <div className="md:hidden">
              {Array.isArray(currentUsers) && currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <div key={user.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-3">
                    {/* Nama & Role */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 leading-tight capitalize">
                          {user.nama || "Unknown Name"}
                        </h3>
                        <p className="text-xs text-gray-500">{user.role || "Unknown Role"}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          user.status === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {user.status === 1 ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    {/* Info Baris Dua Kolom */}
                    <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-600 mb-3">
                      <div>
                        <span className="font-medium text-gray-500 block">Perusahaan</span>
                        <span className={user.perusahaan ? "" : "italic text-gray-400"}>
                          {user.perusahaan || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 block">Shift</span>
                        <span className={user.shift ? "" : "italic text-gray-400"}>
                          {user.shift || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-2 border-t pt-2 mt-2">
                      <button onClick={() => navigate(`/karyawan/edit/${user.id}`)} title="Edit" className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs px-3 py-1 rounded shadow-sm">
                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                        Edit
                      </button>
                      <button onClick={() => handleDelete(user.id)} title="Hapus" className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded shadow-sm">
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-10">Tidak ada karyawan ditemukan</div>
              )}

              {/* Pagination */}
              <div className="flex justify-center space-x-2 my-6">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-5 py-1.5 rounded-full text-xs font-medium transition ${ currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600 shadow" }`}>
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>

                <span className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-700 text-xs shadow-sm">
                  {currentPage} / {Math.ceil(filteredUsers.length / itemsPerPage)}
                </span>

                <button onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage))
                    )
                  }
                  disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                  className={`px-5 py-1.5 rounded-full text-xs font-medium transition ${
                    currentPage === Math.ceil(filteredUsers.length / itemsPerPage)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow"
                  }`}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>
      </div>
    </div>
  );
};

export default DataKaryawan;
