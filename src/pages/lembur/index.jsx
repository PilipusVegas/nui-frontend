import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faClock, faMapMarkerAlt, faPaperPlane, faS, faSearch, faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import MobileLayout from "../../layouts/mobileLayout";
const CHAR_LIMIT = 250;
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));

const Lembur = () => {
  const [step, setStep] = useState("stepOne");
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
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

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("userName");
    if (userId) setLemburData(data => ({ ...data, userId, username }));
    fetchLocations();
  }, []);

  useEffect(() => {
    if (isSuccess) navigate("/riwayat-absensi");
  }, [isSuccess]);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${apiUrl}/lokasi`);
      const data = await res.json();
      if (res.ok) setLocations(data.data);
    } catch (err) {
      console.error("Lokasi Error", err);
    }
  };

  const getLabel = (time) => {
    const [hour] = time.split(":").map(Number);
    if (hour >= 5 && hour < 11) return "Pagi";
    if (hour >= 11 && hour < 15) return "Siang";
    if (hour >= 15 && hour < 18) return "Sore";
    return "Malam";
  };

  const validateStepOne = () => {
    const { tugas, lokasi, tanggal, jamMulai, jamSelesai } = lemburData;
    if (!tugas || !lokasi || !tanggal || !jamMulai || !jamSelesai) {
      Swal.fire("Form belum lengkap", "Mohon lengkapi semua isian", "error");
      return false; 
    }
    return true;
  };

  const handleSubmitStepOne = (e) => {
    e.preventDefault();
    if (!validateStepOne()) return;
    setStep("stepTwo");
  };

  const handleSubmitStepTwo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
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

      const result = await response.json();
      if (result.success) {
        Swal.fire("Pengajuan Berhasil!", result.message || "Data berhasil dikirim tunggu persetujuan Tim HRD dan Kadiv", "success");
        setIsSuccess(true);
      } else {
        Swal.fire("Permohonan Ditolak!", result.message || "Terjadi kesalahan", "warning");
      }
    } catch {
      Swal.fire("Gagal Mengirim", "Periksa koneksi internet Anda", "error");
    } finally {
      setLoading(false);
    }
  };

  const FormInput = ({ label, ...props }) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input {...props} className="w-full p-2 text-lg border-2 rounded-lg" />
    </div>
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("userName");
    const nama = localStorage.getItem("nama"); // ambil nama dari localStorage
    if (userId) {
      setLemburData(data => ({ ...data, userId, username, nama }));
    }
    fetchLocations();
  }, []);
  

  const renderStepOne = () => (
    <MobileLayout title="Formulir Lembur">
      <form onSubmit={handleSubmitStepOne} className="space-y-4 p-4">
        <FormInput label="Tanggal" type="date" value={lemburData.tanggal} onChange={(e) => setLemburData(d => ({ ...d, tanggal: e.target.value }))}/>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Lokasi</label>
          <select value={lemburData.lokasi} onChange={(e) => {
              const lokasi = e.target.value;
              const nama_lokasi = locations.find(l => l.nama === lokasi)?.id || "";
              setLemburData(d => ({ ...d, lokasi, nama_lokasi }));
            }}
            className="w-full p-2 text-lg border-2 rounded-lg text-sm tracking-wider "
          >
            <option value="">Pilih Lokasi</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.nama}>{loc.nama}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Tugas</label>
          <textarea rows="2" value={lemburData.tugas} maxLength={CHAR_LIMIT} onChange={(e) => setLemburData(d => ({ ...d, tugas: e.target.value }))} className="w-full p-2 text-lg border-2 rounded-lg resize-vertical"/>
        </div>
        {["jamMulai", "jamSelesai"].map((key) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              {key === "jamMulai" ? "Jam Mulai" : "Jam Selesai"}
            </label>
            <select  value={lemburData[key] || ""}  onChange={(e) => setLemburData(d => ({ ...d, [key]: e.target.value }))}  className="w-full p-2 text-lg border-2 rounded-lg">
              <option value="">Pilih Jam</option>
              {hours.map(h => (
                <option key={h} value={`${h}:00`}>
                  {`${h}:00`} ({getLabel(h)})
                </option>
              ))}
            </select>
          </div>
        ))}
        <button type="submit" className="w-full py-2 px-4 bg-green-500 text-white rounded-lg font-bold">
          Lihat Detail 
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </button>
      </form>
    </MobileLayout>
  );

  const renderStepTwo = () => (
    <MobileLayout title="Detail Pengajuan Lembur">
      <form onSubmit={handleSubmitStepTwo} className="max-h-screen flex flex-col">
        {/* CARD FULL HEIGHT */}
        <div className="flex flex-col justify-between flex-grow w-full bg-white rounded-none shadow-none border-t p-6 space-y-6">
          {/* HEADER */}
          <div>
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Rangkuman Pengajuan Lembur</h2>
              <p className="text-sm text-gray-500 mt-1">
                Silakan periksa kembali data lembur sebelum dikirim
              </p>
            </div>
            <hr className="border-gray-300" />
            {/* DETAIL */}
            <div className="space-y-4 text-sm md:text-base mt-4">
              <div>
                <p className="text-gray-600 font-medium">Nama Karyawan</p>
                <p className="text-gray-900">{lemburData.nama || "-"}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Lokasi Lembur</p>
                <p className="text-gray-900">{lemburData.lokasi || "-"}</p>
              </div>
  
              <div>
                <p className="text-gray-600 font-medium">Tanggal Lembur</p>
                <p className="text-gray-900">{lemburData.tanggal || "-"}</p>
              </div>
  
              <div className="flex flex-col gap-1">
                <p className="text-gray-600 font-medium">Waktu Lembur</p>
                <p className="text-gray-900">
                  {(lemburData.jamMulai || "-") + " "}
                  <span className="text-sm text-gray-500">({getLabel(lemburData.jamMulai)})</span>
                  {" - "}
                  {(lemburData.jamSelesai || "-") + " "}
                  <span className="text-sm text-gray-500">({getLabel(lemburData.jamSelesai)})</span>
                </p>
              </div>

              <div>
                <p className="text-gray-600 font-medium mb-1">Tugas Lemburan</p>
                <div className="text-gray-900 font-regular">
                  {lemburData.tugas || "-"}
                </div>
              </div>
            </div>
          </div>
  
          {/* FOOTER - BUTTONS */}
          <div className="flex justify-between gap-4 pt-4">
            <button type="button" onClick={() => setStep("stepOne")} className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg font-semibold shadow hover:bg-gray-600 transition">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              KEMBALI
            </button>
            <button type="submit" disabled={loading} className={`w-full py-2 px-4 text-white rounded-lg font-semibold shadow transition ${ loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700" }`}>
              {loading ? "Mengirim..." : "KIRIM"}
              <FontAwesomeIcon icon={faPaperPlane} className="ml-2" />
            </button>
          </div>
        </div>
      </form>
    </MobileLayout>
  );

  return step === "stepOne" ? renderStepOne() : renderStepTwo();
};

export default Lembur;