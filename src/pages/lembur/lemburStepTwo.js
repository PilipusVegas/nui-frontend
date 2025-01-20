import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";

const StepTwo = ({ lemburData = {} }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    userId = "",
    username = "",
    id_lokasi = "",
    lokasi = "",
    tugas = "",
    tanggal = "",
    jamMulai = "",
    jamSelesai = "",
  } = lemburData;
  const dataToSend = {
    id_user: userId,
    tanggal,
    id_lokasi,
    deskripsi: tugas,
    jam_mulai: jamMulai,
    jam_selesai: jamSelesai,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      Swal.fire("Data akan dikirim!", "", "info");
      const response = await fetch(`${apiUrl}/lembur/simpan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        await response.json();
        Swal.fire("Lembur berhasil!", "", "success");
        setIsSuccess(true);
      } else {
        Swal.fire(
          "Gagal Menyimpan Data",
          "Terjadi kesalahan, Silahkan coba lagi" || "Terjadi kesalahan",
          "error"
        );
      }
    } catch (error) {
      Swal.fire(
        "Gagal Menyimpan Data",
        "Cek koneksi internet anda, Silahkan coba lagi" || "Terjadi kesalahan",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const summaryItems = [
    { label: "Nama", value: username },
    { label: "Lokasi", value: lokasi },
    { label: "Tanggal", value: tanggal },
    { label: "Jam Mulai", value: jamMulai },
    { label: "Jam Selesai", value: jamSelesai },
    { label: "Deskripsi", value: tugas },
  ].filter((item) => item.value);

  useEffect(() => {
    if (isSuccess) navigate("/");
  }, [isSuccess, navigate]);

  return (
    <MobileLayout
      title="LEMBUR"
      className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm"
    >
      <div className="flex flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl p-5 bg-white border border-gray-300 rounded-lg"
        >
          <h3 className="text-2xl font-semibold mb-4 text-center">
            Detail Lembur
          </h3>
          <div className="p-3">
            {summaryItems.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-justify py-2">
                  <strong className="text-sm font-semibold pr-3 text-justify">
                    {item.label}:{" "}
                  </strong>
                  <span className="text-gray-700 text-sm break-words">
                    {item.value}
                  </span>
                </div>
                {index < summaryItems.length - 1 && (
                  <hr className="border-gray-300" />
                )}
              </div>
            ))}
          </div>
          <button
            type="submit"
            className={`w-full py-2 mt-3 text-lg font-semibold text-white rounded-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={loading}
          >
            {loading ? "Mengirim..." : "KIRIM"}
          </button>
        </form>
      </div>
    </MobileLayout>
  );
};

StepTwo.propTypes = {
  lemburData: PropTypes.object.isRequired,
};

export default StepTwo;
