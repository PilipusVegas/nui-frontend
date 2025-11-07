import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatLongDate } from "../../utils/dateUtils";

export const exportRekapTunjangan = async (dataTunjangan, tanggalArray) => {
  try {
    if (!dataTunjangan?.length) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Rekap Tunjangan");

    // === HEADER UTAMA ===
    sheet.mergeCells("A1:F1");
    sheet.getCell("A1").value = "REKAP TUNJANGAN KARYAWAN (PER MINGGU)";
    sheet.getCell("A1").alignment = { horizontal: "center" };
    sheet.getCell("A1").font = { bold: true, size: 14, color: { argb: "FFFFFF" } };
    sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "22C55E" } };

    // === HEADER KOLOM PEGAWAI ===
    const headerPegawai = ["NIP", "Nama", "TUM", "TSM", "TKT", "Nominal"];
    const dateHeaders = tanggalArray.flatMap((tgl) => [
      `${formatLongDate(tgl)} - TKT`,
      `${formatLongDate(tgl)} - TUM`,
      `${formatLongDate(tgl)} - TSM`,
    ]);

    const headers = [...headerPegawai, ...dateHeaders];
    sheet.addRow(headers);

    // === Gaya Header ===
    const headerRow = sheet.getRow(2);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "16A34A" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // === ISI DATA ===
    dataTunjangan.forEach((item) => {
      const baseData = [
        item.nip,
        item.nama_user,
        item.total?.id_tunjangan_1 ?? 0,
        item.total?.id_tunjangan_2 ?? 0,
        item.total?.id_tunjangan_3 ?? 0,
        item.total?.tunjangan ?? 0,
      ];

      const detailData = tanggalArray.flatMap((tgl) => {
        const tunjanganHari = item.tunjangan[tgl] || [];
        const typeIds = [1, 2, 3]; // 1: Transport, 2: Makan, 3: Shift Malam
        return typeIds.map((id) =>
          tunjanganHari.some((t) => t.id === id) ? "✓" : "-"
        );
      });

      sheet.addRow([...baseData, ...detailData]);
    });

    // === Format Kolom ===
    sheet.columns.forEach((col, i) => {
      col.width = i < 2 ? 18 : 12;
    });

    // === Gaya border & align isi data ===
    sheet.eachRow((row, idx) => {
      if (idx > 1) {
        row.eachCell((cell) => {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // === Format Rupiah pada kolom Nominal ===
    sheet.getColumn(6).numFmt = '"Rp"#,##0;[Red]-"Rp"#,##0';

    // === Simpan File ===
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Rekap_Tunjangan.xlsx");

  } catch (error) {
    console.error("Gagal mengekspor Excel:", error);
  }
};
