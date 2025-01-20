import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DekstopLayout from "../../layouts/dekstopLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEye,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const DataLokasi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const itemsPerPage = 10;

  const [lokasiData, setLokasiData] = useState([]);
  const [formState, setFormState] = useState({ nama: "", koordinat: "" });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLokasiData();
  }, []); 

  const fetchLokasiData = async () => {
    try {
      const response = await fetch(`${apiUrl}/lokasi/`);
      const data = await response.json();
      setLokasiData(data.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleInputChange = ({ target: { name, value } }) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const endpoint = isEdit ? `${apiUrl}/lokasi/update/${editId}` : `${apiUrl}/lokasi/create`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (response.ok) {
        Swal.fire("Success!", `Data berhasil ${isEdit ? "diupdate" : "ditambahkan"}!`, "success");
        fetchLokasiData();
        closeModal();
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "adding"} location:`, error);
    }
  };

  const handleEdit = (lokasi) => {
    setIsEdit(true);
    setEditId(lokasi.id);
    setFormState({ nama: lokasi.nama, koordinat: lokasi.koordinat });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Anda yakin ingin menghapus?",
      text: "Data ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      iconColor: "#FF0000",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${apiUrl}/lokasi/delete/${id}`, { method: "DELETE" });
        if (response.ok) {
          Swal.fire("Deleted!", "Data berhasil dihapus!", "success");
          fetchLokasiData();
        }
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormState({ nama: "", koordinat: "" });
    setIsEdit(false);
    setEditId(null);
  };

  const renderHeader = () => (
    <>
      <th className="px-4 py-1 border text-xs">No</th>
      <th className="px-4 py-1 border text-xs">Lokasi</th>
      <th className="px-4 py-1 border text-xs">Koordinat</th>
      <th className="px-4 py-1 border text-xs">Aksi</th>
    </>
  );

  const renderBody = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = lokasiData.slice(indexOfFirstItem, indexOfLastItem);

    return currentItems.map((lokasi, index) => (
      <tr key={lokasi.id} className="hover:bg-gray-50 transition-colors duration-150">
        <td className="px-4 py-1 border text-sm text-center">{indexOfFirstItem + index + 1}</td>
        <td className="px-4 py-1 border text-sm">{lokasi.nama}</td>
        <td className="px-4 py-1 border text-sm">{lokasi.koordinat}</td>
        <td className="px-4 py-1 border text-sm text-center">
          <button
            onClick={() => handleEdit(lokasi)}
            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors duration-150"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={() => handleDelete(lokasi.id)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors duration-150"
          >
            <FontAwesomeIcon  icon={faTrash} />
          </button>
        </td>
      </tr>
    ));
  };

  const renderModal = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full sm:w-96">
        <h3 className="text-xl font-bold mb-4">{isEdit ? "Edit Lokasi" : "Tambah Lokasi"}</h3>
        <input
          type="text"
          name="nama"
          placeholder="Nama Lokasi"
          value={formState.nama}
          onChange={handleInputChange}
          className="border px-4 py-2 w-full mb-2"
        />
        <input
          type="text"
          name="koordinat"
          placeholder="Koordinat"
          value={formState.koordinat}
          onChange={handleInputChange}
          className="border px-4 py-2 w-full mb-2"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className={`px-4 py-2  text-white ${isEdit ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"} transition-colors duration-150 rounded`}
          >
            {isEdit ? "Update" : "Tambah"}
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 transition-colors duration-150 rounded ml-2"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DekstopLayout
        title="Data Lokasi"
        header={renderHeader()}
        body={renderBody()}
        customElements={
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-150"
          >
            Tambah Lokasi
          </button>
        }
        currentPage={currentPage}
        totalPages={Math.ceil(lokasiData.length / itemsPerPage)}
        handlePageChange={setCurrentPage}
      />

      {isModalOpen && renderModal()}
    </>
  );
};

export default DataLokasi;
