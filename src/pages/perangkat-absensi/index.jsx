import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { 
  Modal, 
  SectionHeader, 
  MobileDataCard, 
  EmptyState, 
  ErrorState, 
  LoadingSpinner,
  DataView
} from "../../components";

const PerangkatAbsensi = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [menu, setMenu] = useState([]);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchMenu = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchWithJwt(`${apiUrl}/mesin`);
      const data = await res.json();
      setMenu(data?.success ? data.data || [] : []);
    } catch (err) {
      console.error("Gagal memuat data menu:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim() || !deskripsi.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Nama perangkat dan deskripsi wajib diisi.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    const url = editId ? `${apiUrl}/mesin/${editId}` : `${apiUrl}/mesin`;
    const method = editId ? "PUT" : "POST";

    try {
      await fetchWithJwt(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, deskripsi }),
      });

      await Swal.fire({
        icon: "success",
        title: editId ? "Berhasil diperbarui" : "Berhasil ditambahkan",
        text: `Perangkat berhasil ${editId ? "diperbarui" : "ditambahkan"}.`,
        confirmButtonColor: "#16a34a",
      });

      setNama("");
      setDeskripsi("");
      setEditId(null);
      setIsModalOpen(false);
      fetchMenu();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: "Terjadi kesalahan saat menyimpan data.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleEdit = (item) => {
    setNama(item.nama);
    setDeskripsi(item.deskripsi || "");
    setEditId(item.id);
    setIsModalOpen(true);
  };

  /* CONFIG DATA TABLE (DINAMIS) */
  const columns = ({ currentPage, itemsPerPage }) => [
    {
      label: "No.",
      align: "text-center",
      render: (_, i) => (
        <span className="font-bold text-center">
          {(currentPage - 1) * itemsPerPage + i + 1}
        </span>
      ),
    },
    {
      label: "Nama & Lokasi Perangkat",
      render: (item) => (
        <div className="font-semibold text-gray-800">{item.nama}</div>
      ),
    },
    {
      label: "Deskripsi Lokasi Perangkat",
      render: (item) => (
        <span className="text-sm text-gray-600 break-words">
          {item.deskripsi || "Tidak ada deskripsi"}
        </span>
      ),
    },
    {
      label: "Menu",
      align: "text-center",
      render: (item) => (
        <button
          onClick={() => handleEdit(item)}
          className="p-2 px-3 bg-yellow-500 rounded-md text-white hover:bg-yellow-600 transition"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
      ),
    },
  ];

  const renderMobile = (item, index) => (
    <MobileDataCard
      key={item.id}
      title={item.nama}
      subtitle={`Perangkat #${index + 1}`}
      content={
        <p className="text-xs text-gray-500 leading-relaxed">
          {item.deskripsi || "Tidak ada deskripsi"}
        </p>
      }
      actions={
        <button
          onClick={() => handleEdit(item)}
          className="bg-yellow-500 text-white px-3 py-1.5 rounded text-xs"
        >
          <FontAwesomeIcon icon={faEdit} className="mr-1" />
          Edit
        </button>
      }
    />
  );

  return (
    <div className="w-full mx-auto">
      <SectionHeader
        title="Perangkat Absensi"
        subtitle="Data Perangkat Absensi Face Recognition."
        onBack={() => navigate(-1)}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        }
      />

      {loading && <LoadingSpinner />}

      {!loading && error && (
        <ErrorState
          message="Gagal Memuat Data"
          detail="Terjadi kesalahan saat mengambil data perangkat absensi."
          onRetry={fetchMenu}
        />
      )}

      {!loading && !error && menu.length === 0 && (
        <EmptyState
          title="Belum Ada Perangkat"
          description="Silakan tambahkan perangkat absensi terlebih dahulu."
          actionText="Tambah Perangkat"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {!loading && !error && menu.length > 0 && (
        <DataView
          data={menu}
          columns={columns}
          renderMobile={renderMobile}
          searchable
          searchKeys={["nama", "deskripsi"]}
          itemsPerPage={5}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNama("");
          setDeskripsi("");
          setEditId(null);
        }}
        title={editId ? "Edit Perangkat" : "Tambah Perangkat"}
        note="Lengkapi form ini untuk menambahkan perangkat absensi dalam sistem."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Nama Device Mesin
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan nama perangkat"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Deskripsi Lokasi Perangkat
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Tulis deskripsi perangkat"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PerangkatAbsensi;