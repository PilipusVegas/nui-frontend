import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatFullDate, formatLongDate, isSunday } from "../../utils/dateUtils";
import { getUserFromToken } from "../../utils/jwtHelper";

export const exportRekapPresensi = async ({ filteredAbsenData, startDate, endDate, tanggalArray }) => {
    if (!filteredAbsenData.length) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Kelola Presensi");
    const offsetCol = 2;
    const offsetRow = 5;
    const tanggalColSpan = tanggalArray.length * 4;
    const totalCols = 3 + tanggalColSpan + 2;
    const jumlahKaryawan = filteredAbsenData.length;
    const summary1 = `Periode Rekapitulasi Presensi: ${formatFullDate(startDate)} - ${formatFullDate(endDate)}`;
    const summary2 = `Jumlah Karyawan: ${jumlahKaryawan} orang`;
    worksheet.mergeCells(2, offsetCol, 2, offsetCol + totalCols - 1);
    worksheet.getCell(2, offsetCol).value = summary1;
    worksheet.getCell(2, offsetCol).font = { bold: true, size: 16 };
    worksheet.getCell(2, offsetCol).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.mergeCells(3, offsetCol, 3, offsetCol + totalCols - 1);
    worksheet.getCell(3, offsetCol).value = summary2;
    worksheet.getCell(3, offsetCol).font = { size: 12 };
    worksheet.getCell(3, offsetCol).alignment = { vertical: "middle", horizontal: "left" };

    // 🔹 Info cetak
    const user = getUserFromToken();
    const printInfo = `File ini dicetak pada: ${formatFullDate(new Date())} | Dicetak oleh: ${user?.nama_user || "-"}`;
    worksheet.mergeCells(offsetRow - 1, offsetCol, offsetRow - 1, offsetCol + totalCols - 1);
    worksheet.getCell(offsetRow - 1, offsetCol).value = printInfo;
    worksheet.getCell(offsetRow - 1, offsetCol).font = { italic: true, size: 11 };
    worksheet.getCell(offsetRow - 1, offsetCol).alignment = { vertical: "middle", horizontal: "left" };

    // 🔵 Header
    const headerRow1 = ["Pegawai", "", "Jumlah", "", ""];
    const headerRow2 = ["NIP", "Nama Karyawan", "Kehadiran", "Keterlambatan", "Lemburan"];

    tanggalArray.forEach((tgl) => {
        const formattedDate = formatLongDate(tgl);
        headerRow1.push(formattedDate, "", "", "");
        headerRow2.push("IN", "LATE", "OUT", "T");
    });

    worksheet.getRow(offsetRow + 1).values = Array(offsetCol - 1).fill(null).concat(headerRow1);
    worksheet.getRow(offsetRow + 2).values = Array(offsetCol - 1).fill(null).concat(headerRow2);

    worksheet.getRow(offsetRow + 1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (colNumber === offsetCol + 1) { // Nama
            cell.alignment = { vertical: "middle", horizontal: "left" };
        } else {
            cell.alignment = { vertical: "middle", horizontal: "center" };
        }
    });
    worksheet.getRow(offsetRow + 2).eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (colNumber === offsetCol + 1) { // Nama
            cell.alignment = { vertical: "middle", horizontal: "left" };
        } else {
            cell.alignment = { vertical: "middle", horizontal: "center" };
        }
    });

    // Merge header cells
    worksheet.mergeCells(offsetRow + 1, offsetCol, offsetRow + 1, offsetCol + 1); // Pegawai
    worksheet.mergeCells(offsetRow + 1, offsetCol + 2, offsetRow + 1, offsetCol + 4); // Jumlah
    tanggalArray.forEach((_, i) => {
        const start = offsetCol + 5 + i * 4;
        worksheet.mergeCells(offsetRow + 1, start, offsetRow + 1, start + 3);
    });

    // 🔴 Pewarnaan kolom hari Minggu dari header hingga baris terakhir karyawan
    tanggalArray.forEach((tgl, index) => {
        if (!isSunday(tgl)) return;

        // posisi kolom tanggal pertama sekarang ada di offsetCol + 5
        const startCol = offsetCol + 5 + index * 4;
        const endCol = startCol + 3; // IN, LATE, OUT, OVERTIME
        const startRow = offsetRow + 1; // Header (baris pertama tanggal)
        const endRow = offsetRow + 3 + jumlahKaryawan - 1; // Baris terakhir data karyawan

        for (let col = startCol; col <= endCol; col++) {
            for (let row = startRow; row <= endRow; row++) {
                const cell = worksheet.getCell(row, col);
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFDC2626" }, // Merah solid
                };
                cell.font = {
                    color: { argb: "FFFFFFFF" },
                    bold: true,
                };
            }
        }
    });

    // 🟣 Data Pegawai
    filteredAbsenData.forEach((item, index) => {
        const currentRowIndex = offsetRow + 3 + index;
        const baseRow = [
            item.nip ?? "",
            item.nama,
            item.total_days ?? "",
            item.total_late ?? "",
            item.total_overtime ?? "",
        ];

        const excelRow = worksheet.getRow(currentRowIndex);
        excelRow.values = Array(offsetCol - 1).fill(null).concat(baseRow);

        // Alignment untuk baseRow: semua tengah kecuali Nama
        excelRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            if (colNumber === offsetCol + 1) { // Nama
                cell.alignment = { vertical: "middle", horizontal: "left" };
            } else {
                cell.alignment = { vertical: "middle", horizontal: "center" };
            }
        });

        let colIndex = offsetCol + 5;
        const isEmptyValue = (val) => val === null || val === undefined || val === "";
        tanggalArray.forEach((tgl) => {
            const att = item.attendance?.[tgl] || {};
            const overtimeValue = att.overtime ?? item.overtimes?.[tgl]?.durasi;
            const isMinggu = isSunday(tgl);
            const lateValue = parseInt(att.late ?? 0);
            const isLate = lateValue >= 1;

            const cellStyles = {
                minggu: {
                    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFDC2626" } },
                    font: { color: { argb: "FFFFFFFF" }, bold: true },
                },
                late: {
                    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFB91C1C" } },
                    font: { color: { argb: "FFFFFFFF" }, bold: true },
                },
            };

            const cellValues = [
                isEmptyValue(att.in) ? "" : att.in,
                (lateValue === 0 || isNaN(lateValue)) ? "" : lateValue.toString(),
                isEmptyValue(att.out) ? "" : att.out,
                overtimeValue ?? "",
            ];

            for (let i = 0; i < 4; i++) {
                const cell = worksheet.getCell(currentRowIndex, colIndex + i);
                cell.value = cellValues[i];

                // Alignment: semua tengah
                cell.alignment = { vertical: "middle", horizontal: "center" };

                if (cell.value === "") { cell.font = { color: { argb: "FF9CA3AF" }, italic: true }; }
                if (i === 1 && cell.value === "" && isMinggu) { cell.font = { color: { argb: "FFFFFFFF" }, bold: true }; }
                if (isMinggu) { Object.assign(cell, cellStyles.minggu); }
                if (i === 1 && isLate) { Object.assign(cell, cellStyles.late); }
            }
            colIndex += 4;
        });
    });


    // Lebar kolom
    worksheet.columns = Array(offsetCol - 1).fill({ width: 4 }).concat([
        { width: 10 }, // NIP
        { width: 28 }, // Nama
        { width: 10 }, // Kehadiran
        { width: 14 }, // Keterlambatan
        { width: 10 }, // Lemburan
        ...tanggalArray.flatMap(() => [
            { width: 6 }, { width: 6 }, { width: 6 }, { width: 6 }
        ])
    ]);

    // Border
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber < offsetRow) return;
        row.eachCell({ includeEmpty: false }, (cell) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
    });

    // 💾 Simpan file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const namaFile = `Rekap_Presensi_${formatLongDate(startDate)}_${formatLongDate(endDate)}.xlsx`;
    saveAs(blob, namaFile);
};