import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const StepThree = ({ formData = {} }) => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    userId = "",
    username = "",
    id_lokasi = "",
    lokasi = "",
    tugas = "",
    deskripsi = "",
    jamMulai = null,
    tanggalMulai = "",
    koordinatMulai = "",
    fotoMulai = "",
    id_absen = "",
    fotoSelesai = "",
    tanggalSelesai = "",
    jamSelesai = "",
    koordinatSelesai = "",
    id_shift = "",
    nama = "",
    shift = null,
  } = formData;

  const summaryItems = [
    { label: "Nama", value: username },
    { label: "Shift", value: shift || nama || "-" },
    { label: "Lokasi", value: lokasi },
    { label: "Tugas", value: tugas },
    { label: "Deskripsi", value: deskripsi },
    { label: "Tanggal Mulai", value: tanggalMulai },
    { label: "Jam Mulai", value: jamMulai },
    { label: "Tanggal Selesai", value: tanggalSelesai },
    { label: "Jam Selesai", value: jamSelesai },
  ].filter((item) => item.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const formDataToSend = new FormData();
    if (fotoMulai && fotoMulai.startsWith("blob:")) {
      const response = await fetch(fotoMulai);
      const blob = await response.blob();
      const file = new File([blob], "fotoMulai.jpg", { type: blob.type });
      formDataToSend.append("foto", file);
    }

    const parseCoordinates = (coordinates) => {
      if (!coordinates) return null;
      const [latitude, longitude] = coordinates.split(",").map(parseFloat);
      return { latitude, longitude };
    };

    const titikKoordinatMulai = parseCoordinates(koordinatMulai);
    const titikKoordinatSelesai = parseCoordinates(koordinatSelesai);
    let endpoint;
    let notificationTitle;

    if (id_absen) {
      endpoint = "/absen/selesai";
      notificationTitle = "Absen Selesai Berhasil!";
      formDataToSend.append("id_absen", id_absen);
      if (fotoSelesai && fotoSelesai.startsWith("blob:")) {
        const response = await fetch(fotoSelesai);
        const blob = await response.blob();
        const file = new File([blob], "fotoSelesai.jpg", { type: blob.type });
        formDataToSend.append("foto", file);
      }
      if (userId) formDataToSend.append("id_user", userId.toString());
      if (titikKoordinatSelesai) {
        formDataToSend.append("lat", titikKoordinatSelesai.latitude.toString());
        formDataToSend.append("lon",titikKoordinatSelesai.longitude.toString());
      }
    } else {
      endpoint = "/absen/mulai";
      notificationTitle = "Absen Mulai Berhasil!";
      if (userId) formDataToSend.append("id_user", userId.toString());
      if (id_shift) formDataToSend.append("id_shift", id_shift.toString());
      if (tugas) formDataToSend.append("deskripsi", tugas);
      if (id_lokasi) formDataToSend.append("id_lokasi", id_lokasi);
      if (titikKoordinatMulai) {
        formDataToSend.append("lat", titikKoordinatMulai.latitude.toString());
        formDataToSend.append("lon", titikKoordinatMulai.longitude.toString());
      }
      if (!formDataToSend.has("foto") && fotoMulai instanceof File) {
        formDataToSend.append("foto", fotoMulai);
      }
    }
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        body: formDataToSend,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengirim data");
      }
      setIsSuccess(true);
      const currentTime = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }).format(new Date());

      Swal.fire({
        title: notificationTitle,
        text: currentTime,
        icon: "success",
      });
    } catch (error) {
      console.error("Error details:", error);
      Swal.fire({
        title: "Gagal Menyimpan Data",
        text: "Terjadi kesalahan saat menyimpan data. Silakan cek koneksi internet Anda dan coba lagi.",
        icon: "error",
        confirmButtonText: "Coba lagi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/");
    }
  }, [isSuccess, navigate]);

  return (
    <MobileLayout title="Konfirmasi Absensi" className="p-4">
      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-3 rounded-xl shadow border space-y-4">

          {/* Foto Mulai */}
          {fotoMulai && (
            <div>
              <img src={fotoMulai} alt="Foto Mulai" className="w-full aspect-5/5 object-cover rounded-lg border -scale-x-100"/>
            </div>
          )}
  
          {/* Foto Selesai */}
          {fotoSelesai && (
            <div>
              <img src={fotoSelesai} alt="Foto Selesai" className="w-full aspect-5/5 object-cover rounded-lg border -scale-x-100"/>
            </div>
          )}
  
          {/* Ringkasan */}
          <div className="border rounded-lg px-3 py-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Detail Absensi</h3>
            <div className="divide-y text-xs text-gray-800">
              {summaryItems.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 my-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-right max-w-[55%] break-words">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
  
          {/* Tombol Submit */}
          <button type="submit" className={`w-full py-2.5 text-sm font-semibold rounded-md transition-all ${
              isLoading
                ? "bg-green-300 text-white cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex justify-center items-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Mengirim...
              </span>
            ) : (
              "Kirim Absensi"
            )}
          </button>
        </form>
      </div>
    </MobileLayout>
  );
  
};

StepThree.propTypes = {
  formData: PropTypes.object.isRequired,
};

export default StepThree;
