import React, { useEffect, useMemo, useState } from "react";
import {
    faEye,
    faClockRotateLeft,
    faUsers,
    faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../../utils/jwtHelper";

import SectionHeader from "../../../components/desktop/SectionHeader";
import {
    LoadingSpinner,
    ErrorState,
    SearchBar,
    Pagination,
    EmptyState,
    SummaryCard,
} from "../../../components";
import { formatISODate, formatLongDate } from "../../../utils/dateUtils";

const RiwayatPersetujuanAbsensi = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const itemsPerPage = 15;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [periodeList, setPeriodeList] = useState([]);
    const [selectedPeriode, setSelectedPeriode] = useState(null);

    /* ===================== FETCH PERIODE (MAX 3 BULAN) ===================== */
    const fetchPeriode = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetchWithJwt(`${apiUrl}/penggajian/periode`);

            if (!res.ok) {
                throw new Error("Gagal memuat periode penggajian");
            }

            const json = await res.json();
            const today = new Date();

            const nonActive = json.data.filter((p) => {
                const start = new Date(p.tgl_awal);
                const end = new Date(p.tgl_akhir);
                return !(today >= start && today <= end);
            });

            const lastThree = nonActive.slice(-3);

            setPeriodeList(lastThree);

            // aman: cek ada datanya dulu
            if (lastThree.length > 0) {
                setSelectedPeriode(lastThree[lastThree.length - 1]);
            } else {
                setSelectedPeriode(null);
            }
        } catch (err) {
            console.error("fetchPeriode error:", err);
            setError("Gagal memuat periode penggajian");
            setPeriodeList([]);
            setSelectedPeriode(null);
        } finally {
            setLoading(false);
        }
    };

    /* ===================== FETCH RIWAYAT ===================== */
    const fetchRiwayat = async (periode) => {
        if (!periode?.tgl_awal || !periode?.tgl_akhir) {
            console.warn("Periode tidak valid:", periode);
            setData([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const startDate = periode.tgl_awal.split("T")[0];
            const endDate = periode.tgl_akhir.split("T")[0];

            const res = await fetchWithJwt(
                `${apiUrl}/absen/riwayat?startDate=${startDate}&endDate=${endDate}`
            );

            if (!res.ok) throw new Error("Gagal memuat riwayat absensi");

            const json = await res.json();
            setData(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error("fetchRiwayat error:", err);
            setError("Gagal memuat riwayat absensi");
            setData([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchPeriode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedPeriode) {
            fetchRiwayat(selectedPeriode);
        }
    }, [selectedPeriode]);

    /* ===================== FILTER ===================== */
    const filteredData = useMemo(() => {
        return data.filter(
            (d) =>
                d.nama.toLowerCase().includes(search.toLowerCase()) ||
                d.role.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);

    const paginated = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const isValidPeriode = selectedPeriode?.tgl_awal && selectedPeriode?.tgl_akhir;


    return (
        <div className="flex flex-col">
            <SectionHeader title="Riwayat Persetujuan Absensi" subtitle="Rekap absensi karyawan berdasarkan periode penggajian." onBack={() => navigate("/pengajuan-absensi")}/>

            <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="w-full sm:flex-1">
                    <SearchBar placeholder="Cari nama atau divisi..." onSearch={(v) => { setSearch(v); setCurrentPage(1);}}/>
                </div>

                <div className="w-full sm:w-auto sm:min-w-[260px]">
                    <label className="text-xs font-semibold text-gray-600 mb-1 block sm:text-right">
                        Tentukan Periode
                    </label>
                    <select
                        value={selectedPeriode?.id || ""}
                        onChange={(e) => {
                            const p = periodeList.find((x) => x.id === Number(e.target.value));
                            setSelectedPeriode(p);
                            setCurrentPage(1);
                        }}
                        className="w-full border-2 border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
                    >
                        {periodeList.map((p) => (
                            <option key={p.id} value={p.id}>
                                {formatLongDate(p.tgl_awal)} - {formatLongDate(p.tgl_akhir)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="rounded-lg shadow-md overflow-hidden bg-white">
                <table className="w-full">
                    <thead className="bg-green-500 text-white">
                        <tr>
                            <th className="py-3 px-4 text-sm text-center">No</th>
                            <th className="py-3 px-4 text-sm text-left">Karyawan</th>
                            <th className="py-3 px-4 text-sm text-center">Total Absen</th>
                            <th className="py-3 px-4 text-sm text-center">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={4} className="py-8">
                                    <LoadingSpinner text="Memuat riwayat..." />
                                </td>
                            </tr>
                        )}

                        {!loading && error && (
                            <tr>
                                <td colSpan={4} className="py-8">
                                    <ErrorState message={error} onRetry={fetchRiwayat} />
                                </td>
                            </tr>
                        )}

                        {!loading && !error && paginated.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-8">
                                    <EmptyState title="Tidak ada data riwayat absensi" />
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            paginated.map((item, idx) => (
                                <tr key={item.id_user} className="border-t hover:bg-gray-50">
                                    <td className="text-center text-sm">
                                        {idx + 1 + (currentPage - 1) * itemsPerPage}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="font-semibold text-xs">{item.nama}</div>
                                        <div className="text-xs text-gray-500">{item.role}</div>
                                    </td>
                                    <td className="text-center text-sm">{item.total_absen} Hari</td>
                                    <td className="text-center">
                                        <button disabled={!isValidPeriode}
                                            onClick={() => navigate(`/pengajuan-absensi/riwayat/${item.id_user}?startDate=${formatISODate(selectedPeriode.tgl_awal)}&endDate=${formatISODate(selectedPeriode.tgl_akhir)}`)}
                                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition
                                            ${selectedPeriode ? "bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                                        >
                                            <FontAwesomeIcon icon={faEye} className="text-[11px]" />
                                            <span>Detail</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={currentPage} totalItems={filteredData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
    );
};

export default RiwayatPersetujuanAbsensi;
