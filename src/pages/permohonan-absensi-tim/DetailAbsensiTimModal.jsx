import { useState } from "react";
import { formatFullDate, formatTime } from "../../utils/dateUtils";
import { Modal } from "../../components";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faLocationDot,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

const DetailAbsensiTimModal = ({
  isOpen,
  onClose,
  data,
  onApprove,
  onReject,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState([]);

  if (!data) return null;

  const openLightbox = (src, title) => {
    setLightboxSlides([{ src, title }]);
    setLightboxOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Detail Absensi Tim • ${data.nama}`}
        note="Permohonan absensi yang perlu divalidasi"
        size="lg"
      >
        <div className="space-y-5">
          {data.absen.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {formatFullDate(a.tanggal_absen)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                    <span className="font-medium text-gray-800">
                      {a.nama_shift}
                    </span>

                    <span className="text-gray-300">•</span>

                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-emerald-600"
                      />
                      <span>
                        {a.shift_masuk} – {a.shift_pulang}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CREATED BY */}
                <div className="self-start sm:self-center">
                  <div className="flex items-center gap-2 px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-lg">
                    <FontAwesomeIcon icon={faUserTie} />
                    <span>
                      Diajukan oleh{" "}
                      <span className="font-semibold">
                        {a.created_by || "-"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* MASUK */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Absen Masuk
                  </p>

                  <div className="flex gap-4">
                    {/* FOTO */}
                    {a.foto_mulai ? (
                      <img
                        onClick={() =>
                          openLightbox(
                            `${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${a.foto_mulai}`,
                            "Masuk",
                          )
                        }
                        src={`${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${a.foto_mulai}`}
                        className="h-16 w-16 rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                      />
                    ) : (
                      <div className="h-16 w-16 flex items-center justify-center text-xs text-gray-400 border rounded-lg">
                        Tidak ada
                      </div>
                    )}

                    {/* INFO */}
                    <div className="text-sm space-y-1">
                      <p className="font-semibold text-gray-800">
                        {a.absen_masuk ? formatFullDate(a.absen_masuk) : "-"}
                      </p>

                      <p className="text-gray-500">
                        {a.absen_masuk ? formatTime(a.absen_masuk) : "-"}
                      </p>

                      <div className="flex gap-1 text-gray-500">
                        <FontAwesomeIcon
                          icon={faLocationDot}
                          className="mt-1 text-emerald-600"
                        />
                        <span className="line-clamp-2">
                          {a.tempat_mulai || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PULANG */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Absen Pulang
                  </p>

                  <div className="flex gap-4">
                    {a.foto_selesai ? (
                      <img
                        onClick={() =>
                          openLightbox(
                            `${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${a.foto_selesai}`,
                            "Pulang",
                          )
                        }
                        src={`${process.env.REACT_APP_API_BASE_URL}/uploads/img/absen/${a.foto_selesai}`}
                        className="h-16 w-16 rounded-lg object-cover cursor-pointer hover:scale-105 transition"
                      />
                    ) : (
                      <div className="h-16 w-16 flex items-center justify-center text-xs text-gray-400 border rounded-lg">
                        Tidak ada
                      </div>
                    )}

                    <div className="text-sm space-y-1">
                      <p className="font-semibold text-gray-800">
                        {a.absen_pulang ? formatFullDate(a.absen_pulang) : "-"}
                      </p>

                      <p className="text-gray-500">
                        {a.absen_pulang ? formatTime(a.absen_pulang) : "-"}
                      </p>

                      <div className="flex gap-1 text-gray-500">
                        <FontAwesomeIcon
                          icon={faLocationDot}
                          className="mt-1 text-emerald-600"
                        />
                        <span className="line-clamp-2">
                          {a.tempat_selesai || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESKRIPSI */}
              {a.deskripsi && (
                <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <span className="font-semibold">Kendala:</span> {a.deskripsi}
                </div>
              )}

              {/* ACTION */}
              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => onReject(a)}
                  className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition active:scale-95"
                >
                  Tolak
                </button>

                <button
                  onClick={() => onApprove(a)}
                  className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition active:scale-95"
                >
                  Setujui
                </button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
      />
    </>
  );
};

export default DetailAbsensiTimModal;
