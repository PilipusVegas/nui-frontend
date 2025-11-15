import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";
import Select from "react-select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0") + ":00");

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
  const dropdownRef = useRef(null);

  const user = getUserFromToken();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  // Fetch lokasi & set user
  useEffect(() => {
    const userId = user.id_user;
    const username = user.nama_user;
    if (userId) setLemburData(d => ({ ...d, userId, username }));
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/lokasi`);
      const data = await res.json();
      if (res.ok) setLocations(data.data);
    } catch (err) {
      console.error("Lokasi Error", err);
    }
  };

  useEffect(() => {
    if (isSuccess) navigate("/riwayat-pengguna");
  }, [isSuccess]);

  const getLabel = (time) => {
    const hour = Number(time.split(":")[0]);
    if (hour >= 5 && hour < 10) return "Pagi";
    if (hour >= 10 && hour < 15) return "Siang";
    if (hour >= 15 && hour < 18) return "Sore";
    return "Malam";
  };

  const validateStepOne = () => {
    const emptyFields = [];
    if (!lemburData.tugas) emptyFields.push("Keterangan Lembur");
    if (!lemburData.lokasi) emptyFields.push("Lokasi Lembur");
    if (!lemburData.tanggal) emptyFields.push("Tanggal Lembur");
    if (!lemburData.jamMulai) emptyFields.push("Jam Mulai");
    if (!lemburData.jamSelesai) emptyFields.push("Jam Selesai");

    if (emptyFields.length > 0) {
      toast.error(`Harap lengkapi: ${emptyFields.join(", ")}`);
      return false;
    }
    if (lemburData.jamMulai === lemburData.jamSelesai) {
      toast.error("Jam Mulai dan Jam Selesai tidak boleh sama!");
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
      const response = await fetchWithJwt(`${apiUrl}/lembur/simpan`, {
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
        Swal.fire({
          title: "Pengajuan Berhasil",
          html: `
          <p class="text-gray-700 text-sm">
            Pengajuan lembur Anda telah berhasil disimpan.<br/>
            Anda dapat kembali ke beranda atau langsung melihat riwayat.
          </p>
        `,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Oke Sip",
          cancelButtonText: "Lihat Riwayat",
          reverseButtons: true,
          customClass: {
            confirmButton: "bg-green-600 text-white px-4 py-2 rounded font-semibold",
            cancelButton: "bg-blue-600 text-white px-4 py-2 rounded font-semibold ml-2",
          },
        }).then((res) => {
          if (res.isConfirmed) {
            navigate("/");
          } else if (res.dismiss === Swal.DismissReason.cancel) {
            navigate("/riwayat-pengguna");
          }
        });
      } else {
        toast.error(result.message || "Terjadi kesalahan saat pengiriman.");
      }
    } catch {
      toast.error("Gagal mengirim. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  };


  const hourOptions = hours.map(h => ({ value: h, label: `${h} (${getLabel(h)})` }));

  const renderStepOne = () => (
    <MobileLayout title="Formulir Lembur">
      <div className="relative pb-20">
        <form onSubmit={handleSubmitStepOne} className="space-y-2 p-2">
          <div className="mb-2">
            <label className="block text-sm font-semibold">Tanggal Lembur</label>
            <p className="text-[10px] text-gray-500 mb-2">Tentukan tanggal pelaksanaan lembur anda.</p>
            <input type="date" value={lemburData.tanggal} onChange={(e) => setLemburData(d => ({ ...d, tanggal: e.target.value }))} className="w-full p-2 border-2 rounded-md text-sm" />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-semibold">Jam Mulai</label>
            <p className="text-[10px] text-gray-500 mb-2">Pilih jam dimulainya lembur.</p>
            <Select options={hourOptions.filter(o => o.value !== lemburData.jamSelesai)} value={hourOptions.find(o => o.value === lemburData.jamMulai)} onChange={(option) => setLemburData(d => ({ ...d, jamMulai: option.value }))} placeholder="Pilih jam mulai..." className="text-sm" />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-semibold">Jam Selesai</label>
            <p className="text-[10px] text-gray-500 mb-2">
              Pilih jam berakhir lembur, tidak boleh sama dengan jam mulai.
              <strong> Jika lembur selesai pukul 09:30, maka pilihlah jam 09:00 sebagai batas akhir (dibulatkan ke bawah).</strong>
            </p>
            <Select options={hourOptions.filter(o => o.value !== lemburData.jamMulai)} value={hourOptions.find(o => o.value === lemburData.jamSelesai)} onChange={(option) => setLemburData(d => ({ ...d, jamSelesai: option.value }))} placeholder="Pilih jam selesai..." className="text-sm" />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-semibold">Lokasi Lembur</label>
            <p className="text-[10px] text-gray-500 mb-2">Pilih lokasi lembur. Anda bisa mencari lokasi dengan mengetik nama.</p>
            <Select options={locations.map(loc => ({ value: loc.id, label: loc.nama }))} value={locations.find(loc => loc.id === lemburData.nama_lokasi) ? { value: lemburData.nama_lokasi, label: lemburData.lokasi } : null} onChange={(option) => setLemburData(d => ({ ...d, nama_lokasi: option.value, lokasi: option.label }))} placeholder="Pilih lokasi..." isSearchable className="text-sm" />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-semibold">Keterangan Lembur</label>
            <p className="text-[10px] text-gray-500 mb-2">Ringkasan tugas lembur (maks. 250 karakter).</p>
            <textarea rows="2" value={lemburData.tugas} maxLength={250} onChange={(e) => setLemburData(d => ({ ...d, tugas: e.target.value }))} className="w-full p-2 border-2 rounded-md text-sm resize-vertical" />
          </div>
        </form>

        {/* Footer Button Fixed */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t shadow-md">
          <button type="button" onClick={handleSubmitStepOne} className="w-full py-3 bg-green-500 text-white rounded-lg font-bold flex justify-center items-center gap-2">
            Lihat Detail
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </MobileLayout>
  );

  const renderStepTwo = () => (
    <MobileLayout title="Detail Pengajuan">
      <form onSubmit={handleSubmitStepTwo} className="flex flex-col">
        <div className="flex-1 py-2 space-y-2 pb-20">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Yuk, Cek Lagi Data Kamu
            </h2>
            <p className="text-sm text-gray-700">
              Pastikan semua informasi sudah tepat sebelum kamu menekan tombol kirim.
            </p>
          </div>

          {/* Kartu Data */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-dashed divide-gray-200">
            {/* Item Data */}
            <div className="px-5 py-3 space-y-1">
              <p className="text-gray-900 text-sm font-medium">Nama Karyawan</p>
              <p className="text-gray-800 font-regular text-sm">
                {user.nama_user || "Belum diisi"}
              </p>
            </div>

            <div className="px-5 py-3 space-y-1">
              <p className="text-gray-900 text-sm font-medium">Lokasi Lembur</p>
              <p className="text-gray-800 font-regular text-sm">
                {lemburData.lokasi || "Belum diisi"}
              </p>
            </div>

            <div className="px-5 py-3 space-y-1">
              <p className="text-gray-900 text-sm font-medium">Tanggal Lembur</p>
              <p className="text-gray-800 font-regular text-sm">
                {lemburData.tanggal || "Belum diisi"}
              </p>
            </div>

            <div className="px-5 py-3 space-y-1">
              <p className="text-gray-900 text-sm font-medium">Waktu Lembur</p>
              <p className="text-gray-800 font-regular text-sm">
                {lemburData.jamMulai || "—"} ({getLabel(lemburData.jamMulai)}) –{" "}
                {lemburData.jamSelesai || "—"} ({getLabel(lemburData.jamSelesai)})
              </p>
            </div>

            <div className="px-5 py-3 space-y-1">
              <p className="text-gray-900 text-sm font-medium">Keterangan Lembur</p>
              <p className="text-gray-800 font-regular text-sm">
                {lemburData.tugas || "Belum diisi"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-5 py-4 flex gap-4 shadow-md">
          <button type="button" onClick={() => setStep("stepOne")} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold shadow-sm hover:bg-red-700 transition">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Perbaiki
          </button>
          <button type="submit" disabled={loading} className={`flex-1 py-3 text-white rounded-xl font-semibold shadow-sm transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
            {loading ? "Mengirim..." : "Kirim Sekarang"}
            <FontAwesomeIcon icon={faPaperPlane} className="ml-2" />
          </button>
        </div>
      </form>
    </MobileLayout>
  );

  return step === "stepOne" ? renderStepOne() : renderStepTwo();
};

export default Lembur;
