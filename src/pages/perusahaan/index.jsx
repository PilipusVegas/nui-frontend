import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faExclamationCircle, faPlus, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";

const KelolaPerusahaan = () => {
  const [perusahaan, setPerusahaan] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const fetchPerusahaan = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/perusahaan`);
      const data = await res.json();
      setPerusahaan(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Gagal memuat data perusahaan:", err);
      setPerusahaan([]); // fallback kosong agar UI tetap aman
    }
  };
  const handleBackClick = () => navigate("/home");

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6 w-full">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition rounded-full p-3 shadow-lg" onClick={handleBackClick}/>
          <h1 className="text-lg sm:text-3xl font-bold text-gray-800 mb-1">Kelola Perusahaan</h1>
        </div>

        <button onClick={() => navigate("/perusahaan/tambah")} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 sm:py-3 rounded-md shadow flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} />
          <span className="text-sm block sm:hidden">Tambah</span>
          <span className="text-sm hidden sm:block">Tambah Perusahaan</span>
        </button>
      </div>

      {/* Mode Desktop - Table */}
      <div className="hidden sm:block overflow-x-auto bg-white shadow-md rounded-xl border border-gray-200">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-green-600 text-white text-sm uppercase">
            <tr>
              <th className="py-2 px-8 w-16 font-semibold">No.</th>
              <th className="py-2 px-4 font-semibold">Nama Perusahaan</th>
              <th className="py-2 px-4 font-semibold">Alamat Perusahaan</th>
              <th className="py-2 px-4 font-semibold text-center w-32">Menu</th>
            </tr>
          </thead>
          <tbody>
            {perusahaan.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-5xl text-gray-400" />
                    <p className="text-base font-medium">Belum ada data perusahaan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              perusahaan.map((item, index) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition-all duration-150">
                  <td className="px-8 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-semibold uppercase">{item.nama}</td>
                  <td className="px-4 py-2">{item.alamat}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => navigate(`/perusahaan/edit/${item.id}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 text-xs font-medium rounded transition">
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


      {/* Mode Mobile - Card */}
      <div className="sm:hidden space-y-3">
        {perusahaan.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl mb-2 text-gray-400" />
            <p>Belum ada data perusahaan.</p>
          </div>
        ) : (
          perusahaan.map((item, index) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-2">
              <h3 className="font-semibold text-gray-800 uppercase text-sm">{item.nama}</h3>
              <p className="text-gray-600 text-[10px]">{item.alamat}</p>
              <div className="pt-2 border-t flex justify-end">
                <button onClick={() => navigate(`/perusahaan/edit/${item.id}`)} className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded px-3 py-1 text-xs shadow-sm">
                  <FontAwesomeIcon icon={faEdit} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default KelolaPerusahaan;
