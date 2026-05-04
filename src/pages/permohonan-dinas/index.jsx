import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  SectionHeader,
  DataView,
  Modal,
  Button,
  Badge,
} from "../../components";

import {
  faCheck,
  faInfoCircle,
  faTimes,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

import toast from "react-hot-toast";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";

const SuratDinas = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // ================= FETCH =================
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas`);

      if (res.status === 404) {
        setData([]);
        return;
      }

      if (!res.ok) {
        throw new Error("Gagal memuat data surat dinas");
      }

      const result = await res.json();
      setData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= ACTION =================
  const handleApprove = async (item) => {
    setApprovingId(item.id);

    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 1 }),
      });

      if (!res.ok) throw new Error("Gagal menyetujui");

      toast.success(`Surat dinas ${item.nama} disetujui`);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (item) => {
    setApprovingId(item.id);

    try {
      const res = await fetchWithJwt(`${apiUrl}/surat-dinas/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 2 }),
      });

      if (!res.ok) throw new Error("Gagal menolak");

      toast.success(`Surat dinas ${item.nama} ditolak`);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleDetail = (item) =>
    navigate(`/permohonan-dinas/${item.id}`);

  // ================= HELPER =================
  const getKategori = (val) => {
    if (val == 1) return { label: "Area A - Jabodetabek", variant: "info" };
    if (val == 2) return { label: "Area B - Jawa & Bali(Non-Jabodetabek)", variant: "purple" };
    return { label: "Area C - Luar Jawa & Bali", variant: "warning" };
  };

  // ================= COLUMNS =================
  const columns = [
    {
      label: "Waktu Berangkat",
      render: (row) => {
        const tglBerangkat = formatFullDate(row.tgl_berangkat);
        const tglPulang = row.tgl_pulang ? formatFullDate(row.tgl_pulang) : null;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-xs">
              {tglPulang ? `${tglBerangkat} – ${tglPulang}` : tglBerangkat}
            </span>
            <span className="text-xs text-gray-500">
              Jam: {row.waktu?.substring(0, 5) || "-"}
            </span>
          </div>
        );
      },
    },
    {
      label: "Karyawan",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold uppercase text-xs">
            {row.nama}
          </span>
          <span className="text-xs text-gray-500">
            {row.divisi}
          </span>
        </div>
      ),
    },
    {
      label: "Kategori",
      align: "text-center",
      render: (row) => {
        const kategori = getKategori(row.kategori);
        return (
          <Badge variant={kategori.variant} size="sm">
            {kategori.label}
          </Badge>
        );
      },
    },
    {
      label: "Status",
      align: "text-center",
      render: () => (
        <Badge variant="warning" size="sm">
          Pending
        </Badge>
      ),
    },
    {
      label: "menu",
      align: "text-center",
      isAction: true,
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="detail"
            icon={faInfoCircle}
            onClick={() => handleDetail(row)}
          >
            Detail
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={faCheck}
            loading={approvingId === row.id}
            onClick={() => handleApprove(row)}
          >
            Setujui
          </Button>

          <Button
            size="sm"
            variant="danger"
            icon={faTimes}
            loading={approvingId === row.id}
            onClick={() => handleReject(row)}
          >
            Tolak
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto">
      <SectionHeader
        title="Pengajuan Surat Dinas"
        subtitle="Menampilkan pengajuan surat dinas"
        onBack={() => navigate(-1)}
        actions={
          <Button
            variant="info"
            icon={faCircleInfo}
            onClick={() => setShowInfoModal(true)}
          >
          </Button>
        }
      />

      <DataView
        data={data}
        columns={columns}
        searchable
        searchKeys={["nama", "divisi"]}
        isLoading={loading}
        error={error}
        onRetry={fetchData}
        emptyTitle="Belum ada pengajuan"
        emptyMessage="Tidak ada data surat dinas"
      />

      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Informasi Surat Dinas"
      >
        <p className="text-sm text-gray-700">
          Halaman ini digunakan untuk menyetujui atau menolak
          pengajuan perjalanan dinas karyawan.
        </p>
      </Modal>
    </div>
  );
};

export default SuratDinas;