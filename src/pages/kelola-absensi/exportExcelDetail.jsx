// src/utils/exportExcelDetail.jsx
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { formatTime, formatDateForFilename, formatFullDate } from "../../utils/dateUtils";

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

    const addRow = (vals, bold = false) => {
        const r = sheet.addRow(vals);
        r.eachCell((c) => {
            c.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },   
            };
            c.alignment = { horizontal: "left", vertical: "middle" };
            if (bold) c.font = { bold: true };
        });
    };

    sheet.addRow([]);
    sheet.addRow(["Nama", dataUser?.nama || ""]);
    sheet.addRow(["NIP", dataUser?.nip || ""]);
    sheet.addRow(["Divisi", dataUser?.role || ""]);
    sheet.addRow(["Periode", period || ""]);
    sheet.addRow(["Total Hari Hadir", `${totalKehadiran} Hari`]);
    sheet.addRow(["Total Terlambat", totalKeterlambatan || 0]);
    sheet.addRow(["Total Lembur", totalLembur || 0]);
    sheet.addRow([]);

    const header = [
        "No",
        "Tanggal",
        "Shift",
        "Masuk",
        "Terlambat (Menit)",
        "Pulang",
        "Total Jam Lembur",
        "Mulai Lembur",
        "Selesai Lembur",
        "Remark",
    ];
    const headerRow = sheet.addRow(header);

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF16A34A" },
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
    });

    dateRange.forEach((tgl, i) => {
        const rec = attendance[tgl];
        const isSunday = new Date(tgl).getDay() === 0;

        const row = sheet.addRow([
            i + 1,
            tgl,
            rec?.shift || "-",
            rec?.in ? formatTime(rec.in) : "-",
            typeof rec?.late === "number" ? rec.late : "-",
            rec?.out ? formatTime(rec.out) : "-",
            rec?.overtime ?? "-",
            rec?.overtime_start ?? "-",
            rec?.overtime_end ?? "-",
            rec?.remark ?? "-",
        ]);

        row.eachCell((cell) => {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };

            if (isSunday) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFDC2626" },
                };
                cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
            }
        });
    });

    // Atur lebar kolom otomatis
    sheet.columns.forEach((col, idx) => {
        let base = 12;
        if (idx === 7 || idx === 8) base = 16;
        if (idx === 9) base = 25;

        let max = base;
        col.eachCell?.((c) => {
            const len = c.value ? c.value.toString().length : 0;
            if (len > max) max = len;
        });
        col.width = Math.min(max + 2, 30);
    });

    // Simpan file
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(
        new Blob([buf]),
        `RekapPresensi_${dataUser?.nip || "User"}_${formatDateForFilename(
            customStartDate
        )}_${formatDateForFilename(customEndDate)}.xlsx`
    );
};
