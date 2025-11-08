import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getDefaultPeriodWeek } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EditNominalTunjangan from "./editNominalTunjangan";
import { exportRekapTunjangan } from "./exportRekapTunjangan";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { faFolderOpen, faFileExcel, faExpand, faRefresh, faCircleInfo, faCheckCircle, faExpandArrowsAlt, faMoneyBillWave, faSpinner, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { LoadingSpinner, SectionHeader, EmptyState, ErrorState, SearchBar, Modal } from "../../components";
import { formatLongDate } from "../../utils/dateUtils";

const DataRekapTunjangan = () => {
    const Navigate = useNavigate();
    const user = getUserFromToken();
    const [error, setError] = useState(null);
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [dataTunjangan, setDataTunjangan] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [searchName, setSearchName] = useState("");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [hoveredData, setHoveredData] = useState(null); // simpan data saat hover
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 }); // posisi tooltip
    const [tanggalArray, setTanggalArray] = useState([]);
    const canDownloadHRD = [1, 4, 6].includes(user.id_role);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [isDateSelected, setIsDateSelected] = useState(false);
    const [showEditNominal, setShowEditNominal] = useState(false);

    const fetchTunjanganData = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        setError(null);
        try {
            const endpoint = `${apiUrl}/tunjangan/rekap?startDate=${startDate}&endDate=${endDate}`;
            const response = await fetchWithJwt(endpoint);
            if (!response.ok) throw new Error("Gagal mengambil data tunjangan.");
            const result = await response.json();

            setTanggalArray(result.date_range || []);
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

    const filteredTunjanganData = dataTunjangan
        .map((item) => ({
            ...item,
            nama_user: typeof item.nama_user === "string" ? item.nama_user : "-",
        }))
        .filter((item) =>
            item.nama_user.toLowerCase().includes(searchName.toLowerCase())
        );

    useEffect(() => {
        if (!startDate && !endDate) {
            const { start, end } = getDefaultPeriodWeek();
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

    const handleFullView = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => console.error(err));
        } else {
            document.exitFullscreen().catch((err) => console.error(err));
        }
    };

    const handleMouseEnter = (e, data) => {
        const rect = e.target.getBoundingClientRect();
        setTooltipPos({ x: rect.x + rect.width / 2, y: rect.y - 10 }); // posisi di atas cell
        setHoveredData(data);
    };

    const handleMouseLeave = () => {
        setHoveredData(null);
    };

    return (
        <div className="min-h-screen flex flex-col justify-start p-5">
            <SectionHeader title="Rekap Tunjangan Karyawan" subtitle="Menampilkan Rekap Tunjangan Perminggu Secara Otomatis dan Sistematis." onBack={() => Navigate("/")}

                actions={
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => setShowEditNominal(true)} className="flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white transition-all duration-200">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                            <span className="hidden sm:inline">Nominal</span>
                        </button>

                        <button onClick={() => exportRekapTunjangan(dataTunjangan, tanggalArray)} className="flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200">
                            <FontAwesomeIcon icon={faFileExcel} />
                            <span className="hidden sm:inline">Download</span>
                        </button>

                        <button onClick={handleFullView} className="flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white transition-all duration-200">
                            <FontAwesomeIcon icon={faExpandArrowsAlt} />
                            <span className="hidden sm:inline">Layar Penuh</span>
                        </button>

                        <button onClick={fetchTunjanganData} disabled={loading} className={`flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md transition-all duration-200 ${loading ? "bg-sky-400 cursor-not-allowed text-white" : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"}`}>
                            <FontAwesomeIcon icon={loading ? faSpinner : faRotateRight} spin={loading} />
                            <span className="hidden sm:inline">{loading ? "..." : "Refresh"}</span>
                        </button>

                        <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200">
                            <FontAwesomeIcon icon={faCircleInfo} />
                            <span className="hidden sm:inline">Info</span>
                        </button>
                    </div>
                }
            />

            <div className="w-full flex flex-row flex-wrap items-center justify-between gap-4 mb-4">
                <SearchBar placeholder="Cari Karyawan..." className="flex-1 min-w-[200px]" onSearch={(val) => setSearchName(val)} />
                <div className="flex items-center gap-1">
                    <input type="date" className="border-2 border-gray-300 rounded-md px-2 py-2.5 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <span className="mx-1 text-gray-600">s/d</span>
                    <input type="date" className="border-2 border-gray-300 rounded-md px-2 py-2.5 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
            </div>

            {isDateSelected && !loading && !error && dataTunjangan.length > 0 && (
                <div className="w-full shadow-md bg-white">
                    <div className="flex min-w-full relative">
                        {/* Bagian Kiri */}
                        <div className="flex flex-col bg-white shrink-0 sticky left-0 z-30 border-r" style={{ minWidth: "520px" }}>
                            <table className="border-collapse w-full min-w-max border border-gray-300">
                                <thead>
                                    <tr>
                                        <th colSpan={2} className="sticky top-0 z-20 bg-green-500 text-white border px-4 py-2 text-[14px] text-center rounded-tl-lg">
                                            PEGAWAI
                                        </th>
                                        <th colSpan={4} className="sticky top-0 z-20 bg-green-500 text-white border px-4 py-2 text-[14px] text-center">
                                            JUMLAH
                                        </th>
                                    </tr>
                                    <tr>
                                        {["NIP", "Nama", "TUM", "TSM", "TKP", "NOMINAL"].map((header) => {
                                            let minWidth = "80px"; // default untuk kolom kecil
                                            if (header === "Nama") minWidth = "200px"; // kolom Nama lebar
                                            if (header === "NOMINAL") minWidth = "150px"; // kolom Nominal lebar
                                            return (
                                                <th key={header} className="sticky top-[36px] z-20 bg-green-500 text-white border px-3 py-2 text-[13px] text-center" style={{ minWidth }}>
                                                    {header}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTunjanganData.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="border px-3 py-2 text-center text-[13px]">{item.nip}</td>
                                            <td className="border px-4 py-2 text-[13px] font-semibold uppercase">{item.nama_user}</td>
                                            <td className="border px-3 py-2 text-center text-[13px]">{item.total?.id_tunjangan_1 ?? "-"}</td>
                                            <td className="border px-3 py-2 text-center text-[13px]">{item.total?.id_tunjangan_2 ?? "-"}</td>
                                            <td className="border px-3 py-2 text-center text-[13px]">{item.total?.id_tunjangan_3 ?? "-"}</td>
                                            <td className="border px-4 py-2 text-center text-[13px] font-bold">
                                                {item.total?.tunjangan
                                                    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.total.tunjangan)
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>

                        {/* Bagian Kanan */}
                        <div className="flex-1 overflow-x-auto rounded-tr-lg">
                            <div className="inline-block min-w-full align-top">
                                <table className="table-fixed w-full border-collapse">
                                    <thead>
                                        <tr>
                                            {tanggalArray.map((tgl) => (
                                                <th
                                                    key={tgl}
                                                    colSpan={3}
                                                    className="sticky top-0 z-10 bg-green-500 text-white border px-2 py-2 text-[13px] font-medium text-center"
                                                    style={{ width: `${100 / 7}%` }} // 7 hari full
                                                >
                                                    {formatLongDate(tgl)}
                                                </th>
                                            ))}
                                        </tr>
                                        <tr>
                                            {tanggalArray.map((tgl) =>
                                                ["TKP", "TUM", "TSM"].map((label, idx) => (
                                                    <th
                                                        key={`${tgl}-${label}`}
                                                        className="sticky tracking-widest top-[38px] z-20 bg-green-500 text-white border px-1 py-2 text-[13px] font-normal text-center"
                                                        style={{ width: `calc(${100 / 7}% / 3)` }} // 3 subkolom tiap hari
                                                    >
                                                        {label}
                                                    </th>
                                                ))
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTunjanganData.map((item, rowIdx) => (
                                            <tr key={rowIdx}>
                                                {tanggalArray.map((tgl) => {
                                                    const tunjanganHari = item.tunjangan[tgl] || [];
                                                    const typeIds = [1, 2, 3];
                                                    return typeIds.map((id) => {
                                                        const data = tunjanganHari.find((t) => t.id === id);
                                                        return (
                                                            <td
                                                                key={`${tgl}-${id}`}
                                                                className="border px-1 py-2 text-center text-[13px] relative"
                                                                onMouseEnter={(e) => data && handleMouseEnter(e, data)}
                                                                onMouseLeave={handleMouseLeave}
                                                            >
                                                                {data ? <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 cursor-pointer" /> : "-"}
                                                            </td>
                                                        );
                                                    });
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Tooltip */}
                                {hoveredData && (
                                    <div className="absolute z-50 bg-white text-gray-800 text-[12px] rounded-lg px-3 py-3 shadow-lg border border-gray-300 pointer-events-none transition-all duration-150"
                                        style={{ left: tooltipPos.x, top: tooltipPos.y, transform: "translate(-60%, -85%)" }}
                                    >
                                        <div className="font-semibold text-gray-900">{hoveredData.tunjangan}</div>
                                        <div>Nominal: <span className="font-medium text-gray-900">Rp{hoveredData.nominal.toLocaleString()}</span></div>
                                        <div>Mulai: {hoveredData.jam_mulai || "-"}</div>
                                        <div>Selesai: {hoveredData.jam_selesai || "-"}</div>
                                        <div className="text-gray-500 text-right text-[12px] mt-1">{formatLongDate(hoveredData.tanggal)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Info */}
            {showInfoModal && (
                <Modal isOpen={showInfoModal} title="Informasi Halaman Rekap Tunjangan" note="Panduan singkat untuk memahami tombol dan label kolom." onClose={() => setShowInfoModal(false)}>
                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faFileExcel} className="text-green-600" />
                            <span><b>Export Excel</b> – Unduh rekap tunjangan lengkap.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faExpand} className="text-yellow-500" />
                            <span><b>Fullscreen</b> – Perbesar tampilan tabel penuh layar.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faRefresh} className="text-blue-600" />
                            <span><b>Segarkan</b> – Muat ulang data sesuai rentang tanggal.</span>
                        </div>
                        <hr className="my-2 border-gray-300" />
                        <div className="grid grid-cols-[50px_auto] gap-y-2 text-sm">
                            <span className="font-bold text-green-700">TUM</span>
                            <span>Tunjangan Uang Makan</span>
                            <span className="font-bold text-red-600">TSM</span>
                            <span>Tunjangan Shift Malam</span>
                            <span className="font-bold text-indigo-700">TKP</span>
                            <span>Tunjangan Kendaraan Pribadi</span>
                        </div>
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
                    <ErrorState message={error} onRetry={() => { setLoading(true); fetchTunjanganData(); }} />
                </div>
            )}
            {!loading && !error && dataTunjangan.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                    <EmptyState icon={faFolderOpen} title="Data kosong" subtitle="Silakan pilih rentang tanggal lain." />
                </div>
            )}

            <EditNominalTunjangan isOpen={showEditNominal} onClose={() => setShowEditNominal(false)} />
        </div>
    );
};

export default DataRekapTunjangan;
