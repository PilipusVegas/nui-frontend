import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { find, init } from "browser-geo-tz";

const TambahLokasi = () => {
  const [nama, setNama] = useState("");
  const [koordinat, setKoordinat] = useState("");
  const [timezone, setTimezone] = useState("");

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  // Init library
  useEffect(() => {
    try {
      init();
    } catch (err) {
      console.error("Init error:", err);
    }
  }, []);

  // === HANDLE KOORDINAT ===
  const handleKoordinatChange = async (e) => {
    const value = e.target.value;
    setKoordinat(value);

    // Validasi format: lat, lon
    const valid = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (!valid.test(value)) {
      setTimezone("");
      return;
    }

    const [latStr, lonStr] = value.split(",").map((s) => s.trim());
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      setTimezone("");
      return;
    }

    try {
      const tz = await find(lat, lon);
      setTimezone(tz?.[0] || "");
    } catch (err) {
      console.error("Timezone error:", err);
      setTimezone("");
    }
  };

  // === BUTTON BACK ===
  const handleBack = async () => {
    const confirm = await Swal.fire({
      title: "Batalkan penambahan lokasi?",
      text: "Data yang belum disimpan akan hilang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, batalkan",
      cancelButtonText: "Kembali",
      iconColor: "#F87171",
    });
    if (confirm.isConfirmed) {
      navigate("/lokasi-presensi");
    }
  };

  // === SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!timezone) {
      Swal.fire("Perhatian", "Timezone tidak valid atau belum terbaca.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Simpan lokasi baru?",
      text: "Data akan disimpan ke sistem.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
      iconColor: "#22C55E",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchWithJwt(`${apiUrl}/lokasi/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, koordinat, timezone }),
      });

      if (!res.ok) throw new Error("Gagal menambahkan lokasi.");

      Swal.fire({
        title: "Berhasil!",
        text: "Lokasi berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => navigate("/lokasi-presensi"));
    } catch (err) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menambah lokasi.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <div className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBack}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Tambah Lokasi</h1>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex-grow p-10 w-full mx-auto space-y-6">
        {/* NAMA */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Nama Lokasi</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* KOORDINAT */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Koordinat</label>
          <p className="text-xs text-gray-500 mb-2">Contoh format: -6.200000, 106.816666</p>
          <input
            type="text"
            value={koordinat}
            onChange={handleKoordinatChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* TIMEZONE */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Timezone</label>
          <input
            type="text"
            value={timezone}
            readOnly
            className="w-full px-4 py-2 border bg-gray-100 text-gray-600 rounded"
          />
        </div>

        {/* BUTTON */}
        <div className="flex justify-between space-x-4 pt-4">
          <button type="button" onClick={handleBack} className="bg-red-500 text-white px-4 py-2 rounded">
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Batal
          </button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Simpan Lokasi
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahLokasi;
