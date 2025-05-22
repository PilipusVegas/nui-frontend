import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import MobileLayout from "../../layouts/mobileLayout";

const CHAR_LIMIT = 250;

const Lembur = () => {
  const [currentStep, setCurrentStep] = useState("stepOne");
  const [lemburData, setLemburData] = useState({
    userId: "",
    username: "",
    tugas: "",
    lokasi: "",
    nama_lokasi: "",
    tanggal: "",
    jamMulai: "",
    jamSelesai: "",
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  // const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));



  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("userName");
    if (storedUserId) {
      setLemburData((prev) => ({
        ...prev,
        userId: storedUserId,
        username: storedUsername || "",
      }));
    }
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${apiUrl}/lokasi`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setLocations(data.data);
    } catch (error) {
      console.error("Error fetching locations", error);
    }
  };

  const handleNextStepData = (data) => {
    setLemburData((prev) => ({ ...prev, ...data }));
    setCurrentStep("stepTwo");
  };

  const handleSubmitStepOne = (formData) => {
    handleNextStepData(formData);
  };

  const handleSubmitStepTwo = async () => {
    setLoading(true);
    try {
      Swal.fire("Data akan dikirim!", "", "info");
      const response = await fetch(`${apiUrl}/lembur/simpan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_user: lemburData.userId,
          tanggal: lemburData.tanggal,
          id_lokasi: lemburData.nama_lokasi,
          deskripsi: lemburData.tugas,
          jam_mulai: lemburData.jamMulai,
          jam_selesai: lemburData.jamSelesai,
        }),
      });
      if (response.ok) {
        await response.json();
        Swal.fire("berhasil Terkirim!", "", "success");
        setIsSuccess(true);
      } else {
        Swal.fire("Gagal Menyimpan Data", "Terjadi kesalahan, Silahkan coba lagi", "error");
      }
    } catch (error) {
      Swal.fire("Gagal Menyimpan Data", "Cek koneksi internet anda, Silahkan coba lagi", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTimeLabel = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    const totalMinutes = hour * 60 + minute;

    if (totalMinutes >= 300 && totalMinutes < 660) return "Pagi"; // 05:00 - 10:59
    if (totalMinutes >= 660 && totalMinutes < 900) return "Siang"; // 11:00 - 14:59
    if (totalMinutes >= 900 && totalMinutes < 1080) return "Sore"; // 15:00 - 17:59
    return "Malam"; // 18:00 - 04:59
  };

const getWaktuIndonesia = (hour) => {
  const h = parseInt(hour, 10);
  if (h >= 5 && h < 11) return "Pagi";
  if (h >= 11 && h < 15) return "Siang";
  if (h >= 15 && h < 18) return "Sore";
  return "Malam";
};

  function getSummaryLabel(jamMulai, jamSelesai) {
    const labelMulai = getTimeLabel(jamMulai);
    const labelSelesai = getTimeLabel(jamSelesai);

    return (
      `Kamu Memilih jam lembur ${jamMulai} (${labelMulai}) sampai pukul ${jamSelesai} (${labelSelesai}). ` +
      `Apakah informasi ini sudah benar? Jika iya, silakan klik tombol "Next" untuk melanjutkan.`
    );
  }

  function formatTime(jam, menit) {
    return `${jam}:${menit}`;
  }

  useEffect(() => {
    if (isSuccess) navigate("/");
  }, [isSuccess, navigate]);

  const renderStepOne = () => (
<MobileLayout
  title="Formulir Lembur"
  className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm"
>
  <form
  className="w-full max-w-lg p-5 bg-gray-50 border-2 rounded-lg"
  onSubmit={(e) => {
    e.preventDefault();
    const { tugas, lokasi, tanggal, jamMulai, jamSelesai } = lemburData;

    // Validasi input yang wajib diisi
    if (!tanggal || !lokasi || !tugas || !jamMulai || !jamSelesai) {
      Swal.fire({
        icon: "error",
        title: "Form belum lengkap",
        text: "Mohon isi semua inputan sebelum melanjutkan.",
      });
      return; 
    }

    // Jika valid, lanjut submit
    handleSubmitStepOne({ tugas, lokasi, tanggal, jamMulai, jamSelesai });
  }}
>
    {/* Tanggal */}
    <div className="mb-4">
      <label htmlFor="tanggal" className="block text-sm font-bold mb-1">
        Tanggal:
      </label>
      <input
        type="date"
        id="tanggal"
        name="tanggal"
        value={lemburData.tanggal}
        className="w-full p-2 text-lg border-2 rounded-lg"
        onChange={(e) =>
          setLemburData((prev) => ({ ...prev, tanggal: e.target.value }))
        }
      />
    </div>

    {/* Lokasi */}
    <div className="mb-4">
      <label htmlFor="lokasi" className="block text-sm font-bold mb-1">
        Lokasi:
      </label>
      <select
        id="lokasi"
        name="lokasi"
        value={lemburData.lokasi}
        className="w-full p-2 text-lg border-2 rounded-lg"
        onChange={(e) => {
          const selectedLokasi = e.target.value;
          const selectedId =
            locations.find((loc) => loc.nama === selectedLokasi)?.id || "";
          setLemburData((prev) => ({
            ...prev,
            lokasi: selectedLokasi,
            nama_lokasi: selectedId,
          }));
        }}
      >
        <option value="">Pilih Lokasi</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.nama}>
            {loc.nama}
          </option>
        ))}
      </select>
    </div>

    {/* Tugas */}
    <div className="mb-4">
      <label htmlFor="tugas" className="block text-sm font-bold mb-1">
        Tugas yang diberikan:
      </label>
      <textarea
        rows="2"
        id="tugas"
        name="tugas"
        value={lemburData.tugas}
        className="w-full p-2 text-lg border-2 rounded-lg resize-vertical"
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= CHAR_LIMIT) {
            setLemburData((prev) => ({ ...prev, tugas: value }));
          }
        }}
      />
    </div>

    {/* Summary Label */}
    {lemburData.jamMulai && lemburData.jamSelesai && (
      <div className="mb-6 p-3 text-xs bg-green-100 rounded-lg border border-blue-300 text-green-800 font-semibold text-center">
        {getSummaryLabel(lemburData.jamMulai, lemburData.jamSelesai)}
      </div>
    )}

{/* Jam Mulai */}
<div className="mb-4 w-full">
  <label className="block text-sm font-semibold mb-2">Jam Mulai:</label>
  <div className="w-full">
    <select
      className="w-full p-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      value={lemburData.jamMulai || ""}
      onChange={(e) => {
        setLemburData((prev) => ({
          ...prev,
          jamMulai: e.target.value,
        }));
      }}
    >
      <option value="">-- Pilih Jam --</option>
      {hours.map((h) => (
        <option key={h} value={`${h}:00`}>
          {`${h}:00`} ({getWaktuIndonesia(h)})
        </option>
      ))}
    </select>
  </div>
  {lemburData.jamMulai && (
    <p className="mt-1 text-sm font-semibold text-green-600">
      Waktu mulai: {lemburData.jamMulai} ({getTimeLabel(lemburData.jamMulai)})
    </p>
  )}
</div>

{/* Jam Selesai */}
<div className="mb-4 w-full">
  <label className="block text-sm font-semibold mb-2">Jam Selesai:</label>
  <div className="w-full">
    <select
      className="w-full p-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      value={lemburData.jamSelesai || ""}
      onChange={(e) => {
        setLemburData((prev) => ({
          ...prev,
          jamSelesai: e.target.value,
        }));
      }}
    >
      <option value="">-- Pilih Jam --</option>
      {hours.map((h) => (
        <option key={h} value={`${h}:00`}>
          {`${h}:00`} ({getWaktuIndonesia(h)})
        </option>
      ))}
    </select>
  </div>
  {lemburData.jamSelesai && (
    <p className="mt-1 text-sm font-semibold text-green-600">
      Waktu selesai: {lemburData.jamSelesai} ({getTimeLabel(lemburData.jamSelesai)})
    </p>
  )}
</div>



    {/* Submit Button */}
    <button
      type="submit"
      className={`w-full p-2 text-white text-lg font-bold rounded-xl border-2 ${
        lemburData.lokasi &&
        lemburData.tugas &&
        lemburData.tanggal &&
        lemburData.jamMulai &&
        lemburData.jamSelesai
          ? "bg-green-500 border-green-700"
          : "bg-gray-400 border-gray-600 cursor-not-allowed"
      }`}
      disabled={
        !(
          lemburData.lokasi &&
          lemburData.tugas &&
          lemburData.tanggal &&
          lemburData.jamMulai &&
          lemburData.jamSelesai
        )
      }
    >
      Next ➜
    </button>
  </form>
</MobileLayout>

  );

  const renderStepTwo = () => (
    <MobileLayout
      title="LEMBUR"
      className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm"
    >
      <div className="flex flex-col items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitStepTwo();
          }}
          className="w-full max-w-xl p-5 bg-white border border-gray-300 rounded-lg"
        >
          <h3 className="text-2xl font-semibold mb-4 text-center">Detail Lembur</h3>
          <div className="p-3">
            {["username", "lokasi", "tanggal", "jamMulai", "jamSelesai", "tugas"].map(
              (key, index) => (
                <div key={index}>
                  <div className="flex justify-between text-justify py-2">
                    <strong className="text-sm font-semibold pr-3 text-justify">
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </strong>
                    <span className="text-gray-700 text-sm break-words">{lemburData[key]}</span>
                  </div>
                  {index < 5 && <hr className="border-gray-300" />}
                </div>
              )
            )}
          </div>
          <button
            type="button"
            className="w-full py-2 mt-3 text-lg font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
            onClick={() => setCurrentStep("stepOne")}
          >
            KEMBALI
          </button>
          <button
            type="submit"
            className={`w-full py-2 mt-3 text-lg font-semibold text-white rounded-md ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={loading}
          >
            {loading ? "Mengirim..." : "KIRIM"}
          </button>
        </form>
      </div>
    </MobileLayout>
  );

  return <div>{currentStep === "stepOne" ? renderStepOne() : renderStepTwo()}</div>;
};

Lembur.propTypes = {
  lemburData: PropTypes.object,
};

export default Lembur;
