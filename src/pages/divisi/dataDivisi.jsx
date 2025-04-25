import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const DivisiTable = () => {
  const [divisi, setDivisi] = useState([]);
  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const fetchDivisi = async () => {
    try {
      const res = await fetch(`${apiUrl}/karyawan/divisi`);
      const data = await res.json();
      setDivisi(data);
    } catch (err) {
      console.error("Gagal memuat data divisi:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `${apiUrl}/karyawan/divisi/${editId}` : `${apiUrl}/karyawan/divisi`;
    const method = editId ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      });
      setNama("");
      setEditId(null);
      fetchDivisi();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
    }
  };

  const handleEdit = (item) => {
    setNama(item.nama);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    const konfirmasi = window?.confirm("Yakin ingin menghapus divisi ini?");
    if (!konfirmasi) return;

    try {
      await fetch(`${apiUrl}/karyawan/divisi/${id}`, { method: "DELETE" });
      fetchDivisi();
    } catch (err) {
      console.error("Gagal menghapus:", err);
    }
  };

  useEffect(() => {
    fetchDivisi();
  }, []);

  const handleBackClick = () => {
    navigate(-1);
  };
  return (
    <div className="w-full mx-auto p-6">
      <div className="flex items-center justify-between mb-6 w-full">
        {/* Kiri: Icon + Judul */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackClick}
            title="Kembali"
            className="text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Data Divisi Karyawan</h1>
        </div>

        {/* Kanan: Tombol Tambah */}
        <button
          onClick={() => {
            setEditId(null);
            setNama("");
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow transition duration-200"
        >
          Tambah Divisi
        </button>
      </div>

      {/* Tabel Divisi */}
      <div className="overflow-x-auto bg-white shadow-md rounded-xl border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-6 py-3">Nama Divisi</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {divisi.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center py-4 text-gray-500">
                  Belum ada data divisi.
                </td>
              </tr>
            ) : (
              divisi.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-3">{item.nama}</td>
                  <td className="px-6 py-3 text-center flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-lg text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg text-sm transition"
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
    </div>
  );
};

export default DivisiTable;
