import ExcelJS from "exceljs";
import Select from "react-select";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSync, faSort, faSortUp, faSortDown, faSortAlphaAsc, faSortAlphaDesc, faInfo, } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { SectionHeader, SearchBar, EmptyState, LoadingSpinner, ErrorState, Modal } from "../../components";
import { formatLongDate, formatFullDate, formatISODate } from "../../utils/dateUtils";

const DataPenggajian = () => {
  const allowedRoles = [1, 4, 6];
  const navigate = useNavigate();
  const user = getUserFromToken();
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [dataGaji, setDataGaji] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchName, setSearchName] = useState("");
  const [periodList, setPeriodList] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const canDownload = allowedRoles.includes(user?.id_role ?? 0);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/penggajian/periode`);
        const json = await res.json();
        setPeriodList(json.data || []);

        if (json.data?.length) {
          const lastPeriod = json.data[json.data.length - 1];
          setSelectedPeriod(lastPeriod.id);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    loadPeriods();
  }, [apiUrl]);



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
  }, [apiUrl, selectedPeriod]);


  const filteredData = dataGaji.filter((item) =>
    item.nama.toLowerCase().includes(searchName.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const handleDownload = async () => {
    const selectedPeriodData = periodList.find((p) => p.id === selectedPeriod);
    if (!filteredData.length || !selectedPeriodData) return;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Laporan Penggajian");

    // ===== SPASI ATAS =====
    ws.addRow([]);
    ws.addRow([]);

    // Format tanggal
    const startDate = new Date(selectedPeriodData.tgl_awal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const endDate = new Date(selectedPeriodData.tgl_akhir).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // ===== HEADER LAPORAN (dibuat center ke A–F) =====
    ws.mergeCells("A3:F3");
    ws.getCell("A3").value = "LAPORAN REKAPITULASI PENGGAJIAN KARYAWAN";
    ws.getCell("A3").font = { bold: true, size: 16 };
    ws.getCell("A3").alignment = { horizontal: "center", vertical: "middle" };

    ws.mergeCells("A4:F4");
    ws.getCell("A4").value = `Periode: ${startDate} s/d ${endDate}`;
    ws.getCell("A4").alignment = { horizontal: "center", vertical: "middle" };

    ws.mergeCells("A5:F5");
    ws.getCell("A5").value = `Jumlah Karyawan: ${filteredData.length} Karyawan`;
    ws.getCell("A5").alignment = { horizontal: "center", vertical: "middle" };

    // ===== SPASI =====
    ws.addRow([]);
    ws.addRow([]);

    // ===== DICETAK PADA =====
    const dicetakRow = ws.addRow([]);
    ws.mergeCells(`A${dicetakRow.number}:F${dicetakRow.number}`);
    ws.getCell(`F${dicetakRow.number}`).value = `Dicetak pada: ${formatFullDate(new Date())}`;
    ws.getCell(`F${dicetakRow.number}`).alignment = { horizontal: "right", vertical: "middle" };

    // ===== DEFINISI KOLUMN =====
    ws.columns = [
      { key: "blank", width: 5 },              // A
      { key: "nama", width: 30 },              // B
      { key: "total_hari_kerja", width: 20 },  // C
      { key: "total_alpha", width: 20 },       // D
      { key: "total_keterlambatan_menit", width: 30 }, // E
      { key: "total_lembur_jam", width: 20 },  // F
    ];

    // ===== HEADER TABEL =====
    const headerRow = ws.addRow([
      "",
      "Nama Karyawan",
      "Total Hari Kerja",
      "Total Alpha",
      "Total Keterlambatan (menit)",
      "Total Lembur (jam)"
    ]);

    headerRow.eachCell((cell, colNumber) => {
      if (colNumber === 1) return;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "228B22" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // ===== DATA =====
    filteredData.forEach((row) => {
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
      `Laporan_Penggajian_${startDate}_sd_${endDate}.xlsx`
    );
  };


  const handleSync = async () => {
    setLoading(true);
    try {
      await fetchWithJwt(`${apiUrl}/penggajian/sinkron/${selectedPeriod}`, {
        method: "POST",
      });
      const res = await fetchWithJwt(`${apiUrl}/penggajian/${selectedPeriod}`);
      const json = await res.json();
      setDataGaji(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <SectionHeader title="Ringkasan Penggajian Periode Saat Ini" subtitle={`Menampilkan ${filteredData.length} karyawan pada periode terpilih. Lakukan sinkronisasi untuk memperbarui data.`} onBack={() => navigate("/home")}
        actions={
          <div className="flex flex-wrap gap-2">
            {canDownload && (
              <button onClick={handleDownload} disabled={!filteredData.length} className={`flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-white ${!filteredData.length ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}>
                <FontAwesomeIcon icon={faDownload} className="mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Unduh Excel</span>
              </button>
            )}
            <button onClick={() => setShowInfo(true)} className="flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 gap-1">
              <FontAwesomeIcon icon={faInfo} className="mr-0 sm:mr-1" />
              <span className="hidden sm:inline">Informasi</span>
            </button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full mb-4">
        <div className="w-full sm:flex-1">
          <SearchBar placeholder="Cari nama karyawan..." onSearch={setSearchName} />
        </div>
        <div>
          {selectedPeriod && (
            <div className="text-sm font-medium text-gray-700 px-3 py-2.5 rounded-lg shadow-sm border border-gray-300 whitespace-nowrap">
              {(() => {
                const period = periodList.find((p) => p.id === selectedPeriod);
                if (!period) return null;
                return (
                  <>
                    Periode:{" "}
                    <span className="font-semibold">
                      {formatLongDate(period.tgl_awal)} s/d {formatLongDate(period.tgl_akhir)}
                    </span>
                  </>
                );
              })()}
            </div>
          )}

        </div>
        <button onClick={handleSync} disabled={loading} className={`flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-white ${loading ? "bg-cyan-400 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-600"}`}>
          <FontAwesomeIcon icon={faSync} className={loading ? "animate-spin mr-0 sm:mr-1" : "mr-0 sm:mr-1"} />
          <span className="hidden sm:inline">Tarik Data Terbaru</span>
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorState message={error} onRetry={() => fetchGaji(selectedPeriod)} />}
      {!loading && !error && !filteredData.length && <EmptyState message="Tidak ada data gaji." />}

      {!loading && !error && filteredData.length > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow bg-white">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-green-500 text-white text-sm">
                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("nama")}>
                  <div className="flex items-center justify-center gap-1">
                    Nama Karyawan
                    <FontAwesomeIcon icon={sortKey !== "nama" ? faSort : sortOrder === "asc" ? faSortAlphaAsc : faSortAlphaDesc} className="text-xs" />
                  </div>
                </th>
                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("total_hari_kerja")}>
                  <div className="flex items-center justify-center gap-1">
                    Total Hari Kerja
                    <FontAwesomeIcon icon={sortKey !== "total_hari_kerja" ? faSort : sortOrder === "asc" ? faSortDown : faSortUp} className="text-xs" />
                  </div>
                </th>
                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("total_alpha")}>
                  <div className="flex items-center justify-center gap-1">
                    Total Alpha
                    <FontAwesomeIcon icon={sortKey !== "total_alpha" ? faSort : sortOrder === "asc" ? faSortDown : faSortUp} className="text-xs" />
                  </div>
                </th>
                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("total_keterlambatan_menit")}>
                  <div className="flex items-center justify-center gap-1">
                    Total Keterlambatan
                    <FontAwesomeIcon icon={sortKey !== "total_keterlambatan_menit" ? faSort : sortOrder === "asc" ? faSortDown : faSortUp} className="text-xs" />
                  </div>
                </th>
                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("total_lembur_jam")}>
                  <div className="flex items-center justify-center gap-1">
                    Total Lembur
                    <FontAwesomeIcon icon={sortKey !== "total_lembur_jam" ? faSort : sortOrder === "asc" ? faSortDown : faSortUp} className="text-xs" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, i) => (
                <tr key={i} className="odd:bg-gray-50 even:bg-white hover:bg-gray-100 text-xs font-medium tracking-wide border-b">
                  <td className="px-3 py-2 font-medium hover:underline hover:cursor-pointer">
                    <span onClick={() => {
                      const selectedPeriodData = periodList.find((p) => p.id === selectedPeriod);
                      const startDate = selectedPeriodData?.tgl_awal;
                      const endDate = selectedPeriodData?.tgl_akhir;

                      const url = `/kelola-absensi/${item.id_user}?startDate=${formatISODate(startDate)}&endDate=${formatISODate(endDate)}`;
                      window.open(url, "_blank"); // buka di tab baru
                    }}
                    >
                      {item.nama}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-center">{item.total_hari_kerja} Hari</td>
                  <td className="px-3 py-2 text-center">{item.total_alpha} Hari</td>
                  <td className="px-3 py-2 text-center">{item.total_keterlambatan_menit} Menit</td>
                  <td className="px-3 py-2 text-center">{item.total_lembur_jam} Jam</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="Informasi Ringkasan Penggajian">
        <div className="text-sm leading-relaxed space-y-4">
          <p> Halaman <strong>Ringkasan Penggajian</strong> digunakan HRD untuk memantau data gaji karyawan dengan cepat dan ringkas berdasarkan <strong>periode yang dipilih</strong>.</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="calendar-alt" className="text-green-600 mt-0.5" />
              <span>
                <strong>Pilih Periode:</strong> Tentukan rentang waktu penggajian (misalnya bulan berjalan atau periode sebelumnya).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="search" className="text-blue-600 mt-0.5" />
              <span>
                <strong>Cari Nama:</strong> Filter cepat untuk menemukan karyawan tertentu tanpa menelusuri daftar panjang.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="sync" className="text-orange-600 mt-0.5" spin />
              <span>
                <strong>Tarik Data Terbaru:</strong> Memperbarui data sesuai absensi dan perhitungan terakhir.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon="file-excel" className="text-green-700 mt-0.5" />
              <span>
                <strong>Unduh Excel:</strong> Untuk laporan resmi atau dokumentasi internal (khusus role tertentu).
              </span>
            </li>
          </ul>

          <div className="space-y-1">
            <p>
              <FontAwesomeIcon icon="table" className="text-gray-600 mr-2" />
              <strong>Tabel Ringkasan:</strong> Menampilkan daftar karyawan dengan kolom:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Nama Karyawan</strong> → Identitas karyawan.</li>
              <li><strong>Total Hari Kerja</strong> → Jumlah hari hadir dalam periode.</li>
              <li><strong>Total Keterlambatan</strong> → Akumulasi menit keterlambatan.</li>
              <li><strong>Total Lembur</strong> → Jumlah jam lembur tercatat.</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p>
              <FontAwesomeIcon icon={faSort} className="text-purple-600 mr-2" />
              <strong>Fitur Sorting:</strong> Klik judul kolom untuk mengurutkan data (A–Z, Z–A, kecil–besar, besar–kecil).
            </p>
          </div>
          <p className="text-gray-700"> Semua fitur ini membantu HRD mengelola penggajian dengan praktis, akurat, dan siap dipakai untuk laporan maupun evaluasi.</p>
        </div>
      </Modal>

    </div>

  );
};

export default DataPenggajian;