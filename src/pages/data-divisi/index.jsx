import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faExclamationTriangle, faEye, faPlus, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast"
import Select from "react-select";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader } from "../../components";
import { Modal, Pagination, LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";

const DivisiTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerusahaan, setSelectedPerusahaan] = useState("");
  const [perusahaan, setPerusahaan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [divisi, setDivisi] = useState([]);
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [openKeterangan, setOpenKeterangan] = useState(null);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const perusahaanOptions = perusahaan.map((p) => ({ value: p.id, label: p.nama,}));

  const fetchDivisi = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithJwt(`${apiUrl}/karyawan/divisi`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();

      // Ambil array divisi dari response
      setDivisi(Array.isArray(json.data) ? json.data : []);

      // Optional: tampilkan success/message jika mau logging
      console.log("Success:", json.success, "Message:", json.message);
    } catch (err) {
      console.error("Gagal memuat data divisi:", err);
      setError("Gagal memuat data divisi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };
  const fetchPerusahaan = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/perusahaan`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setPerusahaan(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Gagal memuat data perusahaan:", err);
      toast.error("Gagal memuat daftar perusahaan");
    }
  };

  useEffect(() => {
    fetchDivisi();
    fetchPerusahaan();
  }, []);

  useEffect(() => {
    fetchDivisi();
  }, []);

  const filteredDivisi = divisi.filter((d) => {
    const term = searchTerm.trim().toLowerCase();

    if (/^\d+$/.test(term)) {
      return String(d.id) === term;
    }

    return d.nama.toLowerCase().includes(term);
  });


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDivisi = filteredDivisi.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama.trim() || !keterangan.trim() || !selectedPerusahaan) {
      toast.error("Nama, keterangan, dan perusahaan wajib diisi.");
      return;
    }

    const url = editId
      ? `${apiUrl}/karyawan/divisi/${editId}`
      : `${apiUrl}/karyawan/divisi`;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetchWithJwt(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          keterangan,
          id_perusahaan: selectedPerusahaan,
        }),
      });

      if (!res.ok) {
        // ambil pesan error dari server bila ada
        let msg = `Gagal menyimpan (status ${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson?.message) msg = errJson.message;
        } catch (_) { }
        throw new Error(msg);
      }

      toast.success(
        editId ? "Divisi berhasil diperbarui." : "Divisi berhasil ditambahkan."
      );

      setNama("");
      setKeterangan("");
      setEditId(null);
      setIsModalOpen(false);
      fetchDivisi();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      toast.error(err.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };


  const handleEdit = (item) => {
    setNama(item.nama);
    setKeterangan(item.keterangan || "");
    setSelectedPerusahaan(item.id_perusahaan || ""); // set default
    setEditId(item.id);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full mx-auto">
      <SectionHeader title="Data Divisi" subtitle={`Menampilkan dan mengelola ${divisi.length} divisi yang tersedia.`} onBack={() => navigate("/")}
        actions={
          <button onClick={() => { setEditId(null); setNama(""); setKeterangan(""); setIsModalOpen(true); }} title="Tambah Divisi" aria-label="Tambah Divisi" className="flex items-center justify-center px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
            <FontAwesomeIcon icon={faPlus} className="text-base sm:mr-2" />
            <span className="hidden sm:inline text-base">
              Tambah Divisi
            </span>
          </button>
        }
      />

      <div className="my-3">
        <SearchBar className="max-w-lg sm:max-w-full" placeholder="Cari nama divisi..." onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }} />
      </div>

      <div className="hidden sm:block">
        <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-green-500 text-white font-semibold">
              <tr>
                <th className="px-4 py-3 text-center w-20">No.</th>
                <th className="px-4 py-3">Nama Divisi</th>
                <th className="px-4 py-3 text-center w-48">Menu</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="3" className="py-10 text-center">
                    <LoadingSpinner size="lg" text="Memuat data divisi..." />
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="3" className="py-10 text-center">
                    <ErrorState message={error} onRetry={fetchDivisi} />
                  </td>
                </tr>
              )}

              {!loading && !error && currentDivisi.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-10 text-center">
                    <EmptyState message="Belum ada data divisi." />
                  </td>
                </tr>
              )}

              {!loading && !error && currentDivisi.length > 0 &&
                currentDivisi.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <tr className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-1.5 text-center">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-1.5 font-semibold text-gray-800 flex items-center gap-2 uppercase">
                        {item.nama}
                      </td>
                      <td className="px-4 py-1.5 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(item)} className="flex items-center text-xs gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-semibold transition hover:scale-105">
                            <FontAwesomeIcon icon={faEdit} /> Edit
                          </button>
                          <button onClick={() => setOpenKeterangan(openKeterangan === item.id ? null : item.id)} className="flex items-center text-xs gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold transition hover:scale-105">
                            <FontAwesomeIcon icon={faInfoCircle} /> Detail
                          </button>
                        </div>
                      </td>
                    </tr>

                    {openKeterangan === item.id && (
                      <tr className="bg-gray-50 transition-all duration-300 ease-in-out">
                        <td colSpan="3" className="px-4 py-2 text-sm text-gray-700">
                          <div className="p-2 border-l-4 border-green-500 bg-green-50 rounded-md">
                            <strong>Keterangan:</strong>
                            <p className="mt-1">
                              {item.keterangan || "Tidak ada keterangan"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination Desktop */}
        {filteredDivisi.length > itemsPerPage && (
          <div className="mt-2">
            <Pagination currentPage={currentPage} totalItems={filteredDivisi.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* Card Mobile */}
      <div className="sm:hidden space-y-4">
        {currentDivisi.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl mb-3 text-gray-400" />
            <div className="text-lg font-medium">Oops! Belum ada data divisi.</div>
          </div>
        ) : (
          currentDivisi.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-md p-4 transition hover:shadow-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="text-base font-semibold text-gray-800 leading-tight ">{item.nama}</div>
                <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-[10px] font-medium shadow-sm transition whitespace-nowrap" title="Edit Divisi">
                  <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                </button>
              </div>
              <div className="border-t border-dashed border-gray-300 my-2" />
              <div className={`text-[10px] text-justify ${!item.keterangan ? "text-gray-400 italic" : "text-gray-600"} leading-snug`}>
                {item.keterangan || "Tidak ada keterangan"}
              </div>
            </div>
          ))
        )}

        {/* Pagination Mobile */}
        {filteredDivisi.length > itemsPerPage && (
          <Pagination currentPage={currentPage} totalItems={filteredDivisi.length} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
        )}
      </div>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setNama(""); setKeterangan(""); setEditId(null); }} title={editId ? "Edit Divisi" : "Tambah Divisi"} note="Isi data divisi dengan lengkap dan benar !" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Divisi</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required disabled={!!editId} placeholder="Masukkan nama divisi" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Divisi Ini Berlaku Di Perusahaan
            </label>
            <Select options={perusahaanOptions} value={perusahaanOptions.find(opt => opt.value === selectedPerusahaan) || null} onChange={(opt) => setSelectedPerusahaan(opt?.value || "")} placeholder="Pilih Perusahaan" className="react-select-container" classNamePrefix="react-select" isClearable />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Keterangan Divisi</label>
            <textarea rows={8} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} required placeholder="Tulis keterangan singkat tentang divisi ini" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
          <div className="text-right">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DivisiTable;