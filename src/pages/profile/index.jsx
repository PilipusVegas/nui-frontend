import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faPhone,
  faUser,
  faPen,
  faArrowRight,
  faEye,
  faEyeSlash,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2"; 

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
  const [isLoading, setIsLoading] = useState(true); 
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
            phone: userProfile.telp || "",
            division: userProfile.role_name || "No division",
            avatar: userProfile.foto || profileData.avatar,
          };
          setProfileData(userProfileData);
          setEditData(userProfileData); 
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

    if (editData.phone) {
      formData.append("telp", editData.phone);
      hasData = true;
    }

    if (avatarFile) {
      formData.append("foto", avatarFile);
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

    fetch(`${apiUrl}/profil/update/${id_user}`, {
      method: "PUT",
      body: formData, 
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
        const updatedAvatar = avatarFile ? URL.createObjectURL(avatarFile) : profileData.avatar;

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
    );
  }

  return (
    <MobileLayout title="Profile">
      <div className="py-8 px-7 min-w-full mx-auto bg-white rounded-xl shadow-xl space-y-4">
        {/* Avatar Section */}
        <div className="flex justify-center items-center mb-10">
          <div className="relative w-32 h-32">
            {/* Gradient background with shadow */}
            <div className="absolute inset-0 bg-gradient-to-r rounded-full shadow-md"></div>

            {/* Display photo if available, else show icon */}
            {profileData.foto ? (
              <img
                src={profileData.foto}
                alt="User Avatar"
                className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
                <FontAwesomeIcon icon={faUserCircle} className="text-gray-400 w-32 h-32" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Info (Single Card with dividers) */}
        {/* Name */}
        <div className="flex items-center space-x-4 text-gray-600 font-medium mt-6">
          <FontAwesomeIcon icon={faUser} className="text-green-600 text-lg" />
          <div className="flex flex-col space-y-0">
            <span>Nama:</span>
            <span className="font-semibold text-gray-900 text-sm">
              {profileData.name || "Loading..."}
            </span>
          </div>
        </div>
        <hr className="border-gray-300" />
        {/* Division */}
        <div className="flex items-center space-x-4 text-gray-600 font-medium">
          <FontAwesomeIcon icon={faBuilding} className="text-green-600 text-lg" />
          <div className="flex flex-col space-y-1">
            <span>Divisi:</span>
            <span className="font-semibold text-gray-900 text-sm">
              {profileData.division || "Loading..."}
            </span>
          </div>
        </div>
        <hr className="border-gray-300" />

        {/* Phone */}
        <div className="flex items-center space-x-4 text-gray-600 font-medium">
          <FontAwesomeIcon icon={faPhone} className="text-green-600 text-lg" />
          <div className="flex flex-col w-full">
            <span className="text-sm">Phone:</span>
            <div className="flex justify-between items-center space-x-4">
              <span className="font-semibold text-gray-900 text-sm">
                {!isEditing ? (
                  profileData.phone || "-"
                ) : (
                  <input
                    name="phone"
                    type="tel"
                    className="w-full p-2 mt-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                    value={editData.phone}
                    onChange={handleChange}
                    placeholder="Masukkan nomor telepon"
                    pattern="[0-9]*"
                    inputMode="numeric"
                  />
                )}
              </span>
              <FontAwesomeIcon
                icon={faPen}
                className="text-green-600 cursor-pointer hover:text-green-800 transition-all duration-300 transform hover:scale-110 "
                onClick={() => setIsEditing(true)}
                title="Edit Phone"
              />
            </div>
          </div>
        </div>
        <hr className="border-gray-300" />

        {/* Action Buttons */}
        <div className="flex justify-between mt-0">
          {!isEditing ? (
            <button
              onClick={openPasswordModal}
              className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 ease-in-out transform flex items-center space-x-2 w-full justify-between"
            >
              <span className="font-semibold">Ganti Password</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-white" />
            </button>
          ) : (
            <div className="space-x-2 flex-grow">
              <div className="flex w-full gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-red-400 hover:bg-red-500 text-white p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300 ease-in-out transform flex-grow"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="bg-green-400 hover:bg-green-600 text-white p-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 ease-in-out transform flex-grow"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-xl font-bold mb-4">Ganti Password</h3>

            {/* Old Password Input */}
            <div className="relative mb-4">
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="Password Lama"
                className="border border-gray-300 rounded-lg p-2 w-full"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value,
                  })
                }
              />
              <span
                className="absolute right-2 top-2 cursor-pointer"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? (
                  <FontAwesomeIcon icon={faEyeSlash} />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </span>
            </div>

            {/* New Password Input */}
            <div className="relative mb-4">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Password Baru"
                className="border border-gray-300 rounded-lg p-2 w-full"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
              <span
                className="absolute right-2 top-2 cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <FontAwesomeIcon icon={faEyeSlash} />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </span>
            </div>

            <div className="flex justify-between">
              
              <button
                onClick={closePasswordModal}
                className="bg-red-600 text-white py-2 px-4 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="bg-green-600 text-white py-2 px-4 rounded-lg"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Profile;
