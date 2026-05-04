import React, { useEffect, useState } from "react";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { fetchWithJwt } from "../../utils/jwtHelper";

import {
  Modal,
  SectionHeader,
  DataView,
  Button,
} from "../../components";

const PerangkatAbsensi = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [data, setData] = useState([]);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [editId, setEditId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH ================= */
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithJwt(`${apiUrl}/mesin`);
      const result = await res.json();

      setData(result?.success ? result.data || [] : []);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data perangkat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim() || !deskripsi.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Nama dan deskripsi wajib diisi",
        confirmButtonColor: "#16a34a",
      });
    }

    const url = editId
      ? `${apiUrl}/mesin/${editId}`
      : `${apiUrl}/mesin`;

    const method = editId ? "PUT" : "POST";

    try {
      await fetchWithJwt(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, deskripsi }),
      });

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Perangkat berhasil ${
          editId ? "diperbarui" : "ditambahkan"
        }`,
        confirmButtonColor: "#16a34a",
      });

      handleCloseModal();
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyimpan data",
      });
    }
  };

  const handleEdit = (item) => {
    setNama(item.nama);
    setDeskripsi(item.deskripsi || "");
    setEditId(item.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNama("");
    setDeskripsi("");
    setEditId(null);
  };

  /* ================= COLUMNS ================= */
  const columns = [
    {
      label: "Nama Perangkat",
      key: "nama",
    },
    {
      label: "Deskripsi",
      render: (row) =>
        row.deskripsi || (
          <span className="text-slate-400 italic">
            Tidak ada deskripsi
          </span>
        ),
    },
    {
      label: "Menu",
      align: "text-center",
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
  ];

  /* ================= MOBILE ================= */
  const renderMobile = (item, index, meta) => (
    <div key={item.id}>
      {/* biarkan DataView auto handle CardView */}
    </div>
  );

  return (
    <div className="w-full mx-auto">
      {/* HEADER */}
      <SectionHeader
        title="Perangkat Absensi"
        subtitle="Manajemen perangkat absensi berbasis sistem Face Recognition."
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

      {/* DATA VIEW */}
      <DataView
        data={data}
        columns={columns}
        searchable
        searchKeys={["nama", "deskripsi"]}
        itemsPerPage={5}
        isLoading={loading}
        error={error}
        onRetry={fetchData}
        emptyTitle="Belum Ada Perangkat"
        emptyMessage="Silakan tambahkan perangkat terlebih dahulu."
        emptyActionText="Tambah Perangkat"
        onEmptyAction={() => setIsModalOpen(true)}
      />

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editId ? "Edit Perangkat" : "Tambah Perangkat"}
        note="Lengkapi data perangkat dengan benar sebelum menyimpan."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">
              Nama Perangkat
            </label>
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full mt-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan nama perangkat"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full mt-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan deskripsi"
            />
          </div>

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

export default PerangkatAbsensi;