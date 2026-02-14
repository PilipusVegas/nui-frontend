import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { init, find } from "browser-geo-tz";

const EditLokasi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [nama, setNama] = useState("");
  const [koordinat, setKoordinat] = useState("");
  const [timezone, setTimezone] = useState("");

  // === INIT GEO TZ ===
  useEffect(() => {
    try {
      init();
    } catch (err) {
      console.error("Init geo-tz error:", err);
    }
  }, []);

  // === FUNGSI ASYNC AMBIL TIMEZONE ===
  const fetchTimezone = async (lat, lon) => {
    try {
      const tz = await find(lat, lon);
      return tz?.[0] || "";
    } catch (err) {
      console.error("Timezone error:", err);
      return "";
    }
  };

  // === LOAD DATA LOKASI ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/lokasi/${id}`);
        if (!res.ok) throw new Error("Gagal memuat data lokasi.");

        const data = await res.json();
        const lokasi = data.data || data;

        setNama(lokasi.nama);
        setKoordinat(lokasi.koordinat);

        // === AUTO SET TIMEZONE SAAT PERTAMA LOAD ===
        const [latStr, lonStr] = lokasi.koordinat.split(",").map(s => s.trim());
        const tz = await fetchTimezone(parseFloat(latStr), parseFloat(lonStr));
        setTimezone(tz);

      } catch (err) {
        Swal.fire("Gagal", err.message || "Gagal memuat data lokasi.", "error");
      }
    };
    fetchData();
  }, [id]);

  // === AUTO UPDATE TIMEZONE SAAT KOORDINAT EDIT ===
  useEffect(() => {
    const updateTimezone = async () => {
      if (!koordinat) return;

      const valid = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
      if (!valid.test(koordinat)) {
        setTimezone("");
        return;
      }

      const [latStr, lonStr] = koordinat.split(",").map(s => s.trim());
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      if (isNaN(lat) || isNaN(lon)) return;

      const tz = await fetchTimezone(lat, lon);
      setTimezone(tz);
    };

    updateTimezone();
  }, [koordinat]);

  // === BACK BUTTON ===
  const handleBack = async () => {
    const confirm = await Swal.fire({
      title: "Batalkan perubahan?",
      text: "Perubahan yang belum disimpan akan hilang.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, batalkan",
      cancelButtonText: "Kembali",
      iconColor: "#F87171",
    });
    if (confirm.isConfirmed) navigate("/data-lokasi");
  };

  // === SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Simpan perubahan?",
      text: "Data lokasi akan diperbarui.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
      iconColor: "#22C55E",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchWithJwt(`${apiUrl}/lokasi/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, koordinat, timezone }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan perubahan.");

      Swal.fire({
        title: "Berhasil!",
        text: "Data lokasi berhasil diperbarui.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => navigate("/data-lokasi"));

    } catch (err) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menyimpan.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-4 sm:px-6 sm:py-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Edit Lokasi</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-grow py-3 sm:p-10 w-full mx-auto space-y-6">

        {/* Nama */}
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

        {/* Koordinat */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Koordinat</label>
          <p className="text-xs text-gray-500 mb-2">Format: -6.200000, 106.816666</p>
          <input
            type="text"
            value={koordinat}
            onChange={(e) => setKoordinat(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Timezone (auto) */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Timezone</label>
          <input
            type="text"
            value={timezone}
            readOnly
            className="w-full px-4 py-2 border bg-gray-100 text-gray-600 rounded"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between space-x-4 pt-4">
          <button type="button" onClick={handleBack} className="bg-red-500 text-white px-4 py-2 rounded flex items-center">
            <FontAwesomeIcon icon={faTimes} className="mr-2" /> Batal
          </button>

          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded flex items-center">
            <FontAwesomeIcon icon={faSave} className="mr-2" /> Simpan Perubahan
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditLokasi;
