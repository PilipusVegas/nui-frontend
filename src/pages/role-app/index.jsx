  import React, { useEffect, useState, useMemo } from "react";
  import { useNavigate } from "react-router-dom";
  import toast from "react-hot-toast";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import {
    faEdit,
    faPlus,
    faInfoCircle,
  } from "@fortawesome/free-solid-svg-icons";

  import { fetchWithJwt } from "../../utils/jwtHelper";
  import {
    SectionHeader,
    Modal,
    DataView,
    Button,
  } from "../../components";

  const RoleApp = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [nama, setNama] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [editId, setEditId] = useState(null);

    const [detailRole, setDetailRole] = useState(null);

    // ================= FETCH =================
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithJwt(`${apiUrl}/role-apps`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        setRoles(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data role aplikasi.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchRoles();
    }, []);

    // ================= ACTION =================
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!nama.trim() || !deskripsi.trim()) {
        toast.error("Nama dan deskripsi wajib diisi.");
        return;
      }

      const url = editId
        ? `${apiUrl}/role-apps/${editId}`
        : `${apiUrl}/role-apps`;

      const method = editId ? "PUT" : "POST";

      try {
        const res = await fetchWithJwt(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama, deskripsi }),
        });

        if (!res.ok) throw new Error("Gagal menyimpan data");

        toast.success(
          editId
            ? "Role berhasil diperbarui."
            : "Role berhasil ditambahkan."
        );

        setNama("");
        setDeskripsi("");
        setEditId(null);
        setIsModalOpen(false);
        fetchRoles();
      } catch (err) {
        toast.error(err.message);
      }
    };

    const handleEdit = (item) => {
      setNama(item.nama);
      setDeskripsi(item.deskripsi || "");
      setEditId(item.id);
      setIsModalOpen(true);
    };

    const handleDetail = (item) => {
      setDetailRole(item);
      setIsDetailModalOpen(true);
    };

    // ================= COLUMNS =================
    const columns = useMemo(() => [
      {
        label: "Nama Role",
        key: "nama",
        render: (row) => (
          <span className="font-semibold uppercase text-slate-800">
            {row.nama}
          </span>
        ),
      },
      {
        label: "Deskripsi",
        key: "deskripsi",
        render: (row) => row.deskripsi || "-",
        truncate: true,
      },
      {
        label: "Menu",
        align: "text-center",
        isAction: true,
        render: (row) => (
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant="warning"
              icon={faEdit}
              onClick={() => handleEdit(row)}
            >
              Edit
            </Button>

            <Button
              size="sm"
              variant="info"
              icon={faInfoCircle}
              onClick={() => handleDetail(row)}
            >
              Detail
            </Button>
          </div>
        ),
      },
    ], []);

    return (
      <div className="w-full mx-auto">
        {/* HEADER */}
        <SectionHeader
          title="Role Aplikasi"
          subtitle={`Menampilkan ${roles.length} role yang terdaftar dalam sistem.`}
          onBack={() => navigate("/")}
          actions={
            <Button
              variant="primary"
              icon={faPlus}
              onClick={() => {
                setEditId(null);
                setNama("");
                setDeskripsi("");
                setIsModalOpen(true);
              }}
            >
              Tambah
            </Button>
          }
        />

        {/* DATA VIEW */}
        <DataView
          data={roles}
          columns={columns}
          searchable
          searchKeys={["nama", "deskripsi"]}
          searchPlaceholder="Cari nama atau deskripsi role..."
          itemsPerPage={10}
          isLoading={loading}
          error={error}
          onRetry={fetchRoles}
          emptyTitle="Belum ada data role"
          emptyMessage="Silakan tambahkan role baru untuk mulai mengelola sistem."
        />

        {/* MODAL FORM */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setNama("");
            setDeskripsi("");
            setEditId(null);
          }}
          title={editId ? "Edit Role Aplikasi" : "Tambah Role Aplikasi"}
          note="Pastikan data role diisi dengan jelas dan sesuai kebutuhan sistem."
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Nama Role
              </label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="Masukkan nama role"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Deskripsi
              </label>
              <textarea
                rows={6}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 mt-1"
                placeholder="Tuliskan deskripsi role"
              />
            </div>

            <div className="text-right">
              <Button type="submit" variant="success">
                Simpan
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL DETAIL */}
        {detailRole && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setDetailRole(null);
            }}
            title={`Detail Role: ${detailRole.nama}`}
            size="md"
          >
            <div className="text-sm text-gray-700 space-y-2">
              <div>
                <span className="font-semibold">Deskripsi:</span>
                <p className="mt-1">
                  {detailRole.deskripsi || "Tidak ada deskripsi"}
                </p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  };

  export default RoleApp;