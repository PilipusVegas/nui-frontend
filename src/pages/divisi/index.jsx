import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faExclamationTriangle, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import {SectionHeader} from "../../components";
import Modal from "../../components/desktop/Modal";

const DivisiTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [divisi, setDivisi] = useState([]);
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  const fetchDivisi = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/karyawan/divisi`);
      const data = await res.json();
      setDivisi(data);
    } catch (err) {
      console.error("Gagal memuat data divisi:", err);
    }
  };

  useEffect(() => {
    fetchDivisi();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi input menggunakan Swal
    if (!nama.trim() || !keterangan.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Nama divisi dan keterangan wajib diisi dengan benar.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    const url = editId ? `${apiUrl}/karyawan/divisi/${editId}` : `${apiUrl}/karyawan/divisi`;
    const method = editId ? "PUT" : "POST";

    try {
      await fetchWithJwt(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, keterangan }),
      });

      await Swal.fire({
        icon: "success",
        title: editId ? "Berhasil diperbarui" : "Berhasil ditambahkan",
        text: `Data divisi berhasil ${editId ? "diperbarui" : "ditambahkan"}.`,
        confirmButtonColor: "#16a34a",
      });

      setNama("");
      setKeterangan("");
      setEditId(null);
      setIsModalOpen(false);
      fetchDivisi();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleEdit = (item) => {
    setNama(item.nama);
    setKeterangan(item.keterangan || "");
    setEditId(item.id);
    setIsModalOpen(true);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="w-full mx-auto">
      <SectionHeader title="Data Divisi" subtitle="Menampilkan semua divisi yang ada di perusahaan." onBack={handleBackClick}
        actions={
          <button onClick={() => { setEditId(null); setNama(""); setKeterangan(""); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2" title="Tambah Divisi" aria-label="Tambah Divisi">
            <FontAwesomeIcon icon={faPlus} className="text-sm sm:text-base" />
            <span className="ml-2 text-xs sm:hidden pb-1">Tambah</span>
            <span className="hidden sm:inline ml-2 text-base">Tambah Divisi</span>
          </button>
        }
      />

      {/* Tabel (Desktop) */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-2 text-center w-20">No.</th>
                <th className="px-4 py-2">Divisi</th>
                <th className="px-4 py-2 text-center w-48">Menu</th>
              </tr>
            </thead>
            <tbody>
              {divisi.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-10 text-gray-500">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl mb-2 text-gray-400"/>
                    <div className="text-lg font-medium text-gray-500">
                      Oops! Data divisi tidak ditemukan. Apakah kamu belum menambahkannya?
                    </div>
                  </td>
                </tr>
              ) : (
                divisi.map((item, index) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-center">{index + 1}</td>
                    <td className="px-4 py-2">
                      <div className="font-semibold text-gray-800">
                        {item.nama}
                      </div>
                      <div className={`text-xs whitespace-normal break-words tracking-wide ${!item.keterangan ? "text-gray-400 italic" : "text-gray-600" }`}>
                        {item.keterangan || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => handleEdit(item)} className="p-1 px-3 bg-yellow-500 rounded-md text-white hover:bg-yellow-600 transition font-semibold">
                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card (Mobile Only) */}
      <div className="sm:hidden space-y-4">
        {divisi.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl mb-3 text-gray-400" />
            <div className="text-lg font-medium">Oops! Belum ada data divisi.</div>
          </div>
        ) : (
          divisi.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-md p-4 transition hover:shadow-lg">
              {/* Header: Nama Divisi + Tombol Edit */}
              <div className="flex items-start justify-between mb-2">
                <div className="text-base font-semibold text-gray-800 leading-tight">
                  {item.nama}
                </div>
                <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-[10px] font-medium shadow-sm transition whitespace-nowrap" title="Edit Divisi">
                  <FontAwesomeIcon icon={faEdit} className="mr-1" />
                  Edit
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300 my-2" />

              {/* Keterangan */}
              <div className={`text-[10px] text-justify ${!item.keterangan ? 'text-gray-400 italic' : 'text-gray-600'} leading-snug`}>
                {item.keterangan || "Tidak ada keterangan"}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setNama(""); setKeterangan(""); setEditId(null); }} title={editId ? "Edit Divisi" : "Tambah Divisi"} note="Isi data divisi dengan lengkap dan benar !" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nama Divisi
            </label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required disabled={!!editId} placeholder="Masukkan nama divisi" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Keterangan
            </label>
            <textarea rows={3} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} required placeholder="Tulis keterangan singkat tentang divisi ini" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
          <div className="text-right">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition">
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DivisiTable;