import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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

  const handleEdit = (item) => {
    setNama(item.nama);
    setJamMasuk(item.jam_masuk);
    setJamPulang(item.jam_pulang);
    setEditId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus shift?",
      text: "Data shift akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${apiUrl}/shift/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus shift");
      fetchShift();
      Swal.fire("Berhasil", "Shift dihapus.", "success");
    } catch (err) {
      console.error("Gagal menghapus:", err);
      Swal.fire("Gagal", "Terjadi kesalahan saat menghapus.", "error");
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex items-center justify-between mb-6 w-full">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="cursor-pointer text-white bg-green-600 hover:bg-green-700 rounded-full p-3 shadow-lg"
            onClick={handleBackClick}
            title="Kembali"
          />
          <h1 className="text-3xl font-bold text-gray-800 pb-1">Kelola Jam Kerja</h1>
        </div>

        <button
          onClick={() => {
            setEditId(null);
            setNama("");
            setJamMasuk("");
            setJamPulang("");
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded shadow transition flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span className="sm:block hidden ml-2">Tambah Shift</span>
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-6 py-2 text-center">JadwaL Shift</th>
              <th className="px-6 py-2 text-center">Jam Masuk</th>
              <th className="px-6 py-2 text-center">Jam Pulang</th>
              <th className="px-6 py-2 text-center">Menu</th>
            </tr>
          </thead>
          <tbody>
            {shiftList.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  Belum ada data shift.
                </td>
              </tr>
            ) : (
              shiftList.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-6 py-2 text-center font-semibold">{item.nama}</td>
                    <td className="px-6 py-2 text-center">{item.jam_masuk}</td>
                    <td className="px-6 py-2 text-center">{item.jam_pulang}</td>
                    <td className="px-6 py-2 text-center space-x-2">
                    <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm shadow"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm shadow"
                    >
                        Hapus
                    </button>
                    </td>
                </tr>
                ))

            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setNama("");
                setJamMasuk("");
                setJamPulang("");
                setEditId(null);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
              title="Tutup"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              {editId ? "Edit Shift" : "Tambah Shift"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Shift</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
                <input
                  type="time"
                  value={jamMasuk}
                  onChange={(e) => setJamMasuk(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pulang</label>
                <input
                  type="time"
                  value={jamPulang}
                  onChange={(e) => setJamPulang(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftTable;
