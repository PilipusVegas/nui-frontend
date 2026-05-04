import React, { useEffect, useState, useCallback } from "react";
import { faPlus, faEdit, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";

import {
  SectionHeader,
  DataView,
  Button,
  Badge,
} from "../../components";

const HrdAccess = () => {
  const [hrdList, setHrdList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const toggleDetail = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const fetchHrdAccess = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithJwt(`${apiUrl}/profil/hrd-access`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setHrdList(data.data);
      } else {
        setHrdList([]);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data HRD");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchHrdAccess();
  }, [fetchHrdAccess]);

  // COLUMN CONFIG
  const columns = [
    {
      label: "Nama HRD",
      key: "nama",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-slate-800">{row.nama}</p>
            <p className="text-xs text-slate-500">{row.id_user}</p>
          </div>
        </div>
      ),
    },
    {
      label: "Perusahaan Dikelola",
      align: "text-center",
      render: (row) => (
        <Badge variant="info" tone="soft">
        {row.perusahaan?.length || 0} Perusahaan
        </Badge>
      ),
    },
    {
      label: "Menu",
      align: "text-center",
      isAction: true,
      render: (row) => (
        <div className="flex justify-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="warning"
            icon={faEdit}
            onClick={() => navigate(`/akses-hrd/edit/${row.id_user}`)}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant={expandedId === row.id_user ? "danger" : "detail"}
            icon={expandedId === row.id_user ? faEyeSlash : faEye}
            onClick={() => toggleDetail(row.id_user)}
          >
            {expandedId === row.id_user ? "Tutup" : "Detail"}
          </Button>
        </div>
      ),
    },
  ];

  // EXPANDED ROW
  const renderExpandedRow = (row) => {
    if (expandedId !== row.id_user) return null;

    if (!row.perusahaan || row.perusahaan.length === 0) {
      return (
        <div className="text-center text-slate-500 italic py-4">
          Tidak ada perusahaan
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {row.perusahaan.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-emerald-100 bg-white shadow-sm"
          >
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-md">
              <i className="fas fa-building" />
            </div>
            <div className="text-sm font-medium text-slate-700">
              {p.nama}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full animate-fadeIn">
      <SectionHeader
        title="Akses HRD"
        subtitle="Pengelolaan akses HRD dan perusahaan yang ditangani."
        onBack={() => navigate(-1)}
        actions={
          <Button
            icon={faPlus}
            onClick={() => navigate("/akses-hrd/tambah")}
          >
            Tambah
          </Button>
        }
      />

      <DataView
        data={hrdList}
        columns={columns}
        renderExpandedRow={renderExpandedRow}
        rowKey={(row) => row.id_user}

        // SEARCH
        searchable
        searchKeys={["nama", "perusahaan.0.nama"]} // basic fallback

        // STATE
        isLoading={loading}
        error={error}
        onRetry={fetchHrdAccess}

        loadingMessage="Memuat data HRD..."
        errorMessage="Terjadi kesalahan saat memuat data HRD"

        emptyTitle="Belum ada data"
        emptyMessage="Data HRD belum tersedia"

        // PAGINATION
        itemsPerPage={10}

        // INDEX
        showIndex={true}
      />
    </div>
  );
};

export default HrdAccess;