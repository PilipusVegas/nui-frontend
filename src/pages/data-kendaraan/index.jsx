import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faGasPump,
} from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt } from "../../utils/jwtHelper";
import {
  SectionHeader,
  DataView,
  Button,
  Badge,
  FilterSelect,
} from "../../components/";

import TambahKendaraan from "./Tambah";
import EditKendaraan from "./Edit";
import ShowKendaraan from "./Show";

/* Mapping */
const KATEGORI_KENDARAAN = {
  1: "Motor",
  2: "Mobil",
};

const DataKendaraan = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const [vehicleData, setVehicleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShowOpen, setIsShowOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [kategoriFilter, setKategoriFilter] = useState("");
  const kategoriOptions = [
    { value: 1, label: "Motor" },
    { value: 2, label: "Mobil" },
  ];

  const filteredVehicleData = useMemo(() => {
    if (!kategoriFilter) return vehicleData;

    return vehicleData.filter(
      (item) => Number(item.kategori) === Number(kategoriFilter),
    );
  }, [vehicleData, kategoriFilter]);

  /* ======================
   * Helpers
   * ====================== */
  const formatRupiah = (value) => {
    const number = Number(value);
    if (isNaN(number)) return "-";
    return `Rp ${number.toLocaleString("id-ID")}`;
  };

  const getKategoriLabel = (value) => KATEGORI_KENDARAAN[value] ?? "-";

  /* ======================
   * Fetch Data
   * ====================== */
  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchWithJwt(`${apiUrl}/vehicles`);
      const result = await response.json();

      setVehicleData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      setError(err);
      setVehicleData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData();
  }, []);

  /* ======================
   * Delete
   * ====================== */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Data Kendaraan?",
      text: "Data akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetchWithJwt(`${apiUrl}/vehicles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        Swal.fire("Berhasil", "Data berhasil dihapus", "success");
        fetchVehicleData();
      } else {
        Swal.fire("Gagal", "Gagal menghapus data", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    }
  };

  /* ======================
   * Columns (CORE)
   * ====================== */
  const columns = useMemo(
    () => [
      {
        label: "Nama Kendaraan",
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
        label: "Tahun",
        align: "text-center",
        key: "tahun",
      },
      {
        label: "Konsumsi",
        align: "text-center",
        render: (row) => `${row.konsumsi_bb} km/l`,
      },
      {
        label: "BBM",
        key: "nama_bb",
      },
      {
        label: "Harga",
        align: "text-right",
        render: (row) => formatRupiah(row.harga_bb),
      },
      {
        label: "Menu",
        isAction: true,
        align: "text-center",
        render: (row) => (
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant="detail"
              icon={faEye}
              onClick={() => {
                setSelectedVehicle(row);
                setIsShowOpen(true);
              }}
            >
              Detail
            </Button>

            <Button
              size="sm"
              variant="warning"
              icon={faEdit}
              onClick={() => {
                setSelectedVehicle(row);
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

  /* Render */
  return (
    <div className="flex flex-col bg-white">
      <SectionHeader
        title="Data Kendaraan"
        subtitle="Digunakan untuk perhitungan konsumsi BBM dan kunjungan."
        onBack={() => navigate("/home")}
        actions={
          <>
            {" "}
            <Button icon={faPlus} onClick={() => setIsAddOpen(true)}>
              Tambah
            </Button>
            <Button
              variant="warning"
              icon={faGasPump}
              onClick={() => navigate("/data-bbm")}
            >
              BBM
            </Button>
          </>
        }
      />

      <DataView
        data={filteredVehicleData}
        columns={columns}
        searchable
        searchKeys={["nama", "nama_bb"]}
        isLoading={loading}
        error={error}
        onRetry={fetchVehicleData}
        itemsPerPage={10}
        header={
          <FilterSelect
            label="Kategori"
            options={kategoriOptions}
            value={kategoriFilter}
            onChange={setKategoriFilter}
            className="w-full sm:w-auto sm:min-w-[180px] sm:max-w-[220px]"
            placeholder="Semua"
          />
        }
      />

      {/* MODALS */}
      <TambahKendaraan
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        apiUrl={apiUrl}
        onSuccess={fetchVehicleData}
      />

      <EditKendaraan
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedVehicle(null);
        }}
        apiUrl={apiUrl}
        data={selectedVehicle}
        onSuccess={fetchVehicleData}
      />

      <ShowKendaraan
        isOpen={isShowOpen}
        onClose={() => {
          setIsShowOpen(false);
          setSelectedVehicle(null);
        }}
        data={selectedVehicle}
      />
    </div>
  );
};

export default DataKendaraan;
