import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DekstopLayout from "../../layouts/dekstopLayout";

const DataLokasi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [lokasiData, setLokasiData] = useState([]);
  const [newLocation, setNewLocation] = useState({ nama: "", koordinat: "" });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLokasiData = async () => {
    try {
      const response = await fetch(`${apiUrl}/lokasi/`);
      const result = await response.json();
      setLokasiData(result.data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  useEffect(() => {
    fetchLokasiData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation({ ...newLocation, [name]: value });
  };

  const addNewLocation = async () => {
    try {
      const response = await fetch(`${apiUrl}/lokasi/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLocation),
      });
      if (response.ok) {
        Swal.fire("Success!", "Data berhasil ditambahkan!", "success");
        fetchLokasiData();
        resetForm();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  const handleEditClick = (lokasi) => {
    setIsEdit(true);
    setEditId(lokasi.id);
    setNewLocation({ nama: lokasi.nama, koordinat: lokasi.koordinat });
    setIsModalOpen(true);
  };

  const updateLocation = async () => {
    try {
      const response = await fetch(`${apiUrl}/lokasi/update/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLocation),
      });
      if (response.ok) {
        Swal.fire("Success!", "Data berhasil diupdate!", "success");
        fetchLokasiData();
        resetForm();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const deleteLocation = async (id) => {
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
        const response = await fetch(`${apiUrl}/lokasi/delete/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          Swal.fire("Deleted!", "Data berhasil dihapus!", "success");
          fetchLokasiData();
        }
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  const resetForm = () => {
    setNewLocation({ nama: "", koordinat: "" });
    setIsEdit(false);
    setEditId(null);
  };

  const customElements = (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-150"
      >
        Tambah Lokasi
      </button>
    </div>
  );

  const header = (
    <>
      <th className="px-4 py-2 border text-xs">No</th>
      <th className="px-4 py-2 border text-xs">Lokasi</th>
      <th className="px-4 py-2 border text-xs">Koordinat</th>
      <th className="px-4 py-2 border text-xs">Aksi</th>
    </>
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = lokasiData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(lokasiData.length / itemsPerPage);

  const body = currentItems.map((lokasi, index) => (
    <tr key={lokasi.id} className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-4 py-1 border text-sm text-center">{indexOfFirstItem + index + 1}</td>
      <td className="px-4 py-1 border text-sm">{lokasi.nama}</td>
      <td className="px-4 py-1 border text-sm">{lokasi.koordinat}</td>
      <td className="px-4 py-1 border text-sm text-center">
        <button
          onClick={() => handleEditClick(lokasi)}
          className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors duration-150"
        >
          Edit
        </button>
        <button
          onClick={() => deleteLocation(lokasi.id)}
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors duration-150"
        >
          Delete
        </button>
      </td>
    </tr>
  ));

  return (
    <>
      <DekstopLayout
        title="Data Lokasi"
        header={header}
        body={body}
        customElements={customElements}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={(page) => setCurrentPage(page)}
      />

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full sm:w-96">
            <h3 className="text-xl font-bold mb-4">{isEdit ? "Edit Lokasi" : "Tambah Lokasi"}</h3>
            <input
              type="text"
              name="nama"
              placeholder="Nama Lokasi"
              value={newLocation.nama}
              onChange={handleInputChange}
              className="border px-4 py-2 w-full mb-2"
            />
            <input
              type="text"
              name="koordinat"
              placeholder="Koordinat"
              value={newLocation.koordinat}
              onChange={handleInputChange}
              className="border px-4 py-2 w-full mb-2"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={isEdit ? updateLocation : addNewLocation}
                className={`px-4 py-2 text-white ${isEdit ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"} transition-colors duration-150 rounded`}
              >
                {isEdit ? "Update" : "Tambah"}
              </button>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 transition-colors duration-150 rounded ml-2"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataLokasi;
