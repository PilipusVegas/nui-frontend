import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  SectionHeader,
  DataView,
  Button,
  Badge,
} from "../../components";

import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";

import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";

import Swal from "sweetalert2";
import toast from "react-hot-toast";

const Kunjungan = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ================= FETCH =================
  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await fetchWithJwt(`${apiUrl}/trip`);
      const json = await res.json();

      setData(json.data || []);
      setError(null);
    } catch (err) {
      setError("Gagal memuat data kunjungan");
      toast.error("Gagal memuat data kunjungan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, []);

  // ================= DELETE =================
  const handleDeleteTrip = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Kunjungan?",
      text: "Data tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);

      const res = await fetchWithJwt(`${apiUrl}/trip/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchTrip();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menghapus data",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // ================= COLUMNS =================
  const columns = [
    {
      label: "NIP",
      key: "nip",
      align: "text-center",
      width: "120px",
    },
    {
      label: "Nama",
      render: (row) => (
        <div>
          <div className="font-semibold uppercase whitespace-nowrap">
            {row.nama}
          </div>
          <div className="text-xs text-slate-500 whitespace-nowrap">
            {row.role}
          </div>
        </div>
      ),
    },
    {
      label: "Tanggal",
      align: "text-center",
      render: (row) => formatFullDate(row.tanggal),
    },
    {
      label: "Total",
      align: "text-center",
      render: (row) => (
        <Badge variant="info" size="sm">
          {row.total_kunjungan} Kunjungan
        </Badge>
      ),
    },
    {
      label: "Aksi",
      align: "text-center",
      isAction: true,
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant="detail"
            icon={faEye}
            onClick={() =>
              navigate(`/permohonan-kunjungan/detail/${row.id_kunjungan}`)
            }
          >
            Detail
          </Button>

          <Button
            size="sm"
            variant="danger"
            icon={faTrash}
            loading={deletingId === row.id_kunjungan}
            onClick={() => handleDeleteTrip(row.id_kunjungan)}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white flex flex-col">
      <SectionHeader
        title="Permohonan Kunjungan"
        subtitle="Verifikasi perjalanan karyawan"
        onBack={() => navigate(-1)}
      />

      <DataView
        data={data}
        columns={columns}

        // SEARCH
        searchable
        searchKeys={["nama", "nip", "role"]}
        searchPlaceholder="Cari nama, NIP, atau role..."

        // PAGINATION
        itemsPerPage={10}

        // STATE
        isLoading={loading}
        error={error}
        onRetry={fetchTrip}

        // EMPTY
        emptyTitle="Belum ada data"
        emptyMessage="Tidak ada permohonan kunjungan"

        // STYLE
        className="mt-3"
      />
    </div>
  );
};

export default Kunjungan;