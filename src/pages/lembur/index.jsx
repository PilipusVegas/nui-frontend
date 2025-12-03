import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faInfoCircle, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";
import Select from "react-select";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import { format } from "date-fns";

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0") + ":00");

const Lembur = () => {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [openInfo, setOpenInfo] = useState(false);
  const [lemburData, setLemburData] = useState({ userId: "", username: "", tugas: "", lokasi: "", nama_lokasi: "", tanggal: "", jamMulai: "", jamSelesai: "", });
  const user = getUserFromToken();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

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

  const hourOptions = hours.map(h => ({ value: h, label: h }));

  const validateForm = () => {
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

  const showConfirmLembur = async () => {
    const timeStartLabel = getTimeLabel(lemburData.jamMulai);
    const timeEndLabel = getTimeLabel(lemburData.jamSelesai);

    return Swal.fire({
      title: "<strong>Konfirmasi Pengajuan Lembur</strong>",
      html: `
      <div style="
        text-align:left;
        font-size:13px;
        line-height:1.55;
        color:#374151;
      ">

        <div style="margin-bottom:12px;">
          <div style="font-weight:600; margin-bottom:2px;">Tanggal</div>
          <div>${formatFullDate(lemburData.tanggal)}</div>
        </div>

        <div style="margin-bottom:12px;">
          <div style="font-weight:600; margin-bottom:2px;">Waktu</div>
          <div>
            Mulai: ${lemburData.jamMulai} (${timeStartLabel}) <br/>
            Selesai: ${lemburData.jamSelesai} (${timeEndLabel})
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <div style="font-weight:600; margin-bottom:2px;">Lokasi</div>
          <div>${lemburData.lokasi}</div>
        </div>

        <div style="margin-bottom:18px;">
          <div style="font-weight:600; margin-bottom:2px;">Tugas</div>
          <div>“${lemburData.tugas}”</div>
        </div>

      </div>
    `,

      icon: "question",

      showCancelButton: true,
      confirmButtonText: "Kirim Pengajuan",
      cancelButtonText: "Periksa Lagi",

      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#9ca3af",
      reverseButtons: true,
    });
  };





  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const confirm = await showConfirmLembur();
    if (!confirm.isConfirmed) return;

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
        toast.success("Pengajuan lembur berhasil!");
        navigate("/riwayat-pengguna");
      } else {
        toast.error(result.message || "Terjadi kesalahan saat pengiriman.");
      }
    } catch {
      toast.error("Gagal mengirim. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  };

  const getTimeLabel = (time) => {
    if (!time) return "";
    const hour = parseInt(time.split(":")[0], 10);

    if (hour >= 4 && hour < 11) return "Pagi";
    if (hour >= 11 && hour < 15) return "Siang";
    if (hour >= 15 && hour < 19) return "Sore";
    return "Malam";
  };

  return (
    <MobileLayout title="Formulir Lembur">
      <div className="space-y-3 p-2 pb-28">
        <div className="border border-blue-400 rounded-md bg-blue-50">
          <div className="flex items-center gap-2 p-3 cursor-pointer" onClick={() => setOpenInfo(prev => !prev)}>
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 text-md " />
            <p className="text-[14px] text-blue-900 font-semibold">
              Petunjuk Pengajuan Lembur
            </p>
            <FontAwesomeIcon icon={openInfo ? faChevronUp : faChevronDown} className="ml-auto text-blue-600 text-md" />
          </div>

          {openInfo && (
            <div className="px-3 pb-3 text-[13px] text-blue-900 leading-relaxed space-y-2">
              <ul className="list-disc ml-9 space-y-1.5">
                <li>Pastikan seluruh data sudah benar sebelum mengirim.</li>
                <li>Jam <b>Mulai</b> dan <b>Selesai</b> tidak boleh sama.</li>
                <li>Setelah submit, data otomatis masuk ke <b>Riwayat Lembur</b>.</li>
                <li>
                  Jika menit tidak pas (misalnya <b>09:10</b> atau <b>09:40</b>), pilih
                  jam bulat sebelumnya. Contoh: lewat 09 → gunakan <b>09:00</b>.
                </li>
                <li>
                  Lembur pagi dan lembur setelah jam pulang dapat diajukan,
                  namun gunakan jam yang sesuai:
                  <br />
                  • <b>Lembur pagi</b> → diisi pada jam sebelum mulai kerja.<br />
                  • <b>Lembur setelah pulang</b> → diisi pada jam setelah pekerjaan selesai.
                </li>
                <li>
                  Hindari mengisi jam lembur yang sama atau bertabrakan dengan pengajuan lain.
                  Selalu cek <b>Riwayat Lembur</b> sebelum membuat permohonan baru.
                </li>
              </ul>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Tanggal Lembur</label>
            <input type="date" value={lemburData.tanggal} onChange={(e) => setLemburData(d => ({ ...d, tanggal: e.target.value }))} className="w-full p-1.5 border-2 border-gray-200 rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Jam Mulai</label>
            <Select options={hourOptions.filter(o => o.value !== lemburData.jamSelesai)} value={hourOptions.find(o => o.value === lemburData.jamMulai)} onChange={(option) => setLemburData(d => ({ ...d, jamMulai: option.value }))}
              formatOptionLabel={(option) => (
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  <span className="text-[11px] text-gray-500">{getTimeLabel(option.value)}</span>
                </div>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Jam Selesai</label>
            <Select options={hourOptions.filter(o => o.value !== lemburData.jamMulai)} value={hourOptions.find(o => o.value === lemburData.jamSelesai)} onChange={(option) => setLemburData(d => ({ ...d, jamSelesai: option.value }))}
              formatOptionLabel={(option) => (
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  <span className="text-[11px] text-gray-500">{getTimeLabel(option.value)}</span>
                </div>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Lokasi Lembur</label>
            <Select options={locations.map(loc => ({ value: loc.id, label: loc.nama }))} value={locations.find(loc => loc.id === lemburData.nama_lokasi) ? { value: lemburData.nama_lokasi, label: lemburData.lokasi } : null} onChange={(option) => setLemburData(d => ({ ...d, nama_lokasi: option.value, lokasi: option.label }))} placeholder="Pilih lokasi..." isSearchable />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Keterangan Lembur</label>
            <textarea rows="3" value={lemburData.tugas} maxLength={250} onChange={(e) => setLemburData(d => ({ ...d, tugas: e.target.value }))} className="w-full p-2 border-2 border-gray-200 rounded" />
          </div>
          <div className="fixed bottom-0 left-0 w-full bg-white p-3 border-t shadow-lg">
            <button onClick={handleSubmit} disabled={loading} className={`w-full py-3 text-white rounded font-semibold ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
              {loading ? "Mengirim..." : "Kirim"}
              <FontAwesomeIcon icon={faPaperPlane} className="ml-2" />
            </button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
};

export default Lembur;
