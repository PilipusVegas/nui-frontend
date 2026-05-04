import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, DataView, Button } from "../../components";

import TambahKendaraanKaryawan from "./Tambah";
import EditKendaraanKaryawan from "./Edit";

const KendaraanKaryawan = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  /* ================= FORMAT ================= */
  const formatRupiah = (value) =>
    `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

  /* ================= FETCH ================= */
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithJwt(`${apiUrl}/vehicles/users`);

      if (res.status === 404) {
        setData([]);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Fetch kendaraan karyawan gagal:", err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (item) => {
    const confirm = await Swal.fire({
      title: "Hapus relasi kendaraan?",
      text: `${item.nama_user ?? "-"} • ${item.nama_kendaraan ?? "-"}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchWithJwt(
        `${apiUrl}/vehicles/users/${item.id_user_kendaraan}`,
        { method: "DELETE" },
      );

      let json = {};
      try {
        json = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(json?.message || "Gagal menghapus");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Kendaraan berhasil dihapus",
        timer: 1200,
        showConfirmButton: false,
      });

      fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message,
      });
    }
  };
  /* ================= COLUMNS ================= */
  const columns = useMemo(
    () => [
      {
        label: "Nama Karyawan ",
        render: (row) => (
          <div>
            <div className="font-semibold">{row.nama_user}</div>
            <div className="text-xs text-gray-500">{row.role}</div>
          </div>
        ),
      },
      {
        label: "Informasi Kendaraan",
        align: "text-center",
        cellClassName: "text-center",
        render: (row) => (
          <div>
            <div className="font-semibold">
              {row.nama_kendaraan ?? "-"} ({row.tahun_kendaraan ?? "-"})
            </div>
            <div className="text-xs text-slate-500">
              {row.konsumsi_bb ?? "-"} km/l
            </div>
          </div>
        ),
      },
      {
        label: "BBM",
        key: "nama_bb",
        align: "text-center",
      },
      {
        label: "Harga",
        render: (row) => formatRupiah(row.harga_bb),
        align: "text-right",
      },
      {
        label: "Menu",
        isAction: true,
        align: "text-center",
        render: (row) => (
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant="warning"
              icon={faEdit}
              onClick={() => {
                setSelected(row);
                setIsEditOpen(true);
              }}
            >
              Edit
            </Button>

            <Button
              size="sm"
              variant="danger"
              icon={faTrash}
              onClick={() => handleDelete(row)}
            >
              Hapus
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col bg-white">
      <SectionHeader title="Kendaraan Karyawan"
        subtitle="Mengelola kendaraan yang digunakan oleh karyawan."
        onBack={() => navigate("/home")}
        actions={
          <Button icon={faPlus} onClick={() => setIsAddOpen(true)}>
            Tambah
          </Button>
        }
      />

      <DataView
        data={data}
        columns={columns}
        isLoading={isLoading}
        searchable
        searchKeys={["nama_user", "nip_user", "nama_kendaraan"]}
        emptyTitle="Belum ada data kendaraan"
        emptyMessage="Silakan tambahkan kendaraan untuk karyawan."
      />

      {/* MODAL */}
      <TambahKendaraanKaryawan
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        apiUrl={apiUrl}
        onSuccess={fetchData}
      />

      <EditKendaraanKaryawan
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelected(null);
        }}
        apiUrl={apiUrl}
        idUserKendaraan={selected?.id_user_kendaraan}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default KendaraanKaryawan;