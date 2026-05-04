import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate, formatCustomDateTime } from "../../utils/dateUtils";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";

import {
  SectionHeader,
  DataView,
  Modal,
  Button,
  Badge,
  DateRangeField,
} from "../../components";

import {
  faEye,
  faInfo,
} from "@fortawesome/free-solid-svg-icons";

const RiwayatSuratDinas = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [summaryFilter, setSummaryFilter] = useState(null);

  // INIT DATE
  useEffect(() => {
    const { start, end } = getDefaultPeriod();
    setStartDate(start);
    setEndDate(end);
  }, []);

  // FETCH
  const fetchData = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const res = await fetchWithJwt(
        `${apiUrl}/surat-dinas/riwayat?startDate=${startDate}&endDate=${endDate}`
      );

      if (!res.ok) throw new Error("Gagal memuat data");

      const result = await res.json();
      setData(result.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // =========================
  // BUSINESS LOGIC
  // =========================
  const getRiwayatSummary = (riwayat = []) => ({
    areaA: riwayat.filter((r) => r.kategori === "1").length,
    areaB: riwayat.filter((r) => r.kategori === "2").length,
    areaC: riwayat.filter((r) => r.kategori === "3").length,
    approved: riwayat.filter((r) => r.status_dinas === 1).length,
    rejected: riwayat.filter((r) => r.status_dinas === 2).length,
  });

  // =========================
  // COLUMNS (KEY POINT)
  // =========================
  const columns = useMemo(() => [
    {
      label: "Nama Karyawan",
      render: (row) => (
        <div>
          <div className="font-semibold uppercase">{row.nama_user}</div>
          <div className="text-xs text-slate-500">{row.role || "-"}</div>
        </div>
      ),
    },
    {
      label: "Kategori",
      align: "text-center",
      render: (row) => {
        const s = getRiwayatSummary(row.riwayat);

        return (
          <div className="flex justify-center gap-2">
            <Badge variant="info" size="sm">A: {s.areaA}</Badge>
            <Badge variant="purple" size="sm">B: {s.areaB}</Badge>
            <Badge variant="warning" size="sm">C: {s.areaC}</Badge>
          </div>
        );
      },
    },
    {
      label: "Status",
      align: "text-center",
      render: (row) => {
        const s = getRiwayatSummary(row.riwayat);

        return (
          <div className="flex justify-center gap-2">
            <Badge variant="success" size="sm">
              {s.approved} Disetujui
            </Badge>
            <Badge variant="danger" size="sm">
              {s.rejected} Ditolak
            </Badge>
          </div>
        );
      },
    },
    {
      label: "Aksi",
      align: "text-center",
      isAction: true,
      render: (row) => (
        <Button
          variant="detail"
          size="sm"
          icon={faEye}
          onClick={() => {
            setSelectedUser(row);
            setIsModalOpen(true);
          }}
        >
          Detail
        </Button>
      ),
    },
  ], []);

  return (
    <div className="w-full">
      {/* HEADER */}
      <SectionHeader
        title="Riwayat Surat Dinas"
        subtitle="Riwayat pengajuan yang telah diproses"
        onBack={() => navigate(-1)}
        actions={
          <Button
            variant="info"
            icon={faInfo}
            onClick={() => setIsInfoModalOpen(true)}
          >
            Informasi
          </Button>
        }
      />

      {/* DATA VIEW */}
      <DataView
        data={data}
        columns={columns}

        searchable
        searchKeys={["nama_user", "role"]}

        itemsPerPage={10}

        isLoading={loading}
        error={error}
        onRetry={fetchData}

        emptyTitle="Belum ada data"
        emptyMessage="Data akan muncul setelah ada pengajuan"

        header={
          <DateRangeField startDate={startDate} endDate={endDate} onChangeStart={setStartDate} onChangeEnd={setEndDate}/>
        }
      />

      {/* MODAL DETAIL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          setSummaryFilter(null);
        }}
        title={`Riwayat Dinas ${selectedUser?.nama_user || ""}`}
      >
        {selectedUser ? (
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {selectedUser.riwayat.map((r) => {
              const approved = r.status_dinas === 1;
              return (
                <div key={r.id} className="border rounded-lg p-3 hover:bg-slate-50 cursor-pointer" onClick={() => window.open(`/permohonan-dinas/${r.id}`, "_blank")}>
                  <div className="flex justify-between mb-1">
                    <Badge variant="info" size="sm">
                      {r.kategori}
                    </Badge>
                    <Badge variant={approved ? "success" : "danger"} size="sm">
                      {approved ? "Disetujui" : "Ditolak"}
                    </Badge>
                  </div>

                  <div className="font-semibold">
                    {formatFullDate(r.tgl_berangkat)}
                  </div>

                  <div className="text-xs text-slate-500">
                    {formatCustomDateTime(r.approved_at)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </Modal>

      {/* MODAL INFO */}
      <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Informasi Area Dinas">
        <div className="text-sm text-slate-600 space-y-2">
          <p>Area A: Jabodetabek</p>
          <p>Area B: Jawa & Bali</p>
          <p>Area C: Luar Jawa</p>
        </div>
      </Modal>
    </div>
  );
};

export default RiwayatSuratDinas;