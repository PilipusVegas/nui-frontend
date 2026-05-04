import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { faDownload, faSync, faInfo } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { SectionHeader, Modal, DataView, Button } from "../../components";
import {
  formatLongDate,
  formatFullDate,
  formatISODate,
} from "../../utils/dateUtils";

const DataPenggajian = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const allowedRoles = [1, 4, 6];
  const canDownload = allowedRoles.includes(user?.id_role ?? 0);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [dataGaji, setDataGaji] = useState([]);
  const [periodList, setPeriodList] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const selectedPeriodData = periodList.find(
    (p) => String(p.id) === String(selectedPeriod),
  );

  const subtitle = selectedPeriodData
    ? `Periode ${formatFullDate(selectedPeriodData.tgl_awal)} - ${formatFullDate(selectedPeriodData.tgl_akhir)}`
    : "Memuat periode...";

  // ================= LOAD PERIODE =================
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/penggajian/periode`);
        const json = await res.json();

        setPeriodList(json.data || []);

        if (json.data?.length) {
          const last = json.data[json.data.length - 1];
          setSelectedPeriod(last.id);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadPeriods();
  }, [apiUrl]);

  // ================= FETCH DATA =================
  const fetchGaji = async (periodeId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithJwt(`${apiUrl}/penggajian/${periodeId}`);
      if (!res.ok) throw new Error("Gagal memuat data gaji");

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

  // ================= SYNC =================
  const handleSync = async () => {
    setLoading(true);
    try {
      await fetchWithJwt(`${apiUrl}/penggajian/sinkron/${selectedPeriod}`, {
        method: "POST",
      });
      await fetchGaji(selectedPeriod);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // ================= DOWNLOAD =================
  const handleDownload = async () => {
    const selectedPeriodData = periodList.find((p) => p.id === selectedPeriod);
    if (!dataGaji.length || !selectedPeriodData) return;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Laporan Penggajian");

    // ===== SPASI ATAS =====
    ws.addRow([]);
    ws.addRow([]);

    // Format tanggal
    const startDate = new Date(selectedPeriodData.tgl_awal).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );
    const endDate = new Date(selectedPeriodData.tgl_akhir).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );

    // ===== HEADER LAPORAN (dibuat center ke A–F) =====
    ws.mergeCells("A3:F3");
    ws.getCell("A3").value = "LAPORAN REKAPITULASI PENGGAJIAN KARYAWAN";
    ws.getCell("A3").font = { bold: true, size: 16 };
    ws.getCell("A3").alignment = { horizontal: "center", vertical: "middle" };

    ws.mergeCells("A4:F4");
    ws.getCell("A4").value = `Periode: ${startDate} s/d ${endDate}`;
    ws.getCell("A4").alignment = { horizontal: "center", vertical: "middle" };

    ws.mergeCells("A5:F5");
    ws.getCell("A5").value = `Jumlah Karyawan: ${dataGaji.length} Karyawan`;
    ws.getCell("A5").alignment = { horizontal: "center", vertical: "middle" };

    // ===== SPASI =====
    ws.addRow([]);
    ws.addRow([]);

    // ===== DICETAK PADA =====
    const dicetakRow = ws.addRow([]);
    ws.mergeCells(`A${dicetakRow.number}:F${dicetakRow.number}`);
    ws.getCell(`F${dicetakRow.number}`).value =
      `Dicetak pada: ${formatFullDate(new Date())}`;
    ws.getCell(`F${dicetakRow.number}`).alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    // ===== DEFINISI KOLUMN =====
    ws.columns = [
      { key: "blank", width: 5 }, // A
      { key: "nama", width: 30 }, // B
      { key: "total_hari_kerja", width: 20 }, // C
      { key: "total_alpha", width: 20 }, // D
      { key: "total_keterlambatan_menit", width: 30 }, // E
      { key: "total_lembur_jam", width: 20 }, // F
    ];

    // ===== HEADER TABEL =====
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

    // ===== DATA =====
    dataGaji.forEach((row) => {
      const newRow = ws.addRow({
        blank: "",
        nama: row.nama,
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

    // ===== SAVE FILE =====
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `Laporan_Penggajian_${startDate}_sd_${endDate}.xlsx`,
    );
  };

  // ================= COLUMNS =================
  const columns = [
    {
      label: "Nama Karyawan",
      key: "nama",
      render: (row) => (
        <span
          className="hover:underline cursor-pointer"
          onClick={() => {
            const period = periodList.find((p) => p.id === selectedPeriod);

            const url = `/kelola-absensi/${row.id_user}?startDate=${formatISODate(period?.tgl_awal)}&endDate=${formatISODate(period?.tgl_akhir)}`;
            window.open(url, "_blank");
          }}
        >
          {row.nama}
        </span>
      ),
    },
    {
      label: "Hari Kerja",
      key: "total_hari_kerja",
      align: "text-center",
      render: (row) => `${row.total_hari_kerja} Hari`,
    },
    {
      label: "Alpha",
      key: "total_alpha",
      align: "text-center",
      render: (row) => `${row.total_alpha} Hari`,
    },
    {
      label: "Terlambat",
      key: "total_keterlambatan_menit",
      align: "text-center",
      render: (row) => `${row.total_keterlambatan_menit} Menit`,
    },
    {
      label: "Lembur",
      key: "total_lembur_jam",
      align: "text-center",
      render: (row) => `${row.total_lembur_jam} Jam`,
    },
  ];

  return (
    <div className="flex flex-col">
      <SectionHeader
        title="Ringkasan Penggajian"
        subtitle={subtitle}
        onBack={() => navigate("/home")}
        actions={
          <div className="flex gap-2">
            {canDownload && (
              <Button icon={faDownload} onClick={handleDownload}>
                Unduh
              </Button>
            )}

            <Button
              variant="info"
              icon={faInfo}
              onClick={() => setShowInfo(true)}
            >
              Info
            </Button>
          </div>
        }
      />

      <DataView
        data={dataGaji}
        columns={columns}
        searchable
        searchKeys={["nama"]}
        itemsPerPage={15}
        isLoading={loading}
        error={error}
        onRetry={() => fetchGaji(selectedPeriod)}
        actions={
          <Button
            variant="sync"
            icon={faSync}
            loading={loading}
            onClick={handleSync}
          >
            Sinkron
          </Button>
        }
      />

      <Modal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="Informasi"
      >
        Halaman ini digunakan untuk monitoring penggajian.
      </Modal>
    </div>
  );
};

export default DataPenggajian;
