import React, { useEffect, useState } from "react";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DetailAbsensi from "./DetailAbsensi";
import { useNavigate } from "react-router-dom";

const DataAbsensi = () => {
  const navigate = useNavigate();
  const [absenData, setAbsenData] = useState([]);
  const [selectedAbsen, setSelectedAbsen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [searchName, setSearchName] = useState("");
  const [searchDivisi, setSearchDivisi] = useState("");

  const handleBackClick = () => {
    if (selectedAbsen) {
      setSelectedAbsen(null);
    } else {
      navigate("/home");
    }
  };

  const fetchAbsenData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/absen`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAbsenData(data);
    } catch (err) {
      console.error("Error fetching absen data:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsenDetail = async (id) => {
    if (!id) {
      console.error("Error: Missing id_absen");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/absen/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedAbsen(data);
    } catch (err) {
      console.error("Error fetching absen detail:", err.message);
      setError(err.message);
    }
  };

  const postAbsenStatus = async (id_absen, newStatus) => {
    try {
      if (!id_absen) {
        throw new Error("ID absensi tidak valid");
      }
      const response = await fetch(`${apiUrl}/absen/status/${id_absen}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Gagal memperbarui status");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    fetchAbsenData();
  }, []);

  const handleDetailClick = (id) => {
    fetchAbsenDetail(id);
  };

  const filteredAbsenData = absenData.filter((absen) => {
    const matchesName = absen.nama_user.toLowerCase().includes(searchName.toLowerCase());
    const matchesDivisi = absen.role.toLowerCase().includes(searchDivisi.toLowerCase());
    return matchesName && matchesDivisi;
  });

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (selectedAbsen) {
    return <DetailAbsensi absen={selectedAbsen} onBackClick={handleBackClick} onPostStatus={postAbsenStatus} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-start p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
          <h2 className="text-3xl font-bold text-gray-800 pb-1">Data Absensi</h2>
        </div>
        <div className="flex items-center space-x-2">
      <div className="relative w-full">
        <input type="text" placeholder="Search by Name" value={searchName} onChange={(e) => setSearchName(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <FontAwesomeIcon icon={faSearch} />
        </span>
      </div>
      <div className="relative w-full">
        <input type="text" placeholder="Search by Divisi" value={searchDivisi} onChange={(e) => setSearchDivisi(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <FontAwesomeIcon icon={faSearch} />
        </span>
      </div>
    </div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden">
        <table className="table-auto w-full border-collapse rounded-lg">
          <thead>
            <tr className="text-white bg-transparent">
              <th className="px-4 py-3 text-center font-semibold bg-green-500">No</th>
              <th className="px-4 py-3 text-center font-semibold bg-green-500">Nama User</th>
              <th className="px-4 py-3 text-center font-semibold bg-green-500">Divisi</th>
              <th className="px-4 py-3 text-center font-semibold bg-green-500">Total Absen</th>
              <th className="px-4 py-3 text-center font-semibold bg-green-500">Data Unapproved</th>
              <th className="px-4 py-3 text-center font-semibold bg-green-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredAbsenData.length > 0 ? (
              filteredAbsenData.map((absen, index) => (
                <tr key={absen.id_user} className="border-t hover:bg-gray-50 transition-colors duration-150">
                  <td className="text-center px-4 py-2">{index + 1}</td>
                  <td className="text-center px-4 py-2">{absen.nama_user}</td>
                  <td className="text-center px-4 py-2">{absen.role}</td>
                  <td className="text-center px-4 py-2">{absen.total_absen} Hari</td>
                  <td className="text-center text-red-600 font-bold px-4 py-2">{absen.total_status} Unapproved</td>
                  <td className="text-center px-4 py-2">
                    <button onClick={() => handleDetailClick(absen.id_user)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-150">
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center px-4 py-2">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataAbsensi;
