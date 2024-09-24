import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faPhone, faCamera, faUser } from "@fortawesome/free-solid-svg-icons";

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
    if (!id_user) return console.error("User ID not found in localStorage.");

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
    if (!id_user) return console.error("User ID not found in localStorage.");

    const formData = new FormData();
    formData.append("telp", editData.phone);
    // if (avatarFile) formData.append("avatar", avatarFile);

    fetch(`${apiUrl}/profil/user/${id_user}`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update profile");
        return response.json();
      })
      .then(() => {
        setProfileData((prevData) => ({
          ...prevData,
          phone: editData.phone,
          avatar: avatarFile ? URL.createObjectURL(avatarFile) : prevData.avatar,
        }));
        setEditData((prevData) => ({
          ...prevData,
          phone: editData.phone,
          avatar: avatarFile ? URL.createObjectURL(avatarFile) : prevData.avatar,
        }));
        setIsEditing(false);
        alert("Profil berhasil diperbarui!");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating profile data:", error);
        alert("Gagal memperbarui data profil. Silakan coba lagi.");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => setAvatarFile(e.target.files[0]);

  const openPasswordModal = () => setIsPasswordModalOpen(true);
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordData({ oldPassword: "", newPassword: "" });
  };

  const handlePasswordSubmit = () => {
    const id_user = localStorage.getItem("userId");
    if (!id_user) return console.error("User ID not found in localStorage.");

    fetch(`${apiUrl}/profil/password/${id_user}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordData),
    })
      .then((response) => {
        console.log("Response status:", response.status); // Add log
        if (!response.ok) throw new Error("Failed to change password");
        return response.json();
      })
      .then(() => {
        closePasswordModal();
        alert("Password changed successfully");
      })
      .catch((error) => {
        console.error("Error changing password:", error);
        alert("Gagal mengganti password. Silakan coba lagi.");
      });
  };

  if (isLoading) {
    return <div className="loading animate-pulse text-center py-20 text-xl font-semibold text-gray-500">Loading...</div>; // Show loading state
  }

  return (
    <MobileLayout title="Profile">
      <div className="p-3">
        <div className="flex items-center bg-green-800 rounded-xl shadow-lg p-6 mb-4">
          <img
            src={profileData.avatar}
            alt="User Avatar"
            className="w-24 h-24 rounded-full mr-4 border-4 border-white shadow-lg"
          />
          <div>
            <h2 className="text-2xl font-bold text-white">{profileData.name || "Loading..."}</h2>
            <p className="text-white text-lg opacity-90">{profileData.division || "Loading..."}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-500 font-semibold">
              <FontAwesomeIcon icon={faUser} className="mr-2" style={{ color: "#555" }} />
              Nama
            </div>
            <div className="text-gray-900 font-medium">: {profileData.name || "Loading..."}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-500 font-semibold">
              <FontAwesomeIcon icon={faBuilding} className="mr-2" style={{ color: "#555" }} />
              Divisi
            </div>
            <div className="text-gray-900 font-medium">: {profileData.division || "Loading..."}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-500 font-semibold">
              <FontAwesomeIcon icon={faPhone} className="mr-2" style={{ color: "#555" }} />
              Phone
            </div>
            {!isEditing ? (
              <div className="text-gray-900 font-medium">: {profileData.phone || "Loading..."}</div>
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
                <FontAwesomeIcon icon={faCamera} className="mr-2" style={{ color: "#555" }} />
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
        <div className="flex justify-between mt-8">
          {!isEditing ? (
            <>
              <button
                className="w-full sm:w-auto px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300 transform hover:scale-105"
                onClick={() => setIsEditing(true)} // Add this line
              >
                Edit Profil
              </button>
              <button
                className="w-full sm:w-auto ml-4 px-4 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition duration-300 transform hover:scale-105"
                onClick={openPasswordModal}
              >
                Ganti Password
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full sm:w-auto px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105"
                onClick={handleSave}
              >
                Simpan
              </button>
              <button
                className="w-full sm:w-auto ml-4 px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300 transform hover:scale-105"
                onClick={() => setIsEditing(false)}
              >
                Batal
              </button>
            </>
          )}
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 shadow-lg w-11/12 md:w-1/3">
            <h2 className="text-xl font-bold mb-4">Ganti Password</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Password Lama</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Password Baru</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="flex justify-end">
              <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={handlePasswordSubmit}>
                Simpan
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={closePasswordModal}>
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
