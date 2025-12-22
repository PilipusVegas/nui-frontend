import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGasPump, faUtensils, faHotel, faBriefcase, faCheckCircle, faCircle } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const iconMap = {
    "Uang Bensin": faGasPump,
    "Voucher makan": faUtensils,
    "Uang Penginapan": faHotel,
    "Perjalanan dinas": faBriefcase,
};

const Row = ({ icon, label, active, activeColor }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
        <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={icon} className={`text-lg ${active ? activeColor : "text-gray-300"}`} />
            <span className="text-sm text-gray-700">{label}</span>
        </div>

        <div className={`flex items-center gap-2 text-sm font-medium ${active ? "text-green-600" : "text-gray-400"}`}>
            <FontAwesomeIcon icon={active ? faCheckCircle : faCircle} className={active ? "text-green-500" : "text-gray-300"} />
            {active ? "Aktif" : "Tidak Aktif"}
        </div>
    </div>
);

/* ================= MAIN ================= */
const TunjanganDetail = ({ data }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const today = new Date();
        const prev = new Date();
        prev.setDate(today.getDate() - 6);

        setStartDate(prev.toISOString().slice(0, 10));
        setEndDate(today.toISOString().slice(0, 10));
    }, []);


    /* === FETCH FUNCTION (SUDAH BENAR POSISINYA) === */
    const fetchTunjangan = async () => {
        if (!startDate || !endDate) return;

        try {
            setLoading(true);

            const res = await fetchWithJwt(
                `${apiUrl}/tunjangan/user/${data.id_user}?startDate=${startDate}&endDate=${endDate}`
            );

            // ⬅️ INI KUNCI UTAMANYA
            const json = await res.json();

            if (json.success) {
                setResponse(json);
            } else {
                setResponse(null);
            }
        } catch (err) {
            console.error("Gagal fetch tunjangan:", err);
            setResponse(null);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (startDate && endDate) {
            fetchTunjangan();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);


    if (!data) return null;

    return (
        <div className="space-y-5">
            {/* HEADER USER */}
            <div className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="text-lg font-semibold">{data.nama}</p>

                <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span><b>NIP:</b> {data.nip}</span>
                    <span><b>Role:</b> {data.role}</span>
                </div>

                <div className="text-sm text-gray-500">{data.perusahaan}</div>
            </div>

            {/* SECTION TUNJANGAN */}
            <div className="border rounded-xl px-4 py-3 space-y-4">
                <p className="text-sm font-semibold">Tunjangan Aktif</p>

                {/* === ROW LAMA (DIPERTAHANKAN) === */}
                <Row icon={faGasPump} label="Uang Bensin" active activeColor="text-orange-500" />
                <Row icon={faUtensils} label="Voucher Makan" active activeColor="text-green-500" />
                <Row icon={faHotel} label="Biaya Penginapan" active activeColor="text-indigo-500" />
                <Row icon={faBriefcase} label="Perjalanan Dinas" active activeColor="text-blue-500" />

                {/* FILTER */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                    />
                </div>

                {/* DATA API */}
                {loading && <p className="text-sm text-gray-500">Memuat data...</p>}

                {!loading && response && response.dateRange.map((date) => {
                    const items = response.data[date] || [];

                    return (
                        <div key={date} className="border rounded-lg">
                            <div className="px-3 py-2 bg-gray-50 border-b">
                                <p className="text-xs font-semibold">
                                    {format(new Date(date), "EEEE, dd MMMM yyyy", { locale: id })}
                                </p>
                            </div>

                            <div className="px-3">
                                {items.length === 0 ? (
                                    <p className="py-3 text-xs italic text-gray-500">
                                        Tidak ada tunjangan
                                    </p>
                                ) : (
                                    items.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between py-3 border-b last:border-b-0"
                                        >
                                            <div className="flex gap-3">
                                                <FontAwesomeIcon icon={iconMap[item.nama]} />
                                                <div>
                                                    <p className="text-sm font-medium">{item.nama}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Disetujui oleh {item.user_approve}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                Aktif
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TunjanganDetail;
