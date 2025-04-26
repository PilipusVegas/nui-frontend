import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faEdit,
  faTrash,
  faSearch,
  faEye,
  faEyeSlash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

const DataKaryawan = ({}) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [divisiList, setDivisiList] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [showPassword, setShowPassword] = useState(false);
  const handleBackClick = () => navigate("/home");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${apiUrl}/profil`);
        const result = await response.json();
        if (result.success) {
          setUsers(result.data);
        } else {
          setErrorMessage(result.message);
        }
      } catch (error) {
        setErrorMessage("Kesalahan saat mengambil data karyawan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [apiUrl]);

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        return (
          user &&
          user.nama &&
          user.role &&
          user.nama.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoadingAction(true);
          const response = await fetch(`${apiUrl}/profil/${id}`, {
            method: "DELETE",
          });
          const result = await response.json();
          if (result.success) {
            Swal.fire("Deleted!", result.message, "success");
            setUsers(users.filter((user) => user.id !== id));
          } else {
            Swal.fire("Gagal", result.message, "error");
          }
        } catch (error) {
          Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
        } finally {
          setLoadingAction(false);
        }
      }
    });
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    setIsAdding(false);
  };

  const handleUpdate = async () => {
    try {
      setLoadingAction(true);
      const response = await fetch(`${apiUrl}/profil/update/${currentUser.id}`, {
        method: "PUT",
        body: JSON.stringify(currentUser),
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire("Sukses", result.message, "success");
        setUsers(users.map((user) => (user.id === currentUser.id ? currentUser : user)));
        setIsEditing(false);
        setCurrentUser(null);
      } else {
        Swal.fire("Gagal", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat memperbarui data.", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAdd = async () => {
    try {
      setLoadingAction(true);
      const response = await fetch(`${apiUrl}/profil`, {
        method: "POST",
        body: JSON.stringify(currentUser),
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire("Sukses", result.message, "success");
        setUsers([...users, result.data]);
        setIsAdding(false);
        setCurrentUser(null);
      } else {
        Swal.fire("Gagal", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan saat menambah data.", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  useEffect(() => {
    const fetchDivisi = async () => {
      try {
        const response = await fetch(`${apiUrl}/karyawan/divisi`);
        const result = await response.json();
        if (Array.isArray(result)) {
          setDivisiList(result);
        }
      } catch (error) {
        console.error("Gagal mengambil data divisi", error);
      }
    };
    fetchDivisi();
  }, [apiUrl]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 pt-8 md:pt-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
              onClick={handleBackClick}
              title="Back to Home"
            />
            <h1 className="text-3xl font-bold text-gray-800 pb-1">Data Karyawan</h1>
          </div>

          <div className="flex items-center space-x-3 mt-4 ml-auto w-full sm:w-auto sm:mt-0">
            <div className="relative w-full sm:w-auto">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Karyawan..."
                aria-label="Search Karyawan"
                className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 px-2 py-1 pl-10 pr-4 w-full max-w-lg sm:max-w-lg rounded-md transition duration-200 ease-in-out"
              />
            </div>
            <button
              onClick={() => {
                setIsAdding(true);
                setCurrentUser({
                  nama: "",
                  id_role: "",
                  telp: "",
                  username: "",
                  password: "",
                  status: 1, // default aktif
                });                
                setIsEditing(false);
              }}
              className="bg-green-600 flex text-white px-4 sm:px-4 py-1 font-bold rounded-md hover:bg-green-700 transition duration-150 sm:mt-0"
            >
              <FontAwesomeIcon icon={faPlus} className="pt-1 sm:mr-2 sm:block" />
              <span className="hidden sm:block">Tambah</span>{" "}
              {/* Menyembunyikan teks pada mobile */}
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
            {/* Tabel untuk desktop */}
            <div className="relative mb-0 hidden md:block">
              <table className="min-w-full table-auto bg-white border-collapse shadow-md rounded-lg">
                <thead>
                  <tr className="bg-green-500 text-white py-1 text-sm px-4">
                    {["No.", "Nama Karyawan", "Jabatan", "Telepon", "Status", "Menu"].map(
                      (header, index) => (
                        <th
                          key={index}
                          className={`px-4 py-1 font-semibold text-center ${
                            index === 0 ? "first:rounded-tl-lg" : ""
                          } ${index === 4 ? "last:rounded-tr-lg" : ""}`}
                        >
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
                        <td className="py-2 px-4 text-center border-b border-gray-200">
                          {index + 1}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          {user.nama || "Unknown Name"}
                        </td>
                        <td className="py-2 px-4 text-center border-b border-gray-200">
                          {user.role}
                        </td>
                        <td className="py-2 px-4 text-center border-b border-gray-200">
                          {user.telp || "-"}
                        </td>
                        <td className="text-center py-2 border-b border-gray-200">
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            user.status === 1 ? 'bg-green-500 text-white text-xs' : 'bg-gray-200 text-gray-600 text-xs'
                          }`}>
                            {user.status === 1 ? 'Aktif' : 'Non-aktif'}
                          </span>
                        </td>


                        <td className="py-2 px-4 text-center border-b border-gray-200 flex justify-center gap-6">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-3 px-4 text-center text-gray-500 border-b border-gray-200"
                      >
                        Tidak ada karyawan ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination untuk desktop */}
            <div className="flex justify-center text-center space-x-2 mt-4 hidden md:block">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-5 rounded-full font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-900 shadow-lg"
                }`}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>

              {/* Nomor Halaman */}
              <span className="px-4 rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm">
                {currentPage} / {Math.ceil(filteredUsers.length / itemsPerPage)}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage))
                  )
                }
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

            {/* Card yang ditampilkan pada layar kecil (mobile) */}
            <div className="md:hidden">
              {Array.isArray(currentUsers) && currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <div key={user.id} className="bg-white p-4 mb-4 shadow-md rounded-md">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{user.nama || "Unknown Name"}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
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

              {/* Pagination untuk mobile */}
              <div className="flex justify-center space-x-2 my-10">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-5 rounded-full font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-900 shadow-lg"
                  }`}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>

                <span className="px-4 rounded-full bg-white border border-gray-300 text-gray-700 shadow-sm">
                  {currentPage} / {Math.ceil(filteredUsers.length / itemsPerPage)}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredUsers.length / itemsPerPage))
                    )
                  }
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

      {isAdding || isEditing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Karyawan" : "Tambah Karyawan"}
            </h2>

            {/* Form Fields */}
            <div className="mb-2">
              <label htmlFor="nama" className="block text-gray-600 font-semibold mb-1">
                Nama
              </label>
              <input
                type="text"
                id="nama"
                placeholder="Nama"
                value={currentUser.nama}
                onChange={(e) => setCurrentUser({ ...currentUser, nama: e.target.value })}
                className="border p-2 w-full rounded-md"
              />
            </div>

            <div className="mb-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">Jabatan</label>
              <select
                value={currentUser?.id_role || ""}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, id_role: parseInt(e.target.value) })
                }
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Pilih Jabatan --</option>
                {divisiList.map((divisi) => (
                  <option key={divisi.id} value={divisi.id}>
                    {divisi.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label htmlFor="telp" className="block text-gray-600 font-semibold mb-1">
                Telepon
              </label>
              <input
                type="text"
                id="telp"
                placeholder="Telepon"
                value={currentUser.telp}
                onChange={(e) => setCurrentUser({ ...currentUser, telp: e.target.value })}
                className="border p-2 w-full rounded-md"
              />
            </div>

            <div className="mb-2">
              <label htmlFor="username" className="block text-gray-600 font-semibold mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Username"
                value={currentUser.username}
                onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                className="border p-2 w-full rounded-md"
              />
            </div>

            {/* Input password with toggle visibility */}
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-gray-600 font-semibold mb-1">
                Password
              </label>
              <div className="flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  value={currentUser.password}
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  className="border p-2 w-full rounded-md"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="pt-7" />
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Status</label>
              <label className="flex items-center cursor-pointer space-x-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={currentUser.status === 1}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, status: e.target.checked ? 1 : 0 })
                    }
                  />
                  <div className={`w-11 h-6 rounded-full shadow-inner transition-colors duration-300 ${
                    currentUser.status === 1 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
                    currentUser.status === 1 ? 'translate-x-5' : ''
                  }`}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.status === 1 ? 'Aktif' : 'Nonaktif'}
                </span>
              </label>
            </div>


            {/* Submit button */}
            <div className="flex justify-between space-x-2 mt-4">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                }}
                className="bg-gray-600 hover:bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={isEditing ? handleUpdate : handleAdd}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              >
                {isEditing ? "Update" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DataKaryawan;
