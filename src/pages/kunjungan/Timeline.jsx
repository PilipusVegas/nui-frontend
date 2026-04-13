import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCalendarAlt, faArrowRight, faInfo, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { formatFullDate, formatTime } from "../../utils/dateUtils";


const getDotStyleByKategori = (kategori) => {
  if (kategori === 1) return "bg-green-500 ring-green-200";
  if (kategori === 2) return "bg-blue-500 ring-blue-200";
  return "bg-gray-400 ring-gray-200";
};

const getTimelineTitle = (item, index, checkpoints) => {
  if (item.kategori === 1) return "Berangkat Kunjungan";
  if (item.kategori === 2) {
    const order = checkpoints.findIndex((c) => c.id === item.id) + 1;
    return `Lokasi Kunjungan ${order}`;
  }
  return "Aktivitas Kunjungan";
};

// ================= COMPONENT =================
const Timeline = ({ history, tripInfo, onEndTrip }) => {
  const checkpoints = history.filter((h) => h.kategori === 2);
  const isFirstCheckpoint = (item, checkpoints) =>
    item.kategori === 2 && checkpoints[0]?.id === item.id;
  const isLastCheckpoint = (item, checkpoints) =>
    item.kategori === 2 && checkpoints[checkpoints.length - 1]?.id === item.id;
  const [remaining, setRemaining] = useState("");

  const getRemainingTime = (endTime) => {
    const now = new Date().getTime();
    const diff = endTime - now;
    if (diff <= 0) return "Akan segera direset";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  };

  useEffect(() => {
    if (!tripInfo?.created_at) return;
    const start = new Date(tripInfo.created_at).getTime();
    const resetTime = start + 20 * 60 * 60 * 1000;
    const update = () => {
      setRemaining(getRemainingTime(resetTime));
    };
    update(); // jalankan sekali langsung
    const timer = setInterval(update, 30000); // update tiap 30 detik
    return () => clearInterval(timer);
  }, [tripInfo]);



  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5 mb-20">
      {/* ===== TIMELINE ===== */}
      {history.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">
          Belum ada aktivitas perjalanan hari ini.
        </p>
      ) : (
        <div>
          <div className="mb-5 space-y-1">
            <h3 className="text-sm font-semibold text-gray-800">Timeline Perjalanan Anda</h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-normal">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-600" />
              <span>{formatFullDate(tripInfo.tanggal)}</span>
            </div>
          </div>
          {history.map((h, i) => {
            const title = getTimelineTitle(h, i, checkpoints);
            return (
              <div key={h.id} className="relative flex gap-4">
                {i !== history.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gray-200" />
                )}
                <div className={`relative w-8 h-8 rounded-full text-white text-[10px] font-semibold flex items-center justify-center shadow ring-4 ${getDotStyleByKategori(h.kategori)}`}>
                  {i + 1}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-[10px] font-medium text-gray-500 tracking-wider">{title}</p>
                  <p className="text-xs text-gray-800 font-medium mb-1">{h.nama}</p>
                  <div className="flex flex-col gap-0.5 text-[11px] text-gray-600">
                    {h.kategori === 1 && h.jam_mulai && (
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faClock} className="text-emerald-500" />
                        <span>Berangkat Kunjungan {formatTime(h.jam_mulai)}</span>
                      </div>
                    )}

                    {h.kategori === 2 && h.jam_mulai && (
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-emerald-500" />
                        <span>Mulai Kunjungan {formatTime(h.jam_mulai)}</span>
                        {isFirstCheckpoint(h, checkpoints) && (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                            Absen Masuk
                          </span>
                        )}
                      </div>
                    )}

                    {h.kategori === 2 && h.jam_selesai && (
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-rose-500" />
                        <span>Selesai Kunjungan {formatTime(h.jam_selesai)}</span>
                        {isLastCheckpoint(h, checkpoints) && (
                          <span className="flex items-center gap-1 text-rose-600 font-semibold">
                            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                            Absen Pulang
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-justify">
            <div className="flex items-center gap-2 text-amber-700">
              <FontAwesomeIcon icon={faInfoCircle} classname="text-sm" />
              <span className="text-xs font-semibold">
                Informasi Penting
              </span>
            </div>
            <p className="text-[11px] text-gray-700 mt-1 leading-snug">
              Kunjungan ini akan otomatis direset dalam <b>{remaining}</b>.
              Tombol <b>Akhiri Kunjungan</b> sudah tidak tersedia.
            </p>
            <p className="text-[11px] text-gray-700 mt-1 leading-snug">
              Absen pulang diambil dari <b>Selesai Kunjungan</b> terakhir.
              Pastikan Anda menyelesaikan kunjungan sesuai jadwal shift kerja Anda.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;