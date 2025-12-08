import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faMapMarkerAlt, faBuilding, faInfo, faClock, faMagnifyingGlass, faExternalLinkAlt, faListCheck, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatFullDate, formatTime } from "../../../utils/dateUtils";
import { SectionHeader, SearchBar, Modal } from "../../../components";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const BatchApproval = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [searchQuery, setSearchQuery] = useState("");
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [checkedStatus, setCheckedStatus] = useState({});
    const [openDetailId, setOpenDetailId] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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
        if (!approved.length && !rejected.length) return toast.error("Belum ada absen yang dipilih");
        try {
            const res = await fetchWithJwt(`${apiUrl}/absen/status/batch`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_absen_approved: approved, id_absen_rejected: rejected })
            }).then(r => r.json());
            res.success ? toast.success("Berhasil disetujui / ditolak") : toast.error("Gagal update");
            setCheckedStatus({});
        } catch {
            toast.error("Terjadi kesalahan");
        }
    };

    const handleOpenLightbox = (images, index) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const { approved, rejected } = getSelectedStatus();
    const totalSelected = approved.length + rejected.length;
    const isDisabled = totalSelected === 0;

    const filteredData = data.filter(user =>
        user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const loadBatch = async () => {
            try {
                const response = await fetchWithJwt(`${apiUrl}/absen/status/batch`);
                const res = await response.json();
                if (res.success) {
                    setData(res.data);
                } else {
                    toast.error("Gagal memuat data");
                }
            } catch (err) {
                toast.error("Terjadi kesalahan");
                console.error(err);
            }
        };
        loadBatch();
    }, []);

    return (
        <div>
            <SectionHeader title="Batch Approval Absensi" subtitle="Kelola pengajuan absensi karyawan secara cepat. Pilih, setujui, atau tolak absen dalam satu langkah." onBack={() => navigate("/home")}
                actions={
                    <button onClick={() => setIsInfoModalOpen(true)} className="flex items-center justify-center px-4 sm:px-4 py-2 text-sm font-semibold rounded-md text-white bg-blue-500 hover:bg-blue-600 gap-1" >
                        <FontAwesomeIcon icon={faInfo} className="mr-0 sm:mr-1" />
                        <span className="hidden sm:inline">Informasi</span>
                    </button>
                } />

            <div className="mb-4 w-full">
                <SearchBar placeholder="Cari karyawan..." onSearch={(val) => setSearchQuery(val)} />
            </div>

            <div className="space-y-4">
                {filteredData.map(user => {
                    return (
                        <div key={user.id_user} className="rounded-xl overflow-hidden shadow-lg border border-gray-200 transition hover:shadow-xl">
                            <div className=" flex flex-col sm:flex-row justify-between items-start sm:items-center w-full px-5 py-4 shadow-lg hover:shadow-xl bg-gradient-to-br from-green-500/80 to-green-500/85 backdrop-blur-md text-white transition-all duration-300 border border-white/20 space-y-3 sm:space-y-0 cursor-pointer"
                                onClick={() =>
                                    setExpandedUserId(prev =>
                                        prev === user.id_user ? null : user.id_user
                                    )
                                }
                            >
                                <div className="flex items-center justify-between w-full sm:w-auto">
                                    <div className="flex flex-col select-none gap-0.5">
                                        <p className="text-base sm:text-lg font-semibold leading-tight">
                                            {user.nama}
                                        </p>

                                        <p className="text-xs sm:text-sm opacity-90 tracking-wide">
                                            {user.role} · NIP {user.nip}
                                        </p>
                                    </div>

                                    <div className="sm:hidden ml-3 w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all active:scale-95"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedUserId(prev =>
                                                prev === user.id_user ? null : user.id_user
                                            );
                                        }}
                                    >
                                        <FontAwesomeIcon icon={expandedUserId === user.id_user ? faChevronUp : faChevronDown} className="text-white text-lg" />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
                                    <div className="flex flex-row sm:flex-col justify-between text-xs gap-1 sm:gap-0.5">
                                        <span className="font-semibold drop-shadow-sm">
                                            {user.absen.filter(a => checkedStatus[a.id] === 'approve').length} Disetujui
                                        </span>
                                        <span className="font-semibold drop-shadow-sm">
                                            {user.absen.filter(a => checkedStatus[a.id] === 'reject').length} Ditolak
                                        </span>
                                        <span className="font-semibold drop-shadow-sm">
                                            {user.absen.filter(a => a.status === 0).length} Total
                                        </span>
                                    </div>
                                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 cursor-pointer transition-all active:scale-95"
                                        onClick={(e) => {
                                            e.stopPropagation(); setExpandedUserId(prev => prev === user.id_user ? null : user.id_user);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={expandedUserId === user.id_user ? faChevronUp : faChevronDown} className="text-white text-lg" />
                                    </div>
                                </div>
                            </div>

                            {expandedUserId === user.id_user && (
                                <div className="divide-y divide-gray-200 bg-gray-50">
                                    {user.absen.map(a => {
                                        return (
                                            <div key={a.id} className="p-4">
                                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-4 sm:p-5">

                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer" onClick={() => setOpenDetailId((prev) => (prev === a.id ? null : a.id))}>
                                                        <div className="flex-1">
                                                            <p className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">
                                                                {formatFullDate(a.tanggal_absen)}
                                                            </p>
                                                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                                                Masuk: {a.absen_masuk ? formatTime(a.absen_masuk) : "-"} •
                                                                Pulang: {a.absen_pulang ? formatTime(a.absen_pulang) : "-"}
                                                            </p>
                                                        </div>

                                                        {/* APPROVE / REJECT */}
                                                        <div className="flex items-center gap-5 sm:gap-6">
                                                            <label className="flex items-center gap-2 text-green-600 text-sm font-semibold select-none" onClick={(e) => e.stopPropagation()}>
                                                                <input type="checkbox" checked={checkedStatus[a.id] === "approve"} onClick={(e) => e.stopPropagation()} onChange={() =>
                                                                        setCheckedStatus((prev) => ({
                                                                            ...prev,
                                                                            [a.id]: prev[a.id] === "approve" ? null : "approve",
                                                                        }))
                                                                    }
                                                                    className="w-4 h-4 accent-green-600"
                                                                />
                                                                <span onClick={(e) => e.stopPropagation()}>Setujui</span>
                                                            </label>


                                                            <label className="flex items-center gap-2 text-red-600 text-sm font-semibold select-none" onClick={(e) => e.stopPropagation()}>
                                                                <input type="checkbox" checked={checkedStatus[a.id] === "reject"} onClick={(e) => e.stopPropagation()}
                                                                    onChange={() =>
                                                                        setCheckedStatus((prev) => ({
                                                                            ...prev,
                                                                            [a.id]: prev[a.id] === "reject" ? null : "reject",
                                                                        }))
                                                                    }
                                                                    className="w-4 h-4 accent-red-600"
                                                                />
                                                                <span onClick={(e) => e.stopPropagation()}>Tolak</span>
                                                            </label>


                                                            <FontAwesomeIcon icon={faChevronDown} className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openDetailId === a.id ? "rotate-180" : ""}`} />
                                                        </div>
                                                    </div>

                                                    {/* DETAIL MENYATU DI DALAM CARD */}
                                                    {openDetailId === a.id && (
                                                        <div className="pt-6 mt-6 border-t border-gray-200 space-y-6">

                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm sm:text-base font-semibold text-gray-900">
                                                                    Jadwal Shift Hari ini : {a.nama_shift}
                                                                    <span className="text-gray-600 font-medium ml-1">
                                                                        ({a.shift_masuk} - {a.shift_pulang})
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                                                {/* =================== ABSEN MASUK =================== */}
                                                                <div className="p-4 rounded-xl border border-green-200 bg-green-50 flex flex-col sm:flex-row gap-4 items-start">

                                                                    <div className="flex-shrink-0 flex flex-col items-center sm:items-start space-y-2 sm:w-1/3">
                                                                        <p className="font-semibold text-green-800 text-lg sm:text-xl text-center sm:text-left">
                                                                            Absen Masuk
                                                                        </p>
                                                                        <div className="w-full border-b border-green-200"></div>

                                                                        {a.foto_mulai ? (
                                                                            <img src={a.foto_mulai} alt="Absen Masuk" className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border border-green-300 cursor-pointer" onClick={() => handleOpenLightbox([a.foto_mulai, a.foto_selesai].filter(Boolean), 0)} />
                                                                        ) : (
                                                                            <p className="text-xs text-gray-400 italic text-center py-8 w-28 sm:w-32">
                                                                                Foto belum tersedia
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex-1 space-y-2 text-gray-700 text-sm sm:text-base">
                                                                        <p className="font-semibold text-green-700 pb-1">Informasi Kehadiran</p>
                                                                        <div className="w-full border-b border-green-200"></div>

                                                                        <p><span className="font-medium">Waktu Masuk:</span> {formatTime(a.absen_masuk)}</p>
                                                                        <p><span className="font-medium">Tanggal Masuk:</span> {formatFullDate(a.absen_masuk)}</p>

                                                                        <p className="flex items-center gap-2">
                                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
                                                                            Lokasi Absen:
                                                                            <a href={`https://www.google.com/maps?q=${a.titik_mulai_pengguna}`} target="_blank" className="font-medium underline hover:text-green-800">
                                                                                Lihat Maps
                                                                                <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs ml-1" />
                                                                            </a>
                                                                        </p>

                                                                        <p className="flex items-center gap-2">
                                                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-500" />
                                                                            Tempat Kerja: <span className="font-medium">{a.tempat_mulai}</span>
                                                                        </p>

                                                                        <p>Jarak: <span className="font-medium">{a.jarak_mulai} m</span>
                                                                            {a.jarak_mulai > 60 && <span className="text-red-500 font-medium ml-1">(Terlalu jauh)</span>}
                                                                        </p>

                                                                        {a.keterlambatan && <p className="text-red-600 font-medium">Terlambat: {a.keterlambatan} menit</p>}
                                                                    </div>
                                                                </div>

                                                                {/* =================== ABSEN PULANG =================== */}
                                                                <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex flex-col sm:flex-row gap-4 items-start">

                                                                    {/* FOTO & JUDUL */}
                                                                    <div className="flex-shrink-0 flex flex-col items-center sm:items-start space-y-2 sm:w-1/3">
                                                                        <p className="font-semibold text-red-700 text-lg sm:text-xl text-center sm:text-left">
                                                                            Absen Pulang
                                                                        </p>
                                                                        <div className="w-full border-b border-red-200"></div>

                                                                        {!a.absen_pulang ? (
                                                                            <p className="text-xs text-red-400 italic text-center py-8 w-28 sm:w-32">
                                                                                Belum melakukan absen pulang
                                                                            </p>
                                                                        ) : (
                                                                            <img src={a.foto_selesai} alt="Absen Pulang" className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border border-red-300 cursor-pointer"
                                                                                onClick={() => handleOpenLightbox([a.foto_mulai, a.foto_selesai].filter(Boolean), 1)
                                                                                }
                                                                            />
                                                                        )}
                                                                    </div>

                                                                    {/* INFO DETAIL */}
                                                                    {a.absen_pulang && (
                                                                        <div className="flex-1 space-y-2 text-gray-700 text-sm sm:text-base">
                                                                            <p className="font-semibold text-red-700 pb-1">Informasi Kepulangan</p>
                                                                            <div className="w-full border-b border-red-200"></div>
                                                                            <p><span className="font-medium">Waktu Pulang:</span> {formatTime(a.absen_pulang)}</p>
                                                                            <p><span className="font-medium">Tanggal Pulang:</span> {formatFullDate(a.absen_pulang)}</p>
                                                                            <p className="flex items-center gap-2">
                                                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-600" />
                                                                                Lokasi Absen:
                                                                                <a href={`https://www.google.com/maps?q=${a.titik_selesai_pengguna}`} target="_blank" className="font-medium underline hover:text-red-800">
                                                                                    Lihat Maps
                                                                                    <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs ml-1" />
                                                                                </a>
                                                                            </p>
                                                                            <p className="flex items-center gap-2">
                                                                                <FontAwesomeIcon icon={faBuilding} className="text-gray-500" />
                                                                                Tempat Kerja: <span className="font-medium">{a.tempat_selesai || "Belum Absen"}</span>
                                                                            </p>
                                                                            <p>
                                                                                Jarak: <span className="font-medium">{a.jarak_selesai || 0} m</span>
                                                                                {a.jarak_selesai > 60 && <span className="text-red-500 font-medium ml-1">(Terlalu jauh)</span>}
                                                                            </p>
                                                                        </div>
                                                                    )}
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

                <div className="sticky bottom-0 bg-white/90 backdrop-blur-md  border-t border-gray-200 p-4 rounded-xl shadow-lg flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center z-10">
                    <div className="flex justify-between w-full sm:justify-start sm:w-auto gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" checked={data.every(user => user.absen.every(a => checkedStatus[a.id] === "approve"))}
                                onChange={() => {
                                    const allApproved = data.every(user =>
                                        user.absen.every(a => checkedStatus[a.id] === "approve")
                                    );
                                    const newStatus = {};
                                    data.forEach(user =>
                                        user.absen.forEach(a => {
                                            newStatus[a.id] = allApproved ? null : "approve";
                                        })
                                    );
                                    setCheckedStatus(newStatus);
                                }}
                                className="w-5 h-5 accent-green-600 border-2 border-green-500 rounded"
                            />
                            <span className="text-sm font-semibold text-green-700">
                                Setujui Semua
                            </span>
                        </label>

                        {/* Tolak Semua */}
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" checked={data.every(user => user.absen.every(a => checkedStatus[a.id] === "reject"))}
                                onChange={() => {
                                    const allRejected = data.every(user =>
                                        user.absen.every(a => checkedStatus[a.id] === "reject")
                                    );
                                    const newStatus = {};
                                    data.forEach(user =>
                                        user.absen.forEach(a => {
                                            newStatus[a.id] = allRejected ? null : "reject";
                                        })
                                    );
                                    setCheckedStatus(newStatus);
                                }}
                                className="w-5 h-5 accent-red-500 border-2 border-red-500 rounded"
                            />
                            <span className="text-sm font-semibold text-red-700">
                                Tolak Semua
                            </span>
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

                        <button onClick={handleApproveAll} disabled={isDisabled} className={`px-6 py-3 rounded-lg font-semibold shadow-md h-fit ${isDisabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                            Simpan
                        </button>
                    </div>
                </div>

                {lightboxOpen && (
                    <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={lightboxImages.map((img, idx) => ({ src: img, title: idx === 0 ? "Foto Masuk" : "Foto Pulang" }))} index={lightboxIndex} />
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

                    <div className="flex gap-3">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-green-600 text-lg mt-0.5" />
                        <p className="font-semibold text-gray-900">Panduan Penggunaan Batch Approval</p>
                    </div>

                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <span className="font-medium">Setiap karyawan</span> menampilkan daftar absen yang masih menunggu proses persetujuan.
                        </li>

                        <li>
                            Tekan bagian header karyawan untuk <span className="font-medium">membuka atau menutup daftar absen</span>.
                        </li>

                        <li>
                            Pada setiap tanggal absen, Anda dapat memilih:
                            <span className="font-medium text-green-700"> Approve</span> atau
                            <span className="font-medium text-red-700"> Reject</span>.
                        </li>

                        <li>
                            Anda dapat membuka detail absen untuk melihat:
                            waktu masuk/pulang, lokasi, foto, jarak, serta keterlambatan.
                        </li>

                        <li>
                            Tombol <span className="font-medium">Setujui Semua</span> dan <span className="font-medium">Tolak Semua </span>
                            akan menerapkan keputusan pada seluruh data absen di halaman tersebut.
                        </li>

                        <li>
                            Jumlah total <span className="font-medium">Disetujui</span> dan
                            <span className="font-medium"> Ditolak</span> ditampilkan di bagian bawah halaman.
                        </li>

                        <li>
                            Tekan tombol <span className="font-medium text-green-700">Simpan</span> untuk mengirimkan semua keputusan persetujuan sekaligus.
                        </li>

                        <li>
                            Pastikan seluruh pilihan sudah benar karena keputusan akan dikirim secara
                            <span className="font-medium"> batch</span> dan tidak dapat dibatalkan setelah tersimpan.
                        </li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default BatchApproval;