import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faTimes,faEdit, faClock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const ShiftTable = () => {
  const [shiftList, setShiftList] = useState([]);
  const [nama, setNama] = useState("");
  const [jamMasuk, setJamMasuk] = useState("");
  const [jamPulang, setJamPulang] = useState("");
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const fetchShift = async () => {
  try {
    const res = await fetch(`${apiUrl}/shift`);
    const data = await res.json();
    
    const result = Array.isArray(data) ? data : data.data ?? [];
    setShiftList(result);
  } catch (err) {
    console.error("Gagal memuat data shift:", err);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `${apiUrl}/shift/${editId}` : `${apiUrl}/shift`;
    const method = editId ? "PUT" : "POST";
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, jam_masuk: jamMasuk, jam_pulang: jamPulang }),
      });
      setNama("");
      setJamMasuk("");
      setJamPulang("");
      setEditId(null);
      setIsModalOpen(false);
      fetchShift();
    } catch (err) {
      console.error("Gagal menyimpan data shift:", err);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex items-center justify-between mb-6 w-full">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <FontAwesomeIcon icon={faArrowLeft} className="cursor-pointer text-white bg-green-600 hover:bg-green-700 rounded-full p-3 shadow-lg" onClick={handleBackClick} title="Kembali"/>
          <h1 className="text-3xl font-bold text-gray-800 pb-1">Kelola Jam Kerja</h1>
        </div>
        <button onClick={() => navigate("/shift/tambah")} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded shadow transition flex items-center">
          <FontAwesomeIcon icon={faPlus} />
          <span className="sm:block hidden ml-2">Tambah Shift</span>
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-6 py-2 text-center">Jadwal Shift</th>
              <th className="px-6 py-2 text-center">Menu</th>
            </tr>
          </thead>
          <tbody>
            {shiftList.length === 0 ? (
              <tr>
              <td colSpan="3">
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <FontAwesomeIcon icon={faClock} className="text-6xl text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-center">
                    Belum ada data shift yang tersedia. Coba tambahkan terlebih dahulu, ya!
                  </span>
                </div>
              </td>
            </tr>
            ) : (
              shiftList.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-6 py-2 text-center font-semibold">{item.nama}</td>
                    {/* <td className="px-6 py-2 text-center">{item.jam_masuk} - {item.jam_pulang}</td> */}
                    <td className="px-6 py-2 text-center space-x-2">
                    <button onClick={() => navigate(`/shift/edit/${item.id}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm shadow">
                      <FontAwesomeIcon icon={faEdit} />
                       <span className="ml-2">Edit</span> 
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

export default ShiftTable;
