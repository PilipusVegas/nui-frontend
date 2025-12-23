import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faClock,
  faServer,
  faLink,
} from "@fortawesome/free-solid-svg-icons";

/**
 * WARNA METHOD – TEGAS, BUKAN CERIA
 */
const methodStyle = {
  GET: "bg-slate-100 text-slate-700 border-slate-300",
  POST: "bg-green-100 text-green-700 border-green-300",
  PUT: "bg-amber-100 text-amber-700 border-amber-300",
  DELETE: "bg-red-100 text-red-700 border-red-300",
};

const LogCard = ({ log }) => {
  return (
    <div className="relative border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition">
      {/* STRIP KIRI (KESAN TERKONTROL) */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
          log.status_code >= 400 ? "bg-red-500" : "bg-green-600"
        }`}
      />

      <div className="p-4 pl-5 space-y-3">
        {/* BARIS UTAMA */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {/* DESKRIPSI */}
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              {log.description}
            </p>

            {/* USER + WAKTU */}
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faUserShield} />
                {log.nama_user || "SYSTEM"}
              </span>

              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} />
                {format(new Date(log.created_at), "dd MMM yyyy HH:mm:ss")}
              </span>
            </div>
          </div>

          {/* METHOD */}
          <span
            className={`text-[10px] font-mono px-2 py-1 rounded-md border ${
              methodStyle[log.method] || "bg-gray-100 text-gray-600"
            }`}
          >
            {log.method}
          </span>
        </div>

        {/* ENDPOINT (TEKNIS, MONOSPACE) */}
        <div className="flex items-start gap-2 text-[11px] font-mono text-gray-700 bg-gray-50 border border-dashed border-gray-200 rounded-md px-3 py-2">
          <FontAwesomeIcon
            icon={faLink}
            className="mt-0.5 text-gray-400"
          />
          <span className="break-all">{log.endpoint}</span>
        </div>

        {/* FOOTER META */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          {/* FEATURE */}
          <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
            {log.feature}
          </span>

          {/* TARGET */}
          {log.target && (
            <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
              {log.target}
            </span>
          )}

          {/* STATUS */}
          <span
            className={`px-2 py-1 rounded-md border ${
              log.status_code >= 400
                ? "bg-red-100 text-red-700 border-red-300"
                : "bg-green-100 text-green-700 border-green-300"
            }`}
          >
            {log.status_code}
          </span>

          {/* SERVER / IP (DISAMARKAN VISUAL) */}
          {log.ip_address && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 text-gray-500 border border-gray-200">
              <FontAwesomeIcon icon={faServer} />
              {log.ip_address}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogCard;
