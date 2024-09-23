import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";

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
    confirmNewPassword: "",
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
          setEditData(userProfileData);
        }
      })
      .catch((error) => console.error("Error fetching profile data:", error))
      .finally(() => setIsLoading(false)); // End loading state
  }, [apiUrl]);

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    const id_user = localStorage.getItem("userId");
    if (!id_user) return console.error("User ID not found in localStorage.");

    const formData = new FormData();
    formData.append("telp", editData.phone);
    if (avatarFile) formData.append("avatar", avatarFile);

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
        setIsEditing(false);
        alert("Profil berhasil diperbarui!"); // Alert when successful
        window.location.reload(); // Reload page after alert
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
    setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
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
        console.log("Response status:", response.status); // Tambahkan log
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
    return <div className="loading">Loading...</div>; // Show loading state
  }

  return (
    <MobileLayout title="Profile">
      <div className="p-3">
        <div className="flex items-center bg-green-600 rounded-lg shadow-md p-6 mb-3">
          <img src={profileData.avatar} alt="User Avatar" className="w-24 h-24 rounded-full mr-4 border-2 border-white" />
          <div>
            <h2 className="text-xl font-semibold text-white">{profileData.name || "Loading..."}</h2>
            <p className="text-white">{profileData.division || "Loading..."}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-gray-600 font-semibold">Nama</div>
            <div className="text-gray-900">: {profileData.name || "Loading..."}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-gray-600 font-semibold">Divisi</div>
            <div className="text-gray-900">: {profileData.division || "Loading..."}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-gray-600 font-semibold">Phone</div>
            {!isEditing ? (
              <div className="text-gray-900">: {profileData.phone || "Loading..."}</div>
            ) : (
              <input
                name="phone"
                type="tel"
                className="col-span-2 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
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
              <div className="text-gray-600 font-semibold">Foto Profil</div>
              <input type="file" onChange={handleFileChange} className="col-span-2 w-full p-2 border rounded-md" />
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          {!isEditing ? (
            <button
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              onClick={handleEdit}
            >
              Edit Profil
            </button>
          ) : (
            <button
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={handleSave}
            >
              Simpan
            </button>
          )}
          <button
            className="w-full sm:w-auto ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            onClick={openPasswordModal}
          >
            Ganti Password
          </button>
        </div>

        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Ganti Password</h2>
              <div className="mb-4">
                <label className="block text-gray-600">Old Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded-md"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600">New Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded-md"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <button className="mr-4" onClick={closePasswordModal}>
                  Cancel
                </button>
                <button onClick={handlePasswordSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Profile;
