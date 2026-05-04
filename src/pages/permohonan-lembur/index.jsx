import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { formatFullDate } from "../../utils/dateUtils";
import { fetchWithJwt } from "../../utils/jwtHelper";

import {
  faCheck,
  faEye,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

import { SectionHeader, Modal, DataView, Button } from "../../components";

const PersetujuanLembur = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [approvalData, setApprovalData] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalDescription, setModalDescription] = useState("");

  // ================= FETCH =================
  const fetchApprovalData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await fetchWithJwt(`${apiUrl}/lembur/approve`);

      if (res.status === 404) {
        setApprovalData([]);
        return;
      }

      if (!res.ok) {
        throw new Error("Gagal mengambil data lembur.");
      }

      const result = await res.json();
      setApprovalData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, [apiUrl]);

  // ================= ACTION =================
  const openModalWithDescription = (desc) => {
    setModalDescription(desc);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (item, status) => {
    try {
      let endpoint = "";
      let body = {};

      if (item.id_absen) {
        endpoint = `${apiUrl}/lembur/approve-kantor/${item.id_absen}`;
        body = { status, deskripsi: item.deskripsi || "" };
      } else if (item.id_lembur) {
        endpoint = `${apiUrl}/lembur/approve/${item.id_lembur}`;
        body = { status };
      } else {
        throw new Error("Data lembur tidak valid.");
      }

      const res = await fetchWithJwt(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status.");

      if (status === 1) {
        toast.success("Pengajuan lembur disetujui.");
      } else {
        toast.error("Pengajuan lembur ditolak.");
      }

      fetchApprovalData();
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    }
  };

  // ================= COLUMN CONFIG =================
  const columns = [
    {
      label: "Tanggal Pengajuan",
      render: (row) => formatFullDate(row.tanggal),
      align: "text-center",
    },
    {
      label: "Nama Karyawan",
      render: (row) => (
        <div>
          <div className="font-semibold uppercase">{row.nama_user}</div>
          <div className="text-xs text-gray-500">{row.role}</div>
        </div>
      ),
    },
    {
      label: "Lokasi Lembur",
      render: (row) => row.lokasi || "-",
      align: "text-center",
    },
    {
      label: "Waktu",
      align: "text-center",
      render: (row) => (
        <div className="text-center">
          <div className="font-medium">
            {row.jam_mulai} – {row.jam_selesai}
          </div>
          <div className="text-xs text-gray-500">{row.total_lembur} jam</div>
        </div>
      ),
    },
    {
      label: "Menu",
      isAction: true,
      align: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="detail"
            icon={faEye}
            onClick={() => openModalWithDescription(row.deskripsi)}
          >
            Detail
          </Button>

          <Button size="sm" variant="primary" icon={faCheck} onClick={() => handleUpdateStatus(row, 1)}>
            Setujui
          </Button>

          <Button
            size="sm"
            variant="danger"
            icon={faTimes}
            onClick={() => handleUpdateStatus(row, 2)}
          >
            Tolak
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* HEADER */}
      <SectionHeader
        title="Pengajuan Lembur"
        subtitle="Daftar pengajuan lembur berdasarkan periode"
        onBack={() => navigate("/home")}
        actions={
          <Button
            size="sm"
            variant="info"
            icon={faInfoCircle}
            onClick={() => setIsInfoModalOpen(true)}
          >
            Informasi
          </Button>
        }
      />

      {/* DATA VIEW */}
      <DataView
        data={approvalData}
        columns={columns}
        searchable
        searchKeys={["nama_user"]}
        searchPlaceholder="Cari Nama Karyawan..."
        isLoading={isLoading}
        error={errorMessage}
        onRetry={fetchApprovalData}
        emptyTitle="Belum Ada Pengajuan Lembur"
        emptyMessage="Tidak ada data lembur saat ini."
      />

      {/* MODAL DETAIL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rincian Tugas"
        note="Detail Kegiatan Lembur"
      >
        <p className="text-gray-600 whitespace-pre-line">
          {modalDescription || "Deskripsi tidak tersedia."}
        </p>
      </Modal>

      {/* MODAL INFO */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Informasi Persetujuan Lembur"
        note="Panduan Penggunaan"
      >
        <div className="text-sm space-y-3">
          <p>
            Halaman ini digunakan untuk meninjau dan memproses pengajuan lembur.
          </p>

          <ul className="list-disc list-inside space-y-1">
            <li>Pencarian berdasarkan nama karyawan</li>
            <li>Lihat detail lembur</li>
            <li>Approve / Reject pengajuan</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default PersetujuanLembur;
