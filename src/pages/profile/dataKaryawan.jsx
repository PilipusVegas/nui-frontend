import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faTrash, faSearch, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const DataKaryawan = ({}) => {
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
  const [showPassword, setShowPassword] = useState(false);
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
        return user && user.nama && user.id_role && user.nama.toLowerCase().includes(searchQuery.toLowerCase());
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

    if (!username?.trim()) {
      errors.push("Username tidak boleh kosong!");
    }

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

  const GetNamaDivisi = (userId) => {
    let role = "";
    const id = userId.toString();
    switch (id) {
      case "1":
        role = "Admin";
        break;
      case "2":
        role = "IT";
        break;
      case "3":
        role = "Teknisi";
        break;
      case "4":
        role = "HRD";
        break;
      case "5":
        role = "PA";
        break;
      default:
        role = "Divisi Tidak Diketahui";
    }
    return <span className="bg-yellow-400 px-3 py-1 rounded-full text-xs text-black font-bold">{role}</span>;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
              onClick={handleBackClick}
              title="Back to Home"
            />
            <h1 className="text-3xl font-bold text-gray-800 pb-1">Data Karyawan</h1>
          </div>

          <button
            onClick={() => {
              setIsAdding(true);
              resetNewUser();
              setIsEditing(false);
            }}
            className="bg-green-600 text-white px-12 py-2 font-bold rounded-md hover:bg-green-700 transition duration-150"
          >
            Tambah
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Karyawan..."
            aria-label="Search Karyawan" 
            className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 p-2 pl-10 pr-4 w-full rounded-md transition duration-200 ease-in-out"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading...</div>
          </div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="relative mb-8 overflow-hidden">
            <div className="overflow-auto h-[calc(100vh-250px)] scrollbar-hidden">
              <div className="overflow-y-auto h-full bg-gray-50">
                <table className="min-w-full bg-white">
                  <thead className="bg-green-500 text-white uppercase text-base leading-normal">
                    <tr>
                  {["No.", "Karyawan", "Posisi", "Telepon", "Action"].map((header) => (
                    <th className="py-2 px-4 bg-green-500 text-center sticky top-0 z-10">
                      {header}
                    </th>
                  ))}
                </tr>
                    
                  </thead>
                  <tbody className="text-gray-700 text-base font-medium">
                    {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr key={user.id} className="border-b border-gray-300 hover:bg-gray-100 transition duration-150">
                          <td className="py-4 text-center">{index + 1}</td>
                          <td className="py-4 text-center">{user.nama || "Unknown Name"}</td>
                          <td className="py-4 text-center">{GetNamaDivisi(user.id_role)}</td>
                          <td className="py-4 text-center">{user.telp || "No Phone"}</td>
                          <td className="py-4 text-center flex justify-center items-center space-x-4">
                            <button
                              onClick={() => handleEdit(user)}
                              className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition duration-150 flex items-center"
                              aria-label={`Edit ${user.nama}`}
                              title={`Edit ${user.nama}`}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-150 flex items-center"
                              aria-label={`Delete ${user.nama}`}
                              title={`Delete ${user.nama}`}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-500">
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
              Pilih Posisi Karyawan
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

          {/* Input password with toggle visibility */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="border p-2 w-full rounded-md mb-2"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
            >
              <FontAwesomeIcon className="pb-2" icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewPhoto(e.target.files[0])}
            className="border p-2 w-full rounded-md mb-4"
          />

          <div className="flex justify-between">
          <button
                onClick={() => {
                  resetNewUser();
                  setIsAdding(false);
                  setIsEditing(false);
                }}
                className="bg-red-600 text-white px-4 text-center py-2 rounded-md"
              >
                Batal
              </button>
            <button
              onClick={isEditing ? handleEditUser : handleAddUser}
              className={`bg-green-600 text-white px-6 text-center py-2 rounded-md ${loadingAction ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loadingAction}
            >
              {loadingAction ? "Loading..." : isEditing ? "Update" : "Tambah"}
            </button>
          </div>
        </div>
      </div>
    ) : null}
  
    </div>
  );
};

export default DataKaryawan;
