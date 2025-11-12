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
    const jumlahKaryawan = filteredAbsenData.length;

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

    // 🔵 Header Utama
    const headerRow1 = ["Pegawai", "", "Jumlah", "", ""];
    const headerRow2 = ["NIP", "Nama Karyawan", "Hadir", "Telat", "Lembur"];

    tanggalArray.forEach((tgl) => {
        const formattedDate = formatLongDate(tgl);
        const isMinggu = isSunday(tgl);
        headerRow1.push(formattedDate, "", "", "", ...(isMinggu ? ["", ""] : []));
        headerRow2.push("IN", "LATE", "OUT", "T", ...(isMinggu ? ["LM", "LP"] : []));
    });

    worksheet.getRow(offsetRow + 1).values = Array(offsetCol - 1).fill(null).concat(headerRow1);
    worksheet.getRow(offsetRow + 2).values = Array(offsetCol - 1).fill(null).concat(headerRow2);

    // 🔹 Merge kolom header utama
    worksheet.mergeCells(offsetRow + 1, offsetCol, offsetRow + 1, offsetCol + 1); // Pegawai
    worksheet.mergeCells(offsetRow + 1, offsetCol + 2, offsetRow + 1, offsetCol + 4); // Jumlah

    // Merge per tanggal
    let runningCol = offsetCol + 5;
    tanggalArray.forEach((tgl) => {
        const isMinggu = isSunday(tgl);
        const colSpan = isMinggu ? 6 : 4;
        worksheet.mergeCells(offsetRow + 1, runningCol, offsetRow + 1, runningCol + colSpan - 1);
        runningCol += colSpan;
    });

    // 🔴 Pewarnaan kolom hari Minggu
    runningCol = offsetCol + 5;
    tanggalArray.forEach((tgl) => {
        const isMinggu = isSunday(tgl);
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

    // 🟣 Data Pegawai
    filteredAbsenData.forEach((item, i) => {
        const rowIdx = offsetRow + 3 + i;
        const row = worksheet.getRow(rowIdx);

        row.values = Array(offsetCol - 1).fill(null).concat([
            item.nip ?? "",
            item.nama,
            item.total_days ?? "",
            item.total_late ?? "",
            item.total_overtime ?? "",
        ]);

        let colIndex = offsetCol + 5;

        tanggalArray.forEach((tgl) => {
            const isMinggu = isSunday(tgl);
            const att = item.attendance?.[tgl] || {};
            const late = parseInt(att.late ?? 0);
            const isLate = late > 0;
            const overtimeValue = att.overtime ?? item.overtimes?.[tgl]?.durasi;
            const overtimeStart = item.overtimes?.[tgl]?.mulai;
            const overtimeEnd = item.overtimes?.[tgl]?.selesai;

            const vals = isMinggu
                ? [att.in || "", isLate ? late : "", att.out || "", overtimeValue || "", overtimeStart || "", overtimeEnd || ""]
                : [att.in || "", isLate ? late : "", att.out || "", overtimeValue || ""];

            vals.forEach((val, j) => {
                const cell = worksheet.getCell(rowIdx, colIndex + j);
                cell.value = val;
                cell.alignment = { vertical: "middle", horizontal: "center" };

                // Jika hari Minggu → latar merah, teks putih tebal
                if (isMinggu) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFDC2626" }, // Merah terang
                    };
                    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
                }

                // Jika telat → tetap warna khusus telat (prioritas)
                if (isLate && j === 1) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFB91C1C" }, // Merah tua untuk telat
                    };
                    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
                }

                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
            colIndex += isMinggu ? 6 : 4;
        });
    });

    // 🔹 Lebar kolom
    worksheet.columns = Array(offsetCol - 1).fill({ width: 4 }).concat([
        { width: 10 },
        { width: 26 },
        { width: 8 },
        { width: 8 },
        { width: 8 },
        ...tanggalArray.flatMap((tgl) => (isSunday(tgl)
            ? Array(6).fill({ width: 6 })
            : Array(4).fill({ width: 6 })
        )),
    ]);

    // 🔹 Border dan Font
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber < offsetRow) return;
        row.eachCell((cell) => {
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