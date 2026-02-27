import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRoute,
  faCircleCheck,
  faClock,
  faCalendarAlt,
  faArrowRightFromBracket,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { formatFullDate, formatTime } from "../../utils/dateUtils";

const getDotStyleByKategori = (kategori) => {
  if (kategori === 1) return "bg-green-500 ring-green-200"; // Mulai
  if (kategori === 2) return "bg-blue-500 ring-blue-200"; // Checkpoint
  if (kategori === 3) return "bg-red-500 ring-red-200"; // Akhir
  return "bg-gray-400 ring-gray-200";
};

const getTimelineTitle = (item, index, checkpoints) => {
  if (item.kategori === 1) return "Mulai Kunjungan";
  if (item.kategori === 2) {
    const order = checkpoints.findIndex((c) => c.id === item.id) + 1;
    const isLastCheckpoint = order === checkpoints.length && item.jam_selesai;
    if (order === 1) {
      return "Checkpoint 1 & Absen Masuk";
    }
    if (isLastCheckpoint) {
      return `Checkpoint ${order} & Absen Selesai`;
    }
    return `Checkpoint ${order}`;
  }

  if (item.kategori === 3) return "Kunjungan Berakhir";

  return "Aktivitas Kunjungan";
};

// ================= COMPONENT =================
const Timeline = ({
  history,
  tripInfo,
  activeLocation,
  onCheckout,
  onEndTrip,
  canAddLocation,
  onAddLocation,
}) => {
  const checkpoints = history.filter((h) => h.kategori === 2);
  const lastCheckpoint = checkpoints[checkpoints.length - 1];
  const canEndTrip = checkpoints.length > 0 && lastCheckpoint?.jam_selesai && !history.some((h) => h.kategori === 3);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5 mb-20">
      {activeLocation && (
        <div className="space-y-3 border-b border-gray-200 pb-4">
          <div className="flex gap-3">
            {/* Accent */}
            <div className="w-1 rounded-full bg-blue-500"></div>
            <div className="flex-1 space-y-1.5">
              <p className="text-xs text-gray-500">Lokasi kunjungan saat ini</p>
              <p className="text-base font-semibold text-gray-900 leading-snug">
                {activeLocation.nama}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <FontAwesomeIcon icon={faClock} className="text-green-500" />
                <span>Mulai {formatTime(activeLocation.jam_mulai)}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={onCheckout}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg text-sm font-semibold transition"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            Check-Out Lokasi
          </button>
        </div>
      )}

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
                        <span>Mulai Kunjungan {formatTime(h.jam_mulai)}</span>
                      </div>
                    )}

                    {h.kategori === 2 && h.jam_mulai && (
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faClock} className="text-emerald-500" />
                        <span>Check-in {formatTime(h.jam_mulai)}</span>
                      </div>
                    )}

                    {h.kategori === 2 && h.jam_selesai && (
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faClock} className="text-rose-500" />
                        <span>Check-out {formatTime(h.jam_selesai)}</span>
                      </div>
                    )}

                    {h.kategori === 3 && h.jam_selesai && (
                      <div className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faClock} className="text-rose-500" />
                        <span>Kunjungan Berakhir {formatTime(h.jam_selesai)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {canAddLocation && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onAddLocation}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xltext-sm font-semibold transition"
              >
                <FontAwesomeIcon icon={faPlus} />
                Tambah Lokasi
              </button>
            </div>
          )}
          {canEndTrip && (
            <div className="pt-4 border-t border-gray-200">
              <button onClick={onEndTrip} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition">
                <FontAwesomeIcon icon={faCircleCheck} />
                Akhiri Kunjungan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Timeline;
