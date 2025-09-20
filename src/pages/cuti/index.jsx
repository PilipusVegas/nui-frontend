import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingSpinner } from "../../components";
import { formatFullDate } from "../../utils/dateUtils";
import { faPlus, faCheckCircle, faTimesCircle, faHourglassHalf, faClock, faStickyNote} from "@fortawesome/free-solid-svg-icons";

const CutiKaryawan = () => {
  const [quota, setQuota] = useState({ total: 0, used: 0, remaining: 0 });
  const [cutiData, setCutiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCuti = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/cuti/riwayat`);
        const response = await res.json();

        if (response.success) {
          const d = response.data.data ? response.data.data : response.data;

          setQuota({
            total: d.total_cuti || 0,
            used: d.cuti_terpakai || 0,
            remaining: d.cuti_tersisa || 0,
          });

          setCutiData(d.cuti || []);
        } else {
          console.error("API gagal:", response.message);
        }
      } catch (error) {
        console.error("Gagal mengambil data cuti:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCuti();
  }, [apiUrl]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 0:
        return {
          label: "Pending",
          color: "bg-yellow-500/10 text-yellow-600 border border-yellow-400/30",
          icon: faHourglassHalf,
        };
      case 1:
        return {
          label: "Disetujui",
          color: "bg-green-500/10 text-green-600 border border-green-400/30",
          icon: faCheckCircle,
        };
      case 2:
        return {
          label: "Ditolak",
          color: "bg-red-500/10 text-red-600 border border-red-400/30",
          icon: faTimesCircle,
        };
      default:
        return {
          label: "Tidak Diketahui",
          color: "bg-gray-200 text-gray-600 border border-gray-300",
          icon: faHourglassHalf,
        };
    }
  };

  return (
    <MobileLayout title="Cuti Karyawan">
      <div className="mb-20">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-md p-3 mb-5 border border-green-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 border-b border-green-200 pb-2">
            <h2 className="text-sm font-bold text-green-800 uppercase tracking-wide">
              <FontAwesomeIcon icon={faStickyNote} className="text-green-600 mr-1.5" />
              Ringkasan Cuti
            </h2>
            <button
              onClick={() => navigate("/formulir-cuti")}
              disabled={quota.total === 0} // ➜ tombol nonaktif bila total cuti 0
              className={`px-3 py-1 rounded-md text-xs flex items-center gap-2 shadow-md font-semibold transition-all duration-200
        ${
          quota.total === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span className="mb-0.5">Ajukan Cuti</span>
            </button>
          </div>

          {/* Compact Quota */}
          <div className="flex justify-between items-center text-center mb-2">
            <div className="flex-1">
              <p className="text-lg font-extrabold text-gray-700">{quota.total}</p>
              <p className="text-[11px] text-gray-600">Total</p>
            </div>
            <div className="flex-1">
              <p className="text-lg font-extrabold text-red-500">{quota.used}</p>
              <p className="text-[11px] text-gray-600">Terpakai</p>
            </div>
            <div className="flex-1">
              <p className="text-lg font-extrabold text-green-600">{quota.remaining}</p>
              <p className="text-[11px] text-gray-600">Sisa</p>
            </div>
          </div>
        </div>

        {/* Riwayat Cuti Mobile */}
        <div>
          <h1 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faClock} className="text-green-600" />
            Riwayat Cuti
          </h1>

          {loading ? (
            <LoadingSpinner message="Mohon tunggu, data Riwayat Cuti sedang diproses..." />
          ) : cutiData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm italic">Belum ada riwayat cuti</p>
          ) : (
            <div className="flex flex-col gap-3">
              {cutiData.map((item) => {
                const { label, icon, color } = getStatusConfig(item.status);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow transition"
                  >
                    {/* === Pengajuan === */}
                    <div className="mb-3">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                          Pengajuan
                        </h4>
                        <span className="text-[11px] text-gray-500">
                          {formatFullDate(item.created_at)}
                        </span>
                      </div>

                      {/* Periode & Jumlah Hari */}
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                        <span>
                          {item.tgl_mulai} – {item.tgl_selesai}
                        </span>
                        <span className="text-xs font-medium text-gray-600">
                          Cuti terpakai : {item.jml_hari} hari
                        </span>
                      </div>

                      {/* Keterangan (opsional) */}
                      {item.keterangan && (
                        <p className="mt-1 text-xs text-gray-700 leading-snug">
                          <span className="font-medium text-gray-800">Keterangan:</span>
                          <br />
                          {item.keterangan}
                        </p>
                      )}
                    </div>

                    {/* === Persetujuan (muncul hanya jika ada) === */}
                    {item.approve_by && (
                      <>
                        <hr className="border-gray-200 my-2" />
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                              Persetujuan
                            </h4>
                            <span className="text-[11px] text-gray-500">
                              {/* {new Date(item.updated_at).toLocaleDateString("id-ID")} */}
                              {formatFullDate(item.updated_at)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${color}`}
                            >
                              <FontAwesomeIcon icon={icon} className="h-3 w-3" />
                              {label}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Disetujui oleh <span className="font-medium">{item.approve_by}</span>
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default CutiKaryawan;
