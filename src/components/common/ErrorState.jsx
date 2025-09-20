import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faRotateRight } from "@fortawesome/free-solid-svg-icons";

/**
 * ErrorState – Tema hijau + tombol retry fleksibel
 *
 * Props:
 *  - message   : string -> Judul pesan (default: "Terjadi Kesalahan")
 *  - detail    : string -> Penjelasan tambahan
 *  - onRetry   : func   -> Callback untuk mencoba fetch ulang (wajib bila ingin tombol tampil)
 *  - retryText : string -> Label tombol (default: "Coba Lagi")
 */
export default function ErrorState({
  message = "Terjadi Kesalahan",
  detail = "Sistem tidak dapat memproses permintaan saat ini. Silakan periksa koneksi Anda atau coba beberapa saat lagi.",
  onRetry,
  retryText = "Coba Lagi",
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
      {/* Ikon utama */}
      <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-100">
        <FontAwesomeIcon icon={faCircleExclamation} className="text-4xl text-green-600" aria-hidden="true"/>
      </div>

      {/* Pesan inti */}
      <h2 className="text-2xl font-semibold text-gray-800">{message}</h2>
      <p className="mt-3 max-w-lg text-gray-600 text-sm md:text-base leading-relaxed">
        {detail}
      </p>

      {/* Tombol retry fleksibel */}
      {onRetry && (
        <div className="mt-8 flex justify-center">
          <button onClick={onRetry} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 text-white text-sm font-medium shadow-sm hover:bg-green-600 transition-colors">
            <FontAwesomeIcon icon={faRotateRight} />
            {retryText}
          </button>
        </div>
      )}
    </div>
  );
}
