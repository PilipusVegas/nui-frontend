import React, { useEffect, useState, useMemo } from "react";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { Modal, SectionHeader, DataView, Button, Badge } from "../../components";

const ManajemenMenu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menu, setMenu] = useState([]);
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [editId, setEditId] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  // ================= FETCH =================
  const fetchMenu = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/menu`);
      const data = await res.json();
      setMenu(data.success ? data.data : []);
    } catch (err) {
      console.error("Gagal memuat data menu:", err);
      setMenu([]);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!kode.trim() || !nama.trim() || !deskripsi.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Kode, nama menu, dan deskripsi wajib diisi.",
        confirmButtonColor: "#16a34a",
      });
    }

    const url = editId
      ? `${apiUrl}/menu/${editId}`
      : `${apiUrl}/menu`;

    const method = editId ? "PUT" : "POST";

    try {
      await fetchWithJwt(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kode, nama, deskripsi }),
      });

      await Swal.fire({
        icon: "success",
        title: editId ? "Berhasil diperbarui" : "Berhasil ditambahkan",
        text: `Menu berhasil ${
          editId ? "diperbarui" : "ditambahkan"
        }.`,
        confirmButtonColor: "#16a34a",
      });

      resetForm();
      fetchMenu();
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: "Terjadi kesalahan saat menyimpan data.",
      });
    }
  };

  // ================= UTIL =================
  const resetForm = () => {
    setKode("");
    setNama("");
    setDeskripsi("");
    setEditId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (item) => {
    setKode(item.kode);
    setNama(item.nama);
    setDeskripsi(item.deskripsi || "");
    setEditId(item.id);
    setIsModalOpen(true);
  };

  // ================= COLUMNS =================
  const columns = useMemo(() => [
    {
      label: "Kode",
      key: "kode",
      width: "120px",
      render: (row) => (
        <Badge variant="success" tone="soft">
          {row.kode}
        </Badge>
      ),
    },
    {
      label: "Nama Menu",
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">
            {row.nama}
          </div>
          <div className="text-xs text-slate-500">
            {row.deskripsi || "Tidak ada deskripsi"}
          </div>
        </div>
      ),
    },
    {
      label: "Menu",
      align: "text-center",
      width: "160px",
      isAction: true,
      render: (row) => (
        <Button
          size="sm"
          variant="warning"
          icon={faEdit}
          onClick={() => handleEdit(row)}
        >
          Edit
        </Button>
      ),
    },
  ], []);

  // ================= RENDER =================
  return (
    <div className="w-full mx-auto space-y-4">

      <SectionHeader
        title="Kode Fitur Menu"
        subtitle="Kelola daftar kode fitur menu yang digunakan dalam sistem."
        onBack={() => navigate(-1)}
        actions={
            <Button
            icon={faPlus}
            onClick={() => setIsModalOpen(true)}
          >
            Tambah
          </Button>
        }
      />

      <DataView
        data={menu}
        columns={columns}
        searchable
        searchKeys={["kode", "nama", "deskripsi"]}
        searchPlaceholder="Cari menu..."
        itemsPerPage={10}
        emptyTitle="Belum ada menu"
        emptyMessage="Tambahkan menu baru untuk mulai menggunakan fitur ini."
      />

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editId ? "Edit Menu" : "Tambah Menu"}
        note="Lengkapi informasi menu untuk mengatur akses fitur dalam sistem."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* KODE */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Kode
            </label>
            <input
              type="text"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              disabled={!!editId}
              className="w-full border rounded-lg px-4 py-2 bg-gray-100 focus:ring-2 focus:ring-green-500"
              placeholder="Contoh: MENU_DASHBOARD"
            />
          </div>

          {/* NAMA */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Nama Menu
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan nama menu"
            />
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Jelaskan fungsi menu ini"
            />
          </div>

          {/* ACTION */}
          <div className="flex justify-end">
            <Button type="submit">
              Simpan
            </Button>
          </div>

        </form>
      </Modal>
    </div>
  );
};

export default ManajemenMenu;