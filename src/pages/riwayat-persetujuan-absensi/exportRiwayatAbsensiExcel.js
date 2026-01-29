import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Export Riwayat Absensi ke Excel (Formal & Informatif)
 */
export const exportRiwayatAbsensiExcel = async ({
    data = [],
    nama = "",
    perusahaan = "",
    startDate = "",
    endDate = "",
}) => {
    if (!data.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Riwayat Absensi");

    /* ======================================================
     * HEADER INFORMASI (ATAS)
     * ====================================================== */
    worksheet.mergeCells("A1:H1");
    worksheet.getCell("A1").value = "LAPORAN RIWAYAT ABSENSI KARYAWAN";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    worksheet.mergeCells("A2:H2");
    worksheet.getCell("A2").value = perusahaan;
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    worksheet.addRow([]);
    worksheet.addRow(["Nama Karyawan", nama]);
    worksheet.addRow(["Periode", `${startDate} s/d ${endDate}`]);

    worksheet.addRow([]);

    /* ======================================================
     * HEADER TABEL
     * ====================================================== */
    const headerRow = worksheet.addRow([
        "Tanggal",
        "Shift",
        "Lokasi Mulai",
        "Lokasi Selesai",
        "Jam Masuk",
        "Keterlambatan (Menit)",
        "Jam Pulang",
        "Tunjangan",
        "Status",
    ]);

    headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF22C55E" }, // green-500
        };
        cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
    });

    /* ======================================================
     * ISI DATA
     * ====================================================== */
    data.forEach((a) => {
        const tunjangan = a.tunjangan || {};
        const tunjanganLabel = [
            tunjangan.transport ? "Transport" : null,
            tunjangan.night_shift ? "Shift Malam" : null,
            tunjangan.dinas ? "Dinas" : null,
        ]
            .filter(Boolean)
            .join(", ") || "-";

        const row = worksheet.addRow([
            new Date(a.jam_mulai),
            a.shift || "-",
            a.lokasi_mulai || "-",
            a.lokasi_selesai || "-",
            a.jam_mulai ? new Date(a.jam_mulai) : "-",
            a.keterlambatan ?? 0,
            a.jam_selesai ? new Date(a.jam_selesai) : "-",
            tunjanganLabel,
            a.status === 1 ? "Approved" : "Rejected",
        ]);

        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
            };

            if (colNumber === 1) {
                cell.numFmt = "dd mmmm yyyy";
            }

            if (colNumber === 5 || colNumber === 7) {
                cell.numFmt = "hh:mm";
                cell.alignment = { horizontal: "center" };
            }

            if (colNumber === 6) {
                cell.alignment = { horizontal: "center" };
            }

            if (colNumber === 9) {
                cell.font = {
                    bold: true,
                    color: {
                        argb: a.status === 1 ? "FF15803D" : "FFB91C1C",
                    },
                };
            }
        });
    });

    /* ======================================================
     * AUTO WIDTH
     * ====================================================== */
    worksheet.columns.forEach((col) => {
        let maxLength = 12;
        col.eachCell({ includeEmpty: true }, (cell) => {
            const length = cell.value ? cell.value.toString().length : 0;
            if (length > maxLength) maxLength = length;
        });
        col.width = maxLength + 2;
    });

    /* ======================================================
     * EXPORT FILE
     * ====================================================== */
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
        blob,
        `Riwayat_Absensi_${nama.replace(/\s+/g, "_")}_${startDate}_${endDate}.xlsx`
    );
};
