import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faExclamationCircle, faPlus, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const KelolaPerusahaan = () => {
  const [perusahaan, setPerusahaan] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const fetchPerusahaan = async () => {
    try {
      const res = await fetch(`${apiUrl}/perusahaan`);
      const data = await res.json();
      setPerusahaan(data.data);
    } catch (err) {
      console.error("Gagal memuat data perusahaan:", err);
    }
  };

  const handleBackClick = () => navigate(-1);

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex items-center justify-between mb-6 w-full">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition rounded-full p-3 shadow-lg" onClick={handleBackClick}/>
          <h1 className="text-lg sm:text-3xl font-bold text-gray-800 mb-1">Kelola Perusahaan</h1>
        </div>

        <button onClick={() => navigate("/perusahaan/tambah")} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded shadow flex items-center">
          <FontAwesomeIcon icon={faPlus} />
          <span className="ml-2 text-sm">Tambah Perusahaan</span>
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-green-600 text-white">
            <tr>
            <th className="pl-20 py-1.5 font-semibold">No.</th>
              <th className="px-6 py-1.5 font-semibold">Nama Perusahaan</th>
              <th className="px-6 py-1.5 font-semibold">Alamat Perusahaan</th>
              <th className="px-6 py-1.5 font-semibold text-center">Menu</th>
            </tr>
          </thead>
          <tbody>
            {perusahaan.length === 0 ? (
              <tr>
              <td colSpan="5" className="py-10 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-6xl text-gray-400" />
                  <p className="text-lg font-medium text-gray-600">Belum ada data perusahaan.</p>
                </div>
              </td>
            </tr>
            ) : (
              perusahaan.map((item, index) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                  <td className="pl-20 py-1">{index + 1}</td>
                  <td className="px-6 py-1 font-semibold uppercase">{item.nama}</td>
                  <td className="px-6 py-1">{item.alamat}</td>
                  <td className="px-6 py-1 text-center">
                    <button onClick={() => navigate(`/perusahaan/edit/${item.id}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded text-sm">
                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KelolaPerusahaan;
