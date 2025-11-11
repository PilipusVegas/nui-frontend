import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatLongDate } from "../../utils/dateUtils";

export const exportRekapTunjangan = async (
  dataTunjangan,
  tanggalArray,
  namaUser
) => {
  try {
    if (!dataTunjangan?.length) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Rekap Tunjangan");

    // === INFORMASI PERIODE, JUMLAH, DAN PENCETAK ===
    const tglAwal = formatLongDate(tanggalArray[0]);
    const tglAkhir = formatLongDate(tanggalArray[tanggalArray.length - 1]);
    const tglCetak = formatLongDate(new Date());

    // Baris 2: Periode
    sheet.mergeCells("B2:Z2");
    sheet.getCell("B2").value = `Periode Rekapitulasi Tunjangan: ${tglAwal} - ${tglAkhir}`;
    sheet.getCell("B2").font = { bold: true };
    sheet.getCell("B2").alignment = { horizontal: "left", vertical: "middle" };

    // Baris 3: Jumlah Karyawan
    sheet.mergeCells("B3:Z3");
    sheet.getCell("B3").value = `Jumlah Karyawan: ${dataTunjangan.length} orang`;
    sheet.getCell("B3").alignment = { horizontal: "left", vertical: "middle" };

    // Baris 4: Informasi pencetak
    sheet.mergeCells("B4:Z4");
    sheet.getCell("B4").value = `File ini dicetak pada: ${tglCetak} | Dicetak oleh: ${namaUser}`;
    sheet.getCell("B4").alignment = { horizontal: "left", vertical: "middle" };

    // Baris 5: Keterangan singkatan tunjangan
    sheet.mergeCells("B5:Z5");
    sheet.getCell("B5").value =
      "Keterangan: TUM = Tunjangan Uang Makan | TSM = Tunjangan Shift Malam | TKP = Tunjangan Kendaraan Pribadi";
    sheet.getCell("B5").font = { italic: true };
    sheet.getCell("B5").alignment = { horizontal: "left", vertical: "middle" };

    sheet.addRow([]); // baris kosong pemisah

    // === HEADER UTAMA (Mulai dari baris 7) ===
    sheet.mergeCells("B7:C7");
    sheet.getCell("B7").value = "PEGAWAI";

    sheet.mergeCells("D7:G7");
    sheet.getCell("D7").value = "JUMLAH";

    // Merge header tanggal
    let colIndex = 8; // kolom setelah G
    tanggalArray.forEach((tgl) => {
      const formattedDate = formatLongDate(tgl);
      sheet.mergeCells(7, colIndex, 7, colIndex + 2);
      sheet.getCell(7, colIndex).value = formattedDate;
      colIndex += 3;
    });

    // === SUBHEADER (Baris 8) ===
    const subHeader = [
      "", // kolom A dibiarkan kosong
      "NIP",
      "Nama",
      "TKP",
      "TUM",
      "TSM",
      "Nominal",
      ...tanggalArray.flatMap(() => ["TKP", "TUM", "TSM"]),
    ];
    sheet.addRow(subHeader);

    // === GAYA HEADER (Baris 7 & 8) ===
    [7, 8].forEach((rowNum) => {
      const row = sheet.getRow(rowNum);
      row.height = 20;
      row.eachCell((cell) => {
        if (cell.col > 1) {
          cell.font = { bold: true, color: { argb: "FFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "22C55E" },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    });

    // === ISI DATA ===
    dataTunjangan.forEach((item) => {
      const baseData = [
        "", // kolom A kosong agar mulai dari kolom B
        item.nip,
        item.nama_user,
        item.total?.id_tunjangan_3 ?? "-",
        item.total?.id_tunjangan_1 ?? "-",
        item.total?.id_tunjangan_2 ?? "-",
        item.total?.tunjangan ?? 0,
      ];

      const detailData = tanggalArray.flatMap((tgl) => {
        const tunjanganHari = item.tunjangan[tgl] || [];
        const typeIds = [3, 1, 2]; // TKP, TUM, TSM
        return typeIds.map((id) =>
          tunjanganHari.some((t) => t.id === id) ? "✓" : "-"
        );
      });

      sheet.addRow([...baseData, ...detailData]);
    });

    // === FORMAT KOLOM ===
    sheet.columns.forEach((col, i) => {
      if (i === 0) col.width = 2; // kolom A kosong
      else if (i <= 3) col.width = 18;
      else col.width = 10;
    });

    // === GAYA DATA ===
    sheet.eachRow((row, idx) => {
      if (idx > 8) {
        row.eachCell((cell) => {
          if (cell.col > 1) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
        });
      }
    });

    // === FORMAT NOMINAL (kolom G = ke-7) ===
    sheet.getColumn(7).numFmt = '"Rp"#,##0;[Red]-"Rp"#,##0';

    // === SIMPAN FILE ===
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Rekap_Tunjangan_${tglAwal}_${tglAkhir}.xlsx`
    );

  } catch (error) {
    console.error("Gagal mengekspor Excel:", error);
  }
};
