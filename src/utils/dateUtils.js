// utils/dateUtils.js
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";
import { id } from "date-fns/locale";

/* Default Patterns */
export const PATTERNS = {
    DATE: "dd-MM-yyyy",
    DATETIME: "dd-MM-yyyy HH:mm",
    TIME: "HH:mm",
    FULL: "EEEE, dd MMMM yyyy",          // "Kamis, 11 September 2025"
    SHORT_DATE: "dd/MM/yy",              // "11/09/25"
    SHORT_DATETIME: "dd/MM/yy HH:mm",    // "11/09/25 15:42"
    ISO_DATE: "yyyy-MM-dd",              // "2025-09-11"
    ISO_DATETIME: "yyyy-MM-dd'T'HH:mm",  // "2025-09-11T15:42"
    DB: "yyyy-MM-dd HH:mm:ss",           // "2025-09-11 15:42:00"
    MONTH_YEAR: "MMMM yyyy",             // "September 2025"
    SHORT_MONTH_YEAR: "MMM yy",          // "Sep 25"
    DAY: "EEEE",                         // "Kamis"
};


/* ================== Core Formatter ================== */
// formatDate(date, pattern)
//  - Mengembalikan string sesuai pattern di atas, default DATE.
//  - Jika date null/invalid -> "-"
export function formatDate(date, pattern = PATTERNS.DATE) {
    if (!date) return "-";
    try {
        return format(new Date(date), pattern, { locale: id });
    } catch {
        return "-";
    }
}


/* Variasi Umum */
export const formatDateTime = (date) => formatDate(date, PATTERNS.DATETIME);
export const formatTime = (date) => formatDate(date, PATTERNS.TIME);
export const formatFullDate = (date) => formatDate(date, PATTERNS.FULL);
export const formatMonthYear = (date) => formatDate(date, PATTERNS.MONTH_YEAR);
export const formatDay = (date) => formatDate(date, PATTERNS.DAY);
export const formatShortDate = (date) => formatDate(date, PATTERNS.SHORT_DATE);
export const formatShortDateTime = (date) => formatDate(date, PATTERNS.SHORT_DATETIME);
export const formatISODate = (date) => formatDate(date, PATTERNS.ISO_DATE);
export const formatISODateTime = (date) => formatDate(date, PATTERNS.ISO_DATETIME);
export const formatForDB = (date) => formatDate(date, PATTERNS.DB);

/* ================== Relative Time ================== */
// Contoh: formatRelative("2025-09-11T14:00")
//   jika hari ini -> "Hari ini"
//   jika kemarin -> "Kemarin"
//   lain-lain   -> "3 hari yang lalu" (auto bahasa Indonesia)
export function formatRelative(date) {
    if (!date) return "-";
    const d = new Date(date);
    if (isToday(d)) return "Hari ini";
    if (isYesterday(d)) return "Kemarin";
    return formatDistanceToNow(d, { addSuffix: true, locale: id });
}


/* ================== Helper ================== */
export const fromTimestamp = (ts) =>
    // Ubah UNIX timestamp (detik) -> "dd-MM-yyyy HH:mm"
    formatDate(new Date(ts * 1000), PATTERNS.DATETIME);

export const parseISODate = (str) => {
    // Mengubah "2025-09-11T15:42:00Z" -> Date object
    try {
        return parseISO(str);
    } catch {
        return null;
    }
};

export const isSunday = (date) => formatDay(date) === "Minggu";


/* ================== Formatter Khusus Bisnis ================== */
// formatOvertimeJamBulat(totalMenit)
//   - Jika lembur < 60 menit -> "" (kosong, tak ditampilkan)
//   - >= 60 menit -> bulatkan ke jam penuh, format "HH:00"
//   - contoh totalMenit = 125 -> "02:00"
export function formatOvertimeJamBulat(totalMenit) {
    const menit = parseInt(totalMenit, 10);
    if (isNaN(menit) || menit < 60) return "";
    const jam = Math.floor(menit / 60);
    return `${jam.toString().padStart(2, "0")}:00`;
}

export const formatDateForFilename = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
};
