import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const DivisiTable = () => {
  const [divisi, setDivisi] = useState([]);
  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
      fetchDivisi();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
    }
  };

  const handleEdit = (item) => {
    setNama(item.nama);
    setEditId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result1 = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data divisi akan dihapus.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });
  
    if (!result1.isConfirmed) return;
  
    const result2 = await Swal.fire({
      title: 'Konfirmasi terakhir',
      text: "Data tidak bisa dikembalikan setelah dihapus. Lanjutkan?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Hapus Sekarang',
      cancelButtonText: 'Batal',
    });
  
    if (!result2.isConfirmed) return;
  
    try {
      const response = await fetch(`${apiUrl}/karyawan/divisi/${id}`, {
        method: "DELETE",
      });
  
      if (!response.ok) throw new Error("Gagal menghapus data");
  
      fetchDivisi();
  
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Divisi berhasil dihapus.',
        timer: 1500,
        showConfirmButton: false
      });
  
    } catch (err) {
      console.error("Gagal menghapus:", err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Terjadi kesalahan saat menghapus.',
      });
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
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
            onClick={handleBackClick}
            title="Back to Home"
          />
          <h1 className="text-3xl font-bold text-gray-800 pb-1">Data Divisi</h1>
        </div>

        <button
          onClick={() => {
            setEditId(null);
            setNama("");
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded shadow transition duration-200 flex items-center"
        >
              <FontAwesomeIcon icon={faPlus}/>
              <span className="sm:block hidden ml-2 ">Tambah Divisi</span> 
        </button>
      </div>

      {/* Tabel Divisi */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-green-600 text-white">
            <tr>
            {/* <th className="px-6 py-1 text-center">No.</th> */}
              <th className="px-6 py-1 text-center">Nama Divisi</th>
              {/* <th className="px-6 py-1 text-center">Menu</th> */}
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
                  {/* <td className="px-6 py-1 text-center font-semibold">{divisi.indexOf(item) + 1}</td> */}
                  <td className="px-6 py-1 text-center font-semibold">{item.nama}</td>
                  {/* <td className="px-6 py-1 flex justify-center items-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded font-semibold text-xs transition flex items-center"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        <span className="sm:block hidden ml-2">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded font-semibold text-xs transition flex items-center"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span className="sm:block hidden ml-2">Hapus</span>
                      </button>
                    </td> */}

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setNama("");
                setEditId(null);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
              title="Tutup"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              {editId ? "Edit Divisi" : "Tambah Divisi"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Divisi</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow transition"
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

export default DivisiTable;
