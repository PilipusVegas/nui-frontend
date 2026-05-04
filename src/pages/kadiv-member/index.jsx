import React, { useEffect, useState } from "react";
import { faEye, faPlus, faUserGear } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";

import {
  SectionHeader,
  Modal,
  DataView,
  Button,
} from "../../components";

import DetailKadiv from "./show";
import FormAccessKadiv from "./formAccessKadiv";

const KadivMember = () => {
  const [kadivList, setKadivList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedKadiv, setSelectedKadiv] = useState(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editKadiv, setEditKadiv] = useState(null);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const toggleDetail = async (id) => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/profil/kadiv-access/${id}`);
      const data = await res.json();

      if (data.success) {
        setSelectedKadiv(data.data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error("Gagal mengambil detail kadiv:", err);
    }
  };

  const fetchKadivAccess = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await fetchWithJwt(`${apiUrl}/profil/kadiv-access`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setKadivList(data.data);
      } else {
        setKadivList([]);
      }
    } catch (err) {
      console.error("Gagal memuat data Kadiv:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKadivAccess();
  }, []);

  // 🔥 DEFINE COLUMNS
  const columns = [
    {
      label: "NIP",
      key: "nip",
      align: "text-center",
      width: "120px",
    },
    {
      label: "Kepala Divisi",
      key: "nama",
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.nama}
        </span>
      ),
    },
    {
      label: "Perusahaan",
      key: "perusahaan",
      align: "text-center",
    },
    {
      label: "Menu",
      isAction: true,
      align: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant="warning"
            icon={faUserGear}
            onClick={() => {
              setEditKadiv(row);
              setFormModalOpen(true);
            }}
          >
            Ganti
          </Button>

          <Button
            size="sm"
            variant="detail"
            icon={faEye}
            onClick={() => toggleDetail(row.id)}
          >
            Detail
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto animate-fadeIn space-y-4">
      {/* HEADER */}
      <SectionHeader
        title="Data Kepala Divisi"
        subtitle="Mengelola penugasan Kepala Divisi beserta akses dan struktur anggota yang berada di bawahnya."
        onBack={() => navigate(-1)}
        actions={
          <Button
            variant="primary"
            icon={faPlus}
            onClick={() => {
              setEditKadiv(null);
              setFormModalOpen(true);
            }}
          >
            Tambah
          </Button>
        }
      />

      {/* DATA VIEW */}
      <DataView
        data={kadivList}
        columns={columns}

        // 🔍 SEARCH
        searchable
        searchKeys={["nama", "nip"]}
        searchPlaceholder="Cari nama atau NIP Kepala Divisi..."

        // 📊 PAGINATION
        itemsPerPage={10}

        // 🔄 STATE
        isLoading={loading}
        error={error}
        onRetry={fetchKadivAccess}

        // 📭 EMPTY STATE
        emptyTitle="Belum Ada Data"
        emptyMessage="Data Kepala Divisi belum tersedia dalam sistem."
      />

      {/* MODAL DETAIL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detail Kepala Divisi"
        note="Menampilkan informasi lengkap Kepala Divisi serta struktur anggota yang berada di bawah tanggung jawabnya."
        size="xl"
      >
        <DetailKadiv data={selectedKadiv} />
      </Modal>

      {/* FORM */}
      <FormAccessKadiv
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={fetchKadivAccess}
        editData={editKadiv}
      />
    </div>
  );
};

export default KadivMember;