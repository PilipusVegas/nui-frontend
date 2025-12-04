import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faChevronUp,
    faCheck,
    faTimes,
    faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { SearchBar, LoadingSpinner, SectionHeader, EmptyState, ErrorState } from "../../../components";

const BatchApproval = () => {
    const [data, setData] = useState([]);
    const [expandUser, setExpandUser] = useState({});
    const [expandDetail, setExpandDetail] = useState({});
    const [openDetailId, setOpenDetailId] = useState(null);
    const [checked, setChecked] = useState({});

    const navigate = useNavigate();

    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const startDate = "2025-11-21";
    const endDate = "2025-12-20";

    useEffect(() => {
        loadBatch();
    }, []);

    const loadBatch = async () => {
        try {
            const response = await fetchWithJwt(
                `${apiUrl}/absen/status/batch?startDate=${startDate}&endDate=${endDate}`
            );

            const res = await response.json(); // ← penting! parse JSON di sini

            if (res?.success) {
                setData(res.data);
            } else {
                toast.error("Gagal memuat data");
            }
        } catch (e) {
            toast.error("Terjadi kesalahan");
        }
    };


    const toggleUser = (id) =>
        setExpandUser((prev) => ({ ...prev, [id]: !prev[id] }));

    const toggleDetail = (id) => {
        setOpenDetailId(prev => prev === id ? null : id);
    };

    const toggleUserCheck = (user) => {
        setChecked(prev => {
            const newState = { ...prev };
            const keyUser = `user-${user.id_user}`;
            const newValue = !prev[keyUser];

            // checklist header user
            newState[keyUser] = newValue;

            // checklist semua sub-absen
            user.absen.forEach(a => {
                newState[`absen-${a.id}`] = newValue;
            });

            return newState;
        });
    };


    const toggleAbsenCheck = (user, absenId) => {
        setChecked(prev => {
            const newState = { ...prev };
            const keyAbsen = `absen-${absenId}`;
            newState[keyAbsen] = !prev[keyAbsen];

            // cek apakah semua absen sudah di-checklist
            const allChecked = user.absen.every(a => newState[`absen-${a.id}`]);

            newState[`user-${user.id_user}`] = allChecked;

            return newState;
        });
    };

    return (
        <div>
            <SectionHeader title="Batch Approval Absensi" subtitle="Pengajuan Absensi" onBack={() => navigate("/home")} />

            {/* LIST USER */}
            <div className="space-y-4">
                {data.map((user) => (
                    <div
                        key={user.id_user}
                        className="bg-white shadow-sm border border-green-200/60 rounded-xl p-4 hover:shadow-md transition-all"
                    >
                        {/* HEADER USER */}
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleUser(user.id_user)}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 accent-green-600 rounded"
                                    onClick={(e) => e.stopPropagation()}
                                    checked={checked[`user-${user.id_user}`] || false}
                                    onChange={() => toggleUserCheck(user)}
                                />

                                <div>
                                    <p className="font-semibold text-gray-900 text-sm leading-tight">
                                        {user.nama}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        NIP: {user.nip} • {user.role}
                                    </p>
                                </div>
                            </div>

                            <FontAwesomeIcon
                                icon={expandUser[user.id_user] ? faChevronUp : faChevronDown}
                                className="text-green-600"
                            />
                        </div>

                        {/* LIST ABSEN */}
                        {expandUser[user.id_user] && (
                            <div className="mt-4 pt-3 border-t border-green-100 space-y-1">
                                {user.absen.map((a) => (
                                    <div key={a.id}>
                                        {/* ROW ABSEN */}
                                        <div
                                            className="flex items-start justify-between cursor-pointer px-3 py-2 rounded-lg hover:bg-green-50 transition"
                                            onClick={() => toggleDetail(a.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 accent-green-600 mt-1 rounded"
                                                    onClick={(e) => e.stopPropagation()}
                                                    checked={checked[`absen-${a.id}`] || false}
                                                    onChange={() => toggleAbsenCheck(user, a.id)}
                                                />

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {a.hari},{" "}
                                                        {a.tanggal_absen
                                                            ?.slice(0, 10)
                                                            .split("-")
                                                            .reverse()
                                                            .join("-")}
                                                    </p>

                                                    <p className="text-xs text-gray-600">
                                                        Masuk:{" "}
                                                        {a.absen_masuk
                                                            ? new Date(a.absen_masuk).toLocaleTimeString("id-ID", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })
                                                            : "-"}
                                                        {" • "}
                                                        Pulang:{" "}
                                                        {a.absen_pulang
                                                            ? new Date(a.absen_pulang).toLocaleTimeString("id-ID", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })
                                                            : "-"}
                                                    </p>

                                                    <span
                                                        className={`mt-1 inline-block px-2 py-0.5 text-[10px] rounded-md font-medium
                                                ${a.status === 0
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : a.status === 1
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }
                                            `}
                                                    >
                                                        {a.status === 0
                                                            ? "Menunggu"
                                                            : a.status === 1
                                                                ? "Disetujui"
                                                                : "Ditolak"}
                                                    </span>
                                                </div>
                                            </div>

                                            <FontAwesomeIcon
                                                icon={openDetailId === a.id ? faChevronUp : faChevronDown}
                                                className="text-green-600 mt-1"
                                            />
                                        </div>

                                        {/* DETAIL */}
                                        {openDetailId === a.id && (
                                            <div className="ml-9 mt-3 mb-4 p-4 rounded-xl border border-green-100 bg-white shadow-sm animate-fadeIn">

                                                {/* ======================= HEADER SHIFT ======================= */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-sm font-semibold text-gray-900">
                                                            {a.hari}, {a.tanggal_absen?.slice(0, 10)}
                                                        </h3>

                                                        <span className="px-2 py-1 text-[10px] rounded-md bg-green-100 text-green-700 font-semibold">
                                                            {a.nama_shift}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Jadwal:{" "}
                                                        <span className="font-medium text-gray-900">
                                                            {a.shift_masuk} – {a.shift_pulang}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="border-t border-gray-100 my-3"></div>

                                                {/* ======================= MASUK & PULANG (ONE CARD) ======================= */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                                    {/* ======================= MASUK ======================= */}
                                                    <div className="rounded-xl border border-green-100 bg-green-50/40 p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-1.5 h-6 rounded-full bg-green-500"></div>
                                                            <h4 className="text-xs font-bold text-green-700 tracking-wide">
                                                                ABSEN MASUK
                                                            </h4>
                                                        </div>

                                                        {/* FOTO MASUK */}
                                                        {a.foto_mulai && (
                                                            <img
                                                                src={a.foto_mulai}
                                                                alt="foto masuk"
                                                                className="w-20 h-20 rounded-lg object-cover border border-green-200 mb-3"
                                                            />
                                                        )}

                                                        {/* INFO MASUK */}
                                                        <div className="space-y-1.5 text-xs">
                                                            <p>
                                                                Lokasi:{" "}
                                                                <span className="font-semibold text-gray-900">
                                                                    {a.tempat_mulai}
                                                                </span>
                                                            </p>

                                                            <p>
                                                                Koordinat:{" "}
                                                                <span className="font-medium text-gray-700">
                                                                    {a.koordinat_tempat_mulai}
                                                                </span>
                                                            </p>

                                                            <p>
                                                                Jarak:{" "}
                                                                <span className="font-semibold">{a.jarak_mulai} m</span>
                                                            </p>

                                                            {!!a.keterlambatan && (
                                                                <p className="text-red-600 font-semibold">
                                                                    Terlambat: {a.keterlambatan} menit
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* ======================= PULANG ======================= */}
                                                    <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-1.5 h-6 rounded-full bg-red-500"></div>
                                                            <h4 className="text-xs font-bold text-red-700 tracking-wide">
                                                                ABSEN PULANG
                                                            </h4>
                                                        </div>

                                                        {/* ======== BELUM ABSEN PULANG ======== */}
                                                        {!a.absen_pulang || (!a.tempat_selesai && !a.foto_selesai) ? (
                                                            <div className="rounded-lg border border-red-200 bg-red-100 p-3 text-xs text-red-700">
                                                                <p className="font-semibold">Belum Melakukan Absen Pulang</p>
                                                                <p className="text-[10px] mt-1">Data belum tersedia.</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {/* FOTO */}
                                                                {a.foto_selesai && (
                                                                    <img
                                                                        src={a.foto_selesai}
                                                                        alt="foto pulang"
                                                                        className="w-20 h-20 rounded-lg object-cover border border-red-200 mb-3"
                                                                    />
                                                                )}

                                                                {/* INFO */}
                                                                <div className="space-y-1.5 text-xs">
                                                                    <p>
                                                                        Lokasi:{" "}
                                                                        <span className="font-semibold text-gray-900">
                                                                            {a.tempat_selesai}
                                                                        </span>
                                                                    </p>

                                                                    <p>
                                                                        Koordinat:{" "}
                                                                        <span className="font-medium text-gray-700">
                                                                            {a.koordinat_tempat_selesai}
                                                                        </span>
                                                                    </p>

                                                                    <p>
                                                                        Jarak:{" "}
                                                                        <span className="font-semibold">{a.jarak_selesai} m</span>
                                                                    </p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                </div>

                                                <div className="border-t border-gray-100 my-4"></div>

                                                {/* ======================= EXTRA INFO (Jika Ada) ======================= */}
                                                <div className="text-xs space-y-1 text-gray-700">
                                                    {a.remark && (
                                                        <p>
                                                            Remark:{" "}
                                                            <span className="font-semibold text-gray-900">{a.remark}</span>
                                                        </p>
                                                    )}
                                                </div>

                                            </div>
                                        )}



                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>


        </div>
    );
};

export default BatchApproval;
