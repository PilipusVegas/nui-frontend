import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatFullDate, formatISODate } from "../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SectionHeader } from "../../components";
import { faTasks, faClock, faCalendar, faTag, faEdit, faPause, faPlay } from "@fortawesome/free-solid-svg-icons";

const DetailPenugasan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [tugas, setTugas] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchTugas = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`);
                if (!res.ok) throw new Error(`Gagal mengambil data tugas. Status: ${res.status}`);
                const data = await res.json();
                setTugas(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTugas();
    }, [id, apiUrl]);

    const handleUpdateStatus = async (isComplete) => {
        try {
            const payload = {
                nama: tugas.nama,
                start_date: formatISODate(tugas.start_date),
                deadline_at: formatISODate(tugas.deadline_at),
                category: tugas.category,
                is_complete: isComplete,
                worker_list: tugas.details || [],
            };

            const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Status ${res.status}`);

            toast.success(`Penugasan berhasil ${isComplete ? "diselesaikan" : "dibuka kembali"}.`);
            setTugas({ ...tugas, is_complete: isComplete });
        } catch (err) {
            console.error("Gagal memperbarui status:", err);
            toast.error("Gagal memperbarui status penugasan.");
        }
    };

    const handleTogglePause = async (detailId, isPaused) => {
        try {
            const updatedWorkers = tugas.details.map((w) =>
                w.id === detailId ? { ...w, is_paused: isPaused ? 0 : 1 } : w
            );

            const payload = {
                nama: tugas.nama,
                start_date: formatISODate(tugas.start_date),
                category: tugas.category,
                deadline_at: formatISODate(tugas.deadline_at),
                is_complete: tugas.is_complete,
                worker_list: updatedWorkers,
            };

            const res = await fetchWithJwt(`${apiUrl}/tugas/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Status ${res.status}`);

            toast.success(`Tugas berhasil ${isPaused ? "dijalankan kembali" : "dipause"}.`);

            setTugas((prev) => ({
                ...prev,
                details: updatedWorkers,
            }));
        } catch (err) {
            console.error("Gagal toggle pause:", err);
            toast.error("Gagal memperbarui status tugas.");
        }
    };


    return (
        <div>
            <SectionHeader title="Detail Penugasan" subtitle="Informasi lengkap penugasan dan pekerja terkait" onBack={() => navigate("/penugasan")} />

            <main className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-6 pt-4 w-full transition-all duration-300 space-y-8">
                {loading && <LoadingSpinner message="Memuat data penugasan..." />}
                {!loading && error && <ErrorState message={error} />}
                {!loading && !error && !tugas && <EmptyState message="Data penugasan tidak ditemukan." />}

                {!loading && !error && tugas && (
                    <>
                        <SectionTitle text="Informasi Penugasan" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem icon={faTasks} label="Nama Tugas" value={tugas.nama} />
                            <InfoItem icon={faTag} label="Kategori" value={tugas.category} badge />
                            <InfoItem icon={faCalendar} label="Tanggal Mulai" value={formatFullDate(tugas.start_date)} />
                            <InfoItem icon={faClock} label="Deadline" value={formatFullDate(tugas.deadline_at)} />
                            <InfoItem icon={faEdit} label="Status" value={
                                tugas.is_complete ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold">
                                        Selesai
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm font-semibold">
                                        Belum Selesai
                                    </span>
                                )
                            }
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4">
                            {(() => {
                                const allApproved = tugas.details?.every(
                                    (d) => d.status === 1 && d.finished_at
                                );
                                const isDisabled =
                                    tugas.is_complete || !allApproved || tugas.details?.length === 0;

                                return (
                                    <button
                                        onClick={() => !isDisabled && handleUpdateStatus(true)}
                                        disabled={isDisabled}
                                        className={`px-4 py-2 rounded-md font-semibold text-white transition ${isDisabled
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700"
                                            }`}
                                    >
                                        {tugas.is_complete
                                            ? "Sudah Selesai"
                                            : !allApproved
                                                ? "Menunggu Persetujuan Pekerja"
                                                : "Tandai Selesai"}
                                    </button>
                                );
                            })()}

                            <button onClick={() => navigate(`/penugasan/edit/${id}`)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition">
                                Edit Penugasan
                            </button>
                        </div>

                        <SectionTitle text="Daftar Pekerja" />
                        {tugas.details?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border border-gray-200 rounded-lg shadow-sm overflow-hidden mt-2">
                                    <thead className="bg-green-600 text-white">
                                        <tr>
                                            <th className="px-4 py-2 text-center w-16">No.</th>
                                            <th className="px-4 py-2">Nama Karyawan</th>
                                            <th className="px-4 py-2">Deskripsi</th>
                                            <th className="px-4 py-2 text-center">Status</th>
                                            <th className="px-4 py-2 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {tugas.details.map((item, index) => (
                                            <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                                                <td className="px-4 py-2 text-center">{index + 1}</td>
                                                <td className="px-4 py-2 text-gray-800">{item.nama_user}</td>
                                                <td className="px-4 py-2 text-gray-800">{item.deskripsi || "-"}</td>
                                                <td className="px-4 py-2 text-center">
                                                    {item.status === 1 ? (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                                                            Selesai
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
                                                            Belum Selesai
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleTogglePause(item.id, item.is_paused)
                                                        }
                                                        className={`p-2 rounded-md transition ${item.is_paused
                                                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                                                            : "bg-green-100 text-green-600 hover:bg-green-200"
                                                            }`}
                                                        title={item.is_paused ? "Lanjutkan Tugas" : "Pause Tugas"}
                                                    >
                                                        <FontAwesomeIcon icon={item.is_paused ? faPlay : faPause} className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState message="Belum ada pekerja terdaftar untuk tugas ini." />
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

const SectionTitle = ({ text }) => (
    <h2 className="text-lg sm:text-xl font-bold text-green-700 border-b border-gray-200 pb-2">
        {text}
    </h2>
);

const InfoItem = ({ icon, label, value, badge }) => (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-transform hover:-translate-y-0.5">
        <FontAwesomeIcon icon={icon} className="text-green-500 w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
            <div className="text-gray-500 text-sm">{label}</div>
            <div className="text-gray-900 font-semibold">
                {badge ? (
                    <span
                        className={`px-2 py-0.5 rounded-md text-sm font-semibold capitalize ${value === "daily"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : value === "urgent"
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : "bg-gray-100 text-gray-700 border border-gray-300"
                            }`}
                    >
                        {value}
                    </span>
                ) : (
                    value || <span className="text-gray-400">N/A</span>
                )}
            </div>
        </div>
    </div>
);

export default DetailPenugasan;
