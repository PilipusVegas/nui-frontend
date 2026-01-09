import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "yet-another-react-lightbox/styles.css";
import Lightbox from "yet-another-react-lightbox";
import React, { useState, useEffect } from "react";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatFullDate, formatTime } from "../../../utils/dateUtils";
import { SectionHeader, SearchBar, Modal, EmptyState, LoadingSpinner, ErrorState } from "../../../components";
import { faChevronDown, faChevronUp, faMapMarkerAlt, faBuilding, faInfo, faInfoCircle, faGasPump, faHotel, faBriefcase, } from "@fortawesome/free-solid-svg-icons";

const AbsensiAbnormal = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [searchQuery, setSearchQuery] = useState("");
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const absenRefs = React.useRef({});
    const successApproveMessage = "Absensi berhasil disetujui. Terima kasih sudah melakukan verifikasi";

    const getAbnormalReason = (absen) => {
        const reasons = [];
        if (absen.jarak_mulai >= 60) {
            reasons.push("Jarak absen masuk terlalu jauh!");
        }
        if (absen.jarak_selesai >= 60) {
            reasons.push("Jarak absen pulang terlalu jauh!");
        }
        if (!absen.foto_mulai) {
            reasons.push("Foto absen masuk tidak tersedia!");
        }
        if (absen.absen_pulang && !absen.foto_selesai) {
            reasons.push("Foto absen pulang tidak tersedia!");
        }
        if (!absen.absen_pulang) {
            reasons.push("Belum absen pulang!");
        }
        return reasons;
    };


    const getAbnormalBadgeStyle = (reason) => {
        if (reason.includes("Jarak")) {
            return "bg-red-100 text-red-700 border-red-200";
        }
        if (reason.includes("Foto")) {
            return "bg-yellow-100 text-yellow-700 border-yellow-200";
        }
        if (reason.includes("Belum absen")) {
            return "bg-orange-100 text-orange-700 border-orange-200";
        }
        return "bg-gray-100 text-gray-700 border-gray-200";
    };

    const renderTunjanganBadges = (tunjangan) => {

        if (!tunjangan) return null;

        const badges = [];

        if (tunjangan.transport) {
            badges.push(
                <span key="transport" className="flex items-center gap-1 px-2 py-[2px] rounded-md border text-[11px] font-semibold bg-orange-100 text-orange-700 border-orange-200">
                    <FontAwesomeIcon icon={faGasPump} />
                    Tunjangan Transport
                </span>
            );
        }

        if (tunjangan.night_shift) {
            badges.push(
                <span key="night" className="flex items-center gap-1 px-2 py-[2px] rounded-md border text-[11px] font-semibold bg-indigo-100 text-indigo-700 border-indigo-200">
                    <FontAwesomeIcon icon={faHotel} />
                    Tunjangan Penginapan
                </span>
            );
        }

        if (badges.length === 0) return null;

        return <div className="flex flex-wrap gap-1">{badges}</div>;
    };


    const getTunjanganList = (tunjangan) => {
        if (!tunjangan) return [];
        const list = [];
        if (tunjangan.transport) list.push("Tunjangan Transport Uang Bensin");
        if (tunjangan.night_shift) list.push("Tunjangan Penginapan");
        return list;
    };


    const submitSingleDecision = async ({ id_absen, action, user, absen }) => {
        if (action === "approve") {
            const abnormalReasons = getAbnormalReason(absen);
            if (abnormalReasons.length > 0) {
                const tunjanganList = getTunjanganList(absen.tunjangan);
                const { isConfirmed } = await Swal.fire({
                    icon: "warning",
                    title: "Konfirmasi Persetujuan Absensi",
                    html: `
                    <div style="text-align:left;font-size:14px;line-height:1.6">
                        <p>Absensi ini memiliki ketidaksesuaian:</p>
                        <ul style="padding-left:18px">
                            ${abnormalReasons.map(r => `<li>${r}</li>`).join("")}
                        </ul>
                        <p style="margin-top:10px">
                            Jika disetujui, absensi akan diproses sebagai data valid.
                        </p>
                    </div>
                `,
                    showCancelButton: true,
                    confirmButtonText: "Setujui Absensi",
                    cancelButtonText: "Batal",
                    confirmButtonColor: "#16a34a",
                    cancelButtonColor: "#9ca3af",
                    reverseButtons: true,
                });
                if (!isConfirmed) return;
                if (tunjanganList.length > 0) {
                    await Swal.fire({
                        icon: "info",
                        title: "Tunjangan Diberikan",
                        html: `
                        <ul style="padding-left:18px">
                            ${tunjanganList.map(t => `<li>${t}</li>`).join("")}
                        </ul>
                    `,
                        confirmButtonText: "Mengerti",
                        confirmButtonColor: "#2563eb",
                    });
                }
            }
        }

        /* ================= REJECT ================= */
        if (action === "reject") {
            const abnormalReasons = getAbnormalReason(absen);

            const { isConfirmed } = await Swal.fire({
                icon: "warning",
                title: "Konfirmasi Penolakan Absensi",
                html: `
                <div style="text-align:left;font-size:14px;line-height:1.6">
                    <p>
                        Anda akan <strong>menolak absensi</strong> ini.
                    </p>

                    ${abnormalReasons.length > 0
                        ? `
                            <p style="margin-top:8px">Catatan:</p>
                            <ul style="padding-left:18px">
                                ${abnormalReasons.map(r => `<li>${r}</li>`).join("")}
                            </ul>
                            `
                        : ""
                    }

                    <p style="margin-top:10px">
                        Absensi yang ditolak <strong>tidak akan masuk</strong>
                        ke pencatatan <strong>penggajian dan tunjangan</strong>.
                    </p>

                    <p style="margin-top:10px;color:#6b7280;font-size:13px">
                        Pastikan keputusan ini sudah sesuai kebijakan.
                    </p>
                </div>
            `,
                showCancelButton: true,
                confirmButtonText: "Tolak Absensi",
                cancelButtonText: "Batal",
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#9ca3af",
                reverseButtons: true,
            });

            if (!isConfirmed) return;
        }

        /* ================= SUBMIT KE API ================= */
        setProcessingId(id_absen);

        try {
            const payload = {
                id_absen_approved: action === "approve" ? [id_absen] : [],
                id_absen_rejected: action === "reject" ? [id_absen] : [],
            };

            const res = await fetchWithJwt(`${apiUrl}/absen/status/batch`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }).then((r) => r.json());

            if (!res.success) throw new Error();

            toast.success(
                action === "approve"
                    ? successApproveMessage
                    : "Absensi berhasil ditolak dan tidak diproses ke penggajian."
            );

            await loadBatch();

            const userAfterUpdate = data.find(u => u.id_user === user.id_user);

            const masihAdaPending =
                userAfterUpdate?.absen?.some(a => a.status === 0);

            // ❗ Jika sudah tidak ada pending → tutup & scroll ke atas
            if (!masihAdaPending) {
                setExpandedUserId(null);

                requestAnimationFrame(() => {
                    scrollToTop();
                });
            }


        } catch {
            toast.error("Gagal menyimpan keputusan. Silakan coba lagi.");
        } finally {
            setProcessingId(null);
        }
    };



    const handleOpenLightbox = (images, index) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };


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
        setExpandedUserId((prev) =>
            prev === user.id_user ? null : user.id_user
        );
    };


    useEffect(() => {
        if (!expandedUserId) return;
        const user = filteredData.find((u) => u.id_user === expandedUserId);
        if (!user || user.absen.length === 0) return;
        const firstAbsenId = user.absen[0].id;
        const el = absenRefs.current[firstAbsenId];
        if (!el) return;
        // tunggu DOM settle (render + height final)
        requestAnimationFrame(() => {
            el.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        });
    }, [expandedUserId, filteredData]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const renderDinasBadge = (absen) => {
        if (!absen?.dinas?.is_dinas) return null;

        return (
            <button onClick={(e) => { e.stopPropagation(); navigate(`/pengajuan-dinas/${absen.dinas.id_dinas}`);}} className="flex items-center gap-1 px-2 py-[2px] rounded-md  border border-purple-300 bg-purple-100  text-purple-700 text-[11px] font-bold  hover:bg-purple-200 transition whitespace-nowrap" title="Klik untuk melihat detail pengajuan dinas">
                <FontAwesomeIcon icon={faBriefcase} />
                Tunjangan Perjalanan Dinas
            </button>
        );
    };


    return (
        <div className="min-h-screen flex flex-col relative">
            <SectionHeader title="Absensi Tidak Valid" subtitle="Daftar absensi yang perlu diverifikasi dan disetujui untuk menjaga data kehadiran tetap akurat." onBack={() => navigate("/pengajuan-absensi")}
                actions={
                    <button onClick={() => setIsInfoModalOpen(true)} className="flex items-center justify-center px-4 sm:px-4 py-2 text-sm font-semibold rounded-md text-white bg-blue-500 hover:bg-blue-600 gap-1">
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
                searchQuery ? (
                    <EmptyState title="Data Tidak Ditemukan" message={`Tidak ada absensi abnormal untuk "${searchQuery}".`}/>
                ) : (
                    <EmptyState title="Semua Absensi Telah Disetujui" message="Saat ini tidak ada absensi yang perlu diverifikasi."/>
                )
            )}

            <div className="space-y-4 pb-32">
                {filteredData.map((user) => {
                    return (
                        <div key={user.id_user} className="rounded-xl overflow-hidden shadow-lg transition hover:shadow-xl">
                            <div onClick={(e) => { e.stopPropagation(); toggleUserCard(user); }}
                                className={`relative w-full cursor-pointer rounded-2xl border px-5 py-4 bg-white transition-all duration-200 hover:shadow-md ${expandedUserId === user.id_user ? "border-emerald-300 shadow-sm" : "border-gray-200"}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={` w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${expandedUserId === user.id_user ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
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
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                            <span className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                                                {user.absen.filter((a) => a.status === 0).length} Total Absensi Abnormal
                                            </span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); toggleUserCard(user); }} className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${expandedUserId === user.id_user ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                            <FontAwesomeIcon icon={expandedUserId === user.id_user ? faChevronUp : faChevronDown} className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {expandedUserId === user.id_user && (
                                <div className="divide-y divide-gray-200 bg-gray-50">
                                    {user.absen.map((a) => {
                                        return (
                                            <div key={a.id} ref={(el) => (absenRefs.current[a.id] = el)} className="p-2">
                                                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 sm:p-5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">
                                                                {formatFullDate(a.tanggal_absen)}
                                                            </p>
                                                            {getAbnormalReason(a).length > 0 && (
                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                    <span className="text-[11px] font-semibold text-gray-800 whitespace-nowrap">
                                                                        Analisa Sistem:
                                                                    </span>
                                                                    {getAbnormalReason(a).map((reason, idx) => (
                                                                        <span key={idx} className={`px-2 py-0.5 rounded border text-[10px] font-semibold leading-tight ${getAbnormalBadgeStyle(reason)}`}>
                                                                            {reason}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-5 sm:gap-6">
                                                            <label className="flex items-center gap-2 text-green-600 font-semibold" onClick={(e) => e.stopPropagation()}>
                                                                <input type="checkbox" checked={a.status === 1} disabled={processingId === a.id} onChange={() =>
                                                                    submitSingleDecision({
                                                                        id_absen: a.id,
                                                                        action: "approve",
                                                                        user,
                                                                        absen: a,
                                                                    })
                                                                }
                                                                    className="w-5 h-5 accent-green-600" />
                                                                Setujui
                                                            </label>

                                                            <label className="flex items-center gap-2 text-red-600 font-semibold" onClick={(e) => e.stopPropagation()}>
                                                                <input type="checkbox" checked={a.status === 2} disabled={processingId === a.id}
                                                                    onChange={() =>
                                                                        submitSingleDecision({
                                                                            id_absen: a.id,
                                                                            action: "reject",
                                                                            user,
                                                                            absen: a, // ⬅️ WAJIB
                                                                        })
                                                                    }
                                                                    className="w-5 h-5 accent-red-600"
                                                                />

                                                                Tolak
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="pt-3 mt-3 border-t border-gray-300">
                                                        <div className="space-y-5">
                                                            <div className="space-y-3">
                                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="flex items-center gap-1 text-[12px] font-bold text-gray-800">
                                                                            Hak Tunjangan :
                                                                        </span>
                                                                        {renderDinasBadge(a)}
                                                                        {renderTunjanganBadges(a.tunjangan, a)}
                                                                        {!a?.dinas?.is_dinas && !renderTunjanganBadges(a.tunjangan, a) && (
                                                                            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border">
                                                                                Tidak Ada
                                                                            </span>
                                                                        )}
                                                                    </div>


                                                                    <span className="inline-flex items-center text-[12px] font-semibold  text-blue-700 bg-blue-100 px-3 py-1 rounded-md  border border-blue-400 whitespace-nowrap">
                                                                        Shift {a.nama_shift}
                                                                        <span className="mx-1">•</span>
                                                                        {a.shift_masuk} – {a.shift_pulang}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex flex-col gap-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-semibold text-green-700 text-base">
                                                                            Absen Masuk
                                                                        </p>
                                                                        {a.keterlambatan && (
                                                                            <span className="text-xs font-semibold text-red-600">
                                                                                Terlambat {a.keterlambatan} menit
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                                        <div className="flex-shrink-0">
                                                                            {a.foto_mulai ? (
                                                                                <img src={a.foto_mulai} alt="Foto Absen Masuk" className="w-28 h-28 object-cover rounded-lg border border-green-300 cursor-pointer hover:opacity-90 transition" onClick={() => handleOpenLightbox([a.foto_mulai, a.foto_selesai].filter(Boolean), 0)} />
                                                                            ) : (
                                                                                <div className="w-28 h-28 flex items-center justify-center text-xs text-gray-400 italic border rounded-lg">
                                                                                    Tidak ada foto
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 text-sm text-gray-800 space-y-1 break-words">
                                                                            <p>
                                                                                <span className="font-medium">Waktu:</span>{" "}
                                                                                {formatTime(a.absen_masuk)}
                                                                            </p>
                                                                            <p>
                                                                                <span className="font-medium">Tanggal:</span>{" "}
                                                                                {formatFullDate(a.absen_masuk)}
                                                                            </p>
                                                                            <p className="flex items-start gap-2">
                                                                                <FontAwesomeIcon icon={faBuilding} className="mt-0.5 text-gray-600" />
                                                                                <span className="break-words">
                                                                                    <span className="font-medium">Lokasi Kerja:</span>{" "}
                                                                                    {a.tempat_mulai}
                                                                                </span>
                                                                            </p>
                                                                            <p className="flex items-start gap-2">
                                                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-0.5 text-green-700" />
                                                                                <a href={`https://www.google.com/maps?q=${a.titik_mulai_pengguna}`} target="_blank" className="font-medium underline hover:text-green-800 break-all">
                                                                                    Lihat lokasi absensi
                                                                                </a>
                                                                            </p>
                                                                            <p>
                                                                                <span className="font-medium">Jarak:</span>{" "}
                                                                                {a.jarak_mulai} m
                                                                                {a.jarak_mulai > 60 && (
                                                                                    <span className="text-red-600 font-medium ml-1">
                                                                                        (Terlalu jauh)
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex flex-col gap-4">
                                                                    <p className="font-semibold text-rose-700 text-base">
                                                                        Absen Pulang
                                                                    </p>
                                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                                        <div className="flex-shrink-0">
                                                                            {a.absen_pulang && a.foto_selesai ? (
                                                                                <img src={a.foto_selesai} alt="Foto Absen Pulang" className="w-28 h-28 object-cover rounded-lg border border-rose-300 cursor-pointer hover:opacity-90 transition"
                                                                                    onClick={() =>
                                                                                        handleOpenLightbox(
                                                                                            [a.foto_mulai, a.foto_selesai].filter(Boolean),
                                                                                            1
                                                                                        )
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <div className="w-28 h-28 flex items-center justify-center text-xs text-rose-400 italic border rounded-lg">
                                                                                    Belum absen
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {a.absen_pulang && (
                                                                            <div className="flex-1 text-sm text-gray-800 space-y-1 break-words">
                                                                                <p>
                                                                                    <span className="font-medium">Waktu:</span>{" "}
                                                                                    {formatTime(a.absen_pulang)}
                                                                                </p>
                                                                                <p>
                                                                                    <span className="font-medium">Tanggal:</span>{" "}
                                                                                    {formatFullDate(a.absen_pulang)}
                                                                                </p>
                                                                                <p className="flex items-start gap-2">
                                                                                    <FontAwesomeIcon icon={faBuilding} className="mt-0.5 text-gray-600" />
                                                                                    <span className="break-words">
                                                                                        <span className="font-medium">Lokasi Kerja:</span>{" "}
                                                                                        {a.tempat_selesai || "—"}
                                                                                    </span>
                                                                                </p>
                                                                                <p className="flex items-start gap-2">
                                                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-0.5 text-red-700" />
                                                                                    <a href={`https://www.google.com/maps?q=${a.titik_selesai_pengguna}`} target="_blank" className="font-medium underline hover:text-rose-800 break-all">
                                                                                        Lihat lokasi absensi
                                                                                    </a>
                                                                                </p>
                                                                                <p>
                                                                                    <span className="font-medium">Jarak:</span>{" "}
                                                                                    {a.jarak_selesai || 0} m
                                                                                    {a.jarak_selesai > 60 && (
                                                                                        <span className="text-red-600 font-medium ml-1">
                                                                                            (Terlalu jauh)
                                                                                        </span>
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="border-t border-gray-200 pt-3 space-y-1.5">
                                                                <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                                                                    Keterangan Deskripsi
                                                                </p>
                                                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
                                                                    {a.deskripsi || (
                                                                        <span className="italic text-gray-400">
                                                                            Tidak ada deskripsi
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {lightboxOpen && (
                    <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={lightboxImages.map((img, idx) => ({ src: img, title: idx === 0 ? "Foto Masuk" : "Foto Pulang", }))} index={lightboxIndex} />
                )}
            </div>

            <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Informasi Batch Approval" note="Panduan singkat penggunaan fitur." size="lg"
                footer={
                    <button onClick={() => setIsInfoModalOpen(false)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        Mengerti
                    </button>
                }
            >
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 text-lg mt-0.5" />
                        <div>
                            <p className="font-semibold text-gray-900">
                                Panduan Halaman Absensi Abnormal
                            </p>
                            <p className="text-xs text-gray-500">
                                Informasi penggunaan halaman verifikasi absensi karyawan
                            </p>
                        </div>
                    </div>

                    {/* Penjelasan Umum */}
                    <div className="space-y-2">
                        <p>
                            Halaman ini digunakan untuk <span className="font-medium">
                                meninjau absensi karyawan yang terdeteksi tidak normal
                            </span> dan memerlukan <span className="font-medium">
                                verifikasi dari HRD
                            </span> sebelum diproses lebih lanjut.
                        </p>

                        <p>
                            Setiap data absensi perlu ditentukan apakah
                            <strong> disetujui</strong> atau
                            <strong> ditolak</strong>, agar data kehadiran,
                            penggajian, dan tunjangan tetap tercatat dengan akurat
                            dan sesuai kebijakan perusahaan.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="font-semibold text-gray-900">
                            Cara Menggunakan Halaman
                        </p>

                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                Setiap <strong>kartu karyawan</strong> menampilkan daftar
                                absensi yang perlu diverifikasi.
                            </li>

                            <li>
                                Klik <strong>nama karyawan</strong> untuk membuka atau
                                menutup detail absensi.
                            </li>

                            <li>
                                Pada setiap tanggal absensi, HRD dapat memilih:
                                <span className="font-medium text-green-700"> Setujui </span>
                                atau
                                <span className="font-medium text-red-700"> Tolak</span>.
                            </li>

                            <li>
                                Detail absensi dapat dibuka untuk melihat informasi lengkap,
                                seperti <span className="font-medium">
                                    waktu masuk dan pulang, lokasi absensi, foto pendukung,
                                    jarak absensi dari lokasi kerja, serta keterangan tambahan
                                </span>.
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <p className="font-semibold text-gray-900">
                            Jika Absensi Disetujui
                        </p>

                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                Sistem akan menampilkan <strong>konfirmasi</strong>,
                                terutama jika terdapat ketidaksesuaian pada data absensi.
                            </li>

                            <li>
                                Absensi yang disetujui akan dianggap <strong>valid </strong>
                                dan <strong>diproses ke dalam pencatatan kehadiran serta
                                    penggajian</strong>.
                            </li>

                            <li>
                                Jika karyawan berhak menerima tunjangan
                                (misalnya transport atau penginapan),
                                sistem akan menampilkan <strong>informasi tunjangan
                                    yang diberikan</strong> sebagai pemberitahuan.
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <p className="font-semibold text-gray-900">
                            Jika Absensi Ditolak
                        </p>

                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                Sistem akan meminta <strong>konfirmasi penolakan </strong>
                                sebelum keputusan disimpan.
                            </li>

                            <li>
                                Absensi yang ditolak <strong>tidak akan masuk </strong>
                                ke dalam proses <strong>penggajian maupun perhitungan tunjangan</strong>.
                            </li>

                            <li>
                                Keputusan penolakan bersifat <strong>final</strong> dan
                                mengikuti kebijakan perusahaan yang berlaku.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                        <p className="font-medium text-gray-700 mb-1">
                            Catatan Penting
                        </p>
                        <p>
                            Setelah seluruh absensi milik satu karyawan selesai diverifikasi,
                            sistem akan <strong>menutup kartu karyawan secara otomatis </strong>
                            dan <strong>mengembalikan tampilan ke bagian atas halaman </strong>
                            untuk memudahkan proses verifikasi karyawan berikutnya.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AbsensiAbnormal;
