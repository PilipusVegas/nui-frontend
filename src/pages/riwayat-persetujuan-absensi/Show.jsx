import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import SectionHeader from "../../components/desktop/SectionHeader";
import { exportRiwayatAbsensiExcel } from "./exportRiwayatAbsensiExcel";
import { LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../components";
import { formatFullDate, formatLongDate, formatTime, toLocalISODate } from "../../utils/dateUtils";
import { faCheckCircle, faXmarkCircle, faGasPump, faHotel, faBriefcase, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import toast from "react-hot-toast";


const RiwayatPersetujuanDetail = () => {
    const { id_user } = useParams();
    const [params] = useSearchParams();
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [data, setData] = useState({ absen: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [periodeList, setPeriodeList] = useState([]);
    const [selectedPeriode, setSelectedPeriode] = useState(null);
    const [localStartDate, setLocalStartDate] = useState(startDate || "");
    const [localEndDate, setLocalEndDate] = useState(endDate || "");
    const [exporting, setExporting] = useState(false);


    const fetchDetail = async (start, end) => {
        if (typeof start !== "string" || typeof end !== "string") {
            console.warn("Invalid date params:", start, end);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetchWithJwt(
                `${apiUrl}/absen/riwayat/${id_user}?startDate=${start}&endDate=${end}`
            );

            if (res.status === 404) {
                setData({ absen: [] });
                return;
            }

            if (!res.ok) {
                throw new Error("Gagal memuat detail absensi");
            }

            const json = await res.json();
            setData(json.data);
        } catch (err) {
            setError(err.message);
            setData({ absen: [] });
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!startDate || !endDate || !id_user) return;
        fetchDetail(startDate, endDate);
    }, [startDate, endDate, id_user]);

    useEffect(() => {
        if (startDate) setLocalStartDate(startDate);
        if (endDate) setLocalEndDate(endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (!selectedPeriode && startDate && endDate) {
            setLocalStartDate(startDate);
            setLocalEndDate(endDate);
        }
    }, [startDate, endDate, selectedPeriode]);


    const fetchPeriode = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/penggajian/periode`);
            if (!res.ok) throw new Error("Gagal memuat periode");
            const json = await res.json();
            const today = new Date();
            const nonActive = json.data.filter((p) => {
                const start = new Date(p.tgl_awal);
                const end = new Date(p.tgl_akhir);
                return !(today >= start && today <= end);
            });
            const lastThree = nonActive.slice(-3);
            setPeriodeList(lastThree);
            if (!startDate || !endDate) return;
            const matched = lastThree.find(
                (p) =>
                    toLocalISODate(p.tgl_awal) === startDate &&
                    toLocalISODate(p.tgl_akhir) === endDate
            );
            setSelectedPeriode(matched || null);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPeriode();
        // eslint-disable-next-line
    }, []);


    const filteredAbsen = data.absen.filter(
        (a) =>
            a.shift.toLowerCase().includes(search.toLowerCase()) ||
            a.lokasi_mulai.toLowerCase().includes(search.toLowerCase()) ||
            a.lokasi_selesai.toLowerCase().includes(search.toLowerCase())
    );

    const renderNA = (value) => {
        if (!value) {
            return <span className="text-gray-400 italic">N/A</span>;
        }
        return value;
    };

    const renderTime = (value) => {
        if (!value) {
            return <span className="text-gray-400 italic">N/A</span>;
        }
        return formatTime(value);
    };

    const handleExportExcel = async () => {
        if (!startDate || !endDate || exporting) return;

        try {
            setExporting(true);

            await exportRiwayatAbsensiExcel({
                data: filteredAbsen,
                nama: data.nama,
                perusahaan: data.perusahaan,
                startDate,
                endDate,
            });
        } finally {
            setExporting(false);
        }
    };


    const validateDateRange = (start, end) => {
        if (!start || !end) {
            toast("Start Date dan End Date wajib diisi");
            return false;
        }
        if (start === end) {
            toast.error("Start Date dan End Date tidak boleh sama");
            return false;
        }
        if (end < start) {
            toast.error("End Date tidak boleh lebih kecil dari Start Date");
            return false;
        }
        return true;
    };

    const isDataEmpty =
        !data ||
        !Array.isArray(data.absen) ||
        data.absen.length === 0;


    return (
        <div className="flex flex-col gap-4">
            <SectionHeader
                title="Detail Riwayat Persetujuan Absensi"
                subtitle="Detail Riwayat Persetujuan Absensi Karyawan Lapangan."
                onBack={() => navigate("/riwayat-persetujuan-absensi")}
                actions={
                    <button
                        onClick={handleExportExcel}
                        disabled={
                            exporting ||
                            loading ||
                            !startDate ||
                            !endDate ||
                            isDataEmpty
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-semibold
            ${exporting ||
                                loading ||
                                !startDate ||
                                !endDate ||
                                isDataEmpty
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                    >
                        {exporting ? "Menyiapkan Excel..." : "Export Excel"}
                    </button>
                }
            />

            <div className="shadow-sm flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="w-full sm:flex-1">
                    <SearchBar placeholder="Cari shift atau lokasi..." onSearch={(val) => setSearch(val)} />
                </div>

                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">
                            Start Date
                        </label>
                        <input type="date" value={localStartDate} onChange={(e) => setLocalStartDate(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-700">
                            End Date
                        </label>
                        <input type="date" value={localEndDate} min={localStartDate || undefined} onChange={(e) => setLocalEndDate(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>

                    <button
                        onClick={() => {
                            if (!validateDateRange(localStartDate, localEndDate)) return;

                            setSelectedPeriode(null);

                            navigate(
                                `/riwayat-persetujuan-absensi/${id_user}?startDate=${localStartDate}&endDate=${localEndDate}`,
                                { replace: true }
                            );
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700"
                    >
                        Terapkan
                    </button>

                </div>
            </div>
            {/* ================= CONTENT ================= */}
            {loading && (
                <LoadingSpinner text="Memuat detail absensi..." />
            )}

            {!loading && error && (
                <ErrorState
                    message={error}
                    onRetry={() => fetchDetail(startDate, endDate)}
                />
            )}

            {!loading && !error && !data?.absen?.length && (
                <EmptyState title="Tidak ada data absensi pada periode ini" />
            )}

            {!loading && !error && data?.absen?.length > 0 && (
                <>
                    {/* INFO KARYAWAN */}
                    <div className="bg-white border rounded px-4 py-3">
                        <h2 className="text-base font-semibold text-gray-900">
                            {data.nama}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {data.role} • {data.perusahaan}
                        </p>
                    </div>



                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-green-500 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Tanggal</th>
                                    <th className="px-4 py-3 text-left">Shift</th>
                                    <th className="px-4 py-3 text-left">Lokasi Mulai</th>
                                    <th className="px-4 py-3 text-left">Lokasi Selesai</th>
                                    <th className="px-4 py-3 text-center">Jam Masuk</th>
                                    <th className="px-4 py-3 text-center">Keterlambatan</th>
                                    <th className="px-4 py-3 text-center">Jam Pulang</th>
                                    <th className="px-4 py-3 text-center">Tunjangan</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAbsen.map((a) => {
                                    const tunjangan = a.tunjangan || {};
                                    const hasTransport = Boolean(tunjangan.transport);
                                    const hasNightShift = Boolean(tunjangan.night_shift);
                                    const hasDinas = Boolean(tunjangan.dinas);
                                    const hasTunjangan = hasTransport || hasNightShift;

                                    return (
                                        <tr key={a.id_absen} className="border-t hover:bg-green-50 transition">
                                            <td className="px-4 py-3 text-xs text-gray-700 font-semibold">
                                                {formatFullDate(a.jam_mulai)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-800">
                                                {renderNA(a.shift)}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700">
                                                {renderNA(a.lokasi_mulai)}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700">
                                                {renderNA(a.lokasi_selesai)}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs whitespace-nowrap">
                                                {renderTime(a.jam_mulai)}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs whitespace-nowrap text-red-600">
                                                {a.keterlambatan ? `${a.keterlambatan}` : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs whitespace-nowrap">
                                                {renderTime(a.jam_selesai)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {hasTunjangan ? (
                                                    <div className="inline-flex items-center gap-2">
                                                        {hasTransport && (
                                                            <FontAwesomeIcon icon={faGasPump} title="Tunjangan Transport" className="text-orange-500" />
                                                        )}
                                                        {hasNightShift && (
                                                            <FontAwesomeIcon icon={faHotel} title="Tunjangan Shift Malam" className="text-indigo-500" />
                                                        )}
                                                        {hasDinas && (
                                                            <FontAwesomeIcon icon={faBriefcase} title="Tunjangan Shift Malam" className="text-blue-500" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${a.status === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                    <FontAwesomeIcon icon={a.status === 1 ? faCheckCircle : faXmarkCircle} />
                                                    {a.status === 1 ? "Approved" : "Rejected"}
                                                </span>
                                            </td>
                                        </tr>

                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default RiwayatPersetujuanDetail;
