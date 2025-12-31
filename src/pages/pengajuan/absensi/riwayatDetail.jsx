import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import SectionHeader from "../../../components/desktop/SectionHeader";
import { LoadingSpinner, ErrorState, EmptyState, SearchBar } from "../../../components";
import { formatFullDate, formatLongDate, formatTime, toLocalISODate} from "../../../utils/dateUtils";
import { faCheckCircle, faXmarkCircle, faGasPump, faHotel, faBriefcase, } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const RiwayatPersetujuanDetail = () => {
    const { id_user } = useParams();
    const [params] = useSearchParams();

    const startDate = params.get("startDate");
    const endDate = params.get("endDate");

    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [periodeList, setPeriodeList] = useState([]);
    const [selectedPeriode, setSelectedPeriode] = useState(null);


    const fetchDetail = async (start, end) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetchWithJwt(
                `${apiUrl}/absen/riwayat/${id_user}?startDate=${start}&endDate=${end}`
            );

            if (!res.ok) throw new Error("Gagal memuat detail absensi");

            const json = await res.json();
            setData(json.data);
        } catch (err) {
            setError(err.message);
            setData(null);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!startDate || !endDate || !id_user) return;

        fetchDetail(startDate, endDate);
    }, [startDate, endDate, id_user]);



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


    if (loading) return <LoadingSpinner text="Memuat detail absensi..." />;
    if (error) return <ErrorState message={error} onRetry={fetchDetail} />;
    if (!data?.absen?.length)
        return <EmptyState title="Tidak ada data absensi pada periode ini" />;

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



    return (
        <div className="flex flex-col gap-4">
            <SectionHeader title="Riwayat Persetujuan Absensi" subtitle="Detail Absensi Pengajuan Absensi Pengguna Pengajuan Absensi" onBack={() => navigate("/pengajuan-absensi/riwayat")} />

            <div className="bg-white border rounded-lg px-4 py-3">
                <h2 className="text-base font-semibold text-gray-900">
                    {data.nama}
                </h2>
                <p className="text-sm text-gray-600">
                    {data.role} • {data.perusahaan}
                </p>
            </div>

            <div className="shadow-sm flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="w-full sm:flex-1">
                    <SearchBar placeholder="Cari shift atau lokasi..." onSearch={(val) => setSearch(val)} />
                </div>

                <div className="flex flex-col items-start sm:items-end">
                    <label className="text-xs font-semibold text-gray-600 mb-1">
                        Pilih Periode
                    </label>

                    <select value={selectedPeriode?.id || ""}
                        onChange={(e) => {
                            const p = periodeList.find(
                                (x) => x.id === Number(e.target.value)
                            );
                            if (!p) return;
                            const start = toLocalISODate(p.tgl_awal);
                            const end = toLocalISODate(p.tgl_akhir);
                            setSelectedPeriode(p);
                            navigate(`/pengajuan-absensi/riwayat/${id_user}?startDate=${start}&endDate=${end}`, { replace: true });
                        }}
                        className="inline-block w-auto min-w-[220px] border-2 border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                    >
                        {periodeList.map((p) => (
                            <option key={p.id} value={p.id}>
                                {formatLongDate(p.tgl_awal)} – {formatLongDate(p.tgl_akhir)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-green-600 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left">Tanggal</th>
                            <th className="px-4 py-3 text-left">Shift</th>
                            <th className="px-4 py-3 text-left">Lokasi Mulai</th>
                            <th className="px-4 py-3 text-left">Lokasi Selesai</th>
                            <th className="px-4 py-3 text-center">Jam Masuk</th>
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
                                                    <FontAwesomeIcon icon={faHotel} title="Tunjangan Shift Malam" className="text-indigo-500"/>
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
        </div>
    );
};

export default RiwayatPersetujuanDetail;
