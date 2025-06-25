import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faEdit, faTrash, faSearch, faPlus} from "@fortawesome/free-solid-svg-icons";

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

  const itemsPerPage = 10;
  const handleBackClick = () => navigate("/home");
  const indexOfFirstUser = (currentPage - 1) * itemsPerPage;

  const fetchData = async (endpoint) => {
    try {
      const res = await fetch(`${apiUrl}${endpoint}`);
      const json = await res.json();
      if (res.ok && (json.success || Array.isArray(json))) {
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
        setUsers(users);
        setDivisiList(divisi);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [apiUrl]);
  
  const filteredUsers = users.filter(
    (user) => user?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) && user?.role);
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
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg" onClick={handleBackClick} title="Back to Home"/>
            <h1 className="text-3xl font-bold text-gray-800 pb-1">Kelola Karyawan</h1>
          </div>

          <div className="flex items-center space-x-3 mt-4 ml-auto w-full sm:w-auto sm:mt-0">
            <div className="relative w-full sm:w-auto">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari Karyawan..." aria-label="Search Karyawan" className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 px-2 py-2 pl-10 pr-4 w-full max-w-lg sm:max-w-lg rounded-md transition duration-200 ease-in-out"/>
            </div>
            <button onClick={() => navigate("/karyawan/tambah")} className="bg-green-600 flex text-center items-center text-white px-4 sm:px-4 py-2 font-bold rounded-md hover:bg-green-700 transition duration-150 sm:mt-0">
              <FontAwesomeIcon icon={faPlus} className="sm:mr-2 sm:block" />
              <span className="hidden sm:block">Tambah Karyawan</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="loader">Loading...</div>
          </div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <>
            <div className="relative mb-0 hidden md:block">
              <table className="min-w-full table-auto bg-white border-collapse shadow-md rounded-lg">
                <thead>
                  <tr className="bg-green-600 text-white py-1 text-sm px-4">
                    {["No.","Perusahaan", "Nama Karyawan", "Jadwal Shift", "Status", "Menu"].map(
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
                      <td colSpan="5" className="py-3 px-4 text-center text-gray-500 border-b border-gray-200">
                        Tidak ada karyawan ditemukan
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

            {/* Mobile View */}
            <div className="md:hidden">
              {Array.isArray(currentUsers) && currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <div key={user.id} className="bg-white p-4 mb-4 shadow-md rounded-md">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{user.nama || "Unknown Name"}</h3>
                      <div className="flex gap-2">
                        {/* <button onClick={() => handleEdit(user)} className="text-green-600 hover:text-green-800" title="Edit">
                          <FontAwesomeIcon icon={faEdit} />
                        </button> */}
                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800" title="Delete">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Jabatan: {user.role}</p>
                    <p className="text-sm text-gray-600">Telepon: {user.telp || "-"}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">Tidak ada karyawan ditemukan</div>
              )}

              <div className="flex justify-center space-x-2 my-10">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataKaryawan;
