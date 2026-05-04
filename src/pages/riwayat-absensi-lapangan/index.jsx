import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatLongDate, toLocalISODate } from "../../utils/dateUtils";
import {
  SectionHeader,
  DataView,
  Button,
  Badge,
  FilterSelect,
} from "../../components";
import { faEye } from "@fortawesome/free-solid-svg-icons";


const RiwayatAbsensiLapangan = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [data, setData] = useState([]);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriode, setSelectedPeriode] = useState(null);
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH PERIODE ================= */
  const fetchPeriode = async () => {
    try {
      setLoadingPeriode(true);
      setError(null);
      const res = await fetchWithJwt(`${apiUrl}/penggajian/periode`);
      if (!res.ok) throw new Error("Gagal memuat periode");
      const json = await res.json();
      const today = new Date();
      const nonActive = (json.data || []).filter((p) => {
        const start = new Date(p.tgl_awal);
        const end = new Date(p.tgl_akhir);
        return !(today >= start && today <= end);
      });
      const lastThree = nonActive.slice(-3);
      setPeriodeList(lastThree);
      setSelectedPeriode(lastThree.at(-1) || null);
    } catch (err) {
      setError(err.message);
      setPeriodeList([]);
      setSelectedPeriode(null);
    } finally {
      setLoadingPeriode(false);
    }
  };

  /* ================= FETCH DATA ================= */
  const fetchRiwayat = async (periode) => {
    if (!periode?.tgl_awal || !periode?.tgl_akhir) {
      setData([]);
      return;
    }
    try {
      setLoadingData(true);
      setError(null);
      const res = await fetchWithJwt(
        `${apiUrl}/absen/riwayat?startDate=${toLocalISODate(
          periode.tgl_awal,
        )}&endDate=${toLocalISODate(periode.tgl_akhir)}`,
      );
      if (!res.ok) throw new Error("Gagal memuat riwayat");
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchPeriode();
  }, []);

  useEffect(() => {
    if (selectedPeriode) {
      fetchRiwayat(selectedPeriode);
    }
  }, [selectedPeriode]);

  /* ================= COLUMNS ================= */
  const columns = [
    {
      label: "Nama Karyawan",
      key: "nama",
      render: (row) => <div className="font-semibold">{row.nama}</div>,
    },
    {
      label: "Divisi",
      key: "role",
      cellClassName: "text-gray-600",
    },
    {
      label: "Total Absen",
      align: "text-center",
      render: (row) => `${row.total_absen} Hari`,
    },
    {
      label: "Menu",
      align: "text-center",
      isAction: true,
      render: (row) => {
        const isValid = selectedPeriode?.tgl_awal && selectedPeriode?.tgl_akhir;

        return (
          <Button
            variant="detail"
            size="sm"
            icon={faEye}
            disabled={!isValid}
            onClick={() =>
              window.open(
                `/riwayat-absensi-lapangan/${row.id_user}?startDate=${toLocalISODate(
                  selectedPeriode.tgl_awal,
                )}&endDate=${toLocalISODate(selectedPeriode.tgl_akhir)}`,
                "_blank",
              )
            }
          >
            Detail
          </Button>
        );
      },
    },
  ];
  const periodeOptions = periodeList.map((p) => ({
    value: p.id,
    label: `${formatLongDate(p.tgl_awal)} - ${formatLongDate(p.tgl_akhir)}`,
  }));
  /* ================= HEADER FILTER ================= */
  const headerFilter = (
    <div className="w-full md:w-[260px] shrink">
      <FilterSelect
        label="Periode"
        options={periodeOptions}
        value={selectedPeriode?.id || ""}
        placeholder="Pilih periode"
        onChange={(val) => {
          if (!val) {
            setSelectedPeriode(null);
            setData([]);
            return;
          }

          const p = periodeList.find((x) => x.id === val);
          setSelectedPeriode(p || null);
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col">
      <SectionHeader
        title="Riwayat Absensi Lapangan"
        subtitle="Menampilkan riwayat absensi karyawan lapangan berdasarkan periode yang dipilih."
        onBack={() => navigate("/pengajuan-absensi")}
      />

      <DataView
        data={data}
        columns={columns}
        searchable
        searchKeys={["nama", "role"]}
        searchPlaceholder="Cari nama atau divisi..."
        header={headerFilter}
        isLoading={loadingPeriode || loadingData}
        error={error}
        onRetry={() => fetchRiwayat(selectedPeriode)}
        emptyTitle="Tidak ada data riwayat absensi"
      />
    </div>
  );
};

export default RiwayatAbsensiLapangan;
