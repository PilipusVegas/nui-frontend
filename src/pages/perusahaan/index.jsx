import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, DataView, Button } from "../../components";

const KelolaPerusahaan = () => {
  const [perusahaan, setPerusahaan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  // =========================
  // FETCH DATA
  // =========================
  const fetchPerusahaan = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetchWithJwt(`${apiUrl}/perusahaan`);
      const data = await res.json();

      setPerusahaan(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Gagal memuat data perusahaan:", err);
      setError(err?.message || "Terjadi kesalahan");
      setPerusahaan([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchPerusahaan();
  }, [fetchPerusahaan]);

  // =========================
  // CONFIG TABLE (INI KUNCI)
  // =========================
  const columns = [
    {
      label: "Nama Perusahaan",
      key: "nama",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold uppercase">{row.nama}</span>
          <span className="text-slate-500 text-xs">{row.alamat}</span>
        </div>
      ),
    },
    {
      label: "Menu",
      align: "text-center",
      isAction: true,
      render: (row) => (
        <Button
          variant="warning"
          size="sm"
          icon={faEdit}
          onClick={() => navigate(`/perusahaan/edit/${row.id}`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto">
      {/* HEADER */}
      <SectionHeader
        title="Data Perusahaan"
        subtitle={`Menampilkan ${perusahaan.length} perusahaan yang terdaftar dalam sistem.`}
        onBack={() => navigate("/home")}
        actions={
          <Button
            icon={faPlus}
            onClick={() => navigate("/perusahaan/tambah")}
          >
            Tambah
          </Button>
        }
      />

      {/* DATA VIEW */}
      <DataView
        data={perusahaan}
        columns={columns}

        // === SEARCH
        searchable
        searchKeys={["nama", "alamat"]}
        searchPlaceholder="Cari perusahaan..."

        // === PAGINATION
        itemsPerPage={10}

        // === STATE
        isLoading={isLoading}
        error={error}
        onRetry={fetchPerusahaan}

        // === EMPTY STATE
        emptyTitle="Belum ada data perusahaan"
        emptyMessage="Silakan tambahkan perusahaan baru untuk mulai mengelola data."
        emptyActionText="Tambah Perusahaan"
        onEmptyAction={() => navigate("/perusahaan/tambah")}

        // === FITUR TAMBAHAN
        showIndex
      />
    </div>
  );
};

export default KelolaPerusahaan;