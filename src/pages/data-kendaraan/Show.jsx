// src/pages/data-kendaraan/Show.jsx
import React from "react";
import { Modal } from "../../components/";

const KATEGORI_KENDARAAN = {
  1: "Motor",
  2: "Mobil",
};

const ShowKendaraan = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Kendaraan"
      footer={
        <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">
          Tutup
        </button>
      }
    >
      <div className="space-y-3 text-sm">
        <div><strong>Nama Kendaraan:</strong> {data.nama}</div>
        <div><strong>Kategori:</strong> {KATEGORI_KENDARAAN[data.kategori]}</div>
        <div><strong>Tahun:</strong> {data.tahun}</div>
        <div><strong>Konsumsi BBM:</strong> {data.konsumsi_bb} km/l</div>
        <div><strong>Jenis BBM:</strong> {data.nama_bb}</div>
        <div><strong>Harga BBM:</strong> Rp {Number(data.harga_bb).toLocaleString("id-ID")}</div>
      </div>
    </Modal>
  );
};

export default ShowKendaraan;