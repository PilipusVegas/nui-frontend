import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faPhone,
  faCamera,
  faUser,
  faPen,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2"; // Import SweetAlert2

const Profile = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    division: "",
    avatar: "https://via.placeholder.com/150",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profileData });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const id_user = localStorage.getItem("userId");
    if (!id_user) {
      console.error("User ID not found in localStorage.");
      setIsLoading(false);
      return;
    }

    fetch(`${apiUrl}/profil/user/${id_user}`)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(({ data: userProfile }) => {
        if (userProfile) {
          const userProfileData = {
            name: userProfile.nama,
            phone: userProfile.telp || "No phone number",
            division: userProfile.role_name || "No division",
            avatar: userProfile.foto || profileData.avatar,
          };
          setProfileData(userProfileData);
          setEditData(userProfileData); // Update editData as well
        }
      })
      .catch((error) => console.error("Error fetching profile data:", error))
      .finally(() => setIsLoading(false));
  }, [apiUrl]);

  const handleSave = () => {
    const id_user = localStorage.getItem("userId");
    const ERROR_USER_ID_NOT_FOUND = "User ID tidak ditemukan.";
    const ERROR_NO_DATA_TO_UPDATE = "Tidak ada data untuk diperbarui.";
    const SUCCESS_PROFILE_UPDATED = "Profil berhasil diperbarui!";

    if (!id_user) {
      console.error(ERROR_USER_ID_NOT_FOUND);
      return Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: ERROR_USER_ID_NOT_FOUND,
        showConfirmButton: true,
      });
    }

    const formData = new FormData();
    let hasData = false;

    // Tambahkan data telepon jika ada
    if (editData.phone) {
      formData.append("telp", editData.phone);
      hasData = true;
    }

    // Tambahkan file foto jika ada
    if (avatarFile) {
      formData.append("foto", avatarFile); // Avatar file diambil dari input file
      hasData = true;
    }

    if (!hasData) {
      return Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: ERROR_NO_DATA_TO_UPDATE,
        showConfirmButton: true,
      });
    }

    // Kirim FormData ke API
    fetch(`${apiUrl}/profil/user/${id_user}`, {
      method: "PUT",
      body: formData, // Mengirimkan formData
    })
      .then((response) => {
        console.log("Status Kode:", response.status);
        if (!response.ok) {
          return response.json().then((errorData) => {
            console.error("Detail kesalahan:", errorData);
            throw new Error(`Gagal memperbarui profil: ${errorData.message}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        const updatedPhone = editData.phone || profileData.phone;
        const updatedAvatar = avatarFile
          ? URL.createObjectURL(avatarFile)
          : profileData.avatar;

        // Update state dengan data profil baru
        setProfileData((prevData) => ({
          ...prevData,
          phone: updatedPhone,
          avatar: updatedAvatar,
        }));
        setEditData((prevData) => ({
          ...prevData,
          phone: updatedPhone,
          avatar: updatedAvatar,
        }));
        setIsEditing(false);

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: SUCCESS_PROFILE_UPDATED,
          showConfirmButton: true,
        });
      })
      .catch((error) => {
        console.error("Error updating profile data:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memperbarui",
          text: "Silakan coba lagi.",
          showConfirmButton: true,
        });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData((prevData) => ({ ...prevData, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openPasswordModal = () => setIsPasswordModalOpen(true);
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordData({ oldPassword: "", newPassword: "" });
  };

  const handlePasswordSubmit = () => {
    const id_user = localStorage.getItem("userId");
    if (!id_user) return console.error("User ID not found in localStorage.");

    Swal.fire({
      title: "Konfirmasi User",
      text: "Apakah Anda yakin ingin mengubah password?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Ubah!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${apiUrl}/profil/password/${id_user}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passwordData),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Failed to change password");
            return response.json();
          })
          .then(() => {
            closePasswordModal();
            Swal.fire({
              icon: "success",
              title: "Berhasil mengubah password!",
              showConfirmButton: true,
            });
          })
          .catch((error) => {
            console.error("Error changing password:", error);
            Swal.fire({
              icon: "error",
              title: "Gagal mengganti password.",
              text: "Silakan coba lagi.",
              showConfirmButton: true,
            });
          });
      } else {
        // Jika pengguna membatalkan
        Swal.fire({
          title: "Dibatalkan",
          text: "Perubahan password dibatalkan.",
          icon: "info",
          showConfirmButton: true,
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="loading animate-pulse text-center py-20 text-xl font-semibold text-gray-500">
        Loading...
      </div>
    ); // Show loading state
  }

  return (
    <MobileLayout title="Profile">
      <div className="p-3">
        <div className="flex items-center bg-green-800 rounded-xl shadow-lg p-6 mb-4 relative">
          <img
            src={profileData.avatar}
            alt="User Avatar"
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex flex-col justify-center flex-grow ml-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {profileData.name || "Loading..."}
              </h2>
              <FontAwesomeIcon
                icon={faPen}
                className="text-white text-sm cursor-pointer hover:text-gray-300 relative top-1"
                onClick={() => setIsEditing(true)}
                title="Edit Profile"
              />
            </div>
            <p className="text-white text-sm opacity-90">
              {profileData.division || "Loading..."}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-500 font-semibold">
              <FontAwesomeIcon
                icon={faUser}
                className="mr-2"
                style={{ color: "#555" }}
              />
              Nama
            </div>
            <div className="text-gray-900 font-medium">
              : {profileData.name || "Loading..."}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-500 font-semibold">
              <FontAwesomeIcon
                icon={faBuilding}
                className="mr-2"
                style={{ color: "#555" }}
              />
              Divisi
            </div>
            <div className="text-gray-900 font-medium">
              : {profileData.division || "Loading..."}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-500 font-semibold">
              <FontAwesomeIcon
                icon={faPhone}
                className="mr-2"
                style={{ color: "#555" }}
              />
              Phone
            </div>
            {!isEditing ? (
              <div className="text-gray-900 font-medium">
                : {profileData.phone || "Loading..."}
              </div>
            ) : (
              <input
                name="phone"
                type="tel"
                className="col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={editData.phone}
                onChange={handleChange}
                placeholder="Masukkan nomor telepon"
                pattern="[0-9]*"
                inputMode="numeric"
              />
            )}
          </div>

          {isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-500 font-semibold">
                <FontAwesomeIcon
                  icon={faCamera}
                  className="mr-2"
                  style={{ color: "#555" }}
                />
                Foto Profil
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                className="col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>
        <div className="flex justify-between mt-6">
          {!isEditing ? (
            <>
              <button
                onClick={openPasswordModal}
                className="bg-yellow-600 text-white py-2 px-4 rounded-lg"
              >
                <div
                  className="change-password"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <FontAwesomeIcon
                    icon={faKey}
                    className="mr-2 text-white text-base"
                  />
                  <span>Ganti Password</span>
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white py-2 px-4 rounded-lg"
              >
                Simpan
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-red-600 text-white py-2 px-4 rounded-lg"
              >
                Batal
              </button>
            </>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-xl font-bold mb-4">Ganti Password</h3>
            <input
              type="password"
              placeholder="Password Lama"
              className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  oldPassword: e.target.value,
                })
              }
            />
            <input
              type="password"
              placeholder="Password Baru"
              className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
            />
            <div className="flex justify-between">
              <button
                onClick={handlePasswordSubmit}
                className="bg-green-600 text-white py-2 px-4 rounded-lg"
              >
                Simpan
              </button>
              <button
                onClick={closePasswordModal}
                className="bg-red-600 text-white py-2 px-4 rounded-lg"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Profile;
