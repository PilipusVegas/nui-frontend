import React, { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import SectionHeader from "../../components/desktop/SectionHeader";
import { exportRiwayatAbsensiExcel } from "./exportRiwayatAbsensiExcel";
import { Badge, Button, DataView } from "../../components";
import { formatFullDate, formatTime } from "../../utils/dateUtils";

import {
  faCheckCircle,
  faXmarkCircle,
  faGasPump,
  faHotel,
  faBriefcase,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";

const RiwayatPersetujuanDetail = () => {
  const { id_user } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [data, setData] = useState({ absen: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // ================= FETCH =================
  const fetchDetail = async () => {
    if (!startDate || !endDate || !id_user) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithJwt(
        `${apiUrl}/absen/riwayat/${id_user}?startDate=${startDate}&endDate=${endDate}`,
      );

      if (res.status === 404) {
        setData({ absen: [] });
        return;
      }

      if (!res.ok) throw new Error("Gagal memuat data");

      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError(err.message);
      setData({ absen: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (endDate && startDate && endDate < startDate) {
      toast.error("Rentang tanggal tidak valid");
      return;
    }
    fetchDetail();
  }, [startDate, endDate, id_user]);

  // ================= EXPORT =================
  const handleExportExcel = async () => {
    if (!startDate || !endDate || exporting) return;

    try {
      setExporting(true);

      await exportRiwayatAbsensiExcel({
        data: data.absen,
        nama: data.nama,
        perusahaan: data.perusahaan,
        startDate,
        endDate,
      });
    } finally {
      setExporting(false);
    }
  };

  // ================= COLUMN CONFIG =================
  const columns = useMemo(
    () => [
      {
        label: "Tanggal",
        render: (row) => formatFullDate(row.jam_mulai),
      },
      {
        label: "Shift",
        key: "shift",
      },
      {
        label: "Lokasi Mulai",
        key: "lokasi_mulai",
      },
      {
        label: "Lokasi Selesai",
        key: "lokasi_selesai",
      },
      {
        label: "Jam Masuk",
        align: "text-center",
        render: (row) => (row.jam_mulai ? formatTime(row.jam_mulai) : "-"),
      },
      {
        label: "Terlambat",
        align: "text-center",
        render: (row) =>
          row.keterlambatan ? (
            <span className="text-red-600 font-semibold">
              {row.keterlambatan}
            </span>
          ) : (
            "-"
          ),
      },
      {
        label: "Jam Pulang",
        align: "text-center",
        render: (row) => (row.jam_selesai ? formatTime(row.jam_selesai) : "-"),
      },
      {
        label: "Tunjangan",
        align: "text-center",
        render: (row) => {
          const t = row.tunjangan || {};

          if (!t.transport && !t.night_shift && !t.dinas) {
            return <span className="text-gray-400 italic">N/A</span>;
          }

          return (
            <div className="flex justify-center gap-2">
              {t.transport && (
                <FontAwesomeIcon icon={faGasPump} className="text-orange-500" />
              )}
              {t.night_shift && (
                <FontAwesomeIcon icon={faHotel} className="text-indigo-500" />
              )}
              {t.dinas && (
                <FontAwesomeIcon icon={faBriefcase} className="text-blue-500" />
              )}
            </div>
          );
        },
      },
      {
        label: "Status",
        align: "text-center",
        render: (row) => (
          <Badge
            variant={row.status === 1 ? "success" : "danger"}
            tone="soft"
            icon={
              <FontAwesomeIcon
                icon={row.status === 1 ? faCheckCircle : faXmarkCircle}
              />
            }
          >
            {row.status === 1 ? "Approved" : "Rejected"}
          </Badge>
        ),
      },
    ],
    [],
  );

  const isEmpty = !data?.absen?.length;

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER */}
      <SectionHeader
        title="Detail Riwayat Absensi Lapangan"
        subtitle="Menampilkan detail persetujuan absensi karyawan berdasarkan periode yang dipilih."
        onBack={() => navigate("/riwayat-absensi-lapangan")}
        actions={
          <Button
            icon={faFileExcel}
            onClick={handleExportExcel}
            loading={exporting}
            disabled={loading || isEmpty}
            variant="primary"
          >
            Export Excel
          </Button>
        }
      />

      {/* FILTER */}
      <div className="flex flex-wrap gap-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setSearchParams({
              startDate: e.target.value,
              endDate,
            })
          }
          className="border px-3 py-2 rounded-md text-sm"
        />

        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) =>
            setSearchParams({
              startDate,
              endDate: e.target.value,
            })
          }
          className="border px-3 py-2 rounded-md text-sm"
        />
      </div>

      {/* INFO */}
      {!loading && !error && data?.nama && (
        <div className="bg-white border rounded px-4 py-3">
          <h2 className="font-semibold">{data.nama}</h2>
          <p className="text-sm text-gray-600">
            {data.role} • {data.perusahaan}
          </p>
        </div>
      )}

      {/* DATAVIEW */}
      <DataView
        data={data.absen}
        columns={columns}
        searchable
        searchKeys={["shift", "lokasi_mulai", "lokasi_selesai"]}
        searchPlaceholder="Cari shift atau lokasi..."
        isLoading={loading}
        error={error}
        onRetry={fetchDetail}
        emptyTitle="Tidak ada data absensi"
        emptyMessage="Data absensi tidak tersedia pada periode ini"
        showIndex={true}
      />
    </div>
  );
};

export default RiwayatPersetujuanDetail;
