import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";

const StepThree = ({ formData = {} }) => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { userId = "", username = "", id_lokasi = "", lokasi = "", tugas = "", deskripsi = "", jamMulai = null, tanggalMulai = "", koordinatMulai = "", fotoMulai = "", id_absen = "", fotoSelesai = "", tanggalSelesai = "", jamSelesai = "", koordinatSelesai = "", id_shift = "", nama = "", shift = null,} = formData;
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

  const parseCoordinates = (coordinates) => {
    if (!coordinates) return null;
    const [latitude, longitude] = coordinates.split(",").map(parseFloat);
    return { latitude, longitude };
  };

  const blobUrlToFile = async (blobUrl, filename) => {
    const response = await fetch(blobUrl); // jangan pakai fetchWithJwt!
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const formDataToSend = new FormData();
    let endpoint = "";
    let notificationTitle = "";
  
    try {
      if (id_absen) {
        endpoint = "/absen/selesai";
        notificationTitle = "Absen Selesai Berhasil!";
        formDataToSend.append("id_absen", id_absen);
        if (fotoSelesai?.startsWith?.("blob:")) {
          const file = await blobUrlToFile(fotoSelesai, "fotoSelesai.jpg");
          formDataToSend.append("foto", file);
        } else if (fotoSelesai instanceof File) {
          formDataToSend.append("foto", fotoSelesai);
        }
        if (userId) formDataToSend.append("id_user", userId.toString());
  
        const titikSelesai = parseCoordinates(koordinatSelesai);
        if (titikSelesai) {
          formDataToSend.append("lat", titikSelesai.latitude.toString());
          formDataToSend.append("lon", titikSelesai.longitude.toString());
        }
  
      } else {
        endpoint = "/absen/mulai";
        notificationTitle = "Absen Mulai Berhasil!";
  
        if (userId) formDataToSend.append("id_user", String(userId));
        if (id_shift) formDataToSend.append("id_shift", String(id_shift));
        if (tugas) formDataToSend.append("deskripsi", tugas);
        if (id_lokasi) formDataToSend.append("id_lokasi", String(id_lokasi));
  
        const titikMulai = parseCoordinates(koordinatMulai);
        if (titikMulai) {
          formDataToSend.append("lat", String(titikMulai.latitude));
          formDataToSend.append("lon", String(titikMulai.longitude));
        }
  
        if (fotoMulai?.startsWith?.("blob:")) {
          const file = await blobUrlToFile(fotoMulai, "fotoMulai.jpg");
          formDataToSend.append("foto", file);
        } else if (fotoMulai instanceof File) {
          formDataToSend.append("foto", fotoMulai);
        }
      }
  
      const response = await fetchWithJwt(`${apiUrl}${endpoint}`, {
        method: "POST",
        body: formDataToSend,
      });
  
      if (!response.ok) {
        let errorData = { message: "Gagal mengirim data" };
        try {
          errorData = await response.json();
        } catch (_) {}
      
        const error = new Error(errorData.message || "Gagal mengirim data");
        error.code = errorData.code || errorData.reason || null;
        throw error;
      }
  
      setIsSuccess(true);
  
      Swal.fire({
        title: notificationTitle,
        text: new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        }).format(new Date()),
        icon: "success",
      });
  
    } catch (error) {
      const message = error.message || "Terjadi kesalahan";
      const code = error.code;
    
      if (code === "TASK_NOT_COMPLETED") {
        Swal.fire({
          icon: "warning",
          title: "Belum Bisa Absen Pulang",
          text: message,
        });
      } else if (code === "SUNDAY_BLOCK") {
        Swal.fire({
          icon: "info",
          title: "Absen Tidak Diizinkan",
          text: message,
          showCancelButton: true,
          confirmButtonText: "Ajukan Lembur",
          cancelButtonText: "Batal",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/lembur");
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Kesalahan",
          text: message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/");
    }
  }, [isSuccess, navigate]);

  useEffect(() => {
    return () => {
      if (fotoMulai instanceof File) URL.revokeObjectURL(fotoMulai);
      if (fotoSelesai instanceof File) URL.revokeObjectURL(fotoSelesai);
    };
  }, [fotoMulai, fotoSelesai]);

  return (
    <MobileLayout title="Konfirmasi Absensi" className="p-4">
      <div className="flex flex-col items-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-3 rounded-xl shadow border space-y-4">
          {fotoMulai && (
            <img src={fotoMulai instanceof File ? URL.createObjectURL(fotoMulai) : fotoMulai} alt="Foto Mulai" className="w-full aspect-5/5 object-cover rounded-lg border -scale-x-100"/>
          )}
          {fotoSelesai && (
            <img src={fotoSelesai instanceof File ? URL.createObjectURL(fotoSelesai) : fotoSelesai} alt="Foto Selesai" className="w-full aspect-5/5 object-cover rounded-lg border -scale-x-100"/>
          )}

          <div className="border rounded-lg px-3 py-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Detail Absensi</h3>
            <div className="divide-y text-xs text-gray-800">
              {summaryItems.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 my-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-right max-w-[55%] break-words">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className={`w-full py-2.5 text-sm font-semibold rounded-md transition-all ${isLoading ? "bg-green-300 text-white cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}`} disabled={isLoading}>
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
