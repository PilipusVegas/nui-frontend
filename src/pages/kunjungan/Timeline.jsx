import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute, faCircleCheck, faClock, faMoneyBillWave, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { formatDate, formatTime } from "../../utils/dateUtils";


// ================= HELPERS =================
const getStyle = (status) => {
  if (status === "start") return "bg-green-500 ring-green-200";
  if (status === "end") return "bg-rose-500 ring-rose-200";
  if (status === "in") return "bg-blue-500 ring-blue-200";
  return "bg-emerald-500 ring-emerald-200";
};

const getLabel = (status, index) => {
  if (status === "start") return "S";
  if (status === "end") return "E";
  return index;
};

const formatDistance = (meters) => {
  if (!meters || meters === 0) return null;
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
};

const formatCurrency = (value) => {
  if (!value) return "Rp 0";
  return "Rp " + value.toLocaleString("id-ID");
};



// ================= COMPONENT =================
const Timeline = ({ history, tripInfo, onCheckout }) => {
  const isTripCompleted = tripInfo?.is_complete === 1;
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5 mb-20">

      {/* ===== SUMMARY ===== */}
      {tripInfo && (
        <div className="border-b border-gray-300 space-y-3 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">
              Ringkasan Kunjungan
            </h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tripInfo.is_complete === 1 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {tripInfo.is_complete === 1 ? "Selesai" : "Berlangsung"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-600">
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600" />
              <span>{formatDate(tripInfo.tanggal)}</span>
            </div>

            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faRoute} className="text-blue-400" />
              <span>{formatDistance(tripInfo.total_jarak) || "0 m"}</span>
            </div>

            {isTripCompleted && (
              <div className="flex items-center gap-1">
                <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-500" />
                <span>Perjalanan selesai</span>
              </div>
            )}

            {isTripCompleted && (
              <div className="flex items-center gap-1 font-semibold text-emerald-700">
                <FontAwesomeIcon icon={faMoneyBillWave} />
                <span>{formatCurrency(tripInfo.nominal)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {isTripCompleted && (
        <div className="pt-2">
          <button onClick={() => navigate("/riwayat-pengguna")}
            className=" w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:from-blue-700 hover:to-blue-600 transition"
          >
            <FontAwesomeIcon icon={faRoute} />
            Lihat Riwayat Kunjungan
          </button>
        </div>
      )}


      {/* ===== TIMELINE ===== */}
      {history.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">
          Belum ada aktivitas perjalanan hari ini.
        </p>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Timeline Kunjungan
          </h3>

          {history.map((h, i) => (
            <div key={i} className="flex gap-4 items-stretch">

              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full text-white text-[10px] font-semibold 
                  flex items-center justify-center shadow ring-4 ${getStyle(h.status)}`}>
                  {getLabel(h.status, i)}
                </div>

                {i !== history.length - 1 && (
                  <div className="w-[2px] bg-gray-200 flex-1 mt-1 rounded-full" />
                )}
              </div>

              <div className="flex-1 space-y-2 pb-2">
                <p className="text-sm font-semibold text-gray-800">
                  {h.nama}
                </p>

                {/* ===== START ===== */}
                {h.status === "start" && (
                  <div className="text-[11px] text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600" />
                      <span>
                        Tanggal Mulai: <strong>{formatDate(h.jam_in)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="text-green-600" />
                      <span>
                        Jam Mulai: <strong>{formatTime(h.jam_in)}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* ===== CHECKPOINT ===== */}
                {h.status !== "start" && h.status !== "end" && (
                  <div className="text-[11px] text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="text-blue-500" />
                      <span>
                        Check-In: <strong>{formatTime(h.jam_in)}</strong>
                      </span>
                    </div>

                    {h.jam_out && (
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-rose-500" />
                        <span>
                          Check-Out: <strong>{formatTime(h.jam_out)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== END ===== */}
                {h.status === "end" && (
                  <div className="text-[11px] text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-rose-500" />
                      <span>
                        Tanggal Selesai: <strong>{formatDate(h.jam_out)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="text-rose-500" />
                      <span>
                        Jam Selesai: <strong>{formatTime(h.jam_out)}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {h.status === "in" && (
                  <div className="relative inline-flex mt-2 animate-pulse">
                    <span className="absolute inline-flex h-full w-full rounded bg-yellow-400"></span>
                    <button onClick={onCheckout} className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 transition shadow-sm">
                      Check-Out Lokasi
                    </button>
                  </div>
                )}


                {formatDistance(h.jarak) && (
                  <div className="flex items-center gap-2 text-xs leading-tight text-gray-600">
                    <FontAwesomeIcon icon={faRoute} className="text-blue-400" />
                    <span>
                      Jarak dari lokasi sebelumnya:
                      <strong className="ml-1 text-gray-700">
                        {formatDistance(h.jarak)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;