import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const DataKaryawan = ({ username, id_user }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const handleBackClick = () => navigate("/home");
  const [newUser, setNewUser] = useState({
    nama: "",
    id_role: "",
    telp: "",
    foto: null,
    username: "",
    password: "",
  });

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
        return user && user.nama && user.nama.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  const handleAddUser = async () => {
    if (!validateUser()) return;
    setLoadingAction(true);
    const formData = new FormData();

    Object.entries(newUser).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (newPhoto) {
      formData.append("foto", newPhoto);
    }

    try {
      const response = await fetch(`${apiUrl}/profil`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        Swal.fire("Sukses!", result.message, "success").then(() => {
          window.location.reload(); 
        });
      } else {
        Swal.fire("Gagal!", result.message || "Error saat menambahkan karyawan.", "error");
      }
    } catch (error) {
      Swal.fire("Kesalahan!", "Terjadi kesalahan saat menambahkan karyawan.", "error");
    } finally {
      setLoadingAction(false);
      resetNewUser();
      setIsAdding(false);
    }
  };

  const validateUser = () => {
    const { username } = newUser; // Only validate username since it's a common identifier
    const errors = [];

    // Check for empty username
    if (!username?.trim()) {
      errors.push("Username tidak boleh kosong!");
    }

    // Show alert if there are errors
    if (errors.length > 0) {
      Swal.fire("Gagal!", errors.join(" "), "error");
      return false;
    }
    return true; // Validation passes if only username is filled or all are empty
  };

  const handleEditUser = async () => {
    if (newUser.username && !validateUser()) return;

    setLoadingAction(true);
    const formData = new FormData();

    Object.entries(newUser).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    if (newPhoto) {
      formData.append("foto", newPhoto);
    }

    try {
      const response = await fetch(`${apiUrl}/profil/update/${currentUser.id}`, {
        method: "PUT",
        body: formData,
      });

      console.log("Response status:", response.status);
      const textResponse = await response.text(); // Use text() to see the raw response
      // console.log("Response body:", textResponse);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = JSON.parse(textResponse); // Parse JSON response

      if (result.success) {
        Swal.fire("Sukses!", result.message, "success").then(() => {
          window.location.reload(); // Reload the page after showing the alert
        });
      } else {
        Swal.fire("Gagal!", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Kesalahan!", "Terjadi kesalahan saat mengupdate karyawan: " + error.message, "error");
    } finally {
      setLoadingAction(false);
      resetNewUser();
      setIsEditing(false);
    }
  };

  const handleEdit = (user) => {
    if (user && user.id) {
      setIsEditing(true);
      setCurrentUser(user);
      setNewUser({
        id: user.id,
        nama: user.nama || "", // Default to empty string for flexibility
        id_role: user.id_role || "",
        telp: user.telp || "",
        username: user.username || "",
        password: "", // Keep password empty for security reasons
      });
    }
  };

  const resetNewUser = () => {
    setNewUser({
      nama: "",
      id_role: "",
      telp: "",
      foto: null,
      username: "",
      password: "",
    });
    setNewPhoto(null);
  };

  const handleDelete = async (id) => {
    if (id) {
      const confirmDelete = await Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data ini akan dihapus secara permanen.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
      });

      if (confirmDelete.isConfirmed) {
        try {
          const response = await fetch(`${apiUrl}/profil/delete/${id}`, {
            method: "DELETE",
          });
          const result = await response.json();
          if (result.success) {
            Swal.fire("Sukses!", result.message, "success");
            setUsers((prev) => prev.filter((user) => user && user.id !== id)); // Ensure user is defined
          } else {
            Swal.fire("Gagal!", result.message, "error");
          }
        } catch (error) {
          Swal.fire("Kesalahan!", "Terjadi kesalahan saat menghapus karyawan.", "error");
        }
      }
    } else {
      Swal.fire("Error!", "Invalid user ID.", "error"); // Handle case of undefined id
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
              onClick={handleBackClick}
              title="Back to Home"
            />
            <h1 className="text-4xl font-bold text-gray-800 pb-1">Data Karyawan</h1>
          </div>

          <button
            onClick={() => {
              setIsAdding(true);
              resetNewUser();
              setIsEditing(false);
            }}
            className="bg-green-600 text-white px-4 py-2 font-bold rounded-md hover:bg-green-700 transition duration-150"
          >
            Tambah Karyawan
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Karyawan..."
          className="border p-2 mb-4 w-full rounded-md"
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading...</div>
          </div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className=" mb-8">
            <div className="relative">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead className="bg-green-800 text-white uppercase text-sm leading-normal sticky top-0">
                  <tr>
                    <th className="py-3 pl-3 text-left">No.</th>
                    <th className="py-3 pr-4 text-left">Foto</th>
                    <th className="py-3 pl-6 pr-6 text-left">Nama</th>
                    <th className="py-3  pl-6 text-left">Posisi</th>
                    <th className="py-3 px-6 text-left">Telepon</th>
                    <th className="py-3 px-9 text-left">Aksi</th>
                  </tr>
                </thead>
              </table>

              {/* Scrollable tbody */}
              <div className="overflow-y-auto h-[calc(100vh-250px)]">
                <table className="min-w-full bg-white">
                  <tbody className="text-gray-600 text-sm font-light">
                    {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr key={user.id} className="border-b border-gray-300 hover:bg-gray-100">
                          <td className="py-3 pl-6 text-left">{index + 1}</td>
                          <td className="py-3 pl-7 pr-4 text-left">
                            <img
                              src={user.foto || "default-image.jpg"}
                              alt={user.nama || "User Image"}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          </td>
                          <td className="py-3 pl-6 pr-6 text-left">{user.nama || "Unknown Name"}</td>
                          <td className="py-3 pl-6 pr-8 text-left">{user.id_role || "Unknown Role"}</td>
                          <td className="py-3 pl-9 text-left">{user.telp || "No Phone"}</td>
                          <td className="py-3 px-0 text-left flex justify-center items-center space-x-4">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:bg-blue-100 transition duration-150 rounded-md px-4 py-2"
                              aria-label={`Edit ${user.nama}`}
                              title={`Edit ${user.nama}`}
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:bg-red-100 transition duration-150 rounded-md px-4 py-2"
                              aria-label={`Delete ${user.nama}`}
                              title={`Delete ${user.nama}`}
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-3 text-center">
                          Tidak ada karyawan ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAdding || isEditing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Karyawan" : "Tambah Karyawan"}</h2>

            {/* Form Fields */}
            <input
              type="text"
              placeholder="Nama"
              value={newUser.nama}
              onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
              className="border p-2 w-full rounded-md mb-2"
            />
            <select
              value={newUser.id_role}
              onChange={(e) => setNewUser({ ...newUser, id_role: e.target.value })}
              className="border p-2 w-full rounded-md mb-2"
            >
              <option value="" disabled>
                Pilih ID Role
              </option>
              <option value="1">Admin</option>
              <option value="2">IT</option>
              <option value="3">Teknisi</option>
              <option value="4">HRD</option>
            </select>

            <input
              type="text"
              placeholder="Telepon"
              value={newUser.telp}
              onChange={(e) => setNewUser({ ...newUser, telp: e.target.value })}
              className="border p-2 w-full rounded-md mb-2"
            />
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="border p-2 w-full rounded-md mb-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="border p-2 w-full rounded-md mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewPhoto(e.target.files[0])}
              className="border p-2 w-full rounded-md mb-2"
            />

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={isEditing ? handleEditUser : handleAddUser}
                className={`bg-green-600 text-white px-4 py-2 rounded-md ${
                  loadingAction ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loadingAction}
              >
                {loadingAction ? "Loading..." : isEditing ? "Update" : "Tambah"}
              </button>
              <button
                onClick={() => {
                  resetNewUser();
                  setIsAdding(false);
                  setIsEditing(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DataKaryawan;
