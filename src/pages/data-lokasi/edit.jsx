import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { init, find } from "browser-geo-tz";
import { SectionHeader, Modal } from "../../components";

const EditLokasi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [nama, setNama] = useState("");
  const [koordinat, setKoordinat] = useState("");
  const [timezone, setTimezone] = useState("");
  const [kategori, setKategori] = useState(null);
  const [openKoordinatModal, setOpenKoordinatModal] = useState(false);

  /* ================= INIT GEO TZ ================= */
  useEffect(() => {
    init();
  }, []);

  const fetchTimezone = async (lat, lon) => {
    try {
      const tz = await find(lat, lon);
      return tz?.[0] || "";
    } catch {
      return "";
    }
  };

  /* ================= FETCH LOKASI ================= */
  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/lokasi/${id}`);
        const json = await res.json();
        const lokasi = json.data || json;

        setNama(lokasi.nama);
        setKoordinat(lokasi.koordinat);
        setKategori(lokasi.kategori);

        const [lat, lon] = lokasi.koordinat.split(",").map(Number);
        setTimezone(await fetchTimezone(lat, lon));
      } catch {
        Swal.fire("Gagal", "Tidak bisa memuat data lokasi", "error");
      }
    };

    fetchLokasi();
  }, [id]);

  /* ================= AUTO UPDATE TIMEZONE ================= */
  useEffect(() => {
    if (!koordinat) return;

    const valid = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (!valid.test(koordinat)) {
      setTimezone("");
      return;
    }

    const [lat, lon] = koordinat.split(",").map(Number);
    if (isNaN(lat) || isNaN(lon)) return;

    fetchTimezone(lat, lon).then(setTimezone);
  }, [koordinat]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Simpan perubahan?",
      icon: "question",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      await fetchWithJwt(`${apiUrl}/lokasi/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          koordinat,
          timezone,
          kategori,
        }),
      });

      Swal.fire("Berhasil", "Lokasi diperbarui", "success")
        .then(() => navigate("/data-lokasi"));
    } catch {
      Swal.fire("Gagal", "Tidak bisa menyimpan perubahan", "error");
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      <div className="min-h-screen bg-white">
        <SectionHeader title="Edit Lokasi" subtitle="Edit data lokasi dengan benar dan tepat." onBack={() => navigate("/data-lokasi")} />

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nama Lokasi */}
          <div>
            <label className="block mb-1 font-medium">Nama Lokasi</label>

            {kategori === 3 ? (
              <input value={nama} readOnly className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed" />
            ) : (
              <input value={nama} onChange={(e) => setNama(e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
            )}
          </div>

          {/* Koordinat */}
          <div>
            <label className="flex items-center gap-2 mb-1 font-medium">
              Koordinat
              <button type="button" onClick={() => setOpenKoordinatModal(true)} className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-blue-600 transition">
                <FontAwesomeIcon icon={faQuestion} size="xs" />
              </button>
            </label>
            <p className="text-xs text-gray-500 mb-2">Contoh format: -6.200000, 106.816666</p>
            <input value={koordinat} onChange={(e) => setKoordinat(e.target.value)} className="w-full border rounded-lg px-4 py-2" required />
          </div>

          {/* Timezone */}
          <div>
            <label className="block mb-1 font-medium">Timezone</label>
            <input value={timezone} readOnly className="w-full bg-gray-100 border rounded-lg px-4 py-2" />
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button type="button" onClick={() => navigate("/data-lokasi")} className="bg-red-500 text-white px-4 py-2 rounded">
              <FontAwesomeIcon icon={faTimes} /> Batal
            </button>

            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              <FontAwesomeIcon icon={faSave} /> Simpan
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

export default EditLokasi;