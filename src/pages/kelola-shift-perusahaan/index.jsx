import React, { useEffect, useState } from "react";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, DataView, Button } from "../../components";

const KelolaShiftPerusahaan = () => {
  const [perusahaan, setPerusahaan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const fetchPerusahaan = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetchWithJwt(`${apiUrl}/perusahaan`);
      const data = await res.json();

      setPerusahaan(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Gagal memuat data perusahaan:", err);
      setError("Gagal memuat data perusahaan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Columns sudah full pakai reusable pattern
  const columns = [
    {
      label: "Perusahaan",
      render: (row) => (
        <span className="font-semibold uppercase">{row.nama}</span>
      ),
    },
    {
      label: "Menu",
      align: "text-center",
      isAction: true,
      render: (row) => (
        <Button
          variant="detail"
          size="sm"
          icon={faGear}
          onClick={() => navigate(`/shift-perusahaan/edit/${row.id}`)}
        >
          Atur Shift
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto">
      <SectionHeader
        title="Kelola Shift Perusahaan"
        subtitle="Pengaturan dan pengelolaan shift untuk setiap perusahaan yang terdaftar dalam sistem."
        onBack={() => navigate("/home")}
      />

      <DataView
        data={perusahaan}
        columns={columns}
        searchable
        searchKeys={["nama", "alamat"]}
        itemsPerPage={10}
        // ✅ sekarang semua UI state dipindah ke DataView
        isLoading={isLoading}
        error={error}
        onRetry={fetchPerusahaan}
        loadingMessage="Memuat data perusahaan..."
        errorMessage="Gagal Memuat Data"
        emptyTitle="Belum Ada Data Perusahaan"
        emptyMessage="Silakan tambahkan perusahaan terlebih dahulu."
        emptyActionText="Tambah Perusahaan"
        onEmptyAction={() => navigate("/shift-perusahaan/tambah")}
      />
    </div>
  );
};

export default KelolaShiftPerusahaan;
