import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
// import { exportRekapTunjangan } from "./exportExcel";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import {
    faFolderOpen,
    faFileDownload,
    faExpand,
    faRefresh,
    faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import {
    LoadingSpinner,
    SectionHeader,
    EmptyState,
    ErrorState,
    SearchBar,
    Modal,
} from "../../components/";
import { formatLongDate } from "../../utils/dateUtils";

const DataRekapTunjangan = () => {
    const Navigate = useNavigate();
    const user = getUserFromToken();
    const [error, setError] = useState(null);
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [sortKey, setSortKey] = useState("nama");
    const [dataTunjangan, setDataTunjangan] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [searchName, setSearchName] = useState("");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [sortOrder, setSortOrder] = useState("asc");
    const [hoveredRow, setHoveredRow] = useState(null);
    const [tanggalArray, setTanggalArray] = useState([]);
    const canDownloadHRD = [1, 4, 6].includes(user.id_role);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [isDateSelected, setIsDateSelected] = useState(false);

    const sortData = (data) => {
        return [...data].sort((a, b) => {
            let valA, valB;
            switch (sortKey) {
                default:
                    valA = (a.nama_user || "").toLowerCase();
                    valB = (b.nama_user || "").toLowerCase();
            }
            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    };

    const fetchTunjanganData = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        setError(null);
        try {
            const endpoint = `${apiUrl}/tunjangan/rekap?startDate=${startDate}&endDate=${endDate}`;
            const response = await fetchWithJwt(endpoint);
            if (!response.ok) throw new Error("Gagal mengambil data tunjangan.");
            const result = await response.json();

            // Ganti ini:
            // setTanggalArray(result.dateRange || []);
            setTanggalArray(result.date_range || []); // <-- sesuaikan dengan API terbaru

            setDataTunjangan(result.data || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setDataTunjangan([]);
            setTanggalArray([]);
        } finally {
            setLoading(false);
        }
    };


    const filteredTunjanganData = sortData(
        dataTunjangan
            .map((item) => ({
                ...item,
                nama_user: typeof item.nama_user === "string" ? item.nama_user : "-",
            }))
            .filter((item) => item.nama_user.toLowerCase().includes(searchName.toLowerCase()))
    );

    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    useEffect(() => {
        if (!startDate && !endDate) {
            const { start, end } = getDefaultPeriod();
            setStartDate(start);
            setEndDate(end);
        }
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            setIsDateSelected(true);
            fetchTunjanganData();
        }
    }, [startDate, endDate]);

    const dayMeta = (tanggal) => {
        const day = new Date(tanggal).getDay();
        const isSunday = day === 0;
        return {
            isSunday,
            dayName: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][day],
            bg: isSunday ? "bg-red-600" : "bg-green-500",
            border: isSunday ? "border-red-800" : "border-green-600",
        };
    };

    const handleFullView = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => console.error(err));
        } else {
            document.exitFullscreen().catch((err) => console.error(err));
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-start p-5">
            <SectionHeader
                title="Rekap Tunjangan Karyawan"
                subtitle="Monitoring tunjangan karyawan per hari."
                onBack={() => Navigate("/")}
                actions={
                    <div className="flex items-center gap-2">
                        {/* {canDownloadHRD && (
                            <button
                                onClick={() =>
                                    exportRekapTunjangan({ filteredTunjanganData, startDate, endDate, tanggalArray })
                                }
                                className={`flex items-center gap-2 h-10 px-4 font-semibold rounded-md shadow transition ${filteredTunjanganData.length === 0 || loading
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faFileDownload} />
                                <span className="hidden sm:inline">Unduh Excel</span>
                            </button>
                        )} */}

                        <button
                            onClick={handleFullView}
                            className="flex items-center gap-2 h-10 px-4 font-semibold rounded-md shadow bg-gray-500 hover:bg-gray-600 text-white transition"
                        >
                            <FontAwesomeIcon icon={faExpand} />
                            <span className="hidden sm:inline">Layar Penuh</span>
                        </button>

                        <button
                            onClick={fetchTunjanganData}
                            disabled={loading}
                            className={`flex items-center gap-2 h-10 px-4 font-semibold rounded-md shadow transition ${loading
                                ? "bg-sky-400 text-white cursor-not-allowed"
                                : "bg-sky-500 hover:bg-sky-600 text-white"
                                }`}
                        >
                            <FontAwesomeIcon icon={faRefresh} />
                            <span className="hidden sm:inline">{loading ? "Memperbarui..." : "Perbarui"}</span>
                        </button>

                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="flex items-center gap-2 h-10 px-4 font-semibold rounded-md shadow bg-blue-500 hover:bg-blue-600 text-white transition"
                        >
                            <FontAwesomeIcon icon={faCircleInfo} />
                            <span className="hidden sm:inline">Informasi</span>
                        </button>
                    </div>
                }
            />

            <div className="w-full flex flex-row flex-wrap items-center justify-between gap-4 mb-4">
                <SearchBar
                    placeholder="Cari Karyawan..."
                    className="flex-1 min-w-[200px]"
                    onSearch={(val) => setSearchName(val)}
                />
                <div className="flex items-center gap-1">
                    <input
                        type="date"
                        className="border-2 border-gray-300 rounded-md px-2 py-2.5 text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="mx-1 text-gray-600">s/d</span>
                    <input
                        type="date"
                        className="border-2 border-gray-300 rounded-md px-2 py-2.5 text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            {isDateSelected && !loading && !error && dataTunjangan.length > 0 && (
                <div className="w-full overflow-x-auto rounded-lg shadow-md border border-gray-300 bg-white">
                    <div className="min-w-full max-w-[30vw]">
                        <div className="flex w-full">
                            {/* Kolom Pegawai & Total */}
                            <div className="flex flex-col border-r bg-white shrink-0" style={{ borderRight: "1px solid #ccc" }}>
                                <table className="border-collapse w-full">
                                    <thead>
                                        <tr>
                                            <th colSpan={2} className="sticky top-0 z-10 bg-green-500 text-white border border-green-600 px-3 py-2.5 text-[14px] text-center min-w-[150px]">
                                                PEGAWAI
                                            </th>
                                            <th colSpan={1} className="sticky top-0 z-10 bg-green-500 text-white border border-green-600 px-3 py-2.5 text-[14px] text-center min-w-[80px]">
                                                JUMLAH
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-3 py-0.5 text-[11.5px] text-center min-w-[85px]">
                                                ID User
                                            </th>
                                            <th className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-3 py-0.5 text-[11.5px] text-center min-w-[150px]">
                                                NAMA KARYAWAN
                                            </th>
                                            <th
                                                onClick={() => toggleSort("kehadiran")}
                                                className="sticky top-[32px] z-10 bg-green-500 text-white border border-green-600 px-1.5 py-0.5 text-[11.5px] text-center min-w-[60px] cursor-pointer"
                                            >
                                                TOTAL
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTunjanganData.map((item, idx) => (
                                            <tr
                                                key={idx}
                                                onMouseEnter={() => setHoveredRow(idx)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                className={hoveredRow === idx ? "bg-gray-100" : ""}
                                            >
                                                <td className="border px-2 py-1 text-center text-xs">{item.id_user}</td>
                                                <td className="border px-2 py-1 text-xs font-semibold">{item.nama_user}</td>
                                                <td className="border px-2 py-1 text-center text-xs font-bold">
                                                    {Object.values(item.tunjangan).flat().reduce((sum, t) => sum + t.nominal, 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Kolom Tanggal */}
                            <div className="overflow-x-auto" style={{ flexGrow: 1 }}>
                                <table className="border-collapse w-full min-w-max bg-white">
                                    <thead>
                                        <tr>
                                            {tanggalArray.map((tgl) => {
                                                const m = dayMeta(tgl);
                                                return (
                                                    <th
                                                        key={tgl}
                                                        colSpan={3}
                                                        className={`sticky top-0 z-10 text-white ${m.bg} ${m.border} border px-2 py-0.5 text-center text-xs min-w-[120px]`}
                                                    >
                                                        {formatLongDate(tgl)}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                        <tr>
                                            {tanggalArray.map((tgl) => {
                                                const m = dayMeta(tgl);
                                                return (
                                                    <th
                                                        key={`hari-${tgl}`}
                                                        colSpan={3}
                                                        className={`sticky top-0 z-20 text-white ${m.bg} ${m.border} border px-2 py-0.5 text-center text-xs`}
                                                    >
                                                        {m.dayName}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                        <tr>
                                            {tanggalArray.map((tgl) => {
                                                const m = dayMeta(tgl);
                                                return ["Tunjangan", "Nominal", "Jam"].map((label) => (
                                                    <th
                                                        key={`${tgl}-${label}`}
                                                        className={`text-white ${m.bg} ${m.border} border px-1 py-0.5 text-[11.5px]`}
                                                    >
                                                        {label}
                                                    </th>
                                                ));
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTunjanganData.map((item, rowIdx) => (
                                            <tr
                                                key={rowIdx}
                                                onMouseEnter={() => setHoveredRow(rowIdx)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                                className={hoveredRow === rowIdx ? "bg-gray-100" : ""}
                                            >
                                                {tanggalArray.map((tgl) => {
                                                    const tunjanganHari = item.tunjangan[tgl] || [];
                                                    const m = dayMeta(tgl);
                                                    return (
                                                        <td key={tgl} className={`border px-2 py-1 text-xs ${m.isSunday ? "bg-red-600 text-white" : "bg-white"}`}>
                                                            {tunjanganHari.length > 0
                                                                ? tunjanganHari.map((t) => (
                                                                    <div key={t.id}>
                                                                        <span className="font-semibold">{t.tunjangan}:</span> {t.nominal.toLocaleString()}
                                                                        {t.jam_mulai ? ` (${t.jam_mulai})` : ""}
                                                                    </div>
                                                                ))
                                                                : "-"}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {showInfoModal && (
                <Modal
                    isOpen={showInfoModal}
                    title="Informasi Halaman"
                    note="Panduan singkat untuk memahami tombol dan label kolom."
                    onClose={() => setShowInfoModal(false)}
                >
                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faFileDownload} className="text-green-600" />
                            <span>
                                <b>Export Excel</b> – Unduh rekap tunjangan lengkap.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faExpand} className="text-yellow-500" />
                            <span>
                                <b>Fullscreen</b> – Perbesar tampilan tabel penuh layar.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faRefresh} className="text-blue-600" />
                            <span>
                                <b>Segarkan</b> – Muat ulang data sesuai rentang tanggal.
                            </span>
                        </div>
                        <hr className="my-2 border-gray-300" />

                        <p className="mt-2 text-xs text-gray-500">
                            Pastikan rentang tanggal sudah dipilih agar data ditampilkan lengkap.
                        </p>
                    </div>
                </Modal>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                    <LoadingSpinner message="Memuat data tunjangan..." />
                </div>
            )}

            {!loading && error && (
                <div className="flex flex-col items-center justify-center py-8">
                    <ErrorState
                        message={error}
                        onRetry={() => {
                            setLoading(true);
                            fetchTunjanganData();
                        }}
                    />
                </div>
            )}

            {!loading && !error && dataTunjangan.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                    <EmptyState
                        icon={faFolderOpen}
                        title="Data kosong"
                        subtitle="Silakan pilih rentang tanggal lain."
                    />
                </div>
            )}
        </div>
    );
};

export default DataRekapTunjangan;
