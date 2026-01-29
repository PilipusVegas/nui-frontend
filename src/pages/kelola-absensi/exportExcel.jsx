import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatFullDate, formatLongDate, isSunday } from "../../utils/dateUtils";
import { getUserFromToken } from "../../utils/jwtHelper";

const REMARK_LABEL = {
  4: "CUTI",
  5: "IZIN SAKIT",
};

const isRemarkDay = (att) =>
  att?.remark_status === 4 || att?.remark_status === 5;


export const exportRekapPresensi = async ({ filteredAbsenData, startDate, endDate, tanggalArray }) => {
  if (!filteredAbsenData.length) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Rekap Kelola Presensi");

  const offsetCol = 2;
  const offsetRow = 5;
  const jumlahKaryawan = filteredAbsenData.length;

  // --- Pastikan tanggalArray sudah berisi string ISO atau format yg bisa di new Date()
  // Fix: build column widths terlebih dahulu (SEBELUM mengisi rows)
  const fixedColsCount = 6; // NIP, Nama, Hadir, Alpha, Telat, Lembur

  worksheet.columns = Array(offsetCol - 1).fill({ width: 4 }).concat([
    { width: 10 }, // NIP
    { width: 26 }, // Nama
    { width: 8 },  // Hadir
    { width: 8 },  // Alpha
    { width: 8 },  // Telat
    { width: 8 },  // Lembur
    // dynamic tanggal cols
    ...tanggalArray.flatMap((tgl) =>
      isSunday(new Date(tgl)) ? Array(6).fill({ width: 6 }) : Array(4).fill({ width: 6 })
    ),
  ]);

  const summary1 = `Periode Rekapitulasi Presensi: ${formatFullDate(startDate)} - ${formatFullDate(endDate)}`;
  const summary2 = `Jumlah Karyawan: ${jumlahKaryawan} orang`;

  // 🔹 Header atas
  worksheet.mergeCells(2, offsetCol, 2, offsetCol + 50);
  worksheet.getCell(2, offsetCol).value = summary1;
  worksheet.getCell(2, offsetCol).font = { bold: true, size: 16 };
  worksheet.getCell(2, offsetCol).alignment = { vertical: "middle", horizontal: "left" };

  worksheet.mergeCells(3, offsetCol, 3, offsetCol + 50);
  worksheet.getCell(3, offsetCol).value = summary2;
  worksheet.getCell(3, offsetCol).font = { size: 12 };
  worksheet.getCell(3, offsetCol).alignment = { vertical: "middle", horizontal: "left" };

  // 🔹 Info cetak
  const user = getUserFromToken();
  const printInfo = `File ini dicetak pada: ${formatFullDate(new Date())} | Dicetak oleh: ${user?.nama_user || "-"}`;
  worksheet.mergeCells(offsetRow - 1, offsetCol, offsetRow - 1, offsetCol + 50);
  worksheet.getCell(offsetRow - 1, offsetCol).value = printInfo;
  worksheet.getCell(offsetRow - 1, offsetCol).font = { italic: true, size: 11 };
  worksheet.getCell(offsetRow - 1, offsetCol).alignment = { vertical: "middle", horizontal: "left" };

  // 🔵 Header Utama - build secara dinamis dengan panjang yang konsisten
  // Perhatikan: initial headerRow1 harus punya fixedColsCount elemen
  const headerRow1 = ["Pegawai", "", "Jumlah", "", "", ""]; // total 6 untuk kolom tetap
  const headerRow2 = ["NIP", "Nama Karyawan", "Hadir", "Alpha", "Telat", "Lembur"];

  tanggalArray.forEach((tgl) => {
    const dateObj = new Date(tgl);
    const formattedDate = formatLongDate(dateObj);
    const isMinggu = isSunday(dateObj);

    if (isMinggu) {
      // Minggu -> 6 kolom
      headerRow1.push(formattedDate, "", "", "", "", "");
      headerRow2.push("IN", "LATE", "OUT", "T", "LM", "LP");
    } else {
      // Biasa -> 4 kolom
      headerRow1.push(formattedDate, "", "", "");
      headerRow2.push("IN", "LATE", "OUT", "T");
    }
  });

  // assign header rows (null untuk kolom before offsetCol)
  worksheet.getRow(offsetRow + 1).values = Array(offsetCol - 1).fill(null).concat(headerRow1);
  worksheet.getRow(offsetRow + 2).values = Array(offsetCol - 1).fill(null).concat(headerRow2);

  // 🔹 Merge kolom header utama (Pegawai 2 kolom, Jumlah 4 kolom)
  worksheet.mergeCells(offsetRow + 1, offsetCol, offsetRow + 1, offsetCol + 1); // Pegawai (2 cols)
  worksheet.mergeCells(offsetRow + 1, offsetCol + 2, offsetRow + 1, offsetCol + 5); // Jumlah (4 cols)

  // Merge per tanggal (mulai setelah fixedCols)
  let runningCol = offsetCol + fixedColsCount; // offsetCol + 6
  tanggalArray.forEach((tgl) => {
    const isMinggu = isSunday(new Date(tgl));
    const colSpan = isMinggu ? 6 : 4;
    worksheet.mergeCells(offsetRow + 1, runningCol, offsetRow + 1, runningCol + colSpan - 1);
    runningCol += colSpan;
  });

  // 🔴 Pewarnaan kolom hari Minggu
  runningCol = offsetCol + fixedColsCount;
  tanggalArray.forEach((tgl) => {
    const isMinggu = isSunday(new Date(tgl));
    const colSpan = isMinggu ? 6 : 4;

    if (isMinggu) {
      const startCol = runningCol;
      const endCol = runningCol + colSpan - 1;
      const startRow = offsetRow + 1; // mulai dari header tanggal
      const endRow = offsetRow + 2 + jumlahKaryawan; // sampai data terakhir

      for (let c = startCol; c <= endCol; c++) {
        for (let r = startRow; r <= endRow; r++) {
          const cell = worksheet.getCell(r, c);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDC2626" },
          };
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        }
      }
    }

    runningCol += colSpan;
  });

  // 🟣 Data Pegawai (tulis column tetap dulu, lalu tambahkan per tanggal)
  filteredAbsenData.forEach((item, i) => {
    const rowIdx = offsetRow + 3 + i;
    const row = worksheet.getRow(rowIdx);

    // tulis kolom tetap (NIP..Lembur)
    row.values = Array(offsetCol - 1).fill(null).concat([
      item.nip ?? "",
      item.nama ?? "",
      item.total_days ?? "",
      item.total_alpha ?? "",
      item.total_late ?? "",
      item.total_overtime ?? "",
    ]);

    // tulis data per tanggal mulai dari kolIndex = offsetCol + fixedColsCount
    let colIndex = offsetCol + fixedColsCount;
    for (const tgl of tanggalArray) {
      const dateObj = new Date(tgl);
      const isMinggu = isSunday(dateObj);
      const att = item.attendance?.[tgl] || {};
      const isRemark = isRemarkDay(att);
      const remarkText = REMARK_LABEL[att.remark_status];
      const late = parseInt(att.late ?? 0, 10);
      const isLate = late > 0;
      const overtimeValue = att.overtime ?? item.overtimes?.[tgl]?.durasi;
      const overtimeStart = item.overtimes?.[tgl]?.mulai ?? "";
      const overtimeEnd = item.overtimes?.[tgl]?.selesai ?? "";

      const span = isMinggu ? 6 : 4;

      // REMARK DAY
      if (isRemark) {
        worksheet.mergeCells(rowIdx, colIndex, rowIdx, colIndex + 3);

        const cell = worksheet.getCell(rowIdx, colIndex);
        cell.value = remarkText;
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.font = { bold: true, size: 9, color: { argb: "FF0369A1" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0F2FE" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        colIndex += span;
        continue;
      }

      // NORMAL DAY
      const vals = isMinggu
        ? [att.in || "", isLate ? late : "", att.out || "", overtimeValue || "", overtimeStart || "", overtimeEnd || ""]
        : [att.in || "", isLate ? late : "", att.out || "", overtimeValue || ""];

      vals.forEach((val, j) => {
        const cell = worksheet.getCell(rowIdx, colIndex + j);
        cell.value = val;
        cell.alignment = { vertical: "middle", horizontal: "center" };

        if (isMinggu) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDC2626" } };
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        }

        if (isLate && j === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB91C1C" } };
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        }

        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      colIndex += span;
    }

  });

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < offsetRow) return;

    row.eachCell((cell, colNumber) => {
      // DEFAULT: SEMUA TENGAH
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      // EXCEPTION: KOLOM NAMA KARYAWAN
      if (colNumber === offsetCol + 1) {
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
      }

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      cell.font = { ...cell.font, size: 9 };
    });
  });


  // 💾 Simpan File
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const namaFile = `Rekap_Presensi_${formatLongDate(startDate)}_${formatLongDate(endDate)}.xlsx`;
  saveAs(blob, namaFile);
};
