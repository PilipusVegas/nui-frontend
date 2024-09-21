import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    division: "",
    avatar: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profileData });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Fetch profile data from the API
  useEffect(() => {
    const id_user = localStorage.getItem("userId");
    if (!id_user) {
      console.error("User ID not found in localStorage.");
      return;
    }

    fetch(`http://192.168.130.42:3002/profil/user/${id_user}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const userProfile = data.data;
        if (userProfile) {
          setProfileData({
            name: userProfile.nama,
            phone: userProfile.telp || "No phone number",
            division: userProfile.divisi || "No division",
            avatar: userProfile.foto || "https://via.placeholder.com/150",
          });
          setEditData({
            name: userProfile.nama,
            phone: userProfile.telp || "",
            division: userProfile.divisi || "",
            avatar: userProfile.foto || "https://via.placeholder.com/150",
          });
        } else {
          console.log("No profile data found for the logged-in user.");
        }
      })
      .catch((error) => console.error("Error fetching profile data:", error));
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const id_user = localStorage.getItem("userId");
    if (!id_user) {
      console.error("User ID not found in localStorage.");
      return;
    }

    // Send PUT request to update profile data  
    fetch(`http://192.168.130.42:3002/profil/user/${id_user}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telp: editData.te, // Perbaikan di sini
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update profile");
        }
        return response.json();
      })
      .then(() => {
        // Update the local state
        setProfileData((prevData) => ({
          ...prevData,
          phone: editData.telp, // Perbaikan di sini
        }));
        setIsEditing(false);
      })
      .catch((error) => console.error("Error updating profile data:", error));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const openPasswordModal = () => setIsPasswordModalOpen(true);
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  };

  const handlePasswordSubmit = () => {
    // Implement password change logic here
  };

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
            <div className="text-gray-600 font-semibold">Nomor Telepon</div>
            {!isEditing ? (
              <div className="text-gray-900">: {profileData.phone || "Loading..."}</div>
            ) : (
              <input
                name="phone"
                type="text"
                className="col-span-2 w-full p-2 border rounded-md"
                value={editData.phone}
                onChange={handleChange}
              />
            )}
          </div>
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
                <label className="block text-gray-600">Current Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded-md"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
              <div className="mb-4">
                <label className="block text-gray-600">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded-md"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                />
              </div>
              <div className="flex justify-between">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  onClick={handlePasswordSubmit}
                >
                  Submit
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  onClick={closePasswordModal}
                >
                  Batal
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
