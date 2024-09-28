import React, { useEffect, useState } from "react";

const DataKaryawan = ({ username }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL; // Ensure this environment variable is set
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/profil`); // Fetch all profiles
        const result = await response.json();
        if (result.success) {
          setUsers(result.data);
        } else {
          console.error("Failed to fetch data:", result.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once

  const handleEdit = (id) => {
    // Add your edit logic here
    console.log("Edit user with ID:", id);
  };

  const handleDelete = (id) => {
    // Add your delete logic here
    console.log("Delete user with ID:", id);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">User Profiles</h1>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">ID</th>
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Phone</th>
            <th className="py-3 px-6 text-left">Photo</th>
            <th className="py-3 px-6 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6">{user.id}</td>
                <td className="py-3 px-6">{user.nama}</td>
                <td className="py-3 px-6">{user.telp || "No phone number"}</td>
                <td className="py-3 px-6">
                  {user.foto ? (
                    <img src={`${process.env.REACT_APP_API_BASE_URL}/path/to/images/${user.foto}`} alt={user.nama} className="w-12 h-12 rounded-full" />
                  ) : (
                    <span>No Photo</span>
                  )}
                </td>
                <td className="py-3 px-6">
                  <button 
                    onClick={() => handleEdit(user.id)} 
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)} 
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-3 px-6 text-center">No users found</td> {/* Updated to 5 columns */}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataKaryawan;
