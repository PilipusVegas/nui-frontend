import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, DataView, Button, Badge } from "../../components/";

import TambahBBM from "./Tambah";
import EditBBM from "./Edit";

/* =========================
   CONSTANT MAPPING
========================= */
const KATEGORI_LABEL = {
  1: "Bensin",
  2: "Listrik",
};

const SATUAN_LABEL = {
  1: "Liter",
  2: "kWh",
  liter: "Liter",
  kwh: "kWh",
  KWH: "kWh",
};

/* =========================
   COMPONENT
========================= */
const DataJenisBBM = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const [fuelData, setFuelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBBM, setSelectedBBM] = useState(null);

  /* =========================
     HELPERS
  ========================= */
  const formatRupiah = (value) => {
    const number = Number(value);
    if (isNaN(number)) return "-";
    return `Rp ${number.toLocaleString("id-ID")}`;
  };

  const getKategoriLabel = (value) => KATEGORI_LABEL[value] ?? "-";

  const getSatuanLabel = (value) => SATUAN_LABEL[value] ?? "-";

  /* =========================
     FETCH DATA
  ========================= */
  const fetchFuelData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithJwt(`${apiUrl}/fuels`);
      const result = await response.json();

      setFuelData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data");
      setFuelData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelData();
  }, []);

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Data BBM?",
      text: "Data ini akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetchWithJwt(`${apiUrl}/fuels/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        Swal.fire("Berhasil", "Data BBM berhasil dihapus", "success");
        fetchFuelData();
      } else {
        Swal.fire("Gagal", "Gagal menghapus data BBM", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    }
  };

  /* =========================
     COLUMNS (CORE LOGIC)
  ========================= */
  const columns = useMemo(
    () => [
      {
        label: "Nama BBM",
        key: "nama",
        cellClassName: "font-semibold uppercase",
      },
      {
        label: "Kategori",
        align: "text-center",
        render: (row) => (
          <Badge variant="info" size="sm">
            {getKategoriLabel(row.kategori)}
          </Badge>
        ),
      },
      {
        label: "Harga / Satuan",
        align: "text-right",
        render: (row) => (
          <div className="font-medium">
            {formatRupiah(row.harga ?? row.harga_pl)}
            <span className="text-slate-500">
              {" "}
              / {getSatuanLabel(row.satuan)}
            </span>
          </div>
        ),
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
              onClick={() => {
                setSelectedBBM(row);
                setIsEditOpen(true);
              }}
            >
              Edit
            </Button>

            <Button
              size="sm"
              variant="danger"
              icon={faTrash}
              onClick={() => handleDelete(row.id)}
            >
              Hapus
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="flex flex-col bg-white">
      <SectionHeader
        title="Data Jenis BBM"
        subtitle="Digunakan sebagai referensi perhitungan operasional dan kunjungan."
        onBack={() => navigate("/home")}
        actions={
          <Button icon={faPlus} onClick={() => setIsAddOpen(true)}>
            Tambah
          </Button>
        }
      />

      <DataView
        data={fuelData}
        columns={columns}
        /* SEARCH */
        searchable
        searchKeys={["nama"]}
        searchPlaceholder="Cari jenis BBM..."
        /* PAGINATION */
        itemsPerPage={10}
        /* STATE */
        isLoading={isLoading}
        error={error}
        onRetry={fetchFuelData}
        /* EMPTY */
        emptyTitle="Belum ada data BBM"
        emptyMessage="Silakan tambahkan data BBM terlebih dahulu."
        emptyActionText="Tambah Data"
        onEmptyAction={() => setIsAddOpen(true)}
      />

      {/* MODAL */}
      <TambahBBM
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        apiUrl={apiUrl}
        onSuccess={fetchFuelData}
      />

      <EditBBM
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedBBM(null);
        }}
        apiUrl={apiUrl}
        data={selectedBBM}
        onSuccess={fetchFuelData}
      />
    </div>
  );
};

export default DataJenisBBM;
