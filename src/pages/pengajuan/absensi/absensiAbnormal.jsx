import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronDown,
    faChevronUp,
    faMapMarkerAlt,
    faBuilding,
    faInfo,
    faArrowUpRightFromSquare,
    faBus,
    faMoon,
    faAlignLeft,
    faGift,
    faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatFullDate, formatTime } from "../../../utils/dateUtils";
import {
    SectionHeader,
    SearchBar,
    Modal,
    EmptyState,
    LoadingSpinner,
    ErrorState,
} from "../../../components";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Swal from "sweetalert2";

const AbsensiAbnormal = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [searchQuery, setSearchQuery] = useState("");
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [checkedStatus, setCheckedStatus] = useState({});
    const [openDetailMap, setOpenDetailMap] = useState({});
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const findAbsenPulangKosong = (list) => {
        return list.filter((a) => !a.absen_pulang);
    };

    const sendBatchUpdate = async (approved, rejected) => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/absen/status/batch`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_absen_approved: approved,
                    id_absen_rejected: rejected,
                }),
            }).then((r) => r.json());

            if (res.success) {
                toast.success("Berhasil melakukan update");
                setCheckedStatus({});
                await loadBatch();
            } else {
                toast.error("Gagal update");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan");
        }
    };

    const getSelectedStatus = () => {
        const approved = [];
        const rejected = [];
        Object.entries(checkedStatus).forEach(([id, status]) => {
            if (status === "approve") approved.push(Number(id));
            if (status === "reject") rejected.push(Number(id));
        });
        return { approved, rejected };
    };

    const handleApproveAll = async () => {
        const { approved, rejected } = getSelectedStatus();

        if (!approved.length && !rejected.length) {
            return toast.error("Belum ada absen yang dipilih");
        }

        let selectedAbsen = [];

        data.forEach((user) => {
            user.absen.forEach((a) => {
                if (approved.includes(a.id)) {
                    selectedAbsen.push(a);
                }
            });
        });

        const absenKosong = findAbsenPulangKosong(selectedAbsen);

        if (selectedAbsen.length === 1 && absenKosong.length === 1) {
            return Swal.fire({
                icon: "warning",
                title: "Absen Pulang Masih Kosong",
                html: `
                Karyawan ini belum melakukan absen pulang.<br/>
                Lanjutkan persetujuan?
            `,
                showCancelButton: true,
                confirmButtonText: "Setujui Saja",
                cancelButtonText: "Batalkan",
                reverseButtons: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await sendBatchUpdate(approved, rejected);
                }
            });
        }

        if (absenKosong.length > 0) {
            return Swal.fire({
                icon: "warning",
                title: "Ada Absen Pulang yang Kosong",
                html: `
                Terdapat <b>${absenKosong.length}</b> absen yang belum memiliki data pulang.<br/>
                Pilih tindakan yang ingin dilakukan.
            `,
                showCancelButton: true,
                confirmButtonText: "Setujui Semua",
                cancelButtonText: "Lewati yang Kosong",
                reverseButtons: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await sendBatchUpdate(approved, rejected);
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    const filtered = approved.filter((id) => !absenKosong.some((a) => a.id === id));

                    if (filtered.length === 0) {
                        return Swal.fire({
                            icon: "info",
                            title: "Tidak Ada Absen yang Lengkap",
                            text: "Semua absen yang dipilih belum memiliki data pulang.",
                            confirmButtonColor: "#3085d6",
                        });
                    }

                    await sendBatchUpdate(filtered, rejected);
                }
            });
        }

        await sendBatchUpdate(approved, rejected);
    };

    const handleOpenLightbox = (images, index) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const { approved, rejected } = getSelectedStatus();
    const totalSelected = approved.length + rejected.length;
    const isDisabled = totalSelected === 0;

    const filteredData = data.filter(
        (user) =>
            user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const loadBatch = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetchWithJwt(`${apiUrl}/absen/status/batch`);
            const res = await response.json();

            if (res.success) {
                setData(res.data);
            } else {
                setError("Gagal memuat data");
            }
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan koneksi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBatch();
    }, []);

    const toggleUserCard = (user) => {
        setExpandedUserId((prev) => {
            if (prev === user.id_user) {
                setOpenDetailMap((m) => ({ ...m, [user.id_user]: [] }));
                return null;
            }

            setOpenDetailMap((m) => ({
                ...m,
                [user.id_user]: user.absen.map((a) => a.id),
            }));

            return user.id_user;
        });
    };

    return (
        <div className="min-h-screen flex flex-col relative">
            <SectionHeader
                title="Absensi Abnormal"
                subtitle="Daftar absensi yang perlu diverifikasi dan disetujui untuk menjaga data kehadiran tetap akurat."
                onBack={() => navigate("/home")}
                actions={
                    <button
                        onClick={() => setIsInfoModalOpen(true)}
                        className="flex items-center justify-center px-4 sm:px-4 py-2 text-sm font-semibold rounded-md text-white bg-blue-500 hover:bg-blue-600 gap-1"
                    >
                        <FontAwesomeIcon icon={faInfo} className="mr-0 sm:mr-1" />
                        <span className="hidden sm:inline">Informasi</span>
                    </button>
                }
            />

            <div className="mb-4 w-full">
                <SearchBar placeholder="Cari karyawan..." onSearch={(val) => setSearchQuery(val)} />
            </div>

            {loading && (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <LoadingSpinner message="Memuat data absensi..." />
                </div>
            )}
            {error && (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <ErrorState title="Gagal Memuat Data" message={error} onRetry={loadBatch} />
                </div>
            )}
            {!loading && filteredData.length === 0 && (
                <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
                    <EmptyState
                        title="Semua Absen Telah Disetujui"
                        message="Tidak ditemukan pengajuan absensi."
                    />
                </div>
            )}

            <div className="space-y-4 pb-32">
                {filteredData.map((user) => {
                    return (
                        <div
                            key={user.id_user}
                            className="rounded-xl overflow-hidden shadow-lg transition hover:shadow-xl"
                        >
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleUserCard(user);
                                }}
                                className={`
    relative w-full cursor-pointer
    rounded-2xl border
    px-5 py-4
    bg-white
    transition-all duration-200
    hover:shadow-md
    ${expandedUserId === user.id_user ? "border-emerald-300 shadow-sm" : "border-gray-200"}
  `}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    {/* LEFT — IDENTITAS */}
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div
                                            className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          text-sm font-semibold
          ${expandedUserId === user.id_user
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }
        `}
                                        >
                                            {user.nama?.charAt(0)}
                                        </div>

                                        <div className="flex flex-col">
                                            <p className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                                                {user.nama}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500">
                                                {user.role} • NIP {user.nip}
                                            </p>
                                        </div>
                                    </div>

                                    {/* RIGHT — STATS + CHEVRON */}
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {/* Statistik */}
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
                                                {user.absen.filter((a) => checkedStatus[a.id] === "approve").length}{" "}
                                                Disetujui
                                            </span>

                                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700">
                                                {user.absen.filter((a) => checkedStatus[a.id] === "reject").length} Ditolak
                                            </span>

                                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                                {user.absen.filter((a) => a.status === 0).length} Total
                                            </span>
                                        </div>

                                        {/* Chevron */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleUserCard(user);
                                            }}
                                            className={`
          flex items-center justify-center
          w-8 h-8 rounded-full
          transition-all
          ${expandedUserId === user.id_user
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }
        `}
                                        >
                                            <FontAwesomeIcon
                                                icon={expandedUserId === user.id_user ? faChevronUp : faChevronDown}
                                                className="text-xs"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {expandedUserId === user.id_user && (
                                <div className="divide-y divide-gray-200 bg-gray-50">
                                    {user.absen.map((a) => {
                                        return (
                                            <div key={a.id} className="p-4">
                                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 sm:p-5">
                                                    <div
                                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer"
                                                        onClick={() => {
                                                            setOpenDetailMap((prev) => {
                                                                const current = prev[user.id_user] || [];
                                                                return {
                                                                    ...prev,
                                                                    [user.id_user]: current.includes(a.id)
                                                                        ? current.filter((id) => id !== a.id)
                                                                        : [...current, a.id],
                                                                };
                                                            });
                                                        }}
                                                    >
                                                        <div className="flex-1">
                                                            <p className="text-sm sm:text-lg font-semibold text-gray-800 leading-tight">
                                                                {formatFullDate(a.tanggal_absen)}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-5 sm:gap-6">
                                                            <label
                                                                className="flex items-center gap-2 text-green-600 text-md font-semibold select-none"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checkedStatus[a.id] === "approve"}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onChange={() =>
                                                                        setCheckedStatus((prev) => ({
                                                                            ...prev,
                                                                            [a.id]: prev[a.id] === "approve" ? null : "approve",
                                                                        }))
                                                                    }
                                                                    className="w-5 h-5 accent-green-600"
                                                                />
                                                                <span onClick={(e) => e.stopPropagation()}>Setujui</span>
                                                            </label>

                                                            <label
                                                                className="flex items-center gap-2 text-red-600 text-md font-semibold select-none"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checkedStatus[a.id] === "reject"}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onChange={() =>
                                                                        setCheckedStatus((prev) => ({
                                                                            ...prev,
                                                                            [a.id]: prev[a.id] === "reject" ? null : "reject",
                                                                        }))
                                                                    }
                                                                    className="w-5 h-5 accent-red-600"
                                                                />
                                                                <span onClick={(e) => e.stopPropagation()}>Tolak</span>
                                                            </label>
                                                            <FontAwesomeIcon
                                                                icon={faChevronDown}
                                                                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openDetailMap[user.id_user]?.includes(a.id) ? "rotate-180" : ""
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* DETAIL MENYATU DI DALAM CARD */}
                                                    {openDetailMap[user.id_user]?.includes(a.id) && (
                                                        <div className="pt-6 mt-6 border-t border-gray-300">
                                                            <div className="space-y-5">
                                                                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mt-0.5">
                                                                    <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-[3px] rounded-md border border-blue-200">
                                                                        {a.nama_shift} • {a.shift_masuk} - {a.shift_pulang}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                                    <div className="p-5 py-4 rounded-2xl border border-green-300 bg-green-50 shadow-sm flex flex-col sm:flex-row gap-5">
                                                                        <div className="flex-shrink-0 flex flex-col items-center sm:items-start gap-2 sm:w-1/3">
                                                                            <p className="font-bold text-green-700 text-lg">
                                                                                Absen Masuk
                                                                            </p>
                                                                            <div className="w-full h-[1px] bg-green-300 mb-2"></div>
                                                                            {a.foto_mulai ? (
                                                                                <img
                                                                                    src={a.foto_mulai}
                                                                                    className="w-32 h-32 object-cover rounded-xl border border-green-400 cursor-pointer hover:scale-105 transition"
                                                                                    onClick={() =>
                                                                                        handleOpenLightbox(
                                                                                            [a.foto_mulai, a.foto_selesai].filter(Boolean),
                                                                                            0
                                                                                        )
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <p className="text-xs text-gray-500 italic py-8 w-32 text-center">
                                                                                    Foto tidak tersedia
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex-1 space-y-3 text-gray-800 text-sm sm:text-base">
                                                                            <p className="font-bold text-green-700">
                                                                                Informasi Kehadiran
                                                                            </p>
                                                                            <div className="w-full h-[1px] bg-green-200"></div>

                                                                            <p>
                                                                                <span className="font-semibold">Waktu Masuk:</span>{" "}
                                                                                {formatTime(a.absen_masuk)}
                                                                            </p>
                                                                            <p>
                                                                                <span className="font-semibold">Tanggal Masuk:</span>{" "}
                                                                                {formatFullDate(a.absen_masuk)}
                                                                            </p>

                                                                            <p className="flex items-center gap-2">
                                                                                <FontAwesomeIcon
                                                                                    icon={faMapMarkerAlt}
                                                                                    className="text-green-700"
                                                                                />
                                                                                <span className="font-semibold">Lokasi Absen:</span>

                                                                                <a
                                                                                    href={`https://www.google.com/maps?q=${a.titik_mulai_pengguna}`}
                                                                                    target="_blank"
                                                                                    className="font-semibold underline hover:text-green-900 flex items-center gap-1"
                                                                                >
                                                                                    Lihat Maps
                                                                                    <FontAwesomeIcon
                                                                                        icon={faArrowUpRightFromSquare}
                                                                                        className="text-green-700 text-sm"
                                                                                    />
                                                                                </a>
                                                                            </p>

                                                                            <p className="flex items-center gap-2">
                                                                                <FontAwesomeIcon
                                                                                    icon={faBuilding}
                                                                                    className="text-gray-700"
                                                                                />
                                                                                Tempat Kerja:{" "}
                                                                                <span className="font-semibold">{a.tempat_mulai}</span>
                                                                            </p>

                                                                            <p>
                                                                                Jarak Lokasi Kerja – Lokasi Absen:
                                                                                <span className="font-semibold"> {a.jarak_mulai} m</span>
                                                                                {a.jarak_mulai > 60 && (
                                                                                    <span className="text-red-600 font-semibold ml-1">
                                                                                        (Terlalu jauh)
                                                                                    </span>
                                                                                )}
                                                                            </p>

                                                                            {a.keterlambatan && (
                                                                                <p className="text-red-600 font-bold">
                                                                                    Keterlambatan: {a.keterlambatan} menit
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* ABSEN PULANG */}
                                                                    <div className="p-5 py-4 rounded-2xl border border-rose-300 bg-rose-50 shadow-sm flex flex-col sm:flex-row gap-5">
                                                                        <div className="flex-shrink-0 flex flex-col items-center sm:items-start gap-2 sm:w-1/3">
                                                                            <p className="font-bold text-rose-700 text-lg">
                                                                                Absen Pulang
                                                                            </p>
                                                                            <div className="w-full h-[1px] bg-rose-300 mb-2"></div>

                                                                            {!a.absen_pulang ? (
                                                                                <p className="text-xs text-rose-500 italic py-8 w-32 text-center">
                                                                                    Belum absen pulang
                                                                                </p>
                                                                            ) : (
                                                                                <img
                                                                                    src={a.foto_selesai}
                                                                                    className="w-32 h-32 object-cover rounded-xl border border-rose-400 cursor-pointer hover:scale-105 transition"
                                                                                    onClick={() =>
                                                                                        handleOpenLightbox(
                                                                                            [a.foto_mulai, a.foto_selesai].filter(Boolean),
                                                                                            1
                                                                                        )
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </div>

                                                                        {a.absen_pulang && (
                                                                            <div className="flex-1 space-y-3 text-gray-800 text-sm sm:text-base">
                                                                                <p className="font-bold text-rose-700">
                                                                                    Informasi Kepulangan
                                                                                </p>
                                                                                <div className="w-full h-[1px] bg-rose-200"></div>
                                                                                <p>
                                                                                    <span className="font-semibold">Waktu Pulang:</span>{" "}
                                                                                    {formatTime(a.absen_pulang)}
                                                                                </p>
                                                                                <p>
                                                                                    <span className="font-semibold">Tanggal Pulang:</span>{" "}
                                                                                    {formatFullDate(a.absen_pulang)}
                                                                                </p>
                                                                                <p className="flex items-center gap-2">
                                                                                    <FontAwesomeIcon
                                                                                        icon={faMapMarkerAlt}
                                                                                        className="text-red-700"
                                                                                    />
                                                                                    <span className="font-semibold">Lokasi Absen:</span>

                                                                                    <a
                                                                                        href={`https://www.google.com/maps?q=${a.titik_selesai_pengguna}`}
                                                                                        target="_blank"
                                                                                        className="font-semibold underline hover:text-red-900 flex items-center gap-1"
                                                                                    >
                                                                                        Lihat Maps
                                                                                        <FontAwesomeIcon
                                                                                            icon={faArrowUpRightFromSquare}
                                                                                            className="text-red-700 text-sm"
                                                                                        />
                                                                                    </a>
                                                                                </p>

                                                                                <p className="flex items-center gap-2">
                                                                                    <FontAwesomeIcon
                                                                                        icon={faBuilding}
                                                                                        className="text-gray-700"
                                                                                    />
                                                                                    Tempat Kerja:
                                                                                    <span className="font-semibold">
                                                                                        {a.tempat_selesai || "Belum Absen"}
                                                                                    </span>
                                                                                </p>

                                                                                <p>
                                                                                    Jarak Lokasi Kerja – Lokasi Absen:
                                                                                    <span className="font-semibold">
                                                                                        {" "}
                                                                                        {a.jarak_selesai || 0} m
                                                                                    </span>
                                                                                    {a.jarak_selesai > 60 && (
                                                                                        <span className="text-red-600 font-semibold ml-1">
                                                                                            (Terlalu jauh)
                                                                                        </span>
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="w-full my-4 h-[1px] bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"></div>

                                                                <div className="space-y-2">
                                                                    <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                                        <FontAwesomeIcon icon={faAlignLeft} className="text-blue-700" />
                                                                        Deskripsi
                                                                    </p>

                                                                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                                                        {a.deskripsi ? (
                                                                            a.deskripsi
                                                                        ) : (
                                                                            <span className="italic text-gray-400">
                                                                                Tidak ada deskripsi
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                {/* GARIS PEMBATAS */}
                                                                <div className="w-full my-4 h-[1px] bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"></div>

                                                                {/* TUNJANGAN */}
                                                                <div className="space-y-3">
                                                                    <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                                        <FontAwesomeIcon icon={faGift} className="text-blue-700" />
                                                                        Informasi Tunjangan
                                                                    </p>

                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                        {/* Transport */}
                                                                        <div className="flex items-start gap-3 p-4 rounded-xl border bg-white shadow-sm">
                                                                            <FontAwesomeIcon
                                                                                icon={faBus}
                                                                                className={`${a.tunjangan?.transport
                                                                                        ? "text-green-700"
                                                                                        : "text-gray-400"
                                                                                    } text-xl`}
                                                                            />
                                                                            <div className="space-y-1">
                                                                                <p className="text-sm font-semibold text-gray-800">
                                                                                    Tunjangan Transport
                                                                                </p>

                                                                                <p className="text-sm text-gray-600">
                                                                                    {a.tunjangan?.transport ? (
                                                                                        <span className="text-green-800 font-semibold">
                                                                                            Diberikan — Karyawan menggunakan kendaraan pribadi dan
                                                                                            bekerja di gerai.
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="text-gray-500 italic">
                                                                                            Tidak diberikan — Karyawan tidak memenuhi syarat
                                                                                            transport.
                                                                                        </span>
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Night Shift */}
                                                                        <div className="flex items-start gap-3 p-4 rounded-xl border bg-white shadow-sm">
                                                                            <FontAwesomeIcon
                                                                                icon={faMoon}
                                                                                className={`${a.tunjangan?.night_shift
                                                                                        ? "text-indigo-700"
                                                                                        : "text-gray-400"
                                                                                    } text-xl`}
                                                                            />
                                                                            <div className="space-y-1">
                                                                                <p className="text-sm font-semibold text-gray-800">
                                                                                    Tunjangan Night Shift
                                                                                </p>

                                                                                <p className="text-sm text-gray-600">
                                                                                    {a.tunjangan?.night_shift ? (
                                                                                        <span className="text-indigo-800 font-semibold">
                                                                                            Diberikan — Karyawan bekerja shift malam di gerai.
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="text-gray-500 italic">
                                                                                            Tidak diberikan — Karyawan tidak bekerja pada shift
                                                                                            malam.
                                                                                        </span>
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {data.length > 0 && (
                    <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 rounded-xl shadow-lg flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center z-10">
                        <div className="flex justify-between w-full sm:justify-start sm:w-auto gap-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.every((user) =>
                                        user.absen.every((a) => checkedStatus[a.id] === "approve")
                                    )}
                                    onChange={() => {
                                        const allApproved = data.every((user) =>
                                            user.absen.every((a) => checkedStatus[a.id] === "approve")
                                        );
                                        const newStatus = {};
                                        data.forEach((user) =>
                                            user.absen.forEach((a) => {
                                                newStatus[a.id] = allApproved ? null : "approve";
                                            })
                                        );
                                        setCheckedStatus(newStatus);
                                    }}
                                    className="w-5 h-5 accent-green-600 border-2 border-green-500 rounded"
                                />
                                <span className="text-sm font-semibold text-green-700">Setujui Semua</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.every((user) =>
                                        user.absen.every((a) => checkedStatus[a.id] === "reject")
                                    )}
                                    onChange={() => {
                                        const allRejected = data.every((user) =>
                                            user.absen.every((a) => checkedStatus[a.id] === "reject")
                                        );
                                        const newStatus = {};
                                        data.forEach((user) =>
                                            user.absen.forEach((a) => {
                                                newStatus[a.id] = allRejected ? null : "reject";
                                            })
                                        );
                                        setCheckedStatus(newStatus);
                                    }}
                                    className="w-5 h-5 accent-red-500 border-2 border-red-500 rounded"
                                />
                                <span className="text-sm font-semibold text-red-700">Tolak Semua</span>
                            </label>
                        </div>

                        <div className="flex w-full sm:w-auto justify-between sm:justify-end gap-4">
                            <div className="flex flex-col gap-1 text-sm w-36">
                                <div className="flex justify-between px-3 py-1 bg-green-50 text-green-700 font-semibold rounded-md">
                                    <span>Disetujui</span>
                                    <span>{approved.length}</span>
                                </div>
                                <div className="flex justify-between px-3 py-1 bg-red-50 text-red-700 font-semibold rounded-md">
                                    <span>Ditolak</span>
                                    <span>{rejected.length}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleApproveAll}
                                disabled={isDisabled}
                                className={`px-6 py-3 rounded-lg font-semibold shadow-md h-fit ${isDisabled
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                )}

                {lightboxOpen && (
                    <Lightbox
                        open={lightboxOpen}
                        close={() => setLightboxOpen(false)}
                        slides={lightboxImages.map((img, idx) => ({
                            src: img,
                            title: idx === 0 ? "Foto Masuk" : "Foto Pulang",
                        }))}
                        index={lightboxIndex}
                    />
                )}
            </div>

            <Modal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                title="Informasi Batch Approval"
                note="Panduan singkat penggunaan fitur."
                size="lg"
                footer={
                    <button
                        onClick={() => setIsInfoModalOpen(false)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Mengerti
                    </button>
                }
            >
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div className="flex gap-3">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-green-600 text-lg mt-0.5" />
                        <p className="font-semibold text-gray-900">Panduan Penggunaan Batch Approval</p>
                    </div>

                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <span className="font-medium">Setiap karyawan</span> menampilkan daftar absen yang
                            masih menunggu proses persetujuan.
                        </li>

                        <li>
                            Tekan bagian header karyawan untuk{" "}
                            <span className="font-medium">membuka atau menutup daftar absen</span>.
                        </li>

                        <li>
                            Pada setiap tanggal absen, Anda dapat memilih:
                            <span className="font-medium text-green-700"> Approve</span> atau
                            <span className="font-medium text-red-700"> Reject</span>.
                        </li>

                        <li>
                            Anda dapat membuka detail absen untuk melihat: waktu masuk/pulang, lokasi, foto,
                            jarak, serta keterlambatan.
                        </li>

                        <li>
                            Tombol <span className="font-medium">Setujui Semua</span> dan{" "}
                            <span className="font-medium">Tolak Semua </span>
                            akan menerapkan keputusan pada seluruh data absen di halaman tersebut.
                        </li>

                        <li>
                            Jumlah total <span className="font-medium">Disetujui</span> dan
                            <span className="font-medium"> Ditolak</span> ditampilkan di bagian bawah halaman.
                        </li>

                        <li>
                            Tekan tombol <span className="font-medium text-green-700">Simpan</span> untuk
                            mengirimkan semua keputusan persetujuan sekaligus.
                        </li>

                        <li>
                            Pastikan seluruh pilihan sudah benar karena keputusan akan dikirim secara
                            <span className="font-medium"> batch</span> dan tidak dapat dibatalkan setelah
                            tersimpan.
                        </li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default AbsensiAbnormal;
