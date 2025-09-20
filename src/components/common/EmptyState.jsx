import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

/**
 * EmptyState – Tampilan kosong modern & nyaman
 *
 * Props:
 *  - title       : string -> Judul utama (default: "Data Kosong")
 *  - description : string -> Deskripsi singkat
 *  - icon        : object -> Ikon FontAwesome (default: faFolderOpen)
 *  - actionText  : string -> Label tombol opsional
 *  - onAction    : func   -> Callback tombol
 */
export default function EmptyState({
  title = "Data Kosong",
  description = "Belum ada informasi yang bisa ditampilkan saat ini.",
  icon = faFolderOpen,
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
      {/* Ikon utama dengan efek bayangan halus */}
      <div className="flex items-center justify-center w-24 h-24 mb-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
        <FontAwesomeIcon icon={icon} className="text-5xl text-gray-500" aria-hidden="true"/>
      </div>

      {/* Pesan inti */}
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-gray-600 text-base md:text-lg leading-relaxed">
        {description}
      </p>

      {/* Tombol opsional */}
      {actionText && onAction && (
        <div className="mt-10">
          <button onClick={onAction} className="px-6 py-3 rounded-xl bg-gray-800 text-white text-sm md:text-base font-medium shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200"> {actionText}
          </button>
        </div>
      )}
    </div>
  );
}
