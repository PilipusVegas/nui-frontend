import ExcelJS from "exceljs";
import Select from "react-select";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSort, faSortUp, faSortDown, faSortAlphaAsc, faSortAlphaDesc, faInfo, } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { SectionHeader, SearchBar, EmptyState, LoadingSpinner, ErrorState, Modal } from "../../components";
import { formatLongDate, formatFullDate, formatISODate } from "../../utils/dateUtils";

const RiwayatPenggajian = () => {
    const allowedRoles = [1, 4, 6];
    const navigate = useNavigate();
    const user = getUserFromToken();
    const [error, setError] = useState(null);
    const [sortKey, setSortKey] = useState(null);
    const [dataGaji, setDataGaji] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchName, setSearchName] = useState("");
    const [periodList, setPeriodList] = useState([]);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const canDownload = allowedRoles.includes(user?.id_role ?? 0);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    useEffect(() => {
        const loadPeriods = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/penggajian/periode`);
                const json = await res.json();

                if (json.data?.length > 1) {
                    const periodsExceptLast = json.data.slice(0, -1);
                    setPeriodList(periodsExceptLast);

                    const lastHistoryPeriod =
                        periodsExceptLast[periodsExceptLast.length - 1];
                    setSelectedPeriod(lastHistoryPeriod.id);
                } else {
                    setPeriodList(json.data || []);
                    setSelectedPeriod(json.data[0]?.id || "");
                }
            } catch (err) {
                setError(err.message);
            }
        };

        loadPeriods();
    }, [apiUrl]);

    const fetchGaji = async (periodeId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithJwt(`${apiUrl}/penggajian/${periodeId}`);
            if (!res.ok) throw new Error("Gagal memuat data gaji.");
            const json = await res.json();
            setDataGaji(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPeriod) fetchGaji(selectedPeriod);
    }, [apiUrl, selectedPeriod]);

    const filteredData = dataGaji.filter((item) =>
        item.nama.toLowerCase().includes(searchName.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortKey) return 0;
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (typeof valA === "string") {
            return sortOrder === "asc"
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }
        return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    const handleDownload = async () => {
        const selectedPeriodData = periodList.find((p) => p.id === selectedPeriod);
        if (!filteredData.length || !selectedPeriodData) return;
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Laporan Penggajian");
        const safeStartDate = formatLongDate(selectedPeriodData.tgl_awal).replace(/\s+/g, "_");
        const safeEndDate = formatLongDate(selectedPeriodData.tgl_akhir).replace(/\s+/g, "_");


        ws.mergeCells("B1:E1");
        ws.getCell("B1").value = "LAPORAN REKAPITULASI PENGGAJIAN KARYAWAN";
        ws.getCell("B1").font = { bold: true, size: 16 };
        ws.getCell("B1").alignment = { horizontal: "center", vertical: "middle" };

        ws.mergeCells("B2:E2");
        ws.getCell("B2").value = `Periode: ${safeStartDate} s/d ${safeEndDate}`;
        ws.getCell("B2").alignment = { horizontal: "center", vertical: "middle" };

        ws.mergeCells("B3:E3");
        ws.getCell("B3").value = `Jumlah Karyawan: ${filteredData.length}`;
        ws.getCell("B3").alignment = { horizontal: "center", vertical: "middle" };

        ws.addRow([]);
        ws.addRow([]);

        const dicetakRow = ws.addRow([]);
        ws.mergeCells(`B${dicetakRow.number}:E${dicetakRow.number}`);
        ws.getCell(`F${dicetakRow.number}`).value = `Dicetak pada: ${formatFullDate(new Date())}`;
        ws.getCell(`F${dicetakRow.number}`).alignment = {
            horizontal: "right",
            vertical: "middle",
        };

        ws.columns = [
            { key: "blank", width: 5 },
            { key: "nama", width: 30 },
            { key: "total_hari_kerja", width: 20 },
            { key: "total_alpha", width: 20 },
            { key: "total_keterlambatan_menit", width: 30 },
            { key: "total_lembur_jam", width: 20 },
        ];

        const headerRow = ws.addRow([
            "",
            "Nama Karyawan",
            "Total Hari Kerja",
            "Total Alpha",
            "Total Keterlambatan (menit)",
            "Total Lembur (jam)",
        ]);

        headerRow.eachCell((cell, colNumber) => {
            if (colNumber === 1) return;
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "228B22" },
            };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        filteredData.forEach((row) => {
            const newRow = ws.addRow({
                blank: "",
                nama: row.nama?.toUpperCase(),
                total_hari_kerja: row.total_hari_kerja,
                total_alpha: row.total_alpha,
                total_keterlambatan_menit: row.total_keterlambatan_menit,
                total_lembur_jam: row.total_lembur_jam,
            });

            newRow.eachCell((cell, colNumber) => {
                if (colNumber === 1) return;
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });

        const buffer = await wb.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            `Laporan_Penggajian_${safeStartDate}_s/d_${safeEndDate}.xlsx`
        );
    };

    return (
        <div className="flex flex-col">
            <SectionHeader title="Riwayat Penggajian" subtitle={`Menampilkan data penggajian ${filteredData.length} karyawan berdasarkan periode yang telah berlalu.`} onBack={() => navigate(-1)}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setShowInfo(true)} className="flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 gap-1">
                            <FontAwesomeIcon icon={faInfo} className="mr-0 sm:mr-1" />
                            <span className="hidden sm:inline">Informasi</span>
                        </button>

                        {canDownload && (
                            <button onClick={handleDownload} disabled={!filteredData.length} className={`flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-white ${!filteredData.length ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600"}`}>
                                <FontAwesomeIcon icon={faDownload} className="mr-0 sm:mr-1" />
                                <span className="hidden sm:inline">Unduh Excel</span>
                            </button>
                        )}
                    </div>
                }
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full mb-4">
                <div className="w-full sm:flex-1">
                    <SearchBar placeholder="Cari nama karyawan..." onSearch={setSearchName} />
                </div>
                <div>
                    <Select value={periodList.find((p) => p.id === selectedPeriod) || null} onChange={(option) => setSelectedPeriod(option.id)} isSearchable={false} options={periodList}
                        getOptionLabel={(p) =>
                            `Periode ${formatLongDate(p.tgl_awal)} s/d ${formatLongDate(
                                p.tgl_akhir
                            )}`
                        }
                        getOptionValue={(p) => p.id}
                        placeholder="Pilih Periode"
                        className="text-xs font-medium leading-tight"
                    />
                </div>
            </div>

            {loading && <LoadingSpinner />}
            {error && <ErrorState message={error} onRetry={() => fetchGaji(selectedPeriod)} />}
            {!loading && !error && !filteredData.length && (
                <EmptyState message="Belum ada riwayat penggajian pada periode ini." />
            )}

            {!loading && !error && filteredData.length > 0 && (
                <div className="overflow-x-auto border rounded-lg shadow bg-white">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-green-500 text-white text-sm">
                                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("nama")}>
                                    <div className="flex items-center justify-center gap-1">
                                        Nama Karyawan
                                        <FontAwesomeIcon icon={sortKey !== "nama" ? faSort : sortOrder === "asc" ? faSortAlphaAsc : faSortAlphaDesc} className="text-xs" />
                                    </div>
                                </th>
                                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("total_hari_kerja")}>
                                    <div className="flex items-center justify-center gap-1">
                                        Total Hari Kerja
                                        <FontAwesomeIcon icon={sortKey !== "total_hari_kerja" ? faSort : sortOrder === "asc" ? faSortDown : faSortUp} className="text-xs" />
                                    </div>
                                </th>
                                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("total_alpha")}>
                                    <div className="flex items-center justify-center gap-1">
                                        Total Alpha
                                        <FontAwesomeIcon icon={sortKey !== "total_alpha" ? faSort : sortOrder === "asc" ? faSortDown : faSortUp} className="text-xs" />
                                    </div>
                                </th>
                                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("total_keterlambatan_menit")}>
                                    <div className="flex items-center justify-center gap-1">
                                        Total Keterlambatan
                                        <FontAwesomeIcon icon={sortKey !== "total_keterlambatan_menit" ? faSort : sortOrder === "asc" ? faSortDown : faSortUp} className="text-xs" />
                                    </div>
                                </th>
                                <th className="px-3 py-2 cursor-pointer select-none text-center border-b" onClick={() => handleSort("total_lembur_jam")}>
                                    <div className="flex items-center justify-center gap-1">
                                        Total Lembur
                                        <FontAwesomeIcon icon={sortKey !== "total_lembur_jam" ? faSort : sortOrder === "asc" ? faSortDown : faSortUp} className="text-xs" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((item, i) => (
                                <tr key={i} className="odd:bg-gray-50 even:bg-white hover:bg-gray-100 text-xs font-medium tracking-wide border-b">
                                    <td className="px-3 py-2 font-medium hover:underline hover:cursor-pointer">
                                        <span onClick={() => {
                                            const selectedPeriodData = periodList.find(
                                                (p) => p.id === selectedPeriod
                                            );
                                            const startDate = selectedPeriodData?.tgl_awal;
                                            const endDate = selectedPeriodData?.tgl_akhir;

                                            const url = `/kelola-absensi/${item.id_user}?startDate=${formatISODate(
                                                startDate
                                            )}&endDate=${formatISODate(endDate)}`;
                                            window.open(url, "_blank");
                                        }}
                                        >
                                            {item.nama}
                                        </span>
                                    </td>

                                    <td className="px-3 py-2 text-center">
                                        {item.total_hari_kerja} Hari
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {item.total_alpha} Hari
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {item.total_keterlambatan_menit} Menit
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {item.total_lembur_jam} Jam
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="Informasi Riwayat Penggajian">
                <div className="text-sm leading-relaxed space-y-4">
                    <p> Halaman <strong>Riwayat Penggajian</strong> menampilkan data rekap gaji
                        karyawan berdasarkan <strong>periode-periode sebelumnya</strong>. Fitur ini
                        berguna untuk peninjauan, audit, dan dokumentasi historis.
                    </p>

                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <FontAwesomeIcon icon="calendar-alt" className="text-green-600 mt-0.5" />
                            <span>
                                <strong>Pilih Periode:</strong> Tentukan periode penggajian yang
                                ingin ditampilkan dari daftar yang tersedia.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <FontAwesomeIcon icon="search" className="text-blue-600 mt-0.5" />
                            <span>
                                <strong>Cari Nama:</strong> Temukan karyawan tertentu dengan cepat
                                tanpa menelusuri daftar panjang.
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <FontAwesomeIcon icon="file-excel" className="text-green-700 mt-0.5" />
                            <span>
                                <strong>Unduh Excel:</strong> Mengunduh laporan riwayat gaji untuk
                                keperluan arsip atau pelaporan resmi.
                            </span>
                        </li>
                    </ul>

                    <div className="space-y-1">
                        <p>
                            <FontAwesomeIcon icon="table" className="text-gray-600 mr-2" />
                            <strong>Tabel Riwayat:</strong> Menampilkan daftar karyawan dengan
                            kolom:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>
                                <strong>Nama Karyawan</strong> → Identitas karyawan.
                            </li>
                            <li>
                                <strong>Total Hari Kerja</strong> → Jumlah hari hadir pada periode
                                tersebut.
                            </li>
                            <li>
                                <strong>Total Keterlambatan</strong> → Akumulasi menit
                                keterlambatan.
                            </li>
                            <li>
                                <strong>Total Lembur</strong> → Total jam lembur tercatat.
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-1">
                        <p>
                            <FontAwesomeIcon icon={faSort} className="text-purple-600 mr-2" />
                            <strong>Fitur Pengurutan:</strong> Klik pada judul kolom untuk
                            mengurutkan data (A–Z, Z–A, kecil–besar, besar–kecil).
                        </p>
                    </div>

                    <p className="text-gray-700">
                        Dengan fitur ini, HRD dapat menelusuri riwayat penggajian dengan mudah dan
                        memastikan konsistensi data antarperiode.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default RiwayatPenggajian;
