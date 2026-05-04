import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faMapMarkerAlt,
  faBuilding,
  faStore,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt } from "../../utils/jwtHelper";
import {
  SectionHeader,
  Modal,
  DataView,
  Button,
} from "../../components";

const DataLokasi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const [lokasiData, setLokasiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeKategori, setActiveKategori] = useState("ALL");
  const [openKategoriModal, setOpenKategoriModal] = useState(false);

  /* ================= FETCH ================= */
  const fetchLokasiData = async () => {
    setLoading(true);
    setError(false);

    try {
      const res = await fetchWithJwt(`${apiUrl}/lokasi/`);
      const result = await res.json();
      setLokasiData(result.data || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLokasiData();
  }, []);

  /* ================= ACTION ================= */
  const openGoogleMaps = (koordinat) => {
    if (!koordinat) return;
    window.open(
      `https://www.google.com/maps?q=${encodeURIComponent(koordinat)}`,
      "_blank"
    );
  };

  /* ================= FILTER ================= */
  const filteredData =
    activeKategori === "ALL"
      ? lokasiData
      : lokasiData.filter((i) => i.kategori === activeKategori);

  /* ================= COLUMNS ================= */
  const columns = [
    {
      label: "Nama Lokasi",
      key: "nama",
      render: (row) => (
        <span className="font-semibold uppercase">{row.nama}</span>
      ),
    },
    {
      label: "Koordinat",
      key: "koordinat",
      truncate: true,
    },
    {
      label: "Timezone",
      key: "timezone",
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
            variant="detail"
            icon={faMapMarkerAlt}
            onClick={() => openGoogleMaps(row.koordinat)}
          >
            Maps
          </Button>

          <Button
            size="sm"
            variant="warning"
            icon={faEdit}
            onClick={() => navigate(`/data-lokasi/edit/${row.id}`)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  /* ================= TABS ================= */
  const tabs = [
    { label: "Semua", value: "ALL" },
    { label: "Kantor", value: 1 },
    { label: "Gerai", value: 2 },
    { label: "Rumah", value: 3 },
  ];

  const renderTabs = () =>
    tabs.map((tab) => {
      const isActive = activeKategori === tab.value;

      return (
        <Button
          key={tab.value}
          size="sm"
          variant={isActive ? "primary" : "secondary"}
          onClick={() => setActiveKategori(tab.value)}
        >
          {tab.label}
        </Button>
      );
    });

  return (
    <>
      <SectionHeader
        title="Data Lokasi"
        subtitle={`Menampilkan ${filteredData.length} lokasi yang terdaftar dalam sistem`}
        onBack={() => navigate("/home")}
        actions={
          <Button
            icon={faPlus}
            onClick={() => setOpenKategoriModal(true)}
          >
            Tambah
          </Button>
        }
      />

      <DataView
        data={filteredData}
        columns={columns}
        searchable
        searchKeys={["nama", "koordinat", "timezone"]}
        searchPlaceholder="Cari lokasi..."
        isLoading={loading}
        error={error}
        onRetry={fetchLokasiData}
        emptyTitle="Data Lokasi Kosong"
        emptyMessage="Belum ada data lokasi atau hasil pencarian tidak ditemukan."
        emptyActionText="Tambah Lokasi"
        onEmptyAction={() => navigate("/data-lokasi/tambah")}
        header={renderTabs()}
      />

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={openKategoriModal}
        onClose={() => setOpenKategoriModal(false)}
        title="Pilih Jenis Lokasi"
        note="Setiap jenis lokasi memiliki fungsi yang berbeda"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Kantor",
              value: 1,
              icon: faBuilding,
              desc: "Digunakan untuk Absen & Kunjungan",
            },
            {
              label: "Gerai",
              value: 2,
              icon: faStore,
              desc: "Digunakan untuk Absen & Kunjungan",
            },
            {
              label: "Rumah",
              value: 3,
              icon: faHouse,
              desc: "Digunakan Untuk Kunjungan",
            },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setOpenKategoriModal(false);
                navigate("/data-lokasi/tambah", {
                  state: { kategori: item.value },
                });
              }}
              className="
                group rounded-xl border border-gray-200 p-4 text-center
                hover:border-green-500 hover:bg-green-50 transition
              "
            >
              <div className="mb-2 text-gray-600 group-hover:text-green-600">
                <FontAwesomeIcon icon={item.icon} />
              </div>

              <div className="text-sm font-semibold">
                {item.label}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {item.desc}
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default DataLokasi;