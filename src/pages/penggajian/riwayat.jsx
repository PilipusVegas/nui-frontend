import ExcelJS from "exceljs";
import Select from "react-select";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { faDownload, faInfo } from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

import {
  SectionHeader,
  Modal,
  DataView,
  Button,
  FilterSelect,
} from "../../components";

import {
  formatLongDate,
  formatFullDate,
  formatISODate,
} from "../../utils/dateUtils";

const RiwayatPenggajian = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const allowedRoles = [1, 4, 6];
  const canDownload = allowedRoles.includes(user?.id_role ?? 0);

  const [dataGaji, setDataGaji] = useState([]);
  const [periodList, setPeriodList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  // =============================
  // LOAD PERIOD
  // =============================
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/penggajian/periode`);
        const json = await res.json();

        if (json.data?.length > 1) {
          const periodsExceptLast = json.data.slice(0, -1);
          setPeriodList(periodsExceptLast);

          const lastHistoryPeriod =
            periodsExceptLast[periodsExceptLast.length - 1];

          setSelectedPeriod(lastHistoryPeriod.id);
        } else {
          setPeriodList(json.data || []);
          setSelectedPeriod(json.data[0]?.id || "");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadPeriods();
  }, [apiUrl]);

  // =============================
  // FETCH DATA
  // =============================
  const fetchGaji = async (periodeId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithJwt(`${apiUrl}/penggajian/${periodeId}`);

      if (!res.ok) throw new Error("Gagal memuat data gaji.");

      const json = await res.json();
      setDataGaji(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPeriod) fetchGaji(selectedPeriod);
  }, [selectedPeriod]);

  // =============================
  // DOWNLOAD EXCEL (tetap)
  // =============================
  const handleDownload = async () => {
    const selectedPeriodData = periodList.find((p) => p.id === selectedPeriod);
    if (!dataGaji.length || !selectedPeriodData) return;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Laporan Penggajian");
    const safeStartDate = formatLongDate(selectedPeriodData.tgl_awal).replace(
      /\s+/g,
      "_",
    );
    const safeEndDate = formatLongDate(selectedPeriodData.tgl_akhir).replace(
      /\s+/g,
      "_",
    );

    ws.mergeCells("B1:E1");
    ws.getCell("B1").value = "LAPORAN REKAPITULASI PENGGAJIAN KARYAWAN";
    ws.getCell("B1").font = { bold: true, size: 16 };
    ws.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };

    ws.mergeCells("B2:E2");
    ws.getCell("B2").value = `Periode: ${safeStartDate} s/d ${safeEndDate}`;
    ws.getCell("B2").alignment = { horizontal: "center", vertical: "middle" };

    ws.mergeCells("B3:E3");
    ws.getCell("B3").value = `Jumlah Karyawan: ${dataGaji.length}`;
    ws.getCell("B3").alignment = { horizontal: "center", vertical: "middle" };

    ws.addRow([]);
    ws.addRow([]);

    const dicetakRow = ws.addRow([]);
    ws.mergeCells(`B${dicetakRow.number}:E${dicetakRow.number}`);
    ws.getCell(`F${dicetakRow.number}`).value =
      `Dicetak pada: ${formatFullDate(new Date())}`;
    ws.getCell(`F${dicetakRow.number}`).alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    ws.columns = [
      { key: "blank", width: 5 },
      { key: "nama", width: 30 },
      { key: "total_hari_kerja", width: 20 },
      { key: "total_alpha", width: 20 },
      { key: "total_keterlambatan_menit", width: 30 },
      { key: "total_lembur_jam", width: 20 },
    ];

    const headerRow = ws.addRow([
      "",
      "Nama Karyawan",
      "Total Hari Kerja",
      "Total Alpha",
      "Total Keterlambatan (menit)",
      "Total Lembur (jam)",
    ]);

    headerRow.eachCell((cell, colNumber) => {
      if (colNumber === 1) return;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "228B22" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    dataGaji.forEach((row) => {
      const newRow = ws.addRow({
        blank: "",
        nama: row.nama?.toUpperCase(),
        total_hari_kerja: row.total_hari_kerja,
        total_alpha: row.total_alpha,
        total_keterlambatan_menit: row.total_keterlambatan_menit,
        total_lembur_jam: row.total_lembur_jam,
      });

      newRow.eachCell((cell, colNumber) => {
        if (colNumber === 1) return;
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Laporan_Penggajian_${safeStartDate}_s/d_${safeEndDate}.xlsx`,
    );
  };

  // =============================
  // COLUMNS DATAVIEW
  // =============================
  const columns = [
    {
      key: "nama",
      label: "Nama Karyawan",
      render: (row) => (
        <span
          className="cursor-pointer hover:underline font-medium"
          onClick={() => {
            const selectedPeriodData = periodList.find(
              (p) => p.id === selectedPeriod,
            );

            const url = `/kelola-absensi/${row.id_user}?startDate=${formatISODate(
              selectedPeriodData?.tgl_awal,
            )}&endDate=${formatISODate(selectedPeriodData?.tgl_akhir)}`;

            window.open(url, "_blank");
          }}
        >
          {row.nama}
        </span>
      ),
    },
    {
      key: "total_hari_kerja",
      label: "Hari Kerja",
      align: "text-center",
      render: (row) => `${row.total_hari_kerja} Hari`,
    },
    {
      key: "total_alpha",
      label: "Alpha",
      align: "text-center",
      render: (row) => `${row.total_alpha} Hari`,
    },
    {
      key: "total_keterlambatan_menit",
      label: "Terlambat",
      align: "text-center",
      render: (row) => `${row.total_keterlambatan_menit} Menit`,
    },
    {
      key: "total_lembur_jam",
      label: "Lembur",
      align: "text-center",
      render: (row) => `${row.total_lembur_jam} Jam`,
    },
  ];

  const header = (
    <div className="w-full sm:w-[320px]">
      <FilterSelect
        label="Periode"
        options={periodList.map((p) => ({
          label: `Periode ${formatLongDate(p.tgl_awal)} - ${formatLongDate(p.tgl_akhir)}`,
          value: p.id,
        }))}
        value={selectedPeriod}
        onChange={setSelectedPeriod}
        placeholder="Pilih periode"
      />
    </div>
  );

  return (
    <div className="flex flex-col">
      <SectionHeader
        title="Riwayat Penggajian"
        subtitle={`Menampilkan ${dataGaji.length} data karyawan`}
        onBack={() => navigate(-1)}
        actions={
          <>
            <Button
              variant="info"
              icon={faInfo}
              onClick={() => setShowInfo(true)}
            >
              Informasi
            </Button>

            {canDownload && (
              <Button
                variant="primary"
                icon={faDownload}
                onClick={handleDownload}
                disabled={!dataGaji.length}
              >
                Unduh
              </Button>
            )}
          </>
        }
      />

      {/* DATAVIEW */}
      <DataView
        data={dataGaji}
        columns={columns}
        searchable
        searchKeys={["nama"]}
        searchPlaceholder="Cari karyawan..."
        itemsPerPage={15}
        isLoading={loading}
        error={error}
        onRetry={() => fetchGaji(selectedPeriod)}
        emptyTitle="Belum ada data"
        emptyMessage="Tidak ada riwayat penggajian"
        header={header}
      />

      {/* MODAL */}
      <Modal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="Informasi Riwayat Penggajian"
      >
        <p className="text-sm">
          Halaman ini menampilkan rekap penggajian berdasarkan periode
          sebelumnya untuk keperluan audit dan analisis.
        </p>
      </Modal>
    </div>
  );
};

export default RiwayatPenggajian;
