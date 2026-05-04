import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import { faCheckCircle, faClock, faEye, faTasks, faUser } from "@fortawesome/free-solid-svg-icons";

import { SectionHeader, DataView, Button, Badge } from "../../components";
import { icon } from "leaflet";

const RiwayatPenugasan = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiwayat = async () => {
      setLoading(true);
      try {
        const res = await fetchWithJwt(`${apiUrl}/tugas/riwayat`);
        const json = await res.json();
        setTugas(json.data || []);
      } catch {
        setError("Gagal memuat data riwayat tugas.");
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, [apiUrl]);

  // 📊 SUMMARY (OPSIONAL)
  const summaryItems = useMemo(() => {
    const total = tugas.length;
    const terlambat = tugas.filter((t) => {
      const diff =
        (new Date(t.updated_at) - new Date(t.deadline_at)) /
        (1000 * 60 * 60 * 24);
      return diff > 0;
    }).length;

    return [
      {
        key: "total",
        title: "Total Tugas",
        value: total,
        variant: "info",
        icon: faTasks,
      },
      {
        key: "late",
        title: "Terlambat",
        value: terlambat,
        variant: "danger",
        icon: faClock,
      },
      {
        key: "ontime",
        title: "Tepat Waktu",
        value: total - terlambat,
        variant: "success",
        icon: faCheckCircle,
      },
    ];
  }, [tugas]);

  // 📋 COLUMNS TABLE
  const columns = [
    {
      label: "Kategori",
      align: "text-center",
      render: (row) => (
        <Badge variant={row.category === "urgent" ? "danger" : "success"} size="sm" uppercase>
          {row.category}
        </Badge>
      ),
    },
    {
      label: "Nama Penugasan",
      truncate: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.nama}</div>
          <div className="text-[11px] text-slate-500">
            Dibuat pada {formatFullDate(row.created_at)}
          </div>
        </div>
      ),
    },
    {
      label: "Deadline",
      align: "text-center",
      render: (row) => formatFullDate(row.deadline_at),
    },
    {
      label: "Selesai",
      align: "text-center",
      render: (row) => formatFullDate(row.updated_at),
    },
    {
      label: "Status",
      align: "text-center",
      render: (row) => {
        const diff = Math.ceil(
          (new Date(row.updated_at) - new Date(row.deadline_at)) /
            (1000 * 60 * 60 * 24),
        );
        const isLate = diff > 0;

        return (
          <Badge variant={isLate ? "danger" : "success"} size="sm">
            {isLate ? `Terlambat ${diff} hari` : "Tepat waktu"}
          </Badge>
        );
      },
    },
    {
      label: "Jumlah",
      align: "text-center",
      render: (row) => (
        <span className="font-medium">
          {row.details?.length || 0}{" "}
          <span className="text-xs text-slate-500">tugas</span>
        </span>
      ),
    },
    {
      label: "Menu",
      align: "text-center",
      isAction: true,
      render: (row) => (
        <Button size="sm" variant="detail" icon={faEye} onClick={() => navigate(`/penugasan/show/${row.id}`)}>
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto">
      <SectionHeader title="Riwayat Reminder" subtitle={`Menampilkan ${tugas.length} tugas yang telah diselesaikan`} onBack={() => navigate("/penugasan")}/>

      <DataView
        data={tugas}
        columns={columns}
        searchable
        searchKeys={["nama"]}
        searchPlaceholder="Cari nama tugas..."
        itemsPerPage={10}
        isLoading={loading}
        error={error}
        loadingMessage="Memuat data penugasan..."
        errorMessage="Gagal memuat data"
        emptyTitle="Belum Ada Riwayat"
        emptyMessage="Belum ada data penugasan yang selesai"
        summaryItems={summaryItems}
      />
    </div>
  );
};

export default RiwayatPenugasan;
