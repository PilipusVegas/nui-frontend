import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const DetailAbsen = ({ formData = {} }) => {
  const user = getUserFromToken();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    userId = "",
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
    jamSelesai = "",
    koordinatSelesai = "",
    id_shift = "",
    nama = "",
    shift = null,
    tipe_absensi = "",
  } = formData;

  /** Detail grup */
  const detailMulai = [
    { label: "Tanggal Masuk :", value: tanggalMulai },
    { label: "Nama :", value: nama },
    { label: "Shift :", value: shift },
    { label: "Lokasi Masuk :", value: lokasi },
    { label: "Jam Masuk :", value: jamMulai },
    { label: "Keterangan :", value: tugas },
  ].filter((item) => item.value);

  const detailSelesai = [
    { label: "Nama :", value: nama },
    { label: "Shift :", value: shift },
    { label: "Keterangan : ", value: tugas },
    { label: "Jam Selesai :", value: jamSelesai },
    { label: "Lokasi :", value: lokasi },
    { label: "Deskripsi :", value: deskripsi },
  ].filter((item) => item.value);

  /** Helpers */
  const parseCoordinates = (coordinates) => {
    if (!coordinates) return null;
    const [latitude, longitude] = coordinates.split(",").map(parseFloat);
    return { latitude, longitude };
  };

  const blobUrlToFile = async (blobUrl, filename) => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const base64ToFile = (base64, filename) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  /** --- Tambahan: swal konfirmasi identitas --- */
  const handleConfirmAndSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Konfirmasi Akun",
      html: `
      <p class="text-gray-700 text-sm mb-2">
        Apakah Anda benar-benar login sebagai
      </p>
      <p class="font-semibold text-lg text-green-700">
        ${user?.nama_user ?? "User Tidak Diketahui"}
      </p>
      <p class="text-gray-500 text-xs mt-3">
        Pastikan akun ini milik Anda. Jika bukan, silakan kembali ke beranda
        untuk mengganti akun agar data absensi tidak salah tercatat.
      </p>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Itu Saya",
      cancelButtonText: "Bukan Saya",
      reverseButtons: true,
      customClass: {
        confirmButton:
          "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold shadow",
        cancelButton:
          "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold shadow",
        popup: "rounded-2xl p-6",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleSubmit(e); // lanjut kirim absensi
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // 👉 swal kedua: tawarkan logout
        Swal.fire({
          title: "Ganti Akun?",
          text: "Anda memilih 'Bukan Saya'. Apakah ingin keluar dan login dengan akun lain?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ya, Logout",
          cancelButtonText: "Batal",
          reverseButtons: true,
          customClass: {
            confirmButton:
              "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold shadow",
            cancelButton:
              "bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold shadow",
            popup: "rounded-2xl p-6",
          },
        }).then((res) => {
          if (res.isConfirmed) {
            // 🔑 proses logout sederhana
            localStorage.removeItem("token");
            navigate("/login"); // arahkan ke halaman login
          } else {
            navigate("/home"); // jika batal logout tetap ke beranda
          }
        });
      }
    });
  };

  /** Handle Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const formDataToSend = new FormData();
    let endpoint = "";
    let notificationTitle = "";

    try {
      if (id_absen) {
        /** Absen Selesai */
        endpoint = "/absen/selesai";
        notificationTitle = "Absen Selesai Berhasil!";

        formDataToSend.append("id_absen", id_absen);
        if (jamSelesai) formDataToSend.append("jam_selesai", jamSelesai);
        if (fotoSelesai?.startsWith?.("blob:")) {
          const file = await blobUrlToFile(fotoSelesai, "fotoSelesai.jpg");
          formDataToSend.append("foto", file);
        } else if (fotoSelesai instanceof File) {
          formDataToSend.append("foto", fotoSelesai);
        } else if (typeof fotoSelesai === "string" && fotoSelesai.startsWith("data:image")) {
          const file = base64ToFile(fotoSelesai, "fotoSelesai.jpg");
          formDataToSend.append("foto", file);
        }
        if (userId) formDataToSend.append("id_user", String(userId));
        if (id_lokasi) formDataToSend.append("id_lokasi", String(id_lokasi));

        const titikSelesai = parseCoordinates(koordinatSelesai);
        if (titikSelesai) {
          formDataToSend.append("lat", String(titikSelesai.latitude));
          formDataToSend.append("lon", String(titikSelesai.longitude));
        }
      } else {
        endpoint = "/absen/mulai";
        notificationTitle = "Absen Mulai Berhasil!";

        if (userId) formDataToSend.append("id_user", String(userId));
        if (id_shift) formDataToSend.append("id_shift", String(id_shift));
        if (tugas) formDataToSend.append("deskripsi", tugas);
        if (id_lokasi) formDataToSend.append("id_lokasi", String(id_lokasi));
        if (tipe_absensi) formDataToSend.append("tipe_absensi", String(tipe_absensi));

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
        } else if (typeof fotoMulai === "string" && fotoMulai.startsWith("data:image")) {
          const file = base64ToFile(fotoMulai, "fotoMulai.jpg");
          formDataToSend.append("foto", file);
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
        } catch (_) { }
        throw new Error(errorData.message || "Gagal mengirim data");
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
        showCancelButton: true,
        confirmButtonText: "Lihat Riwayat",
        cancelButtonText: "Oke Sip!",
        reverseButtons: true,
        customClass: {
          confirmButton:
            "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm",
          cancelButton:
            "bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold shadow-sm ml-2",
          popup: "rounded-2xl shadow-lg p-6",
          title: "text-lg font-bold text-gray-800",
          htmlContainer: "text-sm text-gray-600 mt-2",
        },
      }).then((result) => {
        navigate(result.isConfirmed ? "/riwayat-pengguna" : "/");
      });
    } catch (error) {
      const message = error.message || "Terjadi kesalahan";
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /** Effects */
  useEffect(() => {
    if (isSuccess) navigate("/");
  }, [isSuccess, navigate]);

  useEffect(() => {
    return () => {
      if (fotoMulai instanceof File) URL.revokeObjectURL(fotoMulai);
      if (fotoSelesai instanceof File) URL.revokeObjectURL(fotoSelesai);
    };
  }, [fotoMulai, fotoSelesai]);

  return (
    <MobileLayout title="Review Detail Absensi" className="min-h-screen bg-gray-50">
      <form onSubmit={handleConfirmAndSubmit} className="flex flex-col justify-between min-h-screen max-w-2xl mx-auto">
        <div className="flex flex-col gap-10 pb-24">
          {/* Absen Mulai */}
          {fotoMulai && (
            <div className="bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-lg transition">
              {/* Isi */}
              <div className="p-6 py-4 space-y-4">
                {/* Foto */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-6 border-b pb-1">
                    Dokumentasi Absen Mulai
                  </p>
                  <div className="flex justify-center">
                    <div className="w-40 h-52 rounded-xl overflow-hidden border bg-gray-100 shadow group">
                      <img
                        src={fotoMulai instanceof File ? URL.createObjectURL(fotoMulai) : fotoMulai}
                        alt="Absen Mulai"
                        className="w-full h-full object-cover transition scale-x-[-1]"
                      />
                    </div>
                  </div>
                </div>

                {/* Detail */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                    Detail Informasi Absen Mulai
                  </p>
                  <div className="flex flex-col divide-y divide-gray-100">
                    {detailMulai.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-xs font-medium text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Absen Selesai */}
          {fotoSelesai && (
            <div className="bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-lg transition">
              {/* Isi */}
              <div className="p-6 py-4 space-y-4">
                {/* Foto */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-6 border-b pb-1">
                    Dokumentasi Absen Selesai
                  </p>
                  <div className="flex justify-center">
                    <div className="w-40 h-52 rounded-xl overflow-hidden border bg-gray-100 shadow group">
                      <img src={fotoSelesai instanceof File ? URL.createObjectURL(fotoSelesai) : fotoSelesai} alt="Absen Selesai" className="w-full h-full object-cover transition scale-x-[-1]" />
                    </div>
                  </div>
                </div>

                {/* Detail */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                    Detail Informasi Absen Selesai
                  </p>
                  <div className="flex flex-col divide-y divide-gray-100">
                    {detailSelesai.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-sm font-medium text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tombol */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button type="submit" disabled={isLoading} className={`w-full py-3 text-base font-semibold rounded-xl shadow-md transition transform active:scale-95 ${isLoading ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"}`}>
            {isLoading ? (
              <span className="flex justify-center items-center">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Mengirim...
              </span>
            ) : (
              "Kirim Absensi"
            )}
          </button>
        </div>
      </form>
    </MobileLayout>
  );
};

DetailAbsen.propTypes = {
  formData: PropTypes.object.isRequired,
};

export default DetailAbsen;
