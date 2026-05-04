import React, { useEffect, useMemo, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { useNavigate } from "react-router-dom";

import {
  faRoute,
  faUser,
  faCalendarAlt,
  faIdCard,
  faBriefcase,
  faEdit,
  faEye,
} from "@fortawesome/free-solid-svg-icons";

import { DataView, SectionHeader, Badge, Button } from "../../components";
import { formatDate } from "../../utils/dateUtils";

const DinasAktif = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // FETCH DATA
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas/current`).then(
        (r) => r.json(),
      );
      setData(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err?.message || "Gagal mengambil data");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // SUMMARY
  const summaryItems = useMemo(() => {
    return [
      {
        title: "Dinas Aktif",
        value: data.length,
        icon: faRoute,
        variant: "info",
      },
    ];
  }, [data]);

  const getKategoriBadge = (kategori) => {
    switch (String(kategori)) {
      case "1":
        return { label: "Jabodetabek", variant: "success" };
      case "2":
        return { label: "Jawa & Bali", variant: "warning" };
      case "3":
        return { label: "Luar Jawa & Bali", variant: "danger" };
      default:
        return { label: "Unknown", variant: "secondary" };
    }
  };

  // COLUMNS (FULLY USING COMPONENT)
  const columns = [
    {
      label: "Nama Karyawan",
      key: "nama",
      render: (row) => (
        <div className="flex items-start">
          <span className="text-slate-400 mt-1">
            <i className="fa fa-user" />
          </span>

          <div className="flex flex-col leading-tight">
            <span className="font-medium text-slate-800">
              {row?.nama || "-"}
            </span>

            <div className="flex items-center text-xs text-slate-500">
              <i className="fa fa-briefcase text-slate-400" />
              <span>{row?.role || "-"}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Kategori",
      key: "kategori",
      render: (row) => {
        const meta = getKategoriBadge(row?.kategori);

        return <Badge size="sm" variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      label: "Berangkat",
      key: "tgl_berangkat",
      render: (row) => formatDate(row?.tgl_berangkat),
    },
    {
      label: "Pulang",
      key: "tgl_pulang",
      render: (row) => formatDate(row?.tgl_pulang),
    },
    {
      label: "Menu",
      key: "menu",
      isAction: true,
      align: "center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button size="sm" variant="detail" icon={faEye} onClick={() => navigate(`/permohonan-dinas/${row?.id_dinas}`)}>
            Detail
          </Button>
          <Button size="sm" variant="warning" icon={faEdit} onClick={() => navigate(`/permohonan-dinas/${row?.id_dinas}`)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        onBack={() => navigate(-1)}
        title="Daftar Dinas Aktif"
        subtitle="Menampilkan karyawan yang sedang menjalankan tugas dinas."
      />

      <DataView
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={fetchData}
        searchable
        searchKeys={["nama", "nip", "role", "keterangan", "kategori"]}
        searchPlaceholder="Cari dinas..."
        summaryItems={summaryItems}
        emptyTitle="Tidak ada dinas aktif"
        emptyMessage="Saat ini belum ada karyawan yang sedang menjalankan dinas."
        tableClassName="border-green-200"
      />
    </div>
  );
};

export default DinasAktif;