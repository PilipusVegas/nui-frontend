import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  faTrash,
  faEye,
  faUsers,
  faCalendarCheck,
  faCalendarXmark,
} from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, DataView, Button, Badge } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const PenjadwalanKaryawan = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPenjadwalan = async () => {
    try {
      setLoading(true);
      const res = await fetchWithJwt(`${apiUrl}/jadwal`);
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data penjadwalan");
      toast.error("Gagal memuat data penjadwalan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenjadwalan();
  }, []);

  const tableData = useMemo(() => {
    return (data || []).map((row) => ({
      ...row,
      has_jadwal: !!row.jadwal,
      id_jadwal: row.jadwal?.id_jadwal ?? null,
      tgl_mulai: row.jadwal?.tgl_mulai ?? null,
      tgl_selesai: row.jadwal?.tgl_selesai ?? null,
      is_permanent: row.jadwal?.is_permanent ?? null,
      shift: row.jadwal?.shift ?? null,
      lokasi: row.jadwal?.lokasi ?? null,
      created_by: row.jadwal?.created_by ?? null,
    }));
  }, [data]);

  const scheduledUserIds = useMemo(
    () =>
      tableData.filter((item) => item.has_jadwal).map((item) => item.id_user),
    [tableData],
  );

  const handleDelete = async (id_user) => {
    const confirm = await Swal.fire({
      title: "Hapus Penjadwalan?",
      text: "Data yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    const toastId = toast.loading("Menghapus data...");

    try {
      await fetchWithJwt(`${apiUrl}/jadwal/all/${id_user}`, {
        method: "DELETE",
      });

      toast.success("Berhasil dihapus", { id: toastId });
      fetchPenjadwalan();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus data", { id: toastId });
    }
  };

  const renderStatus = (row) => {
    if (!row.has_jadwal) {
      return <Badge variant="danger">Jadwal Kosong</Badge>;
    }
    if (row.is_permanent === 1) {
      return <Badge variant="info">Jadwal Permanent</Badge>;
    }
    return <Badge variant="success">Jadwal Range</Badge>;
  };

  const sortedData = useMemo(() => {
    const getPriority = (item) => {
      if (!item.has_jadwal) return 0; // kosong
      if (item.is_permanent === 0) return 1; // range
      if (item.is_permanent === 1) return 2; // permanent
      return 3;
    };

    return [...tableData].sort((a, b) => {
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // fallback sorting (biar rapi)
      return (a.nama_user || "").localeCompare(b.nama_user || "");
    });
  }, [tableData]);

  const summaryItems = useMemo(() => {
    const total = tableData.length;
    const kosong = tableData.filter((item) => !item.has_jadwal).length;
    const permanent = tableData.filter(
      (item) => item.has_jadwal && item.is_permanent === 1,
    ).length;
    const range = tableData.filter(
      (item) => item.has_jadwal && item.is_permanent === 0,
    ).length;

    return [
      {
        key: "total",
        title: "Total User",
        value: total,
        note: "Seluruh user yang tampil",
        icon: faUsers,
        variant: "info",
      },
      {
        key: "permanent",
        title: "Jadwal Permanent",
        value: permanent,
        note: "User dengan jadwal tetap",
        icon: faCalendarCheck,
        variant: "info",
      },
      {
        key: "range",
        title: "Jadwal Range",
        value: range,
        note: "User dengan jadwal periode",
        icon: faCalendarCheck,
        variant: "success",
      },
      {
        key: "kosong",
        title: "Jadwal Kosong",
        value: kosong,
        note: "Belum punya jadwal aktif",
        icon: faCalendarXmark,
        variant: "danger",
      },
    ];
  }, [tableData]);

  const columns = [
    {
      key: "nip_user",
      label: "NIP",
      align: "text-center",
    },
    {
      key: "nama_user",
      label: "Nama Karyawan",
      cellClassName: "font-semibold",
    },
    {
      key: "role_user",
      label: "Divisi",
      align: "text-center",
    },
    {
      key: "shift",
      label: "Jadwal Shift",
      align: "text-center",
      render: (row) => row.shift || "-",
    },
    {
      key: "lokasi",
      label: "Lokasi",
      align: "text-center",
      render: (row) => row.lokasi || "-",
    },
    {
      label: "Tipe Penjadwalan",
      align: "text-center",
      render: (row) => renderStatus(row),
    },
    {
      label: "Menu",
      align: "text-center",
      isAction: true,
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant="detail"
            icon={faEye}
            onClick={() => navigate(`/penjadwalan/detail/${row.id_user}`)}
          >
            Detail
          </Button>

          {/* {row.has_jadwal && (
            <Button
              size="sm"
              variant="danger"
              icon={faTrash}
              onClick={() => handleDelete(row.id_user)}
            >
              Hapus
            </Button>
          )} */}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white flex flex-col">
      <SectionHeader
        title="Penjadwalan Karyawan"
        subtitle="Atur jadwal kerja dan lokasi karyawan dengan mudah."
        onBack={() => navigate(-1)}
      />

      <DataView
        data={sortedData}
        columns={columns}
        summaryItems={summaryItems}
        searchable
        searchKeys={[
          "nama_user",
          "nip_user",
          "role_user",
          "shift",
          "lokasi",
          "created_by",
        ]}
        searchPlaceholder="Cari nama, NIP, divisi, perusahaan, atau lokasi..."
        itemsPerPage={10}
        isLoading={loading}
        error={error}
        onRetry={fetchPenjadwalan}
        emptyTitle="Belum ada data penjadwalan"
        emptyMessage="Tambahkan penjadwalan untuk mulai mengelola jadwal karyawan."
      />
    </div>
  );
};

export default PenjadwalanKaryawan;
