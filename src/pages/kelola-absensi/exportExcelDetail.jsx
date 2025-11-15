// src/utils/exportExcelDetail.jsx
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
    formatTime,
    formatDateForFilename,
    formatFullDate,
} from "../../utils/dateUtils";

export const exportExcelDetail = async ({
    dataUser,
    attendance,
    dateRange,
    period,
    totalKehadiran,
    totalKeterlambatan,
    totalLembur,
    customStartDate,
    customEndDate,
}) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Rekap Presensi");

    // =====================================================================
    // HEADER RESMI — Rekap Presensi Formal
    // =====================================================================

    // TITLE besar
    sheet.mergeCells("A1:K1");
    const titleRow = sheet.getCell("A1");
    titleRow.value = "REKAPITULASI PRESENSI KARYAWAN";
    titleRow.font = { bold: true, size: 16 };
    titleRow.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 24;

    // SUBTITLE periode
    sheet.mergeCells("A2:K2");
    const periodRow = sheet.getCell("A2");
    periodRow.value = `Periode: ${period || "-"}`;
    periodRow.font = { bold: true, size: 13, color: { argb: "FF555555" } };
    periodRow.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(2).height = 20;

    // SPASI
    sheet.addRow([]);

    // DATA INFORMASI KARYAWAN — lebih rapih
    const infoBlock = [
        ["Nama", dataUser?.nama || "-"],
        ["NIP", dataUser?.nip || "-"],
        ["Divisi", dataUser?.role || "-"],
        ["Perusahaan", dataUser?.perusahaan || "-"],
        ["Total Hadir", `${totalKehadiran} Hari`],
        ["Total Terlambat", `${totalKeterlambatan}`],
        ["Total Lembur", `${totalLembur}`],
        ["Alpha (Tidak Masuk)", `${dataUser?.total_alpha ?? 0} Hari`],
        ["Lupa Absen Pulang", `${dataUser?.total_empty_out ?? 0} Hari`],
        ["Potongan", `Rp ${dataUser?.total_nominal_empty_out ?? 0}`],
    ];

    // =====================================================================
    // DATA INFORMASI KARYAWAN — merge, rapi, TANPA BORDER
    // =====================================================================

    const infoStartRow = sheet.lastRow.number + 1;

    infoBlock.forEach(([label, value], idx) => {
        const rowNumber = infoStartRow + idx;

        // Label (A–C)
        sheet.mergeCells(`A${rowNumber}:C${rowNumber}`);
        sheet.getCell(`A${rowNumber}`).value = label;
        sheet.getCell(`A${rowNumber}`).font = {
            bold: true,
            size: 12,
            color: { argb: "FF333333" },
        };
        sheet.getCell(`A${rowNumber}`).alignment = {
            horizontal: "left",
            vertical: "middle",
        };

        // Value (D–F)
        sheet.mergeCells(`D${rowNumber}:F${rowNumber}`);
        sheet.getCell(`D${rowNumber}`).value = value;
        sheet.getCell(`D${rowNumber}`).font = {
            size: 12,
            color: { argb: "FF333333" },
        };
        sheet.getCell(`D${rowNumber}`).alignment = {
            horizontal: "left",
            vertical: "middle",
        };

        // Tinggi baris agar lebih lega
        sheet.getRow(rowNumber).height = 20;
    });

    // SPASI setelah info
    sheet.addRow([]);

    const noteTitle = sheet.addRow(["Keterangan (Ringkas):"]);
    noteTitle.getCell(1).font = { bold: true, size: 11 };

    [
        "• Merah pada kolom 'Terlambat' menandakan keterlambatan hadir.",
        "• Seluruh baris berwarna merah menunjukkan Hari Minggu.",
        "• Merah pada kolom 'Pulang' berarti karyawan pulang lebih awal."
    ].forEach(text => {
        const row = sheet.addRow([text]);
        row.getCell(1).font = { size: 10, color: { argb: "FF444444" } };
        row.getCell(1).alignment = { horizontal: "left" };
    });

    sheet.addRow([]); // spasi tipis


    // =====================================================================
    // HEADER TABEL UTAMA — Lebih formal, ukuran lebih pas, tanggal lebih lebar
    // =====================================================================

    const header = [
        "No",
        "Tanggal",
        "Shift",
        "Masuk",
        "Terlambat",
        "Pulang",
        "Total Lembur",
        "Mulai Lembur",
        "Selesai Lembur",
        "Potongan",
        "Remark",
    ];

    const headerRow = sheet.addRow(header);

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF16A34A" },
        };
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
        cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
        };
        cell.border = {
            top: { style: "medium" },
            left: { style: "thin" },
            bottom: { style: "medium" },
            right: { style: "thin" },
        };
    });


    headerRow.height = 20;

    // =====================================================================
    // DATA TABEL
    // =====================================================================

    dateRange.forEach((tgl, i) => {
        const rec = attendance[tgl];
        const isSunday = new Date(tgl).getDay() === 0;
        const isLate = rec?.late >= 1;
        const isEarlyOut = rec?.is_early_out === true;

        const row = sheet.addRow([
            i + 1,
            formatFullDate(tgl),
            rec?.shift || "-",
            rec?.in ? formatTime(rec.in) : "-",
            typeof rec?.late === "number" ? rec.late : "-",
            rec?.out ? formatTime(rec.out) : "-",
            rec?.overtime ?? "-",
            rec?.overtime_start ?? "-",
            rec?.overtime_end ?? "-",
            rec?.nominal_empty_out ? `Rp ${rec.nominal_empty_out}` : "-",
            rec?.remark ?? "-",
        ]);

        row.eachCell((cell, col) => {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };

            // Hari Minggu → warna merah
            if (isSunday) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFDC2626" },
                };
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            }

            // Terlambat → highlight merah
            if (col === 5 && isLate && !isSunday) {
                cell.font = { bold: true, color: { argb: "FFFF0000" } }; // merah terang
            }

            // Pulang lebih awal → kuning
            if (col === 6 && isEarlyOut && !isSunday) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFCC0000" }
                };
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // teks putih
            }
        });

        row.height = 18;
    });

    // =====================================================================
    // LEBAR KOLOM — lebih proporsional & compact
    // =====================================================================

    sheet.getColumn(1).width = 6;  // No
    sheet.getColumn(2).width = 28; // Tanggal (lebih lebar)
    sheet.getColumn(3).width = 14; // Shift
    sheet.getColumn(4).width = 12; // Masuk
    sheet.getColumn(5).width = 18; // Terlambat
    sheet.getColumn(6).width = 12; // Pulang
    sheet.getColumn(7).width = 16; // Overtime
    sheet.getColumn(8).width = 16; // Mulai
    sheet.getColumn(9).width = 16; // Selesai
    sheet.getColumn(10).width = 16; // Potongan
    sheet.getColumn(11).width = 20; // Remark

    // =====================================================================
    // SIMPAN FILE
    // =====================================================================

    const buf = await workbook.xlsx.writeBuffer();
    saveAs(
        new Blob([buf]),
        `RekapPresensi_${dataUser?.nip || "User"}_${formatDateForFilename(
            customStartDate
        )}_${formatDateForFilename(customEndDate)}.xlsx`
    );
};
