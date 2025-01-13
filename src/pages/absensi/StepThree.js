import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";

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
  } = formData;

  const summaryItems = [
    { label: "Nama", value: username },
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
        formDataToSend.append("lon", titikKoordinatSelesai.longitude.toString());
      }
    } else {
      endpoint = "/absen/mulai";
      notificationTitle = "Absen Mulai Berhasil!";

      if (userId) formDataToSend.append("id_user", userId.toString());
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
      const response = await fetch(`${apiUrl}${endpoint}`, { method: "POST", body: formDataToSend });

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
        title: "Formulir ditolak",
        text: error.message,
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
    <MobileLayout title="Konfirmasi Absensi" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full max-w-xl p-4 border-2 rounded-lg bg-gray-50">
          {fotoMulai && (
            <div className="w-full mb-4 flex justify-center">
              <img src={fotoMulai} alt="Foto Mulai" className="w-full h-[50vh] object-cover rounded-lg" />
            </div>
          )}
          {fotoSelesai && (
            <div className="w-full mb-4 flex justify-center">
              <img src={fotoSelesai} alt="Foto Selesai" className="w-full h-[50vh] object-cover rounded-lg" />
            </div>
          )}
          <div className="px-4 py-2 bg-white border rounded-lg">
            {summaryItems.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between py-2">
                  <strong className="text-base font-bold">{item.label}:</strong>
                  <span className="text-sm text-gray-800">{item.value}</span>
                </div>
                {index < summaryItems.length - 1 && <hr className="border-gray-300" />}
              </div>
            ))}
          </div>
          <button
            type="submit"
            className={`w-full mt-6 py-2 text-lg font-bold text-white rounded-lg ${
              isLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Mengirim...
              </span>
            ) : (
              "Kirim"
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
