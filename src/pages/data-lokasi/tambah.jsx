import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faQuestion, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import Select from "react-select";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { find, init } from "browser-geo-tz";
import { useLocation } from "react-router-dom";
import { SectionHeader, Modal } from "../../components";

const TambahLokasi = () => {
  const [nama, setNama] = useState("");
  const [koordinat, setKoordinat] = useState("");
  const [timezone, setTimezone] = useState("");
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const kategori = location.state?.kategori;
  const [profil, setProfil] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openKoordinatModal, setOpenKoordinatModal] = useState(false);

  // Init library
  useEffect(() => {
    try {
      init();
    } catch (err) {
      console.error("Init error:", err);
    }
  }, []);

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/profil`);
        const json = await res.json();
        const users = json.data || [];
        const options = users.map((u) => ({
          value: u.id,       // ⬅️ id_user
          label: u.nama,     // ⬅️ nama user
          raw: u,
        }));

        setUserOptions(options);
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
      }
    };

    if (kategori === 3) {
      fetchProfil();
    }
  }, [kategori]);

  useEffect(() => {
    if (![1, 2, 3].includes(kategori)) {
      Swal.fire(
        "Akses tidak valid",
        "Silakan pilih kategori lokasi terlebih dahulu.",
        "warning"
      ).then(() => navigate("/data-lokasi"));
    }
  }, [kategori]);

  useEffect(() => {
    if (kategori === 3 && profil?.nama) {
      setNama(`Rumah ${profil.nama}`);
    }
  }, [kategori, profil]);

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
      navigate("/data-lokasi");
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
        body: JSON.stringify({
          nama,
          koordinat,
          timezone,
          kategori,
          id_user: kategori === 3 ? selectedUser?.value : null,
        }),
      });
      if (!res.ok) throw new Error("Gagal menambahkan lokasi.");
      Swal.fire({
        title: "Berhasil!",
        text: "Lokasi berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => navigate("/data-lokasi"));
    } catch (err) {
      Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menambah lokasi.", "error");
    }
  };

  const handleSelectUserRumah = (option) => {
    setSelectedUser(option);
    setNama(`Rumah ${option.label}`);
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <SectionHeader title="Tambah Lokasi" subtitle="Tambah lokasi baru" onBack={handleBack} />

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-grow p-6 w-full mx-auto space-y-6">
          {/* NAMA LOKASI */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Nama Lokasi
            </label>

            {kategori === 3 ? (
              <>
                <Select placeholder="Pilih pemilik rumah" options={userOptions} value={selectedUser} onChange={handleSelectUserRumah} isClearable className="react-select-container" classNamePrefix="react-select" />
                {selectedUser && (
                  <p className="mt-2 text-xs text-gray-500">
                    Nama lokasi akan disimpan sebagai <b>“Rumah {selectedUser.label}”</b>
                  </p>
                )}
              </>
            ) : (
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
            )}
          </div>

          {/* KOORDINAT */}
          <div>
            <label className="flex items-center gap-2 mb-1 font-medium">
              Koordinat
              <button type="button" onClick={() => setOpenKoordinatModal(true)} className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-blue-600 transition">
                <FontAwesomeIcon icon={faQuestion} size="xs" />
              </button>
            </label>
            <p className="text-xs text-gray-500 mb-2">Contoh format: -6.200000, 106.816666</p>
            <input type="text" value={koordinat} onChange={handleKoordinatChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>

          {/* TIMEZONE */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Timezone</label>
            <input type="text" value={timezone} readOnly className="w-full px-4 py-2 border bg-gray-100 text-gray-600 rounded" />
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

      <Modal isOpen={openKoordinatModal} onClose={() => setOpenKoordinatModal(false)} title="Cara Mengambil Koordinat Google Maps" note="Panduan ini membantu Anda mengisi koordinat lokasi dengan benar." size="md"
        footer={
          <button onClick={() => setOpenKoordinatModal(false)} className="bg-green-600 text-white px-4 py-2 rounded">
            Mengerti
          </button>
        }
      >
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">

          <p>
            Kolom <b>Koordinat</b> digunakan untuk menentukan titik lokasi absensi.
            Isilah <b>hanya dengan angka koordinat dari Google Maps</b>.
          </p>

          <div className="border rounded-lg p-3 bg-gray-50">
            <p className="font-medium mb-1">Contoh format yang benar</p>
            <p className="font-mono">
              -6.1751, 106.8271
            </p>
          </div>

          <div className="border rounded-lg p-3">
            <p className="font-medium mb-1">Cara mengambil koordinat di komputer</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Buka Google Maps di browser</li>
              <li>Cari lokasi yang diinginkan</li>
              <li>Klik kanan pada titik lokasi</li>
              <li>Perhatikan angka koordinat yang muncul</li>
              <li>Klik angka tersebut untuk menyalin</li>
              <li>Tempelkan ke kolom Koordinat</li>
            </ol>
          </div>

          <div className="border rounded-lg p-3">
            <p className="font-medium mb-1">Cara mengambil koordinat di HP</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Buka aplikasi Google Maps</li>
              <li>Cari lokasi atau tekan dan tahan pada peta</li>
              <li>Tunggu hingga muncul pin merah</li>
              <li>Koordinat akan terlihat di bagian atas atau bawah layar</li>
              <li>Salin angka koordinat tersebut</li>
              <li>Tempelkan ke kolom Koordinat</li>
            </ol>
          </div>

          <div className="border rounded-lg p-3 bg-gray-50 text-xs text-gray-600">
            <p>
              Catatan:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Gunakan tanda titik (.) untuk angka desimal</li>
              <li>Urutan harus: latitude, lalu longitude</li>
              <li>Jangan mengisi alamat atau nama tempat</li>
            </ul>
          </div>

        </div>
      </Modal>

    </>
  );
};

export default TambahLokasi;
