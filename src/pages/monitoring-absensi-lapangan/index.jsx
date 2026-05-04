import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faClockRotateLeft, faEye } from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt } from "../../utils/jwtHelper";
import { DataView, SectionHeader, Button } from "../../components";


const DataAbsensi = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [absenData, setAbsenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH DATA
  const fetchAbsenData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithJwt(`${apiUrl}/absen`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result?.data;

      setAbsenData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setAbsenData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsenData();
  }, []);

  // TABLE COLUMNS
  const columns = useMemo(
    () => [
      {
        key: "nama",
        label: "Nama Karyawan",
        render: (row) => (
          <div>
            <div className="font-semibold text-sm text-slate-800">
              {row.nama || "Unknown User"}
            </div>
            <div className="text-xs text-slate-500">
              {row.role || "Unknown Role"}
            </div>
          </div>
        ),
      },
      {
        key: "total_absen",
        label: "Total Absen",
        align: "text-center",
        render: (row) => (
          <span className="font-medium text-slate-700">
            {row.total_absen} Hari
          </span>
        ),
      },
      {
        key: "action",
        label: "Menu",
        align: "text-center",
        isAction: true,
        hideOnMobile: true,
        render: (row) => (
          <Button
            size="sm"
            variant="detail"
            icon={faEye}
            onClick={() =>
              navigate(`/monitoring-absensi/${row.id_user}`)
            }
          >
            Detail
          </Button>
        ),
      },
    ],
    [navigate]
  );

  // RENDER MOBILE CARD (CUSTOM UX LEBIH BAIK)
  const renderMobile = (row) => {
    return (
      <div
        onClick={() =>
          navigate(`/monitoring-absensi/${row.id_user}`)
        }
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:scale-[0.99] transition"
      >
        <div className="mb-3">
          <div className="font-semibold text-slate-900">
            {row.nama}
          </div>
          <div className="text-xs text-slate-500">{row.role}</div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total Absen</span>
          <span className="font-medium text-slate-800">
            {row.total_absen} Hari
          </span>
        </div>

        <div className="mt-3 text-right text-xs text-blue-600 font-medium">
          Tap untuk detail →
        </div>
      </div>
    );
  };

  // RENDER
  return (
    <div className="flex flex-col gap-3">
      {/* HEADER */}
      <SectionHeader
        title="Monitoring Absensi Lapangan"
        subtitle="Monitoring kehadiran karyawan lapangan secara real-time setiap hari."
        onBack={() => navigate("/home")}
        actions={
          <Button
            variant="secondary"
            icon={faClockRotateLeft}
            onClick={() =>
              navigate("/riwayat-absensi-lapangan")
            }
          >
            Riwayat
          </Button>
        }
      />

      {/* DATA VIEW (ALL IN ONE SYSTEM) */}
      <DataView
        data={absenData}
        columns={columns}
        rowKey={(row) => row.id_user}
        searchable
        searchKeys={["nama", "role"]}
        searchPlaceholder="Cari nama atau divisi..."
        itemsPerPage={10}
        isLoading={loading}
        error={error}
        onRetry={fetchAbsenData}
        renderMobile={renderMobile}
      />
    </div>
  );
};

export default DataAbsensi;