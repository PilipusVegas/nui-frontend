import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getDefaultPeriodWeek } from "../../utils/getDefaultPeriod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EditNominalTunjangan from "./editNominalTunjangan";
import { exportRekapTunjangan } from "./exportRekapTunjangan";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { faFolderOpen, faFileExcel, faCircleInfo, faCheckCircle, faExpandArrowsAlt, faMoneyBillWave, faSpinner, faRotateRight } from "@fortawesome/free-solid-svg-icons";
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
    const [hoveredData, setHoveredData] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
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
        setTooltipPos({ x: rect.x + rect.width / 2, y: rect.y - 10 }); 
        setHoveredData(data);
    };

    const handleMouseLeave = () => {
        setHoveredData(null);
    };
    console.log(user);
    return (
        <div className="min-h-screen flex flex-col justify-start p-5">
            <SectionHeader title="Rekap Tunjangan Karyawan" subtitle="Menampilkan Rekap Tunjangan Perminggu Secara Otomatis dan Sistematis." onBack={() => Navigate("/")}
                actions={
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => setShowEditNominal(true)} className="flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white transition-all duration-200">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                            <span className="hidden sm:inline">Nominal</span>
                        </button>

                        <button onClick={() => exportRekapTunjangan(dataTunjangan, tanggalArray, user.nama_user)} disabled={dataTunjangan.length === 0}
                            className={`flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md transition-all duration-200 ${dataTunjangan.length === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"}`}
                        >
                            <FontAwesomeIcon icon={faFileExcel} />
                            <span className="hidden sm:inline">
                                Download
                            </span>
                        </button>


                        <button onClick={handleFullView} className="flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white transition-all duration-200">
                            <FontAwesomeIcon icon={faExpandArrowsAlt} />
                            <span className="hidden sm:inline">Layar Penuh</span>
                        </button>

                        <button onClick={fetchTunjanganData} disabled={loading} className={`flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md transition-all duration-200 ${loading ? "bg-sky-400 cursor-not-allowed text-white" : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"}`}>
                            <FontAwesomeIcon icon={loading ? faSpinner : faRotateRight} spin={loading} />
                            <span className="hidden sm:inline">{loading ? "Memuat" : "Segarkan"}</span>
                        </button>

                        <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-2 h-9 px-3 text-sm font-medium rounded-md shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200">
                            <FontAwesomeIcon icon={faCircleInfo} />
                            <span className="hidden sm:inline">Informasi</span>
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
                <div className="w-full bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden relative">
                    <div className="flex w-full">

                        <div className="bg-white shrink-0 sticky left-0 z-30 border-r border-gray-300">
                            <table className="border-collapse w-full text-[13px]">
                                <thead>
                                    <tr>
                                        <th colSpan={2} className="sticky top-0 z-20 bg-green-500 text-white border px-4 py-2 text-[13px] text-center rounded-tl-lg">
                                            PEGAWAI
                                        </th>
                                        <th colSpan={4} className="sticky top-0 z-20 bg-green-500 text-white border px-4 py-2 text-[13px] text-center">
                                            JUMLAH
                                        </th>
                                    </tr>

                                    <tr>
                                        {["NIP", "Nama", "TKP", "TUM", "TSM", "Nominal"].map((header) => {
                                            let widthStyle = {};
                                            let textAlign = "text-center";

                                            if (header === "Nama") {
                                                widthStyle = { width: "220px" };
                                                textAlign = "text-left";
                                            } else if (header === "Nominal") {
                                                widthStyle = { width: "160px" };
                                                textAlign = "text-right";
                                            }

                                            return (
                                                <th key={header} className={`sticky top-[36px] z-10 bg-green-500 text-white border px-2 py-2 font-medium ${textAlign}`} style={widthStyle}>
                                                    {header.toUpperCase()}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredTunjanganData.map((item, idx) => (
                                        <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition-colors`}>
                                            <td className="border px-3 py-2 text-center text-gray-700">
                                                {item.nip}
                                            </td>
                                            <td className="border px-4 py-2 font-semibold text-gray-800 uppercase text-left text-xs">
                                                {item.nama_user}
                                            </td>
                                            <td className="border px-3 py-2 text-center text-gray-700">
                                                {item.total?.id_tunjangan_1 ?? "-"}
                                            </td>
                                            <td className="border px-3 py-2 text-center text-gray-700">
                                                {item.total?.id_tunjangan_2 ?? "-"}
                                            </td>
                                            <td className="border px-3 py-2 text-center text-gray-700">
                                                {item.total?.id_tunjangan_3 ?? "-"}
                                            </td>
                                            <td className="border px-4 py-2 text-right font-bold text-green-700 whitespace-nowrap">
                                                {item.total?.tunjangan ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, }).format(item.total.tunjangan) : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <div className="min-w-max inline-block align-top relative">
                                <table className="border-collapse whitespace-nowrap text-[13px]">
                                    <thead>
                                        <tr>
                                            {tanggalArray.map((tgl) => (
                                                <th key={tgl} colSpan={3} className="sticky top-0 z-20 bg-green-500 text-white border px-3 py-2 font-medium text-center">
                                                    {formatLongDate(tgl)}
                                                </th>
                                            ))}
                                        </tr>
                                        <tr>
                                            {tanggalArray.map((tgl) =>
                                                ["TKP", "TUM", "TSM"].map((label) => (
                                                    <th key={`${tgl}-${label}`} className="sticky top-[38px] z-20 bg-green-500 text-white border px-3 py-2 font-normal text-center">
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
                                                            <td key={`${tgl}-${id}`} className="border px-2 py-2 text-center relative hover:bg-green-50 transition" onMouseEnter={(e) => data && handleMouseEnter(e, data)} onMouseLeave={handleMouseLeave}>
                                                                {data ? (
                                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 cursor-pointer" />
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </td>
                                                        );
                                                    });
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* === TOOLTIP MODERN === */}
                    {hoveredData && (
                        <div className="fixed z-[99999] pointer-events-none"
                            style={{
                                left: tooltipPos.x,
                                top: tooltipPos.y - 14,
                                transform: "translate(-50%, -90%)",
                            }}
                        >
                            <div className="relative w-[240px] bg-white/95 backdrop-blur-md border border-green-200 rounded-xl shadow-2xl px-5 py-4 text-gray-800 text-[12.5px] transition-all duration-150">
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-green-200"></div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-semibold text-[13.5px] text-green-700 flex items-center gap-2 truncate">
                                        {hoveredData.tunjangan}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <div className="text-gray-500 text-[12px]">Nominal</div>
                                    <div className="font-semibold text-gray-900 text-[13px] truncate">
                                        Rp{hoveredData.nominal.toLocaleString("id-ID")}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <div className="text-gray-500 text-[11px]">Mulai</div>
                                        <div className="font-medium text-gray-800">
                                            {hoveredData.jam_mulai || "-"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-500 text-[11px]">Selesai</div>
                                        <div className="font-medium text-gray-800">
                                            {hoveredData.jam_selesai || "-"}
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-green-200 pt-2 text-right">
                                    <span className="text-gray-500 text-[11px]">
                                        {formatLongDate(hoveredData.tanggal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showInfoModal && (
                <Modal isOpen={showInfoModal} title="Informasi Halaman Rekap Tunjangan" note="Panduan lengkap untuk memahami aturan dan perolehan tunjangan karyawan." onClose={() => setShowInfoModal(false)}>
                    <div className="grid grid-cols-1 gap-4 text-sm text-gray-700 leading-relaxed">
                        <div>
                            <span className="font-bold text-green-700">TUM – Tunjangan Uang Makan</span>
                            <ul className="list-disc list-inside ml-2">
                                <li>Diberikan jika karyawan lembur minimal <b>5 jam</b> dalam satu hari.</li>
                                <li>Hanya berlaku untuk karyawan yang <b>bekerja di gerai</b> (kantor tidak termasuk).</li>
                                <li>Tidak berlaku kelipatan (maksimal 1 kali per hari).</li>
                            </ul>
                        </div>
                        <div>
                            <span className="font-bold text-red-600">TSM – Tunjangan Shift Malam</span>
                            <ul className="list-disc list-inside ml-2">
                                <li>Diberikan kepada karyawan <b>shift malam di gerai</b>.</li>
                                <li>Berlaku hanya untuk divisi: <b>Teknisi Installer</b>, <b>Helper</b>, <b>Supir</b>, dan <b>Operasional</b>.</li>
                            </ul>
                        </div>
                        <div>
                            <span className="font-bold text-indigo-700">TKP – Tunjangan Kendaraan Pribadi</span>
                            <ul className="list-disc list-inside ml-2">
                                <li>Diberikan jika karyawan <b>menggunakan kendaraan pribadi</b> saat <b>shift malam di gerai</b>.</li>
                                <li>Berlaku untuk divisi: <b>Installer</b>, <b>Helper</b>, <b>Supir</b>, dan <b>Operasional</b>.</li>
                                <li><b>Tidak diberikan</b> jika menggunakan kendaraan kantor.</li>
                            </ul>
                        </div>
                        <hr className="my-2 border-gray-300" />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">🗓️ Rekap Otomatis Mingguan</h3>
                            <p>
                                Rekapitulasi tunjangan dihitung secara otomatis <b>setiap 7 hari</b>,
                                dimulai dari <b>hari Senin hingga Minggu</b>.
                            </p>
                        </div>
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
